// JavaScript para la página de configuración (palabra.html)
class ConfigManager {
    constructor() {
        this.elements = this.getElements();
        this.bindEvents();
        this.loadSavedSettings();
    }

    // Obtener referencias a elementos del DOM
    getElements() {
        return {
            configForm: document.getElementById('configForm'),
            wordInput: document.getElementById('wordInput'),
            attemptsSelect: document.getElementById('attemptsSelect'),
            hardModeCheck: document.getElementById('hardModeCheck'),
            playAloneBtn: document.getElementById('playAloneBtn'),
            generateBtn: document.getElementById('generateBtn'),
            qrSection: document.getElementById('qrSection'),
            qrCode: document.getElementById('qrCode'),
            gameUrl: document.getElementById('gameUrl'),
            copyUrlBtn: document.getElementById('copyUrlBtn'),
            playNowBtn: document.getElementById('playNowBtn')
        };
    }

    // Vincular eventos
    bindEvents() {
        console.log('Vinculando eventos del formulario...');
        
        // Evento del formulario
        this.elements.configForm.addEventListener('submit', (e) => {
            console.log('Formulario enviado - preventDefault llamado');
            e.preventDefault();
            this.generateGameUrl();
        });

        // Botón jugar solo
        this.elements.playAloneBtn.addEventListener('click', (e) => {
            console.log('Botón jugar solo clickeado');
            e.preventDefault(); // Agregar preventDefault por seguridad
            this.playAlone();
        });

        // Botón copiar URL
        this.elements.copyUrlBtn.addEventListener('click', () => {
            this.copyGameUrl();
        });

        // Botón jugar ahora
        this.elements.playNowBtn.addEventListener('click', () => {
            this.playNow();
        });

        // Validación en tiempo real
        this.elements.wordInput.addEventListener('input', () => {
            this.validateWord();
        });

        // Guardar configuración al cambiar
        [this.elements.attemptsSelect, this.elements.hardModeCheck].forEach(element => {
            element.addEventListener('change', () => {
                this.saveSettings();
            });
        });
    }

    // Cargar configuración guardada
    loadSavedSettings() {
        const savedSettings = Utils.loadFromStorage('wordlet-settings', {});
        
        if (savedSettings.attempts) {
            this.elements.attemptsSelect.value = savedSettings.attempts;
        }
        
        if (savedSettings.hardMode !== undefined) {
            this.elements.hardModeCheck.checked = savedSettings.hardMode;
        }

        if (savedSettings.lastWord) {
            this.elements.wordInput.placeholder = `Ej: ${savedSettings.lastWord}, SOL, PYTHON, JAVASCRIPT...`;
        }
    }

    // Guardar configuración
    saveSettings() {
        const settings = {
            attempts: this.elements.attemptsSelect.value,
            hardMode: this.elements.hardModeCheck.checked,
            lastWord: this.elements.wordInput.value.trim().toUpperCase(),
            lastSaved: Date.now()
        };
        
        Utils.saveToStorage('wordlet-settings', settings);
    }

    // Validar palabra en tiempo real
    validateWord() {
        const word = this.elements.wordInput.value.trim();
        const input = this.elements.wordInput;
        
        // Limpiar clases anteriores
        input.classList.remove('valid', 'invalid');
        
        if (word.length === 0) {
            return;
        }

        if (Utils.isValidWord(word)) {
            input.classList.add('valid');
        } else {
            input.classList.add('invalid');
        }
    }

