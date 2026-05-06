<template>
  <!-- <pre>{{ markers }}</pre> -->
  <div ref="cmaps" class="map bg-grey-1" :class="size"></div>

  <div v-if="loading" class="absolute-center" style="z-index: 999">
    <q-circular-progress indeterminate rounded size="lg" color="primary" />
  </div>

  <div
    v-if="adjust_location"
    class="absolute-bottom my-z-top flex items-center justify-center q-pa-sm"
  >
    <q-btn
      rounded
      :label="$t('Adjust location')"
      no-caps
      unelevated
      color="mygrey"
      text-color="dark"
      size="0.8rem"
      @click="$emit('onAdjustlocation')"
    ></q-btn>
  </div>

  <div class="absolute-right q-pa-lg">
    <div
      class="absolute-bottom-right my-z-top q-gutter-y-sm q-mb-sm"
      v-if="zoom_control"
    >
      <q-btn
        round
        color="white"
        text-color="blue-grey-6"
        icon="eva-plus-outline"
        size="sm"
        @click="zoomIn"
      />
      <q-btn
        round
        color="white"
        text-color="blue-grey-6"
        icon="eva-minus-outline"
        size="sm"
        @click="zoomOut"
      />
    </div>
    <div
      class="absolute-center q-gutter-y-sm"
      v-if="controls_center && !map_controls"
    >
      <q-btn
        round
        color="white"
        text-color="blue-grey-6"
        icon="gps_fixed"
        size="sm"
        @click="centerMap"
      />
    </div>
    <div class="absolute-center q-gutter-y-sm" v-if="map_controls">
      <q-btn
        round
        color="white"
        text-color="blue-grey-6"
        icon="eva-plus-outline"
        size="sm"
        @click="zoomIn"
      />
      <q-btn
        round
        color="white"
        text-color="blue-grey-6"
        icon="eva-minus-outline"
        size="sm"
        @click="zoomOut"
      />
      <template v-if="controls_center">
        <q-btn
          round
          color="white"
          text-color="blue-grey-6"
          icon="gps_fixed"
          size="sm"
          @click="centerMap"
        />
      </template>
      <template v-else>
        <q-btn
          round
          color="white"
          text-color="blue-grey-6"
          icon="eva-navigation-2-outline"
          size="sm"
          :disable="loading"
          @click="getLocation"
        />
      </template>
    </div>
  </div>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { loadScript, unloadScript } from "vue-plugin-load-script";
import { useLocationStore } from "stores/LocationStore";

const cmapsMarker = [];
let bounds = [];
let track_bounds;
let directionsService, directionsRenderer;

let yandex_map;
let yandex_zoom = 16.6;

