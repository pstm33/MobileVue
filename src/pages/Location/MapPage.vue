<template>
  <q-header class="bg-grey-1" v-if="$q.platform.is.ios">
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        rounded
        dense
        icon="eva-arrow-back-outline"
        size="md"
        color="white"
        text-color="dark"
        class="q-mr-sm"
      />
      <div
        class="bg-white text-dark shadow-1 text-subtitle2 q-pa-sm radius28 flex items-center cursor-pointer full-width"
      >
        <div class="q-mr-sm">
          <q-icon name="eva-search-outline" size="20px"></q-icon>
        </div>
        <div class="text-caption">
          {{ $t("Enter your location") }}
        </div>
      </div>
    </q-toolbar>
  </q-header>
  <q-page class="row items-stretch">
    <div
      class="col-12 relative-position bg-grey-1"
      style="margin-bottom: -10px"
    >
      <div
        v-if="!$q.platform.is.ios"
        class="fixed-top q-pt-sm white-linearbg q-pb-xl"
        style="z-index: 999"
      >
        <q-intersection transition="slide-down" v-if="!is_drag">
          <q-toolbar>
            <div
              class="bg-white text-dark shadow-1 text-subtitle2 q-pa-sm radius28 flex items-center cursor-pointer full-width"
              @click.stop="this.$refs.ref_search.modal = true"
            >
              <div class="q-mr-sm">
                <q-btn
                  @click.stop="$router.back()"
                  rounded
                  dense
                  icon="eva-arrow-back-outline"
                  size="md"
                  color="white"
                  text-color="dark"
                  class="q-mr-sm"
                  flat
                />
              </div>
              <div class="text-subtitle2">
                {{ $t("Enter your location") }}
              </div>
            </div>
          </q-toolbar>
        </q-intersection>
      </div>

      <div v-if="loading_geo" class="absolute-center" style="z-index: 999">
        <q-circular-progress indeterminate rounded size="lg" color="primary" />
      </div>

      <!-- MAP HERE -->
      <template v-if="DataStore.hasMapConfig">
        <MapsComponents
          ref="mapRef"
          class="maps"
          size="fit"
          :keys="DataStore.maps_config.key"
          :provider="DataStore.maps_config.provider"
          :zoom="DataStore.maps_config.zoom"
          :language="DataStore.maps_config.language"
          :center="center"
          :markers="marker_position"
          :map_controls="true"
          @after-selectmap="afterSelectmap"
          @drag-marker="dragMarker"
          @after-getlocation="afterGetlocation"
          @set-busy="setBusy"
          @set-error="setError"
        >
        </MapsComponents>
      </template>
    </div>
  </q-page>

  <SearchGeolocation
    ref="ref_search"
    :map_provider="
      DataStore.maps_config ? DataStore.maps_config.provider : null
    "
    @after-chooseaddress="afterChooseaddress"
    @after-locationdetails="afterLocationdetails"
  ></SearchGeolocation>

  <AddressDetails
    ref="ref_address_details"
    :is_address_found="false"
    :address_data="places_data"
    :maps_config="DataStore.maps_config ?? null"
    :delivery_options_data="DataStore.getDeliveryOptions"
    @after-saveaddress="afterSaveaddress"
  ></AddressDetails>

  <q-footer class="bg-white text-dark shadow-1">
    <!-- style="border-top-right-radius: 15px; border-top-left-radius: 15px" -->
    <q-intersection transition="slide-up" v-if="!is_drag">
      <q-list class="q-pt-md q-pb-md">
        <q-item>
          <q-item-section avatar>
            <q-icon v-if="hasAddress" color="primary" name="eva-pin-outline" />
            <q-skeleton v-else type="QCheckbox" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-subtitle2 text-weight-bold">
              <template v-if="hasAddress">
                {{ places_data ? places_data.formatted_address : "" }}
              </template>
              <template v-else>
                <q-skeleton type="rect" />
              </template>
            </q-item-label>
            <q-item-label caption>
              <template v-if="hasAddress">
                {{ places_data ? places_data.place_text : "" }}
              </template>
              <template v-else>
                <q-skeleton type="rect" />
              </template>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-card>
        <q-card-actions>
          <q-skeleton
            v-if="is_drag || loading_geo"
            type="QBtn"
            class="full-width q-pa-lg radius28"
          />
          <q-btn
            v-else
            unelevated
            no-caps
            color="secondary"
            text-color="white"
            class="full-width text-weight-medium"
            size="lg"
            rounded
            @click="confirmLocation"
          >
            <div class="text-weight-bold text-subtitle2">
              {{ $t("Confirm Location") }}
            </div>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-intersection>
  </q-footer>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useLocationStore } from "stores/LocationStore";
import APIinterface from "src/api/APIinterface";
import { useClientStore } from "stores/ClientStore";

