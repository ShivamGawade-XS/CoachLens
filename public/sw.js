const CACHE_VERSION = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : Date.now().toString();
const CACHE_NAME = `coachlens-cache-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ASSETS_TO_CACHE);
    } catch (err) {
      console.error('Service Worker installation caching failed:', err);
    }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (cache) => {
          if (cache !== CACHE_NAME) {
            await caches.delete(cache);
          }
        })
      );
    } catch (err) {
      console.error('Service Worker activation cleanup failed:', err);
    }
  })());
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase') || url.hostname.includes('groq') || url.hostname.includes('hot-update')) return;

  event.respondWith((async () => {
    try {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      try {
        const networkResponse = await fetch(event.request);
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        // Run cache writing in background asynchronously
        (async () => {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, responseToCache);
          } catch (err) {
            console.error('Service Worker cache put failed:', err);
          }
        })();
        
        return networkResponse;
      } catch (err) {
        console.warn('Network request failed in fetch event:', err);
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
        }
        return new Response('Network error occurred', { status: 503, statusText: 'Service Unavailable' });
      }
    } catch (err) {
      console.error('Service Worker cache match error:', err);
      return fetch(event.request);
    }
  })());
});
