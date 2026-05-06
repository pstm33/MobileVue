<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header reveal reveal-offset="50" class="bg-transparent q-pa-sm">
      <div class="tagam-account-header-shell">
        <q-toolbar class="q-px-xs">
          <q-btn
            @click="$router.back()"
            flat
            round
            dense
            icon="las la-angle-left"
            class="q-mr-sm"
            :color="$q.dark.mode ? 'white' : 'dark'"
          />
          <q-toolbar-title class="text-weight-bold">{{
            $t("Notifications")
          }}</q-toolbar-title>
          <q-btn
            v-if="hasData"
            flat
            round
            dense
            icon="eva-trash-outline"
            color="disabled"
            @click="ConfirmDelete"
          />
        </q-toolbar>
      </div>
    </q-header>
    <q-page class="tagam-page-shell q-px-md q-pb-xl page-notification">
      <q-scroll-observer @scroll="onScroll" />
      <section class="tagam-section-shell q-mt-lg">
        <div class="tagam-section-heading tagam-section-heading--stacked">
          <div>
            <div class="tagam-section-heading__eyebrow">
              {{ $t("Preferences") }}
            </div>
            <div class="tagam-section-heading__title">
              {{ $t("Notifications") }}
            </div>
          </div>
          <div class="tagam-section-heading__meta">
            {{ $t("Recent updates, alerts, and order activity") }}
          </div>
        </div>

      <q-infinite-scroll ref="nscroll" @load="getNotifications" :offset="100">
        <template v-slot:default>
          <template v-if="!hasData && !loading">
            <NoResults
              :message="$t('No notifications')"
              :description="$t('If there is notification it will show here')"
            ></NoResults>
          </template>
          <template v-else>
            <div class="tagam-list-card q-pa-sm">
            <template v-for="(item, index) in getData" :key="item">
              <q-slide-item
                ref="ref_virtualscroll"
                @right="onSlideRight(index, item)"
                left-color="white"
                right-color="white"
                style="border: none"
              >
                <template v-slot:right>
                  <q-icon name="eva-trash-2-outline" color="red" />
                </template>

                <q-card class="border-grey q-mb-sm tagam-list-card" flat>
                  <q-item clickable v-ripple:purple class="tagam-account-row">
                    <q-item-section top avatar>
                      <q-avatar
                        :color="getColor(item.notification_type)"
                        text-color="white"
                        :icon="getIcon(item.notification_type)"
                      />
                    </q-item-section>
                    <q-item-section top>
                      <q-item-label class="text-weight-medium text-subtitle2">
                        {{ item.message }}
                      </q-item-label>
                      <q-item-label caption class="tagam-page-copy">
                        {{ item.date }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-card>
              </q-slide-item>
            </template>
            </div>
          </template>
        </template>

        <template v-slot:loading>
          <q-space class="q-pa-md"></q-space>
          <div
            class="row q-gutter-x-sm justify-center q-my-md"
            :class="{
              'absolute-center text-center full-width': page == 1,
              'absolute-bottom text-center full-width': page != 1,
            }"
          >
            <q-spinner-ios size="sm" />
            <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
          </div>
        </template>
      </q-infinite-scroll>
      </section>

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

      <ConfirmDelete
        ref="ref_confirm"
        @after-confirm="afterConfirm"
      ></ConfirmDelete>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "NotificationsPage",
  components: {
    ConfirmDelete: defineAsyncComponent(() =>
      import("components/ConfirmDelete.vue")
    ),
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
  },
  data() {
    return {
      loading: false,
      page: 0,
      isScrolled: false,
      no_more_data: false,
      data: [],
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  computed: {
    getData() {
      return this.data || null;
    },
    hasData() {
      return this.data.length > 0;
    },
  },
  mounted() {
    if (this.DataStore.isNotiLoaded) {
      this.DataStore.notificationData = this.DataStore.notificationData.splice(
        0,
        20
      );
      this.DataStore.notificationPage = 1;
      this.data = [...this.DataStore.notificationData];
      this.page = this.DataStore.notificationPage;
      this.$refs?.nscroll?.setIndex(this.DataStore.notificationPage);
    }
  },
  methods: {
    ConfirmDelete() {
      this.$refs.ref_confirm.ConfirmDelete({
        id: null,
        icon: "eva-info-outline",
        confirm: this.$t("Delete all notifications?"),
        title: this.$t("Are you sure?"),
        subtitle: this.$t("this will delete all notifications"),
      });
    },
    async afterConfirm() {
      this.$refs.ref_confirm.modal = false;
      console.log("afterConfirm");
      try {
        const results = await APIinterface.fetchDataByTokenGet(
          "deleteNotifications"
        );
        this.resetPage();
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
      }
    },
    async onSlideRight(index, item) {
      this.data.splice(index, 1);
      this.DataStore.notificationData.splice(index, 1);

      const params = new URLSearchParams({
        uuid: item.notification_uuid,
      }).toString();
      await APIinterface.fetchDataByTokenPost("deleteNotification", params);
    },
    getIcon(value) {
      if (value == "booking") {
        return "eva-calendar-outline";
      } else if (value == "order_update") {
        return "eva-shopping-cart-outline";
      } else {
        return "eva-bell-outline";
      }
    },
    getColor(value) {
      if (value == "booking") {
        return "secondary";
      } else if (value == "order_update") {
        return "amber";
      } else {
        return "red";
      }
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    refresh(done) {
      setTimeout(() => {
        done();
      }, 100);
      this.resetPage();
    },
    resetPage() {
      this.no_more_data = false;
      this.page = 0;
      this.data = [];
      this.DataStore.notificationData = [];
      this.DataStore.notificationPage = 0;
      this.$refs?.nscroll?.reset();
      this.$refs?.nscroll?.resume();
      this.$refs?.nscroll?.trigger();
    },
    async getNotifications(index, done) {
      try {
        if (this.loading || this.no_more_data) {
          done();
          return;
        }

        if (this.DataStore.notificationPage >= index) {
          done();
          return;
        }

        this.loading = true;
        this.page = index;
        this.DataStore.notificationPage = index;

        const results = await APIinterface.fetchDataByTokenGet(
          "getNotification",
          {
            page: index,
          }
        );

        this.data = [...this.data, ...results.details.data];
        this.DataStore.notificationData = [...this.data];
        this.DataStore.isNotiLoaded = true;

        if (results.code == 3) {
          this.no_more_data = true;
          this.$refs?.nscroll?.stop();
        }
      } catch (error) {
        this.loading = false;
        this.$refs?.nscroll?.stop();
      } finally {
        this.loading = false;
        done();
      }
    },
  },
};
</script>
