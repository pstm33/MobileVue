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
    cleanSocialValue(value) {
      return typeof value === "string" ? value.trim() : "";
    },
    decodeJwtPayload(token) {
      if (!token || typeof token !== "string" || !token.includes(".")) {
        return {};
      }

      try {
        const payload = token.split(".")[1];
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(
          normalized.length + ((4 - (normalized.length % 4)) % 4),
          "="
        );
        const decoded = atob(padded);
        return JSON.parse(
          decodeURIComponent(
            decoded
              .split("")
              .map(
                (char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`
              )
              .join("")
          )
        );
      } catch (error) {
        return {};
      }
    },
    splitName(name) {
      const parts = this.cleanSocialValue(name).split(/\s+/).filter(Boolean);
      return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" "),
      };
    },
    fallbackFirstName(email, provider) {
      const emailName = this.cleanSocialValue(email).split("@")[0];
      if (emailName) {
        return emailName.replace(/[._-]+/g, " ").trim() || emailName;
      }
      return provider === "apple"
        ? "Apple"
        : provider === "google"
        ? "Google"
        : "Social";
    },
    fallbackLastName(provider) {
      return provider === "apple"
        ? "Apple"
        : provider === "google"
        ? "Google"
        : "Facebook";
    },
    normalizeSocialParams(provider, token, profile = {}) {
      const cleanedToken = this.cleanSocialValue(token);
      const jwtPayload = this.decodeJwtPayload(cleanedToken);
      const email = this.cleanSocialValue(
        profile?.email || profile?.email_address || jwtPayload?.email
      );
      const displayName = this.splitName(profile?.name);
      const firstName = this.cleanSocialValue(
        profile?.given_name ||
          profile?.givenName ||
          profile?.first_name ||
          profile?.name?.firstName ||
          displayName.firstName
      );
      const lastName = this.cleanSocialValue(
        profile?.family_name ||
          profile?.familyName ||
          profile?.last_name ||
          profile?.name?.lastName ||
          displayName.lastName
      );
      const id = this.cleanSocialValue(
        profile?.sub || profile?.id || profile?.user || jwtPayload?.sub || email
      );

      if (!cleanedToken || !id) {
        throw new Error("Social login failed");
      }

      return {
        id,
        email_address: email,
        first_name: firstName || this.fallbackFirstName(email, provider),
        last_name: lastName || this.fallbackLastName(provider),
        social_strategy: provider,
        social_token: cleanedToken,
      };
    },
    async handleGoogle() {
      try {
        this.loading = true;
        const results = await this.socialAuth.loginWithGoogle();
        const accessToken = this.cleanSocialValue(results?.access_token);

        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const user = await userInfo.json();
        const params = this.normalizeSocialParams("google", accessToken, user);
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
        const accessToken = this.cleanSocialValue(auth?.accessToken);
        const res = await fetch(
          `https://graph.facebook.com/me?fields=id,name,first_name,last_name,email,picture&access_token=${accessToken}`
        );
        const user = await res.json();
        const params = this.normalizeSocialParams("facebook", accessToken, user);
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
        const idToken = this.cleanSocialValue(authorization?.id_token);
        const userInfo = authorization?.user
          ? JSON.parse(authorization.user)
          : {};
        const params = this.normalizeSocialParams("apple", idToken, userInfo);
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

