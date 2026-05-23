<template>
  <section class="page fade-up">
    <AppHeader title="Уведомления" :icon="Bell" action-label="Обновить" @action="load" />

    <AuthBridge v-if="!client.authenticated" @authenticated="load" />

    <template v-else>
      <div class="tagam-card p-5">
        <p class="brand-kicker m-0">TAGAM UPDATES</p>
        <h1 class="m-0 mt-1 text-2xl font-black">История уведомлений</h1>
        <p class="muted m-0 mt-1 text-sm">Статусы заказов, бронирования и важные сообщения будут собраны здесь.</p>
      </div>

      <section class="soft-card p-4">
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="brand-kicker m-0">NOTIFICATION SETTINGS</p>
            <h2 class="m-0 mt-1 text-xl font-black">Push-уведомления</h2>
            <p class="muted m-0 mt-1 text-sm">Заказы, курьер, бронирования и важные статусы будут приходить сразу на устройство.</p>
          </div>
          <button
            class="relative h-9 w-16 shrink-0 rounded-full border transition"
            :class="pushEnabled ? 'border-[var(--app-accent)] bg-[var(--app-accent)]' : 'border-[var(--app-border)] bg-[var(--app-control)]'"
            type="button"
            :aria-pressed="pushEnabled"
            :disabled="customer.notificationSettingsSaving"
            @click="togglePush"
          >
            <span
              class="absolute top-1 h-7 w-7 rounded-full bg-white shadow-lg transition"
              :class="pushEnabled ? 'left-8' : 'left-1'"
            />
          </button>
        </div>
      </section>

      <p v-if="customer.notificationsError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ customer.notificationsError }}
      </p>
      <p v-if="customer.notificationMessage" class="m-0 rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">
        {{ customer.notificationMessage }}
      </p>

      <div v-if="customer.notificationsLoading" class="grid gap-3">
        <div v-for="index in 4" :key="index" class="warm-skeleton h-20 rounded-[8px]" />
      </div>

      <article v-for="item in notifications" v-else :key="item.notification_uuid || item.uuid || item.id || item.message" class="soft-card flex gap-3 p-4">
        <div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--app-control)] text-[var(--app-accent)]">
          <component :is="iconFor(item)" :size="22" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="m-0 text-base font-black">{{ item.title || item.subject || typeLabel(item) }}</h2>
          <p class="m-0 mt-1 text-sm text-[var(--app-fg)]">{{ item.message || item.body || item.description || "Новое уведомление" }}</p>
          <p class="muted m-0 mt-2 text-xs">{{ item.date || item.created_at || item.date_created || "" }}</p>
        </div>
        <button v-if="item.notification_uuid || item.uuid" class="icon-button h-10 w-10 shrink-0" type="button" aria-label="Удалить" @click="remove(item)">
          <Trash2 :size="18" />
        </button>
      </article>

      <div v-if="!customer.notificationsLoading && !notifications.length" class="soft-card p-5 text-center">
        <h2 class="m-0 text-xl font-black">Уведомлений нет</h2>
        <p class="muted m-0 mt-2 text-sm">Здесь появятся обновления по заказам и аккаунту.</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { FCM } from "@capacitor-community/fcm";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { Bell, CalendarDays, ShoppingBag, Trash2 } from "@lucide/vue";
import { computed, onMounted, ref, watch } from "vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useClientAuthStore } from "src/stores/clientAuth";
import { useCustomerStore } from "src/stores/customer";
import { LocalStorage } from "src/services/storage";

const client = useClientAuthStore();
const customer = useCustomerStore();
const pushEnabled = ref(Boolean(LocalStorage.getItem("user_settings")?.app_push_notifications));

const notifications = computed(() => customer.notificationList);

const iconFor = (item) => {
  if (item.notification_type === "booking") return CalendarDays;
  if (item.notification_type === "order_update") return ShoppingBag;
  return Bell;
};
const typeLabel = (item) => {
  if (item.notification_type === "booking") return "Бронирование";
  if (item.notification_type === "order_update") return "Заказ";
  return "Уведомление";
};

const load = () => {
  if (client.authenticated) customer.loadNotifications().catch(() => {});
};

const remove = (item) => {
  customer.deleteNotification(item.notification_uuid || item.uuid).catch(() => {});
};

const clientTopic = computed(() => client.user?.client_uuid || client.user?.uuid || client.user?.client_id || "");

const enableNativePush = async () => {
  if (!Capacitor.isNativePlatform()) return true;

  const current = await PushNotifications.checkPermissions().catch(() => ({ receive: "prompt" }));
  const permission = current.receive === "granted" ? current : await PushNotifications.requestPermissions();
  if (permission.receive !== "granted") {
    throw new Error("Разрешите уведомления в настройках телефона, чтобы получать статусы заказов.");
  }

  if (clientTopic.value) {
    await FCM.subscribeTo({ topic: clientTopic.value }).catch(() => {});
  }
  return true;
};

const disableNativePush = async () => {
  if (Capacitor.isNativePlatform() && clientTopic.value) {
    await FCM.unsubscribeFrom({ topic: clientTopic.value }).catch(() => {});
  }
};

const togglePush = async () => {
  const next = !pushEnabled.value;
  try {
    if (next) await enableNativePush();
    else await disableNativePush();
    await customer.saveNotificationSettings({ push: next });
    pushEnabled.value = next;
  } catch (error) {
    customer.notificationsError = error?.message ?? String(error);
  }
};

onMounted(load);
watch(() => client.token, load);
</script>
