// sw.js - Service Worker for offline support

const CACHE_NAME = 'cropdoc-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/scanner.html',
    '/gallery.html',
    '/analytics.html',
    '/reports.html',
    '/settings.html',
    '/root-scanner.html',
    '/css/main.css',
    '/css/scanner.css',
    '/css/gallery.css',
    '/css/analytics.css',
    '/css/reports.css',
    '/css/settings.css',
    '/css/root-scanner.css',
    '/js/app.js',
    '/js/camera.js',
    '/js/ai-engine.js',
    '/js/data-manager.js',
    '/js/ui-controller.js',
    '/js/gallery.js',
    '/js/analytics.js',
    '/js/reports.js',
    '/js/settings.js',
    '/js/scanner.js',
    '/js/scanner-full.js',
    '/js/filters.js',
    '/js/npk-analyzer.js',
    '/js/root-analyzer.js',
    '/js/root-scanner.js',
    '/js/export-manager.js',
    '/js/voice-assistant.js',
    '/js/offline-manager.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching assets...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('🧹 Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        // Cache new assets
                        if (response && response.status === 200) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, clone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return offline fallback
                        return caches.match('/offline.html');
                    });
            })
    );
});

// Background sync for offline uploads
self.addEventListener('sync', event => {
    if (event.tag === 'sync-uploads') {
        event.waitUntil(syncUploads());
    }
});

async function syncUploads() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const uploads = requests.filter(req => req.url.includes('/api/upload'));
    
    for (const request of uploads) {
        try {
            const response = await fetch(request);
            if (response.ok) {
                await cache.delete(request);
            }
        } catch (err) {
            console.warn('Sync failed:', err);
        }
    }
}

// Push notifications
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || '🌾 CropDoc Pro';
    const options = {
        body: data.body || 'New crop health update available',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        vibrate: [200, 100, 200],
        data: data.url || '/'
    };
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data || '/';
    event.waitUntil(
        clients.openWindow(url)
    );
});
