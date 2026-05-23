<template>
  <section class="page fade-up">
    <AppHeader title="Версия приложения" :icon="Smartphone" action-label="Обновить" @action="load" />

    <div class="premium-card p-5">
      <p class="brand-kicker m-0">TAGAM DELIVERY</p>
      <h1 class="m-0 mt-2 text-3xl font-black">{{ title }}</h1>
      <p class="muted m-0 mt-2 text-sm">Проверяем, что у вас установлена актуальная версия приложения.</p>
    </div>

    <div v-if="settings.loading" class="grid gap-3">
      <div class="warm-skeleton h-20 rounded-[8px]" />
      <div class="warm-skeleton h-20 rounded-[8px]" />
    </div>

    <p v-if="settings.error" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
      {{ settings.error }}
    </p>

    <section class="soft-card overflow-hidden">
      <div v-for="row in rows" :key="row.label" class="version-row">
        <span>{{ row.label }}</span>
        <strong>{{ row.value }}</strong>
      </div>
    </section>

    <RouterLink class="primary-button w-full" to="/home">
      Открыть приложение
      <ArrowRight :size="18" />
    </RouterLink>
  </section>
</template>

<script setup>
import { ArrowRight, Smartphone } from "@lucide/vue";
import { computed, onMounted } from "vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import { LocalStorage } from "src/services/storage";
import { useAppSettingsStore } from "src/stores/appSettings";

const settings = useAppSettingsStore();

const appVersion = computed(() => LocalStorage.getItem("app_version") || "web");
const serverVersion = computed(() => settings.data?.appversion_data || {});
const title = computed(() => (serverVersion.value?.force_update ? "Доступно обновление" : "Приложение готово"));
const rows = computed(() =>
  [
    ["Текущая версия", appVersion.value],
    ["Android", serverVersion.value?.android_version || serverVersion.value?.android],
    ["iOS", serverVersion.value?.ios_version || serverVersion.value?.ios],
  ]
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value]) => ({ label, value }))
);

const load = () => settings.load().catch(() => {});

onMounted(load);
</script>

<style scoped>
.version-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-top: 1px solid var(--app-border);
  padding: 15px 16px;
}

.version-row:first-child {
  border-top: 0;
}

.version-row span {
  color: var(--app-muted);
  font-weight: 800;
}

.version-row strong {
  text-align: right;
}
</style>
