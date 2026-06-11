<template>
  <q-dialog
    v-model="modal"
    @before-show="beforeShow"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-hide="onBeforeHide"
  >
    <q-card class="tagam-surface">
      <div class="fixed-top tagam-surface tagam-text-main z-top">
        <q-toolbar>
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

      <q-card-section class="flex flex-center">
        <div class="q-mb-sm">
          <q-responsive style="width: 90px; height: 90px">
            <q-img
              :src="driver_info?.photo || ''"
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
        <div class="q-pl-xl q-pr-xl text-center q-gutter-y-sm">
          <div class="text-weight-bold text-subtitle2">
            {{ $t("Let's rate your driver's delivery service") }}
          </div>
          <div class="text-caption tagam-text-muted line-normal q-mb-sm">
            {{ data?.share_driver_experience }}
          </div>
          <q-rating
            v-model="rating"
            size="3em"
            color="disabled"
            color-selected="amber-5"
            icon="star"
            icon-selected="star"
          />
          <div class="text-caption">
            {{ $t("What did you like about the delivery?") }}
          </div>

          <div v-if="loading_attr"><q-spinner-ios size="sm" /></div>
          <div class="flex items-center q-gutter-sm">
            <template v-for="items in getReviewattr" :key="items">
              <router-link to="" @click="review_text = items">
                <div
                  class="q-pa-xs q-pr-sm tagam-surface border-grey radius28 flex items-center q-gutter-x-xs"
                  :class="{
                    'tagam-surface tagam-text-main': review_text != items,
                    'bg-blue text-white': review_text == items,
                  }"
                >
                  <div class="text-subtitle2">
                    <span v-html="items"></span>
                  </div>
                </div>
              </router-link>
            </template>
          </div>
        </div>
      </q-card-section>
      <q-card-actions
        class="fixed-bottom tagam-review-footer tagam-surface shadow-1 q-pa-sm"
        vertical
      >
        <q-btn
          unelevated
          rounded
          :color="rating ? 'secondary' : 'disabled'"
          :text-color="rating ? 'white' : 'disabled'"
          :disabled="!rating"
          size="lg"
          no-caps
          type="submit"
          :loading="loading"
          @click="onsubmit"
          class="tagam-review-submit"
        >
          <div class="text-subtitle2 text-weight-bold q-gutter-x-sm">
            {{ $t("Submit Review") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";

export default {
  name: "ReviewDelivery",
  data() {
    return {
      modal: false,
      data: null,
      rating: null,
      loading: false,
      driver_info: null,
      review_attr: null,
      review_text: null,
      loading_attr: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  computed: {
    getReviewattr() {
      return this.DataStore.review_attr_data;
    },
  },
  methods: {
    show(value) {
      this.data = value;
      this.modal = true;
      this.fecthDriver();
    },
    async fecthDriver() {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const results = await APIinterface.fetchDataByTokenGet("fetchDriver", {
          driver_id: this.data?.driver_id,
        });
        this.driver_info = results.details.data;
      } catch (error) {
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    async beforeShow() {
      try {
        this.rating = null;
        this.review_text = null;
        this.loading_attr = true;
        await this.DataStore.fetchReviewAttributes();
      } catch (error) {
      } finally {
        this.loading_attr = false;
      }
    },
    async onsubmit() {
      try {
        this.loading = true;
        const params = new URLSearchParams({
          rating: this.rating,
          review_text: this.review_text,
          order_id: this.data?.order_id || null,
          driver_id: this.data?.driver_id || null,
        }).toString();
        const results = await APIinterface.fetchDataByTokenPost(
          "addRiderReview",
          params
        );
        console.log("results", results);
        this.$emit("afterAddreview");
        this.modal = false;
        APIinterface.ShowSuccessful(results.msg, this.$q);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = true;
      }
    },
  },
};
</script>





