<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-header class="text-dark tagam-cart-header">
      <div class="tagam-cart-header-shell">
        <q-toolbar class="tagam-cart-toolbar">
          <q-btn
            @click="$router.back()"
            flat
            round
            dense
            icon="eva-arrow-back-outline"
            class="q-mr-sm"
          />
          <q-toolbar-title>
            <div class="tagam-cart-toolbar__eyebrow">{{ $t("Cart") }}</div>
            <div class="tagam-cart-toolbar__title">
              {{ CartStore.getStore ? CartStore.getStore : $t("Cart") }}
            </div>
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
      </div>
    </q-header>

    <q-page class="flex column page-cart tagam-cart-page q-px-md">
      <q-scroll-observer @scroll="onScroll" />

      <div class="tagam-cart-spacer"></div>

      <div class="cart-items-container col-grow">
        <template v-if="!CartStore.cart_loading">
          <template v-if="!CartStore.hasItem">
            <section class="tagam-section-shell tagam-empty-cart">
              <div class="tagam-empty-cart__badge">Your next meal starts here</div>
              <div class="tagam-empty-cart__title">
                {{ $t("Your cart is empty") }}
              </div>
              <p class="tagam-empty-cart__text">
                {{ $t("You don't have any orders here! let's change that!") }}
              </p>
              <q-btn
                unelevated
                no-caps
                color="primary"
                rounded
                class="tagam-empty-cart-btn"
                :to="{ path: '/home' }"
                :label="$t('Browse restaurants')"
              />
            </section>
          </template>

          <template v-else>
            <section v-if="CartStore.hasError" class="tagam-cart-error">
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
            </section>

            <section class="tagam-section-shell tagam-cart-summary q-mt-md">
              <div class="tagam-section-heading">
                <div>
                  <div class="tagam-section-heading__eyebrow">{{ $t("Order") }}</div>
                  <div class="tagam-section-heading__title">
                    {{ $t("Order Summary") }}
                  </div>
                </div>
                <q-btn
                  :label="$t('Add items')"
                  no-caps
                  unelevated
                  flat
                  color="primary"
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
                />
              </div>

              <CartDetails
                ref="cart_details"
                :is_checkout="true"
                :payload="payload"
                :item_visible="8"
                :money_config="DataStore.money_config"
                :currency_code="DataStorePersisted.use_currency_code"
              />

              <q-separator class="tagam-cart-separator" />

              <q-item clickable @click="ConfirmDelete" class="tagam-empty-cart-row">
                <q-item-section class="text-center text-weight-bold text-red">
                  {{ $t("Empty Cart") }}
                </q-item-section>
              </q-item>
            </section>
          </template>
        </template>
      </div>

      <section
        class="tagam-section-shell q-mt-md q-mb-xl"
        v-if="CartStore.hasItem && !CartStore.cart_loading"
      >
        <div class="tagam-section-heading">
          <div>
            <div class="tagam-section-heading__eyebrow">{{ $t("Extras") }}</div>
            <div class="tagam-section-heading__title">
              {{ $t("Most Order Items") }}
            </div>
          </div>
        </div>
        <SimilarItems
          ref="similar_items"
          :title="$t('Most Order Items')"
          :merchant_id="CartStore.getMerchant.merchant_id"
          :merchant_slug="CartStore.getMerchant.slug"
          :cart_uuid="DataStorePersisted.cart_uuid"
          @after-additems="afterAdditems"
        />
      </section>

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
    class="tagam-cart-footer"
    v-if="CartStore.hasItem && !CartStore.cart_loading"
  >
    <div class="tagam-cart-footer__shell">
      <q-skeleton
        v-if="CartStore.cart_reloading"
        type="QBtn"
        class="full-width q-pa-lg tagam-cart-checkout-btn"
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
        <div class="row items-center justify-between fit text-subtitle2 text-weight-bold">
          <div>{{ $t("Checkout") }}</div>
          <div>{{ CartStore.getSubtotal }}</div>
        </div>
      </q-btn>
    </div>
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
  },
};
</script>

<style scoped>
.tagam-cart-page {
  padding-bottom: 132px;
  background: transparent;
}

.tagam-cart-header {
  background: transparent !important;
  box-shadow: none;
  padding: 10px 12px 0;
}

