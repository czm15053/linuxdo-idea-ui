// 原生视图右下角「切回 IM」悬浮按钮
import { ICONS } from "../config/icons.js";
import { getViewMode, setViewMode } from "../state/view-state.js";
import { cfBlocked } from "../bridge/cf-guard.js";

const FAB_ID = "im-mode-fab-btn";

export function ensureModeFab() {
  let fab = document.getElementById(FAB_ID) || document.querySelector(".im-mode-fab");
  // 仅在原生视图模式且非 CF 挑战页下呈现
  if (getViewMode() !== "native" || cfBlocked()) {
    fab?.remove();
    return;
  }
  if (fab && fab.isConnected) return;
  const container = document.body || document.documentElement;
  if (!container) return;

  if (!fab) {
    fab = document.createElement("button");
    fab.id = FAB_ID;
    fab.className = "im-mode-fab";
    fab.type = "button";
    fab.title = "切回 IM 视图";
    fab.setAttribute("aria-label", "切回 IM 视图");
    // 独立内联样式：无论外层主题样式表是否卸载，原生视图下始终保证可见、可点且固定在右下角
    fab.style.cssText = `
      position: fixed !important;
      right: 24px !important;
      bottom: 24px !important;
      z-index: 999999 !important;
      width: 46px !important;
      height: 46px !important;
      border-radius: 50% !important;
      background: #3370ff !important;
      color: #ffffff !important;
      border: none !important;
      outline: none !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 4px 16px rgba(51, 112, 255, 0.45) !important;
      padding: 0 !important;
      margin: 0 !important;
      transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease !important;
    `;
    fab.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;pointer-events:none;">${ICONS.chat}</span>`;

    fab.addEventListener("mouseenter", () => {
      fab.style.transform = "scale(1.08)";
      fab.style.boxShadow = "0 6px 20px rgba(51, 112, 255, 0.55)";
    });
    fab.addEventListener("mouseleave", () => {
      fab.style.transform = "scale(1)";
      fab.style.boxShadow = "0 4px 16px rgba(51, 112, 255, 0.45)";
    });

    fab.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setViewMode("im");
      location.reload();
    });
  }

  container.appendChild(fab);
}
