<template>
  <q-dialog
    v-model="modal"
    :position="isMaximize ? 'standard' : 'top'"
    transition-show="fade"
    @show="onShow"
    :maximized="isMaximize"
    transition-hide="fade"
    @before-hide="onBeforeHide"
    class="relative-position"
  >
    <div
      class="q-pa-smx bg-white none-field-hightlight q-pt-xs q-pb-xs"
      style="border-radius: inherit"
    >
      <q-toolbar>
        <q-btn
          @click="modal = false"
          dense
          icon="eva-arrow-back-outline"
          size="md"
          unelevated
          flat
          class="q-mr-sm"
        />

        <q-input
          v-model="q"
          ref="ref_search"
          :placeholder="$t('Enter your location')"
          dense
          outlined
          color="primary"
          bg-color="grey-1"
          class="full-width input-borderless"
          :loading="awaitingSearch"
          rounded
          clearable
          @clear="onShow"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-toolbar>

      <div
        v-if="isNoresults"
        class="text-center q-pa-md absolute-center full-width"
      >
        <div class="text-h6 line-normal text-weight-bold text-dark">
          {{ $t("We couldn't find any results") }}
        </div>
        <div class="text-caption text-grey">
          {{ $t("try different search keyword") }}
        </div>
      </div>

      <q-list v-if="isMaximize" separator class="q-pl-md q-pr-md q-mt-md">
        <template v-for="items in data" :key="items">
          <q-item clickable v-ripple @click="ChooseLocation(items)">
            <q-item-section avatar>
              <q-avatar
                color="grey-1"
                text-color="blue-grey-6"
                icon="eva-pin-outline"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-subtitle2 text-weight-bold">{{
                items.description
              }}</q-item-label>
              <q-item-label caption>
                {{ items.addressLine1 }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </div>
  </q-dialog>
</template>

<script>
import { AppVisibility } from "quasar";
import APIinterface from "src/api/APIinterface";

export default {
  name: "SearchGeolocation",
  props: ["map_provider"],
  data() {
    return {
      q: "",
      modal: false,
      awaitingSearch: false,
      data: [],
      loading: false,
    };
  },
  setup() {
    return {};
  },
  computed: {
    isMaximize() {
      if (this.q) {
        return true;
      }
      return false;
    },
    isNoresults() {
      if (this.q && !this.awaitingSearch) {
        if (Object.keys(this.data).length > 0) {
        } else {
          return true;
        }
      }
      return false;
    },
  },
  watch: {
    q(newdata, oldata) {
      if (!this.awaitingSearch) {
        if (
          typeof this.q === "undefined" ||
          this.q === null ||
          this.q === "" ||
          this.q === "null" ||
          this.q === "undefined"
        ) {
          this.data = [];
          return false;
        }
        setTimeout(() => {
          console.log(this.q);
          APIinterface.getlocationAutocomplete(this.q)
            .then((data) => {
              this.data = data.details.data;
            })
            .catch((error) => {})
            .then((data) => {
              this.awaitingSearch = false;
            });
        }, 1000);
      }
      this.awaitingSearch = true;
    },
  },
  methods: {
    onShow() {
      this.$refs.ref_search.focus();
    },
    onBeforeHide() {
      this.q = "";
      this.data = [];
    },
    ChooseLocation(value) {
      if (this.map_provider == "google.maps") {
        APIinterface.showLoadingBox("", this.$q);
        APIinterface.getLocationDetails(value.id, value.description)
          .then((data) => {
            const results = data.details.data;
            this.$emit("afterLocationdetails", results);
            this.modal = false;
          })
          .catch((error) => {
            APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
          })
          .then((data) => {
            APIinterface.hideLoadingBox(this.$q);
          });
      } else {
        this.modal = false;
        this.$emit("afterChooseaddress", {
          lat: value.latitude,
          lng: value.longitude,
        });
      }
    },
  },
};
</script>
