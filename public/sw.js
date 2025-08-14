// public/sw.js
const CACHE_NAME = 'dakshin-vaarahi-pwa-v2.5'; // Incremented version to ensure update
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/favicon.ico',
  '/images/social-share.png'
  // Note: Do not cache video files by default as they can be large.
];

// On install, cache the app shell.
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Force activation
  );
});

// On activate, clean up old caches.
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients
  );
});

// On fetch, apply caching strategies.
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests, API calls, and Vite-specific dev server requests.
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.search.includes('t=') || // Vite's timestamp param for HMR
    url.pathname.endsWith('.ts') || // Ignore source files
    url.pathname.endsWith('.tsx') || // Ignore source files
    !url.protocol.startsWith('http')
  ) {
    return;
  }

  // **Strategy for navigation requests (the core fix): App Shell Model**
  // Always serve the index.html for any HTML document request.
  // This allows the client-side router to handle all URLs.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(response => {
        return response || fetch('/index.html');
      })
    );
    return;
  }

  // **Strategy for static assets: Cache-first, then network fallback**
  // Serve from cache if available, otherwise fetch from network and cache.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(networkResponse => {
        // Check for a valid response before caching
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(error => {
        console.warn(`[ServiceWorker] Fetch failed for: ${request.url}`, error);
        // You could return an offline fallback page here if you had one.
      });
    })
  );
});