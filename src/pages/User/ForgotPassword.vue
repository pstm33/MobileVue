<template>
  <q-header
    reveal-offset="1"
    reveal
    class="tagam-account-header"
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="eva-arrow-back-outline"
        class="q-mr-sm"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
      <q-space></q-space>
    </q-toolbar>
  </q-header>
  <q-page class="tagam-user-forgot-password-page">
    <div class="flex flex-center absolute-center fit">
      <div class="text-center full-width q-pl-md q-pr-md">
        <q-responsive style="height: 190px">
          <q-img src="forgot-password.svg" fit="scale-down" loading="lazy">
            <template v-slot:loading>
              <div class="text-primary">
                <q-spinner-ios size="sm" />
              </div>
            </template>
          </q-img>
        </q-responsive>

        <template v-if="DataStore.password_reset_options == 'sms'">
          <ForgotPasswordSMS
            :phone_default_data="DataStore.phone_default_data"
          ></ForgotPasswordSMS
        ></template>
        <template
          v-else-if="DataStore.password_reset_options == 'both_sms_email'"
        >
          <ForgotPasswordBoth
            :phone_default_data="DataStore.phone_default_data"
          ></ForgotPasswordBoth>
        </template>
        <template v-else>
          <ForgotPasswordEmail></ForgotPasswordEmail>
        </template>
      </div>
    </div>
    <!-- full-width -->
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "ForgotPassword",
  components: {
    ForgotPasswordSMS: defineAsyncComponent(() =>
      import("components/ForgotPasswordSMS.vue")
    ),
    ForgotPasswordEmail: defineAsyncComponent(() =>
      import("components/ForgotPasswordEmail.vue")
    ),
    ForgotPasswordBoth: defineAsyncComponent(() =>
      import("components/ForgotPasswordBoth.vue")
    ),
  },
  data() {
    return {
      page_ready: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
};
</script>






