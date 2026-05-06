<template>
  <div class="tagam-menu-page">
    <div class="tagam-menu-tabs-sticky">
      <div class="tagam-menu-tabs-wrap">
        <button
          type="button"
          class="tagam-menu-chip tagam-menu-chip--all"
          :class="{ 'tagam-menu-chip--active': active_category_index === null }"
          @click.stop.prevent="handleAllPress"
          @touchend.stop.prevent="handleAllPress"
          @pointerup.stop.prevent="handleAllPress"
        >
          {{ $t("All") }}
        </button>

        <div
          ref="chipsScroll"
          class="tagam-menu-tabs-scroll"
          @scroll="updateTabsState"
        >
          <template v-for="(items_category, index) in getCategory" :key="items_category._key">
            <button
              type="button"
              class="tagam-menu-chip"
              :class="{
                'tagam-menu-chip--active': active_category_index === index,
              }"
              @click.stop.prevent="handleCategoryPress(index)"
              @touchend.stop.prevent="handleCategoryPress(index)"
              @pointerup.stop.prevent="handleCategoryPress(index)"
            >
              {{ items_category.category_name }}
            </button>
          </template>
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

    <div class="tagam-menu-content">
      <template v-for="(category, index) in getCategory" :key="category._key">
        <div
          ref="sections"
          :data-category-index="index"
          class="tagam-menu-section"
        >
          <div class="row items-center justify-between q-pl-md q-pr-md tagam-menu-section-head">
          <div
            :id="category._key"
            :name="category.category_name"
            class="text-weight-bold text-subtitle1 no-margin line-normal tagam-menu-section-title"
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
            class="tagam-menu-separator"
          ></q-separator>
          <q-space class="q-pa-sm"></q-space>
        </div>
      </template>
    </div>

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
      :active_category="activeCategoryKey"
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

  </div>
</template>

<script>
import { defineAsyncComponent, nextTick } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useCartStore } from "stores/CartStore";
import { useMenuStore } from "src/stores/MenuStore";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import auth from "src/api/auth";

