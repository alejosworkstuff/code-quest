const STORAGE_KEY = "code-quest-sound-muted";

let audioCtx = null;
let muted = localStorage.getItem(STORAGE_KEY) === "true";

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function now() {
  return getCtx().currentTime;
}

function gainAt(time, peak, duration) {
  const g = getCtx().createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(peak, time + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  return g;
}

function playTone(freq, start, duration, type = "sine", peak = 0.12) {
  if (muted || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = gainAt(start, peak, duration);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function playSequence(notes, gap = 0.09, type = "square", peak = 0.07) {
  notes.forEach((freq, i) => {
    playTone(freq, now() + i * gap, gap + 0.05, type, peak);
  });
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
  localStorage.setItem(STORAGE_KEY, String(value));
  updateToggleUi();
}

export function toggleMuted() {
  setMuted(!muted);
  if (!muted) playClick();
  return muted;
}

export function playClick() {
  playTone(880, now(), 0.06, "triangle", 0.06);
}

export function playSuccess() {
  playSequence([523, 659, 784], 0.08, "square", 0.08);
}

export function playLevelUp() {
  playSequence([392, 523, 659, 784, 988], 0.07, "square", 0.09);
}

export function playError() {
  playTone(180, now(), 0.18, "sawtooth", 0.07);
  playTone(140, now() + 0.1, 0.22, "sawtooth", 0.06);
}

export function playVictory() {
  playSequence([523, 659, 784, 988, 784, 988], 0.1, "square", 0.09);
  setTimeout(() => playSequence([784, 988, 1175], 0.12, "sine", 0.07), 520);
}

export function playMatch() {
  playSequence([660, 880], 0.06, "triangle", 0.08);
}

export function playStep() {
  playTone(440, now(), 0.05, "triangle", 0.05);
}

let toggleBtn = null;

function updateToggleUi() {
  if (!toggleBtn) return;
  toggleBtn.textContent = muted ? "🔇" : "🔊";
  toggleBtn.setAttribute("aria-label", muted ? "Activar sonidos" : "Silenciar sonidos");
  toggleBtn.setAttribute("aria-pressed", muted ? "true" : "false");
  toggleBtn.classList.toggle("sound-toggle--muted", muted);
}

export function mountSoundToggle() {
  if (toggleBtn) return;

  toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.id = "sound-toggle";
  toggleBtn.className = "sound-toggle";
  toggleBtn.addEventListener("click", toggleMuted);
  document.body.appendChild(toggleBtn);
  updateToggleUi();
}

export function initSounds() {
  mountSoundToggle();

  const unlock = () => {
    getCtx();
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
  };
  document.addEventListener("pointerdown", unlock);
  document.addEventListener("keydown", unlock);

  document.addEventListener(
    "click",
    (e) => {
      if (muted) return;
      const el = e.target.closest(
        ".btn, .quiz-option, .game-card-link, .level-tab, .memory-card, .auth-role, .tracer-node, .bug-line"
      );
      if (!el || el.disabled || el.getAttribute("aria-disabled") === "true") return;
      if (el.classList.contains("game-card-link--locked")) return;
      if (el.classList.contains("sound-toggle")) return;
      if (
        el.classList.contains("quiz-option") ||
        el.classList.contains("memory-card") ||
        el.classList.contains("bug-line") ||
        el.classList.contains("tracer-node")
      ) {
        return;
      }
      playClick();
    },
    true
  );
}

initSounds();
