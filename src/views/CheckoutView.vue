<template>
  <section class="page fade-up">
    <AppHeader :title="copy.title" :icon="CreditCard" action-label="Checkout" />

    <div v-if="checkout.loading && !cart.cart" class="grid gap-4">
      <div class="soft-card warm-skeleton h-28" />
      <div class="soft-card warm-skeleton h-36" />
      <div class="soft-card warm-skeleton h-44" />
    </div>

    <div v-else-if="checkout.placedOrder" class="tagam-card grid gap-4 p-5 text-center">
      <h1 class="m-0 text-2xl font-black">{{ copy.orderCreated }}</h1>
      <p class="muted m-0 text-sm">{{ checkout.placedOrder.order_id || checkout.placedOrder.order_uuid }}</p>
      <RouterLink class="primary-button tap-motion" :to="{ path: '/order/success', query: { order_uuid: checkout.placedOrder.order_uuid } }">{{ copy.openOrder }}</RouterLink>
    </div>

    <div v-else-if="!cart.cartUuid || !cart.items.length" class="soft-card grid gap-4 p-5 text-center">
      <h1 class="m-0 text-2xl font-black">{{ copy.emptyCart }}</h1>
      <p class="muted m-0 text-sm">{{ copy.emptyCartText }}</p>
      <RouterLink class="primary-button tap-motion" to="/home">{{ copy.toRestaurants }}</RouterLink>
    </div>

    <template v-else>
      <div v-if="cart.data?.error?.length" class="rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        <p v-for="error in cart.data.error" :key="error" class="m-0">{{ error }}</p>
      </div>

      <section class="glass grid gap-4 rounded-[8px] p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="m-0 text-xs font-black uppercase tracking-[0.16em] text-[var(--app-accent)]">{{ copy.restaurant }}</p>
            <h1 class="m-0 truncate text-xl font-black">{{ cart.merchant?.restaurant_name }}</h1>
            <p class="muted m-0 truncate text-xs">{{ cart.merchant?.merchant_address }}</p>
          </div>
          <span class="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-black">
            {{ cart.data?.store_open ? copy.open : copy.checkTime }}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="service in services"
            :key="service.value"
            class="rounded-[8px] border px-3 py-3 text-sm font-black"
            :class="transactionType === service.value ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black' : 'surface-button'"
            type="button"
            :disabled="cart.loading"
            @click="cart.setTransactionType(service.value)"
          >
            {{ service.label }}
          </button>
        </div>
      </section>

      <AuthBridge />

      <section v-if="transactionType === 'delivery'" class="soft-card grid gap-3 p-4">
        <div class="flex items-start gap-3">
          <div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--app-accent)]/10 text-[var(--app-accent)]">
            <MapPin :size="20" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="m-0 text-lg font-black">{{ copy.deliveryAddress }}</h2>
            <p class="muted m-0 mt-1 text-sm">{{ addressLabel }}</p>
            <p v-if="cart.data?.distance_pretty" class="m-0 mt-2 text-xs font-bold text-[var(--app-accent)]">{{ cart.data.distance_pretty }}</p>
          </div>
        </div>
        <RouterLink class="surface-button rounded-full px-4 py-3 text-center text-sm font-black" to="/location?redirect=/checkout">
          {{ copy.changeLocation }}
        </RouterLink>

        <div class="grid gap-3 border-t border-white/10 pt-3">
          <div class="grid grid-cols-[0.72fr_1.28fr] gap-2">
            <label class="grid gap-2">
              <span class="field-label text-xs font-black uppercase">{{ copy.house }}</span>
              <input v-model.trim="checkout.deliveryStreetNumber" class="field" data-checkout-address="street-number" autocomplete="address-line2" placeholder="44" />
            </label>
            <label class="grid gap-2">
              <span class="field-label text-xs font-black uppercase">{{ copy.street }}</span>
              <input v-model.trim="checkout.deliveryStreetName" class="field" data-checkout-address="street-name" autocomplete="address-line1" :placeholder="copy.streetPlaceholder" />
            </label>
          </div>
          <label class="grid gap-2">
            <span class="field-label text-xs font-black uppercase">{{ copy.entrance }}</span>
            <input v-model.trim="checkout.deliveryEntrance" class="field" data-checkout-address="entrance" :placeholder="copy.entrancePlaceholder" />
          </label>
        </div>
      </section>

      <section class="soft-card grid gap-3 p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="m-0 text-lg font-black">{{ copy.time }}</h2>
            <p class="muted m-0 mt-1 text-sm">
              {{ transactionInfo.delivery_type_pretty || copy.now }}
              <span v-if="transactionInfo.estimation"> / {{ transactionInfo.estimation }} {{ copy.min }}</span>
            </p>
          </div>
          <Clock3 class="text-[var(--app-accent)]" :size="22" />
        </div>

        <div v-if="deliveryOptions.length" class="grid grid-cols-2 gap-2">
          <button
            v-for="option in deliveryOptions"
            :key="option.value"
            class="rounded-[8px] border px-3 py-3 text-sm font-black"
            :class="deliveryType === option.value ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black' : 'surface-button'"
            type="button"
            :disabled="cart.loading || option.value === 'schedule'"
            @click="option.value === 'now' ? cart.setDeliveryNow() : null"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section class="soft-card grid gap-3 p-4">
        <h2 class="m-0 text-lg font-black">{{ copy.yourOrder }}</h2>
        <article v-for="item in cart.items" :key="item.cart_row" class="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div class="min-w-0">
            <h3 class="m-0 truncate text-sm font-black">{{ decodeHtml(item.item_name) }}</h3>
            <p class="muted m-0 text-xs">{{ item.qty }} x {{ item.price?.pretty_price_after_discount || item.price?.pretty_price }}</p>
          </div>
          <strong>{{ item.price?.pretty_total_after_discount || item.subtotal_pretty }}</strong>
        </article>
      </section>

      <section class="soft-card grid gap-3 p-4">
        <div class="flex items-center justify-between">
          <h2 class="m-0 text-lg font-black">{{ copy.tips }}</h2>
          <Sparkles class="text-[var(--app-accent)]" :size="20" />
        </div>
        <div v-if="checkout.hasTips" class="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="tip in checkout.tipOptions"
            :key="tip.value"
            class="shrink-0 rounded-full border px-4 py-2 text-sm font-black"
            :class="checkout.selectedTip === tip.value ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black' : 'surface-button'"
            type="button"
            @click="checkout.selectedTip = tip.value"
          >
            {{ tip.label }}
          </button>
        </div>
        <p v-else class="muted m-0 text-sm">{{ checkout.tipsError || copy.tipsUnavailable }}</p>
      </section>

      <section class="soft-card grid gap-3 p-4">
        <div class="flex items-center justify-between">
          <h2 class="m-0 text-lg font-black">{{ copy.promoPoints }}</h2>
          <BadgePercent class="text-[var(--app-accent)]" :size="20" />
        </div>

        <div class="flex gap-2">
          <input v-model.trim="checkout.promoCode" class="field min-w-0 flex-1" :placeholder="copy.promoCode" autocomplete="off" />
          <button
            class="tagam-pill tap-motion shrink-0 px-4 py-2"
            type="button"
            :disabled="!checkout.promoCode || checkout.applyingPromo"
            @click="checkout.applyPromoCodeValue()"
          >
            {{ copy.add }}
          </button>
        </div>

        <p v-if="checkout.promoError" class="m-0 rounded-[8px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-50">
          {{ checkout.promoError }}
        </p>

        <div v-if="checkout.promoList.length" class="grid gap-2">
          <article v-for="promo in checkout.promoList" :key="promo.promo_id || promo.title" class="rounded-[8px] border border-[var(--app-border)] bg-[var(--app-control)] p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="brand-kicker m-0">{{ promo.promo_type === "points" ? "POINTS" : "PROMO" }}</p>
                <h3 class="m-0 mt-1 text-base font-black">{{ promo.title || promo.promo_name || copy.offer }}</h3>
                <p class="muted m-0 mt-1 text-xs">{{ promo.sub_title || promo.description || promo.valid_to || "" }}</p>
                <p v-if="promo.max_spend || promo.max_cap" class="muted m-0 mt-1 text-xs">
                  {{ [promo.max_spend, promo.max_cap].filter(Boolean).join(" / ") }}
                </p>
              </div>
              <button
                v-if="promo.promo_type !== 'points'"
                class="tagam-pill tap-motion shrink-0 px-3 py-2 text-xs"
                type="button"
                :disabled="checkout.applyingPromo"
                @click="checkout.applyPromoItem(promo)"
              >
                {{ copy.apply }}
              </button>
              <RouterLink v-else class="tagam-pill tap-motion shrink-0 px-3 py-2 text-xs" to="/points">
                {{ copy.open }}
              </RouterLink>
            </div>
          </article>
        </div>

        <p v-else class="muted m-0 text-sm">{{ copy.noPromo }}</p>
      </section>

      <section v-if="checkout.cartWallet || checkout.cartWalletError" class="soft-card grid gap-3 p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="brand-kicker m-0">WALLET</p>
            <h2 class="m-0 mt-1 text-lg font-black">{{ copy.wallet }}</h2>
            <p class="muted m-0 mt-1 text-sm">
              {{ checkout.cartWalletLabel || copy.walletAfterLogin }}
            </p>
          </div>
          <WalletCards class="shrink-0 text-[var(--app-accent)]" :size="22" />
        </div>

        <label
          v-if="checkout.cartWallet"
          class="flex items-center justify-between gap-3 rounded-[8px] border border-[var(--app-border)] bg-[var(--app-control)] p-3"
          :class="checkout.canUseCartWallet ? '' : 'opacity-60'"
        >
          <span>
            <span class="block text-sm font-black">{{ copy.payFromWallet }}</span>
            <span class="muted text-xs">{{ checkout.useDigitalWallet ? copy.walletApplied : copy.walletApplyHint }}</span>
          </span>
          <input
            :checked="checkout.useDigitalWallet"
            :disabled="!checkout.canUseCartWallet || checkout.applyingWallet"
            class="h-5 w-5 accent-[var(--app-accent)]"
            type="checkbox"
            @change="checkout.applyDigitalWallet($event.target.checked)"
          />
        </label>

        <p v-if="checkout.cartWalletError" class="m-0 rounded-[8px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-50">
          {{ checkout.cartWalletError }}
        </p>
      </section>

      <section class="soft-card grid gap-3 p-4">
        <h2 class="m-0 text-lg font-black">{{ copy.payment }}</h2>
        <template v-if="paymentList.length">
          <button
            v-for="payment in paymentList"
            :key="payment.payment_uuid || payment.payment_code"
            class="flex items-center justify-between rounded-[8px] border p-3 text-left"
            :class="checkout.selectedPaymentUuid === payment.payment_uuid ? 'border-[var(--app-accent)] bg-[var(--app-accent)]/10' : 'surface-button'"
            type="button"
            @click="checkout.selectPayment(payment)"
          >
            <span>
              <span class="block font-black">{{ payment.payment_name || payment.attr1 || payment.payment_code }}</span>
              <span v-if="payment.attr2" class="muted text-xs">{{ payment.attr2 }}</span>
            </span>
            <CheckCircle2 v-if="checkout.selectedPaymentUuid === payment.payment_uuid" class="text-[var(--app-accent)]" :size="19" />
            <CreditCard v-else :size="18" />
          </button>
        </template>
        <div v-else class="rounded-[8px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-50">
          {{ checkout.paymentError || copy.paymentHint }}
        </div>
        <label v-if="checkout.selectedPayment?.payment_code === 'cod'" class="grid gap-2">
          <span class="field-label text-xs font-black uppercase">{{ copy.changeFrom }}</span>
          <input v-model="checkout.paymentChange" class="field" inputmode="decimal" :placeholder="copy.changePlaceholder" />
        </label>
      </section>

      <section v-if="cart.summary.length" class="soft-card grid gap-3 p-4">
        <div v-for="row in cart.summary" :key="row.type || row.name" class="flex items-center justify-between gap-3">
          <span class="muted">{{ row.name }}</span>
          <strong>{{ row.value }}</strong>
        </div>
      </section>

      <label class="grid gap-2">
        <span class="field-label text-sm font-black uppercase">{{ copy.orderComment }}</span>
        <textarea v-model="checkout.orderNotes" class="field min-h-24 resize-none py-3" :placeholder="copy.commentPlaceholder" />
      </label>

      <label class="soft-card flex items-center justify-between gap-3 p-4">
        <span>
          <span class="block text-sm font-black">{{ copy.utensils }}</span>
          <span class="muted text-xs">{{ copy.utensilsHint }}</span>
        </span>
        <input v-model="checkout.includeUtensils" type="checkbox" class="h-5 w-5 accent-[var(--app-accent)]" />
      </label>

      <section v-if="checkout.placeOrderError" class="soft-card grid gap-3 p-4">
        <div class="rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
          {{ checkout.placeOrderError }}
        </div>
      </section>

      <div v-if="client.authenticated" class="checkout-action-bar">
        <button class="primary-button tap-motion w-full justify-between px-5" type="button" :disabled="!canPlaceOrder" @click="submitOrder">
          <span>{{ orderButtonLabel }}</span>
          <strong>{{ cart.totalLabel }}</strong>
        </button>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { BadgePercent, CheckCircle2, Clock3, CreditCard, MapPin, Sparkles, WalletCards } from "@lucide/vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useCartStore } from "src/stores/cart";
