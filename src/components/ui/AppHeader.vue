<template>
  <header class="app-header flex items-center justify-between gap-4">
    <div class="min-w-0">
      <img class="brand-logo" src="/tagam-logo.svg" alt="TAGAM" />
      <h1 v-if="title" class="m-0 mt-1 truncate text-xl font-extrabold">{{ title }}</h1>
    </div>
    <button class="icon-button tap-motion" type="button" :aria-label="actionLabel" @click="$emit('action')">
      <component :is="icon" :size="20" />
    </button>
  </header>
</template>

<script setup>
import { Bell } from "@lucide/vue";

defineEmits(["action"]);

defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: [Object, Function],
    default: Bell,
  },
  actionLabel: {
    type: String,
    default: "Open notifications",
  },
});
</script>
