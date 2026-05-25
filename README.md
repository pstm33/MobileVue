# Tagam Delivery Customer App

Customer app для KMRS backend.

Стек: Vue 3 + Vite + TailwindCSS + Capacitor 7.

## Команды

```powershell
npm install
npm run assets:kmrs
npm run build
npx cap sync android
.\android\gradlew.bat -p android assembleDebug assembleRelease bundleRelease
```

## Environment

Скопировать `.env.example` в `.env.local` и указать публичный KMRS API token.

`VITE_ENABLE_PLACE_ORDER=true` включает реальное создание заказов через KMRS `PlaceOrder`.
Для визуальных демо, где нельзя менять данные на сервере, держать `false`.

## Заметки KMRS

- Схема статусов заказа: [docs/order-status-flow.md](docs/order-status-flow.md)
- Аудит расхождений с коробкой: [docs/functionality-gap-audit.md](docs/functionality-gap-audit.md)

## Release outputs

Готовые артефакты копируются в `release/`:

- `tagam-delivery-web-dist.zip`
- `tagam-delivery-debug.apk`
- `tagam-delivery-release-unsigned.apk`
- `tagam-delivery-release.aab`
