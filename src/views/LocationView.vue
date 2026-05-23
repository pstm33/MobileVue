<template>
  <section class="page fade-up">
    <AppHeader :title="app.copy.location.title" :icon="MapPin" :action-label="app.copy.location.action" />

    <MapPicker @confirm="confirmLocation" />

    <div class="glass grid gap-3 rounded-[8px] p-4">
      <div>
        <h2 class="m-0 text-lg font-black">{{ app.copy.location.guestTitle }}</h2>
        <p class="muted m-0 mt-1 text-sm">
          {{ app.copy.location.guestText }}
        </p>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <RouterLink class="surface-button tap-motion rounded-full px-4 py-3 text-center text-sm font-black" to="/account">
          {{ app.copy.location.login }}
        </RouterLink>
        <button class="primary-button tap-motion" type="button" :disabled="!session.hasCoordinates" @click="goNext">
          {{ app.copy.location.guest }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
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
const goNext = () => router.replace(target());

const confirmLocation = async ({ coordinates, placeData }) => {
  session.savePlaceSelection(coordinates, placeData);
  goNext();
};
</script>
