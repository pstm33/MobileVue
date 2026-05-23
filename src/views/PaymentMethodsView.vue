<template>
  <section class="page fade-up">
    <AppHeader title="Платежи" :icon="CreditCard" action-label="KMRS" />

    <AuthBridge v-if="!client.authenticated" @authenticated="load" />

    <template v-else>
      <div class="tagam-card p-5">
        <p class="brand-kicker m-0">SAVED PAYMENTS</p>
        <h1 class="m-0 mt-1 text-2xl font-black">Платежные методы</h1>
        <p class="muted m-0 mt-1 text-sm">Показываем только реальные способы оплаты, которые вернул KMRS для текущего client token.</p>
        <RouterLink class="primary-button tap-motion mt-4 w-full" to="/checkout">
          Добавить через checkout
        </RouterLink>
      </div>

      <p v-if="customer.paymentsError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ customer.paymentsError }}
      </p>
      <p v-if="customer.paymentMessage" class="m-0 rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">
        {{ customer.paymentMessage }}
      </p>

      <div v-if="customer.paymentsLoading" class="grid gap-3">
        <div v-for="index in 3" :key="index" class="warm-skeleton h-24 rounded-[8px]" />
      </div>

      <article v-for="payment in customer.paymentList" v-else :key="payment.payment_uuid || payment.id || payment.payment_code" class="tagam-card p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="brand-kicker m-0">{{ payment.payment_code || payment.payment_name || "KMRS PAYMENT" }}</p>
            <h2 class="m-0 mt-1 truncate text-xl font-black">{{ paymentTitle(payment) }}</h2>
            <p class="muted m-0 mt-1 text-sm">{{ paymentSubtitle(payment) }}</p>
          </div>
          <CreditCard class="shrink-0 text-[var(--app-accent)]" :size="24" />
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <button v-if="payment.payment_uuid" class="tagam-pill tap-motion px-4 py-2" type="button" @click="setDefault(payment)">
            По умолчанию
          </button>
          <button v-if="payment.payment_uuid" class="tagam-pill tap-motion px-4 py-2 text-rose-200" type="button" @click="remove(payment)">
            Удалить
          </button>
        </div>
      </article>

      <div v-if="!customer.paymentsLoading && !customer.paymentList.length" class="soft-card p-5 text-center">
        <h2 class="m-0 text-xl font-black">Сохраненных оплат нет</h2>
        <p class="muted m-0 mt-2 text-sm">KMRS не вернул сохраненные платежные методы для текущего клиента.</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { CreditCard } from "@lucide/vue";
import { onMounted, watch } from "vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useClientAuthStore } from "src/stores/clientAuth";
import { useCustomerStore } from "src/stores/customer";

const client = useClientAuthStore();
const customer = useCustomerStore();

const paymentTitle = (payment) => payment.attr1 || payment.card_name || payment.payment_name || payment.provider || "KMRS payment";
const paymentSubtitle = (payment) => payment.attr2 || payment.card_number || payment.payment_uuid || "";

const load = () => {
  if (client.authenticated) customer.loadPayments().catch(() => {});
};

const remove = (payment) => {
  customer.deletePayment(payment.payment_uuid).catch(() => {});
};

const setDefault = (payment) => {
  customer.setDefaultPayment(payment.payment_uuid).catch(() => {});
};

onMounted(load);
watch(() => client.token, load);
</script>
