<template>
  <div v-if="hasPromos" class="tagam-promo-strip-list">
    <button
      v-for="(items, index) in visiblePromos"
      :key="items"
      type="button"
      class="tagam-promo-strip"
      @click="showDetails(index)"
    >
      <span class="tagam-promo-strip__icon">
        <q-icon
          :name="items.discount_type == 'voucher' ? 'o_discount' : 'o_percent'"
        />
      </span>
      <span class="tagam-promo-strip__copy">
        <span class="tagam-promo-strip__title">
          {{ displayPromoTitle(items) }}
        </span>
        <span class="tagam-promo-strip__meta">
          {{ displayPromoMeta(items) }}
        </span>
      </span>
    </button>
  </div>

  <q-dialog v-model="modal" position="bottom">
    <q-card class="tagam-promo-details-card tagam-surface tagam-text-main">
      <q-card-section>
        <div class="tagam-promo-details-head">
          <div class="tagam-promo-details-icon">
            <q-icon :name="selectedPromo?.discount_type == 'voucher' ? 'o_discount' : 'o_percent'" />
          </div>
          <div class="tagam-promo-details-copy">
            <div class="tagam-promo-details-title">
              {{ displayPromoTitle(selectedPromo) }}
            </div>
            <div class="tagam-promo-details-subtitle">
              {{ displayPromoMeta(selectedPromo) }}
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="eva-close-outline"
            class="tagam-promo-details-close"
            v-close-popup
          />
        </div>

        <div class="tagam-promo-details-grid">
          <div
            v-for="row in promoDetailRows(selectedPromo)"
            :key="row.label + row.value"
            class="tagam-promo-details-row"
          >
            <div class="tagam-promo-details-row-label">{{ row.label }}</div>
            <div class="tagam-promo-details-row-value">{{ row.value }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import {
  cleanPromoText,
  formatPromoDate,
  promoDetailSources,
  promoKind,
  normalizedPromoList,
  promoMeta,
  promoTitle,
} from "src/utils/promoDisplay";

export default {
  name: "MerchantPromoSlide",
  props: ["data"],
  data() {
    return {
      modal: false,
      selected_index: 0,
    };
  },
  computed: {
    visiblePromos() {
      return normalizedPromoList(this.data);
    },
    selectedPromo() {
      return this.visiblePromos?.[this.selected_index] || null;
    },
    hasPromos() {
      return this.visiblePromos.length > 0;
    },
  },
  methods: {
    displayPromoTitle(item) {
      return promoTitle(item);
    },
    displayPromoMeta(item) {
      return promoMeta(item);
    },
    promoTypeLabel(item) {
      const kind = promoKind(item);
      if (kind === "offers") return this.$t("Promo offer");
      if (kind === "discount") return this.$t("Restaurant discount");
      if (kind === "voucher") return this.$t("Voucher");
      return this.$t("Promotion conditions");
    },
    promoServicesLabel(item) {
      const text = cleanPromoText(
        [
          item?.title,
          item?.discount_name,
          ...(item?._tagam_related_promos || []).map((promo) => promo?.discount_name),
        ].join(" ")
      ).toLowerCase();
      const labels = [];
      if (/доставк|delivery/.test(text)) labels.push(this.$t("Delivery"));
      if (/самовывоз|pickup/.test(text)) labels.push(this.$t("Pickup"));
      if (/навынос|takeout|с собой/.test(text)) labels.push(this.$t("Takeout"));
      if (/в зале|dine.?in/.test(text)) labels.push(this.$t("Dine-in"));
      return [...new Set(labels)].join(", ");
    },
    promoDetailRows(item) {
      if (!item) return [];
      const rows = [];
      const related = promoDetailSources(item);

      related.forEach((promo) => {
        const value = cleanPromoText(promo?.discount_name);
        if (value) {
          rows.push({
            label: this.promoTypeLabel(promo),
            value,
          });
        }
      });

      const services = this.promoServicesLabel(item);
      if (services) {
        rows.push({ label: this.$t("Service types"), value: services });
      }

      if (item.min_order || item.sub_title) {
        rows.push({
          label: this.$t("Minimum order"),
          value: cleanPromoText(item.min_order || item.sub_title),
        });
      }

      if (item.max_cap) {
        rows.push({
          label: this.$t("Maximum discount"),
          value: cleanPromoText(item.max_cap),
        });
      }

      if (item.valid_to) {
        rows.push({
          label: this.$t("Valid period"),
          value: formatPromoDate(item.valid_to),
        });
      }

      const seen = new Set();
      return rows.filter((row) => {
        const key = `${row.label}|${row.value}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    showDetails(value) {
      this.selected_index = value;
      this.modal = true;
    },
  },
};
</script>

<style scoped>
.tagam-promo-details-card {
  border-radius: 28px 28px 0 0;
}

.tagam-promo-details-head {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 36px;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--tagam-border-soft);
}

.tagam-promo-details-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  color: #0b8f4d;
  background: rgba(28, 184, 97, 0.12);
  font-size: 22px;
}

.tagam-promo-details-copy {
  min-width: 0;
}

.tagam-promo-details-title {
  color: var(--tagam-text);
  font-size: 16px;
  font-weight: 850;
  line-height: 1.2;
}

.tagam-promo-details-subtitle {
  margin-top: 3px;
  color: var(--tagam-text-muted);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
}

.tagam-promo-details-close {
  justify-self: end;
  color: var(--tagam-text-muted);
}

.tagam-promo-details-grid {
  display: grid;
  gap: 10px;
  padding-top: 14px;
}

.tagam-promo-details-row {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid var(--tagam-border-soft);
  border-radius: 16px;
  background: var(--tagam-surface-muted);
}

.tagam-promo-details-row-label {
  color: var(--tagam-text-muted);
  font-size: 12px;
  font-weight: 780;
}

.tagam-promo-details-row-value {
  color: var(--tagam-text);
  font-size: 13px;
  font-weight: 720;
  line-height: 1.35;
}
</style>
