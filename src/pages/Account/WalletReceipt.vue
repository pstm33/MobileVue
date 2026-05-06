<template>
  <q-header
    reveal
    reveal-offset="20"
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
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
        $t("Receipt")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page padding>
    <q-card flat>
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
          <div class="text-center">
            <div class="text-h4">{{ $t("Congratulations") }}!</div>
            <div class="text-body2">
              {{ $t("Your digital wallet has been successfully loaded") }}.
            </div>
          </div>
        </q-card-section>

        <q-list separator>
          <q-item-label header class="text-dark text text-weight-bold"
            >{{ $t("Transaction Details") }}!</q-item-label
          >
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t("Amount Loaded") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ data.amount }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t("Payment Method") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ data.payment_name }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t("Transaction ID") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ data.transaction_id }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
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
            color="secondary"
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
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
