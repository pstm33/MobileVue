# Tagam Customer (com.tagam.tmrs.customer)

Customer-facing Tagam food delivery app.

## Release build notes

- `npm run build` and `npm run build:pwa` produce the production PWA bundle in `dist/pwa`.
- `npm run build:spa` produces a standard SPA bundle in `dist/spa` (used only for local non-PWA checks).
- `npm run release:app` builds PWA, deploys `dist/pwa` to `app.tagam.app`, and immediately runs parity verification (`verify:app`).
- `npm run release:app:quick` builds and deploys only (no verification step).
- `scripts/deploy-tagam-app.ps1` supports key-based and password-based SSH:
  - `.\scripts\deploy-tagam-app.ps1 -NoBuild -Password "..."` (password mode, Posh-SSH).
  - `.\scripts\deploy-tagam-app.ps1 -NoBuild -KeyFile "path\to\key"` (key mode).
- If you see mismatches between `app.tagam.app` and local build previews, first check that deployment used `dist/pwa` and that `/manifest.json` is present.

## Deployment checks

- `npm run verify:app` - checks that `app.tagam.app` serves `/manifest.json`, service workers, and the same main entry references as local `dist/pwa`.
- `npm run release:app` - one-command release flow (runs PWA build, then `scripts/deploy-tagam-app.ps1`).

If you still see:

- `manifest.json` 404
- old rescue `sw.js` content

that means production still serves legacy SPA artifacts and needs redeploy.
