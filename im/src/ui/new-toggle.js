// /new（新）列表顶部的「所有 / 话题 / 回复」筛选条（DISCOURSE-NEW-TOGGLE）。
// 吸附 linux.do 原生 /new 页的同名组件：计数文本从原生 DOM 读取，
// 点击转发原生对应按钮（以其自身事件委托切换过滤），并顺手重拉当前列表。
// 原生组件被 IM 壳 visibility:hidden 遮蔽但仍留在 DOM，因此可安全读取/转发。

const WRAPPER_SEL = ".topic-replies-toggle-wrapper";

// 本地记忆的选中态：点击后立即采用，不再依赖原生 active class 的即时同步；
// 仅在无本地记录（首访 /new）时读一次原生当前态作为初始值。
let localMod = null;

function isNewRoute() {
  return location.pathname.replace(/\/+$/, "") === "/new";
}

/** 原生三个按钮按 modifier 类取：--all / --topics / --replies */
function nativeButton(mod) {
  try {
    return document.querySelector(`${WRAPPER_SEL} .topics-replies-toggle.${mod}`);
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

/** 当前 IM 列表对应当前原生选中态（--all/--topics/--replies 谁 active） */
export function nativeActiveMod() {
  const wrapper = document.querySelector(WRAPPER_SEL);
  if (!wrapper) return "all";
  for (const mod of ["topics", "replies", "all"]) {
    const btn = wrapper.querySelector(`.topics-replies-toggle.${mod}`);
    if (btn && (btn.classList.contains("active"))) return mod;
  }
  return "all";
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
 * 状态同步：按当前路由同步「所有/话题/回复」筛选条（吸附原生）。
 * onRefresh：点击切换后重拉当前列表（loadList force）。
 * 幂等：非 /new 路由时隐藏筛选条；原生 wrapper 未就绪时静默。
 */
export function syncNewToggle(panel, onRefresh) {
  if (!panel) return;
  let row = panel.querySelector(".im-new-toggle");
  const show = isNewRoute();

  if (!show) {
    if (row) row.style.display = "none";
    return;
  }

  // HTML 结构：wrapper（选中态 + 三按钮，计数随原生）——非空才显示行
  if (!row) {
    row = document.createElement("div");
    row.className = "im-new-toggle";
    panel.querySelector(".im-list-header")?.after(row);
    row.addEventListener("click", (e) => {
      const btn = e.target.closest(".im-new-toggle-btn");
      if (!btn || !row.contains(btn)) return;
      const mod = btn.dataset.mod;
      localMod = mod; // 本地点选为选中项，立即高亮
      // 转发原生按钮点击：原生的交互（含 URL/列表切换）仍由其事件委托处理
      try {
        nativeButton(mod)?.click?.();
      } catch { /* ignore */ }
      // 顺手重拉当前列表，尽量跟随（原生若改 URL，bootstrap pushState 钩子也会触发）
      try { onRefresh?.(); } catch { /* ignore */ }
    });
  }
  if (!row.dataset.bound) row.dataset.bound = "1";

  // 选中态：优先本地记忆；首次访问（无记忆）才读原生当前态
  if (!localMod) localMod = nativeActiveMod() || "all";
  const active = localMod;
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