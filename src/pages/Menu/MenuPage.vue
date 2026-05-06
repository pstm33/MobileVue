<template>
    <q-page class="tagam-menu-page q-px-md">
      <q-scroll-observer @scroll="onScroll" />

      <q-page-sticky
        position="top"
        expand
        :offset="[0, 0]"
        class="tagam-menu-sticky-shell"
      >
        <TagamTopHeader
          :cart-count="CartStore.getCartCount"
          :sticky="false"
          :show-menu="false"
          class="tagam-menu-sticky-header"
        >
          <template #actions>
            <q-btn
              flat
              round
              dense
              to="/home"
              icon="eva-home-outline"
              class="tagam-shared-header__icon tagam-menu-home-icon"
            />
          </template>
        </TagamTopHeader>
      </q-page-sticky>

      <div class="tagam-menu-sticky-spacer"></div>

      <template v-if="merchant_loading">
        <MenuLoader loading_type="merchant_header"></MenuLoader>
      </template>
      <template v-else>
        <section class="tagam-menu-hero">
          <RestaurantCover
            :cover-src="heroImage"
            :logo-src="merchants?.url_logo"
            class="tagam-menu-hero__image"
          >
            <div class="tagam-menu-hero__overlay"></div>
            <div class="tagam-menu-hero__chips">
              <div class="tagam-menu-hero__chip">
                {{ CartStore.geTransactiontypePretty }}
              </div>
              <div v-if="merchant?.distance?.label" class="tagam-menu-hero__chip">
                {{ merchant?.distance?.label }}
              </div>
            </div>
            <button
              type="button"
              class="tagam-menu-hero-summary"
              @click.stop="this.$refs.ref_merchantinfo.modal = true"
            >
              <div class="tagam-menu-hero-summary__body">
                <div class="tagam-menu-hero-summary__eyebrow">{{ $t("Restaurant") }}</div>
                <div class="tagam-menu-hero-summary__title">
                  {{ merchants?.restaurant_name || "" }}
                </div>
                <div class="tagam-menu-hero-summary__text">
                  {{ merchants?.merchant_address || "" }}
                </div>
                <div class="tagam-menu-hero-summary__status" v-if="formattedWorkingHours">
                  {{ $t("Working hours") }}: {{ formattedWorkingHours }}
                </div>
              </div>
            </button>

            <div v-if="merchants" class="tagam-menu-hero__actions">
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
                :title="merchants?.share?.title || merchants?.restaurant_name || ''"
                :text="merchants?.share?.text || ''"
                :url="merchants?.share?.url || ''"
                :dialogTitle="merchants?.share?.dialogTitle"
              />
            </div>
          </RestaurantCover>

          <div class="tagam-menu-hero__logo-outside">
            <q-img
              :src="merchants?.url_logo"
              lazy
              fit="cover"
              class="tagam-menu-hero__logo-outside-image"
              spinner-size="xs"
              spinner-color="primary"
            />
          </div>
        </section>

        <section class="tagam-section-shell tagam-menu-summary-shell q-mt-md">
          <div class="row q-col-gutter-sm tagam-menu-actions-row">
            <div :class="bookingEnabled ? 'col-3' : 'col-4'">
              <button
                type="button"
                class="tagam-menu-stat tagam-menu-stat--action"
                @click="this.$refs.ref_merchantinfo.modal = true"
              >
                <div class="tagam-menu-service-card">
                  <div class="tagam-menu-service-card__label">
                    <q-icon size="xs" name="storefront" color="primary" />
                    <span>{{ $t("About us") }}</span>
                  </div>
                </div>
              </button>
            </div>

            <div :class="bookingEnabled ? 'col-5' : 'col-8'">
              <button
                type="button"
                class="tagam-menu-stat tagam-menu-stat--action"
                @click="this.$refs.delivery_sched.showSched(true)"
              >
                <div class="tagam-menu-service-card">
                  <div class="tagam-menu-service-card__label">
                    <q-icon size="xs" :name="getIconByTransaction" color="primary" />
                    <span>{{ $t("Service options") }}</span>
                  </div>
                  <div class="tagam-menu-service-card__value">
                    <span>{{ selectedTransactionLabel }}</span>
                    <q-icon name="eva-chevron-right-outline" size="16px" color="grey-5" />
                  </div>
                </div>
              </button>
            </div>

            <div v-if="bookingEnabled" class="col-4">
              <button
                type="button"
                class="tagam-menu-stat tagam-menu-stat--action"
                @click="$router.push({ path: 'store/booking', query: { uuid: merchantUUID } })"
              >
                <q-icon size="xs" name="eva-calendar-outline" color="primary" />
                <div class="tagam-menu-stat__value">{{ $t("Booking") }}</div>
              </button>
            </div>
          </div>

          <div v-if="CartStore.hasError" class="tagam-menu-error q-mt-sm">
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
            class="tagam-menu-schedule q-mt-sm"
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
              </div>
            </q-btn>
          </div>

          <div class="row q-col-gutter-sm q-mt-sm">
              <div class="col-4">
                <div class="tagam-menu-stat">
                  <q-icon size="xs" name="las la-clock" color="primary" />
                  <div class="tagam-menu-stat__value">
                    {{ merchant?.estimation_time || "-" }}
                  </div>
                </div>
              </div>

              <div class="col-4" v-if="search_mode == 'address'">
                <div class="tagam-menu-stat">
                  <q-icon size="xs" name="las la-map-marker" color="primary" />
                  <div class="tagam-menu-stat__value">
                    {{ formattedDistanceLabel }}
                  </div>
                </div>
              </div>

              <div class="col-4" v-if="DataStore.enabled_review">
                <div class="tagam-menu-stat">
                  <q-icon size="xs" name="star_border" color="primary" />
                  <div class="tagam-menu-stat__value">
                    {{ merchants?.ratings }}
                    <span v-if="merchants?.review_count > 0">
                    ({{ merchants?.review_count }})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <MerchantPromoSlide
            :data="merchant?.promo_list ?? null"
            class="q-mt-sm"
          ></MerchantPromoSlide>
        </section>

        <section class="tagam-menu-content-shell q-mt-md q-mb-xl">
          <component
            :is="MenuComponents"
            ref="ref_menu"
            :slug="slug"
            :merchant_id="merchants?.merchant_id || ''"
            :promoEligibility="promoEligibility"
            @on-categorychange="onCategorychange"
            @promo-check="promoCheck"
          ></component>
        </section>

        <q-footer
          v-if="CartStore.hasItem && !CartStore.cart_loading"
          class="tagam-menu-footer"
          reveal
        >
          <div class="tagam-menu-footer__shell">
            <q-btn
              @click="checkBeforeCheckout"
              :loading="CartStore.cart_loading"
              :disable="!CartStore.canCheckout"
              unelevated
              :color="!CartStore.canCheckout ? 'disabled' : 'primary'"
              :text-color="!CartStore.canCheckout ? 'disabled' : 'white'"
              no-caps
              class="fit tagam-menu-footer__button"
              size="lg"
              rounded
            >
              <div
                class="row items-center justify-between fit text-subtitle2 text-weight-bold"
              >
                <div>
                  {{ $t("Checkout") }}
                </div>
                <div>
                  {{ CartStore.getSubtotal }}
                </div>
              </div>
            </q-btn>
          </div>
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
          :transactionType="selectedTransactionType || CartStore.geTransactiontype"
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
        >
          <q-btn
            fab
            icon="keyboard_arrow_up"
            color="mygrey"
            text-color="dark"
            dense
            padding="7px"
          />
        </q-page-scroller>
      </template>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useCartStore } from "stores/CartStore";
