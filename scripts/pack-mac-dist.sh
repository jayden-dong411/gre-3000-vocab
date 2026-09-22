#!/usr/bin/env bash
# Stage the .app with open instructions and wrap it in tar.gz so Finder
# keeps Electron's framework symlinks (Linux zip often looks "damaged").
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
version="$(node -p "require('$root/package.json').version")"
app="$root/release/mac-arm64/GRE 3000.app"
stage="$root/release/mac-stage/GRE 3000"
tarball="$root/release/GRE-3000-${version}-arm64-mac.tar.gz"
if [[ ! -d "$app" ]]; then
  echo "missing $app" >&2
  exit 1
fi
rm -rf "$root/release/mac-stage"
mkdir -p "$stage"
cp -a "$app" "$stage/"
cat > "$stage/打开说明.txt" <<'EOF'
GRE 3000（Apple Silicon）

双击「打开应用.command」即可。

若系统提示「已损坏，无法打开」，那是未公证应用的拦截，不是文件坏了。
把 App 拖进「应用程序」后，打开「终端」，整段粘贴回车：

xattr -cr "/Applications/GRE 3000.app"
open "/Applications/GRE 3000.app"

若 App 还在下载文件夹，改成实际路径，例如：

xattr -cr ~/Downloads/GRE\ 3000/GRE\ 3000.app
open ~/Downloads/GRE\ 3000/GRE\ 3000.app
EOF
cat > "$stage/打开应用.command" <<'EOF'
#!/bin/bash
set -e
cd "$(dirname "$0")"
xattr -cr "GRE 3000.app"
open "GRE 3000.app"
EOF
chmod 755 "$stage/打开应用.command"
rm -f "$tarball" "$root/release/GRE 3000-${version}-arm64-mac.zip"
tar -C "$root/release/mac-stage" -czf "$tarball" "GRE 3000"
ls -lh "$tarball"
python3 - <<PY
import tarfile
t=tarfile.open("$tarball")
names=t.getnames()
links=[m for m in t.getmembers() if m.issym()]
print("entries", len(names), "symlinks", len(links))
assert any(n.endswith("GRE 3000.app/Contents/MacOS/GRE 3000") for n in names)
assert len(links) >= 14, links
print("ok")
PY
