import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("tagamDesktop", {
  platform: process.platform,
});
