<template>
  <section class="page fade-up">
    <AppHeader :title="copy.title" :icon="MessageCircle" :action-label="orderNumber || copy.action" />

    <div v-if="!canTrack" class="tagam-card tagam-glow p-5">
      <p class="brand-kicker m-0">{{ emptyCopy.kicker }}</p>
      <h1 class="m-0 mt-2 text-3xl font-black">{{ emptyCopy.title }}</h1>
      <p class="muted m-0 mt-3 text-sm">{{ emptyCopy.text }}</p>

      <div class="mt-5 grid grid-cols-2 gap-3">
        <RouterLink class="primary-button tap-motion w-full" to="/orders">
          <ReceiptText :size="18" />
          {{ emptyCopy.orders }}
        </RouterLink>
        <RouterLink class="tagam-pill tap-motion px-4 py-3" to="/account">
          <UserRound :size="18" />
          {{ emptyCopy.account }}
        </RouterLink>
      </div>
    </div>

    <div v-else class="tracking-map-shell glass relative overflow-hidden rounded-[8px]">
      <div ref="mapEl" class="h-[420px] min-h-[52vh] w-full bg-[#111820]" />

      <div class="pointer-events-none absolute inset-x-0 top-0 z-[410] p-4">
        <div class="rounded-[8px] border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur-xl">
          <p class="m-0 text-sm font-bold text-[var(--app-accent)]">{{ etaLabel }}</p>
          <h1 class="headline m-0 mt-2 max-w-[13ch]">{{ headline }}</h1>
          <p v-if="statusDetails" class="muted m-0 mt-2 text-sm">{{ statusDetails }}</p>
        </div>
      </div>

      <div class="pointer-events-none absolute inset-x-4 bottom-4 z-[410]">
        <div class="flex items-center justify-between gap-3 rounded-[8px] border border-white/10 bg-[#090b10]/85 p-3 shadow-2xl backdrop-blur-xl">
          <div class="min-w-0">
            <p class="m-0 text-xs font-black uppercase tracking-[0.14em] text-[var(--app-accent)]">{{ restaurantLabel }}</p>
            <p class="muted m-0 mt-1 truncate text-sm">{{ destinationLabel }}</p>
          </div>
          <div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--app-accent)] text-slate-950">
            <Bike :size="22" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="canTrack && orders.detailsLoading" class="soft-card p-4">
      <div class="warm-skeleton h-5 w-2/3 rounded" />
      <div class="warm-skeleton mt-3 h-12 rounded" />
    </div>

    <div v-if="canTrack && orders.detailsError" class="rounded-[8px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-50">
      {{ orders.detailsError }}
    </div>

    <section v-if="canTrack" class="soft-card p-4">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <p class="brand-kicker m-0">{{ trackingText.kicker }}</p>
          <h2 class="m-0 mt-1 text-xl font-black">{{ progressTitle }}</h2>
        </div>
        <span class="tagam-pill px-3 py-2 text-xs">{{ progressBadge }}</span>
      </div>

      <div class="mb-5 grid gap-2" :style="{ gridTemplateColumns: `repeat(${stageLabels.length}, minmax(0, 1fr))` }">
        <div v-for="(stage, index) in stageLabels" :key="stage[0]" class="grid gap-2">
          <div class="h-1.5 rounded-full" :class="orderProgress >= index + 1 ? 'bg-[var(--app-accent)]' : 'bg-white/15'" />
          <div
            class="grid h-10 w-10 place-items-center rounded-full border"
            :class="orderProgress >= index + 1 ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black' : 'border-white/15 bg-white/5 text-[var(--app-muted)]'"
          >
            <component :is="stage[2]" :size="18" />
          </div>
        </div>
      </div>

      <div class="grid gap-4">
        <div v-for="(step, index) in steps" :key="`${step.label}-${index}`" class="relative flex gap-3">
          <div class="grid gap-1">
            <div
              class="grid h-9 w-9 place-items-center rounded-full border"
              :class="step.done ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black' : 'border-white/15 bg-white/5 text-[var(--app-muted)]'"
            >
              <component :is="step.icon || Check" :size="17" />
            </div>
            <div v-if="index < steps.length - 1" class="mx-auto h-full min-h-5 w-px bg-white/10" />
          </div>
          <div class="min-w-0 pb-1">
            <h3 class="m-0 text-sm font-extrabold">{{ step.label }}</h3>
            <p v-if="step.meta" class="muted m-0 mt-1 text-sm">{{ step.meta }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="canTrack && driverInfo" class="soft-card p-4">
      <p class="brand-kicker m-0">{{ trackingText.courier }}</p>
      <div class="mt-3 flex items-center gap-3">
        <img v-if="driverInfo.photo" class="h-14 w-14 rounded-full object-cover" :src="driverInfo.photo" alt="" />
        <div v-else class="grid h-14 w-14 place-items-center rounded-full bg-[var(--app-accent)] text-lg font-black text-black">
          {{ driverInitials }}
        </div>
        <div class="min-w-0">
          <h3 class="m-0 truncate text-lg font-black">{{ driverInfo.full_name || driverName }}</h3>
          <p class="muted m-0 mt-1 text-sm">{{ [driverInfo.car_maker, driverInfo.plate_number].filter(Boolean).join(" · ") }}</p>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import L from "leaflet";
import { Bike, Check, ChefHat, Home, MessageCircle, PackageCheck, ReceiptText, Store, UserRound } from "@lucide/vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import { useAppStore } from "src/stores/app";
import { useSessionStore } from "src/stores/session";
import { useOrdersStore } from "src/stores/orders";
import { useClientAuthStore } from "src/stores/clientAuth";

const app = useAppStore();
const session = useSessionStore();
const orders = useOrdersStore();
const client = useClientAuthStore();
const route = useRoute();
const copy = computed(() => app.copy.tracking);

const mapEl = ref(null);
const map = ref(null);
const markers = [];
const routeLines = [];

const orderUuid = computed(() => String(route.query.order_uuid || route.params.order_uuid || ""));
const canTrack = computed(() => client.authenticated && Boolean(orderUuid.value));
const trackingText = computed(() => {
  if (app.language === "tk") {
    return {
      kicker: "GÖZEGÇILIK",
      courier: "KURÝER",
      emptyKicker: "SARGYT",
      noOrderTitle: "Işjeň sargyt saýlanmady",
      signInTitle: "Sargydy yzarlamak üçin giriň",
      noOrderText: "Kurýer kartasy diňe hakyky sargyt açylanda görkezilýär.",
      signInText: "Canly karta we ýagdaýlar diňe resmileşdirilen sargyt üçin açylýar.",
      orders: "Sargytlar",
      account: "Profil",
      restaurantUpdating: "Restoran sargydyň ýagdaýyny täzeleýär.",
      liveStatus: "Sargydyň canlı ýagdaýy",
      records: "ýazgy",
      stage: "tapgyr",
      stages: {
        accepted: "Restoran kabul etdi",
        cooking: "Aşhana taýýarlaýar",
        courier: "Kurýer ýolda",
        delivered: "Eltildi",
        ready: "Tabşyrmaga taýýar",
      },
      record: "Ýazgy",
      status: "Ýagdaý",
    };
  }
  if (app.language === "en") {
    return {
      kicker: "LIVE TRACKING",
      courier: "COURIER",
      emptyKicker: "ORDER",
      noOrderTitle: "No active order selected",
      signInTitle: "Sign in to track",
      noOrderText: "The courier map appears only after opening a real order.",
      signInText: "Live map and order status are available only for a placed order.",
      orders: "Orders",
      account: "Account",
      restaurantUpdating: "The restaurant is updating your order status.",
      liveStatus: "Live order status",
      records: "records",
      stage: "stage",
      stages: {
        accepted: "Restaurant accepted",
        cooking: "Kitchen is cooking",
        courier: "Courier on the way",
        delivered: "Delivered",
        ready: "Ready for handoff",
      },
      record: "Record",
      status: "Status",
    };
  }
  return {
    kicker: "ЖИВОЙ ТРЕКИНГ",
    courier: "КУРЬЕР",
    emptyKicker: "ЗАКАЗ",
    noOrderTitle: "Активный заказ не выбран",
    signInTitle: "Войдите для трекинга",
    noOrderText: "Карта курьера показывается только после открытия реального заказа.",
    signInText: "Живая карта и статус доступны только для оформленного заказа.",
    orders: "Заказы",
    account: "Профиль",
    restaurantUpdating: "Ресторан обновляет статус заказа.",
    liveStatus: "Живой статус заказа",
    records: "записей",
    stage: "этап",
    stages: {
      accepted: "Ресторан принял",
      cooking: "Кухня готовит",
      courier: "Курьер в пути",
      delivered: "Доставлено",
      ready: "Готов к передаче",
    },
    record: "Запись",
    status: "Статус",
  };
});
const emptyCopy = computed(() => {
  const text = trackingText.value;
  return {
    kicker: text.emptyKicker,
    title: client.authenticated ? text.noOrderTitle : text.signInTitle,
    text: client.authenticated ? text.noOrderText : text.signInText,
    orders: text.orders,
    account: text.account,
  };
});
const details = computed(() => (orderUuid.value ? orders.orderDetails(orderUuid.value) : null));
const liveTracking = computed(() => (orderUuid.value ? orders.trackingDetails(orderUuid.value) : null));
const progressData = computed(() => liveTracking.value || details.value?.progress || {});
const orderInfo = computed(() => details.value?.order?.order_info ?? details.value?.order_info ?? {});
const merchant = computed(() => details.value?.merchant ?? details.value?.merchant_info ?? {});
const orderStatus = computed(() => details.value?.order_status ?? details.value?.status ?? {});
const statusDictionary = computed(() => details.value?.order_delivery_status ?? details.value?.order_status ?? {});
const statusLabel = computed(() => progressData.value.order_status || orderStatus.value.status || orderInfo.value.status || orderInfo.value.status_raw || "");
const statusDetails = computed(() => progressData.value.order_status_details || orderInfo.value.status_details || "");
const orderProgress = computed(() => Number(progressData.value.order_progress ?? details.value?.progress?.order_progress ?? 0));
const orderType = computed(() => orderInfo.value.order_type || "delivery");
const driverInfo = computed(() => progressData.value.driver_info || details.value?.driver_info || null);
const driverName = computed(() => [driverInfo.value?.first_name, driverInfo.value?.last_name].filter(Boolean).join(" "));
const driverInitials = computed(() => (driverName.value || "D").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase());
const orderNumber = computed(() => {
  const label = orderInfo.value.order_id || orderInfo.value.order_uuid || orderUuid.value;
  return label ? `#${label}` : "";
});
const restaurantLabel = computed(() => merchant.value.restaurant_name || orderInfo.value.restaurant_name || copy.value.liveRoute);
const etaLabel = computed(() =>
  progressData.value.estimated_time ||
  orderInfo.value.estimated_time ||
  details.value?.estimation?.label ||
  details.value?.estimation?.value ||
  copy.value.eta
);
const headline = computed(() => {
  if (statusLabel.value) return statusLabel.value;
  if (details.value) return trackingText.value.restaurantUpdating;
  return copy.value.headline;
});
const progressTitle = computed(() => statusDetails.value || statusLabel.value || trackingText.value.liveStatus);
const progressBadge = computed(() =>
  timelineRecords.value.length
    ? `${timelineRecords.value.length} ${trackingText.value.records}`
    : `${trackingText.value.stage} ${orderProgress.value || 1}`
);

const numberFrom = (value) => {
  const number = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
};

const pointFrom = (source, latKeys, lngKeys) => {
  if (!source || typeof source !== "object") return null;
  const lat = latKeys.map((key) => numberFrom(source[key])).find((value) => value !== null);
  const lng = lngKeys.map((key) => numberFrom(source[key])).find((value) => value !== null);
  return lat !== null && lng !== null ? [lat, lng] : null;
};

const ashgabatCenter = [37.9601, 58.3261];
const isLocalPoint = (point) =>
  Array.isArray(point) &&
  point.length === 2 &&
  Number.isFinite(point[0]) &&
  Number.isFinite(point[1]) &&
  point[0] >= 34 &&
  point[0] <= 43 &&
  point[1] >= 50 &&
  point[1] <= 67;

const distanceKm = (a, b) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const pointNearDelivery = (point, fallback) =>
  isLocalPoint(point) && distanceKm(point, deliveryPoint.value) <= 50 ? point : fallback;

const normalizeTimeline = (value) => {
  if (Array.isArray(value)) return value;
  if (value?.data) return normalizeTimeline(value.data);
  if (value?.items) return normalizeTimeline(value.items);
  if (value && typeof value === "object") return Object.values(value).filter((item) => item && typeof item === "object");
  return [];
};

const timelineRecords = computed(() => {
  const candidates = [
    details.value?.delivery_timeline,
    details.value?.order_delivery_status,
    details.value?.order_delivery_history,
    details.value?.status_history,
    details.value?.history,
    details.value?.order?.delivery_timeline,
    details.value?.order?.order_delivery_status,
  ];
  return candidates.flatMap(normalizeTimeline).filter((item) => item.status || item.created_at || item.remarks || item.order_status);
});

const deliveryPoint = computed(() => {
  const orderPoint = pointFrom(
    orderInfo.value,
    ["delivery_latitude", "delivery_lat", "latitude", "lat"],
    ["delivery_longitude", "delivery_lng", "longitude", "lng", "lon"]
  );
  if (isLocalPoint(orderPoint)) return orderPoint;

  const coordinates = session.coordinates;
  const sessionPoint = coordinates?.lat && coordinates?.lng ? [Number(coordinates.lat), Number(coordinates.lng)] : null;
  if (isLocalPoint(sessionPoint)) return sessionPoint;

  return ashgabatCenter;
});

const restaurantPoint = computed(() => {
  const point =
    pointFrom(merchant.value, ["latitude", "lat", "lattitude"], ["longitude", "lng", "lon", "longtitude"]) ||
    pointFrom(
      orderInfo.value,
      ["merchant_latitude", "merchant_lat", "restaurant_latitude", "restaurant_lat"],
      ["merchant_longitude", "merchant_lng", "restaurant_longitude", "restaurant_lng"]
    );
  return pointNearDelivery(point, [deliveryPoint.value[0] + 0.0105, deliveryPoint.value[1] - 0.014]);
});

const courierPoint = computed(() => {
  const point =
    pointFrom(
      progressData.value,
      ["driver_latitude", "driver_lat", "courier_latitude", "courier_lat"],
      ["driver_longitude", "driver_lng", "courier_longitude", "courier_lng"]
    ) ||
    pointFrom(progressData.value?.driver_info, ["latitude", "lat"], ["longitude", "lng", "lon"]) ||
    pointFrom(
      orderInfo.value,
      ["driver_latitude", "driver_lat", "courier_latitude", "courier_lat"],
      ["driver_longitude", "driver_lng", "courier_longitude", "courier_lng"]
    ) ||
    pointFrom(details.value?.driver, ["latitude", "lat"], ["longitude", "lng", "lon"]) ||
    pointFrom(details.value?.courier, ["latitude", "lat"], ["longitude", "lng", "lon"]);
  return pointNearDelivery(point, [deliveryPoint.value[0] + 0.0037, deliveryPoint.value[1] - 0.0049]);
});

const destinationLabel = computed(() =>
  [
    orderInfo.value.address_label,
    orderInfo.value.complete_delivery_address,
    orderInfo.value.location_name,
  ].filter(Boolean).join(" · ") || session.locationLabel
);

const stageLabels = computed(() => {
  const stages = trackingText.value.stages;
  if (orderType.value === "delivery") {
    return [
      [stages.accepted, restaurantLabel.value, Store],
      [stages.cooking, statusDetails.value || statusLabel.value || etaLabel.value, ChefHat],
      [stages.courier, driverInfo.value?.full_name || destinationLabel.value, Bike],
      [stages.delivered, destinationLabel.value, Home],
    ];
  }
  return [
    [stages.accepted, restaurantLabel.value, Store],
    [stages.cooking, statusDetails.value || statusLabel.value || etaLabel.value, ChefHat],
    [stages.ready, destinationLabel.value, PackageCheck],
  ];
});

const progressItems = computed(() => {
  const progress = progressData.value?.order_progress_items ?? progressData.value?.progress ?? [];
  if (Array.isArray(progress)) return progress;
  if (progress && typeof progress === "object") return Object.values(progress);
  return [];
});

const steps = computed(() => {
  if (timelineRecords.value.length) {
    return timelineRecords.value.map((item, index) => {
      const statusKey = item.status || item.order_status || item.status_raw || "";
      const statusName = statusDictionary.value?.[statusKey] || item.order_status || item.label || item.title || statusKey || `${trackingText.value.record} ${index + 1}`;
      return {
        label: statusName,
        meta: [item.created_at, item.remarks || item.description || item.order_status_details].filter(Boolean).join(" · "),
        done: index === 0 || Boolean(item.active || item.done || item.completed || item.checked || item.is_done || item.passed),
        icon: Check,
      };
    });
  }

  if (progressItems.value.length) {
    return progressItems.value.map((item, index) => ({
      label: item.label || item.status || item.title || item.name || `${trackingText.value.status} ${index + 1}`,
      meta: item.description || item.subtitle || item.sub_title || item.date || item.date_created || item.meta || "",
      done: Boolean(item.active || item.done || item.completed || item.checked || item.is_done || item.passed),
      icon: stageLabels.value[index]?.[2] || Check,
    }));
  }

  if (details.value) {
    return stageLabels.value.map(([label, meta, icon], index) => ({
      label,
      meta,
      done: orderProgress.value === 0 ? false : orderProgress.value >= index + 1,
      icon,
    }));
  }

  return copy.value.steps.map(([label, meta, done]) => ({ label, meta, done, icon: Check }));
});

const makeIcon = (className, label) =>
  L.divIcon({
    className: "tracking-marker",
    html: `<span class="${className}">${label}</span>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

const addTrackingMap = async () => {
  await nextTick();
  if (!mapEl.value) return;

  const routePoints = [restaurantPoint.value, courierPoint.value, deliveryPoint.value];
  map.value = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    scrollWheelZoom: false,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map.value);

  routeLines.push(
    L.polyline(routePoints, {
      color: "#f59e0b",
      weight: 5,
      opacity: 0.88,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map.value),
    L.polyline([courierPoint.value, deliveryPoint.value], {
      color: "#ffffff",
      weight: 2,
      opacity: 0.65,
      dashArray: "8 9",
    }).addTo(map.value)
  );

  markers.push(
    L.marker(restaurantPoint.value, { icon: makeIcon("restaurant", "R") }).addTo(map.value),
    L.marker(courierPoint.value, { icon: makeIcon("courier", "→") }).addTo(map.value),
    L.marker(deliveryPoint.value, { icon: makeIcon("home", "H") }).addTo(map.value)
  );

  map.value.fitBounds(L.latLngBounds(routePoints), {
    paddingTopLeft: [28, 156],
    paddingBottomRight: [28, 92],
    maxZoom: 15,
  });
};

onMounted(async () => {
  if (canTrack.value) {
    await orders.loadDetails(orderUuid.value, true).catch(() => {});
    await orders.loadTracking(orderUuid.value).catch(() => {});
    await addTrackingMap();
  }
});

onBeforeUnmount(() => {
  markers.splice(0).forEach((marker) => marker.remove());
  routeLines.splice(0).forEach((line) => line.remove());
  map.value?.remove();
});
</script>

<style>
.tracking-map-shell .leaflet-container {
  background: #111820;
  font-family: inherit;
}

.tracking-map-shell .leaflet-tile {
  filter: saturate(0.82) brightness(0.72) contrast(1.08);
}

.tracking-marker {
  background: transparent;
  border: 0;
}

.tracking-marker span {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 3px solid rgba(255, 255, 255, 0.86);
  border-radius: 999px;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.34);
  font-size: 13px;
  font-weight: 950;
}

.tracking-marker .restaurant {
  background: #ff7043;
  color: #fff;
}

.tracking-marker .courier {
  width: 54px;
  height: 54px;
  background: var(--app-accent);
  color: #07110d;
  font-size: 22px;
  box-shadow: 0 0 0 10px rgba(245, 158, 11, 0.18), 0 18px 44px rgba(0, 0, 0, 0.34);
}

.tracking-marker .home {
  background: #38bdf8;
  color: #07111d;
}
</style>
