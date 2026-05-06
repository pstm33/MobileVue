<template>
  <swiper :loop="false" slidesPerView="auto" :space-between="10">
    <swiper-slide v-for="item in items" :key="item">
      <div @click.stop="handleClick(item)" class="text-dark cursor-pointer">
        <div class="border-grey2 radius8 relative-position">
          <q-responsive style="width: 110px; height: 90px">
            <q-img
              :src="item.url_image"
              class="radius-top10"
              fit="scale-down"
              spinner-color="amber"
              spinner-size="sm"
            />
          </q-responsive>
          <div class="q-pa-sm" style="max-width: 110px">
            <div class="text-subtitle1 ellipsis">
              {{ item.item_name }}
            </div>
            <div
              class="ellipsis-2-lines line-normal text-caption text-grey"
              v-html="item.item_description"
            ></div>
          </div>

          <div class="flex items-center justify-between q-pa-sm">
            <div class="text-subtitle2">
              {{ item.lowest_price }}
            </div>
            <div>
              <q-btn
                color="primary"
                label="Add"
                no-caps
                unelevated
                rounded
                padding="2px 7px"
                @click.stop="handleClick(item)"
              ></q-btn>
            </div>
          </div>
          <!-- flex -->
        </div>
      </div>
    </swiper-slide>
  </swiper>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

export default {
  name: "CarouselItems",
  props: ["items"],
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    return {};
  },
  methods: {
    handleClick(value) {
      console.log("value", value.slug);
      this.$router.push({
        name: "menu",
        params: {
          slug: value.slug,
          item_uuid: value.item_uuid,
          cat_id: value.cat_id,
        },
      });
    },
  },
};
</script>

<style scoped>
.swiper-slide {
  width: auto;
}
</style>