export default {
  name: "MenuAll",
  props: ["slug", "merchant_id", "promoEligibility"],
  components: {
    ItemInfo: defineAsyncComponent(() => import("src/components/ItemInfo.vue")),
    AllergensInformation: defineAsyncComponent(() =>
      import("src/components/AllergensInformation.vue")
    ),
    CategoriesModal: defineAsyncComponent(() =>
      import("src/components/CategoriesModal.vue")
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
      active_category_index: null,
      active_category_name: null,
      canScrollLeft: false,
      canScrollRight: false,
      lastInteractionAt: 0,
      sectionObserver: null,
      isProgrammaticScroll: false,
      scrollUnlockTimer: null,
    };
  },
  mounted() {
    if (
      this.MenuStore.menu_saved_slug == this.menuCacheKey &&
      this.MenuStore.menu_saved_data
    ) {
      this.data = this.MenuStore.menu_saved_data;
      this.active_category_name = this.$t("Categories");
      this.$nextTick(() => {
        this.updateTabsState();
        this.startSectionObserver();
      });
    } else {
      this.geStoreMenu();
    }

    window.addEventListener("resize", this.updateTabsState);
  },
  beforeUnmount() {
    this.MenuStore.menu_saved_slug = this.menuCacheKey;
    this.MenuStore.menu_saved_data = this.data;
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
    if (this.scrollUnlockTimer) {
      clearTimeout(this.scrollUnlockTimer);
    }
    window.removeEventListener("resize", this.updateTabsState);
  },
  computed: {
    menuCacheKey() {
      return `${this.slug || ""}:${this.DataStorePersisted.app_language || "en"}`;
    },
    menuComponent() {
      return this.DataStorePersisted.menu_list_type === "list"
        ? defineAsyncComponent(() => import("components/MenuList.vue"))
        : defineAsyncComponent(() => import("components/MenuGrid.vue"));
    },
    getCategory() {
      return (this.data?.category || []).map((category, index) => ({
        ...category,
        _key: String(
          category.category_uiid ??
            category.cat_id ??
            category.category_id ??
            category.id ??
            category.category_name ??
            `cat-${index}`
        ),
      }));
    },
    activeCategoryKey() {
      if (this.active_category_index === null) {
        return null;
      }
      return this.getCategory?.[this.active_category_index]?._key || null;
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
    "DataStorePersisted.app_language"() {
      this.MenuStore.menu_saved_slug = null;
      this.MenuStore.menu_saved_data = null;
      this.data = [];
      this.active_category_index = null;
      this.geStoreMenu();
    },
    active_category_name(newval) {
      this.$emit("onCategorychange", newval || this.$t("Categories"));
    },
    active_category_index(newval) {
      if (newval === null || newval === undefined) {
        this.active_category_name = this.$t("Categories");
      } else {
        const selectedCategory = this.getCategory?.[newval];
        this.active_category_name =
          selectedCategory?.category_name || this.$t("Categories");
      }
      this.$nextTick(() => {
        this.centerActiveChip();
      });
    },
  },
  methods: {
    handleAllPress() {
      const now = Date.now();
      if (now - this.lastInteractionAt < 120) {
        return;
      }
      this.lastInteractionAt = now;
      this.setActiveCategory(null);
      this.scrollToTop();
    },
    handleCategoryPress(value) {
      const now = Date.now();
      if (now - this.lastInteractionAt < 120) {
        return;
      }
      this.lastInteractionAt = now;
      this.setActiveCategory(value);
      this.scrollToCategory(value);
    },
    centerActiveChip() {
      const wrapper = this.$refs.chipsScroll;
      if (!wrapper) return;

      const activeChip = wrapper.querySelector(".tagam-menu-chip--active");
      if (!activeChip) return;

      const targetLeft =
        activeChip.offsetLeft - wrapper.clientWidth / 2 + activeChip.offsetWidth / 2;

      wrapper.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: "smooth",
      });

      this.updateTabsState();
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
      wrapper.scrollTo({
        left:
          direction === "left"
            ? wrapper.scrollLeft - amount
            : wrapper.scrollLeft + amount,
        behavior: "smooth",
      });
    },
    setActiveCategory(index) {
      if (index === null || index === undefined) {
        this.active_category_index = null;
        return;
      }

      const normalizedIndex = Number(index);
      this.active_category_index =
        this.active_category_index === normalizedIndex ? null : normalizedIndex;
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
    afterCategoryselect(data) {
      this.$refs.categories_modal.modal = false;
      const selectedIndex = this.getCategory.findIndex(
        (category) =>
          String(category._key) ===
          String(
            data?.category_uiid ??
              data?.cat_id ??
              data?.category_id ??
              data?.id ??
              data?.category_name
          )
      );

      this.active_category_index = selectedIndex >= 0 ? selectedIndex : null;
      if (selectedIndex >= 0) {
        this.scrollToCategory(selectedIndex);
      } else {
        this.scrollToTop();
      }
    },
    showCategory() {
      this.$refs.categories_modal.modal = true;
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
        this.data = [];
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
        this.active_category_index = null;
        this.active_category_name = this.$t("Categories");
        this.$nextTick(() => {
          this.updateTabsState();
          this.startSectionObserver();
        });
      } catch (error) {
        console.log("error", error);
      } finally {
        this.loading = false;
      }
    },
    scrollToCategory(index) {
      const sections = Array.isArray(this.$refs.sections)
        ? this.$refs.sections
        : [this.$refs.sections];
      const targetSection = sections?.[index];
      if (!targetSection) return;

      this.isProgrammaticScroll = true;
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      if (this.scrollUnlockTimer) {
        clearTimeout(this.scrollUnlockTimer);
      }
      this.scrollUnlockTimer = setTimeout(() => {
        this.isProgrammaticScroll = false;
      }, 450);
    },
    scrollToTop() {
      this.isProgrammaticScroll = true;
      this.$el?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      if (this.scrollUnlockTimer) {
        clearTimeout(this.scrollUnlockTimer);
      }
      this.scrollUnlockTimer = setTimeout(() => {
        this.isProgrammaticScroll = false;
      }, 450);
    },
    startSectionObserver() {
      const sections = Array.isArray(this.$refs.sections)
        ? this.$refs.sections
        : [this.$refs.sections];

      if (!sections?.length) return;

      if (this.sectionObserver) {
        this.sectionObserver.disconnect();
      }

      this.sectionObserver = new IntersectionObserver(
        (entries) => {
          if (this.isProgrammaticScroll) {
            return;
          }

          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

          if (visible.length > 0) {
            const nextIndex = Number(
              visible[0].target?.dataset?.categoryIndex ?? 0
            );
            this.active_category_index = Number.isNaN(nextIndex)
              ? null
              : nextIndex;
          }
        },
        {
          root: null,
          rootMargin: "-140px 0px -55% 0px",
          threshold: [0.15, 0.35, 0.6],
        }
      );

      sections.filter(Boolean).forEach((section) => {
        this.sectionObserver.observe(section);
      });
    },
  },
};
</script>

