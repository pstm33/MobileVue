<template>
  <q-dialog v-model="modal" position="bottom">
    <q-card class="q-pl-md q-pr-md">
      <q-toolbar class="text-primary top-toolbar q-pl-md" dense>
        <q-toolbar-title class="tagam-text-main text-weight-bold">
          {{ $t("Categories") }}
        </q-toolbar-title>
        <q-space></q-space>
        <q-btn icon="close" flat round dense v-close-popup color="dark"></q-btn>
      </q-toolbar>
      <q-list separator>
        <q-item
          v-for="items in data"
          :key="categoryKey(items)"
          clickable
          @click="this.$emit('afterCategoryselect', items)"
          :class="{ 'text-primary': active_category == categoryKey(items) }"
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
    categoryKey(category) {
      if (!category) {
        return "";
      }

      if (category.category_uiid) {
        return String(category.category_uiid);
      }

      if (category.category_uuid) {
        return String(category.category_uuid);
      }

      if (
        category.cat_id !== undefined &&
        category.cat_id !== null &&
        category.cat_id !== ""
      ) {
        return `cat-${category.cat_id}`;
      }

      return `category-${String(category.category_name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
    },
  },
};
</script>




