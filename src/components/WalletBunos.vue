<template>
  <template v-if="loading">
    <q-skeleton height="120px" square />
  </template>
  <template v-else>
    <swiper :slides-per-view="1.1" :space-between="10">
      <template v-for="items in getData" :key="items">
        <swiper-slide>
          <q-list class="bg-mygrey2 radius10 myqlist">
            <q-item>
              <q-item-section avatar top>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-ticket-percent"
                >
                  <path
                    d="M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"
                  />
                  <path d="M9 9h.01" />
                  <path d="m15 9-6 6" />
                  <path d="M15 15h.01" />
                </svg>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-subtitle2">{{
                  items.title
                }}</q-item-label>
                <q-item-label caption>{{
                  items.discount_details
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </swiper-slide>
      </template>
    </swiper>
  </template>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";

export default {
  name: "WalletBunos",
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  data() {
    return {
      loading: false,
      data: [],
    };
  },
  computed: {
    getData() {
      return this.DataStore.wallet_discount_data;
    },
  },
  mounted() {
    this.getDiscount();
  },
  methods: {
    async resetDiscount() {
      try {
        await this.DataStore.getWalletdiscount();
      } catch (error) {
      } finally {
      }
    },
    async getDiscount() {
      if (!this.DataStore.wallet_discount_data) {
        try {
          await this.DataStore.getWalletdiscount();
        } catch (error) {
        } finally {
        }
      }
    },
  },
};
</script>
