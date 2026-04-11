const CACHE_NAME = 'notula-cache-v2';
const urlsToCache = ['index.html', 'icon.jpg', 'manifest.json'];

self.addEventListener('install', event => {
  self.skipWaiting(); // Memaksa browser langsung memakai versi terbaru
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache gagal, tapi SW tetap jalan:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => console.log('Fetch offline'));
    })
  );
});