<style scoped>
.tagam-menu-page {
  background: #ffffff;
}

.tagam-menu-tabs-sticky {
  position: sticky;
  top: 46px;
  z-index: 40;
  background: #ffffff;
  padding: 6px 0 8px;
}

.tagam-menu-tabs-wrap {
  position: relative;
  overflow: visible;
  display: flex;
  align-items: center;
  gap: 10px;
  isolation: isolate;
}

.tagam-menu-content {
  padding-top: 2px;
  overflow: visible;
}

.tagam-menu-section-head {
  margin-bottom: 4px;
}

.tagam-menu-section-title {
  color: #f18800;
  font-size: 15px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tagam-menu-tabs-scroll {
  display: flex;
  gap: 8px;
  padding: 0 44px 0 4px;
  flex: 1 1 auto;
  overflow-x: auto;
  scrollbar-width: none;
}

.tagam-menu-tabs-scroll::-webkit-scrollbar {
  display: none;
}

.tagam-menu-chip {
  border: none;
  position: relative;
  z-index: 3;
  pointer-events: auto;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: #f7f7f7;
  color: #7e7e7e;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: none;
  cursor: pointer;
}

.tagam-menu-chip--all {
  flex: 0 0 auto;
  position: relative;
  z-index: 4;
}

.tagam-menu-chip--active {
  background: #f18800;
  color: #ffffff;
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

.tagam-menu-tabs-fade {
  position: absolute;
  top: 0;
  width: 64px;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.tagam-menu-tabs-fade--left {
  left: 56px;
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

.tagam-menu-section {
  scroll-margin-top: 182px;
}

:global(body.body--dark) .tagam-menu-page,
:global(body.body--dark) .tagam-menu-tabs-sticky {
  background: transparent;
}

:global(body.body--dark) .tagam-menu-tabs-wrap {
  background: var(--tagam-surface-soft);
  border: 1px solid var(--tagam-stroke);
  border-radius: 24px;
  padding: 10px;
  box-shadow: var(--tagam-shadow);
}

:global(body.body--dark) .tagam-menu-content {
  margin-top: 10px;
  padding: 6px 0 4px;
  background: rgba(39, 31, 27, 0.96) !important;
  border: 1px solid var(--tagam-stroke) !important;
  border-radius: 26px !important;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-menu-chip {
  background: var(--tagam-surface-raised);
  color: var(--tagam-text-soft);
}

:global(body.body--dark) .tagam-menu-chip--active {
  background: linear-gradient(
    135deg,
    var(--tagam-primary) 0%,
    var(--tagam-primary-strong) 100%
  );
  color: #fff7f0;
}

:global(body.body--dark) .tagam-menu-tabs-hint {
  background: var(--tagam-surface-inset);
  color: var(--tagam-primary);
}

:global(body.body--dark) .tagam-menu-tabs-fade--left {
  background: linear-gradient(
    270deg,
    rgba(36, 29, 26, 0) 0%,
    rgba(36, 29, 26, 0.84) 58%,
    rgba(36, 29, 26, 1) 100%
  );
}

:global(body.body--dark) .tagam-menu-tabs-fade--right {
  background: linear-gradient(
    90deg,
    rgba(36, 29, 26, 0) 0%,
    rgba(36, 29, 26, 0.84) 58%,
    rgba(36, 29, 26, 1) 100%
  );
}

:global(body.body--dark) .tagam-menu-section-title {
  color: var(--tagam-primary);
}

:global(body.body--dark) .tagam-menu-separator {
  opacity: 0.18;
}

:global(body.body--dark) .tagam-menu-section-head,
:global(body.body--dark) .tagam-menu-section {
  background: transparent !important;
}
</style>
