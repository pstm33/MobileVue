<template>
  <q-pull-to-refresh
    @refresh="refresh"
    color="primary"
    :bg-color="$q.dark.isActive ? 'dark' : 'white'"
  >
    <q-header class="text-dark tagam-app-header">
      <InstallPwa></InstallPwa>
    </q-header>

    <q-page class="tagam-home-page">
      <q-scroll-observer @scroll="onScroll" />

      <q-page-sticky
        position="top"
        expand
        :offset="[0, 0]"
        class="tagam-home-sticky-shell"
      >
        <TagamTopHeader
          :cart-count="CartStore.getCartCount"
          :sticky="false"
          class="tagam-home-sticky-header"
        />
      </q-page-sticky>

      <div class="tagam-home-sticky-spacer"></div>

      <div
        v-if="isCuisinePinned"
        class="tagam-cuisine-floating tagam-glass-card"
      >
        <div class="tagam-cuisine-floating__head">
          <div class="tagam-cuisine-floating__title-row">
            <div class="tagam-cuisine-floating__eyebrow">{{ $t("Cuisines") }}</div>
            <div class="tagam-cuisine-floating__meta">
              {{ $t("Filter for restaurant list") }}
            </div>
          </div>

          <q-btn
            v-if="hasActiveCuisine"
            flat
            dense
            no-caps
            class="tagam-cuisine-reset-btn"
            :label="$t('Reset')"
            @click="clearCuisineFilter"
          />
        </div>

        <CuisineCarousel
          ref="cuisine_carousel_floating"
          :design="1"
          :search_mode="searchMode"
          @after-getdata="afterGetdata"
          @select-cuisine="filterByCuisine"
          class="tagam-cuisine-block"
        />
      </div>

      <div class="tagam-home-content">
      <div class="tagam-header-inner">
        <div class="tagam-topbar">
          <div
            class="tagam-location-card"
            @click="this.$refs.ref_address.modal = true"
          >
            <div class="tagam-location-card__pin">
              <q-icon color="primary" name="near_me"></q-icon>
            </div>
            <div class="tagam-location-card__content">
              <div class="tagam-location-card__value ellipsis">
                <template v-if="searchMode == 'location'">
                  {{ DataStorePersisted.getLocationAddress }}
                </template>
                <template v-else>
                  {{
                    DataStorePersisted.hasPlaceData
                      ? DataStorePersisted.place_data.formatted_address
                      : $t("Select your location")
                  }}
                </template>
              </div>
            </div>
          </div>

          <div class="tagam-search-row">
            <router-link :to="getSearchLink" class="tagam-search-link">
              <div class="tagam-search-box">
                <div class="tagam-search-box__lead">
                  <q-icon
                    color="grey-6"
                    name="eva-search-outline"
                    size="20px"
                  />
                  <div class="tagam-search-box__eyebrow">
                    {{ $t("Search food and restaurants") }}
                  </div>
                </div>
              </div>
            </router-link>

            <div class="tagam-search-row__filter">
              <FeedFilter
                ref="ref_feed_filter"
                compact
                @after-applyfilter="afterApplyfilter"
                @filter-unmount="filterUnmount"
                :search_mode="searchMode"
                :saved_filter="DataStore.filter_home"
              ></FeedFilter>
            </div>
          </div>
        </div>
      </div>

      <template v-if="!hasFilters">
        <section class="tagam-section-shell tagam-highlights-shell">
          <div class="tagam-highlights-head">
            <div class="tagam-section-heading__eyebrow">
              {{ $t("Curated Picks") }}
            </div>
          </div>

          <div class="tagam-highlight-tabs-wrap">
            <div
              ref="highlightTabs"
              class="tagam-highlight-tabs"
              @scroll="onHighlightTabsScroll"
            >
              <q-btn
                no-caps
                unelevated
                class="tagam-highlight-tab"
                :class="{ 'is-active': highlightsTab === 'banner' }"
                @click="highlightsTab = 'banner'"
              >
                {{ $t("Deals") }}
              </q-btn>
              <q-btn
                no-caps
                unelevated
                class="tagam-highlight-tab"
                :class="{ 'is-active': highlightsTab === 'featured' }"
                @click="highlightsTab = 'featured'"
              >
                {{ $t("Recommended") }}
              </q-btn>
              <q-btn
                no-caps
                unelevated
                class="tagam-highlight-tab"
                :class="{ 'is-active': highlightsTab === 'popular' }"
                @click="highlightsTab = 'popular'"
              >
                {{ $t("Popular") }}
              </q-btn>
              <q-btn
                no-caps
                unelevated
                class="tagam-highlight-tab"
                :class="{ 'is-active': highlightsTab === 'nearby' }"
                @click="highlightsTab = 'nearby'"
              >
                {{ $t("Nearby") }}
              </q-btn>
            </div>

            <div
              v-if="canScrollLeft"
              class="tagam-highlight-tabs-hint tagam-highlight-tabs-hint--left"
              aria-hidden="true"
              @click="scrollHighlightTabs('left')"
            >
              <q-icon name="eva-arrow-back-outline" size="18px" />
            </div>

            <div
              v-if="canScrollRight"
              class="tagam-highlight-tabs-hint tagam-highlight-tabs-hint--right"
              aria-hidden="true"
              @click="scrollHighlightTabs('right')"
            >
              <q-icon name="eva-arrow-forward-outline" size="18px" />
            </div>

            <div
              v-if="canScrollLeft"
              class="tagam-highlight-tabs-fade tagam-highlight-tabs-fade--left"
              aria-hidden="true"
            ></div>
            <div
              v-if="canScrollRight"
              class="tagam-highlight-tabs-fade tagam-highlight-tabs-fade--right"
              aria-hidden="true"
            ></div>
          </div>

          <div v-if="highlightsTab === 'banner'" class="q-mt-md tagam-highlights-stage">
            <HomeBanner
              ref="home_banner"
              :filters="DataStore.filters"
              :search_mode="searchMode"
            />
          </div>

          <div v-else-if="highlightsTab === 'featured'" class="q-mt-md tagam-highlights-stage">
            <FeaturedItems
              ref="ref_featured_items"
              :title="$t('Recommended')"
              hide-title
              :preview-items="selectionPreviewFoodItems"
            ></FeaturedItems>
          </div>

          <div v-else-if="highlightsTab === 'popular'" class="q-mt-md tagam-highlights-stage">
            <component
              :is="MerchantCarousel"
              ref="merchantRefCarousel2"
              list_type="featured"
              featured_id="popular"
              :filters="DataStore.filters"
              :index="1"
              title=""
              :coordinates="DataStorePersisted.coordinates"
              :location_data="DataStorePersisted.getLocation"
              :preview_items="selectionPopularItems"
            />
          </div>

          <div v-else-if="highlightsTab === 'nearby'" class="q-mt-md tagam-highlights-stage">
            <component
              :is="MerchantCarousel"
              ref="merchantRefCarousel3"
              list_type="featured"
              featured_id="nearby"
              :filters="DataStore.filters"
              :index="2"
              title=""
              :coordinates="DataStorePersisted.coordinates"
              :location_data="DataStorePersisted.getLocation"
              :preview_items="selectionNearbyItems"
            />
          </div>
        </section>

        <div class="tagam-cuisine-sentinel"></div>

        <div class="q-mt-md">
          <div class="tagam-section-shell tagam-cuisine-shell tagam-cuisine-sticky-wrap">
          <div class="tagam-cuisine-shell__head">
            <div class="tagam-cuisine-shell__title-row">
              <div class="tagam-section-heading__eyebrow">{{ $t("Cuisines") }}</div>
              <div class="tagam-cuisine-section__meta">
                {{ $t("Filter for restaurant list") }}
              </div>
            </div>
            <template v-if="DataStore.loading_cuisine">
              <q-skeleton type="text" style="width: 60px" />
            </template>
            <q-btn
              v-else-if="hasActiveCuisine"
              flat
              dense
              no-caps
              class="tagam-cuisine-reset-btn"
              :label="$t('Reset')"
              @click="clearCuisineFilter"
            />
          </div>

            <CuisineCarousel
              ref="cuisine_carousel"
              :design="1"
              :search_mode="searchMode"
              @after-getdata="afterGetdata"
              @select-cuisine="filterByCuisine"
              class="tagam-cuisine-block"
            />
          </div>
        </div>

        <div class="ref_sticky_target"></div>
      </template>

      <section class="tagam-section-shell tagam-restaurants-shell q-mt-md">
        <div class="tagam-restaurants-heading">
          <div class="tagam-restaurants-heading__main">
            <div class="tagam-section-heading__eyebrow">
              {{ $t("Restaurants") }}
            </div>
            <div v-if="restaurantsHeading" class="tagam-restaurants-heading__title">
              {{ restaurantsHeading }}
            </div>
          </div>
          <div class="tagam-restaurants-heading__count">
            {{ restaurantsCount }} {{ restaurantCountLabel }}
          </div>
        </div>
        <div class="tagam-restaurants-shell__content">
          <FeedResults
            ref="ref_feed_results"
            title=""
            :filters="DataStore.feed_filter"
            :full_page="hasFilters"
            :no_data_label="
              $t('No restaurants available in this category in your area.')
            "
            :currency_code="DataStorePersisted.useCurrency"
            :coordinates="DataStorePersisted.coordinates"
            :location_data="DataStorePersisted.getLocation"
            :search_mode="searchMode"
            :islogin="isLogin"
            @after-results="afterResults"
          />
        </div>
      </section>

      <component
        :is="AddressRecent"
        ref="ref_address"
        :map_provider="
          DataStore.maps_config ? DataStore.maps_config.provider : null
        "
        :recent_addresses="DataStorePersisted.recent_addresses"
        :is_login="userData ? true : false"
        @after-chooseaddress="afterChooseaddress"
        @after-chooselocation="afterChooselocation"
      ></component>
      </div>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import {
  defineAsyncComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
  watch,
  getCurrentInstance,
  nextTick,
} from "vue";
import APIinterface from "src/api/APIinterface";
import { useRouter } from "vue-router";
import auth from "src/api/auth";
import { useDataStore } from "stores/DataStore";
import { useDeliveryschedStore } from "stores/DeliverySched";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useCartStore } from "src/stores/CartStore";
import { useClientStore } from "stores/ClientStore";
import { useMenuStore } from "stores/MenuStore";

