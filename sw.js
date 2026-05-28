const CACHE = 'cfd-v5';
const ASSETS = ['./index.html', './manifest.json'];

// 설치: 새 캐시 생성
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting(); // 즉시 활성화
});

// 활성화: 이전 버전 캐시 전부 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // 열린 탭에 즉시 적용
});

// 요청: 네트워크 우선, 실패하면 캐시
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 성공하면 캐시도 업데이트
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
