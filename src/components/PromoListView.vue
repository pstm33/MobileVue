<template>
  <div class="max-width" style="width: 100%">
    <swiper :loop="false" slidesPerView="auto" :space-between="10">
      <template v-for="items in data" :key="items">
        <swiper-slide>
          <div class="border-grey2 q-pa-sm radius8 cursor-pointer">
            <q-chip
              size="sm"
              :text-color="$q.dark.mode ? 'grey300' : 'secondary'"
              class="no-padding transparent"
              :icon="items.promo_type == 'voucher' ? 'o_discount' : 'o_percent'"
            >
              <div
                class="text-caption ellipsis word-wrap"
                :class="{
                  'text-grey300': $q.dark.mode,
                  'text-dark': !$q.dark.mode,
                }"
              >
                <div>{{ items.title }}</div>
                <div class="text-grey">
                  {{ items?.valid_to ?? items?.min_order }}
                </div>
              </div>
            </q-chip>
          </div>
        </swiper-slide>
      </template>
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

export default {
  name: "PromoListView",
  props: ["data"],
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    return {};
  },
};
</script>

<style scoped>
.swiper-slide {
  width: auto;
  margin-right: 10px !important;
}

@media (max-width: 375px) {
  /* This will include iPhone SE 2/3 and similar small phones */
  .max-width {
    max-width: 180px !important;
  }
}
@media (max-width: 320px) {
  /* Extremely small screens like iPhone SE (1st gen) */
  .max-width {
    max-width: 150px !important;
  }
}
</style>
