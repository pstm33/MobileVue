<template>
  <q-header reveal reveal-offset="1" class="bg-transparent q-pa-sm">
    <div class="tagam-account-header-shell">
      <q-toolbar class="q-px-xs">
        <q-btn
          v-if="!success"
          @click="$router.back()"
          flat
          round
          dense
          icon="las la-angle-left"
          class="q-mr-sm"
          :color="$q.dark.mode ? 'white' : 'dark'"
        />
      </q-toolbar>
    </div>
  </q-header>
  <q-page class="tagam-page-shell q-px-md q-pb-xl" :class="{ 'flex flex-center text-center': success }">
    <div class="tagam-auth-shell q-pt-lg full-width">
      <section class="tagam-section-shell">
        <template v-if="!success">
          <div class="tagam-section-heading tagam-section-heading--stacked q-mb-lg">
            <div>
              <div class="tagam-section-heading__title">
                {{ $t("Create new password") }}
              </div>
            </div>
            <div class="tagam-section-heading__meta">
              {{ $t("Please enter a new password for your account.") }}
            </div>
          </div>

          <q-form @submit="onSubmit" class="q-gutter-y-md">
            <PasswordFields v-model:password="password" />

            <PasswordFields v-model:password="cpassword" />

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
                {{ $t("Reset Password") }}
              </div>
            </q-btn>
          </q-form>
        </template>
        <template v-else>
          <div class="text-center">
            <svg
              class="checkmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                class="checkmark__circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                class="checkmark__check"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>

            <div class="text-weight-bold text-subtitle1 q-mt-md">
              {{ $t("Password Updated") }}
            </div>

            <div class="tagam-page-copy q-mt-sm">
              {{ $t("password_change") }}
            </div>

            <q-btn
              no-caps
              unelevated
              color="primary"
              text-color="white"
              size="lg"
              class="fit q-mt-lg"
              type="submit"
              rounded
              to="/user/login"
            >
              <div class="text-subtitle2 text-weight-bold">
                {{ $t("Done") }}
              </div>
            </q-btn>
          </div>
        </template>
      </section>
    </div>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "ResetPassword",
  components: {
    PasswordFields: defineAsyncComponent(() =>
      import("components/PasswordFields.vue")
    ),
  },
  data() {
    return {
      loading: false,
      password: "",
      cpassword: "",
      uuid: "",
      message: "",
      success: false,
    };
  },
  mounted() {
    this.uuid = this.$route.query.uuid;
  },
  methods: {
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "resetPassword",
        "uuid=" +
          this.uuid +
          "&password=" +
          this.password +
          "&cpassword=" +
          this.cpassword
      )
        .then((data) => {
          this.success = true;
          this.message = data.msg;
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
:global(body.body--dark) .tagam-page-shell .text-subtitle1,
:global(body.body--dark) .tagam-page-shell .text-subtitle2,
:global(body.body--dark) .tagam-page-shell .text-weight-bold {
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-page-copy,
:global(body.body--dark) .tagam-section-heading__meta,
:global(body.body--dark) .tagam-page-shell .text-grey,
:global(body.body--dark) .tagam-page-shell .text-caption,
:global(body.body--dark) .tagam-page-shell .text-body2 {
  color: var(--tagam-text-muted) !important;
}
</style>
