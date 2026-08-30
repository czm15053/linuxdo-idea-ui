// 飞书皮肤：最左 rail（搜索/导航/头像）+ 深色切换（顶部窄条为通知筛选，见 ui/notifications）
import { RAIL_DECO_ITEMS } from "../config/skins.js";
import { ICONS } from "../config/icons.js";
import { escapeHtml } from "../utils/html.js";
import { getCurrentUsername } from "../bridge/user.js";
import { listState } from "../state/list-state.js";
import {
  bindRailAvatarNotif, isNav2Open, setNav2Open,
  getUnreadNotificationCount, ensureRailFold,
} from "../ui/rail.js";
import { avatarColor, avatarLetter } from "../ui/shared/avatars.js";
import { bindSearchTrigger } from "../ui/search-popup.js";
import {
  getColorTheme, isDarkEffective, toggleColorTheme,
} from "../theme/color-mode.js";
import { skinHooks } from "./hooks.js";

/* ============================== 飞书皮肤专属 ============================== */
/* 飞书皮肤扩展图标（并入公共 ICONS） */
Object.assign(ICONS, {
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1L3 20l1.2-5.3A8.5 8.5 0 1 1 21 11.5z"/></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  worktable: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="7.5" cy="7.5" r="3.4"/><circle cx="16.5" cy="7.5" r="3.4"/><circle cx="7.5" cy="16.5" r="3.4"/><circle cx="16.5" cy="16.5" r="3.4"/></svg>`,
  cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.5 1.5A4 4 0 0 0 7 19z"/></svg>`,
  wiki: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>`,
  task: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>`,
  contacts: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>`,
  project: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>`
});
const FILLED_ICONS = {
  chat: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.7 2h2.6v3H6.7zM14.7 2h2.6v3h-2.6z"/><path d="M4 7c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v2H4V7z"/><path d="M4 11h16v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6z"/></svg>`,
  cloud: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`,
  wiki: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 2A2.5 2.5 0 0 0 4 4.5v15a2.5 2.5 0 0 1 2.5-2.5H21V2H6.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H21v5H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>`,
  task: `<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm3.66 6.34a1.15 1.15 0 0 1 0 1.63l-4.05 4.05c-.45.45-1.18.45-1.63 0l-2.14-2.14a1.15 1.15 0 0 1 1.63-1.63l1.32 1.32 3.24-3.24c.45-.45 1.18-.45 1.63 0z"/></svg>`,
  contacts: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zM12 14c4.6 0 8 2.35 8 5.4v.6a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20v-.6c0-3.05 3.4-5.4 8-5.4z"/></svg>`,
  more: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm10 0h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM5 13h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z"/><path d="M17 14v6M14 17h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
};
const navIcon = (key) => FILLED_ICONS[key] || ICONS[key];
function bindRailSearch(rail) {
  if (!rail) return;
  let wrap = rail.querySelector(".im-rail-search");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "im-rail-search";
    const head = rail.querySelector(".im-rail-head");
    if (head && head.nextSibling) rail.insertBefore(wrap, head.nextSibling);
    else rail.prepend(wrap);
  }
  // 旧版装饰块 / 缺 input 时升级为搜索入口
  if (!wrap.querySelector("input")) {
    wrap.innerHTML = `
      <form action="/search" method="get" role="search">
        ${ICONS.search}
        <input type="search" name="q" placeholder="搜索" autocomplete="off" enterkeyhint="search" aria-label="搜索">
      </form>`;
    delete rail.dataset.searchBound;
  }
  // 飞书同款：搜索框仅作入口（readonly），点击弹出全局搜索面板
  bindSearchTrigger(wrap);
}
export function ensureRailFeishu() {
  let rail = document.querySelector(".im-rail");
  if (rail) {
    bindRailSearch(rail);
    bindRailAvatarNotif(rail);
    skinHooks.darkToggle?.(rail);
    ensureRailFold(rail.querySelector(".im-rail-bottom")); // 宽条/窄条切换（与 dark 同挂 rail-bottom）
    syncRailFeishu();
    return rail;
  }
  rail = document.createElement("nav");
  rail.className = "im-rail";
  rail.setAttribute("aria-label", "飞书风导航");

  // 顶行：头像（hover 弹出原生通知，角标显示未读）+ 圆圈展开钮
  const head = document.createElement("div");
  head.className = "im-rail-head";
  const avatarWrap = document.createElement("div");
  avatarWrap.className = "im-rail-avatar-wrap";
  avatarWrap.innerHTML =
    `<div class="im-rail-avatar"></div>` +
    `<span class="im-rail-avatar-badge" style="display:none"></span>`;
  head.appendChild(avatarWrap);
  const toggle = document.createElement("button");
  toggle.className = "im-rail-toggle";
  toggle.title = "展开 / 收起大类";
  toggle.innerHTML = ICONS.menu;
  toggle.addEventListener("click", () => setNav2Open(!isNav2Open()));
  head.appendChild(toggle);
  rail.appendChild(head);

  // 最左栏真实搜索框（外观自绘，输入同步原生 welcome-banner）
  const search = document.createElement("div");
  search.className = "im-rail-search";
  search.innerHTML = `
    <form action="/search" method="get" role="search">
      ${ICONS.search}
      <input type="search" name="q" placeholder="搜索" autocomplete="off" enterkeyhint="search" aria-label="搜索">
    </form>`;
  rail.appendChild(search);

  // 文字导航（装饰；「消息」常驻 active 并带未读红点）
  const items = document.createElement("div");
  items.className = "im-rail-items";
  items.innerHTML =
    `<div class="im-rail-item active" data-rail-key="chat">${navIcon("chat")}<span>消息</span>` +
    `<span class="im-rail-badge" style="display:none"></span></div>` +
    RAIL_DECO_ITEMS.map((item) =>
      `<div class="im-rail-item">${navIcon(item.icon)}<span>${item.label}</span></div>`
    ).join("");
  rail.appendChild(items);

  document.body.appendChild(rail);
  bindRailSearch(rail);
  bindRailAvatarNotif(rail);
  skinHooks.darkToggle?.(rail);
  ensureRailFold(rail.querySelector(".im-rail-bottom")); // 宽条/窄条切换（与 dark 同挂 rail-bottom）
  syncRailFeishu();
  return rail;
}
function ensureRailAvatarWrap(rail) {
  if (!rail) return null;
  const head = rail.querySelector(".im-rail-head");
  if (!head) return null;
  let wrap = head.querySelector(".im-rail-avatar-wrap");
  let avatar = head.querySelector(".im-rail-avatar");
  if (!wrap && avatar) {
    wrap = document.createElement("div");
    wrap.className = "im-rail-avatar-wrap";
    avatar.replaceWith(wrap);
    wrap.appendChild(avatar);
  }
  if (wrap && !wrap.querySelector(".im-rail-avatar-badge")) {
    wrap.insertAdjacentHTML(
      "beforeend",
      `<span class="im-rail-avatar-badge" style="display:none"></span>`
    );
  }
  return wrap?.querySelector(".im-rail-avatar") || avatar;
}
export function syncRailFeishu() {
  const rail = document.querySelector(".im-rail");
  if (!rail) return;
  const avatarEl = ensureRailAvatarWrap(rail);
  if (!avatarEl) return;
  // 头像：取原生当前用户头像
  const img = document.querySelector("#current-user img");
  const name = getCurrentUsername();
  if (img && img.src) {
    if (avatarEl.dataset.bound !== img.src) {
      avatarEl.dataset.bound = img.src;
      avatarEl.innerHTML = `<img src="${escapeHtml(img.src)}" alt="">`;
      avatarEl.style.background = "transparent";
    }
  } else if (name && avatarEl.dataset.bound !== name) {
    avatarEl.dataset.bound = name;
    avatarEl.textContent = avatarLetter(name);
    avatarEl.style.background = avatarColor(name);
  }

  // 头像通知角标
  const notifCount = getUnreadNotificationCount();
  const avatarBadge = rail.querySelector(".im-rail-avatar-badge");
  if (avatarBadge) {
    avatarBadge.style.display = notifCount > 0 ? "" : "none";
    avatarBadge.textContent = notifCount > 99 ? "99+" : String(notifCount);
  }

  // 「消息」项未读（中栏话题求和）
  const unread = listState.topics.reduce((sum, t) => sum + (t.unread || 0) + (t.new_posts || 0), 0);
  const badge = rail.querySelector('[data-rail-key="chat"] .im-rail-badge');
  if (badge) {
    badge.style.display = unread > 0 ? "" : "none";
    badge.textContent = unread > 99 ? "99+" : String(unread);
  }
}
/* ---- 飞书：深色切换挂 rail 底部（带文字） ---- */
export function ensureDarkModeToggleFeishu(rail) {
  if (!rail) return;
  let bottom = rail.querySelector(".im-rail-bottom");
  if (!bottom) {
    bottom = document.createElement("div");
    bottom.className = "im-rail-bottom";
    rail.appendChild(bottom);
  }
  let btn = bottom.querySelector(".im-dark-toggle");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "im-rail-item im-dark-toggle";
    bottom.appendChild(btn);
  }
  if (btn.dataset.bound !== "1") {
    btn.dataset.bound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleColorTheme();
    });
  }
  syncDarkModeToggleFeishu();
}

export function syncDarkModeToggleFeishu() {
  const btn = document.querySelector(".im-dark-toggle");
  if (!btn) return;
  const mode = getColorTheme();
  const dark = isDarkEffective();
  const label = mode === "auto" ? `跟随系统(${dark ? "深" : "浅"})` : dark ? "深色" : "浅色";
  btn.title = `${label}（点击切换）`;
  btn.setAttribute("aria-pressed", dark ? "true" : "false");
  btn.classList.toggle("is-on", dark);
  btn.innerHTML = `${dark ? ICONS.sun : ICONS.moon}<span>${dark ? "浅色" : "深色"}</span>`;
}
