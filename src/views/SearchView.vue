<template>
  <section class="page fade-up">
    <AppHeader :title="app.copy.search.title" :icon="Search" />

    <label class="tagam-card flex min-h-14 items-center gap-3 px-4">
      <Search :size="20" class="text-emerald-300" />
      <input
        v-model="query"
        class="min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:text-[var(--app-muted)]"
        :placeholder="app.copy.search.placeholder"
        autofocus
      />
      <button v-if="query" class="icon-button !h-9 !w-9" type="button" :aria-label="app.copy.search.clear" @click="query = ''">
        <X :size="17" />
      </button>
    </label>

    <section class="soft-card grid gap-3 p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="brand-kicker m-0">FILTERS</p>
          <h2 class="m-0 mt-1 text-lg font-black">Подобрать быстрее</h2>
        </div>
        <SlidersHorizontal class="text-[var(--app-accent)]" :size="21" />
      </div>

      <div class="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          class="tagam-pill tap-motion shrink-0 px-3 py-2 text-sm"
          :class="{ 'is-active': sortMode === option.value }"
          type="button"
          @click="sortMode = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <div v-if="availableCuisines.length" class="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="cuisine in availableCuisines"
          :key="cuisine"
          class="tagam-pill tap-motion shrink-0 px-3 py-2 text-sm"
          :class="{ 'is-active': selectedCuisines.includes(cuisine) }"
          type="button"
          @click="toggleCuisine(cuisine)"
        >
          {{ cuisine }}
        </button>
      </div>

      <button v-if="hasFilters" class="surface-button rounded-full px-4 py-3 text-sm font-black" type="button" @click="clearFilters">
        Очистить фильтры
      </button>
    </section>

    <div v-if="search.loading" class="grid gap-3">
      <div class="soft-card warm-skeleton h-20" />
      <div class="soft-card warm-skeleton h-32" />
      <div class="soft-card warm-skeleton h-32" />
    </div>

    <div v-else-if="search.error" class="soft-card p-5">
      <h2 class="m-0 text-xl font-black">{{ app.copy.search.failed }}</h2>
      <p class="muted mt-2 text-sm">{{ search.error }}</p>
      <button class="primary-button mt-4 w-full" type="button" @click="search.ensureIndexed()">
        {{ app.copy.home.retry }}
      </button>
    </div>

    <template v-else>
      <div class="grid grid-cols-3 gap-3">
        <div class="soft-card p-3">
          <strong class="block text-xl">{{ filteredResults.restaurants.length }}</strong>
          <span class="muted text-xs">{{ app.copy.search.restaurants }}</span>
        </div>
        <div class="soft-card p-3">
          <strong class="block text-xl">{{ filteredResults.items.length }}</strong>
          <span class="muted text-xs">{{ app.copy.search.dishes }}</span>
        </div>
        <div class="soft-card p-3">
          <strong class="block text-xl">{{ search.itemCount }}</strong>
          <span class="muted text-xs">{{ app.copy.search.indexed }}</span>
        </div>
      </div>

      <div v-if="!query" class="soft-card p-4">
        <p class="m-0 text-sm font-black uppercase tracking-[0.18em] text-emerald-300">
          {{ app.copy.search.quick }}
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="term in quickTerms"
            :key="term"
            class="tagam-pill tap-motion px-3 py-2"
            type="button"
            @click="query = term"
          >
            {{ term }}
          </button>
        </div>
      </div>

      <section v-if="filteredResults.restaurants.length" class="grid gap-3">
        <div class="section-title">
          <h2>{{ app.copy.search.restaurants }}</h2>
          <span class="muted text-sm">{{ filteredResults.restaurants.length }}</span>
        </div>

        <RouterLink
          v-for="(restaurant, index) in filteredResults.restaurants"
          :key="restaurant.merchant_uuid || restaurant.merchant_id"
          class="tagam-card stagger-item tap-motion flex gap-3 p-3"
          :style="{ '--stagger-delay': `${Math.min(index, 6) * 45}ms` }"
          :to="`/restaurant/${restaurant.restaurant_slug}`"
        >
          <img
            class="h-20 w-20 rounded-[8px] object-cover"
            :src="kmrsAsset(restaurant.url_logo || restaurant.url_banner)"
            :alt="decodeHtml(restaurant.restaurant_name)"
          />
          <div class="min-w-0 flex-1">
            <h3 class="m-0 text-base font-black" v-html="restaurant.restaurant_name" />
            <p class="muted mt-1 line-clamp-1 text-sm">{{ (restaurant.cuisine || []).join(" · ") }}</p>
            <p class="muted mt-2 text-xs">
              {{ restaurant.estimation }} min · {{ restaurant.distance_pretty }}
            </p>
          </div>
          <span class="tagam-pill is-active h-fit min-h-0 px-2 py-1 text-xs">
            {{ restaurant.reviews?.ratings || app.copy.home.newRating }}
          </span>
        </RouterLink>
      </section>

      <section v-if="filteredResults.items.length" class="grid gap-3">
        <div class="section-title">
          <h2>{{ app.copy.search.dishes }}</h2>
          <span class="muted text-sm">{{ filteredResults.items.length }}</span>
        </div>

        <article
          v-for="(item, index) in filteredResults.items"
          :key="`${item.slug}-${item.item_uuid || item.item_id}`"
          class="tagam-card stagger-item flex gap-3 p-3"
          :style="{ '--stagger-delay': `${Math.min(index, 6) * 45}ms` }"
        >
          <img
            v-if="item.url_image"
            class="h-20 w-20 rounded-[8px] object-cover"
            :src="kmrsAsset(item.url_image)"
            :alt="decodeHtml(item.item_name)"
          />
          <div v-else class="grid h-20 w-20 place-items-center rounded-[8px] bg-[var(--app-accent-soft)] text-xs font-black text-[var(--app-muted)]">
            TAGAM
          </div>
          <div class="min-w-0 flex-1">
            <p class="m-0 text-xs font-black uppercase tracking-[0.14em] text-emerald-300">
              {{ restaurantName(item.slug) }}
            </p>
            <h3 class="m-0 mt-1 text-base font-black">{{ decodeHtml(item.item_name) }}</h3>
            <p class="muted mt-1 line-clamp-1 text-xs">{{ decodeHtml(item.category_name) }}</p>
            <strong class="mt-2 block">{{ priceLabel(item) }}</strong>
          </div>
          <RouterLink
            class="icon-button tap-motion !h-10 !w-10 self-center"
            :to="{ path: `/restaurant/${item.slug}`, query: { cat: item.cat_id, item: item.item_uuid } }"
            :aria-label="app.copy.search.open"
          >
            <ArrowRight :size="18" />
          </RouterLink>
        </article>
      </section>

      <div v-if="query && !filteredResults.restaurants.length && !filteredResults.items.length" class="soft-card p-5 text-center">
        <h2 class="m-0 text-xl font-black">{{ app.copy.search.emptyTitle }}</h2>
        <p class="muted mt-2 text-sm">{{ app.copy.search.emptyText }}</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowRight, Search, SlidersHorizontal, X } from "@lucide/vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import { useAppStore } from "src/stores/app";
