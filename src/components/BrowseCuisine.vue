<template>
  <q-dialog v-model="modal" position="bottom">
    <q-card>
      <q-toolbar class="text-primary top-toolbar q-pl-md" dense>
        <q-toolbar-title class="text-weight-bold">
          {{ $t("All Cuisine") }}
        </q-toolbar-title>
        <q-space></q-space>
        <q-btn
          @click="modal = !true"
          square
          unelevated
          :color="$q.dark.mode ? 'grey600' : 'white'"
          :text-color="$q.dark.mode ? 'grey300' : 'grey'"
          icon="las la-times"
          dense
          no-caps
          size="sm"
          class="border-grey radius8"
        />
      </q-toolbar>
      <q-card-section class="q-pt-none q-pl-md">
        <q-list separator>
          <template v-for="items in DataStore.cuisine" :key="items">
            <q-item clickable :to="getCuisineLink(items)">
              <q-item-section avatar>
                <q-avatar size="50px">
                  <img :src="items.featured_image" />
                </q-avatar>
              </q-item-section>
              <q-item-section class="text-subtitle2 text-weight-bold">
                {{ items.cuisine_name }}
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDataStore } from "stores/DataStore";
export default {
  name: "BrowseCuisine",
  props: ["search_mode"],
  data() {
    return {
      modal: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  mounted() {
    if (!this.DataStore.hasDataCuisine()) {
      //this.DataStore.CuisineList();
    }
  },
  methods: {
    getCuisineLink(items) {
      if (this.search_mode === "address") {
        return {
          name: "feed",
          query: {
            query: "all",
            cuisine_id: items.cuisine_id,
            cuisine_name: items.cuisine_name,
          },
        };
      } else if (this.search_mode === "location") {
        return {
          path: "feed/location",
          query: {
            cuisine_id: items.cuisine_id,
            cuisine_name: items.cuisine_name,
          },
        };
      }
    },
  },
};
</script>
