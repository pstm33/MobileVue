import { defineStore } from "pinia";
import { Capacitor } from "@capacitor/core";
import APIinterface from "src/api/APIinterface";
import { LocalStorage } from "src/services/storage";

const androidGoogleWebClientId =
  import.meta.env.VITE_ANDROID_GOOGLE_WEB_CLIENT_ID ||
  "85413186790-0o8kcqikbiph15vhqii0q46gja3u8rcd.apps.googleusercontent.com";

export const useAppSettingsStore = defineStore("appSettings", {
  state: () => ({
    loading: false,
    loaded: false,
    error: "",
    data: null,
  }),
  getters: {
    social: (state) => {
      const kmrsGoogleClientId = state.data?.app_google_client_id || "";
      const useAndroidGoogleClient = Capacitor.getPlatform() === "android";

      return {
        google: Boolean(state.data?.app_enabled_google_login),
        facebook: Boolean(state.data?.app_enabled_fb_login),
        apple: Boolean(state.data?.app_enabled_apple_login),
        googleClientId: useAndroidGoogleClient ? androidGoogleWebClientId : kmrsGoogleClientId,
        googleKmrsClientId: kmrsGoogleClientId,
        googleAndroidClientId: androidGoogleWebClientId,
        googleUsesAndroidClient: useAndroidGoogleClient,
        facebookAppId: state.data?.app_facebook_id || "",
        facebookClientToken: state.data?.app_facebook_client_token || "",
        appleClientId: state.data?.app_apple_app_id || "",
        appleRedirectUrl: state.data?.apple_app_redirect_uri || state.data?.apple_web_redirect_uri || "",
      };
    },
    hasSocialLogin() {
      return this.social.google || this.social.facebook || this.social.apple;
    },
  },
  actions: {
    async load() {
      if (this.loaded || this.loading) return this.data;

      this.loading = true;
      this.error = "";
      try {
        const response = await APIinterface.fetchDataPost("getAttributes", `currency_code=${LocalStorage.getItem("currency_code") || "TMT"}`);
        this.data = response.details?.data ?? response.details ?? null;
        this.loaded = true;
        return this.data;
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
