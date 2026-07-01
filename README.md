# Code Quest

Plataforma interactiva de aprendizaje full-stack **solo para vos**. Aprendés jugando conceptos y decisiones técnicas de tus proyectos reales: mini-ecommerce, ia-stories, mini-job-board, portfolio y Saravá.

**Stack:** HTML + CSS + JavaScript vanilla — sin build step. Podés abrir cualquier archivo y entenderlo.

## Cómo jugar

1. Abrí `index.html` en el browser (o serví con un static server).
2. Empezá por **Filter Fighter** (Mundo 1 — tutorial).
3. Ganá XP, badges y desbloqueá mundos (70% del mundo anterior).
4. El progreso se guarda en `localStorage`.

### Servidor local (recomendado)

Los juegos cargan JSON con `fetch`. Algunos browsers bloquean eso con `file://`. Usá:

```bash
cd code-quest
npm run serve
# o: npx serve .
```

Abrí `http://localhost:3000`.

## Visual polish

- Fondo animado con partículas + grid sci-fi (`js/background.js`)
- Mapa del mundo con path SVG zigzag y nodos por color
- Stats con animación count-up y iconos RPG
- Badges tipo trophy cards con glow al desbloquear
- Modales de victoria con confetti y gradiente
- Favicon propio en `assets/favicon.svg`

## Sonidos

Sonidos estilo retro generados con **Web Audio API** (sin archivos externos):

| Evento | Sonido |
|--------|--------|
| Click en botones / tabs | Blip corto |
| Respuesta correcta / match | Arpeggio ascendente |
| Error / respuesta incorrecta | Buzz bajo |
| Nivel o stage completado | Fanfare corta |
| Juego completado (modal) | Fanfare + confetti |

- **Activados por defecto** — primer click desbloquea el audio del browser
- Botón **🔊** fijo abajo a la izquierda para silenciar (guarda preferencia en localStorage)
- Si tenés `prefers-reduced-motion`, los sonidos se desactivan automáticamente

## Los 8 juegos

| Juego | Mundo | Qué aprendés |
|-------|-------|--------------|
| **Filter Fighter** | 1 | Filtros, funciones puras, parsing de salarios (mini-job-board) |
| **Stack Matcher** | 2 | Memory game: proyecto ↔ tech stack |
| **Bug Hunt** | 2 | Encontrar bugs en snippets reales |
| **Decision Dungeon** | 3–5 | Redis vs Map, Clerk, SSG, fallback IA, etc. |
| **Request Tracer** | 4 | Checkout: UI → API → Redis (mini-ecommerce) |
| **Auth Gate** | 5 | Rutas públicas vs protegidas, roles Clerk |
| **Pipeline Puzzle** | 6 | Flujo RAG: chunk → embed → retrieve → generate |
| **CI Boss Fight** | 7 | Lint → typecheck → test → build |

## Modificá esto vos (sandbox)

### Cambiar colores globales

Abrí `css/tokens.css` y cambiá `--accent` o `--bg`. Recargá — todo el sitio se actualiza.

### Agregar un empleo a Filter Fighter

Editá `data/jobs-sample.json`. Copiá un objeto del array y cambiá title, type, seniority, salary. Recargá Filter Fighter.

### Agregar un escenario a Decision Dungeon

Editá `data/decisions.json`. Copiá un objeto en `scenarios` con `prompt`, `options` (cada una con `correct` y `feedback`). El juego lo carga solo.

### Agregar un par en Stack Matcher

Editá `data/stacks.json` → array `pairs` con `project`, `stack`, `explain`.

### Cambiar el orden del pipeline RAG

Editá `CORRECT_ORDER` en `js/games/pipeline-puzzle.js` si querés experimentar.

## Deploy en GitHub Pages

1. Creá repo `code-quest` en GitHub.
2. Push de esta carpeta.
3. Settings → Pages → Source: **main** branch, folder **/ (root)**.
4. URL: `https://alejosworkstuff.github.io/code-quest/`

## Estructura

```
code-quest/
├── index.html          # Hub
├── games/              # 8 minijuegos
├── css/                # tokens, base, hub, games
├── js/
│   ├── progress.js     # XP, badges, streak
│   ├── hub.js          # Mapa de mundos
│   ├── ui.js           # Toasts, confetti, modales
│   ├── lib/            # Lógica compartida
│   └── games/          # Un JS por juego
└── data/               # Contenido JSON curado de tus notas
```

## Fuentes de contenido

- `Progress/technical-decisions.md` → Decision Dungeon
- `Progress/PHASE_1_EXPLAINED_LIKE_IM_5.md` → CI Boss
- `mini-job-board/scripts/filter-logic.mjs` → Filter Fighter
- `ia-stories/lib/rag/` → Pipeline Puzzle
- Case studies del portfolio → Stack Matcher

## Licencia

Uso personal. Parte del workspace de Alejo Castillo.
