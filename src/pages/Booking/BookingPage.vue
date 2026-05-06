<template>
  <q-header reveal reveal-offset="50" class="bg-transparent q-pa-sm">
    <div class="tagam-account-header-shell">
      <q-toolbar class="q-px-xs">
        <q-btn
          @click="$router.back()"
          flat
          round
          dense
          icon="las la-angle-left"
          class="q-mr-sm"
          :color="$q.dark.mode ? 'white' : 'dark'"
        />
        <q-toolbar-title class="text-weight-bold">
          {{ $t("Table Booking") }}
        </q-toolbar-title>
      </q-toolbar>
    </div>
  </q-header>
  <q-page class="tagam-page-shell q-px-md q-pb-xl page-booking-page">
    <q-scroll-observer @scroll="onScroll" />
    <q-form @submit="onSubmit" class="q-pt-lg">
      <section class="tagam-section-shell">
        <div class="tagam-section-heading tagam-section-heading--stacked">
          <div>
            <div class="tagam-section-heading__eyebrow">{{ $t("Booking") }}</div>
            <div class="tagam-section-heading__title">
              {{ $t("Reserve your table") }}
            </div>
          </div>
          <div class="tagam-section-heading__meta">
            {{ $t("Choose guest count, date and available time slot") }}
          </div>
        </div>

        <div class="tagam-list-card q-pa-md q-gutter-y-md">
        <q-select
          v-model="guest"
          :options="getGuest"
          :label="$t('Guest')"
          @update:model-value="Gettimeslot()"
          transition-show="scale"
          transition-hide="scale"
          emit-value
          map-options
          outlined
          bg-color="white"
          :rules="[(val) => (val && val > 0) || $t('This field is required')]"
        />

        <q-select
          v-model="reservation_date"
          :options="getDate"
          @update:model-value="Gettimeslot()"
          :label="$t('Date')"
          transition-show="scale"
          transition-hide="scale"
          emit-value
          map-options
          outlined
          bg-color="white"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <div class="text-weight-bold text-subtitle2 q-mb-sm">
          {{ $t("Select Time Slot") }}
        </div>

        <template v-if="getTime?.length <= 0">
          <div
            class="bg-error text-error q-pa-sm text-caption line-normal q-mb-sm rounded-borders"
          >
            <q-list dense class="myqlist">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="eva-alert-triangle-outline"></q-icon>
                </q-item-section>
                <q-item-section>
                  <div>{{ $t("No available time slot") }}</div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </template>

        <template v-for="items in getTime" :key="items">
          <div class="flex q-gutter-x-md q-gutter-y-sm">
            <template v-for="(item, index) in items" :key="item">
              <q-btn
                unelevated
                class="border-grey radius8"
                :class="getColor(index)"
                :color="getColor(index)"
                :text-color="getTextColor(index)"
                @click="reservation_time = index"
                :disabled="isNotavailable(index)"
                >{{ item }}</q-btn
              >
            </template>
          </div>
          <q-space class="q-pa-sm"></q-space>
        </template>

        <template v-if="isAllowTable">
          <div class="row q-gutter-x-sm">
            <div class="col">
              <q-select
                v-model="room_id"
                :options="getRoomlist"
                @update:model-value="fetchTableList"
                :label="$t('Room name')"
                transition-show="scale"
                transition-hide="scale"
                emit-value
                map-options
                outlined
                bg-color="white"
                :rules="[
                  (val) => (val && val > 0) || $t('This field is required'),
                ]"
              />
            </div>
            <div class="col">
              <q-select
                v-model="table_id"
                :options="getTablelist ? getTablelist[room_id] ?? [] : []"
                :label="$t('Table name')"
                transition-show="scale"
                transition-hide="scale"
                emit-value
                map-options
                outlined
                bg-color="white"
                :rules="[
                  (val) => (val && val > 0) || $t('This field is required'),
                ]"
              />
            </div>
          </div>
        </template>

        <q-input
          v-model="special_request"
          :label="$t('Special request')"
          autogrow
          outlined
          bg-color="white"
        />

        <div v-if="BookingStore.attributes_data?.tc" class="q-mb-md q-mt-md">
          <div class="text-weight-bold text-subtitle2">
            {{ $t("Restaurant Terms & Conditions") }}
          </div>
          <div
            class="text-body2"
            v-html="BookingStore.attributes_data?.tc"
          ></div>
        </div>

        <template v-if="capchaEnabled">
          <componentsRecaptcha
            ref="recapcha"
            is_enabled="1"
            size="normal"
            theme="light"
            :tabindex="0"
            :sitekey="DataStore.getBookingSettings?.site_key"
            :language_code="DataStore.getBookingSettings?.language"
            @verify="recaptchaVerified"
            @expire="recaptchaExpired"
            @fail="recaptchaFailed"
          />
        </template>
        </div>
      </section>
      <q-footer class="bg-transparent q-px-md q-pb-sm q-pt-sm text-dark">
        <div class="tagam-footer-shell">
        <q-btn
          no-caps
          unelevated
          color="secondary"
          text-color="white"
          size="lg"
          rounded
          class="fit"
          type="submit"
          :loading="loading"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Reserve") }}
          </div>
        </q-btn>
        </div>
      </q-footer>
    </q-form>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useBookingStore } from "stores/BookingStore";
