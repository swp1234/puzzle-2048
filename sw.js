/**
 * Service Worker for 2048 Puzzle Game
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'puzzle2048-v2';
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

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request).then((response) => {
            if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
            }
            return response;
        }).catch(() => {
            return caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || new Response('Offline', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain' }
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
