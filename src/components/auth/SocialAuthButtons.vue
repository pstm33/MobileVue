<template>
  <section v-if="settings.hasSocialLogin" class="grid gap-3">
    <div class="social-buttons-row" :style="{ '--social-count': socialCount }">
      <button
        v-if="settings.social.google"
        class="social-button"
        type="button"
        :disabled="busy || !initialized"
        aria-label="Google"
        @click="loginWithGoogle"
      >
        <img src="/google-icon-logo.svg" alt="" />
        <span>Google</span>
      </button>

      <button
        v-if="settings.social.facebook"
        class="social-button"
        type="button"
        :disabled="busy || !initialized"
        aria-label="Facebook"
        @click="loginWithFacebook"
      >
        <img src="/facebook-3-logo.svg" alt="" />
        <span>Facebook</span>
      </button>

      <button
        v-if="settings.social.apple"
        class="social-button"
        type="button"
        :disabled="busy || !initialized"
        aria-label="Apple"
        @click="loginWithApple"
      >
        <img src="/apple-black-logo.svg" alt="" />
        <span>Apple</span>
      </button>
    </div>

    <div v-if="pendingCompletion" class="rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-3">
      <p class="m-0 text-sm font-black">{{ copy.completeSocial }}</p>
      <p class="muted m-0 mt-1 text-xs">{{ pendingCompletion.message }}</p>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <input v-model="completion.first_name" class="field" :placeholder="copy.firstName" />
        <input v-model="completion.last_name" class="field" :placeholder="copy.lastName" />
      </div>
      <div class="mt-2 grid grid-cols-[86px_1fr] gap-2">
        <input v-model="completion.mobile_prefix" class="field" placeholder="+993" />
        <input v-model="completion.mobile_number" class="field" inputmode="tel" :placeholder="copy.phone" />
      </div>
      <button class="primary-button mt-3 w-full" type="button" :disabled="busy || !canComplete" @click="completeSignup">
        {{ busy ? copy.sending : copy.completeSocial }}
      </button>
    </div>

    <div v-if="error" class="rounded-[8px] border border-amber-300/25 bg-amber-300/10 p-3 text-sm font-bold text-[var(--app-fg)]">
      <p class="m-0">{{ error.title }}</p>
      <p class="muted m-0 mt-1 text-xs font-bold">{{ error.text }}</p>
    </div>
  </section>
</template>

<script setup>
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import { computed, onMounted, reactive, ref } from "vue";
import { useAppStore } from "src/stores/app";
import { useAppSettingsStore } from "src/stores/appSettings";
import { useClientAuthStore } from "src/stores/clientAuth";

const emit = defineEmits(["authenticated"]);

const app = useAppStore();
const settings = useAppSettingsStore();
const client = useClientAuthStore();
const busy = ref(false);
const error = ref(null);
const initialized = ref(false);
const initializing = ref(false);
const pendingCompletion = ref(null);
const completion = reactive({
  first_name: "",
  last_name: "",
  mobile_prefix: "+993",
  mobile_number: "",
});

