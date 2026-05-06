<template>
  <div class="filters-wrap" :class="{ 'filters-wrap--compact': compact }">
    <q-btn
      no-caps
      unelevated
      class="tagam-filter-trigger"
      :class="{
        'tagam-filter-trigger--compact': compact,
        'tagam-filter-trigger--active': getCountFilter > 0,
      }"
      @click="modal_filters = true"
    >
      <div class="tagam-filter-trigger__inner">
        <q-icon name="tune" size="18px" />
        <span v-if="!compact">{{ $t("Filters") }}</span>
      </div>
      <q-badge
        v-if="getCountFilter > 0"
        rounded
        color="primary"
        class="tagam-filter-trigger__badge"
      >
        {{ getCountFilter }}
      </q-badge>
    </q-btn>
  </div>

  <!-- FILTER MODAL -->
  <q-dialog
    v-model="modal_filters"
    maximized
    transition-show="fade"
    @show="startObserver"
    @before-show="onBeforeShow"
  >
    <q-card class="tagam-filter-dialog tagam-filter-dialog--max">
      <div class="fixed-top text-dark z-top tagam-filter-dialog__top">
        <div class="tagam-filter-dialog__hero">
          <div class="tagam-filter-dialog__hero-copy">
            <div class="tagam-filter-dialog__eyebrow">{{ $t("Filters") }}</div>
            <div class="tagam-filter-dialog__title">
              {{ $t("Find the right restaurants") }}
            </div>
            <div class="tagam-filter-dialog__subtitle">
              {{ $t("Choose cuisine, promo, delivery mode and other preferences.") }}
            </div>
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            class="tagam-filter-dialog__close"
          ></q-btn>
        </div>
        <q-tabs
          v-model="filter_options"
          dense
          class="text-dark tagam-filter-dialog__tabs"
          active-color="primary"
          active-class="active-tabs"
          indicator-color="primary"
          align="justify"
          no-caps
          mobile-arrows
        >
          <template v-for="items in filter_list" :key="items">
            <q-tab
              :name="items.value"
              :label="items.label"
              @click="scrollToElement(items.value)"
            />
          </template>
        </q-tabs>
      </div>
      <q-space style="height: 136px"></q-space>

      <template v-for="items in filter_list" :key="items">
        <div ref="categories" :id="items.value" class="tagam-filter-dialog__section-shell">
          <q-list separator class="tagam-filter-dialog__list">
            <q-item-label
              header
              class="tagam-filter-dialog__section-title"
              >{{ items.label }}</q-item-label
            >
            <template v-if="items.value == 'sort_by'">
              <template
                v-for="(items, index) in DataStore.sort_list"
                :key="items"
              >
                <q-item tag="label" v-ripple clickable>
                  <q-item-section>
                    {{ items }}
                  </q-item-section>
                  <q-item-section side>
                    <q-radio v-model="filter_sortby" :val="index" size="sm" />
                  </q-item-section>
                </q-item>
              </template>
            </template>
            <template v-else-if="items.value == 'restaurant_options'">
              <template v-for="items in DataStore.sort_by" :key="items">
                <q-item tag="label" v-ripple clickable>
                  <q-item-section>
                    {{ items.label }}
                  </q-item-section>
                  <q-item-section side>
                    <q-radio
                      v-model="filter_restaurant_options"
                      :val="items.value"
                      size="sm"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </template>
            <template v-else-if="items.value == 'quick_filters'">
              <template
                v-for="(items, index) in DataStore.quick_filters"
                :key="items"
              >
                <q-item tag="label" v-ripple clickable>
                  <q-item-section>
                    {{ items }}
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox v-model="filter_quick" :val="index" size="sm" />
                  </q-item-section>
                </q-item>
              </template>
            </template>
            <template v-else-if="items.value == 'promo'">
              <template
                v-for="(items, index) in DataStore.offers_filters"
                :key="items"
              >
                <q-item tag="label" v-ripple clickable>
                  <q-item-section>
                    {{ items }}
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox v-model="filter_promo" :val="index" size="sm" />
                  </q-item-section>
                </q-item>
              </template>
            </template>
            <template v-else-if="items.value == 'cusine'">
              <template
                v-for="items in visibleCuisines"
                :key="items.cuisine_id"
              >
                <q-item tag="label" v-ripple clickable>
                  <q-item-section
                    :class="{
                      'text-weight-bold': isCusineSelected(items.cuisine_id),
                    }"
                  >
                    {{ items.cuisine_name }}
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox
                      v-model="filter_cuisine"
                      :val="items.cuisine_id"
                      size="sm"
                    />
                  </q-item-section>
                </q-item>
              </template>

              <q-item
                v-if="DataStore.cuisine.length > maxVisible"
                clickable
                @click="toggleShowMore"
              >
                <q-item-section class="text-center text-blue text-subtitle2">
                  {{ showMore ? $t("Show Less") : $t("Show More") }}
                </q-item-section>
              </q-item>
            </template>
            <template v-else-if="items.value == 'mode'">
              <template
                v-for="(items, value) in DataStore.online_services"
                :key="items"
              >
                <q-item tag="label" v-ripple clickable>
                  <q-item-section>
                    {{ items }}
                  </q-item-section>
                  <q-item-section side>
                    <q-radio
                      v-model="filter_order_type"
                      :val="value"
                      size="sm"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </template>
            <template v-else-if="items.value == 'price'">
              <template
                v-for="items in DataStore.price_range_data"
                :key="items"
              >
                <q-item tag="label" v-ripple clickable>
                  <q-item-section>
                    {{ items.label }}
                  </q-item-section>
                  <q-item-section side>
                    <q-radio
                      v-model="filter_price_range"
                      :val="items.value"
                      size="sm"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </template>
          </q-list>
        </div>
      </template>

      <q-space class="q-pa-xl"></q-space>

      <q-card-actions class="fixed-bottom row q-gutter-x-md tagam-filter-dialog__actions" align="center">
        <q-intersection v-if="hasFilter" transition="slide-right" class="col-3">
          <q-btn
            color="white"
            text-color="dark"
            unelevated
            size="lg"
            no-caps
            outline
            rounded
            class="fit tagam-filter-dialog__secondary-btn"
            @click="resetFilter"
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Reset") }}
            </div>
          </q-btn>
        </q-intersection>
        <q-btn
          color="primary"
          unelevated
          size="lg"
          no-caps
          class="col tagam-filter-dialog__primary-btn"
          rounded
          @click="applyFilters"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Apply") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- CUISINE MODAL -->
  <q-dialog v-model="modal_cuisine" position="bottom">
    <q-card class="relative-position tagam-filter-sheet">
      <q-toolbar class="text-primary top-toolbar q-pl-md tagam-filter-sheet__toolbar" dense>
        <q-toolbar-title class="text-weight-bold">
          {{ $t("Cuisine") }}
        </q-toolbar-title>
        <q-space></q-space>
        <div>
          <q-btn
            icon="close"
            color="dark"
            flat
            round
            dense
            v-close-popup
          ></q-btn>
        </div>
      </q-toolbar>

      <div class="q-pl-md q-pr-md q-pb-md tagam-filter-sheet__search-wrap">
        <q-input
          v-model="search_cuisine"
          :placeholder="$t('Search for cuisines')"
          dense
          outlined
          color="primary"
          bg-color="grey-1"
          class="full-width input-borderless tagam-filter-sheet__search"
          rounded
          clearable
          :loading="awaitingSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div style="max-height: 50vh" class="scroll">
        <q-list separator class="tagam-filter-sheet__list">
          <template v-for="items in visibleCuisines" :key="items.cuisine_id">
            <q-item tag="label" v-ripple clickable>
              <q-item-section
                :class="{
                  'text-weight-bold': isCusineSelected(items.cuisine_id),
                }"
              >
                {{ items.cuisine_name }}
              </q-item-section>
              <q-item-section side>
                <q-checkbox
                  v-model="filter_cuisine"
                  :val="items.cuisine_id"
                  size="sm"
                />
              </q-item-section>
            </q-item>
          </template>

          <q-item
            v-if="DataStore.cuisine.length > maxVisible"
            clickable
            @click="toggleShowMore"
          >
            <q-item-section class="text-center text-blue text-subtitle2">
              {{ showMore ? $t("Show Less") : $t("Show More") }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <q-space class="q-pa-xl"></q-space>
      <q-card-actions class="fixed-bottom row q-gutter-x-md tagam-filter-dialog__actions" align="center">
        <q-intersection v-if="hasFilter" transition="slide-right" class="col-3">
          <q-btn
            color="white"
            text-color="dark"
            unelevated
            size="lg"
            no-caps
            outline
            class="fit tagam-filter-dialog__secondary-btn"
            rounded
            @click="resetFilter"
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Reset") }}
            </div>
          </q-btn>
        </q-intersection>
        <q-btn
          color="primary"
          unelevated
          size="lg"
          no-caps
          class="col tagam-filter-dialog__primary-btn"
          rounded
          @click="applyFilters"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Apply") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- SORT BY MODAL  @before-hide="resetFilter" -->
  <q-dialog v-model="modal_sortby" position="bottom">
    <q-card class="relative-position tagam-filter-sheet">
      <q-toolbar class="text-primary top-toolbar q-pl-md tagam-filter-sheet__toolbar" dense>
        <q-toolbar-title class="text-weight-bold">
          {{ $t("Sort By") }}
        </q-toolbar-title>
        <q-space></q-space>
        <div>
          <q-btn
            icon="close"
            color="dark"
            flat
            round
            dense
            v-close-popup
          ></q-btn>
        </div>
      </q-toolbar>

      <div style="max-height: 50vh" class="scroll">
        <q-list separator class="tagam-filter-sheet__list">
          <template v-for="(items, index) in DataStore.sort_list" :key="items">
            <q-item tag="label" v-ripple clickable>
              <q-item-section>
                {{ items }}
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="filter_sortby" :val="index" size="sm" />
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>
      <q-space class="q-pa-xl"></q-space>
      <q-card-actions class="fixed-bottom row q-gutter-x-md tagam-filter-dialog__actions" align="center">
        <q-intersection v-if="hasFilter" transition="slide-right" class="col-3">
          <q-btn
            color="white"
            text-color="dark"
            unelevated
            size="lg"
            no-caps
            outline
            rounded
            class="fit tagam-filter-dialog__secondary-btn"
            @click="resetFilter"
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Reset") }}
            </div>
          </q-btn>
        </q-intersection>
        <q-btn
          color="primary"
          unelevated
          size="lg"
          no-caps
          class="col tagam-filter-dialog__primary-btn"
          rounded
          @click="applyFilters"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Apply") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- SORT BY MODAL -->

  <!-- PROMO MODAL -->
  <q-dialog v-model="modal_promo" position="bottom">
    <q-card class="relative-position tagam-filter-sheet">
      <q-toolbar class="text-primary top-toolbar q-pl-md tagam-filter-sheet__toolbar" dense>
        <q-toolbar-title class="text-weight-bold">
          {{ $t("Promo") }}
        </q-toolbar-title>
        <q-space></q-space>
        <div>
          <q-btn
            icon="close"
            color="dark"
            flat
            round
            dense
            v-close-popup
          ></q-btn>
        </div>
      </q-toolbar>

      <div style="max-height: 50vh" class="scroll">
        <q-list separator class="tagam-filter-sheet__list">
          <template
            v-for="(items, index) in DataStore.offers_filters"
            :key="items"
          >
            <q-item tag="label" v-ripple clickable>
              <q-item-section>
                {{ items }}
              </q-item-section>
              <q-item-section side>
                <q-checkbox v-model="filter_promo" :val="index" size="sm" />
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>
      <q-space class="q-pa-xl"></q-space>
      <q-card-actions class="fixed-bottom row q-gutter-x-md tagam-filter-dialog__actions" align="center">
        <q-intersection v-if="hasFilter" transition="slide-right" class="col-3">
          <q-btn
            color="white"
            text-color="dark"
            unelevated
            size="lg"
            no-caps
            outline
            class="fit tagam-filter-dialog__secondary-btn"
            rounded
            @click="resetFilter"
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Reset") }}
            </div>
          </q-btn>
        </q-intersection>
        <q-btn
          color="primary"
          unelevated
          size="lg"
          no-caps
          class="col tagam-filter-dialog__primary-btn"
          rounded
          @click="applyFilters"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Apply") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- PROMO MODAL -->

  <!-- QUICK FILTERS -->
  <q-dialog v-model="modal_quickfilters" position="bottom">
    <q-card class="relative-position tagam-filter-sheet">
      <q-toolbar class="text-primary top-toolbar q-pl-md tagam-filter-sheet__toolbar" dense>
        <q-toolbar-title class="text-weight-bold">
          {{ $t("Quick Filters") }}
        </q-toolbar-title>
        <q-space></q-space>
        <div>
          <q-btn
            icon="close"
            color="dark"
            flat
            round
            dense
            v-close-popup
          ></q-btn>
        </div>
      </q-toolbar>
      <div style="max-height: 50vh" class="scroll">
        <q-list separator class="tagam-filter-sheet__list">
          <template
            v-for="(items, index) in DataStore.quick_filters"
            :key="items"
          >
            <q-item tag="label" v-ripple clickable>
              <q-item-section>
                {{ items }}
              </q-item-section>
              <q-item-section side>
                <q-checkbox v-model="filter_quick" :val="index" size="sm" />
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>
      <q-space class="q-pa-xl"></q-space>
      <q-card-actions class="fixed-bottom row q-gutter-x-md tagam-filter-dialog__actions" align="center">
        <q-intersection v-if="hasFilter" transition="slide-right" class="col-3">
          <q-btn
            color="white"
            text-color="dark"
            unelevated
            size="lg"
            no-caps
            outline
            class="fit tagam-filter-dialog__secondary-btn"
            rounded
            @click="resetFilter"
          >
            <div class="text-subtitle2 text-weight-bold">
              {{ $t("Reset") }}
            </div>
          </q-btn>
        </q-intersection>
        <q-btn
          color="primary"
          unelevated
          size="lg"
          no-caps
          class="col tagam-filter-dialog__primary-btn"
          rounded
          @click="applyFilters"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Apply") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- QUICK FILTERS -->
</template>

<script>
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "FeedFilter",
  props: {
    search_mode: String,
    saved_filter: [Array, Object],
    compact: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      modal_filters: false,
      modal_cuisine: false,
      modal_sortby: false,
      modal_promo: false,
      modal_quickfilters: false,
      maxVisible: 5,
      showMore: false,
      filter_options: "sort_by",
      search_cuisine: null,
      filter_list: [
        {
          value: "sort_by",
          label: this.$t("Sort By"),
        },
        {
          value: "restaurant_options",
          label: this.$t("Filters"),
        },
        {
          value: "promo",
          label: this.$t("Promo"),
        },
        {
          value: "cusine",
          label: this.$t("Cuisine"),
        },
        {
          value: "mode",
          label: this.$t("Mode"),
        },
        {
          value: "price",
          label: this.$t("Price"),
        },
      ],
      awaitingSearch: false,
      cuisine_filtered_data: [],
      is_free_delivery: false,

      filter_sortby: "",
      filter_restaurant_options: "",
      filter_cuisine: [],
      filter_order_type: "",
      filter_price_range: "",
      filter_promo: [],
      filter_quick: [],
      feed_filter: [],
    };
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, DataStorePersisted };
  },
  computed: {
    ChangeLabelPromo() {
      const count = this.feed_filter?.offers_filters?.length || 0;
      return count > 0 ? `${this.$t("Promo")} (${count})` : this.$t("Promo");
    },
    ChangeLabelPromoColor() {
      return (this.feed_filter?.offers_filters?.length || 0) > 0;
    },

    ChangeLabelFreeDelivery() {
      return this.filter_restaurant_options ? true : false;
    },

    ChangeLabelCuisine() {
      const count = this.feed_filter?.cuisine?.length || 0;
      return count > 0
        ? `${this.$t("Cuisine")} (${count})`
        : this.$t("Cuisine");
    },
    ChangeLabelCuisineColor() {
      return (this.feed_filter?.cuisine?.length || 0) > 0;
    },

    ChangeLabelQuick() {
      const count = this.feed_filter?.quick_filters?.length || 0;
      return count > 0
        ? `${this.$t("Filter")} (${count})`
        : this.$t("Quick Filter");
    },
    ChangeLabelQuickColor() {
      return (this.feed_filter?.quick_filters?.length || 0) > 0;
    },

    ChangeLabelSort() {
      const finalLabel = this.DataStore.sort_list[this.feed_filter.sort_by]
        ? this.DataStore.sort_list[this.feed_filter.sort_by]
        : this.$t("Sort By");
      return finalLabel;
    },
    ChangeLabelSortColor() {
      const finalLabel = this.DataStore.sort_list[this.feed_filter.sort_by]
        ? true
        : false;
      return finalLabel;
    },
    getCountFilter() {
      let filter_count = 0;
      const filter = this.feed_filter;
      if (filter?.sort_by) {
        filter_count++;
      }
      if (filter?.sortby) {
        filter_count++;
      }
      if (filter?.cuisine?.length) {
        filter_count = filter_count + filter?.cuisine?.length;
      }
      if (filter?.transaction_type) {
        filter_count++;
      }
      if (filter?.price_range) {
        filter_count++;
      }
      if (filter?.offers_filters?.length) {
        filter_count = filter_count + filter?.offers_filters?.length;
      }
      if (filter?.quick_filters?.length) {
        filter_count = filter_count + filter?.quick_filters?.length;
      }
      return filter_count;
    },
    visibleCuisines() {
      if (Object.keys(this.cuisine_filtered_data).length > 0) {
        return this.cuisine_filtered_data;
      } else {
        return this.showMore
          ? this.DataStore.cuisine
          : this.DataStore.cuisine.slice(0, this.maxVisible);
      }
    },
    hasFilter() {
      if (this.filter_sortby) {
        return true;
      }
      if (this.filter_restaurant_options) {
        return true;
      }
      if (this.filter_cuisine.length > 0) {
        return true;
      }
      if (this.filter_order_type) {
        return true;
      }
      if (this.filter_price_range) {
        return true;
      }
      if (this.filter_promo.length > 0) {
        return true;
      }
      if (this.filter_quick.length > 0) {
        return true;
      }
      return false;
    },
  },
  mounted() {
    this.DataStore.searchAttributes(this.DataStorePersisted.useCurrency);
    if (this.saved_filter) {
      this.feed_filter = this.saved_filter ?? [];
      this.filter_sortby = this.saved_filter?.sort_by || "";
      this.filter_restaurant_options = this.saved_filter?.sortby || "";
      this.filter_cuisine = this.saved_filter?.cuisine || [];
      this.filter_order_type = this.saved_filter?.transaction_type || "";
      this.filter_price_range = this.saved_filter?.price_range || "";
      this.filter_promo = this.saved_filter?.offers_filters || [];
      this.filter_quick = this.saved_filter?.quick_filters || [];
    }
  },
  beforeUnmount() {
    this.$emit("filterUnmount", this.feed_filter);
  },
  watch: {
    search_cuisine(newdata, oldata) {
      if (!this.awaitingSearch) {
        if (
          typeof this.search_cuisine === "undefined" ||
          this.search_cuisine === null ||
          this.search_cuisine === "" ||
          this.search_cuisine === "null" ||
          this.search_cuisine === "undefined"
        ) {
          this.cuisine_filtered_data = [];
          return false;
        }
        setTimeout(() => {
          setTimeout(() => {
            console.log("search_cuisine", this.search_cuisine);
            this.cuisine_filtered_data = this.searchCuisine(
              this.DataStore.cuisine,
              this.search_cuisine
            );
            console.log("cuisine_filtered_data", this.cuisine_filtered_data);
            this.awaitingSearch = false;
          }, 2);
        }, 1000);
      }
      this.awaitingSearch = true;
    },
  },
  methods: {
    onBeforeShow() {
      if (this.search_mode == "location") {
        this.filter_list = [
          {
            value: "quick_filters",
            label: this.$t("Filters"),
          },
          {
            value: "promo",
            label: this.$t("Promo"),
          },
          {
            value: "cusine",
            label: this.$t("Cuisine"),
          },
          {
            value: "mode",
            label: this.$t("Mode"),
          },
          {
            value: "price",
            label: this.$t("Price"),
          },
        ];
      }
    },
    setFreeDelivery() {
      this.is_free_delivery = !this.is_free_delivery;

      this.filter_restaurant_options = this.is_free_delivery
        ? "sort_free_delivery"
        : "";
      this.applyFilters();
    },
    searchCuisine(items, searchTerm) {
      const regex = new RegExp(searchTerm.trim(), "i");
      return items.filter((cuisine) => regex.test(cuisine.cuisine_name));
    },
    toggleShowMore() {
      this.showMore = !this.showMore;
    },
    startObserver() {
      const observer = new IntersectionObserver(this.handleIntersect, {
        root: null,
        rootMargin: "0px",
        threshold: 0.5,
      });

      this.$nextTick(() => {
        this.$refs.categories.forEach((category) => observer.observe(category));
      });
    },
    handleIntersect(entries) {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (entry.isIntersecting) {
            this.filter_options = entry.target.id;
          }
        }
      }
    },
    scrollToElement(id) {
      const categoryElement = document.getElementById(`${id}`);
      if (categoryElement) {
        categoryElement.scrollIntoView({ behavior: "smooth" });
      }
    },
    resetFilter() {
      this.filter_sortby = "";
      this.filter_restaurant_options = "";
      this.filter_cuisine = [];
      this.filter_order_type = "";
      this.filter_price_range = "";
      this.filter_promo = [];
      this.filter_quick = [];
      this.cuisine_filtered_data = [];

      this.feed_filter = [];
      //this.DataStore.filter_home = null;
    },
    applyFilters() {
      this.modal_filters = false;
      this.modal_cuisine = false;
      this.modal_sortby = false;
      this.modal_promo = false;
      this.modal_quickfilters = false;

      //this.feed_filter.sort_by = this.filter_sortby;

      if (this.search_mode == "location") {
        this.feed_filter = {
          quick_filters: this.filter_quick,
          offers_filters: this.filter_promo,
          cuisine: this.filter_cuisine,
          price_range: this.filter_price_range,
          transaction_type: this.filter_order_type,
        };
      } else {
        this.feed_filter = {
          sort_by: this.filter_sortby,
          sortby: this.filter_restaurant_options,
          cuisine: this.filter_cuisine,
          transaction_type: this.filter_order_type,
          price_range: this.filter_price_range,
          offers_filters: this.filter_promo,
          quick_filters: this.filter_quick,
        };
      }
      this.$emit("afterApplyfilter", this.feed_filter);
    },
    isCusineSelected(id) {
      return this.filter_cuisine.includes(id);
    },
  },
};
</script>
<style scoped>
.filters-wrap {
  display: flex;
}

