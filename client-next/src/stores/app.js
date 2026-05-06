import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { runtimeConfig } from "@/config/runtime"
import {
  authenticateClientToken,
  buyAgain,
  getAttributes,
  getBanner,
  getCuisineList,
  getLocationAutocomplete,
  getLocationDetails,
  getMerchantFeed,
  getMerchantInfo,
  getOrderHistory,
  getOrders,
  searchCatalog,
  searchSuggestion,
} from "@/services/tagamApi"

const PLACE_STORAGE_KEY = "tagam-next.place"
const PLACE_SEED_KEY = "tagam-next.place-seed"
const CLIENT_TOKEN_STORAGE_KEY = "tagam-next.client-token"
const RECENT_MERCHANTS_STORAGE_KEY = "tagam-next.recent-merchants"
const RECENT_SEARCHES_STORAGE_KEY = "tagam-next.recent-searches"

const HOME_COLLECTIONS = [
  { key: "burger", title: "Лучшие бургеры", query: "burger" },
  { key: "pizza", title: "Пицца, которую выбирают", query: "pizza" },
  { key: "coffee", title: "Кофе и завтраки", query: "coffee" },
]

function isJwtLikeToken(value) {
  const normalized = String(value || "").trim()
  return normalized.split(".").length === 3
}

function normalizeClientToken(value) {
  const normalized = String(value || "").trim()
  return isJwtLikeToken(normalized) ? normalized : ""
}

