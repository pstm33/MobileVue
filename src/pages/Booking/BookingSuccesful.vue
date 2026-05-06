<template>
  <q-page>
    <div class="absolute-center full-width q-pa-md text-center">
      <template v-if="loading">
        <div class="absolute-center flex flex-center q-gutter-x-sm">
          <q-spinner-ios size="sm" />
          <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
        </div>
      </template>
      <template v-else>
        <template v-if="!getData">
          <q-card-section>
            <div
              class="bg-error text-error q-pa-sm text-caption line-normal q-mb-sm radius8"
            >
              <q-list dense class="myqlist">
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="eva-alert-triangle-outline"></q-icon>
                  </q-item-section>
                  <q-item-section>
                    <div>{{ error }}</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
          <q-card-actions vertical>
            <q-btn no-caps unelevated to="/home">
              <div class="text-subtitle2 text-weight-bold text-blue">
                {{ $t("Return home") }}
              </div>
            </q-btn>
          </q-card-actions>
        </template>

        <template v-if="getData">
          <q-card-section>
            <svg
              class="checkmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                class="checkmark__circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                class="checkmark__check"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>

            <div class="text-h6 text-weight-bold line-normal">
              {{ $t("Your reservation successfully placed. ") }}
            </div>
            <div class="text-caption text-grey">
              {{
                $t(
                  "You will receive another email once your reservation is confirm. "
                )
              }}
            </div>

            <q-space class="q-pa-sm"></q-space>
            <div class="text-body2">
              {{ getData?.reservation_datetime }}
            </div>
            <div class="text-caption">{{ getData?.guest_number }}</div>
            <div class="text-caption">
              {{ $t("Reservation ID") }}# {{ getData?.reservation_id }}
            </div>
          </q-card-section>
          <q-card-actions vertical>
            <q-btn
              no-caps
              unelevated
              color="secondary"
              text-color="white"
              size="lg"
              rounded
              class="fit"
              @click.stop="
                this.$router.replace({
                  name: 'menu',
                  params: {
                    slug: merchantSlug,
                  },
                })
              "
            >
              <div class="text-subtitle2 text-weight-bold">
                {{ $t("Reserved again") }}
              </div>
            </q-btn>
            <q-space class="q-pa-sm"></q-space>
            <q-btn
              no-caps
              unelevated
              color="disabled"
              text-color="disabled"
              size="lg"
              rounded
              class="fit"
              @click="viewDetails"
            >
              <div class="text-subtitle2 text-weight-bold">
                {{ $t("View Booking") }}
              </div>
            </q-btn>
          </q-card-actions>
        </template>
      </template>
    </div>

    <BookingDetails
      ref="ref_booking"
      :cancel_reason="cancelReason"
      @after-cancel="afterCancel"
    ></BookingDetails>
  </q-page>
</template>

<script>
import { useBookingStore } from "stores/BookingStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "BookingSuccesful",
  components: {
    BookingDetails: defineAsyncComponent(() =>
      import("components/BookingDetails.vue")
    ),
  },
  data() {
    return {
      loading: false,
      merchant_uuid: null,
      reservation_uuid: null,
      error: null,
    };
  },
  setup() {
    const BookingStore = useBookingStore();
    return {
      BookingStore,
    };
  },
  computed: {
    getData() {
      return this.BookingStore.booking_details?.data_booking || null;
    },
    merchantSlug() {
      return this.BookingStore.booking_details?.merchant_slug || null;
    },
    cancelReason() {
      return this.BookingStore.booking_details?.cancel_reason || null;
    },
  },
  mounted() {
    this.merchant_uuid = this.$route.query.uuid;
    this.reservation_uuid = this.$route.query.reservation_uuid;
    this.fetchBookingdetails();
  },
  methods: {
    viewDetails() {
      console.log("viewDetails", this.getData);
      this.$refs.ref_booking.ViewDetails(this.getData, null);
    },
    async fetchBookingdetails() {
      try {
        this.loading = true;
        await this.BookingStore.fetchBookingdetails(this.reservation_uuid);
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    afterCancel() {
      this.fetchBookingdetails();
    },
  },
};
</script>
