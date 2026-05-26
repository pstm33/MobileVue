import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Device } from "@capacitor/device";
import { Network } from "@capacitor/network";
import { PushNotifications } from "@capacitor/push-notifications";
import { Toast } from "@capacitor/toast";
import { FCM } from "@capacitor-community/fcm";
import { NativeAudio } from "@capacitor-community/native-audio";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import config from "src/api/config";
import { LocalStorage, SessionStorage } from "src/services/storage";
import { useClientAuthStore } from "src/stores/clientAuth";

const runtime = {
  initialized: false,
  lastBackPress: 0,
  deviceId: "",
  platform: Capacitor.getPlatform(),
};

const safeCall = async (label, action) => {
  try {
    return await action();
  } catch (error) {
    console.warn(`[runtime] ${label}`, error);
    return null;
  }
};

const showToast = async (text) => {
  const message = String(text || "").slice(0, 180);
  if (!message) return;

  if (Capacitor.isNativePlatform()) {
    await safeCall("toast", () => Toast.show({ text: message, duration: "short", position: "center" }));
    return;
  }

  console.info(`[runtime] ${message}`);
};

const rememberNotice = (message, type = "info") => {
  if (!message) return;
  SessionStorage.set("runtime_notice", {
    message,
    type,
    created_at: Date.now(),
  });
};

const callbackParams = (rawUrl = "") => {
  try {
    const parsed = new URL(rawUrl);
    return {
      href: rawUrl,
      params: parsed.searchParams,
    };
  } catch {
    const query = rawUrl.includes("?") ? rawUrl.slice(rawUrl.indexOf("?") + 1) : "";
    return {
      href: rawUrl,
      params: new URLSearchParams(query),
    };
  }
};

const notificationRoute = (data = {}) => {
  const orderUuid = data.order_uuid || data.order_id || data.orderId;
  const transactionId = data.transaction_id || data.transactionId;
  const page = data.page || data.screen || data.route;

  if (orderUuid) {
    return { path: "/tracking", query: { order_uuid: orderUuid } };
  }

  if (transactionId) {
    return { path: "/wallet/receipt", query: { transaction_id: transactionId } };
  }

  if (page && String(page).startsWith("/")) {
    return { path: page };
  }

  return { path: "/notifications" };
};

const syncDeviceToken = async (token) => {
  if (!token) return;

  const deviceId = runtime.deviceId || LocalStorage.getItem("device_identifier") || "";
  const platform = runtime.platform || LocalStorage.getItem("device_platform") || "web";
  LocalStorage.set("device_token", token);

  if (!deviceId) return;

  if (auth.authenticated()) {
    await safeCall("update device", () => APIinterface.updateDevice(token, deviceId, platform));
    return;
  }

  await safeCall("register device", () => APIinterface.registerDevice(token, deviceId, platform));
};

const handlePaymentCallback = async (rawUrl, router) => {
  if (!rawUrl || !router) return false;

  const isCallback =
    rawUrl.startsWith(`${config.app_android_scheme}://payment-callback`) ||
    rawUrl.includes("payment-callback");

  if (!isCallback) return false;

  const { params } = callbackParams(rawUrl);
  const status = params.get("status") || "";
  const orderId = params.get("order_id") || params.get("order_uuid") || "";
  const transactionId = params.get("transaction_id") || "";
  const message = params.get("msg") || params.get("message") || "";

  if (status === "successful") {
    await router.replace({ path: "/tracking", query: { order_uuid: orderId } });
    return true;
  }

  if (status === "wallet_succesful" || status === "wallet_successful") {
    await router.replace({ path: "/wallet/receipt", query: { transaction_id: transactionId } });
    return true;
  }

  if (status === "after_addfunds") {
    await router.replace({
      path: "/checkout",
      query: {
        success_message: message || undefined,
        reload: params.get("reload") || "1",
      },
    });
    return true;
  }

  if (status === "apple_login") {
    await router.replace({
      path: "/user/apple_callback",
      query: {
        social_token: params.get("social_token") || undefined,
        social_strategy: params.get("social_strategy") || "apple",
        email_address: params.get("email_address") || undefined,
        first_name: params.get("first_name") || undefined,
        last_name: params.get("last_name") || undefined,
      },
    });
    return true;
  }

  if (status === "failed") {
    rememberNotice(message || "Payment failed", "error");
    await showToast(message || "Payment failed");
    return true;
  }

  return status === "cancel";
};

const setupAuthVerification = async (pinia) => {
  if (!auth.authenticated()) return;

  const clientAuth = useClientAuthStore(pinia);
  const response = await safeCall("authenticate", () => auth.authenticate());

  if (!response) {
    clientAuth.logout();
    return;
  }

  if (response.details?.user_settings) {
    LocalStorage.set("user_settings", response.details.user_settings);
  }
};

