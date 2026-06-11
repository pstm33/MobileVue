<template>
  <div
    ref="lottieContainer"
    style="height: 85px"
    class="full-width"
    :style="style"
  ></div>
</template>

<script>
import lottie from "lottie-web";
import failed from "src/assets/failed.json";
import received from "src/assets/received.json";
import cooking from "src/assets/cooking.json";
import delivering from "src/assets/delivering.json";
import completed from "src/assets/completed.json";
import pickup from "src/assets/pickup.json";
import customize from "src/assets/customize.json";
import discover from "src/assets/discover.json";
import fasterdelivery from "src/assets/fasterdelivery.json";

export default {
  name: "OrderStatusAnimation",
  props: {
    status: {
      type: String,
      required: true,
    },
    style: null,
  },
  data() {
    return {
      lottieInstance: null,
    };
  },
  computed: {
    animationData() {
      const map = {
        failed,
        received,
        cooking,
        delivering,
        completed,
        pickup,
        customize,
        discover,
        fasterdelivery,
      };
      return map[this.status] || received;
    },
  },
  watch: {
    animationData: "loadAnimation",
  },
  mounted() {
    this.loadAnimation();
  },
  methods: {
    loadAnimation() {
      if (this.lottieInstance) {
        this.lottieInstance.destroy();
      }

      // Small delay ensures container is rendered
      setTimeout(() => {
        this.lottieInstance = lottie.loadAnimation({
          container: this.$refs.lottieContainer,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: this.animationData,
        });
      }, 200);
    },
  },
};
</script>



