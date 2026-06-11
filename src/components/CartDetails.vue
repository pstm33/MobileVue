<template>
  <!-- LOADING -->
  <DIV v-if="CartStore.cart_loading">
    <q-list>
      <q-item v-for="items in 3" :key="items">
        <q-item-section avatar>
          <q-skeleton type="circle" />
        </q-item-section>
        <q-item-section>
          <q-skeleton type="text" style="width: 80%" />
          <q-skeleton type="text" />
          <q-skeleton type="text" style="width: 20%" />
        </q-item-section>
      </q-item>
    </q-list>
  </DIV>
  <!-- LOADING -->

  <DIV v-else>
    <template v-if="CartStore.hasItem">
      <q-list dense class="tagam-cart-items q-gutter-y-sm">
        <template v-for="(items, index) in getItems" :key="items.item_id">
          <q-slide-item
            @right="(opt) => onRight(opt, index)"
            left-color="transparent"
            right-color="transparent"
          >
            <template v-slot:right>
              <div class="row items-center inline q-gutter-x-md">
                  <q-btn
                    round
                    unelevated
                    color="primary"
                    text-color="primary"
                    size="sm"
                    icon="las la-times"
                    class="tagam-soft-icon-btn"
                    @click="closeSlide(index)"
                  />
                <FavsItem
                  ref="favs"
                  :layout="2"
                  :item_token="items.item_token"
                  :cat_id="items.cat_id"
                  :active="false"
                  size="md"
                  @after-savefav="afterSavefav(items)"
                />
                  <q-btn
                    round
                    unelevated
                    color="primary"
                    text-color="primary"
                    size="sm"
                    icon="las la-trash-alt"
                    class="tagam-soft-icon-btn"
                    @click="removeItem(items)"
                  />
              </div>
            </template>
            <template v-slot:default>
              <q-item
                class="tagam-cart-item-card"
                :class="{
                  //'tagam-surface-elevated text-white': $q.dark.mode,
                  'tagam-surface tagam-text-main': !$q.dark.mode,
                }"
                clickable
              >
                <q-item-section avatar top>
                  <template v-if="is_checkout">
                    <div class="relative-position tagam-cart-item-thumb-wrap">
                      <q-responsive ratio="1">
                        <q-img
                          v-if="getItemImage(items)"
                          :src="getItemImage(items)"
                          lazy
                          fit="fill"
                          class="tagam-cart-item-image tagam-media-1x1"
                          spinner-color="secondary"
                          spinner-size="sm"
                          placeholder-src="placeholder.png"
                        />
                        <div v-else class="tagam-cart-item-placeholder">
                          <q-icon name="restaurant" size="24px" />
                        </div>
                      </q-responsive>
                    </div>
                  </template>
                  <template v-else>
                    <div class="relative-position tagam-cart-item-thumb-wrap">
                      <q-responsive ratio="1">
                        <q-img
                          v-if="getItemImage(items)"
                          :src="getItemImage(items)"
                          lazy
                          fit="fill"
                          class="tagam-cart-item-thumb tagam-media-1x1"
                          spinner-color="secondary"
                          spinner-size="sm"
                          placeholder-src="placeholder.png"
                        />
                        <div v-else class="tagam-cart-item-placeholder">
                          <q-icon name="restaurant" size="22px" />
                        </div>
                      </q-responsive>
                    </div>
                  </template>
                </q-item-section>
                <q-item-section top>
                  <div class="text-subtitle2 line-normal">
                    {{ items.item_name }}
                  </div>
                  <div class="text-caption" v-if="items.price.size_name != ''">
                    ({{ items.price.size_name }})
                  </div>

                  <div v-if="items.is_free">
                    <q-badge color="green-5" rounded outline>
                      {{ $t("Free") }}
                    </q-badge>
                  </div>

                  <!-- details -->
                  <div class="text-caption tagam-text-muted">
                    <div v-if="items.attributes">
                      <template
                        v-for="attributes in items.attributes"
                        :key="attributes"
                      >
                        <template
                          v-for="attributes_data in attributes"
                          :key="attributes_data"
                        >
                          <span class="q-mr-xs" v-if="attributes_data"
                            >{{ attributes_data }},</span
                          >
                        </template>
                      </template>
                    </div>

                    <template v-for="addons in items.addons" :key="addons">
                      <div
                        v-for="addon_items in addons.addon_items"
                        :key="addon_items"
                      >
                        {{ addon_items.sub_item_name }}
                      </div>
                    </template>

                    <div
                      v-if="items.special_instructions != ''"
                      class="tagam-text-muted"
                    >
                      "{{ items.special_instructions }}"
                    </div>
                  </div>
                  <!-- details -->
                </q-item-section>
                <q-item-section side top class="tagam-cart-item-side">
                  <div class="tagam-cart-item-price">
                    {{ items.subtotal_pretty }}
                  </div>
                  <div
                    class="tagam-cart-qty-control flex items-center justify-between"
                  >
                    <q-btn
                      v-if="items.qty == 1"
                      unelevated
                      dense
                      size="11px"
                      icon="eva-trash-outline"
                      flat
                      color="red"
                      @click="removeItem(items)"
                    />
                    <q-btn
                      v-else
                      unelevated
                      dense
                      size="11px"
                      icon="remove"
                      color="primary"
                      flat
                      @click="updateCartQty(-1, items.qty, items)"
                    />
                    <div class="text-weight-medium text-caption">
                      {{ items.qty }}
                    </div>
                    <q-btn
                      unelevated
                      dense
                      size="11px"
                      icon="add"
                      color="primary"
                      flat
                      @click="updateCartQty(1, items.qty, items)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </template>
          </q-slide-item>
        </template>

        <q-separator v-if="CartStore.getCartCount > maxVisible"></q-separator>

        <q-item
          clickable
          v-if="CartStore.getCartItemsCount > maxVisible"
          @click="toggleShowMore"
        >
          <q-item-section>
            <q-item-label caption>
              {{ showMore ? $t("Show Less") : $t("Show More") }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              :name="
                showMore ? 'eva-chevron-up-outline' : 'eva-chevron-down-outline'
              "
              class="tagam-text-muted"
            ></q-icon>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
    <!-- end items count -->

    <!-- <template v-else> You don't have any orders here! </template> -->
  </DIV>
  <!-- end loading card -->

  <ItemDetailsCheckbox
    ref="item_details2"
    :slug="CartStore.getMerchantId"
    :money_config="money_config"
    :currency_code="currency_code"
    :cart_uuid="CartStore.getCartID"
    @after-additems="afterAdditems"
  />
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useCartStore } from "src/stores/CartStore";
import { useHaptics } from "src/composables/useHaptics";

