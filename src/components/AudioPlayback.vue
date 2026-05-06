<template>
  <div class="hidden">
    <div>file_complete_loading=>{{ file_complete_loading }}</div>
    <div>file_percent=>{{ file_percent }}</div>
    <div>audio_path=>{{ audio_path }}</div>
  </div>
  <div class="relative-position">
    <div
      class="row items-center q-gutter-x-sm"
      :class="{ hidden: !show_media }"
    >
      <div class="col-2">
        <template v-if="!file_complete_loading">
          <q-spinner :color="layout == 1 ? 'white' : 'green'" size="2.5em" />
        </template>
        <template v-else>
          <template v-if="file_error">
            <q-btn
              flat
              icon="error_outline"
              :color="layout == 1 ? 'white' : 'dark'"
            ></q-btn>
          </template>
          <template v-else>
            <q-btn
              flat
              rounded
              :icon="
                is_playback
                  ? 'eva-pause-circle-outline'
                  : 'eva-play-circle-outline'
              "
              size="18px"
              @click="PlayMedia"
              dense
              :color="layout == 1 ? 'white' : 'dark'"
            ></q-btn>
          </template>
        </template>
      </div>
      <div class="col">
        <template v-if="file_error"> </template>
        <div ref="ref_waveform" style="height: 40px"></div>
      </div>
      <div
        class="col-2"
        :class="{ 'text-white': layout == 1, 'text-dark': layout == 2 }"
      >
        {{ getPlayTime }}
      </div>
    </div>
  </div>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import WaveSurfer from "wavesurfer.js";

//let wavesurfer;
export default {
  name: "AudioPlayback",
  props: ["audio_path", "show_media", "layout", "uploading_status"],
  data() {
    return {
      wavesurfer: null,
      is_playback: false,
      duration: null,
      current_time: null,
      file_complete_loading: false,
      file_percent: null,
      file_error: false,
    };
  },
  watch: {
    audio_path(newval, oldval) {
      if (!APIinterface.empty(newval)) {
        this.wavesurfer.load(newval);
        setTimeout(() => {
          this.wavesurfer.seekTo(0);
        }, 100);
      }
    },
  },
  computed: {
    getPlayTime() {
      if (!this.is_playback) {
        return this.duration;
      }
      return this.current_time;
    },
    formattedTime() {
      const minutes = Math.floor(this.timer / 60);
      const seconds = this.timer % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    },
  },
  mounted() {
    this.initWave();
  },
  unmounted() {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }
  },
  methods: {
    initWave() {
      try {
        this.wavesurfer = WaveSurfer.create({
          container: this.$refs.ref_waveform,
          waveColor: this.layout == 1 ? "#ffffff" : "#4F4A85",
          progressColor: this.layout == 1 ? "#ffffff" : "#383351",
          barWidth: 2,
          barGap: 1,
          barRadius: 1,
          height: 40,
        });

        if (this.audio_path) {
          this.wavesurfer.load(this.audio_path);
          setTimeout(() => {
            this.wavesurfer.seekTo(0);
          }, 100);
        }

        this.wavesurfer.on("load", (url) => {
          console.log("Load", url);
          this.file_complete_loading = false;
        });

        this.wavesurfer.on("error", (error) => {
          console.error("Error loading audio:", error);
          this.file_complete_loading = true;
          this.file_error = true;
        });

        this.wavesurfer.on("loading", (percent) => {
          console.log("Loading", percent + "%");
          this.file_percent = percent;
        });

        this.wavesurfer.on("ready", (duration) => {
          console.log("Ready", duration + "s");
          this.duration = this.formatTime(duration);
          this.file_complete_loading = true;
        });
        this.wavesurfer.on("timeupdate", (currentTime) => {
          console.log("Time", currentTime + "s");
          this.current_time = this.formatTime(currentTime);
        });

        this.wavesurfer.on("play", () => {
          console.log("Play");
          this.is_playback = true;
        });
        this.wavesurfer.on("pause", () => {
          console.log("Pause");
          this.is_playback = false;
        });
      } catch (error) {}
    },
    PlayMedia() {
      this.wavesurfer.playPause();
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    },
  },
};
</script>
