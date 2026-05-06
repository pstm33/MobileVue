<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header class="text-dark tagam-orders-header">
      <div class="tagam-orders-header-shell">
      <q-toolbar v-if="!isScrolled" class="tagam-orders-toolbar">
        <template v-if="ispage">
          <q-btn
            to="/account-menu"
            flat
            round
            dense
            icon="eva-arrow-back-outline"
          />
        </template>
        <q-toolbar-title>
          <div class="tagam-orders-toolbar__eyebrow">{{ $t("Account") }}</div>
          <div class="tagam-orders-toolbar__title">{{ $t("Orders") }}</div>
        </q-toolbar-title>
      </q-toolbar>

      <q-tabs
        v-model="DataStore.order_tab"
        dense
        active-color="primary"
        active-class="active-tabs"
        indicator-color="primary"
        align="justify"
        no-caps
        mobile-arrows
        narrow-indicator
        @update:model-value="onTabClick"
        class="tagam-orders-tabs"
      >
        <q-tab
          name="recent"
          :label="$t('Recent')"
          no-caps
          active-class="active-tabs"
        />
        <q-tab name="past" :label="$t('Past Orders')" no-caps />
        <q-tab name="search" no-caps v-if="isScrolled">
          <q-intersection transition="slide-left">
            <div
              class="bg-grey-2 text-subtitle2 q-pa-xs radius28 flex justify-center cursor-pointer"
              @click="this.$refs.ref_search.modal = true"
            >
              <div class="q-mr-sm">
                <q-icon name="eva-search-outline" size="20px"></q-icon>
              </div>
              <div class="text-weight-bold">{{ $t("Search") }}</div>
            </div>
          </q-intersection>
        </q-tab>
      </q-tabs>
      <q-separator></q-separator>
      </div>
    </q-header>
    <q-page class="tagam-orders-page">
      <q-scroll-observer @scroll="onScroll" />

      <template v-if="!is_login">
        <div class="text-center q-pa-md absolute-center full-width">
          <div class="text-h6 line-normal text-weight-bold text-dark">
            {{ $t("You are not logged in") }}
          </div>
          <div class="text-caption text-grey">
            {{ $t("please login to continue") }}
          </div>
          <div class="q-mt-md">
            <q-btn
              no-caps
              rounded
              :label="$t('Login')"
              color="primary"
              unelevated
              padding="7px 30px"
              :to="DataStore.getLoginRedirect('/home/orders')"
            ></q-btn>
          </div>
        </div>
      </template>
      <template v-else>
        <q-space class="q-pa-sm"></q-space>

        <template v-if="!hasData && !loading">
          <NoResults
            :message="$t('noOrders')"
            :description="$t('letsChangeThat')"
          ></NoResults>
        </template>

        <q-infinite-scroll
          ref="nscroll"
          @load="fetchData"
          :offset="100"
          :initial-index="getCurrentPage"
        >
          <div class="q-pl-md q-pr-md q-pb-sm">
            <div
              class="tagam-orders-search flex items-center cursor-pointer"
              @click="this.$refs.ref_search.modal = true"
            >
              <div class="q-mr-sm">
                <q-icon name="eva-search-outline" size="20px"></q-icon>
              </div>
              <div class="text-caption">
                {{ $t("Order ID") }}
              </div>
            </div>
          </div>

          <q-list>
            <template v-for="items in Orders" :key="items">
              <q-item clickable v-ripple:purple @click="showDetails(items)" class="tagam-order-card">
                <q-item-section avatar top>
                  <q-avatar>
                    <q-responsive style="width: 50px; height: 50px">
                      <q-img
                        :src="items.merchant_logo"
                        lazy
                        fit="cover"
                        class="radius8"
                        spinner-color="amber"
                        spinner-size="sm"
                      />
                    </q-responsive>
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label v-if="items.show_status">
                    <div
                      class="text-overline text-orange text-weight-bold line-normal text-capitalize"
                    >
                      {{ items.status }}
                    </div>
                  </q-item-label>
                  <q-item-label class="subtitle-2 text-weight-bold tagam-order-card__title">{{
                    items.restaurant_name
                  }}</q-item-label>
                  <q-item-label caption>
                    #{{ items.order_id }} &bull; {{ items.date_created }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side v-if="!items.show_status">
                  <q-item-label>{{ items.total }}</q-item-label>
                  <q-item-label caption>{{ items.earn_points }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item class="tagam-order-card__actions">
                <q-item-section class="myqstepper tagam-order-card__actions-main">
                  <template v-if="items.is_order_ongoing">
                    <TrackingProgress
                      :order_progress="items.progress?.order_progress"
                      :order_type="items.order_type || 'delivery'"
                    ></TrackingProgress>
                  </template>
                  <template v-else>
                      <div class="flex q-gutter-x-md items-center tagam-order-card__action-row">
                      <q-btn
                        v-if="items.show_review"
                        :label="$t('Rate')"
                        text-color="blue-grey-6"
                        dense
                        padding="0px"
                        flat
                        no-caps
                        @click="showReview(items)"
                      >
                        <q-btn
                          dense
                          padding="0px"
                          no-caps
                          rounded
                          color="amber-5"
                          text-color="white"
                          unelevated
                          icon="star"
                          size="xs"
                          class="q-ml-sm"
                        >
                        </q-btn>
                      </q-btn>

                      <q-btn
                        v-if="items.show_review_delivery"
                        :label="$t('Rate Delivery')"
                        text-color="blue-grey-6"
                        dense
                        padding="0px"
                        flat
                        no-caps
                        @click="showReviewdelivery(items)"
                      >
                        <q-btn
                          dense
                          padding="0px"
                          no-caps
                          rounded
                          color="orange"
                          text-color="white"
                          unelevated
                          icon="delivery_dining"
                          size="xs"
                          class="q-ml-sm"
                        >
                        </q-btn>
                      </q-btn>

                      <q-btn
                        :label="$t('Reorder')"
                        text-color="blue-grey-6"
                        dense
                        padding="0px"
                        flat
                        no-caps
                        @click="reOrder(items.order_uuid)"
                      >
                        <q-btn
                          dense
                          padding="0px"
                          no-caps
                          rounded
                          color="secondary"
                          text-color="white"
                          unelevated
                          icon="eva-arrow-forward-outline"
                          size="xs"
                          class="q-ml-sm"
                        >
                        </q-btn>
                      </q-btn>
                    </div>
                  </template>
                </q-item-section>
              </q-item>
            </template>
          </q-list>

          <template v-if="DataStore.orders_no_more_data && !loading && hasData">
            <div
              class="row q-gutter-x-sm justify-center"
              :class="{
                'absolute-bottom-left text-center full-width ':
                  getCurrentPage > 0 && getTotalData <= 10,
              }"
            >
              <div class="text-subtitle1 text-grey">
                {{ $t("end of results") }}
              </div>
            </div>
          </template>

          <template v-slot:loading>
            <div
              class="row q-gutter-x-sm justify-center q-my-md"
              :class="{
                'absolute-center text-center full-width': getCurrentPage == 0,
                'absolute-bottom-left text-center full-width ':
                  getCurrentPage > 0 && getTotalData <= 10,
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
      </template>
      <q-space class="q-pa-md"></q-space>

      <OrderListSearch
        ref="ref_search"
        @onReorder="reOrder"
        @showDetails="showDetails"
        @showReview="showReview"
      ></OrderListSearch>

      <OrderDetails
        ref="ref_orderdetails"
        :order_uuid="order_uuid"
        @onclose-order="oncloseOrder"
        :show_actions="true"
        @on-ratereview="showReview"
        @onReorder="reOrder"
      ></OrderDetails>

      <ReviewOrder ref="ref_order" @after-addreview="resetData"></ReviewOrder>

      <ReviewDelivery
        ref="ref_delivery"
        @after-addreview="resetData"
      ></ReviewDelivery>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import "swiper/css";
