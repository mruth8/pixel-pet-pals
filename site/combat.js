// Combat row on the pet cards (layout 1A): mage, ranged and melee spec buttons under walk/sleep/happy/party.
// Data-driven: a card opts in with data-pack (+ data-variant); the row appears only if that pack's manifest has a
// `combat` block (PPPPack.resolveCombat), so a pet gains combat by adding frames plus a manifest entry.
// Moves play in their own preview stage under the row; the big top picture always stays the plain pet.
// The "Combat" section's card has a pet/colour picker (data-combat-picker) that swaps the whole card.
(function () {
  "use strict";
  var P = window.PPPPack, manifests = {};
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) { if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function manifest(id) {
    if (!manifests[id]) manifests[id] = fetch("packs/" + id + "/manifest.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    return manifests[id];
  }
  function build(card, packDir, combat) {
    var scale = innerWidth < 340 ? 3 : 4; // crisp integer scale: 64x34 -> 256x136, 64x42 -> 256x168 (3x on very narrow phones)
    // Start on a real frame (the stage is hidden until a click) so the page never holds a src-less, "broken" image.
    var stageImg = el("img", { src: packDir + combat.moves[0].frameFiles[0], width: combat.frameWidth * scale, height: combat.frameHeight * scale, alt: "" });
    var cap = el("p", { "class": "combat-cap", "aria-live": "polite" });
    var stage = el("div", { "class": "combat-stage", "data-combat-stage": "" }, [stageImg, cap]);
    stage.hidden = true;
    var row = el("div", { "class": "anims three" });
    var buttons = [], run = 0, cache = {};
    // Preload every frame; playback only moves to a frame once it has loaded, so the stage never flashes empty.
    function pre(f) { if (!cache[f]) { cache[f] = new Image(); cache[f].src = packDir + f; } return cache[f]; }
    function loaded(f) { var i = pre(f); return i.complete && i.naturalWidth > 0; }
    combat.moves.forEach(function (mv) {
      mv.frameFiles.forEach(pre);
      var b = el("button", { type: "button", "class": "combat-btn", "data-move": mv.id, "aria-pressed": "false",
        "aria-label": "Play " + mv.label + (mv.title ? ": " + mv.title : "") },
        [el("img", { src: packDir + mv.thumb, width: (combat.thumbWidth || 32) * 2, height: (combat.thumbHeight || 32) * 2, alt: "" }),
         el("span", { "class": "cap", text: mv.label })]);
      b.addEventListener("click", function () { play(mv, b); });
      buttons.push(b);
      row.appendChild(el("figure", {}, [b]));
    });
    function play(mv, btn) {
      var me = ++run, frame = -1, start = 0;
      buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === btn)); x.classList.toggle("on", x === btn); });
      card.setAttribute("data-combat-playing", mv.id);
      function show(i, now) {
        frame = i; start = now; stageImg.src = packDir + mv.frameFiles[i];
        stage.hidden = false; stage.setAttribute("data-playing", mv.id); stage.setAttribute("data-frame", String(i));
        stageImg.alt = (mv.title || mv.label) + (mv.captions ? ": " + mv.captions[i] : "");
        cap.textContent = (mv.title || mv.label) + (mv.captions ? " · " + mv.captions[i] : "");
      }
      (function tick(now) {
        if (me !== run || !stage.isConnected) return; // a newer click (or a pet switch) took over
        var next = frame === -1 ? 0 : P.combatNextFrame(mv, frame, now - start);
        if (next === -1) { // finished: hold the last frame briefly, then clear the stage
          setTimeout(function () {
            if (me !== run) return;
            stage.hidden = true; stage.removeAttribute("data-playing"); card.removeAttribute("data-combat-playing");
            buttons.forEach(function (x) { x.setAttribute("aria-pressed", "false"); x.classList.remove("on"); });
          }, 450);
          return;
        }
        if (next !== frame && loaded(mv.frameFiles[next])) show(next, now); // otherwise hold until it has loaded
        requestAnimationFrame(tick);
      })(performance.now());
    }
    var box = el("div", { "class": "combat", "data-combat": "" }, [el("div", { "class": "combat-h", text: "Combat" }), row, stage]);
    card.querySelector(".anims").insertAdjacentElement("afterend", box);
  }
  // (Re)build a card's Combat row from its data-pack/data-variant. Resolves to true when a row was added.
  function mount(card) {
    var old = card.querySelector("[data-combat]"); if (old) old.remove();
    card.removeAttribute("data-combat-playing");
    var id = card.getAttribute("data-pack"), variant = card.getAttribute("data-variant") || undefined, token = id + "/" + (variant || "");
    card.setAttribute("data-combat-for", token);
    return manifest(id).then(function (m) {
      if (card.getAttribute("data-combat-for") !== token) return false; // switched again meanwhile
      var c = m && P.validatePack(m).length === 0 ? P.resolveCombat(m, variant) : null;
      if (c) build(card, "packs/" + id + "/", c); // no combat frames: no row at all
      card.setAttribute("data-combat-ready", c ? "row" : "none");
      return !!c;
    });
  }
  // Picker card: swap the plain previews (hero + walk/sleep/happy/party), name and colour, then remount the row.
  function choose(card, value) {
    var parts = value.split("/"), id = parts[0], variant = parts[1] || "";
    card.removeAttribute("data-combat-ready");
    return manifest(id).then(function (m) {
      if (!m) return;
      var v = (m.variants || []).find(function (x) { return x.id === variant; }) || null;
      var base = "packs/" + id + "/" + (v ? "variants/" + v.id + "/" : "") + "previews/";
      var hero = card.querySelector(".hero-gif"), hh = m.sheet.frameHeight * 4;
      hero.src = base + "idle.gif"; hero.setAttribute("height", String(hh));
      hero.alt = m.name + (v ? " (" + v.name + ")" : "") + " idle animation";
      card.querySelector("h3").textContent = m.name;
      card.querySelector(".sub").textContent = v && v.name !== m.name ? v.name : "";
      ["walk", "sleep", "happy", "celebrate"].forEach(function (a, i) { card.querySelectorAll(".anims:not(.three) img")[i].src = base + a + ".gif"; });
      card.setAttribute("data-pack", id);
      if (v) card.setAttribute("data-variant", v.id); else card.removeAttribute("data-variant");
      return mount(card);
    });
  }
  document.querySelectorAll("article.pet[data-pack]").forEach(mount);
  document.querySelectorAll("[data-combat-picker]").forEach(function (sel) {
    var card = sel.closest("article.pet");
    sel.addEventListener("change", function () { choose(card, sel.value); });
  });
})();
