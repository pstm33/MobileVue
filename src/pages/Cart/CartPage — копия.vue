<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header
      :class="{
        'border-bottom': !isScrolled,
        'shadow-bottom': isScrolled,
      }"
      class="text-dark"
    >
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          flat
          round
          dense
          icon="eva-arrow-back-outline"
          class="q-mr-sm"
        />
        <q-toolbar-title class="text-subtitle2 text-weight-bold">
          {{ CartStore.getStore ? CartStore.getStore : $t("Cart") }}
        </q-toolbar-title>
        <q-btn
          v-if="CartStore.hasItem && !CartStore.cart_loading"
          flat
          round
          dense
          icon="eva-trash-outline"
          color="disabled"
          @click.stop="ConfirmDelete()"
        />
      </q-toolbar>
    </q-header>
    <q-page class="flex column page-cart">
      <q-scroll-observer @scroll="onScroll" />
      <div class="cart-items-container col-grow">
        <q-space
          v-if="CartStore.hasItem"
          style="height: 5px"
          class="bg-mygrey1"
        ></q-space>
        <template v-if="!CartStore.cart_loading">
          <template v-if="!CartStore.hasItem">
            <div class="text-center q-pa-md absolute-center full-width">
              <div class="text-h6 line-normal text-weight-medium text-dark">
                {{ $t("Your cart is empty") }}
              </div>
              <p class="text-caption text-grey">
                {{ $t("You don't have any orders here! let's change that!") }}
              </p>
            </div>
          </template>
          <template v-else>
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

            <q-item>
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
                  color="blue"
                  padding="0"
                  class="text-weight-medium"
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

        <div class="q-pl-sm q-pr-sm">
          <CartDetails
            ref="cart_details"
            :is_checkout="true"
            :payload="payload"
            :item_visible="8"
            :money_config="DataStore.money_config"
            :currency_code="DataStorePersisted.use_currency_code"
          />
          <template v-if="CartStore.hasItem && !CartStore.cart_loading">
            <q-separator></q-separator>
            <q-item clickable @click="ConfirmDelete">
              <q-item-section class="text-center text-weight-bold text-red">
                {{ $t("Empty Cart") }}
              </q-item-section>
            </q-item>
          </template>
        </div>
        <template v-if="CartStore.hasItem && !CartStore.cart_loading">
          <q-space style="height: 5px" class="bg-mygrey1"></q-space>
        </template>
      </div>

      <div
        class="carousel-container q-pl-md q-pr-md q-mt-md"
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
    class="bg-white q-pa-sm text-dark shadow-1"
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
      class="fit"
      size="lg"
      rounded
      :color="!CartStore.canCheckout ? 'disabled' : 'primary'"
      :text-color="!CartStore.canCheckout ? 'disabled' : 'white'"
      :disable="!CartStore.canCheckout"
    >
      <div
        class="row items-center justify-between fit text-subtitle2 text-weight-bold"
      >
        <div>{{ $t("Checkout") }}</div>
        <div>
          {{ CartStore.getSubtotal }}
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

    if (!this.CartStore.hasItem) {
      try {
        await this.CartStore.getCart(true, null);
      } catch (error) {}
    } else {
      if (this.DataStorePersisted.recently_change_address) {
        try {
          await this.CartStore.getCart(true, null);
          this.DataStorePersisted.recently_change_address = false;
        } catch (error) {}
      }
    }

    this.lastPath = this.$router.options.history.state.back;
  },
  methods: {
    ConfirmDelete() {
      this.$refs.ref_confirm.ConfirmDelete({
        id: null,
        confirm: this.$t("Clear Cart?"),
        icon: "eva-question-mark-circle-outline",
        title: this.$t(
          "Are you sure you want to remove all items from your cart?"
        ),
        subtitle: this.$t("This action cannot be undone."),
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
        this.CartStore.getCart(true, null);
      } catch (err) {
        APIinterface.ShowAlert(err, this.$q.capacitor, this.$q);
      }
    },
    afterAdditems(value) {
      console.log("afterAdditems=>", value);
      this.CartStore.getCart(false, null);
    },
    async refresh(done) {
      setTimeout(() => {
        done();
      }, 100);

      try {
        await this.CartStore.getCart(false, null);
      } catch (error) {}
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

<style scoped>
/* Make the cart items take up remaining space and scroll */
/* .cart-items-container {
  flex-grow: 1;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
} */

/* Fix the carousel at the bottom */
.carousel-container {
  position: relative;
  width: 100%;
}
</style>
