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
    <q-avatar size="20px">
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
    <q-avatar size="22px">
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
    <q-avatar size="22px">
      <img src="apple-black-logo.svg" class="tagam-social-provider__apple" />
    </q-avatar>
  </q-btn>
</template>

<script>
import { useDataStore } from "src/stores/DataStore";
import { useSocialAuth } from "src/composables/useSocialAuth";
const { loginWithGoogle, loginWithFacebook, loginWithApple } = useSocialAuth();

export default {
  name: "SocialWeblogin",
  props: ["google_login_enabled", "fb_flag", "app_enabled_apple_login"],
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  methods: {
    async handleGoogle() {
      try {
        const results = await loginWithGoogle();
        const accessToken = results.access_token;
        console.log("accessToken", accessToken);

        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const user = await userInfo.json();
        console.log("User:", user);

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
      }
    },
    async handleFacebook() {
      try {
        const auth = await loginWithFacebook();
        const accessToken = auth.accessToken;
        console.log("accessToken", accessToken);
        const res = await fetch(
          `https://graph.facebook.com/me?fields=id,name,first_name,last_name,email,picture&access_token=${accessToken}`
        );
        const user = await res.json();
        console.log("User:", user);

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
      }
    },
    async handleAppleLogin() {
      console.log("handleAppleLogin");
      return new Promise((resolve, reject) => {
        const redirectUri =
          this.DataStore?.attributes_data?.apple_web_redirect_uri;
        const clientId = this.DataStore?.attributes_data?.app_apple_app_id;
        const scope = "name email";
        const state = Math.random().toString(36).substring(2);

        const url = `https://appleid.apple.com/auth/authorize?response_type=code id_token&client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scope=${encodeURIComponent(
          scope
        )}&state=${state}&response_mode=form_post`;

        const authWindow = window.open(
          url,
          "AppleLogin",
          "width=600,height=700"
        );

        const handleMessage = (event) => {
          console.log("data", event.data);
          if (!event.data?.payload) {
            return;
          }
          const { id_token, code, user } = event.data?.payload;

          if (event.data?.source === "apple-login") {
            window.removeEventListener("message", handleMessage);
            authWindow?.close();

            console.log("id_token", id_token);
            console.log("code", code);

            let userInfo = null;
            if (user) {
              userInfo = JSON.parse(user);
            }
            console.log("userInfo", userInfo);

            const decodedPayload = JSON.parse(atob(id_token.split(".")[1]));
            console.log("Decoded payload:", decodedPayload);

            const params = {
              id: decodedPayload.sub,
              email_address: decodedPayload.email,
              first_name: userInfo?.name?.firstName ?? "",
              last_name: userInfo?.name?.lastName ?? "",
              social_strategy: "apple",
              social_token: id_token,
            };
            console.log("params", params);
            this.$emit("afterLogin", params);

            resolve(event.data.payload);
          }
        };

        window.addEventListener("message", handleMessage);
      });
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
