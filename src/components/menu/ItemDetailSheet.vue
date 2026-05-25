<template>
  <Teleport to="body">
    <div v-if="itemDetail.open" class="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm">
      <button class="absolute inset-0 cursor-default" type="button" :aria-label="copy.close" @click="itemDetail.close" />

      <section class="relative max-h-[92vh] w-full overflow-hidden rounded-t-[8px] border border-white/10 bg-[#101416] shadow-2xl">
        <div class="h-1.5 w-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-rose-400" />

        <div v-if="itemDetail.loading" class="grid gap-4 p-5">
          <div class="h-48 animate-pulse rounded-[8px] bg-white/5" />
          <div class="h-8 w-2/3 animate-pulse rounded bg-white/5" />
          <div class="h-24 animate-pulse rounded-[8px] bg-white/5" />
        </div>

        <div v-else-if="itemDetail.error" class="p-5">
          <h2 class="m-0 text-2xl font-black">{{ copy.unavailable }}</h2>
          <p class="muted mt-2 text-sm">{{ itemDetail.error }}</p>
          <button class="primary-button mt-4 w-full" type="button" @click="itemDetail.close">
            {{ copy.close }}
          </button>
        </div>

        <template v-else-if="itemDetail.item">
          <div class="overflow-y-auto pb-28" style="max-height: calc(92vh - 6px)">
            <img
              v-if="imageUrl"
              class="aspect-square w-full object-cover"
              :src="imageUrl"
              :alt="itemName"
            />
            <div v-else class="grid h-52 place-items-center bg-white/5 text-sm font-black text-white/50">
              TAGAM
            </div>

            <div class="grid gap-5 p-5">
              <div>
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="m-0 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                      {{ itemDetail.restaurantName }}
                    </p>
                    <h2 class="m-0 mt-1 text-3xl font-black">{{ itemName }}</h2>
                  </div>
                  <button class="icon-button" type="button" :aria-label="copy.close" @click="itemDetail.close">
                    <X :size="19" />
                  </button>
                </div>
                <p v-if="description" class="muted mt-3 text-sm leading-6">{{ description }}</p>
              </div>

              <div v-if="itemDetail.prices.length > 1" class="grid gap-2">
                <h3 class="m-0 text-sm font-black uppercase text-white/60">{{ copy.size }}</h3>
                <button
                  v-for="price in itemDetail.prices"
                  :key="price.item_size_id"
                  class="flex items-center justify-between rounded-[8px] border p-3 text-left"
                  :class="String(price.item_size_id) === String(itemDetail.selectedSizeId) ? 'border-emerald-300 bg-emerald-300/10' : 'border-white/10 bg-white/[0.03]'"
                  type="button"
                  @click="itemDetail.selectedSizeId = String(price.item_size_id)"
                >
                  <span class="font-bold">{{ price.size_name || copy.regular }}</span>
                  <strong>{{ price.pretty_price_after_discount !== "0,00" ? price.pretty_price_after_discount : price.pretty_price }}</strong>
                </button>
              </div>

              <section v-for="group in itemDetail.activeAddons" :key="group.subcat_id" class="grid gap-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="m-0 text-base font-black">{{ decodeHtml(group.subcategory_name) }}</h3>
                    <p v-if="group.subcategory_description" class="muted m-0 mt-1 text-xs">
                      {{ decodeHtml(group.subcategory_description) }}
                    </p>
                  </div>
                  <span
                    v-if="group.require_addon == 1"
                    class="rounded-full bg-amber-300 px-2 py-1 text-[10px] font-black text-black"
                  >
                    {{ copy.required }}
                  </span>
                </div>

                <button
                  v-for="subItem in group.sub_items"
                  :key="subItem.sub_item_id"
                  class="flex items-center justify-between gap-3 rounded-[8px] border border-white/10 bg-white/[0.03] p-3 text-left disabled:opacity-45"
                  type="button"
                  :disabled="subItem.disabled"
                  @click="handleAddon(group, subItem)"
                >
                  <span>
                    <span class="block font-bold">{{ decodeHtml(subItem.sub_item_name) }}</span>
                    <span class="muted text-xs">{{ subItem.pretty_price || subItem.price }}</span>
                  </span>
                  <span
                    class="grid h-6 w-6 place-items-center rounded-full border"
                    :class="isSelected(group, subItem) ? 'border-emerald-300 bg-emerald-300 text-black' : 'border-white/20'"
                  >
                    <Check v-if="isSelected(group, subItem)" :size="15" />
                  </span>
                </button>
              </section>

              <label class="grid gap-2">
                <span class="text-sm font-black uppercase text-white/60">{{ copy.comment }}</span>
                <textarea
                  v-model="itemDetail.specialInstructions"
                  class="min-h-24 resize-none rounded-[8px] border border-white/10 bg-white/[0.04] p-3 text-sm outline-none focus:border-emerald-300"
                  :placeholder="copy.commentPlaceholder"
                />
              </label>
            </div>
          </div>

          <div class="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#101416]/95 p-4 backdrop-blur">
            <div v-if="validationMessage" class="mb-3 rounded-[8px] bg-amber-300/10 p-3 text-xs font-bold text-amber-100">
              {{ validationMessage }}
            </div>
            <div v-else-if="cartSwapPrompt" class="mb-3 rounded-[8px] border border-amber-300/25 bg-amber-300/10 p-3">
              <p class="m-0 text-sm font-black text-amber-100">{{ copy.replaceCartTitle }}</p>
              <p class="muted m-0 mt-1 text-xs">
                {{ copy.replaceCartText }}
                <span v-if="cartMerchantName" class="font-bold text-[var(--app-fg)]">{{ cartMerchantName }}</span>
              </p>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <button class="surface-button rounded-full px-3 py-2 text-xs font-black" type="button" :disabled="cart.adding" @click="cartSwapPrompt = false">
                  {{ copy.keepCart }}
                </button>
                <button class="primary-button !min-h-9 px-3 py-2 text-xs" type="button" :disabled="cart.adding" @click="confirmCartSwap">
                  {{ cart.adding ? copy.adding : copy.replaceCart }}
                </button>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="glass flex items-center rounded-[8px] p-1">
                <button class="icon-button !h-10 !w-10" type="button" :aria-label="copy.decrease" @click="itemDetail.quantity = Math.max(1, itemDetail.quantity - 1)">
                  <Minus :size="17" />
                </button>
                <strong class="w-10 text-center">{{ itemDetail.quantity }}</strong>
                <button class="icon-button !h-10 !w-10" type="button" :aria-label="copy.increase" @click="itemDetail.quantity += 1">
                  <Plus :size="17" />
                </button>
              </div>
              <button class="primary-button flex-1" type="button" :disabled="!canSubmit || cart.adding" @click="handleAddClick">
                {{ cart.adding ? copy.adding : `${copy.add} · ${totalLabel}` }}
              </button>
            </div>
          </div>
        </template>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Check, Minus, Plus, X } from "@lucide/vue";
