// File references inside pack manifests (paths are relative to the pack root).
// Used by sync-site.sh to strip refs to files not shipped in site/, and by test/site-sync.js to verify none remain.
const fs = require("fs"), path = require("path");
const FILE_RE = /^(?!\/|[a-z]+:)[\w.\/-]+\.(png|gif|jpe?g|webp|json|md|txt|ttf|woff2?)$/i;
function walk(o, fn, at = "") {
  if (Array.isArray(o)) o.forEach((v, i) => walk(v, fn, `${at}[${i}]`));
  else if (o && typeof o === "object") for (const k of Object.keys(o)) walk(o[k], fn, at ? `${at}.${k}` : k);
  else if (typeof o === "string" && FILE_RE.test(o)) fn(o, at);
}
function missingRefs(packDir, m) { const out = []; walk(m, (ref, at) => { if (!fs.existsSync(path.join(packDir, ref))) out.push({ ref, at }); }); return out; }
function strip(packDir, m) {
  let n = 0;
  const clean = o => {
    if (Array.isArray(o)) return o.filter(v => !(typeof v === "string" && FILE_RE.test(v) && !fs.existsSync(path.join(packDir, v)) && ++n)).map(clean);
    if (o && typeof o === "object") { for (const k of Object.keys(o)) { const v = o[k];
      if (typeof v === "string" && FILE_RE.test(v) && !fs.existsSync(path.join(packDir, v))) { delete o[k]; n++; } else o[k] = clean(v); } }
    return o;
  };
  return { manifest: clean(m), stripped: n };
}
module.exports = { walk, missingRefs, strip, FILE_RE };
if (require.main === module) {
  const root = process.argv[2] || "site/packs"; let total = 0;
  for (const p of fs.readdirSync(root)) { const f = path.join(root, p, "manifest.json"); if (!fs.existsSync(f)) continue;
    const text = fs.readFileSync(f, "utf8"), indent = (text.match(/\n( +|\t)"/) || [, 2])[1];
    const { manifest, stripped } = strip(path.join(root, p), JSON.parse(text));
    if (stripped) fs.writeFileSync(f, JSON.stringify(manifest, null, indent) + (text.endsWith("\n") ? "\n" : "")); total += stripped; }
  console.log(`stripped ${total} refs to unshipped files from ${root} manifests`);
}
