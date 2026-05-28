<template>
  <section class="page checkout-page fade-up">
    <AppHeader :title="copy.title" :icon="CreditCard" action-label="Checkout" />

    <div v-if="checkout.loading && !cart.cart" class="grid gap-4">
      <div class="soft-card warm-skeleton h-28" />
      <div class="soft-card warm-skeleton h-36" />
      <div class="soft-card warm-skeleton h-44" />
    </div>

    <div v-else-if="showPlacedOrder" class="tagam-card grid gap-4 p-5 text-center">
      <h1 class="m-0 text-2xl font-black">{{ copy.orderCreated }}</h1>
      <p class="muted m-0 text-sm">{{ checkout.placedOrder.order_id || checkout.placedOrder.order_uuid }}</p>
      <RouterLink class="primary-button tap-motion" :to="{ path: '/order/success', query: { order_uuid: checkout.placedOrder.order_uuid } }">{{ copy.openOrder }}</RouterLink>
    </div>

    <div v-else-if="!cart.cartUuid || !cart.items.length" class="soft-card checkout-empty-card grid gap-4 p-5 text-center">
      <h1 class="m-0 text-2xl font-black">{{ copy.emptyCart }}</h1>
      <p class="muted m-0 text-sm">{{ copy.emptyCartText }}</p>
      <RouterLink class="primary-button tap-motion" to="/home">{{ copy.toRestaurants }}</RouterLink>
    </div>

    <template v-else>
      <div v-if="cart.data?.error?.length" class="rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        <p v-for="error in cart.data.error" :key="error" class="m-0">{{ error }}</p>
      </div>

      <section class="checkout-restaurant-card glass grid gap-4 rounded-[8px] p-4">
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

      <section v-if="transactionType === 'delivery'" class="soft-card checkout-main-card grid gap-3 p-4">
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

        <div v-if="client.authenticated && savedAddresses.length" class="grid gap-2 border-t border-white/10 pt-3">
          <div class="flex items-center justify-between gap-3">
            <span class="field-label text-xs font-black uppercase">{{ copy.savedAddresses }}</span>
            <div class="flex items-center gap-3">
              <RouterLink class="muted text-xs font-black" to="/location?redirect=/checkout&new_address=1">{{ copy.newAddress }}</RouterLink>
              <RouterLink class="muted text-xs font-black" to="/addresses">{{ copy.manageAddresses }}</RouterLink>
            </div>
          </div>
          <div class="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="address in savedAddresses"
              :key="address.address_uuid || address.id"
              class="shrink-0 rounded-[8px] border px-4 py-3 text-left text-sm"
              :class="checkout.deliveryAddressUuid === (address.address_uuid || address.id) ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black' : 'surface-button'"
              type="button"
              @click="chooseSavedAddress(address)"
            >
              <span class="block font-black">{{ address.address_label || address.location_name || copy.deliveryAddress }}</span>
              <span class="block max-w-56 truncate text-xs opacity-80">{{ savedAddressLine(address) }}</span>
            </button>
          </div>
        </div>

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
          <label class="grid gap-2">
            <span class="field-label text-xs font-black uppercase">{{ copy.deliveryInstructions }}</span>
            <textarea v-model.trim="checkout.deliveryInstructions" class="field min-h-20 resize-none py-3" :placeholder="copy.deliveryInstructionsPlaceholder" />
          </label>
        </div>
      </section>

      <section class="soft-card checkout-main-card grid gap-3 p-4">
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
            :disabled="cart.loading || checkout.scheduleLoading"
            @click="option.value === 'now' ? cart.setDeliveryNow() : openSchedule()"
          >
            {{ option.label }}
          </button>
        </div>

        <div v-if="checkout.scheduleOpen" class="grid gap-3 rounded-[8px] border border-[var(--app-border)] bg-[var(--app-control)] p-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="m-0 text-sm font-black">{{ scheduleCopy.title }}</h3>
              <p class="muted m-0 mt-1 text-xs">{{ scheduleCopy.hint }}</p>
            </div>
            <button class="surface-button grid h-9 w-9 place-items-center rounded-full p-0" type="button" @click="checkout.scheduleOpen = false">
              <X :size="18" />
            </button>
          </div>

          <div v-if="checkout.scheduleLoading" class="rounded-[8px] border border-white/10 p-3 text-sm font-bold">
            {{ scheduleCopy.loading }}
          </div>

          <p v-else-if="checkout.scheduleError" class="m-0 rounded-[8px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-50">
            {{ checkout.scheduleError }}
          </p>

          <template v-else>
            <div v-if="checkout.deliveryDateOptions.length" class="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
              <button
                v-for="date in checkout.deliveryDateOptions"
                :key="date.value"
                class="shrink-0 rounded-full border px-4 py-2 text-xs font-black"
                :class="checkout.selectedDeliveryDate === date.value ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black' : 'surface-button'"
                type="button"
                @click="checkout.selectedDeliveryDate = date.value"
              >
                {{ localizedDeliveryDateLabel(date) }}
              </button>
            </div>

            <div v-if="checkout.deliveryTimeOptions.length" class="grid gap-2">
              <button
                v-for="slot in checkout.deliveryTimeOptions"
                :key="slot.start_time || slot.pretty_time"
                class="surface-button flex items-center justify-between rounded-[8px] px-4 py-3 text-left text-sm font-black"
                type="button"
                @click="checkout.setDeliverySchedule(slot)"
              >
                <span>{{ slot.pretty_time || slot.name || slot.start_time }}</span>
                <CalendarDays :size="18" />
              </button>
            </div>

            <p v-else class="muted m-0 text-sm">{{ scheduleCopy.noSlots }}</p>
          </template>
        </div>
      </section>

      <section class="soft-card checkout-side-card checkout-order-card grid gap-3 p-4">
        <h2 class="m-0 text-lg font-black">{{ copy.yourOrder }}</h2>
        <article v-for="item in cart.items" :key="item.cart_row" class="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div class="min-w-0">
            <h3 class="m-0 truncate text-sm font-black">{{ decodeHtml(item.item_name) }}</h3>
            <p class="muted m-0 text-xs">{{ item.qty }} x {{ item.price?.pretty_price_after_discount || item.price?.pretty_price }}</p>
          </div>
          <strong>{{ item.price?.pretty_total_after_discount || item.subtotal_pretty }}</strong>
        </article>
      </section>

      <section class="soft-card checkout-side-card grid gap-3 p-4">
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

      <section class="soft-card checkout-side-card grid gap-3 p-4">
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
                class="tagam-pill tap-motion shrink-0 px-3 py-2 text-xs"
                type="button"
                :disabled="checkout.applyingPromo"
                @click="promo.promo_type === 'points' ? checkout.openPointsPanel(promo) : checkout.applyPromoItem(promo)"
              >
                {{ copy.apply }}
              </button>
            </div>
          </article>
        </div>

        <p v-else class="muted m-0 text-sm">{{ copy.noPromo }}</p>

        <div v-if="checkout.pointsPanelOpen" class="grid gap-3 rounded-[8px] border border-[var(--app-border)] bg-[var(--app-control)] p-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="m-0 text-sm font-black">{{ checkoutActionCopy.pointsTitle }}</h3>
              <p class="muted m-0 mt-1 text-xs">
                {{ checkout.pointsPromo?.balance ? checkout.pointsPromo.balance + " " : "" }}{{ checkoutActionCopy.pointsHint }}
              </p>
            </div>
            <button class="surface-button grid h-9 w-9 place-items-center rounded-full p-0" type="button" @click="checkout.pointsPanelOpen = false">
              <X :size="18" />
            </button>
          </div>

          <div v-if="checkout.loadingPoints" class="rounded-[8px] border border-white/10 p-3 text-sm font-bold">
            {{ checkoutActionCopy.loading }}
          </div>

          <div v-else-if="checkout.pointsPromo?.use_thresholds && checkout.pointsThresholds.length" class="grid gap-2">
            <button
              v-for="threshold in checkout.pointsThresholds"
              :key="threshold.id"
              class="surface-button flex items-center justify-between rounded-[8px] px-4 py-3 text-left text-sm font-black"
              :class="String(checkout.selectedPoints) === String(threshold.id) ? 'border-[var(--app-accent)] bg-[var(--app-accent)]/10' : ''"
              type="button"
              :disabled="Number(checkout.pointsPromo?.balance || 0) < Number(threshold.points || 0)"
              @click="checkout.selectedPoints = threshold.id"
            >
              <span>{{ threshold.discount_label || threshold.label || threshold.points }}</span>
              <span class="muted text-xs">{{ threshold.points }}</span>
            </button>
          </div>

          <input
            v-else
            v-model.trim="checkout.selectedPoints"
            class="field"
            inputmode="numeric"
            :placeholder="checkoutActionCopy.pointsPlaceholder"
          />

          <button
            class="primary-button tap-motion"
            type="button"
            :disabled="!checkout.selectedPoints || checkout.applyingPromo"
            @click="checkout.applyPointsValue()"
          >
            {{ checkoutActionCopy.applyPoints }}
          </button>
        </div>
      </section>

      <section v-if="checkout.cartWallet || checkout.cartWalletError" class="soft-card checkout-side-card grid gap-3 p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="brand-kicker m-0">{{ copy.walletKicker }}</p>
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

      <section class="soft-card checkout-side-card grid gap-3 p-4">
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
              <span class="block font-black">{{ paymentDisplayName(payment) }}</span>
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
          <span v-if="checkout.requiresPaymentChange" class="muted text-xs">{{ checkoutActionCopy.changeRequired }}</span>
        </label>
      </section>

      <section v-if="cart.summary.length" class="soft-card checkout-side-card checkout-summary-card grid gap-3 p-4">
        <div v-for="row in cart.summary" :key="row.type || row.name" class="flex items-center justify-between gap-3">
          <span class="muted">{{ row.name }}</span>
          <span class="flex items-center gap-2">
            <strong>{{ row.value }}</strong>
            <button
              v-if="checkout.canRemoveDiscount(row)"
              class="surface-button grid h-8 w-8 place-items-center rounded-full p-0"
              type="button"
              :disabled="checkout.applyingPromo"
              @click="checkout.removeDiscount(row)"
            >
              <X :size="15" />
            </button>
          </span>
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
import { BadgePercent, CalendarDays, CheckCircle2, Clock3, CreditCard, MapPin, Sparkles, WalletCards, X } from "@lucide/vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import { useCartStore } from "src/stores/cart";
import { useCheckoutStore } from "src/stores/checkout";
import { useClientAuthStore } from "src/stores/clientAuth";
import { useCustomerStore } from "src/stores/customer";
import { useSessionStore } from "src/stores/session";
import { useAppStore } from "src/stores/app";

