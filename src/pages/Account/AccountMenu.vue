<template>
  <q-page class="page-account-menu q-px-md q-pb-xl">
    <q-page-sticky
      position="top"
      expand
      :offset="[0, 0]"
      class="tagam-account-sticky-shell"
    >
      <TagamTopHeader
        :cart-count="0"
        :sticky="false"
        :show-menu="false"
        class="tagam-account-sticky-header"
      >
        <template #actions>
          <q-btn
            flat
            round
            dense
            to="/home"
            icon="eva-home-outline"
            class="tagam-shared-header__icon tagam-account-home-icon"
          />

          <q-avatar v-if="isLogin" size="34px" class="tagam-account-mini-avatar">
            <q-img
              :src="data?.avatar || getAvatar"
              spinner-color="primary"
              spinner-size="xs"
              loading="lazy"
            />
          </q-avatar>
        </template>
      </TagamTopHeader>
    </q-page-sticky>

    <q-scroll-observer @scroll="onScroll" />

    <div class="tagam-account-spacer"></div>

    <section class="tagam-section-shell tagam-account-hero">
      <q-item
        clickable
        class="tagam-account-profile"
        :to="
          isLogin
            ? '/account/edit-profile'
            : DataStore.getLoginRedirect('/account-menu')
        "
      >
        <q-item-section avatar>
          <q-avatar size="68px" class="tagam-account-avatar">
            <q-img
              :src="data?.avatar || getAvatar"
              spinner-color="primary"
              spinner-size="xs"
              loading="lazy"
            >
              <template v-slot:loading>
                <div class="text-primary">
                  <q-spinner-ios size="xs" />
                </div>
              </template>
            </q-img>
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="tagam-account-profile__name text-capitalize">
            {{
              isLogin
                ? `${data?.first_name || ""} ${data?.last_name || ""}`.trim()
                : $t("Hello there!")
            }}
          </q-item-label>

          <q-item-label class="tagam-account-profile__meta">
            {{
              isLogin
                ? $t("Edit Profile")
                : $t("Sign in to place your order")
            }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-icon :name="iconRight" color="primary" />
        </q-item-section>
      </q-item>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-4">
          <q-item clickable class="tagam-quick-card" to="/account/orders?page=true">
            <q-item-section class="items-center">
              <q-icon name="eva-file-text-outline" color="primary" size="28px" />
              <div class="tagam-quick-card__label">{{ $t("Orders") }}</div>
            </q-item-section>
          </q-item>
        </div>

        <div class="col-4">
          <q-item clickable class="tagam-quick-card" to="/account/my-address">
            <q-item-section class="items-center">
              <q-icon name="eva-pin-outline" color="primary" size="28px" />
              <div class="tagam-quick-card__label">{{ $t("Addresses") }}</div>
            </q-item-section>
          </q-item>
        </div>

        <div class="col-4">
          <q-item clickable class="tagam-quick-card" to="/account/payments">
            <q-item-section class="items-center">
              <q-icon
                name="eva-credit-card-outline"
                color="primary"
                size="28px"
              />
              <div class="tagam-quick-card__label">{{ $t("Payment") }}</div>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </section>

    <section class="tagam-section-shell q-mt-md">
      <div class="tagam-section-heading tagam-section-heading--compact">
        <div class="tagam-section-heading__eyebrow">{{ $t("Benefits") }}</div>
        <div class="tagam-section-heading__meta">
          {{ $t("Wallet, loyalty and rewards") }}
        </div>
      </div>

      <q-list class="tagam-account-list">
        <q-item
          v-if="DataStore.digitalwallet_enabled"
          clickable
          to="/account/wallet"
          class="tagam-account-row"
        >
          <q-item-section avatar>
            <q-icon color="primary" name="o_wallet" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Wallet") }}
          </q-item-section>
          <q-item-section side class="text-weight-medium text-subtitle2">
            <template v-if="loading_balance">
              <q-spinner-ios size="xs" />
            </template>
            <template v-else>
              {{ ClientStore.wallet_balance }}
            </template>
          </q-item-section>
        </q-item>

        <q-item
          v-if="DataStore.points_enabled"
          clickable
          to="/account/points"
          class="tagam-account-row"
        >
          <q-item-section avatar>
            <q-icon color="primary" name="eva-star-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Loyalty Points") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight" />
          </q-item-section>
        </q-item>
      </q-list>
    </section>

    <section class="tagam-section-shell q-mt-md">
      <div class="tagam-section-heading tagam-section-heading--compact">
        <div class="tagam-section-heading__eyebrow">{{ $t("My Account") }}</div>
        <div class="tagam-section-heading__meta">
          {{ $t("Addresses, payments and favourites") }}
        </div>
      </div>

      <q-list class="tagam-account-list">
        <q-item clickable to="/account/my-address" class="tagam-account-row">
          <q-item-section avatar>
            <q-icon color="primary" name="eva-pin-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Addresses") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight" />
          </q-item-section>
        </q-item>

        <q-item clickable to="/account/payments" class="tagam-account-row">
          <q-item-section avatar>
            <q-icon color="primary" name="eva-credit-card-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Payment methods") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight" />
          </q-item-section>
        </q-item>

        <q-item clickable to="/account/favourites" class="tagam-account-row">
          <q-item-section avatar>
            <q-icon color="primary" name="eva-heart-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Favourites") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight" />
          </q-item-section>
        </q-item>

        <q-item clickable to="/booking" class="tagam-account-row">
          <q-item-section avatar>
            <q-icon color="primary" name="eva-calendar-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Bookings") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight" />
          </q-item-section>
        </q-item>

        <q-item
          v-if="DataStore.chat_enabled"
          clickable
          to="/account/chat"
          class="tagam-account-row"
        >
          <q-item-section avatar>
            <q-icon color="primary" name="eva-message-circle-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Live Chat") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight" />
          </q-item-section>
        </q-item>

        <q-item clickable @click="inviteFriends" class="tagam-account-row">
          <q-item-section avatar>
            <q-icon color="primary" name="eva-person-add-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Invite Friends") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight" />
          </q-item-section>
        </q-item>
      </q-list>
    </section>

    <section class="tagam-section-shell q-mt-md">
      <div class="tagam-section-heading tagam-section-heading--compact">
        <div class="tagam-section-heading__eyebrow">{{ $t("Settings") }}</div>
        <div class="tagam-section-heading__meta">
          {{ $t("Language and preferences") }}
        </div>
      </div>

      <q-list class="tagam-account-list">
        <q-item clickable @click="showPushSettings" class="tagam-account-row">
          <q-item-section avatar>
            <q-icon color="primary" name="eva-bell-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Notifications") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight" />
          </q-item-section>
        </q-item>

        <q-item clickable @click="showLanguage = true" class="tagam-account-row">
          <q-item-section avatar>
            <q-icon color="primary" name="eva-globe-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Language") }}
          </q-item-section>
          <q-item-section side>
            <q-btn no-caps unelevated flat :icon-right="iconRight" padding="0">
              <div class="text-caption text-grey">
                {{ getLanguageTitle }}
              </div>
            </q-btn>
          </q-item-section>
        </q-item>

        <q-item
          v-if="DataStore.multicurrency_enabled"
          clickable
          to="/account/currency"
          class="tagam-account-row"
        >
          <q-item-section avatar>
            <q-icon color="primary" name="eva-pie-chart-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Currency") }}
          </q-item-section>
          <q-item-section side>
            <q-btn no-caps unelevated flat :icon-right="iconRight" padding="0">
              <div class="text-caption text-grey">
                {{ getCurrency }}
              </div>
            </q-btn>
          </q-item-section>
        </q-item>

      </q-list>
    </section>

    <section class="tagam-section-shell q-mt-md">
      <div class="tagam-section-heading tagam-section-heading--compact">
        <div class="tagam-section-heading__eyebrow">{{ $t("Legal") }}</div>
        <div class="tagam-section-heading__meta">
          {{ $t("Privacy, terms and data requests") }}
        </div>
      </div>

      <q-list class="tagam-account-list">
        <q-item
          v-for="item in legalPages"
          :key="item.key"
          clickable
          :to="item.to"
          class="tagam-account-row"
        >
          <q-item-section avatar>
            <q-icon color="primary" :name="item.icon" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t(item.label) }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight" />
          </q-item-section>
        </q-item>
      </q-list>
    </section>

    <div class="q-mt-md">
      <template v-if="isLogin">
        <q-btn
          no-caps
          color="mygrey2"
          :text-color="$q.dark.mode ? 'white' : 'disabled'"
          unelevated
          class="fit tagam-account-cta"
          icon="eva-log-out-outline"
          @click="logout"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Log out") }}
          </div>
        </q-btn>
      </template>

      <template v-else>
        <q-btn
          no-caps
          color="secondary"
          text-color="white"
          unelevated
          class="fit tagam-account-cta"
          icon="eva-log-in-outline"
          :to="DataStore.getLoginRedirect('/account-menu')"
          size="md"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Login") }}
          </div>
        </q-btn>
      </template>
    </div>

    <q-dialog v-model="showLanguage" position="bottom">
      <q-card style="border-radius: 24px 24px 0 0">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t("Select Language") }}</div>
          <q-space />
          <q-btn icon="las la-times" flat round dense v-close-popup />
        </q-card-section>

        <q-list class="q-pa-md">
          <q-item
            v-for="lang in availableLanguages"
            :key="lang.code"
            clickable
            v-ripple
            @click="setLanguage(lang.code)"
            v-close-popup
            class="radius8 q-mb-sm bg-grey-2"
          >
            <q-item-section>
              {{ lang.title || lang.name || lang.code }}
            </q-item-section>
            <q-item-section
              side
              v-if="
                $i18n.locale === lang.code ||
                DataStorePersisted.app_language === lang.code
              "
            >
              <q-icon name="las la-check" color="primary" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>

    <NotificationSettings ref="ref_notification" />
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import auth from "src/api/auth";
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useClientStore } from "stores/ClientStore";
import { Share } from "@capacitor/share";
import { usePusherStore } from "stores/PusherStore";
import { deleteToken } from "firebase/messaging";
import { firebaseMessaging } from "src/boot/FirebaseChat";
import { FCM } from "@capacitor-community/fcm";
import { legalPages } from "src/config/legalPages";

