<template>
  <section class="page location-page fade-up">
    <AppHeader :title="app.copy.location.title" :icon="MapPin" :action-label="app.copy.location.action" />

    <MapPicker :auto-locate="isNewCheckoutAddress" @confirm="confirmLocation" />
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MapPin } from "@lucide/vue";
import AppHeader from "src/components/ui/AppHeader.vue";
import MapPicker from "src/components/location/MapPicker.vue";
import { useAppStore } from "src/stores/app";
import { useSessionStore } from "src/stores/session";

const route = useRoute();
const router = useRouter();
const app = useAppStore();
const session = useSessionStore();

const target = () => String(route.query.redirect || "/home");
const isNewCheckoutAddress = computed(() => route.query.new_address === "1" && target() === "/checkout");
const goNext = () => router.replace(target());

const confirmLocation = async ({ coordinates, placeData }) => {
  session.savePlaceSelection(coordinates, placeData);
  goNext();
};
</script>

<style scoped>
.location-page {
  gap: 0.8rem;
}

@media (max-height: 740px) {
  .location-page {
    gap: 0.3rem;
  }
}
</style>
