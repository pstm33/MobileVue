# Паспорт текущей сессии Tagam Delivery

Дата: 2026-05-25, Asia/Ashgabat.

## Как продолжить в новом чате

Скопировать в новый чат:

```text
Продолжаем Tagam Delivery / KMRS customer app.

Workspace:
C:\Users\ps\Documents\Codex\2026-05-21\kmrs-tagam-delivery-15151-root-ias141328ia\kmrs-customer-app

Сначала прочитай docs/current-session-status.md и проверь git status/build status.
Отвечай и документы веди на русском.
```

## Основной контекст

- Проект: Tagam Delivery / KMRS customer app.
- Цель: максимально перенести функционал коробочной KMRS MobileVue, но сохранить новый ВАУ-интерфейс.
- Стек: Vue 3 + Vite + TailwindCSS + Capacitor 7.
- Рабочая папка:
  `C:\Users\ps\Documents\Codex\2026-05-21\kmrs-tagam-delivery-15151-root-ias141328ia\kmrs-customer-app`
- Оригинальная коробка:
  `C:\Users\ps\Documents\KMRS\MobileVue`
- Старые архивы:
  `C:\Users\ps\Documents\Claude\KMRS`
- Git remote: `https://github.com/pstm33/MobileVue.git`
- Текущая ветка: `tagam-vite-xcode-cloud`
- Последний функциональный HEAD публикационного прохода: `133c188`; после него паспорт обновлялся отдельными docs-коммитами. Актуальный HEAD проверять командой `git rev-parse --short HEAD`.
- В main не делать force push: `origin/main` расходится.

## Текущие версии и сборки

- Android:
  - `versionName 2.0.5`
  - `versionCode 15`
  - Новый AAB:
    `C:\Users\ps\Documents\Codex\2026-05-21\kmrs-tagam-delivery-15151-root-ias141328ia\kmrs-customer-app\android\app\build\outputs\bundle\release\app-release.aab`
  - Размер AAB: `15435994 bytes`
  - Время файла: `2026-05-26 07:43:33`
- iOS:
  - `MARKETING_VERSION = 2.0.5`
  - `CURRENT_PROJECT_VERSION = 41`
  - Xcode Cloud собирает ветку `tagam-vite-xcode-cloud`.

Проверки, выполненные перед паспортом:

```text
npm run build
npx cap sync
.\gradlew.bat bundleRelease
```

Все три команды прошли успешно. На Windows `npx cap sync` ожидаемо пропускает CocoaPods/xcodebuild.

## Google Play / Android

- Ранее был опубликован internal/closed testing build `2.0.4 (13)`.
- Затем готовилась версия `2.0.5`.
- Новый релиз для загрузки: `2.0.5 (15)`.
- В Play Console ранее была проблема с доступностью тестировщикам и ссылками. Для production/широкого доступа Google Play требует условия тестирования, включая достаточное число opted-in тестировщиков и срок тестирования. Нужно проверять актуальный статус прямо в Play Console.
- В Google OAuth:
  - Google Auth Platform: `Publishing status = In production`
  - User type: `External`
  - Android OAuth clients есть для `com.tagam.delivery`
  - SHA-1 покрыты:
    - `37:7C:14:4F:1C:66:40:18:65:4A:13:03:78:D2:C3:46:72:DD:57:3D`
    - `60:BE:A9:31:01:02:B3:9D:6B:0E:6F:4B:D6:72:AB:C9:30:A8:73:5B`
    - `B7:9A:00:0A:30:70:64:AC:8E:BE:BE:73:75:0E:48:12:E9:04:FE:77`

## Apple / iOS

- Apple Developer:
  - App ID `com.tagam.delivery` имеет capability `Sign in with Apple`.
  - Service ID `com.tagam.delivery.web` включен для Sign in with Apple.
  - Primary App ID привязан к `tagam delivery (8XA96DKR4G.com.tagam.delivery)`.
  - Return URLs есть:
    - `https://tagam.delivery/interface/app_apple_callback`
    - `https://tagam.delivery/interface/apple_callback`
- App Store Connect / TestFlight:
  - Ранее build `2.0.4 (39)` был добавлен во внутреннюю группу TestFlight Inside.
  - Затем готовился build `2.0.5 (40)`.
  - После текущих правок iOS build поднят до `2.0.5 (41)`.
  - Нужно дождаться/запустить Xcode Cloud по ветке `tagam-vite-xcode-cloud` после пуша.

## Meta / Facebook

