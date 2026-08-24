// service-worker.js

const CACHE_NAME = "silly-moments-v11";

const ASSETS = [
  // Hub shell
  "/php-app-hub/",
  "/php-app-hub/index.html",
  "/php-app-hub/manifest.json",
  "/php-app-hub/icons/icon-192.png",
  "/php-app-hub/icons/icon-512.png",

  // Existing hub tiles
  "/php-app-hub/icons/are-we-there-yet.png",
  "/php-app-hub/icons/plot-twist.png",
  "/php-app-hub/icons/who-can-sound-like.png",
  "/php-app-hub/icons/would-you-rather.png",
  "/php-app-hub/icons/you-are.png",
  "/php-app-hub/icons/act-out-that-sound.png",
  "/php-app-hub/icons/make-this-face.png",
  "/php-app-hub/icons/little-moments-for-big-laughs.png",
  "/php-app-hub/icons/what-should-we-doodle.png",

  // New theme-pack tiles
  "/php-app-hub/dinosaur-icon.png",
  "/php-app-hub/things-that-go-icon.png",
  "/php-app-hub/magic-make-believe-icon.png",
  "/php-app-hub/space-icon.png",
  "/php-app-hub/gross-stuff-icon.png",

  // Existing app entry points
  "/awty-car-games/",
  "/plot-twist/",
  "/who-can-sound-like/",
  "/WYR/",
  "/you-are/",
  "/act-out-that-sound/",
  "/make-this-face/",
  "/LMFBL/",
  "/What-Should-We-Doodle/",

  // New theme-pack entry points
  "/dinosaur-pack/",
  "/things-that-go-pack/",
  "/magic-make-believe-pack/",
  "/space-pack/",
  "/gross-stuff-pack/"
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

self.addEventListener("fetch", event => {
  const request = event.request;

  // Only handle same-origin GET requests
  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  // Pages/navigation:
  // Try the network first so new app updates appear when online.
  // Fall back to the cached version when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          const clone = networkResponse.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone);
          });

          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }

            return caches.match("/php-app-hub/index.html");
          });
        })
    );

    return;
  }

  // Images and other assets:
  // Use cached copy first, then fetch and cache if needed.
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
          return new Response(
            "You appear to be offline. Try again when you are back online.",
            {
              headers: {
                "Content-Type": "text/plain"
              }
            }
          );
        });
    })
  );
});
