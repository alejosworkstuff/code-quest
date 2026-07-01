const STORAGE_KEY = "code-quest-lang";
const DEFAULT_LANG = "en";

const MESSAGES = {
  en: {
    meta: {
      title: "Code Quest — Learn Full-stack by playing",
      description: "Interactive platform to learn full-stack development with minigames based on real projects.",
    },
    nav: { portfolio: "My portfolio →", hub: "← Hub", settings: "Settings" },
    hero: {
      eyebrow: "Interactive learning",
      titleBefore: "Learn ",
      titleEm: "Full-stack",
      titleAfter: " by playing",
      body: "Each minigame teaches real decisions from your projects. No boring PDFs — just quests, XP and badges.",
      start: "Start quest →",
      map: "View map",
    },
    stats: {
      xp: "Total XP",
      streak: "Streak (days)",
      badges: "Badges",
      games: "Games ({done}/{total})",
    },
    map: {
      title: "World map",
      body: "Complete each world to unlock the next. 70% progress opens the door.",
      world: "World {n}",
      locked: "🔒 Locked",
      viewProject: "View {project} →",
    },
    badges: { title: "Trophies — Your badges" },
    settings: {
      title: "Settings",
      language: "Language",
      langEn: "English",
      langEs: "Español",
      progressNote: "Progress is saved in your browser (localStorage).",
      soundNote: "Sounds are on — use the 🔊 button at the bottom left to mute.",
      reset: "Reset all progress",
      resetConfirm: "Reset all progress? This cannot be undone.",
      close: "Close",
    },
    common: {
      level: "Level {n}",
      all: "All",
      search: "Search",
      type: "Type",
      seniority: "Seniority",
      salary: "Salary",
      completeLevel: "Complete level {n}",
      complete: "Complete",
      next: "Next →",
      continue: "Continue",
      correct: "Correct",
      mission: "Mission",
      jobsFound: "{n} job found",
      jobsFoundPlural: "{n} jobs found",
      noJobs: "0 jobs found — try other filters.",
      jobsCount: "{n} jobs",
      levelDone: "Level {n} complete — +10 XP",
      xpGood: "+10 XP — good call",
      xpReview: "Review the feedback — every mistake teaches",
    },
    filter: {
      level1Tip: "Level 1: Move the filters and watch how many jobs remain. This is what mini-job-board does live.",
      level2Mission: "Without applying filters yet — how many jobs match Remote + Senior?",
      level2Correct: "Correct. filter-logic.mjs is a pure function: same input → same output, without touching the DOM.",
      level2Wrong: "Close — the answer was {n}. Tip: filter Remote and Senior in Level 1 to verify.",
      level3Title: "Salary puzzle: which monthly USD band matches this string?",
      level3Hint: "Hint: it's yearly (÷12) and in euros (×1.08). The real code lives in filter-logic.mjs.",
      level3Correct: "Correct (~$4k–$5k/mo USD). That's why we extract logic into a tested module — a salary bug breaks filters silently.",
      level3Wrong: "Not that band. Convert: 45k–55k annual EUR → monthly USD and compare ranges.",
      doneTitle: "Filter Fighter complete!",
      doneBody: "You mastered filters, pure functions and salary parsing.",
      salary: {
        "under-3k": "Under $3k/mo",
        "3k-5k": "$3k – $5k/mo",
        "5k-8k": "$5k – $8k/mo",
        "8k-plus": "Over $8k/mo",
      },
    },
    stackMatcher: {
      pairsFound: "{found} / {total} pairs found",
      doneTitle: "Stack Matcher complete!",
      doneBody: "You matched projects with their real tech stacks.",
      card: "Card {n}",
    },
    bugHunt: {
      hint: "Hint ({n} left)",
      bugProgress: "Bug {current} / {total}",
      found: "Bug found — +10 XP",
      wrongLine: "Not that line. Use a hint if you need one.",
      nextBug: "Next bug →",
      doneTitle: "Bug Hunt complete!",
      doneBody: "You found real bugs in salary, filters and checkout.",
    },
    decision: {
      nextScenario: "Next scenario →",
      completeDungeon: "Complete dungeon",
      doneTitle: "Decision Dungeon complete!",
      doneBody: "You can now explain why we chose Redis, Clerk, SSG and more.",
    },
    requestTracer: {
      mission: "Mission: The cart has 2 items. Trace what happens on checkout — click in order.",
      missionDone: "✓ Mission complete — checkout flow traced.",
      clickFirst: "Click the first node in the flow…",
      wrongOrder: "Not yet — go through {label} first.",
      doneTitle: "Request Tracer complete!",
      doneBody: "You traced checkout: UI → API → Redis → Success.",
      nodes: {
        ui: { label: "Browser UI", detail: "The cart lives in React Context + localStorage. The user sees 2 products." },
        api: { label: "POST /api/orders", detail: "The server recalculates the total. It never trusts the client." },
        redis: { label: "Redis / Map", detail: "Order persisted in Redis (or Map locally). Shared across serverless instances." },
        response: { label: "Success UI", detail: "UI shows confirmation. WebSocket can notify state changes." },
      },
    },
    pipeline: {
      yourPipeline: "Your pipeline",
      availableSteps: "Available steps",
      dragHint: "Drag {n} steps into the pipeline ({current}/{n})",
      orderHint: "Order the 7 steps of the ia-stories RAG flow.",
      correct: "Correct pipeline. This is how ia-stories RAG works: corpus → vectors → search → generation.",
      wrong: "Close — check the order. First prepare the corpus offline, then at runtime embed query → retrieve → generate.",
      level2: "Level 2: In ia-stories, the model decides when to search the corpus. Which approach do we use?",
      optPrefetch: "Pre-fetch the entire corpus on every request",
      optTool: "searchCorpus tool — the agent chooses when to retrieve",
      optNone: "No RAG — user prompt only",
      level2Correct: "Correct. The agent calls searchCorpus only when it needs context — not always. That saves tokens and is more flexible.",
      level2Wrong: "In ia-stories we use agentic tool calling with searchCorpus — the LLM decides when to search, with a step limit.",
      doneTitle: "Pipeline Puzzle complete!",
      doneBody: "You understood chunk, embed, retrieve, generate and agentic RAG.",
      steps: {
        "read-corpus": "Read corpus.md",
        chunk: "Chunk (split text)",
        "embed-docs": "Embed documents",
        "store-pgvector": "Store in pgvector",
        "embed-query": "Embed user query",
        retrieve: "Retrieve top-k",
        generate: "LLM generates with context",
        prefetch: "Pre-fetch always (no tool)",
        "search-tool": "searchCorpus tool (agent)",
      },
    },
    ciBoss: {
      robotTeacher: "Robot teacher: Stage {name} failed.",
      whatDo: "What do you do?",
      stagePass: "Stage {name} passes. The CI pipeline protects quality before deploy.",
      nextStage: "Next stage →",
      defeatBoss: "Defeat the boss",
      stageResolved: "Stage {name} resolved — +10 XP",
      doneTitle: "CI Boss defeated!",
      doneBody: "Lint → typecheck → test → build. That's how your CI works across repos.",
      stages: {
        lint: {
          failMsg: "ESLint found style errors.",
          fixes: {
            fix: "Fix the errors ESLint reports",
            skip: "Add eslint-disable to the whole file",
            delete: "Delete the CI workflow",
          },
          wrongFeedback: "eslint-disable hides problems. The robot teacher wants clean code, not silence.",
        },
        typecheck: {
          failMsg: "TypeScript strict: Property 'foo' does not exist.",
          fixes: {
            any: "Cast everything to any",
            fix: "Type correctly or adjust the interface",
            ignore: "Disable strict in tsconfig",
          },
          wrongFeedback: "strict: true exists for a reason. Fix the type, don't turn it off.",
        },
        test: {
          failMsg: "Vitest: expected 3 but received 2.",
          fixes: {
            fix: "Review the assertion or code under test",
            delete: "Delete the failing test",
            skip: "Mark test as permanently skipped",
          },
          wrongFeedback: "A broken test may signal a real bug. Fix > skip.",
        },
        build: {
          failMsg: "next build failed: Module not found.",
          fixes: {
            fix: "Fix the import or install the dependency",
            push: "Push anyway — works on my machine",
            disable: "Remove the build step from CI",
          },
          wrongFeedback: "If build fails in CI, production can fail too.",
        },
      },
    },
    authGate: {
      guest: "Guest (not logged in)",
      allowed: "✓ Allowed",
      denied: "✗ Redirect /sign-in",
      explain: "Clerk middleware in mini-ecommerce protects routes like /my-purchases and /admin. A guest is redirected to sign-in. The admin role lives in Clerk metadata.",
      doneTitle: "Auth Gate complete!",
      doneBody: "You tried guest, user and admin on every route.",
    },
    games: {
      "filter-fighter": {
        title: "Filter Fighter",
        subtitle: "Filter jobs like mini-job-board. Learn pure functions vs DOM.",
        world: "World 1",
      },
      "stack-matcher": {
        title: "Stack Matcher",
        subtitle: "Match each project with its tech stack. On match, you learn what it's for.",
        world: "World 2",
      },
      "bug-hunt": {
        title: "Bug Hunt",
        subtitle: "Click the line with the bug. Simplified snippets from your real projects.",
        world: "World 2",
      },
      "decision-dungeon": {
        title: "Decision Dungeon",
        subtitle: "Pick the right architecture. Each scenario comes from real project decisions.",
        world: "Worlds 3–5",
      },
      "request-tracer": {
        title: "Request Tracer",
        subtitle: "Trace mini-ecommerce checkout: UI → API → Redis → Success.",
        world: "World 4",
      },
      "auth-gate": {
        title: "Auth Gate",
        subtitle: "Try guest, user and admin. Which routes can each one see?",
        world: "World 5",
      },
      "pipeline-puzzle": {
        title: "Pipeline Puzzle",
        subtitle: "Order the ia-stories RAG flow: chunk → embed → retrieve → generate.",
        world: "World 6",
      },
      "ci-boss": {
        title: "CI Boss Fight",
        subtitle: "The robot teacher (CI pipeline) failed. How do you fix it without cheating?",
        world: "World 7",
      },
    },
  },
  es: {
    meta: {
      title: "Code Quest — Aprendé Full-stack jugando",
      description: "Plataforma interactiva para aprender programación full-stack con minijuegos basados en proyectos reales.",
    },
    nav: { portfolio: "Mi portfolio →", hub: "← Hub", settings: "Configuración" },
    hero: {
      eyebrow: "Aprendizaje interactivo",
      titleBefore: "Aprendé ",
      titleEm: "Full-stack",
      titleAfter: " jugando",
      body: "Cada minijuego enseña decisiones reales de tus proyectos. Sin PDFs aburridos — solo quests, XP y badges.",
      start: "Empezar quest →",
      map: "Ver mapa",
    },
    stats: {
      xp: "XP Total",
      streak: "Racha (días)",
      badges: "Badges",
      games: "Juegos ({done}/{total})",
    },
    map: {
      title: "Mapa del mundo",
      body: "Completá cada mundo para desbloquear el siguiente. 70% de progreso abre la puerta.",
      world: "Mundo {n}",
      locked: "🔒 Bloqueado",
      viewProject: "Ver {project} →",
    },
    badges: { title: "Trophies — Tus badges" },
    settings: {
      title: "Configuración",
      language: "Idioma",
      langEn: "English",
      langEs: "Español",
      progressNote: "El progreso se guarda en tu browser (localStorage).",
      soundNote: "Sonidos activados — usá el botón 🔊 abajo a la izquierda para silenciarlos.",
      reset: "Resetear todo el progreso",
      resetConfirm: "¿Resetear todo el progreso? Esto no se puede deshacer.",
      close: "Cerrar",
    },
    common: {
      level: "Nivel {n}",
      all: "Todos",
      search: "Buscar",
      type: "Tipo",
      seniority: "Seniority",
      salary: "Salario",
      completeLevel: "Completar nivel {n}",
      complete: "Completar",
      next: "Siguiente →",
      continue: "Continuar",
      correct: "Correcto",
      mission: "Misión",
      jobsFound: "{n} empleo encontrado",
      jobsFoundPlural: "{n} empleos encontrados",
      noJobs: "0 empleos encontrados — probá otros filtros.",
      jobsCount: "{n} empleos",
      levelDone: "Nivel {n} completado — +10 XP",
      xpGood: "+10 XP — buena decisión",
      xpReview: "Revisá el feedback — cada error enseña",
    },
    filter: {
      level1Tip: "Nivel 1: Mové los filtros y observá cuántos empleos quedan. Esto es lo que hace mini-job-board en vivo.",
      level2Mission: "Sin aplicar filtros todavía — ¿cuántos empleos quedan con Remote + Senior?",
      level2Correct: "Correcto. filter-logic.mjs es una función pura: misma entrada → misma salida, sin tocar el DOM.",
      level2Wrong: "Casi — la respuesta era {n}. Tip: filtrá Remote y Senior en el Nivel 1 para verificar.",
      level3Title: "Puzzle de salario: ¿Qué banda mensual en USD matchea este string?",
      level3Hint: "Pista: es anual (÷12) y en euros (×1.08). El código real está en filter-logic.mjs.",
      level3Correct: "Correcto (~$4k–$5k/mes USD). Por eso extraemos la lógica a un módulo testeado — un bug de salario rompe filtros silenciosamente.",
      level3Wrong: "No es esa banda. Convertí: 45k–55k anual EUR → mensual USD y compará con los rangos.",
      doneTitle: "¡Filter Fighter completado!",
      doneBody: "Dominaste filtros, funciones puras y parsing de salarios.",
      salary: {
        "under-3k": "Menos de $3k/mes",
        "3k-5k": "$3k – $5k/mes",
        "5k-8k": "$5k – $8k/mes",
        "8k-plus": "Más de $8k/mes",
      },
    },
    stackMatcher: {
      pairsFound: "{found} / {total} pares encontrados",
      doneTitle: "¡Stack Matcher completado!",
      doneBody: "Emparejaste proyectos con su tech stack real.",
      card: "Carta {n}",
    },
    bugHunt: {
      hint: "Pista ({n} restantes)",
      bugProgress: "Bug {current} / {total}",
      found: "Bug encontrado — +10 XP",
      wrongLine: "No es esa línea. Usá una pista si necesitás.",
      nextBug: "Siguiente bug →",
      doneTitle: "¡Bug Hunt completado!",
      doneBody: "Encontraste bugs reales de salario, filtros y checkout.",
    },
    decision: {
      nextScenario: "Siguiente escenario →",
      completeDungeon: "Completar dungeon",
      doneTitle: "¡Decision Dungeon completado!",
      doneBody: "Ahora podés explicar por qué elegimos Redis, Clerk, SSG y más.",
    },
    requestTracer: {
      mission: "Misión: El carrito tiene 2 items. Trazá qué pasa al hacer checkout — click en orden.",
      missionDone: "✓ Misión completada — el flujo de checkout está trazado.",
      clickFirst: "Click en el primer nodo del flujo…",
      wrongOrder: "Todavía no — primero pasa por {label}",
      doneTitle: "¡Request Tracer completado!",
      doneBody: "Trazaste checkout: UI → API → Redis → Success.",
      nodes: {
        ui: { label: "Browser UI", detail: "El carrito vive en React Context + localStorage. El usuario ve 2 productos." },
        api: { label: "POST /api/orders", detail: "El servidor recalcula el total. Nunca confía en el cliente." },
        redis: { label: "Redis / Map", detail: "Pedido persistido en Redis (o Map en local). Compartido entre instancias serverless." },
        response: { label: "Success UI", detail: "UI muestra confirmación. WebSocket puede notificar cambio de estado." },
      },
    },
    pipeline: {
      yourPipeline: "Tu pipeline",
      availableSteps: "Pasos disponibles",
      dragHint: "Arrastrá {n} pasos al pipeline ({current}/{n})",
      orderHint: "Ordená los 7 pasos del flujo RAG de ia-stories.",
      correct: "Pipeline correcto. Así funciona el RAG de ia-stories: corpus → vectores → búsqueda → generación.",
      wrong: "Casi — revisá el orden. Primero preparás el corpus offline, después en runtime embed query → retrieve → generate.",
      level2: "Nivel 2: En ia-stories, el modelo decide cuándo buscar en el corpus. ¿Cuál enfoque usamos?",
      optPrefetch: "Pre-fetch siempre todo el corpus en cada request",
      optTool: "Tool searchCorpus — el agent elige cuándo retrieve",
      optNone: "Sin RAG — solo prompt del usuario",
      level2Correct: "Correcto. El agent llama searchCorpus solo cuando necesita contexto — no siempre. Eso ahorra tokens y es más flexible.",
      level2Wrong: "En ia-stories usamos agentic tool calling con searchCorpus — el LLM decide cuándo buscar, con límite de steps.",
      doneTitle: "¡Pipeline Puzzle completado!",
      doneBody: "Entendiste chunk, embed, retrieve, generate y agentic RAG.",
      steps: {
        "read-corpus": "Leer corpus.md",
        chunk: "Chunk (trocear texto)",
        "embed-docs": "Embed documentos",
        "store-pgvector": "Guardar en pgvector",
        "embed-query": "Embed query del usuario",
        retrieve: "Retrieve top-k",
        generate: "LLM genera con contexto",
        prefetch: "Pre-fetch siempre (sin tool)",
        "search-tool": "searchCorpus tool (agent)",
      },
    },
    ciBoss: {
      robotTeacher: "Robot teacher: El stage {name} falló.",
      whatDo: "¿Qué hacés?",
      stagePass: "Stage {name} pasa. El CI pipeline protege calidad antes del deploy.",
      nextStage: "Siguiente stage →",
      defeatBoss: "Derrotar al boss",
      stageResolved: "Stage {name} resuelto — +10 XP",
      doneTitle: "¡CI Boss derrotado!",
      doneBody: "Lint → typecheck → test → build. Así funciona tu CI en todos los repos.",
      stages: {
        lint: {
          failMsg: "ESLint encontró errores de estilo.",
          fixes: {
            fix: "Corregir los errores que reporta ESLint",
            skip: "Agregar eslint-disable en todo el archivo",
            delete: "Borrar el workflow de CI",
          },
          wrongFeedback: "eslint-disable esconde problemas. El robot teacher quiere código limpio, no silencio.",
        },
        typecheck: {
          failMsg: "TypeScript strict: Property 'foo' does not exist.",
          fixes: {
            any: "Castear todo a any",
            fix: "Tipar correctamente o ajustar el interface",
            ignore: "Desactivar strict en tsconfig",
          },
          wrongFeedback: "strict: true existe por algo. Arreglá el tipo, no lo apagues.",
        },
        test: {
          failMsg: "Vitest: expected 3 but received 2.",
          fixes: {
            fix: "Revisar la assertion o el código bajo test",
            delete: "Borrar el test que falla",
            skip: "Marcar test como skip permanente",
          },
          wrongFeedback: "Un test roto puede ser señal de un bug real. Fix > skip.",
        },
        build: {
          failMsg: "next build failed: Module not found.",
          fixes: {
            fix: "Corregir el import o instalar la dependencia",
            push: "Push igual — funciona en mi máquina",
            disable: "Quitar el step de build del CI",
          },
          wrongFeedback: "Si build falla en CI, producción también puede fallar.",
        },
      },
    },
    authGate: {
      guest: "Guest (sin login)",
      allowed: "✓ Permitido",
      denied: "✗ Redirect /sign-in",
      explain: "Clerk middleware en mini-ecommerce protege rutas como /my-purchases y /admin. Un guest es redirigido a sign-in. El rol admin vive en metadata de Clerk.",
      doneTitle: "¡Auth Gate completado!",
      doneBody: "Probaste guest, user y admin en todas las rutas.",
    },
    games: {
      "filter-fighter": {
        title: "Filter Fighter",
        subtitle: "Filtrá empleos como en mini-job-board. Aprendé funciones puras vs DOM.",
        world: "Mundo 1",
      },
      "stack-matcher": {
        title: "Stack Matcher",
        subtitle: "Emparejá cada proyecto con su tech stack. Al hacer match, aprendés para qué sirve.",
        world: "Mundo 2",
      },
      "bug-hunt": {
        title: "Bug Hunt",
        subtitle: "Click en la línea con el bug. Snippets simplificados de tus proyectos reales.",
        world: "Mundo 2",
      },
      "decision-dungeon": {
        title: "Decision Dungeon",
        subtitle: "Elegí la arquitectura correcta. Cada escenario viene de decisiones reales de tus proyectos.",
        world: "Mundos 3–5",
      },
      "request-tracer": {
        title: "Request Tracer",
        subtitle: "Trazá el flujo de checkout en mini-ecommerce: UI → API → Redis → Success.",
        world: "Mundo 4",
      },
      "auth-gate": {
        title: "Auth Gate",
        subtitle: "Probá guest, user y admin. ¿Qué rutas puede ver cada uno?",
        world: "Mundo 5",
      },
      "pipeline-puzzle": {
        title: "Pipeline Puzzle",
        subtitle: "Ordená el flujo RAG de ia-stories: chunk → embed → retrieve → generate.",
        world: "Mundo 6",
      },
      "ci-boss": {
        title: "CI Boss Fight",
        subtitle: "El robot teacher (CI pipeline) falló. ¿Cómo lo arreglás sin hacer trampa?",
        world: "Mundo 7",
      },
    },
  },
};

const listeners = new Set();

function resolve(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export function getLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "es" ? "es" : DEFAULT_LANG;
}

export function setLang(lang) {
  const next = lang === "es" ? "es" : DEFAULT_LANG;
  localStorage.setItem(STORAGE_KEY, next);
  document.documentElement.lang = next;
  listeners.forEach((fn) => fn(next));
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function t(key, vars = {}) {
  const lang = getLang();
  let text = resolve(MESSAGES[lang], key) ?? resolve(MESSAGES.en, key) ?? key;
  Object.entries(vars).forEach(([k, v]) => {
    text = text.replaceAll(`{${k}}`, String(v));
  });
  return text;
}

export function pick(value, lang = getLang()) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || value.es || "";
}

export function applyPage() {
  const lang = getLang();
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });

  const titleKey = document.documentElement.dataset.i18nTitle;
  if (titleKey) document.title = t(titleKey);

  const descMeta = document.querySelector('meta[name="description"][data-i18n]');
  if (descMeta) descMeta.content = t(descMeta.dataset.i18n);
}

applyPage();
