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
        class="tagam-surface tagam-text-main border-bottom"
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
      <div v-if="enabled_map_selection" class="relative-position fitx tagam-address-map">
        <MapsComponents
          ref="mapRef"
          class="maps"
          :keys="maps_config?.key || ''"
          :provider="maps_config?.provider || ''"
          :zoom="maps_config?.zoom || ''"
          :language="maps_config?.language || ''"
          :map_id="maps_config?.map_id || maps_config?.mapId || ''"
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

      <q-card-section class="tagam-surface myform tagam-address-form">
        <q-form @submit="onSubmit" @reset="onReset">
          <div class="text-weight-bold text-subtitle2 line-normal">
            {{ $t("Label your address") }}
          </div>
          <div class="text-caption tagam-text-muted">
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
            class="tagam-address-field tagam-field"
          />
          <div class="text-weight-bold text-subtitle2 line-normal">
            {{ $t("Address details") }}
          </div>
          <div class="text-caption tagam-text-muted">
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
            class="tagam-address-field tagam-field"
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
            class="tagam-address-field tagam-field"
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
            class="tagam-address-field tagam-field"
          />

          <div class="q-gutter-y-md">
            <!-- state_id=>{{ state_id }} -->
            <LocationSelection
              class="tagam-address-field tagam-field"
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
              class="tagam-address-field tagam-field"
              ref="ref_city"
              v-model:id="city_id"
              method="fetchCity"
              :auto_load="true"
              :label="$t('City')"
              @after-select="afterSelectCity"
            ></LocationSelection>

            <!-- area_id=>{{ area_id }} -->
            <LocationSelection
              class="tagam-address-field tagam-field"
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
            :label="$t('Zip Code')"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
            borderless
            :loading="zip_loading"
            class="tagam-address-field tagam-field"
          />

          <q-input
            v-model="location_name"
            color="dark"
            :label="$t('Aparment, suite or floor')"
            borderless
            class="tagam-address-field tagam-field"
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
                class="tagam-address-field tagam-field"
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
                class="tagam-address-field tagam-field"
              />
          </template>

          <div class="text-weight-bold text-subtitle2 line-normal">
            {{ $t("Delivery instructions") }}
          </div>
          <div class="text-caption tagam-text-muted">
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
            class="tagam-address-field tagam-field"
          />
          <q-space class="q-pa-sm"></q-space>

          <q-input
            v-model="delivery_instructions"
            color="dark"
            :label="$t('Additional instructions')"
            borderless
            autogrow
            class="tagam-address-field tagam-field"
          />
          <q-space class="q-pa-xl"></q-space>

          <div
            class="tagam-address-footer tagam-bottom-sheet fixed-bottom q-pa-sm row q-gutter-x-md items-center"
            :class="{
              'tagam-surface': !$q.dark.mode,
            }"
          >
            <q-btn
              class="col tagam-address-submit"
              unelevated
              rounded
              color="primary"
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
        class="tagam-surface tagam-text-main border-bottom"
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
      <div class="relative-position fit tagam-surface-muted" style="margin-top: -50px">
        <MapsComponents
          ref="ref_map"
          class="maps"
          :keys="maps_config?.key || ''"
          size="fit"
          :provider="maps_config?.provider || ''"
          :zoom="maps_config?.zoom || ''"
          :language="maps_config?.language || ''"
          :map_id="maps_config?.map_id || maps_config?.mapId || ''"
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
        class="tagam-address-footer tagam-bottom-sheet fixed-bottom q-pa-sm row q-gutter-x-md items-center my-z-top"
        :class="{
          'tagam-surface': !$q.dark.mode,
        }"
      >
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label class="text-subtitle2 text-weight-bold tagam-text-main">
                {{ $t("Pin your location") }}
              </q-item-label>
              <q-item-label caption class="tagam-text-muted">
                {{ $t("Make sure to aim your exact location in the map") }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-skeleton v-if="pin_busy" type="QBtn" class="fit q-pa-md radius28" />
        <q-btn
          v-else
          class="fit tagam-address-submit"
          unelevated
          rounded
          size="lg"
          no-caps
          @click="confirmLocation"
          :disable="pin_busy"
          :color="pin_busy ? 'blue-grey-6' : 'primary'"
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
      center: { lat: 34.04703, lng: -118.24686 },
      modal_pin: false,
      coordinates: null,
      pin_busy: false,
      loading: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    const LocationStore = useLocationStore();
    return { DataStore, LocationStore };
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
      if (this.is_address_found) {
        this.address_label = this.address_data?.address_label || "";
        this.house_number = this.address_data?.house_number || "";
        this.street_name = this.address_data?.street_name || "";
        this.street_number = this.address_data?.street_number || "";
        this.postal_code = this.address_data?.zip_code || "";
        this.location_name = this.address_data?.location_name || "";
        this.delivery_instructions =
          this.address_data?.delivery_instructions || "";

        console.log("is_address_found", this.address_data);
        if (this.enabled_map_selection) {
        } else {
          this.address_lat = this.address_data?.latitude || "";
          this.address_lng = this.address_data?.longitude || "";
        }

        this.state_id = String(this.address_data?.state_id) || "";
        this.$refs.ref_state.id = this.state_id;
        this.$refs.ref_state.updateData();

        const cityLoaded = await this.$refs.ref_city.fetchData({
          state_id: this.state_id,
        });
        if (cityLoaded) {
          this.city_id = String(this.address_data?.city_id) || "";
          this.$refs.ref_city.id = this.city_id;
          this.$refs.ref_city.updateData();
        }

        const areaLoaded = await this.$refs.ref_area.fetchData({
          city_id: this.city_id,
        });
        if (areaLoaded) {
          this.area_id = String(this.address_data?.area_id) || "";
          this.$refs.ref_area.id = this.area_id;
          this.$refs.ref_area.updateData();
        }
      } else {
        let state_id = String(this.address_data?.state_id) || "";
        let city_id = String(this.address_data?.city_id) || "";
        let area_id = String(this.address_data?.area_id) || "";
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
          if (location) {
            latitude = coordinate_response.latitude;
            longitude = coordinate_response.longitude;
          }
        } catch (error) {
          console.log("error getlocation", error);
          latitude = this.maps_config?.default_lat || this.center.lat;
          longitude = this.maps_config?.default_lng || this.center.lng;
        } finally {
        }
      }

      this.marker_position = [
        {
          id: 0,
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
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
          address_uuid: this.address_data?.address_uuid || "",
          location_name: this.location_name,
          address_label: this.address_label,
          delivery_options: this.delivery_options,
          delivery_instructions: this.delivery_instructions,
          latitude: this.marker_position[0]?.lat || this.address_lat,
          longitude: this.marker_position[0]?.lng || this.address_lng,
          formatted_address: this.street_name,
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
      this.coordinates = null;
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
.tagam-address-details-sheet {
  background: var(--tagam-bg);
  color: var(--tagam-text-main);
}

.tagam-address-map {
  min-height: 34vh;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  overflow: hidden;
}

.tagam-address-form {
  margin: 14px 14px 120px;
  border-radius: 28px;
  box-shadow: var(--tagam-shadow-soft);
}

.tagam-address-field {
  border: 1px solid var(--tagam-border);
  border-radius: 20px;
  padding: 2px 16px;
  background: var(--tagam-surface-muted);
}

.tagam-address-footer {
  border-top: 1px solid var(--tagam-border);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -18px 44px rgba(15, 23, 42, 0.12);
}

.tagam-address-submit {
  min-height: 58px;
  box-shadow: 0 18px 36px rgba(255, 89, 56, 0.24);
}
</style>
