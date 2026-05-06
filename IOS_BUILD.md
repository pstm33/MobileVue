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

Prepared macOS VM:

- macOS host: `192.168.1.31`
- Project copy: `/Users/Shared/MobileVue`
- Node: `/opt/tools/node20`
- Homebrew: `/usr/local/bin/brew`
- CocoaPods: `/usr/local/bin/pod`

The VM currently has Command Line Tools only. A full `/Applications/Xcode.app` is still required before `pod install`, `xcodebuild`, archive, signing, and upload can finish.

After installing Xcode, run:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
cd /Users/Shared/MobileVue
export PATH=/opt/tools/node20/bin:/usr/local/bin:$PATH
npm ci
cd src-capacitor
npm ci
npx cap sync ios
cd ios/App
pod install
open App.xcworkspace
```

In Xcode, set the Apple Developer Team, signing, bundle identifier, version/build number, push notification capabilities if needed, then archive and upload to App Store Connect.

## Notes from vendor documentation

The mobile documentation focuses on PWA and Android setup. It requires setting the Mobile API URL and Mobile API key in `src/api/config.js`, plus Google/Firebase/social-login credentials when those features are enabled. This project already points to `https://tagam.delivery`.
