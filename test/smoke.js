// Smoke test: starts relay, subscribes to SSE, runs mock sender once, checks events arrive & invalid ones rejected.
const { spawn } = require("child_process"), http = require("http"), path = require("path");
const H = require("./harness"), root = path.join(__dirname, "..");
const PORT = +process.env.SMOKE_PORT || require("child_process").execFileSync(process.execPath, ["-e", "require('./harness').freePort().then(p=>process.stdout.write(String(p)))"], { cwd: __dirname }).toString();
const relay = H.child("node", ["relay/server.js"], { cwd: root, env: { ...process.env, PORT } });
const fail = m => { console.error("FAIL", m); relay.kill(); process.exit(1); };
setTimeout(async () => {
  const got = [];
  http.get(`http://localhost:${PORT}/stream`, r => r.on("data", d => String(d).split("\n").filter(l => l.startsWith("data:")).forEach(l => got.push(JSON.parse(l.slice(5))))));
  const bad = await fetch(`http://localhost:${PORT}/events`, { method: "POST", body: JSON.stringify({ v: 2 }) });
  if (bad.status !== 422) fail("invalid event not rejected");
  const s = spawn("node", ["mock-sender/send.js", "--url", `http://localhost:${PORT}/events`, "--interval", "50", "--once"], { cwd: root });
  s.on("exit", () => setTimeout(() => {
    if (got.length !== 13) fail("expected 13 events, got " + got.length);
    console.log("PASS: relay accepted & streamed", got.map(e => e.type).join(",")); relay.kill();
  }, 200));
}, 400);
