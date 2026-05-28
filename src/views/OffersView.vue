<template>
  <section class="page offers-page fade-up">
    <AppHeader :title="copy.title" :icon="BadgePercent" :action-label="copy.refresh" @action="load(true)" />

    <div class="tagam-card tagam-glow offers-hero p-5">
      <p class="brand-kicker m-0">TAGAM OFFERS</p>
      <h1 class="m-0 mt-2 text-3xl font-black">{{ copy.heading }}</h1>
      <p class="muted m-0 mt-2 text-sm">
        {{ totalLabel || copy.subtitle }}
      </p>
    </div>

    <div v-if="loading && !rows.length" class="grid gap-3">
      <div v-for="index in 3" :key="index" class="warm-skeleton aspect-[2/1] rounded-[8px]" />
    </div>

    <p v-if="error" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
      {{ error }}
    </p>

    <section v-if="rows.length" class="offers-grid grid gap-3">
      <article
        v-for="(restaurant, index) in rows"
        :key="restaurant.merchant_uuid || restaurant.merchant_id"
        class="tagam-card offer-card stagger-item tap-motion overflow-hidden"
        :style="{ '--stagger-delay': `${Math.min(index, 8) * 45}ms` }"
      >
        <RouterLink :to="`/restaurant/${restaurant.restaurant_slug}`" class="block">
          <div class="image-treatment aspect-[2/1]">
            <img
              class="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
              :src="tagamAsset(restaurant.url_banner || restaurant.url_logo)"
              :alt="decodeHtml(restaurant.restaurant_name)"
            />
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-4">
              <p class="brand-kicker m-0 text-[var(--app-accent)]">SPECIAL OFFER</p>
              <h2 class="m-0 mt-1 text-2xl font-black text-white" v-html="restaurant.restaurant_name" />
              <p class="m-0 mt-2 text-sm text-white/75">
                {{ (restaurant.cuisine || []).join(" · ") || "Tagam Delivery" }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 p-3 text-center">
            <div class="rounded-[8px] bg-[var(--app-control)] p-3">
              <strong>{{ restaurant.estimation || "..." }}</strong>
              <span class="muted mt-1 block text-xs">{{ copy.min }}</span>
            </div>
            <div class="rounded-[8px] bg-[var(--app-control)] p-3">
              <strong>{{ restaurant.distance_pretty || "..." }}</strong>
              <span class="muted mt-1 block text-xs">{{ copy.near }}</span>
            </div>
            <div class="rounded-[8px] bg-[var(--app-control)] p-3">
              <strong>{{ restaurant.reviews?.ratings || "NEW" }}</strong>
              <span class="muted mt-1 block text-xs">{{ copy.rating }}</span>
            </div>
          </div>
        </RouterLink>
      </article>

      <button v-if="hasMore" class="tagam-pill tap-motion mx-auto px-5 py-3" type="button" :disabled="loading" @click="load()">
        {{ loading ? copy.loading : copy.more }}
      </button>
    </section>

    <div v-if="!loading && !rows.length && !error" class="soft-card offers-empty-card p-5 text-center">
      <BadgePercent class="mx-auto text-[var(--app-accent)]" :size="28" />
      <h2 class="m-0 mt-3 text-xl font-black">{{ copy.emptyTitle }}</h2>
      <p class="muted m-0 mt-2 text-sm">{{ copy.emptyText }}</p>
    </div>
  </section>
</template>

<script setup>
import { BadgePercent } from "@lucide/vue";
import { computed, onMounted, ref } from "vue";
import APIinterface from "src/api/APIinterface";
import AppHeader from "src/components/ui/AppHeader.vue";
import auth from "src/api/auth";
import { tagamAsset } from "src/services/tagamAssets";
import { LocalStorage } from "src/services/storage";
import { useAppStore } from "src/stores/app";

const app = useAppStore();
const rows = ref([]);
const details = ref(null);
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const error = ref("");

const totalLabel = computed(() => details.value?.total_pretty || "");
const offerCopy = {
  ru: {
    title: "Акции",
    refresh: "Обновить",
    heading: "Выгодные рестораны рядом",
    subtitle: "Показываем только реальные предложения, доступные сейчас.",
    min: "мин",
    near: "рядом",
    rating: "рейтинг",
    loading: "Загружаем...",
    more: "Показать еще",
    emptyTitle: "Акций сейчас нет",
    emptyText: "Для этой локации сейчас нет ресторанов с активными предложениями.",
  },
  tk: {
    title: "Aksiýalar",
    refresh: "Täzele",
    heading: "Ýakyndaky amatly restoranlar",
    subtitle: "Häzirki elýeterli hakyky teklipleri görkezýäris.",
    min: "min",
    near: "ýakynda",
    rating: "reýting",
    loading: "Ýüklenýär...",
    more: "Has köp görkez",
    emptyTitle: "Häzir aksiýa ýok",
    emptyText: "Bu ýer üçin häzirki wagtda aktiw teklipli restoran ýok.",
  },
  en: {
    title: "Offers",
    refresh: "Refresh",
    heading: "Deals near you",
    subtitle: "Showing real offers available right now.",
    min: "min",
    near: "nearby",
    rating: "rating",
    loading: "Loading...",
    more: "Show more",
    emptyTitle: "No offers right now",
    emptyText: "There are no restaurants with active offers for this location.",
  },
};
const copy = computed(() => offerCopy[app.language] || offerCopy.ru);

const decodeHtml = (value) => {
  const element = document.createElement("div");
  element.innerHTML = String(value ?? "");
  return element.textContent || "";
};

const coordinatesFromStorage = () => {
  const coordinates = LocalStorage.getItem("coordinates");
  if (!coordinates?.lat || !coordinates?.lng) return { lat: 37.9601, lng: 58.3261 };
  return { lat: Number(coordinates.lat), lng: Number(coordinates.lng) };
};

const load = async (reset = false) => {
  if (loading.value) return;
  if (reset) {
    page.value = 1;
    rows.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  loading.value = true;
  error.value = "";
  try {
    const params = {
      language: app.language,
      currency_code: app.currency,
      page: page.value,
      place_id: "",
      coordinates: coordinatesFromStorage(),
      list_type: "promo",
      featured_id: "",
      payload: ["cuisine", "reviews", "estimation", "services", "items_min_max", "offers", "promo"],
      sort_by: "",
      q: "",
      filters: {},
    };
    const response = auth.authenticated()
      ? await APIinterface.fetchDataByToken("getMerchantFeedAuth", params)
      : await APIinterface.getMerchantFeed(params);

    details.value = response.details ?? null;
    const nextRows = response.details?.data ?? response.details?.merchant_list ?? [];
    rows.value = reset ? nextRows : [...rows.value, ...nextRows];
    hasMore.value = !response.details?.is_last_page && nextRows.length > 0;
    page.value += 1;
  } catch (err) {
    error.value = err?.message ?? String(err);
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
};

onMounted(() => load(true));
</script>
