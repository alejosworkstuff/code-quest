import { initProgress, completeGameLevel, completeGame, getGameProgress } from "../progress.js";
import { showToast, showModal } from "../ui.js";
import { playError } from "../sounds.js";
import {
  applyJobFilters,
  predictCount,
  salaryBandForString,
  SALARY_BANDS,
} from "../lib/filter-logic.js";

const GAME_ID = "filter-fighter";
let jobs = [];
let currentLevel = 1;
let filters = {
  searchText: "",
  selectedType: "all",
  selectedSeniority: "all",
  selectedSalary: "all",
};

const levelTabs = document.getElementById("level-tabs");
const gameContent = document.getElementById("game-content");

async function loadJobs() {
  const res = await fetch("../data/jobs-sample.json");
  jobs = await res.json();
}

function renderLevelTabs() {
  const progress = getGameProgress(GAME_ID);
  levelTabs.innerHTML = [1, 2, 3]
    .map((n) => {
      const done = progress.levels.includes(`level-${n}`);
      const active = n === currentLevel;
      return `<button type="button" class="level-tab ${active ? "level-tab--active" : ""} ${done ? "level-tab--done" : ""}" data-level="${n}">Nivel ${n}${done ? " ✓" : ""}</button>`;
    })
    .join("");

  levelTabs.querySelectorAll(".level-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentLevel = Number(btn.dataset.level);
      renderLevel();
    });
  });
}

function renderJobsList(list) {
  if (!list.length) {
    return `<p class="jobs-count">0 empleos encontrados — probá otros filtros.</p>`;
  }
  return `
    <p class="jobs-count">${list.length} empleo${list.length === 1 ? "" : "s"} encontrado${list.length === 1 ? "" : "s"}</p>
    <div class="jobs-list">
      ${list
        .map(
          (job) => `
        <article class="job-card">
          <h3>${job.title}</h3>
          <p class="job-meta">${job.company} · ${job.type} · ${job.seniority} · ${job.salary}</p>
        </article>
      `
        )
        .join("")}
    </div>
  `;
}

function renderLevel1() {
  gameContent.innerHTML = `
    <div class="filter-fighter-grid">
      <aside class="filter-panel glass">
        <div class="filter-group">
          <label for="search">Buscar</label>
          <input id="search" type="search" placeholder="React, company..." />
        </div>
        <div class="filter-group">
          <label for="type">Tipo</label>
          <select id="type">
            <option value="all">Todos</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="seniority">Seniority</label>
          <select id="seniority">
            <option value="all">Todos</option>
            <option value="Trainee">Trainee</option>
            <option value="Junior">Junior</option>
            <option value="Semi-Senior">Semi-Senior</option>
            <option value="Senior">Senior</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="salary">Salario</label>
          <select id="salary">
            <option value="all">Todos</option>
            ${Object.entries(SALARY_BANDS)
              .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
              .join("")}
          </select>
        </div>
      </aside>
      <section class="jobs-panel glass" id="jobs-panel"></section>
    </div>
    <p class="feedback-box" style="margin-top:16px">💡 <strong>Nivel 1:</strong> Mové los filtros y observá cuántos empleos quedan. Esto es lo que hace <code>mini-job-board</code> en vivo.</p>
    <button type="button" class="btn btn-sm" id="complete-level-1" style="margin-top:12px">Completar nivel 1</button>
  `;

  const panel = document.getElementById("jobs-panel");
  const update = () => {
    filters = {
      searchText: document.getElementById("search").value,
      selectedType: document.getElementById("type").value,
      selectedSeniority: document.getElementById("seniority").value,
      selectedSalary: document.getElementById("salary").value,
    };
    panel.innerHTML = renderJobsList(applyJobFilters(jobs, filters));
  };

  ["search", "type", "seniority", "salary"].forEach((id) => {
    document.getElementById(id).addEventListener("input", update);
    document.getElementById(id).addEventListener("change", update);
  });

  document.getElementById("type").value = "Remote";
  update();

  document.getElementById("complete-level-1")?.addEventListener("click", () => {
    if (getGameProgress(GAME_ID).levels.includes("level-1")) return;
    completeGameLevel(GAME_ID, "level-1");
    showToast("Nivel 1 completado — +10 XP", "success");
    renderLevelTabs();
  });
}

