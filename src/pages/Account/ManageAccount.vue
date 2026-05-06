<template>
  <q-header reveal reveal-offset="50" class="bg-transparent q-pa-sm">
    <div class="tagam-account-header-shell">
      <q-toolbar class="q-px-xs">
        <q-btn
          to="/account/profile"
          flat
          round
          dense
          icon="las la-angle-left"
          class="q-mr-sm"
          :color="$q.dark.mode ? 'white' : 'dark'"
          :disable="account_deleted"
        />
        <q-toolbar-title class="text-weight-bold">
          {{ $t("Manage Account") }}
        </q-toolbar-title>
      </q-toolbar>
    </div>
  </q-header>

  <q-page class="tagam-page-shell q-px-md q-pb-xl">
    <section class="tagam-section-shell q-mt-lg">
      <div class="tagam-section-heading tagam-section-heading--stacked">
        <div>
          <div class="tagam-section-heading__eyebrow">{{ $t("Account") }}</div>
          <div class="tagam-section-heading__title">
            {{ $t("Manage Account") }}
          </div>
        </div>
        <div class="tagam-section-heading__meta">
          {{ $t("Archive or delete your account data") }}
        </div>
      </div>

      <div class="tagam-list-card q-pa-md">
        <template v-if="account_deleted">
          <div class="text-h6 text-weight-bold q-mb-sm">
            {{ $t("Your account is being deleted") }}
          </div>
          <p class="tagam-page-copy q-mb-sm">
            {{
              $t(
                "You will be automatically logged out. Your account will be deleted in the next few minutes."
              )
            }}
          </p>
          <p class="tagam-page-copy q-mb-none">
            {{ $t("Note: We may retain some information when permitted by law.") }}
          </p>
        </template>

        <template v-else>
          <div class="q-gutter-y-lg">
            <div class="tagam-list-card q-pa-md">
              <div class="text-h6 text-weight-bold q-mb-sm">
                {{ $t("Account Data") }}
              </div>
              <p class="tagam-page-copy q-mb-md">
                {{
                  $t(
                    "You can request an archive of your personal information. We'll notify you when it's ready to download."
                  )
                }}
              </p>
              <q-btn
                @click="requestData"
                :label="$t('Request Archive')"
                unelevated
                no-caps
                color="primary"
                text-color="white"
                rounded
                class="text-weight-bold"
              />
            </div>

            <div class="tagam-list-card q-pa-md">
              <div class="text-h6 text-weight-bold q-mb-sm">
                {{ $t("Delete Account") }}
              </div>
              <p class="tagam-page-copy q-mb-md">
                {{
                  $t(
                    "You can request deletion of your account and personal information. If multiple accounts belong to the same user, related records may also be affected where permitted."
                  )
                }}
              </p>
              <q-btn
                @click="beforeDelete"
                :label="$t('Request Delete Account')"
                unelevated
                no-caps
                color="negative"
                text-color="white"
                rounded
                class="text-weight-bold"
              />
            </div>
          </div>
        </template>
      </div>

      <q-inner-loading :showing="loading" color="primary" size="md" />
    </section>

    <StepsVerification
      ref="steps_verification"
      :sent_message="sent_message"
      :phone_prefix="phone_prefix"
      :phone_number="phone_number"
      @after-verifycode="afterVerifycode"
    />
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

export default {
  name: "ManageAccount",
  components: {
    StepsVerification: defineAsyncComponent(() =>
      import("components/StepsVerification.vue")
    ),
  },
  data() {
    return {
      loading: false,
      code: "",
      account_deleted: false,
      sent_message: "",
    };
  },
  methods: {
    requestData() {
      APIinterface.requestData()
        .then((data) => {
          //
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {});
    },
    beforeDelete() {
      this.loading = true;
      this.code = "";
      APIinterface.RequestEmailCode()
        .then((data) => {
          this.sent_message = data.msg;
          this.show_modal = false;
          this.$refs.steps_verification.show_modal = true;
        })
        .catch((error) => {
          APIinterface.notify("negative", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    afterVerifycode(code) {
      this.code = code;
      APIinterface.verifyAccountDelete(code)
        .then((data) => {
          this.$refs.steps_verification.show_modal = false;
          this.confirmDeletion();
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    confirmDeletion() {
      this.$q
        .dialog({
          title: "Confirm account deletion",
          message:
            "Are you sure you want to delete your account and customer data? \n  This action is permanent and cannot be undone.",
          persistent: true,
          position: "bottom",
          ok: {
            unelevated: true,
            color: "warning",
            rounded: false,
            "text-color": "black",
            size: "md",
            label: "Yes delete my account",
            "no-caps": true,
          },
          cancel: {
            unelevated: true,
            rounded: false,
            color: "grey-3",
            "text-color": "black",
            size: "md",
            label: "Cancel",
            "no-caps": true,
          },
        })
        .onOk(() => {
          this.deleteAccount();
        })
        .onOk(() => {
          // console.log('>>>> second OK catcher')
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    },
    deleteAccount() {
      this.loading = true;
      APIinterface.deleteAccount(this.code)
        .then((data) => {
          this.account_deleted = true;
          setTimeout(() => {
            auth.logout();
            this.$router.push("/home");
          }, 5000);
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
