<template>
  <section class="page fade-up">
    <AppHeader :title="headerTitle" :icon="CalendarDays" action-label="Обновить" @action="load" />

    <AuthBridge v-if="!client.authenticated" @authenticated="load" />

    <template v-else>
      <div class="premium-card p-5">
        <p class="brand-kicker m-0">TAGAM BOOKING</p>
        <h1 class="m-0 mt-2 text-3xl font-black">{{ summaryTitle }}</h1>
        <p class="muted m-0 mt-2 text-sm">{{ introText }}</p>
      </div>

      <section v-if="isSearch" class="tagam-card p-4">
        <p class="brand-kicker m-0">BOOKING SEARCH</p>
        <h2 class="m-0 mt-1 text-xl font-black">Поиск брони</h2>
        <form class="mt-4 flex gap-2" @submit.prevent="runSearch">
          <input v-model.trim="searchQuery" class="field flex-1 py-3" placeholder="Номер брони, ресторан или телефон" />
          <button class="icon-button" type="submit" aria-label="Найти">
            <Search :size="20" />
          </button>
        </form>
      </section>

      <section v-if="bookingDetail && !isSearch" class="tagam-card p-4">
        <p class="brand-kicker m-0">RESERVATION DETAILS</p>
        <h2 class="m-0 mt-1 text-xl font-black">{{ detailData.restaurant_name || detailMerchant.restaurant_name || "Бронь ресторана" }}</h2>

        <div class="mt-4 grid grid-cols-3 gap-2">
          <div
            v-for="step in bookingSteps"
            :key="step.label"
            class="rounded-[8px] border p-3 text-center text-xs font-black"
            :class="step.active ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black' : 'border-[var(--app-border)] bg-[var(--app-control)] text-[var(--app-muted)]'"
          >
            <component :is="step.icon" class="mx-auto mb-1" :size="18" />
            {{ step.label }}
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div v-for="row in detailRows" :key="row.label" class="soft-card p-3">
            <span class="muted block">{{ row.label }}</span>
            <strong>{{ row.value }}</strong>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2">
          <button v-if="canModifyReservation" class="tagam-pill tap-motion px-4 py-3" type="button" @click="showUpdate = !showUpdate">
            {{ showUpdate ? "Скрыть изменение" : "Изменить бронь" }}
          </button>
          <button v-if="canModifyReservation" class="tagam-pill tap-motion px-4 py-3" type="button" @click="showCancel = !showCancel">
            {{ showCancel ? "Скрыть отмену" : "Отменить бронь" }}
          </button>
          <RouterLink class="tagam-pill tap-motion px-4 py-3" :to="{ path: '/booking', query: { status } }">
            Все брони
          </RouterLink>
          <RouterLink class="tagam-pill tap-motion px-4 py-3" :to="{ path: '/booking/search' }">
            Поиск
          </RouterLink>
        </div>
      </section>

      <section v-if="bookingDetail && showUpdate && !isSearch" class="soft-card p-4">
        <p class="brand-kicker m-0">UPDATE BOOKING</p>
        <h2 class="m-0 mt-1 text-xl font-black">Изменить бронирование</h2>
        <form class="mt-4 grid gap-3" @submit.prevent="updateReservation">
          <div class="grid grid-cols-2 gap-2">
            <input v-model.trim="updateForm.first_name" class="field py-3" placeholder="Имя" required />
            <input v-model.trim="updateForm.last_name" class="field py-3" placeholder="Фамилия" required />
          </div>
          <input v-model.trim="updateForm.email_address" class="field py-3" placeholder="Email" type="email" />
          <div class="grid grid-cols-[92px_1fr] gap-2">
            <input v-model.trim="updateForm.mobile_prefix" class="field py-3" placeholder="+993" required />
            <input v-model.trim="updateForm.mobile_number" class="field py-3" placeholder="Телефон" inputmode="tel" required />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <select v-model="updateForm.reservation_date" class="field py-3" required @change="fetchTimeslot">
              <option value="">Дата</option>
              <option v-for="option in dateOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <select v-model="updateForm.guest" class="field py-3" required @change="fetchTimeslot">
              <option value="">Гости</option>
              <option v-for="option in guestOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="slot in timeOptions"
              :key="slot.value"
              class="rounded-[8px] border px-3 py-3 text-sm font-black"
              :class="updateForm.reservation_time === slot.value ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black' : 'border-[var(--app-border)] bg-[var(--app-control)] text-[var(--app-fg)]'"
              type="button"
              :disabled="slot.disabled"
              @click="updateForm.reservation_time = slot.value"
            >
              {{ slot.label }}
            </button>
          </div>
          <div v-if="allowTableChoice" class="grid grid-cols-2 gap-2">
            <select v-model="updateForm.room_id" class="field py-3" @change="updateForm.table_id = ''">
              <option value="">Зал</option>
              <option v-for="option in roomOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <select v-model="updateForm.table_id" class="field py-3">
              <option value="">Стол</option>
              <option v-for="option in tableOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
          <textarea v-model.trim="updateForm.special_request" class="field min-h-24 resize-none py-3" placeholder="Комментарий" />
          <button class="primary-button w-full" type="submit" :disabled="updateLoading || !updateForm.reservation_time">
            {{ updateLoading ? "Сохраняем..." : "Сохранить изменения" }}
          </button>
        </form>
      </section>

      <section v-if="bookingDetail && showCancel && !isSearch" class="soft-card p-4">
        <p class="brand-kicker m-0">CANCEL BOOKING</p>
        <h2 class="m-0 mt-1 text-xl font-black">Причина отмены</h2>
        <p class="muted m-0 mt-1 text-sm">Сервис сохранит причину и обновит статус бронирования.</p>

        <div class="mt-4 grid gap-2">
          <button
            v-for="reason in cancelReasons"
            :key="reason"
            class="rounded-[8px] border px-4 py-3 text-left text-sm font-black"
            :class="cancelReason === reason ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black' : 'border-[var(--app-border)] bg-[var(--app-control)] text-[var(--app-fg)]'"
            type="button"
            @click="cancelReason = reason"
          >
            {{ reason }}
          </button>
          <textarea v-if="!cancelReasons.length" v-model.trim="cancelReason" class="field min-h-24 resize-none py-3" placeholder="Напишите причину отмены" />
        </div>

        <button class="primary-button mt-4 w-full" type="button" :disabled="cancelLoading || !cancelReason" @click="cancelReservation">
          {{ cancelLoading ? "Отменяем..." : "Подтвердить отмену" }}
        </button>
      </section>

      <div v-if="!isSearch" class="sticky-rail -mt-1">
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
      <p v-if="message" class="m-0 rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">
        {{ message }}
      </p>

      <article v-for="item in visibleBookings" :key="item.reservation_uuid || item.reservation_id || JSON.stringify(item)" class="tagam-card p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="brand-kicker m-0">{{ item.status || item.status_pretty || "Booking" }}</p>
            <h2 class="m-0 mt-1 truncate text-xl font-black">{{ item.restaurant_name || item.merchant_name || merchantName(item) || "Ресторан" }}</h2>
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

      <div v-if="!loading && !visibleBookings.length && !error" class="soft-card p-5 text-center">
        <h2 class="m-0 text-xl font-black">{{ isSearch ? "Ничего не найдено" : "Броней нет" }}</h2>
        <p class="muted m-0 mt-2 text-sm">{{ isSearch ? "Попробуйте другой номер брони, ресторан или телефон." : "Когда вы забронируете столик, запись появится здесь." }}</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { CalendarDays, CheckCircle2, ChevronRight, CircleDashed, Flag, Search } from "@lucide/vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
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
const message = ref("");
const summary = ref(null);
const bookings = ref([]);
const searchResults = ref([]);
const searchMeta = ref({});
const bookingDetail = ref(null);
const status = ref(String(route.query.status || "all"));
const showCancel = ref(route.query.action === "cancel");
const showUpdate = ref(route.query.action === "update");
const cancelReasons = ref([]);
const cancelReason = ref("");
const cancelLoading = ref(false);
const updateLoading = ref(false);
const searchQuery = ref(String(route.query.q || ""));

