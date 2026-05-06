<template>
  <q-dialog
    v-model="item_dialog"
    position="bottom"
    persistentx
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="beforeShow"
  >
    <q-card class="rounded-borders-top item-sheet">
      <template v-if="loading">
        <q-card>
          <q-skeleton height="180px" square />
          <q-item>
            <q-item-section avatar>
              <q-skeleton type="QAvatar" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" />
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </template>
      <DIV v-else>
        <q-card class="no-shadow">
          <q-toolbar
            v-if="!is_scroll"
            class="bg-white text-dark border-bottom"
            style="position: sticky; top: 0; z-index: 10"
          >
            <q-toolbar-title>
              <q-intersection transition="slide-right">
                {{ items.item_name }}
              </q-intersection>
            </q-toolbar-title>
            <q-btn
              flat
              dense
              icon="close"
              v-close-popup
              :color="$q.dark.mode ? 'primary' : 'grey'"
            />
          </q-toolbar>
          <q-card-section
            class="item-sheet__hero-wrap no-wrap q-pa-none bg-mygreyx relative-position bn"
            :class="{
              'bg-grey600 ': $q.dark.mode,
              'bg-mygrey ': !$q.dark.mode,
            }"
          >
            <q-img
              ref="heroImage"
              class="item-sheet__hero"
              :src="this.image_featured ? this.image_featured : items.url_image"
              placeholder-src="placeholder.png"
              fit="fill"
              spinner-color="primary"
              spinner-size="xs"
            ></q-img>
            <div class="q-pa-sm absolute-top-right">
              <q-btn
                icon="close"
                :color="$q.dark.mode ? 'primary' : 'grey'"
                flat
                round
                dense
                v-close-popup
              />
            </div>
          </q-card-section>
          <q-card-section class="item-sheet__content">
            <div v-intersection="onIntersection"></div>
            <div class="row items-center q-mb-xs item-sheet__title-row">
              <div class="col">
                <div class="line-normal ellipsis-2-lines text-h6">
                  <span v-html="items.item_name"></span>
                </div>
              </div>
              <div class="text-right col-5 q-gutter-sm">
                <FavsItem
                  ref="favs"
                  :layout="1"
                  :item_token="items.item_token"
                  :cat_id="items.cat_id"
                  :active="items.save_item"
                  @after-savefav="afterSavefav(items)"
                />

                <ShareComponents
                  :title="items.item_name"
                  :text="items.item_description"
                  :dialogTitle="$t('Share')"
                  :url="deep_link + '/item/' + items.item_token"
                  :layout="2"
                >
                </ShareComponents>
              </div>
            </div>

            <TextComponents
              :description="items.item_description"
              max_lenght="100"
              class_name=" text-grey text-subtitle2 line-normal"
              :label="{
                read_less: $t('Read less'),
                read_more: $t('Read More'),
              }"
            >
            </TextComponents>

            <ItemGallery :item_gallery="item_gallery"></ItemGallery>

            <div
              v-if="size_datas[item_size_id]?.earning_points > 0"
              class="q-mb-sm"
            >
              <q-badge color="orange-1" text-color="orange-9">
                {{ size_datas[item_size_id]?.earning_points_label ?? "" }}
              </q-badge>
            </div>

            <!-- SIZE  -->
            <div class="q-mb-sm">
              <div
                class="text-subtitle2 text-weight-bold no-margin line-normal q-pb-sm"
              >
                {{ $t("Size") }}
              </div>

              <q-option-group
                v-model="item_size_id"
                :options="size_data"
                inline
              >
                <template v-slot:label="opt">
                  <template v-if="opt.discount > 0">
                    <span class="text-strike text-red q-mr-xs">{{
                      opt.original_price
                    }}</span>
                    <span>{{ opt.label }}</span>
                  </template>
                  <template v-else>
                    {{ opt.label }}
                  </template>
                </template>
              </q-option-group>
            </div>
            <!-- SIZE  -->

            <!-- Cooking Reference  -->
            <div v-if="cooking_data.length > 0" class="q-mb-sm">
              <div
                class="text-subtitle2 text-weight-bold no-margin line-normal"
              >
                {{ $t("Cooking Reference") }}
              </div>
              <div
                v-if="items.cooking_ref_required"
                class="text-red font12 text-weight-medium q-mb-sm"
              >
                ({{ $t("Required") }})
              </div>
              <div v-else class="text-grey font12 text-weight-medium q-mb-sm">
                {{ $t("Optional") }}
              </div>

              <q-option-group
                v-model="cooking_ref"
                :options="cooking_data"
                inline
              />
            </div>
            <!-- Cooking Reference  -->

            <!-- Ingredients  -->
            <div v-if="ingredients_data.length > 0" class="q-mb-sm">
              <div
                class="text-subtitle2 text-weight-bold no-margin line-normal"
              >
                {{ $t("Ingredients") }}
              </div>
              <div class="text-grey text-caption text-weight-medium q-mb-sm">
                {{ $t("Optional") }}
              </div>

              <q-option-group
                v-model="ingredients"
                :options="ingredients_data"
                inline
                type="checkbox"
                checked-icon="check_box"
                unchecked-icon="square"
              />
            </div>
            <!-- Ingredients  -->

            <!-- ADDONS -->
            <!-- <pre>{{ addons[item_size_id] }}</pre> -->
            <template v-if="addons[item_size_id]">
              <template
                v-for="addons in addons[item_size_id]"
                :key="addons.subcat_id"
              >
                <DIV class="q-mb-md">
                  <div
                    class="row justify-between items-center text-caption no-margin line-normal q-pa-sm radius8"
                    :class="{
                      'bg-mygrey ': !$q.dark.mode,
                    }"
                  >
                    <div>
                      <div class="text-weight-bold text-subtitle2">
                        {{ addons.subcategory_name }}
                      </div>
                      <template v-if="addons.multi_option === 'one'">
                        {{ $t("Select 1") }}
                      </template>
                      <template v-else-if="addons.multi_option === 'multiple'">
                        <template v-if="addons.multi_option_min > 0">
                          {{ $t("Select minimum") }}
                          {{ addons.multi_option_min }} {{ $t("to maximum") }}
                          {{ addons.multi_option_value }}
                        </template>
                        <template v-else>
                          {{ $t("Choose up to") }}
                          {{ addons.multi_option_value }}
                        </template>
                      </template>
                      <template v-else-if="addons.multi_option === 'custom'">
                        <template v-if="addons.multi_option_min > 0">
                          {{ $t("Select minimum") }}
                          {{ addons.multi_option_min }} {{ $t("to maximum") }}
                          {{ addons.multi_option_value }}
                        </template>
                        <template v-else>
                          {{ $t("Choose up to") }}
                          {{ addons.multi_option_value }}
                        </template>
                      </template>
                    </div>
                    <div class="">
                      <template v-if="addons.require_addon == 1">
                        <span class="q-ml-sm text-red"
                          >({{ $t("Required") }})</span
                        >
                      </template>
                      <template v-else>
                        <span class="q-ml-sm">({{ $t("Optional") }})</span>
                      </template>
                    </div>
                  </div>

                  <!-- addons -->
                  <q-list>
                    <q-item
                      v-for="(sub_items, index) in addons.sub_items.slice(
                        0,
                        visibleCount
                      )"
                      :key="index"
                      v-ripple
                      :tag="
                        addons.multi_option === 'multiple' ? 'div' : 'label'
                      "
                    >
                      <template v-if="addons.multi_option === 'one'">
                        <q-item-section avatar>
                          <q-radio
                            v-model="addons.sub_items_checked"
                            :val="sub_items.sub_item_id"
                            color="primary"
                            size="md"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{
                            sub_items.sub_item_name
                          }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-item-label caption>{{
                            sub_items.pretty_price
                          }}</q-item-label>
                        </q-item-section>
                      </template>

                      <template v-else-if="addons.multi_option === 'custom'">
                        <q-item-section avatar>
                          <q-checkbox
                            v-model="sub_items.checked"
                            :val="sub_items.sub_item_id"
                            label=""
                            :disable="sub_items.disabled"
                            color="primary"
                            size="md"
                          >
                          </q-checkbox>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{
                            sub_items.sub_item_name
                          }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-item-label caption>{{
                            sub_items.pretty_price
                          }}</q-item-label>
                        </q-item-section>
                      </template>

                      <template v-else-if="addons.multi_option === 'multiple'">
                        <q-item-section :side="!sub_items.checked">
                          <div
                            v-if="sub_items.checked == true"
                            class="border-primary q-pa-xs radius28 flex items-center q-gutter-x-xs"
                            style="max-width: 100px"
                          >
                            <q-btn
                              flat
                              size="sm"
                              padding="3px 7px"
                              icon="eva-minus-outline"
                              color="grey"
                              @click="
                                sub_items.qty > 1
                                  ? sub_items.qty--
                                  : (sub_items.checked = false)
                              "
                            ></q-btn>
                            <div class="text-caption">
                              {{ sub_items.qty }}
                            </div>
                            <div>
                              <q-btn
                                @click="sub_items.qty++"
                                flat
                                size="sm"
                                padding="3px 7px"
                                icon="eva-plus-outline"
                                color="grey"
                                :disabled="sub_items.disabled"
                              ></q-btn>
                            </div>
                          </div>
                          <div v-else>
                            <q-btn
                              @click="sub_items.checked = true"
                              round
                              unelevated
                              dense
                              size="11px"
                              color="grey-4"
                              icon="add"
                              :disabled="sub_items.disabled"
                            />
                          </div>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{
                            sub_items.sub_item_name
                          }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-item-label caption>{{
                            sub_items.pretty_price
                          }}</q-item-label>
                        </q-item-section>
                      </template>
                    </q-item>
                  </q-list>

                  <q-btn
                    v-if="visibleCount < addons.sub_items.length"
                    @click="showMore(addons.sub_items.length)"
                    :label="getRemainingItems(addons.sub_items.length)"
                    color="primary"
                    flat
                    no-caps
                    icon="eva-chevron-down-outline"
                  />
                  <!-- end addons -->
                </DIV>
              </template>
            </template>
            <!-- ADDONS -->

            <div class="text-weight-bold text-subtitle2 q-mt-sm">
              {{ $t("Special Instructions") }}
            </div>
            <q-input
              v-model="special_instructions"
              autogrow
              outlined
              class="q-pa-none"
            />

            <div class="text-weight-bold text-subtitle2 q-mt-sm">
              {{ $t("If sold out") }}
            </div>
            <q-select
              outlined
              dense
              v-model="if_sold_out"
              :options="sold_out_options"
              color="secondary"
              class="q-mb-sm"
              transition-show="scale"
              transition-hide="scale"
            />

            <template v-if="$q.platform.is.ios">
              <q-card-actions
                class="item-sheet__cta border-grey-top row q-gutter-x-sm items-center"
                style="padding-left: 0px; padding-right: 0px"
              >
                <div class="col text-center">
                  <q-btn-group unelevated class="radius28 border-primary">
                    <q-btn
                      @click="item_qty > 1 ? item_qty-- : 1"
                      :text-color="item_qty > 1 ? 'dark' : 'grey'"
                      icon="o_remove"
                      size="lg"
                      dense
                      class="q-pl-sm q-pr-sm"
                    />
                    <q-btn
                      text-color="dark"
                      dense
                      :label="item_qty"
                      class="no-pointer-events text-weight-medium text-subtitle1"
                      style="min-width: 40px"
                    />
                    <q-btn
                      @click="item_qty++"
                      text-color="dark"
                      icon="o_add"
                      size="lg"
                      dense
                      class="q-pl-sm q-pr-sm"
                    />
                  </q-btn-group>
                </div>
                <q-btn
                  ref="addToCartButton"
                  unelevated
                  rounded
                  color="primary"
                  no-caps
                  size="lg"
                  class="col-7"
                  @click="CheckaddCartItems"
                  :disable="disabled_cart"
                  :loading="loading_add"
                  stack
                >
                  <div class="text-subtitle2 text-weight-bold q-gutter-x-sm">
                    <template v-if="items.not_for_sale">
                      {{ $t("Not for sale") }}
                    </template>
                    <template v-else>
                      {{ this.cart_row ? $t("Update") : $t("Add") }}
                      <NumberFormat
                        :amount="item_total"
                        :money_config="money_config"
                      ></NumberFormat>
                    </template>
                  </div>
                </q-btn>
              </q-card-actions>
            </template>
            <template v-else>
              <div
                class="item-sheet__footer q-pa-sm border-grey-top1 shadow-1 row q-gutter-x-sm items-center"
                :class="{
                  'bg-dark': $q.dark.mode,
                  'bg-white': !$q.dark.mode,
                }"
              >
                <div class="col text-center">
                  <q-btn-group unelevated class="radius28 border-primary">
                    <q-btn
                      @click="item_qty > 1 ? item_qty-- : 1"
                      :text-color="item_qty > 1 ? 'dark' : 'grey'"
                      icon="o_remove"
                      size="lg"
                      dense
                      class="q-pl-sm q-pr-sm"
                    />
                    <q-btn
                      text-color="dark"
                      dense
                      :label="item_qty"
                      class="no-pointer-events text-weight-medium text-subtitle1"
                      style="min-width: 40px"
                    />
                    <q-btn
                      @click="item_qty++"
                      text-color="dark"
                      icon="o_add"
                      size="lg"
                      dense
                      class="q-pl-sm q-pr-sm"
                    />
                  </q-btn-group>
                </div>
                <div class="col-6">
                  <q-btn
                    ref="addToCartButton"
                    unelevated
                    rounded
                    color="primary"
                    class="fit"
                    no-caps
                    size="lg"
                    @click="CheckaddCartItems"
                    :disable="disabled_cart"
                    :loading="loading_add"
                    stack
                  >
                    <div class="text-subtitle2 text-weight-bold q-gutter-x-sm">
                      <template v-if="items.not_for_sale">
                        {{ $t("Not for sale") }}
                      </template>
                      <template v-else>
                        {{ this.cart_row ? $t("Update") : $t("Add") }}
                        <NumberFormat
                          :amount="item_total"
                          :money_config="money_config"
                        ></NumberFormat>
                      </template>
                    </div>
                  </q-btn>
                </div>
              </div>
            </template>
          </q-card-section>
        </q-card>
      </DIV>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useCartStore } from "stores/CartStore";
