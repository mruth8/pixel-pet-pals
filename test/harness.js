// Test harness: free ports (env overrides win) and a headless Chrome that is ALWAYS cleaned up
// (normal exit, process.exit, uncaught errors, SIGINT/SIGTERM/SIGHUP). Chrome gets its own
// --user-data-dir (ppp-test-chrome-*) and runs in its own process group, which is killed as a whole.
const net = require("net"), os = require("os"), fs = require("fs"), path = require("path"), { spawn } = require("child_process");
const cleanups = [];
function freePort() { return new Promise((res, rej) => { const s = net.createServer(); s.unref(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); }); }
async function port(envName) { const v = +process.env[envName]; return v > 0 ? v : freePort(); }
function onCleanup(fn) { cleanups.push(fn); }
let cleaned = false;
function cleanup() { if (cleaned) return; cleaned = true; for (const fn of cleanups.reverse()) { try { fn(); } catch {} } }
process.on("exit", cleanup);
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => { cleanup(); process.exit(130); });
process.on("uncaughtException", e => { console.error("FAIL uncaught:", e && e.stack || e); cleanup(); process.exit(1); });
process.on("unhandledRejection", e => { console.error("FAIL unhandled:", e && e.stack || e); cleanup(); process.exit(1); });
// Spawn a child (e.g. the relay) that is killed on cleanup.
function child(cmd, args, opts) { const p = spawn(cmd, args, opts); onCleanup(() => p.kill()); return p; }
async function launchChrome({ envPort = "CHROME_DEBUG_PORT", width = 1100, height = 900 } = {}) {
  if (!swept && !process.env.NO_CHROME_SWEEP) { swept = true; try { sweepStaleChromes(); } catch {} }
  const dport = await port(envPort), dir = fs.mkdtempSync(path.join(os.tmpdir(), "ppp-test-chrome-"));
  const p = spawn("google-chrome", ["--headless=new", "--no-sandbox", `--remote-debugging-port=${dport}`, `--user-data-dir=${dir}`,
    `--window-size=${width},${height}`, "about:blank"], { detached: true, stdio: "ignore" });
  onCleanup(() => { try { process.kill(-p.pid, "SIGKILL"); } catch {} try { fs.rmSync(dir, { recursive: true, force: true }); } catch {} });
  let t; for (let i = 0; i < 100 && !t; i++) { await new Promise(r => setTimeout(r, 100)); try { t = (await (await fetch(`http://127.0.0.1:${dport}/json`)).json()).find(x => x.type === "page"); } catch {} }
  if (!t) throw new Error("Chrome did not start on port " + dport);
  return { debugPort: dport, wsUrl: t.webSocketDebuggerUrl, pid: p.pid };
}
// Startup sweep: kill stale headless Chromes left by earlier test runs (e.g. after SIGKILL). Only processes whose
// command line carries our markers are considered: our temp profile (--user-data-dir=<tmp>/ppp-test-chrome-*) or the
// legacy test flags (--headless + --remote-debugging-port=19222/19223 + --window-size=1100,900 + about:blank).
// A marked process is spared while any ancestor is a live node process running one of our test/ scripts.
// Matching is done on argv (from /proc/<pid>/cmdline split on NUL), never on a joined string.
const TMP = fs.realpathSync(os.tmpdir());
const hasHeadless = argv => argv.some(x => x === "--headless" || x.startsWith("--headless="));
// Our temp profile: --user-data-dir=<tmpdir>/ppp-test-chrome-* (directly inside tmpdir), with --headless. Returns the dir or null.
function ourProfile(argv) {
  if (!hasHeadless(argv)) return null;
  for (const x of argv) {
    if (!x.startsWith("--user-data-dir=")) continue;
    const d = x.slice("--user-data-dir=".length);
    if (path.isAbsolute(d) && path.basename(d).startsWith("ppp-test-chrome-") && [os.tmpdir(), TMP].includes(path.dirname(path.normalize(d)))) return d;
  }
  return null;
}
// Legacy test flags, each an exact separate argument.
const isLegacy = argv => hasHeadless(argv) && (argv.includes("--remote-debugging-port=19222") || argv.includes("--remote-debugging-port=19223"))
  && argv.includes("--window-size=1100,900") && argv.includes("about:blank");
