<template>
  <q-dialog
    v-model="DataStore.modal_search"
    transition-show="fade"
    transition-hide="fade"
    @show="onShow"
    @before-hide="onBeforeHide"
  >
    <q-card class="tagam-search-dialog tagam-text-main">
      <div class="tagam-search-dialog-header tagam-text-main q-pt-xs">
        <q-toolbar>
          <q-btn
            @click="DataStore.modal_search = false"
            dense
            icon="eva-arrow-back-outline"
            size="md"
            unelevated
            flat
            class="q-mr-sm"
          />
          <q-input
            v-model="q"
            ref="ref_search"
            :placeholder="$t('What are you looking for')"
            dense
            outlined
            color="primary"
            class="full-width input-borderless"
            :loading="awaitingSearch"
            rounded
            clearable
            @clear="onShow"
            @update:model-value="fetchSuggestions"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="eva-mic-outline"
                :loading="isListening"
                :aria-label="$t('Voice search')"
                @click.stop="startVoiceSearch"
              />
            </template>
          </q-input>
        </q-toolbar>
      </div>

      <!-- content -->
      <div class="tagam-search-dialog-body q-pa-md">
        <template v-if="isSearching">
          <template v-if="hasFilters">
            <FeedResults
              ref="ref_feed_results"
              title=""
              :filters="getFilters"
              :full_page="false"
              :no_data_label="$t('no_data_label')"
              :currency_code="DataStorePersisted.useCurrency"
              :coordinates="DataStorePersisted.coordinates"
              :search_mode="DataStore.getSearchMode"
              :islogin="isLogin"
            />
          </template>

          <q-list separator>
            <template v-for="items in data" :key="items">
              <q-item
                clickable
                v-ripple
                class="tagam-suggestion-row"
                @click="setRecentSeachs(items, true)"
              >
                <q-item-section avatar>
                  <q-icon color="grey-6" name="eva-search-outline" />
                </q-item-section>
                <q-item-section>
                  <span v-html="items.name"></span>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </template>

        <template v-else>
          <!-- default content -->

          <div class="text-subtitle2 text-weight-bold q-mb-md">
            {{ $t("Recent searches") }}
          </div>

          <div class="flex items-center q-gutter-sm">
            <template
              v-for="items in DataStorePersisted.recent_searches"
              :key="items"
            >
              <router-link to="" @click="setRecentSeachs(items, false)">
                <div
                  class="q-pa-xs q-pr-sm tagam-surface-muted radius28 flex items-center q-gutter-x-xs"
                >
                  <div>
                    <q-icon name="restore" color="grey" size="sm"></q-icon>
                  </div>
                  <div class="text-caption tagam-text-main">
                    <span v-html="items.name"></span>
                  </div>
                </div>
              </router-link>
            </template>
          </div>

          <q-space class="q-pa-md"></q-space>

          <div class="text-subtitle2 text-weight-bold q-mb-md">
            {{ $t("Recommended") }}
          </div>

          <!-- RECOMENDED -->

          <template v-if="DataStore.recommended_loading">
            <div class="q-gutter-md row items-start">
              <div class="col-4 q-pa-sm" v-for="items in 4" :key="items">
                <q-skeleton height="90px" square />
              </div>
            </div>
          </template>

          <div class="row">
            <div
              class="col-4 q-pa-sm"
              v-for="items in DataStore.recommended_data"
              :key="items"
            >
              <router-link
                to=""
                @click.stop="
                  this.$router.push({
                    name: 'menu',
                    params: {
                      slug: items.restaurant_slug,
                    },
                  })
                "
                class="tagam-text-main"
              >
                <q-card flat class="tagam-search-reco-card">
                  <q-responsive ratio="2">
                    <q-img
                      :src="items.url_banner || items.url_header || items.url_logo"
                      lazy
                      fit="cover"
                      class="tagam-search-reco-image tagam-restaurant-cover-stretch"
                      spinner-color="amber"
                      spinner-size="sm"
                    />
                  </q-responsive>
                </q-card>
                <div class="text-subtitle1 ellipsis-2-lines">
                  {{ items.restaurant_name }}
                </div>
                <div class="flex items-center q-gutter-x-sm">
                  <div v-if="DataStore.enabled_review">
                    <q-chip
                      size="sm"
                      color="secondary"
                      :text-color="$q.dark.mode ? 'grey300' : 'secondary'"
                      icon="star_border"
                      class="no-padding q-ma-none transparent"
                    >
                      <span
                        class="text-caption"
                        :class="{
                          'tagam-text-muted': $q.dark.mode,
                          'tagam-text-main': !$q.dark.mode,
                        }"
                      >
                        <template v-if="items.reviews">
                          {{ items.reviews.ratings }}
                        </template>
                        <template> 0.0 </template>
                      </span>
                    </q-chip>
                  </div>
                  <div class="text-caption">
                    <div>{{ items.distance_pretty }}</div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
          <!-- RECOMENDED -->

          <!-- default content -->
        </template>
      </div>

      <!-- content -->
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { listenVoiceSearch } from "src/utils/voiceSearch";
import auth from "src/api/auth";

