<template>
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
            {{ title }}
          </div>
        </q-toolbar-title>
        <q-btn
          flat
          dense
          icon="close"
          @click="onClose"
          :color="$q.dark.mode ? 'primary' : 'grey'"
        />
      </q-toolbar>
      <q-card-section style="height: calc(50vh)">
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
            <template v-for="items in getData" :key="items">
              <q-item
                tag="label"
                v-ripple:purple
                class="border-grey q-mb-sm rounded-borders"
                :class="{
                  'border-primary': this.payment_id == items.id,
                  'bg-disabled text-disable': isAlreadySaved(items.id),
                }"
              >
                <q-item-section avatar>
                  <q-radio
                    v-model="payment_id"
                    :val="items.id"
                    :disable="isAlreadySaved(items.id)"
                    unchecked-icon="panorama_fish_eye"
                  />
                </q-item-section>
                <q-item-section class="text-weight-medium text-subtitle2">
                  {{ items.name }}
                </q-item-section>
                <q-item-section side v-if="items.url_image">
                  <q-responsive style="width: 40px; height: 30px">
                    <q-img
                      :src="items.url_image"
                      fit="scale-down"
                      spinner-size="xs"
                      spinner-color="primary"
                      loading="lazy"
                    />
                  </q-responsive>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </template>
      </q-card-section>
      <q-card-actions class="row q-pl-md q-pr-md q-pb-md q-gutter-x-md">
        <q-btn
          class="col"
          no-caps
          unelevated
          color="mygrey"
          text-color="dark"
          size="lg"
          rounded
          @click="onClose"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Close") }}
          </div>
        </q-btn>
        <q-intersection transition="slide-left" class="col" v-if="payment_id">
          <q-btn
            no-caps
            unelevated
            :color="!payment_id ? 'disabled' : 'secondary'"
            :text-color="!payment_id ? 'disabled' : 'white'"
            size="lg"
            rounded
            :loading="loading2"
            @click="SavedPayment"
            class="fit"
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Save") }}
            </div>
          </q-btn>
        </q-intersection>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "PaydeliveryComponents",
  props: ["title", "label", "payment_code"],
  data() {
    return {
      modal: false,
      loading: true,
      loading2: false,
      data: null,
      payment_id: null,
      credentials: null,
      merchant_id: null,
      saved_payment: null,
    };
  },
  computed: {
    getData() {
      return this.data ? this.data : null;
    },
  },
  methods: {
    onClose() {
      this.modal = false;
      this.$emit("onClose");
    },
    isAlreadySaved(id) {
      if (!this.saved_payment) {
        return false;
      }
      if (this.saved_payment.includes(id)) {
        return true;
      }
      return false;
    },
    showPaymentForm(credentials) {
      this.credentials = credentials;
      this.merchant_id = this.credentials?.merchant_id || "";
      this.modal = true;
    },
    async onBeforeShow() {
      try {
        this.payment_id = null;
        this.loading = true;
        const results = await APIinterface.fetchDataByTokenPost(
          "getPaydelivery",
          "merchant_id=" + this.merchant_id
        );
        this.data = results.details.data;
        this.saved_payment = results.details.saved_payment;
      } catch (error) {
        this.data = null;
      } finally {
        this.loading = false;
      }
    },
    async SavedPayment() {
      try {
        this.loading2 = true;
        const params = new URLSearchParams({
          payment_id: this.payment_id,
          payment_code: this.payment_code,
          merchant_id: this.merchant_id,
        }).toString();
        await APIinterface.fetchDataByTokenPost("savedPaydelivery", params);
        this.modal = false;
        this.$emit("afterAddpayment");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading2 = false;
      }
    },
  },
};
</script>
