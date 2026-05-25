import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { LocalStorage } from "src/services/storage";

const cartStorageKey = "cart_uuid";

const cartContext = {
  currency_code: "TMT",
  latitude: 37.9601,
  longitude: 58.3261,
  payload: ["items_count", "subtotal", "merchant_info", "items"],
};

const currencyCode = () => LocalStorage.getItem("currency_code") || cartContext.currency_code;

export const checkoutPayload = [
  "items",
  "subtotal",
  "distance_local_new",
  "items_count",
  "merchant_info",
  "check_opening",
  "estimation",
  "transaction_info",
  "standard_estimation",
  "summary",
  "total",
  "discount",
  "points",
  "points_discount",
  "wallet",
  "payment_method",
];

export const useCartStore = defineStore("cart", {
  state: () => ({
    cartUuid: LocalStorage.getItem(cartStorageKey) || "",
    data: null,
    loading: false,
    adding: false,
    error: "",
  }),
  getters: {
    itemsCount: (state) => state.data?.items_count ?? 0,
    cart: (state) => state.data?.data ?? null,
    items: (state) => state.data?.data?.items ?? [],
    merchant: (state) => state.data?.data?.merchant ?? null,
    summary: (state) => {
      const summary = state.data?.data?.summary ?? [];
      if (summary.length) return summary;

      const subtotal = state.data?.data?.subtotal;
      if (!subtotal?.value) return [];

      return [{ name: "Итого", value: subtotal.value, raw: subtotal.raw, type: "total" }];
    },
    subtotalLabel: (state) =>
      state.data?.data?.subtotal?.value ||
      state.data?.data?.subtotal?.pretty ||
      state.data?.data?.subtotal ||
      "",
    totalLabel: (state) => {
      const total = state.data?.data?.summary?.find?.((row) => row.type === "total");
      return total?.value || state.data?.data?.subtotal?.value || "";
    },
  },
  actions: {
    rememberCart(cartUuid) {
      if (!cartUuid) return;
      this.cartUuid = cartUuid;
      LocalStorage.set(cartStorageKey, cartUuid);
    },
    async refresh(slug = "", payload = cartContext.payload) {
      if (!this.cartUuid) return null;

      this.loading = true;
      this.error = "";

      try {
        const coordinates = LocalStorage.getItem("coordinates");
        const placeData = LocalStorage.getItem("place_data");
        const addressUuid = placeData?.address_uuid || placeData?.place_data?.address_uuid || "";
        const response = await APIinterface.getCart(
          {
            cart_uuid: this.cartUuid,
            currency_code: currencyCode(),
            latitude: coordinates?.lat ?? cartContext.latitude,
            longitude: coordinates?.lng ?? cartContext.longitude,
            place_data: placeData ?? {},
            address_uuid: addressUuid,
            payload,
            slug,
          },
          !auth.authenticated()
        );
        this.data = response.details;
        this.rememberCart(response.details?.cart_uuid);
        return response.details;
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async setTransactionType(transactionType) {
      if (!this.cartUuid || !transactionType) return null;

      this.loading = true;
      this.error = "";

      try {
        await APIinterface.fetchDataPost(
          "setTransactionType",
          `cart_uuid=${this.cartUuid}&transaction_type=${transactionType}`
        );
        return await this.refresh("", checkoutPayload);
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async setDeliveryNow() {
      if (!this.cartUuid) return null;

      this.loading = true;
      this.error = "";

      try {
        await APIinterface.fetchDataPost("setDeliveryNow", `cart_uuid=${this.cartUuid}`);
        return await this.refresh("", checkoutPayload);
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async addItem(payload, slug = "") {
      this.adding = true;
      this.error = "";

      try {
        const response = await APIinterface.AddToCart({
          ...payload,
          cart_uuid: this.cartUuid,
        });
        this.rememberCart(response.details?.cart_uuid);
        await this.refresh(slug);
        return response.details;
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.adding = false;
      }
    },
    async updateItem(cartRow, quantity, slug = "") {
      if (!this.cartUuid || !cartRow) return null;

      this.loading = true;
      this.error = "";

      try {
        await APIinterface.updateCartItems(this.cartUuid, cartRow, quantity);
        return await this.refresh(slug);
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async removeItem(cartRow, slug = "") {
      if (!this.cartUuid || !cartRow) return null;

      this.loading = true;
      this.error = "";

      try {
        await APIinterface.removeCartItem(this.cartUuid, cartRow);
        return await this.refresh(slug);
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async clear() {
      if (!this.cartUuid) return null;

      this.loading = true;
      this.error = "";

      try {
        const response = await APIinterface.clearCart(this.cartUuid);
        this.cartUuid = "";
        this.data = null;
        LocalStorage.remove(cartStorageKey);
        return response;
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
