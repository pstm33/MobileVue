# Паспорт текущей сессии Tagam Delivery

Дата: 2026-05-25, Asia/Ashgabat.

## Как продолжить в новом чате

Скопировать в новый чат:

```text
Продолжаем Tagam Delivery / Tagam customer app.

Workspace:
C:\Users\ps\Documents\Codex\2026-05-21\Tagam-tagam-delivery-15151-root-ias141328ia\Tagam-customer-app

Сначала прочитай docs/current-session-status.md и проверь git status/build status.
Отвечай и документы веди на русском.
```

## Основной контекст

- Проект: Tagam Delivery / Tagam customer app.
- Цель: максимально перенести функционал коробочной Tagam legacy app, но сохранить новый ВАУ-интерфейс.
- Стек: Vue 3 + Vite + TailwindCSS + Capacitor 7.
- Рабочая папка:
  `C:\Users\ps\Documents\Codex\2026-05-21\Tagam-tagam-delivery-15151-root-ias141328ia\Tagam-customer-app`
- Оригинальная коробка:
  `C:\Users\ps\Documents\Tagam\legacy app`
- Старые архивы:
  `C:\Users\ps\Documents\Claude\Tagam`
- Git remote: `https://github.com/pstm33/legacy app.git`
- Текущая ветка: `tagam-vite-xcode-cloud`
- Последний функциональный HEAD публикационного прохода: `133c188`; после него паспорт обновлялся отдельными docs-коммитами. Актуальный HEAD проверять командой `git rev-parse --short HEAD`.
- В main не делать force push: `origin/main` расходится.

## Текущие версии и сборки

- Android:
  - `versionName 2.0.5`
  - `versionCode 50`
  - Новый AAB:
    `C:\Users\ps\Documents\Codex\2026-05-21\Tagam-tagam-delivery-15151-root-ias141328ia\Tagam-customer-app\android\app\build\outputs\bundle\release\app-release.aab`
  - Размер AAB: `15435994 bytes`
  - Время файла: `2026-05-26 07:43:33`
- iOS:
  - `MARKETING_VERSION = 2.0.5`
  - `CURRENT_PROJECT_VERSION = 50`
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
  - После текущих правок iOS build поднят до `2.0.5 (50)`.
  - Xcode Cloud позднее успешно собрал и доставил свежую сборку `2.0.5 (47)`.
- App Store Connect / публичный App Store релиз:
  - 2026-05-26, около 10:20 Asia/Ashgabat, версия iOS `2.0.5` со сборкой `47` отправлена в Apple App Review.
  - Перед отправкой закрыты блокеры App Store Connect:
    - заполнены сведения о правах на публикуемые материалы: приложение содержит/отображает сторонний контент, права есть;
    - опубликована App Privacy анкета с privacy policy `https://tagam.delivery/privacy-policy`;
    - выставлена бесплатная цена `0,00 $` для 175 стран/регионов;
    - из публичной версии удалена старая сборка `2 / 2.0.1`, выбрана сборка `47 / 2.0.5`.
  - App Store Connect подтвердил: `Отправлено объектов: 1`; проверка может занять до 48 часов.
  - Релиз настроен на автоматический выпуск после одобрения Apple.
  - Срочная privacy-анкета прошла отправку. Для последующей полировки можно отдельно выровнять label `Номер телефона`: сейчас он отмечен как `Другие цели`, лучше потом привести к `Функциональные возможности приложения`.

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
  - Убраны пользовательские фразы с `Tagam`.
  - Главный hero:
    - ru: `Рестораны рядом, доставка прямо к вам.`
    - tk: `Ýakyndaky restoranlar, eltip bermek göni size.`
    - en: `Nearby restaurants, delivered to you.`
- `index.html`
  - Убраны публичные keywords `Tagam`, `Tagam`.
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
  - `versionCode 50`
- `ios/App/App.xcodeproj/project.pbxproj`
  - `CURRENT_PROJECT_VERSION 50`
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
- Пользовательские строки не должны показывать `Tagam`.
- Документы и пояснения вести на русском.

## Что делать дальше

### Проход после публикации Google Play, 2026-05-25

- Публичная страница Google Play для `com.tagam.delivery` открывается в регионе Туркменистан и США.
- Локальный PWA preview проверен на мобильном viewport `390x844`.
- Главная открывается, показывает 7 ресторанов, категории и русские пользовательские строки без `Tagam`.
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
  - Facebook/Tagam-утечек на этих экранах не найдено.
- Следующий QA-проход по служебным, юридическим, booking/order/chat/redirect экранам:
  - проверены `/account/language`, `/account/settings`, `/account/currency`, `/legal`, `/privacy-policy`, `/terms-of-service`, `/data-deletion`, `/update-app`, `/errornetwork`;
  - проверены `/booking/search`, `/booking/track`, `/booking/cancel`, `/booking/update`;
  - проверены `/user/login`, `/user/signup`, `/user/reset-password`, `/auth?mode=login` в состоянии уже вошедшего guest-пользователя;
  - проверены `/order/details`, `/order/success`, `/order/write-review`, `/order/rate-driver`, `/wallet/receipt`, `/account/chat`, `/account/chat/conversation`;
  - проверены старые redirect-маршруты `/account/allorder`, `/account/payment`, `/account/my-address`, `/account/trackorder`, `/account/delete`, `/account/complete-registration`, `/store/booking-succesful`, `/store/booking`, `/menu/category`, `/store/info`, `/store/review`;
  - на этих маршрутах не найдено `Tagam`, `Tagam`, `Facebook`, raw `no results`, `No Results`, `Invalid card id`, `undefined`, `null`, `Cash On delivery`, критичных console errors;
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
  - на проверенных адресных маршрутах не найдено `Tagam`, `Tagam`, `Facebook`, raw `no results`, `No Results`, `Invalid card id`, `undefined`, `null`, `Cash On delivery`, критичных console errors;
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
  - после точечного повторного прохода не найдено `Order not found`, `TAGAM WALLET`, `TOP UP`, `Tagam`, `Tagam`, `Facebook`, raw `no results`, `No Results`, `Invalid card id`, `undefined`, `null`, `Cash On delivery`, критичных console errors на проверенных страницах;
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
  - для ручной загрузки нужен файл `C:\Users\ps\Documents\Codex\2026-05-21\Tagam-tagam-delivery-15151-root-ias141328ia\Tagam-customer-app\android\app\build\outputs\bundle\release\app-release.aab`.
