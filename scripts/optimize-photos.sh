#!/usr/bin/env bash
# Regenerate the deployable photo set in public/ggoggam/ from the originals in
# assets/photos-src/.
#
# The originals are multi-megabyte camera JPEGs (up to 3024x3024); they are kept
# in the repo but never deployed. The About grid renders them at ~200 CSS px, so
# 400w covers 2x and 800w covers 3x and any future larger layout.
#
# Requires ImageMagick: brew install imagemagick
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
src="$root/assets/photos-src"
out="$root/public/ggoggam"

[ -d "$src" ] || { echo "missing $src" >&2; exit 1; }
mkdir -p "$out"
rm -f "$out"/*.webp "$out"/*.jpg

shopt -s nullglob
for f in "$src"/*.jpg; do
  base="$(basename "$f" .jpg)"
  magick "$f" -auto-orient -strip -resize 800x800^ -gravity center -extent 800x800 -quality 80 "$out/${base}-800.webp"
  magick "$f" -auto-orient -strip -resize 400x400^ -gravity center -extent 400x400 -quality 80 "$out/${base}-400.webp"
  magick "$f" -auto-orient -strip -resize 400x400^ -gravity center -extent 400x400 -quality 82 "$out/${base}-400.jpg"
  echo "  $base"
done

echo "wrote $(du -sh "$out" | cut -f1) to public/ggoggam/"
