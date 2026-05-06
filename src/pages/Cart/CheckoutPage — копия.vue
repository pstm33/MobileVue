<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-black': !$q.dark.mode,
        'border-bottom': !isScrolled,
        'shadow-bottom': isScrolled,
      }"
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
          {{ CartStore.getStore }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page>
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
        <q-space style="height: 8px" class="bg-mygrey1 q-mb-md"></q-space>

        <div class="q-pl-md q-pr-md">
          <q-btn-toggle
            v-model="transaction_type"
            color="mygrey1"
            toggle-color="orange-1"
            text-color="grey"
            toggle-text-color="blue-grey-6"
            no-caps
            unelevated
            class="rounded-group"
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
                  <div>{{ error }}</div>
                </template>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- DELIVERY ADDRESS -->
        <template v-if="CartStore.geTransactiontype == 'delivery'">
          <!-- <pre>{{ CartStore.getAddress }}</pre>
          <pre>{{ CartStore.getAddressDetails }}</pre> -->
          <template v-if="search_mode == 'address'">
            <q-list dense class="myqlist">
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
                </q-item-section>
                <q-item-section side>
                  <q-icon
                    name="eva-arrow-ios-forward-outline"
                    size="xs"
                  ></q-icon>
                </q-item-section>
              </q-item>
              <q-item
                class="border-grey q-ml-md q-mr-md radius8 q-mt-sm"
                clickable
                v-ripple:purple
                @click.stop="AddEditAddress"
              >
                <q-item-section
                  avatar
                  v-if="!CartStore.getAddress?.is_address_found"
                >
                  <q-icon name="eva-info-outline" color="error"></q-icon>
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    caption
                    lines="1"
                    :class="{
                      'text-error': !CartStore.getAddress?.is_address_found,
                    }"
                  >
                    <div>
                      {{
                        CartStore.getAddress?.is_address_found
                          ? CartStore.getAddress?.address_details
                          : this.$t("Complete your address details")
                      }}
                    </div>
                    <div>
                      {{ CartStore.getAddress?.instructions }}
                    </div>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    :label="
                      CartStore.getAddress?.is_address_found
                        ? this.$t('Edit')
                        : this.$t('Add')
                    "
                    @click="
                      AddEditAddress(CartStore.getAddress?.is_address_found)
                    "
                    unelevated
                    no-caps
                    text-color="blue"
                    class="text-weight-bold"
                  ></q-btn>
                </q-item-section>
              </q-item>
              <q-space class="q-pa-sm"></q-space>
              <q-item>
                <q-item-section avatar top>
                  <q-icon name="directions_bike" class="text-red"></q-icon>
                </q-item-section>
                <q-item-section top>
                  <q-item-label class="text-caption text-weight-bold">{{
                    $t("Delivery options")
                  }}</q-item-label>
                  <q-item-label class="ellipsis" caption>
                    {{ CartStore.getDistance }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </template>
          <template v-else-if="search_mode == 'location'">
            <!-- ADDRESS LOCATION -->
            <q-list dense class="myqlist">
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
                </q-item-section>
                <q-item-section side>
                  <q-avatar
                    text-color="disabled"
                    icon="eva-arrow-ios-forward-outline"
                    size="md"
                  />
                </q-item-section>
              </q-item>
              <q-item
                clickable
                class="border-grey q-ml-md q-mr-md radius8 q-mt-sm"
                @click="
                  handleAddEditAddress(CartStore.getAddress?.is_address_found)
                "
              >
                <q-item-section
                  avatar
                  v-if="!CartStore.getAddress?.is_address_found"
                >
                  <q-icon name="eva-info-outline" color="error"></q-icon>
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    caption
                    lines="1"
                    :class="{
                      'text-error': !CartStore.getAddress?.is_address_found,
                    }"
                  >
                    {{
                      CartStore.getAddress?.is_address_found
                        ? CartStore.getAddress?.complete_address
                        : this.$t("Complete your address details")
                    }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    :label="
                      CartStore.getAddress?.is_address_found
                        ? this.$t('Edit')
                        : this.$t('Add')
                    "
                    @click="
                      handleAddEditAddress(
                        CartStore.getAddress?.is_address_found
                      )
                    "
                    unelevated
                    no-caps
                    text-color="blue"
                    class="text-weight-bold"
                  ></q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </template>
        </template>
        <template v-else>
          <q-list dense class="myqlist">
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

        <q-list class="q-pl-md q-pr-md q-mt-md">
          <template v-for="items in CartStore.getDeliveryOptions2" :key="items">
            <q-item
              clickable
              v-ripple:purple
              class="text-weight-bold radius8"
              :class="{
                'border-primary': CartStore.geDeliverytype == items.value,
                'border-grey': CartStore.geDeliverytype != items.value,
              }"
              @click="changeDeliveryType(items.value)"
            >
              <q-item-section>
                <div class="flex items-center q-gutter-x-sm">
                  <div>
                    {{ items.name }} <span v-if="items.estimation">&bull;</span>
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

        <template v-if="transaction_type == 'dinein'">
          <q-space style="height: 8px" class="bg-mygrey1 q-mt-mdx"></q-space>
          <div class="q-pa-md">
            <CheckoutBooking
              ref="checkout_booking"
              :room_list="CartStore.getRoomList"
              :table_list="CartStore.getTableList"
            ></CheckoutBooking>
          </div>
        </template>

        <q-space style="height: 8px" class="bg-mygrey1 q-mt-mdx"></q-space>

        <q-list>
          <q-item>
            <q-item-section avatar class="text-weight-bold text-subtitle2">
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
        <q-list dense>
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
        <!-- <pre>{{ CartStore.getPoints }}</pre> -->

        <q-space style="height: 8px" class="bg-mygrey1 q-mt-md"></q-space>

        <q-list class="myqlist">
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
                    CartStore.getPayment?.attr1 || $t("Select payment method")
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
    class="bg-white q-pa-sm shadow-1 text-dark"
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
      class="fit"
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
      search_mode == 'location'
        ? CartStore.getAddress
        : CartStore.getAddressDetails
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

    this.CartStore.getCart(true, this.payload);

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
        }, 100);
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
  },
  methods: {
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
      this.$refs.ref_address_details.modal = true;
    },
    afterSaveaddress(value) {
      console.log("afterSaveaddress", value);
      if (this.search_mode == "address") {
        this.DataStorePersisted.place_data = value;
        this.DataStorePersisted.coordinates = {
          lat: value.latitude,
          lng: value.longitude,
        };
      } else if (this.search_mode == "location") {
        this.ClientStore.location_saved_address = null;
        this.DataStorePersisted.location_data = value;
      }
      this.ClientStore.data = null;
      this.CartStore.getCart(false, this.payload);
    },
    afterChooselocation(value) {
      console.log("afterChooselocation", value);
      this.ClientStore.data = null;
      this.CartStore.getCart(false, this.payload);
    },
    afterChooseaddress(value, isWrite) {
      console.log("afterChooseaddress", value);
      if (value) {
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
