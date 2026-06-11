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
    <q-card style="height: calc(95vh)">
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
        <q-tabs
          v-model="tab"
          dense
          narrow-indicator
          no-caps
          active-color="'blue-grey-6"
          active-bg-color="orange-1"
          indicator-color="transparent"
          active-class="text-blue-grey-6"
          class="custom-tabs"
        >
          <q-tab
            name="recent_search"
            :label="$t('Recent searches')"
            class="radius28 tagam-surface-muted"
          />
          <q-tab
            v-if="is_login"
            name="saved"
            :label="$t('Saved')"
            class="radius28 tagam-surface-muted"
          />
        </q-tabs>

        <q-tab-panels
          v-model="tab"
          animated
          transition-prev="slide-down"
          transition-next="slide-up"
        >
          <q-tab-panel name="recent_search">
            <q-list separator>
              <template
                v-for="items in DataStorePersisted.getRecentLocation"
                :key="items"
              >
                <q-item clickable v-ripple:purple @click="setLocation(items)">
                  <q-item-section avatar>
                    <q-avatar
                      color="grey-1"
                      text-color="blue-grey-6"
                      icon="eva-pin-outline"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle2 text-weight-bold">
                      {{ items.complete_address }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ items?.country_name || "" }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-tab-panel>
          <q-tab-panel name="saved" v-if="is_login">
            <q-list separator>
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
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <div
        class="fixed-bottom q-pa-sm border-grey-top shadow-1 row q-gutter-x-md items-center"
      >
        <q-btn
          :label="$t('Choose Location')"
          no-caps
          color="white"
          text-color="blue-grey-6"
          icon="eva-map-outline"
          unelevated
          :to="{
            path: '/location/add-location',
            query: { redirect: this.redirect },
          }"
          class="fit"
        ></q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useClientStore } from "stores/ClientStore";

export default {
  name: "AddressRecentLocation",
  props: ["is_login", "redirect"],
  data() {
    return {
      modal: false,
      tab: "recent_search",
      loading: false,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const ClientStore = useClientStore();
    return { DataStorePersisted, ClientStore };
  },
  methods: {
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
    setLocation(value) {
      this.DataStorePersisted.location_data = value;
      this.$emit("afterChooselocation", value);
      this.modal = false;
    },
    //
  },
};
</script>

<style scoped>
.custom-tabs .q-tab {
  margin-right: 16px; /* Add spacing between tabs */
}

.custom-tabs .q-tab:last-child {
  margin-right: 0; /* Remove margin for the last tab */
}
.q-tabs__content--align-justify .q-tab {
  flex: initial !important;
}
</style>




