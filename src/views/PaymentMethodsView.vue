<template>
  <section class="page fade-up">
    <AppHeader title="Платежи" :icon="CreditCard" action-label="Оплата" />

    <AuthBridge v-if="!client.authenticated" @authenticated="load" />

    <template v-else>
      <div class="tagam-card p-5">
        <p class="brand-kicker m-0">SAVED PAYMENTS</p>
        <h1 class="m-0 mt-1 text-2xl font-black">Платежные методы</h1>
        <p class="muted m-0 mt-1 text-sm">Здесь будут карты и способы оплаты, сохраненные после оформления заказа.</p>
        <button class="primary-button tap-motion mt-4 w-full" type="button" @click="providersOpen = !providersOpen">
          {{ providersOpen ? "Скрыть способы" : "Добавить способ оплаты" }}
        </button>
      </div>

      <section v-if="providersOpen" class="soft-card p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="brand-kicker m-0">AVAILABLE PROVIDERS</p>
            <h2 class="m-0 mt-1 text-xl font-black">Доступная оплата</h2>
            <p class="muted m-0 mt-1 text-sm">Список приходит из KMRS. Сохранение карт проходит через checkout или страницу провайдера.</p>
          </div>
          <button class="icon-button h-11 w-11 shrink-0" type="button" @click="loadProviders">
            <RefreshCw :size="18" />
          </button>
        </div>

        <div v-if="providersLoading" class="mt-4 grid gap-2">
          <div v-for="index in 3" :key="index" class="warm-skeleton h-16 rounded-[8px]" />
        </div>
        <div v-else class="mt-4 grid gap-2">
          <article v-for="provider in providers" :key="provider.payment_code || provider.payment_name" class="rounded-[8px] border border-[var(--app-border)] bg-[var(--app-control)] p-3">
            <div class="flex items-center gap-3">
              <img v-if="provider.logo_type !== 'icon' && provider.logo_image" class="h-9 w-9 rounded object-contain" :src="provider.logo_image" alt="" />
              <CreditCard v-else class="text-[var(--app-accent)]" :size="22" />
              <div class="min-w-0 flex-1">
                <h3 class="m-0 truncate text-base font-black">{{ provider.payment_name || provider.payment_code }}</h3>
                <p class="muted m-0 mt-0.5 text-xs">{{ provider.payment_description || "Будет доступно при оформлении заказа" }}</p>
              </div>
            </div>
          </article>
          <RouterLink class="tagam-pill tap-motion px-4 py-3 text-center" to="/checkout">
            Открыть checkout
          </RouterLink>
        </div>
      </section>

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
            <p class="brand-kicker m-0">{{ payment.payment_name || payment.payment_code || "SAVED PAYMENT" }}</p>
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
        <p class="muted m-0 mt-2 text-sm">После оплаты заказа сохраненный способ появится здесь.</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { CreditCard, RefreshCw } from "@lucide/vue";
import { onMounted, ref, watch } from "vue";
import APIinterface from "src/api/APIinterface";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useClientAuthStore } from "src/stores/clientAuth";
import { useCustomerStore } from "src/stores/customer";

const client = useClientAuthStore();
const customer = useCustomerStore();
const providersOpen = ref(false);
const providersLoading = ref(false);
const providers = ref([]);

const paymentTitle = (payment) => payment.attr1 || payment.card_name || payment.payment_name || payment.provider || "Способ оплаты";
const paymentSubtitle = (payment) => payment.attr2 || payment.card_number || "";

const load = () => {
  if (client.authenticated) customer.loadPayments().catch(() => {});
};

const remove = (payment) => {
  customer.deletePayment(payment.payment_uuid).catch(() => {});
};

const setDefault = (payment) => {
  customer.setDefaultPayment(payment.payment_uuid).catch(() => {});
};

const loadProviders = async () => {
  providersLoading.value = true;
  try {
    const response = await APIinterface.PaymentMethod();
    providers.value = Array.isArray(response?.details?.data) ? response.details.data : [];
  } catch {
    providers.value = [];
  } finally {
    providersLoading.value = false;
  }
};

onMounted(() => {
  load();
  loadProviders();
});
watch(() => client.token, load);
</script>
