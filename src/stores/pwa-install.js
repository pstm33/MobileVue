import { defineStore } from "pinia";

export const usePwaInstallStore = defineStore("pwaInstall", {
  state: () => ({
    deferredPrompt: null,
    isInstallable: false,
    closePwa: false,
  }),
  actions: {
    setPromptEvent(event) {
      this.deferredPrompt = event;
      this.isInstallable = true;
    },
    clearPromptEvent() {
      this.deferredPrompt = null;
      this.isInstallable = false;
    },
    isStandalone() {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
      );
    },
  },
});
