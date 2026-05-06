<template>
  <q-btn
    v-if="google_login_enabled"
    round
    padding="11px"
    :outline="$q.dark.mode ? false : true"
    color="mygrey"
    class="tagam-social-provider-btn"
    @click="handleGoogle"
    :loading="loading"
  >
    <q-avatar size="30px">
      <img src="google-icon-logo.svg" />
    </q-avatar>
  </q-btn>

  <q-btn
    v-if="fb_flag"
    round
    padding="11px"
    :outline="$q.dark.mode ? false : true"
    color="mygrey"
    class="tagam-social-provider-btn"
    @click="handleFacebook"
    :loading="loading"
  >
    <q-avatar size="32px">
      <img src="facebook-3-logo.svg" />
    </q-avatar>
  </q-btn>

  <q-btn
    v-if="app_enabled_apple_login"
    round
    padding="11px"
    :outline="$q.dark.mode ? false : true"
    color="mygrey"
    class="tagam-social-provider-btn"
    @click="handleAppleLogin"
    :loading="loading"
  >
    <q-avatar size="32px">
      <img src="apple-black-logo.svg" class="tagam-social-provider__apple" />
    </q-avatar>
  </q-btn>
</template>

<script>
import { useDataStore } from "src/stores/DataStore";
import { SocialLogin } from "@capgo/capacitor-social-login";
import APIinterface from "src/api/APIinterface";

export default {
  name: "SocialNativelogin",
  props: ["google_login_enabled", "fb_flag", "app_enabled_apple_login"],
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  async mounted() {
    if (this.google_login_enabled) {
      await SocialLogin.initialize({
        google: {
          webClientId: this.DataStore?.attributes_data?.app_google_client_id,
          iOSClientId: this.DataStore?.attributes_data?.app_apple_app_id,
          mode: "online",
        },
      });
    }

    if (this.fb_flag) {
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
    async handleGoogle() {
      try {
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

        let profile = results?.result?.profile;

        const params = {
          id: profile.id,
          email_address: profile.email,
          first_name: profile.givenName,
          last_name: profile.familyName,
          social_strategy: "google",
          social_token: results?.result?.accessToken?.token,
        };
        //alert("Login success: " + JSON.stringify(params));
        this.$emit("afterLogin", params);
      } catch (error) {
        //alert("Login error: " + JSON.stringify(error));
        APIinterface.ShowAlert(this.$t("Failed"), this.$q.capacitor, this.$q);
      } finally {
        //alert("Login process finished");
      }
    },
    async handleFacebook() {
      console.log("handleFacebook");
      try {
        const results = await SocialLogin.login({
          provider: "facebook",
          options: {
            permissions: ["email", "public_profile"],
            limitedLogin: false,
          },
        });
        //console.log("Facebook login result:", JSON.stringify(results));
        //alert("Facebook success: " + JSON.stringify(results));

        const token = results.result.accessToken.token;

        const response = await fetch(
          `https://graph.facebook.com/me?fields=id,name,first_name,last_name,email,picture&access_token=${token}`
        );
        const profile = await response.json();
        // alert(JSON.stringify(profile));
        // console.log("Facebook login result:", JSON.stringify(profile));

        const params = {
          id: profile.id,
          email_address: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          social_strategy: "facebook",
          social_token: token,
        };
        //alert(JSON.stringify(params));
        this.$emit("afterLogin", params);
      } catch (error) {
        APIinterface.ShowAlert(this.$t("Failed"), this.$q.capacitor, this.$q);
        // Handle error
      }
    },
    async handleAppleLogin() {
      try {
        console.log("handleAppleLogin");
        const results = await SocialLogin.login({
          provider: "apple",
          options: {
            scopes: ["email", "name"],
          },
        });
        const profile = results?.result?.profile || {};
        const params = {
          id: profile.user || "",
          email_address: profile.email || "",
          first_name: profile.givenName || "",
          last_name: profile.familyName || "",
          social_strategy: "apple",
          social_token: results?.result?.idToken || "",
        };
        this.$emit("afterLogin", params);
      } catch (error) {
        //alert("Login error: " + JSON.stringify(error));
        APIinterface.ShowAlert(this.$t("Failed"), this.$q.capacitor, this.$q);
      }
    },
  },
};
</script>

<style scoped>
.tagam-social-provider-btn {
  border: 1px solid rgba(113, 74, 24, 0.12);
  background: #ffffff;
}

:global(body.body--dark) .tagam-social-provider-btn {
  background: var(--tagam-surface-raised) !important;
  border-color: var(--tagam-stroke-strong) !important;
  color: var(--tagam-text) !important;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-social-provider__apple {
  filter: brightness(0) invert(1);
}
</style>
