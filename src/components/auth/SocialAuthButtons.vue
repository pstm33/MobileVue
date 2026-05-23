<template>
  <section v-if="settings.hasSocialLogin" class="grid gap-3">
    <div class="grid gap-2" :class="canUseApple ? 'grid-cols-3' : 'grid-cols-2'">
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
        v-if="canUseApple"
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
      <p class="m-0 text-sm font-black">Завершите социальную регистрацию</p>
      <p class="muted m-0 mt-1 text-xs">{{ pendingCompletion.message }}</p>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <input v-model="completion.first_name" class="field" placeholder="Имя" />
        <input v-model="completion.last_name" class="field" placeholder="Фамилия" />
      </div>
      <div class="mt-2 grid grid-cols-[86px_1fr] gap-2">
        <input v-model="completion.mobile_prefix" class="field" placeholder="+993" />
        <input v-model="completion.mobile_number" class="field" inputmode="tel" placeholder="Телефон" />
      </div>
      <button class="primary-button mt-3 w-full" type="button" :disabled="busy || !canComplete" @click="completeSignup">
        {{ busy ? "Отправляем..." : "Завершить регистрацию" }}
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
import { useAppSettingsStore } from "src/stores/appSettings";
import { useClientAuthStore } from "src/stores/clientAuth";

const emit = defineEmits(["authenticated"]);

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

const canComplete = computed(
  () => pendingCompletion.value?.uuid && completion.first_name && completion.last_name && completion.mobile_prefix && completion.mobile_number
);
const canUseApple = computed(() => settings.social.apple && Capacitor.getPlatform() !== "android");

const providerNames = {
  google: "Google",
  facebook: "Facebook",
  apple: "Apple",
};

const socialErrorMessage = (caught, provider = "") => {
  const raw = caught?.message ?? String(caught ?? "");
  const providerName = providerNames[provider] || "Социальный вход";

  if (/reauth|sign-?in failed|\[16\]|developer_error|12500|10:/i.test(raw)) {
    return {
      title: `${providerName} требует повторной авторизации.`,
      text: "Закройте окно входа и попробуйте еще раз. Если ошибка повторяется, используйте Facebook, Email или гостевой вход, пока мы завершаем OAuth-настройки этой сборки.",
    };
  }

  if (/cancel|popup closed|user.*closed/i.test(raw)) {
    return {
      title: "Вход отменен.",
      text: "Попробуйте еще раз или продолжите как гость.",
    };
  }

  if (/not set|not configured|client id|initialize/i.test(raw)) {
    return {
      title: `${providerName} не настроен.`,
      text: "Провайдер включен в KMRS, но приложению не хватает OAuth-настроек. Сейчас можно использовать гостевой или Email-вход.",
    };
  }

  return {
    title: `${providerName} не смог выполнить вход.`,
    text: raw,
  };
};

const initializeSocialLogin = async () => {
  if (initialized.value || initializing.value) return;
  initializing.value = true;
  try {
    await settings.load();
    if (!settings.hasSocialLogin) return;

    const config = {};
    if (settings.social.google && settings.social.googleClientId) {
      config.google = {
        webClientId: settings.social.googleClientId,
        mode: "online",
      };
    }
    if (settings.social.facebook && settings.social.facebookAppId) {
      config.facebook = {
        appId: settings.social.facebookAppId,
        clientToken: settings.social.facebookClientToken,
      };
    }
    if (canUseApple.value && settings.social.appleClientId) {
      config.apple = {
        clientId: settings.social.appleClientId,
        redirectUrl: settings.social.appleRedirectUrl,
      };
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
      throw new Error("Социальный вход еще загружается. Попробуйте еще раз через секунду.");
    }
    await finishSocialLogin(await runner());
  } catch (caught) {
    const nativeHint = Capacitor.isNativePlatform() ? "" : " Для web-входа также проверьте OAuth redirect origins.";
    error.value = socialErrorMessage({ message: `${caught?.message ?? String(caught)}${nativeHint}` }, provider);
  } finally {
    busy.value = false;
  }
};

const loginWithGoogle = () =>
  runProvider("google", async () => {
    const results = await SocialLogin.login({
      provider: "google",
      options: { scopes: ["email", "profile"], forceRefreshToken: true },
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
    const results = await SocialLogin.login({
      provider: "apple",
      options: { scopes: ["email", "name"] },
    });
    const profile = results.result.profile;
    return {
      id: profile.user,
      email_address: profile.email,
      first_name: profile.givenName,
      last_name: profile.familyName,
      social_strategy: "apple",
      social_token: results.result.idToken || results.result.accessToken?.token || "",
    };
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
.social-button {
  display: grid;
  min-width: 0;
  min-height: 58px;
  place-items: center;
  gap: 4px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--app-fg);
  font-size: 11px;
  font-weight: 850;
}

.social-button:disabled {
  cursor: wait;
  opacity: 0.55;
}

.social-button img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
</style>