- Meta app id: `1606418370574325`.
- Business id в URL: `2202589586867342`.
- Компания подтверждена: BANZAI END KO TOV, подтверждение от `2026-05-25`.
- Meta app `Tagam` опубликован `2026-05-25`.
- Публикация сначала блокировалась из-за недоступной публичной ссылки Google Play:
  `https://play.google.com/store/apps/details?id=com.tagam.delivery&hl=en&gl=US`
- Чтобы опубликовать Meta app, был удален Android / Google Play Store entry в Meta Developers.
- Поэтому в текущем клиентском релизе Facebook Login временно скрыт.
- Включать Facebook обратно можно только после:
  1. приложение станет публично доступно в Google Play;
  2. Android platform / Google Play Store entry будет возвращен в Meta Developers;
  3. будет снят точный валидный Android Facebook key hash с реального телефона/логов;
  4. сборка будет сделана с `VITE_ENABLE_FACEBOOK_LOGIN=true`.
- В Meta уже были hashes:
  - `YL6pMQECs51rDm9L1nKryTCoc1s=`
  - `N3wUTxxmQBhlShMDeNLDRnLdVz0=`
  - ранее также встречался `t5oACjBwZKyOvr5zdQ5IEukE/nc=`
- Hash со скрина телефона `qGc8Uz/TOEYtHg9Bo3MHMqTJFM=` невалиден: 27 символов, Meta его не сохраняет. Нужна полная строка.

Подробности: `docs/social-login-checklist.md`.

## Что изменено в коде в этой сессии

Основные изменения:

- `src/views/HomeView.vue`
  - На главной включено отображение логотипа Tagam.
- `src/stores/app.js`
  - Убраны пользовательские фразы с `KMRS`.
  - Главный hero:
    - ru: `Рестораны рядом, доставка прямо к вам.`
    - tk: `Ýakyndaky restoranlar, eltip bermek göni size.`
    - en: `Nearby restaurants, delivered to you.`
- `index.html`
  - Убраны публичные keywords `KMRS`, `Karenderia`.
- `src/services/appRuntime.js`
  - Notification channel переименован в `Tagam Delivery`.
- `src/components/auth/SocialAuthButtons.vue`
  - Apple кнопка показывается и на Android, если backend включает Apple.
  - Google init получил iOS client ID / iOS server client ID.
  - Google login использует `filterByAuthorizedAccounts: false`.
  - Facebook тексты убраны из fallback-подсказок.
  - Сетка social buttons стала динамической: 1/2/3 колонки.
- `src/stores/appSettings.js`
  - Добавлен iOS Google client:
    `85413186790-c7f0j7h7h9icgqtulo7ffp0n6c3egkt0.apps.googleusercontent.com`
  - Facebook Login выключен клиентским флагом:
    `VITE_ENABLE_FACEBOOK_LOGIN === "true"`
  - По умолчанию Facebook-кнопка скрыта.
- `ios/App/App/AppDelegate.swift`
  - Добавлены обработчики URL для Facebook/Google.
- `ios/App/App/Info.plist`
  - Добавлены URL schemes и Facebook keys.
- `android/app/build.gradle`
  - `versionCode 15`
- `ios/App/App.xcodeproj/project.pbxproj`
  - `CURRENT_PROJECT_VERSION 41`
- Документы:
  - `docs/social-login-checklist.md`
  - `docs/web-launch-plan.md`
  - `docs/nginx-production-pwa-snippet.conf`
  - `docs/current-session-status.md`
- Web/PWA файлы:
  - `public/robots.txt`
  - `public/sitemap.xml`

## Текущее состояние рабочего дерева

На момент создания паспорта есть незакоммиченные изменения во многих файлах. Это нормально: часть сделана раньше в большом функциональном проходе, часть в этой сессии.

Перед коммитом обязательно:

```powershell
git status --short
git diff --stat
npm run build
npx cap sync
cd android
.\gradlew.bat bundleRelease
```

Не откатывать чужие изменения.

## Важные продуктовые решения

- Facebook-кнопка скрыта для текущего релиза, потому что Meta app опубликован, но Android platform entry удален до публичного Google Play.
- Google и Apple остаются как social login.
- Email/гостевой вход остаются fallback.
- Глобально шрифты не уменьшать: проблема крупного текста была из-за масштабирования дисплея телефона.
- Пользовательские строки не должны показывать `KMRS`.
- Документы и пояснения вести на русском.

## Что делать дальше

### Проход после публикации Google Play, 2026-05-25

