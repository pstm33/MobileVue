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
          :color="$q.dark.mode ? 'white' : 'dark'"
        />
        <q-toolbar-title class="text-weight-bold">
          {{ $t("Change Password") }}
        </q-toolbar-title>
      </q-toolbar>
    </div>
  </q-header>

  <q-page class="tagam-page-shell q-px-md q-pb-xl row items-stretch">
    <div class="col-12 q-pt-lg">
      <section class="tagam-section-shell">
        <div class="tagam-section-heading tagam-section-heading--stacked">
          <div>
            <div class="tagam-section-heading__eyebrow">{{ $t("Security") }}</div>
            <div class="tagam-section-heading__title">
              {{ $t("Change Password") }}
            </div>
          </div>
          <div class="tagam-section-heading__meta">
            {{ $t("Update your password to keep your account secure") }}
          </div>
        </div>

        <q-form @submit="onSubmit" class="tagam-list-card q-pa-md q-gutter-y-md">
          <q-input
            v-model="old_password"
            type="password"
            :label="$t('Current Password')"
            outlined
            lazy-rules
            bg-color="white"
            :rules="[
              (val) => (val && val.length > 0) || 'This field is required',
            ]"
          />

          <q-input
            v-model="new_password"
            type="password"
            :label="$t('New Password')"
            outlined
            lazy-rules
            bg-color="white"
            :rules="[
              (val) => (val && val.length > 0) || 'This field is required',
            ]"
          />

          <q-input
            v-model="confirm_password"
            type="password"
            :label="$t('Retype New Password')"
            outlined
            lazy-rules
            bg-color="white"
            :rules="[
              (val) => (val && val.length > 0) || 'This field is required',
            ]"
          />
        </q-form>
      </section>
    </div>

    <q-footer reveal class="bg-transparent q-px-md q-pb-sm q-pt-sm text-dark">
      <div class="tagam-footer-shell">
        <q-btn
          type="submit"
          :label="$t('Save')"
          unelevated
          no-caps
          color="primary"
          text-color="white"
          class="full-width text-weight-bold"
          size="lg"
          rounded
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </q-footer>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "ChangePassword",
  data() {
    return {
      loading: false,
      old_password: "",
      new_password: "",
      confirm_password: "",
    };
  },
  methods: {
    onSubmit() {
      const params = {
        old_password: this.old_password,
        new_password: this.new_password,
        confirm_password: this.confirm_password,
      };
      this.loading = true;
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.updatePassword(params)
        .then((data) => {
          APIinterface.notify("light-green", data.msg, "check_circle", this.$q);
          this.onReset();
        })
        .catch((error) => {
          APIinterface.notify("grey-8", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    onReset() {
      this.old_password = "";
      this.new_password = "";
      this.confirm_password = "";
    },
  },
};
</script>
