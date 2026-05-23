<template>
  <section class="tagam-card grid gap-4 p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="brand-kicker m-0">Профиль</p>
        <h2 class="m-0 mt-1 text-lg font-black">
          {{ client.authenticated ? client.displayName : modeTitle }}
        </h2>
        <p class="muted m-0 mt-1 text-sm">
          {{ client.authenticated ? "Client token сохранен, защищенные сценарии KMRS доступны." : modeSubtitle }}
        </p>
      </div>
      <button v-if="client.authenticated" class="tagam-pill tap-motion px-3 py-2 text-xs" type="button" @click="logout">
        Выйти
      </button>
    </div>

    <div v-if="!client.authenticated" class="grid gap-4">
      <div class="hide-scrollbar flex gap-2 overflow-x-auto">
        <button v-for="tab in tabs" :key="tab.value" class="tagam-pill tap-motion shrink-0 px-4 py-2" :class="{ 'is-active': mode === tab.value }" type="button" @click="mode = tab.value">
          {{ tab.label }}
        </button>
      </div>

      <SocialAuthButtons v-if="!['otp', 'reset', 'social-complete'].includes(mode)" @authenticated="afterAuth" />

      <div v-if="!['otp', 'reset', 'social-complete'].includes(mode)" class="flex items-center gap-3">
        <div class="h-px flex-1 bg-white/10" />
        <span class="muted text-xs font-black uppercase tracking-[0.16em]">или</span>
        <div class="h-px flex-1 bg-white/10" />
      </div>

      <div v-if="mode === 'guest'" class="grid gap-3">
        <NameFields :model="guest" />
        <PhoneFields :model="guest" />
        <button class="primary-button tap-motion w-full" type="button" :disabled="client.loading || !canGuest" @click="submitGuest">
          {{ client.loading ? "Отправляем..." : "Продолжить как гость" }}
        </button>
      </div>

      <div v-else-if="mode === 'login'" class="grid gap-3">
        <input v-model="login.username" class="field" autocomplete="username" placeholder="Телефон или email" />
        <input v-model="login.password" class="field" autocomplete="current-password" placeholder="Пароль" type="password" />
        <button class="primary-button tap-motion w-full" type="button" :disabled="client.loading || !login.username || !login.password" @click="submitLogin">
          {{ client.loading ? "Входим..." : "Войти" }}
        </button>
        <button class="tagam-pill tap-motion w-full px-4 py-3" type="button" @click="mode = 'reset'">Забыли пароль?</button>
      </div>

      <div v-else-if="mode === 'phone'" class="grid gap-3">
        <PhoneFields :model="otpRequest" />
        <button class="primary-button tap-motion w-full" type="button" :disabled="client.loading || !otpRequest.mobile_number" @click="requestPhoneOtp">
          {{ client.loading ? "Отправляем..." : "Отправить OTP" }}
        </button>
      </div>

      <div v-else-if="mode === 'signup'" class="grid gap-3">
        <NameFields :model="signup" />
        <input v-model="signup.email_address" class="field" autocomplete="email" placeholder="Email" type="email" />
        <PhoneFields :model="signup" />
        <input v-model="signup.password" class="field" autocomplete="new-password" placeholder="Пароль" type="password" />
        <input v-model="signup.cpassword" class="field" autocomplete="new-password" placeholder="Повторите пароль" type="password" />
        <button class="primary-button tap-motion w-full" type="button" :disabled="client.loading || !canSignup" @click="submitSignup">
          {{ client.loading ? "Создаем..." : "Создать аккаунт" }}
        </button>
      </div>

      <div v-else-if="mode === 'social-complete'" class="grid gap-3">
        <div class="soft-card p-4">
          <p class="brand-kicker m-0">SOCIAL LOGIN</p>
          <h3 class="m-0 mt-1 text-xl font-black">Complete profile</h3>
          <p class="muted m-0 mt-1 text-sm">KMRS needs a phone number to finish the client token.</p>
        </div>
        <NameFields :model="signup" />
        <input v-model="signup.email_address" class="field" autocomplete="email" placeholder="Email" type="email" />
        <PhoneFields :model="signup" />
        <button class="primary-button tap-motion w-full" type="button" :disabled="client.loading || !canCompleteSocial" @click="submitSocialCompletion">
          {{ client.loading ? "Saving..." : "Finish login" }}
        </button>
      </div>

      <div v-else-if="mode === 'otp'" class="grid gap-3">
        <div class="soft-card p-4">
          <p class="brand-kicker m-0">OTP VERIFICATION</p>
          <h3 class="m-0 mt-1 text-xl font-black">Введите код</h3>
          <p class="muted m-0 mt-1 text-sm">{{ otpState.message }}</p>
        </div>
        <input v-model="otpState.otp" class="field text-center text-xl font-black tracking-[0.25em]" inputmode="numeric" maxlength="8" placeholder="000000" />
        <button class="primary-button tap-motion w-full" type="button" :disabled="client.loading || !otpState.otp" @click="verifyOtp">
          {{ client.loading ? "Проверяем..." : "Подтвердить" }}
        </button>
        <button class="tagam-pill tap-motion w-full px-4 py-3" type="button" :disabled="client.loading" @click="resendOtp">Отправить код еще раз</button>
      </div>

      <div v-else-if="mode === 'reset'" class="grid gap-3">
        <input v-model="reset.email" class="field" autocomplete="email" placeholder="Email для восстановления" type="email" />
        <button class="primary-button tap-motion w-full" type="button" :disabled="client.loading || !reset.email" @click="requestReset">
          {{ client.loading ? "Отправляем..." : "Отправить восстановление" }}
        </button>
        <template v-if="reset.uuid">
          <input v-model="reset.password" class="field" autocomplete="new-password" placeholder="Новый пароль" type="password" />
          <input v-model="reset.cpassword" class="field" autocomplete="new-password" placeholder="Повторите пароль" type="password" />
          <button class="tagam-pill tap-motion w-full px-4 py-3" type="button" :disabled="client.loading || !canReset" @click="submitReset">Сохранить новый пароль</button>
        </template>
      </div>
    </div>

    <div v-if="client.error" class="rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
      {{ client.error }}
    </div>
    <div v-if="notice" class="rounded-[8px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-50">
      {{ notice }}
    </div>
  </section>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import SocialAuthButtons from "src/components/auth/SocialAuthButtons.vue";
