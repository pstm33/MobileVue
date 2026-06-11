<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header
      class="tagam-account-header" :class="{ 'border-bottom': !isScrolled, 'shadow-bottom': isScrolled, }"
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
        <q-toolbar-title class="text-subtitle2 text-weight-bold">
          {{ getPageTitle }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page padding class="tagam-legal-render-page">
      <q-scroll-observer @scroll="onScroll" />

      <template v-if="loading">
        <div class="absolute-center flex flex-center q-gutter-x-sm">
          <q-spinner-ios size="sm" />
          <div class="text-subtitle1 tagam-text-muted">{{ $t("Loading") }}...</div>
        </div>
      </template>
      <template v-else-if="!data">
        <NoResults
          :message="$t('Page Not Found')"
          :description="$t('page_not_found')"
        ></NoResults>
      </template>
      <template v-else>
        <div v-html="getPageContent"></div>
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "PageRender",
  components: {
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
  },
  data() {
    return {
      loading: false,
      isScrolled: false,
      data: null,
    };
  },
  mounted() {
    this.fetchPage();
  },
  computed: {
    getPageTitle() {
      return this.data?.title || null;
    },
    getPageContent() {
      return this.data?.long_content || null;
    },
  },
  methods: {
    async fetchPage() {
      try {
        this.loading = true;
        const results = await APIinterface.fetchDataPost(
          "getPage",
          "page_id=" + this.$route.params.page_id
        );
        console.log("results", results);
        this.data = results.details;
      } catch (error) {
      } finally {
        this.loading = false;
      }
    },
    refresh(done) {
      done();
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
  },
};
</script>







