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
// v0.5.0 activities: every block validates, its sheet exists and covers its map, paletteColors == PROP colours
// (colours in the activities sheet that aren't in the pet's own sheet for that variant), and the fallback chain works.
const { readPng, colours } = require("./png");
const { validateActivities, resolveActivities, pickActivity, activitiesGrid } = require("../shared/pack");
let actBlocks = 0;
for (const id of ids) {
  const m = ld(id), base = path.join(dir, id);
  const blocks = m.variants ? m.variants.map(v => [v.id, v.sheet, v.activities]) : [[null, m.sheet.file, m.activities]];
  for (const [vid, sheet, a] of blocks) {
    if (!a) continue; actBlocks++; const tag = `${id}${vid ? "/" + vid : ""}`;
    const e = validateActivities(a, m.sheet); if (e.length) { console.error("FAIL", tag, e); process.exit(1); }
    const f = path.join(base, a.sheet); if (!fs.existsSync(f)) { console.error("FAIL", tag, "missing", a.sheet); process.exit(1); }
    const img = readPng(f), g = activitiesGrid(a);
    if (img.width < g.columns * m.sheet.frameWidth || img.height < g.rows * m.sheet.frameHeight) { console.error("FAIL", tag, "sheet smaller than map", img.width, img.height); process.exit(1); }
    const pet = colours(readPng(path.join(base, sheet))), props = [...colours(img)].filter(c => !pet.has(c)).length;
    if (props !== a.paletteColors) { console.error("FAIL", tag, `paletteColors ${a.paletteColors} but sheet has ${props} prop colours`); process.exit(1); }
    for (const k of ["woodcutting", "mining", "fishing", "combat", "banking"]) if (!a.map[k]) { console.error("FAIL", tag, "missing activity", k); process.exit(1); }
  }
}
// Older manifests (no activities) stay valid; fallback chain.
const old = { ...ld("heron") }; delete old.activities; if (validatePack(old).length) { console.error("FAIL pack without activities invalid"); process.exit(1); }
const h = ld("heron"), ha = resolveActivities(h);
const pk = x => pickActivity(h, ha, x);
const chk = (c, msg) => { if (!c) { console.error("FAIL", msg); process.exit(1); } };
chk(pk({ category: "skilling", skill: "Woodcutting" }).key === "woodcutting", "skill -> activities");
chk(pk({ category: "combat" }).source === "activities", "category -> activities (combat)");
chk(pk({ category: "banking" }).key === "banking", "banking");
chk(pk({ category: "skilling", skill: "Cooking" }).source === "base" && pk({ category: "skilling", skill: "Cooking" }).key === h.activityMap.skilling, "unknown skill -> activityMap");
chk(pk({ category: "bossing" }).key === h.activityMap.bossing, "bossing -> activityMap");
chk(pickActivity(old, null, { category: "skilling", skill: "Woodcutting" }).key === old.activityMap.skilling, "no activities -> activityMap");
chk(pickActivity({ ...old, activityMap: {} }, null, { category: "skilling" }).key === old.default, "-> default");
const yl = ld("youngllef"); chk(resolveActivities(yl, "crystal").gearTier === "dragon" && resolveActivities(yl).gearTier === "rune", "variant activities");
chk(validateActivities({ ...ha, paletteColors: 29 }, h.sheet).length > 0, "paletteColors > 16 rejected");
console.log(`PASS: activities (${actBlocks} blocks, prop colour counts match, fallback chain)`);
