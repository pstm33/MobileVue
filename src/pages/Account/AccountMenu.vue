<template>
  <q-header
    class="tagam-text-main"
    :class="{ 'myshadow-1': isScrolled, }"
  >
    <q-toolbar>
      <q-toolbar-title class="text-subtitle2 text-weight-bold">
        {{ $t("Account") }}
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="tagam-account-menu-page">
    <q-scroll-observer @scroll="onScroll" />
    <q-list>
      <q-item
        clickable
        :to="
          isLogin
            ? '/account/edit-profile'
            : DataStore.getLoginRedirect('/account-menu')
        "
      >
        <q-item-section avatar>
          <q-avatar size="50px">
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
          <q-item-label
            class="text-weight-medium text-subtitle2 text-capitalize"
          >
            {{
              isLogin
                ? `${data.first_name} ${data.last_name}`
                : $t("Hello there!")
            }}
          </q-item-label>
          <q-item-label caption>
            <div class="flex items-center q-gutter-x-xs">
              <div>
                {{
                  isLogin
                    ? $t("Edit Profile")
                    : $t("Sign in to place your order")
                }}
              </div>
              <div>
                <q-icon size="xs" name="eva-chevron-right-outline"></q-icon>
              </div>
            </div>
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <q-space class="q-pa-sm"></q-space>

    <div class="row items-center q-gutter-x-smx q-pl-mdx q-pr-mdx">
      <div class="col">
        <q-item clickable v-ripple:purple to="/account/orders?page=true">
          <q-item-section>
            <div class="tagam-surface-muted radius28 column items-center q-gutter-y-sm">
              <div class="col">
                <q-icon
                  name="eva-file-text-outline"
                  color="disabled"
                  size="lg"
                ></q-icon>
              </div>
              <div class="col text-caption tagam-text-muted">{{ $t("Orders") }}</div>
            </div>
          </q-item-section>
        </q-item>
      </div>
      <div class="col">
        <q-item clickable v-ripple:purple to="/account/my-address">
          <q-item-section>
            <div class="tagam-surface-muted radius28 column items-center q-gutter-y-sm">
              <div class="col">
                <q-icon
                  name="eva-book-open-outline"
                  color="disabled"
                  size="lg"
                ></q-icon>
              </div>
              <div class="col text-caption tagam-text-muted">
                {{ $t("Addresses") }}
              </div>
            </div>
          </q-item-section>
        </q-item>
      </div>
      <div class="col">
        <q-item clickable v-ripple:purple to="/account/payments">
          <q-item-section>
            <div class="tagam-surface-muted radius28 column items-center q-gutter-y-sm">
              <div class="col">
                <q-icon
                  name="eva-credit-card-outline"
                  color="disabled"
                  size="lg"
                ></q-icon>
              </div>
              <div class="col text-caption tagam-text-muted">{{ $t("Payment") }}</div>
            </div>
          </q-item-section>
        </q-item>
      </div>
    </div>
    <q-space style="height: 5px" class="tagam-surface-muted"></q-space>
    <div class="q-pa-md">
      <div class="text-h6 q-mb-sm">{{ $t("Benefits") }}</div>
      <q-list separator class="myqlist">
        <q-item
          v-if="DataStore.digitalwallet_enabled"
          clickable
          v-ripple:purple
          to="/account/wallet"
        >
          <q-item-section avatar>
            <q-icon color="disabled" name="o_wallet" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Wallet") }}
          </q-item-section>
          <q-item-section side class="text-weight-medium text-subtitle2">
            <template v-if="loading_balance">
              <q-spinner-ios size="xs"
            /></template>
            <template v-else>
              {{ ClientStore.wallet_balance }}
            </template>
          </q-item-section>
        </q-item>

        <!-- <q-item clickable v-ripple:purple to="/coupons">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-pricetags-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Coupons") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item> -->

        <q-item
          v-if="DataStore.points_enabled"
          clickable
          v-ripple:purple
          to="/account/points"
        >
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-star-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Loyalty Points") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>
        <q-separator></q-separator>
      </q-list>

      <div class="text-h6 q-mt-md q-mb-sm">
        {{ $t("My Account") }}
      </div>
      <q-list separator class="myqlist">
        <q-item clickable v-ripple:purple to="/account/my-address">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-pin-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Addresses") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple:purple to="/account/payments">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-credit-card-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Payment methods") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple:purple to="/account/favourites">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-heart-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Favourites") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple:purple to="/booking">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-calendar-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Bookings") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>

        <q-item
          v-if="DataStore.chat_enabled"
          clickable
          v-ripple:purple
          to="/account/chat"
        >
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-message-circle-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Live Chat") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple:purple @click="inviteFriends">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-person-add-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Invite Friends") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>

        <q-separator></q-separator>
      </q-list>

      <div class="text-h6 q-mt-md q-mb-sm">{{ $t("Settings") }}</div>
      <q-list separator class="myqlist">
        <q-item clickable v-ripple:purple @click="showPushSettings">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-bell-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Notifications") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>

        <q-item
          v-if="DataStore.enabled_language"
          clickable
          v-ripple:purple
          to="/account/language"
        >
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-globe-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Language") }}
          </q-item-section>
          <q-item-section side>
            <q-btn no-caps unelevated flat :icon-right="iconRight" padding="0">
              <div class="text-caption tagam-text-muted">
                {{ getLanguage?.title || "" }}
              </div>
            </q-btn>
          </q-item-section>
        </q-item>

        <q-item
          v-if="DataStore.multicurrency_enabled"
          clickable
          v-ripple:purple
          to="/account/currency"
        >
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-pie-chart-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Currency") }}
          </q-item-section>
          <q-item-section side>
            <q-btn
              no-caps
              unelevated
              flat
              icon-right="eva-chevron-right-outline"
              padding="0"
            >
              <div class="text-caption tagam-text-muted">
                {{ getCurrency }}
              </div>
            </q-btn>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple:purple @click="rtl = !rtl">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-swap-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Direction") }}
          </q-item-section>
          <q-item-section side>
            <q-btn no-caps unelevated flat :icon-right="iconRight" padding="0">
              <div class="text-caption tagam-text-muted">
                {{ DataStorePersisted.rtl ? $t("LRT") : $t("RTL") }}
              </div>
            </q-btn>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple:purple>
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-moon-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Dark Mode") }}
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="theme_mode" color="secondary" />
          </q-item-section>
        </q-item>
        <q-separator></q-separator>
      </q-list>

      <div class="text-h6 q-mt-md q-mb-sm">
        {{ $t("More information") }}
      </div>
      <q-list separator class="myqlist">
        <q-item clickable v-ripple:purple to="/legal/page/page_privacy_policy">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-lock-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Privacy Policy") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple:purple to="/legal/page/page_terms">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-shield-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Terms and conditions") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple:purple to="/legal/page/page_data_deletion">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-trash-2-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Account and Data Deletion") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple:purple to="/legal/page/page_refund_policy">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-undo-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Refund, Cancellation and Delivery Policy") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple:purple to="/legal/page/page_support">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-headphones-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("Support and Contact") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple:purple to="/legal/page/page_aboutus">
          <q-item-section avatar>
            <q-icon color="disabled" name="eva-info-outline" />
          </q-item-section>
          <q-item-section class="text-weight-medium text-subtitle2">
            {{ $t("About us") }}
          </q-item-section>
          <q-item-section side>
            <q-icon :name="iconRight"></q-icon>
          </q-item-section>
        </q-item>
        <q-separator></q-separator>
      </q-list>

      <q-space class="q-pa-md"></q-space>
      <template v-if="isLogin">
        <q-btn
          no-caps
          color="mygrey2"
          :text-color="$q.dark.mode ? 'white' : 'disabled'"
          unelevated
          class="radius28 fit text-weight-medium"
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
          class="radius28 fit text-weight-medium"
          icon="eva-log-in-outline"
          :to="DataStore.getLoginRedirect('/account-menu')"
          size="md"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Login") }}
          </div></q-btn
        >
      </template>
      <q-space class="q-pa-sm"></q-space>
    </div>

    <NotificationSettings ref="ref_notification"></NotificationSettings>
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
import config from "src/api/config";
import { useHaptics } from "src/composables/useHaptics";

