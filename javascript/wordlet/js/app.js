// Aplicación principal - Punto de entrada
class WordletApp {
    constructor() {
        this.game = null;
        this.ui = null;
        this.isInitialized = false;
        
        this.init();
    }

    // Inicializar aplicación
    async init() {
        try {
            // Esperar a que el DOM esté listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        } catch (error) {
            console.error('Error inicializando la aplicación:', error);
        }
    }

    // Configurar aplicación
    setup() {
        try {
            // Crear instancias del juego y UI
            this.game = new WordleGame();
            this.ui = new UIManager(this.game);
            
            // Cargar configuración guardada
            this.loadSavedSettings();
            
            // Configurar PWA si está disponible
            this.setupPWA();
            
            this.isInitialized = true;
            console.log('Wordlet inicializado correctamente');
            
        } catch (error) {
            console.error('Error configurando la aplicación:', error);
            this.showFallbackError();
        }
    }

    // Cargar configuración guardada
    loadSavedSettings() {
        const savedSettings = Utils.loadFromStorage('wordlet-settings', {});
        
        if (savedSettings.attempts) {
            document.getElementById('attemptsSelect').value = savedSettings.attempts;
        }
        
        if (savedSettings.hardMode !== undefined) {
            document.getElementById('hardModeCheck').checked = savedSettings.hardMode;
        }
    }

    // Guardar configuración
    saveSettings() {
        const settings = {
            attempts: document.getElementById('attemptsSelect').value,
            hardMode: document.getElementById('hardModeCheck').checked,
            lastPlayed: Date.now()
        };
        
        Utils.saveToStorage('wordlet-settings', settings);
    }

    // Configurar PWA
    setupPWA() {
        // Registrar service worker si está disponible
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.log('Error registrando Service Worker:', error);
                });
        }

        // Manejar instalación de PWA
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton(deferredPrompt);
        });
    }

    // Mostrar botón de instalación
    showInstallButton(deferredPrompt) {
        const installBtn = document.createElement('button');
        installBtn.textContent = '📱 Instalar App';
        installBtn.className = 'install-btn';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: var(--border-radius);
            font-weight: 500;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        installBtn.addEventListener('click', async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('PWA instalada');
            }
            
            installBtn.remove();
            deferredPrompt = null;
        });

        document.body.appendChild(installBtn);
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            if (installBtn.parentNode) {
                installBtn.remove();
            }
        }, 10000);
    }

    // Mostrar error de respaldo
    showFallbackError() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 20px;
                text-align: center;
                background: var(--background-color);
                color: var(--text-color);
                font-family: var(--font-family);
            ">
                <h1 style="margin-bottom: 20px;">⚠️ Error</h1>
                <p style="margin-bottom: 20px;">
                    No se pudo cargar la aplicación correctamente.
                </p>
                <button onclick="location.reload()" style="
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                ">
                    Recargar Página
                </button>
            </div>
        `;
    }

    // Obtener estado de la aplicación
    getAppState() {
        return {
            isInitialized: this.isInitialized,
            gameState: this.game ? this.game.getCurrentState() : null,
            timestamp: Date.now()
        };
    }
}

// Función de prueba manual para debugging
window.testUrlLoad = function() {
    console.log('=== PRUEBA MANUAL DE CARGA DE URL ===');
    console.log('URL actual:', window.location.href);
    console.log('Search params:', window.location.search);
    
    const urlParams = new URLSearchParams(window.location.search);
    console.log('Parámetros:', Object.fromEntries(urlParams));
    
    if (urlParams.has('word')) {
        const encodedWord = urlParams.get('word');
        console.log('Palabra codificada:', encodedWord);
        
        try {
            const word = atob(encodedWord);
            console.log('Palabra decodificada:', word);
            
            // Forzar carga del juego
            if (window.WordletApp && window.WordletApp.ui) {
                const ui = window.WordletApp.ui;
                ui.game.setupGame(word, 6, false);
                ui.createGameBoard();
                ui.updateGameBoard();
                ui.updateKeyboard();
                
                // Verificar si el método existe antes de llamarlo
                if (typeof ui.disableSettings === 'function') {
                    ui.disableSettings();
                } else {
                    console.warn('Método disableSettings no encontrado');
                }
                
                console.log('¡Juego cargado manualmente!');
            } else {
                console.error('WordletApp o ui no están disponibles');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.log('No hay parámetros de juego en la URL');
    }
};

// Función de prueba completa mejorada
window.forceLoadGame = function() {
    console.log('🔧 FORZANDO CARGA DE JUEGO');
    
    // Decodificar "GATOS"
    const word = 'GATOS';
    const attempts = 6;
    const hardMode = false;
    
    // Acceder al juego directamente
    if (window.WordletApp && window.WordletApp.ui) {
        const ui = window.WordletApp.ui;
        
        console.log('UI disponible:', ui);
        console.log('Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(ui)));
        
        // Configurar juego
        ui.game.setupGame(word, attempts, hardMode);
        ui.createGameBoard();
        ui.updateGameBoard();
        ui.updateKeyboard();
        
        // Verificar si el método existe
        if (typeof ui.disableSettings === 'function') {
            ui.disableSettings();
            console.log('✅ Configuración deshabilitada');
        } else {
            console.warn('⚠️ Método disableSettings no encontrado');
            // Deshabilitar manualmente
            const settingsBtn = document.getElementById('settingsBtn');
            if (settingsBtn) {
                settingsBtn.disabled = true;
                settingsBtn.style.opacity = '0.5';
                settingsBtn.style.cursor = 'not-allowed';
                console.log('✅ Configuración deshabilitada manualmente');
            }
        }
        
        console.log('✅ Juego forzado exitosamente');
        console.log('Palabra objetivo:', word);
        console.log('Intentos:', attempts);
    } else {
        console.error('❌ No se pudo acceder a WordletApp');
        console.log('WordletApp:', window.WordletApp);
    }
};

// Inicializar aplicación cuando se carga la página
const app = new WordletApp();

// Exportar para uso global si es necesario
window.WordletApp = app;