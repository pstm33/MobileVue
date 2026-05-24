<template>
  <section class="page fade-up">
    <AppHeader :title="copy.title" :icon="WalletCards" :action-label="copy.refresh" @action="load" />

    <AuthBridge v-if="!client.authenticated" @authenticated="load" />

    <template v-else>
      <div class="tagam-card tagam-glow p-5">
        <p class="brand-kicker m-0">TAGAM WALLET</p>
        <h1 class="m-0 mt-2 text-4xl font-black">{{ walletBalance }}</h1>
        <p class="muted m-0 mt-2 text-sm">{{ copy.intro }}</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="soft-card p-4">
          <Gift class="text-[var(--app-accent)]" :size="22" />
          <strong class="mt-3 block text-xl">{{ pointsBalance }}</strong>
          <span class="muted text-sm">{{ copy.points }}</span>
        </div>
        <div class="soft-card p-4">
          <ReceiptText class="text-[var(--app-accent)]" :size="22" />
          <strong class="mt-3 block text-xl">{{ transactions.length }}</strong>
          <span class="muted text-sm">{{ copy.transactions }}</span>
        </div>
      </div>

      <section class="soft-card p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="brand-kicker m-0">TOP UP</p>
            <h2 class="m-0 mt-1 text-xl font-black">{{ copy.topupTitle }}</h2>
            <p class="muted m-0 mt-1 text-sm">{{ topupHint }}</p>
          </div>
          <button class="icon-button h-11 w-11 shrink-0" type="button" @click="loadDefaultPayment">
            <RefreshCw :size="18" />
          </button>
        </div>
        <div class="mt-4 grid gap-3">
          <div v-if="defaultPaymentName" class="rounded-[8px] border border-[var(--app-border)] bg-[var(--app-control)] p-3">
            <p class="m-0 text-sm font-black">{{ defaultPaymentName }}</p>
            <p class="muted m-0 mt-1 text-xs">{{ defaultPaymentSubtitle }}</p>
          </div>
          <div class="flex gap-2">
            <input v-model.number="topupAmount" class="field min-w-0 flex-1" inputmode="decimal" min="1" type="number" />
            <button class="primary-button shrink-0 px-5" type="button" :disabled="topupLoading" @click="prepareTopup">
              {{ topupLoading ? "..." : copy.topup }}
            </button>
          </div>
          <RouterLink v-if="!defaultPaymentName" class="tagam-pill tap-motion px-4 py-3 text-center" to="/payments">
            {{ copy.addPayment }}
          </RouterLink>
          <p v-if="topupMessage" class="m-0 rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">
            {{ topupMessage }}
          </p>
        </div>
      </section>

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
          <h2 class="m-0 text-xl font-black">{{ copy.history }}</h2>
          <span class="muted text-sm">{{ transactions.length }}</span>
        </div>

        <article v-for="item in transactions" :key="item.transaction_uuid || item.id || JSON.stringify(item)" class="soft-card flex items-center justify-between gap-3 p-4">
          <div class="min-w-0">
            <h3 class="m-0 text-base font-black">{{ item.transaction_description || item.description || item.transaction_type || copy.walletOperation }}</h3>
            <p class="muted m-0 mt-1 text-sm">{{ item.transaction_date || item.created_at || "" }}</p>
          </div>
          <strong :class="item.transaction_type === 'debit' ? 'text-rose-200' : 'text-[var(--app-accent)]'">
            {{ item.transaction_amount || item.amount || "" }}
          </strong>
        </article>

        <div v-if="!loading && !transactions.length" class="soft-card p-5 text-center">
          <h2 class="m-0 text-xl font-black">{{ copy.emptyTitle }}</h2>
          <p class="muted m-0 mt-2 text-sm">{{ copy.emptyText }}</p>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup>
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { Gift, ReceiptText, RefreshCw, WalletCards } from "@lucide/vue";
import { computed, onMounted, ref, watch } from "vue";
import APIinterface from "src/api/APIinterface";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useAccountProfileStore } from "src/stores/accountProfile";
import { useAppStore } from "src/stores/app";
import { useClientAuthStore } from "src/stores/clientAuth";

const app = useAppStore();
const client = useClientAuthStore();
const profile = useAccountProfileStore();
const loading = ref(false);
const error = ref("");
const transactions = ref([]);
const defaultPayment = ref(null);
const topupAmount = ref(100);
const topupLoading = ref(false);
const topupMessage = ref("");

