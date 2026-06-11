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
      <q-space></q-space>
      <q-btn flat round dense no-caps color="primary" @click="Skip">
        <div class="text-subtitle2 text-weight-bold">
          {{ $t("Skip") }}
        </div>
      </q-btn>
    </q-toolbar>
  </q-header>
  <q-page padding class="tagam-user-login-with-phone-page">
    <div class="flex flex-center absolute-center fit">
      <div class="text-center full-width q-pl-md q-pr-md">
        <q-responsive style="height: 190px">
          <q-img src="login-2.svg" fit="scale-down" loading="lazy">
            <template v-slot:loading>
              <div class="text-primary">
                <q-spinner-ios size="sm" />
              </div>
            </template>
          </q-img>
        </q-responsive>

        <div class="text-h6 text-weight-bold">
          {{ $t("Login to your account") }}
        </div>
        <div class="text-caption line-normal" style="width: 70%; margin: auto">
          {{
            $t(
              "Log in to satisfy your cravings of delicious food with your quick delivery!"
            )
          }}
        </div>
        <q-space class="q-pa-sm"></q-space>

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

          <q-input
            v-model="password"
            :type="field_type"
            borderless
            :placeholder="$t('Password')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
            <template v-slot:prepend>
              <q-icon color="primary" name="key" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="
                  field_type == 'password'
                    ? 'eva-eye-off-outline'
                    : 'eva-eye-outline'
                "
                color="blue-grey-6"
                class="q-mr-md cursor-pointer"
                @click="
                  field_type = field_type == 'password' ? 'text' : 'password'
                "
              />
            </template>
          </q-input>

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
                {{ $t("Forgot Password?") }}
              </div>
            </q-btn>
          </div>

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
              {{ $t("Sign In") }}
            </div>
          </q-btn>
        </q-form>

        <q-space class="q-pa-md"></q-space>
        <SocialLogin :redirect="redirect"></SocialLogin>

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
                {{ $t("Sign Up") }}
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
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useClientStore } from "stores/ClientStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "stores/DataStore";

export default {
  name: "LoginPage",
  components: {
    SocialLogin: defineAsyncComponent(() =>
      import("components/SocialLogin.vue")
    ),
  },
  setup() {
    const ClientStore = useClientStore();
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    return { ClientStore, DataStorePersisted, DataStore };
  },
  data() {
    return {
      loading: false,
      field_type: "password",
      mobile_number: "",
      mobile_prefix: "",
      password: "",
      redirect: null,
    };
  },
  mounted() {
    this.mobile_prefix = this.DataStore.phone_default_data?.phonecode || null;
    this.redirect = this.$route.query?.redirect || null;
  },
  methods: {
    Skip() {
      if (this.redirect) {
        this.$router.back();
      } else {
        this.$router.push("/home");
      }
    },
    async onSubmit() {
      try {
        this.loading = true;
        const resp = await APIinterface.fetchData("userLoginPhone", {
          mobile_prefix: this.mobile_prefix,
          mobile_number: this.mobile_number,
          password: this.password,
        });

        auth.setUser(resp.details.user_data);
        auth.setToken(resp.details.user_token);
        this.ClientStore.user_settings = resp.details.user_settings;

        const searchMode = this.DataStore.getSearchMode;
        if (searchMode == "location") {
          const locationData = this.DataStorePersisted.getLocation;
          if (!locationData) {
            this.$router.push("/location/add-location");
            return;
          }
        } else {
          const coordinates = this.DataStorePersisted.coordinates;
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






