<template>
  <q-dialog v-model="modal" backdrop-filter="blur(4px)" persistent>
    <q-card style="width: 25em" class="q-pb-md">
      <q-card-section class="text-center">
        <div class="text-weight-medium text-subtitle1">
          {{
            $t(
              "You must be at least 18 years old to enter this section. Please confirm your age."
            )
          }}
        </div>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn
          no-caps
          unelevated
          color="primary"
          text-color="white"
          size="lg"
          class="radius8"
          style="width: 100px"
          @click="confirmAge"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Over 18") }}
          </div>
        </q-btn>
        <q-btn
          no-caps
          unelevated
          color="grey-5"
          text-color="white"
          size="lg"
          class="radius8"
          style="width: 100px"
          to="/home"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Under 18") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "AgeVerification",
  data() {
    return {
      modal: false,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
  },
  methods: {
    confirmAge() {
      this.DataStorePersisted.ageVerified = true;
      this.modal = false;
    },
  },
};
</script>
