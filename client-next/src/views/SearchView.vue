<script setup>
import { onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAppStore } from "@/stores/app"

const store = useAppStore()
const route = useRoute()
const router = useRouter()
const query = ref("")
let suggestionTimer = null

async function submitSearch(value = query.value) {
  const normalized = value.trim()

  await router.replace({
    path: "/search",
    query: normalized ? { q: normalized } : {},
  })

  if (normalized) {
    store.recordSearch(normalized)
  }

  await store.runSearch(normalized)
}

async function useSuggestion(suggestion) {
  query.value = suggestion.name
  store.searchSuggestions = []
  await submitSearch(suggestion.name)
}

watch(query, (value) => {
  window.clearTimeout(suggestionTimer)
  suggestionTimer = window.setTimeout(() => {
    store.fetchSearchSuggestions(value)
  }, 260)
})

watch(
  () => route.query.q,
  async (value) => {
    const normalized = String(value || "").trim()

    if (!normalized) {
      return
    }

    if (normalized !== query.value) {
      query.value = normalized
    }

    await store.runSearch(normalized)
  },
)

onMounted(async () => {
  const initialQuery = String(route.query.q || "").trim()

  if (initialQuery) {
    query.value = initialQuery
    await store.runSearch(initialQuery)
  }
})
</script>

<template>
  <section class="app-page">
    <section class="section-card search-stage">
      <div class="section-head">
        <div>
          <div class="section-title">Search the feed</div>
          <div class="section-copy">
            Explore live dishes and merchants for {{ store.selectedPlaceLabel }}.
          </div>
        </div>
      </div>

      <form class="search-submit-row" @submit.prevent="submitSearch()">
        <label class="search-field">
          <span class="search-field__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M11 4.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9Zm6.9 9.5 3.3 3.3-1.4 1.4-3.3-3.3z"
                fill="currentColor"
              />
            </svg>
          </span>
          <input v-model="query" type="text" placeholder="Search burgers, pizza, sushi..." />
        </label>
        <button class="search-submit-button" type="submit">Search</button>
      </form>

      <div v-if="store.searchSuggestions.length" class="chip-row">
        <button
          v-for="item in store.searchSuggestions"
          :key="item.name"
          class="tag-chip"
          type="button"
          @click="useSuggestion(item)"
        >
          {{ item.name }}
        </button>
      </div>
    </section>

    <section class="section-card">
      <div class="section-head">
        <div>
          <div class="section-title">Results</div>
          <div class="section-copy">
            Live results for the current delivery zone.
          </div>
        </div>
      </div>

      <div v-if="store.searchLoading" class="helper-copy">Loading live results...</div>
      <div v-else-if="store.searchError" class="helper-copy">{{ store.searchError }}</div>
      <div
        v-else-if="store.searchResults.query && !store.searchResults.items.length"
        class="helper-copy"
      >
        No items found for "{{ store.searchResults.query }}".
      </div>
      <div v-else-if="!store.searchResults.query" class="helper-copy">
        Start with a dish, cuisine, or restaurant name.
      </div>

      <div v-else class="list-stack">
        <article v-for="item in store.searchResults.items" :key="item.id" class="feed-row">
          <img class="feed-row__cover feed-row__cover--image" :src="item.image" :alt="item.name" />
          <div class="feed-row__body">
            <div class="feed-row__top">
              <h3>{{ item.name }}</h3>
              <span>{{ item.price }}</span>
            </div>
            <p>{{ item.description || "Live menu item" }}</p>
            <div class="feed-row__meta">
              <span>{{ item.merchantName }}</span>
              <span>{{ item.merchantSlug }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>
