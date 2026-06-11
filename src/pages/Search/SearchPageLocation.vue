<template>
  <q-header
    class="tagam-search-header q-pt-xs tagam-text-main"
    :class="{ 'shadow-bottom': isScrolled }"
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
      <q-input
        v-model="q"
        ref="ref_search"
        :placeholder="$t('What are you looking for')"
        dense
        outlined
        color="primary"
        bg-color="transparent"
        class="full-width input-borderless"
        :loading="awaitingSearch"
        rounded
        clearable
        @clear="clearSearch"
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
  </q-header>

  <q-page class="tagam-search-location-page">
    <q-scroll-observer @scroll="onScroll" />
    <template v-if="isSearching">
      <q-infinite-scroll
        ref="nscroll"
        @load="getMerchantFeed"
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

          <q-list class="no-wrap">
            <template v-for="items in restaurants" :key="items">
              <q-item
                clickable
                v-ripple
                @click.stop="
                  this.$router.push({
                    name: 'menu',
                    params: {
                      slug: items.restaurant_slug,
                    },
                  })
                "
              >
                <MerchantListTpl
                  :items="items"
                  :enabled_review="DataStore.enabled_review"
                />
              </q-item>
              <div v-if="items.items_list" class="q-pl-md q-pr-md q-mb-md">
                <CarouselItems
                  :items="items.items_list ? items.items_list : null"
                ></CarouselItems>
              </div>
              <div class="q-pl-md q-pr-md">
                <q-separator></q-separator>
              </div>
            </template>
          </q-list>

          <template v-if="!hasMore && !loading && hasData">
            <div class="row q-gutter-x-sm justify-center q-my-md">
              <div class="text-subtitle2 tagam-text-muted">
                {{ $t("end of results") }}
              </div>
            </div>
          </template>
        </template>

        <template v-slot:loading>
          <div
            class="row q-gutter-x-sm justify-center q-my-md"
            :class="{ 'absolute-center text-center full-width': current_page == 1, }"
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

      <q-list separator>
        <template v-for="items in data" :key="items">
          <q-item clickable v-ripple @click="setRecentSeachs(items, true)">
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
      <div class="q-pa-md">
        <div
          v-if="DataStorePersisted.recent_searches.length > 0"
          class="text-subtitle2 text-weight-bold q-mb-md"
        >
          {{ $t("Recent Searches") }}
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
                  <q-icon name="restore" color="blue-grey-6" size="sm"></q-icon>
                </div>
                <div class="text-caption tagam-text-main">
                  <span v-html="items.name"></span>
                </div>
              </div>
            </router-link>
          </template>
        </div>

        <q-space class="q-pa-md"></q-space>

        <div
          v-if="DataStore.recommended_data"
          class="text-subtitle2 text-weight-bold q-mb-md"
        >
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
              <q-card flat>
                <q-responsive style="height: 90px">
                  <q-img
                    :src="items.url_logo"
                    lazy
                    fit="cover"
                    class="radius8 tagam-restaurant-logo-stretch"
                    spinner-color="amber"
                    spinner-size="sm"
                  />
                </q-responsive>
                <q-space class="q-pa-xs"></q-space>
                <div class="text-subtitle2 ellipsis-2-lines text-weight-bold">
                  {{ items.restaurant_name }}
                </div>
                <div class="ellipsis text-caption">
                  <template v-if="items.estimation || items.estimation2">
                    {{ items.estimation2 ?? items.estimation }}
                  </template>
                  <template v-else>
                    {{ items?.distance_pretty ?? "" }}
                  </template>
                </div>
              </q-card>
            </router-link>
          </div>
        </div>
        <!-- RECOMENDED -->

        <!-- default content -->
      </div>
    </template>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import config from "src/api/config";
import auth from "src/api/auth";
import { listenVoiceSearch } from "src/utils/voiceSearch";

