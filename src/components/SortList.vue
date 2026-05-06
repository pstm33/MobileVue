<template>
  <q-dialog v-model="show_modal" position="bottom">
    <q-card class="tagam-sort-sheet">
      <q-card-section class="tagam-sort-sheet__section">
        <q-list class="tagam-sort-sheet__list">
          <q-item-label header class="tagam-sort-sheet__title">{{
            $t("SORT")
          }}</q-item-label>

          <q-item
            class="tagam-sort-sheet__item"
            v-for="(items, index) in DataStore.sort_list"
            :key="items"
            tag="label"
            v-ripple
            clickable
          >
            <q-item-section>
              <q-item-label>{{ items }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-radio v-model="sort_list_by" :val="index" color="secondary" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDataStore } from "stores/DataStore";

export default {
  name: "SortList",
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  data() {
    return {
      show_modal: false,
      sort_list_by: "recommended",
    };
  },
  created() {
    if (Object.keys(this.DataStore.sort_list).length <= 0) {
      this.DataStore.searchAttributes();
    }
  },
  watch: {
    sort_list_by(newval, oldval) {
      this.applySort(newval);
    },
  },
  methods: {
    applySort(data) {
      this.show_modal = false;
      this.sort_list_by = data;
      this.$emit("afterSelectsort", data);
    },
  },
};
</script>
<style scoped>
.tagam-sort-sheet {
  background: linear-gradient(180deg, #fbf6ef 0%, #f6efe3 100%);
  border-radius: 24px 24px 0 0;
  border: 1px solid rgba(113, 74, 24, 0.08);
  border-bottom: 0;
  box-shadow: 0 -18px 40px rgba(87, 52, 18, 0.12);
  overflow: hidden;
}

.tagam-sort-sheet__section {
  position: relative;
  padding: 22px 16px 18px;
}

.tagam-sort-sheet__section::before {
  content: "";
  position: absolute;
  top: 10px;
  left: 50%;
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: rgba(113, 74, 24, 0.18);
  transform: translateX(-50%);
}

.tagam-sort-sheet__title {
  padding: 0 4px 12px;
  color: #9e5a1f;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.tagam-sort-sheet__list {
  background: transparent;
}

.tagam-sort-sheet__item {
  min-height: 54px;
  padding: 0 4px;
  border-bottom: 1px solid rgba(113, 74, 24, 0.08);
}

.tagam-sort-sheet__item:last-child {
  border-bottom: 0;
}

:deep(.tagam-sort-sheet .q-item__label) {
  color: #24180f;
  font-weight: 600;
}

:deep(.tagam-sort-sheet .q-radio__inner) {
  color: #cf6f19;
}
</style>
