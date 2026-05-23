# Tagam Delivery Customer App

Vue 3 + Vite + TailwindCSS + Capacitor 7 customer app for the KMRS backend.

## Commands

```powershell
npm install
npm run assets:kmrs
npm run build
npx cap sync android
.\android\gradlew.bat -p android assembleDebug assembleRelease bundleRelease
```

## Environment

Copy `.env.example` to `.env.local` and set the KMRS public API token.

`VITE_ENABLE_PLACE_ORDER=true` enables real order creation through KMRS `PlaceOrder`.
Keep it `false` for visual demos that must not mutate server data.

## Release Outputs

Prepared artifacts are copied into `release/`:

- `tagam-delivery-web-dist.zip`
- `tagam-delivery-debug.apk`
- `tagam-delivery-release-unsigned.apk`
- `tagam-delivery-release.aab`
