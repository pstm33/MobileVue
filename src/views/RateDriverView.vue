<template>
  <section class="page fade-up">
    <AppHeader :title="copy.title" :icon="Bike" :action-label="copy.skip" @action="openOrderReview" />

    <div v-if="loading" class="grid gap-4">
      <div class="soft-card warm-skeleton h-36" />
      <div class="soft-card warm-skeleton h-44" />
    </div>

    <div v-else-if="error" class="soft-card grid gap-4 p-5 text-center">
      <h1 class="m-0 text-2xl font-black">{{ copy.unavailable }}</h1>
      <p class="muted m-0 text-sm">{{ errorText }}</p>
      <button class="primary-button tap-motion" type="button" @click="openOrderReview">{{ copy.reviewOrder }}</button>
    </div>

    <form v-else class="grid gap-4" @submit.prevent="submitReview">
      <section class="tagam-card tagam-glow grid gap-4 p-5 text-center">
        <div class="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-[var(--app-border)] bg-[var(--app-control)]">
          <img v-if="driverInfo?.photo" class="h-full w-full object-cover" :src="driverInfo.photo" alt="" />
          <Bike v-else class="text-[var(--app-accent)]" :size="34" />
        </div>

        <div>
          <p class="brand-kicker m-0">DELIVERY REVIEW</p>
          <h1 class="m-0 mt-2 text-3xl font-black">{{ copy.hero }}</h1>
          <p class="muted m-0 mt-2 text-sm">{{ driverName || copy.driver }}</p>
        </div>
      </section>

      <section class="soft-card grid gap-4 p-4">
        <div>
          <p class="muted m-0 mb-2 text-xs font-black uppercase tracking-[0.14em]">{{ copy.rating }}</p>
          <div class="flex gap-2">
            <button
              v-for="star in 5"
              :key="star"
              class="tap-motion grid h-12 w-12 place-items-center rounded-[8px] border border-[var(--app-border)]"
              :class="rating >= star ? 'bg-[var(--app-accent)] text-black' : 'bg-[var(--app-control)] text-[var(--app-muted)]'"
              type="button"
              @click="rating = star"
            >
              <Star :size="22" :fill="rating >= star ? 'currentColor' : 'none'" />
            </button>
          </div>
        </div>

        <div>
          <p class="muted m-0 mb-2 text-xs font-black uppercase tracking-[0.14em]">{{ copy.like }}</p>
          <div v-if="attributes.length" class="flex flex-wrap gap-2">
            <button
              v-for="attribute in attributes"
              :key="attribute"
              class="rounded-full border px-4 py-2 text-sm font-black"
              :class="reviewText === attribute ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black' : 'surface-button'"
              type="button"
              @click="reviewText = attribute"
            >
              {{ attribute }}
            </button>
          </div>
          <input v-else v-model.trim="reviewText" class="tagam-input" :placeholder="copy.likePlaceholder" />
        </div>
      </section>

      <p v-if="submitError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ submitError }}
      </p>

      <button class="primary-button tap-motion w-full" type="submit" :disabled="submitting || !rating">
        {{ submitting ? copy.sending : copy.submit }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { Bike, Star } from "@lucide/vue";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import APIinterface from "src/api/APIinterface";
import AppHeader from "src/components/ui/AppHeader.vue";
import { useAppStore } from "src/stores/app";

const app = useAppStore();
const route = useRoute();
const router = useRouter();

const copyMap = {
  ru: {
    title: "Курьер",
    skip: "Заказ",
    unavailable: "Оценка курьера недоступна",
    reviewOrder: "Оценить заказ",
    hero: "Оцените доставку",
    driver: "Курьер",
    rating: "Оценка",
    like: "Что понравилось в доставке",
    likePlaceholder: "Например: быстро, аккуратно, вежливо",
    sending: "Отправляем...",
    submit: "Отправить отзыв",
    missingOrder: "Мы не нашли этот заказ. Откройте отзыв к существующему заказу из истории.",
  },
  tk: {
    title: "Kurýer",
    skip: "Sargyt",
    unavailable: "Kurýere baha bermek elýeterli däl",
    reviewOrder: "Sargyda baha ber",
    hero: "Eltip bermegi bahalandyr",
    driver: "Kurýer",
    rating: "Baha",
    like: "Eltip bermekde näme gowy boldy",
    likePlaceholder: "Meselem: çalt, arassa, sypaýy",
    sending: "Iberilýär...",
    submit: "Syn iber",
    missingOrder: "Bu sargyt tapylmady. Bar bolan sargyt üçin syny taryhdan açyň.",
  },
  en: {
    title: "Courier",
    skip: "Order",
    unavailable: "Courier review is unavailable",
    reviewOrder: "Review order",
    hero: "Rate the delivery",
    driver: "Courier",
    rating: "Rating",
    like: "What did you like about the delivery",
    likePlaceholder: "For example: fast, careful, polite",
    sending: "Sending...",
    submit: "Send review",
    missingOrder: "We could not find this order. Open a review for an existing order from history.",
  },
};

const copy = computed(() => copyMap[app.language] || copyMap.ru);
const isMissingOrderError = (value) => /order not found|record not found|no results/i.test(String(value || ""));
const errorText = computed(() => (isMissingOrderError(error.value) ? copy.value.missingOrder : error.value));
const orderUuid = computed(() => String(route.query.order_uuid || route.params.order_uuid || ""));
const initialRating = computed(() => Number(route.query.rate || 0));
const loading = ref(false);
const submitting = ref(false);
const error = ref("");
const submitError = ref("");
const rating = ref(initialRating.value || 5);
const reviewText = ref("");
const orderInfo = ref(null);
const driverInfo = ref(null);
const attributes = ref([]);
const isOrderReviewed = ref(false);

const driverName = computed(() =>
  [
    driverInfo.value?.full_name,
    [driverInfo.value?.first_name, driverInfo.value?.last_name].filter(Boolean).join(" "),
  ].find(Boolean)
);

const openOrderReview = () => {
  router.replace({
    path: "/order/write-review",
    query: {
      order_uuid: orderUuid.value,
      ...(rating.value ? { rate: rating.value } : {}),
    },
  });
};

const normalizeAttributes = (value) => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (value && typeof value === "object") return Object.values(value).map(String).filter(Boolean);
  return [];
};

