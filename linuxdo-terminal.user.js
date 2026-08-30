// ==UserScript==
// @name         Linux DO · 终端 TUI 外观
// @namespace    https://linux.do/
// @version      0.3.0
// @description  终端 AI TUI 风格的 LinuxDo（Claude Code / Codex CLI 双配色）
// @author       czm15053
// @match        https://linux.do/*
// @icon         https://linux.do/favicon.ico
// @grant        none
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  /* ============================== 常量 ============================== */

  const STYLE_ID = "linuxdo-terminal-theme";
  const FAVICON_ID = "terminal-favicon";
  const ROOT_CLASS = "tt-tui-theme";
  const LOCK_CLASS = "tt-locked"; // 列表/详情路由挂载：隐藏原生主内容
  const VARIANT_KEY = "linuxdo-terminal-variant"; // "claude" | "codex"
  const VIEW_KEY = "linuxdo-terminal-view"; // "tui" | "native"
  /* ---------- 平台判定：mac 红绿灯在左，windows 控制钮在右 ---------- */

  function isMacPlatform() {
    const p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    if (/mac|iphone|ipad|ios/i.test(p)) return true;
    if (/win|linux|android/i.test(p)) return false;
    return /mac os|macintosh/i.test(navigator.userAgent || "");
  }
  const IS_MAC = isMacPlatform();
  const SHELL_NAME = IS_MAC ? "zsh" : "pwsh";

  const FAKE_TITLE = `linux.do — ${SHELL_NAME}`; // TUI 模式下标签页标题，不暴露帖子标题
  const SESSION_KEY = "linuxdo-terminal-sessions"; // 最近浏览记录 → splash 的 Recent activity
  let originalTitle = "";

  /** 记录最近浏览的话题，splash 伪装成 CLI 会话历史（最多 5 条） */
  function recordSession(title) {
    if (!title) return;
    try {
      const list = JSON.parse(localStorage.getItem(SESSION_KEY) || "[]")
        .filter((s) => s.t !== title);
      list.unshift({ t: title, at: Date.now() });
      localStorage.setItem(SESSION_KEY, JSON.stringify(list.slice(0, 5)));
    } catch { /* ignore */ }
  }

  function recentSessions() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "[]"); } catch { return []; }
  }

  /* ============================== 工具函数 ============================== */

  function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function formatTime(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const diff = Date.now() - date.getTime();
    const minute = 60e3, hour = 3600e3, day = 86400e3;
    if (diff < minute) return "now";
    if (diff < hour) return `${Math.floor(diff / minute)}m`;
    if (diff < day) return `${Math.floor(diff / hour)}h`;
    if (diff < 30 * day) return `${Math.floor(diff / day)}d`;
    return `${date.getMonth() + 1}/${String(date.getDate()).padStart(2, "0")}`;
  }

  async function api(path) {
    const resp = await fetch(path, {
      headers: { Accept: "application/json" },
      credentials: "same-origin"
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }

  function csrfToken() {
    const meta = document.querySelector("meta[name='csrf-token']");
    return meta ? meta.content : "";
  }

  /* ---------- 当前用户名（移植自 codex 脚本） ---------- */

  let cachedUsername = null;

  function extractUsernameFromHref(href) {
    if (!href) return null;
    try {
      const path = href.startsWith("http") ? new URL(href, location.origin).pathname : href;
      const m = path.match(/^\/u\/([^/?#]+)/i);
      return m ? decodeURIComponent(m[1]) : null;
    } catch {
      return null;
    }
  }

  function readPreloadedCurrentUser() {
    try {
      const el = document.getElementById("data-preloaded");
      if (!el) return null;
      const raw = el.getAttribute("data-preloaded") || el.textContent;
      if (!raw) return null;
      const data = JSON.parse(raw);
      const candidates = [data.currentUser, data.current_user];
      for (const key of Object.keys(data || {})) {
        if (/current.?user/i.test(key)) candidates.push(data[key]);
      }
      for (const c of candidates) {
        if (!c) continue;
        const parsed = typeof c === "string" ? JSON.parse(c) : c;
        const name = parsed && (parsed.username || parsed.user?.username);
        if (name) return name;
      }
    } catch { /* ignore */ }
    return null;
  }

  function getCurrentUsername() {
    if (cachedUsername) return cachedUsername;
    try {
      const selectors = [
        "#current-user a[href*='/u/']",
        "#current-user button[data-user-card]",
        ".header-dropdown-toggle.current-user a[href*='/u/']",
        ".current-user a[href*='/u/']"
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const fromHref = extractUsernameFromHref(el.getAttribute("href") || "");
        if (fromHref) { cachedUsername = fromHref; return cachedUsername; }
        const card = el.getAttribute("data-user-card");
        if (card) { cachedUsername = card; return cachedUsername; }
      }
      const preloaded = readPreloadedCurrentUser();
      if (preloaded) { cachedUsername = preloaded; return cachedUsername; }
    } catch { /* ignore */ }
    return null;
  }

  /* ============================== 路由判定 ============================== */

  function isTopicPath(pathname) {
    return /^\/t\//.test(pathname);
  }

  function topicIdFromPath(pathname) {
    const m = pathname.match(/^\/t\/(?:[\w-]+\/)?(\d+)/);
    return m ? Number(m[1]) : null;
  }

  function isHomePath(pathname) {
    return pathname === "/" ||
      /^\/(latest|new|unread|unseen|top|categories|hot|posted|read|bookmarks)\b/.test(pathname) ||
      /^\/c\//.test(pathname) || /^\/tag\//.test(pathname);
  }

  function listApiForPath(pathname) {
    if (pathname === "/" || pathname === "/latest") return "/latest.json";
    if (pathname === "/new") return "/new.json";
    if (pathname === "/unread" || pathname === "/unseen") return "/unseen.json";
    if (pathname === "/top") return "/top.json";
    if (pathname === "/hot") return "/hot.json";
    if (pathname === "/posted") return "/posted.json";
    if (pathname === "/read") return "/read.json";
    if (pathname === "/bookmarks") return "/bookmarks.json";
    if (pathname === "/categories") return "/latest.json";
    const c = pathname.match(/^\/c\/([\w-]+(?:\/[\w-]+)?)(\/l\/(?:new|unread|hot|top))?/);
    if (c) return `/c/${c[1]}${c[2] || ""}.json`;
    const t = pathname.match(/^\/tag\/([\w-]+)/);
    if (t) return `/tag/${t[1]}.json`;
    return "/latest.json";
  }

  /** 列表路由的终端风显示名（面包屑 / 状态栏 / 列表头共用） */
  function routeLabelForPath(pathname) {
    if (pathname === "/" || pathname === "/latest") return "latest";
    if (pathname === "/new") return "new";
    if (pathname === "/unread" || pathname === "/unseen") return "unread";
    if (pathname === "/top") return "top";
    if (pathname === "/hot") return "hot";
    if (pathname === "/posted") return "posted";
    if (pathname === "/read") return "read";
    if (pathname === "/bookmarks") return "bookmarks";
    if (pathname === "/categories") return "categories";
    const c = pathname.match(/^\/c\/([\w-]+)/);
    if (c) return pinyinSlugForPath(c[1]);
    const t = pathname.match(/^\/tag\/([\w-]+)/);
    if (t) return `tag-${t[1]}`;
    return "latest";
  }

  /* ============================== 互斥避让 ============================== */

  function otherThemeActive() {
    const root = document.documentElement;
    return root.classList.contains("feishu-im-theme") ||
      root.classList.contains("idea-ide-home") ||
      root.classList.contains("idea-ide-theme") ||
      root.classList.contains("codex-theme") ||
      !!document.getElementById("linuxdo-idea-theme") ||
      !!document.getElementById("linuxdo-feishu-theme") ||
      !!document.getElementById("linuxdo-codex-theme") ||
      !!document.getElementById("linuxdo-dingtalk-theme");
  }

  /* ============================== 配色变体 ============================== */

  function currentVariant() {
    try {
      const v = localStorage.getItem(VARIANT_KEY);
      if (v === "claude" || v === "codex") return v;
    } catch { /* ignore */ }
    return "claude";
  }

  function setVariant(v) {
    try { localStorage.setItem(VARIANT_KEY, v); } catch { /* ignore */ }
    const root = document.documentElement;
    root.classList.toggle("tt-claude", v === "claude");
    root.classList.toggle("tt-codex", v === "codex");
    makeFavicon();
    syncLauncher();
  }

  function syncLauncher() {
    const v = currentVariant();
    document.querySelectorAll(".tt-launcher .tt-tab").forEach((b) => {
      b.classList.toggle("active", b.dataset.variant === v);
    });
    const mode = document.querySelector(".tt-statusbar .mode");
    if (mode) mode.textContent = v === "codex" ? "CODEX" : "CLAUDE";
    // 详情页头部随变体重渲染（claude 螃蟹盒 / codex 启动盒）
    renderTopicHead();
  }

  /* ============================== CSS ============================== */

  const RAW_CSS = `
    /* ---------- Token：Claude Code TUI（默认） ---------- */
    html.${ROOT_CLASS} {
      /* 黑底沿用原版；文字/高亮取自真实 Claude Code：文 #d6dbe5 / 灰 #7a8088 / code 薰衣草 #b2b9f9 / 链蓝 #4ea8ff / 绿点 #4ec87f / 螃蟹橙 #d97757 */
      --tt-bg: #17171a;
      --tt-bg-raised: #1f1f24;
      --tt-bg-inset: #101013;
      --tt-border: #2a2a30;
      --tt-border-soft: #202026;
      --tt-border-strong: #3a3a42;
      --tt-text: #d6dbe5;
      --tt-text-secondary: #a3aab5;
      --tt-text-dim: #7a8088;
      --tt-text-faint: #4c545e;
      --tt-gray: #8b929c;
      --tt-accent: #b2b9f9;
      --tt-accent-dim: rgba(178, 185, 249, 0.14);
      --tt-crab: #d97757;
      --tt-select: #b2b9f9;
      --tt-green: #4ec87f;
      --tt-cyan: #63c5d8;
      --tt-blue: #4ea8ff;
      --tt-yellow: #d8b878;
      --tt-red: #d07a7a;
      --tt-font: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas,
        "Liberation Mono", monospace;
    }

    /* ---------- Token：Codex CLI（黑底；文字/蓝/绿/琥珀取自真实 Codex 截图） ---------- */
    html.${ROOT_CLASS}.tt-codex {
      --tt-bg: #181818;
      --tt-bg-raised: #1e1e1e;
      --tt-bg-inset: #131313;
      --tt-border: #2e2e2e;
      --tt-border-soft: #222222;
      --tt-border-strong: #3d3d3d;
      --tt-text: #d6dbe5;
      --tt-text-secondary: #a3aab5;
      --tt-text-dim: #7b8089;
      --tt-text-faint: #4c545e;
      --tt-gray: #8b929c;
      --tt-accent: #83c3fe;
      --tt-accent-dim: rgba(131, 195, 254, 0.14);
      --tt-select: #ecba0f;
      --tt-green: #2cc55f;
      --tt-cyan: #79c0d8;
      --tt-blue: #83aefe;
      --tt-yellow: #e0c078;
      --tt-red: #e08484;
    }

    /* ---------- 原生页面隐藏与层级 ---------- */
    html.${ROOT_CLASS}.${LOCK_CLASS} #main-outlet-wrapper,
    html.${ROOT_CLASS}.${LOCK_CLASS} #main-outlet,
    html.${ROOT_CLASS}.${LOCK_CLASS} .d-header {
      display: none !important;
    }
    /* Ember 启动前的整页 loading：去掉站点 logo 图标（参考 idea 脚本对 #d-splash 的处理），
       只留圆点动画，底色压成终端深色避免白闪 */
    html.${ROOT_CLASS} #loading-splash,
    html.${ROOT_CLASS} .d-preloader {
      display: none !important;
    }
    html.${ROOT_CLASS}:has(#d-splash) { background-color: #17171a !important; }
    html.${ROOT_CLASS} #d-splash { --dot-color: #3a3a42 !important; }
    html.${ROOT_CLASS} #d-splash .splash-logo-container { display: none !important; }
    html.${ROOT_CLASS} #d-splash .preloader-image { background-image: none !important; }
    /* app 全屏接管，禁掉原生 body 滚动与残留滚动条 */
    html.${ROOT_CLASS}.${LOCK_CLASS}, html.${ROOT_CLASS}.${LOCK_CLASS} body {
      overflow: hidden !important; height: 100% !important;
    }
    html.${ROOT_CLASS} #reply-control {
      z-index: 1300 !important;
    }
    html.${ROOT_CLASS} .tt-art, html.${ROOT_CLASS} .tt-thinking,
    html.${ROOT_CLASS} .tt-turn, html.${ROOT_CLASS} .tt-trows {
      user-select: text;
    }

    /* ---------- 应用骨架 ---------- */
    .tt-app {
      position: fixed; inset: 0; z-index: 900;
      display: flex; flex-direction: column;
      background: var(--tt-bg); color: var(--tt-text);
      font-family: var(--tt-font); font-size: 13.5px; line-height: 1.65;
    }
    .tt-app ::selection { background: var(--tt-accent-dim); }
    .tt-app a { color: var(--tt-blue); text-decoration: none; }
    .tt-app a:hover { text-decoration: underline; }
    .tt-app ::-webkit-scrollbar { width: 8px; height: 8px; }
    .tt-app ::-webkit-scrollbar-thumb { background: var(--tt-border-strong); border-radius: 4px; }
    .tt-app ::-webkit-scrollbar-track { background: transparent; }

    /* ---------- winbar：mac 红绿灯 / windows 窗口控制钮 ---------- */
    .tt-winbar {
      flex: none; display: flex; align-items: center; gap: 14px;
      height: 38px; padding: 0 14px;
      background: var(--tt-bg-raised);
      border-bottom: 1px solid var(--tt-border-soft);
      user-select: none;
    }
    .tt-lights { display: flex; gap: 8px; }
    .tt-lights .l { width: 12px; height: 12px; border-radius: 50%; }
    .tt-lights .l.red { background: #ff5f57; }
    .tt-lights .l.yellow { background: #febc2e; }
    .tt-lights .l.green { background: #28c840; }
    .tt-win-title {
      flex: 1; text-align: center; font-size: 12px; color: var(--tt-text-dim);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .tt-winbar.win .tt-win-title { text-align: left; padding-left: 2px; }
    .tt-winbtns { display: flex; align-self: stretch; margin-right: -14px; }
    .tt-winbtns .b {
      width: 42px; display: flex; align-items: center; justify-content: center;
      color: var(--tt-text-dim); font-size: 12px;
    }
    .tt-winbtns .b:hover { background: var(--tt-border-soft); color: var(--tt-text); }
    .tt-winbtns .b.close:hover { background: #e81123; color: #fff; }
    .tt-launcher { display: flex; gap: 6px; }
    .tt-launcher .tt-tab {
      display: flex; align-items: center; gap: 6px;
      font-family: inherit; font-size: 12px; color: var(--tt-text-dim);
      background: transparent; border: 1px solid transparent;
      border-radius: 5px; padding: 3px 10px; cursor: pointer;
    }
    .tt-launcher .tt-tab:hover { background: var(--tt-bg); color: var(--tt-text-secondary); }
    .tt-launcher .tt-tab .g { font-size: 13px; }
    .tt-launcher .tt-tab.active {
      color: var(--tt-accent); background: var(--tt-bg);
      border-color: var(--tt-border-strong);
    }

    /* ---------- topbar：面包屑 ---------- */
    .tt-topbar {
      flex: none; display: flex; align-items: center; justify-content: space-between;
      padding: 10px 20px 6px; font-size: 12.5px; color: var(--tt-text-dim);
    }
    .tt-topbar .path { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tt-topbar .brand { color: var(--tt-accent); font-weight: 600; }
    .tt-topbar .cat {
      cursor: pointer; color: var(--tt-accent);
      border-bottom: 1px dashed var(--tt-text-faint);
    }
    .tt-topbar .cat:hover { background: var(--tt-accent-dim); }
    .tt-topbar .user { flex: none; padding-left: 16px; }

    /* ---------- 主滚动区（撑满全宽，真终端没有左右留白） ---------- */
    .tt-main {
      flex: 1; overflow-y: auto;
      width: 100%; box-sizing: border-box;
      padding: 8px 20px 20px;
    }

    /* ---------- splash（仿真实启动画面） ---------- */
    .tt-splash { padding: 10px 0 6px; user-select: none; }
    .tt-splash .term-line { color: var(--tt-text-dim); font-size: 13px; padding-bottom: 10px; }
    .tt-splash .term-line b { color: var(--tt-text-secondary); font-weight: 400; }

    /* Claude Code 会话中枢 splash（v2.1.x 真实首屏：╭─ 标题 ─╮ 边框盒 + 左 logo / 右 Tips·What's new） */
    .tt-hub { user-select: none; }
    .tt-hub-cap {
      display: flex; align-items: center; gap: 12px;
      font-size: 12.5px; color: var(--tt-text-secondary); white-space: nowrap;
    }
    .tt-hub-cap .ln { flex: 1; border-top: 1px solid var(--tt-border-strong); }
    .tt-hub-box {
      border: 1px solid var(--tt-border-strong); border-top: none;
      border-radius: 0 0 8px 8px; padding: 12px 18px 14px;
    }
    .tt-hub-cols { display: flex; }
    .tt-hub-left { flex: none; width: 30%; min-width: 0; }
    .tt-hub-right {
      flex: 1; min-width: 0;
      border-left: 1px solid var(--tt-border-soft);
      margin-left: 20px; padding-left: 20px;
    }
    .tt-hub-logo {
      margin: 0 0 6px; font-family: inherit; font-size: 12px; line-height: 1.2;
      color: var(--tt-crab); white-space: pre;
    }
    .tt-hub-welcome { font-size: 14px; font-weight: 600; color: var(--tt-text); text-align: left; }
    .tt-hub-sub { font-size: 12px; color: var(--tt-text-dim); margin-top: 6px; }
    .tt-hub-h { font-size: 12px; color: var(--tt-text-faint); margin-bottom: 4px; }
    .tt-hub-line { font-size: 12.5px; color: var(--tt-text-secondary); line-height: 1.55; }
    .tt-hub-line b { color: var(--tt-text); font-weight: 600; }
    .tt-hub-divider { border-top: 1px solid var(--tt-border-soft); margin: 9px 0; }
    .tt-hub-more { font-size: 12px; color: var(--tt-text-dim); margin-top: 6px; }
    .tt-hub-stats { font-size: 12.5px; color: var(--tt-text-dim); margin: 12px 0 2px; }
    .tt-hub-stats b { color: var(--tt-text); font-weight: 600; }
    .tt-hub-sess {
      display: flex; align-items: baseline; gap: 8px;
      font-size: 12.5px; padding: 2px 0;
    }
    .tt-hub-sess .g { color: var(--tt-accent); flex: none; }
    .tt-hub-sess .t {
      color: var(--tt-text-secondary);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .tt-hub-sess .at { flex: none; margin-left: auto; padding-left: 12px; color: var(--tt-text-faint); }
    .tt-hub-update { font-size: 12px; color: var(--tt-yellow); margin-top: 10px; }
    .tt-hub-update .cmd { color: var(--tt-text-secondary); }

    .tt-cx-box {
      border: 1px solid var(--tt-border-strong); border-radius: 8px;
      padding: 12px 16px 13px;
    }
    .tt-cx-head { font-size: 14px; color: var(--tt-text); }
    .tt-cx-head .gt { color: var(--tt-text-dim); margin-right: 6px; }
    .tt-cx-head .ver { color: var(--tt-text-dim); }
    .tt-cx-row { display: flex; gap: 8px; font-size: 13px; color: var(--tt-text-secondary); margin-top: 4px; }
    .tt-cx-row .lbl { color: var(--tt-text-dim); width: 104px; flex: none; }
    .tt-cx-row .cmd { color: var(--tt-accent); }
    .tt-cx-tip { font-size: 12.5px; color: var(--tt-text-dim); padding: 12px 2px 0; }
    .tt-cx-tip b { color: var(--tt-text); }

    /* ---------- 列表屏 ---------- */
    .tt-list-head {
      display: flex; justify-content: space-between; align-items: baseline;
      color: var(--tt-text-dim); font-size: 12px; letter-spacing: 0.08em;
      padding: 8px 0 10px; border-bottom: 1px solid var(--tt-border-soft);
    }
    /* "Resume session (N)" 加粗：Claude 薰衣草 / Codex 亮蓝，各自取自 --tt-accent */
    .tt-list-head .title { color: var(--tt-accent); font-weight: 600; letter-spacing: 0.02em; }
    .tt-list-head .views { margin-left: 16px; margin-right: auto; display: inline-flex; gap: 12px; letter-spacing: 0.02em; }
    .tt-list-head .vchip { color: var(--tt-text-faint); cursor: pointer; }
    .tt-list-head .vchip:hover { color: var(--tt-text-secondary); }
    .tt-list-head .vchip.on { color: var(--tt-accent); }
    .tt-list-head .vchip.on::before { content: "["; color: var(--tt-text-faint); }
    .tt-list-head .vchip.on::after { content: "]"; color: var(--tt-text-faint); }
    /* Codex: chips 伪装成 "Filter: [Cwd] All" 式的筛选行 */
    html.${ROOT_CLASS}.tt-codex .tt-list-head .views::before { content: "view:"; color: var(--tt-text-dim); }
    .tt-trow {
      display: flex; align-items: baseline; gap: 10px;
      padding: 5px 10px; margin: 0 -10px; border-radius: 4px;
      cursor: pointer; position: relative;
    }
    .tt-trow:hover { background: var(--tt-bg-raised); }
    /* Claude resume 风格：两行结构，上行标题下行 meta；选中行标题 + ❯ 变 select 色，无底色 */
    .tt-trow .t-main { flex: 1; min-width: 0; }
    .tt-trow .t-title {
      display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      color: var(--tt-text); font-weight: 600;
    }
    .tt-trow .t-meta { display: block; margin-top: 1px; color: var(--tt-text-dim); font-size: 12px; }
    .tt-trow.active .t-title, .tt-trow.active .cursor-mark { color: var(--tt-select); }
    .tt-trow .cursor-mark {
      color: var(--tt-accent); font-weight: 700;
      visibility: hidden; margin-left: -4px; flex: none;
    }
    .tt-trow.active .cursor-mark, .tt-trow:hover .cursor-mark { visibility: visible; }
    .tt-trow .dot { flex: none; font-size: 11px; }
    .tt-trow .dot.unread { color: var(--tt-green); }
    .tt-trow .dot.read { color: var(--tt-text-faint); }
    .tt-trow .dot.pin { color: var(--tt-yellow); }
    .tt-trow.read .t-title { color: var(--tt-text-secondary); font-weight: 400; }
    /* Codex resume 风格：单行，时间在左固定列，选中行整行琥珀 + 深色底带 */
    html.${ROOT_CLASS}.tt-codex .tt-trow { white-space: nowrap; }
    html.${ROOT_CLASS}.tt-codex .tt-trow .t-main { display: flex; align-items: baseline; gap: 10px; }
    html.${ROOT_CLASS}.tt-codex .tt-trow .t-meta {
      order: -1; flex: none; width: 76px; margin-top: 0;
      white-space: nowrap; overflow: hidden;
    }
    html.${ROOT_CLASS}.tt-codex .tt-trow .t-meta .t-repl { display: none; }
    html.${ROOT_CLASS}.tt-codex .tt-trow .t-title { flex: 1; }
    html.${ROOT_CLASS}.tt-codex .tt-trow.active { background: var(--tt-bg-raised); }
    html.${ROOT_CLASS}.tt-codex .tt-trow.active .t-title,
    html.${ROOT_CLASS}.tt-codex .tt-trow.active .t-meta,
    html.${ROOT_CLASS}.tt-codex .tt-trow.active .dot,
    html.${ROOT_CLASS}.tt-codex .tt-trow.active .cursor-mark { color: var(--tt-select); }
    html.${ROOT_CLASS}.tt-codex .tt-composer .prompt,
    html.${ROOT_CLASS}.tt-codex .tt-turn.user .who .tag { color: var(--tt-select); }
    .tt-list-status {
      color: var(--tt-text-faint); font-size: 12px; padding: 14px 10px;
      cursor: default;
    }
    .tt-list-status.retry { cursor: pointer; }
    .tt-list-status.retry:hover { color: var(--tt-accent); }
    .tt-list-hint { color: var(--tt-text-faint); font-size: 12px; padding: 14px 10px 0; }
    .tt-list-hint b { color: var(--tt-text-dim); font-weight: 400; }
    /* Codex 底栏：分隔线 + 蓝色按键 */
    html.${ROOT_CLASS}.tt-codex .tt-list-hint {
      margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--tt-border-soft);
    }
    html.${ROOT_CLASS}.tt-codex .tt-list-hint b { color: var(--tt-accent); }

    /* ---------- 详情屏 ---------- */
    #tt-view-detail { display: none; }
    .tt-app[data-view="detail"] #tt-view-detail { display: block; }
    .tt-app[data-view="detail"] #tt-view-list { display: none; }
    .tt-backline { color: var(--tt-text-dim); font-size: 12px; padding: 8px 0 2px; }
    .tt-backline a { color: var(--tt-text-dim); cursor: pointer; }
    .tt-backline a:hover { color: var(--tt-accent); text-decoration: none; }
    .tt-topic-head {
      padding: 4px 0 14px; border-bottom: 1px solid var(--tt-border-soft);
    }
    .tt-topic-head .meta { color: var(--tt-text-dim); font-size: 12px; margin-top: 4px; }
    .tt-topic-head .meta .cat-chip { color: var(--tt-accent); }
    .tt-topic-head .tt-cx-row .meta { margin-top: 0; }
    .tt-topic-head .tt-hub-right .tt-topic-title { margin-top: 2px; }
    /* 话题标题默认模糊（防露馅），hover 头部才清晰 */
    .tt-topic-title {
      margin: 0; font-size: 13px; font-weight: 600; color: var(--tt-text);
      overflow-wrap: anywhere;
      filter: blur(5px); opacity: 0.4; transition: filter 0.15s, opacity 0.15s;
    }
    .tt-topic-head:hover .tt-topic-title { filter: none; opacity: 1; }

    .tt-turn { padding: 16px 0 4px; user-select: text; }
    .tt-post + .tt-post { border-top: 1px solid var(--tt-border-soft); }

    /* 楼主帖 = 用户输入块（与整体边框一致，不单独高亮，避免显眼） */
    .tt-turn.user {
      background: var(--tt-bg-raised);
      border: 1px solid var(--tt-border-soft);
      border-radius: 4px; padding: 10px 14px;
    }
    .tt-turn .who { font-size: 11.5px; color: var(--tt-text-dim); margin-bottom: 6px; }
    .tt-turn.user .who .tag { color: var(--tt-accent); }
    .tt-turn .who .floor { float: right; color: var(--tt-text-faint); }
    /* 楼层 / 用户名默认隐藏（避免露馅），hover 该帖才浮现 */
    .tt-post .who-meta { opacity: 0; transition: opacity 0.12s; }
    .tt-post:hover .who-meta { opacity: 1; }
    /* who 行整体（含 ⏺/❯ 标记）平时收起不占行，hover 才展开 */
    .tt-post .who {
      opacity: 0; max-height: 0; margin-bottom: 0; overflow: hidden;
      transition: opacity 0.12s;
    }
    .tt-post:hover .who { opacity: 1; max-height: 2em; margin-bottom: 6px; }

    /* 假英文思考块 */
    .tt-thinking { margin: 2px 0 10px; }
    .tt-thinking .th-head {
      color: var(--tt-text-dim); font-size: 12px; cursor: pointer;
      display: inline-flex; align-items: center; gap: 6px;
      padding: 1px 4px; margin-left: -4px; border-radius: 3px;
      user-select: none;
    }
    .tt-thinking .th-head:hover { background: var(--tt-bg-raised); color: var(--tt-text-secondary); }
    .tt-thinking .th-head .spin { color: var(--tt-accent); }
    .tt-thinking .th-head .th-hint { color: var(--tt-text-faint); }
    .tt-thinking .th-head .chev { font-size: 10px; }
    .tt-thinking .th-body {
      display: none; color: var(--tt-gray);
      font-style: italic; font-size: 12.5px;
      padding: 6px 0 2px 22px;
      border-left: 2px solid var(--tt-border-soft);
      margin: 4px 0 0 2px;
      white-space: pre-wrap;
    }
    .tt-thinking.open .th-body { display: block; }
    .tt-thinking.open .th-head .chev::after { content: "▾"; }
    .tt-thinking:not(.open) .th-head .chev::after { content: "▸"; }

    /* 工具调用卡片 */
    .tt-tool { margin: 8px 0 10px; font-size: 12.5px; }
    .tt-tool .tl-cmd { color: var(--tt-text); overflow-wrap: anywhere; }
    .tt-tool .tl-cmd .mark { color: var(--tt-accent); }
    .tt-tool .tl-cmd .tool-name { color: var(--tt-blue); font-weight: 600; }
    .tt-tool .tl-cmd .tool-args { color: var(--tt-text-secondary); }
    .tt-tool .tl-cmd .tool-args .s { color: var(--tt-green); }
    .tt-tool .tl-out { display: flex; gap: 8px; padding-left: 20px; margin-top: 2px; color: var(--tt-text-dim); }
    .tt-tool .tl-out .lm { color: var(--tt-text-faint); }
    .tt-tool .tl-out.ok .res { color: var(--tt-green); }
    /* Edit 工具的假 diff 块：行号 + -/+ 列 + 红删绿增（仿真实 CC Update 渲染） */
    .tt-diff {
      margin: 3px 0 4px 28px; font-size: 12px; line-height: 1.5;
      overflow-x: auto; user-select: text;
    }
    .tt-diff .dl { display: flex; gap: 8px; padding: 0 10px 0 4px; white-space: pre; }
    .tt-diff .dl .no {
      flex: none; width: 38px; text-align: right;
      color: var(--tt-text-faint); user-select: none;
    }
    .tt-diff .dl .sg { flex: none; width: 10px; color: var(--tt-text-faint); }
    .tt-diff .dl .tx { color: var(--tt-text-secondary); }
    .tt-diff .dl.del { background: rgba(215, 76, 76, 0.14); }
    .tt-diff .dl.del .no, .tt-diff .dl.del .sg { color: rgba(224, 122, 117, 0.9); }
    .tt-diff .dl.del .tx { color: rgba(238, 166, 162, 0.95); }
    .tt-diff .dl.add { background: rgba(86, 166, 92, 0.13); }
    .tt-diff .dl.add .no, .tt-diff .dl.add .sg { color: rgba(127, 196, 138, 0.9); }
    .tt-diff .dl.add .tx { color: rgba(168, 218, 174, 0.95); }
    .tt-tool .tl-out.muted .res { color: var(--tt-text-dim); font-style: italic; }
    /* codex 变体：• 动词 + └ 输出树，颜色更素 */
    .tt-tool.codex .tl-cmd .mark { color: var(--tt-text-dim); }
    .tt-tool.codex .tl-cmd .tool-name { color: var(--tt-text); }
    .tt-tool.codex .tl-cmd .tool-args { color: var(--tt-text-dim); }
    .tt-thinking.codex .th-head .spin { color: var(--tt-text-dim); }

    /* 正文 */
    .tt-cooked { color: var(--tt-text); overflow-wrap: break-word; }
    .tt-cooked p { margin: 0 0 10px; }
    /* 图片 → [img] 主题色 token，悬停浮出预览 */
    .tt-emoji { position: relative; display: inline-block; vertical-align: text-bottom; }
    .tt-emoji-tok {
      color: var(--tt-yellow); font-size: 11.5px; background: transparent;
      padding: 0 1px; cursor: default; user-select: none; white-space: nowrap;
    }
    .tt-emoji img {
      position: absolute; left: 0; top: calc(100% + 4px);
      max-width: 160px; max-height: 160px; object-fit: contain; z-index: 30;
      border-radius: 4px; border: 1px solid var(--tt-border-strong);
      background: var(--tt-bg-inset); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      visibility: hidden; opacity: 0; transform: translateY(-4px);
      transition: opacity 0.15s ease, transform 0.15s ease; pointer-events: none;
    }
    .tt-emoji:hover img { visibility: visible; opacity: 1; transform: translateY(0); }
    .tt-imgwrap { position: relative; display: inline-block; }
    .tt-imgtok {
      color: var(--tt-accent); background: var(--tt-accent-dim);
      border: 1px solid var(--tt-accent); border-radius: 3px;
      padding: 0 5px; font-size: 11.5px; cursor: zoom-in; user-select: none;
    }
    .tt-imgwrap img {
      position: absolute; left: 0; top: calc(100% + 4px);
      max-width: min(420px, 58vw); max-height: 300px; object-fit: contain;
      z-index: 20; border-radius: 4px; border: 1px solid var(--tt-border-strong);
      background: var(--tt-bg-inset); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      visibility: hidden; opacity: 0; transform: translateY(-4px);
      transition: opacity 0.15s ease, transform 0.15s ease;
      pointer-events: none;
    }
    .tt-imgwrap:hover img { visibility: visible; opacity: 1; transform: translateY(0); }
    .tt-cooked code {
      background: var(--tt-bg-raised); border: 1px solid var(--tt-border-soft);
      border-radius: 3px; padding: 0 5px; font-size: 12.5px; color: var(--tt-accent);
      font-family: inherit;
    }
    .tt-codeblock {
      background: var(--tt-bg-inset); border: 1px solid var(--tt-border-soft);
      border-radius: 4px; margin: 0 0 12px; overflow: hidden;
    }
    .tt-codeblock .cb-head {
      display: flex; justify-content: space-between; align-items: center;
      padding: 4px 12px; font-size: 11.5px; color: var(--tt-text-faint);
      border-bottom: 1px solid var(--tt-border-soft);
      user-select: none;
    }
    .tt-codeblock .cb-head .lang { color: var(--tt-cyan); }
    .tt-codeblock .cb-head .cb-copy { cursor: pointer; display: inline-flex; gap: 4px; align-items: center; }
    .tt-codeblock .cb-head .cb-copy:hover { color: var(--tt-accent); }
    .tt-codeblock pre {
      margin: 0; padding: 10px 12px; overflow-x: auto;
      font-size: 12.5px; line-height: 1.6; font-family: inherit;
      background: transparent; color: var(--tt-text);
    }
    .tt-codeblock pre code { background: transparent; border: none; padding: 0; color: inherit; }
    .tt-quote-card {
      border: 1px solid var(--tt-border-soft); border-radius: 4px;
      margin: 0 0 12px; overflow: hidden;
      background: var(--tt-bg-raised);
    }
    .tt-quote-card .qc-head {
      display: flex; gap: 6px; align-items: center;
      padding: 4px 10px; font-size: 11.5px; color: var(--tt-text-dim);
      cursor: pointer; user-select: none;
    }
    .tt-quote-card .qc-head:hover { color: var(--tt-text-secondary); }
    .tt-quote-card .qc-head .chev { font-size: 10px; }
    .tt-quote-card .qc-body {
      display: none; padding: 8px 12px; font-size: 12.5px;
      color: var(--tt-text-dim); border-top: 1px solid var(--tt-border-soft);
    }
    .tt-quote-card.open .qc-body { display: block; }
    .tt-quote-card.open .qc-head .chev::after { content: "▾"; }
    .tt-quote-card:not(.open) .qc-head .chev::after { content: "▸"; }

    /* 楼层操作行：悬停所在楼层才展开（不占空白），已点赞保持常显 */
    .tt-ops {
      display: flex; gap: 16px; align-items: center;
      font-size: 12px; color: var(--tt-text-faint);
      user-select: none;
      max-height: 0; opacity: 0; overflow: hidden; padding: 0;
      transition: max-height 0.18s ease, opacity 0.18s ease, padding 0.18s ease;
    }
    .tt-post:hover .tt-ops {
      max-height: 34px; opacity: 1; padding: 6px 0 10px;
    }
    .tt-ops .op { cursor: pointer; }
    .tt-ops .op b { color: var(--tt-text-dim); font-weight: 400; }
    .tt-ops .op:hover { color: var(--tt-accent); }
    .tt-ops .op:hover b { color: var(--tt-accent); }
    .tt-ops .op.liked, .tt-ops .op.liked b { color: var(--tt-red); }
    .tt-ops .done { color: var(--tt-green); }
    .tt-turn-divider {
      text-align: center; color: var(--tt-text-faint); font-size: 11.5px;
      padding: 12px 0 4px;
    }
    .tt-inter {
      text-align: center; color: var(--tt-text-faint); font-size: 11.5px;
      padding: 10px 0 2px; user-select: none;
    }

    /* ---------- 详情流式输出 ---------- */
    .tt-pending { visibility: hidden; }
    .tt-stream-caret {
      display: inline-block; margin: 2px 0;
      color: var(--tt-accent);
      animation: tt-blink 1.1s steps(1) infinite;
    }

    /* ---------- composer ---------- */
    .tt-composer {
      flex: none; width: 100%; box-sizing: border-box;
      padding: 6px 20px 8px; user-select: none;
    }
    .tt-composer .box {
      background: var(--tt-bg-inset);
      border: 1px solid var(--tt-border-strong); border-radius: 5px;
      padding: 8px 12px; cursor: text;
    }
    .tt-composer .box:hover { border-color: var(--tt-accent); }
    .tt-composer .target { display: none; }
    .tt-composer .target.active {
      display: flex; align-items: center; gap: 8px;
      font-size: 11.5px; color: var(--tt-text-dim);
      padding: 2px 0 6px; user-select: none;
    }
    .tt-composer .target .tag { color: var(--tt-accent); }
    .tt-composer .target button {
      border: none; background: none; cursor: pointer;
      color: var(--tt-text-faint); font-size: 13px; padding: 0 2px;
    }
    .tt-composer .target button:hover { color: var(--tt-text); }
    .tt-composer .line1 { display: flex; align-items: flex-start; gap: 8px; }
    .tt-composer .prompt { color: var(--tt-accent); font-weight: 700; line-height: 20px; }
    .tt-composer textarea.input {
      flex: 1; min-width: 0; resize: none; border: none; outline: none;
      background: transparent; color: var(--tt-text);
      font: inherit; font-size: 13px; line-height: 20px; padding: 0;
      max-height: 120px; overflow-y: auto;
    }
    .tt-composer textarea.input::placeholder { color: var(--tt-text-faint); }
    .tt-composer .status {
      min-height: 16px; font-size: 11.5px; color: var(--tt-text-faint);
      padding-top: 4px; user-select: none;
    }
    .tt-composer .status.error { color: var(--tt-red); }
    .tt-composer .status.busy { color: var(--tt-accent); }
    .tt-composer .status.success { color: var(--tt-green); }
    .tt-composer .hints {
      display: flex; gap: 16px; flex-wrap: wrap;
      font-size: 11.5px; color: var(--tt-text-faint); padding: 5px 2px 0;
    }
    .tt-composer .hints b { color: var(--tt-text-dim); font-weight: 400; }

    /* ---------- status bar ---------- */
    .tt-statusbar {
      flex: none; display: flex; align-items: center;
      height: 24px; font-size: 11.5px;
      background: var(--tt-bg-raised); border-top: 1px solid var(--tt-border-soft);
      color: var(--tt-text-dim); overflow: hidden; white-space: nowrap;
      user-select: none;
    }
    .tt-statusbar .seg {
      padding: 0 10px; height: 100%; display: flex; align-items: center;
      border-right: 1px solid var(--tt-border-soft);
    }
    .tt-statusbar .mode { background: var(--tt-accent); color: #171a24; font-weight: 700; }
    html.tt-codex .tt-statusbar .mode { color: #10202e; }
    .tt-statusbar .route { color: var(--tt-text-secondary); overflow: hidden; text-overflow: ellipsis; }
    .tt-statusbar .spacer { flex: 1; border-right: none; }
    .tt-statusbar .clickable { cursor: pointer; border-right: 1px solid var(--tt-border-soft); }
    .tt-statusbar .clickable:hover { color: var(--tt-accent); }
    .tt-statusbar .unread { color: var(--tt-green); }
    .tt-statusbar .clock { border-left: 1px solid var(--tt-border-soft); }

    /* ---------- 分类 Select 浮层 ---------- */
    .tt-overlay {
      display: none; position: fixed; inset: 0; z-index: 1100;
      background: rgba(6, 8, 9, 0.62);
      align-items: flex-start; justify-content: center;
    }
    .tt-overlay.open { display: flex; }
    /* 快捷键指引（? 唤出） */
    .tt-help {
      display: none; position: fixed; inset: 0; z-index: 1200;
      background: rgba(6, 8, 9, 0.62);
      align-items: flex-start; justify-content: center;
    }
    .tt-help.open { display: flex; }
    .tt-help-box {
      margin-top: 14vh; width: 440px; max-width: 92vw;
      background: var(--tt-bg-raised);
      border: 1px solid var(--tt-border-strong); border-radius: 6px;
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
      padding: 10px 16px 12px; font-size: 12.5px; color: var(--tt-text-secondary);
      user-select: none;
    }
    .tt-help-box .h-title {
      color: var(--tt-text-faint); font-size: 11px; letter-spacing: 0.12em;
      text-transform: uppercase; margin-bottom: 8px;
    }
    .tt-help-box .h-group { color: var(--tt-text-faint); font-size: 11px; margin: 10px 0 3px; }
    .tt-help-box .h-row { display: flex; gap: 12px; padding: 2px 0; }
    .tt-help-box .h-row .k {
      flex: none; width: 108px; color: var(--tt-text); font-weight: 600;
    }
    .tt-help-box .h-row .k b { color: var(--tt-accent); font-weight: 600; }
    .tt-help-box .h-row .d { color: var(--tt-text-dim); }
    .tt-selbox {
      margin-top: 12vh; width: 560px; max-width: 92vw;
      background: var(--tt-bg-raised);
      border: 1px solid var(--tt-border-strong); border-radius: 6px;
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
      padding: 6px 0 8px; max-height: 70vh; overflow-y: auto;
    }
    .tt-selbox .sel-cols { display: flex; align-items: flex-start; }
    .tt-selbox .sel-col { flex: 1; min-width: 0; }
    .tt-selbox .sel-col + .sel-col { border-left: 1px solid var(--tt-border-soft); flex: 1.3; }
    .tt-selbox .sel-title {
      padding: 4px 14px 2px; font-size: 11.5px; color: var(--tt-text-faint);
      letter-spacing: 0.06em; text-transform: uppercase; user-select: none;
    }
    .tt-selbox .sel-path {
      padding: 0 14px 8px; font-size: 12px; color: var(--tt-accent); user-select: none;
    }
    .tt-selbox .sel-path .sep { color: var(--tt-text-faint); padding: 0 2px; }
    .tt-selbox .sel-path .dim { color: var(--tt-text-faint); }
    .tt-selbox .sel-path .root { color: var(--tt-text-faint); }
    .tt-selbox .sel-filter {
      margin: 0 14px 8px; padding: 4px 8px;
      background: var(--tt-bg-inset); border: 1px solid var(--tt-border-strong);
      border-radius: 4px; color: var(--tt-text);
      font-family: inherit; font-size: 12.5px; width: calc(100% - 44px);
      outline: none;
    }
    .tt-sel-item {
      display: flex; align-items: baseline; gap: 10px;
      padding: 3px 14px; cursor: pointer; position: relative;
      white-space: nowrap;
    }
    .tt-sel-item .cursor-mark { color: var(--tt-accent); font-weight: 700; visibility: hidden; }
    .tt-sel-item.active { background: var(--tt-accent-dim); }
    .tt-sel-item.active .cursor-mark { visibility: visible; }
    .tt-sel-item .slug { color: var(--tt-text); min-width: 104px; overflow: hidden; text-overflow: ellipsis; }
    .tt-sel-item.active .slug { color: var(--tt-accent); }
    .tt-sel-item.act .slug { color: var(--tt-green); }
    .tt-sel-item.act.active .slug { color: var(--tt-accent); }
    .tt-sel-item .cn { color: var(--tt-text-dim); font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
    .tt-sel-item.sub { padding-left: 34px; }
    .tt-sel-item.sub .slug { color: var(--tt-cyan); }
    .tt-sel-sep {
      padding: 6px 14px 2px; font-size: 11px; color: var(--tt-text-faint);
      letter-spacing: 0.06em; user-select: none;
    }
    .tt-sel-hint {
      position: sticky; bottom: 0;
      padding: 8px 14px 2px; font-size: 11.5px; color: var(--tt-text-faint);
      border-top: 1px solid var(--tt-border-soft); margin-top: 6px;
      background: var(--tt-bg-raised); user-select: none;
    }
    .tt-sel-hint b { color: var(--tt-text-dim); font-weight: 400; }

    /* ---------- 原生视图回跳按钮（native 模式 html 无 tt-tui-theme，变量未定义，需给固定回退值） ---------- */
    .tt-restore {
      position: fixed; right: 16px; bottom: 40px; z-index: 950;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 12px; line-height: 1;
      color: #d6dbe5; background: #1f1f24;
      border: 1px solid #3a3a42; border-radius: 6px;
      padding: 8px 14px; cursor: pointer;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
    .tt-restore:hover { color: #b2b9f9; border-color: #b2b9f9; }

    @media (max-width: 720px) {
      .tt-topbar { padding: 10px 14px 6px; }
      .tt-main { padding: 8px 14px 20px; }
      .tt-trow .t-meta { display: none; }
      .tt-win-title { display: none; }
      .tt-hub-logo { font-size: 10px; }
    }
  `;

  /* ============================== splash（仿真实启动画面） ============================== */

  /** Claude Code 真实首屏：╭─ Claude Code vX ─╮ 边框盒，左 logo+Welcome back，右 Tips / What's new */
  const CC_TIPS = [
    `Run <b>/init</b> to create a CLAUDE.md file with instructions for Claude`,
    `Run <b>/doctor</b> to diagnose common setup issues`,
    `Press <b>?</b> to see all available keyboard shortcuts`,
    `Use <b>/rewind</b> to resume from an earlier point in the conversation`,
    `Run <b>/status</b> to see your current model and account info`
  ];
  const CC_NEWS = [
    `Added <b>/rewind</b> support for resuming a conversation from before <b>/clear</b> was run`,
    `Fixed scroll position jumping to the bottom while reading earlier output during a streaming response`,
    `Fixed background agents resurrecting after being stopped — stopping an agent from the tasks panel is now permanent`,
    `Added session hub: see awaiting input, working, and completed sessions at a glance`,
    `Improved diff rendering for multi-file edits`
  ];

  function claudeSplashHtml() {
    const cwd = "~/linux.do";
    const daySeed = Math.floor(Date.now() / 86400000);
    const rnd = mulberry32(daySeed);
    const tip = CC_TIPS[daySeed % CC_TIPS.length];
    const n1 = Math.floor(rnd() * CC_NEWS.length);
    const n2 = (n1 + 1 + Math.floor(rnd() * (CC_NEWS.length - 1))) % CC_NEWS.length;
    // 会话计数用真实列表数据：awaiting input = 有未读的帖，completed = 已读
    let stats = "";
    if (listState.topics.length) {
      const awaiting = listState.topics.filter((t) => topicUnread(t) > 0).length;
      const done = listState.topics.length - awaiting;
      stats = `<div class="tt-hub-stats"><b>${awaiting}</b> awaiting input · <b>0</b> working · <b>${done}</b> completed</div>`;
    }
    const sess = recentSessions().slice(0, 4).map((s) =>
      `<div class="tt-hub-sess"><span class="g">✻</span><span class="t">${escapeHtml(s.t)}</span><span class="at">${escapeHtml(formatTime(new Date(s.at).toISOString()))}</span></div>`
    ).join("");
    // 假更新横幅：按天播种，约一半概率出现，版本号随日期漂移（英文混淆素材）
    const update = rnd() < 0.5
      ? `<div class="tt-hub-update">✻ Update available: v2.1.${238 + Math.floor(rnd() * 9)} · run <span class="cmd">claude update</span></div>`
      : "";
    return `
      <div class="tt-hub">
        <div class="tt-hub-cap"><span class="ln"></span><span>Claude Code v2.1.238</span><span class="ln"></span></div>
        <div class="tt-hub-box">
          <div class="tt-hub-cols">
            <div class="tt-hub-left">
              <pre class="tt-hub-logo">▐▛███▜▐▌
▝▜█████▛▘
 ▘▘ ▝▝</pre>
              <div class="tt-hub-welcome">Welcome back!</div>
              <div class="tt-hub-sub">Opus 5 · API Usage Billing<br>${escapeHtml(cwd)}</div>
            </div>
            <div class="tt-hub-right">
              <div class="tt-hub-h">Tips for getting started</div>
              <div class="tt-hub-line">${tip}</div>
              <div class="tt-hub-divider"></div>
              <div class="tt-hub-h">What's new</div>
              <div class="tt-hub-line">${CC_NEWS[n1]}</div>
              <div class="tt-hub-line">${CC_NEWS[n2]}</div>
              <div class="tt-hub-more">/release-notes for more</div>
            </div>
          </div>
        </div>
        ${stats}
        ${sess}
        ${update}
      </div>`;
  }

  // codex 启动 tip：按天轮换（真实 codex 就是轮换制；避免写死日期穿帮）
  const CODEX_TIPS = [
    `New Try the <b>Codex App</b> — chatgpt.com/codex`,
    `Run <b>/status</b> to see token usage and rate limits`,
    `Use <b>/model</b> to switch reasoning effort`,
    `Press <b>shift+tab</b> to cycle permission modes`,
    `Run <b>/review</b> to have Codex review your changes`
  ];

  function codexSplashHtml() {
    const cwd = "~/linux.do";
    const tip = CODEX_TIPS[Math.floor(Date.now() / 86400000) % CODEX_TIPS.length];
    return `
      <div class="term-line"><b>${escapeHtml(getCurrentUsername() || "user")}@mac</b> ~ % codex</div>
      <div class="tt-cx-box">
        <div class="tt-cx-head"><span class="gt">&gt;_</span>OpenAI Codex <span class="ver">(v0.149.0)</span></div>
        <div class="tt-cx-row"><span class="lbl">directory:</span><span>${escapeHtml(cwd)}</span></div>
        <div class="tt-cx-row"><span class="lbl">permissions:</span><span>workspace-write</span></div>
        <div class="tt-cx-row"><span class="lbl">model:</span><span>gpt-5.6-sol high</span><span class="cmd">/model</span><span>to change</span></div>
      </div>
      <div class="tt-cx-tip"><b>Tip:</b> ${tip}</div>`;
  }

  function splashHtml() {
    return currentVariant() === "codex" ? codexSplashHtml() : claudeSplashHtml();
  }

  /* ============================== 假思考 / 工具调用素材池 ============================== */

  // Claude Code 真实思考动词表（提取自 2.1.238 二进制）：[进行式, 过去式]
  const THINK_VERBS = [
    ["Baking", "Baked"], ["Brewing", "Brewed"], ["Churning", "Churned"],
    ["Cogitating", "Cogitated"], ["Contemplating", "Contemplated"],
    ["Deliberating", "Deliberated"], ["Envisioning", "Envisioned"],
    ["Forging", "Forged"], ["Hatching", "Hatched"], ["Mulling", "Mulled"],
    ["Musing", "Mused"], ["Noodling", "Noodled"], ["Percolating", "Percolated"],
    ["Pondering", "Pondered"], ["Puzzling", "Puzzled"], ["Ruminating", "Ruminated"],
    ["Simmering", "Simmered"], ["Stewing", "Stewed"], ["Synthesizing", "Synthesized"],
    ["Thinking", "Thought"], ["Whirring", "Whirred"]
  ];

  const THINK_OPENERS = [
    "Okay, let me think through this properly.",
    "Alright, reading the post again — the claim hinges on one assumption.",
    "So the question is essentially about trade-offs, not correctness.",
    "Hmm, this is more subtle than it first looks.",
    "The framing is plausible but incomplete — let me reason about why.",
    "Let me unpack what's actually being claimed here before reacting.",
    "Interesting — the symptom and the cause are probably two different things.",
    "Before agreeing, I want to check the failure mode this implies.",
  ];
  const THINK_MIDS = [
    "The most likely explanation is resource contention, not the code path itself.",
    "If the numbers hold under a controlled benchmark, the conclusion is solid; if not, it's measurement noise.",
    "There are two ways to verify this: profile it under load, or bisect the change.",
    "I should distinguish between what the author measured and what they inferred.",
    "The failure mode only shows up under load, which is exactly why it's easy to miss.",
    "Correlation is doing a lot of work in that argument — worth pointing out gently.",
    "The simple approach probably wins here; the clever one just moves the complexity.",
    "Backwards compatibility matters more than elegance in this specific case.",
    "Queueing delay would explain the tail latency better than throughput.",
    "The connection pooling detail probably matters more than the language choice.",
    "Caching is the obvious lever, but it only helps if the read path is actually hot.",
    "The version pin matters here — half of these reports turn out to be a dependency bump.",
    "This smells like an ordering problem: the cleanup runs before the flush.",
    "In practice the config default wins; nobody reads the docs that deeply.",
    "A single metric won't settle this — I'd want p50 and p99 side by side.",
    "The author's fix works, but it trades one race condition for a subtler one.",
  ];
  const THINK_CLOSERS = [
    "Let me structure the reply around the one number that matters.",
    "I'll keep it short and ask the question that actually needs answering.",
    "I should avoid sounding dismissive — the work is genuinely good.",
    "Okay, writing it out step by step is the right move here.",
    "One concrete suggestion beats three abstract ones. Going with that.",
    "I'll agree with the direction, then flag the one thing that could bite later.",
    "Better to leave a question than a lecture — keeping the reply to two points.",
    "Let me lead with the concrete number, then the caveat.",
  ];

  const TOOL_FILES = [
    "src/auth/session.ts", "src/gateway/proxy.rs", "internal/cache/lru.go",
    "config/production.yaml", "lib/scheduler.js", "app/models/user.rb",
    "services/queue/worker.ex", "cmd/server/main.go", "bench/plan.md",
    "deploy/k8s/ingress.yaml", "src/render/pipeline.wgsl",
    "migrations/0042_add_index.sql"
  ];
  // Edit 工具的假 diff 素材：上下文行 + [删除行, 新增行] 对
  const DIFF_CTX = [
    "const kids = [...cooked.children];",
    "if (!kids.length) return;",
    "el.insertAdjacentElement(\"afterend\", node);",
    "kids.splice(at, 0, el);",
    "const used = new Set();",
    "for (let k = 0; k < n; k++) {",
    "return rows.filter((r) => r.visible);",
    "await loadList(nextPath, true);",
    "box.querySelector(\".active\")?.scrollIntoView();",
    "threadState.loading = false;",
    "renderTurns(box, posts, \"replace\");",
    "const at = Math.max(0, Math.min(i, kids.length));"
  ];
  const DIFF_PAIRS = [
    ["if (rnd() < 0.3) return;  // skip a third", "if (rnd() < 0.72) return;  // keep most rows plain"],
    ["const n = 1 + Math.floor(rnd() * 3);", "const n = rnd() < 0.22 ? 2 : 1;"],
    ["if (cache.has(key)) return cache.get(key);", "if (cache.has(key)) { hits++; return cache.get(key); }"],
    ["retry(3, () => fetchJson(url));", "retry(5, () => fetchJson(url), { backoff: 2 });"],
    ["const timeout = 3000;", "const timeout = opts.timeout ?? 5000;"],
    ["stream.push(chunk);", "if (!stream.closed) stream.push(chunk);"],
    ["return null;", "return rows.length ? rows[0] : null;"],
    ["el.classList.add(\"open\");", "el.classList.toggle(\"open\", force);"]
  ];
  const TOOL_CMDS = [
    "npm test -- --filter=auth", "cargo test --release", "go vet ./...",
    "make lint", "kubectl get pods -n prod", "docker compose up -d",
    "wrk -t4 -c256 --latency", "git diff --stat", "pytest -q tests/cache",
    "systemctl status nginx", "curl -sS -o /dev/null -w %{time_total} /healthz"
  ];
  const TOOL_GREPS = [
    "keep-alive|pool_max", "TODO|FIXME", "retry_with_backoff", "func (s *Server)",
    "SECRET_KEY", "timeout_ms", "X-Request-Id", "pool_size ="
  ];
  const TOOL_DOMAINS = [
    "github.com", "arxiv.org", "developer.mozilla.org",
    "news.ycombinator.com", "stackoverflow.com", "pkg.go.dev"
  ];
  const TOOL_QUERIES = [
    "discourse post_stream api", "ember runloop debounce", "http2 stream reset",
    "postgres index only scan", "tokio spawn_blocking", "react concurrent flushSync",
    "css containment performance", "grpc deadline exceeded"
  ];

  /** 楼层装饰：按 (topicId, postId) 播种，稳定随机；大多数楼层保持素净 */
  function decorationForPost(post) {
    const pid = Number(post.id || post.post_number || 1);
    const rnd = mulberry32(((pid * 2654435761) ^ (threadState.topicId || 0)) >>> 0);
    const roll = rnd();
    if (roll < 0.30) return null; // 少数楼层素净

    const parts = { thinking: null, tools: [] };
    if (rnd() < 0.88) { // 装饰楼层绝大多数带英文思考
      const secs = 3 + Math.floor(rnd() * 57);
      const sentences = [THINK_OPENERS[Math.floor(rnd() * THINK_OPENERS.length)]];
      const midCount = 3 + Math.floor(rnd() * 4); // 3-6 句
      const used = new Set();
      for (let i = 0; i < midCount; i++) {
        let k = Math.floor(rnd() * THINK_MIDS.length);
        if (used.has(k)) k = (k + 5) % THINK_MIDS.length;
        used.add(k);
        sentences.push(THINK_MIDS[k]);
      }
      sentences.push(THINK_CLOSERS[Math.floor(rnd() * THINK_CLOSERS.length)]);
      // 四成概率拆成两段，更像真实思考流
      let text = sentences.join(" ");
      if (sentences.length >= 6 && rnd() < 0.4) {
        const cut = 2 + Math.floor(rnd() * (sentences.length - 4));
        text = sentences.slice(0, cut).join(" ") + "\n\n" + sentences.slice(cut).join(" ");
      }
      const verb = THINK_VERBS[Math.floor(rnd() * THINK_VERBS.length)];
      parts.thinking = { secs, text, verb: verb[1] };
    }

    if (rnd() < 0.8) { // 装饰楼层八成带工具调用
      const n = (lo, hi) => lo + Math.floor(rnd() * (hi - lo));
      const pick = (pool) => pool[Math.floor(rnd() * pool.length)];
      const makeTool = () => {
        const kind = rnd();
        if (kind < 0.30) {
          const f = pick(TOOL_FILES);
          return { name: "Read", verb: "Read", raw: f,
            arg: `(<span class="s">${f}</span>)`,
            out: `Read ${n(20, 240)} lines (ctrl+o to expand)`, ok: false };
        }
        if (kind < 0.55) {
          const c = pick(TOOL_CMDS);
          return { name: "Bash", verb: "Ran", raw: `bash -lc "${c}"`,
            arg: `(<span class="s">${c}</span>)`,
            out: `✓ ${n(3, 180)} passed · 0 failed in ${(1 + rnd() * 40).toFixed(1)}s`, ok: true };
        }
        if (kind < 0.75) {
          const g = pick(TOOL_GREPS);
          return { name: "Grep", verb: "Explored", raw: `grep -rE "${g}" src/`,
            arg: `(<span class="s">${g}</span>, <span class="s">src/</span>)`,
            out: `${n(1, 24)} matches, ${n(1, 5)} files (ctrl+o to expand)`, ok: false };
        }
        if (kind < 0.88) {
          const f = pick(TOOL_FILES);
          // 仿真实 CC 的 Update diff：上下文行 + 红删绿增，行号新旧两列推进
          const pn = n(1, 3);
          const usedP = new Set();
          const pairs = [];
          for (let i = 0; i < pn; i++) {
            let p = Math.floor(rnd() * DIFF_PAIRS.length);
            if (usedP.has(p)) p = (p + 3) % DIFF_PAIRS.length;
            usedP.add(p);
            pairs.push(DIFF_PAIRS[p]);
          }
          const rows = [];
          let oldNo = n(60, 3800), newNo = oldNo;
          const ctx = () => {
            rows.push({ t: "ctx", no: newNo, text: pick(DIFF_CTX) });
            oldNo++; newNo++;
          };
          ctx(); ctx();
          for (const [del, add] of pairs) {
            rows.push({ t: "del", no: oldNo++, text: del });
            rows.push({ t: "add", no: newNo++, text: add });
          }
          ctx(); ctx();
          const a = pairs.length;
          return { name: "Edit", verb: "Edited", raw: f,
            arg: `(<span class="s">${f}</span>)`,
            out: `Added ${a} ${a > 1 ? "lines" : "line"}, removed ${a} ${a > 1 ? "lines" : "line"}`,
            ok: false, diff: rows };
        }
        if (kind < 0.93) {
          const f = pick(TOOL_FILES);
          return { name: "Write", verb: "Wrote", raw: f,
            arg: `(<span class="s">${f}</span>)`,
            out: `Wrote ${n(10, 160)} lines to ${f}`, ok: false };
        }
        if (kind < 0.97) {
          const d = pick(TOOL_DOMAINS);
          return { name: "WebFetch", verb: "Fetched", raw: `https://${d}`,
            arg: `(<span class="s">https://${d}/…</span>)`,
            out: `Fetched ${n(4, 60)}KB · summarized key points`, ok: false };
        }
        const q = pick(TOOL_QUERIES);
        return { name: "WebSearch", verb: "Searched", raw: q,
          arg: `(<span class="s">"${q}"</span>)`,
          out: `${n(3, 10)} results · top hit: ${pick(TOOL_DOMAINS)}`, ok: false };
      };
      parts.tools.push(makeTool());
      if (rnd() < 0.35) parts.tools.push(makeTool()); // 三成半楼层连打两组工具
    }
    if (!parts.thinking && !parts.tools.length) return null;
    return parts;
  }

  /* ============================== favicon（canvas 生成 ❯_ ） ============================== */

  function makeFaviconUri() {
    const canvas = document.createElement("canvas");
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    const codex = currentVariant() === "codex";
    ctx.fillStyle = codex ? "#181818" : "#17171a";
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = codex ? "#83c3fe" : "#b2b9f9";
    ctx.font = "bold 38px ui-monospace, Menlo, monospace";
    ctx.textBaseline = "middle";
    ctx.fillText("❯_", 8, 36);
    return canvas.toDataURL("image/png");
  }

  let faviconObserver = null;
  let faviconApplying = false;
  const faviconHrefCache = {};

  function makeFavicon() {
    const head = document.head;
    if (!head || faviconApplying) return;
    faviconApplying = true;
    try {
      // canvas 生成昂贵（rAF 高频调用），按变体缓存 data URI
      const v = currentVariant();
      const href = faviconHrefCache[v] || (faviconHrefCache[v] = makeFaviconUri());
      if (!href) return;
      const icons = head.querySelectorAll(
        "link[rel='icon'], link[rel='shortcut icon'], link[rel~='icon'], link[rel='apple-touch-icon'], link[rel='apple-touch-icon-precomposed'], link[rel='mask-icon']"
      );
      for (const icon of icons) {
        if (icon.id && icon.id !== FAVICON_ID) icon.removeAttribute("id");
        if (icon.getAttribute("href") !== href) icon.setAttribute("href", href);
        if (icon.rel === "mask-icon") continue;
        if (icon.getAttribute("type") !== "image/png") icon.setAttribute("type", "image/png");
        if (!icon.getAttribute("sizes")) icon.setAttribute("sizes", "any");
      }
      let link = document.getElementById(FAVICON_ID);
      if (!link) {
        link = document.createElement("link");
        link.id = FAVICON_ID;
        link.rel = "icon";
        link.type = "image/png";
        link.sizes = "any";
        link.setAttribute("href", href);
        head.appendChild(link);
      } else if (link.getAttribute("href") !== href) {
        link.setAttribute("href", href);
      }
      if (!faviconObserver) {
        faviconObserver = new MutationObserver(() => {
          if (faviconApplying) return;
          makeFavicon();
        });
        faviconObserver.observe(head, {
          childList: true, subtree: true, attributes: true,
          attributeFilter: ["href", "rel", "type", "sizes"]
        });
      }
    } finally {
      faviconApplying = false;
    }
  }

  /* ============================== Ember / composer 调用链（移植自 codex 脚本） ============================== */

  function discourseRequire(moduleId) {
    try {
      if (typeof window.require === "function") return window.require(moduleId);
    } catch { /* module missing */ }
    return null;
  }

  function safeLookup(owner, key) {
    if (!owner || typeof owner.lookup !== "function") return null;
    try {
      return owner.lookup(key);
    } catch {
      return null;
    }
  }

  function getEmberOwner() {
    try {
      if (window.Discourse?.__container__) return window.Discourse.__container__;
      const Ember = window.Ember;
      const namespaces = Ember?.Namespace?.NAMESPACES;
      if (Array.isArray(namespaces)) {
        const app = namespaces.find((n) =>
          n && (n.name === "Discourse" || n.modulePrefix === "discourse" || n.NAMESPACE === "Discourse")
        );
        if (app?.__container__) return app.__container__;
        if (typeof app?.lookup === "function") return app;
      }
      const mod =
        discourseRequire("discourse-common/lib/get-owner") ||
        discourseRequire("discourse/lib/get-owner");
      if (mod) {
        const owner =
          (typeof mod.getOwnerWithFallback === "function" && mod.getOwnerWithFallback(window.Discourse)) ||
          (typeof mod.getOwner === "function" && mod.getOwner(window.Discourse)) ||
          null;
        if (owner) return owner;
      }
      try {
        const appMod = discourseRequire("discourse/app");
        const app = appMod?.default || appMod;
        if (app?.__container__) return app.__container__;
        if (typeof app?.lookup === "function") return app;
      } catch { /* ignore */ }
    } catch (err) {
      console.warn("[linuxdo-terminal] getEmberOwner failed", err);
    }
    return null;
  }

  function getComposerService(owner) {
    return safeLookup(owner, "service:composer") || safeLookup(owner, "controller:composer");
  }

  function getTopicModel(owner) {
    const topicController = safeLookup(owner, "controller:topic");
    if (!topicController) return null;
    try {
      return topicController.get?.("model") || topicController.model || null;
    } catch {
      return null;
    }
  }

  function findLoadedPost(topic, postNumber) {
    if (!topic || !postNumber) return null;
    try {
      const stream = topic.get?.("postStream") || topic.postStream;
      const posts = stream?.get?.("posts") || stream?.posts || [];
      return [...posts].find((p) =>
        Number(p?.get?.("post_number") ?? p?.post_number) === Number(postNumber)
      ) || null;
    } catch { /* ignore */ }
    return null;
  }

  function isComposerOpen() {
    const el = document.querySelector("#reply-control");
    return !!(el && (el.classList.contains("open") || el.classList.contains("fullscreen") || el.classList.contains("edit-title")));
  }

  function closeNativeComposer() {
    try {
      const svc = getComposerService(getEmberOwner());
      if (svc && typeof svc.close === "function") { svc.close(); return; }
    } catch { /* fall through */ }
    document.querySelector("#reply-control .cancel, #reply-control button.close")?.click?.();
  }

  /** 点击原生输入面板以外区域时收起它（皮肤自己的 composer 入口除外） */
  function bindOutsideCloseComposer() {
    if (window.__ttOutsideCloseBound) return;
    window.__ttOutsideCloseBound = true;
    document.addEventListener("pointerdown", (e) => {
      const rc = document.getElementById("reply-control");
      if (!rc || !isComposerOpen()) return;
      const t = e.target instanceof Element ? e.target : null;
      if (!t || rc.contains(t) || t.closest(".tt-composer")) return;
      closeNativeComposer();
    }, true);
  }

  function openComposerViaService(postNumber) {
    const owner = getEmberOwner();
    if (!owner) return false;
    const composer = getComposerService(owner);
    if (!composer) return false;
    const topic = getTopicModel(owner);
    const Composer = discourseRequire("discourse/models/composer");
    const REPLY = Composer?.REPLY || Composer?.default?.REPLY || "reply";

    try {
      if (postNumber) {
        const post = findLoadedPost(topic, postNumber);
        if (post && typeof composer.replyTo === "function") {
          composer.replyTo(post);
          return true;
        }
        if (post && typeof composer.open === "function") {
          composer.open({
            action: REPLY,
            post,
            draftKey: topic?.get?.("draft_key") || topic?.draft_key || `topic_${threadState.topicId}`,
            draftSequence: topic?.get?.("draft_sequence") ?? topic?.draft_sequence
          });
          return true;
        }
      }

      if (topic && typeof composer.replyToTopic === "function") {
        composer.replyToTopic(REPLY, topic);
        return true;
      }
      if (topic && typeof composer.open === "function") {
        composer.open({
          action: REPLY,
          topic,
          draftKey: topic.get?.("draft_key") || topic.draft_key || `topic_${threadState.topicId}`,
          draftSequence: topic.get?.("draft_sequence") ?? topic.draft_sequence,
          title: topic.get?.("title") || topic.title,
          categoryId: topic.get?.("category_id") || topic.category_id
        });
        return true;
      }
    } catch (err) {
      console.warn("[linuxdo-terminal] composer service open failed", err);
    }
    return false;
  }

  function clickNativeReplyButton() {
    // 兜底：点话题底部「回复」按钮（被视觉隐藏但可点击）
    const selectors = [
      "#topic-footer-buttons button.create",
      ".topic-footer-main-buttons button.create",
      "button.btn-primary.create.reply",
      "button.create.reply"
    ];
    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (!btn || btn.id === "create-topic" || btn.closest(".d-header")) continue;
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      return true;
    }
    return false;
  }

  /** 打开 Discourse 原生 composer（service 优先，按钮兜底） */
  function openNativeComposer(postNumber) {
    try {
      if (isComposerOpen()) {
        const ta = document.querySelector("#reply-control.open textarea, #reply-control.fullscreen textarea");
        ta?.focus?.();
        return true;
      }
      let opened = false;
      try { opened = !!openComposerViaService(postNumber); } catch { /* fall through */ }
      if (!opened) {
        try { opened = !!clickNativeReplyButton(); } catch { /* fall through */ }
      }
      if (!opened) console.warn("[linuxdo-terminal] openNativeComposer failed");
      return opened;
    } catch (err) {
      console.warn("[linuxdo-terminal] openNativeComposer crashed", err);
      return false;
    }
  }

  /** 打开「新话题」composer（列表视图；尽量预填当前分类） */
  function openNewTopicComposer(preferredCategoryId) {
    try {
      if (isComposerOpen()) {
        const ta = document.querySelector("#reply-control.open textarea, #reply-control.fullscreen textarea");
        ta?.focus?.();
        return true;
      }
      const owner = getEmberOwner();
      const composer = getComposerService(owner);
      const Composer = discourseRequire("discourse/models/composer");
      const CREATE = Composer?.CREATE_TOPIC || Composer?.default?.CREATE_TOPIC || "createTopic";
      const draftKey = Composer?.NEW_TOPIC_KEY || Composer?.default?.NEW_TOPIC_KEY || "new_topic";
      const categoryId = preferredCategoryId || categoryIdFromPath(location.pathname);
      if (composer && typeof composer.open === "function") {
        composer.open({
          action: CREATE,
          draftKey,
          draftSequence: 0,
          ...(categoryId ? { categoryId } : {})
        });
        return true;
      }
    } catch (err) {
      console.warn("[linuxdo-terminal] openNewTopicComposer failed", err);
    }
    try {
      const btn = document.querySelector("#create-topic");
      if (btn) {
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        return true;
      }
    } catch { /* ignore */ }
    return false;
  }

  /* ============================== 分类数据 + 拼音 ============================== */

  let categoriesCache = null;

  async function loadCategories() {
    if (categoriesCache) return categoriesCache;
    try {
      const data = await api("/categories.json");
      categoriesCache = (data.category_list && data.category_list.categories) || [];
    } catch {
      // API 失败（匿名被 CF 拦截等）时回退到页面预加载的 site 数据
      categoriesCache = readPreloadedCategories();
    }
    return categoriesCache;
  }

  function readPreloadedCategories() {
    try {
      const el = document.getElementById("data-preloaded");
      const raw = el && (el.getAttribute("data-preloaded") || el.textContent);
      if (!raw) return [];
      const data = JSON.parse(raw);
      for (const key of Object.keys(data || {})) {
        if (!/site/i.test(key)) continue;
        const site = typeof data[key] === "string" ? JSON.parse(data[key]) : data[key];
        if (site && Array.isArray(site.categories) && site.categories.length) {
          return site.categories;
        }
      }
    } catch { /* ignore */ }
    return [];
  }

  function categoryById(id) {
    return (categoriesCache || []).find((c) => c.id === id) || null;
  }

  function categoryBySlug(slug) {
    const s = String(slug || "").toLowerCase();
    return (categoriesCache || []).find((c) => String(c.slug).toLowerCase() === s) || null;
  }

  function categoryIdFromPath(pathname) {
    const idM = pathname.match(/^\/c\/[\w-]+(?:\/[\w-]+)?\/(\d+)/);
    if (idM) return Number(idM[1]);
    const c = pathname.match(/^\/c\/([\w-]+)/);
    if (c) {
      const cat = categoryBySlug(c[1]);
      if (cat) return cat.id;
    }
    return null;
  }

  /** 大类中文名 → 拼音 slug 显示表；未收录的退回原 slug */
  const PINYIN_NAMES = {
    "开发调优": "kaifa-tiaoyou",
    "非技术": "fei-jishu",
    "资源荟萃": "ziyuan-huicui",
    "搞七捻三": "gaoqi-niansan",
    "深度探索": "shendu-tansuo",
    "福利羊毛": "fuli-yangmao",
    "前沿快讯": "qianyan-kuaixun",
    "跳蚤市场": "tiaozao-shichang",
    "运营反馈": "yunying-fankui",
    "文档共建": "wendang-gongjian",
    "读书成诗": "dushu-chengshi",
    "扬帆万里": "yangfan-wanli",
    "全站公告": "quanzhan-gonggao",
    "存档": "cundang",
    "外援团": "waiyuantuan",
    "拼车群": "pinchequn"
  };

  function pinyinSlugOf(cat) {
    return PINYIN_NAMES[cat.name] || cat.slug || `cat-${cat.id}`;
  }

  function pinyinSlugForPath(slugInPath) {
    const cat = categoryBySlug(slugInPath);
    return cat ? pinyinSlugOf(cat) : slugInPath;
  }

  /* ============================== 站内软跳转 ============================== */

  function discourseRouteTo(url) {
    if (!url) return false;
    try {
      const mod = discourseRequire("discourse/lib/url");
      const DiscourseURL = mod?.default || mod;
      if (DiscourseURL && typeof DiscourseURL.routeTo === "function") {
        DiscourseURL.routeTo(url);
        return true;
      }
    } catch { /* ignore */ }
    try {
      if (typeof window.Discourse?.URL?.routeTo === "function") {
        window.Discourse.URL.routeTo(url);
        return true;
      }
    } catch { /* ignore */ }
    return false;
  }

  function navigateInApp(url) {
    if (!url) return;
    let path = url;
    try {
      if (/^https?:/i.test(url)) {
        const u = new URL(url, location.origin);
        if (u.origin !== location.origin) { window.open(url, "_blank", "noopener"); return; }
        path = u.pathname + u.search + u.hash;
      }
    } catch { /* keep url */ }
    if (!discourseRouteTo(path)) {
      history.pushState({}, "", path);
    }
    scheduleApply();
  }

  /* ============================== 应用骨架 ============================== */

  let lastListPath = "/latest";

  function ensureApp() {
    let app = document.querySelector(".tt-app");
    if (app) return app;
    app = document.createElement("div");
    app.className = "tt-app";
    app.dataset.view = "list";
    app.innerHTML = `
      <div class="tt-winbar ${IS_MAC ? "mac" : "win"}">
        ${IS_MAC
          ? `<div class="tt-lights"><span class="l red"></span><span class="l yellow"></span><span class="l green"></span></div>`
          : ""}
        <div class="tt-win-title">❯ linux.do — ${SHELL_NAME}</div>
        <div class="tt-launcher">
          <button class="tt-tab" data-variant="claude" title="Claude Code 配色"><span class="g">✻</span>Claude</button>
          <button class="tt-tab" data-variant="codex" title="Codex CLI 配色"><span class="g">⬡</span>Codex</button>
        </div>
        ${IS_MAC
          ? ""
          : `<div class="tt-winbtns"><span class="b min">─</span><span class="b max">▢</span><span class="b close">✕</span></div>`}
      </div>
      <div class="tt-topbar">
        <div class="path"><span class="brand">❯ linux.do</span> / <span class="seg">~</span> / <span class="cat" data-action="categories" title="切换分类"></span></div>
        <div class="user"></div>
      </div>
      <div class="tt-main">
        <section id="tt-view-list">
          <div class="tt-splash"></div>
          <div class="tt-list-head"><span class="title"></span><span class="views"></span><span class="count"></span></div>
          <div class="tt-trows"></div>
        </section>
        <section id="tt-view-detail">
          <div class="tt-backline"><a data-action="back">← ../</a></div>
          <div class="tt-topic-head"></div>
          <div class="tt-posts"></div>
        </section>
      </div>
      <div class="tt-composer">
        <div class="box">
          <div class="target"></div>
          <div class="line1">
            <span class="prompt">❯</span>
            <textarea class="input" rows="1" spellcheck="false" placeholder="reply to thread…"></textarea>
          </div>
          <div class="status"></div>
        </div>
        <div class="hints">
          <span><b>↵</b> send</span><span><b>esc</b> clear</span><span><b>⌘K</b> search</span><span><b>/</b> categories</span>
        </div>
      </div>
      <div class="tt-statusbar">
        <span class="seg mode">TUI</span>
        <span class="seg route"></span>
        <span class="seg spacer"></span>
        <span class="seg clickable unread" data-action="notifications">[·] unread</span>
        <span class="seg clickable" data-action="native-view">native</span>
        <span class="seg clock"></span>
      </div>
      <div class="tt-help">
        <div class="tt-help-box">
          <div class="h-title">Keyboard shortcuts</div>
          <div class="h-row"><span class="k"><b>?</b></span><span class="d">toggle this help</span></div>
          <div class="h-row"><span class="k"><b>⌘K</b></span><span class="d">search</span></div>
          <div class="h-row"><span class="k"><b>/</b></span><span class="d">categories</span></div>
          <div class="h-row"><span class="k"><b>esc</b></span><span class="d">back / close</span></div>
          <div class="h-group">── topic list</div>
          <div class="h-row"><span class="k"><b>↑/k ↓/j</b></span><span class="d">move selection</span></div>
          <div class="h-row"><span class="k"><b>←/h →/l</b></span><span class="d">switch view</span></div>
          <div class="h-row"><span class="k"><b>↵</b></span><span class="d">open topic</span></div>
          <div class="h-group">── thread</div>
          <div class="h-row"><span class="k"><b>j / k</b></span><span class="d">scroll down / up</span></div>
          <div class="h-row"><span class="k"><b>r</b></span><span class="d">focus reply input</span></div>
          <div class="h-row"><span class="k"><b>l</b></span><span class="d">like post</span></div>
          <div class="h-row"><span class="k"><b>c</b></span><span class="d">copy link</span></div>
          <div class="h-group">── categories overlay</div>
          <div class="h-row"><span class="k"><b>↑/k ↓/j</b></span><span class="d">move</span></div>
          <div class="h-row"><span class="k"><b>→/tab</b></span><span class="d">drill to views</span></div>
          <div class="h-row"><span class="k"><b>←/h</b></span><span class="d">back to categories</span></div>
          <div class="h-row"><span class="k"><b>↵</b></span><span class="d">open · type to filter</span></div>
        </div>
      </div>
      <div class="tt-overlay">
        <div class="tt-selbox">
          <div class="sel-title">Select</div>
          <div class="sel-path"><span class="root">❯ linux.do / ~</span> / <span class="dim">?</span></div>
          <input class="sel-filter" placeholder="filter…" spellcheck="false">
          <div class="sel-items"></div>
          <div class="sel-hint tt-sel-hint"><b>↑/k ↓/j</b> move · <b>→/tab</b> drill · <b>←/h</b> back · <b>↵</b> open · <b>esc</b> close</div>
        </div>
      </div>
    `;
    document.body.appendChild(app);
    bindAppEvents(app);
    syncLauncher();
    startClock(app);
    return app;
  }

  function showView(view) {
    const app = ensureApp();
    app.dataset.view = view;
  }

  function syncChrome() {
    const app = ensureApp();
    const pathname = location.pathname;
    const isTopic = isTopicPath(pathname);
    const label = routeLabelForPath(pathname);
    const routeSeg = `~/linux.do${isTopic ? `/t/${threadState.topicId || ""}` : `/${label}`}`;

    app.querySelector(".tt-statusbar .route").textContent = routeSeg;
    const catLabel = isTopic
      ? pinyinSlugOf(categoryById(threadState.categoryId) || { name: "", slug: "topic", id: 0 })
      : label;
    app.querySelector(".tt-topbar .cat").textContent = isTopic ? catLabel : label;
    app.querySelector(".tt-topbar .user").textContent = `${getCurrentUsername() || "guest"}@linux.do`;
    const composeInput = app.querySelector(".tt-composer textarea.input");
    if (composeInput) {
      composeInput.placeholder = isTopic
        ? "reply to thread…   (Enter 发送, Shift+Enter 换行)"
        : currentVariant() === "claude"
          ? "describe a task for a new session"
          : "new topic…";
    }
    const headTitle = app.querySelector(".tt-list-head .title");
    if (headTitle && !isTopic) {
      headTitle.textContent = currentVariant() === "codex"
        ? `resume a previous session · ${label}`
        : `resume session · ${label}`;
    }
    const viewsEl = app.querySelector(".tt-list-head .views");
    if (viewsEl) {
      const cfg = isTopic ? null : listViewsForPath(pathname);
      const html = cfg
        ? cfg.views.map((v) =>
            `<span class="vchip${v.slug === cfg.active ? " on" : ""}" data-action="goto" data-href="${v.href}">${v.slug}</span>`
          ).join("")
        : "";
      // syncChrome 会被 MutationObserver 高频触发：内容没变就不重写，否则 chips 节点反复重建导致点击落空
      if (viewsEl.dataset.html !== html) {
        viewsEl.dataset.html = html;
        viewsEl.innerHTML = html;
      }
    }

    // composer 底部 hints：按变体换真实产品的提示语系（两者都是 "? for shortcuts"）
    const hints = app.querySelector(".tt-composer .hints");
    if (hints) {
      hints.innerHTML = currentVariant() === "codex"
        ? `<span><b>↵</b> open</span><span><b>/</b> categories</span><span><b>shift+tab</b> cycle</span><span><b>?</b> for shortcuts</span>`
        : `<span><b>↵</b> open</span><span><b>/</b> categories</span><span><b>esc</b> back</span><span><b>?</b> for shortcuts</span>`;
    }

    // 用户名异步到位后补写一次
    if (!getCurrentUsername()) {
      setTimeout(() => {
        const u = getCurrentUsername();
        if (u) app.querySelector(".tt-topbar .user").textContent = `${u}@linux.do`;
      }, 1500);
    }
  }

  function startClock(app) {
    const tick = () => {
      const el = app.querySelector(".tt-statusbar .clock");
      if (el) el.textContent = new Date().toTimeString().slice(0, 5);
    };
    tick();
    if (!window.__ttClockTimer) {
      window.__ttClockTimer = setInterval(tick, 15000);
    }
  }

  /* ---------- 未读计数（轻量端点，60s 缓存） ---------- */

  let unreadCount = null;
  let unreadAt = 0;

  async function refreshUnread() {
    if (Date.now() - unreadAt < 60000) return;
    unreadAt = Date.now();
    try {
      const data = await api("/notifications/unread_count.json");
      unreadCount = typeof data === "number" ? data : Number(data.unread_notifications_count || 0);
      const el = document.querySelector(".tt-app .tt-statusbar .unread");
      if (el) el.textContent = `[${unreadCount}] unread`;
    } catch { /* ignore */ }
  }

  /* ============================== 列表视图 ============================== */

  const listState = {
    path: "",
    apiPath: "",
    pendingPath: null, // 加载中被挤掉的下一个目标路由，完成后跟上
    moreUrl: null,
    loading: false,
    failedAt: 0,
    failedPath: "",
    topics: [],
    selIdx: -1
  };

  function topicHref(topic) {
    return `/t/${topic.slug || "topic"}/${topic.id}`;
  }

  function topicUnread(topic) {
    return (topic.unread > 0 ? topic.unread : 0) + (topic.new_posts > 0 ? topic.new_posts : 0);
  }

  function trowHtml(topic) {
    const unread = topicUnread(topic);
    const replies = Math.max(0, (topic.posts_count || 1) - 1);
    const dot = topic.pinned
      ? `<span class="dot pin">▲</span>`
      : `<span class="dot ${unread ? "unread" : "read"}">${unread ? "●" : "○"}</span>`;
    return `
      <div class="tt-trow${unread ? "" : " read"}" data-href="${escapeHtml(topicHref(topic))}" data-topic-id="${topic.id}">
        <span class="cursor-mark">❯</span>${dot}
        <div class="t-main">
          <span class="t-title">${escapeHtml(topic.title)}</span>
          <span class="t-meta"><span class="t-time">${topic.pinned ? "pin" : escapeHtml(formatTime(topic.last_posted_at || topic.created_at))}</span><span class="t-repl"> · <b>${replies}</b> repl</span></span>
        </div>
      </div>`;
  }

  function renderListRows() {
    const box = document.querySelector(".tt-app .tt-trows");
    if (!box) return;
    const rows = listState.topics.map(trowHtml);
    rows.push(
      `<div class="tt-list-status${listState.failedAt ? " retry" : ""}">${
        listState.loading ? "… loading" :
        listState.failedAt ? "load failed · click to retry" :
        listState.moreUrl ? (currentVariant() === "codex" ? "↓ more" : "… scroll for more") :
        (listState.topics.length ? "── end of results ──" : "no topics")
      }</div>` +
      `<div class="tt-list-hint"><b>↑/k ↓/j</b> move · <b>←/h →/l</b> view · <b>↵</b> open · <b>/</b> categories</div>`
    );
    box.innerHTML = rows.join("");
    const count = document.querySelector(".tt-app .tt-list-head .count");
    if (count) count.textContent = listState.topics.length ? `${listState.topics.length} topics` : "";
    paintSelection();
    // 列表数据到位后刷新 splash：awaiting input / completed 计数来自真实未读
    const app = document.querySelector(".tt-app");
    if (app?.dataset.view === "list") {
      const splash = app.querySelector(".tt-splash");
      if (splash) splash.innerHTML = splashHtml();
    }
    syncChrome();
  }

  function paintSelection() {
    const rows = document.querySelectorAll(".tt-app .tt-trow");
    rows.forEach((r, i) => r.classList.toggle("active", i === listState.selIdx));
  }

  function moveSelection(delta) {
    const rows = document.querySelectorAll(".tt-app .tt-trow");
    if (!rows.length) return;
    listState.selIdx = Math.min(Math.max((listState.selIdx === -1 ? 0 : listState.selIdx) + delta, 0), rows.length - 1);
    paintSelection();
    const row = rows[listState.selIdx];
    if (!row) return;
    // 手动对位滚动容器：行滑出视口边缘时按行高步进滚动，避免连续 ↑ 卡在视口内不动
    const scroller = document.querySelector(".tt-app .tt-main");
    if (!scroller) return;
    const viewTop = scroller.scrollTop;
    const viewBot = viewTop + scroller.clientHeight;
    const sr = scroller.getBoundingClientRect();
    const rr = row.getBoundingClientRect();
    const rowTop = rr.top - sr.top + viewTop;
    const rowBot = rowTop + rr.height;
    if (rowTop < viewTop) {
      // 上越界：滚到让选中行居中（至少在顶部留出余量）
      scroller.scrollTop = Math.max(0, rowTop - Math.max(0, scroller.clientHeight - rr.height) / 2);
    } else if (rowBot > viewBot - 2) {
      // 下越界：滚到选中行底部对齐视口底
      scroller.scrollTop = rowBot - scroller.clientHeight;
    }
  }

  function openSelection() {
    const rows = document.querySelectorAll(".tt-app .tt-trow");
    const row = rows[listState.selIdx] || document.querySelector(".tt-app .tt-trow");
    if (row?.dataset.href) navigateInApp(row.dataset.href);
  }

  function applyListJson(data, append) {
    const topics = (data.topic_list && data.topic_list.topics) || [];
    const existing = new Set(append ? listState.topics.map((t) => t.id) : []);
    const fresh = topics.filter((t) => !existing.has(t.id));
    listState.topics = append ? listState.topics.concat(fresh) : topics;
    if (!append) listState.selIdx = -1;
    const more = data.topic_list && data.topic_list.more_topics_url;
    listState.moreUrl = more || null;
    renderListRows();
  }

  async function loadList(apiPath, force) {
    if (!apiPath) return;
    const rowsBox = document.querySelector(".tt-app .tt-trows");
    if (!force && listState.apiPath === apiPath && listState.topics.length && rowsBox?.children.length) {
      syncChrome();
      return;
    }
    if (listState.loading) {
      // 正在加载别的列表（常见于详情页后台预载 latest）：记下目标，完成后跟上，不丢这次跳转
      listState.pendingPath = apiPath;
      return;
    }
    // 失败退避按路径生效，不阻塞其它路由
    if (listState.failedAt && listState.failedPath === apiPath && Date.now() - listState.failedAt < 10000) return;
    listState.loading = true;
    listState.apiPath = apiPath;
    // 只在真正的列表路由记录 path，避免被详情页后台预载的 latest 污染 Esc 返回
    if (isHomePath(location.pathname)) listState.path = location.pathname;
    renderListRows();
    try {
      const data = await api(apiPath);
      if (listState.apiPath !== apiPath) return; // 路由已切走
      listState.failedAt = 0;
      listState.failedPath = "";
      applyListJson(data, false);
    } catch (err) {
      listState.failedAt = Date.now();
      listState.failedPath = apiPath;
      renderListRows();
      const status = /HTTP (\d+)/.exec(err && err.message || "")?.[1];
      const box = document.querySelector(".tt-app .tt-trows .tt-list-status");
      if (box) {
        box.textContent = `load failed${status ? ` (HTTP ${status})` : ""} · click to retry`;
        box.addEventListener("click", () => {
          listState.failedAt = 0;
          listState.failedPath = "";
          loadList(apiPath, true);
        }, { once: true });
      }
    } finally {
      listState.loading = false;
      const pending = listState.pendingPath;
      listState.pendingPath = null;
      if (pending && pending !== apiPath) loadList(pending, true);
    }
  }

  async function loadMoreList() {
    if (!listState.moreUrl || listState.loading) return;
    listState.loading = true;
    try {
      const data = await api(listState.moreUrl);
      applyListJson(data, true);
    } catch { /* 保留现状 */ } finally {
      listState.loading = false;
      const pending = listState.pendingPath;
      listState.pendingPath = null;
      if (pending && pending !== listState.apiPath) loadList(pending, true);
    }
  }

  /* ============================== cooked 装饰（终端 markdown 样式） ============================== */

  function decorateCooked(root) {
    if (!root) return;

    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.closest(".tt-codeblock")) return;
      const code = pre.querySelector("code");
      const lang = (code && (code.className || "").match(/lang(?:uage)?-([\w#+-]+)/i) || [])[1] || "text";
      const wrap = document.createElement("div");
      wrap.className = "tt-codeblock";
      pre.replaceWith(wrap);
      const head = document.createElement("div");
      head.className = "cb-head";
      head.innerHTML = `<span>${escapeHtml(lang)}</span><span class="cb-copy" data-action="copy-code">copy</span>`;
      wrap.appendChild(head);
      wrap.appendChild(pre);
    });

    // Discourse 引用 aside.quote → 可折叠工具调用卡片
    root.querySelectorAll("aside.quote").forEach((quote) => {
      if (quote.closest(".tt-quote-card")) return;
      const postNo = quote.getAttribute("data-post");
      const titleEl = quote.querySelector(":scope > .title");
      const username = (titleEl?.textContent || "").replace(/[:：]\s*$/, "").trim();
      const label = postNo
        ? `quote #${postNo}${username ? ` · ${username}` : ""}`
        : (username ? `quote · ${username}` : "quote");
      const body = quote.querySelector(":scope > blockquote");
      const card = document.createElement("div");
      card.className = "tt-quote-card";
      const head = document.createElement("div");
      head.className = "qc-head";
      head.innerHTML = `<span class="mark" style="color:var(--tt-accent)">⏺</span><span>${escapeHtml(label)}</span><span class="chev"></span>`;
      const bodyEl = document.createElement("div");
      bodyEl.className = "qc-body";
      if (body) {
        while (body.firstChild) bodyEl.appendChild(body.firstChild);
      }
      card.appendChild(head);
      card.appendChild(bodyEl);
      quote.replaceWith(card);
    });

    root.querySelectorAll("blockquote").forEach((bq) => {
      if (bq.closest(".tt-quote-card") || bq.closest("aside.quote")) return;
      const card = document.createElement("div");
      card.className = "tt-quote-card";
      const head = document.createElement("div");
      head.className = "qc-head";
      head.innerHTML = `<span class="mark" style="color:var(--tt-accent)">⏺</span><span>quote</span><span class="chev"></span>`;
      const bodyEl = document.createElement("div");
      bodyEl.className = "qc-body";
      while (bq.firstChild) bodyEl.appendChild(bq.firstChild);
      card.appendChild(head);
      card.appendChild(bodyEl);
      bq.replaceWith(card);
    });

    // 自定义表情（图片）→ :短名: token，hover 浮原图；系统 Unicode/头像/代码块内不动
    root.querySelectorAll("img").forEach((img) => {
      if (!img.classList.contains("emoji")) return;
      if (img.closest(".tt-codeblock") || img.closest(".tt-imgwrap")) return;
      if (img.closest(".tt-emoji")) return;
      const wrap = document.createElement("span");
      wrap.className = "tt-emoji";
      const alt = (img.alt || img.title || "").trim();
      const tok = document.createElement("span");
      tok.className = "tt-emoji-tok";
      tok.textContent = alt.startsWith(":") ? alt : `:${alt.replace(/^:+|:+$/g, "")}:`;
      wrap.appendChild(tok);
      if (img.alt) wrap.title = img.alt;
      img.replaceWith(wrap);
      wrap.appendChild(img);
    });

    // 图片 → [img] 主题色 token（悬停浮预览；emoji / 头像 / 代码块内不动）
    root.querySelectorAll("img").forEach((img) => {
      if (img.closest(".tt-codeblock") || img.closest(".tt-imgwrap")) return;
      if (img.classList.contains("emoji") || img.classList.contains("avatar")) return;
      const anchor = img.closest("a");
      const href = anchor?.getAttribute("href") || img.getAttribute("src") || "";
      const wrap = document.createElement("span");
      wrap.className = "tt-imgwrap";
      if (href) wrap.dataset.href = href;
      if (img.alt) wrap.title = img.alt;
      const tok = document.createElement("span");
      tok.className = "tt-imgtok";
      tok.textContent = "[img]";
      wrap.appendChild(tok);
      // 先占位再挪入：若先把 img 塞进 wrap 再 img.replaceWith(wrap)，会因“新节点包含被替换节点”抛环错误
      const target = anchor && root.contains(anchor) ? anchor : img;
      target.replaceWith(wrap);
      wrap.appendChild(img);
    });

    root.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (/^https?:/i.test(href)) {
        try {
          if (new URL(href).origin !== location.origin) {
            a.target = "_blank";
            a.rel = "noopener";
          }
        } catch { /* ignore */ }
      }
    });
    root.querySelectorAll("img").forEach((img) => {
      if (!img.getAttribute("loading")) img.setAttribute("loading", "lazy");
    });
  }

  /* ============================== 详情视图（帖子 = CLI 会话） ============================== */

  const threadState = {
    topicId: null,
    loading: false,
    stream: [],
    posts: [], // 当前已渲染楼层（显示顺序），供变体切换时重渲
    renderedFirstIdx: 0,
    renderedLastIdx: -1,
    hasOlder: false,
    hasNewer: false,
    title: "",
    slug: "",
    categoryId: null,
    postsCount: 0,
    likeCount: 0,
    views: 0
  };

  const likedPosts = new Set();

  function postLiked(post) {
    if (post.id && likedPosts.has(post.id)) return true;
    return (post.actions_summary || []).some((a) => a.id === 2 && a.acted);
  }

  function postLikeCount(post) {
    const like = (post.actions_summary || []).find((a) => a.id === 2);
    return like && like.count ? like.count : 0;
  }

  /** 楼主帖 = 用户输入块（连操作行包进 .tt-post，hover 判定不闪烁） */
  function opTurnHtml(post) {
    return `
      <div class="tt-post">
        <div class="tt-turn user" data-post-number="${post.post_number}"${post.id ? ` data-post-id="${post.id}"` : ""}>
          <div class="who"><span class="tag">❯</span> <span class="who-meta">${escapeHtml(post.name || post.username)} · OP · ${escapeHtml(formatTime(post.created_at))}</span></div>
          <div class="tt-cooked">${post.cooked || ""}</div>
        </div>
        ${turnOpsHtml(post)}
      </div>`;
  }

  /** 回帖 = assistant turn：假思考块 + 假工具调用 + 真实内容（语法随 claude/codex 变体分化） */
  function agentTurnHtml(post) {
    const deco = decorationForPost(post);
    const codexMode = currentVariant() === "codex";
    let head = "";
    if (deco?.thinking) {
      const title = codexMode
        ? `Worked for ${deco.thinking.secs}s`
        : `${deco.thinking.verb || "Thought"} for ${deco.thinking.secs}s <span class="th-hint">(ctrl+o to expand)</span>`;
      head += `
        <div class="tt-thinking open${codexMode ? " codex" : ""}">
          <span class="th-head"><span class="spin">${codexMode ? "•" : "✻"}</span> ${title} <span class="chev"></span></span>
          <div class="th-body">${escapeHtml(deco.thinking.text)}</div>
        </div>`;
    }
    const diffHtml = (t) => !t.diff ? "" :
      `<div class="tt-diff">` + t.diff.map((r) =>
        `<div class="dl ${r.t}"><span class="no">${r.no}</span><span class="sg">${r.t === "del" ? "-" : r.t === "add" ? "+" : ""}</span><span class="tx">${escapeHtml(r.text)}</span></div>`
      ).join("") + `</div>`;
    for (const t of deco?.tools || []) {
      if (codexMode) {
        head += `
        <div class="tt-tool codex">
          <div class="tl-cmd"><span class="mark">•</span> <span class="tool-name">${t.verb}</span> <span class="tool-args">${escapeHtml(t.raw)}</span></div>
          <div class="tl-out ${t.ok ? "ok" : "muted"}"><span class="lm">└</span> <span class="res">${escapeHtml(t.out)}</span></div>
          ${diffHtml(t)}
        </div>`;
      } else {
        head += `
        <div class="tt-tool">
          <div class="tl-cmd"><span class="mark">⏺</span> <span class="tool-name">${t.name === "Edit" ? "Update" : t.name}</span><span class="tool-args">${t.arg}</span></div>
          <div class="tl-out ${t.ok ? "ok" : "muted"}"><span class="lm">⎿</span> <span class="res">${escapeHtml(t.out)}</span></div>
          ${diffHtml(t)}
        </div>`;
      }
    }
    return `
      <div class="tt-post">
        <div class="tt-turn agent" data-post-number="${post.post_number}"${post.id ? ` data-post-id="${post.id}"` : ""}>
          <div class="who">⏺ <span class="who-meta">${escapeHtml(post.name || post.username)}</span> <span class="floor who-meta">[${post.post_number}] · ${escapeHtml(formatTime(post.created_at))}</span></div>
          ${head}
          <div class="tt-cooked">${post.cooked || ""}</div>
        </div>
        ${turnOpsHtml(post)}
      </div>`;
  }

  function turnOpsHtml(post) {
    const liked = postLiked(post);
    const count = postLikeCount(post);
    return `
      <div class="tt-ops" data-post-number="${post.post_number}" data-post-id="${post.id || ""}">
        <span class="op" data-action="reply"><b>[r]</b> reply</span>
        <span class="op${liked ? " liked" : ""}" data-action="like"><b>[l]</b> <span class="like-label">${liked ? "liked" : "like"}${count ? ` ♥ ${count}` : ""}</span></span>
        <span class="op" data-action="link"><b>[c]</b> link</span>
      </div>`;
  }

  function turnsHtml(posts) {
    return posts.map((p) => {
      const html = p.post_number === 1 ? opTurnHtml(p) : agentTurnHtml(p);
      return p.post_number === 1 ? html : html + interstitialFor(p);
    }).join("");
  }

  // 楼层间的英文系统间行（按 postId 播种，低频出现）：让整屏读起来像真实 CLI 会话流
  const INTER_CC = [
    "── context compacted · {k}k tokens ──",
    "✻ auto-compact at 92% · {k}k tokens used",
    "⏵⏵ accept edits on (shift+tab to cycle)",
    "── 1 queued message · enter to view ──"
  ];
  const INTER_CX = [
    "── context low · auto-compact at 90% ──",
    "• Worked for {s}s — tokens used: {k}k",
    "── 1 queued message ──",
    "── session checkpoint saved ──"
  ];

  function interstitialFor(post) {
    const pid = Number(post.id || post.post_number || 0);
    const rnd = mulberry32(((pid * 40503) ^ (threadState.topicId || 0) ^ 0x9e3779b9) >>> 0);
    if (rnd() >= 0.14) return "";
    const pool = currentVariant() === "codex" ? INTER_CX : INTER_CC;
    const tpl = pool[Math.floor(rnd() * pool.length)];
    const text = tpl
      .replace("{k}", (8 + rnd() * 40).toFixed(1))
      .replace("{s}", String(3 + Math.floor(rnd() * 90)));
    return `<div class="tt-inter">${text}</div>`;
  }

  function renderTurns(container, posts, where) {
    const holder = document.createElement("div");
    holder.innerHTML = turnsHtml(posts);
    decorateCooked(holder);
    if (where === "replace") {
      container.innerHTML = "";
      container.append(...holder.childNodes);
    } else if (where === "prepend") {
      container.prepend(...holder.childNodes);
    } else {
      container.append(...holder.childNodes);
    }
  }

  function detailContainer() {
    return document.querySelector(".tt-app .tt-posts");
  }

  /* ---------- 详情流式输出（仿 CLI streaming：按块 reveal + 闪烁光标） ---------- */

  let streamTimer = null;
  let streamFinish = null;

  function cancelStream() {
    if (streamTimer) { clearTimeout(streamTimer); streamTimer = null; }
    if (streamFinish) {
      window.removeEventListener("keydown", streamFinish, true);
      window.removeEventListener("pointerdown", streamFinish, true);
      streamFinish = null;
    }
    document.querySelectorAll(".tt-app .tt-pending").forEach((el) => el.classList.remove("tt-pending"));
    document.querySelector(".tt-app .tt-stream-caret")?.remove();
  }

  function streamRevealPosts(box) {
    cancelStream();
    const posts = [...box.querySelectorAll(".tt-post")];
    if (posts.length < 2) return; // 只有楼主帖就不演了
    // reveal 单元：思考块 / 工具卡逐个出，正文按顶层块出；楼主帖（用户输入）直接显示
    const units = [];
    for (const post of posts) {
      if (post.querySelector(".tt-turn.user")) continue;
      post.querySelectorAll(".tt-thinking, .tt-tool").forEach((el) => units.push({ el, pause: 420 }));
      const cooked = post.querySelector(".tt-cooked");
      if (!cooked) continue;
      if (cooked.children.length) {
        [...cooked.children].forEach((el) => units.push({ el, pause: 70 }));
      } else {
        units.push({ el: cooked, pause: 70 }); // 纯文本 cooked
      }
    }
    if (!units.length || units.length > 120) return; // 超长帖不流式，避免等太久
    units.forEach((u) => u.el.classList.add("tt-pending"));
    const caret = document.createElement("span");
    caret.className = "tt-stream-caret";
    caret.textContent = "▌";

    let i = 0;
    const finish = () => {
      if (!streamTimer) return;
      clearTimeout(streamTimer);
      streamTimer = null;
      units.forEach((u) => u.el.classList.remove("tt-pending"));
      caret.remove();
      window.removeEventListener("keydown", finish, true);
      window.removeEventListener("pointerdown", finish, true);
      if (streamFinish === finish) streamFinish = null;
    };
    const step = () => {
      if (i >= units.length || !units[0].el.isConnected) { finish(); return; }
      const u = units[i++];
      u.el.classList.remove("tt-pending");
      u.el.after(caret);
      streamTimer = setTimeout(step, u.pause);
    };
    // 任意按键 / 点击 = esc to interrupt：立即补完
    // 绑在 window：主键处理器也在 window 捕获阶段且会 stopPropagation，document 上的监听器收不到
    streamFinish = finish;
    window.addEventListener("keydown", finish, true);
    window.addEventListener("pointerdown", finish, true);
    streamTimer = setTimeout(step, 250);
  }

  /* 详情页头部：与列表页 splash 同款的启动盒；标题模糊藏在盒内（claude 在 Tips 下，codex 在 permissions 行） */
  function renderTopicHead() {
    const head = document.querySelector(".tt-app .tt-topic-head");
    if (!head) return;
    const cwd = "~/linux.do";
    const title = escapeHtml(threadState.title || "");
    if (currentVariant() === "codex") {
      head.innerHTML = `
        <div class="tt-cx-box">
          <div class="tt-cx-head"><span class="gt">&gt;_</span>OpenAI Codex <span class="ver">(v0.149.0)</span></div>
          <div class="tt-cx-row"><span class="lbl">directory:</span><span>${cwd}</span></div>
          <div class="tt-cx-row"><span class="lbl">permissions:</span><h1 class="tt-topic-title">${title}</h1></div>
          <div class="tt-cx-row"><span class="lbl">model:</span><span>gpt-5.6-sol high</span><span class="cmd">/model</span><span>to change</span></div>
          <div class="tt-cx-row"><span class="lbl">session:</span><span class="meta"></span></div>
        </div>`;
    } else {
      const tip = CC_TIPS[Math.floor(Date.now() / 86400000) % CC_TIPS.length];
      head.innerHTML = `
        <div class="tt-hub">
          <div class="tt-hub-cap"><span class="ln"></span><span>Claude Code v2.1.238</span><span class="ln"></span></div>
          <div class="tt-hub-box">
            <div class="tt-hub-cols">
              <div class="tt-hub-left">
                <pre class="tt-hub-logo">▐▛███▜▐▌
▝▜█████▛▘
 ▘▘ ▝▝</pre>
                <div class="tt-hub-welcome">Welcome back!</div>
                <div class="tt-hub-sub">Claude Opus 5 · API Usage Billing<br>${cwd}</div>
              </div>
              <div class="tt-hub-right">
                <div class="tt-hub-h">Tips for getting started</div>
                <div class="tt-hub-line">${tip}</div>
                <div class="tt-hub-divider"></div>
                <h1 class="tt-topic-title">${title}</h1>
                <div class="meta"></div>
              </div>
            </div>
          </div>
        </div>`;
    }
    renderTopicMeta();
  }

  function renderTopicMeta() {
    const meta = document.querySelector(".tt-app .tt-topic-head .meta");
    if (!meta || !threadState.topicId) return;
    const cat = categoryById(threadState.categoryId);
    meta.innerHTML =
      `<span class="cat-chip">${escapeHtml(cat ? pinyinSlugOf(cat) : "general")}</span>` +
      ` · ★ ${threadState.likeCount || 0} · ${threadState.postsCount} replies · ${threadState.views} views`;
  }

  function syncThreadDivider() {
    const box = detailContainer();
    if (!box) return;
    box.querySelector(".tt-turn-divider")?.remove();
    const total = Math.max(0, (threadState.postsCount || 0) - 1);
    const loaded = threadState.renderedLastIdx - threadState.renderedFirstIdx + 1;
    if (threadState.hasOlder && total > 0) {
      box.insertAdjacentHTML(
        "beforeend",
        `<div class="tt-turn-divider">▲ ${total} replies · showing latest ${Math.max(0, loaded - 1)} · scroll up for earlier</div>`
      );
    }
  }

  async function loadTopic(topicId) {
    if (!topicId) return;
    if (threadState.topicId === topicId) {
      syncChrome();
      return;
    }
    // 不因 loading 而拒绝重入：快速切换话题时，旧响应会被 topicId 校验丢弃
    threadState.loading = true;
    threadState.topicId = topicId;
    ensureApp();
    showView("detail");
    const box = detailContainer();
    if (box) box.innerHTML = `<div class="tt-list-status">… loading</div>`;
    threadState.title = "";
    renderTopicHead();
    syncChrome();
    try {
      const data = await api(`/t/${topicId}.json`);
      if (threadState.topicId !== topicId) return; // 路由已切走
      const posts = (data.post_stream && data.post_stream.posts) || [];
      threadState.stream = (data.post_stream && data.post_stream.stream) || posts.map((p) => p.id);
      threadState.posts = posts;
      threadState.renderedFirstIdx = threadState.stream.indexOf(posts.length ? posts[0].id : -1);
      if (threadState.renderedFirstIdx < 0) threadState.renderedFirstIdx = 0;
      const lastLoadedId = posts.length ? posts[posts.length - 1].id : -1;
      threadState.renderedLastIdx = threadState.stream.indexOf(lastLoadedId);
      if (threadState.renderedLastIdx < 0) {
        threadState.renderedLastIdx = threadState.renderedFirstIdx + Math.max(posts.length - 1, 0);
      }
      threadState.hasOlder = threadState.renderedFirstIdx > 0;
      threadState.hasNewer = threadState.renderedLastIdx >= 0 &&
        threadState.renderedLastIdx < threadState.stream.length - 1;
      threadState.title = data.title || "";
      threadState.slug = data.slug || "";
      recordSession(threadState.title);
      threadState.categoryId = data.category_id || null;
      threadState.postsCount = data.posts_count || posts.length;
      threadState.likeCount = data.like_count || 0;
      threadState.views = data.views || 0;

      for (const p of posts) {
        if (p.id && postLiked(p)) likedPosts.add(p.id);
      }

      renderTopicHead();

      if (box) {
        renderTurns(box, posts, "replace");
        syncThreadDivider();
        const scroller = document.querySelector(".tt-app .tt-main");
        if (scroller) scroller.scrollTop = 0;
        streamRevealPosts(box); // 进帖流式输出
      }
      syncChrome();
      if (!categoriesCache && threadState.categoryId) {
        loadCategories().then(() => { renderTopicMeta(); syncChrome(); });
      }
    } catch (err) {
      if (box) {
        box.innerHTML = `
          <div class="tt-list-status">
            load failed (${escapeHtml(err && err.message || "unknown")}) · no permission or deleted
          </div>`;
      }
    } finally {
      threadState.loading = false;
    }
  }

  function sortPostsByStream(posts, ids) {
    const order = new Map(ids.map((id, i) => [id, i]));
    return posts.slice().sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }

  /* ============================== composer（论坛回复） ============================== */

  const composerState = {
    submitting: false,
    replyToPostNumber: null,
  };

  function composerUi() {
    const el = document.querySelector(".tt-app .tt-composer");
    return {
      box: el,
      input: el?.querySelector("textarea.input"),
      target: el?.querySelector(".target"),
      status: el?.querySelector(".status"),
    };
  }

  function setComposerStatus(text, kind) {
    const { status } = composerUi();
    if (!status) return;
    status.textContent = text || "";
    status.className = "status" + (kind ? ` ${kind}` : "");
  }

  function setComposerTarget(postNumber, name) {
    const { target, input } = composerUi();
    composerState.replyToPostNumber = Number(postNumber) || null;
    if (!target) return;
    if (!composerState.replyToPostNumber) {
      target.classList.remove("active");
      target.querySelector(".label")?.remove();
      return;
    }
    target.innerHTML = "";
    let label = document.createElement("span");
    label.className = "label";
    label.textContent = name ? `> ${name} #${postNumber}` : `> #${postNumber}`;
    let btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "✕";
    btn.title = "取消回复";
    target.append(label, btn);
    target.classList.add("active");
    input?.focus();
  }

  function clearComposerTarget() {
    const { target } = composerUi();
    composerState.replyToPostNumber = null;
    target?.classList.remove("active");
    target?.querySelector(".label")?.remove();
  }

  function submitComposerText() {
    const { input } = composerUi();
    if (!input) return;
    const raw = input.value.trim();
    if (!raw || composerState.submitting) return;
    if (!threadState.topicId) {
      setComposerStatus("没有打开的话题", "error");
      return;
    }
    composerState.submitting = true;
    setComposerStatus("sending…", "busy");
    const replyTo = composerState.replyToPostNumber;
    Promise.resolve()
      .then(() => submitReplyViaApi(raw, replyTo))
      .then((post) => {
        input.value = "";
        clearComposerTarget();
        setComposerStatus("sent ✓", "success");
        // 发送成功：尝试把新楼层并入当前视图（失败则等刷新）
        if (post?.post_number || post?.postNumber || post?.id) {
          // 重拉主题，让新楼层出现在末尾
          loadTopic(threadState.topicId);
        }
      })
      .catch(async (apiError) => {
        setComposerStatus(`API 失败，尝试原生编辑器: ${(apiError && apiError.message) || ""}`, "error");
        try {
          await submitNativeReply(raw, replyTo);
          input.value = "";
          clearComposerTarget();
          setComposerStatus("sent via native editor ✓", "success");
        } catch (nativeError) {
          setComposerStatus(`发送失败: ${(nativeError && nativeError.message) || ""}`, "error");
        }
      })
      .finally(() => {
        composerState.submitting = false;
      });
  }

  /** 直接调 Discourse JSON API 发帖（与飞书脚本同款路径） */
  async function submitReplyViaApi(raw, replyToPostNumber) {
    const body = { raw, topic_id: Number(threadState.topicId) };
    if (replyToPostNumber) body.reply_to_post_number = Number(replyToPostNumber);
    const response = await fetch("/posts.json", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "X-CSRF-Token": csrfToken(),
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = payload?.errors?.[0] || payload?.error || `HTTP ${response.status}`;
      throw new Error(err);
    }
    const post = payload.post || payload.created_post || payload;
    if (!post || (!post.id && !post.post_id)) throw new Error("站点未确认回复");
    return post;
  }

  /** 出问题时退回 Discourse 原生编辑器（service 拖底/按钮拖底） */
  async function submitNativeReply(raw, replyToPostNumber) {
    openNativeComposer(replyToPostNumber);
    const ta = await waitForComposerTextarea();
    if (!ta) throw new Error("无法打开原生编辑器");
    ta.focus();
    ta.value = raw;
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    const submitBtn = document.querySelector(
      "#reply-control .save-or-cancel button.create, #reply-control .save-or-cancel button.btn-primary, #reply-control button.create.btn-primary"
    );
    if (!submitBtn) throw new Error("找不到原生提交按钮");
    submitBtn.click();
  }

  function waitForComposerTextarea(timeoutMs = 5000) {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        const ta = document.querySelector("#reply-control textarea.d-editor-input, #reply-control textarea");
        if (ta) return resolve(ta);
        if (Date.now() - start > timeoutMs) return resolve(null);
        setTimeout(check, 100);
      };
      check();
    });
  }

  
  async function loadOlderPosts() {
    if (!threadState.hasOlder || threadState.loading || !threadState.topicId) return;
    const ids = threadState.stream.slice(Math.max(0, threadState.renderedFirstIdx - 20), threadState.renderedFirstIdx);
    if (!ids.length) return;
    threadState.loading = true;
    const scroller = document.querySelector(".tt-app .tt-main");
    try {
      const qs = ids.map((id) => `post_ids[]=${id}`).join("&");
      const data = await api(`/t/${threadState.topicId}/posts.json?${qs}`);
      const posts = sortPostsByStream(
        (data.post_stream && data.post_stream.posts) || data.posts || [],
        ids
      );
      threadState.renderedFirstIdx = Math.max(0, threadState.renderedFirstIdx - ids.length);
      threadState.hasOlder = threadState.renderedFirstIdx > 0;
      threadState.posts = posts.concat(threadState.posts);
      const box = detailContainer();
      if (box && posts.length) {
        const prevHeight = scroller ? scroller.scrollHeight : 0;
        const holder = document.createElement("div");
        holder.innerHTML = turnsHtml(posts);
        decorateCooked(holder);
        box.prepend(...holder.childNodes);
        if (scroller) scroller.scrollTop += scroller.scrollHeight - prevHeight;
      }
      syncThreadDivider();
    } catch { /* 保留现状 */ } finally {
      threadState.loading = false;
    }
  }

  async function loadNewerPosts() {
    if (!threadState.hasNewer || threadState.loading || !threadState.topicId) return;
    const start = threadState.renderedLastIdx + 1;
    if (start <= 0 || start >= threadState.stream.length) {
      threadState.hasNewer = false;
      return;
    }
    const ids = threadState.stream.slice(start, start + 20);
    if (!ids.length) {
      threadState.hasNewer = false;
      return;
    }
    threadState.loading = true;
    try {
      const qs = ids.map((id) => `post_ids[]=${id}`).join("&");
      const data = await api(`/t/${threadState.topicId}/posts.json?${qs}`);
      const posts = sortPostsByStream(
        (data.post_stream && data.post_stream.posts) || data.posts || [],
        ids
      );
      threadState.renderedLastIdx = start + ids.length - 1;
      threadState.hasNewer = threadState.renderedLastIdx < threadState.stream.length - 1;
      threadState.posts = threadState.posts.concat(posts);
      const box = detailContainer();
      if (box && posts.length) {
        box.querySelector(".tt-turn-divider")?.remove();
        const holder = document.createElement("div");
        holder.innerHTML = turnsHtml(posts);
        decorateCooked(holder);
        box.append(...holder.childNodes);
      }
      syncThreadDivider();
    } catch { /* 保留现状 */ } finally {
      threadState.loading = false;
    }
  }

  /* ============================== 点赞（CSRF 调原生 /post_actions） ============================== */

  async function toggleLike(postId, op) {
    if (!postId) return;
    const wasLiked = likedPosts.has(postId);
    const paint = (liked) => {
      op.classList.toggle("liked", liked);
      const label = op.querySelector(".like-label");
      if (label) {
        const n = (label.textContent.match(/♥\s*(\d+)/) || [])[1];
        label.textContent = `${liked ? "liked" : "like"}${n ? ` ♥ ${n}` : ""}`;
      }
    };
    if (wasLiked) likedPosts.delete(postId); else likedPosts.add(postId);
    paint(!wasLiked);
    try {
      const resp = await fetch(
        wasLiked ? `/post_actions/${postId}?post_action_type_id=2` : "/post_actions",
        wasLiked
          ? {
              method: "DELETE",
              credentials: "same-origin",
              headers: { "X-CSRF-Token": csrfToken(), "X-Requested-With": "XMLHttpRequest" }
            }
          : {
              method: "POST",
              credentials: "same-origin",
              headers: {
                "X-CSRF-Token": csrfToken(),
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: `id=${postId}&post_action_type_id=2`
            }
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    } catch {
      if (wasLiked) likedPosts.add(postId); else likedPosts.delete(postId);
      paint(wasLiked);
    }
  }

  /* ============================== 分类 Select 浮层 ============================== */
  /* 层级关系：左列先选类别，右列再选「新 / 最新」等视图；顶部显示二级路径 */

  // 与飞书版中栏路由同源：最新 / 新 / 未读 / 热门 / 排行榜
  const GLOBAL_VIEWS = [
    { slug: "latest", name: "最新", path: "/latest" },
    { slug: "new", name: "新帖", path: "/new" },
    { slug: "unread", name: "未读", path: "/unseen" },
    { slug: "hot", name: "热门", path: "/hot" },
    { slug: "top", name: "排行榜", path: "/top" }
  ];
  const CAT_VIEW_SUFFIX = { latest: "", new: "/l/new", unread: "/l/unread", hot: "/l/hot", top: "/l/top" };

  /** 列表头行 views 筛选的数据：分类页组合 /l/ 后缀路由，全局页用顶层路由；无对应视图的页返回 null */
  function listViewsForPath(pathname) {
    let views = null, active = "latest";
    const sfx = pathname.match(/^(\/c\/.+?)\/l\/(new|unread|hot|top)\/?$/);
    if (sfx) {
      views = GLOBAL_VIEWS.map((v) => ({ slug: v.slug, name: v.name, href: sfx[1] + CAT_VIEW_SUFFIX[v.slug] }));
      active = sfx[2];
    } else if (pathname.startsWith("/c/")) {
      const base = pathname.replace(/\/+$/, "");
      views = GLOBAL_VIEWS.map((v) => ({ slug: v.slug, name: v.name, href: base + CAT_VIEW_SUFFIX[v.slug] }));
    } else if (pathname === "/" || /^\/(latest|new|unread|unseen|hot|top|categories)\/?$/.test(pathname)) {
      views = GLOBAL_VIEWS.map((v) => ({ slug: v.slug, name: v.name, href: v.path }));
      const key = pathname.replace(/\//g, "");
      active = { "": "latest", categories: "latest", unseen: "unread" }[key] || key;
    }
    return views ? { views, active } : null;
  }

  /** 列表页键盘切换视图：在当前路由的视图序列里循环（h/← 上一个，l/→ 下一个） */
  function cycleListView(delta) {
    const cfg = listViewsForPath(location.pathname);
    if (!cfg) return;
    const i = cfg.views.findIndex((v) => v.slug === cfg.active);
    const next = cfg.views[(i + delta + cfg.views.length) % cfg.views.length];
    if (next) navigateInApp(next.href);
  }

  let selCats = [];     // 左列：all + 分类树 {slug, name, href, catId, sub, keywords}
  let selCatIdx = 0;    // 左列高亮（可见项内索引）
  let selViewIdx = 0;   // 右列高亮
  let selCol = 0;       // 0=类别列 1=视图列
  let selFilterVal = "";

  function buildSelItems() {
    const cats = categoriesCache || [];
    const items = [{
      slug: "all", name: "全部分类", href: "/categories", catId: 0, sub: false,
      keywords: "all categories 全部分类 分类"
    }];
    for (const cat of cats) {
      const slug = pinyinSlugOf(cat);
      items.push({
        slug,
        name: cat.name,
        href: `/c/${cat.slug}/${cat.id}`,
        catId: cat.id,
        sub: false,
        keywords: `${slug} ${cat.name} ${cat.slug}`.toLowerCase()
      });
      for (const sub of cat.subcategory_list || []) {
        items.push({
          slug: sub.slug || `cat-${sub.id}`,
          name: sub.name,
          href: `/c/${sub.slug}/${sub.id}`,
          catId: sub.id,
          sub: true,
          keywords: `${sub.slug} ${sub.name}`.toLowerCase()
        });
      }
    }
    selCats = items;
  }

  function visibleSelCats() {
    const q = selFilterVal.toLowerCase();
    return selCats.filter((it) => !q || it.keywords.includes(q));
  }

  function activeSelCat() {
    const list = visibleSelCats();
    if (!list.length) return null;
    selCatIdx = Math.min(Math.max(selCatIdx, 0), list.length - 1);
    return list[selCatIdx];
  }

  /** 右列：当前类别下的视图（all → 全局路由），末尾挂「新话题」动作 */
  function selViewsFor(cat) {
    const base = cat && cat.catId
      ? GLOBAL_VIEWS.map((v) => ({ slug: v.slug, name: v.name, href: `${cat.href}${CAT_VIEW_SUFFIX[v.slug]}` }))
      : GLOBAL_VIEWS.map((v) => ({ slug: v.slug, name: v.name, href: v.path }));
    base.push({
      slug: "+ new topic", name: "新话题", action: "new-topic", act: true,
      catId: cat && cat.catId || 0
    });
    return base;
  }

  function activeSelView() {
    const views = selViewsFor(activeSelCat());
    selViewIdx = Math.min(Math.max(selViewIdx, 0), views.length - 1);
    return views[selViewIdx];
  }

  function selCatItemHtml(it, i) {
    const on = selCol === 0 && i === selCatIdx;
    return `
      <div class="tt-sel-item${it.sub ? " sub" : ""}${on ? " active" : ""}" data-ci="${i}">
        <span class="cursor-mark">❯</span><span class="slug">${escapeHtml(it.slug)}</span><span class="cn">${escapeHtml(it.name)}</span>
      </div>`;
  }

  function selViewItemHtml(it, i) {
    const on = selCol === 1 && i === selViewIdx;
    return `
      <div class="tt-sel-item${it.act ? " act" : ""}${on ? " active" : ""}" data-vi="${i}">
        <span class="cursor-mark">❯</span><span class="slug">${escapeHtml(it.slug)}</span><span class="cn">${escapeHtml(it.name)}</span>
      </div>`;
  }

  function paintSel() {
    const box = document.querySelector(".tt-app .tt-overlay .sel-items");
    if (!box) return;
    const cats = visibleSelCats();
    const cat = activeSelCat();
    // 左上角二级路径：❯ linux.do / ~ / category/view
    const pathEl = document.querySelector(".tt-app .tt-overlay .sel-path");
    if (pathEl) {
      const view = selCol === 1 ? activeSelView() : null;
      const segs = [`<span class="root">❯ linux.do / ~</span>`];
      if (cat) {
        if (cat.catId) segs.push(` / ${escapeHtml(cat.slug)}`);
        segs.push(view ? ` / ${escapeHtml(view.slug)}` : ` / <span class="dim">?</span>`);
      } else {
        segs.push(` / <span class="dim">no match</span>`);
      }
      pathEl.innerHTML = segs.join("");
    }
    if (!cats.length) {
      box.innerHTML = `<div class="tt-sel-sep">no match</div>`;
      return;
    }
    const views = selViewsFor(cat);
    const cols =
      `<div class="sel-col"><div class="tt-sel-sep">categories</div>` +
      cats.map((it, i) => selCatItemHtml(it, i)).join("") + `</div>` +
      `<div class="sel-col"><div class="tt-sel-sep">views</div>` +
      views.map((it, i) => selViewItemHtml(it, i)).join("") + `</div>`;
    box.innerHTML = `<div class="sel-cols">${cols}</div>`;
    box.querySelector(".tt-sel-item.active")?.scrollIntoView({ block: "nearest" });
  }

  function openOverlay() {
    const overlay = document.querySelector(".tt-app .tt-overlay");
    if (!overlay) return;
    if (!categoriesCache) {
      loadCategories().then(() => { buildSelItems(); paintSel(); });
    } else {
      buildSelItems();
      paintSel();
    }
    selFilterVal = "";
    selCatIdx = 0;
    selViewIdx = 0;
    selCol = 0;
    const filter = overlay.querySelector(".sel-filter");
    filter.value = "";
    overlay.classList.add("open");
    setTimeout(() => filter.focus(), 30);
  }

  function closeOverlay() {
    document.querySelector(".tt-app .tt-overlay")?.classList.remove("open");
  }

  function isOverlayOpen() {
    return !!document.querySelector(".tt-app .tt-overlay.open");
  }

  function confirmSel() {
    const cat = activeSelCat();
    if (!cat) return;
    if (selCol === 0) {
      // 类别与视图是两个独立选择：左列回车直达该分类
      closeOverlay();
      navigateInApp(cat.href);
      return;
    }
    const it = activeSelView();
    if (!it) return;
    closeOverlay();
    if (it.action === "new-topic") { openNewTopicComposer(it.catId); return; }
    navigateInApp(it.href);
  }

  /** 鼠标点击：类别直达该分类，视图直达组合路由（不走层级下钻） */
  function clickSelItem(el) {
    if (el.dataset.ci !== undefined) {
      const cat = visibleSelCats()[Number(el.dataset.ci)];
      if (!cat) return;
      closeOverlay();
      navigateInApp(cat.href);
      return;
    }
    if (el.dataset.vi !== undefined) {
      selViewIdx = Number(el.dataset.vi);
      const it = activeSelView();
      if (!it) return;
      closeOverlay();
      if (it.action === "new-topic") { openNewTopicComposer(it.catId); return; }
      navigateInApp(it.href);
    }
  }

  function moveSel(delta) {
    if (selCol === 0) {
      const n = visibleSelCats().length;
      if (!n) return;
      const next = Math.min(Math.max(selCatIdx + delta, 0), n - 1);
      if (next !== selCatIdx) { selCatIdx = next; selViewIdx = 0; }
    } else {
      const n = selViewsFor(activeSelCat()).length;
      selViewIdx = Math.min(Math.max(selViewIdx + delta, 0), n - 1);
    }
    paintSel();
  }

  /** h/← 回类别列，l/→/Tab 进视图列 */
  function switchSelCol(dir) {
    const next = dir === "left" ? 0 : 1;
    if (next === selCol) return;
    if (!visibleSelCats().length) return;
    selCol = next;
    paintSel();
  }

  /* ============================== 事件绑定 ============================== */

  function bindAppEvents(app) {
    // splash 内容（进列表时刷新）
    const splash = app.querySelector(".tt-splash");
    if (splash && !splash.innerHTML.trim()) splash.innerHTML = splashHtml();

    // 配色切换
    app.querySelectorAll(".tt-launcher .tt-tab").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        setVariant(b.dataset.variant);
        // splash 随变体重生成
        const sp = document.querySelector(".tt-app .tt-splash");
        if (sp) sp.innerHTML = splashHtml();
        // 详情屏的 thinking / 工具调用语法随变体重渲
        if (app.dataset.view === "detail" && threadState.posts.length) {
          const box = detailContainer();
          if (box) {
            renderTurns(box, threadState.posts, "replace");
            syncThreadDivider();
          }
        }
        syncChrome();
      });
    });

    // 快捷键指引：点遮罩收起
    app.querySelector(".tt-help").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) e.currentTarget.classList.remove("open");
    });

    // 全局点击委托
    app.addEventListener("click", (e) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;

      const tab = t.closest(".tt-tab");
      if (tab) return; // 已单独绑定

      const actEl = t.closest("[data-action]");
      const action = actEl?.dataset.action;

      if (t.closest(".tt-trow")) {
        const row = t.closest(".tt-trow");
        navigateInApp(row.dataset.href);
        return;
      }
      if (t.closest(".tt-sel-item")) {
        clickSelItem(t.closest(".tt-sel-item"));
        return;
      }
      if (t.closest(".qc-head")) {
        t.closest(".tt-quote-card")?.classList.toggle("open");
        return;
      }
      if (t.closest(".th-head")) {
        t.closest(".tt-thinking")?.classList.toggle("open");
        return;
      }
      if (t.closest(".tt-imgtok")) {
        const href = t.closest(".tt-imgwrap")?.dataset.href;
        if (href) window.open(href, "_blank", "noopener");
        return;
      }
      if (t.closest("[data-action='copy-code']")) {
        const pre = t.closest(".tt-codeblock")?.querySelector("pre");
        if (pre) {
          navigator.clipboard?.writeText(pre.textContent || "").then(() => {
            const btn = t.closest("[data-action='copy-code']");
            if (btn) {
              btn.textContent = "copied ✓";
              btn.classList.add("done");
              setTimeout(() => { btn.textContent = "copy"; btn.classList.remove("done"); }, 1200);
            }
          });
        }
        return;
      }

      if (!action) return;
      if (action === "goto") { navigateInApp(actEl.dataset.href); return; }
      if (action === "categories") { openOverlay(); return; }
      if (action === "back") { navigateInApp(lastListPath); return; }
      if (action === "composer") {
        if (isTopicPath(location.pathname)) openNativeComposer();
        else openNewTopicComposer();
        return;
      }
      if (action === "notifications") { navigateInApp("/notifications"); return; }
      if (action === "native-view") { setViewMode("native"); return; }
      if (action === "reply") {
        const postBox = actEl.closest(".tt-post");
        const no = postBox?.querySelector(".tt-turn")?.dataset.postNumber;
        if (no) {
          // 引用回复到 terminal composer
          const name = postBox?.querySelector(".who-meta")?.textContent?.trim()?.split("·")[0]?.trim() || "";
          setComposerTarget(no, name);
        } else {
          // 无有效引用时退到原生
          openNativeComposer();
        }
        return;
      }
      if (action === "like") {
        const pid = Number(actEl.closest(".tt-ops")?.dataset.postId || 0);
        if (pid) toggleLike(pid, actEl);
        return;
      }
      if (action === "link") {
        const no = actEl.closest(".tt-ops")?.dataset.postNumber || "";
        const url = threadState.slug
          ? `${location.origin}/t/${threadState.slug}/${threadState.topicId}/${no}`
          : location.href;
        navigator.clipboard?.writeText(url).then(() => {
          const op = actEl;
          const old = op.innerHTML;
          op.innerHTML = `<b>[c]</b> <span class="done">copied ✓</span>`;
          setTimeout(() => { op.innerHTML = old; }, 1200);
        });
        return;
      }
    });

    // 滚动加载
    const scroller = app.querySelector(".tt-main");
    scroller.addEventListener("scroll", () => {
      const nearBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 400;
      const nearTop = scroller.scrollTop <= 80;
      if (app.dataset.view === "list") {
        if (nearBottom) loadMoreList();
      } else {
        if (nearTop) loadOlderPosts();
        if (nearBottom) loadNewerPosts();
      }
    }, { passive: true });

    // composer：真实回复输入框
    const composeUiBox = composerUi();
    const ta = composeUiBox.input;
    if (ta) {
      ta.addEventListener("keydown", (e) => {
        // Esc 清空当前输入/引用
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          ta.value = "";
          clearComposerTarget();
          setComposerStatus("");
          return;
        }
        if (e.key !== "Enter") return;
        // 列表态回车 = 开新话题；详情态 = 发送回复
        const isDetailNow = app.dataset.view === "detail";
        if (e.shiftKey) return; // 让换行
        e.preventDefault();
        e.stopPropagation();
        if (isDetailNow) {
          if (ta.value.trim()) submitComposerText();
        } else {
          openNewTopicComposer();
        }
      });
      // 输入时自动增高，don't 让全局键盘拿走去滚动
      ta.addEventListener("input", () => {
        ta.style.height = "auto";
        ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
      });
      // 点最外层 box 聚焦输入框
      const box = ta.closest(".tt-composer");
      box?.addEventListener("click", (e) => {
        if (e.target && e.target.closest && e.target.closest("button")) return;
        ta.focus();
      });
    }
    // 引用条取消
    app.querySelector(".tt-composer .target")?.addEventListener("click", (e) => {
      if (e.target && e.target.closest && e.target.closest("button")) {
        clearComposerTarget();
        setComposerStatus("");
      }
    });

    // 浮层过滤输入
    app.querySelector(".sel-filter").addEventListener("input", (e) => {
      selFilterVal = e.target.value.trim();
      selCatIdx = 0;
      selViewIdx = 0;
      selCol = 0;
      paintSel();
    });
    app.querySelector(".tt-overlay").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeOverlay();
    });
  }

  /* ---------- 原生视图模式 ---------- */

  function viewMode() {
    try {
      return localStorage.getItem(VIEW_KEY) === "native" ? "native" : "tui";
    } catch {
      return "tui";
    }
  }

  function setViewMode(mode) {
    const prev = localStorage.getItem(VIEW_KEY);
    try { localStorage.setItem(VIEW_KEY, mode); } catch { /* ignore */ }
    // native → tui 回切需要立即重渲染，避免依赖 MutationObserver（原生页可能没有后续 DOM 变化）
    if (prev === "native" && mode === "tui") {
      applyTheme();
    } else {
      scheduleApply();
    }
  }

  function ensureRestoreButton() {
    if (document.querySelector(".tt-restore")) return;
    const btn = document.createElement("button");
    btn.className = "tt-restore";
    btn.textContent = "❯ tui";
    btn.title = "回到终端 TUI 视图";
    // 用 pointerdown 代替 click，避免被 Discourse 全局 click 委托（stopImmediatePropagation）吞掉
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setViewMode("tui");
    });
    document.body.appendChild(btn);
  }

  function removeRestoreButton() {
    document.querySelector(".tt-restore")?.remove();
  }

  /* ============================== 编排与 SPA ============================== */

  function removeApp() {
    cancelStream();
    document.querySelector(".tt-app")?.remove();
    removeRestoreButton();
  }

  function applyTheme() {
    if (otherThemeActive()) {
      document.documentElement.classList.remove(ROOT_CLASS, LOCK_CLASS, "tt-claude", "tt-codex");
      removeApp();
      return;
    }

    injectStyle();
    const root = document.documentElement;
    root.classList.add(ROOT_CLASS);
    root.classList.toggle("tt-claude", currentVariant() === "claude");
    root.classList.toggle("tt-codex", currentVariant() === "codex");
    makeFavicon();

    // 标签页标题伪装：TUI 模式一律常量标题；native 模式还原
    if (viewMode() === "tui") {
      if (document.title !== FAKE_TITLE) {
        originalTitle = originalTitle || document.title || "Linux DO";
        document.title = FAKE_TITLE;
      }
    } else if (document.title === FAKE_TITLE) {
      document.title = originalTitle || "Linux DO";
    }

    if (!document.body) return;

    if (viewMode() === "native") {
      document.documentElement.classList.remove(LOCK_CLASS);
      removeApp();
      ensureRestoreButton();
      return;
    }
    removeRestoreButton();

    const pathname = location.pathname;
    const isTopic = isTopicPath(pathname);
    const isHome = isHomePath(pathname);
    const supported = isTopic || isHome;

    document.documentElement.classList.toggle(LOCK_CLASS, supported);

    if (!supported) {
      // 非列表/帖子路由（设置、消息、搜索等）：交还原生页面
      removeApp();
      return;
    }

    ensureApp();

    if (isTopic) {
      // 没有列表缓存时后台补一份 latest，供返回列表 / Esc 用
      if (!listState.topics.length) loadList("/latest.json", false);
      showView("detail");
      loadTopic(topicIdFromPath(pathname));
    } else {
      lastListPath = pathname;
      showView("list");
      // 每次进列表都重画 splash（Recent activity 反映最新会话历史）
      const splash = document.querySelector(".tt-app .tt-splash");
      if (splash) splash.innerHTML = splashHtml();
      const apiPath = listApiForPath(pathname);
      if (listState.apiPath && listState.apiPath !== apiPath && listState.path !== pathname) {
        listState.topics = [];
        listState.selIdx = -1;
      }
      // 有缓存且目标 DOM 已重建（native→tui 回切）：先立即重绘，避免空列表
      if (listState.topics.length && !document.querySelector(".tt-app .tt-trows")?.children.length) {
        renderListRows();
      }
      loadList(apiPath, false);
    }
    syncChrome();
    refreshUnread();
  }

  function injectStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    if (style.textContent !== RAW_CSS) style.textContent = RAW_CSS;
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

  /* ---------- 全局键盘 ---------- */

  function bindKeyboard() {
    window.addEventListener("keydown", (e) => {
      if (otherThemeActive()) return;
      const key = e.key || "";

      // ⌘/Ctrl+K → 原生搜索页
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && key.toLowerCase() === "k") {
        const tag = (e.target && e.target.tagName) || "";
        if (tag === "TEXTAREA" || tag === "INPUT") return;
        e.preventDefault();
        e.stopPropagation();
        navigateInApp("/search");
        return;
      }

      const tag = (e.target && e.target.tagName) || "";
      const inInput = tag === "TEXTAREA" || tag === "INPUT" || e.target?.isContentEditable;

      // 原生 composer 打开时只接管 Esc
      if (isComposerOpen()) {
        if (key === "Escape" && !inInput) {
          e.preventDefault();
          closeNativeComposer();
        }
        return;
      }

      if (viewMode() !== "tui") return;
      if (document.querySelector(".tt-app") === null) return;

      // 快捷键指引：? 唤出；打开时只响应 esc/? 关闭
      const help = document.querySelector(".tt-app .tt-help");
      if (help?.classList.contains("open")) {
        e.preventDefault();
        e.stopPropagation();
        if (key === "Escape" || key === "?") help.classList.remove("open");
        return;
      }
      if (key === "?" && !inInput) {
        e.preventDefault();
        e.stopPropagation();
        help?.classList.add("open");
        return;
      }

      // 分类浮层
      if (isOverlayOpen()) {
        const toViews = () => { selCol = 1; selViewIdx = 0; paintSel(); };
        if (key === "Escape") { e.preventDefault(); closeOverlay(); return; }
        if (e.target?.classList?.contains("sel-filter")) {
          if (key === "ArrowDown" || key === "j") { e.preventDefault(); moveSel(1); return; }
          if (key === "ArrowUp" || key === "k") { e.preventDefault(); moveSel(-1); return; }
          if (key === "Tab" || key === "ArrowRight") { e.preventDefault(); toViews(); return; }
          if (key === "ArrowLeft") { e.preventDefault(); switchSelCol("left"); return; }
          if (key === "Enter") { e.preventDefault(); confirmSel(); return; }
          return; // 其余按键交给输入框
        }
        if (key === "ArrowDown" || key === "j") { e.preventDefault(); moveSel(1); return; }
        if (key === "ArrowUp" || key === "k") { e.preventDefault(); moveSel(-1); return; }
        if (key === "Tab" || key === "l" || key === "ArrowRight") {
          e.preventDefault(); toViews(); return;
        }
        if (key === "h" || key === "ArrowLeft") {
          e.preventDefault(); switchSelCol("left"); return;
        }
        if (key === "Enter") { e.preventDefault(); confirmSel(); return; }
        return;
      }

      if (inInput) return;

      const app = document.querySelector(".tt-app");
      const isDetail = app?.dataset.view === "detail";
      const scroller = app?.querySelector(".tt-main");

      if (key === "/") {
        e.preventDefault();
        e.stopPropagation();
        openOverlay();
        return;
      }
      if (key === "Escape") {
        if (isDetail) {
          e.preventDefault();
          navigateInApp(listState.path || lastListPath);
        }
        return;
      }
      if (key === "j" || key === "ArrowDown") {
        e.preventDefault(); e.stopPropagation();
        if (isDetail) scroller?.scrollBy({ top: 140 });
        else moveSelection(1);
        return;
      }
      if (key === "k" || key === "ArrowUp") {
        e.preventDefault(); e.stopPropagation();
        if (isDetail) scroller?.scrollBy({ top: -140 });
        else moveSelection(-1);
        return;
      }
      if (key === "Enter" && !isDetail) {
        e.preventDefault();
        openSelection();
        return;
      }
      // 列表页 h/← l/→ 循环切换视图（详情页 l 已用于点赞，故仅列表生效）
      if (!isDetail && (key === "ArrowLeft" || key === "h" || key === "ArrowRight" || key === "l")) {
        e.preventDefault(); e.stopPropagation();
        cycleListView(key === "ArrowLeft" || key === "h" ? -1 : 1);
        return;
      }
      if ((key === "r" || key === "R") && isDetail) {
        e.preventDefault(); e.stopPropagation();
        // 聚焦 terminal composer 输入框；若输入框正被占用则交给原生（保留原行为）
        const ta = document.querySelector(".tt-app .tt-composer textarea.input");
        if (ta && !ta.value.trim() && !composerState.replyToPostNumber) {
          ta.focus();
        } else {
          openNativeComposer();
        }
        return;
      }
      if ((key === "c" || key === "C") && isDetail) {
        e.preventDefault(); e.stopPropagation();
        const url = threadState.slug
          ? `${location.origin}/t/${threadState.slug}/${threadState.topicId}`
          : location.href;
        navigator.clipboard?.writeText(url);
        return;
      }
      if ((key === "l" || key === "L") && isDetail) {
        // 点赞鼠标悬停（或首个）楼层
        const target = app.querySelector(".tt-post:hover .tt-ops") ||
          app.querySelectorAll(".tt-post .tt-ops")[0];
        const pid = Number(target?.dataset.postId || 0);
        const op = target?.querySelector("[data-action='like']");
        if (pid && op) { e.preventDefault(); toggleLike(pid, op); }
        return;
      }
    }, true);
  }

  /* ---------- 启动 ---------- */

  function bootstrap() {
    if (!document.documentElement) {
      setTimeout(bootstrap, 0);
      return;
    }
    injectStyle();
    if (!otherThemeActive()) {
      const root = document.documentElement;
      root.classList.add(ROOT_CLASS);
      root.classList.toggle("tt-claude", currentVariant() === "claude");
      root.classList.toggle("tt-codex", currentVariant() === "codex");
      makeFavicon(); // document-start 尽早换标
    }

    const TT_UI_SEL = ".tt-app, .tt-restore, #linuxdo-terminal-theme";
    const observer = new MutationObserver((mutations) => {
      if (otherThemeActive()) {
        scheduleApply();
        return;
      }
      const external = mutations.some((m) => {
        const t = m.target;
        if (!(t instanceof Element) && !(t instanceof CharacterData)) return true;
        const el = t instanceof Element ? t : t.parentElement;
        if (!el) return true;
        if (m.type === "attributes" && el !== document.documentElement) return false;
        if (el.closest(TT_UI_SEL)) return false;
        return true;
      });
      if (external) scheduleApply();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });

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

    bindOutsideCloseComposer();
    bindKeyboard();

    // 定时刷新未读
    if (!window.__ttUnreadTimer) {
      window.__ttUnreadTimer = setInterval(() => {
        if (!otherThemeActive() && viewMode() === "tui" && document.querySelector(".tt-app")) {
          unreadAt = 0;
          refreshUnread();
        }
      }, 60000);
    }

    scheduleApply();
  }

  bootstrap();
})();
