import {
  initProgress,
  getProgress,
  getWorldProgress,
  isWorldUnlocked,
  getBadges,
  isGameCompleted,
  XP,
} from "./progress.js";
import { t, pick, onLangChange } from "./i18n.js";
import "./sounds.js";

const WORLD_COLORS = [
  "#3dd6f5",
  "#4ade80",
  "#f472b6",
  "#fb923c",
  "#a78bfa",
  "#38bdf8",
  "#fbbf24",
];

const WORLD_ICONS = ["🗂️", "⚡", "⚛️", "🚀", "🔐", "🧠", "🤖"];

const GAME_ICONS = {
  "filter-fighter": "🔍",
  "stack-matcher": "🃏",
  "decision-dungeon": "⚔️",
  "pipeline-puzzle": "🔗",
  "request-tracer": "📡",
  "ci-boss": "🤖",
  "bug-hunt": "🐛",
  "auth-gate": "🔐",
};

let curriculum = null;

async function loadCurriculum() {
  if (curriculum) return curriculum;
  const res = await fetch("./data/curriculum.json");
  curriculum = await res.json();
  return curriculum;
}

function animateValue(el, target, duration = 800) {
  const start = 0;
  const startTime = performance.now();
  function tick(now) {
    const tVal = Math.min((now - startTime) / duration, 1);
    const eased = 1 - (1 - tVal) ** 3;
    el.textContent = Math.round(start + (target - start) * eased);
    if (tVal < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderStats(state) {
  const bar = document.getElementById("stats-bar");
  if (!bar) return;

  const totalGames = Object.keys(curriculum?.games || {}).length || 8;
  const completed = Object.values(state.games).filter((g) => g.completed).length;

  bar.innerHTML = `
    <div class="stat-card glass stat-card--xp animate-in">
      <span class="stat-card__icon">⚡</span>
      <div class="stat-value" data-target="${state.xp}">0</div>
      <div class="stat-label">${t("stats.xp")}</div>
    </div>
    <div class="stat-card glass stat-card--streak animate-in">
      <span class="stat-card__icon">🔥</span>
      <div class="stat-value" data-target="${state.streak}">0</div>
      <div class="stat-label">${t("stats.streak")}</div>
    </div>
    <div class="stat-card glass stat-card--badges animate-in">
      <span class="stat-card__icon">🏅</span>
      <div class="stat-value" data-target="${state.badges.length}">0</div>
      <div class="stat-label">${t("stats.badges")}</div>
    </div>
    <div class="stat-card glass stat-card--games animate-in">
      <span class="stat-card__icon">🎮</span>
      <div class="stat-value" data-target="${completed}">0</div>
      <div class="stat-label">${t("stats.games", { done: completed, total: totalGames })}</div>
    </div>
  `;

  bar.querySelectorAll(".stat-value").forEach((el) => {
    animateValue(el, Number(el.dataset.target));
  });
}

function findCurrentWorldIndex(data) {
  for (let i = 0; i < data.worlds.length; i += 1) {
    if (!isWorldUnlocked(i, data.worlds)) return Math.max(0, i - 1);
    const pct = getWorldProgress(data.worlds[i].id, data.worlds[i].games);
    if (pct < 100) return i;
  }
  return data.worlds.length - 1;
}

function renderWorlds(data) {
  const container = document.getElementById("worlds-grid");
  if (!container) return;

  const currentIdx = findCurrentWorldIndex(data);

  container.innerHTML = data.worlds
    .map((world, index) => {
      const unlocked = isWorldUnlocked(index, data.worlds);
      const pct = getWorldProgress(world.id, world.games);
      const color = WORLD_COLORS[index] || "#ff6a3d";
      const icon = WORLD_ICONS[index] || "🌍";
      const isCurrent = unlocked && index === currentIdx && pct < 100;
      const delay = index * 0.08;
      const projectLabel = pick(world.project);

      const gamesHtml = world.games
        .map((gameId) => {
          const game = data.games[gameId];
          if (!game) return "";
          const done = isGameCompleted(gameId);
          const locked = !unlocked;
          const gIcon = GAME_ICONS[gameId] || "🎯";
          return `
            <a href="${locked ? "#" : game.path}"
               class="game-card-link ${done ? "game-card-link--done" : ""} ${locked ? "game-card-link--locked" : ""}"
               style="--node-color:${color}"
               ${locked ? 'aria-disabled="true"' : ""}>
              <span class="game-card-link__icon">${gIcon}</span>
              <span class="game-card-link__meta">
                <span>${done ? "✓ " : ""}${game.title}</span>
                <span class="game-card-link__xp">+${XP.game + game.levels * XP.level} XP</span>
              </span>
            </a>`;
        })
        .join("");

      return `
        <article class="world-node ${unlocked ? "" : "world-node--locked"} ${isCurrent ? "world-node--current" : ""}"
                 style="--node-color:${color}; animation-delay:${delay}s">
          <div class="world-node__marker" title="${t("map.world", { n: world.number })}">${icon}</div>
          <div class="world-node__card glass">
            <div class="world-card__header">
              <span class="world-card__number" style="color:${color}">${t("map.world", { n: world.number })}</span>
              ${unlocked ? `<span class="badge-pill">${pct}%</span>` : `<span class="badge-pill badge-pill--locked">${t("map.locked")}</span>`}
            </div>
            <h2>${pick(world.title)}</h2>
            <p>${pick(world.description)}</p>
            <div class="world-progress">
              <div class="world-progress__fill" style="width:${pct}%;background:${color}"></div>
            </div>
            <div class="world-games">${gamesHtml}</div>
            <a class="project-link" href="${world.projectUrl}" target="_blank" rel="noopener">${t("map.viewProject", { project: projectLabel })}</a>
          </div>
        </article>`;
    })
    .join("");
}

function renderBadges(state) {
  const grid = document.getElementById("badges-grid");
  if (!grid) return;

  const all = getBadges();
  grid.innerHTML = Object.values(all)
    .map((badge, i) => {
      const earned = state.badges.includes(badge.id);
      return `
        <div class="badge-card ${earned ? "badge-card--earned" : "badge-card--locked"} animate-in"
             style="animation-delay:${i * 0.05}s">
          <span class="badge-card__icon">${badge.icon}</span>
          <span class="badge-card__name">${badge.name}</span>
        </div>`;
    })
    .join("");
}

export async function initHub() {
  initProgress();
  const state = getProgress();
  const data = await loadCurriculum();
  curriculum = data;

  renderStats(state);
  renderWorlds(data);
  renderBadges(state);
}

if (document.getElementById("worlds-grid")) {
  initHub();
  onLangChange(() => initHub());
  window.addEventListener("code-quest:lang-change", () => initHub());
}