- Xcode Cloud разбор и исправление, 2026-05-26:
  - App Store Connect / Xcode Cloud build `44` падал на `Archive - iOS` с ошибкой `Running ci_post_clone.sh script failed (exited with code 1)`;
  - build `45` показал точный лог: `npx cap sync ios` падал на `pod install`, CocoaPods/Nanaimo не мог прочитать `ios/App/App.xcodeproj/project.pbxproj` из-за UTF-8 BOM: `Invalid character "\xEF" in unquoted string`, первая строка была `﻿// !$*UTF8*$!`;
  - добавлен коммит `5cea40a Make Xcode Cloud CocoaPods setup robust`: post-clone скрипты стали устойчивее к отсутствию CocoaPods и пробуют Homebrew/RubyGems fallback;
  - добавлен коммит `8378a63 Remove BOM from Xcode project`: из `project.pbxproj` убран BOM, первая строка стала `// !$*UTF8*$!`;
  - Xcode Cloud build `46` на коммите `8378a63` завершился успешно: `Успешно Archive - iOS`, build errors `0`, warnings `47`.
- App Store Review отправка, 2026-05-26:
  - в App Store Connect версия `2.0.5` подготовлена для публичного App Store;
  - copyright заполнен как `2026 BANZAI END KO TOV`;
  - support URL восстановлен: `https://tagam.delivery/contact-us`;
  - сборка `2.0.5 (47)` добавлена в версию и отправлена на проверку;
  - Apple показал подтверждение отправки одного объекта и срок проверки до 48 часов;
  - сейчас дополнительных кнопок для ускорения нет: нужно ждать ответа Apple и сразу отвечать, если придет вопрос или rejection.
- TestFlight external testing, 2026-05-26:
  - публичная ссылка группы `Outside`: `https://testflight.apple.com/join/HZ1ck929`;
  - старая внешняя beta review сборка `2.0.5 (40)` блокировала добавление свежей `47`, поэтому проверка `40` отменена и сборка `40` удалена из `Outside`;
  - сборка `2.0.5 (47)` добавлена в `Outside` и отправлена на Beta App Review со статусом `Ожидание проверки`;
  - после одобрения Beta App Review внешние тестеры смогут ставить свежую `2.0.5 (47)` по публичной TestFlight-ссылке;
  - в `Outside` также остаются `2.0.4 (37)` в ожидании проверки и `2.0.1 (2)` в статусе `Тестируется`.
- App Store rejection, 2026-05-27:
  - публичная версия iOS `2.0.5 (47)` отклонена Apple.
  - Guideline: `2.1(a) - Performance - App Completeness`.
  - Основная причина: Apple использовал `Sign in with Apple`, приложение не прошло дальше экрана логина и показало error alert.
  - Review environment: iPhone 17 Pro Max и iPad Air 11-inch (M3), iOS/iPadOS 26.5, интернет активен.
  - Дополнительная причина: `Information Needed` - Apple не смог получить доступ ко всем функциям и просит demo account в `App Review Information`.
  - Следующие действия перед повторной отправкой:
    1. локально воспроизвести и исправить Sign in with Apple на iOS;
    2. добавить demo account с логином/паролем в App Review Information или включить полноценный demo mode;
    3. проверить iPhone/iPad сценарий входа, переход дальше login screen и основные функции;
    4. повторно отправить версию на review.
- App Store rejection fix, 2026-05-27:
  - в `src/components/auth/SocialAuthButtons.vue` исправлена обработка native iOS Apple login:
    - для iOS больше не передается `redirectUrl` в `@capgo/capacitor-social-login`, чтобы плагин не отправлял собственный callback с перепутанными `identityToken`/`authorizationCode`;
    - Apple social payload теперь выбирает настоящий JWT identity token по форме `header.payload.signature`, включая `accessToken.token`, и только потом fallback-поля;
    - web/Android Apple callback остался поддержан через прежние redirect URL.
  - В `ios/App/App.xcodeproj/project.pbxproj` поднят `CURRENT_PROJECT_VERSION` до `50`, потому что повторная отправка после binary rejection должна идти новой сборкой выше отклоненной `47`.
  - Проверено:
    - `npm run build` - успешно;
    - `npx cap sync` - успешно, web bundle скопирован в Android и iOS. На Windows ожидаемо пропущены CocoaPods/xcodebuild.
  - Коммит `bb3351c Fix iOS Apple sign in for review` запушен в `tagam-vite-xcode-cloud`.
  - В Xcode Cloud после пушей старые CI-сборки `48` и `49` отменены, CI-сборка `50` успешно прошла `Archive - iOS` на коммите `Bump iOS build for App Review retry`.
- Version alignment, 2026-05-27:
  - пользовательская версия оставлена общей: Android `versionName 2.0.5`, iOS `MARKETING_VERSION 2.0.5`;
  - внутренний номер приведен к общему следующему значению выше уже опубликованных/отклоненных сборок: Android `versionCode 50`, iOS `CURRENT_PROJECT_VERSION 50`;
  - Google Play уже имеет closed testing `2.0.5 (15)`, поэтому следующий Android upload с `50` валиден; Apple rejected build `47`, поэтому iOS build `50` валиден для повторной отправки.

Ближайшие шаги:

