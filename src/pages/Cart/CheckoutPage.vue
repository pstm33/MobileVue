<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      class="tagam-checkout-header"
      :class="{ 'border-bottom': !isScrolled, 'shadow-bottom': isScrolled, }"
    >
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          flat
          round
          dense
          icon="eva-arrow-back-outline"
          class="q-mr-sm"
          :color="$q.dark.mode ? 'white' : 'dark'"
        />
        <q-toolbar-title class="text-subtitle2 text-weight-bold">
          {{ getMerchantName() }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="tagam-checkout-page">
      <q-scroll-observer @scroll="onScroll" />
      <template v-if="CartStore.cart_loading">
        <q-item>
          <q-item-section avatar>
            <q-skeleton type="QAvatar" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <q-skeleton type="text" />
            </q-item-label>
            <q-item-label caption>
              <q-skeleton type="text" />
            </q-item-label>
          </q-item-section>
        </q-item>
        <div class="q-pl-md q-pr-md">
          <q-skeleton height="100px" square />
        </div>
      </template>
      <template v-else>
        <q-space style="height: 8px" class="tagam-surface-muted q-mb-md"></q-space>

        <div class="q-pl-md q-pr-md">
          <q-btn-toggle
            v-model="transaction_type"
            color="transparent"
            toggle-color="transparent"
            text-color="primary"
            toggle-text-color="primary"
            no-caps
            unelevated
            class="tagam-checkout-service-toggle rounded-group"
            :options="CartStore.getServices ? CartStore.getServices : []"
            @update:model-value="setTransactionType"
          />
        </div>

        <q-space class="q-pa-sm"></q-space>

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
                  <div>{{ formatCartError(error) }}</div>
                </template>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <q-list dense class="myqlist tagam-checkout-card tagam-checkout-service-card q-mx-md">
          <q-item class="tagam-checkout-service-unified">
            <q-item-section>
              <div class="tagam-checkout-service-line">
                <q-avatar
                  color="orange-1"
                  text-color="primary"
                  :icon="getServiceStatusIcon()"
                  size="md"
                  class="tagam-checkout-line-avatar"
                />
                <div class="tagam-checkout-service-line-main">
                  <q-item-label class="tagam-checkout-service-status-title">
                    {{ getServiceInfoTitle() }}
                  </q-item-label>
                  <q-item-label class="tagam-checkout-service-copy">
                    {{ getServiceInfoSubtitle() }}
                  </q-item-label>
                </div>
              </div>

              <div class="tagam-checkout-service-line tagam-checkout-service-line--time">
                <q-avatar
                  color="orange-1"
                  text-color="primary"
                  icon="o_timer"
                  size="md"
                  class="tagam-checkout-line-avatar"
                />
                <div class="tagam-checkout-service-line-main tagam-checkout-service-time-main">
                  <div class="tagam-checkout-service-time-value">
                    {{ getServiceTimingValue() }}
                  </div>
                  <q-btn
                    v-if="hasScheduleOption()"
                    :label="$t('Change')"
                    no-caps
                    unelevated
                    dense
                    color="primary"
                    text-color="white"
                    class="tagam-checkout-time-action tagam-checkout-time-action--primary"
                    @click.stop="openDeliveryTime"
                  />
                </div>
              </div>

              <div
                v-if="isDeliveryService()"
                v-ripple:purple
                class="tagam-checkout-service-line tagam-checkout-merchant-address cursor-pointer"
                @click="openDeliveryAddress"
              >
                <q-avatar
                  color="orange-1"
                  text-color="primary"
                  icon="eva-pin-outline"
                  size="md"
                  class="tagam-checkout-line-avatar"
                />
                <div class="tagam-checkout-service-line-main">
                  <q-item-label caption>{{ getDeliveryAddressCaption() }}</q-item-label>
                  <q-item-label class="tagam-checkout-merchant-address-main">
                    {{ getDeliveryAddressMain() }}
                  </q-item-label>
                  <q-item-label caption>{{ getDeliveryAddressMeta() }}</q-item-label>
                </div>
                <div class="tagam-checkout-merchant-address-arrow">
                  <q-icon name="eva-arrow-ios-forward-outline" size="xs" />
                </div>
              </div>

              <div
                v-else
                v-ripple:purple
                class="tagam-checkout-service-line tagam-checkout-merchant-address cursor-pointer"
                @click="openServiceMap"
              >
                <q-avatar
                  color="orange-1"
                  text-color="primary"
                  icon="eva-pin-outline"
                  size="md"
                  class="tagam-checkout-line-avatar"
                />
                <div class="tagam-checkout-service-line-main">
                <q-item-label caption>{{ $t("To store address") }}</q-item-label>
                <q-item-label class="tagam-checkout-merchant-address-main">
                  {{ getMerchantAddress() }}
                </q-item-label>
                  <q-item-label caption>{{ CartStore.getDistance1 }}</q-item-label>
                </div>
                <div class="tagam-checkout-merchant-address-arrow">
                  <q-icon name="eva-arrow-ios-forward-outline" size="xs" />
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <q-space class="q-pa-sm"></q-space>

        <template v-if="transaction_type == 'dinein'">
          <q-space style="height: 8px" class="tagam-surface-muted q-mt-mdx"></q-space>
          <div class="q-pa-md">
            <CheckoutBooking
              ref="checkout_booking"
              :room_list="CartStore.getRoomList"
              :table_list="CartStore.getTableList"
            ></CheckoutBooking>
          </div>
        </template>

        <q-space style="height: 8px" class="tagam-surface-muted q-mt-mdx"></q-space>

        <div class="tagam-checkout-order-card q-mx-md">
          <q-list class="tagam-checkout-order-head">
            <q-item>
              <q-item-section avatar class="text-weight-bold text-subtitle2">
                {{ $t("Order Summary") }}
              </q-item-section>
              <q-item-section></q-item-section>
              <q-item-section side>
                <q-btn
                  :label="$t('Add dish')"
                  no-caps
                  unelevated
                  flat
                  color="primary"
                  padding="0"
                  class="text-weight-bold"
                  :to="{
                    name: 'menu',
                    params: { slug: CartStore.getMerchant.slug },
                  }"
                ></q-btn>
              </q-item-section>
            </q-item>
          </q-list>
          <CartDetails
            ref="cart_details"
            :is_checkout="false"
            :payload="payload"
            :item_visible="2"
            @after-removeitem="afterRemoveitem"
          />
          <q-list dense class="tagam-checkout-summary-card tagam-checkout-summary-card--inline">
            <template v-for="items in CartStore.getSummary" :key="items">
              <q-item>
                <q-item-section avatar>
                  {{ displaySummaryName(items.name) }}
                </q-item-section>
                <q-item-section></q-item-section>
                <q-item-section side>{{ items.value }}</q-item-section>
              </q-item>
            </template>
            <template v-if="CartStore.getPoints">
              <template v-if="CartStore.getPoints.points_enabled">
                <q-item dense>
                  <q-item-section class="text-caption text-green-6">
                    {{ CartStore.getPoints.points_label }}
                  </q-item-section>
                </q-item>
              </template>
            </template>
          </q-list>
        </div>
        <!-- <pre>{{ CartStore.getPoints }}</pre> -->

        <q-space style="height: 8px" class="tagam-surface-muted q-mt-md"></q-space>

        <div v-if="hasVisiblePromo" class="q-mx-md q-mb-md">
          <CartPromoBanner
            :discount="merchantDiscount"
            :promo="auto_promo_candidate"
            :loading="auto_promo_loading"
            :can-apply="isAuthenticated"
            @apply="applyAutoMerchantPromo()"
            @open="this.$refs.ref_promo.modal = true"
          />
        </div>

        <q-list class="myqlist tagam-checkout-card tagam-checkout-card--flat q-mx-md">
          <q-item tag="label" clickable>
            <q-item-section>
              <q-item-label class="text-weight-bold text-subtitle2"
                >{{ $t("Cutlery") }}
              </q-item-label>
              <q-item-label caption>{{
                $t("Include utensils, napkins, etc.")
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="include_utensils" color="primary" />
            </q-item-section>
          </q-item>

          <template v-if="CartStore.IsTipenabled">
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold text-subtitle2"
                  >{{ $t("Tip for your courier") }}
                </q-item-label>
                <q-item-label caption>{{
                  $t("100% goes to them! Tipping is voluntary")
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <div class="q-pl-md q-pr-md q-pb-md">
              <TipsList
                :data="CartStore.getTiplist"
                :value="CartStore.getTipData"
                :cart_uuid="CartStore.getCartID"
                :merchant_id="CartStore.getMerchantId"
                :currency_symbol="getUseCurrency"
                :currency_code="DataStorePersisted.getUseCurrency()"
                @after-applytip="loadCart"
              ></TipsList>
            </div>
          </template>

          <q-item-label
            header
            class="tagam-checkout-section-header tagam-text-main text-weight-bold text-subtitle2"
          >
            <div class="flex items-center justify-between">
              <div>{{ $t("Payment details") }}</div>
              <div v-if="!CartStore.isStrictTowallet">
                <q-btn
                  :label="$t('Change')"
                  no-caps
                  unelevated
                  flat
                  color="primary"
                  padding="0"
                  class="text-weight-medium"
                  @click="this.$refs.ref_paymentmethod.modal = true"
                ></q-btn>
              </div>
            </div>
          </q-item-label>

          <template v-if="CartStore.isStrictTowallet">
            <q-item tag="label">
              <q-item-section avatar style="width: 50px">
                <q-icon color="secondary" name="o_account_balance_wallet" />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ CartStore.getWallet?.wallet_balance }}</q-item-label
                >
                <q-item-label lines="2" caption class="font11">
                  {{ $t("Wallet Balance") }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <template v-if="DataStore.digitalwallet_enabled">
              <WalletComponents
                ref="digital_wallet"
                :cart_updated="CartStore.cart_reloading"
                @after-applywallet="afterApplywallet"
              ></WalletComponents>
            </template>

            <q-item
              tag="label"
              @click="this.$refs.ref_paymentmethod.modal = true"
            >
              <q-item-section avatar style="width: 50px">
                <template v-if="CartStore.getPayment?.logo">
                  <q-responsive style="height: 30px; width: 40px">
                    <q-img
                      :src="CartStore.getPayment?.logo || ''"
                      fit="scale-down"
                      spinner-size="xs"
                      spinner-color="primary"
                    />
                  </q-responsive>
                </template>
                <template v-else>
                  <q-icon
                    :color="CartStore.getPayment ? 'primary' : 'red'"
                    :name="
                      CartStore.getPayment
                        ? 'eva-credit-card-outline'
                        : 'eva-alert-triangle-outline'
                    "
                  ></q-icon>
                </template>
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{
                    displayPaymentName(CartStore.getPayment?.attr1) ||
                    $t("Select payment method")
                  }}
                </q-item-label>
                <q-item-label caption>
                  {{ displayPaymentName(CartStore.getPayment?.attr2) || "" }}
                </q-item-label>
                <q-item-label v-if="wallet_data" caption>
                  {{ wallet_data?.pay_remaining || "" }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              dense
              class="tagam-payment-change-row"
              v-if="CartStore.getPayment?.payment_code == 'cod'"
            >
              <q-item-section>
                <q-input
                  v-model="payment_change"
                  ref="ref_payment_change"
                  borderless
                  class="tagam-payment-change-input"
                  type="number"
                  dense
                  :placeholder="$t('Change for how much?')"
                >
                </q-input>
              </q-item-section>
            </q-item>
          </template>

          <template
            v-for="items_discount in CartStore.getDiscountapplied"
            :key="items_discount"
          >
            <q-item>
              <q-item-section avatar style="width: 50px">
                <q-icon name="check_circle" color="green"></q-icon>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-teal-6">{{
                  items_discount.label
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  icon="eva-trash-outline"
                  no-caps
                  unelevated
                  dense
                  text-color="red"
                  @click="removeDiscount(items_discount)"
                ></q-btn>
              </q-item-section>
            </q-item>
          </template>

          <q-item tag="label" @click="this.$refs.ref_promo.modal = true">
            <q-item-section avatar style="width: 50px">
              <q-icon name="o_local_offer" color="primary"></q-icon>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t("Add discount & promo") }}</q-item-label>
            </q-item-section>
            <q-item-section side class="q-mr-xs">
              <q-btn
                :label="$t('Add')"
                rounded
                no-caps
                color="primary"
                text-color="white"
                unelevated
                @click="this.$refs.ref_promo.modal = true"
              ></q-btn>
            </q-item-section>
          </q-item>
        </q-list>
        <q-space class="q-pa-md"></q-space>
      </template>

      <q-inner-loading
        :showing="CartStore.cart_reloading"
        color="primary"
        size="lg"
        label-class="dark"
        class="z-top"
      />
    </q-page>
  </q-pull-to-refresh>

  <q-footer
    v-if="!CartStore.cart_loading"
    class="tagam-checkout-footer tagam-surface q-pa-sm shadow-1"
  >
    <q-skeleton
      v-if="CartStore.cart_reloading"
      type="QBtn"
      class="full-width q-pa-lg radius28"
    />

    <q-btn
      v-else
      unelevated
      no-caps
      class="fit tagam-checkout-place-btn"
      size="lg"
      rounded
      :color="!CartStore.canCheckout ? 'disabled' : 'primary'"
      :text-color="!CartStore.canCheckout ? 'disabled' : 'white'"
      :disable="!CartStore.canCheckout"
      @click="onPlaceorder"
      :loading="loading"
    >
      <div
        class="row items-center justify-between fit text-subtitle2 text-weight-bold"
      >
        <div>{{ $t("Place Order") }}</div>
        <div>{{ CartStore.getTotal }}</div>
      </div>
    </q-btn>
  </q-footer>

  <component
    :is="AddressRecent"
    ref="ref_address"
    :map_provider="
      DataStore.maps_config ? DataStore.maps_config.provider : null
    "
    :is_login="is_login"
    :is_addnew="true"
    :recent_addresses="DataStorePersisted.recent_addresses"
    redirect="/checkout"
    @after-chooseaddress="afterChooseaddress"
    @after-chooselocation="afterChooselocation"
  ></component>

  <component
    :is="AddressDetails"
    ref="ref_address_details"
    :is_address_found="CartStore.getAddress.is_address_found"
    :address_data="
      pending_address_data ||
      (search_mode == 'location'
        ? CartStore.getAddress
        : CartStore.getAddressDetails)
    "
    :maps_config="DataStore.maps_config ?? null"
    :delivery_options_data="DataStore.getDeliveryOptions"
    :enabled_map_selection="
      DataStore.attributes_data?.location_enabled_map_selection || false
    "
    @after-saveaddress="afterSaveaddress"
  ></component>

  <DeliveryTime
    ref="ref_deliverytime"
    :merchant_id="CartStore.getMerchantId"
    :cart_uuid="CartStore.getCartID"
    :save_delivery_date="CartStore.geDeliveryDate"
    :save_delivery_time="CartStore.geDeliveryTime?.start_time || null"
    :is_persistent="is_persistent"
    @after-saveschedule="afterSaveschedule"
  >
  </DeliveryTime>

  <PromoList
    ref="ref_promo"
    :cart_uuid="CartStore.getCartID"
    :merchant_id="CartStore.getMerchantId"
    :currency_code="DataStorePersisted.getUseCurrency()"
    :client_uuid="client_uuid"
    @after-applypromo="loadCart"
  ></PromoList>

  <PaymentMethod
    ref="ref_paymentmethod"
    method="fetchPaymentmethod"
    :merchant_id="CartStore.getMerchantId"
    :is_login="is_login"
    @after-addpayment="loadCart"
  ></PaymentMethod>

  <TimePassedmodal
    ref="ref_timepass"
    @select-anothertime="selectAnothertime"
    @clear-cart="clearCart"
  >
  </TimePassedmodal>

  <q-dialog
    v-model="show_service_map"
    position="standard"
    @show="onServiceMapShow"
  >
    <q-card class="tagam-checkout-service-map-dialog">
      <q-card-section class="row items-center q-pb-none">
        <q-card-section class="q-pa-none">
          <div class="text-subtitle2 text-weight-bold">
            {{ getServiceMapTitle() }}
          </div>
          <div class="text-caption text-grey-7">
            {{ getServiceMapSubtitle() }}
          </div>
        </q-card-section>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="eva-close-outline"
          size="md"
          color="grey-8"
          v-close-popup
        />
      </q-card-section>
      <q-separator />

      <q-card-section class="tagam-checkout-service-map-card">
        <template v-if="DataStore.hasMapConfig && show_service_map">
          <MapsComponents
            ref="service_map_ref"
            class="tagam-checkout-service-map"
            size="fit"
            :keys="DataStore.maps_config.key"
            :provider="DataStore.maps_config.provider"
            :zoom="service_map_zoom"
            :language="DataStore.maps_config.language"
            :map_id="DataStore.maps_config.map_id || DataStore.maps_config.mapId || ''"
            :center="service_map_center"
            :markers="service_map_markers"
            :zoom_control="true"
            @set-error="setServiceMapError"
          />
        </template>
        <div v-else class="tagam-checkout-service-map-empty">
          {{ $t("Map provider is not configured.") }}
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <CheckoutWalletfunds
    ref="wallet_funds"
    @after-topup="loadCart"
    :data="CartStore.getWallet"
  />

  <AddFundsSuccessful ref="ref_addfundsuccess"></AddFundsSuccessful>

  <!-- PAYMENT METHOD  -->

  <StripeComponents
    ref="stripe"
    payment_code="stripe"
    :title="$t('Stripe')"
    @after-payment="afterPayment"
  />
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDeliveryschedStore } from "stores/DeliverySched";
import { useCartStore } from "stores/CartStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "stores/DataStore";
import { useClientStore } from "stores/ClientStore";
import auth from "src/api/auth";
import APIinterface from "src/api/APIinterface";
import { Browser } from "@capacitor/browser";
import {
  formatReadableDateTime,
  normalizeBackendLabel,
  repairMojibake,
} from "src/utils/textEncoding";
import CartPromoBanner from "components/CartPromoBanner.vue";
import {
  cartSavingsDiscount,
  autoMerchantOffer,
  promoContextKey,
} from "src/utils/cartPromo";

