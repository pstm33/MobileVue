<template>
  <div class="app-shell">
    <main class="screen" :class="{ 'screen-no-tabbar': route.meta.hideTabbar }">
      <RouterView />
    </main>

    <nav v-if="!route.meta.hideTabbar" class="tabbar" :style="{ '--tab-count': tabs.length }" aria-label="Primary">
      <RouterLink v-for="item in tabs" :key="item.to" :to="item.to" class="tabbar-item" :class="{ 'router-link-active': isTabActive(item) }">
        <span class="tabbar-icon">
          <component :is="item.icon" :size="20" stroke-width="2.2" />
          <span v-if="item.to === '/cart' && cart.itemsCount" class="tabbar-badge">
            {{ cartBadge }}
          </span>
        </span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { Home, Search, ShoppingBag, UserRound } from "@lucide/vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "src/stores/app";
import { useCartStore } from "src/stores/cart";

const route = useRoute();
const app = useAppStore();
const cart = useCartStore();
const cartBadge = computed(() => (cart.itemsCount > 99 ? "99+" : String(cart.itemsCount)));

const tabs = computed(() => {
  return [
    { to: "/home", label: app.copy.tabs.home, icon: Home, match: ["/home", "/feed", "/offers", "/booking", "/categories", "/view/categories"] },
    { to: "/search", label: app.copy.tabs.search, icon: Search, match: ["/search", "/restaurant"] },
    { to: "/cart", label: app.copy.tabs.cart, icon: ShoppingBag, match: ["/cart", "/checkout"] },
    { to: "/account", label: app.copy.tabs.account, icon: UserRound, match: ["/account", "/orders", "/profile", "/addresses", "/payments", "/wallet", "/points", "/notifications", "/favourites"] },
  ];
});

const isTabActive = (item) => item.match.some((path) => route.path === path || route.path.startsWith(`${path}/`));
</script>
