<template>
  <q-page>
    <div class="absolute-center full-width q-pa-md text-center">
      <q-responsive style="height: 190px">
        <q-img src="search.svg" fit="scale-down" loading="lazy">
          <template v-slot:loading>
            <div class="text-primary">
              <q-spinner-ios size="sm" />
            </div>
          </template>
        </q-img>
      </q-responsive>

      <div class="text-h5 text-weight-bold q-pb-md">
        {{ $t("Let's find best food for you") }}
      </div>
      <q-form @submit="onSubmit" class="myform q-gutter-y-md">
        <template v-if="getLocationType == 1">
          <LocationSelection
            ref="ref_city"
            v-model:id="city_id"
            method="fetchCity"
            :auto_load="true"
            :label="$t('City')"
            :params="{
              dummy: true,
            }"
          ></LocationSelection>

          <LocationSelection
            ref="ref_area"
            v-model:id="area_id"
            method="fetchArea"
            :auto_load="false"
            :label="$t('Disctrict/Area')"
          ></LocationSelection>
        </template>
        <template v-else-if="getLocationType == 2">
          <LocationSelection
            ref="ref_state"
            v-model:id="state_id"
            method="fetchState"
            :auto_load="true"
            :label="$t('State')"
            :params="{
              country_id: countryID,
            }"
          ></LocationSelection>

          <LocationSelection
            ref="ref_city"
            v-model:id="city_id"
            method="fetchCity"
            :auto_load="true"
            :label="$t('City')"
          ></LocationSelection>
        </template>
        <template v-else-if="getLocationType == 3">
          <LocationSelection
            ref="ref_postal"
            v-model:id="postal_code"
            method="fetchPostal"
            :auto_load="true"
            :label="$t('Postal Code/Zip Code')"
            :params="{
              dummy: true,
            }"
          ></LocationSelection>
        </template>
      </q-form>
    </div>
  </q-page>
  <q-footer class="bg-white text-dark shadow-1 q-pa-md">
    <q-btn
      no-caps
      unelevated
      :color="canSearch ? 'primary' : 'disabled'"
      :text-color="canSearch ? 'white' : 'disabled'"
      size="lg"
      class="fit radius8"
      type="submit"
      rounded
      :loading="loading"
      :disabled="!canSearch"
      @click="onSubmit"
    >
      <div class="text-subtitle2 text-weight-bold">
        {{ $t("Search") }}
      </div>
    </q-btn>
  </q-footer>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStore } from "src/stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";

export default {
  name: "AddLocation",
  components: {
    LocationSelection: defineAsyncComponent(() =>
      import("components/LocationSelection.vue")
    ),
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, DataStorePersisted };
  },
  data() {
    return {
      state_id: null,
      city_id: null,
      area_id: null,
      postal_code: null,
      loading: false,
      redirect: null,
    };
  },
  created() {
    const searchMode = this.DataStore.getSearchMode;
    console.log("searchMode", searchMode);
    if (searchMode == "address") {
      this.$router.replace("/location/map");
      return;
    }
  },
  mounted() {
    this.redirect = this.$route.query.redirect ?? null;
  },
  computed: {
    getLocationType() {
      return parseInt(this.DataStore.attributes_data?.location_searchtype) || 1;
    },
    countryID() {
      return parseInt(this.DataStore.attributes_data?.country_id) || null;
    },
    canSearch() {
      if (this.getLocationType == 1) {
        if (this.city_id && this.area_id) {
          return true;
        }
      } else if (this.getLocationType == 2) {
        if (this.city_id && this.state_id) {
          return true;
        }
      } else if (this.getLocationType == 3) {
        if (this.postal_code) {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    async onSubmit() {
      try {
        this.loading = true;
        const params = {
          state_id: this.state_id,
          city_id: this.city_id,
          area_id: this.area_id,
          postal_code: this.postal_code,
          location_type: this.getLocationType,
        };
        const response = await APIinterface.fetchGet(
          `${config.api_location}/getLocationCurrentAddress`,
          params
        );

        const locationResponse = {
          ...response.details.data,
          ...params,
        };
        const stateID = response.details?.data?.state_id || null;
        if (stateID) {
          locationResponse.state_id = response.details.data.state_id;
        }

        this.DataStorePersisted.location_data = locationResponse;
        this.DataStorePersisted.saveRecentLocation(locationResponse);
        if (this.redirect) {
          this.$router.replace(this.redirect);
        } else {
          this.$router.replace("/home");
        }
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
  },
  watch: {
    state_id(newval, oldval) {
      console.log("state_id", newval);
      if (this.$refs.ref_city) {
        this.city_id = null;
        this.$refs.ref_city.clearSelect();
        this.$refs.ref_city.fetchData({
          state_id: newval ?? "",
        });
      }
    },
    city_id(newval, oldval) {
      console.log("city_id", newval);
      if (this.$refs.ref_area) {
        this.area_id = null;
        this.$refs.ref_area.clearSelect();
        this.$refs.ref_area.fetchData({
          city_id: newval ?? "",
        });
      }
    },
  },
};
</script>
