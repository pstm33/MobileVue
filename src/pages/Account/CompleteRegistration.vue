<template>
  <q-header
    reveal-offset="1"
    reveal
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-black': !$q.dark.mode,
    }"
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="eva-arrow-back-outline"
        class="q-mr-sm"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
    </q-toolbar>
  </q-header>
  <q-page>
    <div class="full-width q-pa-md">
      <div class="text-center">
        <div class="text-h6 text-weight-bold">
          {{ $t("Fill your information") }}
        </div>
        <div class="text-caption line-normal">
          {{ $t("Complete your registration") }}.
        </div>
      </div>

      <q-space class="q-pa-sm"></q-space>
      <q-form @submit="onSubmit" class="myform">
        <q-input
          v-model="first_name"
          :label="$t('First name')"
          outlined
          lazy-rules
          borderless
          class="input-borderless"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          v-model="last_name"
          :label="$t('Last name')"
          outlined
          lazy-rules
          borderless
          class="input-borderless"
          :rules="[
            (val) => (val && val.length > 0) || 'This field is required',
          ]"
        />

        <q-input
          v-model="email_address"
          label="Email address"
          disable
          outlined
          lazy-rules
          borderless
          class="input-borderless"
          :rules="[
            (val) => (val && val.length > 0) || 'This field is required',
          ]"
        />

        <q-input
          v-model="mobile_number"
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
              @filter="filterFn"
              behavior="dialog"
              input-debounce="700"
              style="border: none"
              emit-value
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

        <q-input
          v-model="password"
          :type="field_type"
          :label="$t('Password')"
          outlined
          lazy-rules
          borderless
          class="input-borderless"
          :rules="[
            (val) => (val && val.length > 0) || 'This field is required',
          ]"
        >
          <template v-slot:append>
            <q-icon
              @click="
                field_type = field_type == 'password' ? 'text' : 'password'
              "
              :name="FieldIcon"
              color="grey"
              class="cursor-pointer"
            />
          </template>
        </q-input>

        <q-input
          :type="field_type1"
          v-model="cpassword"
          :label="$t('Confirm Password')"
          outlined
          lazy-rules
          borderless
          class="input-borderless"
          :rules="[
            (val) => (val && val.length > 0) || 'This field is required',
          ]"
        >
          <template v-slot:append>
            <q-icon
              @click="
                field_type1 = field_type1 == 'password' ? 'text' : 'password'
              "
              :name="FieldIcon1"
              color="grey"
              class="cursor-pointer"
            />
          </template>
        </q-input>

        <CustomFields ref="ref_customfields"></CustomFields>

        <template v-if="DataStore.attributes_data?.signup_terms">
          <div
            class="text-caption q-mb-md"
            v-html="DataStore.attributes_data?.signup_terms"
          ></div>
        </template>

        <q-btn
          no-caps
          unelevated
          color="primary"
          text-color="white"
          size="lg"
          class="fit radius8"
          type="submit"
          rounded
          :loading="loading"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Sign Up") }}
          </div>
        </q-btn>
      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useClientStore } from "stores/ClientStore";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "CompleteRegistration",
  components: {
    CustomFields: defineAsyncComponent(() =>
      import("components/CustomFields.vue")
    ),
  },
  data() {
    return {
      loading: false,
      field_type: "password",
      field_type1: "password",
      first_name: "",
      last_name: "",
      email_address: "",
      password: "",
      cpassword: "",
      mobile_number: "",
      mobile_prefix: "",
      options: [],
      inner_loading: false,
      client_uuid: "",
    };
  },
  setup() {
    const ClientStore = useClientStore();
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { ClientStore, DataStore, DataStorePersisted };
  },
  computed: {
    FieldIcon() {
      return this.field_type === "password"
        ? "eva-eye-outline"
        : "eva-eye-off-outline";
    },
    FieldIcon1() {
      return this.field_type1 === "password"
        ? "eva-eye-outline"
        : "eva-eye-off-outline";
    },
  },
  mounted() {
    this.client_uuid = this.$route.query.uuid;
    this.getCustomerInfo();
  },
  methods: {
    getCustomerInfo() {
      APIinterface.showLoadingBox("", this.$q);
      APIinterface.getCustomerInfo(this.client_uuid)
        .then((data) => {
          this.first_name = data.details.first_name;
          this.last_name = data.details.last_name;
          this.email_address = data.details.email_address;

          this.mobile_prefix = "+" + data.details.default_data.phonecode;
        })
        .catch((error) => {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          APIinterface.hideLoadingBox(this.$q);
        });
    },
    onSubmit() {
      const $data = {
        client_uuid: this.client_uuid,
        first_name: this.first_name,
        last_name: this.last_name,
        password: this.password,
        cpassword: this.cpassword,
        mobile_prefix: this.mobile_prefix,
        mobile_number: this.mobile_number,
        custom_fields: this.$refs.ref_customfields.custom_fields,
      };
      this.loading = true;
      APIinterface.completeSocialSignup($data)
        .then((resp) => {
          console.log("data", resp);

          auth.setUser(resp.details.user_data);
          auth.setToken(resp.details.user_token);
          this.ClientStore.user_settings = resp.details.user_settings;

          const coordinates = this.DataStorePersisted.coordinates;
          const searchMode = this.DataStore.getSearchMode;
          const locationData = this.DataStorePersisted.getLocation;

          if (searchMode == "location") {
            if (!locationData) {
              this.$router.push("/location/add-location");
              return;
            }
          } else {
            if (!coordinates) {
              this.$router.push("/location/map");
              return;
            }
          }

          if (this.redirect) {
            this.$router.push(this.redirect);
          } else {
            this.$router.push("/home");
          }
        })
        .catch((error) => {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
