<template>
  <q-dialog
    v-model="modal"
    persistent
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    backdrop-filter="blur(4px)"
  >
    <q-card class="radius10">
      <q-card-section class="flex justify-center">
        <OrderStatusAnimation :status="completed" style="height: 160px" />
        <div class="text-h6 text-weight-bold text-center">
          {{ message ? message : $t("Successful") }}
        </div>
        <q-btn
          @click="modal = false"
          color="grey"
          flat
          class="fit"
          size="large"
        >
          <div class="text-weight-medium text-subtitle2">
            {{ $t("Close") }}
          </div>
        </q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "AddFundsSuccessful",
  components: {
    OrderStatusAnimation: defineAsyncComponent(() =>
      import("components/OrderStatusAnimation.vue")
    ),
  },
  data() {
    return {
      modal: false,
      message: null,
      completed: "completed",
    };
  },
};
</script>
