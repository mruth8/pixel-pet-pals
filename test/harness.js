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
const PROFILE_RE = new RegExp(`--user-data-dir=${os.tmpdir().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/ppp-test-chrome-[^\\s]+`);
const isLegacy = c => /--headless/.test(c) && /--remote-debugging-port=1922[23](\s|$)/.test(c) && c.includes("--window-size=1100,900") && /about:blank/.test(c);
function procs() {
  const out = new Map();
  for (const pid of fs.readdirSync("/proc").filter(d => /^\d+$/.test(d))) {
    try { const cmd = fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").split("\0").join(" ").trim();
      const ppid = +fs.readFileSync(`/proc/${pid}/stat`, "utf8").replace(/^.*\) /, "").split(" ")[1]; out.set(+pid, { cmd, ppid }); } catch {}
  }
  return out;
}
function sweepStaleChromes({ dryRun = false } = {}) {
  if (process.platform !== "linux") return [];
  const ps = procs(), ours = c => /\bnode\b/.test(c.split(" ")[0]) && /test\/[\w-]+\.js/.test(c);
  const guarded = pid => { for (let p = ps.get(pid)?.ppid, i = 0; p > 1 && i < 64; p = ps.get(p)?.ppid, i++) { const q = ps.get(p); if (!q) break; if (ours(q.cmd)) return true; } return false; };
  const killed = [];
  for (const [pid, { cmd }] of ps) {
    if (pid === process.pid || !/chrom/i.test(cmd.split(" ")[0])) continue;
    const prof = cmd.match(PROFILE_RE);
    if (!prof && !isLegacy(cmd)) continue;
    if (guarded(pid)) continue;
    killed.push({ pid, cmd: cmd.slice(0, 160) });
    if (!dryRun) { try { process.kill(pid, "SIGKILL"); } catch {} if (prof) try { fs.rmSync(prof[0].split("=")[1], { recursive: true, force: true }); } catch {} }
  }
  if (killed.length && !dryRun) console.error(`harness: killed ${killed.length} stale test Chrome process(es): ${killed.map(k => k.pid).join(", ")}`);
  return killed;
}
let swept = false;
module.exports = { freePort, port, onCleanup, cleanup, child, launchChrome, sweepStaleChromes };
