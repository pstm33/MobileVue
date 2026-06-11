<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    @before-show="beforeShow"
    @before-hide="beforeHide"
    :persistent="is_persistent ? is_persistent : false"
  >
    <q-card class="myform tagam-delivery-sched-sheet">
      <q-card-section>
        <div class="scroll q-mb-lg">
          <q-btn-toggle
            v-model="transaction_type"
            color="transparent"
            toggle-color="transparent"
            text-color="primary"
            toggle-text-color="primary"
            no-caps
            unelevated
            class="rounded-group tagam-checkout-service-toggle"
            :options="CartStore.getServices ? CartStore.getServices : []"
            @update:model-value="setTransactionType"
          />
        </div>

        <q-list>
          <template
            v-for="items in CartStore.getDeliveryOptionsList"
            :key="items"
          >
            <q-item
              clickable
              v-ripple:purple
              class="text-weight-bold radius8"
              :class="{
                'tagam-checkout-option--active':
                  delivery_type == items.value,
                'tagam-checkout-option':
                  delivery_type != items.value,
              }"
              @click="changeDeliveryType(items.value)"
            >
              <q-item-section>
                <div class="flex items-center q-gutter-x-sm">
                  <div>
                    {{ displayDeliveryOption(items) }}
                    <span v-if="items.estimation">&bull;</span>
                  </div>
                  <div v-if="items.estimation" class="text-caption">
                    {{ items.estimation }}
                  </div>
                </div>
              </q-item-section>
            </q-item>
            <q-space class="q-pa-xs"></q-space>
          </template>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <DeliveryTime
    ref="ref_deliverytime"
    :merchant_id="CartStore.getMerchantId"
    :cart_uuid="CartStore.getCartID"
    :save_delivery_date="CartStore.geDeliveryDate"
    :save_delivery_time="CartStore.geDeliveryTime?.start_time || null"
    :is_persistent="is_persistent"
    @after-saveschedule="afterSaveschedule"
  >
  </DeliveryTime>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useCartStore } from "stores/CartStore";
import { useDeliveryschedStore } from "stores/DeliverySched";
import { defineAsyncComponent } from "vue";
import { repairMojibake } from "src/utils/textEncoding";

