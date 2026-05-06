<template>
  <q-dialog
    v-model="modal"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="bg-mygrey1">
      <div class="fixed-top bg-white text-dark z-top">
        <q-toolbar class="shadow-1x border-bottom">
          <!-- <q-btn
            @click="modal = false"
            dense
            color="grey-5"
            icon="close"
            size="md"
            unelevated
            flat
            class="q-mr-sm"
          /> -->
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            color="dark"
          ></q-btn>
          <q-toolbar-title class="text-subtitle2 text-weight-bold">
            {{ data?.reservation_date }}
          </q-toolbar-title>
        </q-toolbar>
      </div>
      <q-space style="height: 50px"></q-space>

      <q-card-section>
        <div class="row items-center justify-between text-subtitle2 text-dark">
          <div class="col-4">{{ $t("Reservation ID") }}</div>
          <div class="col-4 text-right">
            {{ data?.reservation_id || "" }}
          </div>
        </div>
      </q-card-section>

      <q-card-section class="bg-white q-pa-xs">
        <q-list>
          <q-item>
            <q-item-section avatar top>
              <q-avatar>
                <q-responsive style="width: 50px; height: 50px">
                  <q-img
                    :src="data?.logo_url"
                    lazy
                    fit="cover"
                    class="radius8"
                    spinner-color="amber"
                    spinner-size="sm"
                  />
                </q-responsive>
              </q-avatar>
            </q-item-section>
            <q-item-section top>
              <q-item-label class="subtitle-2 text-weight-bold"
                >{{ data?.restaurant_name || "" }}
              </q-item-label>
              <q-item-label caption class="text-capitalize">
                &bull;
                <q-badge
                  rounded
                  :color="DataStore.getColors(data?.status_raw)"
                  :text-color="DataStore.getTextColors(data?.status_raw)"
                  :label="data?.status"
                  class="text-capitalize"
                ></q-badge>
              </q-item-label>
            </q-item-section>
            <q-item-section side top v-if="data?.can_modify">
              <q-btn
                :label="$t('Cancel')"
                no-caps
                unelevated
                color="red"
                flat
                padding="0"
                class="text-weight-bold"
                @click="this.$refs.ref_cancel.modal = true"
              ></q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-space class="q-pa-xs"></q-space>
      <q-card-section class="bg-white q-pa-none">
        <q-list dense>
          <q-item header class="bg-mygrey1 text-blue-grey-6">
            {{ $t("Reservation details") }}
          </q-item>
          <q-item>
            <q-item-section>{{ $t("Guest") }}</q-item-section>
            <q-item-section side>{{ data?.guest_number || "" }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>{{ $t("Date") }}</q-item-section>
            <q-item-section side>{{ data?.reservation_date }} </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-space class="q-pa-xs"></q-space>
      <q-card-section class="bg-white q-pa-none">
        <q-list dense>
          <q-item header class="bg-mygrey1 text-blue-grey-6">
            {{ $t("Your Details") }}
          </q-item>
          <q-item>
            <q-item-section>{{ $t("Name") }}</q-item-section>
            <q-item-section side>{{ data?.full_name }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>{{ $t("Email address") }}</q-item-section>
            <q-item-section side>{{ data?.email_address }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>{{ $t("Contact number") }}</q-item-section>
            <q-item-section side>{{ data?.contact_phone }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>{{ $t("Special request") }}</q-item-section>
            <q-item-section side> {{ data?.special_request }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions class="row q-pa-md" v-if="data?.can_modify">
        <q-btn
          class="col"
          no-caps
          unelevated
          color="disabled"
          text-color="disabled"
          size="lg"
          rounded
          :to="{
            path: '/booking/update',
            query: { id: data?.reservation_uuid },
          }"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Modify Reservation") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <BookingCancel
    ref="ref_cancel"
    :cancel_reason="cancel_reason"
    :reservation_uuid="data?.reservation_uuid || null"
    @after-cancel="afterCancel"
  ></BookingCancel>
</template>

<script>
import { useDataStore } from "stores/DataStore";
import { defineAsyncComponent } from "vue";
export default {
  name: "BookingDetails",
  props: ["cancel_reason"],
  components: {
    BookingCancel: defineAsyncComponent(() =>
      import("components/BookingCancel.vue")
    ),
  },
  data() {
    return {
      modal: false,
      data: null,
      index: null,
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  methods: {
    afterCancel(value) {
      this.data = value;
      this.$emit("afterCancel", value, this.index);
    },
    ViewDetails(value, index) {
      this.data = value;
      this.index = index;
      this.modal = true;
    },
  },
};
</script>
