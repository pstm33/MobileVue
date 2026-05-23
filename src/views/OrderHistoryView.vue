<template>
  <section class="page fade-up">
    <AppHeader title="Заказы" :icon="ReceiptText" action-label="Orders" />

    <label class="tagam-card flex min-h-14 items-center gap-3 px-4">
      <Search :size="20" class="text-emerald-300" />
      <input v-model="query" class="min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:text-[var(--app-muted)]" placeholder="Номер заказа или ресторан" />
      <button v-if="query" class="icon-button !h-9 !w-9" type="button" aria-label="Очистить" @click="query = ''">
        <X :size="17" />
      </button>
    </label>

    <div v-if="orders.historyLoading" class="grid gap-3">
      <div v-for="index in 4" :key="index" class="warm-skeleton h-28 rounded-[8px]" />
    </div>

    <div v-else-if="orders.historyError" class="soft-card p-5">
      <h1 class="m-0 text-2xl font-black">История недоступна</h1>
      <p class="muted m-0 mt-2 text-sm">{{ orders.historyError }}</p>
      <button class="primary-button tap-motion mt-4 w-full" type="button" @click="load">Повторить</button>
    </div>

    <template v-else>
      <article v-for="order in filteredOrders" :key="order.order_uuid || order.order_id" class="tagam-card tap-motion p-4">
        <RouterLink :to="{ path: '/order/details', query: { order_uuid: order.order_uuid } }" class="block">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="brand-kicker m-0">{{ orderLabel(order) }}</p>
              <h2 class="m-0 mt-1 truncate text-xl font-black">{{ order.merchant?.restaurant_name || order.merchant_name || order.restaurant_name || 'Ресторан' }}</h2>
              <p class="muted m-0 mt-1 text-sm">{{ order.place_on || order.date_created || order.status }}</p>
            </div>
            <span class="tagam-pill is-active min-h-0 px-3 py-1 text-xs">{{ prettyStatus(order) }}</span>
          </div>
          <div class="mt-4 flex items-center justify-between gap-3">
            <span class="muted text-sm">{{ order.payment_name || order.service_name || '' }}</span>
            <strong>{{ order.total || order.total_pretty || order.grand_total || '' }}</strong>
          </div>
        </RouterLink>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <RouterLink class="tagam-pill tap-motion px-4 py-2" :to="{ path: '/tracking', query: { order_uuid: order.order_uuid } }">
            <MapPinned :size="16" />
            Трекинг
          </RouterLink>
          <button class="tagam-pill tap-motion px-4 py-2" type="button" :disabled="orders.buyAgainLoading" @click="buyAgain(order)">
            <RefreshCcw :size="16" />
            Повторить
          </button>
        </div>
      </article>

      <p v-if="orders.buyAgainError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ orders.buyAgainError }}
      </p>

      <div v-if="!client.authenticated" class="tagam-card p-5 text-center">
        <p class="brand-kicker m-0">TAGAM CLUB</p>
        <h2 class="m-0 mt-2 text-2xl font-black">Войдите, чтобы видеть заказы</h2>
        <p class="muted m-0 mt-2 text-sm">После входа здесь появятся ваши прошлые заказы, статусы и быстрый повтор.</p>
        <RouterLink class="primary-button tap-motion mt-4 w-full" to="/account">Открыть профиль</RouterLink>
      </div>

      <div v-else-if="!filteredOrders.length" class="soft-card p-5 text-center">
        <h2 class="m-0 text-xl font-black">Заказов пока нет</h2>
        <p class="muted m-0 mt-2 text-sm">Когда вы оформите первый заказ, он появится здесь.</p>
        <RouterLink class="primary-button tap-motion mt-4 w-full" to="/home">К ресторанам</RouterLink>
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

const orders = useOrdersStore();
const client = useClientAuthStore();
const cart = useCartStore();
const router = useRouter();
const query = ref("");

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
  if (!value) return "Заказ";
  if (/^(#|заказ|order)/i.test(value)) return value;
  return `Заказ #${value}`;
};
const prettyStatus = (order) => {
  const status = String(order?.status || order?.status_raw || "").trim();
  const normalized = status.toLowerCase();
  const map = {
    new: "Новый",
    pending: "В обработке",
    accepted: "Принят",
    processing: "Готовится",
    ready: "Готов",
    completed: "Выполнен",
    delivered: "Доставлен",
    cancelled: "Отменен",
    rejected: "Отклонен",
  };
  return map[normalized] || status || "Новый";
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