export default {
  name: "DeliverySched",
  props: ["is_persistent", "transactionType", "deliveryType", "merchant_id"],
  components: {
    DeliveryTime: defineAsyncComponent(() =>
      import("components/DeliveryTime.vue")
    ),
  },
  setup() {
    const CartStore = useCartStore();
    const schedStore = useDeliveryschedStore();
    return { CartStore, schedStore };
  },
  data() {
    return {
      modal: false,
      loading: false,
      loading_submit: false,
      transaction_type: "",
      delivery_type: "",
      delivery_date: "",
      delivery_time: "",
      delivery_date_list: [],
      delivery_time_list: [],
      results: null,
    };
  },
  methods: {
    displayDeliveryOption(item) {
      if (item?.value === "schedule") {
        const serviceType = this.transaction_type || this.transactionType;
        if (serviceType === "pickup") {
          return this.$te?.("Choose pickup time")
            ? this.$t("Choose pickup time")
            : "Указать время самовывоза";
        }
        if (serviceType === "dinein") {
          return this.$te?.("Choose visit time")
            ? this.$t("Choose visit time")
            : "Указать время посещения";
        }

        return this.$te?.("Choose delivery time")
          ? this.$t("Choose delivery time")
          : "Указать время доставки";
      }
      const label = repairMojibake(item?.name || "");
      return this.$te?.(label) ? this.$t(label) : label;
    },
    showSched(data) {
      this.modal = data;
    },
    beforeShow() {
      this.transaction_type = this.transactionType;
      this.delivery_type = this.deliveryType;
    },
    getServiceLabel(value) {
      const option = this.CartStore.getServices?.find(
        (item) => item.value === value
      );
      return option?.label || option?.name || "";
    },
    syncScheduleStore(data = {}) {
      const info = data.transaction_info || data || {};
      this.schedStore.selected_cart_uuid = this.CartStore.getCartID || null;
      this.schedStore.selected_merchant_id =
        this.CartStore.getMerchantId || this.merchant_id || null;
      if (info.transaction_type) {
        this.schedStore.transaction_type = info.transaction_type;
      }
      if (info.whento_deliver) {
        this.schedStore.whento_deliver = info.whento_deliver;
      }
      if (Object.prototype.hasOwnProperty.call(info, "delivery_date")) {
        this.schedStore.delivery_date = info.delivery_date || "";
      }
      if (Object.prototype.hasOwnProperty.call(info, "delivery_time")) {
        this.schedStore.delivery_time = info.delivery_time || "";
      }
      if (info.whento_deliver_pretty) {
        this.schedStore.whento_deliver_pretty = info.whento_deliver_pretty;
      }
    },
    withSelectedTransactionInfo(data = {}, extraInfo = {}) {
      const transactionType =
        extraInfo.transaction_type || this.transaction_type || this.transactionType;
      const deliveryType =
        extraInfo.whento_deliver || this.delivery_type || this.deliveryType;
      const currentInfo = this.CartStore.cart_data?.transaction_info || {};
      const responseInfo = data.transaction_info || {};

      return {
        ...data,
        transaction_info: {
          ...currentInfo,
          ...responseInfo,
          ...extraInfo,
          transaction_type:
            responseInfo.transaction_type || transactionType || currentInfo.transaction_type,
          transaction_type_pretty:
            responseInfo.transaction_type_pretty ||
            this.getServiceLabel(transactionType) ||
            currentInfo.transaction_type_pretty,
          whento_deliver:
            responseInfo.whento_deliver || deliveryType || currentInfo.whento_deliver,
        },
      };
    },
    updateLocalTransactionInfo(data = {}) {
      this.syncScheduleStore(data);
      if (!this.CartStore.cart_data) return;
      const mergedData = this.withSelectedTransactionInfo(data);
      this.syncScheduleStore(mergedData);

      this.CartStore.cart_data = {
        ...this.CartStore.cart_data,
        ...mergedData,
      };
    },
    async changeDeliveryType(value) {
      if (value == "schedule") {
        this.delivery_type = value;
        this.$refs.ref_deliverytime.modal = true;
      } else {
        try {
          this.delivery_type = value;
          this.updateLocalTransactionInfo({
            transaction_info: {
              whento_deliver: value,
              delivery_date: null,
              delivery_time: null,
            },
          });
          APIinterface.showLoadingBox("", this.$q);
          const response = await APIinterface.fetchDataPost(
            "setDeliveryNow",
            "cart_uuid=" + (this.CartStore.getCartID ?? "")
          );
          const details = this.withSelectedTransactionInfo(response.details, {
            whento_deliver: value,
            delivery_date: null,
            delivery_time: null,
          });
          this.updateLocalTransactionInfo(details);
          this.$emit("afterSavetrans", details);
        } catch (error) {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        } finally {
          APIinterface.hideLoadingBox(this.$q);
        }
      }
    },
    afterSaveschedule(value) {
      this.delivery_type = "schedule";
      const details = this.withSelectedTransactionInfo(value, {
        whento_deliver: "schedule",
      });
      this.updateLocalTransactionInfo(details);
      this.$emit("afterSavetrans", details);
    },
    async setTransactionType(value) {
      const previousType = this.transaction_type;
      this.transaction_type = value;
      try {
        this.updateLocalTransactionInfo({
          transaction_info: {
            transaction_type: value,
            transaction_type_pretty: this.getServiceLabel(value),
          },
        });
        APIinterface.showLoadingBox("", this.$q);
        const response = await APIinterface.fetchDataPost(
          "setTransactionType",
          "cart_uuid=" +
            (this.CartStore.getCartID ?? "") +
            "&transaction_type=" +
            value
        );
        const details = this.withSelectedTransactionInfo(response.details, {
          transaction_type: value,
          transaction_type_pretty: this.getServiceLabel(value),
        });
        this.updateLocalTransactionInfo(details);
        this.$emit("afterSavetrans", details);
      } catch (error) {
        this.transaction_type = previousType || this.transactionType;
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    //
  },
};
</script>



