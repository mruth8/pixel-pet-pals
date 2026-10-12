// Unit tests: status text (incl. quest with no detail) and relay bind host.
const assert = require("assert"), os = require("os"), net = require("net"), path = require("path"), { spawn } = require("child_process");
const { statusText } = require("../shared/status");
const ev = (type, x = {}) => ({ v: 1, player: "T", ts: new Date().toISOString(), type, ...x });
assert.strictEqual(statusText(ev("quest")), "Quest complete!");
assert.strictEqual(statusText(ev("quest", { detail: {} })), "Quest complete!");
assert.strictEqual(statusText(ev("quest", { detail: { name: "Dragon Slayer I" } })), "Quest: Dragon Slayer I");
assert.ok(!/:\s*$/.test(statusText(ev("quest"))), "no dangling colon");
console.log("PASS: status text");
// Relay binds loopback by default; HOST opt-in binds wider.
const PORT = +process.env.UNIT_PORT || 18788, root = path.join(__dirname, "..");
const lan = Object.values(os.networkInterfaces()).flat().find(i => i && i.family === "IPv4" && !i.internal);
const tryConnect = host => new Promise(r => { const s = net.connect(PORT, host); s.on("connect", () => { s.destroy(); r(true); }); s.on("error", () => r(false)); });
const sl = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  for (const [env, wantLan] of [[{}, false], [{ PET_HOST: "0.0.0.0" }, true]]) {
    const p = spawn("node", ["relay/server.js"], { cwd: root, env: { ...process.env, PET_HOST: "", ...env, PORT } }); await sl(500);
    assert.ok(await tryConnect("127.0.0.1"), "loopback reachable");
    if (lan) assert.strictEqual(await tryConnect(lan.address), wantLan, `LAN ${lan.address} reachable=${wantLan} with ${JSON.stringify(env)}`);
    p.kill(); await sl(200);
  }
  console.log("PASS: relay bind host" + (lan ? ` (checked via ${lan.address})` : " (no LAN interface; loopback only)"));
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
