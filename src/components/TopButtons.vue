<template>
  <template v-if="islogin">
    <q-btn
      flat
      round
      dense
      icon="eva-message-circle-outline"
      class="q-mr-smx"
      :color="$q.dark.mode ? 'white' : 'dark'"
      @click="setViewedChat()"
    >
      <q-badge color="red" floating v-if="chatcount > 0">
        {{ chatcount }}
      </q-badge>
    </q-btn>
  </template>

  <q-btn
    flat
    round
    dense
    icon="eva-bell-outline"
    class="q-mr-smx"
    :color="$q.dark.mode ? 'white' : 'dark'"
    @click="setViewednotification()"
  >
    <q-badge color="red" floating v-if="count > 0">
      {{ count }}
    </q-badge>
  </q-btn>

  <q-btn
    flat
    round
    dense
    icon="eva-heart-outline"
    class="q-mr-smx"
    :color="$q.dark.mode ? 'white' : 'dark'"
    to="/account/favourites"
  />
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useClientStore } from "stores/ClientStore";

export default {
  name: "TopButtons",
  props: ["islogin", "count", "chatcount"],
  setup() {
    const ClientStore = useClientStore();
    return { ClientStore };
  },
  async mounted() {
    if (this.ClientStore.notifications_data || !this.islogin) {
      return;
    }

    await this.ClientStore.fetchNotification();
  },
  methods: {
    async setViewedChat() {
      if (!this.ClientStore.notifications_data) {
        this.ClientStore.notifications_data = {
          chat_count: 0,
          alert_count: 0,
        };
      }

      if (this.ClientStore.notifications_data.chat_count <= 0) {
        this.$router.push("/account/chat");
        return;
      }
      try {
        await APIinterface.fetchDataByTokenGet("setViewednotification", {
          type: "chat",
        });
        this.ClientStore.notifications_data.chat_count = 0;
      } catch (error) {
        console.log("error", error);
      }
      this.$router.push("/account/chat");
    },
    async setViewednotification() {
      if (!this.ClientStore.notifications_data) {
        this.ClientStore.notifications_data = {
          chat_count: 0,
          alert_count: 0,
        };
      }

      if (
        this.ClientStore.notifications_data.alert_count <= 0 ||
        !this.islogin
      ) {
        this.$router.push("/account/notifications");
        return;
      }
      try {
        await APIinterface.fetchDataByTokenGet("setViewednotification", {
          type: "alert",
        });
        this.ClientStore.notifications_data.alert_count = 0;
      } catch (error) {
        console.log("error", error);
      }
      this.$router.push("/account/notifications");
    },
  },
};
</script>
