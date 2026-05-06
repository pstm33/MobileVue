<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="onBeforeShow"
    persistent
  >
    <q-card>
      <q-toolbar class="text-dark">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Selected Time Passed") }}
          </div>
        </q-toolbar-title>
      </q-toolbar>
      <q-card-section class="q-pt-none">
        <div class="text-caption">
          {{
            $t(
              "The selected time is no longer available. Please choose a new time."
            )
          }}
        </div>
      </q-card-section>
      <q-card-actions vertical>
        <q-btn
          no-caps
          unelevated
          color="primary"
          text-color="white"
          size="lg"
          rounded
          class="q-mb-sm"
          @click="$emit('selectAnothertime')"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Select another time") }}
          </div>
        </q-btn>
        <q-btn
          no-caps
          unelevated
          color="disabled"
          text-color="disabled"
          size="lg"
          rounded
          @click="$emit('clearCart')"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Clear item in cart") }}
          </div>
        </q-btn>
      </q-card-actions>
      <q-space class="q-pa-sm"></q-space>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: "TimePassedmodal",
  data() {
    return {
      modal: false,
    };
  },
  setup() {
    return {};
  },
};
</script>
