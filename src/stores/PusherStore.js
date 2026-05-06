import { defineStore } from "pinia";
import Pusher from "pusher-js";

export const usePusherStore = defineStore("pusher", {
  state: () => ({
    pusherInstance: null,
    channels: {},
  }),

  getters: {},

  actions: {
    async init(pusherSettings) {
      if (this.pusherInstance || !pusherSettings) return;
      const pusher_key = pusherSettings?.pusher_key || null;
      const pusher_cluster = pusherSettings?.pusher_cluster || null;
      if (!pusher_key) {
        return;
      }
      Pusher.logToConsole = false;
      this.pusherInstance = new Pusher(pusher_key, {
        cluster: pusher_cluster,
      });
    },

    subscribeToChannel(channelName, event, callback) {
      if (!this.pusherInstance) return;

      if (!this.channels[channelName]) {
        this.channels[channelName] = this.pusherInstance.subscribe(channelName);
      }

      this.channels[channelName].bind(event, callback);
    },

    unsubscribeFromChannel(channelName) {
      if (this.pusherInstance && this.channels[channelName]) {
        this.channels[channelName].unbind_all();
        this.pusherInstance.unsubscribe(channelName);
        delete this.channels[channelName];
      }
    },

    disconnect() {
      if (this.pusherInstance) {
        for (const channel in this.channels) {
          this.unsubscribeFromChannel(channel);
        }
        this.pusherInstance.disconnect();
        this.pusherInstance = null;
      }
    },
    //
  },
});
