import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import AppLocation from "src/api/AppLocation";
import { useI18n } from "vue-i18n";

export const useLocationStore = defineStore("LocationStore", {
  state: () => ({
    counter: 0,
  }),

  getters: {
    doubleCount(state) {
      return state.counter * 2;
    },
  },

  actions: {
    async fetchLocation() {
      return new Promise((resolve, reject) => {
        AppLocation.checkAccuracy()
          .then((data) => {
            //
            AppLocation.getPosition()
              .then((data) => {
                resolve({
                  latitude: data.lat,
                  longitude: data.lng,
                });
              })
              .catch((error) => {
                reject(error);
              })
              .then((data) => {});
            //
          })
          .catch((error) => {
            reject(error);
          })
          .then((data) => {
            //
          });
      });
    },
    async fetchWebLocation(t) {
      if (navigator.geolocation) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (data) => {
              resolve({
                latitude: data.coords.latitude,
                longitude: data.coords.longitude,
              });
            },
            (error) => {
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  reject(t("Error: Permission denied.") + " " + error.message);
                  break;
                case error.POSITION_UNAVAILABLE:
                  reject(
                    t("Error: Position unavailable.") + " " + error.message
                  );
                  break;
                case error.TIMEOUT:
                  reject(t("Error: Request timed out.") + " " + error.message);
                  break;
                default:
                  reject(
                    t("Error: An unknown error occurred.") + " " + error.message
                  );
                  break;
              }
            },
            {
              enableHighAccuracy: true, // Request high accuracy
              timeout: 10000, // Set a timeout in milliseconds
              maximumAge: 0, // Do not use cached location
            }
          );
        });
      } else {
        return Promise.reject(
          new Error("Geolocation is not supported by this browser.")
        );
      }
    },

    async reverseGeocoding(lat, lng) {
      return new Promise((resolve, reject) => {
        APIinterface.reverseGeocoding(lat, lng)
          .then((data) => {
            resolve(data.details.address_details);
          })
          .catch((error) => {
            reject(error);
          })
          .then((data) => {});
      });
    },

    //
  },
});
