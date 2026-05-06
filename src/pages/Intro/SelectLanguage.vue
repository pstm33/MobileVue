<template>
  <q-pull-to-refresh @refresh="refresh" color="primary" bg-color="white">
    <q-page class="tagam-language-page">
      <div class="tagam-language-shell">
        <header class="tagam-language-header">
          <img src="/tagam-logo.svg" alt="Tagam" class="tagam-language-logo" />
          <div class="tagam-language-header__eyebrow">{{ $t("Select Language") }}</div>
          <h1 class="tagam-language-header__title">
            {{ $t("Choose the language that suits you best") }}
          </h1>
          <p class="tagam-language-header__copy">
            {{ $t("You can always change the language later in your account settings") }}
          </p>
        </header>

        <div class="tagam-language-list">
          <button
            v-for="items in DataStore?.language_data?.data"
            :key="items.code"
            type="button"
            class="tagam-language-card"
            :class="{ 'is-active': language === items.code }"
            @click="language = items.code"
          >
            <span class="tagam-language-card__flag">
              <q-img
                :src="items.flag"
                spinner-color="secondary"
                spinner-size="sm"
                fit="contain"
              />
            </span>
            <span class="tagam-language-card__copy">
              <span class="tagam-language-card__title">{{ items.title }}</span>
              <span class="tagam-language-card__meta">{{ items.description }}</span>
            </span>
            <span class="tagam-language-card__radio">
              <q-icon
                :name="language === items.code ? 'eva-checkmark-circle-2' : 'eva-radio-button-off-outline'"
                size="22px"
              />
            </span>
          </button>
        </div>
      </div>

      <q-footer class="tagam-language-footer">
        <div class="tagam-language-footer__inner">
          <q-btn
            outline
            no-caps
            class="tagam-language-footer__btn tagam-language-footer__btn--secondary"
            to="/home"
          >
            {{ $t("Skip") }}
          </q-btn>
          <q-btn
            unelevated
            no-caps
            class="tagam-language-footer__btn tagam-language-footer__btn--primary"
            @click="setLanguage"
            :loading="DataStore.loading"
          >
            {{ $t("Save") }}
          </q-btn>
        </div>
      </q-footer>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { api } from "boot/axios";
import { useDeliveryschedStore } from "stores/DeliverySched";
import APIinterface from "src/api/APIinterface";

export default {
  name: "LanguagePage",
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const deliveryschedStore = useDeliveryschedStore();
    return { DataStore, DataStorePersisted, deliveryschedStore };
  },
  data() {
    return {
      language: "",
    };
  },
  created() {
    this.language = this.DataStorePersisted.app_language;
  },
  methods: {
    setLanguage() {
      this.DataStorePersisted.choose_language = true;
      this.DataStorePersisted.app_language = this.language;
      this.$i18n.locale = this.language;
      api.defaults.params = {
        ...(api.defaults.params || {}),
        language: this.$i18n.locale,
      };

      this.DataStore.getAttributes();
      this.deliveryschedStore.getDeliverySched(
        APIinterface.getStorage("cart_uuid"),
        0
      );
      this.setRTL();
      this.$router.replace("/home");
    },
    refresh(done) {
      this.DataStore.getAttributes(done);
    },
    setRTL() {
      if (Object.keys(this.DataStore.language_data).length > 0) {
        Object.entries(this.DataStore.language_data.data).forEach(
          ([key, items]) => {
            if (this.language == items.code) {
              if (items.rtl == 1) {
                this.$q.lang.set({ rtl: true });
                this.DataStorePersisted.rtl = true;
              } else {
                this.$q.lang.set({ rtl: false });
                this.DataStorePersisted.rtl = false;
              }
            }
          }
        );
      }
    },
  },
};
</script>

<style scoped>
.tagam-language-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(241, 136, 0, 0.1), transparent 24%),
    linear-gradient(180deg, #fffdfa 0%, #fff8f1 100%);
}

.tagam-language-shell {
  min-height: 100vh;
  max-width: 520px;
  margin: 0 auto;
  padding: 28px 22px 128px;
}

.tagam-language-header__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  margin-top: 22px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(241, 136, 0, 0.14);
  color: #f18800;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tagam-language-logo {
  width: 170px;
  height: auto;
  display: block;
}

.tagam-language-header__title {
  margin: 18px 0 0;
  color: #241915;
  font-size: 34px;
  line-height: 0.98;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.tagam-language-header__copy {
  margin: 14px 0 0;
  color: #8f8177;
  font-size: 16px;
  line-height: 1.6;
  font-weight: 500;
}

.tagam-language-list {
  display: grid;
  gap: 12px;
  margin-top: 28px;
}

.tagam-language-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 14px;
  min-height: 78px;
  padding: 0 16px;
  border: 1px solid rgba(36, 25, 21, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.82);
  color: #241915;
  text-align: left;
  box-shadow: 0 12px 28px rgba(36, 25, 21, 0.04);
}

.tagam-language-card.is-active {
  border-color: rgba(241, 136, 0, 0.24);
  box-shadow: 0 16px 30px rgba(241, 136, 0, 0.12);
}

.tagam-language-card__flag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tagam-language-card__copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.tagam-language-card__title {
  font-size: 17px;
  line-height: 1.1;
  font-weight: 800;
}

.tagam-language-card__meta {
  color: #8f8177;
  font-size: 13px;
  line-height: 1.3;
}

.tagam-language-card__radio {
  color: #f18800;
}

.tagam-language-footer {
  background: transparent;
  box-shadow: none;
}

.tagam-language-footer__inner {
  max-width: 520px;
  margin: 0 auto;
  padding: 10px 22px 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.tagam-language-footer__btn {
  min-height: 52px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 800;
}

.tagam-language-footer__btn--secondary {
  border-color: rgba(36, 25, 21, 0.1);
  background: rgba(255, 248, 240, 0.9) !important;
  color: #6f6158 !important;
}

.tagam-language-footer__btn--primary {
  background: linear-gradient(135deg, #f18800 0%, #d96b1d 100%) !important;
  color: #fff8f1 !important;
  box-shadow: 0 16px 30px rgba(217, 107, 29, 0.18);
}
</style>
