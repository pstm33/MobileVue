<template>
  <div v-if="done_fetch" class="text-h6 text-weight-medium">
    {{ title }}
  </div>

  <q-infinite-scroll
    @load="fetchData"
    :offset="300"
    ref="nscroll"
    :disable="scroll_disabled"
  >
    <template v-slot:default>
      <template v-if="!hasMore && !hasData">
        <div
          class="text-subtitle2 text-grey text-center full-width q-pa-md"
          :class="{ 'absolute-center': full_page }"
        >
          {{ no_data_label }}
        </div>
      </template>

      <q-list class="no-wrap tagam-feed-result-list">
        <template v-for="items in data" :key="items">
          <div
            class="tagam-feed-result-item"
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
              :enabled_review="filters.enabled_review"
              @after-savefav="afterSavefav"
            />
          </div>
          <div v-if="items.items_list" class="tagam-feed-result-carousel">
            <CarouselItems
              :items="items.items_list ? items.items_list : null"
            ></CarouselItems>
          </div>
          <template v-if="full_page">
            <q-separator></q-separator>
          </template>
        </template>
      </q-list>
    </template>

    <template v-slot:loading>
      <div
        class="row q-gutter-x-sm justify-center q-my-md"
        :class="{
          'absolute-center text-center full-width': current_page == 1,
        }"
      >
        <q-circular-progress indeterminate rounded size="sm" color="primary" />
        <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
      </div></template
    >
  </q-infinite-scroll>

  <q-page-scroller
    position="bottom-right"
    :scroll-offset="150"
    :offset="[18, 18]"
    v-if="!this.$q.capacitor"
  >
    <q-btn
      fab
      icon="keyboard_arrow_up"
      color="mygrey"
      text-color="dark"
      dense
      padding="3px"
    />
  </q-page-scroller>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { useDataStore } from "stores/DataStore";
import config from "src/api/config";

export default {
  name: "FeedResults",
  emits: ["after-results"],
  props: [
    "filters",
    "title",
    "full_page",
    "no_data_label",
    "currency_code",
    "coordinates",
    "has_filters",
    "location_data",
    "search_mode",
    "islogin",
  ],
  components: {
    MerchantListTpl: defineAsyncComponent(() =>
      import("components/MerchantListTpl.vue")
    ),
    CarouselItems: defineAsyncComponent(() =>
      import("components/CarouselItems.vue")
    ),
  },
  data() {
    return {
      data: [],
      loading: false,
      params: null,
      current_page: 1,
      scroll_disabled: true,
      hasMore: true,
      active_filers: null,
      done_fetch: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  mounted() {
    if (this.search_mode == "address") {
      this.active_filers = {
        filters: this.filters,
        coordinates: this.coordinates,
        islogin: this.islogin,
      };
    } else if (this.search_mode == "location") {
      this.active_filers = {
        filters: this.filters,
        location_data: this.location_data,
        islogin: this.islogin,
      };
    }

    if (
      this.DataStore.feedresults_data.length > 0 &&
      JSON.stringify(this.active_filers) ==
        JSON.stringify(this.DataStore.feedresults_filters)
    ) {
      //console.log("same data");
      this.data = this.DataStore.feedresults_data;
      this.current_page = this.DataStore.feedresults_current_page;
      this.hasMore = this.DataStore.feedresults_has_more;
    } else {
      //console.log("new filter");
      this.DataStore.feedresults_data = [];
      this.DataStore.feedresults_current_page = null;
      this.DataStore.feedresults_has_more = null;
      this.DataStore.feedresults_filters = null;
    }
    this.scroll_disabled = false;
  },
  beforeUnmount() {
    console.log("beforeUnmount");
    this.DataStore.feedresults_data = this.data;
    this.DataStore.feedresults_current_page = this.current_page;
    this.DataStore.feedresults_has_more = this.hasMore;

    if (this.search_mode == "address") {
      this.DataStore.feedresults_filters = {
        filters: this.filters,
        coordinates: this.coordinates,
        islogin: this.islogin,
      };
    } else if (this.search_mode == "location") {
      this.DataStore.feedresults_filters = {
        filters: this.filters,
        location_data: this.location_data,
        islogin: this.islogin,
      };
    }
  },
  computed: {
    hasData() {
      return Object.keys(this.data).length > 0;
    },
  },
  methods: {
    afterSavefav() {
      console.log("afterSavefav yy");
      // CLEAR FAVORITES PAGE
      this.DataStore.fav_saved_data = null;
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
      //console.log("resetData xx");

      this.DataStore.feedresults_data = [];
      this.DataStore.feedresults_current_page = null;
      this.DataStore.feedresults_has_more = null;
      this.DataStore.feedresults_filters = null;

      this.data = [];
      this.current_page = 1;
      this.hasMore = true;
      this.scroll_disabled = false;
      this.$nextTick(() => {
        this.$refs.nscroll?.resume?.();
        this.$refs.nscroll?.trigger?.();
      });
    },
    async fetchData(index, done) {
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
        let response = null;

        if (this.search_mode == "location") {
          this.params = {};
          this.params.page = this.current_page;
          this.params.transaction_type = this.DataStore.filter_order_type ?? "";
          this.params.filters = JSON.stringify(this.filters?.filters);

          this.params.state_id = this.location_data?.state_id || "";
          this.params.city_id = this.location_data?.city_id || "";
          this.params.area_id = this.location_data?.area_id || "";
          this.params.state_id = this.location_data?.state_id || "";
          this.params.postal_id = this.location_data?.postal_id || "";

          const methods = this.islogin ? "getFeedAuthV1" : "getFeedV1";
          response = await APIinterface.fetchGet(
            `${config.api_location}/${methods}`,
            this.params
          );
        } else if (this.search_mode == "address") {
          this.params = this.filters;
          this.params.page = this.current_page;
          this.params.coordinates = this.coordinates;
          if (this.islogin) {
            response = await APIinterface.fetchDataByToken(
              "getMerchantFeedAuth",
              this.params
            );
          } else {
            response = await APIinterface.fetchData(
              "getMerchantFeed",
              this.params
            );
          }
        }

        this.current_page++;
        this.data = [...this.data, ...response.details.data];
        this.$emit("after-results", this.data);

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
        this.done_fetch = true;
        this.loading = false;
      }
      //
    },
  },
};
</script>

<style scoped>
.tagam-feed-result-item {
  display: block !important;
  width: 100% !important;
  padding: 0 !important;
  min-height: auto !important;
  margin-bottom: 8px;
}

.tagam-feed-result-list {
  padding: 0 !important;
}

.tagam-feed-result-carousel {
  margin-top: 2px;
  margin-bottom: 10px;
}

:deep(.tagam-feed-result-item .q-focus-helper) {
  display: none;
}
</style>