import { useMenuStore } from "stores/MenuStore";
import { useStoreOpen } from "stores/StoreOpen";
import { useFavoriteStore } from "stores/FavoriteStore";
import { useDeliveryschedStore } from "stores/DeliverySched";
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
      category: null,
      menu_display_type: null,
      promoEligibility: {},
      selectedTransactionType: "",
      selectedTransactionPretty: "",
    };
  },
  components: {
    FavsResto: defineAsyncComponent(() => import("components/FavsResto.vue")),
    ShareComponents: defineAsyncComponent(() =>
      import("components/ShareComponents.vue")
    ),
    RestaurantCover: defineAsyncComponent(() =>
      import("components/RestaurantCover.vue")
    ),
    TagamTopHeader: defineAsyncComponent(() =>
      import("components/TagamTopHeader.vue")
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

    return {
      CartStore,
      MenuStore,
      DeliveryschedStore,
      DataStorePersisted,
      DataStore,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.cleanupTransientOverlays();
    });

    this.search_mode = this.DataStore.getSearchMode;
    this.slug = this.$route.params.slug;
    this.fetchCart();

    if (
      this.MenuStore.menu_info_slug == this.slug &&
      this.MenuStore.menu_saved_info
    ) {
      console.log("same merchant data");
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
    this.forceCloseTransientModals();
    this.cleanupTransientOverlays(true);
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
    effectiveTransactionType() {
      return this.selectedTransactionType || this.CartStore.geTransactiontype || "";
    },
    getIconByTransaction() {
      if (this.effectiveTransactionType == "delivery") {
        return "eva-car-outline";
      } else if (this.effectiveTransactionType == "pickup") {
        return "eva-shopping-bag-outline";
      } else if (this.effectiveTransactionType == "dinein") {
        return "eva-people-outline";
      }
      return "eva-car-outline";
    },
    merchants() {
      return this.merchant?.data || null;
    },
    merchantUUID() {
      return this.merchant?.data?.merchant_uuid || null;
    },
    bookingEnabled() {
      return this.merchant?.booking_settings?.booking_enabled ?? false;
    },
    heroImage() {
      return (
        this.merchants?.url_header ||
        this.merchants?.featured_image ||
        this.merchants?.cover_image ||
        this.merchants?.merchant_cover ||
        this.merchants?.cover ||
        this.merchants?.url_cover ||
        this.merchants?.url_banner ||
        this.merchants?.banner_image ||
        this.merchants?.url_featured ||
        this.merchants?.url_photo ||
        this.merchants?.image ||
        this.merchants?.image_url ||
        this.merchants?.url_logo ||
        this.merchants?.logo_url ||
        this.merchants?.logo ||
        ""
      );
    },
    formattedDistanceLabel() {
      const rawDistance = this.merchant?.distance?.label || "";
      const match = String(rawDistance).match(/(\d+[.,]?\d*)\s*км/i);

      if (match?.[1]) {
        return `${match[1]} км`;
      }

      return rawDistance;
    },
    formattedWorkingHours() {
      const rawValue =
        this.merchant?.open_at ||
        this.merchant?.opening_hours ||
        "";
      const matches = String(rawValue).match(/\b\d{2}:\d{2}(?::\d{2})?\b/g) || [];

      if (matches.length >= 2) {
        return `${matches[0].slice(0, 5)} - ${matches[1].slice(0, 5)}`;
      }

      if (matches.length === 1) {
        return matches[0].slice(0, 5);
      }

      return "";
    },
    selectedTransactionLabel() {
      if (this.selectedTransactionPretty) {
        return this.selectedTransactionPretty;
      }

      const selectedService = (this.CartStore.getServices || []).find(
        (service) => service?.value === this.effectiveTransactionType
      );

      if (selectedService) {
        return (
          selectedService.label ||
          selectedService.name ||
          selectedService.text ||
          selectedService.value
        );
      }

      return (
        this.CartStore.geTransactiontypePretty ||
        this.$t("Choose")
      );
    },
  },
  methods: {
    forceCloseTransientModals() {
      const transientRefs = [
        "ref_merchantinfo",
        "delivery_sched",
        "ref_age_verification",
        "ref_timepass",
      ];

      transientRefs.forEach((refName) => {
        const ref = this.$refs[refName];
        if (ref && Object.prototype.hasOwnProperty.call(ref, "modal")) {
          ref.modal = false;
        }
      });
    },
    cleanupTransientOverlays(force = false) {
      if (typeof document === "undefined") {
        return;
      }

      window.requestAnimationFrame(() => {
        const knownModalRefs = [
          this.$refs.ref_merchantinfo,
          this.$refs.delivery_sched,
          this.$refs.ref_age_verification,
          this.$refs.ref_timepass,
        ].filter(Boolean);
        const hasOpenKnownModal = knownModalRefs.some(
          (ref) => Object.prototype.hasOwnProperty.call(ref, "modal") && !!ref.modal
        );
        const hasActiveLoader = !!document.querySelector(
          ".q-loading, .q-loading__backdrop"
        );

        if (!force && (hasOpenKnownModal || hasActiveLoader)) {
          return;
        }

        document
          .querySelectorAll(".q-dialog__backdrop, .q-loading__backdrop")
          .forEach((node) => node.remove());

        document.body.classList.remove(
          "q-body--dialog",
          "q-body--prevent-scroll",
          "q-body--force-scrollbar-x"
        );

        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
      });
    },
    selectAnothertime() {
      console.log("selectAnothertime");
      this.$refs.ref_timepass.modal = false;
      this.$refs.delivery_sched.showSched(true);
    },
    clearCart() {
      this.$refs.ref_timepass.modal = false;
      console.log("clearCart");
    },
    async fetchCart() {
      try {
        const response = await this.CartStore.getCart(false, null, this.slug);
        const responseTransactionType =
          response?.transaction_info?.transaction_type || "";
        const responseTransactionPretty =
          response?.transaction_info?.transaction_type_pretty || "";

        if (!this.selectedTransactionType && responseTransactionType) {
          this.selectedTransactionType = responseTransactionType;
        }

        if (
          !this.selectedTransactionPretty &&
          responseTransactionPretty
        ) {
          this.selectedTransactionPretty = responseTransactionPretty;
        }

        if (this.merchant) {
          this.merchant.estimation_time =
            response?.standard_estimation_time || "";
        }
      } catch (error) {
        console.log("error", error);
      } finally {
        this.cleanupTransientOverlays();
      }

      this.promoCheck();
    },
    afterSavefav(data, added) {
      data.saved_store = added;
      this.DataStore.feed_filter = [];
      this.DataStore.fav_saved_data = null;
    },
    showCategory() {
      this.$refs.ref_menu.showCategory();
    },
    onCategorychange(value) {
      this.category = value;
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
      } catch (error) {
        console.log("error", error);
        this.merchant = null;
      } finally {
        this.merchant_loading = false;
        this.cleanupTransientOverlays();
      }
    },
    onScroll(info) {},
    refresh(done) {
      if (done) {
        done();
      }

      this.MenuStore.cleanMerchantData();

      this.getMerchant();
      this.$refs.ref_menu.geStoreMenu();
      this.fetchCart();
    },
    syncCartTransactionState(value = {}) {
      if (!this.CartStore.cart_data) {
        return;
      }

      const currentTransactionInfo =
        this.CartStore.cart_data?.transaction_info || {};
      const nextTransactionInfo = {
        ...currentTransactionInfo,
        ...(value?.transaction_info || {}),
      };

      if (value?.__transaction_type) {
        nextTransactionInfo.transaction_type = value.__transaction_type;
      } else if (value?.transaction_type) {
        nextTransactionInfo.transaction_type = value.transaction_type;
      }

      if (value?.__transaction_type_pretty) {
        nextTransactionInfo.transaction_type_pretty =
          value.__transaction_type_pretty;
      } else if (value?.transaction_type_pretty) {
        nextTransactionInfo.transaction_type_pretty =
          value.transaction_type_pretty;
      }

      if (value?.whento_deliver) {
        nextTransactionInfo.whento_deliver = value.whento_deliver;
      }

      if (value?.delivery_date) {
        nextTransactionInfo.delivery_date = value.delivery_date;
      }

      if (value?.delivery_time) {
        nextTransactionInfo.delivery_time = value.delivery_time;
      }

      if (
        !nextTransactionInfo.whento_deliver &&
        (value?.delivery_date || value?.delivery_time)
      ) {
        nextTransactionInfo.whento_deliver = "schedule";
      }

      this.CartStore.cart_data = {
        ...this.CartStore.cart_data,
        transaction_info: nextTransactionInfo,
      };
    },
    afterSavetrans(value) {
      if (!this.DataStorePersisted.cart_uuid) {
        this.DataStorePersisted.cart_uuid = value?.cart_uuid || null;
      }

      this.syncCartTransactionState(value);

      if (value?.__transaction_type) {
        this.selectedTransactionType = value.__transaction_type;
      } else if (value?.transaction_type) {
        this.selectedTransactionType = value.transaction_type;
      }

      if (value?.__transaction_type_pretty) {
        this.selectedTransactionPretty = value.__transaction_type_pretty;
      } else if (value?.transaction_type_pretty) {
        this.selectedTransactionPretty = value.transaction_type_pretty;
      } else if (value?.__transaction_type) {
        const selectedService = (this.CartStore.getServices || []).find(
          (service) => service?.value === value.__transaction_type
        );
        this.selectedTransactionPretty =
          selectedService?.label ||
          selectedService?.name ||
          selectedService?.text ||
          this.selectedTransactionPretty;
      }

      this.fetchCart();
    },
    async checkBeforeCheckout() {
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

      await this.fetchCart();

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
        console.log("response", response);
        this.promoEligibility = response.details.data;
      } catch (error) {
        console.log("error", error);
        this.promoEligibility = {};
      }
    },
  },
};
</script>

