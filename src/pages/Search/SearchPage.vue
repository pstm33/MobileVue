<template>
  <q-header
    class="q-pt-xs text-dark tagam-search-header"
    :class="{
      'shadow-bottom': isScrolled,
      'border-bottom': searching && hasRestuarant,
    }"
  >
    <div class="tagam-search-header-shell">
    <q-toolbar class="tagam-search-toolbar">
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="eva-arrow-back-outline"
        class="q-mr-sm"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
        <q-input
        v-model="q"
        ref="ref_search"
        :placeholder="$t('What are you looking for')"
        dense
        outlined
        color="primary"
        bg-color="grey-1"
        class="full-width input-borderless"
        :loading="awaitingSearch"
        rounded
        clearable
        @clear="clearSearch"
        @update:model-value="fetchSuggestions"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
    </q-toolbar>

    <div
      class="q-pl-md q-pr-md tagam-search-filter-row"
      :class="{
        hidden: !searching && !hasRestuarant,
      }"
    >
      <FeedFilter
        ref="ref_feed_filter"
        @after-applyfilter="afterApplyfilter"
        @filter-unmount="filterUnmount"
        :search_mode="search_mode"
        :saved_filter="DataStore.filter_search"
      ></FeedFilter>
    </div>
    <q-space class="q-pa-xs"></q-space>
    </div>
  </q-header>

  <q-page class="tagam-search-page">
    <q-scroll-observer @scroll="onScroll" />

    <template v-if="isSearching">
      <template v-if="hasData">
        <q-list separator class="tagam-search-suggestions">
          <template v-for="items in data" :key="items">
            <q-item clickable v-ripple @click="setRecentSeachs(items, true)">
              <q-item-section avatar>
                <q-icon color="grey-6" name="eva-search-outline" />
              </q-item-section>
              <q-item-section>
                <span v-html="items.name"></span>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </template>

      <!-- FEED RESULTS -->
      <q-infinite-scroll
        ref="nscroll"
        @load="getMerchantFeed"
        :offset="250"
        :disable="scroll_disabled"
      >
        <template v-slot:default>
          <DIV class="q-pl-md q-pr-md q-pt-sm">
            <template v-if="!hasMore && !hasRestuarant && searching">
              <NoResults
                :message="$t('noResults')"
                :description="$t('noResultsDesc')"
              ></NoResults>
            </template>
          </DIV>

          <q-list class="no-wrap">
            <template v-for="items in restaurants" :key="items">
              <q-item
                clickable
                v-ripple
                @click.stop="
                  this.$router.push({
                    name: 'menu',
                    params: {
                      slug: items.restaurant_slug,
                    },
                  })
                "
              >
                <MerchantListTpl
                  :items="items"
                  :enabled_review="DataStore.enabled_review"
                />
              </q-item>
              <div v-if="items.items_list" class="q-pl-md q-pr-md q-mb-md">
                <CarouselItems
                  :items="items.items_list ? items.items_list : null"
                ></CarouselItems>
              </div>
              <div class="q-pl-md q-pr-md">
                <q-separator></q-separator>
              </div>
            </template>
          </q-list>

          <template v-if="!hasMore && !loading && hasRestuarant">
            <div class="row q-gutter-x-sm justify-center q-my-md">
              <div class="text-subtitle2 text-grey">
                {{ $t("end of results") }}
              </div>
            </div>
          </template>
        </template>

        <template v-slot:loading>
          <div
            class="row q-gutter-x-sm justify-center q-my-md"
            :class="{
              'absolute-center text-center full-width': current_page == 1,
            }"
          >
            <q-circular-progress
              indeterminate
              rounded
              size="sm"
              color="primary"
            />
            <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
          </div>
        </template>
      </q-infinite-scroll>
      <!-- FEED RESULTS -->
    </template>

    <template v-else>
      <!-- default content -->
      <div class="q-pa-md">
        <div
          v-if="DataStorePersisted.recent_searches.length > 0"
          class="text-subtitle2 text-weight-bold q-mb-md"
        >
          {{ $t("Recent searches") }}
        </div>

        <div class="flex items-center q-gutter-sm">
          <template
            v-for="items in DataStorePersisted.recent_searches"
            :key="items"
          >
            <router-link to="" @click="setRecentSeachs(items, false)">
              <div
                class="q-pa-xs q-pr-sm bg-grey-2 radius28 flex items-center q-gutter-x-xs"
              >
                <div>
                  <q-icon name="restore" color="blue-grey-6" size="sm"></q-icon>
                </div>
                <div class="text-caption text-dark">
                  <span v-html="items.name"></span>
                </div>
              </div>
            </router-link>
          </template>
        </div>

        <q-space class="q-pa-md"></q-space>

        <div
          v-if="DataStore.recommended_data"
          class="text-subtitle2 text-weight-bold q-mb-md"
        >
          {{ $t("Recommended") }}
        </div>

        <!-- RECOMENDED -->

        <template v-if="DataStore.recommended_loading">
          <div class="q-gutter-md row items-start">
            <div class="col-4 q-pa-sm" v-for="items in 4" :key="items">
              <q-skeleton height="90px" square />
            </div>
          </div>
        </template>

        <div class="row">
          <div
            class="col-4 q-pa-sm"
            v-for="items in DataStore.recommended_data"
            :key="items"
          >
            <router-link
              to=""
              @click.stop="
                this.$router.push({
                  name: 'menu',
                  params: {
                    slug: items.restaurant_slug,
                  },
                })
              "
              class="text-dark"
            >
              <q-card flat class="tagam-search-recommended-card">
                <q-responsive style="height: 90px">
                  <q-img
                    :src="merchantImage(items)"
                    lazy
                    fit="cover"
                    class="radius8"
                    spinner-color="amber"
                    spinner-size="sm"
                  />
                </q-responsive>
                <q-space class="q-pa-xs"></q-space>
                <div class="text-subtitle2 ellipsis-2-lines text-weight-bold">
                  {{ items.restaurant_name }}
                </div>
                <div class="ellipsis text-caption flex justify-between">
                  <div>
                    {{ items?.estimation }}
                  </div>
                  <div>
                    {{ items?.distance_pretty }}
                  </div>
                </div>
              </q-card>
            </router-link>
          </div>
        </div>
        <!-- RECOMENDED -->

        <!-- default content -->
      </div>
    </template>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import auth from "src/api/auth";

