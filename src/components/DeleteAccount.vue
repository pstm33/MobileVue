<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="onBeforeShow"
    full-width
  >
    <q-card>
      <q-toolbar class="text-dark">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Delete Account") }}
          </div>
        </q-toolbar-title>
        <q-btn
          flat
          dense
          icon="close"
          v-close-popup
          :color="$q.dark.mode ? 'primary' : 'grey'"
        />
      </q-toolbar>
      <q-card-section>
        <div class="text-weight-bold text-subtitle2 line-normal">
          {{
            $t(
              "You are requesting to have your account deleted and personal information removed"
            )
          }}.
        </div>
        <q-space class="q-pa-xs"></q-space>
        <div class="text-caption">
          {{
            $t(
              "You will permanently lose all your orders, reviews,favorites and profile information, there is no turning back"
            )
          }}.
        </div>
      </q-card-section>
      <q-card-actions vertical class="q-pa-md">
        <q-btn
          color="negative"
          text-color="white"
          unelevated
          rounded
          no-caps
          size="lg"
          @click="RequestEmailCode"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Delete") }}
          </div></q-btn
        >
        <q-space class="q-pa-sm"></q-space>
        <q-btn
          color="mygrey"
          text-color="dark"
          unelevated
          rounded
          no-caps
          size="lg"
          @click="modal = false"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Cancel") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <StepsVerification
    ref="steps_verification"
    :sent_message="sent_message"
    @after-verifycode="afterVerifycode"
  />
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import auth from "src/api/auth";

export default {
  name: "DeleteAccount",
  components: {
    StepsVerification: defineAsyncComponent(() =>
      import("components/StepsVerification.vue")
    ),
  },
  data() {
    return {
      modal: false,
      loading: false,
      sent_message: null,
    };
  },
  methods: {
    RequestEmailCode() {
      this.loading = true;
      APIinterface.RequestEmailCode()
        .then((data) => {
          this.sent_message = data.msg;
          this.modal = false;
          this.$refs.steps_verification.show_modal = true;
        })
        .catch((error) => {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    afterVerifycode(code) {
      this.loading = true;
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.fetchDataByTokenPost("deleteAccount", "code=" + code)
        .then((data) => {
          this.$refs.steps_verification.show_modal = false;
          auth.logout();
          this.$router.push("/home");
        })
        .catch((error) => {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          this.loading = false;
          APIinterface.hideLoadingBox(this.$q);
        });
    },
  },
};
</script>
