<template>
  <!-- <q-dialog v-model="show_modal" persistent transition-show="scale" transition-hide="scale" position="bottom" > -->
  <q-dialog v-model="show_modal" persistent position="bottom">
    <q-card>
      <q-toolbar class="text-dark">
        <q-space></q-space>
        <q-btn
          flat
          dense
          icon="close"
          v-close-popup
          :color="$q.dark.mode ? 'primary' : 'grey'"
        />
      </q-toolbar>
      <q-form @submit="onSubmit" class="myform">
        <q-card-section class="text-center">
          <div class="text-h6 text-weight-bold">
            {{ $t("2-Step Verification") }}
          </div>
          <p class="text-weight-medium text-subtitle2">
            {{ $t("For your security, we want to make sure it's really you.") }}
          </p>

          <p v-if="sent_message2" class="text-weight-bold text-subtitle2">
            {{ sent_message2 }}
          </p>

          <q-input
            outlined
            v-model="code"
            :label="$t('Code')"
            maxlength="6"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Code is required']"
            mask="######"
          />

          <q-btn
            type="submit"
            unelevated
            no-caps
            class="fit q-mb-md"
            size="lg"
            :disabled="hasCode"
            :loading="loading"
            :color="hasCode == false ? 'secondary' : 'disabled'"
            :text-color="hasCode == false ? 'white' : 'disabled'"
            rounded
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Submit") }}
            </div>
          </q-btn>

          <div class="q-mb-sm text-center">
            <q-btn
              @click="resendCode"
              v-if="counter === 0"
              flat
              color="blue"
              no-caps
              :label="$t('Resend')"
              dense
              size="md"
            />
            <p v-else class="text-caption q-ma-none">
              <u>{{ $t("Resend Code in") }} {{ counter }}</u>
            </p>
          </div>
        </q-card-section>
      </q-form>

      <q-inner-loading
        :showing="visible"
        color="primary"
        size="md"
        label-class="dark"
      />
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "StepsVerification",
  props: ["sent_message"],
  data() {
    return {
      show_modal: false,
      loading: false,
      visible: false,
      code: "",
      counter: 20,
      timer: undefined,
      sent_message2: "",
    };
  },
  computed: {
    hasCode() {
      if (!APIinterface.empty(this.code)) {
        return false;
      }
      return true;
    },
  },
  updated() {
    this.code = "";
  },
  watch: {
    counter(newval, oldval) {
      if (newval <= 0) {
        this.stopTimer();
      }
    },
    show_modal(newval, oldval) {
      if (newval) {
        this.startTimer();
      }
    },
    sent_message(newval, oldval) {
      this.sent_message2 = newval;
    },
  },
  methods: {
    onSubmit() {
      this.$emit("afterVerifycode", this.code);
    },
    stopTimer() {
      clearInterval(this.timer);
    },
    startTimer() {
      this.stopTimer();
      this.counter = 20;
      this.timer = setInterval(() => {
        this.counter--;
      }, 1000);
    },
    resendCode() {
      this.loading = true;
      APIinterface.RequestEmailCode()
        .then((data) => {
          this.sent_message2 = data.msg;
          this.startTimer();
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
