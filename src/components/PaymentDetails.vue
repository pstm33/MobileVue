<template>
  <q-dialog
    v-model="modal"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="onBeforeShow"
    maximized
    persistent
  >
    <q-card>
      <q-toolbar class="text-dark">
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
      <q-card-section>
        <div class="flex flex-center text-center q-mb-md">
          <div>
            <q-avatar size="80px" class="myshadow-1">
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
            <div class="text-weight-bold text-subtitle2">{{ data.attr1 }}</div>
            <div class="text-caption text-grey">{{ data.attr2 }}</div>
          </div>
        </div>

        <q-list separator>
          <q-item class="q-pl-none q-pr-none" clickable>
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
          <q-item class="q-pl-none q-pr-none">
            <q-item-section side>
              <q-btn
                no-caps
                :label="$t('Delete')"
                unelevated
                flat
                color="red"
                padding="10px 0px"
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