1. Добавить demo account в App Review Information, чтобы Apple мог проверить приложение без social login.
2. Дождаться успешного Xcode Cloud build с app build `49`, затем выбрать эту сборку в версии App Store вместо отклоненной `47`.
3. Проверить iOS на реальном iPhone/TestFlight: Apple login, demo login, адрес, корзина, checkout до финальной кнопки, профиль.
4. Повторно отправить iOS `2.0.5` на App Review после выбора новой сборки и заполнения review info.
5. Следить за Beta App Review для TestFlight `Outside`: после одобрения тестерам отправлять `https://testflight.apple.com/join/HZ1ck929`.
6. На Google Play продолжать закрытое тестирование: для production нужен порог тестеров/срока теста, App Store уже идет отдельным путем.
7. Продолжить функциональный аудит:
   - статусы заказа в customer app vs merchant/KDS/driver;
   - адреса: последний адрес, выбор сохраненного адреса, новый адрес по геолокации/карте/ручному вводу;
   - непереведенные ru/tk/en места;
   - убрать оставшиеся технические данные из UI.

## Локальный фикс главной и локации, 2026-05-27

- Быстрый блок на главной (`Акции`, `Категории`, `Бронь`, `Заказы`, `Кошелек`, `Избранное`) оставлен удаленным по решению продукта.
- Нижняя вкладка `Трекинг` возвращена: ее удаление было лишним, пользователь просил убрать только блоки на главной.
- Первичное определение локации восстановлено: `LocationView` теперь передает `auto-locate` в `MapPicker`, если в сессии еще нет координат, а также при добавлении нового адреса из checkout.
- На главную добавлена компактная строка выбора локации в hero-блоке (`MapPin` + текущий адрес/подсказка). Она ведет на `/location` и заменяет потерянный явный вход в выбор адреса без возврата удаленного блока быстрых карточек.
- Проверено локально: `npm run build`, `npx cap sync android`, `.\gradlew.bat assembleDebug`.
- Debug APK установлен на Android S23+ по Wi-Fi ADB `192.168.1.18:44915`, приложение запущено локально. В сторы ничего не публиковалось.

## Откат главной к состоянию до удаления карточек, 2026-05-27

- По просьбе пользователя откатили участок главной к состоянию до удаления быстрых карточек.
- Блок `Акции`, `Категории`, `Бронь`, `Заказы`, `Кошелек`, `Избранное` возвращен.
- Добавленная временная строка выбора локации в hero-блоке удалена.
- `LocationView` возвращен к прежней логике `auto-locate`: автолокация только для нового адреса из checkout.
- Локально проверено: `npm run build`, `npx cap sync android`, `.\gradlew.bat assembleDebug`.
- Debug APK установлен на Android S23+ по Wi-Fi ADB `192.168.1.18:44915`, приложение запущено. В сторы ничего не публиковалось.

## Восстановление стартовой логики и локального web-теста, 2026-05-27

- Проверен соседний thread `019e5d00-59c2-72d2-a15f-c53d2381f532` через локальные Codex logs/global state. В нем меняли hero главной: app-логотип, фоновый TAGAM и анимацию; логику location/onboarding там явно не меняли.
- Найдена реальная проблема текущей локальной web-проверки: web guard был отключен для браузера, поэтому прямой `/home` обходил onboarding/location. `src/router/index.js` приведен к единой стартовой логике для web и native:
  - нет `intro_seen` -> `/onboarding`;
  - есть intro, нет `coordinates` -> `/location`;
  - есть intro и coordinates -> `/home`.
- Найдена вторая проблема после переименования KMRS -> TAGAM: `.env.local` содержал только `VITE_KMRS_API_TOKEN`, а код уже читает `VITE_TAGAM_API_TOKEN`. Добавлены `VITE_TAGAM_API_BASE_URL` и `VITE_TAGAM_API_TOKEN`.
- Для локального браузера добавлен Vite proxy `/tagam-api` -> `https://tagam.delivery`, чтобы `127.0.0.1:4173` не упирался в CORS.
- Проверено Playwright:
  - свежий прямой `/home` -> `/onboarding`;
  - `intro_seen=true` без координат -> `/location`, reverse geocoding работает;
  - `intro_seen=true` + coordinates -> `/home`, merchant feed работает, найдено 7 ресторанов;
  - CORS/Network Error в проверенных сценариях не осталось.
- Preview перезапущен на `http://127.0.0.1:4173/`. В сторы ничего не публиковалось.

## Onboarding reset и проверка первого запуска, 2026-05-27

- Для локального браузера добавлен reset-сценарий: `http://127.0.0.1:4173/?reset=1` очищает `intro_seen`, `coordinates`, `place_data`, `place_id` и открывает `/onboarding`. Ограничено localhost/127.0.0.1.
- Найдена и исправлена ошибка в `src/views/OnboardingView.vue`: в JS использовалось `slides.length` для computed ref, из-за чего первый клик `Дальше` сразу завершал onboarding. Исправлено на `slides.value.length`.
- Проверено Playwright:
  - reset открывает `/onboarding`;
  - три экрана onboarding идут последовательно: `Discover` -> `Customize` -> `Delivery`;
  - после `Продолжить` открывается `/location`;
  - `Подтвердить локацию` сохраняет координаты и переводит на `/home`;
  - merchant feed грузится, найдено 7 ресторанов;
  - ошибок CORS/Network Error нет.

## Компактная страница выбора локации, 2026-05-27

- `MapPicker` на `/location` переделан под высокий рабочий формат карты: после удаления лишнего login/guest-блока карта занимает больше высоты без скролла.
- Визуальный шум карты снижен: приглушены тайлы, скрыта attribution-плашка, уменьшены панели поиска/адреса/кнопок.
- Поведение центрального пина исправлено: при движении карты он больше не смещается влево/вверх и остается в центре.
- Блок `Аккаунт можно создать позже` / `Войти` / `Как гость` удален со страницы выбора адреса: логин/регистрация должны появляться позже, когда реально нужны профиль, сохраненные адреса, история заказов или checkout.
- Проверено Playwright на мобильных размерах:
  - `375x667`: карта 349x374 px, guest-блока нет, overflow 0;
  - `390x844`: карта 364x523 px, guest-блока нет, overflow 0;
  - `393x852`: карта 367x528 px, guest-блока нет, overflow 0;
  - `360x740`: карта 334x414 px, guest-блока нет, overflow 0.
- Preview обновлен на `http://127.0.0.1:4173/location`. В сторы ничего не публиковалось.

