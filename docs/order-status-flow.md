# Статусы заказа Tagam / Tagam

Customer app должен следовать модели трекинга из коробочной Tagam legacy app. В backend есть несколько внутренних потоков статусов, но клиентский UI должен оставаться простым и не показывать кухонные/курьерские технические детали слишком рано.

## Источники статусов

Есть три разных потока статусов:

1. `order.status`
   - Управляется merchant/admin.
   - Именно он двигает клиентский `progress.order_progress`.
   - Это главный источник для order details и tracking UI.

2. KDS kitchen item status
   - Хранится на кухонных строках заказа/позиций.
   - Используется только кухонным экраном.
   - Сам по себе не должен двигать клиентский tracking progress.

3. `order.delivery_status`
   - Управляется действиями курьера и назначением курьера со стороны merchant/admin.
   - Курьер может быть назначен до готовности заказа.
   - Сам факт назначения курьера не значит, что клиенту уже нужно показывать live courier tracking.

## Клиентский progress

Коробка сводит backend-статусы к короткой клиентской модели:

| Customer progress | Основной `order.status` | Что видит/понимает клиент |
| --- | --- | --- |
| `1` | `new` | Заказ отправлен ресторану на подтверждение. |
| `2` | `accepted` | Ресторан принял заказ, заказ готовится. |
| `2` | `ready for pickup` для delivery-заказов | Заказ готов, но курьер еще не везет его клиенту. |
| `3` | `delivery on its way` | Курьер едет к клиенту; можно показывать live tracking. |
| `4` | `delivered`, `complete` | Заказ завершен. |
| `0` | `cancelled`, `rejected`, failed statuses | Заказ отменен/отклонен/неуспешен. |

Для pickup/dine-in заказов `ready for pickup` может соответствовать progress `3`, потому что там нет отдельной фазы доставки курьером.

## Flow в Merchant

Кнопки статусов в Merchant генерируются backend-настройками order buttons. Обычный delivery flow:

1. Новый заказ приходит в Merchant.
2. Merchant принимает заказ: основной `order.status` становится `accepted`.
3. Merchant может отправить заказ в KDS. Это кухонная операция; сама по себе она не должна менять клиентский tracking progress.
4. Merchant отмечает заказ готовым: основной `order.status` становится `ready for pickup`.
5. Merchant может назначить курьера в любой момент, если backend это разрешает. Это меняет только `delivery_status`.

## Flow в KDS

KDS-статусы относятся к кухонной работе:

| KDS status | Русская метка |
| --- | --- |
| `queue` | Очередь |
| `in progress` | В процессе |
| `ready` | Готово |
| `delayed` | Задержан |
| `cancelled` | Отменен |
| `completed` | Завершен |

KDS `Bump` завершает кухонную работу по позиции/заказу. Это не надо показывать как клиентский progress, если backend отдельно не поменял основной `order.status`.

## Flow курьера

Courier delivery statuses являются операционными:

| Delivery status | Русская метка |
| --- | --- |
| `assigned` | Курьер назначен |
| `acknowledged` | Подтвержден курьером |
| `on the way to restaurant` | На пути в заведение |
| `arrived at restaurant` | Прибыл в заведение |
| `waiting for order` | Ожидает заказ |
| `order pickup` | Заказ забран |
| `delivery started` | Доставка начата |
| `arrived at customer` | Прибыл к клиенту |
| `delivery delivered` | Доставлено |
| `declined` | Отклонено курьером |
| `failed` | Сбой доставки |

Коробочный backend переводит основной `order.status` в `delivery on its way` только когда курьер уже начинает ехать к клиенту. Это самый ранний момент, когда customer app должна показывать live courier map.

## Правила для customer app

- Брать текст статуса из `progress.order_status` и `progress.order_status_details`.
- Не придумывать свои ресторанные/кухонные/курьерские статусы в клиентском UI.
- Показывать delivery map только когда:
  - тип заказа `delivery`;
  - `progress.order_progress === 3`.
- Информацию о назначенном курьере можно показать вторично, если API ее вернул, но назначение курьера не должно означать, что доставка уже началась.
- KDS-статусы не выводить в customer tracking timeline, пока backend явно не отдал их как customer `progress`.

## Где смотреть в коробке

- Customer progress: `protected/components/CTrackingOrder.php`
- Merchant status update: `modules/MerchantModules/files/InterfacemerchantController.php`
- KDS settings и обновление kitchen status: `modules/KitchenModules/ApikitchenController.php`
- Driver delivery steps: `modules/DriverModules/CDriver.php`
- Hook, где delivery status влияет на основной order status: `protected/models/AR_ordernew.php`
