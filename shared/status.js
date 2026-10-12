// Status-line text for a v1 event. Shared by the widget (browser) and tests (Node).
(function (root) {
  const VERB = { Woodcutting: "Chopping", Fishing: "Fishing", Mining: "Mining", Cooking: "Cooking" };
  function statusText(e) {
    const a = e.activity || {};
    switch (e.type) {
      case "login": return "Logged in"; case "logout": return "Logged out (sleeping)";
      case "idle": return "Idle (sleeping)"; case "level_up": return `Level up! ${e.detail?.skill || ""} ${e.detail?.level || ""}`;
      case "loot": return `Loot: ${e.detail?.item || "something"}`; case "pet_drop": return `Pet drop: ${e.detail?.pet || "!"}`;
      case "death": return "Oh dear, died"; case "quest": return (e.detail?.name ? `Quest: ${e.detail.name}` : "Quest complete!");
    }
    if (a.category === "skilling") return `${VERB[a.skill] || a.skill || "Skilling"} ${a.target || ""}`.trim();
    if (a.category === "bossing" || a.category === "combat") return `Fighting ${a.target || "monsters"}`;
    if (a.category === "traveling") return `Traveling${a.region ? " to " + a.region : ""}`;
    return a.category ? a.category[0].toUpperCase() + a.category.slice(1) : e.type;
  }
  const api = { statusText };
  if (typeof module !== "undefined") module.exports = api; else root.PPPStatus = api;
})(this);
