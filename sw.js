const CACHE_NAME = 'notula-cache-v4';
const urlsToCache = ['/index.html', '/icon.jpg', '/manifest.json'];

self.addEventListener('install', event => {
  self.skipWaiting(); // Paksa browser langsung memakai versi ini
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Menggunakan pendekatan aman agar tidak crash jika ada file yang gagal dimuat
      return cache.addAll(urlsToCache).catch(err => console.log('Cache warning:', err));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cache => {
        if (cache !== CACHE_NAME) return caches.delete(cache);
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Kembalikan cache jika ada, jika tidak, ambil dari internet
      return response || fetch(event.request);
    }).catch(() => {
      // Jika offline dan error, paksa buka index.html
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});