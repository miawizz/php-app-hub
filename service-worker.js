// service-worker.js

const CACHE_NAME = "playful-heart-hub-v1";

const ASSETS = [
  // Hub shell
  "/play-hub/",
  "/play-hub/index.html",
  "/play-hub/manifest.json",
  "/play-hub/icons/play-hub-192.png",
  "/play-hub/icons/play-hub-512.png",

  // You can optionally pre-cache the main entry point of each game
  "/WYR/index.html",
  "/you-are/index.html",
  "/who-can-sound-like/index.html",
  "/plot-twist/index.html"
  // Add other app entry files here if you want them pre-cached
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(error => {
        console.log("Cache addAll failed", error);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Simple cache first strategy with network fallback
self.addEventListener("fetch", event => {
  const request = event.request;

  // Only handle same-origin GET requests
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then(networkResponse => {
          // Cache the new response for future offline use
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone);
          });
          return networkResponse;
        })
        .catch(() => {
          // Fallback can be improved later, for now return a basic response
          return new Response("You appear to be offline. Try again when you are back online.", {
            headers: { "Content-Type": "text/plain" }
          });
        });
    })
  );
});
