<template>
  <div v-if="DataStore.loading_cuisine" class="row q-gutter-sm items-center">
    <div v-for="i in 3" :key="i" class="col">
      <q-skeleton type="QBtn" class="full-width" height="50px" />
    </div>
  </div>
  <template v-else>
    <div
      v-if="selectable"
      ref="cuisineFilter"
      class="tagam-home-cuisine-filter"
      :class="{
        'tagam-home-cuisine-filter--active': hasSelectedCuisine,
        'tagam-home-cuisine-filter--compact': shouldCompact,
      }"
    >
      <div class="tagam-home-cuisine-shell">
        <button
          type="button"
          class="tagam-home-cuisine-card tagam-home-cuisine-card--pinned"
          :class="{ 'is-active': !hasSelectedCuisine }"
          @click="clearCuisine"
        >
          <span class="tagam-home-cuisine-media">
            <img src="/icons/tagam-app-logo-512.png" alt="" />
          </span>
          <span class="tagam-home-cuisine-label">{{ $t("All") }}</span>
        </button>

        <div class="tagam-home-cuisine-scroll">
          <button
            v-for="items in DataStore.cuisine"
            :key="items.cuisine_id"
            type="button"
            class="tagam-home-cuisine-card"
            :class="{ 'is-active': isCuisineSelected(items.cuisine_id) }"
            @click="toggleCuisine(items)"
          >
            <span class="tagam-home-cuisine-media">
              <img
                v-if="items.featured_image"
                :src="items.featured_image"
                alt=""
              />
              <span v-else class="tagam-home-cuisine-fallback">
                {{ cuisineInitial(items.cuisine_name) }}
              </span>
            </span>
            <span
              class="tagam-home-cuisine-label"
              :class="cuisineLabelClass(items.cuisine_name)"
            >
              {{ items.cuisine_name }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <swiper
      v-else-if="DataStore.cuisine"
      :slidesPerView="$q.screen.lt.sm ? 3.25 : 5.25"
      :spaceBetween="10"
      @swiper="onSwiper"
      class="q-mb-md"
    >
      <swiper-slide
        v-for="items in DataStore.cuisine"
        :key="items"
        class="text-center"
      >
        <router-link :to="getCuisineLink(items)" class="tagam-cuisine-card">
          <div class="tagam-cuisine-image">
            <img :src="items.featured_image" alt="" />
          </div>
          <div class="tagam-cuisine-name ellipsis">
            {{ items.cuisine_name }}
          </div>
        </router-link>
      </swiper-slide>
    </swiper>
  </template>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";

export default {
  name: "CuisineCarousel",
  props: {
    design: [String, Number],
    search_mode: String,
    selectable: Boolean,
    selectedCuisine: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:selectedCuisine", "after-select", "afterGetdata"],
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
      slide: 0,
      data: [],
      loading: true,
      isStickyCompact: false,
      compactScrollHandler: null,
      compactSyncTimer: null,
    };
  },
  mounted() {
    if (!this.DataStore.hasDataCuisine()) {
      this.DataStore.CuisineList();
    }
    if (this.selectable) {
      this.$nextTick(() => {
        this.compactScrollHandler = () => {
          this.updateStickyCompact();
        };
        window.addEventListener("scroll", this.compactScrollHandler, {
          passive: true,
        });
        window.addEventListener("resize", this.updateStickyCompact, {
          passive: true,
        });
        this.compactSyncTimer = window.setInterval(
          this.updateStickyCompact,
          120
        );
        this.compactScrollHandler();
      });
    }
  },
  beforeUnmount() {
    if (this.compactScrollHandler) {
      window.removeEventListener("scroll", this.compactScrollHandler);
    }
    if (this.compactSyncTimer) {
      window.clearInterval(this.compactSyncTimer);
    }
    window.removeEventListener("resize", this.updateStickyCompact);
  },
  methods: {
    updateStickyCompact() {
      const panel = this.$refs.cuisineFilter;
      if (!panel) {
        return;
      }
      if (this.hasSelectedCuisine) {
        this.isStickyCompact = true;
        return;
      }
      const top = parseFloat(getComputedStyle(panel).top);
      const stickyTop = Number.isNaN(top) ? 145 : top;
      const rect = panel.getBoundingClientRect();
      this.isStickyCompact = rect.top <= stickyTop + 120;
    },
    cuisineInitial(name) {
      return name ? name.trim().charAt(0).toUpperCase() : "T";
    },
    cuisineLabelClass(name) {
      const label = name ? name.trim() : "";
      return {
        "tagam-home-cuisine-label--compact":
          label.includes(" ") || label.length > 10,
      };
    },
    isCuisineSelected(cuisineId) {
      return this.selectedCuisine.includes(Number(cuisineId));
    },
    clearCuisine() {
      if (!this.hasSelectedCuisine) {
        return;
      }
      this.$emit("update:selectedCuisine", []);
      this.$emit("after-select", []);
      this.$nextTick(this.updateStickyCompact);
    },
    toggleCuisine(items) {
      const cuisineId = Number(items.cuisine_id);
      const next = this.isCuisineSelected(cuisineId)
        ? this.selectedCuisine.filter((id) => id !== cuisineId)
        : [...this.selectedCuisine, cuisineId];
      this.$emit("update:selectedCuisine", next);
      this.$emit("after-select", next);
    },
    getCuisineLink(items) {
      if (this.search_mode === "address") {
        return {
          name: "feed",
          query: {
            query: "all",
            cuisine_id: items.cuisine_id,
            cuisine_name: items.cuisine_name,
          },
        };
      } else if (this.search_mode === "location") {
        return {
          path: "feed/location",
          query: {
            cuisine_id: items.cuisine_id,
            cuisine_name: items.cuisine_name,
          },
        };
      }
    },
    CuisineList() {
      this.loading = true;
      APIinterface.CuisineList(4, "")
        .then((data) => {
          this.data = data.details.data;
          this.$emit("afterGetdata", data.details.data_raw);
        })
        .catch((error) => {
          APIinterface.notify("red-5", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
  computed: {
    hasSelectedCuisine() {
      return this.selectedCuisine.length > 0;
    },
    shouldCompact() {
      return this.hasSelectedCuisine || this.isStickyCompact;
    },
  },
};
</script>

<style lang="sass" scoped>
.tagam-home-cuisine-filter
  position: sticky
  top: var(--tagam-home-cuisine-sticky-top, 96px)
  z-index: 35
  margin: 0 -16px 2px
  padding: 10px 16px 4px
  background: linear-gradient(180deg, rgba(248, 250, 252, .74) 0%, rgba(248, 250, 252, .48) 82%, rgba(248, 250, 252, 0) 100%)
  backdrop-filter: blur(18px) saturate(1.18)
  -webkit-backdrop-filter: blur(18px) saturate(1.18)
  transition: padding 220ms ease, margin 220ms ease, box-shadow 220ms ease

.tagam-home-cuisine-shell
  display: grid
  grid-template-columns: 76px minmax(0, 1fr)
  gap: 10px
  align-items: stretch
  transition: grid-template-columns 220ms ease, gap 220ms ease

.tagam-home-cuisine-scroll
  display: flex
  gap: 10px
  min-width: 0
  overflow-x: auto
  padding-bottom: 2px
  scrollbar-width: none

.tagam-home-cuisine-scroll::-webkit-scrollbar
  display: none

.tagam-home-cuisine-card
  position: relative
  box-sizing: border-box
  flex: 0 0 76px
  width: 76px
  height: 98px
  padding: 8px 7px
  border: 1px solid var(--tagam-border)
  border-radius: 18px
  background: var(--tagam-surface)
  color: var(--tagam-text)
  box-shadow: var(--tagam-shadow-soft)
  text-align: center
  cursor: pointer
  transition: flex-basis 220ms ease, width 220ms ease, height 220ms ease, padding 220ms ease, border-radius 220ms ease, transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease

.tagam-home-cuisine-card--pinned
  flex-basis: auto
  width: 76px

.tagam-home-cuisine-card:active
  transform: scale(.97)

.tagam-home-cuisine-card.is-active
  border-color: rgba(255, 107, 53, .46)
  background: var(--tagam-primary-soft)
  box-shadow: 0 16px 34px rgba(255, 107, 53, .16)

.tagam-home-cuisine-media
  display: flex
  align-items: center
  justify-content: center
  width: 46px
  height: 46px
  margin: 0 auto 6px
  border-radius: 15px
  overflow: hidden
  background: var(--tagam-surface-muted)
  transition: width 220ms ease, height 220ms ease, border-radius 220ms ease, margin 220ms ease

.tagam-home-cuisine-media img
  display: block
  width: 100%
  height: 100%
  object-fit: contain
  padding: 5px

.tagam-home-cuisine-fallback
  font-size: 22px
  font-weight: 900
  color: var(--tagam-primary)

.tagam-home-cuisine-label
  display: block
  min-height: 24px
  font-size: 12px
  font-weight: 900
  line-height: 1.15
  color: var(--tagam-text)
  overflow: hidden
  text-overflow: ellipsis
  display: -webkit-box
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical
  transition: font-size 220ms ease, min-height 220ms ease

.tagam-home-cuisine-label--compact
  font-size: 10.5px
  line-height: 1.1

body.body--dark .tagam-home-cuisine-filter
  background: linear-gradient(180deg, rgba(18, 20, 24, .68) 0%, rgba(18, 20, 24, .44) 82%, rgba(18, 20, 24, 0) 100%)

.tagam-home-cuisine-filter--compact
  padding-top: 7px
  padding-bottom: 2px
  margin-bottom: 0
  box-shadow: 0 12px 28px rgba(15, 23, 42, .08)

.tagam-home-cuisine-filter--compact .tagam-home-cuisine-shell
  grid-template-columns: 58px minmax(0, 1fr) !important
  gap: 7px !important

.tagam-home-cuisine-filter--compact .tagam-home-cuisine-scroll
  gap: 7px !important

.tagam-home-cuisine-filter--compact .tagam-home-cuisine-card
  flex-basis: 58px !important
  width: 58px !important
  height: 58px !important
  padding: 4px 4px !important
  border-radius: 14px !important
  box-shadow: 0 10px 22px rgba(15, 23, 42, .08) !important

.tagam-home-cuisine-filter--compact .tagam-home-cuisine-card--pinned
  width: 58px !important

.tagam-home-cuisine-filter--compact .tagam-home-cuisine-media
  width: 28px !important
  height: 28px !important
  margin-bottom: 2px !important
  border-radius: 10px !important

.tagam-home-cuisine-filter--compact .tagam-home-cuisine-label
  min-height: 13px !important
  font-size: 9px !important
  line-height: 1.05 !important
  -webkit-line-clamp: 1

.tagam-home-cuisine-filter--compact .tagam-home-cuisine-label--compact
  font-size: 8px

.tagam-cuisine-card
  display: block
  min-height: 104px
  padding: 8px 7px
  border: 1px solid var(--tagam-border)
  border-radius: var(--tagam-radius-card)
  background: var(--tagam-surface)
  color: var(--tagam-text)
  box-shadow: var(--tagam-shadow-soft)
  transform: translateZ(0)
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease

.tagam-cuisine-card:hover
  transform: translateY(-2px)
  box-shadow: var(--tagam-shadow)
  border-color: rgba(255, 107, 53, 0.26)

.tagam-cuisine-image
  width: 58px
  height: 58px
  margin: 0 auto 7px
  border-radius: 18px
  overflow: hidden
  background: var(--tagam-surface-muted)

.tagam-cuisine-image img
  display: block
  width: 100%
  height: 100%
  object-fit: cover

.tagam-cuisine-name
  font-size: 12px
  font-weight: 800
  color: var(--tagam-text)
</style>



