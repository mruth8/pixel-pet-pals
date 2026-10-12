// Serves site/ ALONE under /matthew/pixel-pet-pals/ and checks it in headless Chrome:
// no 404s, pets face the text, compact status not clipped. Screenshot -> screenshots/site.png
// Runs at 1100px and 390px, with and without the trailing slash (server has no DirectorySlash redirect).
// node --experimental-websocket test/site-check.js
const http = require("http"), fs = require("fs"), path = require("path"), { spawn } = require("child_process");
const SITE = path.join(__dirname, "..", "site"), PREFIX = "/matthew/pixel-pet-pals/", PORT = 18901, OUT = path.join(__dirname, "..", "screenshots");
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".gif": "image/gif", ".svg": "image/svg+xml", ".ttf": "font/ttf" };
const misses = [];
const srv = http.createServer((req, res) => {
  let u = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (u === PREFIX.slice(0, -1)) u = PREFIX;  // serve index at the no-slash URL WITHOUT redirecting (worst case)
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
  for (const [vw, slash] of [[1100, true], [1100, false], [390, true], [390, false]]) {
    const tag = `${vw}px ${slash ? "slash" : "no-slash"}`; console.log("--", tag); misses.length = 0;
    await call("Emulation.setDeviceMetricsOverride", { width: vw, height: 900, deviceScaleFactor: 1, mobile: vw < 500 });
    await call("Page.navigate", { url: `http://localhost:${PORT}${slash ? PREFIX : PREFIX.slice(0, -1)}` }); await sl(1500);
    // loading="lazy" iframes only load near the viewport: scroll each into view and wait for its widget.
    await call("Runtime.evaluate", { awaitPromise: true, expression: `(async()=>{for(const f of document.querySelectorAll("iframe.live")){f.scrollIntoView();
      for(let i=0;i<60&&!(f.contentDocument&&f.contentDocument.getElementById("pet")&&f.contentDocument.getElementById("pet").style.backgroundImage&&f.contentDocument.getElementById("player").textContent!=="…");i++)await new Promise(r=>setTimeout(r,100));}
      await document.fonts.ready; scrollTo(0,0); await new Promise(r=>setTimeout(r,300));})()` });
    const r = (await call("Runtime.evaluate", { returnByValue: true, expression: `(()=>{
      const imgs=[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src);
      const distorted=[...document.images].filter(i=>i.naturalWidth&&Math.abs(i.clientWidth/i.clientHeight-i.naturalWidth/i.naturalHeight)>0.03).map(i=>i.getAttribute("src"));
      const petNames=[...document.querySelectorAll(".pets h3, .colours figcaption")].map(e=>e.textContent);
      const vw=document.documentElement.clientWidth, overflow=document.documentElement.scrollWidth-vw;
      const ws=[...document.querySelectorAll("iframe.live")].map(f=>{const d=f.contentDocument,p=d.getElementById("pet"),c=d.getElementById("w"),st=d.getElementById("statusline");
        const cr=c.getBoundingClientRect(),sr=st.getBoundingClientRect(),box=f.parentElement.getBoundingClientRect(),fr=f.getBoundingClientRect();
        return {src:f.getAttribute("src"),pet:p.dataset.pet,facing:p.dataset.facing,flip:p.classList.contains("flip"),bg:!!p.style.backgroundImage,
          textRightOfPet:d.querySelector(".info").getBoundingClientRect().left>p.getBoundingClientRect().right,
          legalOk:(()=>{const l=d.getElementById("note");return /trademark of Jagex Ltd/.test(l.textContent)&&l.getBoundingClientRect().bottom<=cr.bottom-2&&l.getBoundingClientRect().right<=cr.right})(),
          inStage:(()=>{const a=p.getBoundingClientRect(),b=d.querySelector(".stage").getBoundingClientRect();return a.top>=b.top-0.5&&a.bottom<=b.bottom+0.5&&a.left>=b.left-0.5&&a.right<=b.right+0.5})(),
          text:st.textContent.replace(/\\s+/g," ").trim(),clipped:[...st.children].some(e=>e.scrollWidth>e.clientWidth+1)||sr.right>cr.right||sr.bottom>cr.bottom,
          fitsFrame:cr.right+7<=f.clientWidth&&cr.bottom<=f.clientHeight&&d.documentElement.scrollWidth<=f.clientWidth,
          onScreen:fr.right<=box.right+0.5&&box.right<=vw+0.5, scale:f.style.transform||"none"}});
      return {imgs,distorted,petNames,ws,overflow,base:document.baseURI}})()` })).result.value;
    if (r.imgs.length) fail(tag + " broken images " + r.imgs);
    if (r.distorted.length) fail(tag + " distorted images " + r.distorted);
    for (const n of ["Olmlet","Baby Mole","Baby Chinchompa","Heron","Rocky","Phoenix","Lil' Zik","Beef","Youngllef","Crystal Youngllef","Abyssal orphan","Butch","Lil'viathan"]) if (!r.petNames.includes(n)) fail(tag + " pet missing " + n);
    if (r.overflow > 0) fail(tag + " page overflows by " + r.overflow + "px");
    if (!r.base.endsWith(PREFIX)) fail(tag + " baseURI " + r.base);
    for (const w of r.ws) {
      if (vw < 500) console.log(" ", w.pet, w.scale, "onScreen=" + w.onScreen);
      if (!w.bg) fail(tag + " no sprite " + w.src);
      if (w.flip !== (w.facing === "left") || !w.textRightOfPet) fail(tag + " pet not facing text " + w.src);
      if (w.clipped || !w.fitsFrame || !w.onScreen || !w.legalOk || !w.inStage) fail(tag + " clipped " + JSON.stringify(w));
    }
    const lo = r.ws.find(w => w.src.includes("size=compact") && w.src.includes("demo=logout"));
    if (!lo || !/Logged out · sleeping ?· 2h/.test(lo.text)) fail(tag + " compact logout text: " + (lo && lo.text));
    if (misses.length) fail(tag + " server 404s: " + misses.join(", "));
    console.log("  base=" + r.base + " widgets=" + r.ws.length + " overflow=" + r.overflow);
    const m = await call("Page.getLayoutMetrics"); const h = Math.ceil(m.cssContentSize.height);
    const s = await call("Page.captureScreenshot", { captureBeyondViewport: true, clip: { x: 0, y: 0, width: vw, height: h, scale: 1 } });
    fs.mkdirSync(OUT, { recursive: true });
    const name = `v4-site-${vw}${slash ? "" : "-noslash"}.png`;
    fs.writeFileSync(path.join(OUT, name), Buffer.from(s.data, "base64")); console.log("  screenshot -> screenshots/" + name);
  }
  ch.kill(); srv.close(); console.log(bad ? `FAIL (${bad})` : "PASS: site check"); process.exit(bad ? 1 : 0);
})();
