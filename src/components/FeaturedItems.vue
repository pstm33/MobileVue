<template>
  <div v-if="DataStore.featured_loading" class="row q-gutter-sm items-center">
    <div v-for="i in 3" :key="i" class="col">
      <q-skeleton height="90px" class="full-width" />
      <q-skeleton type="text" class="w-75" />
      <q-skeleton type="text" class="w-100" />
    </div>
  </div>

  <div v-if="DataStore.featured_items" class="row q-mb-xs tagam-featured-head">
    <div class="col">
      <div class="tagam-section-title text-subtitle1 text-weight-bold">
        {{ title }}
      </div>
    </div>
  </div>

  <swiper
    class="tagam-featured-swiper"
    :slidesPerView="$q.screen.lt.sm ? 1.42 : 3.35"
    :spaceBetween="$q.screen.lt.sm ? 12 : 14"
    :loop="false"
  >
    <swiper-slide v-for="items in DataStore.featured_items" :key="items">
      <div
        @click.stop="handleClick(items)"
        class="tagam-featured-link tagam-text-main cursor-pointer"
      >
        <div
          class="tagam-featured-card relative-position"
        >
          <q-responsive ratio="1" class="tagam-featured-media">
            <q-img
              :src="items.url_image"
              class="tagam-featured-image"
              fit="fill"
              spinner-color="primary"
              spinner-size="xs"
            />
          </q-responsive>

          <div class="tagam-featured-body">
            <div class="tagam-featured-name ellipsis-2-lines line-normal">
              {{ items.item_name }}
            </div>
            <div
              v-if="merchantName(items)"
              class="tagam-featured-merchant ellipsis"
            >
              {{ merchantName(items) }}
            </div>
            <div
              class="tagam-featured-description ellipsis-2-lines line-normal tagam-text-muted"
              v-html="items.item_description"
            ></div>

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

            <div class="tagam-featured-bottom">
              <div class="flex items-center justify-between">
                <div class="tagam-featured-price">
                  {{ items.lowest_price }}
                </div>
                <div>
                  <q-btn
                    color="primary"
                    icon="eva-plus-outline"
                    no-caps
                    unelevated
                    round
                    size="sm"
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

export default {
  name: "FeaturedItems",
  props: ["title", "featured_id"],
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      merchant_id: null,
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
  },
  methods: {
    afterSavefav() {
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
    merchantName(data) {
      return (
        data?.merchant_name ||
        data?.restaurant_name ||
        data?.merchant?.restaurant_name ||
        data?.merchant?.merchant_name ||
        data?.merchant_info?.restaurant_name ||
        data?.merchant_info?.merchant_name ||
        this.merchantNameFromStore(data) ||
        ""
      );
    },
    merchantNameFromStore(data) {
      const merchantId = data?.merchant_id || data?.merchant_uuid;
      if (!merchantId) {
        return "";
      }

      const sources = [
        this.DataStore.merchant_list,
        this.DataStore.list_data,
        this.DataStore.feedresults_data,
        this.DataStore.car_data,
      ];
      const rows = sources.flat(Infinity).filter(Boolean);
      const merchant = rows.find((item) => {
        const ids = [
          item?.merchant_id,
          item?.merchant_uuid,
          item?.id,
          item?.merchant?.merchant_id,
          item?.merchant?.merchant_uuid,
        ];
        return ids.map(String).includes(String(merchantId));
      });

      return (
        merchant?.restaurant_name ||
        merchant?.merchant_name ||
        merchant?.restaurant_slug ||
        ""
      );
    },
    async afterAdditems(cart_uuid) {
      this.DataStorePersisted.cart_uuid = cart_uuid;
      await this.CartStore.getCart(true, this.payload);

      this.DataStore.featured_items = null;
      this.loadData();
    },
  },
};
</script>

<style lang="sass" scoped>
.tagam-featured-link
  display: block

.tagam-featured-head
  margin-top: 2px

.tagam-featured-swiper
  padding-bottom: 8px

.tagam-featured-card
  min-height: 238px
  overflow: hidden
  border: 1px solid var(--tagam-border)
  border-radius: var(--tagam-radius-card)
  background: var(--tagam-surface)
  box-shadow: var(--tagam-shadow-soft)
  transition: transform 170ms ease, box-shadow 170ms ease

.tagam-featured-card:hover
  transform: translateY(-2px)
  box-shadow: var(--tagam-shadow)

.tagam-featured-media
  border-radius: calc(var(--tagam-radius-card) - 2px)
  overflow: hidden
  background: var(--tagam-surface-muted)

.tagam-featured-image
  width: 100%
  height: 100%
  border-radius: inherit !important
  background: var(--tagam-surface-muted)

.tagam-featured-image :deep(.q-img__image)
  object-fit: fill !important
  object-position: center !important

.tagam-featured-body
  padding: 9px 12px 50px

.tagam-featured-name
  color: var(--tagam-text)
  font-size: 17px
  font-weight: 900
  line-height: 1.08

.tagam-featured-merchant
  margin-top: 6px
  color: var(--tagam-primary)
  font-size: 12px
  font-weight: 800
  letter-spacing: 0
  text-transform: uppercase

.tagam-featured-description
  margin-top: 4px
  font-size: 12.5px
  line-height: 1.14

.tagam-featured-bottom
  position: absolute
  left: 12px
  right: 12px
  bottom: 10px

.tagam-featured-price
  color: var(--tagam-text)
  font-size: 17px
  font-weight: 900

@media (max-width: 599px)
  .tagam-featured-card
    min-height: 246px

  .tagam-featured-name
    font-size: 18px
</style>





