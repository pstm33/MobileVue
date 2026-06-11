<template>
  <q-header
    class="tagam-search-header q-pt-xs tagam-text-main"
    :class="{ 'shadow-bottom': isScrolled, 'border-bottom': searching && hasRestuarant, }"
  >
    <q-toolbar>
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
        bg-color="transparent"
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
        <template v-slot:append>
          <q-btn
            flat
            round
            dense
            color="primary"
            icon="eva-mic-outline"
            :loading="isListening"
            :aria-label="$t('Voice search')"
            @click.stop="startVoiceSearch"
          />
        </template>
      </q-input>
    </q-toolbar>

    <div
      class="q-pl-md q-pr-md"
      :class="{ hidden: !searching && !hasRestuarant, }"
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
  </q-header>

  <q-page class="tagam-search-page">
    <q-scroll-observer @scroll="onScroll" />

    <template v-if="isSearching">
      <template v-if="hasData">
        <q-list separator>
          <template v-for="items in data" :key="items">
              <q-item
                clickable
                v-ripple
                class="tagam-suggestion-row"
                @click="setRecentSeachs(items, true)"
              >
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
                class="tagam-restaurant-list-item q-pa-none q-mb-sm"
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
              <div class="text-subtitle2 tagam-text-muted">
                {{ $t("end of results") }}
              </div>
            </div>
          </template>
        </template>

        <template v-slot:loading>
          <div
            class="row q-gutter-x-sm justify-center q-my-md"
            :class="{ 'absolute-center text-center full-width': current_page == 1, }"
          >
            <q-circular-progress
              indeterminate
              rounded
              size="sm"
              color="primary"
            />
            <div class="text-subtitle1 tagam-text-muted">{{ $t("Loading") }}...</div>
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
                class="q-pa-xs q-pr-sm tagam-surface-muted radius28 flex items-center q-gutter-x-xs"
              >
                <div>
                  <q-icon name="restore" color="blue-grey-6" size="sm"></q-icon>
                </div>
                <div class="text-caption tagam-text-main">
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
              class="tagam-text-main"
            >
                <q-card flat class="tagam-search-reco-card">
                <q-responsive ratio="2">
                  <q-img
                    :src="items.url_banner || items.url_header || items.url_logo"
                    lazy
                    fit="cover"
                    class="tagam-search-reco-image tagam-restaurant-cover-stretch"
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
import { listenVoiceSearch } from "src/utils/voiceSearch";

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
      isListening: false,
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

    if (this.$route.query.voice || this.DataStore.voice_search_requested) {
      this.DataStore.voice_search_requested = false;
      this.$nextTick(() => {
        this.startVoiceSearch();
      });
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
    async startVoiceSearch() {
      if (this.isListening) {
        return;
      }

      try {
        const transcript = await listenVoiceSearch({
          locale: this.$i18n.locale,
          onStart: () => {
            this.isListening = true;
          },
          onEnd: () => {
            this.isListening = false;
          },
        });
        await this.setRecentSeachs({ name: transcript }, true);
      } catch (error) {
        this.isListening = false;
        const key =
          error?.message === "voice_not_supported"
            ? "Voice search is not supported on this device"
            : "We could not hear you clearly";
        APIinterface.notify("dark", this.$t(key), "eva-mic-off-outline", this.$q);
      }
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

<style lang="sass" scoped>
.tagam-search-header
  background: rgba(255, 255, 255, 0.92) !important
  backdrop-filter: blur(18px)

:global(body.body--dark) .tagam-search-header
  background: rgba(18, 20, 24, 0.9) !important

.tagam-search-page
  background: linear-gradient(180deg, var(--tagam-bg-soft) 0, var(--tagam-bg) 220px)

.tagam-suggestion-row
  margin: 6px 12px
  border: 1px solid var(--tagam-border)
  border-radius: var(--tagam-radius-card)
  background: var(--tagam-surface)

.tagam-search-reco-card
  overflow: hidden
  border: 1px solid var(--tagam-border)
  border-radius: var(--tagam-radius-card)
  background: var(--tagam-surface)
  box-shadow: var(--tagam-shadow-soft)

.tagam-search-reco-image
  border-radius: 0 !important
</style>






