const TAGAM_RESCUE_SW_VERSION = "20260605-cache-rescue";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }

      await self.clients.claim();
      await self.registration.unregister();

      const clientsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      clientsList.forEach((client) => {
        if (client.url) {
          client.navigate(client.url);
        }
      });
    })()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
