<template>
  <div
    v-if="DataStore.featured_loading && displayItems.length === 0"
    class="row q-gutter-sm items-center"
    :class="{ 'tagam-featured-loading--compact': compact }"
  >
    <div v-for="i in 3" :key="i" class="col">
      <q-skeleton height="90px" class="full-width" />
      <q-skeleton type="text" class="w-75" />
      <q-skeleton type="text" class="w-100" />
    </div>
  </div>

  <div v-if="displayItems.length > 0 && !hideTitle" class="row q-mb-sm">
    <div class="col">
      <div class="text-h6 text-weight-medium">
        {{ title }}
      </div>
    </div>
  </div>

  <swiper
    :slidesPerView="resolvedSlidesPerView"
    :spaceBetween="10"
    :loop="false"
  >
    <swiper-slide
      v-for="(items, index) in displayItems"
      :key="items.item_uuid || items.id || items.item_name"
    >
      <div @click.stop="handleClick(items)" class="text-dark cursor-pointer">
        <div
          class="border-grey2 radius8 relative-position tagam-featured-card"
          :class="{ 'tagam-featured-card--compact': compact }"
        >
          <div class="tagam-featured-card__media-wrap">
            <q-responsive :ratio="1" class="tagam-featured-card__media">
              <q-img
                :src="items.url_image"
                class="tagam-featured-card__image"
                fit="fill"
                :img-attrs="featuredImageAttrs(index)"
                spinner-color="primary"
                spinner-size="xs"
              />
            </q-responsive>
          </div>

          <div class="q-pa-sm tagam-featured-card__content">
            <div
              class="ellipsis tagam-featured-card__title"
              :class="{ 'tagam-featured-card__title--compact': compact }"
            >
              {{ items.item_name }}
            </div>

            <template v-if="items?.is_promo_free_item">
              <q-badge
                :color="items?.is_eligible ? 'green-1' : 'orange-1'"
                :text-color="items?.is_eligible ? 'green-5' : 'orange-5'"
                rounded
                multi-line
              >
                {{ items?.promo?.message }}
              </q-badge>
            </template>

            <div class="tagam-featured-card__footer">
              <div class="flex items-center justify-between">
                <div class="text-subtitle2 text-weight-medium">
                  {{ items.lowest_price }}
                </div>
                <div>
                  <q-btn
                    color="primary"
                    icon="add"
                    unelevated
                    rounded
                    padding="3px"
                    size="11px"
                    class="tagam-featured-card__add-btn"
                    :disabled="!items?.is_eligible"
                    @click.stop="handleClick(items)"
                  ></q-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </swiper-slide>
  </swiper>

  <component
    :is="ItemComponents"
    ref="item_details"
    :slug="merchant_id"
    :money_config="DataStore.money_config"
    :currency_code="DataStorePersisted.useCurrency"
    :cart_uuid="DataStorePersisted.cart_uuid"
    @after-additems="afterAdditems"
    @afterSavefav="afterSavefav"
  />
</template>

<script>
import { defineAsyncComponent } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useCartStore } from "stores/CartStore";
import APIinterface from "src/api/APIinterface";

const foodFallbackImage = new URL("../assets/food-bg.png", import.meta.url).href;

const normalizePreviewFood = (items = []) =>
  items
    .filter((item) => item && (item.item_uuid || item.id || item.item_name))
    .map((item) => ({
      ...item,
      url_image:
        item.url_image ||
        item.photo_url ||
        item.image_url ||
        item.photo ||
        item.image ||
        item.url_photo_x2 ||
        item.url_photo ||
        item.featured_image ||
        foodFallbackImage,
      lowest_price:
        item.lowest_price || item.price || item.price_pretty || "",
      item_name: item.item_name || item.name || "",
      item_description: item.item_description || item.description || "",
      merchant_id: item.merchant_id || item.restaurant_slug || item.slug,
      is_eligible: item.is_eligible !== false,
    }));

const shuffleItems = (items = []) =>
  [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);

