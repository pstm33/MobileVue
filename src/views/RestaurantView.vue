<template>
  <section class="page fade-up">
    <AppHeader :title="pageTitle" :icon="Heart" :action-label="app.copy.restaurant.save" />

    <div v-if="restaurant.loading" class="grid gap-4">
      <div class="soft-card warm-skeleton h-72" />
      <div class="soft-card warm-skeleton h-20" />
      <div class="soft-card warm-skeleton h-14" />
      <div class="soft-card warm-skeleton h-32" />
      <div class="soft-card warm-skeleton h-32" />
    </div>

    <div v-else-if="restaurant.error" class="soft-card p-5">
      <h1 class="m-0 text-2xl font-black">{{ app.copy.restaurant.unavailable }}</h1>
      <p class="muted mt-2 text-sm">{{ restaurant.error }}</p>
      <button class="primary-button mt-4 w-full" type="button" @click="restaurant.load(slug)">
        {{ app.copy.restaurant.retry }}
      </button>
    </div>

    <template v-else-if="restaurant.restaurant">
      <div class="tagam-card tagam-glow restaurant-hero">
        <img
          v-if="restaurant.heroImage"
          class="aspect-[2/1] w-full object-cover"
          :src="kmrsAsset(restaurant.heroImage)"
          :alt="restaurant.restaurant.restaurant_name"
        />
        <div v-else class="aspect-[2/1] w-full bg-[var(--app-accent-soft)]" />

        <div class="restaurant-hero-overlay absolute inset-0" />
        <div class="absolute inset-x-0 bottom-0 p-5">
          <div class="restaurant-hero-copy flex items-end justify-between gap-4">
            <div class="min-w-0">
              <p class="brand-kicker m-0">
                {{ app.copy.restaurant.popular }}
                <span v-if="estimationLabel"> · {{ estimationLabel }}</span>
              </p>
              <h1 class="m-0 mt-2 text-4xl font-black leading-tight text-white">{{ restaurantName }}</h1>
              <p class="m-0 mt-2 line-clamp-2 text-sm leading-5 text-white/80">
                {{ cuisineText || app.copy.restaurant.deliveryAvailable }}
              </p>
            </div>

            <div class="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-white/20 bg-black/45 text-center backdrop-blur">
              <strong class="text-lg text-emerald-300">{{ ratingLabel }}</strong>
              <span class="text-[10px] font-black uppercase text-white/55">rate</span>
            </div>
          </div>
        </div>
      </div>

      <div class="restaurant-stats tagam-card grid p-3 text-center" :class="promoCount ? 'grid-cols-3' : 'grid-cols-2'">
        <div class="restaurant-stat">
          <strong>{{ distanceLabel }}</strong>
          <span class="muted block text-xs">от вас</span>
        </div>
        <div v-if="promoCount" class="restaurant-stat">
          <strong>{{ promoCount }}</strong>
          <span class="muted block text-xs">{{ app.copy.restaurant.deals }}</span>
        </div>
        <div class="restaurant-stat">
          <strong>{{ menuItemCount }}</strong>
          <span class="muted block text-xs">{{ app.copy.restaurant.items }}</span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <button class="tagam-pill tap-motion px-3 py-2" :class="{ 'is-active': activePanel === 'menu' }" type="button" @click="activePanel = 'menu'">
          <ShoppingBag :size="16" />
          Меню
        </button>
        <button class="tagam-pill tap-motion px-3 py-2" :class="{ 'is-active': activePanel === 'search' }" type="button" @click="activePanel = 'search'">
          <Search :size="16" />
          Поиск
        </button>
        <button class="tagam-pill tap-motion px-3 py-2" :class="{ 'is-active': activePanel === 'info' }" type="button" @click="activePanel = 'info'">
          <Info :size="16" />
          Инфо
        </button>
      </div>

      <div v-if="activePanel === 'info'" class="tagam-card grid gap-4 p-4">
        <div>
          <p class="brand-kicker m-0">Store info</p>
          <h2 class="m-0 mt-1 text-2xl font-black">{{ restaurantName }}</h2>
        </div>
        <div class="grid gap-3 text-sm">
          <p v-if="restaurant.restaurant.merchant_address" class="m-0">
            <MapPin class="mr-2 inline text-emerald-300" :size="17" />
            {{ decodeHtml(restaurant.restaurant.merchant_address) }}
          </p>
          <p v-if="cuisineText" class="muted m-0">{{ cuisineText }}</p>
          <p v-if="estimationLabel" class="muted m-0">{{ app.copy.restaurant.deliveryAvailable }} · {{ estimationLabel }}</p>
          <p v-if="restaurant.restaurant.distance_pretty || distanceLabel" class="muted m-0">{{ app.copy.restaurant.distance }}: {{ distanceLabel }}</p>
        </div>
        <button class="tagam-pill tap-motion justify-self-start px-4 py-2" type="button" @click="loadReviews">
          <Star :size="16" />
          Отзывы
        </button>

        <div v-if="reviewsOpen" class="grid gap-3 border-t border-white/10 pt-4">
          <div class="section-title">
            <h2>Отзывы</h2>
            <span class="muted text-sm">{{ reviews.length }}</span>
          </div>
          <div v-if="reviewsLoading" class="warm-skeleton h-20 rounded-[8px]" />
          <article v-for="review in reviews" :key="review.id || review.review_id || review.uuid" class="soft-card p-3">
            <strong>{{ review.customer_name || review.full_name || review.client_name || "KMRS" }}</strong>
            <p class="muted m-0 mt-1 text-sm">{{ review.review || review.comment || review.message || review.content }}</p>
          </article>
          <p v-if="!reviewsLoading && !reviews.length" class="muted m-0 text-sm">KMRS не вернул список отзывов для этого ресторана.</p>
        </div>
      </div>

      <label v-if="activePanel === 'search'" class="tagam-card flex min-h-14 items-center gap-3 px-4">
        <Search :size="20" class="text-emerald-300" />
        <input
          v-model="menuQuery"
          class="min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:text-[var(--app-muted)]"
          placeholder="Поиск по меню"
        />
        <button v-if="menuQuery" class="icon-button !h-9 !w-9" type="button" aria-label="Очистить" @click="menuQuery = ''">
          <X :size="17" />
        </button>
      </label>

      <nav v-if="displayCategories.length && activePanel !== 'info'" class="sticky-rail sticky top-0 z-10 py-3">
        <div class="hide-scrollbar flex gap-2 overflow-x-auto px-4">
          <button
            v-for="category in displayCategories"
            :key="category.category_uiid || category.cat_id"
            class="tagam-pill tap-motion shrink-0 px-4 py-2"
            :class="{ 'is-active': String(activeCategoryId) === String(category.cat_id) }"
            type="button"
            :data-category-button-id="category.cat_id"
            @click.stop="scrollToCategory(category.cat_id, $event)"
          >
            {{ decodeHtml(category.category_name) }}
          </button>
        </div>
      </nav>

      <div v-if="activePanel !== 'info' && !displayCategories.length" class="soft-card p-5">
        <h2 class="m-0 text-xl font-black">{{ app.copy.restaurant.menuEmpty }}</h2>
        <p class="muted mt-2 text-sm">{{ app.copy.restaurant.menuEmptyText }}</p>
      </div>

      <section
        v-for="category in activePanel !== 'info' ? displayCategories : []"
        :id="`category-${category.cat_id}`"
        :key="category.category_uiid || category.cat_id"
        :data-category-id="category.cat_id"
        class="category-section grid gap-3 scroll-mt-24"
      >
        <div class="section-title">
          <h2>{{ decodeHtml(category.category_name) }}</h2>
          <span class="muted text-sm">{{ (category.item_list || []).length }} {{ app.copy.restaurant.itemCount }}</span>
        </div>

        <article
          v-for="(item, itemIndex) in category.item_list"
          :key="item.item_uuid || item.item_id"
          class="tagam-card group stagger-item flex gap-4 p-3"
          :style="{ '--stagger-delay': `${Math.min(itemIndex, 6) * 42}ms` }"
        >
          <div class="image-treatment h-28 w-28 shrink-0 rounded-[8px]">
            <img
              v-if="item.url_image"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              :src="kmrsAsset(item.url_image)"
              :alt="item.item_name"
            />
            <div v-else class="grid h-full w-full place-items-center text-xs font-black text-[var(--app-muted)]">
              TAGAM
            </div>
            <span v-if="item.has_discount" class="absolute left-2 top-2 rounded-full bg-[var(--app-accent)] px-2 py-1 text-[10px] font-black text-black">
              {{ app.copy.restaurant.sale }}
            </span>
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="m-0 text-base font-extrabold">{{ decodeHtml(item.item_name) }}</h3>
            <p class="muted mt-1 line-clamp-2 text-sm">
              {{ decodeHtml(item.item_description || app.copy.restaurant.noDescription) }}
            </p>

            <div class="mt-3 flex items-center justify-between gap-3">
              <strong class="text-lg">{{ priceLabel(item) }}</strong>
              <button
                class="icon-button tap-motion !h-9 !w-9"
                type="button"
                :aria-label="app.copy.restaurant.openItem"
                @click="openItem(category, item)"
              >
                <Plus :size="18" />
              </button>
            </div>
          </div>
        </article>
      </section>

      <div v-if="cart.cartUuid && cart.itemsCount" class="sticky bottom-4 z-20">
        <RouterLink class="primary-button tap-motion w-full justify-between shadow-2xl" to="/cart">
          <span class="flex items-center gap-2">
            <ShoppingBag :size="18" />
            {{ app.copy.restaurant.cart }} · {{ cart.itemsCount }}
          </span>
          <strong>{{ cart.subtotalLabel }}</strong>
        </RouterLink>
      </div>
    </template>

    <ItemDetailSheet @added="cart.refresh(slug)" />
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Heart, Info, MapPin, Plus, Search, ShoppingBag, Star, X } from "@lucide/vue";
import APIinterface from "src/api/APIinterface";
import AppHeader from "src/components/ui/AppHeader.vue";
import ItemDetailSheet from "src/components/menu/ItemDetailSheet.vue";
import { useAppStore } from "src/stores/app";
import { useCartStore } from "src/stores/cart";
import { useItemDetailStore } from "src/stores/itemDetail";
import { useRestaurantStore } from "src/stores/restaurant";
import { kmrsAsset } from "src/services/kmrsAssets";

