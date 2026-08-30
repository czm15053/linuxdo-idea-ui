import {
  RAIL_WIDTH, LIST_WIDTH,
  RAIL_W_MIN, RAIL_W_MAX, RAIL_W_COMPACT, LIST_W_MIN, LIST_W_MAX, SKIN_ID,
} from "../../config/skins.js";
import { RAIL_W_KEY, LIST_W_KEY } from "../../config/constants.js";
import { setRailCollapsed } from "../rail.js";

export function getRailWidth() {
  try {
    const w = parseInt(localStorage.getItem(RAIL_W_KEY), 10);
    if (w >= RAIL_W_MIN && w <= RAIL_W_MAX) return w;
  } catch { /* ignore */ }
  return RAIL_WIDTH;
}
export function applyRailWidth(w) {
  const width = Math.min(RAIL_W_MAX, Math.max(RAIL_W_MIN, Math.round(w)));
  document.documentElement.style.setProperty("--im-nav", `${width}px`);
  const rail = document.querySelector(".im-rail");
  if (rail) rail.classList.toggle("im-rail-compact", width < RAIL_W_COMPACT);
  window.dispatchEvent(new Event("im-layout-change")); // 嵌入编辑器几何跟随
}
export function ensureRailResizer() {
  let rz = document.querySelector(".im-rail-resizer");
  if (rz) return rz;
  rz = document.createElement("div");
  rz.className = "im-rail-resizer";
  rz.title = "拖动调整侧栏宽度（双击复位）";
  document.body.appendChild(rz);

  let dragging = false;
  let startX = 0;
  let startW = 0;
  rz.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    startW = parseInt(document.documentElement.style.getPropertyValue("--im-nav"), 10) || getRailWidth();
    rz.classList.add("dragging");
    try { rz.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    e.preventDefault();
  });
  rz.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const target = startW + e.clientX - startX;
    // wecom/feishu：拖到接近下限自动收成窄条大图标（折叠态宽度由 CSS 覆写，不再跟手）
    if (SKIN_ID === "wecom" || SKIN_ID === "feishu") setRailCollapsed(target < RAIL_W_MIN + 12);
    applyRailWidth(target);
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    rz.classList.remove("dragging");
    const w = parseInt(document.documentElement.style.getPropertyValue("--im-nav"), 10);
    if (w) {
      try { localStorage.setItem(RAIL_W_KEY, String(w)); } catch { /* ignore */ }
    }
  };
  rz.addEventListener("pointerup", endDrag);
  rz.addEventListener("pointercancel", endDrag);
  rz.addEventListener("dblclick", () => {
    applyRailWidth(RAIL_WIDTH);
    try { localStorage.removeItem(RAIL_W_KEY); } catch { /* ignore */ }
  });
  return rz;
}


export function getListWidth() {
  try {
    const w = parseInt(localStorage.getItem(LIST_W_KEY), 10);
    if (w >= LIST_W_MIN && w <= LIST_W_MAX) return w;
  } catch { /* ignore */ }
  return LIST_WIDTH;
}
export function applyListWidth(w) {
  const width = Math.min(LIST_W_MAX, Math.max(LIST_W_MIN, Math.round(w)));
  document.documentElement.style.setProperty("--im-list", `${width}px`);
  window.dispatchEvent(new Event("im-layout-change")); // 嵌入编辑器几何跟随
}
export function ensureListResizer() {
  let rz = document.querySelector(".im-list-resizer");
  if (rz) return rz;
  rz = document.createElement("div");
  rz.className = "im-list-resizer";
  rz.title = "拖动调整会话列表宽度（双击复位）";
  document.body.appendChild(rz);

  let dragging = false;
  let startX = 0;
  let startW = 0;
  rz.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    startW = parseInt(document.documentElement.style.getPropertyValue("--im-list"), 10) || getListWidth();
    rz.classList.add("dragging");
    try { rz.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    e.preventDefault();
  });
  rz.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    applyListWidth(startW + e.clientX - startX);
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    rz.classList.remove("dragging");
    const w = parseInt(document.documentElement.style.getPropertyValue("--im-list"), 10);
    if (w) {
      try { localStorage.setItem(LIST_W_KEY, String(w)); } catch { /* ignore */ }
    }
  };
  rz.addEventListener("pointerup", endDrag);
  rz.addEventListener("pointercancel", endDrag);
  rz.addEventListener("dblclick", () => {
    applyListWidth(LIST_WIDTH);
    try { localStorage.removeItem(LIST_W_KEY); } catch { /* ignore */ }
  });
  return rz;
}
