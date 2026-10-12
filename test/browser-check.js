// Headless-Chrome check (google-chrome, Node >=20.10): node --experimental-websocket test/browser-check.js
// Screenshots each pet + compact logged-out card into screenshots/ (gitignored) and asserts facing/variant/no truncation.
const { spawn } = require("child_process"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "screenshots"), PORT = 18899, BASE = `http://localhost:${PORT}`;
fs.mkdirSync(OUT, { recursive: true });
const relay = spawn("node", ["relay/server.js"], { cwd: ROOT, env: { ...process.env, PORT } });
const ch = spawn("google-chrome", ["--headless=new", "--no-sandbox", "--remote-debugging-port=19222", "--window-size=800,400", "about:blank"]);
const sl = ms => new Promise(r => setTimeout(r, ms)); let bad = 0;
const post = ev => fetch(`${BASE}/events`, { method: "POST", body: JSON.stringify({ v: 1, player: "Matthew", ts: new Date().toISOString(), ...ev }) });
(async () => {
  await sl(2500);
  const t = (await (await fetch("http://localhost:19222/json")).json()).find(x => x.type === "page");
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {};
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) pend[d.id](d.result); if (d.method === "Runtime.exceptionThrown") { bad++; console.log("EXC", d.params.exceptionDetails.text); } };
  const call = (method, params = {}) => new Promise(r => { pend[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
  const ev = async x => (await call("Runtime.evaluate", { expression: x, returnByValue: true })).result.value;
  await call("Runtime.enable");
  const shot = async (name, url) => {
    await call("Page.navigate", { url }); await sl(1200);
    await call("Runtime.evaluate", { awaitPromise: true, expression: `(async()=>{for(let i=0;i<50&&!document.getElementById("pet").style.backgroundImage;i++)await new Promise(r=>setTimeout(r,100));
      const u=getComputedStyle(document.getElementById("pet")).backgroundImage.slice(5,-2);const im=new Image();im.src=u;await im.decode();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))})()` });
    await sl(300);
    const s = await ev(`(()=>{const p=document.getElementById("pet"),c=document.getElementById("w"),st=document.getElementById("statusline"),r=c.getBoundingClientRect(),sr=st.getBoundingClientRect();
      return {pet:p.dataset.pet,variant:p.dataset.variant,facing:p.dataset.facing,flip:p.classList.contains("flip"),anim:p.dataset.anim,
      text:st.textContent.trim(),clipped:[...st.children].some(e=>e.scrollWidth>e.clientWidth+1)||sr.right>r.right||sr.bottom>r.bottom,w:r.width,h:r.height}})()`);
    const r = await call("Page.captureScreenshot", { clip: { x: 0, y: 0, width: Math.ceil(s.w) + 14, height: Math.ceil(s.h) + 14, scale: 2 } });
    const f = path.join(OUT, name + ".png"); fs.writeFileSync(f, Buffer.from(r.data, "base64"));
    console.log(name, JSON.stringify(s), "->", path.relative(ROOT, f)); return s;
  };
  await post({ type: "activity", activity: { category: "bossing", target: "Vorkath" } });
  for (const [name, q, want] of [
    ["olmlet", "pet=olmlet", { facing: "left", flip: true }],
    ["baby-mole", "pet=baby-mole", { facing: "left", flip: true }],
    ["baby-chinchompa-grey-default", "pet=baby-chinchompa", { variant: "grey", flip: false }],
    ["baby-chinchompa-red", "pet=baby-chinchompa&variant=red", { variant: "red", flip: false }],
  ]) { const s = await shot(name, `${BASE}/widget/?bg=1&${q}`); for (const k in want) if (s[k] !== want[k]) { bad++; console.log("FAIL", name, k, s[k]); } }
  await post({ type: "logout", ts: new Date(Date.now() - 2 * 3600e3 - 60e3).toISOString() });
  for (const pet of ["olmlet", "baby-chinchompa"]) {
    const s = await shot(`compact-logged-out-${pet}`, `${BASE}/widget/?bg=1&size=compact&pet=${pet}`);
    if (s.text !== "Logged out · sleeping· 2h" && !/Logged out · sleeping\s*· 2h/.test(s.text)) { bad++; console.log("FAIL text", s.text); }
    if (s.clipped) { bad++; console.log("FAIL compact status clipped"); }
    if (s.anim !== "sleep") { bad++; console.log("FAIL anim", s.anim); }
  }
  ch.kill(); relay.kill(); console.log(bad ? "FAIL (" + bad + ")" : "PASS: browser check"); process.exit(bad ? 1 : 0);
})();
