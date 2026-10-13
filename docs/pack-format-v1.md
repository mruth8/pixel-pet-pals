# Pet pack format (`pixel-pet-pals/pack@1`)

Machine-readable: `schema/pack-v1.schema.json`; runtime checks: `shared/pack.js` (`validatePack`, `resolveSheet`, `needsFlip`).
Format and art come from the approved design packs (`design/packs/README.md`); the packs are copied unchanged into `packs/<id>/`.

Required: `schema`, `id` (= folder name), `name`, `sheet {file, frameWidth, frameHeight, columns, rows, layout}`, `animations` with `idle, walk, sleep, happy, celebrate` (`row, frames, fps, loop`).
Common: `activityMap` (activity.category -> animation), `eventMap` (event type -> animation), `default`, `anchor`, `offset`, `scale`, `license`.

## Optional fields
| field | meaning | widget behaviour |
|---|---|---|
| `facing` | `"left"`, `"right"` or `"front"` (default `right`; `front` added in v0.4.0) | The status text sits to the right of the pet, so left-facing art is mirrored (`scaleX(-1)`) to face the text. Right and front art is never mirrored. |
| `variants` | `[{id, name, sheet, paletteColors}]`: colourways with identical layout | `?variant=<id>` picks one. Unknown or missing values fall back to `defaultVariant`, then `sheet.file`. |
| `defaultVariant` | variant id used by default | baby-chinchompa: `grey`, youngllef: `corrupted`, lil-zik: `zik` |
| `variants[].facing`, `variants[].animations` | optional (v6): a form with its own frames | lil-zik `sot` faces left and lists its own `animations` (same row/frames/fps as the top level, own `frameFiles`). When a variant lists its own `sheet`, `animations`, `activities` or `facing` the widget uses them; anything it omits comes from the top level, so colour-swap variants behave as before. Resolved by `resolveVariant()` in `shared/pack.js`. |

## Frame size (tall packs)
`sheet.frameWidth`/`frameHeight` may differ: v0.4.0 has 32x40 packs (`olmlet`, `butch`). The widget picks the largest integer scale that fits its stage (`fitScale`): 32x32 gets 3px per source pixel in the overlay and 2px in compact, and 32x40 gets 2px and 1px. Feet stay on the stage floor and nothing is cropped. Tall cards also get the class `tall`.

Shipped (12 pets + dev placeholder):
- **v0.3.0:** `baby-mole` (left); `baby-chinchompa` (right; grey default, red, black, gold).
- **v0.4.0:** `olmlet` (left, 32x40; in the compact card, 32x40 pets get an extra crisp CSS scale of 1.6x to fill the 64px stage), `heron`, `rocky`, `phoenix`, `beef`, `lilviathan` (left), `youngllef` (left; corrupted default, crystal), `lil-zik`, `abyssal-orphan` (front), `butch` (front, 32x40).
- `placeholder-blob` (dev).

`packs/packs.js` is the designer's file:// mockup bundle (all manifests inlined); the widget and relay don't use it.

## Activities (optional, v0.5.0, additive)
Packs may add an `activities` block, at the top level and/or per variant (`variants[].activities`; the variant's own block wins). Manifests without it stay valid and behave as before.

```json
"activities": { "sheet": "activities/activities.png", "frameWidth": 32, "frameHeight": 32, "layout": "row-per-activity",
  "gearTier": "rune", "propSide": "left", "paletteColors": 15, "fallback": "activityMap",
  "map": { "woodcutting": {"row":0,"frames":6,"fps":8,"loop":true}, "mining": {...}, "fishing": {...}, "combat": {...}, "banking": {...} } }
```
- `frameWidth`/`frameHeight` must match `sheet` (32x40 packs have 32x40 activity frames). Grid: `columns` = max frames, `rows` = max row + 1 (overridable).
- `paletteColors` counts **prop colours only**: colours in the activities sheet that aren't in the pet's own sheet for that variant. Max 16. `test/packs.js` recounts it from the PNGs.
- `gearTier` `rune`|`dragon` (Youngllef crystal uses dragon), `propSide` `left`|`right`, and the optional `gif` per map entry are informational.
- **Widget fallback:** for an `activity` event, `activities.map[activity.skill (lower-cased) || activity.category]` plays from the activities sheet, else `activityMap[activity.category]` with the base animations, else `default`. Other events still use `eventMap`.
  - Example: `{category:"skilling", skill:"Woodcutting"}` → woodcutting; `{category:"combat"}` → combat; `{category:"banking"}` → banking; `{category:"bossing"}` or `{skill:"Cooking"}` → activityMap.
