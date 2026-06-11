<template>
  <q-header reveal reveal-offset="50" class="tagam-account-header tagam-surface tagam-text-main">
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="arrow_back"
        class="tagam-icon-btn"
      />
      <q-toolbar-title class="tagam-text-main text-center text-weight-bold">
        {{ $t("Address") }}
      </q-toolbar-title>
      <q-btn
        to="/cart"
        color="white"
        rounded
        unelevated
        text-color="dark"
        icon="eva-shopping-bag-outline"
        dense
        no-caps
      >
        <q-badge floating color="primary2" rounded />
      </q-btn>
    </q-toolbar>
  </q-header>
  <!-- banner -->

  <q-page padding class="tagam-surface-muted tagam-account-address-page">
    <q-space class="q-pa-xs"></q-space>
    <q-card flat class="tagam-surface tagam-account-card">
      <q-card-section>
        <div class="map tagam-surface-muted rounded-10 q-mb-md" />
        <q-list class="qlist-no-padding q-mb-md">
          <q-item>
            <q-item-section>
              <q-item-label lines="2" class="font12 text-weight-bold">
                {{ edit_address || $t("Address not available") }}
              </q-item-label>
              <q-item-label caption class="font12 text-weight-medium">
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
                text-color="dark"
                dense
                :label="$t('Adjust Pin')"
                no-caps
                class="q-pl-sm q-pr-sm"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <q-input
          v-model="location_name"
          autogrow
          dense
          outlined
          color="dark"
          bg-color="white"
          borderless
          :label="$t('Aparment, suite or floor')"
        />
        <q-space class="q-pa-sm" />
        <q-select
          outlined
          v-model="delivery_options"
          :options="options"
          :label="$t('Delivery Options')"
          dense
        />
        <q-space class="q-pa-sm" />
        <q-input
          v-model="delivery_instructions"
          autogrow
          dense
          outlined
          color="dark"
          bg-color="white"
          borderless
          :label="$t('Add delivery instructions')"
        />

        <div class="text-h6">{{ $t("Address label") }}</div>

        <q-btn-toggle
          v-model="address_label"
          no-caps
          rounded
          unelevated
          toggle-color="dark"
          toggle-text-color="white"
          color="grey-2"
          text-color="dark"
          size="12px"
          class="font11 tagam-surface-muted q-mb-md text-weight-600"
          spread
          :options="[
            { label: $t('Home'), value: 1 },
            { label: $t('Work'), value: 2 },
            { label: $t('School'), value: 3 },
            { label: $t('Other'), value: 'other' },
          ]"
        />
      </q-card-section>

      <q-card-actions vertical align="center">
        <q-btn
          :label="$t('Save Address')"
          unelevated
          color="primary"
          text-color="dark"
          no-caps
          class="full-width"
        />
        <q-btn
          :label="$t('Cancel')"
          flat
          text-color="amber-14"
          no-caps
          class="full-width"
        />
      </q-card-actions>
    </q-card>
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
      edit_address: "",
      options: [
        this.$t("Leave at my door"),
        this.$t("Hand it to me"),
        this.$t("Meet outside"),
      ],
    };
  },
  mounted() {
    this.back_url = this.$route.query.url;
    this.address_uuid = this.$route.query.uuid;
  },
};
</script>





