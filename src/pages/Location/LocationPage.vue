<template>
  <q-page class="tagam-page-shell q-px-md q-pb-xl flex flex-center">
    <div class="tagam-auth-shell full-width">
      <section class="tagam-section-shell text-center">
        <q-img
          src="cuttery.png"
          fit="fill"
          spinner-color="primary"
          style="height: 130px; max-width: 120px; margin: 0 auto"
        />

        <div class="tagam-section-heading tagam-section-heading--stacked q-mt-md">
          <div>
            <div class="tagam-section-heading__title">
              {{ $t("Let's find best restaurant") }}
            </div>
          </div>
          <div class="tagam-section-heading__meta">
            {{
              $t(
                "Set your location to started searching for restaurant in your area"
              )
            }}
          </div>
        </div>

        <div class="q-gutter-y-md q-mt-lg">
          <q-btn
            unelevated
            no-caps
            color="primary"
            text-color="white"
            class="full-width text-weight-bold"
            rounded
            size="lg"
            @click="locationPermission"
          >
            <div class="row items-center justify-start fit q-pl-md">
              <div class="q-mr-md">
                <q-icon name="las la-search-location" />
              </div>
              <div>{{ $t("Share location") }}</div>
            </div>
          </q-btn>
          <q-btn
            unelevated
            no-caps
            color="primary"
            text-color="white"
            class="full-width text-weight-bold"
            rounded
            size="lg"
            to="/location/map"
          >
            <div class="row items-center justify-start fit q-pl-md">
              <div class="q-mr-md">
                <q-icon name="las la-map-marker" />
              </div>
              <div>{{ $t("Choose from Map") }}</div>
            </div>
          </q-btn>
        </div>
      </section>
    </div>

    <q-inner-loading
      :showing="loading"
      color="primary"
      size="md"
      :label="loading_label"
    />
  </q-page>
  <DeliverySched ref="delivery_sched" @after-savetrans="afterSavetrans" />

  <AddressInformation
    ref="address_information"
    :back_url="back_url"
    @after-saveaddress="afterSaveaddress"
  ></AddressInformation>
</template>

<script>
import { defineAsyncComponent } from "vue";
import AppLocation from "src/api/AppLocation";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import auth from "src/api/auth";

export default {
  name: "LocationPage",
  data() {
    return {
      position: [],
      loading: false,
      loading_label: "",
      data: [],
      address: "",
      back_url: "",
    };
  },
  components: {
    DeliverySched: defineAsyncComponent(() =>
      import("components/DeliverySched.vue")
    ),
    AddressInformation: defineAsyncComponent(() =>
      import("components/AddressInformation.vue")
    ),
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  methods: {
    locationPermission() {
      if (this.$q.capacitor) {
        //android
        APIinterface.showLoadingBox("", this.$q);
        AppLocation.checkAccuracy()
          .then((data) => {
            this.locateLocation();
          })
          .catch((error) => {
            if (error.code === 4) {
              this.reverseGeocoding(
                this.DataStore.maps_config.default_lat,
                this.DataStore.maps_config.default_lng
              );
            } else {
              APIinterface.hideLoadingBox(this.$q);
              APIinterface.notify("dark", error.message, "error", this.$q);
            }
          })
          .then((data) => {
            //
          });
      } else {
        //web
        if (navigator.geolocation) {
          APIinterface.showLoadingBox("", this.$q);
          navigator.geolocation.getCurrentPosition(
            (data) => {
              this.reverseGeocoding(
                data.coords.latitude,
                data.coords.longitude
              );
            },
            (error) => {
              this.reverseGeocoding(
                this.DataStore.maps_config.default_lat,
                this.DataStore.maps_config.default_lng
              );
            }
          );
        }
      }
    },
    locateLocation() {
      AppLocation.getPosition()
        .then((data) => {
          this.reverseGeocoding(data.lat, data.lng);
        })
        .catch((error) => {
          this.reverseGeocoding(
            this.DataStore.maps_config.default_lat,
            this.DataStore.maps_config.default_lng
          );
        })
        .then((data) => {});
    },
    reverseGeocoding(lat, lng) {
      this.geocoder_loading = true;
      APIinterface.reverseGeocoding(lat, lng)
        .then((data) => {
          this.data = data.details.data;
          if (
            typeof data.details.data.address !== "undefined" &&
            data.details.data.address !== null
          ) {
            this.address = data.details.data.address.formatted_address;
            this.setLocation();
          } else {
            APIinterface.notify(
              "dark",
              "This location is not available",
              "error",
              this.$q
            );
            this.address = "";
            this.data = [];
          }
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    setLocation() {
      if (APIinterface.empty(this.data.place_id)) {
        APIinterface.notify(
          "dark",
          "Enter your location or select on the map",
          "error",
          this.$q
        );
      }

      console.log("setLocation", this.data);

      APIinterface.setStorage("place_data", this.data);
      APIinterface.setStorage("place_id", this.data.place_id);
      const deliverySched = APIinterface.getStorage("delivery_sched");
      console.debug("deliverySched=>" + deliverySched);

      if (auth.authenticated()) {
        this.loading = true;
        this.$refs.address_information.show(this.data);
      } else {
        if (APIinterface.empty(deliverySched)) {
          this.$refs.delivery_sched.showSched(true);
        } else {
          this.backPage();
        }
      }
    },
    afterSaveaddress(data) {
      this.data.parsed_address.street_number = data.street_number;
      this.data.parsed_address.street_name = data.street_name;

      APIinterface.setStorage("place_data", this.data);
      this.$refs.delivery_sched.showSched(true);
    },
    afterSavetrans(data) {
      this.backPage();
    },
    backPage() {
      if (!APIinterface.empty(this.back_url)) {
        this.$router.push(this.back_url);
      } else {
        this.$router.replace("/home");
      }
    },
  },
};
</script>
