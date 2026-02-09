/**
 * Service Worker for 2048 Puzzle Game
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'puzzle2048-v1';
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'css/style.css',
    'js/app.js',
    'js/i18n.js',
    'manifest.json',
    'icon-192.svg',
    'icon-512.svg',
    'js/locales/ko.json',
    'js/locales/en.json',
    'js/locales/ja.json',
    'js/locales/zh.json',
    'js/locales/es.json',
    'js/locales/pt.json',
    'js/locales/id.json',
    'js/locales/tr.json',
    'js/locales/de.json',
    'js/locales/fr.json',
    'js/locales/hi.json',
    'js/locales/ru.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
                console.warn('Cache addAll error:', error);
                // Continue even if some assets fail to cache
            });
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached response if available
            if (response) {
                return response;
            }

            // Otherwise fetch from network
            return fetch(event.request).then((response) => {
                // Don't cache error responses
                if (!response || response.status !== 200) {
                    return response;
                }

                // Cache successful responses
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(() => {
                // Return offline page or cached response if network fails
                return caches.match(event.request).then((cachedResponse) => {
                    return cachedResponse || new Response('Offline - cached content not available', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    });
                });
            });
        })
    );
});

// Background sync (optional - for future enhancements)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-scores') {
        event.waitUntil(
            // Sync logic here
            Promise.resolve()
        );
    }
});
