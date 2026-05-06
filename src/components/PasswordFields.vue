<template>
  <q-input
    v-model="password"
    :type="isPwd ? 'password' : 'text'"
    outlined
    borderless
    class="input-borderless"
    :label="$t('Password')"
    lazy-rules
    :rules="[
      (val) => (val && val.length > 0) || this.$t('This field is required'),
    ]"
    @update:model-value="updateValue"
  >
    <template v-slot:append>
      <q-icon
        :name="isPwd ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        @click="isPwd = !isPwd"
      />
    </template>
  </q-input>
</template>

<script>
export default {
  name: "PasswordFields",
  emits: ["update:password"],
  data() {
    return {
      isPwd: true,
    };
  },
  methods: {
    updateValue(value) {
      this.$emit("update:password", value);
    },
  },
};
</script>
