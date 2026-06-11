<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      :class="{ 'tagam-surface-elevated text-white': $q.dark.mode, 'tagam-surface tagam-text-main': !$q.dark.mode, 'border-bottom': !isScrolled, 'shadow-bottom': isScrolled, }"
    >
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          flat
          round
          dense
          icon="eva-arrow-back-outline"
          class="q-mr-sm"
          :color="$q.dark.mode ? 'white' : 'dark'"
        />
        <q-toolbar-title class="text-weight-bold">
          {{ $t("Ratings and reviews") }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="tagam-menu-review-list-page">
      <q-scroll-observer @scroll="onScroll" />
      <q-space class="q-pa-lg"></q-space>

      <q-infinite-scroll
        ref="nscroll"
        @load="getReview"
        :offset="250"
        :disable="scroll_disabled"
      >
        <template v-slot:default>
          <DIV class="q-pl-md q-pr-md q-pt-sm">
            <template v-if="!hasMore && !hasData">
              <NoResults
                :message="$t('noResults')"
                :description="$t('noResultsDesc')"
              ></NoResults>
            </template>
          </DIV>

          <q-list class="no-wrap" dense>
            <template v-for="items in data" :key="items">
              <q-item clickable v-ripple>
                <q-item-section side top>
                  <div class="flex items-center q-gutter-x-md">
                    <div>
                      <q-avatar
                        v-if="items.as_anonymous"
                        color="secondary"
                        text-color="white"
                        size="lg"
                      >
                        {{ items?.fullname.charAt(0) }}
                      </q-avatar>
                      <q-avatar v-else size="lg">
                        <img :src="items.url_image" />
                      </q-avatar>
                    </div>
                    <div class="text-weight-bold text-subtitle2">
                      {{ items.fullname || $t("No name") }}
                    </div>
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <div class="flex items-center q-gutter-x-md text-caption">
                  <div>
                    <q-rating
                      :model-value="items.rating || 0"
                      size="1.3em"
                      color="disabled"
                      color-selected="amber-5"
                      icon="star"
                      icon-selected="star"
                    />
                  </div>
                  <div>{{ items.date_created }}</div>
                </div>
              </q-item>
              <q-item>
                <q-item-label lines="3">{{ items.review }}</q-item-label>
              </q-item>
              <q-space class="q-pa-md"></q-space>
            </template>
          </q-list>
        </template>
        <template v-slot:loading>
          <div
            class="row q-gutter-x-sm justify-center q-my-md"
            :class="{ 'absolute-center text-center full-width ': current_page == 1, }"
          >
            <q-circular-progress
              indeterminate
              rounded
              size="sm"
              color="primary"
            />
            <div class="text-subtitle1 tagam-text-muted">{{ $t("Loading") }}...</div>
          </div>
        </template>
      </q-infinite-scroll>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
       class="tagam-menu-review-list-page">
        <q-btn
          fab
          icon="keyboard_arrow_up"
          :color="$q.dark.mode ? 'grey600' : 'mygrey'"
          :text-color="$q.dark.mode ? 'grey300' : 'dark'"
          dense
          padding="7px"
        />
      </q-page-scroller>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "ReviewList",
  data() {
    return {
      loading: false,
      data: [],
      isScrolled: false,
      current_page: 1,
      scroll_disabled: true,
      hasMore: true,
      merchant_id: null,
    };
  },
  mounted() {
    this.merchant_id = this.$route.query?.id ?? null;
    this.scroll_disabled = false;
  },
  computed: {
    hasData() {
      if (this.data.length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    onScroll(info) {
      if (!info) {
        return;
      }
      this.isScrolled = info.position.top > 140;
    },
    refresh(done) {
      setTimeout(() => {
        done();
      }, 100);
      this.resetPagination();
    },
    resetPagination() {
      this.data = [];
      this.current_page = 1;
      this.hasMore = true;
      this.scroll_disabled = false;
      this.$nextTick(() => {
        this.$refs.nscroll?.resume?.();
        this.$refs.nscroll?.trigger?.();
      });
    },
    async getReview(index, done) {
      try {
        if (this.loading) {
          return;
        }
        if (!this.hasMore) {
          this.scroll_disabled = true;
          done(true);
          return;
        }
        if (!this.merchant_id) {
          this.scroll_disabled = true;
          return;
        }

        this.loading = true;
        const params = new URLSearchParams({
          page: this.current_page,
          merchant_id: this.merchant_id,
        }).toString();
        const response = await APIinterface.fetchGetRequest(
          "getReview",
          params
        );
        console.log("response", response);

        this.current_page++;
        this.data = [...this.data, ...response.details.data];
        if (response.details.is_last_page) {
          this.hasMore = false;
          this.scroll_disabled = true;
          done(true);
          return;
        }
        done();
      } catch (error) {
        console.log("error", error);
        this.hasMore = false;
        this.scroll_disabled = true;
        done(true);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>