export default {
  name: "HomePage",
  components: {
    HomeBanner: defineAsyncComponent(() => import("components/HomeBanner.vue")),
    TagamTopHeader: defineAsyncComponent(() =>
      import("components/TagamTopHeader.vue")
    ),
    CuisineCarousel: defineAsyncComponent(() =>
      import("components/CuisineCarousel.vue")
    ),
    FeaturedItems: defineAsyncComponent(() =>
      import("components/FeaturedItems.vue")
    ),
    TopButtons: defineAsyncComponent(() => import("components/TopButtons.vue")),
    FeedFilter: defineAsyncComponent(() => import("components/FeedFilter.vue")),
    FeedResults: defineAsyncComponent(() =>
      import("components/FeedResults.vue")
    ),
    InstallPwa: defineAsyncComponent(() => import("components/InstallPwa.vue")),
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const transactionType = APIinterface.getStorage("transaction_type");
    const PlaceId = APIinterface.getStorage("place_id");
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const ClientStore = useClientStore();
    const CartStore = useCartStore();
    const MenuStore = useMenuStore();

    const filters = ref({
      transaction_type: transactionType,
    });

    const topResto = ref("popular");
    const highlightsTab = ref("featured");
    const featuredTab = ref("all");
    const featured = ref([]);
    const q = ref("");
    const slide = ref(1);
    const cuisineList = ref([]);
    const $router = useRouter();
    const hasResult = ref(true);
    const merchant_filter = ref(undefined);

    const merchantList = ref(null);
    const merchantRefCarousel = ref(null);
    const merchantRefCarousel2 = ref(null);
    const merchantRefCarousel3 = ref(null);
    const previewFeedItems = ref([]);
    const previewFoodItems = ref([]);
    const userData = ref([]);
    const isSticky = ref(false);
    const isScrolled = ref(false);
    const isCuisinePinned = ref(false);
    const canScrollLeft = ref(false);
    const canScrollRight = ref(false);

    const active_filers = ref(null);
    const highlightTabs = ref(null);

    useDeliveryschedStore();
    let observer = null;
    let cuisineObserver = null;
    let lastScrollY = window.scrollY;

    const searchMode = DataStore.getSearchMode;

    const AddressRecent = defineAsyncComponent(() =>
      searchMode == "location"
        ? import("components/AddressRecentLocation.vue")
        : import("components/AddressRecent.vue")
    );

    const MerchantCarousel = defineAsyncComponent(() =>
      searchMode == "location"
        ? import("components/MerchantCarouselLocation.vue")
        : import("components/MerchantCarousel.vue")
    );

    onMounted(() => {
      if (auth.authenticated()) {
        userData.value = auth.getUser();
      } else {
        userData.value = false;
      }

      if (searchMode == "address") {
        active_filers.value = {
          coordinates: DataStorePersisted.coordinates,
          islogin: isLogin.value,
        };
      } else if (searchMode == "location") {
        active_filers.value = {
          location_data: DataStorePersisted.getLocation,
          islogin: isLogin.value,
        };
      }

      if (DataStore.homepage_filters) {
        if (
          JSON.stringify(active_filers.value) ==
          JSON.stringify(DataStore.homepage_filters)
        ) {
          console.log("home same filter");
        } else {
          console.log("home new filter");
          setTimeout(() => {
            merchantRefCarousel.value?.refreshData?.();
            merchantRefCarousel2.value?.refreshData?.();
            DataStore.featured_items = null;
            ref_featured_items.value.loadData();
          }, 500);
        }
      }

      DataStore.feed_page_filter = {};
      DataStore.clearPageFilter();

      if (Object.keys(DataStore.feed_filter).length <= 0) {
        DataStore.feed_filter = {
          list_type: "all",
          sort_by: DataStore.filter_sortby,
          enabled_review: DataStore.enabled_review,
          currency_code: DataStorePersisted.useCurrency,
          payload: [
            "cuisine",
            "reviews",
            "estimation",
            "services",
            "items_min_max",
            "offers",
            "promo",
          ],
        };
      }

      const target = document.querySelector(".ref_sticky_target");
      setupObserver(target);

      const cuisineTarget = document.querySelector(".tagam-cuisine-sentinel");
      setupCuisineObserver(cuisineTarget);

      setTimeout(() => {
        updateHighlightTabsState();
        buildPreviewFoodItems([]);
      }, 0);

      loadSelectionsData();
      window.addEventListener("resize", updateHighlightTabsState);
    });

    onBeforeUnmount(() => {
      if (observer) {
        observer.disconnect();
      }

      if (cuisineObserver) {
        cuisineObserver.disconnect();
      }

      window.removeEventListener("resize", updateHighlightTabsState);

      if (searchMode == "address") {
        DataStore.homepage_filters = {
          coordinates: DataStorePersisted.coordinates,
          islogin: isLogin.value,
        };
      } else if (searchMode == "location") {
        DataStore.homepage_filters = {
          location_data: DataStorePersisted.getLocation,
          islogin: isLogin.value,
        };
      }
    });

    watch(
      () => DataStore.food_list,
      () => {
        buildPreviewFoodItems(previewFeedItems.value);
      },
      { deep: true }
    );

    watch(
      () => previewFeedItems.value,
      (items) => {
        buildPreviewFoodItems(items);
      },
      { deep: true }
    );

    watch(
      () => DataStorePersisted.dark_mode,
      async () => {
        await nextTick();

        if (observer) {
          observer.disconnect();
        }
        if (cuisineObserver) {
          cuisineObserver.disconnect();
        }

        const target = document.querySelector(".ref_sticky_target");
        setupObserver(target);

        const cuisineTarget = document.querySelector(".tagam-cuisine-sentinel");
        setupCuisineObserver(cuisineTarget);
      }
    );

    const hasFilters = computed(() => {
      const pageFilters = DataStore.feed_filter?.filters || {};

      return !!(
        pageFilters?.transaction_type ||
        pageFilters?.offers_filters?.length > 0 ||
        pageFilters?.price_range ||
        pageFilters?.quick_filters?.length > 0
      );
    });

    const hasActiveCuisine = computed(() => {
      const pageFilters = DataStore.feed_filter?.filters || {};
      return (
        Array.isArray(pageFilters?.cuisine) && pageFilters.cuisine.length > 0
      );
    });

    const selectedCuisineName = computed(() => {
      const selectedCuisineIds = DataStore.feed_filter?.filters?.cuisine || [];
      const firstCuisineId = selectedCuisineIds[0];

      if (!firstCuisineId) {
        return "";
      }

      const matchedCuisine = (cuisineList.value || []).find(
        (item) => String(item?.cuisine_id) === String(firstCuisineId)
      );

      return (
        matchedCuisine?.cuisine_name ||
        matchedCuisine?.name ||
        matchedCuisine?.title ||
        ""
      );
    });

    const restaurantsCount = computed(() => {
      if (Array.isArray(hasResult.value)) {
        return hasResult.value.length;
      }

      if (Array.isArray(previewFeedItems.value)) {
        return previewFeedItems.value.length;
      }

      return 0;
    });

    const restaurantsHeading = computed(() => {
      return selectedCuisineName.value || "";
    });

    const restaurantCountLabel = computed(() => {
      return proxy.$t("establishments");
    });

    const highlightsMeta = computed(() => {
      if (highlightsTab.value === "banner") {
        return proxy.$t("Deals, promos, special offers");
      }

      if (highlightsTab.value === "featured") {
        return proxy.$t("Recommended dishes for you");
      }

      if (highlightsTab.value === "popular") {
        return proxy.$t("Popular near you");
      }

      if (highlightsTab.value === "new") {
        return proxy.$t("New restaurants on the platform");
      }

      return "";
    });

    const setupObserver = (target) => {
      observer = new IntersectionObserver(
        ([entry]) => {
          const isScrollingDown = window.scrollY > lastScrollY;

          if (!entry.isIntersecting && isScrollingDown) {
            isSticky.value = true;
          } else if (entry.isIntersecting) {
            isSticky.value = false;
            if (hasFilters.value) {
              isSticky.value = true;
            }
          }

          lastScrollY = window.scrollY;
        },
        {
          threshold: 0.5,
        }
      );

      if (target) {
        observer.observe(target);
      }
    };

    const setupCuisineObserver = (target) => {
      cuisineObserver = new IntersectionObserver(
        ([entry]) => {
          isCuisinePinned.value = !entry.isIntersecting;
        },
        {
          threshold: 0,
          rootMargin: "-14px 0px 0px 0px",
        }
      );

      if (target) {
        cuisineObserver.observe(target);
      }
    };

    const onScroll = (info) => {
      isScrolled.value = info.position.top > 140;
    };

    const updateHighlightTabsState = () => {
      const el = highlightTabs.value;
      if (!el) {
        canScrollLeft.value = false;
        canScrollRight.value = false;
        return;
      }

      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      canScrollLeft.value = el.scrollLeft > 4;
      canScrollRight.value = maxScrollLeft - el.scrollLeft > 4;
    };

    const onHighlightTabsScroll = () => {
      updateHighlightTabsState();
    };

    const scrollHighlightTabs = (direction) => {
      const el = highlightTabs.value;
      if (!el) {
        return;
      }

      const amount = Math.max(el.clientWidth * 0.72, 140);
      const left =
        direction === "left" ? el.scrollLeft - amount : el.scrollLeft + amount;

      el.scrollTo({
        left,
        behavior: "smooth",
      });
    };

    const ref_feed_results = ref(null);
    const home_banner = ref(null);
    const ref_featured_items = ref(null);

    const loadSelectionsData = () => {
      if (
        Object.keys(DataStore.banner || {}).length > 0 ||
        Object.keys(DataStore.food_list || {}).length > 0
      ) {
        return;
      }

      if (searchMode == "location") {
        DataStore.getBannerLocation({
          city_id: DataStorePersisted.getLocation?.city_id || "",
          state_id: DataStorePersisted.getLocation?.state_id || "",
          area_id: DataStorePersisted.getLocation?.area_id || "",
          postal_id: DataStorePersisted.getLocation?.postal_code || "",
        });
        return;
      }

      const coordinates = DataStorePersisted.coordinates;
      DataStore.getBanner({
        latitude: coordinates ? coordinates.lat : "",
        longitude: coordinates ? coordinates.lng : "",
      });
    };

    const afterApplyfilter = (data) => {
      DataStore.feed_filter.filters = data;
      DataStore.feed_filter.sort_by = data?.sort_by;
      ref_feed_results.value.resetData();
    };

    const filterUnmount = (data) => {
      DataStore.filter_home = data;
    };

    const afterGetdata = (data) => {
      cuisineList.value = data;
    };

    const scrollToFeedResults = () => {
      setTimeout(() => {
        const block = document.querySelector(".tagam-feed-results-section");
        if (block) {
          block.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    };

    const clearCuisineFilter = () => {
      const currentFilters = DataStore.feed_filter?.filters || {};

      DataStore.feed_filter = {
        ...DataStore.feed_filter,
        filters: {
          ...currentFilters,
          cuisine: [],
        },
      };

      ref_feed_results.value?.resetData?.();
      scrollToFeedResults();
    };

    const filterByCuisine = (items) => {
      const currentFilters = DataStore.feed_filter?.filters || {};

      if (!items) {
        clearCuisineFilter();
        return;
      }

      const currentCuisine = [...(currentFilters?.cuisine || [])];
      const clickedId = String(items.cuisine_id);

      const exists = currentCuisine.some((id) => String(id) === clickedId);

      const nextCuisine = exists
        ? currentCuisine.filter((id) => String(id) !== clickedId)
        : [...currentCuisine, items.cuisine_id];

      DataStore.feed_filter = {
        ...DataStore.feed_filter,
        filters: {
          ...currentFilters,
          cuisine: nextCuisine,
        },
      };

      ref_feed_results.value?.resetData?.();
      scrollToFeedResults();
    };

    const applyFilter = (data) => {
      hasResult.value = true;
      DataStore.filters = data;
    };

    const goSearch = () => {
      $router.push("/search");
    };

    const runFilter = () => {
      console.debug("runFilter");
    };

    const normalizePreviewFood = (items = []) =>
      items
        .filter((item) => item && (item.item_uuid || item.id || item.item_name))
        .map((item) => ({
          ...item,
          url_image:
            item.url_image ||
            item.photo_url ||
            item.image_url ||
            item.photo ||
            item.image ||
            item.url_photo_x2 ||
            item.url_photo ||
            item.featured_image,
          lowest_price:
            item.lowest_price || item.price || item.price_pretty || "",
          item_name: item.item_name || item.name || "",
          item_description: item.item_description || item.description || "",
          merchant_id: item.merchant_id || item.restaurant_slug || item.slug,
          is_eligible: item.is_eligible !== false,
        }));

    const shuffleItems = (items = []) =>
      [...items]
        .map((item) => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => item);

    const parseRatingValue = (restaurant) => {
      const ratingCandidates = [
        restaurant?.reviews?.ratings,
        restaurant?.ratings,
        restaurant?.review_count,
      ];

      for (const candidate of ratingCandidates) {
        const match = String(candidate ?? "").match(/(\d+[.,]?\d*)/);
        if (match?.[1]) {
          return Number(match[1].replace(",", "."));
        }
      }

      return 0;
    };

    const parseDistanceValue = (restaurant) => {
      const distanceCandidates = [
        restaurant?.distance?.label,
        restaurant?.distance_short,
        restaurant?.estimation,
      ];

      for (const candidate of distanceCandidates) {
        const match = String(candidate ?? "").match(/(\d+[.,]?\d*)/);
        if (match?.[1]) {
          return Number(match[1].replace(",", "."));
        }
      }

      return Number.POSITIVE_INFINITY;
    };

    const buildPreviewFoodItems = (restaurants = []) => {
      const restaurantItems = restaurants.flatMap((restaurant) =>
        Array.isArray(restaurant?.items_list) ? restaurant.items_list : []
      );

      if (restaurantItems.length > 0) {
        const nextItems = shuffleItems(
          normalizePreviewFood(restaurantItems)
        ).slice(0, 8);
        if (nextItems.length > 0) {
          previewFoodItems.value = nextItems;
        }
        return;
      }

      const fallbackItems = shuffleItems(
        normalizePreviewFood(Object.values(DataStore.food_list || {}))
      ).slice(0, 8);

      if (fallbackItems.length > 0) {
        previewFoodItems.value = fallbackItems;
      }
    };

    const afterResults = (data) => {
      hasResult.value = data;
      if (Array.isArray(data) && data.length > 0) {
        previewFeedItems.value = data;
        buildPreviewFoodItems(data);
      } else {
        previewFeedItems.value = [];
        buildPreviewFoodItems([]);
      }
    };

    const selectionPreviewFoodItems = computed(() => {
      if (previewFoodItems.value.length > 0) {
        return previewFoodItems.value;
      }

      return shuffleItems(
        normalizePreviewFood(Object.values(DataStore.food_list || {}))
      ).slice(0, 8);
    });

    const selectionPopularItems = computed(() =>
      [...(previewFeedItems.value || [])]
        .sort((a, b) => parseRatingValue(b) - parseRatingValue(a))
        .slice(0, 8)
    );

    const selectionNearbyItems = computed(() =>
      [...(previewFeedItems.value || [])]
        .sort((a, b) => parseDistanceValue(a) - parseDistanceValue(b))
        .slice(0, 8)
    );

    const filterAgain = () => {
      merchant_filter.value.filter = true;
    };

    const refresh = (done) => {
      const place_data = APIinterface.getStorage("place_data");
      if (searchMode == "location") {
        DataStore.getBannerLocation({
          city_id: DataStorePersisted.getLocation?.city_id || "",
          state_id: DataStorePersisted.getLocation?.state_id || "",
          area_id: DataStorePersisted.getLocation?.area_id || "",
          postal_id: DataStorePersisted.getLocation?.postal_code || "",
        });
      } else {
        DataStore.getBanner({
          latitude: place_data ? place_data.latitude : "",
          longitude: place_data ? place_data.longitude : "",
        });
      }
      DataStore.CuisineList();

      DataStore.clearData();
      ref_feed_results.value?.resetData?.();

      merchantRefCarousel.value?.refreshData?.();
      merchantRefCarousel2.value?.refreshData?.();
      merchantRefCarousel3.value?.refreshData?.();

      if (DataStore.chat_enabled && auth.authenticated()) {
        ClientStore.fetchNotification();
      }

      setTimeout(() => {
        done();
      }, 500);
    };

    const afterChooseaddress = (value, isWrite) => {
      DataStorePersisted.recently_change_address = true;

      if (value.place_data) {
        MenuStore.cleanMerchantData();

        DataStorePersisted.place_data = value.place_data;
        DataStorePersisted.coordinates = value.location_coordinates;

        if (isWrite) {
          DataStorePersisted.saveRecentAddress(value.place_data);
        }

        DataStore.recommended_data = null;
        DataStore.featured_items = null;
        DataStore.banner = [];
        DataStore.food_list = [];
        home_banner.value?.loadData?.();
        ref_featured_items.value?.loadData?.();
        loadSelectionsData();

        setTimeout(() => {
          merchantRefCarousel.value?.refreshData?.();
          merchantRefCarousel2.value?.refreshData?.();
          merchantRefCarousel3.value?.refreshData?.();

          DataStore.clearData();
          ref_feed_results.value.resetData();
          buildPreviewFoodItems([]);
        }, 500);
      }
    };

    const afterChooselocation = () => {
      DataStore.recommended_data = null;
      DataStore.banner = [];
      DataStore.food_list = [];
      MenuStore.cleanMerchantData();

      home_banner.value?.loadData?.();
      loadSelectionsData();

      setTimeout(async () => {
        DataStore.clearData();
        ref_feed_results.value?.resetData?.();
        merchantRefCarousel.value?.refreshData?.();
        merchantRefCarousel2.value?.refreshData?.();
        merchantRefCarousel3.value?.refreshData?.();
        buildPreviewFoodItems([]);
        try {
          await CartStore.getCart(true, null);
        } catch (error) {}
      }, 500);
    };

    const isLogin = computed(
      () => DataStore.chat_enabled && auth.authenticated()
    );

    const getSearchLink = computed(() => {
      let link = null;
      if (searchMode == "location") {
        link = "/search/location";
      } else if (searchMode == "address") {
        link = "/search";
      }
      return link;
    });

    return {
      getSearchLink,
      isLogin,
      filters,
      topResto,
      highlightsTab,
      q,
      slide,
      cuisineList,
      afterGetdata,
      applyFilter,
      goSearch,
      runFilter,
      merchantList,
      merchantRefCarousel,
      merchantRefCarousel2,
      merchantRefCarousel3,
      selectionPopularItems,
      selectionNearbyItems,
      selectionPreviewFoodItems,
      featuredTab,
      featured,
      afterResults,
      hasResult,
      DataStore,
      CartStore,
      userData,
      filterAgain,
      merchant_filter,
      refresh,
      isSticky,
      isCuisinePinned,
      canScrollLeft,
      canScrollRight,
      highlightTabs,
      onScroll,
      onHighlightTabsScroll,
      scrollHighlightTabs,
      isScrolled,
      PlaceId,
      afterApplyfilter,
      ref_feed_results,
      hasFilters,
      hasActiveCuisine,
      restaurantsHeading,
      restaurantsCount,
      restaurantCountLabel,
      highlightsMeta,
      clearCuisineFilter,
      DataStorePersisted,
      afterChooseaddress,
      ClientStore,
      AddressRecent,
      searchMode,
      afterChooselocation,
      home_banner,
      MerchantCarousel,
      ref_featured_items,
      active_filers,
      filterUnmount,
      filterByCuisine,
    };
  },
};
</script>

<style scoped>
.tagam-home-page {
  background: #ffffff !important;
  padding-bottom: 24px;
  padding-top: 0;
}

.tagam-home-content {
  padding-left: 0;
  padding-right: 0;
}

.tagam-home-sticky-shell {
  z-index: 150;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
}

.tagam-home-sticky-header {
  width: 100%;
  background: #ffffff;
}

.tagam-home-sticky-spacer {
  height: 46px;
}

.tagam-app-header {
  background: transparent !important;
  box-shadow: none !important;
  border-bottom: 0 !important;
  height: 0 !important;
  min-height: 0 !important;
}

.tagam-header-inner {
  padding-left: 0;
  padding-right: 0;
  background: transparent;
}

.tagam-topbar {
  position: relative;
  z-index: 1;
}

.tagam-location-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 24px;
  flex: 1 1 auto;
  min-width: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
  box-shadow: none;
  margin-top: -6px;
  margin-bottom: 8px;
  margin-left: 0;
  margin-right: 0;
}

.tagam-location-card__pin {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: #fff4e7;
}

.tagam-location-card__content {
  min-width: 0;
  flex: 1 1 auto;
}

.tagam-location-card__value {
  font-size: 13px;
  font-weight: 600;
  color: #1f1f1f;
}

.tagam-search-link {
  display: block;
  text-decoration: none;
  flex: 1 1 auto;
  min-width: 0;
}

.tagam-search-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.tagam-search-row__filter {
  flex: 0 0 auto;
}

.tagam-search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
  padding: 0 14px;
  background: #f7f7f7 !important;
  border: 1px solid #f7f7f7;
  border-radius: 18px;
  box-shadow: none;
}

.tagam-search-box__lead {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a2a2a2;
}

.tagam-search-box__eyebrow {
  font-size: 12px;
  line-height: 1;
  font-weight: 500;
  color: #a2a2a2;
}

.tagam-highlight-tabs-wrap {
  position: relative;
  margin-left: -2px;
  margin-right: -2px;
}

.tagam-highlight-tabs {
  display: flex;
  gap: 5px;
  overflow-x: auto;
  padding-bottom: 0;
  padding-left: 0;
  padding-right: 0;
  scrollbar-width: none;
}

.tagam-highlight-tabs::-webkit-scrollbar {
  display: none;
}

.tagam-highlight-tabs-hint {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  color: #f18800;
  background: #f7f7f7;
  z-index: 2;
  cursor: pointer;
}

.tagam-highlight-tabs-hint--left {
  left: 0;
}

.tagam-highlight-tabs-hint--right {
  right: 0;
}

.tagam-highlight-tabs-fade {
  position: absolute;
  top: 0;
  width: 72px;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.tagam-highlight-tabs-fade--left {
  left: 0;
  background: linear-gradient(
    270deg,
    rgba(246, 239, 227, 0) 0%,
    rgba(246, 239, 227, 0.7) 48%,
    rgba(246, 239, 227, 1) 100%
  );
}

.tagam-highlight-tabs-fade--right {
  right: 0;
  background: linear-gradient(
    90deg,
    rgba(246, 239, 227, 0) 0%,
    rgba(246, 239, 227, 0.7) 48%,
    rgba(246, 239, 227, 1) 100%
  );
}

.tagam-highlight-tab {
  flex: 0 0 auto;
  min-height: 34px;
  padding: 0 11px;
  border-radius: 999px;
  background: #f7f7f7;
  color: #7e7e7e;
  font-weight: 700;
  border: 1px solid #f7f7f7;
  box-shadow: none;
  font-size: 12px;
}

.tagam-highlight-tab.is-active {
  background: #f18800;
  color: #ffffff;
  box-shadow: none;
}

.tagam-highlights-shell {
  background: #f5ecd8;
  margin-top: 0 !important;
  border-radius: 18px !important;
  padding: 10px 10px 0;
}

.tagam-highlights-stage {
  height: 166px;
  min-height: 166px;
  margin-top: 6px !important;
  overflow: hidden;
}

.tagam-highlights-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-left: 0;
  padding-right: 0;
  margin-bottom: 6px;
}

.tagam-cuisine-shell {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 8px;
  padding-bottom: 4px;
  background: #ffffff;
  border: 0;
  box-shadow: none;
}

.tagam-cuisine-shell__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-left: 0;
  padding-right: 0;
  margin-bottom: 8px;
}