import { useDataStore } from "stores/DataStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "BookingPage",
  components: {
    componentsRecaptcha: defineAsyncComponent(() =>
      import("components/componentsRecaptcha.vue")
    ),
  },
  data() {
    return {
      loading: false,
      merchant_uuid: null,
      isScrolled: false,
      first_name: "",
      last_name: "",
      email_address: "",
      mobile_number: "",
      mobile_prefix: "",
      guest: 1,
      reservation_date: "",
      reservation_time: "",
      special_request: "",
      room_id: "",
      table_id: "",
      table_list: null,
      recaptcha_response: null,
    };
  },
  setup() {
    const BookingStore = useBookingStore();
    const DataStore = useDataStore();
    return {
      BookingStore,
      DataStore,
    };
  },
  mounted() {
    this.merchant_uuid = this.$route.query.uuid;
    this.mobile_prefix = this.DataStore.phone_default_data?.phonecode || null;

    if (this.BookingStore.saved_merchant_uuid) {
      if (this.merchant_uuid != this.BookingStore.saved_merchant_uuid) {
        this.BookingStore.attributes_data = null;
      }
    }

    if (!this.BookingStore.attributes_data) {
      this.getAttributes();
    } else {
      this.guest = this.BookingStore.attributes_data?.default_guest || 0;
      this.reservation_date =
        this.BookingStore.attributes_data?.default_date || "";
    }
  },
  beforeUnmount() {
    this.BookingStore.saved_merchant_uuid = this.merchant_uuid;
  },
  computed: {
    getGuest() {
      return this.BookingStore.attributes_data?.guest_list || null;
    },
    getDate() {
      return this.BookingStore?.attributes_data?.date_list || null;
    },
    getTime() {
      return this.BookingStore?.attributes_data?.time_slot || null;
    },
    getTimeUnavailable() {
      return this.BookingStore?.attributes_data?.not_available_time || null;
    },
    getRoomlist() {
      return this.BookingStore?.attributes_data?.room_list || null;
    },
    getTablelist() {
      return this.table_list || null;
    },
    isAllowTable() {
      return this.BookingStore?.attributes_data?.allowed_choose_table || false;
    },
    capchaEnabled() {
      return this.BookingStore?.attributes_data?.enabled_capcha || false;
    },
  },
  watch: {
    guest(newval, oldval) {
      console.log("guest", newval);
      this.fetchTableList();
    },
    reservation_date(newval, oldval) {
      console.log("reservation_date", newval);
      this.fetchTableList();
    },
    reservation_time(newval, oldval) {
      console.log("reservation_time", newval);
      this.fetchTableList();
    },
  },
  methods: {
    recaptchaExpired() {
      if (APIinterface.empty(this.$refs.recapcha)) {
        this.$refs.recapcha.reset();
      }
    },
    recaptchaFailed() {},
    recaptchaVerified(response) {
      this.recaptcha_response = response;
    },
    async fetchTableList() {
      try {
        if (!this.isAllowTable) {
          return;
        }
        this.table_id = "";
        const response = await APIinterface.fetchGet(
          `apibookingv2/fetchTableList`,
          {
            merchant_uuid: this.merchant_uuid,
            reservation_date: this.reservation_date,
            reservation_time: this.reservation_time,
            guest: this.guest,
          }
        );
        console.log("response", response);
        this.table_list = response.details.table_list;
      } catch (error) {
      } finally {
      }
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    getColor(value) {
      if (this.reservation_time == value) {
        return "secondary";
      } else if (this.isNotavailable(value)) {
        return "disabled";
      }
    },
    getTextColor(value) {
      if (this.reservation_time == value) {
        return "white";
      } else if (this.isNotavailable(value)) {
        return "disabled";
      }
      return "dark";
    },
    isNotavailable(value) {
      if (Object.keys(this.getTimeUnavailable).length > 0) {
        if (this.getTimeUnavailable.includes(value) === true) {
          return true;
        }
      }
      return false;
    },
    async onSubmit() {
      try {
        this.loading = true;
        const response = await APIinterface.fetchPost(
          "apibookingv2/ReserveTable",
          {
            merchant_uuid: this.merchant_uuid,
            guest: this.guest,
            reservation_date: this.reservation_date,
            reservation_time: this.reservation_time,
            room_id: this.room_id,
            table_id: this.table_id,
            special_request: this.special_request,
            recaptcha_response: this.recaptcha_response ?? "",
          }
        );
        this.$router.replace({
          path: "/store/booking-succesful",
          query: {
            uuid: this.merchant_uuid,
            reservation_uuid: response.details.reservation_uuid,
          },
        });
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    async Gettimeslot() {
      try {
        this.reservation_time = "";
        APIinterface.showLoadingBox("", this.$q);
        const response = await APIinterface.fetchGet(
          `apibookingv2/fetchTimeslot`,
          {
            merchant_uuid: this.merchant_uuid,
            reservation_date: this.reservation_date,
            guest: this.guest,
          }
        );
        console.log("response", response);
        this.BookingStore.attributes_data.time_slot =
          response.details.time_slot;
        this.BookingStore.attributes_data.all_time_slot =
          response.details.all_time_slot;

        this.BookingStore.attributes_data.not_available_time =
          response.details.not_available_time;
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    async getAttributes() {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const response = await this.BookingStore.getAttributes(
          this.merchant_uuid
        );
        console.log("response", response);
        this.guest = response?.default_guest || 0;
        this.reservation_date = response?.default_date || "";
      } catch (error) {
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
  },
};
</script>
