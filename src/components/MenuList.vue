<template>
  <q-list class="tagam-menu-list">
    <q-item
      clickable
      v-ripple:purple
      v-for="items in data"
      :key="items"
      @click.stop="onClickItem(category, items)"
      class="tagam-menu-item"
    >
      <q-item-section top avatar>
        <q-responsive style="width: 104px; height: 104px">
          <q-img
            :src="items.url_image"
            placeholder-src="placeholder.png"
            lazy
            fit="fill"
            class="tagam-menu-item__image"
            spinner-color="primary"
            spinner-size="sm"
          />
        </q-responsive>
      </q-item-section>
      <q-item-section class="tagam-menu-item__main">
        <div class="tagam-menu-item__top">
          <div class="tagam-menu-item__title" v-html="items.item_name"></div>
          <div class="tagam-menu-item__tools">
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
            <q-btn
              v-if="items.total_allergens > 0"
              round
              unelevated
              color="mygrey"
              text-color="dark"
              size="sm"
              icon="o_info"
              @click.stop="showAllergens(this.merchant_id, items.item_id)"
            />
          </div>
        </div>

        <div
          class="tagam-menu-item__description"
          v-html="items.item_description"
        ></div>

        <template v-if="items.promo_data?.message && items.available">
          <q-badge
            :color="isEligible(items) ? 'green-1' : 'orange-1'"
            :text-color="isEligible(items) ? 'green-5' : 'orange-5'"
            rounded
            multi-line
            class="q-mt-xs"
          >
            {{ getPromoMessage(items) }}
          </q-badge>
        </template>

        <div class="tagam-menu-item__footer">
          <div class="tagam-menu-item__pricing" :class="{ 'text-green': isEligible(items) }">
            <template v-if="isEligible(items)">
              <span class="tagam-menu-item__current-price">{{ $t("Free!") }}</span>
            </template>
            <template v-else>
              <span class="tagam-menu-item__current-price">{{ items.lowest_price }}</span>
              <span
                v-if="items.lowest_price_discount_raw > 0"
                class="tagam-menu-item__old-price"
              >
                {{ items.lowest_price_discount }}
              </span>
              <span
                v-else-if="items.has_discount"
                class="tagam-menu-item__discount-hint"
              >
                {{ $t("Check Offers") }}
              </span>
            </template>
          </div>

          <div class="tagam-menu-item__actions">
            <template v-if="findItem(items.item_uuid, category.cat_id)">
              <q-btn
                outline
                color="primary"
                rounded
                unelevated
                class="tagam-menu-item__qty"
                @click.stop="
                  showOptions(findItem(items.item_uuid, category.cat_id))
                "
              >
                <div class="tagam-menu-item__qty-value">
                  {{ findItemQty(items.item_uuid, category.cat_id) }}
                </div>
              </q-btn>
            </template>
            <template v-else>
              <q-btn
                round
                unelevated
                color="primary"
                text-color="white"
                size="md"
                icon="las la-plus"
                :disable="!items.available || !isEligibleItem(items)"
                @click.stop="onClickItem(category, items)"
              />
            </template>
          </div>
        </div>

        <q-badge
          v-if="!items.available"
          color="disabled"
          text-color="disabled"
          :label="$t('Not available')"
          rounded
          class="q-mt-xs"
        />

        <q-tooltip
          v-model="item_tooltip[`${items.item_uuid}${category.cat_id}`]"
          :no-parent-event="true"
        >
          {{ items.item_unavailable }}</q-tooltip
        >
      </q-item-section>
    </q-item>
  </q-list>
  <!-- end item list -->
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useCartStore } from "stores/CartStore";
import { useDataStore } from "stores/DataStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "MenuList",
  props: ["data", "category", "merchant_id", "promoEligibility"],
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
    getPromoMessage(item) {
      return (
        this.promoEligibility[item.item_id]?.message ||
        item?.promo_data?.message
      );
    },
    isEligible(item) {
      return this.promoEligibility[item.item_id]?.is_eligible;
    },
    isEligibleItem(item) {
      if (!item.is_promo_free_item) {
        return true;
      }
      return this.promoEligibility[item.item_id]?.is_eligible || false;
    },
    onSavedfavItem(data, found) {
      data.is_favorite = found;
      // CLEAR HOME PAGE FILTER AND FAV
      this.DataStore.feed_filter = [];
      this.DataStore.fav_saved_data = null;
    },
    onClickItem(category, items) {
      console.log("onClickItem", items);
      const isEligibleItem = this.isEligibleItem(items);
      console.log("isEligibleItem", isEligibleItem);
      if (!isEligibleItem) {
        const message = this.getPromoMessage(items); //items?.promo_data?.message || "";
        APIinterface.ShowAlert(message, this.$q.capacitor, this.$q);
        return;
      }

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
.tagam-menu-list {
  background: transparent;
}

.tagam-menu-item {
  min-height: 114px;
  margin-bottom: 6px;
  padding: 8px 6px;
  border-radius: 18px;
  align-items: flex-start;
  background: #ffffff;
  border: 1px solid rgba(113, 74, 24, 0.06);
  box-shadow: none;
}

.tagam-menu-item__image {
  border-radius: 16px;
  background: #ffffff;
}

.tagam-menu-item__main {
  min-width: 0;
  padding-left: 4px;
}

.tagam-menu-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.tagam-menu-item__tools {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.tagam-menu-item__title {
  font-size: 15px;
  line-height: 1.12;
  font-weight: 800;
  color: #1f150d;
}

.tagam-menu-item__description {
  margin-top: 3px;
  color: #85796b;
  font-size: 11px;
  line-height: 1.28;
  max-height: 42px;
  overflow: hidden;
}

.tagam-menu-item__footer {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.tagam-menu-item__pricing {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex-wrap: wrap;
}

.tagam-menu-item__current-price {
  font-size: 18px;
  line-height: 1;
  font-weight: 900;
  color: #17110b;
}

.tagam-menu-item__old-price {
  font-size: 12px;
  line-height: 1;
  color: #af9782;
  text-decoration: line-through;
}

.tagam-menu-item__discount-hint {
  font-size: 12px;
  line-height: 1;
  font-weight: 700;
  color: #b85b12;
}

.tagam-menu-item__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

.tagam-menu-item__actions :deep(.q-btn) {
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

.tagam-menu-item__actions :deep(.q-btn .q-btn__content) {
  width: 100%;
  height: 100%;
}

.tagam-menu-item__actions :deep(.q-btn .q-icon) {
  font-size: 20px;
}

.tagam-menu-item__qty {
  min-height: 32px;
  min-width: 38px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 999px;
}

.tagam-menu-item__qty-value {
  font-size: 13px;
  font-weight: 800;
}

:global(body.body--dark) .tagam-menu-item {
  background: rgba(39, 31, 27, 0.96) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-menu-item__image {
  background: rgba(47, 37, 33, 0.96) !important;
}

:global(body.body--dark) .tagam-menu-item__title,
:global(body.body--dark) .tagam-menu-item__current-price,
:global(body.body--dark) .tagam-menu-item__qty-value {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-menu-item__description,
:global(body.body--dark) .tagam-menu-item__old-price {
  color: var(--tagam-text-muted) !important;
}
</style>
