<template>
  <q-dialog
    v-model="modal"
    persistent
    full-width
    full-heightx
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    backdrop-filter="blur(4px)"
    @before-show="beforeShow"
  >
    <q-card class="radius10">
      <q-card-section class="text-center q-gutter-y-md myform">
        <div class="text-h5 text-weight-bold">
          {{ $t("Add Funds to Your Wallet") }}
        </div>

        <div class="text-body2">
          {{
            $t(
              "You don't have enough balance in your wallet to place this order."
            )
          }}
        </div>

        <div class="bg-light-blue-2x border-primary q-pa-sm radius8">
          <div class="text-caption">{{ $t("YOUR CURRENT BALANCE") }}</div>
          <div class="text-h5 text-weight-bold text-dark">
            {{ data?.wallet_balance ?? 0 }}
          </div>
        </div>

        <div class="text-body2">
          {{ $t("Please top up your wallet to proceed") }}.
        </div>

        <q-btn
          color="secondary"
          text-color="white"
          class="fit"
          size="large"
          rounded
          unelevated
          @click="showTopup"
        >
          <div class="text-weight-bold text-subtitle2">
            {{ $t("TOP UP NOW") }}
          </div>
        </q-btn>

        <q-btn
          @click="modal = false"
          color="grey"
          flat
          class="fit"
          size="large"
        >
          <div class="text-weight-medium text-subtitle2">CLOSE</div>
        </q-btn>

        <div class="text-body2">
          {{
            $t(
              "After topping up, your payment will be automatically processed using your wallet balance"
            )
          }}.
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <AddFunds
    ref="ref_addfunds"
    @after-preparepayment="afterPreparepayment"
    @after-back="afterBack"
    :currency_symbol="getUseCurrency"
    :currency_code="DataStorePersisted.getUseCurrency()"
    slug="checkout"
  ></AddFunds>

  <!-- PAYMENT COMPONENTS -->
  <StripeComponents
    ref="stripe"
    payment_code="stripe"
    :title="$t('Stripe')"
    @after-payment="afterPayment"
  />
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { Browser } from "@capacitor/browser";

export default {
  name: "CheckoutWalletfunds",
  props: ["data"],
  components: {
    AddFunds: defineAsyncComponent(() => import("components/AddFunds.vue")),
    StripeComponents: defineAsyncComponent(() =>
      import("components/StripeComponents.vue")
    ),
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
  },
  data() {
    return {
      modal: false,
      amount: null,
    };
  },
  methods: {
    showTopup() {
      this.modal = false;
      this.$refs.ref_addfunds.modal = true;
    },
    beforeShow() {
      this.amount = null;
    },
    afterBack() {
      this.modal = true;
    },
    afterPreparepayment(data) {
      try {
        this.$refs[data.payment_code].Dopayment(data);
      } catch (error) {
        this.PaymentRender(data);
      }
    },
    async PaymentRender(data) {
      let redirect = data?.payment_url || null;
      if (this.$q.capacitor) {
        await Browser.open({ url: redirect });
      } else {
        location.href = redirect;
      }
    },
    afterPayment(data) {
      console.log("afterPayment", data);
      this.$refs.ref_addfunds.modal = false;
      this.$emit("afterTopup");
      this.modal = false;
    },
  },
};
</script>