## Onboarding: язык и тема первым шагом, 2026-05-27

- В `OnboardingView` добавлен первый слайд про выбор языка и темы.
- Первый слайд упрощен: крупно показывает фразу сразу на трех языках в порядке `Туркменский -> Русский -> Английский`:
  - `Programmany özüňize görä sazlaň`;
  - `Настрой приложение под себя`;
  - `Set up the app your way`.
- Флаговые `background-clip` градиенты убраны как визуально лишние: туркменская строка зеленая, русская белая, английская приглушенно-белая.
- В шапке onboarding при первом слайде показываются компактные мигающие подсказки-стрелки к иконке языка и иконке темы.
- Порядок переключения языка в onboarding изменен на `tk -> ru -> en`.
- Старые три слайда сохранены после нового первого шага; теперь в onboarding 4 слайда.
- Проверено Playwright:
  - `390x844`, `360x740`, `375x667`: первый слайд помещается без скролла, арт-блок не пересекается с текстовым блоком;
  - `npm run build` успешно.

## Главная: удаление лишних метрик, 2026-05-27

- С главной удален блок трех метрик `мест рядом / категорий / без доставки`.
- Причина: блок не давал действия, дублировал список ресторанов и фильтры категорий, а подпись `без доставки` читалась как отсутствие доставки вместо бесплатной доставки.
- После удаления главная идет от hero сразу к фильтрам категорий и списку ресторанов.
- На карточках ресторанов на главной убран fallback-бейдж `Новый`: если реального рейтинга нет, бейдж не показывается.
- Фильтры кухонь/категорий на главной заменены с pill-кнопок на более квадратные карточки `92x78` с радиусом `8px`.
- Картинки кухонь теперь берутся из настоящего каталога `CuisineList` (`url_icon` / `featured_image`) через `tagamAsset`, а не из обложек ресторанов.
- Если backend для кухни возвращает `default-icons.png` или `placeholder.png`, ресторанная обложка больше не подставляется: показывается нейтральная иконка `Utensils`.
- Горизонтальный rail кухонь теперь можно тянуть мышкой через pointer drag; клики по карточкам при drag не срабатывают.
- Проверено Playwright: `.home-insights` отсутствует, `.home-cuisine-rail` остается, `Новый` на главной не найден, старых `.tagam-pill` в rail нет, карточки `92x78`, реальные cuisine-иконки подтягиваются где есть, mouse drag меняет `scrollLeft` с `0` на `200`, `npm run build` успешно.
## Главная: вертикальные карточки кухонь, 2026-05-27

- Карточки кухонь/категорий на главной сделаны компактными вертикальными прямоугольниками `90x94` с радиусом `8px`: картинка занимает верхнюю часть, подпись остается внизу.
- Кнопка `Все` вынесена из прокручиваемого списка и закреплена слева; скроллится только список кухонь.
- Цифры количества ресторанов на самих карточках убраны полностью.
- Картинки кухонь берутся из `CuisineList` (`url_icon` / `featured_image`), ресторанные обложки не используются. Если backend отдает только placeholder/default icon, показывается нейтральная иконка `Utensils`.
- Убран эффект мутной картинки: opacity у изображений `1`.
- Проверено в in-app browser на `http://127.0.0.1:4173/home`: карточки имеют размер `74x94`, реальные `upload/all/...@thumbnail.png` подставляются, мультивыбор работает (`Бургеры` + `Пицца`, `Очистить 2`), mouse drag двигает rail и не сбрасывает выбор, `Все` остается на `x=12` при прокрутке.
- `npm run build` прошел успешно. В сторы ничего не публиковалось.

## Главная: tabbar и ширина кухонь, 2026-05-27

- В нижней панели вкладка `Трекинг` скрывается, если в истории нет активного/отслеживаемого заказа. Прямые ссылки `/tracking` и ссылки трекинга из истории/деталей заказа остаются рабочими.
- `Все` закреплено отдельной левой колонкой, список кухонь занимает всю оставшуюся ширину (`grid-template-columns: 90px minmax(0, 1fr)`).
- Удалена лишняя скрытая копия кнопки `Все` из прокручиваемой ленты: в DOM рендерится только одна кнопка `Все`.
- Проверено в in-app browser на `http://127.0.0.1:4173/home`: tabbar без заказов показывает `Главная / Поиск / Корзина / Профиль`, `Трекинг` отсутствует; rail кухонь занимает ширину 256 px при общей ширине shell 386 px; мышиный мультивыбор работает без Enter (`Бургеры` + `Итальянская`, `Очистить 2`).
- `npm run build` прошел успешно. В сторы ничего не публиковалось.

## Главная: сброс фильтров через `Все` и центр tabbar, 2026-05-27

- Плавающая кнопка `Очистить` удалена: сброс фильтров кухонь теперь только через закрепленную кнопку `Все`.
- Нижняя панель использует фактическое число вкладок: `--tab-count: tabs.length`, CSS `grid-template-columns: repeat(var(--tab-count), 1fr)`. При скрытом `Трекинге` четыре вкладки распределяются равномерно.
- Tabbar переведен на явное центрирование через `left: 50%` и `translateX(-50%)`; мобильный media override также приведен к этой схеме.
- Проверено в in-app browser на `http://127.0.0.1:4173/home`: вкладки `Главная / Поиск / Корзина / Профиль`, `Трекинг` отсутствует, `.filter-clear-fab` отсутствует, колонки tabbar равные.
- `npm run build` прошел успешно. В сторы ничего не публиковалось.

## Роутинг: ресторан открывается сверху, 2026-05-27

- В `src/router/index.js` добавлен `scrollBehavior`: при новом переходе страница открывается с `top: 0`, при back/forward сохраняется `savedPosition`.
- Исправляет сценарий, когда переход с проскролленной главной в ресторан открывал ресторан не сверху, а где-то под карточкой.
- Проверено в in-app browser: после искусственного скролла главной переход на `/restaurant/ashgabat-pizza-wing` дает `windowScrollY=0`, `screenScrollTop=0`, hero ресторана виден сверху (`heroTop=84`).
- `npm run build` прошел успешно. В сторы ничего не публиковалось.

