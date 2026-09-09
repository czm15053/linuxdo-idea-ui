import { currentSkinId, setSkinId, SKINS, SKIN_ORDER, DEFAULT_SKIN_ID } from "../config/skins.js";
import { getViewMode, setViewMode } from "../state/view-state.js";
import { ICONS } from "../config/icons.js";

let menu = null;
let bound = false;

function close() {
  menu?.remove();
  menu = null;
}

export function toggleSkinMenu(anchor) {
  if (menu) { close(); return; }
  const el = document.createElement("div");
  el.className = "xim-skin-menu";
  el.innerHTML =
    `<button type="button" class="xim-skin-item${currentSkinId() === DEFAULT_SKIN_ID ? " active" : ""}" data-mode="default">
      <span>切回默认 · ${SKINS[DEFAULT_SKIN_ID].label}</span>${currentSkinId() === DEFAULT_SKIN_ID ? `<span class="ok">${ICONS.check}</span>` : ""}
    </button>
    <div class="xim-skin-sep"></div>` +
    SKIN_ORDER.map((id) =>
      `<button type="button" class="xim-skin-item${id === currentSkinId() ? " active" : ""}" data-skin="${id}">
        <span>${SKINS[id].label}</span>${id === currentSkinId() ? `<span class="ok">${ICONS.check}</span>` : ""}
      </button>`
    ).join("") +
    `<div class="xim-skin-sep"></div>` +
    `<button type="button" class="xim-skin-item" data-mode="native"><span>原版 X</span></button>`;
  el.addEventListener("click", (e) => {
    const def = e.target.closest("[data-mode='default']");
    if (def) {
      setSkinId(DEFAULT_SKIN_ID);
      close();
      location.reload();
      return;
    }
    const nat = e.target.closest("[data-mode='native']");
    if (nat) {
      setViewMode("native");
      close();
      location.reload();
      return;
    }
    const item = e.target.closest("[data-skin]");
    if (!item) return;
    setSkinId(item.dataset.skin);
    close();
    location.reload();
  });
  document.body.appendChild(el);
  const r = anchor.getBoundingClientRect();
  const w = el.offsetWidth || 160;
  const h = el.offsetHeight || 180;
  let left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8));
  let top = r.bottom + 6;
  if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 6);
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
  menu = el;
}

function onDocClick(e) {
  const btn = e.target.closest(".xim-skin-btn");
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    toggleSkinMenu(btn);
    return;
  }
  if (menu && !menu.contains(e.target)) close();
}

/** 文档级委托，列表重绘后按钮仍可用 */
export function bindSkinButtons() {
  if (bound) return;
  bound = true;
  document.addEventListener("click", onDocClick, true);
}

export function ensureNativeFab() {
  if (getViewMode() !== "native") {
    document.querySelector(".xim-fab")?.remove();
    return;
  }
  if (document.querySelector(".xim-fab")) return;
  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "xim-fab";
  // native 模式下样式表已被移除，必须内联，否则按钮没有样式不可见
  fab.style.cssText =
    "position:fixed;right:16px;bottom:16px;z-index:10001;" +
    "height:38px;padding:0 16px;border-radius:19px;border:none;" +
    "background:#1A87FF;color:#fff;font:700 14px/1 system-ui,sans-serif;" +
    "cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.22);display:flex;align-items:center;gap:6px;";
  fab.textContent = "⇄ 切回 IM";
  fab.title = "切回 IM 三合一界面";
  fab.addEventListener("click", () => {
    setViewMode("im");
    location.reload();
  });
  document.body.appendChild(fab);
}
