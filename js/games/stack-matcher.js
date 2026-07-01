import { initProgress, completeGame, getGameProgress } from "../progress.js";
import { showModal, showToast } from "../ui.js";
import { playMatch, playError } from "../sounds.js";
import { t, pick } from "../i18n.js";

const GAME_ID = "stack-matcher";
const board = document.getElementById("memory-board");
const statusEl = document.getElementById("game-status");

let pairs = [];
let cards = [];
let flipped = [];
let matched = 0;
let lock = false;

function updateStatus() {
  statusEl.textContent = t("stackMatcher.pairsFound", { found: matched, total: pairs.length });
}

async function loadPairs() {
  const res = await fetch("../data/stacks.json");
  const data = await res.json();
  pairs = data.pairs.slice(0, 6);
}

function buildDeck() {
  const deck = [];
  pairs.forEach((pair, i) => {
    deck.push({ id: `p-${i}`, type: "project", text: pair.project, pairIndex: i });
    deck.push({ id: `s-${i}`, type: "stack", text: pair.stack, pairIndex: i });
  });
  return deck.sort(() => Math.random() - 0.5);
}

function renderBoard() {
  board.innerHTML = cards
    .map(
      (card, index) => `
    <button type="button" class="memory-card" data-index="${index}" aria-label="${t("stackMatcher.card", { n: index + 1 })}">
      <span class="memory-card__back">?</span>
      <span class="memory-card__front" hidden>${card.text}</span>
    </button>
  `
    )
    .join("");

  board.querySelectorAll(".memory-card").forEach((el) => {
    el.addEventListener("click", () => flipCard(Number(el.dataset.index)));
  });
}

function flipCard(index) {
  if (lock) return;
  const card = cards[index];
  const el = board.children[index];

  if (el.classList.contains("memory-card--flipped") || el.classList.contains("memory-card--matched")) return;

  el.classList.add("memory-card--flipped");
  el.querySelector(".memory-card__back").hidden = true;
  el.querySelector(".memory-card__front").hidden = false;

  flipped.push({ index, card, el });

  if (flipped.length === 2) {
    lock = true;
    const [a, b] = flipped;
    if (a.card.pairIndex === b.card.pairIndex && a.card.type !== b.card.type) {
      setTimeout(() => {
        a.el.classList.add("memory-card--matched");
        b.el.classList.add("memory-card--matched");
        matched += 1;
        updateStatus();
        playMatch();
        showPairExplain(a.card.pairIndex);
        flipped = [];
        lock = false;
        if (matched === pairs.length) finishGame();
      }, 400);
    } else {
      playError();
      setTimeout(() => {
        [a, b].forEach(({ el: node }) => {
          node.classList.remove("memory-card--flipped");
          node.querySelector(".memory-card__back").hidden = false;
          node.querySelector(".memory-card__front").hidden = true;
        });
        flipped = [];
        lock = false;
      }, 800);
    }
  }
}

function showPairExplain(pairIndex) {
  const pair = pairs[pairIndex];
  showToast(`${pair.project}: ${pick(pair.explain)}`, "success", 5000);
}

function finishGame() {
  if (getGameProgress(GAME_ID).completed) return;
  completeGame(GAME_ID);
  showModal({
    title: t("stackMatcher.doneTitle"),
    body: t("stackMatcher.doneBody"),
    xp: 25,
    badge: { icon: "🃏", name: "Stack Master" },
  });
}

function refreshI18n() {
  updateStatus();
  board.querySelectorAll(".memory-card").forEach((el, index) => {
    el.setAttribute("aria-label", t("stackMatcher.card", { n: index + 1 }));
  });
}

async function init() {
  initProgress();
  await loadPairs();
  cards = buildDeck();
  updateStatus();
  renderBoard();
}

init();
window.addEventListener("code-quest:lang-change", () => refreshI18n());