export default {
  name: "SearchAll",
  components: {
    FeedResults: defineAsyncComponent(() =>
      import("components/FeedResults.vue")
    ),
  },
  data() {
    return {
      q: "",
      searchString: "",
      awaitingSearch: false,
      data: [],
      filters: [],
      place_id: null,
      isListening: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, DataStorePersisted };
  },
  mounted() {
    this.place_id = APIinterface.getStorage("place_id");
  },
  computed: {
    getFilters() {
      return this.filters;
    },
    hasFilters() {
      if (Object.keys(this.filters).length > 0) {
        return true;
      }
      return false;
    },
    isSearching() {
      return this.q;
    },
    isLogin() {
      return auth.authenticated();
    },
    isNoresults() {
      if (this.q && !this.awaitingSearch) {
        if (Object.keys(this.data).length > 0) {
        } else {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    async setRecentSeachs(items, isWrite) {
      this.q = items.name;
      this.data = [];

      console.log("setRecentSeachs");

      this.filters = {
        list_type: "all",
        sort_by: this.DataStore.filter_sortby,
        place_id: this.place_id,
        enabled_review: this.DataStore.enabled_review,
        currency_code: this.DataStorePersisted.useCurrency,
        payload: [
          "cuisine",
          "reviews",
          "estimation",
          "services",
          "items_min_max",
          "offers",
          "promo",
          "items_search",
        ],
        filters: {
          query: this.q,
        },
      };

      setTimeout(() => {
        this.$refs.ref_feed_results.resetData();
      }, 100);

      if (isWrite) {
        const exists = this.DataStorePersisted.recent_searches.some(
          (search) => search.name === items.name
        );
        if (!exists) {
          this.DataStorePersisted.recent_searches.unshift({
            name: items.name,
          });
          if (this.DataStorePersisted.recent_searches.length > 8) {
            this.DataStorePersisted.recent_searches.pop(); // Remove the oldest (last) entry
          }
        }
      }
    },
    onShow() {
      this.$refs.ref_search.focus();
      this.filters = [];

      this.DataStore.getRecommended({
        list_type: "featured",
        featured_id: "recommended",
        sort_by: "distance",
        place_id: this.place_id,
        enabled_review: this.DataStore.enabled_review,
        payload: [
          "cuisine",
          "reviews",
          "estimation",
          "services",
          "items_min_max",
          "offers",
          "promo",
          "items",
        ],
      });

      if (this.DataStore.voice_search_requested) {
        this.DataStore.voice_search_requested = false;
        this.$nextTick(() => {
          this.startVoiceSearch();
        });
      }
    },
    onBeforeHide() {
      console.log("onBeforeHide");
      this.data = [];
      this.q = "";
      this.filters = [];
      this.DataStore.clearData();
    },
    fetchSuggestions() {
      if (!this.q || this.q.trim() === "") {
        this.data = [];
        this.awaitingSearch = false; // Reset flag if no valid query
        return;
      }

      if (!this.awaitingSearch) {
        this.awaitingSearch = true;
        setTimeout(async () => {
          await this.searchSuggestion(this.q);
          this.awaitingSearch = false;
        }, 1000);
      }
    },
    async searchSuggestion(value) {
      let searchData = {
        result_type: "restaurant",
        name: this.q,
      };
      try {
        const result = await APIinterface.fetchGetRequest(
          "searchSuggestion",
          "q=" + value
        );
        this.data = Array.isArray(result?.details?.data)
          ? result.details.data
          : [];
        this.data = [...this.data, searchData];
      } catch (error) {
        this.data = [];
        this.data.push(searchData);
      } finally {
      }
    },
    async startVoiceSearch() {
      if (this.isListening) {
        return;
      }

      try {
        const transcript = await listenVoiceSearch({
          locale: this.$i18n.locale,
          onStart: () => {
            this.isListening = true;
          },
          onEnd: () => {
            this.isListening = false;
          },
        });
        await this.setRecentSeachs({ name: transcript }, true);
      } catch (error) {
        this.isListening = false;
        const key =
          error?.message === "voice_not_supported"
            ? "Voice search is not supported on this device"
            : "We could not hear you clearly";
        APIinterface.notify("dark", this.$t(key), "eva-mic-off-outline", this.$q);
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.tagam-search-dialog
  width: min(520px, calc(100vw - 24px))
  max-width: 520px
  max-height: min(78vh, 720px)
  background: var(--tagam-bg)
  border: 1px solid var(--tagam-border)
  border-radius: 28px
  box-shadow: var(--tagam-shadow-float)
  overflow: hidden

.tagam-search-dialog-header
  background: rgba(255, 255, 255, 0.92)
  backdrop-filter: blur(18px)
  border-bottom: 1px solid var(--tagam-border)

.tagam-search-dialog-body
  max-height: calc(min(78vh, 720px) - 64px)
  overflow-y: auto

.tagam-search-dialog :deep(.q-field__control)
  background: var(--tagam-surface-muted)
  border-radius: 999px

:global(body.body--dark) .tagam-search-dialog-header
  background: rgba(18, 20, 24, 0.9)

.tagam-suggestion-row
  margin: 6px 0
  border: 1px solid var(--tagam-border)
  border-radius: var(--tagam-radius-card)
  background: var(--tagam-surface)

.tagam-search-reco-card
  overflow: hidden
  border: 1px solid var(--tagam-border)
  border-radius: var(--tagam-radius-card)
  background: var(--tagam-surface)
  box-shadow: var(--tagam-shadow-soft)

.tagam-search-reco-image
  border-radius: 0 !important
</style>