export default {
  name: "FeaturedItems",
  props: {
    title: {
      type: String,
      default: "",
    },
    featured_id: {
      type: String,
      default: "",
    },
    hideTitle: {
      type: Boolean,
      default: false,
    },
    compact: {
      type: Boolean,
      default: false,
    },
    previewItems: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      merchant_id: null,
      visibleItemsCache: [],
      payload: [
        "items",
        "subtotal",
        "items_count",
        "merchant_info",
        "transaction_info",
      ],
    };
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const CartStore = useCartStore();

    const addons_use_checkbox = DataStore.addons_use_checkbox ?? true;
    const ItemComponents = defineAsyncComponent(() =>
      addons_use_checkbox
        ? import("components/ItemDetailsCheckbox.vue")
        : import("components/ItemDetails.vue")
    );

    return { DataStore, DataStorePersisted, CartStore, ItemComponents };
  },
  mounted() {
    this.loadData();
    this.syncVisibleItems(this.resolvedItems);
  },
  computed: {
    resolvedSlidesPerView() {
      if (this.compact) {
        return this.$q.screen.lt.sm ? 1.25 : 2.4;
      }
      return this.$q.screen.lt.sm ? 2.3 : 3.3;
    },
    resolvedItems() {
      if (
        Array.isArray(this.DataStore.featured_items) &&
        this.DataStore.featured_items.length > 0
      ) {
        return this.DataStore.featured_items;
      }

      if (Array.isArray(this.previewItems) && this.previewItems.length > 0) {
        return this.previewItems;
      }

      const resolvedFoodList = shuffleItems(
        normalizePreviewFood(Object.values(this.DataStore.food_list || {}))
      ).slice(0, 8);

      if (resolvedFoodList.length > 0) {
        return resolvedFoodList;
      }

      return [];
    },
    displayItems() {
      if (Array.isArray(this.resolvedItems) && this.resolvedItems.length > 0) {
        return this.resolvedItems;
      }

      return this.visibleItemsCache;
    },
  },
  watch: {
    resolvedItems: {
      immediate: true,
      handler(items) {
        this.syncVisibleItems(items);
      },
    },
  },
  methods: {
    syncVisibleItems(items = []) {
      if (Array.isArray(items) && items.length > 0) {
        this.visibleItemsCache = items;
      }
    },
    afterSavefav() {
      console.log("afterSavefav xx");
      // CLEAR HOME PAGE FILTER AND FAV
      this.DataStore.fav_saved_data = null;
    },
    loadData() {
      const currency_params = {
        currency_code: this.DataStorePersisted.useCurrency,
        cart_uuid: this.DataStorePersisted.cart_uuid,
      };
      const params = {
        ...this.DataStorePersisted.coordinates,
        ...currency_params,
      };
      console.log("Fatured items load data");
      this.DataStore.fetchFeaturedItems(new URLSearchParams(params).toString());
    },
    handleClick(data) {
      const is_eligible = data?.is_eligible;
      if (!is_eligible) {
        const message = data?.promo?.message || "";
        APIinterface.ShowAlert(message, this.$q.capacitor, this.$q);
        return;
      }
      const params = { cat_id: data.cat_id, item_uuid: data.item_uuid };
      this.merchant_id = data.merchant_id;
      this.$refs.item_details.showItem2(params, this.merchant_id);
    },
    featuredImageAttrs(index) {
      if (index <= 2) {
        return {
          loading: "eager",
          fetchpriority: "high",
          decoding: "async",
        };
      }

      return {
        loading: "lazy",
        fetchpriority: "auto",
        decoding: "async",
      };
    },
    async afterAdditems(cart_uuid) {
      console.log("afterAdditems", cart_uuid);
      this.DataStorePersisted.cart_uuid = cart_uuid;
      await this.CartStore.getCart(true, this.payload);

      this.DataStore.featured_items = null;
      this.loadData();
    },
  },
};
</script>

<style scoped>
.tagam-featured-card {
  height: 166px;
  background: rgba(255, 252, 247, 0.82);
  border-color: rgba(113, 74, 24, 0.1) !important;
}

.tagam-featured-card--compact {
  height: 166px;
}

.tagam-featured-card__media-wrap {
  width: 104px;
  max-width: 100%;
  margin: 8px auto 0;
}

.tagam-featured-card__media {
  border-radius: 18px;
  overflow: hidden;
  background: #fff8ef;
  border: 1px solid rgba(113, 74, 24, 0.08);
}

.tagam-featured-card__image {
  width: 100%;
  height: 100%;
  border-radius: 18px;
}

.tagam-featured-card__content {
  padding-left: 10px !important;
  padding-right: 10px !important;
  padding-top: 10px !important;
  padding-bottom: 8px !important;
}

.tagam-featured-card__title {
  font-size: 13px;
  line-height: 1.2;
  font-weight: 700;
  margin-top: -2px;
  margin-bottom: 12px;
}

.tagam-featured-card__title--compact {
  font-size: 13px;
}

.tagam-featured-card__footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 6px 10px 8px;
}

.tagam-featured-card__add-btn {
  min-width: 22px;
  width: 22px;
  height: 22px;
}

.tagam-featured-loading--compact .q-skeleton {
  border-radius: 16px;
}
</style>
