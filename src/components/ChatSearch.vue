<template>
  <q-dialog
    v-model="dialog"
    persistent
    :maximized="true"
    transition-show="fade"
    transition-hide="fade"
    @before-show="search = ''"
    @before-hide="data = []"
  >
    <q-card class="tagam-chat-search-card">
      <q-toolbar class="tagam-chat-search-toolbar">
        <q-input
          borderless
          v-model="search"
          :placeholder="$t('Search restaurants to start a chat')"
          dense
          color="primary"
          class="tagam-chat-search-input"
          clearable
          clear-icon="close"
          @clear="whenClear"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-space></q-space>
        <q-btn
          flat
          dense
          round
          icon="eva-close-outline"
          v-close-popup
          no-caps
          :color="$q.dark.mode ? 'white' : 'dark'"
        />
      </q-toolbar>

      <q-inner-loading :showing="create_loading" color="primary">
      </q-inner-loading>

      <q-card-section class="q-px-md q-pt-md q-pb-sm">
        <div v-if="hasSearch" class="tagam-chat-search-title">
          <q-icon name="eva-search-outline" size="22px" />
          <span>{{ $t("Search for") }}</span>
          <strong>{{ search }}</strong>
        </div>

        <div v-if="awaitingSearch" class="text-center q-pa-xl tagam-text-muted">
          <q-spinner color="primary" size="2em"> </q-spinner>
        </div>
      </q-card-section>

      <template v-if="hasData && !awaitingSearch">
        <ChatUserList :data="data" @on-chatuser="onChatuser"></ChatUserList>
      </template>
      <template v-else>
        <template v-if="hasSearch && !awaitingSearch">
          <div class="tagam-chat-empty q-mx-md">
            <div class="tagam-empty-icon">
              <q-icon name="eva-search-outline" size="30px" />
            </div>
            <div class="tagam-title-md q-mb-xs">
              {{ $t("No matching records found") }}
            </div>
            <div class="tagam-body-muted">
              {{ $t("Try another restaurant name") }}
            </div>
          </div>
        </template>
      </template>

      <template v-if="!hasSearch">
        <ChatUserList
          :data="DataStore.suggested_data"
          :headerTitle="$t('Suggested Restaurants')"
          @on-chatuser="onChatuser"
        ></ChatUserList>
      </template>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { firebaseDb, firebaseCollectionEnum } from "src/boot/FirebaseChat";
import auth from "src/api/auth";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { useDataStore } from "stores/DataStore";

