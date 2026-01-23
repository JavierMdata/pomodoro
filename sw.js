// Service Worker ULTRA MINIMALISTA para PomoSmart PWA
// Versión 2.0.0 - Solo instalación y activación, SIN cacheo ni interceptación
const VERSION = '2.0.0';

console.log('[SW] 🚀 Service Worker cargado - Versión', VERSION);

// Instalación - Solo activar inmediatamente
self.addEventListener('install', (event) => {
  console.log('[SW] ✅ Instalando...');
  self.skipWaiting();
});

// Activación - Tomar control inmediatamente
self.addEventListener('activate', (event) => {
  console.log('[SW] ✅ Activando...');
  event.waitUntil(self.clients.claim());
});

// NO interceptar fetch - dejar que todo pase directo a la red
// Esto previene CUALQUIER problema de cacheo o bloqueo
