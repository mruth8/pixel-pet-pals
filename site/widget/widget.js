// Widget: loads one pet from a pack (pixel-pet-pals/pack@1) and reacts to v1 events via SSE.
(async function () {
  const q = new URLSearchParams(location.search);
  const STREAM = q.get("stream") || "/stream", PACKS = (q.get("packs") || "../packs").replace(/\/$/, "");
  const PET = q.get("pet") || "olmlet", card = document.getElementById("w"), el = document.getElementById("pet");
  const $ = id => document.getElementById(id);
  if (q.get("size") === "compact") card.classList.add("compact");
  if (q.get("bg")) document.body.classList.add("bg");
  const m = await (await fetch(`${PACKS}/${PET}/manifest.json`)).json();
  const errs = PPPPack.validatePack(m); if (errs.length) console.warn("pack issues", errs);
  const { file, variant } = PPPPack.resolveSheet(m, q.get("variant"));
  const fw = m.sheet.frameWidth, fh = m.sheet.frameHeight, compact = card.classList.contains("compact");
  // Stage interiors: overlay 96x96 (3px/src px for 32x32), compact 64x64 (2px). Tall packs drop one integer step.
  const K = PPPPack.fitScale(m, compact ? 2 : 3, compact ? 64 : 96, compact ? 64 : 96);
  card.classList.toggle("tall", fh > fw);
  // Compact + tall (e.g. 32x40 at 1x = 40px): crisp CSS upscale to fill the 64px stage (1.6x), so it matches the other pets.
  if (compact && K < 2) el.style.setProperty("--s", String(Math.min(64 / (fw * K), 64 / (fh * K), 2 / K)));
  Object.assign(el.style, { width: fw * K + "px", height: fh * K + "px",
    backgroundImage: `url(${PACKS}/${PET}/${file})`, backgroundSize: `${m.sheet.columns * fw * K}px ${m.sheet.rows * fh * K}px` });
  el.classList.toggle("flip", PPPPack.needsFlip(m));
  el.dataset.pet = m.id; el.dataset.variant = variant || ""; el.dataset.facing = m.facing || "right";
  let timer, reset, since = null;
  function play(name) {
    const a = m.animations[name] ? name : (m.default || "idle"), A = m.animations[a]; el.dataset.anim = a;
    let f = 0; clearInterval(timer);
    const draw = () => el.style.backgroundPosition = `-${f * fw * K}px -${A.row * fh * K}px`;
    draw(); timer = setInterval(() => { f = A.loop === false ? Math.min(f + 1, A.frames - 1) : (f + 1) % A.frames; draw(); }, 1000 / A.fps);
  }
  function ago(ts) {
    const s = Math.max(0, (Date.now() - Date.parse(ts)) / 1000);
    return s < 60 ? "now" : s < 3600 ? Math.floor(s / 60) + "m" : s < 86400 ? Math.floor(s / 3600) + "h" : Math.floor(s / 86400) + "d";
  }
  const tick = () => $("since").textContent = since && ["logout", "idle", "activity"].includes(card.dataset.type) ? "· " + ago(since) : "";
  setInterval(tick, 30000);
  function onEvent(e) {
    if (e.v !== 1) return console.warn("unsupported event version", e.v);
    if (q.get("player") && e.player !== q.get("player")) return;
    if (e.type === "heartbeat") return;
    $("player").textContent = e.player; $("status").textContent = PPPStatus.statusText(e);
    card.dataset.type = e.type; since = e.ts; tick();
    card.classList.toggle("off", e.type === "logout");
    clearTimeout(reset); card.classList.remove("party");
    const celebrate = e.type === "level_up" || e.type === "pet_drop" || (e.type === "loot" && e.detail?.rare);
    const anim = e.type === "activity" ? (m.activityMap?.[e.activity?.category] || m.default) : (m.eventMap?.[e.type] || m.default);
    if (celebrate) { void card.offsetWidth; card.classList.add("party"); card.querySelector(".badge").textContent = e.type === "pet_drop" ? "PET!" : e.type === "loot" ? "LOOT" : "LEVEL UP";
      play("celebrate"); reset = setTimeout(() => { card.classList.remove("party"); play("happy"); }, 3000); }
    else play(anim);
  }
  window.__petOnEvent = onEvent;
  play("sleep");
  // Static demo mode (no relay): ?demo=<type or activity category>&ago=<minutes>&target=&skill=
  const demo = q.get("demo");
  if (demo) {
    const ts = new Date(Date.now() - (+q.get("ago") || 0) * 60000).toISOString(), CATS = ["skilling","combat","bossing","banking","traveling","minigame"];
    const e = CATS.includes(demo) ? { type: "activity", activity: { category: demo, skill: q.get("skill") || undefined, target: q.get("target") || undefined } }
      : { type: demo, detail: { skill: q.get("skill") || undefined, level: +q.get("level") || undefined, pet: q.get("target") || undefined } };
    onEvent({ v: 1, player: q.get("name") || "Matthew", ts, ...e });
    if (e.type === "level_up" || e.type === "pet_drop") { clearTimeout(reset); }  // keep the party pose for the demo
    return;
  }
  const es = new EventSource(STREAM); addEventListener("pagehide", () => es.close());
  es.onmessage = ev => { try { onEvent(JSON.parse(ev.data)); } catch (err) { console.error(err); } };
})();
