<template>
  <div class="tagam-menu-category-first">
    <div class="tagam-menu-tabs-sticky">
      <div class="tagam-menu-tabs-wrap">
        <template v-if="loading && !hasData">
          <div class="row no-wrap q-gutter-sm q-px-md">
            <q-skeleton
              v-for="i in 4"
              :key="i"
              type="QChip"
              style="height: 38px; width: 110px"
            />
          </div>
        </template>

        <div
          v-else
          ref="chipsScroll"
          class="tagam-menu-tabs-scroll"
          @scroll="updateTabsState"
        >
          <q-btn
            unelevated
            no-caps
            class="tagam-menu-chip"
            :class="{ 'tagam-menu-chip--active': !active_category }"
            @click="setActiveCategory(null)"
          >
            {{ $t("All") }}
          </q-btn>

          <q-btn
            v-for="cat in normalizedCategories"
            :key="cat._key"
            unelevated
            no-caps
            class="tagam-menu-chip"
            :class="{ 'tagam-menu-chip--active': isActiveCategory(cat) }"
            @click="setActiveCategory(cat._key)"
          >
            {{ cat.category_name }}
          </q-btn>
        </div>

        <div
          v-if="canScrollLeft"
          class="tagam-menu-tabs-hint tagam-menu-tabs-hint--left"
          @click="scrollTabs('left')"
        >
          <q-icon name="eva-arrow-back-outline" size="18px" />
        </div>

        <div
          v-if="canScrollRight"
          class="tagam-menu-tabs-hint tagam-menu-tabs-hint--right"
          @click="scrollTabs('right')"
        >
          <q-icon name="eva-arrow-forward-outline" size="18px" />
        </div>

        <div
          v-if="canScrollLeft"
          class="tagam-menu-tabs-fade tagam-menu-tabs-fade--left"
          aria-hidden="true"
        ></div>

        <div
          v-if="canScrollRight"
          class="tagam-menu-tabs-fade tagam-menu-tabs-fade--right"
          aria-hidden="true"
        ></div>
      </div>
    </div>

    <div v-if="!loading && !hasData" class="q-px-md q-pt-md">
      <NoResults
        :message="$t('noResults')"
        :description="$t('noResultsDesc')"
      />
    </div>

    <template v-for="(cat, index) in visibleCategories" :key="cat._key">
      <div
        ref="sections"
        :id="cat._key"
        :data-category-key="cat._key"
        :data-category-name="cat.category_name"
        class="tagam-menu-section"
      >
        <div class="tagam-menu-section__head q-pl-md q-pr-md q-pb-sm">
          <div class="tagam-menu-section__title">
            {{ cat.category_name }}
          </div>

          <div v-if="index === 0">
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
              :is="menuComponent"
              :data="cat.item_list || []"
              :category="{
                cat_id: cat.cat_id,
                available: cat.available,
              }"
              :merchant_id="merchant_id"
              :promoEligibility="promoEligibility"
              @on-clickitems="onClickitems"
              @show-options="showOptions"
              @show-allergens="showAllergens"
            />
          </template>

          <template #fallback>
            <div class="q-pa-md flex flex-center">
              <q-spinner-ios size="sm" />
            </div>
          </template>
        </Suspense>

        <q-separator
          v-if="DataStorePersisted.menu_list_type == 'list' && index < normalizedCategories.length - 1"
          class="tagam-menu-separator"
        />
        <q-space class="q-pa-sm" />
      </div>
    </template>

    <CategoriesModal
      ref="categories_modal"
      :data="normalizedCategories"
      :active_category="active_category"
      @after-categoryselect="afterCategoryselect"
    />

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

    <ItemInfo
      ref="ref_iteminfo"
      :cart_uuid="CartStore.getCartID"
      :money_config="DataStore.money_config"
      @show-itemdetails="showItemdetails"
      @after-updateqty="loadCart"
    />

    <AllergensInformation ref="ref_allergens" />
  </div>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { scroll } from "quasar";
