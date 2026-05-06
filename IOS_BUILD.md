# iOS build notes

This project is a Quasar/Vue app wrapped with Capacitor.

## Current app settings

- App id: `com.tagam.delivery`
- App name: `Tagam Delivery`
- API base URL: `https://tagam.delivery`
- Capacitor web directory: `src-capacitor/www`
- iOS project: `src-capacitor/ios/App/App.xcworkspace`

## Windows preparation

Use the bundled portable Node 20 for Capacitor 7 commands:

```powershell
$env:PATH="C:\Users\ps\Documents\KRMS\MobileVue\.tools\node20;$env:PATH"
npm install
cd src-capacitor
npm install
npx cap sync ios
```

You can build and sync the web assets on Windows:

```powershell
$env:PATH="C:\Users\ps\Documents\KRMS\MobileVue\.tools\node20;$env:PATH"
npx quasar build -m capacitor -T ios
```

On Windows this stops at `xcrun xcodebuild`, because Xcode only exists on macOS. The generated iOS project and synced web assets are still valid.

## macOS final build

On a Mac with a supported Xcode, Node 20, and CocoaPods installed:

```bash
brew install node@20 cocoapods
export PATH="$(brew --prefix node@20)/bin:$PATH"
npm ci
cd src-capacitor
npm ci
npx quasar build -m capacitor -T ios -s
npx cap sync ios
cd ios/App
pod install
open App.xcworkspace
```

In Xcode, set the Apple Developer Team, signing, bundle identifier, version/build number, push notification capabilities if needed, then archive and upload to App Store Connect.

## Xcode Cloud setup

The repository includes Xcode Cloud custom scripts:

- `ci_scripts/ci_post_clone.sh`
- `ci_scripts/ci_pre_xcodebuild.sh`

The post-clone script installs npm dependencies, builds Quasar web assets into `src-capacitor/www`, syncs Capacitor iOS, and runs `pod install`. The pre-xcodebuild script verifies that the generated web assets, CocoaPods workspace, and shared scheme are present before Apple starts the archive.

Use these workflow settings in App Store Connect:

- Repository: `pstm33/MobileVue`
- Workspace: `src-capacitor/ios/App/App.xcworkspace`
- Scheme: `App`
- Xcode: latest available Xcode 26 or newer
- Team: Apple Developer Team for `com.tagam.delivery`

Required Apple-side setup:

- App Store Connect app record with bundle ID `com.tagam.delivery`
- App ID and provisioning profile, or automatic signing enabled
- Push Notifications capability and iOS `GoogleService-Info.plist` if iPhone push notifications are required

## Notes from vendor documentation

The mobile documentation focuses on PWA and Android setup. It requires setting the Mobile API URL and Mobile API key in `src/api/config.js`, plus Google/Firebase/social-login credentials when those features are enabled. This project already points to `https://tagam.delivery`.
