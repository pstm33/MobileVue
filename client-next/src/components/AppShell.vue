<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { RouterLink, RouterView, useRoute } from "vue-router"
import { useAppStore } from "@/stores/app"
import { runtimeConfig } from "@/config/runtime"

const store = useAppStore()
const route = useRoute()

const locationSheetOpen = ref(false)
const locationQuery = ref("")
let locationSearchTimer = null

const navigation = [
  {
    to: "/",
    label: "Главная",
    icon: "M4 11.8 12 5l8 6.8V20a1 1 0 0 1-1 1h-4.8a1 1 0 0 1-1-1v-4.6h-2.4V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z",
  },
  {
    to: "/search",
    label: "Поиск",
    icon: "M11 4.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9Zm6.9 9.5 3.3 3.3-1.4 1.4-3.3-3.3z",
  },
  {
    to: "/orders",
    label: "Заказы",
    icon: "M7 4h10a2 2 0 0 1 2 2v12.5a1.5 1.5 0 0 1-2.5 1.1L12 16l-4.5 3.6A1.5 1.5 0 0 1 5 18.5V6a2 2 0 0 1 2-2Zm1 3v2h8V7Zm0 4v2h6v-2Z",
  },
  {
    to: "/account",
    label: "Профиль",
    icon: "M12 4.7a3.8 3.8 0 1 1 0 7.6a3.8 3.8 0 0 1 0-7.6Zm0 9.3c4.1 0 7.5 2.4 8.5 5.8c.1.4-.2.8-.7.8H4.2a.7.7 0 0 1-.7-.8c1-3.4 4.4-5.8 8.5-5.8Z",
  },
]

const currentLabel = computed(() => {
  return navigation.find((item) => item.to === route.path)?.label || "Главная"
})

const showPageHeading = computed(() => route.path !== "/" && route.name !== "merchant")

const liveMeta = computed(() => {
  if (store.dashboardLoading) {
    return "Загружаем живые данные..."
  }

  if (store.totalLiveItems > 0) {
    return `${store.totalLiveItems} позиций в ленте`
  }

  return "Выберите локацию для живого каталога"
})

function handleBeforeInstallPrompt(event) {
  event.preventDefault()
}

function openLocationSheet() {
  locationQuery.value = store.selectedPlaceLabel || runtimeConfig.defaultCity
  locationSheetOpen.value = true
  store.fetchLocationSuggestions(locationQuery.value)
}

async function chooseLocation(suggestion) {
  await store.selectLocationSuggestion(suggestion)
  locationSheetOpen.value = false
}

watch(locationQuery, (value) => {
  window.clearTimeout(locationSearchTimer)
  locationSearchTimer = window.setTimeout(() => {
    store.fetchLocationSuggestions(value)
  }, 280)
})

onMounted(() => {
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  store.hydrate()
})

onBeforeUnmount(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  window.clearTimeout(locationSearchTimer)
})
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <div class="topbar__title">{{ runtimeConfig.appName }}</div>
      </div>

      <div class="topbar__actions">
        <button class="status-pill status-pill--button" type="button" @click="openLocationSheet">
          {{ store.city }}
        </button>
      </div>
    </header>

    <main class="app-shell__body">
      <div v-if="showPageHeading" class="page-heading">
        <span class="page-heading__chip">{{ currentLabel }}</span>
        <span class="page-heading__meta">{{ liveMeta }}</span>
      </div>

      <RouterView />
    </main>

    <nav class="bottom-nav">
      <RouterLink
        v-for="item in navigation"
        :key="item.to"
        :to="item.to"
        class="bottom-nav__link"
        :class="{ 'is-active': route.path === item.to }"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="item.icon" />
        </svg>
        <span>{{ item.label }}</span>
        <strong
          v-if="item.to === '/orders' && store.canLoadOrders"
          class="bottom-nav__badge"
        >
          live
        </strong>
      </RouterLink>
    </nav>

    <div v-if="locationSheetOpen" class="sheet-backdrop" @click.self="locationSheetOpen = false">
      <section class="location-sheet">
        <div class="location-sheet__head">
          <div>
            <div class="section-title">Выберите локацию</div>
            <div class="section-copy">Живые данные зависят от выбранного места.</div>
          </div>

          <button class="sheet-close" type="button" @click="locationSheetOpen = false">Закрыть</button>
        </div>

        <label class="search-field">
          <span class="search-field__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M11 4.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9Zm6.9 9.5 3.3 3.3-1.4 1.4-3.3-3.3z"
                fill="currentColor"
              />
            </svg>
          </span>
          <input v-model="locationQuery" type="text" placeholder="Ищите адрес или город" />
        </label>

        <div class="location-sheet__results">
          <button
            v-for="suggestion in store.locationSuggestions"
            :key="suggestion.id"
            type="button"
            class="location-option"
            @click="chooseLocation(suggestion)"
          >
            <strong>{{ suggestion.addressLine1 }}</strong>
            <span>{{ suggestion.description }}</span>
          </button>

          <div v-if="store.locationLoading" class="helper-copy">Загружаем локации...</div>
          <div
            v-else-if="locationQuery.trim().length >= 2 && !store.locationSuggestions.length"
            class="helper-copy"
          >
            Пока ничего не нашли. Попробуйте указать адрес точнее.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
