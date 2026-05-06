import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "stores/DataStore";

export const useCartStore = defineStore("cartstore", {
  state: () => ({
    loading: false,
    cart_loading: true,
    cart_reloading: false,
    cart_payload: [
      "items",
      "subtotal",
      "distance_local_new",
      "items_count",
      "merchant_info",
      "check_opening",
      "estimation",
      "transaction_info",
      "standard_estimation",
    ],
    use_payload: null,
    cart_data: null,
    delivery_times: null,
    deliveryTimeMerchant: null,
    promo_data: null,
  }),
  getters: {
    getCartID(state) {
      return state.cart_data?.cart_uuid || null;
    },
    getMerchant(state) {
      return state.cart_data?.data?.merchant || false;
    },
    getStore(state) {
      return state.getMerchant
        ? `${state.getMerchant.restaurant_name ?? ""} - ${
            state.getMerchant.merchant_address ?? ""
          }`.trim()
        : "";
    },
    getCartItemsCount(state) {
      return state.getItems ? this.getItems.length : 0;
    },
    getCartCount(state) {
      return state.cart_data ? parseFloat(state.cart_data.items_count) : 0;
    },
    hasItem(state) {
      return !!(state.cart_data && parseFloat(state.cart_data.items_count) > 0);
    },
    getError(state) {
      if (state.cart_data) {
        if (state.cart_data.error) {
          if (
            Array.isArray(state.cart_data.error) &&
            state.cart_data.error.length > 0
          ) {
            return state.cart_data.error;
          }
        }
      }
      return false;
    },
    getItems(state) {
      return state.cart_data?.data?.items || null;
    },
    getTotal(state) {
      return state.cart_data?.data?.total?.value || null;
    },
    getTotalRaw(state) {
      return state.cart_data?.data?.total?.raw || null;
    },
    getSubtotal(state) {
      return state.cart_data?.data?.subtotal?.value || null;
    },
    getSummary(state) {
      return state.cart_data?.data?.summary || null;
    },
    getPoints(state) {
      return state.cart_data?.points_data || null;
    },
    getServices(state) {
      return state.cart_data?.services || null;
    },
    getDeliveryOptions(state) {
      return state.cart_data?.delivery_option || null;
    },
    getDeliveryOptions2(state) {
      return state.cart_data?.delivery_option2 || null;
    },
    getDeliveryOptionsList(state) {
      return state.cart_data?.delivery_option_list || null;
    },
    geTransactiontype(state) {
      return state.cart_data?.transaction_info?.transaction_type || null;
    },
    geTransactiontypePretty(state) {
      return state.cart_data?.transaction_info?.transaction_type_pretty || null;
    },
    geDeliverytype(state) {
      return state.cart_data?.transaction_info?.whento_deliver || null;
    },
    geTransactionInfo(state) {
      return state.cart_data?.transaction_info || null;
    },
    geDeliveryDate(state) {
      return state.cart_data?.transaction_info?.delivery_date || null;
    },
    geDeliveryTime(state) {
      return state.cart_data?.transaction_info?.delivery_time || null;
    },
    geDeliveryTimeValue(state) {
      const results = state.cart_data?.transaction_info?.delivery_time || null;
      if (results) {
        return {
          label: results.pretty_time,
          value: results.end_time,
        };
      }
      return null;
    },
    getMerchantId(state) {
      return state.cart_data?.merchant_id || null;
    },
    enabledSelectTime(state) {
      return !!state.cart_data?.enabled_select_time;
    },
    isStoreopen(state) {
      return !!state.cart_data?.store_open;
    },
    canShowSchedule(state) {
      return !!state.cart_data?.show_schedule;
    },
    getStoreopenmessage(state) {
      return state.cart_data?.store_open_message || "";
    },
    hasError() {
      if (this.getError) {
        return true;
      }
      return false;
    },
    canCheckout(state) {
      if (!this.isStoreopen) {
        return false;
      }
      if (this.getError) {
        return false;
      }
      return true;
    },
    getDistance(state) {
      return state.cart_data?.distance_pretty || "";
    },
    getDistance1(state) {
      return state.cart_data?.distance_pretty1 || "";
    },
    getAddress(state) {
      return state.cart_data?.delivery_address || false;
    },
    getAddressDetails(state) {
      return state.cart_data?.address_details || false;
    },
    getDate() {
      return this.delivery_times?.dates || null;
    },
    getTimes() {
      return this.delivery_times?.time_ranges || null;
    },
    getEstimatetime(state) {
      return state.cart_data?.estimation_time || null;
    },
    getEstimatetime1(state) {
      return state.cart_data?.estimation_time_pretty || null;
    },
    getInstructions(state) {
      return state.cart_data?.order_instructions || null;
    },
    IsTipenabled(state) {
      return state.cart_data?.enabled_tip || false;
    },
    getTiplist(state) {
      return state.cart_data?.tip_list || false;
    },
    getTipData(state) {
      const results = state.cart_data?.tips_data || false;
      if (results) {
        return results.tips > 0 ? results.tips : results.default_tip;
      }
      return 0;
    },
    getPayment(state) {
      return state.cart_data?.payment_method || false;
    },
    getPaymentList(state) {
      return state.cart_data?.payment_list || false;
    },
    getPromo(state) {
      return state.promo_data?.data || false;
    },
    getDiscountapplied(state) {
      return state.cart_data?.discount_applied || null;
    },
    getRoomList(state) {
      return state.cart_data?.room_list || [];
    },
    getTableList(state) {
      return state.cart_data?.table_list || [];
    },
    isStrictTowallet(state) {
      return state.cart_data?.strict_to_wallet ?? false;
    },
    getWallet(state) {
      return state.cart_data?.wallet ?? false;
    },
  },
  actions: {
    getCount() {
      const $params = {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        place_id: APIinterface.getStorage("place_id"),
        payload: ["items_count"],
      };
      this.loading = true;
      APIinterface.getCart($params, true)
        .then((data) => {
          this.items_count = data.details.items_count;
        })
        .catch((error) => {
          this.items_count = 0;
        })
        .then((data) => {
          this.loading = false;
        });
    },
    async getCart(cardLoading, payload, slug) {
      if (!payload) {
        payload = this.cart_payload;
      }
      const DataStorePersisted = useDataStorePersisted();
      const DataStore = useDataStore();

      const search_mode = DataStore.getSearchMode;
      const location_data = DataStorePersisted.getLocation;
      DataStore.featured_items = null;

      this.use_payload = payload;
      let params = {};
      if (search_mode == "address") {
        params = {
          cart_uuid: DataStorePersisted.cart_uuid ?? "",
          currency_code: DataStorePersisted.getUseCurrency() ?? "",
          payload,
          choosen_delivery: APIinterface.getStorage("choosen_delivery") ?? "",
          latitude: DataStorePersisted.coordinates?.lat ?? "",
          longitude: DataStorePersisted.coordinates?.lng ?? "",
          place_data: DataStorePersisted.place_data,
        };
      } else if (search_mode == "location") {
        params = {
          cart_uuid: DataStorePersisted.cart_uuid ?? "",
          currency_code: DataStorePersisted.getUseCurrency() ?? "",
          location: {
            state_id: location_data?.state_id ?? "",
            city_id: location_data?.city_id ?? "",
            area_id: location_data?.area_id ?? "",
            postal_id: location_data?.postal_id ?? "",
          },
          address_uuid: location_data?.address_uuid ?? "",
          payload,
        };
      }

      if (slug) {
        params.slug = slug;
      }

      if (cardLoading) {
        this.cart_loading = true;
      } else {
        this.cart_reloading = true;
      }

      let $isCheckout = true;
      if (auth.authenticated()) {
        $isCheckout = false;
      }

      try {
        const response = await APIinterface.getCart(params, $isCheckout);
        this.cart_data = response.details;
        if (!DataStorePersisted.cart_uuid) {
          DataStorePersisted.cart_uuid = response.details.cart_uuid;
        }
        return response.details;
      } catch (error) {
        this.cart_data = null;
        throw error;
      } finally {
        this.cart_loading = false;
        this.cart_reloading = false;
      }
    },
    async clearCart() {
      try {
        const DataStorePersisted = useDataStorePersisted();
        return await APIinterface.clearCart(DataStorePersisted.cart_uuid);
      } catch (error) {
        throw error;
      }
    },

    async fetchDeliveryTime(merchant_id) {
      try {
        this.deliveryTimeMerchant = merchant_id;
        const params = new URLSearchParams({
          merchant_id: merchant_id,
        }).toString();
        const results = await APIinterface.fetchDataPost(
          "getDeliveryDateTime",
          params
        );
        this.delivery_times = results.details.opening_hours;
        return results;
      } catch (error) {
        throw error;
      }
    },

    async fetchPromo(data) {
      try {
        const params = new URLSearchParams(data).toString();
        const results = await APIinterface.fetchDataPost("fetchPromo", params);
        this.promo_data = results.details;
        return results;
      } catch (error) {
        throw error;
      }
    },
  },
});
