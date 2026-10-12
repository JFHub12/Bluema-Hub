// BLUEMA HUB Flagship Progressive Web App Service Worker
// Version: bluema-hub-pwa-v3.1.0

const CACHE_VERSION = 'bluema-hub-pwa-v3.1.0';
const STATIC_CACHE_NAME = `static-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `data-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `images-${CACHE_VERSION}`;

const EXPECTED_CACHES = [STATIC_CACHE_NAME, DATA_CACHE_NAME, IMAGE_CACHE_NAME];

// Essential static shell assets pre-cached on installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/icon.svg',
  '/sitemap.xml',
  '/robots.txt'
];

// 1. INSTALL LIFECYCLE: Pre-cache static shell and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[SW] Pre-cache item skipped: ${asset}`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE LIFECYCLE: Automatically clear outdated caches from previous deployments
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!EXPECTED_CACHES.includes(cacheName)) {
            console.log(`[SW] Clearing legacy cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper to determine request type
function isImageRequest(request) {
  const url = request.url;
  return (
    request.destination === 'image' ||
    /\.(png|jpg|jpeg|svg|webp|gif|ico)(\?.*)?$/i.test(url) ||
    url.includes('cloudinary.com') ||
    url.includes('images.unsplash.com')
  );
}

function isFontRequest(request) {
  const url = request.url;
  return (
    request.destination === 'font' ||
    /\.(woff|woff2|ttf|eot)(\?.*)?$/i.test(url) ||
    url.includes('fonts.gstatic.com') ||
    url.includes('fonts.googleapis.com')
  );
}

function isApiRequest(request) {
  return request.url.includes('/api/');
}

// Check if request is a Vite development or dynamic module
function isDevOrViteRequest(request) {
  const url = request.url;
  return (
    url.includes('/@vite') ||
    url.includes('/@fs/') ||
    url.includes('/@id/') ||
    url.includes('/src/') ||
    url.includes('?v=') ||
    url.includes('?t=') ||
    url.includes('hot-update')
  );
}

// 3. FETCH STRATEGIES
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle HTTP/HTTPS GET requests; let mutations bypass SW
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Vite development modules must always go straight to network to ensure live preview
  if (isDevOrViteRequest(request)) {
    event.respondWith(fetch(request));
    return;
  }

  // Strategy A: API Requests -> Network First with Cache Fallback
  if (isApiRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          // Synthetic JSON fallback for offline state
          return new Response(
            JSON.stringify({
              error: 'Offline mode active. Showing cached data.',
              offline: true
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Strategy B: Static Images & Web Fonts -> Cache First with Network Fallback
  if (isImageRequest(request) || isFontRequest(request)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const targetCache = isImageRequest(request) ? IMAGE_CACHE_NAME : STATIC_CACHE_NAME;
            const clone = networkResponse.clone();
            caches.open(targetCache).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        }).catch(() => {
          if (isImageRequest(request)) {
            return caches.match('/icon.svg');
          }
        });
      })
    );
    return;
  }

  // Strategy C: HTML Navigation & App Shell -> Network First with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedNavigate = await caches.match(request);
          if (cachedNavigate) return cachedNavigate;
          const fallbackShell = await caches.match('/');
          if (fallbackShell) return fallbackShell;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Strategy D: Static Bundles -> Network First for live accuracy, fallback to cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// 4. Background messaging & update notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
