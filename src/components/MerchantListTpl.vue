<template>
  <div class="tagam-merchant-card">
    <RestaurantCover
      :cover-src="merchantCoverImage"
      :logo-src="merchantLogoImage"
      image-fit="fill"
      image-position="center center"
      image-transform="none"
      background="#fffaf3"
      aspect-ratio="2 / 1"
      radius="20px"
      class="tagam-merchant-image-wrap"
    >
      <div v-if="!items?.available" class="tagam-merchant-overlay">
        <div class="tagam-merchant-overlay-text">
          {{ items?.next_opening || items?.close_reason || $t("Closed") }}
        </div>
      </div>

      <div v-if="promoBadges.length" class="tagam-merchant-badge-stack">
        <div
          v-for="(promo, index) in promoBadges"
          :key="`${promo.title || promo.discount}-${index}`"
          class="tagam-merchant-badge"
          :class="{ 'tagam-merchant-badge--soft': index > 0 }"
        >
          {{ promo.discount || promo.title || $t("PROMO") }}
        </div>
      </div>
    </RestaurantCover>

    <div class="tagam-merchant-body">
      <div class="tagam-merchant-heading">
        <div class="tagam-merchant-title ellipsis">
          {{ items.restaurant_name }}
        </div>

        <div v-if="enabledReview" class="tagam-merchant-rating">
          <span>{{ ratingLabel }}</span>
          <q-icon name="star_outline" size="18px" />
        </div>
      </div>

      <div class="tagam-merchant-cuisine ellipsis">
        <template
          v-for="(cuisine_name, index) in items.cuisine"
          :key="cuisine_name"
        >
          {{ cuisine_name
          }}<span v-if="index < items.cuisine.length - 1">, </span>
        </template>

        <template v-if="!items.cuisine || items.cuisine.length === 0">
          {{ items?.cuisines ?? "" }}
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "MerchantListTpl",
  components: {
    RestaurantCover: defineAsyncComponent(() =>
      import("components/RestaurantCover.vue")
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
    enabledReview() {
      return this.enabled_review;
    },
    ratingLabel() {
      return this.items?.reviews?.ratings ?? this.items?.ratings ?? "0%";
    },
    promoBadges() {
      if (Array.isArray(this.items?.promo_list) && this.items.promo_list.length) {
        return this.items.promo_list.slice(0, 2);
      }
      return [];
    },
    merchantCoverImage() {
      return (
        this.items?.url_header ||
        this.items?.featured_image ||
        this.items?.cover_image ||
        this.items?.merchant_cover ||
        this.items?.cover ||
        this.items?.url_cover ||
        this.items?.url_banner ||
        this.items?.banner_image ||
        this.items?.url_featured ||
        this.items?.url_photo ||
        ""
      );
    },
    merchantLogoImage() {
      return (
        this.items?.image ||
        this.items?.image_url ||
        this.items?.url_logo ||
        this.items?.logo_url ||
        this.items?.logo ||
        ""
      );
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

<style scoped>
.tagam-merchant-card {
  width: 100%;
  display: block;
  background: transparent;
  border: 0;
  border-radius: 0;
  overflow: visible;
  box-shadow: none;
}

.tagam-merchant-image-wrap {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 0;
}

.tagam-merchant-overlay {
  position: absolute;
  inset: 0;
  background: rgba(17, 17, 17, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tagam-merchant-overlay-text {
  background: rgba(255, 255, 255, 0.95);
  color: #1f1f1f;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 999px;
}

.tagam-merchant-badge-stack {
  position: absolute;
  top: 15px;
  left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tagam-merchant-badge {
  width: max-content;
  background: #f18800;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  padding: 11px 18px;
  border-radius: 999px;
  letter-spacing: 0;
}

.tagam-merchant-badge--soft {
  background: #fff6e2;
  color: #1f1f1f;
}

.tagam-merchant-body {
  padding: 15px 0 4px 8px;
}

.tagam-merchant-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.tagam-merchant-title {
  font-size: 16px;
  line-height: 1.2;
  font-weight: 700;
  color: #000000;
  flex: 1 1 auto;
  min-width: 0;
}

.tagam-merchant-cuisine {
  margin-top: 5px;
  font-size: 12px;
  line-height: 1.25;
  color: #3f3f3f;
  min-height: 18px;
}

.tagam-merchant-rating {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 700;
  color: #f18800;
  white-space: nowrap;
  line-height: 1;
  padding-top: 2px;
  flex: 0 0 auto;
}

.tagam-merchant-rating :deep(.q-icon) {
  margin-top: -1px;
}

:global(body.body--dark) .tagam-merchant-card {
  background: transparent;
  box-shadow: none;
}

:global(body.body--dark) .tagam-merchant-title {
  color: #fff7f0 !important;
}

:global(body.body--dark) .tagam-merchant-cuisine {
  color: #dfcfc0 !important;
}

:global(body.body--dark) .tagam-merchant-rating {
  color: #ffbf57 !important;
}

:global(body.body--dark) .tagam-merchant-body,
:global(body.body--dark) .tagam-merchant-heading,
:global(body.body--dark) .tagam-merchant-title,
:global(body.body--dark) .tagam-merchant-rating,
:global(body.body--dark) .tagam-merchant-rating span {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-merchant-card .ellipsis,
:global(body.body--dark) .tagam-merchant-card .ellipsis * {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-merchant-body .tagam-merchant-title,
:global(body.body--dark) .tagam-merchant-body .tagam-merchant-title *,
:global(body.body--dark) .tagam-merchant-card .tagam-merchant-title.ellipsis,
:global(body.body--dark) .tagam-merchant-card .tagam-merchant-title.ellipsis * {
  color: #fff7f0 !important;
}

:global(body.body--dark) .tagam-merchant-body .tagam-merchant-cuisine,
:global(body.body--dark) .tagam-merchant-body .tagam-merchant-cuisine *,
:global(body.body--dark) .tagam-merchant-card .tagam-merchant-cuisine.ellipsis,
:global(body.body--dark) .tagam-merchant-card .tagam-merchant-cuisine.ellipsis * {
  color: #dfcfc0 !important;
}

:global(body.body--dark) .tagam-merchant-rating,
:global(body.body--dark) .tagam-merchant-rating :deep(.q-icon) {
  color: #ffbf57 !important;
}

</style>
