<template>
  <q-header reveal reveal-offset="50" class="bg-transparent q-pa-sm">
    <div class="tagam-account-header-shell">
      <q-toolbar class="q-px-xs">
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
    </div>
  </q-header>
  <q-page class="tagam-page-shell q-px-md q-pb-xl">
    <div class="tagam-auth-shell q-pt-lg">
      <section class="tagam-section-shell">
      <div class="tagam-section-heading__title">{{ $t("Guest information") }}</div>
      <q-space class="q-pa-sm"></q-space>

      <q-form @submit="onSubmit" class="myform">
        <q-input
          v-model="first_name"
          :label="$t('First name')"
          outlined
          lazy-rules
          borderless
          class="input-borderless"
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
          class="input-borderless"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          v-model="mobile_number"
          mask="##############"
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
              borderlessx
              class="myq-field"
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

        <div class="tagam-section-heading__title q-mt-md">{{ $t("Create Account") }}</div>
        <div class="tagam-section-heading__meta line-normal">({{ $t("optional") }})</div>

        <q-space class="q-pa-sm"></q-space>

        <q-input
          v-model="email_address"
          :label="$t('Email address')"
          type="email"
          outlined
          borderless
          class="input-borderless"
          lazy-rules
        />

        <q-space class="q-pa-sm"></q-space>

        <q-input
          v-model="password"
          :type="field_type"
          :label="$t('Password')"
          outlined
          borderless
          class="input-borderless"
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
          class="input-borderless"
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
            {{ $t("Continue") }}
          </div>
        </q-btn>
      </q-form>
      </section>
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
        email_address: this.email_address,
        password: this.password,
        cpassword: this.cpassword,
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

<style scoped>
.tagam-page-shell {
  background: #ffffff !important;
}

.tagam-auth-shell {
  padding-top: 8px !important;
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
