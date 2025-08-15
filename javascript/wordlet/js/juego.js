// JavaScript para la página del juego (juego.html)
class GameManager {
    constructor() {
        this.game = new WordleGame();
        this.elements = this.getElements();
        this.gameConfig = null;
        
        this.initializeGame();
        this.bindEvents();
    }

    // Obtener referencias a elementos del DOM
    getElements() {
        return {
            gameBoard: document.getElementById('gameBoard'),
            keyboard: document.getElementById('keyboard'),
            wordLength: document.getElementById('wordLength'),
            attemptsLeft: document.getElementById('attemptsLeft'),
            difficulty: document.getElementById('difficulty'),
            gameOverModal: document.getElementById('gameOverModal'),
            gameOverTitle: document.getElementById('gameOverTitle'),
            gameOverMessage: document.getElementById('gameOverMessage'),
            gameStats: document.getElementById('gameStats'),
            shareBtn: document.getElementById('shareBtn'),
            shareUrlBtn: document.getElementById('shareUrlBtn'),
            newGameBtn: document.getElementById('newGameBtn'),
            errorModal: document.getElementById('errorModal'),
            errorMessage: document.getElementById('errorMessage'),
            goToConfigBtn: document.getElementById('goToConfigBtn')
        };
    }

    // Inicializar juego
    initializeGame() {
        console.log('🎮 Inicializando GameManager');
        console.log('URL actual:', window.location.href);
        console.log('Parámetros:', window.location.search);

        // Cargar configuración desde URL
        if (!this.loadGameFromUrl()) {
            this.showError('No se pudo cargar la configuración del juego');
            return;
        }

        // Crear interfaz del juego
        this.createKeyboard();
        this.createGameBoard();
        this.updateGameBoard();
        this.updateKeyboard();
        this.updateGameInfo();

        console.log('✅ Juego inicializado correctamente');
    }

    // Cargar configuración del juego desde URL
    loadGameFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        
        console.log('🔍 Verificando parámetros URL:', Object.fromEntries(urlParams));
        console.log('URL completa:', window.location.href);

        if (!urlParams.has('word')) {
            console.error('❌ No se encontró parámetro "word"');
            return false;
        }

