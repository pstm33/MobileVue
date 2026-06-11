<template>
  <q-header
    reveal-offset="1"
    reveal
    class="tagam-account-header"
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="eva-arrow-back-outline"
        class="q-mr-sm"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md tagam-user-signup-mobile-page">
    <div class="text-center">
      <q-responsive style="height: 190px">
        <q-img src="login-1.svg" fit="scale-down" loading="lazy">
          <template v-slot:loading>
            <div class="text-primary">
              <q-spinner-ios size="sm" />
            </div>
          </template>
        </q-img>
      </q-responsive>

      <div class="text-h6 text-weight-bold">{{ $t("Create Account") }}</div>
      <div class="text-caption line-normal">
        {{ $t("Enter your phone number to continue") }}.
      </div>
    </div>
    <q-space class="q-pa-md"></q-space>

    <q-form @submit="onSubmit" class="myform">
      <q-input
        v-model="mobile_number"
        mask="##############"
        :placeholder="$t('Enter Phone Number')"
        outlined
        lazy-rules
        borderless
        class="input-borderless"
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
      >
        <template v-slot:prepend>
          <q-select
            dense
            v-model="mobile_prefix"
            :options="DataStore.phone_prefix_data"
            @filter="filterFn"
            behavior="dialog"
            input-debounce="700"
            style="border: none"
            emit-value
            borderless
            class="myq-field"
            dropdown-icon="eva-chevron-down-outline"
          >
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section avatar>
                  <q-img
                    :src="opt.flag"
                    style="height: 15px; max-width: 20px"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="tagam-text-muted">
                  {{ $t("No results") }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </template>
      </q-input>

      <q-btn
        no-caps
        unelevated
        color="primary"
        text-color="white"
        size="lg"
        class="fit radius8"
        type="submit"
        :loading="loading"
      >
        <div class="text-subtitle2 text-weight-bold">
          {{ $t("Next") }}
        </div>
      </q-btn>
    </q-form>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";

export default {
  name: "SignupMobile",
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  data() {
    return {
      loading: false,
      mobile_number: "",
      mobile_prefix: "",
      redirect: null,
    };
  },
  mounted() {
    this.mobile_prefix = this.DataStore.phone_default_data?.phonecode || null;
    this.redirect = this.$route.query?.redirect || null;
  },
  methods: {
    async onSubmit() {
      try {
        this.loading = true;
        const params = new URLSearchParams({
          mobile_number: this.mobile_number,
          mobile_prefix: this.mobile_prefix,
        }).toString();
        const results = await APIinterface.fetchDataPost(
          "RegistrationPhone",
          params
        );
        console.log("resp", results);
        this.$router.push({
          path: "/user/verify-otp",
          query: {
            uuid: results.details.client_uuid,
            validation_type: "sms",
            msg: results.msg,
            action: "RegistrationPhone",
          },
        });
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>






