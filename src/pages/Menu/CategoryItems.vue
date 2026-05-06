<template>
  <q-header
    :class="{
      'border-bottom': !isScrolled,
      'shadow-bottom': isScrolled,
    }"
    class="text-dark"
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="eva-arrow-back-outline"
        class="q-mr-sm"
      />
      <q-toolbar-title class="text-weight-bold">
        {{ category_name }}</q-toolbar-title
      >
    </q-toolbar>
  </q-header>
  <q-page>
    <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
      <q-scroll-observer @scroll="onScroll" />
      <q-space class="q-pa-lg"></q-space>

      <div class="q-pl-md q-pr-md q-pt-md">
        <q-skeleton
          v-if="firsLoading"
          type="QChip"
          style="height: 35px"
          class="full-width"
        />

        <div
          v-else
          class="bg-grey-1 text-subtitle2 q-pa-sm radius28 flex items-center cursor-pointer"
          @click="this.$refs.ref_search_menu.modal = true"
        >
          <div class="q-mr-sm">
            <q-icon name="eva-search-outline" size="20px"></q-icon>
          </div>
          <div class="text-caption">
            {{ $t("Search") }}
          </div>
        </div>
      </div>

      <q-infinite-scroll
        ref="nscroll"
        @load="fetchCategoryItems"
        :offset="250"
        :disable="scroll_disabled"
      >
        <template v-slot:default>
          <MenuList
            ref="ref_menulist"
            :data="data"
            :category="category"
            :merchant_id="merchant_id"
            :promoEligibility="promoEligibility"
            @on-clickitems="onClickitems"
            @show-options="showOptions"
            @show-allergens="showAllergens"
          ></MenuList>
        </template>
        <template v-slot:loading>
          <template v-if="current_page == 1">
            <MenuLoader loading_type="list"></MenuLoader>
          </template>
          <template v-else>
            <div class="row q-gutter-x-sm justify-center q-my-md">
              <q-spinner-ios size="sm" />
              <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
            </div>
          </template>
        </template>
      </q-infinite-scroll>

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

      <AllergensInformation ref="ref_allergens"></AllergensInformation>

      <ItemInfo
        ref="ref_iteminfo"
        :cart_uuid="CartStore.getCartID"
        :money_config="DataStore.money_config"
        @show-itemdetails="showItemdetails"
        @after-updateqty="loadCart"
      ></ItemInfo>

      <template v-if="CartStore.hasItem && !CartStore.cart_loading">
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
          <q-btn
            fab
            icon="eva-shopping-cart-outline"
            color="orange-5"
            padding="0.8em"
            to="/cart"
          >
            <q-badge v-if="CartStore.hasItem" color="red" floating rounded>
              {{ CartStore.getCartCount }}
            </q-badge>
          </q-btn>
        </q-page-sticky>
      </template>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn
          fab
          icon="keyboard_arrow_up"
          :color="$q.dark.mode ? 'grey600' : 'mygrey'"
          :text-color="$q.dark.mode ? 'grey300' : 'dark'"
          dense
          padding="7px"
        />
      </q-page-scroller>
    </q-pull-to-refresh>

    <SearchCategoryItems
      ref="ref_search_menu"
      :merchant_id="merchant_id"
      :cat_id="cat_id"
      :search_label="searchLabel"
      @on-clickitems="onClickitems"
    ></SearchCategoryItems>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useCartStore } from "stores/CartStore";
import { useDataStore } from "stores/DataStore";
import { useMenuStore } from "src/stores/MenuStore";
import auth from "src/api/auth";