const updateForm = reactive({
  first_name: "",
  last_name: "",
  email_address: "",
  mobile_prefix: "",
  mobile_number: "",
  guest: "",
  reservation_date: "",
  reservation_time: "",
  room_id: "",
  table_id: "",
  special_request: "",
});

const headerTitle = computed(() => {
  if (isSearch.value) return "Поиск брони";
  return route.path.includes("/track") ? "Бронь" : "Бронирования";
});
const isTrack = computed(() => route.path.includes("/track"));
const isSearch = computed(() => route.path.includes("/search"));
const introText = computed(() => (isSearch.value ? "Поиск бронирований работает через коробочный endpoint BookingSearch." : "Ваши бронирования столиков и детали визитов."));
const visibleBookings = computed(() => (isSearch.value ? searchResults.value : bookings.value));
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
  if (isSearch.value) return `${searchResults.value.length || 0} найдено`;
  const count = summary.value?.total_reservation ?? summary.value?.total ?? bookings.value.length;
  return `${count || 0} броней`;
});
const detailData = computed(() => bookingDetail.value?.data_booking || bookingDetail.value?.data || bookingDetail.value || {});
const detailMerchant = computed(() => bookingDetail.value?.merchant || {});
const detailReservationUuid = computed(() => route.query.reservation_uuid || route.query.id || detailData.value.reservation_uuid || detailData.value.uuid);
const statusRaw = computed(() => detailData.value.status_raw || detailData.value.status || "");
const canModifyReservation = computed(() => {
  const blocked = bookingDetail.value?.cancel_reservation_stats || bookingDetail.value?.data?.cancel_reservation_stats || [];
  return !Array.isArray(blocked) || !blocked.includes(statusRaw.value);
});
const bookingProgress = computed(() => {
  const completed = bookingDetail.value?.completed_reservation_stats || [];
  const confirmed = bookingDetail.value?.confirm_reservation_stats || [];
  const cancelled = bookingDetail.value?.cancel_reservation_stats2 || bookingDetail.value?.cancel_reservation_stats || [];
  if (Array.isArray(cancelled) && cancelled.includes(statusRaw.value)) return 0;
  if (Array.isArray(completed) && completed.includes(statusRaw.value)) return 3;
  if (Array.isArray(confirmed) && confirmed.includes(statusRaw.value)) return 2;
  return 1;
});
const bookingSteps = computed(() => [
  { label: "Ожидает", icon: CircleDashed, active: bookingProgress.value >= 1 || bookingProgress.value === 0 },
  { label: "Подтверждено", icon: CheckCircle2, active: bookingProgress.value >= 2 || bookingProgress.value === 0 },
  { label: "Завершено", icon: Flag, active: bookingProgress.value >= 3 },
]);
const detailRows = computed(() =>
  [
    ["Номер брони", detailData.value.reservation_id || detailReservationUuid.value],
    ["Гости", detailData.value.guest_number || detailData.value.guest_number_raw],
    ["Дата", detailData.value.reservation_date || detailData.value.reservation_date_raw],
    ["Время", detailData.value.reservation_time || detailData.value.reservation_time_raw],
    ["Статус", detailData.value.status || detailData.value.status_pretty],
    ["Телефон", detailData.value.contact_phone],
    ["Имя", detailData.value.full_name || [detailData.value.first_name, detailData.value.last_name].filter(Boolean).join(" ")],
    ["Комментарий", detailData.value.special_request],
  ]
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value]) => ({ label, value }))
);
const dateOptions = computed(() => normalizeOptions(bookingDetail.value?.date_list));
const guestOptions = computed(() => normalizeOptions(bookingDetail.value?.guest_list));
const allowTableChoice = computed(() => Boolean(bookingDetail.value?.allowed_choose_table));
const roomOptions = computed(() => normalizeOptions(bookingDetail.value?.room_list));
const tableOptions = computed(() => {
  const tables = bookingDetail.value?.table_list || {};
  if (Array.isArray(tables)) return normalizeOptions(tables);
  return normalizeOptions(tables[updateForm.room_id] || []);
});
const timeOptions = computed(() => {
  const unavailable = bookingDetail.value?.not_available_time || [];
  const slots = bookingDetail.value?.time_slot || {};
  const flattened = [];
  Object.values(slots).forEach((group) => {
    if (group && typeof group === "object") {
      Object.entries(group).forEach(([value, label]) => flattened.push({ value, label, disabled: unavailable.includes(value) }));
    }
  });
  return flattened;
});

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.details?.data)) return value.details.data;
  if (Array.isArray(value?.details)) return value.details;
  return [];
};

