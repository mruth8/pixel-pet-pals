// Combat row on the pet cards (layout 1A): mage, ranged and melee spec buttons under walk/sleep/happy/party.
// Data-driven: a card opts in with data-pack (+ data-variant); the row appears only if that pack's manifest has a
// `combat` block (PPPPack.resolveCombat), so a pet gains combat by adding frames plus a manifest entry.
// Moves play in their own preview stage under the row; the big top picture always stays the plain pet.
(function () {
  "use strict";
  var P = window.PPPPack;
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) { if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function build(card, packDir, combat) {
    var scale = innerWidth < 340 ? 3 : 4; // crisp integer scale: 64x34 -> 256x136 (192x102 on very narrow phones)
    // Start on a real frame (the stage is hidden until a click) so the page never holds a src-less, "broken" image.
    var stageImg = el("img", { src: packDir + combat.moves[0].frameFiles[0], width: combat.frameWidth * scale, height: combat.frameHeight * scale, alt: "" });
    var cap = el("p", { "class": "combat-cap", "aria-live": "polite" });
    var stage = el("div", { "class": "combat-stage", "data-combat-stage": "" }, [stageImg, cap]);
    stage.hidden = true;
    var row = el("div", { "class": "anims three" });
    var buttons = [], run = 0;
    combat.moves.forEach(function (mv) {
      // Preload every frame so playback never flashes an empty stage.
      mv.frameFiles.forEach(function (f) { new Image().src = packDir + f; });
      var b = el("button", { type: "button", "class": "combat-btn", "data-move": mv.id, "aria-pressed": "false",
        "aria-label": "Play " + mv.label + (mv.title ? ": " + mv.title : "") },
        [el("img", { src: packDir + mv.thumb, width: (combat.thumbWidth || 32) * 2, height: (combat.thumbHeight || 32) * 2, alt: "" }),
         el("span", { "class": "cap", text: mv.label })]);
      b.addEventListener("click", function () { play(mv, b); });
      buttons.push(b);
      row.appendChild(el("figure", {}, [b]));
    });
    function play(mv, btn) {
      var me = ++run, t0 = performance.now(), last = -2;
      buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === btn)); x.classList.toggle("on", x === btn); });
      stage.hidden = false; stage.setAttribute("data-playing", mv.id); card.setAttribute("data-combat-playing", mv.id);
      (function tick(now) {
        if (me !== run) return; // a newer click took over
        var i = P.combatFrameAt(mv, now - t0);
        if (i === -1) { // finished: hold the last frame briefly, then clear the stage
          setTimeout(function () {
            if (me !== run) return;
            stage.hidden = true; stage.removeAttribute("data-playing"); card.removeAttribute("data-combat-playing");
            buttons.forEach(function (x) { x.setAttribute("aria-pressed", "false"); x.classList.remove("on"); });
          }, 450);
          return;
        }
        if (i !== last) {
          last = i; stageImg.src = packDir + mv.frameFiles[i]; stage.setAttribute("data-frame", String(i));
          stageImg.alt = (mv.title || mv.label) + (mv.captions ? ": " + mv.captions[i] : "");
          cap.textContent = (mv.title || mv.label) + (mv.captions ? " · " + mv.captions[i] : "");
        }
        requestAnimationFrame(tick);
      })(t0);
    }
    var box = el("div", { "class": "combat", "data-combat": "" }, [el("div", { "class": "combat-h", text: "Combat" }), row, stage]);
    card.querySelector(".anims").insertAdjacentElement("afterend", box);
  }
  document.querySelectorAll("article.pet[data-pack]").forEach(function (card) {
    var id = card.getAttribute("data-pack"), packDir = "packs/" + id + "/";
    fetch(packDir + "manifest.json").then(function (r) { return r.ok ? r.json() : null; }).then(function (m) {
      var c = m && P.validatePack(m).length === 0 ? P.resolveCombat(m, card.getAttribute("data-variant")) : null;
      if (c) build(card, packDir, c); // no combat frames: no row at all
    }).catch(function () { /* a missing manifest just means no Combat row */ });
  });
})();
