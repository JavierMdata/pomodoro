// Service Worker SIMPLE Y SEGURO para PomoSmart PWA
// Versión minimalista que NO rompe la app
const CACHE_VERSION = '1.3.0';
const CACHE_NAME = `pomosmart-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `pomosmart-runtime-v${CACHE_VERSION}`;

// NO pre-cachear nada - dejar que se cachee bajo demanda
const CRITICAL_ASSETS = [];

// Instalación del Service Worker - MINIMALISTA
self.addEventListener('install', (event) => {
  console.log('[SW] 🚀 Instalando Service Worker v1.3.0 (minimalista)...');

  event.waitUntil(
    // Solo crear el cache, NO intentar pre-cachear nada
    caches.open(CACHE_NAME)
      .then(() => {
        console.log('[SW] ✅ Cache creado');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] ❌ Error en instalación:', err);
        // NO fallar la instalación por errores de caché
        return self.skipWaiting();
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] 🔄 Activando Service Worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] 🗑️ Eliminando cache antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
      .then(() => {
        console.log('[SW] ✅ Activación completa');
      })
      .catch(err => {
        console.error('[SW] ❌ Error en activación:', err);
      })
  );
});

// Estrategia de caché - SIMPLE
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no sean HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorar Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Para CDNs y APIs externas - solo network, sin cache
  if (
    url.hostname.includes('supabase') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('cdn.tailwindcss.com') ||
    url.hostname.includes('esm.sh') ||
    url.hostname.includes('unpkg.com')
  ) {
    // Network only - no cachear
    return;
  }

  // Para todo lo demás - Network First con cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Solo cachear respuestas exitosas de nuestro dominio
        if (response.ok && url.origin === location.origin) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone).catch(() => {
              // Ignorar errores de caché
            });
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla network, intentar cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] 📦 Sirviendo desde cache:', url.pathname);
            return cachedResponse;
          }

          // Si no hay cache, devolver respuesta offline básica
          if (request.destination === 'document') {
            return new Response(
              '<html><body><h1>Offline</h1><p>No hay conexión a internet</p></body></html>',
              {
                headers: { 'Content-Type': 'text/html' }
              }
            );
          }

          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] 🔔 Push recibido:', event);

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
  console.log('[SW] 👆 Notificación clickeada:', event.action);

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

// Mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('[SW] 💬 Mensaje recibido:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Limpiar cachés manualmente
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('[SW] 🗑️ Todas las cachés eliminadas');
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
});

console.log('[SW] 🎉 Service Worker cargado - Version', CACHE_VERSION, '(minimalista)');
