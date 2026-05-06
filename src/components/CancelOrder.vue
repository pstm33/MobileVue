<template>
  <q-dialog
    v-model="show_modal"
    position="bottom"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="cancelOrderStatus"
    full-width
  >
    <q-card>
      <q-toolbar class="text-dark">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Cancel") }}
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
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium">
          <template v-if="cancel_response.refund_status === 'full_refund'">
            {{ $t("Are you sure?") }}
          </template>
          <template v-else>
            {{ $t("How would you like to proceed?") }}
          </template>
        </div>

        <div class="text-subtitle2 text-grey line-normal text-dark">
          {{ cancel_msg }}
        </div>

        <div class="q-mt-md q-mb-sm" v-if="cancel_response.refund_msg">
          <p class="text-caption text-grey">
            {{ cancel_response.refund_msg }}
          </p>
        </div>
      </q-card-section>

      <q-card-actions>
        <q-btn
          no-caps
          unelevated
          color="disabled"
          text-color="disabled"
          size="lg"
          rounded
          class="col"
          v-close-popup
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Don't Cancel") }}
          </div>
        </q-btn>
        <q-btn
          no-caps
          unelevated
          color="secondary"
          text-color="white"
          size="lg"
          rounded
          :disable="!cancel_status"
          :loading="loading"
          @click="applyCancelOrder"
          class="col"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Cancel order") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "CancelOrder",
  data() {
    return {
      loading: false,
      show_modal: false,
      order_uuid: "",
      cancel_status: false,
      cancel_msg: "",
      cancel_response: [],
    };
  },
  methods: {
    showModal(orderUuid) {
      this.order_uuid = orderUuid;
      this.show_modal = true;
    },
    cancelOrderStatus() {
      this.loading = true;
      APIinterface.cancelOrderStatus(this.order_uuid)
        .then((data) => {
          this.cancel_status = data.details.cancel_status;
          this.cancel_msg = data.details.cancel_msg;
          this.cancel_response = data.details;
        })
        .catch((error) => {
          APIinterface.notify("grey-8", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    applyCancelOrder() {
      this.loading = true;
      APIinterface.applyCancelOrder(this.order_uuid)
        .then((data) => {
          this.show_modal = false;
          APIinterface.ShowAlert(data.msg, this.$q.capacitor, this.$q);
          this.$emit("afterCancelorder");
        })
        .catch((error) => {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
