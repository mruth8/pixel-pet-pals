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