const loadAttributes = async () => {
  try {
    const response = await APIinterface.fetchDataByTokenGet("reviewAttributes");
    attributes.value = normalizeAttributes(response?.details);
  } catch {
    attributes.value = [];
  }
};

const loadReviewData = async () => {
  if (!orderUuid.value) {
    error.value = "Не найден номер заказа.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const response = await APIinterface.fetchDataByTokenGet("getOrdertoreview", {
      order_uuid: orderUuid.value,
    });
    const details = response?.details ?? {};
    isOrderReviewed.value = Boolean(details.is_review);

    if (details.is_driver_review || !details.driver_info) {
      openOrderReview();
      return;
    }

    orderInfo.value = details.order_info ?? null;
    driverInfo.value = details.driver_info ?? null;
    attributes.value = normalizeAttributes(details.data_like_options);
    if (!attributes.value.length) await loadAttributes();
  } catch (caught) {
    error.value = caught?.message ?? String(caught);
  } finally {
    loading.value = false;
  }
};

const submitReview = async () => {
  if (!rating.value || !orderInfo.value?.order_id || !orderInfo.value?.driver_id) return;

  submitting.value = true;
  submitError.value = "";

  try {
    const params = new URLSearchParams({
      rating: rating.value,
      review_text: reviewText.value || "",
      order_id: orderInfo.value.order_id,
      driver_id: orderInfo.value.driver_id,
    }).toString();
    await APIinterface.fetchDataByTokenPost("addRiderReview", params);

    if (!isOrderReviewed.value) {
      openOrderReview();
    } else {
      router.replace({ path: "/order/details", query: { order_uuid: orderUuid.value } });
    }
  } catch (caught) {
    submitError.value = caught?.message ?? String(caught);
  } finally {
    submitting.value = false;
  }
};

onMounted(loadReviewData);
</script>
