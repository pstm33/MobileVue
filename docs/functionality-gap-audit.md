# Аудит расхождений с коробочной KMRS MobileVue

База для сравнения: `C:\Users\ps\Documents\KMRS\MobileVue`.

Цель: переносить серверную логику и пользовательские сценарии коробки, но не терять новый Tagam UI.

## Checkout / оформление заказа

| Зона | Как в коробке MobileVue | Как сейчас в Tagam app | Статус |
| --- | --- | --- | --- |
| Тип заказа | Из корзины приходят доступные сервисы ресторана; пользователь переключает доставка/самовывоз и другие варианты. | Сервисы показываются и вызывают `setTransactionType`. | Почти совпадает |
| Время доставки | `DeliverySched` открывает даты/слоты через `getDeliveryDateTime`, затем сохраняет `setDeliveryTime`. | Расписание восстановлено: даты/слоты открываются и сохраняются теми же endpoint'ами. | Восстановлено |
| Доставка сейчас | Вызывает `setDeliveryNow`. | Вызывает `setDeliveryNow`. | Совпадает |
| Адрес доставки | Checkout показывает текущий адрес корзины/сессии; сохраненные адреса выбираются вручную через `AddressRecent`, новый адрес можно взять с геолокации/карты и уточнить в `AddressDetails`. В заказ уходит `address_uuid`. | В checkout добавлены сохраненные адреса клиента, выбор прошлого адреса подтягивает дом/улицу/подъезд/инструкции и `address_uuid`. Новый адрес идет через `/location?redirect=/checkout&new_address=1`, стартует с геолокации/карты, затем сохраняется через `SavedAddress`. | Восстановлено базово |
| Промокод | Есть список промо, применить и удалить. | Список/применение/удаление есть в checkout summary. | Почти совпадает |
| Баллы | Есть применение и удаление баллов в cart-flow. | Баллы применяются через `applyPoints`/`redeemPoints`, удаляются через `removePoints`. | Восстановлено |
| Кошелек | Есть цифровой кошелек и strict-wallet режим. | Кошелек применяется; strict-wallet блокирует заказ, если осталась сумма к оплате. | Почти совпадает |
| Сдача при COD | Если COD требует сдачу, коробка валидирует сумму. | Если `credentials.attr1 === 1`, checkout блокирует отправку без суммы сдачи. | Восстановлено |
| Online payment redirect | После создания заказа обрабатывается provider render/payment URL. | Если `PlaceOrder` вернул `payment_url` и это не offline, app открывает оплату. | Восстановлено базово |
| Самовывоз | Перед финальной отправкой показывается подтверждение pickup-заказа. | Подтверждение pickup добавлено перед `PlaceOrder`. | Восстановлено |

## Заказы и трекинг

| Зона | Как в коробке MobileVue | Как сейчас в Tagam app | Статус |
| --- | --- | --- | --- |
| Статус заказа для клиента | Используются `order.status`, `order_status`, `order_status_details`, `order_progress`. | Используется реальный progress из API, без выдуманных кухонных статусов сразу после заказа. | Совпадает |
| Карта курьера | Показывается после `order_progress === 3` для delivery-заказов. | Карта включается только для delivery + progress 3. | Совпадает |
| Статус кухни | KDS-статусы отдельные: queue, in progress, ready, delayed, cancelled, completed. | Не показываются как фальшивая customer timeline. | Совпадает |
| Статус доставки | Driver lifecycle отдельный; курьер может быть назначен до готовности еды. | Живое движение курьера показывается только когда доставка реально активна для клиента. | Совпадает |
| Оценка курьера | Отдельный flow: сначала курьер, затем ресторан/заказ. | Добавлен `/order/rate-driver`: `getOrdertoreview` -> `addRiderReview` -> отзыв о заказе при необходимости. | Восстановлено базово |

## Аккаунт и авторизация