export default {
  name: "MapsComponents",
  props: [
    "keys",
    "provider",
    "zoom",
    "center",
    "markers",
    "size",
    "language",
    "map_controls",
    "controls_center",
    "zoom_control",
    "adjust_location",
  ],
  setup() {
    const LocationStore = useLocationStore();
    return { LocationStore };
  },
  data() {
    return {
      cmaps: undefined,
      data: [],
      loading: false,
    };
  },
  mounted() {
    this.loadMap();
  },
  watch: {
    markers(newval, oldval) {
      console.log("markers change");
      this.renderMap();
    },
    provider(newval, oldval) {
      this.loadMap();
    },
  },
  methods: {
    loadMap() {
      try {
        switch (this.provider) {
          case "google.maps":
            loadScript(
              "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&key=" +
                this.keys +
                "&callback=Function.prototype"
            )
              .then(() => {
                this.renderMap();
              })
              .catch(() => {
                console.debug("failed loading map script");
              });
            break;
          case "mapbox":
            loadScript(
              "https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js"
            )
              .then(() => {
                this.renderMap();
              })
              .catch(() => {
                console.debug("failed loading mapboxscript");
              });
            break;
          case "yandex":
            loadScript(
              "https://api-maps.yandex.ru/v3/?apikey=" +
                this.keys +
                "&lang=" +
                this.language
            )
              .then(() => {
                this.renderMap();
              })
              .catch(() => {
                console.debug("failed loading mapboxscript");
              });
            break;
        }
      } catch (err) {
        console.error(err);
      }
    },
    renderMap() {
      try {
        switch (this.provider) {
          case "google.maps":
            bounds = new window.google.maps.LatLngBounds();
            if (typeof this.cmaps !== "undefined" && this.cmaps !== null) {
              Object.entries(this.markers).forEach(([key, items]) => {
                this.removeMarker(items.id);
              });
            } else {
              this.cmaps = new window.google.maps.Map(this.$refs.cmaps, {
                center: {
                  lat: parseFloat(this.center.lat),
                  lng: parseFloat(this.center.lng),
                },
                zoom: parseInt(this.zoom),
                disableDefaultUI: true,
              });
            }

            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer({
              map: this.cmaps,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "blue",
                strokeWeight: 7,
                strokeOpacity: 0.8,
              },
            });

            Object.entries(this.markers).forEach(([key, items]) => {
              this.addMarker(
                {
                  position: {
                    lat: parseFloat(items.lat),
                    lng: parseFloat(items.lng),
                  },
                  map: this.cmaps,
                  draggable: items.draggable,
                  icon: {
                    url: items.icon,
                    scaledSize:
                      items.id == 3
                        ? new google.maps.Size(30, 30)
                        : new google.maps.Size(45, 45),
                  },
                  title: items.title,
                },
                items.id,
                items.draggable
              );
            });

            if (Object.keys(this.markers).length > 1) {
              this.FitBounds();
            } else {
              if (this.markers[0]) {
                this.setCenter(this.markers[0].lat, this.markers[0].lng);
              }
            }
            break;
          case "mapbox":
            if (!window.mapboxgl) {
              return;
            }
            mapboxgl.accessToken = this.keys;
            bounds = new mapboxgl.LngLatBounds();
            this.cmaps = new mapboxgl.Map({
              container: this.$refs.cmaps,
              style: "mapbox://styles/mapbox/streets-v12",
              center: [
                parseFloat(this.center.lng),
                parseFloat(this.center.lat),
              ],
              zoom: 14,
            });
            Object.entries(this.markers).forEach(([key, items]) => {
              //console.log("items.id", items.id);
              this.addMarker(
                {
                  position: {
                    lat: parseFloat(items.lat),
                    lng: parseFloat(items.lng),
                  },
                  map: this.cmaps,
                  animation: null,
                  draggable: items.draggable,
                  icon: items.icon,
                  title: items.title,
                },
                items.id,
                items.draggable
              );
            });
            if (Object.keys(this.markers).length > 1) {
              this.FitBounds();
            } else {
              if (this.markers[0]) {
                this.setCenter(this.markers[0].lat, this.markers[0].lng);
              }
            }
            break;

          case "yandex":
            this.initYandex();
            break;
        }
      } catch (err) {
        console.error(err);
      }
    },
    insertMarker(items) {
      console.log("insertMarker", items);
      this.addMarker(
        {
          position: {
            lat: parseFloat(items.lat),
            lng: parseFloat(items.lng),
          },
          map: this.cmaps,
          animation: null,
          draggable: items.draggable,
          icon: items.icon,
          title: items.title,
        },
        items.id,
        items.draggable
      );
    },
    addMarker(properties, index, draggable) {
      try {
        switch (this.provider) {
          case "google.maps":
            console.log("properties", properties);
            cmapsMarker[index] = new window.google.maps.Marker(properties);

            if (properties.title) {
              const infoWindow = new google.maps.InfoWindow({
                content: properties.title,
              });
              cmapsMarker[index].addListener("click", () => {
                infoWindow.open(this.cmaps, cmapsMarker[index]);
              });
            }

            this.cmaps.panTo(
              new window.google.maps.LatLng(
                properties.position.lat,
                properties.position.lng
              )
            );
            bounds.extend(cmapsMarker[index].position);

            if (draggable === true) {
              window.google.maps.event.addListener(
                cmapsMarker[index],
                "drag",
                (marker) => {
                  this.$emit("dragMarker", true);
                }
              );

              window.google.maps.event.addListener(
                cmapsMarker[index],
                "dragend",
                (marker) => {
                  const latLng = marker.latLng;
                  this.$emit("dragMarker", false);
                  this.$emit("afterSelectmap", latLng.lat(), latLng.lng());
                }
              );

              google.maps.event.addListener(this.cmaps, "dragstart", () => {
                this.$emit("dragMarker", true);
              });

              google.maps.event.addListener(this.cmaps, "drag", (data) => {
                const new_position = this.cmaps.getCenter();
                cmapsMarker[index].setPosition(new_position);
              });

              google.maps.event.addListener(this.cmaps, "dragend", (data) => {
                this.$emit("dragMarker", false);
                const mapCenter = this.cmaps.getCenter();
                this.$emit("afterSelectmap", mapCenter.lat(), mapCenter.lng());
              });
            }

            break;

          case "mapbox":
            if (!APIinterface.empty(properties.icon)) {
              const el = document.createElement("div");
              el.className = properties.icon;
              cmapsMarker[index] = new mapboxgl.Marker(el)
                .setLngLat([properties.position.lng, properties.position.lat])
                .addTo(this.cmaps);
            } else {
              cmapsMarker[index] = new mapboxgl.Marker(properties)
                .setLngLat([properties.position.lng, properties.position.lat])
                .addTo(this.cmaps);
            }

            if (properties.title) {
              const popup = new mapboxgl.Popup({ offset: 25 }).setText(
                properties.title
              );
              cmapsMarker[index].setPopup(popup);
            }

            bounds.extend(
              new mapboxgl.LngLat(
                properties.position.lng,
                properties.position.lat
              )
            );
            if (draggable === true) {
              cmapsMarker[index].on("dragend", (event) => {
                const lngLat = cmapsMarker[index].getLngLat();
                this.$emit("afterSelectmap", lngLat.lat, lngLat.lng);
              });

              this.cmaps.on("dragstart", () => {
                this.mapBoxResize();
                this.$emit("dragMarker", true);
              });

              this.cmaps.on("drag", () => {
                const center = this.cmaps.getCenter();
                cmapsMarker[index].setLngLat([center.lng, center.lat]);
              });

              this.cmaps.on("dragend", () => {
                this.$emit("dragMarker", false);
                const center = this.cmaps.getCenter();
                cmapsMarker[index].setLngLat([center.lng, center.lat]);
                this.$emit("afterSelectmap", center.lat, center.lng);
              });
            }
            this.mapBoxResize();
            break;
        }
      } catch (err) {
        console.error(err);
      }
    },
    mapBoxResize() {
      console.log("mapBoxResize");
      if (this.provider == "mapbox") {
        setTimeout(() => {
          this.cmaps.resize();
        }, 500);
      }
    },
    removeMarker(index) {
      try {
        switch (this.provider) {
          case "google.maps":
            if (
              typeof cmapsMarker[index] !== "undefined" &&
              cmapsMarker[index] !== null
            ) {
              cmapsMarker[index].setMap(null);
              cmapsMarker.splice(index, 1);
            }
            break;
        }
      } catch (err) {
        console.error(err);
      }
    },
    centerMap() {
      this.FitBounds();
    },
    FitBounds() {
      try {
        console.log("FitBounds", this.provider);
        switch (this.provider) {
          case "google.maps":
            if (!APIinterface.empty(bounds)) {
              this.cmaps.fitBounds(bounds);
            }
            break;
          case "mapbox":
            console.log("bounds", bounds);
            if (!APIinterface.empty(bounds)) {
              this.cmaps.fitBounds(bounds, { duration: 0, padding: 50 });
            }
            break;
        }
      } catch (err) {
        console.error(err);
      }
    },
    setCenter(lat, lng) {
      try {
        switch (this.provider) {
          case "google.maps":
            this.cmaps.setCenter(new window.google.maps.LatLng(lat, lng));
            break;
          case "mapbox":
            this.cmaps.jumpTo({
              center: [lng, lat],
              essential: true,
            });
            break;
        }
      } catch (err) {
        console.error(err);
      }
    },
    setNewCoordinates(data, index) {
      if (cmapsMarker[index]) {
        if (this.provider == "mapbox") {
          cmapsMarker[index].setLngLat(data);
          const currentZoom = this.cmaps.getZoom();
          this.cmaps.jumpTo({
            center: data,
            zoom: currentZoom,
            speed: 1,
            curve: 1,
            easing: (t) => t,
          });
        } else {
          cmapsMarker[index].setPosition(data);
          this.cmaps.panTo(new google.maps.LatLng(data.lat, data.lng));
          const currentZoom = this.cmaps.getZoom();
          this.cmaps.setZoom(currentZoom);
        }
      }
    },
    async addRoute(start, end) {
      console.log("addRoute", this.provider);
      console.log("start", start);
      console.log("end", end);
      if (this.provider == "mapbox") {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
          { method: "GET" }
        );
        const json = await query.json();
        const data = json.routes[0];
        const route = data.geometry;
        console.log("route", route);
        if (this.cmaps.getSource("route")) {
          this.cmaps.getSource("route").setData(route);
        } else {
          this.cmaps.addLayer({
            id: "route",
            type: "line",
            source: {
              type: "geojson",
              data: route,
            },
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#76adeb",
              "line-width": 7,
            },
          });
        }
        //this.FitBounds();
        this.cmaps.fitBounds([start, end], {
          padding: 50, // Add padding for better visibility
          maxZoom: 15, // Prevent too much zoom-in
        });
      } else if (this.provider == "google.maps") {
        directionsRenderer.setDirections({ routes: [] });
        directionsService.route(
          {
            origin: start,
            destination: end,
            travelMode: "DRIVING",
          },
          (response, status) => {
            console.log("status", status);
            if (status === "OK") {
              console.log("response", response);
              directionsRenderer.setDirections(response);
            } else {
              console.error("Directions request failed due to " + status);
            }
          }
        );
      }
    },
    removeMarkers(index) {
      if (cmapsMarker[index]) {
        if (this.provider == "mapbox") {
          cmapsMarker[index].remove();
        } else if (this.provider == "google.maps") {
          cmapsMarker[index].setMap(null);
          cmapsMarker[index] = null;
        }
      }
    },
    zoomIn() {
      const currentZoom = this.cmaps.getZoom();
      this.cmaps.setZoom(currentZoom + 1);
    },
    zoomOut() {
      const currentZoom = this.cmaps.getZoom();
      this.cmaps.setZoom(currentZoom - 1);
    },
    async getLocation() {
      try {
        this.loading = true;
        this.$emit("setBusy", true);

        let location = null;
        if (this.$q.capacitor) {
          location = await this.LocationStore.fetchLocation(this.$t);
        } else {
          location = await this.LocationStore.fetchWebLocation(this.$t);
        }
        this.$emit("setBusy", false);
        this.$emit("afterSelectmap", location.latitude, location.longitude);
        this.$emit("afterGetlocation", location.latitude, location.longitude);
        this.loading = false;
      } catch (error) {
        this.$emit("setBusy", false);
        this.loading = false;
        this.$emit("setError", error);
      }
    },
    //
  },
};
</script>
