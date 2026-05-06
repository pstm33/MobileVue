<template>
  <q-btn
    to="/account/notifications"
    flat
    round
    dense
    icon="las la-bell"
    class="q-mr-smx"
    :color="$q.dark.mode ? 'white' : 'dark'"
  >
    <transition
      v-if="hasData"
      appear
      enter-active-class="animated zoomIn"
      leave-active-class="animated zoomOut"
    >
      <q-badge floating color="primary2" rounded style="top: 2px" />
    </transition>
  </q-btn>

  <ComponentsRealtime
    ref="realtime"
    getevent="notification_event"
    @after-receive="afterReceive"
  />
</template>

<script>
import { LocalNotifications } from "@capacitor/local-notifications";
import { defineAsyncComponent } from "vue";
import audioManager from "src/api/audioManager";
import config from "src/api/config";

export default {
  name: "NotiButton",
  props: ["sound_id"],
  components: {
    ComponentsRealtime: defineAsyncComponent(() =>
      import("components/ComponentsRealtime.vue")
    ),
  },
  data() {
    return {
      data: [],
    };
  },
  async mounted() {
    try {
      await audioManager.preload(this.sound_id, config.sound);
    } catch (error) {
      console.error("Error during audio preload:", error);
    }
  },
  beforeUnmount() {
    audioManager.unload(this.sound_id);
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    afterReceive(data) {
      console.log("afterReceive", data);
      this.data = data;
      this.playAudio();
      this.playLocalNotification(data);
    },
    async playAudio() {
      try {
        await audioManager.play(this.sound_id);
      } catch (error) {
        console.error("Error during audio playback:", error);
      }
    },
    playLocalNotification(data) {
      if (!this.$q.capacitor) {
        return;
      }
      const randomId = Math.floor(Math.random() * 10000) + 1;
      LocalNotifications.schedule({
        notifications: [
          {
            title: data.message,
            body: "",
            id: randomId,
          },
        ],
      });
    },
  },
};
</script>
