// Cache Buster - Sistema anti-cache robusto para Wordlet
class CacheBuster {
    constructor() {
        this.timestamp = Date.now();
        this.init();
    }

    init() {
        // Limpiar cache del navegador al cargar
        this.clearBrowserCache();
        
        // Agregar event listeners para navegación
        this.setupNavigationHandlers();
        
        // Forzar recarga de recursos
        this.forceResourceReload();
    }

    // Limpiar solo el cache del service worker (NO localStorage/sessionStorage)
    async clearBrowserCache() {
        try {
            // NO limpiar localStorage ni sessionStorage - la aplicación los necesita
            
            // Limpiar cache del service worker
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('Cache del service worker limpiado');
            }
            
            // Desregistrar service worker si existe
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                }
                console.log('Service workers desregistrados');
            }
            
        } catch (error) {
            console.warn('Error limpiando cache:', error);
        }
    }

    // Configurar handlers para navegación
    setupNavigationHandlers() {
        // Solo interceptar enlaces externos a otras páginas
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && 
                !link.href.startsWith('http') && 
                !link.href.includes('#') &&
                !link.href.includes('javascript:') &&
                link.href !== window.location.href) {
                e.preventDefault();
                this.navigateWithCacheBuster(link.href);
            }
        });

        // NO interceptar formularios - dejar que manejen su propia lógica
        // Los formularios de la aplicación tienen su propia lógica JavaScript
    }

    // Navegar con cache buster
    navigateWithCacheBuster(url) {
        const separator = url.includes('?') ? '&' : '?';
        const newUrl = `${url}${separator}_cb=${Date.now()}`;
        window.location.href = newUrl;
    }

    // Forzar recarga de recursos CSS y JS
    forceResourceReload() {
        // Recargar CSS
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        cssLinks.forEach(link => {
            const href = link.href.split('?')[0];
            link.href = `${href}?v=${this.timestamp}`;
        });

        // Agregar meta tags anti-cache si no existen
        this.addAntiCacheMetaTags();
    }

    // Agregar meta tags anti-cache
    addAntiCacheMetaTags() {
        const metaTags = [
            { 'http-equiv': 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
            { 'http-equiv': 'Pragma', content: 'no-cache' },
            { 'http-equiv': 'Expires', content: '0' }
        ];

        metaTags.forEach(tagData => {
            if (!document.querySelector(`meta[http-equiv="${tagData['http-equiv']}"]`)) {
                const meta = document.createElement('meta');
                Object.keys(tagData).forEach(key => {
                    meta.setAttribute(key, tagData[key]);
                });
                document.head.appendChild(meta);
            }
        });
    }

    // Método para recargar página completamente
    static hardReload() {
        // Limpiar cache y recargar
        if (window.location.reload) {
            window.location.reload(true); // Forzar recarga desde servidor
        } else {
            window.location.href = window.location.href;
        }
    }

    // Método para limpiar cache manualmente
    static async clearAllCache() {
        try {
            // Limpiar localStorage y sessionStorage
            localStorage.clear();
            sessionStorage.clear();
            
            // Limpiar cache del navegador
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }
            
            console.log('Cache completamente limpiado');
            return true;
        } catch (error) {
            console.error('Error limpiando cache:', error);
            return false;
        }
    }
}

// Inicializar cache buster cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CacheBuster();
    });
} else {
    new CacheBuster();
}

// Exponer métodos globalmente
window.CacheBuster = CacheBuster;

// Agregar función global para limpiar cache
window.clearCache = () => {
    CacheBuster.clearAllCache().then(() => {
        CacheBuster.hardReload();
    });
};

// NO interceptar beforeunload - interfiere con la navegación de la aplicación

// Agregar timestamp a todas las peticiones fetch
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && !url.startsWith('http')) {
        const separator = url.includes('?') ? '&' : '?';
        args[0] = `${url}${separator}_cb=${Date.now()}`;
    }
    return originalFetch.apply(this, args);
};