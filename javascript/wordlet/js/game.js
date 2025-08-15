// Lógica principal del juego Wordle
class WordleGame {
    constructor() {
        this.targetWord = '';
        this.currentGuess = '';
        this.guesses = [];
        this.currentRow = 0;
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
        this.maxAttempts = CONFIG.DEFAULT_ATTEMPTS;
        this.hardMode = CONFIG.DEFAULT_HARD_MODE;
        this.startTime = null;
        this.endTime = null;
        this.letterStates = new Map();
        
        this.initializeLetterStates();
    }

    // Inicializar estados de letras
    initializeLetterStates() {
        const allLetters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
        for (let letter of allLetters) {
            this.letterStates.set(letter, CONFIG.LETTER_STATES.UNUSED);
        }
    }

    // Configurar nuevo juego
    setupGame(targetWord, maxAttempts = CONFIG.DEFAULT_ATTEMPTS, hardMode = false) {
        this.targetWord = Utils.normalizeText(targetWord);
        this.maxAttempts = maxAttempts;
        this.hardMode = hardMode;
        this.currentGuess = '';
        this.guesses = [];
        this.currentRow = 0;
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.endTime = null;
        this.initializeLetterStates();

        if (!Utils.isValidWord(this.targetWord)) {
            throw new Error(CONFIG.MESSAGES.INVALID_WORD);
        }
    }

    // Agregar letra a la palabra actual
    addLetter(letter) {
        if (this.gameState !== 'playing') return false;
        if (this.currentGuess.length >= this.targetWord.length) return false;

        this.currentGuess += Utils.normalizeText(letter);
        return true;
    }

    // Eliminar última letra
    removeLetter() {
        if (this.gameState !== 'playing') return false;
        if (this.currentGuess.length === 0) return false;

        this.currentGuess = this.currentGuess.slice(0, -1);
        return true;
    }

    // Enviar palabra actual
    submitGuess() {
        if (this.gameState !== 'playing') return { success: false, message: 'Juego terminado' };
        if (this.currentGuess.length !== this.targetWord.length) {
            return { success: false, message: CONFIG.MESSAGES.INCOMPLETE_WORD };
        }

        // Validar modo difícil
        if (this.hardMode && !this.validateHardMode()) {
            return { success: false, message: CONFIG.MESSAGES.HARD_MODE_VIOLATION };
        }

        const result = this.evaluateGuess(this.currentGuess);
        this.guesses.push({
            word: this.currentGuess,
            result: result
        });

        this.updateLetterStates(this.currentGuess, result);
        
        // Verificar si ganó
        if (this.currentGuess === this.targetWord) {
            this.gameState = 'won';
            this.endTime = Date.now();
            return { success: true, gameWon: true, message: CONFIG.MESSAGES.WIN };
        }

        this.currentRow++;
        this.currentGuess = '';

        // Verificar si perdió
        if (this.currentRow >= this.maxAttempts) {
            this.gameState = 'lost';
            this.endTime = Date.now();
            return { 
                success: true, 
                gameOver: true, 
                message: CONFIG.MESSAGES.LOSE + this.targetWord 
            };
        }

        return { success: true };
    }

    // Evaluar palabra ingresada
    evaluateGuess(guess) {
        const result = [];
        const targetLetters = [...this.targetWord];
        const guessLetters = [...guess];
        
        // Primera pasada: marcar letras correctas
        for (let i = 0; i < guessLetters.length; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = CONFIG.LETTER_STATES.CORRECT;
                targetLetters[i] = null;
                guessLetters[i] = null;
            }
        }
        
        // Segunda pasada: marcar letras presentes
        for (let i = 0; i < guessLetters.length; i++) {
            if (guessLetters[i] !== null) {
                const targetIndex = targetLetters.indexOf(guessLetters[i]);
                if (targetIndex !== -1) {
                    result[i] = CONFIG.LETTER_STATES.PRESENT;
                    targetLetters[targetIndex] = null;
                } else {
                    result[i] = CONFIG.LETTER_STATES.ABSENT;
                }
            }
        }
        
