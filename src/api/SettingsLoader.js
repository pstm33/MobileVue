// src/services/settingsLoader.js
import { api } from "boot/axios";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";
import jwt_decode from "jwt-decode";

export async function loadAppSettings() {
  const DataStore = useDataStore();
  const DataStorePersisted = useDataStorePersisted();

  api.defaults.params = {};
  api.defaults.params["language"] = DataStorePersisted.app_language;
  const currency_code = DataStorePersisted.useCurrency;

  const results = await APIinterface.fetchDataPost(
    "getAttributes",
    "currency_code=" + currency_code
  );
  const settings = results.details;

  DataStore.phone_default_data = settings.phone_default_data;
  DataStore.login_method = settings.login_method;
  DataStore.attributes_data = settings.data;

  const search_mode = DataStore.attributes_data?.search_mode || null;
  if (search_mode == "address") {
    DataStorePersisted.location_data = null;
  } else {
    DataStorePersisted.coordinates = null;
  }

  DataStore.tips_data = settings.tips_list;
  DataStore.maps_config = jwt_decode(settings.maps_config);
  DataStore.language_data = jwt_decode(settings.language_data);
  DataStore.money_config = settings.money_config;
  DataStore.realtime_data = jwt_decode(settings.realtime);
  DataStore.invite_friend_settings = settings.invite_friend_settings;
  DataStore.enabled_language = settings.enabled_language;
  DataStore.addons_use_checkbox = settings.addons_use_checkbox;
  DataStore.category_use_slide = settings.category_use_slide;

  DataStore.google_login_enabled = settings.app_enabled_google_login;
  DataStore.fb_flag = settings.app_enabled_fb_login;
  DataStore.app_enabled_apple_login = settings.app_enabled_apple_login;

  DataStore.multicurrency_enabled = settings.multicurrency_enabled;
  DataStore.multicurrency_hide_payment = settings.multicurrency_hide_payment;
  DataStore.multicurrency_enabled_force = settings.multicurrency_enabled_force;

  DataStore.default_currency_code = settings.default_currency_code;
  DataStore.currency_list = settings.currency_list;

  DataStore.points_enabled = settings.points_enabled;
  DataStore.captcha_settings = settings.captcha_settings;
  DataStore.booking_status_list = settings.booking_status_list;

  DataStore.use_thresholds = settings.use_thresholds;
  DataStore.digitalwallet_enabled = settings.digitalwallet_enabled;
  DataStore.digitalwallet_enabled_topup = settings.digitalwallet_enabled_topup;
  DataStore.chat_enabled = settings.chat_enabled;
  DataStore.appversion_data = settings.appversion_data;
  DataStore.enabled_include_utensils = settings.enabled_include_utensils;
  DataStore.enabled_review = settings.enabled_review;

  DataStore.address_format_use = settings.address_format_use;
  DataStore.password_reset_options = settings.password_reset_options;
  DataStore.signup_resend_counter = settings.signup_resend_counter;

  DataStore.cancel_order_enabled = settings.cancel_order_enabled;

  DataStore.online_services = settings.online_services;
  DataStore.default_service = settings.default_service;
  DataStore.delivery_option = settings.delivery_option;

  DataStore.phone_prefix_data = [];
  if (Object.keys(settings.phone_prefix_data).length > 0) {
    Object.entries(settings.phone_prefix_data).forEach(([key, items]) => {
      DataStore.phone_prefix_data.push({
        label: "+" + items.phonecode + " " + items.country_name,
        value: "+" + items.phonecode,
        flag: items.flag,
      });
    });
  }
}