import { useAppStore } from "src/stores/app";
import { useCartStore } from "src/stores/cart";
import { useItemDetailStore } from "src/stores/itemDetail";
import { kmrsAsset } from "src/services/kmrsAssets";

const emit = defineEmits(["added"]);
const app = useAppStore();
const cart = useCartStore();
const itemDetail = useItemDetailStore();
const cartSwapPrompt = ref(false);

const sheetCopy = {
  ru: {
    close: "Закрыть",
    unavailable: "Не удалось открыть блюдо",
    size: "Размер",
    regular: "Обычный",
    required: "Обязательно",
    comment: "Комментарий к блюду",
    commentPlaceholder: "Например: без лука",
    decrease: "Уменьшить",
    increase: "Увеличить",
    adding: "Добавляем...",
    add: "Добавить",
    choose: "Выберите",
    notAvailable: "Это блюдо сейчас недоступно для заказа",
    replaceCartTitle: "Очистить текущую корзину?",
    replaceCartText: "В корзине уже есть блюда из другого ресторана:",
    keepCart: "Оставить",
    replaceCart: "Очистить и добавить",
  },
  tk: {
    close: "Ýap",
    unavailable: "Tagamy açyp bolmady",
    size: "Ölçeg",
    regular: "Adaty",
    required: "Hökmany",
    comment: "Tagam üçin bellik",
    commentPlaceholder: "Meselem: sogansyz",
    decrease: "Azalt",
    increase: "Köpelt",
    adding: "Goşulýar...",
    add: "Goş",
    choose: "Saýlaň",
    notAvailable: "Bu tagam häzir sargyt üçin elýeterli däl",
    replaceCartTitle: "Häzirki sebedi arassalamalymy?",
    replaceCartText: "Sebetde başga restorandan tagamlar bar:",
    keepCart: "Galdyr",
    replaceCart: "Arassala we goş",
  },
  en: {
    close: "Close",
    unavailable: "Could not open item",
    size: "Size",
    regular: "Regular",
    required: "Required",
    comment: "Item note",
    commentPlaceholder: "For example: no onion",
    decrease: "Decrease",
    increase: "Increase",
    adding: "Adding...",
    add: "Add",
    choose: "Choose",
    notAvailable: "This item is currently unavailable",
    replaceCartTitle: "Clear current cart?",
    replaceCartText: "Your cart already has items from another restaurant:",
    keepCart: "Keep cart",
    replaceCart: "Clear and add",
  },
};

