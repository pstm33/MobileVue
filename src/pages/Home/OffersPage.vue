<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header class="tagam-surface tagam-text-main q-pl-sm q-pr-sm">
      <q-toolbar v-if="!isScrolled">
        <q-toolbar-title shrink class="text-subtitle2 text-weight-bold">{{
          $t("Offers")
        }}</q-toolbar-title>
      </q-toolbar>

      <div
        class="q-pl-sm q-pr-sm"
        :class="{ 'tagam-text-muted': !isScrolled, 'text-subtitle1 text-weight-bold q-pb-sm ': isScrolled, }"
      >
        {{ total_found }}
      </div>
    </q-header>
    <q-page class="tagam-home-offers-page">
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
                :message="$t('No active offers yet')"
                :description="$t('Restaurants with current promos will appear here')"
              ></NoResults>
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
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { useCartStore } from "stores/CartStore";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import auth from "src/api/auth";

export default {
  name: "FeedPage",
  components: {
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
    MerchantListTpl: defineAsyncComponent(() =>
      import("components/MerchantListTpl.vue")
    ),
  },
  setup() {
    const CartStore = useCartStore();
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { CartStore, DataStore, DataStorePersisted };
  },
  data() {
    return {
      loading: false,
      data: [],
      isScrolled: false,
      current_page: 1,
      scroll_disabled: true,
      hasMore: true,
      total_found: null,
      params: {},
      payload: [
        "cuisine",
        "reviews",
        "estimation",
        "services",
        "items_min_max",
        "offers",
        "promo",
      ],
      active_filers: null,
    };
  },
  mounted() {
    this.active_filers = {
      coordinates: this.DataStorePersisted.coordinates,
      islogin: this.isLogin,
    };

    if (
      this.DataStore.offer_saved_data.data.length > 0 &&
      JSON.stringify(this.active_filers) ==
        JSON.stringify(this.DataStore.offer_filters)
    ) {
      this.data = this.DataStore.offer_saved_data?.data ?? [];
      this.current_page = this.DataStore.offer_saved_data?.current_page ?? 1;
      this.hasMore = this.DataStore.offer_saved_data?.hasMore ?? false;
      this.total_found = this.DataStore.offer_saved_data?.total_found ?? "";
    } else {
      this.DataStore.offer_saved_data = {
        data: [],
        current_page: null,
        hasMore: null,
        total_found: null,
      };
      this.DataStore.offer_filters = null;
    }
    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.DataStore.offer_saved_data = {
      data: this.data,
      current_page: this.current_page,
      hasMore: this.hasMore,
      total_found: this.total_found,
    };
    this.DataStore.offer_filters = {
      coordinates: this.DataStorePersisted.coordinates,
      islogin: this.isLogin,
    };
  },
  computed: {
    isLogin() {
      return auth.authenticated();
    },
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
          list_type: "promo",
          coordinates: this.DataStorePersisted.coordinates,
          payload: this.payload,
          page: this.current_page,
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







