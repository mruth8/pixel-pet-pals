#!/usr/bin/env bash
# Re-copy the widget, shared code and packs into site/ (self-contained static page).
# Excluded (not used by the page): activities/gifs/, activities/preview.png, activities/activities.json, packs.js, placeholder pack.
# test/site-sync.js enforces the same rules.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf site/packs && mkdir -p site/packs site/widget/fonts site/shared
for d in packs/*/; do p=$(basename "$d"); [ "$p" = placeholder-blob ] && continue; [ -f "$d/manifest.json" ] || continue
  cp -r "$d" "site/packs/$p"; done
find site/packs -path '*/activities/gifs' -type d -prune -exec rm -rf {} +
find site/packs -path '*/activities/*' \( -name preview.png -o -name activities.json \) -delete
cp widget/widget.js widget/widget.css site/widget/ && cp widget/fonts/PixelifySans.ttf site/widget/fonts/ && cp shared/pack.js shared/status.js site/shared/
echo "site/ synced"
