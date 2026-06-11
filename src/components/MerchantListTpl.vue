<template>
  <div class="tagam-restaurant-feed-card full-width">
    <div class="tagam-restaurant-media relative-position">
      <q-img
        :src="coverImage"
        lazy
        :ratio="2"
        fit="fill"
        class="tagam-restaurant-cover-stretch"
        spinner-color="primary"
        spinner-size="sm"
      />

      <template v-if="!items?.available">
        <div class="absolute-full light-dimmed"></div>
      </template>

      <div class="tagam-restaurant-media-shade"></div>

      <div class="tagam-restaurant-cover-fav" @click.prevent.stop>
        <FavsResto
          ref="favs"
          :data="items"
          :active="items.saved_store == 1 ? true : false"
          :merchant_id="items.merchant_id"
          size="sm"
          @after-savefav="afterSavefav"
        />
      </div>

      <div class="tagam-restaurant-badges">
        <q-badge
          v-if="!items?.available"
          color="grey-9"
          text-color="white"
          class="tagam-restaurant-badge"
        >
          {{ items?.next_opening || items?.close_reason || $t("Closed") }}
        </q-badge>
        <q-badge
          v-else-if="hasPromo && !hasPromoList"
          color="primary"
          text-color="white"
          class="tagam-restaurant-badge"
        >
          {{ $t("PROMO") }}
        </q-badge>
        <q-badge
          v-if="items.free_delivery"
          color="orange-1"
          text-color="orange-8"
          class="tagam-restaurant-badge"
        >
          {{ $t("First Delivery Free") }}
        </q-badge>
      </div>
    </div>

    <div class="tagam-restaurant-content">
      <div class="tagam-restaurant-title-row">
        <div class="col">
          <div class="tagam-resto-title text-subtitle1 line-normal ellipsis-2-lines">
            {{ items.restaurant_name }}
          </div>
          <div class="tagam-restaurant-cuisine text-caption ellipsis">
            {{ cuisineLabel }}
          </div>
        </div>

        <div
          v-if="logoImage"
          class="tagam-restaurant-logo tagam-restaurant-logo-stretch"
        >
          <img :src="logoImage" alt="" />
        </div>
      </div>

      <PromoListView
        v-if="hasPromoList"
        :data="items?.promo_list || null"
        class="q-mt-sm"
      />

      <div class="tagam-restaurant-meta row items-center q-mt-sm">
        <div v-if="enabled_review" class="tagam-meta-pill row items-center">
          <q-icon name="eva-star" size="15px" class="q-mr-xs text-primary" />
          <span class="text-weight-bold">{{ ratingLabel }}</span>
          <span v-if="reviewCount" class="tagam-text-muted q-ml-xs">
            {{ reviewCount }}
          </span>
        </div>

        <div v-if="etaLabel" class="tagam-meta-pill row items-center">
          <q-icon name="eva-clock-outline" size="15px" class="q-mr-xs" />
          <span>{{ etaLabel }}</span>
        </div>

        <div v-if="distanceLabel" class="tagam-meta-pill row items-center">
          <q-icon name="eva-navigation-2-outline" size="15px" class="q-mr-xs" />
          <span>{{ distanceLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "MerchantListTpl",
  components: {
    FavsResto: defineAsyncComponent(() => import("components/FavsResto.vue")),
    PromoListView: defineAsyncComponent(() =>
      import("components/PromoListView.vue")
    ),
  },
  props: [
    "items",
    "cuisine",
    "reviews",
    "estimation",
    "services",
    "items_min_max",
    "promos",
    "enabled_review",
    "row",
  ],
  computed: {
    coverImage() {
      return (
        this.items?.url_banner ||
        this.items?.url_header ||
        this.items?.header_image ||
        this.items?.url_image ||
        ""
      );
    },
    logoImage() {
      return this.items?.url_logo || "";
    },
    hasPromo() {
      return (
        this.items?.promos?.length > 0 ||
        this.items?.vouchers?.length > 0 ||
        this.items?.promo_list?.length > 0
      );
    },
    hasPromoList() {
      return Array.isArray(this.items?.promo_list) && this.items.promo_list.length > 0;
    },
    cuisineLabel() {
      if (Array.isArray(this.items?.cuisine) && this.items.cuisine.length > 0) {
        return this.items.cuisine.join(", ");
      }
      return this.items?.cuisines || "";
    },
    ratingLabel() {
      return this.items?.reviews?.ratings || this.items?.ratings || "0.0";
    },
    reviewCount() {
      return this.items?.reviews?.count || this.items?.review_count || "";
    },
    etaLabel() {
      const eta = this.items?.estimation2 || this.items?.estimation || "";
      if (!eta) return "";
      return String(eta).includes(this.$t("min")) ? eta : `${eta} ${this.$t("min")}`;
    },
    distanceLabel() {
      return this.items?.distance_pretty || this.items?.distance_short || "";
    },
  },
  methods: {
    afterSavefav(data, added) {
      data.saved_store = added;
      this.$emit("afterSavefav", this.row);
    },
  },
};
</script>

<style lang="sass" scoped>
.tagam-restaurant-feed-card
  overflow: hidden
  color: var(--tagam-text)

.tagam-restaurant-media
  aspect-ratio: 2 / 1
  width: 100%
  background: var(--tagam-surface-muted)
  overflow: hidden

.tagam-restaurant-media .q-img
  border-radius: 0 !important

.tagam-restaurant-media-shade
  position: absolute
  inset: auto 0 0 0
  height: 54%
  pointer-events: none
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.34) 100%)

.tagam-restaurant-logo
  position: relative
  width: 58px
  height: 58px
  aspect-ratio: 1 / 1
  border-radius: 18px
  overflow: hidden
  border: 1px solid var(--tagam-border)
  background: var(--tagam-surface)
  box-shadow: 0 10px 20px rgba(22, 28, 45, 0.12)

.tagam-restaurant-logo img
  display: block
  width: 100%
  height: 100%
  border-radius: 17px
  object-fit: fill

.tagam-restaurant-badges
  position: absolute
  top: 10px
  left: 10px
  right: 10px
  display: flex
  align-items: center
  flex-wrap: wrap
  gap: 6px
  pointer-events: none

.tagam-restaurant-badge
  padding: 5px 8px
  border-radius: 999px
  font-size: 11px
  font-weight: 800
  box-shadow: 0 8px 18px rgba(22, 28, 45, 0.18)

.tagam-restaurant-content
  padding: 20px 18px 18px
  background: var(--tagam-surface)

.tagam-restaurant-cuisine
  color: var(--tagam-text-soft)
  margin-top: 2px

.tagam-restaurant-meta
  gap: 7px

.tagam-meta-pill
  min-height: 28px
  padding: 0 8px
  border: 1px solid var(--tagam-border)
  border-radius: 999px
  background: var(--tagam-surface-muted)
  color: var(--tagam-text)
  font-size: 12px
  font-weight: 600

body.body--dark .tagam-restaurant-logo
  border-color: rgba(255, 255, 255, 0.16)
</style>


