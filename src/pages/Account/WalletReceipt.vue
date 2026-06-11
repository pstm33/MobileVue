<template>
  <q-header
    reveal
    reveal-offset="20"
    :class="{ 'tagam-surface-elevated text-white': $q.dark.mode, 'tagam-surface tagam-text-main': !$q.dark.mode, }"
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
        $t("Receipt")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page padding class="tagam-account-wallet-receipt-page">
    <q-card flat class="tagam-wallet-receipt-card">
      <template v-if="loading">
        <q-card-section class="q-gutter-y-sm">
          <q-skeleton type="text" v-for="items in 2" :key="items" />
          <q-skeleton type="rect" v-for="items in 3" :key="items" />
          <q-skeleton type="text" v-for="items in 2" :key="items" />
          <q-skeleton type="rect" v-for="items in 3" :key="items" />
          <q-skeleton type="text" v-for="items in 2" :key="items" />
          <q-skeleton type="QBtn" class="full-width" />
        </q-card-section>
      </template>

      <template v-if="getData">
        <q-card-section>
          <div class="text-center tagam-wallet-receipt-hero">
            <div class="tagam-wallet-receipt-icon">
              <q-icon name="check" />
            </div>
            <div class="tagam-title-lg">{{ $t("Congratulations") }}!</div>
            <div class="tagam-body-muted">
              {{ $t("Your digital wallet has been successfully loaded") }}.
            </div>
          </div>
        </q-card-section>

        <q-list class="tagam-wallet-receipt-list">
          <q-item-label header class="tagam-text-main text text-weight-bold"
            >{{ $t("Transaction Details") }}!</q-item-label
          >
          <q-item class="tagam-wallet-receipt-row">
            <q-item-section>
              <q-item-label>{{ $t("Amount Loaded") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ data.amount }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="tagam-wallet-receipt-row">
            <q-item-section>
              <q-item-label>{{ $t("Payment Method") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ displayPaymentName(data.payment_name) }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="tagam-wallet-receipt-row">
            <q-item-section>
              <q-item-label>{{ $t("Transaction ID") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ data.transaction_id }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="tagam-wallet-receipt-row">
            <q-item-section>
              <q-item-label>{{ $t("Date and Time") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ data.transaction_date }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-card-actions class="q-pt-lg">
          <q-btn
            unelevated
            rounded
            color="primary"
            text-color="white"
            size="lg"
            no-caps
            @click="closeReceipt"
            class="full-width"
          >
            <div class="text-subtitle1 text-weight-bold q-gutter-x-sm">
              {{ $t("Close") }}
            </div>
          </q-btn>
        </q-card-actions>
      </template>
    </q-card>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { normalizeBackendLabel } from "src/utils/textEncoding";

export default {
  name: "WalletReceipt",
  data() {
    return {
      data: null,
      loading: false,
      transaction_id: null,
    };
  },
  mounted() {
    this.transaction_id = this.$route.query.transaction_id;
    this.getTransactions();
  },
  computed: {
    getData() {
      if (this.data) {
        return this.data;
      }
      return false;
    },
  },
  methods: {
    displayPaymentName(value) {
      if (!value) return "";
      const label = normalizeBackendLabel(value);
      const translated = this.$t(label);
      return translated === label ? label : translated;
    },
    closeReceipt() {
      this.$router.replace("/account/wallet");
    },
    getTransactions() {
      this.loading = true;
      APIinterface.fetchGet("interface/fetchWallettransactions", {
        transaction_id: this.transaction_id,
      })
        .then((data) => {
          this.data = data.details;
        })
        .catch((error) => {
          const label = normalizeBackendLabel(error);
          APIinterface.notify("dark", this.$t(label), "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped>
.tagam-account-wallet-receipt-page {
  background: var(--tagam-page-gradient);
}

.tagam-wallet-receipt-card {
  background: var(--tagam-surface);
  border: 1px solid var(--tagam-border-soft);
  border-radius: 28px;
  box-shadow: var(--tagam-shadow-soft);
  overflow: hidden;
}

.tagam-wallet-receipt-hero {
  padding: 16px 10px 8px;
}

.tagam-wallet-receipt-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 14px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  color: white;
  background: linear-gradient(135deg, var(--tagam-primary), var(--tagam-accent));
  box-shadow: 0 18px 36px rgba(255, 88, 48, 0.28);
  font-size: 28px;
}

.tagam-wallet-receipt-list {
  margin: 0 16px 16px;
  padding: 10px 14px;
  background: var(--tagam-surface-muted);
  border: 1px solid var(--tagam-border-soft);
  border-radius: 22px;
}

.tagam-wallet-receipt-row {
  padding-left: 0;
  padding-right: 0;
}
</style>






