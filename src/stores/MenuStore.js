import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";

import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "stores/DataStore";
const DataStorePersisted = useDataStorePersisted();
const DataStore = useDataStore();

export const useMenuStore = defineStore("menu", {
  state: () => ({
    data_info: {},
    data_share: [],
    open_at: {},
    opening_hours: {},
    money_config: [],
    maps_config: [],
    loadin_info: true,
    data_charge_type: {},
    data_estimation: {},
    data_distance: {},
    loading_menu: false,
    data_category: {},
    data_items: {},
    data_gallery: {},
    gallery_images: {},
    data_similar_items: null,
    similar_merchant: null,
    loading_similar_items: false,
    items_not_available: [],
    category_not_available: [],
    merchant_uuid: "",
    restaurant_slug: "",
    booking_settings: [],
    dish: [],
    enabled_age_verification: false,
    estimation_time: "",

    //merchant information
    menu_saved_info: null,
    menu_info_slug: null,

    //menu
    menu_saved_data: null,
    menu_saved_slug: null,

    //category items
    category_items_saved: null,
    category_items_id: null,
  }),

  //persist: true,

  getters: {
    isBookingEnabled(state) {
      return state.booking_settings.booking_enabled;
    },
    getBookingTc(state) {
      return state.booking_settings.booking_reservation_terms;
    },
    getBookingCustomMessage(state) {
      return state.booking_settings.booking_reservation_custom_message;
    },
    allowChooseTable(state) {
      return state.booking_settings.allowed_choose_table;
    },
    isBookingCaptcha(state) {
      return state.booking_settings.captcha_enabled;
    },
    getItemsSimilar(state) {
      return state.data_similar_items ? state.data_similar_items : null;
    },
  },

  actions: {
    cleanMerchantData() {
      this.menu_info_slug = null;
      this.menu_saved_info = null;
    },
    async geStoreMenu(merchantSlug, useCurrencyCode) {
      try {
        this.loading_menu = true;
        const response = await APIinterface.geStoreMenu(
          merchantSlug,
          useCurrencyCode
        );
        this.data_category = response.details.data.category;
        this.data_items = response.details.data.items;
        this.items_not_available = response.details.data.items_not_available;
        this.category_not_available =
          response.details.data.category_not_available;
        this.dish = response.details.data.dish;
        return true;
      } catch (error) {
        throw error;
      } finally {
        this.loading_menu = false;
      }
    },
    getSimilarItems(merchantId) {
      this.loading_similar_items = true;
      APIinterface.fetchDataPost(
        "SimilarItems",
        "merchant_id=" +
          merchantId +
          "&currency_code=" +
          DataStorePersisted.use_currency_code
      )
        .then((data) => {
          console.log(data);
          this.similar_merchant = merchantId;
          this.data_similar_items = data.details.data;
        })
        .catch((error) => {
          this.similar_merchant = null;
          this.data_similar_items = null;
        })
        .then((data) => {
          this.loading_similar_items = false;
        });
    },
  },
});
