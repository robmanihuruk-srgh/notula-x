const CACHE_NAME = 'notula-x-cache-v1';
const urlsToCache = [
  '/',
  '/index5.html', 
  '/manifest.json',
  '/pic_ (2).jpg'
];

// Event Install: Menyimpan file penting ke cache browser
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache berhasil dibuat');
        return cache.addAll(urlsToCache);
      })
  );
});

// Event Fetch: Mengambil data dari cache jika offline, atau dari jaringan jika online
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// Event Activate: Membersihkan cache lama jika ada pembaruan aplikasi
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
