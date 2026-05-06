<template>
  <div class="text-h6 text-weight-bold">
    {{ $t("Let's Get your account back") }}!
  </div>
  <div class="text-caption line-normal q-mb-md">
    {{ $t("Don't worry, just enter your registered phone or email address") }}
  </div>

  <q-form @submit="onSubmit" class="myform">
    <template v-if="validation_type == 'email'">
      <q-input
        v-model="email"
        borderless
        :placeholder="$t('Email address')"
        :rules="[(val) => /.+@.+\..+/.test(val) || $t('Invalid email')]"
      >
        <template v-slot:prepend>
          <q-icon color="primary" name="eva-email-outline" />
        </template>
      </q-input>
    </template>
    <template v-else>
      <q-input
        v-model="mobile_number"
        mask="##############"
        :placeholder="$t('Enter Phone Number')"
        outlined
        lazy-rules
        borderless
        class="input-borderless"
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
      >
        <template v-slot:prepend>
          <q-select
            dense
            v-model="mobile_prefix"
            :options="DataStore.phone_prefix_data"
            @filter="filterFn"
            behavior="dialog"
            input-debounce="700"
            style="border: none"
            emit-value
            borderless
            class="myq-field"
            dropdown-icon="eva-chevron-down-outline"
          >
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section avatar>
                  <q-img
                    :src="opt.flag"
                    style="height: 15px; max-width: 20px"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ $t("No results") }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </template>
      </q-input>
    </template>

    <div class="q-gutter-sm">
      <q-radio
        v-model="validation_type"
        checked-icon="task_alt"
        unchecked-icon="panorama_fish_eye"
        val="email"
        :label="$t('Email')"
      />
      <q-radio
        v-model="validation_type"
        checked-icon="task_alt"
        unchecked-icon="panorama_fish_eye"
        val="sms"
        :label="$t('Mobile')"
      />
    </div>

    <q-space class="q-pa-sm"></q-space>

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
  name: "ForgotPasswordBoth",
  props: ["phone_default_data"],
  data() {
    return {
      loading: false,
      validation_type: "email",
      email: "",
      mobile_number: "",
      mobile_prefix: "",
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  mounted() {
    this.mobile_prefix = this.phone_default_data.phonecode;
  },
  methods: {
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "requestOTP",
        "email_address=" +
          this.email +
          "&validation_type=" +
          this.validation_type +
          "&mobile_number=" +
          this.mobile_number +
          "&mobile_prefix=" +
          this.mobile_prefix
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
