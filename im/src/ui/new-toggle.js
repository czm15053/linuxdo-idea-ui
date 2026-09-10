// /new（新）列表顶部的「所有 / 话题 / 回复」筛选条（DISCOURSE-NEW-TOGGLE）。
// 吸附 linux.do 原生 /new 页的同名组件：计数文本从原生 DOM 读取，
// 点击切换对应路由（/new, /new?subset=topics, /new?subset=replies）并请求相应接口。

import { navigateInApp } from "../bridge/router.js";

const WRAPPER_SEL = ".topic-replies-toggle-wrapper";

let localMod = null;

function isNewRoute() {
  return location.pathname.replace(/\/+$/, "") === "/new";
}

/** 原生三个按钮按 modifier 类取：--all / --topics / --replies 或类名中包含 all/topics/replies */
function nativeButton(mod) {
  try {
    return (
      document.querySelector(`${WRAPPER_SEL} .topics-replies-toggle.--${mod}`) ||
      document.querySelector(`${WRAPPER_SEL} .topics-replies-toggle.${mod}`)
    );
  } catch { return null; }
}

/** 从原生按钮文本提取计数：(159) / （177）；无括号则回退内容里的数字；否则 0 */
function countOf(el) {
  if (!el) return 0;
  const text = (el.textContent || "").replace(/\s+/g, " ").trim();
  const m = text.match(/[（(]\s*(\d+)\s*[）)]/);
  if (m) return Number(m[1]);
  const n = parseInt(text.replace(/[^\d]/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

/** 当前原生选中态（--all/--topics/--replies 谁 active） */
export function nativeActiveMod() {
  const wrapper = document.querySelector(WRAPPER_SEL);
  if (!wrapper) return "all";
  for (const mod of ["topics", "replies", "all"]) {
    const btn =
      wrapper.querySelector(`.topics-replies-toggle.--${mod}`) ||
      wrapper.querySelector(`.topics-replies-toggle.${mod}`);
    if (btn && btn.classList.contains("active")) return mod;
  }
  return "all";
}

/** 当前激活的 mod，优先以 URL 中的 subset 参数为准 */
export function currentActiveMod() {
  if (!isNewRoute()) return "all";
  const params = new URLSearchParams(location.search);
  const subset = params.get("subset");
  if (subset === "topics" || subset === "replies") return subset;
  if (subset === "all") return "all";
  if (localMod) return localMod;
  return nativeActiveMod() || "all";
}

function targetUrlForMod(mod) {
  if (mod === "topics") return "/new?subset=topics";
  if (mod === "replies") return "/new?subset=replies";
  return "/new";
}

export function targetApiForMod(mod) {
  if (mod === "topics") return "/new.json?subset=topics";
  if (mod === "replies") return "/new.json?subset=replies";
  return "/new.json";
}

function buttonHtml(mod, label, count, active) {
  const title = {
    all: "所有新话题和过去几天回复的话题",
    topics: "新话题",
    replies: "新回复"
  }[mod] || "";
  return `<button type="button" class="im-new-toggle-btn --${mod}${active ? " active" : ""}" data-mod="${mod}" title="${title}">${label}${count ? ` <span class="n">${count}</span>` : ""}</button>`;
}

/**
 * 状态同步：按当前路由同步「所有/话题/回复」筛选条。
 * onRefresh：点击切换后重拉当前列表。
 * 幂等：非 /new 路由时隐藏筛选条。
 */
export function syncNewToggle(panel, onRefresh) {
  if (!panel) return;
  let row = panel.querySelector(".im-new-toggle");
  const show = isNewRoute();

  if (!show) {
    localMod = null;
    if (row) row.style.display = "none";
    return;
  }

  if (!row) {
    row = document.createElement("div");
    row.className = "im-new-toggle";
    panel.querySelector(".im-list-header")?.after(row);
  }

  if (row.dataset.bound !== "1") {
    row.dataset.bound = "1";
    row.addEventListener("click", (e) => {
      const btn = e.target.closest(".im-new-toggle-btn");
      if (!btn || !row.contains(btn)) return;
      const mod = btn.dataset.mod;
      localMod = mod;

      // 立即更新按钮 active 样式
      for (const b of row.querySelectorAll(".im-new-toggle-btn")) {
        b.classList.toggle("active", b.dataset.mod === mod);
      }

      const targetUrl = targetUrlForMod(mod);
      const targetApi = targetApiForMod(mod);

      // 1. 改变 URL
      navigateInApp(targetUrl);

      // 2. 尝试转发原生按钮点击
      try {
        nativeButton(mod)?.click?.();
      } catch { /* ignore */ }

      // 3. 立即重拉指定 API 列表
      try {
        onRefresh?.(targetApi);
      } catch { /* ignore */ }
    });
  }

  const active = currentActiveMod();
  const html =
    buttonHtml("all", "所有", countOf(nativeButton("all")), active === "all") +
    buttonHtml("topics", "话题", countOf(nativeButton("topics")), active === "topics") +
    buttonHtml("replies", "回复", countOf(nativeButton("replies")), active === "replies");
  if (row.dataset.sig !== html) {
    row.dataset.sig = html;
    row.innerHTML = html;
  }
  row.style.display = "";
}
