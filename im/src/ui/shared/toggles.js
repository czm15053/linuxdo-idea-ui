import { MASK_AVATAR_KEY, MASK_TITLE_KEY, HIDE_CAT_TAGS_KEY } from "../../config/constants.js";
import { listState } from "../../state/list-state.js";
import { ICONS } from "../../config/icons.js";
import { chatHooks } from "../hooks.js";

/** 伪装开关改动后刷新中栏列表（"rows"=重绘 / "load"=按当前路由重拉）；由入口注册 */
let listReloader = null;
export function onListReload(fn) {
  listReloader = fn;
}

export function isMaskAvatar() {
  try { return localStorage.getItem(MASK_AVATAR_KEY) === "1"; } catch { return false; }
}
export function isMaskTitle() {
  try { return localStorage.getItem(MASK_TITLE_KEY) === "1"; } catch { return false; }
}
export function isHideCatTags() {
  try { return localStorage.getItem(HIDE_CAT_TAGS_KEY) === "1"; } catch { return false; }
}
export function setMaskAvatar(on) {
  try { localStorage.setItem(MASK_AVATAR_KEY, on ? "1" : "0"); } catch { /* ignore */ }
  const panel = document.querySelector(".im-list-panel");
  ensureMaskAvatarToggle(panel);
  // 列表若还没数据，先别空转；有数据则立刻重绘头像
  if (listState.topics && listState.topics.length) {
    listReloader?.("rows");
  } else if (panel) {
    // 兜底：按当前路由拉一次列表再绘
    listReloader?.("load");
  }
  // 已打开的话题详情页头部同步重涂
  chatHooks.refreshMaskedChrome?.();
}
export function setMaskTitle(on) {
  try { localStorage.setItem(MASK_TITLE_KEY, on ? "1" : "0"); } catch { /* ignore */ }
  const panel = document.querySelector(".im-list-panel");
  ensureMaskTitleToggle(panel);
  if (listState.topics && listState.topics.length) {
    listReloader?.("rows");
  } else if (panel) {
    listReloader?.("load");
  }
  // 已打开的话题详情页头部同步重涂
  chatHooks.refreshMaskedChrome?.();
}
export function setHideCatTags(hide) {
  try { localStorage.setItem(HIDE_CAT_TAGS_KEY, hide ? "1" : "0"); } catch { /* ignore */ }
  document.documentElement.classList.toggle("im-hide-cat-tags", hide);
  const panel = document.querySelector(".im-list-panel");
  ensureCatTagToggle(panel);
}

export function ensureMaskAvatarToggle(panel) {
  if (!panel) return;
  const actions = panel.querySelector(".im-list-actions");
  if (!actions) return;
  let btn = actions.querySelector(".im-mask-avatar-toggle");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "im-icon-btn im-mask-avatar-toggle";
    btn.innerHTML = ICONS.disguise;
    actions.insertBefore(btn, actions.firstChild);
  }
  // 直接绑在按钮上，避免旧面板 linkBound 已占用导致点不到
  if (btn.dataset.bound !== "1") {
    btn.dataset.bound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
      setMaskAvatar(!isMaskAvatar());
    });
  }
  const on = isMaskAvatar();
  btn.title = on ? "伪装头像：开（点击恢复真实头像）" : "伪装头像：关（点击开启）";
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.classList.toggle("is-on", on);
}
export function ensureMaskTitleToggle(panel) {
  if (!panel) return;
  const actions = panel.querySelector(".im-list-actions");
  if (!actions) return;
  let btn = actions.querySelector(".im-mask-title-toggle");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "im-icon-btn im-mask-title-toggle";
    btn.innerHTML = ICONS.win;
    actions.insertBefore(btn, actions.firstChild);
  }
  if (btn.dataset.bound !== "1") {
    btn.dataset.bound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
      setMaskTitle(!isMaskTitle());
    });
  }
  const on = isMaskTitle();
  btn.title = on ? "伪装标题：开（点击恢复真实标题）" : "伪装标题：关（点击开启）";
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.classList.toggle("is-on", on);
}
export function ensureCatTagToggle(panel) {
  if (!panel) return;
  const actions = panel.querySelector(".im-list-actions");
  if (!actions) return;
  let btn = actions.querySelector(".im-cat-tag-toggle");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "im-icon-btn im-cat-tag-toggle";
    btn.innerHTML = ICONS.filter;
    actions.insertBefore(btn, actions.firstChild);
  }
  if (btn.dataset.bound !== "1") {
    btn.dataset.bound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
      setHideCatTags(!isHideCatTags());
    });
  }
  const on = isHideCatTags();
  btn.title = on ? "隐藏分类标签：开（点击显示）" : "隐藏分类标签：关（点击隐藏）";
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.classList.toggle("is-on", on);
}
