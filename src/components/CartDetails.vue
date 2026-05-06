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
      <q-list separator dense class="tagam-cart-details-list">
        <template v-for="(items, index) in getItems" :key="items.item_id">
          <q-slide-item
            @right="(opt) => onRight(opt, index)"
            left-color="white"
            :right-color="$q.dark.mode ? 'grey600' : 'white'"
            class="tagam-cart-slide"
          >
            <template v-slot:right>
              <div class="row items-center inline q-gutter-x-md">
                <q-btn
                  round
                  unelevated
                  color="lightprimary"
                  text-color="primary"
                  size="sm"
                  icon="las la-times"
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
                  color="lightprimary"
                  text-color="primary"
                  size="sm"
                  icon="las la-trash-alt"
                  @click="removeItem(items)"
                />
              </div>
            </template>
            <template v-slot:default>
              <q-item
                class="tagam-cart-item"
                :class="{
                  //'bg-mydark text-white': $q.dark.mode,
                  'bg-white text-black': !$q.dark.mode,
                }"
                clickable
              >
                <q-item-section avatar top class="tagam-cart-item__media">
                  <template v-if="is_checkout">
                    <q-responsive class="tagam-cart-item__image-frame">
                      <q-img
                        :src="getCartItemImage(items)"
                        lazy
                        fit="cover"
                        class="tagam-cart-item__image"
                        spinner-color="secondary"
                        spinner-size="sm"
                        placeholder-src="placeholder.png"
                      />
                    </q-responsive>
                  </template>
                  <template v-else>
                    <q-btn
                      outline
                      no-caps
                      size="12px"
                      padding="2px 5px"
                      color="grey-2"
                    >
                      <div class="text-blue-grey-6 text-weight-bold">
                        {{ items.qty }}x
                      </div>
                    </q-btn>
                  </template>
                </q-item-section>
                <q-item-section top class="tagam-cart-item__content">
                  <template v-if="is_checkout">
                    <div class="tagam-cart-item__topline">
                      <div class="text-subtitle2 line-normal tagam-cart-item__title">
                        {{ items.item_name }}
                      </div>
                      <div class="tagam-cart-item__price">
                        {{ items.subtotal_pretty }}
                      </div>
                    </div>

                    <div
                      class="text-caption tagam-cart-item__size"
                      v-if="items.price.size_name != ''"
                    >
                      {{ items.price.size_name }}
                    </div>

                    <div v-if="items.is_free" class="q-mt-xs">
                      <q-badge color="green-5" rounded outline>
                        {{ $t("Free") }}
                      </q-badge>
                    </div>

                    <div class="text-caption text-grey-7 tagam-cart-item__details">
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
                        class="text-blue-grey-6"
                      >
                        "{{ items.special_instructions }}"
                      </div>
                    </div>

                    <div class="tagam-cart-item__footer">
                      <q-btn
                        :label="$t('Edit')"
                        no-caps
                        text-color="blue"
                        padding="5px 0px"
                        flat
                        align="left"
                        class="tagam-cart-item__edit"
                        @click="editItems(items)"
                      ></q-btn>

                      <div
                        class="bg-white radius28 border-grey flex items-center justify-between tagam-cart-item__qty tagam-cart-item__qty--inline"
                      >
                        <div>
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
                        </div>
                        <div class="text-weight-medium text-caption">
                          {{ items.qty }}
                        </div>
                        <div>
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
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="text-subtitle2 line-normal tagam-cart-item__title">
                      {{ items.item_name }}
                    </div>
                    <div
                      class="text-caption tagam-cart-item__size"
                      v-if="items.price.size_name != ''"
                    >
                      ({{ items.price.size_name }})
                    </div>

                    <div v-if="items.is_free">
                      <q-badge color="green-5" rounded outline>
                        {{ $t("Free") }}
                      </q-badge>
                    </div>

                    <div class="text-caption text-grey-7 tagam-cart-item__details">
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
                        class="text-blue-grey-6"
                      >
                        "{{ items.special_instructions }}"
                      </div>
                    </div>

                    <q-btn
                      :label="$t('Edit')"
                      no-caps
                      text-color="blue"
                      padding="5px 0px"
                      flat
                      align="left"
                      class="tagam-cart-item__edit"
                      @click="editItems(items)"
                    ></q-btn>
                  </template>
                </q-item-section>
                <q-item-section v-if="!is_checkout" side top class="tagam-cart-item__side">
                  <div class="tagam-cart-item__price">
                    {{ items.subtotal_pretty }}
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
              class="text-grey-4"
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
import { useDataStorePersisted } from "stores/DataStorePersisted";

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
      menuImageMap: {},
      menuImagesLoading: false,
    };
  },
  setup() {
    const CartStore = useCartStore();
    const DataStorePersisted = useDataStorePersisted();
    return { CartStore, DataStorePersisted };
  },
  mounted() {
    this.$watch(
      () => [this.CartStore.getMerchant, this.CartStore.getItems],
      () => {
        this.maybeLoadCartImages();
      },
      { immediate: true, deep: true }
    );
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
    getCartItemImage(item) {
      return (
        item?.url_image ||
        item?.photo_url ||
        item?.image_url ||
        item?.photo ||
        item?.image ||
        item?.url_photo_x2 ||
        item?.url_photo ||
        item?.featured_image ||
        item?.item_images?.[0]?.url_image ||
        item?.item_images?.[0]?.image_url ||
        item?.item_images?.[0]?.photo_url ||
        this.menuImageMap[item?.item_token] ||
        this.menuImageMap[item?.item_uuid] ||
        this.menuImageMap[item?.item_id] ||
        "placeholder.png"
      );
    },
    async maybeLoadCartImages() {
      if (this.menuImagesLoading || Object.keys(this.menuImageMap).length > 0) {
        return;
      }

      const items = this.CartStore.getItems || [];
      if (!items.length) {
        return;
      }

      const needsImages = items.some((item) => !this.getCartItemImage(item) || this.getCartItemImage(item) === "placeholder.png");
      if (!needsImages) {
        return;
      }

      const merchant = this.CartStore.getMerchant || {};
      const merchantSlug =
        merchant?.slug ||
        merchant?.restaurant_slug ||
        merchant?.merchant_slug ||
        merchant?.store_slug ||
        this.DataStorePersisted?.merchant_slug;

      if (!merchantSlug) {
        return;
      }

      try {
        this.menuImagesLoading = true;
        const response = await APIinterface.geStoreMenu(
          merchantSlug,
          this.DataStorePersisted?.useCurrency
        );
        const menuData = response?.details?.data || {};
        const menuItems = menuData?.items || {};
        const categoryItems = (menuData?.category || []).flatMap((category) =>
          Array.isArray(category?.item_list) ? category.item_list : []
        );
        const imageMap = {};

        [...Object.values(menuItems), ...categoryItems].forEach((menuItem) => {
          const image =
            menuItem?.url_image ||
            menuItem?.photo_url ||
            menuItem?.image_url ||
            menuItem?.photo ||
            menuItem?.image ||
            menuItem?.featured_image;

          if (!image) {
            return;
          }

          if (menuItem?.item_uuid) {
            imageMap[menuItem.item_uuid] = image;
          }
          if (menuItem?.item_token) {
            imageMap[menuItem.item_token] = image;
          }
          if (menuItem?.item_id) {
            imageMap[menuItem.item_id] = image;
          }
        });

        this.menuImageMap = imageMap;
      } catch (error) {
        // Ignore menu image fallback errors.
      } finally {
        this.menuImagesLoading = false;
      }
    },
    editItems(value) {
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
      this.showMore = !this.showMore;
    },
    updateCartQty(Qty, itemQty, item) {
      let QtyTotal = itemQty + Qty;
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
          this.CartStore.getCart(false, this.payload);
        })
        .catch((error) => {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    closeSlide(index) {
      if (this.data_slide[index]) {
        console.log(this.data_slide[index]);
        this.data_slide[index].reset();
      }
    },
    onRight(details, index) {
      this.data_slide[index] = details;
    },
    removeItem(items) {
      this.loading = true;
      APIinterface.removeCartItem(this.CartStore.getCartID, items.cart_row)
        .then((data) => {
          this.CartStore.getCart(false, this.payload);
          this.$emit("afterRemoveitem");
        })
        .catch((error) => {
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
    lineItemTotal(qty, price) {
      console.log(qty + "x" + price);
      return parseFloat(price) * parseInt(qty);
    },
  },
};
</script>

<style scoped>
.tagam-cart-details-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tagam-cart-slide {
  border-radius: 24px;
  overflow: hidden;
}

.tagam-cart-item {
  min-height: 150px;
  padding: 14px;
  border: 1px solid rgba(113, 74, 24, 0.1);
  border-radius: 24px;
  background: rgba(255, 252, 246, 0.96) !important;
  box-shadow: 0 14px 30px rgba(71, 42, 13, 0.08);
}

.tagam-cart-item__media {
  min-width: 92px;
  padding-right: 14px;
  align-items: flex-start;
}

.tagam-cart-item__image-frame {
  width: 92px;
  height: 92px;
  aspect-ratio: 1 / 1;
  border-radius: 18px;
  overflow: hidden;
  background: #f3eadb;
  border: 1px solid rgba(113, 74, 24, 0.08);
}

.tagam-cart-item__image {
  width: 100%;
  height: 100%;
}

.tagam-cart-item__qty {
  min-width: 96px;
  padding: 2px 4px;
  box-shadow: 0 8px 18px rgba(39, 24, 8, 0.16);
  align-self: flex-start;
}

.tagam-cart-item__side {
  align-items: flex-end;
  gap: 8px;
  padding-left: 10px;
}

.tagam-cart-item__qty--side {
  min-width: 98px;
}

.tagam-cart-item__content {
  min-width: 0;
}

.tagam-cart-item__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.tagam-cart-item__title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 16px;
  line-height: 1.14;
  font-weight: 900;
  color: #20160f;
}

.tagam-cart-item__size {
  margin-top: 4px;
  color: #8b6d53;
}

.tagam-cart-item__details {
  margin-top: 6px;
  line-height: 1.35;
  color: #776757 !important;
}

.tagam-cart-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
}

.tagam-cart-item__edit {
  min-height: auto;
  color: #d96b1d !important;
  font-weight: 800;
  font-size: 13px;
}

.tagam-cart-item__price {
  flex: 0 0 auto;
  font-size: 16px;
  font-weight: 900;
  color: #20160f;
  white-space: nowrap;
  line-height: 1.1;
}

.tagam-cart-item__qty--inline {
  min-width: 108px;
  padding: 4px 8px;
}

:deep(.tagam-cart-details-list .q-list--separator > .q-item-type + .q-item-type),
:deep(.tagam-cart-details-list.q-list--separator > .q-item-type + .q-item-type) {
  border-top: 0;
}

:deep(.tagam-cart-item .q-btn) {
  border-radius: 16px;
}

:global(body.body--dark) .tagam-cart-item {
  background: var(--tagam-surface-raised) !important;
  border-color: var(--tagam-stroke);
  box-shadow: var(--tagam-shadow);
}

:global(body.body--dark) .tagam-cart-item__image-frame {
  background: rgba(255, 239, 231, 0.05);
  border-color: var(--tagam-stroke);
}

:global(body.body--dark) .tagam-cart-item__title,
:global(body.body--dark) .tagam-cart-item__price {
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-cart-item__size,
:global(body.body--dark) .tagam-cart-item__details {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-cart-item__qty {
  background: rgba(36, 29, 26, 0.96);
}
</style>