function renderLevel2() {
  const challenge = {
    searchText: "",
    selectedType: "Remote",
    selectedSeniority: "Senior",
    selectedSalary: "all",
  };
  const expected = predictCount(jobs, challenge);

  gameContent.innerHTML = `
    <div class="glass" style="padding:24px">
      <p><strong>Misión:</strong> Sin aplicar filtros todavía — ¿cuántos empleos quedan con <em>Remote + Senior</em>?</p>
      <div class="code-preview">
        <span class="fn">applyJobFilters</span>(jobs, {<br/>
        &nbsp;&nbsp;selectedType: <span class="str">"Remote"</span>,<br/>
        &nbsp;&nbsp;selectedSeniority: <span class="str">"Senior"</span><br/>
        })
      </div>
      <div class="quiz-options" id="quiz-options">
        ${[expected, expected + 2, expected - 1, 0]
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .sort(() => Math.random() - 0.5)
          .map(
            (n) => `<button type="button" class="quiz-option" data-answer="${n}">${n} empleos</button>`
          )
          .join("")}
      </div>
      <div id="level2-feedback"></div>
    </div>
  `;

  document.getElementById("quiz-options").addEventListener("click", (e) => {
    const btn = e.target.closest(".quiz-option");
    if (!btn) return;
    const answer = Number(btn.dataset.answer);
    const fb = document.getElementById("level2-feedback");
    if (answer === expected) {
      btn.classList.add("quiz-option--correct");
      fb.innerHTML = `<div class="feedback-box"><p>✓ Correcto. <code>filter-logic.mjs</code> es una función pura: misma entrada → misma salida, sin tocar el DOM.</p></div>`;
      completeGameLevel(GAME_ID, "level-2");
      showToast("Nivel 2 completado — +10 XP", "success");
      renderLevelTabs();
    } else {
      btn.classList.add("quiz-option--wrong");
      playError();
      fb.innerHTML = `<div class="feedback-box"><p>Casi — la respuesta era <strong>${expected}</strong>. Tip: filtrá Remote y Senior en el Nivel 1 para verificar.</p></div>`;
    }
  });
}

function renderLevel3() {
  const salary = "€45k–55k gross / year";
  const correctBand = salaryBandForString(salary);

  gameContent.innerHTML = `
    <div class="glass" style="padding:24px">
      <p><strong>Puzzle de salario:</strong> ¿Qué banda mensual en USD matchea este string?</p>
      <div class="code-preview"><span class="str">"${salary}"</span></div>
      <p style="color:var(--muted);font-size:0.9rem;margin-bottom:16px">Pista: es anual (÷12) y en euros (×1.08). El código real está en <code>filter-logic.mjs</code>.</p>
      <div class="quiz-options" id="quiz-options">
        ${Object.entries(SALARY_BANDS)
          .map(
            ([key, band]) =>
              `<button type="button" class="quiz-option" data-band="${key}">${band.label}</button>`
          )
          .join("")}
      </div>
      <div id="level3-feedback"></div>
    </div>
  `;

  document.getElementById("quiz-options").addEventListener("click", (e) => {
    const btn = e.target.closest(".quiz-option");
    if (!btn) return;
    const band = btn.dataset.band;
    const fb = document.getElementById("level3-feedback");

    if (band === correctBand) {
      btn.classList.add("quiz-option--correct");
      fb.innerHTML = `<div class="feedback-box"><p>✓ Correcto (~$4k–$5k/mes USD). Por eso extraemos la lógica a un módulo testeado — un bug de salario rompe filtros silenciosamente.</p></div>`;
      completeGameLevel(GAME_ID, "level-3");
      completeGame(GAME_ID);
      showModal({
        title: "¡Filter Fighter completado!",
        body: "Dominaste filtros, funciones puras y parsing de salarios.",
        xp: 25,
        badge: { icon: "🔍", name: "Filter Mage" },
      });
      renderLevelTabs();
    } else {
      btn.classList.add("quiz-option--wrong");
      playError();
      fb.innerHTML = `<div class="feedback-box"><p>No es esa banda. Convertí: 45k–55k anual EUR → mensual USD y compará con los rangos.</p></div>`;
    }
  });
}

function renderLevel() {
  renderLevelTabs();
  if (currentLevel === 1) renderLevel1();
  else if (currentLevel === 2) renderLevel2();
  else renderLevel3();
}

async function init() {
  initProgress();
  await loadJobs();
  renderLevel();
}

init();