        return result;
    }

    // Actualizar estados de letras para el teclado
    updateLetterStates(guess, result) {
        for (let i = 0; i < guess.length; i++) {
            const letter = guess[i];
            const currentState = this.letterStates.get(letter);
            const newState = result[i];

            // Solo actualizar si el nuevo estado es "mejor"
            if (currentState === CONFIG.LETTER_STATES.UNUSED ||
                (currentState === CONFIG.LETTER_STATES.ABSENT && newState !== CONFIG.LETTER_STATES.ABSENT) ||
                (currentState === CONFIG.LETTER_STATES.PRESENT && newState === CONFIG.LETTER_STATES.CORRECT)) {
                this.letterStates.set(letter, newState);
            }
        }
    }

    // Validar modo difícil
    validateHardMode() {
        if (!this.hardMode || this.guesses.length === 0) return true;

        const lastGuess = this.guesses[this.guesses.length - 1];
        const lastResult = lastGuess.result;
        const lastWord = lastGuess.word;

        // Verificar que use letras correctas en la misma posición
        for (let i = 0; i < lastResult.length; i++) {
            if (lastResult[i] === CONFIG.LETTER_STATES.CORRECT) {
                if (this.currentGuess[i] !== lastWord[i]) {
                    return false;
                }
            }
        }

        // Verificar que use letras presentes
        for (let i = 0; i < lastResult.length; i++) {
            if (lastResult[i] === CONFIG.LETTER_STATES.PRESENT) {
                if (!this.currentGuess.includes(lastWord[i])) {
                    return false;
                }
            }
        }

        return true;
    }

    // Obtener estadísticas del juego
    getGameStats() {
        const playTime = this.endTime ? 
            Math.floor((this.endTime - this.startTime) / 1000) : 
            Math.floor((Date.now() - this.startTime) / 1000);

        return {
            attempts: this.currentRow + (this.gameState === 'won' ? 1 : 0),
            maxAttempts: this.maxAttempts,
            playTime: playTime,
            gameState: this.gameState,
            targetWord: this.targetWord,
            hardMode: this.hardMode
        };
    }

    // Generar resultado para compartir
    generateShareResult() {
        let result = `Wordlet ${this.currentRow}/${this.maxAttempts}\n\n`;
        
        for (let guess of this.guesses) {
            for (let state of guess.result) {
                switch (state) {
                    case CONFIG.LETTER_STATES.CORRECT:
                        result += '🟩';
                        break;
                    case CONFIG.LETTER_STATES.PRESENT:
                        result += '🟨';
                        break;
                    case CONFIG.LETTER_STATES.ABSENT:
                        result += '⬛';
                        break;
                }
            }
            result += '\n';
        }

        return result;
    }

    // Generar URL con resultado codificado
    generateResultUrl() {
        if (this.gameState === 'playing') {
            return null;
        }

        const stats = this.getGameStats();
        
        // Crear datos del resultado
        const resultData = {
            word: this.targetWord,
            attempts: stats.attempts,
            maxAttempts: this.maxAttempts,
            playTime: stats.playTime,
            gameState: this.gameState,
            hardMode: this.hardMode,
            guesses: this.guesses.map(guess => ({
                word: guess.word,
                result: guess.result
            })),
            timestamp: Date.now()
        };

        // Codificar resultado en base64
        const encodedResult = btoa(JSON.stringify(resultData));
        
        // Crear URL base
        let baseUrl = window.location.origin;
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('juego.html')) {
            baseUrl += currentPath.replace('juego.html', 'resultado.html');
        } else {
            baseUrl += '/resultado.html';
        }

        const params = new URLSearchParams({
            data: encodedResult
        });

        return `${baseUrl}?${params.toString()}`;
    }

    // Obtener estado actual del juego
    getCurrentState() {
        return {
            targetWord: this.targetWord,
            currentGuess: this.currentGuess,
            guesses: this.guesses,
            currentRow: this.currentRow,
            gameState: this.gameState,
            maxAttempts: this.maxAttempts,
            hardMode: this.hardMode,
            letterStates: Object.fromEntries(this.letterStates)
        };
    }
}