<template>
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
        <q-toolbar-title class="text-weight-bold">{{
          $t("Currency")
        }}</q-toolbar-title>
      </q-toolbar>
    </div>
  </q-header>
  <q-page class="tagam-page-shell q-px-md q-pb-xl">
    <section class="tagam-section-shell q-mt-lg">
      <div class="tagam-section-heading tagam-section-heading--stacked">
        <div>
          <div class="tagam-section-heading__eyebrow">{{ $t("Preferences") }}</div>
          <div class="tagam-section-heading__title">{{ $t("Currency") }}</div>
        </div>
        <div class="tagam-section-heading__meta">
          {{ $t("Choose your preferred currency") }}
        </div>
      </div>
    <q-list separator dense class="tagam-list-card q-pa-sm">
      <template v-for="(items, code) in getData" :key="items">
        <q-item tag="label" clickable class="tagam-account-row">
          <q-item-section>
            <q-item-label class="text-weight-medium text-subtitle2">
              {{ items }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-radio v-model="currency_code" :val="code" color="primary" />
          </q-item-section>
        </q-item>
      </template>
    </q-list>
    </section>

    <q-footer class="bg-transparent q-px-md q-pb-sm q-pt-sm text-dark">
      <div class="tagam-footer-shell">
      <q-btn
        no-caps
        unelevated
        color="secondary"
        text-color="white"
        size="lg"
        rounded
        class="fit"
        @click="setCurrency"
        :loading="loading"
      >
        <div class="text-subtitle2 text-weight-bold">
          {{ $t("Save") }}
        </div>
      </q-btn>
      </div>
    </q-footer>
  </q-page>
</template>

<script>
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";
import { useMenuStore } from "stores/MenuStore";
import { loadAppSettings } from "src/api/SettingsLoader";

export default {
  name: "CurrencyPage",
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const MenuStore = useMenuStore();
    return { DataStore, DataStorePersisted, MenuStore };
  },
  data() {
    return {
      currency_code: "",
      loading: false,
      isScrolled: false,
    };
  },
  mounted() {
    this.currency_code = this.getCurrency();
  },
  computed: {
    getData() {
      return this.DataStore.currency_list || null;
    },
  },
  methods: {
    refresh(done) {
      this.DataStore.getAttributes(done);
    },
    getCurrency() {
      if (Object.keys(this.DataStore.currency_list).length > 0) {
        let Currency = this.DataStorePersisted.use_currency_code
          ? this.DataStorePersisted.use_currency_code
          : this.DataStore.default_currency_code;
        return Currency;
      }
      return false;
    },
    async setCurrency() {
      this.loading = true;
      this.DataStorePersisted.use_currency_code = this.currency_code;
      this.DataStorePersisted.change_currency = true;

      // RESET DATA
      this.DataStore.feed_filter = [];
      this.DataStore.featured_items = null;
      this.MenuStore.menu_info_slug = null;
      this.MenuStore.menu_saved_slug = null;

      await loadAppSettings();

      setTimeout(() => {
        this.loading = false;
        APIinterface.ShowSuccessful(this.$t("Currency saved."), this.$q);
      }, 500);
    },
  },
};
</script>
