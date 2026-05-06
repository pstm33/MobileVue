<template>
  <q-dialog v-model="modal" persistent>
    <q-card style="width: 400px" class="q-pa-md">
      <q-card-section class="relative-position text-center">
        <q-icon name="eva-bell-outline" color="blue" size="4em"></q-icon>
        <div class="text-weight-bold text-h6">
          {{ $t("Enabled Push Notifications") }}
        </div>
        <div class="text-weight-regular text-subtitle2">
          {{ $t("Get updates for your orders and exclusive offers") }}.
        </div>
      </q-card-section>
      <q-card-actions vertical>
        <q-btn
          no-caps
          unelevated
          color="secondary"
          text-color="white"
          size="lg"
          type="submit"
          rounded
          @click="enableNotifications"
          :loading="loading"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Allow Notifications") }}
          </div>
        </q-btn>

        <q-space class="q-pa-xs"></q-space>

        <q-btn
          no-caps
          unelevated
          color="disabled"
          text-color="dark"
          size="lg"
          rounded
          @click="dontAllow"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Don't Allow") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";
import { firebaseMessaging, getToken, onMessage } from "src/boot/FirebaseChat";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useClientStore } from "stores/ClientStore";

export default {
  name: "PushSubsribe",
  data() {
    return {
      modal: false,
      loading: false,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const ClientStore = useClientStore();
    return { DataStorePersisted, ClientStore };
  },
  methods: {
    async dontAllow() {
      this.loading = true;
      try {
        await APIinterface.fetchDataByTokenPost(
          "savenotifications",
          new URLSearchParams({
            push: 0,
          }).toString()
        );
        this.modal = false;
        this.DataStorePersisted.push_enabled = false;
        this.ClientStore.user_settings.app_push_notifications = false;
      } catch (error) {
      } finally {
        this.loading = false;
      }
    },
    async enableNotifications() {
      try {
        this.loading = true;
        const permission = await Notification.requestPermission();
        console.log("permission", permission);
        this.loading = false;
        this.modal = false;
        if (permission === "granted") {
          const token = await getToken(firebaseMessaging, {
            vapidKey: config.webpush_certificates,
          });
          console.log("FCM Token:", token);
          try {
            const params = new URLSearchParams({
              platform: "pwa",
              token: token,
            }).toString();
            console.log("params", params);
            await APIinterface.fetchDataByTokenPost("PushSubscribe", params);

            await APIinterface.fetchDataByTokenPost(
              "savenotifications",
              new URLSearchParams({
                push: 1,
              }).toString()
            );

            this.DataStorePersisted.web_token = token;
            this.DataStorePersisted.push_enabled = true;
            this.ClientStore.user_settings.app_push_notifications = true;
          } catch (error) {
            console.log("error", error);
          }
        } else {
          this.ClientStore.user_settings.app_push_notifications = false;
          APIinterface.ShowAlert(
            this.$t("Notification permission denied"),
            this.$q.capacitor,
            this.$q
          );
        }
      } catch (err) {
        this.loading = false;
        APIinterface.ShowAlert(
          this.$t("Error getting notification permission:" + err),
          this.$q.capacitor,
          this.$q
        );
      }

      //
      onMessage(firebaseMessaging, (payload) => {
        console.log("Foreground message received:", payload);
        const title = payload?.notification?.title || "";
        const body = payload?.notification?.body || "";
        this.$q.notify({
          type: "info",
          color: "secondary",
          icon: "notifications",
          position: "top",
          timeout: 6000,
          message: `<strong>${title}</strong><br>${body}`,
          html: true,
          actions: [
            {
              icon: "close",
              color: "white",
              round: true,
              handler: () => {
                /* ... */
              },
            },
          ],
        });
      });
      //
    },
  },
};
</script>
