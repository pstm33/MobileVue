<template>
  <q-page padding class="tagam-user-apple-callback-page"> </q-page>
</template>

<script>
import { useDataStore } from "stores/DataStore";
import { useClientStore } from "stores/ClientStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

export default {
  name: "AppleCallback",
  data() {
    return {
      id_token: null,
    };
  },
  setup() {
    const DataStore = useDataStore();
    const ClientStore = useClientStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, ClientStore, DataStorePersisted };
  },
  async mounted() {
    const data = this.$route.query;

    const params = {
      id: data?.id ?? "",
      email_address: data?.email ?? "",
      first_name: data?.first_name ?? "",
      last_name: data?.last_name ?? "",
      social_strategy: "apple",
      social_token: data?.social_token ?? "",
    };

    try {
      APIinterface.showLoadingBox("", this.$q);
      const response = await APIinterface.fetchData("SocialRegister", params);
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
};
</script>




