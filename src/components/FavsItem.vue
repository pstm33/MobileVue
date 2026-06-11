<template>
  <template v-if="active">
    <template v-if="layout === 1">
      <q-btn
        @click.stop="addTofav()"
        class="tagam-fav-item-btn tagam-fav-item-btn--layout-1 tagam-fav-item-btn--active"
        round
        color="white"
        text-color="primary"
        size="md"
        icon="favorite"
        :loading="loading"
        unelevated
      />
    </template>
    <template v-else-if="layout === 2">
      <q-btn
        @click.stop="addTofav()"
        class="tagam-fav-item-btn tagam-fav-item-btn--active"
        :loading="loading"
        unelevated
        round
        color="primary"
        text-color="white"
        icon="favorite"
        size="sm"
        dense
      />
    </template>
    <template v-else-if="layout === 3">
      <q-btn
        @click.stop="addTofav()"
        class="tagam-fav-item-btn tagam-fav-item-btn--active"
        :loading="loading"
        round
        unelevated
        color="secondary"
        text-color="mygrey"
        size="sm"
        icon="favorite"
      />
    </template>
  </template>
  <template v-else>
    <template v-if="layout === 1">
      <q-btn
        @click.stop="addTofav()"
        class="tagam-fav-item-btn tagam-fav-item-btn--layout-1"
        round
        color="white"
        text-color="primary"
        size="md"
        icon="favorite_border"
        :loading="loading"
        unelevated
      />
    </template>
    <template v-else-if="layout === 2">
      <q-btn
        @click.stop="addTofav()"
        class="tagam-fav-item-btn"
        :loading="loading"
        round
        unelevated
        color="white"
        text-color="primary"
        size="sm"
        icon="favorite_border"
      />
    </template>
    <template v-else-if="layout === 3">
      <q-btn
        @click.stop="addTofav()"
        class="tagam-fav-item-btn"
        :loading="loading"
        round
        unelevated
        color="white"
        text-color="primary"
        size="sm"
        icon="favorite_border"
      />
    </template>
  </template>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useHaptics } from "src/composables/useHaptics";

export default {
  name: "FavsItem",
  props: ["layout", "item_token", "cat_id", "active", "size", "data", "row"],
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
      /* eslint-disable */
      this.haptics.impact("light");
      if (auth.authenticated()) {
        this.loading = true;
        APIinterface.addTofav(this.item_token, this.cat_id)
          .then((data) => {
            this.haptics.success();
            this.$emit("afterSavefav", this.data, data.details.found, this.row);
            this.$emit("onSaved", this.data, data.details.found);
          })
          .catch((error) => {
            this.haptics.warning();
            APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
          })
          .then((data) => {
            this.loading = false;
          });
      } else {
        this.haptics.warningSoft();
        APIinterface.notify(
          "dark",
          this.$t("Login to save this to your favorites"),
          "eva-info-outline",
          this.$q
        );
      }
    },
  },
};
</script>



