<template>
  <!-- <pre>{{ markers }}</pre> -->
  <div ref="cmaps" class="map tagam-surface-muted" :class="[size, $attrs.class]"></div>

  <div v-if="showCenterPin" class="tagam-map-center-pin" aria-hidden="true">
    <q-icon name="place" />
  </div>

  <div v-if="loading" class="absolute-center" style="z-index: 999">
    <q-circular-progress indeterminate rounded size="lg" color="primary" />
  </div>

  <div
    v-if="error_message"
    class="absolute-full column items-center justify-center text-center q-pa-md tagam-surface"
    style="z-index: 998"
  >
    <div class="text-caption text-weight-medium">{{ error_message }}</div>
    <img
      v-if="googleStaticMapUrl"
      :src="googleStaticMapUrl"
      :alt="$t('Map preview')"
      class="q-mt-sm tagam-map-static-fallback"
    />
    <q-btn
      flat
      dense
      color="primary"
      :label="$t('Retry')"
      class="q-mt-sm"
      @click="reloadMap"
    />
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
      color="primary"
      text-color="white"
      size="0.8rem"
      class="tagam-map-adjust-btn"
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
let googleRoutePolyline;
let googleMarkerLibrary;
let googleCoreLibrary;

let yandex_map;
let yandex_zoom = 16.6;