import { defineAsyncComponent, nextTick } from "vue";
import { useMenuStore } from "src/stores/MenuStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "stores/DataStore";
import { useCartStore } from "stores/CartStore";
import auth from "src/api/auth";

export default {
  name: "MenuCategoryFirst",
  props: ["slug", "merchant_id", "promoEligibility"],
  components: {
    CategoriesModal: defineAsyncComponent(() =>
      import("src/components/CategoriesModal.vue")
    ),
    SearchCategoryItems: defineAsyncComponent(() =>
      import("src/components/SearchCategoryItems.vue")
    ),
    ItemInfo: defineAsyncComponent(() => import("src/components/ItemInfo.vue")),
    AllergensInformation: defineAsyncComponent(() =>
      import("src/components/AllergensInformation.vue")
    ),
    NoResults: defineAsyncComponent(() => import("src/components/NoResults.vue")),
  },
  setup() {
    const MenuStore = useMenuStore();
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    const CartStore = useCartStore();

    const addons_use_checkbox = DataStore.addons_use_checkbox ?? true;
    const ItemComponents = defineAsyncComponent(() =>
      addons_use_checkbox
        ? import("components/ItemDetailsCheckbox.vue")
        : import("components/ItemDetails.vue")
    );

    return {
      MenuStore,
      DataStorePersisted,
      DataStore,
      CartStore,
      ItemComponents,
    };
  },
  data() {
    return {
      category: [],
      loading: false,
      active_category: null,
      active_category_name: null,
      canScrollLeft: false,
      canScrollRight: false,
    };
  },
  computed: {
    menuCacheKey() {
      return `${this.slug || ""}:${this.DataStorePersisted.app_language || "en"}`;
    },
    hasData() {
      return Array.isArray(this.category) && this.category.length > 0;
    },
    normalizedCategories() {
      return (this.category || []).map((cat, index) => ({
        ...cat,
        _key: String(
          cat.category_uiid ??
            cat.cat_id ??
            cat.category_id ??
            cat.id ??
            index
        ),
      }));
    },
    menuComponent() {
      return this.DataStorePersisted.menu_list_type === "list"
        ? defineAsyncComponent(() => import("components/MenuList.vue"))
        : defineAsyncComponent(() => import("components/MenuGrid.vue"));
    },
    visibleCategories() {
      if (!this.active_category) {
        return this.normalizedCategories;
      }

      return this.normalizedCategories.filter(
        (cat) => String(cat._key) === String(this.active_category)
      );
    },
  },
  watch: {
    "DataStorePersisted.app_language"() {
      this.MenuStore.menu_saved_slug = null;
      this.MenuStore.menu_saved_data = null;
      this.category = [];
      this.active_category = null;
      this.active_category_name = this.$t("Categories");
      this.fetchStoreMenu();
    },
    active_category_name(newval) {
      this.$emit("onCategorychange", newval || this.$t("Categories"));
    },
  },
  mounted() {
    this.$emit("onCategorychange", this.$t("Categories"));

    if (
      this.MenuStore.menu_saved_slug == this.menuCacheKey &&
      this.MenuStore.menu_saved_data
    ) {
      this.category = this.MenuStore.menu_saved_data?.category || [];
      this.$nextTick(() => {
        this.updateTabsState();
      });
    } else {
      this.MenuStore.menu_saved_slug = null;
      this.MenuStore.menu_saved_data = null;
      this.fetchStoreMenu();
    }

    window.addEventListener("resize", this.updateTabsState);
  },
  beforeUnmount() {
    this.MenuStore.menu_saved_slug = this.menuCacheKey;
    this.MenuStore.menu_saved_data = {
      category: this.category,
      slug: this.slug,
    };

    window.removeEventListener("resize", this.updateTabsState);
  },
  methods: {
    async fetchStoreMenu() {
      try {
        this.loading = true;
        this.category = [];
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

        this.category = response?.details?.data?.category || [];

        await nextTick();

        this.updateTabsState();
      } catch (error) {
        console.log("fetchStoreMenu error", error);
      } finally {
        this.loading = false;
      }
    },
    loadCart() {
      this.CartStore.getCart(true, null, this.slug);
      this.$emit("promoCheck");
    },
    afterAdditems(cart_uuid) {
      this.DataStorePersisted.cart_uuid = cart_uuid;
      this.DataStorePersisted.merchant_slug = this.slug;
      this.loadCart();
    },
    afterSavefav() {},
    onClickitems(value) {
      this.$refs.item_details.showItem2(value, this.slug);
    },
    showOptions(value) {
      this.$refs.ref_iteminfo.data = value;
      this.$refs.ref_iteminfo.modal = true;
    },
    showItemdetails(cat_id, item_uuid, cart_row) {
      const params = { cat_id, item_uuid };
      if (cart_row) {
        params.cart_row = cart_row;
      }
      this.$refs.item_details.showItem2(params, this.slug);
    },
    showAllergens(value) {
      this.$refs.ref_allergens.show(true, value.merchant_id, value.item_id);
    },
    isActiveCategory(cat) {
      return String(cat._key) === String(this.active_category);
    },
    setActiveCategory(categoryKey) {
      const normalizedKey =
        categoryKey === null || categoryKey === undefined
          ? null
          : String(categoryKey);
      const selectedCategory = this.normalizedCategories.find(
        (cat) => String(cat._key) === normalizedKey
      );

      this.active_category = normalizedKey;
      this.active_category_name = selectedCategory?.category_name || this.$t("Categories");

      this.$nextTick(() => {
        this.centerActiveChip();
        this.scrollMenuTop();
      });
    },
    afterCategoryselect(value) {
      this.$refs.categories_modal.modal = false;
      const found = this.normalizedCategories.find(
        (cat) => String(cat.cat_id) === String(value?.cat_id) ||
                 String(cat._key) === String(value?.category_uiid)
      );
      if (found) {
        this.setActiveCategory(found._key);
      }
    },
    showCategory() {
      this.$refs.categories_modal.modal = true;
    },
    centerActiveChip() {
      const wrapper = this.$refs.chipsScroll;
      if (!wrapper) return;
      const active = wrapper.querySelector(".tagam-menu-chip--active");
      if (!active) return;

      const targetLeft =
        active.offsetLeft - wrapper.clientWidth / 2 + active.offsetWidth / 2;

      wrapper.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: "smooth",
      });

      this.$nextTick(() => this.updateTabsState());
    },
    updateTabsState() {
      const wrapper = this.$refs.chipsScroll;
      if (!wrapper) {
        this.canScrollLeft = false;
        this.canScrollRight = false;
        return;
      }

      const maxScrollLeft = wrapper.scrollWidth - wrapper.clientWidth;
      this.canScrollLeft = wrapper.scrollLeft > 4;
      this.canScrollRight = maxScrollLeft - wrapper.scrollLeft > 4;
    },
    scrollTabs(direction) {
      const wrapper = this.$refs.chipsScroll;
      if (!wrapper) return;

      const amount = Math.max(wrapper.clientWidth * 0.72, 140);
      const left =
        direction === "left"
          ? wrapper.scrollLeft - amount
          : wrapper.scrollLeft + amount;

      wrapper.scrollTo({
        left,
        behavior: "smooth",
      });
    },
    scrollMenuTop() {
      const { getScrollTarget, getVerticalScrollPosition, setVerticalScrollPosition } = scroll;
      const target = getScrollTarget(this.$el);
      const targetTop = target === window ? 0 : target.getBoundingClientRect().top;
      const elementTop =
        this.$el.getBoundingClientRect().top - targetTop + getVerticalScrollPosition(target);

      setVerticalScrollPosition(target, Math.max(0, elementTop - 112), 280);
    },
  },
};
</script>

