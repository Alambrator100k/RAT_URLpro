// Service Worker للتخزين المؤقت
const CACHE_NAME = 'admin-system-v1.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('تم فتح الكاش');
        return cache.addAll(urlsToCache);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // وجد في الكاش - أرجعها
        if (response) {
          return response;
        }

        // ليس في الكاش - حمله من الشبكة
        return fetch(event.request).then(function(response) {
          // تحقق من أن الاستجابة صالحة
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // استنسخ الاستجابة
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
    );
});