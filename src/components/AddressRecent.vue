<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    @show="onShow"
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-hide="onBeforeHide"
    @before-show="onBeforeShow"
  >
    <q-card class="tagam-address-picker-sheet" style="height: calc(95vh)">
      <q-card-section class="q-pa-none q-pt-sm">
        <q-toolbar class="q-gutter-x-sm">
          <q-btn
            @click="handleBack"
            dense
            icon="eva-arrow-back-outline"
            unelevated
            flat
          />

          <template v-if="isSearchView">
            <q-input
              v-model="q"
              ref="ref_search"
              :placeholder="$t('Search location')"
              dense
              outlined
              color="primary"
              bg-color="grey-1"
              class="input-borderlessx full-width"
              :loading="awaitingSearch"
              rounded
              clearable
              @clear="focusSearchInput"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-else>
            <q-toolbar-title>
              {{ $t("Add or choose an address") }}
            </q-toolbar-title>
          </template>
        </q-toolbar>
      </q-card-section>

      <q-card-section style="height: 70vh" class="scroll relative-position">
        <template v-if="isSearchView">
          <q-list separator>
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
                  <q-item-label class="text-caption line-normal text-grey">
                    {{ items.addressLine1 }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>

          <div
            v-if="isNoresults"
            class="text-center q-pa-md absolute-center full-width"
          >
            <div class="text-h6 line-normal text-weight-bold text-dark">
              {{ $t("Sorry, we couldn't find any results") }}
            </div>
            <div class="text-caption text-grey">
              {{ $t("try different search keyword") }}
            </div>
          </div>
        </template>

        <template v-else>
          <div class="tagam-address-picker q-gutter-y-md">
            <section class="tagam-address-picker__section">
              <div class="tagam-address-picker__title">
                {{ $t("Current location") }}
              </div>
              <q-list separator class="tagam-address-picker__card">
                <q-item clickable v-ripple:purple @click="getLocation">
                  <q-item-section avatar top>
                    <q-avatar
                      color="grey-1"
                      text-color="blue-grey-6"
                      icon="eva-navigation-2-outline"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle2 text-weight-bold">
                      {{ $t("Current location") }}
                    </q-item-label>
                    <q-item-label caption>{{
                      $t("Detect automatically")
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </section>

            <section class="tagam-address-picker__section" v-if="is_login">
              <div class="tagam-address-picker__title">
                {{ $t("Saved addresses") }}
              </div>
              <div v-if="!ClientStore.hasData" class="tagam-address-picker__empty">
                <NoResults
                  :message="$t('No Saved Addresses')"
                  :description="
                    $t('Add your delivery address to place an order quickly!')
                  "
                ></NoResults>
              </div>
              <q-list v-else separator class="tagam-address-picker__card">
                <template v-for="items in ClientStore.addressList" :key="items">
                  <q-item clickable v-ripple:purple @click="setLocation(items)">
                    <q-item-section avatar top>
                      <q-avatar
                        color="grey-1"
                        text-color="blue-grey-6"
                        icon="eva-pin-outline"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-subtitle2 text-weight-bold">
                        {{ items.address_label }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ items.formatted_address }}
                      </q-item-label>
                      <q-item-label class="text-caption">
                        {{ items.street_number }} {{ items.street_name }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </section>

            <section class="tagam-address-picker__section">
              <div class="tagam-address-picker__title">
                {{ $t("New address") }}
              </div>
              <q-list separator class="tagam-address-picker__card">
                <q-item clickable v-ripple @click="openSearch">
                  <q-item-section avatar>
                    <q-avatar
                      color="grey-1"
                      text-color="blue-grey-6"
                      icon="search"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle2 text-weight-bold">
                      {{ $t("Search location") }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-ripple :to="mapRoute">
                  <q-item-section avatar>
                    <q-avatar
                      color="grey-1"
                      text-color="blue-grey-6"
                      icon="eva-map-outline"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle2 text-weight-bold">
                      {{ $t("Choose on map") }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </section>
          </div>
        </template>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useLocationStore } from "stores/LocationStore";
import { useClientStore } from "stores/ClientStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "AddressRecent",
  props: ["map_provider", "recent_addresses", "is_login", "is_addnew", "redirect"],
  components: {
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
  },
  data() {
    return {
      modal: false,
      q: "",
      data: [],
      loading: false,
      awaitingSearch: false,
      view: "overview",
    };
  },
  setup() {
    const LocationStore = useLocationStore();
    const ClientStore = useClientStore();
    return { LocationStore, ClientStore };
  },
  computed: {
    isSearchView() {
      return this.view === "search";
    },
    mapRoute() {
      const query = { is_addnew: this.is_addnew ? 1 : 0 };
      if (this.redirect) {
        query.url = this.redirect;
      }
      return {
        path: "/location/map",
        query,
      };
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
    onBeforeShow() {
      if (!this.is_login) {
        return;
      }

      if (!this.ClientStore.data) {
        this.ClientStore.getAddress();
      }
    },
    onBeforeHide() {
      this.q = "";
      this.data = [];
      this.view = "overview";
    },
    onShow() {
      if (this.isSearchView) {
        this.focusSearchInput();
      }
    },
    focusSearchInput() {
      this.$nextTick(() => {
        this.$refs.ref_search?.focus();
      });
    },
    handleBack() {
      if (this.isSearchView) {
        this.view = "overview";
        this.q = "";
        this.data = [];
        this.awaitingSearch = false;
        return;
      }
      this.modal = false;
    },
    openSearch() {
      this.view = "search";
      this.focusSearchInput();
    },
    ChooseLocation(value) {
      if (this.map_provider == "google.maps") {
        APIinterface.showLoadingBox("", this.$q);
        APIinterface.getLocationDetails(value.id, value.description)
          .then((data) => {
            const results_data = data.details.data;
            const location_coordinates = {
              lat: parseFloat(results_data.latitude),
              lng: parseFloat(results_data.longitude),
            };
            let place_data = results_data.parsed_address;
            place_data.place_id = results_data.place_id;
            place_data.latitude = results_data.latitude;
            place_data.longitude = results_data.longitude;

            this.$emit(
              "afterChooseaddress",
              {
                place_data: place_data,
                location_coordinates: location_coordinates,
              },
              true
            );
            this.modal = false;
          })
          .catch((error) => {
            APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
          })
          .then((data) => {
            APIinterface.hideLoadingBox(this.$q);
          });
      } else {
        this.reverseGeocoding(value.latitude, value.longitude);
      }
    },
    async getLocation() {
      console.log("getLocation");
      try {
        APIinterface.showLoadingBox("", this.$q);
        let location = null;
        if (this.$q.capacitor) {
          location = await this.LocationStore.fetchLocation(this.$t);
        } else {
          location = await this.LocationStore.fetchWebLocation(this.$t);
        }
        APIinterface.hideLoadingBox(this.$q);
        console.log("location", location);
        this.reverseGeocoding(location.latitude, location.longitude);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    async reverseGeocoding(lat, lng) {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const place_data = await this.LocationStore.reverseGeocoding(lat, lng);
        const location_coordinates = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        };
        this.$emit(
          "afterChooseaddress",
          {
            place_data: place_data,
            location_coordinates: location_coordinates,
          },
          true
        );

        APIinterface.hideLoadingBox(this.$q);
        this.modal = false;
      } catch (error) {
        APIinterface.hideLoadingBox(this.$q);
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      }
    },
    setLocation(value) {
      const place_data = value;
      const location_coordinates = {
        lat: parseFloat(value.latitude),
        lng: parseFloat(value.longitude),
      };
      this.$emit(
        "afterChooseaddress",
        {
          place_data: place_data,
          location_coordinates: location_coordinates,
        },
        false
      );
      this.modal = false;
    },
  },
};
</script>

<style scoped>
.tagam-address-picker__title {
  font-size: 13px;
  font-weight: 700;
  color: #7e6d5b;
  margin-bottom: 8px;
}
.tagam-address-picker__card {
  border: 1px solid rgba(113, 74, 24, 0.08);
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
}
.tagam-address-picker__empty {
  min-height: 180px;
  display: flex;
  align-items: center;
}

:global(body.body--dark) .tagam-address-picker-sheet {
  background: var(--tagam-surface);
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-address-picker-sheet .q-toolbar {
  background: rgba(36, 29, 26, 0.96);
  color: var(--tagam-text);
  border-bottom: 1px solid var(--tagam-stroke);
}

:global(body.body--dark) .tagam-address-picker__title,
:global(body.body--dark) .tagam-address-picker-sheet .text-subtitle2,
:global(body.body--dark) .tagam-address-picker-sheet .text-h6,
:global(body.body--dark) .tagam-address-picker-sheet .text-weight-bold {
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-address-picker__card {
  background: var(--tagam-surface-raised);
  border-color: var(--tagam-stroke);
}

:global(body.body--dark) .tagam-address-picker-sheet .q-item,
:global(body.body--dark) .tagam-address-picker-sheet .q-list {
  color: var(--tagam-text-soft);
  background: transparent !important;
}

:global(body.body--dark) .tagam-address-picker-sheet .q-avatar {
  background: rgba(255, 239, 231, 0.06) !important;
  color: var(--tagam-primary) !important;
}

:global(body.body--dark) .tagam-address-picker-sheet .q-item__label,
:global(body.body--dark) .tagam-address-picker-sheet .q-toolbar__title,
:global(body.body--dark) .tagam-address-picker-sheet .q-item__section {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-address-picker-sheet .q-field__control {
  background: var(--tagam-surface-raised) !important;
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-address-picker-sheet .text-grey,
:global(body.body--dark) .tagam-address-picker-sheet .text-caption,
:global(body.body--dark) .tagam-address-picker-sheet .q-item__label--caption {
  color: var(--tagam-text-muted) !important;
}
</style>
