<template>
  <q-dialog v-model="modal" position="bottom" :seamless="true">
    <q-card>
      <q-toolbar class="text-dark" style="min-height: auto">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ data?.merchant?.restaurant_name || "" }}
          </div>
        </q-toolbar-title>
        <q-btn
          flat
          dense
          icon="close"
          v-close-popup
          :color="$q.dark.mode ? 'primary' : 'grey'"
        />
      </q-toolbar>
      <q-card-section class="scroll relative-position">
        <div class="row items-center q-mt-sm">
          <div class="col">
            <q-linear-progress
              indeterminate
              v-if="order_progress < 4"
              color="primary"
              class="q-mb-sm"
            />
            <div class="text-weight-bold text-subtitle2">
              {{ data?.estimated_time || "" }}
            </div>
            <div class="text-caption line-normal">
              {{ data?.order_status || "" }}
            </div>
            <div class="text-caption line-normal text-weight-light">
              {{ data?.order_status_details || "" }}
            </div>
          </div>
          <div class="col-4 text-right" v-if="order_progress < 4">
            <q-btn
              no-caps
              unelevated
              color="primary"
              text-color="white"
              size="md"
              class="radius8"
              type="submit"
              rounded
              @click="TrackOrder"
            >
              <div class="text-subtitle2 text-weight-bold">
                {{ $t("Track") }}
              </div>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: "QuickTrack",
  data() {
    return {
      modal: false,
      order_progress: 0,
      data: null,
      order_uuid: null,
    };
  },
  methods: {
    setTracking(data) {
      this.modal = true;
      this.data = data;
      this.order_progress = data?.order_progress || 0;
      this.order_uuid = data?.order_uuid || null;
    },
    TrackOrder() {
      this.modal = false;
      this.$router.push({
        path: "/account/trackorder",
        query: { order_uuid: this.order_uuid },
      });
    },
  },
};
</script>
