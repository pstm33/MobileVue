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
      <div class="relative-position fitx">
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
            v-model="location_name"
            color="dark"
            :label="$t('Aparment, suite or floor')"
            borderless
          />
          <q-space class="q-pa-sm"></q-space>

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
import { useDataStorePersisted } from "stores/DataStorePersisted";

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
      center: { lat: 0, lng: 0 },
      modal_pin: false,
      coordinates: null,
      pin_busy: false,
      loading: false,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
  },
  methods: {
    getResolvedCoordinates() {
      const latitude =
        this.address_data?.latitude ??
        this.DataStorePersisted.coordinates?.lat ??
        this.maps_config?.default_lat ??
        this.center.lat;
      const longitude =
        this.address_data?.longitude ??
        this.DataStorePersisted.coordinates?.lng ??
        this.maps_config?.default_lng ??
        this.center.lng;

      return {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
      };
    },
    beforeShow() {
      this.modal_pin = false;
      this.address_label = this.address_data?.address_label || "";
      this.street_number = this.address_data?.street_number || "";
      this.street_name = this.address_data?.street_name || "";
      this.location_name = this.address_data?.location_name || "";
      this.formatted_address =
        this.address_data?.formatted_address ||
        this.address_data?.complete_address ||
        "";
      this.delivery_instructions =
        this.address_data?.delivery_instructions || "";
      this.delivery_options =
        this.address_data?.delivery_options || this.delivery_options;

      const resolvedCoordinates = this.getResolvedCoordinates();
      this.center = {
        lat: resolvedCoordinates.lat,
        lng: resolvedCoordinates.lng,
      };

      this.marker_position = [
        {
          id: 0,
          lat: resolvedCoordinates.lat,
          lng: resolvedCoordinates.lng,
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

:global(body.body--dark) .tagam-address-details-sheet .modified-qlist,
:global(body.body--dark) .tagam-address-details-sheet .q-list,
:global(body.body--dark) .tagam-address-details-sheet .q-card,
:global(body.body--dark) .tagam-address-details-sheet .q-item {
  background: transparent !important;
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-address-details-sheet .q-field__control {
  background: var(--tagam-surface-raised) !important;
  color: var(--tagam-text);
  border-radius: 22px;
}

:global(body.body--dark) .tagam-address-details-sheet .text-grey,
:global(body.body--dark) .tagam-address-details-sheet .text-caption,
:global(body.body--dark) .tagam-address-details-sheet .text-body2 {
  color: var(--tagam-text-muted) !important;
}
</style>
