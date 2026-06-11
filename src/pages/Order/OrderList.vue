<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header class="tagam-account-header">
      <q-toolbar v-if="!isScrolled">
        <template v-if="ispage">
          <q-btn
            @click="$router.back()"
            flat
            round
            dense
            icon="eva-arrow-back-outline"
          />
        </template>
        <q-toolbar-title class="text-subtitle2 text-weight-bold">{{
          $t("Orders")
        }}</q-toolbar-title>
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
              class="tagam-surface-muted text-subtitle2 q-pa-xs radius28 flex justify-center cursor-pointer"
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
    </q-header>
    <q-page class="tagam-account-page">
      <q-scroll-observer @scroll="onScroll" />

      <template v-if="!is_login">
        <div class="text-center q-pa-md absolute-center full-width">
          <div class="text-h6 line-normal text-weight-bold tagam-text-main">
            {{ $t("You are not logged in") }}
          </div>
          <div class="text-caption tagam-text-muted">
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
              class="tagam-surface text-subtitle2 q-pa-sm radius28 flex items-center cursor-pointer"
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

          <q-list class="tagam-order-list q-px-md q-gutter-y-md">
            <template v-for="items in Orders" :key="items">
              <div class="tagam-order-card">
              <q-item clickable v-ripple @click="showDetails(items)">
                <q-item-section avatar top>
                  <q-avatar class="tagam-order-logo">
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
                  <q-item-label class="subtitle-2 text-weight-bold">{{
                    items.restaurant_name
                  }}</q-item-label>
                  <q-item-label caption>
                    #{{ items.order_id }} &bull; {{ cleanText(items.date_created) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side v-if="!items.show_status">
                  <q-item-label>{{ items.total }}</q-item-label>
                  <q-item-label caption>{{ items.earn_points }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item class="tagam-order-progress-row">
                <q-item-section class="myqstepper">
                  <template v-if="items.is_order_ongoing">
                    <div class="tagam-order-live-status">
                      <div class="tagam-order-live-title">
                        {{ getOngoingStatusLabel(items) }}
                      </div>
                      <div
                        v-if="getOngoingStatusDetails(items)"
                        class="tagam-order-live-detail"
                      >
                        {{ getOngoingStatusDetails(items) }}
                      </div>
                    </div>
                    <div class="tagam-order-stage-track">
                      <div
                        v-for="stage in getOrderStages(items)"
                        :key="stage.name"
                        class="tagam-order-stage"
                        :class="{
                          'tagam-order-stage--active': stage.active,
                          'tagam-order-stage--done': stage.done,
                        }"
                      >
                        <div class="tagam-order-stage-line"></div>
                        <div class="tagam-order-stage-dot">
                          <q-icon :name="stage.icon"></q-icon>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="tagam-order-action-row">
                      <q-btn
                        v-if="items.show_review"
                        :label="$t('Rate')"
                        text-color="blue-grey-6"
                        dense
                        padding="8px 10px"
                        unelevated
                        no-caps
                        class="tagam-order-action-btn"
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
                          size="sm"
                          class="q-ml-sm"
                        >
                        </q-btn>
                      </q-btn>

                      <q-btn
                        v-if="items.show_review_delivery"
                        :label="$t('Rate Delivery')"
                        text-color="blue-grey-6"
                        dense
                        padding="8px 10px"
                        unelevated
                        no-caps
                        class="tagam-order-action-btn"
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
                          size="sm"
                          class="q-ml-sm"
                        >
                        </q-btn>
                      </q-btn>

                      <q-btn
                        :label="$t('Reorder')"
                        text-color="blue-grey-6"
                        dense
                        padding="8px 10px"
                        unelevated
                        no-caps
                        class="tagam-order-action-btn"
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
                          size="sm"
                          class="q-ml-sm"
                        >
                        </q-btn>
                      </q-btn>
                    </div>
                  </template>
                </q-item-section>
              </q-item>
              </div>
            </template>
          </q-list>

          <template v-if="DataStore.orders_no_more_data && !loading && hasData">
            <div
              class="row q-gutter-x-sm justify-center"
              :class="{
                'absolute-bottom-left text-center full-width': getCurrentPage > 0 && getTotalData <= 10,
              }"
            >
              <div class="text-subtitle1 tagam-text-muted">
                {{ $t("end of results") }}
              </div>
            </div>
          </template>

          <template v-slot:loading>
            <div
              class="row q-gutter-x-sm justify-center q-my-md"
              :class="{
                'absolute-center text-center full-width': getCurrentPage == 0,
                'absolute-bottom-left full-width': getCurrentPage > 0 && getTotalData <= 10,
              }"
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
import {
  formatReadableDateTime,
  repairMojibake,
} from "src/utils/textEncoding";

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
      liveProgressRequests: {},
      liveProgressTimer: null,
    };
  },
  mounted() {
    this.is_login = auth.authenticated();
    this.ispage = this.$route.query.page;
    this.ispage = this.ispage == "true" ? true : false;
    this.refreshLiveProgressForOrders(this.Orders);
    this.liveProgressTimer = setInterval(() => {
      this.refreshLiveProgressForOrders(this.Orders);
    }, 30000);
  },
  beforeUnmount() {
    if (this.liveProgressTimer) {
      clearInterval(this.liveProgressTimer);
      this.liveProgressTimer = null;
    }
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
    cleanText(value) {
      return formatReadableDateTime(repairMojibake(value));
    },
    translateStatus(value) {
      const cleaned = this.cleanText(value);
      if (!cleaned) {
        return "";
      }
      const translated = this.$t(cleaned);
      return translated === cleaned ? cleaned : translated;
    },
    normalizeOrderProgress(value) {
      const progress = Number(value);
      if (!Number.isFinite(progress)) {
        return 1;
      }
      return Math.max(0, Math.min(progress, 4));
    },
    getOngoingStatusLabel(items) {
      return (
        this.translateStatus(items?.progress?.order_status) ||
        this.translateStatus(items?.status) ||
        this.$t("Order status")
      );
    },
    getOngoingStatusDetails(items) {
      return this.translateStatus(items?.progress?.order_status_details);
    },
    getOrderStages(items) {
      const progress = this.normalizeOrderProgress(
        items?.progress?.order_progress || 1
      );
      const isDelivery = items?.order_type === "delivery" || !items?.order_type;
      const stages = isDelivery
        ? [
            { name: 1, icon: "eva-arrow-forward-outline" },
            { name: 2, icon: "restaurant_menu" },
            { name: 3, icon: "directions_car" },
            { name: 4, icon: "home" },
          ]
        : [
            { name: 1, icon: "eva-arrow-forward-outline" },
            { name: 2, icon: "restaurant_menu" },
            { name: 3, icon: "home" },
          ];
      return stages.map((stage) => ({
        ...stage,
        active: progress === stage.name,
        done: progress > stage.name || progress >= stages.length,
      }));
    },
    async refreshLiveProgressForOrders(rows) {
      const activeOrders = (rows || [])
        .filter((item) => item?.is_order_ongoing && item?.order_uuid)
        .slice(0, 8);

      await Promise.allSettled(
        activeOrders.map((item) => this.refreshLiveProgress(item))
      );
    },
    async refreshLiveProgress(item) {
      if (this.liveProgressRequests[item.order_uuid]) {
        return;
      }
      this.liveProgressRequests[item.order_uuid] = true;
      try {
        const result = await APIinterface.fetchDataByTokenGet("trackOrder", {
          order_uuid: item.order_uuid,
        });
        const progress = result?.details?.data;
        if (!progress) {
          return;
        }
        item.progress = {
          ...(item.progress || {}),
          ...progress,
        };
        item.is_order_ongoing =
          progress.is_order_ongoing ?? item.is_order_ongoing;
        if (!item.is_order_ongoing && progress.order_status) {
          item.show_status = true;
          item.status = progress.order_status;
        }
        if (this.DataStore.orders_list) {
          this.DataStore.orders_list = [...this.DataStore.orders_list];
        }
      } catch (error) {
        // The order list remains usable with the original list data.
      } finally {
        delete this.liveProgressRequests[item.order_uuid];
      }
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
          query: { order_uuid: value.order_uuid, back_url: 1 },
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

        if (result.code == 3) {
          this.DataStore.orders_no_more_data = true;
          done(true);
        } else if (result.code == 1) {
          if (!this.DataStore.isDataLoadedOrders) {
            this.DataStore.setOrders(result.details.data);
          } else {
            this.DataStore.appendOrders(result.details.data);
          }
          this.refreshLiveProgressForOrders(result.details.data);
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

.tagam-order-list {
  padding-bottom: 8px;
}

.tagam-order-card {
  background: var(--tagam-surface);
  border: 1px solid var(--tagam-border-soft);
  border-radius: 24px;
  box-shadow: var(--tagam-shadow-soft);
  overflow: hidden;
}

.tagam-order-logo {
  border-radius: 18px;
  background: var(--tagam-surface-muted);
  box-shadow: var(--tagam-shadow-soft);
}

.tagam-order-progress-row {
  min-height: 80px;
  padding: 12px 26px 14px;
  border-top: 1px solid var(--tagam-border-soft);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--tagam-surface-muted) 76%, transparent), var(--tagam-surface));
}

