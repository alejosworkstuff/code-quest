import { initProgress, completeGame, getGameProgress } from "../progress.js";
import { showModal, showToast, escapeHtml } from "../ui.js";
import { playStep, playError } from "../sounds.js";

const GAME_ID = "request-tracer";

const NODES = [
  {
    id: "ui",
    label: "Browser UI",
    code: `// CartContext en React
const { items } = useCart();
// 2 items en el carrito local`,
    detail: "El carrito vive en React Context + localStorage. El usuario ve 2 productos.",
  },
  {
    id: "api",
    label: "POST /api/orders",
    code: `// Route handler Next.js
const total = computeOrderTotal(items);
if (body.total !== total) return 400;`,
    detail: "El servidor recalcula el total. Nunca confía en el cliente.",
  },
  {
    id: "redis",
    label: "Redis / Map",
    code: `// redis.ts
await redis.set(
  \`orders:\${userId}\`, JSON.stringify(order)
);`,
    detail: "Pedido persistido en Redis (o Map en local). Compartido entre instancias serverless.",
  },
  {
    id: "response",
    label: "Success UI",
    code: `// Redirect a /checkout/success
router.push('/checkout/success');`,
    detail: "UI muestra confirmación. WebSocket puede notificar cambio de estado.",
  },
];

const CORRECT_ORDER = ["ui", "api", "redis", "response"];
let visited = [];
let currentStep = 0;

const diagramEl = document.getElementById("tracer-diagram");
const detailEl = document.getElementById("tracer-detail");
const missionEl = document.getElementById("tracer-mission");

function renderDiagram() {
  diagramEl.innerHTML = NODES.map((node, i) => {
    const visitedCls = visited.includes(node.id) ? " tracer-node--visited" : "";
    const activeCls = visited[visited.length - 1] === node.id ? " tracer-node--active" : "";
    const arrow = i < NODES.length - 1 ? '<span class="tracer-arrow">→</span>' : "";
    return `
      <button type="button" class="tracer-node${visitedCls}${activeCls}" data-id="${node.id}">
        ${node.label}
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
    showToast(`Todavía no — primero pasa por ${NODES.find((n) => n.id === expected)?.label}`, "error");
    return;
  }

  if (!visited.includes(id)) visited.push(id);
  currentStep += 1;
  playStep();

  detailEl.innerHTML = `
    <h3>${escapeHtml(node.label)}</h3>
    <p>${escapeHtml(node.detail)}</p>
    <div class="code-preview">${escapeHtml(node.code)}</div>
  `;

  renderDiagram();

  if (currentStep >= CORRECT_ORDER.length) {
    if (!getGameProgress(GAME_ID).completed) {
      completeGame(GAME_ID);
      showModal({
        title: "¡Request Tracer completado!",
        body: "Trazaste checkout: UI → API → Redis → Success.",
        xp: 25,
        badge: { icon: "📡", name: "Trace Hunter" },
      });
    }
    missionEl.textContent = "✓ Misión completada — el flujo de checkout está trazado.";
  }
}

function init() {
  initProgress();
  missionEl.textContent = "Misión: El carrito tiene 2 items. Trazá qué pasa al hacer checkout — click en orden.";
  renderDiagram();
  detailEl.innerHTML = `<p style="color:var(--muted)">Click en el primer nodo del flujo...</p>`;
}

init();
