<template>
  <q-header
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
    }"
  >
    <q-toolbar class="myshadow-1">
      <q-btn
        @click="$router.back()"
        flat
        round
        dense
        icon="eva-arrow-back-outline"
        :color="$q.dark.mode ? 'white' : 'dark'"
      />
      <template v-if="getChatWith">
        <q-avatar>
          <img :src="getChatWith.photo" />
        </q-avatar>
        <q-toolbar-title class="text-weight-bold text-subtitle2">
          {{ getChatWith.first_name }}
          {{ getChatWith.last_name }}</q-toolbar-title
        >
      </template>
    </q-toolbar>
  </q-header>
  <q-page class="flex items-stretch content-end q-pa-md">
    <div style="width: 100%; max-width: 400px">
      <q-inner-loading
        :showing="loading"
        size="md"
        color="primary"
        :label="$t('Please wait')"
        label-class="text-dark"
        label-style="font-size: 1em"
      >
      </q-inner-loading>

      <template v-for="items in getChatmessage" :key="items">
        <template v-if="items.messageType == 'audio'">
          <q-chat-message
            :name="items.senderID == user_uuid ? $t('You') : items.sender"
            :avatar="items.photo"
            :stamp="items.time"
            :text-color="items.senderID == user_uuid ? 'white' : 'dark'"
            :bg-color="items.senderID == user_uuid ? 'blue' : 'grey-2'"
            :sent="items.senderID == user_uuid ? true : false"
          >
            <template #avatar>
              <q-avatar class="q-ml-sm">
                <q-img
                  :src="items.photo"
                  spinner-size="sm"
                  spinner-color="primary"
                  style="height: 48px; max-width: 48px; min-width: 48px"
                  fit="cover"
                  loading="lazy"
                ></q-img>
              </q-avatar>
            </template>
            <div style="min-width: 250px; max-width: 300px">
              <AudioPlayback
                :audio_path="items.fileUrl"
                :show_media="true"
                :layout="items.senderID == user_uuid ? 1 : 0"
                :uploading_status="upload_audio_loading"
              ></AudioPlayback>
            </div>
          </q-chat-message>
        </template>
        <template v-else>
          <q-chat-message
            :name="items.senderID == user_uuid ? $t('You') : items.sender"
            :avatar="items.photo"
            :stamp="items.time"
            :text-color="items.senderID == user_uuid ? 'white' : 'dark'"
            :bg-color="items.senderID == user_uuid ? 'blue' : 'grey-2'"
            :sent="items.senderID == user_uuid ? true : false"
          >
            <template #avatar>
              <q-avatar class="q-ml-sm">
                <q-img
                  :src="items.photo"
                  spinner-size="sm"
                  spinner-color="primary"
                  style="height: 48px; max-width: 48px; min-width: 48px"
                  fit="cover"
                  loading="lazy"
                ></q-img>
              </q-avatar>
            </template>
            <div v-if="items.message">{{ items.message }}</div>
            <template v-if="items.fileUrl">
              <q-img
                :src="items.fileUrl"
                spinner-size="sm"
                spinner-color="primary"
                style="min-height: 150px; min-width: 150px; max-width: 150px"
              >
              </q-img>
            </template>
          </q-chat-message>
        </template>
      </template>

      <template v-for="(items, userUUID) in getUserTyping" :key="items">
        <template v-if="items">
          <template v-if="userUUID != user_uuid">
            <template v-if="getChatWith">
              <q-chat-message
                :name="`${getChatWith.first_name} ${this.$t('is typing...')}`"
                :avatar="getChatWith.photo"
                :text-color="userUUID == user_uuid ? 'white' : 'dark'"
                bg-color="amber"
                :sent="userUUID == user_uuid ? true : false"
              >
                <q-spinner-dots size="2rem" />
              </q-chat-message>
            </template>
          </template>
        </template>
      </template>
    </div>
    <div ref="scroll_ref" class="text-white q-pa-sm"></div>
  </q-page>
  <q-footer
    v-if="hasConversation"
    class="bg-white text-dark q-pl-sm q-pr-sm border-grey"
  >
    <template v-if="is_recording">
      <div class="q-pa-sm">
        <AudioRecorder
          ref="ref_audio"
          @cancel-recording="cancelRecording"
          @start-upload="startUpload"
        ></AudioRecorder>
      </div>
    </template>
    <template v-else>
      <q-uploader
        :url="chat_api_url"
        multiple
        ref="uploader"
        flat
        accept=".jpg, image/*"
        max-total-size="10485760"
        field-name="file"
        @added="afterAddedFiles"
        @removed="afterRemoveFiles"
        @rejected="onRejectedFiles"
        @uploading="onUploadingFiles"
        @uploaded="afterUploaded"
        @finish="afterFinishUpload"
      >
        <template v-slot:header>
          <q-uploader-add-trigger></q-uploader-add-trigger>
        </template>
        <template v-slot:list="scope">
          <div class="flex justify-start q-col-gutter-x-md">
            <template v-for="file in scope.files" :key="file.__key">
              <div class="relative-position">
                <img
                  :src="file.__img.src"
                  style="max-width: 60px; height: 60px"
                  class="radius10"
                />
                <div
                  class="absolute-right"
                  style="margin-right: -10px; margin-top: -5px"
                >
                  <q-btn
                    unelevated
                    round
                    color="blue"
                    icon="close"
                    size="xs"
                    @click="scope.removeFile(file)"
                  ></q-btn>
                </div>
              </div>
            </template>
          </div>
        </template>
      </q-uploader>

      <q-input
        color="blue"
        v-model="message"
        :label="$t('Your message')"
        ref="message"
        autogrow
        borderless
      >
        <template v-slot:append>
          <div class="q-gutter-sm">
            <q-btn
              unelevated
              round
              :color="$q.dark.mode ? 'grey600' : 'mygrey'"
              :text-color="$q.dark.mode ? 'grey300' : 'grey'"
              @click="pickFiles"
              dense
            >
              <q-icon name="attach_file" class="rotate-45"></q-icon>
            </q-btn>

            <q-btn
              unelevated
              round
              :color="$q.dark.mode ? 'grey600' : 'mygrey'"
              :text-color="$q.dark.mode ? 'grey300' : 'grey'"
              dense
            >
              <q-icon name="emoji_emotions"></q-icon>
              <q-popup-proxy ref="proxy">
                <q-card>
                  <EmojiPicker
                    :native="true"
                    @select="onSelectEmoji"
                    :disable-skin-tones="true"
                  />
                </q-card>
              </q-popup-proxy>
            </q-btn>

            <!-- :disabled="!hasMessage" -->
            <q-btn
              @click="onSubmit"
              color="green"
              :icon="hasMessage ? 'send' : 'eva-mic-outline'"
              no-caps
              size="md"
              class="text-weight-bold"
              round
              unelevated
            >
            </q-btn>
          </div>
        </template>
      </q-input>
    </template>
  </q-footer>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { scroll } from "quasar";
