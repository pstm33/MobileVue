<template>
  <q-header
    reveal
    reveal-offset="50"
    :class="{ 'tagam-surface-elevated text-white': $q.dark.mode, 'tagam-surface tagam-text-main': !$q.dark.mode, }"
  >
    <q-toolbar>
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
        $t("Legal")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page padding class="tagam-legal-menu-page">
    <q-list separator>
      <template v-for="(items, index) in DataStore.legal_menu" :key="items">
        <q-item
          clickable
          :to="{
            name: 'page',
            params: {
              page_id: index,
            },
          }"
        >
          <q-item-section>
            <q-item-label>{{ $t(items) }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-page>
</template>

<script>
import { useDataStore } from "stores/DataStore";
export default {
  name: "LegalMenu",
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
};
</script>






