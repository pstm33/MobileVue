<template>
  <q-header
    reveal-offset="1"
    reveal
    class="tagam-account-header"
  >
    <q-toolbar>
      <q-space></q-space>
      <q-btn flat round dense no-caps color="primary" to="/home" replace>
        <div class="text-subtitle2 text-weight-bold">
          {{ $t("Skip") }}
        </div>
      </q-btn>
    </q-toolbar>
  </q-header>
  <q-page padding class="tagam-user-login-using-otp-page">
    <div class="flex flex-center absolute-center fit">
      <div class="text-center full-width q-pl-md q-pr-md">
        <q-responsive style="height: 190px">
          <q-img src="login-1.svg" fit="scale-down" loading="lazy">
            <template v-slot:loading>
              <div class="text-primary">
                <q-spinner-ios size="sm" />
              </div>
            </template>
          </q-img>
        </q-responsive>

        <div class="text-h6 text-weight-bold">
          {{ $t("Let's Sign You In") }}
        </div>
        <div class="text-caption">
          {{ $t("Cravings don't wait. Sign in and satisfy them!") }}
        </div>
        <q-space class="q-pa-sm"></q-space>

        <q-form @submit="onSubmit" class="myform">
          <template v-if="validation_type == 'email'">
            <q-input
              v-model="email"
              borderless
              :placeholder="$t('Email address')"
              :rules="[(val) => /.+@.+\..+/.test(val) || $t('Invalid email')]"
            >
              <template v-slot:prepend>
                <q-icon color="primary" name="eva-email-outline" />
              </template>
            </q-input>
          </template>
          <template v-else>
            <q-input
              v-model="mobile_number"
              mask="##############"
              :placeholder="$t('Enter Phone Number')"
              outlined
              lazy-rules
              borderless
              class="input-borderless"
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
          </template>

          <div class="flex justify-end q-mb-md" style="margin-top: -10px">
            <q-btn
              no-caps
              unelevated
              color="primary"
              padding="1px"
              flat
              to="/user/forgotpass"
            >
              <div class="text-weight-bold text-caption">
                {{ $t("Forgot password?") }}
              </div>
            </q-btn>
          </div>

          <div class="q-gutter-sm">
            <q-radio
              v-model="validation_type"
              checked-icon="task_alt"
              unchecked-icon="panorama_fish_eye"
              val="email"
              :label="$t('Email')"
            />
            <q-radio
              v-model="validation_type"
              checked-icon="task_alt"
              unchecked-icon="panorama_fish_eye"
              val="sms"
              :label="$t('Mobile')"
            />
          </div>

          <q-space class="q-pa-sm"></q-space>
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
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Send OTP") }}
            </div>
          </q-btn>
        </q-form>

        <div class="separator">
          <div class="line"></div>
          <span class="text">{{ $t("or") }}</span>
          <div class="line"></div>
        </div>

        <template v-if="isGuestEnabled">
          <q-btn
            outline
            color="mygrey"
            style="color: #34c85a"
            no-caps
            class="fit radius8"
            size="lg"
            :to="{
              path: '/user/guest',
              query: { redirect: this.redirect },
            }"
          >
            <q-icon
              name="eva-person-outline"
              color="secondary"
              size="sm"
            ></q-icon>
            <div class="q-ml-sm text-weight-light text-subtitle2">
              {{ $t("Continue as Guest") }}
            </div>
          </q-btn>
        </template>

        <q-space class="q-pa-sm"></q-space>
        <div class="q-gutter-x-md">
          <q-btn round padding="11px" outline color="mygrey">
            <q-avatar size="20px">
              <img src="google-icon-logo.svg" />
            </q-avatar>
          </q-btn>
          <q-btn round padding="11px" outline color="mygrey">
            <q-avatar size="22px">
              <img src="facebook-3-logo.svg" />
            </q-avatar>
          </q-btn>
          <q-btn round padding="11px" outline color="mygrey">
            <q-avatar size="22px">
              <img src="apple-black-logo.svg" />
            </q-avatar>
          </q-btn>
        </div>

        <q-space class="q-pa-sm"></q-space>
        <div class="flex justify-center q-gutter-x-sm">
          <div>{{ $t("Don't have an account?") }}</div>
          <div>
            <q-btn
              no-caps
              unelevated
              color="primary"
              padding="1px"
              flat
              to="/user/signup"
            >
              <div class="text-weight-bold text-caption">
                {{ $t("Sign up") }}
              </div>
            </q-btn>
          </div>
        </div>
        <q-space class="q-pa-md"></q-space>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useDataStore } from "stores/DataStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "LoginPage",
  data() {
    return {
      redirect: null,
      loading: false,
      validation_type: "email",
      email: "",
      mobile_number: "",
      mobile_prefix: "",
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  mounted() {
    this.redirect = this.$route.query?.redirect || null;
    this.mobile_prefix = this.DataStore.phone_default_data?.phonecode || null;
  },
  computed: {
    isGuestEnabled() {
      return this.DataStore.attributes_data?.enabled_guest || false;
    },
  },
  methods: {
    async onSubmit() {
      try {
        this.loading = true;
        const params = new URLSearchParams({
          validation_type: this.validation_type,
          email_address: this.email,
          mobile_number: this.mobile_number,
          mobile_prefix: this.mobile_prefix,
        }).toString();
        const results = await APIinterface.fetchDataPost("requestOTP", params);
        this.$router.push({
          path: "/user/verify-otp",
          query: {
            uuid: results.details.uuid,
            validation_type: this.validation_type,
            msg: results.msg,
            action: "userloginbyotp",
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






