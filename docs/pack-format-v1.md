# Pet pack format (`pixel-pet-pals/pack@1`)

Machine-readable: `schema/pack-v1.schema.json`; runtime checks: `shared/pack.js` (`validatePack`, `resolveSheet`, `needsFlip`).
Format and art come from the approved design packs (`design/packs/README.md`); the packs are copied unchanged into `packs/<id>/`.

Required: `schema`, `id` (= folder name), `name`, `sheet {file, frameWidth, frameHeight, columns, rows, layout}`, `animations` with `idle, walk, sleep, happy, celebrate` (`row, frames, fps, loop`).
Common: `activityMap` (activity.category -> animation), `eventMap` (event type -> animation), `default`, `anchor`, `offset`, `scale`, `license`.

## Optional fields
| field | meaning | widget behaviour |
|---|---|---|
| `facing` | `"left"` or `"right"` (default `right`): which way the art faces | The status text sits to the right of the pet, so left-facing art is mirrored (`scaleX(-1)`) to face the text. |
| `variants` | `[{id, name, sheet, paletteColors}]`: colourways with identical layout | `?variant=<id>` picks one. Unknown or missing values fall back to `defaultVariant`, then `sheet.file`. |
| `defaultVariant` | variant id used by default | baby-chinchompa: `grey` |

Shipped: `olmlet` (full-body, faces left), `baby-mole` (faces left), `baby-chinchompa` (faces right; grey default, red, black, gold), `placeholder-blob` (dev).
