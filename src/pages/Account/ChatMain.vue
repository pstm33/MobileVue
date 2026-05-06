<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      :class="{
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
        'border-bottom': !isScrolled,
        'shadow-bottom': isScrolled,
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
        <q-toolbar-title class="text-subtitle2 text-weight-bold">{{
          $t("Live Chat")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page>
      <q-scroll-observer @scroll="onScroll" />

      <template v-if="loading">
        <div class="absolute-center flex flex-center q-gutter-x-sm">
          <q-spinner-ios size="sm" />
          <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
        </div>
      </template>
      <template v-else-if="hasData">
        <q-list separator class="q-pl-md q-pr-md">
          <template v-for="items in getData" :key="items">
            <template v-if="items.to_info">
              <q-item
                class="q-pl-none q-pr-none"
                clickable
                @click="loadConversation(items.doc_id)"
              >
                <q-item-section avatar>
                  <q-avatar v-if="items.to_info">
                    <img :src="items?.to_info?.photo" />
                  </q-avatar>
                  <q-avatar v-else color="grey-5" text-color="white">
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-subtitle2">
                    {{ items?.to_info?.first_name }}
                    {{ items?.to_info?.last_name }}
                  </q-item-label>
                  <q-item-label caption>
                    <template v-if="items.orderID">
                      {{ $t("Order#") }} {{ items.orderID }}
                    </template>
                    <template v-else>
                      <template v-if="items.to_info">
                        {{ items.to_info.user_type }}
                      </template>
                    </template>
                  </q-item-label>
                  <q-item-label caption lines="2">
                    <template v-if="items.is_typing">
                      <span class="text-primary">
                        {{ $t("is typing") }} ...</span
                      >
                    </template>
                    <template v-else-if="getLastMessageData[items.doc_id]">
                      {{ getLastMessageData[items.doc_id]?.message }} &bull;
                      {{ getLastMessageData[items.doc_id]?.time }}
                    </template>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon :name="iconRight" color="grey"></q-icon>
                </q-item-section>
              </q-item>
            </template>
          </template>
        </q-list>
      </template>
      <template v-else> not found </template>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
        v-if="!this.$q.capacitor"
      >
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
      if (this.DataStore.data_chat) {
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
          orderBy("lastUpdated", "desc"),
          limit(firebaseCollectionEnum.limit)
        );
        this.unsubscribe = onSnapshot(q, (snapshot) => {
          if (!APIinterface.empty(this.refresh_page)) {
            this.refresh_page();
          }

          snapshot.docChanges().forEach((change) => {
            //console.log("change.type", change.type);
            let data = change.doc.data();
            const docId = change.doc.id;

            let isTyping = data.isTyping || null;
            let participants = data.participants || null;

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
        });
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
                where("senderID", "in", batch),
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
                time: date.formatDate(timestamp, "hh:mm a"),
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
