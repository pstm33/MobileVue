<template>
  <section class="page fade-up">
    <AppHeader :title="title" :icon="FileText" action-label="Legal" />

    <div class="tagam-card p-5">
      <p class="brand-kicker m-0">TAGAM</p>
      <h1 class="m-0 mt-2 text-3xl font-black">{{ title }}</h1>
      <p class="muted m-0 mt-2 text-sm">
        Юридические документы загружаются напрямую с сервера Tagam Delivery.
      </p>
    </div>

    <div v-if="loading" class="grid gap-3">
      <div class="warm-skeleton h-16 rounded-[8px]" />
      <div class="warm-skeleton h-16 rounded-[8px]" />
    </div>

    <div v-else-if="error" class="soft-card p-4">
      <h2 class="m-0 text-xl font-black">Документ недоступен</h2>
      <p class="muted m-0 mt-2 text-sm">{{ error }}</p>
      <button class="primary-button tap-motion mt-4 w-full" type="button" @click="loadActivePage">
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
        Правовые документы для этой страницы пока не опубликованы.
      </p>
    </section>
  </section>
</template>

<script setup>
import { ChevronRight, FileText } from "@lucide/vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import APIinterface from "src/api/APIinterface";
import AppHeader from "src/components/ui/AppHeader.vue";

const route = useRoute();
const activeKey = ref("");
const loading = ref(false);
const error = ref("");
const loadedPages = ref({});

const routeTitles = {
  "/privacy-policy": "Privacy Policy",
  "/terms-of-service": "Terms of Service",
  "/data-deletion": "Data deletion",
};
const pageIds = {
  privacy_policy: "page_privacy_policy",
  terms: "page_terms",
  data_deletion: "page_data_deletion",
};
const routeKeys = {
  "/privacy-policy": "privacy_policy",
  "/terms-of-service": "terms",
  "/data-deletion": "data_deletion",
};
const keyFromRoute = () => {
  const pageId = String(route.params.page_id || "");
  const fromParam = Object.entries(pageIds).find(([, value]) => value === pageId)?.[0];
  return routeKeys[route.path] || fromParam || "privacy_policy";
};

const title = computed(() => routeTitles[route.path] || "Документы");
const documents = computed(() => [
  { key: "privacy_policy", label: "Privacy Policy", value: loadedPages.value.privacy_policy?.long_content },
  { key: "terms", label: "Terms of Service", value: loadedPages.value.terms?.long_content },
  { key: "data_deletion", label: "Data deletion", value: loadedPages.value.data_deletion?.long_content },
]);
const availableDocuments = computed(() => documents.value.filter((item) => item.value));
const activeDocument = computed(() => availableDocuments.value.find((item) => item.key === activeKey.value)?.value || "");

const fetchPage = async (key) => {
  if (!pageIds[key] || loadedPages.value[key]) return;
  const response = await APIinterface.fetchDataPost("getPage", `page_id=${pageIds[key]}`);
  loadedPages.value = {
    ...loadedPages.value,
    [key]: response.details,
  };
};

const loadActivePage = async () => {
  loading.value = true;
  error.value = "";
  try {
    await fetchPage(activeKey.value);
  } catch (err) {
    error.value = err?.message ?? String(err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  activeKey.value = keyFromRoute();
  await loadActivePage();
});

watch(activeKey, loadActivePage);
watch(
  () => route.path,
  async (path) => {
    activeKey.value = routeKeys[path] || keyFromRoute();
  }
);
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
