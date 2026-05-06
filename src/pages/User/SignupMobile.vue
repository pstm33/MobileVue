<template>
  <q-header reveal reveal-offset="1" class="bg-transparent q-pa-sm">
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
      <section class="tagam-section-shell text-center">
      <q-responsive style="height: 190px">
        <q-img src="login-1.svg" fit="scale-down" loading="lazy">
          <template v-slot:loading>
            <div class="text-primary">
              <q-spinner-ios size="sm" />
            </div>
          </template>
        </q-img>
      </q-responsive>

      <div class="tagam-section-heading__title">{{ $t("Create Account") }}</div>
      <div class="tagam-section-heading__meta line-normal">
        {{ $t("Enter your phone number to continue") }}.
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
                <q-item-section class="text-grey">
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
      </section>
    </div>
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