- Публичная страница Google Play для `com.tagam.delivery` открывается в регионе Туркменистан и США.
- Локальный PWA preview проверен на мобильном viewport `390x844`.
- Главная открывается, показывает 7 ресторанов, категории и русские пользовательские строки без `KMRS`.
- Поиск, профиль, адреса, заказы, wallet, points, booking, notifications и tracking открываются без критичных DOM-ошибок.
- Facebook-кнопка не показывается в проверенных guest/auth/checkout состояниях.
- Исправлено:
  - stale cart с backend-ответом `no results` теперь очищает локальный `cart_uuid` и показывает нормальную пустую корзину;
  - добавлен route alias `/auth`, ведущий на существующий `/user/login`.
- Проверен restaurant flow:
  - `/restaurant/ashgabat-burger160` открывается;
  - item sheet открывается;
  - товар добавляется в корзину;
  - корзина показывает ресторан, позицию, сумму и CTA checkout.
- Проверен checkout с реальным товаром:
  - сервисы delivery/pickup/takeout видны;
  - guest/auth блок виден;
  - адрес, время, чаевые, промо/баллы, summary и комментарий видны;
  - финальное оформление заказа не нажималось, чтобы не создать боевой заказ без явной команды.
- Следующий checkout-проход:
  - guest checkout дошел до состояния перед финальной отправкой заказа;
  - для зарегистрированного телефона backend корректно показывает понятное сообщение, что номер уже зарегистрирован;
  - с новым тестовым номером гость создается, оплата и финальная кнопка появляются;
  - расписание доставки показывает реальные даты/слоты;
  - delivery/pickup/takeout переключаются, для pickup/takeout адресный блок скрывается;
  - финальная кнопка `Оформить заказ` не нажималась.
- Дополнительно исправлено:
  - `Today`/`Tomorrow` в расписании локализуются в `Сегодня`/`Завтра`;
  - для pickup/takeout заголовок расписания стал `Время заказа`, для delivery осталось `Время доставки`;
  - checkout wallet kicker локализован, вместо `WALLET` в ru показывается `КОШЕЛЕК`;
  - `Cash On delivery` в ru показывается как `Наличными при получении`;
  - дубль COD-оплаты в checkout скрыт дедупликацией.
- Account-зависимые экраны после guest login:
  - проверены `/account`, `/profile`, `/addresses`, `/orders`, `/wallet`, `/points`, `/notifications`, `/favourites`, `/booking`, `/payments`, `/tracking`, `/account/security`;
  - raw backend-пустые ответы `no results`, `No Results.`, `Invalid card id`, `Ничего не найдено` больше не показываются как ошибки там, где это просто пустая история/список;
  - `/orders` показывает нормальное пустое состояние `Заказов пока нет`;
  - `/addresses` показывает `Адресов пока нет`;
  - `/points` показывает `История пуста`;
  - `/payments` показывает COD как `Наличными при получении` / `Наличные`, без английского `Cash On delivery`;
  - Facebook/KMRS-утечек на этих экранах не найдено.
- Следующий QA-проход по служебным, юридическим, booking/order/chat/redirect экранам:
  - проверены `/account/language`, `/account/settings`, `/account/currency`, `/legal`, `/privacy-policy`, `/terms-of-service`, `/data-deletion`, `/update-app`, `/errornetwork`;
  - проверены `/booking/search`, `/booking/track`, `/booking/cancel`, `/booking/update`;
  - проверены `/user/login`, `/user/signup`, `/user/reset-password`, `/auth?mode=login` в состоянии уже вошедшего guest-пользователя;
  - проверены `/order/details`, `/order/success`, `/order/write-review`, `/order/rate-driver`, `/wallet/receipt`, `/account/chat`, `/account/chat/conversation`;
  - проверены старые redirect-маршруты `/account/allorder`, `/account/payment`, `/account/my-address`, `/account/trackorder`, `/account/delete`, `/account/complete-registration`, `/store/booking-succesful`, `/store/booking`, `/menu/category`, `/store/info`, `/store/review`;
  - на этих маршрутах не найдено `KMRS`, `Karenderia`, `Facebook`, raw `no results`, `No Results`, `Invalid card id`, `undefined`, `null`, `Cash On delivery`, критичных console errors;
  - `src/views/LegalView.vue` локализует заголовки legal-документов (`Политика конфиденциальности`, `Условия использования`, `Удаление аккаунта и данных`) и общий `/legal` сразу показывает все три пункта;
  - `public/data-deletion.html` сделан двуязычным: русский блок первый для пользователя, английский блок оставлен ниже для Google/Meta review;
  - после правок успешно выполнены `npm run build`, `npx cap sync`, `cd android; .\gradlew.bat bundleRelease`;
  - актуальный AAB: `android\app\build\outputs\bundle\release\app-release.aab`, размер `15608781 bytes`, время `2026-05-25 17:07:43`.
