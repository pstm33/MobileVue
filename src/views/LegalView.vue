<template>
  <section class="page fade-up">
    <AppHeader :title="title" :icon="FileText" :action-label="copy.action" />

    <div class="tagam-card p-5">
      <p class="brand-kicker m-0">TAGAM</p>
      <h1 class="m-0 mt-2 text-3xl font-black">{{ title }}</h1>
      <p class="muted m-0 mt-2 text-sm">
        {{ copy.subtitle }}
      </p>
    </div>

    <div v-if="loading" class="grid gap-3">
      <div class="warm-skeleton h-16 rounded-[8px]" />
      <div class="warm-skeleton h-16 rounded-[8px]" />
    </div>

    <div v-else-if="error" class="soft-card p-4">
      <h2 class="m-0 text-xl font-black">{{ copy.unavailable }}</h2>
      <p class="muted m-0 mt-2 text-sm">{{ error }}</p>
      <button class="primary-button tap-motion mt-4 w-full" type="button" @click="loadActivePage">
        {{ copy.retry }}
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
        {{ copy.empty }}
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
import { useAppStore } from "src/stores/app";

const route = useRoute();
const app = useAppStore();
const activeKey = ref("");
const loading = ref(false);
const error = ref("");
const loadedPages = ref({});

const legalCopy = {
  ru: {
    action: "Документы",
    documents: "Документы",
    privacy: "Политика конфиденциальности",
    terms: "Условия использования",
    dataDeletion: "Удаление аккаунта и данных",
    subtitle: "Юридические документы загружаются напрямую с сервера Tagam Delivery.",
    unavailable: "Документ недоступен",
    retry: "Повторить",
    empty: "Правовые документы для этой страницы пока не опубликованы.",
    dataDeletionHtml: `
      <h2>Удаление аккаунта и данных</h2>
      <p>Пользователи Tagam Delivery могут запросить удаление аккаунта и связанных персональных данных прямо в приложении.</p>
      <h2>Как запросить удаление</h2>
      <ol>
        <li>Откройте Tagam Delivery.</li>
        <li>Перейдите в Профиль, затем в раздел Безопасность аккаунта.</li>
        <li>Откройте удаление аккаунта и пройдите подтверждение.</li>
      </ol>
      <p>Если доступ к приложению потерян, отправьте запрос на support@tagam.delivery и укажите телефон или email аккаунта.</p>
      <h2>Какие данные удаляются</h2>
      <p>Мы удаляем профиль аккаунта, сохраненные адреса, сохраненные платежные ссылки и идентификаторы аккаунта приложения. Часть данных о заказах, платежах и налоговой отчетности может сохраняться, если этого требует закон.</p>
    `,
  },
  tk: {
    action: "Resminamalar",
    documents: "Resminamalar",
    privacy: "Gizlinlik syýasaty",
    terms: "Ulanyş şertleri",
    dataDeletion: "Hasaby we maglumatlary pozmak",
    subtitle: "Hukuk resminamalary Tagam Delivery serwerinden ýüklenýär.",
    unavailable: "Resminama elýeterli däl",
    retry: "Gaýtadan synanyş",
    empty: "Bu sahypa üçin hukuk resminamalary entek çap edilmedi.",
    dataDeletionHtml: `
      <h2>Hasaby we maglumatlary pozmak</h2>
      <p>Tagam Delivery ulanyjylary hasabyny we degişli şahsy maglumatlaryny programmanyň içinde pozmak üçin ýüz tutup biler.</p>
      <h2>Nädip ýüz tutmaly</h2>
      <ol>
        <li>Tagam Delivery programmasyny açyň.</li>
        <li>Profil bölüminden Hasap howpsuzlygyna geçiň.</li>
        <li>Hasaby pozmak bölüminde tassyklama ädimlerini ýerine ýetiriň.</li>
      </ol>
      <p>Programma girip bilmeseňiz, support@tagam.delivery salgysyna hasabyň telefonyny ýa-da emailini görkezýän haýyş iberiň.</p>
      <h2>Näme pozulýar</h2>
      <p>Hasap profili, saklanan salgylar, saklanan töleg salgylanmalary we programma hasap ID-leri pozulýar. Käbir sargyt, töleg we salgyt ýazgylary kanun talap eden ýagdaýynda saklanyp bilner.</p>
    `,
  },
  en: {
    action: "Legal",
    documents: "Documents",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    dataDeletion: "Account and data deletion",
    subtitle: "Legal documents load directly from the Tagam Delivery server.",
    unavailable: "Document unavailable",
    retry: "Retry",
    empty: "Legal documents for this page have not been published yet.",
    dataDeletionHtml: `
      <h2>Account and data deletion</h2>
      <p>Tagam Delivery users can request deletion of their account and related personal data directly from the app.</p>
      <h2>How to request deletion</h2>
      <ol>
        <li>Open Tagam Delivery.</li>
        <li>Go to Profile, then Account security.</li>
        <li>Open Account deletion and follow the confirmation flow.</li>
      </ol>
      <p>If you cannot access the app, send a deletion request to support@tagam.delivery and include the phone number or email used for your account.</p>
      <h2>Data deleted or retained</h2>
      <p>We delete account profile data, saved addresses, saved payment references and app account identifiers. Some order, payment and tax records may be retained when required by law.</p>
    `,
  },
};
const copy = computed(() => legalCopy[app.language] || legalCopy.ru);
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
const routeTitles = computed(() => ({
  "/privacy-policy": copy.value.privacy,
  "/terms-of-service": copy.value.terms,
  "/data-deletion": copy.value.dataDeletion,
}));
const keyFromRoute = () => {
  const pageId = String(route.params.page_id || "");
  const fromParam = Object.entries(pageIds).find(([, value]) => value === pageId)?.[0];
  return routeKeys[route.path] || fromParam || "privacy_policy";
};

const documentValue = (key) => {
  if (key === "data_deletion") return copy.value.dataDeletionHtml;
  return loadedPages.value[key]?.long_content;
};
const title = computed(() => routeTitles.value[route.path] || copy.value.documents);
const documents = computed(() => [
  { key: "privacy_policy", label: copy.value.privacy, value: documentValue("privacy_policy") },
  { key: "terms", label: copy.value.terms, value: documentValue("terms") },
  { key: "data_deletion", label: copy.value.dataDeletion, value: documentValue("data_deletion") },
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
    if (route.path === "/legal") {
      await Promise.all([fetchPage("privacy_policy"), fetchPage("terms")]);
    } else {
      await fetchPage(activeKey.value);
    }
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
