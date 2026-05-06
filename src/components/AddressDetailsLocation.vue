<template>
  <q-dialog
    v-model="modal"
    maximized
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="beforeShow"
    @show="onShow"
  >
    <q-card class="tagam-address-details-sheet">
      <q-toolbar
        class="tagam-address-details-sheet__toolbar bg-white text-dark border-bottom"
        style="position: sticky; top: 0; z-index: 10"
      >
        <q-btn
          flat
          round
          icon="close"
          class="q-mr-sm"
          :color="$q.dark.mode ? 'white' : 'dark'"
          v-close-popup
        />

        <q-toolbar-title>
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Address details") }}
          </div>
        </q-toolbar-title>
      </q-toolbar>
      <div v-if="enabled_map_selection" class="relative-position fitx">
        <MapsComponents
          ref="mapRef"
          class="maps"
          :keys="maps_config?.key || ''"
          :provider="maps_config?.provider || ''"
          :zoom="maps_config?.zoom || ''"
          :language="maps_config?.language || ''"
          :center="center"
          :markers="marker_position"
          :map_controls="false"
          :controls_center="false"
          :zoom_control="true"
          :adjust_location="true"
          @after-selectmap="afterSelectmap"
          @drag-marker="dragMarker"
          @after-getlocation="afterGetlocation"
          @on-adjustlocation="onAdjustlocation"
          @set-busy="setBusy"
          @set-error="setError"
        />
      </div>

      <q-card-section class="tagam-address-details-sheet__body bg-white myform">
        <q-form @submit="onSubmit" @reset="onReset">
          <div class="text-weight-bold text-subtitle2 line-normal">
            {{ $t("Label your address") }}
          </div>
          <div class="text-caption text-grey">
            {{ $t("Give it a nickname to easily find it") }}
          </div>

          <q-input
            v-model="address_label"
            color="dark"
            :label="$t('Label (e.g,. House, Work, Office)')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
            borderless
          />
          <div class="text-weight-bold text-subtitle2 line-normal">
            {{ $t("Address details") }}
          </div>
          <div class="text-caption text-grey">
            {{ $t("Help the courier find you faster") }}
          </div>
          <q-space class="q-pa-xs"></q-space>

          <q-input
            v-model="house_number"
            color="dark"
            :label="$t('House number')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
            borderless
          />

          <q-input
            v-model="street_name"
            color="dark"
            :label="$t('Street name')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
            borderless
          />

          <q-input
            v-model="street_number"
            color="dark"
            :label="$t('Street number')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
            borderless
          />

          <div class="q-gutter-y-md">
            <!-- state_id=>{{ state_id }} -->
            <LocationSelection
              ref="ref_state"
              v-model:id="state_id"
              method="fetchState"
              :auto_load="true"
              :label="$t('State')"
              :params="{
                country_id: countryID,
              }"
              @after-select="afterSelectState"
            ></LocationSelection>

            <!-- city_id=>{{ city_id }} -->
            <LocationSelection
              ref="ref_city"
              v-model:id="city_id"
              method="fetchCity"
              :auto_load="true"
              :label="$t('City')"
              @after-select="afterSelectCity"
            ></LocationSelection>

            <!-- area_id=>{{ area_id }} -->
            <LocationSelection
              ref="ref_area"
              v-model:id="area_id"
              method="fetchArea"
              :auto_load="false"
              :label="$t('Disctrict/Area')"
              @after-select="afterSelectArea"
            ></LocationSelection>
          </div>
          <q-space class="q-pa-sm"></q-space>

          <q-input
            v-model="postal_code"
            color="dark"
            label="Zip Code"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
            borderless
            :loading="zip_loading"
          />

          <q-input
            v-model="location_name"
            color="dark"
            :label="$t('Aparment, suite or floor')"
            borderless
          />
          <q-space class="q-pa-sm"></q-space>

          <template v-if="!enabled_map_selection">
            <q-input
              v-model="address_lat"
              color="dark"
              label="Latitude"
              :rules="[
                (val) =>
                  (val && val.length > 0) || this.$t('This field is required'),
              ]"
              borderless
            />
            <q-input
              v-model="address_lng"
              color="dark"
              label="Longitude"
              :rules="[
                (val) =>
                  (val && val.length > 0) || this.$t('This field is required'),
              ]"
              borderless
            />
          </template>

          <div class="text-weight-bold text-subtitle2 line-normal">
            {{ $t("Delivery instructions") }}
          </div>
          <div class="text-caption text-grey">
            {{ $t("Tell us everything needed for delivery") }}
          </div>
          <q-space class="q-pa-sm"></q-space>

          <q-select
            v-model="delivery_options"
            :options="delivery_options_data"
            :label="$t('Delivery Options')"
            transition-show="fade"
            transition-hide="fade"
            emit-value
            map-options
            borderless
            lazy-rules
          />
          <q-space class="q-pa-sm"></q-space>

          <q-input
            v-model="delivery_instructions"
            color="dark"
            :label="$t('Additional instructions')"
            borderless
            autogrow
          />
          <q-space class="q-pa-xl"></q-space>

          <div
            class="fixed-bottom q-pa-sm border-grey-top1 shadow-1 row q-gutter-x-md items-center"
            :class="{
              'bg-dark': $q.dark.mode,
              'bg-white': !$q.dark.mode,
            }"
          >
            <q-btn
              class="col"
              unelevated
              rounded
              color="secondary"
              size="lg"
              no-caps
              type="submit"
              :loading="loading"
            >
              <div class="text-subtitle2 text-weight-bold q-gutter-x-sm">
                {{ is_address_found ? $t("Update") : $t("Save") }}
              </div>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="modal_pin"
    maximized
    persistent
    transition-show="fade"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="beforeShowPin"
    @before-hide="beforHidePin"
  >
    <q-card class="tagam-address-details-sheet">
      <q-toolbar
        class="tagam-address-details-sheet__toolbar bg-white text-dark border-bottom"
        style="position: sticky; top: 0; z-index: 10"
      >
        <q-btn
          flat
          round
          icon="eva-arrow-back-outline"
          class="q-mr-sm"
          :color="$q.dark.mode ? 'white' : 'dark'"
          v-close-popup
        />

        <q-toolbar-title>
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Adjust location") }}
          </div>
        </q-toolbar-title>
      </q-toolbar>
      <div class="relative-position fit bg-grey-1" style="margin-top: -50px">
        <MapsComponents
          ref="ref_map"
          class="maps"
          :keys="maps_config?.key || ''"
          size="fit"
          :provider="maps_config?.provider || ''"
          :zoom="maps_config?.zoom || ''"
          :language="maps_config?.language || ''"
          :center="center"
          :markers="marker_position"
          :map_controls="true"
          :controls_center="false"
          :zoom_control="false"
          :adjust_location="false"
          @after-selectmap="afterSelectmap"
          @drag-marker="dragMarker"
          @after-getlocation="afterGetlocation"
          @on-adjustlocation="onAdjustlocation"
          @set-busy="setBusy"
          @set-error="setError"
        />
      </div>

      <div
        class="fixed-bottom q-pa-sm border-grey-top1 shadow-1 row q-gutter-x-md items-center my-z-top"
        :class="{
          'bg-dark': $q.dark.mode,
          'bg-white': !$q.dark.mode,
        }"
      >
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label class="text-subtitle2 text-weight-bold">
                {{ $t("Pin your location") }}
              </q-item-label>
              <q-item-label caption>
                {{ $t("Make sure to aim your exact location in the map") }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-skeleton v-if="pin_busy" type="QBtn" class="fit q-pa-md radius28" />
        <q-btn
          v-else
          class="fit"
          unelevated
          rounded
          size="lg"
          no-caps
          @click="confirmLocation"
          :disable="pin_busy"
          :color="pin_busy ? 'blue-grey-6' : 'secondary'"
        >
          <div class="text-subtitle2 text-weight-bold q-gutter-x-sm">
            {{ $t("Confirm Location") }}
          </div>
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { useDataStore } from "src/stores/DataStore";
import { useLocationStore } from "stores/LocationStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import config from "src/api/config";

export default {
  name: "AddressDetailsLocation",
  props: [
    "is_address_found",
    "address_data",
    "maps_config",
    "delivery_options_data",
    "is_addnew",
    "enabled_map_selection",
  ],
  components: {
    MapsComponents: defineAsyncComponent(() =>
      import("components/MapsComponents.vue")
    ),
    LocationSelection: defineAsyncComponent(() =>
      import("components/LocationSelection.vue")
    ),
  },
  data() {
    return {
      modal: false,
      address_label: "",
      delivery_instructions: "",
      formatted_address: "",
      house_number: "",
      street_name: "",
      street_number: "",
      postal_code: "",
      location_name: "",
      state_id: null,
      city_id: null,
      area_id: null,
      zip_loading: false,
      address_lat: null,
      address_lng: null,

      delivery_options: "Hand it to me",
      is_scroll: false,
      marker_position: {},
      center: { lat: 0, lng: 0 },
      modal_pin: false,
      coordinates: null,
      pin_busy: false,
      loading: false,
      resolved_address_data: null,
    };
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const LocationStore = useLocationStore();
    return { DataStore, DataStorePersisted, LocationStore };
  },
  computed: {
    countryID() {
      return this.DataStore.attributes_data?.country_id || null;
    },
  },
  methods: {
    afterSelectState(value) {
      if (this.$refs.ref_city) {
        this.city_id = null;
        this.area_id = null;
        this.$refs.ref_city.clearSelect();
        this.$refs.ref_area.clearSelect();
        this.$refs.ref_city.fetchData({
          state_id: value ?? "",
        });
      }
    },
    afterSelectCity(value) {
      if (this.$refs.ref_area) {
        this.area_id = null;
        this.$refs.ref_area.clearSelect();
        this.$refs.ref_area.fetchData({
          city_id: value ?? "",
        });
      }
    },
    afterSelectArea(value) {
      if (value) {
        this.fetchZip();
      }
    },
    async fetchZip() {
      try {
        this.zip_loading = true;
        const response = await APIinterface.fetchGet(
          `${config.api_location}/fetchZip`,
          {
            area_id: this.area_id,
          }
        );
        this.postal_code = response.details.data.postal_code;
      } catch (error) {
        console.log("error", error);
      } finally {
        this.zip_loading = false;
      }
    },
    async onShow() {
      APIinterface.showLoadingBox("", this.$q);
      this.resolved_address_data = await this.resolveAddressData();

      const sourceAddressData = this.resolved_address_data || this.address_data || {};
      if (this.is_address_found) {
        this.address_label = sourceAddressData?.address_label || "";
        this.house_number = sourceAddressData?.house_number || "";
        this.street_name = sourceAddressData?.street_name || "";
        this.street_number = sourceAddressData?.street_number || "";
        this.postal_code = sourceAddressData?.zip_code || "";
        this.location_name = sourceAddressData?.location_name || "";
        this.delivery_instructions =
          sourceAddressData?.delivery_instructions || "";

        console.log("is_address_found", sourceAddressData);
        if (this.enabled_map_selection) {
        } else {
          this.address_lat = sourceAddressData?.latitude || "";
          this.address_lng = sourceAddressData?.longitude || "";
        }

        this.state_id = String(sourceAddressData?.state_id) || "";
        this.$refs.ref_state.id = this.state_id;
        this.$refs.ref_state.updateData();

        const cityLoaded = await this.$refs.ref_city.fetchData({
          state_id: this.state_id,
        });
        if (cityLoaded) {
          this.city_id = String(sourceAddressData?.city_id) || "";
          this.$refs.ref_city.id = this.city_id;
          this.$refs.ref_city.updateData();
        }

        const areaLoaded = await this.$refs.ref_area.fetchData({
          city_id: this.city_id,
        });
        if (areaLoaded) {
          this.area_id = String(sourceAddressData?.area_id) || "";
          this.$refs.ref_area.id = this.area_id;
          this.$refs.ref_area.updateData();
        }
      } else {
        let state_id = String(sourceAddressData?.state_id) || "";
        let city_id = String(sourceAddressData?.city_id) || "";
        let area_id = String(sourceAddressData?.area_id) || "";
        if (state_id) {
          const stateLoaded = await this.$refs.ref_state.fetchData({
            country_id: this.countryID,
          });
          if (stateLoaded) {
            this.state_id = state_id;
            this.$refs.ref_state.id = state_id;
            this.$refs.ref_state.updateData();
          }
        }

        if (city_id) {
          const cityLoaded = await this.$refs.ref_city.fetchData({
            state_id: state_id,
          });
          if (cityLoaded) {
            this.city_id = city_id;
            this.$refs.ref_city.id = city_id;
            this.$refs.ref_city.updateData();
          }
        }

        if (area_id) {
          const areaLoaded = await this.$refs.ref_area.fetchData({
            city_id: city_id,
          });
          if (areaLoaded) {
            this.area_id = area_id;
            this.$refs.ref_area.id = area_id;
            this.$refs.ref_area.updateData();
          }
        }
      }
      APIinterface.hideLoadingBox(this.$q);
    },
    async resolveAddressData() {
      const baseAddressData = this.address_data || {};
      if (!this.is_address_found) {
        return baseAddressData;
      }

      if (baseAddressData?.place_id) {
        return baseAddressData;
      }

      if (!baseAddressData?.address_uuid) {
        return baseAddressData;
      }

      try {
        const response = await APIinterface.fetchGet(
          `${config.api_location}/fetchLocationAddress`
        );
        const items = response?.details?.data || [];
        const matchedAddress = items.find(
          (item) => item?.address_uuid === baseAddressData.address_uuid
        );
        return matchedAddress || baseAddressData;
      } catch (error) {
        return baseAddressData;
      }
    },
    async beforeShow() {
      this.modal_pin = false;

      if (!this.enabled_map_selection) {
        return;
      }

      let latitude = this.address_data?.latitude || null;
      let longitude = this.address_data?.longitude || null;

      if (!latitude) {
        let coordinate_response = null;

        try {
          if (this.$q.capacitor) {
            coordinate_response = await this.LocationStore.fetchLocation(
              this.$t
            );
          } else {
            coordinate_response = await this.LocationStore.fetchWebLocation(
              this.$t
            );
          }
          if (coordinate_response) {
            latitude = coordinate_response.latitude;
            longitude = coordinate_response.longitude;
          }
        } catch (error) {
          console.log("error getlocation", error);
          latitude =
            this.DataStorePersisted.coordinates?.lat ||
            this.maps_config?.default_lat ||
            this.center.lat;
          longitude =
            this.DataStorePersisted.coordinates?.lng ||
            this.maps_config?.default_lng ||
            this.center.lng;
        } finally {
        }
      }

      this.center = {
        lat: parseFloat(
          latitude ||
            this.DataStorePersisted.coordinates?.lat ||
            this.maps_config?.default_lat ||
            this.center.lat
        ),
        lng: parseFloat(
          longitude ||
            this.DataStorePersisted.coordinates?.lng ||
            this.maps_config?.default_lng ||
            this.center.lng
        ),
      };

      this.marker_position = [
        {
          id: 0,
          lat: this.center.lat,
          lng: this.center.lng,
          icon:
            this.maps_config.provider == "mapbox"
              ? "marker_icon_destination"
              : this.maps_config.icon_destination,
          draggable: false,
        },
      ];
    },
    async onSubmit() {
      try {
        const params = {
          address_uuid:
            this.resolved_address_data?.address_uuid ||
            this.address_data?.address_uuid ||
            "",
          place_id:
            this.resolved_address_data?.place_id ||
            this.address_data?.place_id ||
            APIinterface.getStorage("place_id") ||
            "",
          location_name: this.location_name,
          address_label: this.address_label,
          delivery_options: this.delivery_options,
          delivery_instructions: this.delivery_instructions,
          latitude: this.marker_position[0]?.lat || this.address_lat,
          longitude: this.marker_position[0]?.lng || this.address_lng,
          formatted_address:
            this.resolved_address_data?.formatted_address ||
            this.resolved_address_data?.complete_address ||
            this.address_data?.formatted_address ||
            this.address_data?.complete_address ||
            this.street_name,
          complete_address:
            this.resolved_address_data?.complete_address ||
            this.resolved_address_data?.formatted_address ||
            this.address_data?.complete_address ||
            this.address_data?.formatted_address ||
            this.street_name,
          address1: this.street_number,
          house_number: this.house_number,
          zip_code: this.postal_code,
          state_id: this.state_id,
          city_id: this.city_id,
          area_id: this.area_id,
        };
        this.loading = true;
        const response = await APIinterface.fetchPost(
          `${config.api_location}/saveAddress`,
          params
        );
        this.modal = false;
        this.$emit("afterSaveaddress", response.details);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    onAdjustlocation() {
      this.modal_pin = !this.modal_pin;
      this.marker_position[0].draggable = true;
      setTimeout(() => {
        this.$refs.ref_map.mapBoxResize();
      }, 500);
    },
    afterGetlocation(lat, lng) {
      this.coordinates = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
      this.$refs.ref_map.setNewCoordinates(this.coordinates, 0);
      //this.$refs.ref_map.setCenter(lat, lng);
    },
    beforeShowPin() {
      this.coordinates = {
        lat: this.marker_position[0]?.lat,
        lng: this.marker_position[0]?.lng,
      };
    },
    beforHidePin() {
      this.marker_position[0].draggable = false;
    },
    afterSelectmap(lat, lng) {
      this.coordinates = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
    },
    confirmLocation() {
      if (!this.coordinates) {
        APIinterface.ShowAlert(
          this.$t("Please pin your location in the map"),
          this.$q.capacitor,
          this.$q
        );
        return;
      }
      this.marker_position[0].draggable = false;
      this.marker_position[0].lat = this.coordinates.lat;
      this.marker_position[0].lng = this.coordinates.lng;
      this.modal_pin = false;
      setTimeout(() => {
        this.$refs.mapRef.renderMap();
      }, 500);
    },
    setBusy(value) {
      this.pin_busy = value;
    },
  },
};
</script>

<style scoped>
:global(body.body--dark) .tagam-address-details-sheet {
  background: var(--tagam-surface);
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-address-details-sheet__toolbar {
  background: rgba(36, 29, 26, 0.96) !important;
  color: var(--tagam-text) !important;
  border-bottom: 1px solid var(--tagam-stroke);
}

:global(body.body--dark) .tagam-address-details-sheet__body {
  background: var(--tagam-surface) !important;
}

:global(body.body--dark) .tagam-address-details-sheet .q-field__control,
:global(body.body--dark) .tagam-address-details-sheet .q-card,
:global(body.body--dark) .tagam-address-details-sheet .q-item {
  background: var(--tagam-surface-raised) !important;
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-address-details-sheet .q-list,
:global(body.body--dark) .tagam-address-details-sheet .myform {
  background: transparent !important;
}

:global(body.body--dark) .tagam-address-details-sheet .text-grey,
:global(body.body--dark) .tagam-address-details-sheet .text-caption,
:global(body.body--dark) .tagam-address-details-sheet .text-body2 {
  color: var(--tagam-text-muted) !important;
}
</style>
