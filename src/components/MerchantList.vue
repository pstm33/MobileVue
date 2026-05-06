<template>
  <MerchantListSkeleton v-if="DataStore.list_loading" />

  <div v-else class="tagam-merchant-list">
    <router-link
      v-for="items in DataStore.list_data"
      :key="items.merchant_id"
      class="tagam-merchant-link"
      :to="{ name: 'menu', params: { slug: items.restaurant_slug } }"
    >
      <MerchantListTpl
        :items="items"
        :cuisine="DataStore.list_cuisine"
        :reviews="DataStore.list_reviews"
        :estimation="DataStore.list_estimation"
        :services="DataStore.list_services"
        :promos="DataStore.promos"
        :enabled_review="DataStore.enabled_review"
      />
    </router-link>
  </div>

  <q-dialog v-model="alert">
    <q-card style="border-radius: 18px; min-width: 280px">
      <q-card-section class="text-center q-pt-lg">
        <q-img
          src="bankrupt.png"
          style="height: 80px; max-width: 80px"
          class="q-mb-sm light-dimmed"
        />
        <p class="text-grey-7">
          {{
            $t(
              "We're sorry. We were not able to find a match with your filters."
            )
          }}
        </p>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn unelevated label="OK" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { useDataStore } from "stores/DataStore";

export default {
  name: "MerchantList",
  props: ["list_type", "filters", "featured_id"],
  components: {
    MerchantListTpl: defineAsyncComponent(() =>
      import("components/MerchantListTpl.vue")
    ),
    MerchantListSkeleton: defineAsyncComponent(() =>
      import("components/MerchantListSkeleton.vue")
    ),
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  data() {
    return {
      alert: false,
    };
  },
  watch: {
    filters: {
      handler() {
        this.getData();
      },
      deep: true,
    },
  },
  mounted() {
    if (Object.keys(this.DataStore.list_data).length <= 0) {
      this.DataStore.list_featured_id = this.featured_id;
      this.getData();
    } else if (this.featured_id !== this.DataStore.list_featured_id) {
      this.DataStore.list_featured_id = this.featured_id;
      this.getData();
    }
  },
  methods: {
    getData() {
      const $params = {
        featured_id: this.featured_id,
        list_type: this.list_type,
        place_id: APIinterface.getStorage("place_id"),
        payload: ["cuisine", "reviews", "estimation", "services", "promo"],
        filters: this.filters,
      };
      this.DataStore.getMerchantFeed($params);
    },
  },
};
</script>

<style scoped>
.tagam-merchant-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tagam-merchant-link {
  text-decoration: none;
  color: inherit;
}
</style>
