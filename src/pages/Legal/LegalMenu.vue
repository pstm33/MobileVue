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
        <q-toolbar-title class="text-weight-bold">{{
          $t("Legal")
        }}</q-toolbar-title>
      </q-toolbar>
    </div>
  </q-header>
  <q-page class="tagam-page-shell q-px-md q-pb-xl">
    <section class="tagam-section-shell q-mt-lg">
      <div class="tagam-section-heading tagam-section-heading--stacked">
        <div>
          <div class="tagam-section-heading__eyebrow">{{ $t("Legal") }}</div>
          <div class="tagam-section-heading__title">{{ $t("Documents") }}</div>
        </div>
        <div class="tagam-section-heading__meta">
          {{ $t("Privacy, terms and data requests") }}
        </div>
      </div>

      <q-list class="tagam-list-card q-pa-sm">
      <template v-for="item in legalPages" :key="item.to">
        <q-item
          clickable
          :to="item.to"
          class="tagam-account-row"
        >
          <q-item-section>
            <q-item-label>{{ item.label }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="eva-arrow-ios-forward-outline" color="grey-6" />
          </q-item-section>
        </q-item>
      </template>
      </q-list>
    </section>
  </q-page>
</template>

<script>
import { legalPages } from "src/config/legalPages";

export default {
  name: "LegalMenu",
  computed: {
    legalPages() {
      return legalPages;
    },
  },
};
</script>
