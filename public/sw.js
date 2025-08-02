const CACHE_NAME = 'workincz-v1.0.0';
const STATIC_CACHE = 'workincz-static-v1.0.0';
const DYNAMIC_CACHE = 'workincz-dynamic-v1.0.0';

// Файлы для кеширования при установке
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/og-image.jpg',
];

// API endpoints для кеширования
const API_CACHE = [
  '/api/jobs',
  '/api/auth/user',
  '/api/dashboard/stats',
];

// Стратегии кеширования
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  API: 'network-first',
  IMAGES: 'cache-first',
  FONTS: 'cache-first',
};

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Пропускаем неподдерживаемые запросы
  if (request.method !== 'GET') {
    return;
  }
  
  // Стратегия для API запросов
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Стратегия для изображений
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Стратегия для шрифтов
  if (isFontRequest(request)) {
    event.respondWith(handleFontRequest(request));
    return;
  }
  
  // Стратегия для статических ресурсов
  if (isStaticRequest(request)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Стратегия для навигации
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
});

// Обработка API запросов (Network First)
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Возвращаем fallback для API
    return new Response(
      JSON.stringify({ error: 'Network unavailable' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Обработка изображений (Cache First)
async function handleImageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Возвращаем placeholder изображение
    return new Response(
      '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" fill="#666">Image</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

// Обработка шрифтов (Cache First)
async function handleFontRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 404 });
  }
}

// Обработка статических ресурсов (Cache First)
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 404 });
  }
}

// Обработка навигации (Network First)
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation failed, trying cache');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Возвращаем offline страницу
    return caches.match('/offline.html');
  }
}

// Вспомогательные функции
function isImageRequest(request) {
  return request.destination === 'image' || 
         request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i);
}

function isFontRequest(request) {
  return request.destination === 'font' || 
         request.url.match(/\.(woff|woff2|ttf|eot)$/i);
}

function isStaticRequest(request) {
  return request.destination === 'script' || 
         request.destination === 'style' ||
         request.url.match(/\.(css|js|json)$/i);
}

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log('[SW] Performing background sync');
    // Здесь можно добавить логику синхронизации данных
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Обработка push уведомлений
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление от WorkInCZ',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('WorkInCZ', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker loaded successfully'); 