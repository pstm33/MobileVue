<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      :class="[ 'tagam-menu-header', classObject, { 'tagam-menu-header--at-hero': !headerChangeColor }, ]"
      v-if="!merchant_loading"
    >
      <q-toolbar class="tagam-menu-toolbar">
        <q-btn
          @click="$router.back()"
          round
          dense
          icon="eva-arrow-back-outline"
          class="tagam-menu-nav-btn tagam-icon-btn q-mr-sm"
          color="transparent"
          text-color="primary"
          size="md"
          unelevated
        />
        <q-toolbar-title v-if="headerChangeColor">
          <div class="text-subtitle2 text-weight-bold line-normal">
            {{ merchants?.restaurant_name }}
          </div>
          <div class="text-caption ellipsis line-normal">
            {{ merchants?.merchant_address }}
          </div>
        </q-toolbar-title>
        <q-space></q-space>
        <div v-if="merchant">
          <div class="tagam-menu-header-actions">
          <FavsResto
            ref="favs"
            :data="merchants"
            :active="merchants?.saved_store || false"
            :merchant_id="merchants?.merchant_id || ''"
            :layout="1"
            size="sm"
            @after-savefav="afterSavefav"
          />
          <ShareComponents
            ref="share"
            :title="merchants?.share.title"
            :text="merchants?.share.text"
            :url="merchants?.share.url"
            :dialogTitle="merchants?.share?.dialogTitle"
          />
          </div>
        </div>
      </q-toolbar>

      <div
        class="q-pl-md q-pr-md q-pb-sm row q-gutter-x-lg shadow-bottom"
        v-if="headerChangeColor"
      >
        <div class="col">
          <!-- <div
            class="tagam-surface-mutedx border-grey text-subtitle2 q-pa-sm radius28 flex justify-between cursor-pointer"
            @click="showCategory"
          >
            <div class="text-weight-regular q-pl-sm">{{ category }}</div>
            <div>
              <q-icon
                name="eva-arrow-ios-downward-outline"
                size="20px"
              ></q-icon>
            </div>
          </div> -->

            <div
            class="tagam-surface-muted border-grey text-subtitle2 q-pa-sm radius28 flex justify-between items-center cursor-pointer no-wrap"
            @click="showCategory"
          >
            <div class="text-weight-regular q-pl-sm ellipsis">
              {{ category }}
            </div>
            <div class="q-pl-sm">
              <q-icon name="eva-arrow-ios-downward-outline" size="20px" />
            </div>
          </div>
        </div>
        <div class="col-4">
          <div
            class="tagam-surface-muted border-grey text-subtitle2 q-pa-sm radius28 flex justify-center cursor-pointer"
            @click="showSearchMenu"
          >
            <div class="q-mr-sm">
              <q-icon name="eva-search-outline" size="20px"></q-icon>
            </div>
            <div class="text-weight-regular">{{ $t("Search") }}</div>
          </div>
        </div>
      </div>
    </q-header>
    <q-page
      class="tagam-menu-page"
      :class="{
        'tagam-menu-page--scrolled': headerChangeColor,
        'tagam-menu-page--compact-summary': !headerChangeColor,
      }"
    >
      <q-scroll-observer @scroll="onScroll" />

      <template v-if="merchant_loading">
        <MenuLoader loading_type="merchant_header"></MenuLoader>
      </template>
      <template v-else>
        <q-responsive class="tagam-menu-hero" ratio="2">
          <q-img
            :src="
              this.merchants?.has_header
                ? this.merchants?.url_header
                : this.merchants?.url_logo
            "
            lazy
            fit="fill"
            class="tagam-restaurant-cover-stretch"
          >
            <template v-slot:loading>
              <div class="text-primary">
                <q-spinner-ios size="sm" />
              </div>
            </template>
          </q-img>
        </q-responsive>
        <div class="tagam-restaurant-panel">
          <div
            class="tagam-restaurant-summary"
            clickable
            @click="this.$refs.ref_merchantinfo.modal = true"
            v-ripple:purple
          >
            <div class="tagam-restaurant-summary-main row items-center no-wrap">
              <div class="tagam-merchant-logo q-mr-md tagam-restaurant-logo-stretch">
                <img :src="merchants?.url_logo" alt="" />
              </div>
              <div class="col min-width-0">
                <div class="tagam-merchant-name ellipsis-2-lines">
                  {{ merchants?.restaurant_name || "" }}
                </div>
                <div class="tagam-merchant-address ellipsis">
                  {{ merchants?.merchant_address || "" }}
                </div>
              </div>
              <q-icon name="eva-chevron-right-outline" class="tagam-summary-chevron" />
            </div>

            <div class="tagam-merchant-metric-row">
              <div class="tagam-merchant-metric">
                <q-icon name="las la-clock" />
                <span>{{ merchant?.estimation_time }}</span>
              </div>
              <div v-if="search_mode == 'address'" class="tagam-merchant-metric">
                <q-icon name="las la-map-marker" />
                <span>{{ shortDistanceLabel }}</span>
              </div>
              <div v-if="DataStore.enabled_review" class="tagam-merchant-metric">
                <q-icon name="star_border" />
                <span>{{ merchants?.ratings || "0.0" }}</span>
              </div>
            </div>
          </div>

          <div class="tagam-menu-actions">
            <q-btn
              class="tagam-action-chip tagam-service-chip"
              rounded
              no-caps
              @click="this.$refs.delivery_sched.showSched(true)"
            >
              <div class="tagam-service-chip__icon">
                <q-icon :name="getIconByTransaction"></q-icon>
              </div>
              <div class="tagam-service-chip__copy">
                <div class="tagam-service-chip__label">
                  {{ serviceTypeLabel }}
                </div>
                <div class="tagam-service-chip__time">
                  {{ serviceTimeLabel }}
                </div>
              </div>
              <q-icon name="eva-chevron-down-outline" class="tagam-service-chip__chevron" />
            </q-btn>

            <q-btn
              v-if="bookingEnabled"
              class="tagam-action-chip"
              rounded
              size="sm"
              no-caps
              :to="{
                path: 'store/booking',
                query: {
                  uuid: this.merchantUUID,
                },
              }"
            >
              <div class="q-mr-xs">
                <q-icon name="eva-calendar-outline" color="grey300"></q-icon>
              </div>
              <div class="text-weight-medium text-subtitle2">
                {{ $t("Booking") }}
              </div>
            </q-btn>
          </div>

          <div
            v-if="CartStore.hasError"
            class="bg-error text-error q-pa-sm text-caption line-normal q-mb-sm"
          >
            <q-list dense class="myqlist">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="eva-info-outline"></q-icon>
                </q-item-section>
                <q-item-section>
                  <template v-for="error in CartStore.getError" :key="error">
                    <div>{{ error }}</div>
                  </template>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div
            class="text-center"
            v-if="CartStore.canShowSchedule && !CartStore.isStoreopen"
          >
            <q-btn
              no-caps
              unelevated
              text-color="white"
              color="secondary"
              rounded
              @click="this.$refs.delivery_sched.showSched(true)"
            >
              <div class="text-weight-bold text-subtitle2">
                {{ $t("Schedule Order") }}
              </div></q-btn
            >
          </div>

          <MerchantPromoSlide
            :data="merchant?.promo_list ?? null"
          ></MerchantPromoSlide>
        </div>
      </template>

      <!-- MENU STARTS HERE -->
      <component
        :is="MenuComponents"
        ref="ref_menu"
        :slug="slug"
        :merchant_id="merchants?.merchant_id || ''"
        :promoEligibility="promoEligibility"
        @on-categorychange="onCategorychange"
        @promo-check="promoCheck"
        @cart-feedback="showCartFeedback"
      ></component>
      <!-- MENU END HERE -->

      <transition name="tagam-cart-toast">
        <div
          v-if="cartFeedbackVisible"
          :key="cartFeedbackKey"
          class="tagam-cart-feedback"
        >
          <div class="tagam-cart-feedback__icon">
            <q-icon name="eva-shopping-bag-outline" size="22px" />
          </div>
          <div class="tagam-cart-feedback__copy">
            <div class="tagam-cart-feedback__title">{{ $t("Added to cart") }}</div>
            <div class="tagam-cart-feedback__subtitle">{{ $t("Checkout") }}</div>
          </div>
          <q-icon name="eva-checkmark-circle-2-outline" size="22px" />
        </div>
      </transition>

      <transition-group name="tagam-cart-fly" tag="div" class="tagam-cart-fly-layer">
        <div
          v-for="item in flyingCartItems"
          :key="item.id"
          class="tagam-cart-fly-item"
        >
          <q-img
            v-if="item.image"
            :src="item.image"
            fit="fill"
            class="tagam-cart-fly-image"
            spinner-size="xs"
            spinner-color="primary"
          />
          <q-icon
            v-else
            name="eva-shopping-bag-outline"
            size="28px"
            class="tagam-cart-fly-placeholder"
          />
        </div>
      </transition-group>

      <q-footer
        v-if="CartStore.hasItem && !CartStore.cart_loading"
        class="tagam-checkout-footer q-pa-sm tagam-text-main"
        reveal
      >
        <q-btn
          @click="checkBeforeCheckout"
          :loading="CartStore.cart_loading"
          :disable="!CartStore.canCheckout"
          unelevated
          :color="!CartStore.canCheckout ? 'disabled' : 'primary'"
          :text-color="!CartStore.canCheckout ? 'disabled' : 'white'"
          no-caps
          class="fit tagam-checkout-btn"
          size="lg"
          rounded
        >
          <div
            class="tagam-checkout-content row items-center justify-between fit text-subtitle2 text-weight-bold"
          >
            <div class="row items-center">
              <q-icon name="eva-shopping-bag-outline" size="20px" class="q-mr-sm" />
              {{ $t("Checkout") }}
            </div>
            <div>
              {{ CartStore.getSubtotal }}
            </div>
          </div>
        </q-btn>
      </q-footer>

      <MerchantInformation
        ref="ref_merchantinfo"
        :data="{
          merchant: merchants || null,
          open_at: merchant?.open_at || null,
          opening_hours: merchant?.opening_hours || null,
          gallery: merchant?.gallery || null,
          review_details: merchant?.review_details || null,
          partial_review: merchant?.partial_review || null,
        }"
      ></MerchantInformation>

      <DeliverySched
        ref="delivery_sched"
        :is_persistent="CartStore.enabledSelectTime"
        :transactionType="CartStore.geTransactiontype"
        :deliveryType="CartStore.geDeliverytype"
        :merchant_id="CartStore.getMerchantId"
        @after-savetrans="afterSavetrans"
      />

      <AgeVerification ref="ref_age_verification"> </AgeVerification>

      <TimePassedmodal
        ref="ref_timepass"
        @select-anothertime="selectAnothertime"
        @clear-cart="clearCart"
      >
      </TimePassedmodal>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
       class="tagam-menu-page">
        <q-btn
          fab
          icon="keyboard_arrow_up"
          color="transparent"
          text-color="primary"
          class="tagam-icon-btn"
          dense
          padding="7px"
        />
      </q-page-scroller>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useCartStore } from "stores/CartStore";
