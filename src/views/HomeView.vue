<template>
  <section class="page fade-up">
    <AppHeader :title="`${app.copy.home.delivery}: ${session.locationLabel}`" :icon="ShoppingBag" />

    <div class="home-hero tagam-card tagam-glow p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="brand-kicker m-0">{{ app.copy.home.pick }}</p>
          <h2 class="headline m-0 mt-2">{{ app.copy.home.hero }}</h2>
          <p class="muted mt-3 max-w-[20rem] text-sm">
            {{ feed.totalLabel || app.copy.home.loading }}
          </p>
        </div>
        <div class="home-hero-icon grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[var(--app-accent-soft)] ring-1 ring-[var(--app-border)]">
          <img class="h-16 w-16 object-contain" src="/iconsplash.png" alt="" />
        </div>
      </div>
      <RouterLink class="primary-button tap-motion mt-5 w-full" to="/search">
        <Sparkles :size="18" />
        {{ app.copy.home.offers }}
      </RouterLink>
    </div>

    <section v-if="homeInsights.length" class="home-insights grid grid-cols-3 gap-2">
      <div v-for="item in homeInsights" :key="item.label" class="soft-card p-3">
        <component :is="item.icon" class="text-[var(--app-accent)]" :size="18" />
        <strong class="mt-2 block text-lg leading-none">{{ item.value }}</strong>
        <span class="muted mt-1 block text-xs">{{ item.label }}</span>
      </div>
    </section>

    <div v-if="cuisines.length" class="sticky-rail sticky top-0 z-10 py-3">
      <div class="hide-scrollbar flex gap-2 overflow-x-auto px-4">
        <button
          class="tagam-pill tap-motion shrink-0 px-4 py-2"
          :class="{ 'is-active': !selectedCuisines.length }"
          type="button"
          @click.stop="clearCuisines"
        >
          {{ app.copy.home.all || "Все" }}
          <span class="ml-2 text-xs opacity-60">{{ feed.rows.length }}</span>
        </button>
        <button
          v-for="item in cuisines"
          :key="item.label"
          class="tagam-pill tap-motion shrink-0 px-4 py-2"
          :class="{ 'is-active': isCuisineSelected(item.label) }"
          type="button"
          @click.stop="toggleCuisine(item.label, $event)"
        >
          {{ item.label }}
          <span class="ml-2 text-xs opacity-60">{{ item.count }}</span>
        </button>
      </div>
    </div>

    <div class="section-title">
      <h2>{{ app.copy.home.popular }}</h2>
      <RouterLink class="tap-motion text-sm font-bold text-emerald-300" to="/search">{{ app.copy.home.viewAll }}</RouterLink>
    </div>

    <div v-if="feed.loading" class="grid gap-3">
      <div v-for="index in 3" :key="index" class="soft-card warm-skeleton aspect-[2/1]" />
    </div>

    <div v-else-if="feed.error" class="soft-card p-5">
      <h3 class="m-0 text-lg font-extrabold">{{ app.copy.home.couldNotLoad }}</h3>
      <p class="muted mt-2 text-sm">{{ feed.error }}</p>
      <button class="primary-button mt-4 w-full" type="button" @click="feed.load()">
        {{ app.copy.home.retry }}
      </button>
    </div>

    <div v-else-if="!feed.hasRows" class="soft-card p-5">
      <h3 class="m-0 text-lg font-extrabold">{{ app.copy.home.emptyTitle }}</h3>
      <p class="muted mt-2 text-sm">{{ app.copy.home.emptyText }}</p>
    </div>

    <article
      v-for="(restaurant, index) in filteredRestaurants"
      v-else
      :key="restaurant.merchant_uuid || restaurant.merchant_id"
      class="tagam-card stagger-item tap-motion"
      :style="{ '--stagger-delay': `${Math.min(index, 8) * 55}ms` }"
    >
      <RouterLink :to="`/restaurant/${restaurant.restaurant_slug}`" class="block">
        <div class="image-treatment aspect-[2/1]">
          <img
            class="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
            :src="kmrsAsset(restaurant.url_banner || restaurant.url_logo)"
            :alt="decodeHtml(restaurant.restaurant_name)"
          />
          <img
            v-if="restaurant.url_logo"
            class="absolute bottom-3 left-3 h-14 w-14 rounded-[8px] border border-white/20 bg-black/45 object-cover shadow-xl"
            :src="kmrsAsset(restaurant.url_logo)"
            :alt="decodeHtml(restaurant.restaurant_name)"
          />
        </div>

        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="m-0 text-lg font-extrabold leading-tight" v-html="restaurant.restaurant_name" />
              <p class="muted m-0 mt-1 text-sm">
                {{ restaurant.estimation }} min · {{ restaurant.distance_pretty }} ·
                {{ restaurant.free_delivery ? app.copy.home.freeDelivery : app.copy.home.deliveryAvailable }}
              </p>
              <p v-if="restaurant.cuisine?.length" class="muted mt-2 line-clamp-1 text-xs">
                {{ restaurant.cuisine.join(" · ") }}
              </p>
            </div>
            <span class="tagam-pill is-active h-fit min-h-0 px-3 py-1 text-xs">
              {{ restaurant.reviews?.ratings || app.copy.home.newRating }}
            </span>
          </div>
        </div>
      </RouterLink>
    </article>

    <div v-if="selectedCuisines.length" class="filter-clear-fab">
      <button class="primary-button tap-motion px-5 shadow-2xl" type="button" @click.stop="clearCuisines">
        <X :size="18" />
        {{ app.copy.home.clear || "Очистить" }}
        <span class="rounded-full bg-black/10 px-2 py-0.5 text-xs">{{ selectedCuisines.length }}</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { Flame, MapPin, ShoppingBag, Sparkles, X } from "@lucide/vue";
