<template>
  <div
    class="bg-deep-purple-6 text-white q-pa-sm"
    v-if="!pwaStore.closePwa && pwaStore.isInstallable"
  >
    <div class="row items-center">
      <div class="col text-subtitle2">
        <div class="flex items-center q-gutter-x-xs">
          <div>
            <q-btn
              round
              color="deep-purple-1"
              icon="close"
              flat
              @click="pwaStore.closePwa = true"
            />
          </div>
          <div>
            <div>{{ $t("Get the full app experience") }}</div>
            <div>{{ $t("Install for faster access") }}</div>
          </div>
        </div>
      </div>
      <div class="col-3">
        <q-btn
          :label="$t('Install')"
          color="deep-purple-1"
          text-color="deep-purple-6"
          @click="installApp"
          no-caps
          rounded
          unelevated
        />
      </div>
    </div>
  </div>
</template>

<script>
import { usePwaInstallStore } from "stores/pwa-install";

export default {
  name: "InstallPwa",
  setup() {
    const pwaStore = usePwaInstallStore();
    return { pwaStore };
  },
  methods: {
    installApp() {
      const prompt = this.pwaStore.deferredPrompt;
      console.log("prompt", prompt);
      if (prompt) {
        prompt.prompt();
        prompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("User accepted the install prompt");
          } else {
            console.log("User dismissed the install prompt");
          }
          this.pwaStore.clearPromptEvent();
        });
      }
    },
  },
};
</script>
