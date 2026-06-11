<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header
      :class="{ 'border-bottom': !isScrolled, 'shadow-bottom': isScrolled, 'tagam-cart-header': true, }"
      class="tagam-text-main"
    >
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          flat
          round
          dense
          icon="eva-arrow-back-outline"
          class="q-mr-sm tagam-icon-btn"
        />
        <q-toolbar-title class="text-subtitle2 text-weight-bold tagam-cart-title">
          {{ CartStore.getStore ? CartStore.getStore : $t("Cart") }}
        </q-toolbar-title>
        <q-btn
          v-if="CartStore.hasItem && !CartStore.cart_loading"
          flat
          round
          dense
          icon="eva-trash-2-outline"
          color="primary"
          class="tagam-header-action"
          @click.stop="ConfirmDelete()"
        >
          <q-tooltip>{{ translateOrFallback("Clear Cart?", "Очистить корзину") }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-page class="flex column tagam-cart-page">
      <q-scroll-observer @scroll="onScroll" />
      <div class="cart-items-container col-grow">
          <q-space
          v-if="CartStore.hasItem"
          style="height: 5px"
          class="tagam-surface-muted"
        ></q-space>
        <template v-if="!CartStore.cart_loading">
          <template v-if="!CartStore.hasItem">
            <div class="tagam-cart-empty-state text-center q-pa-md">
              <div class="text-h6 line-normal text-weight-medium tagam-text-main">
                {{ $t("Your cart is empty") }}
              </div>
              <p class="text-caption tagam-text-muted">
                {{ $t("You don't have any orders here! let's change that!") }}
              </p>
            </div>
          </template>
          <template v-else>
            <div
              v-if="CartStore.hasError"
              class="tagam-cart-alert bg-error text-error q-pa-sm text-caption line-normal q-mb-sm"
            >
              <q-list dense class="myqlist">
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="eva-info-outline"></q-icon>
                  </q-item-section>
                  <q-item-section>
                    <template v-for="error in CartStore.getError" :key="error">
                      <div>{{ formatCartError(error) }}</div>
                    </template>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <q-item class="tagam-cart-summary-row">
              <q-item-section avatar class="text-weight-bold text-subtitle1">
                {{ $t("Order Summary") }}
              </q-item-section>
              <q-item-section></q-item-section>
              <q-item-section side>
                <q-btn
                  :label="$t('Add items')"
                  no-caps
                  unelevated
                  flat
                  color="primary"
                  padding="0"
                  class="text-weight-medium tagam-text-btn"
                  :to="{
                    name: 'menu',
                    params: {
                      slug: CartStore.getMerchant
                        ? CartStore.getMerchant.slug
                        : '',
                    },
                  }"
                ></q-btn>
              </q-item-section>
            </q-item>
          </template>
        </template>

        <div class="q-pl-sm q-pr-sm tagam-cart-details-wrap">
          <CartDetails
            ref="cart_details"
            :is_checkout="true"
            :payload="payload"
            :item_visible="8"
            :money_config="DataStore.money_config"
            :currency_code="DataStorePersisted.use_currency_code"
          />
          <CartPromoBanner
            v-if="hasVisiblePromo"
            class="q-mt-sm q-mb-sm"
            :discount="merchantDiscount"
            :promo="auto_promo_candidate"
            :loading="auto_promo_loading"
            :can-apply="isAuthenticated"
            @apply="applyAutoMerchantPromo()"
          />
          <template v-if="CartStore.hasItem && !CartStore.cart_loading">
            <q-separator></q-separator>
        <q-item clickable class="tagam-clear-cart-line" @click="ConfirmDelete">
          <q-item-section class="text-center text-weight-bold text-red">
            <div class="row items-center justify-center q-gutter-x-xs">
              <q-icon name="eva-trash-2-outline" size="18px" />
              <span>{{ $t("Empty Cart") }}</span>
            </div>
          </q-item-section>
        </q-item>
          </template>
        </div>
        <template v-if="CartStore.hasItem && !CartStore.cart_loading">
          <q-space style="height: 5px" class="tagam-surface-muted"></q-space>
        </template>
      </div>

    <div
      class="carousel-container q-pl-md q-pr-md q-mt-md tagam-cart-upsell"
      v-if="CartStore.hasItem && !CartStore.cart_loading"
    >
        <SimilarItems
          ref="similar_items"
          :title="$t('Most Order Items')"
          :merchant_id="CartStore.getMerchant.merchant_id"
          :merchant_slug="CartStore.getMerchant.slug"
          :cart_uuid="DataStorePersisted.cart_uuid"
          @after-additems="afterAdditems"
        />
      </div>

      <q-inner-loading
        :showing="CartStore.cart_reloading"
        color="primary"
        size="lg"
        label-class="dark"
        class="z-top"
      />

      <ConfirmDelete
        ref="ref_confirm"
        @after-confirm="clearCart"
      ></ConfirmDelete>
    </q-page>
  </q-pull-to-refresh>

  <q-footer
    class="tagam-cart-footer q-pa-sm tagam-text-main"
    v-if="CartStore.hasItem && !CartStore.cart_loading"
  >
    <q-skeleton
      v-if="CartStore.cart_reloading"
      type="QBtn"
      class="full-width q-pa-lg radius28"
    />

    <q-btn
      v-else
      @click="checkBeforeCheckout"
      unelevated
      no-caps
      class="fit tagam-cart-checkout-btn"
      size="lg"
      rounded
      :color="!CartStore.canCheckout ? 'disabled' : 'primary'"
      :text-color="!CartStore.canCheckout ? 'disabled' : 'white'"
      :disable="!CartStore.canCheckout"
    >
      <div
        class="row items-center justify-between fit text-subtitle2 text-weight-bold"
      >
        <div class="row items-center">
          <q-icon name="eva-shopping-bag-outline" size="20px" class="q-mr-sm" />
          {{ $t("Checkout") }}
        </div>
        <div>
          {{ cartFooterTotal }}
        </div>
      </div>
    </q-btn>
  </q-footer>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useCartStore } from "stores/CartStore";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "stores/DataStore";
