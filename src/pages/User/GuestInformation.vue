<template>
  <q-header
    reveal
    reveal-offset="50"
    class="tagam-guest-header"
  >
    <q-toolbar class="tagam-guest-toolbar">
      <q-btn
        @click="$router.back()"
        unelevated
        round
        dense
        icon="eva-arrow-back-outline"
        class="tagam-guest-back q-mr-sm"
        color="transparent"
        text-color="dark"
      />
    </q-toolbar>
  </q-header>
  <q-page class="tagam-guest-page">
    <div class="tagam-guest-shell">
      <div class="tagam-guest-intro">
        <div class="tagam-guest-kicker">{{ $t("Checkout") }}</div>
        <div class="tagam-guest-title">{{ $t("Guest information") }}</div>
      </div>

      <q-form @submit="onSubmit" class="tagam-guest-form">
        <q-input
          v-model="first_name"
          :label="$t('First name')"
          outlined
          lazy-rules
          borderless
          class="tagam-guest-field input-borderless"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />
        <q-input
          v-model="last_name"
          :label="$t('Last name')"
          outlined
          lazy-rules
          borderless
          class="tagam-guest-field input-borderless"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          v-model="mobile_number"
          mask="##############"
          :placeholder="$t('Phone number')"
          outlined
          lazy-rules
          borderless
          class="tagam-guest-field tagam-guest-phone input-borderless"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
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
              borderlessx
              class="tagam-guest-prefix myq-field"
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

        <div class="tagam-guest-section tagam-guest-account-toggle">
          <div>
            <div class="tagam-guest-section-title">{{ $t("Create Account") }}</div>
            <div class="tagam-guest-section-subtitle">{{ $t("optional") }}</div>
          </div>
          <q-toggle v-model="create_account" color="primary" />
        </div>

        <q-slide-transition>
          <div v-show="create_account" class="tagam-guest-account-fields">
            <q-input
              v-model="email_address"
              :label="$t('Email address')"
              type="email"
              outlined
              borderless
              class="tagam-guest-field input-borderless"
              lazy-rules
            />

            <q-space class="q-pa-sm"></q-space>

            <q-input
              v-model="password"
              :type="field_type"
              :label="$t('Password')"
              outlined
              borderless
              class="tagam-guest-field input-borderless"
            >
              <template v-slot:append>
                <q-icon
                  @click="
                    field_type = field_type == 'password' ? 'text' : 'password'
                  "
                  :name="FieldIcon"
                  color="grey"
                  class="cursor-pointer"
                />
              </template>
            </q-input>

            <q-space class="q-pa-sm"></q-space>

            <q-input
              :type="field_type1"
              v-model="cpassword"
              :label="$t('Confirm Password')"
              outlined
              borderless
              class="tagam-guest-field input-borderless"
            >
              <template v-slot:append>
                <q-icon
                  @click="
                    field_type1 = field_type1 == 'password' ? 'text' : 'password'
                  "
                  :name="FieldIcon1"
                  color="grey"
                  class="cursor-pointer"
                />
              </template>
            </q-input>
          </div>
        </q-slide-transition>

        <q-space class="q-pa-sm"></q-space>
        <q-btn
          no-caps
          unelevated
          color="primary"
          text-color="white"
          size="lg"
          class="fit tagam-guest-submit"
          type="submit"
          rounded
          :loading="loading"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Continue") }}
          </div>
        </q-btn>
      </q-form>
    </div>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useDataStore } from "stores/DataStore";
import { useClientStore } from "stores/ClientStore";

export default {
  name: "GuestInformation",
  data() {
    return {
      loading: false,
      field_type: "password",
      field_type1: "password",
      first_name: "",
      last_name: "",
      email_address: "",
      password: "",
      cpassword: "",
      create_account: false,
      mobile_number: "",
      mobile_prefix: "",
      options: [],
      inner_loading: false,
      redirect: "",
    };
  },
  setup() {
    const DataStore = useDataStore();
    const ClientStore = useClientStore();
    return { DataStore, ClientStore };
  },
  created() {
    this.redirect = this.$route.query.redirect;
  },
  computed: {
    FieldIcon() {
      return this.field_type === "password"
        ? "eva-eye-outline"
        : "eva-eye-off-outline";
    },
    FieldIcon1() {
      return this.field_type1 === "password"
        ? "eva-eye-outline"
        : "eva-eye-off-outline";
    },
  },
  watch: {
    DataStore: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        if (Object.keys(newValue.phone_default_data).length > 0) {
          this.mobile_prefix = "+" + newValue.phone_default_data.phonecode;
        }
      },
    },
  },
  methods: {
    onSubmit() {
      const $data = {
        first_name: this.first_name,
        last_name: this.last_name,
        email_address: this.create_account ? this.email_address : "",
        password: this.create_account ? this.password : "",
        cpassword: this.create_account ? this.cpassword : "",
        mobile_prefix: this.mobile_prefix,
        mobile_number: this.mobile_number,
        local_id: APIinterface.getStorage("place_id"),
      };
      this.loading = true;
      APIinterface.fetchDataPost("registerGuestUser", $data)
        .then((data) => {
          APIinterface.ShowSuccessful(data.msg, this.$q);

          if (
            typeof data.details.uuid !== "undefined" &&
            data.details.uuid !== null
          ) {
            // this.$router.push({
            //   path: "/account/verify",
            //   query: { uuid: data.details.uuid, redirect: this.redirect },
            // });
            this.$router.push({
              path: "/user/verify-otp",
              query: {
                uuid: data.details.uuid,
                msg: data.msg,
                action: "completeSignupWithCode",
                validation_type: "email",
              },
            });
          } else {
            auth.setUser(data.details.user_data);
            auth.setToken(data.details.user_token);
            this.ClientStore.user_settings = data.details.user_settings;
            if (
              typeof this.redirect !== "undefined" &&
              this.redirect !== null
            ) {
              this.$router.replace(this.redirect);
            } else {
              this.$router.replace("/home");
            }
          }
        })
        .catch((error) => {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>



