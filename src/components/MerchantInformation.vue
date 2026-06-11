<template>
  <q-dialog
    v-model="modal"
    maximized
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="beforeShow"
  >
    <q-card class="no-shadow tagam-text-main tagam-merchant-about">
      <div class="fixed-top tagam-merchant-about-header z-top">
        <q-toolbar class="tagam-merchant-about-toolbar">
          <q-btn icon="close" flat round dense v-close-popup class="tagam-icon-btn"></q-btn>
          <q-toolbar-title class="text-subtitle2 text-weight-bold">
            {{ $t("About") }}
          </q-toolbar-title>
        </q-toolbar>
      </div>
      <q-space style="height: 50px"></q-space>
      <q-card-section class="tagam-merchant-about-content">
        <div class="tagam-merchant-about-title">{{ data?.merchant?.restaurant_name }}</div>
        <div
          class="tagam-merchant-about-cuisine"
          v-html="data?.merchant?.cuisine2"
        ></div>

        <div class="tagam-merchant-about-rating">
          <div class="tagam-merchant-about-score">
            <div class="tagam-merchant-about-number">
              {{ data?.merchant?.ratings }}
            </div>
            <q-rating
              :model-value="data?.merchant?.ratings || 0"
              size="1em"
              color="disabled"
              color-selected="amber-5"
              icon="star"
              icon-selected="star"
            />
            <div class="tagam-merchant-about-review-count">
              {{ data?.merchant?.review_words }}
            </div>
          </div>
          <div class="tagam-merchant-about-bars">
            <div v-for="n in 5" :key="n" class="tagam-merchant-about-bar-row">
                <div class="tagam-merchant-about-bar-label">
                  {{ 6 - n }}
                </div>
                <div class="tagam-merchant-about-bar-track">
                  <q-slider
                    dense
                    :model-value="ratings[6 - n]"
                    color="amber"
                    track-color="grey-3"
                    readonly
                    :min="0"
                    :max="100"
                    thumb-size="0"
                  />
                </div>
            </div>
          </div>
        </div>

        <ReviewCarousel
          class="tagam-merchant-about-reviews"
          :merchant_id="data?.merchant?.merchant_id || null"
          :data="data?.partial_review || []"
        ></ReviewCarousel>

        <div class="tagam-merchant-about-sections">
          <section class="tagam-merchant-about-section">
            <div class="tagam-merchant-about-section-title">
              <q-icon name="storefront" />
              <span>{{ $t("Few words about") }} {{ data?.merchant?.restaurant_name }}</span>
            </div>
            <TextComponents
              :description="localizedShortDescription"
              max_lenght="200"
              class_name="tagam-merchant-about-text line-normal"
              :label="{
                read_less: $t('Read less'),
                read_more: $t('Read More'),
              }"
            >
            </TextComponents>
          </section>
          <section class="tagam-merchant-about-section">
            <div class="row q-col-gutter-md">
              <div class="col">
                <div class="tagam-merchant-about-section-title">
                  <q-icon name="place" />
                  <span>{{ $t("Address") }}</span>
                </div>
                <div class="tagam-merchant-about-text line-normal">
                  {{ data?.merchant?.address }}
                </div>
              </div>
              <div class="col-4">
                <q-responsive style="height: 100px">
                  <q-img
                    v-if="merchantMapPreview"
                    :src="merchantMapPreview"
                    lazy
                    fit="cover"
                    class="tagam-merchant-about-map"
                    spinner-color="amber"
                    spinner-size="sm"
                  />
                  <div
                    v-else
                    class="tagam-merchant-about-map tagam-merchant-about-map-empty"
                  >
                    <q-icon name="place" />
                  </div>
                </q-responsive>
              </div>
            </div>
          </section>

          <section class="tagam-merchant-about-section">
            <div class="tagam-merchant-about-section-title">
              <q-icon name="schedule" />
              <span>{{ $t("Opening hours") }}</span>
            </div>

            <q-list class="tagam-merchant-about-list">
              <q-expansion-item
                expand-separator
                :label="$t('Today')"
                :caption="formatBusinessHours(data?.open_at) || $t('Closed')"
              >
                <q-card
                  :class="{
                    'tagam-surface-elevated text-white': $q.dark.mode,
                    'tagam-surface tagam-text-main': !$q.dark.mode,
                  }"
                >
                  <q-card-section>
                    <q-list dense class="text-body2 tagam-text-muted">
                      <q-item
                        v-for="items in data?.opening_hours"
                        :key="items"
                        style="padding: 0px !important; min-height: 0"
                      >
                        <q-item-section class="text-capitalize">{{
                          items.value
                        }}</q-item-section>
                        <q-item-section caption
                          >{{ formatBusinessHours(items.start_time) }} -
                          {{ formatBusinessHours(items.end_time) }}
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </section>

          <section class="tagam-merchant-about-section">
            <div class="tagam-merchant-about-section-title">
              <q-icon name="photo_library" />
              <span>{{ $t("Gallery") }}</span>
            </div>
            <div
              class="tagam-merchant-about-gallery"
              @click="this.$refs.ref_image.modal = !this.$refs.ref_image.modal"
            >
              <template v-for="items in data?.gallery" :key="items">
                <figure class="tagam-merchant-about-gallery-item">
                  <div>
                    <q-responsive style="width: 100%; height: 92px">
                      <q-img
                        :src="items.thumbnail"
                        lazy
                        fit="cover"
                        class="tagam-merchant-about-gallery-img"
                        spinner-color="amber"
                        spinner-size="sm"
                      />
                    </q-responsive>
                  </div>
                </figure>
              </template>
            </div>
          </section>
        </div>
        <!-- end gutter -->
      </q-card-section>
    </q-card>
  </q-dialog>

  <ImagePreview ref="ref_image" :gallery="getGallery" :title="$t('Gallery')">
  </ImagePreview>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStore } from "src/stores/DataStore";
