<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      class="tagam-account-header" :class="{ 'border-bottom': !isScrolled, 'shadow-bottom': isScrolled, }"
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
        <q-toolbar-title class="text-subtitle2 text-weight-bold">{{
          $t("Live Chat")
        }}</q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="eva-plus-outline"
          :color="$q.dark.mode ? 'white' : 'dark'"
          @click="showSearch"
        />
      </q-toolbar>
    </q-header>
    <q-page class="tagam-account-chat-main-page">
      <q-scroll-observer @scroll="onScroll" />

      <template v-if="loading">
        <div class="tagam-chat-loading absolute-center flex flex-center q-gutter-x-sm">
          <q-spinner-ios size="sm" />
          <div class="text-subtitle1 tagam-text-muted">{{ $t("Loading") }}...</div>
        </div>
      </template>
      <template v-else-if="hasData">
        <q-list class="tagam-chat-list q-pa-md">
          <template v-for="items in getData" :key="items">
            <template v-if="items.to_info">
              <q-item
                class="tagam-chat-list-item"
                clickable
                @click="loadConversation(items.doc_id)"
              >
                <q-item-section avatar>
                  <q-avatar v-if="items.to_info" class="tagam-chat-avatar">
                    <img :src="items?.to_info?.photo" />
                  </q-avatar>
                  <q-avatar v-else class="tagam-chat-avatar" color="grey-5" text-color="white">
                    <q-icon name="eva-message-circle-outline" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="tagam-chat-name">
                    {{ items?.to_info?.first_name }}
                    {{ items?.to_info?.last_name }}
                  </q-item-label>
                  <q-item-label class="tagam-chat-meta">
                    <template v-if="items.orderID">
                      {{ $t("Order#") }} {{ items.orderID }}
                    </template>
                    <template v-else>
                      <template v-if="items.to_info">
                        {{ formatUserType(items.to_info.user_type) }}
                      </template>
                    </template>
                  </q-item-label>
                  <q-item-label class="tagam-chat-preview" lines="2">
                    <template v-if="items.is_typing">
                      <span class="text-primary">
                        {{ $t("is typing...") }}</span
                      >
                    </template>
                    <template v-else-if="getLastMessageData[items.doc_id]">
                      {{ getLastMessageData[items.doc_id]?.message }} &bull;
                      {{ getLastMessageData[items.doc_id]?.time }}
                    </template>
                    <template v-else>
                      {{ $t("No messages yet") }}
                    </template>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon :name="iconRight" class="tagam-text-muted"></q-icon>
                </q-item-section>
              </q-item>
            </template>
          </template>
        </q-list>
      </template>
      <template v-else>
        <div class="tagam-chat-empty q-mx-md">
          <div class="tagam-empty-icon">
            <q-icon name="eva-message-circle-outline" size="30px" />
          </div>
          <div class="tagam-title-md q-mb-xs">{{ $t("No chats yet") }}</div>
          <div class="tagam-body-muted q-mb-lg">
            {{ $t("Start a conversation with a restaurant") }}
          </div>
          <q-btn
            color="primary"
            unelevated
            no-caps
            rounded
            icon="eva-plus-outline"
            :label="$t('New chat')"
            class="tagam-button-primary"
            @click="showSearch"
          />
        </div>
      </template>

      <ChatSearch ref="chat_search" />

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
        v-if="!this.$q.capacitor"
       class="tagam-account-chat-main-page">
        <q-btn
          fab
          icon="keyboard_arrow_up"
          color="mygrey"
          text-color="dark"
          dense
          padding="3px"
        />
      </q-page-scroller>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { firebaseDb, firebaseCollectionEnum } from "src/boot/FirebaseChat";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import auth from "src/api/auth";
