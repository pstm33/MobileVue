<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    full-width
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
      <template v-if="loading2">
        <q-card-section style="height: calc(60vh)" class="scroll myform">
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
        </q-card-section>
      </template>
      <q-form @submit="onSubmit" v-else>
        <q-card-section style="height: calc(60vh)" class="scroll myform">
          <q-input
            v-model="first_name"
            borderless
            :placeholder="$t('First name')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
          </q-input>

          <q-input
            v-model="last_name"
            borderless
            :placeholder="$t('Last name')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
          </q-input>

          <q-input
            v-model="email_address"
            borderless
            :placeholder="$t('Email address')"
            type="email"
            :rules="[
              (val) => (val && val.length > 0) || $t('This field is required'),
              (val) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
                $t('Invalid email address'),
            ]"
          >
          </q-input>

          <q-select
            v-model="identification_type"
            :options="getList"
            :label="$t('Identification type')"
            :rules="[
              (val) =>
                (val && val !== null && val !== '') ||
                $t('This field is required'),
            ]"
            emit-value
            map-options
            behavior="menu"
            borderless
          />

          <q-input
            v-model="identification_number"
            borderless
            :placeholder="$t('Identification number')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
          </q-input>
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
            @click="onClose"
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Close") }}
            </div>
          </q-btn>
          <q-btn
            class="col"
            no-caps
            unelevated
            color="primary"
            text-color="white"
            size="lg"
            rounded
            :loading="loading"
            type="submit"
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
  name: "MercadopagoComponents",
  props: ["title", "label", "payment_code", "payment_credentials"],
  data() {
    return {
      modal: false,
      credentials: null,
      loading: false,
      loading2: false,
      first_name: "",
      last_name: "",
      email_address: "",
      identification_type: null,
      identification_number: "",
      ideidentification_data: null,
    };
  },
  computed: {
    getList() {
      return this.ideidentification_data?.data || null;
    },
    getDefaultid() {
      return this.ideidentification_data?.default || null;
    },
  },
  methods: {
    onClose() {
      this.modal = false;
      this.$emit("onClose");
    },
    showPaymentForm(credentials) {
      console.log("credentials", credentials);
      this.credentials = credentials;
      this.modal = true;
      this.fetchIdentification();
    },
    async fetchIdentification() {
      try {
        this.loading2 = true;
        const params = {
          merchant_id: this.credentials?.merchant_id || 0,
          merchant_type: this.credentials?.merchant_type || "",
          app: 1,
        };
        const results = await APIinterface.fetchGet(
          "mercadopago/api/getIdentificationList",
          params
        );
        this.ideidentification_data = results.details;
        this.identification_type = this.getDefaultid;
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        this.modal = false;
      } finally {
        this.loading2 = false;
      }
    },
    async onSubmit() {
      try {
        this.loading = true;
        const params = {
          first_name: this.first_name,
          last_name: this.last_name,
          email_address: this.email_address,
          identification_type: this.identification_type,
          identification_number: this.identification_number,
          merchant_id: this.credentials?.merchant_id || 0,
        };
        await APIinterface.fetchPost("mercadopago/api/app_addPayment", params);
        this.modal = false;
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
