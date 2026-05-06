<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    @show="onShow"
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-hide="onBeforeHide"
    @before-show="onBeforeShow"
  >
    <q-card class="tagam-address-picker-sheet" style="height: calc(95vh)">
      <q-card-section class="q-pa-none q-pt-sm">
        <q-toolbar class="q-gutter-x-sm">
          <q-btn
            @click="modal = false"
            dense
            icon="eva-arrow-back-outline"
            unelevated
            flat
          />
          <q-toolbar-title>
            {{ $t("Add or choose an address") }}
          </q-toolbar-title>
        </q-toolbar>
      </q-card-section>

      <q-card-section style="height: 70vh" class="scroll relative-position">
        <div class="tagam-address-picker q-gutter-y-md">
          <section class="tagam-address-picker__section">
            <div class="tagam-address-picker__title">
              {{ $t("Current location") }}
            </div>
            <q-list separator class="tagam-address-picker__card">
              <q-item clickable v-ripple:purple @click="chooseCurrentLocation">
                <q-item-section avatar top>
                  <q-avatar
                    color="grey-1"
                    text-color="blue-grey-6"
                    icon="eva-navigation-2-outline"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-subtitle2 text-weight-bold">
                    {{ $t("Current location") }}
                  </q-item-label>
                  <q-item-label caption>{{
                    $t("Use current area")
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </section>

          <section class="tagam-address-picker__section" v-if="is_login">
            <div class="tagam-address-picker__title">
              {{ $t("Saved addresses") }}
            </div>
            <div
              v-if="
                !ClientStore.location_saved_address ||
                !ClientStore.location_saved_address.length
              "
              class="tagam-address-picker__empty"
            >
              <div class="text-caption text-grey text-center full-width">
                {{ $t("No Saved Addresses") }}
              </div>
            </div>
            <q-list v-else separator class="tagam-address-picker__card">
              <template
                v-for="items in ClientStore.location_saved_address"
                :key="items"
              >
                <q-item clickable v-ripple:purple @click="setLocation(items)">
                  <q-item-section avatar top>
                    <q-avatar
                      color="grey-1"
                      text-color="blue-grey-6"
                      icon="eva-pin-outline"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle2 text-weight-bold">
                      {{ items?.address_label }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ items?.complete_address || "" }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </section>

          <section class="tagam-address-picker__section">
            <div class="tagam-address-picker__title">
              {{ $t("New address") }}
            </div>
            <q-list separator class="tagam-address-picker__card">
              <q-item clickable v-ripple :to="searchRoute">
                <q-item-section avatar>
                  <q-avatar
                    color="grey-1"
                    text-color="blue-grey-6"
                    icon="search"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-subtitle2 text-weight-bold">
                    {{ $t("Search location") }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple :to="mapRoute">
                <q-item-section avatar>
                  <q-avatar
                    color="grey-1"
                    text-color="blue-grey-6"
                    icon="eva-map-outline"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-subtitle2 text-weight-bold">
                    {{ $t("Choose Location") }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </section>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useClientStore } from "stores/ClientStore";

export default {
  name: "AddressRecentLocation",
  props: ["is_login", "redirect"],
  data() {
    return {
      modal: false,
      loading: false,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const ClientStore = useClientStore();
    return { DataStorePersisted, ClientStore };
  },
  methods: {
    chooseCurrentLocation() {
      const currentLocation = this.DataStorePersisted.location_data;
      if (currentLocation) {
        this.setLocation(currentLocation);
        return;
      }
      this.modal = false;
      this.$router.push(this.mapRoute);
    },
    async onBeforeShow() {
      if (!this.is_login) {
        return;
      }
      if (!this.ClientStore.location_saved_address) {
        try {
          this.loading = true;
          await this.ClientStore.fetchLocationAddress();
        } catch (error) {
          console.log("error", error);
        } finally {
          this.loading = false;
        }
      }
    },
    onShow() {},
    onBeforeHide() {},
    setLocation(value) {
      this.DataStorePersisted.location_data = value;
      if (value?.place_id) {
        APIinterface.setStorage("place_id", value.place_id);
        APIinterface.setStorage("place_data", value);
      }
      this.$emit("afterChooselocation", value);
      this.modal = false;
    },
    //
  },
  computed: {
    mapRoute() {
      return {
        path: "/location/add-location",
        query: { redirect: this.redirect },
      };
    },
    searchRoute() {
      return {
        path: "/location/add-location",
        query: { redirect: this.redirect },
      };
    },
  },
};
</script>

<style scoped>
.tagam-address-picker__title {
  font-size: 13px;
  font-weight: 700;
  color: #7e6d5b;
  margin-bottom: 8px;
}
.tagam-address-picker__card {
  border: 1px solid rgba(113, 74, 24, 0.08);
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
}
.tagam-address-picker__empty {
  min-height: 120px;
  display: flex;
  align-items: center;
}

:global(body.body--dark) .tagam-address-picker-sheet {
  background: var(--tagam-surface);
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-address-picker-sheet .q-toolbar {
  background: rgba(36, 29, 26, 0.96);
  color: var(--tagam-text);
  border-bottom: 1px solid var(--tagam-stroke);
}

:global(body.body--dark) .tagam-address-picker__title,
:global(body.body--dark) .tagam-address-picker-sheet .text-subtitle2,
:global(body.body--dark) .tagam-address-picker-sheet .text-weight-bold {
  color: var(--tagam-text);
}

:global(body.body--dark) .tagam-address-picker__card {
  background: var(--tagam-surface-raised);
  border-color: var(--tagam-stroke);
}

:global(body.body--dark) .tagam-address-picker-sheet .q-item,
:global(body.body--dark) .tagam-address-picker-sheet .q-list {
  color: var(--tagam-text-soft);
  background: transparent !important;
}

:global(body.body--dark) .tagam-address-picker-sheet .q-avatar {
  background: rgba(255, 239, 231, 0.06) !important;
  color: var(--tagam-primary) !important;
}

:global(body.body--dark) .tagam-address-picker-sheet .q-item__label,
:global(body.body--dark) .tagam-address-picker-sheet .q-toolbar__title,
:global(body.body--dark) .tagam-address-picker-sheet .q-item__section {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-address-picker-sheet .text-grey,
:global(body.body--dark) .tagam-address-picker-sheet .text-caption,
:global(body.body--dark) .tagam-address-picker-sheet .q-item__label--caption {
  color: var(--tagam-text-muted) !important;
}
</style>
