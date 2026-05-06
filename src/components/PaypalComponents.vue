<template>
  <q-dialog
    v-model="modal"
    maximized
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="beforeShow"
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
      <div class="absolute-center full-width q-pa-md">
        <div ref="paypal_button" class="margin-auto full-width" />
      </div>
    </q-card>
  </q-dialog>

  <ModalLoader
    ref="ref_loader"
    :title="$t('Processing payment')"
    :subtitle="$t('dont_close_window')"
  ></ModalLoader>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { loadScript } from "vue-plugin-load-script";

let paypalHandle;
const PAYPAL_ENDPOINT = "paypal/apiv2";
export default {
  name: "PaypalComponents",
  props: ["title", "label", "payment_code", "credentials"],
  components: {
    ModalLoader: defineAsyncComponent(() =>
      import("components/ModalLoader.vue")
    ),
  },
  data() {
    return {
      modal: false,
      data: null,
      transaction_type: "",
    };
  },
  methods: {
    onClose() {
      this.modal = false;
      this.$emit("onClose");
    },
    PaymentRender(value) {
      this.data = value;
      this.modal = true;
      this.transaction_type = "purchase_food";

      const currency_code =
        this.data?.force_payment_data?.use_currency_code || null;
      const client_id = this.credentials?.attr1 || null;

      const amount = this.data?.force_payment_data?.total_exchange || null;

      this.loadPaypal(currency_code, client_id, amount);
    },

    loadPaypal(currency_code, client_id, amount) {
      loadScript(
        "https://www.paypal.com/sdk/js?client-id=" +
          client_id +
          "&currency=" +
          currency_code +
          "&disable-funding=credit,card"
      )
        .then(() => {
          this.renderPaypal(amount);
        })
        .catch((err) => {
          APIinterface.ShowAlert(err, this.$q.capacitor, this.$q);
        });
    },
    renderPaypal(amount) {
      paypalHandle = paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount,
                },
              },
            ],
          });
        },
        onCancel: (data) => {
          //
        },
        onError: (error) => {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((orderData) => {
            const transaction =
              orderData.purchase_units[0].payments.captures[0];
            console.log("transaction_type", this.transaction_type);
            if (this.transaction_type == "purchase_food") {
              const params = {
                transaction_id: transaction.id,
                order_id: orderData.id,
                order_uuid: this.data?.order_uuid || null,
                cart_uuid: this.data?.cart_uuid || null,
              };
              console.log("params", params);
              this.verifyPayment(params);
            } else if (this.transaction_type == "wallet_loading") {
            }
          });
        },
      });
      paypalHandle.render(this.$refs.paypal_button);
    },

    async verifyPayment(value) {
      try {
        this.$refs.ref_loader.modal = true;
        const results = await APIinterface.fetchDataByTokenPostPayment(
          "PaypalVerifyPayment",
          value,
          PAYPAL_ENDPOINT
        );
        console.log("results", results);
        this.modal = false;
        this.$emit("afterPayment", results.details);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.$refs.ref_loader.modal = false;
      }
    },
    //
  },
};
</script>