import auth from "src/api/auth";
import CartPromoBanner from "components/CartPromoBanner.vue";
import {
  cartSavingsDiscount,
  autoMerchantOffer,
  promoContextKey,
} from "src/utils/cartPromo";

export default {
  name: "CartPage",
  components: {
    CartDetails: defineAsyncComponent(() =>
      import("components/CartDetails.vue")
    ),
    SimilarItems: defineAsyncComponent(() =>
      import("components/SimilarItems.vue")
    ),
    ConfirmDelete: defineAsyncComponent(() =>
      import("components/ConfirmDelete.vue")
    ),
    CartPromoBanner,
  },
  data() {
    return {
      back_url: "/cart?refresh=1",
      lastPath: "",
      data_slide: {},
      include_utensils: false,
      checkout_url: "/checkout",
      isScrolled: false,
      search_mode: null,
      client_uuid: null,
      auto_promo_candidate: null,
      auto_promo_loading: false,
      auto_promo_attempted_key: null,
      payload: [
        "items",
        "merchant_info",
        "subtotal",
        "total",
        "summary",
        "discount",
        "items_count",
        "check_opening",
        "transaction_info",
        "estimation",
        "distance_local_new",
      ],
    };
  },
  setup() {
    const CartStore = useCartStore();
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    return {
      CartStore,
      DataStorePersisted,
      DataStore,
    };
  },
  async mounted() {
    this.search_mode = this.DataStore.getSearchMode;
    if (auth.authenticated()) {
      const userInfo = auth.getUser();
      this.client_uuid = userInfo?.client_uuid || null;
    }

    try {
      await this.CartStore.getCart(true, this.payload);
      this.DataStorePersisted.recently_change_address = false;
    } catch (error) {}

    this.$watch(
      () => this.CartStore.$state.cart_data,
      () => {
        this.refreshAutoMerchantPromo();
      }
    );
    this.refreshAutoMerchantPromo();

    this.lastPath = this.$router.options.history.state.back;
  },
  computed: {
    merchantDiscount() {
      return cartSavingsDiscount(
        this.CartStore.$state.cart_data,
        this.auto_promo_candidate
      );
    },
    hasVisiblePromo() {
      return !!(
        this.merchantDiscount ||
        this.auto_promo_candidate ||
        this.auto_promo_loading
      );
    },
    cartFooterTotal() {
      return this.CartStore.getTotal || this.CartStore.getSubtotal;
    },
    isAuthenticated() {
      return auth.authenticated();
    },
  },
  methods: {
    formatCartError(error) {
      const value = String(error || "");
      const match = value.match(/^minimum order is\s+(.+)$/i);
      if (match) {
        return `${this.$t("minimum order is")} ${match[1]}`;
      }
      return value;
    },
    translateOrFallback(key, fallback) {
      const translated = this.$t(key);
      return translated === key ? fallback : translated;
    },
    ConfirmDelete() {
      this.$refs.ref_confirm.ConfirmDelete({
        id: null,
        confirm: this.translateOrFallback("Clear Cart?", "Очистить корзину?"),
        icon: "eva-question-mark-circle-outline",
        title: this.translateOrFallback(
          "Are you sure you want to remove all items from your cart?",
          "Вы уверены, что хотите удалить все позиции из корзины?"
        ),
        subtitle: this.translateOrFallback(
          "This action cannot be undone.",
          "Это действие нельзя отменить."
        ),
      });
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    async clearCart() {
      try {
        this.$refs.ref_confirm.modal = false;
        await this.CartStore.clearCart();
        this.DataStorePersisted.cart_uuid = null;
        this.CartStore.getCart(true, this.payload);
      } catch (err) {
        APIinterface.ShowAlert(err, this.$q.capacitor, this.$q);
      }
    },
    afterAdditems(value) {
      console.log("afterAdditems=>", value);
      this.CartStore.getCart(false, this.payload);
    },
    async refresh(done) {
      setTimeout(() => {
        done();
      }, 100);

      try {
        await this.CartStore.getCart(false, this.payload);
      } catch (error) {}
    },
    async refreshAutoMerchantPromo() {
      const cartData = this.CartStore.$state.cart_data;
      if (
        this.auto_promo_loading ||
        !cartData ||
        !this.CartStore.hasItem ||
        !this.CartStore.getMerchantId
      ) {
        return;
      }

      if (this.merchantDiscount) {
        return;
      }

      const key = promoContextKey(cartData);
      if (this.auto_promo_attempted_key === key) {
        return;
      }
      this.auto_promo_attempted_key = key;

      try {
        const results = await this.CartStore.fetchPromo({
          merchant_id: this.CartStore.getMerchantId,
          client_uuid: this.client_uuid || "",
          currency_code: this.DataStorePersisted.getUseCurrency(),
        });
        const promo = autoMerchantOffer(
          results?.details?.data,
          this.CartStore.geTransactiontype
        );
        this.auto_promo_candidate = promo;
        if (promo && this.isAuthenticated) {
          await this.applyAutoMerchantPromo(promo);
        }
      } catch (error) {
        this.auto_promo_candidate = null;
      }
    },
    async applyAutoMerchantPromo(promo = this.auto_promo_candidate) {
      if (
        !promo ||
        this.auto_promo_loading ||
        this.merchantDiscount ||
        !this.CartStore.getCartID ||
        !this.isAuthenticated
      ) {
        return;
      }

      try {
        this.auto_promo_loading = true;
        await APIinterface.applyPromo({
          cart_uuid: this.CartStore.getCartID,
          promo_id: promo.promo_id,
          promo_type: promo.promo_type,
          currency_code: this.DataStorePersisted.getUseCurrency(),
        });
        await this.CartStore.getCart(false, this.payload);
      } catch (error) {
        this.auto_promo_attempted_key = promoContextKey(
          this.CartStore.$state.cart_data
        );
      } finally {
        this.auto_promo_loading = false;
      }
    },
    checkBeforeCheckout() {
      if (
        !this.DataStorePersisted.hasCoordinates &&
        this.search_mode == "address"
      ) {
        this.$router.push({
          path: "/location/map",
          query: { url: this.checkout_url },
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
            query: { redirect: this.checkout_url },
          });
        } else {
          this.$router.push({
            path: "/user/login",
            query: { redirect: this.checkout_url },
          });
        }
        return;
      }
      this.$router.push("/checkout");
    },
    //
  },
};
</script>

<style lang="sass" scoped>
.carousel-container
  position: relative
  width: 100%

.tagam-cart-footer
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom)) !important
  background: rgba(255, 255, 255, 0.88) !important
  backdrop-filter: blur(18px)
  border-top: 1px solid rgba(22, 28, 45, 0.08)

:global(body.body--dark) .tagam-cart-footer
  background: rgba(18, 20, 24, 0.9) !important
  border-top-color: rgba(255, 255, 255, 0.08)

.tagam-cart-checkout-btn
  min-height: 54px
  box-shadow: 0 12px 28px rgba(255, 107, 53, 0.26)

.tagam-cart-details-wrap
  padding-top: 4px
</style>






