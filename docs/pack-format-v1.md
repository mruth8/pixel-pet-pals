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
| `defaultVariant` | variant id used by default | baby-chinchompa: `grey`, youngllef: `corrupted` |

## Frame size (tall packs)
`sheet.frameWidth`/`frameHeight` may differ: v0.4.0 has 32x40 packs (`olmlet`, `butch`). The widget picks the largest integer scale that fits its stage (`fitScale`): 32x32 gets 3px per source pixel in the overlay and 2px in compact, and 32x40 gets 2px and 1px. Feet stay on the stage floor and nothing is cropped. Tall cards also get the class `tall`.

Shipped (12 pets + dev placeholder):
- **v0.3.0:** `baby-mole` (left); `baby-chinchompa` (right; grey default, red, black, gold).
- **v0.4.0:** `olmlet` (left, 32x40; in the compact card, 32x40 pets get an extra crisp CSS scale of 1.6x to fill the 64px stage), `heron`, `rocky`, `phoenix`, `beef`, `lilviathan` (left), `youngllef` (left; corrupted default, crystal), `lil-zik`, `abyssal-orphan` (front), `butch` (front, 32x40).
- `placeholder-blob` (dev).

`packs/packs.js` is the designer's file:// mockup bundle (all manifests inlined); the widget and relay don't use it.
