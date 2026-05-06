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
      <q-toolbar class="text-dark">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Payment Method") }}
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
      <q-card-section style="height: 60vh" class="scroll relative-position">
        <template v-if="loading">
          <div class="absolute-center" style="z-index: 999">
            <q-circular-progress
              indeterminate
              size="lg"
              :thickness="0.22"
              rounded
              color="primary"
              track-color="grey-3"
            />
          </div>
        </template>
        <template v-else>
          <q-tabs
            v-model="tab"
            dense
            narrow-indicator
            no-caps
            active-color="'blue-grey-6"
            active-bg-color="orange-1"
            indicator-color="transparent"
            active-class="text-blue-grey-6"
            class="custom-tabs"
          >
            <q-tab
              name="new"
              :label="$t('Add Payment')"
              class="radius28 bg-mygrey1"
            />
            <q-tab
              v-if="is_login"
              name="saved"
              :label="$t('Saved Payments')"
              class="radius28 bg-mygrey1"
            />
          </q-tabs>

          <q-tab-panels
            v-model="tab"
            animated
            transition-prev="slide-down"
            transition-next="slide-up"
            class="full-height"
          >
            <q-tab-panel name="new" class="q-pl-none q-pr-none">
              <template v-if="!data">
                <div class="absolute-center text-grey text-subtitle2">
                  {{ $t("No available payment") }}
                </div>
              </template>

              <q-list>
                <template v-for="items in data" :key="items">
                  <q-item
                    clickable
                    v-ripple:purple
                    class="border-grey radius8 q-mb-sm"
                    @click="onchoosePayment(items)"
                  >
                    <q-item-section avatar v-if="items.logo_image">
                      <q-responsive style="height: 30px; width: 40px">
                        <q-img
                          :src="items.logo_image"
                          fit="scale-down"
                          spinner-size="xs"
                          spinner-color="primary"
                        />
                      </q-responsive>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium text-subtitle2">
                        {{ items.payment_name }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
              <q-space class="q-pa-sm"></q-space>
            </q-tab-panel>
            <q-tab-panel name="saved" class="q-pl-none q-pr-none">
              <template v-if="!saved_payment">
                <div class="absolute-center text-grey text-subtitle2">
                  {{ $t("No available saved payment") }}
                </div>
              </template>

              <q-list>
                <template v-for="items in saved_payment" :key="items">
                  <q-item
                    clickable
                    v-ripple:purple
                    class="border-grey radius8 q-mb-sm"
                    tag="label"
                    :class="{
                      'border-primary': payment_uuid == items.payment_uuid,
                    }"
                  >
                    <q-item-section avatar>
                      <q-radio
                        v-model="payment_uuid"
                        :val="items.payment_uuid"
                        unchecked-icon="panorama_fish_eye"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        <template v-if="items.payment_code == 'paydelivery'">
                          <div class="text-weight-medium text-subtitle2">
                            {{ items.attr2 }}
                          </div>
                          <div class="text-caption text-grey">
                            {{ items.payment_name }}
                          </div>
                        </template>
                        <template v-else>
                          <div class="text-weight-medium text-subtitle2">
                            {{ items.payment_name }}
                          </div>
                          <div class="text-caption text-grey">
                            {{ items.attr2 }}
                          </div>
                        </template>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="items.logo_image">
                      <q-responsive style="width: 40px; height: 30px">
                        <q-img
                          :src="items.logo_image"
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
              <q-space class="q-pa-sm"></q-space>

              <q-card-actions
                v-if="saved_payment"
                class="fixed-bottom bg-white row q-gutter-x-md q-pl-md q-pr-md shadow-1"
                align="center"
              >
                <q-intersection class="fit" transition="slide-right">
                  <q-btn
                    no-caps
                    unelevated
                    :color="!payment_uuid ? 'disabled' : 'secondary'"
                    :text-color="!payment_uuid ? 'disabled' : 'white'"
                    size="lg"
                    rounded
                    class="fit"
                    :disable="!payment_uuid"
                    @click="selectPayment"
                  >
                    <div class="text-subtitle2 text-weight-bold">
                      {{ $t("Select") }}
                    </div>
                  </q-btn>
                </q-intersection>
              </q-card-actions>
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-card-section>
      <q-space class="q-pa-md"></q-space>
    </q-card>
  </q-dialog>

  <PaydeliveryComponents
    ref="paydelivery"
    payment_code="paydelivery"
    :title="$t('Add Payment')"
    :label="{
      submit: this.$t('Saved'),
      notes: this.$t('Pay using different card'),
    }"
    @after-addpayment="afterAddpayment"
    @on-close="onClose"
  />
  <StripeComponents
    ref="stripe"
    payment_code="stripe"
    :title="$t('Stripe')"
    :label="{
      submit: this.$t('Saved'),
      notes: this.$t('Pay using different card'),
    }"
    @after-addpayment="afterAddpayment"
    @on-close="onClose"
  />
  <MercadopagoComponents
    ref="mercadopago"
    payment_code="mercadopago"
    :title="$t('Mercadopago')"
    :label="{}"
    @after-addpayment="afterAddpayment"
    @on-close="onClose"
  />
  <ocrComponents
    ref="ocr"
    payment_code="ocr"
    :title="$t('Add Credit card')"
    :label="{}"
    @after-addpayment="afterAddpayment"
    @on-close="onClose"
  ></ocrComponents>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "PaymentMethod",
  props: ["merchant_id", "method", "is_login"],
  components: {
    PaydeliveryComponents: defineAsyncComponent(() =>
      import("components/PaydeliveryComponents.vue")
    ),
    StripeComponents: defineAsyncComponent(() =>
      import("components/StripeComponents.vue")
    ),
    MercadopagoComponents: defineAsyncComponent(() =>
      import("components/MercadopagoComponents.vue")
    ),
    ocrComponents: defineAsyncComponent(() =>
      import("components/ocrComponents.vue")
    ),
  },
  setup() {
    return {};
  },
  data() {
    return {
      modal: false,
      loading: false,
      data: null,
      tab: "new",
      saved_payment: null,
      payment_uuid: null,
    };
  },
  methods: {
    onClose() {
      console.log("onClose");
      this.modal = true;
    },
    async onBeforeShow() {
      try {
        this.payment_uuid = null;
        this.loading = true;
        const result = await APIinterface.fetchDataByTokenGet(this.method, {
          merchant_id: this.merchant_id,
        });
        this.data = result.details.data ?? null;
        this.saved_payment = result.details.saved_payment ?? null;
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    onchoosePayment(value) {
      try {
        this.modal = false;
        this.$refs[value.payment_code].showPaymentForm(value.credentials);
      } catch (error) {
        this.addPayment(value);
      }
    },
    async addPayment(value) {
      try {
        APIinterface.showLoadingBox("", this.$q);
        await APIinterface.SavedPaymentProvider({
          merchant_id: value?.credentials?.merchant_id,
          payment_code: value.payment_code,
        });
        this.modal = false;
        this.$emit("afterAddpayment");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    afterAddpayment() {
      this.$emit("afterAddpayment");
    },
    async selectPayment() {
      try {
        this.modal = false;
        const params = new URLSearchParams({
          payment_uuid: this.payment_uuid,
        }).toString();
        await APIinterface.fetchDataByTokenPost("SetDefaultPayment", params);
        this.$emit("afterAddpayment");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
      }
    },
    //
  },
};
</script>

<style scoped>
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
