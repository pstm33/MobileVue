<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header reveal reveal-offset="50" class="bg-transparent q-pa-sm">
      <div class="tagam-account-header-shell">
        <q-toolbar class="q-px-xs">
          <q-btn
            @click="$router.back()"
            flat
            round
            dense
            icon="las la-angle-left"
            class="q-mr-sm"
            :color="$q.dark.mode ? 'white' : 'dark'"
          />
          <q-toolbar-title class="text-weight-bold">
            {{ $t("Language") }}
          </q-toolbar-title>
        </q-toolbar>
      </div>
    </q-header>

    <q-page class="tagam-page-shell q-px-md q-pb-xl">
      <template v-if="!getData">
        <div class="q-pt-lg">
          <NoResults
            :message="$t('No languages available')"
            :description="
              $t(
                ' Oops! It looks like no languages are currently available. Please check back later.'
              )
            "
          />
        </div>
      </template>
      <template v-else>
        <section class="tagam-section-shell q-mt-lg">
          <div class="tagam-section-heading tagam-section-heading--stacked">
            <div>
              <div class="tagam-section-heading__eyebrow">
                {{ $t("Preferences") }}
              </div>
              <div class="tagam-section-heading__title">
                {{ $t("Language") }}
              </div>
            </div>
            <div class="tagam-section-heading__meta">
              {{ $t("Choose your preferred app language") }}
            </div>
          </div>

          <q-list class="tagam-list-card q-pa-sm">
            <template v-for="items in getData" :key="items.code">
              <q-item tag="label" clickable class="tagam-account-row">
                <q-item-section>
                  <q-item-label class="text-weight-bold text-subtitle2">
                    {{ items.title }}
                  </q-item-label>
                  <q-item-label caption class="tagam-page-copy">
                    {{ items.description }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-radio
                    v-model="language"
                    :val="items.code"
                    color="primary"
                    @update:model-value="setLanguage"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </section>
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useMenuStore } from "stores/MenuStore";
import { api } from "boot/axios";
import { defineAsyncComponent } from "vue";
import { loadAppSettings } from "src/api/SettingsLoader";

export default {
  name: "LanguagePage",
  components: {
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const MenuStore = useMenuStore();
    return { DataStore, DataStorePersisted, MenuStore };
  },
  data() {
    return {
      language: "",
      loading: false,
    };
  },
  created() {
    this.language = this.DataStorePersisted.app_language;
  },
  computed: {
    getData() {
      return this.DataStore?.language_data?.data || null;
    },
  },
  methods: {
    async setLanguage() {
      this.DataStorePersisted.app_language = this.language;
      this.$i18n.locale = this.language;
      api.defaults.params = {};
      api.defaults.params["language"] = this.$i18n.locale;

      this.setRTL();
      //this.DataStore.getAttributes();
      await loadAppSettings();

      // Clear menu data
      this.MenuStore.data_info = [];
      this.MenuStore.data_category = [];
      this.DataStore.feed_filter = [];
      this.DataStore.featured_items = null;
      this.MenuStore.menu_info_slug = null;
      this.MenuStore.menu_saved_slug = null;
    },
    async refresh(done) {
      setTimeout(() => {
        done();
      }, 500);
      await loadAppSettings();
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
