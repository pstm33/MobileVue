<template>
  <section class="overflow-hidden rounded-[8px] border border-white/10 bg-[#0d1218]">
    <div class="relative">
      <div ref="mapEl" class="h-[420px] min-h-[58vh] w-full bg-[#121820]" />

      <div class="center-pin pointer-events-none absolute left-1/2 top-1/2 z-[410] -translate-x-1/2 -translate-y-full" :class="{ 'is-moving': moving }">
        <div class="center-pin__marker">
          <MapPin :size="30" fill="currentColor" stroke-width="2.5" />
        </div>
        <div class="center-pin__shadow" />
      </div>

      <div class="pointer-events-none absolute inset-x-0 top-1/2 z-[409] -translate-y-1/2">
        <div class="mx-auto h-px w-16 bg-white/35" />
      </div>
      <div class="pointer-events-none absolute inset-y-0 left-1/2 z-[409] -translate-x-1/2">
        <div class="mx-auto h-full w-px bg-white/20" />
      </div>

      <div class="absolute inset-x-0 top-0 z-[411] bg-gradient-to-b from-black/62 to-transparent p-4">
        <div class="glass rounded-[8px] p-2">
          <label class="flex min-h-11 items-center gap-3 rounded-full bg-black/35 px-3">
            <Search :size="18" class="shrink-0 text-emerald-300" />
            <input
              v-model="searchQuery"
              class="min-w-0 flex-1 bg-transparent text-sm font-black text-white outline-none placeholder:text-white/55"
              placeholder="Введите адрес, район или ориентир"
              @input="queueSearch"
            />
          </label>

          <div v-if="searchLoading || suggestions.length" class="mt-2 grid max-h-56 gap-1 overflow-y-auto rounded-[8px] bg-black/68 p-1 backdrop-blur-xl">
            <div v-if="searchLoading" class="px-3 py-2 text-xs font-black text-white/70">Ищем адрес в KMRS...</div>
            <button
              v-for="suggestion in suggestions"
              :key="suggestion.id"
              class="flex items-start gap-3 rounded-[8px] px-3 py-2 text-left text-white hover:bg-white/10"
              type="button"
              @click="chooseSuggestion(suggestion)"
            >
              <MapPin :size="16" class="mt-0.5 shrink-0 text-[var(--app-accent)]" />
              <span class="min-w-0">
                <strong class="block truncate text-sm">{{ suggestion.addressLine1 || suggestion.description }}</strong>
                <span class="block truncate text-xs text-white/62">{{ suggestion.addressLine2 || suggestion.description }}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="pointer-events-none absolute inset-x-4 bottom-4 z-[410]">
        <div class="mx-auto w-fit rounded-full border border-white/10 bg-black/70 px-4 py-2 text-center text-xs font-black text-white shadow-2xl backdrop-blur-xl">
          {{ moving ? "Отпустите карту, чтобы выбрать точку" : "Двигайте карту, пин остается в центре" }}
        </div>
      </div>
    </div>

    <div class="grid gap-4 p-4">
      <div class="flex items-start gap-3">
        <div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-300/10 text-emerald-300">
          <MapPin :size="21" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="m-0 text-lg font-black">{{ addressTitle }}</h2>
          <p class="muted m-0 mt-1 text-sm">{{ addressSubtitle }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <label class="grid gap-2">
          <span class="text-xs font-black uppercase text-white/55">Lat</span>
          <input v-model="latInput" class="field" inputmode="decimal" @change="applyManualCoordinates" />
        </label>
        <label class="grid gap-2">
          <span class="text-xs font-black uppercase text-white/55">Lng</span>
          <input v-model="lngInput" class="field" inputmode="decimal" @change="applyManualCoordinates" />
        </label>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button class="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-black" type="button" :disabled="loading" @click="useBrowserLocation">
          <LocateFixed :size="17" class="inline align-[-3px]" />
          Моя геопозиция
        </button>
        <button class="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-black" type="button" :disabled="loading || !suggestions.length" @click="clearSearch">
          Очистить поиск
        </button>
      </div>

      <button class="primary-button w-full" type="button" :disabled="loading || !placeData" @click="confirm">
        {{ loading ? app.copy.location.checking : app.copy.location.confirm }}
      </button>

      <div v-if="error" class="rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ error }}
      </div>
    </div>
  </section>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import L from "leaflet";
import { LocateFixed, MapPin, Search } from "@lucide/vue";
import APIinterface from "src/api/APIinterface";
import { useAppStore } from "src/stores/app";
import { useSessionStore } from "src/stores/session";

const emit = defineEmits(["confirm"]);
const app = useAppStore();
const session = useSessionStore();

const mapEl = ref(null);
const map = ref(null);
const loading = ref(false);
const moving = ref(false);
const error = ref("");
const placeData = ref(null);
const coordinates = ref(session.coordinates || { lat: 37.9601, lng: 58.3261 });
const latInput = ref(String(Number(coordinates.value.lat).toFixed(6)));
const lngInput = ref(String(Number(coordinates.value.lng).toFixed(6)));
const searchQuery = ref("");
const suggestions = ref([]);
const searchLoading = ref(false);
let searchTimer;

const addressTitle = computed(
  () =>
    placeData.value?.address?.formatted_address ||
    placeData.value?.formatted_address ||
    placeData.value?.place_text ||
    app.copy.location.pinTitle
);
const addressSubtitle = computed(
  () => placeData.value?.place_text || `${coordinates.value.lat}, ${coordinates.value.lng}`
);

const syncInputs = () => {
  latInput.value = String(Number(coordinates.value.lat).toFixed(6));
  lngInput.value = String(Number(coordinates.value.lng).toFixed(6));
};

const reverseGeocode = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await APIinterface.reverseGeocoding(coordinates.value.lat, coordinates.value.lng);
    placeData.value = response.details?.data ?? null;
  } catch (caught) {
    placeData.value = null;
    error.value = caught?.message ?? String(caught);
  } finally {
    loading.value = false;
  }
};

