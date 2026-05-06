<template>
  <div v-if="DataStore.loading_cuisine" class="row q-gutter-sm items-center">
    <div v-for="i in 3" :key="i" class="col">
      <q-skeleton type="QBtn" class="full-width" height="50px" />
    </div>
  </div>

  <div v-else class="tagam-cuisine-carousel">
    <swiper
      :slidesPerView="'auto'"
      :spaceBetween="10"
      class="q-mt-sm"
      @swiper="onSwiper"
    >
      <swiper-slide
        v-for="(items, index) in DataStore.cuisine"
        :key="items.cuisine_id"
        class="tagam-cuisine-slide"
      >
        <div class="tagam-cuisine-pill-link" @click="selectCuisine(items, index)">
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
  </div>
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
    };
  },
  computed: {
    activeCuisineSignature() {
      const currentCuisine = this.DataStore.feed_filter?.filters?.cuisine || [];
      return currentCuisine.map((id) => String(id)).join("|");
    },
  },
  watch: {
    activeCuisineSignature() {
      this.$nextTick(() => {
        this.syncSwiperToActiveCuisine();
      });
    },
  },
  mounted() {
    if (!this.DataStore.hasDataCuisine()) {
      this.DataStore.CuisineList();
    }

    this.$nextTick(() => {
      this.syncSwiperToActiveCuisine();
    });
  },
  methods: {
    onSwiper(swiper) {
      this.swiperRef = swiper;
      this.syncSwiperToActiveCuisine();
    },

    isActiveCuisine(items) {
      const currentCuisine = this.DataStore.feed_filter?.filters?.cuisine || [];

      return currentCuisine.some(
        (id) => String(id) === String(items.cuisine_id)
      );
    },

    selectCuisine(items, index) {
      this.$emit("select-cuisine", items);

      this.$nextTick(() => {
        if (this.swiperRef) {
          this.swiperRef.slideTo(Math.max(index - 1, 0));
        }
      });
    },

    syncSwiperToActiveCuisine() {
      if (!this.swiperRef || !Array.isArray(this.DataStore.cuisine)) {
        return;
      }

      const currentCuisine = this.DataStore.feed_filter?.filters?.cuisine || [];

      if (!currentCuisine.length) {
        this.swiperRef.slideTo(0);
        return;
      }

      const firstActiveId = String(currentCuisine[0]);
      const index = this.DataStore.cuisine.findIndex(
        (item) => String(item.cuisine_id) === firstActiveId
      );

      if (index >= 0) {
        this.swiperRef.slideTo(index);
      }
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
.tagam-cuisine-carousel {
  min-width: 0;
}

.tagam-cuisine-slide {
  width: auto !important;
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
  height: 56px;
  padding: 4px 18px 4px 4px;
  background: #ebe2cc;
  border-radius: 999px;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.tagam-cuisine-pill__icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 999px;
  background: #f6efdf;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid transparent;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.tagam-cuisine-pill__icon img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.tagam-cuisine-pill__label {
  font-size: 14px;
  line-height: 1;
  font-weight: 700;
  color: #1f1f1f;
  white-space: nowrap;
  max-width: 112px;
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
  border-color: #ffffff;
}

@media (max-width: 480px) {
  .tagam-cuisine-pill {
    height: 52px;
    padding: 3px 16px 3px 3px;
    gap: 9px;
  }

  .tagam-cuisine-pill__icon {
    width: 46px;
    height: 46px;
    min-width: 46px;
  }

  .tagam-cuisine-pill__icon img {
    width: 28px;
    height: 28px;
  }

  .tagam-cuisine-pill__label {
    font-size: 13px;
    max-width: 100px;
  }
}
</style>
