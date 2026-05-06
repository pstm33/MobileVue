<script setup>
import { computed } from "vue"
import { runtimeConfig } from "@/config/runtime"
import starPng from "@/assets/metric-icons/star.png"
import routePng from "@/assets/metric-icons/route.png"
import pricePng from "@/assets/metric-icons/price.png"
import dishPng from "@/assets/metric-icons/dish.png"
import starSvg from "@/assets/metric-icons/star.svg?raw"
import routeSvg from "@/assets/metric-icons/route.svg?raw"
import priceSvg from "@/assets/metric-icons/price.svg?raw"
import restaurantSvg from "@/assets/metric-icons/restaurant.svg?raw"

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
})

const bitmapIcons = {
  star: starPng,
  route: routePng,
  price: pricePng,
  dish: dishPng,
}

const unifiedIcons = {
  star: starSvg,
  route: routeSvg,
  price: priceSvg,
  dish: restaurantSvg,
}

const legacyIcons = {
  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 3.8l2.5 5.05 5.58.81-4.04 3.93.95 5.56L12 17.8 7.01 20.15l.95-5.56L3.92 9.66l5.58-.81L12 3.8Z" fill="currentColor"/></svg>`,
  route: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11Zm0-8.2a2.8 2.8 0 1 1 0-5.6a2.8 2.8 0 0 1 0 5.6Z" fill="currentColor"/></svg>`,
  price: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4Zm2 3.5h9m-9 4h6m-6 4h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  dish: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M4.5 7.5h15v3h-15Zm1 5h13l-1.1 5.2a1.5 1.5 0 0 1-1.47 1.2H8.08a1.5 1.5 0 0 1-1.47-1.2L5.5 12.5Zm3-7.8 1.2-1.4m4.6 1.4-1.2-1.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
}

const maskUrl = computed(() => {
  if (runtimeConfig.useUnifiedMetricIcons === false) {
    return ""
  }

  return bitmapIcons[props.icon] || ""
})

const iconMarkup = computed(() => {
  return legacyIcons[props.icon] || unifiedIcons[props.icon] || ""
})

const iconStyle = computed(() => {
  if (!maskUrl.value) {
    return {}
  }

  return {
    "--metric-icon-mask": `url("${maskUrl.value}")`,
  }
})
</script>

<template>
  <span
    v-if="maskUrl"
    class="metric-icon metric-icon--bitmap"
    :style="iconStyle"
    aria-hidden="true"
  ></span>
  <span v-else class="metric-icon" v-html="iconMarkup" aria-hidden="true"></span>
</template>
