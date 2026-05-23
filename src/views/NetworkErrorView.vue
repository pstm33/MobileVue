<template>
  <section class="page fade-up min-h-[calc(100vh-80px)] justify-center">
    <div class="tagam-card p-5">
      <div class="mb-5 grid h-14 w-14 place-items-center rounded-full bg-[var(--app-accent)] text-black shadow-[0_18px_48px_color-mix(in_srgb,var(--app-accent)_32%,transparent)]">
        <WifiOff :size="28" stroke-width="2.4" />
      </div>

      <p class="brand-kicker">Offline</p>
      <h1 class="headline mt-2">Нет подключения</h1>
      <p class="muted mt-3 text-sm leading-relaxed">
        Проверьте интернет и повторите попытку. Когда сеть вернется, KMRS снова загрузит реальные рестораны, заказы и адреса.
      </p>

      <div class="mt-6 grid grid-cols-2 gap-3">
        <button class="primary-button" type="button" @click="retry">
          <RefreshCcw :size="18" />
          Повторить
        </button>
        <RouterLink class="surface-button tap-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 font-black" to="/home">
          <Home :size="18" />
          Главная
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Home, RefreshCcw, WifiOff } from "@lucide/vue";
import { useRouter } from "vue-router";

const router = useRouter();

const retry = () => {
  if (navigator.onLine) {
    router.replace("/home");
    return;
  }
  window.location.reload();
};
</script>
