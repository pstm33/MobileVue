<template>
  <q-item-section>
    <div class="relative-position">
      <q-img
        :src="merchantImage"
        lazy
        fit="cover"
        style="height: 100px"
        class="radius8"
        spinner-color="amber"
        spinner-size="sm"
      />

      <div v-if="items.promos" class="absolute-top-left">
        <div v-for="promo in items.promos" :key="promo">
          <q-chip
            dense
            :color="promo.discount_type == 'voucher' ? 'light-green' : 'purple'"
            text-color="white"
            class="font11 text-weight-600 ellipsis"
            >{{ promo.discount_name }}</q-chip
          >
        </div>

        <template v-if="items.free_delivery">
          <q-chip
            dense
            color="yellow-9"
            text-color="white"
            class="font11 text-weight-600 ellipsis"
            >{{ $t("First Delivery Free") }}</q-chip
          >
        </template>

        <q-chip
          v-if="items.open_status == 0"
          dense
          color="red"
          text-color="white"
          class="font11 text-weight-600 ellipsis"
          >{{ $t("Closed") }}</q-chip
        >
      </div>
      <div v-else class="absolute-top-left">
        <q-chip
          v-if="items.open_status == 0"
          dense
          color="red"
          text-color="white"
          class="font11 text-weight-600 ellipsis"
          >{{ $t("Closed") }}</q-chip
        >
        <template v-if="items.free_delivery">
          <q-chip
            dense
            color="yellow-9"
            text-color="white"
            class="font11 text-weight-600 ellipsis"
            >{{ $t("First Delivery Free") }}</q-chip
          >
        </template>
      </div>
    </div>
    <q-item-label>
      <div class="row no-wrap items-center q-pt-sm">
        <div class="col font13 text-weight-bold no-margin line-normal">
          <div class="ellipsis fit">
            {{ items.restaurant_name }}
          </div>
        </div>
        <div class="col-3 text-right">
          <FavsResto
            ref="favs"
            :data="items"
            :active="items.saved_store == 1 ? true : false"
            :merchant_id="items.merchant_id"
            size="7px"
            @after-savefav="afterSavefav"
          />
        </div>
      </div>

      <div class="row no-wrap items-center">
        <div class="col font12 text-grey ellipsis text-weight-light">
          <template
            v-for="(cuisine_name, index) in items.cuisine"
            :key="cuisine_name"
          >
            {{ cuisine_name
            }}<span v-if="index < items.cuisine.length - 1">, </span>
          </template>
        </div>
        <div class="col-4 text-right">
          <template v-if="items.estimation">
            <q-chip
              size="sm"
              :color="$q.dark.mode ? 'grey600' : 'mygrey'"
              :text-color="$q.dark.mode ? 'grey300' : 'secondary'"
              icon="fiber_manual_record"
            >
              <span
                :class="{
                  'text-grey300': $q.dark.mode,
                  'text-primary': !$q.dark.mode,
                }"
              >
                {{ items.estimation }} {{ $t("min") }}</span
              >
            </q-chip>
          </template>
        </div>
      </div>

      <div class="row no-wrap items-center">
        <div class="col font13 text-weight-bold no-margin line-normal">
          <q-chip
            size="sm"
            color="secondary"
            :text-color="$q.dark.mode ? 'grey300' : 'secondary'"
            icon="star"
            class="no-padding q-ma-none transparent"
          >
            <span
              class="text-weight-medium"
              :class="{
                'text-grey300': $q.dark.mode,
                'text-dark': !$q.dark.mode,
              }"
            >
              <template v-if="items.reviews">
                {{ items.reviews.ratings }}
              </template>
              <template> 0.0 </template>
            </span>
          </q-chip>
        </div>
        <div class="col-4 text-right font11 text-grey">
          <q-chip
            size="sm"
            :color="$q.dark.mode ? 'grey600' : 'mygrey'"
            :text-color="$q.dark.mode ? 'grey300' : 'mygrey'"
            icon="fiber_manual_record"
            class="q-ma-none transparent q-pa-none"
          >
            <span
              :class="{
                'text-grey300': $q.dark.mode,
                'text-dark': !$q.dark.mode,
              }"
            >
              {{ items.distance_pretty }}
            </span>
          </q-chip>
        </div>
      </div>
    </q-item-label>
  </q-item-section>
</template>

<script>
import { defineAsyncComponent } from "vue";
export default {
  name: "MerchantListInline",
  components: {
    FavsResto: defineAsyncComponent(() => import("components/FavsResto.vue")),
  },
  props: [
    "items",
    "cuisine",
    "reviews",
    "estimation",
    "services",
    "items_min_max",
    "promos",
  ],
  computed: {
    merchantImage() {
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
    },
  },
};
</script>