<style scoped>
.tagam-menu-page {
  background: #ffffff;
  padding-bottom: 126px;
}

.tagam-menu-sticky-shell {
  z-index: 150;
}

.tagam-menu-sticky-header {
  width: 100%;
  background: #ffffff;
}

.tagam-menu-home-icon {
  color: #f18800 !important;
}

.tagam-menu-sticky-spacer {
  height: 58px;
}

.tagam-menu-hero {
  position: relative;
  margin-left: -16px;
  margin-right: -16px;
  margin-bottom: 24px;
}

.tagam-section-shell {
  background: #ffffff;
  border-radius: 24px;
  padding: 14px;
}

.tagam-menu-summary-shell {
  position: relative;
  z-index: 3;
  margin-top: -18px !important;
  padding: 2px 0 0;
  border-radius: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
}

.tagam-menu-hero__image {
  height: 188px;
  border-radius: 0 22px 22px 22px;
  overflow: hidden;
  background: #ffffff;
}

.tagam-menu-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 12, 6, 0.12) 0%, rgba(20, 12, 6, 0.54) 100%);
}

.tagam-menu-hero__chips {
  display: none;
}

.tagam-menu-hero__chip {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(113, 74, 24, 0.12);
  color: #f18800;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tagam-menu-hero-summary {
  position: absolute;
  left: 18px;
  right: 18px;
  top: 16px;
  bottom: 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0;
  border-radius: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  text-align: left;
}

