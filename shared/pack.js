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
      else for (const v of m.variants) if (!v.id || !v.sheet) e.push("variant needs id and sheet");
      if (m.defaultVariant && !(m.variants || []).some(v => v.id === m.defaultVariant)) e.push("defaultVariant not in variants");
    }
    return e;
  }
  // Requested variant -> manifest default -> sheet.file.
  function resolveSheet(m, variant) {
    const vs = m.variants || [];
    const v = vs.find(x => x.id === variant) || vs.find(x => x.id === m.defaultVariant);
    return { file: v ? v.sheet : m.sheet.file, variant: v ? v.id : null };
  }
  // Text sits to the right of the pet, so the pet should face right.
  // "front"-facing art is symmetric enough to never mirror.
  function needsFlip(m, textSide = "right") { const f = m.facing || "right"; return f !== "front" && f !== textSide; }
  // Largest integer scale that fits the stage; taller frames (e.g. 32x40) drop a step so nothing is cropped.
  function fitScale(m, maxK, stageW, stageH) { let k = maxK; while (k > 1 && (m.sheet.frameWidth * k > stageW || m.sheet.frameHeight * k > stageH)) k--; return k; }
  const api = { validatePack, resolveSheet, needsFlip, fitScale };
  if (typeof module !== "undefined") module.exports = api; else root.PPPPack = api;
})(this);