const copy = computed(() => {
  if (app.language === "tk") {
    return {
      title: "Gapjyk we ballar",
      refresh: "Täzele",
      intro: "Balansyňyz, bonuslaryňyz we hasap amallaryňyz.",
      points: "Bonus ballary",
      transactions: "Amallar",
      topupTitle: "Gapjygy doldur",
      topup: "Doldur",
      addPayment: "Töleg usulyny goş",
      history: "Gapjyk taryhy",
      walletOperation: "Gapjyk amaly",
      emptyTitle: "Amal ýok",
      emptyText: "Häzirlikçe hasaplama, çykdajy ýa-da yzyna gaýtaryş ýok.",
      defaultPayment: "Esasy töleg usuly",
      topupWithDefault: "Mukdary saýlaň, servis saklanan usul arkaly goragly tölegi taýýarlar.",
      topupNeedsPayment: "Ilki online töleg usulyny saklaň, soňra gapjygy doldurmak açylar.",
      addOnlinePaymentFirst: "Ilki online töleg usulyny goşuň.",
      enterTopupAmount: "Doldurmak mukdaryny giriziň.",
      topupPrepared: "Doldurmak taýýarlandy.",
      level: "Dereje",
      orders: "Sargytlar",
      repeatOrders: "Gaýtalanýan sargytlar",
    };
  }
  if (app.language === "en") {
    return {
      title: "Wallet & points",
      refresh: "Refresh",
      intro: "Your balance, rewards and account activity.",
      points: "Reward points",
      transactions: "Transactions",
      topupTitle: "Top up wallet",
      topup: "Top up",
      addPayment: "Add payment method",
      history: "Wallet history",
      walletOperation: "Wallet operation",
      emptyTitle: "No operations",
      emptyText: "There have been no credits, charges or refunds yet.",
      defaultPayment: "Default payment method",
      topupWithDefault: "Choose an amount and the service will prepare a secure payment with your saved method.",
      topupNeedsPayment: "Save an online payment method first, then wallet top-up will be available here.",
      addOnlinePaymentFirst: "Add an online payment method first.",
      enterTopupAmount: "Enter a top-up amount.",
      topupPrepared: "Top-up is ready.",
      level: "Level",
      orders: "Orders",
      repeatOrders: "Repeat orders",
    };
  }
  return {
    title: "Кошелек и баллы",
    refresh: "Обновить",
    intro: "Ваш баланс, бонусы и операции по аккаунту.",
    points: "Бонусные баллы",
    transactions: "Операции",
    topupTitle: "Пополнить кошелек",
    topup: "Пополнить",
    addPayment: "Добавить способ оплаты",
    history: "История кошелька",
    walletOperation: "Операция кошелька",
    emptyTitle: "Операций нет",
    emptyText: "Пока не было начислений, списаний или возвратов.",
    defaultPayment: "Способ оплаты по умолчанию",
    topupWithDefault: "Выберите сумму, и сервис подготовит защищенную оплату через сохраненный способ.",
    topupNeedsPayment: "Сначала сохраните онлайн-оплату, после этого здесь появится пополнение.",
    addOnlinePaymentFirst: "Сначала добавьте онлайн-оплату.",
    enterTopupAmount: "Введите сумму пополнения.",
    topupPrepared: "Пополнение подготовлено.",
    level: "Уровень",
    orders: "Заказы",
    repeatOrders: "Повторные заказы",
  };
});
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
const defaultPaymentName = computed(() => defaultPayment.value?.attr1 || defaultPayment.value?.payment_name || defaultPayment.value?.payment_code || "");
const defaultPaymentSubtitle = computed(() => defaultPayment.value?.attr2 || defaultPayment.value?.card_number || copy.value.defaultPayment);
const topupHint = computed(() =>
  defaultPaymentName.value
    ? copy.value.topupWithDefault
    : copy.value.topupNeedsPayment
);
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
    [copy.value.level, firstValue("membership_type", "membership_name", "member_type")],
    [copy.value.orders, firstValue("total_orders", "orders", "order_count")],
    [copy.value.repeatOrders, firstValue("repeat_orders", "reorder_rate", "orders_repeat")],
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

const loadDefaultPayment = async () => {
  if (!client.authenticated) return;
  try {
    const response = await APIinterface.fetchDataByTokenPost("getCustomerDefaultPayment", "");
    defaultPayment.value = response?.details?.data ?? response?.details ?? null;
  } catch {
    defaultPayment.value = null;
  }
};

const topupRedirectUrl = () => {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/wallet/receipt`;
};

const prepareTopup = async () => {
  topupMessage.value = "";
  error.value = "";
  if (!defaultPayment.value?.payment_code && !defaultPayment.value?.payment_uuid) {
    error.value = copy.value.addOnlinePaymentFirst;
    return;
  }
  if (!Number(topupAmount.value) || Number(topupAmount.value) <= 0) {
    error.value = copy.value.enterTopupAmount;
    return;
  }

  topupLoading.value = true;
  try {
    const params = new URLSearchParams({
      return_url: Capacitor.isNativePlatform() ? "" : topupRedirectUrl(),
      amount: String(topupAmount.value),
      payment_code: defaultPayment.value.payment_code || "",
      payment_uuid: defaultPayment.value.payment_uuid || "",
      currency_code: defaultPayment.value.currency_code || "TMT",
    }).toString();
    const response = await APIinterface.fetchDataByTokenPost("prepareAddFunds", params);
    const details = response?.details ?? {};
    const paymentUrl = details.redirect_url || details.payment_url || details.url || details.redirect;
    topupMessage.value = response?.msg || copy.value.topupPrepared;
    if (paymentUrl) {
      if (Capacitor.isNativePlatform()) await Browser.open({ url: paymentUrl });
      else window.location.href = paymentUrl;
    }
  } catch (err) {
    error.value = err?.message ?? String(err);
  } finally {
    topupLoading.value = false;
  }
};

const load = async () => {
  if (!client.authenticated) return;
  await Promise.all([profile.load(), loadTransactions(), loadDefaultPayment()]);
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
