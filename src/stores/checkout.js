import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { checkoutPayload, useCartStore } from "src/stores/cart";
import { LocalStorage } from "src/services/storage";

export const useCheckoutStore = defineStore("checkout", {
  state: () => ({
    loading: false,
    error: "",
    tips: null,
    tipsError: "",
    promo: null,
    promoError: "",
    payment: null,
    savedPayment: null,
    paymentError: "",
    selectedTip: 0,
    selectedPaymentUuid: "",
    applyingPromo: false,
    promoCode: "",
    paymentChange: "",
    cartWallet: null,
    cartWalletError: "",
    useDigitalWallet: false,
    applyingWallet: false,
    orderNotes: "",
    includeUtensils: false,
    deliveryStreetNumber: "",
    deliveryStreetName: "",
    deliveryEntrance: "",
    deliveryAddressLabel: "Home",
    deliveryAddressUuid: "",
    placing: false,
    placeOrderError: "",
    placedOrder: null,
  }),
  getters: {
    tipOptions: (state) => state.tips?.details?.data ?? [],
    hasTips: (state) => (state.tips?.details?.data ?? []).length > 0,
    promoList: (state) => state.promo?.details?.data ?? [],
    paymentList: (state) => {
      const data = state.payment?.details?.data ?? {};
      const credentials = state.payment?.details?.credentials ?? {};
      const saved = state.savedPayment?.details?.data ?? [];

      return [
        ...saved,
        ...Object.entries(data).map(([code, payment]) => ({
          ...payment,
          credentials: credentials[code] ?? payment.credentials ?? null,
        })),
      ];
    },
    cartWalletBalance: (state) => Number(state.cartWallet?.balance_raw ?? state.cartWallet?.balance ?? 0),
    cartWalletLabel: (state) => state.cartWallet?.balance || state.cartWallet?.wallet_balance || "",
    canUseCartWallet() {
      return this.cartWalletBalance > 0;
    },
    selectedPayment(state) {
      const cart = useCartStore();
      const payments = [
        ...Object.values(cart.data?.payment_list ?? {}),
        ...this.paymentList,
      ];

      return (
        payments.find((payment) => payment.payment_uuid === state.selectedPaymentUuid) ??
        payments[0] ??
        null
      );
    },
  },
  actions: {
    async load() {
      const cart = useCartStore();
      if (!cart.cartUuid) return;

      this.loading = true;
      this.error = "";
      this.tipsError = "";
      this.promoError = "";
      this.paymentError = "";

      try {
        await cart.refresh("", checkoutPayload);
        this.syncDeliveryAddress();

        const [tipsResult, promoResult] = await Promise.allSettled([
          APIinterface.loadTips(cart.cartUuid),
          APIinterface.loadPromo(cart.cartUuid),
        ]);

        if (tipsResult.status === "fulfilled") {
          this.tips = tipsResult.value;
          this.selectedTip = tipsResult.value?.details?.tips ?? 0;
        } else {
          this.tips = null;
          this.tipsError = tipsResult.reason?.message ?? String(tipsResult.reason);
        }

        if (promoResult.status === "fulfilled") {
          this.promo = promoResult.value;
        } else {
          this.promo = null;
          this.promoError = promoResult.reason?.message ?? String(promoResult.reason);
        }

        await this.loadCartWallet().catch(() => {});
        this.payment = null;
      } catch (error) {
        this.error = error?.message ?? String(error);
      } finally {
        this.loading = false;
      }
    },
    async loadPayments() {
      const cart = useCartStore();
      if (!cart.cartUuid || !auth.authenticated()) {
        this.payment = null;
        this.paymentError = "";
        return null;
      }

      this.paymentError = "";

      try {
        const response = await APIinterface.PaymentList(cart.cartUuid);
        this.payment = response;
        await this.loadSavedPayments().catch(() => {});
        const payments = Object.values(response.details?.data ?? {});
        if (!this.selectedPaymentUuid && payments[0]?.payment_uuid) {
          this.selectedPaymentUuid = payments[0].payment_uuid;
        }
        await cart.refresh("", checkoutPayload);
        return response;
      } catch (error) {
        this.payment = null;
        this.paymentError = error?.message ?? String(error);
        throw error;
      }
    },
    cartTotalRaw() {
      const cart = useCartStore();
      const total = cart.summary.find((row) => row.type === "total");
      const subtotal = cart.data?.data?.subtotal;
      return (
        total?.raw ||
        total?.value_raw ||
        subtotal?.raw ||
        subtotal?.value_raw ||
        subtotal?.unformatted ||
        0
      );
    },
    async loadCartWallet() {
      const cart = useCartStore();
      if (!cart.cartUuid || !auth.authenticated()) {
        this.cartWallet = null;
        this.useDigitalWallet = false;
        this.cartWalletError = "";
        return null;
      }

      this.cartWalletError = "";

      try {
        const response = await APIinterface.fetchDataByTokenPost("getCartWallet", {
          cart_uuid: cart.cartUuid,
          currency_code: LocalStorage.getItem("currency_code") || "TMT",
        });
        this.cartWallet = response?.details ?? null;
        this.useDigitalWallet = Boolean(this.cartWallet?.use_wallet);
        return response;
      } catch (error) {
        this.cartWallet = null;
        this.useDigitalWallet = false;
        this.cartWalletError = error?.message ?? String(error);
        return null;
      }
    },
    async applyDigitalWallet(value) {
      const cart = useCartStore();
      if (!cart.cartUuid || !auth.authenticated()) return null;

      this.applyingWallet = true;
      this.cartWalletError = "";

      try {
        const response = await APIinterface.fetchDataByTokenPost("applyDigitalWallet", {
          cart_uuid: cart.cartUuid,
          currency_code: LocalStorage.getItem("currency_code") || "TMT",
          use_wallet: value ? 1 : 0,
          amount_to_pay: this.cartTotalRaw(),
        });
        this.useDigitalWallet = Boolean(value);
        this.cartWallet = {
          ...(this.cartWallet ?? {}),
          ...(response?.details ?? {}),
        };
        await cart.refresh("", checkoutPayload);
        await this.loadPayments().catch(() => {});
        return response;
      } catch (error) {
        this.useDigitalWallet = false;
        this.cartWalletError = error?.message ?? String(error);
        throw error;
      } finally {
        this.applyingWallet = false;
      }
    },
    async loadSavedPayments() {
      const cart = useCartStore();
      if (!cart.cartUuid) return null;

      const response = await APIinterface.SavedPaymentList(cart.cartUuid);
      this.savedPayment = response;
      this.selectedPaymentUuid =
        response.details?.default_payment_uuid ||
        response.details?.data?.[0]?.payment_uuid ||
        this.selectedPaymentUuid;
      return response;
    },
    async selectPayment(payment) {
      if (!payment) return;
      const cart = useCartStore();

      if (payment.payment_uuid) {
        this.selectedPaymentUuid = payment.payment_uuid;
        return;
      }

      this.paymentError = "";
      try {
        await APIinterface.SavedPaymentProvider({
          merchant_id: cart.data?.merchant_id ?? payment.credentials?.merchant_id ?? "",
          payment_code: payment.payment_code,
        });
        await this.loadSavedPayments();
        await cart.refresh("", checkoutPayload);
        this.selectedPaymentUuid =
          cart.data?.payment_method?.payment_uuid ||
          this.savedPayment?.details?.default_payment_uuid ||
          Object.values(cart.data?.payment_list ?? {})[0]?.payment_uuid ||
          "";
      } catch (error) {
        this.paymentError = error?.message ?? String(error);
        throw error;
      }
    },
    async applyPromoItem(promo) {
      const cart = useCartStore();
      if (!cart.cartUuid || !promo) return;

      this.applyingPromo = true;
      this.promoError = "";
      try {
        await APIinterface.applyPromo({
          cart_uuid: cart.cartUuid,
          promo_id: promo.promo_id,
          promo_type: promo.promo_type,
          currency_code: LocalStorage.getItem("currency_code") || "TMT",
        });
        await this.load();
      } catch (error) {
        this.promoError = error?.message ?? String(error);
        throw error;
      } finally {
        this.applyingPromo = false;
      }
    },
    async applyPromoCodeValue() {
      const cart = useCartStore();
      const code = this.promoCode.trim();
      if (!cart.cartUuid || !code) return;

      this.applyingPromo = true;
      this.promoError = "";
      try {
        await APIinterface.applyPromoCode({
          cart_uuid: cart.cartUuid,
          promo_code: code,
        });
        this.promoCode = "";
        await this.load();
      } catch (error) {
        this.promoError = error?.message ?? String(error);
        throw error;
      } finally {
        this.applyingPromo = false;
      }
    },
    async removeAppliedPromo(promo) {
      const cart = useCartStore();
      if (!cart.cartUuid) return;

      this.applyingPromo = true;
      this.promoError = "";
      try {
        await APIinterface.removePromo({
          cart_uuid: cart.cartUuid,
          promo_id: promo?.promo_id || "",
          promo_type: promo?.promo_type || "",
        });
        await this.load();
      } catch (error) {
        this.promoError = error?.message ?? String(error);
        throw error;
      } finally {
        this.applyingPromo = false;
      }
    },
    buildPlaceOrderPayload() {
      const cart = useCartStore();
      const baseURL = `${window.location.origin}/#/`;
      const address =
        this.deliveryAddressUuid ||
        cart.data?.address_details?.address_uuid ||
        cart.data?.delivery_address?.address_uuid ||
        LocalStorage.getItem("place_data")?.address_uuid ||
        "";

      return {
        return_url: baseURL,
        cart_uuid: cart.cartUuid,
        include_utensils: this.includeUtensils ? 1 : 0,
        payment_uuid: this.selectedPayment?.payment_uuid || "",
        currency_code: LocalStorage.getItem("currency_code") || "TMT",
        payment_change: this.paymentChange,
        guest_number: "",
        room_uuid: "",
        table_uuid: "",
        use_digital_wallet: this.useDigitalWallet ? 1 : 0,
        address_uuid: address,
      };
    },
    syncDeliveryAddress() {
      const cart = useCartStore();
      const placeData = LocalStorage.getItem("place_data") ?? {};
      const delivery = cart.data?.delivery_address ?? {};
      const details = cart.data?.address_details ?? {};
      const address = delivery.address ?? details.address ?? {};
      const parsed = placeData?.parsed_address ?? {};

      this.deliveryAddressUuid =
        details.address_uuid ||
        delivery.address_uuid ||
        placeData?.address_uuid ||
        this.deliveryAddressUuid ||
        "";
      this.deliveryStreetNumber =
        details.street_number ||
        delivery.street_number ||
        address.street_number ||
        address.address1 ||
        parsed.street_number ||
        this.deliveryStreetNumber ||
        "";
      this.deliveryStreetName =
        details.street_name ||
        delivery.street_name ||
        address.street_name ||
        address.formatted_address ||
        parsed.street_name ||
        placeData?.formatted_address ||
        this.deliveryStreetName ||
        "";
      this.deliveryEntrance =
        details.location_name ||
        delivery.location_name ||
        address.location_name ||
        this.deliveryEntrance ||
        "";
      this.deliveryAddressLabel =
        details.address_label ||
        delivery.address_label ||
        address.address_label ||
        this.deliveryAddressLabel ||
        "Home";
    },
    readDeliveryField(field, currentValue = "") {
      if (currentValue) return currentValue;
      if (typeof document === "undefined") return "";
      return document.querySelector(`[data-checkout-address="${field}"]`)?.value?.trim() || "";
    },
    async ensureDeliveryAddress() {
      const cart = useCartStore();
      const transactionType = cart.data?.transaction_info?.transaction_type ?? "delivery";
      if (transactionType !== "delivery") return "";

      this.syncDeliveryAddress();

      const existingAddressUuid =
        this.deliveryAddressUuid ||
        cart.data?.address_details?.address_uuid ||
        cart.data?.delivery_address?.address_uuid ||
        LocalStorage.getItem("place_data")?.address_uuid ||
        "";

      const placeData = LocalStorage.getItem("place_data");
      const coordinates = LocalStorage.getItem("coordinates");
      const placeId = LocalStorage.getItem("place_id") || placeData?.place_id || "";

      if (!placeId) {
        throw new Error("Адрес доставки не найден. Выберите локацию еще раз.");
      }

      const parsed = placeData?.parsed_address ?? {};
      const address = placeData?.address ?? {};
      const latitude = Number(placeData?.latitude ?? coordinates?.lat);
      const longitude = Number(placeData?.longitude ?? coordinates?.lng);
      const formattedAddress =
        parsed.formatted_address ||
        placeData?.formatted_address ||
        address.formatted_address ||
        this.deliveryStreetName ||
        "";

      if (!latitude || !longitude || !formattedAddress) {
        throw new Error("Адрес доставки неполный. Выберите точку на карте еще раз.");
      }

      const streetNumber = String(
        this.readDeliveryField("street-number", this.deliveryStreetNumber) ||
          parsed.street_number ||
          address.street_number ||
          address.address1 ||
          ""
      ).trim();
      if (!streetNumber) {
        throw new Error("Укажите номер дома для адреса доставки.");
      }
      const streetName = this.readDeliveryField("street-name", this.deliveryStreetName);
      const entrance = this.readDeliveryField("entrance", this.deliveryEntrance);

      const params = {
        address_uuid: existingAddressUuid,
        address1: streetNumber,
        address2: entrance || "",
        street_number: streetNumber,
        street_name: streetName || parsed.street_name || address.street_name || formattedAddress,
        location_name: entrance || parsed.place_text || placeData?.place_text || "",
        address_label: this.deliveryAddressLabel || "Home",
        delivery_options: "leave_it_at_my_door",
        delivery_instructions: this.orderNotes,
        place_id: placeId,
        formatted_address: formattedAddress,
        city: parsed.city || address.city || "",
        state: parsed.state || address.state || "",
        postal_code: parsed.postal_code || address.postal_code || "",
        company: "",
        country: parsed.country || address.country || "",
        country_code: parsed.country_code || address.country_code || "",
        custom_field1: "",
        custom_field2: "",
        complete_address: formattedAddress,
        latitude,
        longitude,
      };

      const response = await APIinterface.fetchDataByTokenPost("SavedAddress", params);

      const savedPlaceData = response.details?.place_data ?? response.details?.data ?? response.details ?? {};
      const addressUuid = savedPlaceData?.address_uuid || response.details?.address_uuid || existingAddressUuid || "";
      if (!addressUuid) {
        throw new Error("Не удалось сохранить адрес доставки. Выберите точку на карте еще раз.");
      }

      this.deliveryAddressUuid = addressUuid;
      LocalStorage.set("place_data", {
        ...placeData,
        ...savedPlaceData,
        address_uuid: addressUuid,
      });
      await cart.refresh("", checkoutPayload);

      return addressUuid;
    },
    async placeOrder() {
      const cart = useCartStore();
      if (!cart.cartUuid) {
        throw new Error("Корзина пуста.");
      }

      this.placing = true;
      this.placeOrderError = "";
      this.placedOrder = null;

      try {
        await this.ensureDeliveryAddress();
        const response = await APIinterface.PlaceOrder(this.buildPlaceOrderPayload());
        this.placedOrder = response.details;
        return response.details;
      } catch (error) {
        const message = error?.message ?? String(error);
        this.placeOrderError = /street number/i.test(message)
          ? "Укажите номер дома для адреса доставки."
          : message;
        throw error;
      } finally {
        this.placing = false;
      }
    },
  },
});
