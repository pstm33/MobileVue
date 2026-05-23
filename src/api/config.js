const config = {

  api_base_url: import.meta.env.VITE_KMRS_API_BASE_URL || "https://tagam.delivery",
  api_token: import.meta.env.VITE_KMRS_API_TOKEN || "",

  // Android
  app_android_scheme: "com.tagam.delivery",

  // Notifications
  topic: "customer",
  promotional_topic: "promotional",
  channel: "krms-channel",
  sound: "notify.mp3",

  // Other
  api_location: "apilocations",
};

export default config;
