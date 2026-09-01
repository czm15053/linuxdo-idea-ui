// 编排层：样式注入、视图装配（applyTheme）、启动引导（bootstrap/入口 run）

/* global __IM_VERSION__ */

import { SKIN_ID, SKINS, otherThemeActive, migratePrefs } from "./config/skins.js";

import {
  STYLE_ID, ROOT_CLASS, DARK_CLASS, LOCK_CLASS
} from "./config/constants.js";

import { skinCss } from "./styles/index.js";
import { debounce } from "./utils/dom.js";

import { listState } from "./state/list-state.js";
import { chatState } from "./state/chat-state.js";

import { getViewMode } from "./state/view-state.js";
import { makeFavicon } from "./theme/favicon.js";
import { restyleSplash } from "./theme/splash.js";
import {
  getColorTheme, applyColorMode, forceSiteScheme, onColorThemeChange,
} from "./theme/color-mode.js";
import {
  ensureRelativeTimeTicker,
} from "./ui/shared/time.js";
import { isHideCatTags, onListReload } from "./ui/shared/toggles.js";
import {
  isTopicPath, isHomePath, topicIdFromPath, listApiForPath,
  onRouteApply,
} from "./bridge/router.js";

import { ensureListPanel, syncListNav, syncListActive, renderListRows, loadList } from "./ui/list-panel.js";
import { ensureRailSources, renderActiveSource } from "./ui/list-sources.js";
import { parseProfilePath, renderProfilePanel } from "./ui/profile-panel.js";
import "./skins/feishu-list.js";
import "./ui/composer.js";
import "./composer/index.js";
import "./features/polls.js";
import "./features/boost.js";
import "./features/interactions.js";
import "./features/lightbox.js";
import "./features/quote-jump.js";
import "./features/read-track.js";
import { ensureTitlebar } from "./ui/titlebar.js";
import { ensureModeFab } from "./ui/mode-fab.js";
import {
  ensureRail, syncRail, ensureStrip, ensureSkinToggle,
  ensureDarkModeToggle, syncDarkModeToggle,
} from "./skins/dispatch.js";
import {
  getRailWidth, applyRailWidth, ensureRailResizer,
  getListWidth, applyListWidth, ensureListResizer,
} from "./ui/shared/resizer.js";
import { isNav2Open, onRailRefresh, isRailCollapsed, setRailCollapsed, syncRailFold } from "./ui/rail.js";
import { bindHeaderUserMenuInterception } from "./ui/rail.js";
import { syncNotifStrip } from "./ui/notifications.js";
import { bindSearchShortcut, openSearchPopup } from "./ui/search-popup.js";