export default {
  name: "CartDetails",
  props: [
    "payload",
    "is_checkout",
    "page",
    "item_visible",
    "money_config",
    "currency_code",
  ],
  components: {
    FavsItem: defineAsyncComponent(() => import("components/FavsItem.vue")),
    ItemDetailsCheckbox: defineAsyncComponent(() =>
      import("components/ItemDetailsCheckbox.vue")
    ),
  },
  data() {
    return {
      loading: false,
      items_count: 0,
      cart_loading: true,
      cart_reloading: false,
      cart_uuid: "",
      cart_items: [],
      cart_summary: [],
      cart_merchant: [],
      cart_total: [],
      cart_subtotal: [],
      error: [],
      qty_options: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      transaction_data: [],
      delivery_option: [],
      services_list: [],
      out_of_range: false,
      is_close_slide: false,
      data_slide: {},
      maxVisible: this.item_visible,
      showMore: false,
    };
  },
  setup() {
    const CartStore = useCartStore();
    const haptics = useHaptics();
    return { CartStore, haptics };
  },
  computed: {
    getItems() {
      if (this.CartStore.getItems) {
        return this.showMore
          ? this.CartStore.getItems
          : this.CartStore.getItems.slice(0, this.maxVisible);
      }
      return null;
    },
  },
  methods: {
    editItems(value) {
      this.haptics.impact("light");
      const params = {
        cat_id: value.cat_id,
        item_uuid: value.item_token,
        cart_row: value.cart_row,
      };
      this.$refs.item_details2.showItem2(params, this.CartStore.getMerchantId);
    },
    afterAdditems() {
      this.CartStore.getCart(false, this.payload);
    },
    toggleShowMore() {
      this.haptics.impact("light");
      this.showMore = !this.showMore;
    },
    updateCartQty(Qty, itemQty, item) {
      let QtyTotal = itemQty + Qty;
      if (QtyTotal <= 0) {
        return;
      }
      if (Qty > 0) {
        this.haptics.impact("light");
      } else {
        this.haptics.warningHard();
      }
      item.qty = QtyTotal;
      this.updateCartItems(QtyTotal, item);
    },
    updateCartItems(itemQty, item) {
      this.loading = true;
      APIinterface.updateCartItems(
        this.CartStore.getCartID,
        item.cart_row,
        itemQty
      )
        .then((data) => {
          this.haptics.success();
          this.CartStore.getCart(false, this.payload);
        })
        .catch((error) => {
          this.haptics.warning();
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          if (itemQty <= 0) {
            this.haptics.warningHard();
          }
          this.loading = false;
        });
    },
    closeSlide(index) {
      if (this.data_slide[index]) {
        this.data_slide[index].reset();
      }
    },
    onRight(details, index) {
      this.data_slide[index] = details;
    },
    removeItem(items) {
      this.haptics.warningHard();
      this.loading = true;
      APIinterface.removeCartItem(this.CartStore.getCartID, items.cart_row)
        .then((data) => {
          this.CartStore.getCart(false, this.payload);
          this.$emit("afterRemoveitem");
        })
        .catch((error) => {
          this.haptics.warning();
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    clearCart() {
      this.loading = false;
      APIinterface.clearCart(APIinterface.getStorage("cart_uuid"))
        .then((data) => {
          this.CartStore.getCart(false, this.payload);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    afterSavefav(item) {
      this.removeItem(item);
    },
    getItemImage(item) {
      const asString = (value) => {
        if (!value) return "";
        if (typeof value === "string") {
          return value.trim();
        }
        if (typeof value !== "object") {
          return "";
        }
        return (
          asString(value.url) ||
          asString(value.image_url) ||
          asString(value.photo_url) ||
          asString(value.path) ||
          asString(value.src) ||
          asString(value.image) ||
          ""
        );
      };

      const imageBucket = [
        item?.item_image,
        item?.image_url,
        item?.photo_url,
        item?.item?.url_image,
        item?.item?.image,
        item?.item?.photo,
        item?.item?.photo_url,
        item?.item?.item_image,
        item?.item?.image_url,
        item?.item?.images,
        item?.item?.image,
        item?.item?.photo,
        item?.url_image,
        item?.image,
        item?.photo,
        item?.thumbnail,
        item?.featured_image,
        item?.menu_image,
        item?.image_url_small,
        item?.item?.image_url_small,
      ];

      const directImage = imageBucket.map(asString).find((value) => Boolean(value));
      if (directImage) return directImage;

      if (Array.isArray(item?.item_images) && item.item_images.length) {
        return asString(item.item_images[0]?.image_url);
      }

      if (Array.isArray(item?.item?.item_images) && item.item.item_images.length) {
        return asString(item.item.item_images[0]?.url);
      }

      return "";
    },
    lineItemTotal(qty, price) {
      return parseFloat(price) * parseInt(qty);
    },
  },
};
</script>

<style lang="sass" scoped>
.tagam-cart-items
  padding: 0

.tagam-cart-item-card
  border: 1px solid var(--tagam-border)
  border-radius: var(--tagam-radius-card)
  background: var(--tagam-surface) !important
  box-shadow: var(--tagam-shadow-soft)
  overflow: hidden

.tagam-cart-item-card :deep(.q-item__section--avatar)
  min-width: 96px

.tagam-cart-item-image
  width: 80px
  height: 80px
  border-radius: 18px !important
  background: var(--tagam-surface-muted)

.tagam-cart-item-thumb-wrap
  width: 80px
  height: 80px
  border-radius: 18px
  overflow: hidden
  background: var(--tagam-surface-muted)
  box-shadow: var(--tagam-shadow-soft)

.tagam-cart-item-thumb
  width: 80px
  height: 80px
  border-radius: 18px !important
  background: var(--tagam-surface-muted)

.tagam-cart-item-placeholder
  width: 100%
  height: 100%
  display: grid
  place-items: center
  border-radius: 18px
  color: var(--tagam-primary)
  background: var(--tagam-primary-soft)

.tagam-cart-qty-control
  width: 74px
  min-height: 26px
  padding: 0 2px
  border: 1px solid var(--tagam-border)
  border-radius: 999px
  background: var(--tagam-surface-glass)
  backdrop-filter: blur(12px)
  font-size: 12px
  line-height: 1

.tagam-cart-qty-control :deep(.q-btn)
  width: 22px
  min-width: 22px
  height: 22px
  min-height: 22px
  padding: 0 !important

.tagam-cart-qty-control :deep(.q-icon)
  font-size: 16px

.tagam-cart-item-side
  min-width: 86px
  align-items: flex-end
  gap: 8px

.tagam-cart-item-price
  color: var(--tagam-text-muted)
  font-size: 16px
  font-weight: 700
  line-height: 1.2

.tagam-cart-item-qty-badge
  position: absolute
  left: 6px
  top: 6px
  min-width: 28px
  height: 24px
  padding: 0 8px
  display: inline-flex
  align-items: center
  justify-content: center
  border-radius: 999px
  color: var(--tagam-primary)
  background: rgba(255, 255, 255, 0.84)
  border: 1px solid rgba(255, 107, 53, 0.24)
  backdrop-filter: blur(10px)
  font-size: 12px
  font-weight: 900
  line-height: 1
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14)

body.body--dark .tagam-cart-item-qty-badge
  color: #fff4ef
  background: rgba(255, 107, 53, 0.88)
  border-color: rgba(255, 180, 150, 0.38)
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.34), 0 0 0 1px rgba(255, 255, 255, 0.06) inset

.tagam-soft-icon-btn
  background: var(--tagam-surface-glass) !important
  border: 1px solid var(--tagam-border)
  color: var(--tagam-primary) !important
  box-shadow: var(--tagam-shadow-soft)

.tagam-qty-chip
  border-color: var(--tagam-border) !important
  background: var(--tagam-surface-glass) !important
  border-radius: var(--tagam-radius-pill) !important
</style>





