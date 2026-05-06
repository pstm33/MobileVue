<template>
  <q-dialog
    v-model="show_modal"
    persistent
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card style="width: 500px; max-width: 80vw">
      <q-toolbar class="text-primary top-toolbar q-pl-md" dense>
        <q-space></q-space>
        <q-btn
          @click="show_modal = !true"
          color="white"
          square
          unelevated
          text-color="grey"
          icon="las la-times"
          dense
          no-caps
          size="sm"
          class="border-grey radius8"
        />
      </q-toolbar>

      <q-form @submit="onSubmit">
        <q-card-section class="q-pa-md">
          <div class="column q-col-gutter-sm">
            <q-input
              dense
              :bg-color="$q.dark.mode ? 'grey600' : 'mygrey'"
              :color="$q.dark.mode ? 'grey300' : 'primary'"
              outlined
              v-model="card_number"
              label="Card number"
              :rules="[
                (val) => (val && val.length > 0) || 'this field is required',
              ]"
              mask="#### #### #### ####"
            />
          </div>

          <div class="row q-col-gutter-md">
            <div class="col">
              <q-input
                dense
                :bg-color="$q.dark.mode ? 'grey600' : 'mygrey'"
                :color="$q.dark.mode ? 'grey300' : 'primary'"
                outlined
                v-model="expiry_date"
                label="Exp. date"
                class="no-margin"
                :rules="[
                  (val) => (val && val.length > 0) || 'this field is required',
                ]"
                mask="##/##"
              />
            </div>
            <div class="col">
              <q-input
                dense
                :bg-color="$q.dark.mode ? 'grey600' : 'mygrey'"
                :color="$q.dark.mode ? 'grey300' : 'primary'"
                outlined
                v-model="cvv"
                label="Security Code"
                class="no-margin"
                :rules="[
                  (val) => (val && val.length > 0) || 'this field is required',
                ]"
                mask="####"
              />
            </div>
          </div>
          <!-- row -->

          <div class="row q-col-gutter-md">
            <div class="col">
              <q-input
                dense
                :bg-color="$q.dark.mode ? 'grey600' : 'mygrey'"
                :color="$q.dark.mode ? 'grey300' : 'primary'"
                outlined
                v-model="first_name"
                label="First name"
                class="no-margin"
                :rules="[
                  (val) => (val && val.length > 0) || 'this field is required',
                ]"
              />
            </div>
            <div class="col">
              <q-input
                dense
                :bg-color="$q.dark.mode ? 'grey600' : 'mygrey'"
                :color="$q.dark.mode ? 'grey300' : 'primary'"
                outlined
                v-model="last_name"
                label="Last name"
                class="no-margin"
                :rules="[
                  (val) => (val && val.length > 0) || 'this field is required',
                ]"
              />
            </div>
          </div>
          <!-- row -->

          <q-card-actions>
            <q-btn
              type="submit"
              :label="label.submit"
              :loading="loading"
              unelevated
              no-caps
              color="primary text-white"
              class="full-width text-weight-bold"
              size="lg"
            />
          </q-card-actions>
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import jwt_decode from "jwt-decode";

export default {
  name: "JadpaymentComponents",
  props: ["title", "label", "payment_code", "payment_credentials"],
  data() {
    return {
      show_modal: false,
      data: [],
      loading: false,
      credentials: [],
      card_number: "4111111111111111",
      expiry_date: "12/2025",
      cvv: "123",
      first_name: "basti",
      last_name: "bach",
      email_address: "bastikikang@gmail.com",
      street: "Guadalupe Viejo",
      city: "city",
      postal_code: "postal code",
      state: "state",
      payment_uuid: "",
      order_uuid: "",
      payment_details: [],
      paymentData: [],
      country_code: "",
      country_list: [],
      paymentType: "",
      cart_uuid: "",
    };
  },
  mounted() {
    //this.getCountryList();
  },
  watch: {
    payment_credentials(newval, oldval) {
      this.setCredentials();
    },
  },
  methods: {
    close() {
      this.show_modal = false;
    },
    closePayment() {
      this.$emit("afterCancelPayment");
    },
    setCredentials() {
      if (
        typeof this.payment_credentials[this.payment_code] !== "undefined" &&
        this.payment_credentials[this.payment_code] !== null
      ) {
        this.credentials = this.payment_credentials[this.payment_code];
      }
    },
    getCountryList() {
      APIinterface.fetchDataByTokenPostPayment(
        "api/getCountryList",
        {},
        this.payment_code
      )
        .then((data) => {
          if (data.code == 1) {
            this.country_list = data.details.country_list;
            this.country_code = data.details.default_country;
          }
        })
        .catch((error) => {})
        .then((data) => {});
    },
    PaymentRender(data) {
      this.cart_uuid = data.cart_uuid;
      this.paymentData = data.force_payment_data;
      this.payment_uuid = data.payment_uuid;
      this.order_uuid = data.order_uuid;
      this.payment_details = data.force_payment_data;
      this.show_modal = true;
      this.paymentType = "afterPurchase";
    },
    Dopayment(data) {
      this.paymentData = data;
      const paymentData = jwt_decode(data);
      this.payment_details = {
        use_currency_code: paymentData.currency_code,
        total_exchange: paymentData.amount,
        reference_id: paymentData.reference_id,
      };
      this.show_modal = true;
      this.paymentType = "afterWalletPayment";
    },
    onSubmit() {
      var str = this.expiry_date;
      var expiry = str.split("/");
      var expiry_month = expiry[0];
      var expiry_year = expiry[1];

      const str_card = this.card_number;
      const card_number = str_card.replace(/ /g, "");
      this.loading = true;
      APIinterface.fetchDataByTokenPostPayment(
        "api/cardpayment",
        {
          merchant_id: this.credentials.merchant_id,
          merchant_type: this.credentials.merchant_type,
          payment_code: this.payment_code,
          card_number: card_number,
          expiry_month: expiry_month,
          expiry_year: expiry_year,
          cvv: this.cvv,
          first_name: this.first_name,
          last_name: this.last_name,
          payment_details: this.payment_details,
          //email_address: this.email_address,
          // street: this.street,
          // city: this.city,
          // postal_code: this.postal_code,
          // state: this.state,
          // country_code: this.country_code,
        },
        this.payment_code
      )
        .then((data) => {
          let payment_reference = data.details.payment_reference;
          if (this.paymentType == "afterPurchase") {
            setTimeout(() => {
              this.afterPayment(payment_reference);
            }, 200);
          } else {
            this.afterWalletPayment(payment_reference);
          }
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    afterPayment(payment_reference) {
      APIinterface.showLoadingBox(
        this.$t("Processing payment") +
          "<br/>" +
          this.$t("don't close this window"),
        this.$q
      );
      APIinterface.fetchDataByTokenPostPayment(
        "api/paymentSuccess",
        {
          payment_reference: payment_reference,
          order_uuid: this.order_uuid,
          cart_uuid: this.cart_uuid,
        },
        this.payment_code
      )
        .then((data) => {
          console.log("data", data);
          this.$emit("afterPayment", data.details);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    afterWalletPayment(payment_reference) {
      this.show_modal = false;
      APIinterface.showLoadingBox(
        this.$t("Processing payment") +
          "<br/>" +
          this.$t("don't close this window"),
        this.$q
      );
      APIinterface.fetchDataByTokenPostPayment(
        "api/walletsuccessful",
        {
          payment_reference: payment_reference,
          data: this.paymentData,
        },
        this.payment_code
      )
        .then((data) => {
          this.$emit("afterSuccessfulpayment", data.details);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
  },
};
</script>
