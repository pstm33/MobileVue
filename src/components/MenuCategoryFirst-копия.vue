<template>
  <q-infinite-scroll
    ref="nscroll"
    @load="getMenuCategory"
    :offset="250"
    :disable="scroll_disabled"
  >
    <template v-slot:default>
      <DIV class="q-pl-md q-pr-md q-pt-sm">
        <template v-if="!hasMore && !hasData">
          no results
          <NoResults
            :message="$t('noResults')"
            :description="$t('noResultsDesc')"
          ></NoResults>
        </template>
      </DIV>

      <div class="q-pl-md q-pr-md">
        <q-skeleton
          v-if="firsLoading"
          type="QChip"
          style="height: 35px"
          class="full-width"
        />

        <div
          v-else
          class="bg-grey-1 text-subtitle2 q-pa-sm radius28 flex items-center cursor-pointer"
          @click="showSearchMenu"
        >
          <div class="q-mr-sm">
            <q-icon name="eva-search-outline" size="20px"></q-icon>
          </div>
          <div class="text-caption">
            {{ $t("Search") }}
          </div>
        </div>
      </div>
      <q-space class="q-pa-sm"></q-space>

      <div class="row items-start q-col-gutter-md q-pl-md q-pr-md">
        <div
          class="col-6 q-gutter-y-xs cursor-pointer text-center"
          v-for="items in topCategory"
          :key="items"
          ref="categories"
          :name="items.category_name"
          @click="showItem(items)"
        >
          <q-responsive style="height: 8em; margin: auto">
            <q-img
              :src="items.url_image"
              placeholder-src="placeholder.png"
              lazy
              fit="cover"
              class="radius8"
              spinner-color="primary"
              spinner-size="sm"
            />
          </q-responsive>
          <div
            class="text-weight-bold text-subtitle1 ellipsis"
            v-html="items.category_name"
          ></div>
        </div>
      </div>

      <q-space class="q-pa-sm"></q-space>

      <q-separator></q-separator>

      <q-list separator v-if="remainingCategory.length > 0">
        <template v-for="items in remainingCategory" :key="items">
          <q-item
            clickable
            v-ripple:purple
            :to="{
              name: 'menu_category',
              query: {
                cat_id: items.cat_id,
                category_name: items.category_name,
                slug: this.slug,
              },
            }"
          >
            <q-item-section
              class="text-weight-bold text-subtitle1 no-margin line-normal"
            >
              <div
                ref="categories"
                :id="items.category_uiid"
                :name="items.category_name"
              >
                {{ items.category_name }}
              </div>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
      <q-space class="q-pa-md"></q-space>
    </template>

    <template v-slot:loading>
      <MenuLoader loading_type="grid"></MenuLoader>
      <MenuLoader loading_type="list-only"></MenuLoader>
    </template>
  </q-infinite-scroll>

  <CategoriesModal
    ref="categories_modal"
    :data="getCategory"
    :active_category="active_category"
    @after-categoryselect="afterCategoryselect"
  ></CategoriesModal>

  <SearchCategoryItems
    ref="ref_search_menu"
    :merchant_id="merchant_id"
    cat_id=""
    :search_label="$t('Search menu')"
    @on-clickitems="onClickitems"
  ></SearchCategoryItems>

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
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { scroll } from "quasar";
import { useMenuStore } from "src/stores/MenuStore";
const { getScrollTarget, setVerticalScrollPosition } = scroll;
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "stores/DataStore";