const route = useRoute();
const app = useAppStore();
const restaurant = useRestaurantStore();
const itemDetail = useItemDetailStore();
const cart = useCartStore();
const activeCategoryId = ref("");
const activePanel = ref("menu");
const menuQuery = ref("");
const reviewsOpen = ref(false);
const reviewsLoading = ref(false);
const reviews = ref([]);
let categoryObserver;

const slug = computed(() => String(route.params.slug || ""));
const deepLinkItem = computed(() => ({
  catId: route.query.cat ? String(route.query.cat) : "",
  itemUuid: route.query.item ? String(route.query.item) : "",
}));
const pageTitle = computed(() => decodeHtml(restaurant.restaurant?.restaurant_name || app.copy.restaurant.menu));
const visibleCategories = computed(() =>
  restaurant.menu.filter((category) => (category.item_list ?? []).length > 0)
);
const normalizedMenuQuery = computed(() => decodeHtml(menuQuery.value).toLowerCase().trim());
const displayCategories = computed(() => {
  if (!normalizedMenuQuery.value) return visibleCategories.value;
  return visibleCategories.value
    .map((category) => ({
      ...category,
      item_list: (category.item_list || []).filter((item) =>
        decodeHtml(`${item.item_name} ${item.item_description} ${category.category_name}`)
          .toLowerCase()
          .includes(normalizedMenuQuery.value)
      ),
    }))
    .filter((category) => category.item_list.length > 0);
});
const menuItemCount = computed(() =>
  visibleCategories.value.reduce((count, category) => count + (category.item_list ?? []).length, 0)
);
const promoCount = computed(() => restaurant.details?.promo_list?.length || 0);

