<template>
  <q-header
    reveal
    reveal-offset="20"
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
    }"
  >
    <q-toolbar>
      <q-btn
        flat
        round
        dense
        icon="close"
        class="q-mr-sm"
        :color="$q.dark.mode ? 'white' : 'dark'"
        @click="CloseReview"
      />
    </q-toolbar>
  </q-header>
  <q-page padding>
    <q-inner-loading :showing="loading2" color="primary"></q-inner-loading>
    <q-card flat v-if="driver_info">
      <div class="text-center q-pt-lg">
        <q-avatar size="80px">
          <q-img
            :src="driver_info.photo"
            fit="cover"
            class="no-margin"
            loading="lazy"
            spinner-size="sm"
            spinner-color="primary"
          />
        </q-avatar>

        <q-space class="q-pa-xs"></q-space>
        <div class="text-h5 text-weight-bold">
          {{ $t("Let's rate your driver's delivery service") }}
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

        <p>{{ order_info.hows_your_order }}</p>

        <div style="width: 80%; margin: auto">
          <div class="flex-content w-100">
            <template v-for="items in data_like_options" :key="items">
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
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "RateDriver",
  data() {
    return {
      modal: false,
      rating: 0,
      data_like_options: null,
      review_text: null,
      loading: false,
      loading2: false,
      order_uuid: null,
      order_id: null,
      driver_id: null,
      driver_info: null,
      order_info: null,
      is_driver_review: false,
      is_review: false,
      initial_review: null,
    };
  },
  mounted() {
    this.order_uuid = this.$route.query.order_uuid;
    this.initial_review = this.$route.query.rate;
    if (this.initial_review > 0) {
      this.rating = this.initial_review;
    }
    this.getOrder();
  },
  computed: {
    hasRating() {
      if (this.rating > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    CloseReview() {
      console.log(this.is_review);
      if (!this.is_review) {
        this.$router.replace({
          path: "/order/write-review",
          query: {
            back_url: "/account/allorder",
            order_uuid: this.order_uuid,
          },
        });
      } else {
        this.$router.back();
      }
    },
    getOrder() {
      this.loading2 = true;
      APIinterface.fetchDataByTokenGet("getOrdertoreview", {
        order_uuid: this.order_uuid,
      })
        .then((data) => {
          this.is_driver_review = data.details.is_driver_review;
          if (this.is_driver_review || data.details.driver_info === null) {
            this.$router.replace({
              path: "/order/write-review",
              query: {
                back_url: "/account/allorder",
                order_uuid: this.order_uuid,
                rate: this.initial_review,
              },
            });
            return;
          }
          this.order_info = data.details.order_info;
          this.driver_info = data.details.driver_info;
          this.data_like_options = data.details.data_like_options;

          this.order_id = this.order_info.order_id;
          this.driver_id = this.order_info.driver_id;
          this.is_review = data.details.is_review;
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
          this.modal = false;
          if (!this.is_review) {
            this.$router.replace({
              path: "/order/write-review",
              query: {
                back_url: "/account/allorder",
                order_uuid: this.order_uuid,
              },
            });
          } else {
            APIinterface.notify(
              "light-green",
              data.msg,
              "check_circle",
              this.$q
            );
          }
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