import { checkoutPayload, useCartStore } from "src/stores/cart";
import { useCheckoutStore } from "src/stores/checkout";
import { useClientAuthStore } from "src/stores/clientAuth";

const emit = defineEmits(["authenticated", "logout"]);

const client = useClientAuthStore();
const checkout = useCheckoutStore();
const cart = useCartStore();
const route = useRoute();
const mode = ref("guest");
const notice = ref("");
const tabs = [
  { value: "guest", label: "Гость" },
  { value: "login", label: "Email" },
  { value: "signup", label: "Регистрация" },
];

const routeModeMap = {
  login: "login",
  "login-email": "login",
  "login-phone": "login",
  "login-otp": "login",
  signup: "signup",
  "signup-mobile": "signup",
  forgotpass: "reset",
  "reset-password": "reset",
  "verify-otp": "otp",
  apple_callback: "login",
  guest: "guest",
};

const guest = reactive({ first_name: "Tagam", last_name: "Guest", mobile_prefix: "993", mobile_number: "" });
const login = reactive({ username: "", password: "" });
const otpRequest = reactive({ mobile_prefix: "993", mobile_number: "" });
const signup = reactive({ first_name: "", last_name: "", email_address: "", mobile_prefix: "993", mobile_number: "", password: "", cpassword: "" });
const otpState = reactive({ uuid: "", otp: "", validationType: "email", action: "verifyOTP", message: "" });
const reset = reactive({ email: "", uuid: "", password: "", cpassword: "" });
const socialCompletionUuid = ref("");

const modeTitle = computed(() => ({
  guest: "Войдите или продолжите как гость",
  login: "Вход по email или телефону",
  phone: "Вход по OTP",
  signup: "Создать аккаунт",
  otp: "Проверка OTP",
  reset: "Восстановить пароль",
}[mode.value] || "Complete social login"));
const modeSubtitle = computed(() => ({
  guest: "KMRS требует client token для оплаты и финального заказа.",
  login: "Используйте пароль от клиентского аккаунта KMRS.",
  phone: "Получите одноразовый код по телефону.",
  signup: "Регистрация создает настоящий client token на сервере.",
  otp: "Код проверяется реальным KMRS endpoint.",
  reset: "Восстановление работает через KMRS resetPassword.",
}[mode.value] || "Social provider returned a profile; KMRS still needs phone details."));
const canGuest = computed(() => guest.first_name && guest.last_name && guest.mobile_prefix && guest.mobile_number);
const canSignup = computed(() => signup.first_name && signup.last_name && signup.email_address && signup.password && signup.password === signup.cpassword);
const canReset = computed(() => reset.uuid && reset.password && reset.password === reset.cpassword);
const canCompleteSocial = computed(() => socialCompletionUuid.value && signup.first_name && signup.last_name && signup.mobile_prefix && signup.mobile_number);

const NameFields = defineComponent({
  props: { model: { type: Object, required: true } },
  setup(props) {
    return () => h("div", { class: "grid grid-cols-2 gap-3" }, [
      h("label", { class: "grid gap-2" }, [
        h("span", { class: "field-label text-xs font-black uppercase" }, "Имя"),
        h("input", { class: "field", autocomplete: "given-name", value: props.model.first_name, onInput: (event) => (props.model.first_name = event.target.value) }),
      ]),
      h("label", { class: "grid gap-2" }, [
        h("span", { class: "field-label text-xs font-black uppercase" }, "Фамилия"),
        h("input", { class: "field", autocomplete: "family-name", value: props.model.last_name, onInput: (event) => (props.model.last_name = event.target.value) }),
      ]),
    ]);
  },
});

