<template>
  <q-page class="bg-white">
    <q-header
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
      }"
    >
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          flat
          round
          dense
          icon="eva-arrow-back-outline"
          :color="$q.dark.mode ? 'white' : 'dark'"
        />
        <q-toolbar-title class="text-subtitle2 text-weight-bold">
          {{ title }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page padding>
      <div class="tagam-external-page">
        <iframe
          :src="url"
          class="tagam-external-page__frame"
          :title="title"
        ></iframe>
      </div>
      <div class="text-center q-mt-md">
        <a :href="url" target="_blank" rel="noopener noreferrer">
          {{ $t("Open in browser") }}
        </a>
      </div>
    </q-page>
  </q-page>
</template>

<script>
export default {
  name: "ExternalLegalPage",
  props: {
    title: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.tagam-external-page {
  border: 1px solid rgba(198, 164, 120, 0.2);
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  min-height: 72vh;
}

.tagam-external-page__frame {
  width: 100%;
  min-height: 72vh;
  border: 0;
  display: block;
  background: #fff;
}
</style>
