import { getLang, setLang, t, applyPage, onLangChange } from "./i18n.js";
import { resetProgress } from "./progress.js";

let modalOpen = false;

function ensureSettingsButton() {
  const header = document.querySelector(".site-header, .game-header");
  if (!header || header.querySelector(".settings-trigger")) return;

  const wrap = header.classList.contains("game-header")
    ? header.querySelector(".game-meta") || header
    : header;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-ghost btn-sm settings-trigger";
  btn.setAttribute("aria-label", t("nav.settings"));
  btn.textContent = "⚙️";
  btn.addEventListener("click", openSettingsModal);

  if (wrap.classList.contains("game-meta")) {
    wrap.prepend(btn);
  } else {
    const portfolio = wrap.querySelector('a[href*="portfolio"]');
    if (portfolio) portfolio.insertAdjacentElement("afterend", btn);
    else wrap.appendChild(btn);
  }
}

function closeModal(overlay) {
  modalOpen = false;
  overlay.remove();
}

export function openSettingsModal() {
  if (modalOpen) return;
  modalOpen = true;

  const lang = getLang();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay settings-overlay";
  overlay.innerHTML = `
    <div class="modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <h2 id="settings-title">${t("settings.title")}</h2>
      <div class="settings-section">
        <p class="settings-label">${t("settings.language")}</p>
        <div class="lang-toggle" role="radiogroup" aria-label="${t("settings.language")}">
          <button type="button" class="lang-toggle__btn ${lang === "en" ? "lang-toggle__btn--active" : ""}" data-lang="en">${t("settings.langEn")}</button>
          <button type="button" class="lang-toggle__btn ${lang === "es" ? "lang-toggle__btn--active" : ""}" data-lang="es">${t("settings.langEs")}</button>
        </div>
      </div>
      <p class="settings-note">${t("settings.progressNote")}</p>
      <p class="settings-note">${t("settings.soundNote")}</p>
      <div class="settings-actions">
        <button type="button" class="btn btn-ghost btn-sm" id="settings-reset">${t("settings.reset")}</button>
        <button type="button" class="btn btn-hero btn-sm" id="settings-close">${t("settings.close")}</button>
      </div>
    </div>
  `;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal(overlay);
  });

  overlay.querySelector("#settings-close").addEventListener("click", () => closeModal(overlay));

  overlay.querySelectorAll(".lang-toggle__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.lang === getLang()) return;
      setLang(btn.dataset.lang);
      closeModal(overlay);
      applyPage();
      window.dispatchEvent(new CustomEvent("code-quest:lang-change"));
    });
  });

  overlay.querySelector("#settings-reset").addEventListener("click", () => {
    if (confirm(t("settings.resetConfirm"))) {
      resetProgress();
      location.reload();
    }
  });

  document.body.appendChild(overlay);
}

export function initSettings() {
  ensureSettingsButton();
  applyPage();

  onLangChange(() => {
    ensureSettingsButton();
    document.querySelectorAll(".settings-trigger").forEach((btn) => {
      btn.setAttribute("aria-label", t("nav.settings"));
    });
  });
}

initSettings();
