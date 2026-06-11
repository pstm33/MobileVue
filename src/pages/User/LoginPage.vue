<template>
  <q-header
    reveal-offset="1"
    reveal
    class="tagam-account-header"
  >
    <q-toolbar>
      <q-space></q-space>
      <q-btn flat round dense no-caps color="primary" @click="Skip" replace>
        <div class="text-subtitle2 text-weight-bold">
          {{ $t("Skip") }}
        </div>
      </q-btn>
    </q-toolbar>
  </q-header>
  <q-page padding class="tagam-login-page">
    <div class="flex flex-center absolute-center fit">
      <div class="tagam-login-panel text-center full-width q-pl-md q-pr-md">
        <q-responsive style="height: 180px">
          <q-img src="login-1.svg" fit="scale-down" loading="lazy">
            <template v-slot:loading>
              <div class="text-primary">
                <q-spinner-ios size="sm" />
              </div>
            </template>
          </q-img>
        </q-responsive>

        <div class="tagam-login-title text-h5 text-weight-bold">
          {{ $t("Let's Sign You In") }}
        </div>
        <div class="tagam-login-copy text-caption">
          {{ $t("Cravings don't wait. Sign in and satisfy them!") }}
        </div>
        <q-space class="q-pa-sm"></q-space>

        <q-btn
          :outline="$q.dark.mode ? false : true"
          color="mygrey"
          :style="$q.dark.mode ? '' : 'color: grey'"
          no-caps
          class="fit tagam-login-option"
          size="lg"
          :to="{
            path: '/user/login-email',
            query: { redirect: this.redirect },
          }"
        >
          <q-icon name="eva-email-outline" color="primary" size="sm"></q-icon>
          <div class="q-ml-sm text-weight-light text-subtitle2">
            {{ $t("Continue with email") }}
          </div>
        </q-btn>
        <q-space class="q-pa-sm"></q-space>

        <q-btn
          color="primary"
          no-caps
          class="fit tagam-login-option tagam-login-primary"
          unelevated
          size="lg"
          :to="{
            path: '/user/login-phone',
            query: { redirect: this.redirect },
          }"
        >
          <q-icon name="eva-smartphone-outline" size="sm"></q-icon>
          <div class="q-ml-sm text-weight-light text-subtitle2">
            {{ $t("Continue with Phone number") }}
          </div>
        </q-btn>

        <template v-if="isGuestEnabled">
          <q-space class="q-pa-sm"></q-space>
          <q-btn
            outline
            color="mygrey"
            style="color: #34c85a"
            no-caps
            class="fit tagam-login-option"
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
        <q-space class="q-pa-md"></q-space>
      </div>
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

<style lang="sass" scoped>
.tagam-login-page
  background: radial-gradient(circle at 50% 8%, rgba(255, 107, 53, 0.12), transparent 240px), linear-gradient(180deg, var(--tagam-bg-soft), var(--tagam-bg))

.tagam-login-panel
  max-width: 430px
  margin: auto

.tagam-login-title
  color: var(--tagam-text)
  font-weight: 900 !important

.tagam-login-copy
  color: var(--tagam-text-soft)
  margin-top: 4px

.tagam-login-option
  min-height: 52px
  border-radius: var(--tagam-radius-card) !important
  box-shadow: var(--tagam-shadow-soft)
  transition: transform 160ms ease, box-shadow 160ms ease

.tagam-login-option:hover
  transform: translateY(-1px)
  box-shadow: var(--tagam-shadow)

.tagam-login-primary
  box-shadow: 0 12px 28px rgba(255, 107, 53, 0.24)
</style>





