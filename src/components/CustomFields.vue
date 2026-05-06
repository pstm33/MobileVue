<template>
  <div class="q-mb-xs">
    <template v-for="items in DataStore.custom_fields" :key="items.field_id">
      <template v-if="items.field_type == 'text'">
        <q-input
          type="text"
          v-model="custom_fields[items.field_id]"
          :label="items.field_label"
          outlined
          lazy-rules
          borderless
          class="input-borderless"
          :class="{ 'q-mb-md': !items.is_required }"
          :rules="
            items.is_required
              ? [
                  (val) =>
                    (val && val.length > 0) || $t('This field is required'),
                ]
              : []
          "
        >
        </q-input>
      </template>
      <template v-else-if="items.field_type == 'date'">
        <q-input
          v-model="custom_fields[items.field_id]"
          outlined
          lazy-rules
          borderless
          class="input-borderless q-mb-md"
          :label="items.field_label"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="custom_fields[items.field_id]"
                  mask="YYYY-MM-DD"
                  :locale="customLocale"
                >
                  <div class="row items-center justify-end">
                    <q-btn
                      v-close-popup
                      :label="$t('Close')"
                      color="primary"
                      flat
                    />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </template>
      <template v-else-if="items.field_type == 'select'">
        <q-select
          v-model="custom_fields[items.field_id]"
          :label="items.field_label"
          outlined
          lazy-rules
          borderless
          class="input-borderless"
          :options="getOptions(items.options)"
          emit-value
          map-options
        />
      </template>
      <template v-else-if="items.field_type == 'textarea'">
        <div class="text-subtitle1 q-mt-sm q-mb-sm">
          {{ items.field_label }}
        </div>
        <q-input
          v-model="custom_fields[items.field_id]"
          type="textarea"
          outlined
          borderless
          class="input-borderless"
          :rows="3"
        />
      </template>
      <template v-else-if="items.field_type == 'checkbox'">
        <div class="text-subtitle1 q-mt-sm q-mb-sm">
          {{ items.field_label }}
        </div>
        <q-option-group
          v-model="custom_fields[items.field_id]"
          :label="items.field_label"
          type="checkbox"
          :options="getOptions(items.options)"
        />
      </template>
    </template>
  </div>
</template>

<script>
//custom_fields
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";

export default {
  name: "CustomFields",
  props: ["data_fields"],
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  data() {
    return {
      custom_fields: {},
      date: null,
      customLocale: {
        days: [
          this.$t("Su"),
          this.$t("Mo"),
          this.$t("Tu"),
          this.$t("We"),
          this.$t("Th"),
          this.$t("Fr"),
          this.$t("Sa"),
        ],
        daysShort: [
          this.$t("Sun"),
          this.$t("Mon"),
          this.$t("Tue"),
          this.$t("Wed"),
          this.$t("Thu"),
          this.$t("Fri"),
          this.$t("Sat"),
        ],
        months: [
          this.$t("January"),
          this.$t("February"),
          this.$t("March"),
          this.$t("April"),
          this.$t("May"),
          this.$t("June"),
          this.$t("July"),
          this.$t("August"),
          this.$t("September"),
          this.$t("October"),
          this.$t("November"),
          this.$t("December"),
        ],
        monthsShort: [
          this.$t("Jan"),
          this.$t("Feb"),
          this.$t("Mar"),
          this.$t("Apr"),
          this.$t("May"),
          this.$t("Jun"),
          this.$t("Jul"),
          this.$t("Aug"),
          this.$t("Sep"),
          this.$t("Oct"),
          this.$t("Nov"),
          this.$t("Dec"),
        ],
      },
    };
  },
  watch: {
    data_fields(newval, oldval) {
      this.custom_fields = newval;
    },
  },
  mounted() {
    if (!this.DataStore.custom_fields) {
      this.getCustomFields();
    } else {
      this.setArrayvalue();
    }
  },
  methods: {
    getOptions(data) {
      let result = [];
      Object.entries(data).forEach(([key, items]) => {
        result.push({
          label: items,
          value: items,
        });
      });
      return result;
    },
    setValue(value, id) {
      this.custom_fields[id] = value;
    },
    getCustomFields() {
      APIinterface.fetchDataByTokenGet("getCustomFields")
        .then((data) => {
          this.DataStore.custom_fields = data.details.fields;
          this.setArrayvalue();
        })
        .catch((error) => {})
        .then((data) => {});
    },
    setArrayvalue() {
      this.DataStore.custom_fields.forEach((field) => {
        if (field.field_type == "checkbox") {
          this.custom_fields[field.field_id] = [];
        }
      });
    },
  },
};
</script>