.tagam-order-progress-row .q-item__section--main {
  width: 100%;
  min-width: 0;
}

.tagam-order-live-status {
  display: grid;
  gap: 2px;
  margin-bottom: 8px;
  text-align: center;
}

.tagam-order-live-title {
  color: var(--tagam-text-main);
  font-size: 15px;
  font-weight: 850;
  line-height: 1.16;
}

.tagam-order-live-detail {
  color: var(--tagam-text-muted);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
}

.tagam-order-stage-track {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  width: 100%;
  min-height: 52px;
}

.tagam-order-stage {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
}

.tagam-order-stage-line {
  position: absolute;
  top: 50%;
  left: calc(-50% + 22px);
  right: calc(50% + 22px);
  height: 2px;
  transform: translateY(-50%);
  background: color-mix(in srgb, var(--tagam-border-soft) 84%, transparent);
}

.tagam-order-stage:first-child .tagam-order-stage-line {
  display: none;
}

.tagam-order-stage--done .tagam-order-stage-line,
.tagam-order-stage--active .tagam-order-stage-line {
  background: color-mix(in srgb, var(--q-primary) 68%, white);
}

.tagam-order-stage-dot {
  position: relative;
  z-index: 1;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: rgba(107, 114, 128, 0.56);
  background: color-mix(in srgb, var(--tagam-surface) 86%, var(--tagam-surface-muted));
  box-shadow: 0 12px 24px rgba(17, 24, 39, 0.08);
}

.tagam-order-stage-dot .q-icon {
  font-size: 23px;
}

.tagam-order-stage--done .tagam-order-stage-dot,
.tagam-order-stage--active .tagam-order-stage-dot {
  color: #fff;
  background: var(--q-primary);
}

.tagam-order-stage--active .tagam-order-stage-dot {
  box-shadow: 0 14px 24px color-mix(in srgb, var(--q-primary) 28%, transparent);
}

.tagam-order-action-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(116px, 1fr));
  align-items: center;
  gap: 10px;
  width: 100%;
}

.tagam-order-action-btn {
  min-height: 42px;
  border: 1px solid var(--tagam-border-soft) !important;
  border-radius: 999px !important;
  background: var(--tagam-surface) !important;
  box-shadow: 0 10px 22px rgba(17, 24, 39, 0.06);
  font-weight: 850;
}

.tagam-order-action-btn .q-btn__content {
  gap: 6px;
  line-height: 1.1;
}
</style>





