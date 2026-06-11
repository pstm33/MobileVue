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
    <q-card class="tagam-payment-sheet">
      <q-toolbar class="tagam-text-main">
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
      <q-card-section class="tagam-payment-content scroll relative-position">
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
            active-color="primary"
            active-bg-color="transparent"
            indicator-color="transparent"
            active-class="tagam-payment-tab--active"
            class="custom-tabs tagam-payment-tabs"
          >
            <q-tab
              name="new"
              :label="$t('Add Payment')"
              class="radius28 tagam-surface-muted tagam-payment-tab"
            />
            <q-tab
              v-if="is_login"
              name="saved"
              :label="$t('Saved Payments')"
              class="radius28 tagam-surface-muted tagam-payment-tab"
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
                <div class="absolute-center tagam-text-muted text-subtitle2">
                  {{ $t("No available payment") }}
                </div>
              </template>

              <q-list>
                <template v-for="items in data" :key="items">
                  <q-item
                    clickable
                    v-ripple:purple
                    class="tagam-payment-option q-mb-sm"
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
                        {{ displayPaymentName(items.payment_name) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
              <q-space class="q-pa-sm"></q-space>
            </q-tab-panel>
            <q-tab-panel name="saved" class="q-pl-none q-pr-none">
              <template v-if="!saved_payment">
                <div class="absolute-center tagam-text-muted text-subtitle2">
                  {{ $t("No available saved payment") }}
                </div>
              </template>

              <q-list>
                <template v-for="items in saved_payment" :key="items">
                  <q-item
                    clickable
                    v-ripple:purple
                    class="tagam-payment-option q-mb-sm"
                    tag="label"
                    :class="{
                      'tagam-payment-option--active':
                        payment_uuid == items.payment_uuid,
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
                            {{ displayPaymentName(items.attr2) }}
                          </div>
                          <div class="text-caption tagam-text-muted">
                            {{ displayPaymentName(items.payment_name) }}
                          </div>
                        </template>
                        <template v-else>
                          <div class="text-weight-medium text-subtitle2">
                            {{ displayPaymentName(items.payment_name) }}
                          </div>
                          <div class="text-caption tagam-text-muted">
                            {{ displayPaymentName(items.attr2) }}
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
                class="fixed-bottom tagam-surface row q-gutter-x-md q-pl-md q-pr-md shadow-1"
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
import { normalizeBackendLabel } from "src/utils/textEncoding";

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
    displayPaymentName(value) {
      if (!value) return "";
      const label = normalizeBackendLabel(value);
      const translated = this.$t(label);
      return translated === label ? label : translated;
    },
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
.tagam-payment-sheet {
  background: var(--tagam-surface);
  color: var(--tagam-text);
  border-radius: 28px 28px 0 0;
}

.custom-tabs .q-tab {
  margin-right: 10px;
}

.custom-tabs .q-tab:last-child {
  margin-right: 0;
}
.q-tabs__content--align-justify .q-tab {
  flex: initial !important;
}

.tagam-payment-tab {
  border: 1px solid var(--tagam-border);
  color: var(--tagam-text-muted);
  min-height: 42px;
  padding: 0 16px;
  flex: 0 0 auto;
}

.tagam-payment-tab--active {
  background: var(--tagam-primary-soft) !important;
  color: var(--tagam-primary) !important;
  border-color: var(--tagam-primary-soft-border);
}

.tagam-payment-option {
  border: 1px solid var(--tagam-border);
  border-radius: var(--tagam-radius-card);
  background: var(--tagam-surface-glass);
  color: var(--tagam-text);
  min-height: 72px;
}

.tagam-payment-option--active {
  border-color: var(--tagam-primary) !important;
  box-shadow: 0 0 0 3px var(--tagam-primary-soft);
}

.tagam-payment-content {
  min-height: 280px;
  max-height: 58vh;
}
</style>




