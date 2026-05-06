<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header reveal reveal-offset="50" class="bg-transparent q-pa-sm">
      <div class="tagam-account-header-shell">
        <q-toolbar class="q-px-xs">
          <q-btn
            @click="$router.back()"
            flat
            round
            dense
            icon="las la-angle-left"
            class="q-mr-sm"
            :color="$q.dark.mode ? 'white' : 'dark'"
          />
          <q-toolbar-title class="text-weight-bold">{{
            $t("Favourites")
          }}</q-toolbar-title>
        </q-toolbar>
      </div>
    </q-header>
    <q-page class="tagam-page-shell q-px-md q-pb-xl">
      <q-scroll-observer @scroll="onScroll" />
      <section class="tagam-section-shell q-mt-lg">
        <div class="tagam-section-heading tagam-section-heading--stacked">
          <div>
            <div class="tagam-section-heading__eyebrow">{{ $t("My Account") }}</div>
            <div class="tagam-section-heading__title">{{ $t("Favourites") }}</div>
          </div>
          <div class="tagam-section-heading__meta">
            {{ $t("Saved restaurants and items") }}
          </div>
        </div>
        <div class="tagam-list-card q-pa-sm">
          <q-tabs
            v-model="tab"
            dense
            narrow-indicator
            no-caps
            active-color="'blue-grey-6"
            active-bg-color="orange-1"
            indicator-color="transparent"
            active-class="text-blue-grey-6"
            class="custom-tabs"
            :mobile-arrows="$q.capacitor ? false : true"
            @update:model-value="tabChange"
          >
            <template v-for="items in tabs" :key="items">
              <q-tab
                :name="items.name"
                :label="items.label"
                class="radius28 bg-mygrey1"
              />
            </template>
          </q-tabs>

          <q-tab-panels
            v-model="tab"
            animated
            transition-prev="slide-down"
            transition-next="slide-up"
            style="min-height: calc(60vh)"
          >
            <template v-for="items in tabs" :key="items">
              <q-tab-panel :name="items.name" class="q-pl-none q-pr-none">
                <q-infinite-scroll
                  ref="nscroll"
                  @load="fetchFavourites"
                  :offset="100"
                  :disable="scroll_disabled"
                >
                  <template v-slot:default>
                    <template v-if="!hasData && !loading">
                      <div class="absolute-center">
                        <div class="text-subtitle2 tagam-page-copy">
                          {{ $t("No data available") }}
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <template v-if="tab == 'restaurant'">
                        <q-list separator>
                          <transition-group
                            appear
                            leave-active-class="animated fadeOut"
                          >
                            <template v-for="(items, row) in data" :key="items">
                              <q-item
                                class="q-pl-none q-pr-none"
                                clickable
                                v-ripple:purple
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
                                  :row="row"
                                  :enabled_review="DataStore.enabled_review"
                                  @after-savefav="afterSavefav"
                                />
                              </q-item>
                            </template>
                          </transition-group>
                        </q-list>
                      </template>
                      <template v-else-if="tab == 'item'">
                        <q-list separator>
                          <transition-group
                            appear
                            leave-active-class="animated fadeOut"
                          >
                            <template v-for="(items, row) in data" :key="items">
                              <q-item
                                class="q-pl-none q-pr-none tagam-account-row"
                                clickable
                                @click.stop="showItemdetails(items)"
                              >
                                <q-item-section avatar top>
                                  <q-responsive
                                    style="width: 110px; height: 90px"
                                  >
                                    <q-img
                                      :src="items.url_image"
                                      placeholder-src="placeholder.png"
                                      lazy
                                      fit="scale-down"
                                      class="radius8"
                                      spinner-color="primary"
                                      spinner-size="sm"
                                    />
                                  </q-responsive>
                                </q-item-section>
                                <q-item-section top>
                                  <q-item-label>
                                    <div
                                      class="text-weight-bold text-subtitle2 relative-position"
                                    >
                                      {{ items.item_name }}
                                      <div class="absolute-top-right">
                                        <FavsItem
                                          ref="favs"
                                          :layout="3"
                                          :item_token="items.item_uuid"
                                          :cat_id="items.cat_id"
                                          :active="items.save_fav"
                                          :data="items"
                                          :row="row"
                                          @after-savefav="afterSavefavItem"
                                        />
                                      </div>
                                    </div>
                                  </q-item-label>
                                  <q-item-label
                                    caption
                                    class="ellipsis-2-lines"
                                  >
                                    <div v-html="items.item_description"></div>
                                  </q-item-label>
                                  <q-item-label>
                                    <div
                                      class="text-caption text-weight-medium"
                                    >
                                      {{ items.lowest_price }}
                                    </div>
                                    <div v-if="!items.item_available">
                                      <q-badge
                                        color="disabled"
                                        text-color="disabled"
                                        :label="$t('Not available')"
                                        rounded
                                      />
                                    </div>
                                  </q-item-label>
                                </q-item-section>
                              </q-item>
                            </template>
                          </transition-group>
                        </q-list>
                      </template>
                    </template>
                  </template>

                  <template v-slot:loading>
                    <div
                      class="row q-gutter-x-sm justify-center q-my-md"
                      :class="{
                        'absolute-center text-center full-width': page == 1,
                        'absolute-bottom text-center full-width': page != 1,
                      }"
                    >
                      <q-spinner-ios size="sm" />
                      <div class="text-subtitle1 text-grey">
                        {{ $t("Loading") }}...
                      </div>
                    </div>
                  </template>
                </q-infinite-scroll>
              </q-tab-panel>
            </template>
          </q-tab-panels>
        </div>
      </section>

      <component
        :is="ItemComponents"
        ref="item_details"
        :slug="slug"
        :money_config="DataStore?.money_config || null"
        :currency_code="DataStorePersisted.useCurrency"
        :cart_uuid="DataStorePersisted.cart_uuid"
        @after-additems="afterAdditems"
      />

      <template v-if="CartStore.hasItem && !CartStore.cart_loading">
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
          <q-btn
            fab
            icon="eva-shopping-cart-outline"
            color="orange-5"
            padding="0.8em"
            to="/cart"
          >
            <q-badge v-if="CartStore.hasItem" color="red" floating rounded>
              {{ CartStore.getCartCount }}
            </q-badge>
          </q-btn>
        </q-page-sticky>
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useCartStore } from "src/stores/CartStore";
import { useClientStore } from "stores/ClientStore";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "src/stores/DataStore";
import auth from "src/api/auth";

