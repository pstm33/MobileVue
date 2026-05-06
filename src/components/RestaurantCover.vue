<template>
  <div
    class="tagam-restaurant-cover"
    :class="{ 'tagam-restaurant-cover--ratio': !!aspectRatio }"
    :style="coverVars"
  >
    <q-img
      v-if="coverSrc"
      :src="coverSrc"
      :fit="imageFit"
      class="tagam-restaurant-cover__image"
      :img-style="{
        objectFit: imageFit,
        objectPosition: imagePosition,
        transform: imageTransform,
        transformOrigin: 'center center',
      }"
      spinner-color="primary"
      spinner-size="xs"
      lazy
    >
      <template v-slot:loading>
        <div class="text-primary">
          <q-spinner-ios size="sm" />
        </div>
      </template>
    </q-img>

    <div v-else class="tagam-restaurant-cover__logo-fallback">
      <q-img
        v-if="logoSrc"
        :src="logoSrc"
        fit="contain"
        class="tagam-restaurant-cover__logo"
        spinner-color="primary"
        spinner-size="xs"
        lazy
      />
    </div>

    <div class="tagam-restaurant-cover__layer">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: "RestaurantCover",
  props: {
    coverSrc: {
      type: String,
      default: "",
    },
    logoSrc: {
      type: String,
      default: "",
    },
    imageFit: {
      type: String,
      default: "cover",
    },
    imagePosition: {
      type: String,
      default: "center center",
    },
    imageTransform: {
      type: String,
      default: "none",
    },
    height: {
      type: Number,
      default: 238,
    },
    mobileHeight: {
      type: Number,
      default: 220,
    },
    aspectRatio: {
      type: String,
      default: "",
    },
    radius: {
      type: String,
      default: "34px",
    },
    background: {
      type: String,
      default: "#f3eadb",
    },
  },
  computed: {
    coverVars() {
      return {
        "--tagam-cover-height": `${this.height}px`,
        "--tagam-cover-mobile-height": `${this.mobileHeight}px`,
        "--tagam-cover-aspect-ratio": this.aspectRatio || "auto",
        "--tagam-cover-radius": this.radius,
        "--tagam-cover-bg": this.background,
      };
    },
  },
};
</script>

<style scoped>
.tagam-restaurant-cover {
  position: relative;
  overflow: hidden;
  height: var(--tagam-cover-height);
  aspect-ratio: var(--tagam-cover-aspect-ratio);
  border-radius: var(--tagam-cover-radius);
  background: var(--tagam-cover-bg);
}

.tagam-restaurant-cover--ratio {
  height: auto;
}

.tagam-restaurant-cover__image,
.tagam-restaurant-cover__logo-fallback {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.tagam-restaurant-cover__logo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.72), transparent 50%),
    var(--tagam-cover-bg);
}

.tagam-restaurant-cover__logo {
  width: 100%;
  height: 100%;
}

.tagam-restaurant-cover__layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tagam-restaurant-cover__layer :deep(*) {
  pointer-events: auto;
}

:deep(.tagam-restaurant-cover__image .q-img__container),
:deep(.tagam-restaurant-cover__logo .q-img__container) {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

:deep(.tagam-restaurant-cover__image .q-img__image),
:deep(.tagam-restaurant-cover__image .q-img__image--with-transition) {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

:deep(.tagam-restaurant-cover__logo .q-img__image),
:deep(.tagam-restaurant-cover__logo .q-img__image--with-transition) {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: contain !important;
  object-position: center center !important;
}

@media (max-width: 480px) {
  .tagam-restaurant-cover {
    height: var(--tagam-cover-mobile-height);
  }

  .tagam-restaurant-cover--ratio {
    height: auto;
  }
}
</style>
