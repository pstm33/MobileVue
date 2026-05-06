<template>
  <q-select
    v-model="id"
    behavior="menu"
    use-input
    hide-selected
    fill-input
    borderless
    input-debounce="500"
    emit-value
    map-options
    :options="data"
    @filter="filterData"
    :loading="this.loading ?? false"
    :label="label"
    @update:model-value="updateData"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          {{ $t("No results") }}
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";

export default {
  name: "LocationSelection",
  props: ["method", "label", "auto_load", "params"],
  emits: ["update:id"],
  data() {
    return {
      id: null,
      loading: false,
      data: [],
      initial_data: [],
    };
  },
  mounted() {
    if (!this.auto_load) {
      return false;
    }
    this.fetchData(this.params ?? null);
  },
  methods: {
    clearSelect() {
      this.id = null;
      this.data = [];
      this.initial_data = [];
    },
    async fetchData(params) {
      try {
        if (!params) {
          console.log("emty params", this.method);
          return;
        }
        this.loading = true;
        const response = await APIinterface.fetchPost(
          `${config.api_location}/${this.method}`,
          params
        );
        this.data = response.details.data;
        this.initial_data = response.details.data;
        return true;
      } catch (error) {
        return false;
      } finally {
        this.loading = false;
      }
    },
    filterData(val, update, abort) {
      if (!val) {
        update(() => {
          this.data = this.initial_data;
        });
        return;
      }
      if (!val || val.length < 2) {
        return abort();
      }
      update(() => {
        const needle = val.toLowerCase();
        this.data = this.initial_data.filter((v) =>
          v.label.toLowerCase().includes(needle)
        );
      });
    },
    updateData() {
      this.$emit("update:id", this.id);
      this.$emit("afterSelect", this.id);
    },
  },
};
</script>
