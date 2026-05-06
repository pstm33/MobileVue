<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
        'border-bottom': !isScrolled,
        'shadow-bottom': isScrolled,
      }"
    >
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          flat
          round
          dense
          icon="eva-arrow-back-outline"
          :color="$q.dark.mode ? 'white' : 'dark'"
        />
        <q-toolbar-title class="text-subtitle2 text-weight-bold">{{
          $t("Points")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page>
      <q-scroll-observer @scroll="onScroll" />
      <q-space style="height: 8px" class="bg-mygrey1 q-mb-md"></q-space>
      <q-card flat class="q-pt-none">
        <q-card-section class="q-pt-none">
          <div
            class="bg-blue-6 radius10 q-pt-lg q-pb-sm relative-position"
            style="overflow: hidden"
          >
            <div class="bg-blue-2 circle-blue"></div>
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label
                    class="text-white"
                    caption
                    style="opacity: 0.5"
                    >{{ $t("Available Points") }}</q-item-label
                  >
                  <q-item-label
                    class="text-white text-weight-bold text-subtitle1"
                  >
                    <template v-if="loading_balance">
                      <q-spinner-ios size="xs"
                    /></template>
                    <template v-else>
                      {{ ClientStore.points_balance }}
                    </template>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <q-space class="q-pa-sm"></q-space>

          <q-tabs
            v-model="tab"
            dense
            narrow-indicator
            no-caps
            active-color="'blue-grey-6"
            active-bg-color="orange-1"
            indicator-color="transparent"
            active-class="text-blue-grey-6"
            class="custom-tabs"
            :mobile-arrows="$q.capacitor ? false : true"
            @update:model-value="tabChange"
          >
            <template v-for="items in tabs" :key="items">
              <q-tab
                :name="items.name"
                :label="items.label"
                class="radius28 bg-mygrey1"
              />
            </template>
          </q-tabs>

          <q-tab-panels
            v-model="tab"
            animated
            transition-prev="slide-down"
            transition-next="slide-up"
            style="min-height: calc(60vh)"
          >
            <template v-for="items in tabs" :key="items">
              <q-tab-panel
                :name="items.name"
                class="q-pl-none q-pr-none"
                style="min-height: calc(60vh)"
              >
                <q-infinite-scroll
                  ref="nscroll"
                  @load="fetchData"
                  :offset="100"
                >
                  <template v-slot:default>
                    <template v-if="!hasData && !loading">
                      <div class="absolute-center">
                        <div class="text-subtitle2 text-grey">
                          {{ $t("No data available") }}
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <q-list separator>
                        <template v-for="items in data" :key="items">
                          <q-item>
                            <q-item-section>
                              <q-item-label>{{
                                items?.transaction_description ||
                                items.restaurant_name
                              }}</q-item-label>
                              <q-item-label caption>
                                {{ items.transaction_date }}
                              </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <div
                                class="text-bold"
                                :class="{
                                  'text-green':
                                    items.transaction_type == 'credit',
                                  'text-red': items.transaction_type == 'debit',
                                }"
                              >
                                {{
                                  items?.transaction_amount ||
                                  items.total_earning
                                }}
                              </div>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-list>
                    </template>
                  </template>

                  <template v-slot:loading>
                    <div
                      class="row q-gutter-x-sm justify-center q-my-md"
                      :class="{
                        'absolute-center text-center full-width': page == 1,
                        'absolute-bottom text-center full-width': page != 1,
                      }"
                    >
                      <q-spinner-ios size="sm" />
                      <div class="text-subtitle1 text-grey">
                        {{ $t("Loading") }}...
                      </div>
                    </div>
                  </template>
                </q-infinite-scroll>
              </q-tab-panel>
            </template>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useClientStore } from "stores/ClientStore";

export default {
  name: "PointsPage",
  data() {
    return {
      tab: "transaction",
      loading: false,
      loading_balance: true,
      data: [],
      page: 0,
      is_refresh: undefined,
      isScrolled: false,
      tabs: [
        {
          name: "transaction",
          label: this.$t("Transactions"),
          method: "getPointsTransaction",
        },
        {
          name: "points_merchant",
          label: this.$t("Points by merchant"),
          method: "getPointsTransactionMerchant",
        },
      ],
    };
  },
  setup() {
    const ClientStore = useClientStore();
    return { ClientStore };
  },
  mounted() {
    this.getBalance();
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    tabChange(data) {
      this.page = 0;
      this.data = [];
    },
    refresh(done) {
      done();
      this.resetPage();
    },
    resetPage() {
      this.page = 0;
      this.data = [];
      this.$refs.nscroll[0].reset();
      this.$refs.nscroll[0].resume();
      this.$refs.nscroll[0].trigger();
      this.ClientStore.points_balance = null;
      this.getBalance();
    },
    async getBalance() {
      try {
        this.loading_balance = true;
        await this.ClientStore.fecthPointsBalance();
      } catch (error) {
      } finally {
        this.loading_balance = false;
      }
    },
    async fetchData(index, done) {
      if (this.loading) {
        done();
        return;
      }
      this.loading = true;
      this.page = index;
      const methods =
        this.tab == "transaction"
          ? "getPointsTransaction"
          : "getPointsTransactionMerchant";

      try {
        const results = await APIinterface.fetchDataByTokenPost(
          methods,
          "page=" + index
        );
        console.log("results", results);
        if (results.code == 1) {
          this.data = [...this.data, ...results.details.data];
        } else {
          if (this.$refs.nscroll) {
            this.$refs.nscroll?.[0]?.stop();
          }
        }
      } catch (error) {
        this.loading = false;
        if (this.$refs.nscroll) {
          this.$refs.nscroll?.[0]?.stop();
        }
      } finally {
        this.loading = false;
        done();
      }
    },
  },
};
</script>

<style scoped>
.custom-tabs .q-tab {
  margin-right: 16px; /* Add spacing between tabs */
}

.custom-tabs .q-tab:last-child {
  margin-right: 0; /* Remove margin for the last tab */
}
.q-tabs__content--align-justify .q-tab {
  flex: initial !important;
}
.circle-blue {
  border-radius: 50%;
  height: 50px;
  width: 50px;
  position: absolute;
  top: -10px;
  right: -20px;
}
</style>
