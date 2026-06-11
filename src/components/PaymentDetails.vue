<template>
  <q-dialog
    v-model="modal"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="onBeforeShow"
    position="bottom"
    persistent
    full-width
  >
    <q-card class="tagam-payment-details-sheet">
      <q-toolbar class="tagam-text-main tagam-payment-details-toolbar">
        <q-btn
          flat
          dense
          icon="close"
          v-close-popup
          :color="$q.dark.mode ? 'primary' : 'grey'"
        />
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Details") }}
          </div>
        </q-toolbar-title>
      </q-toolbar>
      <q-card-section class="q-pa-md">
        <div class="flex flex-center text-center q-mb-md">
          <div>
            <q-avatar size="82px" class="tagam-payment-details-avatar">
              <template v-if="data.logo_url">
                <q-img :src="data.logo_url" lazy fit="scale-down">
                  <template v-slot:loading>
                    <div class="text-primary">
                      <q-spinner-ios size="sm" />
                    </div>
                  </template>
                </q-img>
              </template>
              <template v-else>
                <q-icon name="eva-credit-card-outline"></q-icon>
              </template>
            </q-avatar>
            <q-space class="q-pa-xs"></q-space>
            <div class="tagam-title-md">{{ data.attr1 }}</div>
            <div class="tagam-body-muted">{{ data.attr2 }}</div>
          </div>
        </div>

        <q-list class="tagam-account-card-list">
          <q-item class="tagam-account-list-card" clickable>
            <q-item-section avatar>
              <q-avatar class="tagam-account-list-icon" icon="eva-checkmark-circle-2-outline" />
            </q-item-section>
            <q-item-section> {{ $t("Set as default") }} </q-item-section>
            <q-item-section avatar>
              <q-toggle
                color="secondary"
                v-model="as_default"
                val="friend"
                @update:model-value="setDefault"
              />
            </q-item-section>
          </q-item>
          <q-item class="tagam-account-list-card">
            <q-item-section avatar>
              <q-avatar class="tagam-account-list-icon" icon="eva-trash-2-outline" />
            </q-item-section>
            <q-item-section class="tagam-account-list-title">
              {{ $t("Delete") }}
            </q-item-section>
            <q-item-section side>
              <q-btn
                no-caps
                unelevated
                round
                color="primary"
                icon="eva-trash-2-outline"
                @click="ConfirmDelete(data)"
                :loading="loading"
              ></q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <ConfirmDelete
    ref="ref_confirm"
    @after-confirm="afterConfirm"
  ></ConfirmDelete>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "PaymentDetails",
  components: {
    ConfirmDelete: defineAsyncComponent(() =>
      import("components/ConfirmDelete.vue")
    ),
  },
  data() {
    return {
      modal: false,
      data: null,
      as_default: false,
      loading: false,
    };
  },
  setup() {
    return {};
  },
  methods: {
    async setDefault(value) {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const params = new URLSearchParams({
          payment_uuid: this.data.payment_uuid,
          as_default: value ? 1 : 0,
        }).toString();
        await APIinterface.fetchDataByTokenPost("setPrimaryPayment", params);
        this.$emit("afterUpdatepayment");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    show(value) {
      this.data = value;
      this.modal = true;
      this.as_default = value.as_default == 1 ? true : false;
    },
    ConfirmDelete(value) {
      this.$refs.ref_confirm.ConfirmDelete({
        id: value.payment_uuid,
        title: value.attr1,
        subtitle: value?.attr2,
        confirm: this.$t("Do you want to delete this payment?"),
        icon: "eva-alert-triangle-outline",
      });
    },
    async afterConfirm(value) {
      try {
        APIinterface.showLoadingBox("", this.$q);
        this.$refs.ref_confirm.modal = false;
        const results = await APIinterface.deletePayment(value.id);
        console.log("results", results);
        this.modal = false;
        this.$emit("afterDelete", value.id);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
  },
};
</script>

<style lang="scss">
.tagam-payment-details-sheet {
  max-height: 76vh;
  border-radius: 28px 28px 0 0;
  background:
    radial-gradient(circle at 18% 0, rgba(255, 90, 47, 0.08), transparent 220px),
    var(--tagam-surface);
  color: var(--tagam-text);
}

.tagam-payment-details-toolbar {
  min-height: 68px;
  border-bottom: 1px solid var(--tagam-border);
}

.tagam-payment-details-avatar {
  border: 1px solid var(--tagam-border);
  background: var(--tagam-surface-muted);
  box-shadow: var(--tagam-shadow-soft);
}
</style>