const socialCopy = {
  ru: {
    socialLogin: "Социальный вход",
    completeSocial: "Завершить регистрацию",
    firstName: "Имя",
    lastName: "Фамилия",
    phone: "Телефон",
    sending: "Отправляем...",
    reauthTitle: (provider) => `${provider} требует повторной авторизации.`,
    reauthText: "Закройте окно входа и попробуйте еще раз. Если ошибка повторяется, используйте Email или гостевой вход.",
    cancelledTitle: "Вход отменен.",
    cancelledText: "Попробуйте еще раз или продолжите как гость.",
    notConfiguredTitle: (provider) => `${provider} еще не настроен.`,
    notConfiguredText: "Провайдер включен, но приложению не хватает OAuth-настроек. Сейчас можно использовать гостевой или Email-вход.",
    failedTitle: (provider) => `${provider} не смог выполнить вход.`,
    failedText: "Попробуйте еще раз. Если вход не пройдет, используйте Email или гостевой режим.",
    loading: "Социальный вход еще загружается. Попробуйте еще раз через секунду.",
    webHint: " Для web-входа также проверьте OAuth redirect origins.",
  },
  tk: {
    socialLogin: "Sosial giriş",
    completeSocial: "Hasaba almagy tamamla",
    firstName: "Ady",
    lastName: "Familiýasy",
    phone: "Telefon",
    sending: "Iberilýär...",
    reauthTitle: (provider) => `${provider} gaýtadan ygtyýarlandyrmagy talap edýär.`,
    reauthText: "Giriş penjiresini ýapyň we gaýtadan synanyşyň. Gaýtalansa Email ýa-da myhman girişini ulanyň.",
    cancelledTitle: "Giriş ýatyryldy.",
    cancelledText: "Gaýtadan synanyşyň ýa-da myhman hökmünde dowam ediň.",
    notConfiguredTitle: (provider) => `${provider} entek sazlanmady.`,
    notConfiguredText: "Provider açyk, ýöne OAuth sazlamalary ýetmeýär. Häzir myhman ýa-da Email girişini ulanyp bolýar.",
    failedTitle: (provider) => `${provider} giriş edip bilmedi.`,
    failedText: "Gaýtadan synanyşyň. Bolmasa Email ýa-da myhman režimini ulanyň.",
    loading: "Sosial giriş ýüklenýär. Bir sekuntdan gaýtadan synanyşyň.",
    webHint: " Web giriş üçin OAuth redirect origins hem barlaň.",
  },
  en: {
    socialLogin: "Social sign in",
    completeSocial: "Complete registration",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    sending: "Sending...",
    reauthTitle: (provider) => `${provider} needs reauthorization.`,
    reauthText: "Close the sign-in window and try again. If it repeats, use Email or guest sign in.",
    cancelledTitle: "Sign in cancelled.",
    cancelledText: "Try again or continue as guest.",
    notConfiguredTitle: (provider) => `${provider} is not configured yet.`,
    notConfiguredText: "The provider is enabled, but OAuth settings are missing. Guest or Email sign in is available now.",
    failedTitle: (provider) => `${provider} could not sign in.`,
    failedText: "Try again. If sign in still fails, use Email or guest mode.",
    loading: "Social sign in is still loading. Try again in a second.",
    webHint: " For web sign in, also check OAuth redirect origins.",
  },
};

const copy = computed(() => socialCopy[app.language] || socialCopy.ru);
const socialCount = computed(() => Math.max(1, [settings.social.google, settings.social.facebook, settings.social.apple].filter(Boolean).length));
const canComplete = computed(
  () => pendingCompletion.value?.uuid && completion.first_name && completion.last_name && completion.mobile_prefix && completion.mobile_number
);
const providerNames = {
  google: "Google",
  facebook: "Facebook",
  apple: "Apple",
};

