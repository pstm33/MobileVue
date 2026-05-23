# KMRS Customer App Migration and Visual Direction

## Non-negotiables

- Use real KMRS server data only.
- Do not add mock restaurants, mock orders, mock users, or silent fallback payloads.
- If an endpoint is not connected yet, the screen must show a loading, empty, or actionable error state.
- Preserve all customer-facing logic from the original `MobileVue` app before adding new behavior.
- Keep admin/server credentials outside the repository and outside client bundles.

## Legacy Scope

The original customer app contains:

- 78 page-level Vue files.
- 147 shared Vue components.
- 18 Pinia stores.
- 60+ routed screens and nested flows.
- Major domains: onboarding, language, location, feed, search, menu, cart, checkout, payments, order tracking, bookings, account, wallet, favorites, chat, notifications, reviews, legal pages, and PWA/update handling.

## Migration Strategy

Rebuild the app as a new Vue 3 + Vite + TailwindCSS + Capacitor 7 client while using the old app as the functional contract.

1. API discovery
   - Confirm the real mobile API base URL from server/admin configuration.
   - Verify `getSettings`, `getAttributes`, `getBanner`, merchant feed, menu, cart, auth, checkout, order tracking, wallet, and chat endpoints.
   - Document request shape, auth headers, and response shape per endpoint.

2. Data layer
   - Port `APIinterface.js` into smaller domain modules.
   - Replace Quasar storage with a native storage adapter.
   - Replace Quasar notify/dialog/loading with custom app services.
   - Remove fallback assignments such as empty merchant lists that hide endpoint failures.

3. Functional parity
   - Recreate each legacy route in the new router.
   - Recreate each store domain with the same server behavior.
   - Keep route names and URL patterns where they matter for deep links/payment callbacks.

4. Visual rebuild
   - Replace each Quasar page with a custom Tailwind view.
   - Build one reusable design system for buttons, sheets, modals, cards, tabs, filters, inputs, skeletons, toasts, and empty states.
   - Keep touch targets large and mobile-first.

5. Verification
   - Test every screen against real server data.
   - Create temporary demo orders/customers only when needed, then delete them from admin.
   - Verify Android/iOS Capacitor flows after web parity is stable.

## Current Progress

- Confirmed the real mobile API base as `https://tagam.delivery/interface`.
- Confirmed public mobile endpoints require a bearer API token; the token is stored only in local `.env.local`.
- Connected the new Vue/Vite/Tailwind client to the live KMRS API.
- Cold-start onboarding now mirrors the original app flow: three intro screens, then location selection before home.
- Location selection now uses a real map picker with draggable/clickable pin, GPS, manual coordinates, and live `reverseGeocoding`.
- Checkout "change location" opens the map picker and returns to checkout after confirmation.
- Home/feed now renders the real merchant list for the current demo coordinates.
- Restaurant detail now renders live merchant data and menu categories/items from KMRS.
- Verified `#/restaurant/fireitup` against real data: 5 categories and 22 menu items.
- Product detail bottom sheet now loads live `getMenuItem` data.
- Add-to-cart now calls live `addCartItems`, stores the returned cart UUID locally, and refreshes real cart state.
- Cart page now loads live `getCart`, shows real cart items, supports quantity update, remove item, and clear cart.
- Checkout page now loads live checkout cart payload, service modes, delivery time state, address, tips, promo availability, payment readiness, and totals.
- Guest auth bridge now calls live `registerGuestUser`, stores `client_identity/client_token`, reloads authenticated cart, and unlocks payment list.
- Payment selection now follows the legacy chain: `PaymentList`, `SavedPaymentProvider`, `SavedPaymentList`, then a `payment_uuid` in the local `PlaceOrder` preview.
- Checkout now shows a local `PlaceOrder` payload preview while keeping real order creation disabled.
- Final `PlaceOrder` is intentionally disabled until payload/auth/payment are verified.
- Verified production build with `npm run build`.

## Confirmed Endpoint Shapes

