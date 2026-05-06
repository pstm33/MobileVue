<template>
  <q-page class="tagam-intro-page">
    <div class="tagam-intro-shell">
      <header class="tagam-intro-header">
        <img src="/tagam-logo.svg" alt="Tagam" class="tagam-intro-logo" />
        <q-btn flat no-caps class="tagam-intro-language-btn">
          <q-icon name="language" size="16px" class="q-mr-xs" />
          <span>{{ currentLanguageLabel }}</span>
          <q-menu
            class="tagam-intro-language-menu"
            anchor="bottom right"
            self="top right"
          >
            <q-list dense>
              <q-item
                v-for="language in languages"
                :key="language.code"
                clickable
                v-close-popup
                class="tagam-intro-language-item"
                @click="setIntroLanguage(language)"
              >
                <q-item-section avatar>
                  <q-avatar square size="24px">
                    <q-img
                      :src="language.flag"
                      spinner-size="sm"
                      spinner-color="primary"
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ language.title }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </header>

      <swiper
        ref="swiperRef"
        :slides-per-view="1"
        :space-between="14"
        :speed="700"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
        class="tagam-intro-swiper"
        :modules="modules"
        :pagination="{
          el: '.custom-pagination',
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class='${className}'></span>`;
          },
        }"
      >
        <swiper-slide
          v-for="item in slides"
          :key="item.file"
          class="tagam-intro-slide"
        >
          <div class="tagam-intro-visual">
            <div class="tagam-intro-visual__glow"></div>
            <OrderStatusAnimation
              :status="item.file"
              :style="{ height: '250px', transform: 'scale(1.18)' }"
            />
          </div>

          <div class="tagam-intro-copy">
            <h1 class="tagam-intro-title">{{ item.title }}</h1>
            <p class="tagam-intro-subtitle">{{ item.sub_title }}</p>
          </div>
        </swiper-slide>
      </swiper>
    </div>

    <q-footer class="tagam-intro-footer">
      <div class="tagam-intro-footer__inner">
        <div class="custom-pagination"></div>
        <q-btn
          @click="onclick"
          unelevated
          no-caps
          class="tagam-intro-footer__btn"
        >
          <span>{{ slide === slides.length - 1 ? $t("Continue") : $t("Skip") }}</span>
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
import { api } from "boot/axios";

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
      slideItems: [
        {
          file: "discover",
          title_key: "Discover Places near you",
          sub_title_key: "onboarding_sub_title1",
        },
        {
          file: "customize",
          title_key: "Order your customized items",
          sub_title_key: "onboarding_sub_title2",
        },
        {
          file: "delivering",
          title_key: "Faster delivery",
          sub_title_key: "onboarding_sub_title3",
        },
      ],
    };
  },
  computed: {
    getSearchMode() {
      return this.DataStore.attributes_data?.search_mode || null;
    },
    languages() {
      return this.DataStore?.language_data?.data || [];
    },
    currentLanguageLabel() {
      const current = this.languages.find(
        (item) => item.code === this.DataStorePersisted.app_language
      );
      return current?.title || this.$t("Select Language");
    },
    slides() {
      return this.slideItems.map((item) => ({
        ...item,
        title: this.$t(item.title_key),
        sub_title: this.$t(item.sub_title_key),
      }));
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
    setIntroLanguage(language) {
      this.DataStorePersisted.choose_language = true;
      this.DataStorePersisted.app_language = language.code;
      this.$i18n.locale = language.code;
      api.defaults.params = {
        ...(api.defaults.params || {}),
        language: this.$i18n.locale,
      };
      this.setRTL(language);
    },
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
    setRTL(language) {
      if (language?.rtl == 1) {
        this.$q.lang.set({ rtl: true });
        this.DataStorePersisted.rtl = true;
      } else {
        this.$q.lang.set({ rtl: false });
        this.DataStorePersisted.rtl = false;
      }
    },
  },
};
</script>
<style>
.tagam-intro-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(241, 136, 0, 0.1), transparent 24%),
    linear-gradient(180deg, #fffdfa 0%, #fff8f1 100%);
}

.tagam-intro-shell {
  min-height: 100vh;
  max-width: 520px;
  margin: 0 auto;
  padding: 28px 22px 144px;
}

.tagam-intro-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.tagam-intro-logo {
  width: 170px;
  height: auto;
  display: block;
}

.tagam-intro-language-btn {
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(36, 25, 21, 0.08);
  background: rgba(255, 248, 240, 0.94);
  color: #8f8177 !important;
  font-size: 13px;
  font-weight: 700;
}

.tagam-intro-language-menu {
  border-radius: 18px;
  overflow: hidden;
}

.tagam-intro-language-item {
  min-width: 180px;
}

.tagam-intro-swiper {
  margin-top: 12px;
}

.tagam-intro-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tagam-intro-visual {
  position: relative;
  width: 100%;
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tagam-intro-visual__glow {
  position: absolute;
  inset: 16% 18% 18%;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(241, 136, 0, 0.12) 0%, rgba(241, 136, 0, 0.02) 58%, transparent 72%);
  filter: blur(10px);
}

.tagam-intro-copy {
  width: 100%;
  max-width: 360px;
  margin: 4px auto 0;
  text-align: center;
}

.tagam-intro-title {
  margin: 0;
  color: #241915;
  font-size: 38px;
  line-height: 0.98;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.tagam-intro-subtitle {
  margin: 14px 0 0;
  color: #8f8177;
  font-size: 16px;
  line-height: 1.6;
  font-weight: 500;
}

.tagam-intro-footer {
  background: transparent;
  color: #241915;
  box-shadow: none;
}

.tagam-intro-footer__inner {
  max-width: 520px;
  margin: 0 auto;
  padding: 10px 22px 24px;
  display: grid;
  justify-items: center;
  gap: 10px;
}

.tagam-intro-footer__btn {
  min-height: 48px;
  padding: 0 22px;
  border-radius: 999px;
  background: transparent !important;
  color: #f18800 !important;
  font-size: 18px;
  font-weight: 800;
}

.swiper-pagination-bullet-active {
  background: #ff724c !important;
}

.custom-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.swiper-pagination-bullet {
  width: 9px;
  height: 9px;
  margin: 0 !important;
  background: rgba(36, 25, 21, 0.18);
  opacity: 1;
}

.swiper-pagination-bullet-active {
  width: 26px;
  border-radius: 999px;
  background: #f18800 !important;
}
</style>
