<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header :class="classObject" v-if="!merchant_loading">
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          round
          dense
          icon="eva-arrow-back-outline"
          class="q-mr-sm"
          :color="
            $q.dark.mode
              ? 'grey600'
              : headerChangeColor
              ? 'transparent'
              : 'mygrey'
          "
          text-color="dark"
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
      </q-toolbar>

      <div
        class="q-pl-md q-pr-md q-pb-sm row q-gutter-x-lg shadow-bottom"
        v-if="headerChangeColor"
      >
        <div class="col">
          <!-- <div
            class="bg-grey-2x border-grey text-subtitle2 q-pa-sm radius28 flex justify-between cursor-pointer"
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
            class="bg-grey-2x border-grey text-subtitle2 q-pa-sm radius28 flex justify-between items-center cursor-pointer no-wrap"
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
            class="bg-grey-2x border-grey text-subtitle2 q-pa-sm radius28 flex justify-center cursor-pointer"
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
    <q-page>
      <q-scroll-observer @scroll="onScroll" />

      <template v-if="merchant_loading">
        <MenuLoader loading_type="merchant_header"></MenuLoader>
      </template>
      <template v-else>
        <q-responsive style="height: 150px">
          <q-img
            :src="
              this.merchants?.has_header
                ? this.merchants?.url_header
                : this.merchants?.url_logo
            "
            lazy
            fit="cover"
          >
            <template v-slot:loading>
              <div class="text-primary">
                <q-spinner-ios size="sm" />
              </div>
            </template>
          </q-img>
        </q-responsive>
        <q-item
          clickable
          @click="this.$refs.ref_merchantinfo.modal = true"
          v-ripple:purple
        >
          <q-item-section avatar>
            <q-responsive style="width: 50px; height: 50px">
              <q-img
                :src="merchants?.url_logo"
                lazy
                fit="cover"
                class="radius8"
                spinner-size="xs"
                spinner-color="primary"
              />
            </q-responsive>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold text-subtitle2 ellipsis">
              {{ merchants?.restaurant_name || "" }}
            </q-item-label>
            <q-item-label caption class="ellipsis text-grey300">
              {{ merchants?.merchant_address || "" }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-space class="q-pa-xs"></q-space>

        <div class="q-ml-md q-mr-md q-gutter-y-md">
          <div class="q-gutter-x-md q-gutter-y-lg">
            <q-btn
              rounded
              size="sm"
              no-caps
              @click="this.$refs.ref_merchantinfo.modal = true"
            >
              <div class="q-mr-xs">
                <q-icon name="storefront" color="grey300"></q-icon>
              </div>
              <div class="text-weight-medium text-subtitle2">
                {{ $t("Info") }}
              </div>
            </q-btn>
            <q-btn
              rounded
              size="sm"
              no-caps
              @click="this.$refs.delivery_sched.showSched(true)"
            >
              <div class="q-mr-xs">
                <q-icon :name="getIconByTransaction" color="grey300"></q-icon>
              </div>
              <div class="text-weight-medium text-subtitle2">
                {{ CartStore.geTransactiontypePretty }}
              </div>
            </q-btn>

            <q-btn
              v-if="bookingEnabled"
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

          <div class="border-grey radius8 q-pa-sm text-caption">
            <div class="row items-center justify-center">
              <div class="col text-center">
                <q-icon size="xs" name="las la-clock" color="grey300"></q-icon>
                <div class="text-caption text-weight-bold">
                  {{ merchant?.estimation_time }}
                </div>
              </div>
              <div class="col text-center" v-if="search_mode == 'address'">
                <q-icon
                  size="xs"
                  name="las la-map-marker"
                  color="grey300"
                ></q-icon>
                <div class="text-caption text-weight-bold">
                  {{ merchant?.distance?.label }}
                </div>
              </div>
              <div v-if="DataStore.enabled_review" class="col text-center">
                <q-icon size="xs" name="star_border" color="grey300"></q-icon>
                <div class="text-caption text-weight-bold">
                  {{ merchants?.ratings }}
                  <span v-if="merchants?.review_count > 0">
                    +
                    <span class="text-grey text-weight-medium"
                      >({{ merchants?.review_count }})</span
                    >
                  </span>
                </div>
              </div>
            </div>
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
      ></component>
      <!-- MENU END HERE -->

      <q-footer
        v-if="CartStore.hasItem && !CartStore.cart_loading"
        class="q-pa-sm text-dark bg-white shadow-1"
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
          class="fit"
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

    return {
      CartStore,
      MenuStore,
      DeliveryschedStore,
      DataStorePersisted,
      DataStore,
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
    merchants() {
      return this.merchant?.data || null;
    },
    merchantUUID() {
      return this.merchant?.data?.merchant_uuid || null;
    },
    classObject() {
      let $class_name = "";
      if (this.headerChangeColor) {
        $class_name = this.$q.dark.mode
          ? "bg-mydark text-white"
          : "bg-white text-black";
      } else if (!this.headerChangeColor) {
        $class_name = "bg-transparent text-black";
      }
      return $class_name;
    },
    bookingEnabled() {
      return this.merchant?.booking_settings?.booking_enabled ?? false;
    },
  },
  methods: {
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
        if (this.merchant) {
          this.merchant.estimation_time =
            response?.standard_estimation_time || "";
        }
      } catch (error) {
        console.log("error", error);
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
      this.$refs.ref_menu.showCategory();
    },
    showSearchMenu() {
      this.$refs.ref_menu.showSearchMenu();
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
        //
      } catch (error) {
        console.log("error", error);
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
    afterSavetrans(value) {
      if (!this.DataStorePersisted.cart_uuid) {
        this.DataStorePersisted.cart_uuid = value?.cart_uuid || null;
      }
      this.fetchCart();
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
        console.log("response", response);
        this.promoEligibility = response.details.data;
      } catch (error) {
        console.log("error", error);
        this.promoEligibility = {};
      }
    },
    // end method
  },
};
</script>