import { useCheckoutStore } from "src/stores/checkout";
import { useClientAuthStore } from "src/stores/clientAuth";
import { useSessionStore } from "src/stores/session";
import { useAppStore } from "src/stores/app";

const app = useAppStore();
const cart = useCartStore();
const checkout = useCheckoutStore();
const client = useClientAuthStore();
const session = useSessionStore();
const router = useRouter();

const copy = computed(() => {
  if (app.language === "tk") {
    return {
      title: "Checkout",
      orderCreated: "Sargyt döredildi",
      openOrder: "Sargydy aç",
      emptyCart: "Sebet boş",
      emptyCartText: "Checkout sebediňize tagam goşanyňyzdan soň açylar.",
      toRestaurants: "Restoranlara",
      restaurant: "Restoran",
      open: "Açyk",
      checkTime: "Wagty barla",
      deliveryAddress: "Eltip bermek salgysy",
      changeLocation: "Ýerleşişi üýtget",
      house: "Jaý",
      street: "Köçe",
      streetPlaceholder: "Köçäniň ady",
      entrance: "Girelge, gat, bellik",
      entrancePlaceholder: "Meselem: girelge 2, gat 4",
      time: "Wagt",
      now: "Häzir",
      min: "min",
      yourOrder: "Sargydyňyz",
      tips: "Çaý puly",
      tipsUnavailable: "Çaý puly häzir serwerde işjeň däl.",
      promoPoints: "Promo we ballar",
      promoCode: "Promokod",
      add: "Goş",
      offer: "Teklip",
      apply: "Ulan",
      noPromo: "Sebet üçin elýeterli teklipler bolsa, olar şu ýerde peýda bolar.",
      wallet: "Gapjyk",
      walletAfterLogin: "Balans gireniňizden soň elýeterli",
      payFromWallet: "Gapjykdan töle",
      walletApplied: "Balans sebede ulanyldy",
      walletApplyHint: "Elýeterli möçber ulanylyp, jem täzeden hasaplanar",
      payment: "Töleg",
      paymentHint: "Töleg usullaryny almak üçin myhman hökmünde dowam ediň ýa-da giriň.",
      changeFrom: "Gaýtargy pul",
      changePlaceholder: "Meselem: 500",
      orderComment: "Sargyt üçin bellik",
      commentPlaceholder: "Meselem: eltip bermezden öň jaň ediň",
      utensils: "Enjamlar",
      utensilsHint: "Sargyda bir gezeklik enjamlar goşarys",
      creating: "Sargyt döredilýär...",
      disabled: "Sargyt döretmek öçürilen",
      authRequired: "Giriň ýa-da myhman hökmünde dowam ediň",
      choosePayment: "Tölegi saýlaň",
      placeOrder: "Sargydy tassyklamak",
    };
  }
  if (app.language === "en") {
    return {
      title: "Checkout",
      orderCreated: "Order created",
      openOrder: "Open order",
      emptyCart: "Cart is empty",
      emptyCartText: "Checkout appears after adding a dish to the cart.",
      toRestaurants: "To restaurants",
      restaurant: "Restaurant",
      open: "Open",
      checkTime: "Check time",
      deliveryAddress: "Delivery address",
      changeLocation: "Change location",
      house: "House",
      street: "Street",
      streetPlaceholder: "Street name",
      entrance: "Entrance, floor, landmark",
      entrancePlaceholder: "Example: entrance 2, floor 4",
      time: "Time",
      now: "Now",
      min: "min",
      yourOrder: "Your order",
      tips: "Tips",
      tipsUnavailable: "Tips are not enabled by the server right now.",
      promoPoints: "Promo and points",
      promoCode: "Promo code",
      add: "Add",
      offer: "Offer",
      apply: "Apply",
      noPromo: "Active promos will appear here if offers are available for this cart.",
      wallet: "Wallet",
      walletAfterLogin: "Balance is available after sign-in",
      payFromWallet: "Pay from wallet",
      walletApplied: "Balance applied to cart",
      walletApplyHint: "We will apply the available amount and recalculate the total",
      payment: "Payment",
      paymentHint: "Continue as guest or sign in to get payment methods.",
      changeFrom: "Change from",
      changePlaceholder: "Example: 500",
      orderComment: "Order comment",
      commentPlaceholder: "Example: call before delivery",
      utensils: "Utensils",
      utensilsHint: "Add disposable utensils to the order",
      creating: "Creating order...",
      disabled: "Order creation is disabled",
      authRequired: "Sign in or continue as guest",
      choosePayment: "Choose payment",
      placeOrder: "Place order",
    };
  }
  return {
    title: "Оформление",
    orderCreated: "Заказ создан",
    openOrder: "Открыть заказ",
    emptyCart: "Корзина пуста",
    emptyCartText: "Оформление появится после добавления блюда в корзину.",
    toRestaurants: "К ресторанам",
    restaurant: "Ресторан",
    open: "Открыто",
    checkTime: "Проверить время",
    deliveryAddress: "Адрес доставки",
    changeLocation: "Изменить локацию",
    house: "Дом",
    street: "Улица",
    streetPlaceholder: "Название улицы",
    entrance: "Подъезд, этаж, ориентир",
    entrancePlaceholder: "Например: подъезд 2, этаж 4",
    time: "Время",
    now: "Сейчас",
    min: "мин",
    yourOrder: "Ваш заказ",
    tips: "Чаевые",
    tipsUnavailable: "Чаевые сейчас не включены сервером.",
    promoPoints: "Промо и баллы",
    promoCode: "Промокод",
    add: "Добавить",
    offer: "Предложение",
    apply: "Применить",
    noPromo: "Активные промо появятся здесь, если для корзины будут доступны предложения.",
    wallet: "Кошелек",
    walletAfterLogin: "Баланс доступен после входа",
    payFromWallet: "Оплатить из кошелька",
    walletApplied: "Баланс применен к корзине",
    walletApplyHint: "Спишем доступную сумму и пересчитаем итог",
    payment: "Оплата",
    paymentHint: "Продолжите как гость или войдите, чтобы получить способы оплаты.",
    changeFrom: "Сдача с суммы",
    changePlaceholder: "Например: 500",
    orderComment: "Комментарий к заказу",
    commentPlaceholder: "Например: позвоните перед доставкой",
    utensils: "Приборы",
    utensilsHint: "Добавим одноразовые приборы к заказу",
    creating: "Создаем заказ...",
    disabled: "Создание заказа выключено",
    authRequired: "Войдите или продолжите как гость",
    choosePayment: "Выберите оплату",
    placeOrder: "Оформить заказ",
  };
});
const placeOrderEnabled = import.meta.env.VITE_ENABLE_PLACE_ORDER !== "false";
const services = computed(() => cart.data?.services ?? []);
const deliveryOptions = computed(() => cart.data?.delivery_option ?? []);
const transactionInfo = computed(() => cart.data?.transaction_info ?? {});
const transactionType = computed(() => transactionInfo.value.transaction_type ?? "delivery");
const deliveryType = computed(() => transactionInfo.value.whento_deliver ?? "now");
const paymentList = computed(() => [
  ...Object.values(cart.data?.payment_list ?? {}),
  ...checkout.paymentList,
]);
const canPlaceOrder = computed(() =>
  placeOrderEnabled &&
  client.authenticated &&
  !checkout.placing &&
  Boolean(cart.cartUuid) &&
  Boolean(checkout.selectedPayment?.payment_uuid)
);
const orderButtonLabel = computed(() => {
  if (checkout.placing) return copy.value.creating;
  if (!placeOrderEnabled) return copy.value.disabled;
  if (!client.authenticated) return copy.value.authRequired;
  if (!checkout.selectedPayment?.payment_uuid) return copy.value.choosePayment;
  return copy.value.placeOrder;
});
const addressLabel = computed(() => {
  const address = cart.data?.delivery_address;
  return (
    address?.address ||
    address?.complete_address ||
    address?.address_label ||
    session.locationLabel
  );
});

const decodeHtml = (value) => {
  const element = document.createElement("div");
  element.innerHTML = String(value ?? "");
  return element.textContent || "";
};

const submitOrder = async () => {
  if (!canPlaceOrder.value) return;
  const order = await checkout.placeOrder();
  await cart.clear().catch(() => {});
  if (order?.order_uuid) {
    router.replace({ path: "/order/success", query: { order_uuid: order.order_uuid } });
  }
};

onMounted(() => {
  checkout.load().then(() => {
    if (client.authenticated) {
      checkout.loadPayments().catch(() => {});
    }
  });
});
</script>

<style scoped>
.checkout-action-bar {
  position: sticky;
  bottom: calc(var(--app-tabbar-height) + var(--app-tabbar-bottom) + 10px);
  z-index: 30;
  width: 100%;
  margin: 4px 0 0;
}

.page {
  padding-bottom: 12px;
}

@media (max-width: 480px) {
  .checkout-action-bar {
    bottom: calc(var(--app-tabbar-height) + var(--app-tabbar-bottom) + 8px);
  }

  .checkout-action-bar .primary-button {
    min-height: 44px;
  }
}
</style>
