<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      reveal
      reveal-offset="50"
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
        'border-bottom': !isScrolled,
        'shadow-bottom': isScrolled,
      }"
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
        <q-toolbar-title class="text-weight-bold">
          <template v-if="featured_data?.[featured_id]">
            {{ $t(featured_data[featured_id]) }}
          </template>

          <template v-if="cuisine_name">
            {{ cuisine_name }}
          </template>
          <template v-else-if="page_title">
            {{ page_title }}
          </template>
        </q-toolbar-title>
      </q-toolbar>

      <div class="q-pl-md q-pr-md">
        <FeedFilter
          ref="ref_feed_filter"
          @after-applyfilter="afterApplyfilter"
          @filter-unmount="filterUnmount"
          :search_mode="search_mode"
          :saved_filter="DataStore.filter_page"
        ></FeedFilter>
      </div>
      <q-space class="q-pa-xs"></q-space>
    </q-header>

    <q-page>
      <q-scroll-observer @scroll="onScroll" scroll-target="body" />
      <q-infinite-scroll
        ref="nscroll"
        @load="getMerchantFeed"
        :offset="250"
        :disable="scroll_disabled"
      >
        <template v-slot:default>
          <DIV class="q-pl-md q-pr-md q-pt-sm">
            <template v-if="!hasMore && !hasData">
              <NoResults
                :message="$t('noResults')"
                :description="$t('noResultsDesc')"
              ></NoResults>
            </template>
            <template v-else-if="hasData">
              {{ total_found }}
            </template>
          </DIV>

          <q-list class="no-wrap">
            <q-item
              v-for="items in data"
              :key="items.merchant_id"
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
                @after-savefav="afterSavefav"
              />
            </q-item>
          </q-list>
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
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent, ref } from "vue";
import { useCartStore } from "stores/CartStore";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import auth from "src/api/auth";

