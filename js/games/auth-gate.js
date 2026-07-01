import { initProgress, completeGame, getGameProgress } from "../progress.js";
import { showModal } from "../ui.js";
import { t } from "../i18n.js";

const GAME_ID = "auth-gate";

const ROLES = {
  guest: { id: "guest" },
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

function roleLabel(role) {
  if (role.id === "guest") return t("authGate.guest");
  return role.label;
}

function canAccess(route, role) {
  if (route.public) return true;
  return route.roles?.includes(role);
}

function renderRoles() {
  rolesEl.innerHTML = Object.values(ROLES)
    .map(
      (r) =>
        `<button type="button" class="auth-role ${r.id === activeRole ? "auth-role--active" : ""}" data-role="${r.id}">${roleLabel(r)}</button>`
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
        <span class="auth-route__status">${allowed ? t("authGate.allowed") : t("authGate.denied")}</span>
      </div>
    `;
  }).join("");

  explainEl.innerHTML = `
    <div class="feedback-box">
      <p>${t("authGate.explain")}</p>
    </div>
  `;
}

function render() {
  renderRoles();
  renderRoutes();
}

function init() {
  initProgress();
  render();

  let rolesVisited = new Set(["guest"]);
  rolesEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".auth-role");
    if (btn) {
      rolesVisited.add(btn.dataset.role);
      if (rolesVisited.size >= 3 && !getGameProgress(GAME_ID).completed) {
        completeGame(GAME_ID);
        showModal({
          title: t("authGate.doneTitle"),
          body: t("authGate.doneBody"),
          xp: 25,
          badge: { icon: "🔐", name: "Gate Keeper" },
        });
      }
    }
  });
}

init();
window.addEventListener("code-quest:lang-change", () => render());
