<template>
  <template v-if="order_type == 'delivery'">
    <ul class="tagam-track-progress">
      <li
        class="step-order"
        :class="{
          active: order_progress >= '1',
          progressing: order_progress == '1',
          order_failed: order_progress == '0',
        }"
      >
        <div class="progress-value"></div>
      </li>
      <li
        class="step-merchant"
        :class="{
          active: order_progress >= '2',
          progressing: order_progress == '2',
          order_failed: order_progress == '0',
        }"
      >
        <div class="progress-value"></div>
      </li>
      <li
        class="step-car"
        :class="{
          active: order_progress >= '3',
          progressing: order_progress == '3',
          order_failed: order_progress == '0',
        }"
      >
        <div class="progress-value"></div>
      </li>
      <li
        class="step-home"
        :class="{
          active: order_progress >= '4',
          order_failed: order_progress == '0',
        }"
      ></li>
    </ul>
  </template>
  <template v-else>
    <ul class="tagam-track-progress tagam-track-progress--three">
      <li
        class="step-order"
        :class="{
          active: order_progress >= '1',
          progressing: order_progress == '1',
          order_failed: order_progress == '0',
        }"
      >
        <div class="progress-value"></div>
      </li>
      <li
        class="step-merchant"
        :class="{
          active: order_progress >= '2',
          progressing: order_progress == '2',
          order_failed: order_progress == '0',
        }"
      >
        <div class="progress-value"></div>
      </li>
      <li
        class="step-home"
        :class="{
          active: order_progress >= '3',
          order_failed: order_progress == '0',
        }"
      ></li>
    </ul>
  </template>
  <div style="clear: both"></div>
</template>

<script>
export default {
  name: "TrackingProgress",
  props: ["order_progress", "order_type"],
  setup() {
    return {};
  },
};
</script>



