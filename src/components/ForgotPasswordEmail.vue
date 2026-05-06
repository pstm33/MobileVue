<template>
  <div class="text-h6 text-weight-bold">
    {{ $t("Let's Get your account back") }}!
  </div>
  <div class="text-caption line-normal q-mb-md">
    {{ $t("Don't worry, just enter your registered email address") }}
  </div>

  <q-form @submit="onSubmit" class="myform">
    <q-input
      v-model="email"
      :placeholder="$t('Email address')"
      type="email"
      outlined
      lazy-rules
      borderless
      :rules="[(val) => /.+@.+\..+/.test(val) || $t('Invalid email')]"
    />

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
        {{ $t("Send OTP") }}
      </div>
    </q-btn>
  </q-form>
</template>

<script>
import { useDataStore } from "stores/DataStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "ForgotPasswordEmail",
  data() {
    return {
      email: "",
      loading: false,
      validation_type: "email",
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  methods: {
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "requestOTP",
        "email_address=" +
          this.email +
          "&validation_type=" +
          this.validation_type
      )
        .then((data) => {
          this.$router.push({
            path: "/user/verify-otp",
            query: {
              uuid: data.details.uuid,
              validation_type: this.validation_type,
              msg: data.msg,
              cont_path: "/user/reset-password",
            },
          });
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
