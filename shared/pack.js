// Pack helpers shared by widget (browser) and tests (Node): validation, variant + facing resolution.
(function (root) {
  const BASE = ["idle", "walk", "sleep", "happy", "celebrate"];
  function validatePack(m) {
    const e = [];
    if (!m || m.schema !== "pixel-pet-pals/pack@1") e.push("schema must be pixel-pet-pals/pack@1");
    if (!m || typeof m.id !== "string") return e.concat("id required");
    const s = m.sheet || {};
    for (const k of ["file", "frameWidth", "frameHeight", "columns", "rows"]) if (s[k] === undefined) e.push("sheet." + k + " required");
    for (const a of BASE) if (!m.animations || !m.animations[a]) e.push("animation " + a + " required");
    for (const [n, a] of Object.entries(m.animations || {})) if (a.row >= s.rows || a.frames > s.columns) e.push("animation " + n + " outside sheet");
    if (m.facing !== undefined && !["left", "right", "front"].includes(m.facing)) e.push("facing must be left|right|front");
    if (m.variants !== undefined) {
      if (!Array.isArray(m.variants)) e.push("variants must be array");
      else for (const v of m.variants) {
        if (!v.id || !v.sheet) e.push("variant needs id and sheet");
        if (v.facing !== undefined && !["left", "right", "front"].includes(v.facing)) e.push("variants." + v.id + ".facing must be left|right|front");
        // Optional own frames (v6): same layout as the base animations (row/frames/fps identical), own frameFiles.
        if (v.animations !== undefined) for (const a of BASE) { const x = v.animations[a], b = (m.animations || {})[a];
          if (!x) e.push("variants." + v.id + ".animations." + a + " required");
          else if (b && (x.row !== b.row || x.frames !== b.frames || x.fps !== b.fps)) e.push("variants." + v.id + ".animations." + a + " must match the base row/frames/fps"); }
      }
      if (m.defaultVariant && !(m.variants || []).some(v => v.id === m.defaultVariant)) e.push("defaultVariant not in variants");
    }
    // Optional `activities` blocks (v0.5.0): top level and/or per variant. paletteColors counts PROP colours only (<=16).
    const blocks = [["activities", m.activities]].concat((m.variants || []).map(v => ["variants." + v.id + ".activities", v.activities]));
    for (const [where, a] of blocks) if (a !== undefined) for (const x of validateActivities(a, s)) e.push(where + ": " + x);
    return e;
  }
  function activitiesGrid(a) {
    const vals = Object.values(a.map || {});
    return { columns: a.columns || Math.max(1, ...vals.map(x => x.frames)), rows: a.rows || Math.max(1, ...vals.map(x => x.row + 1)) };
  }
  function validateActivities(a, sheet) {
    const e = [];
    if (!a || typeof a !== "object") return ["must be an object"];
    if (typeof a.sheet !== "string") e.push("sheet required");
    if (a.frameWidth !== undefined && a.frameWidth !== sheet.frameWidth) e.push("frameWidth must match sheet.frameWidth");
    if (a.frameHeight !== undefined && a.frameHeight !== sheet.frameHeight) e.push("frameHeight must match sheet.frameHeight");
    if (a.paletteColors !== undefined && !(Number.isInteger(a.paletteColors) && a.paletteColors >= 0 && a.paletteColors <= 16)) e.push("paletteColors (prop colours only) must be an integer 0-16");
    if (a.layout !== undefined && a.layout !== "row-per-activity") e.push("layout must be row-per-activity");
    if (a.fallback !== undefined && a.fallback !== "activityMap") e.push("fallback must be activityMap");
    if (a.gearTier !== undefined && !["rune", "dragon"].includes(a.gearTier)) e.push("gearTier must be rune|dragon");
    if (!a.map || typeof a.map !== "object" || !Object.keys(a.map).length) e.push("map required");
    else for (const [k, x] of Object.entries(a.map)) {
      if (k !== k.toLowerCase()) e.push("map key " + k + " must be lowercase");
      if (!Number.isInteger(x.row) || !Number.isInteger(x.frames) || !(x.fps > 0)) e.push("map." + k + " needs row, frames, fps");
    }
    return e;
  }
  // Activities block for the chosen variant (variant's own, else top level).
  function resolveActivities(m, variant) {
    const vs = m.variants || [];
    const v = vs.find(x => x.id === variant) || vs.find(x => x.id === m.defaultVariant);
    return (v && v.activities) || m.activities || null;
  }
  // Fallback chain: activities.map[skill || category] -> activityMap[category] -> default.
  function pickActivity(m, acts, activity) {
    const keys = [activity && activity.skill, activity && activity.category].filter(Boolean).map(k => String(k).toLowerCase());
    for (const k of keys) if (acts && acts.map && acts.map[k]) return { source: "activities", key: k, anim: acts.map[k] };
    const name = (m.activityMap && activity && m.activityMap[activity.category]) || m.default || "idle";
    return { source: "base", key: m.animations[name] ? name : (m.default || "idle") };
  }
  // Requested variant -> manifest default -> sheet.file.
  function resolveSheet(m, variant) {
    const vs = m.variants || [];
    const v = vs.find(x => x.id === variant) || vs.find(x => x.id === m.defaultVariant);
    return { file: v ? v.sheet : m.sheet.file, variant: v ? v.id : null };
  }
  // Effective pack for a variant (v6): a variant's own sheet, animations, activities and facing win; anything it
  // doesn't list falls back to the top level (plain colour-swap variants only list a sheet). Requested -> defaultVariant.
  function resolveVariant(m, variant) {
    const vs = m.variants || [];
    const v = vs.find(x => x.id === variant) || vs.find(x => x.id === m.defaultVariant) || null;
    if (!v) return { variant: null, file: m.sheet.file, animations: m.animations, activities: m.activities || null, facing: m.facing || "right", m };
    const animations = v.animations ? Object.assign({}, m.animations, v.animations) : m.animations;
    const facing = v.facing || m.facing || "right";
    return { variant: v.id, file: v.sheet || m.sheet.file, animations, activities: v.activities || m.activities || null, facing,
      m: Object.assign({}, m, { animations, facing, activities: v.activities || m.activities }) };
  }
  // Text sits to the right of the pet, so the pet should face right.
  // "front"-facing art is symmetric enough to never mirror.
  function needsFlip(m, textSide = "right") { const f = m.facing || "right"; return f !== "front" && f !== textSide; }
  // Largest integer scale that fits the stage; taller frames (e.g. 32x40) drop a step so nothing is cropped.
  function fitScale(m, maxK, stageW, stageH) { let k = maxK; while (k > 1 && (m.sheet.frameWidth * k > stageW || m.sheet.frameHeight * k > stageH)) k--; return k; }
  const api = { validatePack, validateActivities, resolveSheet, resolveActivities, pickActivity, activitiesGrid, needsFlip, fitScale, resolveVariant };
  if (typeof module !== "undefined") module.exports = api; else root.PPPPack = api;
})(this);
