<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="beforeShow"
    @before-hide="onBeforeHide"
    :persistent="is_persistent"
  >
    <q-card style="height: calc(70vh)">
      <div
        class="bg-white border-bottom q-pb-sm"
        style="position: sticky; top: 0; z-index: 10"
      >
        <q-toolbar class="text-dark">
          <q-toolbar-title>
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Select prefered date and time") }}
            </div>
          </q-toolbar-title>
        </q-toolbar>
        <div class="q-pl-md q-pr-md">
          <swiper
            :loop="false"
            slidesPerView="auto"
            :space-between="10"
            ref="ref_swiper"
            @swiper="onSwiper"
          >
            <template v-for="items in CartStore.getDate" :key="items">
              <swiper-slide>
                <q-btn
                  no-caps
                  unelevated
                  size="12px"
                  :color="delivery_date == items.value ? 'orange-1' : 'mygrey1'"
                  :text-color="
                    delivery_date == items.value ? 'blue-grey-6' : 'dark'
                  "
                  rounded
                  @click="this.delivery_date = items.value"
                >
                  {{ items.name }}
                </q-btn>
              </swiper-slide>
            </template>
          </swiper>
        </div>
      </div>

      <div class="absolute-center" v-if="loading">
        <q-circular-progress
          indeterminate
          size="lg"
          :thickness="0.22"
          rounded
          color="primary"
          track-color="grey-3"
        />
      </div>

      <q-card-section>
        <q-tab-panels
          v-model="delivery_date"
          animated
          transition-prev="slide-down"
          transition-next="slide-up"
        >
          <template v-for="items in CartStore.getDate" :key="items">
            <q-tab-panel :name="items.value" class="q-pa-none">
              <q-virtual-scroll
                ref="ref_scroll"
                style="max-height: calc(60vh)"
                :items="data"
                separator
                v-slot="{ item, index }"
              >
                <q-item
                  :key="index"
                  clickable
                  v-ripple:purple
                  @click="setDeliveryTime(item)"
                  :class="{
                    'text-primary': save_delivery_time == item.start_time,
                  }"
                >
                  <q-item-section>
                    <q-item-label>
                      {{ item.pretty_time }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-virtual-scroll>
            </q-tab-panel>
          </template>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { useCartStore } from "stores/CartStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "DeliveryTime",
  props: [
    "merchant_id",
    "cart_uuid",
    "save_delivery_date",
    "save_delivery_time",
    "is_persistent",
  ],
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      modal: false,
      delivery_date: null,
      loading: false,
      data: null,
    };
  },
  setup() {
    const CartStore = useCartStore();
    return { CartStore };
  },
  watch: {
    delivery_date(newval, oldval) {
      console.log("newval", newval);
      this.data = null;
      this.data = this.CartStore.getTimes[newval] ?? null;
    },
  },
  methods: {
    beforeShow() {
      console.log("deliveryTimeMerchant", this.CartStore.deliveryTimeMerchant);
      console.log("merchant_id", this.merchant_id);

      if (!this.CartStore.deliveryTimeMerchant) {
        this.fetchDeliveryTime();
        return;
      }

      if (this.CartStore.deliveryTimeMerchant != this.merchant_id) {
        this.fetchDeliveryTime();
        return;
      }

      if (!this.CartStore.delivery_times) {
        this.fetchDeliveryTime();
      } else {
        if (this.save_delivery_date) {
          this.delivery_date = this.save_delivery_date;
          return;
        }
        const keys = Object.keys(this.CartStore.getDate);
        this.delivery_date = keys[0] ?? null;
      }
    },
    async fetchDeliveryTime() {
      try {
        this.loading = true;
        const result = await this.CartStore.fetchDeliveryTime(this.merchant_id);
        const data = result.details.opening_hours;
        const keys = Object.keys(data.dates);

        if (this.save_delivery_date) {
          this.delivery_date = this.save_delivery_date;
          return;
        }

        this.delivery_date = keys[0] ?? null;
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    async setDeliveryTime(value) {
      const params = {
        cart_uuid: this.cart_uuid,
        delivery_date: this.delivery_date,
        delivery_time: value,
      };
      try {
        const result = await APIinterface.fetchDataPost(
          "setDeliveryTime",
          params
        );
        this.modal = false;
        this.$emit("afterSaveschedule", result.details);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        console.log("done");
      }
    },
  },
};
</script>

<style scoped>
.swiper-slide {
  width: auto;
  margin-right: 10px !important;
}

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