function isOurs(argv) { return !!(argv.length && /chrom/i.test(path.basename(argv[0])) && (ourProfile(argv) || isLegacy(argv))); }
// Delete only that exact dir: it must be a real directory (lstat, so no symlink — not even to a sibling
// ppp-test-chrome-* folder), sitting directly inside tmpdir with our prefix after realpath.
function removeProfile(d) {
  try {
    const st = fs.lstatSync(d);
    if (!st.isDirectory() || st.isSymbolicLink()) return false;
    const real = fs.realpathSync(d);
    if (path.dirname(real) !== TMP || !path.basename(real).startsWith("ppp-test-chrome-") || path.basename(real) !== path.basename(d)) return false;
    fs.rmSync(real, { recursive: true, force: true }); return true;
  } catch { return false; }
}
// All /proc access goes through this object (tests inject a mock). Every read returns null on any error (ENOENT = exited).
const procSys = {
  myUid: () => process.getuid(),
  pids: () => { try { return fs.readdirSync("/proc").filter(d => /^\d+$/.test(d)).map(Number); } catch { return []; } },
  cmdline: pid => { try { return fs.readFileSync(`/proc/${pid}/cmdline`, "utf8"); } catch { return null; } },
  stat: pid => { try { const r = fs.readFileSync(`/proc/${pid}/stat`, "utf8"), f = r.slice(r.lastIndexOf(")") + 2).split(" ");
    return { state: f[0], ppid: +f[1], start: f[19] }; } catch { return null; } },   // f[19] = field 22 (starttime)
  uid: pid => { try { const m = fs.readFileSync(`/proc/${pid}/status`, "utf8").match(/^Uid:\s+(\d+)/m); return m ? +m[1] : null; } catch { return null; } },
  kill: (pid, sig) => process.kill(pid, sig),
  sleep: ms => { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch {} },
  log: m => console.error(m),
};
const argvOf = raw => { const a = raw.split("\0"); if (a[a.length - 1] === "") a.pop(); return a; };
// Snapshot of processes owned by our uid: pid -> { raw cmdline, argv, ppid, start }.
function procs(sys = procSys) {
  const out = new Map(), me = sys.myUid();
  for (const pid of sys.pids()) {
    try { if (sys.uid(pid) !== me) continue;
      const raw = sys.cmdline(pid), st = sys.stat(pid); if (raw == null || !st) continue;
      out.set(pid, { raw, argv: argvOf(raw), ppid: st.ppid, start: st.start }); } catch {}
  }
  return out;
}
// Same process as recorded? (same uid, start time and cmdline). Anything unreadable => no.
function samePs(sys, pid, rec) {
  try { const st = sys.stat(pid); return !!st && st.start === rec.start && sys.cmdline(pid) === rec.raw && sys.uid(pid) === sys.myUid(); } catch { return false; }
}
function aliveAs(sys, pid, rec) { try { const st = sys.stat(pid); return !!st && st.state !== "Z" && st.start === rec.start; } catch { return false; } }
// Never throws. Returns { targets, killed, skipped, failed, removed, kept }.
function sweepStaleChromes({ dryRun = false, sys = procSys, waitMs = 3000 } = {}) {
  const res = { targets: [], killed: [], skipped: [], failed: [], removed: [], kept: [] };
  try {
    if (process.platform !== "linux" && sys === procSys) return res;
    const ps = procs(sys);
    const testNode = argv => /^node(js)?$/.test(path.basename(argv[0] || "")) && argv.slice(1).some(x => /(^|\/)test\/[\w-]+\.js$/.test(x));
    const guarded = pid => { for (let p = ps.get(pid)?.ppid, i = 0; p > 1 && i < 64; p = ps.get(p)?.ppid, i++) { const q = ps.get(p); if (!q) break; if (testNode(q.argv)) return true; } return false; };
    const roots = [];
    for (const [pid, rec] of ps) if (pid !== process.pid && isOurs(rec.argv) && !guarded(pid)) roots.push({ pid, rec, prof: ourProfile(rec.argv), root: pid });
    // Chrome's helpers (zygote, renderers, GPU) descend from a matched browser; they go too, tied to that root.
    const targets = [...roots], seen = new Map(roots.map(t => [t.pid, t.root]));
    for (let grew = true; grew;) { grew = false; for (const [pid, rec] of ps) if (!seen.has(pid) && seen.has(rec.ppid)) { const root = seen.get(rec.ppid); seen.set(pid, root); targets.push({ pid, rec, prof: null, root }); grew = true; } }
    res.targets = targets.map(t => t.pid);
    if (dryRun) return res;
    const bad = new Set();   // roots whose folder must be kept
    for (const t of targets) {
      if (!samePs(sys, t.pid, t.rec)) { res.skipped.push(t.pid); bad.add(t.root); continue; }   // pid reused / cmdline changed / exited
      try { sys.kill(t.pid, "SIGKILL"); res.killed.push(t.pid); } catch (e) { res.failed.push(t.pid); bad.add(t.root); sys.log(`harness: kill ${t.pid} failed (${e && e.code || e}); keeping its profile`); }
    }
    const live = () => targets.filter(t => res.killed.includes(t.pid) && aliveAs(sys, t.pid, t.rec));
    for (const t0 = Date.now(); Date.now() - t0 < waitMs && live().length;) sys.sleep(50);
    for (const t of live()) { res.failed.push(t.pid); bad.add(t.root); sys.log(`harness: ${t.pid} still alive after ${waitMs}ms; keeping its profile`); }
    for (const t of roots) if (t.prof) { if (bad.has(t.pid)) res.kept.push(t.prof); else if (removeProfile(t.prof)) res.removed.push(t.prof); else res.kept.push(t.prof); }
    if (res.killed.length) sys.log(`harness: killed ${res.killed.length} stale test Chrome process(es): ${res.killed.join(", ")}`);
  } catch (e) { try { sys.log(`harness: sweep error ignored: ${e && e.message || e}`); } catch {} }
  return res;
}
let swept = false;
module.exports = { freePort, port, onCleanup, cleanup, child, launchChrome, sweepStaleChromes, isOurs, ourProfile, removeProfile, procs, procSys };
