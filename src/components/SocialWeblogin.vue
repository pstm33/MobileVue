<template>
  <div class="tagam-social-login-stack q-gutter-y-sm">
  <q-btn
    v-if="google_login_enabled"
    class="tagam-social-login-btn full-width"
    no-caps
    unelevated
    rounded
    color="white"
    text-color="dark"
    @click="handleGoogle"
    :loading="loading"
    :aria-label="$t('Continue with Google')"
  >
    <q-avatar size="20px" class="q-mr-sm">
      <img src="google-icon-logo.svg" />
    </q-avatar>
    <span class="text-weight-bold">{{ $t("Continue with Google") }}</span>
  </q-btn>

  <q-btn
    v-if="fb_flag"
    class="tagam-social-login-btn full-width"
    no-caps
    unelevated
    rounded
    color="white"
    text-color="dark"
    @click="handleFacebook"
    :loading="loading"
    :aria-label="$t('Continue with Facebook')"
  >
    <q-avatar size="22px" class="q-mr-sm">
      <img src="facebook-3-logo.svg" />
    </q-avatar>
    <span class="text-weight-bold">{{ $t("Continue with Facebook") }}</span>
  </q-btn>

  <q-btn
    v-if="app_enabled_apple_login"
    class="tagam-social-login-btn full-width"
    no-caps
    unelevated
    rounded
    color="white"
    text-color="dark"
    @click="handleAppleLogin"
    :loading="loading"
    :aria-label="$t('Continue with Apple')"
  >
    <q-avatar size="22px" class="q-mr-sm">
      <img src="apple-black-logo.svg" />
    </q-avatar>
    <span class="text-weight-bold">{{ $t("Continue with Apple") }}</span>
  </q-btn>
  </div>
</template>

<script>
import { useDataStore } from "src/stores/DataStore";
import { useSocialAuth } from "src/composables/useSocialAuth";
import APIinterface from "src/api/APIinterface";

export default {
  name: "SocialWeblogin",
  emits: ["afterLogin"],
  props: ["google_login_enabled", "fb_flag", "app_enabled_apple_login"],
  data() {
    return {
      loading: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    const socialAuth = useSocialAuth();
    return { DataStore, socialAuth };
  },
  methods: {
    async handleGoogle() {
      try {
        this.loading = true;
        const results = await this.socialAuth.loginWithGoogle();
        const accessToken = results.access_token;

        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const user = await userInfo.json();

        const params = {
          id: user.sub,
          email_address: user.email,
          first_name: user.given_name,
          last_name: user.family_name,
          social_strategy: "google",
          social_token: accessToken,
        };
        this.$emit("afterLogin", params);
      } catch (err) {
        console.error("Google login failed:", err);
        this.showSocialError(err);
      } finally {
        this.loading = false;
      }
    },
    async handleFacebook() {
      try {
        this.loading = true;
        const auth = await this.socialAuth.loginWithFacebook();
        const accessToken = auth.accessToken;
        const res = await fetch(
          `https://graph.facebook.com/me?fields=id,name,first_name,last_name,email,picture&access_token=${accessToken}`
        );
        const user = await res.json();

        const params = {
          id: user.id,
          email_address: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          social_strategy: "facebook",
          social_token: accessToken,
        };
        this.$emit("afterLogin", params);
      } catch (err) {
        console.error("Facebook login failed:", err);
        this.showSocialError(err);
      } finally {
        this.loading = false;
      }
    },
    async handleAppleLogin() {
      try {
        this.loading = true;
        const authorization = await this.socialAuth.loginWithApple();
        const idToken = authorization.id_token;
        const userInfo = authorization.user
          ? JSON.parse(authorization.user)
          : null;
        const decodedPayload = JSON.parse(
          atob(idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );
        const params = {
          id: decodedPayload.sub,
          email_address: decodedPayload.email,
          first_name: userInfo?.name?.firstName ?? "",
          last_name: userInfo?.name?.lastName ?? "",
          social_strategy: "apple",
          social_token: idToken,
        };
        this.$emit("afterLogin", params);
      } catch (err) {
        console.error("Apple login failed:", err);
        this.showSocialError(err);
      } finally {
        this.loading = false;
      }
    },
    showSocialError(error) {
      const message = error?.message || error?.error || this.$t("Social login failed");
      APIinterface.notify("dark", this.$t(message), "error_outline", this.$q);
    },
  },
};
</script>

<style scoped>
.tagam-social-login-stack {
  width: min(100%, 360px);
  margin: 0 auto;
}

.tagam-social-login-btn {
  min-height: 50px;
  border: 1px solid var(--tagam-border-soft);
  background: var(--tagam-surface) !important;
  box-shadow: var(--tagam-shadow-soft);
}

body.body--dark .tagam-social-login-btn {
  color: var(--tagam-text) !important;
}
</style>