    // Generar URL del juego y mostrar QR
    generateGameUrl() {
        const word = this.elements.wordInput.value.trim();
        const attempts = parseInt(this.elements.attemptsSelect.value);
        const hardMode = this.elements.hardModeCheck.checked;

        // Validar palabra
        if (!word) {
            this.showError('Por favor ingresa una palabra');
            this.elements.wordInput.focus();
            return;
        }

        if (!Utils.isValidWord(word)) {
            this.showError('La palabra debe tener entre 3 y 12 letras y solo contener letras');
            this.elements.wordInput.focus();
            return;
        }

        // Guardar configuración
        this.saveSettings();

        // Generar URL
        const gameUrl = this.createGameUrl(word, attempts, hardMode);
        
        // Mostrar sección QR
        this.showQRSection(gameUrl);
        
        // Generar QR
        this.generateQR(gameUrl);

        // Scroll suave a la sección QR
        this.elements.qrSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Crear URL del juego
    createGameUrl(word, attempts, hardMode) {
        // Obtener la URL base correctamente
        let baseUrl = window.location.origin;
        const currentPath = window.location.pathname;
        
        // Si estamos en palabra.html o en la raíz, apuntar a juego.html
        if (currentPath.endsWith('palabra.html')) {
            baseUrl += currentPath.replace('palabra.html', 'juego.html');
        } else if (currentPath.endsWith('/')) {
            baseUrl += currentPath + 'juego.html';
        } else {
            baseUrl += '/juego.html';
        }
        
        // Normalizar y codificar la palabra
        const normalizedWord = Utils.normalizeText(word);
        console.log('Palabra normalizada:', normalizedWord);
        
        const encodedWord = btoa(normalizedWord);
        console.log('Palabra codificada:', encodedWord);
        
        const params = new URLSearchParams({
            word: encodedWord,
            attempts: attempts,
            hard: hardMode ? '1' : '0'
        });

        const finalUrl = `${baseUrl}?${params.toString()}`;
        console.log('URL generada:', finalUrl);
        
        return finalUrl;
    }

    // Mostrar sección QR
    showQRSection(gameUrl) {
        this.elements.gameUrl.href = gameUrl;
        this.elements.gameUrl.textContent = gameUrl;
        this.elements.qrSection.classList.add('active');
    }

    // Generar código QR
    generateQR(url) {
        this.elements.qrCode.innerHTML = '<div class="qr-loading">Generando código QR...</div>';
        
        try {
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
            
            const img = document.createElement('img');
            img.src = qrApiUrl;
            img.alt = 'Código QR del juego';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            
            img.onload = () => {
                this.elements.qrCode.innerHTML = '';
                this.elements.qrCode.appendChild(img);
            };
            
            img.onerror = () => {
                this.elements.qrCode.innerHTML = '<div class="qr-loading">Error generando QR. Usa el enlace de abajo.</div>';
            };
            
        } catch (error) {
            console.warn('Error generando QR:', error);
            this.elements.qrCode.innerHTML = '<div class="qr-loading">Error generando QR. Usa el enlace de abajo.</div>';
        }
    }

    // Jugar solo (ir directamente al juego)
    playAlone() {
        const word = this.elements.wordInput.value.trim();
        const attempts = parseInt(this.elements.attemptsSelect.value);
        const hardMode = this.elements.hardModeCheck.checked;

        // Validar palabra
        if (!word) {
            this.showError('Por favor ingresa una palabra');
            this.elements.wordInput.focus();
            return;
        }

        if (!Utils.isValidWord(word)) {
            this.showError('La palabra debe tener entre 3 y 12 letras y solo contener letras');
            this.elements.wordInput.focus();
            return;
        }

        // Guardar configuración
        this.saveSettings();

        // Ir al juego
        const gameUrl = this.createGameUrl(word, attempts, hardMode);
        window.location.href = gameUrl;
    }

    // Copiar URL del juego
    async copyGameUrl() {
        const url = this.elements.gameUrl.href;
        const success = await Utils.copyToClipboard(url);
        
        if (success) {
            this.showSuccess('¡Enlace copiado al portapapeles!');
        } else {
            this.showError('No se pudo copiar el enlace');
        }
    }

    // Jugar ahora (abrir en nueva pestaña)
    playNow() {
        const url = this.elements.gameUrl.href;
        window.open(url, '_blank');
    }

    // Mostrar mensaje de éxito
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    // Mostrar mensaje de error
    showError(message) {
        this.showToast(message, 'error');
    }

    // Mostrar toast
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);

        // Remover después de 3 segundos
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ConfigManager();
});