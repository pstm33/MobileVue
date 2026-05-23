// src/audioManager.js
import { NativeAudio } from "@capacitor-community/native-audio";

const audioManager = {
  preloadedAssets: {},

  /**
   * Preload an audio asset if not already preloaded.
   * @param {string} assetId - Unique identifier for the audio asset.
   * @param {string} assetPath - Path to the audio file.
   */
  async preload(assetId, assetPath) {
    if (this.preloadedAssets[assetId]) {
      //console.log(`Audio asset "${assetId}" is already preloaded.`);
      return;
    }

    try {
      await NativeAudio.preload({
        assetId,
        assetPath,
      });
      this.preloadedAssets[assetId] = true;
      //console.log(`Audio asset "${assetId}" preloaded successfully.`);
    } catch (error) {
      console.error(
        `Error preloading audio asset "${assetId}":`,
        error.message
      );
    }
  },

  /**
   * Play a preloaded audio asset.
   * @param {string} assetId - Unique identifier for the audio asset.
   */
  async play(assetId) {
    try {
      await NativeAudio.play({ assetId });
      //console.log(`Playing audio asset "${assetId}".`);
    } catch (error) {
      console.error(`Error playing audio asset "${assetId}":`, error.message);
    }
  },

  /**
   * Unload an audio asset.
   * @param {string} assetId - Unique identifier for the audio asset.
   */
  async unload(assetId) {
    if (!this.preloadedAssets[assetId]) {
      //console.log(`Audio asset "${assetId}" is not loaded.`);
      return;
    }

    try {
      await NativeAudio.unload({ assetId });
      delete this.preloadedAssets[assetId];
      //console.log(`Audio asset "${assetId}" unloaded successfully.`);
    } catch (error) {
      console.error(`Error unloading audio asset "${assetId}":`, error.message);
    }
  },
};

export default audioManager;
