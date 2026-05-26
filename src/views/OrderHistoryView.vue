<template>
  <section class="page orders-page fade-up">
    <AppHeader :title="text.title" :icon="ReceiptText" action-label="Orders" />

    <label class="tagam-card orders-search flex min-h-14 items-center gap-3 px-4">
      <Search :size="20" class="text-[var(--app-accent)]" />
      <input v-model="query" class="min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:text-[var(--app-muted)]" :placeholder="text.searchPlaceholder" />
      <button v-if="query" class="icon-button !h-9 !w-9" type="button" :aria-label="text.clear" @click="query = ''">
        <X :size="17" />
      </button>
    </label>

    <div v-if="orders.historyLoading" class="grid gap-3">
      <div v-for="index in 4" :key="index" class="warm-skeleton h-28 rounded-[8px]" />
    </div>

    <div v-else-if="orders.historyError" class="soft-card p-5">
      <h1 class="m-0 text-2xl font-black">{{ text.unavailable }}</h1>
      <p class="muted m-0 mt-2 text-sm">{{ orders.historyError }}</p>
      <button class="primary-button tap-motion mt-4 w-full" type="button" @click="load">{{ text.retry }}</button>
    </div>

    <template v-else>
      <article v-for="order in filteredOrders" :key="order.order_uuid || order.order_id" class="tagam-card order-history-card tap-motion p-4">
        <RouterLink :to="{ path: '/order/details', query: { order_uuid: order.order_uuid } }" class="block">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="brand-kicker m-0">{{ orderLabel(order) }}</p>
              <h2 class="m-0 mt-1 truncate text-xl font-black">{{ order.merchant?.restaurant_name || order.merchant_name || order.restaurant_name || text.restaurant }}</h2>
              <p class="muted m-0 mt-1 text-sm">{{ order.place_on || order.date_created || order.status }}</p>
            </div>
            <span class="tagam-pill is-active min-h-0 px-3 py-1 text-xs">{{ prettyStatus(order) }}</span>
          </div>
          <div class="mt-4 flex items-center justify-between gap-3">
            <span class="muted text-sm">{{ order.payment_name || order.service_name || "" }}</span>
            <strong>{{ order.total || order.total_pretty || order.grand_total || "" }}</strong>
          </div>
        </RouterLink>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <RouterLink class="tagam-pill tap-motion px-4 py-2" :to="{ path: '/tracking', query: { order_uuid: order.order_uuid } }">
            <MapPinned :size="16" />
            {{ text.track }}
          </RouterLink>
          <button class="tagam-pill tap-motion px-4 py-2" type="button" :disabled="orders.buyAgainLoading" @click="buyAgain(order)">
            <RefreshCcw :size="16" />
            {{ text.repeat }}
          </button>
        </div>
      </article>

      <p v-if="orders.buyAgainError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ orders.buyAgainError }}
      </p>

      <div v-if="!client.authenticated" class="tagam-card orders-empty-card p-5 text-center">
        <p class="brand-kicker m-0">TAGAM CLUB</p>
        <h2 class="m-0 mt-2 text-2xl font-black">{{ text.signInTitle }}</h2>
        <p class="muted m-0 mt-2 text-sm">{{ text.signInText }}</p>
        <RouterLink class="primary-button tap-motion mt-4 w-full" to="/account">{{ text.openProfile }}</RouterLink>
      </div>

      <div v-else-if="!filteredOrders.length" class="soft-card orders-empty-card p-5 text-center">
        <h2 class="m-0 text-xl font-black">{{ text.emptyTitle }}</h2>
        <p class="muted m-0 mt-2 text-sm">{{ text.emptyText }}</p>
        <RouterLink class="primary-button tap-motion mt-4 w-full" to="/home">{{ text.toRestaurants }}</RouterLink>
      </div>
    </template>
  </section>
</template>

<script setup>
import { MapPinned, ReceiptText, RefreshCcw, Search, X } from "@lucide/vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "src/components/ui/AppHeader.vue";
import { useOrdersStore } from "src/stores/orders";
import { useClientAuthStore } from "src/stores/clientAuth";
import { useCartStore } from "src/stores/cart";
import { useAppStore } from "src/stores/app";

