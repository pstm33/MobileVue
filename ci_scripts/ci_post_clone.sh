#!/bin/sh
set -euo pipefail

echo "== Xcode Cloud: post-clone setup =="

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

if command -v brew >/dev/null 2>&1; then
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [ "$NODE_MAJOR" -lt 20 ] || [ "$NODE_MAJOR" -gt 22 ]; then
    echo "Installing Node 20 with Homebrew"
    brew list node@20 >/dev/null 2>&1 || brew install node@20
    export PATH="$(brew --prefix node@20)/bin:$PATH"
  fi

  if ! command -v pod >/dev/null 2>&1; then
    echo "Installing CocoaPods with Homebrew"
    brew install cocoapods
  fi
fi

echo "Node: $(node -v)"
echo "NPM: $(npm -v)"
echo "Ruby: $(ruby -v)"
echo "CocoaPods: $(pod --version)"

echo "Installing root npm dependencies"
npm ci

echo "Installing Capacitor npm dependencies"
cd "$REPO_ROOT/src-capacitor"
npm ci

echo "Building Quasar web assets for Capacitor iOS"
cd "$REPO_ROOT"
npx quasar build -m capacitor -T ios -s

echo "Preparing iOS asset catalog images"
APPICON_DIR="$REPO_ROOT/src-capacitor/ios/App/App/Assets.xcassets/AppIcon.appiconset"
SPLASH_DIR="$REPO_ROOT/src-capacitor/ios/App/App/Assets.xcassets/Splash.imageset"
mkdir -p "$APPICON_DIR" "$SPLASH_DIR"

if command -v sips >/dev/null 2>&1; then
  sips -z 1024 1024 "$REPO_ROOT/public/icons/facebook-app-icon-1024.png" --out "$APPICON_DIR/AppIcon-512@2x.png" >/dev/null
  sips -z 2732 2732 "$REPO_ROOT/public/iconsplash.png" --out "$SPLASH_DIR/splash-2732x2732.png" >/dev/null
  cp "$SPLASH_DIR/splash-2732x2732.png" "$SPLASH_DIR/splash-2732x2732-1.png"
  cp "$SPLASH_DIR/splash-2732x2732.png" "$SPLASH_DIR/splash-2732x2732-2.png"
else
  cp "$REPO_ROOT/public/icons/facebook-app-icon-1024.png" "$APPICON_DIR/AppIcon-512@2x.png"
  cp "$REPO_ROOT/public/iconsplash.png" "$SPLASH_DIR/splash-2732x2732.png"
  cp "$SPLASH_DIR/splash-2732x2732.png" "$SPLASH_DIR/splash-2732x2732-1.png"
  cp "$SPLASH_DIR/splash-2732x2732.png" "$SPLASH_DIR/splash-2732x2732-2.png"
fi

echo "Syncing Capacitor iOS project"
cd "$REPO_ROOT/src-capacitor"
npx cap sync ios

echo "Installing iOS pods"
cd "$REPO_ROOT/src-capacitor/ios/App"
pod install

echo "Xcode Cloud post-clone setup completed"
