<template>
  <div class="q-mb-lg" v-if="hasData">
    <div class="flex items-center justify-between q-mb-md">
      <div class="text-weight-bold text-subtitle1">
        {{ $t("Customer Reviews") }}
      </div>
      <div>
        <q-btn
          color="orange-5"
          icon="eva-arrow-forward-outline"
          no-caps
          dense
          unelevated
          round
          :to="{ path: '/menu/review', query: { id: merchant_id } }"
        />
      </div>
    </div>

    <swiper :slidesPerView="1.2" :spaceBetween="2">
      <swiper-slide v-for="items in data" :key="items">
        <q-card class="radius8 myshadow-1 q-ma-sm">
          <q-card-section>
            <div class="ellipsis-2-lines" style="height: 40px">
              {{ items.review }}
            </div>
            <q-space class="q-pa-sm"></q-space>
            <div
              class="flex items-center q-gutter-x-xs text-caption text-grey300"
            >
              <div>
                <q-rating
                  :model-value="items.rating || 0"
                  size="0.9em"
                  color="disabled"
                  color-selected="amber-5"
                  icon="star"
                  icon-selected="star"
                  :max="1"
                />
              </div>
              <div>{{ items.rating }}</div>
              <div>&bull;</div>
              <div>
                {{
                  items.as_anonymous == 1
                    ? items.hidden_fullname
                    : items.fullname
                }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

export default {
  name: "ReviewCarousel",
  props: ["data", "merchant_id"],
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    return {};
  },
  computed: {
    hasData() {
      return Object.keys(this.data).length > 0;
    },
  },
};
</script>