import { useFavoriteStore } from "stores/FavoriteStore";
import { useDeliveryschedStore } from "stores/DeliverySched";
import config from "src/api/config";
import { animateFlyToCart } from "src/utils/cartFlyAnimation";

const empty = function (data) {
  if (
    typeof data === "undefined" ||
    data === null ||
    data === "" ||
    data === "null" ||
    data === "undefined"
  ) {
    return true;
  }
  return false;
};

export default {
  name: "ItemDetails",
  props: ["slug", "money_config", "currency_code", "cart_uuid"],
  components: {
    FavsItem: defineAsyncComponent(() => import("components/FavsItem.vue")),
    NumberFormat: defineAsyncComponent(() =>
      import("components/NumberFormat.vue")
    ),
    ItemGallery: defineAsyncComponent(() =>
      import("components/ItemGallery.vue")
    ),
    ShareComponents: defineAsyncComponent(() =>
      import("src/components/ShareComponents.vue")
    ),
    TextComponents: defineAsyncComponent(() =>
      import("src/components/TextComponents.vue")
    ),
  },
  setup() {
    const CartStore = useCartStore();
    const FavoriteStore = useFavoriteStore();
    const schedStore = useDeliveryschedStore();
    return { CartStore, FavoriteStore, schedStore };
  },
  data() {
    return {
      item_dialog: false,
      loading: false,
      loading_add: false,
      item_qty: 1,
      items: [],
      item_size_id: 0,
      size_data: [],
      size_datas: [],
      cooking_ref: 0,
      cooking_data: [],
      ingredients: [],
      ingredients_data: [],
      addons: {},
      special_instructions: "",
      transaction_type: "",
      if_sold_out: "",
      sold_out_options: [],
      item_total: 0,
      disabled_cart: true,
      slide_items: 0,
      favorites: [],
      restaurant_name: "",
      merchant_id: "",
      data_cat_id: "",
      data_item_token: "",
      merchantSlug: "",
      item_gallery: [],
      image_featured: "",
      deep_link: "",
      visibleCount: 5,
      is_scroll: false,
      cart_row: null,
    };
  },
  created() {
    this.deep_link = config.api_base_url;
  },
  mounted() {
    this.merchantSlug = this.slug;
  },
  watch: {
    addons: {
      handler(newValue, oldValue) {
        this.ItemSummary();
      },
      deep: true,
    },
    item_size_id() {
      this.ItemSummary();
    },
    cooking_ref() {
      this.ItemSummary();
    },
    ingredients() {
      this.ItemSummary();
    },
    item_qty() {
      this.ItemSummary();
    },
  },
  methods: {
    beforeShow() {
      this.cart_row = null;
    },
    onIntersection(entry) {
      this.is_scroll = entry.isIntersecting;
    },
    Onshow() {
      this.visibleCount = 5;
    },
    getRemainingItems(data) {
      let count = data - this.visibleCount;
      let text = this.$t("view_more", {
        count: count,
      });
      return text.replace(/\{count\}/g, count);
    },
    showMore(data) {
      this.visibleCount = data;
    },
    isClickable(data) {
      if (data.multi_option === "multiple") {
        return "";
      }
      return "label";
    },
    isRipple(data) {
      if (data.multi_option === "multiple") {
        return false;
      }
      return true;
    },
    resetData() {
      this.item_qty = 1;
      this.items = [];
      this.item_size_id = 0;
      this.size_data = [];
      this.size_datas = [];
      this.cooking_ref = 0;
      this.cooking_data = [];
      this.ingredients = [];
      this.ingredients_data = [];
      this.addons = {};
      this.special_instructions = "";
      this.transaction_type = "";
      this.if_sold_out = "";
      this.sold_out_options = [];
      this.item_total = 0;
      this.disabled_cart = true;
      this.slide_items = 0;
      this.data_cat_id = "";
      this.data_item_token = "";
      this.image_featured = "";
    },
    showItem2(data, slug) {
      if (typeof slug !== "undefined" && slug !== null) {
        this.merchantSlug = slug;
        this.showItem(data);
      }
    },
    showItem(data) {
      if (this.loading) {
        return;
      }
      this.resetData();
      this.item_dialog = true;
      this.loading = true;

      this.data_cat_id = data.cat_id;
      this.data_item_token = data.item_uuid;

      if (
        typeof this.merchantSlug !== "undefined" &&
        this.merchantSlug !== null
      ) {
        //
      } else {
        return;
      }

      data.slug = this.merchantSlug;
      data.currency_code = this.currency_code ?? "";
      let params = new URLSearchParams(data).toString();

      APIinterface.getMenuItem(params)
        .then((data) => {
          this.merchant_id = data.details.merchant_id;
          this.restaurant_name = data.details.restaurant_name;
          this.items = data.details.data.items;
          this.size_datas = data.details.data.items.price;
          const soldOutData = data.details.sold_out_options;

          this.if_sold_out = data.details.default_sold_out_options;

          const prices = data.details.data.items.price;
          const metaCookingRef = data.details.data.meta
            ? data.details.data.meta.cooking_ref
            : {};
          const metaCookingRefDetails = data.details.data.meta
            ? data.details.data.meta_details.cooking_ref
            : {};

          const metaIngredients = data.details.data.meta
            ? data.details.data.meta.ingredients
            : {};
          const metaIngredientsDetails = data.details.data.meta
            ? data.details.data.meta_details.ingredients
            : {};

          this.item_gallery = data.details.data.meta
            ? data.details.data.meta.item_gallery
            : {};

          const addons = data.details.data ? data.details.data.addons : {};
          const addonItems = data.details.data
            ? data.details.data.addon_items
            : {};

          if (Object.keys(soldOutData).length > 0) {
            Object.entries(soldOutData).forEach(
              ([itemSoldKey, itemsSoldData]) => {
                this.sold_out_options.push({
                  label: itemsSoldData,
                  value: itemSoldKey,
                });
              }
            );
          }

          if (Object.keys(prices).length > 0) {
            Object.entries(prices).forEach(([key, items]) => {
              if (items.discount <= 0) {
                this.size_data.push({
                  label: items.size_name + " " + items.pretty_price,
                  value: parseInt(items.item_size_id),
                  original_price: items.pretty_price,
                  discount: items.discount,
                });
              } else {
                this.size_data.push({
                  label:
                    items.size_name + " " + items.pretty_price_after_discount,
                  value: parseInt(items.item_size_id),
                  original_price: items.pretty_price,
                  discount: items.discount,
                });
              }
            });
            this.item_size_id = parseInt(Object.keys(prices)[0]);
          }

          if (
            typeof metaCookingRef !== "undefined" &&
            metaCookingRef !== null
          ) {
            if (metaCookingRef.length > 0) {
              Object.entries(metaCookingRef).forEach(([key, value]) => {
                this.cooking_data.push({
                  label: metaCookingRefDetails[value].meta_name,
                  value: metaCookingRefDetails[value].meta_id,
                });
              });
            }
          }

          if (
            typeof metaIngredients !== "undefined" &&
            metaIngredients !== null
          ) {
            if (metaIngredients.length > 0) {
              Object.entries(metaIngredients).forEach(([key, value]) => {
                if (metaIngredientsDetails[value]) {
                  this.ingredients_data.push({
                    label: metaIngredientsDetails[value].meta_name,
                    value: metaIngredientsDetails[value].meta_id,
                    onOff: this.items.ingredients_preselected ? true : false,
                  });
                  if (this.items.ingredients_preselected) {
                    this.ingredients.push(parseInt(value));
                  }
                }
              });
            }
          }

          const cart_details = data.details.cart_details;
          let cart_addons = null;
          if (cart_details) {
            this.item_qty = cart_details.cart.qty;
            cart_addons = cart_details.addons;
            this.cart_row = cart_details.cart_row;
            this.item_size_id = parseInt(cart_details.cart.item_size_id);
            this.cooking_ref =
              String(cart_details.attributes.cooking_ref) ?? null;
            const Ingredients = cart_details.attributes.ingredients ?? [];
            this.ingredients = Ingredients.map(String);
          }

          // addons
          if (Object.keys(this.items.item_addons).length > 0) {
            Object.entries(this.items.item_addons).forEach(
              ([sizeId, SubcatID]) => {
                const addOnsAdded = [];
                let sub_items_checked = "";
                let filteredAddons = null;
                Object.entries(SubcatID).forEach(([key, child]) => {
                  if (!APIinterface.empty(addons[sizeId])) {
                    if (!APIinterface.empty(addons[sizeId][child])) {
                      const addonDetails = addons[sizeId][child];

                      filteredAddons = null;
                      if (cart_details) {
                        if (addonDetails.multi_option == "one") {
                          filteredAddons = cart_addons.find(
                            (addon) =>
                              addon.subcat_id === addonDetails.subcat_id
                          );
                          if (filteredAddons) {
                            sub_items_checked = filteredAddons.sub_item_id;
                          }
                        } else if (addonDetails.multi_option == "custom") {
                          filteredAddons = cart_addons.filter(
                            (addon) =>
                              addon.subcat_id === addonDetails.subcat_id
                          );
                        } else if (addonDetails.multi_option == "multiple") {
                          filteredAddons = cart_addons.filter(
                            (addon) =>
                              addon.subcat_id === addonDetails.subcat_id
                          );
                        }
                      }

                      const subItems = [];
                      Object.entries(addonDetails.sub_items).forEach(
                        ([key2, subItemsID]) => {
                          if (addonItems[subItemsID]) {
                            const subItemsAdd = addonItems[subItemsID];

                            let hasSubcat = false;
                            let addonQty = 1;
                            if (filteredAddons) {
                              if (addonDetails.multi_option == "custom") {
                                const addonFound = filteredAddons.find(
                                  (addon) =>
                                    addon.subcat_id ===
                                      addonDetails.subcat_id &&
                                    String(addon.sub_item_id) ===
                                      String(subItemsAdd.sub_item_id)
                                );
                                hasSubcat = addonFound ? true : false;
                              } else if (
                                addonDetails.multi_option == "multiple"
                              ) {
                                const addonFound = filteredAddons.find(
                                  (addon) =>
                                    addon.subcat_id ===
                                      addonDetails.subcat_id &&
                                    String(addon.sub_item_id) ===
                                      String(subItemsAdd.sub_item_id)
                                );
                                if (addonFound) {
                                  addonQty = addonFound.qty;
                                }
                                hasSubcat = addonFound ? true : false;
                              }
                            }
                            addonItems[subItemsID].checked = hasSubcat;
                            addonItems[subItemsID].disabled = false;
                            addonItems[subItemsID].qty = addonQty;
                            subItems.push(subItemsAdd);
                          }
                        }
                      );

                      const subdata = {
                        subcat_id: addonDetails.subcat_id,
                        subcategory_name: addonDetails.subcategory_name,
                        subcategory_description:
                          addonDetails.subcategory_description,
                        multi_option: addonDetails.multi_option,
                        multi_option_min: addonDetails.multi_option_min,
                        multi_option_value: addonDetails.multi_option_value,
                        require_addon: addonDetails.require_addon,
                        pre_selected: addonDetails.pre_selected,
                        sub_items_checked: sub_items_checked,
                        sub_items: subItems,
                      };
                      addOnsAdded.push(subdata);
                    }
                  }
                });

                this.addons[sizeId] = addOnsAdded;
              }
            );
          }

          //
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
          this.item_dialog = false;
        })
        .then((data) => {
          this.loading = false;
        });
    },
    ItemSummary() {
      let $itemTotal = 0;
      const $requiredAddon = [];
      const $requiredAddonAdded = [];
      let $min_addon = [];
      let $min_addon_added = [];

      if (!empty(this.size_datas[this.item_size_id])) {
        const item = this.size_datas[this.item_size_id];
        if (item.discount > 0) {
          $itemTotal += this.item_qty * parseFloat(item.price_after_discount);
        } else $itemTotal += this.item_qty * parseFloat(item.price);
      }

      if (!empty(this.addons[this.item_size_id])) {
        this.addons[this.item_size_id].forEach((item, index) => {
          if (item.require_addon == 1) {
            $requiredAddon.push(item.subcat_id);
          }

          if (item.multi_option === "custom") {
            let totalCheck = 0;
            const multiOptionValue = item.multi_option_value;
            let multi_option_min = item.multi_option_min;

            if (multiOptionValue > 0) {
              $min_addon.push({
                subcat_id: item.subcat_id,
                min: multi_option_min,
                max: multiOptionValue,
              });
            }

            const itemIndex = [];
            const itemIndex2 = [];
            item.sub_items.forEach((item2, index2) => {
              if (item2.checked === true) {
                totalCheck++;
                $itemTotal += this.item_qty * parseFloat(item2.price);
                $requiredAddonAdded.push(item.subcat_id);
              } else itemIndex.push(index2);

              if (item2.disabled === true) {
                itemIndex2.push(index2);
              }
            });

            $min_addon_added[item.subcat_id] = {
              total: totalCheck,
            };

            if (totalCheck >= multiOptionValue) {
              itemIndex.forEach((item3, index3) => {
                item.sub_items[item3].disabled = true;
              });
            } else {
              itemIndex2.forEach((item3, index3) => {
                item.sub_items[item3].disabled = false;
              });
            }
          } else if (item.multi_option === "one") {
            item.sub_items.forEach((item2, index2) => {
              if (item2.sub_item_id === item.sub_items_checked) {
                $itemTotal += this.item_qty * parseFloat(item2.price);
                $requiredAddonAdded.push(item.subcat_id);
              }
            });
          } else if (item.multi_option === "multiple") {
            let multi_option_min = item.multi_option_min;
            const multiOptionValue = item.multi_option_value;

            if (multiOptionValue > 0) {
              $min_addon.push({
                subcat_id: item.subcat_id,
                min: multi_option_min,
                max: multiOptionValue,
              });
            }

            let TotalMultiQty = 0;
            const itemIndex = [];
            item.sub_items.forEach((item2, index2) => {
              if (item2.checked === true) {
                $itemTotal += item2.qty * parseFloat(item2.price);
                TotalMultiQty += item2.qty;
                $requiredAddonAdded.push(item.subcat_id);
              } else itemIndex.push(index2);
            });

            $min_addon_added[item.subcat_id] = {
              total: TotalMultiQty,
            };

            if (TotalMultiQty >= multiOptionValue) {
              item.sub_items.forEach((sub_items3, sub_items_index3) => {
                sub_items3.disabled = true;
              });
            } else {
              item.sub_items.forEach((sub_items3, sub_items_index3) => {
                sub_items3.disabled = false;
              });
            }
          } /* endif custom */
        });
        // end loop addons
      }

      this.item_total = $itemTotal;

      let $requiredMeet = true;

      if ($requiredAddon.length > 0) {
        $requiredAddon.forEach((requiedItem, requiredIndex) => {
          if ($requiredAddonAdded.includes(requiedItem) === false) {
            $requiredMeet = false;
            return false;
          }
        });
      }

      // CHECK COOKING REF
      if (this.items.cooking_ref_required && $requiredMeet) {
        if (this.cooking_ref > 0) {
          $requiredMeet = true;
        } else {
          $requiredMeet = false;
        }
      }

      // CHECK ADDON MINIMUM AND MAXIMUM
      if (Object.keys($min_addon).length > 0) {
        let min_value, min_selected;
        Object.entries($min_addon).forEach(
          ([key_min_addon, items_min_addon]) => {
            min_value = parseInt(items_min_addon.min);
            if ($min_addon_added[items_min_addon.subcat_id]) {
              min_selected = parseInt(
                $min_addon_added[items_min_addon.subcat_id].total
              );
            }
            if (min_selected > 0) {
              if (min_value > min_selected) {
                $requiredMeet = false;
              }
            }
          }
        );
      }

      if (this.items.not_for_sale) {
        $requiredMeet = false;
      }

      if ($requiredMeet) {
        this.disabled_cart = false;
      } else this.disabled_cart = true;
    },
    CheckaddCartItems() {
      let $cartMerchantID = "";
      let $cartMerchantName = "";

      if (this.CartStore.getMerchant) {
        $cartMerchantID = this.CartStore.getMerchant.merchant_id;
        $cartMerchantName = this.CartStore.getMerchant.restaurant_name;
      }

      if (!APIinterface.empty($cartMerchantID)) {
        if ($cartMerchantID !== this.merchant_id) {
          let $message = this.$t(
            "Your order contains items from {{restaurant_name}}. Create a new order to add items."
          );
          $message = $message.replace("{{restaurant_name}}", $cartMerchantName);

          this.$q
            .dialog({
              title: this.$t("Create new order?"),
              message: $message,
              persistent: true,
              position: "standard",
              transitionShow: "fade",
              transitionHide: "fade",
              ok: {
                unelevated: true,
                color: "primary",
                rounded: false,
                "text-color": "white",
                size: "md",
                label: this.$t("New order"),
                "no-caps": true,
                class: "radius8",
              },
              cancel: {
                unelevated: true,
                rounded: false,
                color: "mygrey",
                "text-color": "black",
                size: "md",
                label: this.$t("Cancel"),
                "no-caps": true,
                class: "radius8",
              },
            })
            .onOk(() => {
              this.clearCart();
            })
            .onCancel(() => {
              // console.log('>>>> Cancel')
            })
            .onDismiss(() => {
              // console.log('I am triggered on both OK and Cancel')
            });
        } else {
          this.AddToCart();
        }
      } else {
        this.AddToCart();
      }
    },
    clearCart() {
      APIinterface.clearCart(this.cart_uuid)
        .then((data) => {
          this.AddToCart();
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {});
    },
    AddToCart() {
      const sourceImage =
        this.$refs.heroImage?.$el || this.$refs.heroImage || null;
      const $ingredients = [];
      if (this.ingredients.length > 0) {
        this.ingredients.forEach((ingredientsId, index) => {
          $ingredients.push({
            meta_id: ingredientsId,
            checked: true,
            meta_name: "",
          });
        });
      }

      const $meta = {
        cooking_ref: [
          {
            meta_id: this.cooking_ref,
            checked: this.cooking_ref,
            meta_name: "",
          },
        ],
        ingredients: $ingredients,
      };

      const $data = {
        slug: this.merchantSlug,
        cart_uuid: this.cart_uuid,
        cat_id: this.data_cat_id,
        item_size_id: this.item_size_id,
        item_token: this.data_item_token,
        item_qty: this.item_qty,
        special_instructions: this.special_instructions,
        if_sold_out: this.if_sold_out.value,
        transaction_type: this.CartStore.geTransactiontype,
        meta: $meta,
        item_addons: !empty(this.addons[this.item_size_id])
          ? this.addons[this.item_size_id]
          : [],
      };
      if (this.cart_row) {
        $data.cart_row = this.cart_row;
      }

      this.loading_add = true;
      APIinterface.AddToCart($data)
        .then((data) => {
          animateFlyToCart({
            sourceEl: sourceImage,
            imageSrc: this.image_featured ? this.image_featured : this.items.url_image,
          });
          this.$emit("afterAdditems", data.details.cart_uuid);
          this.item_dialog = false;
        })
        .catch((error) => {
          APIinterface.notify("negative", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_add = false;
        });
    },
    afterSavefav(item) {
      item.save_item = !item.save_item;
      this.FavoriteStore.getItemFavorites(this.slug);
      this.$emit("afterSavefav");
    },
    setActive(button, index) {
      if (button.onOff) {
        this.ingredients_data[index].color = "mygrey";
        this.ingredients_data[index].text_color = "dark";
        this.ingredients_data[index].onOff = false;
      } else {
        this.ingredients_data[index].color = "primary";
        this.ingredients_data[index].text_color = "white";
        this.ingredients_data[index].onOff = true;
      }
    },
    afterSelectimage(data) {
      this.image_featured = data;
    },
  },
};
</script>

<style scoped>
.item-sheet {
  border-radius: 30px 30px 0 0;
  width: min(calc(100vw - 24px), 560px);
  margin: 0 auto 12px;
  background: #ffffff;
  border: 1px solid rgba(113, 74, 24, 0.08);
  box-shadow: 0 18px 38px rgba(70, 41, 12, 0.12);
  max-height: calc(100dvh - 92px);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.item-sheet__hero-wrap {
  border-radius: 24px;
  overflow: hidden;
  background: #f7f7f7 !important;
  display: flex;
  justify-content: center;
}

.item-sheet__hero {
  aspect-ratio: 1 / 1;
  height: auto !important;
  width: min(95%, 244px);
  max-height: none;
  margin: 0 auto;
}

.item-sheet__content {
  padding: 8px 12px 6px;
}

.item-sheet__title-row {
  margin-top: -6px;
  margin-bottom: 4px !important;
}

.item-sheet__cta,
.item-sheet__footer {
  background: rgba(255, 255, 255, 0.96) !important;
  border-top: 1px solid rgba(113, 74, 24, 0.08);
  backdrop-filter: blur(12px);
  position: sticky;
  bottom: 0;
  z-index: 20;
}

.item-sheet__cta,
.item-sheet__footer {
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}

:deep(.item-sheet .q-toolbar) {
  min-height: 58px;
  padding: 0 12px;
}

:deep(.item-sheet .q-card__section) {
  color: #20160f;
}

:deep(.item-sheet .text-h6),
:deep(.item-sheet .text-subtitle2.text-weight-bold) {
  color: #1f150d;
}

:deep(.item-sheet .q-option-group) {
  gap: 8px;
}

:deep(.item-sheet .q-radio),
:deep(.item-sheet .q-checkbox) {
  margin-right: 8px;
}

:deep(.item-sheet .q-radio__label),
:deep(.item-sheet .q-checkbox__label) {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(231, 220, 199, 0.72);
  font-size: 13px;
  font-weight: 700;
  color: #2c2016;
  white-space: nowrap;
}

:deep(.item-sheet .q-input .q-field__control),
:deep(.item-sheet .q-select .q-field__control) {
  border-radius: 20px;
  background: #f7f7f7;
}

:deep(.item-sheet .q-list .q-item) {
  margin-bottom: 8px;
  border-radius: 18px;
  background: rgba(255, 252, 247, 0.7);
}

:deep(.item-sheet .q-card__actions .q-btn),
.item-sheet__footer :deep(.q-btn) {
  border-radius: 18px;
}

:global(body.body--dark) .item-sheet {
  background: var(--tagam-surface);
  color: var(--tagam-text);
}

:global(body.body--dark) .item-sheet__hero-wrap {
  background: var(--tagam-surface-raised) !important;
}

:global(body.body--dark) .item-sheet__cta,
:global(body.body--dark) .item-sheet__footer {
  background: rgba(36, 29, 26, 0.96) !important;
  border-top-color: var(--tagam-stroke);
}

:global(body.body--dark) :deep(.item-sheet .q-toolbar) {
  background: rgba(36, 29, 26, 0.96) !important;
  color: var(--tagam-text) !important;
  border-bottom: 1px solid var(--tagam-stroke);
}

:global(body.body--dark) :deep(.item-sheet .q-card__section),
:global(body.body--dark) :deep(.item-sheet .text-h6),
:global(body.body--dark) :deep(.item-sheet .text-subtitle2.text-weight-bold) {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) :deep(.item-sheet .text-grey),
:global(body.body--dark) :deep(.item-sheet .text-grey-7),
:global(body.body--dark) :deep(.item-sheet .text-body2),
:global(body.body--dark) :deep(.item-sheet .text-caption) {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) :deep(.item-sheet .q-radio__label),
:global(body.body--dark) :deep(.item-sheet .q-checkbox__label),
:global(body.body--dark) :deep(.item-sheet .q-list .q-item) {
  background: var(--tagam-surface-raised);
  color: var(--tagam-text-soft);
  border: 1px solid var(--tagam-stroke);
}

:global(body.body--dark) :deep(.item-sheet .q-input .q-field__control),
:global(body.body--dark) :deep(.item-sheet .q-select .q-field__control) {
  background: var(--tagam-surface-raised);
  color: var(--tagam-text);
}

@media (max-height: 760px) {
  .item-sheet {
    max-height: calc(100dvh - 72px);
  }

  .item-sheet__hero {
    width: min(95%, 220px);
  }
}

@media (max-height: 680px) {
  .item-sheet__hero {
    width: min(92%, 190px);
  }

  :deep(.item-sheet .q-card__section) {
    padding-top: 10px;
    padding-bottom: 10px;
  }
}
</style>
