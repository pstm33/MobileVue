<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header
      :class="{
        'border-bottom': !isScrolled,
        'shadow-bottom': isScrolled,
      }"
      class="text-dark"
    >
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          flat
          round
          dense
          icon="eva-arrow-back-outline"
          class="q-mr-sm"
        />
        <q-toolbar-title class="text-weight-bold">
          <template v-if="featured_data?.[featured_id]">
            {{ featured_data[featured_id] }}
          </template>
          <template v-else-if="cuisine_name">
            {{ cuisine_name }}
          </template>
          <template v-else-if="page_title">
            {{ page_title }}
          </template>
        </q-toolbar-title>
      </q-toolbar>

      <div class="q-pl-md q-pr-md">
        <FeedFilterPage
          ref="ref_feed_filter"
          @after-applyfilter="afterApplyfilter"
          :search_mode="search_mode"
        ></FeedFilterPage>
      </div>

      <q-space class="q-pa-xs"></q-space>
    </q-header>

    <q-page>
      <q-scroll-observer @scroll="onScroll" />

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
              {{ total_pretty }}
            </template>
          </DIV>

          <q-list class="no-wrap">
            <template v-for="items in data" :key="items">
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
              <div v-if="items.items_list" class="q-mb-md q-mt-sm">
                <CarouselItems
                  :items="items.items_list ? items.items_list : null"
                ></CarouselItems>
              </div>
            </template>
          </q-list>

          <template v-if="!hasMore && !loading && hasData">
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
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent, ref } from "vue";
import { useCartStore } from "stores/CartStore";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import config from "src/api/config";
import auth from "src/api/auth";

export default {
  name: "FeedLocation",
  components: {
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
    MerchantListTpl: defineAsyncComponent(() =>
      import("components/MerchantListTpl.vue")
    ),
    FeedFilterPage: defineAsyncComponent(() =>
      import("components/FeedFilterPage.vue")
    ),
  },
  data() {
    return {
      data: [],
      loading: false,
      current_page: 1,
      featured_id: null,
      isScrolled: false,
      scroll_disabled: true,
      hasMore: true,
      params: {},
      location_data: null,
      total_pretty: "",
      featured_data: null,
      filters: null,
      active_filers: null,
    };
  },
  setup() {
    const CartStore = useCartStore();
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { CartStore, DataStore, DataStorePersisted };
  },
  created() {
    this.featured_id = this.$route.query.featured_id;
    this.cuisine_id = parseInt(this.$route.query.cuisine_id);
    this.cuisine_name = this.$route.query.cuisine_name;
    this.page_title = this.$route.query.page_title;

    if (this.cuisine_id > 0) {
      this.filters = {
        cuisine: [this.cuisine_id],
      };
    }

    this.featured_data = this.DataStore.attributes_data?.featured_data || null;

    if (!this.DataStore.hasDataCuisine() && this.cuisine_id <= 0) {
      this.DataStore.CuisineList();
    }
  },
  mounted() {
    if (this.DataStore.cuisine.length <= 0) {
      this.DataStore.CuisineList();
    }

    if (this.DataStore.feed_page_filter?.cuisine) {
      this.filters = this.DataStore.feed_page_filter;
    }
    this.active_filers = {
      featured_id: this.featured_id,
      filters: this.filters,
    };

    this.location_data = this.DataStorePersisted.getLocation;

    if (
      this.DataStore.feed_saved_items.length > 0 &&
      JSON.stringify(this.DataStore.feed_saved_filters) ===
        JSON.stringify(this.active_filers) &&
      JSON.stringify(this.location_data) ==
        JSON.stringify(this.DataStore.saved_location_data)
    ) {
      console.log("same data");
      this.data = this.DataStore.feed_saved_items;
      this.current_page = this.DataStore.feed_saved_currentpage;
      this.hasMore = this.DataStore.feed_saved_has_more;
      this.total_pretty = this.DataStore.feed_saved_total;
    } else {
      console.log("new filters");
      this.DataStore.clearFeedSavedData();
    }

    this.scroll_disabled = false;

    this.search_mode = this.DataStore.getSearchMode;
  },
  beforeUnmount() {
    this.DataStore.feed_featured_id = this.featured_id;
    this.DataStore.feed_saved_items = this.data;
    this.DataStore.feed_saved_currentpage = this.current_page;
    this.DataStore.feed_saved_has_more = this.hasMore;
    this.DataStore.feed_saved_total = this.total_pretty;
    this.DataStore.feed_saved_filters = {
      featured_id: this.featured_id,
      filters: this.filters,
    };
    this.DataStore.saved_location_data = this.location_data;
  },
  computed: {
    hasData() {
      return Object.keys(this.data).length > 0;
    },
  },
  methods: {
    onScroll(info) {
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
      console.log("afterApplyfilter", value);
      this.active_filers = {
        featured_id: this.featured_id,
        filters: value,
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

        this.params = {};
        this.params.page = this.current_page;
        this.params.state_id = this.location_data?.state_id || "";
        this.params.city_id = this.location_data?.city_id || "";
        this.params.area_id = this.location_data?.area_id || "";
        this.params.postal_id = this.location_data?.postal_id || "";

        if (this.featured_id) {
          this.params.featured = JSON.stringify([this.featured_id]);
        }
        if (this.filters) {
          this.params.filters = JSON.stringify(this.filters);
        }

        this.loading = true;
        const methods = auth.authenticated() ? "getFeedAuthV1" : "getFeedV1";

        const response = await APIinterface.fetchGet(
          `${config.api_location}/${methods}`,
          this.params
        );

        this.current_page++;

        this.total_pretty = response.details.total_pretty;
        this.data = [...this.data, ...response.details.data];

        if (response.details.is_last_page) {
          this.hasMore = false;
          done(true);
          return;
        }

        done();
      } catch (error) {
        this.hasMore = false;
        console.log("error", error);
        done(true);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
