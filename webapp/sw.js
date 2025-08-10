// Enhanced service worker: core shell + stale-while-revalidate for static assets
const CACHE = 'tm-companion-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './app.css',
  './app.js',
  './data.js',
  './logo.svg',
  './manifest.webmanifest'
];
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(CORE_ASSETS))
  );
});
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
});
self.addEventListener('fetch', evt => {
  const req = evt.request;
  if(req.method !== 'GET') return;
  // HTML navigation: network-first, fallback to cache, then index
  if(req.mode === 'navigate'){
    evt.respondWith((async ()=>{
      try {
        const net = await fetch(req);
        const copy = net.clone(); caches.open(CACHE).then(c=>c.put(req, copy));
        return net;
      } catch(e){
  const cached = await caches.match(req);
  return cached || caches.match('./offline.html') || caches.match('./index.html');
      }
    })());
    return;
  }
  // Stale-while-revalidate for CSS/JS/SVG/PNG
  if(/\.(?:css|js|svg|png|webmanifest)$/.test(new URL(req.url).pathname)){
    evt.respondWith((async()=>{
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then(r=>{ cache.put(req, r.clone()); return r; }).catch(()=>cached);
      return cached || fetchPromise;
    })());
    return;
  }
  // Default cache-first
  evt.respondWith(
    caches.match(req).then(c=> c || fetch(req).then(r=>{ const copy=r.clone(); caches.open(CACHE).then(cache=>cache.put(req,copy)); return r; }))
  );
});
