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
    <q-card class="tagam-delivery-time-sheet">
      <div
        class="tagam-surface border-bottom q-pb-sm"
        style="position: sticky; top: 0; z-index: 10"
      >
        <q-toolbar class="tagam-text-main">
          <q-toolbar-title>
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Select preferred date and time") }}
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
                  color="transparent"
                  text-color="primary"
                  rounded
                  class="tagam-delivery-date-chip"
                  :class="{
                    'tagam-delivery-date-chip--active':
                      delivery_date == items.value,
                  }"
                  @click="selectDeliveryDate(items.value)"
                >
                  {{ formatDateLabel(items) }}
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
                  @click="item?.tagam_now ? setDeliveryNow() : setDeliveryTime(item)"
                  :class="{
                    'text-primary':
                      item?.tagam_now
                        ? !save_delivery_time
                        : save_delivery_time == item.start_time,
                  }"
                >
                  <q-item-section>
                    <q-item-label>
                      {{ item?.tagam_now ? $t("Now") : formatTimeLabel(item.pretty_time) }}
                    </q-item-label>
                    <q-item-label v-if="item?.tagam_now" caption>
                      {{ $t("Earliest available time") }}
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
import { formatReadableDateTime } from "src/utils/textEncoding";
import { useHaptics } from "src/composables/useHaptics";

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
    const haptics = useHaptics();
    return { CartStore, haptics };
  },
  watch: {
    delivery_date(newval, oldval) {
      console.log("newval", newval);
      this.data = this.getTimeItems(newval);
    },
  },
  methods: {
    getTimeItems(dateValue) {
      const timeItems = this.CartStore.getTimes?.[dateValue] ?? [];
      if (!this.isTodayDate(dateValue)) {
        return timeItems;
      }
      return [
        { tagam_now: true, pretty_time: this.$t("Now") },
        ...timeItems,
      ];
    },
    isTodayDate(value) {
      const parsedDate = new Date(`${value}T00:00:00`);
      if (Number.isNaN(parsedDate.getTime())) {
        return false;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parsedDate.getTime() === today.getTime();
    },
    formatTimeLabel(value) {
      return formatReadableDateTime(value);
    },
    selectDeliveryDate(value) {
      this.haptics.impact("light");
      this.delivery_date = value;
    },
    formatDateLabel(item) {
      const dateValue = item?.value || "";
      const parsedDate = new Date(`${dateValue}T00:00:00`);

      if (!Number.isNaN(parsedDate.getTime())) {
        const localeMap = { ru: "ru-RU", tk: "tk-TM", en: "en-US" };
        const locale = localeMap[this.$i18n?.locale] || localeMap.ru;
        const formattedDate = new Intl.DateTimeFormat(locale, {
          day: "2-digit",
          month: "long",
        }).format(parsedDate);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (parsedDate.getTime() === today.getTime()) {
          return `${this.$t("Today")}, ${formattedDate}`;
        }

        if (parsedDate.getTime() === tomorrow.getTime()) {
          return `${this.$t("Tomorrow")}, ${formattedDate}`;
        }

        return formattedDate;
      }

      return formatReadableDateTime(item?.name || dateValue);
    },
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
          this.data = this.getTimeItems(this.delivery_date);
          return;
        }
        const keys = Object.keys(this.CartStore.getDate);
        this.delivery_date = keys[0] ?? null;
        this.data = this.getTimeItems(this.delivery_date);
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
          this.data = this.getTimeItems(this.delivery_date);
          return;
        }

        this.delivery_date = keys[0] ?? null;
        this.data = this.getTimeItems(this.delivery_date);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    async setDeliveryTime(value) {
      this.haptics.impact("light");
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
        this.$emit("afterSaveschedule", {
          ...result.details,
          transaction_info: {
            ...(result.details?.transaction_info || {}),
            whento_deliver: "schedule",
            delivery_date: this.delivery_date,
            delivery_time: value,
          },
        });
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        console.log("done");
      }
    },
    async setDeliveryNow() {
      this.haptics.impact("light");
      try {
        const result = await APIinterface.fetchDataPost(
          "setDeliveryNow",
          "cart_uuid=" + this.cart_uuid
        );
        this.modal = false;
        this.$emit("afterSaveschedule", {
          ...result.details,
          transaction_info: {
            ...(result.details?.transaction_info || {}),
            whento_deliver: "now",
            delivery_date: null,
            delivery_time: null,
          },
        });
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      }
    },
  },
};
</script>

<style scoped>
.tagam-delivery-time-sheet {
  height: 70vh;
  background: var(--tagam-surface);
  color: var(--tagam-text);
  border-radius: 28px 28px 0 0;
}

.tagam-delivery-date-chip {
  border: 1px solid var(--tagam-border);
  background: var(--tagam-surface-muted) !important;
  color: var(--tagam-text-muted) !important;
  min-height: 38px;
}

.tagam-delivery-date-chip--active {
  background: var(--tagam-primary-soft) !important;
  color: var(--tagam-primary) !important;
  border-color: var(--tagam-primary-soft-border);
}

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






