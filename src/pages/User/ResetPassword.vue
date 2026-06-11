<template>
  <q-header
    :class="{ 'tagam-surface-elevated text-white': $q.dark.mode, 'tagam-surface tagam-text-main': !$q.dark.mode, }"
  >
    <q-toolbar>
      <q-btn
        v-if="!success"
        @click="$router.back()"
        flat
        round
        dense
        icon="eva-arrow-back-outline"
        class="q-mr-sm"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md tagam-user-reset-password-page" :class="{ 'flex flex-center text-center': success }">
    <template v-if="!success">
      <div class="text-h6 text-weight-bold">
        {{ $t("Create new password") }}
      </div>
      <div class="text-caption line-normal q-mb-md">
        {{ $t("Please enter a new password for your account.") }}
      </div>

      <q-form @submit="onSubmit" class="myform">
        <PasswordFields v-model:password="password"></PasswordFields>

        <PasswordFields v-model:password="cpassword"></PasswordFields>

        <q-btn
          no-caps
          unelevated
          color="primary"
          text-color="white"
          size="lg"
          class="fit radius8"
          type="submit"
          rounded
          :loading="loading"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Reset Password") }}
          </div>
        </q-btn>
      </q-form>
    </template>
    <template v-else>
      <div>
        <svg
          class="checkmark"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
        >
          <circle
            class="checkmark__circle"
            cx="26"
            cy="26"
            r="25"
            fill="none"
          />
          <path
            class="checkmark__check"
            fill="none"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>

        <!-- <q-space class="q-pa-md"></q-space> -->

        <div class="text-weight-bold text-subtitle1">
          {{ $t("Password Updated") }}
        </div>

        <div class="text-caption line-normal">
          {{ $t("password_change") }}
        </div>

        <q-space class="q-pa-md"></q-space>
        <q-btn
          no-caps
          unelevated
          color="primary"
          text-color="white"
          size="lg"
          class="fit radius8"
          type="submit"
          rounded
          to="/user/login"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Done") }}
          </div>
        </q-btn>
      </div>
    </template>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "ResetPassword",
  components: {
    PasswordFields: defineAsyncComponent(() =>
      import("components/PasswordFields.vue")
    ),
  },
  data() {
    return {
      loading: false,
      password: "",
      cpassword: "",
      uuid: "",
      message: "",
      success: false,
    };
  },
  mounted() {
    this.uuid = this.$route.query.uuid;
  },
  methods: {
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "resetPassword",
        "uuid=" +
          this.uuid +
          "&password=" +
          this.password +
          "&cpassword=" +
          this.cpassword
      )
        .then((data) => {
          this.success = true;
          this.message = data.msg;
        })
        .catch((error) => {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>






