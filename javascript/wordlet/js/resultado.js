// JavaScript para la página de resultados (resultado.html)
class ResultManager {
    constructor() {
        this.elements = this.getElements();
        this.resultData = null;
        
        this.initializeResult();
        this.bindEvents();
    }

    // Obtener referencias a elementos del DOM
    getElements() {
        return {
            resultInfo: document.getElementById('resultInfo'),
            resultTitle: document.getElementById('resultTitle'),
            resultStatus: document.getElementById('resultStatus'),
            timeResult: document.getElementById('timeResult'),
            attemptsResult: document.getElementById('attemptsResult'),
            wordLengthResult: document.getElementById('wordLengthResult'),
            difficultyResult: document.getElementById('difficultyResult'),
            resultBoard: document.getElementById('resultBoard'),
            emojiResult: document.getElementById('emojiResult'),
            copyEmojiBtn: document.getElementById('copyEmojiBtn'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            shareResultBtn: document.getElementById('shareResultBtn'),
            newGameBtn: document.getElementById('newGameBtn'),
            gameDate: document.getElementById('gameDate'),
            targetWord: document.getElementById('targetWord'),
            gameMode: document.getElementById('gameMode'),
            gameState: document.getElementById('gameState'),
            errorModal: document.getElementById('errorModal'),
            errorMessage: document.getElementById('errorMessage'),
            goToIndexBtn: document.getElementById('goToIndexBtn')
        };
    }

    // Inicializar resultado
    initializeResult() {
        console.log('🏆 Inicializando ResultManager');
        console.log('URL actual:', window.location.href);
        console.log('Parámetros:', window.location.search);

        // Cargar resultado desde URL
        if (!this.loadResultFromUrl()) {
            this.showError('No se pudo cargar el resultado');
            return;
        }

        // Mostrar resultado
        this.displayResult();

        console.log('✅ Resultado inicializado correctamente');
    }

    // Cargar resultado desde URL
    loadResultFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        
        console.log('🔍 Verificando parámetros URL:', Object.fromEntries(urlParams));

        if (!urlParams.has('data')) {
            console.error('❌ No se encontró parámetro "data"');
            return false;
        }

        try {
            const encodedData = urlParams.get('data');
            console.log('📦 Datos codificados recibidos:', encodedData);
            
            // Decodificar URL encoding primero (por si hay %3D, etc.)
            const urlDecoded = decodeURIComponent(encodedData);
            console.log('📦 URL decodificado:', urlDecoded);
            
            // Luego decodificar Base64
            const decodedData = atob(urlDecoded);
            console.log('📦 Base64 decodificado:', decodedData);
            
            // Parsear JSON
            this.resultData = JSON.parse(decodedData);
            console.log('📊 Datos del resultado:', this.resultData);

            // Validar datos
            if (!this.validateResultData()) {
                throw new Error('Datos del resultado inválidos');
            }

            console.log('✅ Resultado cargado exitosamente');
            return true;

        } catch (error) {
            console.error('❌ Error cargando resultado:', error);
            this.showError(`Error cargando resultado: ${error.message}`);
            return false;
        }
    }

    // Validar datos del resultado
    validateResultData() {
        if (!this.resultData) return false;
        
        const required = ['word', 'attempts', 'maxAttempts', 'playTime', 'gameState', 'guesses'];
        
        for (let field of required) {
            if (this.resultData[field] === undefined) {
                console.error(`Campo requerido faltante: ${field}`);
                return false;
            }
        }
        
        return true;
    }

    // Mostrar resultado
    displayResult() {
        const data = this.resultData;
        
        // Título y estado
        const won = data.gameState === 'won';
        this.elements.resultTitle.textContent = won ? 
            `¡${data.word} resuelto!` : 
            `${data.word} - No resuelto`;
        
        this.elements.resultStatus.textContent = won ? '🎉 ¡Ganaste!' : '😔 No completado';
        this.elements.resultStatus.className = `result-status ${won ? 'won' : 'lost'}`;

        // Estadísticas
        this.elements.timeResult.textContent = Utils.formatTime(data.playTime);
        this.elements.attemptsResult.textContent = `${data.attempts}/${data.maxAttempts}`;
        this.elements.wordLengthResult.textContent = data.word.length;
        this.elements.difficultyResult.textContent = data.hardMode ? '🔥 Difícil' : 'Normal';

        // Detalles
        this.elements.gameDate.textContent = new Date(data.timestamp).toLocaleString();
        this.elements.targetWord.textContent = data.word;
        this.elements.gameMode.textContent = data.hardMode ? 'Difícil' : 'Normal';
        this.elements.gameState.textContent = won ? 'Completado' : 'No completado';

        // Tablero
        this.createResultBoard();
        
        // Resultado visual con emojis
        this.createEmojiResult();
    }

