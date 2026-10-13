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
  const dport = await port(envPort), dir = fs.mkdtempSync(path.join(os.tmpdir(), "ppp-test-chrome-"));
  const p = spawn("google-chrome", ["--headless=new", "--no-sandbox", `--remote-debugging-port=${dport}`, `--user-data-dir=${dir}`,
    `--window-size=${width},${height}`, "about:blank"], { detached: true, stdio: "ignore" });
  onCleanup(() => { try { process.kill(-p.pid, "SIGKILL"); } catch {} try { fs.rmSync(dir, { recursive: true, force: true }); } catch {} });
  let t; for (let i = 0; i < 100 && !t; i++) { await new Promise(r => setTimeout(r, 100)); try { t = (await (await fetch(`http://127.0.0.1:${dport}/json`)).json()).find(x => x.type === "page"); } catch {} }
  if (!t) throw new Error("Chrome did not start on port " + dport);
  return { debugPort: dport, wsUrl: t.webSocketDebuggerUrl, pid: p.pid };
}
module.exports = { freePort, port, onCleanup, cleanup, child, launchChrome };
