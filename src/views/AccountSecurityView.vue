<template>
  <section class="page fade-up">
    <AppHeader title="Безопасность" :icon="ShieldCheck" action-label="Аккаунт" />

    <AuthBridge v-if="!client.authenticated" />

    <template v-else>
      <form class="tagam-card grid gap-4 p-5" @submit.prevent="savePassword">
        <div>
          <p class="brand-kicker m-0">ACCOUNT SECURITY</p>
          <h1 class="m-0 mt-1 text-2xl font-black">Сменить пароль</h1>
          <p class="muted m-0 mt-1 text-sm">Используйте надежный пароль, который не повторяется в других сервисах.</p>
        </div>

        <label class="grid gap-2">
          <span class="field-label text-xs font-black uppercase">Текущий пароль</span>
          <input v-model="password.old_password" class="field" autocomplete="current-password" type="password" />
        </label>
        <label class="grid gap-2">
          <span class="field-label text-xs font-black uppercase">Новый пароль</span>
          <input v-model="password.new_password" class="field" autocomplete="new-password" type="password" />
        </label>
        <label class="grid gap-2">
          <span class="field-label text-xs font-black uppercase">Повторите пароль</span>
          <input v-model="password.confirm_password" class="field" autocomplete="new-password" type="password" />
        </label>

        <button class="primary-button tap-motion w-full" type="submit" :disabled="customer.securityLoading || !canSavePassword">
          {{ customer.securityLoading ? "Отправляем..." : "Сохранить пароль" }}
        </button>
      </form>

      <section class="soft-card overflow-hidden">
        <button class="account-row tap-motion" type="button" @click="customer.requestAccountData().catch(() => {})">
          <span><FileDown :size="20" /> Запросить мои данные</span>
          <ChevronRight :size="18" />
        </button>
        <button class="account-row tap-motion border-t border-white/10" type="button" @click="deleteOpen = !deleteOpen">
          <span><Trash2 :size="20" /> Удаление аккаунта</span>
          <ChevronRight :size="18" :class="deleteOpen ? 'rotate-90' : ''" />
        </button>
        <div v-if="deleteOpen" class="grid gap-3 border-t border-white/10 p-4">
          <p class="muted m-0 text-sm">Для удаления аккаунта может потребоваться код подтверждения. Это защищает профиль от случайного удаления.</p>
          <input v-model="deleteCode" class="field" inputmode="numeric" placeholder="Код подтверждения" />
          <div class="grid grid-cols-2 gap-2">
            <button class="tagam-pill tap-motion px-4 py-2" type="button" :disabled="!deleteCode" @click="customer.verifyAccountDelete(deleteCode).catch(() => {})">
              Проверить код
            </button>
            <button class="tagam-pill tap-motion px-4 py-2 text-rose-200" type="button" :disabled="!deleteCode" @click="deleteAccount">
              Удалить
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
import { useClientAuthStore } from "src/stores/clientAuth";
import { useCustomerStore } from "src/stores/customer";

const client = useClientAuthStore();
const customer = useCustomerStore();
const deleteOpen = ref(false);
const deleteCode = ref("");
const password = reactive({
  old_password: "",
  new_password: "",
  confirm_password: "",
});

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
