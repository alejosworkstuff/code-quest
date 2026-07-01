import { initProgress, completeGameLevel, completeGame, getGameProgress } from "../progress.js";
import { showModal, showToast } from "../ui.js";
import { playSuccess, playError } from "../sounds.js";
import { t } from "../i18n.js";

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

const STEP_IDS = [
  "read-corpus",
  "chunk",
  "embed-docs",
  "store-pgvector",
  "embed-query",
  "retrieve",
  "generate",
  "prefetch",
  "search-tool",
];

function stepLabel(id) {
  return t(`pipeline.steps.${id}`);
}

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
      return `<button type="button" class="level-tab ${active ? "level-tab--active" : ""} ${done ? "level-tab--done" : ""}" data-level="${n}">${t("common.level", { n })}${done ? " ✓" : ""}</button>`;
    })
    .join("");

  levelTabs.querySelectorAll(".level-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentLevel = Number(btn.dataset.level);
      initLevel();
    });
  });
}

function createStepEl(stepId) {
  const el = document.createElement("div");
  el.className = "pipeline-step";
  el.draggable = true;
  el.dataset.id = stepId;
  el.textContent = stepLabel(stepId);

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

function refreshStepLabels() {
  if (!slotsEl) return;
  [...slotsEl.querySelectorAll(".pipeline-step"), ...poolEl.querySelectorAll(".pipeline-step")].forEach(
    (el) => {
      el.textContent = stepLabel(el.dataset.id);
    }
  );
}

function checkOrder() {
  const order = getOrderFromSlots();
  if (order.length !== CORRECT_ORDER.length) {
    feedbackEl.innerHTML = `<p style="color:var(--muted)">${t("pipeline.dragHint", { n: CORRECT_ORDER.length, current: order.length })}</p>`;
    slotsEl.classList.remove("pipeline-slots--success");
    return;
  }

  const correct = order.every((id, i) => id === CORRECT_ORDER[i]);

  if (correct) {
    slotsEl.classList.add("pipeline-slots--success");
    playSuccess();
    feedbackEl.innerHTML = `<div class="feedback-box"><p>✓ ${t("pipeline.correct")}</p></div>`;

    if (currentLevel === 1) {
      completeGameLevel(GAME_ID, "level-1");
      showToast(t("common.levelDone", { n: 1 }), "success");
      renderTabs();
    }
  } else {
    slotsEl.classList.remove("pipeline-slots--success");
    playError();
    feedbackEl.innerHTML = `<div class="feedback-box"><p>${t("pipeline.wrong")}</p></div>`;
  }
}

function initLevel() {
  renderTabs();

  if (currentLevel === 2) {
    renderLevel2Quiz();
    return;
  }

  boardEl.innerHTML = `
    <h3 style="margin-bottom:8px">${t("pipeline.yourPipeline")}</h3>
    <div id="pipeline-slots" class="pipeline-slots"></div>
    <h3 style="margin:16px 0 8px">${t("pipeline.availableSteps")}</h3>
    <div id="pipeline-pool" class="pipeline-pool"></div>
  `;

  slotsEl = document.getElementById("pipeline-slots");
  poolEl = document.getElementById("pipeline-pool");
  feedbackEl.innerHTML = `<p style="color:var(--muted);margin-bottom:12px">${t("pipeline.orderHint")}</p>`;

  const poolSteps = [...STEP_IDS.slice(0, 7)];
  poolSteps.sort(() => Math.random() - 0.5).forEach((stepId) => {
    poolEl.appendChild(createStepEl(stepId));
  });

  setupDropZone(slotsEl);
  setupDropZone(poolEl);
}

function renderLevel2Quiz() {
  boardEl.innerHTML = "";
  feedbackEl.innerHTML = `
    <p style="margin-bottom:16px"><strong>${t("pipeline.level2")}</strong></p>
    <div class="quiz-options" id="agent-quiz">
      <button type="button" class="quiz-option" data-answer="prefetch">${t("pipeline.optPrefetch")}</button>
      <button type="button" class="quiz-option" data-answer="tool">${t("pipeline.optTool")}</button>
      <button type="button" class="quiz-option" data-answer="none">${t("pipeline.optNone")}</button>
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
      fb.innerHTML = `<div class="feedback-box"><p>✓ ${t("pipeline.level2Correct")}</p></div>`;
      completeGameLevel(GAME_ID, "level-2");
      if (!getGameProgress(GAME_ID).completed) {
        completeGame(GAME_ID);
        showModal({
          title: t("pipeline.doneTitle"),
          body: t("pipeline.doneBody"),
          xp: 25,
          badge: { icon: "🔗", name: "RAG Runner" },
        });
      }
      renderTabs();
    } else {
      btn.classList.add("quiz-option--wrong");
      playError();
      fb.innerHTML = `<div class="feedback-box"><p>${t("pipeline.level2Wrong")}</p></div>`;
    }
  });
}

function render() {
  if (currentLevel === 2) {
    renderLevel2Quiz();
  } else if (slotsEl && poolEl) {
    refreshStepLabels();
    renderTabs();
    const order = getOrderFromSlots();
    if (order.length === CORRECT_ORDER.length && order.every((id, i) => id === CORRECT_ORDER[i])) {
      feedbackEl.innerHTML = `<div class="feedback-box"><p>✓ ${t("pipeline.correct")}</p></div>`;
    } else if (order.length > 0) {
      feedbackEl.innerHTML = `<p style="color:var(--muted)">${t("pipeline.dragHint", { n: CORRECT_ORDER.length, current: order.length })}</p>`;
    } else {
      feedbackEl.innerHTML = `<p style="color:var(--muted);margin-bottom:12px">${t("pipeline.orderHint")}</p>`;
    }
    boardEl.querySelectorAll("h3").forEach((h3, i) => {
      h3.textContent = i === 0 ? t("pipeline.yourPipeline") : t("pipeline.availableSteps");
    });
  } else {
    initLevel();
  }
}

async function init() {
  initProgress();
  initLevel();
}

init();
window.addEventListener("code-quest:lang-change", () => render());
