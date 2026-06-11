<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="onBeforeShow"
    full-width
    persistent
  >
    <q-card class="tagam-confirm-sheet">
      <q-card-section class="q-pa-md">
        <div class="tagam-title-md q-pb-md">
          <!-- {{ $t("Do you want to delete the address?") }} -->
          {{ data?.confirm || $t("Do you want to delete the address?") }}
        </div>

        <q-list class="tagam-account-card-list">
          <q-item class="tagam-account-list-card">
            <q-item-section avatar>
              <q-avatar
                :icon="data?.icon || 'eva-pin-outline'"
                class="tagam-account-list-icon"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="tagam-account-list-title">
                {{ data?.title || "" }}
              </q-item-label>
              <q-item-label class="tagam-account-list-caption">
                {{ data?.subtitle || "" }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions class="row q-gutter-x-md q-pa-md q-pt-none">
        <q-btn
          no-caps
          unelevated
          color="primary"
          text-color="white"
          size="lg"
          rounded
          class="col"
          @click="this.$emit('afterConfirm', this.data)"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ translateOrFallback("Remove", "Удалить") }}
          </div>
        </q-btn>

        <q-btn
          no-caps
          unelevated
          color="transparent"
          text-color="primary"
          size="lg"
          rounded
          class="col"
          @click="modal = false"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ translateOrFallback("Keep", "Оставить") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: "ConfirmDelete",
  data() {
    return {
      modal: false,
      data: null,
    };
  },
  setup() {
    return {};
  },
  methods: {
    translateOrFallback(key, fallback) {
      const translated = this.$t(key);
      return translated === key ? fallback : translated;
    },
    ConfirmDelete(value) {
      this.data = value;
      this.modal = true;
    },
  },
};
</script>

<style lang="scss">
.tagam-confirm-sheet {
  border-radius: 28px 28px 0 0;
  background: var(--tagam-surface);
  color: var(--tagam-text);
  box-shadow: var(--tagam-shadow);
}
</style>



