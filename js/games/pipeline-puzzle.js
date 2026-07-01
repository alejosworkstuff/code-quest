import { initProgress, completeGameLevel, completeGame, getGameProgress } from "../progress.js";
import { showModal, showToast } from "../ui.js";
import { playSuccess, playError } from "../sounds.js";

const GAME_ID = "pipeline-puzzle";

const CORRECT_ORDER = [
  "read-corpus",
  "chunk",
  "embed-docs",
  "store-pgvector",
  "embed-query",
  "retrieve",
  "generate",
];

const STEPS = [
  { id: "read-corpus", label: "Leer corpus.md" },
  { id: "chunk", label: "Chunk (trocear texto)" },
  { id: "embed-docs", label: "Embed documentos" },
  { id: "store-pgvector", label: "Guardar en pgvector" },
  { id: "embed-query", label: "Embed query del usuario" },
  { id: "retrieve", label: "Retrieve top-k" },
  { id: "generate", label: "LLM genera con contexto" },
  { id: "prefetch", label: "Pre-fetch siempre (sin tool)" },
  { id: "search-tool", label: "searchCorpus tool (agent)" },
];

let currentLevel = 1;
let slots = [];
let draggedEl = null;

const levelTabs = document.getElementById("level-tabs");
const boardEl = document.getElementById("pipeline-board");
const feedbackEl = document.getElementById("pipeline-feedback");

let slotsEl = null;
let poolEl = null;

function renderTabs() {
  const progress = getGameProgress(GAME_ID);
  levelTabs.innerHTML = [1, 2]
    .map((n) => {
      const done = progress.levels.includes(`level-${n}`);
      const active = n === currentLevel;
      return `<button type="button" class="level-tab ${active ? "level-tab--active" : ""} ${done ? "level-tab--done" : ""}" data-level="${n}">Nivel ${n}${done ? " ✓" : ""}</button>`;
    })
    .join("");

  levelTabs.querySelectorAll(".level-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentLevel = Number(btn.dataset.level);
      initLevel();
    });
  });
}

function createStepEl(step) {
  const el = document.createElement("div");
  el.className = "pipeline-step";
  el.draggable = true;
  el.dataset.id = step.id;
  el.textContent = step.label;

  el.addEventListener("dragstart", (e) => {
    draggedEl = el;
    el.classList.add("pipeline-step--dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  el.addEventListener("dragend", () => {
    el.classList.remove("pipeline-step--dragging");
    draggedEl = null;
  });

  el.addEventListener("touchstart", handleTouchStart, { passive: false });
  el.addEventListener("touchmove", handleTouchMove, { passive: false });
  el.addEventListener("touchend", handleTouchEnd);

  return el;
}

let touchDrag = null;

function handleTouchStart(e) {
  touchDrag = { el: e.currentTarget, clone: null };
  e.preventDefault();
}

function handleTouchMove(e) {
  if (!touchDrag) return;
  e.preventDefault();
  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  const slot = target?.closest(".pipeline-slots, .pipeline-pool");
  if (slot && touchDrag.el.parentElement !== slot) {
    slot.appendChild(touchDrag.el);
  }
}

function handleTouchEnd() {
  touchDrag = null;
  checkOrder();
}

function setupDropZone(zone) {
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggedEl) {
      zone.appendChild(draggedEl);
      checkOrder();
    }
  });
}

function getOrderFromSlots() {
  return [...slotsEl.querySelectorAll(".pipeline-step")].map((el) => el.dataset.id);
}

