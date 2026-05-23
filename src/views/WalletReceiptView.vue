<template>
  <section class="page fade-up">
    <AppHeader title="Чек кошелька" :icon="ReceiptText" action-label="К кошельку" @action="router.replace('/wallet')" />

    <AuthBridge v-if="!client.authenticated" @authenticated="load" />

    <template v-else>
      <div v-if="loading" class="grid gap-3">
        <div class="warm-skeleton h-28 rounded-[8px]" />
        <div class="warm-skeleton h-48 rounded-[8px]" />
      </div>

      <p v-if="error" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ error }}
      </p>

      <template v-if="receipt">
        <div class="premium-card p-5 text-center">
          <div class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--app-accent)] text-black">
            <Check :size="34" stroke-width="2.6" />
          </div>
          <p class="brand-kicker m-0 mt-5">Wallet loaded</p>
          <h1 class="m-0 mt-2 text-3xl font-black">Кошелек пополнен</h1>
          <p class="muted m-0 mt-2 text-sm">Данные чека загружены через KMRS `interface/fetchWallettransactions`.</p>
        </div>

        <section class="soft-card overflow-hidden">
          <div v-for="row in rows" :key="row.label" class="receipt-row">
            <span>{{ row.label }}</span>
            <strong>{{ row.value }}</strong>
          </div>
        </section>

        <button class="primary-button w-full" type="button" @click="router.replace('/wallet')">
          Закрыть
          <ArrowRight :size="18" />
        </button>
      </template>

      <div v-if="!loading && !receipt && !error" class="soft-card p-5 text-center">
        <h2 class="m-0 text-xl font-black">Чек не найден</h2>
        <p class="muted m-0 mt-2 text-sm">KMRS не вернул транзакцию для переданного `transaction_id`.</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ArrowRight, Check, ReceiptText } from "@lucide/vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import APIinterface from "src/api/APIinterface";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useClientAuthStore } from "src/stores/clientAuth";

const route = useRoute();
const router = useRouter();
const client = useClientAuthStore();
const loading = ref(false);
const error = ref("");
const receipt = ref(null);

const transactionId = computed(() => route.query.transaction_id || route.query.id || "");
const rows = computed(() =>
  [
    ["Сумма", receipt.value?.amount],
    ["Метод оплаты", receipt.value?.payment_name],
    ["Transaction ID", receipt.value?.transaction_id || transactionId.value],
    ["Дата и время", receipt.value?.transaction_date],
  ]
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value]) => ({ label, value }))
);

const load = async () => {
  if (!client.authenticated || !transactionId.value) return;
  loading.value = true;
  error.value = "";
  receipt.value = null;
  try {
    const response = await APIinterface.fetchGet("interface/fetchWallettransactions", {
      transaction_id: transactionId.value,
    });
    receipt.value = response?.details || null;
  } catch (err) {
    const message = err?.message ?? String(err);
    error.value = /record not found/i.test(message) ? "" : message;
  } finally {
    loading.value = false;
  }
};

onMounted(load);
watch(() => [client.token, route.query.transaction_id, route.query.id], load);
</script>

<style scoped>
.receipt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-top: 1px solid var(--app-border);
  padding: 15px 16px;
}

.receipt-row:first-child {
  border-top: 0;
}

.receipt-row span {
  color: var(--app-muted);
  font-weight: 800;
}

.receipt-row strong {
  text-align: right;
}
</style>
