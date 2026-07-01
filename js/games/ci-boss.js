import { initProgress, completeGameLevel, completeGame, getGameProgress } from "../progress.js";
import { showModal, showToast } from "../ui.js";
import { playError } from "../sounds.js";
import { t } from "../i18n.js";

const GAME_ID = "ci-boss";

const STAGES = [
  { id: "lint", name: "Lint", correctFix: "fix", fixIds: ["fix", "skip", "delete"] },
  { id: "typecheck", name: "Type-check", correctFix: "fix", fixIds: ["any", "fix", "ignore"] },
  { id: "test", name: "Test", correctFix: "fix", fixIds: ["fix", "delete", "skip"] },
  { id: "build", name: "Build", correctFix: "fix", fixIds: ["fix", "push", "disable"] },
];

let currentStage = 0;
const pipelineEl = document.getElementById("ci-pipeline");
const scenarioEl = document.getElementById("ci-scenario");
const optionsEl = document.getElementById("ci-options");
const feedbackEl = document.getElementById("ci-feedback");

function stageFailMsg(stage) {
  return t(`ciBoss.stages.${stage.id}.failMsg`);
}

function fixLabel(stage, fixId) {
  return t(`ciBoss.stages.${stage.id}.fixes.${fixId}`);
}

function stageWrongFeedback(stage) {
  return t(`ciBoss.stages.${stage.id}.wrongFeedback`);
}

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
    <p>🤖 <strong>${t("ciBoss.robotTeacher", { name: stage.name })}</strong></p>
    <p style="margin-top:8px;color:var(--danger)">${stageFailMsg(stage)}</p>
    <p style="margin-top:12px;color:var(--muted)">${t("ciBoss.whatDo")}</p>
  `;

  optionsEl.innerHTML = stage.fixIds
    .map((fixId) => `<button type="button" class="quiz-option" data-fix="${fixId}">${fixLabel(stage, fixId)}</button>`)
    .join("");

  feedbackEl.innerHTML = "";
}

function handleFix(fixId) {
  const stage = STAGES[currentStage];
  const correct = fixId === stage.correctFix;

  optionsEl.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.disabled = true;
    const id = btn.dataset.fix;
    if (id === stage.correctFix) btn.classList.add("quiz-option--correct");
    else if (id === fixId) btn.classList.add("quiz-option--wrong");
  });

  if (correct) {
    const nextLabel =
      currentStage < STAGES.length - 1 ? t("ciBoss.nextStage") : t("ciBoss.defeatBoss");
    feedbackEl.innerHTML = `<div class="feedback-box"><p>✓ ${t("ciBoss.stagePass", { name: stage.name })}</p>
      <button type="button" class="btn" style="margin-top:12px" id="next-stage">${nextLabel}</button></div>`;
    completeGameLevel(GAME_ID, stage.id);
    showToast(t("ciBoss.stageResolved", { name: stage.name }), "success");
  } else {
    playError();
    feedbackEl.innerHTML = `<div class="feedback-box"><p>✗ ${stageWrongFeedback(stage)}</p></div>`;
  }

  document.getElementById("next-stage")?.addEventListener("click", () => {
    if (!correct) return;
    currentStage += 1;
    if (currentStage >= STAGES.length) {
      if (!getGameProgress(GAME_ID).completed) {
        completeGame(GAME_ID);
        showModal({
          title: t("ciBoss.doneTitle"),
          body: t("ciBoss.doneBody"),
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
window.addEventListener("code-quest:lang-change", () => renderStage());