const PhoneFields = defineComponent({
  props: { model: { type: Object, required: true } },
  setup(props) {
    return () => h("label", { class: "grid gap-2" }, [
      h("span", { class: "field-label text-xs font-black uppercase" }, "Телефон"),
      h("div", { class: "grid grid-cols-[86px_1fr] gap-2" }, [
        h("input", { class: "field", value: props.model.mobile_prefix, onInput: (event) => (props.model.mobile_prefix = event.target.value) }),
        h("input", { class: "field", inputmode: "tel", autocomplete: "tel", placeholder: "61234567", value: props.model.mobile_number, onInput: (event) => (props.model.mobile_number = event.target.value) }),
      ]),
    ]);
  },
});

const enterOtp = (state) => {
  otpState.uuid = state.uuid || "";
  otpState.validationType = state.validationType || "email";
  otpState.action = state.action || "verifyOTP";
  otpState.message = state.message || "Введите OTP-код.";
  otpState.otp = "";
  mode.value = "otp";
};

const afterAuth = async () => {
  notice.value = "";
  await cart.refresh("", checkoutPayload).catch(() => {});
  await checkout.loadPayments().catch(() => {});
  emit("authenticated");
};

const submitGuest = async () => {
  const result = await client.registerGuest(guest);
  if (result?.needsOtp) return enterOtp(result);
  await afterAuth();
};
const submitLogin = async () => {
  await client.login(login);
  await afterAuth();
};
const requestPhoneOtp = async () => {
  enterOtp(await client.requestOtp({ ...otpRequest, validation_type: "sms" }));
};
const submitSignup = async () => {
  const result = await client.signup(signup);
  if (result?.needsOtp) return enterOtp(result);
  await afterAuth();
};
const verifyOtp = async () => {
  await client.verifyOtp(otpState);
  await afterAuth();
};
const resendOtp = async () => {
  notice.value = await client.resendOtp({ uuid: otpState.uuid, validationType: otpState.validationType });
};
const requestReset = async () => {
  const result = await client.requestPasswordReset(reset.email);
  reset.uuid = result.uuid || "";
  notice.value = result.message;
};
const submitReset = async () => {
  notice.value = await client.resetPassword(reset);
  mode.value = "login";
};
const submitSocialCompletion = async () => {
  await client.completeSocialSignup({
    client_uuid: socialCompletionUuid.value,
    first_name: signup.first_name,
    last_name: signup.last_name,
    email_address: signup.email_address,
    mobile_prefix: signup.mobile_prefix,
    mobile_number: signup.mobile_number,
    custom_fields: [],
  });
  socialCompletionUuid.value = "";
  await afterAuth();
};
const applyAppleCallback = async () => {
  if (route.params.authPage !== "apple_callback") return;

  const payload = {
    id: String(route.query.id || route.query.social_id || route.query.sub || route.query.social_token || ""),
    social_token: String(route.query.social_token || route.query.id_token || route.query.token || ""),
    social_strategy: String(route.query.social_strategy || "apple"),
    email_address: String(route.query.email_address || route.query.email || ""),
    first_name: String(route.query.first_name || route.query.given_name || ""),
    last_name: String(route.query.last_name || route.query.family_name || ""),
  };

  if (!payload.id && !payload.social_token && !payload.email_address) {
    notice.value = String(route.query.msg || "Apple callback returned without a usable token.");
    return;
  }

  try {
    const response = await client.socialRegister(payload);
    if (response?.needsCompletion) {
      socialCompletionUuid.value = response.uuid || "";
      signup.first_name = payload.first_name || signup.first_name;
      signup.last_name = payload.last_name || signup.last_name;
      signup.email_address = payload.email_address || signup.email_address;
      notice.value = response.message || "";
      mode.value = "social-complete";
      return;
    }
    await afterAuth();
  } catch (error) {
    client.error = error?.message || String(error);
  }
};
const logout = () => {
  client.logout();
  emit("logout");
};

watch(mode, () => {
  notice.value = "";
  client.error = "";
});

onMounted(() => {
  const routeMode = routeModeMap[String(route.params.authPage || "")];
  if (routeMode) mode.value = routeMode;
  if (route.query.uuid) otpState.uuid = String(route.query.uuid);
  if (route.query.action) otpState.action = String(route.query.action);
  if (route.query.validation_type) otpState.validationType = String(route.query.validation_type);
  if (route.query.msg) otpState.message = String(route.query.msg);
  if (route.params.authPage === "reset-password" && route.query.uuid) {
    reset.uuid = String(route.query.uuid);
  }
  applyAppleCallback();
});
</script>
