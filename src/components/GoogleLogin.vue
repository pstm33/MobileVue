<template>
  <q-btn
    round
    padding="11px"
    :outline="$q.dark.mode ? false : true"
    color="mygrey"
    class="tagam-social-provider-btn"
    @click="Signin"
    :loading="loading"
  >
    <q-avatar size="20px">
      <img src="google-icon-logo.svg" />
    </q-avatar>
  </q-btn>
</template>

<script>
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import APIinterface from "src/api/APIinterface";

export default {
  name: "GoogleLogin",
  props: ["client_id"],
  data() {
    return {
      loading: false,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      //if (this.$q.platform.is.desktop) {
      if (!this.$q.capacitor) {
        GoogleAuth.initialize({
          clientId: this.client_id,
          scopes: ["profile", "email"],
          grantOfflineAccess: true,
        });
      } else {
        GoogleAuth.initialize();
      }
    },
    Signin() {
      this.loading = true;
      GoogleAuth.signIn()
        .then((data) => {
          const $params = {
            id: data.id,
            email_address: data.email,
            first_name: data.givenName,
            last_name: data.familyName,
            social_strategy: "google",
            social_token: data.authentication.idToken,
          };
          this.$emit("afterLogin", $params);
        })
        .catch((error) => {
          if (error?.error == "popup_closed_by_user") {
            return;
          }
          if (error.code == 10) {
            APIinterface.ShowAlert(
              this.$t("Error app is not signin"),
              this.$q.capacitor,
              this.$q
            );
          } else if (error.code == -5) {
            //
          } else {
            APIinterface.ShowAlert(
              JSON.stringify(error),
              this.$q.capacitor,
              this.$q
            );
          }
        })
        .then((data) => {
          this.loading = false;
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
</style>
