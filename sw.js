
/* sw.js - Service Worker for Cross-Origin Isolation */
self.addEventListener("install", () => {
  console.log("[Bulela SW] Installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[Bulela SW] Activating...");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip API requests and cross-origin requests to avoid COEP/COOP issues
  if (url.pathname.startsWith('/api') || url.origin !== self.location.origin) {
    return;
  }

  if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
    return;
  }

  event.respondWith(
    fetch(event.request)
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

        // Return a cloned response with the new headers
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      })
      .catch((error) => {
        // Fallback to original request if processing fails
        return fetch(event.request);
      })
  );
});
