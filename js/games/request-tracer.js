import { initProgress, completeGame, getGameProgress } from "../progress.js";
import { showModal, showToast, escapeHtml } from "../ui.js";
import { playStep, playError } from "../sounds.js";
import { t } from "../i18n.js";

const GAME_ID = "request-tracer";

const NODES = [
  {
    id: "ui",
    code: `// CartContext en React
const { items } = useCart();
// 2 items en el carrito local`,
  },
  {
    id: "api",
    code: `// Route handler Next.js
const total = computeOrderTotal(items);
if (body.total !== total) return 400;`,
  },
  {
    id: "redis",
    code: `// redis.ts
await redis.set(
  \`orders:\${userId}\`, JSON.stringify(order)
);`,
  },
  {
    id: "response",
    code: `// Redirect a /checkout/success
router.push('/checkout/success');`,
  },
];

const CORRECT_ORDER = ["ui", "api", "redis", "response"];
let visited = [];
let currentStep = 0;

const diagramEl = document.getElementById("tracer-diagram");
const detailEl = document.getElementById("tracer-detail");
const missionEl = document.getElementById("tracer-mission");

function nodeLabel(id) {
  return t(`requestTracer.nodes.${id}.label`);
}

function nodeDetail(id) {
  return t(`requestTracer.nodes.${id}.detail`);
}

function renderMission() {
  if (currentStep >= CORRECT_ORDER.length) {
    missionEl.textContent = t("requestTracer.missionDone");
  } else {
    missionEl.textContent = t("requestTracer.mission");
  }
}

function renderDetail() {
  if (currentStep === 0 && visited.length === 0) {
    detailEl.innerHTML = `<p style="color:var(--muted)">${t("requestTracer.clickFirst")}</p>`;
    return;
  }
  const lastId = visited[visited.length - 1];
  const node = NODES.find((n) => n.id === lastId);
  if (!node) return;
  detailEl.innerHTML = `
    <h3>${escapeHtml(nodeLabel(node.id))}</h3>
    <p>${escapeHtml(nodeDetail(node.id))}</p>
    <div class="code-preview">${escapeHtml(node.code)}</div>
  `;
}

function renderDiagram() {
  diagramEl.innerHTML = NODES.map((node, i) => {
    const visitedCls = visited.includes(node.id) ? " tracer-node--visited" : "";
    const activeCls = visited[visited.length - 1] === node.id ? " tracer-node--active" : "";
    const arrow = i < NODES.length - 1 ? '<span class="tracer-arrow">→</span>' : "";
    return `
      <button type="button" class="tracer-node${visitedCls}${activeCls}" data-id="${node.id}">
        ${nodeLabel(node.id)}
      </button>
      ${arrow}
    `;
  }).join("");

  diagramEl.querySelectorAll(".tracer-node").forEach((btn) => {
    btn.addEventListener("click", () => selectNode(btn.dataset.id));
  });
}

function selectNode(id) {
  const expected = CORRECT_ORDER[currentStep];
  const node = NODES.find((n) => n.id === id);

  if (id !== expected) {
    playError();
    showToast(t("requestTracer.wrongOrder", { label: nodeLabel(expected) }), "error");
    return;
  }

  if (!visited.includes(id)) visited.push(id);
  currentStep += 1;
  playStep();

  renderDetail();
  renderDiagram();
  renderMission();

  if (currentStep >= CORRECT_ORDER.length) {
    if (!getGameProgress(GAME_ID).completed) {
      completeGame(GAME_ID);
      showModal({
        title: t("requestTracer.doneTitle"),
        body: t("requestTracer.doneBody"),
        xp: 25,
        badge: { icon: "📡", name: "Trace Hunter" },
      });
    }
  }
}

function render() {
  renderMission();
  renderDiagram();
  renderDetail();
}

function init() {
  initProgress();
  render();
}

init();
window.addEventListener("code-quest:lang-change", () => render());
