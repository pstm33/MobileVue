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
      v-if="fb_flag && !isIOS"
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
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";

export default {
  name: "SocialNativelogin",
  emits: ["afterLogin"],
  props: ["google_login_enabled", "fb_flag", "app_enabled_apple_login"],
  data() {
    return {
      loading: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  async mounted() {
    if (this.google_login_enabled) {
      const googleClientId =
        Capacitor.getPlatform() === "android" &&
        config.google_android_web_client_id
          ? config.google_android_web_client_id
          : this.DataStore?.attributes_data?.app_google_client_id;
      const googleOptions = {
        webClientId: googleClientId,
        mode: "online",
      };
      if (this.DataStore?.attributes_data?.app_google_ios_client_id) {
        googleOptions.iOSClientId =
          this.DataStore.attributes_data.app_google_ios_client_id;
      }
      await SocialLogin.initialize({
        google: googleOptions,
      });
    }

    if (this.fb_flag && !this.isIOS) {
      await SocialLogin.initialize({
        facebook: {
          appId: this.DataStore?.attributes_data?.app_facebook_id,
          clientToken:
            this.DataStore?.attributes_data?.app_facebook_client_token,
        },
      });
    }

    if (this.app_enabled_apple_login) {
      await SocialLogin.initialize({
        apple: {
          clientId: this.DataStore?.attributes_data?.app_apple_app_id,
          redirectUrl: this.DataStore?.attributes_data?.apple_app_redirect_uri,
        },
      });
    }
  },
  methods: {
    cleanSocialValue(value) {
      return typeof value === "string" ? value.trim() : "";
    },
    getTokenFromResult(result, provider) {
      const accessToken = result?.accessToken;
      const accessTokenValue =
        typeof accessToken === "string" ? accessToken : accessToken?.token;

      if (provider === "apple") {
        return this.cleanSocialValue(
          accessTokenValue || result?.identityToken || result?.idToken,
        );
      }

      return this.cleanSocialValue(
        accessTokenValue || result?.idToken || result?.serverAuthCode,
      );
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
          "=",
        );
        const decoded = atob(padded);
        return JSON.parse(
          decodeURIComponent(
            decoded
              .split("")
              .map(
                (char) =>
                  `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`,
              )
              .join(""),
          ),
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
    normalizeSocialParams(provider, results, profileOverride = null) {
      const result = results?.result || {};
      const profile = profileOverride || result?.profile || {};
      const token = this.getTokenFromResult(result, provider);
      const jwtPayload = this.decodeJwtPayload(token);
      const email = this.cleanSocialValue(
        profile?.email || profile?.email_address || jwtPayload?.email,
      );
      const displayName = this.splitName(profile?.name);
      const firstName = this.cleanSocialValue(
        profile?.givenName || profile?.first_name || displayName.firstName,
      );
      const lastName = this.cleanSocialValue(
        profile?.familyName || profile?.last_name || displayName.lastName,
      );
      const id = this.cleanSocialValue(
        profile?.id ||
          profile?.user ||
          profile?.userID ||
          result?.accessToken?.userId ||
          jwtPayload?.sub ||
          email,
      );

      if (!token || !id) {
        throw new Error("Social login failed");
      }

      return {
        id,
        email_address: email,
        first_name: firstName || this.fallbackFirstName(email, provider),
        last_name: lastName || this.fallbackLastName(provider),
        social_strategy: provider,
        social_token: token,
      };
    },
    async handleGoogle() {
      try {
        this.loading = true;
        const results = await SocialLogin.login({
          provider: "google",
          options: {
            scopes: ["email", "profile"],
            forceRefreshToken: true,
          },
        });
        //alert("Login success: " + JSON.stringify(results));
        //console.log("Login success", JSON.stringify(results));
        //alert(results?.result?.profile?.familyName);

        const params = this.normalizeSocialParams("google", results);
        //alert("Login success: " + JSON.stringify(params));
        this.$emit("afterLogin", params);
      } catch (error) {
        //alert("Login error: " + JSON.stringify(error));
        this.showSocialError(error);
      } finally {
        //alert("Login process finished");
        this.loading = false;
      }
    },
    async handleFacebook() {
      try {
        this.loading = true;
        const results = await SocialLogin.login({
          provider: "facebook",
          options: {
            permissions: ["email", "public_profile"],
            limitedLogin: false,
          },
        });
        //console.log("Facebook login result:", JSON.stringify(results));
        //alert("Facebook success: " + JSON.stringify(results));

        const token = this.getTokenFromResult(results?.result, "facebook");
        if (!token) {
          throw new Error("Social login failed");
        }

        const response = await fetch(
          `https://graph.facebook.com/me?fields=id,name,first_name,last_name,email,picture&access_token=${token}`,
        );
        const profile = await response.json();
        // alert(JSON.stringify(profile));
        // console.log("Facebook login result:", JSON.stringify(profile));

        const params = this.normalizeSocialParams("facebook", results, profile);
        //alert(JSON.stringify(params));
        this.$emit("afterLogin", params);
      } catch (error) {
        this.showSocialError(error);
        // Handle error
      } finally {
        this.loading = false;
      }
    },
    async handleAppleLogin() {
      try {
        this.loading = true;
        const results = await SocialLogin.login({
          provider: "apple",
          options: {
            scopes: ["email", "name"],
          },
        });
        //alert("Apple success: " + JSON.stringify(results));
        const params = this.normalizeSocialParams("apple", results);
        this.$emit("afterLogin", params);
      } catch (error) {
        //alert("Login error: " + JSON.stringify(error));
        this.showSocialError(error);
      } finally {
        this.loading = false;
      }
    },
    showSocialError(error) {
      const message =
        error?.message || error?.error || this.$t("Social login failed");
      APIinterface.notify("dark", this.$t(message), "error_outline", this.$q);
    },
  },
  computed: {
    isIOS() {
      return Capacitor.getPlatform() === "ios";
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
