const STORAGE_KEY = "code-quest-progress-v1";

const XP = {
  level: 10,
  game: 25,
  world: 50,
};

const BADGES = {
  "filter-fighter": { id: "filter-fighter", name: "Filter Mage", icon: "🔍" },
  "stack-matcher": { id: "stack-matcher", name: "Stack Master", icon: "🃏" },
  "decision-dungeon": { id: "decision-dungeon", name: "Architect", icon: "⚔️" },
  "pipeline-puzzle": { id: "pipeline-puzzle", name: "RAG Runner", icon: "🔗" },
  "request-tracer": { id: "request-tracer", name: "Trace Hunter", icon: "📡" },
  "ci-boss": { id: "ci-boss", name: "CI Slayer", icon: "🤖" },
  "bug-hunt": { id: "bug-hunt", name: "Bug Buster", icon: "🐛" },
  "auth-gate": { id: "auth-gate", name: "Gate Keeper", icon: "🔐" },
  hero: { id: "hero", name: "Full-stack Hero", icon: "🏆" },
};

const GAME_IDS = Object.keys(BADGES).filter((k) => k !== "hero");

function defaultState() {
  return {
    xp: 0,
    games: {},
    worldProgress: {},
    badges: [],
    streak: 0,
    lastVisit: null,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(state) {
  const today = todayKey();
  const last = state.lastVisit;

  if (last === today) return state;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (last === yesterdayKey) {
    state.streak += 1;
  } else if (last !== today) {
    state.streak = 1;
  }

  state.lastVisit = today;
  return state;
}

export function initProgress() {
  let state = loadState();
  state = updateStreak(state);
  saveState(state);
  return state;
}

export function getProgress() {
  return loadState();
}

export function addXp(amount) {
  const state = loadState();
  state.xp += amount;
  saveState(state);
  return state.xp;
}

export function completeGameLevel(gameId, levelId) {
  const state = loadState();
  if (!state.games[gameId]) {
    state.games[gameId] = { levels: [], completed: false };
  }

  const game = state.games[gameId];
  if (!game.levels.includes(levelId)) {
    game.levels.push(levelId);
    state.xp += XP.level;
  }

  saveState(state);
  return state;
}

export function completeGame(gameId) {
  const state = loadState();
  if (!state.games[gameId]) {
    state.games[gameId] = { levels: [], completed: false };
  }

  const game = state.games[gameId];
  if (!game.completed) {
    game.completed = true;
    state.xp += XP.game;

    const badge = BADGES[gameId];
    if (badge && !state.badges.includes(badge.id)) {
      state.badges.push(badge.id);
    }
  }

  const allDone = GAME_IDS.every((id) => state.games[id]?.completed);
  if (allDone && !state.badges.includes("hero")) {
    state.badges.push("hero");
    state.xp += XP.world;
  }

  saveState(state);
  return state;
}

export function getGameProgress(gameId) {
  const state = loadState();
  return state.games[gameId] || { levels: [], completed: false };
}

export function isGameCompleted(gameId) {
  return Boolean(getProgress().games[gameId]?.completed);
}

export function getWorldProgress(worldId, gameIds) {
  const state = loadState();
  if (!gameIds.length) return 0;

  const completed = gameIds.filter((id) => state.games[id]?.completed).length;
  const pct = Math.round((completed / gameIds.length) * 100);
  state.worldProgress[worldId] = pct;
  saveState(state);
  return pct;
}

export function isWorldUnlocked(worldIndex, worlds) {
  if (worldIndex === 0) return true;
  const prev = worlds[worldIndex - 1];
  if (!prev) return true;
  const pct = getWorldProgress(prev.id, prev.games);
  return pct >= 70;
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return defaultState();
}

export function getBadges() {
  return BADGES;
}

export function getEarnedBadges() {
  return getProgress().badges.map((id) => BADGES[id]).filter(Boolean);
}

export { XP, BADGES, GAME_IDS };
