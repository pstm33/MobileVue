<template>
  <q-dialog v-model="show_modal" position="bottom" @show="onShow">
    <q-card>
      <q-toolbar class="text-primary top-toolbar q-pl-md" dense>
        <q-toolbar-title
          class="text-weight-bold"
          :class="{
            'text-white': $q.dark.mode,
            'tagam-text-main': !$q.dark.mode,
          }"
        >
          {{ $t("Address") }}
        </q-toolbar-title>
        <q-space></q-space>
        <q-btn
          @click="show_modal = !true"
          color="white"
          square
          unelevated
          text-color="grey"
          icon="las la-times"
          dense
          no-caps
          size="sm"
          class="border-grey radius8"
        />
      </q-toolbar>
      <q-card-section style="max-height: 50vh" class="scroll">
        <q-inner-loading :showing="ClientStore.loading" color="primary">
        </q-inner-loading>

        <q-list>
          <template v-for="items in addressItems" :key="items.place_id || items.address_uuid">
            <q-item @click.stop="setPlaceID(items)" tag="label">
              <q-item-section avatar class="qlist-item-min2">
                <q-icon name="las la-map-marker" color="grey-5" />
              </q-item-section>
              <q-item-section>
                <q-item-label lines="2">{{ addressTitle(items) }}</q-item-label>
                <q-item-label lines="2" caption class="font11">
                  {{ addressSubtitle(items) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio
                  v-model="place_id"
                  :val="items.place_id"
                  color="secondary"
                  @update:model-value="setPlaceID(items)"
                />
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-card-section>
      <q-btn
        class="row items-start full-width border-grey-top"
        unelevated
        no-caps
        text-color="primary"
        size="lg"
        :to="{ name: 'map', query: { url: this.redirect } }"
      >
        <q-icon name="o_add" color="primary" class="q-mr-md" />
        <div>{{ $t("Add a new address") }}</div>
      </q-btn>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useClientStore } from "stores/ClientStore";
import auth from "src/api/auth";

export default {
  name: "ClientAddress",
  props: ["redirect"],
  data() {
    return {
      show_modal: false,
      loading: false,
      data: [],
      place_id: APIinterface.getStorage("place_id"),
    };
  },
  setup() {
    const ClientStore = useClientStore();
    return { ClientStore };
  },
  computed: {
    addressItems() {
      if (Array.isArray(this.ClientStore.data)) {
        return this.ClientStore.data;
      }
      if (this.ClientStore.data && typeof this.ClientStore.data === "object") {
        return Object.values(this.ClientStore.data);
      }
      return [];
    },
  },
  methods: {
    normalizedAddress(data) {
      return data?.address && typeof data.address === "object"
        ? data.address
        : data || {};
    },
    addressTitle(data) {
      const address = this.normalizedAddress(data);
      return (
        address.address1 ||
        address.address_label ||
        data?.address_label ||
        address.formatted_address ||
        data?.formatted_address ||
        this.$t("Address")
      );
    },
    addressSubtitle(data) {
      const address = this.normalizedAddress(data);
      return (
        address.address2 ||
        address.formatted_address ||
        data?.formatted_address ||
        data?.complete_address ||
        ""
      );
    },
    onShow() {
      if (auth.authenticated()) {
        this.ClientStore.getAddress();
      }
    },
    showModal(data) {
      this.show_modal = data;
    },
    setPlaceID(data) {
      const address = this.normalizedAddress(data);
      const placeId = data?.place_id || address?.place_id || data?.address_uuid;
      if (!placeId) {
        return;
      }

      this.place_id = placeId;
      APIinterface.setStorage("place_data", data);
      APIinterface.setStorage("place_id", placeId);
      this.show_modal = false;
      this.$emit("afterSetplaceid");
    },
  },
};
</script>




