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
      class="q-pa-smx tagam-surface none-field-hightlight"
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
          :placeholder="search_label"
          dense
          outlined
          color="primary"
          bg-color="grey-1"
          class="full-width input-borderless"
          rounded
          clearable
          debounce="500"
          @clear="onClear"
          :loading="awaitingSearch"
          @update:model-value="onSearchInput"
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
        <div class="text-h6 line-normal text-weight-bold tagam-text-main">
          {{ $t("noResults") }}
        </div>
        <div class="text-caption tagam-text-muted">
          {{ $t("noResultsDesc") }}
        </div>
      </div>
      <template v-if="hasData && isMaximize">
        <MenuList
          ref="ref_menulist"
          :data="data"
          :category="category"
          :merchant_id="merchant_id"
          :promoEligibility="{}"
          @on-clickitems="onClickitems"
          @show-options="showOptions"
          @show-allergens="showAllergens"
        ></MenuList>
      </template>
    </div>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { defineAsyncComponent } from "vue";
import auth from "src/api/auth";

export default {
  name: "SearchCategoryItems",
  props: ["merchant_id", "cat_id", "search_label"],
  components: {
    MenuList: defineAsyncComponent(() => import("src/components/MenuList.vue")),
  },
  data() {
    return {
      modal: false,
      q: "",
      data: [],
      category: [],
      slug: "",
      loading: false,
      awaitingSearch: false,
      money_config: [],
      maximized_toogle: false,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
  },
  computed: {
    hasData() {
      return Object.keys(this.data).length ? true : false;
    },
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
    onClickitems(value) {
      //console.log("onClickitems SearchCategoryItems", value);
      this.$emit("onClickitems", value);
    },
    onClear() {
      this.category = [];
      this.data = [];
    },
    onBeforeHide() {
      this.q = "";
      this.category = [];
      this.data = [];
    },
    onShow() {
      this.$refs.ref_search.focus();
    },
    onSearchInput() {
      if (!this.q) {
        return;
      }
      if (this.q.trim().length >= 2) {
        this.fetchSearchResults();
      }
    },
    async fetchSearchResults() {
      try {
        this.awaitingSearch = true;
        this.onClear();
        let params = {
          q: this.q,
          merchant_id: this.merchant_id,
          cat_id: this.cat_id,
          currency_code: this.DataStorePersisted.useCurrency,
        };
        const islogin = auth.authenticated();
        if (islogin) {
          const auth_user = auth.getUser();
          params.client_uuid = auth_user.client_uuid;
        }
        const response = await APIinterface.fetchGetRequest(
          "searchCategoryItems",
          new URLSearchParams(params).toString()
        );
        console.log("response", response);
        this.data = response.details.data;
        this.category = {
          cat_id: response.details?.cat_id,
          available: response.details?.available,
        };
      } catch (error) {
        console.log("error", error);
        this.data = [];
      } finally {
        this.awaitingSearch = false;
      }
    },
  },
};
</script>





