// Combat animations: every pack and colour has a complete, valid combat set (12 frames at the right size, 3 thumbs),
// resolution is per variant, a pet without frames gets no row, playback timing, and the page wiring
// (Combat row is data-driven; the hero picture stays the plain pet; switcher 1A: a grid of 22 pet buttons, and
// tapping one, in headless Chrome, switches the Combat card to that pet with no sideways scroll at 320/340/390/1280).
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

// Page: cards opt in by pack id; hero pictures are the plain idle previews; switcher 1A lists all 22 sets as buttons.
const html = fs.readFileSync(path.join(R, "site", "index.html"), "utf8");
for (const [, src] of html.matchAll(/class="hero-gif" src="([^"]+)"/g)) assert.ok(/\/previews\/idle\.gif$/.test(src) && !/combat/.test(src), "hero stays plain: " + src);
assert.ok(!/<select|data-combat-picker/.test(html), "the provisional dropdown is gone");
const tiles = [...html.matchAll(/<button type="button" class="pet-tile( on)?" data-combat-pet="([^"]+)" aria-pressed="(true|false)"(?: aria-label="([^"]+)")?><img src="([^"]+)" width="64" height="64" alt=""><span>([^<]+)<\/span><\/button>/g)]
  .map(([, on, tag, pressed, aria, img, text]) => ({ on: !!on, tag, pressed: pressed === "true", name: aria || text, text, img }));
assert.strictEqual((html.match(/data-combat-pet=/g) || []).length, 22, "22 pet buttons");
assert.deepStrictEqual(tiles.map(t => t.tag).sort(), sets.map(s => s.tag).sort(), "the grid has one button per pet and colour");
for (const t of tiles) {
  const s = sets.find(x => x.tag === t.tag), [id] = t.tag.split("/");
  assert.strictEqual(t.img, `packs/${id}/${s.thumbs[0]}`, t.tag + " button shows its own combat thumbnail");
  assert.ok(t.name.includes(t.text) && t.name.trim(), t.tag + " button is labelled with the pet name");
}
assert.strictEqual(new Set(tiles.map(t => t.name)).size, 22, "every button has a distinct name");
const def = tiles.filter(t => t.on || t.pressed);
assert.ok(def.length === 1 && def[0].on && def[0].pressed && def[0].tag === "baron", "Baron is selected by default, as in the 1A mockup");
assert.ok(/<article class="card pet" data-pack="baron" data-combat-try>/.test(html), "the Combat card starts on Baron");
assert.ok(/<script src="shared\/pack\.js[^"]*"><\/script>\s*<script src="combat\.js[^"]*"><\/script>/.test(html), "pack.js loads before combat.js");
const js = fs.readFileSync(path.join(R, "site", "combat.js"), "utf8");
assert.ok(/hero\.src = base \+ "idle\.gif"/.test(js) && (js.match(/hero\.src\s*=/g) || []).length === 1, "the switcher only ever sets the plain idle preview on the hero");
console.log(`PASS: combat (${sets.length} sets across ${ids.length} pets, ${bytes.size} files checked (264 frames + 66 own thumbnails, none shared); placeholder/fixture without frames -> no row; 22 switcher buttons)`);

