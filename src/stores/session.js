import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import { LocalStorage } from "src/services/storage";

const introKey = "intro_seen";
const coordinatesKey = "coordinates";
const placeDataKey = "place_data";
const legacyInvalidCoordinates = { lat: 39.992068, lng: 52.977486 };
const ashgabatDefaultCoordinates = { lat: 37.9601, lng: 58.3261 };
const ashgabatDefaultPlace = {
  formatted_address: "Ashgabat, Turkmenistan",
  place_id: "tagam-ashgabat",
};

const isLegacyInvalidCoordinates = (coordinates) =>
  coordinates?.lat &&
  coordinates?.lng &&
  Math.abs(Number(coordinates.lat) - legacyInvalidCoordinates.lat) < 0.000001 &&
  Math.abs(Number(coordinates.lng) - legacyInvalidCoordinates.lng) < 0.000001;

const migrateCoordinates = () => {
  const coordinates = LocalStorage.getItem(coordinatesKey);
  if (!isLegacyInvalidCoordinates(coordinates)) return coordinates;

  LocalStorage.set(coordinatesKey, ashgabatDefaultCoordinates);
  LocalStorage.set(placeDataKey, ashgabatDefaultPlace);
  LocalStorage.set("place_id", ashgabatDefaultPlace.place_id);
  return ashgabatDefaultCoordinates;
};

export const useSessionStore = defineStore("session", {
  state: () => ({
    introSeen: Boolean(LocalStorage.getItem(introKey)),
    coordinates: migrateCoordinates(),
    placeData: LocalStorage.getItem(placeDataKey),
    locating: false,
    locationError: "",
  }),
  getters: {
    hasCoordinates: (state) => Boolean(state.coordinates?.lat && state.coordinates?.lng),
    locationLabel: (state) =>
      state.placeData?.address?.formatted_address ||
      state.placeData?.formatted_address ||
      state.placeData?.address?.address1 ||
      "Выберите локацию",
  },
  actions: {
    completeIntro() {
      this.introSeen = true;
      LocalStorage.set(introKey, true);
    },
    async saveCoordinates(lat, lng) {
      this.locating = true;
      this.locationError = "";

      try {
        const response = await APIinterface.reverseGeocoding(lat, lng);
        const placeData = response.details?.data;

        this.coordinates = { lat: Number(lat), lng: Number(lng) };
        this.placeData = placeData;

        LocalStorage.set(coordinatesKey, this.coordinates);
        LocalStorage.set(placeDataKey, placeData);
        if (placeData?.place_id) {
          LocalStorage.set("place_id", placeData.place_id);
        }

        return placeData;
      } catch (error) {
        this.locationError = error?.message ?? String(error);
        throw error;
      } finally {
        this.locating = false;
      }
    },
    savePlaceSelection(coordinates, placeData) {
      this.coordinates = {
        lat: Number(coordinates?.lat),
        lng: Number(coordinates?.lng),
      };
      this.placeData = placeData;

      LocalStorage.set(coordinatesKey, this.coordinates);
      LocalStorage.set(placeDataKey, placeData);
      if (placeData?.place_id) {
        LocalStorage.set("place_id", placeData.place_id);
      }
    },
    locateBrowser() {
      if (!navigator.geolocation) {
        this.locationError = "Браузер не поддерживает геолокацию.";
        return Promise.reject(new Error(this.locationError));
      }

      this.locating = true;
      this.locationError = "";

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const placeData = await this.saveCoordinates(position.coords.latitude, position.coords.longitude);
              resolve(placeData);
            } catch (error) {
              reject(error);
            }
          },
          (error) => {
            this.locating = false;
            this.locationError = error.message || "Не удалось получить локацию.";
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
        );
      });
    },
  },
});
