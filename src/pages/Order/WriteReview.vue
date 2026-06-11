<template>
  <q-header
    reveal
    reveal-offset="50"
    class="tagam-account-header"
  >
    <q-toolbar class="tagam-text-main">
      <q-btn
        v-if="back_url"
        @click="$router.back()"
        flat
        round
        dense
        icon="close"
        class="q-mr-sm"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
      <q-btn
        v-else
        :to="`/account/trackorder?order_uuid=${order_uuid}`"
        rounded
        unelevated
        color="white"
        text-color="dark"
        icon="close"
        dense
        no-caps
      />
      <q-toolbar-title
        class="tagam-text-mainx text-weight-bold"
        :class="{ 'text-white': $q.dark.mode, 'tagam-text-main': !$q.dark.mode, }"
      >
        {{ $t("Write Review") }}
        <span v-if="order_id">#{{ order_id }}</span>
      </q-toolbar-title>
    </q-toolbar>
  </q-header>

  <q-form @submit="onSubmit">
    <q-page class="q-pl-md q-pr-md tagam-order-write-review-page" padding>
      <div class="tagam-review-card q-mb-md">
        <q-rating
          v-model="rating_value"
          size="md"
          :max="5"
          :color="$q.dark.mode ? 'white' : 'grey-5'"
          color-selected="primary"
          class="q-mb-xs"
        />
      </div>

      <div class="tagam-review-card q-gutter-y-md">
        <h6 class="text-weight-bold no-margin">
          {{ $t("What did you like?") }}
        </h6>
        <q-input
          v-model="tags_like"
          :label="$t('Describe in few words')"
          outlined
          lazy-rules
          bg-color="transparent"
          color="primary"
          borderless
          class="input-borderless tagam-form-card"
          :rules="[
            (val) => val.length <= 50 || $t('Please use maximum 50 characters'),
          ]"
        />

        <h6 class="text-weight-bold no-margin">
          {{ $t("What did you not like?") }}
        </h6>

        <q-input
          v-model="tags_not_like"
          :label="$t('Describe in few words')"
          outlined
          lazy-rules
          bg-color="transparent"
          color="primary"
          borderless
          class="input-borderless tagam-form-card"
          :rules="[
            (val) => val.length <= 50 || $t('Please use maximum 50 characters'),
          ]"
        />

        <h6 class="text-weight-bold no-margin">
          {{ $t("Add Photos") }}
        </h6>
        <q-uploader
          :url="upload_api"
          :label="$t('Drop files here to upload')"
          color="primary"
          text-color="white"
          no-thumbnails
          class="full-width q-mb-md tagam-review-uploader"
          flat
          accept=".jpg, image/*"
          bordered
          auto-upload
          max-total-size="1048576"
          @rejected="onRejectedFiles"
          :headers="[
            { name: 'Authorization', value: `token ${this.getToken()}` },
          ]"
          field-name="file"
          @uploaded="afterUploaded"
        />

        <h6 class="text-weight-bold no-margin">
          {{ $t("Write your review") }}
        </h6>

        <q-input
          v-model="review_content"
          outlined
          autogrow
          lazy-rules
          bg-color="transparent"
          color="primary"
          borderless
          class="input-borderless tagam-form-card"
          :rules="[
            (val) => (val && val.length > 0) || $t('This field is required'),
          ]"
        />

        <div class="q-pb-sm">
          <q-checkbox
            v-model="as_anonymous"
            size="sm"
            color="primary"
            :label="$t('post review as anonymous')"
          />
        </div>
      </div>
    </q-page>

    <q-footer class="tagam-surface q-pl-md q-pr-md q-pb-sm q-pt-sm tagam-text-main">
      <q-btn
        type="submit"
        unelevated
        color="primary"
        text-color="white"
        no-caps
        class="full-width"
        :loading="loading"
        style="letter-spacing: 2px"
        :label="$t('Add Review')"
        size="lg"
      />
    </q-footer>
  </q-form>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";
import auth from "src/api/auth";

export default {
  name: "WriteReview",
  data() {
    return {
      order_uuid: "",
      loading: false,
      upload_api: config.api_base_url + "/interface/uploadReview",
      rating_value: 0,
      as_anonymous: false,
      review_content: "",
      tags_like: "",
      tags_not_like: "",
      upload_images: "",
      back_url: false,
      initial_rate: 0,
      order_id: "",
    };
  },
  mounted() {
    this.order_uuid = this.$route.query.order_uuid;
    this.back_url = this.$route.query.back_url;
    this.initial_rate = this.$route.query.rate;
    if (this.initial_rate > 0) {
      this.rating_value = this.initial_rate;
    }
    this.order_id = this.$route.query.order_id;
  },
  methods: {
    onRejectedFiles(rejectedEntries) {
      APIinterface.notify(
        "negative",
        `${rejectedEntries.length} file(s) did not pass validation constraints`,
        "error_outline",
        this.$q
      );
    },
    getToken() {
      return auth.getToken();
    },
    onSubmit() {
      const params = {
        order_uuid: this.order_uuid,
        review_content: this.review_content,
        rating_value: this.rating_value,
        as_anonymous: this.as_anonymous,
        tags_like: [this.tags_like],
        tags_not_like: [this.tags_not_like],
        upload_images: this.upload_images,
      };
      this.loading = true;
      APIinterface.addReview(params)
        .then((data) => {
          APIinterface.notify("green", data.msg, "check", this.$q);
          if (this.back_url) {
            this.$router.push(this.back_url);
          } else {
            this.$router.push({
              path: "/account/trackorder",
              query: { order_uuid: this.order_uuid },
            });
          }
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    afterUploaded(files) {
      const response = JSON.parse(files.xhr.responseText);
      if (response.code === 1) {
        this.upload_images = response.details;
      } else {
        APIinterface.notify("dark", response.msg, "error", this.$q);
      }
    },
  },
};
</script>

<style scoped>
.tagam-order-write-review-page {
  background: var(--tagam-page-gradient);
}

.tagam-review-card {
  background: var(--tagam-surface);
  border: 1px solid var(--tagam-border-soft);
  border-radius: 24px;
  padding: 18px;
  box-shadow: var(--tagam-shadow-soft);
}

.tagam-review-uploader {
  border-radius: 18px;
  overflow: hidden;
}
</style>