import APIinterface from "src/api/APIinterface";
import { date } from "quasar";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "ChatMain",
  components: {
    ChatSearch: defineAsyncComponent(() => import("components/ChatSearch.vue")),
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, DataStorePersisted };
  },
  data() {
    return {
      isScrolled: false,
      user_uuid: "",
      data: [],
      users: [],
      all_users: [],
      users_data: [],
      loading: false,
      loading_user: false,
      whoistyping_data: {},
      document_id: "",
      main_user_type: "",
      refresh_page: undefined,
      unsubscribe: null,
    };
  },
  mounted() {
    let user = auth.getUser();
    this.user_uuid = user.client_uuid;
    if (!this.DataStore.data_chat) {
      this.getParticipants();
    }
  },
  unmounted() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  computed: {
    iconRight() {
      return this.DataStorePersisted.rtl
        ? "eva-chevron-left-outline"
        : "eva-chevron-right-outline";
    },
    getData() {
      return this.DataStore.data_chat;
    },
    getLastMessageData() {
      return this.DataStore.last_message_data;
    },
    hasData() {
      if (Array.isArray(this.DataStore.data_chat) && this.DataStore.data_chat.length > 0) {
        return true;
      }
      return false;
    },
    hasUserData() {
      if (Object.keys(this.users_data).length > 0) {
        return true;
      }
      return false;
    },
    getShowistyping() {
      return this.whoistyping_data;
    },
  },
  methods: {
    onScroll(info) {
      this.isScrolled = info.position.top > 140;
    },
    refresh(done) {
      this.refresh_page = done;
      this.getParticipants();
    },
    getParticipants() {
      try {
        this.loading = true;
        this.DataStore.data_chat = [];
        const collectionRef = collection(
          firebaseDb,
          firebaseCollectionEnum.chats
        );

        const q = query(
          collectionRef,
          where("participants", "array-contains", this.user_uuid),
          limit(firebaseCollectionEnum.limit)
        );
        this.unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!APIinterface.empty(this.refresh_page)) {
              this.refresh_page();
            }

            snapshot.docChanges().forEach((change) => {
              let data = change.doc.data();
              const docId = change.doc.id;

              let isTyping = data.isTyping || {};
              let participants = data.participants || [];

              if (Object.keys(participants).length > 0) {
                Object.entries(participants).forEach(([key, items]) => {
                  this.all_users.push(items);
                });
              }

              let resp_participants = participants.filter(
                (i) => !i.includes(this.user_uuid)
              );
              let user_uuid = resp_participants[0] ? resp_participants[0] : null;
              this.users.push(user_uuid);

              let matchedInfo = null;
              let from_info = data.from_info || null;
              let to_info = data.to_info || null;
              if (from_info && from_info.client_uuid === this.user_uuid) {
                matchedInfo = to_info;
              } else if (to_info && to_info.client_uuid === this.user_uuid) {
                matchedInfo = from_info;
              }

              const docData = {
                doc_id: docId,
                user_uuid: user_uuid,
                is_typing: isTyping[resp_participants[0]]
                  ? isTyping[resp_participants[0]]
                  : false,
                orderID: data.orderID || null,
                orderUuid: data.orderUuid || null,
                lastUpdated: data.lastUpdated || null,
                to_info: matchedInfo,
              };

              if (change.type === "added") {
                this.DataStore.data_chat.unshift(docData);
              } else if (change.type === "modified") {
                const index = this.DataStore.data_chat.findIndex(
                  (chat) => chat.doc_id === docId
                );
                if (index !== -1) {
                  this.DataStore.data_chat[index] = { ...docData, doc_id: docId };
                }
              } else if (change.type === "removed") {
                const index = this.DataStore.data_chat.findIndex(
                  (chat) => chat.doc_id === docId
                );
                if (index !== -1) {
                  this.DataStore.data_chat.splice(index, 1);
                }
              }
            });

            this.DataStore.data_chat.sort((a, b) => {
              const aTimestamp =
                (a.lastUpdated?.seconds || 0) * 1000 +
                (a.lastUpdated?.nanoseconds || 0) / 1000000;
              const bTimestamp =
                (b.lastUpdated?.seconds || 0) * 1000 +
                (b.lastUpdated?.nanoseconds || 0) / 1000000;
              return bTimestamp - aTimestamp;
            });

            this.loading = false;
            this.getLastMessage();
          },
          (error) => {
            this.loading = false;
            APIinterface.notify("dark", error.message || error, "error", this.$q);
          }
        );
      } catch (error) {
        APIinterface.notify("dark", error, "error", this.$q);
      }
    },
    showSearch() {
      this.$refs.chat_search.dialog = true;
    },
    loadConversation(docId) {
      this.$router.push({
        path: "/account/chat/conversation",
        query: { doc_id: docId },
      });
    },
    formatUserType(userType) {
      const type = `${userType || ""}`.toLowerCase();
      if (type === "merchant") return this.$t("Restaurant");
      if (type === "admin") return this.$t("Support");
      if (type === "driver") return this.$t("Driver");
      if (type === "customer") return this.$t("Customer");
      return userType || this.$t("Chat");
    },
    async getLastMessage() {
      try {
        if (Object.keys(this.all_users).length > 0) {
          const batch = this.all_users.splice(0, 10);
          const conversationsRef = collection(
            firebaseDb,
            firebaseCollectionEnum.chats
          );
          const querySnapshot = await getDocs(
            query(
              conversationsRef,
              where("participants", "array-contains-any", batch)
            )
          );
          querySnapshot.forEach(async (doc) => {
            const conversationID = doc.id;
            const messagesRef = collection(
              firebaseDb,
              firebaseCollectionEnum.chats,
              conversationID,
              "messages"
            );
            const messagesSnapshot = await getDocs(
              query(
                messagesRef,
                orderBy("timestamp", "desc"),
                limit(1)
              )
            );
            messagesSnapshot.forEach((messageDoc) => {
              let results = messageDoc.data();
              let timestamp = results.timestamp.toDate().toISOString();
              this.DataStore.last_message_data[conversationID] = {
                message: results.message,
                timestamp: timestamp,
                time: date.formatDate(timestamp, "HH:mm"),
              };
            });
          });
        }
      } catch (error) {
        console.error("Error fetching last message:", error);
      }
    },
    //
  },
};
</script>

