<template>
  <template v-if="active">
    <q-btn
      round
      class="tagam-fav-resto-btn tagam-fav-resto-btn--active"
      @click.stop="addTofav()"
      color="primary"
      unelevated
      text-color="white"
      icon="favorite"
      :size="size"
      :loading="loading"
    />
  </template>
  <template v-else>
    <q-btn
      round
      class="tagam-fav-resto-btn"
      @click.stop="addTofav()"
      color="white"
      unelevated
      text-color="primary"
      icon="favorite_border"
      :size="size"
      :loading="loading"
    />
  </template>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useHaptics } from "src/composables/useHaptics";

export default {
  name: "FavsResto",
  props: ["merchant_id", "active", "layout", "size", "data"],
  setup() {
    const haptics = useHaptics();
    return { haptics };
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    addTofav() {
      this.haptics.impact("light");
      if (!auth.authenticated()) {
        this.haptics.warningSoft();
        APIinterface.notify(
          "dark",
          this.$t("Login to save it to your favorites"),
          "eva-info-outline",
          this.$q
        );
        return;
      }
      this.loading = true;
      APIinterface.SaveStore(this.merchant_id)
        .then((data) => {
          this.haptics.success();
          this.$emit("afterSavefav", this.data, data.details.found);
        })
        .catch((error) => {
          this.haptics.warning();
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>



