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
    <q-card class="tagam-address-recent-sheet">
      <q-card-section class="q-pa-none q-pt-sm tagam-address-recent-head">
        <q-toolbar class="q-gutter-x-sm tagam-address-recent-toolbar">
          <q-btn
            @click="modal = false"
            dense
            icon="eva-arrow-back-outline"
            unelevated
            flat
          />

          <q-input
            v-model="q"
            ref="ref_search"
            :placeholder="$t('Search location')"
            dense
            outlined
            color="primary"
            class="input-borderlessx full-width tagam-address-search-input"
            :loading="awaitingSearch"
            rounded
            clearable
            @clear="onShow"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-btn
                v-if="!isMaximize"
                no-caps
                dense
                flat
                icon="eva-mic-outline"
                color="primary"
              ></q-btn>
            </template>
          </q-input>
        </q-toolbar>
      </q-card-section>

      <q-card-section class="scroll relative-position tagam-address-recent-body">
        <template v-if="isMaximize">
          <q-list separator>
            <template v-for="items in data" :key="items">
              <q-item clickable v-ripple @click="ChooseLocation(items)">
                <q-item-section avatar>
                  <q-avatar
                    class="tagam-address-recent-avatar"
                    text-color="primary"
                    icon="eva-pin-outline"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-subtitle2 text-weight-bold">{{
                    items.description
                  }}</q-item-label>
                  <q-item-label class="text-caption line-normal tagam-text-muted">
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
            <div class="text-h6 line-normal text-weight-bold tagam-text-main">
              {{ $t("Sorry, we couldn't find any results") }}
            </div>
            <div class="text-caption tagam-text-muted">
              {{ $t("try different search keyword") }}
            </div>
          </div>
        </template>

        <template v-else>
          <q-tabs
            v-model="tab"
            dense
            narrow-indicator
            no-caps
            active-color="'blue-grey-6"
            active-bg-color="orange-1"
            indicator-color="transparent"
            active-class="text-blue-grey-6"
            class="custom-tabs"
          >
            <q-tab
              name="recent_search"
              :label="$t('Recent searches')"
              class="radius28 tagam-surface-muted"
            />
            <q-tab
              v-if="is_login"
              name="saved"
              :label="$t('Saved')"
              class="radius28 tagam-surface-muted"
            />
          </q-tabs>

          <q-tab-panels
            v-model="tab"
            animated
            transition-prev="slide-down"
            transition-next="slide-up"
          >
            <q-tab-panel name="recent_search">
              <q-list separator>
                <q-item clickable v-ripple:purple @click="getLocation">
                  <q-item-section avatar top>
                    <q-avatar
                      class="tagam-address-recent-avatar"
                      text-color="primary"
                      icon="eva-navigation-2-outline"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle2 text-weight-bold">
                      {{ $t("Current location") }}
                    </q-item-label>
                    <q-item-label caption>{{ $t("Home") }}</q-item-label>
                  </q-item-section>
                </q-item>

                <template v-for="items in recentAddressList" :key="items">
                  <q-item clickable v-ripple:purple @click="setLocation(items)">
                    <q-item-section avatar>
                      <q-avatar
                      class="tagam-address-recent-avatar"
                      text-color="primary"
                        icon="eva-pin-outline"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-subtitle2 text-weight-bold">
                        {{ formatAddressTitle(items) }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ formatAddressSubtitle(items) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-tab-panel>

            <q-tab-panel name="saved" v-if="is_login">
              <div v-if="!ClientStore.hasData" style="height: 50vh">
                <NoResults
                  :message="$t('No Saved Addresses')"
                  :description="
                    $t('Add your delivery address to place an order quickly!')
                  "
                ></NoResults>
              </div>

              <q-list separator>
                <template v-for="items in savedAddressList" :key="items">
                  <q-item clickable v-ripple:purple @click="setLocation(items)">
                    <q-item-section avatar top>
                      <q-avatar
                        class="tagam-address-recent-avatar"
                        text-color="primary"
                        icon="eva-pin-outline"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-subtitle2 text-weight-bold">
                        {{ formatAddressTitle(items) }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ formatAddressSubtitle(items) }}
                      </q-item-label>
                      <q-item-label class="text-caption">
                        {{ formatStreet(items) }}
                      </q-item-label>
                      <q-item-label v-if="items.delivery_instructions" class="text-caption">
                        {{ items.delivery_instructions }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-card-section>

      <div
        class="tagam-address-recent-footer fixed-bottom q-pa-sm row q-gutter-x-md items-center"
      >
        <q-btn
          :label="$t('Choose on map')"
          no-caps
          color="primary"
          text-color="white"
          icon="eva-map-outline"
          unelevated
          :to="{
            path: '/location/map',
            query: {
              is_addnew: this.is_addnew ? 1 : 0,
              url: redirect || '/checkout',
            },
          }"
          class="fit tagam-address-map-btn"
        ></q-btn>
      </div>
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
  props: [
    "map_provider",
    "recent_addresses",
    "is_login",
    "is_addnew",
    "redirect",
  ],
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
      tab: "recent_search",
    };
  },
  setup() {
    const LocationStore = useLocationStore();
    const ClientStore = useClientStore();
    return { LocationStore, ClientStore };
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
    recentAddressList() {
      return this.normalizeAddressList(this.recent_addresses);
    },
    savedAddressList() {
      return this.normalizeAddressList(this.ClientStore?.addressList);
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
    normalizeAddressList(list) {
      if (!Array.isArray(list)) {
        return [];
      }
      return list.filter((item) => {
        if (!item || typeof item !== "object") {
          return false;
        }
        return Boolean(
          item.place_text ||
            item.address_label ||
            item.formatted_address ||
            item.street_name ||
            item.latitude
        );
      });
    },
    formatAddressTitle(value) {
      return (
        value?.place_text ||
        value?.address_label ||
        value?.formatted_address ||
        this.$t("Selected location")
      );
    },
    formatAddressSubtitle(value) {
      return (
        value?.formatted_address ||
        [value?.street_number, value?.street_name].filter(Boolean).join(" ") ||
        value?.place_name ||
        ""
      );
    },
    formatStreet(value) {
      return [value?.street_number, value?.street_name].filter(Boolean).join(" ");
    },
    onBeforeShow() {
      if (!this.is_login) {
        return;
      }
      this.ClientStore.getAddress();
    },
    onBeforeHide() {
      this.q = "";
      this.data = [];
    },
    onShow() {
      this.q = "";
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
      if (!value) {
        return;
      }
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
.tagam-address-recent-sheet {
  height: min(95vh, 820px);
  border-radius: 28px 28px 0 0;
  background:
    radial-gradient(circle at 12% 0%, rgba(255, 90, 47, 0.08), transparent 220px),
    var(--tagam-surface);
  color: var(--tagam-text);
  box-shadow: 0 -20px 48px rgba(17, 24, 39, 0.16);
}

.tagam-address-recent-head {
  position: sticky;
  top: 0;
  z-index: 2;
  background: linear-gradient(180deg, var(--tagam-surface) 0%, var(--tagam-surface-glass) 100%);
  border-bottom: 1px solid var(--tagam-border);
}

.tagam-address-recent-toolbar {
  min-height: 68px;
}

.tagam-address-search-input :deep(.q-field__control) {
  min-height: 50px;
  border-radius: var(--tagam-radius-pill);
  background: var(--tagam-surface-muted);
  box-shadow: inset 0 0 0 1px var(--tagam-border);
}

.tagam-address-search-input :deep(.q-field__native),
.tagam-address-search-input :deep(.q-field__marginal) {
  color: var(--tagam-text);
}

.tagam-address-recent-body {
  height: calc(95vh - 156px);
  padding-bottom: 96px;
}

.tagam-address-recent-avatar {
  background: var(--tagam-primary-soft);
  box-shadow: inset 0 0 0 1px rgba(255, 89, 56, 0.08);
}

.tagam-address-recent-footer {
  border-top: 1px solid var(--tagam-border);
  background: color-mix(in srgb, var(--tagam-surface) 94%, transparent);
  backdrop-filter: blur(18px);
}

.tagam-address-map-btn {
  min-height: 56px;
  border-radius: var(--tagam-radius-pill);
  box-shadow: 0 16px 32px var(--tagam-primary-shadow);
}

.custom-tabs .q-tab {
  margin-right: 12px;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid var(--tagam-border);
  border-radius: var(--tagam-radius-pill);
  color: var(--tagam-text-muted);
}

.custom-tabs .q-tab:last-child {
  margin-right: 0;
}

.custom-tabs :deep(.q-tab--active) {
  background: var(--tagam-primary-soft);
  color: var(--tagam-primary);
  box-shadow: 0 12px 26px rgba(255, 89, 56, 0.12);
}
.q-tabs__content--align-justify .q-tab {
  flex: initial !important;
}
</style>