const { getScrollTarget, setVerticalScrollPosition } = scroll;
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";
import insertTextAtCursor from "insert-text-at-cursor";
import { firebaseDb, firebaseCollectionEnum } from "src/boot/FirebaseChat";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import auth from "src/api/auth";
import APIinterface from "src/api/APIinterface";
import { date } from "quasar";
import config from "src/api/config";
import { useDataStore } from "stores/DataStore";
import { api } from "boot/axios";
import { VoiceRecorder } from "capacitor-voice-recorder";
import { App } from "@capacitor/app";
import {
  NativeSettings,
  AndroidSettings,
  IOSSettings,
} from "capacitor-native-settings";

export default {
  name: "ChatConversation",
  components: {
    EmojiPicker,
    AudioRecorder: defineAsyncComponent(() =>
      import("components/AudioRecorder.vue")
    ),
    AudioPlayback: defineAsyncComponent(() =>
      import("components/AudioPlayback.vue")
    ),
  },
  data() {
    return {
      message: "",
      loading: false,
      conversation_id: "",
      data: [],
      user_typing_data: [],
      chating_with_user_uuid: "",
      user_uuid: "",
      user_data: [],
      participants: [],
      main_user_type: "",
      loading_user: true,
      is_typing: false,
      files: {},
      file_url: "",
      file_type: "",
      upload_loading: false,
      chat_api_url: config.api_base_url + "/chatapi/uploadimage",
      participant_user_uuid: "",
      order_id: "",
      from_info: null,
      to_info: null,
      SnapMessages: null,
      SnapWhoistyping: null,
      is_recording: false,
      audioPath: null,
      audioBase64: null,
      upload_response: null,
      upload_audio_loading: false,
      mimeType: null,
      respPermission: null,
      respRequestPermission: null,
    };
  },
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  mounted() {
    this.conversation_id = this.$route.query.doc_id;
    let added = this.$route.query.added;
    if (!APIinterface.empty(added)) {
      this.DataStore.data_chat = null;
    }
    let user = auth.getUser();
    console.log("user", user);
    this.user_data = {
      client_uuid: user.client_uuid,
      photo: user.avatar,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: "customer",
    };
    this.user_uuid = user.client_uuid;
    this.getMessages();
    this.getParticipant();
    this.getWhoIsTyping();
    this.getDocumentDetails();

    //this.initWave();
  },
  unmounted() {
    if (this.SnapMessages) {
      this.SnapMessages();
    }
    if (this.SnapWhoistyping) {
      this.SnapWhoistyping();
    }
  },
  computed: {
    getChatWith() {
      let matchedInfo = null;
      if (this.from_info && this.to_info) {
        if (this.from_info.client_uuid === this.user_uuid) {
          matchedInfo = this.to_info;
        } else if (this.to_info.client_uuid === this.user_uuid) {
          matchedInfo = this.from_info;
        }
      }
      return matchedInfo;
    },
    getChatmessage() {
      return this.data;
    },
    hasMessageOld() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    hasMessage() {
      if (!APIinterface.empty(this.message)) {
        return true;
      }
      if (Object.keys(this.files).length > 0) {
        return true;
      }
      return false;
    },
    hasChatDocID() {
      if (!empty(this.chating_with_user_uuid)) {
        return true;
      }
      return false;
    },
    hasUserData() {
      if (Object.keys(this.user_data).length > 0) {
        return true;
      }
      return false;
    },
    getUserData() {
      return this.user_data;
    },
    getUserTyping() {
      return this.user_typing_data;
    },
    hasConversation() {
      if (!APIinterface.empty(this.conversation_id)) {
        return true;
      }
      return false;
    },
  },
  watch: {
    is_typing(newval, oldval) {
      if (newval) {
        this.UpdateWhoistyping(true);
      } else {
        this.UpdateWhoistyping(false);
      }
    },
    message(newval, oldval) {
      if (!this.is_typing) {
        setTimeout(() => {
          this.is_typing = false;
        }, 1000); // 2.5 sec delay
      }
      this.is_typing = true;
    },
  },
  methods: {
    scrollTobottom() {
      try {
        setTimeout(() => {
          let el = this.$refs.scroll_ref;
          if (!APIinterface.empty(el)) {
            const target = getScrollTarget(el);
            const offset = el.offsetTop;
            const duration = 1;
            setVerticalScrollPosition(target, offset, duration);
          }
        }, 500);
      } catch (error) {
        console.log(error);
      }
    },
    onSelectEmoji(emoji) {
      insertTextAtCursor(document.querySelector("textarea"), emoji.i);
      this.$refs.proxy.hide();
    },
    getMessages() {
      this.loading = true;
      const chatDocRef = doc(
        firebaseDb,
        firebaseCollectionEnum.chats,
        this.conversation_id
      );
      const messagesQuery = query(
        collection(chatDocRef, "messages"),
        orderBy("timestamp", "asc")
      );

      this.SnapMessages = onSnapshot(
        messagesQuery,
        (querySnapshot) => {
          this.data = [];
          this.loading = false;
          querySnapshot.forEach((doc) => {
            if (doc.exists()) {
              const message = doc.data();
              let timestamp = message.timestamp.toDate().toISOString();
              this.data.push({
                messageType: message.messageType,
                fileType: message.fileType,
                fileUrl: message.fileUrl,
                message: message.message,
                senderID: message.senderID,
                timestamp: timestamp,
                time: date.formatDate(timestamp, "hh:mm a"),
                sender: message.sender,
                photo: message.photo,
              });
            }
          });
          this.scrollTobottom();
        },
        (error) => {
          this.loading = false;
          console.error("Error fetching messages:", error);
        }
      );
    },
    getWhoIsTyping() {
      const chatDocRef = doc(
        firebaseDb,
        firebaseCollectionEnum.chats,
        this.conversation_id
      );
      this.SnapWhoistyping = onSnapshot(
        chatDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            let results = docSnapshot.data();
            this.user_typing_data = results.isTyping || [];
            this.from_info = results.from_info || null;
            Object.entries(this.user_typing_data).forEach(
              ([userIID, isTYping]) => {
                if (isTYping && userIID != this.user_uuid) {
                  this.scrollTobottom();
                }
              }
            );
          } else {
            this.user_typing_data = [];
          }
        },
        (error) => {
          console.error("Error fetching chat document:", error);
        }
      );
    },
    async getParticipant() {
      try {
        const docRef = doc(
          firebaseDb,
          firebaseCollectionEnum.chats,
          this.conversation_id
        );
        const dataSnapshot = await getDoc(docRef);
        if (dataSnapshot.exists()) {
          const data = dataSnapshot.data();
          this.to_info = data.to_info || null;
          this.participants = data.participants || null; // dataSnapshot.data().participants;

          let resp_participants = this.participants.filter(
            (i) => !i.includes(this.user_uuid)
          );
          this.participant_user_uuid = resp_participants[0]
            ? resp_participants[0]
            : null;
        } else {
          console.log("Conversation document does not exist");
        }
      } catch (error) {
        console.error("Error getting participants:", error);
      }
    },
    async UpdateWhoistyping(data) {
      try {
        const docRef = doc(
          firebaseDb,
          firebaseCollectionEnum.chats,
          this.conversation_id
        );
        await updateDoc(docRef, {
          [`isTyping.${this.user_uuid}`]: data,
        });
      } catch (error) {
        console.error("Error updating typing status:", error);
      }
    },
    async onSubmit() {
      if (!this.hasMessage) {
        this.checkPermissionAndStartAudio();
        return;
      }

      if (Object.keys(this.files).length > 0) {
        this.$refs.uploader.upload();
      } else {
        this.saveChatMessage();
      }
    },
    async checkPermissionAndStartAudio() {
      try {
        const resultAudiopermission =
          await VoiceRecorder.hasAudioRecordingPermission();

        if (resultAudiopermission.value) {
          this.RecordAudio();
          return;
        }

        if (!resultAudiopermission.value) {
          const resultRequestpermission =
            await VoiceRecorder.requestAudioRecordingPermission();

          if (resultRequestpermission.value) {
            this.RecordAudio();
            return;
          }

          if (!resultRequestpermission.value) {
            this.showOpenSettings();
          }
        }
      } catch (error) {
        APIinterface.notify("dark", error, "error", this.$q);
      }
    },
    showOpenSettings() {
      this.$q
        .dialog({
          title: "Access",
          message: this.$t("microphone_access"),
          cancel: true,
          persistent: true,
          ok: {
            flat: true,
            unelevated: true,
            label: this.$t("Okay"),
            size: "18px",
            "no-caps": true,
          },
          cancel: {
            flat: true,
            unelevated: true,
            label: this.$t("No"),
            size: "18px",
            color: "dark",
            "no-caps": true,
          },
        })
        .onOk(async () => {
          const info = await App.getInfo();
          const packageName = info.id;
          NativeSettings.open({
            optionAndroid: AndroidSettings.ApplicationDetails,
            optionIOS: IOSSettings.App,
          });
        })
        .onOk(() => {})
        .onCancel(() => {})
        .onDismiss(() => {});
    },
    async saveChatMessage() {
      this.loading = true;
      const messagesRef = collection(
        firebaseDb,
        firebaseCollectionEnum.chats,
        this.conversation_id,
        "messages"
      );
      try {
        let data = {
          messageType: "text",
          message: this.message,
          senderID: this.user_uuid,
          timestamp: Timestamp.now(),
          serverTimestamp: serverTimestamp(),
          fileUrl: this.file_url,
          fileType: this.file_type,
          sender: this.user_data.first_name,
          senderID: this.user_data.client_uuid,
          photo: this.user_data.photo,
        };
        await addDoc(messagesRef, data);
        this.loading = false;
        this.documentLastUpdate(this.conversation_id);
        this.resetChat();
        this.notifyUser();
      } catch (error) {
        console.error("Error adding message to the conversation:", error);
        APIinterface.notify("dark", error, "error", this.$q);
      }
    },
    async documentLastUpdate(doc_id) {
      try {
        const chatRef = doc(firebaseDb, firebaseCollectionEnum.chats, doc_id);
        await updateDoc(chatRef, {
          lastUpdated: serverTimestamp(),
        });
      } catch (error) {
        APIinterface.notify("dark", error, "error", this.$q);
      }
    },
    resetChat() {
      this.message = "";
      this.file_url = "";
      this.file_type = "";
      this.files = {};
      this.$refs.uploader.reset();
    },
    pickFiles() {
      this.$refs.uploader.pickFiles();
    },
    onRejectedFiles(data) {
      APIinterface.notify(
        "dark",
        this.$t("Invalid file type"),
        "error",
        this.$q
      );
    },
    afterAddedFiles(data) {
      Object.entries(data).forEach(([key, items]) => {
        this.files[items.name] = {
          name: items.name,
        };
      });
    },
    afterRemoveFiles(data) {
      Object.entries(data).forEach(([key, items]) => {
        delete this.files[items.name];
      });
    },
    onUploadingFiles(data) {
      this.upload_loading = true;
    },
    afterUploaded(data) {
      if (data.xhr.status == 200) {
        let result = JSON.parse(data.xhr.response);
        let code = result.code || false;
        let details = result.details || [];
        let message = result.msg || "";
        if (code == 1) {
          this.file_url = details.file_url;
          this.file_type = details.file_type;
          this.saveChatMessage();
        } else {
          APIinterface.notify("dark", message, "error", this.$q);
          this.$refs.uploader.reset();
        }
      } else {
        APIinterface.notify(
          "dark",
          this.$t("Error uploading files"),
          "error",
          this.$q
        );
        this.$refs.uploader.reset();
      }
    },
    afterFinishUpload() {
      this.upload_loading = false;
    },
    notifyUser() {
      console.log("notifyUser", this.to_info);
      APIinterface.fetchDataChats("notifyChatUser", {
        to: this.to_info.client_uuid,
        from: this.user_data.client_uuid,
        first_name: this.user_data.first_name,
        last_name: this.user_data.last_name,
        conversation_id: this.conversation_id,
      })
        .then((data) => {})
        .catch((error) => {})
        .then((data) => {});
    },
    async getDocumentDetails() {
      const docRef = doc(
        firebaseDb,
        firebaseCollectionEnum.chats,
        this.conversation_id
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.order_id = docSnap.data().orderID;
      } else {
        this.order_id = "";
      }
    },
    RecordAudio() {
      this.is_recording = true;
    },
    cancelRecording() {
      this.is_recording = false;
    },
    startUpload(audioPath, audioBase64, mimeType) {
      this.is_recording = false;
      this.audioPath = audioPath;
      this.audioBase64 = audioBase64;
      this.mimeType = mimeType;
      this.data.push({
        messageType: "audio",
        message: "",
        senderID: this.user_uuid,
        timestamp: Timestamp.now(),
        serverTimestamp: serverTimestamp(),
        fileUrl: this.audioPath,
        fileType: this.mimeType,
        sender: this.user_data.first_name,
        senderID: this.user_data.client_uuid,
        photo: this.user_data.photo,
      });
      this.UploadFile();
    },
    async UploadFile() {
      try {
        if (!this.audioBase64) {
          console.error("No audio file to upload");
          return;
        }

        this.upload_audio_loading = true;

        const data = {
          audioBase64: this.audioBase64,
          fileName: `recording_${Date.now()}.m4a`,
        };

        const response = await api.post(
          `${config.api_base_url}/interface/uploadaudio`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        this.upload_audio_loading = false;
        this.upload_response = response.data;
        if (response.data.code == 1) {
          this.saveChatAudio();
        } else {
          APIinterface.notify("dark", response.data.msg, "error", this.$q);
        }
      } catch (error) {
        this.upload_response = "Failed to upload audio =>" + error.message;
      }
    },
    async saveChatAudio() {
      try {
        const messagesRef = collection(
          firebaseDb,
          firebaseCollectionEnum.chats,
          this.conversation_id,
          "messages"
        );
        let data = {
          messageType: "audio",
          message: this.message,
          senderID: this.user_uuid,
          timestamp: Timestamp.now(),
          serverTimestamp: serverTimestamp(),
          fileUrl: this.upload_response.details.file_url,
          fileType: this.mimeType,
          sender: this.user_data.first_name,
          photo: this.user_data.photo,
        };
        await addDoc(messagesRef, data);
        this.loading = false;
        this.documentLastUpdate(this.conversation_id);
        this.resetChat();
        this.notifyUser();
      } catch (error) {
        console.error("Error adding message to the conversation:", error);
      }
    },
    //
  },
};
</script>
<style lang="scss">
.q-uploader__list {
  min-height: auto !important;
}
</style>
