<template>
  <section class="page fade-up">
    <AppHeader title="Чат" :icon="MessageCircle" action-label="Обновить" @action="loadSuggested" />

    <AuthBridge v-if="!client.authenticated" @authenticated="loadSuggested" />

    <template v-else>
      <div class="premium-card p-5">
        <p class="brand-kicker m-0">TAGAM CHAT</p>
        <h1 class="m-0 mt-2 text-3xl font-black">Связь с рестораном</h1>
        <p class="muted m-0 mt-2 text-sm">
          Найдите ресторан или оператора, чтобы быстро уточнить детали заказа.
        </p>
      </div>

      <label class="soft-card flex items-center gap-3 p-3">
        <Search :size="20" class="text-[var(--app-accent)]" />
        <input v-model.trim="query" class="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" placeholder="Поиск ресторана или оператора" @keyup.enter="search" />
        <button class="tagam-pill px-3" type="button" @click="search">Найти</button>
      </label>

      <p v-if="error" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ error }}
      </p>

      <div v-if="loading" class="grid gap-3">
        <div v-for="index in 3" :key="index" class="warm-skeleton h-20 rounded-[8px]" />
      </div>

      <section class="grid gap-3">
        <div class="flex items-center justify-between gap-3">
          <h2 class="m-0 text-xl font-black">{{ query ? "Результаты" : "Предложенные контакты" }}</h2>
          <span class="muted text-sm">{{ users.length }}</span>
        </div>

        <article v-for="user in users" :key="user.user_uuid || user.uuid || user.client_uuid || JSON.stringify(user)" class="soft-card flex items-center gap-3 p-4">
          <img v-if="user.photo_url || user.photo" class="h-12 w-12 rounded-full object-cover" :src="user.photo_url || user.photo" alt="" />
          <div v-else class="grid h-12 w-12 place-items-center rounded-full bg-[var(--app-accent)] text-lg font-black text-black">
            {{ initials(user) }}
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="m-0 truncate text-base font-black">{{ displayName(user) }}</h3>
            <p class="muted m-0 mt-1 text-sm">{{ user.user_type || user.restaurant_name || user.email_address || user.phone || "Контакт Tagam" }}</p>
          </div>
          <RouterLink class="icon-button h-10 w-10 shrink-0" :to="{ path: '/account/chat/conversation', query: { user_uuid: user.user_uuid || user.uuid || user.client_uuid } }">
            <ChevronRight :size="18" />
          </RouterLink>
        </article>

        <div v-if="!loading && !users.length" class="soft-card p-5 text-center">
          <h2 class="m-0 text-xl font-black">Контактов нет</h2>
          <p class="muted m-0 mt-2 text-sm">Когда появятся доступные контакты, они будут показаны здесь.</p>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup>
import { ChevronRight, MessageCircle, Search } from "@lucide/vue";
import { computed, onMounted, ref, watch } from "vue";
import APIinterface from "src/api/APIinterface";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useClientAuthStore } from "src/stores/clientAuth";

const client = useClientAuthStore();
const query = ref("");
const loading = ref(false);
const error = ref("");
const data = ref([]);

const users = computed(() => (Array.isArray(data.value) ? data.value : []));

const normalize = (response) => {
  const value = response?.details?.data ?? response?.details ?? response?.data ?? response;
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value).filter((item) => item && typeof item === "object");
  return [];
};

const displayName = (user) =>
  [user.first_name, user.last_name].filter(Boolean).join(" ") ||
  user.restaurant_name ||
  user.name ||
  user.email_address ||
  "Контакт Tagam";

const initials = (user) =>
  displayName(user)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const run = async (method, payload) => {
  if (!client.authenticated) return;
  loading.value = true;
  error.value = "";
  try {
    const response = await APIinterface.fetchDataChats(method, payload);
    data.value = normalize(response);
  } catch (err) {
    data.value = [];
    const message = err?.message ?? String(err);
    error.value = /^(null|undefined)$/i.test(message) ? "" : message;
  } finally {
    loading.value = false;
  }
};

const loadSuggested = () => run("suggestedUser", { search_type: ["merchant", "admin"] });
const search = () => {
  if (!query.value) {
    loadSuggested();
    return;
  }
  run("searchChats", { search: query.value, search_type: ["merchant", "admin"] });
};

onMounted(loadSuggested);
watch(() => client.token, loadSuggested);
</script>