const syncFromMapCenter = async () => {
  if (!map.value) return;
  const center = map.value.getCenter();
  coordinates.value = { lat: center.lat, lng: center.lng };
  syncInputs();
  await reverseGeocode();
};

const moveMapToCoordinates = () => {
  if (!map.value) return;
  map.value.setView([coordinates.value.lat, coordinates.value.lng], map.value.getZoom() || 15);
};

const setCoordinates = async (lat, lng) => {
  coordinates.value = { lat: Number(lat), lng: Number(lng) };
  syncInputs();
  moveMapToCoordinates();
  await reverseGeocode();
};

const applyManualCoordinates = () => {
  setCoordinates(latInput.value, lngInput.value);
};

const normalizeSuggestionResults = (response) => {
  const data = response?.details?.data ?? response?.details ?? [];
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return Object.values(data);
  return [];
};

const queueSearch = () => {
  window.clearTimeout(searchTimer);
  const query = searchQuery.value.trim();
  if (query.length < 2) {
    suggestions.value = [];
    searchLoading.value = false;
    return;
  }
  searchTimer = window.setTimeout(searchAddresses, 320);
};

const searchAddresses = async () => {
  const query = searchQuery.value.trim();
  if (query.length < 2) return;

  searchLoading.value = true;
  error.value = "";
  try {
    const response = await APIinterface.getlocationAutocomplete(query);
    suggestions.value = normalizeSuggestionResults(response);
  } catch (caught) {
    suggestions.value = [];
    error.value = caught?.message ?? String(caught);
  } finally {
    searchLoading.value = false;
  }
};

const chooseSuggestion = async (suggestion) => {
  if (!suggestion?.id) return;

  loading.value = true;
  error.value = "";
  try {
    const response = await APIinterface.getLocationDetails(suggestion.id, suggestion.description || "");
    const data = response.details?.data ?? null;
    if (!data?.latitude || !data?.longitude) {
      throw new Error("KMRS не вернул координаты для этого адреса.");
    }

    const parsedAddress = data.parsed_address || {};
    placeData.value = {
      ...parsedAddress,
      ...data,
      place_id: data.place_id || suggestion.id,
      place_text: parsedAddress.place_text || suggestion.description,
      formatted_address: parsedAddress.formatted_address || suggestion.description,
      latitude: data.latitude,
      longitude: data.longitude,
    };
    searchQuery.value = suggestion.description || "";
    suggestions.value = [];
    coordinates.value = { lat: Number(data.latitude), lng: Number(data.longitude) };
    syncInputs();
    moveMapToCoordinates();
  } catch (caught) {
    error.value = caught?.message ?? String(caught);
  } finally {
    loading.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  suggestions.value = [];
};

const useBrowserLocation = () => {
  if (!navigator.geolocation) {
    error.value = "Браузер не поддерживает геолокацию.";
    return;
  }

  loading.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setCoordinates(position.coords.latitude, position.coords.longitude);
    },
    (caught) => {
      loading.value = false;
      error.value = caught.message || "Не удалось получить GPS.";
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
  );
};

const confirm = () => {
  if (!placeData.value) return;
  emit("confirm", {
    coordinates: coordinates.value,
    placeData: placeData.value,
  });
};

onMounted(async () => {
  await nextTick();
  map.value = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: false,
    tap: true,
  }).setView([coordinates.value.lat, coordinates.value.lng], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map.value);

  L.control.zoom({ position: "bottomright" }).addTo(map.value);

  map.value.on("click", (event) => {
    map.value.panTo(event.latlng, { animate: true });
  });

  map.value.on("movestart", () => {
    moving.value = true;
  });

  map.value.on("moveend", async () => {
    moving.value = false;
    await syncFromMapCenter();
  });

  if (session.placeData) {
    placeData.value = session.placeData;
  } else {
    await reverseGeocode();
  }
});

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer);
  map.value?.remove();
});
</script>

<style>
.leaflet-container {
  background: #121820;
  font-family: inherit;
}

.leaflet-control-zoom a {
  border: 0 !important;
  background: rgba(10, 13, 18, 0.86) !important;
  color: #f8fafc !important;
}

.center-pin {
  color: var(--app-accent);
  filter: drop-shadow(0 14px 20px rgba(0, 0, 0, 0.38));
  transition:
    transform 180ms ease,
    filter 180ms ease;
}

.center-pin.is-moving {
  transform: translate(-50%, calc(-100% - 10px));
  filter: drop-shadow(0 22px 28px rgba(0, 0, 0, 0.48));
}

.center-pin__marker {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border-radius: 999px;
  border: 4px solid rgba(255, 255, 255, 0.95);
  background: color-mix(in srgb, var(--app-accent) 88%, #ffffff 12%);
  color: #11110d;
  box-shadow:
    0 18px 34px color-mix(in srgb, var(--app-accent) 26%, transparent),
    inset 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.center-pin__shadow {
  position: absolute;
  bottom: -11px;
  left: 50%;
  width: 34px;
  height: 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.36);
  filter: blur(3px);
  transform: translateX(-50%);
  transition:
    width 180ms ease,
    opacity 180ms ease;
}

.center-pin.is-moving .center-pin__shadow {
  width: 22px;
  opacity: 0.5;
}
</style>