export default {
  name: "SearchPageLocation",
  components: {
    MerchantListTpl: defineAsyncComponent(() =>
      import("components/MerchantListTpl.vue")
    ),
    CarouselItems: defineAsyncComponent(() =>
      import("components/CarouselItems.vue")
    ),
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
    FeedFilter: defineAsyncComponent(() => import("components/FeedFilter.vue")),
  },
  data() {
    return {
      isScrolled: false,
      q: "",
      searchString: "",
      awaitingSearch: false,
      data: [],
      filters: null,
      location_data: null,
      scroll_disabled: true,
      hasMore: true,
      loading: false,
      current_page: 1,
      restaurants: [],
      payload: [
        "cuisine",
        "reviews",
        "estimation",
        "services",
        "items_min_max",
        "offers",
        "promo",
        "items",
      ],
      params: null,
      search_mode: null,
      searching: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, DataStorePersisted };
  },
  mounted() {
    this.search_mode = this.DataStore.getSearchMode;
    this.location_data = this.DataStorePersisted.getLocation;
    this.fetchRecommded();

    if (this.DataStore.search_saved.length > 0) {
      this.restaurants = this.DataStore.search_saved;
      this.current_page = this.DataStore.search_saved_currentpage;
      this.hasMore = this.DataStore.search_saved_has_more;
      this.q = this.DataStore.search_query;
    } else {
      this.clearSearch();
    }

    if (!this.DataStore.hasDataCuisine()) {
      this.DataStore.CuisineList();
    }
  },
  beforeUnmount() {
    this.DataStore.search_query = this.q;
    this.DataStore.search_saved = this.restaurants;
    this.DataStore.search_saved_currentpage = this.current_page;
    this.DataStore.search_saved_has_more = this.hasMore;
    console.log("beforeUnmount");
  },
  computed: {
    isSearching() {
      return this.q ? true : false;
    },
    hasRestuarant() {
      return Object.keys(this.restaurants).length > 0;
    },
    hasData() {
      return Object.keys(this.data).length > 0;
    },
  },
  methods: {
    merchantImage(items) {
      return (
        items?.featured_image ||
        items?.cover_image ||
        items?.merchant_cover ||
        items?.cover ||
        items?.url_cover ||
        items?.url_banner ||
        items?.banner_image ||
        items?.url_featured ||
        items?.url_photo ||
        items?.image ||
        items?.image_url ||
        items?.url_logo ||
        items?.logo_url ||
        items?.logo ||
        ""
      );
    },
    filterUnmount(value) {
      console.log("filterUnmount", value);
      this.DataStore.filter_search = value;
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    clearSearch() {
      this.$nextTick(() => {
        if (this.$refs.ref_feed_filter) {
          console.log("clear");
          this.$refs.ref_feed_filter.resetFilter();
        }
      });

      this.searching = false;
      this.scroll_disabled = true;
      this.restaurants = [];
      this.current_page = 1;
      this.hasMore = false;
    },
    afterApplyfilter(value) {
      console.log("afterApplyfilter", value);
      this.filters = value;
      this.resetPagination();
    },
    resetPagination() {
      this.restaurants = [];
      this.current_page = 1;
      this.hasMore = true;
      this.scroll_disabled = false;
      this.$nextTick(() => {
        this.$refs.nscroll?.resume?.();
        this.$refs.nscroll?.trigger?.();
      });
    },
    async getMerchantFeed(index, done) {
      try {
        if (this.loading) {
          return;
        }
        if (!this.hasMore) {
          this.scroll_disabled = true;
          done(true);
          return;
        }

        const arr = this.payload;
        const payload = arr.map((item) =>
          item === "items" ? "items_search" : item
        );

        if (!this.filters) {
          this.filters = {
            query: this.q,
          };
        } else {
          this.filters.query = this.q;
        }

        this.params = {
          list_type: "all",
          sort_by: "distance",
          page: this.current_page,
          coordinates: this.DataStorePersisted.coordinates,
          enabled_review: this.DataStore.enabled_review,
          currency_code: this.DataStorePersisted.useCurrency,
          payload: payload,
          filters: this.filters,
        };

        this.loading = true;
        let response = null;

        const isLogin = auth.authenticated();
        const methods = isLogin ? "getMerchantFeedAuth" : "getMerchantFeed";
        if (isLogin) {
          response = await APIinterface.fetchDataByToken(methods, this.params);
        } else {
          response = await APIinterface.fetchData(methods, this.params);
        }

        this.current_page++;
        this.restaurants = [...this.restaurants, ...response.details.data];

        if (response.details.is_last_page) {
          this.hasMore = false;
          done(true);
          return;
        }
        done();
      } catch (error) {
        this.hasMore = false;
        done(true);
      } finally {
        this.loading = false;
      }
    },
    async setRecentSeachs(items, isWrite) {
      this.q = items.name;
      this.data = [];
      this.searching = true;

      console.log("setRecentSeachs");
      this.restaurants = [];
      this.scroll_disabled = false;
      this.current_page = 1;
      this.hasMore = true;

      if (isWrite) {
        const exists = this.DataStorePersisted.recent_searches.some(
          (search) => search.name === items.name
        );
        if (!exists) {
          this.DataStorePersisted.recent_searches.unshift({
            name: items.name,
          });
          if (this.DataStorePersisted.recent_searches.length > 8) {
            this.DataStorePersisted.recent_searches.pop(); // Remove the oldest (last) entry
          }
        }
      }

      this.$nextTick(() => {
        this.$refs.nscroll?.resume?.();
        this.$refs.nscroll?.trigger?.();
      });
    },
    async fetchRecommded() {
      try {
        if (this.DataStore.recommended_data) {
          return;
        }

        let params = {
          list_type: "featured",
          featured_id: "recommended",
          sort_by: "distance",
          coordinates: this.DataStorePersisted.coordinates,
          enabled_review: this.DataStore.enabled_review,
          payload: this.payload,
        };
        const response = await APIinterface.getMerchantFeed(params);
        this.DataStore.recommended_data = response.details.data;
      } catch (error) {
        this.DataStore.recommended_data = null;
      } finally {
      }
    },
    fetchSuggestions() {
      if (!this.q || this.q.trim() === "") {
        this.clearSearch();
        this.data = [];
        this.awaitingSearch = false;
        return;
      }

      if (!this.awaitingSearch) {
        this.awaitingSearch = true;
        setTimeout(async () => {
          await this.searchSuggestion(this.q);
          this.awaitingSearch = false;
        }, 1000);
      }
    },
    async searchSuggestion(value) {
      let searchData = {
        result_type: "restaurant",
        name: this.q,
      };
      try {
        const result = await APIinterface.fetchGetRequest(
          "searchSuggestion",
          "q=" + value
        );
        this.data = result.details.data;
        this.data = [...this.data, searchData];
      } catch (error) {
        this.data = [];
        this.data.push(searchData);
      } finally {
      }
    },
  },
};
</script>

<style scoped>
.tagam-search-page {
  background:
    radial-gradient(circle at top right, rgba(247, 199, 147, 0.2), transparent 28%),
    linear-gradient(180deg, #fbf6ec 0%, #f7f1e4 100%) !important;
}

.tagam-search-header {
  background: transparent !important;
  box-shadow: none !important;
  padding: 10px 12px 0;
}

.tagam-search-header-shell {
  background: rgba(255, 249, 240, 0.9);
  border: 1px solid rgba(113, 74, 24, 0.12);
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(70, 41, 12, 0.14);
  backdrop-filter: blur(16px);
  padding-bottom: 8px;
}

.tagam-search-toolbar {
  min-height: 72px;
}

.tagam-search-filter-row {
  padding-bottom: 4px;
}

.tagam-search-suggestions,
.tagam-search-recommended-card {
  background: transparent !important;
}

:deep(.tagam-search-header .q-field--outlined .q-field__control) {
  border-radius: 20px;
  background: rgba(255, 252, 246, 0.94);
  border: 1px solid rgba(113, 74, 24, 0.1);
  box-shadow: 0 14px 30px rgba(87, 52, 18, 0.08);
}
</style>
