import { ICONS, getSkinIcon } from "../config/icons.js";
import { currentSkinId, SKINS, getOrgName, setOrgName } from "../config/skins.js";
import { nativeAvatarSrc, nativeProfilePath, nativeDisplayName, navigateX } from "../bridge/x-dom.js";
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
  return "explore";
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
      </div>`
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

  const bottomActions = skin.actions === "rail-bottom"
    ? `<div class="im-rail-item im-dark-toggle" role="button">${isDarkEffective() ? ICONS.sun : ICONS.moon}<span>${isDarkEffective() ? "浅色" : "深色"}</span></div>
       <div class="im-rail-item xim-skin-btn" role="button">${ICONS.swap}<span>切换外观</span></div>`
    : "";

  rail.innerHTML = `${head}<div class="im-rail-items">${real}${deco}${groups}</div>
    <div class="im-rail-bottom">${bottomActions}<div class="im-rail-item" data-key="more" role="button">${ICONS.more}<span>更多</span></div></div>`;

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
  rail.querySelector(".im-dark-toggle")?.addEventListener("click", () => toggleColorTheme());
  if (rail.dataset.bound !== "1") {
    rail.dataset.bound = "1";
    rail.addEventListener("click", (e) => {
      const btn = e.target.closest(".im-rail-item");
      if (!btn || !rail.contains(btn)) return;
      if (btn.classList.contains("im-dark-toggle") || btn.classList.contains("xim-skin-btn")) return;
      const path = btn.dataset.path;
      if (path) {
        navigateX(path);
        return;
      }
      toast("装饰按钮");
    });
  }

  refreshMe(rail);
  return rail;
}

export function highlightRail() {
  const on = activeKey();
  document.querySelectorAll(".im-rail-item[data-key]").forEach((b) => {
    b.classList.toggle("active", b.dataset.key === on);
  });
}

/** 轻量刷新 rail 上的头像：DOM 变化节流里反复调用，只在头像真变了才重写（针对宿主容器更新，避免内部无限递归嵌套） */
export function refreshMe(rail) {
  rail = rail || document.querySelector(".im-rail");
  if (!rail) return;
  const uname = nativeDisplayName();
  const src = nativeAvatarSrc();

  // 头顶部位当前头像容器（飞书 avatar-wrap / 钉钉 me-ava）
  const headWrap = rail.querySelector(".im-rail-avatar, .im-rail-me");
  if (headWrap) {
    const next = personAvatarHtml("im-rail-me-ava", uname, src, "me", true);
    if (headWrap.dataset.ximMeSig !== next) {
      headWrap.dataset.ximMeSig = next;
      const old = headWrap.querySelector(".im-rail-me-ava");
      if (old) {
        const temp = document.createElement("div");
        temp.innerHTML = next;
        if (temp.firstElementChild) old.replaceWith(temp.firstElementChild);
      } else {
        headWrap.insertAdjacentHTML("afterbegin", next);
      }
    }
  }
}
