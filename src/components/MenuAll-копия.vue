<template>
  <q-tabs
    v-model="active_category"
    dense
    class="text-grey300"
    active-color="dark"
    indicator-color="dark"
    align="justify"
    no-caps
    mobile-arrows
    narrow-indicator
  >
    <template v-for="items_category in getCategory" :key="items_category">
      <q-tab
        :name="items_category.category_uiid"
        :label="items_category.category_name"
        @click="scrollToCategory(items_category.category_uiid)"
      />
    </template>
  </q-tabs>
  <q-separator style="margin-top: -1px"></q-separator>

  <q-space class="q-pa-sm"></q-space>

  <template v-for="(category, index) in getCategory" :key="category">
    <div class="row items-center justify-between q-pl-md q-pr-md">
      <div
        ref="categories"
        :id="category.category_uiid"
        :name="category.category_name"
        class="text-weight-bold text-subtitle1 no-margin line-normal"
      >
        {{ category.category_name }}
      </div>
      <div v-if="index <= 0">
        <q-btn
          flat
          color="grey-5"
          padding="0"
          :icon="
            DataStorePersisted.menu_list_type == 'list'
              ? 'grid_view'
              : 'o_view_agenda'
          "
          @click="
            DataStorePersisted.menu_list_type =
              DataStorePersisted.menu_list_type == 'list' ? 'grid' : 'list'
          "
        />
      </div>
    </div>

    <Suspense>
      <template #default>
        <component
          ref="ref_menulist"
          :is="menuComponent"
          :data="category.item_list"
          :category="{
            cat_id: category.cat_id,
            available: category.available,
          }"
          :merchant_id="merchant_id"
          :promoEligibility="promoEligibility"
          @on-clickitems="onClickitems"
          @show-options="showOptions"
          @show-allergens="showAllergens"
        ></component>
      </template>
      <template #fallback>
        <div class="q-pa-md flex flex-center">
          <q-spinner-ios size="sm" />
        </div>
      </template>
    </Suspense>

    <q-separator
      v-if="DataStorePersisted.menu_list_type == 'list'"
    ></q-separator>
    <q-space class="q-pa-sm"></q-space>
  </template>
  <!-- end loop category -->

  <ItemInfo
    ref="ref_iteminfo"
    :cart_uuid="CartStore.getCartID"
    :money_config="DataStore.money_config"
    @show-itemdetails="showItemdetails"
    @after-updateqty="loadCart"
  ></ItemInfo>

  <AllergensInformation ref="ref_allergens"></AllergensInformation>

  <CategoriesModal
    ref="categories_modal"
    :data="getCategory"
    :active_category="active_category"
    @after-categoryselect="afterCategoryselect"
  ></CategoriesModal>

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

  <SearchMenu
    ref="ref_search_menu"
    :items="getItems"
    :category="getCategory"
    :items_not_available="getItemsnotavailable"
    :category_not_available="getCategorynotavailable"
    @show-Itemdetails="showItemdetails"
  />
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useCartStore } from "stores/CartStore";
import { useMenuStore } from "src/stores/MenuStore";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import { scroll } from "quasar";
import auth from "src/api/auth";

const { getScrollTarget, setVerticalScrollPosition } = scroll;