export default {
  name: "SearchPageLocation",
  components: {
    MerchantListTpl: defineAsyncComponent(() =>
      import("components/MerchantListTpl.vue")
    ),
    CarouselItems: defineAsyncComponent(() =>
      import("components/CarouselItems.vue")
    ),
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
  },
  data() {
    return {
      isScrolled: false,
      q: "",
      searchString: "",
      awaitingSearch: false,
      data: [],
      filters: [],
      location_data: null,
      scroll_disabled: true,
      hasMore: true,
      loading: false,
      current_page: 1,
      restaurants: [],
      isListening: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, DataStorePersisted };
  },
  mounted() {
    this.location_data = this.DataStorePersisted.getLocation;
    this.fetchRecommded();

    if (this.DataStore.search_saved.length > 0) {
      console.log("has data");
      this.restaurants = this.DataStore.search_saved;
      this.current_page = this.DataStore.search_saved_currentpage;
      this.hasMore = this.DataStore.search_saved_has_more;
      this.q = this.DataStore.search_query;
    } else {
      console.log("no data");
      this.clearSearch();
    }

    if (this.$route.query.voice || this.DataStore.voice_search_requested) {
      this.DataStore.voice_search_requested = false;
      this.$nextTick(() => {
        this.startVoiceSearch();
      });
    }
  },
  beforeUnmount() {
    this.DataStore.search_query = this.q;
    this.DataStore.search_saved = this.restaurants;
    this.DataStore.search_saved_currentpage = this.current_page;
    this.DataStore.search_saved_has_more = this.hasMore;
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
    hasData() {
      return Object.keys(this.restaurants).length > 0;
    },
  },
  methods: {
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    clearSearch() {
      this.scroll_disabled = true;
      this.restaurants = [];
      this.current_page = 1;
      this.hasMore = true;
    },
    async getMerchantFeed(index, done) {
      console.log("getMerchantFeed", index);
      try {
        if (this.loading) {
          return;
        }
        if (!this.hasMore) {
          this.scroll_disabled = true;
          done(true);
          return;
        }

        this.params = {};
        this.params.page = this.current_page;
        this.params.state_id = this.location_data?.state_id || "";
        this.params.city_id = this.location_data?.city_id || "";
        this.params.area_id = this.location_data?.area_id || "";
        this.params.postal_id = this.location_data?.postal_id || "";
        this.params.query = this.q;
        this.params.payload = JSON.stringify(["items_search"]);

        this.loading = true;
        const methods = auth.authenticated() ? "getFeedAuthV1" : "getFeedV1";

        const response = await APIinterface.fetchGet(
          `${config.api_location}/${methods}`,
          this.params
        );
        this.current_page++;
        console.log("response", response);
        this.restaurants = [...this.restaurants, ...response.details.data];

        if (response.details.is_last_page) {
          this.hasMore = false;
          done(true);
          return;
        }
        done();
      } catch (error) {
        this.hasMore = false;
        done(true);
      } finally {
        this.loading = false;
      }
    },
    async setRecentSeachs(items, isWrite) {
      this.q = items.name;
      this.data = [];

      console.log("setRecentSeachs");
      this.restaurants = [];
      this.scroll_disabled = false;
      this.current_page = 1;
      this.hasMore = true;

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

      this.$nextTick(() => {
        this.$refs.nscroll?.resume?.();
        this.$refs.nscroll?.trigger?.();
      });
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
    async fetchRecommded() {
      try {
        if (this.DataStore.recommended_data) {
          return;
        }

        let params = {};
        params.state_id = this.location_data?.state_id || "";
        params.city_id = this.location_data?.city_id || "";
        params.area_id = this.location_data?.area_id || "";
        params.postal_id = this.location_data?.postal_id || "";
        params.featured = JSON.stringify(["popular"]);

        const response = await APIinterface.fetchGet(
          `${config.api_location}/getFeedV1`,
          params
        );
        this.DataStore.recommended_data = response.details.data;
      } catch (error) {
      } finally {
      }
    },
    fetchSuggestions() {
      if (!this.q || this.q.trim() === "") {
        this.clearSearch();
        this.data = [];
        this.awaitingSearch = false;
        return;
      }

      if (!this.awaitingSearch) {
        this.awaitingSearch = true;
        setTimeout(async () => {
          this.filters = [];
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
        this.data = result.details.data;
        this.data = [...this.data, searchData];
      } catch (error) {
        this.data = [];
        this.data.push(searchData);
      } finally {
      }
    },
  },
};
</script>







