<template>
  <section class="page fade-up">
    <AppHeader :title="copy.title" :icon="ShieldCheck" :action-label="copy.account" />

    <AuthBridge v-if="!client.authenticated" />

    <template v-else>
      <form class="tagam-card grid gap-4 p-5" @submit.prevent="savePassword">
        <div>
          <p class="brand-kicker m-0">{{ copy.kicker }}</p>
          <h1 class="m-0 mt-1 text-2xl font-black">{{ copy.changePassword }}</h1>
          <p class="muted m-0 mt-1 text-sm">{{ copy.passwordHint }}</p>
        </div>

        <label class="grid gap-2">
          <span class="field-label text-xs font-black uppercase">{{ copy.currentPassword }}</span>
          <input v-model="password.old_password" class="field" autocomplete="current-password" type="password" />
        </label>
        <label class="grid gap-2">
          <span class="field-label text-xs font-black uppercase">{{ copy.newPassword }}</span>
          <input v-model="password.new_password" class="field" autocomplete="new-password" type="password" />
        </label>
        <label class="grid gap-2">
          <span class="field-label text-xs font-black uppercase">{{ copy.repeatPassword }}</span>
          <input v-model="password.confirm_password" class="field" autocomplete="new-password" type="password" />
        </label>

        <button class="primary-button tap-motion w-full" type="submit" :disabled="customer.securityLoading || !canSavePassword">
          {{ customer.securityLoading ? copy.sending : copy.savePassword }}
        </button>
      </form>

      <section class="soft-card overflow-hidden">
        <button class="account-row tap-motion" type="button" @click="customer.requestAccountData().catch(() => {})">
          <span><FileDown :size="20" /> {{ copy.requestData }}</span>
          <ChevronRight :size="18" />
        </button>
        <button class="account-row tap-motion border-t border-white/10" type="button" @click="deleteOpen = !deleteOpen">
          <span><Trash2 :size="20" /> {{ copy.deleteAccount }}</span>
          <ChevronRight :size="18" :class="deleteOpen ? 'rotate-90' : ''" />
        </button>
        <div v-if="deleteOpen" class="grid gap-3 border-t border-white/10 p-4">
          <p class="muted m-0 text-sm">{{ copy.deleteHint }}</p>
          <input v-model="deleteCode" class="field" inputmode="numeric" :placeholder="copy.confirmCode" />
          <div class="grid grid-cols-2 gap-2">
            <button class="tagam-pill tap-motion px-4 py-2" type="button" :disabled="!deleteCode" @click="customer.verifyAccountDelete(deleteCode).catch(() => {})">
              {{ copy.checkCode }}
            </button>
            <button class="tagam-pill tap-motion px-4 py-2 text-rose-200" type="button" :disabled="!deleteCode" @click="deleteAccount">
              {{ copy.delete }}
            </button>
          </div>
        </div>
      </section>

      <p v-if="customer.securityError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ customer.securityError }}
      </p>
      <p v-if="customer.securityMessage" class="m-0 rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">
        {{ customer.securityMessage }}
      </p>
    </template>
  </section>
</template>

<script setup>
import { ChevronRight, FileDown, ShieldCheck, Trash2 } from "@lucide/vue";
import { computed, reactive, ref } from "vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useAppStore } from "src/stores/app";
import { useClientAuthStore } from "src/stores/clientAuth";
import { useCustomerStore } from "src/stores/customer";

const app = useAppStore();
const client = useClientAuthStore();
const customer = useCustomerStore();
const deleteOpen = ref(false);
const deleteCode = ref("");
const password = reactive({
  old_password: "",
  new_password: "",
  confirm_password: "",
});

const securityCopy = {
  ru: {
    title: "Безопасность",
    account: "Аккаунт",
    kicker: "Защита аккаунта",
    changePassword: "Сменить пароль",
    passwordHint: "Используйте надежный пароль, который не повторяется в других сервисах.",
    currentPassword: "Текущий пароль",
    newPassword: "Новый пароль",
    repeatPassword: "Повторите пароль",
    sending: "Отправляем...",
    savePassword: "Сохранить пароль",
    requestData: "Запросить мои данные",
    deleteAccount: "Удаление аккаунта",
    deleteHint: "Для удаления аккаунта может потребоваться код подтверждения. Это защищает профиль от случайного удаления.",
    confirmCode: "Код подтверждения",
    checkCode: "Проверить код",
    delete: "Удалить",
  },
  tk: {
    title: "Howpsuzlyk",
    account: "Hasap",
    kicker: "Hasaby goramak",
    changePassword: "Paroly çalyş",
    passwordHint: "Başga hyzmatlarda gaýtalanmaýan ygtybarly parol ulanyň.",
    currentPassword: "Häzirki parol",
    newPassword: "Täze parol",
    repeatPassword: "Paroly gaýtalaň",
    sending: "Iberilýär...",
    savePassword: "Paroly sakla",
    requestData: "Maglumatlarymy sora",
    deleteAccount: "Hasaby pozmak",
    deleteHint: "Hasaby pozmak üçin tassyklama kody gerek bolup biler. Bu profili tötänleýin pozmakdan goraýar.",
    confirmCode: "Tassyklama kody",
    checkCode: "Kody barla",
    delete: "Pozmak",
  },
  en: {
    title: "Security",
    account: "Account",
    kicker: "Account security",
    changePassword: "Change password",
    passwordHint: "Use a strong password that is not reused in other services.",
    currentPassword: "Current password",
    newPassword: "New password",
    repeatPassword: "Repeat password",
    sending: "Sending...",
    savePassword: "Save password",
    requestData: "Request my data",
    deleteAccount: "Delete account",
    deleteHint: "Deleting the account may require a confirmation code. This protects your profile from accidental deletion.",
    confirmCode: "Confirmation code",
    checkCode: "Check code",
    delete: "Delete",
  },
};

const copy = computed(() => securityCopy[app.language] || securityCopy.ru);

const canSavePassword = computed(
  () => password.old_password && password.new_password && password.new_password === password.confirm_password
);

const savePassword = async () => {
  if (!canSavePassword.value) return;
  await customer.updatePassword({ ...password }).catch(() => {});
  password.old_password = "";
  password.new_password = "";
  password.confirm_password = "";
};

const deleteAccount = async () => {
  await customer.deleteAccount(deleteCode.value).catch(() => {});
};
</script>

<style scoped>
.account-row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  color: var(--app-fg);
  text-align: left;
  font-weight: 850;
}

.account-row > span {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-row svg {
  color: var(--app-accent);
}
</style>
