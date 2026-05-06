<template>
  <template v-if="DataStore.banner_loading">
    <q-skeleton height="104px" />
  </template>
  <template v-else>
    <template v-if="hasData">
      <swiper
        :slidesPerView="1.08"
        :spaceBetween="12"
        :loop="false"
        class="tagam-home-banner-swiper tagam-home-banner-swiper--fixed"
        :autoplay="{
          delay: 2500,
          disableOnInteraction: false,
        }"
        :modules="modules"
      >
        <swiper-slide
          v-for="(items, index) in DataStore.banner"
          :key="items.banner_id"
          :name="index"
        >
          <div class="tagam-home-banner-card">
            <q-responsive class="tagam-home-banner-frame">
              <q-img
                :src="items.image"
                class="fit cursor-pointer tagam-home-banner-image"
                fit="contain"
                loading="lazy"
                @click="showBanner(items)"
                spinner-color="primary"
                spinner-size="md"
              />
            </q-responsive>
          </div>
        </swiper-slide>
      </swiper>
    </template>
  </template>

  <ItemDetails
    ref="item_details"
    :slug="restaurant_slug"
    :money_config="DataStore.money_config"
    :currency_code="DataStorePersisted.useCurrency"
    @after-additems="afterAdditems"
  />

  <ItemDetailsCheckbox
    ref="item_details2"
    :slug="restaurant_slug"
    :money_config="DataStore.money_config"
    :currency_code="DataStorePersisted.useCurrency"
    @after-additems="afterAdditems"
  />
</template>

<script>
import { defineAsyncComponent } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { Autoplay } from "swiper";

import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useCartStore } from "stores/CartStore";
import { Browser } from "@capacitor/browser";

export default {
  name: "HomeBanner",
  props: ["filters", "search_mode"],
  components: {
    Swiper,
    SwiperSlide,
    ItemDetails: defineAsyncComponent(() =>
      import("components/ItemDetails.vue")
    ),
    ItemDetailsCheckbox: defineAsyncComponent(() =>
      import("components/ItemDetailsCheckbox.vue")
    ),
  },
  data() {
    return {
      loading: false,
      slide: 1,
      data: [],
      test: [],
      restaurant_slug: "",
      payload: [
        "items",
        "subtotal",
        "distance_local",
        "items_count",
        "merchant_info",
        "check_opening",
        "transaction_info",
      ],
    };
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const CartStore = useCartStore();
    return {
      modules: [Autoplay],
      DataStore,
      DataStorePersisted,
      CartStore,
    };
  },

  mounted() {
    this.loadData();
  },
  computed: {
    hasData() {
      if (this.DataStore.banner.length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    loadData() {
      const searchMode = this.DataStore.getSearchMode;
      if (Object.keys(this.DataStore.banner).length <= 0) {
        if (searchMode == "location") {
          this.DataStore.getBannerLocation({
            city_id: this.DataStorePersisted.getLocation?.city_id || "",
            state_id: this.DataStorePersisted.getLocation?.state_id || "",
            area_id: this.DataStorePersisted.getLocation?.area_id || "",
            postal_id: this.DataStorePersisted.getLocation?.postal_code || "",
          });
        } else {
          const coordinates = this.DataStorePersisted.coordinates;
          this.DataStore.getBanner({
            latitude: coordinates ? coordinates.lat : "",
            longitude: coordinates ? coordinates.lng : "",
          });
        }
      }
    },
    async customLink(redirect) {
      if (this.$q.capacitor) {
        await Browser.open({ url: redirect });
      } else {
        window.open(redirect);
      }
    },
    async afterAdditems(cart_uuid) {
      try {
        this.DataStorePersisted.cart_uuid = cart_uuid;
        await this.CartStore.getCart(true, this.payload);
      } catch (error) {
      } finally {
      }
    },
    showBanner(data) {
      switch (data.banner_type) {
        case "custom_link":
          this.customLink(data?.featured);
          break;
        case "restaurant":
          let slug = !APIinterface.empty(
            this.DataStore.merchant_list[data.merchant_id]
          )
            ? this.DataStore.merchant_list[data.merchant_id].restaurant_slug
            : "";

          if (!APIinterface.empty(slug)) {
            this.$router.push({ name: "menu", params: { slug: slug } });
          }
          break;

        case "food":
          let items = !APIinterface.empty(
            this.DataStore.food_list[data.item_id]
          )
            ? this.DataStore.food_list[data.item_id]
            : "";

          if (Object.keys(items).length > 0) {
            this.restaurant_slug = items.restaurant_slug;
            const params = {
              cat_id: parseInt(items.cat_id),
              item_uuid: items.item_uuid,
            };
            if (this.DataStore.addons_use_checkbox) {
              this.$refs.item_details2.showItem2(params, this.restaurant_slug);
            } else {
              this.$refs.item_details.showItem2(params, this.restaurant_slug);
            }
          }
          break;

        case "restaurant_featured":
          let featured = data.featured;
          if (!APIinterface.empty(featured)) {
            if (this.search_mode == "location") {
              this.$router.push({
                name: "feed_location",
                query: { featured_id: featured },
              });
              return;
            }

            this.$router.push({
              name: "feed",
              query: { query: "featured", featured_id: featured },
            });
          }
          break;
        case "cuisine":
          let cuisine_name = !APIinterface.empty(
            this.DataStore.cuisine_list[data.cuisine_id]
          )
            ? this.DataStore.cuisine_list[data.cuisine_id]
            : "";

          if (this.search_mode == "location") {
            this.$router.push({
              name: "feed_location",
              query: {
                cuisine_id: data.cuisine_id,
                cuisine_name: cuisine_name,
              },
            });
            return;
          }

          this.$router.push({
            name: "feed",
            query: {
              query: "all",
              cuisine_id: data.cuisine_id,
              cuisine_name: cuisine_name,
            },
          });
          break;
      }
    },
  },
};
</script>

<style scoped>
.tagam-home-banner-swiper {
  margin-bottom: 0 !important;
}

.tagam-home-banner-swiper--fixed {
  min-height: 166px;
}

.tagam-home-banner-card {
  height: 166px;
  background: rgba(255, 252, 247, 0.82);
  border: 1px solid rgba(113, 74, 24, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: stretch;
}

.tagam-home-banner-frame {
  height: 100%;
  width: 100%;
}

.tagam-home-banner-swiper :deep(.swiper-slide) {
  width: calc(100% - 18px);
}

.tagam-home-banner-image {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(113, 74, 24, 0.1);
  box-shadow: none;
  background: #fff8ef;
}

.tagam-home-banner-image::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(17, 17, 17, 0) 32%, rgba(17, 17, 17, 0.16) 100%);
}
</style>