import {
  ensureChatPanel, renderChatEmpty, loadTopic, syncNewPostsFromDom,
  startRealtimeChatPolling, subscribeTopicRealtime,
} from "./ui/chat-panel.js";
import { resetRailToChat } from "./ui/list-sources.js";
export function run() {
  migratePrefs();
  onColorThemeChange(syncDarkModeToggle);
  onRailRefresh(syncRail);
  onRailRefresh(syncNotifStrip);
  bindSearchShortcut();
  onRouteApply(scheduleApply);
  // 伪装开关改动 → 重绘（有数据）或按当前路由重拉（无数据）
  onListReload((mode) => {
    if (mode === "rows") renderListRows();
    else loadList(listState.apiPath || listApiForPath(location.pathname) || "/latest.json", true);
  });




  /* ============================== CSS ============================== */


  /* ============================== 基础设施 ============================== */


  function injectStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    // 始终刷新，避免旧版 CSS（挡住回复按钮）残留
    style.textContent = skinCss();
  }




  if (typeof window !== "undefined" && window.matchMedia) {
    try {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (getColorTheme() === "auto") {
          applyColorMode();
          forceSiteScheme();
          syncDarkModeToggle();
        }
      });
    } catch { /* ignore */ }
  }

  /* ============================== 最左图标 rail ============================== */





  /* ============================== 顶部蓝色 titlebar ============================== */



  /* ============================== 右栏：聊天详情 ============================== */











  /* ============================== 编排 ============================== */


  function removePanels() {
    document.querySelector(".im-list-panel")?.remove();
    document.querySelector(".im-chat-panel")?.remove();
    document.querySelector(".im-rail")?.remove();
    document.querySelector(".im-rail-resizer")?.remove();
    document.querySelector(".im-list-resizer")?.remove();
    document.querySelector(".im-strip")?.remove();
    document.querySelector(".im-titlebar")?.remove();
  }


  let scheduled = false;

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyTheme();
    });
  }


  const scheduleSyncNewPosts = debounce(syncNewPostsFromDom, 600);




  bootstrap();


  /* ============================== 编排（合并版） ============================== */

  function applyTheme() {
    if (otherThemeActive()) {
      console.warn("[linuxdo-im] 检测到其他外观脚本（旧版钉钉 / 旧版飞书）已启用，本脚本自动避让。请只保留其中一个。");
      document.documentElement.classList.remove(ROOT_CLASS, DARK_CLASS, LOCK_CLASS, "im-topic-open");
      removePanels();
      return;
    }

    // 按脚本深色偏好强制站点明暗（含切回原生布局）
    applyColorMode();
    forceSiteScheme();

    if (getViewMode() === "native") {
      document.documentElement.classList.remove(ROOT_CLASS, DARK_CLASS, LOCK_CLASS, "im-topic-open");
      removePanels();
      ensureModeFab();
      return;
    }

    injectStyle();
    document.documentElement.classList.add(ROOT_CLASS);
    applyColorMode();
    document.documentElement.classList.toggle("im-nav2-open", isNav2Open());
    document.documentElement.classList.toggle("im-hide-cat-tags", isHideCatTags());
    restyleSplash();
    makeFavicon();
    ensureModeFab();
    if (!document.body) return;

    if (SKIN_ID === "dingtalk") ensureTitlebar();
    ensureRail();
    ensureStrip();
    ensureRailResizer();
    applyRailWidth(getRailWidth());
    if (SKIN_ID === "wecom" || SKIN_ID === "feishu") setRailCollapsed(isRailCollapsed()); // 恢复侧栏收起态（每次 tick 幂等）
    else syncRailFold(); // dingtalk：宽/窄条按钮态跟随当前宽度（点按钮、拖宽都算）

    const pathname = location.pathname;
    const isTopic = isTopicPath(pathname);
    const isHome = isHomePath(pathname);
    const profile = parseProfilePath(pathname);
    const supported = isTopic || isHome || !!profile;

    document.documentElement.classList.toggle(LOCK_CLASS, supported);
    document.documentElement.classList.toggle("im-topic-open", isTopic);

    if (!supported) {
      // rail 常驻，展开栏为原生侧栏；仅移除中右栏
      document.querySelector(".im-list-panel")?.remove();
      document.querySelector(".im-chat-panel")?.remove();
      document.querySelector(".im-list-resizer")?.remove();
      return;
    }

    ensureListPanel();
    ensureRailSources();
    // 路由变化 → 中栏回到会话列表（通知列是临时覆盖，不应跨路由占住中栏）
    resetRailToChat();
    if (!profile) renderActiveSource();
    bindHeaderUserMenuInterception();
    ensureChatPanel();
    ensureListResizer();
    applyListWidth(getListWidth());
    syncListNav();
    ensureSkinToggle();
    // IM 模式浏览器 tab：列表/资料页固定显示皮肤名；话题页由 chat-panel 拼「主题 - 皮肤名」
    if (!isTopic) document.title = SKINS[SKIN_ID].label;
    if (SKIN_ID === "wecom") ensureDarkModeToggle(document.querySelector(".im-rail"));
    ensureRelativeTimeTicker();
    startRealtimeChatPolling();
    subscribeTopicRealtime(chatState.topicId);

    if (profile) {
      // 资料页：中栏 = 头部卡 + 总结/活动/通知 tab，右栏空态（§5.4）
      renderProfilePanel(profile.username, profile.tab);
      renderChatEmpty();
    } else if (isTopic) {
      // 进帖子：保留当前会话列表，只更新选中态 + 加载右栏
      if (listState.topics.length && listState.apiPath) {
        syncListActive();
      } else {
        loadList(listState.apiPath || "/latest.json", false);
      }
      loadTopic(topicIdFromPath(pathname));
      syncNewPostsFromDom();
    } else {
      loadList(listApiForPath(pathname), false);
      renderChatEmpty();
    }
    syncListActive();
  }

  function bootstrap() {
    console.info(`[linuxdo-im] v${__IM_VERSION__} loaded, skin=${SKIN_ID}`);
    if (!document.documentElement) {
      setTimeout(bootstrap, 0);
      return;
    }
    injectStyle();
    if (!otherThemeActive()) {
      // document-start 尽早按偏好锁明暗，减少闪一下
      applyColorMode();
      forceSiteScheme();
    }
    if (getViewMode() !== "native" && !otherThemeActive()) {
      document.documentElement.classList.add(ROOT_CLASS);
      applyColorMode();
      restyleSplash();
      makeFavicon(); // document-start 尽早换标，减少未聚焦标签仍显示原 icon
    }

    // 标签重新可见时再刷一次（部分浏览器未聚焦时会缓存旧 favicon）
    if (!window.__imFaviconVisibilityBound) {
      window.__imFaviconVisibilityBound = true;
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && getViewMode() !== "native" && !otherThemeActive()) {
          makeFavicon();
        }
      });
    }

    const IM_UI_SEL = ".im-list-panel, .im-chat-panel, .im-rail, .im-strip, .im-titlebar, .im-mode-fab, .im-search-pop-overlay, #linuxdo-im-theme";
    const observer = new MutationObserver((mutations) => {
      // 忽略我们自己面板内部的 DOM 变动，否则点开筛选会立刻触发 applyTheme 回写/闪断
      const external = mutations.some((m) => {
        const t = m.target;
        if (!(t instanceof Element) && !(t instanceof CharacterData)) return true;
        const el = t instanceof Element ? t : t.parentElement;
        if (!el) return true;
        if (el.closest(IM_UI_SEL)) return false;
        if (el.id === "linuxdo-im-theme") return false;
        return true;
      });
      if (external) scheduleApply();
      scheduleSyncNewPosts();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    for (const method of ["pushState", "replaceState"]) {
      const original = history[method];
      history[method] = function (...args) {
        const result = original.apply(this, args);
        scheduleApply();
        return result;
      };
    }
    window.addEventListener("popstate", scheduleApply);
    window.addEventListener("hashchange", scheduleApply);
    document.addEventListener("DOMContentLoaded", scheduleApply, { once: true });
    document.addEventListener("turbo:load", scheduleApply);
    document.addEventListener("page:changed", scheduleApply);

    // 定时同步头像通知角标（currentUser 未读数会变）
    if (!window.__imNotifBadgeTimer) {
      window.__imNotifBadgeTimer = setInterval(() => {
        if (getViewMode() === "native" || otherThemeActive()) return;
        if (!document.querySelector(".im-rail")) return;
        syncRail();
      }, 15000);
    }

    // ⌘/Ctrl+K → 皮肤对应搜索框（再同步原生 welcome-banner）
    window.addEventListener("keydown", (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      if ((e.key || "").toLowerCase() !== "k") return;
      if (getViewMode() === "native" || otherThemeActive()) return;
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "TEXTAREA" || (tag === "INPUT" && e.target.type !== "search")) return;
      e.preventDefault();
      e.stopPropagation();
      if (SKIN_ID === "feishu") ensureRail();
      else if (SKIN_ID === "dingtalk") ensureTitlebar();
      if (SKIN_ID === "wecom") { openSearchPopup(); return; } // 搜索框为只读入口，⌘K 直接弹面板
      const selector = SKIN_ID === "feishu"
        ? ".im-rail-search input"
        : SKIN_ID === "dingtalk"
          ? ".im-titlebar input"
          : ".im-list-search input";
      const input = document.querySelector(selector);
      if (input) {
        input.focus();
        input.select();
      }
    }, true);

    scheduleApply();
  }

  bootstrap();
}
