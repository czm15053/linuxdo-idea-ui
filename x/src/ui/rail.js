import { ICONS, getSkinIcon } from "../config/icons.js";
import { currentSkinId, SKINS, getOrgName, setOrgName } from "../config/skins.js";
import { nativeAvatarSrc, nativeProfilePath, nativeDisplayName, navigateX, openSearch, badgeCount } from "../bridge/x-dom.js";
import { routeKind } from "../bridge/router.js";
import { isDarkEffective, toggleColorTheme } from "../theme/color-mode.js";
import { escapeHtml } from "../utils/html.js";
import { toast } from "./toast.js";
import { personAvatarHtml } from "./avatars.js";

function railIcon(key) {
  return getSkinIcon(key);
}

function itemHtml(it, active) {
  const icon = railIcon(it.icon);
  return `<div class="im-rail-item${active ? " active" : ""}" data-key="${it.key}" data-path="${it.path || ""}" role="button" tabindex="0">
    ${icon}<span>${it.label}</span>
    ${it.dot ? '<i class="im-rail-dot"></i>' : ""}
    <span class="im-rail-badge" hidden></span>
  </div>`;
}

function activeKey() {
  const k = routeKind();
  if (k === "home" || k === "profile" || k === "status") return "home";
  if (k === "notify") return "notify";
  if (k === "msg") return "msg";
  if (k === "bookmark") return "bookmark";
  if (k === "explore") return "explore";
  return "home";
}

