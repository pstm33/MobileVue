<template>
  <q-page class="tagam-system-page q-pl-md q-pr-md flex flex-center">
    <div class="tagam-system-card full-width text-center">
      <q-img
        src="network-error.png"
        fit="cover"
        spinner-color="primary"
        style="max-width: 150px"
      />
      <q-space class="q-pa-sm"></q-space>
      <div class="text-h5 text-weight-bold">
        {{ $t("We're having trouble loading") }}
      </div>
      <div class="tagam-text-muted font12">
        {{ $t("Please check your Network connectivity and try again") }}
      </div>
      <q-space class="q-pa-sm"></q-space>
      <q-btn
        @click="CheckNetwork"
        color="primary"
        text-color="white"
        unelevated
        :label="$t('Try Again')"
        no-caps
      />
    </div>
  </q-page>
</template>

<script>
import { Network } from "@capacitor/network";
import APIinterface from "src/api/APIinterface";

export default {
  name: "NetworkError",
  methods: {
    async CheckNetwork() {
      APIinterface.showLoadingBox("", this.$q);
      const status = await Network.getStatus();
      if (status.connected === true) {
        APIinterface.hideLoadingBox(this.$q);
        this.$router.push("/home");
      } else {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.tagam-system-page
  background: linear-gradient(180deg, var(--tagam-bg-soft), var(--tagam-bg))

.tagam-system-card
  max-width: 360px
  margin: auto
  padding: 22px
  border: 1px solid var(--tagam-border)
  border-radius: var(--tagam-radius-card)
  background: var(--tagam-surface)
  box-shadow: var(--tagam-shadow-soft)
</style>





