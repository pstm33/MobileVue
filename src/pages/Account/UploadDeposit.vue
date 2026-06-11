<template>
  <q-header
    reveal
    reveal-offset="50"
    class="tagam-account-header"
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="las la-angle-left"
        class="q-mr-sm"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
      <q-toolbar-title class="text-weight-bold">{{
        $t("Upload Proof of Payment")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page
    class="q-pl-md q-pr-md q-pb-md tagam-account-upload-deposit-page"
    :class="{ 'tagam-surface-elevated text-white': $q.dark.mode, 'tagam-surface-muted tagam-text-main': !$q.dark.mode, 'flex flex-center': !loading && !hasData, }"
  >
    <q-inner-loading
      v-if="loading"
      :showing="true"
      color="primary"
      size="md"
      label-class="dark"
      class="transparent"
    />
    <q-card v-if="!loading && hasData" flat class="tagam-upload-deposit-card">
      <q-card-section class="q-gutter-y-sm">
        <p class="tagam-body-muted q-mb-none">
          {{
            $t("Please enter the details of your bank deposit payment below")
          }}.
        </p>
        <p class="tagam-body-muted q-mb-none">
          {{
            $t(
              "Failure to provide accurate information may cause delays in processing or invalidation of your payment"
            )
          }}
        </p>
      </q-card-section>

      <q-list dense class="tagam-upload-summary q-mx-md q-mb-md">
        <q-item class="q-px-none">
          <q-item-section> {{ $t("Order #") }}: </q-item-section>
          <q-item-section class="text-weight-bold">
            {{ order_info.order_id }}
          </q-item-section>
        </q-item>
        <q-item class="q-px-none">
          <q-item-section> {{ $t("Amount") }}: </q-item-section>
          <q-item-section class="text-weight-bold">
            {{ order_info.total }}
          </q-item-section>
        </q-item>
      </q-list>

      <q-form @submit="onSubmit" class="q-pl-md q-pr-md q-pb-md">
        <q-input
          v-model="account_name"
          :label="$t('Account name')"
          outlined
          lazy-rules
          bg-color="transparent"
          color="primary"
          borderless
          class="input-borderless tagam-form-card q-mb-md"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />
        <q-input
          v-model="amount"
          :label="$t('Amount')"
          outlined
          lazy-rules
          bg-color="transparent"
          color="primary"
          borderless
          class="input-borderless tagam-form-card q-mb-md"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />
        <q-input
          v-model="reference_number"
          :label="$t('Reference Number')"
          outlined
          bg-color="transparent"
          color="primary"
          borderless
          class="input-borderless tagam-form-card"
        />
        <q-space class="q-pa-sm"></q-space>

        <q-btn
          v-if="!upload_enabled"
          icon="upload_file"
          unelevated
          color="primary"
          text-color="white"
          :label="$t('Upload Deposit')"
          no-caps
          rounded
          class="full-width text-weight-bold"
          size="md"
          @click="takePhoto"
        />

        <template v-if="upload_enabled">
          <div class="q-gutter-sm tagam-uploader-shell q-pa-sm">
            <div class="text-right">
              <q-btn
                round
                color="primary"
                icon="close"
                unelevated
                size="sm"
                @click="this.upload_enabled = !this.upload_enabled"
              />
            </div>
            <q-uploader
              :url="upload_api"
              :label="$t('Upload files')"
              color="primary"
              text-color="white"
              no-thumbnails
              class="full-width q-mb-md"
              flat
              accept=".jpg, image/*"
              bordered
              :max-files="1"
              auto-upload
              max-total-size="1048576"
              @rejected="onRejectedFiles"
              :headers="[
                { name: 'Authorization', value: `token ${this.getToken()}` },
              ]"
              field-name="file"
              @uploaded="afterUploaded"
            />
          </div>
        </template>
        <q-space class="q-pa-sm"></q-space>
        <q-btn
          :loading="loading_submit"
          type="submit"
          :label="$t('Submit')"
          unelevated
          no-caps
          color="primary"
          text-color="white"
          rounded
          class="full-width text-weight-bold"
          size="lg"
        />
      </q-form>
    </q-card>

    <div v-else-if="!loading && !hasData">
      <p class="tagam-text-muted">{{ $t("No data available") }}</p>
    </div>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";
import AppCamera from "src/api/AppCamera";
import auth from "src/api/auth";

export default {
  name: "UploadDeposit",
  data() {
    return {
      loading: false,
      loading_submit: false,
      order_uuid: "",
      account_name: "",
      amount: 0,
      reference_number: "",
      order_info: [],
      upload_api: config.api_base_url + "/interface/uploadProofPayment",
      photo_data: "",
      upload_enabled: false,
      filename: "",
      url_image: "",
    };
  },
  created() {
    this.order_uuid = this.$route.query.order_uuid;
    this.getBankDeposit();
  },
  computed: {
    hasData() {
      if (Object.keys(this.order_info).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    getToken() {
      return auth.getToken();
    },
    getBankDeposit() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "getBankDeposit",
        "order_uuid=" + this.order_uuid
      )
        .then((data) => {
          this.order_info = data.details.order_info;
          if (Object.keys(data.details).length > 0) {
            this.account_name = data.details.data.account_name;
            this.amount = data.details.data.amount;
            this.reference_number = data.details.data.reference_number;
          }
        })
        .catch((error) => {})
        .then((data) => {
          this.loading = false;
        });
    },
    takePhoto() {
      if (this.$q.capacitor) {
        AppCamera.isCameraEnabled()
          .then((data) => {
            AppCamera.isFileAccessEnabled()
              .then((data) => {
                AppCamera.getPhoto(1)
                  .then((data) => {
                    this.photo_data = data;
                  })
                  .catch((error) => {
                    this.photo_data = [];
                  });
                //
              })
              .catch((error) => {
                if (this.$q.platform.is.ios) {
                  this.upload_enabled = !this.upload_enabled;
                }
              });
            //
          })
          .catch((error) => {
            if (this.$q.platform.is.ios) {
              this.upload_enabled = !this.upload_enabled;
            }
          });
      } else {
        this.upload_enabled = !this.upload_enabled;
      }
    },
    afterUploaded(files) {
      const response = JSON.parse(files.xhr.responseText);
      if (response.code === 1) {
        this.url_image = response.details.url_image;
        this.filename = response.details.filename;
      } else {
        this.url_image = "";
        this.filename = "";
        APIinterface.notify("dark", response.msg, "error", this.$q);
      }
    },
    onSubmit() {
      this.loading_submit = true;
      APIinterface.fetchDataByTokenPost(
        "uploadBankDeposit",
        "order_uuid=" +
          this.order_uuid +
          "&account_name=" +
          this.account_name +
          "&amount=" +
          this.amount +
          "&reference_number=" +
          this.reference_number +
          "&filename=" +
          this.filename +
          "&file_data=" +
          this.getFileData() +
          "&image_type=" +
          this.getFileType()
      )
        .then((data) => {
          APIinterface.notify("green-5", data.msg, "check_circle", this.$q);
          this.$router.push("/account/allorder");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading_submit = false;
        });
    },
    getFileData() {
      return this.hadData() ? this.photo_data.data : "";
    },
    getFileType() {
      return this.hadData() ? this.photo_data.format : "";
    },
    hadData() {
      if (Object.keys(this.photo_data).length > 0) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style scoped>
.tagam-upload-deposit-card {
  background: var(--tagam-surface);
  border: 1px solid var(--tagam-border-soft);
  border-radius: 28px;
  box-shadow: var(--tagam-shadow-soft);
}

.tagam-upload-summary {
  background: var(--tagam-surface-muted);
  border: 1px solid var(--tagam-border-soft);
  border-radius: 18px;
  padding: 8px 16px;
}

.tagam-uploader-shell {
  background: var(--tagam-surface-muted);
  border: 1px solid var(--tagam-border-soft);
  border-radius: 20px;
}
</style>