import { useMerchantFeedStore } from "src/stores/merchantFeed";
import { useSearchStore } from "src/stores/search";
import { kmrsAsset } from "src/services/kmrsAssets";

const app = useAppStore();
const feed = useMerchantFeedStore();
const search = useSearchStore();
const route = useRoute();
const router = useRouter();
const query = ref(String(route.query.q || ""));
const sortMode = ref(String(route.query.sort || "recommended"));
const selectedCuisines = ref(String(route.query.cuisine || "").split("|").filter(Boolean));

const sortOptions = [
  { value: "recommended", label: "Рекомендуемые" },
  { value: "rating", label: "Рейтинг" },
  { value: "fast", label: "Быстрее" },
  { value: "name", label: "A-Z" },
];

const decodeHtml = (value) => {
  const element = document.createElement("div");
  element.innerHTML = String(value ?? "");
  return element.textContent || "";
};

const quickTerms = computed(() => {
  const cuisines = feed.rows.flatMap((restaurant) => restaurant.cuisine || []);
  return Array.from(new Set(cuisines)).slice(0, 8);
});

const availableCuisines = computed(() => quickTerms.value.slice(0, 12));
const results = computed(() => search.search(query.value));
const hasFilters = computed(() => sortMode.value !== "recommended" || selectedCuisines.value.length > 0);
const restaurantMatchesCuisine = (restaurant) =>
  !selectedCuisines.value.length || (restaurant.cuisine || []).some((label) => selectedCuisines.value.includes(label));
const sortRestaurants = (restaurants) => {
  const copy = [...restaurants];
  if (sortMode.value === "rating") {
    return copy.sort((left, right) => Number(right.reviews?.ratings || 0) - Number(left.reviews?.ratings || 0));
  }
  if (sortMode.value === "fast") {
    return copy.sort((left, right) => Number.parseInt(left.estimation || "999", 10) - Number.parseInt(right.estimation || "999", 10));
  }
  if (sortMode.value === "name") {
    return copy.sort((left, right) => decodeHtml(left.restaurant_name).localeCompare(decodeHtml(right.restaurant_name), app.language));
  }
  return copy;
};
const filteredResults = computed(() => {
  const restaurants = sortRestaurants(results.value.restaurants.filter(restaurantMatchesCuisine));
  const allowedSlugs = new Set(restaurants.map((restaurant) => restaurant.restaurant_slug));
  const items = selectedCuisines.value.length
    ? results.value.items.filter((item) => allowedSlugs.has(item.slug))
    : results.value.items;

  return { restaurants, items };
});

const restaurantName = (slug) => decodeHtml(feed.rows.find((restaurant) => restaurant.restaurant_slug === slug)?.restaurant_name || "");
const toggleCuisine = (label) => {
  selectedCuisines.value = selectedCuisines.value.includes(label)
    ? selectedCuisines.value.filter((item) => item !== label)
    : [...selectedCuisines.value, label];
};
const clearFilters = () => {
  sortMode.value = "recommended";
  selectedCuisines.value = [];
};

const priceLabel = (item) => {
  const value = item.lowest_price_label || item.lowest_price || item.price || "";
  if (!value) return "";
  return item.price_count > 1 ? `${app.copy.restaurant.from} ${value}` : value;
};

onMounted(() => {
  search.ensureIndexed();
});

watch(
  () => route.query.q,
  (value) => {
    const next = String(value || "");
    if (next !== query.value) {
      query.value = next;
    }
  }
);

watch(query, (value) => {
  const next = value || undefined;
  if ((route.query.q || undefined) !== next) {
    router.replace({ query: { ...route.query, q: next } });
  }
});

watch([sortMode, selectedCuisines], () => {
  const cuisine = selectedCuisines.value.length ? selectedCuisines.value.join("|") : undefined;
  const sort = sortMode.value === "recommended" ? undefined : sortMode.value;
  router.replace({ query: { ...route.query, cuisine, sort } });
});
</script>
