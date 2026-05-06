<template>
  <q-dialog
    v-model="modal"
    :position="isMaximize ? 'standard' : 'top'"
    transition-show="fade"
    @show="onShow"
    :maximized="isMaximize"
    transition-hide="fade"
    @before-hide="onBeforeHide"
  >
    <div
      class="q-pa-smx bg-white none-field-hightlight"
      style="border-radius: inherit"
    >
      <q-toolbar>
        <q-btn
          @click="modal = false"
          dense
          icon="eva-arrow-back-outline"
          size="md"
          unelevated
          flat
        />

        <q-input
          v-model="q"
          ref="ref_search"
          :placeholder="$t('Search menu')"
          dense
          outlined
          color="primary"
          bg-color="grey-1"
          class="full-width input-borderless"
          :loading="awaitingSearch"
          rounded
          clearable
          @clear="onShow"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-toolbar>

      <div
        v-if="isNoresults"
        class="text-center q-pa-md absolute-center full-width"
      >
        <div class="text-h6 line-normal text-weight-bold text-dark">
          {{ $t("noResults") }}
        </div>
        <div class="text-caption text-grey">
          {{ $t("noResultsDesc") }}
        </div>
      </div>

      <q-list v-if="isMaximize" separator class="q-pl-md q-pr-md">
        <template v-for="item in data" :key="item">
          <q-item
            clickable
            v-ripple
            @click="isItemAvailable(item.item_id) ? onClickitem(item) : null"
          >
            <q-item-section avatar>
              <q-responsive style="width: 110px; height: 90px">
                <q-img
                  :src="item.url_image"
                  placeholder-src="placeholder.png"
                  lazy
                  fit="cover"
                  class="radius8"
                  spinner-color="secondary"
                  spinner-size="sm"
                />
              </q-responsive>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-subtitle1">{{
                item.item_name
              }}</q-item-label>

              <q-item-label>
                <span
                  class="text-caption line-normal text-grey"
                  v-html="item.item_description"
                ></span>
                <div class="flex justify-between">
                  <div>
                    <div
                      class="text-overline text-weight-bold letter-spacing-none"
                    >
                      {{ item.lowest_price }}
                    </div>
                    <template v-if="!isItemAvailable(item.item_id)">
                      <q-badge color="disabled" text-color="disabled">
                        {{ $t("Not available") }}
                      </q-badge>
                    </template>
                  </div>
                  <div>
                    <q-btn
                      round
                      :color="
                        !isItemAvailable(item.item_id) ? 'grey-5' : 'primary'
                      "
                      icon="add"
                      unelevated
                      size="sm"
                      :disable="!isItemAvailable(item.item_id)"
                    />
                  </div>
                </div>
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </div>
  </q-dialog>
</template>

<script>
export default {
  name: "SearchMenu",
  props: ["items", "category", "items_not_available", "category_not_available"],
  data() {
    return {
      modal: false,
      q: "",
      data: [],
      slug: "",
      loading: false,
      awaitingSearch: false,
      money_config: [],
      maximized_toogle: false,
    };
  },
  watch: {
    q(newdata, oldata) {
      if (!this.awaitingSearch) {
        if (
          typeof this.q === "undefined" ||
          this.q === null ||
          this.q === "" ||
          this.q === "null" ||
          this.q === "undefined"
        ) {
          this.data = [];
          return false;
        }
        setTimeout(() => {
          setTimeout(() => {
            this.data = this.searchItems(this.items, this.q);
            this.awaitingSearch = false;
          }, 2);
        }, 1000);
      }
      this.awaitingSearch = true;
    },
  },
  computed: {
    isMaximize() {
      if (this.q) {
        return true;
      }
      return false;
    },
    isNoresults() {
      if (this.q && !this.awaitingSearch) {
        if (Object.keys(this.data).length > 0) {
        } else {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    onBeforeHide() {
      this.q = "";
      this.data = [];
    },
    onShow() {
      this.$refs.ref_search.focus();
    },
    searchItems(items, searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      return Object.values(items).filter((item) =>
        regex.test(item.item_name.trim())
      );
    },
    onClickitem(data) {
      const cat = this.findItem(String(data.item_id));
      const cat_id = cat[0] ? cat[0].cat_id : null;
      this.$emit("showItemdetails", cat_id, data.item_uuid);
    },
    findItem(searchValue) {
      return this.category.filter((category) =>
        category.items.includes(searchValue)
      );
    },
    isItemAvailable(item_id) {
      if (Object.keys(this.items_not_available).length > 0) {
        if (this.items_not_available.includes(parseInt(item_id))) {
          return false;
        }
      }

      const cat = this.findItem(String(item_id));
      const cat_id = cat[0] ? cat[0].cat_id : null;

      if (Object.keys(this.category_not_available).length > 0) {
        if (this.category_not_available.includes(parseInt(cat_id))) {
          return false;
        }
      }

      return true;
    },
  },
};
</script>
