<template>
  <div class="app-shell">
    <main class="screen" :class="{ 'screen-no-tabbar': route.meta.hideTabbar }">
      <RouterView />
    </main>

    <nav v-if="!route.meta.hideTabbar" class="tabbar" aria-label="Primary">
      <RouterLink v-for="item in tabs" :key="item.to" :to="item.to" class="tabbar-item" :class="{ 'router-link-active': isTabActive(item) }">
        <component :is="item.icon" :size="20" stroke-width="2.2" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { Home, MapPinned, Search, ShoppingBag, UserRound } from "@lucide/vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "src/stores/app";

const route = useRoute();
const app = useAppStore();

const tabs = computed(() => [
  { to: "/home", label: app.copy.tabs.home, icon: Home, match: ["/home", "/feed"] },
  { to: "/search", label: app.copy.tabs.search, icon: Search, match: ["/search", "/restaurant"] },
  { to: "/cart", label: app.copy.tabs.cart, icon: ShoppingBag, match: ["/cart", "/checkout"] },
  { to: "/tracking", label: app.copy.tabs.track, icon: MapPinned, match: ["/tracking"] },
  { to: "/account", label: app.copy.tabs.account, icon: UserRound, match: ["/account", "/orders", "/profile", "/addresses", "/payments", "/wallet", "/notifications", "/favourites"] },
]);

const isTabActive = (item) => item.match.some((path) => route.path === path || route.path.startsWith(`${path}/`));
</script>
