<template>
  <swiper
    :loop="false"
    slidesPerView="auto"
    :space-between="10"
    ref="ref_swiper"
  >
    <template v-for="items in data" :key="items">
      <swiper-slide>
        <q-btn
          no-caps
          unelevated
          size="12px"
          rounded
          :color="value == items.price ? 'orange-1' : 'mygrey1'"
          :text-color="value == items.price ? 'blue-grey-6' : 'dark'"
          @click="setTip(items.price)"
          :disable="loading"
          :loading="tip_set == items.price && loading ? true : false"
        >
          <template v-if="items.tip_type == 'fixed'">
            <div class="text-weight-bold">{{ items.label }}</div>
          </template>
          <template v-else>
            <div class="column">
              <div class="col line-normal text-weight-bold">
                {{ items.label }}
              </div>
              <div class="col line-normal text-caption text-grey">
                {{ items.price_pretty }}
              </div>
            </div>
          </template>
        </q-btn>
      </swiper-slide>
    </template>
  </swiper>
  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="onBeforeShow"
  >
    <q-card>
      <q-toolbar class="text-dark">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Add a tip") }}
          </div>
        </q-toolbar-title>
      </q-toolbar>
      <q-card-section>
        <q-input
          v-model="tip"
          borderless
          class="bg-mygrey1 radius28 q-pl-md"
          type="number"
        >
          <template v-slot:prepend>
            <div class="text-subtitle1">{{ currency_symbol }}</div>
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions class="row q-pl-md q-pr-md q-pb-md">
        <q-btn
          class="col"
          no-caps
          unelevated
          color="mygrey"
          text-color="dark"
          size="lg"
          rounded
          :disable="loading"
          @click="addTip(0)"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("No tip") }}
          </div>
        </q-btn>
        <q-btn
          :disable="!tip"
          class="col"
          no-caps
          unelevated
          :color="!tip ? 'disabled' : 'primary'"
          :text-color="!tip ? 'disabled' : 'white'"
          size="lg"
          rounded
          @click="addTip(this.tip)"
          :loading="loading"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Add") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import APIinterface from "src/api/APIinterface";

export default {
  props: [
    "cart_uuid",
    "merchant_id",
    "data",
    "value",
    "currency_code",
    "currency_symbol",
  ],
  name: "TipsList",
  data() {
    return {
      tip: 0,
      tip_set: 0,
      modal: false,
      loading: false,
    };
  },
  components: {
    Swiper,
    SwiperSlide,
  },
  methods: {
    onBeforeShow() {
      this.tip = 0;
      this.tip_set = 0;
    },
    setTip(value) {
      if (value == "fixed") {
        this.tip_set = 0;
        this.modal = true;
        return;
      }
      this.tip_set = value;
      this.addTip(value);
    },
    async addTip(value) {
      try {
        this.loading = true;
        const results = await APIinterface.fetchDataPost(
          "addTip",
          new URLSearchParams({
            merchant_id: this.merchant_id,
            cart_uuid: this.cart_uuid,
            currency_code: this.currency_code,
            tip_value: value,
          }).toString()
        );
        console.log("results", results);
        this.$emit("afterApplytip");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
        this.modal = false;
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
</style>
