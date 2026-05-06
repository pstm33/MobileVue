export const runtimeConfig = {
  appName: import.meta.env.VITE_APP_NAME || "Tagam Next",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "https://tagam.delivery",
  defaultCity: import.meta.env.VITE_DEFAULT_CITY || "Turkmenbashi",
  publicApiToken: import.meta.env.VITE_PUBLIC_API_TOKEN || "",
  testClientToken: import.meta.env.VITE_TEST_CLIENT_TOKEN || "",
  useUnifiedMetricIcons: import.meta.env.VITE_USE_UNIFIED_METRIC_ICONS !== "false",
}
