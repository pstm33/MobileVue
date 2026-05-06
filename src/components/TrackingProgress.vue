<template>
  <div class="tagam-tracking-progress">
    <div class="tagam-tracking-progress__rail"></div>
    <div
      v-for="step in visibleSteps"
      :key="step.name"
      class="tagam-tracking-progress__step"
      :class="{
        'tagam-tracking-progress__step--active': currentProgress >= step.name,
        'tagam-tracking-progress__step--current': currentProgress === step.name,
        'tagam-tracking-progress__step--failed': currentProgress === 0,
      }"
    >
      <div class="tagam-tracking-progress__icon">
        <q-icon :name="step.icon" size="18px" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TrackingProgress",
  props: ["order_progress", "order_type"],
  computed: {
    currentProgress() {
      return Number(this.order_progress || 0);
    },
    visibleSteps() {
      const deliverySteps = [
        { name: 1, icon: "eva-arrow-forward-outline" },
        { name: 2, icon: "restaurant_menu" },
        { name: 3, icon: "directions_car" },
        { name: 4, icon: "eva-home-outline" },
      ];

      const pickupSteps = [
        { name: 1, icon: "eva-arrow-forward-outline" },
        { name: 2, icon: "restaurant_menu" },
        { name: 3, icon: "eva-home-outline" },
      ];

      return this.order_type === "delivery" ? deliverySteps : pickupSteps;
    },
  },
};
</script>

<style scoped>
.tagam-tracking-progress {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.tagam-tracking-progress__rail {
  position: absolute;
  top: 50%;
  left: 24px;
  right: 24px;
  height: 2px;
  background: #dddede;
  transform: translateY(-50%);
  z-index: 0;
}

.tagam-tracking-progress__step {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 0;
}

.tagam-tracking-progress__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #d6d7d9;
  color: #ffffff;
}

.tagam-tracking-progress__step--active .tagam-tracking-progress__icon {
  background: #f18800;
}

.tagam-tracking-progress__step--current .tagam-tracking-progress__icon {
  background: #38c978;
}

.tagam-tracking-progress__step--failed .tagam-tracking-progress__icon {
  background: #e45d5d;
}

:global(body.body--dark) .tagam-tracking-progress__rail {
  background: rgba(255, 239, 231, 0.14) !important;
}

:global(body.body--dark) .tagam-tracking-progress__icon {
  background: rgba(74, 60, 53, 0.96) !important;
  color: var(--tagam-text-soft) !important;
  border: 1px solid var(--tagam-stroke) !important;
}

:global(body.body--dark) .tagam-tracking-progress__step--active .tagam-tracking-progress__icon {
  background: linear-gradient(
    135deg,
    var(--tagam-primary) 0%,
    var(--tagam-primary-strong) 100%
  ) !important;
  color: #fff8f1 !important;
}

:global(body.body--dark) .tagam-tracking-progress__step--current .tagam-tracking-progress__icon {
  background: #38c978 !important;
  color: #ffffff !important;
}
</style>
