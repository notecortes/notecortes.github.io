// Service Worker para Wordlet PWA - MODO SIN CACHE
const CACHE_NAME = 'wordlet-no-cache-' + Date.now();

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado - Modo sin cache');
    // Saltar la espera y activar inmediatamente
    self.skipWaiting();
});

// Interceptar peticiones - SIEMPRE DESDE LA RED
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request.clone())
            .then((response) => {
                // Agregar headers anti-cache a todas las respuestas
                const modifiedResponse = new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: {
                        ...response.headers,
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                return modifiedResponse;
            })
            .catch((error) => {
                console.log('Error en fetch:', error);
                // En caso de error, intentar respuesta básica
                return new Response('Error de red', { status: 503 });
            })
    );
});

// Actualizar Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});