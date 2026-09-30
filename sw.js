// Notula Service Worker — v4
// Perubahan utama v4: halaman HTML (index.html) memakai strategi NETWORK-FIRST,
// sehingga HP / PWA terinstal selalu mendapat versi terbaru saat online,
// dan baru memakai salinan cache jika sedang offline.
const CACHE_NAME = 'notula-cache-v4';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png',
  './favicon-48.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // Per-file: satu file gagal tidak menggagalkan instalasi SW
      Promise.allSettled(urlsToCache.map(url =>
        fetch(url, { cache: 'no-store' }).then(res => { if (res.ok) return cache.put(url, res); })
      ))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isHtmlRequest(request) {
  if (request.mode === 'navigate') return true;
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/html')) return true;
  const path = new URL(request.url).pathname;
  return path.endsWith('/') || path.endsWith('.html');
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Firebase / CDN tidak diganggu
  if (url.pathname.endsWith('/sw.js')) return;

  if (isHtmlRequest(request)) {
    // NETWORK-FIRST (bypass cache HTTP hosting), fallback ke cache saat offline
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put('./index.html', copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then(r => r || caches.match('./index.html'))
        )
    );
    return;
  }

  // Aset statis (ikon, manifest): STALE-WHILE-REVALIDATE
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