import { useAppStore } from "src/stores/app";
import { useMerchantFeedStore } from "src/stores/merchantFeed";
import { useSessionStore } from "src/stores/session";
import AppHeader from "src/components/ui/AppHeader.vue";
import { kmrsAsset } from "src/services/kmrsAssets";

const app = useAppStore();
const feed = useMerchantFeedStore();
const session = useSessionStore();
const selectedCuisines = ref([]);

const decodeHtml = (value) => {
  const element = document.createElement("div");
  element.innerHTML = String(value ?? "");
  return element.textContent || "";
};

const cuisines = computed(() => {
  const counts = new Map();

  feed.rows.forEach((restaurant) => {
    (restaurant.cuisine || []).forEach((label) => {
      counts.set(label, (counts.get(label) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], app.language))
    .map(([label, count]) => ({ label, count }));
});

const filteredRestaurants = computed(() => {
  if (!selectedCuisines.value.length) return feed.rows;
  return feed.rows.filter((restaurant) =>
    (restaurant.cuisine || []).some((label) => selectedCuisines.value.includes(label))
  );
});

const isCuisineSelected = (label) => selectedCuisines.value.includes(label);
const freeDeliveryCount = computed(() => feed.rows.filter((restaurant) => restaurant.free_delivery).length);
const fastRestaurantCount = computed(() =>
  feed.rows.filter((restaurant) => {
    const minutes = Number.parseInt(String(restaurant.estimation || ""), 10);
    return Number.isFinite(minutes) && minutes > 0 && minutes <= 35;
  }).length
);
const homeInsights = computed(() => {
  if (!feed.rows.length) return [];

  return [
    { label: "мест рядом", value: feed.rows.length, icon: MapPin },
    cuisines.value.length ? { label: "категорий", value: cuisines.value.length, icon: Sparkles } : null,
    freeDeliveryCount.value
      ? { label: "без доставки", value: freeDeliveryCount.value, icon: ShoppingBag }
      : fastRestaurantCount.value
        ? { label: "быстро", value: fastRestaurantCount.value, icon: Flame }
        : null,
  ].filter(Boolean);
});

const toggleCuisine = (label, event) => {
  selectedCuisines.value = isCuisineSelected(label)
    ? selectedCuisines.value.filter((item) => item !== label)
    : [...selectedCuisines.value, label];
  event?.currentTarget?.scrollIntoView?.({
    behavior: "smooth",
    inline: "center",
    block: "nearest",
  });
};

const clearCuisines = () => {
  selectedCuisines.value = [];
};

onMounted(() => {
  if (!feed.loadedAt && !feed.loading) {
    feed.load();
  }
});
</script>

<style scoped>
.home-insights :deep(.soft-card) {
  min-width: 0;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--app-card) 92%, transparent), color-mix(in srgb, var(--app-accent) 8%, var(--app-card))),
    var(--app-card);
}

.home-insights strong,
.home-insights span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
