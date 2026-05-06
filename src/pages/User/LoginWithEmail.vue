<template>
  <q-header reveal reveal-offset="1" class="bg-transparent q-pa-sm">
    <div class="tagam-account-header-shell">
      <q-toolbar class="q-px-xs">
        <q-btn
          @click="$router.back()"
          flat
          round
          dense
          icon="las la-angle-left"
          class="q-mr-sm"
          :color="$q.dark.mode ? 'white' : 'dark'"
        />
        <q-space />
        <q-btn flat round dense no-caps color="primary" @click="Skip" replace>
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Skip") }}
          </div>
        </q-btn>
      </q-toolbar>
    </div>
  </q-header>
  <q-page class="tagam-page-shell q-px-md q-pb-xl">
    <div class="tagam-auth-shell q-pt-lg">
      <section class="tagam-section-shell text-center">
        <q-responsive style="height: 190px">
          <q-img src="login-2.svg" fit="scale-down" loading="lazy">
            <template v-slot:loading>
              <div class="text-primary">
                <q-spinner-ios size="sm" />
              </div>
            </template>
          </q-img>
        </q-responsive>

        <div class="tagam-section-heading tagam-section-heading--stacked q-mt-md">
          <div>
            <div class="tagam-section-heading__title">
              {{ $t("Login to your account") }}
            </div>
          </div>
          <div class="tagam-section-heading__meta">
            {{
              $t(
                "Log in to satisfy your cravings of delicious food with your quick delivery!"
              )
            }}
          </div>
        </div>

        <q-form @submit="onSubmit" class="q-gutter-y-md q-mt-lg">
          <q-input
            v-model="email_address"
            outlined
            bg-color="white"
            :label="$t('Email address')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
            <template v-slot:prepend>
              <q-icon color="primary" name="eva-email-outline" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :type="field_type"
            outlined
            bg-color="white"
            :label="$t('Password')"
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
            class="fit"
            type="submit"
            rounded
            :loading="loading"
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Sign In") }}
            </div>
          </q-btn>
        </q-form>

        <div class="q-mt-xl">
          <SocialLogin :redirect="redirect" />
        </div>

        <div class="flex justify-center q-gutter-x-sm q-mt-lg">
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
      </section>
    </div>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useClientStore } from "stores/ClientStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "stores/DataStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "LoginWithEmail",
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
      email_address: "",
      password: "",
      redirect: null,
    };
  },
  mounted() {
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
        const resp = await APIinterface.userLogin({
          username: this.email_address,
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