- QA-проход по адресам и location-flow, 2026-05-26:
  - локальный preview был заново поднят на `http://127.0.0.1:4173`;
  - проверены `/addresses`, `/addresses?new=1`, `/location`, `/location?redirect=/addresses?new=1`, `/location?redirect=/checkout&new_address=1`, `/location/map`, `/location/add-location`, `/address/select`, `/checkout`;
  - проверен переход после `Подтвердить локацию`: в `/addresses?new=1` открывается форма нового адреса с выбранной точкой, в `/checkout` возвращается checkout;
  - проверен checkout delivery: после выбора `Доставка` виден блок `Адрес доставки`, ссылка `Изменить локацию`, поля дом/улица/подъезд/инструкции;
  - проверен поиск адреса в карте: запрос `Ashgabat` показывает подсказки без raw-ошибок;
  - финальное сохранение адреса не нажималось, чтобы не создавать реальные адреса в аккаунте без явной команды;
  - исправлен `src/components/location/MapPicker.vue`:
    - убраны видимые технические поля `Lat`/`Lng` из пользовательского UI;
    - подпись выбранной точки больше не показывает координаты;
    - тексты поиска, движения карты, GPS-кнопок и ошибок локализованы ru/tk/en;
    - отказ GPS больше не показывает сырой браузерный текст `User denied Geolocation`;
    - при отказе GPS карта делает fallback на reverse geocode текущей точки, поэтому `Подтвердить локацию` остается доступной;
    - подсказкам адреса добавлен понятный `aria-label`;
  - на проверенных адресных маршрутах не найдено `KMRS`, `Karenderia`, `Facebook`, raw `no results`, `No Results`, `Invalid card id`, `undefined`, `null`, `Cash On delivery`, критичных console errors;
  - после правок успешно выполнены `npm run build`, `npx cap sync`, `cd android; .\gradlew.bat bundleRelease`;
  - актуальный AAB: `android\app\build\outputs\bundle\release\app-release.aab`, размер `15609333 bytes`, время `2026-05-26 07:13:41`.
- Большой QA-проход по витрине, поиску, заказам, аккаунту, документам и wallet, 2026-05-26:
  - проверены витринные маршруты `/home`, `/offers`, `/home/offers`, `/categories`, `/view/categories`, `/search`, `/search?query=burger`, `/search?query=sushi`, `/search?cuisine=Бургеры`, `/home/browse`, `/view/quick-results?query=pizza`, `/search/items?query=burger`, `/theme-preview`, `/update-app`;
  - проверены ресторанные и заказные маршруты `/restaurant/ashgabat-burger160`, `/restaurant/ashgabat-burger160?panel=search`, `/restaurant/ashgabat-burger160?panel=info`, `/restaurant/ashgabat-burger160?panel=info&reviews=1`, `/search-menu/ashgabat-burger160`, `/menu/ashgabat-burger160`, `/menu/ashgabat-burger160/no-item/0`, `/menu/review?slug=ashgabat-burger160`, `/store/info?slug=ashgabat-burger160`, `/store/review?slug=ashgabat-burger160`, `/cart`, `/checkout`, `/orders`, `/order/details?order_uuid=missing-test`, `/order/success?order_uuid=missing-test`, `/tracking?order_uuid=missing-test`, `/order/write-review?order_uuid=missing-test`, `/order/rate-driver?order_uuid=missing-test`;
  - проверены аккаунтные, booking, документные и wallet-маршруты `/profile`, `/account/security`, `/account/verify`, `/account/change-password`, `/account/manage-account`, `/account/delete-account`, `/account/chat?query=burger`, `/booking?status=all`, `/booking?status=upcoming`, `/booking?status=past`, `/booking/search?query=burger`, `/notifications`, `/favourites`, `/wallet`, `/points`, `/payments`, `/account/language`, `/privacy-policy`, `/terms-of-service`, `/data-deletion.html`;
  - финальное оформление заказа, сохранение адреса, удаление аккаунта и удаление платежных данных не нажимались;
  - исправлен `src/views/WalletView.vue`: `TAGAM WALLET` и `TOP UP` заменены на локализованные строки, пустые backend-ответы `Invalid card id`, `no results`, `record not found`, `Ничего не найдено` больше не показываются как raw-ошибка;
  - исправлены raw `Order not found` в `src/views/OrderDetailsView.vue`, `src/views/TrackingView.vue`, `src/views/RateDriverView.vue`: для отсутствующего тестового заказа теперь показываются русские пользовательские сообщения;
  - исправлены `src/views/SearchView.vue` и `src/views/BookingView.vue`: маршруты читают и `?q=`, и `?query=`, поэтому `/search?query=burger` показывает результат `ASHGABAT | BURGER 160°`, а `/booking/search?query=burger` заполняет поле поиска;
  - после точечного повторного прохода не найдено `Order not found`, `TAGAM WALLET`, `TOP UP`, `KMRS`, `Karenderia`, `Facebook`, raw `no results`, `No Results`, `Invalid card id`, `undefined`, `null`, `Cash On delivery`, критичных console errors на проверенных страницах;
  - после правок успешно выполнены `npm run build`, `npx cap sync`, `cd android; .\gradlew.bat bundleRelease`;
  - при `npx cap sync` ожидаемо отсутствуют CocoaPods/xcodebuild на Windows; дополнительно было замечено, что Capacitor перечислил установленные плагины с фактическими версиями из текущего окружения, включая `@capacitor/app@7.0.2` и `@capgo/capacitor-social-login@7.8.3`;
  - актуальный AAB: `android\app\build\outputs\bundle\release\app-release.aab`, размер `15435994 bytes`, время `2026-05-26 07:43:33`.