export default {
  name: "AccountMenu",
  components: {
    NotificationSettings: defineAsyncComponent(() =>
      import("components/NotificationSettings.vue")
    ),
    TagamTopHeader: defineAsyncComponent(() =>
      import("components/TagamTopHeader.vue")
    ),
  },
  data() {
    return {
      showLanguage: false,
      data: {},
      user_settings: {},
      rtl: false,
      qrcode: "",
      isScrolled: false,
      loading_balance: false,
      isLogin: false,
    };
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const ClientStore = useClientStore();
    const PusherStore = usePusherStore();
    return { DataStore, DataStorePersisted, ClientStore, PusherStore };
  },
  watch: {
    rtl(newval) {
      this.DataStorePersisted.rtl = newval;
      this.$q.lang.set({ rtl: newval });
    },
  },
  async mounted() {
    this.DataStorePersisted.dark_mode = false;
    this.$q.dark.set(false);
    this.rtl = this.DataStorePersisted.rtl;

    if (!auth.authenticated()) {
      this.isLogin = false;
      return;
    }

    this.isLogin = true;
    this.data = auth.getUser() || {};

    try {
      this.loading_balance = true;
      if (!this.ClientStore.wallet_balance) {
        await this.ClientStore.getWalletBalance();
      }
    } catch (error) {
      console.error("Wallet balance error:", error);
    } finally {
      this.loading_balance = false;
    }
  },
  computed: {
    getCurrency() {
      if (Object.keys(this.DataStore.currency_list).length > 0) {
        return this.DataStorePersisted.use_currency_code
          ? this.DataStorePersisted.use_currency_code
          : this.DataStore.default_currency_code;
      }
      return false;
    },
    availableLanguages() {
      const languages = this.DataStore.language_data?.data;
      if (Array.isArray(languages) && languages.length) {
        return languages;
      }

      return [
        { code: "ru", title: "Русский" },
        { code: "en", title: "English" },
      ];
    },
    getLanguage() {
      return this.availableLanguages.find(
        (item) => item.code === this.DataStorePersisted.app_language
      );
    },
    getLanguageTitle() {
      return (
        this.getLanguage?.title ||
        this.getLanguage?.name ||
        this.DataStorePersisted.app_language ||
        "Language"
      );
    },
    iconRight() {
      return this.DataStorePersisted.rtl
        ? "eva-chevron-left-outline"
        : "eva-chevron-right-outline";
    },
    getAvatar() {
      return this.DataStore.attributes_data?.user_avatar || "";
    },
    legalPages() {
      return legalPages;
    },
  },
  methods: {
    setLanguage(lang) {
      this.$i18n.locale = lang;
      this.DataStorePersisted.app_language = lang;
      window.location.reload();
    },
    showPushSettings() {
      if (this.isLogin) {
        this.$refs.ref_notification.modal = true;
      } else if (this.DataStore.login_method == "otp") {
        this.$router.push({
          path: "/user/login-otp",
          query: { redirect: "/account-menu" },
        });
      } else {
        this.$router.push({
          path: "/user/login",
          query: { redirect: "/account-menu" },
        });
      }
    },
    async logout() {
      const web_token = this.DataStorePersisted.web_token;
      const device_token = this.ClientStore.device_token;

      if (web_token && this.DataStore.is_messaging_supported) {
        try {
          APIinterface.showLoadingBox("", this.$q);
          await APIinterface.fetchDataByTokenPost(
            "PushUnsubscribe",
            new URLSearchParams({
              platform: "pwa",
            }).toString()
          );
          await deleteToken(firebaseMessaging);
        } catch (error) {
          console.error("PWA unsubscribe error:", error);
        } finally {
          APIinterface.hideLoadingBox(this.$q);
        }
      }

      if (device_token && this.$q.capacitor) {
        try {
          APIinterface.showLoadingBox("", this.$q);
          const userData = auth.getUser();
          await FCM.unsubscribeFrom({ topic: userData?.client_uuid || null });
          await APIinterface.fetchDataByTokenPost(
            "PushUnsubscribe",
            new URLSearchParams({
              platform: "android",
            }).toString()
          );
        } catch (error) {
          console.error("Android unsubscribe error:", error);
        } finally {
          APIinterface.hideLoadingBox(this.$q);
        }
      }

      this.ClientStore.user_settings = null;
      this.ClientStore.notifications_data = null;
      this.ClientStore.saved_payment_list = null;
      this.DataStorePersisted.web_token = null;
      this.DataStorePersisted.push_enabled = true;
      this.PusherStore.disconnect();
      auth.logout();
      this.$router.push("/home");
    },
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    authenticate() {
      auth.authenticate().catch((error) => {
        APIinterface.notify("dark", error, "error", this.$q);
        auth.logout();
        this.$router.push("/user/login");
      });
    },
    inviteFriends() {
      if (this.$q.capacitor) {
        Share.share({
          title: this.DataStore.invite_friend_settings.title,
          text: this.DataStore.invite_friend_settings.text,
          url: this.DataStore.invite_friend_settings.url,
          dialogTitle: "",
        })
          .then(() => {})
          .catch(() => {});
      } else if (navigator.share) {
        navigator
          .share({
            title: this.DataStore.invite_friend_settings.title,
            text: this.DataStore.invite_friend_settings.text,
            url: this.DataStore.invite_friend_settings.url,
          })
          .then(() => console.log("Successful share"))
          .catch((error) => console.log("Error sharing", error));
      } else {
        APIinterface.ShowAlert(
          this.$t("Share not supported"),
          this.$q.capacitor,
          this.$q
        );
      }
    },
  },
};
</script>

