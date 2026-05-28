<template>
  <section class="page account-page fade-up">
    <AppHeader :title="accountCopy.title" :icon="Settings" :action-label="accountCopy.action" @action="router.push('/account/language')" />

    <div class="tagam-card account-hero p-5">
      <div class="flex items-start gap-4">
        <div class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[var(--app-accent)] text-xl font-black text-black shadow-[0_14px_34px_rgba(242,138,0,0.24)]">
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="brand-kicker m-0">{{ client.authenticated ? "TAGAM CLUB" : "TAGAM DELIVERY" }}</p>
          <h1 class="m-0 mt-1 truncate text-2xl font-black">{{ profileName }}</h1>
          <p class="muted m-0 mt-1 text-sm">{{ profileSubtitle }}</p>
        </div>
      </div>

      <div v-if="client.authenticated" class="mt-4 flex flex-wrap gap-2">
        <span v-for="chip in identityChips" :key="chip" class="tagam-pill px-3 py-2 text-xs">
          {{ chip }}
        </span>
      </div>
    </div>

    <AuthBridge v-if="!client.authenticated" @authenticated="loadProfile" />

    <section v-if="!client.authenticated" class="soft-card account-menu overflow-hidden">
      <RouterLink class="account-row tap-motion" to="/cart">
        <span><ShoppingBag :size="20" /> {{ accountCopy.cartCheckout }}</span>
        <ChevronRight :size="18" />
      </RouterLink>
      <RouterLink class="account-row tap-motion border-t border-white/10" to="/location">
        <span><MapPin :size="20" /> {{ accountCopy.deliveryAddress }}</span>
        <ChevronRight :size="18" />
      </RouterLink>
      <RouterLink class="account-row tap-motion border-t border-white/10" to="/account/language">
        <span><Languages :size="20" /> {{ accountCopy.languageTheme }}</span>
        <ChevronRight :size="18" />
      </RouterLink>
      <RouterLink class="account-row tap-motion border-t border-white/10" to="/legal">
        <span><ReceiptText :size="20" /> {{ accountCopy.legal }}</span>
        <ChevronRight :size="18" />
      </RouterLink>
    </section>

    <template v-else>
      <div v-if="profile.loading" class="soft-card grid gap-3 p-4">
        <div class="warm-skeleton h-5 w-2/3 rounded" />
        <div class="warm-skeleton h-16 rounded" />
      </div>

      <div v-if="profile.error" class="rounded-[8px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-50">
        {{ profile.error }}
      </div>

      <section class="soft-card account-menu overflow-hidden">
        <RouterLink class="account-row tap-motion" to="/profile">
          <span><UserRound :size="20" /> {{ accountCopy.profile }}</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/orders">
          <span><ReceiptText :size="20" /> {{ accountCopy.orders }}</span>
          <span class="flex items-center gap-2">
            <span class="muted text-sm">{{ profile.orderList.length }}</span>
            <ChevronRight :size="18" />
          </span>
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/addresses">
          <span><MapPin :size="20" /> {{ accountCopy.addresses }}</span>
          <span class="flex items-center gap-2">
            <span class="muted text-sm">{{ profile.addressList.length }}</span>
            <ChevronRight :size="18" />
          </span>
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/payments">
          <span><CreditCard :size="20" /> {{ accountCopy.payments }}</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/favourites">
          <span><Heart :size="20" /> {{ accountCopy.favourites }}</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/wallet">
          <span><WalletCards :size="20" /> {{ accountCopy.wallet }}</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/points">
          <span><Gift :size="20" /> {{ accountCopy.points }}</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/booking">
          <span><CalendarDays :size="20" /> {{ accountCopy.bookings }}</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/account/chat">
          <span><MessageCircle :size="20" /> {{ accountCopy.chat }}</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/notifications">
          <span><Bell :size="20" /> {{ accountCopy.notifications }}</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/account/security">
          <span><ShieldCheck :size="20" /> {{ accountCopy.security }}</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/account/language">
          <span><Languages :size="20" /> {{ accountCopy.languageTheme }}</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/legal">
          <span><FileText :size="20" /> {{ accountCopy.legal }}</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <button class="account-row tap-motion border-t border-white/10" type="button" @click="logout">
          <span><LogOut :size="20" /> {{ accountCopy.logout }}</span>
          <ChevronRight :size="18" />
        </button>
      </section>
    </template>
  </section>

  <Teleport to="body">
    <div v-if="preferencesOpen" class="fixed inset-0 z-50 flex items-end bg-black/60 p-3 backdrop-blur-sm" @click.self="preferencesOpen = false">
      <section class="tagam-card mx-auto w-full max-w-[520px] rounded-t-[8px] p-4 pb-[calc(16px+var(--safe-bottom))] shadow-2xl">
        <div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--app-border)]" />

        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <p class="brand-kicker m-0">TAGAM DELIVERY</p>
            <h2 class="m-0 mt-1 text-2xl font-black">{{ accountCopy.languageTheme }}</h2>
            <p class="muted m-0 mt-1 text-sm">{{ accountCopy.appliesImmediately }}</p>
          </div>
          <button class="icon-button shrink-0" type="button" :aria-label="accountCopy.done" @click="preferencesOpen = false">
            <X :size="20" />
          </button>
        </div>

        <div class="grid gap-5">
          <div>
            <p class="muted m-0 mb-2 text-xs font-black uppercase tracking-[0.14em]">{{ accountCopy.language }}</p>
            <div class="grid grid-cols-3 gap-2 rounded-[8px] bg-[var(--app-control)] p-1">
              <button
                v-for="language in languages"
                :key="language.code"
                class="tap-motion min-h-11 rounded-[8px] px-3 text-sm font-black transition"
                :class="app.language === language.code ? 'bg-[var(--app-accent)] text-black shadow-lg' : 'text-[var(--app-muted)]'"
                type="button"
                @click="app.setLanguage(language.code)"
              >
                {{ language.label }}
              </button>
            </div>
          </div>

          <div>
            <p class="muted m-0 mb-2 text-xs font-black uppercase tracking-[0.14em]">{{ accountCopy.theme }}</p>
            <div class="grid grid-cols-2 gap-2 rounded-[8px] bg-[var(--app-control)] p-1">
              <button
                v-for="theme in themes"
                :key="theme.code"
                class="tap-motion min-h-11 rounded-[8px] px-3 text-sm font-black transition"
                :class="app.theme === theme.code ? 'bg-[var(--app-accent)] text-black shadow-lg' : 'text-[var(--app-muted)]'"
                type="button"
                @click="app.setTheme(theme.code)"
              >
                {{ theme.label }}
              </button>
            </div>
          </div>

          <button class="primary-button tap-motion w-full" type="button" @click="preferencesOpen = false">
            {{ accountCopy.done }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import {
  Bell,
  CalendarDays,
  ChevronRight,
  CreditCard,
  FileText,
  Gift,
  Heart,
  Languages,
  LogOut,
  MapPin,
  MessageCircle,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  WalletCards,
  X,
} from "@lucide/vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "src/stores/app";
import { useAccountProfileStore } from "src/stores/accountProfile";
import { useClientAuthStore } from "src/stores/clientAuth";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";

const app = useAppStore();
const router = useRouter();
const client = useClientAuthStore();
const profile = useAccountProfileStore();
const preferencesOpen = ref(false);
const accountCopy = computed(() => ({
  ...app.copy.account,
  cartCheckout:
    app.language === "tk" ? "Sebet we töleg" : app.language === "en" ? "Cart & checkout" : "Корзина и оформление",
  deliveryAddress:
    app.language === "tk" ? "Eltip beriş salgysy" : app.language === "en" ? "Delivery address" : "Адрес доставки",
  languageTheme: app.copy.account.menu?.[4] || app.copy.account.preferences,
  legal: app.language === "tk" ? "Hukuk maglumatlary" : app.language === "en" ? "Legal information" : "Правовая информация",
  profile: app.language === "tk" ? "Müşderi profili" : app.language === "en" ? "Customer profile" : "Профиль клиента",
  orders: app.copy.account.menu?.[0] || "Заказы",
  addresses: app.copy.account.menu?.[2] || "Адреса",
  payments: app.copy.account.menu?.[1] || "Платежи",
  favourites: app.language === "tk" ? "Halanlarym" : app.language === "en" ? "Favourites" : "Избранное",
  wallet: app.language === "tk" ? "Gapjyk" : app.language === "en" ? "Wallet" : "Кошелек",
  points: app.language === "tk" ? "Ballar" : app.language === "en" ? "Points" : "Баллы",
  bookings: app.language === "tk" ? "Bronlar" : app.language === "en" ? "Bookings" : "Бронирования",
  chat: app.language === "tk" ? "Çat" : app.language === "en" ? "Chat" : "Чат",
  notifications: app.copy.account.menu?.[3] || "Уведомления",
  security: app.language === "tk" ? "Howpsuzlyk" : app.language === "en" ? "Security" : "Безопасность",
  logout: app.language === "tk" ? "Çykmak" : app.language === "en" ? "Log out" : "Выйти",
}));

const languages = [
  { code: "ru", label: "Рус" },
  { code: "tk", label: "Tkm" },
  { code: "en", label: "Eng" },
];

const themes = computed(() => [
  { code: "dark", label: accountCopy.value.dark },
  { code: "light", label: accountCopy.value.light },
]);

const isGeneratedGuestEmail = (value = "") => /^guest\./i.test(String(value));
const cleanPhone = computed(() =>
  [client.user?.mobile_prefix, client.user?.mobile_number].filter(Boolean).join(" ").trim() || client.user?.contact_phone || ""
);
const profileName = computed(() => {
  const guest = app.language === "tk" ? "Myhman" : app.language === "en" ? "Guest" : "Гость";
  if (!client.authenticated) return guest;
  const name = [client.user?.first_name, client.user?.last_name].filter(Boolean).join(" ").trim();
  if (/^tagam\s+guest$/i.test(name)) return cleanPhone.value ? `${guest} ${cleanPhone.value}` : guest;
  return client.displayName;
});
const profileSubtitle = computed(() =>
  client.authenticated
    ? app.copy.account.subtitle
    : app.language === "tk"
      ? "Sargyt bermek we eltmegi saklamak üçin giriň ýa-da myhman hökmünde dowam ediň."
      : app.language === "en"
        ? "Sign in or continue as guest to place an order and save delivery."
        : "Войдите или продолжите как гость, чтобы оформить заказ и сохранить доставку."
);
const initials = computed(() =>
  profileName.value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
);
const identityChips = computed(() =>
  [
    isGeneratedGuestEmail(client.user?.email_address) ? "" : client.user?.email_address,
    client.user?.contact_phone,
    [client.user?.mobile_prefix, client.user?.mobile_number].filter(Boolean).join(" "),
  ].filter(Boolean)
);
const loadProfile = () => profile.load();
const logout = () => {
  client.logout();
  profile.reset();
};

onMounted(loadProfile);
watch(() => client.token, loadProfile);
</script>

<style scoped>
.account-row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  color: var(--app-fg);
  text-align: left;
  font-weight: 850;
}

.account-row > span {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.account-row svg {
  flex-shrink: 0;
  color: var(--app-accent);
  transition: transform 180ms ease;
}
</style>
