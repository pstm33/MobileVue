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
import { UserRound } from "@lucide/vue";
import { useRoute, useRouter } from "vue-router";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";

const route = useRoute();
const router = useRouter();

const afterAuthenticated = () => {
  router.replace(String(route.query.redirect || "/account"));
};
</script>