const decodeJwtPayload = (token = "") => {
  try {
    const [, payload = ""] = String(token).split(".");
    if (!payload) return {};
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch {
    return {};
  }
};

const normalizeAppleUser = (rawUser) => {
  if (!rawUser) return {};
  if (typeof rawUser === "object") return rawUser;
  try {
    return JSON.parse(rawUser);
  } catch {
    return {};
  }
};

const appleAccessTokenValue = (accessToken) => {
  if (!accessToken) return "";
  if (typeof accessToken === "string") return accessToken;
  return accessToken.token || "";
};

const looksLikeJwt = (token = "") => String(token).split(".").length >= 3;

const firstAppleIdentityToken = (...tokens) =>
  tokens.find((token) => looksLikeJwt(token)) || tokens.find(Boolean) || "";

const applePayloadToSocialPayload = (payload = {}) => {
  const idToken = firstAppleIdentityToken(
    payload.id_token,
    payload.identityToken,
    appleAccessTokenValue(payload.accessToken),
    payload.social_token,
    payload.idToken
  );
  const claims = decodeJwtPayload(idToken);
  const user = normalizeAppleUser(payload.user);
  const name = user.name || {};

  return {
    id: String(payload.id || claims.sub || user.sub || user.id || idToken || payload.code || ""),
    email_address: String(payload.email_address || payload.email || claims.email || user.email || ""),
    first_name: String(payload.first_name || payload.given_name || name.firstName || name.givenName || ""),
    last_name: String(payload.last_name || payload.family_name || name.lastName || name.familyName || ""),
    social_strategy: "apple",
    social_token: String(idToken || payload.code || payload.authorizationCode || ""),
  };
};

const appleProviderResultToSocialPayload = (result = {}) => {
  const profile = result.profile || {};
  const accessToken = appleAccessTokenValue(result.accessToken);
  const identityToken = firstAppleIdentityToken(result.identityToken, accessToken, result.idToken);
  const claims = decodeJwtPayload(identityToken);
  const fallbackToken = identityToken || result.idToken || result.authorizationCode || profile.user || "";

  return {
    id: String(profile.user || result.user || claims.sub || fallbackToken || ""),
    email_address: String(profile.email || result.email || claims.email || ""),
    first_name: String(profile.givenName || result.givenName || claims.given_name || ""),
    last_name: String(profile.familyName || result.familyName || claims.family_name || ""),
    social_strategy: "apple",
    social_token: String(fallbackToken),
  };
};

const waitForTagamAppleCallback = () =>
  new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      reject(new Error("Apple callback timeout"));
    }, 180000);

    function handleMessage(event) {
      if (event.origin && event.origin !== window.location.origin) return;
      if (event.data?.source !== "apple-login") return;

      window.clearTimeout(timeout);
      window.removeEventListener("message", handleMessage);

      const payload = event.data?.payload || {};
      if (payload.error) {
        reject(new Error(payload.error));
        return;
      }

      const socialPayload = applePayloadToSocialPayload(payload);
      if (!socialPayload.id && !socialPayload.social_token && !socialPayload.email_address) {
        reject(new Error("Apple callback did not include user data"));
        return;
      }

      resolve(socialPayload);
    }

    window.addEventListener("message", handleMessage);
  });

const socialErrorMessage = (caught, provider = "") => {
  const raw = caught?.message ?? String(caught ?? "");
  const providerName = providerNames[provider] || copy.value.socialLogin;

  if (/reauth|sign-?in failed|\[16\]|developer_error|12500|10:/i.test(raw)) {
    return {
      title: copy.value.reauthTitle(providerName),
      text: copy.value.reauthText,
    };
  }

  if (/cancel|popup closed|user.*closed/i.test(raw)) {
    return {
      title: copy.value.cancelledTitle,
      text: copy.value.cancelledText,
    };
  }

  if (/not set|not configured|client id|initialize/i.test(raw)) {
    return {
      title: copy.value.notConfiguredTitle(providerName),
      text: copy.value.notConfiguredText,
    };
  }

  return {
    title: copy.value.failedTitle(providerName),
    text: copy.value.failedText,
  };
};

const initializeSocialLogin = async () => {
  if (initialized.value || initializing.value) return;
  initializing.value = true;
  try {
    await settings.load();
    if (!settings.hasSocialLogin) return;

    const config = {};
    const webRedirectUrl = `${window.location.origin}/user/social_callback`;
    if (settings.social.google && settings.social.googleClientId) {
      config.google = {
        webClientId: settings.social.googleClientId,
        iOSClientId: settings.social.googleIosClientId,
        iOSServerClientId: settings.social.googleIosServerClientId,
        mode: "online",
        redirectUrl: Capacitor.isNativePlatform() ? undefined : webRedirectUrl,
      };
    }
    if (settings.social.facebook && settings.social.facebookAppId) {
      config.facebook = {
        appId: settings.social.facebookAppId,
        clientToken: settings.social.facebookClientToken,
      };
    }
    if (settings.social.apple && settings.social.appleClientId) {
      const platform = Capacitor.getPlatform();
      config.apple = { clientId: settings.social.appleClientId };

      if (platform === "android") {
        config.apple.redirectUrl = settings.social.appleAppRedirectUrl || settings.social.appleRedirectUrl;
      } else if (platform !== "ios") {
        config.apple.redirectUrl = settings.social.appleWebRedirectUrl || `${window.location.origin}/user/apple_callback`;
      }
    }

    if (!Object.keys(config).length) return;
    await SocialLogin.initialize(config);
    initialized.value = true;
  } finally {
    initializing.value = false;
  }
};

