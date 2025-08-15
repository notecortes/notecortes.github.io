// JavaScript para la página de generación por lotes (batch.html)
class BatchManager {
    constructor() {
        this.elements = this.getElements();
        this.games = [];
        this.isGenerating = false;
        
        this.bindEvents();
        this.loadSavedSettings();
    }

    // Obtener referencias a elementos del DOM
    getElements() {
        return {
            batchForm: document.getElementById('batchForm'),
            wordsInput: document.getElementById('wordsInput'),
            batchAttemptsSelect: document.getElementById('batchAttemptsSelect'),
            batchHardModeCheck: document.getElementById('batchHardModeCheck'),
            autoAttemptsCheck: document.getElementById('autoAttemptsCheck'),
            previewBtn: document.getElementById('previewBtn'),
            generateAllBtn: document.getElementById('generateAllBtn'),
            batchResults: document.getElementById('batchResults'),
            resultsGrid: document.getElementById('resultsGrid'),
            batchStats: document.getElementById('batchStats'),
            copyAllUrlsBtn: document.getElementById('copyAllUrlsBtn'),
            downloadQRsBtn: document.getElementById('downloadQRsBtn'),
            printAllBtn: document.getElementById('printAllBtn'),
            previewModal: document.getElementById('previewModal'),
            previewContent: document.getElementById('previewContent'),
            closePreviewModal: document.getElementById('closePreviewModal'),
            cancelPreviewBtn: document.getElementById('cancelPreviewBtn'),
            confirmGenerateBtn: document.getElementById('confirmGenerateBtn'),
            progressModal: document.getElementById('progressModal'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            progressPercent: document.getElementById('progressPercent'),
            progressDetails: document.getElementById('progressDetails'),
            totalGames: document.getElementById('totalGames'),
            validWords: document.getElementById('validWords'),
            invalidWords: document.getElementById('invalidWords'),
            avgLength: document.getElementById('avgLength')
        };
    }

    // Vincular eventos
    bindEvents() {
        // Evento del formulario
        this.elements.batchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showPreview();
        });

        // Botón vista previa
        this.elements.previewBtn.addEventListener('click', () => {
            this.showPreview();
        });

        // Botón generar todos
        this.elements.generateAllBtn.addEventListener('click', () => {
            this.showPreview();
        });

        // Botón confirmar generación
        this.elements.confirmGenerateBtn.addEventListener('click', () => {
            this.generateAllGames();
        });

        // Botones de acciones
        this.elements.copyAllUrlsBtn.addEventListener('click', () => {
            this.copyAllUrls();
        });

        this.elements.downloadQRsBtn.addEventListener('click', () => {
            this.downloadAllQRs();
        });

        this.elements.printAllBtn.addEventListener('click', () => {
            this.printAll();
        });

        // Cerrar modales
        this.elements.closePreviewModal.addEventListener('click', () => {
            this.hidePreviewModal();
        });

        this.elements.cancelPreviewBtn.addEventListener('click', () => {
            this.hidePreviewModal();
        });