export default {
  name: "ChatSearch",
  components: {
    ChatUserList: defineAsyncComponent(() =>
      import("components/ChatUserList.vue")
    ),
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  data() {
    return {
      dialog: false,
      search: "",
      is_search: false,
      awaitingSearch: false,
      search_type: ["merchant", "admin"],
      data: [],
      loading: true,
      suggested_data: null,
      main_user_uuid: "",
      from_info: null,
      to_info: null,
      create_loading: false,
    };
  },
  mounted() {
    let user = auth.getUser();
    this.from_info = {
      client_uuid: user.client_uuid,
      first_name: user.first_name,
      last_name: user.last_name,
      photo: user.avatar,
      user_type: "customer",
    };
    this.main_user_uuid = user.client_uuid;
    if (!this.DataStore.suggested_data) {
      this.getSuggestedUser();
    }
  },
  computed: {
    hasSearch() {
      if (!APIinterface.empty(this.search)) {
        return true;
      }
      return false;
    },
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    getData() {
      return this.data;
    },
  },
  watch: {
    search(newsearch, oldsearch) {
      if (!this.awaitingSearch) {
        if (APIinterface.empty(newsearch)) {
          return false;
        }
        setTimeout(() => {
          APIinterface.fetchDataChats("searchChats", {
            search: this.search,
            search_type: this.search_type,
          })
            .then((data) => {
              this.data = data.details;
            })
            .catch((error) => {
              this.data = [];
            })
            .then((data) => {
              this.awaitingSearch = false;
            });
        }, 1000); // 1 sec delay
        this.awaitingSearch = true;
      }
    },
  },
  methods: {
    whenClear() {
      this.data = [];
    },
    getSuggestedUser() {
      this.loading = true;
      APIinterface.fetchDataChats("suggestedUser", {
        search_type: this.search_type,
      })
        .then((data) => {
          this.DataStore.suggested_data = data.details;
        })
        .catch((error) => {
          this.DataStore.suggested_data = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
    async onChatuser(user_uuid, data) {
      this.to_info = data;
      this.to_info.photo = data.photo_url;
      try {
        const collectionRef = collection(
          firebaseDb,
          firebaseCollectionEnum.chats
        );
        const q = query(
          collectionRef,
          where("participants", "array-contains", user_uuid),
          limit(1)
        );

        let current_doc_id = "";
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          let data = doc.data();
          let participants = data.participants || null;
          if (participants.includes(this.main_user_uuid) === true) {
            current_doc_id = doc.id;
          }
        });

        if (!APIinterface.empty(current_doc_id)) {
          this.loadConversation(current_doc_id);
        } else {
          this.createConversation(user_uuid);
        }
      } catch (error) {
        APIinterface.notify("dark", error, "error", this.$q);
      }
    },
    async createConversation(user_uuid) {
      try {
        this.create_loading = true;
        const newConversationRef = await addDoc(
          collection(firebaseDb, firebaseCollectionEnum.chats),
          {
            lastUpdated: serverTimestamp(),
          }
        );
        const chatId = newConversationRef.id;
        const chatDocRef = doc(
          firebaseDb,
          firebaseCollectionEnum.chats,
          chatId
        );

        let main_user_uuid = this.main_user_uuid;

        let data = {
          lastUpdated: serverTimestamp(),
          dateCreated: serverTimestamp(),
          participants: [user_uuid, main_user_uuid],
          isTyping: {
            [`${user_uuid}`]: false,
            [`${main_user_uuid}`]: false,
          },
          from_info: this.from_info,
          to_info: this.to_info,
        };
        // console.log("from_info", this.from_info);
        // console.log("to_info", this.to_info);
        setDoc(chatDocRef, data)
          .then(() => {
            this.create_loading = false;
            this.loadConversation(chatId);
          })
          .catch((error) => {
            this.create_loading = false;
            APIinterface.notify("dark", error, "error", this.$q);
          });
      } catch (error) {
        this.create_loading = false;
        APIinterface.notify("dark", error, "error", this.$q);
      }
    },
    loadConversation(docId) {
      this.$router.push({
        path: "/account/chat/conversation",
        query: { doc_id: docId, added: true },
      });
    },
  },
};
</script>

<style lang="scss">
.tagam-chat-search-card {
  color: var(--tagam-text);
  background:
    radial-gradient(circle at 18% 0, rgba(255, 90, 47, 0.08), transparent 220px),
    linear-gradient(180deg, var(--tagam-bg-soft) 0, var(--tagam-bg) 340px);
}

.tagam-chat-search-toolbar {
  min-height: 76px;
  gap: 10px;
  padding: 12px 16px 8px;
  background: var(--tagam-surface-glass);
  border-bottom: 1px solid var(--tagam-border);
  backdrop-filter: var(--tagam-blur);
}

.tagam-chat-search-input {
  flex: 1;
  min-height: 52px;
  padding-left: 14px;
  padding-right: 6px;
  border: 1px solid var(--tagam-border);
  border-radius: var(--tagam-radius-pill);
  background: var(--tagam-surface);
  box-shadow: var(--tagam-shadow-soft);
}

.tagam-chat-search-input .q-field__control {
  min-height: 52px;
}

.tagam-chat-search-input input {
  color: var(--tagam-text);
  font-weight: 760;
}

.tagam-chat-search-input input::placeholder {
  color: var(--tagam-text-subtle);
}

.tagam-chat-search-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--tagam-text-muted);
  font-size: 13px;
  font-weight: 700;
}

.tagam-chat-search-title strong {
  color: var(--tagam-text);
  font-weight: 900;
}
</style>



