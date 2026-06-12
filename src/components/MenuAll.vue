<template>
  <q-tabs
    v-model="active_category"
    ref="category_tabs"
    dense
    class="tagam-category-tabs tagam-text-muted"
    @update:model-value="scrollToCategory"
    active-color="primary"
    indicator-color="primary"
    align="justify"
    no-caps
    mobile-arrows
    narrow-indicator
  >
    <template v-for="items_category in getCategory" :key="categoryKey(items_category)">
      <q-tab
        class="tagam-category-tab"
        :name="categoryKey(items_category)"
        :label="items_category.category_name"
      />
    </template>
  </q-tabs>

  <q-space class="q-pa-sm"></q-space>

  <template v-for="(category, index) in getCategory" :key="categoryKey(category)">
    <div class="tagam-category-heading row items-center justify-between">
      <div
        ref="categories"
        :id="categoryKey(category)"
        :name="category.category_name"
        class="tagam-category-title text-weight-bold text-subtitle1 no-margin line-normal"
      >
        {{ category.category_name }}
      </div>
      <div v-if="index <= 0" class="tagam-menu-view-toggle">
        <q-btn
          round
          unelevated
          color="transparent"
          text-color="primary"
          size="sm"
          class="tagam-icon-btn"
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

    <q-space class="tagam-menu-category-space"></q-space>
  </template>
  <!-- end loop category -->

  <q-space class="tagam-menu-bottom-space"></q-space>

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
import auth from "src/api/auth";
import { useHaptics } from "src/composables/useHaptics";

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
    const haptics = useHaptics();

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
      haptics,
    };
  },
  data() {
    return {
      loading: false,
      data: [],
      active_category: null,
      active_category_name: null,
      programmaticScroll: false,
      programmaticScrollTimer: null,
      programmaticScrollCategory: null,
      isCategoryScrollTracking: false,
      scrollAnimationFrame: null,
      categoryScrollTarget: null,
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
    this.syncCategoryTabsOffset();
    window.addEventListener("resize", this.syncCategoryTabsOffset);
  },
  beforeUnmount() {
    this.MenuStore.menu_saved_slug = this.slug;
    this.MenuStore.menu_saved_data = this.data;
    this.unbindCategoryScrollSync();
    window.removeEventListener("resize", this.syncCategoryTabsOffset);

    if (this.programmaticScrollTimer) {
      clearTimeout(this.programmaticScrollTimer);
    }
    if (this.scrollAnimationFrame) {
      cancelAnimationFrame(this.scrollAnimationFrame);
      this.scrollAnimationFrame = null;
    }
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
    active_category(newval, oldval) {
      if (newval !== oldval) {
        this.scrollActiveTabIntoView();
      }
    },
    active_category_name(newval, oldval) {
      this.$emit("onCategorychange", newval);
    },
  },
  methods: {
    loadCart() {
      this.CartStore.getCart(true, null, this.slug);
      this.$emit("promoCheck");
    },
    afterAdditems(cart_uuid, visual) {
      this.DataStorePersisted.cart_uuid = cart_uuid;
      this.DataStorePersisted.merchant_slug = this.slug;
      this.$refs.ref_search_menu.modal = false;
      this.$emit("cart-feedback", visual);
      this.loadCart();
    },
    afterCategoryselect(data) {
      this.$refs.categories_modal.modal = false;
      this.scrollToCategory(this.categoryKey(data));
    },
    showCategory() {
      this.$refs.categories_modal.modal = true;
    },
    showSearchMenu() {
      this.$refs.ref_search_menu.modal = true;
    },
    showItemdetails(cat_id, item_uuid, cart_row) {
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
      this.$refs.item_details.showItem2(value, this.slug);
    },
    showOptions(value) {
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
      } catch {
      } finally {
        this.loading = false;
      }
    },
    scrollToCategory(category_uuid) {
      if (!category_uuid) {
        return;
      }

      if (!this.programmaticScroll) {
        this.haptics.impact("light");
      }

      const categoryKey = String(category_uuid);
      const category = this.getCategory?.find(
        (items) => this.categoryKey(items) === categoryKey
      );
      if (!category) {
        return;
      }

      const targetOffset = this.getCategoryScrollOffset(categoryKey);
      if (targetOffset === null) {
        return;
      }

      this.active_category = categoryKey;
      this.active_category_name = category.category_name || this.active_category_name;
      this.programmaticScroll = true;
      this.programmaticScrollCategory = categoryKey;

      if (this.programmaticScrollTimer) {
        clearTimeout(this.programmaticScrollTimer);
      }

      if (this.scrollAnimationFrame) {
        cancelAnimationFrame(this.scrollAnimationFrame);
        this.scrollAnimationFrame = null;
      }

      window.scrollTo({
        top: targetOffset,
        behavior: "smooth",
      });

      this.programmaticScrollTimer = setTimeout(() => {
        this.programmaticScrollTimer = null;
        this._finalizeProgrammaticScroll(categoryKey);
      }, 1100);
      this.scrollActiveTabIntoView();
    },
    categoryKey(category) {
      if (!category) {
        return "";
      }

      if (category.category_uiid) {
        return String(category.category_uiid);
      }

      if (category.category_uuid) {
        return String(category.category_uuid);
      }

      if (
        category.cat_id !== undefined &&
        category.cat_id !== null &&
        category.cat_id !== ""
      ) {
        return `cat-${category.cat_id}`;
      }

      return `category-${String(category.category_name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
    },
    getCategoryScrollOffset(category_uuid) {
      const target = Array.isArray(this.$refs.categories)
        ? this.$refs.categories.find((heading) => heading.id === String(category_uuid))
        : this.$refs.categories;
      if (!target || !target.getBoundingClientRect) {
        return null;
      }

      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      const maxScroll = Math.max(
        0,
        (document.scrollingElement?.scrollHeight || document.body.scrollHeight) -
          window.innerHeight
      );
      const offsetTop = targetTop - this.getCategoryAnchorOffset() - 8;
      if (!Number.isFinite(offsetTop)) {
        return null;
      }

      return Math.min(Math.max(offsetTop, 0), maxScroll);
    },
    scrollToElement(id) {
      if (!id) {
        return;
      }

      const normalizedId = String(id);
      const ele = document.getElementById(normalizedId);
      if (!ele) {
        return;
      }
      const offsetTop = ele.offsetTop - this.getCategoryAnchorOffset() - 8;
      const maxScroll = Math.max(
        0,
        (document.scrollingElement?.scrollHeight || document.body.scrollHeight) -
          window.innerHeight
      );

      window.scrollTo({
        top: Math.min(Math.max(offsetTop, 0), maxScroll),
        behavior: "smooth",
      });
    },
    startObserver() {
      if (!this.getCategory) {
        return;
      }

      this.$nextTick(() => {
        this.syncCategoryTabsOffset();
        if (!this.active_category && this.getCategory?.[0]) {
          this.active_category = this.categoryKey(this.getCategory[0]);
          this.active_category_name = this.getCategory[0].category_name;
        }

        this.bindCategoryScrollSync();
        this.scheduleActiveCategoryFromScroll();
      });
    },
    bindCategoryScrollSync() {
      if (this.isCategoryScrollTracking || this.getCategory?.length === 0) {
        return;
      }

      const firstCategoryElement = Array.isArray(this.$refs.categories)
        ? this.$refs.categories[0]
        : this.$refs.categories;
      if (!firstCategoryElement) {
        return;
      }

      const targetNode = window;

      targetNode.addEventListener("scroll", this.onCategoryScroll, {
        passive: true,
      });
      this.isCategoryScrollTracking = true;
      this.categoryScrollTarget = targetNode;
    },
    unbindCategoryScrollSync() {
      if (!this.isCategoryScrollTracking || !this.categoryScrollTarget) {
        return;
      }

      this.categoryScrollTarget.removeEventListener("scroll", this.onCategoryScroll);
      this.isCategoryScrollTracking = false;
      this.categoryScrollTarget = null;
    },
    onCategoryScroll() {
      this.syncCategoryTabsOffset();
      this.scheduleActiveCategoryFromScroll();
    },
    scheduleActiveCategoryFromScroll() {
      if (this.scrollAnimationFrame) {
        return;
      }

      this.scrollAnimationFrame = requestAnimationFrame(() => {
        this.scrollAnimationFrame = null;
        this.updateActiveCategoryFromScroll();
      });
    },
    _finalizeProgrammaticScroll(category_uuid) {
      if (!this.programmaticScroll) {
        return;
      }

      const categoryKey = String(category_uuid);
      if (this.programmaticScrollCategory !== categoryKey) {
        this.programmaticScroll = false;
        this.programmaticScrollCategory = null;
        return;
      }

      const targetCategory = this.getCategory?.find(
        (category) => this.categoryKey(category) === categoryKey
      );

      if (targetCategory) {
        this.active_category = categoryKey;
        this.active_category_name = targetCategory.category_name;
        this.$nextTick(() => {
          this.scrollActiveTabIntoView();
        });
      }

      this.programmaticScroll = false;
      this.programmaticScrollCategory = null;
    },
    updateActiveCategoryFromScroll() {
      if (
        this.programmaticScroll ||
        this.isCategoryScrollTracking === false ||
        !this.getCategory?.length ||
        !this.$refs.categories
      ) {
        return;
      }

      const triggerOffset = this.getCategoryAnchorOffset() + 8;
      const triggerTolerance = 24;
      const triggerLine = triggerOffset + triggerTolerance;

      const headingElements = Array.isArray(this.$refs.categories)
        ? this.$refs.categories
        : [this.$refs.categories];
      let activeCategory = null;

      for (const heading of headingElements) {
        if (!heading?.id || !heading.getBoundingClientRect) {
          continue;
        }

        if (Math.round(heading.getBoundingClientRect().top) <= triggerLine) {
          activeCategory =
            this.getCategory.find((category) => {
              return this.categoryKey(category) === heading.id;
            }) || activeCategory;
        } else {
          break;
        }
      }

      if (!activeCategory && headingElements[0]?.id) {
        const first = this.getCategory.find(
          (category) => this.categoryKey(category) === headingElements[0].id
        );
        if (first) {
          activeCategory = first;
        }
      }

      if (!activeCategory) {
        return;
      }

      const activeKey = this.categoryKey(activeCategory);
      if (this.active_category !== activeKey) {
        this.active_category = activeKey;
        this.active_category_name = activeCategory.category_name;
      }
      this.$nextTick(() => {
        this.scrollActiveTabIntoView();
      });
    },
    getCategoryAnchorOffset() {
      const header =
        document.querySelector(".q-header.fixed-top") ||
        document.querySelector(".q-header");
      const headerHeight = header
        ? Math.max(header.getBoundingClientRect().height, 0)
        : 0;
      const categoryTabs = document.querySelector(".tagam-category-tabs");
      const tabsHeight = categoryTabs
        ? categoryTabs.getBoundingClientRect().height
        : 0;
      return headerHeight + tabsHeight;
    },
    scrollActiveTabIntoView() {
      const activeTab = this.$refs.category_tabs?.$el?.querySelector(
        ".q-tab--active"
      );
      if (!activeTab) {
        return;
      }

      activeTab.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    },
    syncCategoryTabsOffset() {
      const header = document.querySelector(".q-header");
      const categoryTabs = document.querySelector(".tagam-category-tabs");
      if (!categoryTabs) {
        return;
      }

      const offset = header ? Math.max(header.getBoundingClientRect().height, 0) : 0;
      categoryTabs.style.setProperty("--tagam-category-tabs-top", `${offset}px`);
    },
    //
  },
};
</script>



