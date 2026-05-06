<template>
  <q-header reveal-offset="1" reveal class="bg-transparent q-pa-sm">
    <div class="tagam-account-header-shell">
      <q-toolbar class="q-px-xs">
        <q-space></q-space>
        <q-btn flat round dense no-caps color="primary" to="/home" replace>
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Skip") }}
          </div>
        </q-btn>
      </q-toolbar>
    </div>
  </q-header>
  <q-page class="tagam-page-shell q-px-md q-pb-xl">
    <div class="tagam-auth-shell flex flex-center q-pt-lg">
      <section class="tagam-section-shell text-center full-width">
        <q-responsive style="height: 190px">
          <q-img src="login-1.svg" fit="scale-down" loading="lazy">
            <template v-slot:loading>
              <div class="text-primary">
                <q-spinner-ios size="sm" />
              </div>
            </template>
          </q-img>
        </q-responsive>

        <div class="tagam-section-heading__title">
          {{ $t("Let's Sign You In") }}
        </div>
        <div class="tagam-section-heading__meta">
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
                      <q-item-section class="text-grey">
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
      </section>
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

<style scoped>
.tagam-page-shell {
  background: #ffffff !important;
}

.tagam-auth-shell {
  min-height: calc(100vh - 96px);
}

.tagam-section-shell {
  background: #ffffff;
  border-radius: 28px;
  border: 1px solid rgba(113, 74, 24, 0.08);
  box-shadow: none;
  padding: 22px 20px 24px;
}

:global(body.body--dark) .tagam-page-shell {
  background:
    radial-gradient(circle at top, rgba(217, 107, 29, 0.18), transparent 28%),
    linear-gradient(180deg, var(--tagam-bg-strong) 0%, var(--tagam-bg) 100%) !important;
}

:global(body.body--dark) .tagam-account-header-shell {
  background: rgba(23, 19, 17, 0.92);
  border-bottom: 1px solid var(--tagam-stroke);
  border-radius: 0 0 22px 22px;
  backdrop-filter: blur(16px);
}

:global(body.body--dark) .tagam-section-shell {
  background: var(--tagam-surface);
  border-color: var(--tagam-stroke);
  box-shadow: var(--tagam-shadow);
}

:global(body.body--dark) .tagam-section-heading__title,
:global(body.body--dark) .tagam-page-shell .text-subtitle2,
:global(body.body--dark) .tagam-page-shell .text-h6,
:global(body.body--dark) .tagam-page-shell .text-weight-bold {
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-section-heading__meta,
:global(body.body--dark) .tagam-page-shell .text-grey,
:global(body.body--dark) .tagam-page-shell .text-caption,
:global(body.body--dark) .tagam-page-shell .text-body2 {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-page-shell .q-field__control {
  background: var(--tagam-surface-raised) !important;
  color: var(--tagam-text);
}
</style>
