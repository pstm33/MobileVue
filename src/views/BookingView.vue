<template>
  <section class="page fade-up">
    <AppHeader :title="headerTitle" :icon="CalendarDays" action-label="Обновить" @action="load" />

    <AuthBridge v-if="!client.authenticated" @authenticated="load" />

    <template v-else>
      <div class="premium-card p-5">
        <p class="brand-kicker m-0">TAGAM BOOKING</p>
        <h1 class="m-0 mt-2 text-3xl font-black">{{ summaryTitle }}</h1>
        <p class="muted m-0 mt-2 text-sm">Ваши бронирования столиков и детали визитов.</p>
      </div>

      <section v-if="bookingDetail" class="tagam-card p-4">
        <p class="brand-kicker m-0">Reservation details</p>
        <h2 class="m-0 mt-1 text-xl font-black">{{ detailData.restaurant_name || detailMerchant.restaurant_name || "Бронь ресторана" }}</h2>
        <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div v-for="row in detailRows" :key="row.label" class="soft-card p-3">
            <span class="muted block">{{ row.label }}</span>
            <strong>{{ row.value }}</strong>
          </div>
        </div>
      </section>

      <div class="sticky-rail -mt-1">
        <div class="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
          <button
            v-for="tab in statusTabs"
            :key="tab.code"
            class="tagam-pill shrink-0 px-4"
            :class="{ 'is-active': status === tab.code }"
            type="button"
            @click="setStatus(tab.code)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="grid gap-3">
        <div v-for="index in 3" :key="index" class="warm-skeleton h-28 rounded-[8px]" />
      </div>

      <p v-if="error" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ error }}
      </p>

      <article v-for="item in bookings" :key="item.reservation_uuid || item.reservation_id || JSON.stringify(item)" class="tagam-card p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="brand-kicker m-0">{{ item.status || item.status_pretty || "Booking" }}</p>
            <h2 class="m-0 mt-1 truncate text-xl font-black">{{ item.restaurant_name || item.merchant_name || "Ресторан" }}</h2>
            <p class="muted m-0 mt-1 text-sm">№ {{ item.reservation_id || item.reservation_uuid || "..." }}</p>
          </div>
          <span class="rounded-full bg-[var(--app-accent)] px-3 py-1 text-xs font-black text-black">
            {{ item.guest_number || item.guest || item.guest_number_raw || 0 }} гость
          </span>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div class="soft-card p-3">
            <span class="muted block">Дата</span>
            <strong>{{ item.reservation_date || item.reservation_date_raw || "..." }}</strong>
          </div>
          <div class="soft-card p-3">
            <span class="muted block">Время</span>
            <strong>{{ item.reservation_time || item.reservation_time_raw || "..." }}</strong>
          </div>
        </div>

        <button class="surface-button tap-motion mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full px-4 font-black" type="button" @click="openTrack(item)">
          Детали брони
          <ChevronRight :size="18" />
        </button>
      </article>

      <div v-if="!loading && !bookings.length && !error" class="soft-card p-5 text-center">
        <h2 class="m-0 text-xl font-black">Броней нет</h2>
        <p class="muted m-0 mt-2 text-sm">Когда вы забронируете столик, запись появится здесь.</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { CalendarDays, ChevronRight } from "@lucide/vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import APIinterface from "src/api/APIinterface";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { useAppSettingsStore } from "src/stores/appSettings";
import { useClientAuthStore } from "src/stores/clientAuth";

const route = useRoute();
const router = useRouter();
const client = useClientAuthStore();
const settings = useAppSettingsStore();
const loading = ref(false);
const error = ref("");
const summary = ref(null);
const bookings = ref([]);
const bookingDetail = ref(null);
const status = ref(String(route.query.status || "all"));

const headerTitle = computed(() => (route.path.includes("/track") ? "Бронь" : "Бронирования"));
const isTrack = computed(() => route.path.includes("/track"));
const statusTabs = computed(() => {
  const serverList = settings.data?.booking_status_list;
  const tabs = [{ code: "all", label: "Все" }];

  if (Array.isArray(serverList)) {
    serverList.forEach((item) => {
      const code = item.value || item.status || item.code || item.id;
      const label = item.label || item.title || item.name || item.status_pretty || code;
      if (code) tabs.push({ code, label });
    });
  } else if (serverList && typeof serverList === "object") {
    Object.entries(serverList).forEach(([code, label]) => {
      tabs.push({ code, label: typeof label === "string" ? label : label?.label || label?.name || code });
    });
  }

  return tabs;
});
const summaryTitle = computed(() => {
  const count = summary.value?.total_reservation ?? summary.value?.total ?? bookings.value.length;
  return `${count || 0} броней`;
});
const detailData = computed(() => bookingDetail.value?.data_booking || bookingDetail.value?.data || bookingDetail.value || {});
const detailMerchant = computed(() => bookingDetail.value?.merchant || {});
const detailRows = computed(() =>
  [
    ["Номер брони", detailData.value.reservation_id || detailData.value.reservation_uuid || route.query.reservation_uuid],
    ["Гости", detailData.value.guest_number || detailData.value.guest_number_raw],
    ["Дата", detailData.value.reservation_date || detailData.value.reservation_date_raw],
    ["Время", detailData.value.reservation_time || detailData.value.reservation_time_raw],
    ["Статус", detailData.value.status || detailData.value.status_pretty],
    ["Телефон", detailData.value.contact_phone],
  ]
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value]) => ({ label, value }))
);

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.details?.data)) return value.details.data;
  if (Array.isArray(value?.details)) return value.details;
  return [];
};

const load = async () => {
  if (!client.authenticated) return;
  loading.value = true;
  error.value = "";
  bookingDetail.value = null;
  try {
    await settings.load().catch(() => {});
    const jobs = [
      APIinterface.fetchGet("apibookingv2/BookingSummary"),
      APIinterface.fetchGet("apibookingv2/BookingList", {
        page: 1,
        status: status.value,
      }),
    ];

    if (isTrack.value && route.query.reservation_uuid) {
      jobs.push(
        APIinterface.fetchGet("apibookingv2/fetchBookingdetails", {
          reservation_uuid: route.query.reservation_uuid,
        })
      );
    }

    const [summaryResult, listResult, detailResult] = await Promise.allSettled(jobs);

    if (summaryResult.status === "fulfilled") {
      summary.value = summaryResult.value?.details?.summary || summaryResult.value?.details || null;
    }
    if (listResult.status === "fulfilled") {
      bookings.value = normalizeList(listResult.value?.details);
    } else {
      bookings.value = [];
    }
    if (detailResult?.status === "fulfilled") {
      bookingDetail.value = detailResult.value?.details || null;
    }

    const failure = [summaryResult, listResult].find((item) => item.status === "rejected");
    const message = failure ? failure.reason?.message ?? String(failure.reason) : "";
    error.value = /no results|record not found|null|undefined/i.test(message) ? "" : message;
  } finally {
    loading.value = false;
  }
};

const setStatus = (nextStatus) => {
  status.value = nextStatus;
  router.replace({ path: "/booking", query: { ...route.query, status: nextStatus } });
  load();
};

const openTrack = (item) => {
  router.push({
    path: "/booking/track",
    query: {
      reservation_uuid: item.reservation_uuid || item.uuid || item.reservation_id,
      status: status.value,
    },
  });
};

onMounted(load);
watch(() => client.token, load);
</script>
