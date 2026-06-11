<template>
  <q-header
    class="tagam-account-header" :class="{ 'border-bottom': !isScrolled, 'shadow-bottom': isScrolled, }"
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="eva-arrow-back-outline"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
      <q-toolbar-title class="text-subtitle2 text-weight-bold">{{
        $t("Currency")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="tagam-account-currency-page">
    <q-list separator dense>
      <template v-for="(items, code) in getData" :key="items">
        <q-item tag="label">
          <q-item-section>
            <q-item-label class="text-weight-medium text-subtitle2">
              {{ items }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-radio v-model="currency_code" :val="code" color="disabled" />
          </q-item-section>
        </q-item>
      </template>
    </q-list>
    <q-space class="q-pa-md"></q-space>

    <q-footer class="tagam-surface shadow-1 tagam-text-main q-pa-md">
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







