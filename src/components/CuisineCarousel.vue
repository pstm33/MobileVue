<template>
  <div v-if="DataStore.loading_cuisine" class="row q-gutter-sm items-center">
    <div v-for="i in 3" :key="i" class="col">
      <q-skeleton type="QBtn" class="full-width" height="48px" />
    </div>
  </div>

  <template v-else>
    <div class="tagam-cuisine-carousel-wrap">
      <swiper
        :slidesPerView="'auto'"
        :spaceBetween="10"
        class="q-mt-sm"
        @swiper="onSwiper"
        @slideChange="updateNavigationState"
        @reachBeginning="updateNavigationState"
        @reachEnd="updateNavigationState"
      >
        <swiper-slide
          v-for="items in DataStore.cuisine"
          :key="items.cuisine_id"
          class="tagam-cuisine-slide"
        >
          <div class="tagam-cuisine-pill-link" @click="selectCuisine(items)">
            <div
              class="tagam-cuisine-pill"
              :class="{ 'tagam-cuisine-pill--active': isActiveCuisine(items) }"
            >
              <div class="tagam-cuisine-pill__icon">
                <img
                  :src="items.url_icon || items.featured_image"
                  :alt="items.cuisine_name"
                />
              </div>

              <div class="tagam-cuisine-pill__label ellipsis">
                {{ items.cuisine_name }}
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>

      <div
        v-if="canScrollLeft"
        class="tagam-cuisine-nav tagam-cuisine-nav--left"
        @click="scrollSwiper('left')"
      >
        <q-icon name="eva-arrow-back-outline" size="18px" />
      </div>

      <div
        v-if="canScrollRight"
        class="tagam-cuisine-nav tagam-cuisine-nav--right"
        @click="scrollSwiper('right')"
      >
        <q-icon name="eva-arrow-forward-outline" size="18px" />
      </div>

      <div
        v-if="canScrollLeft"
        class="tagam-cuisine-fade tagam-cuisine-fade--left"
      ></div>
      <div
        v-if="canScrollRight"
        class="tagam-cuisine-fade tagam-cuisine-fade--right"
      ></div>
    </div>
  </template>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";

export default {
  name: "CuisineCarousel",
  emits: ["select-cuisine", "afterGetdata"],
  props: ["design", "search_mode"],
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  data() {
    return {
      slide: 0,
      data: [],
      loading: true,
      swiperRef: null,
      canScrollLeft: false,
      canScrollRight: false,
    };
  },
  mounted() {
    if (!this.DataStore.hasDataCuisine()) {
      this.DataStore.CuisineList();
    }
  },
  methods: {
    onSwiper(swiper) {
      this.swiperRef = swiper;
      this.updateNavigationState();
    },

    updateNavigationState() {
      if (!this.swiperRef) {
        this.canScrollLeft = false;
        this.canScrollRight = false;
        return;
      }

      this.canScrollLeft = !this.swiperRef.isBeginning;
      this.canScrollRight = !this.swiperRef.isEnd;
    },

    scrollSwiper(direction) {
      if (!this.swiperRef) {
        return;
      }

      if (direction === "left") {
        this.swiperRef.slidePrev();
      } else {
        this.swiperRef.slideNext();
      }

      setTimeout(() => {
        this.updateNavigationState();
      }, 250);
    },

    isActiveCuisine(items) {
      const currentCuisine = this.DataStore.feed_filter?.filters?.cuisine || [];

      return currentCuisine.some(
        (id) => String(id) === String(items.cuisine_id)
      );
    },

    selectCuisine(items) {
      this.$emit("select-cuisine", items);
    },

    getCuisineLink(items) {
      if (this.search_mode === "address") {
        return {
          name: "feed",
          query: {
            query: "all",
            cuisine_id: items.cuisine_id,
            cuisine_name: items.cuisine_name,
          },
        };
      } else if (this.search_mode === "location") {
        return {
          path: "feed/location",
          query: {
            cuisine_id: items.cuisine_id,
            cuisine_name: items.cuisine_name,
          },
        };
      }
    },

    CuisineList() {
      this.loading = true;
      APIinterface.CuisineList(4, "")
        .then((data) => {
          this.data = data.details.data;
          this.$emit("afterGetdata", data.details.data_raw);
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped>
.tagam-cuisine-carousel-wrap {
  position: relative;
}

.tagam-cuisine-slide {
  width: auto !important;
  padding: 0 !important;
}

.tagam-cuisine-pill-link {
  text-decoration: none;
  display: block;
  padding: 0;
  cursor: pointer;
}

.tagam-cuisine-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  height: 48px;
  padding: 0 16px 0 0;
  background: #e8dec8;
  border-radius: 999px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.tagam-cuisine-pill__icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 999px;
  background: #f5eddc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.tagam-cuisine-pill__icon img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.tagam-cuisine-pill__label {
  font-size: 14px;
  line-height: 1;
  font-weight: 700;
  color: #1f1f1f;
  max-width: 132px;
  transition: color 0.2s ease;
}

.tagam-cuisine-pill--active {
  background: #f18800 !important;
  box-shadow: none;
  transform: none;
}

.tagam-cuisine-pill--active .tagam-cuisine-pill__label {
  color: #ffffff !important;
  font-weight: 700;
}

.tagam-cuisine-pill--active .tagam-cuisine-pill__icon {
  background: #f18800;
  box-shadow: inset 0 0 0 2px #ffffff;
}

.tagam-cuisine-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  color: #a94b08;
  background: rgba(255, 249, 240, 0.94);
  z-index: 3;
  cursor: pointer;
}

.tagam-cuisine-nav--left {
  left: 8px;
}

.tagam-cuisine-nav--right {
  right: 8px;
}

.tagam-cuisine-fade {
  position: absolute;
  top: 0;
  width: 56px;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.tagam-cuisine-fade--left {
  left: 0;
  background: linear-gradient(
    270deg,
    rgba(246, 239, 227, 0) 0%,
    rgba(246, 239, 227, 0.7) 48%,
    rgba(246, 239, 227, 1) 100%
  );
}

.tagam-cuisine-fade--right {
  right: 0;
  background: linear-gradient(
    90deg,
    rgba(246, 239, 227, 0) 0%,
    rgba(246, 239, 227, 0.7) 48%,
    rgba(246, 239, 227, 1) 100%
  );
}

:global(body.body--dark) .tagam-cuisine-pill__label {
  color: #1f1f1f;
}

:global(body.body--dark) .tagam-cuisine-nav {
  background: rgba(255, 249, 240, 0.94);
  color: #a94b08;
}
</style>
