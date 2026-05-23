<template>
  <section class="page fade-up">
    <AppHeader :title="title" :icon="FileText" action-label="Legal" />

    <div class="tagam-card p-5">
      <p class="brand-kicker m-0">KMRS</p>
      <h1 class="m-0 mt-2 text-3xl font-black">{{ title }}</h1>
      <p class="muted m-0 mt-2 text-sm">
        Здесь показаны юридические документы и инструкции, которые нужны пользователю и магазинам приложений.
      </p>
    </div>

    <div v-if="settings.loading" class="grid gap-3">
      <div class="warm-skeleton h-16 rounded-[8px]" />
      <div class="warm-skeleton h-16 rounded-[8px]" />
    </div>

    <div v-else-if="settings.error" class="soft-card p-4">
      <h2 class="m-0 text-xl font-black">Не удалось загрузить настройки</h2>
      <p class="muted m-0 mt-2 text-sm">{{ settings.error }}</p>
      <button class="primary-button tap-motion mt-4 w-full" type="button" @click="settings.load()">
        Повторить
      </button>
    </div>

    <section v-else class="soft-card overflow-hidden">
      <button
        v-for="item in availableDocuments"
        :key="item.key"
        class="legal-row tap-motion"
        type="button"
        @click="activeKey = activeKey === item.key ? '' : item.key"
      >
        <span>{{ item.label }}</span>
        <ChevronRight :size="18" :class="activeKey === item.key ? 'rotate-90' : ''" />
      </button>
      <div v-if="activeDocument" class="border-t border-white/10 p-4">
        <div class="legal-content" v-html="activeDocument" />
      </div>
      <p v-if="!availableDocuments.length" class="muted m-0 p-4 text-sm">
        В текущем ответе KMRS нет текстов правовых страниц.
      </p>
    </section>
  </section>
</template>

<script setup>
import { ChevronRight, FileText } from "@lucide/vue";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "src/components/ui/AppHeader.vue";
import { useAppSettingsStore } from "src/stores/appSettings";

const route = useRoute();
const settings = useAppSettingsStore();
const activeKey = ref("");

const dataDeletionHtml = `
  <h2>Account and data deletion</h2>
  <p>Tagam Delivery users can request deletion of their account and related personal data directly from the app.</p>
  <ol>
    <li>Open Tagam Delivery.</li>
    <li>Go to Profile, then Account security.</li>
    <li>Open Account deletion and follow the confirmation flow.</li>
  </ol>
  <p>If you cannot access the app, send a deletion request to support@tagam.delivery and include the phone number or email used for your account.</p>
  <p>We delete account profile data, saved addresses, saved payment references and app account identifiers when deletion is completed. Some order, payment and tax records may be retained when required for fraud prevention, accounting, dispute resolution or legal compliance.</p>
`;

const routeTitles = {
  "/privacy-policy": "Privacy Policy",
  "/terms-of-service": "Terms of Service",
  "/data-deletion": "Data deletion",
};

const title = computed(() => routeTitles[route.path] || "Документы");
const documents = computed(() => {
  const data = settings.data || {};
  return [
    { key: "privacy_policy", label: "Privacy Policy", value: data.privacy_policy || data.privacy_policy_content },
    { key: "terms", label: "Terms of Service", value: data.terms || data.terms_content || data.terms_condition },
    { key: "data_deletion", label: "Data deletion", value: data.data_deletion || data.data_deletion_content || dataDeletionHtml },
  ];
});
const availableDocuments = computed(() => documents.value.filter((item) => item.value));
const activeDocument = computed(() => availableDocuments.value.find((item) => item.key === activeKey.value)?.value || "");

onMounted(async () => {
  await settings.load().catch(() => {});
  const preferred = documents.value.find((item) => title.value.toLowerCase().includes(item.label.toLowerCase()))?.key;
  activeKey.value = preferred || availableDocuments.value[0]?.key || "";
});
</script>

<style scoped>
.legal-row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--app-border);
  padding: 16px;
  color: var(--app-fg);
  text-align: left;
  font-weight: 850;
}

.legal-row:first-child {
  border-top: 0;
}

.legal-row svg {
  color: var(--app-accent);
  transition: transform 180ms ease;
}

.legal-content {
  color: var(--app-fg);
  font-size: 14px;
  line-height: 1.65;
}

.legal-content :deep(h2) {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 900;
}

.legal-content :deep(ol) {
  margin: 12px 0;
  padding-left: 20px;
}
</style>
