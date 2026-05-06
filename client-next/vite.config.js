import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/icon-any.svg", "icons/icon-maskable.svg"],
      manifest: {
        name: "Tagam Next",
        short_name: "TagamNext",
        description: "Portable next-generation client PWA for delivery customers.",
        theme_color: "#101828",
        background_color: "#101828",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-any.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/icons/icon-maskable.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
