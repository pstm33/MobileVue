<template>
  <q-dialog
    v-model="modal"
    maximized
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="beforeShow"
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
      <div class="relative-position fitx tagam-address-map">
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
          <q-list class="modified-qlist">
            <q-item class="q-pa-none q-mb-sm">
              <q-item-section avatar>
                <q-icon name="place" color="red" size="sm" />
              </q-item-section>
              <q-item-section
                class="text-weight-medium text-subtitle2 line-normal"
              >
                {{ formatted_address }}</q-item-section
              >
            </q-item>
          </q-list>

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
            v-model="location_name"
            color="dark"
            :label="$t('Aparment, suite or floor')"
            borderless
            class="tagam-address-field tagam-field"
          />
          <q-space class="q-pa-sm"></q-space>

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

export default {
  name: "AddressDetails",
  props: [
    "is_address_found",
    "address_data",
    "maps_config",
    "delivery_options_data",
    "is_addnew",
  ],
  components: {
    MapsComponents: defineAsyncComponent(() =>
      import("components/MapsComponents.vue")
    ),
  },
  data() {
    return {
      modal: false,
      address_label: "",
      delivery_instructions: "",
      formatted_address: "",
      street_number: "",
      street_name: "",
      location_name: "",
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
    return {};
  },
  methods: {
    beforeShow() {
      this.modal_pin = false;
      this.address_label = this.address_data?.address_label || "";
      this.street_number = this.address_data?.street_number || "";
      this.street_name = this.address_data?.street_name || "";
      this.location_name = this.address_data?.location_name || "";
      this.formatted_address = this.address_data?.formatted_address || "";
      this.delivery_instructions =
        this.address_data?.delivery_instructions || "";
      this.delivery_options =
        this.address_data?.delivery_options || this.delivery_options;

      const latitude = this.address_data?.latitude || null;
      const longitude = this.address_data?.longitude || null;

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
          street_number: this.street_number,
          street_name: this.street_name,
          location_name: this.location_name,
          address_label: this.address_label,
          delivery_options: this.delivery_options,
          delivery_instructions: this.delivery_instructions,
          place_id: this.address_data?.place_id || "",
          formatted_address: this.address_data?.formatted_address || "",
          city: this.address_data?.city || "",
          state: this.address_data?.state || "",
          postal_code: this.address_data?.postal_code || "",
          country: this.address_data?.country || "",
          latitude: this.marker_position[0].lat,
          longitude: this.marker_position[0].lng,
        };
        this.loading = true;
        const results = await APIinterface.fetchDataByTokenPost(
          "SavedAddress",
          params
        );
        this.modal = false;
        this.$emit("afterSaveaddress", results.details.place_data);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    onAdjustlocation() {
      console.log("onAdjustlocation");
      this.modal_pin = !this.modal_pin;
      this.marker_position[0].draggable = true;
      setTimeout(() => {
        this.$refs.ref_map.mapBoxResize();
      }, 500);
    },
    afterGetlocation(lat, lng) {
      console.log("afterGetlocation", lat);
      this.coordinates = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
      this.$refs.ref_map.setNewCoordinates(this.coordinates, 0);
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
        console.log("this.$refs.mapRef", this.$refs.mapRef);
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