import {
  formatReadableDateTime,
  repairMojibake,
} from "src/utils/textEncoding";

export default {
  name: "MerchantInformation",
  props: ["data"],
  components: {
    TextComponents: defineAsyncComponent(() =>
      import("src/components/TextComponents.vue")
    ),
    ImagePreview: defineAsyncComponent(() =>
      import("src/components/ImagePreview.vue")
    ),
    ReviewCarousel: defineAsyncComponent(() =>
      import("src/components/ReviewCarousel.vue")
    ),
  },
  data() {
    return {
      modal: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  computed: {
    localizedShortDescription() {
      const value = repairMojibake(this.data?.merchant?.short_description || "");
      if (!value) {
        return null;
      }
      return this.$t(value);
    },
    merchantMapPreview() {
      const merchant = this.data?.merchant || {};
      if (merchant.static_maps) {
        return merchant.static_maps;
      }

      const lat = merchant.latitude || merchant.lat || merchant.merchant_latitude;
      const lng =
        merchant.longitude || merchant.lng || merchant.merchant_longitude;
      const key = this.DataStore?.maps_config?.key;

      if (!lat || !lng || !key) {
        return null;
      }

      const marker = `${lat},${lng}`;
      const params = new URLSearchParams({
        center: marker,
        zoom: "15",
        size: "360x220",
        scale: "2",
        maptype: "roadmap",
        key,
      });
      params.append("markers", `color:red|${marker}`);
      return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
    },
    ratings() {
      if (!this.data) {
        return;
      }
      return this.data?.review_details ?? null;
    },
    getGallery() {
      const gallery = this.data?.gallery || null;
      if (!gallery) {
        return;
      }
      let list = [];
      if (gallery.length > 0) {
        Object.entries(gallery).forEach(([key, items]) => {
          list.push(items.image_url);
        });
      }
      return list;
    },
  },
  methods: {
    formatBusinessHours(value) {
      return formatReadableDateTime(value || "");
    },
    beforeShow() {},
  },
};
</script>





