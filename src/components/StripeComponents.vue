<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="loadStripe"
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
      <q-card-section style="height: calc(60vh)" class="scroll">
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
          <div class="flex flex-center">
            <div
              class="bg-dark radius8 text-white q-pa-md q-pl-md q-gutter-y-sm"
              style="min-width: 250px"
            >
              <div>
                <q-responsive style="height: 30px; width: 40px">
                  <q-img src="chip.png" />
                </q-responsive>
              </div>
              <div>XXXX XXXX XXXX XXXX</div>
              <div class="flex items-center q-gutter-x-md">
                <div>{{ getCardname }}</div>
                <div>{{ $t("MM/YY") }}</div>
                <div>{{ $t("CVV") }}</div>
              </div>
            </div>
          </div>
          <q-space class="q-pa-sm"></q-space>

          <q-input
            v-model="cardholder_name"
            borderless
            color="dark"
            class="bg-mygrey1 radius28 q-pl-md"
            :label="$t('Cardholder name')"
            stack-label
          >
          </q-input>

          <div class="bg-mygrey1 radius28 q-mt-md q-mb-md q-pa-md">
            <div ref="card_element"></div>
          </div>

          <div class="text-caption text-grey line-normal">
            {{ $t("I authorise to send instructions to the financial") }}
            {{
              $t(
                "institution that issued my card to take payments from my card"
              )
            }}
            {{ $t("account in accordance with the terms of my agreement") }}
          </div>
        </template>
      </q-card-section>
      <q-card-actions
        v-if="!loading"
        class="row q-pl-md q-pr-md q-pb-md q-gutter-x-md"
      >
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
        <q-intersection
          transition="slide-left"
          class="col"
          v-if="client_secret"
        >
          <q-btn
            no-caps
            unelevated
            :color="!client_secret ? 'disabled' : 'secondary'"
            :text-color="!client_secret ? 'disabled' : 'white'"
            size="lg"
            rounded
            :loading="loading2"
            @click="onSubmit"
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

  <ModalLoader
    ref="ref_loader"
    :title="$t('Processing payment')"
    :subtitle="$t('dont_close_window')"
  ></ModalLoader>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { loadScript } from "vue-plugin-load-script";
const STRIPE_ENDPOINT = "stripe/apiv2";

export default {
  name: "StripeComponents",
  props: ["title", "label", "payment_code", "payment_credentials"],
  components: {
    ModalLoader: defineAsyncComponent(() =>
      import("components/ModalLoader.vue")
    ),
  },
  data() {
    return {
      modal: false,
      loading: true,
      loading2: false,
      credentials: null,
      cardholder_name: null,
      client_secret: null,
      customer_id: null,
      stripe: null,
      cardElement: null,
    };
  },
  computed: {
    getCardname() {
      return this.cardholder_name
        ? this.cardholder_name
        : this.$t("Cardholder name");
    },
  },
  methods: {
    onClose() {
      this.modal = false;
      this.$emit("onClose");
    },
    showPaymentForm(credentials) {
      this.credentials = credentials;
      this.modal = true;
      this.createCustomer();
    },
    async createCustomer() {
      try {
        this.loading = true;
        const params = {
          merchant_id: this.credentials?.merchant_id || 0,
          merchant_type: this.credentials?.merchant_type || "",
          payment_code: this.payment_code,
        };
        const results = await APIinterface.fetchPost2(
          STRIPE_ENDPOINT + "/StripeCreateCustomer",
          params
        );
        this.client_secret = results.details.client_secret;
        this.customer_id = results.details.customer_id;
        this.renderCard();
      } catch (error) {
        this.modal = false;
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
      }
    },
    loadStripe() {
      loadScript("https://js.stripe.com/v3/")
        .then(() => {
          console.log("loaded");
        })
        .catch(() => {
          console.log("failed loading");
        });
    },
    renderCard() {
      const style = {
        base: {
          color: "#32325d",
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: "antialiased",
          fontSize: "16px",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#fa755a",
          iconColor: "#fa755a",
        },
      };

      const publish_key = this.credentials?.attr2 || null;
      console.log("publish_key", publish_key);
      if (!publish_key) {
        APIinterface.ShowAlert(
          this.$t("Invalid public key"),
          this.$q.capacitor,
          this.$q
        );
        return;
      }
      this.stripe = Stripe(publish_key);
      const elements = this.stripe.elements();
      this.cardElement = elements.create("card", {
        style: style,
        hidePostalCode: true,
      });
      this.loading = false;
      setTimeout(() => {
        this.cardElement.mount(this.$refs.card_element);
      }, 500);
    },

    onSubmit() {
      if (!this.cardholder_name) {
        APIinterface.ShowAlert(
          this.$t("Cardholder is required"),
          this.$q.capacitor,
          this.$q
        );
        return;
      }

      this.loading2 = true;
      this.stripe
        .confirmCardSetup(this.client_secret, {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: this.cardholder_name,
            },
          },
        })
        .then((result) => {
          this.loading2 = false;
          if (result.error) {
            if (result.error.code === "setup_intent_unexpected_state") {
              this.createIntent();
            } else {
              APIinterface.ShowAlert(
                result.error?.message,
                this.$q.capacitor,
                this.$q
              );
            }
          } else {
            this.savePayment(result.setupIntent.payment_method);
          }
        });
    },

    async savePayment(value) {
      APIinterface.showLoadingBox("", this.$q);
      console.log("savePayment", value);
      const params = {
        payment_method_id: value,
        merchant_id: this.credentials?.merchant_id || 0,
        merchant_type: this.credentials?.merchant_type || "",
        payment_code: this.payment_code,
      };
      try {
        await APIinterface.fetchDataByTokenPostPayment(
          "StripeSavePayment",
          params,
          STRIPE_ENDPOINT
        );
        this.modal = false;
        this.$emit("afterAddpayment");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },

    async PaymentRender(value) {
      try {
        this.$refs.ref_loader.modal = true;
        const params = {
          cart_uuid: value.cart_uuid,
          order_uuid: value.order_uuid,
          payment_uuid: value.payment_uuid,
          payment_code: this.payment_code,
        };
        const results = await APIinterface.fetchDataByTokenPostPayment(
          "StripePaymentIntent",
          params,
          STRIPE_ENDPOINT
        );
        this.$emit("afterPayment", results.details);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.$refs.ref_loader.modal = false;
      }
    },
    async Dopayment(data) {
      try {
        this.$refs.ref_loader.modal = true;
        const results = await APIinterface.fetchDataByTokenPostPayment(
          "StripeProcesspayment",
          {
            data: data.data,
          },
          STRIPE_ENDPOINT
        );
        this.$emit("afterPayment", results.details);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.$refs.ref_loader.modal = false;
      }
    },
  },
};
</script>
