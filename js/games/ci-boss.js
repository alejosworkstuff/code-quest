import { initProgress, completeGameLevel, completeGame, getGameProgress } from "../progress.js";
import { showModal, showToast } from "../ui.js";
import { playError } from "../sounds.js";

const GAME_ID = "ci-boss";

const STAGES = [
  {
    id: "lint",
    name: "Lint",
    failMsg: "ESLint encontró errores de estilo.",
    fixes: [
      { id: "fix", label: "Corregir los errores que reporta ESLint", correct: true },
      { id: "skip", label: "Agregar eslint-disable en todo el archivo", correct: false },
      { id: "delete", label: "Borrar el workflow de CI", correct: false },
    ],
    wrongFeedback: "eslint-disable esconde problemas. El robot teacher quiere código limpio, no silencio.",
  },
  {
    id: "typecheck",
    name: "Type-check",
    failMsg: "TypeScript strict: Property 'foo' does not exist.",
    fixes: [
      { id: "any", label: "Castear todo a any", correct: false },
      { id: "fix", label: "Tipar correctamente o ajustar el interface", correct: true },
      { id: "ignore", label: "Desactivar strict en tsconfig", correct: false },
    ],
    wrongFeedback: "strict: true existe por algo. Arreglá el tipo, no lo apagues.",
  },
  {
    id: "test",
    name: "Test",
    failMsg: "Vitest: expected 3 but received 2.",
    fixes: [
      { id: "fix", label: "Revisar la assertion o el código bajo test", correct: true },
      { id: "delete", label: "Borrar el test que falla", correct: false },
      { id: "skip", label: "Marcar test como skip permanente", correct: false },
    ],
    wrongFeedback: "Un test roto puede ser señal de un bug real. Fix > skip.",
  },
  {
    id: "build",
    name: "Build",
    failMsg: "next build failed: Module not found.",
    fixes: [
      { id: "fix", label: "Corregir el import o instalar la dependencia", correct: true },
      { id: "push", label: "Push igual — funciona en mi máquina", correct: false },
      { id: "disable", label: "Quitar el step de build del CI", correct: false },
    ],
    wrongFeedback: "Si build falla en CI, producción también puede fallar.",
  },
];

let currentStage = 0;
const pipelineEl = document.getElementById("ci-pipeline");
const scenarioEl = document.getElementById("ci-scenario");
const optionsEl = document.getElementById("ci-options");
const feedbackEl = document.getElementById("ci-feedback");

function renderPipeline() {
  pipelineEl.innerHTML = STAGES.map((s, i) => {
    let cls = "ci-stage";
    if (i < currentStage) cls += " ci-stage--pass";
    if (i === currentStage) cls += " ci-stage--fail";
    return `<div class="${cls}">${s.name}</div>`;
  }).join("");
}

function renderStage() {
  const stage = STAGES[currentStage];
  if (!stage) return;

  renderPipeline();
  scenarioEl.innerHTML = `
    <p>🤖 <strong>Robot teacher:</strong> El stage <em>${stage.name}</em> falló.</p>
    <p style="margin-top:8px;color:var(--danger)">${stage.failMsg}</p>
    <p style="margin-top:12px;color:var(--muted)">¿Qué hacés?</p>
  `;

  optionsEl.innerHTML = stage.fixes
    .map((f) => `<button type="button" class="quiz-option" data-fix="${f.id}">${f.label}</button>`)
    .join("");

  feedbackEl.innerHTML = "";
}

function handleFix(fixId) {
  const stage = STAGES[currentStage];
  const fix = stage.fixes.find((f) => f.id === fixId);

  optionsEl.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.disabled = true;
    const f = stage.fixes.find((x) => x.id === btn.dataset.fix);
    if (f?.correct) btn.classList.add("quiz-option--correct");
    else if (btn.dataset.fix === fixId) btn.classList.add("quiz-option--wrong");
  });

  if (fix.correct) {
    feedbackEl.innerHTML = `<div class="feedback-box"><p>✓ Stage ${stage.name} pasa. El CI pipeline protege calidad antes del deploy.</p>
      <button type="button" class="btn" style="margin-top:12px" id="next-stage">${currentStage < STAGES.length - 1 ? "Siguiente stage →" : "Derrotar al boss"}</button></div>`;
    completeGameLevel(GAME_ID, stage.id);
    showToast(`Stage ${stage.name} resuelto — +10 XP`, "success");
  } else {
    playError();
    feedbackEl.innerHTML = `<div class="feedback-box"><p>✗ ${stage.wrongFeedback}</p></div>`;
  }

  document.getElementById("next-stage")?.addEventListener("click", () => {
    if (!fix.correct) return;
    currentStage += 1;
    if (currentStage >= STAGES.length) {
      if (!getGameProgress(GAME_ID).completed) {
        completeGame(GAME_ID);
        showModal({
          title: "¡CI Boss derrotado!",
          body: "Lint → typecheck → test → build. Así funciona tu CI en todos los repos.",
          xp: 25,
          badge: { icon: "🤖", name: "CI Slayer" },
        });
      }
      currentStage = 0;
    }
    renderStage();
  });
}

optionsEl?.addEventListener("click", (e) => {
  const btn = e.target.closest(".quiz-option");
  if (!btn || btn.disabled) return;
  handleFix(btn.dataset.fix);
});

function init() {
  initProgress();
  renderStage();
}

init();
