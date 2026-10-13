// site/ carries copies of widget, shared and pack files: they must match the sources.
const fs = require("fs"), path = require("path"), R = path.join(__dirname, "..");
const pairs = [["widget/widget.js", "site/widget/widget.js"], ["widget/widget.css", "site/widget/widget.css"], ["widget/fonts/PixelifySans.ttf", "site/widget/fonts/PixelifySans.ttf"],
  ["shared/pack.js", "site/shared/pack.js"], ["shared/status.js", "site/shared/status.js"]];
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const p of fs.readdirSync(path.join(R, "packs")).filter(d => d !== "placeholder-blob" && fs.statSync(path.join(R, "packs", d)).isDirectory())) for (const f of walk(path.join(R, "packs", p))) { const rel = path.relative(R, f); pairs.push([rel, "site/" + rel]); }
const bad = pairs.filter(([a, b]) => !fs.existsSync(path.join(R, b)) || !fs.readFileSync(path.join(R, a)).equals(fs.readFileSync(path.join(R, b))));
const html = ["site/index.html", "site/widget.html", "site/site.css"].map(f => fs.readFileSync(path.join(R, f), "utf8")).join("\n");
const up = html.match(/(?:src|href|url\()=?["(]?\.\.\//g);
if (bad.length || up) { console.error("FAIL site out of sync:", bad.map(x => x[1]), up || ""); process.exit(1); }
console.log(`PASS: site copies in sync (${pairs.length} files), no ../ paths`);
