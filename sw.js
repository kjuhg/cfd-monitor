// 버전 올리면 캐시 교체
const VER = 'cfd-v20';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(VER).then(c => c.addAll(['./index.html','./manifest.json'])));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==VER).map(k=>caches.delete(k))))
    .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, {cache:'no-cache'})
      .then(res => {
        if (res.ok) caches.open(VER).then(c => c.put(e.request, res.clone()));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
