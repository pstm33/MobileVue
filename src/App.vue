<template>
  <router-view />
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
import { getApiLanguage } from "src/api/language";

export default defineComponent({
  name: "App",
  components: {
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
    this.scheduleGlobalLoadingCleanup();

    this.$watch(
      () => this.$route.fullPath,
      () => {
        this.scheduleGlobalLoadingCleanup();
      }
    );

    this.$watch(
      () => this.ClientStore.$state.user_settings,
      (newData) => {
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
      (newData) => {
        if (newData) {
          const merchant_uuid = newData?.data?.merchant?.merchant_uuid || null;
          this.subscribeToCart(merchant_uuid);
        }
      }
    );
  },

  created() {
    this.DataStorePersisted.dark_mode = false;
    this.$q.dark.set(false);

    if (!APIinterface.empty(this.DataStorePersisted.app_language)) {
      this.$i18n.locale = this.DataStorePersisted.app_language;
    }

    if (!APIinterface.empty(this.DataStorePersisted.rtl)) {
      this.$q.lang.set({ rtl: this.DataStorePersisted.rtl });
    }
    api.defaults.params = {};
    api.defaults.params["language"] = getApiLanguage(this.$i18n.locale);
  },

  methods: {
    cleanupGlobalLoadingOverlays() {
      try {
        this.$q.loading.hide();
      } catch (error) {}

      if (typeof document === "undefined") {
        return;
      }

      document
        .querySelectorAll(".q-loading, .q-loading__backdrop")
        .forEach((node) => node.remove());

      const visibleDialogs = Array.from(
        document.querySelectorAll(".q-dialog__inner")
      ).filter((node) => {
        const style = window.getComputedStyle(node);
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        );
      });

      if (visibleDialogs.length === 0) {
        document
          .querySelectorAll(".q-dialog__backdrop")
          .forEach((node) => node.remove());
      }

      document.body.classList.remove("q-body--force-scrollbar-x");
      document.body.classList.remove("q-body--dialog");
      document.body.classList.remove("q-body--prevent-scroll");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    },
    scheduleGlobalLoadingCleanup() {
      [0, 150, 500, 1200, 2200].forEach((delay) => {
        window.setTimeout(() => {
          this.cleanupGlobalLoadingOverlays();
        }, delay);
      });
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

      const NotificationPermission = Notification.permission;
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
        .then(async () => {
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
    },
  },
});
</script>
