<template>
  <section class="page fade-up">
    <AppHeader :title="isSuccess ? text.created : text.title" :icon="ReceiptText" action-label="Order" />

    <div v-if="orders.detailsLoading && !details" class="grid gap-4">
      <div class="warm-skeleton h-48 rounded-[8px]" />
      <div class="warm-skeleton h-28 rounded-[8px]" />
      <div class="warm-skeleton h-40 rounded-[8px]" />
    </div>

    <div v-else-if="orders.detailsError" class="soft-card p-5">
      <h1 class="m-0 text-2xl font-black">{{ text.notFound }}</h1>
      <p class="muted m-0 mt-2 text-sm">{{ detailsErrorText }}</p>
      <button class="primary-button tap-motion mt-4 w-full" type="button" @click="load">
        {{ text.retry }}
      </button>
      <RouterLink class="tagam-pill tap-motion mt-3 w-full px-4 py-3" to="/account">{{ text.openProfile }}</RouterLink>
    </div>

    <template v-else-if="details">
      <div class="tagam-card tagam-glow p-5 text-center">
        <p class="brand-kicker m-0">{{ estimatedLabel }}</p>
        <h1 class="m-0 mt-2 text-3xl font-black">{{ orderInfo.estimated_time || estimationLabel || statusLabel }}</h1>
        <img class="mx-auto mt-4 h-32 w-full object-contain" src="/onboarding-3.png" alt="" />
        <p class="muted m-0 mt-3 text-sm">#{{ orderInfo.order_id || orderInfo.order_uuid || orderUuid }}</p>
      </div>

      <section class="tagam-card grid gap-3 p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="brand-kicker m-0">{{ text.detailsKicker }}</p>
            <h2 class="m-0 mt-1 text-2xl font-black">{{ merchant.restaurant_name || text.restaurant }}</h2>
            <p class="muted m-0 mt-1 text-sm">{{ orderInfo.place_on || orderInfo.date_created }}</p>
          </div>
          <span class="tagam-pill is-active min-h-0 px-3 py-1 text-xs">{{ readableStatus }}</span>
        </div>

        <div class="grid gap-2 text-sm">
          <div class="flex justify-between gap-3">
            <span class="muted">{{ text.payment }}</span>
            <strong class="text-right">{{ orderInfo.payment_name || orderInfo.payment_code || text.payment }}</strong>
          </div>
          <div v-if="deliveryAddress" class="flex justify-between gap-3">
            <span class="muted">{{ text.delivery }}</span>
            <strong class="max-w-[70%] text-right">{{ deliveryAddress }}</strong>
          </div>
          <div class="flex justify-between gap-3">
            <span class="muted">{{ text.total }}</span>
            <strong>{{ totalLabel }}</strong>
          </div>
        </div>
      </section>

      <section v-if="progressLines.length" class="soft-card grid gap-3 p-4">
        <h2 class="m-0 text-lg font-black">{{ text.status }}</h2>
        <div v-for="(line, index) in progressLines" :key="`${line.title}-${index}`" class="flex gap-3">
          <span class="mt-1 h-3 w-3 shrink-0 rounded-full" :class="line.done ? 'bg-[var(--app-accent)]' : 'bg-white/20'" />
          <div>
            <strong>{{ line.title }}</strong>
            <p v-if="line.subtitle" class="muted m-0 mt-1 text-sm">{{ line.subtitle }}</p>
          </div>
        </div>
      </section>

      <section class="soft-card overflow-hidden">
        <button class="account-row tap-motion" type="button" @click="itemsOpen = !itemsOpen">
          <span><ShoppingBag :size="20" /> {{ text.items }}</span>
          <span class="muted text-sm">{{ orderItems.length }}</span>
        </button>
        <div v-if="itemsOpen" class="grid gap-3 border-t border-white/10 p-4">
          <article v-for="item in orderItems" :key="item.cart_row || item.item_id || item.item_uuid" class="flex gap-3">
            <img v-if="item.url_image" class="h-16 w-16 rounded-[8px] object-cover" :src="kmrsAsset(item.url_image)" :alt="decodeHtml(item.item_name)" />
            <div v-else class="grid h-16 w-16 place-items-center rounded-[8px] bg-[var(--app-accent-soft)] text-xs font-black text-[var(--app-muted)]">TAGAM</div>
            <div class="min-w-0 flex-1">
              <h3 class="m-0 text-sm font-black">{{ item.qty }} x {{ decodeHtml(item.item_name) }}</h3>
              <p class="muted m-0 mt-1 text-xs">{{ item.price?.pretty_price_after_discount || item.price?.pretty_price || item.price }}</p>
            </div>
            <strong class="text-sm">{{ item.price?.pretty_total_after_discount || item.price?.pretty_total || item.subtotal_pretty }}</strong>
          </article>
        </div>
      </section>

      <section v-if="summaryRows.length" class="soft-card grid gap-3 p-4">
        <div v-for="row in summaryRows" :key="row.type || row.name" class="flex justify-between gap-3">
          <span class="muted">{{ row.name }}</span>
          <strong>{{ row.value }}</strong>
        </div>
      </section>

      <div class="grid grid-cols-2 gap-3">
        <RouterLink class="tagam-pill tap-motion px-4 py-3" :to="{ path: '/tracking', query: { order_uuid: orderUuid } }">
          <MapPinned :size="17" />
          {{ text.track }}
        </RouterLink>
        <button class="tagam-pill tap-motion px-4 py-3" type="button" :disabled="orders.buyAgainLoading" @click="buyAgain">
          <RefreshCcw :size="17" />
          {{ text.repeat }}
        </button>
        <RouterLink v-if="canReview" class="tagam-pill tap-motion px-4 py-3" :to="{ path: '/order/rate-driver', query: { order_uuid: orderUuid } }">
          <Star :size="17" />
          {{ text.review }}
        </RouterLink>
        <button v-if="canCancel" class="tagam-pill tap-motion px-4 py-3 text-rose-100" type="button" :disabled="orders.cancelLoading" @click="openCancel">
          <Ban :size="17" />
          {{ text.cancel }}
        </button>
      </div>
      <p v-if="orders.buyAgainError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ orders.buyAgainError }}
      </p>
      <p v-if="orders.cancelError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ orders.cancelError }}
      </p>
    </template>
  </section>

  <Teleport to="body">
    <div v-if="cancelOpen" class="fixed inset-0 z-50 flex items-end bg-black/60 p-3 backdrop-blur-sm" @click.self="cancelOpen = false">
      <section class="tagam-card mx-auto w-full max-w-[520px] rounded-t-[8px] p-4 pb-[calc(16px+var(--safe-bottom))] shadow-2xl">
        <div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--app-border)]" />
        <p class="brand-kicker m-0">ORDER CANCEL</p>
        <h2 class="m-0 mt-1 text-2xl font-black">{{ text.cancelTitle }}</h2>
        <p class="muted m-0 mt-2 text-sm">
          {{ cancelMessage }}
        </p>
        <div v-if="cancelPreview?.refund_msg" class="mt-3 rounded-[8px] border border-white/10 bg-[var(--app-control)] p-3 text-sm">
          {{ cancelPreview.refund_msg }}
        </div>
        <div class="mt-5 grid grid-cols-2 gap-3">
          <button class="tagam-pill tap-motion px-4 py-3" type="button" @click="cancelOpen = false">{{ text.keep }}</button>
          <button class="primary-button tap-motion w-full bg-rose-400 text-black" type="button" :disabled="orders.cancelLoading || cancelDisabled" @click="confirmCancel">
            {{ text.cancel }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { Ban, MapPinned, ReceiptText, RefreshCcw, ShoppingBag, Star } from "@lucide/vue";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppHeader from "src/components/ui/AppHeader.vue";
import { useOrdersStore } from "src/stores/orders";
import { useCartStore } from "src/stores/cart";
import { useAppStore } from "src/stores/app";
import { kmrsAsset } from "src/services/kmrsAssets";

const labels = {
  ru: {
    title: "Детали заказа",
    created: "Заказ создан",
    notFound: "Заказ не найден",
    retry: "Повторить",
    openProfile: "Открыть профиль",
    missingText: "Мы не нашли этот заказ. Откройте историю заказов или профиль, чтобы выбрать существующий заказ.",
    detailsKicker: "Детали заказа",
    restaurant: "Ресторан",
    payment: "Оплата",
    delivery: "Доставка",
    total: "Итого",
    status: "Статус",
    items: "Состав заказа",
    track: "Трекинг",
    repeat: "Повторить",
    review: "Отзыв",
    cancel: "Отменить",
    cancelTitle: "Отменить заказ?",
    keep: "Оставить",
    cancelMessage: "Проверяем возможность отмены. Если отмена доступна, заказ будет отменен сразу после подтверждения.",
    pickupEta: "Ожидаемое время самовывоза",
    dineinEta: "Ожидаемое время в зале",
    deliveryEta: "Ожидаемое время доставки",
    statuses: {
      new: "Новый",
      accepted: "Принят",
      processing: "Готовится",
      ready: "Готов",
      delivery: "В доставке",
      delivered: "Доставлен",
      completed: "Завершен",
      complete: "Завершен",
      cancelled: "Отменен",
      canceled: "Отменен",
    },
    defaultProgress: [
      ["Заказ отправлен", "Заказ отправлен в ресторан", 1],
      ["Статус ресторана", "", 2],
      ["Доставка", "", 3],
      ["Завершение", "", 4],
    ],
  },
  tk: {
    title: "Sargyt maglumatlary",
    created: "Sargyt döredildi",
    notFound: "Sargyt tapylmady",
    retry: "Gaýtadan synan",
    openProfile: "Profili aç",
    missingText: "Bu sargyt tapylmady. Bar bolan sargydy saýlamak üçin sargyt taryhyny ýa-da profili açyň.",
    detailsKicker: "Sargyt maglumatlary",
    restaurant: "Restoran",
    payment: "Töleg",
    delivery: "Eltip bermek",
    total: "Jemi",
    status: "Ýagdaý",
    items: "Sargydyň düzümi",
    track: "Gözegçilik",
    repeat: "Gaýtala",
    review: "Syn",
    cancel: "Ýatyr",
    cancelTitle: "Sargydy ýatyrmalymy?",
    keep: "Goý",
    cancelMessage: "Ýatyrmak mümkinçiligi barlanýar. Mümkin bolsa, tassyklandan soň sargyt ýatyrylar.",
    pickupEta: "Almak üçin garaşylýan wagt",
    dineinEta: "Zalda garaşylýan wagt",
    deliveryEta: "Eltip bermek wagty",
    statuses: {
      new: "Täze",
      accepted: "Kabul edildi",
      processing: "Taýýarlanýar",
      ready: "Taýýar",
      delivery: "Eltip berilýär",
      delivered: "Eltildi",
      completed: "Tamamlandy",
      complete: "Tamamlandy",
      cancelled: "Ýatyryldy",
      canceled: "Ýatyryldy",
    },
    defaultProgress: [
      ["Sargyt ugradyldy", "Sargyt restorana ugradyldy", 1],
      ["Restoranyň ýagdaýy", "", 2],
      ["Eltip bermek", "", 3],
      ["Tamamlamak", "", 4],
    ],
  },
  en: {
    title: "Order details",
    created: "Order created",
    notFound: "Order not found",
    retry: "Retry",
    openProfile: "Open profile",
    missingText: "We could not find this order. Open your order history or profile to choose an existing order.",
    detailsKicker: "Order details",
    restaurant: "Restaurant",
    payment: "Payment",
    delivery: "Delivery",
    total: "Total",
    status: "Status",
    items: "Order items",
    track: "Track",
    repeat: "Repeat",
    review: "Review",
    cancel: "Cancel",
    cancelTitle: "Cancel order?",
    keep: "Keep",
    cancelMessage: "Checking cancellation availability. If cancellation is available, the order will be cancelled after confirmation.",
    pickupEta: "Estimated pickup time",
    dineinEta: "Estimated dine-in time",
    deliveryEta: "Estimated delivery time",
    statuses: {
      new: "New",
      accepted: "Accepted",
      processing: "Preparing",
      ready: "Ready",
      delivery: "Out for delivery",
      delivered: "Delivered",
      completed: "Completed",
      complete: "Completed",
      cancelled: "Cancelled",
      canceled: "Cancelled",
    },
    defaultProgress: [
      ["Order sent", "Order sent to the restaurant", 1],
      ["Restaurant status", "", 2],
      ["Delivery", "", 3],
      ["Completion", "", 4],
    ],
  },
};

const route = useRoute();
const router = useRouter();
const app = useAppStore();
const orders = useOrdersStore();
const cart = useCartStore();
const itemsOpen = ref(true);
const cancelOpen = ref(false);

const text = computed(() => labels[app.language] || labels.ru);
const isMissingOrderError = (value) => /order not found|record not found|no results/i.test(String(value || ""));
const detailsErrorText = computed(() => (isMissingOrderError(orders.detailsError) ? text.value.missingText : orders.detailsError));
const orderUuid = computed(() => String(route.query.order_uuid || route.params.order_uuid || ""));
const isSuccess = computed(() => route.name === "order-success");
const details = computed(() => orders.orderDetails(orderUuid.value));
const orderInfo = computed(() => details.value?.order?.order_info ?? details.value?.order_info ?? {});
const merchant = computed(() => details.value?.merchant ?? details.value?.merchant_info ?? {});
const orderItems = computed(() => details.value?.items ?? details.value?.order_items ?? []);
const summaryRows = computed(() => details.value?.summary ?? details.value?.order?.summary ?? []);
const orderStatus = computed(() => details.value?.order_status ?? details.value?.status ?? {});
const progress = computed(() => details.value?.progress ?? {});
const orderProgress = computed(() => Number(progress.value?.order_progress ?? 1));
const statusLabel = computed(() =>
  progress.value?.order_status ||
  orderStatus.value.status ||
  orderInfo.value.status ||
  orderInfo.value.status_raw ||
  text.value.statuses.new
);
const statusDetails = computed(() => progress.value?.order_status_details || "");
const readableStatus = computed(() => {
  const status = String(statusLabel.value || "").toLowerCase();
  return text.value.statuses[status] || statusLabel.value;
});
const cancelPreview = computed(() => orders.cancelPreview(orderUuid.value));
const canCancel = computed(() => {
  const allowed = details.value?.status_allowed_cancelled ?? details.value?.cancel_allowed ?? orderInfo.value?.status_allowed_cancelled;
  return allowed === true || allowed === 1 || allowed === "1" || allowed === "yes";
});
const canReview = computed(() => {
  const review = details.value?.review_status ?? details.value?.review ?? {};
  const status = String(orderInfo.value?.status || orderInfo.value?.status_raw || "").toLowerCase();
  const alreadyReviewed = review?.reviewed === true || review?.can_review === false || review?.status === "reviewed";
  return !alreadyReviewed && ["delivered", "completed", "complete"].some((value) => status.includes(value));
});
const cancelDisabled = computed(() => cancelPreview.value && cancelPreview.value.cancel_status === false);
const cancelMessage = computed(() => cancelPreview.value?.cancel_msg || text.value.cancelMessage);
const estimationLabel = computed(() => details.value?.estimation?.label || details.value?.estimation?.value || "");
const estimatedLabel = computed(() => {
  if (orderInfo.value.service_code === "pickup") return text.value.pickupEta;
  if (orderInfo.value.service_code === "dinein") return text.value.dineinEta;
  return text.value.deliveryEta;
});
const deliveryAddress = computed(() =>
  [
    orderInfo.value.address_label,
    orderInfo.value.complete_delivery_address,
    orderInfo.value.location_name,
  ].filter(Boolean).join(" · ")
);
const totalLabel = computed(() =>
  orderInfo.value.total_from_used_currency_to_based_currency_pretty ||
  orderInfo.value.total_pretty ||
  orderInfo.value.total ||
  summaryRows.value.find((row) => row.type === "total")?.value ||
  ""
);
const progressLines = computed(() => {
  if (Array.isArray(progress.value)) {
    return progress.value.map((item) => ({
      title: item.label || item.status || item.title,
      subtitle: item.description || item.subtitle || item.date,
      done: item.active || item.done || item.completed,
    }));
  }
  return text.value.defaultProgress.map(([title, subtitle, requiredProgress]) => {
    const done = orderProgress.value >= requiredProgress;
    const isCurrent = done && orderProgress.value === requiredProgress;
    return {
      title: isCurrent ? readableStatus.value || title : title,
      subtitle: isCurrent ? statusDetails.value || subtitle : subtitle,
      done,
    };
  });
});

const decodeHtml = (value) => {
  const element = document.createElement("div");
  element.innerHTML = String(value ?? "");
  return element.textContent || "";
};

const load = () => orders.loadDetails(orderUuid.value, true).catch(() => {});
const buyAgain = async () => {
  const result = await orders.buyAgain(orderUuid.value).catch(() => null);
  const cartUuid = result?.cart_uuid || result?.data?.cart_uuid;
  if (cartUuid) {
    cart.rememberCart(cartUuid);
    await cart.refresh().catch(() => {});
  }
  router.push("/cart");
};
const openCancel = async () => {
  cancelOpen.value = true;
  await orders.loadCancelPreview(orderUuid.value).catch(() => {});
};
const confirmCancel = async () => {
  await orders.cancelOrder(orderUuid.value).catch(() => null);
  cancelOpen.value = false;
};

onMounted(load);
</script>

<style scoped>
.account-row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  color: var(--app-fg);
  text-align: left;
  font-weight: 850;
}

.account-row > span {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-row svg {
  color: var(--app-accent);
}
</style>
