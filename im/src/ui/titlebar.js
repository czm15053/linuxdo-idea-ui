// 顶部蓝色 titlebar（钉钉皮肤）：头像/搜索框/装饰按钮
import { ICONS } from "../config/icons.js";
import { bindSearchTrigger } from "./search-popup.js";
import { bindRailAvatarNotif } from "./rail.js";
import { skinHooks } from "../skins/hooks.js";

export function ensureTitlebar() {
  let bar = document.querySelector(".im-titlebar");
  if (bar) {
    bindTitlebarSearch(bar);
    bindRailAvatarNotif(bar);
    skinHooks.darkToggle?.(bar);
    return bar;
  }
  bar = document.createElement("header");
  bar.className = "im-titlebar";
  bar.innerHTML = `
    <div class="me-chip">
      <div class="im-rail-avatar"></div>
      <span class="im-rail-avatar-badge" style="display:none"></span>
    </div>
    <div class="title-search">
      <form action="/search" method="get" role="search">
        ${ICONS.search}
        <input type="search" name="q" placeholder="搜索或提问 (⌘K)" autocomplete="off" enterkeyhint="search" aria-label="搜索">
      </form>
    </div>
    <div class="title-actions">
      <button type="button" class="t-btn im-dark-toggle" title="深色模式：关（点击开启）" aria-pressed="false">${ICONS.moon}</button>
      <button type="button" class="t-btn" title="投屏" aria-hidden="true"><span class="dot"></span>${ICONS.monitor}</button>
      <button type="button" class="t-btn" title="创建" aria-hidden="true">${ICONS.plus}</button>
    </div>`;
  document.body.appendChild(bar);
  bindTitlebarSearch(bar);
  bindRailAvatarNotif(bar);
  skinHooks.darkToggle?.(bar);
  return bar;
}
function bindTitlebarSearch(bar) {
  if (!bar) return;
  const wrap = bar.querySelector(".title-search");
  if (!wrap) return;
  // 搜索框仅作入口（readonly），点击弹出全局搜索面板（⌘K 亦可）
  bindSearchTrigger(wrap, { placeholder: "搜索或提问 (⌘K)" });
}




/* ============================== 展开栏：站点原生侧栏（原样搬入） ============================== */

/* ============================== 中栏：会话列表 ============================== */
