<template>
  <div v-if="loading" class="row q-gutter-sm items-center">
    <div v-for="i in 3" :key="i" class="col">
      <q-skeleton height="90px" class="full-width" />
      <q-skeleton type="text" class="w-75" />
      <q-skeleton type="text" class="w-100" />
    </div>
  </div>
  <template v-else>
    <div v-if="hasResults" class="row q-mb-sm">
      <div class="col">
        <div class="text-h6 text-weight-medium">
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
                  spinner-size="sm"
                />
              </q-responsive>
              <template v-if="!items.open_status">
                <div
                  class="absolute-top light-dimmed"
                  style="inset: 0"
                ></div>
              </template>
            </div>

            <div class="tagam-carousel-content">
              <div class="ellipsis tagam-carousel-name">{{ items.restaurant_name }}</div>
              <div class="text-grey line-normal line-1 ellipsis tagam-carousel-cuisine">
                {{ items.cuisines }}
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
                    <template v-if="items.review_count">
                      {{ items.review_count }}
                    </template>
                    <template v-else>0.0</template>
                  </span>
                </div>

                <div class="tagam-carousel-stat tagam-carousel-stat--muted">
                  <span class="tagam-carousel-stat__value">
                    {{ items.estimated_time_min || "" }}
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
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "stores/DataStore";
import config from "src/api/config";
import APIinterface from "src/api/APIinterface";

export default {
  name: "MerchantCarouselLocation",
  props: [
    "list_type",
    "featured_id",
    "filters",
    "index",
    "title",
    "location_data",
    "preview_items",
  ],
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      loading: false,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    return { DataStorePersisted, DataStore };
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
    refreshData() {
      this.DataStore.car_data[this.index] = null;
      this.fetchData();
    },
    async fetchData() {
      try {
        this.loading = true;
        const params = {
          transaction_type: "",
          state_id: this.location_data?.state_id || "",
          city_id: this.location_data?.city_id || "",
          area_id: this.location_data?.area_id || "",
          state_id: this.location_data?.state_id || "",
          postal_id: this.location_data?.postal_id || "",
          featured: JSON.stringify([this.featured_id]),
        };
        const response = await APIinterface.fetchGet(
          `${config.api_location}/getfeedv1`,
          params
        );
        this.DataStore.car_data[this.index] = response.details.data;
      } catch (error) {
        this.DataStore.car_data[this.index] = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
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
  width: 100%;
  height: 100%;
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
  font-size: 13px;
  line-height: 1.2;
  font-weight: 700;
  margin-bottom: 2px;
  color: #22160f;
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
