# Социальный вход Tagam Delivery

## Текущее состояние

- Backend включает Google, Facebook и Apple.
- В customer app показываются Google, Facebook и Apple, если backend Tagam возвращает провайдер включенным.
- Apple показывается и на Android, и на iOS, потому что плагин поддерживает Apple OAuth на Android.
- iOS получил URL schemes и callback-обработчики для Google/Facebook как в коробочной legacy app.

## Facebook

На 2026-05-25 Facebook Login больше не скрывается клиентом по умолчанию: кнопка показывается, если backend возвращает `app_enabled_fb_login`.

`VITE_ENABLE_FACEBOOK_LOGIN=false` можно использовать только как аварийный выключатель для сборки, если Meta login снова нужно временно скрыть.

Что остается проверить для стабильной работы Facebook:

1. Вернуть Android platform / Google Play Store entry в Meta Developers, когда приложение будет публично доступно в Google Play.
2. Проверить валидный Android key hash на реальном телефоне.
3. Если Android-вход падает с `Invalid key hash`, добавить точный hash установленного build в Meta Developers.

Ошибка на телефоне:

```text
Invalid key hash. The key hash qGc8Uz/TOEYtHg9Bo3MHMqTJFM= does not match any stored key hashes.
```

Что проверено в Facebook Developers для приложения `1606418370574325`:

1. Открыть Facebook Developers.
2. Выбрать приложение Tagam Delivery.
3. Перейти в Android settings / Key Hashes.
4. Hash из ошибки со скриншота проверить отдельно:

```text
qGc8Uz/TOEYtHg9Bo3MHMqTJFM=
```

Эта строка имеет 27 символов и не является валидным Facebook key hash. Meta дает ввести ее в поле, но после сохранения не держит. Нужно снять точную полную строку из телефона или `adb logcat`: валидный Facebook key hash обычно имеет 28 символов и декодируется в 20 байт.

5. Upload-key hash локального release keystore уже есть:

```text
YL6pMQECs51rDm9L1nKryTCoc1s=
```

6. В Facebook Developers уже есть hashes для трех известных сертификатов:
   - `t5oACjBwZKyOvr5zdQ5IEukE/nc=`
   - `YL6pMQECs51rDm9L1nKryTCoc1s=`
   - `N3wUTxxmQBhlShMDeNLDRnLdVz0=`
7. Приложение Meta опубликовано 2026-05-25. Для публикации пришлось удалить Android / Google Play Store entry, потому что Meta проверяла публичную ссылку `play.google.com/store/apps/details?id=com.tagam.delivery`, а приложение пока не доступно публично в Google Play.
8. Facebook hash относится именно к Facebook Developers; в Firebase его добавлять не нужно.

## Google

В `android/app/google-services.json` сейчас указан Android OAuth client для `com.tagam.delivery` с SHA-1:

```text
B7:9A:00:0A:30:70:64:AC:8E:BE:BE:73:75:0E:48:12:E9:04:FE:77
```

Локальный upload release keystore имеет SHA-1:

```text
60:BE:A9:31:01:02:B3:9D:6B:0E:6F:4B:D6:72:AB:C9:30:A8:73:5B
```

Что проверить в Firebase / Google Cloud OAuth:

1. В Android OAuth client должны быть package name `com.tagam.delivery` и SHA-1 сертификата, которым реально подписан установленный build.
2. Для Google Play builds нужен SHA-1 из Play Console: `Setup -> App integrity -> App signing key certificate`.
3. Для локально подписанного release нужен SHA-1 upload keystore выше.
4. После добавления SHA-1 скачать свежий `google-services.json` и положить в `android/app/google-services.json`.

Проверка 2026-05-25:

- В Firebase для Android app `com.tagam.delivery` уже есть SHA-1 и SHA-256 сертификаты.
- В Google Cloud есть Android OAuth clients для `com.tagam.delivery`, iOS OAuth client и web clients.
- Android OAuth clients в Google Cloud покрывают SHA-1:
  - `37:7C:14:4F:1C:66:40:18:65:4A:13:03:78:D2:C3:46:72:DD:57:3D`
  - `60:BE:A9:31:01:02:B3:9D:6B:0E:6F:4B:D6:72:AB:C9:30:A8:73:5B`
  - `B7:9A:00:0A:30:70:64:AC:8E:BE:BE:73:75:0E:48:12:E9:04:FE:77`
- Google Auth Platform: `Publishing status = In production`, `User type = External`.
- Facebook key hash `qGc8Uz/TOEYtHg9Bo3MHMqTJFM=` не является SHA-1 сертификатом Android; Firebase отклонил его как неверный fingerprint. Это нормально, его место только в Facebook Developers.

## Apple

Backend сейчас возвращает:

```text
app_apple_app_id = com.tagam.delivery.web
apple_app_redirect_uri = https://tagam.delivery/interface/app_apple_callback
apple_web_redirect_uri = https://tagam.delivery/interface/apple_callback
```

Что проверить в Apple Developer:

1. App ID `com.tagam.delivery` имеет capability `Sign in with Apple`.
2. Service ID `com.tagam.delivery.web` включен для Sign in with Apple.
3. Primary App ID привязан к `tagam delivery (8XA96DKR4G.com.tagam.delivery)`.
4. Return URLs включают:

```text
https://tagam.delivery/interface/app_apple_callback
https://tagam.delivery/interface/apple_callback
```

5. В App Store Connect внешний TestFlight должен проходить с Apple-кнопкой, если Google/Facebook доступны на iOS.

Web PWA использует `apple_web_redirect_uri` из Tagam. Для текущего `https://tagam.delivery/interface/apple_callback` добавлен обработчик `postMessage` `apple-login`, поэтому новый сайт может принять Apple payload от существующего backend callback без немедленного изменения Apple Developer Return URL.
