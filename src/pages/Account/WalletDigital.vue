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
          $t("Wallet")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page>
      <q-scroll-observer @scroll="onScroll" />
      <q-space style="height: 8px" class="bg-mygrey1 q-mb-md"></q-space>
      <q-card flat class="q-pt-none">
        <q-card-section class="q-pt-none">
          <div
            class="bg-myblue radius10 q-pt-lg q-pb-sm relative-position"
            style="overflow: hidden"
          >
            <div class="bg-blue circle-blue"></div>
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label
                    class="text-white"
                    caption
                    style="opacity: 0.5"
                    >{{ $t("Available Balance") }}</q-item-label
                  >
                  <q-item-label
                    class="text-white text-weight-bold text-subtitle1"
                  >
                    <template v-if="loading_balance">
                      <q-spinner-ios size="xs"
                    /></template>
                    <template v-else>
                      {{ ClientStore.wallet_balance }}
                    </template>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    no-caps
                    unelevated
                    :label="$t('Add funds')"
                    color="white"
                    text-color="myblue"
                    @click="this.$refs.ref_addfunds.modal = true"
                  ></q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="q-mb-sm q-mt-sm">
            <WalletBunos ref="bunos"></WalletBunos>
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
                  @load="getWalletTransaction"
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
                                items.transaction_description
                              }}</q-item-label>
                              <q-item-label caption>{{
                                items.transaction_date
                              }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <div
                                class="text-weight-bold text-subtitle2"
                                :class="{
                                  'text-green':
                                    items.transaction_type == 'credit',
                                  'text-red': items.transaction_type == 'debit',
                                }"
                              >
                                {{ items.transaction_amount }}
                              </div>
                            </q-item-section>
                          </q-item>
                          <!-- <q-separator spaced inset /> -->
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

      <AddFunds
        ref="ref_addfunds"
        @after-preparepayment="afterPreparepayment"
        :currency_symbol="getUseCurrency"
        :currency_code="DataStorePersisted.getUseCurrency()"
        slug="account/wallet"
      ></AddFunds>

      <!-- PAYMENT COMPONENTS -->
      <StripeComponents
        ref="stripe"
        payment_code="stripe"
        :title="$t('Stripe')"
        @after-payment="afterPayment"
      />

      <WalletTopupreceipt ref="receipt" :data="receipt_data" />
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { usePaymentStore } from "stores/PaymentStore";
import { useDataStore } from "stores/DataStore";
import { useClientStore } from "stores/ClientStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { Browser } from "@capacitor/browser";

export default {
  name: "WalletDigital",
  components: {
    WalletBunos: defineAsyncComponent(() =>
      import("components/WalletBunos.vue")
    ),
    AddFunds: defineAsyncComponent(() => import("components/AddFunds.vue")),
    StripeComponents: defineAsyncComponent(() =>
      import("components/StripeComponents.vue")
    ),
    WalletTopupreceipt: defineAsyncComponent(() =>
      import("components/WalletTopupreceipt.vue")
    ),
  },
  setup() {
    const PaymentStore = usePaymentStore();
    const DataStore = useDataStore();
    const ClientStore = useClientStore();
    const DataStorePersisted = useDataStorePersisted();
    return { PaymentStore, DataStore, ClientStore, DataStorePersisted };
  },
  data() {
    return {
      isScrolled: false,
      loading_balance: false,
      balance: 0,
      credentials: [],
      receipt_data: [],
      data: [],
      page: 0,
      tab: "all",
      tabs: [
        {
          name: "all",
          label: this.$t("All"),
        },
        {
          name: "order",
          label: this.$t("Orders"),
        },
        {
          name: "refund",
          label: this.$t("Refunds"),
        },
        {
          name: "topup",
          label: this.$t("Top-ups"),
        },
        {
          name: "cashback",
          label: this.$t("Cashbacks"),
        },
        {
          name: "adjustment",
          label: this.$t("Adjustment"),
        },
      ],
    };
  },
  mounted() {
    this.getWalletBalance();
    const error = this.$route.query?.error || null;
    const message = this.$route.query?.message || null;
    if (error) {
      APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
    }
    if (message) {
      APIinterface.ShowSuccessful(message, this.$q);
    }
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    getUseCurrency() {
      return this.DataStore.money_config?.suffix || "";
    },
  },
  methods: {
    async getWalletBalance() {
      try {
        this.loading_balance = true;
        await this.ClientStore.getWalletBalance();
      } catch (error) {
      } finally {
        this.loading_balance = false;
      }
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    refresh(done) {
      done();
      this.resetPage();
      //this.$refs.bunos.getDiscount();
    },
    resetPage() {
      this.resetPagination();
    },
    resetPagination() {
      this.page = 0;
      this.data = [];
      this.$refs.nscroll[0].reset();
      this.$refs.nscroll[0].resume();
      this.$refs.nscroll[0].trigger();
      this.ClientStore.wallet_balance = null;
      this.getWalletBalance();
    },
    tabChange(value) {
      this.page = 0;
      this.data = [];
    },
    getWalletTransaction(index, done) {
      if (this.loading) {
        done();
        return;
      }
      this.loading = true;
      this.page = index;
      APIinterface.fetchDataByTokenPost(
        "getWalletTransaction",
        "page=" + index + "&transaction_type=" + this.tab
      )
        .then((data) => {
          if (data.code == 1) {
            this.data = [...this.data, ...data.details.data];
          } else if (data.code == 3) {
            this.data = [...this.data, ...data.details.data];
            this.$refs.nscroll?.[0]?.stop();
          } else {
            this.$refs.nscroll?.[0]?.stop();
          }
        })
        .catch((error) => {
          this.loading = false;
          this.$refs.nscroll?.[0]?.stop();
        })
        .then((data) => {
          this.loading = false;
          done();
        });
    },
    afterPreparepayment(data) {
      try {
        this.$refs[data.payment_code].Dopayment(data);
      } catch (error) {
        this.PaymentRender(data);
      }
    },
    async PaymentRender(data) {
      let redirect = data?.payment_url || null;
      if (this.$q.capacitor) {
        await Browser.open({ url: redirect });
      } else {
        location.href = redirect;
      }
    },
    afterPayment(data) {
      this.receipt_data = data;
      this.$refs.ref_addfunds.modal = false;
      this.$refs.receipt.dialog = true;
      this.tab = "all";
      this.resetPage();
      setTimeout(() => {
        this.ClientStore.wallet_balance = null;
        this.getWalletBalance();
      }, 500);
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
