<template>
  <div class="q-pt-sm q-gutter-x-sm filters-wrap">
    <swiper :loop="false" slidesPerView="auto" :space-between="10">
      <swiper-slide>
        <q-btn
          color="mygrey1"
          text-color="dark"
          icon="tune"
          rounded
          unelevated
          size="12px"
          no-caps
          padding="5px 15px"
          @click="modal_filters = true"
        >
          <q-badge color="primary" rounded v-if="getCountFilter > 0">
            {{ getCountFilter }}
          </q-badge>
        </q-btn>
      </swiper-slide>

      <swiper-slide v-if="search_mode == 'address'">
        <q-btn
          :color="ChangeLabelSortColor ? 'orange-1' : 'mygrey1'"
          :label="ChangeLabelSort"
          text-color="dark"
          icon="swap_vert"
          rounded
          unelevated
          size="12px"
          no-caps
          padding="5px 15px"
          @click="modal_sortby = true"
        />
      </swiper-slide>

      <swiper-slide v-if="search_mode == 'location'">
        <q-btn
          :label="ChangeLabelQuick"
          :color="ChangeLabelQuickColor ? 'orange-1' : 'mygrey1'"
          text-color="dark"
          rounded
          unelevated
          size="12px"
          no-caps
          padding="5px 15px"
          @click="modal_quickfilters = true"
        />
      </swiper-slide>

      <swiper-slide>
        <q-btn
          :label="ChangeLabelCuisine"
          :color="ChangeLabelCuisineColor ? 'orange-1' : 'mygrey1'"
          text-color="dark"
          rounded
          unelevated
          size="12px"
          no-caps
          padding="5px 15px"
          @click="modal_cuisine = true"
        />
      </swiper-slide>

      <swiper-slide>
        <q-btn
          :label="ChangeLabelPromo"
          :color="ChangeLabelPromoColor ? 'orange-1' : 'mygrey1'"
          text-color="dark"
          rounded
          unelevated
          size="12px"
          no-caps
          padding="5px 15px"
          @click="modal_promo = true"
        />
      </swiper-slide>

      <swiper-slide v-if="search_mode == 'address'">
        <q-btn
          :label="$t('Free delivery!')"
          :color="ChangeLabelFreeDelivery ? 'orange-1' : 'mygrey1'"
          text-color="dark"
          rounded
          unelevated
          size="12px"
          no-caps
          padding="5px 15px"
          @click="setFreeDelivery"
        />
      </swiper-slide>
    </swiper>
  </div>

  <!-- FILTER MODAL -->
  <q-dialog
    v-model="modal_filters"
    maximized
    transition-show="fade"
    @show="startObserver"
    @before-show="onBeforeShow"
  >
    <q-card>
      <!-- <q-header class="tagam-surface tagam-text-main"> -->
      <div class="fixed-top tagam-surface tagam-text-main z-top">
        <div><q-btn icon="close" flat round dense v-close-popup></q-btn></div>
        <q-tabs
          v-model="filter_options"
          dense
          class="tagam-text-main border-bottom"
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
      <!-- </q-header> -->

      <q-space style="height: 70px"></q-space>
      <!-- search_mode=>{{ search_mode }} -->
      <!-- <pre>{{ filter_list }}</pre> -->

      <template v-for="items in filter_list" :key="items">
        <div ref="categories" :id="items.value">
          <q-list separator>
            <q-item-label
              header
              class="tagam-surface-muted text-subtitle2 text-weight-bold"
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
                    {{ getPriceRangeLabel(items) }}
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
                v-for="(items, index) in DataStore.price_range_data"
                :key="items"
              >
                <q-item tag="label" v-ripple clickable>
                  <q-item-section>
                    {{ getPriceRangeLabel(items, index) }}
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

      <q-card-actions
        class="fixed-bottom tagam-surface row q-gutter-x-md"
        align="center"
      >
        <q-intersection v-if="hasFilter" transition="slide-right" class="col-3">
          <q-btn
            color="white"
            text-color="dark"
            unelevated
            size="lg"
            no-caps
            outline
            rounded
            class="fit"
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
          class="col"
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
    <q-card class="relative-position">
      <q-toolbar class="text-primary top-toolbar q-pl-md" dense>
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

      <div class="q-pl-md q-pr-md q-pb-md">
        <q-input
          v-model="search_cuisine"
          :placeholder="$t('Search for cuisines')"
          dense
          outlined
          color="primary"
          bg-color="grey-1"
          class="full-width input-borderless"
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
        <q-list separator>
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
      <q-card-actions
        class="fixed-bottom tagam-surface row q-gutter-x-md"
        align="center"
      >
        <q-intersection v-if="hasFilter" transition="slide-right" class="col-3">
          <q-btn
            color="white"
            text-color="dark"
            unelevated
            size="lg"
            no-caps
            outline
            class="fit"
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
          class="col"
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
    <q-card class="relative-position">
      <q-toolbar class="text-primary top-toolbar q-pl-md" dense>
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
        <q-list separator>
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
      <q-card-actions
        class="fixed-bottom tagam-surface row q-gutter-x-md"
        align="center"
      >
        <q-intersection v-if="hasFilter" transition="slide-right" class="col-3">
          <q-btn
            color="white"
            text-color="dark"
            unelevated
            size="lg"
            no-caps
            outline
            rounded
            class="fit"
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
          class="col"
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
    <q-card class="relative-position">
      <q-toolbar class="text-primary top-toolbar q-pl-md" dense>
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
        <q-list separator>
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
      <q-card-actions
        class="fixed-bottom tagam-surface row q-gutter-x-md"
        align="center"
      >
        <q-intersection v-if="hasFilter" transition="slide-right" class="col-3">
          <q-btn
            color="white"
            text-color="dark"
            unelevated
            size="lg"
            no-caps
            outline
            class="fit"
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
          class="col"
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
    <q-card class="relative-position">
      <q-toolbar class="text-primary top-toolbar q-pl-md" dense>
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
        <q-list separator>
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
      <q-card-actions
        class="fixed-bottom tagam-surface row q-gutter-x-md"
        align="center"
      >
        <q-intersection v-if="hasFilter" transition="slide-right" class="col-3">
          <q-btn
            color="white"
            text-color="dark"
            unelevated
            size="lg"
            no-caps
            outline
            class="fit"
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
          class="col"
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
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "FeedFilter",
  props: ["search_mode", "saved_filter"],
  emits: ["afterApplyfilter", "filterUnmount"],
  components: {
    Swiper,
    SwiperSlide,
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
    getPriceRangeLabel(items, index) {
      if (typeof items === "string" && items.trim()) {
        return items;
      }
      if (items?.label && String(items.label).trim()) {
        return items.label;
      }
      if (items?.name && String(items.name).trim()) {
        return items.name;
      }
      if (
        items?.value &&
        String(items.value).trim() &&
        Number.isNaN(Number(items.value))
      ) {
        return items.value;
      }
      const fallback = [
        this.$t("Budget"),
        this.$t("Medium price"),
        this.$t("Above average"),
        this.$t("Premium"),
      ];
      return fallback[index] || this.$t("Price");
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
.swiper-slide {
  width: auto;
}
</style>




