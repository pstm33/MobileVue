<template>
  <div class="text-center q-pa-md absolute-center full-width q-pr-xl q-pl-xl">
    <div class="text-h6 line-normal text-weight-medium text-dark">
      {{ message }}
    </div>
    <div class="text-caption text-grey">
      {{ description }}
    </div>
  </div>
</template>

<script>
export default {
  name: "NoResults",
  props: ["message", "description"],
  setup() {
    return {};
  },
};
</script>
