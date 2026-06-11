<template>
  <template v-if="MenuStore.loading_similar_items">
    <q-skeleton type="text" style="width: 80px" />
    <div class="row q-gutter-sm">
      <div class="col-9">
        <q-skeleton height="60px" square class="radius8" />
      </div>
      <div class="col-2">
        <q-skeleton height="60px" square class="radius8" />
      </div>
    </div>
  </template>
  <template v-else>
    <div class="text-subtitle1 line-normal text-weight-bold tagam-text-main">
      {{ title }}
    </div>
    <div class="text-caption tagam-text-muted q-mb-md">
      {{ $t("Other customers also both these") }}
    </div>

    <swiper :slides-per-view="2.5" :space-between="10">
      <template v-for="items in MenuStore.getItemsSimilar" :key="items">
        <swiper-slide>
          <div class="font12 cursor-pointer" @click="onClickitem(items)">
            <div class="relative-position">
              <q-responsive ratio="1" style="width: 110px">
                <q-img
                  :src="items.url_image"
                  lazy
                  fit="fill"
                  class="radius8"
                  spinner-color="amber"
                  spinner-size="sm"
                />
              </q-responsive>
              <div class="absolute-bottom-right q-pa-sm">
                <q-btn round color="primary" icon="add" unelevated size="sm" />
              </div>
            </div>

            <div class="q-pt-smx">
              <div
                class="tagam-text-muted text-overline text-weight-bold letter-spacing-none"
                v-if="items.price"
              >
                <template v-if="items.price[0]">
                  <template v-if="items.price[0].discount > 0">
                    {{ items.price[0].pretty_price_after_discount }}
                  </template>
                  <template v-else>
                    {{ items.price[0].pretty_price }}
                  </template>
                </template>
              </div>
              <div
                class="line-normal tagam-text-main text-subtitle2 ellipsis-2-lines"
              >
                {{ items.item_name }}
              </div>
            </div>
          </div>
        </swiper-slide>
      </template>
    </swiper>
  </template>

  <ItemDetailsCheckbox
    ref="refItem2"
    :slug="merchant_slug"
    :money_config="DataStore.money_config"
    :cart_uuid="cart_uuid"
    @after-additems="afterAdditems"
  />

  <div class="q-pa-sm"></div>
</template>

<script>
import { defineAsyncComponent, ref, onMounted } from "vue";
import { useMenuStore } from "src/stores/MenuStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { useDataStore } from "stores/DataStore";

export default {
  name: "SimilarItems",
  props: ["title", "bg", "merchant_id", "merchant_slug", "cart_uuid"],
  components: {
    Swiper,
    SwiperSlide,
    ItemDetailsCheckbox: defineAsyncComponent(() =>
      import("components/ItemDetailsCheckbox.vue")
    ),
  },
  setup(props) {
    const MenuStore = useMenuStore();
    const DataStore = useDataStore();
    return { MenuStore, DataStore };
  },
  mounted() {
    if (!this.MenuStore.data_similar_items) {
      this.MenuStore.getSimilarItems(this.merchant_id);
    } else {
      if (this.MenuStore.similar_merchant != this.merchant_id) {
        this.MenuStore.getSimilarItems(this.merchant_id);
      }
    }
  },
  methods: {
    onClickitem(data) {
      const params = {
        cat_id: data.cat_id,
        item_uuid: data.item_uuid,
      };
      this.$refs.refItem2.showItem2(params, this.merchant_slug);
    },
    afterAdditems(value) {
      this.$emit("afterAdditems", value);
    },
  },
};
</script>




