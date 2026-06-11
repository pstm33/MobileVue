<template>
  <q-header
    :class="{ 'tagam-surface-elevated text-white': $q.dark.mode, 'tagam-surface tagam-text-main': !$q.dark.mode, }"
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
  <q-page class="q-pa-md tagam-user-verification-page">
    <div class="text-h6 text-weight-bold">{{ $t("OTP Verification") }}</div>

    <div v-if="message" class="text-caption q-mb-md">
      {{ message }}
    </div>

    <q-form @submit="onSubmit" class="myform">
      <q-input
        v-model="otp"
        :placeholder="$t('Enter code')"
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
        outlined
        lazy-rules
        borderless
        class="input-borderless"
      />

      <q-btn
        no-caps
        unelevated
        color="primary"
        text-color="white"
        size="lg"
        class="fit radius8"
        type="submit"
        rounded
        :loading="loading"
        :disabled="!hasInput"
      >
        <div class="text-subtitle2 text-weight-bold">
          {{ $t("Continue") }}
        </div>
      </q-btn>
    </q-form>

    <q-space class="q-pa-sm"></q-space>

    <div class="text-weight-bold text-subtitle2">
      {{ $t("Didn't receive the code?") }}
    </div>

    <template v-if="counter === 0">
      <q-btn
        unelevated
        outlined
        no-caps
        class="q-pl-none"
        size="md"
        text-color="primary"
        @click="resendSMS"
      >
        <div class="text-weight-bold">
          <template v-if="validation_type == 'sms'">
            {{ $t("Resend SMS") }}
          </template>
          <template v-else-if="validation_type == 'email'">
            {{ $t("Resend OTP") }}
          </template>
        </div>
      </q-btn>
    </template>
    <template v-else>
      <div class="text-caption q-mt-sm">
        <u>{{ $t("Resend Code in") }} {{ counter }}</u>
      </div>
    </template>
    <!-- actions=>{{ actions }} -->
  </q-page>
</template>

<script>
import { useDataStore } from "stores/DataStore";
import APIinterface from "src/api/APIinterface";
import { useClientStore } from "stores/ClientStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import auth from "src/api/auth";

export default {
  name: "VerificationPage",
  data() {
    return {
      otp: "",
      message: "",
      loading: false,
      uuid: "",
      counter: undefined,
      timer: undefined,
      validation_type: "email",
      actions: null,
      redirect: null,
      cont_path: null,
    };
  },
  setup() {
    const DataStore = useDataStore();
    const ClientStore = useClientStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, ClientStore, DataStorePersisted };
  },
  mounted() {
    this.uuid = this.$route.query.uuid;
    this.message = this.$route.query.msg;
    this.validation_type = this.$route.query.validation_type;
    this.actions = this.$route.query?.action || null;
    this.redirect = this.$route.query?.redirect || null;
    this.cont_path = this.$route.query?.cont_path || null;

    if (!APIinterface.empty(this.DataStore.signup_resend_counter)) {
      this.startTimer();
    } else {
      this.$watch(
        () => this.DataStore.$state.signup_resend_counter,
        (newData, oldData) => {
          this.startTimer();
        }
      );
    }
  },
  beforeUnmount() {
    this.stopTimer();
  },
  watch: {
    counter(newval, oldval) {
      if (newval <= 0) {
        this.stopTimer();
      }
    },
  },
  computed: {
    hasInput() {
      if (!APIinterface.empty(this.otp)) {
        return true;
      }
      return false;
    },
  },
  methods: {
    stopTimer() {
      clearInterval(this.timer);
    },
    startTimer() {
      this.stopTimer();
      this.counter = this.DataStore.signup_resend_counter;
      this.timer = setInterval(() => {
        this.counter--;
      }, 1000);
    },
    resendSMS() {
      this.loading = true;
      //this.message = "";
      APIinterface.fetchDataPost(
        "resendOTP",
        "uuid=" + this.uuid + "&validation_type=" + this.validation_type
      )
        .then((data) => {
          this.message = data.msg;
          APIinterface.ShowSuccessful(data.msg, this.$q);
          this.startTimer();
        })
        .catch((error) => {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    async onSubmit() {
      try {
        this.loading = true;
        const methods =
          this.actions && this.actions !== "RegistrationPhone"
            ? this.actions
            : "verifyOTP";

        const params = new URLSearchParams({
          uuid: this.uuid ?? "",
          otp: this.otp ?? "",
        }).toString();
        const resp = await APIinterface.fetchDataPost(methods, params);

        // if (!this.actions) {
        //   this.$router.replace({
        //     path: "/user/reset-password",
        //     query: { uuid: resp.details.uuid },
        //   });
        //   return;
        // }

        if (this.cont_path) {
          console.log("cont_path", this.cont_path);
          this.$router.replace({
            path: this.cont_path,
            query: { uuid: resp.details.uuid },
          });
          return;
        }

        const coordinates = this.DataStorePersisted.coordinates;
        const searchMode = this.DataStore.getSearchMode;
        const locationData = this.DataStorePersisted.getLocation;

        if (this.actions == "userloginbyotp") {
          auth.setUser(resp.details.user_data);
          auth.setToken(resp.details.user_token);
          this.ClientStore.user_settings = resp.details.user_settings;

          if (searchMode == "location") {
            if (!locationData) {
              this.$router.push("/location/add-location");
              return;
            }
          } else {
            if (!coordinates) {
              this.$router.push("/location/map");
              return;
            }
          }

          if (this.redirect) {
            this.$router.replace(this.redirect);
          } else {
            this.$router.push("/home");
          }
        } else if (this.actions == "RegistrationPhone") {
          this.$router.replace({
            path: "/user/signup-complete",
            query: { uuid: this.uuid },
          });
        } else if (this.actions == "verifiySocialSignup") {
          this.$router.replace({
            path: "/account/complete-registration",
            query: { uuid: this.uuid },
          });
        } else if (this.actions == "completeSignupWithCode") {
          console.log("here", resp);

          auth.setUser(resp.details.user_data);
          auth.setToken(resp.details.user_token);
          this.ClientStore.user_settings = resp.details.user_settings;

          if (searchMode == "location") {
            if (!locationData) {
              this.$router.push("/location/add-location");
              return;
            }
          } else {
            if (!coordinates) {
              this.$router.push("/location/map");
              return;
            }
          }

          if (this.redirect) {
            this.$router.push(this.redirect);
          } else {
            this.$router.push("/home");
          }
        }
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>






