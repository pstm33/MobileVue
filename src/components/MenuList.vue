<template>
  <q-list class="tagam-menu-list q-gutter-y-sm">
    <q-item
      clickable
      v-ripple:purple
      v-for="items in data"
      :key="items"
      @click.stop="onClickItem(category, items)"
      class="tagam-menu-item"
      :class="{
        'tagam-menu-item--unavailable':
          !items.available || !category?.available,
      }"
    >
      <q-item-section top avatar>
        <q-responsive class="tagam-menu-item-media" ratio="1">
          <q-img
            :src="items.url_image"
            placeholder-src="placeholder.png"
            lazy
            fit="fill"
            class="tagam-menu-item-image"
            spinner-color="primary"
            spinner-size="sm"
          />
        </q-responsive>
      </q-item-section>
      <q-item-section>
        <q-item-label>
          <div
            class="tagam-menu-item__title text-weight-medium text-subtitle2"
            v-html="items.item_name"
          ></div>
        </q-item-label>
        <q-item-label>
          <div
            class="tagam-menu-item__desc tagam-text-muted ellipsis-2-lines text-caption line-normal"
            v-html="items.item_description"
          ></div>

          <template v-if="items.promo_data?.message && items.available">
            <q-badge
              :color="isEligible(items) ? 'green-1' : 'orange-1'"
              :text-color="isEligible(items) ? 'green-5' : 'orange-5'"
              rounded
              multi-line
            >
              {{ getPromoMessage(items) }}
            </q-badge>
          </template>

          <div class="q-mt-xs q-mb-xs q-gutter-x-sm">
            <template v-for="dish in items.dish_list" :key="dish">
              <q-avatar size="2em" class="bg-yellow-9">
                <img :src="dish.url_image" />
              </q-avatar>
            </template>
          </div>

          <div
            class="tagam-menu-price text-weight-bold text-overline letter-spacing-none"
            :class="{ 'text-green': isEligible(items) }"
          >
            <span v-if="getDiscountBadge(items)" class="tagam-menu-discount-badge">
              {{ getDiscountBadge(items) }}
            </span>
            <template v-if="isEligible(items)">
              {{ $t("Free!") }}
            </template>
            <template v-else>
              <span
                v-if="items.lowest_price_discount_raw > 0"
                class="text-strike text-red"
                >{{ items.lowest_price_discount }}</span
              >
              {{ items.lowest_price }}
            </template>

            <div
              v-if="items.lowest_price_discount_raw <= 0 && items.has_discount"
              class="text-blue-8"
            >
              {{ $t("Check Offers") }}
            </div>
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
        </q-item-label>
      </q-item-section>
      <q-item-section side class="tagam-menu-action-section row items-stretch">
        <div class="tagam-menu-action-rail column items-center col-12 q-gutter-y-sm">
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
                outline
                color="primary"
                round
                size="sm"
                @click.stop="
                  showOptions(findItem(items.item_uuid, category.cat_id))
                "
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
                color="primary"
                text-color="white"
                size="sm"
                icon="las la-plus"
                :disable="!items.available || !isEligibleItem(items)"
                @click.stop="onClickItem(category, items)"
              />
            </template>
          </div>
        </div>
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
import { useHaptics } from "src/composables/useHaptics";

export default {
  name: "MenuList",
  props: ["data", "category", "merchant_id", "promoEligibility"],
  components: {
    FavsItem: defineAsyncComponent(() => import("src/components/FavsItem.vue")),
  },
  setup() {
    const CartStore = useCartStore();
    const DataStore = useDataStore();
    const haptics = useHaptics();
    return { CartStore, DataStore, haptics };
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
    getDiscountBadge(item) {
      if (!item || item.lowest_price_discount_raw <= 0) return "";
      const known =
        item.discount_percentage ||
        item.discount_percent ||
        item.price_discount_percentage ||
        item.promo_data?.discount;
      if (known) return String(known).includes("%") ? known : `-${known}%`;
      return this.$t("Discount");
    },
    onSavedfavItem(data, found) {
      data.is_favorite = found;
      // CLEAR HOME PAGE FILTER AND FAV
      this.DataStore.feed_filter = [];
      this.DataStore.fav_saved_data = null;
    },
    onClickItem(category, items) {
      const isEligibleItem = this.isEligibleItem(items);
      if (!isEligibleItem) {
        const message = this.getPromoMessage(items); //items?.promo_data?.message || "";
        APIinterface.ShowAlert(message, this.$q.capacitor, this.$q);
        this.haptics.warningSoft();
        return;
      }

      if (!items.available) {
        this.item_tooltip[`${items.item_uuid}${category.cat_id}`] = true;
        setTimeout(() => {
          this.item_tooltip[`${items.item_uuid}${category.cat_id}`] = false;
        }, 2000);
        this.haptics.warning();
        return false;
      }

      this.haptics.impact("light");
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

<style lang="sass" scoped>
.tagam-menu-list
  padding: 0

.tagam-menu-item
  border: 1px solid var(--tagam-border)
  border-radius: 22px
  background: linear-gradient(135deg, var(--tagam-surface), var(--tagam-surface-elevated))
  box-shadow: 0 12px 28px rgba(22, 28, 45, 0.07)
  overflow: hidden
  transition: transform 170ms ease, box-shadow 170ms ease, border-color 170ms ease

.tagam-menu-item:hover
  transform: translateY(-1px)
  border-color: rgba(255, 107, 53, 0.22)
  box-shadow: var(--tagam-shadow)

.tagam-menu-item :deep(.q-item__section--avatar)
  min-width: 144px

.tagam-menu-item-media
  width: 128px
  height: 128px

.tagam-menu-item-image
  width: 128px
  height: 128px
  border-radius: 22px !important
  background: var(--tagam-surface-muted)

.tagam-menu-item__title
  color: var(--tagam-text)
  font-weight: 900 !important
  line-height: 1.2
  font-size: 15px

.tagam-menu-item__desc
  color: var(--tagam-text-muted) !important
  margin-top: 3px

.tagam-menu-price
  display: flex
  align-items: center
  flex-wrap: wrap
  gap: 6px
  margin-top: 6px
  font-size: 15px
  color: var(--tagam-text)
  line-height: 1.1

.tagam-menu-discount-badge
  display: inline-flex
  align-items: center
  min-height: 22px
  padding: 0 8px
  border-radius: 999px
  background: var(--tagam-text)
  color: var(--tagam-surface)
  font-size: 11px
  font-weight: 900

.tagam-menu-action-section
  min-width: 46px
  padding-left: 8px

.tagam-menu-action-rail
  padding: 1px 0
  min-width: 40px

.tagam-menu-action-rail :deep(.q-btn)
  box-shadow: none

.tagam-menu-action-rail :deep(.q-btn.bg-primary)
  width: 38px
  height: 38px
  box-shadow: 0 10px 22px rgba(255, 107, 53, 0.26)
</style>




