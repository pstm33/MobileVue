import { Capacitor } from "@capacitor/core";

const isLocalWeb =
  typeof window !== "undefined" &&
  !Capacitor.isNativePlatform() &&
  ["127.0.0.1", "localhost", "::1"].includes(window.location.hostname);

const config = {

  api_base_url: import.meta.env.VITE_TAGAM_API_BASE_URL || (isLocalWeb ? "/tagam-api" : "https://tagam.delivery"),
  api_token: import.meta.env.VITE_TAGAM_API_TOKEN || "",

  // Android
  app_android_scheme: "com.tagam.delivery",

  // Notifications
  topic: "customer",
  promotional_topic: "promotional",
  channel: "tagam-channel",
  sound: "notify.mp3",

  // Other
  api_location: "apilocations",
};

export default config;
