<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
        'border-bottom': !isScrolled,
        'shadow-bottom': isScrolled,
      }"
    >
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          flat
          round
          dense
          icon="eva-arrow-back-outline"
          :color="$q.dark.mode ? 'white' : 'dark'"
        />
        <q-toolbar-title class="text-subtitle2 text-weight-bold">{{
          $t("Bookings")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page>
      <q-scroll-observer @scroll="onScroll" />
      <q-space style="height: 8px" class="bg-mygrey1 q-mb-md"></q-space>
      <q-card flat class="q-pt-none">
        <q-card-section class="q-pt-none">
          <div
            class="bg-blue-6 radius10 q-pt-lg q-pb-sm relative-position"
            style="overflow: hidden"
          >
            <div class="bg-blue-2 circle-blue"></div>
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label
                    class="text-white"
                    caption
                    style="opacity: 0.5"
                    >{{ $t("Total Bookings") }}</q-item-label
                  >
                  <q-item-label
                    class="text-white text-weight-bold text-subtitle1"
                  >
                    <template v-if="loading2">
                      <q-spinner-ios size="xs"
                    /></template>
                    <template v-else>
                      {{ BookingStore.getSummary?.total_reservation || 0 }}
                    </template>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <q-space class="q-pa-sm"></q-space>

          <q-tabs
            v-model="tab"
            dense
            narrow-indicator
            no-caps
            active-color="'blue-grey-6"
            active-bg-color="orange-1"
            indicator-color="transparent"
            active-class="text-blue-grey-6"
            class="custom-tabs"
            :mobile-arrows="$q.capacitor ? false : true"
            @update:model-value="tabChange"
          >
            <template
              v-for="(items, index) in DataStore.getBookingStatusList"
              :key="items"
            >
              <q-tab :name="index" :label="items" class="radius28 bg-mygrey1" />
            </template>
          </q-tabs>

          <q-tab-panels
            v-model="tab"
            animated
            transition-prev="slide-down"
            transition-next="slide-up"
            style="min-height: calc(60vh)"
          >
            <template
              v-for="(items, index) in DataStore.getBookingStatusList"
              :key="items"
            >
              <q-tab-panel
                :name="index"
                class="q-pl-xs q-pr-xs"
                style="min-height: calc(60vh)"
              >
                <q-infinite-scroll
                  ref="nscroll"
                  @load="fetchData"
                  :offset="100"
                >
                  <template v-slot:default>
                    <template v-if="!hasData && !loading">
                      <div class="absolute-center">
                        <div class="text-subtitle2 text-grey">
                          {{ $t("No data available") }}
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <template v-for="(items, index) in data" :key="items">
                        <!-- <router-link class="text-dark" to="#" @click.prevent> -->
                        <q-card
                          class="myshadow-1"
                          @click="viewDetails(items, index)"
                        >
                          <q-list dense>
                            <q-item-label
                              header
                              class="bg-mygrey2 text-blue-grey-6"
                              >{{ items.restaurant_name }}</q-item-label
                            >
                            <q-item>
                              <q-item-section>{{
                                $t("Reservation ID")
                              }}</q-item-section>
                              <q-item-section side>
                                {{ items.reservation_id }}
                              </q-item-section>
                            </q-item>
                            <q-item>
                              <q-item-section>{{ $t("Guest") }}</q-item-section>
                              <q-item-section side>
                                {{ items.guest_number }}
                              </q-item-section>
                            </q-item>
                            <q-item>
                              <q-item-section>{{ $t("Date") }}</q-item-section>
                              <q-item-section side>
                                {{ items.reservation_date }}
                              </q-item-section>
                            </q-item>
                            <q-item>
                              <q-item-section>{{
                                $t("Status")
                              }}</q-item-section>
                              <q-item-section side>
                                <q-badge
                                  rounded
                                  :color="DataStore.getColors(items.status_raw)"
                                  :text-color="
                                    DataStore.getTextColors(items.status_raw)
                                  "
                                  :label="items.status"
                                  class="text-capitalize"
                                ></q-badge>
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </q-card>
                        <!-- </router-link> -->
                        <q-space class="q-pa-sm"></q-space>
                      </template>
                    </template>
                  </template>

                  <template v-slot:loading>
                    <div
                      class="row q-gutter-x-sm justify-center q-my-md"
                      :class="{
                        'absolute-center text-center full-width': page == 1,
                        'absolute-bottom text-center full-width': page != 1,
                      }"
                    >
                      <q-spinner-ios size="sm" />
                      <div class="text-subtitle1 text-grey">
                        {{ $t("Loading") }}...
                      </div>
                    </div>
                  </template>
                </q-infinite-scroll>
              </q-tab-panel>
            </template>
          </q-tab-panels>
        </q-card-section>
      </q-card>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn
          fab
          icon="keyboard_arrow_up"
          :color="$q.dark.mode ? 'grey600' : 'mygrey'"
          :text-color="$q.dark.mode ? 'grey300' : 'dark'"
          dense
          padding="7px"
        />
      </q-page-scroller>

      <BookingDetails
        ref="ref_booking"
        :cancel_reason="BookingStore.cancel_reason"
        @after-cancel="afterCancel"
      ></BookingDetails>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import "swiper/css";
import { useDataStore } from "stores/DataStore";
import { useBookingStore } from "stores/BookingStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "BookingList",
  components: {
    BookingDetails: defineAsyncComponent(() =>
      import("components/BookingDetails.vue")
    ),
  },
  setup() {
    const DataStore = useDataStore();
    const BookingStore = useBookingStore();
    return { DataStore, BookingStore };
  },
  data() {
    return {
      isScrolled: false,
      tab: "all",
      data: [],
      page: 0,
      loading: false,
      loading2: true,
    };
  },
  mounted() {
    this.fetchSummary();
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    afterCancel(value, index) {
      if (this.data[index]) {
        this.data[index] = value;
      }
    },
    viewDetails(value, index) {
      this.$refs.ref_booking.ViewDetails(value, index);
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    tabChange(data) {
      this.page = 0;
      this.data = [];
    },
    refresh(done) {
      done();
      this.resetPage();
    },
    resetPage() {
      this.page = 0;
      this.data = [];
      this.$refs.nscroll?.[0]?.reset();
      this.$refs.nscroll?.[0]?.resume();
      this.$refs.nscroll?.[0]?.trigger();

      this.BookingStore.summary = null;
      this.fetchSummary();
    },
    async fetchSummary() {
      try {
        this.loading2 = true;
        if (!this.BookingStore.summary) {
          await this.BookingStore.getBookingSummary();
        }
      } catch (error) {
      } finally {
        this.loading2 = false;
      }
    },
    async fetchData(index, done) {
      if (this.loading) {
        done();
        return;
      }
      this.loading = true;
      this.page = index;

      try {
        const results = await APIinterface.fetchGet(
          `${this.BookingStore.getAPI()}/BookingList`,
          {
            page: index,
            status: this.tab,
          }
        );

        this.data = [...this.data, ...results.details.data];
        if (results.code == 3) {
          this.$refs.nscroll?.[0]?.stop();
        }
      } catch (error) {
        console.log("error", error);
        this.loading = false;
        this.$refs.nscroll?.[0]?.stop();
      } finally {
        this.loading = false;
        done();
      }
    },
    //
  },
};
</script>

<style scoped>
.custom-tabs .q-tab {
  margin-right: 16px; /* Add spacing between tabs */
}

.custom-tabs .q-tab:last-child {
  margin-right: 0; /* Remove margin for the last tab */
}
.q-tabs__content--align-justify .q-tab {
  flex: initial !important;
}
.circle-blue {
  border-radius: 50%;
  height: 50px;
  width: 50px;
  position: absolute;
  top: -10px;
  right: -20px;
}
</style>
