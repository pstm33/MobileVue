import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

const detailsPayload = [
  "merchant_info",
  "items",
  "order_info",
  "estimation",
  "charge_type",
  "order_status",
  "progress",
  "summary",
  "delivery_timeline",
  "order_delivery_status",
  "status_allowed_cancelled",
  "review_status",
];

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value?.data) return asArray(value.data);
  if (value && typeof value === "object") {
    return Object.values(value)
      .flatMap((item) => (Array.isArray(item) ? item : [item]))
      .filter((item) => item && typeof item === "object" && (item.order_uuid || item.order_id || item.restaurant_name));
  }
  return [];
};

const unwrapOrderDetails = (response) => response?.details?.data ?? response?.details ?? {};
const isEmptyResultError = (error) => /no results|record not found/i.test(error?.message ?? String(error));

export const useOrdersStore = defineStore("orders", {
  state: () => ({
    history: [],
    historyLoading: false,
    historyError: "",
    detailsByUuid: {},
    trackingByUuid: {},
    detailsLoading: false,
    detailsError: "",
    buyAgainLoading: false,
    buyAgainError: "",
    cancelLoading: false,
    cancelError: "",
    cancelPreviewByUuid: {},
    reviewLoading: false,
    reviewError: "",
    reviewSuccess: "",
  }),
  getters: {
    orderDetails: (state) => (uuid) => state.detailsByUuid[uuid] ?? null,
    trackingDetails: (state) => (uuid) => state.trackingByUuid[uuid] ?? null,
    cancelPreview: (state) => (uuid) => state.cancelPreviewByUuid[uuid] ?? null,
  },
  actions: {
    async loadHistory(query = "") {
      if (!auth.authenticated()) {
        this.history = [];
        this.historyError = "";
        return [];
      }

      this.historyLoading = true;
      this.historyError = "";
      try {
        const response = await APIinterface.fetchDataByTokenGet("OrderList", {
          page: 1,
          q: query,
          order_type: "",
        }).catch(() => APIinterface.orderHistory(1, query));
        const data = response?.details?.data ?? response?.details ?? [];
        this.history = asArray(data);
        return this.history;
      } catch (error) {
        this.history = [];
        if (isEmptyResultError(error)) {
          this.historyError = "";
          return [];
        }
        this.historyError = error?.message ?? String(error);
        throw error;
      } finally {
        this.historyLoading = false;
      }
    },
    async loadDetails(orderUuid, force = false) {
      if (!orderUuid) return null;
      if (!auth.authenticated()) {
        this.detailsError = "Войдите или продолжите как гость, чтобы открыть детали заказа.";
        return null;
      }
      if (!force && this.detailsByUuid[orderUuid]) return this.detailsByUuid[orderUuid];

      this.detailsLoading = true;
      this.detailsError = "";
      try {
        const response = await APIinterface.fetchDataByTokenPost("getOrder", `order_uuid=${encodeURIComponent(orderUuid)}`).catch(() =>
          APIinterface.fetchDataByToken("orderDetails", {
            order_uuid: orderUuid,
            payload: detailsPayload,
          })
        );
        const data = unwrapOrderDetails(response);
        this.detailsByUuid = {
          ...this.detailsByUuid,
          [orderUuid]: data,
        };
        return data;
      } catch (error) {
        this.detailsError = error?.message ?? String(error);
        throw error;
      } finally {
        this.detailsLoading = false;
      }
    },
    async loadTracking(orderUuid) {
      if (!orderUuid || !auth.authenticated()) return null;

      const response = await APIinterface.fetchDataByTokenGet("trackOrder", {
        order_uuid: orderUuid,
      });
      const data = response?.details?.data ?? response?.details ?? {};

      this.trackingByUuid = {
        ...this.trackingByUuid,
        [orderUuid]: data,
      };

      if (this.detailsByUuid[orderUuid]) {
        this.detailsByUuid = {
          ...this.detailsByUuid,
          [orderUuid]: {
            ...this.detailsByUuid[orderUuid],
            progress: data,
          },
        };
      }

      return data;
    },
    async buyAgain(orderUuid) {
      this.buyAgainLoading = true;
      this.buyAgainError = "";
      try {
        const response = await APIinterface.orderBuyAgain({ order_uuid: orderUuid });
        return response.details ?? response;
      } catch (error) {
        this.buyAgainError = error?.message ?? String(error);
        throw error;
      } finally {
        this.buyAgainLoading = false;
      }
    },
    async loadCancelPreview(orderUuid) {
      if (!orderUuid || !auth.authenticated()) return null;

      this.cancelLoading = true;
      this.cancelError = "";
      try {
        const response = await APIinterface.cancelOrderStatus(orderUuid);
        const data = response?.details ?? {};
        this.cancelPreviewByUuid = {
          ...this.cancelPreviewByUuid,
          [orderUuid]: data,
        };
        return data;
      } catch (error) {
        this.cancelError = error?.message ?? String(error);
        throw error;
      } finally {
        this.cancelLoading = false;
      }
    },
    async cancelOrder(orderUuid) {
      if (!orderUuid || !auth.authenticated()) return null;

      this.cancelLoading = true;
      this.cancelError = "";
      try {
        const response = await APIinterface.applyCancelOrder(orderUuid);
        this.detailsByUuid = {
          ...this.detailsByUuid,
          [orderUuid]: null,
        };
        await this.loadDetails(orderUuid, true).catch(() => {});
        return response?.details ?? response;
      } catch (error) {
        this.cancelError = error?.message ?? String(error);
        throw error;
      } finally {
        this.cancelLoading = false;
      }
    },
    async addReview(payload) {
      this.reviewLoading = true;
      this.reviewError = "";
      this.reviewSuccess = "";
      try {
        const response = await APIinterface.addReview(payload);
        this.reviewSuccess = response?.msg || "Отзыв отправлен";
        return response;
      } catch (error) {
        this.reviewError = error?.message ?? String(error);
        throw error;
      } finally {
        this.reviewLoading = false;
      }
    },
  },
});
