<template>
  <div class="tagam-menu-grid">
    <div class="row items-start q-col-gutter-md q-pl-md q-pr-md">
      <div
        class="col-6 q-gutter-y-xs cursor-pointer"
        v-for="items in data"
        :key="items"
        @click.stop="onClickItem(category, items)"
      >
        <div class="relative-position tagam-menu-grid-card">
          <q-responsive style="width: 95px; height: 95px; margin: auto">
            <q-img
              :src="items.url_image"
              placeholder-src="placeholder.png"
              lazy
              fit="fill"
              class="tagam-menu-grid-card__image"
              spinner-color="primary"
              spinner-size="sm"
            />
          </q-responsive>
          <div class="absolute-top-right fit">
            <div class="column items-end col-12 q-gutter-y-sm">
              <div class="col">
                <FavsItem
                  ref="favs"
                  :layout="3"
                  :item_token="items.item_uuid"
                  :cat_id="category.cat_id"
                  :active="items.is_favorite"
                  :data="items"
                  @after-savefav="afterSavefavItem"
                  @on-saved="onSavedfavItem"
                />
              </div>
              <div class="col" v-if="items.total_allergens > 0">
                <q-btn
                  round
                  unelevated
                  color="mygrey"
                  text-color="dark"
                  size="sm"
                  icon="o_info"
                  @click.stop="showAllergens(this.merchant_id, items.item_id)"
                />
              </div>
              <div class="col">
                <template v-if="findItem(items.item_uuid, category.cat_id)">
                  <q-btn
                    color="white"
                    text-color="dark"
                    style="border: 1px solid #ff724c"
                    round
                    size="sm"
                    @click.stop="
                      showOptions(findItem(items.item_uuid, category.cat_id))
                    "
                    unelevated
                  >
                    <div style="font-size: 14px">
                      {{ findItemQty(items.item_uuid, category.cat_id) }}
                    </div>
                  </q-btn>
                </template>
                <template v-else>
                  <q-btn
                    round
                    unelevated
                    :color="
                      !category.available || !items.available
                        ? 'disabled'
                        : 'primary'
                    "
                    :text-color="
                      !category.available || !items.available
                        ? 'disabled'
                        : 'white'
                    "
                    size="sm"
                    icon="las la-plus"
                    :disable="!category.available || !items.available"
                    @click.stop="onClickItem(category, items)"
                  />
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="tagam-menu-grid-card__title ellipsis" v-html="items.item_name"></div>
        <div
          class="tagam-menu-grid-card__description ellipsis-2-lines"
          v-html="items.item_description"
        ></div>

        <div class="tagam-menu-grid-card__price">
          {{ items.lowest_price }}
        </div>

        <q-badge
          v-if="!items.available"
          color="disabled"
          text-color="disabled"
          :label="$t('Not available')"
          rounded
        />

        <q-tooltip
          v-model="item_tooltip[`${items.item_uuid}${category.cat_id}`]"
          :no-parent-event="true"
        >
          {{ items.item_unavailable }}</q-tooltip
        >
      </div>
      <!-- col -->
    </div>
    <!-- row -->
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useCartStore } from "stores/CartStore";
import { useDataStore } from "stores/DataStore";

export default {
  name: "MenuGrid",
  props: ["data", "category", "merchant_id"],
  components: {
    FavsItem: defineAsyncComponent(() => import("src/components/FavsItem.vue")),
  },
  setup() {
    const CartStore = useCartStore();
    const DataStore = useDataStore();
    return { CartStore, DataStore };
  },
  data() {
    return {
      item_tooltip: {},
    };
  },
  methods: {
    onSavedfavItem(data, found) {
      data.is_favorite = found;
      // CLEAR HOME PAGE FILTER AND FAV
      this.DataStore.feed_filter = [];
      this.DataStore.fav_saved_data = null;
    },
    onClickItem(category, items) {
      if (!items.available) {
        this.item_tooltip[`${items.item_uuid}${category.cat_id}`] = true;
        setTimeout(() => {
          this.item_tooltip[`${items.item_uuid}${category.cat_id}`] = false;
        }, 2000);
        return false;
      }
      const find_item = this.findItem(items.item_uuid, category.cat_id);
      if (find_item) {
        this.showOptions(find_item);
        return;
      } else {
        this.$emit("onClickitems", {
          cat_id: category.cat_id,
          item_uuid: items.item_uuid,
        });
      }
    },
    showAllergens(merchant_id, item_id) {
      this.$emit("showAllergens", {
        merchant_id: merchant_id,
        item_id: item_id,
      });
    },
    showOptions(value) {
      this.$emit("showOptions", value);
    },
    findItem(value, cat_id) {
      const items = this.CartStore.getItems;
      if (!items || items.length === 0) {
        return false;
      }
      const foundItem = items.filter(
        (item) => item.item_token === value && item.cat_id == cat_id
      );
      return foundItem.length > 0 ? foundItem : false;
    },
    findItemQty(value, cat_id) {
      const items = this.CartStore.getItems;
      if (!items || items.length === 0) {
        return false;
      }
      const summedQty = items
        .filter((item) => item.item_token === value && item.cat_id == cat_id)
        .reduce((acc, item) => acc + item.qty, 0);

      return summedQty;
    },
  },
};
</script>
<style scoped>
.tagam-menu-grid {
  padding: 6px 0 2px;
}

.tagam-menu-grid-card {
  padding: 8px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(113, 74, 24, 0.06);
  box-shadow: none;
}

.tagam-menu-grid-card__image {
  border-radius: 16px;
  background: #ffffff;
}

.tagam-menu-grid-card__title {
  margin-top: 7px;
  font-size: 14px;
  line-height: 1.14;
  font-weight: 800;
  color: #1f150d;
}

.tagam-menu-grid-card__description {
  margin-top: 3px;
  color: #85796b;
  font-size: 11px;
  line-height: 1.28;
  min-height: 28px;
}

.tagam-menu-grid-card__price {
  margin-top: 7px;
  font-size: 18px;
  line-height: 1;
  font-weight: 900;
  color: #17110b;
}

.tagam-menu-grid-card :deep(.q-btn) {
  min-width: 40px;
  width: 40px;
  min-height: 40px;
  height: 40px;
  padding: 0;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  box-shadow: none;
  background: #f18800 !important;
  color: #ffffff !important;
}

.tagam-menu-grid-card :deep(.q-btn .q-btn__content) {
  width: 100%;
  height: 100%;
}

.tagam-menu-grid-card :deep(.q-btn .q-icon) {
  font-size: 19px;
}

:global(body.body--dark) .tagam-menu-grid-card {
  background: rgba(39, 31, 27, 0.96) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-menu-grid-card__image {
  background: rgba(47, 37, 33, 0.96) !important;
}

:global(body.body--dark) .tagam-menu-grid-card__title,
:global(body.body--dark) .tagam-menu-grid-card__price {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-menu-grid-card__description {
  color: var(--tagam-text-muted) !important;
}
</style>
