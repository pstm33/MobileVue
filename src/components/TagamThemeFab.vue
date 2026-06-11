<template>
  <q-btn
    round
    unelevated
    class="tagam-theme-fab"
    :class="{ 'tagam-theme-fab--dark': $q.dark.mode }"
    :icon="$q.dark.mode ? 'eva-sun-outline' : 'eva-moon-outline'"
    :aria-label="$q.dark.mode ? 'Включить тёмную тему' : 'Включить светлую тему'"
    @click="toggleTheme"
  />
</template>

<script>
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useHaptics } from "src/composables/useHaptics";

export default {
  name: "TagamThemeFab",
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const haptics = useHaptics();
    return { DataStorePersisted, haptics };
  },
  methods: {
    toggleTheme() {
      const nextMode = !this.$q.dark.mode;
      this.haptics.impact("light");
      this.$q.dark.set(nextMode);
      this.DataStorePersisted.dark_mode = nextMode;
    },
  },
};
</script>
