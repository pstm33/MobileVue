<template>
  <section class="page fade-up">
    <AppHeader :title="copy.title" :icon="Star" :action-label="copy.order" @action="router.push({ path: '/order/details', query: { order_uuid: orderUuid } })" />

    <div class="tagam-card tagam-glow p-5">
      <p class="brand-kicker m-0">TAGAM REVIEW</p>
      <h1 class="m-0 mt-2 text-3xl font-black">{{ copy.hero }}</h1>
      <p class="muted m-0 mt-2 text-sm">{{ copy.subtitle }}</p>
    </div>

    <form class="grid gap-4" @submit.prevent="submitReview">
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

        <label class="grid gap-2">
          <span class="muted text-xs font-black uppercase tracking-[0.14em]">{{ copy.likes }}</span>
          <input v-model.trim="tagsLike" class="tagam-input" maxlength="50" :placeholder="copy.likesPlaceholder" />
        </label>

        <label class="grid gap-2">
          <span class="muted text-xs font-black uppercase tracking-[0.14em]">{{ copy.improve }}</span>
          <input v-model.trim="tagsNotLike" class="tagam-input" maxlength="50" :placeholder="copy.improvePlaceholder" />
        </label>

        <label class="grid gap-2">
          <span class="muted text-xs font-black uppercase tracking-[0.14em]">{{ copy.comment }}</span>
          <textarea v-model.trim="reviewContent" class="tagam-input min-h-32 resize-none py-3" required :placeholder="copy.commentPlaceholder" />
        </label>

        <label class="flex items-center gap-3 text-sm font-bold">
          <input v-model="anonymous" class="h-5 w-5 accent-[var(--app-accent)]" type="checkbox" />
          {{ copy.anonymous }}
        </label>
      </section>

      <p v-if="orders.reviewError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ orders.reviewError }}
      </p>
      <p v-if="orders.reviewSuccess" class="m-0 rounded-[8px] border border-[var(--app-accent)]/40 bg-[var(--app-accent-soft)] p-3 text-sm font-bold text-[var(--app-fg)]">
        {{ orders.reviewSuccess }}
      </p>

      <button class="primary-button tap-motion w-full" type="submit" :disabled="orders.reviewLoading || !canSubmit">
        {{ orders.reviewLoading ? copy.sending : copy.submit }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { Star } from "@lucide/vue";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppHeader from "src/components/ui/AppHeader.vue";
import { useAppStore } from "src/stores/app";
import { useOrdersStore } from "src/stores/orders";

const app = useAppStore();
const route = useRoute();
const router = useRouter();
const orders = useOrdersStore();

const reviewCopy = {
  ru: {
    title: "Отзыв",
    order: "Заказ",
    hero: "Оцените заказ",
    subtitle: "Ваш отзыв поможет ресторану стать лучше и подскажет другим гостям.",
    rating: "Оценка",
    likes: "Что понравилось",
    likesPlaceholder: "Например: быстро, вкусно, аккуратно",
    improve: "Что улучшить",
    improvePlaceholder: "Например: упаковка, время, соус",
    comment: "Комментарий",
    commentPlaceholder: "Ваш отзыв помогает ресторану и будущим клиентам.",
    anonymous: "Опубликовать анонимно",
    sending: "Отправляем...",
    submit: "Отправить отзыв",
  },
  tk: {
    title: "Syn",
    order: "Sargyt",
    hero: "Sargyda baha beriň",
    subtitle: "Siziň synyňyz restorana gowulaşmaga we beýleki myhmanlara saýlamaga kömek eder.",
    rating: "Baha",
    likes: "Näme gowy boldy",
    likesPlaceholder: "Meselem: çalt, tagamly, arassa",
    improve: "Näme gowulandyrmaly",
    improvePlaceholder: "Meselem: gaplama, wagt, sous",
    comment: "Teswir",
    commentPlaceholder: "Siziň synyňyz restorana we geljekki müşderilere kömek edýär.",
    anonymous: "Anonim çap et",
    sending: "Iberilýär...",
    submit: "Syn iber",
  },
  en: {
    title: "Review",
    order: "Order",
    hero: "Rate your order",
    subtitle: "Your review helps the restaurant improve and guides other guests.",
    rating: "Rating",
    likes: "What was good",
    likesPlaceholder: "For example: fast, tasty, careful",
    improve: "What to improve",
    improvePlaceholder: "For example: packaging, timing, sauce",
    comment: "Comment",
    commentPlaceholder: "Your review helps the restaurant and future customers.",
    anonymous: "Publish anonymously",
    sending: "Sending...",
    submit: "Send review",
  },
};

const copy = computed(() => reviewCopy[app.language] || reviewCopy.ru);
const orderUuid = computed(() => String(route.query.order_uuid || route.params.order_uuid || ""));
const rating = ref(5);
const tagsLike = ref("");
const tagsNotLike = ref("");
const reviewContent = ref("");
const anonymous = ref(false);

const canSubmit = computed(() => Boolean(orderUuid.value && rating.value > 0 && reviewContent.value));

const submitReview = async () => {
  if (!canSubmit.value) return;

  await orders.addReview({
    order_uuid: orderUuid.value,
    review_content: reviewContent.value,
    rating_value: rating.value,
    as_anonymous: anonymous.value,
    tags_like: tagsLike.value ? [tagsLike.value] : [],
    tags_not_like: tagsNotLike.value ? [tagsNotLike.value] : [],
    upload_images: "",
  });
};
</script>
