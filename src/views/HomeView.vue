<template>
  <section class="page home-page fade-up">
    <AppHeader title="" :icon="ShoppingBag" />

    <div class="home-hero tagam-card tagam-glow p-5">
      <img class="home-hero-bg-logo" src="/tagam-logo.svg" alt="" aria-hidden="true" />
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="brand-kicker m-0">{{ app.copy.home.pick }}</p>
          <h2 class="headline m-0 mt-2">{{ app.copy.home.hero }}</h2>
          <p class="muted mt-3 max-w-[20rem] text-sm">
            {{ feed.totalLabel || app.copy.home.loading }}
          </p>
        </div>
        <div class="home-hero-icon grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[var(--app-accent-soft)] ring-1 ring-[var(--app-border)]">
          <img class="h-16 w-16 object-contain" src="/icons/icon-512x512.png" alt="" />
        </div>
      </div>
      <RouterLink class="primary-button tap-motion mt-5 w-full" to="/offers">
        <Sparkles :size="18" />
        {{ app.copy.home.offers }}
      </RouterLink>
    </div>

    <div v-if="cuisines.length" class="sticky-rail home-cuisine-rail sticky top-0 z-10 py-3">
      <div class="home-cuisine-shell grid grid-cols-[70px_minmax(0,1fr)] gap-2 px-4">
        <button
          class="home-cuisine-card home-cuisine-card--pinned tap-motion"
          :class="{ 'is-active': !selectedCuisines.length }"
          type="button"
          @click.stop="handleClearCuisines"
        >
          <img class="home-cuisine-card__image home-cuisine-card__image--contain" src="/icons/icon-512x512.png" alt="" />
          <span class="home-cuisine-card__overlay" />
          <span class="home-cuisine-card__label">{{ app.copy.home.all || "Все" }}</span>
        </button>
      <div
        ref="cuisineRail"
        class="home-cuisine-scroll hide-scrollbar flex min-w-0 gap-2 overflow-x-auto"
        @dragstart.prevent
        @pointercancel="endRailDrag"
        @pointerdown="startRailDrag"
        @pointerleave="endRailDrag"
        @pointermove="moveRailDrag"
        @pointerup="endRailDrag"
      >
        <button
          v-if="false"
          class="home-cuisine-card tap-motion shrink-0"
          :class="{ 'is-active': !selectedCuisines.length }"
          type="button"
          @click.stop="handleClearCuisines"
        >
          <img class="home-cuisine-card__image home-cuisine-card__image--contain" src="/icons/icon-512x512.png" alt="" />
          <span class="home-cuisine-card__overlay" />
          <span class="home-cuisine-card__label">{{ app.copy.home.all || "Все" }}</span>
        </button>
        <button
          v-for="item in cuisines"
          :key="item.label"
          class="home-cuisine-card tap-motion shrink-0"
          :class="{ 'is-active': isCuisineSelected(item.label) }"
          type="button"
          @click.stop="handleToggleCuisine(item.label)"
        >
          <img v-if="item.image" class="home-cuisine-card__image home-cuisine-card__image--contain" :src="item.image" alt="" />
          <span v-else class="home-cuisine-card__fallback">
            <Utensils :size="24" />
          </span>
          <span class="home-cuisine-card__overlay" />
          <span class="home-cuisine-card__label">{{ item.label }}</span>
        </button>
      </div>
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
      class="tagam-card home-restaurant-card stagger-item tap-motion"
      :style="{ '--stagger-delay': `${Math.min(index, 8) * 55}ms` }"
    >
      <RouterLink :to="`/restaurant/${restaurant.restaurant_slug}`" class="block">
        <div class="image-treatment aspect-[2/1]">
          <img
            class="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
            :src="tagamAsset(restaurant.url_banner || restaurant.url_logo)"
            :alt="decodeHtml(restaurant.restaurant_name)"
          />
          <img
            v-if="restaurant.url_logo"
            class="absolute bottom-3 left-3 h-14 w-14 rounded-[8px] border border-white/20 bg-black/45 object-cover shadow-xl"
            :src="tagamAsset(restaurant.url_logo)"
            :alt="decodeHtml(restaurant.restaurant_name)"
          />
        </div>

        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="m-0 text-lg font-extrabold leading-tight" v-html="restaurant.restaurant_name" />
              <p class="muted m-0 mt-1 text-sm">
                {{ restaurant.estimation }} min / {{ restaurant.distance_pretty }} /
                {{ restaurant.free_delivery ? app.copy.home.freeDelivery : app.copy.home.deliveryAvailable }}
              </p>
              <p v-if="restaurant.cuisine?.length" class="muted mt-2 line-clamp-1 text-xs">
                {{ restaurant.cuisine.join(" / ") }}
              </p>
            </div>
            <span v-if="restaurant.reviews?.ratings" class="tagam-pill is-active h-fit min-h-0 px-3 py-1 text-xs">
              {{ restaurant.reviews.ratings }}
            </span>
          </div>
        </div>
      </RouterLink>
    </article>

  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ShoppingBag, Sparkles, Utensils } from "@lucide/vue";
import APIinterface from "src/api/APIinterface";
import { useAppStore } from "src/stores/app";
import { useMerchantFeedStore } from "src/stores/merchantFeed";
import AppHeader from "src/components/ui/AppHeader.vue";
import { tagamAsset } from "src/services/tagamAssets";

const app = useAppStore();
const feed = useMerchantFeedStore();
const cuisineRail = ref(null);
const cuisineCatalog = ref(new Map());
const selectedCuisines = ref([]);
const railDrag = ref({
  active: false,
  moved: false,
  pointerId: null,
  startScrollLeft: 0,
  startX: 0,
});
const suppressRailClick = ref(false);

