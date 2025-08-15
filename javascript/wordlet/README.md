# 🎯 Wordlet - Juego de Palabras

Una versión moderna y responsive del popular juego Wordle, construida con HTML, CSS y JavaScript vanilla. Perfecta para dispositivos móviles y desktop.

## ✨ Características

- 🎮 **Juego completo de Wordle** con lógica de evaluación de palabras
- 📱 **Diseño responsive** optimizado para móvil y desktop
- 🎨 **Interfaz moderna** con animaciones suaves y efectos visuales
- ⚙️ **Configuración personalizable**: palabra objetivo, número de intentos, modo difícil
- 🔄 **PWA (Progressive Web App)** - funciona offline y se puede instalar
- 📋 **Compartir resultados** con emojis y estadísticas
- 🎯 **Teclado virtual** con estados de letras
- 💾 **Persistencia local** de configuraciones
- ♿ **Accesible** con soporte para lectores de pantalla
- 🌙 **Tema oscuro** moderno

## 🚀 Instalación y Uso

### Uso Directo
1. Clona o descarga el repositorio
2. Abre `palabra.html` en tu navegador
3. ¡Empieza a jugar!

### Como PWA
1. Abre la aplicación en tu navegador móvil
2. Busca la opción "Agregar a pantalla de inicio" o "Instalar app"
3. La aplicación funcionará como una app nativa

## 🏗️ Estructura del Proyecto

```
wordlet/
├── palabra.html          # Página principal
├── manifest.json       # Configuración PWA
├── sw.js              # Service Worker
├── styles/
│   └── main.css       # Estilos principales
└── js/
    ├── config.js      # Configuración global
    ├── utils.js       # Utilidades generales
    ├── game.js        # Lógica del juego
    ├── ui.js          # Manejo de interfaz
    └── app.js         # Aplicación principal
```

## 🔧 Personalización

### Cambiar Colores
Modifica las variables CSS en `styles/main.css`:

```css
:root {
    --primary-color: #6aaa64;      /* Color principal */
    --secondary-color: #c9b458;    /* Color secundario */
    --background-color: #0f0f0f;   /* Fondo principal */
    /* ... más variables */
}
```

### Modificar Configuración del Juego
Edita `js/config.js`:

```javascript
const CONFIG = {
    DEFAULT_WORD: 'JUEGO',         // Palabra por defecto
    DEFAULT_ATTEMPTS: 6,           // Intentos por defecto
    MIN_WORD_LENGTH: 4,           // Longitud mínima
    MAX_WORD_LENGTH: 8,           // Longitud máxima
    // ... más configuraciones
};
```

### Personalizar Teclado
Modifica el layout del teclado en `js/config.js`:

```javascript
KEYBOARD_LAYOUT: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
]
```

## 🎮 Cómo Jugar

1. **Configurar**: Haz clic en ⚙️ para establecer la palabra objetivo y opciones
2. **Adivinar**: Escribe una palabra usando el teclado virtual o físico
3. **Evaluar**: Las letras se colorean según su estado:
   - 🟩 **Verde**: Letra correcta en posición correcta
   - 🟨 **Amarillo**: Letra correcta en posición incorrecta
   - ⬛ **Gris**: Letra no está en la palabra
4. **Ganar**: Adivina la palabra en el número de intentos permitidos

### Modo Difícil
- Debes usar todas las pistas reveladas en intentos anteriores
- Las letras verdes deben mantenerse en la misma posición
- Las letras amarillas deben incluirse en el siguiente intento

## 🛠️ Desarrollo

### Arquitectura
- **Modular**: Cada funcionalidad está separada en su propio archivo
- **Orientada a objetos**: Clases para Game, UI y App
- **Responsive**: CSS Grid y Flexbox para layouts adaptativos
- **Progresiva**: PWA con Service Worker para funcionalidad offline

### Clases Principales

#### `WordleGame`
- Maneja la lógica del juego
- Evalúa palabras y estados de letras
- Controla el flujo del juego

#### `UIManager`
- Maneja toda la interfaz de usuario
- Animaciones y efectos visuales
- Eventos de teclado y mouse

#### `WordletApp`
- Punto de entrada de la aplicación
- Configuración PWA
- Persistencia de datos

#### `Utils`
- Funciones utilitarias
- Normalización de texto
- Manejo de localStorage

## 📱 Compatibilidad

- ✅ Chrome/Edge 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Chrome Mobile 88+

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- Inspirado en el juego original Wordle de Josh Wardle
- Fuentes de Google Fonts (Inter)
- Iconos de emojis nativos del sistema

---

¡Disfruta jugando Wordlet! 🎉