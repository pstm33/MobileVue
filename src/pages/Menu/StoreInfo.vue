<template>
  <q-header
    reveal
    reveal-offset="10"
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-black': !$q.dark.mode,
    }"
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="eva-arrow-back-outline"
        class="q-mr-sm"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
      <q-toolbar-title class="text-weight-bold text-subtitle2">{{
        $t("Info")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pl-md q-pr-md">
    <template v-if="MenuStore.loadin_info">
      <template v-for="items in 4" :key="items">
        <q-item>
          <q-item-section>
            <q-item-label>
              <q-skeleton type="text" />
            </q-item-label>
            <q-item-label caption>
              <q-skeleton type="text" />
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </template>

    <template v-else>
      <template v-if="MenuStore.data_info">
        <q-chip
          dense
          color="transparent"
          text-color="grey-4"
          class="q-pa-none"
          icon="las la-map-marker-alt"
        >
          <span class="text-grey text-subtitle1"
            >{{ $t("Few words about") }}
            {{ MenuStore.data_info.restaurant_name }}</span
          >
        </q-chip>

        <!-- <div class="text-subtitle2 text-grey ellipsis-2-lines">
          {{ MenuStore.data_info.short_description }}
        </div> -->

        <TextComponents
          :description="MenuStore.data_info.short_description"
          max_lenght="300"
          class_name=" text-grey text-subtitle2 line-normal"
          :label="{
            read_less: $t('Read less'),
            read_more: $t('Read More'),
          }"
        >
        </TextComponents>

        <q-separator class="q-mb-sm q-mt-sm"></q-separator>

        <q-chip
          dense
          color="transparent"
          text-color="grey-4"
          class="q-pa-none"
          icon="las la-map-marker-alt"
        >
          <span class="text-grey text-subtitle1">{{ $t("Address") }}</span>
        </q-chip>

        <div class="row items-center q-gutter-sm">
          <div class="col">
            <div class="text-subtitle2 text-weight-bold no-margin line-normal">
              {{ MenuStore.data_info.restaurant_name }}
            </div>
            <div class="text-grey text-caption line-normal">
              {{ MenuStore.data_info.address }}
            </div>
          </div>
          <div class="col-4 text-center">
            <template v-if="this.$q.capacitor">
              <q-btn
                flat
                :color="$q.dark.mode ? 'secondary' : 'blue'"
                no-caps
                :label="$t('Get directions')"
                dense
                size="md"
                :href="MenuStore.data_info.map_direction"
                target="_blank"
              />
            </template>
            <template v-else>
              <q-btn
                flat
                :color="$q.dark.mode ? 'secondary' : 'blue'"
                no-caps
                :label="$t('Get directions')"
                dense
                size="md"
                :href="MenuStore.data_info.map_direction"
                target="_blank"
              />
            </template>
          </div>
        </div>

        <q-separator class="q-mb-sm q-mt-sm"></q-separator>

        <q-chip
          dense
          color="transparent"
          text-color="grey-4"
          class="q-pa-none"
          icon="las la-clock"
        >
          <span class="text-grey text-subtitle1">{{
            $t("Opening hours")
          }}</span>
        </q-chip>

        <q-list v-if="MenuStore.open_at">
          <q-expansion-item
            expand-separator
            :label="$t('Today')"
            :caption="MenuStore.open_at"
          >
            <q-card
              :class="{
                'bg-mydark text-white': $q.dark.mode,
                'bg-white text-black': !$q.dark.mode,
              }"
            >
              <q-card-section>
                <q-list dense class="text-subtitle2 text-grey">
                  <q-item
                    v-for="items in MenuStore.opening_hours"
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

        <q-separator class="q-mb-sm q-mt-sm"></q-separator>

        <template v-if="hasGallery">
          <q-chip
            dense
            color="transparent"
            text-color="grey-4"
            class="q-pa-none"
            icon="las la-photo-video"
          >
            <span class="text-grey text-subtitle1">{{ $t("Gallery") }}</span>
          </q-chip>

          <div
            v-if="MenuStore.data_gallery"
            class="q-gutter-sm row items-start"
          >
            <template
              v-for="(items, index) in MenuStore.data_gallery"
              :key="items"
            >
              <template v-if="index <= 4">
                <q-img
                  :src="items.thumbnail"
                  spinner-color="secondary"
                  spinner-size="sm"
                  fit="cover"
                  style="height: 80px; max-width: 80px"
                  placeholder-src="placeholder.png"
                  class="radius8 cursor-pointer"
                  @click="
                    this.$refs.imagePreview.modal =
                      !this.$refs.imagePreview.modal
                  "
                />
              </template>
            </template>
            <div
              v-if="countGallery > 0"
              style="height: 80px; width: 80px"
              class="relative-position"
            >
              <div
                class="dimmed absolute-top fit z-top flex flex-center cursor-pointer"
                @click="
                  this.$refs.imagePreview.modal = !this.$refs.imagePreview.modal
                "
              >
                <div
                  class="text-center text-white z-top text-weight-bold font16"
                >
                  +{{ countGallery }}
                </div>
              </div>
              <template v-if="MenuStore.data_gallery[5]">
                <q-img
                  :src="MenuStore.data_gallery[5].thumbnail"
                  spinner-color="secondary"
                  spinner-size="sm"
                  fit="cover"
                  style="height: 80px; max-width: 80px"
                  placeholder-src="placeholder.png"
                  class="radius8"
                />
              </template>
            </div>
          </div>
        </template>
      </template>
    </template>

    <ImagePreview
      ref="imagePreview"
      :gallery="getGallery"
      :title="$t('Gallery')"
    >
    </ImagePreview>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useMenuStore } from "stores/MenuStore";

export default {
  name: "Menu/StoreInfo",
  components: {
    ImagePreview: defineAsyncComponent(() =>
      import("components/ImagePreview.vue")
    ),
    TextComponents: defineAsyncComponent(() =>
      import("src/components/TextComponents.vue")
    ),
  },
  data() {
    return {
      slug: "",
    };
  },
  setup() {
    const MenuStore = useMenuStore();
    return { MenuStore };
  },
  computed: {
    hasGallery() {
      if (Object.keys(this.MenuStore.data_gallery).length > 0) {
        if (this.MenuStore.data_gallery) {
          return true;
        }
      }
      return false;
    },
    countGallery() {
      if (Object.keys(this.MenuStore.data_gallery).length > 0) {
        if (this.MenuStore.data_gallery) {
          let total = Object.keys(this.MenuStore.data_gallery).length;
          return total - 4;
        }
      }
      return 0;
    },
    getGallery() {
      if (Object.keys(this.MenuStore.gallery_images).length > 0) {
        if (this.MenuStore.gallery_images) {
          return this.MenuStore.gallery_images;
        }
      }
      return false;
    },
  },
  created() {
    this.slug = this.$route.query.slug;
    if (Object.keys(this.MenuStore.data_info).length <= 0) {
      this.MenuStore.getMerchantInfo(this.slug);
    } else {
      if (!this.MenuStore.data_info) {
        this.MenuStore.getMerchantInfo(this.slug);
      }
    }
  },
};
</script>
