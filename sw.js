/* SideQuest service worker: lets the app open with no connection.
   Pages and code are fetched fresh when online (so updates arrive), fonts/icons/libraries come from the cache. */
const VERSION = '1.0.0';
const CACHE = 'sidequest-' + VERSION;
const ASSETS = [
  './', 'index.html', 'assets/styles.css', 'assets/app.js', 'vendor/qrcode.js', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'fonts/inter-latin-400-normal.woff2', 'fonts/inter-latin-500-normal.woff2', 'fonts/inter-latin-600-normal.woff2', 'fonts/inter-latin-700-normal.woff2',
  'fonts/space-grotesk-latin-500-normal.woff2', 'fonts/space-grotesk-latin-700-normal.woff2',
  'fonts/jetbrains-mono-latin-500-normal.woff2', 'fonts/jetbrains-mono-latin-600-normal.woff2', 'fonts/jetbrains-mono-latin-700-normal.woff2'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('sidequest-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  const stable = /\/(fonts|vendor|icons)\//.test(u.pathname);
  if (stable) {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(r, res.clone())); return res; })));
    return;
  }
  const key = r.mode === 'navigate' ? 'index.html' : r;
  e.respondWith(fetch(r).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(key, res.clone())); return res; }).catch(() => caches.match(key)));
});