import { useMenuStore } from "stores/MenuStore";
import { useStoreOpen } from "stores/StoreOpen";
import { useFavoriteStore } from "stores/FavoriteStore";
import { useDeliveryschedStore } from "stores/DeliverySched";
import { useHaptics } from "src/composables/useHaptics";
import { scroll } from "quasar";
import auth from "src/api/auth";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "stores/DataStore";

export default {
  data() {
    return {
      merchant_loading: false,
      merchant: null,
      search_mode: null,
      slug: null,
      headerChangeColor: false,
      category: null,
      menu_display_type: null,
      promoEligibility: {},
      cartFeedbackVisible: false,
      cartFeedbackTimer: null,
      cartFeedbackKey: 0,
      flyingCartItems: [],
      flyingCartTimer: null,
      localTransactionInfo: null,
    };
  },
  components: {
    FavsResto: defineAsyncComponent(() => import("components/FavsResto.vue")),
    ShareComponents: defineAsyncComponent(() =>
      import("components/ShareComponents.vue")
    ),
    MerchantPromoSlide: defineAsyncComponent(() =>
      import("components/MerchantPromoSlide.vue")
    ),
    MerchantInformation: defineAsyncComponent(() =>
      import("components/MerchantInformation.vue")
    ),
    DeliverySched: defineAsyncComponent(() =>
      import("components/DeliverySched.vue")
    ),
    AgeVerification: defineAsyncComponent(() =>
      import("components/AgeVerification.vue")
    ),
    MenuLoader: defineAsyncComponent(() =>
      import("src/components/MenuLoader.vue")
    ),
    TimePassedmodal: defineAsyncComponent(() =>
      import("components/TimePassedmodal.vue")
    ),
  },
  setup() {
    const CartStore = useCartStore();
    const MenuStore = useMenuStore();
    const DeliveryschedStore = useDeliveryschedStore();
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    const haptics = useHaptics();

    return {
      CartStore,
      MenuStore,
      DeliveryschedStore,
      DataStorePersisted,
      DataStore,
      haptics,
    };
  },
  mounted() {
    this.search_mode = this.DataStore.getSearchMode;
    this.slug = this.$route.params.slug;
    this.fetchCart();

    if (
      this.MenuStore.menu_info_slug == this.slug &&
      this.MenuStore.menu_saved_info
    ) {
      this.merchant = this.MenuStore.menu_saved_info;
      this.menu_display_type =
        this.MenuStore.menu_saved_info?.menu_display_type ?? "all";

      const enabled_age_verification = this.merchant.enabled_age_verification;
      if (enabled_age_verification && !this.DataStorePersisted.ageVerified) {
        this.$nextTick(() => {
          if (this.$refs.ref_age_verification) {
            this.$refs.ref_age_verification.modal = true;
          }
        });
      }
    } else {
      this.MenuStore.menu_saved_info = null;
      this.MenuStore.menu_info_slug = null;
      this.getMerchant();
    }

    // if merchant only have select delivery time show schedule
    this.$watch(
      () => this.CartStore.$state.cart_data,
      (newData, oldData) => {
        if (newData) {
          if (newData.time_already_passed) {
            if (this.$refs.ref_timepass) {
              this.$refs.ref_timepass.modal = newData.time_already_passed;
            }
            return;
          }
          if (newData.enabled_select_time) {
            if (this.$refs.delivery_sched) {
              this.$refs.delivery_sched.showSched(true);
            }
          }
        }
      }
    );

    // refresh menu if one of items is not available
    this.$watch(
      () => this.DataStore.$state.menu_refresh,
      (newData, oldData) => {
        if (newData) {
          this.refresh(null);
        }
      }
    );
  },
  beforeUnmount() {
    if (this.cartFeedbackTimer) {
      window.clearTimeout(this.cartFeedbackTimer);
    }
    if (this.flyingCartTimer) {
      window.clearTimeout(this.flyingCartTimer);
    }
    this.MenuStore.menu_saved_info = this.merchant;
    this.MenuStore.menu_info_slug = this.slug;
  },
  computed: {
    MenuComponents() {
      if (!this.menu_display_type) return null;
      return this.menu_display_type === "by_category"
        ? defineAsyncComponent(() => import("components/MenuCategoryFirst.vue"))
        : defineAsyncComponent(() => import("components/MenuAll.vue"));
    },
    getIconByTransaction() {
      if (this.CartStore.geTransactiontype == "delivery") {
        return "eva-car-outline";
      } else if (this.CartStore.geTransactiontype == "pickup") {
        return "eva-shopping-bag-outline";
      } else if (this.CartStore.geTransactiontype == "dinein") {
        return "eva-people-outline";
      }
      return "eva-car-outline";
    },
    serviceTypeLabel() {
      return (
        this.currentTransactionInfo.transaction_type_pretty ||
        this.translateOrFallback("Delivery", "Доставка")
      );
    },
    serviceTimeLabel() {
      const info = this.currentTransactionInfo;
      if (info.whento_deliver === "schedule") {
        const date = this.formatServiceDate(info.delivery_date);
        const time = this.formatServiceTime(info.delivery_time);
        return [date, time].filter(Boolean).join(this.serviceTimeJoiner) ||
          this.translateOrFallback("Scheduled", "Запланировано");
      }

      const estimation = this.firstReadableTime([
        info.estimation,
        this.merchant?.estimation_time,
        this.merchants?.estimation_time,
        this.CartStore.getEstimatetime1,
        this.CartStore.getEstimatetime,
      ]);

      if (estimation) {
        return `${this.translateOrFallback("Now", "Сейчас")} • ${estimation}`;
      }

      return "Ближайшее время";
    },
    merchants() {
      return this.merchant?.data || null;
    },
    merchantUUID() {
      return this.merchant?.data?.merchant_uuid || null;
    },
    shortDistanceLabel() {
      const label = this.merchant?.distance?.label || "";
      if (!label) return "";
      const normalized = String(label)
        .replace(/\s+/g, " ")
        .replace(/^в\s+/i, "")
        .replace(/\s+от\s+вас$/i, "")
        .replace(/\s+from\s+you$/i, "")
        .trim();
      const match = normalized.match(/(\d+(?:[.,]\d+)?)\s*(км|km|m|м)/i);
      if (!match) return normalized;
      const value = match[1].replace(".", ",");
      const unit = match[2].toLowerCase().replace("km", "км").replace("m", "м");
      return `${value} ${unit}`;
    },
    serviceTimeJoiner() {
      return this.$i18n?.locale === "ru" ? " в " : " at ";
    },
    classObject() {
      let $class_name = "";
      if (this.headerChangeColor) {
        $class_name = this.$q.dark.mode
          ? "tagam-surface-elevated tagam-text-main"
          : "tagam-surface tagam-text-main";
      } else if (!this.headerChangeColor) {
        $class_name = "bg-transparent tagam-text-main";
      }
      return $class_name;
    },
    bookingEnabled() {
      return this.merchant?.booking_settings?.booking_enabled ?? false;
    },
    currentTransactionInfo() {
      return {
        ...(this.CartStore.geTransactionInfo || {}),
        ...(this.localTransactionInfo || {}),
      };
    },
  },
  methods: {
    selectAnothertime() {
      this.$refs.ref_timepass.modal = false;
      this.$refs.delivery_sched.showSched(true);
    },
    clearCart() {
      this.$refs.ref_timepass.modal = false;
    },
    async fetchCart() {
      try {
        const response = await this.CartStore.getCart(false, null, this.slug);
        if (this.merchant) {
          this.merchant.estimation_time =
            response?.standard_estimation_time || "";
        }
      } catch (error) {
      }

      this.promoCheck();
    },
    afterSavefav(data, added) {
      data.saved_store = added;
      // CLEAR HOME PAGE FILTER AND FAV
      this.DataStore.feed_filter = [];
      this.DataStore.fav_saved_data = null;
    },
    showCategory() {
      this.haptics.impact("light");
      this.$refs.ref_menu.showCategory();
    },
    showSearchMenu() {
      this.haptics.impact("light");
      this.$refs.ref_menu.showSearchMenu();
    },
    onCategorychange(value) {
      this.category = value;
    },
    showCartFeedback(visual = {}) {
      this.cartFeedbackKey += 1;
      this.cartFeedbackVisible = true;
      this.animateCartFly(visual);
      if (this.cartFeedbackTimer) {
        window.clearTimeout(this.cartFeedbackTimer);
      }
      this.cartFeedbackTimer = window.setTimeout(() => {
        this.cartFeedbackVisible = false;
      }, 1700);
    },
    animateCartFly(visual = {}) {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      this.flyingCartItems.push({
        id,
        image: visual?.image || "",
        name: visual?.name || "",
      });
      if (this.flyingCartTimer) {
        window.clearTimeout(this.flyingCartTimer);
      }
      this.flyingCartTimer = window.setTimeout(() => {
        this.flyingCartItems = this.flyingCartItems.filter((item) => item.id !== id);
      }, 950);
    },
    async getMerchant() {
      try {
        this.merchant_loading = true;

        const location_data = this.DataStorePersisted.getLocation;
        const latitude = this.DataStorePersisted.coordinates?.lat ?? "";
        const longitude = this.DataStorePersisted.coordinates?.lng ?? "";
        const currency_code = this.DataStorePersisted.useCurrency;
        const islogin = auth.authenticated();
        this.islogin = islogin;

        let params = {};
        if (this.search_mode == "address") {
          params = {
            slug: this.slug,
            currency_code: currency_code,
            latitude: latitude,
            longitude: longitude,
            cart_uuid: this.DataStorePersisted.cart_uuid ?? "",
          };
        } else {
          params = {
            slug: this.slug,
            currency_code: currency_code,
            cart_uuid: this.DataStorePersisted.cart_uuid ?? "",
            state_id: location_data?.state_id ?? "",
            city_id: location_data?.city_id ?? "",
            area_id: location_data?.area_id ?? "",
            postal_id: location_data?.postal_id ?? "",
          };
        }

        const methods = islogin ? "getMerchantInfoAuth" : "getMerchantInfo";
        const response = await APIinterface.fetchDataByTokenGet(
          methods,
          params
        );
        this.merchant = response.details;
        this.menu_display_type = response.details.menu_display_type;
        const enabled_age_verification = this.merchant.enabled_age_verification;
        if (enabled_age_verification && !this.DataStorePersisted.ageVerified) {
          this.$nextTick(() => {
            if (this.$refs.ref_age_verification) {
              this.$refs.ref_age_verification.modal = true;
            }
          });
        }
        //
      } catch (error) {
        this.merchant = null;
      } finally {
        this.merchant_loading = false;
      }
    },
    onScroll(info) {
      this.headerChangeColor = info.position.top > 140;
    },
    refresh(done) {
      if (done) {
        done();
      }

      // this.MenuStore.menu_saved_info = null;
      // this.MenuStore.menu_info_slug = null;
      this.MenuStore.cleanMerchantData();

      this.getMerchant();
      this.$refs.ref_menu.geStoreMenu();
      this.fetchCart();
    },
    async afterSavetrans(value) {
      if (!this.DataStorePersisted.cart_uuid) {
        this.DataStorePersisted.cart_uuid = value?.cart_uuid || null;
      }
      if (value?.transaction_info) {
        this.localTransactionInfo = value.transaction_info;
      }
      if (value?.transaction_info && this.CartStore.cart_data) {
        this.CartStore.cart_data = {
          ...this.CartStore.cart_data,
          ...value,
          transaction_info: value.transaction_info,
        };
      }
      await this.fetchCart();
      if (value?.transaction_info) {
        this.localTransactionInfo = {
          ...(this.CartStore.geTransactionInfo || {}),
          ...value.transaction_info,
        };
      }
    },
    translateOrFallback(key, fallback) {
      return this.$te?.(key) ? this.$t(key) : fallback;
    },
    firstReadableTime(values = []) {
      return (
        values
          .map((value) => (value == null ? "" : String(value).trim()))
          .find((value) => value && /\d/.test(value)) || ""
      );
    },
    formatServiceDate(value) {
      if (!value) return "";
      const parsedDate = new Date(`${value}T00:00:00`);
      if (Number.isNaN(parsedDate.getTime())) return value;

      const localeMap = { ru: "ru-RU", tk: "tk-TM", en: "en-US" };
      const locale = localeMap[this.$i18n?.locale] || localeMap.ru;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (parsedDate.getTime() === today.getTime()) return this.$t("Today");
      if (parsedDate.getTime() === tomorrow.getTime()) return this.$t("Tomorrow");

      return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
      }).format(parsedDate);
    },
    formatServiceTime(value) {
      if (!value) return "";
      const raw =
        typeof value === "string"
          ? value
          : (
        value.pretty_time ||
        value.start_time ||
        value.end_time ||
        ""
            );

      return String(raw)
        .replace(/\b(\d{1,2}:\d{2}):00\b/g, "$1")
        .trim();
    },
    checkBeforeCheckout() {
      if (
        !this.DataStorePersisted.hasCoordinates &&
        this.search_mode == "address"
      ) {
        this.$router.push({
          path: "/location/map",
          query: { url: "/checkout" },
        });
        return;
      }

      if (
        !this.DataStorePersisted.hasLocation &&
        this.search_mode == "location"
      ) {
        this.$router.push({
          path: "/location/add-location",
        });
        return;
      }

      if (!auth.authenticated()) {
        if (this.DataStore.login_method == "otp") {
          this.$router.push({
            path: "/user/login-otp",
            query: { redirect: "/checkout" },
          });
        } else {
          this.$router.push({
            path: "/user/login",
            query: { redirect: "/checkout" },
          });
        }
        return;
      }

      this.$router.push({
        path: "/checkout",
      });
    },
    async promoCheck() {
      const merchant_id = this.merchant?.data?.merchant_id || "";
      const cart_uuid = this.DataStorePersisted.cart_uuid;
      try {
        const response = await APIinterface.fetchDataByTokenGet("PromoCheck", {
          merchant_id: merchant_id,
          cart_uuid: cart_uuid,
        });
        this.promoEligibility = response.details.data;
      } catch (error) {
        this.promoEligibility = {};
      }
    },
    // end method
  },
};
</script>