const normalizeOptions = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => ({
      value: item.value ?? item.id ?? item.uuid ?? item,
      label: item.label ?? item.name ?? item.title ?? item.value ?? item.id ?? item,
    }));
  }
  if (typeof value === "object") {
    return Object.entries(value).map(([optionValue, label]) => ({
      value: optionValue,
      label: typeof label === "string" ? label : label?.label || label?.name || label?.title || optionValue,
    }));
  }
  return [];
};

const hydrateUpdateForm = () => {
  Object.assign(updateForm, {
    first_name: detailData.value.first_name || "",
    last_name: detailData.value.last_name || "",
    email_address: detailData.value.email_address || "",
    mobile_prefix: detailData.value.phone_prefix || "",
    mobile_number: detailData.value.contact_phone_without_prefix || detailData.value.mobile_number || "",
    guest: detailData.value.guest_number_raw || detailData.value.guest_number || "",
    reservation_date: detailData.value.reservation_date_raw || "",
    reservation_time: detailData.value.reservation_time_raw || "",
    room_id: detailData.value.room_id || "",
    table_id: detailData.value.table_id || "",
    special_request: detailData.value.special_request || "",
  });
};

const load = async () => {
  if (!client.authenticated) return;
  if (isSearch.value) {
    await runSearch();
    return;
  }

  loading.value = true;
  error.value = "";
  message.value = "";
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

    const reservationUuid = route.query.reservation_uuid || route.query.id;
    if (isTrack.value && reservationUuid) {
      jobs.push(
        APIinterface.fetchGet("apibookingv2/fetchBookingdetails", {
          reservation_uuid: reservationUuid,
        })
      );
      jobs.push(APIinterface.fetchDataPostTable("getCancelreason", `id=${encodeURIComponent(reservationUuid)}`).catch(() => null));
    }

    const [summaryResult, listResult, detailResult, cancelReasonResult] = await Promise.allSettled(jobs);

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
      hydrateUpdateForm();
    }
    if (cancelReasonResult?.status === "fulfilled") {
      const data = cancelReasonResult.value?.details?.data;
      cancelReasons.value = Array.isArray(data) ? data : [];
      cancelReason.value ||= cancelReasons.value[0] || "";
    }

    const failure = [summaryResult, listResult].find((item) => item.status === "rejected");
    const failureMessage = failure ? failure.reason?.message ?? String(failure.reason) : "";
    error.value = /no results|record not found|null|undefined/i.test(failureMessage) ? "" : failureMessage;
  } finally {
    loading.value = false;
  }
};

