<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
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
          <q-toolbar-title class="text-weight-bold">{{
            $t("Address")
          }}</q-toolbar-title>
        </q-toolbar>
      </div>
    </q-header>
    <q-page class="tagam-page-shell q-px-md q-pb-xl">
      <q-scroll-observer @scroll="onScroll" />

      <template v-if="loading">
        <div class="absolute-center flex flex-center q-gutter-x-sm">
          <q-spinner-ios size="sm" />
          <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
        </div>
      </template>
      <template v-else>
        <div class="q-pt-lg" v-if="!getAddress">
        <NoResults
          :message="$t('No Saved Addresses')"
          :description="
            $t('Add your delivery address to place an order quickly!')
          "
        ></NoResults>
        </div>
      </template>

      <section class="tagam-section-shell q-mt-lg">
        <div class="tagam-section-heading tagam-section-heading--stacked">
          <div>
            <div class="tagam-section-heading__eyebrow">{{ $t("My Account") }}</div>
            <div class="tagam-section-heading__title">{{ $t("Address") }}</div>
          </div>
          <div class="tagam-section-heading__meta">
            {{ $t("Saved delivery addresses for quick checkout") }}
          </div>
        </div>
      <q-list separator class="tagam-list-card q-pa-sm">
        <template v-for="items in getAddress" :key="items">
          <q-item
            class="tagam-account-row"
            clickable
            v-ripple:purple
            @click.stop="setAddress(items)"
          >
            <q-item-section>
              <q-item-label class="text-weight-bold text-subtitle2">{{
                items.address_label
              }}</q-item-label>
              <q-item-label caption class="tagam-page-copy">{{
                items?.formatted_address || items.complete_address
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                color="grey300"
                no-caps
                unelevated
                flat
                icon="eva-trash-2-outline"
                padding="5px"
                @click.stop="ConfirmDelete(items)"
              ></q-btn>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
      </section>
      <q-footer class="bg-transparent q-px-md q-pb-sm q-pt-sm text-dark">
        <div class="tagam-footer-shell">
        <q-btn
          no-caps
          unelevated
          color="disabled"
          text-color="disabled"
          size="lg"
          rounded
          class="fit"
          @click="this.$refs.ref_address.modal = true"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Add new address") }}
          </div>
        </q-btn>
        </div>
      </q-footer>

      <ConfirmDelete
        ref="ref_confirm"
        @after-confirm="afterConfirm"
      ></ConfirmDelete>

      <component
        :is="AddressRecent"
        ref="ref_address"
        :map_provider="
          DataStore.maps_config ? DataStore.maps_config.provider : null
        "
        :recent_addresses="DataStorePersisted.recent_addresses"
        :is_login="true"
        :is_addnew="true"
        redirect="/account/my-address?addnew=1"
        @after-chooseaddress="afterChooseaddress"
        @after-chooselocation="afterChooselocation"
      ></component>

      <component
        :is="AddressDetails"
        ref="ref_address_details"
        :is_address_found="is_address_found"
        :address_data="address_data"
        :maps_config="DataStore.maps_config ?? null"
        :delivery_options_data="DataStore.getDeliveryOptions"
        :enabled_map_selection="
          DataStore.attributes_data?.location_enabled_map_selection || false
        "
        @after-saveaddress="afterSaveaddress"
      ></component>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import { useClientStore } from "stores/ClientStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import config from "src/api/config";

export default {
  name: "MyAddress",
  components: {
    NoResults: defineAsyncComponent(() => import("components/NoResults.vue")),
    ConfirmDelete: defineAsyncComponent(() =>
      import("components/ConfirmDelete.vue")
    ),
  },
  data() {
    return {
      isScrolled: false,
      loading: false,
      address_data: null,
      is_address_found: false,
      search_mode: null,
      addnew: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    const ClientStore = useClientStore();
    const DataStorePersisted = useDataStorePersisted();

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
      DataStore,
      ClientStore,
      DataStorePersisted,
      AddressRecent,
      AddressDetails,
    };
  },
  mounted() {
    this.search_mode = this.DataStore.getSearchMode;
    const addnew = this.$route.query.addnew;
    if (addnew) {
      this.addnew = true;
    }
    this.fecthAddress();
  },
  computed: {
    getAddress() {
      return this.ClientStore.address_data;
    },
  },
  watch: {
    addnew(newval, oldval) {
      if (!newval) {
        return;
      }

      if (this.search_mode == "location") {
        if (this.DataStorePersisted.location_data) {
          this.afterChooselocation(this.DataStorePersisted.location_data);
        }
        return;
      }

      const placeData = this.DataStorePersisted.place_data;
      const coordinates = this.DataStorePersisted.coordinates;
      if (!placeData && !coordinates) {
        return;
      }

      this.afterChooselocation({
        ...(placeData || {}),
        latitude:
          placeData?.latitude ??
          coordinates?.lat ??
          null,
        longitude:
          placeData?.longitude ??
          coordinates?.lng ??
          null,
      });
    },
  },
  methods: {
    afterChooselocation(value) {
      this.address_data = value;
      this.is_address_found = false;
      if (this.$refs.ref_address_details) {
        this.$refs.ref_address_details.modal = true;
      } else {
        setTimeout(() => {
          this.$refs.ref_address_details.modal = true;
        }, 500);
      }
    },
    setAddress(value) {
      this.address_data = value;
      this.is_address_found = value?.address_uuid ? true : false;
      this.$refs.ref_address_details.modal = true;
    },
    afterSaveaddress(value) {
      this.DataStorePersisted.place_data = value;
      this.DataStorePersisted.coordinates = {
        lat: value.latitude,
        lng: value.longitude,
      };
      this.ClientStore.data = null;
      this.reFetchAddress();
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    refresh(done) {
      done();
      this.reFetchAddress();
    },
    reFetchAddress() {
      this.ClientStore.address_data = null;
      this.fecthAddress();
    },
    async fecthAddress() {
      try {
        this.loading = true;
        if (!this.ClientStore.address_data) {
          if (this.search_mode == "address") {
            await this.ClientStore.fecthAddress();
          } else {
            const response = await APIinterface.fetchGet(
              `${config.api_location}/fetchLocationAddress`
            );
            this.ClientStore.address_data = response.details.data;
          }
        }
      } catch (error) {
      } finally {
        this.loading = false;
      }
    },
    ConfirmDelete(value) {
      this.$refs.ref_confirm.ConfirmDelete({
        id: value.address_uuid,
        title: value.address_label,
        subtitle: value?.formatted_address || value.complete_address,
      });
    },
    async afterConfirm(value) {
      this.$refs.ref_confirm.modal = false;
      try {
        APIinterface.showLoadingBox("", this.$q);

        if (this.search_mode == "address") {
          await APIinterface.deleteAddress(value.id);
        } else {
          await APIinterface.fetchPost(`${config.api_location}/deleteAddress`, {
            address_uuid: value.id,
          });
        }
        this.ClientStore.address_data = this.ClientStore.address_data.filter(
          (item) => item.address_uuid !== value.id
        );

        if (!Object.keys(this.ClientStore.address_data).length) {
          this.ClientStore.address_data = null;
        }
        this.ClientStore.data = null;
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    afterChooseaddress(value, isWrite) {
      const place_data = value?.place_data || null;

      this.setAddress(place_data);

      this.DataStorePersisted.recently_change_address = true;
      if (value.place_data) {
        this.DataStorePersisted.place_data = value.place_data;
        this.DataStorePersisted.coordinates = value.location_coordinates;

        if (isWrite) {
          this.DataStorePersisted.saveRecentAddress(value.place_data);
        }
        this.DataStore.recommended_data = null;

        setTimeout(() => {
          this.DataStore.clearData();
        }, 500);
      }
    },
  },
};
</script>