export default {
  name: "MapsComponents",
  inheritAttrs: false,
  emits: [
    "afterSelectmap",
    "dragMarker",
    "afterGetlocation",
    "setBusy",
    "setError",
    "onAdjustlocation",
  ],
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
    "map_id",
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
      error_message: "",
      googleAuthFailed: false,
      previousGoogleAuthFailureHandler: null,
    };
  },
  beforeUnmount() {
    if (typeof window !== "undefined") {
      window.gm_authFailure = this.previousGoogleAuthFailureHandler;
    }
  },
  mounted() {
    this.loadMap();
  },
  watch: {
    markers(newval, oldval) {
      if (!this.error_message && this.cmaps) {
        this.renderMap();
      }
    },
    provider(newval, oldval) {
      this.error_message = "";
      this.loadMap();
    },
    keys() {
      this.error_message = "";
      this.loadMap();
    },
  },
  computed: {
    isMapAvailable() {
      if (this.provider === "google.maps") {
        return (
          typeof window !== "undefined" &&
          window.google &&
          window.google.maps
        );
      }
      if (this.provider === "mapbox") {
        return (
          typeof window !== "undefined" &&
          window.mapboxgl
        );
      }
      if (this.provider === "yandex") {
        return typeof window !== "undefined" && window.ymap;
      }
      return false;
    },
    showCenterPin() {
      return (
        !this.error_message &&
        Object.values(this.markers || {}).some((marker) => marker?.draggable)
      );
    },
    googleStaticMapUrl() {
      if (this.provider !== "google.maps" || APIinterface.empty(this.keys)) {
        return "";
      }

      const marker = Object.values(this.markers || {}).find(
        (item) =>
          !APIinterface.empty(item?.lat) && !APIinterface.empty(item?.lng)
      );
      const lat = !APIinterface.empty(marker?.lat)
        ? marker.lat
        : this.center?.lat;
      const lng = !APIinterface.empty(marker?.lng)
        ? marker.lng
        : this.center?.lng;

      if (APIinterface.empty(lat) || APIinterface.empty(lng)) {
        return "";
      }

      const params = new URLSearchParams({
        center: `${lat},${lng}`,
        zoom: String(parseInt(this.zoom) || 14),
        size: "600x300",
        scale: "2",
        maptype: "roadmap",
        key: this.keys,
      });

      if (marker) {
        params.append("markers", `color:red|${lat},${lng}`);
      }

      return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
    },
  },
  methods: {
    getMapProviderErrorMessage() {
      if (this.provider === "google.maps") {
        return this.$t(
          "Google Maps auth failed. Check API key, billing and allowed web domains."
        );
      }
      if (this.provider === "mapbox") {
        return this.$t("Mapbox did not initialize.");
      }
      if (this.provider === "yandex") {
        return this.$t("Yandex map did not initialize.");
      }
      return this.$t("Map runtime is not available.");
    },
    registerGoogleAuthFailure() {
      if (typeof window === "undefined") {
        return;
      }

      this.previousGoogleAuthFailureHandler = window.gm_authFailure;
      this.googleAuthFailed = false;

      window.gm_authFailure = () => {
        this.googleAuthFailed = true;
        this.setMapError(this.getMapProviderErrorMessage());
        if (typeof this.previousGoogleAuthFailureHandler === "function") {
          this.previousGoogleAuthFailureHandler();
        }
      };
    },
    waitForMapRuntime(timeout = 12000) {
      const started = Date.now();

      return new Promise((resolve, reject) => {
        const tick = () => {
          if (this.isMapAvailable) {
            resolve(true);
            return;
          }
          if (this.googleAuthFailed) {
            reject(new Error(this.getMapProviderErrorMessage()));
            return;
          }
          if (Date.now() - started >= timeout) {
            reject(new Error(this.$t("Map script load timeout.")));
            return;
          }
          requestAnimationFrame(tick);
        };

        tick();
      });
    },
    getGoogleMapScriptUrl() {
      return `https://maps.googleapis.com/maps/api/js?libraries=places,marker&key=${encodeURIComponent(
        this.keys
      )}`;
    },
    getMapboxScriptUrl() {
      return "https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js";
    },
    getYandexScriptUrl() {
      return `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(
        this.keys
      )}&lang=${encodeURIComponent(this.language || "en-US")}`;
    },
    loadMap() {
      try {
        this.loading = true;
        this.error_message = "";
        this.googleAuthFailed = false;

        if (!this.provider || APIinterface.empty(this.keys)) {
          this.setMapError(this.$t("Map provider is not configured."));
          return;
        }

        this.cmaps = undefined;

        switch (this.provider) {
          case "google.maps":
            this.registerGoogleAuthFailure();
            Promise.race([
              loadScript(this.getGoogleMapScriptUrl()),
              new Promise((_, reject) => {
                setTimeout(() => reject(new Error(this.$t("Map script load timeout."))), 12000);
              }),
            ])
              .then(() => this.waitForMapRuntime())
              .then(async () => {
                await this.renderMap();
                this.loading = false;
              })
              .catch((error) => {
                this.setMapError(
                  this.googleAuthFailed
                    ? this.getMapProviderErrorMessage()
                    : error?.message ||
                        this.$t("Failed loading google maps script.")
                );
              });
            break;
          case "mapbox":
            loadScript(this.getMapboxScriptUrl())
              .then(() => {
                if (this.isMapAvailable) {
                  this.renderMap();
                  this.loading = false;
                } else {
                  this.setMapError(this.$t("Mapbox runtime is not available."));
                }
              })
              .catch(() => {
                this.setMapError(this.$t("Failed loading mapbox script."));
              });
            break;
          case "yandex":
            loadScript(this.getYandexScriptUrl())
              .then(() => {
                if (this.isMapAvailable) {
                  this.renderMap();
                  this.loading = false;
                } else {
                  this.setMapError(this.$t("Yandex runtime is not available."));
                }
              })
              .catch(() => {
                this.setMapError(this.$t("Failed loading yandex maps script."));
              });
            break;
        }
      } catch (err) {
        console.error(err);
        this.setMapError(this.$t("Failed loading map script."));
      }
    },
    async renderMap() {
      try {
        if (!this.isMapAvailable) {
          this.setMapError(this.$t("Map runtime is not available."));
          return;
        }
        switch (this.provider) {
          case "google.maps":
            await this.ensureGoogleMarkerLibrary();
            const googleCore = await this.ensureGoogleCoreLibrary();
            const LatLngBounds = this.getGoogleConstructor(
              googleCore,
              "LatLngBounds"
            );
            const Map = this.getGoogleConstructor(googleCore, "Map");
            if (!Map) {
              throw new Error("Google Map is not available.");
            }
            bounds = LatLngBounds ? new LatLngBounds() : null;
            if (typeof this.cmaps !== "undefined" && this.cmaps !== null) {
              Object.entries(this.markers).forEach(([key, items]) => {
                this.removeMarker(items.id);
              });
            } else {
              this.cmaps = new Map(this.$refs.cmaps, {
                center: {
                  lat: parseFloat(this.center.lat),
                  lng: parseFloat(this.center.lng),
                },
                zoom: parseInt(this.zoom),
                disableDefaultUI: true,
                mapId: this.map_id || "DEMO_MAP_ID",
              });
            }

            for (const [, items] of Object.entries(this.markers)) {
              await this.addMarker(
                {
                  position: {
                    lat: parseFloat(items.lat),
                    lng: parseFloat(items.lng),
                  },
                  map: this.cmaps,
                  draggable: items.draggable,
                  icon: {
                    url: items.icon,
                    scaledSize: this.createGoogleSize(
                      googleCore,
                      items.id == 3 ? 30 : 45,
                      items.id == 3 ? 30 : 45
                    ),
                  },
                  title: items.title,
                },
                items.id,
                items.draggable
              );
            }

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
        this.setMapError(this.$t("Failed rendering map."));
      }
    },
    async ensureGoogleMarkerLibrary() {
      if (googleMarkerLibrary) {
        return googleMarkerLibrary;
      }
      if (window.google?.maps?.importLibrary) {
        googleMarkerLibrary = await window.google.maps.importLibrary("marker");
        return googleMarkerLibrary;
      }
      googleMarkerLibrary = window.google?.maps?.marker || null;
      return googleMarkerLibrary;
    },
    async ensureGoogleCoreLibrary() {
      if (googleCoreLibrary) {
        return googleCoreLibrary;
      }
      if (window.google?.maps?.Map) {
        googleCoreLibrary = window.google.maps;
        return googleCoreLibrary;
      }
      if (window.google?.maps?.importLibrary) {
        const coreLibrary = await window.google.maps.importLibrary("core");
        let mapsLibrary = {};
        try {
          mapsLibrary = await window.google.maps.importLibrary("maps");
        } catch (err) {
          console.debug(err);
        }
        googleCoreLibrary = {
          ...(window.google?.maps || {}),
          ...mapsLibrary,
          ...coreLibrary,
        };
      } else {
        googleCoreLibrary = window.google?.maps || {};
      }
      return googleCoreLibrary;
    },
    getGoogleConstructor(googleCore, name) {
      const constructor =
        window.google?.maps?.[name] ||
        window.google?.maps?.marker?.[name] ||
        googleCore?.[name];
      return typeof constructor === "function" ? constructor : null;
    },
    createGoogleSize(googleCore, width, height) {
      const Size = this.getGoogleConstructor(googleCore, "Size");
      if (Size) {
        return new Size(width, height);
      }
      return { width, height };
    },
    createGoogleLatLng(googleCore, lat, lng) {
      const LatLng = this.getGoogleConstructor(googleCore, "LatLng");
      if (LatLng) {
        return new LatLng(lat, lng);
      }
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    },
    createGoogleMarkerContent(properties) {
      const iconUrl = properties?.icon?.url || properties?.icon || "";
      if (APIinterface.empty(iconUrl)) {
        return null;
      }

      const img = document.createElement("img");
      img.src = iconUrl;
      img.alt = properties.title || "";
      img.style.display = "block";
      img.style.objectFit = "contain";
      img.style.width = `${properties?.icon?.scaledSize?.width || 45}px`;
      img.style.height = `${properties?.icon?.scaledSize?.height || 45}px`;
      return img;
    },
    getGoogleMarkerPosition(marker) {
      const position = marker?.position;
      if (!position) {
        return null;
      }
      if (typeof position.lat === "function") {
        return { lat: position.lat(), lng: position.lng() };
      }
      return {
        lat: parseFloat(position.lat),
        lng: parseFloat(position.lng),
      };
    },
    setGoogleMarkerPosition(marker, position) {
      if (!marker) {
        return;
      }
      if (typeof marker.setPosition === "function") {
        marker.setPosition(position);
      } else {
        marker.position = position;
      }
    },
    setMapError(message) {
      this.loading = false;
      this.error_message = message;
      this.$emit("set-error", message);
    },
    reloadMap() {
      if (this.provider === "google.maps") {
        const googleScript = document.querySelector(
          'script[src^="https://maps.googleapis.com/maps/api/js"]'
        );
        if (googleScript) {
          unloadScript(googleScript.getAttribute("src"));
        }
      } else if (this.provider === "mapbox") {
        const mapboxScript = document.querySelector(
          'script[src="https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js"]'
        );
        if (mapboxScript) {
          unloadScript(mapboxScript.getAttribute("src"));
        }
      } else if (this.provider === "yandex") {
        const yandexScript = document.querySelector(
          'script[src^="https://api-maps.yandex.ru/v3/"]'
        );
        if (yandexScript) {
          unloadScript(yandexScript.getAttribute("src"));
        }
      }
      this.loadMap();
    },
    async insertMarker(items) {
      await this.addMarker(
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
    async addMarker(properties, index, draggable) {
      try {
        switch (this.provider) {
          case "google.maps":
            await this.ensureGoogleMarkerLibrary();
            const googleCore = await this.ensureGoogleCoreLibrary();
            const AdvancedMarkerElement =
              googleMarkerLibrary?.AdvancedMarkerElement ||
              window.google?.maps?.marker?.AdvancedMarkerElement;
            const Marker = this.getGoogleConstructor(googleCore, "Marker");

            if (AdvancedMarkerElement) {
              try {
                cmapsMarker[index] = new AdvancedMarkerElement({
                  map: properties.map,
                  position: properties.position,
                  title: properties.title,
                  content: this.createGoogleMarkerContent(properties),
                  gmpDraggable: draggable === true,
                });
              } catch (err) {
                console.debug(err);
              }
            }

            if (!cmapsMarker[index] && Marker) {
              cmapsMarker[index] = new Marker({
                map: properties.map,
                position: properties.position,
                title: properties.title,
                icon: properties.icon,
                draggable: draggable === true,
              });
            }

            if (!cmapsMarker[index]) {
              throw new Error("Google marker runtime is not available.");
            }

            if (properties.title) {
              const InfoWindow = this.getGoogleConstructor(
                googleCore,
                "InfoWindow"
              );
              if (InfoWindow) {
                const infoWindow = new InfoWindow({
                  content: properties.title,
                });
                cmapsMarker[index].addListener("click", () => {
                  infoWindow.open({
                    anchor: cmapsMarker[index],
                    map: this.cmaps,
                  });
                });
              }
            }

            this.cmaps.panTo(
              this.createGoogleLatLng(
                googleCore,
                properties.position.lat,
                properties.position.lng
              )
            );
            if (bounds?.extend) {
              bounds.extend(properties.position);
            }

            if (draggable === true) {
              cmapsMarker[index].addListener("drag", () => {
                this.$emit("dragMarker", true);
              });

              cmapsMarker[index].addListener("dragend", (event) => {
                const latLng = event.latLng || this.getGoogleMarkerPosition(cmapsMarker[index]);
                if (latLng) {
                  this.$emit("dragMarker", false);
                  this.$emit(
                    "afterSelectmap",
                    typeof latLng.lat === "function" ? latLng.lat() : latLng.lat,
                    typeof latLng.lng === "function" ? latLng.lng() : latLng.lng
                  );
                }
              });

              window.google.maps.event.addListener(this.cmaps, "dragstart", () => {
                this.$emit("dragMarker", true);
              });

              window.google.maps.event.addListener(this.cmaps, "drag", () => {
                const new_position = this.cmaps.getCenter();
                this.setGoogleMarkerPosition(cmapsMarker[index], new_position);
              });

              window.google.maps.event.addListener(this.cmaps, "dragend", () => {
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
      if (this.provider == "mapbox") {
        setTimeout(() => {
          this.cmaps.resize();
        }, 500);
      }
    },
    refreshMapSize() {
      if (!this.cmaps || !this.isMapAvailable) {
        return;
      }
      if (this.provider == "mapbox") {
        this.cmaps.resize();
        this.FitBounds();
        return;
      }
      if (this.provider == "google.maps") {
        window.google?.maps?.event?.trigger?.(this.cmaps, "resize");
        this.FitBounds();
        if (Object.keys(this.markers || {}).length <= 1 && this.markers?.[0]) {
          this.setCenter(this.markers[0].lat, this.markers[0].lng);
        }
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
              if (typeof cmapsMarker[index].setMap === "function") {
                cmapsMarker[index].setMap(null);
              } else {
                cmapsMarker[index].map = null;
              }
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
        if (!this.cmaps || !this.isMapAvailable) {
          return;
        }
        switch (this.provider) {
          case "google.maps":
            if (!APIinterface.empty(bounds) && bounds?.extend) {
              this.cmaps.fitBounds(bounds);
            }
            break;
          case "mapbox":
            if (!APIinterface.empty(bounds)) {
              this.cmaps.fitBounds(bounds, { duration: 0, padding: 50 });
            }
            break;
        }
      } catch (err) {
        console.error(err);
      }
    },
    async setCenter(lat, lng) {
      try {
        if (!this.cmaps || !this.isMapAvailable) {
          return;
        }
        switch (this.provider) {
          case "google.maps":
            this.cmaps.setCenter(
              this.createGoogleLatLng(
                await this.ensureGoogleCoreLibrary(),
                lat,
                lng
              )
            );
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
    async setNewCoordinates(data, index) {
      if (!this.cmaps || !this.isMapAvailable) {
        return;
      }
      if (!cmapsMarker[index]) {
        await this.insertMarker({
          id: index,
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
          icon: this.markers?.[index]?.icon || "",
          draggable: this.markers?.[index]?.draggable ?? true,
          title: this.markers?.[index]?.title,
        });
      }

      if (cmapsMarker[index]) {
        if (this.provider == "mapbox") {
          const mapboxCoordinates = [parseFloat(data.lng), parseFloat(data.lat)];
          cmapsMarker[index].setLngLat(mapboxCoordinates);
          const currentZoom = this.cmaps.getZoom();
          this.cmaps.jumpTo({
            center: mapboxCoordinates,
            zoom: currentZoom,
            speed: 1,
            curve: 1,
            easing: (t) => t,
          });
        } else {
          this.setGoogleMarkerPosition(cmapsMarker[index], data);
          this.cmaps.panTo(
            this.createGoogleLatLng(
              await this.ensureGoogleCoreLibrary(),
              data.lat,
              data.lng
            )
          );
          const currentZoom = this.cmaps.getZoom();
          this.cmaps.setZoom(currentZoom);
        }
      }
    },
    async addRoute(start, end) {
      if (this.provider == "mapbox") {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
          { method: "GET" }
        );
        const json = await query.json();
        const data = json.routes[0];
        const route = data.geometry;
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
        await this.addGoogleRoute(start, end);
      }
    },
    decodeGooglePolyline(encoded) {
      let index = 0;
      let lat = 0;
      let lng = 0;
      const path = [];

      while (index < encoded.length) {
        let result = 0;
        let shift = 0;
        let byte = null;

        do {
          byte = encoded.charCodeAt(index++) - 63;
          result |= (byte & 0x1f) << shift;
          shift += 5;
        } while (byte >= 0x20);

        lat += result & 1 ? ~(result >> 1) : result >> 1;
        result = 0;
        shift = 0;

        do {
          byte = encoded.charCodeAt(index++) - 63;
          result |= (byte & 0x1f) << shift;
          shift += 5;
        } while (byte >= 0x20);

        lng += result & 1 ? ~(result >> 1) : result >> 1;
        path.push({ lat: lat / 1e5, lng: lng / 1e5 });
      }

      return path;
    },
    async addGoogleRoute(start, end) {
      if (googleRoutePolyline) {
        googleRoutePolyline.setMap(null);
        googleRoutePolyline = null;
      }

      const response = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": this.keys,
            "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: parseFloat(start.lat),
                  longitude: parseFloat(start.lng),
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: parseFloat(end.lat),
                  longitude: parseFloat(end.lng),
                },
              },
            },
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_UNAWARE",
            computeAlternativeRoutes: false,
            polylineQuality: "HIGH_QUALITY",
            polylineEncoding: "ENCODED_POLYLINE",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Routes API request failed: ${response.status}`);
      }

      const json = await response.json();
      const encodedPolyline = json?.routes?.[0]?.polyline?.encodedPolyline;
      if (APIinterface.empty(encodedPolyline)) {
        throw new Error("Routes API did not return a polyline.");
      }

      const path = this.decodeGooglePolyline(encodedPolyline);
      const googleCore = await this.ensureGoogleCoreLibrary();
      const Polyline = this.getGoogleConstructor(googleCore, "Polyline");
      if (!Polyline) {
        throw new Error("Google Polyline is not available.");
      }

      googleRoutePolyline = new Polyline({
        path,
        map: this.cmaps,
        strokeColor: "#76adeb",
        strokeWeight: 7,
        strokeOpacity: 0.86,
      });

      const LatLngBounds = this.getGoogleConstructor(googleCore, "LatLngBounds");
      if (LatLngBounds) {
        const routeBounds = new LatLngBounds();
        path.forEach((point) => routeBounds.extend(point));
        this.cmaps.fitBounds(routeBounds);
      } else if (path.length > 0) {
        this.cmaps.setCenter(path[Math.floor(path.length / 2)]);
      }
    },
    removeMarkers(index) {
      if (cmapsMarker[index]) {
        if (this.provider == "mapbox") {
          cmapsMarker[index].remove();
        } else if (this.provider == "google.maps") {
          if (typeof cmapsMarker[index].setMap === "function") {
            cmapsMarker[index].setMap(null);
          } else {
            cmapsMarker[index].map = null;
          }
          cmapsMarker[index] = null;
        }
      }
    },
    zoomIn() {
      if (!this.cmaps) {
        return;
      }
      const currentZoom = this.cmaps.getZoom();
      this.cmaps.setZoom(currentZoom + 1);
    },
    zoomOut() {
      if (!this.cmaps) {
        return;
      }
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

<style scoped>
.tagam-map-adjust-btn {
  min-height: 42px;
  padding: 0 18px;
  box-shadow: 0 14px 30px rgba(255, 89, 56, 0.22);
}

.tagam-map-center-pin {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 5;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff7248 0%, #ff4f2d 100%);
  color: white;
  box-shadow:
    0 18px 34px rgba(255, 89, 56, 0.28),
    0 0 0 8px rgba(255, 255, 255, 0.78);
  transform: translate(-50%, -92%);
  pointer-events: none;
}

.tagam-map-center-pin::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -9px;
  width: 16px;
  height: 16px;
  border-radius: 0 0 4px 0;
  background: #ff4f2d;
  transform: translateX(-50%) rotate(45deg);
}

.tagam-map-center-pin .q-icon {
  position: relative;
  z-index: 1;
  font-size: 28px;
}

.tagam-map-static-fallback {
  width: min(92%, 520px);
  max-width: 520px;
  aspect-ratio: 2 / 1;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.35);
}
</style>