.tagam-menu-actions-row {
  margin-top: 6px;
}


.tagam-menu-hero-summary__body {
  min-width: 0;
  max-width: 72%;
  margin-top: auto;
}

.tagam-menu-hero-summary__eyebrow {
  display: none;
}

.tagam-menu-hero-summary__title {
  margin-top: 0;
  font-size: 28px;
  line-height: 0.95;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: -0.03em;
  color: #ffffff;
}

.tagam-menu-hero-summary__text {
  margin-top: 18px;
  color: #ffffff;
  font-size: 12px;
  line-height: 1.35;
  font-weight: 600;
}

.tagam-menu-hero-summary__status {
  margin-top: 4px;
  color: #ffffff;
  font-size: 11px;
  line-height: 1.2;
  font-weight: 700;
}

.tagam-menu-hero__actions {
  position: absolute;
  right: 14px;
  top: 14px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tagam-menu-hero__actions :deep(.q-btn),
.tagam-menu-hero__actions :deep(.q-icon),
.tagam-menu-hero__actions :deep(.text-dark),
.tagam-menu-hero__actions :deep(.text-grey),
.tagam-menu-hero__actions :deep(.text-grey-7) {
  color: #f18800 !important;
}

.tagam-menu-hero__actions :deep(.q-btn) {
  background: transparent !important;
  box-shadow: none !important;
  border: 0 !important;
}

.tagam-menu-hero__logo-outside {
  position: absolute;
  right: 18px;
  bottom: -28px;
  z-index: 2;
  width: 110px;
  height: 110px;
  border-radius: 999px;
  pointer-events: none;
}

.tagam-menu-hero__logo-outside-image {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: #ffffff;
  border: 3px solid #f18800;
}

:global(.tagam-menu-hero__logo-outside-image .q-img__image) {
  object-fit: fill !important;
  object-position: center center !important;
}

.tagam-menu-error {
  background: rgba(255, 241, 240, 0.9);
  color: #b42318;
  border: 1px solid #f5c2c7;
  border-radius: 18px;
  padding: 8px;
}

.tagam-menu-schedule {
  text-align: center;
}

.tagam-menu-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(113, 74, 24, 0.08);
  text-align: center;
  box-shadow: none;
  padding: 6px;
}