const finishSocialLogin = async (payload) => {
  const response = await client.socialRegister(payload);
  if (response?.needsCompletion) {
    pendingCompletion.value = response;
    completion.first_name = payload.first_name || "";
    completion.last_name = payload.last_name || "";
    return;
  }

  emit("authenticated");
};

const runProvider = async (provider, runner) => {
  busy.value = true;
  error.value = null;
  pendingCompletion.value = null;
  try {
    if (!initialized.value) {
      throw new Error(copy.value.loading);
    }
    await finishSocialLogin(await runner());
  } catch (caught) {
    const nativeHint = Capacitor.isNativePlatform() ? "" : copy.value.webHint;
    error.value = socialErrorMessage({ message: `${caught?.message ?? String(caught)}${nativeHint}` }, provider);
  } finally {
    busy.value = false;
  }
};

const loginWithGoogle = () =>
  runProvider("google", async () => {
    const results = await SocialLogin.login({
      provider: "google",
      options: { scopes: ["email", "profile"], forceRefreshToken: true, filterByAuthorizedAccounts: false },
    });
    const profile = results.result.profile;
    return {
      id: profile.id,
      email_address: profile.email,
      first_name: profile.givenName,
      last_name: profile.familyName,
      social_strategy: "google",
      social_token: results.result.accessToken?.token || results.result.idToken || "",
    };
  });

const loginWithFacebook = () =>
  runProvider("facebook", async () => {
    const results = await SocialLogin.login({
      provider: "facebook",
      options: { permissions: ["email", "public_profile"], limitedLogin: false },
    });
    const token = results.result.accessToken?.token || "";
    let profile = results.result.profile;

    if (token && (!profile?.email || !profile?.first_name)) {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,first_name,last_name,email,picture&access_token=${token}`
      );
      profile = await response.json();
    }

    return {
      id: profile.id || profile.userID,
      email_address: profile.email,
      first_name: profile.first_name || profile.name?.split(" ")?.[0] || "",
      last_name: profile.last_name || profile.name?.split(" ")?.slice(1).join(" ") || "",
      social_strategy: "facebook",
      social_token: token,
    };
  });

const loginWithApple = () =>
  runProvider("apple", async () => {
    const results = await (Capacitor.isNativePlatform()
      ? SocialLogin.login({
          provider: "apple",
          options: { scopes: ["email", "name"] },
        })
      : Promise.race([
          SocialLogin.login({
            provider: "apple",
            options: { scopes: ["email", "name"] },
          }),
          waitForTagamAppleCallback().then((payload) => ({ provider: "apple", result: { tagamPayload: payload } })),
        ]));

    if (results.result.tagamPayload) {
      return results.result.tagamPayload;
    }

    return appleProviderResultToSocialPayload(results.result);
  });

const completeSignup = async () => {
  if (!canComplete.value) return;
  busy.value = true;
  error.value = null;
  try {
    await client.completeSocialSignup({
      client_uuid: pendingCompletion.value.uuid,
      ...completion,
      custom_fields: [],
    });
    pendingCompletion.value = null;
    emit("authenticated");
  } catch (caught) {
    error.value = socialErrorMessage(caught);
  } finally {
    busy.value = false;
  }
};

onMounted(() => {
  initializeSocialLogin().catch((caught) => {
    error.value = socialErrorMessage(caught);
  });
});
</script>

<style scoped>
.social-buttons-row {
  display: grid;
  grid-template-columns: repeat(var(--social-count, 3), minmax(0, 1fr));
  gap: 8px;
}

.social-button {
  display: grid;
  min-width: 0;
  min-height: 62px;
  place-items: center;
  align-content: center;
  gap: 5px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background:
    radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--app-accent) 10%, transparent), transparent 58%),
    rgba(255, 255, 255, 0.06);
  color: var(--app-fg);
  font-size: 10px;
  font-weight: 850;
  line-height: 1.1;
}

.social-button:disabled {
  cursor: wait;
  opacity: 0.55;
}

.social-button img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

@media (max-width: 360px) {
  .social-button {
    min-height: 56px;
    font-size: 9px;
  }

  .social-button img {
    width: 21px;
    height: 21px;
  }
}
</style>
