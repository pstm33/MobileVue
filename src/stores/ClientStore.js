import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";

export const useClientStore = defineStore("client", {
  state: () => ({
    loading: false,
    data: null,
    user_settings: null,
    push_off: null,
    // app_push_notifications: false,
    // app_push_promotional: false,
    qrcode_generated: "",
    wallet_balance: null,
    default_payment: null,
    points_balance: null,
    address_data: null,
    payment_data: null,
    saved_payment_list: null,
    pusher_receive_data: null,
    notifications_data: null,
    device_token: null,

    // use for location mode
    location_saved_address: null,
  }),

  getters: {
    addressList(state) {
      return state.data ?? null;
    },
    hasData() {
      if (APIinterface.empty(this.data)) {
        //
      } else {
        if (Object.keys(this.data).length > 0) {
          return true;
        }
      }
      return false;
    },
    getChatCount(state) {
      return !state.notifications_data
        ? 0
        : state.notifications_data.chat_count;
    },
    getAlertCount(state) {
      return !state.notifications_data
        ? 0
        : state.notifications_data.alert_count;
    },
  },

  actions: {
    getAddress() {
      this.loading = true;
      APIinterface.clientAddresses()
        .then((data) => {
          this.data = data.details.data;
        })
        .catch((error) => {
          this.data = null;
        })
        .then((data) => {
          this.loading = false;
        });
    },
    hadData() {
      if (APIinterface.empty(this.data)) {
        return false;
      } else {
        if (Object.keys(this.data).length > 0) {
          return true;
        }
      }
      return false;
    },
    async getWalletBalance() {
      try {
        const results = await APIinterface.fetchDataByTokenGet(
          "getWalletBalance",
          ""
        );
        this.wallet_balance = results.details.total;
      } catch (error) {
        throw error;
      } finally {
      }
    },
    async getDefaultpayment() {
      try {
        const results = await APIinterface.fetchDataByTokenPost(
          "getCustomerDefaultPayment"
        );
        this.default_payment = results.details.data;
      } catch (error) {
        throw error;
      } finally {
      }
    },
    async getMypayments(data) {
      try {
        const params = new URLSearchParams(data).toString();
        const results = await APIinterface.fetchDataByTokenPost(
          "MyPayments",
          params
        );
        this.saved_payment_list = results.details;
        return results.details;
      } catch (error) {
        throw error;
      } finally {
      }
    },
    async fecthPointsBalance() {
      try {
        const results = await APIinterface.fetchDataByTokenPost(
          "getAvailablePoints"
        );
        this.points_balance = results.details.total;
      } catch (error) {
        throw error;
      } finally {
      }
    },
    async fecthAddress() {
      try {
        const results = await APIinterface.getAddresses();
        this.address_data = results.details.data;
      } catch (error) {
        throw error;
      } finally {
      }
    },
    async fetchPayment() {
      try {
        const results = await APIinterface.fetchDataByTokenGet(
          "Savedpayment",
          null
        );
        this.payment_data = results.details.data;
      } catch (error) {
        throw error;
      } finally {
      }
    },

    async fetchNotification() {
      try {
        const results = await APIinterface.fetchDataByTokenGet(
          "fetchNotification",
          null
        );
        this.notifications_data = results.details;
      } catch (error) {
        this.notifications_data = null;
        throw error;
      } finally {
      }
    },

    async fetchLocationAddress() {
      try {
        const response = await APIinterface.fetchPost(
          "apilocations/fetchLocationAddress"
        );
        this.location_saved_address = response.details.data;
        return this.location_saved_address;
      } catch (error) {
        throw error;
      }
    },

    //
  },
});
