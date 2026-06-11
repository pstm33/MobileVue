<template>
  <div class="tagam-no-results text-center q-pa-md absolute-center full-width q-pr-xl q-pl-xl">
    <div class="tagam-no-results-icon">
      <q-icon name="eva-search-outline" size="30px" />
    </div>
    <div class="text-h6 line-normal text-weight-bold">
      {{ message }}
    </div>
    <div class="text-caption tagam-text-muted q-mt-xs">
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

<style lang="sass" scoped>
.tagam-no-results
  max-width: 340px
  margin: auto
  border: 1px solid var(--tagam-border)
  border-radius: var(--tagam-radius-card)
  background: var(--tagam-surface)
  box-shadow: var(--tagam-shadow-soft)
  color: var(--tagam-text)

.tagam-no-results-icon
  width: 58px
  height: 58px
  margin: 0 auto 10px
  display: flex
  align-items: center
  justify-content: center
  border-radius: 18px
  background: rgba(255, 107, 53, 0.1)
  color: var(--tagam-primary)
</style>