export default {
  name: "CheckoutPage",
  components: {
    CartDetails: defineAsyncComponent(() =>
      import("components/CartDetails.vue")
    ),
    MapsComponents: defineAsyncComponent(() =>
      import("components/MapsComponents.vue")
    ),
    OrderStatusAnimation: defineAsyncComponent(() =>
      import("components/OrderStatusAnimation.vue")
    ),
    DeliveryTime: defineAsyncComponent(() =>
      import("components/DeliveryTime.vue")
    ),
    TipsList: defineAsyncComponent(() => import("components/TipsList.vue")),
    WalletComponents: defineAsyncComponent(() =>
      import("components/WalletComponents.vue")
    ),
    PromoList: defineAsyncComponent(() => import("components/PromoList.vue")),
    PaymentMethod: defineAsyncComponent(() =>
      import("components/PaymentMethod.vue")
    ),
    TimePassedmodal: defineAsyncComponent(() =>
      import("components/TimePassedmodal.vue")
    ),
    CheckoutBooking: defineAsyncComponent(() =>
      import("components/CheckoutBooking.vue")
    ),
    CheckoutWalletfunds: defineAsyncComponent(() =>
      import("components/CheckoutWalletfunds.vue")
    ),
    AddFundsSuccessful: defineAsyncComponent(() =>
      import("components/AddFundsSuccessful.vue")
    ),
    // PAYMENT METHOD
    StripeComponents: defineAsyncComponent(() =>
      import("components/StripeComponents.vue")
    ),
    CartPromoBanner,
  },
  data() {
    return {
      loading: false,
      include_utensils: false,
      transaction_type: null,
      is_login: false,
      isScrolled: false,
      client_uuid: null,
      payment_change: null,
      is_persistent: false,
      is_afterpay: false,
      wallet_data: null,
      show_service_map: false,
      search_mode: null,
      location_data: null,
      manual_service_state: {
        active: false,
        cart_uuid: null,
        merchant_id: null,
        transaction_type: null,
        whento_deliver: null,
        delivery_date: null,
        delivery_time: null,
      },
      service_map_markers: {},
      service_map_center: { lat: 34.04703, lng: -118.24686 },
      service_map_zoom: "16",
      service_sync_pending: false,
      pending_address_data: null,
      auto_promo_candidate: null,
      auto_promo_loading: false,
      auto_promo_attempted_key: null,
      payload: [
        "items",
        "merchant_info",
        "service_fee",
        "delivery_fee",
        "packaging",
        "tax",
        "tips",
        "checkout",
        "discount",
        "distance_local_new",
        "summary",
        "subtotal",
        "total",
        "items_count",
        "check_opening",
        "transaction_info",
        "card_fee",
        "points",
        "points_discount",
        "estimation",
      ],
    };
  },
  setup() {
    const schedStore = useDeliveryschedStore();
    const CartStore = useCartStore();
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    const ClientStore = useClientStore();

    const searchMode = DataStore.getSearchMode;
    const AddressRecent = defineAsyncComponent(() =>
      searchMode == "location"
        ? import("components/AddressRecentLocation.vue")
        : import("components/AddressRecent.vue")
    );

    const AddressDetails = defineAsyncComponent(() =>
      searchMode == "location"
        ? import("components/AddressDetailsLocation.vue")
        : import("components/AddressDetails.vue")
    );

    return {
      schedStore,
      CartStore,
      DataStorePersisted,
      DataStore,
      ClientStore,
      AddressRecent,
      AddressDetails,
    };
  },
  async mounted() {
    const message = this.$route.query.error;
    const success_message = this.$route.query.success_message;
    if (message) {
      APIinterface.ShowAlert(message, this.$q.capacitor, this.$q);
    }

    if (success_message) {
      setTimeout(() => {
        this.$refs.ref_addfundsuccess.message = success_message;
        this.$refs.ref_addfundsuccess.modal = true;
      }, 1000);
    }

    this.search_mode = this.DataStore.getSearchMode;
    this.location_data = this.DataStorePersisted.getLocation;

    this.is_afterpay = false;
    this.is_persistent = false;
    this.is_login = auth.authenticated();
    if (this.is_login) {
      const userInfo = auth.getUser();
      this.client_uuid = userInfo?.client_uuid || null;
    }

    await this.CartStore.getCart(true, this.payload);
    this.refreshAutoMerchantPromo();

    this.$watch(
      () => this.CartStore.$state.cart_data,
      (newData, oldData) => {
        if (this.is_afterpay) {
          return;
        }

        // if (!newData) {
        //   this.$router.push("/home");
        //   return;
        // }
        // const cartCount = newData.items_count ?? 0;
        // if (cartCount <= 0) {
        //   this.$router.push("/home");
        //   return;
        // }
        const desiredTransaction = this.getDesiredTransactionInfo(
          newData?.transaction_info || {}
        );
        if (desiredTransaction) {
          this.transaction_type = desiredTransaction.transaction_type;
          this.updateLocalTransactionInfo({
            transaction_info: desiredTransaction,
          });
          this.reconcileCheckoutTransaction(desiredTransaction);
        } else {
          this.transaction_type = this.CartStore.geTransactiontype;
          this.syncManualServiceState(newData);
          const serverState = newData?.transaction_info || {};
          const resolvedState = this.getResolvedServiceState();
          if (
            this.isManualServiceStateValid() &&
            !this.isTransactionInfoMatch(resolvedState, serverState)
          ) {
            this.reconcileCheckoutTransaction(resolvedState);
            return;
          }
          this.syncScheduleStore(newData);
        }

        setTimeout(() => {
          if (this.$refs.ref_timepass) {
            this.$refs.ref_timepass.modal = newData.time_already_passed;
          }
        }, 100);
        this.refreshAutoMerchantPromo();
      }
    );
  },
  computed: {
    isWeb() {
      if (!this.$q.capacitor) {
        return true;
      }
      return false;
    },
    getUseCurrency() {
      return this.DataStore.money_config?.suffix || "";
    },
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
    isAuthenticated() {
      return auth.authenticated();
    },
  },
  methods: {
    isCurrentCartContext() {
      const cartId = this.CartStore.getCartID;
      const merchantId = this.CartStore.getMerchantId;
      if (!cartId || !merchantId) {
        return false;
      }

      return (
        String(this.schedStore.selected_cart_uuid) === String(cartId) &&
        String(this.schedStore.selected_merchant_id) === String(merchantId)
      );
    },
    getCurrentTransactionType() {
      if (this.transaction_type) {
        return this.transaction_type;
      }

      if (
        this.isManualServiceStateValid() &&
        this.manual_service_state.transaction_type
      ) {
        return this.manual_service_state.transaction_type;
      }

      if (
        this.schedStore?.transaction_type &&
        this.isCurrentCartContext()
      ) {
        return this.schedStore.transaction_type;
      }

      return this.CartStore.geTransactiontype || null;
    },
    getCurrentDeliveryType() {
      if (this.isManualServiceStateValid() && this.manual_service_state.whento_deliver) {
        return this.manual_service_state.whento_deliver;
      }

      if (this.schedStore?.whento_deliver && this.isCurrentCartContext()) {
        return this.schedStore.whento_deliver;
      }

      if (this.CartStore.geDeliverytype) {
        return this.CartStore.geDeliverytype;
      }

      if (this.transaction_type) {
        return this.transaction_type === "dinein" ? "now" : "now";
      }

      return "now";
    },
    getCurrentDeliveryDate() {
      if (
        this.schedStore.delivery_date &&
        this.isCurrentCartContext()
      ) {
        return this.schedStore.delivery_date;
      }
      if (this.isManualServiceStateValid()) {
        return this.manual_service_state.delivery_date;
      }
      return this.CartStore.geDeliveryDate;
    },
    getCurrentDeliveryTime() {
      if (
        this.schedStore.delivery_time &&
        this.isCurrentCartContext()
      ) {
        return this.schedStore.delivery_time;
      }
      if (this.isManualServiceStateValid()) {
        return this.manual_service_state.delivery_time;
      }
      return this.CartStore.geDeliveryTime;
    },
    isManualServiceStateValid() {
      const cartUuid = this.CartStore.getCartID;
      const merchantId = this.CartStore.getMerchantId;
      return !!(
        this.manual_service_state.active &&
        cartUuid &&
        merchantId &&
        String(this.manual_service_state.cart_uuid) === String(cartUuid) &&
        String(this.manual_service_state.merchant_id) === String(merchantId)
      );
    },
    syncManualServiceState(data = {}) {
      const source = data?.transaction_info || data || {};
      const hasSource =
        source &&
        (Object.prototype.hasOwnProperty.call(source, "transaction_type") ||
          Object.prototype.hasOwnProperty.call(source, "whento_deliver") ||
          Object.prototype.hasOwnProperty.call(source, "delivery_date") ||
          Object.prototype.hasOwnProperty.call(source, "delivery_time"));

      if (!hasSource || !this.CartStore.getCartID || !this.CartStore.getMerchantId) {
        return;
      }

      this.manual_service_state = {
        ...this.manual_service_state,
        active: true,
        cart_uuid: this.CartStore.getCartID,
        merchant_id: this.CartStore.getMerchantId,
        transaction_type:
          Object.prototype.hasOwnProperty.call(source, "transaction_type")
            ? source.transaction_type
            : this.manual_service_state.transaction_type ||
              this.transaction_type ||
              this.CartStore.geTransactiontype ||
              null,
        whento_deliver:
          Object.prototype.hasOwnProperty.call(source, "whento_deliver")
            ? source.whento_deliver
            : this.manual_service_state.whento_deliver || this.getCurrentDeliveryType(),
        delivery_date:
          Object.prototype.hasOwnProperty.call(source, "delivery_date")
            ? source.delivery_date
            : this.manual_service_state.delivery_date || this.CartStore.geDeliveryDate,
        delivery_time:
          Object.prototype.hasOwnProperty.call(source, "delivery_time")
            ? source.delivery_time
            : this.manual_service_state.delivery_time || this.CartStore.geDeliveryTime,
      };
    },
    getResolvedServiceState() {
      return {
        transaction_type: this.getCurrentTransactionType(),
        whento_deliver: this.getCurrentDeliveryType(),
        delivery_date: this.getCurrentDeliveryDate(),
        delivery_time: this.getCurrentDeliveryTime(),
      };
    },
    isTransactionInfoMatch(localInfo, serverInfo = {}) {
      const localType = localInfo?.transaction_type || "";
      const serverType = serverInfo?.transaction_type || "";
      if (localType && serverType && localType !== serverType) {
        return false;
      }

      const localWhen = localInfo?.whento_deliver || "";
      const serverWhen = serverInfo?.whento_deliver || "";
      if (localWhen && serverWhen && localWhen !== serverWhen) {
        return false;
      }

      if (localWhen === "schedule") {
        if (
          localInfo.delivery_date &&
          serverInfo.delivery_date &&
          localInfo.delivery_date !== serverInfo.delivery_date
        ) {
          return false;
        }
        if (
          localInfo.delivery_time &&
          serverInfo.delivery_time &&
          this.getScheduleTimeValue(localInfo.delivery_time) !==
            this.getScheduleTimeValue(serverInfo.delivery_time)
        ) {
          return false;
        }
      }

      return true;
    },
    normalizeScheduleDate(value) {
      if (!value) return "";
      if (typeof value === "string") return value.trim();
      if (typeof value === "object") {
        return String(
          value.value ||
          value.pretty_date ||
          value.date ||
          value.day ||
          ""
        ).trim();
      }
      return String(value).trim();
    },
    normalizeScheduleTime(value) {
      if (!value) return "";
      if (typeof value === "string") return value.trim();
      if (typeof value === "object") {
        return String(
          value.pretty_time ||
          [value.start_time, value.end_time].filter(Boolean).join(" - ") ||
          value.value ||
          ""
        ).trim();
      }
      return String(value).trim();
    },
    formatCartError(error) {
      const value = String(error || "");
      const match = value.match(/^minimum order is\s+(.+)$/i);
      if (match) {
        return `${this.$t("minimum order is")} ${match[1]}`;
      }
      return value;
    },
    displayDeliveryOption(item) {
      if (item?.value === "schedule") {
        const currentType = this.getCurrentTransactionType();
        if (currentType === "pickup") {
          return this.$t("Choose pickup time");
        }
        if (currentType === "dinein") {
          return this.$t("Choose visit time");
        }
        return this.$t("Choose delivery time");
      }
      const label = repairMojibake(item?.name || "");
      const translated = this.$t(label);
      return translated === label ? label : translated;
    },
    displayDeliveryOptionEstimation(item) {
      if (item?.value === "schedule") {
        return this.getSelectedScheduleLabel();
      }
      return this.displayEstimation(item?.estimation);
    },
    getServiceFallbackLabel(value) {
      const fallback = {
        delivery: this.$t("Delivery"),
        pickup: this.$t("Pickup"),
        dinein: this.$t("Takeout"),
      };
      return fallback[value] || "";
    },
    getCurrentServiceLabel() {
      const type = this.getCurrentTransactionType();
      const raw =
        this.CartStore.geTransactiontypePretty ||
        this.getServiceLabel(type) ||
        this.getServiceFallbackLabel(type);
      const label = normalizeBackendLabel(raw || "");
      const translated = this.$t(label);
      if (translated !== label) {
        return translated;
      }
      return this.displayEstimation(label) || this.getServiceFallbackLabel(type);
    },
    formatScheduleDateLabel(value) {
      if (!value) return "";
      const parsedDate = new Date(`${value}T00:00:00`);

      if (Number.isNaN(parsedDate.getTime())) {
        return formatReadableDateTime(value);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (parsedDate.getTime() === today.getTime()) {
        return this.$t("Today").toLowerCase();
      }

      if (parsedDate.getTime() === tomorrow.getTime()) {
        return this.$t("Tomorrow").toLowerCase();
      }

      const localeMap = { ru: "ru-RU", tk: "tk-TM", en: "en-US" };
      const locale = localeMap[this.$i18n?.locale] || localeMap.ru;
      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
      }).format(parsedDate);
    },
    formatScheduleTimeLabel(value) {
      if (!value) return "";
      const raw =
        typeof value === "string"
          ? value
          : value.pretty_time ||
            [value.start_time, value.end_time].filter(Boolean).join(" - ") ||
            value.value ||
            "";
      return this.displayEstimation(formatReadableDateTime(raw));
    },
    getSelectedScheduleLabel() {
      const deliveryType = this.getCurrentDeliveryType();
      if (deliveryType !== "schedule") return "";

      const dateLabel = this.formatScheduleDateLabel(
        this.getCurrentDeliveryDate()
      );
      const timeLabel = this.formatScheduleTimeLabel(
        this.getCurrentDeliveryTime()
      );
      if (!dateLabel || !timeLabel) {
        return dateLabel || timeLabel || "";
      }

      const connector =
        this.$i18n?.locale === "ru" ? ` ${this.$t("with")} ` : ` ${this.$t("at")} `;
      return `${dateLabel}${connector}${timeLabel}`.trim();
    },
    displayServiceTimingTitle() {
      const serviceLabel = this.getCurrentServiceLabel();
      const scheduleLabel = this.getSelectedScheduleLabel();
      if (scheduleLabel) {
        return `${serviceLabel} ${scheduleLabel}`.trim();
      }

      const estimation = this.displayEstimation(this.CartStore.getEstimatetime1);
      const normalizedEstimation = estimation.toLowerCase();
      const normalizedService = serviceLabel.toLowerCase();

      if (
        normalizedService &&
        normalizedEstimation.includes(normalizedService)
      ) {
        return estimation;
      }

      return [serviceLabel, estimation].filter(Boolean).join(" ");
    },
    hasScheduleOption() {
      const deliveryOptions = this.CartStore.getDeliveryOptions2 || [];
      const legacyOptions = this.CartStore.getDeliveryOptionsList || [];
      return !![...deliveryOptions, ...legacyOptions].some(
        (item) => item?.value === "schedule"
      );
    },
    openDeliveryTime() {
      this.$refs.ref_deliverytime.modal = true;
    },
    isScheduleSelected() {
      return this.getCurrentDeliveryType() === "schedule";
    },
    getNowDeliveryOption() {
      const options = [
        ...(this.CartStore.getDeliveryOptions2 || []),
        ...(this.CartStore.getDeliveryOptionsList || []),
      ];
      return (
        options.find((item) => item.value === "now") ||
        options.find((item) => item.value !== "schedule") ||
        null
      );
    },
    cleanEstimateLabel(value) {
      let label = this.displayEstimation(value || "")
        .replace(/\s+/g, " ")
        .trim();

      const serviceFallback = [
        this.$t("Delivery"),
        this.$t("Pickup"),
        this.$t("Takeout"),
      ];
      serviceFallback.forEach((service) => {
        if (!service) return;
        if (label.toLowerCase().startsWith(service.toLowerCase())) {
          label = label.slice(service.length).trim();
        }
      });

      const through = this.$t("in").toLowerCase();
      if (label && /\d/.test(label) && !new RegExp(`^${through}\\b`, "i").test(label)) {
        label = `${through} ${label}`;
      }
      if (this.$i18n?.locale === "ru" && /\bмин\b/i.test(label)) {
        label = label.replace(/^в\s+/i, `${this.$t("after")} `);
      }

      return label ? label.charAt(0).toUpperCase() + label.slice(1) : "";
    },
    capitalizeFirst(value) {
      const label = String(value || "").trim();
      return label ? label.charAt(0).toUpperCase() + label.slice(1) : "";
    },
    getNowEstimateLabel() {
      const option = this.getNowDeliveryOption();
      return this.cleanEstimateLabel(option?.estimation || this.CartStore.getEstimatetime1);
    },
    getServiceTimingValue() {
      if (this.isScheduleSelected()) {
        const dateLabel = this.capitalizeFirst(
          this.formatScheduleDateLabel(
            this.getCurrentDeliveryDate()
          )
        );
        const timeLabel = this.formatScheduleTimeLabel(
          this.getCurrentDeliveryTime()
        );

        if (dateLabel && timeLabel) {
          const connector =
            this.$i18n?.locale === "ru" ? ` ${this.$t("with")} ` : ` ${this.$t("at")} `;
          return `${dateLabel}${connector}${timeLabel}`;
        }
        return dateLabel || timeLabel || this.getNowEstimateLabel();
      }

      return this.getNowEstimateLabel();
    },
    getServiceInfoTitle() {
      const type = this.getCurrentTransactionType();
      if (type === "delivery") return this.$t("This is delivery");
      if (type === "pickup") return this.$t("This is pickup");
      return this.$t("This is takeout");
    },
    getServiceInfoSubtitle() {
      const type = this.getCurrentTransactionType();
      if (type === "delivery") {
        return this.translateMerchantText(
          "from restaurant {restaurant_name}"
        );
      }
      if (type === "pickup") {
        return this.translateMerchantText("Please pick up your order at {restaurant_name}.");
      }
      return this.translateMerchantText(
        "You will be notified when your order is ready. Pick up at {restaurant_name}."
      );
    },
    getServiceStatusIcon() {
      const type = this.getCurrentTransactionType();
      if (type === "delivery") return "directions_bike";
      if (type === "pickup") return "restaurant";
      return "shopping_bag";
    },
    isDeliveryService() {
      return this.getCurrentTransactionType() === "delivery";
    },
    cleanHtmlLabel(value) {
      return repairMojibake(String(value || ""))
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    },
    getMerchantName() {
      return this.cleanHtmlLabel(
        this.CartStore.getMerchant?.restaurant_name || this.CartStore.getStore
      );
    },
    translateMerchantText(key) {
      const merchantName = this.getMerchantName();
      return this.cleanHtmlLabel(this.$t(key))
        .replace(/\{restaurant_name\}/g, merchantName)
        .replace(/\{\{restaurant_name\}\}/g, merchantName);
    },
    getMerchantAddress() {
      return this.cleanHtmlLabel(
        this.CartStore.getMerchant?.merchant_address ||
          this.CartStore.getMerchant?.address ||
          this.$t("Address not available")
      );
    },
    getDeliveryAddressCaption() {
      return this.CartStore.getAddress?.is_address_found
        ? this.$t("to address")
        : this.$t("Delivery address");
    },
    getDeliveryAddressMain() {
      const address = this.CartStore.getAddress || {};
      if (!address?.is_address_found) {
        return this.$t("Complete your address details");
      }
      return this.cleanHtmlLabel(
        address.name ||
          address.address_label ||
          address.complete_address ||
          address.address ||
          this.$t("Address not found")
      );
    },
    getDeliveryAddressMeta() {
      const address = this.CartStore.getAddress || {};
      if (!address?.is_address_found) {
        return this.$t("Tap to update address");
      }
      return this.cleanHtmlLabel(
        address.address_details ||
          address.instructions ||
          address.complete_address ||
          address.address ||
          this.CartStore.getDistance
      );
    },
    openDeliveryAddress() {
      if (this.search_mode == "location") {
        this.handleAddEditAddress(this.CartStore.getAddress?.is_address_found);
        return;
      }
      if (this.$refs.ref_address) {
        this.$refs.ref_address.tab = auth.authenticated()
          ? "saved"
          : "recent_search";
        this.$refs.ref_address.modal = true;
      }
    },
    getMerchantMapUrl() {
      const merchant = this.CartStore.getMerchant || {};
      if (merchant.map_direction) return merchant.map_direction;
      if (merchant.map_url) return merchant.map_url;
      if (merchant.map_link) return merchant.map_link;

      const lat =
        merchant.latitude || merchant.lat || merchant.merchant_latitude || "";
      const lng =
        merchant.longitude || merchant.lng || merchant.merchant_longitude || "";
      if (lat && lng) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${lat},${lng}`
        )}`;
      }

      const query = [this.getMerchantName(), this.getMerchantAddress()]
        .filter(Boolean)
        .join(", ");
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        query
      )}`;
    },
    openServiceMap() {
      this.buildServiceMapMarkers();
      this.show_service_map = true;
    },
    onServiceMapShow() {
      this.$nextTick(() => {
        window.setTimeout(() => {
          if (typeof this.$refs.service_map_ref?.refreshMapSize === "function") {
            this.$refs.service_map_ref.refreshMapSize();
          }
          this.tryDrawServiceRoute();
        }, 250);
      });
    },
    resolveServiceMapPoint(item) {
      const lat = parseFloat(item?.lat);
      const lng = parseFloat(item?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }
      return {
        lat,
        lng,
      };
    },
    resolveMapRoutePoint(item, provider) {
      const point = this.resolveServiceMapPoint(item);
      if (!point) return null;
      if (provider === "mapbox") {
        return [point.lng, point.lat];
      }
      return point;
    },
    buildServiceMapMarkers() {
      const merchant = this.CartStore.getMerchant || {};
      const address = this.CartStore.getAddress || {};
      const config = this.DataStore.maps_config || {};

      const merchantPoint = this.resolveServiceMapPoint({
        lat: merchant.latitude || merchant.lat || merchant.merchant_latitude,
        lng: merchant.longitude || merchant.lng || merchant.merchant_longitude,
      });
      const addressPoint = this.resolveServiceMapPoint({
        lat: address.latitude || address.lat || address.address_latitude,
        lng: address.longitude || address.lng || address.address_longitude,
      });

      const defaultIcon = this.$t("Tag map marker");
      const markerIconMerchant = config.provider == "mapbox"
        ? "marker_icon_merchant"
        : config.icon_merchant || defaultIcon;
      const markerIconDestination = config.provider == "mapbox"
        ? "marker_icon_destination"
        : config.icon_destination || defaultIcon;

      const markers = {};
      let center = null;

      if (merchantPoint) {
        markers[0] = {
          lat: merchantPoint.lat,
          lng: merchantPoint.lng,
          label: "",
          icon: markerIconMerchant,
          draggable: false,
          title: this.getMerchantName(),
          id: 0,
        };
        center = markers[0];
      }

      if (
        this.isDeliveryService() &&
        addressPoint
      ) {
        markers[1] = {
          lat: addressPoint.lat,
          lng: addressPoint.lng,
          label: "",
          icon: markerIconDestination,
          draggable: false,
          title: this.getDeliveryAddressMain(),
          id: 1,
        };
        if (!center) {
          center = markers[1];
        }
      }

      if (!center && markers[0]) {
        center = markers[0];
      }
      if (!center) {
        center = { lat: 34.04703, lng: -118.24686 };
      }

      this.service_map_markers = markers;
      this.service_map_center = {
        lat: parseFloat(center.lat),
        lng: parseFloat(center.lng),
      };
      this.service_map_zoom = "16";
    },
    tryDrawServiceRoute() {
      const mapRef = this.$refs.service_map_ref;
      if (!mapRef || !this.isDeliveryService()) return;
      if (typeof mapRef.addRoute !== "function") return;

      const points = Object.entries(this.service_map_markers || {});
      if (!points || points.length < 2) return;

      const provider = this.DataStore.maps_config?.provider;
      const start = this.resolveMapRoutePoint(this.service_map_markers[0], provider);
      const end = this.resolveMapRoutePoint(this.service_map_markers[1], provider);
      if (!start || !end) return;

      mapRef.addRoute(start, end);
    },
    getServiceMapTitle() {
      const type = this.getCurrentTransactionType();
      const serviceLabel =
        this.getServiceFallbackLabel(type) ||
        this.getCurrentServiceLabel() ||
        this.$t("Service");
      return `${serviceLabel} ${this.getMerchantName()}`.trim();
    },
    getServiceMapSubtitle() {
      if (this.isDeliveryService()) {
        return this.getDeliveryAddressMain();
      }
      return this.getMerchantAddress();
    },
    setServiceMapError(error) {
      this.$q.notify({
        color: "negative",
        message: this.cleanError(error),
        icon: "warning",
      });
    },
    cleanError(value) {
      if (!value) return this.$t("Failed rendering map.");
      const message = value?.message || String(value);
      return message || this.$t("Failed rendering map.");
    },
    async openMerchantMap() {
      const url = this.getMerchantMapUrl();
      if (!url) return;
      if (this.$q.capacitor) {
        await Browser.open({ url });
      } else {
        window.open(url, "_blank", "noopener");
      }
    },
    displaySummaryName(value) {
      const label = normalizeBackendLabel(value);
      const translated = this.$t(label);
      return translated === label ? label : translated;
    },
    displayPaymentName(value) {
      if (!value) return "";
      const label = normalizeBackendLabel(value);
      const translated = this.$t(label);
      const paymentLabel = translated === label ? label : translated;
      if (this.transaction_type !== "delivery") {
        return paymentLabel.replace("при доставке", this.$t("upon pickup"));
      }
      return paymentLabel;
    },
    displayEstimation(value) {
      if (!value) return "";
      return String(value)
        .replace(/\bToday,\s*/gi, `${this.$t("Today")}, `)
        .replace(/\bTomorrow,\s*/gi, `${this.$t("Tomorrow")}, `)
        .replace(/\bin\b/gi, this.$t("in"))
        .replace(/\bDelivery\b/gi, this.$t("Delivery"))
        .replace(/\bPickup\b/gi, this.$t("Pickup"))
        .replace(/\bDinein\b/gi, this.$t("Takeout"))
        .replace(/\bmins?\b/gi, this.$t("mins"))
        .replace(/\bminutes?\b/gi, this.$t("mins"))
        .replace(/(\d{1,2}:\d{2}):\d{2}/g, "$1");
    },
    getServiceLabel(value) {
      const option = this.CartStore.getServices?.find(
        (item) => item.value === value
      );
      return option?.label || option?.name || "";
    },
    syncScheduleStore(data = {}) {
      const info = data?.transaction_info || data || {};
      const cartUuid = this.CartStore.getCartID;
      const merchantId = this.CartStore.getMerchantId;

      if (!cartUuid || !merchantId) {
        return;
      }

      this.schedStore.selected_cart_uuid = cartUuid;
      this.schedStore.selected_merchant_id = merchantId;

      if (info.transaction_type) {
        this.schedStore.transaction_type = info.transaction_type;
      }
      if (info.whento_deliver) {
        this.schedStore.whento_deliver = info.whento_deliver;
      }
      if (Object.prototype.hasOwnProperty.call(info, "delivery_date")) {
        this.schedStore.delivery_date = info.delivery_date || "";
      }
      if (Object.prototype.hasOwnProperty.call(info, "delivery_time")) {
        this.schedStore.delivery_time = info.delivery_time || "";
      }
      if (info.whento_deliver_pretty) {
        this.schedStore.whento_deliver_pretty = info.whento_deliver_pretty;
      }
      this.syncManualServiceState(info);
    },
    withSelectedTransactionInfo(data = {}, extraInfo = {}) {
      const transactionType =
        extraInfo.transaction_type ||
        this.getCurrentTransactionType();
      const deliveryType =
        extraInfo.whento_deliver ||
        this.getCurrentDeliveryType();
      const currentInfo = this.CartStore.cart_data?.transaction_info || {};
      const responseInfo = data?.transaction_info || {};

      return {
        ...data,
        transaction_info: {
          ...currentInfo,
          ...responseInfo,
          ...extraInfo,
          transaction_type:
            responseInfo.transaction_type ||
            transactionType ||
            currentInfo.transaction_type,
          transaction_type_pretty:
            responseInfo.transaction_type_pretty ||
            this.getServiceLabel(transactionType) ||
            currentInfo.transaction_type_pretty,
          whento_deliver:
            responseInfo.whento_deliver ||
            deliveryType ||
            currentInfo.whento_deliver,
        },
      };
    },
    updateLocalTransactionInfo(data = {}) {
      this.syncScheduleStore(data);
      if (!this.CartStore.cart_data) return;
      const mergedData = this.withSelectedTransactionInfo(data);
      this.syncScheduleStore(mergedData);
      this.syncManualServiceState(mergedData);
      this.CartStore.cart_data = {
        ...this.CartStore.cart_data,
        ...mergedData,
      };
    },
    getDesiredTransactionInfo(serverInfo = {}) {
      const selectedState = this.getResolvedServiceState();
      const selectedType = selectedState.transaction_type;
      if (!selectedType) return null;

      const selectedMerchant = this.schedStore.selected_merchant_id;
      const currentMerchant = this.CartStore.getMerchantId;
      if (
        selectedMerchant &&
        currentMerchant &&
        String(selectedMerchant) !== String(currentMerchant)
      ) {
        return null;
      }

      const desired = {
        transaction_type: selectedType,
        transaction_type_pretty:
          this.getServiceLabel(selectedType) ||
          this.schedStore.transaction_type_pretty ||
          serverInfo.transaction_type_pretty,
        whento_deliver: selectedState.whento_deliver || serverInfo.whento_deliver,
        delivery_date:
          selectedState.delivery_date || serverInfo.delivery_date || null,
        delivery_time:
          selectedState.delivery_time || serverInfo.delivery_time || null,
      };

      if (desired.whento_deliver === "schedule") {
        const hasDate = this.normalizeScheduleDate(desired.delivery_date);
        const hasTime = this.normalizeScheduleTime(desired.delivery_time);
        if (!hasDate || !hasTime) {
          return null;
        }
      }

      const sameType = desired.transaction_type === serverInfo.transaction_type;
      const normalizedDesiredWhen = desired.whento_deliver;
      const normalizedServerWhen = serverInfo.whento_deliver;
      const sameWhen = normalizedDesiredWhen === normalizedServerWhen;
      const scheduleMode =
        desired.whento_deliver === "schedule" || serverInfo.whento_deliver === "schedule";
      const sameDate =
        !scheduleMode ||
        !desired.delivery_date ||
        this.normalizeScheduleDate(desired.delivery_date) ===
          this.normalizeScheduleDate(serverInfo.delivery_date);
      const sameTime =
        !scheduleMode ||
        !desired.delivery_time ||
        this.normalizeScheduleTime(desired.delivery_time) ===
          this.normalizeScheduleTime(serverInfo.delivery_time);

      return sameType && sameWhen && sameDate && sameTime ? null : desired;
    },
    getScheduleTimeValue(value) {
      if (!value) return "";
      if (typeof value === "string") return value;
      return value.start_time || value.value || value.pretty_time || "";
    },
    async reconcileCheckoutTransaction(transactionInfo) {
      if (this.service_sync_pending || !this.CartStore.getCartID) return;
      this.service_sync_pending = true;

      try {
        const typeResponse = await APIinterface.fetchDataPost(
          "setTransactionType",
          "cart_uuid=" +
            this.CartStore.getCartID +
            "&transaction_type=" +
            transactionInfo.transaction_type
        );
        this.updateLocalTransactionInfo(
          this.withSelectedTransactionInfo(typeResponse.details, transactionInfo)
        );

      if (
        transactionInfo.whento_deliver === "schedule" &&
        transactionInfo.delivery_date &&
        transactionInfo.delivery_time
      ) {
        const scheduleResponse = await APIinterface.fetchDataPost(
          "setDeliveryTime",
          {
            cart_uuid: this.CartStore.getCartID,
            delivery_date: transactionInfo.delivery_date,
            delivery_time: transactionInfo.delivery_time,
            }
          );
          this.updateLocalTransactionInfo(
            this.withSelectedTransactionInfo(scheduleResponse.details, transactionInfo)
          );
        } else if (transactionInfo.whento_deliver === "now") {
          const nowResponse = await APIinterface.fetchDataPost(
            "setDeliveryNow",
            "cart_uuid=" + this.CartStore.getCartID
          );
          this.updateLocalTransactionInfo(
            this.withSelectedTransactionInfo(nowResponse.details, transactionInfo)
          );
        }

        this.loadCart();
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.service_sync_pending = false;
      }
    },
    handleAddEditAddress(found) {
      this.$refs.ref_address_details.modal = true;
    },
    afterApplywallet(value) {
      const use_wallet = value?.use_wallet || false;
      if (use_wallet) {
        this.wallet_data = value;
      } else {
        this.wallet_data = null;
      }
    },
    selectAnothertime() {
      this.$refs.ref_timepass.modal = false;
      this.is_persistent = true;
      this.$refs.ref_deliverytime.modal = true;
    },
    async clearCart() {
      try {
        this.$refs.ref_timepass.modal = false;
        APIinterface.showLoadingBox("", this.$q);
        await this.CartStore.clearCart();
        this.DataStorePersisted.cart_uuid = null;
        this.CartStore.getCart(true, null);
        this.$router.push("/home");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    onPlaceorder() {
      // CHECK IF HAS ADDRESS

      if (this.CartStore.isStrictTowallet) {
        const wallet_data = this.CartStore.getWallet;
        const amount_due = wallet_data?.amount_due_raw ?? 0;
        if (amount_due > 0) {
          this.$refs.wallet_funds.modal = true;
          return;
        }
      }

      const transaction_type = this.getCurrentTransactionType();
      const payment_method = this.CartStore.getPayment;
      const payment_credentials =
        this.CartStore.getPayment?.credentials || null;
      if (payment_method.payment_code == "cod" && payment_credentials) {
        if (parseInt(payment_credentials.attr1) == 1 && !this.payment_change) {
          APIinterface.ShowAlert(
            this.$t("Please enter change amount"),
            this.$q.capacitor,
            this.$q
          );
          this.$refs.ref_payment_change.focus();
          return;
        }
      }

      //if (this.search_mode == "location" && transaction_type == "delivery") {
      if (transaction_type == "delivery") {
        if (!this.CartStore.getAddress?.is_address_found) {
          APIinterface.ShowAlert(
            this.$t("Please complete your delivery address to continue."),
            this.$q.capacitor,
            this.$q
          );
          return;
        }
      }

      if (transaction_type == "pickup") {
        this.$q
          .dialog({
            title: this.$t("Pickup confirmation"),
            message: this.$t("pickup_collection_confirm"),
            class: "radius28",
            persistent: true,
            ok: {
              unelevated: true,
              rounded: true,
              color: "primary",
              "text-color": "white",
              size: "md",
              label: this.$t("Continue"),
              "no-caps": true,
              class: "text-weight-bold text-subtitle2 q-pl-lg q-pr-lg",
            },
            cancel: {
              unelevated: true,
              rounded: true,
              color: "grey-3",
              "text-color": "black",
              size: "md",
              label: this.$t("Cancel"),
              "no-caps": true,
              class: "text-weight-medium text-subtitle2 q-pl-lg q-pr-lg",
            },
          })
          .onOk(() => {
            this.submitOrder();
          })
          .onCancel(() => {})
          .onDismiss(() => {});
      } else {
        this.submitOrder();
      }
    },
    async submitOrder() {
      const payment_uuid = this.CartStore.getPayment?.payment_uuid || null;
      if (!payment_uuid) {
        this.$refs.ref_paymentmethod.modal = true;
        return;
      }

      const baseURL =
        process.env.VUE_ROUTER_MODE === "history"
          ? window.location.origin + "/"
          : window.location.origin + "/#/";

      this.loading = true;
      const params = {
        return_url: this.isWeb ? baseURL : null,
        cart_uuid: this.CartStore.getCartID,
        include_utensils: this.include_utensils ? 1 : 0,
        payment_uuid: this.CartStore.getPayment?.payment_uuid,
        currency_code: this.DataStorePersisted.getUseCurrency(),

        payment_change: this.payment_change,
        guest_number: this.$refs.checkout_booking
          ? this.$refs.checkout_booking.guest_number
          : "",
        room_uuid: this.$refs.checkout_booking
          ? this.$refs.checkout_booking.room_uuid
          : "",
        table_uuid: this.$refs.checkout_booking
          ? this.$refs.checkout_booking.table_uuid
          : "",
        use_digital_wallet: this.$refs?.digital_wallet?.use_wallet || 0,
      };
      if (this.search_mode == "address") {
        params.address_uuid =
          this.CartStore.getAddressDetails?.address_uuid || "";
      } else if (this.search_mode == "location") {
        params.address_uuid = this.CartStore.getAddress?.address_uuid || "";
      }

      try {
        const result = await APIinterface.PlaceOrder(params);

        // CLEAR ORDERS
        this.DataStore.clearOrders();
        this.DataStore.orders_no_more_data = false;

        if (result.details.payment_instructions.method === "offline") {
          this.is_afterpay = true;
          this.CartStore.cart_data = null;
          this.$router.replace({
            path: "/account/trackorder",
            query: { order_uuid: result.details.order_uuid },
          });
        } else {
          this.doPayment(result.details);
        }
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    doPayment(data) {
      try {
        this.$refs[data.payment_code].PaymentRender(data);
      } catch (error) {
        this.PaymentRender(data);
      }
    },
    async PaymentRender(data) {
      let redirect = data.payment_url;
      if (this.$q.capacitor) {
        await Browser.open({ url: redirect });
      } else {
        location.href = redirect;
        //window.open(redirect);
      }
    },
    afterPayment(value) {
      this.is_afterpay = true;
      this.CartStore.cart_data = null;
      this.$router.replace({
        path: "/account/trackorder",
        query: { order_uuid: value.order_uuid },
      });
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
          this.getCurrentTransactionType()
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
    removeDiscount(value) {
      if (value.discount_type == "points_discount") {
        this.removePoints();
      } else {
        this.removePromo(value);
      }
    },
    async removePromo(value) {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const params = {
          cart_uuid: this.CartStore.getCartID,
          promo_id: value.discount_id,
          promo_type: value.discount_type,
        };
        await APIinterface.fetchDataByToken("removePromo", params);
        this.loadCart();
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    async removePoints() {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const params = new URLSearchParams({
          cart_uuid: this.CartStore.getCartID,
        }).toString();
        await APIinterface.fetchDataByTokenPost("removePoints", params);
        this.loadCart();
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    async setTransactionType(value) {
      const previousType = this.transaction_type || this.CartStore.geTransactiontype;
      this.transaction_type = value;
      this.syncManualServiceState({
        transaction_type: value,
      });
      try {
        this.updateLocalTransactionInfo({
          transaction_info: {
            transaction_type: value,
            transaction_type_pretty: this.getServiceLabel(value),
          },
        });
        APIinterface.showLoadingBox("", this.$q);
        const response = await APIinterface.fetchDataPost(
          "setTransactionType",
          "cart_uuid=" + this.CartStore.getCartID + "&transaction_type=" + value
        );
        this.updateLocalTransactionInfo(
          this.withSelectedTransactionInfo(response.details, {
            transaction_type: value,
            transaction_type_pretty: this.getServiceLabel(value),
          })
        );
        this.loadCart();
      } catch (error) {
        this.transaction_type = previousType;
        this.syncManualServiceState({
          transaction_type: previousType,
        });
        this.updateLocalTransactionInfo({
          transaction_info: {
            transaction_type: previousType,
            transaction_type_pretty: this.getServiceLabel(previousType),
          },
        });
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    afterSaveschedule(value) {
      const info = value?.transaction_info || {};
      const isNow = info.whento_deliver === "now";
      this.updateLocalTransactionInfo(
        this.withSelectedTransactionInfo(value || {}, {
          whento_deliver: info.whento_deliver || "schedule",
          delivery_date: isNow ? null : info.delivery_date,
          delivery_time: isNow ? null : info.delivery_time,
        })
      );
      this.syncManualServiceState({
        whento_deliver: info.whento_deliver || "schedule",
        delivery_date: isNow ? null : info.delivery_date,
        delivery_time: isNow ? null : info.delivery_time,
      });
      this.loadCart();
    },
    loadCart() {
      this.CartStore.getCart(false, this.payload);
    },
    async changeDeliveryType(value) {
      if (value == "schedule") {
        this.$refs.ref_deliverytime.modal = true;
        this.syncManualServiceState({
          whento_deliver: value,
          delivery_time: this.getCurrentDeliveryTime(),
          delivery_date: this.getCurrentDeliveryDate(),
        });
      } else {
        try {
          this.updateLocalTransactionInfo({
            transaction_info: {
              whento_deliver: value,
              delivery_date: null,
              delivery_time: null,
            },
          });
          APIinterface.showLoadingBox("", this.$q);
          const response = await APIinterface.fetchDataPost(
            "setDeliveryNow",
            "cart_uuid=" + this.CartStore.getCartID
          );
          this.updateLocalTransactionInfo(
            this.withSelectedTransactionInfo(response.details, {
              whento_deliver: value,
              delivery_date: null,
              delivery_time: null,
            })
          );
          this.syncManualServiceState({
            whento_deliver: value,
            delivery_date: null,
            delivery_time: null,
          });
          this.loadCart();
        } catch (error) {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        } finally {
          APIinterface.hideLoadingBox(this.$q);
        }
      }
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    refresh(done) {
      this.CartStore.getCart(false, this.payload);
      done();
    },
    AddEditAddress() {
      this.$refs.ref_address_details.modal = true;
    },
    afterSaveaddress(value) {
      this.pending_address_data = null;
      if (this.search_mode == "address") {
        this.DataStorePersisted.place_data = value;
        this.DataStorePersisted.coordinates = {
          lat: value.latitude,
          lng: value.longitude,
        };
        if (value.place_id) {
          APIinterface.setStorage("place_data", value);
          APIinterface.setStorage("place_id", value.place_id);
        }
      } else if (this.search_mode == "location") {
        this.ClientStore.location_saved_address = null;
        this.DataStorePersisted.location_data = value;
      }
      this.ClientStore.data = null;
      this.CartStore.getCart(false, this.payload);
    },
    afterSetplaceid() {
      const placeData = APIinterface.getStorage("place_data");
      if (placeData) {
        this.DataStorePersisted.place_data = placeData;
        this.DataStorePersisted.coordinates = {
          lat: placeData.latitude,
          lng: placeData.longitude,
        };
      }
      this.ClientStore.data = null;
      this.CartStore.getCart(false, this.payload);
    },
    afterChooselocation(value) {
      this.ClientStore.data = null;
      this.CartStore.getCart(false, this.payload);
    },
    afterChooseaddress(value, isWrite) {
      if (value) {
        this.DataStorePersisted.recently_change_address = true;
        this.DataStorePersisted.place_data = value.place_data;
        this.DataStorePersisted.coordinates = value.location_coordinates;
        this.pending_address_data = null;
        if (value.place_data?.place_id) {
          APIinterface.setStorage("place_data", value.place_data);
          APIinterface.setStorage("place_id", value.place_data.place_id);
        }

        this.DataStore.recommended_data = null;
        this.DataStore.clearData();

        if (isWrite) {
          this.DataStorePersisted.saveRecentAddress(value.place_data);
        }

        if (isWrite || !value.place_data?.address_uuid) {
          this.openAddressDetailsForSelectedPlace(value.place_data);
          return;
        }

        this.CartStore.getCart(false, this.payload);
      }
    },
    openAddressDetailsForSelectedPlace(placeData) {
      this.pending_address_data = placeData;
      if (this.search_mode == "location") {
        this.DataStorePersisted.location_data = placeData;
      }
      this.$nextTick(() => {
        if (this.$refs.ref_address_details) {
          this.$refs.ref_address_details.modal = true;
        }
      });
    },
  },
};
</script>

<style scoped>
.tagam-checkout-card,
.tagam-checkout-options-card,
.tagam-checkout-summary-card,
.tagam-checkout-order-card {
  background: var(--tagam-surface);
  border: 1px solid var(--tagam-border-soft);
  border-radius: 24px;
  box-shadow: var(--tagam-shadow-soft);
  overflow: hidden;
}

.tagam-checkout-card--flat {
  padding: 6px 0 !important;
}

.tagam-checkout-section-header {
  padding: 14px 16px 8px;
  background: transparent !important;
}

.tagam-checkout-order-card {
  padding: 0 0 6px;
}

.tagam-checkout-order-head {
  background: transparent;
  border: 0;
  box-shadow: none;
}

.tagam-checkout-order-card :deep(.tagam-cart-items) {
  margin: 0 !important;
  padding: 0 16px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.tagam-checkout-order-card :deep(.q-slide-item) {
  border-top: 1px solid var(--tagam-border-soft);
}

.tagam-checkout-order-card :deep(.q-slide-item),
.tagam-checkout-order-card :deep(.q-slide-item__content),
.tagam-checkout-order-card :deep(.q-slide-item__left),
.tagam-checkout-order-card :deep(.q-slide-item__right),
.tagam-checkout-order-card :deep(.q-slide-item__left > div),
.tagam-checkout-order-card :deep(.q-slide-item__right > div) {
  background: transparent !important;
  box-shadow: none !important;
}

.tagam-checkout-order-card :deep(.tagam-cart-item-card) {
  padding: 12px 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.tagam-checkout-order-card :deep(.tagam-cart-item-card:hover),
.tagam-checkout-order-card :deep(.tagam-cart-item-card:active) {
  transform: none !important;
  box-shadow: none !important;
}

.tagam-checkout-summary-card--inline {
  margin: 0 !important;
  padding: 8px 16px 4px !important;
  border: 0 !important;
  border-top: 1px solid var(--tagam-border-soft) !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.tagam-checkout-options-card {
  padding-top: 10px;
  padding-bottom: 10px;
}

.tagam-checkout-summary-card {
  padding-top: 8px;
  padding-bottom: 8px;
}

.tagam-checkout-card :deep(.q-item),
.tagam-checkout-summary-card :deep(.q-item) {
  min-height: 54px;
}

.tagam-checkout-card :deep(.q-item__label--caption),
.tagam-checkout-summary-card :deep(.q-item__label--caption) {
  color: var(--tagam-text-muted);
}

.tagam-payment-change-input {
  width: 100%;
  padding: 0;
  border-bottom: 1px solid var(--tagam-border-soft) !important;
  border-radius: 0;
  background: transparent;
}

.tagam-payment-change-input :deep(.q-field__control) {
  min-height: 46px;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.tagam-checkout-card--flat :deep(.tagam-payment-change-input.q-field--borderless .q-field__control) {
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.tagam-payment-change-input :deep(input) {
  color: var(--tagam-text);
  font-weight: 700;
}

.tagam-payment-change-row {
  min-height: 52px !important;
  padding: 0 16px 10px 66px;
}

.tagam-checkout-service-status {
  margin: 0 12px 12px;
  padding: 10px 12px;
  border: 1px solid var(--tagam-border-soft);
  border-radius: 20px;
  background:
    linear-gradient(135deg, var(--tagam-primary-soft), transparent 58%),
    var(--tagam-surface-muted);
}

.tagam-checkout-service-unified {
  padding: 18px 18px 16px;
}

.tagam-checkout-service-card {
  padding: 0 !important;
  background: var(--tagam-surface) !important;
}

.tagam-checkout-service-card :deep(.tagam-checkout-service-unified),
.tagam-checkout-service-card :deep(.tagam-checkout-service-unified:hover) {
  margin: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.tagam-checkout-service-line {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
}

.tagam-checkout-service-line + .tagam-checkout-service-line {
  margin-top: 18px;
}

.tagam-checkout-line-avatar {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
}

.tagam-checkout-service-line-main {
  flex: 1 1 auto;
  min-width: 0;
}

.tagam-checkout-service-status-title {
  color: var(--tagam-text);
  font-size: 15px;
  font-weight: 800;
  line-height: 1.15;
}

.tagam-checkout-service-copy {
  margin-top: 4px;
  color: var(--tagam-text-muted);
  font-size: 14px;
  font-weight: 650;
  line-height: 1.35;
}

.tagam-checkout-service-time-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-top: 12px;
  padding: 9px 12px;
  border: 1px solid var(--tagam-primary-soft-border);
  border-radius: 16px;
  background: var(--tagam-primary-soft);
  color: var(--tagam-primary);
  font-size: 15px;
  font-weight: 850;
  line-height: 1.2;
}

.tagam-checkout-service-time-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
}

.tagam-checkout-service-time-value {
  flex: 1 1 auto;
  min-width: 0;
  color: var(--tagam-primary);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
}

.tagam-checkout-service-status-time {
  margin-top: 2px;
  color: var(--tagam-text-muted);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.25;
}

.tagam-checkout-time-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tagam-checkout-time-action {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--tagam-border-soft);
  border-radius: 999px;
  background: var(--tagam-surface) !important;
  color: var(--tagam-text-muted) !important;
  font-weight: 800;
  white-space: nowrap;
}

.tagam-checkout-time-action--active {
  border-color: var(--tagam-primary-soft-border);
  background: var(--tagam-primary-soft) !important;
  color: var(--tagam-primary) !important;
}

.tagam-checkout-time-action--primary {
  border-color: var(--tagam-primary);
  background: var(--tagam-primary) !important;
  color: white !important;
}

.tagam-checkout-merchant-address {
  position: relative;
  align-items: center;
  margin-top: 20px !important;
  padding: 0;
  border-radius: 16px;
}

.tagam-checkout-merchant-address-main {
  color: var(--tagam-text);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.25;
}

.tagam-checkout-merchant-address-arrow {
  flex: 0 0 auto;
  color: var(--tagam-text-muted);
  padding-left: 8px;
}

.tagam-checkout-service-map-dialog {
  width: min(620px, calc(100vw - 20px));
  max-width: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: var(--tagam-surface);
  border: 1px solid var(--tagam-border-soft);
}

.tagam-checkout-service-map-card {
  padding: 0;
  min-height: 52vh;
  background: var(--tagam-surface-muted);
}

.tagam-checkout-service-map {
  height: 52vh;
  min-height: 52vh;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--tagam-border-soft);
}

.tagam-checkout-service-map-empty {
  min-height: 52vh;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--tagam-text-muted);
  padding: 24px;
}
</style>


