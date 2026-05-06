<template>
  <q-layout view="lHh Lpr lFf" class="tagam-app">
    <q-footer class="tagam-footer bg-white">
      <q-tabs
        v-model="tab"
        dense
        indicator-color="transparent"
        active-color="primary"
        align="justify"
        class="tagam-bottom-tabs"
      >
        <q-route-tab
          name="home"
          icon="home_outlined"
          :label="$t('Home')"
          no-caps
          to="/home"
        />
        <q-route-tab
          name="browse"
          icon="local_offer"
          :label="$t('Offers')"
          no-caps
          :to="
            search_mode == 'address' ? '/home/offers' : '/home/offers-location'
          "
        />
        <q-route-tab
          name="cart"
          icon="shopping_bag"
          :label="$t('Cart')"
          no-caps
          to="/cart"
        >
          <q-badge
            v-if="CartStore.hasItem"
            color="primary"
            text-color="white"
            floating
            rounded
            class="tagam-cart-badge"
          >
            {{ CartStore.getCartCount }}
          </q-badge>
        </q-route-tab>

        <q-route-tab
          name="orders"
          icon="receipt_long"
          :label="$t('Orders')"
          no-caps
          to="/home/orders"
        />

        <q-route-tab
          name="account"
          icon="person_outline"
          :label="$t('Account')"
          no-caps
          to="/account-menu"
        />
      </q-tabs>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import { useCartStore } from "stores/CartStore";
import { useDataStore } from "stores/DataStore";

export default defineComponent({
  name: "HomeLayout",
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
    };
  },
  async mounted() {
    this.search_mode = this.DataStore.getSearchMode;

    if (!this.CartStore.hasItem) {
      try {
        await this.CartStore.getCart(true, null);
      } catch (error) {
        console.log(error);
      }
    }
  },
});
</script>

<style scoped>
.tagam-footer {
  border-top: 1px solid #f0eadf;
  box-shadow: 0 -4px 18px rgba(0, 0, 0, 0.04);
}

.tagam-bottom-tabs {
  min-height: 68px;
}

.tagam-bottom-tabs :deep(.q-tab) {
  min-height: 68px;
  color: #7a7a7a;
}

.tagam-bottom-tabs :deep(.q-tab__icon) {
  font-size: 22px;
}

.tagam-bottom-tabs :deep(.q-tab__label) {
  font-size: 11px;
  font-weight: 600;
  margin-top: 2px;
}

.tagam-bottom-tabs :deep(.q-router-link--exact-active) {
  color: #f18800 !important;
}

.tagam-cart-badge {
  font-size: 10px;
  min-width: 18px;
  height: 18px;
}
</style>