- Merchant feed requires location context; without coordinates the server returns a missing location error.
- `POST /interface/reverseGeocoding` works with `lat` and `lng` and is used before entering the feed.
- `GET /interface/getMerchantInfo` works with `slug`, `currency_code`, `latitude`, `longitude`, and `cart_uuid`.
- `POST /interface/geStoreMenu` works with `slug` and `currency_code`.
- `POST /interface/getMenuItem` works with `slug`, `cat_id`, `item_uuid`, and `currency_code`.
- `POST /interface/addCartItems` returns the server cart UUID used by later cart/checkout calls.
- `POST /interface/getCart` returns cart details in `details.data`.
- `POST /interface/updateCartItems`, `removeCartItem`, and `clearCart` work with the server cart UUID.
- `POST /interface/setTransactionType`, `setDeliveryNow`, `loadTips`, and `loadPromo` are connected for checkout preparation.
- `POST /interface/registerGuestUser` accepts JSON guest details and returns `user_data`, `user_token`, and `user_settings`.
- Authenticated checkout cart/payment calls use `Authorization: token <client_token>` as in the original app.
- `POST /interface/SavedPaymentProvider` creates/enables a payment provider for the merchant.
- `POST /interface/SavedPaymentList` returns `default_payment_uuid`, which is required by `PlaceOrder`.

## Visual Direction: "Tagam Night Market"

The app should feel premium, fast, local, and memorable. The direction is not a Quasar/Material reskin; it is a custom food-commerce interface inspired by the strongest patterns from Wolt, Deliveroo, Uber Eats, and DoorDash.

### Design Language

- Base theme: deep dark graphite, not flat black.
- Accent system: fresh mint/emerald for primary actions, warm coral for offers, cyan for live tracking, amber for loyalty/rewards.
- Surfaces: restrained glass only for key overlays and navigation, with solid high-contrast cards for food content.
- Imagery: real merchant and food photos dominate cards; UI decoration stays secondary.
- Motion: fast 160-240ms transitions, springy bottom sheets, subtle card lift, live tracking pulse, cart morph animation.
- Typography: compact, high-confidence headings; dense but readable operational screens.

### Home and Discovery

- Address and delivery mode are first-class at the top.
- Search is persistent and thumb-friendly.
- Restaurant lists should prioritize: open status, ETA, delivery fee, rating, price level, promos, and minimum order.
- Category chips are horizontal and sticky when scrolling.
- Offers appear as editorial strips, not generic banners.
- No duplicate carousels that make categories unclear.

### Restaurant and Menu

- Merchant hero with real photo, open status, rating, ETA, fee, minimum order, and favorite action.
- Sticky category tabs for menu navigation.
- Menu item cards expose price clearly, badges separately, and customization state.
- Item detail opens as a bottom sheet with image gallery, required/optional modifiers, allergens, quantity, notes, and add-to-cart CTA.
- Cart preview remains sticky after the first item.

### Cart and Checkout

- Checkout should be one focused flow with editable line items.
- Delivery address, delivery time, promo, tips, payment, wallet/points, and total breakdown must be visible without hunting.
- Errors should be inline and precise: closed merchant, invalid address, missing modifier, payment issue, delivery unavailable.
- Keep payment callbacks and provider-specific flows compatible with KMRS.

### Order Tracking

- Use an Uber Eats-like live order lifecycle: accepted, preparing, courier assigned, picked up, nearby, delivered.
- Map is the primary surface when location data exists.
- Show ETA countdown, courier contact/chat, order support, and delay/cancellation reasons.
- Tracking should explain what changed, not just show a status word.

### Retention

- DoorDash-like reorder shortcuts from order history.
- Points/wallet visibility on home and checkout.
- Promo shelf based on real server promos.
- Favorites, saved restaurants, saved addresses, and saved payment methods should feel fast and prominent.
- Push notification opt-in should be contextual, not a cold prompt.

## Initial Route Groups to Rebuild

1. Onboarding and language
2. Location and address selection
3. Home/feed/offers/browse
4. Search and filters
5. Restaurant/menu/item detail
6. Cart and checkout
7. Payments and wallet
8. Order success, tracking, cancellation, review
9. Account/profile/settings
10. Favorites, notifications, chat
11. Booking/table reservation
12. Legal/update/network states

## Next Implementation Layer

1. Cart hardening
   - Add cross-merchant cart replacement confirmation.
   - Add edit-item flow from cart using live cart row data.
   - Add inline loading states per cart row.

2. Auth and payment bridge
   - Add full login/signup screens and OTP handling.
   - Add required delivery address completion before enabling delivery order creation.
   - Verify callback URLs and then enable guarded real `PlaceOrder` for COD only.
