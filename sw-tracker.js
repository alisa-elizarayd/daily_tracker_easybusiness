// Service Worker для Daily Tracker
const CACHE_NAME = 'daily-tracker-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest-tracker.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (
            event.request.method === 'GET' &&
            response.status === 200 &&
            event.request.url.startsWith('http')
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index-3.html');
        }
      })
  );
});