.filters-wrap--compact {
  width: 100%;
}

.tagam-filter-trigger {
  position: relative;
  min-height: 54px;
  padding: 0 18px;
  border-radius: 20px;
  background: rgba(255, 252, 247, 0.94);
  border: 1px solid rgba(113, 74, 24, 0.1);
  color: #21150e;
  box-shadow: 0 14px 30px rgba(87, 52, 18, 0.08);
}

.tagam-filter-trigger--compact {
  min-width: 54px;
  width: 54px;
  padding: 0;
  border-radius: 18px;
}

.tagam-filter-trigger--active {
  border-color: rgba(217, 107, 29, 0.22);
  box-shadow: 0 14px 32px rgba(169, 75, 8, 0.14);
}

.tagam-filter-trigger__inner {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 800;
}

.tagam-filter-trigger__badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.tagam-filter-dialog {
  background: linear-gradient(180deg, #fbf6ef 0%, #f6efe3 100%);
}

.tagam-filter-dialog--max {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.tagam-filter-dialog__top {
  background: rgba(255, 249, 240, 0.96);
  border-bottom: 1px solid rgba(113, 74, 24, 0.08);
  backdrop-filter: blur(14px);
}

.tagam-filter-dialog__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 16px 12px;
}

.tagam-filter-dialog__eyebrow {
  display: inline-flex;
  margin-bottom: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(217, 107, 29, 0.1);
  color: #a94b08;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tagam-filter-dialog__title {
  font-size: 24px;
  line-height: 1.05;
  font-weight: 900;
  color: #24180f;
}

.tagam-filter-dialog__subtitle {
  margin-top: 8px;
  max-width: 290px;
  font-size: 13px;
  line-height: 1.45;
  color: #745d49;
}

.tagam-filter-dialog__close {
  margin-top: 2px;
  color: #24180f;
  background: rgba(255, 252, 247, 0.82);
  border: 1px solid rgba(113, 74, 24, 0.1);
}

.tagam-filter-dialog__tabs {
  background: transparent;
  padding: 0 8px 10px;
}

.tagam-filter-dialog__section-shell {
  margin: 0 12px 12px;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(113, 74, 24, 0.08);
  background: rgba(255, 252, 247, 0.8);
  box-shadow: 0 10px 24px rgba(87, 52, 18, 0.05);
}

.tagam-filter-dialog__list {
  background: transparent;
}

.tagam-filter-dialog__section-title {
  background: rgba(239, 226, 204, 0.55);
  color: #20160f;
  font-size: 14px;
  font-weight: 800;
  padding: 12px 16px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tagam-filter-dialog__actions {
  background: rgba(255, 249, 240, 0.96);
  border-top: 1px solid rgba(113, 74, 24, 0.08);
  padding: 12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px);
  backdrop-filter: blur(14px);
}

.tagam-filter-dialog__secondary-btn {
  background: rgba(255, 252, 247, 0.9);
  border-color: rgba(113, 74, 24, 0.14) !important;
}

.tagam-filter-dialog__primary-btn {
  box-shadow: 0 12px 24px rgba(169, 75, 8, 0.18);
}

.tagam-filter-sheet {
  background: linear-gradient(180deg, #fbf6ef 0%, #f6efe3 100%);
  border-radius: 24px 24px 0 0;
  border: 1px solid rgba(113, 74, 24, 0.08);
  border-bottom: 0;
  box-shadow: 0 -18px 40px rgba(87, 52, 18, 0.12);
  overflow: hidden;
}

.tagam-filter-sheet__toolbar {
  min-height: 58px;
  padding-top: 8px;
  background: rgba(255, 249, 240, 0.9);
  border-bottom: 1px solid rgba(113, 74, 24, 0.08);
  backdrop-filter: blur(12px);
}

.tagam-filter-sheet__toolbar::before {
  content: "";
  position: absolute;
  top: 10px;
  left: 50%;
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: rgba(113, 74, 24, 0.18);
  transform: translateX(-50%);
}

.tagam-filter-sheet__search-wrap {
  padding-top: 10px;
  background: linear-gradient(180deg, rgba(255, 249, 240, 0.88) 0%, rgba(255, 249, 240, 0.12) 100%);
}

.tagam-filter-sheet__search :deep(.q-field__control) {
  background: rgba(255, 252, 247, 0.92) !important;
  border: 1px solid rgba(113, 74, 24, 0.1) !important;
  border-radius: 18px !important;
  box-shadow: 0 10px 24px rgba(87, 52, 18, 0.05);
}

.tagam-filter-sheet__list {
  background: transparent;
}

:deep(.tagam-filter-sheet .q-item),
:deep(.tagam-filter-dialog .q-item) {
  min-height: 54px;
  border-bottom-color: rgba(113, 74, 24, 0.08) !important;
  padding-left: 18px;
  padding-right: 18px;
}

:deep(.tagam-filter-dialog__tabs .q-tab) {
  min-height: 38px;
  padding: 0 14px;
  margin-right: 6px;
  border-radius: 999px;
  background: rgba(239, 226, 204, 0.72);
  color: #6f6254;
  font-weight: 800;
}

:deep(.tagam-filter-dialog__tabs .q-tab--active) {
  background: linear-gradient(135deg, #d96b1d 0%, #a94b08 100%);
  color: #fff7f0;
}

:deep(.tagam-filter-dialog__tabs .q-tab__indicator) {
  display: none;
}

:deep(.tagam-filter-sheet .q-item__label),
:deep(.tagam-filter-dialog .q-item__label) {
  color: #24180f;
  font-weight: 600;
}

:deep(.tagam-filter-sheet .q-checkbox__inner),
:deep(.tagam-filter-sheet .q-radio__inner),
:deep(.tagam-filter-dialog .q-checkbox__inner),
:deep(.tagam-filter-dialog .q-radio__inner) {
  color: #cf6f19;
}

:deep(.tagam-filter-sheet .q-card),
:deep(.tagam-filter-dialog .q-card) {
  box-shadow: none;
}

:deep(.tagam-filter-sheet .q-toolbar__title),
:deep(.tagam-filter-dialog .q-toolbar__title) {
  color: #24180f;
  font-size: 18px;
  font-weight: 800;
}

:deep(.tagam-filter-sheet .q-btn[flat]),
:deep(.tagam-filter-dialog .q-btn[flat]) {
  color: #24180f;
}
</style>