        // Cerrar modales al hacer clic fuera
        [this.elements.previewModal, this.elements.progressModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal === this.elements.previewModal) {
                        this.hidePreviewModal();
                    }
                }
            });
        });

        // Guardar configuración al cambiar
        [this.elements.batchAttemptsSelect, this.elements.batchHardModeCheck, this.elements.autoAttemptsCheck].forEach(element => {
            element.addEventListener('change', () => {
                this.saveSettings();
            });
        });

        // Actualizar estadísticas en tiempo real
        this.elements.wordsInput.addEventListener('input', () => {
            this.updatePreviewStats();
        });
    }

    // Cargar configuración guardada
    loadSavedSettings() {
        const savedSettings = Utils.loadFromStorage('wordlet-batch-settings', {});
        
        if (savedSettings.attempts) {
            this.elements.batchAttemptsSelect.value = savedSettings.attempts;
        }
        
        if (savedSettings.hardMode !== undefined) {
            this.elements.batchHardModeCheck.checked = savedSettings.hardMode;
        }

        if (savedSettings.autoAttempts !== undefined) {
            this.elements.autoAttemptsCheck.checked = savedSettings.autoAttempts;
        }

        if (savedSettings.lastWords) {
            this.elements.wordsInput.value = savedSettings.lastWords;
            this.updatePreviewStats();
        }
    }

    // Guardar configuración
    saveSettings() {
        const settings = {
            attempts: this.elements.batchAttemptsSelect.value,
            hardMode: this.elements.batchHardModeCheck.checked,
            autoAttempts: this.elements.autoAttemptsCheck.checked,
            lastWords: this.elements.wordsInput.value.trim(),
            lastSaved: Date.now()
        };
        
        Utils.saveToStorage('wordlet-batch-settings', settings);
    }

    // Parsear palabras del input
    parseWords() {
        const input = this.elements.wordsInput.value.trim();
        if (!input) return [];

        // Separar por líneas o comas
        const words = input
            .split(/[\n,]+/)
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length > 0)
            .filter((word, index, array) => array.indexOf(word) === index); // Eliminar duplicados

        return words;
    }

    // Calcular intentos automáticamente basado en la longitud
    calculateAttempts(wordLength) {
        if (!this.elements.autoAttemptsCheck.checked) {
            return parseInt(this.elements.batchAttemptsSelect.value);
        }

        // Fórmula: longitud + 1, mínimo 4, máximo 8
        return Math.max(4, Math.min(8, wordLength + 1));
    }

    // Actualizar estadísticas de vista previa
    updatePreviewStats() {
        const words = this.parseWords();
        const validWords = words.filter(word => Utils.isValidWord(word));
        const invalidWords = words.filter(word => !Utils.isValidWord(word));
        const avgLength = validWords.length > 0 ? 
            Math.round(validWords.reduce((sum, word) => sum + word.length, 0) / validWords.length * 10) / 10 : 0;

        this.elements.totalGames.textContent = words.length;
        this.elements.validWords.textContent = validWords.length;
        this.elements.invalidWords.textContent = invalidWords.length;
        this.elements.avgLength.textContent = avgLength;

        // Mostrar/ocultar sección de estadísticas
        if (words.length > 0) {
            this.elements.batchStats.style.display = 'block';
        } else {
            this.elements.batchStats.style.display = 'none';
        }
    }

    // Mostrar vista previa
    showPreview() {
        const words = this.parseWords();
        
        if (words.length === 0) {
            this.showError('Por favor ingresa al menos una palabra');
            this.elements.wordsInput.focus();
            return;
        }

        // Generar vista previa
        let previewHtml = '<div class="preview-list">';
        
        words.forEach((word, index) => {
            const isValid = Utils.isValidWord(word);
            const attempts = this.calculateAttempts(word.length);
            const hardMode = this.elements.batchHardModeCheck.checked;
            
            previewHtml += `
                <div class="preview-item ${isValid ? 'valid' : 'invalid'}">
                    <div class="preview-word">
                        <span class="word-text">${word}</span>
                        <span class="word-length">${word.length} letras</span>
                    </div>
                    <div class="preview-config">
                        <span class="attempts">${attempts} intentos</span>
                        ${hardMode ? '<span class="hard-mode">🔥 Difícil</span>' : ''}
                        ${!isValid ? '<span class="invalid-reason">❌ Inválida</span>' : ''}
                    </div>
                </div>
            `;
        });
        
        previewHtml += '</div>';
        
        // Añadir resumen
        const validCount = words.filter(word => Utils.isValidWord(word)).length;
        const invalidCount = words.length - validCount;
        
        previewHtml += `
            <div class="preview-summary">
                <h4>Resumen:</h4>
                <p>✅ ${validCount} palabras válidas</p>
                ${invalidCount > 0 ? `<p>❌ ${invalidCount} palabras inválidas (se omitirán)</p>` : ''}
                <p>📱 Se generarán ${validCount} códigos QR</p>
            </div>
        `;
        
        this.elements.previewContent.innerHTML = previewHtml;
        this.elements.previewModal.classList.add('active');
    }

    // Ocultar modal de vista previa
    hidePreviewModal() {
        this.elements.previewModal.classList.remove('active');
    }

    // Generar todos los juegos
    async generateAllGames() {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        this.hidePreviewModal();
        this.showProgressModal();
        
        const words = this.parseWords().filter(word => Utils.isValidWord(word));
        this.games = [];
        
        try {
            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const attempts = this.calculateAttempts(word.length);
                const hardMode = this.elements.batchHardModeCheck.checked;
                
                // Actualizar progreso
                const progress = ((i + 1) / words.length) * 100;
                this.updateProgress(progress, `Generando ${word}...`, `${i + 1} de ${words.length}`);
                
                // Generar juego
                const gameData = await this.generateSingleGame(word, attempts, hardMode);
                this.games.push(gameData);
                
                // Pequeña pausa para no sobrecargar la API de QR
                await Utils.delay(100);
            }
            
            // Guardar configuración
            this.saveSettings();
            
            // Mostrar resultados
            this.hideProgressModal();
            this.displayResults();
            
        } catch (error) {
            console.error('Error generando juegos:', error);
            this.hideProgressModal();
            this.showError('Error generando algunos juegos: ' + error.message);
        } finally {
            this.isGenerating = false;
        }
    }

    // Generar un juego individual
    async generateSingleGame(word, attempts, hardMode) {
        // Crear URL del juego
        const gameUrl = this.createGameUrl(word, attempts, hardMode);
        
        // Generar QR
        const qrDataUrl = await this.generateQRDataUrl(gameUrl);
        
        return {
            word: word,
            attempts: attempts,
            hardMode: hardMode,
            url: gameUrl,
            qrDataUrl: qrDataUrl,
            timestamp: Date.now()
        };
    }

    // Crear URL del juego
    createGameUrl(word, attempts, hardMode) {
        let baseUrl = window.location.origin;
        const currentPath = window.location.pathname;
        
        if (currentPath.endsWith('batch.html')) {
            baseUrl += currentPath.replace('batch.html', 'juego.html');
        } else if (currentPath.endsWith('/')) {
            baseUrl += currentPath + 'juego.html';
        } else {
            baseUrl += '/juego.html';
        }
        
        const normalizedWord = Utils.normalizeText(word);
        const encodedWord = btoa(normalizedWord);
        
        const params = new URLSearchParams({
            word: encodedWord,
            attempts: attempts,
            hard: hardMode ? '1' : '0'
        });

        return `${baseUrl}?${params.toString()}`;
    }

    // Generar QR como Data URL
    async generateQRDataUrl(url) {
        return new Promise((resolve) => {
            try {
                const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
                
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = () => {
                    // Crear canvas para convertir a data URL
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    const dataUrl = canvas.toDataURL('image/png');
                    resolve(dataUrl);
                };
                
                img.onerror = () => {
                    resolve(null); // Si falla, devolver null
                };
                
                img.src = qrApiUrl;
                
            } catch (error) {
                console.warn('Error generando QR:', error);
                resolve(null);
            }
        });
    }

    // Mostrar modal de progreso
    showProgressModal() {
        this.elements.progressModal.classList.add('active');
    }

    // Ocultar modal de progreso
    hideProgressModal() {
        this.elements.progressModal.classList.remove('active');
    }

    // Actualizar progreso
    updateProgress(percent, text, details) {
        this.elements.progressFill.style.width = `${percent}%`;
        this.elements.progressPercent.textContent = `${Math.round(percent)}%`;
        this.elements.progressText.textContent = text;
        this.elements.progressDetails.textContent = details;
    }

    // Mostrar resultados
    displayResults() {
        if (this.games.length === 0) {
            this.elements.resultsGrid.innerHTML = '<p>No se generaron juegos.</p>';
            return;
        }

        let resultsHtml = '';
        
        this.games.forEach((game, index) => {
            resultsHtml += `
                <div class="result-card">
                    <div class="result-header">
                        <h4>${game.word}</h4>
                        <div class="result-config">
                            <span class="attempts">${game.attempts} intentos</span>
                            ${game.hardMode ? '<span class="hard-mode">🔥</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="result-qr">
                        ${game.qrDataUrl ? 
                            `<img src="${game.qrDataUrl}" alt="QR ${game.word}" class="qr-image">` :
                            '<div class="qr-error">Error generando QR</div>'
                        }
                    </div>
                    
                    <div class="result-url">
                        <input type="text" value="${game.url}" readonly class="url-input">
                        <button class="btn btn-small copy-url-btn" data-url="${game.url}">📋</button>
                    </div>
                    
                    <div class="result-actions">
                        <button class="btn btn-small play-btn" onclick="window.open('${game.url}', '_blank')">
                            🎮 Jugar
                        </button>
                        ${game.qrDataUrl ? 
                            `<button class="btn btn-small download-qr-btn" data-url="${game.qrDataUrl}" data-name="${game.word}">
                                💾 QR
                            </button>` : ''
                        }
                    </div>
                </div>
            `;
        });
        
        this.elements.resultsGrid.innerHTML = resultsHtml;
        
        // Vincular eventos de los botones
        this.bindResultEvents();
        
        // Mostrar sección de resultados
        this.elements.batchResults.style.display = 'block';
        
        // Scroll a resultados
        this.elements.batchResults.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Vincular eventos de los resultados
    bindResultEvents() {
        // Botones copiar URL individual
        document.querySelectorAll('.copy-url-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const url = e.target.dataset.url;
                const success = await Utils.copyToClipboard(url);
                if (success) {
                    this.showSuccess('¡URL copiada!');
                } else {
                    this.showError('No se pudo copiar la URL');
                }
            });
        });

        // Botones descargar QR individual
        document.querySelectorAll('.download-qr-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dataUrl = e.target.dataset.url;
                const name = e.target.dataset.name;
                this.downloadQR(dataUrl, `wordlet-${name}.png`);
            });
        });
    }

    // Copiar todas las URLs
    async copyAllUrls() {
        if (this.games.length === 0) {
            this.showError('No hay URLs para copiar');
            return;
        }

        const urls = this.games.map(game => `${game.word}: ${game.url}`).join('\n');
        const success = await Utils.copyToClipboard(urls);
        
        if (success) {
            this.showSuccess('¡Todas las URLs copiadas al portapapeles!');
        } else {
            this.showError('No se pudieron copiar las URLs');
        }
    }

    // Descargar todos los QRs
    downloadAllQRs() {
        if (this.games.length === 0) {
            this.showError('No hay QRs para descargar');
            return;
        }

        this.games.forEach(game => {
            if (game.qrDataUrl) {
                setTimeout(() => {
                    this.downloadQR(game.qrDataUrl, `wordlet-${game.word}.png`);
                }, 100); // Pequeño delay entre descargas
            }
        });

        this.showSuccess(`Descargando ${this.games.length} códigos QR...`);
    }

    // Descargar QR individual
    downloadQR(dataUrl, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Imprimir todo
    printAll() {
        if (this.games.length === 0) {
            this.showError('No hay nada que imprimir');
            return;
        }

        // Crear ventana de impresión
        const printWindow = window.open('', '_blank');
        
        let printHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Wordlet - Juegos por Lotes</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .print-header { text-align: center; margin-bottom: 30px; }
                    .print-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
                    .print-card { border: 1px solid #ccc; padding: 15px; border-radius: 8px; text-align: center; break-inside: avoid; }
                    .print-word { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                    .print-config { font-size: 14px; color: #666; margin-bottom: 15px; }
                    .print-qr { margin: 15px 0; }
                    .print-qr img { max-width: 150px; }
                    .print-url { font-size: 10px; word-break: break-all; margin-top: 10px; }
                    @media print { .print-card { page-break-inside: avoid; } }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>🎯 Wordlet - Juegos por Lotes</h1>
                    <p>Generado el ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="print-grid">
        `;
        
        this.games.forEach(game => {
            printHtml += `
                <div class="print-card">
                    <div class="print-word">${game.word}</div>
                    <div class="print-config">
                        ${game.attempts} intentos
                        ${game.hardMode ? ' • Modo Difícil' : ''}
                    </div>
                    <div class="print-qr">
                        ${game.qrDataUrl ? 
                            `<img src="${game.qrDataUrl}" alt="QR ${game.word}">` :
                            '<div>Error generando QR</div>'
                        }
                    </div>
                    <div class="print-url">${game.url}</div>
                </div>
            `;
        });
        
        printHtml += `
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(printHtml);
        printWindow.document.close();
        
        // Esperar a que las imágenes se carguen antes de imprimir
        setTimeout(() => {
            printWindow.print();
        }, 1000);
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

// Función para verificar que todo esté listo
function initializeBatch() {
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('CONFIG no está disponible, usando valores por defecto');
        // Crear CONFIG básico si no existe
        window.CONFIG = {
            MIN_WORD_LENGTH: 3,
            MAX_WORD_LENGTH: 12
        };
    }
    
    // Inicializar BatchManager
    new BatchManager();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño delay para asegurar que todos los scripts se carguen
    setTimeout(initializeBatch, 100);
});