<template>
  <q-dialog
    v-model="modal"
    maximized
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="beforeShow"
  >
    <q-card>
      <q-toolbar
        class="bg-white text-dark"
        style="position: sticky; top: 0; z-index: 10"
      >
        <q-btn
          flat
          round
          icon="close"
          class="q-mr-sm"
          :color="$q.dark.mode ? 'white' : 'dark'"
          v-close-popup
        />

        <q-toolbar-title>
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Notifications") }}
          </div>
        </q-toolbar-title>
      </q-toolbar>
      <q-card-section>
        <q-list separator>
          <q-item class="q-pl-none q-pr-none" tag="label">
            <q-item-section>
              <q-item-label> {{ $t("Push Notifications") }} </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="push"
                color="disabled"
                @update:model-value="setPushChanges"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <div
          class="fixed-bottom q-pa-sm border-grey-top1 shadow-1 row q-gutter-x-md items-center"
          :class="{
            'bg-dark': $q.dark.mode,
            'bg-white': !$q.dark.mode,
          }"
        >
          <q-btn
            class="col"
            unelevated
            rounded
            color="secondary"
            text-color="white"
            size="lg"
            no-caps
            type="submit"
            :loading="loading"
            @click="saveSettings"
          >
            <div class="text-subtitle2 text-weight-bold q-gutter-x-sm">
              {{ $t("Save") }}
            </div>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import auth from "src/api/auth";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useClientStore } from "stores/ClientStore";
import { useDataStore } from "stores/DataStore";
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";
import { FCM } from "@capacitor-community/fcm";

export default {
  name: "NotificationSettings",
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const ClientStore = useClientStore();
    const DataStore = useDataStore();
    return { DataStorePersisted, ClientStore, DataStore };
  },
  data() {
    return {
      modal: false,
      push: false,
      promotional: false,
      loading: false,
      user_data: null,
      has_changes: false,
    };
  },
  methods: {
    beforeShow() {
      this.has_changes = false;
      this.user_data = auth.getUser();
      console.log("user_settings", this.ClientStore.user_settings);
      this.push =
        this.ClientStore?.user_settings?.app_push_notifications || false;
    },
    async setPushChanges(value) {
      const is_messaging_supported = this.DataStore.is_messaging_supported;
      console.log("is_messaging_supported", is_messaging_supported);

      if (is_messaging_supported) {
        const NotificationPermission = Notification.permission;
        console.log("NotificationPermission", NotificationPermission);
      }

      if (is_messaging_supported && this.push) {
        if (NotificationPermission == "default") {
          const permission = await Notification.requestPermission();
          console.log("permission", permission);
          if (permission !== "granted") {
            this.push = false;
            APIinterface.ShowAlert(
              this.$t("Notification permission denied"),
              this.$q.capacitor,
              this.$q
            );
            return;
          }
        } else if (NotificationPermission == "denied") {
          this.push = false;
          APIinterface.ShowAlert(
            this.$t(
              "Push permission has been already denied please enabled in your browser settings"
            ),
            this.$q.capacitor,
            this.$q
          );
          return;
        }
      }

      const old_value =
        this.ClientStore?.user_settings?.app_push_notifications || false;

      this.has_changes = value == old_value ? false : true;
    },
    async saveSettings() {
      if (this.$q.capacitor) {
        try {
          const old_value =
            this.ClientStore?.user_settings?.app_push_notifications || false;

          //if (this.push != old_value) {
          if (this.push) {
            try {
              await FCM.subscribeTo({ topic: this.user_data?.client_uuid });
              console.log("ok subscribeTo");
            } catch (error) {
              console.log("error subscribeTo", error);
            } finally {
            }
          } else {
            try {
              await FCM.unsubscribeFrom({ topic: this.user_data?.client_uuid });
              this.DataStorePersisted.push_enabled = false;
              console.log("ok unsubscribeFrom");
            } catch (error) {
              console.log("error unsubscribeFrom", error);
            } finally {
            }
          }
          //}
          this.saveNotificationsettings();
        } catch (error) {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        }
      } else {
        this.saveNotificationsettings();
      }
    },
    async saveNotificationsettings() {
      try {
        this.loading = true;
        const params = new URLSearchParams({
          push: this.push ? 1 : 0,
        }).toString();
        const results = await APIinterface.fetchDataByTokenPost(
          "saveNotifications",
          params
        );
        console.log("results", results);
        this.ClientStore.user_settings = results.details.user_settings;
        this.ClientStore.push_enabled = this.push;
        APIinterface.ShowSuccessful(results.msg, this.$q);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
