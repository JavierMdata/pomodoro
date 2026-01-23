// Service Worker ULTRA Optimizado para PomoSmart PWA
// Optimizado para carga rápida en iPhone y PWA
const CACHE_VERSION = '1.2.0';
const CACHE_NAME = `pomosmart-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `pomosmart-runtime-v${CACHE_VERSION}`;
const IMAGE_CACHE = `pomosmart-images-v${CACHE_VERSION}`;

// Timeout para network requests (más rápido = mejor UX)
const NETWORK_TIMEOUT = 3000; // 3 segundos

// Archivos críticos para cachear inmediatamente (Shell mínimo - FAST!)
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Archivos importantes pero no críticos (cachear después del shell)
const IMPORTANT_ASSETS = [
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
];

// Instalación del Service Worker - Optimizada para velocidad
self.addEventListener('install', (event) => {
  console.log('[SW] 🚀 Instalando Service Worker ultra-optimizado...');

  event.waitUntil(
    Promise.all([
      // 1. Cachear solo archivos CRÍTICOS inmediatamente (bloquea instalación pero es rápido)
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] ⚡ Cacheando shell crítico (FAST!)');
        return cache.addAll(CRITICAL_ASSETS);
      }),

      // 2. Cachear archivos IMPORTANTES en background (no bloquea)
      caches.open(IMAGE_CACHE).then((cache) => {
        console.log('[SW] 📦 Cacheando iconos en background...');
        // No bloquear si alguno falla
        return Promise.allSettled(
          IMPORTANT_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.log(`[SW] ⚠️ No se pudo cachear ${url}`);
            })
          )
        );
      })
    ])
      .then(() => {
        console.log('[SW] ✅ Instalación completa');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] ❌ Error en instalación:', err);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] 🔄 Activando Service Worker...');

  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguas
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              console.log('[SW] 🗑️ Eliminando cache antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Tomar control inmediatamente
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] ✅ Activación completa');
    })
  );
});

// Helper: Network First con timeout rápido
async function networkFirstWithTimeout(request, timeout = NETWORK_TIMEOUT) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Network timeout')), timeout)
  );

  try {
    const response = await Promise.race([
      fetch(request),
      timeoutPromise
    ]);

    // Cachear respuesta exitosa
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Si falla network, intentar cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] 📦 Sirviendo desde cache:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// Estrategia de caché - OPTIMIZADA
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

  // ===== CDNs y APIs Externas =====
  // Network Only con timeout corto para Supabase y APIs
  if (
    url.hostname.includes('supabase') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    event.respondWith(
      fetch(request, { timeout: 5000 }).catch(() => {
        // Si falla API, devolver error (no cachear APIs)
        return new Response('Network error', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
    );
    return;
  }

  // Network First para CDNs (Tailwind, ESM)
  if (
    url.hostname.includes('cdn.tailwindcss.com') ||
    url.hostname.includes('esm.sh') ||
    url.hostname.includes('cdn.') ||
    url.hostname.includes('unpkg.com')
  ) {
    event.respondWith(
      networkFirstWithTimeout(request, 5000)
    );
    return;
  }

  // ===== Archivos Locales =====

  // Cache First para archivos críticos (HTML, manifest, iconos)
  if (
    CRITICAL_ASSETS.some(asset => url.pathname === asset) ||
    IMPORTANT_ASSETS.some(asset => url.pathname === asset) ||
    url.pathname.includes('/icons/')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Actualizar cache en background
          fetch(request).then(response => {
            if (response.ok) {
              caches.open(url.pathname.includes('/icons/') ? IMAGE_CACHE : CACHE_NAME)
                .then(cache => cache.put(request, response));
            }
          }).catch(() => {});

          return cachedResponse;
        }

        // Si no está en cache, fetchear y cachear
        return fetch(request).then((response) => {
          if (response.ok) {
            const cache = url.pathname.includes('/icons/') ? IMAGE_CACHE : CACHE_NAME;
            caches.open(cache).then(c => c.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network First con timeout para módulos JS/CSS
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(
      networkFirstWithTimeout(request, 3000)
    );
    return;
  }

  // Cache First para imágenes
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (response.ok) {
            caches.open(IMAGE_CACHE).then(cache => {
              cache.put(request, response.clone());
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Network First con timeout para todo lo demás
  event.respondWith(
    networkFirstWithTimeout(request, 3000).catch(() => {
      // Fallback a index.html para navegación
      if (request.destination === 'document') {
        return caches.match('/index.html');
      }

      return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/plain'
        })
      });
    })
  );
});

// Sincronización en segundo plano (Background Sync)
self.addEventListener('sync', (event) => {
  console.log('[SW] 🔄 Background Sync:', event.tag);

  if (event.tag === 'sync-pomodoro-sessions') {
    event.waitUntil(syncPomodoroSessions());
  }
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

// Función auxiliar para sincronizar sesiones de pomodoro
async function syncPomodoroSessions() {
  try {
    console.log('[SW] 📊 Sincronizando sesiones de pomodoro...');
    // Aquí se implementaría la lógica de sincronización con Supabase
    // cuando la conexión se recupere
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] ❌ Error al sincronizar:', error);
    return Promise.reject(error);
  }
}

// Mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('[SW] 💬 Mensaje recibido:', event.data);

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

  // Limpiar cachés manualmente
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('[SW] 🗑️ Todas las cachés eliminadas');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

console.log('[SW] 🎉 Service Worker cargado - Version', CACHE_VERSION);
