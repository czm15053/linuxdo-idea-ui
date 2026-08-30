// 原生视图右下角「切回 IM」悬浮按钮
import { ICONS } from "../config/icons.js";
import { getViewMode, setViewMode } from "../state/view-state.js";

export function ensureModeFab() {
  let fab = document.querySelector(".im-mode-fab");
  if (getViewMode() !== "native") {
    fab?.remove();
    return;
  }
  if (fab) return;
  fab = document.createElement("button");
  fab.className = "im-mode-fab";
  fab.title = "切回 IM 视图";
  fab.innerHTML = ICONS.chat;
  fab.addEventListener("click", () => {
    setViewMode("im");
    location.reload();
  });
  document.body.appendChild(fab);
}