const decodeHtml = (value) => {
  const element = document.createElement("div");
  element.innerHTML = String(value ?? "");
  return element.textContent || "";
};

const restaurantName = computed(() => decodeHtml(restaurant.restaurant?.restaurant_name || ""));
const cuisineText = computed(() =>
  decodeHtml(restaurant.restaurant?.cuisine2 || restaurant.restaurant?.merchant_address || "")
);
const ratingLabel = computed(() => restaurant.restaurant?.ratings || app.copy.restaurant.newRating);
const estimationLabel = computed(() => {
  const estimation = restaurant.details?.estimation;
  if (!estimation || Array.isArray(estimation)) return "";
  if (typeof estimation === "object") return estimation.label || estimation.value || "";
  return String(estimation);
});
const distanceLabel = computed(() => {
  const distance = restaurant.details?.distance;

  if (!distance) {
    return "";
  }

  if (typeof distance === "object") {
    return normalizeDistanceLabel(distance.label || distance.value);
  }

  return normalizeDistanceLabel(distance);
});

const normalizeDistanceLabel = (value) => {
  const decoded = decodeHtml(value ?? "").trim();
  if (!decoded) return "";

  const numeric = decoded.match(/-?\d+(?:[.,]\d+)?/)?.[0];
  if (!numeric) return decoded.replace(/\s+/g, " ");

  const number = Number(numeric.replace(",", "."));
  if (!Number.isFinite(number)) return decoded.replace(/\s+/g, " ");
  if (number < 0.01) return `0 ${app.copy.restaurant.km}`;
  return `${number.toFixed(number >= 10 ? 0 : 1)} ${app.copy.restaurant.km}`;
};

const priceLabel = (item) => {
  const value = item.lowest_price_label || item.lowest_price || item.price || "";
  if (!value) return "";
  return item.price_count > 1 ? `${app.copy.restaurant.from} ${value}` : value;
};

const stopCategoryObserver = () => {
  categoryObserver?.disconnect();
  categoryObserver = null;
};

