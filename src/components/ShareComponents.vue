<template>
  <template v-if="layout == 2">
    <q-btn
      @click="this.$q.capacitor ? share() : webShare()"
      round
      color="transparent"
      text-color="primary"
      size="md"
      icon="eva-share-outline"
      unelevated
      class="tagam-icon-btn"
    />
  </template>
  <template v-else>
    <q-btn
      round
      @click="this.$q.capacitor ? share() : webShare()"
      unelevated
      color="transparent"
      text-color="primary"
      icon="eva-share-outline"
      dense
      size="md"
      class="tagam-icon-btn q-ml-sm"
    />
  </template>
</template>

<script>
import { Share } from "@capacitor/share";

export default {
  name: "ShareComponents",
  props: ["title", "text", "url", "dialogTitle", "layout"],
  methods: {
    share() {
      console.log("Share");
      Share.share({
        title: this.title,
        text: this.text,
        url: this.url,
        dialogTitle: this.dialogTitle,
      })
        .then((data) => {
          //
        })
        .catch((error) => {
          //APIinterface.notify("dark", error, "error", this.$q);
        });
    },
    webShare() {
      console.log("webShare");
      if (navigator.share) {
        navigator
          .share({
            title: this.title,
            text: this.text,
            url: this.url,
          })
          .then(() => console.log("Successful share"))
          .catch((error) => console.log("Error sharing", error));
      } else {
        console.log("web share not available");
      }
    },
  },
};
</script>



