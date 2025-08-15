// Configuración global del juego
const CONFIG = {
    // Configuración por defecto
    DEFAULT_WORD: 'JUEGO',
    DEFAULT_ATTEMPTS: 6,
    DEFAULT_HARD_MODE: false,
    
    // Límites del juego
    MIN_WORD_LENGTH: 3,
    MAX_WORD_LENGTH: 12,
    MIN_ATTEMPTS: 3,
    MAX_ATTEMPTS: 10,
    
    // Teclado español
    KEYBOARD_LAYOUT: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
    ],
    
    // Estados de las letras
    LETTER_STATES: {
        CORRECT: 'correct',
        PRESENT: 'present',
        ABSENT: 'absent',
        UNUSED: 'unused'
    },
    
    // Mensajes del juego
    MESSAGES: {
        WIN: '¡Felicitaciones! Has adivinado la palabra.',
        LOSE: 'Se acabaron los intentos. La palabra era: ',
        INVALID_WORD: 'Palabra inválida. Debe tener entre 3 y 12 letras.',
        INCOMPLETE_WORD: 'Completa la palabra antes de enviar.',
        HARD_MODE_VIOLATION: 'En modo difícil debes usar las pistas anteriores.'
    },
    
    // Animaciones
    ANIMATION_DURATION: 600,
    FLIP_DELAY: 100
};