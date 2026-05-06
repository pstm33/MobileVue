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
          size="sm"
          unelevated
          flat
          class="q-mr-sm"
        />

        <q-input
          v-model="q"
          ref="ref_search"
          :placeholder="$t('Order ID')"
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
          {{ $t("Sorry, we couldn't find any results") }}
        </div>
        <div class="text-caption text-grey">
          {{ $t("Please verify that you enter correct order number.") }}
        </div>
      </div>

      <q-list v-if="isMaximize" class="q-pl-md q-pr-md">
        <template v-for="items in data" :key="items">
          <q-item clickable v-ripple:purple @click="showDetails(items)">
            <q-item-section avatar top>
              <q-avatar>
                <q-responsive style="width: 50px; height: 50px">
                  <q-img
                    :src="items.merchant_logo"
                    lazy
                    fit="cover"
                    class="radius8"
                    spinner-color="amber"
                    spinner-size="sm"
                  />
                </q-responsive>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label v-if="items.show_status">
                <div
                  class="text-overline text-orange text-weight-bold line-normal text-capitalize"
                >
                  {{ items.status }}
                </div>
              </q-item-label>
              <q-item-label class="subtitle-2 text-weight-bold">{{
                items.restaurant_name
              }}</q-item-label>
              <q-item-label caption>
                #{{ items.order_id }} - {{ items.date_created }}
              </q-item-label>
            </q-item-section>
            <q-item-section side v-if="!items.show_status">
              <q-item-label>{{ items.total }}</q-item-label>
              <q-item-label caption>{{ items.earn_points }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="!items.is_order_ongoing">
            <q-item-section avatar></q-item-section>
            <q-item-section>
              <div class="flex q-gutter-x-md items-center">
                <!-- <q-btn
                  v-if="items.show_review"
                  :label="$t('Rate')"
                  text-color="blue-grey-6"
                  dense
                  padding="0px"
                  flat
                  no-caps
                >
                  <q-btn
                    dense
                    padding="0px"
                    no-caps
                    rounded
                    color="secondary"
                    text-color="white"
                    unelevated
                    icon="eva-arrow-forward-outline"
                    size="xs"
                    class="q-ml-sm"
                  >
                  </q-btn>
                </q-btn> -->

                <q-btn
                  :label="$t('Reorder')"
                  text-color="blue-grey-6"
                  dense
                  padding="0px"
                  flat
                  no-caps
                  @click="onReorder(items)"
                >
                  <q-btn
                    dense
                    padding="0px"
                    no-caps
                    rounded
                    color="secondary"
                    text-color="white"
                    unelevated
                    icon="eva-arrow-forward-outline"
                    size="xs"
                    class="q-ml-sm"
                  >
                  </q-btn>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </div>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "SearchMenu",
  data() {
    return {
      modal: false,
      q: "",
      data: null,
      slug: "",
      loading: false,
      awaitingSearch: false,
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
          APIinterface.fetchDataByTokenGet("SearchOrder", {
            q: this.q,
          })
            .then((data) => {
              this.data = data.details.data;
            })
            .catch((error) => {
              console.log("error =>", error);
              this.data = null;
            })
            .then((data) => {
              this.awaitingSearch = false;
            });
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
        if (!this.data) {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    onBeforeHide() {
      this.q = "";
      this.data = null;
    },
    onShow() {
      this.$refs.ref_search.focus();
    },
    searchItems(searchTerm) {
      console.log("searchItems", this.q);
    },
    onReorder(value) {
      this.modal = false;
      this.$emit("onReorder", value.order_uuid);
    },
    showDetails(value) {
      this.$emit("showDetails", value);
    },
  },
};
</script>
