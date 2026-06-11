<template>
  <q-dialog
    v-model="modal"
    maximized
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="onBeforeShow"
  >
    <q-card>
      <q-toolbar class="tagam-text-main">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Promo") }}
          </div>
        </q-toolbar-title>
        <q-btn
          flat
          dense
          icon="close"
          v-close-popup
          :color="$q.dark.mode ? 'primary' : 'grey'"
        />
      </q-toolbar>
      <q-card-section>
        <q-input
          v-model="promo_code"
          borderless
          class="tagam-surface-muted radius28 q-pl-md q-pr-md"
          :placeholder="$t('Enter promo code')"
          clearable
          clear-icon="eva-close-circle-outline"
        >
          <template v-slot:prepend> </template>
          <template v-slot:append>
            <q-btn
              no-caps
              :label="$t('Add')"
              no-wrap
              rounded
              unelevated
              padding="5px 30px"
              :color="!promo_code ? 'disabled' : 'primary'"
              :text-color="!promo_code ? 'disabled' : 'white'"
              :loading="loading_addcode"
              :disable="!promo_code"
              @click="AddPromocode"
            ></q-btn>
          </template>
        </q-input>
      </q-card-section>

      <q-space style="height: 8px" class="tagam-surface-muted q-mt-md"></q-space>

      <template v-if="loading">
        <div class="absolute-center" style="z-index: 999">
          <q-circular-progress
            indeterminate
            rounded
            size="lg"
            color="primary"
          />
        </div>
      </template>
      <template v-else>
        <q-list>
          <q-item-label
            header
            class="text-weight-bold text-subtitle1 tagam-text-main"
          >
            {{ $t("Available promotions") }}
          </q-item-label>

          <template v-if="!CartStore.getPromo">
            <div class="absolute-center tagam-text-muted">
              {{ $t("No available promo") }}
            </div>
          </template>

          <template v-for="items in CartStore.getPromo" :key="items">
            <q-item
              clickable
              v-ripple:purple
              @click="!loading_addcode ? Onselectpromo(items) : false"
            >
              <q-item-section avatar>
                <q-icon name="discount" color="orange-1"></q-icon>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium text-subtitle2">{{
                  cleanPromoLabel(items.title)
                }}</q-item-label>
                <q-item-label caption>{{ cleanPromoLabel(items.sub_title) }}</q-item-label>
                <q-item-label caption v-if="items.max_spend">{{
                  cleanPromoLabel(items.max_spend)
                }}</q-item-label>
                <q-item-label caption v-if="items.max_cap">{{
                  cleanPromoLabel(items.max_cap)
                }}</q-item-label>
                <q-item-label caption v-if="promoServicesLabel(items)">
                  {{ $t("Service types") }}: {{ promoServicesLabel(items) }}
                }}</q-item-label>
                <q-item-label caption v-if="items.valid_to">{{
                  formatPromoDateLabel(items.valid_to)
                }}</q-item-label>
              </q-item-section>
              <q-item-section
                v-if="items.promo_type != 'points'"
                side
                style="justify-content: end"
              >
                <q-btn no-caps unelevated text-color="blue">
                  <div class="text-weight-bold text-subtitle2">
                    {{ $t("Use now") }}
                  </div>
                </q-btn>
              </q-item-section>
            </q-item>
            <q-separator spaced inset />
          </template>
        </q-list>
        <q-space class="q-pa-sm"></q-space>
      </template>
    </q-card>
  </q-dialog>

  <PointsCart
    ref="ref_points"
    :cart_uuid="cart_uuid"
    :currency_code="currency_code"
    :merchant_id="merchant_id"
    @after-applypoints="afterApplypromo"
  ></PointsCart>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useCartStore } from "stores/CartStore";
import { defineAsyncComponent } from "vue";
import { cleanPromoText, formatPromoDate } from "src/utils/promoDisplay";

export default {
  name: "PromoList",
  props: ["merchant_id", "currency_code", "client_uuid", "cart_uuid"],
  components: {
    PointsCart: defineAsyncComponent(() => import("components/PointsCart.vue")),
  },
  setup() {
    const CartStore = useCartStore();
    return { CartStore };
  },
  data() {
    return {
      modal: false,
      promo_code: null,
      loading: false,
      loading_addcode: false,
    };
  },
  methods: {
    cleanPromoLabel(value) {
      return cleanPromoText(value);
    },
    formatPromoDateLabel(value) {
      return formatPromoDate(value);
    },
    promoServicesLabel(item) {
      const text = cleanPromoText(
        [item?.title, item?.sub_title, item?.discount_name].join(" ")
      ).toLowerCase();
      const labels = [];
      if (/доставк|delivery/.test(text)) labels.push(this.$t("Delivery"));
      if (/самовывоз|pickup/.test(text)) labels.push(this.$t("Pickup"));
      if (/навынос|takeout|с собой/.test(text)) labels.push(this.$t("Takeout"));
      if (/в зале|dine.?in/.test(text)) labels.push(this.$t("Dine-in"));
      return [...new Set(labels)].join(", ");
    },
    afterApplypromo() {
      this.modal = false;
      this.$emit("afterApplypromo");
    },
    async onBeforeShow() {
      try {
        this.promo_code = null;
        this.loading = true;
        const results = await this.CartStore.fetchPromo({
          merchant_id: this.merchant_id,
          client_uuid: this.client_uuid,
          currency_code: this.currency_code,
        });
        console.log("results", results);
      } catch (error) {
      } finally {
        this.loading = false;
      }
    },
    async Onselectpromo(value) {
      console.log("value", value);
      if (value.promo_type == "points") {
        this.$refs.ref_points.balance = value.balance;
        this.$refs.ref_points.use_thresholds = value.use_thresholds;
        this.$refs.ref_points.modal = true;
        return;
      }

      try {
        APIinterface.showLoadingBox("", this.$q);
        const params = {
          cart_uuid: this.cart_uuid,
          promo_id: value.promo_id,
          promo_type: value.promo_type,
          currency_code: this.currency_code,
        };
        console.log("params", params);
        await APIinterface.applyPromo(params);
        this.afterApplypromo();
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },

    async AddPromocode() {
      try {
        this.loading_addcode = true;
        const params = {
          cart_uuid: this.cart_uuid,
          promo_code: this.promo_code,
        };
        await APIinterface.applyPromoCode(params);
        this.modal = false;
        this.$emit("afterApplypromo");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading_addcode = false;
      }
    },
  },
};
</script>





