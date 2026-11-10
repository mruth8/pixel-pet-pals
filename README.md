# Pixel Pet Pals: OSRS activity companion

Free, non-commercial. **Not affiliated with Jagex.** No Jagex assets; all art original.

Milestone 1: event format v1, mock sender, placeholder widget with one pet (from a swappable pack).

```
node relay/server.js                 # reference relay + widget on http://127.0.0.1:8787 (loopback only)
node mock-sender/send.js             # emits sample events (--url, --interval, --secret, --player, --once, --only woodcutting|mining|fishing|combat|banking)
open http://localhost:8787/widget/   # widget; ?pet=<pack id, see docs/pack-format-v1.md> &variant=red &size=compact &player= &stream= &packs=
npm test                             # pack + relay smoke tests
node --experimental-websocket test/browser-check.js   # headless Chrome; screenshots -> screenshots/ (gitignored)
node --experimental-websocket test/site-check.js      # serves site/ alone at /matthew/osrs/pixel-pet-pals/; screenshots/site.png
```
Optional shared secret: `PET_SECRET=s node relay/server.js` + `--secret s` on the sender (header `X-Pet-Secret`).

Layout: `docs/event-format-v1.md`, `schema/` (JSON Schema + TS types), `shared/validate.js`, `relay/`, `mock-sender/`, `widget/` (card styled from the approved design mockup), `packs/` (12 pets as of v0.4.0 + dev placeholder; format in `docs/pack-format-v1.md`, `schema/pack-v1.schema.json`).

## Designed-in for the plugin MVP (milestone 2)
- **Outbound only to a user-set URL**: sender takes the URL as config; relay is the receiving side, never inside the plugin.
- **Opt-in + third-party data warning**: plugin config must default off and show: "Enabling sends your in-game activity (name, activity, optional location) to the URL you set, a third-party server not controlled by Jagex or RuneLite." Region is optional in the schema so it can be hidden.
- **"Not affiliated with Jagex"** shown in the widget, README, and to go on plugin/site.
- **Pets are packs**: `packs/<id>/manifest.json` (`pixel-pet-pals/pack@1`), optional `facing` and `variants`. Swap via `?pet=` / `?variant=`; no code changes.

## Relay network exposure
The relay binds to **127.0.0.1 only** by default, so it's unreachable from your LAN. To expose it (e.g. OBS on another PC, or a server), opt in with `PET_HOST=0.0.0.0 node relay/server.js` (or `--host 0.0.0.0`) and set `PET_SECRET` so only your plugin can post events. Note: `/state` and `/stream` stay readable without the secret.

## Progress page
`site/` is a self-contained static page (relative paths only, resolved via `<base href="/matthew/osrs/pixel-pet-pals/">` so the URL works with or without a trailing slash; change that one line to host elsewhere) for mrruth.com/matthew/osrs/pixel-pet-pals/. It embeds live widget demos via `site/widget.html?packs=packs&pet=...&demo=<type|category>&ago=<min>`. Packs and widget assets are copied in, so re-copy them after changing `packs/` or `widget/`.

### Tests & site sync
- `scripts/sync-site.sh` re-copies widget/shared/packs into `site/`. Activity GIFs, previews and activities.json are excluded, and refs to unshipped files (e.g. `activities.map.*.gif`) are stripped from the manifest copies by `scripts/site-manifest-refs.js`. `test/site-sync.js` enforces both and fails if any `site/` manifest references a missing file.
- Test ports come from env, else a free port: `BROWSER_PORT`, `SITE_PORT`, `SMOKE_PORT`, `UNIT_PORT`, `CHROME_DEBUG_PORT`. Tests always kill the Chrome they start (exit/signal handlers in `test/harness.js`), and on startup sweep stale test Chromes identified only by our temp-profile (`ppp-test-chrome-*`) or legacy test command-line markers (`NO_CHROME_SWEEP=1` disables).
