<template>
  <div
    ref="lottieContainer"
    style="height: 85px"
    class="full-width"
    :style="style"
  ></div>
</template>

<script>
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
      lottieLib: null,
      loadedAnimationData: null,
    };
  },
  watch: {
    status: "loadAnimation",
  },
  mounted() {
    this.loadAnimation();
  },
  beforeUnmount() {
    if (this.lottieInstance) {
      this.lottieInstance.destroy();
      this.lottieInstance = null;
    }
  },
  methods: {
    async resolveAnimationData() {
      const animationLoaders = {
        failed: () => import("src/assets/failed.json"),
        received: () => import("src/assets/received.json"),
        cooking: () => import("src/assets/cooking.json"),
        delivering: () => import("src/assets/delivering.json"),
        completed: () => import("src/assets/completed.json"),
        pickup: () => import("src/assets/pickup.json"),
        customize: () => import("src/assets/customize.json"),
        discover: () => import("src/assets/discover.json"),
        fasterdelivery: () => import("src/assets/fasterdelivery.json"),
      };

      const loadAnimationModule =
        animationLoaders[this.status] || animationLoaders.received;
      const module = await loadAnimationModule();
      return module.default || module;
    },
    async loadAnimation() {
      if (this.lottieInstance) {
        this.lottieInstance.destroy();
        this.lottieInstance = null;
      }

      const [{ default: lottie }, animationData] = await Promise.all([
        import("lottie-web"),
        this.resolveAnimationData(),
      ]);

      this.lottieLib = lottie;
      this.loadedAnimationData = animationData;

      setTimeout(() => {
        if (!this.$refs.lottieContainer || !this.lottieLib || !this.loadedAnimationData) {
          return;
        }

        this.lottieInstance = this.lottieLib.loadAnimation({
          container: this.$refs.lottieContainer,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: this.loadedAnimationData,
        });
      }, 200);
    },
  },
};
</script>