export default {
  components: {
    MapsComponents: defineAsyncComponent(() =>
      import("components/MapsComponents.vue")
    ),
    SearchGeolocation: defineAsyncComponent(() =>
      import("components/SearchGeolocation.vue")
    ),
    AddressDetails: defineAsyncComponent(() =>
      import("components/AddressDetails.vue")
    ),
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const LocationStore = useLocationStore();
    const ClientStore = useClientStore();
    return { DataStore, DataStorePersisted, LocationStore, ClientStore };
  },
  data() {
    return {
      marker_position: {},
      center: { lat: 34.04703, lng: -118.24686 },
      is_drag: false,
      location_coordinates: null,
      loading_geo: false,
      places_data: null,
      back_url: null,
      is_addnew: false,
    };
  },
  created() {
    const searchMode = this.DataStore.getSearchMode;
    if (searchMode == "location") {
      this.$router.replace("/location/add-location");
      return;
    }
  },
  mounted() {
    this.back_url = this.$route.query?.url || "";
    this.is_addnew = this.$route.query?.is_addnew || false;
    this.is_addnew = this.is_addnew == 1 ? true : false;

    if (this.DataStore.maps_config) {
      this.setMarkerPosition();
    } else {
      this.$watch(
        () => this.DataStore.$state.maps_config,
        (newData, oldData) => {
          this.setMarkerPosition();
        }
      );
    }
  },
  computed: {
    hasAddress() {
      if (this.places_data) {
        return true;
      }
      return false;
    },
  },
  methods: {
    getReturnUrl(stripAddnew = false) {
      if (APIinterface.empty(this.back_url)) {
        return null;
      }

      if (!stripAddnew) {
        return this.back_url;
      }

      try {
        const [pathPart, queryString = ""] = String(this.back_url).split("?");
        const params = new URLSearchParams(queryString);
        params.delete("addnew");
        const nextQuery = params.toString();
        return nextQuery ? `${pathPart}?${nextQuery}` : pathPart;
      } catch (error) {
        return this.back_url;
      }
    },
    setMarkerPosition() {
      this.center.lat = this.DataStore.maps_config.default_lat;
      this.center.lng = this.DataStore.maps_config.default_lng;

      const place_data = this.DataStorePersisted.place_data;
      const save_coordinates = this.DataStorePersisted.coordinates;
      console.log("place_data", place_data);
      console.log("save_coordinates", save_coordinates);

      this.location_coordinates = {
        lat: this.DataStore.maps_config.default_lat,
        lng: this.DataStore.maps_config.default_lng,
      };

      if (place_data && save_coordinates) {
        this.places_data = place_data;
        this.location_coordinates = save_coordinates;
      } else {
        this.reverseGeocoding(
          this.location_coordinates.lat,
          this.location_coordinates.lng
        );
      }

      this.marker_position = [
        {
          id: 0,
          lat: parseFloat(this.location_coordinates.lat),
          lng: parseFloat(this.location_coordinates.lng),
          icon:
            this.DataStore.maps_config.provider == "mapbox"
              ? "marker_icon_destination"
              : this.DataStore.maps_config.icon_destination,
          draggable: true,
        },
      ];
    },
    afterSelectmap(lat, lng) {
      console.log("afterSelectmap", {
        lat: lat,
        lng: lng,
      });
      this.location_coordinates = {
        lat: lat,
        lng: lng,
      };
      this.reverseGeocoding(lat, lng);
    },
    dragMarker(data) {
      if (!data) {
        setTimeout(() => {
          this.is_drag = data;
        }, 500);
      } else {
        this.is_drag = data;
      }
    },
    async reverseGeocoding(lat, lng) {
      try {
        this.loading_geo = true;
        this.places_data = await this.LocationStore.reverseGeocoding(lat, lng);
        console.log("reverseGeocoding", this.places_data);

        this.loading_geo = false;
      } catch (error) {
        this.loading_geo = false;
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      }
    },
    setBusy(data) {
      console.log("setBusy", data);
      this.loading_geo = data;
    },
    afterGetlocation(lat, lng) {
      console.log("afterGetlocation", lat);
      this.location_coordinates = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
      this.$refs.mapRef.setNewCoordinates(this.location_coordinates, 0);
    },
    setError(data) {
      APIinterface.ShowAlert(data, this.$q.capacitor, this.$q);
    },
    afterChooseaddress(data) {
      console.log("afterChooseaddress", data);
      this.location_coordinates = data;
      this.$refs.mapRef.setNewCoordinates(this.location_coordinates, 0);
      this.reverseGeocoding(data.lat, data.lng);
    },
    afterLocationdetails(data) {
      console.log("afterLocationdetails", data);
      this.places_data = data?.parsed_address;
      this.location_coordinates = {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
      };
      this.$refs.mapRef.setNewCoordinates(this.location_coordinates, 0);
    },
    confirmLocation() {
      console.log("this.places_data", this.places_data);
      console.log("this.location_coordinates", this.location_coordinates);
      this.DataStorePersisted.place_data = this.places_data;
      this.DataStorePersisted.coordinates = this.location_coordinates;
      this.DataStorePersisted.saveRecentAddress(this.places_data);

      if (this.is_addnew) {
        this.$refs.ref_address_details.modal = true;
      } else {
        this.backPage();
      }
    },
    backPage() {
      const returnUrl = this.getReturnUrl(false);
      if (!APIinterface.empty(returnUrl)) {
        this.$router.push(returnUrl);
      } else {
        this.$router.push("/home");
      }
    },
    afterSaveaddress(value) {
      console.log("afterSaveaddress", value);
      this.DataStorePersisted.place_data = value;
      this.DataStorePersisted.coordinates = {
        lat: value.latitude,
        lng: value.longitude,
      };
      this.ClientStore.address_data = null;
      const returnUrl = this.getReturnUrl(true);
      if (!APIinterface.empty(returnUrl)) {
        this.$router.replace(returnUrl);
        return;
      }
      this.$router.replace("/account/my-address");
    },
    //
  },
};
</script>
