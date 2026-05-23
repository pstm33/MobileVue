import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import { LocalStorage } from "src/services/storage";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value?.data) return asArray(value.data);
  if (value?.list) return asArray(value.list);
  if (value?.items) return asArray(value.items);
  if (value && typeof value === "object") {
    return Object.values(value).filter((item) => item && typeof item === "object");
  }
  return [];
};

const unwrap = (response) => response?.details?.data ?? response?.details ?? response?.data ?? response ?? {};
const readableError = (error) => error?.message ?? String(error);

export const useCustomerStore = defineStore("customer", {
  state: () => ({
    profile: null,
    profileLoading: false,
    profileError: "",
    profileSaving: false,
    profileMessage: "",
    addresses: null,
    addressesLoading: false,
    addressesError: "",
    addressSaving: false,
    addressMessage: "",
    payments: null,
    paymentsLoading: false,
    paymentsError: "",
    paymentMessage: "",
    favourites: null,
    favouritesLoading: false,
    favouritesError: "",
    favouriteMessage: "",
    notifications: null,
    notificationsLoading: false,
    notificationsError: "",
    notificationMessage: "",
    securityLoading: false,
    securityError: "",
    securityMessage: "",
  }),
  getters: {
    profileData: (state) => unwrap(state.profile),
    addressList: (state) => asArray(state.addresses?.details?.data ?? state.addresses?.details ?? state.addresses),
    paymentList: (state) => asArray(state.payments?.details?.data ?? state.payments?.details ?? state.payments),
    favouriteList: (state) => asArray(state.favourites?.details?.data ?? state.favourites?.details ?? state.favourites),
    notificationList: (state) => asArray(state.notifications?.details?.data ?? state.notifications?.details ?? state.notifications),
  },
  actions: {
    async loadProfile() {
      this.profileLoading = true;
      this.profileError = "";
      try {
        this.profile = await APIinterface.getProfile();
        return this.profile;
      } catch (error) {
        this.profile = null;
        this.profileError = readableError(error);
        throw error;
      } finally {
        this.profileLoading = false;
      }
    },
    async saveProfile(data) {
      this.profileSaving = true;
      this.profileError = "";
      this.profileMessage = "";
      try {
        const response = await APIinterface.saveProfile(data);
        this.profileMessage = response?.msg || "Профиль сохранен.";
        await this.loadProfile().catch(() => {});
        const identity = LocalStorage.getItem("client_identity") || {};
        LocalStorage.set("client_identity", { ...identity, ...data });
        return response;
      } catch (error) {
        this.profileError = readableError(error);
        throw error;
      } finally {
        this.profileSaving = false;
      }
    },
    async loadAddresses() {
      this.addressesLoading = true;
      this.addressesError = "";
      try {
        this.addresses = await APIinterface.clientAddresses({ page: 1 });
        return this.addresses;
      } catch (error) {
        this.addresses = null;
        this.addressesError = readableError(error);
        throw error;
      } finally {
        this.addressesLoading = false;
      }
    },
    async saveAddress(data) {
      this.addressSaving = true;
      this.addressesError = "";
      this.addressMessage = "";
      try {
        const response = await APIinterface.fetchDataByTokenPost("SavedAddress", data).catch(() =>
          APIinterface.saveClientAddress(data)
        );
        this.addressMessage = response?.msg || "Адрес сохранен.";
        await this.loadAddresses().catch(() => {});
        return response;
      } catch (error) {
        this.addressesError = readableError(error);
        throw error;
      } finally {
        this.addressSaving = false;
      }
    },
    async deleteAddress(addressUuid) {
      if (!addressUuid) return null;
      this.addressesError = "";
      try {
        const response = await APIinterface.deleteAddress(addressUuid);
        this.addressMessage = response?.msg || "Адрес удален.";
        await this.loadAddresses().catch(() => {});
        return response;
      } catch (error) {
        this.addressesError = readableError(error);
        throw error;
      }
    },
    async loadPayments() {
      this.paymentsLoading = true;
      this.paymentsError = "";
      try {
        this.payments = await APIinterface.MyPayments();
        return this.payments;
      } catch (error) {
        this.payments = null;
        this.paymentsError = readableError(error);
        throw error;
      } finally {
        this.paymentsLoading = false;
      }
    },
    async deletePayment(paymentUuid) {
      if (!paymentUuid) return null;
      this.paymentsError = "";
      try {
        const response = await APIinterface.deletePayment(paymentUuid);
        this.paymentMessage = response?.msg || "Платежный метод удален.";
        await this.loadPayments().catch(() => {});
        return response;
      } catch (error) {
        this.paymentsError = readableError(error);
        throw error;
      }
    },
    async setDefaultPayment(paymentUuid) {
      if (!paymentUuid) return null;
      this.paymentsError = "";
      try {
        const response = await APIinterface.setDefaultPayment(paymentUuid);
        this.paymentMessage = response?.msg || "Платежный метод выбран по умолчанию.";
        await this.loadPayments().catch(() => {});
        return response;
      } catch (error) {
        this.paymentsError = readableError(error);
        throw error;
      }
    },
    async loadFavourites() {
      this.favouritesLoading = true;
      this.favouritesError = "";
      try {
        const coordinates = LocalStorage.getItem("coordinates") || {};
        const restaurantParams = {
          page: 1,
          lat: coordinates.lat || "",
          lng: coordinates.lng || "",
        };
        const [restaurants, items] = await Promise.allSettled([
          APIinterface.fetchDataByTokenGet("fetchFavourites", restaurantParams),
          APIinterface.fetchDataByTokenGet("fetchFavouritesItems", { page: 1 }),
        ]);
        const data = [
          ...asArray(restaurants.status === "fulfilled" ? restaurants.value?.details?.data : []),
          ...asArray(items.status === "fulfilled" ? items.value?.details?.data : []),
        ];
        this.favourites = {
          restaurants: restaurants.status === "fulfilled" ? restaurants.value : null,
          items: items.status === "fulfilled" ? items.value : null,
          details: { data },
        };
        return this.favourites;
      } catch (error) {
        this.favourites = null;
        this.favouritesError = readableError(error);
        throw error;
      } finally {
        this.favouritesLoading = false;
      }
    },
    async toggleFavourite(merchantId) {
      if (!merchantId) return null;
      this.favouritesError = "";
      try {
        const response = await APIinterface.SaveStore(merchantId);
        this.favouriteMessage = response?.msg || "Избранное обновлено.";
        await this.loadFavourites().catch(() => {});
        return response;
      } catch (error) {
        this.favouritesError = readableError(error);
        throw error;
      }
    },
    async loadNotifications(page = 1) {
      this.notificationsLoading = true;
      this.notificationsError = "";
      try {
        this.notifications = await APIinterface.fetchDataByTokenGet("getNotification", { page });
        return this.notifications;
      } catch (error) {
        this.notifications = null;
        this.notificationsError = readableError(error);
        throw error;
      } finally {
        this.notificationsLoading = false;
      }
    },
    async deleteNotification(uuid) {
      if (!uuid) return null;
      this.notificationsError = "";
      try {
        const response = await APIinterface.deleteNotification(uuid);
        this.notificationMessage = response?.msg || "Уведомление удалено.";
        await this.loadNotifications().catch(() => {});
        return response;
      } catch (error) {
        this.notificationsError = readableError(error);
        throw error;
      }
    },
    async updatePassword(data) {
      this.securityLoading = true;
      this.securityError = "";
      this.securityMessage = "";
      try {
        const response = await APIinterface.updatePassword(data);
        this.securityMessage = response?.msg || "Пароль обновлен.";
        return response;
      } catch (error) {
        this.securityError = readableError(error);
        throw error;
      } finally {
        this.securityLoading = false;
      }
    },
    async requestAccountData() {
      this.securityLoading = true;
      this.securityError = "";
      this.securityMessage = "";
      try {
        const response = await APIinterface.requestData();
        this.securityMessage = response?.msg || "Запрос данных отправлен.";
        return response;
      } catch (error) {
        this.securityError = readableError(error);
        throw error;
      } finally {
        this.securityLoading = false;
      }
    },
    async verifyAccountDelete(code) {
      this.securityLoading = true;
      this.securityError = "";
      this.securityMessage = "";
      try {
        const response = await APIinterface.verifyAccountDelete(code);
        this.securityMessage = response?.msg || "Код подтвержден.";
        return response;
      } catch (error) {
        this.securityError = readableError(error);
        throw error;
      } finally {
        this.securityLoading = false;
      }
    },
    async deleteAccount(code) {
      this.securityLoading = true;
      this.securityError = "";
      this.securityMessage = "";
      try {
        const response = await APIinterface.deleteAccount(code);
        this.securityMessage = response?.msg || "Аккаунт удален.";
        return response;
      } catch (error) {
        this.securityError = readableError(error);
        throw error;
      } finally {
        this.securityLoading = false;
      }
    },
  },
});
