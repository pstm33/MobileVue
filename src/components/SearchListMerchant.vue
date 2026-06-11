<template>
  <q-item-section avatar>
    <q-img
      :src="items.url_logo"
      lazy
      fit="cover"
      style="height: 80px; width: 80px"
      class="radius8 tagam-restaurant-logo-stretch"
      spinner-color="amber"
      spinner-size="sm"
    />
  </q-item-section>
  <q-item-section>
    <q-item-label>
      <div class="font13 text-weight-bold no-margin line-normal">
        {{ items.restaurant_name }}
      </div>
      <div class="tagam-text-muted ellipsis-2-lines font12 line-normal">
        <template
          v-for="cuisine_index in items.cuisine_group"
          :key="cuisine_index"
        >
          <template v-if="cuisine[cuisine_index]"
            >{{ cuisine[cuisine_index].name }},
          </template>
        </template>
      </div>
      <div class="row items-center justify-between">
        <q-chip size="sm" color="mygrey">
          <span class="tagam-text-main">{{ $t("Restaurant") }}</span>
        </q-chip>
        <div class="font11 tagam-text-muted">
          <span
            :class="{
              'text-white': $q.dark.mode,
              'tagam-text-main': !$q.dark.mode,
            }"
          >
            {{ items.distance_pretty }}
          </span>
        </div>
      </div>
    </q-item-label>
  </q-item-section>
</template>

<script>
export default {
  name: "SearchListMerchant",
  props: ["items", "cuisine"],
  setup() {
    return {};
  },
};
</script>