.tagam-cuisine-shell__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  width: 100%;
}

.tagam-cuisine-block {
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.tagam-cuisine-block :deep(.tagam-cuisine-carousel-wrap),
.tagam-cuisine-block :deep(.swiper) {
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.tagam-cuisine-section__meta {
  margin-left: auto;
  font-size: 13px;
  line-height: 1.35;
  flex: 0 1 260px;
  text-align: right;
  color: #6f6254;
}

.tagam-cuisine-shell .tagam-section-heading__eyebrow,
.tagam-highlights-head .tagam-section-heading__eyebrow,
.tagam-restaurants-heading .tagam-section-heading__eyebrow,
.tagam-cuisine-floating__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(241, 136, 0, 0.12);
  color: #f18800;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tagam-cuisine-shell .tagam-section-heading__eyebrow,
.tagam-cuisine-floating__eyebrow {
  min-height: auto;
  padding: 0;
  border-radius: 0;
  background: transparent;
  font-size: 15px;
  line-height: 1.1;
  letter-spacing: 0.04em;
}

.tagam-highlights-head .tagam-section-heading__eyebrow,
.tagam-restaurants-heading .tagam-section-heading__eyebrow {
  min-height: auto;
  padding: 0;
  border-radius: 0;
  background: transparent;
  font-size: 15px;
  line-height: 1.1;
  letter-spacing: 0.04em;
}

.tagam-cuisine-section__meta--highlights {
  flex-basis: 220px;
  max-width: 220px;
}

.tagam-cuisine-reset-btn {
  color: #f18800;
  font-weight: 800;
}

.tagam-cuisine-floating {
  position: fixed;
  top: 58px;
  left: 12px;
  right: 12px;
  z-index: 140;
  padding: 14px;
  border-radius: 24px;
  background: #fff9f0;
  border: 1px solid rgba(113, 74, 24, 0.14);
  box-shadow: 0 18px 40px rgba(70, 41, 12, 0.16);
}

.tagam-cuisine-floating__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.tagam-cuisine-floating__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  width: 100%;
}

.tagam-cuisine-floating__eyebrow {
  display: inline-flex;
}

.tagam-cuisine-floating__meta {
  margin-left: auto;
  max-width: 220px;
  font-size: 13px;
  line-height: 1.35;
  text-align: right;
  color: #6f6254;
}

.tagam-cuisine-sentinel {
  height: 1px;
}

:deep(.tagam-home-page > .tagam-section-shell),
:deep(.tagam-home-page > div + .tagam-section-shell) {
  margin-top: 10px !important;
}

:deep(.tagam-section-shell) {
  border-radius: 24px;
  padding: 14px;
}

.tagam-restaurants-shell {
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 8px;
  background: #ffffff;
  border: 0;
  box-shadow: none;
}

.tagam-restaurants-shell__content {
  margin-bottom: -12px;
}

.tagam-restaurants-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-left: 0;
  padding-right: 0;
  margin-bottom: 12px;
}

