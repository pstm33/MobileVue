<template>
  <section class="page fade-up">
    <AppHeader title="Профиль клиента" :icon="UserRound" action-label="Профиль" />

    <AuthBridge v-if="!client.authenticated" @authenticated="load" />

    <template v-else>
      <div v-if="customer.profileLoading" class="grid gap-3">
        <div class="warm-skeleton h-20 rounded-[8px]" />
        <div class="warm-skeleton h-64 rounded-[8px]" />
      </div>

      <form v-else class="tagam-card grid gap-4 p-5" @submit.prevent="save">
        <div>
          <p class="brand-kicker m-0">TAGAM PROFILE</p>
          <h1 class="m-0 mt-1 text-2xl font-black">Личные данные</h1>
          <p class="muted m-0 mt-1 text-sm">Обновите имя, email и телефон для связи по заказам.</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <label class="grid gap-2">
            <span class="field-label text-xs font-black uppercase">Имя</span>
            <input v-model="form.first_name" class="field" autocomplete="given-name" />
          </label>
          <label class="grid gap-2">
            <span class="field-label text-xs font-black uppercase">Фамилия</span>
            <input v-model="form.last_name" class="field" autocomplete="family-name" />
          </label>
        </div>

        <label class="grid gap-2">
          <span class="field-label text-xs font-black uppercase">Email</span>
          <input v-model="form.email_address" class="field" autocomplete="email" inputmode="email" />
        </label>

        <div class="grid grid-cols-[86px_1fr] gap-3">
          <label class="grid gap-2">
            <span class="field-label text-xs font-black uppercase">Код</span>
            <input v-model="form.mobile_prefix" class="field" inputmode="tel" />
          </label>
          <label class="grid gap-2">
            <span class="field-label text-xs font-black uppercase">Телефон</span>
            <input v-model="form.mobile_number" class="field" inputmode="tel" autocomplete="tel" />
          </label>
        </div>

        <p v-if="customer.profileError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
          {{ customer.profileError }}
        </p>
        <p v-if="customer.profileMessage" class="m-0 rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">
          {{ customer.profileMessage }}
        </p>

        <button class="primary-button tap-motion w-full" type="submit" :disabled="customer.profileSaving">
          {{ customer.profileSaving ? "Сохраняем..." : "Сохранить профиль" }}
        </button>
      </form>

      <section class="soft-card overflow-hidden">
        <RouterLink class="account-row tap-motion" to="/addresses">
          <span><MapPin :size="20" /> Адресная книга</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/payments">
          <span><CreditCard :size="20" /> Платежи</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/account/security">
          <span><ShieldCheck :size="20" /> Безопасность аккаунта</span>
          <ChevronRight :size="18" />
        </RouterLink>
      </section>
    </template>
  </section>
</template>

<script setup>
import { ChevronRight, CreditCard, MapPin, ShieldCheck, UserRound } from "@lucide/vue";
import { onMounted, reactive, watch } from "vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useClientAuthStore } from "src/stores/clientAuth";
import { useCustomerStore } from "src/stores/customer";

const client = useClientAuthStore();
const customer = useCustomerStore();

const form = reactive({
  first_name: "",
  last_name: "",
  email_address: "",
  mobile_prefix: "993",
  mobile_number: "",
});

const hydrate = () => {
  const data = customer.profileData || {};
  const user = client.user || {};
  form.first_name = data.first_name || user.first_name || "";
  form.last_name = data.last_name || user.last_name || "";
  form.email_address = data.email_address || user.email_address || "";
  form.mobile_prefix = String(data.mobile_prefix || user.mobile_prefix || "993").replace(/^\+/, "");
  form.mobile_number = data.mobile_number || user.mobile_number || user.contact_phone || "";
};

const load = async () => {
  if (!client.authenticated) return;
  await customer.loadProfile().catch(() => {});
  hydrate();
};

const save = async () => {
  await customer.saveProfile({
    first_name: form.first_name,
    last_name: form.last_name,
    email_address: form.email_address,
    mobile_prefix: String(form.mobile_prefix).replace(/^\+/, ""),
    mobile_number: String(form.mobile_number).replace(/\D/g, ""),
  }).catch(() => {});
  client.user = { ...(client.user || {}), ...form };
};

onMounted(load);
watch(() => client.token, load);
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
