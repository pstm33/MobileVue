<template>
  <template v-if="hasSocialLogin">
    <div class="separator">
      <div class="line"></div>
      <span class="text">{{ $t("or") }}</span>
      <div class="line"></div>
    </div>
    <q-space class="q-pa-sm"></q-space>

    <div class="q-gutter-x-md">
      <template v-if="$q.capacitor">
        <SocialNativelogin
          :google_login_enabled="
            DataStore?.attributes_data?.app_enabled_google_login
          "
          :fb_flag="DataStore?.attributes_data?.app_enabled_fb_login"
          :app_enabled_apple_login="
            DataStore?.attributes_data?.app_enabled_apple_login
          "
          @after-login="afterLogin"
        >
        </SocialNativelogin>
      </template>
      <template v-else>
        <SocialWeblogin
          :google_login_enabled="
            DataStore?.attributes_data?.app_enabled_google_login
          "
          :fb_flag="DataStore?.attributes_data?.app_enabled_fb_login"
          :app_enabled_apple_login="
            DataStore?.attributes_data?.app_enabled_apple_login
          "
          @after-login="afterLogin"
        ></SocialWeblogin>
      </template>
    </div>
  </template>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStore } from "stores/DataStore";
import { useClientStore } from "stores/ClientStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

export default {
  name: "SocialLogin",
  props: ["redirect"],
  components: {
    SocialWeblogin: defineAsyncComponent(() =>
      import("components/SocialWeblogin.vue")
    ),
    SocialNativelogin: defineAsyncComponent(() =>
      import("components/SocialNativelogin.vue")
    ),
  },
  data() {
    return {};
  },
  setup() {
    const DataStore = useDataStore();
    const ClientStore = useClientStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, ClientStore, DataStorePersisted };
  },
  computed: {
    hasSocialLogin() {
      return (
        this.DataStore.attributes_data?.app_enabled_google_login ||
        this.DataStore.attributes_data?.app_enabled_fb_login ||
        this.DataStore.attributes_data?.app_enabled_apple_login
      );
    },
  },
  methods: {
    async afterLogin(data) {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const response = await APIinterface.fetchData("SocialRegister", data);
        console.log("response", response);
        const isLogin = response?.details?.is_login ?? false;
        const verificationNeeded = response?.details?.verify ?? false;
        console.log("isLogin", isLogin);
        console.log("verificationNeeded", verificationNeeded);

        if (verificationNeeded) {
          this.$router.push({
            path: "/user/verify-otp",
            query: {
              uuid: response.details.uuid,
              msg: response.msg,
              action: "verifiySocialSignup",
              validation_type: "email",
            },
          });
          return;
        }

        if (!isLogin) {
          this.$router.push({
            path: "/account/complete-registration",
            query: { uuid: response.details.uuid },
          });
          return;
        }

        // USE SET DATA
        auth.setUser(response.details.user_data);
        auth.setToken(response.details.user_token);
        this.ClientStore.user_settings = response.details.user_settings;

        const coordinates = this.DataStorePersisted.coordinates;
        const searchMode = this.DataStore.getSearchMode;
        const locationData = this.DataStorePersisted.getLocation;

        if (searchMode == "location") {
          if (!locationData) {
            this.$router.push("/location/add-location");
            return;
          }
        } else {
          if (!coordinates) {
            this.$router.push("/location/map");
            return;
          }
        }

        if (this.redirect) {
          this.$router.push(this.redirect);
        } else {
          this.$router.push("/home");
        }
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
  },
};
</script>



