// service-worker.js

const CACHE_NAME = "php-app-hub-v1";

const ASSETS = [
  // Hub shell
  "/php-app-hub/",
  "/php-app-hub/index.html",
  "/php-app-hub/manifest.json",
  "/php-app-hub/icons/play-hub-192.png",
  "/php-app-hub/icons/play-hub-512.png",

  // Hub tiles
  "/php-app-hub/icons/are-we-there-yet.png",
  "/php-app-hub/icons/plot-twist.png",
  "/php-app-hub/icons/who-can-sound-like.png",
  "/php-app-hub/icons/would-you-rather.png",
  "/php-app-hub/icons/you-are.png",
  "/php-app-hub/icons/act-out-that-sound.png",
  "/php-app-hub/icons/make-this-face.png",
  "/php-app-hub/icons/little-moments-for-big-laughs.png",

  // Main entry points for each app (these will get deeper assets cached on first use)
  "/awty-car-games/",
  "/plot-twist/",
  "/who-can-sound-like/",
  "/WYR/",
  "/you-are/",
  "/act-out-that-sound/",
  "/make-this-face/",
  "/little-moments/"
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

  // Only handle same origin GET requests
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
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone);
          });
          return networkResponse;
        })
        .catch(() => {
          return new Response("You appear to be offline. Try again when you are back online.", {
            headers: { "Content-Type": "text/plain" }
          });
        });
    })
  );
});