function checkOrder() {
  const order = getOrderFromSlots();
  if (order.length !== CORRECT_ORDER.length) {
    feedbackEl.innerHTML = `<p style="color:var(--muted)">Arrastrá ${CORRECT_ORDER.length} pasos al pipeline (${order.length}/${CORRECT_ORDER.length})</p>`;
    slotsEl.classList.remove("pipeline-slots--success");
    return;
  }

  const correct = order.every((id, i) => id === CORRECT_ORDER[i]);

  if (correct) {
    slotsEl.classList.add("pipeline-slots--success");
    playSuccess();
    feedbackEl.innerHTML = `<div class="feedback-box"><p>✓ Pipeline correcto. Así funciona el RAG de ia-stories: corpus → vectores → búsqueda → generación.</p></div>`;

    if (currentLevel === 1) {
      completeGameLevel(GAME_ID, "level-1");
      showToast("Nivel 1 completado — +10 XP", "success");
      renderTabs();
    }
  } else {
    slotsEl.classList.remove("pipeline-slots--success");
    playError();
    feedbackEl.innerHTML = `<div class="feedback-box"><p>Casi — revisá el orden. Primero preparás el corpus offline, después en runtime embed query → retrieve → generate.</p></div>`;
  }
}

function initLevel() {
  renderTabs();

  if (currentLevel === 2) {
    renderLevel2Quiz();
    return;
  }

  boardEl.innerHTML = `
    <h3 style="margin-bottom:8px">Tu pipeline</h3>
    <div id="pipeline-slots" class="pipeline-slots"></div>
    <h3 style="margin:16px 0 8px">Pasos disponibles</h3>
    <div id="pipeline-pool" class="pipeline-pool"></div>
  `;

  slotsEl = document.getElementById("pipeline-slots");
  poolEl = document.getElementById("pipeline-pool");
  feedbackEl.innerHTML = `<p style="color:var(--muted);margin-bottom:12px">Ordená los 7 pasos del flujo RAG de ia-stories.</p>`;

  const poolSteps = [...STEPS.slice(0, 7)];
  poolSteps.sort(() => Math.random() - 0.5).forEach((step) => {
    poolEl.appendChild(createStepEl(step));
  });

  setupDropZone(slotsEl);
  setupDropZone(poolEl);
}

function renderLevel2Quiz() {
  boardEl.innerHTML = "";
  feedbackEl.innerHTML = `
    <p style="margin-bottom:16px"><strong>Nivel 2:</strong> En ia-stories, el modelo decide cuándo buscar en el corpus. ¿Cuál enfoque usamos?</p>
    <div class="quiz-options" id="agent-quiz">
      <button type="button" class="quiz-option" data-answer="prefetch">Pre-fetch siempre todo el corpus en cada request</button>
      <button type="button" class="quiz-option" data-answer="tool">Tool searchCorpus — el agent elige cuándo retrieve</button>
      <button type="button" class="quiz-option" data-answer="none">Sin RAG — solo prompt del usuario</button>
    </div>
    <div id="agent-feedback"></div>
  `;

  document.getElementById("agent-quiz").addEventListener("click", (e) => {
    const btn = e.target.closest(".quiz-option");
    if (!btn || btn.disabled) return;
    const fb = document.getElementById("agent-feedback");
    document.querySelectorAll("#agent-quiz .quiz-option").forEach((b) => (b.disabled = true));

    if (btn.dataset.answer === "tool") {
      btn.classList.add("quiz-option--correct");
      playSuccess();
      fb.innerHTML = `<div class="feedback-box"><p>✓ Correcto. El agent llama searchCorpus solo cuando necesita contexto — no siempre. Eso ahorra tokens y es más flexible.</p></div>`;
      completeGameLevel(GAME_ID, "level-2");
      if (!getGameProgress(GAME_ID).completed) {
        completeGame(GAME_ID);
        showModal({
          title: "¡Pipeline Puzzle completado!",
          body: "Entendiste chunk, embed, retrieve, generate y agentic RAG.",
          xp: 25,
          badge: { icon: "🔗", name: "RAG Runner" },
        });
      }
      renderTabs();
    } else {
      btn.classList.add("quiz-option--wrong");
      playError();
      fb.innerHTML = `<div class="feedback-box"><p>En ia-stories usamos agentic tool calling con searchCorpus — el LLM decide cuándo buscar, con límite de steps.</p></div>`;
    }
  });
}

async function init() {
  initProgress();
  initLevel();
}

init();
