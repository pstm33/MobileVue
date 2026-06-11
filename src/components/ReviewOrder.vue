<template>
  <q-dialog
    v-model="modal"
    @before-show="beforeShow"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-hide="onBeforeHide"
  >
      <q-card class="tagam-review-sheet tagam-surface">
      <div class="fixed-top tagam-surface tagam-text-main z-top">
        <q-toolbar
          :class="{
            'border-bottom': steps != 1,
          }"
        >
          <q-btn
            @click="modal = false"
            dense
            color="grey-5"
            icon="close"
            size="md"
            unelevated
            flat
            class="q-mr-sm"
          />
        </q-toolbar>
      </div>
      <q-space style="height: 50px"></q-space>
      <template v-if="steps == 1">
        <q-card-section class="flex flex-center">
          <div class="q-mb-sm">
            <q-responsive style="width: 90px; height: 90px">
              <q-img
                :src="data?.merchant_logo || ''"
                lazy
                fit="cover"
                class="circle"
                spinner-color="primary"
                spinner-size="sm"
                placeholder-src="placeholder.png"
              >
                <template v-slot:loading>
                  <div class="text-primary">
                    <q-spinner-ios size="sm" />
                  </div>
                </template>
              </q-img>
            </q-responsive>
          </div>
          <div class="q-pl-xl q-pr-xl text-center">
            <div class="text-weight-bold text-subtitle2">
              {{ data?.share_experience }}
            </div>
            <div class="text-caption tagam-text-muted line-normal q-mb-sm">
              {{
                $t(
                  "Share your rating and review to help others make the best choice!"
                )
              }}
            </div>
            <q-rating
              v-model="rating"
              size="3em"
              color="disabled"
              color-selected="amber-5"
              icon="star"
              icon-selected="star"
              @update:model-value="steps = 2"
            />
          </div>
        </q-card-section>
      </template>
      <template v-else-if="steps == 2">
        <q-form @submit="onSubmit">
          <q-card-section class="myform tagam-review-form">
            <div class="text-weight-bold text-subtitle2">
              {{ $t("Rate") }}
            </div>
            <div>
              <q-rating
                v-model="rating"
                size="3em"
                color="disabled"
                color-selected="amber-5"
                icon="star"
                icon-selected="star"
                readonly
              />
            </div>
            <div class="text-caption text-amber-5">
              {{ ratingInWords }}
            </div>
            <q-space class="q-pa-sm"></q-space>
            <div class="text-weight-bold text-subtitle2 q-mb-sm">
              {{ $t("Share Your Experience with Us!") }}
            </div>

            <!-- UPLOAD IMAGE -->

            <div class="flex items-center q-gutter-xs">
              <template v-for="(items, index) in upload_images" :key="items">
                <div
                  class="relative-position radius8 light-dimmed"
                  style="width: 6em; height: 5.5em"
                >
                  <div class="absolute-top-right q-pa-xs">
                    <q-btn
                      icon="eva-trash-2-outline"
                      unelevated
                      padding="4px"
                      size="sm"
                      color="grey"
                      rounded
                      style="z-index: 999"
                      @click="removeImage(items, index)"
                    ></q-btn>
                  </div>
                  <q-img :src="items.url_image" fit="cover" class="fit radius8">
                    <template v-slot:loading>
                      <div class="text-primary">
                        <q-spinner-ios size="sm" />
                      </div> </template
                  ></q-img>
                </div>
              </template>
              <div
                class="tagam-review-upload radius8 q-pa-sm flex flex-center text-center cursor-pointer"
                style="width: 6em; height: 5.5em"
                @click="selectPhoto"
              >
                <q-icon name="eva-image-outline" size="sm"></q-icon>
                <div class="text-caption line-normal">
                  {{ $t("Upload photos") }}
                </div>
              </div>
            </div>
            <!-- UPLOAD IMAGE -->

            <q-space class="q-pa-sm"></q-space>
            <div class="text-weight-bold text-subtitle2 q-mb-sm">
              {{ $t("Leave a review") }}
            </div>
            <div>
              <q-input
                v-model="review_content"
                type="textarea"
                outlined
                class="tagam-review-input"
                :placeholder="
                  $t('Loved something about this place? Let others know!')
                "
                maxlength="2000"
                clearable
                clear-icon="eva-close-circle-outline"
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    this.$t('This field is required'),
                ]"
              />
            </div>

            <div>
              <q-checkbox
                v-model="as_anonymous"
                color="primary"
                :label="$t('post review as anonymous')"
              />
            </div>

            <q-space class="q-pa-xl"></q-space>

            <div
              class="fixed-bottom q-pa-sm tagam-review-footer shadow-1 row q-gutter-x-md items-center"
              :class="{
                'bg-dark': $q.dark.mode,
                'tagam-surface': !$q.dark.mode,
              }"
            >
              <q-btn
                class="col tagam-review-submit"
                unelevated
                rounded
                :color="review_content ? 'primary' : 'disabled'"
                :text-color="review_content ? 'white' : 'disabled'"
                :disabled="!review_content"
                size="lg"
                no-caps
                type="submit"
                :loading="loading"
              >
                <div class="text-subtitle2 text-weight-bold q-gutter-x-sm">
                  {{ $t("Submit") }}
                </div>
              </q-btn>
            </div>
          </q-card-section>
        </q-form>
      </template>
      <template v-else-if="steps == 3">
        <q-card-section>
          <!-- <pre>{{ review_details }}</pre> -->
          <div class="text-h6">
            {{ review_details?.rating_meaning?.title || "" }}
          </div>
          <div class="text-caption">
            {{ review_details?.rating_meaning?.subtitle || "" }}
          </div>
          <q-card-actions
            class="fixed-bottom tagam-review-footer tagam-surface shadow-1 q-pa-sm"
            vertical
          >
            <q-btn
              unelevated
              rounded
              color="primary"
              size="lg"
              no-caps
              type="submit"
              class="tagam-review-submit"
              @click="addTofavourites"
              :loading="loading"
            >
              <div class="flex items-center q-gutter-x-sm">
                <div>
                  <q-icon name="eva-heart-outline" size="sm"></q-icon>
                </div>
                <div class="text-subtitle2 text-weight-bold q-gutter-x-sm">
                  {{ $t("Save to Favourites") }}
                </div>
              </div>
            </q-btn>

            <q-btn
              unelevated
              rounded
              color="transparent"
              text-color="disabled"
              size="lg"
              no-caps
              type="submit"
              @click="modal = false"
              :disabled="loading"
            >
              <div
                class="text-subtitle2 text-weight-bold q-gutter-x-sm"
              >
                {{ $t("Maybe later") }}
              </div>
            </q-btn>
          </q-card-actions>
        </q-card-section>
      </template>
    </q-card>

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
      :max-files="3"
      auto-upload
      max-total-size="1048576"
      @rejected="onRejectedFiles"
      :headers="[{ name: 'Authorization', value: `token ${this.getToken()}` }]"
      :form-fields="formData"
      field-name="file"
      @uploaded="afterUploaded"
    />
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import config from "src/api/config";

