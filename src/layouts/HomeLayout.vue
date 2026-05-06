<template>
  <q-layout view="lHh Lpr lFf" class="tagam-app tagam-page-shell">
    <q-footer v-if="showBottomTabs" class="tagam-footer">
      <div class="tagam-footer-shell">
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
            icon="local_fire_department"
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
      </div>
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
import { useRoute } from "vue-router";

export default defineComponent({
  name: "HomeLayout",
  setup() {
    const CartStore = useCartStore();
    const DataStore = useDataStore();
    const route = useRoute();

    return {
      CartStore,
      DataStore,
      route,
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
  computed: {
    showBottomTabs() {
      return !["/home", "/account-menu"].includes(this.route.path);
    },
  },
});
</script>

<style scoped>
.tagam-app,
.tagam-page-shell {
  background: #ffffff !important;
}

:deep(.q-page-container) {
  background: #ffffff !important;
}

.tagam-footer {
  background: transparent !important;
  border-top: 0 !important;
  box-shadow: none !important;
  padding: 0 12px calc(env(safe-area-inset-bottom, 0px) + 10px);
}

.tagam-footer-shell {
  background: rgba(255, 249, 240, 0.88);
  border: 1px solid rgba(113, 74, 24, 0.12);
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(70, 41, 12, 0.14);
  backdrop-filter: blur(16px);
}

.tagam-bottom-tabs {
  min-height: 74px;
  background: transparent !important;
  border-radius: 28px;
  padding: 4px;
}

.tagam-bottom-tabs :deep(.q-tabs__content) {
  background: transparent !important;
}

.tagam-bottom-tabs :deep(.q-tab) {
  min-height: 66px;
  margin: 0 2px;
  border-radius: 22px;
  color: #6f6254 !important;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.tagam-bottom-tabs :deep(.q-tab__icon) {
  font-size: 21px;
}

.tagam-bottom-tabs :deep(.q-tab__label) {
  font-size: 11px;
  font-weight: 800;
  margin-top: 3px;
}

.tagam-bottom-tabs :deep(.q-router-link--exact-active),
.tagam-bottom-tabs :deep(.q-router-link--exact-active.q-tab),
.tagam-bottom-tabs :deep(.q-router-link--exact-active .q-tab__icon),
.tagam-bottom-tabs :deep(.q-router-link--exact-active .q-tab__label),
.tagam-bottom-tabs :deep(.q-tab--active),
.tagam-bottom-tabs :deep(.q-tab--active .q-tab__icon),
.tagam-bottom-tabs :deep(.q-tab--active .q-tab__label) {
  color: #fff7f0 !important;
}

.tagam-bottom-tabs :deep(.q-router-link--exact-active.q-tab),
.tagam-bottom-tabs :deep(.q-tab--active) {
  background: linear-gradient(135deg, #d96b1d 0%, #a94b08 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(169, 75, 8, 0.24);
}

.tagam-bottom-tabs :deep(.q-tab__indicator) {
  display: none !important;
}

:global(body.body--dark) .tagam-app,
:global(body.body--dark) .tagam-page-shell,
:global(body.body--dark) :deep(.q-page-container) {
  background:
    radial-gradient(circle at top left, rgba(241, 136, 0, 0.08), transparent 24%),
    radial-gradient(circle at top right, rgba(120, 71, 33, 0.12), transparent 22%),
    linear-gradient(180deg, #140f0d 0%, #191311 46%, #1f1815 100%) !important;
}

.tagam-cart-badge {
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  top: 10px;
  right: 10px;
  box-shadow: 0 6px 14px rgba(169, 75, 8, 0.28);
}
</style>
