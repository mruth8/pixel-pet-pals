// Placeholder widget: loads a pet from a pack manifest and reacts to v1 events via SSE.
// Query params: ?stream=<SSE url>&pack=<pack dir url>&pet=<pet id>&player=<name filter>
(async function () {
  const q = new URLSearchParams(location.search);
  const STREAM = q.get("stream") || "/stream", PACK = (q.get("pack") || "/packs/placeholder-blob").replace(/\/$/, "");
  const manifest = await (await fetch(PACK + "/manifest.json")).json();
  const pet = manifest.pets.find(p => p.id === q.get("pet")) || manifest.pets[0];
  const SCALE = 3, el = document.getElementById("pet");
  el.style.backgroundImage = `url(${PACK}/${pet.spriteSheet})`;
  let anim = "sleep", frame = 0, timer, reset;
  let play = function (name) {
    const a = pet.animations[name] || pet.animations.idle; anim = name; el.dataset.anim = name;
    clearInterval(timer); frame = 0;
    const draw = () => { el.style.backgroundPosition = `-${frame * pet.frameSize.w * SCALE}px -${a.row * pet.frameSize.h * SCALE}px`; frame = (frame + 1) % a.frames; };
    el.style.backgroundSize = `${pet.sheetSize.w * SCALE}px ${pet.sheetSize.h * SCALE}px`; draw(); timer = setInterval(draw, 1000 / a.fps);
  };
  const VERB = { Woodcutting: "Chopping", Fishing: "Fishing", Mining: "Mining", Cooking: "Cooking" };
  function status(e) {
    const a = e.activity || {};
    switch (e.type) {
      case "login": return "Logged in"; case "logout": return "Logged out (sleeping)";
      case "idle": return "Idle (sleeping)"; case "level_up": return `Level up! ${e.detail?.skill || ""} ${e.detail?.level || ""}`;
      case "loot": return `Loot: ${e.detail?.item || "something"}`; case "pet_drop": return `Pet drop: ${e.detail?.pet || "!"}`;
      case "death": return "Oh dear, died"; case "quest": return `Quest: ${e.detail?.name || ""}`;
    }
    if (a.category === "skilling") return `${VERB[a.skill] || a.skill || "Skilling"} ${a.target || ""}`.trim();
    if (a.category === "bossing" || a.category === "combat") return `Fighting ${a.target || "monsters"}`;
    if (a.category === "traveling") return `Traveling${a.region ? " to " + a.region : ""}`;
    return a.category ? a.category[0].toUpperCase() + a.category.slice(1) : e.type;
  }
  function onEvent(e) {
    if (e.v !== 1) return console.warn("unsupported event version", e.v);
    if (q.get("player") && e.player !== q.get("player")) return;
    if (e.type === "heartbeat") return;
    document.getElementById("player").textContent = e.player;
    document.getElementById("status").textContent = status(e);
    clearTimeout(reset); el.classList.remove("bounce");
    const celebrate = e.type === "level_up" || e.type === "pet_drop" || (e.type === "loot" && e.detail?.rare);
    if (celebrate) { void el.offsetWidth; el.classList.add("bounce"); play("celebrate"); reset = setTimeout(() => play("happy"), 3000); }
    else if (e.type === "logout" || e.type === "idle") play("sleep");
    else if (e.type === "login" || e.type === "quest" || e.type === "loot") play("happy");
    else play(e.activity?.category || "idle");
  }
  window.__petOnEvent = onEvent;
  play("sleep");
  new EventSource(STREAM).onmessage = m => { try { onEvent(JSON.parse(m.data)); } catch (err) { console.error(err); } };
})();