## Ресторан: первый визуальный проход hero и навигации, 2026-05-27

- Убрано дублирование названия ресторана: верхний `AppHeader` теперь показывает только логотип Tagam и кнопку сердца, название остается в hero.
- Сердце подключено к избранному: для авторизованного пользователя вызывает существующий `customer.toggleFavourite()` / backend `SaveStore`; для гостя ведет в `/account`, потому что сохранить избранное без аккаунта нельзя.
- В hero добавлен логотип ресторана (`url_logo`) как бейдж, название сделано компактнее, а расстояние/количество блюд/акции перенесены внутрь hero.
- Подпись рейтинга локализована: ru `Рейтинг`, tk `Reyting`, en `Rating`; больше нет английского `rate` в русской версии.
- Блок статистики под hero удален, чтобы не дублировать данные.
- Переключатели `Меню / Поиск / Инфо` заменены с капсул на горизонтальные карточки `54px` высотой и radius `8px`.
- Категории меню заменены с pill-кнопок на горизонтальные карточки `50px` высотой и radius `8px`.
- Проверено in-app browser на `/restaurant/ashgabat-pizza-wing`: верхний title пустой, hero title один, logo badge `58x58`, chips `1.8 км от вас` и `22 Блюда`, stats block отсутствует.
- `npm run build` прошел успешно. В сторы ничего не публиковалось.

## Ресторан: активная категория меню при скролле, 2026-05-27

- Исправлено переключение активной категории меню при ручном скролле блюд.
- Старый `IntersectionObserver` мог оставлять активной предыдущую категорию, потому что она еще частично была видима. Теперь активная категория считается по контрольной линии под sticky-rail категорий.
- Добавлены scroll listeners для `window` и `.screen` с `requestAnimationFrame`, observer используется только как триггер пересчета.
- Проверено in-app browser на `/restaurant/ashgabat-pizza-wing`: при скролле до секции `Пицца` активная карточка категории становится `Пицца`; при переходе `scrollIntoView` на `Пицца` активная категория тоже `Пицца`.
- `npm run build` прошел успешно. В сторы ничего не публиковалось.
## Ресторан: темная подложка блюд без белых квадратов, 2026-05-27

- На темной теме белые фоны картинок блюд выглядели дешево и выбивались из общего вида.
- В `RestaurantView.vue` для картинок блюд добавлен отдельный класс `dish-image-treatment`, общий `image-treatment` для баннеров не трогался.
- В `ItemDetailSheet.vue` большая картинка блюда теперь использует тот же визуальный treatment.
- В `src/style.css` добавлены темная теплая подложка, мягкая виньетка и легкое увеличение блюда без агрессивного `mix-blend-mode`.
- Все локальные `public/tagam/item-*.webp` обработаны через ImageMagick: удаляется только светлый фон, связанный с краями картинки. Проверка: `154` item-картинки, `154` с alpha, битых файлов `0`.
- В `scripts/prepare_tagam_assets.py` добавлена такая же очистка edge-background для новых item-ассетов, чтобы фон не возвращался при будущей подготовке ассетов.
- Проверки: `npm run build` успешно, `python -m py_compile scripts/prepare_tagam_assets.py` успешно. В браузере проверен `http://127.0.0.1:4173/restaurant/ashgabat-fireitup`: белые квадраты у блюд исчезли, цвета еды сохранены.
## Checkout: профиль и приоритет регистрации, 2026-05-27

- В `components/checkout/AuthBridge.vue` стартовый режим изменен с `guest` на `signup`, чтобы checkout сначала предлагал создать аккаунт.
- Порядок вариантов теперь: `Регистрация`, `Телефон`, `Email`, `Гость`. Гость оставлен как запасной вариант и визуально приглушен, если не активен.
- Вход по телефону уже был в коде как режим `phone`, но не показывался в табах. Теперь он доступен пользователю и ведет на OTP-код.
- В `components/auth/SocialAuthButtons.vue` соцкнопки больше не используют Tailwind `grid-cols-*`, который ломался мобильным CSS внутри `.auth-bridge`; теперь это отдельная `social-buttons-row` с равномерной строкой Google/Facebook/Apple.
- Проверки: `npm run build` успешно. В браузере на `http://127.0.0.1:4173/checkout` блок профиля открывается с регистрацией, соцкнопки стоят в одну строку, таб `Телефон` показывает форму отправки кода.
## Checkout: коробочная auth-gate логика, 2026-05-27

- Сравнили с коробкой `C:\Users\ps\Documents\Claude\KMRS\codecanyon-Uh7VrIj0-karenderia-mobile-app-multi-restaurant\MobileVue`.
- В коробке `/checkout` имеет `meta: { requiresAuth: true }`; гостевой режим сначала проходит через `registerGuestUser`, получает `user_token`, и только потом попадает в checkout.
- В `src/router/index.js` добавлен `meta.requiresAuth` для `/checkout` и редирект неавторизованных на `/user/login?redirect=/checkout`.
- В `src/views/CheckoutView.vue` убран встроенный `AuthBridge`, чтобы checkout больше не был экраном выбора входа/гостя.
- Теперь поток как в коробке: корзина/checkout -> если нет токена, `/user/login` -> email/телефон/регистрация/гость -> после успешной авторизации возврат в `/checkout`.
- Проверки: `npm run build` успешно. В браузере без `client_token` переход на `http://127.0.0.1:4173/checkout` редиректит на `http://127.0.0.1:4173/user/login?redirect=/checkout`.

## Android: локальная установка на телефон, 2026-05-27

