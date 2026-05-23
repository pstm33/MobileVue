import { createApp } from "vue";
import { createPinia } from "pinia";
import { Capacitor } from "@capacitor/core";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";
import { useAppStore } from "src/stores/app";
import { setupAppRuntime } from "src/services/appRuntime";

const pinia = createPinia();

if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add("native");
}

createApp(App).use(pinia).use(router).mount("#app");

useAppStore().initPreferences();
setupAppRuntime({ router, pinia });
