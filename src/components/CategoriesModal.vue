<template>
  <q-dialog v-model="modal" position="bottom">
    <q-card class="q-pl-md q-pr-md">
      <q-toolbar class="text-primary top-toolbar q-pl-md" dense>
        <q-toolbar-title class="text-dark text-weight-bold">
          {{ $t("Categories") }}
        </q-toolbar-title>
        <q-space></q-space>
        <q-btn icon="close" flat round dense v-close-popup color="dark"></q-btn>
      </q-toolbar>
      <q-list separator>
        <q-item
          v-for="items in data"
          :key="getCategoryKey(items)"
          clickable
          @click="this.$emit('afterCategoryselect', items)"
          :class="{ 'text-primary': String(active_category) === String(getCategoryKey(items)) }"
        >
          <q-item-section class="text-weight-regular text-subtitle2">
            {{ items.category_name }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script>
import { useMenuStore } from "stores/MenuStore";

export default {
  name: "CategoriesModal",
  props: ["data", "active_category"],
  data() {
    return {
      modal: false,
    };
  },
  setup() {
    const MenuStore = useMenuStore();
    return { MenuStore };
  },
  methods: {
    getCategoryKey(items) {
      return String(
        items?.category_uiid ??
          items?.cat_id ??
          items?.category_id ??
          items?.id ??
          ""
      );
    },
  },
};
</script>
