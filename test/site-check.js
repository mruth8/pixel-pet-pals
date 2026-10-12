// Serves site/ ALONE under /matthew/pixel-pet-pals/ and checks it in headless Chrome:
// no 404s, pets face the text, compact status not clipped. Screenshot -> screenshots/site.png
// node --experimental-websocket test/site-check.js
const http = require("http"), fs = require("fs"), path = require("path"), { spawn } = require("child_process");
const SITE = path.join(__dirname, "..", "site"), PREFIX = "/matthew/pixel-pet-pals/", PORT = 18901, OUT = path.join(__dirname, "..", "screenshots");
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".gif": "image/gif", ".svg": "image/svg+xml", ".ttf": "font/ttf" };
const misses = [];
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (!u.startsWith(PREFIX)) { misses.push(u); res.writeHead(404); return res.end(); }
  let f = path.normalize(path.join(SITE, u.slice(PREFIX.length))); if (f.endsWith(path.sep) || f === SITE) f = path.join(f, "index.html");
  if (!f.startsWith(SITE)) { misses.push(u); res.writeHead(404); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { misses.push(u); res.writeHead(404); return res.end(); } res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); res.end(d); });
}).listen(PORT);
const ch = spawn("google-chrome", ["--headless=new", "--no-sandbox", "--remote-debugging-port=19223", "--window-size=1100,900", "about:blank"]);
const sl = ms => new Promise(r => setTimeout(r, ms)); let bad = 0; const fail = m => { bad++; console.log("FAIL", m); };
(async () => {
  await sl(2500);
  const t = (await (await fetch("http://localhost:19223/json")).json()).find(x => x.type === "page");
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {};
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) pend[d.id](d.result);
    if (d.method === "Network.responseReceived" && d.params.response.status >= 400) fail(d.params.response.status + " " + d.params.response.url);
    if (d.method === "Runtime.exceptionThrown") fail("exception " + d.params.exceptionDetails.text); };
  const call = (method, params = {}) => new Promise(r => { pend[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
  await call("Network.enable"); await call("Runtime.enable");
  await call("Page.navigate", { url: `http://localhost:${PORT}${PREFIX}` }); await sl(4000);
  const r = (await call("Runtime.evaluate", { returnByValue: true, expression: `(()=>{
    const imgs=[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src);
    const ws=[...document.querySelectorAll("iframe.live")].map(f=>{const d=f.contentDocument,p=d.getElementById("pet"),c=d.getElementById("w"),st=d.getElementById("statusline");
      const cr=c.getBoundingClientRect(),sr=st.getBoundingClientRect();
      return {src:f.getAttribute("src"),pet:p.dataset.pet,facing:p.dataset.facing,flip:p.classList.contains("flip"),bg:!!p.style.backgroundImage,
        textRightOfPet:d.querySelector(".info").getBoundingClientRect().left>p.getBoundingClientRect().right,
        text:st.textContent.replace(/\\s+/g," ").trim(),clipped:[...st.children].some(e=>e.scrollWidth>e.clientWidth+1)||sr.right>cr.right||sr.bottom>cr.bottom,
        fits:cr.right<=f.clientWidth&&cr.bottom<=f.clientHeight}});
    return {imgs,ws,font:document.fonts.check('12px PixelifySans')}})()` })).result.value;
  if (r.imgs.length) fail("broken images " + r.imgs);
  for (const w of r.ws) {
    console.log(JSON.stringify(w));
    if (!w.bg) fail("no sprite " + w.src);
    if (w.flip !== (w.facing === "left") || !w.textRightOfPet) fail("pet not facing text " + w.src);
    if (w.clipped || !w.fits) fail("clipped " + w.src);
  }
  const lo = r.ws.find(w => w.src.includes("size=compact") && w.src.includes("demo=logout"));
  if (!lo || !/Logged out · sleeping ?· 2h/.test(lo.text)) fail("compact logout text: " + (lo && lo.text));
  if (misses.length) fail("server 404s: " + misses.join(", "));
  const m = await call("Page.getLayoutMetrics"); const h = Math.ceil(m.cssContentSize.height);
  const s = await call("Page.captureScreenshot", { captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1100, height: h, scale: 1 } });
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, "site.png"), Buffer.from(s.data, "base64"));
  console.log("screenshot -> screenshots/site.png (" + h + "px tall)");
  ch.kill(); srv.close(); console.log(bad ? `FAIL (${bad})` : "PASS: site check"); process.exit(bad ? 1 : 0);
})();
