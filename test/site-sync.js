// site/ carries copies of widget, shared and pack files: they must match the sources (scripts/sync-site.sh makes them).
// Activity GIFs, previews and activities.json aren't used by the page, so they must NOT ship in site/.
// Manifest copies are the source manifest minus refs to files not shipped (scripts/site-manifest-refs.js), and
// every file a site/ manifest references must exist in site/.
const fs = require("fs"), path = require("path"), R = path.join(__dirname, ".."), REFS = require("../scripts/site-manifest-refs.js");
const pairs = [["widget/widget.js", "site/widget/widget.js"], ["widget/widget.css", "site/widget/widget.css"], ["widget/fonts/PixelifySans.ttf", "site/widget/fonts/PixelifySans.ttf"],
  ["shared/pack.js", "site/shared/pack.js"], ["shared/status.js", "site/shared/status.js"]];
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const rel = (base, f) => path.relative(base, f).split(path.sep).join("/");
const EXCLUDE = /\/activities\/(gifs\/|preview\.png$|activities\.json$)/;
const extra = [];
const packIds = fs.readdirSync(path.join(R, "packs")).filter(d => d !== "placeholder-blob" && !d.startsWith("zz-test-") && fs.existsSync(path.join(R, "packs", d, "manifest.json")));
for (const p of packIds) for (const f of walk(path.join(R, "packs", p))) { const r = rel(R, f); if (EXCLUDE.test(r)) { if (fs.existsSync(path.join(R, "site", r))) extra.push("site/" + r); } else pairs.push([r, "site/" + r]); }
for (const f of walk(path.join(R, "site", "packs"))) { const r = rel(path.join(R, "site"), f); if (!fs.existsSync(path.join(R, r)) || EXCLUDE.test(r)) extra.push("site/" + r); }
const same = (a, b) => {
  if (!fs.existsSync(path.join(R, b))) return false;
  if (!b.endsWith("/manifest.json")) return fs.readFileSync(path.join(R, a)).equals(fs.readFileSync(path.join(R, b)));
  const want = REFS.strip(path.dirname(path.join(R, b)), JSON.parse(fs.readFileSync(path.join(R, a)))).manifest;
  return JSON.stringify(want) === JSON.stringify(JSON.parse(fs.readFileSync(path.join(R, b))));
};
const bad = pairs.filter(([a, b]) => !same(a, b));
let nRefs = 0;
for (const p of fs.readdirSync(path.join(R, "site", "packs"))) { const d = path.join(R, "site", "packs", p), f = path.join(d, "manifest.json"); if (!fs.existsSync(f)) continue;
  const m = JSON.parse(fs.readFileSync(f)); REFS.walk(m, () => nRefs++);
  for (const x of REFS.missingRefs(d, m)) extra.push(`site/packs/${p}/manifest.json ${x.at} -> missing ${x.ref}`); }
const html = ["site/index.html", "site/widget.html", "site/site.css"].map(f => fs.readFileSync(path.join(R, f), "utf8")).join("\n");
if (/activities\/(gifs|preview|activities\.json)/.test(html)) extra.push("the page references excluded activity files: update EXCLUDE and scripts/sync-site.sh");
const up = html.match(/(?:src|href|url\()=?["(]?\.\.\//g);
if (bad.length || up || extra.length) { console.error("FAIL site out of sync:", bad.map(x => x[1]).slice(0, 10), up || "", [...new Set(extra)].slice(0, 10)); process.exit(1); }
console.log(`PASS: site copies in sync (${pairs.length} files), no ../ paths, no unused activity gifs/previews/json, all ${nRefs} manifest file refs resolve`);
