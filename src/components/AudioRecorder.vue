<template>
  <div class="hidden">
    is_recording=>{{ is_recording }} audioPath=>{{ audioPath }} hasAudio=>{{
      hasAudio
    }}

    is_playback=>{{ is_playback }} showMedia=>{{
      showMedia
    }}
    recordingStatus=>{{ recordingStatus }}
  </div>

  <AudioPlayback
    :audio_path="audioPath"
    :show_media="showMedia"
    layout="2"
  ></AudioPlayback>

  <div
    class="text-center text-subtitle1 flex flex-center"
    style="height: 50px"
    :class="{ hidden: showMedia }"
  >
    {{ formattedTime }}
  </div>

  <div class="row items-center text-center">
    <div class="col-2 borderx">
      <q-btn
        icon="eva-trash-2-outline"
        size="md"
        flat
        round
        @click="stopRecording"
      ></q-btn>
    </div>
    <div class="col borderx">
      <q-btn
        :icon="is_recording ? 'eva-pause-circle-outline' : 'eva-mic-outline'"
        color="red"
        size="md"
        flat
        round
        @click="toogleRecording"
      ></q-btn>
    </div>
    <div class="col-2 borderx">
      <q-btn
        color="green"
        icon="send"
        no-caps
        size="md"
        class="text-weight-bold"
        round
        unelevated
        @click="UploadAudio"
      >
      </q-btn>
    </div>
  </div>
</template>

<script>
import { VoiceRecorder } from "capacitor-voice-recorder";
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "AudioRecorder",
  components: {
    AudioPlayback: defineAsyncComponent(() =>
      import("components/AudioPlayback.vue")
    ),
  },
  data() {
    return {
      is_recording: false,
      audioPath: null,
      audioBase64: null,
      has_permission: false,
      timer: 0,
      interval: null,
      duration: null,
      current_time: null,
      is_playback: false,
      is_uploading: false,
      mimeType: null,
      testData: null,
      recordingStatus: null,
    };
  },
  mounted() {
    this.toogleRecording();
    //this.initWave();
  },
  unmounted() {},
  computed: {
    showMedia() {
      if (!this.is_recording && this.hasAudio && !this.is_uploading) {
        return true;
      }
      return false;
    },
    formattedTime() {
      const minutes = Math.floor(this.timer / 60);
      const seconds = this.timer % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    },
    hasAudio() {
      if (!APIinterface.empty(this.audioBase64)) {
        return true;
      }
      return false;
    },
    getPlayTime() {
      if (!this.is_playback) {
        return this.duration;
      }
      return this.current_time;
    },
  },
  methods: {
    async UploadAudio() {
      if (this.is_recording) {
        this.stopTimer();
        const resultsStoprecording = await VoiceRecorder.stopRecording();
        if (
          resultsStoprecording.value &&
          resultsStoprecording.value.recordDataBase64
        ) {
          //
          this.audioBase64 = resultsStoprecording.value.recordDataBase64;
          this.mimeType = resultsStoprecording.value.mimeType;
          this.recordingStatus = null;
          this.convertBase64ToAudio();
        }
      }
      this.is_uploading = true;
      this.$emit(
        "startUpload",
        this.audioPath,
        this.audioBase64,
        this.mimeType
      );
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    },
    async toogleRecording() {
      try {
        if (!this.is_recording) {
          this.audioPath = null;
          this.audioBase64 = null;
          const resultsRecording = await VoiceRecorder.startRecording();
          if (resultsRecording.value) {
            this.recordingStatus = "recording";
          }
          this.startTimer();
        } else {
          this.stopTimer();
          const resultsStoprecording = await VoiceRecorder.stopRecording();
          if (
            resultsStoprecording.value &&
            resultsStoprecording.value.recordDataBase64
          ) {
            //
            this.audioBase64 = resultsStoprecording.value.recordDataBase64;
            this.mimeType = resultsStoprecording.value.mimeType;
            this.recordingStatus = null;
            this.convertBase64ToAudio();
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    },
    convertBase64ToAudio() {
      const binary = atob(this.audioBase64);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      const audioBlob = new Blob([new Uint8Array(array)], {
        type: "audio/wav",
      });
      this.audioPath = URL.createObjectURL(audioBlob);
    },
    async stopRecording() {
      if (this.is_recording) {
        this.stopTimer();
        this.is_recording = false;
        await VoiceRecorder.stopRecording();
        this.audioPath = null;
        this.audioBase64 = null;
        this.recordingStatus = null;
      }
      this.$emit("cancelRecording");
    },
    startTimer() {
      this.timer = 0;
      this.is_recording = true;
      this.interval = setInterval(() => {
        this.timer++;
      }, 1000);
    },
    stopTimer() {
      this.is_recording = false;
      clearInterval(this.interval);
      this.timer = 0;
      this.interval = null;
    },
    //
  },
};
</script>