const app = useAppStore();
const cart = useCartStore();
const checkout = useCheckoutStore();
const client = useClientAuthStore();
const customer = useCustomerStore();
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
      savedAddresses: "Saklanan salgylar",
      manageAddresses: "Dolandyr",
      newAddress: "Täze",
      house: "Jaý",
      street: "Köçe",
      streetPlaceholder: "Köçäniň ady",
      entrance: "Girelge, gat, bellik",
      entrancePlaceholder: "Meselem: girelge 2, gat 4",
      deliveryInstructions: "Eltip bermek bellikleri",
      deliveryInstructionsPlaceholder: "Meselem: gapy kody ýa-da jaň etmegiň wagty",
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
      walletKicker: "Gapjyk",
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
      savedAddresses: "Saved addresses",
      manageAddresses: "Manage",
      newAddress: "New",
      house: "House",
      street: "Street",
      streetPlaceholder: "Street name",
      entrance: "Entrance, floor, landmark",
      entrancePlaceholder: "Example: entrance 2, floor 4",
      deliveryInstructions: "Delivery instructions",
      deliveryInstructionsPlaceholder: "Example: door code or when to call",
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
      walletKicker: "Wallet",
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
    savedAddresses: "Сохраненные адреса",
    manageAddresses: "Управлять",
    newAddress: "Новый",
    house: "Дом",
    street: "Улица",
    streetPlaceholder: "Название улицы",
    entrance: "Подъезд, этаж, ориентир",
    entrancePlaceholder: "Например: подъезд 2, этаж 4",
    deliveryInstructions: "Инструкции для доставки",
    deliveryInstructionsPlaceholder: "Например: код домофона или когда звонить",
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
    walletKicker: "Кошелек",
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
const merchantId = computed(() => cart.data?.merchant_id || cart.merchant?.merchant_id || cart.merchant?.merchant_uuid || "");
const scheduleCopy = computed(() => {
  const isDelivery = transactionType.value === "delivery";

  if (app.language === "tk") {
    return {
      title: isDelivery ? "Eltip beriljek wagty" : "Sargyt wagty",
      hint: "Elyeterli guni we wagty saylan.",
      loading: "Wagtlar alynýar...",
      noSlots: "Bu gun ucin elyeterli wagt yok.",
    };
  }
  if (app.language === "en") {
    return {
      title: isDelivery ? "Delivery time" : "Order time",
      hint: "Choose an available day and time slot.",
      loading: "Loading time slots...",
      noSlots: "No time slots are available for this day.",
    };
  }
  return {
    title: isDelivery ? "Время доставки" : "Время заказа",
    hint: "Выберите доступный день и слот.",
    loading: "Загружаем слоты...",
    noSlots: "На этот день нет доступных слотов.",
  };
});
const relativeDateLabels = {
  ru: {
    today: "Сегодня",
    tomorrow: "Завтра",
  },
  tk: {
    today: "Şu gün",
    tomorrow: "Ertir",
  },
  en: {
    today: "Today",
    tomorrow: "Tomorrow",
  },
};
const localizedDeliveryDateLabel = (date) => {
  const label = String(date?.label ?? date?.value ?? "");
  const labels = relativeDateLabels[app.language] || relativeDateLabels.ru;

  return label
    .replace(/^Today\b/i, labels.today)
    .replace(/^Tomorrow\b/i, labels.tomorrow);
};
const paymentDisplayName = (payment) => {
  const code = String(payment?.payment_code ?? "").toLowerCase();
  const rawName = payment?.payment_name || payment?.attr1 || payment?.payment_code || "";

  if (code === "cod") {
    if (app.language === "en") return "Cash on delivery";
    if (app.language === "tk") return "Eltip berlende nagt töleg";
    return "Наличными при получении";
  }

  return rawName;
};
const paymentDedupKey = (payment) => {
  const code = String(payment?.payment_code ?? "").toLowerCase();
  const rawName = String(payment?.payment_name || payment?.attr1 || "").toLowerCase();

  if (code === "cod" || /cash\s+on\s+delivery/.test(rawName)) return "cod";

  return payment?.payment_uuid || code || rawName;
};
const checkoutActionCopy = computed(() => {
  if (app.language === "en") {
    return {
      pointsTitle: "Apply points",
      pointsHint: "points available to use",
      pointsPlaceholder: "Enter points to convert to discount",
      applyPoints: "Apply points",
      loading: "Loading...",
      changeRequired: "Required for cash payment.",
      pickupConfirm: "You selected pickup. Please confirm that you will collect the order from the restaurant.",
      onlineRedirect: "Opening payment page...",
    };
  }
  if (app.language === "tk") {
    return {
      pointsTitle: "Ballary ulan",
      pointsHint: "ulanmak ucin elyeterli bal",
      pointsPlaceholder: "Arzanlatma ucin ballary girizin",
      applyPoints: "Ballary ulan",
      loading: "Yuklenyar...",
      changeRequired: "Nagt toleg ucin hokmany.",
      pickupConfirm: "Siz alyp gitmegi sayladynyz. Sargydy restorandan aljagynyzy tassyklaň.",
      onlineRedirect: "Toleg sahypasy acylyar...",
    };
  }
  return {
    pointsTitle: "Применить баллы",
    pointsHint: "баллов доступно для использования",
    pointsPlaceholder: "Введите баллы для скидки",
    applyPoints: "Применить баллы",
    loading: "Загружаем...",
    changeRequired: "Обязательно для оплаты наличными.",
    pickupConfirm: "Вы выбрали самовывоз. Подтвердите, что заберете заказ из ресторана.",
    onlineRedirect: "Открываем страницу оплаты...",
  };
});
const paymentList = computed(() => {
  const seen = new Set();
  return [
    ...Object.values(cart.data?.payment_list ?? {}),
    ...checkout.paymentList,
  ].filter((payment) => {
    const key = paymentDedupKey(payment);
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
});
const showPlacedOrder = computed(() => checkout.placedOrder && !cart.cartUuid);
const savedAddresses = computed(() => customer.addressList ?? []);
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
  const selectedAddressLine = [checkout.deliveryStreetNumber, checkout.deliveryStreetName].filter(Boolean).join(" ");
  if (checkout.deliveryAddressUuid && (checkout.deliveryAddressLabel || selectedAddressLine)) {
    return [checkout.deliveryAddressLabel, selectedAddressLine].filter(Boolean).join(": ");
  }
  return (
    address?.address ||
    address?.complete_address ||
    address?.address_label ||
    session.locationLabel
  );
});

