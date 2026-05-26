import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import { LocalStorage } from "src/services/storage";
import { useClientAuthStore } from "src/stores/clientAuth";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value?.data) return asArray(value.data);
  if (value?.list) return asArray(value.list);
  if (value?.items) return asArray(value.items);
  if (value && typeof value === "object") {
    return Object.values(value)
      .flatMap((item) => (Array.isArray(item) ? item : [item]))
      .filter((item) => item && typeof item === "object");
  }
  return [];
};

const orderListFrom = (value) =>
  asArray(value).filter((item) => item.order_uuid || item.order_id || item.restaurant_name || item.merchant_name);

const clientUuidFrom = (user) =>
  user?.client_uuid ||
  user?.uuid ||
  user?.client_id ||
  user?.user_uuid ||
  LocalStorage.getItem("client_uuid") ||
  "";
const isEmptyResultError = (error) => /no results|record not found/i.test(error?.message ?? String(error));

export const useAccountProfileStore = defineStore("accountProfile", {
  state: () => ({
    loading: false,
    error: "",
    customerInfo: null,
    accountStatus: null,
    orders: null,
    addresses: null,
  }),
  getters: {
    orderList: (state) => orderListFrom(state.orders?.details?.data ?? state.orders?.details),
    addressList: (state) => asArray(state.addresses?.details?.data ?? state.addresses?.details),
    hasLoaded: (state) => Boolean(state.orders || state.addresses || state.customerInfo || state.accountStatus),
  },
  actions: {
    reset() {
      this.error = "";
      this.customerInfo = null;
      this.accountStatus = null;
      this.orders = null;
      this.addresses = null;
    },
    async load() {
      const client = useClientAuthStore();
      if (!client.authenticated) {
        this.reset();
        return;
      }

      this.loading = true;
      this.error = "";

      const clientUuid = clientUuidFrom(client.user);
      const jobs = [
        APIinterface.fetchDataByTokenGet("OrderList", {
          page: 1,
          q: "",
          order_type: "",
        }).catch(() => APIinterface.orderHistory(1, "")),
        APIinterface.clientAddresses({ page: 1 }),
      ];

      if (clientUuid) {
        jobs.push(APIinterface.getCustomerInfo(clientUuid));
        jobs.push(APIinterface.getAccountStatus(clientUuid));
      }

      const results = await Promise.allSettled(jobs);
      const [orders, addresses, customerInfo, accountStatus] = results;

      if (orders?.status === "fulfilled") this.orders = orders.value;
      if (addresses?.status === "fulfilled") this.addresses = addresses.value;
      if (customerInfo?.status === "fulfilled") this.customerInfo = customerInfo.value;
      if (accountStatus?.status === "fulfilled") this.accountStatus = accountStatus.value;

      const failures = results
        .filter((result) => result.status === "rejected")
        .filter((result) => !isEmptyResultError(result.reason))
        .map((result) => result.reason?.message ?? String(result.reason));
      this.error = failures[0] || "";
      this.loading = false;
    },
  },
});
