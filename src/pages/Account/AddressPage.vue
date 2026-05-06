<template>
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
        <q-toolbar-title class="text-weight-bold">
          {{ $t("Address") }}
        </q-toolbar-title>
        <q-btn
          to="/cart"
          flat
          round
          dense
          icon="eva-shopping-bag-outline"
          :color="$q.dark.mode ? 'white' : 'dark'"
        >
          <q-badge floating color="primary" rounded />
        </q-btn>
      </q-toolbar>
    </div>
  </q-header>

  <q-page class="tagam-page-shell q-px-md q-pb-xl">
    <section class="tagam-section-shell q-mt-lg">
      <div class="tagam-section-heading tagam-section-heading--stacked">
        <div>
          <div class="tagam-section-heading__eyebrow">{{ $t("Address") }}</div>
          <div class="tagam-section-heading__title">{{ $t("Delivery details") }}</div>
        </div>
        <div class="tagam-section-heading__meta">
          {{ $t("Review and refine your pinned address") }}
        </div>
      </div>

      <div class="tagam-list-card q-pa-md">
        <div class="map bg-grey-2 rounded-borders q-mb-md" style="height: 180px" />
        <q-list class="q-mb-md">
          <q-item class="tagam-account-row">
            <q-item-section>
              <q-item-label lines="2" class="text-subtitle2 text-weight-bold">
                Quezon City
              </q-item-label>
              <q-item-label caption class="tagam-page-copy">
                <div class="cursor-pointer">
                  {{ edit_address }} <q-icon name="eva-edit-outline" />
                  <q-popup-edit v-model="edit_address" auto-save v-slot="scope">
                    <q-input
                      v-model="scope.value"
                      dense
                      autofocus
                      counter
                      @keyup.enter="scope.set"
                    />
                  </q-popup-edit>
                </div>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                unelevated
                color="primary"
                text-color="white"
                dense
                :label="$t('Adjust Pin')"
                no-caps
                rounded
              />
            </q-item-section>
          </q-item>
        </q-list>

        <div class="q-gutter-y-md">
          <q-input
            v-model="location_name"
            autogrow
            dense
            outlined
            bg-color="white"
            :label="$t('Apartment, suite or floor')"
          />
          <q-select
            outlined
            v-model="delivery_options"
            :options="options"
            :label="$t('Delivery Options')"
            dense
            bg-color="white"
          />
          <q-input
            v-model="delivery_instructions"
            autogrow
            dense
            outlined
            bg-color="white"
            :label="$t('Add delivery instructions')"
          />
        </div>

        <div class="text-h6 q-mt-lg q-mb-sm">{{ $t("Address label") }}</div>

        <q-btn-toggle
          v-model="address_label"
          no-caps
          rounded
          unelevated
          toggle-color="primary"
          toggle-text-color="white"
          color="grey-2"
          text-color="dark"
          size="12px"
          class="q-mb-md text-weight-600"
          spread
          :options="[
            { label: 'Home', value: 1 },
            { label: 'Work', value: 2 },
            { label: 'School', value: 3 },
            { label: 'Other', value: 'other' },
          ]"
        />
      </div>
    </section>

    <q-footer reveal class="bg-transparent q-px-md q-pb-sm q-pt-sm text-dark">
      <div class="tagam-footer-shell q-gutter-y-sm">
        <q-btn
          :label="$t('Save Address')"
          unelevated
          color="primary"
          text-color="white"
          no-caps
          class="full-width text-weight-bold"
          rounded
          size="lg"
        />
        <q-btn
          :label="$t('Cancel')"
          flat
          text-color="primary"
          no-caps
          class="full-width"
        />
      </div>
    </q-footer>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "PageName",
  data() {
    return {
      back_url: "",
      address_uuid: "",
      location_name: "",
      delivery_options: "",
      delivery_instructions: "",
      address_label: 1,
      edit_address: "Guadalupe nuevo makati city",
      options: ["leave at my door", "hand it to me", "meet outside"],
    };
  },
  mounted() {
    this.back_url = this.$route.query.url;
    this.address_uuid = this.$route.query.uuid;
  },
};
</script>
