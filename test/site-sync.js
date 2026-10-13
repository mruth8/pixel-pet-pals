// site/ carries copies of widget, shared and pack files: they must match the sources (scripts/sync-site.sh makes them).
// Activity GIFs, previews and activities.json aren't used by the page, so they must NOT ship in site/.
const fs = require("fs"), path = require("path"), R = path.join(__dirname, "..");
const pairs = [["widget/widget.js", "site/widget/widget.js"], ["widget/widget.css", "site/widget/widget.css"], ["widget/fonts/PixelifySans.ttf", "site/widget/fonts/PixelifySans.ttf"],
  ["shared/pack.js", "site/shared/pack.js"], ["shared/status.js", "site/shared/status.js"]];
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const rel = (base, f) => path.relative(base, f).split(path.sep).join("/");
const EXCLUDE = /\/activities\/(gifs\/|preview\.png$|activities\.json$)/;
const extra = [];
const packIds = fs.readdirSync(path.join(R, "packs")).filter(d => d !== "placeholder-blob" && !d.startsWith("zz-test-") && fs.existsSync(path.join(R, "packs", d, "manifest.json")));
for (const p of packIds) for (const f of walk(path.join(R, "packs", p))) { const r = rel(R, f); if (EXCLUDE.test(r)) { if (fs.existsSync(path.join(R, "site", r))) extra.push("site/" + r); } else pairs.push([r, "site/" + r]); }
for (const f of walk(path.join(R, "site", "packs"))) { const r = rel(path.join(R, "site"), f); if (!fs.existsSync(path.join(R, r)) || EXCLUDE.test(r)) extra.push("site/" + r); }
const bad = pairs.filter(([a, b]) => !fs.existsSync(path.join(R, b)) || !fs.readFileSync(path.join(R, a)).equals(fs.readFileSync(path.join(R, b))));
const html = ["site/index.html", "site/widget.html", "site/site.css"].map(f => fs.readFileSync(path.join(R, f), "utf8")).join("\n");
if (/activities\/(gifs|preview|activities\.json)/.test(html)) extra.push("the page references excluded activity files: update EXCLUDE and scripts/sync-site.sh");
const up = html.match(/(?:src|href|url\()=?["(]?\.\.\//g);
if (bad.length || up || extra.length) { console.error("FAIL site out of sync:", bad.map(x => x[1]).slice(0, 10), up || "", [...new Set(extra)].slice(0, 10)); process.exit(1); }
console.log(`PASS: site copies in sync (${pairs.length} files), no ../ paths, no unused activity gifs/previews/json`);