const decodeHtml = (value) => {
  const element = document.createElement("div");
  element.innerHTML = String(value ?? "");
  return element.textContent || "";
};

const normalizeCuisineKey = (value) => decodeHtml(value).trim().toLocaleLowerCase();

const cuisineImage = (label) => cuisineCatalog.value.get(normalizeCuisineKey(label)) || "";

const loadCuisineCatalog = async () => {
  try {
    const response = await APIinterface.CuisineList(100, "");
    const rows = response?.details?.data ?? response?.details ?? response?.data ?? [];
    const next = new Map();
    (Array.isArray(rows) ? rows : Object.values(rows || {})).forEach((item) => {
      const image = tagamAsset(item.url_icon || item.featured_image || item.url_image || item.image || "");
      const names = [item.cuisine_name, item.original_cuisine_name, item.slug].filter(Boolean);
      names.forEach((name) => {
        const key = normalizeCuisineKey(name);
        if (key && image && !image.includes("default-icons.png") && !image.includes("placeholder.png")) {
          next.set(key, image);
        }
      });
    });
    cuisineCatalog.value = next;
  } catch {
    cuisineCatalog.value = new Map();
  }
};

const cuisines = computed(() => {
  const counts = new Map();

  feed.rows.forEach((restaurant) => {
    (restaurant.cuisine || []).forEach((label) => {
      const key = String(label || "").trim();
      if (!key) return;
      const current = counts.get(key) || { label: key, count: 0, image: "" };
      current.count += 1;
      current.image ||= cuisineImage(key);
      counts.set(key, current);
    });
  });

  return Array.from(counts.values())
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, app.language));
});

const filteredRestaurants = computed(() => {
  if (!selectedCuisines.value.length) return feed.rows;
  return feed.rows.filter((restaurant) =>
    (restaurant.cuisine || []).some((label) => selectedCuisines.value.includes(label))
  );
});

const isCuisineSelected = (label) => selectedCuisines.value.includes(label);
const toggleCuisine = (label) => {
  selectedCuisines.value = isCuisineSelected(label)
    ? selectedCuisines.value.filter((item) => item !== label)
    : [...selectedCuisines.value, label];
};

const clearCuisines = () => {
  selectedCuisines.value = [];
};

const handleClearCuisines = () => {
  if (suppressRailClick.value) return;
  clearCuisines();
};

const handleToggleCuisine = (label) => {
  if (suppressRailClick.value) return;
  toggleCuisine(label);
};

const startRailDrag = (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  if (event.target?.closest?.(".home-cuisine-card")) return;
  railDrag.value = {
    active: true,
    moved: false,
    pointerId: event.pointerId,
    startScrollLeft: event.currentTarget.scrollLeft,
    startX: event.clientX,
  };
  suppressRailClick.value = false;
  event.currentTarget.setPointerCapture?.(event.pointerId);
};

const moveRailDrag = (event) => {
  if (!railDrag.value.active) return;
  const deltaX = event.clientX - railDrag.value.startX;
  if (Math.abs(deltaX) > 10) {
    railDrag.value.moved = true;
    event.preventDefault();
  }
  event.currentTarget.scrollLeft = railDrag.value.startScrollLeft - deltaX;
};

const endRailDrag = (event) => {
  if (!railDrag.value.active) return;
  const moved = railDrag.value.moved;
  event.currentTarget?.releasePointerCapture?.(railDrag.value.pointerId);
  railDrag.value = { ...railDrag.value, active: false };
  suppressRailClick.value = moved;
  window.setTimeout(() => {
    suppressRailClick.value = false;
  }, 80);
};

onMounted(() => {
  if (!feed.loadedAt && !feed.loading) {
    feed.load();
  }
  loadCuisineCatalog();
});
</script>

<style scoped>
.home-cuisine-card {
  position: relative;
  display: grid;
  width: 70px;
  height: 94px;
  overflow: hidden;
  place-items: end center;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-card);
  padding: 7px;
  color: var(--app-text);
  text-align: left;
}

.home-cuisine-scroll {
  cursor: grab;
  touch-action: pan-x;
  user-select: none;
}

.home-cuisine-scroll:active {
  cursor: grabbing;
}

.home-cuisine-card.is-active {
  border-color: color-mix(in srgb, var(--app-accent) 80%, white 8%);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--app-accent) 54%, transparent), 0 16px 30px rgba(0, 0, 0, 0.24);
}

.home-cuisine-card__image,
.home-cuisine-card__overlay,
.home-cuisine-card__fallback {
  position: absolute;
  inset: 0;
}

.home-cuisine-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 1;
  transition: transform 220ms ease, opacity 220ms ease;
}

.home-cuisine-card__image--contain {
  object-fit: contain;
  padding: 6px 5px 25px;
  object-position: center 22%;
  background:
    radial-gradient(circle at 50% 34%, rgba(255, 154, 0, 0.12), transparent 58%),
    color-mix(in srgb, var(--app-card) 86%, black);
}

.home-cuisine-card__fallback {
  display: grid;
  place-items: start center;
  background:
    radial-gradient(circle at 50% 34%, color-mix(in srgb, var(--app-accent) 22%, transparent), transparent 58%),
    color-mix(in srgb, var(--app-card) 86%, black);
  color: var(--app-accent);
  padding-top: 15px;
}

.home-cuisine-card:active .home-cuisine-card__image {
  transform: scale(1.04);
  opacity: 1;
}

.home-cuisine-card__overlay {
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.18) 48%, rgba(0, 0, 0, 0.76));
}

.home-cuisine-card__label {
  position: relative;
  z-index: 1;
  display: -webkit-box;
  overflow: hidden;
  max-width: 100%;
  text-align: center;
  color: #ffffff;
  font-size: 10px;
  font-weight: 1000;
  line-height: 1.05;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.75);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>


