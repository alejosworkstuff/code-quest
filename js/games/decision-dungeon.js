import { initProgress, completeGameLevel, completeGame, getGameProgress } from "../progress.js";
import { showModal, showToast } from "../ui.js";

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
    <h2>${s.title}</h2>
    <blockquote>${s.prompt}</blockquote>
  `;

  optionsEl.innerHTML = s.options
    .map(
      (opt) =>
        `<button type="button" class="quiz-option" data-option="${opt.id}">${opt.label}</button>`
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

  feedbackEl.innerHTML = `
    <div class="feedback-box">
      <p>${opt.correct ? "✓" : "✗"} ${opt.feedback}</p>
      <button type="button" class="btn" style="margin-top:16px" id="next-scenario">
        ${currentIndex < scenarios.length - 1 ? "Siguiente escenario →" : "Completar dungeon"}
      </button>
    </div>
  `;

  completeGameLevel(GAME_ID, s.id);
  showToast(
    opt.correct ? "+10 XP — buena decisión" : "Revisá el feedback — cada error enseña",
    opt.correct ? "success" : "error"
  );

  document.getElementById("next-scenario").addEventListener("click", () => {
    currentIndex += 1;
    if (currentIndex >= scenarios.length) {
      if (!getGameProgress(GAME_ID).completed) {
        completeGame(GAME_ID);
        showModal({
          title: "¡Decision Dungeon completado!",
          body: "Ahora podés explicar por qué elegimos Redis, Clerk, SSG y más.",
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
