<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header
      :class="{
        'shadow-bottom': isScrolled,
      }"
      class="text-dark"
    >
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">
          {{ $t("Offers") }}
        </q-toolbar-title>
      </q-toolbar>
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
                :message="$t('Oops! No Offers Right Now')"
                :description="
                  $t(
                    'It looks like there are no offers available at the moment. Check back soon for exciting deals and discounts from your favorite restaurants!'
                  )
                "
              ></NoResults>
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
                  @after-savefav="afterSavefav"
                />
              </q-item>
              <div v-if="items.items_list" class="q-mb-md q-mt-sm">
                <CarouselItems
                  :items="items.items_list ? items.items_list : null"
                ></CarouselItems>
              </div>
            </template>
          </q-list>

          <template v-if="!hasMore && !loading && hasData && current_page > 2">
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
    this.filters = {
      offers_filters: ["accept_vouchers", "accept_deals"],
    };
  },
  mounted() {
    this.location_data = this.DataStorePersisted.getLocation;

    this.active_filers = {
      filters: this.filters,
    };

    if (
      this.DataStore.feed_saved_items.length > 0 &&
      JSON.stringify(this.DataStore.feed_saved_filters) ===
        JSON.stringify(this.active_filers) &&
      JSON.stringify(this.location_data) ==
        JSON.stringify(this.DataStore.saved_location_data)
    ) {
      this.data = this.DataStore.feed_saved_items;
      this.current_page = this.DataStore.feed_saved_currentpage;
      this.hasMore = this.DataStore.feed_saved_has_more;
      this.total_pretty = this.DataStore.feed_saved_total;
    } else {
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
    afterSavefav() {
      // CLEAR HOME PAGE FILTER AND FAV
      this.DataStore.feed_filter = [];
      this.DataStore.fav_saved_data = null;
    },
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
