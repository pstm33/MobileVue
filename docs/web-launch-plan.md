# TAGAM Web Launch Plan

## Current Staging

- Staging URL: `https://demo-pwa.tagam.delivery`
- Static root: `/var/www/fastuser/data/www/pwa.tagam.delivery`
- Current production Tagam root: `/var/www/fastuser/data/www/tagam.delivery`
- Tagam admin must stay on PHP: `/backoffice`

## Safe Production Routing

When the web build is ready for `tagam.delivery`, keep Tagam as the backend and route only customer-facing web paths to the new PWA.

Keep these paths on the existing Tagam PHP app:

- `/backoffice`
- `/upload`
- `/assets`
- `/themes`
- `/interface`
- `/api`
- `/apilocations`
- `/apibooking`
- `/apibookingv2`
- `/chatapi`
- `/payv1`
- `/wallet/upload_deposit`
- `/cron`

Route these paths to the new static web build:

- `/`
- `/home`
- `/search`
- `/restaurant/*`
- `/cart`
- `/checkout`
- `/orders`
- `/order/success`
- `/order/details`
- `/tracking`
- `/account`
- `/profile`
- `/addresses`
- `/payments`
- `/favourites`
- `/offers`
- `/categories`
- `/wallet`
- `/points`
- `/booking`
- `/notifications`
- `/legal`

Keep legacy customer app aliases as redirects inside the PWA:

- `/home/offers`
- `/home/browse`
- `/feed`
- `/view/categories`
- `/account/:section`

## Rollback

Every staging deploy should keep a timestamped backup:

`/var/www/fastuser/data/www/pwa.tagam.delivery.backup-YYYYMMDD_HHMMSS`

To rollback staging, replace `/var/www/fastuser/data/www/pwa.tagam.delivery` with the latest backup and keep ownership as `fastuser:fastuser`.

## Verification Before Main Domain

- `npm run build`
- Open `/`, `/home`, `/search`, `/restaurant/{real-slug}`, `/cart`
- Confirm direct URL refresh works without `#/`
- Confirm Tagam API calls still hit `https://tagam.delivery`
- Confirm `/backoffice` stays served by the PHP app
- Confirm `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml` are available
- Confirm PWA JS/CSS load from `/pwa-assets`, not `/assets`, so Tagam admin assets remain untouched
- Confirm `/offers` does not redirect to `/home`
- Confirm `/wallet`, `/points`, and `/favourites` show auth state cleanly when logged out
