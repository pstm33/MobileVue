<template>
  <q-dialog
    v-model="dialog"
    transition-show="fade"
    transition-hide="fadeOut"
    transition-duration="500"
    full-width
    persistent
  >
    <q-card>
      <q-toolbar class="text-dark">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Payment Method") }}
          </div>
        </q-toolbar-title>
        <q-btn
          flat
          dense
          icon="close"
          v-close-popup
          :color="$q.dark.mode ? 'primary' : 'grey'"
        />
      </q-toolbar>
      <q-card-section class="scroll relative-position q-pt-none">
        <div class="flex flex-center q-mb-sm">
          <OrderStatusAnimation status="completed" style="height: 140px" />
          <div
            class="text-weight-bold text-subtitle1 text-center line-normal q-pl-md q-pr-md"
          >
            {{ $t("Your wallet has been successfully loaded") }}
          </div>
        </div>

        <div class="myshadow-1">
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>{{ $t("Amount Loaded") }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label
                  caption
                  class="text-blue-grey-6 text-weight-bold"
                  >{{ data?.amount || "" }}</q-item-label
                >
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>{{ $t("Payment Method") }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label
                  caption
                  class="text-blue-grey-6 text-weight-bold"
                  >{{ data?.payment_name || "" }}</q-item-label
                >
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>{{ $t("Transaction ID") }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label
                  caption
                  class="text-blue-grey-6 text-weight-bold"
                  >{{ data?.transaction_id || "" }}</q-item-label
                >
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>{{ $t("Date and Time") }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label
                  caption
                  class="text-blue-grey-6 text-weight-bold"
                  >{{ data?.transaction_date || "" }}</q-item-label
                >
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "WalletTopupreceipt",
  components: {
    OrderStatusAnimation: defineAsyncComponent(() =>
      import("components/OrderStatusAnimation.vue")
    ),
  },
  props: ["data"],
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    beforeHide() {
      this.$emit("afterReceiptclose");
    },
  },
};
</script>
