<template>
  <section class="page fade-up">
    <AppHeader title="Язык и тема" :icon="Languages" action-label="Назад" @action="router.back()" />

    <div class="premium-card p-5">
      <p class="brand-kicker m-0">TAGAM DELIVERY</p>
      <h1 class="m-0 mt-2 text-3xl font-black">Настройки приложения</h1>
      <p class="muted m-0 mt-2 text-sm">
        Выбор применяется сразу ко всему приложению и сохраняется на этом устройстве.
      </p>
    </div>

    <section class="soft-card overflow-hidden">
      <div class="border-b border-white/10 p-4">
        <p class="muted m-0 mb-3 text-xs font-black uppercase tracking-[0.14em]">Язык</p>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="item in languages"
            :key="item.code"
            class="preference-tile tap-motion"
            :class="{ active: app.language === item.code }"
            type="button"
            @click="app.setLanguage(item.code)"
          >
            <span class="text-lg font-black">{{ item.short }}</span>
            <small>{{ item.label }}</small>
          </button>
        </div>
      </div>

      <div class="p-4">
        <p class="muted m-0 mb-3 text-xs font-black uppercase tracking-[0.14em]">Тема</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="item in themes"
            :key="item.code"
            class="preference-tile tap-motion"
            :class="{ active: app.theme === item.code }"
            type="button"
            @click="app.setTheme(item.code)"
          >
            <component :is="item.icon" :size="22" />
            <small>{{ item.label }}</small>
          </button>
        </div>
      </div>

      <div class="border-t border-white/10 p-4">
        <p class="muted m-0 mb-3 text-xs font-black uppercase tracking-[0.14em]">Валюта</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="item in currencies"
            :key="item.code"
            class="preference-tile tap-motion"
            :class="{ active: app.currency === item.code }"
            type="button"
            @click="app.setCurrency(item.code)"
          >
            <span class="text-lg font-black">{{ item.code }}</span>
            <small>{{ item.label }}</small>
          </button>
        </div>
        <p v-if="settings.loading" class="muted m-0 mt-3 text-xs">Загружаем доступные валюты...</p>
      </div>
    </section>

    <section class="tagam-card p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="brand-kicker m-0">TAGAM DELIVERY</p>
          <h2 class="m-0 mt-1 text-xl font-black">Готово к заказу</h2>
          <p class="muted m-0 mt-1 text-sm">Откройте рестораны рядом с выбранной локацией.</p>
        </div>
        <div class="grid h-14 w-14 place-items-center rounded-full bg-[var(--app-accent)] text-black">
          <Sparkles :size="28" />
        </div>
      </div>
      <button class="primary-button mt-5 w-full" type="button" @click="router.push('/home')">
        Смотреть главную
        <ArrowRight :size="18" />
      </button>
    </section>

  </section>
</template>

<script setup>
import { ArrowRight, Languages, Moon, Sparkles, Sun } from "@lucide/vue";
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "src/components/ui/AppHeader.vue";
import { useAppSettingsStore } from "src/stores/appSettings";
import { useAppStore } from "src/stores/app";

const router = useRouter();
const app = useAppStore();
const settings = useAppSettingsStore();

const languages = [
  { code: "ru", short: "RU", label: "Русский" },
  { code: "tk", short: "TK", label: "Türkmen" },
  { code: "en", short: "EN", label: "English" },
];

const themes = [
  { code: "dark", label: "Темная", icon: Moon },
  { code: "light", label: "Светлая", icon: Sun },
];

const currencies = computed(() => {
  const value = settings.data?.currency_list;
  const result = [];

  if (Array.isArray(value)) {
    value.forEach((item) => {
      const code = item.currency_code || item.code || item.value;
      const label = item.currency_symbol || item.currency_name || item.label || code;
      if (code) result.push({ code, label });
    });
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([code, item]) => {
      result.push({
        code: item?.currency_code || item?.code || code,
        label: item?.currency_symbol || item?.currency_name || item?.label || code,
      });
    });
  }

  return result.length ? result : [{ code: "TMT", label: "Manat" }];
});

onMounted(() => {
  settings.load().catch(() => {});
});
</script>

<style scoped>
.preference-tile {
  display: grid;
  min-height: 72px;
  place-items: center;
  gap: 4px;
  border-radius: 8px;
  border: 1px solid var(--app-border);
  background: var(--app-control);
  color: var(--app-fg);
  font-weight: 900;
}

.preference-tile small {
  color: var(--app-muted);
  font-size: 11px;
  font-weight: 850;
}

.preference-tile.active {
  border-color: var(--app-accent);
  background: var(--app-accent);
  color: #11110d;
  box-shadow: 0 16px 44px color-mix(in srgb, var(--app-accent) 28%, transparent);
}

.preference-tile.active small {
  color: rgba(17, 17, 13, 0.72);
}

</style>
