// Combat animations: manifest blocks validate, their frames exist at the declared size, resolution is per variant,
// playback timing, and the page wiring (Combat row is data-driven; the hero picture stays the plain pet).
const assert = require("assert"), fs = require("fs"), path = require("path");
const { validatePack, validateCombat, resolveCombat, combatFrameAt } = require("../shared/pack");
const { readPng } = require("./png");
const R = path.join(__dirname, ".."), dir = path.join(R, "packs");
const ld = id => JSON.parse(fs.readFileSync(path.join(dir, id, "manifest.json")));
const ids = fs.readdirSync(dir).filter(d => fs.existsSync(path.join(dir, d, "manifest.json")));

// Which pets have combat frames (any variant or top level). Graphics drew Baby Chinchompa (grey) only.
const withCombat = ids.filter(id => { const m = ld(id); return !!m.combat || (m.variants || []).some(v => v.combat); });
assert.deepStrictEqual(withCombat, ["baby-chinchompa"], "only baby-chinchompa ships combat frames: " + withCombat);

// Every combat block validates and every referenced PNG exists with the declared size.
let frames = 0;
for (const id of withCombat) {
  const m = ld(id);
  assert.deepStrictEqual(validatePack(m), [], id + " validates");
  for (const c of [m.combat, ...(m.variants || []).map(v => v.combat)].filter(Boolean)) {
    for (const mv of c.moves) {
      const t = readPng(path.join(dir, id, mv.thumb));
      assert.strictEqual(`${t.width}x${t.height}`, `${c.thumbWidth || 32}x${c.thumbHeight || 32}`, `${id} ${mv.id} thumb size`);
      for (const f of mv.frameFiles) {
        const p = readPng(path.join(dir, id, f)); frames++;
        assert.strictEqual(`${p.width}x${p.height}`, `${c.frameWidth}x${c.frameHeight}`, `${id} ${f} frame size`);
      }
    }
  }
}

// Baby Chinchompa: grey has the three approved moves in 1A order, 4 frames each.
const chin = ld("baby-chinchompa"), grey = resolveCombat(chin, "grey");
assert.deepStrictEqual(grey.moves.map(m => [m.id, m.label, m.frameFiles.length]),
  [["mage", "mage", 4], ["ranged", "ranged", 4], ["melee-spec", "melee spec", 4]]);
assert.strictEqual(resolveCombat(chin), grey, "default variant (grey) resolves the grey combat block");
assert.strictEqual(resolveCombat(chin, "red"), null, "colours without their own combat frames get no Combat row");
assert.strictEqual(resolveCombat(ld("olmlet")), null, "pets without combat frames get no Combat row");
assert.strictEqual(resolveCombat({ combat: { frameWidth: 1, frameHeight: 1, moves: [] } }), null, "empty moves -> no row");
assert.strictEqual(resolveCombat({ variants: [{ id: "a" }], combat: grey }, "a"), grey, "top-level block is the fallback");

// Validation rejects broken blocks.
const mv = grey.moves[0];
assert.ok(validateCombat({ frameWidth: 64, frameHeight: 34, moves: [] }).length, "empty moves rejected");
assert.ok(validateCombat({ frameWidth: 0, frameHeight: 34, moves: [mv] }).length, "bad frame size rejected");
assert.ok(validateCombat({ frameWidth: 64, frameHeight: 34, moves: [mv, mv] }).some(e => /duplicate/.test(e)), "duplicate move rejected");
assert.ok(validateCombat({ frameWidth: 64, frameHeight: 34, moves: [{ ...mv, captions: ["x"] }] }).length, "captions must match frames");
assert.ok(validateCombat({ frameWidth: 64, frameHeight: 34, moves: [{ ...mv, fps: 0 }] }).length, "fps must be > 0");
assert.ok(validatePack({ ...chin, combat: { moves: "nope" } }).length, "validatePack checks top-level combat too");

// Playback: one frame per 1/fps second, then -1 (finished; the stage hides).
assert.deepStrictEqual([0, 199, 200, 799, 800].map(ms => combatFrameAt({ fps: 5, frameFiles: [1, 2, 3, 4] }, ms)), [0, 0, 1, 3, -1]);

// Page: the three pet cards opt in by pack id; the hero pictures are the plain idle previews (never combat frames).
const html = fs.readFileSync(path.join(R, "site", "index.html"), "utf8");
assert.ok(/<article class="card pet" data-pack="baby-chinchompa" data-variant="grey">/.test(html), "chinchompa card opts in");
for (const [, src] of html.matchAll(/class="hero-gif" src="([^"]+)"/g)) assert.ok(/\/previews\/idle\.gif$/.test(src) && !/combat/.test(src), "hero stays plain: " + src);
assert.ok(/<script src="shared\/pack\.js[^"]*"><\/script>\s*<script src="combat\.js[^"]*"><\/script>/.test(html), "pack.js loads before combat.js");
const js = fs.readFileSync(path.join(R, "site", "combat.js"), "utf8");
assert.ok(!/hero-gif/.test(js), "combat.js never touches the hero picture");
console.log(`PASS: combat (${withCombat.length} pet with combat frames: ${withCombat.join(", ")}; ${frames} frames checked; ${ids.length - withCombat.length} manifests without)`);