export function ensureRail() {
  const skin = SKINS[currentSkinId()];
  let rail = document.querySelector(".im-rail");
  if (!rail) {
    rail = document.createElement("nav");
    rail.className = "im-rail";
    rail.setAttribute("aria-label", "IM 导航");
    (document.body || document.documentElement).appendChild(rail);
  }
  rail.classList.toggle("im-rail-compact", !!skin.compact);
  const src = nativeAvatarSrc();
  const uname = nativeDisplayName();
  const org = getOrgName();
  const on = activeKey();

  const meHeadAva = personAvatarHtml("im-rail-me-ava", uname, src, "me", true);
  const head = skin.groups
    ? `<div class="im-rail-head">
        <span class="im-rail-me">${meHeadAva}<span class="im-rail-avatar-badge" hidden></span></span>
        <span class="im-rail-user-name">${escapeHtml(uname)}</span>
      </div>`
    : currentSkinId() === "feishu"
    ? `<div class="im-rail-head">
        <div class="im-rail-avatar-wrap">
          <div class="im-rail-avatar">${meHeadAva}</div>
          <span class="im-rail-avatar-badge" hidden></span>
        </div>
      </div>
      <div class="im-rail-search"><form action="/search" role="search">${ICONS.search}<input type="search" placeholder="搜索" autocomplete="off"></form></div>`
    : `<div class="im-rail-head">
        <div class="im-rail-org-chip" title="点击修改团队名称">
          <span class="im-rail-org-logo">${escapeHtml(skin.letter)}</span>
          <span class="im-rail-org-name">${escapeHtml(org)}</span>
        </div>
      </div>`;

  const real = skin.real.map((it) => itemHtml(it, it.key === on)).join("");
  const deco = skin.deco.map((it) => itemHtml(it, false)).join("");
  const groups = skin.groups
    ? `<div class="im-rail-groups"><div class="im-rail-group-title"><span>分组</span></div>
        ${[["unread","未读","mail"],["at","@我","at"],["single","单聊","user"],["group","群聊","msg"],["marked","标记","bookmark"]].map(([k,l,i]) =>
          `<div class="im-rail-item" data-group="${k}" role="button">${ICONS[i] || ICONS.msg}<span>${l}</span></div>`
        ).join("")}
      </div>`
    : "";

  // 我的主页：rail 底部头像入口（钉钉/企微/飞书都有），头部位（飞书头像/企微 me-chip）也可点
  const meAvatar = nativeAvatarSrc();
  const meItem = `<div class="im-rail-item im-me-btn" role="button" title="我的主页">${
    personAvatarHtml("im-rail-me-img", uname, meAvatar, "me", true)
  }<span>我的</span></div>`;

  const bottomActions = skin.actions === "rail-bottom"
    ? `<div class="im-rail-item im-dark-toggle" role="button">${isDarkEffective() ? ICONS.sun : ICONS.moon}<span>${isDarkEffective() ? "浅色" : "深色"}</span></div>
       <div class="im-rail-item xim-skin-btn" role="button">${ICONS.swap}<span>切换外观</span></div>`
    : "";

  rail.innerHTML = `${head}<div class="im-rail-items">${real}${deco}${groups}</div>
    <div class="im-rail-bottom">${meItem}${bottomActions}<div class="im-rail-item" data-key="more" role="button">${ICONS.more}<span>更多</span></div></div>`;

  rail.querySelector(".im-rail-org-chip")?.addEventListener("click", () => {
    const v = window.prompt("团队名称", getOrgName());
    if (v == null) return;
    setOrgName(v.trim() || skin.orgName);
    ensureRail();
  });
  // 头部位当前用户头像（飞书/企微）点击进自己主页
  rail.querySelector(".im-rail-me")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const p = nativeProfilePath();
    if (p) navigateX(p);
  });
  rail.querySelector(".im-rail-avatar")?.addEventListener("click", () => {
    const p = nativeProfilePath();
    if (p) navigateX(p);
  });
  rail.querySelector(".im-rail-search")?.addEventListener("submit", (e) => {
    e.preventDefault();
    openSearch(rail.querySelector("input").value);
  });
  rail.querySelector(".im-dark-toggle")?.addEventListener("click", () => toggleColorTheme());
  if (rail.dataset.bound !== "1") {
    rail.dataset.bound = "1";
    rail.addEventListener("click", (e) => {
      const btn = e.target.closest(".im-rail-item");
      if (!btn || !rail.contains(btn)) return;
      if (btn.classList.contains("im-dark-toggle") || btn.classList.contains("xim-skin-btn")) return;
      if (btn.classList.contains("im-me-btn")) {
        // 动态读取：首次渲染时 X DOM 可能还没就绪，mePath 会随解析更新
        const p = nativeProfilePath();
        if (p) navigateX(p);
        else toast("未找到个人主页，稍后重试");
        return;
      }
      const path = btn.dataset.path;
      if (path) { navigateX(path); return; }
      toast("装饰按钮");
    });
  }

  refreshMe(rail);

  const nNotif = badgeCount("/notifications");
  const nMsg = badgeCount("/messages");
  setBadge(rail, "notify", nNotif);
  setBadge(rail, "msg", nMsg);
  const ab = rail.querySelector(".im-rail-avatar-badge");
  if (ab) {
    ab.hidden = nNotif <= 0;
    ab.textContent = nNotif > 99 ? "99+" : String(nNotif);
  }
  return rail;
}

function setBadge(rail, key, n) {
  const b = rail.querySelector(`[data-key="${key}"] .im-rail-badge`);
  if (!b) return;
  b.hidden = n <= 0;
  b.textContent = n > 99 ? "99+" : String(n);
}

export function highlightRail() {
  const on = activeKey();
  document.querySelectorAll(".im-rail-item[data-key]").forEach((b) => {
    b.classList.toggle("active", b.dataset.key === on);
  });
}

/** 轻量刷新 rail 上的「我」头像：DOM 变化节流里反复调用，只在头像真变了才重写（不动整棵 rail） */
export function refreshMe(rail) {
  rail = rail || document.querySelector(".im-rail");
  if (!rail) return;
  const uname = nativeDisplayName();
  const src = nativeAvatarSrc();
  rail.querySelectorAll(".im-rail-me-ava, .im-rail-me-img").forEach((el) => {
    const cls = el.classList[0] || "im-rail-me-ava";
    const next = personAvatarHtml(cls, uname, src, "me", true);
    if ((el.getAttribute("data-xim-me") || "") !== next) {
      el.setAttribute("data-xim-me", next);
      el.innerHTML = next;
    }
  });
}
