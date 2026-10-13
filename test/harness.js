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
  if (!swept && !process.env.NO_CHROME_SWEEP) { swept = true; sweepStaleChromes(); }
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
// Delete only that exact dir, and only if its realpath sits directly inside tmpdir with our prefix.
function removeProfile(d) {
  let real; try { real = fs.realpathSync(d); } catch { return false; }
  if (path.dirname(real) !== TMP || !path.basename(real).startsWith("ppp-test-chrome-")) return false;
  fs.rmSync(real, { recursive: true, force: true }); return true;
}
function procs() {
  const out = new Map();
  for (const pid of fs.readdirSync("/proc").filter(d => /^\d+$/.test(d))) {
    try { const argv = fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").split("\0"); if (argv[argv.length - 1] === "") argv.pop();
      const ppid = +fs.readFileSync(`/proc/${pid}/stat`, "utf8").replace(/^.*\) /, "").split(" ")[1]; out.set(+pid, { argv, ppid }); } catch {}
  }
  return out;
}
function sweepStaleChromes({ dryRun = false, ps = procs() } = {}) {
  if (process.platform !== "linux") return [];
  const testNode = argv => /^node(js)?$/.test(path.basename(argv[0] || "")) && argv.slice(1).some(x => /(^|\/)test\/[\w-]+\.js$/.test(x));
  const guarded = pid => { for (let p = ps.get(pid)?.ppid, i = 0; p > 1 && i < 64; p = ps.get(p)?.ppid, i++) { const q = ps.get(p); if (!q) break; if (testNode(q.argv)) return true; } return false; };
  const killed = [];
  for (const [pid, { argv }] of ps) {
    if (pid === process.pid || !isOurs(argv) || guarded(pid)) continue;
    const prof = ourProfile(argv);
    killed.push({ pid, prof });
  }
  // Chrome's own helper processes (zygote, renderers, GPU) descend from a matched browser; kill them too.
  const hit = new Set(killed.map(k => k.pid));
  for (let grew = true; grew;) { grew = false; for (const [pid, { ppid }] of ps) if (!hit.has(pid) && hit.has(ppid)) { hit.add(pid); killed.push({ pid, prof: null }); grew = true; } }
  if (!dryRun) for (const k of killed) { try { process.kill(k.pid, "SIGKILL"); } catch {} }
  if (!dryRun) { // wait (≤3s) for the killed processes to exit so they can't recreate files in the profile
    const t = Date.now(); while (Date.now() - t < 3000 && killed.some(k => fs.existsSync(`/proc/${k.pid}`) && !/\) Z /.test(fs.readFileSync(`/proc/${k.pid}/stat`, "utf8")))) require("child_process").spawnSync("sleep", ["0.05"]); }
  if (!dryRun) for (const d of new Set(killed.map(k => k.prof).filter(Boolean))) { try { removeProfile(d); } catch {} }
  if (killed.length && !dryRun) console.error(`harness: killed ${killed.length} stale test Chrome process(es): ${killed.map(k => k.pid).join(", ")}`);
  return killed;
}
let swept = false;
module.exports = { freePort, port, onCleanup, cleanup, child, launchChrome, sweepStaleChromes, isOurs, ourProfile, removeProfile };
