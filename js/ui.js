import { playSuccess, playError, playVictory, playLevelUp } from "./sounds.js";

let toastContainer = null;

export function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    toastContainer.setAttribute("aria-live", "polite");
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function toastSound(type, message) {
  if (type === "error") {
    playError();
    return;
  }
  if (type === "success") {
    if (/nivel|stage|completado|derrotado|encontrado/i.test(message)) {
      playLevelUp();
    } else {
      playSuccess();
    }
    return;
  }
}

export function showToast(message, type = "info", duration = 3500) {
  toastSound(type, message);

  const container = ensureToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

export function showModal({ title, body, xp, badge, onClose }) {
  playVictory();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal modal--victory" role="dialog" aria-modal="true">
      <div style="font-size:3rem;margin-bottom:8px">${badge ? badge.icon : "🎉"}</div>
      <h2>${title}</h2>
      <p>${body}</p>
      ${xp ? `<div class="xp-burst">+${xp} XP</div>` : ""}
      ${badge ? `<span class="badge-pill badge-pill--earned" style="margin-top:8px">${badge.icon} ${badge.name}</span>` : ""}
      <button type="button" class="btn btn-hero" style="margin-top:24px">Continuar</button>
    </div>
  `;

  const close = () => {
    overlay.remove();
    onClose?.();
  };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector("button").addEventListener("click", close);
  document.body.appendChild(overlay);

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    launchConfetti();
  }
}

export function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.id = "confetti-canvas";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#ff6a3d", "#3dd6f5", "#a78bfa", "#4ade80", "#fbbf24"];
  const pieces = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 100,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 4,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.2,
  }));

  let frame = 0;
  const maxFrames = 120;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame += 1;
    if (frame < maxFrames) {
      requestAnimationFrame(draw);
    } else {
      canvas.remove();
    }
  }

  draw();
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
