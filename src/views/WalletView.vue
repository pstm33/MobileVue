<template>
  <section class="page fade-up">
    <AppHeader :title="title" :icon="WalletCards" action-label="Обновить" @action="load" />

    <AuthBridge v-if="!client.authenticated" @authenticated="load" />

    <template v-else>
      <div class="tagam-card tagam-glow p-5">
        <p class="brand-kicker m-0">TAGAM WALLET</p>
        <h1 class="m-0 mt-2 text-4xl font-black">{{ walletBalance }}</h1>
        <p class="muted m-0 mt-2 text-sm">Ваш баланс, бонусы и операции по аккаунту.</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="soft-card p-4">
          <Gift class="text-[var(--app-accent)]" :size="22" />
          <strong class="mt-3 block text-xl">{{ pointsBalance }}</strong>
          <span class="muted text-sm">Бонусные баллы</span>
        </div>
        <div class="soft-card p-4">
          <ReceiptText class="text-[var(--app-accent)]" :size="22" />
          <strong class="mt-3 block text-xl">{{ transactions.length }}</strong>
          <span class="muted text-sm">Операции</span>
        </div>
      </div>

      <div v-if="loading || profile.loading" class="grid gap-3">
        <div v-for="index in 3" :key="index" class="warm-skeleton h-20 rounded-[8px]" />
      </div>

      <p v-if="displayError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ displayError }}
      </p>

      <section v-if="statusRows.length" class="soft-card overflow-hidden">
        <div v-for="row in statusRows" :key="row.label" class="account-row border-t border-white/10 first:border-t-0">
          <span>{{ row.label }}</span>
          <strong class="text-right">{{ row.value }}</strong>
        </div>
      </section>

      <section class="grid gap-3">
        <div class="flex items-center justify-between gap-3">
          <h2 class="m-0 text-xl font-black">История кошелька</h2>
          <span class="muted text-sm">{{ transactions.length }}</span>
        </div>

        <article v-for="item in transactions" :key="item.transaction_uuid || item.id || JSON.stringify(item)" class="soft-card flex items-center justify-between gap-3 p-4">
          <div class="min-w-0">
            <h3 class="m-0 text-base font-black">{{ item.transaction_description || item.description || item.transaction_type || "Операция кошелька" }}</h3>
            <p class="muted m-0 mt-1 text-sm">{{ item.transaction_date || item.created_at || "" }}</p>
          </div>
          <strong :class="item.transaction_type === 'debit' ? 'text-rose-200' : 'text-[var(--app-accent)]'">
            {{ item.transaction_amount || item.amount || "" }}
          </strong>
        </article>

        <div v-if="!loading && !transactions.length" class="soft-card p-5 text-center">
          <h2 class="m-0 text-xl font-black">Операций нет</h2>
          <p class="muted m-0 mt-2 text-sm">Пока не было начислений, списаний или возвратов.</p>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup>
import { Gift, ReceiptText, WalletCards } from "@lucide/vue";
import { computed, onMounted, ref, watch } from "vue";
import APIinterface from "src/api/APIinterface";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useAccountProfileStore } from "src/stores/accountProfile";
import { useClientAuthStore } from "src/stores/clientAuth";

const client = useClientAuthStore();
const profile = useAccountProfileStore();
const loading = ref(false);
const error = ref("");
const transactions = ref([]);

const title = computed(() => "Кошелек и баллы");
const status = computed(() => profile.accountStatus?.details?.data ?? profile.accountStatus?.details ?? profile.accountStatus ?? {});
const customerInfo = computed(() => profile.customerInfo?.details?.data ?? profile.customerInfo?.details ?? profile.customerInfo ?? {});

const firstValue = (...keys) => {
  for (const key of keys) {
    const value = status.value?.[key] ?? customerInfo.value?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "0";
};

const walletBalance = computed(() => firstValue("wallet_balance", "balance", "digital_wallet_balance", "available_balance"));
const pointsBalance = computed(() => firstValue("points", "points_balance", "reward_points", "available_points"));
const displayError = computed(() => {
  const message = error.value || profile.error;
  if (!message) return "";

  const normalized = message.toLowerCase();
  if (normalized.includes("invalid card id")) {
    return "";
  }

  return message;
});
const statusRows = computed(() =>
  [
    ["Уровень", firstValue("membership_type", "membership_name", "member_type")],
    ["Заказы", firstValue("total_orders", "orders", "order_count")],
    ["Повторные заказы", firstValue("repeat_orders", "reorder_rate", "orders_repeat")],
  ]
    .filter(([, value]) => value !== "" && value !== "0")
    .map(([label, value]) => ({ label, value }))
);

const loadTransactions = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await APIinterface.fetchDataByTokenPost("getWalletTransaction", "page=1&transaction_type=all");
    transactions.value = Array.isArray(response?.details?.data) ? response.details.data : [];
  } catch (err) {
    transactions.value = [];
    error.value = err?.message ?? String(err);
  } finally {
    loading.value = false;
  }
};

const load = async () => {
  if (!client.authenticated) return;
  await Promise.all([profile.load(), loadTransactions()]);
};

onMounted(load);
watch(() => client.token, load);
</script>

<style scoped>
.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
}
</style>
