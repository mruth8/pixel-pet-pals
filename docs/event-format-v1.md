# Event format v1

Open JSON format the RuneLite plugin (milestone 2) POSTs to a **user-set URL**. Machine-readable: `schema/event-v1.schema.json` (JSON Schema 2020-12), TypeScript: `schema/event-v1.d.ts`, runtime check: `shared/validate.js`.

| field | req | notes |
|---|---|---|
| `v` | yes | Always `1`. Receivers must reject unknown versions; breaking changes bump it. |
| `player` | yes | RSN or alias (1–64 chars). Widget shows it. |
| `ts` | yes | ISO 8601 timestamp. |
| `type` | yes | `activity, level_up, loot, death, pet_drop, quest, login, logout, idle, heartbeat` |
| `activity` | no | `{category, skill?, target?, region?}`; category ∈ `skilling, combat, bossing, banking, traveling, minigame, idle`. `region` is optional so the plugin can hide location. |
| `detail` | no | Type-specific object. Conventions: `level_up {skill, level}`, `loot {item, value, rare}`, `pet_drop {pet}`, `quest {name}`. |

`heartbeat` is an addition to the spec list for the 60 s keep-alive.

Transport: HTTP POST, `Content-Type: application/json`, optional `X-Pet-Secret` header (shared secret). Outbound only from the plugin; no local server in the plugin.

Example:
```json
{"v":1,"player":"Matthew","ts":"2026-10-12T19:50:00Z","type":"activity",
 "activity":{"category":"skilling","skill":"Woodcutting","target":"Yew tree"},"detail":{}}
```
