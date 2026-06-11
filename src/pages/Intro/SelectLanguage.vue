<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header
      reveal
      reveal-offset="50"
      :class="{ 'tagam-surface-elevated text-white': $q.dark.mode, 'tagam-surface tagam-text-main': !$q.dark.mode, }"
    >
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">{{
          $t("Select Language")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page
      padding
      class="q-pl-md q-pr-md row items-stretch tagam-intro-select-language-page"
      :class="{ 'tagam-surface-elevated': $q.dark.mode, 'tagam-surface': !$q.dark.mode, }"
    >
      <q-card
        flat
        class="radius8 col-12"
        :class="{ 'tagam-surface-elevated': $q.dark.mode, 'tagam-surface': !$q.dark.mode }"
      >
        <q-card-section>
          <q-list>
            <q-item
              v-for="items in DataStore?.language_data?.data"
              :key="items"
              tag="label"
              clickable
              v-ripple
              class="border-grey radius10 q-mb-sm"
              :class="{ 'bg-dark text-white': $q.dark.mode, 'tagam-surface tagam-text-main': !$q.dark.mode, }"
            >
              <q-item-section avatar>
                <q-avatar square>
                  <q-img
                    :src="items.flag"
                    spinner-color="secondary"
                    style="height: 25px; max-width: 40px"
                    spinner-size="sm"
                  />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label lines="1">{{ items.title }}</q-item-label>
                <q-item-label lines="1" caption>{{
                  items.description
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="language" :val="items.code" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-footer
        reveal
        class="tagam-surface shadow-1 row q-gutter-sm q-pa-sm q-pl-md q-pr-md"
      >
        <q-btn
          color="mygrey"
          text-color="dark"
          size="lg"
          rounded
          unelevated
          no-caps
          class="col"
          to="/home"
          >{{ $t("Skip") }}</q-btn
        >
        <q-btn
          color="primary"
          size="lg"
          rounded
          unelevated
          no-caps
          class="col"
          @click="setLanguage"
          :loading="DataStore.loading"
          >{{ $t("Save") }}</q-btn
        >
      </q-footer>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { api } from "boot/axios";
import { useDeliveryschedStore } from "stores/DeliverySched";
import APIinterface from "src/api/APIinterface";
import { normalizeAppLocale } from "src/i18n/localeMap";

export default {
  name: "LanguagePage",
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const deliveryschedStore = useDeliveryschedStore();
    return { DataStore, DataStorePersisted, deliveryschedStore };
  },
  data() {
    return {
      language: "",
    };
  },
  created() {
    this.language = this.DataStorePersisted.app_language;
  },
  methods: {
    setLanguage() {
      this.DataStorePersisted.choose_language = true;
      this.DataStorePersisted.app_language = this.language;
      this.$i18n.locale = normalizeAppLocale(
        this.language,
        this.$i18n?.availableLocales || []
      );
      api.defaults.params = {};
      api.defaults.params["language"] = this.DataStorePersisted.app_language;

      this.DataStore.getAttributes();
      this.deliveryschedStore.getDeliverySched(
        APIinterface.getStorage("cart_uuid"),
        0
      );
      this.$router.replace("/home");
      this.setRTL();
    },
    refresh(done) {
      this.DataStore.getAttributes(done);
    },
    setRTL() {
      if (Object.keys(this.DataStore.language_data).length > 0) {
        Object.entries(this.DataStore.language_data.data).forEach(
          ([key, items]) => {
            if (this.language == items.code) {
              if (items.rtl == 1) {
                this.$q.lang.set({ rtl: true });
                this.DataStorePersisted.rtl = true;
              } else {
                this.$q.lang.set({ rtl: false });
                this.DataStorePersisted.rtl = false;
              }
            }
          }
        );
      }
    },
  },
};
</script>






