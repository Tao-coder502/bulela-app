
/* sw.js - Service Worker for Offline Caching and Cross-Origin Isolation */
const CACHE_NAME = "bulela-static-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/src/main.tsx",
  "/src/index.tsx",
  "/src/index.css",
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
];

self.addEventListener("install", (event) => {
  console.log("[Bulela SW] Installing and pre-caching assets...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[Bulela SW] Activating and cleaning old caches...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip API requests and cross-origin requests (except fonts) to avoid COEP/COOP issues
  if (url.pathname.startsWith('/api') || (url.origin !== self.location.origin && !url.host.includes('fonts.googleapis.com'))) {
    return;
  }

  if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          // Do not modify responses that are already correct or opaque (status 0)
          if (!response || response.status === 0) {
            return response;
          }

          // Create new headers based on existing ones
          const newHeaders = new Headers(response.headers);
          
          // Essential headers for SharedArrayBuffer and Hardware Acceleration
          newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
          newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

          const modifiedResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });

          // Update cache with the new response
          if (event.request.method === "GET") {
            const responseToCache = modifiedResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return modifiedResponse;
        })
        .catch((error) => {
          console.error("[Bulela SW] Fetch failed:", error);
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
