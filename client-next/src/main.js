import { createApp } from "vue"
import { createPinia } from "pinia"
import { registerSW } from "virtual:pwa-register"
import App from "./App.vue"
import router from "@/router"
import "@/style.css"

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount("#app")

async function clearLocalPwaState() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return
  }

  const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname)

  if (!import.meta.env.DEV && !isLocalhost) {
    return
  }

  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((registration) => registration.unregister()))

  if ("caches" in window) {
    const cacheKeys = await window.caches.keys()
    await Promise.all(cacheKeys.map((key) => window.caches.delete(key)))
  }
}

clearLocalPwaState().finally(() => {
  if (!import.meta.env.DEV) {
    registerSW({
      immediate: true,
    })
  }
})
