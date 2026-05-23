#!/bin/bash
set -euo pipefail

echo "== Xcode Cloud: pre-xcodebuild check =="

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
IOS_DIR="$REPO_ROOT/ios/App"
PODS_XCCONFIG="$IOS_DIR/Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

if [ ! -d "$REPO_ROOT/dist" ]; then
  echo "Web bundle is missing; building now"
  cd "$REPO_ROOT"
  npm ci
  npm run build
fi

if [ ! -d "$IOS_DIR/App/public" ]; then
  echo "Capacitor iOS web assets are missing; syncing now"
  cd "$REPO_ROOT"
  npx cap sync ios
fi

if [ ! -f "$PODS_XCCONFIG" ]; then
  echo "CocoaPods xcconfig is missing; installing pods now"
  cd "$IOS_DIR"
  pod install
fi

test -d "$REPO_ROOT/dist"
test -d "$IOS_DIR/App/public"
test -d "$IOS_DIR/Pods"
test -f "$PODS_XCCONFIG"
test -f "$IOS_DIR/App.xcworkspace/contents.xcworkspacedata"
test -f "$IOS_DIR/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
test -f "$IOS_DIR/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png"
test -f "$IOS_DIR/App/GoogleService-Info.plist"
test -f "$IOS_DIR/App/App.entitlements"

xcodebuild -list -workspace "$IOS_DIR/App.xcworkspace"

echo "Pre-xcodebuild check completed"