- Публикационный проход, 2026-05-26:
  - финальный diff просмотрен, `git diff --check` прошел без ошибок, только с обычными Windows LF/CRLF warnings;
  - создан и отправлен коммит `f0a77ca Prepare Tagam delivery release 2.0.5`;
  - после коммита обнаружен отдельный локальный diff в `src/views/HomeView.vue` с обрывком script-логики; он исправлен минимально, `npm run build` прошел успешно;
  - создан и отправлен второй коммит `133c188 Fix home hero release tweak`;
  - ветка `tagam-vite-xcode-cloud` запушена в `origin`, функциональный HEAD `133c188`, затем паспорт обновлен docs-коммитом `808ad4d`;
  - Play Console открыт на форме создания закрытого тестового выпуска Alpha: сейчас опубликован `14 (2.0.5)`, новый локальный AAB `2.0.5 (15)` еще не загружен;
  - автоматическая загрузка AAB через браузер не завершилась, потому что Play Console использует системный file picker, а на машине нет настроенного Play Developer API/fastlane/gcloud/service-account;
  - в Play Console dashboard на 2026-05-26 видно `В тестировании участвует 4 человека`;
  - для ручной загрузки нужен файл `C:\Users\ps\Documents\Codex\2026-05-21\kmrs-tagam-delivery-15151-root-ias141328ia\kmrs-customer-app\android\app\build\outputs\bundle\release\app-release.aab`.
- Xcode Cloud разбор и исправление, 2026-05-26:
  - App Store Connect / Xcode Cloud build `44` падал на `Archive - iOS` с ошибкой `Running ci_post_clone.sh script failed (exited with code 1)`;
  - build `45` показал точный лог: `npx cap sync ios` падал на `pod install`, CocoaPods/Nanaimo не мог прочитать `ios/App/App.xcodeproj/project.pbxproj` из-за UTF-8 BOM: `Invalid character "\xEF" in unquoted string`, первая строка была `﻿// !$*UTF8*$!`;
  - добавлен коммит `5cea40a Make Xcode Cloud CocoaPods setup robust`: post-clone скрипты стали устойчивее к отсутствию CocoaPods и пробуют Homebrew/RubyGems fallback;
  - добавлен коммит `8378a63 Remove BOM from Xcode project`: из `project.pbxproj` убран BOM, первая строка стала `// !$*UTF8*$!`;
  - Xcode Cloud build `46` на коммите `8378a63` завершился успешно: `Успешно Archive - iOS`, build errors `0`, warnings `47`.

Ближайшие шаги:

1. Открыть новый чат и начать с чтения этого файла.
2. Проверить `git status`, `build status`, текущую локальную страницу.
3. Если текущие изменения устраивают, сделать коммит в `tagam-vite-xcode-cloud`.
4. Запушить ветку для Xcode Cloud.
5. Загрузить Android AAB `2.0.5 (15)` в Google Play testing.
6. Дождаться Xcode Cloud build `2.0.5 (41)` и назначить TestFlight группы.
7. Продолжить функциональный аудит:
   - статусы заказа в customer app vs merchant/KDS/driver;
   - адреса: последний адрес, выбор сохраненного адреса, новый адрес по геолокации/карте/ручному вводу;
   - непереведенные ru/tk/en места;
   - убрать оставшиеся технические данные из UI.
