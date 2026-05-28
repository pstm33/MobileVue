# Production Plan

## Current State

- Public PWA is live: `https://pwa.tagam.delivery/`.
- Real Tagam restaurant feed, menu, cart, checkout and guest order creation are wired.
- Android debug APK, unsigned release APK and release AAB build successfully.
- Store listing draft and screenshots are prepared in `release/`.

## Time To Production

### PWA

Estimated: 1-2 hours.

- Final manual checkout on phone-sized viewport.
- Decide whether real order creation stays enabled for public users.
- Add analytics/error logging if required.
- Confirm domain/caching policy in FastPanel.

### Android Internal Test

Estimated: 4-8 hours after receiving Play Console access and signing choice.

- Create or receive release signing keystore.
- Set `versionCode` and `versionName`.
- Add production Firebase `google-services.json` if push notifications are needed.
- Upload AAB to internal testing.
- Fill privacy/data safety/store listing forms.

### Android Public Release

Estimated: 1-3 days after internal test is accepted.

- Run closed/internal test pass on real Android devices.
- Fix Play policy warnings if any.
- Publish production rollout.

## Remaining Product Block

- Real order history screen from Tagam customer order endpoints.
- Real tracking status mapping instead of the current prepared tracking UI.
- Favorites/reorder retention loop.
- Coupon/reward surfaces if the Tagam backend has active campaign endpoints.
- Push notification registration once Firebase production config is available.