import { defineAsyncComponent } from "@vue/runtime-core";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import auth from "src/api/auth";

export default {
  name: "OrderList",
  components: {
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
    OrderListSearch: defineAsyncComponent(() =>
      import("components/OrderListSearch.vue")
    ),
    OrderDetails: defineAsyncComponent(() =>
      import("components/OrderDetails.vue")
    ),
    ReviewOrder: defineAsyncComponent(() =>
      import("components/ReviewOrder.vue")
    ),
    ReviewDelivery: defineAsyncComponent(() =>
      import("components/ReviewDelivery.vue")
    ),
    TrackingProgress: defineAsyncComponent(() =>
      import("components/TrackingProgress.vue")
    ),
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, DataStorePersisted };
  },
  data() {
    return {
      q: "",
      data: [],
      isScrolled: false,
      is_login: false,
      loading: false,
      params: {},
      order_uuid: null,
      ispage: false,
    };
  },
  mounted() {
    this.is_login = auth.authenticated();
    this.ispage = this.$route.query.page;
    this.ispage = this.ispage == "true" ? true : false;
    this.$nextTick(() => {
      this.syncOrdersOnEnter();
    });
  },
  activated() {
    this.$nextTick(() => {
      this.syncOrdersOnEnter();
    });
  },
  computed: {
    Orders() {
      return this.DataStore.orders_list;
    },
    getCurrentPage() {
      return this.DataStore.PageIndexOrders
        ? this.DataStore.PageIndexOrders - 1
        : 0;
    },
    getTotalData() {
      return this.DataStore.orders_list ? this.DataStore.orders_list.length : 0;
    },
    hasData() {
      return this.DataStore.orders_list ? this.DataStore.orders_list : false;
    },
    getPage() {
      if (this.params) {
        if (this.params.page) {
          return this.params.page;
        }
      }
      return null;
    },
  },
  methods: {
    syncOrdersOnEnter() {
      if (!this.is_login) {
        return;
      }

      if (this.DataStore.order_tab === "search") {
        this.DataStore.order_tab = "recent";
      }

      this.resetData();
    },
    showReviewdelivery(value) {
      this.$refs.ref_delivery.show(value);
    },
    showReview(value) {
      this.$refs.ref_order.show(value);
    },
    async reOrder(value) {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const results = await APIinterface.orderBuyAgain({
          order_uuid: value,
        });
        this.DataStorePersisted.cart_uuid = results.details.cart_uuid;
        this.$router.push("/cart");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    oncloseOrder(value) {
      if (value) {
        this.resetData();
      }
    },
    showDetails(value) {
      if (value.is_order_ongoing) {
        this.$router.push({
          path: "/account/trackorder",
          query: { order_uuid: value.order_uuid, back_url: "/account/orders?page=true" },
        });
      } else {
        this.order_uuid = value.order_uuid;
        this.$refs.ref_orderdetails.modal = true;
      }
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    refresh(done) {
      setTimeout(() => {
        done();
      }, 100);
      this.resetData();
    },
    onTabClick(value) {
      console.log("onTabClick", value);
      if (value != "search") {
        this.resetData();
      }
    },
    resetData() {
      this.DataStore.clearOrders();
      this.DataStore.orders_no_more_data = false;
      if (!this.$refs.nscroll) {
        return;
      }
      this.$refs.nscroll.reset();
      this.$refs.nscroll.resume();
      this.$refs.nscroll.trigger();
    },
    async fetchData(index, done) {
      console.log("fetchData", index);
      if (this.loading) {
        done();
        return;
      }
      if (this.DataStore.orders_no_more_data) {
        done(true);
        return;
      }
      this.loading = true;

      this.params.page = index;
      this.params.order_type = this.DataStore.order_tab;
      this.DataStore.setCurrentPageOrders(index);
      try {
        const result = await APIinterface.fetchDataByTokenGet(
          "OrderList",
          this.params
        );
        console.log("result", result);

        if (result.code == 3) {
          this.DataStore.orders_no_more_data = true;
          done(true);
        } else if (result.code == 1) {
          if (!this.DataStore.isDataLoadedOrders) {
            this.DataStore.setOrders(result.details.data);
          } else {
            this.DataStore.appendOrders(result.details.data);
          }
        }
      } catch (error) {
        if (this.$refs.nscroll) {
          this.$refs.nscroll.stop();
        }
      } finally {
        this.loading = false;
        done();
      }
    },
  },
};
</script>

<style lang="scss">
.q-focus-helper {
  visibility: hidden;
}

.tagam-orders-page {
  background:
    radial-gradient(circle at top right, rgba(247, 199, 147, 0.2), transparent 28%),
    linear-gradient(180deg, #fbf6ec 0%, #f7f1e4 100%) !important;
}

.tagam-orders-header {
  background: transparent !important;
  box-shadow: none;
  padding: 10px 12px 0;
}

.tagam-orders-header-shell {
  background: rgba(255, 249, 240, 0.9);
  border: 1px solid rgba(113, 74, 24, 0.12);
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(70, 41, 12, 0.14);
  backdrop-filter: blur(16px);
}

.tagam-orders-toolbar {
  min-height: 72px;
}

.tagam-orders-toolbar__eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a6a4e;
}

.tagam-orders-toolbar__title {
  font-size: 19px;
  font-weight: 900;
  color: #20160f;
}

.tagam-orders-tabs {
  padding: 0 10px 10px;
}

.tagam-orders-search {
  min-height: 50px;
  padding: 0 16px;
  border: 1px solid rgba(113, 74, 24, 0.1);
  border-radius: 999px;
  background: rgba(255, 252, 246, 0.94);
  box-shadow: 0 12px 28px rgba(70, 41, 12, 0.08);
}

.tagam-order-card {
  margin: 0 16px 0;
  min-height: 88px;
  padding: 16px 18px 6px;
  border: 1px solid rgba(113, 74, 24, 0.1);
  border-radius: 24px 24px 0 0;
  border-bottom: 0;
  background: rgba(255, 252, 246, 0.96);
  box-shadow: 0 14px 30px rgba(71, 42, 13, 0.08);
  align-items: flex-start;
}

.tagam-order-card__title {
  color: #20160f;
  font-size: 18px;
}

.tagam-order-card__actions {
  margin: 0 16px 14px;
  min-height: 54px;
  padding: 2px 18px 10px;
  border: 1px solid rgba(113, 74, 24, 0.1);
  border-top: 0;
  border-radius: 0 0 24px 24px;
  background: rgba(255, 252, 246, 0.96);
  box-shadow: 0 14px 30px rgba(71, 42, 13, 0.06);
}

.tagam-order-card__actions-main {
  padding-left: 0 !important;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.tagam-order-card__action-row {
  flex-wrap: nowrap;
  width: 100%;
  justify-content: space-between;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
}

.tagam-order-card__action-row::-webkit-scrollbar {
  display: none;
}

:deep(.tagam-orders-page .q-tabs__content) {
  gap: 6px;
}

:deep(.tagam-orders-page .q-tab) {
  min-height: 42px;
  border-radius: 16px;
}

:deep(.tagam-orders-page .q-tab--active) {
  background: rgba(255, 243, 227, 0.92);
}

:deep(.tagam-orders-page .q-list) {
  background: transparent;
}

:deep(.tagam-order-card__actions .q-stepper) {
  width: 100%;
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.tagam-order-card__actions .q-stepper__header),
:deep(.tagam-order-card__actions .q-stepper__nav),
:deep(.tagam-order-card__actions .q-stepper__tab) {
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.tagam-order-card__actions .q-stepper__tab) {
  padding-left: 0;
  padding-right: 0;
  min-height: 40px;
}

:deep(.tagam-order-card__actions .q-stepper__tab-inner) {
  min-height: 40px;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

body.body--dark .tagam-orders-page {
  background:
    radial-gradient(circle at top left, rgba(241, 136, 0, 0.08), transparent 24%),
    radial-gradient(circle at top right, rgba(120, 71, 33, 0.12), transparent 22%),
    linear-gradient(180deg, #140f0d 0%, #191311 46%, #1f1815 100%) !important;
}

body.body--dark .tagam-orders-header-shell {
  background: rgba(33, 26, 23, 0.98) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: var(--tagam-shadow) !important;
}

body.body--dark .tagam-orders-toolbar__title,
body.body--dark .tagam-order-card__title,
body.body--dark .tagam-orders-page .text-dark,
body.body--dark .tagam-orders-page .text-subtitle1,
body.body--dark .tagam-orders-page .text-subtitle2 {
  color: var(--tagam-text) !important;
}

body.body--dark .tagam-orders-toolbar__eyebrow,
body.body--dark .tagam-orders-page .text-grey,
body.body--dark .tagam-orders-page .q-item__label--caption,
body.body--dark .tagam-order-card__meta {
  color: var(--tagam-text-muted) !important;
}

body.body--dark .tagam-orders-search,
body.body--dark .tagam-order-card,
body.body--dark .tagam-order-card__actions {
  background: rgba(39, 31, 27, 0.96) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: var(--tagam-shadow) !important;
}

body.body--dark .tagam-orders-page .q-tab {
  background: rgba(50, 39, 35, 0.96) !important;
  border: 1px solid var(--tagam-stroke) !important;
  color: var(--tagam-text-soft) !important;
}

body.body--dark .tagam-orders-page .q-tab--active {
  background: linear-gradient(
    135deg,
    var(--tagam-primary) 0%,
    var(--tagam-primary-strong) 100%
  ) !important;
  color: #fff8f1 !important;
}

body.body--dark .tagam-order-card__actions .q-stepper,
body.body--dark .tagam-order-card__actions .q-stepper__header,
body.body--dark .tagam-order-card__actions .q-stepper__nav,
body.body--dark .tagam-order-card__actions .q-stepper__tab {
  background: transparent !important;
}
</style>
