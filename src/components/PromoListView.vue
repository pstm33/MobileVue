<template>
  <div v-if="visiblePromos.length" class="tagam-restaurant-promo-list">
    <button
      v-for="items in visiblePromos"
      :key="items"
      type="button"
      class="tagam-restaurant-promo-pill"
      @click.stop="showDetails(items)"
    >
      <span class="tagam-restaurant-promo-icon">
        <q-icon :name="items.promo_type == 'voucher' ? 'o_discount' : 'o_percent'" />
      </span>
      <span class="tagam-restaurant-promo-copy">
        <span class="tagam-restaurant-promo-title">
          {{ displayPromoTitle(items) }}
        </span>
        <span class="tagam-restaurant-promo-meta">
          {{ displayPromoMeta(items) }}
        </span>
      </span>
    </button>
  </div>

  <q-dialog v-model="modal" position="bottom">
    <q-card class="tagam-restaurant-promo-dialog tagam-surface tagam-text-main">
      <q-card-section>
        <div class="tagam-restaurant-promo-dialog-head">
          <div class="tagam-restaurant-promo-dialog-icon">
            <q-icon :name="selectedPromo?.promo_type == 'voucher' ? 'o_discount' : 'o_percent'" />
          </div>
          <div class="tagam-restaurant-promo-dialog-copy">
            <div class="tagam-restaurant-promo-dialog-title">
              {{ displayPromoTitle(selectedPromo) }}
            </div>
            <div class="tagam-restaurant-promo-dialog-subtitle">
              {{ displayPromoMeta(selectedPromo) }}
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="eva-close-outline"
            class="tagam-restaurant-promo-dialog-close"
            v-close-popup
          />
        </div>
        <div class="tagam-restaurant-promo-dialog-grid">
          <div
            v-for="row in promoDetailRows(selectedPromo)"
            :key="row.label + row.value"
            class="tagam-restaurant-promo-dialog-row"
          >
            <div class="tagam-restaurant-promo-dialog-label">{{ row.label }}</div>
            <div class="tagam-restaurant-promo-dialog-value">{{ row.value }}</div>
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
  name: "PromoListView",
  props: ["data"],
  data() {
    return {
      modal: false,
      selectedPromo: null,
    };
  },
  computed: {
    visiblePromos() {
      return normalizedPromoList(this.data, 2);
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
    showDetails(item) {
      this.selectedPromo = item;
      this.modal = true;
    },
  },
};
</script>

<style scoped>
.tagam-restaurant-promo-list {
  display: grid;
  gap: 7px;
  width: 100%;
}

.tagam-restaurant-promo-pill {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 46px;
  padding: 7px 10px;
  border: 1px solid rgba(255, 107, 53, 0.16);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 255, 255, 0.78)),
    var(--tagam-surface);
  color: var(--tagam-text);
  text-align: left;
  box-shadow: none;
}

.tagam-restaurant-promo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(5, 150, 105, 0.11);
  color: #059669;
  font-size: 17px;
}

.tagam-restaurant-promo-copy {
  min-width: 0;
  display: grid;
  gap: 1px;
}

.tagam-restaurant-promo-title {
  overflow: hidden;
  color: var(--tagam-text);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tagam-restaurant-promo-meta {
  overflow: hidden;
  color: var(--tagam-text-muted);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

body.body--dark .tagam-restaurant-promo-pill {
  border-color: rgba(255, 255, 255, 0.1);
  background:
    linear-gradient(135deg, rgba(255, 107, 53, 0.16), rgba(255, 255, 255, 0.04)),
    var(--tagam-surface);
}

.tagam-restaurant-promo-dialog {
  border-radius: 24px 24px 0 0;
}

.tagam-restaurant-promo-dialog-head {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 34px;
  align-items: center;
  gap: 11px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--tagam-border-soft);
}

.tagam-restaurant-promo-dialog-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(5, 150, 105, 0.11);
  color: #059669;
  font-size: 21px;
}

.tagam-restaurant-promo-dialog-copy {
  min-width: 0;
}

.tagam-restaurant-promo-dialog-title {
  color: var(--tagam-text);
  font-size: 15px;
  font-weight: 850;
  line-height: 1.2;
}

.tagam-restaurant-promo-dialog-subtitle {
  margin-top: 2px;
  color: var(--tagam-text-muted);
  font-size: 13px;
  font-weight: 700;
}

.tagam-restaurant-promo-dialog-close {
  color: var(--tagam-text-muted);
}

.tagam-restaurant-promo-dialog-grid {
  display: grid;
  gap: 9px;
  padding-top: 13px;
}

.tagam-restaurant-promo-dialog-row {
  display: grid;
  gap: 4px;
  padding: 11px;
  border: 1px solid var(--tagam-border-soft);
  border-radius: 14px;
  background: var(--tagam-surface-muted);
}

.tagam-restaurant-promo-dialog-label {
  color: var(--tagam-text-muted);
  font-size: 12px;
  font-weight: 780;
}

.tagam-restaurant-promo-dialog-value {
  color: var(--tagam-text);
  font-size: 13px;
  font-weight: 720;
  line-height: 1.35;
}
</style>
