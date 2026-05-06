import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import jwt_decode from "jwt-decode";
import { NativeAudio } from "@capacitor-community/native-audio";
import { Notify } from "quasar";

export const useDataStore = defineStore("datastore", {
  state: () => ({
    loading_cuisine: true,
    cuisine: [],
    price_range_data: null,
    sort_by: [],
    max_delivery_data: [],
    sort_list: [],
    banner_loading: true,
    banner: [],
    featured_data: null,
    filters: [],
    car_loading: [true, true],
    car_data: [],
    car_cuisine: [],
    car_reviews: [],
    car_estimation: [],
    car_services: [],
    list_loading: true,
    list_loading_handle: false,
    list_data: [],
    list_cuisine: [],
    list_reviews: [],
    list_estimation: [],
    list_services: [],
    list_featured_id: "",
    phone_prefix_data: [],
    phone_default_data: [],
    tips_data: [],
    maps_config: null,
    language_data: null,
    money_config: [],
    realtime_data: null,
    promos: [],
    legal_menu: {
      page_privacy_policy: "Privacy Policy",
      page_terms: "Terms of Service",
      page_aboutus: "About us",
    },
    loading_page: false,
    page_data: [],
    dark_mode: false,
    invite_friend_settings: [],
    fb_flag: false,
    google_login_enabled: false,
    app_enabled_apple_login: false,
    enabled_language: false,
    loading: false,
    multicurrency_enabled: false,
    multicurrency_hide_payment: false,
    multicurrency_enabled_force: false,
    default_currency_code: "",
    currency_list: "",
    points_enabled: false,
    captcha_settings: [],
    booking_status_list: [],
    food_list: [],
    merchant_list: [],
    cuisine_list: [],
    addons_use_checkbox: false,
    category_use_slide: true,
    use_thresholds: false,
    digitalwallet_enabled: false,
    digitalwallet_enabled_topup: false,
    chat_enabled: false,
    appversion_data: [],
    app_version: 0,
    enabled_include_utensils: false,
    enabled_review: true,
    address_format_use: 1,
    password_reset_options: "",
    signup_resend_counter: "",
    suggested_data: null,
    data_chat: null,
    last_message_data: {},
    cancel_order_enabled: false,
    identification_list: null,
    custom_fields: null,
    featured_items: null,
    featured_loading: false,
    menu_is_scrolled: false,

    online_services: null,
    default_service: null,
    offers_filters: null,

    // filter_sortby: "",
    // filter_restaurant_options: "",
    // filter_cuisine: [],
    // filter_order_type: "",
    // filter_price_range: "",
    // filter_promo: [],
    // filter_quick: [],
    filter_home: null,
    filter_search: null,
    filter_page: null,

    feed_filter: [],

    recommended_data: null,
    recommended_loading: false,
    modal_search: false,

    homepage_filters: null,

    //restaurants: [],
    //isDataLoaded: false,
    //PageIndex: null,
    //savedHasMore: true,
    feedresults_data: [],
    feedresults_current_page: null,
    feedresults_has_more: null,
    feedresults_filters: null,

    paused: false,
    orders_list: null,
    PageIndexOrders: null,

    isDataLoadedOrders: false,
    orders_no_more_data: false,
    order_tab: "recent",
    delivery_option: null,
    wallet_discount_data: null,

    notificationData: [],
    notificationPage: 0,
    isNotiLoaded: false,

    review_attr_data: null,
    push_handle: null,
    login_method: null,
    attributes_data: null,
    tracking_data: null,

    menu_refresh: null,
    is_messaging_supported: null,
    device_identifier: null,
    device_platform: null,
    quick_filters: [],

    // for feed/location
    feed_saved_items: [],
    feed_saved_currentpage: null,
    feed_saved_has_more: null,
    feed_featured_id: null,
    feed_saved_total: null,
    feed_saved_filters: null,
    feed_page_filter: {},
    feed_filters: {
      filter_sortby: "",
      filter_restaurant_options: "",
      filter_quick: [],
      filter_promo: [],
      filter_cuisine: [],
      filter_order_type: "",
      filter_price_range: "",
    },
    saved_location_data: null,

    // for search location
    search_query: null,
    search_saved: [],
    search_saved_currentpage: null,
    search_saved_has_more: null,

    // for offerpage
    offer_saved_data: {
      data: [],
      current_page: null,
      hasMore: null,
      total_found: null,
    },
    offer_filters: null,

    // favorites
    fav_saved_tab: null,
    fav_saved_data: null,
    fav_saved_current_page: null,
    fav_saved_has_more: null,

    statusColor: {
      pending: {
        bg: "amber-5",
        text: "black",
      },
      confirmed: {
        bg: "blue-5",
        text: "white",
      },
      cancelled: {
        bg: "red-5",
        text: "white",
      },
      denied: {
        bg: "red-10",
        text: "white",
      },
      finished: {
        bg: "green-5",
        text: "white",
      },
      no_show: {
        bg: "grey-7",
        text: "white",
      },
      waitlist: {
        bg: "purple-5",
        text: "white",
      },
    },
  }),

  getters: {
    hasCuisine() {
      if (Object.keys(this.cuisine).length > 0) {
        return true;
      }
      return false;
    },
    hasFeed() {
      if (Object.keys(this.list_data).length > 0) {
        return true;
      }
      return false;
    },
    hasPage() {
      if (Object.keys(this.page_data).length > 0) {
        return true;
      }
      return false;
    },
    hasMapConfig() {
      return this.maps_config ? true : false;
    },
    getBookingSettings(state) {
      return state.captcha_settings;
    },
    getBookingStatusList(state) {
      return state.booking_status_list;
    },
    getDeliveryOptions(state) {
      return state.delivery_option ?? null;
    },
    getTipList(state) {
      return state.tips_data ?? null;
    },
    getPusher(state) {
      return !state.realtime_data ? false : state.realtime_data;
    },
    getSearchMode(state) {
      return state.attributes_data?.search_mode || null;
    },
    getLocationType(state) {
      return parseInt(state.attributes_data?.location_searchtype) || 1;
    },
    countryID(state) {
      return parseInt(state.attributes_data?.country_id) || null;
    },
    getMenuDisplayType(state) {
      return state.attributes_data?.menu_display_type || "all";
    },
  },

  actions: {
    clearPageFilter() {
      this.feed_filters = {
        filter_sortby: "",
        filter_restaurant_options: "",
        filter_quick: [],
        filter_promo: [],
        filter_cuisine: [],
        filter_order_type: "",
        filter_price_range: "",
      };
    },
    setOrders(value) {
      this.orders_list = value;
      this.isDataLoadedOrders = true;
    },
    appendOrders(value) {
      this.orders_list = [...this.orders_list, ...value];
    },
    clearOrders() {
      this.orders_list = null;
      this.isDataLoadedOrders = false;
      this.PageIndexOrders = null;
    },
    setCurrentPageOrders(value) {
      this.PageIndexOrders = value;
    },
    clearPageOrders() {
      this.PageIndexOrders = null;
    },

    setRestaurants(newRestaurants) {
      this.restaurants = newRestaurants;
      this.isDataLoaded = true;
    },
    appendRestaurants(newRestaurants) {
      this.restaurants = [...this.restaurants, ...newRestaurants];
    },
    clearData() {
      console.log("clearData");
      this.restaurants = [];
      this.isDataLoaded = false;
      this.PageIndex = null;
    },
    setCurrentPage(value) {
      console.log("setCurrentPage", value);
      this.PageIndex = value;
    },
    clearPage() {
      console.log("clearPage");
      this.PageIndex = null;
    },
    pauseScroll() {
      this.paused = true;
    },
    resumeScroll() {
      this.paused = false;
    },
    CuisineList() {
      this.loading_cuisine = true;
      APIinterface.CuisineList(4, "")
        .then((data) => {
          this.cuisine = data.details.data;
        })
        .catch((error) => {
          this.cuisine = [];
        })
        .then((data) => {
          this.loading_cuisine = false;
        });
    },
    hasDataCuisine() {
      if (Object.keys(this.cuisine).length > 0) {
        return true;
      }
      return false;
    },
    searchAttributes(currency_code) {
      if (this.price_range_data) {
        return;
      }
      APIinterface.searchAttributes(currency_code)
        .then((data) => {
          this.price_range_data = data.details.price_range;
          this.sort_by = data.details.sort_by;
          this.max_delivery_data = data.details.max_delivery_fee;
          this.sort_list = data.details.sort_list;
          this.offers_filters = data.details.offers_filters;
          this.quick_filters = data.details.quick_filters;
        })
        .catch((error) => {
          this.price_range_data = null;
          this.sort_by = [];
          this.max_delivery_data = [];
          this.sort_list = [];
          this.offers_filters = [];
          this.quick_filters = [];
        })
        .then((data) => {
          //
        });
    },
    getBanner(data) {
      this.banner_loading = true;
      APIinterface.getBanner(data)
        .then((data) => {
          this.banner = data.details.data;
          this.food_list = data.details.food_list;
          this.merchant_list = data.details.merchant_list;
          this.cuisine_list = data.details.cuisine_list;
        })
        // eslint-disable-next-line
        .catch((error) => {
          this.banner = [];
          this.food_list = [];
          this.merchant_list = [];
          this.cuisine_list = [];
        })
        .then((data) => {
          this.banner_loading = false;
        });
    },
    async getBannerLocation(value) {
      try {
        const response = await APIinterface.fetchGet(
          "/apilocations/getBanner",
          value
        );
        this.banner = response.details?.data || [];
        this.food_list = response.details?.food_list || [];
        this.merchant_list = response.details?.merchant_list || [];
        this.cuisine_list = response.details?.cuisine_list || [];
      } catch (error) {
        this.banner = [];
        this.food_list = [];
        this.merchant_list = [];
        this.cuisine_list = [];
      } finally {
        this.banner_loading = false;
      }
    },
    getFeaturedList() {
      APIinterface.getFeaturedList()
        .then((data) => {
          this.featured_data = data.details.data;
        })
        .catch((error) => {
          this.featured_data = null;
        })
        .then((data) => {});
    },
    getCarouselData(params, index) {
      this.car_loading[index] = true;
      APIinterface.getMerchantFeed(params)
        .then((data) => {
          this.car_data[index] = data.details.data;
          this.car_cuisine[index] = data.details.cuisine;
          this.car_reviews[index] = data.details.reviews;
          this.car_estimation[index] = data.details.estimation;
          this.car_services[index] = data.details.services;
        })
        .catch((error) => {
          this.car_data[index] = [];
        })
        .then((data) => {
          this.car_loading[index] = false;
        });
    },
    hasCarData(index) {
      if (APIinterface.empty(this.car_data[index])) {
        return false;
      } else {
        if (Object.keys(this.car_data[index]).length > 0) {
          return true;
        }
      }
      return false;
    },
    getMerchantFeed(params) {
      this.list_loading = true;
      APIinterface.getMerchantFeed(params)
        .then((data) => {
          this.list_data = data.details.data;
          this.list_cuisine = data.details.cuisine;
          this.list_reviews = data.details.reviews;
          this.list_estimation = data.details.estimation;
          this.list_services = data.details.services;
          this.promos = data.details.promos;
        })
        .catch((error) => {
          this.list_data = [];
          this.list_cuisine = [];
          this.list_reviews = [];
          this.list_estimation = [];
          this.list_services = [];
          this.promos = [];
        })
        .then((data) => {
          this.list_loading = false;
          this.list_loading_handle = !this.list_loading_handle;
        });
    },
    hadPrefix() {
      if (APIinterface.empty(this.phone_prefix_data)) {
        return false;
      } else {
        if (Object.keys(this.phone_prefix_data).length > 0) {
          return true;
        }
      }
      return false;
    },
    getAttributes(done) {
      this.loading = true;
      APIinterface.fetchDataPost("getAttributes", "")
        .then((data) => {
          this.phone_default_data = data.details.phone_default_data;
          this.tips_data = data.details.tips_list;
          this.maps_config = jwt_decode(data.details.maps_config);
          this.language_data = jwt_decode(data.details.language_data);
          this.money_config = data.details.money_config;
          this.realtime_data = jwt_decode(data.details.realtime);
          this.invite_friend_settings = data.details.invite_friend_settings;
          this.enabled_language = data.details.enabled_language;
          this.addons_use_checkbox = data.details.addons_use_checkbox;
          this.category_use_slide = data.details.category_use_slide;

          this.google_login_enabled = settings.app_enabled_google_login;
          this.fb_flag = settings.app_enabled_fb_login;
          this.app_enabled_apple_login = settings.app_enabled_apple_login;

          this.multicurrency_enabled = data.details.multicurrency_enabled;
          this.multicurrency_hide_payment =
            data.details.multicurrency_hide_payment;
          this.multicurrency_enabled_force =
            data.details.multicurrency_enabled_force;

          this.default_currency_code = data.details.default_currency_code;
          this.currency_list = data.details.currency_list;

          this.points_enabled = data.details.points_enabled;
          this.captcha_settings = data.details.captcha_settings;
          this.booking_status_list = data.details.booking_status_list;

          this.use_thresholds = data.details.use_thresholds;
          this.digitalwallet_enabled = data.details.digitalwallet_enabled;
          this.digitalwallet_enabled_topup =
            data.details.digitalwallet_enabled_topup;
          this.chat_enabled = data.details.chat_enabled;
          this.appversion_data = data.details.appversion_data;
          this.enabled_include_utensils = data.details.enabled_include_utensils;
          this.enabled_review = data.details.enabled_review;

          this.address_format_use = data.details.address_format_use;
          this.password_reset_options = data.details.password_reset_options;
          this.signup_resend_counter = data.details.signup_resend_counter;

          this.cancel_order_enabled = data.details.cancel_order_enabled;

          this.online_services = data.details.online_services;
          this.default_service = data.details.default_service;

          this.delivery_option = data.details.delivery_option;

          if (Object.keys(data.details.phone_prefix_data).length > 0) {
            Object.entries(data.details.phone_prefix_data).forEach(
              ([key, items]) => {
                this.phone_prefix_data.push({
                  label: "+" + items.phonecode + " " + items.country_name,
                  value: "+" + items.phonecode,
                  flag: items.flag,
                });
              }
            );
          }
        })
        .catch((error) => {
          console.log("error", error);
          this.phone_prefix_data = [];
          this.tips_data = [];
          this.maps_config = null;
          this.language_data = null;
          this.money_config = [];
          this.realtime_data = null;
          this.invite_friend_settings = [];
          this.enabled_language = false;
        })
        .then((data) => {
          this.loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
    getPage(done, pageId) {
      if (APIinterface.empty(done)) {
        this.loading_page = true;
      }
      APIinterface.fetchDataPost("getPage", "page_id=" + pageId)
        .then((data) => {
          this.page_data = data.details;
        })
        .catch((error) => {
          this.page_data = [];
        })
        .then((data) => {
          this.loading_page = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },

    fetchFeaturedItems(params) {
      if (!this.featured_items) {
        this.featured_loading = true;
        APIinterface.fetchGetRequest("getFeaturedItems", params)
          .then((data) => {
            this.featured_items = data.details.data;
          })
          .catch((error) => {
            this.featured_items = null;
          })
          .then((data) => {
            this.featured_loading = false;
          });
      }
    },

    async getRecommended(params) {
      if (this.recommended_data) {
        return;
      }

      try {
        this.recommended_loading = true;
        const result = await APIinterface.getMerchantFeed(params);
        if (result.code == 1) {
          this.recommended_data = result.details.data;
        }
      } catch (error) {
      } finally {
        this.recommended_loading = false;
      }
    },

    async getWalletdiscount() {
      try {
        const result = await APIinterface.fetchDataByTokenPost(
          "getDiscount",
          "transaction_type=digital_wallet"
        );
        this.wallet_discount_data = result.details;
      } catch (error) {
        throw error;
      } finally {
      }
    },

    getTextColors(value) {
      if (this.statusColor[value]) {
        return this.statusColor[value]?.text;
      }
      return "white";
    },
    getColors(value) {
      if (this.statusColor[value]) {
        return this.statusColor[value]?.bg;
      }
      return "blue-grey-4";
    },

    async fetchReviewAttributes() {
      try {
        if (this.review_attr_data) {
          return;
        }
        const results = await APIinterface.fetchDataByTokenGet(
          "reviewAttributes"
        );
        this.review_attr_data = results.details;
        return results.details;
      } catch (error) {
        throw error;
      } finally {
      }
    },

    clearFeedSavedData() {
      this.feed_saved_items = [];
      this.feed_saved_currentpage = null;
      this.feed_saved_has_more = null;
      this.feed_featured_id = null;
      this.feed_saved_total = null;
    },

    getLoginRedirect(redirect = "/home") {
      const loginMethod = this.login_method;
      return loginMethod === "otp"
        ? "/user/login-otp?redirect=" + redirect
        : "/user/login?redirect=" + redirect;
    },

    playAlert(message) {
      NativeAudio.play({ assetId: "notify" });
      Notify.create({
        type: "warning",
        message: message,
        timeout: 2000,
        position: "top-right",
        icon: "notifications_active",
        classes: "mynotification",
      });
    },

    //
  },
});