function readJson(key) {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJson(key, value) {
  if (typeof window === "undefined") {
    return
  }

  if (value === null || value === undefined) {
    window.localStorage.removeItem(key)
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function readText(key) {
  if (typeof window === "undefined") {
    return ""
  }

  return window.localStorage.getItem(key) || ""
}

function writeText(key, value) {
  if (typeof window === "undefined") {
    return
  }

  if (!value) {
    window.localStorage.removeItem(key)
    return
  }

  window.localStorage.setItem(key, value)
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizePlace(payload) {
  const details = payload?.details?.data || {}
  const address = details.address || {}
  const parsed = details.parsed_address || {}

  return {
    placeId: details.place_id || "",
    formattedAddress:
      address.formatted_address ||
      parsed.formatted_address ||
      details.reference ||
      "",
    completeAddress:
      address.complete_delivery_address ||
      parsed.place_text ||
      address.formatted_address ||
      "",
    city: parsed.city || "",
    state: parsed.state || "",
    country: parsed.country || address.country || "",
    coordinates: {
      lat: Number(details.latitude || 0),
      lng: Number(details.longitude || 0),
    },
  }
}

function normalizeBanners(payload) {
  return (payload?.details?.data || []).map((item) => ({
    id: item.banner_uuid || item.banner_id,
    title: item.title || item.meta_slug || "Banner",
    image: item.image || "",
    type: item.banner_type || "",
    url: item.url || "",
  }))
}

function normalizeBannerMerchantList(payload) {
  return Object.entries(payload?.details?.merchant_list || {}).map(([merchantId, merchant]) => ({
    key: String(merchant.restaurant_slug || merchantId || merchant.restaurant_name),
    merchantId: String(merchant.merchant_id || merchantId || ""),
    name: merchant.restaurant_name || "Restaurant",
    slug: merchant.restaurant_slug || "",
    image:
      merchant.featured_image ||
      merchant.url_cover ||
      merchant.url_banner ||
      merchant.url_logo ||
      "",
    minPrice: merchant.price_range || "",
    items: [],
    collectionTitles: [],
  }))
}

function normalizeMerchantFeedPayload(payload) {
  return (payload?.details?.data || []).map((merchant, index) => ({
    key: String(merchant.restaurant_slug || merchant.merchant_id || merchant.restaurant_name),
    merchantId: String(merchant.merchant_id || ""),
    name: merchant.restaurant_name || "Restaurant",
    slug: merchant.restaurant_slug || "",
    image:
      merchant.url_header ||
      merchant.url_banner ||
      merchant.featured_image ||
      merchant.url_logo ||
      "",
    headerImage:
      merchant.url_header ||
      merchant.url_banner ||
      merchant.featured_image ||
      "",
    logoImage:
      merchant.url_logo ||
      merchant.logo ||
      merchant.logo_url ||
      "",
    minPrice: merchant.price_range || "",
    collectionTitles: merchant.cuisine || [],
    distance: merchant.distance_pretty || merchant.distance_short || "",
    rating: merchant.reviews?.ratings || "",
    reviewCount: Number(merchant.reviews?.review_count || 0),
    available: merchant.available ?? merchant.open_status === 1,
    openStatus: Number(merchant.open_status ?? merchant.open_status_raw ?? 0),
    closeReason: merchant.close_reason || "",
    nextOpening: merchant.next_opening || "",
    freeDelivery: Boolean(merchant.free_delivery),
    promoCount: Array.isArray(merchant.promos)
      ? merchant.promos.length
      : Array.isArray(merchant.promo_list)
        ? merchant.promo_list.length
        : 0,
    services: Array.isArray(merchant.services) ? merchant.services : [],
    estimation: merchant.estimation || "",
    deliveryFee: Number(merchant.delivery_fee || 0),
    minimumOrder: Number(merchant.minimum_order || 0),
    savedStore: Number(merchant.saved_store || 0) === 1 || merchant.saved_store === true,
    sortIndex: index,
    items: [],
  }))
}

function normalizeCuisines(payload) {
  return (payload?.details?.data || []).map((item) => ({
    id: item.cuisine_id,
    title: item.cuisine_name || item.original_cuisine_name || item.slug,
    image: item.featured_image || item.url_icon || "",
    slug: item.slug || "",
  }))
}

function normalizeSearchPayload(query, payload) {
  const merchantMap = payload?.details?.merchant_list || {}
  const items = (payload?.details?.food_list || []).map((item) => {
    const merchant = merchantMap[String(item.merchant_id)] || {}

    return {
      id: item.item_uuid || item.item_id,
      name: item.item_name || "Item",
      description: stripHtml(item.item_description),
      image: item.url_image || "",
      price: item.lowest_price_label || item.lowest_price || "",
      merchantName: merchant.restaurant_name || "Restaurant",
      merchantSlug: merchant.restaurant_slug || item.slug || "",
      merchantId: item.merchant_id || "",
    }
  })

  const merchants = Object.entries(merchantMap).map(([merchantId, merchant]) => ({
    merchantId,
    name: merchant.restaurant_name || "Restaurant",
    slug: merchant.restaurant_slug || "",
  }))

  return {
    query,
    items,
    merchants,
  }
}

function normalizeOrders(payload) {
  return payload?.details?.data || []
}

function normalizeMerchantProfile(payload) {
  const data = payload?.details?.data || {}

  return {
    slug: data.restaurant_slug || "",
    headerImage:
      data.url_header ||
      data.cover_image ||
      data.merchant_cover ||
      data.cover ||
      data.url_cover ||
      data.url_banner ||
      "",
    logoImage:
      data.url_logo ||
      data.logo ||
      data.logo_url ||
      "",
    shortDescription: stripHtml(data.short_description || data.description || ""),
    deliveryEstimation: data.delivery_estimation || "",
    reviewCount: Number(data.review_count || 0),
    rating: data.ratings || "",
  }
}

function buildMerchantDirectory(collections, profiles = {}, seedMerchants = []) {
  const grouped = new Map()

  seedMerchants.forEach((merchant, index) => {
    const key = String(merchant.slug || merchant.merchantId || merchant.name)

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        merchantId: merchant.merchantId || "",
        name: merchant.name || "Restaurant",
        slug: merchant.slug || "",
        image: merchant.image || "",
        headerImage: merchant.headerImage || "",
        logoImage: merchant.logoImage || "",
        minPrice: merchant.minPrice || "",
        distance: merchant.distance || "",
        rating: merchant.rating || "",
        reviewCount: merchant.reviewCount || 0,
        available: merchant.available ?? false,
        openStatus: merchant.openStatus ?? 0,
        closeReason: merchant.closeReason || "",
        nextOpening: merchant.nextOpening || "",
        freeDelivery: Boolean(merchant.freeDelivery),
        promoCount: merchant.promoCount || 0,
        services: merchant.services || [],
        estimation: merchant.estimation || "",
        savedStore: Boolean(merchant.savedStore),
        sortIndex: merchant.sortIndex ?? index,
        items: [],
        collectionTitles: new Set(merchant.collectionTitles || []),
      })
    }
  })

  collections.forEach((collection) => {
    collection.items.forEach((item) => {
      const key = String(item.merchantSlug || item.merchantId || item.merchantName)

      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          merchantId: item.merchantId || "",
          name: item.merchantName || "Restaurant",
          slug: item.merchantSlug || "",
          image: item.image || "",
          headerImage: "",
          logoImage: "",
          minPrice: item.price || "",
          distance: "",
          rating: "",
          reviewCount: 0,
          available: false,
          openStatus: 0,
          closeReason: "",
          nextOpening: "",
          freeDelivery: false,
          promoCount: 0,
          services: [],
          estimation: "",
          deliveryFee: 0,
          minimumOrder: 0,
          savedStore: false,
          sortIndex: Number.MAX_SAFE_INTEGER,
          items: [],
          collectionTitles: new Set(),
        })
      }

      const entry = grouped.get(key)
      entry.items.push(item)
      entry.collectionTitles.add(collection.title)

      if (!entry.image && item.image) {
        entry.image = item.image
      }

      if (!entry.minPrice && item.price) {
        entry.minPrice = item.price
      }
    })
  })

  return Array.from(grouped.values())
    .map((entry) => ({
      ...entry,
      collectionTitles: Array.from(entry.collectionTitles),
      headerImage: profiles[entry.slug]?.headerImage || entry.headerImage || "",
      logoImage: profiles[entry.slug]?.logoImage || entry.logoImage || "",
      shortDescription: profiles[entry.slug]?.shortDescription || entry.shortDescription || "",
      estimation: profiles[entry.slug]?.deliveryEstimation || entry.estimation || "",
      reviewCount: profiles[entry.slug]?.reviewCount || entry.reviewCount || 0,
      rating: profiles[entry.slug]?.rating || entry.rating || "",
      available: entry.available ?? false,
      openStatus: entry.openStatus ?? 0,
      closeReason: entry.closeReason || "",
      nextOpening: entry.nextOpening || "",
      freeDelivery: Boolean(entry.freeDelivery),
      promoCount: entry.promoCount || 0,
      services: entry.services || [],
      deliveryFee: Number(entry.deliveryFee || 0),
      minimumOrder: Number(entry.minimumOrder || 0),
      savedStore: Boolean(entry.savedStore),
    }))
    .sort((left, right) => {
      if (left.sortIndex !== right.sortIndex) {
        return left.sortIndex - right.sortIndex
      }

      return right.items.length - left.items.length
    })
}

