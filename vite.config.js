import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    assetsDir: "pwa-assets",
  },
  server: {
    proxy: {
      "/tagam-api": {
        target: "https://tagam.delivery",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/tagam-api/, ""),
      },
    },
  },
  preview: {
    proxy: {
      "/tagam-api": {
        target: "https://tagam.delivery",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/tagam-api/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      src: fileURLToPath(new URL("./src", import.meta.url)),
      boot: fileURLToPath(new URL("./src/boot", import.meta.url)),
      components: fileURLToPath(new URL("./src/components", import.meta.url)),
      layouts: fileURLToPath(new URL("./src/layouts", import.meta.url)),
      pages: fileURLToPath(new URL("./src/views", import.meta.url)),
    },
  },
});
