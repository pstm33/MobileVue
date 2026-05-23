<template>
  <section class="page fade-up">
    <AppHeader title="Профиль" :icon="Settings" action-label="Настройки" @action="router.push('/account/language')" />

    <div class="tagam-card p-5">
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

    <section v-if="!client.authenticated" class="soft-card overflow-hidden">
      <RouterLink class="account-row tap-motion" to="/cart">
        <span><ShoppingBag :size="20" /> Корзина и checkout</span>
        <ChevronRight :size="18" />
      </RouterLink>
      <RouterLink class="account-row tap-motion border-t border-white/10" to="/location">
        <span><MapPin :size="20" /> Адрес доставки</span>
        <ChevronRight :size="18" />
      </RouterLink>
      <RouterLink class="account-row tap-motion border-t border-white/10" to="/account/language">
        <span><Languages :size="20" /> Язык и тема</span>
        <ChevronRight :size="18" />
      </RouterLink>
      <RouterLink class="account-row tap-motion border-t border-white/10" to="/legal">
        <span><ReceiptText :size="20" /> Правовая информация</span>
        <ChevronRight :size="18" />
      </RouterLink>
    </section>

    <template v-else>
      <div class="grid grid-cols-2 gap-3">
        <div v-for="metric in metrics" :key="metric.label" class="tagam-card p-4">
          <component :is="metric.icon" class="text-[var(--app-accent)]" :size="22" />
          <strong class="mt-3 block text-xl">{{ metric.value }}</strong>
          <span class="muted text-sm">{{ metric.label }}</span>
        </div>
      </div>

      <div v-if="profile.loading" class="soft-card grid gap-3 p-4">
        <div class="warm-skeleton h-5 w-2/3 rounded" />
        <div class="warm-skeleton h-16 rounded" />
      </div>

      <div v-if="profile.error" class="rounded-[8px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-50">
        {{ profile.error }}
      </div>

      <section class="soft-card overflow-hidden">
        <RouterLink class="account-row tap-motion" to="/profile">
          <span><UserRound :size="20" /> Профиль клиента</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/orders">
          <span><ReceiptText :size="20" /> Заказы</span>
          <span class="flex items-center gap-2">
            <span class="muted text-sm">{{ profile.orderList.length }}</span>
            <ChevronRight :size="18" />
          </span>
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/addresses">
          <span><MapPin :size="20" /> Адреса</span>
          <span class="flex items-center gap-2">
            <span class="muted text-sm">{{ profile.addressList.length }}</span>
            <ChevronRight :size="18" />
          </span>
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/payments">
          <span><CreditCard :size="20" /> Платежи</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/favourites">
          <span><Heart :size="20" /> Избранное</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/wallet">
          <span><WalletCards :size="20" /> Кошелек и баллы</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/booking">
          <span><CalendarDays :size="20" /> Бронирования</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/account/chat">
          <span><MessageCircle :size="20" /> Чат</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/notifications">
          <span><Bell :size="20" /> Уведомления</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/account/security">
          <span><ShieldCheck :size="20" /> Безопасность</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <RouterLink class="account-row tap-motion border-t border-white/10" to="/account/language">
          <span><Languages :size="20" /> Язык и тема</span>
          <ChevronRight :size="18" />
        </RouterLink>
        <button class="account-row tap-motion border-t border-white/10" type="button" @click="logout">
          <span><LogOut :size="20" /> Выйти</span>
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
            <h2 class="m-0 mt-1 text-2xl font-black">Язык и тема</h2>
            <p class="muted m-0 mt-1 text-sm">Изменения сразу применяются ко всему приложению.</p>
          </div>
          <button class="icon-button shrink-0" type="button" aria-label="Готово" @click="preferencesOpen = false">
            <X :size="20" />
          </button>
        </div>

        <div class="grid gap-5">
          <div>
            <p class="muted m-0 mb-2 text-xs font-black uppercase tracking-[0.14em]">Язык</p>
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
            <p class="muted m-0 mb-2 text-xs font-black uppercase tracking-[0.14em]">Тема</p>
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
            Готово
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
import { useSessionStore } from "src/stores/session";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";

const app = useAppStore();
const router = useRouter();
const client = useClientAuthStore();
const profile = useAccountProfileStore();
const session = useSessionStore();
const preferencesOpen = ref(false);

const languages = [
  { code: "ru", label: "Рус" },
  { code: "tk", label: "Tkm" },
  { code: "en", label: "Eng" },
];

const themes = [
  { code: "dark", label: "Темная" },
  { code: "light", label: "Светлая" },
];

const profileName = computed(() => (client.authenticated ? client.displayName : "Гость Tagam"));
const profileSubtitle = computed(() =>
  client.authenticated
    ? "Заказы, адреса, бонусы и любимые места всегда под рукой."
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
    client.user?.email_address,
    client.user?.contact_phone,
    [client.user?.mobile_prefix, client.user?.mobile_number].filter(Boolean).join(" "),
  ].filter(Boolean)
);
const metrics = computed(() => [
  { label: "Заказы", value: profile.loading ? "..." : String(profile.orderList.length), icon: ShoppingBag },
  { label: "Адреса", value: profile.loading ? "..." : String(profile.addressList.length), icon: MapPin },
  { label: "Статус", value: client.authenticated ? "Активен" : "Гость", icon: UserRound },
  { label: "Локация", value: session.hasCoordinates ? "Выбрана" : "Выбрать", icon: MapPin },
]);

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
