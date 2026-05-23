<template>
  <section class="page fade-up">
    <AppHeader title="Адреса" :icon="MapPin" action-label="KMRS" />

    <AuthBridge v-if="!client.authenticated" @authenticated="load" />

    <template v-else>
      <div class="tagam-card p-5">
        <p class="brand-kicker m-0">Delivery places</p>
        <h1 class="m-0 mt-1 text-2xl font-black">Адресная книга</h1>
        <p class="muted m-0 mt-1 text-sm">Сохраняем и удаляем реальные адреса KMRS для текущего client token.</p>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <RouterLink class="tagam-pill tap-motion px-4 py-3" :to="{ path: '/location', query: { redirect: '/addresses?new=1' } }">
            <MapPinned :size="17" />
            На карте
          </RouterLink>
          <button class="primary-button tap-motion px-4 py-3" type="button" @click="startCreate">
            <Plus :size="17" />
            Новый адрес
          </button>
        </div>
      </div>

      <form v-if="editing" class="soft-card grid gap-4 p-4" @submit.prevent="save">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="brand-kicker m-0">{{ form.address_uuid ? "Edit address" : "New address" }}</p>
            <h2 class="m-0 mt-1 text-xl font-black">{{ form.address_label || "Адрес доставки" }}</h2>
          </div>
          <button class="icon-button !h-9 !w-9" type="button" aria-label="Закрыть" @click="editing = false">
            <X :size="18" />
          </button>
        </div>

        <label class="grid gap-2">
          <span class="field-label text-xs font-black uppercase">Метка</span>
          <input v-model="form.address_label" class="field" placeholder="Дом, офис..." />
        </label>
        <label class="grid gap-2">
          <span class="field-label text-xs font-black uppercase">Адрес</span>
          <input v-model="form.formatted_address" class="field" />
        </label>
        <label class="grid gap-2">
          <span class="field-label text-xs font-black uppercase">Инструкции</span>
          <textarea v-model="form.delivery_instructions" class="field min-h-24 resize-none" />
        </label>

        <p v-if="!canSaveAddress" class="m-0 rounded-[8px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-50">
          Для нового адреса сначала выберите точку на карте, чтобы KMRS получил реальные координаты и place_id.
        </p>

        <button class="primary-button tap-motion w-full" type="submit" :disabled="customer.addressSaving || !canSaveAddress">
          {{ customer.addressSaving ? "Сохраняем..." : "Сохранить адрес" }}
        </button>
      </form>

      <p v-if="customer.addressesError" class="m-0 rounded-[8px] border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
        {{ customer.addressesError }}
      </p>
      <p v-if="customer.addressMessage" class="m-0 rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">
        {{ customer.addressMessage }}
      </p>

      <div v-if="customer.addressesLoading" class="grid gap-3">
        <div v-for="index in 3" :key="index" class="warm-skeleton h-28 rounded-[8px]" />
      </div>

      <article v-for="address in customer.addressList" v-else :key="address.address_uuid || address.id" class="tagam-card p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="brand-kicker m-0">{{ address.address_label || address.location_name || "Address" }}</p>
            <h2 class="m-0 mt-1 text-lg font-black">{{ address.formatted_address || address.address || address.complete_address || address.location_name }}</h2>
            <p v-if="address.delivery_instructions" class="muted m-0 mt-2 text-sm">{{ address.delivery_instructions }}</p>
          </div>
          <MapPin class="shrink-0 text-[var(--app-accent)]" :size="22" />
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <button class="tagam-pill tap-motion px-4 py-2" type="button" @click="edit(address)">Изменить</button>
          <button class="tagam-pill tap-motion px-4 py-2" type="button" @click="remove(address)">Удалить</button>
        </div>
      </article>

      <div v-if="!customer.addressesLoading && !customer.addressList.length" class="soft-card p-5 text-center">
        <h2 class="m-0 text-xl font-black">Адресов пока нет</h2>
        <p class="muted m-0 mt-2 text-sm">KMRS не вернул сохраненные адреса для текущего клиента.</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { MapPin, MapPinned, Plus, X } from "@lucide/vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "src/components/ui/AppHeader.vue";
import AuthBridge from "src/components/checkout/AuthBridge.vue";
import { LocalStorage } from "src/services/storage";
import { useClientAuthStore } from "src/stores/clientAuth";
import { useCustomerStore } from "src/stores/customer";
import { useSessionStore } from "src/stores/session";

const client = useClientAuthStore();
const customer = useCustomerStore();
const session = useSessionStore();
const route = useRoute();
const editing = ref(false);

const blank = () => ({
  address_uuid: "",
  street_number: "",
  street_name: "",
  location_name: "",
  address_label: "Дом",
  delivery_options: "leave_it_at_my_door",
  delivery_instructions: "",
  place_id: "",
  formatted_address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  latitude: "",
  longitude: "",
});

const form = reactive(blank());
const assignForm = (data) => Object.assign(form, blank(), data);

const selectedPlacePayload = () => {
  const placeData = LocalStorage.getItem("place_data") || {};
  const parsed = placeData.parsed_address || {};
  const address = placeData.address || {};
  const coordinates = session.coordinates || {};
  return {
    place_id: LocalStorage.getItem("place_id") || placeData.place_id || "",
    formatted_address: parsed.formatted_address || placeData.formatted_address || address.formatted_address || session.locationLabel || "",
    street_number: parsed.street_number || address.street_number || "",
    street_name: parsed.street_name || address.street_name || address.address1 || "",
    location_name: parsed.place_text || placeData.place_text || session.locationLabel || "",
    city: parsed.city || address.city || "",
    state: parsed.state || address.state || "",
    postal_code: parsed.postal_code || address.postal_code || "",
    country: parsed.country || address.country || "",
    latitude: placeData.latitude || coordinates.lat || "",
    longitude: placeData.longitude || coordinates.lng || "",
  };
};

const canSaveAddress = computed(() => Boolean(form.address_uuid || (form.place_id && form.latitude && form.longitude)));

const load = () => {
  if (client.authenticated) customer.loadAddresses().catch(() => {});
};

const startCreate = () => {
  assignForm({
    ...selectedPlacePayload(),
    address_label: "Дом",
    delivery_options: "leave_it_at_my_door",
  });
  editing.value = true;
};

const edit = (address) => {
  assignForm({
    address_uuid: address.address_uuid || "",
    street_number: address.street_number || "",
    street_name: address.street_name || "",
    location_name: address.location_name || "",
    address_label: address.address_label || "Дом",
    delivery_options: address.delivery_options || "leave_it_at_my_door",
    delivery_instructions: address.delivery_instructions || "",
    place_id: address.place_id || "",
    formatted_address: address.formatted_address || address.address || address.complete_address || "",
    city: address.city || "",
    state: address.state || "",
    postal_code: address.postal_code || "",
    country: address.country || "",
    latitude: address.latitude || "",
    longitude: address.longitude || "",
  });
  editing.value = true;
};

const save = async () => {
  if (!canSaveAddress.value) return;
  await customer.saveAddress({ ...form }).then(() => {
    editing.value = false;
  }).catch(() => {});
};

const remove = (address) => {
  customer.deleteAddress(address.address_uuid || address.id).catch(() => {});
};

onMounted(() => {
  load();
  if (route.query.new === "1" && client.authenticated) {
    startCreate();
  }
});
watch(() => client.token, () => {
  load();
  if (route.query.new === "1" && client.authenticated) startCreate();
});
watch(() => route.query.new, (value) => {
  if (value === "1" && client.authenticated) startCreate();
});
</script>
