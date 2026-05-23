<template>
  <section class="page fade-up">
    <AppHeader :title="isSuccess ? 'Заказ создан' : 'Детали заказа'" :icon="ReceiptText" action-label="Order" />

    <div v-if="orders.detailsLoading && !details" class="grid gap-4">
      <div class="warm-skeleton h-48 rounded-[8px]" />
      <div class="warm-skeleton h-28 rounded-[8px]" />
      <div class="warm-skeleton h-40 rounded-[8px]" />
    </div>

    <div v-else-if="orders.detailsError" class="soft-card p-5">
      <h1 class="m-0 text-2xl font-black">Заказ не найден</h1>
      <p class="muted m-0 mt-2 text-sm">{{ orders.detailsError }}</p>
      <button class="primary-button tap-motion mt-4 w-full" type="button" @click="load">
        Повторить
      </button>
      <RouterLink class="tagam-pill tap-motion mt-3 w-full px-4 py-3" to="/account">Открыть профиль</RouterLink>
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
            <p class="brand-kicker m-0">ДЕТАЛИ ЗАКАЗА</p>
            <h2 class="m-0 mt-1 text-2xl font-black">{{ merchant.restaurant_name || 'KMRS' }}</h2>
            <p class="muted m-0 mt-1 text-sm">{{ orderInfo.place_on || orderInfo.date_created }}</p>
          </div>
          <span class="tagam-pill is-active min-h-0 px-3 py-1 text-xs">{{ readableStatus }}</span>
        </div>

        <div class="grid gap-2 text-sm">
          <div class="flex justify-between gap-3">
            <span class="muted">Оплата</span>
            <strong class="text-right">{{ orderInfo.payment_name || orderInfo.payment_code || 'KMRS' }}</strong>
          </div>
          <div v-if="deliveryAddress" class="flex justify-between gap-3">
            <span class="muted">Доставка</span>
            <strong class="max-w-[70%] text-right">{{ deliveryAddress }}</strong>
          </div>
          <div class="flex justify-between gap-3">
            <span class="muted">Итого</span>
            <strong>{{ totalLabel }}</strong>
          </div>
        </div>
      </section>

      <section v-if="progressLines.length" class="soft-card grid gap-3 p-4">
        <h2 class="m-0 text-lg font-black">Статус</h2>
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
          <span><ShoppingBag :size="20" /> Состав заказа</span>
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
          Трекинг
        </RouterLink>
        <button class="tagam-pill tap-motion px-4 py-3" type="button" :disabled="orders.buyAgainLoading" @click="buyAgain">
          <RefreshCcw :size="17" />
          Повторить
        </button>
        <RouterLink v-if="canReview" class="tagam-pill tap-motion px-4 py-3" :to="{ path: '/order/write-review', query: { order_uuid: orderUuid } }">
          <Star :size="17" />
          Отзыв
        </RouterLink>
        <button v-if="canCancel" class="tagam-pill tap-motion px-4 py-3 text-rose-100" type="button" :disabled="orders.cancelLoading" @click="openCancel">
          <Ban :size="17" />
          Отменить
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
        <p class="brand-kicker m-0">KMRS CANCEL</p>
        <h2 class="m-0 mt-1 text-2xl font-black">Отменить заказ?</h2>
        <p class="muted m-0 mt-2 text-sm">
          {{ cancelMessage }}
        </p>
        <div v-if="cancelPreview?.refund_msg" class="mt-3 rounded-[8px] border border-white/10 bg-[var(--app-control)] p-3 text-sm">
          {{ cancelPreview.refund_msg }}
        </div>
        <div class="mt-5 grid grid-cols-2 gap-3">
          <button class="tagam-pill tap-motion px-4 py-3" type="button" @click="cancelOpen = false">Оставить</button>
          <button class="primary-button tap-motion w-full bg-rose-400 text-black" type="button" :disabled="orders.cancelLoading || cancelDisabled" @click="confirmCancel">
            Отменить
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
import { kmrsAsset } from "src/services/kmrsAssets";

const route = useRoute();
const router = useRouter();
const orders = useOrdersStore();
const cart = useCartStore();
const itemsOpen = ref(true);
const cancelOpen = ref(false);

const orderUuid = computed(() => String(route.query.order_uuid || route.params.order_uuid || ""));
const isSuccess = computed(() => route.name === "order-success");
const details = computed(() => orders.orderDetails(orderUuid.value));
const orderInfo = computed(() => details.value?.order?.order_info ?? details.value?.order_info ?? {});
const merchant = computed(() => details.value?.merchant ?? details.value?.merchant_info ?? {});
const orderItems = computed(() => details.value?.items ?? details.value?.order_items ?? []);
const summaryRows = computed(() => details.value?.summary ?? details.value?.order?.summary ?? []);
const orderStatus = computed(() => details.value?.order_status ?? details.value?.status ?? {});
const statusLabel = computed(() => orderStatus.value.status || orderInfo.value.status || orderInfo.value.status_raw || "KMRS");
const readableStatus = computed(() => {
  const status = String(statusLabel.value || "").toLowerCase();
  const labels = {
    new: "Новый",
    accepted: "Принят",
    processing: "Готовится",
    ready: "Готов",
    delivery: "В доставке",
    delivered: "Доставлен",
    completed: "Завершен",
    cancelled: "Отменен",
    canceled: "Отменен",
  };
  return labels[status] || statusLabel.value;
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
const cancelMessage = computed(() =>
  cancelPreview.value?.cancel_msg ||
  "Проверяем правила отмены на сервере KMRS. Если отмена доступна, заказ будет отменен сразу после подтверждения."
);
const estimationLabel = computed(() => details.value?.estimation?.label || details.value?.estimation?.value || "");
const estimatedLabel = computed(() => {
  if (orderInfo.value.service_code === "pickup") return "Ожидаемое время самовывоза";
  if (orderInfo.value.service_code === "dinein") return "Ожидаемое время в зале";
  return "Ожидаемое время доставки";
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
  const progress = details.value?.progress;
  if (Array.isArray(progress)) {
    return progress.map((item) => ({
      title: item.label || item.status || item.title,
      subtitle: item.description || item.subtitle || item.date,
      done: item.active || item.done || item.completed,
    }));
  }
  return [
    { title: "Ресторан принял заказ", subtitle: merchant.value.restaurant_name, done: true },
    { title: "Кухня готовит", subtitle: readableStatus.value, done: true },
    { title: "Передача клиенту", subtitle: estimationLabel.value, done: false },
  ];
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
