#!/bin/bash
set -euo pipefail

echo "== Xcode Cloud: TAGAM pre-xcodebuild check =="
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IOS_DIR="$REPO_ROOT/ios/App"

test -d "$IOS_DIR/App/public"
test -d "$IOS_DIR/Pods"
test -f "$IOS_DIR/Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig"
test -f "$IOS_DIR/App.xcworkspace/contents.xcworkspacedata"
test -f "$IOS_DIR/App/GoogleService-Info.plist"

xcodebuild -list -workspace "$IOS_DIR/App.xcworkspace"
echo "Pre-xcodebuild check completed"