const labels = {
  ru: {
    title: "Заказы",
    searchPlaceholder: "Номер заказа или ресторан",
    clear: "Очистить",
    unavailable: "История недоступна",
    retry: "Повторить",
    restaurant: "Ресторан",
    order: "Заказ",
    track: "Трекинг",
    repeat: "Повторить",
    signInTitle: "Войдите, чтобы видеть заказы",
    signInText: "После входа здесь появятся прошлые заказы, статусы и быстрый повтор.",
    openProfile: "Открыть профиль",
    emptyTitle: "Заказов пока нет",
    emptyText: "Когда вы оформите первый заказ, он появится здесь.",
    toRestaurants: "К ресторанам",
    statuses: {
      new: "Новый",
      pending: "В обработке",
      accepted: "Принят",
      processing: "Готовится",
      ready: "Готов",
      completed: "Выполнен",
      delivered: "Доставлен",
      cancelled: "Отменен",
      canceled: "Отменен",
      rejected: "Отклонен",
    },
  },
  tk: {
    title: "Sargytlar",
    searchPlaceholder: "Sargyt belgisi ýa-da restoran",
    clear: "Arassala",
    unavailable: "Taryh elýeterli däl",
    retry: "Gaýtadan synan",
    restaurant: "Restoran",
    order: "Sargyt",
    track: "Gözegçilik",
    repeat: "Gaýtala",
    signInTitle: "Sargytlary görmek üçin giriň",
    signInText: "Gireniňizden soň bu ýerde öňki sargytlar, ýagdaýlar we gaýtadan sargyt peýda bolar.",
    openProfile: "Profili aç",
    emptyTitle: "Sargyt ýok",
    emptyText: "Ilkinji sargydyňyzdan soň ol şu ýerde görkeziler.",
    toRestaurants: "Restoranlara",
    statuses: {
      new: "Täze",
      pending: "Işlenýär",
      accepted: "Kabul edildi",
      processing: "Taýýarlanýar",
      ready: "Taýýar",
      completed: "Tamamlandy",
      delivered: "Eltildi",
      cancelled: "Ýatyryldy",
      canceled: "Ýatyryldy",
      rejected: "Ret edildi",
    },
  },
  en: {
    title: "Orders",
    searchPlaceholder: "Order number or restaurant",
    clear: "Clear",
    unavailable: "History unavailable",
    retry: "Retry",
    restaurant: "Restaurant",
    order: "Order",
    track: "Track",
    repeat: "Repeat",
    signInTitle: "Sign in to see orders",
    signInText: "After sign-in, your past orders, statuses and quick reorder will appear here.",
    openProfile: "Open profile",
    emptyTitle: "No orders yet",
    emptyText: "Your first order will appear here after checkout.",
    toRestaurants: "To restaurants",
    statuses: {
      new: "New",
      pending: "Pending",
      accepted: "Accepted",
      processing: "Preparing",
      ready: "Ready",
      completed: "Completed",
      delivered: "Delivered",
      cancelled: "Cancelled",
      canceled: "Cancelled",
      rejected: "Rejected",
    },
  },
};

const app = useAppStore();
const orders = useOrdersStore();
const client = useClientAuthStore();
const cart = useCartStore();
const router = useRouter();
const query = ref("");

const text = computed(() => labels[app.language] || labels.ru);
const normalizedQuery = computed(() => query.value.toLowerCase().trim());
const filteredOrders = computed(() => {
  if (!normalizedQuery.value) return orders.history;
  return orders.history.filter((order) =>
    [
      order.order_id,
      order.order_uuid,
      order.status,
      order.status_raw,
      order.merchant?.restaurant_name,
      order.merchant_name,
      order.restaurant_name,
    ].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery.value)
  );
});

let searchTimer;
const orderLabel = (order) => {
  const value = String(order?.order_id || order?.order_uuid || "").trim();
  if (!value) return text.value.order;
  if (/^(#|заказ|sargyt|order)/i.test(value)) return value;
  return `${text.value.order} #${value}`;
};
const prettyStatus = (order) => {
  const status = String(order?.status || order?.status_raw || "").trim();
  const normalized = status.toLowerCase();
  return text.value.statuses[normalized] || status || text.value.statuses.new;
};
const load = () => orders.loadHistory(query.value).catch(() => {});
const buyAgain = async (order) => {
  if (!order?.order_uuid) return;
  const result = await orders.buyAgain(order.order_uuid).catch(() => null);
  const cartUuid = result?.cart_uuid || result?.data?.cart_uuid;
  if (cartUuid) {
    cart.rememberCart(cartUuid);
    await cart.refresh().catch(() => {});
  }
  router.push("/cart");
};

watch(query, () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(load, 350);
});

onMounted(load);
</script>
