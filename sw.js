const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Event Install: Menyimpan aset ke Cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache berhasil diinstal');
        return cache.addAll(urlsToCache);
      })
  );
});

// Event Fetch: Mengambil dari Cache jika offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika ada di cache, gunakan cache. Jika tidak, ambil dari jaringan.
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
