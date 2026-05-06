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
      <section class="tagam-section-shell">
      <div class="text-center">
        <div class="tagam-section-heading__title">
          {{ $t("Complete Registration") }}
        </div>
        <div class="tagam-section-heading__meta line-normal">
          {{ $t("Fill your information") }}.
        </div>
      </div>

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
          v-model="email_address"
          :label="$t('Email address')"
          outlined
          lazy-rules
          borderless
          class="input-borderless"
          :rules="[(val) => /.+@.+\..+/.test(val) || $t('Invalid email')]"
        />

        <q-input
          v-model="password"
          :type="field_type"
          :label="$t('Password')"
          outlined
          lazy-rules
          borderless
          class="input-borderless"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
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

        <q-input
          :type="field_type1"
          v-model="cpassword"
          :label="$t('Confirm Password')"
          outlined
          lazy-rules
          borderless
          class="input-borderless"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
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

        <CustomFields ref="ref_customfields"></CustomFields>

        <template v-if="DataStore.attributes_data?.signup_terms">
          <div
            class="text-caption q-mb-md"
            v-html="DataStore.attributes_data?.signup_terms"
          ></div>
        </template>

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
            {{ $t("Submit") }}
          </div>
        </q-btn>
      </q-form>
      </section>
    </div>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useDataStore } from "stores/DataStore";
import { useClientStore } from "stores/ClientStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "SignupComplete",
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
      uuid: null,
    };
  },
  components: {
    CustomFields: defineAsyncComponent(() =>
      import("components/CustomFields.vue")
    ),
  },
  setup() {
    const DataStore = useDataStore();
    const ClientStore = useClientStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, ClientStore, DataStorePersisted };
  },
  computed: {
    FieldIcon() {
      return this.field_type === "password"
        ? "eva-eye-off-outline"
        : "eva-eye-outline";
    },
    FieldIcon1() {
      return this.field_type1 === "password"
        ? "eva-eye-off-outline"
        : "eva-eye-outline";
    },
  },
  mounted() {
    this.uuid = this.$route.query?.uuid || null;
    this.redirect = this.$route.query?.redirect || null;
  },
  methods: {
    async onSubmit() {
      try {
        this.loading = true;
        const params = {
          uuid: this.uuid,
          first_name: this.first_name,
          last_name: this.last_name,
          email_address: this.email_address,
          password: this.password,
          cpassword: this.cpassword,
          custom_fields: this.$refs.ref_customfields.custom_fields,
        };
        this.loading = true;
        const resp = await APIinterface.fetchDataPost("completeSignup", params);

        auth.setUser(resp.details.user_data);
        auth.setToken(resp.details.user_token);
        this.ClientStore.user_settings = resp.details.user_settings;

        const coordinates = this.DataStorePersisted.coordinates;
        const searchMode = this.DataStore.getSearchMode;
        const locationData = this.DataStorePersisted.getLocation;

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