<style lang="scss">
.tagam-account-chat-main-page {
  min-height: 100%;
  background:
    radial-gradient(circle at 18% 0, rgba(255, 90, 47, 0.08), transparent 220px),
    linear-gradient(180deg, var(--tagam-bg-soft) 0, var(--tagam-bg) 340px);
}

.tagam-chat-list {
  display: grid;
  gap: 12px;
}

.tagam-chat-list-item {
  min-height: 86px;
  padding: 14px;
  border: 1px solid var(--tagam-border);
  border-radius: 22px;
  background: var(--tagam-surface);
  box-shadow: var(--tagam-shadow-soft);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.tagam-chat-list-item:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 90, 47, 0.22);
  box-shadow: var(--tagam-shadow);
}

.tagam-chat-avatar {
  width: 54px;
  height: 54px;
  border: 1px solid var(--tagam-border);
  box-shadow: var(--tagam-shadow-soft);
}

.tagam-chat-name {
  color: var(--tagam-text);
  font-size: 16px;
  line-height: 1.16;
  font-weight: 900;
}

.tagam-chat-meta {
  margin-top: 3px;
  color: var(--tagam-text-subtle);
  font-size: 12px;
  font-weight: 760;
}

.tagam-chat-preview {
  margin-top: 6px;
  color: var(--tagam-text-muted);
  font-size: 13px;
  line-height: 1.3;
  font-weight: 650;
}

.tagam-chat-empty {
  margin-top: 22vh;
  padding: 28px 22px;
  text-align: center;
  border: 1px solid var(--tagam-border);
  border-radius: 28px;
  background: var(--tagam-surface);
  box-shadow: var(--tagam-shadow);
}

.tagam-chat-loading {
  color: var(--tagam-text-muted);
}
</style>






