// Service Worker para PomoSmart PWA
const CACHE_NAME = 'pomosmart-v1.0.0';
const RUNTIME_CACHE = 'pomosmart-runtime';

// Archivos esenciales para cachear (Cache First)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precacheando archivos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de caché
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no sean HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorar requests de APIs externas (CDN, Supabase, Google)
  if (
    url.hostname.includes('cdn.tailwindcss.com') ||
    url.hostname.includes('esm.sh') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    // Network First para CDNs
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Cache First para archivos estáticos locales
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Network First con fallback a cache para el resto
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Solo cachear respuestas exitosas
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Página offline fallback
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Sincronización en segundo plano (Background Sync)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync:', event.tag);

  if (event.tag === 'sync-pomodoro-sessions') {
    event.waitUntil(syncPomodoroSessions());
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push recibido:', event);

  const options = {
    body: event.data ? event.data.text() : '¡Es hora de tu descanso!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'pomodoro-notification',
    requireInteraction: true,
    actions: [
      { action: 'start', title: 'Comenzar' },
      { action: 'dismiss', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PomoSmart', options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificación clickeada:', event.action);

  event.notification.close();

  if (event.action === 'start') {
    event.waitUntil(
      clients.openWindow('/?tab=pomodoro')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Función auxiliar para sincronizar sesiones de pomodoro
async function syncPomodoroSessions() {
  try {
    console.log('[SW] Sincronizando sesiones de pomodoro...');
    // Aquí se implementaría la lógica de sincronización con Supabase
    // cuando la conexión se recupere
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Error al sincronizar:', error);
    return Promise.reject(error);
  }
}

// Mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Mensaje recibido:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.payload);
      })
    );
  }
});
