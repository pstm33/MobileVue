<template>
  <div
    class="tagam-install-pwa text-white q-pa-sm"
    v-if="!pwaStore.closePwa && pwaStore.isInstallable"
  >
    <div class="row items-center">
      <div class="col text-subtitle2">
        <div class="flex items-center q-gutter-x-xs">
          <div>
            <q-btn
              round
              color="white"
              text-color="primary"
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
          color="white"
          text-color="primary"
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

<style lang="sass" scoped>
.tagam-install-pwa
  margin: 8px 8px 0
  border-radius: var(--tagam-radius-card)
  background: linear-gradient(135deg, var(--tagam-primary), #ff8f4d)
  box-shadow: 0 12px 28px rgba(255, 107, 53, 0.24)
</style>



