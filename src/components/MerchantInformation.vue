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
    <q-card class="no-shadow text-dark tagam-merchant-info">
      <div class="fixed-top bg-white text-dark z-top tagam-merchant-info__top">
        <q-toolbar class="tagam-merchant-info__toolbar">
          <q-btn icon="close" flat round dense v-close-popup></q-btn>
          <q-toolbar-title class="tagam-merchant-info__toolbar-title">
            {{ $t("About us") }}
          </q-toolbar-title>
        </q-toolbar>
      </div>
      <q-space style="height: 50px"></q-space>
      <q-card-section class="tagam-merchant-info__body">
        <div class="tagam-merchant-info__title">{{ data?.merchant?.restaurant_name }}</div>
        <div
          class="tagam-merchant-info__cuisine"
          v-html="data?.merchant?.cuisine2"
        ></div>
        <q-space class="q-pa-sm"></q-space>

        <div class="row items-start q-gutter-x-sm">
          <div class="col-3 text-center">
            <div class="text-h5 text-weight-bold">
              {{ data?.merchant?.ratings }}
            </div>
            <q-rating
              :model-value="data?.merchant?.ratings || 0"
              size="0.9em"
              color="disabled"
              color-selected="amber-5"
              icon="star"
              icon-selected="star"
            />
            <div class="text-caption text-grey">
              {{ data?.merchant?.review_words }}
            </div>
          </div>
          <div class="col">
            <div v-for="n in 5" :key="n">
              <div class="row items-center justify-between">
                <div class="text-caption col-1 text-center text-grey">
                  {{ 6 - n }}
                </div>
                <div class="col">
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
        </div>

        <q-space class="q-pa-sm"></q-space>

        <ReviewCarousel
          :merchant_id="data?.merchant?.merchant_id || null"
          :data="data?.partial_review || []"
        ></ReviewCarousel>

        <div class="q-gutter-y-sm">
          <section>
            <div class="tagam-merchant-info__section-title">
              {{ $t("Few words about") }} {{ data?.merchant?.restaurant_name }}
            </div>
            <TextComponents
              :description="data?.merchant?.short_description || null"
              max_lenght="200"
              class_name="text-grey300 text-body2 line-normal"
              :label="{
                read_less: $t('Read less'),
                read_more: $t('Read More'),
              }"
            >
            </TextComponents>
          </section>
          <q-separator></q-separator>
          <section>
            <div class="row">
              <div class="col">
                <div class="tagam-merchant-info__section-title">
                  {{ $t("Address") }}
                </div>
                <div class="text-grey300 text-body2 line-normal">
                  {{ data?.merchant?.address }}
                </div>
              </div>
              <div class="col-4">
                <q-responsive style="height: 100px">
                  <q-img
                    :src="data?.merchant?.static_maps || null"
                    lazy
                    fit="cover"
                    class="radius8"
                    spinner-color="amber"
                    spinner-size="sm"
                  />
                </q-responsive>
              </div>
            </div>
          </section>

          <q-separator></q-separator>

          <section>
            <div class="tagam-merchant-info__section-title">
              {{ $t("Opening hours") }}
            </div>

            <q-list>
              <q-expansion-item
                expand-separator
                :label="$t('Today')"
                :caption="data?.open_at ? data?.open_at : $t('Closed')"
              >
                <q-card
                  :class="{
                    'bg-mydark text-white': $q.dark.mode,
                    'bg-white text-black': !$q.dark.mode,
                  }"
                >
                  <q-card-section>
                    <q-list dense class="text-body2 text-grey300">
                      <q-item
                        v-for="items in data?.opening_hours"
                        :key="items"
                        style="padding: 0px !important; min-height: 0"
                      >
                        <q-item-section class="text-capitalize">{{
                          items.value
                        }}</q-item-section>
                        <q-item-section caption
                          >{{ items.start_time }} - {{ items.end_time }}
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </section>

          <q-separator></q-separator>
          <section>
            <div class="tagam-merchant-info__section-title">
              {{ $t("Gallery") }}
            </div>
            <div
              class="container q-mt-md"
              @click="this.$refs.ref_image.modal = !this.$refs.ref_image.modal"
            >
              <template v-for="items in data?.gallery" :key="items">
                <figure>
                  <div class="cell">
                    <q-responsive style="width: 110px; height: 90px">
                      <q-img
                        :src="items.thumbnail"
                        lazy
                        fit="cover"
                        class="radius8"
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
  computed: {
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
};
</script>

<style scoped>
.tagam-merchant-info {
  background: #ffffff;
}

.tagam-merchant-info__top {
  background: #ffffff;
}

.tagam-merchant-info__toolbar {
  min-height: 56px;
  border-bottom: 1px solid rgba(113, 74, 24, 0.08);
  box-shadow: none;
}

.tagam-merchant-info__toolbar-title {
  font-size: 15px;
  font-weight: 800;
  color: #20160f;
}

.tagam-merchant-info__body {
  padding: 14px 18px 28px;
}

.tagam-merchant-info__title {
  font-size: 22px;
  line-height: 1.08;
  font-weight: 800;
  color: #20160f;
}

.tagam-merchant-info__cuisine {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.35;
  color: #6f6254;
}

.tagam-merchant-info__section-title {
  margin-bottom: 8px;
  font-size: 15px;
  line-height: 1.1;
  font-weight: 800;
  color: #f18800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tagam-merchant-info__body :deep(.q-separator) {
  background: rgba(113, 74, 24, 0.08);
}

.tagam-merchant-info__body :deep(.q-expansion-item) {
  border: 1px solid rgba(113, 74, 24, 0.08);
  border-radius: 18px;
  overflow: hidden;
}

.tagam-merchant-info__body :deep(.q-item) {
  min-height: 44px;
}

:global(body.body--dark) .tagam-merchant-info,
:global(body.body--dark) .tagam-merchant-info__top {
  background: var(--tagam-surface);
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-merchant-info__toolbar {
  border-bottom-color: var(--tagam-stroke);
  background: rgba(36, 29, 26, 0.96);
}

:global(body.body--dark) .tagam-merchant-info__toolbar-title,
:global(body.body--dark) .tagam-merchant-info__title,
:global(body.body--dark) .tagam-merchant-info .text-h5,
:global(body.body--dark) .tagam-merchant-info .text-body2,
:global(body.body--dark) .tagam-merchant-info .text-subtitle2,
:global(body.body--dark) .tagam-merchant-info .text-weight-bold {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-merchant-info__cuisine,
:global(body.body--dark) .tagam-merchant-info .text-grey,
:global(body.body--dark) .tagam-merchant-info .text-grey300,
:global(body.body--dark) .tagam-merchant-info .text-caption {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-merchant-info__body :deep(.q-separator),
:global(body.body--dark) .tagam-merchant-info__body :deep(.q-expansion-item) {
  border-color: var(--tagam-stroke);
  background: var(--tagam-surface-raised);
}
</style>