// Headless Chrome: tapping (and Enter on) each button switches the card; no sideways scroll at 320/340/390/1280.
const http = require("http"), H = require("./harness"), SITE = path.join(R, "site"), PREFIX = "/matthew/osrs/pixel-pet-pals/";
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".gif": "image/gif", ".ttf": "font/ttf" };
const srv = http.createServer((req, res) => {
  let u = decodeURIComponent(new URL(req.url, "http://x").pathname); if (!u.startsWith(PREFIX)) { res.writeHead(404); return res.end(); }
  let f = path.normalize(path.join(SITE, u.slice(PREFIX.length))); if (f === SITE || f.endsWith(path.sep)) f = path.join(f, "index.html");
  if (!f.startsWith(SITE)) { res.writeHead(404); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); res.end(d); });
});
const sl = ms => new Promise(r => setTimeout(r, ms)), errs = [];
(async () => {
  const port = await H.port("COMBAT_PORT"); await new Promise(r => srv.listen(port, "127.0.0.1", r)); H.onCleanup(() => srv.close());
  const chrome = await H.launchChrome({ envPort: "CHROME_DEBUG_PORT" });
  const ws = new WebSocket(chrome.wsUrl); H.onCleanup(() => ws.close()); await new Promise(r => ws.onopen = r);
  let n = 0; const pend = {};
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) pend[d.id](d.result);
    if (d.method === "Runtime.exceptionThrown") errs.push("exception " + d.params.exceptionDetails.text);
    if (d.method === "Network.responseReceived" && d.params.response.status >= 400) errs.push(d.params.response.status + " " + d.params.response.url); };
  const call = (method, params = {}) => new Promise((r, j) => { const i = ++n, to = setTimeout(() => j(new Error("CDP timeout " + method)), 20000); pend[i] = v => { clearTimeout(to); r(v); }; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async x => { const r = await call("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(x.slice(0, 80) + ": " + r.exceptionDetails.text); return r.result.value; };
  await call("Runtime.enable"); await call("Network.enable");
  const state = `(()=>{const c=document.querySelector("[data-combat-try]"),p=[...document.querySelectorAll("[data-combat-pet][aria-pressed=true]")];
    return {tag:c.dataset.pack+(c.dataset.variant?"/"+c.dataset.variant:""),ready:c.dataset.combatReady,h3:c.querySelector("h3").textContent,hero:c.querySelector(".hero-gif").getAttribute("src"),
      pressed:p.map(x=>x.dataset.combatPet),on:[...document.querySelectorAll(".pet-tile.on")].map(x=>x.dataset.combatPet),
      thumbs:[...c.querySelectorAll(".combat-btn img")].map(i=>i.getAttribute("src")),
      over:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`;
  const waitFor = async (tag) => { let s; for (let i = 0; i < 100; i++) { s = await ev(state); if (s.tag === tag && s.ready === "row") return s; await sl(50); } return s; };
  let checked = 0;
  for (const vw of [1280, 390, 340, 320]) {
    await call("Emulation.setDeviceMetricsOverride", { width: vw, height: 900, deviceScaleFactor: 1, mobile: vw < 500 });
    await call("Page.navigate", { url: `http://127.0.0.1:${port}${PREFIX}` }); await sl(800);
    await ev(`document.fonts.ready.then(()=>new Promise(r=>{const w=()=>[...document.images].every(i=>i.complete)?r():setTimeout(w,50);w()}))`);
    let s = await waitFor("baron");
    assert.deepStrictEqual([s.tag, s.pressed, s.on], ["baron", ["baron"], ["baron"]], vw + "px: starts on Baron, selected");
    assert.strictEqual(await ev(`[...document.querySelectorAll("[data-combat-pet] img")].filter(i=>!i.naturalWidth).length`), 0, vw + "px: all 22 pictures load");
    assert.ok(s.over <= 0, `${vw}px: no sideways scroll (${s.over}px)`);
    const order = vw === 1280 ? tiles.map(t => t.tag) : ["olmlet", "baby-chinchompa/red", "youngllef/crystal", "baron"];
    for (const tag of order) {
      const key = vw === 340; // keyboard path: focus the button and press Enter
      if (key) { await ev(`document.querySelector('[data-combat-pet="${tag}"]').focus()`);
        for (const type of ["keyDown", "keyUp"]) await call("Input.dispatchKeyEvent", { type, key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: type === "keyDown" ? "\r" : undefined }); }
      else await ev(`document.querySelector('[data-combat-pet="${tag}"]').click()`);
      s = await waitFor(tag); const set = sets.find(x => x.tag === tag), [id] = tag.split("/");
      assert.strictEqual(s.tag, tag, `${vw}px: ${key ? "Enter" : "tap"} on ${tag} switches the card`);
      assert.deepStrictEqual([s.pressed, s.on], [[tag], [tag]], `${vw}px: only ${tag} is selected`);
      assert.ok(s.hero.startsWith(`packs/${id}/${tag.includes("/") ? "variants/" + tag.split("/")[1] + "/" : ""}previews/`) && s.hero.endsWith("/idle.gif"), `${vw}px: ${tag} hero is its plain idle preview`);
      assert.deepStrictEqual(s.thumbs, set.thumbs.map(t => `packs/${id}/${t}`), `${vw}px: ${tag} move buttons use its own thumbnails`);
      assert.ok(s.over <= 0, `${vw}px: no sideways scroll after switching to ${tag} (${s.over}px)`);
      checked++;
    }
    // A move plays on the switched pet, still without sideways scroll.
    await ev(`document.querySelector('[data-combat-pet="olmlet"]').click()`); await waitFor("olmlet");
    await ev(`document.querySelector('[data-combat-try] [data-move="melee-spec"]').click()`);
    let f = -1; for (let i = 0; i < 60 && f < 1; i++) { await sl(50); f = +(await ev(`document.querySelector('[data-combat-try] [data-combat-stage]').dataset.frame||-1`)); }
    assert.ok(f >= 1, vw + "px: Olmlet's melee spec plays after switching");
    assert.ok((await ev(state)).over <= 0, vw + "px: no sideways scroll mid-move");
  }
  assert.deepStrictEqual(errs, [], "no console exceptions or 404s");
  H.cleanup(); console.log(`PASS: combat switcher (${checked} switches by tap/Enter at 1280/390/340/320, all 22 at 1280; no sideways scroll)`); process.exit(0);
})().catch(e => { console.error("FAIL", e.message || e); H.cleanup(); process.exit(1); });