- Телефон S23+ подключен по Wi-Fi ADB: `192.168.1.18:35737`, модель `SM_S916B`.
- Выполнено: `npm run build`, `npx cap sync android`, `android\gradlew.bat -p android assembleDebug`.
- Установлен локальный debug APK: `android\app\build\outputs\apk\debug\app-debug.apk`.
- APK: `18 361 198 bytes`, время файла `2026-05-27 15:20:01`.
- На телефоне пакет `com.tagam.delivery` обновлен и запущен.
- Проверка через `adb shell dumpsys package com.tagam.delivery`: `versionName=2.0.5`, `versionCode=50`, `lastUpdateTime=2026-05-27 15:19:56`.
- После удаления приложения пользователем APK установлен заново через `adb install -r` и запущен.
- При проверке Facebook Login на локальной debug-сборке Meta показала ошибку `This app has no Android key hashes configured`.
- Установленный debug APK подписан сертификатом `C=US, O=Android, CN=Android Debug`, SHA-1 `37:7C:14:4F:1C:66:40:18:65:4A:13:03:78:D2:C3:46:72:DD:57:3D`; соответствующий Facebook key hash: `N3wUTxxmQBhlShMDeNLDRnLdVz0=`.
- Чтобы Facebook Login работал именно на этой локальной debug-сборке, hash `N3wUTxxmQBhlShMDeNLDRnLdVz0=` должен быть добавлен в Meta Developers для приложения `1606418370574325`.
- При проверке Apple Login на Android открылся Chrome Custom Tab со старым светлым web-flow Tagam вместо возврата в native app. Лог показал, что `com.tagam.delivery/.MainActivity` уходит в фон, а callback в `com.tagam.delivery://apple-login` не приходит.
- В `android/app/src/main/AndroidManifest.xml` добавлены HTTPS intent-filters для `https://tagam.delivery/interface/app_apple_callback` и `https://tagam.delivery/interface/apple_callback`.
- В `android/app/src/main/java/com/tagam/delivery/MainActivity.java` Apple callback теперь распознает и custom scheme `com.tagam.delivery://apple-login`, и HTTPS callback URLs Tagam.
- После правки выполнены `npm run build`, `npx cap sync android`, `android\gradlew.bat -p android assembleDebug`, APK установлен и приложение запущено. Если повторный тест Apple все еще остается в старой web-странице, нужно править backend endpoint `app_apple_callback`, чтобы он возвращал/редиректил параметры `success=true` и `code/client_secret` или токены в callback, который понимает `@capgo/capacitor-social-login`.

## Android / Facebook Login: локальная переустановка и Meta key hash, 2026-05-27

- По просьбе пользователя приложение `com.tagam.delivery` удалено с S23+ через ADB и установлено заново из `android\app\build\outputs\apk\debug\app-debug.apk`.
- Проверка на телефоне: `versionName=2.0.5`, `versionCode=50`, `firstInstallTime=2026-05-27 15:31:17`, `lastUpdateTime=2026-05-27 15:31:17`; процесс приложения запущен.
- Для локальной debug-сборки подтвержден Facebook key hash: `N3wUTxxmQBhlShMDeNLDRnLdVz0=`.
- В Meta Developers, приложение `1606418370574325`, открыта настройка Android platform и добавлен key hash `N3wUTxxmQBhlShMDeNLDRnLdVz0=`.
- При попытке настроить Android entry как `Google Play Store` Meta показал ошибку проверки пакета `com.tagam.delivery`: `При подтверждении названия этого пакета произошла ошибка`. Поэтому для локального теста входа Facebook нужно ориентироваться именно на наличие key hash в Android platform; привязку Google Play Store можно повторить позже, когда Meta стабильно валидирует опубликованный пакет.

## Checkout auth redirect после Google Login, 2026-05-27

- Пользователь обнаружил: если из корзины перейти к оформлению, затем авторизоваться через Google, приложение оставалось на экране входа с авторизованным профилем вместо автоматического перехода обратно в `/checkout`.
- В `src/components/checkout/AuthBridge.vue` добавлена внутренняя обработка `route.query.redirect`: после успешного входа `AuthBridge` сам делает `router.replace(redirect)`, если redirect является внутренним путем. Это страхует native OAuth flow, где родительская страница входа может не успеть обработать событие.
- Также при открытии `AuthBridge` уже авторизованным пользователем и наличии `?redirect=/checkout` выполняется немедленный переход в целевой экран.
- Проверки: `npm run build`, `npx cap sync android`, `android\gradlew.bat -p android assembleDebug` успешны.
- APK установлен на S23+ через `adb install -r`, `lastUpdateTime=2026-05-27 15:46:23`, версия на устройстве `2.0.5 (50)`.

## Backend Apple callback для Android Custom Tab, 2026-05-27

- Проблема: при входе через Apple на Android после Apple authorization открывался старый светлый web-интерфейс Tagam в Chrome Custom Tab, а не возврат в native app.
- Проверка Android показала: custom scheme `com.tagam.delivery://apple-login` зарегистрирован корректно и открывает `com.tagam.delivery/.MainActivity`.
- На сервере найден backend handler: `/var/www/fastuser/data/www/tagam.delivery/protected/controllers/InterfaceController.php`, метод `actionapp_apple_callback()`.
- Старый обработчик возвращал PHP redirect `302` на `com.tagam.delivery://apple-login?...`. После Apple `response_mode=form_post` Chrome Custom Tab может не обрабатывать такой redirect стабильно.
- На сервере сделан backup: `/root/InterfaceController.php.apple-callback-20260527_161525` и предыдущий `/root/InterfaceController.php.apple-callback-20260527_161413`.
- `actionapp_apple_callback()` изменен: теперь вместо `$this->redirect(...)` endpoint возвращает `200 OK` HTML с `location.replace("com.tagam.delivery://apple-login?...")` и fallback-ссылкой `Open Tagam`.
- Проверка `php -l /var/www/fastuser/data/www/tagam.delivery/protected/controllers/InterfaceController.php`: синтаксис OK.
- Проверка `curl -i https://tagam.delivery/interface/app_apple_callback`: теперь ответ `200 OK` с HTML/JS редиректом в `com.tagam.delivery://apple-login?...`, а не старый `302`.
- После моргания питания Wi-Fi ADB порт `192.168.1.18:35737` отвалился, но телефон виден по USB как `R3CW40H0GDP`. Chrome и приложение принудительно остановлены, затем `com.tagam.delivery` запущено заново.

## Android / Apple Login: финальная причина старого PWA, 2026-05-27

