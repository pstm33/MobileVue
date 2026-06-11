<template>
  <button
    v-if="isVisible"
    type="button"
    class="tagam-cart-promo-banner"
    :class="{ 'tagam-cart-promo-banner--applied': hasDiscount }"
    @click="$emit(hasDiscount ? 'open' : 'apply')"
  >
    <span class="tagam-cart-promo-banner__icon">
      <q-icon :name="hasDiscount ? 'eva-checkmark-circle-2-outline' : 'o_percent'" />
    </span>
    <span class="tagam-cart-promo-banner__copy">
      <span class="tagam-cart-promo-banner__eyebrow">
        {{ hasDiscount ? $t("Discount applied") : $t("Restaurant offer") }}
      </span>
      <span class="tagam-cart-promo-banner__title">
        {{ title }}
      </span>
      <span v-if="meta" class="tagam-cart-promo-banner__meta">
        {{ meta }}
      </span>
      <span v-else class="tagam-cart-promo-banner__meta">
        {{ hasDiscount ? $t("Savings are included in total") : $t("Discount will be applied at checkout") }}
      </span>
    </span>
    <span class="tagam-cart-promo-banner__action">
      <q-spinner v-if="loading" color="primary" size="20px" />
      <q-icon v-else-if="hasDiscount" name="eva-checkmark-outline" />
      <span v-else>{{ canApply ? $t("Apply") : $t("At checkout") }}</span>
    </span>
  </button>
</template>

<script>
import { promoDisplayMeta, promoDisplayTitle } from "src/utils/cartPromo";

export default {
  name: "CartPromoBanner",
  props: {
    discount: {
      type: Object,
      default: null,
    },
    promo: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    canApply: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    hasDiscount() {
      return !!this.discount;
    },
    source() {
      return this.discount || this.promo;
    },
    isVisible() {
      return !!this.source || this.loading;
    },
    title() {
      return promoDisplayTitle(this.source) || this.$t("Restaurant offer");
    },
    meta() {
      if (this.hasDiscount && this.source?.savings_value) {
        return `${this.$t("Savings")}: ${this.source.savings_value}`;
      }
      return promoDisplayMeta(this.source);
    },
  },
};
</script>

<style scoped>
.tagam-cart-promo-banner {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 78px;
  padding: 13px 14px;
  border: 1px solid rgba(255, 107, 53, 0.24);
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(255, 107, 53, 0.13), rgba(5, 150, 105, 0.08)),
    var(--tagam-surface);
  color: var(--tagam-text);
  text-align: left;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
}

.tagam-cart-promo-banner--applied {
  border-color: rgba(5, 150, 105, 0.26);
  background:
    linear-gradient(135deg, rgba(5, 150, 105, 0.13), rgba(255, 107, 53, 0.08)),
    var(--tagam-surface);
}

.tagam-cart-promo-banner__icon {
  display: inline-grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 107, 53, 0.12);
  color: var(--tagam-primary);
  font-size: 22px;
}

.tagam-cart-promo-banner--applied .tagam-cart-promo-banner__icon {
  background: rgba(5, 150, 105, 0.12);
  color: #059669;
}

.tagam-cart-promo-banner__copy {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.tagam-cart-promo-banner__eyebrow {
  color: var(--tagam-text-muted);
  font-size: 11px;
  font-weight: 800;
  line-height: 1.1;
}

.tagam-cart-promo-banner__title {
  color: var(--tagam-text);
  font-size: 14px;
  font-weight: 850;
  line-height: 1.2;
}

.tagam-cart-promo-banner__meta {
  color: var(--tagam-text-muted);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.25;
}

.tagam-cart-promo-banner__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--tagam-primary-soft);
  color: var(--tagam-primary);
  font-size: 12px;
  font-weight: 850;
  white-space: nowrap;
}

.tagam-cart-promo-banner--applied .tagam-cart-promo-banner__action {
  background: rgba(5, 150, 105, 0.12);
  color: #059669;
}

body.body--dark .tagam-cart-promo-banner {
  border-color: rgba(255, 255, 255, 0.09);
  box-shadow: none;
}
</style>
