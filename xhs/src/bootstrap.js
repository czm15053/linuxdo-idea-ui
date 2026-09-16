/* global __XHSIM_VERSION__ */
import { STYLE_ID, ROOT_CLASS } from "./config/constants.js";
import { currentSkinId } from "./config/skins.js";
import { getViewMode } from "./state/view-state.js";
import { skinCss } from "./styles/index.js";
import { applyColorMode, onColorThemeChange } from "./theme/color-mode.js";
import { removeFavicon } from "./theme/favicon.js";
import { patchHistory, chatIdFromRoute, routeKind } from "./bridge/router.js";
import { installSearchCapture } from "./bridge/feed-api.js";
import { ensureShell, removeShell, applyRootAttrs, syncTitle } from "./ui/shell.js";
import { ensureListPanel, syncListFromFeed } from "./ui/list-panel.js";
import { ensureChatPanel, syncChatMessages, resetChatMessages, removeChatPanel } from "./ui/chat-panel.js";
import { ensureRail, highlightRail, refreshMe } from "./ui/rail.js";
import { ensureTitlebar } from "./ui/titlebar.js";
import { bindSkinButtons, ensureNativeFab } from "./ui/skin-menu.js";
import { setChatId } from "./state/prefs.js";

export function run() {
  const version = typeof __XHSIM_VERSION__ !== "undefined" ? __XHSIM_VERSION__ : "0.1.0";
  console.info(`[xhs-im] v${version} loaded, skin=${currentSkinId()}`);
  // 尽早被动监听官方搜索接口响应（document-start 阶段安装，先于页面脚本发请求）
  installSearchCapture();

  if (typeof window !== "undefined" && window.matchMedia) {
    try {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => applyTheme());
    } catch { /* ignore */ }
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; applyTheme(); });
  }

  function injectStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = skinCss();
  }

  function applyTheme() {
    const html = document.documentElement;
    if (!html) return;
    applyColorMode();

    if (getViewMode() !== "im") {
      html.classList.remove(ROOT_CLASS);
      document.getElementById(STYLE_ID)?.remove();
      removeShell();
      removeFavicon();
      ensureNativeFab();
      return;
    }

    injectStyle();
    applyRootAttrs();
    if (!document.body) return;
    const kind = routeKind();
    if (kind === "compose" || kind === "other") {
      // 发帖/设置等护栏页：只保留 rail 导航，不套中右栏
      removeChatPanel();
      document.querySelector(".im-list-panel")?.remove();
      ensureTitlebar();
      ensureRail();
      bindSkinButtons();
      syncTitle();
      return;
    }
    ensureShell();
    const pathKey = location.pathname + location.search;
    if (applyTheme._path !== pathKey) {
      const prev = applyTheme._path || "";
      const prevKind = routeKind(prev.split("?")[0] || "/");
      const nextKind = routeKind();
      applyTheme._path = pathKey;
      setChatId(chatIdFromRoute());
      // 非 note/status 之间的路由切换照旧重置中栏；进出 note 由抽屉接管，中栏推荐流一直冻结
      if (prevKind !== "note" && nextKind !== "note" && prevKind !== "status" && nextKind !== "status") {
        resetChatMessages();
      }
    }
    highlightRail();
    ensureListPanel();
    ensureChatPanel();
    syncChatMessages();
    syncTitle();
  }

  onColorThemeChange(() => {
    if (getViewMode() !== "im") return;
    ensureTitlebar();
    ensureRail();
    bindSkinButtons();
  });

  function bootstrap() {
    if (!document.documentElement) {
      requestAnimationFrame(bootstrap);
      return;
    }
    injectStyle();
    applyRootAttrs();
    if (!document.body) {
      requestAnimationFrame(bootstrap);
      return;
    }
    requestAnimationFrame(scheduleApply);
    patchHistory(scheduleApply);

    let moTimer = 0;
    const mo = new MutationObserver(() => {
      if (getViewMode() !== "im") return;
      if (moTimer) return;
      moTimer = window.setTimeout(() => {
        moTimer = 0;
        syncChatMessages();
        syncListFromFeed();
        refreshMe();
      }, 200);
    });
    const startObs = () => {
      if (!document.body) { requestAnimationFrame(startObs); return; }
      mo.observe(document.body, { childList: true, subtree: true });
    };
    startObs();
  }

  applyRootAttrs();
  if (document.readyState === "loading") {
    injectStyle();
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
}
