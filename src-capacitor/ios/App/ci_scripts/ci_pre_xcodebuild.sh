#!/bin/bash
set -euo pipefail

echo "== Xcode Cloud: pre-xcodebuild check =="

if [ -n "${CI_PRIMARY_REPOSITORY_PATH:-}" ]; then
  REPO_ROOT="$CI_PRIMARY_REPOSITORY_PATH"
else
  REPO_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
fi

IOS_DIR="$REPO_ROOT/src-capacitor/ios/App"
PODS_XCCONFIG="$IOS_DIR/Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

if [ ! -d "$REPO_ROOT/src-capacitor/www" ]; then
  echo "Capacitor web assets are missing; building them now"
  cd "$REPO_ROOT"
  npm ci
  cd "$REPO_ROOT/src-capacitor"
  npm ci
  cd "$REPO_ROOT"
  npx quasar build -m capacitor -T ios -s
fi

if [ ! -f "$PODS_XCCONFIG" ]; then
  echo "CocoaPods xcconfig is missing; syncing Capacitor and installing pods now"
  cd "$REPO_ROOT/src-capacitor"
  npx cap sync ios
  cd "$IOS_DIR"
  pod install
fi

test -d "$REPO_ROOT/src-capacitor/www"
test -d "$IOS_DIR/Pods"
test -f "$PODS_XCCONFIG"
test -f "$IOS_DIR/App.xcworkspace/contents.xcworkspacedata"
test -f "$IOS_DIR/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
test -f "$IOS_DIR/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png"

xcodebuild -list -workspace "$IOS_DIR/App.xcworkspace"

echo "Pre-xcodebuild check completed"
