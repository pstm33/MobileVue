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
      <q-form @submit="onSubmit">
        <q-card-section style="height: calc(60vh)" class="scroll myform">
          <div class="flex flex-center hidden">
            <div
              class="bg-dark radius8 text-white q-pa-md q-pl-md q-gutter-y-sm"
              style="min-width: 250px"
            >
              <div>
                <q-responsive style="height: 30px; width: 40px">
                  <q-img src="chip.png" />
                </q-responsive>
              </div>
              <div>
                {{
                  credit_card_number
                    ? credit_card_number
                    : "XXXX XXXX XXXX XXXX"
                }}
              </div>
              <div class="flex items-center q-gutter-x-md">
                <div>
                  {{ card_name ? card_name : $t("Card name") }}
                </div>
                <div>{{ expiry_date ? expiry_date : $t("MM/YY") }}</div>
                <div>{{ cvv ? cvv : $t("CVV") }}</div>
              </div>
              <div>
                {{ billing_address ? billing_address : $t("Billing address") }}
              </div>
            </div>
          </div>
          <q-space class="q-pa-sm"></q-space>

          <q-input
            v-model="credit_card_number"
            borderless
            :label="$t('Card number')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('this field is required'),
            ]"
            mask="#### #### #### ####"
          >
          </q-input>

          <q-input
            v-model="card_name"
            borderless
            :label="$t('Cardholder name')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
          </q-input>

          <div class="row q-gutter-x-md">
            <div class="col">
              <q-input
                v-model="expiry_date"
                borderless
                :label="$t('Exp. date')"
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    this.$t('this field is required'),
                ]"
                mask="##/##"
              >
              </q-input>
            </div>
            <div class="col">
              <q-input
                v-model="cvv"
                borderless
                :label="$t('Security Code')"
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    this.$t('this field is required'),
                ]"
                mask="####"
              >
              </q-input>
            </div>
          </div>

          <q-input
            v-model="billing_address"
            borderless
            :label="$t('Billing address')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
          </q-input>
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
            :disable="loading"
            @click="onClose"
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Close") }}
            </div>
          </q-btn>
          <q-btn
            no-caps
            unelevated
            color="secondary"
            text-color="white"
            size="lg"
            rounded
            class="fit col"
            type="submit"
            :loading="loading"
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Save") }}
            </div>
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "ocrComponents",
  props: ["title", "label", "payment_code", "payment_credentials"],
  setup() {
    return {};
  },
  data() {
    return {
      modal: false,
      data: [],
      loading: false,
      credit_card_number: "",
      expiry_date: "",
      cvv: "",
      card_name: "",
      billing_address: "",
    };
  },
  methods: {
    showPaymentForm() {
      this.modal = true;
    },
    onClose() {
      this.modal = false;
      this.$emit("onClose");
    },
    async onSubmit() {
      try {
        const params = {
          credit_card_number: this.credit_card_number,
          expiry_date: this.expiry_date,
          cvv: this.cvv,
          card_name: this.card_name,
          billing_address: this.billing_address,
          merchant_id: this.payment_credentials?.merchant_id || 0,
          payment_code: this.payment_code,
        };
        this.modal = false;
        const results = await APIinterface.savedCards(params);
        this.$emit("afterAddpayment");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