export default {
  name: "FavouritesPage",
  components: {
    MerchantListTpl: defineAsyncComponent(() =>
      import("components/MerchantListTpl.vue")
    ),
    FavsItem: defineAsyncComponent(() => import("components/FavsItem.vue")),
    // ItemDetailsCheckbox: defineAsyncComponent(() =>
    //   import("components/ItemDetailsCheckbox.vue")
    // ),
  },
  data() {
    return {
      loading: false,
      slug: null,
      isScrolled: false,
      data: [],
      page: 0,

      current_page: 1,
      scroll_disabled: true,
      hasMore: true,
      params: {},

      search_mode: null,
      tab: "restaurant",
      tabs: [
        {
          name: "restaurant",
          label: this.$t("Restaurants"),
        },
        {
          name: "item",
          label: this.$t("Items"),
        },
      ],
      payload: [
        "items",
        "subtotal",
        "distance_local_new",
        "items_count",
        "merchant_info",
        "check_opening",
        "transaction_info",
      ],
    };
  },
  setup() {
    const ClientStore = useClientStore();
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    const CartStore = useCartStore();

    const addons_use_checkbox = DataStore.addons_use_checkbox ?? true;
    const ItemComponents = defineAsyncComponent(() =>
      addons_use_checkbox
        ? import("components/ItemDetailsCheckbox.vue")
        : import("components/ItemDetails.vue")
    );

    return {
      ClientStore,
      DataStorePersisted,
      DataStore,
      CartStore,
      ItemComponents,
    };
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  mounted() {
    this.search_mode = this.DataStore.getSearchMode;
    this.location_data = this.DataStorePersisted.getLocation;
    this.CartStore.getCart(true, null, "");

    if (this.DataStore.fav_saved_data) {
      this.data = this.DataStore.fav_saved_data;
      this.current_page = this.DataStore.fav_saved_current_page;
      this.hasMore = this.DataStore.fav_saved_has_more;
      this.tab = this.DataStore.fav_saved_tab;
    }

    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.DataStore.fav_saved_tab = this.tab;
    this.DataStore.fav_saved_current_page = this.current_page;
    this.DataStore.fav_saved_data = this.data;
    this.DataStore.fav_saved_has_more = this.hasMore;
  },
  methods: {
    afterSavefav(row) {
      this.data.splice(row, 1);
      // CLEAR HOME FILTERS
      this.DataStore.feed_filter = [];
    },
    checkBeforeCheckout() {
      if (!this.DataStorePersisted.hasCoordinates) {
        this.$router.push({
          path: "/location/map",
          query: { url: "/checkout" },
        });
        return;
      }

      if (!auth.authenticated()) {
        this.$router.push({
          path: "/user/login",
          query: { redirect: "/checkout" },
        });
        return;
      }

      this.$router.push({
        path: "/checkout",
      });
    },
    afterAdditems(cart_uuid) {
      this.DataStorePersisted.cart_uuid = cart_uuid;
      this.CartStore.getCart(true, null, "");
    },
    showItemdetails(value) {
      console.log("showItemdetails", value.item_available);
      if (!value.item_available) {
        APIinterface.ShowAlert(
          this.$t("This item is not available"),
          this.$q.capacitor,
          this.$q
        );
        return;
      }
      const params = {
        cat_id: value.cat_id,
        item_uuid: value.item_uuid,
        slug: value.merchant_id,
        currency_code: this.DataStorePersisted.getUseCurrency(),
      };
      this.$refs.item_details.showItem2(params, value.merchant_id);
    },
    afterSavefavItem(data, items, row) {
      console.log("row", row);
      data.save_fav = items;
      this.data.splice(row, 1);
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    tabChange(value) {
      this.resetPage();
    },
    refresh(done) {
      done();
      this.resetPage();
    },
    resetPage() {
      console.log("resetPage", this.$refs.nscroll);
      this.page = 0;
      this.data = [];
      this.current_page = 1;
      this.hasMore = true;
      this.scroll_disabled = false;
      this.$nextTick(() => {
        this.$refs.nscroll[0]?.resume?.();
        this.$refs.nscroll[0]?.trigger?.();
      });
    },
    async fetchFavourites(index, done) {
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
        this.page = index;

        this.params = {};
        if (this.search_mode == "address") {
          this.params = {
            page: this.current_page,
            lat: this.DataStorePersisted?.coordinates?.lat,
            lng: this.DataStorePersisted?.coordinates?.lng,
          };
        } else if (this.search_mode == "location") {
          this.params = {
            page: this.current_page,
            state_id: this.location_data?.state_id || "",
            city_id: this.location_data?.city_id || "",
            area_id: this.location_data?.area_id || "",
            postal_id: this.location_data?.postal_id || "",
          };
        }

        let methods = null;
        if (this.tab == "restaurant") {
          const methodsMap = {
            address: "fetchFavourites",
            location: "fetchFavouritesLocation",
          };
          methods = methodsMap[this.search_mode] || "fetchFavourites";
        } else {
          methods = "fetchFavouritesItems";
        }

        const results = await APIinterface.fetchDataByTokenGet(
          methods,
          this.params
        );

        this.current_page++;
        this.data = [...this.data, ...results.details.data];

        if (results.details?.is_last_page) {
          this.hasMore = false;
          done(true);
          return;
        }

        done();
      } catch (error) {
        this.hasMore = false;
        done(true);
        return;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.custom-tabs .q-tab {
  margin-right: 16px; /* Add spacing between tabs */
}

.custom-tabs .q-tab:last-child {
  margin-right: 0; /* Remove margin for the last tab */
}
.q-tabs__content--align-justify .q-tab {
  flex: initial !important;
}
</style>
