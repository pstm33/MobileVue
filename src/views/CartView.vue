<template>
  <section class="page cart-page fade-up">
    <AppHeader :title="copy.title" :icon="ShoppingBag" :action-label="copy.title" />

    <div v-if="cart.loading && !cart.cart" class="grid gap-4">
      <div class="soft-card warm-skeleton h-24" />
      <div class="soft-card warm-skeleton h-32" />
      <div class="soft-card warm-skeleton h-32" />
    </div>

    <div v-else-if="!cart.cartUuid" class="soft-card cart-empty-card grid gap-4 p-5 text-center">
      <div class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-300/10 text-emerald-300">
        <ShoppingBag :size="28" />
      </div>
      <div>
        <h1 class="m-0 text-2xl font-black">{{ copy.emptyTitle }}</h1>
        <p class="muted mt-2 text-sm">{{ copy.emptyText }}</p>
      </div>
      <RouterLink class="primary-button tap-motion" to="/home">{{ copy.toRestaurants }}</RouterLink>
    </div>

    <div v-else-if="cart.error" class="soft-card p-5">
      <h1 class="m-0 text-2xl font-black">{{ copy.unavailable }}</h1>
      <p class="muted mt-2 text-sm">{{ cart.error }}</p>
      <button class="primary-button tap-motion mt-4 w-full" type="button" @click="cart.refresh()">
        {{ copy.retry }}
      </button>
    </div>

    <template v-else>
      <section v-if="cart.merchant" class="cart-merchant glass flex items-center gap-3 rounded-[8px] p-3">
        <img
          v-if="cart.merchant.logo"
          class="h-14 w-14 rounded-[8px] object-cover"
          :src="tagamAsset(cart.merchant.logo)"
          :alt="cart.merchant.restaurant_name"
        />
        <div class="min-w-0 flex-1">
          <p class="m-0 text-xs font-black uppercase tracking-[0.16em] text-emerald-300">{{ copy.orderFrom }}</p>
          <h1 class="m-0 truncate text-xl font-black">{{ cart.merchant.restaurant_name }}</h1>
          <p class="muted m-0 truncate text-xs">{{ cart.merchant.merchant_address }}</p>
        </div>
      </section>

      <section v-if="!cart.items.length" class="soft-card grid gap-4 p-5 text-center">
        <h2 class="m-0 text-2xl font-black">{{ copy.noItems }}</h2>
        <RouterLink class="primary-button" :to="restaurantLink">{{ copy.openMenu }}</RouterLink>
      </section>

      <section v-else class="cart-items grid gap-3">
        <article v-for="(item, index) in cart.items" :key="item.cart_row" class="tagam-card cart-item-card stagger-item grid gap-3 p-3" :style="{ '--stagger-delay': `${Math.min(index, 6) * 45}ms` }">
          <div class="flex gap-3">
            <img
              v-if="item.url_image"
              class="h-20 w-20 rounded-[8px] object-cover"
              :src="tagamAsset(item.url_image)"
              :alt="item.item_name"
            />
            <div v-else class="grid h-20 w-20 shrink-0 place-items-center rounded-[8px] bg-[var(--app-accent-soft)] text-xs font-black text-[var(--app-muted)]">
              TAGAM
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h2 class="m-0 text-base font-black">{{ decodeHtml(item.item_name) }}</h2>
                  <p v-if="item.price?.size_name" class="muted m-0 text-xs">{{ item.price.size_name }}</p>
                </div>
                <button class="icon-button !h-9 !w-9" type="button" :aria-label="copy.remove" @click="cart.removeItem(item.cart_row, slug)">
                  <Trash2 :size="16" />
                </button>
              </div>

              <p v-if="item.special_instructions" class="muted mt-2 text-xs">{{ item.special_instructions }}</p>

              <div v-if="item.addons?.length" class="mt-2 grid gap-1">
                <p v-for="addon in item.addons" :key="`${item.cart_row}-${addon.sub_item_id}`" class="muted m-0 text-xs">
                  + {{ decodeHtml(addon.sub_item_name) }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-white/10 pt-3">
            <div class="glass flex items-center rounded-[8px] p-1">
              <button
                class="icon-button !h-9 !w-9"
                type="button"
                :aria-label="copy.decrease"
                :disabled="cart.loading"
                @click="changeQty(item, -1)"
              >
                <Minus :size="16" />
              </button>
              <strong class="w-10 text-center">{{ item.qty }}</strong>
              <button
                class="icon-button !h-9 !w-9"
                type="button"
                :aria-label="copy.increase"
                :disabled="cart.loading"
                @click="changeQty(item, 1)"
              >
                <Plus :size="16" />
              </button>
            </div>
            <strong>{{ item.price?.pretty_total_after_discount || item.subtotal_pretty }}</strong>
          </div>
        </article>
      </section>

      <section v-if="cart.summary.length" class="soft-card cart-summary grid gap-3 p-4">
        <div v-for="row in cart.summary" :key="row.type || row.name" class="flex items-center justify-between gap-3">
          <span class="muted">{{ row.name }}</span>
          <strong>{{ row.value }}</strong>
        </div>
      </section>

      <section v-if="cartBlockingErrors.length" class="soft-card cart-warning-card grid gap-2 p-4">
        <p class="brand-kicker m-0">{{ cartAttentionTitle }}</p>
        <p v-for="error in cartBlockingErrors" :key="error" class="m-0 text-sm font-bold text-amber-50">
          {{ error }}
        </p>
      </section>

      <div v-if="cart.items.length" class="cart-action-bar sticky bottom-4 z-20 grid gap-3">
        <button class="surface-button rounded-full px-4 py-3 text-sm font-black" type="button" @click="cart.clear">
          {{ copy.clear }}
        </button>
        <button v-if="cartBlockingErrors.length" class="primary-button tap-motion w-full justify-between px-5 opacity-60" type="button" disabled>
          <span>{{ cartFixLabel }}</span>
          <strong>{{ cart.totalLabel }}</strong>
        </button>
        <RouterLink v-else class="primary-button tap-motion w-full justify-between px-5" to="/checkout">
          <span>{{ copy.checkout }}</span>
          <strong>{{ cart.totalLabel }}</strong>
        </RouterLink>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { Minus, Plus, ShoppingBag, Trash2 } from "@lucide/vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import { useAppStore } from "src/stores/app";
import { useCartStore } from "src/stores/cart";
import { tagamAsset } from "src/services/tagamAssets";

const app = useAppStore();
const cart = useCartStore();
const slug = computed(() => cart.merchant?.slug || "");
const restaurantLink = computed(() => (slug.value ? `/restaurant/${slug.value}` : "/home"));
const cartBlockingErrors = computed(() =>
  [
    ...(Array.isArray(cart.data?.error) ? cart.data.error : []),
    ...(Array.isArray(cart.data?.errors) ? cart.data.errors : []),
  ].filter(Boolean)
);
const cartAttentionTitle = computed(() => {
  if (app.language === "en") return "Check cart";
  if (app.language === "tk") return "Sebedi barlaň";
  return "Проверьте корзину";
});
const cartFixLabel = computed(() => {
  if (app.language === "en") return "Fix cart first";
  if (app.language === "tk") return "Ilki düzediň";
  return "Сначала исправьте";
});

const cartCopy = {
  ru: {
    title: "Корзина",
    emptyTitle: "Корзина пустая",
    emptyText: "Выберите ресторан и добавьте любимые блюда в заказ.",
    toRestaurants: "К ресторанам",
    unavailable: "Корзина недоступна",
    retry: "Повторить",
    orderFrom: "Заказ из",
    noItems: "В корзине нет блюд",
    openMenu: "Открыть меню",
    remove: "Удалить блюдо",
    decrease: "Уменьшить количество",
    increase: "Увеличить количество",
    clear: "Очистить корзину",
    checkout: "К оформлению",
  },
  tk: {
    title: "Sebet",
    emptyTitle: "Sebet boş",
    emptyText: "Restoran saýlaň we halaýan tagamlaryňyzy sargyda goşuň.",
    toRestaurants: "Restoranlara",
    unavailable: "Sebet elýeterli däl",
    retry: "Gaýtadan",
    orderFrom: "Sargyt",
    noItems: "Sebetde tagam ýok",
    openMenu: "Menýuny aç",
    remove: "Tagamy aýyr",
    decrease: "Sany azalt",
    increase: "Sany köpelt",
    clear: "Sebedi arassala",
    checkout: "Resmileşdirmek",
  },
  en: {
    title: "Cart",
    emptyTitle: "Your cart is empty",
    emptyText: "Choose a restaurant and add your favorite dishes to the order.",
    toRestaurants: "Browse restaurants",
    unavailable: "Cart is unavailable",
    retry: "Retry",
    orderFrom: "Order from",
    noItems: "No dishes in the cart",
    openMenu: "Open menu",
    remove: "Remove item",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    clear: "Clear cart",
    checkout: "Checkout",
  },
};

const copy = computed(() => cartCopy[app.language] || cartCopy.ru);

const decodeHtml = (value) => {
  const element = document.createElement("div");
  element.innerHTML = String(value ?? "");
  return element.textContent || "";
};

const changeQty = (item, delta) => {
  const nextQty = Number(item.qty ?? 1) + delta;
  if (nextQty <= 0) {
    cart.removeItem(item.cart_row, slug.value);
    return;
  }
  cart.updateItem(item.cart_row, nextQty, slug.value);
};

onMounted(() => {
  cart.refresh().catch(() => {});
});
</script>
