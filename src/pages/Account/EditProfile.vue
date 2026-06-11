<template>
  <q-header class="tagam-surface tagam-text-main myshadow-1" reveal reveal-offset="50">
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
      <q-toolbar-title class="text-subtitle2 text-weight-bold">{{
        $t("Edit Profile")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="tagam-account-edit-profile-page">
    <q-form @submit="checkForm" class="myform">
      <div class="q-pa-md flex flex-center items-center">
        <div>
          <q-item clickable>
            <q-item-section class="flex flex-center q-gutter-y-sm">
              <q-avatar size="5em" class="tagam-edit-profile-avatar">
                <img :src="hasData ? photo_data.path : avatar" />
              </q-avatar>
              <q-btn
                :label="$t('Change image')"
                no-caps
                unelevated
                outline
                dense
                color="primary"
                padding="0px 8px"
                class="text-caption radius28"
                @click="changeImage"
              ></q-btn>
            </q-item-section>
          </q-item>
        </div>
      </div>

      <q-uploader
        :url="upload_api"
        ref="uploader"
        :label="$t('Upload files')"
        :color="$q.dark.mode ? 'grey600' : 'primary'"
        :text-color="$q.dark.mode ? 'grey300' : 'white'"
        no-thumbnails
        class="hidden"
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

      <q-card-section class="tagam-form-card q-mx-md q-mb-md">
        <q-input
          v-model="first_name"
          borderless
          :label="$t('First name')"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />
        <q-input
          v-model="last_name"
          :label="$t('Last name')"
          borderless
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />
        <q-input
          v-model="email_address"
          :label="$t('Email address')"
          borderless
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          v-model="mobile_number"
          mask="##############"
          outlined
          lazy-rules
          borderless
          class="input-borderless"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
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
                  <q-item-section class="tagam-text-muted">
                    {{ $t("No results") }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </template>
        </q-input>

        <CustomFields
          ref="ref_customfields"
          :data_fields="custom_fields2"
        ></CustomFields>

        <q-btn
          :label="$t('Delete Account')"
          no-caps
          color="transparent"
          text-color="primary"
          unelevated
          class="radius28 fit text-weight-medium tagam-danger-soft-btn"
          @click="this.$refs.ref_deleteAccount.modal = true"
        ></q-btn>
        <q-space class="q-pa-sm"></q-space>
      </q-card-section>

      <q-footer class="tagam-surface q-pa-sm tagam-text-main shadow-1">
        <q-btn
          no-caps
          unelevated
          color="primary"
          text-color="white"
          size="lg"
          rounded
          class="fit"
          type="submit"
          :loading="loading_get"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Save") }}
          </div>
        </q-btn>
      </q-footer>
    </q-form>

    <StepsVerification
      ref="steps_verification"
      :sent_message="sent_message"
      @after-verifycode="afterVerifycode"
    />
    <DeleteAccount ref="ref_deleteAccount"></DeleteAccount>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useDataStore } from "stores/DataStore";
import config from "src/api/config";
import AppCamera from "src/api/AppCamera";

export default {
  name: "EditProfile",
  components: {
    StepsVerification: defineAsyncComponent(() =>
      import("components/StepsVerification.vue")
    ),
    CustomFields: defineAsyncComponent(() =>
      import("components/CustomFields.vue")
    ),
    DeleteAccount: defineAsyncComponent(() =>
      import("components/DeleteAccount.vue")
    ),
  },
  data() {
    return {
      loading: false,
      loading_get: false,
      first_name: "",
      last_name: "",
      email_address: "",
      mobile_number: "",
      mobile_prefix: "",
      avatar: "",
      original_email_address: "",
      original_mobile_number: "",
      sent_message: "",
      upload_api: config.api_base_url + "/interface/updateAvatar",
      upload_enabled: false,
      filename: "",
      upload_path: "",
      photo_data: "",
      custom_fields: {},
      custom_fields2: {},
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  mounted() {
    this.getCurrentProfile();
  },
  computed: {
    hasData() {
      if (Object.keys(this.photo_data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    changeImage() {
      if (this.$q.capacitor) {
        this.takePhoto();
      } else {
        this.$refs.uploader.pickFiles();
      }
    },
    getCurrentProfile() {
      const $oldprofile = auth.getUser();
      if ($oldprofile) {
        console.log("$oldprofile", $oldprofile);
        this.original_email_address = $oldprofile.email_address;
        this.original_mobile_number = $oldprofile.contact_number.replace(
          "+",
          ""
        );
        this.first_name = $oldprofile?.first_name || "";
        this.last_name = $oldprofile?.last_name || "";
        this.email_address = $oldprofile?.email_address || "";
        this.mobile_prefix = $oldprofile?.phone_prefix || "";
        this.mobile_number = $oldprofile?.contact_number_noprefix || "";
        this.avatar = $oldprofile?.avatar || "";
      }

      this.loading_get = true;
      APIinterface.fetchDataByTokenGet("getProfile")
        .then((data) => {
          const result = data.details;
          this.first_name = result.first_name;
          this.last_name = result.last_name;
          this.mobile_prefix = result.mobile_prefix;
          this.mobile_number = result.mobile_number;
          this.email_address = result.email_address;
          this.avatar = result.avatar;

          const customFields = result.custom_fields;
          if (customFields) {
            Object.keys(customFields).forEach((key) => {
              const value = customFields[key];
              this.addCustomField(key, value);
            });
          }

          setTimeout(() => {
            this.custom_fields2 = this.custom_fields;
          }, 100);
        })
        .catch((error) => {})
        .then((data) => {
          this.loading_get = false;
        });
    },
    addCustomField(id, value) {
      this.custom_fields[id] = value;
    },
    checkForm() {
      let _change = false;
      if (this.email_address !== this.original_email_address) {
        _change = true;
        console.log("d1");
      }
      const phone = this.mobile_prefix + this.mobile_number;
      console.log("phone", phone);
      console.log("this.original_mobile_number", this.original_mobile_number);
      if (phone !== this.original_mobile_number) {
        _change = true;
        console.log("d2");
      }

      console.log(_change);

      if (_change) {
        this.loading = true;
        APIinterface.RequestEmailCode()
          .then((data) => {
            this.sent_message = data.msg;
            this.show_modal = false;
            this.$refs.steps_verification.show_modal = true;
          })
          .catch((error) => {
            APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
          })
          .then((data) => {
            this.loading = false;
          });
      } else {
        this.onSubmit("");
      }
    },
    onSubmit(code) {
      this.loading = true;
      APIinterface.showLoadingBox("", this.$q);
      const params = {
        code,
        first_name: this.first_name,
        last_name: this.last_name,
        email_address: this.email_address,
        mobile_number: this.mobile_number,
        mobile_prefix: this.mobile_prefix,
        filename: this.filename,
        upload_path: this.upload_path,
        file_data: this.hadData() ? this.photo_data.data : "",
        image_type: this.hadData() ? this.photo_data.format : "",
        custom_fields: this.$refs.ref_customfields.custom_fields,
      };
      APIinterface.saveProfile(params)
        .then((data) => {
          this.$refs.steps_verification.show_modal = false;
          auth.setUser(data.details.user_data);
          auth.setToken(data.details.user_token);
          APIinterface.ShowSuccessful(data.msg, this.$q);

          setTimeout(() => {
            this.getCurrentProfile();
          }, 500);
        })
        .catch((error) => {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          this.loading = false;
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    afterVerifycode(code) {
      this.onSubmit(code);
    },
    getToken() {
      return auth.getToken();
    },
    afterUploaded(files) {
      const response = JSON.parse(files.xhr.responseText);
      if (response.code === 1) {
        this.avatar = response.details.url_image;
        this.filename = response.details.filename;
        this.upload_path = response.details.upload_path;
      } else {
        this.avatar = "";
        this.filename = "";
        this.upload_path = "";
        APIinterface.ShowAlert(response.msg, this.$q.capacitor, this.$q);
      }
    },
    takePhoto() {
      AppCamera.isCameraEnabled()
        .then((data) => {
          AppCamera.isFileAccessEnabled()
            .then((data) => {
              let label = {
                photo: this.$t("Photo"),
                cancel: this.$t("Cancel"),
                from_photos: this.$t("From Photos"),
                take_picture: this.$t("Take Picture"),
              };

              AppCamera.getPhoto(1, label)
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

<style lang="scss">
.tagam-edit-profile-avatar {
  border: 1px solid var(--tagam-border);
  box-shadow: var(--tagam-shadow-soft);
}

.tagam-account-edit-profile-page {
  background:
    radial-gradient(circle at 18% 0, rgba(255, 90, 47, 0.08), transparent 220px),
    linear-gradient(180deg, var(--tagam-bg-soft) 0, var(--tagam-bg) 340px);
}

.tagam-form-card {
  border: 1px solid var(--tagam-border);
  border-radius: 24px;
  background: var(--tagam-surface);
  box-shadow: var(--tagam-shadow-soft);
}

.tagam-danger-soft-btn {
  border: 1px solid rgba(255, 90, 47, 0.22);
  background: var(--tagam-primary-soft) !important;
}
</style>





