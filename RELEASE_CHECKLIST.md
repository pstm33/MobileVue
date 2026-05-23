# Tagam Delivery Release Checklist

## Build Status

- Web production build: passed with `npm run build`.
- KMRS image preparation: passed with `npm run assets:kmrs`.
- Dependency audit: passed with `npm audit --audit-level=high`, 0 vulnerabilities.
- Capacitor Android sync: passed with `npx cap sync android`.
- Android debug APK: built successfully.
- Android unsigned release APK and release AAB: built successfully.
- Production preview smoke test: passed on `http://127.0.0.1:4173`.

## Generated Artifacts

- Web zip: `release/tagam-delivery-web-dist.zip`
- Android debug APK: `release/tagam-delivery-debug.apk`
- Android unsigned release APK: `release/tagam-delivery-release-unsigned.apk`
- Android release bundle: `release/tagam-delivery-release.aab`
- QA/store screenshots: `release/screenshots/` and `release/tagam-delivery-screenshots.zip`
- Store listing text draft: `STORE_LISTING_DRAFT.md`
- Live public PWA: `https://pwa.tagam.delivery/`

## Verified Flows

- Home feed loads real KMRS restaurants and cuisine filters.
- Restaurant menu loads real KMRS menu and item images.
- Cart accepts real menu item additions.
- Checkout loads cart, address, tips, summary and auth bridge.
- Guest/auth-gated payment loading no longer shows a premature `Network Error`.
- Real KMRS `PlaceOrder` test succeeded and was visible in backoffice as order #89.
- Russian/Turkmen/English global copy no longer contains mojibake.
- Public PWA smoke test passed for onboarding, location, home, restaurant, cart, checkout, account and tracking.
- Leaflet marker assets are present on the public PWA and no 404 resources were found in the final smoke test.
- Android launcher icons use Tagam assets, not default Capacitor icons.
- Android manifest includes internet and location permissions.

## Web Deploy To FastPanel

1. Run:
   ```powershell
   npm run assets:kmrs
   npm run build
   ```
2. Upload the contents of `dist` or unpack `release/tagam-delivery-web-dist.zip` into the target web root.
3. Keep SPA/hash routing as-is. The app uses `/#/...`, so no special rewrite is required.
4. Confirm that `.env.local` is not uploaded. Vite embeds only public `VITE_*` build values.
5. Verify:
   - `/#/onboarding`
   - `/#/location`
   - `/#/home`
   - `/#/search?q=Р±СѓСЂРіРµСЂ`
   - `/#/restaurant/fireitup`
   - `/#/cart`
   - `/#/checkout`

The current build can be uploaded to the server as a staged release. Before activating `pwa.tagam.delivery`, create a backup of the current live PWA and reload nginx only after `nginx -t` passes.

## Android Publication Blockers

- A real release signing keystore is required for Play Console.
- Production Firebase `google-services.json` is required before push notifications can work.
- Store listing assets are still needed: screenshots, privacy policy URL, short description and long description.
- Decide the release flag before building:
  - `VITE_ENABLE_PLACE_ORDER=true` for a real production ordering build.
  - `VITE_ENABLE_PLACE_ORDER=false` for a demo build that cannot create orders.

## Server-Side Caution

The app uses real KMRS data. Real order creation works. Use test customers/orders only when QA intentionally needs server mutation.
