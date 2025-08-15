// Manejo de la interfaz de usuario
class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = this.getElements();
        this.animations = new Map();
        
        this.initializeUI();
        this.bindEvents();
    }

    // Obtener referencias a elementos del DOM
    getElements() {
        return {
            gameBoard: document.getElementById('gameBoard'),
            keyboard: document.getElementById('keyboard'),
            settingsBtn: document.getElementById('settingsBtn'),
            settingsModal: document.getElementById('settingsModal'),
            gameOverModal: document.getElementById('gameOverModal'),
            closeModal: document.getElementById('closeModal'),
            wordInput: document.getElementById('wordInput'),
            attemptsSelect: document.getElementById('attemptsSelect'),
            hardModeCheck: document.getElementById('hardModeCheck'),
            startGameBtn: document.getElementById('startGameBtn'),
            newGameBtn: document.getElementById('newGameBtn'),
            shareBtn: document.getElementById('shareBtn'),
            gameOverTitle: document.getElementById('gameOverTitle'),
            gameOverMessage: document.getElementById('gameOverMessage'),
            gameStats: document.getElementById('gameStats'),
            qrSection: document.getElementById('qrSection'),
            qrCode: document.getElementById('qrCode'),
            gameUrl: document.getElementById('gameUrl'),
            copyUrlBtn: document.getElementById('copyUrlBtn')
        };
    }

    // Inicializar interfaz
    initializeUI() {
        console.log('=== INICIALIZANDO UI ===');
        console.log('URL actual:', window.location.href);
        console.log('Search params:', window.location.search);
        
        this.createKeyboard();
        
        // Verificar si hay un juego compartido en la URL
        const gameLoaded = this.loadGameFromUrl();
        console.log('¿Juego cargado desde URL?', gameLoaded);
        
        if (gameLoaded) {
            // Si se cargó un juego compartido, no mostrar demo ni modal
            console.log('Juego compartido cargado exitosamente, saltando demo y modal');
            console.log('Juego compartido cargado exitosamente, saltando demo y modal');
            return;
        }
        
        console.log('No hay juego compartido, iniciando flujo normal');
        this.showWelcomeMessage();
        // Iniciar juego de demostración automáticamente
        this.startDemoGame();
        // Mostrar modal de configuración después de un momento
        setTimeout(() => {
            this.showSettingsModal();
        }, 1000);
    }

    // Iniciar juego de demostración
    startDemoGame() {
        try {
            // Configurar juego con palabra de demostración
            this.game.setupGame('JUEGO', 6, false);
            this.createGameBoard();
            this.updateGameBoard();
            this.updateKeyboard();
            
            // Mostrar mensaje de demostración
            this.showToast('¡Juego de demostración! Palabra: JUEGO', 'info');
        } catch (error) {
            console.warn('Error iniciando juego de demostración:', error);
        }
    }

    // Mostrar mensaje de bienvenida
    showWelcomeMessage() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';
        welcomeDiv.innerHTML = `
            <div class="welcome-content">
                <h2>¡Bienvenido a Wordlet! 🎯</h2>
                <p>Para empezar a jugar:</p>
                <ol>
                    <li>Haz clic en ⚙️ para configurar</li>
                    <li>Ingresa la palabra a adivinar</li>
                    <li>Selecciona las opciones</li>
                    <li>¡Inicia el juego!</li>
                </ol>
            </div>
        `;
        
        this.elements.gameBoard.appendChild(welcomeDiv);
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

    // Mostrar modal de configuración
    showSettingsModal() {
        this.elements.settingsModal.classList.add('active');
    }

    // Ocultar modal de configuración
    hideSettingsModal() {
        this.elements.settingsModal.classList.remove('active');
    }

    // Mostrar modal de fin de juego
    showGameOverModal(won, message, stats) {
        this.elements.gameOverTitle.textContent = won ? '¡Felicitaciones!' : 'Juego Terminado';
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

        // Habilitar configuración al terminar el juego
        this.enableSettings();
        
        this.elements.gameOverModal.classList.add('active');
    }

    // Ocultar modal de fin de juego
    hideGameOverModal() {
        this.elements.gameOverModal.classList.remove('active');
    }

    // Mostrar mensaje de error
    showError(message) {
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

    // Mostrar toast genérico
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
        this.elements.settingsBtn.addEventListener('click', () => {
            this.showSettingsModal();
        });

        this.elements.closeModal.addEventListener('click', () => {
            this.hideSettingsModal();
        });

        this.elements.startGameBtn.addEventListener('click', () => {
            this.startNewGame();
        });

        this.elements.newGameBtn.addEventListener('click', () => {
            this.hideGameOverModal();
            this.showSettingsModal();
        });

        this.elements.shareBtn.addEventListener('click', () => {
            this.shareResults();
        });

        this.elements.copyUrlBtn.addEventListener('click', () => {
            this.copyGameUrl();
        });

        // Cerrar modales al hacer clic fuera
        [this.elements.settingsModal, this.elements.gameOverModal].forEach(modal => {
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
        // No interceptar teclas si estamos escribiendo en un input o textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // No interceptar si hay modales abiertos (excepto si es el modal de juego terminado)
        if (this.elements.settingsModal.classList.contains('active')) {
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
            this.showError(result.message);
            return;
        }

        // Animar envío
        await this.animateGuessSubmission(this.game.currentRow - 1);
        
        // Actualizar interfaz
        this.updateGameBoard();
        this.updateKeyboard();

        // Verificar fin de juego
        if (result.gameWon || result.gameOver) {
            const stats = this.game.getGameStats();
            setTimeout(() => {
                this.showGameOverModal(result.gameWon, result.message, stats);
            }, 500);
        }
    }

    // Compartir resultados
    async shareResults() {
        if (this.game.gameState === 'playing') {
            this.showToast('Termina el juego primero', 'warning');
            return;
        }

        const shareText = this.game.generateShareResult();
        const stats = this.game.getGameStats();
        const fullText = `${shareText}\n🎯 Palabra: ${stats.targetWord.length} letras\n⏱️ Tiempo: ${Utils.formatTime(stats.playTime)}\n${stats.hardMode ? '🔥 Modo difícil' : ''}\n\n¡Juega en Wordlet!`;

        try {
            // Intentar usar la API nativa de compartir si está disponible
            if (navigator.share && Utils.isMobile()) {
                await navigator.share({
                    title: 'Wordlet - Mis Resultados',
                    text: fullText,
                    url: window.location.href
                });
                this.showToast('¡Resultado compartido!', 'success');
            } else {
                // Fallback: copiar al portapapeles
                const success = await Utils.copyToClipboard(fullText);
                if (success) {
                    this.showToast('¡Resultado copiado al portapapeles!', 'success');
                } else {
                    this.showToast('No se pudo copiar el resultado', 'error');
                }
            }
        } catch (error) {
            console.warn('Error compartiendo:', error);
            // Intentar copiar al portapapeles como fallback
            const success = await Utils.copyToClipboard(fullText);
            if (success) {
                this.showToast('¡Resultado copiado al portapapeles!', 'success');
            } else {
                this.showToast('No se pudo compartir el resultado', 'error');
            }
        }
    }

    // Generar QR y mostrar sección multijugador
    generateQRCode(word, attempts, hardMode) {
        // Crear URL con parámetros del juego
        const baseUrl = window.location.origin + window.location.pathname;
        
        // Codificar la palabra de manera segura para URL
        const encodedWord = btoa(word);
        
        const gameParams = new URLSearchParams({
            word: encodedWord,
            attempts: attempts,
            hard: hardMode ? '1' : '0'
        });
        const gameUrl = `${baseUrl}?${gameParams.toString()}`;
        
        console.log('URL generada:', gameUrl);
        console.log('Palabra original:', word);
        console.log('Palabra codificada:', encodedWord);
        
        // Actualizar enlace
        this.elements.gameUrl.href = gameUrl;
        this.elements.gameUrl.textContent = gameUrl;
        
        // Generar QR usando una API pública
        this.generateQR(gameUrl);
        
        // Mostrar sección QR
        this.elements.qrSection.classList.add('active');
        
        return gameUrl;
    }

    // Generar código QR usando API pública
    generateQR(url) {
        this.elements.qrCode.innerHTML = '<div class="qr-loading">Generando código QR...</div>';
        
        try {
            // Usar API de QR Server para generar el código QR
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

    // Copiar URL del juego
    async copyGameUrl() {
        const url = this.elements.gameUrl.href;
        const success = await Utils.copyToClipboard(url);
        
        if (success) {
            this.showToast('¡Enlace copiado al portapapeles!', 'success');
        } else {
            this.showToast('No se pudo copiar el enlace', 'error');
        }
    }

    // Ocultar sección QR (cuando el juego está en progreso)
    hideQRSection() {
        this.elements.qrSection.classList.remove('active');
    }

    // Mostrar sección QR
    showQRSection() {
        this.elements.qrSection.classList.add('active');
    }

    // Función de prueba para verificar codificación/decodificación
    testEncoding() {
        const testWords = ['GATOS', 'PYTHON', 'JAVASCRIPT', 'CASA'];
        console.log('=== PRUEBA DE CODIFICACIÓN ===');
        
        testWords.forEach(word => {
            try {
                const encoded = btoa(word);
                const decoded = atob(encoded);
                console.log(`${word} → ${encoded} → ${decoded} ✓`);
            } catch (error) {
                console.error(`Error con "${word}":`, error);
            }
        });
        
        // Generar URL de prueba
        const testWord = 'GATOS';
        const testEncoded = btoa(testWord);
        const baseUrl = window.location.origin + window.location.pathname;
        const testUrl = `${baseUrl}?word=${testEncoded}&attempts=6&hard=0`;
        console.log('=== URL DE PRUEBA ===');
        console.log('Puedes probar esta URL manualmente:', testUrl);
    }

    // Cargar juego desde URL
    loadGameFromUrl() {
        console.log('🔍 INICIANDO loadGameFromUrl()');
        
        // Ejecutar prueba de codificación para debugging
        this.testEncoding();
        
        const urlParams = new URLSearchParams(window.location.search);
        
        console.log('Verificando URL params:', window.location.search);
        console.log('Parámetros encontrados:', Object.fromEntries(urlParams));
        
        if (urlParams.has('word')) {
            console.log('✅ Parámetro "word" encontrado, procesando...');
            try {
                const encodedWord = urlParams.get('word');
                console.log('Palabra codificada recibida:', encodedWord);
                
                const word = atob(encodedWord); // Decodificar base64
                const attempts = parseInt(urlParams.get('attempts')) || 6;
                const hardMode = urlParams.get('hard') === '1';
                
                console.log('Configuración del juego decodificada:', { word, attempts, hardMode });
                
                // Validar que la palabra sea válida
                console.log('🔍 Validando palabra con Utils.isValidWord...');
                if (!Utils.isValidWord(word)) {
                    throw new Error(`Palabra inválida en la URL: "${word}"`);
                }
                console.log('✅ Palabra válida');
                
                // Configurar el juego automáticamente
                console.log('🎮 Configurando juego automáticamente...');
                this.game.setupGame(word, attempts, hardMode);
                this.createGameBoard();
                this.updateGameBoard();
                this.updateKeyboard();
                
                // Deshabilitar configuración durante el juego compartido
                this.disableSettings();
                
                // Mostrar mensaje de juego compartido
                this.showToast(`¡Juego compartido cargado! Palabra de ${word.length} letras, ${attempts} intentos`, 'success');
                
                // Limpiar la URL para que no se vea la palabra codificada
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
                
                console.log('🎉 Juego cargado exitosamente desde URL');
                // No mostrar modal de configuración
                return true;
                
            } catch (error) {
                console.error('❌ Error cargando juego desde URL:', error);
                this.showToast('Error cargando juego compartido: ' + error.message, 'error');
            }
        } else {
            console.log('❌ No se encontró parámetro "word" en la URL');
        }
        
        console.log('🔍 loadGameFromUrl() terminado, retornando false');
        return false;
    }

    // Deshabilitar botón de configuración durante el juego
    disableSettings() {
        this.elements.settingsBtn.disabled = true;
        this.elements.settingsBtn.style.opacity = '0.5';
        this.elements.settingsBtn.style.cursor = 'not-allowed';
        this.elements.settingsBtn.title = 'Configuración deshabilitada durante el juego';
    }

    // Habilitar botón de configuración
    enableSettings() {
        this.elements.settingsBtn.disabled = false;
        this.elements.settingsBtn.style.opacity = '1';
        this.elements.settingsBtn.style.cursor = 'pointer';
        this.elements.settingsBtn.title = 'Configuración';
    }

    // Iniciar nuevo juego
    startNewGame() {
        const word = this.elements.wordInput.value.trim();
        const attempts = parseInt(this.elements.attemptsSelect.value);
        const hardMode = this.elements.hardModeCheck.checked;

        if (!word) {
            this.showError('Por favor ingresa una palabra');
            return;
        }

        try {
            // Generar QR antes de iniciar el juego
            this.generateQRCode(word, attempts, hardMode);
            
            // Configurar juego
            this.game.setupGame(word, attempts, hardMode);
            this.createGameBoard();
            this.updateGameBoard();
            this.updateKeyboard();
            this.hideSettingsModal();
            
            // Deshabilitar configuración durante el juego
            this.disableSettings();
            
            // Ocultar QR después de unos segundos para mantener la palabra secreta
            setTimeout(() => {
                this.hideQRSection();
                this.showToast('QR ocultado para mantener la palabra secreta', 'info');
            }, 10000); // 10 segundos para que otros puedan escanear
            
            // Guardar configuración
            if (window.WordletApp) {
                window.WordletApp.saveSettings();
            }
        } catch (error) {
            this.showError(error.message);
        }
    }
}