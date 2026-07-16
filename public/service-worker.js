const CACHE_NAME = 'mychatapp-v2'; // nimebadilisha v1 -> v2
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/icon.png',
  '/nick-logo.png', // ONGEZA HII ILI LOGO YA NICK IFUNGUKE OFFLINE
  '/manifest.json'
];

// 1. INSTALL: Tunahifadhi files zote kwenye cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Files zimehifadhiwa kwenye cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. FETCH: Kila mtu akitaka file, tuitoe kwenye cache kwanza
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Kama ipo kwenye cache, itoe hapo. Kama haipo, nenda mtandaoni
        return response || fetch(event.request);
      })
  );
});

// 3. ACTIVATE: Futa cache ya zamani
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});