<style scoped>
.tagam-menu-category-first {
  background: transparent;
}

.tagam-menu-tabs-sticky {
  position: sticky;
  top: 46px;
  z-index: 40;
  background: #ffffff;
  padding: 6px 0 8px;
  backdrop-filter: none;
}

.tagam-menu-tabs-wrap {
  position: relative;
  overflow: visible;
}

.tagam-menu-tabs-fade {
  position: absolute;
  top: 0;
  width: 64px;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.tagam-menu-tabs-fade--left {
  left: 0;
  background: linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.82) 58%,
    rgba(255, 255, 255, 1) 100%
  );
}

.tagam-menu-tabs-fade--right {
  right: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.82) 58%,
    rgba(255, 255, 255, 1) 100%
  );
}

.tagam-menu-tabs-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0;
  scrollbar-width: none;
}

.tagam-menu-tabs-scroll::-webkit-scrollbar {
  display: none;
}

.tagam-menu-tabs-hint {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  color: #f18800;
  background: #f7f7f7;
  z-index: 2;
  cursor: pointer;
}

.tagam-menu-tabs-hint--left {
  left: 0;
}

.tagam-menu-tabs-hint--right {
  right: 0;
}

.tagam-menu-chip {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: #f7f7f7 !important;
  color: #7e7e7e !important;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: none !important;
}

