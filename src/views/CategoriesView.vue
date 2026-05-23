<template>
  <section class="page fade-up">
    <AppHeader title="Категории" :icon="LayoutGrid" action-label="Обновить" @action="load" />

    <div class="tagam-card p-5">
      <p class="brand-kicker m-0">REAL CUISINES</p>
      <h1 class="m-0 mt-1 text-3xl font-black">Выберите вкус</h1>
      <p class="muted m-0 mt-2 text-sm">Категории собраны из ресторанов, которые сейчас отдает KMRS для вашей зоны доставки.</p>
    </div>

    <div v-if="feed.loading" class="grid grid-cols-2 gap-3">
      <div v-for="index in 8" :key="index" class="warm-skeleton aspect-[5/4] rounded-[8px]" />
    </div>

    <p v-else-if="feed.error" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
      {{ feed.error }}
    </p>

    <div v-else class="grid grid-cols-2 gap-3">
      <RouterLink
        v-for="category in categories"
        :key="category.name"
        class="group relative isolate aspect-[5/4] overflow-hidden rounded-[8px] border border-[var(--app-border)] bg-[var(--app-card)] p-4 tap-motion"
        :to="{ path: '/search', query: { cuisine: category.name } }"
      >
        <img
          v-if="category.image"
          class="absolute inset-0 -z-10 h-full w-full object-cover opacity-60 transition duration-300 group-hover:scale-105"
          :src="category.image"
          alt=""
        />
        <div class="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <span class="grid h-11 w-11 place-items-center rounded-full bg-[var(--app-accent)] text-black">
          <Utensils :size="22" />
        </span>
        <div class="absolute inset-x-4 bottom-4">
          <h2 class="m-0 text-xl font-black text-white">{{ category.name }}</h2>
          <p class="m-0 mt-1 text-sm font-bold text-white/75">{{ restaurantCountLabel(category.count) }}</p>
        </div>
      </RouterLink>
    </div>

    <div v-if="!feed.loading && !categories.length" class="soft-card p-5 text-center">
      <h2 class="m-0 text-xl font-black">Категории не найдены</h2>
      <p class="muted m-0 mt-2 text-sm">Измените адрес доставки или обновите список ресторанов.</p>
    </div>
  </section>
</template>

<script setup>
import { LayoutGrid, Utensils } from "@lucide/vue";
import { computed, onMounted } from "vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import { useMerchantFeedStore } from "src/stores/merchantFeed";
import { kmrsAsset } from "src/services/kmrsAssets";

const feed = useMerchantFeedStore();

const cuisineNames = (restaurant) => {
  const cuisine = restaurant?.cuisine || restaurant?.cuisines || restaurant?.cuisine_name;
  if (Array.isArray(cuisine)) {
    return cuisine
      .map((item) => item.cuisine_name || item.name || item.title || item)
      .filter(Boolean);
  }
  if (typeof cuisine === "string") {
    return cuisine.split(/[,•]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const restaurantImage = (restaurant) =>
  kmrsAsset(restaurant?.url_logo || restaurant?.url_image || restaurant?.logo || restaurant?.image || restaurant?.background_url);
const restaurantCountLabel = (count) => {
  const value = Number(count) || 0;
  const mod10 = value % 10;
  const mod100 = value % 100;
  const word = mod10 === 1 && mod100 !== 11 ? "ресторан" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "ресторана" : "ресторанов";
  return `${value} ${word}`;
};

const categories = computed(() => {
  const map = new Map();
  feed.rows.forEach((restaurant) => {
    cuisineNames(restaurant).forEach((name) => {
      const key = String(name).trim();
      if (!key) return;
      const current = map.get(key) || { name: key, count: 0, image: "" };
      current.count += 1;
      current.image ||= restaurantImage(restaurant);
      map.set(key, current);
    });
  });
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
});

const load = () => feed.load({ page: 1, list_type: "all" });

onMounted(() => {
  if (!feed.hasRows) load();
});
</script>
