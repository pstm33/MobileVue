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
        <div class="tagam-section-kicker">
          {{ $t("Restaurants") }}
        </div>
        <div class="tagam-section-title text-h6 text-weight-medium">
          {{ title }}
        </div>
      </div>
      <div class="col text-right">
        <q-btn
          :to="{
            name: 'feed',
            query: { query: 'featured', featured_id: featured_id },
          }"
          :color="$q.dark.mode ? 'grey300' : 'orange-5'"
          icon="eva-arrow-forward-outline"
          no-caps
          dense
          unelevated
          round
        />
      </div>
    </div>

    <swiper
      :slidesPerView="$q.screen.lt.sm ? 1.35 : 2.5"
      :spaceBetween="12"
      :loop="false"
      @swiper="onSwiper"
    >
      <swiper-slide v-for="items in getData" :key="items">
        <router-link
          :to="{ name: 'menu', params: { slug: items.restaurant_slug } }"
          class="tagam-resto-tile tagam-text-main"
        >
          <div class="tagam-resto-carousel-media relative-position q-mb-sm">
            <q-img
              :src="
                items.url_banner ||
                items.url_header ||
                items.header_image ||
                items.url_image ||
                ''
              "
              class="tagam-restaurant-cover-stretch"
              :ratio="2"
              fit="fill"
              spinner-color="primary"
              spinner-size="xs"
            />

            <template v-if="items.open_status == 0">
              <div class="absolute-full light-dimmed"></div>
            </template>

            <div class="tagam-resto-carousel-shade"></div>

            <div class="tagam-restaurant-cover-fav" @click.prevent.stop>
              <FavsResto
                :data="items"
                :active="items.saved_store == 1 ? true : false"
                :merchant_id="items.merchant_id"
                size="sm"
              />
            </div>
          </div>

          <div class="tagam-resto-carousel-heading">
            <div class="col">
              <div class="tagam-resto-carousel-title text-subtitle1 ellipsis">
                {{ items.restaurant_name }}
              </div>
            </div>
            <div
              v-if="items.url_logo"
              class="tagam-resto-carousel-logo tagam-restaurant-logo-stretch"
            >
              <img class="fit" :src="items.url_logo" alt="" />
            </div>
          </div>

          <div class="tagam-text-muted text-caption line-normal line-1 ellipsis">
            <template
              v-for="(cuisine_name, index) in items.cuisine"
              :key="cuisine_name"
            >
              {{ cuisine_name
              }}<span v-if="index < items.cuisine.length - 1">, </span>
            </template>
          </div>

          <div class="flex items-center justify-between tagam-resto-carousel-meta">
            <div>
              <template v-if="DataStore.enabled_review">
                <q-chip
                  size="sm"
                  color="secondary"
                  :text-color="$q.dark.mode ? 'grey300' : 'primary'"
                  icon="star_border"
                  class="no-padding q-ma-none transparent"
                >
                  <span
                    class="text-caption"
                    :class="{
                      'tagam-text-muted': $q.dark.mode,
                      'tagam-text-main': !$q.dark.mode,
                    }"
                  >
                    <template v-if="items.reviews">
                      {{ items.reviews.ratings }}
                    </template>
                    <template v-else> 0.0 </template>
                  </span>
                </q-chip>
              </template>
            </div>

            <div>
              <template v-if="items.estimation">
                <q-chip
                  size="xs"
                  :text-color="$q.dark.mode ? 'grey300' : 'primary'"
                  icon="schedule"
                  class="no-padding transparent"
                >
                  <span
                    class="text-caption"
                    :class="{
                      'tagam-text-muted': $q.dark.mode,
                      'tagam-text-main': !$q.dark.mode,
                    }"
                  >
                    {{ items.estimation }} {{ $t("min") }}</span
                  >
                </q-chip>
              </template>
            </div>

            <div class="text-caption">
              <div>{{ items.distance_short }}</div>
            </div>
          </div>

          <template v-if="items?.promo_list">
            <div class="ellipsis q-gutter-x-sm">
              <template v-for="promo in items.promo_list" :key="promo">
                <q-badge
                  color="orange-1"
                  text-color="orange-5"
                  rounded
                  style="font-size: 0.7em"
                >
                  {{ promo?.discount || "" }}
                </q-badge>
              </template>
            </div>
          </template>
        </router-link>
      </swiper-slide>
    </swiper>
  </template>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { defineAsyncComponent } from "vue";
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
    "location_data",
  ],
  name: "MerchantCarousel",
  components: {
    Swiper,
    SwiperSlide,
    FavsResto: defineAsyncComponent(() => import("components/FavsResto.vue")),
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
      swiperInstance: null,
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
      return this.DataStore.car_data?.[this.index]?.length > 0;
    },
    getData() {
      return this.DataStore.car_data?.[this.index] ?? null;
    },
  },
  methods: {
    onSwiper(swiper) {
      this.swiperInstance = swiper;
    },
    refreshData(coordinates) {
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
        this.DataStore.car_data[this.index] = null;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.tagam-resto-carousel-media
  aspect-ratio: 2 / 1
  width: 100%
  border-radius: 20px
  overflow: hidden
  background: var(--tagam-surface-muted)

.tagam-resto-carousel-media .q-img
  border-radius: 0 !important

.tagam-resto-carousel-shade
  position: absolute
  inset: auto 0 0 0
  height: 50%
  pointer-events: none
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.32) 100%)

.tagam-resto-carousel-logo
  position: absolute
  left: 8px
  bottom: 8px
  width: 34px
  height: 34px
  aspect-ratio: 1 / 1
  border-radius: 10px
  overflow: hidden
  border: 2px solid var(--tagam-surface)
  background: var(--tagam-surface)
  box-shadow: 0 7px 16px rgba(22, 28, 45, 0.18)

.tagam-resto-carousel-logo img
  display: block
  width: 100%
  height: 100%
  object-fit: fill

.tagam-resto-carousel-title
  line-height: 1.15
  margin-top: 2px

.tagam-resto-carousel-meta
  gap: 6px
</style>






