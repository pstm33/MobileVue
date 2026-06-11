import { usePwaInstallStore } from "stores/pwa-install";

export default () => {
  const store = usePwaInstallStore();
  window.addEventListener("beforeinstallprompt", (e) => {
    // Don't show if already running as standalone

    if (store.isStandalone()) return;

    e.preventDefault();
    store.setPromptEvent(e);

    console.log("[PWA] Install prompt captured");
  });
};



