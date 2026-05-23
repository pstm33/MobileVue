<template>
  <section class="page fade-up">
    <AppHeader title="Избранное" :icon="Heart" action-label="Обновить" @action="load" />

    <AuthBridge v-if="!client.authenticated" @authenticated="load" />

    <template v-else>
      <div class="tagam-card p-5">
        <p class="brand-kicker m-0">TAGAM FAVOURITES</p>
        <h1 class="m-0 mt-1 text-2xl font-black">Любимые рестораны и блюда</h1>
        <p class="muted m-0 mt-1 text-sm">Сохраняйте места и блюда, к которым хочется возвращаться.</p>
      </div>

      <p v-if="customer.favouritesError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ customer.favouritesError }}
      </p>
      <p v-if="customer.favouriteMessage" class="m-0 rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">
        {{ customer.favouriteMessage }}
      </p>

      <div v-if="customer.favouritesLoading" class="grid gap-3">
        <div v-for="index in 3" :key="index" class="warm-skeleton h-28 rounded-[8px]" />
      </div>

      <article v-for="item in favourites" v-else :key="itemKey(item)" class="tagam-card tap-motion overflow-hidden">
        <RouterLink class="grid grid-cols-[104px_1fr] gap-3 p-3" :to="itemLink(item)">
          <img v-if="imageOf(item)" class="h-[92px] w-[104px] rounded-[8px] object-cover" :src="imageOf(item)" :alt="titleOf(item)" />
          <div v-else class="grid h-[92px] w-[104px] place-items-center rounded-[8px] bg-[var(--app-control)]">
            <Heart class="text-[var(--app-accent)]" :size="26" />
          </div>
          <div class="min-w-0">
            <p class="brand-kicker m-0">{{ item.item_uuid ? "БЛЮДО" : "РЕСТОРАН" }}</p>
            <h2 class="m-0 mt-1 line-clamp-2 text-lg font-black">{{ titleOf(item) }}</h2>
            <p class="muted m-0 mt-1 line-clamp-2 text-sm" v-html="subtitleOf(item)" />
          </div>
        </RouterLink>
        <button v-if="merchantIdOf(item)" class="mx-3 mb-3 tagam-pill tap-motion w-[calc(100%-24px)] px-4 py-2 text-rose-200" type="button" @click="remove(item)">
          Убрать из избранного
        </button>
      </article>

      <div v-if="!customer.favouritesLoading && !favourites.length" class="soft-card p-5 text-center">
        <h2 class="m-0 text-xl font-black">Избранного пока нет</h2>
        <p class="muted m-0 mt-2 text-sm">Нажмите сердце у ресторана или блюда, и оно появится здесь.</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { Heart } from "@lucide/vue";
import { computed, onMounted, watch } from "vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useClientAuthStore } from "src/stores/clientAuth";
import { useCustomerStore } from "src/stores/customer";

const client = useClientAuthStore();
const customer = useCustomerStore();

const favourites = computed(() => customer.favouriteList);

const itemKey = (item) => item.item_uuid || item.restaurant_slug || item.merchant_uuid || item.merchant_id || JSON.stringify(item);
const titleOf = (item) => item.item_name || item.restaurant_name || item.merchant_name || item.name || "Избранное";
const subtitleOf = (item) => item.item_description || item.cuisine_name || item.restaurant_cuisine || item.address || item.distance_local_new || "";
const imageOf = (item) => item.url_image || item.logo || item.restaurant_logo || item.merchant_logo || item.photo || "";
const merchantIdOf = (item) => item.merchant_id || item.restaurant_id || item.merchant_uuid || "";
const itemLink = (item) => (item.restaurant_slug ? `/restaurant/${item.restaurant_slug}` : "/search");

const load = () => {
  if (client.authenticated) customer.loadFavourites().catch(() => {});
};

const remove = (item) => {
  customer.toggleFavourite(merchantIdOf(item)).catch(() => {});
};

onMounted(load);
watch(() => client.token, load);
</script>
