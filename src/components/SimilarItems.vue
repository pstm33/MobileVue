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
    <div class="text-subtitle1 line-normal text-weight-bold text-dark">
      {{ title }}
    </div>
    <div class="text-caption text-grey q-mb-md">
      {{ $t("Other customers also both these") }}
    </div>

    <swiper :slides-per-view="'auto'" :space-between="12" class="tagam-similar-swiper">
      <template v-for="items in MenuStore.getItemsSimilar" :key="items">
        <swiper-slide class="tagam-similar-swiper__slide">
          <div class="font12 cursor-pointer tagam-similar-card" @click="onClickitem(items)">
            <div class="relative-position tagam-similar-card__media">
              <q-responsive class="tagam-similar-card__frame">
                <q-img
                  :src="items.url_image"
                  lazy
                  fit="fill"
                  class="tagam-similar-card__image"
                  spinner-color="amber"
                  spinner-size="sm"
                />
              </q-responsive>
              <div class="tagam-similar-card__action">
                <q-btn round color="primary" icon="add" unelevated size="sm" />
              </div>
            </div>

            <div class="tagam-similar-card__body">
              <div
                class="text-grey-7 text-overline text-weight-bold letter-spacing-none tagam-similar-card__price"
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
                class="line-normal text-dark text-subtitle2 ellipsis-2-lines tagam-similar-card__title"
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

<style scoped>
.tagam-similar-swiper__slide {
  width: 126px !important;
}

.tagam-similar-card {
  width: 126px;
}

.tagam-similar-card__media {
  width: 126px;
  height: 126px;
}

.tagam-similar-card__frame {
  width: 126px;
  height: 126px;
  border-radius: 18px;
  overflow: hidden;
  background: #fff8ef;
}

.tagam-similar-card__image {
  border-radius: 18px;
}

.tagam-similar-card__action {
  position: absolute;
  right: 6px;
  bottom: 6px;
}

.tagam-similar-card__action :deep(.q-btn) {
  width: 34px;
  height: 34px;
  min-width: 34px;
  min-height: 34px;
  border-radius: 999px !important;
  box-shadow: none;
}

.tagam-similar-card__body {
  padding-top: 8px;
}

.tagam-similar-card__price {
  min-height: 18px;
}

.tagam-similar-card__title {
  min-height: 40px;
  font-size: 14px;
  line-height: 1.15;
}

:global(body.body--dark) .tagam-similar-card__frame {
  background: var(--tagam-surface-raised);
  border: 1px solid var(--tagam-stroke);
}

:global(body.body--dark) .tagam-similar-card__price {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-similar-card__title {
  color: var(--tagam-text) !important;
}
</style>