.tagam-menu-stat--action {
  width: 100%;
  min-height: 36px;
  gap: 2px;
  cursor: pointer;
  background: #ffffff;
  padding-top: 2px;
  padding-bottom: 2px;
}

.tagam-menu-service-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.tagam-menu-service-card__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 9px;
  font-weight: 800;
  color: #20160f;
}

.tagam-menu-service-card__value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  margin-left: auto;
  font-size: 10px;
  line-height: 1.2;
  font-weight: 800;
  color: #f18800;
  text-align: right;
}

.tagam-menu-stat__value {
  margin-top: 5px;
  font-size: 11px;
  font-weight: 800;
  color: #20160f;
}

.tagam-menu-stat__hint {
  margin-top: 1px;
  font-size: 10px;
  line-height: 1.2;
  font-weight: 600;
  color: #8a7d70;
}

.tagam-menu-footer {
  background: transparent !important;
  border-top: 0 !important;
  box-shadow: none !important;
  padding: 0 12px calc(env(safe-area-inset-bottom, 0px) + 12px);
}

.tagam-menu-footer__shell {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(113, 74, 24, 0.12);
  border-radius: 28px;
  padding: 10px;
  box-shadow: none;
  backdrop-filter: blur(16px);
}

.tagam-menu-footer__button {
  height: 58px;
  border-radius: 20px;
}