export default {
  name: "ReviewOrder",
  data() {
    return {
      modal: false,
      data: null,
      rating: null,
      steps: 1,
      review_content: null,
      upload_api: config.api_base_url + "/interface/uploadReview",
      upload_images: [],
      as_anonymous: false,
      loading: false,
      review_details: [],
    };
  },
  setup() {
    return {};
  },
  computed: {
    ratingInWords() {
      let results = null;
      switch (this.rating) {
        case 1:
          results = this.$t("Terrible");
          break;
        case 2:
          results = this.$t("Poor");
          break;
        case 3:
          results = this.$t("Okay");
          break;
        case 4:
          results = this.$t("Good");
          break;
        case 5:
          results = this.$t("Perfect");
          break;
      }
      return results;
    },
  },
  methods: {
    async addTofavourites() {
      try {
        console.log("addTofavourites");
        this.loading = true;
        const params = new URLSearchParams({
          merchant_id: this.data.merchant_id,
        }).toString();
        const results = await APIinterface.fetchDataByTokenPost(
          "SaveStore",
          params
        );
        console.log("results", results);
        APIinterface.ShowSuccessful(results.msg, this.$q);
        this.modal = false;
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    async removeImage(value, index) {
      if (this.$refs.uploader.files.length > 0) {
        this.$refs.uploader.removeFile(this.$refs.uploader.files[index]);
      }

      this.upload_images.splice(index, 1);

      const params = new URLSearchParams({
        id: value.id,
      }).toString();
      try {
        await APIinterface.fetchDataByTokenPost("deleteMedia", params);
      } catch (error) {
      } finally {
      }
    },
    selectPhoto() {
      this.$refs.uploader.pickFiles();
    },
    getToken() {
      return auth.getToken();
    },
    onRejectedFiles(rejectedEntries) {
      console.log("rejectedEntries", rejectedEntries);
      APIinterface.ShowAlert(
        `${rejectedEntries.length} file(s) did not pass validation constraints`,
        this.$q.capacitor,
        this.$q
      );
    },
    afterUploaded(files) {
      const response = JSON.parse(files.xhr.responseText);
      if (response.code == 1) {
        this.upload_images = [...this.upload_images, response.details];
      } else {
        APIinterface.ShowAlert(response.msg, this.$q.capacitor, this.$q);
      }
    },
    async onSubmit() {
      try {
        this.loading = true;
        const params = {
          order_uuid: this.data?.order_uuid,
          review_content: this.review_content,
          upload_images: this.upload_images,
          rating: this.rating,
          as_anonymous: this.as_anonymous ? 1 : 0,
        };
        const results = await APIinterface.fetchDataByTokenPost(
          "submitReview",
          params
        );
        this.review_details = results.details;
        const is_favourite_added =
          this.review_details?.is_favourite_added || false;
        if (is_favourite_added) {
          this.modal = false;
          APIinterface.ShowAlert(results.msg, this.$q.capacitor, this.$q);
        } else {
          this.steps = 3;
        }
        this.$emit("afterAddreview");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    beforeShow() {
      this.steps = 1;
      this.rating = null;
      this.review_content = "";
      this.upload_images = [];
      this.as_anonymous = false;
    },
    show(value) {
      this.data = value;
      this.formData = [
        {
          name: "merchant_id",
          value: value.merchant_id,
        },
      ];
      this.modal = true;
    },
  },
};
</script>

<style scoped>
.tagam-review-sheet {
  color: var(--tagam-text);
  background:
    radial-gradient(circle at 50% -10%, var(--tagam-primary-soft), transparent 32%),
    var(--tagam-surface);
}

.tagam-review-form {
  max-width: 520px;
  margin: 0 auto;
}

.tagam-review-upload {
  width: 6em;
  height: 5.5em;
  border: 1.5px dashed var(--tagam-border-strong);
  background: var(--tagam-surface-glass);
  color: var(--tagam-text-muted);
}

.tagam-review-input :deep(.q-field__control) {
  border-radius: var(--tagam-radius-card);
  background: var(--tagam-surface-glass);
}

.tagam-review-footer {
  background: var(--tagam-surface-glass);
  border-top: 1px solid var(--tagam-border);
  backdrop-filter: blur(18px);
}

.tagam-review-submit {
  min-height: 56px;
  box-shadow: 0 18px 34px var(--tagam-primary-shadow);
}
</style>


