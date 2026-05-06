<template>
  <q-header reveal reveal-offset="50" class="bg-transparent q-pa-sm">
    <div class="tagam-account-header-shell">
      <q-toolbar class="q-px-xs">
        <q-btn
          @click="$router.back()"
          flat
          round
          dense
          icon="las la-angle-left"
          class="q-mr-sm"
          color="dark"
        />
        <q-toolbar-title class="text-weight-bold">
          {{ $t("Settings") }}
        </q-toolbar-title>
      </q-toolbar>
    </div>
  </q-header>

  <q-page class="tagam-page-shell q-px-md q-pb-xl row items-stretch">
    <q-inner-loading
      v-if="loading"
      :showing="true"
      color="primary"
      size="md"
      label-class="dark"
      class="transparent"
    />

    <div v-else class="col-12 q-pt-lg">
      <section class="tagam-section-shell">
        <div class="tagam-section-heading tagam-section-heading--stacked">
          <div>
            <div class="tagam-section-heading__eyebrow">{{ $t("Preferences") }}</div>
            <div class="tagam-section-heading__title">{{ $t("Settings") }}</div>
          </div>
          <div class="tagam-section-heading__meta">
            {{ $t("Notifications and communication preferences") }}
          </div>
        </div>

        <q-list class="tagam-list-card q-pa-sm">
          <q-item v-for="(item, key) in settingsItems" :key="key" class="tagam-account-row">
          <q-item-section>
            <q-item-label>{{ $t(item.label) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="form[key]" />
          </q-item-section>
        </q-item>
        </q-list>
      </section>
    </div>

    <q-footer
      reveal
      class="bg-transparent q-px-md q-pb-sm q-pt-sm text-dark"
    >
      <div class="tagam-footer-shell">
        <q-btn
          @click="saveSettings"
          :loading="loading2"
          :label="$t('Save')"
          unelevated
          no-caps
          color="primary text-white"
          class="full-width text-weight-bold"
          size="lg"
          rounded
        />
      </div>
    </q-footer>
  </q-page>
</template>

<script>
import { FCM } from "@capacitor-community/fcm";
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";

export default {
  name: "SettingsPage",
  data() {
    return {
      loading: false,
      loading2: false,
      form: {
        app_push_notifications: false,
        app_sms_notifications: false,
        offers_email_notifications: false,
        promotional_push_notifications: false,
      },
      settingsItems: {
        app_push_notifications: { label: "Receive push notifications" },
        app_sms_notifications: { label: "Receive SMS notifications" },
        promotional_push_notifications: {
          label: "Promotional Push notifications",
        },
        offers_email_notifications: { label: "Receive offers by email" },
      },
    };
  },
  mounted() {
    this.getSettings();
  },
  methods: {
    getSettings() {
      this.loading = true;
      APIinterface.getSettings()
        .then((data) => {
          Object.keys(this.form).forEach(
            (key) => (this.form[key] = data.details[key] === "1")
          );
        })
        .catch((error) => APIinterface.notify("dark", error, "error", this.$q))
        .finally(() => (this.loading = false));
    },
    saveSettings() {
      this.loading2 = true;
      APIinterface.saveSettings(this.form)
        .then((data) => {
          APIinterface.notify("dark", data.msg, "check", this.$q);
          if (this.$q.platform.is.mobile) {
            const method = this.form.app_push_notifications
              ? "subscribeTo"
              : "unsubscribeFrom";
            FCM[method]({ topic: config.topic }).catch(console.error);
          }
        })
        .catch((error) => APIinterface.notify("dark", error, "error", this.$q))
        .finally(() => (this.loading2 = false));
    },
  },
};
</script>
