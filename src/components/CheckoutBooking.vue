<template>
  <div class="myform q-gutter-y-sm">
    <div class="text-weight-bold text-subtitle2 q-mb-sm">
      {{ $t("Fill table information") }} <span class="text-red">*</span>
    </div>
    <q-input
      v-model="guest_number"
      type="number"
      borderless
      :label="$t('Number of guest')"
    />

    <q-select
      v-model="room_uuid"
      :options="room_list"
      @update:model-value="table_uuid = ''"
      :label="$t('Room name')"
      borderless
      emit-value
      map-options
    />

    <q-select
      v-model="table_uuid"
      :options="this.table_list[room_uuid] ?? []"
      :label="$t('Table name')"
      borderless
      emit-value
      map-options
    />
  </div>
</template>

<script>
export default {
  name: "CheckoutBooking",
  props: ["room_list", "table_list"],
  data() {
    return {
      guest_number: 1,
      room_uuid: "",
      table_uuid: "",
    };
  },
};
</script>
