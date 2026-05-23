import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import { LocalStorage } from "src/services/storage";

const defaultContext = {
  currency_code: "TMT",
  latitude: 37.9601,
  longitude: 58.3261,
  cart_uuid: "",
};

const currencyCode = () => LocalStorage.getItem("currency_code") || defaultContext.currency_code;

const normalizeMenu = (payload) => {
  const data = payload?.details?.data ?? {};
  return data.category ?? [];
};

export const useRestaurantStore = defineStore("restaurant", {
  state: () => ({
    slug: "",
    info: null,
    menu: [],
    merchantId: null,
    loading: false,
    error: "",
    loadedAt: null,
  }),
  getters: {
    restaurant: (state) => state.info?.details?.data ?? null,
    details: (state) => state.info?.details ?? null,
    heroImage() {
      return (
        this.restaurant?.url_header ||
        this.restaurant?.url_banner ||
        this.restaurant?.url_logo ||
        ""
      );
    },
    hasMenu: (state) =>
      state.menu.some((category) => (category.item_list ?? []).length > 0),
  },
  actions: {
    async load(slug) {
      if (!slug) return;

      this.slug = slug;
      this.loading = true;
      this.error = "";
      this.info = null;
      this.menu = [];
      this.merchantId = null;

      try {
        const coordinates = LocalStorage.getItem("coordinates");
        const selectedCurrency = currencyCode();
        const [info, menu] = await Promise.all([
          APIinterface.getMerchantInfo({
            slug,
            currency_code: selectedCurrency,
            latitude: coordinates?.lat ?? defaultContext.latitude,
            longitude: coordinates?.lng ?? defaultContext.longitude,
            cart_uuid: defaultContext.cart_uuid,
          }),
          APIinterface.geStoreMenu(slug, selectedCurrency),
        ]);

        this.info = info;
        this.menu = normalizeMenu(menu);
        this.merchantId = menu?.details?.merchant_id ?? info?.details?.data?.merchant_id ?? null;
        this.loadedAt = new Date().toISOString();
      } catch (error) {
        this.error = error?.message ?? String(error);
      } finally {
        this.loading = false;
      }
    },
  },
});