export default {
  name: "AccountMenu",
  components: {
    NotificationSettings: defineAsyncComponent(() =>
      import("components/NotificationSettings.vue")
    ),
  },
  data() {
    return {
      data: [],
      theme_mode: false,
      themeHapticsReady: false,
      user_settings: {},
      rtl: false,
      qrcode: "",
      isScrolled: false,
      loading_balance: false,
      isLogin: true,
    };
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    const ClientStore = useClientStore();
    const PusherStore = usePusherStore();
    const haptics = useHaptics();
    return { DataStore, DataStorePersisted, ClientStore, PusherStore, haptics };
  },
  watch: {
    theme_mode(newval, oldval) {
      if (this.themeHapticsReady) {
        this.haptics.impact("light");
      }
      this.$q.dark.set(newval);
      this.DataStorePersisted.dark_mode = newval;
    },
    rtl(newval, oldval) {
      this.DataStorePersisted.rtl = newval;
      this.$q.lang.set({ rtl: newval });
    },
  },
  async mounted() {
    this.theme_mode = this.DataStorePersisted.dark_mode;
    this.$q.dark.set(this.theme_mode);
    this.themeHapticsReady = true;
    this.rtl = this.DataStorePersisted.rtl;

    if (!auth.authenticated()) {
      this.isLogin = false;
      return;
    }
    this.data = auth.getUser();

    try {
      this.loading_balance = true;
      if (!this.ClientStore.wallet_balance) {
        await this.ClientStore.getWalletBalance();
      }
    } catch (error) {
    } finally {
      this.loading_balance = false;
    }
  },
  computed: {
    getCurrency() {
      if (Object.keys(this.DataStore.currency_list).length > 0) {
        let Currency = this.DataStorePersisted.use_currency_code
          ? this.DataStorePersisted.use_currency_code
          : this.DataStore.default_currency_code;
        return Currency;
      }
      return false;
    },
    getLanguage() {
      const languages = this.DataStore.language_data?.data || null;
      const data = languages.find(
        (item) => item.code === this.DataStorePersisted.app_language
      );
      return data;
    },
    iconRight() {
      return this.DataStorePersisted.rtl
        ? "eva-chevron-left-outline"
        : "eva-chevron-right-outline";
    },
    getAvatar() {
      return this.DataStore.attributes_data?.user_avatar || "";
    },
  },
  methods: {
    showPushSettings() {
      if (this.isLogin) {
        this.$refs.ref_notification.modal = true;
      } else {
        if (this.DataStore.login_method == "otp") {
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
      }
    },
    async logout() {
      const web_token = this.DataStorePersisted.web_token;
      const device_token = this.ClientStore.device_token;

      // PUSH PWA
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
        } finally {
          APIinterface.hideLoadingBox(this.$q);
        }
      }

      // ANDROID
      if (device_token && this.$q.capacitor) {
        try {
          APIinterface.showLoadingBox("", this.$q);
          const userData = auth.getUser();
          await FCM.unsubscribeFrom({ topic: userData?.client_uuid || null });
          //await FCM.unsubscribeFrom({ topic: config.topic });
          //await FCM.deleteInstance();
          await APIinterface.fetchDataByTokenPost(
            "PushUnsubscribe",
            new URLSearchParams({
              platform: "android",
            }).toString()
          );
        } catch (error) {
          APIinterface.hideLoadingBox(this.$q);
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
      auth
        .authenticate()
        .then((data) => {
          //
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
          auth.logout();
          this.$router.push("/user/login");
        })
        .then((data) => {});
    },
    inviteFriends() {
      if (this.$q.capacitor) {
        Share.share({
          title: this.DataStore.invite_friend_settings.title,
          text: this.DataStore.invite_friend_settings.text,
          url: this.DataStore.invite_friend_settings.url,
          dialogTitle: "",
        })
          .then((data) => {})
          .catch((error) => {});
      } else {
        if (navigator.share) {
          navigator
            .share({
              title: this.DataStore.invite_friend_settings.title,
              text: this.DataStore.invite_friend_settings.text,
              url: this.DataStore.invite_friend_settings.url,
            })
            .then(() => console.log("Successful share"))
            .catch((error) => console.log("Error sharing", error));
        } else {
          if (this.$q.capacitor) {
            APIinterface.ShowAlert(
              this.$t("Share not supported"),
              this.$q.capacitor,
              this.$q
            );
          } else {
            APIinterface.ShowAlert(
              this.$t("Share not supported"),
              this.$q.capacitor,
              this.$q
            );
          }
        }
      }
    },
  },
};
</script>