const setupDeviceInfo = async () => {
  const deviceId = await safeCall("device id", () => Device.getId());
  const info = await safeCall("device info", () => Device.getInfo());
  const appInfo = Capacitor.isNativePlatform() ? await safeCall("app info", () => App.getInfo()) : null;

  runtime.deviceId = deviceId?.identifier || LocalStorage.getItem("device_identifier") || "";
  runtime.platform = info?.platform || Capacitor.getPlatform();

  if (runtime.deviceId) LocalStorage.set("device_identifier", runtime.deviceId);
  if (runtime.platform) LocalStorage.set("device_platform", runtime.platform);
  if (appInfo?.version) LocalStorage.set("app_version", appInfo.version);
  LocalStorage.set("runtime_device", {
    native: Capacitor.isNativePlatform(),
    platform: runtime.platform,
    device_id: runtime.deviceId,
    app_version: appInfo?.version || "",
    updated_at: Date.now(),
  });
};

const setupNativeAudio = async () => {
  if (!Capacitor.isNativePlatform()) return;

  await safeCall("preload notify audio", () =>
    NativeAudio.preload({
      assetId: "notify",
      assetPath: "assets/sounds/notify.mp3",
      audioChannelNum: 1,
      isUrl: false,
    })
  );

  await safeCall("preload chat audio", () =>
    NativeAudio.preload({
      assetId: "chat",
      assetPath: "assets/sounds/chat.mp3",
      audioChannelNum: 1,
      isUrl: false,
    })
  );
};

const setupNetwork = async (router) => {
  const status = await safeCall("network status", () => Network.getStatus());
  if (status && !status.connected && router.currentRoute.value.path !== "/errornetwork") {
    await router.replace("/errornetwork");
  }

  await safeCall("network listener", () =>
    Network.addListener("networkStatusChange", async (state) => {
      if (!state.connected) {
        await router.replace("/errornetwork");
      }
    })
  );
};

const setupBackButton = async (router) => {
  if (!Capacitor.isNativePlatform()) return;

  await safeCall("back button listener", () =>
    App.addListener("backButton", async ({ canGoBack }) => {
      const route = router.currentRoute.value;

      if (route.path === "/home" || !canGoBack) {
        const now = Date.now();
        if (now - runtime.lastBackPress < 1600) {
          await App.exitApp();
          return;
        }
        runtime.lastBackPress = now;
        await showToast("Press again to exit");
        return;
      }

      router.back();
    })
  );
};

const setupDeepLinks = async (router) => {
  if (!Capacitor.isNativePlatform()) return;

  await safeCall("app url open listener", () =>
    App.addListener("appUrlOpen", async ({ url }) => {
      if (await handlePaymentCallback(url, router)) return;
      if (url?.startsWith("http")) {
        const parsed = new URL(url);
        await router.push(`${parsed.pathname}${parsed.search || ""}${parsed.hash || ""}`);
      }
    })
  );
};

const setupPush = async (router) => {
  if (!Capacitor.isNativePlatform()) return;

  const permissions = await safeCall("push permissions", () => PushNotifications.checkPermissions());
  const receive = permissions?.receive === "granted" ? permissions : await safeCall("request push permissions", () => PushNotifications.requestPermissions());
  LocalStorage.set("push_permission", receive?.receive || "prompt");

  if (receive?.receive !== "granted") return;

  await safeCall("fcm auto init", () => FCM.setAutoInit({ enabled: true }));
  if (config.topic) await safeCall("fcm topic", () => FCM.subscribeTo({ topic: config.topic }));
  if (config.promotional_topic) await safeCall("fcm promo topic", () => FCM.subscribeTo({ topic: config.promotional_topic }));

  if (runtime.platform === "android") {
    await safeCall("push channel", () =>
      PushNotifications.createChannel({
        id: config.channel,
        name: "Tagam Delivery",
        description: "Order and chat notifications",
        importance: 5,
        visibility: 1,
        sound: config.sound,
        lights: true,
        vibration: true,
      })
    );
  }

  await safeCall("push registration listener", () =>
    PushNotifications.addListener("registration", async (token) => {
      await syncDeviceToken(token?.value);
    })
  );

  await safeCall("push error listener", () =>
    PushNotifications.addListener("registrationError", (error) => {
      console.warn("[runtime] push registration error", error);
    })
  );

  await safeCall("push received listener", () =>
    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      LocalStorage.set("last_push_notification", {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        received_at: Date.now(),
      });
    })
  );

  await safeCall("push action listener", () =>
    PushNotifications.addListener("pushNotificationActionPerformed", async ({ notification }) => {
      await router.push(notificationRoute(notification?.data || {}));
    })
  );

  await safeCall("push register", () => PushNotifications.register());
  const fcmToken = await safeCall("fcm token", () => FCM.getToken());
  await syncDeviceToken(fcmToken?.token);
  LocalStorage.set("runtime_push_ready", {
    platform: runtime.platform,
    permission: receive.receive,
    channel: config.channel,
    topic: config.topic || "",
    promotional_topic: config.promotional_topic || "",
    updated_at: Date.now(),
  });
};

export const setupAppRuntime = async ({ router, pinia } = {}) => {
  if (runtime.initialized) return;
  runtime.initialized = true;

  await setupDeviceInfo();
  await setupAuthVerification(pinia);
  await setupNativeAudio();

  if (router) {
    await setupNetwork(router);
    await setupBackButton(router);
    await setupDeepLinks(router);
    await setupPush(router);
  }

  LocalStorage.set("runtime_ready", {
    native: Capacitor.isNativePlatform(),
    platform: runtime.platform,
    initialized_at: Date.now(),
  });
};
