<template>
  <q-dialog
    v-model="modal"
    transition-show="fadein"
    transition-hide="fadeout"
    transition-duration="500"
    @before-show="beforeShow"
    backdrop-filter="brightness(20%)"
    persistent
  >
    <q-card>
      <q-card-section class="q-pa-lg flex flex-center">
        <div>
          <div class="text-weight-bold text-subtitle1">
            {{ title }}
          </div>
          <div class="text-cption text-grey">
            {{ subtitle }}
          </div>
          <div class="text-center q-mt-sm">
            <q-circular-progress
              indeterminate
              size="lg"
              :thickness="0.22"
              rounded
              color="orange-1"
              track-color="orange"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: "ModalLoader",
  props: ["title", "subtitle"],
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