const savedAddressLine = (address) =>
  address.formatted_address ||
  address.complete_address ||
  address.address ||
  [address.street_number || address.address1, address.street_name].filter(Boolean).join(" ") ||
  address.location_name ||
  "";

const chooseSavedAddress = async (address) => {
  await checkout.selectSavedAddress(address);
  if (client.authenticated) customer.loadAddresses().catch(() => {});
};

const afterCheckoutAuth = () => {
  checkout.loadPayments().catch(() => {});
  customer.loadAddresses().catch(() => {});
};

const decodeHtml = (value) => {
  const element = document.createElement("div");
  element.innerHTML = String(value ?? "");
  return element.textContent || "";
};

const submitOrder = async () => {
  if (!canPlaceOrder.value) return;
  if (transactionType.value === "pickup" && !window.confirm(checkoutActionCopy.value.pickupConfirm)) {
    return;
  }
  const order = await checkout.placeOrder();
  const instructions = order?.payment_instructions ?? {};
  if (order?.payment_url && instructions.method !== "offline") {
    checkout.placeOrderError = checkoutActionCopy.value.onlineRedirect;
    window.location.href = order.payment_url;
    return;
  }
  await cart.clear().catch(() => {});
  if (order?.order_uuid) {
    router.replace({ path: "/order/success", query: { order_uuid: order.order_uuid } });
  }
};

const openSchedule = () => {
  checkout.openDeliverySchedule(merchantId.value).catch(() => {});
};

onMounted(() => {
  checkout.load().then(() => {
    if (client.authenticated) {
      afterCheckoutAuth();
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
