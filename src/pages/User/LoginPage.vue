<template>
  <q-header reveal reveal-offset="1" class="bg-transparent q-pa-sm">
    <div class="tagam-account-header-shell">
      <q-toolbar class="q-px-xs">
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
          <q-img src="login-1.svg" fit="scale-down" loading="lazy">
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
              {{ $t("Let's Sign You In") }}
            </div>
          </div>
          <div class="tagam-section-heading__meta">
            {{ $t("Cravings don't wait. Sign in and satisfy them!") }}
          </div>
        </div>

        <div class="q-gutter-y-sm q-mt-lg">
          <q-btn
            outline
            color="mygrey"
            :style="$q.dark.mode ? '' : 'color: grey'"
            no-caps
            class="fit"
            size="lg"
            rounded
            :to="{
              path: '/user/login-email',
              query: { redirect: this.redirect },
            }"
          >
            <q-icon name="eva-email-outline" color="primary" size="sm" />
            <div class="q-ml-sm text-weight-light text-subtitle2">
              {{ $t("Continue with email") }}
            </div>
          </q-btn>

          <q-btn
            color="primary"
            no-caps
            class="fit"
            unelevated
            size="lg"
            rounded
            :to="{
              path: '/user/login-phone',
              query: { redirect: this.redirect },
            }"
          >
            <q-icon name="eva-smartphone-outline" size="sm" />
            <div class="q-ml-sm text-weight-light text-subtitle2">
              {{ $t("Continue with Phone number") }}
            </div>
          </q-btn>

          <template v-if="isGuestEnabled">
            <q-btn
              outline
              color="mygrey"
              style="color: #34c85a"
              no-caps
              class="fit"
              size="lg"
              rounded
              :to="{
                path: '/user/guest',
                query: { redirect: this.redirect },
              }"
            >
              <q-icon
                name="eva-person-outline"
                color="secondary"
                size="sm"
              />
              <div class="q-ml-sm text-weight-light text-subtitle2">
                {{ $t("Continue as Guest") }}
              </div>
            </q-btn>
          </template>
        </div>

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
              :to="
                redirect ? `/user/signup?redirect=${redirect}` : '/user/signup'
              "
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
import { defineAsyncComponent } from "vue";
import { useDataStore } from "stores/DataStore";

export default {
  name: "LoginPage",
  data() {
    return {
      redirect: null,
    };
  },
  components: {
    SocialLogin: defineAsyncComponent(() =>
      import("components/SocialLogin.vue")
    ),
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  mounted() {
    this.redirect = this.$route.query?.redirect || null;
  },
  computed: {
    isGuestEnabled() {
      return this.DataStore.attributes_data?.enabled_guest || false;
    },
  },
  methods: {
    Skip() {
      if (this.redirect) {
        this.$router.back();
      } else {
        this.$router.push("/home");
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
:global(body.body--dark) .tagam-page-shell .text-weight-bold,
:global(body.body--dark) .tagam-page-shell .text-subtitle2 {
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-section-heading__meta,
:global(body.body--dark) .tagam-page-shell .text-grey,
:global(body.body--dark) .tagam-page-shell .text-grey-7,
:global(body.body--dark) .tagam-page-shell .text-caption,
:global(body.body--dark) .tagam-page-shell .text-body2 {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-page-shell .q-btn[outline],
:global(body.body--dark) .tagam-page-shell .q-btn.bg-mygrey,
:global(body.body--dark) .tagam-page-shell .q-btn.text-mygrey {
  background: var(--tagam-surface-raised);
  border-color: var(--tagam-stroke-strong);
  color: var(--tagam-text-soft);
}
</style>