- После чистой переустановки APK Apple Login все равно открывал старый светлый интерфейс `https://pwa.tagam.delivery/#/home` в Chrome Custom Tab.
- Логи Android показали, что приложение стартует Apple authorization с правильным `redirect_uri=https://tagam.delivery/interface/app_apple_callback`.
- Логи backend показали реальную ошибку в `actionapp_apple_callback()`: `file_get_contents(): Read ... failed with errno=21 Is a directory`, потому что в базе `st_option.app_apple_key_crt` было `NULL`.
- На сервере найден файл Apple ключа: `/var/www/fastuser/data/www/tagam.delivery/upload/crt/AuthKey_N6FF28BUKN.p8`.
- В базе `tagam_delivery.st_option` выставлено `app_apple_key_crt = AuthKey_N6FF28BUKN.p8`; остальные Apple параметры: `app_apple_app_id=com.tagam.delivery.web`, `app_apple_key_id=N6FF28BUKN`, `app_apple_team_id=8XA96DKR4G`.
- В `InterfaceController.php` проверка файла ключа усилена с `file_exists($path)` до `is_file($path)`, чтобы папка `/crt/` больше не проходила как валидный ключ.
- Проверки: `php -l /var/www/fastuser/data/www/tagam.delivery/protected/controllers/InterfaceController.php` OK; `curl -i https://tagam.delivery/interface/app_apple_callback` возвращает `200 OK` с переходом в `com.tagam.delivery://apple-login?...`.
- После исправления пользователь подтвердил: Apple Login на Android успешно вернулся в приложение. В stores ничего не публиковалось, проверка только локальная.

## iOS локальная проверка перед повторной отправкой Apple, 2026-05-27

- Свежая локальная iOS-сборка `2.0.5 (50)` собрана на Mac `192.168.1.137` через Xcode 16.2 и установлена на подключенный iPhone `Pavel’s iPhone`.
- Команды на Mac: `npm ci`, `npm run build`, `npx cap sync ios`, затем `xcodebuild ... -destination id=00008110-001628803A11401E ... build`.
- При первой сборке через SSH `codesign` упал на `errSecInternalComponent`; после разблокировки `login.keychain-db` и повторной сборки build прошел успешно.
- Приложение `com.tagam.delivery` на iPhone было удалено и установлено заново через `xcrun devicectl device install app`.
- Запуск через `xcrun devicectl device process launch` прошел успешно после разблокировки iPhone.
- Пользователь подтвердил: вход через Apple на iPhone прошел успешно. Это закрывает основной локально воспроизведенный блокер Apple Review `2.1(a)`, где Apple не проходил дальше экрана логина.
- Создан и проверен demo account для App Review:
  - email: `app.review@tagam.delivery`
  - password: `TagamReview2026!`
  - профиль: `App Review`, телефон `+99365000001`
  - проверка `/interface/userLogin` вернула `code=1`.
- Следующее перед повторной отправкой: пройти на iPhone сценарии Apple Login -> профиль, корзина -> checkout после Apple Login, login по demo account, выбор адреса и оформление до финальной кнопки.

## Checkout auth redirect после логина, 2026-05-27

- Проблема: после сценария корзина -> оформление -> логин пользователь оставался на экране `/user/login` уже авторизованным и должен был вручную возвращаться в корзину и снова нажимать `К оформлению`.
- Сравнение с коробкой показало: коробочный `SocialLogin.vue` после успешного входа делает `this.$router.push(this.redirect)`, если redirect был передан.
- В `src/router/index.js` добавлено сохранение `auth_redirect` в `sessionStorage` перед редиректом неавторизованного пользователя с protected-route `/checkout` на `/user/login`.
- В `src/components/checkout/AuthBridge.vue` `redirectTarget` теперь берет путь не только из `route.query.redirect`, но и из `sessionStorage.auth_redirect`; после успешного входа сохраненный redirect очищается и выполняется `router.replace(target)`.
- Добавлена страховка: если пользователь находится на `/user/*`, redirect по query потерян, но есть `cart.cartUuid`, после входа выполняется переход в `/checkout`.
- В `src/views/AuthView.vue` обработчик `afterAuthenticated` также учитывает сохраненный `sessionStorage.auth_redirect`.
- Проверки: `npm run build`, `npx cap sync android`, `android\gradlew.bat -p android assembleDebug` успешны. APK установлен на S23+ поверх текущего, `versionName=2.0.5`, `versionCode=50`, `lastUpdateTime=2026-05-27 16:44:21`.
- После повторного теста выяснилось, что emit из `AuthBridge` не всегда срабатывает в native social-login flow: экран `/user/login` показывал уже авторизованный профиль, но не уходил дальше.
- В `src/views/AuthView.vue` добавлен прямой `watch` на `client.authenticated` и проверка в `onMounted()`: как только появляется токен, экран входа сам делает `router.replace()` в сохраненный redirect, либо в `/checkout`, если есть корзина, либо в `/account`.
- По договоренности с пользователем каждая тестовая установка теперь выполняется чисто: `adb uninstall com.tagam.delivery`, затем `adb install ...app-debug.apk`.
- Повторная проверка сборки и установки: `npm run build`, `npx cap sync android`, `android\gradlew.bat -p android assembleDebug` успешны; APK чисто установлен на S23+, `firstInstallTime=2026-05-27 16:52:19`, `lastUpdateTime=2026-05-27 16:52:19`.

## Checkout: старый экран "Заказ создан" перекрывал новую корзину, 2026-05-27

- Проблема: после успешного заказа, выхода, добавления нового товара и входа через Facebook checkout показывал старый экран `Заказ создан` с предыдущим `order_uuid`, а не оформление новой корзины.
- Причина: `checkout.placedOrder` хранится в Pinia store и проверялся в `CheckoutView.vue` раньше, чем наличие новой корзины. При новом cart state старый `placedOrder` продолжал перекрывать форму checkout.
- В `src/views/CheckoutView.vue` добавлен computed `showPlacedOrder = checkout.placedOrder && !cart.cartUuid`; экран успешного заказа теперь показывается только если текущей корзины уже нет.
- В `src/stores/checkout.js` при `checkout.load()` с существующим `cart.cartUuid` принудительно сбрасывается `this.placedOrder = null`.
- Проверки: `npm run build`, `npx cap sync android`, `android\gradlew.bat -p android assembleDebug` успешны. По правилу пользователя APK установлен чисто через `adb uninstall` -> `adb install`; `firstInstallTime=2026-05-27 16:59:40`, `lastUpdateTime=2026-05-27 16:59:40`.
## Backend: очистка заказов тестового клиента, 2026-05-27

