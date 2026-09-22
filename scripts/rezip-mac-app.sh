#!/usr/bin/env bash
# Kept as a thin wrapper so older docs still work. Prefer pack-mac-dist.sh.
set -euo pipefail
exec bash "$(cd "$(dirname "$0")" && pwd)/pack-mac-dist.sh"
