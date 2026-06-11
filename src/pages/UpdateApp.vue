<template>
  <q-page class="tagam-system-page q-pl-md q-pr-md flex flex-center">
    <div class="tagam-system-card full-width text-center">
      <q-img
        src="update.png"
        fit="cover"
        spinner-color="primary"
        style="max-width: 150px"
      />
      <q-space class="q-pa-sm"></q-space>
      <div class="text-subtitle1 text-weight-bold">
        {{ app_name }} {{ $t("needs an update") }}
      </div>
      <div class="tagam-text-muted text-caption">
        {{ $t("To continue to use the app, download the latest version") }}
      </div>
      <q-space class="q-pa-sm"></q-space>
      <q-btn
        color="primary"
        text-color="white"
        unelevated
        :label="$t('Update')"
        no-caps
        target="_blank"
        rounded
        :href="
          $q.platform.is.android
            ? this.getData.android_download_url
            : this.getData.ios_download_url
        "
      />
    </div>
  </q-page>
</template>

<script>
import { App } from "@capacitor/app";
import { useDataStore } from "stores/DataStore";

export default {
  name: "UpdateApp",
  data() {
    return {
      app_name: "",
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  created() {
    if (this.$q.capacitor) {
      this.getApp();
    }
  },
  computed: {
    getData() {
      return this.DataStore.appversion_data;
    },
  },
  methods: {
    async getApp() {
      let result = await App.getInfo();
      if (result) {
        this.app_name = result.name;
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





