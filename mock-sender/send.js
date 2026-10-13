// Mock event sender: emits sample v1 events to a configurable URL (stand-in for the RuneLite plugin).
// Activities (v0.5 packs): woodcutting, mining, fishing (skilling + skill), combat, banking (category).
// --only woodcutting|mining|fishing|combat|banking sends just that one event.
// Usage: node mock-sender/send.js [--url http://localhost:8787/events] [--interval 3000] [--secret s] [--player Matthew] [--once]
const { validateEventV1 } = require("../shared/validate");
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : (process.env["PET_" + k.toUpperCase()] || d); };
const URL_ = arg("url", "http://localhost:8787/events"), INTERVAL = +arg("interval", 3000);
const SECRET = arg("secret", ""), PLAYER = arg("player", "Matthew"), ONCE = process.argv.includes("--once");
const script = [
  { type: "login" },
  { type: "activity", activity: { category: "skilling", skill: "Woodcutting", target: "Yew tree" } },
  { type: "level_up", detail: { skill: "Woodcutting", level: 70 } },
  { type: "activity", activity: { category: "skilling", skill: "Mining", target: "Iron rocks" } },
  { type: "activity", activity: { category: "skilling", skill: "Fishing", target: "Lobsters" } },
  { type: "activity", activity: { category: "combat", target: "Hill Giant" } },
  { type: "activity", activity: { category: "banking" } },
  { type: "activity", activity: { category: "traveling", region: "Varrock" } },
  { type: "activity", activity: { category: "bossing", target: "Vorkath" } },
  { type: "loot", detail: { item: "Draconic visage", value: 4000000, rare: true } },
  { type: "pet_drop", detail: { pet: "Vorki" } },
  { type: "idle", activity: { category: "idle" } },
  { type: "logout" },
];
async function send(step) {
  const ev = { v: 1, player: PLAYER, ts: new Date().toISOString(), ...step };
  const errs = validateEventV1(ev); if (errs.length) throw new Error(errs.join("; "));
  const headers = { "content-type": "application/json" }; if (SECRET) headers["x-pet-secret"] = SECRET;
  const r = await fetch(URL_, { method: "POST", headers, body: JSON.stringify(ev) });
  console.log(r.status, ev.type, ev.activity?.category || "");
}
const ONLY = arg("only", "");
const ONLY_MAP = { woodcutting: 1, mining: 3, fishing: 4, combat: 5, banking: 6 };
(async () => {
  if (ONLY) { if (!(ONLY in ONLY_MAP)) throw new Error("unknown --only " + ONLY); await send(script[ONLY_MAP[ONLY]]); return; }
  for (let i = 0; ; i = (i + 1) % script.length) {
    await send(script[i]).catch(e => console.error("send failed:", e.message));
    if (ONCE && i === script.length - 1) break;
    await new Promise(r => setTimeout(r, INTERVAL));
  }
})();
