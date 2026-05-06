<template>
  <div v-if="loading" class="row q-gutter-sm items-center">
    <div v-for="i in 3" :key="i" class="col">
      <q-skeleton height="90px" class="full-width" />
      <q-skeleton type="text" class="w-75" />
      <q-skeleton type="text" class="w-100" />
    </div>
  </div>
  <template v-else>
    <div v-if="hasResults" class="row q-mb-sm items-center">
      <div class="col">
        <div class="tagam-carousel-title">
          {{ title }}
        </div>
      </div>
    </div>

    <swiper
      :slidesPerView="$q.screen.lt.sm ? 2.3 : 3.3"
      :spaceBetween="10"
      :loop="false"
      @swiper="onSwiper"
    >
      <swiper-slide v-for="items in getData" :key="items">
        <router-link
          :to="{ name: 'menu', params: { slug: items.restaurant_slug } }"
          class="text-dark tagam-carousel-link"
        >
          <div class="border-grey2 radius8 relative-position tagam-carousel-card">
            <div class="tagam-carousel-media-wrap">
              <q-responsive :ratio="1" class="tagam-carousel-media">
                <q-img
                  :src="merchantLogo(items)"
                  class="tagam-carousel-image"
                  fit="fill"
                  spinner-color="primary"
                  spinner-size="xs"
                />
              </q-responsive>

              <template v-if="items.open_status == 0">
                <div
                  class="absolute-top light-dimmed"
                  style="inset: 0"
                ></div>
              </template>
            </div>

            <div class="tagam-carousel-content">
              <div class="ellipsis tagam-carousel-name">
                {{ items.restaurant_name }}
              </div>

              <div class="text-grey line-normal line-1 ellipsis tagam-carousel-cuisine">
                <template
                  v-for="(cuisine_name, index) in items.cuisine"
                  :key="cuisine_name"
                >
                  {{ cuisine_name
                  }}<span v-if="index < items.cuisine.length - 1">, </span>
                </template>
              </div>

              <div class="flex items-center justify-between tagam-carousel-meta-row">
                <div class="tagam-carousel-stat">
                  <q-icon
                    name="star_border"
                    size="16px"
                    color="primary"
                    class="tagam-carousel-stat__icon"
                  />
                  <span class="tagam-carousel-stat__value">
                    <template v-if="items.reviews">
                      {{ items.reviews.ratings }}
                    </template>
                    <template v-else>0.0</template>
                  </span>
                </div>

                <div class="tagam-carousel-stat tagam-carousel-stat--muted">
                  <span class="tagam-carousel-stat__value">
                    {{ items.distance_short || items.estimation || "" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </router-link>
      </swiper-slide>
    </swiper>
  </template>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";

export default {
  props: [
    "list_type",
    "featured_id",
    "filters",
    "index",
    "title",
    "coordinates",
    "preview_items",
  ],
  name: "MerchantCarousel",
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      loading: false,
      slide: 0,
      data: [],
      cuisine: [],
      reviews: [],
      estimation: [],
      services: [],
      items_min_max: [],
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  mounted() {
    if (
      !this.DataStore.car_data?.[this.index] ||
      Object.keys(this.DataStore.car_data[this.index]).length === 0
    ) {
      this.fetchData();
    }
  },
  computed: {
    hasResults() {
      return this.getData?.length > 0;
    },
    getData() {
      const storeData = this.DataStore.car_data?.[this.index];
      if (storeData?.length > 0) {
        return storeData;
      }
      return this.preview_items ?? [];
    },
  },
  methods: {
    merchantImage(items) {
      return (
        items?.url_header ||
        items?.featured_image ||
        items?.cover_image ||
        items?.merchant_cover ||
        items?.cover ||
        items?.url_cover ||
        items?.url_banner ||
        items?.banner_image ||
        items?.url_featured ||
        items?.url_photo ||
        items?.image ||
        items?.image_url ||
        items?.url_logo ||
        items?.logo_url ||
        items?.logo ||
        ""
      );
    },
    merchantLogo(items) {
      return (
        items?.image ||
        items?.image_url ||
        items?.url_logo ||
        items?.logo_url ||
        items?.logo ||
        this.merchantImage(items)
      );
    },
    refreshData(coordinates) {
      console.log("refreshData1 carousel");
      this.DataStore.car_data[this.index] = null;
      this.fetchData();
    },
    async fetchData() {
      try {
        this.loading = true;
        const params = {
          list_type: this.list_type,
          featured_id: this.featured_id,
          coordinates: this.coordinates,
          rows: 0,
          payload: [
            "cuisine",
            "reviews",
            "estimation",
            "services",
            "items_min_max",
            "promo",
          ],
          filters: this.filters,
        };
        const response = await APIinterface.getMerchantFeed(params);
        this.DataStore.car_data[this.index] = response.details.data;
      } catch (error) {
        console.log("error merchant carousel ", error);
        this.DataStore.car_data[this.index] = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.tagam-carousel-title {
  font-size: 20px;
  line-height: 1.1;
  font-weight: 900;
  color: #1f1f1f;
}

.tagam-carousel-link {
  display: block;
}

.tagam-carousel-card {
  display: block;
  height: 166px;
  background: rgba(255, 252, 247, 0.82);
  border-color: rgba(113, 74, 24, 0.1) !important;
}

.tagam-carousel-media-wrap {
  width: 104px;
  max-width: 100%;
  margin: 8px auto 0;
}

.tagam-carousel-media {
  border-radius: 18px;
  overflow: hidden;
  background: #fff8ef;
}

.tagam-carousel-image {
  border-radius: 18px;
  border: 1px solid rgba(113, 74, 24, 0.1);
}

.tagam-carousel-content {
  padding: 10px 10px 8px;
  display: flex;
  flex-direction: column;
  min-height: 62px;
}

.tagam-carousel-name {
  font-weight: 700;
  color: #22160f;
  font-size: 13px;
  line-height: 1.2;
  margin-bottom: 2px;
}

.tagam-carousel-cuisine {
  color: #7a6959;
  font-size: 11px;
  line-height: 1.15;
  min-height: 22px;
}

.tagam-carousel-meta-row {
  margin-top: 2px;
  min-height: 20px;
  margin-top: auto;
}

.tagam-carousel-stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.tagam-carousel-stat__icon {
  flex: 0 0 auto;
}

.tagam-carousel-stat__value {
  color: #7a6959;
  font-weight: 700;
  font-size: 11px;
  line-height: 1;
}

.tagam-carousel-stat--muted .tagam-carousel-stat__value {
  font-weight: 600;
}
</style>
