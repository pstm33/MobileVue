<template>
  <swiper
    :slides-per-view="2"
    :space-between="10"
    @swiper="onSwiper"
    @slideChange="onSlideChange"
    class="q-mb-md tagam-merchant-promo"
  >
    <swiper-slide v-for="(items, index) in data" :key="items">
      <div
        @click="showDetails(index)"
        class="tagam-merchant-promo__card cursor-pointer"
      >
        <div class="tagam-merchant-promo__title">{{ items.title }}</div>
        <div class="tagam-merchant-promo__date">{{ items.valid_to }}</div>
      </div>
    </swiper-slide>
  </swiper>

  <q-dialog v-model="modal" position="bottom">
    <q-card>
      <q-card-section class="q-pl-md">
        <div
          class="row items-center q-gutter-sm q-mb-sm q-pb-sm border-bottom text-subtitle2"
        >
          <div class="col-1">
            <q-chip
              size="md"
              :text-color="$q.dark.mode ? 'grey300' : 'secondary'"
              :icon="
                data?.[selected_index]?.discount_type == 'voucher'
                  ? 'o_discount'
                  : 'o_percent'
              "
              class="no-padding transparent"
            ></q-chip>
          </div>
          <div class="col">
            {{ data?.[selected_index]?.discount_name }}
          </div>
        </div>
        <div class="text-grey text-caption">
          {{ data?.[selected_index]?.valid_to }}
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

export default {
  name: "MerchantPromoSlide",
  props: ["data"],
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      modal: false,
      selected_index: 0,
    };
  },
  methods: {
    showDetails(value) {
      this.selected_index = value;
      this.modal = true;
    },
  },
};
</script>

<style scoped>
.tagam-merchant-promo__card {
  min-height: 72px;
  padding: 10px 12px;
  border-radius: 18px;
  background: #fffaf3;
  border: 1px solid rgba(113, 74, 24, 0.08);
}

.tagam-merchant-promo__title {
  font-size: 13px;
  line-height: 1.25;
  font-weight: 800;
  color: #20160f;
}

.tagam-merchant-promo__date {
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.2;
  color: #6f6254;
}
</style>
