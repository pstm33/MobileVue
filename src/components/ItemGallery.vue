<template>
  <swiper
    :loop="false"
    slidesPerView="auto"
    :space-between="10"
    class="q-mb-sm"
  >
    <swiper-slide v-for="items in getData" :key="items">
      <q-responsive style="width: 55px; height: 55px">
        <q-img
          :src="items"
          class="radius8 cursor-pointer"
          fit="cover"
          spinner-color="amber"
          spinner-size="sm"
          @click="
            this.$refs.imagePreview.modal = !this.$refs.imagePreview.modal
          "
        />
      </q-responsive>
    </swiper-slide>
  </swiper>

  <ImagePreview ref="imagePreview" :gallery="getData" :title="$t('Gallery')">
  </ImagePreview>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { defineAsyncComponent } from "vue";

export default {
  name: "ItemGallery",
  props: ["item_gallery"],
  components: {
    Swiper,
    SwiperSlide,
    ImagePreview: defineAsyncComponent(() =>
      import("components/ImagePreview.vue")
    ),
  },
  computed: {
    getData() {
      return this.item_gallery;
    },
  },
  methods: {
    setImage(data) {
      this.$emit("afterSelectimage", data);
    },
  },
};
</script>

<style scoped>
.swiper-slide {
  width: auto;
}
</style>
