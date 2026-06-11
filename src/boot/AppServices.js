import { boot } from "quasar/wrappers";
import { NativeAudio } from "@capacitor-community/native-audio";
import { FCM } from "@capacitor-community/fcm";
import { PushNotifications } from "@capacitor/push-notifications";
import { Platform } from "quasar";
import config from "src/api/config";
import { useClientStore } from "stores/ClientStore";
import { App } from "@capacitor/app";
import { Network } from "@capacitor/network";
import { useDataStore } from "stores/DataStore";
import auth from "src/api/auth";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";
import { Device } from "@capacitor/device";
import { firebaseMessaging, getToken, onMessage } from "src/boot/FirebaseChat";
import { Notify } from "quasar";
import { Toast } from "@capacitor/toast";
import { AddressbarColor } from "quasar";

let lastBackPress = 0;

export default boot(async ({ app, router, store }) => {
  // Audio

  // Apply AddressbarColor
  AddressbarColor.set("#ff5a2f");

  try {
    await NativeAudio.preload({
      assetPath: config.sound,
      assetId: "notify",
    });

    await NativeAudio.preload({
      assetPath: "chat.mp3",
      assetId: "chat",
    });
    // END Audio
  } catch (err) {
    console.error("NativeAudio preload error:", err);
  }

  const ClientStore = useClientStore();
  // VERIFY LOGIN STATUS
  const isLogin = auth.authenticated();
  if (isLogin) {
    try {
      const auth_results = await auth.authenticate();
      ClientStore.user_settings = auth_results.details.user_settings;
    } catch (error) {
      auth.logout();
    }
  }
  // END VERIFY LOGIN STATUS

  // VERIFY WEB PUSH TOKEN
  const DataStorePersisted = useDataStorePersisted();
  const DataStore = useDataStore();

  if (!isLogin) {
    DataStorePersisted.web_token = null;
  }

  // Check if firebase web push is supported
  try {
    DataStore.is_messaging_supported =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
  } catch (error) {
    console.log("error", error);
  }

  // PWA PUSH
  if (DataStore.is_messaging_supported && firebaseMessaging) {
    const NotificationPermission = Notification.permission;
    if (NotificationPermission == "granted" && DataStorePersisted.web_token) {
      console.log("verify token");
      try {
        const params = new URLSearchParams({
          platform: "pwa",
          token: DataStorePersisted.web_token,
        }).toString();

        await APIinterface.fetchDataByTokenPost("PushSuscribeValidate", params);

        onMessage(firebaseMessaging, (payload) => {
          console.log("Foreground message received:", payload);
          const title = payload?.notification?.title || "";
          const body = payload?.notification?.body || "";
          Notify.create({
            type: "info",
            color: "secondary",
            icon: "notifications",
            position: "top",
            timeout: 6000,
            message: `<strong>${title}</strong><br>${body}`,
            html: true,
            actions: [
              {
                icon: "close",
                color: "white",
                round: true,
                handler: () => {
                  /* ... */
                },
              },
            ],
          });
        });
      } catch (error) {
        DataStorePersisted.web_token = null;
      }
    }
    // end VERIFY WEB PUSH TOKEN
  }

  try {
    const deviceResp = await Device.getId();
    this.DataStore.device_identifier = deviceResp.identifier;
  } catch (error) {}

  try {
    const deviceInfo = await Device.getInfo();
    this.DataStore.device_platform = deviceInfo.platform;
  } catch (error) {}

  if (!Platform.is.capacitor) {
    //alert("not running on device");
    return;
  }

  // GET APP VERSION
  try {
    const AppResults = await App.getInfo();
    //console.log("AppResults", AppResults);
    DataStore.app_version = AppResults.version;
  } catch (error) {
    console.log("AppVersion error", error);
  }
  // END GET APP VERSION

  // EXIT APP
  if (Platform.is.capacitor && Platform.is.android) {
    App.addListener("backButton", ({ canGoBack }) => {
      const now = Date.now();
      if (!canGoBack) {
        if (now - lastBackPress < 2000) {
          App.exitApp();
        } else {
          lastBackPress = now;
          Toast.show({
            text: app.config.globalProperties.$t("Press again to exit the app"),
            duration: "short",
            position: "center",
          });
        }
      }
    });
  }
  // END EXIT APP

  // Network
  try {
    const NetworkStatus = await Network.getStatus();
    if (NetworkStatus.connected === false) {
      router.push("/errornetwork");
    }
  } catch (error) {
    console.log("NetworkStatus error", error);
  }

  Network.addListener("networkStatusChange", (status) => {
    if (status.connected === false) {
      router.push("/errornetwork");
    }
  });
  //END  Network

  App.addListener("appStateChange", (data) => {
    if (data.isActive && Platform.is.ios && Platform.is.capacitor) {
      PushNotifications.removeAllDeliveredNotifications().then((result) => {
        // do nothing
      });
    }
  });

  // PUSH
  PushNotifications.checkPermissions().then((result) => {
    if (result.receive === "granted") {
      PushNotifications.register();
    } else if (result.receive === "prompt-with-rationale") {
      PushNotifications.register();
    }
  });

  FCM.setAutoInit({ enabled: true }).then(() => {
    //
  });

  FCM.isAutoInitEnabled().then((r) => {
    // alert('Auto init is ' + (r.enabled ? 'enabled' : 'disabled'))
  });

  PushNotifications.addListener("registration", (Token) => {
    if (Platform.is.android) {
      ClientStore.device_token = Token.value;
    } else {
      FCM.getToken()
        .then((r) => {
          ClientStore.device_token = r.token;
        })
        .catch((error) => {
          console.log("error registration", error);
        });
    }
  });

  PushNotifications.addListener("registrationError", (error) => {
    console.error("Push registration error: ", error);
  });

  PushNotifications.createChannel({
    description: "TMRS mobile app channel",
    id: config.channel,
    importance: 5,
    lights: true,
    name: "TMRS channel",
    sound: config.sound,
    vibration: true,
    visibility: 1,
  })
    .then(() => {
      //
    })
    .catch((error) => {
      console.log("error creating channel", error);
    });

  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("Push received: ", notification);
    // You can show a custom alert, toast, or update your store
  });

  PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (notification) => {
      console.log("Notification action performed", notification);
      // Navigate or perform any logic here
    }
  );
  // END PUSH

  // Toast.show({
  //   text: "here",
  //   duration: "long",
  // });
  //
});



