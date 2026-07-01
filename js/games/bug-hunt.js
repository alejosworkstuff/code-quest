import { initProgress, completeGameLevel, completeGame, getGameProgress } from "../progress.js";
import { showModal, showToast } from "../ui.js";
import { playError } from "../sounds.js";
import { t, pick } from "../i18n.js";

const GAME_ID = "bug-hunt";
let bugs = [];
let currentIndex = 0;
let hintsUsed = 0;

const titleEl = document.getElementById("bug-title");
const snippetEl = document.getElementById("bug-snippet");
const hintsEl = document.getElementById("bug-hints");
const feedbackEl = document.getElementById("bug-feedback");
const progressEl = document.getElementById("bug-progress");

async function loadBugs() {
  const res = await fetch("../data/snippets.json");
  const data = await res.json();
  bugs = data.bugs;
}

function renderBug() {
  const bug = bugs[currentIndex];
  if (!bug) return;

  titleEl.textContent = `${bug.project}: ${pick(bug.title)}`;
  progressEl.textContent = t("bugHunt.bugProgress", { current: currentIndex + 1, total: bugs.length });

  snippetEl.innerHTML = bug.lines
    .map((line, i) => {
      const lineNum = i + 1;
      return `<span class="bug-line" data-line="${lineNum}"><span style="color:var(--muted);margin-right:12px">${lineNum}</span>${escapeLine(line)}</span>`;
    })
    .join("");

  const hintsLeft = 3 - hintsUsed;
  hintsEl.innerHTML = `<button type="button" class="btn btn-ghost btn-sm" id="hint-btn">${t("bugHunt.hint", { n: hintsLeft })}</button>`;
  feedbackEl.innerHTML = "";

  snippetEl.querySelectorAll(".bug-line").forEach((el) => {
    el.addEventListener("click", () => guessLine(Number(el.dataset.line)));
  });

  document.getElementById("hint-btn")?.addEventListener("click", showHint);
}

function escapeLine(line) {
  return line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function showHint() {
  const bug = bugs[currentIndex];
  hintsUsed += 1;
  const hintKey = `hint${Math.min(hintsUsed, 3)}`;
  const hint = pick(bug[hintKey]);
  if (hint) {
    feedbackEl.innerHTML = `<div class="feedback-box"><p>💡 ${hint}</p></div>`;
  }
  if (hintsUsed >= 3) {
    document.getElementById("hint-btn").disabled = true;
  } else {
    document.getElementById("hint-btn").textContent = t("bugHunt.hint", { n: 3 - hintsUsed });
  }
}

function guessLine(lineNum) {
  const bug = bugs[currentIndex];
  const lines = snippetEl.querySelectorAll(".bug-line");

  lines.forEach((el) => el.classList.remove("bug-line--selected", "bug-line--correct"));

  if (lineNum === bug.bugLine) {
    lines[lineNum - 1].classList.add("bug-line--correct");
    const nextLabel =
      currentIndex < bugs.length - 1 ? t("bugHunt.nextBug") : t("common.complete");
    feedbackEl.innerHTML = `<div class="feedback-box"><p>✓ ${pick(bug.explanation)}</p>
      <button type="button" class="btn" style="margin-top:12px" id="next-bug">${nextLabel}</button></div>`;
    completeGameLevel(GAME_ID, bug.id);
    showToast(t("bugHunt.found"), "success");

    document.getElementById("next-bug").addEventListener("click", () => {
      currentIndex += 1;
      hintsUsed = 0;
      if (currentIndex >= bugs.length) {
        if (!getGameProgress(GAME_ID).completed) {
          completeGame(GAME_ID);
          showModal({
            title: t("bugHunt.doneTitle"),
            body: t("bugHunt.doneBody"),
            xp: 25,
            badge: { icon: "🐛", name: "Bug Buster" },
          });
        }
        currentIndex = 0;
      }
      renderBug();
    });
  } else {
    lines[lineNum - 1].classList.add("bug-line--selected");
    playError();
    feedbackEl.innerHTML = `<div class="feedback-box"><p>${t("bugHunt.wrongLine")}</p></div>`;
  }
}

async function init() {
  initProgress();
  await loadBugs();
  renderBug();
}

init();
window.addEventListener("code-quest:lang-change", () => renderBug());