export default {
  name: "CategoryItems",
  components: {
    MenuList: defineAsyncComponent(() => import("src/components/MenuList.vue")),
    AllergensInformation: defineAsyncComponent(() =>
      import("src/components/AllergensInformation.vue")
    ),
    ItemInfo: defineAsyncComponent(() => import("src/components/ItemInfo.vue")),
    MenuLoader: defineAsyncComponent(() =>
      import("src/components/MenuLoader.vue")
    ),
    SearchCategoryItems: defineAsyncComponent(() =>
      import("src/components/SearchCategoryItems.vue")
    ),
  },
  data() {
    return {
      loading: false,
      slug: null,
      merchant_id: null,
      category_name: null,
      isScrolled: false,
      scroll_disabled: true,
      data: [],
      category: [],
      hasMore: true,
      current_page: 1,
      cat_id: null,
      params: {},
      promoEligibility: {},
      merchantID: null,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const CartStore = useCartStore();
    const DataStore = useDataStore();
    const MenuStore = useMenuStore();

    const addons_use_checkbox = DataStore.addons_use_checkbox ?? true;
    const ItemComponents = defineAsyncComponent(() =>
      addons_use_checkbox
        ? import("components/ItemDetailsCheckbox.vue")
        : import("components/ItemDetails.vue")
    );

    return {
      DataStorePersisted,
      CartStore,
      DataStore,
      ItemComponents,
      MenuStore,
    };
  },
  mounted() {
    this.slug = this.$route.query.slug;
    this.category_name = this.$route.query.category_name;
    this.cat_id = this.$route.query.cat_id;
    this.merchantID = this.$route.query.merchantID;

    if (
      this.MenuStore.category_items_id == this.cat_id &&
      this.MenuStore.category_items_saved
    ) {
      this.data = this.MenuStore.category_items_saved?.data;
      this.category = this.MenuStore.category_items_saved?.category;
      this.merchant_id = this.MenuStore.category_items_saved?.merchant_id;
      this.current_page = this.MenuStore.category_items_saved?.current_page;
      this.hasMore = this.MenuStore.category_items_saved?.hasMore;
    } else {
      this.MenuStore.category_items_saved = null;
      this.MenuStore.category_items_id = null;
    }

    this.scroll_disabled = false;
    this.loadCart();
  },
  beforeUnmount() {
    this.MenuStore.category_items_id = this.cat_id;
    this.MenuStore.category_items_saved = {
      data: this.data,
      category: this.category,
      merchant_id: this.merchant_id,
      hasMore: this.hasMore,
      current_page: this.current_page,
    };
  },
  computed: {
    firsLoading() {
      return this.loading && this.current_page == 1 ? true : false;
    },
    searchLabel() {
      return this.$t("Search items in") + ` ${this.category_name}`;
    },
  },
  methods: {
    showItemdetails(cat_id, item_uuid, cart_row) {
      console.log("showItemdetails", {
        cat_id: cat_id,
        item_uuid: item_uuid,
        cart_row: cart_row,
      });
      const params = { cat_id: cat_id, item_uuid: item_uuid };
      if (cart_row) {
        params.cart_row = cart_row;
      }
      this.$refs.item_details.showItem2(params, this.slug);
    },
    async loadCart() {
      await this.CartStore.getCart(true, null, this.slug);
      this.promoCheck();
    },
    afterAdditems(cart_uuid) {
      this.DataStorePersisted.cart_uuid = cart_uuid;
      this.DataStorePersisted.merchant_slug = this.slug;
      this.$refs.ref_search_menu.modal = false;
      this.loadCart();
    },
    showOptions(value) {
      this.$refs.ref_iteminfo.data = value;
      this.$refs.ref_iteminfo.modal = true;
    },
    onClickitems(value) {
      console.log("onClickitems categoritems", value);
      this.$refs.item_details.showItem2(value, this.slug);
    },
    showAllergens(value) {
      this.$refs.ref_allergens.show(true, value.merchant_id, value.item_id);
    },
    refresh(done) {
      setTimeout(() => {
        done();
      }, 100);
      this.resetPagination();
    },
    resetPagination() {
      this.MenuStore.category_items_saved = null;
      this.MenuStore.category_items_id = null;

      this.data = [];
      this.current_page = 1;
      this.hasMore = true;
      this.scroll_disabled = false;
      this.$nextTick(() => {
        this.$refs.nscroll?.resume?.();
        this.$refs.nscroll?.trigger?.();
      });
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    async fetchCategoryItems(index, done) {
      try {
        if (this.loading) {
          return;
        }
        if (!this.hasMore) {
          this.scroll_disabled = true;
          done(true);
          return;
        }

        this.loading = true;
        this.params = {};
        //this.params.limit = 1;
        this.params.page = this.current_page;
        this.params.cat_id = this.cat_id;
        this.params.slug = this.slug;
        this.params.currency_code = this.DataStorePersisted.useCurrency;
        const islogin = auth.authenticated();
        if (islogin) {
          const auth_user = auth.getUser();
          this.params.client_uuid = auth_user.client_uuid;
        }

        const response = await APIinterface.fetchGetRequest(
          "fetchCategoryItems",
          new URLSearchParams(this.params).toString()
        );

        if (this.current_page <= 1) {
          this.merchant_id = response.details?.merchant_id;
          this.category = {
            cat_id: response.details?.cat_id,
            available: response.details?.available,
          };
        }
        this.data = [...this.data, ...response.details.data];

        this.current_page++;

        if (response.details.is_last_page) {
          this.hasMore = false;
          done(true);
          return;
        }
        done();
      } catch (error) {
        this.hasMore = false;
        console.log("error", error);
        done(true);
      } finally {
        this.loading = false;
      }
    },

    async promoCheck() {
      try {
        const cart_uuid = this.DataStorePersisted.cart_uuid;
        const response = await APIinterface.fetchDataByTokenGet("PromoCheck", {
          merchant_id: this.merchantID,
          cart_uuid: cart_uuid,
        });
        console.log("response", response);
        this.promoEligibility = response.details.data;
      } catch (error) {
        console.log("error", error);
      }
    },
    //
  },
};
</script>