export default {
  name: "FeedPage",
  components: {
    MerchantListTpl: defineAsyncComponent(() =>
      import("components/MerchantListTpl.vue")
    ),
    // MerchantListSkeleton: defineAsyncComponent(() =>
    //   import("components/MerchantListSkeleton.vue")
    // ),
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
    //FeedFilter: defineAsyncComponent(() => import("components/FeedFilter.vue")),
    // FeedFilterPage: defineAsyncComponent(() =>
    //   import("components/FeedFilterPage.vue")
    // ),
    FeedFilter: defineAsyncComponent(() => import("components/FeedFilter.vue")),
  },
  data() {
    return {
      loading: false,
      featured_id: null,
      cuisine_id: null,
      page_title: null,
      list_type: null,
      data: [],
      total_found: 0,
      filters: [],
      params: {},
      current_page: 1,
      scroll_disabled: true,
      hasMore: true,
      location_data: null,
      payload: [
        "cuisine",
        "reviews",
        "estimation",
        "services",
        "items_min_max",
        "offers",
        "promo",
      ],
      isScrolled: false,
      featured_data: null,
      active_filers: null,
      search_mode: null,
    };
  },
  setup() {
    const CartStore = useCartStore();
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { CartStore, DataStore, DataStorePersisted };
  },
  created() {
    this.list_type = this.$route.query.query;
    this.featured_id = this.$route.query.featured_id;
    this.cuisine_id = this.$route.query.cuisine_id;
    this.cuisine_name = this.$route.query.cuisine_name;
    this.page_title = this.$route.query.page_title;

    if (this.cuisine_id > 0) {
      this.filters = {
        cuisine: [this.cuisine_id],
      };
    }

    this.featured_data = this.DataStore.attributes_data?.featured_data || null;

    if (!this.DataStore.hasDataCuisine()) {
      this.DataStore.CuisineList();
    }
  },
  mounted() {
    this.search_mode = this.DataStore.getSearchMode;

    this.active_filers = {
      currency_code: this.DataStorePersisted.useCurrency,
      list_type: this.list_type,
      featured_id: this.featured_id,
      coordinates: this.DataStorePersisted.coordinates,
      filters: this.filters,
      // filters: this.DataStore.feed_saved_filters
      //   ? this.DataStore.feed_saved_filters.filters
      //   : this.filters,
      is_login: auth.authenticated(),
    };

    if (
      this.DataStore.feed_saved_items.length > 0 &&
      JSON.stringify(this.DataStore.feed_saved_filters) ===
        JSON.stringify(this.active_filers)
    ) {
      console.log("same data");
      this.data = this.DataStore.feed_saved_items;
      this.current_page = this.DataStore.feed_saved_currentpage;
      this.hasMore = this.DataStore.feed_saved_has_more;
      this.total_found = this.DataStore.feed_saved_total;
    } else {
      console.log("new filters");
      this.DataStore.clearFeedSavedData();
    }

    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.DataStore.feed_featured_id = this.featured_id;
    this.DataStore.feed_saved_items = this.data;
    this.DataStore.feed_saved_currentpage = this.current_page;
    this.DataStore.feed_saved_has_more = this.hasMore;
    this.DataStore.feed_saved_total = this.total_found;
    this.DataStore.feed_saved_filters = {
      currency_code: this.DataStorePersisted.useCurrency,
      list_type: this.list_type,
      featured_id: this.featured_id,
      coordinates: this.DataStorePersisted.coordinates,
      filters: this.filters,
      is_login: auth.authenticated(),
    };
    this.DataStore.saved_location_data = this.location_data;
  },
  computed: {
    hasData() {
      if (this.data.length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    afterSavefav() {
      // CLEAR HOME PAGE FILTER AND FAV
      this.DataStore.feed_filter = [];
      this.DataStore.fav_saved_data = null;
    },
    filterUnmount(value) {
      this.DataStore.filter_page = value;
    },
    onScroll(info) {
      if (!info) {
        return;
      }
      this.isScrolled = info.position.top > 140;
    },
    refresh(done) {
      setTimeout(() => {
        done();
      }, 100);
      this.resetPagination();
    },
    resetPagination() {
      this.data = [];
      this.current_page = 1;
      this.hasMore = true;
      this.scroll_disabled = false;
      this.$nextTick(() => {
        this.$refs.nscroll?.resume?.();
        this.$refs.nscroll?.trigger?.();
      });
    },
    afterApplyfilter(value) {
      this.active_filers = {
        list_type: this.list_type,
        featured_id: this.featured_id,
        coordinates: this.DataStorePersisted.coordinates,
        filters: value,
        is_login: auth.authenticated(),
      };

      this.filters = value;
      this.resetData();
    },
    resetData() {
      this.DataStore.feed_saved_items = [];
      this.DataStore.feed_saved_currentpage = null;
      this.DataStore.feed_saved_has_more = null;
      this.DataStore.feed_saved_total = null;

      this.data = [];
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

        this.loading = true;
        this.params = {
          currency_code: this.DataStorePersisted.useCurrency,
          list_type: this.list_type,
          featured_id: this.featured_id,
          coordinates: this.DataStorePersisted.coordinates,
          payload: this.payload,
          page: this.current_page,
          sort_by: this.filters?.sort_by || "",
          filters: this.filters,
        };

        let response = null;
        const isAuthenticated = auth.authenticated();

        const method = isAuthenticated
          ? "getMerchantFeedAuth"
          : "getMerchantFeed";

        const fetchFn = isAuthenticated
          ? APIinterface.fetchDataByToken
          : APIinterface.fetchData;

        response = await fetchFn(method, this.params);
        this.current_page++;

        this.data = [...this.data, ...response.details.data];
        this.total_found = response.details?.total_pretty || 0;

        if (response.details.is_last_page) {
          this.hasMore = false;
          this.scroll_disabled = true;
          done(true);
          return;
        }
        done();
      } catch (error) {
        console.log("error", error);
        this.hasMore = false;
        this.scroll_disabled = true;
        done(true);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
