#!/bin/sh
set -euo pipefail

echo "== Xcode Cloud: pre-xcodebuild check =="

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IOS_DIR="$REPO_ROOT/src-capacitor/ios/App"

test -d "$REPO_ROOT/src-capacitor/www"
test -d "$IOS_DIR/Pods"
test -f "$IOS_DIR/App.xcworkspace/contents.xcworkspacedata"
test -f "$IOS_DIR/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
test -f "$IOS_DIR/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png"

xcodebuild -list -workspace "$IOS_DIR/App.xcworkspace"

echo "Pre-xcodebuild check completed"
