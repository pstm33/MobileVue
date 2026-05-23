<template>
  <section class="page fade-up">
    <AppHeader title="Отзыв" :icon="Star" action-label="Заказ" @action="router.push({ path: '/order/details', query: { order_uuid: orderUuid } })" />

    <div class="tagam-card tagam-glow p-5">
      <p class="brand-kicker m-0">KMRS REVIEW</p>
      <h1 class="m-0 mt-2 text-3xl font-black">Оцените заказ</h1>
      <p class="muted m-0 mt-2 text-sm">Отзыв отправляется в реальный endpoint KMRS `addReview` для текущего order UUID.</p>
    </div>

    <form class="grid gap-4" @submit.prevent="submitReview">
      <section class="soft-card grid gap-4 p-4">
        <div>
          <p class="muted m-0 mb-2 text-xs font-black uppercase tracking-[0.14em]">Оценка</p>
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
          <span class="muted text-xs font-black uppercase tracking-[0.14em]">Что понравилось</span>
          <input v-model.trim="tagsLike" class="tagam-input" maxlength="50" placeholder="Например: быстро, вкусно, аккуратно" />
        </label>

        <label class="grid gap-2">
          <span class="muted text-xs font-black uppercase tracking-[0.14em]">Что улучшить</span>
          <input v-model.trim="tagsNotLike" class="tagam-input" maxlength="50" placeholder="Например: упаковка, время, соус" />
        </label>

        <label class="grid gap-2">
          <span class="muted text-xs font-black uppercase tracking-[0.14em]">Комментарий</span>
          <textarea v-model.trim="reviewContent" class="tagam-input min-h-32 resize-none py-3" required placeholder="Ваш отзыв помогает ресторану и будущим клиентам." />
        </label>

        <label class="flex items-center gap-3 text-sm font-bold">
          <input v-model="anonymous" class="h-5 w-5 accent-[var(--app-accent)]" type="checkbox" />
          Опубликовать анонимно
        </label>
      </section>

      <p v-if="orders.reviewError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ orders.reviewError }}
      </p>
      <p v-if="orders.reviewSuccess" class="m-0 rounded-[8px] border border-[var(--app-accent)]/40 bg-[var(--app-accent-soft)] p-3 text-sm font-bold text-[var(--app-fg)]">
        {{ orders.reviewSuccess }}
      </p>

      <button class="primary-button tap-motion w-full" type="submit" :disabled="orders.reviewLoading || !canSubmit">
        {{ orders.reviewLoading ? "Отправляем..." : "Отправить отзыв" }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { Star } from "@lucide/vue";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppHeader from "src/components/ui/AppHeader.vue";
import { useOrdersStore } from "src/stores/orders";

const route = useRoute();
const router = useRouter();
const orders = useOrdersStore();

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
