import { initProgress, completeGameLevel, completeGame, getGameProgress } from "../progress.js";
import { showModal, showToast } from "../ui.js";
import { t, pick } from "../i18n.js";

const GAME_ID = "decision-dungeon";
let scenarios = [];
let currentIndex = 0;

const dotsEl = document.getElementById("dungeon-dots");
const scenarioEl = document.getElementById("dungeon-scenario");
const optionsEl = document.getElementById("dungeon-options");
const feedbackEl = document.getElementById("dungeon-feedback");

async function loadScenarios() {
  const res = await fetch("../data/decisions.json");
  const data = await res.json();
  scenarios = data.scenarios;
}

function renderDots() {
  dotsEl.innerHTML = scenarios
    .map((_, i) => {
      let cls = "dungeon-dot";
      if (i < currentIndex) cls += " dungeon-dot--done";
      if (i === currentIndex) cls += " dungeon-dot--current";
      return `<span class="${cls}"></span>`;
    })
    .join("");
}

function renderScenario() {
  const s = scenarios[currentIndex];
  if (!s) return;

  scenarioEl.innerHTML = `
    <span class="scenario-tag">${s.tag}</span>
    <h2>${pick(s.title)}</h2>
    <blockquote>${pick(s.prompt)}</blockquote>
  `;

  optionsEl.innerHTML = s.options
    .map(
      (opt) =>
        `<button type="button" class="quiz-option" data-option="${opt.id}">${pick(opt.label)}</button>`
    )
    .join("");

  feedbackEl.innerHTML = "";
  renderDots();
}

function handleOption(optionId) {
  const s = scenarios[currentIndex];
  const opt = s.options.find((o) => o.id === optionId);
  if (!opt) return;

  optionsEl.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.disabled = true;
    const id = btn.dataset.option;
    const o = s.options.find((x) => x.id === id);
    if (o?.correct) btn.classList.add("quiz-option--correct");
    else if (id === optionId) btn.classList.add("quiz-option--wrong");
  });

  const nextLabel =
    currentIndex < scenarios.length - 1 ? t("decision.nextScenario") : t("decision.completeDungeon");

  feedbackEl.innerHTML = `
    <div class="feedback-box">
      <p>${opt.correct ? "✓" : "✗"} ${pick(opt.feedback)}</p>
      <button type="button" class="btn" style="margin-top:16px" id="next-scenario">
        ${nextLabel}
      </button>
    </div>
  `;

  completeGameLevel(GAME_ID, s.id);
  showToast(
    opt.correct ? t("common.xpGood") : t("common.xpReview"),
    opt.correct ? "success" : "error"
  );

  document.getElementById("next-scenario").addEventListener("click", () => {
    currentIndex += 1;
    if (currentIndex >= scenarios.length) {
      if (!getGameProgress(GAME_ID).completed) {
        completeGame(GAME_ID);
        showModal({
          title: t("decision.doneTitle"),
          body: t("decision.doneBody"),
          xp: 25,
          badge: { icon: "⚔️", name: "Architect" },
        });
      }
      currentIndex = 0;
    }
    renderScenario();
  });
}

optionsEl?.addEventListener("click", (e) => {
  const btn = e.target.closest(".quiz-option");
  if (!btn || btn.disabled) return;
  handleOption(btn.dataset.option);
});

async function init() {
  initProgress();
  await loadScenarios();
  renderScenario();
}

init();
window.addEventListener("code-quest:lang-change", () => renderScenario());
