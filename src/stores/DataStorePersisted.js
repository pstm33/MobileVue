import { defineStore } from "pinia";

export const useDataStorePersisted = defineStore("datastorepersisted", {
  state: () => ({
    dark_mode: false,
    app_language: null,
    rtl: false,
    choose_language: false,
    use_currency_code: null,
    menu_list_type: "list",
    change_currency: false,
    ageVerified: false,
    recent_searches: [],
    recent_addresses: [],
    place_data: null,
    coordinates: null,
    cart_uuid: null,
    merchant_slug: null,
    recently_change_address: false,
    intro: null,
    push_enabled: true,
    web_token: null,

    // use for location mode
    location_data: null,
    recent_location: [],
  }),

  getters: {
    hasCoordinates(state) {
      // if (state.coordinates) {
      //   return true;
      // }
      // return false;
      return !!state.coordinates;
    },
    hasPlaceData(state) {
      // if (state.place_data) {
      //   return true;
      // }
      // return false;
      return !!state.place_data;
    },
    getLocation(state) {
      return state.location_data ?? null;
    },
    hasLocation(state) {
      return !!state.location_data;
    },
    getLocationAddress(state) {
      const address = state.location_data?.complete_address ?? null;
      const country_name = state.location_data?.country_name ?? null;
      if (!address) {
        return "";
      }
      return `${address} ${country_name}`;
    },
    getRecentLocation(state) {
      return Object.keys(state.recent_location).length
        ? state.recent_location
        : null;
    },
    useCurrency() {
      return !this.use_currency_code ? "" : this.use_currency_code;
    },
  },

  actions: {
    getUseCurrency() {
      return !this.use_currency_code ? "" : this.use_currency_code;
    },
    saveRecentAddress(place_data) {
      this.recent_addresses.unshift(place_data);
      if (this.recent_addresses.length > 8) {
        this.recent_addresses.pop();
      }
    },
    saveRecentLocation(place_data) {
      this.recent_location.unshift(place_data);
      if (this.recent_location.length > 8) {
        this.recent_location.pop();
      }
    },
  },
  persist: true,
});