.tagam-menu-chip--active {
  background: #f18800 !important;
  color: #ffffff !important;
  box-shadow: none;
}

.tagam-menu-section {
  scroll-margin-top: 182px;
}

.tagam-menu-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tagam-menu-section__title {
  font-size: 15px;
  line-height: 1.1;
  font-weight: 800;
  color: #f18800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tagam-menu-separator {
  background: #eadfc8;
}

:global(body.body--dark) .tagam-menu-category-first {
  background: transparent !important;
}

:global(body.body--dark) .tagam-menu-tabs-sticky {
  background: transparent !important;
}

:global(body.body--dark) .tagam-menu-tabs-wrap {
  background: var(--tagam-surface-soft) !important;
  border: 1px solid var(--tagam-stroke) !important;
  border-radius: 24px !important;
  padding: 10px !important;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-menu-tabs-scroll {
  padding: 0 38px 0 0;
}

:global(body.body--dark) .tagam-menu-chip {
  background: var(--tagam-surface-raised) !important;
  color: var(--tagam-text-soft) !important;
}

:global(body.body--dark) .tagam-menu-chip--active {
  background: linear-gradient(
    135deg,
    var(--tagam-primary) 0%,
    var(--tagam-primary-strong) 100%
  ) !important;
  color: #fff7f0 !important;
}

:global(body.body--dark) .tagam-menu-tabs-hint {
  background: var(--tagam-surface-inset) !important;
  color: var(--tagam-primary) !important;
}

:global(body.body--dark) .tagam-menu-tabs-fade--left {
  background: linear-gradient(
    270deg,
    rgba(36, 29, 26, 0) 0%,
    rgba(36, 29, 26, 0.84) 58%,
    rgba(36, 29, 26, 1) 100%
  ) !important;
}

:global(body.body--dark) .tagam-menu-tabs-fade--right {
  background: linear-gradient(
    90deg,
    rgba(36, 29, 26, 0) 0%,
    rgba(36, 29, 26, 0.84) 58%,
    rgba(36, 29, 26, 1) 100%
  ) !important;
}

:global(body.body--dark) .tagam-menu-section {
  background: rgba(39, 31, 27, 0.96) !important;
  border-left: 1px solid var(--tagam-stroke) !important;
  border-right: 1px solid var(--tagam-stroke) !important;
}

:global(body.body--dark) .tagam-menu-section:first-of-type {
  border-top: 1px solid var(--tagam-stroke) !important;
  border-top-left-radius: 26px !important;
  border-top-right-radius: 26px !important;
  padding-top: 12px;
}

:global(body.body--dark) .tagam-menu-section:last-of-type {
  border-bottom: 1px solid var(--tagam-stroke) !important;
  border-bottom-left-radius: 26px !important;
  border-bottom-right-radius: 26px !important;
  padding-bottom: 8px;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-menu-section__title {
  color: var(--tagam-primary) !important;
}

:global(body.body--dark) .tagam-menu-separator {
  opacity: 0.18;
}
</style>
