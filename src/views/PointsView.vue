<template>
  <section class="page points-page fade-up">
    <AppHeader title="Баллы" :icon="Gift" action-label="Обновить" @action="load(true)" />

    <div v-if="!client.authenticated" class="points-hero tagam-card tagam-glow p-5">
      <p class="brand-kicker m-0">TAGAM POINTS</p>
      <h1 class="m-0 mt-2 text-4xl font-black">Баллы</h1>
      <p class="muted m-0 mt-2 text-sm">Войдите или продолжите как гость, чтобы открыть бонусы, историю начислений и списания.</p>
    </div>

    <AuthBridge v-if="!client.authenticated" @authenticated="load(true)" />

    <template v-else>
      <div class="points-hero tagam-card tagam-glow p-5">
        <p class="brand-kicker m-0">TAGAM POINTS</p>
        <h1 class="m-0 mt-2 text-4xl font-black">{{ balanceLabel }}</h1>
        <p class="muted m-0 mt-2 text-sm">Доступные бонусы и история начислений по вашему аккаунту.</p>
      </div>

      <div class="points-tabs grid grid-cols-2 gap-2 rounded-[8px] bg-[var(--app-control)] p-1">
        <button
          v-for="tab in tabs"
          :key="tab.code"
          class="tap-motion min-h-11 rounded-[8px] px-3 text-sm font-black transition"
          :class="activeTab === tab.code ? 'bg-[var(--app-accent)] text-black shadow-lg' : 'text-[var(--app-muted)]'"
          type="button"
          @click="switchTab(tab.code)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="loading && !rows.length" class="grid gap-3">
        <div v-for="index in 4" :key="index" class="warm-skeleton h-20 rounded-[8px]" />
      </div>

      <p v-if="error" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ error }}
      </p>

      <section v-if="rows.length" class="soft-card points-history overflow-hidden">
        <article
          v-for="item in rows"
          :key="item.transaction_uuid || item.merchant_id || item.restaurant_name || JSON.stringify(item)"
          class="flex items-center justify-between gap-3 border-t border-white/10 p-4 first:border-t-0"
        >
          <div class="min-w-0">
            <h2 class="m-0 text-base font-black">{{ item.transaction_description || item.restaurant_name || "Операция с баллами" }}</h2>
            <p class="muted m-0 mt-1 text-sm">{{ item.transaction_date || item.date_created || item.created_at || "" }}</p>
          </div>
          <strong :class="amountClass(item)">
            {{ item.transaction_amount || item.total_earning || item.points || "" }}
          </strong>
        </article>
      </section>

      <button v-if="hasMore" class="tagam-pill tap-motion mx-auto px-5 py-3" type="button" :disabled="loading" @click="load()">
        {{ loading ? "Загружаем..." : "Показать еще" }}
      </button>

      <div v-if="!loading && !rows.length && !error" class="soft-card points-empty-card p-5 text-center">
        <Gift class="mx-auto text-[var(--app-accent)]" :size="28" />
        <h2 class="m-0 mt-3 text-xl font-black">История пуста</h2>
        <p class="muted m-0 mt-2 text-sm">Когда баллы будут начислены или списаны, операции появятся здесь.</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { Gift } from "@lucide/vue";
import { computed, onMounted, ref, watch } from "vue";
import APIinterface from "src/api/APIinterface";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useClientAuthStore } from "src/stores/clientAuth";

const client = useClientAuthStore();
const loading = ref(false);
const error = ref("");
const balance = ref("");
const rows = ref([]);
const page = ref(1);
const hasMore = ref(true);
const activeTab = ref("transaction");

const tabs = [
  { code: "transaction", label: "Операции" },
  { code: "points_merchant", label: "По ресторанам" },
];

const balanceLabel = computed(() => balance.value || "0");

const methodForTab = () => (activeTab.value === "points_merchant" ? "getPointsTransactionMerchant" : "getPointsTransaction");
const amountClass = (item) => (item.transaction_type === "debit" ? "text-rose-200" : "text-[var(--app-accent)]");
const isEmptyPointsError = (err) => /no results|record not found|invalid card id|ничего не найдено/i.test(err?.message ?? String(err));
const normalizeRows = (value) => {
  const rows = Array.isArray(value) ? value : Object.values(value ?? {});
  return rows.filter((item) => {
    const rowText = Object.values(item ?? {}).join(" ");
    if (/ничего не найдено|no results|invalid card id/i.test(rowText)) return false;

    return item &&
      typeof item === "object" &&
      (
      item.transaction_uuid ||
      item.transaction_description ||
      item.transaction_amount ||
      item.restaurant_name ||
      item.merchant_id ||
      item.points ||
      item.total_earning
      );
  });
};

const loadBalance = async () => {
  const response = await APIinterface.fetchDataByTokenPost("getAvailablePoints", "");
  balance.value = response.details?.total ?? response.details?.points ?? "0";
};

const load = async (reset = false) => {
  if (!client.authenticated || loading.value) return;
  if (reset) {
    rows.value = [];
    page.value = 1;
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  loading.value = true;
  error.value = "";
  try {
    const [balanceResult, listResult] = await Promise.allSettled([
      reset || !balance.value ? loadBalance() : Promise.resolve(),
      APIinterface.fetchDataByTokenPost(methodForTab(), `page=${page.value}`),
    ]);

    if (balanceResult.status === "rejected" && !balance.value) {
      balance.value = "0";
    }

    if (listResult.status === "rejected") {
      if (isEmptyPointsError(listResult.reason)) {
        hasMore.value = false;
        return;
      }
      throw listResult.reason;
    }

    const nextRows = normalizeRows(listResult.value?.details?.data ?? []);
    rows.value = reset ? nextRows : [...rows.value, ...nextRows];
    hasMore.value = nextRows.length > 0 && !listResult.value?.details?.is_last_page;
    page.value += 1;
  } catch (err) {
    if (isEmptyPointsError(err)) {
      hasMore.value = false;
      return;
    }
    error.value = err?.message ?? String(err);
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
};

const switchTab = (tab) => {
  activeTab.value = tab;
  load(true);
};

onMounted(() => load(true));
watch(() => client.token, () => load(true));
</script>

<style scoped>
.points-hero {
  background:
    radial-gradient(circle at 85% 12%, color-mix(in srgb, var(--app-accent) 30%, transparent), transparent 26%),
    linear-gradient(135deg, color-mix(in srgb, var(--app-card) 86%, transparent), color-mix(in srgb, var(--app-accent) 12%, var(--app-card))),
    var(--app-card);
}
</style>
