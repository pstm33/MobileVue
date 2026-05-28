import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { LocalStorage } from "src/services/storage";
import jwtDecode from "jwt-decode";

const defaultGuest = {
  first_name: "Tagam",
  last_name: "Guest",
  mobile_prefix: "+993",
  mobile_number: "",
  email_address: "",
  password: "",
  cpassword: "",
};

const guestPassword = () => `TagamGuest${Date.now()}!`;
const tagamPhonePrefix = (value = "") => String(value || "").trim().replace(/^\+/, "");
const tagamPhoneNumber = (value = "", prefix = "") => {
  const digits = String(value || "").replace(/\D/g, "");
  const normalizedPrefix = tagamPhonePrefix(prefix);
  if (normalizedPrefix && digits.startsWith(normalizedPrefix)) {
    return digits.slice(normalizedPrefix.length);
  }
  return digits;
};
const readableAuthError = (error) => {
  const message = error?.message ?? String(error);
  if (/contact phone.+already been taken/i.test(message)) {
    return "Этот телефон уже зарегистрирован. Войдите по email/паролю или используйте другой номер для гостевого заказа.";
  }
  return message;
};

const guestEmail = (payload) => {
  if (payload.email_address) return payload.email_address;
  const phone = [payload.mobile_prefix, payload.mobile_number]
    .filter(Boolean)
    .join("")
    .replace(/\D/g, "");
  return `guest.${phone || Date.now()}.${Date.now()}@tagam.delivery`;
};

const normalizeUser = (user) => {
  if (!user) return null;
  if (typeof user === "string") {
    try {
      return jwtDecode(user);
    } catch {
      return null;
    }
  }
  return user;
};

export const useClientAuthStore = defineStore("clientAuth", {
  state: () => ({
    user: normalizeUser(LocalStorage.getItem("client_identity")),
    token: LocalStorage.getItem("client_token") || "",
    loading: false,
    error: "",
  }),
  getters: {
    authenticated: (state) => Boolean(state.token),
    displayName: (state) =>
      [state.user?.first_name, state.user?.last_name].filter(Boolean).join(" ") ||
      state.user?.full_name ||
      state.user?.contact_phone ||
      state.user?.email_address ||
      [state.user?.mobile_prefix, state.user?.mobile_number].filter(Boolean).join(" ") ||
      "Гость",
  },
  actions: {
    remember(details) {
      auth.setUser(details.user_data);
      auth.setToken(details.user_token);
      if (details.user_settings) {
        LocalStorage.set("user_settings", details.user_settings);
      }
      this.user = normalizeUser(details.user_data);
      this.token = details.user_token;
    },
    async registerGuest(payload = {}) {
      this.loading = true;
      this.error = "";

      try {
        const placeId = LocalStorage.getItem("place_id") || "";
        const password = payload.password || guestPassword();
        const data = {
          ...defaultGuest,
          ...payload,
          mobile_prefix: tagamPhonePrefix(payload.mobile_prefix || defaultGuest.mobile_prefix),
          mobile_number: tagamPhoneNumber(payload.mobile_number, payload.mobile_prefix || defaultGuest.mobile_prefix),
          email_address: guestEmail(payload),
          password,
          cpassword: payload.cpassword || password,
          local_id: placeId,
        };
        const response = await APIinterface.fetchData("registerGuestUser", data);

        if (response.details?.uuid) {
          throw new Error("Сервер требует OTP-подтверждение для этих данных.");
        }

        this.remember(response.details);
        return response.details;
      } catch (error) {
        this.error = readableAuthError(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async login({ username, password }) {
      this.loading = true;
      this.error = "";

      try {
        const response = await APIinterface.userLogin({ username, password });
        this.remember(response.details);
        return response.details;
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async signup(payload) {
      this.loading = true;
      this.error = "";

      try {
        const response = await APIinterface.registerUser({
          ...payload,
          mobile_prefix: tagamPhonePrefix(payload.mobile_prefix),
          mobile_number: tagamPhoneNumber(payload.mobile_number, payload.mobile_prefix),
          local_id: LocalStorage.getItem("place_id") || "",
          custom_fields: payload.custom_fields || [],
        });

        if (response.details?.verify) {
          return {
            needsOtp: true,
            uuid: response.details?.uuid || response.details?.client_uuid,
            validationType: "email",
            action: "completeSignupWithCode",
            message: response.msg || "Введите OTP-код для завершения регистрации.",
          };
        }

        this.remember(response.details);
        return response.details;
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async requestOtp({ validation_type = "email", email_address = "", mobile_prefix = "", mobile_number = "" }) {
      this.loading = true;
      this.error = "";

      try {
        const params = new URLSearchParams({
          validation_type,
          email_address,
          mobile_prefix: tagamPhonePrefix(mobile_prefix),
          mobile_number: tagamPhoneNumber(mobile_number, mobile_prefix),
        }).toString();
        const response = await APIinterface.fetchDataPost("requestOTP", params);
        return {
          needsOtp: true,
          uuid: response.details?.uuid,
          validationType: validation_type,
          action: "userloginbyotp",
          message: response.msg || "Введите OTP-код.",
        };
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async resendOtp({ uuid, validationType = "email" }) {
      this.loading = true;
      this.error = "";

      try {
        const response = await APIinterface.fetchDataPost(
          "resendOTP",
          `uuid=${encodeURIComponent(uuid)}&validation_type=${encodeURIComponent(validationType)}`
        );
        return response.msg || "OTP-код отправлен повторно.";
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async verifyOtp({ uuid, otp, action = "verifyOTP" }) {
      this.loading = true;
      this.error = "";

      try {
        const method = action && action !== "RegistrationPhone" ? action : "verifyOTP";
        const params = new URLSearchParams({
          uuid: uuid || "",
          otp: otp || "",
        }).toString();
        const response = await APIinterface.fetchDataPost(method, params);

        if (response.details?.user_token) {
          this.remember(response.details);
        }

        return response.details ?? response;
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async requestPasswordReset(emailAddress) {
      this.loading = true;
      this.error = "";

      try {
        const response = await APIinterface.requestResetPassword(emailAddress);
        return {
          uuid: response.details?.uuid || response.details?.client_uuid,
          message: response.msg || "Письмо для восстановления отправлено.",
        };
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async resetPassword({ uuid, password, cpassword }) {
      this.loading = true;
      this.error = "";

      try {
        const response = await APIinterface.fetchDataPost(
          "resetPassword",
          `uuid=${encodeURIComponent(uuid)}&password=${encodeURIComponent(password)}&cpassword=${encodeURIComponent(cpassword)}`
        );
        return response.msg || "Пароль обновлен.";
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async socialRegister(payload) {
      this.loading = true;
      this.error = "";

      try {
        const response = await APIinterface.socialRegistration(payload);
        const isLogin = response?.details?.is_login ?? false;
        const verificationNeeded = response?.details?.verify ?? false;

        if (verificationNeeded) {
          const message = response.msg || "Для социальной регистрации нужно email/OTP-подтверждение.";
          throw new Error(message);
        }

        if (!isLogin) {
          return {
            needsCompletion: true,
            uuid: response.details?.uuid,
            message: response.msg || "Завершите регистрацию, чтобы создать профиль.",
          };
        }

        this.remember(response.details);
        return response.details;
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async completeSocialSignup(payload) {
      this.loading = true;
      this.error = "";

      try {
        const response = await APIinterface.completeSocialSignup(payload);
        this.remember(response.details);
        return response.details;
      } catch (error) {
        this.error = error?.message ?? String(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      auth.logout();
      this.user = null;
      this.token = "";
    },
  },
});
