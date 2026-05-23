import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import { LocalStorage } from "src/services/storage";

const defaultRequest = {
  language: "ru",
  currency_code: "TMT",
  page: 1,
  place_id: "",
  coordinates: {
    lat: 37.9601,
    lng: 58.3261,
  },
  list_type: "all",
  featured_id: "",
  payload: ["cuisine", "reviews", "estimation", "services"],
  sort_by: "",
  q: "",
  filters: {},
};

const currencyCode = () => LocalStorage.getItem("currency_code") || defaultRequest.currency_code;
const languageCode = () => LocalStorage.getItem("app_language") || defaultRequest.language;

const legacyInvalidCoordinates = { lat: 39.992068, lng: 52.977486 };
const ashgabatDefaultCoordinates = { lat: 37.9601, lng: 58.3261 };

const normalizeCoordinates = (coordinates) => {
  if (!coordinates?.lat || !coordinates?.lng) return null;
  const lat = Number(coordinates.lat);
  const lng = Number(coordinates.lng);

  if (
    Math.abs(lat - legacyInvalidCoordinates.lat) < 0.000001 &&
    Math.abs(lng - legacyInvalidCoordinates.lng) < 0.000001
  ) {
    LocalStorage.set("coordinates", ashgabatDefaultCoordinates);
    return ashgabatDefaultCoordinates;
  }

  return { lat, lng };
};

const getMerchantRows = (payload) => {
  const details = payload?.details ?? {};
  return details.data ?? details.merchant_list ?? details.list ?? [];
};

export const useMerchantFeedStore = defineStore("merchantFeed", {
  state: () => ({
    rows: [],
    details: null,
    loading: false,
    error: "",
    loadedAt: null,
  }),
  getters: {
    hasRows: (state) => state.rows.length > 0,
    totalLabel: (state) => state.details?.total_pretty ?? "",
  },
  actions: {
    async load(params = {}) {
      this.loading = true;
      this.error = "";

      try {
        const savedCoordinates = normalizeCoordinates(LocalStorage.getItem("coordinates"));
        const response = await APIinterface.getMerchantFeed({
          ...defaultRequest,
          currency_code: currencyCode(),
          language: languageCode(),
          ...(savedCoordinates ? { coordinates: savedCoordinates } : {}),
          ...params,
        });

        this.details = response.details ?? null;
        this.rows = getMerchantRows(response);
        this.loadedAt = new Date().toISOString();
      } catch (error) {
        this.rows = [];
        this.details = null;
        this.error = error?.message ?? String(error);
      } finally {
        this.loading = false;
      }
    },
  },
});