        try {
            const encodedWord = urlParams.get('word');
            console.log('🔤 Palabra codificada recibida:', encodedWord);
            
            // Intentar decodificar
            let word;
            try {
                word = atob(encodedWord);
                console.log('🔤 Palabra decodificada:', word);
            } catch (decodeError) {
                console.error('❌ Error decodificando palabra:', decodeError);
                throw new Error(`No se pudo decodificar la palabra: ${encodedWord}`);
            }
            
            const attempts = parseInt(urlParams.get('attempts')) || 6;
            const hardMode = urlParams.get('hard') === '1';

            console.log('📝 Configuración completa:', { 
                originalEncoded: encodedWord,
                decodedWord: word, 
                wordLength: word.length,
                attempts, 
                hardMode 
            });

            // Validar palabra con debugging detallado
            console.log('🔍 Validando palabra...');
            console.log('- Longitud:', word.length);
            console.log('- MIN_WORD_LENGTH:', CONFIG.MIN_WORD_LENGTH);
            console.log('- MAX_WORD_LENGTH:', CONFIG.MAX_WORD_LENGTH);
            console.log('- Contiene solo letras:', /^[A-ZÑ]+$/.test(word));
            
            if (!Utils.isValidWord(word)) {
                throw new Error(`Palabra inválida: "${word}" (longitud: ${word.length})`);
            }

            console.log('✅ Palabra válida');

            // Configurar juego
            this.game.setupGame(word, attempts, hardMode);
            
            // Guardar configuración
            this.gameConfig = { word, attempts, hardMode };

            console.log('✅ Juego configurado exitosamente');
            return true;

        } catch (error) {
            console.error('❌ Error cargando configuración:', error);
            console.error('Stack trace:', error.stack);
            this.showError(`Error cargando juego: ${error.message}`);
            return false;
        }
    }

    // Crear teclado virtual
    createKeyboard() {
        this.elements.keyboard.innerHTML = '';
        
        CONFIG.KEYBOARD_LAYOUT.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyElement = document.createElement('button');
                keyElement.className = 'key';
                keyElement.dataset.key = key;
                
                if (key === 'ENTER' || key === 'BACKSPACE') {
                    keyElement.classList.add('wide');
                    keyElement.textContent = key === 'ENTER' ? 'ENTER' : '⌫';
                } else {
                    keyElement.textContent = key;
                }
                
                keyboardRow.appendChild(keyElement);
            });
            
            this.elements.keyboard.appendChild(keyboardRow);
        });
    }

    // Crear tablero de juego
    createGameBoard() {
        this.elements.gameBoard.innerHTML = '';
        this.elements.gameBoard.style.gridTemplateColumns = `repeat(${this.game.targetWord.length}, 1fr)`;
        this.elements.gameBoard.style.gridTemplateRows = `repeat(${this.game.maxAttempts}, 1fr)`;

        for (let row = 0; row < this.game.maxAttempts; row++) {
            for (let col = 0; col < this.game.targetWord.length; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.row = row;
                tile.dataset.col = col;
                this.elements.gameBoard.appendChild(tile);
            }
        }
    }

    // Actualizar información del juego
    updateGameInfo() {
        const wordLength = this.game.targetWord.length;
        const attemptsLeft = this.game.maxAttempts - this.game.currentRow;
        
        this.elements.wordLength.textContent = `${wordLength} letras`;
        this.elements.attemptsLeft.textContent = `${attemptsLeft} intentos`;
        
        if (this.game.hardMode) {
            this.elements.difficulty.textContent = '🔥 Difícil';
            this.elements.difficulty.style.display = 'inline';
        } else {
            this.elements.difficulty.style.display = 'none';
        }
    }

    // Actualizar tablero de juego
    updateGameBoard() {
        // Actualizar palabra actual
        this.updateCurrentGuess();
        
        // Actualizar palabras enviadas
        this.game.guesses.forEach((guess, rowIndex) => {
            for (let col = 0; col < guess.word.length; col++) {
                const tile = this.getTile(rowIndex, col);
                if (tile) {
                    tile.textContent = guess.word[col];
                    tile.className = `tile filled ${guess.result[col]}`;
                }
            }
        });
    }

    // Actualizar palabra actual en el tablero
    updateCurrentGuess() {
        const currentRow = this.game.currentRow;
        
        // Limpiar fila actual
        for (let col = 0; col < this.game.targetWord.length; col++) {
            const tile = this.getTile(currentRow, col);
            if (tile) {
                tile.textContent = '';
                tile.className = 'tile';
            }
        }
        
        // Mostrar letras de la palabra actual
        for (let col = 0; col < this.game.currentGuess.length; col++) {
            const tile = this.getTile(currentRow, col);
            if (tile) {
                tile.textContent = this.game.currentGuess[col];
                tile.className = 'tile filled';
            }
        }
    }

    // Obtener tile específico
    getTile(row, col) {
        return this.elements.gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    // Actualizar teclado con estados de letras
    updateKeyboard() {
        const keys = this.elements.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
            const letter = key.dataset.key;
            if (letter && letter.length === 1) {
                const state = this.game.letterStates.get(letter);
                key.className = `key ${state}`;
            }
        });
    }

    // Animar envío de palabra
    async animateGuessSubmission(rowIndex) {
        const tiles = [];
        for (let col = 0; col < this.game.targetWord.length; col++) {
            tiles.push(this.getTile(rowIndex, col));
        }

        // Animar tiles uno por uno
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            if (tile) {
                tile.classList.add('flip');
                await Utils.delay(CONFIG.FLIP_DELAY);
            }
        }

        // Esperar a que termine la animación
        await Utils.delay(CONFIG.ANIMATION_DURATION);

        // Limpiar clases de animación
        tiles.forEach(tile => {
            if (tile) tile.classList.remove('flip');
        });
    }

    // Vincular eventos
    bindEvents() {
        // Eventos del teclado virtual
        this.elements.keyboard.addEventListener('click', (e) => {
            if (e.target.classList.contains('key')) {
                this.handleKeyPress(e.target.dataset.key);
            }
        });

        // Eventos del teclado físico
        document.addEventListener('keydown', (e) => {
            this.handlePhysicalKeyPress(e);
        });

        // Eventos de modales
        this.elements.shareBtn.addEventListener('click', () => {
            this.shareResults();
        });

        this.elements.shareUrlBtn.addEventListener('click', () => {
            this.shareResultUrl();
        });

        this.elements.newGameBtn.addEventListener('click', () => {
            this.goToConfig();
        });

        this.elements.goToConfigBtn.addEventListener('click', () => {
            this.goToConfig();
        });

        // Cerrar modales al hacer clic fuera
        [this.elements.gameOverModal, this.elements.errorModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // Manejar pulsación de tecla virtual
    handleKeyPress(key) {
        switch (key) {
            case 'ENTER':
                this.submitGuess();
                break;
            case 'BACKSPACE':
                this.removeLetter();
                break;
            default:
                this.addLetter(key);
                break;
        }
    }

    // Manejar pulsación de tecla física
    handlePhysicalKeyPress(e) {
        // No interceptar teclas si hay modales abiertos
        if (this.elements.gameOverModal.classList.contains('active') || 
            this.elements.errorModal.classList.contains('active')) {
            return;
        }
        
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const key = e.key.toUpperCase();
        
        if (key === 'ENTER') {
            e.preventDefault();
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            e.preventDefault();
            this.removeLetter();
        } else if (/^[A-ZÑ]$/.test(key)) {
            e.preventDefault();
            this.addLetter(key);
        }
    }

    // Agregar letra
    addLetter(letter) {
        if (this.game.addLetter(letter)) {
            this.updateCurrentGuess();
        }
    }

    // Eliminar letra
    removeLetter() {
        if (this.game.removeLetter()) {
            this.updateCurrentGuess();
        }
    }

    // Enviar palabra
    async submitGuess() {
        const result = this.game.submitGuess();
        
        if (!result.success) {
            this.showErrorToast(result.message);
            return;
        }

        // Animar envío
        await this.animateGuessSubmission(this.game.currentRow - 1);
        
        // Actualizar interfaz
        this.updateGameBoard();
        this.updateKeyboard();
        this.updateGameInfo();

        // Verificar fin de juego
        if (result.gameWon || result.gameOver) {
            const stats = this.game.getGameStats();
            setTimeout(() => {
                this.showGameOverModal(result.gameWon, result.message, stats);
            }, 500);
        }
    }

    // Mostrar modal de fin de juego
    showGameOverModal(won, message, stats) {
        this.elements.gameOverTitle.textContent = won ? '🎉 ¡Felicitaciones!' : '😔 Juego Terminado';
        this.elements.gameOverMessage.textContent = message;
        
        // Mostrar estadísticas
        this.elements.gameStats.innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${stats.attempts}</div>
                <div class="stat-label">Intentos</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${Utils.formatTime(stats.playTime)}</div>
                <div class="stat-label">Tiempo</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.targetWord.length}</div>
                <div class="stat-label">Letras</div>
            </div>
        `;

        this.elements.gameOverModal.classList.add('active');
    }

    // Compartir resultados
    async shareResults() {
        if (this.game.gameState === 'playing') {
            this.showErrorToast('Termina el juego primero');
            return;
        }

        const shareText = this.game.generateShareResult();
        const stats = this.game.getGameStats();
        const fullText = `${shareText}\n🎯 Palabra: ${stats.targetWord.length} letras\n⏱️ Tiempo: ${Utils.formatTime(stats.playTime)}\n${stats.hardMode ? '🔥 Modo difícil' : ''}\n\n¡Juega en Wordlet!`;

        try {
            if (navigator.share && Utils.isMobile()) {
                await navigator.share({
                    title: 'Wordlet - Mis Resultados',
                    text: fullText,
                    url: window.location.origin
                });
                this.showSuccessToast('¡Resultado compartido!');
            } else {
                const success = await Utils.copyToClipboard(fullText);
                if (success) {
                    this.showSuccessToast('¡Resultado copiado al portapapeles!');
                } else {
                    this.showErrorToast('No se pudo copiar el resultado');
                }
            }
        } catch (error) {
            console.warn('Error compartiendo:', error);
            const success = await Utils.copyToClipboard(fullText);
            if (success) {
                this.showSuccessToast('¡Resultado copiado al portapapeles!');
            } else {
                this.showErrorToast('No se pudo compartir el resultado');
            }
        }
    }

    // Compartir URL con resultado codificado
    async shareResultUrl() {
        if (this.game.gameState === 'playing') {
            this.showErrorToast('Termina el juego primero');
            return;
        }

        const resultUrl = this.game.generateResultUrl();
        
        if (!resultUrl) {
            this.showErrorToast('No se pudo generar la URL del resultado');
            return;
        }

        const stats = this.game.getGameStats();
        const shareText = `🎯 Wordlet completado!\n⏱️ Tiempo: ${Utils.formatTime(stats.playTime)}\n🎮 Intentos: ${stats.attempts}/${stats.maxAttempts}\n${stats.hardMode ? '🔥 Modo difícil\n' : ''}\n🔗 Ver mi resultado: ${resultUrl}`;

        try {
            if (navigator.share && Utils.isMobile()) {
                await navigator.share({
                    title: 'Wordlet - Mi Resultado con Tiempo',
                    text: shareText,
                    url: resultUrl
                });
                this.showSuccessToast('¡URL con tiempo compartida!');
            } else {
                const success = await Utils.copyToClipboard(shareText);
                if (success) {
                    this.showSuccessToast('¡URL con tiempo copiada al portapapeles!');
                } else {
                    this.showErrorToast('No se pudo copiar la URL');
                }
            }
        } catch (error) {
            console.warn('Error compartiendo URL:', error);
            const success = await Utils.copyToClipboard(resultUrl);
            if (success) {
                this.showSuccessToast('¡URL copiada al portapapeles!');
            } else {
                this.showErrorToast('No se pudo compartir la URL');
            }
        }
    }

    // Ir a configuración
    goToConfig() {
        window.location.href = 'palabra.html';
    }

    // Mostrar error
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorModal.classList.add('active');
    }

    // Mostrar toast de éxito
    showSuccessToast(message) {
        this.showToast(message, 'success');
    }

    // Mostrar toast de error
    showErrorToast(message) {
        this.showToast(message, 'error');
        Utils.vibrate([100, 50, 100]);
        
        // Animar shake en el tablero
        const currentRow = this.game.currentRow;
        for (let col = 0; col < this.game.targetWord.length; col++) {
            const tile = this.getTile(currentRow, col);
            if (tile && tile.textContent) {
                tile.classList.add('shake');
                setTimeout(() => tile.classList.remove('shake'), 500);
            }
        }
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

// Función de prueba manual para debugging
window.testGameLoad = function(testWord = 'GATOS') {
    console.log('🧪 PRUEBA MANUAL DE CARGA DE JUEGO');
    console.log('Palabra de prueba:', testWord);
    
    // Normalizar palabra
    const normalized = Utils.normalizeText(testWord);
    console.log('Normalizada:', normalized);
    
    // Codificar palabra
    const encoded = btoa(normalized);
    console.log('Codificada:', encoded);
    
    // Crear URL de prueba
    const testUrl = `${window.location.origin}/juego.html?word=${encoded}&attempts=6&hard=0`;
    console.log('URL de prueba:', testUrl);
    
    // Probar decodificación
    try {
        const decoded = atob(encoded);
        console.log('Decodificada:', decoded);
        console.log('¿Es válida?', Utils.isValidWord(decoded));
    } catch (error) {
        console.error('Error en decodificación:', error);
    }
    
    return testUrl;
};

// Función para probar validación específica
window.testValidation = function(word) {
    console.log('🔍 PRUEBA DE VALIDACIÓN');
    console.log('CONFIG disponible:', typeof CONFIG !== 'undefined');
    if (typeof CONFIG !== 'undefined') {
        console.log('MIN_WORD_LENGTH:', CONFIG.MIN_WORD_LENGTH);
        console.log('MAX_WORD_LENGTH:', CONFIG.MAX_WORD_LENGTH);
    }
    
    const result = Utils.isValidWord(word);
    console.log('Resultado final:', result);
    return result;
};

// Función para forzar carga de juego
window.forceGameLoad = function(word, attempts = 6, hardMode = false) {
    console.log('🔧 FORZANDO CARGA DE JUEGO');
    
    if (window.gameManager) {
        try {
            window.gameManager.game.setupGame(word, attempts, hardMode);
            window.gameManager.createGameBoard();
            window.gameManager.updateGameBoard();
            window.gameManager.updateKeyboard();
            window.gameManager.updateGameInfo();
            console.log('✅ Juego forzado exitosamente');
        } catch (error) {
            console.error('❌ Error forzando juego:', error);
        }
    } else {
        console.error('❌ GameManager no disponible');
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
});