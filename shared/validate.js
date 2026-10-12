// Dependency-free validator mirroring schema/event-v1.schema.json (works in Node and browser).
(function (root) {
  const TYPES = ["activity","level_up","loot","death","pet_drop","quest","login","logout","idle","heartbeat"];
  const CATS = ["skilling","combat","bossing","banking","traveling","minigame","idle"];
  function validateEventV1(e) {
    const err = [];
    if (!e || typeof e !== "object" || Array.isArray(e)) return ["event must be an object"];
    for (const k of Object.keys(e)) if (!["v","player","ts","type","activity","detail"].includes(k)) err.push("unknown field " + k);
    if (e.v !== 1) err.push("v must be 1");
    if (typeof e.player !== "string" || !e.player || e.player.length > 64) err.push("player must be 1-64 chars");
    if (typeof e.ts !== "string" || isNaN(Date.parse(e.ts))) err.push("ts must be ISO 8601");
    if (!TYPES.includes(e.type)) err.push("bad type");
    if (e.activity !== undefined) {
      const a = e.activity;
      if (!a || typeof a !== "object") err.push("activity must be object");
      else {
        if (!CATS.includes(a.category)) err.push("bad activity.category");
        for (const k of ["skill","target","region"]) if (a[k] !== undefined && typeof a[k] !== "string") err.push("activity." + k + " must be string");
        for (const k of Object.keys(a)) if (!["category","skill","target","region"].includes(k)) err.push("unknown activity." + k);
      }
    }
    if (e.detail !== undefined && (typeof e.detail !== "object" || e.detail === null || Array.isArray(e.detail))) err.push("detail must be object");
    return err;
  }
  if (typeof module !== "undefined") module.exports = { validateEventV1, TYPES, CATS };
  else root.validateEventV1 = validateEventV1;
})(this);
