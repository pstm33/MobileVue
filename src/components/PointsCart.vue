<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="onBeforeShow"
    full-width
  >
    <q-card>
      <q-toolbar class="text-dark q-mt-md">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Apply points") }}
          </div>
          <div class="text-caption">
            <span class="text-weight-bold">{{ balance }}</span>
            {{ $t("points available to use") }}
          </div>
        </q-toolbar-title>
      </q-toolbar>
      <q-card-section>
        <template v-if="use_thresholds">
          <q-list>
            <template v-for="items in threshold_data" :key="items">
              <q-item
                class="q-mb-sm rounded-borders"
                :clickable="balance >= items.points"
                :v-ripple:purple="balance >= items.points"
                :class="{
                  'border-primary': balance >= items.points,
                  'border-grey': balance < items.points,
                  'text-primary': points == items.id,
                }"
                @click="points = items.id"
              >
                <q-item-section
                  class="text-weight-bold text-subtitle2"
                  :class="{
                    'text-grey': balance < items.points,
                  }"
                >
                  {{ items.label2 }}
                </q-item-section>
                <q-item-section side>
                  <q-item-label
                    caption
                    :class="{
                      'text-primary': points == items.id,
                    }"
                    >{{ items.label }}</q-item-label
                  >
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </template>
        <template v-else>
          <q-input
            v-model="points"
            borderless
            class="bg-mygrey1 radius28 q-pl-md"
            type="number"
            :placeholder="$t('Enter points to convert to discount')"
          >
          </q-input>
        </template>
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
          @click="modal = false"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Cancel") }}
          </div>
        </q-btn>
        <q-btn
          class="col"
          no-caps
          unelevated
          :color="!points ? 'disabled' : 'primary'"
          :text-color="!points ? 'disabled' : 'white'"
          size="lg"
          rounded
          :loading="loading"
          :disable="!points"
          @click="applyPoints"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Redeem now") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "PointsCart",
  props: ["cart_uuid", "currency_code", "merchant_id"],
  data() {
    return {
      modal: false,
      loading: false,
      points: 0,
      balance: 0,
      use_thresholds: false,
      threshold_data: null,
    };
  },
  methods: {
    async onBeforeShow() {
      this.points = 0;
      try {
        const params = new URLSearchParams({
          currency_code: this.currency_code,
          merchant_id: this.merchant_id,
        }).toString();
        const results = await APIinterface.fetchGetRequest(
          "fetchPointsthresholds",
          params
        );
        this.threshold_data = results.details.data;
      } catch (error) {
      } finally {
      }
    },
    async applyPoints() {
      try {
        this.loading = true;
        let params = {
          cart_uuid: this.cart_uuid,
          currency_code: this.currency_code,
          points: this.points,
          merchant_id: this.merchant_id,
        };
        let methods = "applyPoints";
        if (this.use_thresholds) {
          params.points = "";
          params.points_id = this.points;
          methods = "redeemPoints";
        }
        await APIinterface.fetchDataByTokenPost(
          methods,
          new URLSearchParams(params).toString()
        );
        this.modal = false;
        this.$emit("afterApplypoints");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