<style scoped>
.page-account-menu {
  background: #ffffff !important;
}

.tagam-account-sticky-shell {
  z-index: 150;
}

.tagam-account-sticky-header {
  width: 100%;
  background: #ffffff;
}

.tagam-account-mini-avatar {
  border: 1px solid rgba(113, 74, 24, 0.08);
  overflow: hidden;
}

.tagam-account-home-icon {
  color: #f18800 !important;
}

  .tagam-account-header {
    background: transparent !important;
    box-shadow: none !important;
  padding: 10px 12px 0;
}

.tagam-account-header-shell {
  background: rgba(255, 249, 240, 0.88);
  border: 1px solid rgba(113, 74, 24, 0.12);
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(70, 41, 12, 0.14);
  backdrop-filter: blur(16px);
}

.tagam-account-header__eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a6a4e;
}

.tagam-account-header__title {
  font-size: 20px;
  font-weight: 900;
  color: #20160f;
}

.tagam-account-spacer {
  height: 46px;
}

  .tagam-account-hero {
    overflow: hidden;
    background: #ffffff;
  }

.tagam-account-profile {
  padding: 0;
}

.tagam-account-avatar {
  border: 3px solid rgba(217, 107, 29, 0.12);
}

.tagam-account-profile__name {
  font-size: 24px;
  line-height: 1.05;
  font-weight: 900;
  color: #20160f;
}