| Зона | Как в коробке MobileVue | Как сейчас в Tagam app | Статус |
| --- | --- | --- | --- |
| Login routes | Отдельные `/user/login`, OTP, email, phone, signup, reset. | Один `AuthBridge` закрывает guest, email/password, phone OTP, signup, reset и social completion; старые routes мапятся в нужный режим. | Почти совпадает |
| Complete registration | Отдельный экран добирает профиль и пароль после неполной/social регистрации. | Social completion есть в `AuthBridge`/`SocialAuthButtons`; legacy `/account/complete-registration` ведет в профиль. Отдельный добор пароля на этом route не восстановлен. | Частично |
| Security/manage account | Отдельные change password, manage account, delete, request data. | `/account/security` закрывает смену пароля, request data, verify/delete account; старые routes редиректятся сюда. | Почти совпадает |
| Account menu | Профиль, заказы, адреса, платежи, избранное, wallet, points, брони, чат, уведомления, язык/валюта, legal, logout. | Новый `/account` содержит основные входы и сохраняет Tagam UI. | Почти совпадает |

## Бронирования

| Зона | Как в коробке MobileVue | Как сейчас в Tagam app | Статус |
| --- | --- | --- | --- |
| Список/детали | Список, фильтры статусов, tracking по стадиям. | Объединенный booking view показывает список, детали и шкалу статусов по серверным спискам. | Почти совпадает |
| Отмена | Причина через `getCancelreason`, отправка `CancelReservation`; кнопки скрываются для запрещающих статусов. | Используются те же endpoints и ограничения. | Почти совпадает |
| Изменение | `/booking/update` грузит детали, слоты, меняет контактные данные, дату, гостей, зал/стол. | `/booking/update` работает в режиме изменения через `fetchBookingdetails`, `fetchTimeslot`, `UpdateBooking`. | Восстановлено базово |
| Поиск брони | `/booking/search?q=...` вызывает `BookingSearch` и открывает найденную бронь. | `/booking/search` вызывает `BookingSearch` и ведет в детали брони. | Восстановлено базово |

## Платежи, кошелек, уведомления

| Зона | Как в коробке MobileVue | Как сейчас в Tagam app | Статус |
| --- | --- | --- | --- |
| Saved payments | Есть список сохраненных оплат, удалить, сделать основной через `setPrimaryPayment`. | Список есть; удалить и сделать основной используют коробочные endpoints. | Восстановлено |
| Payment provider flow | Provider-компоненты могут открыть форму/redirect или сохранить provider через `SavedPaymentProvider`. | Кнопка provider вызывает `SavedPaymentProvider`; если сервер возвращает `payment_url`/`redirect_url`, app открывает его. Provider-specific встроенные формы пока упрощены. | Восстановлено базово |
| Wallet top-up | `prepareAddFunds`, receipt page, история операций. | `/wallet` показывает баланс/points/историю, готовит пополнение через `prepareAddFunds`, открывает redirect и имеет `/wallet/receipt`. | Почти совпадает |
| Notifications list | `getNotification` через token POST, удаление `deleteNotification`. | Список переведен на коробочный `getNotification`, удаление через `deleteNotification`. | Совпадает |
| Push settings | `saveNotifications`/`savenotifications`; при включении web/native push регистрируется token через `PushSubscribe`. | Native push запрашивает permission, регистрирует token через `PushSubscribe`, сохраняет настройку и подписывает FCM topic. Web/PWA push в браузере пока упрощен. | Восстановлено базово |

## Merchant / KDS / Driver

Проверка живой системы показала:

- Новый заказ сначала приходит в Merchant. Merchant принимает заказ, может отправить на кухню/отметить готовность, назначить курьера при доступной схеме доставки.
- KDS имеет отдельную кухонную очередь. Принятый merchant-заказ не обязан сразу появляться в KDS, пока его не отправили/он не попал в кухонную очередь.
- Driver имеет отдельный delivery lifecycle. Курьер может быть назначен до готовности еды, но customer app не должна показывать живое движение курьера до фактической активной доставки.
- `self_delivery=true`: ресторан видит/назначает своих курьеров.
- `self_delivery=false`: ресторан обычно не назначает глобальных курьеров, доставкой управляет центральная/админская схема.

Подробная схема статусов: [order-status-flow.md](./order-status-flow.md).

## Перед публикацией

Оставшиеся осознанные упрощения:

- отдельный legacy screen `/account/complete-registration` не полностью повторяет коробочный добор пароля;
- provider-specific формы оплаты не встроены по одному компоненту на каждого провайдера, но redirect/server flow восстановлен;
- web/PWA push в браузере упрощен, для мобильной публикации важнее native push.
