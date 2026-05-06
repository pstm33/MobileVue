<template>
  <q-header
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
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
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
      <q-toolbar-title class="text-subtitle2 text-weight-bold"
        >{{ $t("Update Reservation") }} #{{
          BookingStore.booking_details?.data_booking?.reservation_id || ""
        }}</q-toolbar-title
      >
    </q-toolbar>
  </q-header>
  <q-page class="page-booking-page">
    <q-scroll-observer @scroll="onScroll" />
    <template v-if="loading">
      <div class="absolute-center full-width">
        <div class="flex flex-center">
          <q-spinner-ios size="sm" />
          <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
        </div>
      </div>
    </template>
    <template v-else-if="!hasData">
      <NoResults
        :message="$t('Reservation not found')"
        :description="
          $t('Oops we cannot find your reservation, please try again later.')
        "
      ></NoResults>
    </template>
    <q-form @submit="onSubmit" class="myform less" v-else>
      <q-card-section>
        <div class="row q-gutter-x-sm">
          <div class="col">
            <q-input
              v-model="first_name"
              :label="$t('First name')"
              outlined
              lazy-rules
              :rules="[
                (val) =>
                  (val && val.length > 0) || $t('This field is required'),
              ]"
            />
          </div>
          <div class="col">
            <q-input
              v-model="last_name"
              :label="$t('Last name')"
              outlined
              lazy-rules
              :rules="[
                (val) =>
                  (val && val.length > 0) || $t('This field is required'),
              ]"
            />
          </div>
        </div>

        <div class="row q-gutter-x-sm">
          <div class="col">
            <q-input
              v-model="email_address"
              :label="$t('Email address')"
              outlined
              lazy-rules
              :rules="[
                (val, rules) =>
                  rules.email(val) || $t('Please enter a valid email address'),
              ]"
            />
          </div>
          <div class="col">
            <q-input
              v-model="mobile_number"
              :options="DataStore.phone_prefix_data"
              mask="##############"
              outlined
              lazy-rules
              borderless
              class="input-borderless"
              :rules="[
                (val) =>
                  (val && val.length > 0) || this.$t('This field is required'),
              ]"
            >
              <template v-slot:prepend>
                <q-select
                  dense
                  v-model="mobile_prefix"
                  :options="DataStore.phone_prefix_data"
                  behavior="dialog"
                  input-debounce="700"
                  style="border: none"
                  emit-value
                  borderlessx
                  class="myq-field"
                >
                  <template v-slot:option="{ itemProps, opt }">
                    <q-item v-bind="itemProps">
                      <q-item-section avatar>
                        <q-img
                          :src="opt.flag"
                          style="height: 15px; max-width: 20px"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ opt.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        {{ $t("No results") }}
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-gutter-x-sm">
          <div class="col">
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
              :rules="[
                (val) =>
                  (val && val.length > 0) || this.$t('This field is required'),
              ]"
            />
          </div>
          <div class="col">
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
              :rules="[
                (val) => (val && val > 0) || $t('This field is required'),
              ]"
            />
          </div>
        </div>

        <div class="text-weight-bold text-subtitle2 q-mb-sm">
          {{ $t("Select Time Slot") }}
        </div>
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
                @update:model-value="table_id = ''"
                :label="$t('Room name')"
                transition-show="scale"
                transition-hide="scale"
                emit-value
                map-options
                outlined
                :rules="[
                  (val) => (val && val > 0) || $t('This field is required'),
                ]"
              />
            </div>
            <div class="col">
              <q-select
                v-model="table_id"
                :options="getTablelist[room_id] ?? []"
                :label="$t('Table name')"
                transition-show="scale"
                transition-hide="scale"
                emit-value
                map-options
                outlined
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
        />
      </q-card-section>

      <q-footer class="bg-white q-pa-sm text-dark shadow-1">
        <q-btn
          no-caps
          unelevated
          color="secondary"
          text-color="white"
          size="lg"
          rounded
          class="fit"
          type="submit"
          :loading="loading2"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Save") }}
          </div>
        </q-btn>
      </q-footer>
    </q-form>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useMenuStore } from "stores/MenuStore";
