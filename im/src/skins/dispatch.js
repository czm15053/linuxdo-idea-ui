// 皮肤分派层：按 SKIN_ID 把 rail/strip/深色切换/皮肤切换路由到各皮肤实现
import { SKIN_ID, SKINS, SKIN_KEY, otherThemeActive } from "../config/skins.js";
import {
  ensureRailDingtalk, syncRailDingtalk,
} from "../ui/rail.js";
import { ensureStripDingtalk } from "../ui/strip.js";
import { ensureNotifStrip } from "../ui/notifications.js";
import { getViewMode, setViewMode } from "../state/view-state.js";
import {
  ensureRailFeishu, syncRailFeishu,
  ensureDarkModeToggleFeishu, syncDarkModeToggleFeishu,
} from "./feishu-frame.js";
import { ensureDarkModeToggleDingtalk, syncDarkModeToggleDingtalk } from "./dingtalk.js";
import { ensureDarkModeToggleWecom } from "./wecom.js";
import { skinHooks } from "./hooks.js";

/* ============================== 皮肤分派 ============================== */

export function ensureRail() {
  if (SKIN_ID === "feishu") return ensureRailFeishu();
  return ensureRailDingtalk();
}
export function syncRail() {
  if (SKIN_ID === "feishu") return syncRailFeishu();
  return syncRailDingtalk();
}
export function ensureStrip() {
  // 钉钉/飞书窄条 = 通知类型筛选条（ui/notifications）；企微无窄条，移除残留
  if (SKIN_ID === "wecom") return ensureStripDingtalk();
  return ensureNotifStrip();
}
export function ensureDarkModeToggle(mount) {
  if (SKIN_ID === "feishu") return ensureDarkModeToggleFeishu(mount);
  if (SKIN_ID === "wecom") return ensureDarkModeToggleWecom(mount);
  return ensureDarkModeToggleDingtalk(mount);
}
export function syncDarkModeToggle() {
  if (SKIN_ID === "feishu") return syncDarkModeToggleFeishu();
  return syncDarkModeToggleDingtalk();
}

/* ============================== 皮肤切换按钮 ============================== */

const SKIN_ORDER = ["dingtalk", "feishu", "wecom"];
const SKIN_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h11M4 7l3-3M4 7l3 3"/><path d="M20 17H9M20 17l-3-3M20 17l-3 3"/></svg>`;
const SKIN_CHECK = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>`;

export function ensureSkinToggle() {
  if (getViewMode() !== "im" || otherThemeActive()) return;
  const host = SKIN_ID === "dingtalk"
    ? document.querySelector(".im-titlebar .title-actions")
    : document.querySelector(".im-list-actions");
  if (!host) return;
  let btn = host.querySelector(".im-skin-toggle");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = (SKIN_ID === "dingtalk" ? "t-btn" : "im-icon-btn") + " im-skin-toggle";
    btn.title = "切换外观";
    btn.innerHTML = SKIN_ICON;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSkinMenu(btn);
    });
    host.appendChild(btn);
  }
}

/* 皮肤切换下拉：点击按钮弹出主题列表，选择后换肤重载 */
let skinMenuEl = null;
function closeSkinMenu() {
  skinMenuEl?.remove();
  skinMenuEl = null;
  document.removeEventListener("click", onSkinMenuOutside, true);
  document.removeEventListener("keydown", onSkinMenuKey, true);
}
function onSkinMenuOutside(e) {
  if (skinMenuEl && !skinMenuEl.contains(e.target)) closeSkinMenu();
}
function onSkinMenuKey(e) {
  if (e.key === "Escape") closeSkinMenu();
}
function toggleSkinMenu(anchor) {
  if (skinMenuEl) {
    closeSkinMenu();
    return;
  }
  const menu = document.createElement("div");
  menu.className = "im-skin-menu";
  menu.innerHTML =
    SKIN_ORDER.map(
      (id) =>
        `<button type="button" class="im-skin-item${id === SKIN_ID ? " active" : ""}" data-skin="${id}"><span>${SKINS[id].label}</span>${id === SKIN_ID ? `<span class="ok">${SKIN_CHECK}</span>` : ""}</button>`
    ).join("") +
    // 原版皮肤 = 退回 linux.do 原生界面（右下角悬浮球可切回 IM）
    `<div class="im-skin-sep"></div>` +
    `<button type="button" class="im-skin-item" data-mode="native"><span>原版皮肤</span></button>`;
  menu.addEventListener("click", (e) => {
    const modeItem = e.target.closest("[data-mode='native']");
    if (modeItem) {
      e.preventDefault();
      setViewMode("native");
      location.reload();
      return;
    }
    const item = e.target.closest("[data-skin]");
    if (!item) return;
    e.preventDefault();
    try { localStorage.setItem(SKIN_KEY, item.dataset.skin); } catch { /* ignore */ }
    location.reload();
  });
  document.body.appendChild(menu);
  const r = anchor.getBoundingClientRect();
  const mw = menu.offsetWidth;
  const mh = menu.offsetHeight;
  let left = Math.max(8, Math.min(r.right - mw, innerWidth - mw - 8));
  let top = r.bottom + 6;
  if (top + mh > innerHeight - 8) top = Math.max(8, r.top - mh - 6);
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  skinMenuEl = menu;
  setTimeout(() => {
    document.addEventListener("click", onSkinMenuOutside, true);
    document.addEventListener("keydown", onSkinMenuKey, true);
  }, 0);
}

// titlebar 挂深色按钮经 skinHooks（ui → skins 单向）
skinHooks.darkToggle = ensureDarkModeToggle;
