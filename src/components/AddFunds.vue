<template>
  <q-dialog
    v-model="modal"
    persistent
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    backdrop-filter="blur(4px)"
    @before-show="onBeforeShow"
  >
    <q-card class="tagam-add-funds-sheet">
      <q-card-section
        class="q-gutter-y-md myform scroll"
        style="max-height: 60vh"
      >
        <div class="text-center q-gutter-y-sm">
          <div class="tagam-title-lg">
            {{ $t("Add Funds to Your Wallet") }}
          </div>
          <div class="tagam-body-muted">
            {{ $t("Enter the amount you wish to top up") }}.
          </div>
        </div>
        <q-input
          v-model="amount"
          borderless
          type="number"
          :placeholder="amount_eg"
          color="primary"
          class="tagam-form-card"
        >
        </q-input>

        <template v-if="loading_payment">
          <div class="flex justify-center q-pa-sm">
            <q-spinner-ios size="sm" />
          </div>
        </template>
        <template v-else>
          <template v-if="!getSavedpaymentlist">
            <div class="text-center q-gutter-y-sm">
              <div class="text-body2">
                {{
                  $t(
                    "We noticed you haven't added a default payment method yet."
                  )
                }}
                <br />
                {{
                  $t(
                    "To proceed with your transaction smoothly, please add a payment online method to your account. Thank you!"
                  )
                }}
              </div>
              <q-btn
                :label="$t('Add Payment Method')"
                no-caps
                unelevated
                rounded
                color="primary"
                text-color="white"
                class="text-weight-medium"
                @click="this.$refs.ref_paymentmethod.modal = true"
              ></q-btn>
            </div>
          </template>
          <q-list class="tagam-account-card-list">
            <template v-for="items in getSavedpaymentlist" :key="items">
              <q-item
                clickable
                v-ripple
                tag="label"
                class="tagam-account-list-card"
                :class="{
                  'border-primary': payment_uuid == items.payment_uuid,
                }"
              >
                <q-item-section avatar v-if="items.logo_image">
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
                        {{ displayPaymentName(items.attr1) }}
                      </div>
                      <div class="text-caption tagam-text-muted">
                        {{ displayPaymentName(items.attr2) }}
                      </div>
                    </template>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>
                    <q-icon name="arrow_forward_ios"></q-icon>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <q-item
              clickable
              v-ripple
              tag="label"
              class="tagam-account-list-card"
              @click="this.$refs.ref_paymentmethod.modal = true"
            >
              <q-item-section>
                <q-item-label>
                  <div class="text-weight-thin text-subtitle2">
                    {{ $t("Add New Payment Method") }}
                  </div>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>
                  <q-icon name="arrow_forward_ios"></q-icon>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </q-card-section>
      <q-card-actions class="q-pl-md q-pr-md q-pb-none">
        <q-btn
          :color="!isCanAdd ? 'disabled' : 'secondary'"
          :text-color="!isCanAdd ? 'disabled' : 'white'"
          class="fit"
          size="large"
          rounded
          unelevated
          :disable="!isCanAdd"
          :loading="loading || is_redirect"
          @click="onSubmit"
        >
          <div class="text-weight-bold text-subtitle2">
            {{ $t("confirm top up") }}
          </div>
        </q-btn>

        <q-btn
          @click="Back"
          color="primary"
          flat
          class="fit"
          size="large"
          :disable="is_redirect"
        >
          <div class="text-weight-medium text-subtitle2">{{ $t("Back") }}</div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <PaymentMethod
    ref="ref_paymentmethod"
    merchant_id=""
    method="fetchPayment"
    :is_login="false"
    @after-addpayment="onAfterAddpayment"
  ></PaymentMethod>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useClientStore } from "stores/ClientStore";
import { useDataStore } from "stores/DataStore";
import { NumberFormat } from "@coders-tm/vue-number-format";
import { normalizeBackendLabel } from "src/utils/textEncoding";

export default {
  name: "AddFunds",
  props: ["currency_code", "currency_symbol", "slug"],
  components: {
    PaymentMethod: defineAsyncComponent(() =>
      import("components/PaymentMethod.vue")
    ),
  },
  setup() {
    const ClientStore = useClientStore();
    const DataStore = useDataStore();
    return { ClientStore, DataStore };
  },
  data() {
    return {
      modal: false,
      amount: null,
      loading_payment: false,
      loading: false,
      payment_uuid: null,
      is_redirect: false,
      payment_processsing: false,
      amount_eg: "",
    };
  },
  computed: {
    getPayment() {
      return this.ClientStore.default_payment;
    },
    defaultPayment() {
      return this.ClientStore?.saved_payment_list?.default_payment_uuid || null;
    },
    getSavedpaymentlist() {
      return this.ClientStore?.saved_payment_list?.data || null;
    },
    isWeb() {
      if (!this.$q.capacitor) {
        return true;
      }
      return false;
    },
    isCanAdd() {
      if (this.amount && this.payment_uuid) {
        return true;
      }
      return false;
    },
  },
  mounted() {
    const number = new NumberFormat(this.DataStore.money_config);
    this.amount_eg = this.$t("eg.,") + " " + number.format(10);
  },
  methods: {
    displayPaymentName(value) {
      if (!value) return "";
      const label = normalizeBackendLabel(value);
      const translated = this.$t(label);
      return translated === label ? label : translated;
    },
    Back() {
      this.modal = false;
      this.$emit("afterBack");
    },
    onBeforeShow() {
      this.loading = false;
      this.amount = null;
      this.is_redirect = false;
      this.payment_processsing = false;
      if (!this.ClientStore.saved_payment_list) {
        this.getDefaultpayment();
      } else {
        this.payment_uuid =
          this.ClientStore?.saved_payment_list?.default_payment_uuid || null;
      }
    },
    async getDefaultpayment() {
      try {
        this.loading_payment = true;
        const results = await this.ClientStore.getMypayments({
          exclude: "offline_payment",
        });
        console.log("results", results.default_payment_uuid);
        this.payment_uuid = results.default_payment_uuid;
      } catch (error) {
      } finally {
        this.loading_payment = false;
      }
    },
    onAfterAddpayment() {
      this.getDefaultpayment();
    },
    onSubmit() {
      this.loading = true;
      const baseURL =
        process.env.VUE_ROUTER_MODE === "history"
          ? window.location.origin + "/"
          : window.location.origin + "/#/";

      const params = {
        return_url: this.isWeb ? `${baseURL}${this.slug}` : null,
        slug: this.slug,
        isWeb: this.isWeb,
        amount: this.amount,
        payment_code: this.getPayment?.payment_code || "",
        payment_uuid: this.payment_uuid || "",
        currency_code: this.currency_code,
      };
      const parameters = new URLSearchParams(params).toString();
      APIinterface.fetchDataByTokenPost("prepareAddFunds", parameters)
        .then((data) => {
          this.is_redirect =
            data.details?.payment_instructions?.redirect == "redirect"
              ? true
              : false;

          this.payment_processsing = !this.is_redirect ? true : false;

          if (this.$q.capacitor) {
            setTimeout(() => {
              this.is_redirect = false;
            }, 2000);
          }

          this.$emit("afterPreparepayment", data.details);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped>
.tagam-add-funds-sheet {
  background: var(--tagam-surface);
  border: 1px solid var(--tagam-border-soft);
  border-radius: 28px 28px 0 0;
  box-shadow: var(--tagam-shadow-strong);
}
</style>