.tagam-restaurants-heading__main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  min-width: 0;
}

.tagam-restaurants-heading__title {
  font-size: 22px;
  line-height: 1.05;
  font-weight: 900;
  color: #000000;
}

.tagam-restaurants-heading__count {
  flex: 0 0 auto;
  font-size: 13px;
  line-height: 1.35;
  font-weight: 400;
  color: #6f6254;
  text-align: right;
}

:deep(.tagam-section-heading) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

:deep(.tagam-section-heading--compact) {
  margin-bottom: 8px;
}

:deep(.tagam-section-heading__title) {
  font-size: 22px;
  line-height: 1.02;
  font-weight: 900;
}

:deep(.tagam-section-heading__meta) {
  max-width: 260px;
  font-size: 12px;
  line-height: 1.35;
  color: #6f6254;
  margin-left: auto;
  flex: 0 1 260px;
  text-align: right;
}

:deep(.tagam-home-actions .q-btn) {
  margin-left: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
  color: #d0d0d0 !important;
}

:deep(.tagam-home-actions .q-badge) {
  box-shadow: 0 6px 14px rgba(196, 49, 43, 0.25);
}

:global(body.body--dark) .tagam-cuisine-section__meta,
:global(body.body--dark) .tagam-cuisine-floating__meta,
:global(body.body--dark) :deep(.tagam-section-heading__meta),
:global(body.body--dark) .tagam-restaurants-heading__count {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-restaurants-heading__title {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-highlights-shell,
:global(body.body--dark) .tagam-cuisine-shell,
:global(body.body--dark) .tagam-cuisine-floating,
:global(body.body--dark) .tagam-restaurants-shell {
  background: var(--tagam-surface-soft) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-highlight-tab,
:global(body.body--dark) .tagam-cuisine-reset-btn {
  background: var(--tagam-surface-raised) !important;
  border-color: var(--tagam-stroke) !important;
  color: var(--tagam-text-soft) !important;
  box-shadow: none !important;
}

:global(body.body--dark) .tagam-highlight-tab.is-active {
  background: linear-gradient(
    135deg,
    var(--tagam-primary) 0%,
    var(--tagam-primary-strong) 100%
  ) !important;
  color: #fff8f1 !important;
}

:global(body.body--dark) .tagam-highlight-tabs-hint {
  background: var(--tagam-surface-inset) !important;
  color: var(--tagam-primary) !important;
}

:global(body.body--dark) .tagam-highlight-tabs-fade--left {
  background: linear-gradient(
    270deg,
    rgba(36, 29, 26, 0) 0%,
    rgba(36, 29, 26, 0.84) 58%,
    rgba(36, 29, 26, 1) 100%
  ) !important;
}

:global(body.body--dark) .tagam-highlight-tabs-fade--right {
  background: linear-gradient(
    90deg,
    rgba(36, 29, 26, 0) 0%,
    rgba(36, 29, 26, 0.84) 58%,
    rgba(36, 29, 26, 1) 100%
  ) !important;
}

:global(body.body--dark) .tagam-home-page,
:global(body.body--dark) .tagam-home-content,
:global(body.body--dark) .tagam-header-inner,
:global(body.body--dark) .tagam-topbar {
  background: var(--tagam-surface) !important;
  background-image: none !important;
}

:global(body.body--dark) .tagam-home-sticky-header,
:global(body.body--dark) .tagam-home-sticky-shell,
:global(body.body--dark) .tagam-location-card {
  background: #3a2c24 !important;
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 24px !important;
}

:global(body.body--dark) .tagam-home-sticky-header :deep(.tagam-shared-header__shell),
:global(body.body--dark) .tagam-home-sticky-header :deep(.tagam-shared-header__toolbar),
:global(body.body--dark) .tagam-home-sticky-header :deep(.tagam-shared-header__toolbar-wrap),
:global(body.body--dark) .tagam-home-sticky-header :deep(.tagam-shared-header__toolbar-wrap--sticky),
:global(body.body--dark) .tagam-home-sticky-header :deep(.tagam-shared-header__toolbar-wrap--fixed) {
  background: var(--tagam-surface) !important;
  border-bottom: 1px solid var(--tagam-stroke) !important;
}

:global(body.body--dark) .tagam-home-sticky-header :deep(.tagam-shared-header__icon),
:global(body.body--dark) .tagam-home-sticky-header :deep(.tagam-shared-header__icon .q-icon) {
  color: var(--tagam-primary) !important;
  opacity: 1 !important;
}

:global(body.body--dark) .tagam-location-card__pin {
  background: rgba(241, 136, 0, 0.14) !important;
}

:global(body.body--dark) .tagam-location-card__value,
:global(body.body--dark) .tagam-cuisine-shell .tagam-section-heading__eyebrow,
:global(body.body--dark) .tagam-highlights-head .tagam-section-heading__eyebrow,
:global(body.body--dark) .tagam-restaurants-heading .tagam-section-heading__eyebrow,
:global(body.body--dark) .tagam-cuisine-floating__eyebrow {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-search-box,
:global(body.body--dark) .tagam-search-row__filter :deep(.q-btn),
:global(body.body--dark) .tagam-search-row__filter :deep(.q-field__control) {
  background: rgba(49, 39, 34, 0.96) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: none !important;
}

:global(body.body--dark) .tagam-search-box__lead,
:global(body.body--dark) .tagam-search-box__eyebrow,
:global(body.body--dark) .tagam-cuisine-shell__head,
:global(body.body--dark) .tagam-cuisine-floating__head {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-highlights-shell {
  background: rgba(39, 31, 27, 0.96) !important;
  border-radius: 26px !important;
  padding: 14px 14px 4px !important;
}

:global(body.body--dark) .tagam-restaurants-shell {
  background: rgba(41, 33, 29, 0.96) !important;
  border-radius: 30px !important;
}

:global(body.body--dark) .tagam-cuisine-shell {
  background: var(--tagam-surface) !important;
  border-color: transparent !important;
  box-shadow: none !important;
  border-radius: 30px !important;
}

:global(body.body--dark) .tagam-cuisine-floating {
  background: rgba(39, 31, 27, 0.98) !important;
  border-radius: 28px !important;
  box-shadow: var(--tagam-shadow-strong) !important;
}

:global(body.body--dark) .tagam-highlight-tab {
  min-height: 38px;
  background: rgba(55, 44, 38, 0.94) !important;
  color: var(--tagam-text-soft) !important;
}

:global(body.body--dark) .tagam-restaurants-heading__count,
:global(body.body--dark) .tagam-cuisine-section__meta,
:global(body.body--dark) .tagam-cuisine-floating__meta {
  color: #ab9988 !important;
}

:global(body.body--dark) .tagam-restaurants-shell__content {
  margin-bottom: -6px;
}

:global(body.body--dark) :deep(.tagam-home-actions .q-btn),
:global(body.body--dark) :deep(.tagam-home-actions .q-icon) {
  color: var(--tagam-primary) !important;
}

@media (max-width: 480px) {
  .tagam-topbar-head {
    gap: 8px;
    margin-bottom: 0;
    align-items: flex-start;
  }

  .tagam-location-card {
    padding: 10px;
  }

  .tagam-cuisine-floating {
    top: 56px;
    left: 10px;
    right: 10px;
    padding: 12px;
  }
}
</style>