.tagam-account-profile__meta {
  margin-top: 6px;
  color: #6f6254;
}

  .tagam-quick-card {
    min-height: 110px;
    border-radius: 22px;
    background: #ffffff;
    border: 1px solid rgba(113, 74, 24, 0.08);
  }

.tagam-quick-card__label {
  margin-top: 10px;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
  color: #20160f;
}

.tagam-account-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

  .tagam-account-row {
    min-height: 60px;
    padding: 10px 14px;
  border-radius: 18px;
  background: rgba(255, 252, 247, 0.76);
  border: 1px solid rgba(113, 74, 24, 0.08);
}

.tagam-account-cta {
  height: 54px;
  border-radius: 20px;
}

:global(body.body--dark) .page-account-menu {
  background:
    radial-gradient(circle at top left, rgba(241, 136, 0, 0.08), transparent 24%),
    radial-gradient(circle at top right, rgba(120, 71, 33, 0.12), transparent 22%),
    linear-gradient(180deg, #140f0d 0%, #191311 46%, #1f1815 100%) !important;
}

:global(body.body--dark) .tagam-account-sticky-header {
  background: rgba(33, 26, 23, 0.98) !important;
  border-bottom: 1px solid var(--tagam-stroke) !important;
}

:global(body.body--dark) .tagam-account-mini-avatar,
:global(body.body--dark) .tagam-account-avatar {
  border-color: var(--tagam-stroke-strong) !important;
}

:global(body.body--dark) .tagam-account-hero,
:global(body.body--dark) .tagam-section-shell,
:global(body.body--dark) .tagam-quick-card,
:global(body.body--dark) .tagam-account-row {
  background: rgba(39, 31, 27, 0.96) !important;
  border-color: var(--tagam-stroke) !important;
  box-shadow: var(--tagam-shadow) !important;
}

:global(body.body--dark) .tagam-account-profile__name,
:global(body.body--dark) .tagam-quick-card__label,
:global(body.body--dark) .tagam-account-row,
:global(body.body--dark) .tagam-account-row .text-subtitle2,
:global(body.body--dark) .tagam-account-row .text-weight-medium {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-quick-card .q-item__section,
:global(body.body--dark) .tagam-quick-card .q-item__section *,
:global(body.body--dark) .tagam-quick-card .q-item__label {
  color: var(--tagam-text) !important;
}

:global(body.body--dark) .tagam-account-profile__meta,
:global(body.body--dark) .tagam-section-heading__meta,
:global(body.body--dark) .tagam-account-row .text-caption {
  color: var(--tagam-text-muted) !important;
}

:global(body.body--dark) .tagam-account-home-icon,
:global(body.body--dark) .tagam-account-row .q-icon,
:global(body.body--dark) .tagam-quick-card .q-icon {
  color: var(--tagam-primary) !important;
}

</style>
