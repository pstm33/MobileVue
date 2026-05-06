<template>
  <p :class="class_name">
    <span v-html="isExpanded ? description : truncatedDescription"></span>
    <span
      v-if="showReadMore"
      @click="toggleReadMore"
      class="read-more text-blue cursor-pointer"
    >
      {{ isExpanded ? label.read_less : label.read_more }}
    </span>
  </p>
</template>

<script>
export default {
  name: "TextComponents",
  props: ["description", "max_lenght", "label", "class_name"],
  data() {
    return {
      isExpanded: false,
    };
  },
  computed: {
    truncatedDescription() {
      if (!this.description) {
        return;
      }
      return this.description.length > this.max_lenght
        ? this.description.slice(0, this.max_lenght) + "..."
        : this.description;
    },
    showReadMore() {
      if (!this.description) {
        return;
      }
      return this.description.length > this.max_lenght;
    },
  },
  methods: {
    toggleReadMore() {
      this.isExpanded = !this.isExpanded;
    },
  },
};
</script>
