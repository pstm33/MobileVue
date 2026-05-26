#!/bin/bash
set -euo pipefail

echo "== Xcode Cloud: post-clone setup =="

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

if command -v brew >/dev/null 2>&1; then
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [ "$NODE_MAJOR" -lt 20 ] || [ "$NODE_MAJOR" -gt 22 ]; then
    echo "Installing Node 20 with Homebrew"
    brew list node@20 >/dev/null 2>&1 || retry 3 20 brew install node@20
    export PATH="$(brew --prefix node@20)/bin:$PATH"
  fi

  if ! command -v pod >/dev/null 2>&1; then
    echo "Installing CocoaPods with Homebrew"
    retry 3 20 brew install cocoapods
  fi
fi

if ! command -v pod >/dev/null 2>&1; then
  echo "Installing CocoaPods with RubyGems"
  export GEM_HOME="$HOME/.gem"
  export PATH="$GEM_HOME/bin:$PATH"
  retry 3 20 gem install cocoapods --no-document --user-install
fi

if ! command -v pod >/dev/null 2>&1; then
  echo "CocoaPods is not available after installation attempts" >&2
  exit 1
fi

echo "Node: $(node -v)"
echo "NPM: $(npm -v)"
echo "Ruby: $(ruby -v)"
echo "CocoaPods: $(pod --version)"

echo "Installing web dependencies"
retry 3 20 npm ci

echo "Building Vue/Vite bundle"
retry 3 30 npm run build

echo "Preparing iOS asset catalog"
APPICON_DIR="$REPO_ROOT/ios/App/App/Assets.xcassets/AppIcon.appiconset"
SPLASH_DIR="$REPO_ROOT/ios/App/App/Assets.xcassets/Splash.imageset"
mkdir -p "$APPICON_DIR" "$SPLASH_DIR"

if command -v sips >/dev/null 2>&1; then
  sips -z 1024 1024 "$REPO_ROOT/public/icons/facebook-app-icon-1024.png" --out "$APPICON_DIR/AppIcon-512@2x.png" >/dev/null
  sips -z 2732 2732 "$REPO_ROOT/public/iconsplash.png" --out "$SPLASH_DIR/splash-2732x2732.png" >/dev/null
else
  cp "$REPO_ROOT/public/icons/facebook-app-icon-1024.png" "$APPICON_DIR/AppIcon-512@2x.png"
  cp "$REPO_ROOT/public/iconsplash.png" "$SPLASH_DIR/splash-2732x2732.png"
fi

cp "$SPLASH_DIR/splash-2732x2732.png" "$SPLASH_DIR/splash-2732x2732-1.png"
cp "$SPLASH_DIR/splash-2732x2732.png" "$SPLASH_DIR/splash-2732x2732-2.png"

echo "Syncing Capacitor iOS project"
retry 3 30 npx cap sync ios

echo "Installing iOS pods"
cd "$REPO_ROOT/ios/App"
retry 3 30 pod install

echo "Xcode Cloud post-clone setup completed"
