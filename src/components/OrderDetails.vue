<template>
  <q-dialog
    v-model="modal"
    @show="onShow"
    @before-show="beforeShow"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-hide="onBeforeHide"
  >
    <q-card class="order-sheet">
      <div class="fixed-top order-sheet__top text-dark z-top">
        <q-toolbar class="order-sheet__toolbar">
          <q-btn icon="close" flat round dense v-close-popup></q-btn>
          <q-toolbar-title
            v-if="!loading && data"
            class="order-sheet__title"
          >
            {{ data.order.order_info.place_on_raw }}
          </q-toolbar-title>
        </q-toolbar>
      </div>
      <q-space style="height: 50px"></q-space>

      <template v-if="loading">
        <q-card-section class="order-sheet__meta">
          <div
            class="row items-center justify-between text-subtitle2 text-dark"
          >
            <div class="col-4"><q-skeleton type="text"></q-skeleton></div>
            <div class="col-4 text-right">
              <q-skeleton type="text"></q-skeleton>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="order-sheet__section order-sheet__section--hero">
          <q-list>
            <q-item>
              <q-item-section avatar top>
                <q-avatar>
                  <q-responsive style="width: 50px; height: 50px">
                    <q-skeleton type="QAvatar"></q-skeleton>
                  </q-responsive>
                </q-avatar>
              </q-item-section>
              <q-item-section top>
                <q-item-label><q-skeleton type="text" /> </q-item-label>
                <q-item-label> <q-skeleton type="text" /></q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-skeleton type="QBtn" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </template>

      <template v-if="fetch_error">
        <NoResults
          :message="fetch_error"
          :description="$t('errorOrderNotFound')"
        ></NoResults>
      </template>

      <template v-if="data && !loading">
        <q-card-section>
          <div
            class="row items-center justify-between text-subtitle2 text-dark"
          >
            <div class="col-4">{{ $t("Order ID") }}</div>
            <div class="col-4 text-right">
              #{{ data.order.order_info.order_id }}
            </div>
          </div>
        </q-card-section>

        <q-card-section class="bg-white q-pa-xs">
          <template v-if="!data.order.order_info.is_order_ongoing">
            <q-list>
              <q-item>
                <q-item-section avatar top>
                  <q-avatar>
                    <q-responsive style="width: 50px; height: 50px">
                      <q-img
                        :src="data.merchant.url_logo"
                        lazy
                        fit="cover"
                        class="radius8"
                        spinner-color="amber"
                        spinner-size="sm"
                      />
                    </q-responsive>
                  </q-avatar>
                </q-item-section>
                <q-item-section top>
                  <q-item-label class="subtitle-2 text-weight-bold"
                    >{{ data.merchant.restaurant_name }}
                  </q-item-label>
                  <q-item-label caption class="text-capitalize">
                    {{ data.order?.order_info?.order_type1 }}
                    <!-- <template v-if="data.order.order_info.is_completed"> -->
                    &bull;
                    <!-- </template> -->
                    {{ data.order.order_info.status }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side top>
                  <template v-if="data.allowed_to_review">
                    <q-btn
                      :label="$t('Rate Order')"
                      no-caps
                      unelevated
                      color="info"
                      flat
                      padding="0"
                      class="text-weight-bold"
                      @click="onRatereview"
                    ></q-btn>
                  </template>
                  <template v-else>
                    <q-btn
                      :label="$t('Rated')"
                      no-caps
                      unelevated
                      color="grey"
                      flat
                      padding="0"
                      class="text-weight-bold"
                      disable
                    ></q-btn>
                  </template>
                </q-item-section>
              </q-item>
            </q-list>
          </template>
          <template v-else>
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label
                    class="subtitle-2 text-weight-bold"
                    :class="{
                      'text-warning':
                        data.progress.is_order_late ||
                        data.progress.is_preparation_late ||
                        data.progress.is_driver_delivering_late,
                    }"
                    >{{ data.progress.order_status }}</q-item-label
                  >
                  <q-item-label caption>{{
                    data.progress.order_status_details
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </template>
        </q-card-section>

        <q-space class="q-pa-xs"></q-space>

        <q-card-section class="order-sheet__section custom-stepper">
          <q-stepper
            v-model="step"
            vertical
            color="primary"
            flat
            animated
            class="q-pa-none q-pr-sm"
          >
            <q-step
              :name="1"
              :title="$t('Order from')"
              :caption="data.merchant.address"
              :done="true"
              done-color="blue-grey-6"
              done-icon="restaurant_menu"
              active-icon="restaurant_menu"
              icon="restaurant_menu"
            >
            </q-step>
            <q-step
              v-if="getOrderType == 'delivery'"
              :name="2"
              :title="$t('Delivered to')"
              :caption="getDeliveryAddress"
              :done="true"
              done-color="primary"
              done-icon="home"
              active-icon="home"
              icon="home"
            >
            </q-step>
          </q-stepper>

          <template v-if="getOrderType == 'delivery'">
            <q-separator></q-separator>
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold text-subtitle2">{{
                  $t("Instructions")
                }}</q-item-label>
                <q-item-label caption>
                  {{
                    data?.order?.order_info?.delivery_instructions || $t("None")
                  }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-card-section>

        <q-space class="q-pa-xs"></q-space>

        <q-card-section class="order-sheet__section">
          <q-list dense>
            <q-item>
              <q-item-section avatar class="text-weight-bold">
                {{ $t("Order Summary") }}</q-item-section
              >
              <q-item-section></q-item-section>
              <q-item-section
                side
                v-if="!data.order.order_info.is_order_ongoing && show_actions"
              >
                <q-btn
                  :label="$t('Reorder')"
                  no-caps
                  unelevated
                  color="primary"
                  flat
                  padding="0"
                  class="text-weight-bold"
                  @click="onReorder"
                ></q-btn>
              </q-item-section>
            </q-item>

            <template v-for="items in getItems" :key="items">
              <q-item>
                <q-item-section avatar class="text-weight-bold" top>{{
                  items.qty
                }}</q-item-section>
                <q-item-section top>
                  <div>{{ items.item_name }}</div>

                  <div v-if="items.is_free">
                    <q-badge color="green-5" rounded outline>
                      {{ $t("Free") }}
                    </q-badge>
                  </div>

                  <div
                    class="text-caption"
                    v-if="items.special_instructions != ''"
                  >
                    {{ items.special_instructions }}
                  </div>

                  <template v-if="items.attributes != ''">
                    <template
                      v-for="attributes in items.attributes"
                      :key="attributes"
                    >
                      <div class="text-caption">
                        <template
                          v-for="(
                            attributes_data, attributes_index
                          ) in attributes"
                        >
                          {{ attributes_data
                          }}<template
                            v-if="attributes_index < attributes.length - 1"
                            >,
                          </template>
                        </template>
                      </div>
                    </template>
                  </template>
                </q-item-section>
                <q-item-section side top>
                  <template v-if="items.price.discount <= 0">
                    {{ items.price.pretty_total }}
                  </template>
                  <template v-else>
                    {{ items.price.pretty_total_after_discount }}
                  </template>
                </q-item-section>
              </q-item>
              <template v-for="addons in items.addons" :key="addons">
                <q-item>
                  <q-item-section avatar top></q-item-section>
                  <q-item-section class="text-weight-medium">
                    &bull; {{ addons.subcategory_name }}
                  </q-item-section>
                </q-item>
                <template
                  v-for="addon_items in addons.addon_items"
                  :key="addon_items"
                >
                  <q-item>
                    <q-item-section avatar top class="text-weight-bold">
                      {{ addon_items.qty }}
                    </q-item-section>
                    <q-item-section top>
                      {{ addon_items.sub_item_name }}
                    </q-item-section>
                    <q-item-section top side>
                      {{ addon_items.pretty_addons_total }}</q-item-section
                    >
                  </q-item>
                </template>
              </template>
            </template>

            <q-separator v-if="ItemsCount > maxVisible"></q-separator>
            <q-item
              clickable
              v-if="ItemsCount > maxVisible"
              @click="toggleShowMore"
            >
              <q-item-section>
                <q-item-label caption>
                  {{ showMore ? $t("Show Less") : $t("Show More") }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon
                  :name="
                    showMore
                      ? 'eva-chevron-up-outline'
                      : 'eva-chevron-down-outline'
                  "
                  class="text-grey-4"
                ></q-icon>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-space class="q-pa-xs"></q-space>
        <template v-if="show_actions">
          <q-card-section
            v-if="data.allowed_to_cancel"
            class="order-sheet__section q-pa-xs q-pl-md q-pr-md q-gutter-x-md flex justify-end"
          >
            <q-btn
              v-if="data.allowed_to_cancel"
              label="Cancel"
              no-caps
              color="grey"
              outline
              size="0.9em"
              @click="
                this.$refs.cancel_order.showModal(
                  this.data.order.order_info.order_uuid
                )
              "
            ></q-btn>
          </q-card-section>
        </template>
        <q-space class="q-pa-xs"></q-space>
        <q-card-section class="order-sheet__section">
          <q-list dense>
            <template v-for="summary in getSummary" :key="summary">
              <q-item :class="{ 'text-weight-bold': summary.type == 'total' }">
                <q-item-section>{{ summary.name }}</q-item-section>
                <q-item-section side>{{ summary.value }}</q-item-section>
              </q-item>
            </template>
            <q-separator></q-separator>
            <q-item>
              <q-item-section class="text-weight-bold">{{
                $t("Paid By")
              }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                {{ data.order.order_info.payment_name1 }}
              </q-item-section>
              <q-item-section side class="text-weight-bold">
                {{ data.order.order_info.pretty_total }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-space class="q-pa-xs"></q-space>

        <q-card-section
          class="order-sheet__section"
          v-if="!data.order.order_info.is_order_failed"
        >
          <div class="q-pl-md q-pr-md text-subtitle2 text-weight-bold">
            <template v-if="data.order.order_info.is_completed">
              {{ data.order.order_info.points_label3 }}
            </template>
            <template v-else>
              <div>{{ data.order.order_info.points_label2 }}</div>
              <div class="text-caption text-grey">
                {{ $t("Points will be issued upon order completion!") }}
              </div>
            </template>
          </div>
        </q-card-section>

        <q-card-section
          class="order-sheet__section"
          v-if="
            !data.order.order_info.is_order_ongoing &&
            data?.refund_transaction.length > 0
          "
        >
          <q-list dense>
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold text-subtitle2">{{
                  $t("Refund Issued")
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-for="refund in data?.refund_transaction" :key="refund">
              <q-item-section>
                <q-item-label
                  >{{ $t("Description") }} :
                  {{ refund.description }}</q-item-label
                >
                <q-item-label
                  >{{ $t("Amount") }} : {{ refund.trans_amount }}</q-item-label
                >
                <q-item-label
                  >{{ $t("Issued to") }} : {{ refund.used_card }}</q-item-label
                >
                <q-item-label
                  >{{ $t("Date issued") }} : {{ refund.date }}</q-item-label
                >
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </template>
      <q-space class="q-pa-md"></q-space>
    </q-card>
  </q-dialog>
  <CancelOrder ref="cancel_order" @after-cancelorder="afterCancelorder" />
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "OrderDetails",
  props: ["order_uuid", "show_actions"],
  components: {
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
    CancelOrder: defineAsyncComponent(() =>
      import("components/CancelOrder.vue")
    ),
  },
  data() {
    return {
      modal: false,
      step: 3,
      data: null,
      loading: false,
      maxVisible: 2,
      showMore: false,
      fetch_error: null,
      order_cancelled: false,
      payload: [
        "merchant_info",
        "items",
        "summary",
        "order_info",
        "progress",
        "refund_transaction",
        "status_allowed_cancelled",
        "pdf_link",
        "delivery_timeline",
        "order_delivery_status",
        "allowed_to_review",
        "review_status",
      ],
    };
  },
  setup() {
    return {};
  },
  computed: {
    getReviewdata() {
      return this.data
        ? {
            merchant_id: this.data?.merchant?.merchant_id || null,
            order_uuid: this.data?.order?.order_info.order_uuid || null,
            merchant_logo: this.data?.merchant?.url_logo || null,
            share_experience: this.data?.share_experience || "",
          }
        : null;
    },
    getDeliveryAddress() {
      let completeAdddres = "";
      if (this.data) {
        completeAdddres += this.data.order.order_info.address_label;
        completeAdddres += " - ";
        completeAdddres += this.data.order.order_info.complete_delivery_address;
      }
      return completeAdddres;
    },
    ItemsCount() {
      return this.data ? this.data.items.length : null;
    },
    getItems() {
      if (this.data) {
        return this.showMore
          ? this.data.items
          : this.data.items.slice(0, this.maxVisible);
      }
      return null;
    },
    getSummary() {
      return this.data ? this.data.summary : null;
    },
    getOrderType() {
      return this.data ? this.data?.order?.order_info?.order_type : null;
    },
    orderUUID() {
      return this.data ? this.data?.order?.order_info?.order_uuid : null;
    },
  },
  methods: {
    onReorder() {
      this.$emit("onReorder", this.orderUUID);
      this.modal = false;
    },
    onRatereview() {
      this.$emit("onRatereview", this.getReviewdata);
    },
    toggleShowMore() {
      this.showMore = !this.showMore;
    },
    onShow() {
      this.order_cancelled = false;
    },
    onBeforeHide() {
      console.log("onBeforeHide");
      this.data = null;
    },
    async beforeShow() {
      try {
        if (this.loading) {
          return;
        }
        this.loading = true;
        const result = await APIinterface.fetchDataByToken("orderDetails", {
          order_uuid: this.order_uuid,
          payload: this.payload,
        });
        console.log("result", result);
        this.data = result.details.data;
      } catch (error) {
        console.log("error", error);
        this.fetch_error = error;
        this.data = null;
      } finally {
        console.log("finally");
        this.loading = false;
      }
    },
    afterCancelorder() {
      this.$refs.cancel_order.show_modal = false;
      this.order_cancelled = true;
      this.$emit("oncloseOrder", this.order_cancelled);
      this.beforeShow();
    },
  },
};
</script>

<style scoped>
.order-sheet {
  background:
    radial-gradient(circle at top right, rgba(247, 199, 147, 0.2), transparent 28%),
    linear-gradient(180deg, #fbf6ec 0%, #f7f1e4 100%) !important;
}

.order-sheet__top {
  background: rgba(255, 249, 240, 0.92);
  backdrop-filter: blur(16px);
}

.order-sheet__toolbar {
  min-height: 58px;
  padding: 0 8px;
  border-bottom: 1px solid rgba(113, 74, 24, 0.08);
}

.order-sheet__title {
  font-size: 16px;
  font-weight: 800;
  color: #20160f;
}

.order-sheet__meta,
.order-sheet__section {
  margin: 0 12px 12px;
  border: 1px solid rgba(113, 74, 24, 0.1);
  border-radius: 24px;
  background: rgba(255, 252, 246, 0.96);
  box-shadow: 0 14px 30px rgba(71, 42, 13, 0.08);
}

.order-sheet__section--hero {
  overflow: hidden;
}

:deep(.order-sheet .q-list),
:deep(.order-sheet .q-item) {
  background: transparent;
}

:deep(.order-sheet .q-item) {
  min-height: 54px;
}
</style>