export default {
  name: "MenuCategoryFirst",
  props: ["slug", "merchant_id"],
  components: {
    CategoriesModal: defineAsyncComponent(() =>
      import("src/components/CategoriesModal.vue")
    ),
    MenuLoader: defineAsyncComponent(() =>
      import("src/components/MenuLoader.vue")
    ),
    SearchCategoryItems: defineAsyncComponent(() =>
      import("src/components/SearchCategoryItems.vue")
    ),
  },
  setup() {
    const MenuStore = useMenuStore();
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();

    const addons_use_checkbox = DataStore.addons_use_checkbox ?? true;
    const ItemComponents = defineAsyncComponent(() =>
      addons_use_checkbox
        ? import("components/ItemDetailsCheckbox.vue")
        : import("components/ItemDetails.vue")
    );

    return { MenuStore, DataStorePersisted, DataStore, ItemComponents };
  },
  data() {
    return {
      category: [],
      loading: false,
      current_page: 1,
      scroll_disabled: true,
      hasMore: true,
      params: {},
      active_category: null,
      active_category_name: null,
    };
  },
  mounted() {
    console.log("mounted");

    this.$emit("onCategorychange", this.$t("Categories"));

    if (
      this.MenuStore.menu_saved_slug == this.slug &&
      this.MenuStore.menu_saved_data
    ) {
      console.log("has data");
      this.category = this.MenuStore.menu_saved_data?.category;
      this.current_page = this.MenuStore.menu_saved_data?.current_page;
      this.hasMore = this.MenuStore.menu_saved_data?.hasMore;
    } else {
      this.MenuStore.menu_saved_slug = null;
      this.MenuStore.menu_saved_data = null;
    }

    this.scroll_disabled = false;
  },
  beforeUnmount() {
    this.MenuStore.menu_saved_slug = this.slug;
    this.MenuStore.menu_saved_data = {
      category: this.category,
      slug: this.slug,
      current_page: this.current_page,
      hasMore: this.hasMore,
    };
  },
  computed: {
    firsLoading() {
      return this.loading && this.current_page == 1 ? true : false;
    },
    getCategory() {
      return this.category || null;
    },
    hasData() {
      return Object.keys(this.category).length > 0;
    },
    topCategory() {
      return this.category.slice(0, 4);
    },
    remainingCategory() {
      return this.category.slice(4);
    },
  },
  watch: {
    active_category_name(newval, oldval) {
      this.$emit("onCategorychange", newval);
    },
  },
  methods: {
    onClickitems(value) {
      console.log("onClickitems MenuCategoryFirst", value);
      this.$refs.item_details.showItem2(value, this.slug);
    },
    showSearchMenu() {
      console.log("showSearchMenu");
      this.$refs.ref_search_menu.modal = true;
    },
    geStoreMenu() {
      console.log("geStoreMenu");
      this.resetPagination();
    },
    resetPagination() {
      this.MenuStore.menu_saved_slug = null;
      this.MenuStore.menu_saved_data = null;

      this.category = [];
      this.current_page = 1;
      this.hasMore = true;
      this.scroll_disabled = false;
      this.$nextTick(() => {
        this.$refs.nscroll?.resume?.();
        this.$refs.nscroll?.trigger?.();
      });
    },
    showItem(value) {
      this.$router.push({
        name: "menu_category",
        query: {
          merchantID: this.merchant_id,
          cat_id: value.cat_id,
          category_name: value.category_name,
          slug: this.slug,
        },
      });
    },
    afterCategoryselect(value) {
      this.$refs.categories_modal.modal = false;
      console.log("afterCategoryselect", value);
      this.$router.push({
        name: "menu_category",
        query: {
          cat_id: value?.cat_id,
          category_name: value?.category_name,
          slug: this.slug,
        },
      });
    },
    showCategory() {
      this.$refs.categories_modal.modal = true;
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
    async getMenuCategory(index, done) {
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
        this.params.slug = this.slug;

        const response = await APIinterface.fetchGetRequest(
          "getMenuCategory",
          new URLSearchParams(this.params).toString()
        );

        this.category = [...this.category, ...response.details.data];

        this.current_page++;

        if (response.details.is_last_page) {
          this.hasMore = false;
          //this.startObserver();
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
    startObserver() {
      if (this.getCategory) {
        console.log("start", this.getCategory);
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