.tagam-menu-content-shell {
  overflow: visible;
  padding-top: 0;
  margin-top: 2px !important;
}

@media (max-width: 480px) {
  .tagam-menu-hero__image {
    height: 176px;
  }

  .tagam-menu-hero-summary {
    left: 14px;
    right: 14px;
    top: 14px;
    bottom: 12px;
  }

  .tagam-menu-hero__actions {
    right: 12px;
    top: 12px;
  }

  .tagam-menu-hero-summary__body {
    max-width: 68%;
  }

  .tagam-menu-hero-summary__title {
    font-size: 24px;
  }

  .tagam-menu-hero__logo-outside {
    right: 14px;
    bottom: -23px;
    width: 92px;
    height: 92px;
  }
}

:global(body.body--dark) .tagam-menu-header-shell {
  background: var(--tagam-surface-soft) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-menu-toolbar__title {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-menu-hero__overlay {
  background: linear-gradient(
    180deg,
    rgba(12, 10, 8, 0.04) 0%,
    rgba(12, 10, 8, 0.34) 100%
  ) !important;
}

:global(body.body--dark) .tagam-menu-hero__chip {
  background: var(--tagam-surface-inset) !important;
  border-color: var(--tagam-stroke) !important;
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-menu-hero-summary {
  background: var(--tagam-surface-soft) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: var(--tagam-shadow-strong) !important;
}

:global(body.body--dark) .tagam-menu-hero-summary__logo {
  background: var(--tagam-surface) !important;
  border-color: var(--tagam-stroke-strong) !important;
}

:global(body.body--dark) .tagam-menu-hero-summary__eyebrow {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-menu-stat__value {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-menu-hero-summary__text {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-menu-hero-summary__title {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-menu-chip {
  background: var(--tagam-surface-raised) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: none !important;
}

:global(body.body--dark) .tagam-menu-error {
  background: rgba(111, 33, 22, 0.9) !important;
  border-color: rgba(255, 182, 174, 0.18) !important;
  color: #ffd6cf !important;
}

:global(body.body--dark) .tagam-menu-stat {
  background: var(--tagam-surface-strong) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: none !important;
}

:global(body.body--dark) .tagam-menu-footer__shell {
  background: var(--tagam-surface-soft) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: var(--tagam-shadow-strong) !important;
  backdrop-filter: none !important;
}

:global(body.body--dark) .tagam-menu-page {
  background:
    radial-gradient(circle at top left, rgba(241, 136, 0, 0.08), transparent 24%),
    radial-gradient(circle at top right, rgba(120, 71, 33, 0.12), transparent 22%),
    linear-gradient(180deg, #140f0d 0%, #191311 46%, #1f1815 100%) !important;
}

:global(body.body--dark) .tagam-menu-sticky-header {
  background: rgba(33, 26, 23, 0.98) !important;
  border-bottom: 1px solid var(--tagam-stroke) !important;
}

:global(body.body--dark) .tagam-menu-sticky-shell,
:global(body.body--dark) .tagam-menu-sticky-header,
:global(body.body--dark) .tagam-menu-sticky-header :deep(.tagam-shared-header__shell),
:global(body.body--dark) .tagam-menu-sticky-header :deep(.tagam-shared-header__toolbar),
:global(body.body--dark) .tagam-menu-sticky-header :deep(.tagam-shared-header__toolbar-wrap),
:global(body.body--dark) .tagam-menu-sticky-header :deep(.tagam-shared-header__toolbar-wrap--sticky),
:global(body.body--dark) .tagam-menu-sticky-header :deep(.tagam-shared-header__toolbar-wrap--fixed) {
  background: rgba(33, 26, 23, 0.98) !important;
  border-bottom: 1px solid var(--tagam-stroke) !important;
}

:global(body.body--dark) .tagam-menu-hero__image {
  background: rgba(43, 34, 30, 0.98) !important;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-menu-hero__overlay {
  background:
    radial-gradient(circle at 25% 28%, rgba(241, 136, 0, 0.16), transparent 20%),
    linear-gradient(180deg, rgba(14, 11, 9, 0.06) 0%, rgba(14, 11, 9, 0.46) 100%) !important;
}

:global(body.body--dark) .tagam-menu-hero-summary {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

:global(body.body--dark) .tagam-menu-hero-summary__title,
:global(body.body--dark) .tagam-menu-hero-summary__status,
:global(body.body--dark) .tagam-menu-hero-summary__text {
  color: #f6efe7 !important;
}

:global(body.body--dark) .tagam-menu-hero__logo-outside {
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28) !important;
}

:global(body.body--dark) .tagam-menu-hero__logo-outside-image {
  background: #fff8f1 !important;
  border-color: var(--tagam-primary) !important;
}

:global(body.body--dark) .tagam-menu-summary-shell {
  background: transparent !important;
  box-shadow: none !important;
}

:global(body.body--dark) .tagam-menu-stat {
  min-height: 58px;
  border-radius: 22px !important;
  background: rgba(47, 37, 33, 0.96) !important;
}

:global(body.body--dark) .tagam-menu-stat--action {
  background: rgba(47, 37, 33, 0.96) !important;
}

:global(body.body--dark) .tagam-menu-service-card__label {
  color: var(--tagam-text-soft) !important;
  font-size: 10px !important;
  font-weight: 800 !important;
}

:global(body.body--dark) .tagam-menu-service-card__value {
  color: var(--tagam-primary) !important;
  font-weight: 900 !important;
  font-size: 12px !important;
}

:global(body.body--dark) .tagam-menu-stat--action .q-icon,
:global(body.body--dark) .tagam-menu-stat--action .tagam-menu-service-card__value .q-icon {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-menu-stat--action {
  background: rgba(47, 37, 33, 0.98) !important;
  border-color: var(--tagam-stroke-strong) !important;
}

:global(body.body--dark) .tagam-menu-content-shell {
  background: rgba(39, 31, 27, 0.96) !important;
  border: 1px solid var(--tagam-stroke) !important;
  border-radius: 28px !important;
  padding: 10px 0 6px !important;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-menu-footer__button {
  box-shadow: 0 14px 26px rgba(217, 107, 29, 0.24) !important;
}
</style>

