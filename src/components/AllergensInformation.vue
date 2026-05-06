<template>
  <q-dialog
    v-model="dialog"
    persistent
    @before-show="beforeShow"
    @before-hide="beforeClose"
    transition-show="fade"
    transition-hide="fade"
    full-width
  >
    <q-card>
      <q-toolbar class="shadow-1x border-bottom">
        <q-toolbar-title class="text-subtitle2 text-weight-bold">
          {{ $t("More product information") }}
        </q-toolbar-title>
        <q-btn icon="close" flat round dense v-close-popup></q-btn>
      </q-toolbar>

      <q-card-section>
        <q-list dense separator>
          <q-item
            v-for="items in getData"
            :key="items"
            clickable
            v-ripple:purple
          >
            <q-item-section v-if="allergen_data[items]">
              {{ allergen_data[items] }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "AllergensInformation",
  data() {
    return {
      dialog: false,
      data: [],
      loading: false,
      merchant_id: "",
      item_id: "",
      allergen_data: [],
    };
  },
  computed: {
    getData() {
      return this.data;
    },
  },
  methods: {
    show(data, merchant_id, item_id) {
      this.dialog = data;
      this.merchant_id = merchant_id;
      this.item_id = item_id;
    },
    beforeShow() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "getAllergenInfo",
        "merchant_id=" + this.merchant_id + "&item_id=" + this.item_id
      )
        .then((data) => {
          this.data = data.details.allergen;
          this.allergen_data = data.details.allergen_data;
        })
        .catch((error) => {})
        .then((data) => {
          this.loading = false;
        });
    },
    beforeClose() {
      this.data = [];
      this.allergen_data = [];
    },
  },
};
</script>
