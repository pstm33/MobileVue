<template>
  <router-view />
  <TagamThemeFab v-if="showThemeFab" />
  <QuickTrack ref="ref_trackorder"></QuickTrack>
  <PushSubsribe ref="ref_webpush"></PushSubsribe>
</template>

<script>
import { defineAsyncComponent, defineComponent } from "vue";
import APIinterface from "./api/APIinterface";
import { usePushStore } from "stores/PushStore";
import auth from "./api/auth";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useCartStore } from "stores/CartStore";
import { api } from "boot/axios";
import { useClientStore } from "stores/ClientStore";
import { usePusherStore } from "stores/PusherStore";
import { NativeAudio } from "@capacitor-community/native-audio";
import { FCM } from "@capacitor-community/fcm";
import config from "./api/config";
import { normalizeAppLocale } from "src/i18n/localeMap";

export default defineComponent({
  name: "App",
  components: {
    TagamThemeFab: defineAsyncComponent(() =>
      import("components/TagamThemeFab.vue")
    ),
    QuickTrack: defineAsyncComponent(() => import("components/QuickTrack.vue")),
    PushSubsribe: defineAsyncComponent(() =>
      import("components/PushSubsribe.vue")
    ),
  },
  data() {
    return {
      token: "",
      close_count: 0,
      tracking_data: null,
    };
  },
  setup() {
    const PushStore = usePushStore();
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const ClientStore = useClientStore();
    const PusherStore = usePusherStore();
    const CartStore = useCartStore();
    return {
      PushStore,
      DataStore,
      DataStorePersisted,
      ClientStore,
      PusherStore,
      CartStore,
    };
  },

  mounted() {
    this.checkAppVersion();
    this.pusherSubscribe();
    this.pushFirebase();
    this.webpushSubscribe();

    this.$watch(
      () => this.ClientStore.$state.user_settings,
      (newData, oldData) => {
        if (newData) {
          console.log("WATCH CLIENTSTORE", newData);
          this.DataStorePersisted.push_enabled =
            newData?.app_push_notifications || false;
          console.log(
            "this.DataStorePersisted.push_enabled",
            this.DataStorePersisted.push_enabled
          );
          this.pusherSubscribe();
          this.pushFirebase();
          this.webpushSubscribe();
        }
      }
    );

    this.$watch(
      () => this.CartStore.$state.cart_data,
      (newData, oldData) => {
        if (newData) {
          const merchant_uuid = newData?.data?.merchant?.merchant_uuid || null;
          this.subscribeToCart(merchant_uuid);
        }
      }
    );

    // setTimeout(() => {
    //   this.$refs.ref_webpush.modal = true;
    // }, 2000);
  },

  created() {
    this.$q.dark.set(this.DataStorePersisted.dark_mode);
    let appLocale = "en";

    if (!APIinterface.empty(this.DataStorePersisted.app_language)) {
      appLocale = this.normalizeLocale(this.DataStorePersisted.app_language);
      if (this.$i18n) {
        this.$i18n.locale = appLocale;
      }
    }

    if (!APIinterface.empty(this.DataStorePersisted.rtl)) {
      this.$q.lang.set({ rtl: this.DataStorePersisted.rtl });
    }
    api.defaults.params = {};
    api.defaults.params["language"] =
      this.DataStorePersisted.app_language || appLocale;
  },

  computed: {
    showThemeFab() {
      if (process.env.DEV) {
        return true;
      }

      return new URLSearchParams(window.location.search).get("theme_fab") === "1";
    },
  },

  methods: {
    normalizeLocale(locale) {
      return normalizeAppLocale(locale, this.$i18n?.availableLocales || []);
    },
    webpushSubscribe() {
      const isLogin = auth.authenticated();
      if (
        !isLogin ||
        !this.DataStore.is_messaging_supported ||
        !this.DataStorePersisted.push_enabled
      ) {
        console.log("webpushSubscribe return");
        return;
      }

      const isPwa =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      console.log("Running as PWA?", isPwa);
      if (!isPwa) {
        return;
      }

      // PWA FIREBASE PUSH
      const NotificationPermission = Notification.permission;
      // console.log("NotificationPermission", NotificationPermission);
      // console.log("App.vue web_token", this.DataStorePersisted.web_token);
      if (
        NotificationPermission == "default" ||
        !this.DataStorePersisted.web_token
      ) {
        setTimeout(() => {
          if (this.$refs.ref_webpush) {
            this.$refs.ref_webpush.modal = true;
          }
        }, 1000);
      }
      // PWA FIREBASE PUSH
    },
    async pushFirebase() {
      if (!this.$q.capacitor) {
        return;
      }

      try {
        await FCM.subscribeTo({ topic: config.topic });
      } catch (error) {
      } finally {
      }

      const isLogin = auth.authenticated();
      if (
        !isLogin ||
        !this.$q.capacitor ||
        !this.DataStorePersisted.push_enabled
      ) {
        return;
      }

      // REGISTER DEVICE
      if (this.ClientStore.device_token) {
        await APIinterface.fetchDataByTokenPost(
          "PushSubscribe",
          new URLSearchParams({
            platform: this.DataStore.device_platform,
            token: this.ClientStore.device_token,
          }).toString()
        );
      }

      const userData = auth.getUser();
      FCM.subscribeTo({ topic: userData.client_uuid })
        .then(async (r) => {
          this.DataStorePersisted.push_enabled = true;

          await APIinterface.fetchDataByTokenPost(
            "savenotifications",
            new URLSearchParams({
              push: 1,
            }).toString()
          );
        })
        .catch(async (error) => {
          console.log("subscribeTo", error);
          this.DataStorePersisted.push_enabled = false;
          await APIinterface.fetchDataByTokenPost(
            "savenotifications",
            new URLSearchParams({
              push: 0,
            }).toString()
          );
        });
    },
    subscribeToCart(value) {
      if (value) {
        this.PusherStore.subscribeToChannel(value, "cart", async (data) => {
          const message = JSON.parse(data.message) || null;
          if (message) {
            this.DataStore.menu_refresh = true;
            try {
              const results = await APIinterface.fetchDataPost(
                "validateCartItems",
                new URLSearchParams({
                  item_id: message?.item_id || null,
                  cart_uuid: this.DataStorePersisted.cart_uuid,
                }).toString()
              );
              this.$q
                .dialog({
                  title: this.$t("Items"),
                  message: results.msg,
                  persistent: true,
                  html: true,
                })
                .onOk(() => {
                  this.CartStore.getCart(
                    true,
                    null,
                    results?.details?.restaurant_slug
                  );
                });
            } catch (error) {
              console.log("error", error);
            }
          }
        });
      }
    },
    checkAppVersion() {
      if (!this.$q.capacitor) {
        return;
      }

      const appVersion = this.DataStore.app_version;
      if (appVersion <= 0) {
        return;
      }

      const androidVersion =
        this.DataStore.appversion_data?.mobile_app_version_android || 0;
      const iosVersion =
        this.DataStore.appversion_data?.mobile_app_version_ios || 0;

      const currentPlatform = this.$q.platform.is.android ? "android" : "ios";
      const latestVersion =
        currentPlatform === "android" ? androidVersion : iosVersion;

      if (latestVersion > appVersion) {
        this.$router.replace("/update-app");
      }
    },
    async pusherSubscribe() {
      const isLogin = auth.authenticated();

      let pusher_enabled =
        this.DataStore.realtime_data?.realtime_app_enabled || false;
      pusher_enabled = pusher_enabled == 1 ? true : false;

      if (pusher_enabled) {
        this.PusherStore.init(this.DataStore.realtime_data);
      }

      if (!isLogin || !pusher_enabled) {
        return;
      }
      const userData = auth.getUser();

      // PUSHER
      this.PusherStore.subscribeToChannel(
        userData.client_uuid,
        "notification-event",
        (data) => {
          this.handleReceiveData(data);
        }
      );

      this.PusherStore.subscribeToChannel(
        userData.client_uuid,
        "event-tracking-order",
        (data) => {
          this.DataStore.tracking_data = data;
          if (this.$route.path != "/account/trackorder") {
            this.$refs.ref_trackorder.setTracking(data);
          }
        }
      );
      // END PUSHER
    },
    handleReceiveData(data) {
      console.log("handleReceiveData", data);
      this.ClientStore.pusher_receive_data = data;
      let notificationType = data.notification_type
        ? data.notification_type
        : null;
      console.log("notificationType", notificationType);
      if (notificationType == "chat-message") {
        NativeAudio.play({ assetId: "chat" });
      } else {
        NativeAudio.play({ assetId: "notify" });
      }

      if (!this.ClientStore.notifications_data) {
        this.ClientStore.notifications_data = {
          chat_count: 0,
          alert_count: 0,
        };
      }

      if (notificationType == "chat-message") {
        const currentCount = parseInt(
          this.ClientStore.notifications_data.chat_count
        );
        this.ClientStore.notifications_data.chat_count =
          currentCount > 0 ? currentCount + 1 : 1;
      } else {
        const currentCount = parseInt(
          this.ClientStore.notifications_data.alert_count
        );
        this.ClientStore.notifications_data.alert_count =
          currentCount > 0 ? currentCount + 1 : 1;
      }

      console.log(
        "ClientStore.notifications_data",
        this.ClientStore.notifications_data
      );

      //
    },
  },
});
</script>



