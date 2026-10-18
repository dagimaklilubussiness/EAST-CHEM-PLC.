/* East Chem ERP — service worker. Caches the app shell (page, styles,
   scripts, icons) so it opens instantly and still loads the UI with
   no connection. Firestore/Auth/CDN requests always go to the network —
   this never caches your actual business data. */

const CACHE_NAME = "east-chem-erp-v1";
const SHELL_FILES = [
  "erp.html",
  "style.css",
  "erp.js",
  "firebase-config.js",
  "logo.png",
  "favicon.png",
  "icon-192.png",
  "icon-512.png",
  "manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if(event.request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if(response && response.status === 200){
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
