<template>
  <section class="page fade-up">
    <AppHeader :title="copy.title" :icon="CreditCard" :action-label="copy.action" />

    <AuthBridge v-if="!client.authenticated" @authenticated="load" />

    <template v-else>
      <div class="tagam-card p-5">
        <p class="brand-kicker m-0">{{ copy.savedKicker }}</p>
        <h1 class="m-0 mt-1 text-2xl font-black">{{ copy.heading }}</h1>
        <p class="muted m-0 mt-1 text-sm">{{ copy.intro }}</p>
        <button class="primary-button tap-motion mt-4 w-full" type="button" @click="providersOpen = !providersOpen">
          {{ providersOpen ? copy.hideProviders : copy.addPayment }}
        </button>
      </div>

      <section v-if="providersOpen" class="soft-card p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="brand-kicker m-0">{{ copy.providersKicker }}</p>
            <h2 class="m-0 mt-1 text-xl font-black">{{ copy.providersTitle }}</h2>
            <p class="muted m-0 mt-1 text-sm">{{ copy.providersHint }}</p>
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
                <p class="muted m-0 mt-0.5 text-xs">{{ provider.payment_description || copy.providerFallback }}</p>
              </div>
            </div>
            <button class="tagam-pill tap-motion mt-3 w-full px-4 py-2" type="button" :disabled="providerSaving === provider.payment_code" @click="addProvider(provider)">
              {{ providerSaving === provider.payment_code ? providerSavingText : providerChooseText }}
            </button>
          </article>
          <p v-if="providerError" class="m-0 rounded-[8px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-50">
            {{ providerError }}
          </p>
          <p v-if="providerMessage" class="m-0 rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">
            {{ providerMessage }}
          </p>
          <RouterLink class="tagam-pill tap-motion px-4 py-3 text-center" to="/checkout">
            {{ copy.openCheckout }}
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
            {{ copy.makeDefault }}
          </button>
          <button v-if="payment.payment_uuid" class="tagam-pill tap-motion px-4 py-2 text-rose-200" type="button" @click="remove(payment)">
            {{ copy.remove }}
          </button>
        </div>
      </article>

      <div v-if="!customer.paymentsLoading && !customer.paymentList.length" class="soft-card p-5 text-center">
        <h2 class="m-0 text-xl font-black">{{ copy.emptyTitle }}</h2>
        <p class="muted m-0 mt-2 text-sm">{{ copy.emptyText }}</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { CreditCard, RefreshCw } from "@lucide/vue";
import { computed, onMounted, ref, watch } from "vue";
import APIinterface from "src/api/APIinterface";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useAppStore } from "src/stores/app";
import { useClientAuthStore } from "src/stores/clientAuth";
import { useCustomerStore } from "src/stores/customer";

const app = useAppStore();
const client = useClientAuthStore();
const customer = useCustomerStore();
const providersOpen = ref(false);
const providersLoading = ref(false);
const providers = ref([]);
const providerSaving = ref("");
const providerError = ref("");
const providerMessage = ref("");
const providerChooseText = computed(() => (app.language === "tk" ? "Saýla" : app.language === "en" ? "Choose" : "Выбрать"));
const providerSavingText = computed(() => (app.language === "tk" ? "Saklanýar..." : app.language === "en" ? "Saving..." : "Сохраняем..."));
const copy = computed(() => {
  if (app.language === "tk") {
    return {
      title: "Tölegler",
      action: "Töleg",
      savedKicker: "SAKLANAN TÖLEGLER",
      heading: "Töleg usullary",
      intro: "Sargyt tölenenden soň saklanan kartlar we töleg usullary şu ýerde görüner.",
      hideProviders: "Usullary gizle",
      addPayment: "Töleg usulyny goş",
      providersKicker: "ELÝETERLI PROVIDERLER",
      providersTitle: "Elýeterli töleg",
      providersHint: "Kart saklamak sargyt töleginde ýa-da töleg provideriniň sahypasynda tamamlanýar.",
      providerFallback: "Sargyt töleginde elýeterli bolar",
      openCheckout: "Sargyt tölegine geç",
      makeDefault: "Esasy et",
      remove: "Poz",
      emptyTitle: "Saklanan töleg ýok",
      emptyText: "Sargyt tölenenden soň saklanan usul şu ýerde peýda bolar.",
      fallbackTitle: "Töleg usuly",
    };
  }
  if (app.language === "en") {
    return {
      title: "Payments",
      action: "Payment",
      savedKicker: "SAVED PAYMENTS",
      heading: "Payment methods",
      intro: "Saved cards and payment methods will appear here after checkout.",
      hideProviders: "Hide methods",
      addPayment: "Add payment method",
      providersKicker: "AVAILABLE PROVIDERS",
      providersTitle: "Available payment",
      providersHint: "Cards are saved during order payment or on the payment provider page.",
      providerFallback: "Available during order payment",
      openCheckout: "Open order payment",
      makeDefault: "Make default",
      remove: "Remove",
      emptyTitle: "No saved payments",
      emptyText: "A saved method will appear here after you pay for an order.",
      fallbackTitle: "Payment method",
    };
  }
  return {
    title: "Платежи",
    action: "Оплата",
    savedKicker: "СОХРАНЕННЫЕ ОПЛАТЫ",
    heading: "Платежные методы",
    intro: "Здесь появятся карты и способы оплаты, сохраненные после оформления заказа.",
    hideProviders: "Скрыть способы",
    addPayment: "Добавить способ оплаты",
    providersKicker: "ДОСТУПНЫЕ ПРОВАЙДЕРЫ",
    providersTitle: "Доступная оплата",
    providersHint: "Сохранение карты завершается при оплате заказа или на странице платежного провайдера.",
    providerFallback: "Будет доступно при оплате заказа",
    openCheckout: "Перейти к оплате заказа",
    makeDefault: "По умолчанию",
    remove: "Удалить",
    emptyTitle: "Сохраненных оплат нет",
    emptyText: "После оплаты заказа сохраненный способ появится здесь.",
    fallbackTitle: "Способ оплаты",
  };
});

const paymentTitle = (payment) => payment.attr1 || payment.card_name || payment.payment_name || payment.provider || copy.value.fallbackTitle;
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
  providerError.value = "";
  try {
    const response = await APIinterface.PaymentMethod();
    const data = response?.details?.data ?? response?.details ?? [];
    providers.value = Array.isArray(data) ? data : Object.values(data);
  } catch {
    providers.value = [];
  } finally {
    providersLoading.value = false;
  }
};

const addProvider = async (provider) => {
  if (!provider?.payment_code) return;
  providerSaving.value = provider.payment_code;
  providerError.value = "";
  providerMessage.value = "";
  try {
    const response = await APIinterface.SavedPaymentProvider({
      merchant_id: provider?.credentials?.merchant_id || provider?.merchant_id || "",
      payment_code: provider.payment_code,
    });
    providerMessage.value = response?.msg || provider.payment_name || provider.payment_code;
    const details = response?.details ?? {};
    const paymentUrl = details.payment_url || details.redirect_url || details.url || details.redirect;
    if (paymentUrl) {
      window.location.href = paymentUrl;
      return;
    }
    await customer.loadPayments().catch(() => {});
  } catch (caught) {
    providerError.value = caught?.message ?? String(caught);
  } finally {
    providerSaving.value = "";
  }
};

onMounted(() => {
  load();
  loadProviders();
});
watch(() => client.token, load);
</script>
