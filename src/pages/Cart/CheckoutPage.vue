<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-page class="tagam-checkout-page">
      <q-page-sticky
        position="top"
        expand
        :offset="[0, 0]"
        class="tagam-checkout-sticky-shell"
      >
        <TagamTopHeader
          :cart-count="CartStore.getCartCount"
          :sticky="false"
          class="tagam-checkout-sticky-header"
        />
      </q-page-sticky>

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
        <div class="tagam-checkout-spacer"></div>

        <section class="tagam-checkout-intro">
          <div class="tagam-checkout-intro__copy">
            <div class="tagam-checkout-intro__title">
              {{ $t("Order checkout") }}
            </div>
          </div>
          <div class="tagam-checkout-intro__mark">
            <q-icon name="eva-shopping-bag-outline" size="56px" />
          </div>
        </section>

        <div class="tagam-checkout-step-title">
          {{ $t("Order type and time") }}
        </div>
        <section class="tagam-checkout-hero">
          <div class="tagam-checkout-segmented-shell">
            <button
              v-if="serviceTabsCanScrollLeft"
              type="button"
              class="tagam-checkout-segmented-arrow tagam-checkout-segmented-arrow--left"
              @click="scrollServiceTabs('left')"
              aria-label="Scroll services left"
            >
              <q-icon name="eva-arrow-ios-back-outline" />
            </button>

            <div
              ref="serviceTabsScroll"
              class="tagam-checkout-segmented-scroll"
              @scroll="updateServiceTabsScrollState"
            >
              <q-btn-toggle
                v-model="transaction_type"
                color="mygrey1"
                toggle-color="orange-1"
                text-color="grey"
                toggle-text-color="blue-grey-6"
                no-caps
                unelevated
                class="rounded-group tagam-checkout-segmented"
                :options="CartStore.getServices ? CartStore.getServices : []"
                @update:model-value="setTransactionType"
              />
            </div>

            <div
              v-if="serviceTabsCanScrollLeft"
              class="tagam-checkout-segmented-fade tagam-checkout-segmented-fade--left"
            ></div>
            <div
              v-if="serviceTabsCanScrollRight"
              class="tagam-checkout-segmented-fade tagam-checkout-segmented-fade--right"
            ></div>

            <button
              v-if="serviceTabsCanScrollRight"
              type="button"
              class="tagam-checkout-segmented-arrow tagam-checkout-segmented-arrow--right"
              @click="scrollServiceTabs('right')"
              aria-label="Scroll services right"
            >
              <q-icon name="eva-arrow-ios-forward-outline" />
            </button>
          </div>

          <q-list class="tagam-checkout-delivery-list tagam-checkout-list--embedded">
            <template v-for="items in CartStore.getDeliveryOptions2" :key="items">
              <q-item
                clickable
                v-ripple:purple
                class="text-weight-bold radius8 tagam-checkout-delivery-option"
                :class="{
                  'border-primary': CartStore.geDeliverytype == items.value,
                  'border-grey': CartStore.geDeliverytype != items.value,
                }"
                @click="changeDeliveryType(items.value)"
              >
                <q-item-section>
                  <div class="flex items-center q-gutter-x-sm">
                    <div>
                      {{ deliveryOptionLabel(items) }}
                      <span v-if="items.estimation">&bull;</span>
                    </div>
                    <div v-if="items.estimation" class="text-caption">
                      {{ items.estimation }}
                    </div>
                  </div>
                </q-item-section>
              </q-item>
              <q-space class="q-pa-xs"></q-space>
            </template>
          </q-list>
        </section>

        <div
          v-if="CartStore.hasError"
          class="tagam-checkout-error text-caption line-normal"
        >
          <q-list dense class="myqlist tagam-checkout-list">
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

        <!-- DELIVERY ADDRESS -->
        <div class="tagam-checkout-step-title">
          {{
            CartStore.geTransactiontype == "delivery"
              ? $t("Delivery Details")
              : $t("Pickup details")
          }}
        </div>
        <section class="tagam-checkout-card tagam-checkout-delivery-shell">
        <template v-if="CartStore.geTransactiontype == 'delivery'">
          <!-- <pre>{{ CartStore.getAddress }}</pre>
          <pre>{{ CartStore.getAddressDetails }}</pre> -->
          <template v-if="search_mode == 'address'">
            <q-list dense class="myqlist tagam-checkout-list tagam-checkout-list--embedded">
              <q-item
                clickable
                v-ripple:purple
                @click="this.$refs.ref_address.modal = true"
              >
                <q-item-section avatar top>
                  <q-icon name="eva-pin-outline" class="text-red"></q-icon>
                </q-item-section>
                <q-item-section top>
                  <q-item-label class="text-caption text-weight-bold">
                    {{
                      CartStore.getAddress?.name ?? this.$t("Address not found")
                    }}
                  </q-item-label>
                  <q-item-label class="ellipsis" caption>
                    {{ CartStore.getAddress?.address }}
                  </q-item-label>
                  <q-item-label
                    class="tagam-checkout-address-hint"
                    :class="{
                      'tagam-checkout-address-hint--warning':
                        !CartStore.getAddress?.is_address_found,
                    }"
                  >
                    {{
                      CartStore.getAddress?.is_address_found
                        ? this.$t("Choose another address or create a new one")
                        : this.$t("Choose an address or create a new one")
                    }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    :label="$t('Choose')"
                    @click.stop="this.$refs.ref_address.modal = true"
                    unelevated
                    no-caps
                    class="tagam-checkout-address-btn"
                  ></q-btn>
                </q-item-section>
              </q-item>
              <q-item v-if="CartStore.getDistance" class="tagam-checkout-subrow">
                <q-item-section avatar top>
                  <q-icon name="directions_bike" class="text-red"></q-icon>
                </q-item-section>
                <q-item-section top>
                  <q-item-label caption>
                    {{ CartStore.getDistance }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </template>
          <template v-else-if="search_mode == 'location'">
            <!-- ADDRESS LOCATION -->
            <q-list dense class="myqlist tagam-checkout-list tagam-checkout-list--embedded">
              <q-item
                clickable
                v-ripple:purple
                @click="this.$refs.ref_address.modal = true"
              >
                <q-item-section avatar>
                  <q-avatar
                    color="orange-1"
                    text-color="primary"
                    icon="eva-pin-outline"
                    size="md"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-subtitle2">
                    {{
                      CartStore.getAddress?.is_address_found
                        ? CartStore.getAddress?.address_label
                        : CartStore.getAddress?.complete_address ??
                          this.$t("Address not found")
                    }}
                  </q-item-label>
                  <q-item-label caption lines="1">
                    {{
                      CartStore.getAddress?.is_address_found
                        ? `${CartStore.getAddress?.state_name} ${CartStore.getAddress?.city_name} ${CartStore.getAddress?.area_name} ${CartStore.getAddress?.zip_code}`
                        : CartStore.getAddress?.country_name
                    }}
                  </q-item-label>
                  <q-item-label
                    class="tagam-checkout-address-hint"
                    :class="{
                      'tagam-checkout-address-hint--warning':
                        !CartStore.getAddress?.is_address_found,
                    }"
                  >
                    {{
                      CartStore.getAddress?.is_address_found
                        ? this.$t("Choose another address or create a new one")
                        : this.$t("Choose an address or create a new one")
                    }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    :label="$t('Choose')"
                    @click.stop="this.$refs.ref_address.modal = true"
                    unelevated
                    no-caps
                    class="tagam-checkout-address-btn"
                  ></q-btn>
                </q-item-section>
              </q-item>
              <q-item v-if="CartStore.getDistance" class="tagam-checkout-subrow">
                <q-item-section avatar top>
                  <q-icon name="directions_bike" class="text-red"></q-icon>
                </q-item-section>
                <q-item-section top>
                  <q-item-label caption>
                    {{ CartStore.getDistance }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </template>
        </template>
        <template v-else>
          <q-list dense class="myqlist tagam-checkout-list tagam-checkout-list--embedded">
            <q-item clickable v-ripple:purple>
              <q-item-section avatar top>
                <q-icon name="eva-pin-outline" class="text-red"></q-icon>
              </q-item-section>
              <q-item-section top>
                <q-item-label class="text-caption text-weight-bold">
                  {{
                    CartStore.getMerchant?.merchant_address ||
                    $t("Address not available")
                  }}
                </q-item-label>
                <q-item-label class="ellipsis" caption>
                  {{ CartStore.getDistance1 }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="eva-arrow-ios-forward-outline" size="xs"></q-icon>
              </q-item-section>
            </q-item>
            <q-separator class="q-mt-sm q-ml-md q-mr-md q-mb-sm"></q-separator>
            <q-item>
              <q-item-section avatar top>
                <q-icon name="o_timer" class="text-red"></q-icon>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption text-weight-bold">{{
                  CartStore.getEstimatetime1
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="CartStore.getInstructions" class="bg-orange-1">
              <q-item-section>
                <div class="text-caption text-weight-bold">
                  {{ CartStore.getInstructions?.title || "" }}
                </div>
                <div class="text-caption line-normal">
                  {{ CartStore.getInstructions?.subtitle || "" }}
                </div>
              </q-item-section>
              <q-item-section side top>
                <OrderStatusAnimation status="pickup" />
              </q-item-section>
            </q-item>
          </q-list>
        </template>

        <q-list class="myqlist tagam-checkout-list tagam-checkout-list--embedded">
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
        </q-list>
        </section>

        <template v-if="transaction_type == 'dinein'">
          <div class="tagam-checkout-card tagam-checkout-booking">
            <CheckoutBooking
              ref="checkout_booking"
              :room_list="CartStore.getRoomList"
              :table_list="CartStore.getTableList"
            ></CheckoutBooking>
          </div>
        </template>
        <div class="tagam-checkout-step-title">
          {{ $t("Payment and discounts") }}
        </div>
        <q-list class="myqlist tagam-checkout-list tagam-checkout-card tagam-checkout-payment-card">
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
            class="bg-mygrey1 text-dark text-weight-bold text-subtitle2"
          >
            <div class="flex items-center justify-between">
              <div>{{ $t("Payment details") }}</div>
              <div v-if="!CartStore.isStrictTowallet">
                <q-btn
                  :label="$t('Change')"
                  no-caps
                  unelevated
                  flat
                  color="blue"
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
                    :color="CartStore.getPayment ? 'blue-grey-6' : 'red'"
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
                    CartStore.getPayment?.attr1 || $t('Select payment method')
                  }}
                </q-item-label>
                <q-item-label caption>
                  {{ CartStore.getPayment?.attr2 || "" }}
                </q-item-label>
                <q-item-label v-if="wallet_data" caption>
                  {{ wallet_data?.pay_remaining || "" }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item dense v-if="CartStore.getPayment?.payment_code == 'cod'">
              <q-item-section>
                <q-input
                  v-model="payment_change"
                  ref="ref_payment_change"
                  borderless
                  class="bg-mygrey1 radius28 q-pl-md"
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
              <q-icon name="o_local_offer" color="blue-grey-6"></q-icon>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t("Add discount & promo") }}</q-item-label>
            </q-item-section>
            <q-item-section side class="q-mr-xs">
              <q-btn
                :label="$t('Add')"
                rounded
                no-caps
                color="mygrey1"
                text-color="dark"
                unelevated
                @click="this.$refs.ref_promo.modal = true"
              ></q-btn>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="tagam-checkout-step-row">
          <div class="tagam-checkout-step-title tagam-checkout-step-title--inline">
            {{ $t("Order Summary") }}
          </div>
          <q-btn
            :label="$t('Add items')"
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
        </div>
        <section class="tagam-checkout-summary-card">
          <CartDetails
            ref="cart_details"
            :is_checkout="true"
            :payload="payload"
            :item_visible="2"
            @after-removeitem="afterRemoveitem"
          />
          <q-list dense class="tagam-checkout-summary-list">
            <template v-for="items in CartStore.getSummary" :key="items">
              <q-item>
                <q-item-section avatar> {{ items.name }} </q-item-section>
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
        </section>

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
    class="tagam-checkout-footer text-dark"
  >
    <div class="tagam-checkout-footer__shell">
      <q-skeleton
        v-if="CartStore.cart_reloading"
        type="QBtn"
        class="full-width q-pa-lg tagam-checkout-place-btn"
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
    </div>
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
      redirect="/checkout?addnew=1"
      @after-chooseaddress="afterChooseaddress"
      @after-chooselocation="afterChooselocation"
    ></component>

    <component
      :is="AddressDetails"
      ref="ref_address_details"
      :is_address_found="checkoutAddressIsFound"
      :address_data="checkoutAddressDetails"
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

export default {
  name: "CheckoutPage",
  components: {
    CartDetails: defineAsyncComponent(() =>
      import("components/CartDetails.vue")
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
    TagamTopHeader: defineAsyncComponent(() =>
      import("components/TagamTopHeader.vue")
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
      serviceTabsCanScrollLeft: false,
      serviceTabsCanScrollRight: false,
      selectedAddressDraft: null,
      selectedLocationDraft: null,
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
    const addnew = this.$route.query.addnew;
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

    this.CartStore.getCart(true, this.payload);

    if (addnew && this.search_mode == "location") {
      const draftLocation = this.DataStorePersisted.location_data;
      if (draftLocation) {
        this.selectedLocationDraft = draftLocation;
        this.$nextTick(() => {
          if (this.$refs.ref_address_details) {
            this.$refs.ref_address_details.modal = true;
          }
        });

        const nextQuery = { ...this.$route.query };
        delete nextQuery.addnew;
        this.$router.replace({
          path: this.$route.path,
          query: nextQuery,
        });
      }
    }

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
        this.transaction_type = this.CartStore.geTransactiontype;

        setTimeout(() => {
          if (this.$refs.ref_timepass) {
            this.$refs.ref_timepass.modal = newData.time_already_passed;
          }

          this.$nextTick(() => {
            this.updateServiceTabsScrollState();
          });
        }, 100);
      }
    );

    window.addEventListener("resize", this.updateServiceTabsScrollState, {
      passive: true,
    });

    this.$nextTick(() => {
      this.updateServiceTabsScrollState();
    });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateServiceTabsScrollState);
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
    checkoutAddressIsFound() {
      if (this.search_mode == "location") {
        return this.selectedLocationDraft?.address_uuid
          ? true
          : this.CartStore.getAddress?.is_address_found;
      }
      return this.selectedAddressDraft?.address_uuid
        ? true
        : this.CartStore.getAddress?.is_address_found;
    },
    checkoutAddressDetails() {
      if (this.search_mode == "location") {
        return (
          this.selectedLocationDraft ||
          this.DataStorePersisted.getLocation ||
          this.CartStore.getAddress
        );
      }
      return this.selectedAddressDraft || this.CartStore.getAddressDetails;
    },
  },
  methods: {
    deliveryOptionLabel(item) {
      if (!item?.value) {
        return item?.name ?? "";
      }

      if (item.value === "schedule") {
        return this.$t("Order for a specific time");
      }

      if (item.value === "now") {
        return this.$t("Now");
      }

      return item?.name ?? "";
    },
    updateServiceTabsScrollState() {
      const wrapper = this.$refs.serviceTabsScroll;
      if (!wrapper) {
        this.serviceTabsCanScrollLeft = false;
        this.serviceTabsCanScrollRight = false;
        return;
      }

      const maxScrollLeft = Math.max(
        0,
        wrapper.scrollWidth - wrapper.clientWidth
      );

      this.serviceTabsCanScrollLeft = wrapper.scrollLeft > 8;
      this.serviceTabsCanScrollRight =
        maxScrollLeft - wrapper.scrollLeft > 8;
    },
    scrollServiceTabs(direction) {
      const wrapper = this.$refs.serviceTabsScroll;
      if (!wrapper) {
        return;
      }

      const step = Math.max(140, Math.floor(wrapper.clientWidth * 0.72));
      wrapper.scrollTo({
        left:
          direction === "left"
            ? wrapper.scrollLeft - step
            : wrapper.scrollLeft + step,
        behavior: "smooth",
      });
      },
      handleAddEditAddress(found) {
        this.$refs.ref_address.modal = true;
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
        APIinterface.ShowAlert(err, this.$q.capacitor, this.$q);
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

      const transaction_type = this.CartStore.geTransactiontype;
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

      console.log("CartStore.getAddress", this.CartStore.getAddress);

      //if (this.search_mode == "location" && transaction_type == "delivery") {
      if (transaction_type == "delivery") {
        if (!this.CartStore.getAddress?.is_address_found) {
          APIinterface.ShowAlert(
            this.$t("Please complete your address details to continue."),
            this.$q.capacitor,
            this.$q
          );
          return;
        }
      }

      if (transaction_type == "pickup") {
        this.$q
          .dialog({
            title: "Confirm",
            message: this.$t("pickup_collection_confirm"),
            class: "radius28",
            persistent: true,
            ok: {
              unelevated: true,
              rounded: true,
              color: "orange-1",
              "text-color": "blue-grey-6",
              size: "md",
              label: this.$t("Ok"),
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
      console.log("afterPayment", value);
      this.is_afterpay = true;
      this.CartStore.cart_data = null;
      this.$router.replace({
        path: "/account/trackorder",
        query: { order_uuid: value.order_uuid },
      });
    },
    removeDiscount(value) {
      console.log("removeDiscount", value);
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
      try {
        APIinterface.showLoadingBox("", this.$q);
        console.log("setTransactionType", value);
        const result = await APIinterface.fetchDataPost(
          "setTransactionType",
          "cart_uuid=" + this.CartStore.getCartID + "&transaction_type=" + value
        );
        this.loadCart();
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    afterSaveschedule() {
      this.loadCart();
    },
    loadCart() {
      this.CartStore.getCart(false, this.payload);
    },
    async changeDeliveryType(value) {
      const delivery_type = this.CartStore.geDeliverytype;
      console.log("changeDeliveryType", value);
      console.log("delivery_type", delivery_type);
      if (value == "schedule") {
        this.$refs.ref_deliverytime.modal = true;
      } else {
        try {
          APIinterface.showLoadingBox("", this.$q);
          const result = await APIinterface.fetchDataPost(
            "setDeliveryNow",
            "cart_uuid=" + this.CartStore.getCartID
          );
          console.log("result", result);
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
      console.log("AddEditAddress", this.CartStore.getAddress.is_address_found);
      this.$refs.ref_address.modal = true;
    },
    afterSaveaddress(value) {
      console.log("afterSaveaddress", value);
      this.selectedAddressDraft = null;
      this.selectedLocationDraft = null;
      if (this.search_mode == "address") {
        this.DataStorePersisted.place_data = value;
        this.DataStorePersisted.coordinates = {
          lat: value.latitude,
          lng: value.longitude,
        };
        if (value?.place_id) {
          APIinterface.setStorage("place_id", value.place_id);
        }
      } else if (this.search_mode == "location") {
        this.ClientStore.location_saved_address = null;
        this.DataStorePersisted.location_data = value;
        if (value?.place_id) {
          APIinterface.setStorage("place_id", value.place_id);
        }
        if (value) {
          APIinterface.setStorage("place_data", value);
        }
      }
      this.ClientStore.data = null;
      this.CartStore.getCart(false, this.payload);
    },
    afterChooselocation(value) {
      console.log("afterChooselocation", value);
      this.selectedLocationDraft = null;
      if (value?.place_id) {
        APIinterface.setStorage("place_id", value.place_id);
        APIinterface.setStorage("place_data", value);
      }
      this.ClientStore.data = null;
      this.CartStore.getCart(false, this.payload);
    },
    afterChooseaddress(value, isWrite) {
      console.log("afterChooseaddress", value);
      if (value) {
        if (isWrite) {
          this.selectedAddressDraft = value.place_data;
          this.$refs.ref_address_details.modal = true;
          return;
        }

        this.DataStorePersisted.recently_change_address = true;
        this.DataStorePersisted.place_data = value.place_data;
        this.DataStorePersisted.coordinates = value.location_coordinates;

        this.DataStore.recommended_data = null;
        this.DataStore.clearData();

        if (isWrite) {
          this.DataStorePersisted.saveRecentAddress(value.place_data);
        }

        this.CartStore.getCart(false, this.payload);
      }
    },
  },
};
</script>


<style>
.tagam-checkout-page {
  padding-bottom: 132px;
  background: #ffffff !important;
}

.tagam-checkout-sticky-shell {
  z-index: 150;
}

.tagam-checkout-sticky-header {
  width: 100%;
  background: #ffffff;
}

.tagam-checkout-header {
  background: transparent !important;
  box-shadow: none;
  padding: 10px 12px 0;
}

.tagam-checkout-header-shell {
  background: rgba(255, 249, 240, 0.9);
  border: 1px solid rgba(113, 74, 24, 0.12);
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(70, 41, 12, 0.14);
  backdrop-filter: blur(16px);
}

.tagam-checkout-toolbar {
  min-height: 72px;
}

.tagam-checkout-toolbar__eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a6a4e;
}

.tagam-checkout-toolbar__title {
  font-size: 19px;
  font-weight: 900;
  color: #20160f;
}

.tagam-checkout-spacer {
  height: 46px;
}

.tagam-checkout-intro {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 20px;
  padding-left: 24px;
  border-radius: 0 28px 28px 28px;
  background: #efe3c9;
  overflow: hidden;
}

.tagam-checkout-intro__copy {
  display: flex;
  align-items: center;
  padding: 18px 0;
}

.tagam-checkout-intro__title {
  max-width: none;
  font-size: 22px;
  line-height: 1;
  font-weight: 900;
  color: #1f1711;
  white-space: nowrap;
}

.tagam-checkout-intro__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  color: rgba(255, 255, 255, 0.95);
}

.tagam-checkout-step-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 24px 10px;
}

.tagam-checkout-step-title {
  display: inline-flex;
  align-items: center;
  margin: 0 24px 12px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(241, 136, 0, 0.12);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f18800;
}

.tagam-checkout-step-title--inline {
  margin: 0;
}

.tagam-checkout-hero,
.tagam-checkout-card,
.tagam-checkout-error {
  margin: 0 16px 14px;
  border: 1px solid rgba(17, 17, 17, 0.06);
  border-radius: 28px;
  background: #ffffff;
  box-shadow: none;
}

.tagam-checkout-hero {
  padding: 6px;
}

.tagam-checkout-delivery-shell {
  padding: 8px 0 2px;
}

.tagam-checkout-card,
.tagam-checkout-error {
  overflow: hidden;
}

.tagam-checkout-booking {
  padding: 16px;
}

.tagam-checkout-summary-card {
  margin: 0 16px 14px;
  padding: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
}

.tagam-checkout-summary-list {
  margin-top: 14px;
  border-top: 1px solid rgba(17, 17, 17, 0.08);
  padding-top: 8px;
}

.tagam-checkout-meta-card {
  margin-bottom: 24px;
}

.tagam-checkout-delivery-list {
  padding: 10px 6px 2px;
}

.tagam-checkout-delivery-option {
  min-height: 50px;
  margin-bottom: 8px;
}

.tagam-checkout-delivery-option:last-child {
  margin-bottom: 0;
}

.tagam-checkout-error {
  background: #fff5f3;
  color: #b42318;
}

.tagam-checkout-list {
  background: transparent;
  margin: 0 16px 14px 16px;
}

.tagam-checkout-list--embedded {
  margin: 0;
}

.tagam-checkout-payment-card {
  margin-bottom: 14px;
}

.tagam-checkout-subrow {
  min-height: 0 !important;
}

.tagam-checkout-list .q-item + .q-item {
  border-top: 1px solid rgba(17, 17, 17, 0.06);
}

.tagam-checkout-list .q-item-section--side {
  padding-left: 12px;
}

.tagam-section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.tagam-section-heading--stacked {
  margin-bottom: 16px;
}

.tagam-section-heading__eyebrow {
  display: inline-flex;
  margin-bottom: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(217, 107, 29, 0.12);
  color: #a94b08;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tagam-section-heading__title {
  font-size: 24px;
  line-height: 1.05;
  font-weight: 900;
  color: #20160f;
  max-width: 320px;
}

.tagam-checkout-page .bg-mygrey1,
.tagam-checkout-page .q-item-label[header] {
  background: transparent !important;
}

.tagam-checkout-page .q-space.bg-mygrey1,
.tagam-checkout-page .q-space.q-pa-sm {
  display: none;
}

.tagam-checkout-page .q-item,
.tagam-checkout-page .q-list,
.tagam-checkout-page .q-card {
  background: transparent;
}

.tagam-checkout-page .q-item {
  min-height: 58px;
  padding-left: 18px;
  padding-right: 18px;
}

.tagam-checkout-page .border-grey {
  border: 1px solid rgba(17, 17, 17, 0.08) !important;
  background: #f7f7f7;
}

.tagam-checkout-page .border-primary {
  border: 1px solid rgba(241, 136, 0, 0.32) !important;
  background: #fff6ea;
  box-shadow: none;
}

.tagam-checkout-page .radius8 {
  border-radius: 18px !important;
}

.tagam-checkout-page .q-btn-toggle.rounded-group {
  width: max-content;
  background: transparent !important;
  border-radius: 22px !important;
  padding: 0;
  flex-wrap: nowrap !important;
  gap: 10px;
}

.tagam-checkout-page .q-btn-toggle.rounded-group .q-btn {
  flex: 0 0 auto;
  border-radius: 999px !important;
  min-height: 46px;
  min-width: max-content;
  padding: 0 18px;
  white-space: nowrap;
  font-weight: 800;
  box-shadow: none !important;
  background: #f7f7f7 !important;
  color: #8f8f8f !important;
  border: 1px solid rgba(17, 17, 17, 0.05);
}

.tagam-checkout-page .q-btn-toggle.rounded-group .q-btn.bg-orange-1 {
  background: #f18800 !important;
  color: #ffffff !important;
  border-color: #f18800 !important;
}

.tagam-checkout-segmented-shell {
  position: relative;
}

.tagam-checkout-segmented-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.tagam-checkout-segmented-scroll::-webkit-scrollbar {
  display: none;
}

.tagam-checkout-segmented {
  min-width: max-content;
}

.tagam-checkout-segmented-fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 54px;
  pointer-events: none;
  z-index: 2;
}

.tagam-checkout-segmented-fade--left {
  left: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.97) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}

.tagam-checkout-segmented-fade--right {
  right: 0;
  background: linear-gradient(
    270deg,
    rgba(255, 255, 255, 0.97) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}

.tagam-checkout-segmented-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: #ffffff;
  color: #c35f14;
  box-shadow: 0 6px 16px rgba(20, 20, 20, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tagam-checkout-segmented-arrow--left {
  left: 8px;
}

.tagam-checkout-segmented-arrow--right {
  right: 8px;
}

.tagam-checkout-page .text-caption.text-weight-bold,
.tagam-checkout-page .text-subtitle2.text-weight-bold {
  letter-spacing: 0;
}

.tagam-checkout-page .q-item-label.caption,
.tagam-checkout-page .q-item__label--caption,
.tagam-checkout-page .text-grey,
.tagam-checkout-page .text-grey-7 {
  color: #a5a5a5 !important;
}

.tagam-checkout-page .text-red,
.tagam-checkout-page .text-error {
  color: #d9582f !important;
}

.tagam-checkout-page .q-input.bg-mygrey1 {
  background: #f7f7f7 !important;
  border-radius: 18px !important;
  min-height: 50px;
}

.tagam-checkout-page .q-toggle__inner {
  color: #d7d1c7;
}

.tagam-checkout-page .q-toggle__inner--truthy {
  color: #d96b1d !important;
}

.tagam-checkout-page .q-separator {
  background: rgba(17, 17, 17, 0.08) !important;
}

.tagam-checkout-page .shadow-1,
.tagam-checkout-page .shadow-bottom,
.tagam-checkout-header.shadow-bottom {
  box-shadow: none !important;
}

.tagam-checkout-footer {
  background: transparent !important;
  border-top: 0;
  box-shadow: none !important;
  padding: 0 12px calc(env(safe-area-inset-bottom, 0px) + 12px);
}

.tagam-checkout-footer__shell {
  background: #ffffff;
  border: 0;
  border-radius: 28px;
  padding: 10px;
  box-shadow: none;
}

.tagam-checkout-place-btn {
  min-height: 60px;
  border-radius: 999px !important;
  box-shadow: none !important;
  font-weight: 800;
}

.tagam-checkout-place-btn .row {
  font-size: 16px;
}

.tagam-checkout-page .q-item-label[caption],
.tagam-checkout-page .q-item__label--caption {
  font-size: 13px;
}

.tagam-checkout-page .q-item-label {
  line-height: 1.4;
}

.tagam-checkout-page .q-btn.text-weight-bold {
  font-weight: 800;
}

.tagam-checkout-address-hint {
  margin-top: 8px;
  color: #c26a1b;
  font-size: 13px;
  line-height: 1.35;
  font-weight: 700;
}

.tagam-checkout-address-hint--warning {
  color: #d9582f;
}

.tagam-checkout-address-btn {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px !important;
  background: #fff6ea !important;
  color: #f18800 !important;
  border: 1px solid rgba(241, 136, 0, 0.28);
  box-shadow: none !important;
  font-weight: 800;
}

.tagam-checkout-summary-card .tagam-checkout-summary-list {
  margin-left: 18px;
  margin-right: 18px;
}

@media (max-width: 480px) {
  .tagam-checkout-intro {
    padding-left: 20px;
  }

  .tagam-checkout-intro__title {
    max-width: 176px;
    font-size: 26px;
  }

  .tagam-checkout-intro__mark {
    min-width: 118px;
  }

  .tagam-checkout-step-title,
  .tagam-checkout-step-row {
    margin-left: 20px;
    margin-right: 20px;
  }
}

:global(body.body--dark) .tagam-checkout-page {
  background:
    radial-gradient(circle at top left, rgba(241, 136, 0, 0.08), transparent 24%),
    radial-gradient(circle at top right, rgba(120, 71, 33, 0.12), transparent 22%),
    linear-gradient(180deg, #140f0d 0%, #191311 46%, #1f1815 100%) !important;
}

:global(body.body--dark) .tagam-checkout-sticky-header {
  background: rgba(33, 26, 23, 0.98) !important;
  border-bottom: 1px solid var(--tagam-stroke) !important;
}

:global(body.body--dark) .tagam-checkout-intro {
  background: linear-gradient(
    135deg,
    rgba(54, 43, 33, 0.96) 0%,
    rgba(43, 34, 29, 0.98) 100%
  ) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-checkout-intro__title,
:global(body.body--dark) .tagam-checkout-step-title,
:global(body.body--dark) .tagam-checkout-page .text-weight-bold,
:global(body.body--dark) .tagam-checkout-page .text-subtitle2,
:global(body.body--dark) .tagam-checkout-page .text-dark {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-checkout-intro__mark {
  background: rgba(241, 136, 0, 0.1) !important;
  color: var(--tagam-primary) !important;
}

:global(body.body--dark) .tagam-checkout-hero,
:global(body.body--dark) .tagam-checkout-card,
:global(body.body--dark) .tagam-checkout-footer__shell {
  background: rgba(39, 31, 27, 0.96) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-checkout-page .q-item,
:global(body.body--dark) .tagam-checkout-page .q-list,
:global(body.body--dark) .tagam-checkout-page .myqlist {
  background: transparent !important;
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-checkout-page .border-grey,
:global(body.body--dark) .tagam-checkout-page .border-primary,
:global(body.body--dark) .tagam-checkout-page .bg-white {
  background: rgba(47, 37, 33, 0.96) !important;
  border-color: var(--tagam-stroke) !important;
}

:global(body.body--dark) .tagam-checkout-segmented-shell,
:global(body.body--dark) .tagam-checkout-delivery-option,
:global(body.body--dark) .tagam-checkout-address-btn,
:global(body.body--dark) .tagam-checkout-page .q-input.bg-mygrey1,
:global(body.body--dark) .tagam-checkout-page .q-field__control,
:global(body.body--dark) .tagam-checkout-segmented-arrow {
  background: rgba(47, 37, 33, 0.96) !important;
  border-color: var(--tagam-stroke) !important;
  color: var(--tagam-text) !important;
  box-shadow: none !important;
}

:global(body.body--dark) .tagam-checkout-page .q-item__label,
:global(body.body--dark) .tagam-checkout-page .q-item-label,
:global(body.body--dark) .tagam-checkout-page .q-field__native,
:global(body.body--dark) .tagam-checkout-page .q-field input,
:global(body.body--dark) .tagam-checkout-page .q-field textarea,
:global(body.body--dark) .tagam-checkout-page .text-subtitle2,
:global(body.body--dark) .tagam-checkout-page .text-weight-bold {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-checkout-page .q-btn-toggle,
:global(body.body--dark) .tagam-checkout-page .q-btn-toggle .q-btn {
  background: transparent !important;
}

:global(body.body--dark) .tagam-checkout-page .q-btn[aria-pressed="true"],
:global(body.body--dark) .tagam-checkout-page .q-btn-toggle .q-btn--active {
  background: linear-gradient(
    135deg,
    var(--tagam-primary) 0%,
    var(--tagam-primary-strong) 100%
  ) !important;
  color: #fff8f1 !important;
}

:global(body.body--dark) .tagam-checkout-address-hint {
  color: #d9cec2 !important;
}

:global(body.body--dark) .tagam-checkout-address-hint--warning {
  color: #ffb49f !important;
}

:global(body.body--dark) .tagam-checkout-page .text-caption,
:global(body.body--dark) .tagam-checkout-page .q-item__label--caption,
:global(body.body--dark) .tagam-checkout-page .text-grey,
:global(body.body--dark) .tagam-checkout-page .text-grey-7 {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-checkout-list .q-item + .q-item,
:global(body.body--dark) .tagam-checkout-page .q-separator {
  border-color: var(--tagam-stroke) !important;
  background: var(--tagam-stroke) !important;
}

:global(body.body--dark) .tagam-checkout-place-btn {
  box-shadow: 0 14px 26px rgba(217, 107, 29, 0.24) !important;
}
</style>
