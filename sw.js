const CACHE = 'marketcalc-v2';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon.svg'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    // Las APIs externas (dolarapi, er-api) no se cachean — si no hay red, fallan y la app usa localStorage
    if (url.origin !== self.location.origin) return;

    // Para los assets propios: cache-first con fallback a red
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});
