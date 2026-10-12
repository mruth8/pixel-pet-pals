// Pack tests: every shipped pack validates; variant fallback and facing flip behave.
const fs = require("fs"), path = require("path"), { validatePack, resolveSheet, needsFlip } = require("../shared/pack");
const dir = path.join(__dirname, "..", "packs"); let bad = 0;
const ok = (c, msg) => { if (!c) { bad++; console.error("FAIL", msg); } };
for (const id of fs.readdirSync(dir).filter(d => fs.existsSync(path.join(dir, d, "manifest.json")))) {
  const m = JSON.parse(fs.readFileSync(path.join(dir, id, "manifest.json")));
  ok(m.id === id, id + ": id matches folder"); const e = validatePack(m); ok(!e.length, id + ": " + e.join("; "));
  ok(fs.existsSync(path.join(dir, id, m.sheet.file)), id + ": sheet exists");
  for (const v of m.variants || []) ok(fs.existsSync(path.join(dir, id, v.sheet)), id + ": variant sheet " + v.id);
}
const chin = JSON.parse(fs.readFileSync(path.join(dir, "baby-chinchompa/manifest.json")));
ok(resolveSheet(chin).variant === "grey", "chin default variant grey");
ok(resolveSheet(chin, "red").file === "variants/red/sheet.png", "chin ?variant=red");
ok(resolveSheet(chin, "nope").variant === "grey", "unknown variant falls back to default");
const olm = JSON.parse(fs.readFileSync(path.join(dir, "olmlet/manifest.json")));
ok(resolveSheet(olm, "red").file === "sheet.png" && resolveSheet(olm).variant === null, "no-variant pack uses sheet.file");
ok(needsFlip(olm) === true && needsFlip(chin) === false && needsFlip({}) === false, "facing flip");
ok(validatePack({ ...chin, defaultVariant: "pink" }).length > 0, "bad defaultVariant rejected");
ok(validatePack({ ...olm, facing: "up" }).length > 0, "bad facing rejected");
if (bad) process.exit(1); console.log("PASS: packs");
// v4: all 12 pets present, front facing never flips, tall packs fit integer scales.
const { fitScale } = require("../shared/pack");
const ids = fs.readdirSync(dir).filter(d => fs.existsSync(path.join(dir, d, "manifest.json")));
for (const p of ["olmlet","baby-mole","baby-chinchompa","heron","rocky","phoenix","lil-zik","beef","youngllef","abyssal-orphan","butch","lilviathan"]) if (!ids.includes(p)) { console.error("FAIL missing pack", p); process.exit(1); }
const ld = id => JSON.parse(fs.readFileSync(path.join(dir, id, "manifest.json")));
if (needsFlip(ld("butch")) || needsFlip(ld("lil-zik")) || needsFlip({ facing: "front" })) { console.error("FAIL front must not flip"); process.exit(1); }
if (resolveSheet(ld("youngllef")).variant !== "corrupted" || resolveSheet(ld("youngllef"), "crystal").variant !== "crystal") { console.error("FAIL youngllef variants"); process.exit(1); }
const tall = ld("olmlet"); if (tall.sheet.frameHeight !== 40 || fitScale(tall, 3, 96, 96) !== 2 || fitScale(tall, 2, 64, 64) !== 1 || fitScale(ld("heron"), 3, 96, 96) !== 3) { console.error("FAIL tall scale"); process.exit(1); }
console.log(`PASS: v4 packs (${ids.length} manifests, front facing, tall scale, youngllef variants)`);
