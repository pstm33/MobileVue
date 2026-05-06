<template>
  <div class="tagam-shared-header" :class="{ 'tagam-shared-header--fixed': fixed }">
    <div
      v-if="fixed"
      class="tagam-shared-header__fixed-spacer"
      :style="{ height: fixedSpacerHeight }"
    ></div>

    <section class="tagam-shared-header__shell">
      <div
        class="tagam-shared-header__toolbar-wrap"
        :class="{
          'tagam-shared-header__toolbar-wrap--fixed': fixed,
          'tagam-shared-header__toolbar-wrap--sticky': sticky,
          'tagam-shared-header__toolbar-wrap--full-bleed': fullBleed,
        }"
      >
        <div class="tagam-shared-header__toolbar">
        <router-link to="/home" class="tagam-shared-header__logo-link">
          <img
            src="/tagam-logo.svg"
            alt="Tagam"
            class="tagam-shared-header__logo"
            :style="{ width: logoWidth }"
          />
        </router-link>

        <div class="tagam-shared-header__spacer"></div>

        <div class="tagam-shared-header__actions">
          <q-btn
            v-if="showCart"
            flat
            round
            dense
            class="tagam-shared-header__icon"
            to="/cart"
            icon="shopping_bag"
            data-cart-target="true"
          >
            <q-badge
              v-if="cartCount > 0"
              color="black"
              text-color="white"
              floating
              rounded
              class="tagam-shared-header__badge"
            >
              {{ cartCount }}
            </q-badge>
          </q-btn>

          <q-btn
            v-if="showMenu"
            flat
            round
            dense
            class="tagam-shared-header__icon"
            to="/account-menu"
            icon="menu"
          />

          <slot name="actions" />
        </div>
      </div>
      </div>

      <div v-if="$slots.default" class="tagam-shared-header__content">
        <slot />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "TagamTopHeader",
  props: {
    sticky: {
      type: Boolean,
      default: true,
    },
    fixed: {
      type: Boolean,
      default: false,
    },
    fullBleed: {
      type: Boolean,
      default: false,
    },
    showCart: {
      type: Boolean,
      default: true,
    },
    showMenu: {
      type: Boolean,
      default: true,
    },
    cartCount: {
      type: Number,
      default: 0,
    },
    logoWidth: {
      type: String,
      default: "145px",
    },
  },
  computed: {
    fixedSpacerHeight() {
      return "62px";
    },
  },
};
</script>

<style scoped>
.tagam-shared-header {
  position: relative;
  z-index: 20;
  padding-top: 0;
}

.tagam-shared-header--fixed {
  z-index: 120;
}

.tagam-shared-header__fixed-spacer {
  width: 100%;
}

.tagam-shared-header__shell {
  background: transparent;
  padding: 0;
}

.tagam-shared-header__toolbar-wrap {
  width: 100%;
  box-sizing: border-box;
  padding: 4px 8px 0 16px;
  background: #ffffff;
  border-radius: 0;
}

.tagam-shared-header__toolbar-wrap--fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 120;
  background: rgba(255, 255, 255, 0.98);
}

.tagam-shared-header__toolbar-wrap--full-bleed {
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 16px;
  padding-right: 8px;
}

.tagam-shared-header__toolbar-wrap--sticky {
  position: sticky;
  top: 0;
  z-index: 80;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
}

.tagam-shared-header__toolbar-wrap--fixed.tagam-shared-header__toolbar-wrap--full-bleed {
  margin-left: 0;
  margin-right: 0;
  padding-left: 16px;
  padding-right: 8px;
}

.tagam-shared-header__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 46px;
}

.tagam-shared-header__logo-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.tagam-shared-header__logo {
  height: auto;
  object-fit: contain;
  object-position: left center;
  display: block;
  margin-top: 0;
}

.tagam-shared-header__spacer {
  flex: 1 1 auto;
}

.tagam-shared-header__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tagam-shared-header__icon {
  min-width: 38px;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  color: #f18800 !important;
  opacity: 1 !important;
}

.tagam-shared-header__badge {
  min-width: 24px;
  height: 24px;
  font-size: 12px;
  font-weight: 700;
}

.tagam-shared-header__content {
  margin-top: -2px;
  padding: 0 16px;
}

:global(body.body--dark) .tagam-shared-header__toolbar-wrap,
:global(body.body--dark) .tagam-shared-header__toolbar-wrap--sticky,
:global(body.body--dark) .tagam-shared-header__toolbar-wrap--fixed {
  background: rgba(33, 26, 23, 0.98) !important;
  border-bottom: 1px solid var(--tagam-stroke) !important;
  backdrop-filter: blur(14px);
}

:global(body.body--dark) .tagam-shared-header__icon {
  color: var(--tagam-primary) !important;
  opacity: 1 !important;
}

:global(body.body--dark) .tagam-shared-header__icon :deep(.q-icon) {
  color: var(--tagam-primary) !important;
  opacity: 1 !important;
}
</style>