- По просьбе пользователя удалены заказы клиента `sheremetyev.p@gmail.com`.
- Основной клиент сохранен: `client_id=1`, Павел Шереметьев, телефон `99365449779`.
- Также проверялся связанный тестовый/guest-клиент с тем же телефоном.
- Первичная очистка затронула заказы: `33,34,86,87,107,108,109,110,111,112`.
- После повторной проверки были найдены и удалены еще два свежих заказа: `113,114`.
- Заказы удалены из `st_ordernew` и дочерних таблиц `st_ordernew_*`: позиции, addons, attributes, history, meta, summary/transactions.
- Контроль после удаления: по `sheremetyev.p@gmail.com` осталось `0` заказов; по телефону `99365449779` тоже `0` заказов.
- Аккаунт клиента, профиль и авторизация не удалялись.
- Бэкапы на сервере:
  - `/root/tagam_orders_client_1_122_20260527_170450.sql`
  - `/root/tagam_orders_sheremetyev_remaining_20260527_170850.sql`

## Профиль: упрощение и трекинг, 2026-05-27

- В профиле удален верхний блок из 4 карточек `Заказы / Адреса / Статус / Локация`, потому что он дублировал список действий ниже и не давал полезного сценария.
- Отдельная вкладка `Трекинг` убрана из нижней навигации. Трекинг остается доступен из конкретного заказа, что логичнее для активных/текущих заказов.
- Проверки: `npm run build`, `npx cap sync android`, `android\gradlew.bat -p android assembleDebug` прошли успешно.
- Android APK установлен чисто на S23+ через `adb uninstall com.tagam.delivery` -> `adb install ...app-debug.apk`; версия на телефоне `2.0.5 (50)`, `firstInstallTime=2026-05-27 17:20:49`.

## Картинки: проверка загрузки оригиналов, 2026-05-27

- Подозрение подтвердилось частично: серверные оригиналы могут быть тяжелыми. Примеры:
  - `upload/1/1c75aa60-...png`: сервер `~1771 KB`, локальная webp `~70.8 KB`, `520x520`.
  - `upload/all/d6338490-...png`: сервер `~511 KB`, локальная webp `~57.8 KB`, `900x450`.
  - `upload/1/19b362b1-...jpg`: сервер `~209.8 KB`, локальная webp `~59.3 KB`.
- Основные экраны `Home`, `Restaurant`, `Search`, `Offers`, `OrderDetails`, `ItemDetailSheet` уже используют `tagamAsset()` и подменяют серверные URL на локальные `/tagam/*.webp`.
- Найдены и исправлены места с прямыми URL:
  - `src/views/CartView.vue`: логотип ресторана и картинки блюд в корзине теперь идут через `tagamAsset()`.
  - `src/views/FavouritesView.vue`: картинки избранного теперь идут через `tagamAsset()`.
- Локальный пакет оптимизированных картинок: `168` файлов, примерно `5.2 MB`.
- Проверки: `npm run build`, `npx cap sync android`, `android\gradlew.bat -p android assembleDebug` прошли успешно.
- Установка на телефон не выполнена: ADB в момент установки не видел устройство `R3CW40H0GDP` (`adb devices -l` вернул пустой список). Нужно заново подключить телефон/включить отладку, затем поставить APK чисто.

## App Store Connect: повторная отправка iOS, 2026-05-27

- В App Store Connect для iOS версии `2.0.5` выбран и отправлен на повторную проверку build `50`.
- Перед отправкой в `App Review Information` внесен demo account:
  - email: `app.review@tagam.delivery`
  - password: `TagamReview2026!`
- В notes для Apple указано, что Apple Sign In исправлен и локально проверен на реальном iPhone со сборкой `2.0.5 (50)`.
- Старый build `47`, который был отклонен Apple, удален из текущей отправки; вместо него добавлен build `50`.
- Export compliance закрыт через вариант `Ни один из вышеперечисленных алгоритмов`, так как приложение не использует собственные/нестандартные алгоритмы шифрования; предупреждение `Нет экспортных документов` исчезло.
- После отправки страница `Проверка приложения` показывает объект `iOS, приложение 2.0.5`, build `2.0.5 (50)`, статус проверки `Готово к проверке`.
- Следующее действие: ждать перехода статуса Apple из `Готово к проверке` в `На проверке` / результат review и следить за почтой/App Store Connect messages.
## Сборка 2.0.5 (52) для Apple и Google, 2026-05-28

- По решению пользователя готовится новая параллельная сборка `2.0.5 (52)` для iOS и Android, чтобы в App Store Connect и Google Play был один и тот же внутренний номер.
- Android:
  - `versionName = 2.0.5`
  - `versionCode = 52`
- iOS:
  - `MARKETING_VERSION = 2.0.5`
  - `CURRENT_PROJECT_VERSION = 52`
- Локальные проверки на Windows:
  - `npm run build` - успешно;
  - `npx cap sync` - успешно, iOS pod install/xcodebuild на Windows ожидаемо пропущены;
  - `android\gradlew.bat -p android bundleRelease` - успешно.
- Android AAB для загрузки в Google Play:
  `android\app\build\outputs\bundle\release\app-release.aab`
- Следующее:
  1. закоммитить и запушить изменения в `tagam-vite-xcode-cloud`, чтобы Xcode Cloud собрал iOS `2.0.5 (52)`;
  2. после появления build `52` в App Store Connect выбрать его для версии `2.0.5`, закрыть export compliance и отправить на App Review;
  3. загрузить Android AAB `52` в Google Play closed testing.
