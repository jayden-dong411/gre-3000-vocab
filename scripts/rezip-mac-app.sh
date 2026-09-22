#!/usr/bin/env bash
# electron-builder's Linux zip follows framework symlinks and triples Chromium.
# Re-pack with Info-ZIP -y so Current -> A stays a link.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
version="$(node -p "require('$root/package.json').version")"
app="$root/release/mac-arm64/GRE 3000.app"
zipfile="$root/release/GRE 3000-${version}-arm64-mac.zip"
if [[ ! -d "$app" ]]; then
  echo "missing $app" >&2
  exit 1
fi
rm -f "$zipfile"
(cd "$root/release/mac-arm64" && zip -ry9 "$zipfile" "GRE 3000.app")
ls -lh "$zipfile"
