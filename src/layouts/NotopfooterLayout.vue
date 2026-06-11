<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="tagam-page-shell">
      <transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        appear
      >
        <router-view :key="$route.fullPath" />
      </transition>
    </q-page-container>

    <PushDialog ref="push_dialog" />
  </q-layout>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useDeliveryschedStore } from "stores/DeliverySched";

export default defineComponent({
  name: "NotopfooterLayout",
  components: {
    PushDialog: defineAsyncComponent(() => import("components/PushDialog.vue")),
  },
  setup() {
    const deliveryschedStore = useDeliveryschedStore();
    return { deliveryschedStore };
  },
  created() {

    let $continue = true;
    if (
      this.$route.fullPath == "/cart" ||
      this.$route.fullPath == "/checkout"
    ) {
      $continue = false;
    }


  },
});
</script>



