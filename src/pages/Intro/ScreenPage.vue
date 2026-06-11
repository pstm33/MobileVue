<template>
  <q-page padding class="flex flex-center tagam-intro-screen-page">
    <div class="full-width">
      <swiper
        ref="swiperRef"
        :slides-per-view="1"
        :space-between="10"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
        class="q-mb-md"
        :modules="modules"
        :pagination="{
          el: '.custom-pagination',
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class='${className}'></span>`;
          },
        }"
      >
        <swiper-slide v-for="items in data" :key="items">
          <OrderStatusAnimation :status="items.file" style="height: 180px" />
          <q-card-section>
            <div class="text-center fit q-pt-lg">
              <div class="text-weight-bold text-h6 q-mb-sm line-normal">
                {{ items.title }}
              </div>
              <div
                class="text-weight-medium text-subtitle2 tagam-text-muted line-normal"
              >
                {{ items.sub_title }}
              </div>
            </div>
          </q-card-section>
        </swiper-slide>
      </swiper>
    </div>
    <q-footer class="tagam-surface tagam-text-main q-pa-md flex flex-center">
      <div class="text-center">
        <div class="custom-pagination"></div>
        <q-btn @click="onclick" flat no-caps color="primary" padding="5px 20px">
          <div class="text-weight-bold text-subtitle2">
            {{ slide == 2 ? $t("Continue") : $t("Skip") }}
          </div>
        </q-btn>
      </div>
    </q-footer>
  </q-page>
</template>

<script>
import { Swiper, SwiperSlide, useSwiper } from "swiper/vue";
import { ref } from "vue";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useLocationStore } from "stores/LocationStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "ScreenPage",
  components: {
    Swiper,
    SwiperSlide,
    OrderStatusAnimation: defineAsyncComponent(() =>
      import("components/OrderStatusAnimation.vue")
    ),
  },
  data() {
    return {
      data: [
        {
          image: "onboarding-1.svg",
          file: "discover",
          title: this.$t("Discover Places near you"),
          sub_title: this.$t("onboarding_sub_title1"),
        },
        {
          image: "onboarding-2.svg",
          file: "customize",
          title: this.$t("Order your customized items"),
          sub_title: this.$t("onboarding_sub_title2"),
        },
        {
          image: "onboarding-3.svg",
          file: "delivering",
          title: this.$t("Faster delivery"),
          sub_title: this.$t("onboarding_sub_title3"),
        },
      ],
    };
  },
  computed: {
    getSearchMode() {
      return this.DataStore.attributes_data?.search_mode || null;
    },
  },
  created() {
    this.$i18n.locale = this.$i18n.locale;
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const LocationStore = useLocationStore();
    const swiperRef = ref();
    const slide = ref(0);

    const nextSlide = () => {
      swiperRef.value.$el.swiper.slideNext();
    };

    const onSlideChange = (data) => {
      slide.value = data.activeIndex;
    };

    return {
      slide,
      swiperRef,
      nextSlide,
      onSlideChange,
      modules: [Pagination],
      DataStore,
      DataStorePersisted,
      LocationStore,
    };
  },
  methods: {
    onclick() {
      if (this.getSearchMode == "location") {
        this.home();
      } else {
        this.getLocation();
      }
    },
    async getLocation() {
      try {
        this.DataStorePersisted.intro = 1;

        APIinterface.showLoadingBox("", this.$q);
        let location = null;
        if (this.$q.capacitor) {
          location = await this.LocationStore.fetchLocation(this.$t);
        } else {
          location = await this.LocationStore.fetchWebLocation(this.$t);
        }

        if (!location) {
          APIinterface.hideLoadingBox(this.$q);
          this.$router.replace("/location/map");
          return;
        }

        const place_data = await this.LocationStore.reverseGeocoding(
          location.latitude,
          location.longitude
        );
        APIinterface.hideLoadingBox(this.$q);
        this.DataStorePersisted.place_data = place_data;
        this.DataStorePersisted.coordinates = {
          lat: location.latitude,
          lng: location.longitude,
        };
        this.DataStorePersisted.saveRecentAddress(place_data);
        this.home();
      } catch (error) {
        APIinterface.hideLoadingBox(this.$q);
        this.$router.replace("/location/map");
      }
    },
    home() {
      this.DataStorePersisted.intro = 1;

      if (
        this.DataStorePersisted.choose_language == false &&
        this.DataStore.enabled_language == true
      ) {
        this.$router.replace("/select-language");
      } else {
        this.$router.replace("/home");
      }
    },
    login() {
      this.DataStorePersisted.intro = 1;
      if (
        this.DataStorePersisted.choose_language == false &&
        this.DataStore.enabled_language == true
      ) {
        this.$router.replace("/select-language");
      } else {
        this.$router.replace("/user/login");
      }
    },
  },
};
</script>
<style>
.swiper-pagination-bullet-active {
  background: var(--tagam-primary) !important;
}
</style>






