#!/bin/bash
set -euo pipefail

echo "== Xcode Cloud: TAGAM Quasar setup =="
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$REPO_ROOT"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

retry() {
  local attempts="$1"
  local delay="$2"
  shift 2
  local attempt=1
  until "$@"; do
    local status=$?
    if [ "$attempt" -ge "$attempts" ]; then
      echo "Command failed after $attempt attempts: $*" >&2
      return "$status"
    fi
    echo "Command failed with exit code $status. Retrying in ${delay}s ($attempt/$attempts): $*" >&2
    sleep "$delay"
    attempt=$((attempt + 1))
  done
}

strip_bom() {
  python3 - "$@" <<'PY'
import pathlib
import sys

for item in sys.argv[1:]:
    path = pathlib.Path(item)
    if path.exists():
        data = path.read_bytes()
        if data.startswith(b"\xef\xbb\xbf"):
            path.write_bytes(data[3:])
            print(f"Removed UTF-8 BOM from {path}")
PY
}

patch_xcode_cloud_podfile() {
  python3 - "$REPO_ROOT/ios/App/Podfile" <<'PY'
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
text = text.replace("../../node_modules/", "../../src-capacitor/node_modules/")
path.write_text(text, encoding="utf-8")
print(f"Patched Capacitor pod paths in {path}")
PY
}

if command -v brew >/dev/null 2>&1; then
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [ "$NODE_MAJOR" -lt 20 ] || [ "$NODE_MAJOR" -gt 22 ]; then
    brew list node@20 >/dev/null 2>&1 || retry 3 20 brew install node@20
    export PATH="$(brew --prefix node@20)/bin:$PATH"
  fi
  command -v pod >/dev/null 2>&1 || retry 3 20 brew install cocoapods
fi

if ! command -v pod >/dev/null 2>&1; then
  export GEM_HOME="$HOME/.gem"
  export PATH="$GEM_HOME/bin:$PATH"
  retry 3 20 gem install cocoapods --no-document --user-install
fi

echo "Node: $(node -v)"
echo "NPM: $(npm -v)"
echo "CocoaPods: $(pod --version)"

retry 3 20 npm ci
strip_bom "$REPO_ROOT/src-capacitor/ios/App/App.xcodeproj/project.pbxproj" "$REPO_ROOT/ios/App/App.xcodeproj/project.pbxproj"
retry 3 30 npx quasar build -m capacitor -T ios --skip-pkg

cd "$REPO_ROOT/src-capacitor"
strip_bom "$REPO_ROOT/src-capacitor/ios/App/App.xcodeproj/project.pbxproj"
retry 3 30 npx cap sync ios
cd "$REPO_ROOT"

rm -rf "$REPO_ROOT/ios"
mkdir -p "$REPO_ROOT/ios"
cp -R "$REPO_ROOT/src-capacitor/ios/." "$REPO_ROOT/ios/"
strip_bom "$REPO_ROOT/ios/App/App.xcodeproj/project.pbxproj"
patch_xcode_cloud_podfile

cd "$REPO_ROOT/ios/App"
retry 3 30 pod install

echo "Xcode Cloud TAGAM setup completed"
