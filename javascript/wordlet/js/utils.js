// Utilidades generales del juego
class Utils {
    // Normalizar texto (quitar acentos, convertir a mayúsculas)
    static normalizeText(text) {
        return text
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-ZÑ]/g, '');
    }

    // Validar palabra
    static isValidWord(word) {
        // Valores por defecto si CONFIG no está disponible
        const MIN_LENGTH = (typeof CONFIG !== 'undefined' && CONFIG.MIN_WORD_LENGTH) ? CONFIG.MIN_WORD_LENGTH : 3;
        const MAX_LENGTH = (typeof CONFIG !== 'undefined' && CONFIG.MAX_WORD_LENGTH) ? CONFIG.MAX_WORD_LENGTH : 12;
        
        const normalized = this.normalizeText(word);
        const lengthValid = normalized.length >= MIN_LENGTH && normalized.length <= MAX_LENGTH;
        const lettersValid = /^[A-ZÑ]+$/.test(normalized);
        
        return lengthValid && lettersValid;
    }

    // Generar ID único
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Delay para animaciones
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Guardar en localStorage
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('No se pudo guardar en localStorage:', error);
        }
    }

    // Cargar de localStorage
    static loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.warn('No se pudo cargar de localStorage:', error);
            return defaultValue;
        }
    }

    // Vibrar dispositivo (si está disponible)
    static vibrate(pattern = 100) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // Copiar al portapapeles
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.warn('No se pudo copiar al portapapeles:', error);
            return false;
        }
    }

    // Formatear tiempo
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Detectar dispositivo móvil
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}