const runSearch = async () => {
  if (!client.authenticated) return;
  searchResults.value = [];
  searchMeta.value = {};
  if (!searchQuery.value) return;
  loading.value = true;
  error.value = "";
  message.value = "";
  try {
    const response = await APIinterface.fetchDataPostTable2("BookingSearch", `search=${encodeURIComponent(searchQuery.value)}`);
    searchResults.value = response?.details?.data || [];
    searchMeta.value = response?.details || {};
  } catch (caught) {
    const failureMessage = caught?.message ?? String(caught);
    error.value = /no results|record not found/i.test(failureMessage) ? "" : failureMessage;
  } finally {
    loading.value = false;
  }
};

const fetchTimeslot = async () => {
  if (!bookingDetail.value?.merchant_uuid || !updateForm.reservation_date || !updateForm.guest) return;
  updateForm.reservation_time = "";
  try {
    const response = await APIinterface.fetchGet("apibookingv2/fetchTimeslot", {
      merchant_uuid: bookingDetail.value.merchant_uuid,
      reservation_date: updateForm.reservation_date,
      guest: updateForm.guest,
    });
    bookingDetail.value.time_slot = response.details?.time_slot || {};
    bookingDetail.value.not_available_time = response.details?.not_available_time || [];
  } catch (caught) {
    error.value = caught?.message ?? String(caught);
  }
};

const updateReservation = async () => {
  const reservationUuid = detailReservationUuid.value;
  if (!reservationUuid) return;
  updateLoading.value = true;
  error.value = "";
  message.value = "";
  try {
    const response = await APIinterface.fetchPost("apibookingv2/UpdateBooking", {
      reservation_uuid: reservationUuid,
      ...updateForm,
    });
    message.value = response?.msg || "Бронирование обновлено.";
    showUpdate.value = false;
    await load();
  } catch (caught) {
    error.value = caught?.message ?? String(caught);
  } finally {
    updateLoading.value = false;
  }
};

const cancelReservation = async () => {
  const reservationUuid = detailReservationUuid.value;
  if (!reservationUuid || !cancelReason.value) return;
  cancelLoading.value = true;
  error.value = "";
  message.value = "";
  try {
    const response = await APIinterface.fetchDataPostTable2(
      "CancelReservation",
      `id=${encodeURIComponent(reservationUuid)}&reason=${encodeURIComponent(cancelReason.value)}`
    );
    message.value = response?.msg || "Бронь отменена.";
    showCancel.value = false;
    await load();
  } catch (caught) {
    error.value = caught?.message ?? String(caught);
  } finally {
    cancelLoading.value = false;
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

const merchantName = (item) => {
  const merchant = searchMeta.value?.merchant?.[item.merchant_id];
  return merchant?.restaurant_name;
};

onMounted(load);
watch(() => client.token, load);
watch(
  () => route.fullPath,
  () => {
    status.value = String(route.query.status || "all");
    showCancel.value = route.query.action === "cancel";
    showUpdate.value = route.query.action === "update";
    searchQuery.value = String(route.query.q || "");
    load();
  }
);
</script>
