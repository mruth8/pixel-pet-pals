// Reference receiver/relay (dev). POST /events  ->  SSE GET /stream  ->  widget.
// Also serves widget/, packs/, shared/ statically. No deps.
const http = require("http"), fs = require("fs"), path = require("path");
const { validateEventV1 } = require("../shared/validate");
const argHost = process.argv.indexOf("--host");
const PORT = +process.env.PORT || 8787;
// Loopback only by default. Opt in to LAN/public with PET_HOST=0.0.0.0 (or --host 0.0.0.0); set PET_SECRET when you do.
const HOST = (argHost > 0 && process.argv[argHost + 1]) || process.env.PET_HOST || "127.0.0.1";
const SECRET = process.env.PET_SECRET || "";
const ROOT = path.join(__dirname, "..");
const MIME = { ".html":"text/html", ".js":"text/javascript", ".json":"application/json", ".svg":"image/svg+xml", ".png":"image/png", ".css":"text/css" };
let latest = {}; const clients = new Set();

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "POST" && url.pathname === "/events") {
    if (SECRET && req.headers["x-pet-secret"] !== SECRET) { res.writeHead(401); return res.end("bad secret"); }
    let body = ""; req.on("data", c => { body += c; if (body.length > 16384) req.destroy(); });
    req.on("end", () => {
      let ev; try { ev = JSON.parse(body); } catch { res.writeHead(400); return res.end("bad json"); }
      const errs = validateEventV1(ev);
      if (errs.length) { res.writeHead(422, {"content-type":"application/json"}); return res.end(JSON.stringify({errors: errs})); }
      latest[ev.player] = ev;
      for (const c of clients) c.write(`data: ${JSON.stringify(ev)}\n\n`);
      console.log("event", ev.type, ev.activity?.category || "", ev.player);
      res.writeHead(204); res.end();
    });
    return;
  }
  if (url.pathname === "/stream") {
    res.writeHead(200, {"content-type":"text/event-stream","cache-control":"no-cache","access-control-allow-origin":"*"});
    for (const ev of Object.values(latest)) res.write(`data: ${JSON.stringify(ev)}\n\n`);
    clients.add(res); req.on("close", () => clients.delete(res)); return;
  }
  if (url.pathname === "/state") { res.writeHead(200, {"content-type":"application/json"}); return res.end(JSON.stringify(latest)); }
  if (/^\/(widget|packs|shared)$/.test(url.pathname)) { res.writeHead(301, { location: url.pathname + "/" + url.search }); return res.end(); }
  if (url.pathname === "/") { res.writeHead(302, { location: "/widget/" }); return res.end(); }
  let p = url.pathname.endsWith("/") ? url.pathname + "index.html" : url.pathname;
  const f = path.normalize(path.join(ROOT, p));
  if (!f.startsWith(ROOT) || !/^\/(widget|packs|shared)\//.test(p)) { res.writeHead(404); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, {"content-type": MIME[path.extname(f)] || "application/octet-stream"}); res.end(d); });
}).listen(PORT, HOST, () => {
  console.log(`relay on http://${HOST}:${PORT}  (widget at /widget/, POST /events)`);
  if (HOST !== "127.0.0.1" && HOST !== "localhost" && HOST !== "::1" && !SECRET) console.warn("WARNING: listening beyond loopback without PET_SECRET; anyone who can reach it can post events.");
});
