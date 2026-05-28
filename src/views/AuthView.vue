<template>
  <section class="page fade-up">
    <AppHeader title="Вход" :icon="UserRound" action-label="Auth" />

    <div class="tagam-card p-5">
      <p class="brand-kicker m-0">TAGAM CLUB</p>
      <h1 class="m-0 mt-2 text-3xl font-black">Аккаунт для заказов</h1>
      <p class="muted m-0 mt-2 text-sm">Войдите, зарегистрируйтесь или продолжите как гость.</p>
    </div>

    <AuthBridge @authenticated="afterAuthenticated" />
  </section>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { UserRound } from "@lucide/vue";
import { useRoute, useRouter } from "vue-router";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useCartStore } from "src/stores/cart";
import { useClientAuthStore } from "src/stores/clientAuth";

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const client = useClientAuthStore();

const redirectTarget = computed(() => {
  const savedTarget = typeof window === "undefined" ? "" : window.sessionStorage.getItem("auth_redirect") || "";
  const target = String(route.query.redirect || savedTarget || (cart.cartUuid ? "/checkout" : "/account"));
  return target.startsWith("/") && !target.startsWith("//") ? target : "/account";
});

const afterAuthenticated = () => {
  const target = redirectTarget.value;
  if (typeof window !== "undefined") window.sessionStorage.removeItem("auth_redirect");
  router.replace(target);
};

onMounted(() => {
  if (client.authenticated) afterAuthenticated();
});

watch(
  () => client.authenticated,
  (authenticated) => {
    if (authenticated) afterAuthenticated();
  }
);
</script>