export const useAppStore = defineStore("app", () => {
  const hydrated = ref(false)
  const hydrationPending = ref(false)
  const dashboardLoading = ref(false)
  const locationLoading = ref(false)
  const locationSuggestions = ref([])
  const selectedPlace = ref(readJson(PLACE_STORAGE_KEY))
  const banners = ref([])
  const liveMerchants = ref([])
  const cuisines = ref([])
  const collections = ref([])
  const dashboardError = ref("")
  const searchResults = ref({ query: "", items: [], merchants: [] })
  const searchSuggestions = ref([])
  const searchLoading = ref(false)
  const searchError = ref("")
  const clientToken = ref(
    normalizeClientToken(readText(CLIENT_TOKEN_STORAGE_KEY)) ||
      normalizeClientToken(runtimeConfig.testClientToken),
  )
  const clientAuthenticated = ref(false)
  const recentMerchantSlugs = ref(readJson(RECENT_MERCHANTS_STORAGE_KEY) || [])
  const recentSearches = ref(readJson(RECENT_SEARCHES_STORAGE_KEY) || [])
  const orders = ref([])
  const ordersLoading = ref(false)
  const ordersError = ref("")
  const merchantProfiles = ref({})
  const moneyConfig = ref({})
  const defaultCurrencyCode = ref("")

  const city = computed(() => {
    return selectedPlace.value?.city || runtimeConfig.defaultCity
  })

  const selectedPlaceLabel = computed(() => {
    return (
      selectedPlace.value?.formattedAddress ||
      selectedPlace.value?.completeAddress ||
      runtimeConfig.defaultCity
    )
  })

  const totalLiveItems = computed(() =>
    collections.value.reduce((total, section) => total + section.items.length, 0),
  )

  const merchantDirectory = computed(() =>
    buildMerchantDirectory(collections.value, merchantProfiles.value, liveMerchants.value),
  )

  const recentMerchants = computed(() =>
    recentMerchantSlugs.value
      .map((slug) => merchantDirectory.value.find((entry) => entry.slug === slug))
      .filter(Boolean),
  )

  const favoriteMerchants = computed(() =>
    merchantDirectory.value.filter((entry) => entry.savedStore).slice(0, 6),
  )

  const reorderableOrders = computed(() => {
    const seen = new Set()

    return orders.value
      .map((order) => {
        const merchantId = String(order.merchant_id || order.merchantId || "")
        const merchant =
          merchantDirectory.value.find((entry) => String(entry.merchantId || "") === merchantId) ||
          null

        return {
          key: order.order_uuid || order.order_id,
          orderUuid: order.order_uuid || "",
          merchantId,
          merchantName: order.restaurant_name || merchant?.name || "Restaurant",
          merchantSlug: merchant?.slug || "",
          totalLabel: stripHtml(order.total || ""),
          dateLabel: stripHtml(order.date_created || ""),
          merchant,
        }
      })
      .filter((order) => {
        if (!order.orderUuid || seen.has(order.merchantId)) {
          return false
        }

        seen.add(order.merchantId)
        return true
      })
      .slice(0, 4)
  })

  const canLoadOrders = computed(() => Boolean(clientAuthenticated.value && clientToken.value))

  async function ensureClientSession() {
    const candidates = [
      normalizeClientToken(clientToken.value),
      normalizeClientToken(readText(CLIENT_TOKEN_STORAGE_KEY)),
      normalizeClientToken(runtimeConfig.testClientToken),
    ].filter(Boolean)

    for (const candidate of [...new Set(candidates)]) {
      try {
        await authenticateClientToken(candidate)
        clientToken.value = candidate
        clientAuthenticated.value = true
        writeText(CLIENT_TOKEN_STORAGE_KEY, candidate)
        return true
      } catch {
        // try next token candidate
      }
    }

    clientToken.value = ""
    clientAuthenticated.value = false
    writeText(CLIENT_TOKEN_STORAGE_KEY, "")
    return false
  }

  async function hydrate() {
    if (hydrated.value || hydrationPending.value) {
      return
    }

    hydrationPending.value = true

    try {
      const expectedPlaceSeed = runtimeConfig.defaultCity.trim().toLowerCase()
      const currentPlaceSeed = readText(PLACE_SEED_KEY).trim().toLowerCase()

      if (currentPlaceSeed !== expectedPlaceSeed) {
        selectedPlace.value = null
        writeJson(PLACE_STORAGE_KEY, null)
      }

      if (!selectedPlace.value?.placeId) {
        await resolveDefaultLocation()
      }

      if (selectedPlace.value?.placeId) {
        await ensureClientSession()
        await loadDashboard()
        writeText(PLACE_SEED_KEY, expectedPlaceSeed)
        if (clientAuthenticated.value) {
          await loadOrders("recent")
        }
      }

      hydrated.value = true
    } finally {
      hydrationPending.value = false
    }
  }

  async function resolveDefaultLocation() {
    locationLoading.value = true

    try {
      const result = await getLocationAutocomplete(runtimeConfig.defaultCity)
      const firstMatch = result?.details?.data?.[0]

      if (!firstMatch) {
        return
      }

      await selectLocationSuggestion(firstMatch, false)
    } finally {
      locationLoading.value = false
    }
  }

  async function fetchLocationSuggestions(query) {
    if (!query || query.trim().length < 2) {
      locationSuggestions.value = []
      return
    }

    locationLoading.value = true

    try {
      const result = await getLocationAutocomplete(query.trim())
      locationSuggestions.value = result?.details?.data || []
    } catch {
      locationSuggestions.value = []
    } finally {
      locationLoading.value = false
    }
  }

  async function selectLocationSuggestion(suggestion, reloadDashboard = true) {
    if (!suggestion?.id) {
      return
    }

    locationLoading.value = true

    try {
      const result = await getLocationDetails(suggestion.id, suggestion.description || "")
      selectedPlace.value = normalizePlace(result)
      writeJson(PLACE_STORAGE_KEY, selectedPlace.value)
      locationSuggestions.value = []

      if (reloadDashboard) {
        await loadDashboard()
      }
    } finally {
      locationLoading.value = false
    }
  }

  async function loadDashboard() {
    if (!selectedPlace.value?.placeId) {
      return
    }

    dashboardLoading.value = true
    dashboardError.value = ""

    try {
      const [attributesPayload, bannerPayload, merchantFeedPayload, cuisinePayload, ...collectionPayloads] = await Promise.all([
        getAttributes(""),
        getBanner({
          latitude: selectedPlace.value.coordinates?.lat,
          longitude: selectedPlace.value.coordinates?.lng,
        }),
        getMerchantFeed({
          list_type: "all",
          sort_by: "",
          enabled_review: true,
          currency_code: "",
          payload: ["cuisine", "reviews", "estimation", "services", "items_min_max", "offers", "promo"],
          filters: {
            transaction_type: "delivery",
          },
          page: 1,
          coordinates: {
            lat: selectedPlace.value.coordinates?.lat,
            lng: selectedPlace.value.coordinates?.lng,
          },
        }, clientAuthenticated.value ? clientToken.value : ""),
        getCuisineList(12, ""),
        ...HOME_COLLECTIONS.map((section) =>
          searchCatalog(section.query, selectedPlace.value.placeId, ""),
        ),
      ])

      moneyConfig.value = attributesPayload?.details?.money_config || {}
      defaultCurrencyCode.value = attributesPayload?.details?.default_currency_code || ""
      banners.value = normalizeBanners(bannerPayload)
      liveMerchants.value = normalizeMerchantFeedPayload(merchantFeedPayload)

      if (!liveMerchants.value.length) {
        liveMerchants.value = normalizeBannerMerchantList(bannerPayload)
      }

      cuisines.value = normalizeCuisines(cuisinePayload)
      collections.value = HOME_COLLECTIONS.map((section, index) => ({
        key: section.key,
        title: section.title,
        query: section.query,
        ...normalizeSearchPayload(section.query, collectionPayloads[index]),
      })).filter((section) => section.items.length > 0)

      await prefetchMerchantProfiles()
    } catch (error) {
      dashboardError.value = error?.message || String(error)
      liveMerchants.value = []
      collections.value = []
    } finally {
      dashboardLoading.value = false
    }
  }

  async function runSearch(query) {
    if (!query || !selectedPlace.value?.placeId) {
      searchResults.value = { query: "", items: [], merchants: [] }
      return
    }

    searchLoading.value = true
    searchError.value = ""

    try {
      const result = await searchCatalog(query, selectedPlace.value.placeId, "")
      searchResults.value = normalizeSearchPayload(query, result)
    } catch (error) {
      searchError.value = error?.message || String(error)
      searchResults.value = { query, items: [], merchants: [] }
    } finally {
      searchLoading.value = false
    }
  }

  async function fetchSearchSuggestions(query) {
    if (!query || query.trim().length < 2) {
      searchSuggestions.value = []
      return
    }

    try {
      const result = await searchSuggestion(query.trim())
      searchSuggestions.value = result?.details?.data || []
    } catch {
      searchSuggestions.value = []
    }
  }

  function setClientToken(token) {
    clientToken.value = normalizeClientToken(token)
    clientAuthenticated.value = false
    writeText(CLIENT_TOKEN_STORAGE_KEY, clientToken.value)
  }

  function recordMerchantVisit(slug) {
    const normalized = String(slug || "").trim()

    if (!normalized) {
      return
    }

    recentMerchantSlugs.value = [
      normalized,
      ...recentMerchantSlugs.value.filter((item) => item !== normalized),
    ].slice(0, 6)

    writeJson(RECENT_MERCHANTS_STORAGE_KEY, recentMerchantSlugs.value)
  }

  function recordSearch(query) {
    const normalized = String(query || "").trim()

    if (!normalized) {
      return
    }

    recentSearches.value = [
      normalized,
      ...recentSearches.value.filter((item) => item !== normalized),
    ].slice(0, 8)

    writeJson(RECENT_SEARCHES_STORAGE_KEY, recentSearches.value)
  }

  async function loadOrders(orderType = "recent") {
    const hasSession = await ensureClientSession()

    if (!hasSession) {
      orders.value = []
      ordersError.value = "Valid client token required"
      return
    }

    ordersLoading.value = true
    ordersError.value = ""

    try {
      const result = await getOrders(clientToken.value, orderType, 0)
      let normalized = normalizeOrders(result)

      if (!normalized.length) {
        const history = await getOrderHistory(clientToken.value, 1, "", "past_order")
        normalized = normalizeOrders(history)
      }

      orders.value = normalized
    } catch (error) {
      orders.value = []
      ordersError.value = error?.message || String(error)
    } finally {
      ordersLoading.value = false
    }
  }

  async function loadMerchantProfile(slug) {
    if (!slug || merchantProfiles.value[slug]) {
      return merchantProfiles.value[slug] || null
    }

    try {
      const payload = await getMerchantInfo(slug, selectedPlace.value?.coordinates)
      const profile = normalizeMerchantProfile(payload)

      merchantProfiles.value = {
        ...merchantProfiles.value,
        [slug]: profile,
      }

      return profile
    } catch {
      merchantProfiles.value = {
        ...merchantProfiles.value,
        [slug]: {
          slug,
          headerImage: "",
          logoImage: "",
        },
      }

      return merchantProfiles.value[slug]
    }
  }

  async function prefetchMerchantProfiles() {
    const topSlugs = buildMerchantDirectory(collections.value, merchantProfiles.value, liveMerchants.value)
      .map((merchant) => merchant.slug)
      .filter(Boolean)
      .slice(0, 8)

    await Promise.all(topSlugs.map((slug) => loadMerchantProfile(slug)))
  }

  async function repeatOrder(orderUuid) {
    const hasSession = await ensureClientSession()

    if (!hasSession) {
      throw new Error("Valid client token required")
    }

    return buyAgain(clientToken.value, orderUuid)
  }

  return {
    hydrated,
    hydrationPending,
    dashboardLoading,
    locationLoading,
    locationSuggestions,
    selectedPlace,
    banners,
    liveMerchants,
    cuisines,
    collections,
    dashboardError,
    searchResults,
    searchSuggestions,
    searchLoading,
    searchError,
    clientToken,
    clientAuthenticated,
    orders,
    ordersLoading,
    ordersError,
    merchantProfiles,
    moneyConfig,
    defaultCurrencyCode,
    recentSearches,
    recentMerchants,
    favoriteMerchants,
    reorderableOrders,
    city,
    selectedPlaceLabel,
    totalLiveItems,
    merchantDirectory,
    canLoadOrders,
    hydrate,
    fetchLocationSuggestions,
    selectLocationSuggestion,
    loadDashboard,
    runSearch,
    fetchSearchSuggestions,
    setClientToken,
    ensureClientSession,
    recordMerchantVisit,
    recordSearch,
    loadOrders,
    loadMerchantProfile,
    repeatOrder,
  }
})
