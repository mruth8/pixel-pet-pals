# Pixel Pet Pals: OSRS activity companion

Free, non-commercial. **Not affiliated with Jagex.** No Jagex assets; all art original.

Milestone 1: event format v1, mock sender, placeholder widget with one pet (from a swappable pack).

```
node relay/server.js                 # reference relay + widget on http://localhost:8787
node mock-sender/send.js             # emits sample events (--url, --interval, --secret, --player, --once)
open http://localhost:8787/widget/   # widget; params ?stream=&pack=&pet=&player=
npm test                             # smoke test
```
Optional shared secret: `PET_SECRET=s node relay/server.js` + `--secret s` on the sender (header `X-Pet-Secret`).

Layout: `docs/event-format-v1.md`, `schema/` (JSON Schema + TS types), `shared/validate.js`, `relay/`, `mock-sender/`, `widget/` (placeholder look; final design pending in `design/`), `packs/placeholder-blob/` (dev pack: manifest + sprite sheet).

## Designed-in for the plugin MVP (milestone 2)
- **Outbound only to a user-set URL**: sender takes the URL as config; relay is the receiving side, never inside the plugin.
- **Opt-in + third-party data warning**: plugin config must default off and show: "Enabling sends your in-game activity (name, activity, optional location) to the URL you set, a third-party server not controlled by Jagex or RuneLite." Region is optional in the schema so it can be hidden.
- **"Not affiliated with Jagex"** shown in the widget, README, and to go on plugin/site.
- **Pets are packs**: `packs/<pack>/manifest.json` (id, name, spriteSheet, frameSize, animations incl. one per activity category). Swap via `?pack=`; no code changes.