const copy = computed(() => sheetCopy[app.language] || sheetCopy.ru);

const decodeHtml = (value) => {
  const element = document.createElement("div");
  element.innerHTML = String(value ?? "");
  return element.textContent || "";
};

const itemName = computed(() => decodeHtml(itemDetail.item?.item_name || ""));
const description = computed(() => decodeHtml(itemDetail.item?.item_description || ""));
const imageUrl = computed(() => kmrsAsset(itemDetail.item?.url_image || ""));
const unitPrice = computed(() => {
  const price = itemDetail.selectedPrice;
  if (!price) return 0;
  return Number(price.discount > 0 ? price.price_after_discount : price.price);
});
const addonsTotal = computed(() =>
  itemDetail.activeAddons.reduce((sum, group) => {
    if (group.multi_option === "one") {
      const selected = group.sub_items.find((subItem) => subItem.sub_item_id === group.sub_items_checked);
      return sum + Number(selected?.price ?? 0);
    }

    return (
      sum +
      group.sub_items
        .filter((subItem) => subItem.checked)
        .reduce((subSum, subItem) => subSum + Number(subItem.price ?? 0) * Number(subItem.qty ?? 1), 0)
    );
  }, 0)
);
const total = computed(() => (unitPrice.value + addonsTotal.value) * itemDetail.quantity);
const totalLabel = computed(() => `${total.value.toFixed(2).replace(".", ",")} TMT`);
const validationMessage = computed(() => {
  const missing = itemDetail.activeAddons.find((group) => {
    if (group.require_addon != 1) return false;
    if (group.multi_option === "one") return !group.sub_items_checked;
    return !group.sub_items.some((subItem) => subItem.checked);
  });

  if (missing) return `${copy.value.choose}: ${decodeHtml(missing.subcategory_name)}`;
  if (itemDetail.item?.not_for_sale) return copy.value.notAvailable;
  return "";
});
const canSubmit = computed(() => !validationMessage.value && itemDetail.selectedSizeId);
const normalizeMerchantKey = (value) => decodeHtml(value || "").trim().toLowerCase().replace(/\s+/g, " ");
const cartMerchant = computed(() => cart.merchant ?? cart.data?.data?.merchant_info ?? {});
const cartMerchantName = computed(() =>
  decodeHtml(cartMerchant.value?.restaurant_name || cartMerchant.value?.merchant_name || "")
);
const cartMerchantSlug = computed(() =>
  String(cartMerchant.value?.restaurant_slug || cartMerchant.value?.merchant_slug || cartMerchant.value?.slug || "")
);
const cartHasAnotherRestaurant = computed(() => {
  if (!cart.cartUuid || !cart.itemsCount) return false;

  const currentName = normalizeMerchantKey(itemDetail.restaurantName);
  const existingName = normalizeMerchantKey(cartMerchantName.value);
  if (currentName && existingName) return currentName !== existingName;

  const existingSlug = normalizeMerchantKey(cartMerchantSlug.value);
  const currentSlug = normalizeMerchantKey(itemDetail.slug);
  return Boolean(existingSlug && currentSlug && existingSlug !== currentSlug);
});

const isSelected = (group, subItem) =>
  group.multi_option === "one" ? subItem.sub_item_id === group.sub_items_checked : subItem.checked;

const handleAddon = (group, subItem) => {
  if (group.multi_option === "one") {
    itemDetail.selectSingle(group, subItem.sub_item_id);
    return;
  }
  itemDetail.toggleAddon(group, subItem);
};

const addToCart = async () => {
  if (!canSubmit.value) return;

  await cart.addItem(
    {
      slug: itemDetail.slug,
      cat_id: itemDetail.catId,
      item_size_id: itemDetail.selectedSizeId,
      item_token: itemDetail.itemUuid,
      item_qty: itemDetail.quantity,
      special_instructions: itemDetail.specialInstructions,
      if_sold_out: itemDetail.soldOutOption,
      transaction_type: "delivery",
      meta: {
        cooking_ref: [{ meta_id: "", checked: "", meta_name: "" }],
        ingredients: [],
      },
      item_addons: itemDetail.activeAddons,
    },
    itemDetail.slug
  );
  itemDetail.close();
  emit("added");
};

const handleAddClick = async () => {
  if (!canSubmit.value) return;
  if (cartHasAnotherRestaurant.value) {
    cartSwapPrompt.value = true;
    return;
  }

  await addToCart();
};

const confirmCartSwap = async () => {
  if (!canSubmit.value) return;

  await cart.clear();
  cartSwapPrompt.value = false;
  await addToCart();
};

watch(
  () => [itemDetail.open, itemDetail.itemUuid, itemDetail.selectedSizeId],
  () => {
    cartSwapPrompt.value = false;
  }
);
</script>
