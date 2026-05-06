<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header class="bg-whitex text-dark">
      <InstallPwa></InstallPwa>
      <div class="q-pl-sm q-pr-sm">
        <q-toolbar v-if="!isScrolled">
          <q-toolbar-title
            class="cursor-pointer"
            v-ripple:purple
            @click="this.$refs.ref_address.modal = true"
          >
            <div>
              <div class="flex items-center q-gutter-x-xs">
                <div>
                  <q-icon color="primary" name="near_me"></q-icon>
                </div>
                <div class="text-caption text-weight-bold">
                  {{ $t("Your Location") }}
                </div>
              </div>
              <div class="text-caption ellipsis">
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
          </q-toolbar-title>
          <q-space></q-space>

          <TopButtons
            :islogin="isLogin"
            :count="ClientStore.getAlertCount"
            :chatcount="ClientStore.getChatCount"
          ></TopButtons>
        </q-toolbar>

        <q-space class="q-pa-xs"></q-space>

        <router-link :to="getSearchLink">
          <div
            class="bg-white border-grey text-subtitle2 q-pa-sm q-pl-md q-pr-md radius28 flex items-center justify-between cursor-pointer"
          >
            <div class="flex items-center">
              <div class="text-caption text-dark">
                {{ $t("Search") }}
              </div>
            </div>
            <div class="flex items-center q-gutter-x-sm">
              <div>
                <q-icon
                  color="primary"
                  name="eva-search-outline"
                  size="20px"
                ></q-icon>
              </div>
              <q-separator vertical></q-separator>
              <div>
                <q-icon
                  color="primary"
                  name="eva-mic-outline"
                  size="20px"
                ></q-icon>
              </div>
            </div>
          </div>
        </router-link>

        <FeedFilter
          ref="ref_feed_filter"
          @after-applyfilter="afterApplyfilter"
          @filter-unmount="filterUnmount"
          :search_mode="searchMode"
          :saved_filter="DataStore.filter_home"
        ></FeedFilter>

        <q-space class="q-pa-xs"></q-space>
      </div>
    </q-header>

    <q-page class="q-pl-md q-pr-md">
      <q-scroll-observer @scroll="onScroll" />

      <q-space class="q-pa-sm"></q-space>

      <template v-if="!hasFilters">
        <HomeBanner
          ref="home_banner"
          :filters="DataStore.filters"
          :search_mode="searchMode"
        />

        <div class="q-mt-md tagam-cuisine-sticky-wrap">
          <template v-if="DataStore.loading_cuisine">
            <div class="row justify-end">
              <q-skeleton type="text" style="width: 50px" />
            </div>
          </template>

          <div
            v-else
            class="row items-center no-wrap q-col-gutter-sm justify-end"
          >
            <div v-if="hasActiveCuisine" class="col-auto">
              <q-btn
                flat
                dense
                no-caps
                class="tagam-cuisine-reset-btn"
                label="Сбросить"
                @click="clearCuisineFilter"
              />
            </div>
          </div>

          <div class="tagam-cuisine-scroll-fade-wrap">
            <CuisineCarousel
              ref="cuisine_carousel"
              :design="1"
              :search_mode="searchMode"
              @after-getdata="afterGetdata"
              @select-cuisine="filterByCuisine"
              class="tagam-cuisine-block"
            />
            <div class="tagam-cuisine-scroll-fade"></div>
          </div>
        </div>

        <component
          :is="MerchantCarousel"
          ref="merchantRefCarousel"
          list_type="featured"
          :featured_id="topResto"
          :filters="DataStore.filters"
          :index="0"
          :title="$t('Popular Near You')"
          :coordinates="DataStorePersisted.coordinates"
          :location_data="DataStorePersisted.getLocation"
        />

        <q-space class="q-pa-xs"></q-space>

        <FeaturedItems
          ref="ref_featured_items"
          :title="$t('Featured Items')"
        ></FeaturedItems>

        <div class="ref_sticky_target"></div>

        <q-space class="q-pa-sm"></q-space>

        <component
          :is="MerchantCarousel"
          ref="merchantRefCarousel2"
          list_type="featured"
          featured_id="new"
          :filters="DataStore.filters"
          :index="1"
          :title="$t('New Restaurants')"
          :coordinates="DataStorePersisted.coordinates"
          :location_data="DataStorePersisted.getLocation"
        />

        <q-space class="q-pa-sm"></q-space>
      </template>

      <FeedResults
        ref="ref_feed_results"
        :title="$t('Explore Restaurants')"
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
      />

      <q-space class="q-pa-lg"></q-space>

      <BrowseCuisine ref="browse_cuisine" :search_mode="searchMode">
      </BrowseCuisine>

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
    CuisineCarousel: defineAsyncComponent(() =>
      import("components/CuisineCarousel.vue")
    ),
    BrowseCuisine: defineAsyncComponent(() =>
      import("components/BrowseCuisine.vue")
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
    const userData = ref([]);
    const isSticky = ref(false);
    const isScrolled = ref(false);

    const active_filers = ref(null);

    useDeliveryschedStore();
    let observer = null;
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

      console.log("DataStore.feed_filter", DataStore.feed_filter);
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
    });

    onBeforeUnmount(() => {
      if (observer) {
        observer.disconnect();
      }

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

    const onScroll = (info) => {
      isScrolled.value = info.position.top > 140;
    };

    const ref_feed_results = ref(null);
    const home_banner = ref(null);
    const ref_featured_items = ref(null);

    const afterApplyfilter = (data) => {
      console.log("afterApplyfilter", data);
      DataStore.feed_filter.filters = data;
      DataStore.feed_filter.sort_by = data?.sort_by;
      ref_feed_results.value.resetData();
    };

    const filterUnmount = (data) => {
      console.log("filterUnmount", data);
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

    const afterResults = (data) => {
      console.log("afterResults =>" + data);
      hasResult.value = data;
    };

    const filterAgain = () => {
      console.log("filterAgain");
      merchant_filter.value.filter = true;
    };

    const refresh = (done) => {
      const place_data = APIinterface.getStorage("place_data");
      DataStore.getBanner({
        latitude: place_data ? place_data.latitude : "",
        longitude: place_data ? place_data.longitude : "",
      });
      DataStore.CuisineList();

      DataStore.clearData();
      ref_feed_results.value?.resetData?.();

      merchantRefCarousel.value?.refreshData?.();
      merchantRefCarousel2.value?.refreshData?.();

      if (DataStore.chat_enabled && auth.authenticated()) {
        ClientStore.fetchNotification();
      }

      setTimeout(() => {
        done();
      }, 500);
    };

    const afterChooseaddress = (value, isWrite) => {
      console.log("afterChooseaddress", value);
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
        home_banner.value.loadData();
        ref_featured_items.value.loadData();

        setTimeout(() => {
          merchantRefCarousel.value?.refreshData?.();
          merchantRefCarousel2.value?.refreshData?.();

          DataStore.clearData();
          ref_feed_results.value.resetData();
        }, 500);
      }
    };

    const afterChooselocation = () => {
      console.log("afterChooselocation");
      DataStore.recommended_data = null;
      DataStore.banner = [];
      MenuStore.cleanMerchantData();

      home_banner.value?.loadData?.();

      setTimeout(async () => {
        DataStore.clearData();
        ref_feed_results.value?.resetData?.();
        merchantRefCarousel.value?.refreshData?.();
        merchantRefCarousel2.value?.refreshData?.();
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
      featuredTab,
      featured,
      afterResults,
      hasResult,
      DataStore,
      userData,
      filterAgain,
      merchant_filter,
      refresh,
      isSticky,
      onScroll,
      isScrolled,
      PlaceId,
      afterApplyfilter,
      ref_feed_results,
      hasFilters,
      hasActiveCuisine,
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
.tagam-cuisine-scroll-fade-wrap {
  position: relative;
}

.tagam-cuisine-scroll-fade {
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 100%;
  pointer-events: none;
  z-index: 3;
  background: linear-gradient(
    to right,
    rgba(247, 244, 234, 0) 0%,
    rgba(247, 244, 234, 0.72) 58%,
    rgba(247, 244, 234, 1) 100%
  );
}

.tagam-cuisine-sticky-wrap {
  position: sticky;
  top: 88px;
  z-index: 11;
  background: #f7f4ea;
  padding-top: 6px;
  padding-bottom: 8px;
}

.tagam-cuisine-reset-btn {
  color: #f18800;
  font-weight: 700;
}
</style>
