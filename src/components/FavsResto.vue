<template>
  <template v-if="active">
    <q-btn
      round
      @click.stop="addTofav()"
      color="transparent"
      unelevated
      text-color="primary"
      icon="favorite"
      :size="size"
      :loading="loading"
    />
  </template>
  <template v-else>
    <q-btn
      round
      @click.stop="addTofav()"
      color="mygrey"
      unelevated
      text-color="blue-grey-6"
      icon="favorite_border"
      :size="size"
      :loading="loading"
    />
  </template>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

export default {
  name: "FavsResto",
  props: ["merchant_id", "active", "layout", "size", "data"],
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    addTofav() {
      if (!auth.authenticated()) {
        APIinterface.notify(
          "dark",
          this.$t("Login to save it to your favorites"),
          "error",
          this.$q
        );
        return;
      }
      this.loading = true;
      APIinterface.SaveStore(this.merchant_id)
        .then((data) => {
          this.$emit("afterSavefav", this.data, data.details.found);
        })
        .catch((error) => {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
