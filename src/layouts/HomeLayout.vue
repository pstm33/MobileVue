<template>
  <q-layout view="lHh Lpr lFf">
    <q-footer class="tagam-bottom-nav tagam-surface tagam-text-main shadow-1">
      <q-tabs
        v-model="tab"
        dense
        indicator-color="transparent"
        active-color="primary"
        align="justify"
      >
        <q-route-tab
          name="home"
          icon="eva-home-outline"
          :label="$t('Home')"
          no-caps
          to="/home"
        />
        <q-route-tab
          name="browse"
          icon="o_local_offer"
          :label="$t('Offers')"
          no-caps
          :to="
            search_mode == 'address' ? '/home/offers' : '/home/offers-location'
          "
        />
        <q-route-tab
          name="cart"
          icon="eva-shopping-cart-outline"
          :label="$t('Cart')"
          no-caps
          to="/cart"
          class="tagam-cart-tab"
          :class="{ 'tagam-cart-tab--pulse': cartPulse }"
        >
          <q-badge
            v-if="CartStore.hasItem"
            color="red"
            floating
            rounded
            class="tagam-cart-badge"
          >
            {{ CartStore.getCartCount }}
          </q-badge>
        </q-route-tab>

        <q-route-tab
          name="orders"
          icon="list_alt"
          :label="$t('Orders')"
          no-caps
          to="/home/orders"
        />

        <q-route-tab
          name="account"
          icon="eva-person-outline"
          :label="$t('Account')"
          no-caps
          to="/account-menu"
        />
      </q-tabs>
    </q-footer>

    <q-page-container class="tagam-page-shell">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import { useCartStore } from "stores/CartStore";
import { useDataStore } from "stores/DataStore";

export default defineComponent({
  name: "MainLayout",
  setup() {
    const CartStore = useCartStore();
    const DataStore = useDataStore();
    return {
      CartStore,
      DataStore,
    };
  },
  data() {
    return {
      tab: "home",
      search_mode: null,
      lastCartCount: 0,
      cartPulse: false,
    };
  },
  watch: {
    "CartStore.getCartCount"(value, oldValue) {
      if (typeof oldValue === "undefined" || value === oldValue) {
        return;
      }
      this.cartPulse = false;
      requestAnimationFrame(() => {
        this.cartPulse = true;
        window.setTimeout(() => {
          this.cartPulse = false;
        }, 620);
      });
    },
  },
  async mounted() {
    this.search_mode = this.DataStore.getSearchMode;
    this.lastCartCount = this.CartStore.getCartCount || 0;
    if (!this.CartStore.hasItem) {
      try {
        await this.CartStore.getCart(true, null);
      } catch (error) {}
    }
  },
});
</script>




