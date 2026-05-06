<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { useAppStore } from "@/stores/app"
import MetricIcon from "@/components/MetricIcon.vue"

const store = useAppStore()
const router = useRouter()
const homeQuery = ref("")
const activeRestaurantFilter = ref("all")
const repeatOrderLoading = ref("")
const hasHomeQuery = computed(() => homeQuery.value.trim().length > 0)

function normalizeText(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

function merchantInitials(name) {
  const words = normalizeText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  return words.map((word) => word[0]?.toUpperCase() || "").join("") || "TG"
}

function merchantTone(name) {
  const tones = ["sun", "mint", "berry", "sky", "peach"]
  const total = Array.from(normalizeText(name)).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return tones[total % tones.length]
}

function parsePrice(value) {
  const normalized = normalizeText(value)
    .replace(/^от\s*/i, "")
    .replace(/[^\d.,]/g, "")
    .replace(",", ".")

  const numeric = Number.parseFloat(normalized)
  return Number.isFinite(numeric) ? Math.round(numeric) : null
}

function parseDistance(value) {
  const normalized = normalizeText(value).replace(",", ".")
  const numeric = Number.parseFloat(normalized.replace(/[^\d.]/g, ""))
  return Number.isFinite(numeric) ? numeric : null
}

function formatMerchantPrice(value) {
  const numeric = parsePrice(value)
  const suffix = normalizeText(store.moneyConfig?.suffix || "")
  const prefix = normalizeText(store.moneyConfig?.prefix || "")
  const code = normalizeText(store.defaultCurrencyCode || "")

  if (numeric === null) {
    return normalizeText(value || "")
  }

  if (prefix) {
    return `${prefix}${numeric}`
  }

  if (suffix) {
    return `${numeric} ${suffix}`
  }

  if (code) {
    return `${numeric} ${code}`
  }

  return String(numeric)
}

function merchantEta(merchant) {
  const value = normalizeText(merchant.estimation || "")
  return value ? `${value} мин` : ""
}

function merchantDeliveryFee(merchant) {
  if (merchant.freeDelivery) {
    return "Бесплатная доставка"
  }

  const value = Number(merchant.deliveryFee || 0)
  if (value <= 0) {
    return ""
  }

  return `Доставка ${formatMerchantPrice(value)}`
}

function merchantMinimumOrder(merchant) {
  const value = Number(merchant.minimumOrder || 0)
  if (value <= 0) {
    return ""
  }

  return `От ${formatMerchantPrice(value)}`
}

function merchantRating(merchant) {
  return normalizeText(merchant.rating || "")
}

function merchantDistance(merchant) {
  return normalizeText(merchant.distance || "")
}

function pluralizeReviews(count) {
  const value = Number(count || 0)
  const mod10 = value % 10
  const mod100 = value % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `${value} оценка`
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${value} оценки`
  }

  return `${value} оценок`
}

function merchantReviewCount(merchant) {
  const count = Number(merchant.reviewCount || 0)
  return count > 0 ? pluralizeReviews(count) : "нет оценок"
}

function merchantStatusLabel(merchant) {
  if (Number(merchant.openStatus || 0) > 0 || merchant.available) {
    return "Открыт сейчас"
  }

  return normalizeText(merchant.nextOpening || merchant.closeReason || "Сейчас недоступно")
}

function merchantPromoLabel(merchant) {
  const count = Number(merchant.promoCount || 0)

  if (count <= 0) {
    return ""
  }

  if (count === 1) {
    return "1 акция"
  }

  if (count >= 2 && count <= 4) {
    return `${count} акции`
  }

  return `${count} акций`
}

function merchantDescription(merchant) {
  const shortDescription = normalizeText(merchant.shortDescription)
  const leadTitle = normalizeText(merchant.leadTitle)
  const secondaryTitle = normalizeText(merchant.secondaryTitle)

  if (shortDescription) {
    return shortDescription
  }

  if (leadTitle && secondaryTitle) {
    return `Хиты меню: ${leadTitle} и ${secondaryTitle}.`
  }

  if (leadTitle) {
    return `В меню сейчас: ${leadTitle}.`
  }

  if (merchant.sourceTitles.length >= 2) {
    return `${merchant.sourceTitles[0]} и ${merchant.sourceTitles[1]} кухня.`
  }

  if (merchant.sourceTitles.length === 1) {
    return `${merchant.sourceTitles[0]} кухня.`
  }

  return "Откройте ресторан и посмотрите доступное меню."
}

function collectionDescription(key) {
  if (key === "burger") {
    return "Бургеры, которые чаще всего выбирают прямо сейчас."
  }

  if (key === "pizza") {
    return "Пицца, которую чаще всего берут в вашей локации."
  }

  return "Популярные позиции, с которых удобно начать заказ."
}

function bannerLabel(type) {
  if (type === "cuisine") {
    return "Подборка по кухне"
  }

  if (type === "custom_link") {
    return "Спецпредложение"
  }

  return "Актуальная акция"
}

const cuisineCards = computed(() => store.cuisines.slice(0, 8))

const merchantHighlights = computed(() =>
  store.merchantDirectory.slice(0, 12).map((entry) => ({
    ...entry,
    name: normalizeText(entry.name),
    count: entry.items.length,
    leadTitle: entry.items[0]?.name || "",
    secondaryTitle: entry.items[1]?.name || "",
    sourceTitles: entry.collectionTitles.slice(0, 3),
    initials: merchantInitials(entry.name),
    tone: merchantTone(entry.name),
    ratingValue: Number.parseFloat(merchantRating(entry)) || 0,
    distanceValue: parseDistance(entry.distance),
    minPriceValue: parsePrice(entry.minPrice),
    reviewCountValue: Number(entry.reviewCount || 0),
  })),
)

const recentMerchantCards = computed(() =>
  store.recentMerchants.slice(0, 4).map((entry) => ({
    ...entry,
    name: normalizeText(entry.name),
    count: entry.items.length,
    leadTitle: entry.items[0]?.name || "",
    secondaryTitle: entry.items[1]?.name || "",
    sourceTitles: entry.collectionTitles.slice(0, 3),
    initials: merchantInitials(entry.name),
    tone: merchantTone(entry.name),
  })),
)

const favoriteMerchantCards = computed(() =>
  store.favoriteMerchants.slice(0, 4).map((entry) => ({
    ...entry,
    name: normalizeText(entry.name),
  })),
)

const recentSearchChips = computed(() => store.recentSearches.slice(0, 4))

const repeatOrderCards = computed(() => store.reorderableOrders.slice(0, 4))
const showPersonalSection = computed(
  () =>
    store.clientAuthenticated ||
    repeatOrderCards.length ||
    favoriteMerchantCards.length ||
    recentMerchantCards.length ||
    recentSearchChips.length,
)

const heroStats = computed(() => {
  const stats = []

  if (merchantHighlights.value.length) {
    stats.push(`${merchantHighlights.value.length} ресторанов`)
  }

  if (store.totalLiveItems) {
    stats.push(`${store.totalLiveItems} блюд`)
  }

  if (store.banners.length) {
    stats.push(`${store.banners.length} акции`)
  }

  return stats
})

const restaurantFilters = computed(() => [
  { key: "all", label: "Все" },
  { key: "open", label: "Открыты" },
  { key: "free", label: "Бесплатная доставка" },
  { key: "rated", label: "С рейтингом" },
  { key: "near", label: "Ближе" },
  { key: "promo", label: "Акции" },
])

const filteredMerchants = computed(() => {
  const items = [...merchantHighlights.value]

  if (activeRestaurantFilter.value === "open") {
    return items.filter((merchant) => Number(merchant.openStatus || 0) > 0 || merchant.available)
  }

  if (activeRestaurantFilter.value === "free") {
    return items.filter((merchant) => merchant.freeDelivery)
  }

  if (activeRestaurantFilter.value === "rated") {
    return items
      .filter((merchant) => merchant.ratingValue > 0)
      .sort((left, right) => right.ratingValue - left.ratingValue)
  }

  if (activeRestaurantFilter.value === "near") {
    return items
      .filter((merchant) => merchant.distanceValue !== null)
      .sort((left, right) => left.distanceValue - right.distanceValue)
  }

  if (activeRestaurantFilter.value === "promo") {
    return items
      .filter((merchant) => merchant.promoCount > 0)
      .sort((left, right) => right.promoCount - left.promoCount)
  }

  return items
})

const bannerCards = computed(() =>
  store.banners.slice(0, 5).map((banner) => ({
    ...banner,
    displayTitle: normalizeText(banner.title) || "Популярно сейчас",
    displayLabel: bannerLabel(banner.type),
  })),
)

const homeShelves = computed(() =>
  store.collections.slice(0, 3).map((collection) => ({
    ...collection,
    kicker: "Что выбирают сейчас",
    description: collectionDescription(collection.key),
  })),
)

const daypartScenario = computed(() => {
  const hour = new Date().getHours()

  if (hour >= 6 && hour < 11) {
    return {
      title: "Подойдет на утро",
      copy: "Быстрые сценарии для завтрака и первого кофе.",
      queries: ["кофе", "завтрак", "круассан"],
    }
  }

  if (hour >= 11 && hour < 16) {
    return {
      title: "Выбор на обед",
      copy: "То, что обычно удобно заказать днем.",
      queries: ["бургер", "wok", "обед"],
    }
  }

  if (hour >= 16 && hour < 22) {
    return {
      title: "Выбор на вечер",
      copy: "Самые понятные сценарии для ужина.",
      queries: ["пицца", "суши", "гриль"],
    }
  }

  return {
    title: "Можно заказать сейчас",
    copy: "То, что чаще всего берут поздно вечером.",
    queries: ["бургер", "шаурма", "кофе"],
  }
})

async function launchSearch(query = homeQuery.value) {
  const normalized = query.trim()

  if (normalized) {
    store.recordSearch(normalized)
  }

  await router.push({
    path: "/search",
    query: normalized ? { q: normalized } : {},
  })
}

async function openMerchant(merchant) {
  if (!merchant?.slug) {
    await launchSearch(merchant?.name || "")
    return
  }

  store.recordMerchantVisit(merchant.slug)

  await router.push({
    name: "merchant",
    params: {
      slug: merchant.slug,
    },
  })
}

async function repeatOrder(order) {
  if (!order?.orderUuid) {
    return
  }

  repeatOrderLoading.value = order.orderUuid

  try {
    const result = await store.repeatOrder(order.orderUuid)
    const slug = result?.details?.restaurant_slug || order.merchantSlug || order.merchant?.slug || ""

    if (slug) {
      store.recordMerchantVisit(slug)
      await router.push({
        name: "merchant",
        params: {
          slug,
        },
      })
      return
    }
  } catch {
    if (order.merchant) {
      await openMerchant(order.merchant)
      return
    }
  } finally {
    repeatOrderLoading.value = ""
  }

  await launchSearch(order.merchantName || "")
}

function searchByCuisine(cuisine) {
  homeQuery.value = cuisine.title
  launchSearch(cuisine.title)
}

function useRestaurantFilter(filterKey) {
  activeRestaurantFilter.value = filterKey
}
</script>

<template>
  <section class="app-page app-page--home">
    <section class="home-surface home-hero">
      <div class="home-hero__intro">
        <div class="home-hero__eyebrow">Доставка рядом</div>
        <h1>Что заказать сегодня?</h1>
        <p>Рестораны, блюда и акции для вашей текущей локации без лишних переходов.</p>
      </div>

      <div class="home-hero__stats">
        <span v-for="stat in heroStats" :key="stat">{{ stat }}</span>
      </div>

      <form class="home-search-bar" @submit.prevent="launchSearch()">
        <span class="search-field__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M11 4.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9Zm6.9 9.5 3.3 3.3-1.4 1.4-3.3-3.3z"
              fill="currentColor"
            />
          </svg>
        </span>
        <input
          v-model="homeQuery"
          type="text"
          placeholder="Ищите бургеры, суши, пиццу, кофе..."
        />
        <button type="submit">{{ hasHomeQuery ? "Найти" : "Поиск" }}</button>
      </form>

      <div class="home-quick-filters">
        <button
          v-for="cuisine in cuisineCards"
          :key="cuisine.id"
          type="button"
          class="home-quick-filters__chip"
          @click="searchByCuisine(cuisine)"
        >
          {{ cuisine.title }}
        </button>
      </div>
    </section>

    <section class="home-surface home-block home-block--scenario">
      <div class="home-block__head">
        <div>
          <div class="home-block__eyebrow">Сценарий</div>
          <div class="home-block__title">{{ daypartScenario.title }}</div>
          <div class="home-block__copy">{{ daypartScenario.copy }}</div>
        </div>
      </div>

      <div class="home-inline-actions">
        <button
          v-for="query in daypartScenario.queries"
          :key="query"
          type="button"
          class="home-inline-actions__chip"
          @click="launchSearch(query)"
        >
          {{ query }}
        </button>
      </div>
    </section>

    <section v-if="showPersonalSection" class="home-surface home-block home-block--personal">
      <div class="home-block__head">
        <div>
          <div class="home-block__eyebrow">Продолжить выбор</div>
          <div class="home-block__title">Недавно смотрели и искали</div>
          <div class="home-block__copy">Быстрый возврат в недавние сценарии без повторного ввода.</div>
        </div>
      </div>

      <div v-if="repeatOrderCards.length" class="home-personal__group">
        <div class="home-personal__label">Повторить заказ</div>
        <div class="home-inline-actions">
          <button
            v-for="order in repeatOrderCards"
            :key="order.key"
            type="button"
            class="home-inline-actions__chip home-inline-actions__chip--merchant"
            :disabled="repeatOrderLoading === order.orderUuid"
            @click="repeatOrder(order)"
          >
            {{ repeatOrderLoading === order.orderUuid ? "Открываем..." : `${order.merchantName} · ${order.totalLabel}` }}
          </button>
        </div>
      </div>

      <div v-if="favoriteMerchantCards.length" class="home-personal__group">
        <div class="home-personal__label">Ваши рестораны</div>
        <div class="home-inline-actions">
          <button
            v-for="merchant in favoriteMerchantCards"
            :key="merchant.slug || merchant.key"
            type="button"
            class="home-inline-actions__chip home-inline-actions__chip--merchant"
            @click="openMerchant(merchant)"
          >
            {{ merchant.name }}
          </button>
        </div>
      </div>

      <div v-if="recentMerchantCards.length" class="home-personal__group">
        <div class="home-personal__label">Рестораны</div>
        <div class="home-inline-actions">
          <button
            v-for="merchant in recentMerchantCards"
            :key="merchant.slug || merchant.key"
            type="button"
            class="home-inline-actions__chip home-inline-actions__chip--merchant"
            @click="openMerchant(merchant)"
          >
            {{ merchant.name }}
          </button>
        </div>
      </div>

      <div v-if="recentSearchChips.length" class="home-personal__group">
        <div class="home-personal__label">Поиски</div>
        <div class="home-inline-actions">
          <button
            v-for="query in recentSearchChips"
            :key="query"
            type="button"
            class="home-inline-actions__chip"
            @click="launchSearch(query)"
          >
            {{ query }}
          </button>
        </div>
      </div>
    </section>

    <section v-if="filteredMerchants.length" class="home-surface home-block home-block--available">
      <div class="home-block__head">
        <div>
          <div class="home-block__eyebrow">Доступно для заказа</div>
          <div class="home-block__title">Рестораны в вашей зоне</div>
          <div class="home-block__copy">Один рабочий слой ресторанов с быстрым выбором и фильтрами.</div>
        </div>
      </div>

      <div class="home-filter-row">
        <button
          v-for="filter in restaurantFilters"
          :key="filter.key"
          type="button"
          class="home-filter-chip"
          :class="{ 'is-active': activeRestaurantFilter === filter.key }"
          @click="useRestaurantFilter(filter.key)"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="merchant-carousel">
        <article
          v-for="merchant in filteredMerchants"
          :key="merchant.key"
          class="merchant-card"
        >
          <div class="merchant-card__media">
            <img
              v-if="merchant.headerImage || merchant.image"
              :src="merchant.headerImage || merchant.image"
              :alt="merchant.name"
              loading="lazy"
            />
            <div class="merchant-card__media-topline">
              <span class="merchant-card__media-chip merchant-card__media-chip--rating">
                <MetricIcon icon="star" />
                {{ merchantRating(merchant) || "нет оценок" }}
              </span>
              <span
                class="merchant-card__logo merchant-card__logo--overlay"
                :class="[
                  `merchant-card__logo--${merchant.tone}`,
                  { 'merchant-card__logo--image': merchant.logoImage },
                ]"
              >
                <img
                  v-if="merchant.logoImage"
                  :src="merchant.logoImage"
                  :alt="merchant.name"
                  loading="lazy"
                />
                <template v-else>{{ merchant.initials }}</template>
              </span>
            </div>
            <div
              v-if="merchant.freeDelivery || merchant.promoCount > 0 || merchantStatusLabel(merchant) !== 'Открыт сейчас'"
              class="merchant-card__media-badges"
            >
              <span
                v-if="merchant.freeDelivery"
                class="merchant-card__badge merchant-card__badge--success"
              >
                Бесплатная доставка
              </span>
              <span
                v-if="merchant.promoCount > 0"
                class="merchant-card__badge merchant-card__badge--promo"
              >
                {{ merchantPromoLabel(merchant) }}
              </span>
              <span
                v-if="merchantStatusLabel(merchant) !== 'Открыт сейчас'"
                class="merchant-card__badge merchant-card__badge--closed"
              >
                {{ merchantStatusLabel(merchant) }}
              </span>
            </div>
            <div class="merchant-card__headline">
              <h3>{{ merchant.name }}</h3>
            </div>
          </div>
          <div class="merchant-card__body">
            <p>{{ merchantDescription(merchant) }}</p>

            <div class="merchant-card__meta">
              <span v-if="merchantEta(merchant)">{{ merchantEta(merchant) }}</span>
              <span v-if="merchantDeliveryFee(merchant)">{{ merchantDeliveryFee(merchant) }}</span>
              <span v-if="merchantMinimumOrder(merchant)">{{ merchantMinimumOrder(merchant) }}</span>
            </div>

            <div class="merchant-card__chips">
              <span>{{ merchantStatusLabel(merchant) }}</span>
              <span v-if="merchantDistance(merchant)">{{ merchantDistance(merchant) }}</span>
              <span>{{ merchantReviewCount(merchant) }}</span>
              <span v-if="merchant.count > 0">{{ merchant.count }} блюд</span>
            </div>

            <button type="button" class="merchant-card__action" @click="openMerchant(merchant)">
              Перейти
            </button>
          </div>
        </article>
      </div>
    </section>

    <section
      v-for="collection in homeShelves"
      :key="collection.key"
      class="home-surface home-block"
    >
      <div class="home-block__head">
        <div>
          <div class="home-block__eyebrow">{{ collection.kicker }}</div>
          <div class="home-block__title">{{ collection.title }}</div>
          <div class="home-block__copy">{{ collection.description }}</div>
        </div>
      </div>

      <div class="food-carousel">
        <article v-for="item in collection.items.slice(0, 8)" :key="item.id" class="food-card">
          <div class="food-card__media">
            <img v-if="item.image" :src="item.image" :alt="item.name" loading="lazy" />
            <span class="food-card__merchant">{{ item.merchantName }}</span>
          </div>
          <div class="food-card__body">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description || item.merchantName }}</p>
            <div class="food-card__meta">
              <span class="food-card__price">{{ item.price }}</span>
              <span>{{ collection.title }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section v-if="bannerCards.length" class="home-surface home-block">
      <div class="home-block__head">
        <div>
          <div class="home-block__eyebrow">Акции</div>
          <div class="home-block__title">Акции и предложения</div>
          <div class="home-block__copy">Отдельный слой для скидок и актуальных промо, а не смешение с ресторанами.</div>
        </div>
      </div>

      <div class="promo-carousel">
        <article v-for="banner in bannerCards" :key="banner.id" class="promo-banner">
          <img :src="banner.image" :alt="banner.displayTitle" loading="lazy" />
          <div class="promo-banner__shade"></div>
          <div class="promo-banner__body">
            <span>{{ banner.displayLabel }}</span>
            <h3>{{ banner.displayTitle }}</h3>
          </div>
        </article>
      </div>
    </section>

    <section v-if="store.dashboardError" class="section-card">
      <div class="section-title">Проблема с лентой</div>
      <div class="helper-copy">{{ store.dashboardError }}</div>
    </section>
  </section>
</template>
