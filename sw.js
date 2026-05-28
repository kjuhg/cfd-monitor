// 버전 바꾸면 캐시 자동 교체
const VER = 'cfd-v12';

self.addEventListener('install', e => {
  // 즉시 활성화 (기존 SW 대기 없이)
  self.skipWaiting();
  e.waitUntil(
    caches.open(VER).then(c => c.addAll(['./index.html','./manifest.json']))
  );
});

self.addEventListener('activate', e => {
  // 이전 버전 캐시 전부 삭제
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k=>k!==VER).map(k=>caches.delete(k))))
      .then(() => self.clients.claim()) // 열린 탭 즉시 접수
  );
});

// 네트워크 우선 → 실패 시 캐시
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, {cache:'no-cache'})
      .then(res => {
        if(res.ok){
          const clone = res.clone();
          caches.open(VER).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
