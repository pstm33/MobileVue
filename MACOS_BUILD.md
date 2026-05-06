# macOS build

This project uses Quasar Electron mode to package the existing Vue app as a macOS desktop app.

## First setup

Run this once after pulling these changes:

```bash
npm install
```

## Development

```bash
npm run dev:electron
```

## Build macOS app

On macOS:

```bash
npm run build:mac
```

The unsigned app is created under:

```text
dist/electron/
```

## Notes

- Android/Capacitor remains unchanged.
- Final code signing, notarization, and App Store distribution require macOS, Xcode command line tools, and an Apple Developer account.
- Mobile-only features such as native push notifications, camera, native audio, and Capacitor settings may need Electron-specific adapters if they are required on desktop.