<style lang="sass" scoped>
.tagam-merchant-logo
  width: 64px
  height: 64px
  aspect-ratio: 1 / 1
  border-radius: 18px
  overflow: hidden
  background: var(--tagam-surface)
  border: 1px solid var(--tagam-border)
  box-shadow: 0 12px 24px rgba(22, 28, 45, 0.14)

.tagam-merchant-logo img
  display: block
  width: 100%
  height: 100%
  object-fit: fill

.tagam-merchant-name
  color: var(--tagam-text)
  font-size: 17px
  line-height: 1.15
  font-weight: 950

.tagam-merchant-address
  margin-top: 4px
  color: var(--tagam-text-muted)
  font-size: 12px
  line-height: 1.2
  font-weight: 700

.tagam-summary-chevron
  flex: 0 0 auto
  color: var(--tagam-text-muted)
  font-size: 20px
  margin-left: 8px

.tagam-checkout-footer
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom)) !important
  background: rgba(255, 255, 255, 0.86) !important
  backdrop-filter: blur(18px)
  border-top: 1px solid rgba(22, 28, 45, 0.08)

:global(body.body--dark) .tagam-checkout-footer
  background: rgba(18, 20, 24, 0.88) !important
  border-top-color: rgba(255, 255, 255, 0.08)

.tagam-checkout-btn
  min-height: 54px
  box-shadow: 0 12px 28px rgba(255, 107, 53, 0.26)

.tagam-checkout-content
  padding: 0 4px
</style>








