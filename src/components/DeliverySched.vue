<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    @before-show="beforeShow"
    @before-hide="beforeHide"
    :persistent="is_persistent ? is_persistent : false"
  >
    <q-card class="tagam-delivery-sched">
      <q-card-section class="tagam-delivery-sched__section">
        <div class="tagam-delivery-sched__title">{{ $t("Service options") }}</div>
        <div class="tagam-delivery-sched__types">
          <button
            v-for="service in CartStore.getServices ? CartStore.getServices : []"
            :key="service.value"
            type="button"
            class="tagam-delivery-sched__type"
            :class="{
              'tagam-delivery-sched__type--active':
                transaction_type === service.value,
            }"
            @click="
              setTransactionType(
                service.value,
                service.label || service.name || service.text || service.value
              )
            "
          >
            {{ service.label || service.name || service.text || service.value }}
          </button>
        </div>
      </q-card-section>

      <q-card-section
        v-if="CartStore.getDeliveryOptionsList && CartStore.getDeliveryOptionsList.length"
        class="tagam-delivery-sched__section"
      >
        <div class="tagam-delivery-sched__title">{{ $t("Order time") }}</div>
        <div class="tagam-delivery-sched__options">
          <button
            v-for="items in CartStore.getDeliveryOptionsList"
            :key="items.value"
            type="button"
            class="tagam-delivery-sched__option"
            :class="{
              'tagam-delivery-sched__option--active':
                delivery_type === items.value || CartStore.geDeliverytype == items.value,
            }"
            @click="changeDeliveryType(items.value)"
          >
            <div class="tagam-delivery-sched__option-name">
              {{ items.name }}
            </div>
            <div
              v-if="items.estimation"
              class="tagam-delivery-sched__option-meta"
            >
              {{ items.estimation }}
            </div>
          </button>
        </div>
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
  />
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useCartStore } from "stores/CartStore";
import { defineAsyncComponent } from "vue";

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
    return { CartStore };
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
    showSched(data) {
      this.modal = data;
    },
    beforeShow() {
      this.transaction_type = this.transactionType;
      this.delivery_type = this.deliveryType;
    },
    beforeHide() {},
    async changeDeliveryType(value) {
      if (value == "schedule") {
        this.delivery_type = value;
        this.$refs.ref_deliverytime.modal = true;
        return;
      }

      try {
        APIinterface.showLoadingBox("", this.$q);
        const response = await APIinterface.fetchDataPost(
          "setDeliveryNow",
          "cart_uuid=" + (this.CartStore.getCartID ?? "")
        );
        this.delivery_type = value;
        this.modal = false;
        this.$emit("afterSavetrans", response.details);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    afterSaveschedule(value) {
      this.modal = false;
      this.$emit("afterSavetrans", value);
    },
    async setTransactionType(value, prettyLabel = "") {
      try {
        if (this.transaction_type === value) {
          this.modal = false;
          return;
        }

        this.transaction_type = value;
        APIinterface.showLoadingBox("", this.$q);
        const response = await APIinterface.fetchDataPost(
          "setTransactionType",
          "cart_uuid=" +
            (this.CartStore.getCartID ?? "") +
            "&transaction_type=" +
            value
        );
        this.modal = false;
        this.$emit("afterSavetrans", {
          ...(response.details || {}),
          __transaction_type: value,
          __transaction_type_pretty: prettyLabel,
        });
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
  },
};
</script>

<style scoped>
.tagam-delivery-sched {
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  background: #ffffff;
  box-shadow: none;
}

.tagam-delivery-sched__section {
  padding: 18px 18px 10px;
}

.tagam-delivery-sched__title {
  margin-bottom: 10px;
  font-size: 15px;
  line-height: 1.1;
  font-weight: 800;
  color: #f18800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tagam-delivery-sched__types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tagam-delivery-sched__type {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(113, 74, 24, 0.08);
  border-radius: 999px;
  background: #f7f7f7;
  color: #6f6254;
  font-size: 14px;
  font-weight: 700;
}

.tagam-delivery-sched__type--active {
  background: #f18800;
  border-color: #f18800;
  color: #ffffff;
}

.tagam-delivery-sched__options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tagam-delivery-sched__option {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(113, 74, 24, 0.08);
  border-radius: 18px;
  background: #ffffff;
  text-align: left;
}

.tagam-delivery-sched__option--active {
  border-color: rgba(241, 136, 0, 0.28);
  background: rgba(241, 136, 0, 0.06);
}

.tagam-delivery-sched__option-name {
  font-size: 15px;
  line-height: 1.2;
  font-weight: 800;
  color: #20160f;
}

.tagam-delivery-sched__option-meta {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.3;
  color: #8a7d70;
}

:global(body.body--dark) .tagam-delivery-sched {
  background: var(--tagam-surface);
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-delivery-sched__title {
  color: var(--tagam-primary);
}

:global(body.body--dark) .tagam-delivery-sched__type,
:global(body.body--dark) .tagam-delivery-sched__option {
  background: var(--tagam-surface-raised);
  border-color: var(--tagam-stroke);
  color: var(--tagam-text-soft);
}

:global(body.body--dark) .tagam-delivery-sched__option-name {
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-delivery-sched__option-meta {
  color: var(--tagam-text-muted);
}
</style>
