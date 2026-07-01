import { initProgress, completeGame, getGameProgress } from "../progress.js";
import { showModal } from "../ui.js";

const GAME_ID = "auth-gate";

const ROLES = {
  guest: { label: "Guest (sin login)", id: "guest" },
  user: { label: "User (logged in)", id: "user" },
  admin: { label: "Admin", id: "admin" },
};

const ROUTES = [
  { path: "/", public: true },
  { path: "/products", public: true },
  { path: "/cart", public: true },
  { path: "/my-purchases", roles: ["user", "admin"] },
  { path: "/collections", roles: ["user", "admin"] },
  { path: "/admin", roles: ["admin"] },
];

let activeRole = "guest";
const rolesEl = document.getElementById("auth-roles");
const routesEl = document.getElementById("auth-routes");
const explainEl = document.getElementById("auth-explain");

function canAccess(route, role) {
  if (route.public) return true;
  return route.roles?.includes(role);
}

function renderRoles() {
  rolesEl.innerHTML = Object.values(ROLES)
    .map(
      (r) =>
        `<button type="button" class="auth-role ${r.id === activeRole ? "auth-role--active" : ""}" data-role="${r.id}">${r.label}</button>`
    )
    .join("");

  rolesEl.querySelectorAll(".auth-role").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeRole = btn.dataset.role;
      renderRoles();
      renderRoutes();
    });
  });
}

function renderRoutes() {
  routesEl.innerHTML = ROUTES.map((route) => {
    const allowed = canAccess(route, activeRole);
    return `
      <div class="auth-route ${allowed ? "auth-route--allowed" : "auth-route--denied"}">
        <span>${route.path}</span>
        <span class="auth-route__status">${allowed ? "✓ Permitido" : "✗ Redirect /sign-in"}</span>
      </div>
    `;
  }).join("");

  explainEl.innerHTML = `
    <div class="feedback-box">
      <p><strong>Clerk middleware</strong> en mini-ecommerce protege rutas como <code>/my-purchases</code> y <code>/admin</code>.
      Un guest es redirigido a sign-in. El rol admin vive en metadata de Clerk.</p>
    </div>
  `;
}

function init() {
  initProgress();
  renderRoles();
  renderRoutes();

  let rolesVisited = new Set(["guest"]);
  rolesEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".auth-role");
    if (btn) {
      rolesVisited.add(btn.dataset.role);
      if (rolesVisited.size >= 3 && !getGameProgress(GAME_ID).completed) {
        completeGame(GAME_ID);
        showModal({
          title: "¡Auth Gate completado!",
          body: "Probaste guest, user y admin en todas las rutas.",
          xp: 25,
          badge: { icon: "🔐", name: "Gate Keeper" },
        });
      }
    }
  });
}

init();