import { useBookingStore } from "stores/BookingStore";
import { useDataStore } from "stores/DataStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "BookingUpdate",
  components: {
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
  },
  data() {
    return {
      isScrolled: false,
      reservation_uuid: null,
      loading: false,
      loading2: false,
      first_name: "",
      last_name: "",
      email_address: "",
      mobile_number: "",
      mobile_prefix: "",
      guest: 0,
      reservation_date: "",
      reservation_time: "",
      special_request: "",
      room_id: "",
      table_id: "",
    };
  },
  setup() {
    const BookingStore = useBookingStore();
    const DataStore = useDataStore();
    return { BookingStore, DataStore };
  },
  mounted() {
    this.reservation_uuid = this.$route.query.id;
    this.fetchBookingdetails();
  },
  computed: {
    hasData() {
      return this.BookingStore?.booking_details || false;
    },
    getGuest() {
      return this.BookingStore?.booking_details?.guest_list || null;
    },
    getDate() {
      return this.BookingStore?.booking_details?.date_list || null;
    },
    getTime() {
      return this.BookingStore?.booking_details?.time_slot || null;
    },
    getTimeUnavailable() {
      return this.BookingStore?.booking_details?.not_available_time || null;
    },
    getRoomlist() {
      return this.BookingStore?.booking_details?.room_list || null;
    },
    getTablelist() {
      return this.BookingStore?.booking_details?.table_list || null;
    },
    getMerchantID() {
      return this.BookingStore?.booking_details?.merchant_uuid || null;
    },
    isAllowTable() {
      return this.BookingStore?.booking_details?.allowed_choose_table || false;
    },
  },
  methods: {
    async onSubmit() {
      try {
        APIinterface.showLoadingBox("", this.$q);
        this.loading2 = true;
        const results = await APIinterface.fetchPost(
          `apibookingv2/UpdateBooking`,
          {
            reservation_uuid: this.reservation_uuid,
            first_name: this.first_name,
            last_name: this.last_name,
            email_address: this.email_address,
            mobile_number: this.mobile_number,
            mobile_prefix: this.mobile_prefix,
            guest: this.guest,
            reservation_date: this.reservation_date,
            reservation_time: this.reservation_time,
            room_id: this.room_id,
            table_id: this.table_id,
            special_request: this.special_request,
          }
        );
        APIinterface.ShowSuccessful(results.msg, this.$q);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
        this.loading2 = false;
      }
    },
    isNotavailable(value) {
      if (Object.keys(this.getTimeUnavailable).length > 0) {
        if (this.getTimeUnavailable.includes(value) === true) {
          return true;
        }
      }
      return false;
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
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    async Gettimeslot() {
      try {
        this.reservation_time = "";
        APIinterface.showLoadingBox("", this.$q);
        const results = await APIinterface.fetchGet(
          `apibookingv2/fetchTimeslot`,
          {
            merchant_uuid: this.getMerchantID,
            reservation_date: this.reservation_date,
            guest: this.guest,
          }
        );
        this.BookingStore.booking_details.time_slot = results.details.time_slot;
        this.BookingStore.booking_details.not_available_time =
          results.details.not_available_time;
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    async fetchBookingdetails() {
      try {
        this.loading = true;
        const results = await this.BookingStore.fetchBookingdetails(
          this.reservation_uuid
        );

        this.first_name = results?.data_booking?.first_name || "";
        this.last_name = results?.data_booking?.last_name || "";
        this.email_address = results?.data_booking?.email_address || "";
        this.mobile_number =
          results?.data_booking?.contact_phone_without_prefix || "";
        this.mobile_prefix = results?.data_booking?.phone_prefix || "";

        this.guest = results?.data_booking?.guest_number_raw || 0;
        this.reservation_date =
          results?.data_booking?.reservation_date_raw || "";

        this.reservation_time =
          results?.data_booking?.reservation_time_raw || "";

        this.special_request = results?.data_booking?.special_request || "";

        this.room_id = results?.data_booking?.room_id || "";
        this.table_id = results?.data_booking?.table_id || "";
      } catch (error) {
        //APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