.tagam-cart-header-shell {
  background: rgba(255, 249, 240, 0.88);
  border: 1px solid rgba(113, 74, 24, 0.12);
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(70, 41, 12, 0.14);
  backdrop-filter: blur(16px);
}

.tagam-cart-toolbar {
  min-height: 72px;
}

.tagam-cart-toolbar__eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a6a4e;
}

.tagam-cart-toolbar__title {
  font-size: 19px;
  font-weight: 900;
  color: #20160f;
}

.tagam-cart-spacer {
  height: 18px;
}

.cart-items-container {
  min-height: 0;
}

.tagam-empty-cart {
  min-height: calc(100vh - 260px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.tagam-empty-cart__badge {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(217, 107, 29, 0.12);
  color: #a94b08;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tagam-empty-cart__title {
  max-width: 280px;
  font-size: 34px;
  line-height: 0.98;
  font-weight: 900;
  color: #20160f;
}

.tagam-empty-cart__text {
  max-width: 320px;
  margin: 14px 0 22px;
  font-size: 15px;
  line-height: 1.5;
  color: #6f6254;
}

.tagam-cart-separator {
  margin-top: 10px;
  background: rgba(113, 74, 24, 0.12);
}

.tagam-empty-cart-row {
  min-height: 54px;
}

.tagam-cart-error {
  background: rgba(255, 241, 240, 0.9);
  color: #b42318;
  border: 1px solid #f5c2c7;
  border-radius: 18px;
  padding: 8px;
}

.tagam-cart-footer {
  background: transparent !important;
  border-top: 0;
  box-shadow: none;
  padding: 0 12px calc(env(safe-area-inset-bottom, 0px) + 12px);
}

.tagam-cart-footer__shell {
  background: rgba(255, 249, 240, 0.9);
  border: 1px solid rgba(113, 74, 24, 0.12);
  border-radius: 28px;
  padding: 10px;
  box-shadow: 0 18px 40px rgba(70, 41, 12, 0.14);
  backdrop-filter: blur(16px);
}

.tagam-cart-checkout-btn {
  border-radius: 20px;
  height: 58px;
  font-weight: 800;
}

.tagam-empty-cart-btn {
  border-radius: 18px;
  padding-left: 22px;
  padding-right: 22px;
  height: 50px;
}

:deep(.q-item) {
  min-height: 52px;
}

:deep(.cart-details-items),
:deep(.cart-details-summary),
:deep(.cart-details-total) {
  background: transparent !important;
}

:deep(.q-list),
:deep(.q-item-section) {
  color: inherit;
}

:global(body.body--dark) .tagam-cart-page {
  background:
    radial-gradient(circle at top, rgba(217, 107, 29, 0.18), transparent 32%),
    linear-gradient(180deg, var(--tagam-bg-strong) 0%, var(--tagam-bg) 100%);
}

:global(body.body--dark) .tagam-cart-header-shell {
  background: rgba(23, 19, 17, 0.94);
  border-bottom: 1px solid var(--tagam-stroke);
  backdrop-filter: blur(18px);
}

:global(body.body--dark) .tagam-cart-toolbar__eyebrow,
:global(body.body--dark) .tagam-section-heading__eyebrow,
:global(body.body--dark) .tagam-empty-cart__badge {
  color: var(--tagam-primary);
}

:global(body.body--dark) .tagam-cart-toolbar__title,
:global(body.body--dark) .tagam-empty-cart__title,
:global(body.body--dark) .tagam-section-heading__title {
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-empty-cart__text,
:global(body.body--dark) .tagam-cart-toolbar .q-btn,
:global(body.body--dark) .tagam-section-heading__meta {
  color: var(--tagam-text-muted);
}

:global(body.body--dark) .tagam-section-shell,
:global(body.body--dark) .tagam-cart-footer__shell {
  background: var(--tagam-surface) !important;
  border-color: var(--tagam-stroke);
  box-shadow: var(--tagam-shadow);
}

:global(body.body--dark) .tagam-cart-separator {
  background: var(--tagam-stroke);
}

:global(body.body--dark) .tagam-cart-error {
  background: rgba(222, 107, 93, 0.12);
  border-color: rgba(222, 107, 93, 0.24);
  color: #ffb1a8;
}
</style>
