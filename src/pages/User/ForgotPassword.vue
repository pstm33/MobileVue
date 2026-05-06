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
      </q-toolbar>
    </div>
  </q-header>
  <q-page class="tagam-page-shell q-px-md q-pb-xl">
    <div class="tagam-auth-shell q-pt-lg">
      <section class="tagam-section-shell text-center">
        <q-responsive style="height: 190px">
          <q-img src="forgot-password.svg" fit="scale-down" loading="lazy">
            <template v-slot:loading>
              <div class="text-primary">
                <q-spinner-ios size="sm" />
              </div>
            </template>
          </q-img>
        </q-responsive>

        <div class="tagam-section-heading tagam-section-heading--stacked q-mt-md q-mb-lg">
          <div>
            <div class="tagam-section-heading__title">
              {{ $t("Forgot Password?") }}
            </div>
          </div>
          <div class="tagam-section-heading__meta">
            {{ $t("Choose how you want to reset access to your account") }}
          </div>
        </div>

        <template v-if="DataStore.password_reset_options == 'sms'">
          <ForgotPasswordSMS
            :phone_default_data="DataStore.phone_default_data"
          />
        </template>
        <template
          v-else-if="DataStore.password_reset_options == 'both_sms_email'"
        >
          <ForgotPasswordBoth
            :phone_default_data="DataStore.phone_default_data"
          />
        </template>
        <template v-else>
          <ForgotPasswordEmail />
        </template>
      </section>
    </div>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "ForgotPassword",
  components: {
    ForgotPasswordSMS: defineAsyncComponent(() =>
      import("components/ForgotPasswordSMS.vue")
    ),
    ForgotPasswordEmail: defineAsyncComponent(() =>
      import("components/ForgotPasswordEmail.vue")
    ),
    ForgotPasswordBoth: defineAsyncComponent(() =>
      import("components/ForgotPasswordBoth.vue")
    ),
  },
  data() {
    return {
      page_ready: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
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
</style>
