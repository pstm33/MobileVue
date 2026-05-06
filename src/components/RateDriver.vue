<template>
  <q-dialog v-model="modal" maximized persistent @before-show="loadAttributes">
    <q-card>
      <q-bar class="transparent">
        <q-btn
          flat
          round
          dense
          icon="close"
          :color="$q.dark.mode ? 'white' : 'dark'"
          size="13px"
          v-close-popup
        />
      </q-bar>
      <q-card-section class="fitx flex flex-center">
        <q-inner-loading :showing="loading2" color="primary"></q-inner-loading>
        <div class="text-center q-pt-lg">
          <q-avatar size="80px">
            <q-img
              src="http://localhost//kmrs2/themes/karenderia_v2/assets/images/user@2x.png"
              fit="cover"
              class="no-margin"
              loading="lazy"
              spinner-size="sm"
              spinner-color="primary"
            />
          </q-avatar>
          <q-space class="q-pa-xs"></q-space>
          <div class="text-h5 text-weight-bold">
            Let's rate your driver's delivery service
          </div>
          <p>How was the delivery of your order from McDonald's?</p>

          <div>
            <q-rating
              v-model="rating"
              size="2em"
              :max="5"
              color="grey"
              color-selected="amber-7"
            />
          </div>
          <q-space class="q-pa-sm"></q-space>
          <p>What did you like about the delivery?</p>

          <div style="width: 80%; margin: auto">
            <div class="flex-content w-100">
              <template v-for="items in data" :key="items">
                <div class="flex-content-item">
                  <q-btn
                    rounded
                    :label="items"
                    no-caps
                    unelevated
                    :outline="review_text == items ? false : true"
                    :color="review_text == items ? 'primary' : 'grey'"
                    @click="review_text = items"
                  ></q-btn>
                </div>
              </template>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator></q-separator>
      <q-card-section align="right">
        <q-btn
          label="Submit Review"
          no-caps
          color="primary"
          unelevated
          @click="submitReview"
          :loading="loading"
          :disable="!hasRating"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "RateDriver",
  props: ["order_id", "driver_id"],
  data() {
    return {
      modal: false,
      rating: 0,
      data: null,
      review_text: null,
      loading: false,
      loading2: false,
    };
  },
  mounted() {},
  computed: {
    hasRating() {
      if (this.rating > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    loadAttributes() {
      if (!this.data) {
        this.ReviewAttributes();
      }
    },
    ReviewAttributes() {
      this.loading2 = true;
      APIinterface.fetchDataByTokenGet("ReviewAttributes")
        .then((data) => {
          console.log("ReviewAttributes", data);
          this.data = data.details;
        })
        .catch((error) => {})
        .then((data) => {
          this.loading2 = false;
        });
    },
    submitReview() {
      this.loading = true;
      let params = "rating=" + this.rating;
      params += "&review_text=" + this.review_text;
      params += "&order_id=" + this.order_id;
      params += "&driver_id=" + this.driver_id;
      APIinterface.fetchDataByTokenPost("addRiderReview", params)
        .then((data) => {
          APIinterface.notify("light-green", data.msg, "check_circle", this.$q);
          this.modal = false;
          this.$emit("afterRatedriver", data.details);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, null, this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