const startCategoryObserver = async () => {
  await nextTick();
  stopCategoryObserver();

  const sections = document.querySelectorAll(".category-section");
  if (!sections.length) return;

  activeCategoryId.value = sections[0].dataset.categoryId || "";
  categoryObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

      if (visible[0]?.target?.dataset?.categoryId) {
        activeCategoryId.value = visible[0].target.dataset.categoryId;
      }
    },
    {
      rootMargin: "-92px 0px -62% 0px",
      threshold: 0.01,
    }
  );

  sections.forEach((section) => categoryObserver.observe(section));
};

const centerCategoryButton = (catId) => {
  document.querySelector(`[data-category-button-id="${catId}"]`)?.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest",
  });
};

const scrollToCategory = (catId, event) => {
  activeCategoryId.value = String(catId);
  event?.currentTarget?.scrollIntoView?.({
    behavior: "smooth",
    inline: "center",
    block: "nearest",
  });
  document.getElementById(`category-${catId}`)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

const openDeepLinkedItem = async () => {
  const { catId, itemUuid } = deepLinkItem.value;
  if (!catId || !itemUuid || restaurant.loading || !visibleCategories.value.length) return;

  await nextTick();
  const category = visibleCategories.value.find((entry) => String(entry.cat_id) === catId);
  const item = category?.item_list?.find((entry) => String(entry.item_uuid) === itemUuid);
  if (!category || !item) return;

  scrollToCategory(category.cat_id);
  itemDetail.load({
    slug: slug.value,
    cat_id: category.cat_id,
    item_uuid: item.item_uuid,
  });
};

onMounted(() => {
  if (route.query.panel === "search") activePanel.value = "search";
  if (route.query.panel === "info") activePanel.value = "info";
  restaurant.load(slug.value);
  cart.refresh(slug.value).catch(() => {});
  if (route.query.reviews) loadReviews();
});

onBeforeUnmount(() => {
  stopCategoryObserver();
});

watch(slug, (nextSlug, previousSlug) => {
  if (nextSlug && nextSlug !== previousSlug) {
    restaurant.load(nextSlug);
    cart.refresh(nextSlug).catch(() => {});
  }
});

watch(visibleCategories, () => {
  startCategoryObserver();
  openDeepLinkedItem();
});

watch(deepLinkItem, () => {
  openDeepLinkedItem();
});

watch(
  () => route.query.panel,
  (panel) => {
    if (panel === "search" || panel === "info" || panel === "menu") {
      activePanel.value = panel;
    }
  }
);

watch(displayCategories, () => {
  startCategoryObserver();
});

watch(activeCategoryId, (catId) => {
  if (catId) {
    centerCategoryButton(catId);
  }
});

const openItem = (category, item) => {
  itemDetail.load({
    slug: slug.value,
    cat_id: category.cat_id,
    item_uuid: item.item_uuid,
  });
};

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value).filter((item) => item && typeof item === "object");
  return [];
};

const loadReviews = async () => {
  reviewsOpen.value = !reviewsOpen.value;
  if (!reviewsOpen.value || reviews.value.length || reviewsLoading.value) return;

  reviewsLoading.value = true;
  try {
    const response = await APIinterface.getReview(slug.value, 1);
    reviews.value = asArray(response?.details?.data ?? response?.details ?? response?.data);
  } catch {
    reviews.value = [];
  } finally {
    reviewsLoading.value = false;
  }
};
</script>

<style scoped>
.restaurant-hero {
  background: #120b06;
}

.restaurant-hero-overlay {
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0) 24%, rgba(8, 7, 6, 0.48) 54%, rgba(5, 4, 3, 0.9) 100%),
    radial-gradient(circle at 86% 76%, rgba(242, 138, 0, 0.2), transparent 9rem);
}

.restaurant-hero-copy {
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 8px;
  background: rgba(5, 4, 3, 0.72);
  padding: 16px;
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(18px);
}

.restaurant-stats {
  align-items: stretch;
}

.restaurant-stat {
  display: grid;
  min-width: 0;
  place-items: center;
  gap: 3px;
  padding: 6px 4px;
}

.restaurant-stat strong {
  max-width: 100%;
  overflow: hidden;
  color: var(--app-fg);
  font-size: 18px;
  line-height: 1.08;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:root[data-theme="light"] .restaurant-hero-copy {
  border-color: rgba(19, 21, 16, 0.12);
  background: rgba(18, 15, 11, 0.78);
}

:root.native .restaurant-stat strong {
  font-size: 15px;
}

@media (max-width: 380px) {
  .restaurant-hero-copy {
    padding: 14px;
  }

  .restaurant-stat strong {
    font-size: 15px;
  }
}
</style>
