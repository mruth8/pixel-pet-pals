// Combat animations: every pack and colour has a complete, valid combat set (12 frames at the right size, 3 thumbs),
// resolution is per variant, a pet without frames gets no row, playback timing, and the page wiring
// (Combat row is data-driven; the hero picture stays the plain pet; the picker lists every pet and colour).
const assert = require("assert"), fs = require("fs"), path = require("path");
const { validatePack, validateCombat, resolveCombat, combatNextFrame } = require("../shared/pack");
const { readPng } = require("./png");
const R = path.join(__dirname, ".."), dir = path.join(R, "packs");
const ld = id => JSON.parse(fs.readFileSync(path.join(dir, id, "manifest.json")));
const ids = fs.readdirSync(dir).filter(d => d !== "placeholder-blob" && fs.existsSync(path.join(dir, d, "manifest.json")));
const MOVES = [["mage", "mage"], ["ranged", "ranged"], ["melee-spec", "melee spec"]];

// Every pack, and every colour/form of it, resolves its own complete combat set.
const sets = [];
for (const id of ids) {
  const m = ld(id);
  assert.deepStrictEqual(validatePack(m), [], id + " validates");
  const height = m.sheet.frameHeight === 40 ? 42 : 34; // tall (32x40) pets have 64x42 combat frames
  for (const v of m.variants && m.variants.length ? m.variants.map(x => x.id) : [undefined]) {
    const tag = id + (v ? "/" + v : ""), c = resolveCombat(m, v);
    assert.ok(c, tag + " has a combat block");
    if (v) assert.strictEqual(c, m.variants.find(x => x.id === v).combat, tag + " uses its own colour's frames");
    assert.deepStrictEqual([c.frameWidth, c.frameHeight], [64, height], tag + " frame size");
    assert.deepStrictEqual(c.moves.map(x => [x.id, x.label, x.frameFiles.length, (x.captions || []).length]), MOVES.map(([a, b]) => [a, b, 4, 4]), tag + " moves");
    const files = c.moves.flatMap(x => x.frameFiles);
    assert.strictEqual(new Set(files).size, 12, tag + " has 12 distinct frames");
    for (const f of files) { const p = readPng(path.join(dir, id, f)); assert.strictEqual(`${p.width}x${p.height}`, `64x${height}`, `${tag} ${f}`); }
    const thumbs = c.moves.map(x => x.thumb), folder = path.posix.dirname(files[0]);
    assert.deepStrictEqual(thumbs, ["thumb-mage.png", "thumb-ranged.png", "thumb-melee.png"].map(t => folder + "/" + t), tag + " thumbs live in its own combat folder");
    for (const t of thumbs) { const p = readPng(path.join(dir, id, t)); assert.strictEqual(`${p.width}x${p.height}`, "32x32", `${tag} ${t}`); }
    sets.push({ tag, files, thumbs });
  }
}
assert.strictEqual(sets.length, 22, "17 pets plus colour/form versions = 22 combat sets");
// Every set has its own frames and its own 3 thumbnails: no path and no image content is shared between sets.
const seen = new Map(), bytes = new Map(), crypto = require("crypto");
for (const s of sets) for (const f of s.files.concat(s.thumbs)) {
  const k = s.tag.split("/")[0] + "/" + f; assert.ok(!seen.has(k), "file reused: " + k); seen.set(k, s.tag);
  const h = crypto.createHash("sha256").update(fs.readFileSync(path.join(dir, k))).digest("hex");
  assert.ok(!bytes.has(h), `${k} is identical to ${bytes.get(h)}`); bytes.set(h, k);
}
assert.strictEqual(bytes.size, 22 * 15, "264 frames + 66 thumbnails, all distinct");

// A pet without frames still gets no row: the dev placeholder pack, a fixture, and empty blocks.
const blob = ld("placeholder-blob");
assert.strictEqual(resolveCombat(blob), null, "placeholder-blob (no combat block) -> no row");
const fixture = { ...ld("heron") }; delete fixture.combat;
assert.deepStrictEqual(validatePack(fixture), [], "fixture without combat is still a valid pack");
assert.strictEqual(resolveCombat(fixture), null, "fixture pet without combat frames -> no row");
assert.strictEqual(resolveCombat({ combat: { frameWidth: 1, frameHeight: 1, moves: [] } }), null, "empty moves -> no row");
const chin = ld("baby-chinchompa"), grey = resolveCombat(chin, "grey");
assert.strictEqual(resolveCombat(chin), grey, "default variant (grey) resolves the grey block");
assert.strictEqual(resolveCombat(chin, "nope"), grey, "unknown colour falls back to the default colour");
assert.strictEqual(resolveCombat({ variants: [{ id: "a" }], combat: grey }, "a"), grey, "top-level block is the fallback");

// Validation rejects broken blocks.
const mv = grey.moves[0];
assert.ok(validateCombat({ frameWidth: 64, frameHeight: 34, moves: [] }).length, "empty moves rejected");
assert.ok(validateCombat({ frameWidth: 0, frameHeight: 34, moves: [mv] }).length, "bad frame size rejected");
assert.ok(validateCombat({ frameWidth: 64, frameHeight: 34, moves: [mv, mv] }).some(e => /duplicate/.test(e)), "duplicate move rejected");
assert.ok(validateCombat({ frameWidth: 64, frameHeight: 34, moves: [{ ...mv, captions: ["x"] }] }).length, "captions must match frames");
assert.ok(validateCombat({ frameWidth: 64, frameHeight: 34, moves: [{ ...mv, fps: 0 }] }).length, "fps must be > 0");
assert.ok(validatePack({ ...chin, combat: { moves: "nope" } }).length, "validatePack checks top-level combat too");

// Playback: each frame holds 1/fps second, a slow tick advances only one frame (none skipped), then -1 (stage hides).
const mv5 = { fps: 5, frameFiles: [1, 2, 3, 4] };
assert.deepStrictEqual([[0, 199], [0, 200], [0, 5000], [2, 250], [3, 199], [3, 200]].map(([f, ms]) => combatNextFrame(mv5, f, ms)), [0, 1, 1, 3, 3, -1]);

// Page: cards opt in by pack id; hero pictures are the plain idle previews; the picker lists all 22 sets.
const html = fs.readFileSync(path.join(R, "site", "index.html"), "utf8");
for (const [, src] of html.matchAll(/class="hero-gif" src="([^"]+)"/g)) assert.ok(/\/previews\/idle\.gif$/.test(src) && !/combat/.test(src), "hero stays plain: " + src);
const options = [...html.matchAll(/<option value="([^"]+)"/g)].map(x => x[1]);
assert.deepStrictEqual([...options].sort(), sets.map(s => s.tag).sort(), "the picker lists every pet and colour once");
assert.ok(/<script src="shared\/pack\.js[^"]*"><\/script>\s*<script src="combat\.js[^"]*"><\/script>/.test(html), "pack.js loads before combat.js");
const js = fs.readFileSync(path.join(R, "site", "combat.js"), "utf8");
assert.ok(/hero\.src = base \+ "idle\.gif"/.test(js) && (js.match(/hero\.src\s*=/g) || []).length === 1, "the picker only ever sets the plain idle preview on the hero");
console.log(`PASS: combat (${sets.length} sets across ${ids.length} pets, ${bytes.size} files checked (264 frames + 66 own thumbnails, none shared); placeholder/fixture without frames -> no row)`);
