#!/bin/bash
set -euo pipefail

echo "== Xcode Cloud: TAGAM Quasar setup =="
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
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
retry 3 30 npx quasar build -m capacitor -T ios --skip-pkg

cd "$REPO_ROOT/src-capacitor"
retry 3 30 npx cap sync ios
cd "$REPO_ROOT"

IOS_SRC="$REPO_ROOT/src-capacitor/ios/App"
INFO_PLIST="$IOS_SRC/App/Info.plist"
ENTITLEMENTS="$IOS_SRC/App/App.entitlements"
PBXPROJ="$IOS_SRC/App.xcodeproj/project.pbxproj"
FACEBOOK_APP_ID="1010492511527363"
FACEBOOK_URL_SCHEME="fb${FACEBOOK_APP_ID}"

echo "Applying TAGAM iOS native metadata"
/usr/libexec/PlistBuddy -c "Set :FacebookAppID ${FACEBOOK_APP_ID}" "$INFO_PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :FacebookAppID string ${FACEBOOK_APP_ID}" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Set :FacebookClientToken ${TAGAM_FACEBOOK_CLIENT_TOKEN:-f45eedf16fabcb347a88ca2ae2069ca0}" "$INFO_PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :FacebookClientToken string ${TAGAM_FACEBOOK_CLIENT_TOKEN:-f45eedf16fabcb347a88ca2ae2069ca0}" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Set :FacebookDisplayName Tagam Delivery" "$INFO_PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :FacebookDisplayName string Tagam Delivery" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Delete :LSApplicationQueriesSchemes" "$INFO_PLIST" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :LSApplicationQueriesSchemes array" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Add :LSApplicationQueriesSchemes:0 string fbapi" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Add :LSApplicationQueriesSchemes:1 string fb-messenger-share-api" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Add :LSApplicationQueriesSchemes:2 string fbauth2" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Add :LSApplicationQueriesSchemes:3 string fbshareextension" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Delete :CFBundleURLTypes" "$INFO_PLIST" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes array" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0 dict" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLName string facebook" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes array" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string ${FACEBOOK_URL_SCHEME}" "$INFO_PLIST"

cat > "$ENTITLEMENTS" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.developer.applesignin</key>
	<array>
		<string>Default</string>
	</array>
</dict>
</plist>
EOF

if ! grep -q "CODE_SIGN_ENTITLEMENTS = App/App.entitlements;" "$PBXPROJ"; then
  perl -0pi -e 's/(CODE_SIGN_STYLE = Automatic;\n)/$1\t\t\t\tCODE_SIGN_ENTITLEMENTS = App\\/App.entitlements;\n/g' "$PBXPROJ"
fi

rm -rf "$REPO_ROOT/ios"
mkdir -p "$REPO_ROOT/ios"
cp -R "$REPO_ROOT/src-capacitor/ios/." "$REPO_ROOT/ios/"

cd "$REPO_ROOT/ios/App"
retry 3 30 pod install

echo "Xcode Cloud TAGAM setup completed"