export default {
  name: "MenuAll",
  props: ["slug", "merchant_id", "promoEligibility"],
  components: {
    //MenuList: defineAsyncComponent(() => import("src/components/MenuList.vue")),
    ItemInfo: defineAsyncComponent(() => import("src/components/ItemInfo.vue")),
    AllergensInformation: defineAsyncComponent(() =>
      import("src/components/AllergensInformation.vue")
    ),
    CategoriesModal: defineAsyncComponent(() =>
      import("src/components/CategoriesModal.vue")
    ),
    SearchMenu: defineAsyncComponent(() =>
      import("src/components/SearchMenu.vue")
    ),
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
      MenuStore,
      ItemComponents,
    };
  },
  data() {
    return {
      loading: false,
      data: [],
      active_category: null,
      active_category_name: null,
    };
  },
  mounted() {
    if (
      this.MenuStore.menu_saved_slug == this.slug &&
      this.MenuStore.menu_saved_data
    ) {
      this.data = this.MenuStore.menu_saved_data;
      setTimeout(() => {
        this.startObserver();
      }, 500);
    } else {
      this.geStoreMenu();
    }
  },
  beforeUnmount() {
    this.MenuStore.menu_saved_slug = this.slug;
    this.MenuStore.menu_saved_data = this.data;
  },
  computed: {
    menuComponent() {
      return this.DataStorePersisted.menu_list_type === "list"
        ? defineAsyncComponent(() => import("components/MenuList.vue"))
        : defineAsyncComponent(() => import("components/MenuGrid.vue"));
    },
    getCategory() {
      return this.data?.category || null;
    },
    getItems() {
      return this.data?.items || null;
    },
    getItemsnotavailable() {
      return this.data?.items_not_available || null;
    },
    getCategorynotavailable() {
      return this.data?.category_not_available || null;
    },
  },
  watch: {
    active_category_name(newval, oldval) {
      this.$emit("onCategorychange", newval);
    },
  },
  methods: {
    loadCart() {
      this.CartStore.getCart(true, null, this.slug);
      console.log("load cart menu all");
      this.$emit("promoCheck");
    },
    afterAdditems(cart_uuid) {
      this.DataStorePersisted.cart_uuid = cart_uuid;
      this.DataStorePersisted.merchant_slug = this.slug;
      this.$refs.ref_search_menu.modal = false;
      this.loadCart();
    },
    afterCategoryselect(data) {
      this.$refs.categories_modal.modal = false;
      this.scrollToElement(data?.category_uiid);
    },
    showCategory() {
      this.$refs.categories_modal.modal = true;
    },
    showSearchMenu() {
      console.log("showSearchMenu");
      this.$refs.ref_search_menu.modal = true;
    },
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
    showAllergens(value) {
      this.$refs.ref_allergens.show(true, value.merchant_id, value.item_id);
    },
    onClickitems(value) {
      console.log("onClickitems", value);
      this.$refs.item_details.showItem2(value, this.slug);
    },
    showOptions(value) {
      console.log("showOptions", value);
      this.$refs.ref_iteminfo.data = value;
      this.$refs.ref_iteminfo.modal = true;
    },
    async geStoreMenu() {
      try {
        this.loading = true;
        const params = {
          slug: this.slug,
          currency_code: this.DataStorePersisted.useCurrency,
        };

        const islogin = auth.authenticated();
        if (islogin) {
          const auth_user = auth.getUser();
          params.client_uuid = auth_user.client_uuid;
        }

        const response = await APIinterface.fetchDataPost(
          "geStoreMenu",
          new URLSearchParams(params).toString()
        );
        this.data = response.details.data;
        this.startObserver();
      } catch (error) {
        console.log("error", error);
      } finally {
        this.loading = false;
      }
    },
    scrollToCategory(category_uuid) {
      this.scrollToElement(category_uuid);
    },
    scrollToElement(id) {
      const ele = document.getElementById(id);
      if (!ele) {
        return;
      }
      const target = getScrollTarget(ele);
      const offset = ele.offsetTop;
      const duration = 500;
      setVerticalScrollPosition(target, offset - 50, duration);
    },
    startObserver() {
      if (this.getCategory) {
        console.log("start");
        const observer = new IntersectionObserver(this.handleIntersect, {
          root: null,
          rootMargin: "0px",
          threshold: 0.5,
        });

        this.$nextTick(() => {
          if (this.$refs.categories) {
            this.$refs.categories.forEach((category) =>
              observer.observe(category)
            );
          }
        });
      }
    },
    handleIntersect(entries) {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.active_category = entry.target.id;
          this.active_category_name = entry.target.getAttribute("name");
        }
      }
    },
    //
  },
};
</script>
