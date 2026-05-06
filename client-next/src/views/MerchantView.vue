<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAppStore } from "@/stores/app"
import MetricIcon from "@/components/MetricIcon.vue"

const store = useAppStore()
const route = useRoute()
const router = useRouter()
const menuQuery = ref("")

function merchantInitials(name) {
  const words = String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  return words.map((word) => word[0]?.toUpperCase() || "").join("") || "TG"
}

function merchantTone(name) {
  const tones = ["sun", "mint", "berry", "sky", "peach"]
  const total = Array.from(String(name || "")).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return tones[total % tones.length]
}

function normalizeText(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

function itemMatchesQuery(item, query) {
  const haystack = [item.name, item.description, item.price]
    .map((value) => normalizeText(value).toLowerCase())
    .join(" ")

  return haystack.includes(query)
}

const merchant = computed(() => {
  const slug = String(route.params.slug || "")
  const match = store.merchantDirectory.find((entry) => entry.slug === slug) || null

  if (!match) {
    return null
  }

  return {
    ...match,
    name: normalizeText(match.name),
    minPrice: normalizeText(match.minPrice),
    distance: normalizeText(match.distance),
    rating: normalizeText(match.rating),
    initials: merchantInitials(match.name),
    tone: merchantTone(match.name),
    cuisines: match.collectionTitles.slice(0, 4),
    featuredItems: match.items.slice(0, 4),
    menuItems: match.items.slice(0, 18),
  }
})

const filteredMenuItems = computed(() => {
  if (!merchant.value) {
    return []
  }

  const query = menuQuery.value.trim().toLowerCase()

  if (!query) {
    return merchant.value.menuItems
  }

  return merchant.value.menuItems.filter((item) => itemMatchesQuery(item, query))
})

const heroStats = computed(() => {
  if (!merchant.value) {
    return []
  }

  const stats = [{ icon: "dish", label: `${merchant.value.items.length || 0} блюд сейчас` }]

  if (merchant.value.rating) {
    stats.push({ icon: "star", label: merchant.value.rating })
  }

  if (merchant.value.distance) {
    stats.push({ icon: "route", label: merchant.value.distance })
  }

  if (merchant.value.minPrice) {
    stats.push({ icon: "price", label: `РѕС‚ ${merchant.value.minPrice}` })
  }

  return stats
})

const merchantStory = computed(() => {
  if (!merchant.value) {
    return ""
  }

  if (merchant.value.cuisines.length) {
    return merchant.value.cuisines.join(" вЂў ")
  }

  if (merchant.value.featuredItems[0]?.description) {
    return normalizeText(merchant.value.featuredItems[0].description)
  }

  return "РћС‚РєСЂРѕР№С‚Рµ СЂРµСЃС‚РѕСЂР°РЅ Рё СЃРјРѕС‚СЂРёС‚Рµ РїРѕР·РёС†РёРё, РєРѕС‚РѕСЂС‹Рµ СЃРµР№С‡Р°СЃ СЂРµР°Р»СЊРЅРѕ РґРѕСЃС‚СѓРїРЅС‹ РґР»СЏ Р·Р°РєР°Р·Р°."
})

async function openSearch(query) {
  await router.push({
    path: "/search",
    query: query ? { q: query } : {},
  })
}

async function openMerchantSearch() {
  const query = menuQuery.value.trim()
  const merchantName = merchant.value?.name || ""
  await openSearch(query ? `${merchantName} ${query}`.trim() : merchantName)
}

function scrollToSection(id) {
  const element = document.getElementById(id)

  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

onMounted(() => {
  store.hydrate().then(() => {
    const slug = String(route.params.slug || "")

    if (slug) {
      store.recordMerchantVisit(slug)
      store.loadMerchantProfile(slug)
    }
  })
})
</script>

<template>
  <section class="app-page merchant-page">
    <section v-if="merchant" class="merchant-hero">
      <div class="merchant-hero__media">
        <img
          v-if="merchant.headerImage || merchant.image"
          :src="merchant.headerImage || merchant.image"
          :alt="merchant.name"
          loading="lazy"
        />
        <div class="merchant-hero__overlay"></div>
        <div
          class="merchant-hero__logo"
          :class="[
            `merchant-hero__logo--${merchant.tone}`,
            { 'merchant-hero__logo--image': merchant.logoImage },
          ]"
        >
          <img
            v-if="merchant.logoImage"
            :src="merchant.logoImage"
            :alt="merchant.name"
            loading="lazy"
          />
          <template v-else>{{ merchant.initials }}</template>
        </div>

        <div class="merchant-hero__headline">
          <span class="merchant-hero__eyebrow">Р”РѕСЃС‚Р°РІРєР° РёР· СЂРµСЃС‚РѕСЂР°РЅР°</span>
          <h1>{{ merchant.name }}</h1>
          <p>{{ merchantStory }}</p>
        </div>
      </div>

      <div class="merchant-hero__body">
        <div class="merchant-hero__meta">
          <span v-for="stat in heroStats" :key="stat.label">
            <MetricIcon :icon="stat.icon" />
            {{ stat.label }}
          </span>
        </div>

        <form class="merchant-searchbar" @submit.prevent="openMerchantSearch()">
          <span class="search-field__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M11 4.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9Zm6.9 9.5 3.3 3.3-1.4 1.4-3.3-3.3z"
                fill="currentColor"
              />
            </svg>
          </span>
          <input
            v-model="menuQuery"
            type="text"
            placeholder="РќР°Р№С‚Рё Р±Р»СЋРґРѕ, РїРѕР·РёС†РёСЋ РёР»Рё РєР°С‚РµРіРѕСЂРёСЋ"
          />
          <button type="submit">РСЃРєР°С‚СЊ</button>
        </form>

        <div v-if="merchant.cuisines.length" class="merchant-hero__tags">
          <span v-for="title in merchant.cuisines" :key="title">{{ title }}</span>
        </div>

        <div class="merchant-hero__actions">
          <button type="button" class="merchant-hero__action" @click="scrollToSection('merchant-menu')">
            РџРµСЂРµР№С‚Рё Рє РјРµРЅСЋ
          </button>
          <button type="button" class="merchant-hero__ghost" @click="scrollToSection('merchant-picks')">
            Р РµРєРѕРјРµРЅРґСѓРµРј
          </button>
          <button type="button" class="merchant-hero__ghost" @click="scrollToSection('merchant-about')">
            Рћ СЂРµСЃС‚РѕСЂР°РЅРµ
          </button>
        </div>
      </div>
    </section>

    <section v-if="merchant?.featuredItems.length" id="merchant-picks" class="home-block">
      <div class="home-block__head">
        <div>
          <div class="home-block__eyebrow">Р РµРєРѕРјРµРЅРґСѓРµРј</div>
          <div class="home-block__title">РЎ С‡РµРіРѕ РЅР°С‡Р°С‚СЊ Р·Р°РєР°Р·</div>
          <div class="home-block__copy">РЎРёР»СЊРЅС‹Рµ РїРѕР·РёС†РёРё СЂРµСЃС‚РѕСЂР°РЅР°, РєРѕС‚РѕСЂС‹Рµ С…РѕСЂРѕС€Рѕ РїСЂРѕРґР°СЋС‚ РІРёС‚СЂРёРЅСѓ.</div>
        </div>
      </div>

      <div class="merchant-featured-grid">
        <article
          v-for="item in merchant.featuredItems"
          :key="item.id"
          class="merchant-featured-card"
        >
          <div class="merchant-featured-card__media">
            <img v-if="item.image" :src="item.image" :alt="item.name" loading="lazy" />
          </div>
          <div class="merchant-featured-card__body">
            <span class="merchant-featured-card__eyebrow">РҐРёС‚ РјРµРЅСЋ</span>
            <h3>{{ item.name }}</h3>
            <p>{{ item.description || merchant.name }}</p>
            <div class="merchant-featured-card__meta">
              <span>{{ item.price }}</span>
              <span>{{ merchant.name }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section v-if="merchant" id="merchant-menu" class="home-block">
      <div class="home-block__head">
        <div>
          <div class="home-block__eyebrow">РњРµРЅСЋ</div>
          <div class="home-block__title">Р”РѕСЃС‚СѓРїРЅРѕ СЃРµР№С‡Р°СЃ</div>
          <div class="home-block__copy">
            <template v-if="menuQuery.trim()">
              РџРѕРєР°Р·С‹РІР°РµРј РїРѕР·РёС†РёРё РїРѕ Р·Р°РїСЂРѕСЃСѓ В«{{ menuQuery.trim() }}В».
            </template>
            <template v-else>
              Р‘Р»СЋРґР°, РєРѕС‚РѕСЂС‹Рµ СЃРµР№С‡Р°СЃ СЂРµР°Р»СЊРЅРѕ РґРѕСЃС‚СѓРїРЅС‹ РІ РІС‹Р±СЂР°РЅРЅРѕР№ Р»РѕРєР°С†РёРё.
            </template>
          </div>
        </div>
      </div>

      <div v-if="filteredMenuItems.length" class="merchant-menu-grid">
        <article v-for="item in filteredMenuItems" :key="item.id" class="merchant-menu-item">
          <div class="merchant-menu-item__media">
            <img v-if="item.image" :src="item.image" :alt="item.name" loading="lazy" />
          </div>
          <div class="merchant-menu-item__body">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description || merchant.name }}</p>
            <div class="merchant-menu-item__meta">
              <span>{{ item.price }}</span>
              <button type="button" @click="openSearch(item.name)">РќР°Р№С‚Рё РІ РїРѕРёСЃРєРµ</button>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="section-card merchant-empty">
        <div class="section-title">РџРѕ СЌС‚РѕРјСѓ Р·Р°РїСЂРѕСЃСѓ РЅРёС‡РµРіРѕ РЅРµ РЅР°Р№РґРµРЅРѕ</div>
        <div class="helper-copy">
          РџРѕРїСЂРѕР±СѓР№С‚Рµ СѓР±СЂР°С‚СЊ С‡Р°СЃС‚СЊ Р·Р°РїСЂРѕСЃР° РёР»Рё РѕС‚РєСЂС‹С‚СЊ РїРѕРёСЃРє РїРѕ РІСЃРµРјСѓ СЂРµСЃС‚РѕСЂР°РЅСѓ.
        </div>
        <button type="button" class="merchant-hero__ghost merchant-empty__action" @click="openMerchantSearch()">
          РСЃРєР°С‚СЊ РІРѕ РІСЃРµРј СЂРµСЃС‚РѕСЂР°РЅРµ
        </button>
      </div>
    </section>

    <section v-if="merchant" id="merchant-about" class="merchant-info-grid">
      <article class="section-card merchant-info-card">
        <div class="home-block__eyebrow">Рћ СЂРµСЃС‚РѕСЂР°РЅРµ</div>
        <div class="section-title">{{ merchant.name }}</div>
        <div class="helper-copy">
          {{ merchantStory }}
        </div>
      </article>

      <article class="section-card merchant-info-card">
        <div class="home-block__eyebrow">Р§С‚Рѕ РµСЃС‚СЊ РІРЅСѓС‚СЂРё</div>
        <div class="merchant-info-card__facts">
          <span v-for="stat in heroStats" :key="`fact-${stat.label}`">
            <MetricIcon :icon="stat.icon" />
            {{ stat.label }}
          </span>
        </div>
      </article>
    </section>

    <section v-else class="section-card">
      <div class="section-title">Р РµСЃС‚РѕСЂР°РЅ РїРѕРєР° РЅРµРґРѕСЃС‚СѓРїРµРЅ</div>
      <div class="helper-copy">
        Р­С‚РѕРіРѕ Р·Р°РІРµРґРµРЅРёСЏ РїРѕРєР° РЅРµС‚ РІ С‚РµРєСѓС‰РµР№ Р¶РёРІРѕР№ Р»РµРЅС‚Рµ. РџРѕРїСЂРѕР±СѓР№С‚Рµ СЃРјРµРЅРёС‚СЊ Р»РѕРєР°С†РёСЋ РёР»Рё РѕС‚РєСЂС‹С‚СЊ РµРіРѕ Р·Р°РЅРѕРІРѕ СЃ РіР»Р°РІРЅРѕР№.
      </div>
    </section>
  </section>
</template>