    // Crear tablero de resultado
    createResultBoard() {
        const data = this.resultData;
        
        this.elements.resultBoard.innerHTML = '';
        this.elements.resultBoard.style.gridTemplateColumns = `repeat(${data.word.length}, 1fr)`;
        this.elements.resultBoard.style.gridTemplateRows = `repeat(${data.maxAttempts}, 1fr)`;

        // Crear tiles para todos los intentos
        for (let row = 0; row < data.maxAttempts; row++) {
            for (let col = 0; col < data.word.length; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                
                // Si hay un intento para esta fila
                if (row < data.guesses.length) {
                    const guess = data.guesses[row];
                    if (col < guess.word.length) {
                        tile.textContent = guess.word[col];
                        tile.classList.add('filled', guess.result[col]);
                    }
                }
                
                this.elements.resultBoard.appendChild(tile);
            }
        }
    }

    // Crear resultado visual con emojis
    createEmojiResult() {
        const data = this.resultData;
        
        let emojiText = `Wordlet ${data.attempts}/${data.maxAttempts}\n`;
        emojiText += `⏱️ ${Utils.formatTime(data.playTime)}\n`;
        if (data.hardMode) {
            emojiText += `🔥 Modo difícil\n`;
        }
        emojiText += '\n';
        
        // Añadir emojis del tablero
        data.guesses.forEach(guess => {
            guess.result.forEach(state => {
                switch (state) {
                    case 'correct':
                        emojiText += '🟩';
                        break;
                    case 'present':
                        emojiText += '🟨';
                        break;
                    case 'absent':
                        emojiText += '⬛';
                        break;
                }
            });
            emojiText += '\n';
        });
        
        this.elements.emojiResult.textContent = emojiText;
    }

    // Vincular eventos
    bindEvents() {
        // Botón copiar resultado emoji
        this.elements.copyEmojiBtn.addEventListener('click', () => {
            this.copyEmojiResult();
        });

        // Botón jugar otra vez
        this.elements.playAgainBtn.addEventListener('click', () => {
            this.playAgain();
        });

        // Botón compartir resultado
        this.elements.shareResultBtn.addEventListener('click', () => {
            this.shareResult();
        });

        // Botón nuevo juego
        this.elements.newGameBtn.addEventListener('click', () => {
            this.goToIndex();
        });

        // Botón ir a inicio (modal de error)
        this.elements.goToIndexBtn.addEventListener('click', () => {
            this.goToIndex();
        });

        // Cerrar modal al hacer clic fuera
        this.elements.errorModal.addEventListener('click', (e) => {
            if (e.target === this.elements.errorModal) {
                this.elements.errorModal.classList.remove('active');
            }
        });
    }

    // Copiar resultado emoji
    async copyEmojiResult() {
        const emojiText = this.elements.emojiResult.textContent;
        const success = await Utils.copyToClipboard(emojiText);
        
        if (success) {
            this.showSuccess('¡Resultado copiado al portapapeles!');
        } else {
            this.showError('No se pudo copiar el resultado');
        }
    }

    // Jugar otra vez con la misma palabra
    playAgain() {
        if (!this.resultData) {
            this.showError('No hay datos del juego para repetir');
            return;
        }

        // Crear URL para jugar la misma palabra
        const baseUrl = window.location.origin + window.location.pathname.replace('resultado.html', 'juego.html');
        const encodedWord = btoa(this.resultData.word);
        
        const params = new URLSearchParams({
            word: encodedWord,
            attempts: this.resultData.maxAttempts,
            hard: this.resultData.hardMode ? '1' : '0'
        });

        const gameUrl = `${baseUrl}?${params.toString()}`;
        window.location.href = gameUrl;
    }

    // Compartir resultado
    async shareResult() {
        if (!this.resultData) {
            this.showError('No hay resultado para compartir');
            return;
        }

        const currentUrl = window.location.href;
        const data = this.resultData;
        const won = data.gameState === 'won';
        
        const shareText = `🎯 Wordlet ${won ? 'completado' : 'intentado'}!\n` +
                         `📝 Palabra: ${data.word}\n` +
                         `⏱️ Tiempo: ${Utils.formatTime(data.playTime)}\n` +
                         `🎮 Intentos: ${data.attempts}/${data.maxAttempts}\n` +
                         `${data.hardMode ? '🔥 Modo difícil\n' : ''}` +
                         `🔗 Ver resultado: ${currentUrl}`;

        try {
            if (navigator.share && Utils.isMobile()) {
                await navigator.share({
                    title: 'Wordlet - Mi Resultado',
                    text: shareText,
                    url: currentUrl
                });
                this.showSuccess('¡Resultado compartido!');
            } else {
                const success = await Utils.copyToClipboard(shareText);
                if (success) {
                    this.showSuccess('¡Enlace del resultado copiado al portapapeles!');
                } else {
                    this.showError('No se pudo compartir el resultado');
                }
            }
        } catch (error) {
            console.warn('Error compartiendo:', error);
            const success = await Utils.copyToClipboard(currentUrl);
            if (success) {
                this.showSuccess('¡Enlace copiado al portapapeles!');
            } else {
                this.showError('No se pudo compartir el resultado');
            }
        }
    }

    // Ir a página principal
    goToIndex() {
        window.location.href = 'palabra.html';
    }

    // Mostrar error
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorModal.classList.add('active');
    }

    // Mostrar mensaje de éxito
    showSuccess(message) {
        this.showToast(message, 'success');
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ResultManager();
});