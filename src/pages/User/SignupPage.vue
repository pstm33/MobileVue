<template>
  <q-page class="tagam-page-shell q-px-md q-pb-xl">
    <q-page-sticky
      position="top"
      expand
      :offset="[0, 0]"
      class="tagam-signup-sticky-shell"
    >
      <TagamTopHeader
        :cart-count="CartStore.getCartCount"
        :sticky="false"
        class="tagam-signup-sticky-header"
      />
    </q-page-sticky>

    <div class="tagam-signup-sticky-spacer"></div>

    <div class="tagam-auth-shell q-pt-lg">
      <section class="tagam-section-shell">
        <div class="text-center q-mb-lg">
          <div class="tagam-section-heading__title">{{ $t("Create Account") }}</div>
          <div class="tagam-section-heading__meta line-normal">
            {{ $t("Enter your name, email and password for signup") }}.
          </div>
        </div>

        <q-form @submit="onSubmit" class="q-gutter-y-md">
          <q-input
            v-model="first_name"
            :label="$t('First name')"
            outlined
            lazy-rules
            bg-color="white"
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
            bg-color="white"
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
            bg-color="white"
            :rules="[(val) => /.+@.+\..+/.test(val) || $t('Invalid email')]"
          />

          <q-input
            v-model="mobile_number"
            mask="##############"
            outlined
            lazy-rules
            bg-color="white"
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

          <q-input
            v-model="password"
            :type="field_type"
            :label="$t('Password')"
            outlined
            lazy-rules
            bg-color="white"
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
            bg-color="white"
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
            class="tagam-page-copy q-mb-md"
            v-html="DataStore.attributes_data?.signup_terms"
          ></div>
        </template>

        <q-btn
          no-caps
          unelevated
          color="primary"
          text-color="white"
          size="lg"
          class="fit"
          type="submit"
          rounded
          :loading="loading"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Sign Up") }}
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
import { useCartStore } from "stores/CartStore";

export default {
  name: "SignupPage",
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
      redirect: null,
    };
  },
  components: {
    CustomFields: defineAsyncComponent(() =>
      import("components/CustomFields.vue")
    ),
    TagamTopHeader: defineAsyncComponent(() =>
      import("components/TagamTopHeader.vue")
    ),
  },
  setup() {
    const DataStore = useDataStore();
    const ClientStore = useClientStore();
    const DataStorePersisted = useDataStorePersisted();
    const CartStore = useCartStore();
    return { DataStore, ClientStore, DataStorePersisted, CartStore };
  },
  mounted() {
    this.mobile_prefix = this.DataStore.phone_default_data?.phonecode || null;
    this.redirect = this.$route.query?.redirect || null;
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
        custom_fields: this.$refs.ref_customfields.custom_fields,
      };
      this.loading = true;
      APIinterface.registerUser($data)
        .then((data) => {
          if (data.details.verify) {
            this.$router.push({
              path: "/user/verify-otp",
              query: {
                uuid: data.details.uuid,
                msg: data.msg,
                action: "completeSignupWithCode",
                validation_type: "email",
                redirect: this.redirect ?? "",
              },
            });
          } else {
            auth.setUser(data.details.user_data);
            auth.setToken(data.details.user_token);
            this.ClientStore.user_settings = data.details.user_settings;

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

.tagam-signup-sticky-shell {
  z-index: 150;
}

.tagam-signup-sticky-header {
  width: 100%;
  background: #ffffff;
}

.tagam-signup-sticky-spacer {
  height: 46px;
}

.tagam-auth-shell {
  padding-top: 8px !important;
}

.tagam-section-shell {
  background: #ffffff;
  border-radius: 28px;
  border: 1px solid rgba(113, 74, 24, 0.08);
  box-shadow: none;
}

.tagam-section-shell :deep(.q-field__control) {
  min-height: 56px;
  border-radius: 22px !important;
  background: #f7f7f7 !important;
  box-shadow: none !important;
}

.tagam-section-shell :deep(.q-field--outlined .q-field__control:before),
.tagam-section-shell :deep(.q-field--outlined .q-field__control:after) {
  border-color: transparent !important;
}

:global(body.body--dark) .tagam-page-shell {
  background:
    radial-gradient(circle at top, rgba(217, 107, 29, 0.18), transparent 28%),
    linear-gradient(180deg, var(--tagam-bg-strong) 0%, var(--tagam-bg) 100%) !important;
}

:global(body.body--dark) .tagam-signup-sticky-header {
  background: rgba(23, 19, 17, 0.94);
  border-bottom: 1px solid var(--tagam-stroke);
  backdrop-filter: blur(18px);
}

:global(body.body--dark) .tagam-section-shell {
  background: var(--tagam-surface);
  border-color: var(--tagam-stroke);
  box-shadow: var(--tagam-shadow);
}

:global(body.body--dark) .tagam-section-heading__title,
:global(body.body--dark) .tagam-section-shell .text-subtitle2,
:global(body.body--dark) .tagam-section-shell .text-weight-bold {
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-section-heading__meta,
:global(body.body--dark) .tagam-section-shell .text-grey,
:global(body.body--dark) .tagam-section-shell .text-caption,
:global(body.body--dark) .tagam-section-shell .text-body2 {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-section-shell :deep(.q-field__control) {
  background: var(--tagam-surface-raised) !important;
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-section-shell :deep(.q-field__native),
:global(body.body--dark) .tagam-section-shell :deep(.q-field__label),
:global(body.body--dark) .tagam-section-shell :deep(.q-field__input) {
  color: var(--tagam-text-soft) !important;
}
</style>
