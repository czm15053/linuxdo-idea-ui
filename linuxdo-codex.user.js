// ==UserScript==
// @name         Linux DO · Codex 外观
// @namespace    https://linux.do/
// @version      0.2.0
// @description  将 Linux DO 换成 Codex 桌面 app 风格（配色实测自原版，明暗双模式）。仅改变外观，保留站点原有内容与交互。
// @author       czm15053
// @match        https://linux.do/*
// @icon         https://linux.do/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  /* ============================== 常量 ============================== */

  const STYLE_ID = "linuxdo-codex-theme";
  const FAVICON_ID = "codex-favicon";
  const ROOT_CLASS = "codex-theme";   // 本脚本激活标记（互斥检测也看它）
  const LOCK_CLASS = "codex-locked";  // 锁定路由：隐藏原生主内容

  const RAIL_WIDTH = 306; // 左侧 rail，宽度按原版 app 截图比例（~20% 窗宽）校准

  /* ============================== 内联 SVG 图标 ============================== */

  const ICONS = {
    sidebar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="3"/><line x1="9.5" y1="4" x2="9.5" y2="20"/></svg>`,
    chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="14 6 8 12 14 18"/></svg>`,
    chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="10 6 16 12 10 18"/></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 9 12 14 17 9"/></svg>`,
    chevronRightSm: `<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 20a2 2 0 0 1-3.4 0"/></svg>`,
    pencil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    branch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="8" r="2.4"/><path d="M6 8.4v7.2"/><path d="M18 10.4c0 4-4 3.6-7 4.6"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`,
    plugin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1"/></svg>`,
    gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.01a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z"/></svg>`,
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
    external: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>`,
    dots: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.8a2 2 0 0 1-1.8-1.1L5.5 6.4A1 1 0 0 1 6.4 5h11.2a1 1 0 0 1 .9 1.4l-1.7 3.3a2 2 0 0 1-1.8 1.1Z"/><path d="M9 10.8V15a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4.2"/></svg>`,
    bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    bookmarkFill: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    quote: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1L3 20l1.2-5.3A8.5 8.5 0 1 1 21 11.5z"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`,
    tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.4 11.05 12.35 2a1.4 1.4 0 0 0-1-.4H3a1 1 0 0 0-1 1v8.35a1.4 1.4 0 0 0 .4 1l9.1 9.05a1.4 1.4 0 0 0 2 0l7.9-7.9a1.4 1.4 0 0 0 0-2Z"/><circle cx="7.5" cy="7.5" r="1"/></svg>`,
    send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><polyline points="5 12 12 5 19 12"/></svg>`,
    reply: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>`,
    like: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
    panel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="3"/><line x1="14.5" y1="4" x2="14.5" y2="20"/></svg>`,
    expand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7.5 7.5"/><path d="M3 21l7.5-7.5"/></svg>`,
    folderOpen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>`,
    terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><polyline points="7 9 10 12 7 15"/><path d="M12.5 15H17"/></svg>`,
    file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v5h5"/><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/></svg>`,
    globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.7 2.6 4 5.7 4 9s-1.3 6.4-4 9c-2.7-2.6-4-5.7-4-9s1.3-6.4 4-9Z"/></svg>`,
    layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="7.5" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>`,
    inbox: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 13h-5.5l-2 3h-5l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
    bot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="3"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M12 8V4"/></svg>`,
    dotsV: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a7.5 7.5 0 1 0 11 11Z"/></svg>`,
    filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v5.5L10 21v-8Z"/></svg>`
  };

  /* ============================== favicon（ChatGPT 风：圆角深底 + OpenAI 花） ============================== */

  let FAVICON_URI = null;
  let FAVICON_MODE = null;

  // OpenAI 花朵 path（simple-icons openai，公版 CC0）
  const CX_OPENAI_PATH = "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z";

  /** 圆角底 + OpenAI 花，明暗自适应底色 */
  function makeCodexFaviconUri() {
    const light = !isDarkMode();
    if (FAVICON_URI && FAVICON_MODE === (light ? "light" : "dark")) return FAVICON_URI;
    try {
      const bg = light ? "#f2f2f3" : "#171717";
      const fg = light ? "#0f0f0f" : "#ffffff";
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
        `<rect width="24" height="24" rx="5.5" fill="${bg}"/>` +
        `<path fill="${fg}" d="${CX_OPENAI_PATH}"/></svg>`;
      FAVICON_URI = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      FAVICON_MODE = light ? "light" : "dark";
    } catch {
      FAVICON_URI = "https://linux.do/favicon.ico";
      FAVICON_MODE = light ? "light" : "dark";
    }
    return FAVICON_URI;
  }

  /* ============================== 工具函数 ============================== */

  function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function debounce(fn, wait) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function formatTime(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const now = Date.now();
    const diff = now - date.getTime();
    const minute = 60e3, hour = 3600e3, day = 86400e3;
    if (diff < minute) return "刚刚";
    if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
    if (diff < day && date.getDate() === new Date().getDate()) {
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    if (diff < 2 * day) return "昨天";
    if (diff < 365 * day) return `${date.getMonth() + 1}-${String(date.getDate()).padStart(2, "0")}`;
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  async function api(path, extraHeaders) {
    const resp = await fetch(path, {
      headers: { Accept: "application/json", ...extraHeaders },
      credentials: "same-origin"
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }

  /** 话题浏览上报头（对齐 Discourse 前端 trackNextAjaxAsTopicView，views +1 且服务端按天/IP 去重） */
  function trackViewHeaders(topicId) {
    return {
      "Discourse-Track-View": "true",
      "Discourse-Track-View-Topic-Id": String(topicId)
    };
  }

  /** 写请求（PUT/POST/DELETE），带 CSRF；失败抛 HTTP 状态（移植自 im bridge/api.js） */
  async function apiSend(path, method, body) {
    const resp = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "X-CSRF-Token": csrfToken(),
        "X-Requested-With": "XMLHttpRequest",
        ...(body ? { "Content-Type": "application/json; charset=UTF-8" } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json().catch(() => ({}));
  }

  function csrfToken() {
    const meta = document.querySelector("meta[name='csrf-token']");
    return meta ? meta.content : "";
  }

  /* ============================== CF 盾检测（移植自 im 皮肤 cf-guard.js 36a4cc5） ============================== */

  /** 整页被 Cloudflare challenge / 拦截时返回 true；命中后脚本停用回原皮，挑战通过后自动恢复 */
  function cfBlocked() {
    try {
      if (document.querySelector("#challenge-running, #cf-challenge-running, form#challenge-form")) {
        return true;
      }
      const title = String(document.title || "").toLowerCase().replace(/…/g, "...");
      if (
        title.startsWith("just a moment") ||
        title.includes("attention required") ||
        title.includes("请稍候")
      ) {
        return true;
      }
      if (
        document.querySelector("input[type=hidden][id^='cf-chl-widget-'][name='cf-turnstile-response']") &&
        document.querySelector(".main-wrapper[role='main'], #challenge-error-text")
      ) {
        return true;
      }
    } catch { /* ignore */ }
    return false;
  }

  /* ============================== 图片灯箱（移植自 terminal 皮肤 35bd821，改 Codex 配色） ============================== */

  let activeLightbox = null;

  function lightboxKeydown(e) {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeLightbox(); }
  }

  function closeLightbox() {
    if (activeLightbox) {
      activeLightbox.remove();
      activeLightbox = null;
      document.removeEventListener("keydown", lightboxKeydown, true);
    }
  }

  /** 点击帖子内图片：完整显示原图，滚轮缩放 / 拖动平移 / 双击在 100% 与 200% 间切换 */
  function openLightbox(src) {
    if (!src) return;
    closeLightbox();
    const lb = document.createElement("div");
    lb.className = "cx-lightbox";
    lb.tabIndex = -1;
    lb.innerHTML =
      `<span class="lb-side lb-open">open original ↗</span>` +
      `<span class="lb-side lb-close">esc close</span>` +
      `<img src="${escapeHtml(src)}" alt="" draggable="false">`;
    const img = lb.querySelector("img");
    let scale = 1, tx = 0, ty = 0, dragging = false, sx = 0, sy = 0;
    const apply = (smooth) => {
      img.style.transition = smooth ? "transform .18s ease" : "none";
      img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
    };
    lb.addEventListener("click", (e) => {
      if (e.target === lb || e.target.classList?.contains("lb-close")) closeLightbox();
    });
    lb.querySelector(".lb-open").addEventListener("click", (e) => {
      e.stopPropagation();
      window.open(src, "_blank", "noopener");
    });
    img.addEventListener("wheel", (e) => {
      e.preventDefault();
      scale = Math.min(Math.max(scale * (e.deltaY < 0 ? 1.15 : 0.88), 0.3), 6);
      apply(false);
    }, { passive: false });
    img.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      dragging = true; sx = e.clientX - tx; sy = e.clientY - ty;
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      tx = e.clientX - sx; ty = e.clientY - sy; apply(false);
    });
    window.addEventListener("mouseup", () => { dragging = false; });
    img.addEventListener("dblclick", () => {
      if (scale > 1.1) { scale = 1; tx = 0; ty = 0; }
      else scale = 2;
      apply(true);
    });
    document.addEventListener("keydown", lightboxKeydown, true);
    document.body.appendChild(lb);
    activeLightbox = lb;
    requestAnimationFrame(() => { lb.classList.add("open"); apply(true); lb.focus(); });
  }

  /* ============================== composer 拖图片上传（移植自 terminal 皮肤 35bd821） ============================== */

  let composerUploading = false;

  function cxTransferImages(event) {
    const list = [...(event.clipboardData?.files || event.dataTransfer?.files || [])];
    const isImage = (f) => String(f.type || "").toLowerCase().startsWith("image/");
    if (list.length) return list.filter(isImage);
    // 部分剪贴板只在 items 里暴露文件（.files 为空）
    return [...(event.clipboardData?.items || [])]
      .filter((it) => it.kind === "file")
      .map((it) => it.getAsFile?.())
      .filter((f) => f && isImage(f));
  }

  async function cxUploadImage(file) {
    const form = new FormData();
    form.append("file", file, file.name || "image");
    form.append("upload_type", "composer");
    form.append("type", "composer");
    form.append("synchronous", "true");
    const response = await fetch("/uploads.json", {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-CSRF-Token": csrfToken(), "X-Requested-With": "XMLHttpRequest" },
      body: form
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.errors?.[0] || payload.error || `HTTP ${response.status}`);
    }
    // Discourse 三种返回形态：扁平对象（新版）/ upload 包裹 / uploads 数组
    let upload = payload.upload || (Array.isArray(payload.uploads) ? payload.uploads[0] : null);
    if (!upload && payload && payload.id && payload.url) upload = payload;
    if (!upload) throw new Error("站点未返回图片地址");
    return upload;
  }

  function cxImageMarkdown(upload, file) {
    const url = upload.short_url || upload.url || upload.thumbnail_url;
    if (!url) throw new Error("站点未返回图片地址");
    const rawLabel = String(upload.original_filename || file?.name || "图片");
    const label = rawLabel.replace(/\.[^.]+$/, "").replace(/[[\]\\|]/g, "_");
    const width = Number(upload.thumbnail_width || upload.width) || 0;
    const height = Number(upload.thumbnail_height || upload.height) || 0;
    const dims = width > 0 && height > 0 ? `|${width}x${height}` : "";
    return `![${label}${dims}](${String(url).replace(/[\\()]/g, (ch) => `\\${ch}`)})`;
  }

  /** 原生 composer textarea 就绪后把 markdown 插入光标处（codex 的真实输入交给原生编辑器） */
  function insertMdIntoNative(md) {
    const ta = document.querySelector("#reply-control.open textarea, #reply-control.fullscreen textarea");
    if (!ta) return false;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? start;
    ta.focus();
    ta.setRangeText(md, start, end, "end");
    ta.dispatchEvent(new Event("input", { bubbles: true })); // 触发原生 markdown 预览 / 计数
    return true;
  }

  function setComposerStatus(text, state) {
    const el = document.querySelector(".codex-composer .cx-composer-status");
    if (!el) return;
    el.textContent = text || "";
    el.className = "cx-composer-status" + (state ? ` cx-${state}` : "");
  }

  /* ============================== 嵌入 im 式 markdown 输入框（移植自 im ui/composer.js + markdown-lite.js） ==============================
     结构自上而下：目标条 → 预览条 → contenteditable 输入（Typora 式块）→ 工具栏（按用户要求置于下方）→ 隐藏 file。
     发送走后端 API（/posts.json），失败再落原生编辑器；图片粘贴/拖拽/选择统一上传后以 markdown 插入本皮输入框。 */

  const CX_PREVIEW_KEY = "linuxdo-codex-compose-preview";

  /** upload:// 短链 → 直链（预览条按 short_url 登记后直接出图） */
  const CX_UPLOAD_URLS = new Map();
  function cxRegisterUploadUrl(shortUrl, url) {
    if (shortUrl && url) CX_UPLOAD_URLS.set(String(shortUrl), String(url));
  }

  /* ---- 轻量 markdown → 富文本（输入粒度按「块」渲染，预览条/渲染块共用） ---- */

  const CX_ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
  function cxEsc(s) { return String(s).replace(/[&<>"]/g, (c) => CX_ESC_MAP[c]); }

  let cxEmojiMod;
  const CX_EMOJI_URLS = new Map();
  let cxEmojiScanAt = 0;
  function cxEmojiUrl(name) {
    if (cxEmojiMod === undefined) {
      cxEmojiMod = discourseRequire("pretty-text/addon/emoji") || discourseRequire("pretty-text/emoji") || null;
    }
    const url = cxEmojiMod?.emojiUrlFor?.(name);
    if (url) return url;
    if (CX_EMOJI_URLS.has(name)) return CX_EMOJI_URLS.get(name);
    const now = Date.now();
    if (now - cxEmojiScanAt > 5000) {
      cxEmojiScanAt = now;
      for (const img of document.querySelectorAll("img.emoji")) {
        const m = (img.getAttribute("alt") || "").match(/^:([a-z0-9_+-]+(?::t[2-6])?):$/i);
        if (m && img.src && !CX_EMOJI_URLS.has(m[1])) CX_EMOJI_URLS.set(m[1], img.src);
      }
    }
    return CX_EMOJI_URLS.get(name) || null;
  }

  function cxResolveImgUrl(url) {
    if (!String(url).startsWith("upload://")) return url;
    return CX_UPLOAD_URLS.get(url) || `/uploads/short-url/${url.slice("upload://".length)}`;
  }
  function cxInlineMd(src) {
    let s = cxEsc(src);
    // 图片必须先于链接：![alt|WxH](url)
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
      const [label, dims] = alt.split("|");
      const [w, h] = String(dims || "").split("x").map((n) => parseInt(n, 10) || 0);
      const size = w > 0 && h > 0 ? ` width="${w}" height="${h}"` : "";
      return `<img class="cx-md-img" src="${cxResolveImgUrl(url)}" alt="${label}"${size}>`;
    });
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    s = s.replace(/(^|[\s>])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
    s = s.replace(/(^|\s)@([a-zA-Z0-9_.-]+)/g, '$1<a class="cx-mention" href="/u/$2">@$2</a>');
    s = s.replace(/\[blur\]([\s\S]*?)\[\/blur\]/g, '<span class="cx-md-blur">$1</span>');
    s = s.replace(/\[date=([^\]]+)\]/g, (m, attrs) => {
      const d = attrs.match(/^([\d-]+)/)?.[1] || "";
      const t = attrs.match(/time=([\d:]+)/)?.[1] || "";
      return `<span class="cx-md-date">🕐 ${[d, t].filter(Boolean).join(" ") || attrs}</span>`;
    });
    s = s.replace(/\[\^(\d+)\]/g, "<sup>[$1]</sup>");
    s = s.replace(/:([a-z0-9_+-]+(?::t[2-6])?):/gi, (m, name) => {
      const url = cxEmojiUrl(name);
      return url ? `<img class="emoji" src="${url}" alt=":${name}:" title=":${name}:">` : m;
    });
    return s.replace(/\n/g, "<br>");
  }
  function cxSplitRow(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  }
  function cxParseTable(lines) {
    if (lines.length < 2 || !lines[0].includes("|")) return null;
    const sepCells = cxSplitRow(lines[1]);
    if (!sepCells.length || !sepCells.every((c) => /^:?-{3,}:?$/.test(c))) return null;
    const aligns = sepCells.map((c) =>
      (c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : c.startsWith(":") ? "left" : ""));
    const row = (cells, tag) =>
      `<tr>${cells.map((c, i) => `<${tag}${aligns[i] ? ` style="text-align:${aligns[i]}"` : ""}>${cxInlineMd(c)}</${tag}>`).join("")}</tr>`;
    const body = lines.slice(2).filter((l) => l.includes("|")).map((l) => row(cxSplitRow(l), "td")).join("");
    return `<table class="cx-md-table"><thead>${row(cxSplitRow(lines[0]), "th")}</thead><tbody>${body}</tbody></table>`;
  }
  function cxRenderInner(src) {
    const text = (src || "").trim();
    if (!text) return "";
    return text.split(/\n{2,}/).map((part) => cxMdToHtml(part)).join("");
  }
  function cxMdToHtml(src) {
    const lines = src.split("\n");
    if (/^\s*```/.test(lines[0])) {
      const body = lines.slice(1).join("\n").replace(/\n?```\s*$/, "");
      return `<pre><code>${cxEsc(body)}</code></pre>`;
    }
    if (lines.length === 1 && /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(src)) return "<hr>";
    if (/^\s*\$\$/.test(lines[0])) {
      const body = lines.slice(1).join("\n").replace(/\n?\$\$\s*$/, "");
      return `<pre class="cx-md-math"><code>${cxEsc(body)}</code></pre>`;
    }
    const details = src.match(/^\[details(?:="([^"]*)")?\]\s*\n?([\s\S]*?)\n?\[\/details\]\s*$/);
    if (details) {
      return `<details class="cx-md-details"><summary>${cxEsc(details[1] || "详细信息")}</summary>${cxRenderInner(details[2])}</details>`;
    }
    const quote = src.match(/^\[quote(?:="([^"]*)")?\]\s*\n?([\s\S]*?)\n?\[\/quote\]\s*$/);
    if (quote) {
      const who = (quote[1] || "").split(",")[0].trim();
      return `<blockquote>${who ? `<div class="cx-md-quote-head">${cxEsc(who)}：</div>` : ""}${cxRenderInner(quote[2])}</blockquote>`;
    }
    const poll = src.match(/^\[poll[^\]]*\]\s*\n?([\s\S]*?)\n?\[\/poll\]\s*$/);
    if (poll) {
      const opts = poll[1].split("\n").filter((l) => /^- /.test(l))
        .map((l) => `<li>${cxInlineMd(l.slice(2))}</li>`).join("");
      return `<div class="cx-md-poll"><div class="cx-md-poll-title">🗳 投票（发送后生效）</div><ul>${opts}</ul></div>`;
    }
    const table = cxParseTable(lines);
    if (table) return table;
    if (lines.every((l) => /^\[\^\d+\]:/.test(l))) {
      return lines.map((l) => {
        const m = l.match(/^\[\^(\d+)\]:\s*(.*)$/);
        return `<div class="cx-md-footnote"><sup>[${m[1]}]</sup> ${cxInlineMd(m[2])}</div>`;
      }).join("");
    }
    if (lines.every((l) => l.startsWith(">") || !l.trim()) && lines.some((l) => l.startsWith(">"))) {
      return `<blockquote>${lines.map((l) => cxInlineMd(l.replace(/^> ?/, ""))).join("<br>")}</blockquote>`;
    }
    if (lines.every((l) => /^- /.test(l) || !l.trim()) && lines.some((l) => /^- /.test(l))) {
      return `<ul>${lines.filter((l) => /^- /.test(l)).map((l) => {
        const item = l.slice(2);
        const task = item.match(/^\[( |x|X)\]\s+(.*)$/);
        if (task) {
          return `<li class="cx-md-task"><input type="checkbox" disabled${task[1] === " " ? "" : " checked"}> ${cxInlineMd(task[2])}</li>`;
        }
        return `<li>${cxInlineMd(item)}</li>`;
      }).join("")}</ul>`;
    }
    if (lines.every((l) => /^\d+\. /.test(l) || !l.trim()) && lines.some((l) => /^\d+\. /.test(l))) {
      return `<ol>${lines.filter((l) => /^\d+\. /.test(l)).map((l) => `<li>${cxInlineMd(l.replace(/^\d+\. /, ""))}</li>`).join("")}</ol>`;
    }
    const heading = src.match(/^(#{1,4}) (.*)$/s);
    if (heading) {
      const tag = `h${heading[1].length + 1}`; // Discourse 语义：# 渲染为 h2
      return `<${tag}>${cxInlineMd(heading[2])}</${tag}>`;
    }
    return `<p>${cxInlineMd(src)}</p>`;
  }

  /* ---- 工具条图标（Font Awesome 6 Free，与 Discourse 原生 composer 同源） ---- */

  const CX_EDITOR_ICONS = {
    bold: `<svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor"><path d="M0 64C0 46.3 14.3 32 32 32l48 0 16 0 128 0c70.7 0 128 57.3 128 128c0 31.3-11.3 60.1-30 82.3c37.1 22.4 62 63.1 62 109.7c0 70.7-57.3 128-128 128L96 480l-16 0-48 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l16 0 0-160L48 96 32 96C14.3 96 0 81.7 0 64zM224 224c35.3 0 64-28.7 64-64s-28.7-64-64-64L112 96l0 128 112 0zM112 288l0 128 144 0c35.3 0 64-28.7 64-64s-28.7-64-64-64l-32 0-112 0z"/></svg>`,
    italic: `<svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor"><path d="M128 64c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-58.7 0L160 416l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l58.7 0L224 96l-64 0c-17.7 0-32-14.3-32-32z"/></svg>`,
    heading: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8.7955 5.57376C8.16545 5.57379 7.7574 6.01638 7.7574 6.33616V7.96517C7.7574 8.58191 9.1145 8.58191 9.1145 7.96517V7.1343H11.0822L11.1102 10.8732H10.1584C9.42007 10.8733 9.42004 12.4337 10.1584 12.4338H13.5884C14.3268 12.4337 14.3268 10.8733 13.5884 10.8732H12.6853L12.6574 7.1343H14.6174V7.96517C14.6174 8.58191 16 8.60641 16 7.98968V6.36066C16 6.04088 15.66 5.57379 15.03 5.57376H8.7955Z"/><path d="M0.778442 0C0.155688 0 0 0.66007 0 0.990106V2.57251C0 3.85876 1.715 3.85876 1.715 2.57251C1.715 1.28625 1.715 1.715 1.715 1.715H4.21453V10.5513H2.62724C1.89745 10.5513 1.84272 12.4338 2.57251 12.4338H7.30397C8.03376 12.4338 8.08849 10.5513 7.35871 10.5513H5.77141V1.715H8.57502V2.57251C8.57502 3.85876 10.29 3.70423 10.29 2.57251V0.857502C10.29 0.527467 9.83026 0 9.2075 0H0.778442Z"/></svg>`,
    strike: `<svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M161.3 144c3.2-17.2 14-30.1 33.7-38.6c21.1-9 51.8-12.3 88.6-6.5c11.9 1.9 48.8 9.1 60.1 12c17.1 4.5 34.6-5.6 39.2-22.7s-5.6-34.6-22.7-39.2c-14.3-3.8-53.6-11.4-66.6-13.4c-44.7-7-88.3-4.2-123.7 10.9c-36.5 15.6-64.4 44.8-71.8 87.3c-.1 .6-.2 1.1-.2 1.7c-2.8 23.9 .5 45.6 10.1 64.6c4.5 9 10.2 16.9 16.7 23.9L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l448 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-209.9 0-.4-.1-1.1-.3c-36-10.8-65.2-19.6-85.2-33.1c-9.3-6.3-15-12.6-18.2-19.1c-3.1-6.1-5.2-14.6-3.8-27.4zM348.9 337.2c2.7 6.5 4.4 15.8 1.9 30.1c-3 17.6-13.8 30.8-33.9 39.4c-21.1 9-51.7 12.3-88.5 6.5c-18-2.9-49.1-13.5-74.4-22.1c-5.6-1.9-11-3.7-15.9-5.4c-16.8-5.6-34.9 3.5-40.5 20.3s3.5 34.9 20.3 40.5c3.6 1.2 7.9 2.7 12.7 4.3c24.9 8.5 63.6 21.7 87.6 25.6l.2 0c44.7 7 88.3 4.2 123.7-10.9c36.5-15.6 64.4-44.8 71.8-87.3c3.6-21 2.7-40.4-3.1-58.1l-75.7 0c7 5.6 11.4 11.2 13.9 17.2z"/></svg>`,
    link: `<svg width="16" height="16" viewBox="0 0 640 512" fill="currentColor"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>`,
    quote: `<svg width="16" height="16" viewBox="0 0 448 512" fill="currentColor"><path d="M448 296c0 66.3-53.7 120-120 120l-8 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l8 0c30.9 0 56-25.1 56-56l0-8-64 0c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l64 0c35.3 0 64 28.7 64 64l0 32 0 32 0 72zm-256 0c0 66.3-53.7 120-120 120l-8 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l8 0c30.9 0 56-25.1 56-56l0-8-64 0c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l64 0c35.3 0 64 28.7 64 64l0 32 0 32 0 72z"/></svg>`,
    code: `<svg width="16" height="16" viewBox="0 0 640 512" fill="currentColor"><path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/></svg>`,
    listUl: `<svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M64 144a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM64 464a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm48-208a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z"/></svg>`,
    listOl: `<svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M24 56c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24l0 120 16 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l16 0 0-96-8 0C34.7 80 24 69.3 24 56zM86.7 341.2c-6.5-7.4-18.3-6.9-24 1.2L51.5 357.9c-7.7 10.8-22.7 13.3-33.5 5.6s-13.3-22.7-5.6-33.5l11.1-15.6c23.7-33.2 72.3-35.6 99.2-4.9c21.3 24.4 20.8 60.9-1.1 84.7L86.8 432l33.2 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-88 0c-9.5 0-18.2-5.6-22-14.4s-2.1-18.9 4.3-25.9l72-78c5.3-5.8 5.4-14.6 .3-20.5zM224 64l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>`,
    folder: `<svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M288 109.3L288 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-242.7-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352l128 0c0 35.3 28.7 64 64 64s64-28.7 64-64l128 0c35.3 0 64 28.7 64 64l0 32c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64l0-32c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg>`,
    emoji: `<svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>`,
    plus: `<svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>`,
    preview: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>`
  };
  const CX_TOOL_TITLES = {
    bold: "粗体（⌘/Ctrl+B）",
    italic: "强调（⌘/Ctrl+I）",
    heading: "文本大小（循环 标题2→3→4→正文）",
    strike: "删除线",
    link: "链接（⌘/Ctrl+K）",
    quote: "块引用",
    code: "代码（⌘/Ctrl+E，多行自动围栏）",
    listUl: "无序列表",
    listOl: "有序列表",
    folder: "上传图片",
    emoji: "表情符号",
    plus: "更多（表格 / 日期 / 公式 / 投票…）",
    preview: "实时预览"
  };
  function cxComposerToolbarHtml() {
    const seq = ["bold", "italic", "heading", "strike", "link", "quote", "code", "listUl", "listOl", "folder", "emoji", "plus", "preview"];
    return seq.map((k) =>
      `<button type="button" class="cx-tool-btn" data-tool="${k}" title="${CX_TOOL_TITLES[k]}"${k === "folder" ? ` data-upload="1"` : ""}>${CX_EDITOR_ICONS[k]}</button>`
    ).join("") + `<span class="cx-composer-status"></span>` +
      `<button type="button" class="codex-composer-send" title="发送（Enter）" disabled>${ICONS.send}</button>`;
  }

  /* ---- 块级编辑器核心（聚焦块显示原文，其余块实时渲染） ---- */

  function cxMdBlocks(input) { return [...input.querySelectorAll(".cx-md-block")]; }
  function cxMdEnsureBlock(input) {
    if (!input.querySelector(".cx-md-block")) {
      const b = document.createElement("div");
      b.className = "cx-md-block";
      input.appendChild(b);
    }
  }
  function cxMdIsEmpty(input) { return !cxMdGetSource(input); }
  function cxMdGetSource(input) {
    return cxMdBlocks(input).map((b) => (b.dataset.src ?? b.innerText).trim()).filter(Boolean).join("\n\n");
  }
  function cxMdSyncActive(input) {
    const sel = getSelection();
    const node = sel.rangeCount ? sel.getRangeAt(0).startContainer : null;
    const block = (node?.nodeType === 1 ? node : node?.parentElement)?.closest?.(".cx-md-block");
    if (block?.parentNode === input) block.dataset.src = block.innerText;
    input.classList.toggle("has-content", !cxMdIsEmpty(input));
    cxSyncPreview(input);
    cxUpdateSendState();
  }
  function cxMdRenderBlock(block) {
    const src = (block.dataset.src ?? "").trim();
    block.classList.add("is-rendered");
    block.innerHTML = src ? cxMdToHtml(src) : "";
  }
  function cxMdEditBlock(block) {
    block.textContent = block.dataset.src ?? block.innerText;
    block.classList.remove("is-rendered");
  }
  function cxMdRenderAll(input) {
    const src = cxMdGetSource(input);
    const parts = src ? src.split(/\n{2,}/) : [""];
    input.innerHTML = "";
    for (const part of parts) {
      const b = document.createElement("div");
      b.className = "cx-md-block";
      b.dataset.src = part;
      input.appendChild(b);
      cxMdRenderBlock(b);
    }
    input.classList.toggle("has-content", !!src);
  }
  function cxMdClear(input) {
    input.innerHTML = "";
    cxMdEnsureBlock(input);
    input.classList.remove("has-content");
    cxSyncPreview(input);
    cxUpdateSendState();
  }
  function cxPlaceCaretEnd(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  function cxActiveBlock() {
    const sel = getSelection();
    const node = sel.rangeCount ? sel.getRangeAt(0).startContainer : null;
    const el = node?.nodeType === 1 ? node : node?.parentElement;
    return el?.closest?.(".cx-md-block") ?? null;
  }
  function cxInsertAtCaret(text) {
    const lines = String(text).split("\n");
    document.execCommand("insertText", false, lines[0]);
    for (let i = 1; i < lines.length; i++) {
      document.execCommand("insertLineBreak");
      document.execCommand("insertText", false, lines[i]);
    }
  }
  function cxEnsureActiveBlock(input) {
    let block = cxActiveBlock();
    if (!block) {
      input.focus({ preventScroll: true });
      block = cxActiveBlock();
      if (!block) {
        block = cxMdBlocks(input).at(-1);
        if (block) cxPlaceCaretEnd(block);
      }
    }
    if (block?.classList.contains("is-rendered")) {
      cxMdEditBlock(block);
      cxPlaceCaretEnd(block);
    }
    return block ?? null;
  }
  function cxCurrentSelText() {
    const sel = getSelection();
    return sel.rangeCount ? sel.getRangeAt(0).toString() : "";
  }
  function cxSelectBack(skipTail, len) {
    const sel = getSelection();
    if (!sel.rangeCount) return;
    const r = sel.getRangeAt(0);
    let node = r.startContainer;
    if (node.nodeType !== 3) node = node.lastChild;
    if (!node || node.nodeType !== 3) return;
    const end = node.length - skipTail;
    if (len <= 0 || end < 0 || end - len < 0) return;
    const range = document.createRange();
    range.setStart(node, end - len);
    range.setEnd(node, end);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  function cxInsertComposeText(input, text) {
    if (!text) return;
    input.focus({ preventScroll: true });
    const sel = getSelection();
    if (!sel.rangeCount || !input.contains(sel.getRangeAt(0).startContainer)) {
      cxPlaceCaretEnd(input);
    }
    cxInsertAtCaret(text);
    cxMdSyncActive(input);
  }

  /* ---- Markdown 格式工具（语义参考 Discourse composer toolbar） ---- */

  function cxApplyWrap(mark, placeholder) {
    const text = cxCurrentSelText();
    if (text.length >= mark.length * 2 && text.startsWith(mark) && text.endsWith(mark)) {
      cxInsertAtCaret(text.slice(mark.length, text.length - mark.length));
      return;
    }
    cxInsertAtCaret(mark + (text || placeholder) + mark);
    if (!text) cxSelectBack(mark.length, placeholder.length);
  }
  function cxApplyLinePrefix(input, kind) {
    cxTransformBlock(input, (src) => {
      const lines = src.split("\n");
      const markOf = (i) => (kind === "quote" ? "> " : kind === "ul" ? "- " : `${i + 1}. `);
      const allMarked = lines.every((line, i) => !line.trim() || line.startsWith(markOf(i)));
      return lines
        .map((line, i) => {
          const mark = markOf(i);
          if (allMarked) return line.startsWith(mark) ? line.slice(mark.length) : line;
          return mark + line;
        })
        .join("\n");
    });
  }
  function cxTransformBlock(input, fn) {
    const block = cxEnsureActiveBlock(input);
    if (!block) return;
    block.dataset.src = fn(block.dataset.src ?? block.innerText);
    block.textContent = block.dataset.src;
    cxPlaceCaretEnd(block);
    cxMdSyncActive(input);
  }
  function cxApplyCodeFormat(selText) {
    if (selText.includes("\n")) cxInsertAtCaret("\n```\n" + selText.replace(/\n+$/, "") + "\n```\n");
    else cxApplyWrap("`", "代码");
  }
  function cxApplyLinkFormat() {
    const text = cxCurrentSelText();
    cxInsertAtCaret(`[${text || "链接文字"}](https://)`);
    if (text) cxSelectBack(1, 8);
    else cxSelectBack(10, "链接文字".length);
  }
  function cxApplyHeadingFormat(input) {
    cxTransformBlock(input, (src) => {
      const lines = src.split("\n");
      const levelOf = (line) => (line.match(/^#{1,4} /)?.[0].length ?? 0) - 1;
      const levels = lines.map(levelOf);
      const cur = levels[0];
      const next = levels.every((lv) => lv === cur) && cur > 0 ? (cur === 4 ? 0 : cur + 1) : 2;
      return lines
        .map((line, i) => {
          const stripped = line.replace(/^#{1,4} /, "");
          return next === 0 ? stripped : `${"#".repeat(next)} ${levels[i] > 0 ? stripped : line}`;
        })
        .join("\n");
    });
  }
  function cxApplyMarkdownFormat(input, kind) {
    if (!input) return;
    cxEnsureActiveBlock(input);
    const text = cxCurrentSelText();
    switch (kind) {
      case "bold": return cxApplyWrap("**", "加粗文字");
      case "italic": return cxApplyWrap("*", "斜体文字");
      case "strike": return cxApplyWrap("~~", "删除文字");
      case "heading": return cxApplyHeadingFormat(input);
      case "code": return cxApplyCodeFormat(text);
      case "link": return cxApplyLinkFormat();
      case "quote": return cxApplyLinePrefix(input, "quote");
      case "listUl": return cxApplyLinePrefix(input, "ul");
      case "listOl": return cxApplyLinePrefix(input, "ol");
    }
  }

  /* ---- 预览条 ---- */

  function cxIsPreviewOn() {
    try { return localStorage.getItem(CX_PREVIEW_KEY) === "1"; } catch { return false; }
  }
  function cxSyncPreview(input) {
    const preview = input?.closest(".codex-composer")?.querySelector(".cx-compose-preview");
    if (!preview || !preview.classList.contains("active")) return;
    const src = cxMdGetSource(input);
    preview.innerHTML = src
      ? src.split(/\n{2,}/).map((part) => `<div class="cx-md-block is-rendered">${cxMdToHtml(part)}</div>`).join("")
      : "";
    preview.classList.toggle("is-empty", !src);
  }
  function cxTogglePreview(btn, input) {
    const preview = input.closest(".codex-composer")?.querySelector(".cx-compose-preview");
    if (!preview) return;
    const on = !preview.classList.contains("active");
    preview.classList.toggle("active", on);
    btn.classList.toggle("active", on);
    try { localStorage.setItem(CX_PREVIEW_KEY, on ? "1" : "0"); } catch { /* ignore */ }
    if (on) cxSyncPreview(input);
  }

  /* ---- 弹层（表情选择器 + 更多菜单） ---- */

  const CX_QUICK_EMOJI = [
    "😀", "😅", "😂", "🤣", "😊", "😍", "😘", "😜",
    "🤔", "😎", "🥳", "😴", "🙄", "😮", "😢", "😡",
    "🤝", "👍", "👎", "👏", "🙏", "💪", "🚀", "🔥",
    "✅", "❌", "⚡", "🎉", "❤️", "💔", "🤡", "🙈",
    "💯", "🤖", "👀", "🫡"
  ];
  let cxPopEl = null;
  let cxPopOutsideClose = null;
  function cxClosePop() {
    if (!cxPopEl) return;
    cxPopEl.remove();
    cxPopEl = null;
    if (cxPopOutsideClose) {
      document.removeEventListener("mousedown", cxPopOutsideClose);
      cxPopOutsideClose = null;
    }
  }
  function cxOpenPop(btn, className, html) {
    cxClosePop();
    cxPopEl = document.createElement("div");
    cxPopEl.className = className;
    cxPopEl.innerHTML = html;
    document.body.appendChild(cxPopEl);
    const rect = btn.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - cxPopEl.offsetWidth - 8));
    const top = Math.max(8, rect.top - cxPopEl.offsetHeight - 8);
    cxPopEl.style.left = left + "px";
    cxPopEl.style.top = top + "px";
    cxPopEl.addEventListener("mousedown", (e) => e.preventDefault());
    cxPopOutsideClose = (e) => {
      if (!cxPopEl?.contains(e.target)) cxClosePop();
    };
    document.addEventListener("mousedown", cxPopOutsideClose);
  }
  function cxNativeEmojiPicker(btn, onPick) {
    const owner = getEmberOwner();
    const menu = owner && safeLookup(owner, "service:menu");
    const detached = discourseRequire("discourse/components/emoji-picker/detached")?.default;
    if (!menu || !detached) return false;
    try {
      menu.show(btn, {
        identifier: "emoji-picker",
        groupIdentifier: "emoji-picker",
        component: detached,
        modalForMobile: true,
        data: { didSelectEmoji: (emoji) => onPick(emoji) }
      });
      return true;
    } catch { return false; }
  }
  function cxToggleEmojiPicker(btn, input) {
    if (cxNativeEmojiPicker(btn, (emoji) => cxInsertComposeText(input, `:${emoji}:`))) return;
    if (cxPopEl?.classList.contains("cx-emoji-pop")) return cxClosePop();
    cxOpenPop(btn, "cx-emoji-pop", `<div class="cx-emoji-grid">${CX_QUICK_EMOJI.map(
      (e) => `<button type="button" class="cx-emoji-item">${e}</button>`
    ).join("")}</div>`);
    cxPopEl.addEventListener("click", (e) => {
      const item = e.target.closest(".cx-emoji-item");
      if (!item) return;
      cxInsertComposeText(input, item.textContent);
      cxClosePop();
    });
  }
  function cxLocalDateMarkup() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai";
    return `[date=${date} time=${time} timezone="${tz}"] `;
  }
  function cxSurroundWith(input, before, after, placeholder) {
    const text = cxCurrentSelText();
    cxInsertComposeText(input, before + (text || placeholder) + after);
  }
  function cxInsertBlock(input, text) {
    cxInsertComposeText(input, text);
  }
  function cxEditorInsertQuoteOfTarget(input) {
    const targetPost = cxComposerTargetPost || Math.max(0, ...Object.keys(threadState.postsByNum || {}).map(Number));
    const post = threadState.postsByNum && threadState.postsByNum[targetPost];
    if (post?.id) {
      fetch(`/posts/${post.id}.json`, { credentials: "same-origin", headers: { "X-Requested-With": "XMLHttpRequest" } })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => cxInsertBlock(input, `[quote="${data.username}, post:${data.post_number}"]\n${data.raw}\n[/quote]`))
        .catch(() => setComposerStatus("引用加载失败", "err"));
    } else {
      setComposerStatus("未找到可引用的楼层", "err");
    }
  }
  const CX_PLUS_ACTIONS = {
    quote: cxEditorInsertQuoteOfTarget,
    table: (input) => cxInsertBlock(input, "| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n|  |  |  |\n"),
    scroll: (input) => cxSurroundWith(input, "[wrap=scroll]\n", "\n[/wrap]", "内容"),
    mermaid: (input) => cxInsertBlock(input, "```mermaid\nflowchart TD\n  A --> B\n```\n"),
    chart: (input) => cxInsertBlock(input, '```chart\n{"title":"图表标题","type":"bar","data":{"labels":["一","二"],"series":[[1,2]]}}\n```\n'),
    details: (input) => cxSurroundWith(input, '[details="标题"]\n', "\n[/details]\n", "内容"),
    graphviz: (input) => cxInsertBlock(input, "[graphviz]\ndigraph G {\n  A -> B;\n}\n[/graphviz]\n"),
    date: (input) => cxInsertBlock(input, cxLocalDateMarkup()),
    math: (input) => cxInsertBlock(input, "$$\n公式\n$$\n"),
    blur: (input) => cxSurroundWith(input, "[blur]", "[/blur]", "内容"),
    poll: (input) => cxInsertBlock(input, "[poll]\n- 选项一\n- 选项二\n[/poll]\n"),
    wrap: (input) => cxSurroundWith(input, "[wrap]\n", "\n[/wrap]", "内容")
  };
  const CX_PLUS_ITEMS = [
    { id: "quote", ico: "💬", label: "引用整个帖子" },
    { id: "table", ico: "▦", label: "插入表" },
    { id: "scroll", ico: "📜", label: "插入滚动内容" },
    { id: "mermaid", ico: "🧩", label: "Mermaid 图表" },
    { id: "chart", ico: "📈", label: "Build Chart" },
    { id: "details", ico: "▸", label: "隐藏详细信息" },
    { id: "graphviz", ico: "🕸", label: "插入 Graphviz" },
    { id: "date", ico: "🕐", label: "插入日期/时间" },
    { id: "math", ico: "√", label: "插入公式" },
    { id: "blur", ico: "🫧", label: "模糊剧透" },
    { id: "poll", ico: "🗳", label: "构建投票" },
    { id: "wrap", ico: "❏", label: "应用换行" }
  ];
  function cxTogglePlusPop(btn, input) {
    if (cxPopEl?.classList.contains("cx-plus-pop")) return cxClosePop();
    cxOpenPop(btn, "cx-plus-pop", CX_PLUS_ITEMS.map(
      (it) => `<button type="button" class="cx-plus-item" data-act="${it.id}"><span class="ico">${it.ico}</span>${it.label}</button>`
    ).join(""));
    cxPopEl.addEventListener("click", (e) => {
      const item = e.target.closest(".cx-plus-item");
      if (!item) return;
      const act = item.dataset.act;
      cxClosePop();
      input.focus();
      CX_PLUS_ACTIONS[act]?.(input);
    });
  }

  /* ---- 目标回复条 ---- */

  let cxComposerTargetPost = null;
  function cxComposerUi() {
    const card = document.querySelector(".codex-composer");
    return {
      card,
      input: card?.querySelector(".cx-md-edit"),
      target: card?.querySelector(".cx-compose-target"),
      send: card?.querySelector(".codex-composer-send"),
      status: card?.querySelector(".cx-composer-status")
    };
  }
  function cxSetComposerTarget(postNumber) {
    cxComposerTargetPost = postNumber ? Number(postNumber) : null;
    const { target, input } = cxComposerUi();
    if (!target) return;
    if (!cxComposerTargetPost) {
      target.classList.remove("active");
      return;
    }
    const post = threadState.postsByNum[String(cxComposerTargetPost)];
    const name = post?.name || post?.username;
    target.querySelector("span").textContent = name ? `回复 ${name} · #${cxComposerTargetPost}` : `回复 #${cxComposerTargetPost}`;
    target.classList.add("active");
    input?.focus();
  }
  function cxHideComposerTarget() {
    cxComposerTargetPost = null;
    const { target } = cxComposerUi();
    if (target) target.classList.remove("active");
  }

  /* ---- 图片上传：选择 / 粘贴 / 拖拽 → markdown 插入输入框 ---- */

  function cxImageFile(file) {
    if (!file) return false;
    if (String(file.type || "").toLowerCase().startsWith("image/")) return true;
    return /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(String(file.name || ""));
  }
  async function cxUploadComposerImages(files, input) {
    const selected = [...(files || [])].filter(cxImageFile);
    if (!selected.length) {
      setComposerStatus("请选择图片文件", "err");
      return;
    }
    if (composerUploading) {
      setComposerStatus("已有图片正在上传，请稍候", "err");
      return;
    }
    composerUploading = true;
    cxUpdateSendState();
    try {
      const marks = [];
      for (const file of selected) {
        setComposerStatus(`正在上传 ${file.name || "图片"}…`, "busy");
        const upload = await cxUploadImage(file);
        cxRegisterUploadUrl(upload.short_url, upload.url || upload.thumbnail_url);
        marks.push(cxImageMarkdown(upload, file));
      }
      const inputEl = input || cxComposerUi().input;
      if (inputEl) {
        cxInsertComposeText(inputEl, marks.join("\n"));
        setComposerStatus(`已添加 ${marks.length} 张图片`, "ok");
      } else {
        copyText(marks.join("\n"));
        setComposerStatus(`已上传，md 已复制到剪贴板`, "ok");
      }
    } catch (e) {
      setComposerStatus(`上传失败: ${(e && e.message) || "未知错误"}`, "err");
    } finally {
      composerUploading = false;
      cxUpdateSendState();
    }
  }
  function cxComposerTransferImages(event) {
    return cxTransferImages(event); // 复用顶层工具函数
  }

  /* ---- 发送：API 直发（/posts.json），失败转原生编辑器 ---- */

  function cxUpdateSendState() {
    const { input, send } = cxComposerUi();
    if (!input || !send) return;
    send.disabled = cxComposerSubmitting || composerUploading || cxMdIsEmpty(input);
  }
  async function cxApiReply(raw, topicId, replyTo) {
    const body = { raw, topic_id: Number(topicId) };
    if (replyTo) body.reply_to_post_number = Number(replyTo);
    const resp = await fetch("/posts.json", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "X-CSRF-Token": csrfToken(),
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(body)
    });
    const payload = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      throw new Error(payload.errors?.[0] || payload.error || `HTTP ${resp.status}`);
    }
    const post = payload.post || payload.created_post || payload;
    if (!post || (!post.id && !post.post_id)) throw new Error("站点未确认回复");
    return post;
  }
  async function cxNativeReply(raw, replyTo) {
    openNativeComposer(replyTo);
    let ta = null;
    for (let i = 0; i < 60 && !ta; i++) {
      await new Promise((r) => setTimeout(r, 100));
      ta = document.querySelector("#reply-control.open textarea, #reply-control.fullscreen textarea, #reply-control textarea");
    }
    if (!ta) throw new Error("无法打开原生编辑器");
    ta.focus();
    ta.value = raw;
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    const btn = document.querySelector(
      "#reply-control .save-or-cancel button.create, .save-or-cancel button.btn-primary, #reply-control button.create.btn-primary"
    );
    if (!btn) throw new Error("找不到原生提交按钮");
    btn.click();
  }
  function cxCompleteComposerSend(input) {
    cxMdClear(input);
    cxHideComposerTarget();
  }
  async function cxSubmitComposer() {
    const { input } = cxComposerUi();
    const raw = input ? cxMdGetSource(input) : "";
    if (!input || !raw.trim() || cxComposerSubmitting || composerUploading) return;
    const topicId = Number(threadState.topicId || 0);
    // 列表视图：内容原样转入原生「发新帖」编辑器（标题由用户补）
    if (!topicId) {
      if (!getCurrentUsername()) {
        setComposerStatus("登录后才能发帖", "err");
        return;
      }
      setComposerStatus("正在打开发帖编辑器…", "busy");
      openNewTopicComposer();
      let inserted = false;
      for (let i = 0; i < 60 && !inserted; i++) {
        await new Promise((r) => setTimeout(r, 100));
        inserted = insertMdIntoNative(raw);
      }
      if (inserted) {
        cxCompleteComposerSend(input);
        setComposerStatus("正文已转入原生发帖编辑器 ✓", "ok");
      } else {
        setComposerStatus("打开发帖编辑器失败", "err");
      }
      return;
    }
    cxComposerSubmitting = true;
    cxUpdateSendState();
    setComposerStatus("正在发送…", "busy");
    const replyTo = cxComposerTargetPost || undefined;
    try {
      try {
        await cxApiReply(raw, topicId, replyTo);
        cxCompleteComposerSend(input);
        setComposerStatus("已发送 ✓", "ok");
        refreshAfterReply();
      } catch (apiError) {
        setComposerStatus(`接口发送失败，转入原生编辑器：${apiError.message || ""}`, "err");
        try {
          await cxNativeReply(raw, replyTo);
          cxCompleteComposerSend(input);
          setComposerStatus("已通过原生编辑器发送 ✓", "ok");
        } catch (nativeError) {
          setComposerStatus(`发送失败：${nativeError.message || apiError.message || "未知错误"}`, "err");
        }
      }
    } finally {
      cxComposerSubmitting = false;
      cxUpdateSendState();
    }
  }
  /** 发送成功后重拉话题，把新楼层并入线程（长帖也只显示最近一页，与 loadTopic 语义一致） */
  async function refreshAfterReply() {
    const topicId = threadState.topicId;
    if (!topicId) return;
    try {
      const data = await api(`/t/${topicId}.json`);
      if (threadState.topicId !== topicId) return;
      const posts = (data.post_stream && data.post_stream.posts) || [];
      threadState.stream = (data.post_stream && data.post_stream.stream) || posts.map((p) => p.id);
      threadState.renderedFirstIdx = 0;
      threadState.renderedLastIdx = threadState.stream.length - 1;
      threadState.hasOlder = false;
      threadState.hasNewer = false;
      threadState.postsCount = data.posts_count || posts.length;
      for (const p of posts) {
        if (p.post_number) threadState.postsByNum[p.post_number] = p;
      }
      const box = detailContainer();
      if (box && posts.length) {
        renderTurns(box, posts, "replace");
        syncThreadDivider();
        const scroller = document.querySelector(".cx-view-detail");
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
      }
      syncChrome();
    } catch { /* 保留现状 */ }
  }

  /* ---- 交互绑定（幂等） ---- */

  function cxWireComposer(card) {
    const input = card.querySelector(".cx-md-edit");
    if (!input || input.dataset.cxWired === "1") return;
    input.dataset.cxWired = "1";
    cxMdEnsureBlock(input);

    const send = card.querySelector(".codex-composer-send");
    const fileInput = card.querySelector(".cx-composer-file");
    const targetClose = card.querySelector(".cx-compose-target button");

    function onInput() {
      cxMdSyncActive(input);
    }
    input.addEventListener("input", onInput);
    // 点击已渲染块 → 还原原文编辑，光标落在点击处（同 im）
    input.addEventListener("mousedown", (e) => {
      const block = e.target.closest?.(".cx-md-block");
      if (!block?.classList.contains("is-rendered")) return;
      if (document.activeElement === input) {
        e.preventDefault();
        cxMdEditBlock(block);
        const r = document.caretRangeFromPoint?.(e.clientX, e.clientY);
        const sel = getSelection();
        if (r && block.contains(r.startContainer)) {
          sel.removeAllRanges();
          sel.addRange(r);
        } else {
          cxPlaceCaretEnd(block);
        }
      } else {
        input._caretAt = { x: e.clientX, y: e.clientY };
      }
    });
    input.addEventListener("focusin", () => {
      const at = input._caretAt;
      input._caretAt = null;
      let hit = at && document.caretRangeFromPoint?.(at.x, at.y);
      let block = hit && (hit.startContainer.nodeType === 1 ? hit.startContainer : hit.startContainer.parentElement)?.closest?.(".cx-md-block");
      if (block) {
        if (block.classList.contains("is-rendered")) cxMdEditBlock(block);
        hit = document.caretRangeFromPoint?.(at.x, at.y);
        const sel = getSelection();
        if (hit && block.contains(hit.startContainer)) {
          sel.removeAllRanges();
          sel.addRange(hit);
        } else {
          cxPlaceCaretEnd(block);
        }
        return;
      }
      block = cxActiveBlock() ?? input.querySelector(".cx-md-block");
      if (!block) return;
      if (block.classList.contains("is-rendered")) {
        cxMdEditBlock(block);
        cxPlaceCaretEnd(block);
      }
    });
    input.addEventListener("focusout", () => {
      cxMdSyncActive(input);
      cxMdRenderAll(input);
    });
    input.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && !e.isComposing) {
        const act = { b: "bold", i: "italic", e: "code", k: "link" }[e.key.toLowerCase()];
        if (act) {
          e.preventDefault();
          e.stopPropagation();
          cxEnsureActiveBlock(input);
          cxApplyMarkdownFormat(input, act);
          return;
        }
      }
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
        e.preventDefault();
        e.stopPropagation();
        if (!cxMdIsEmpty(input)) cxSubmitComposer();
        return;
      }
      if (e.key === "Enter" && e.shiftKey && !e.isComposing) {
        e.preventDefault();
        document.execCommand("insertLineBreak");
        return;
      }
      if (e.key === "Backspace" && cxMdBlocks(input).length === 1 && !input.innerText.trim()) {
        e.preventDefault();
      }
    });

    send?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      cxSubmitComposer();
    });

    // 工具栏：folder 走文件选择，其余按 data-tool 分发
    for (const btn of card.querySelectorAll(".cx-tool-btn")) {
      const kind = btn.dataset.tool;
      btn.addEventListener("mousedown", (e) => e.preventDefault());
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (kind === "folder") {
          fileInput?.click();
        } else if (kind === "emoji") {
          cxToggleEmojiPicker(btn, input);
        } else if (kind === "plus") {
          cxTogglePlusPop(btn, input);
        } else if (kind === "preview") {
          cxTogglePreview(btn, input);
        } else {
          cxApplyMarkdownFormat(input, kind);
        }
      });
    }
    fileInput?.addEventListener("change", (e) => {
      cxUploadComposerImages(e.target.files, input);
      e.target.value = "";
    });

    // 粘贴 / 拖拽图片 → 上传后插入输入框；纯文本粘贴统一走明文进 markdown 源
    input.addEventListener("paste", (e) => {
      const files = cxComposerTransferImages(e);
      if (files.length) {
        e.preventDefault();
        e.stopPropagation();
        cxUploadComposerImages(files, input);
        return;
      }
      const text = e.clipboardData?.getData?.("text/plain");
      if (text) {
        e.preventDefault();
        e.stopPropagation();
        cxInsertComposeText(input, text);
      }
    });
    const swallow = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
    card.addEventListener("dragover", swallow);
    card.addEventListener("drop", (e) => {
      const files = cxComposerTransferImages(e);
      if (!files.length) return;
      swallow(e);
      cxUploadComposerImages(files, input);
    });

    targetClose?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      cxHideComposerTarget();
      input.focus();
    });

    // 预览条开关状态持久化恢复
    if (cxIsPreviewOn()) {
      card.querySelector(".cx-compose-preview")?.classList.add("active");
      card.querySelector('.cx-tool-btn[data-tool="preview"]')?.classList.add("active");
      cxSyncPreview(input);
    }
  }

  /* ---------- 当前用户名（移植自 feishu 脚本） ---------- */

  let cachedUsername = null;

  function normalizeUsername(name) {
    return (name || "").trim().replace(/^@/, "").toLowerCase();
  }

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
        "#current-user [data-user-card]",
        "button.icon.btn-flat[data-user-card]",
        ".header-dropdown-toggle.current-user a[href*='/u/']",
        ".current-user a[href*='/u/']"
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const fromHref = extractUsernameFromHref(el.getAttribute("href") || "");
        if (fromHref) {
          cachedUsername = fromHref;
          return cachedUsername;
        }
        const card = el.getAttribute("data-user-card");
        if (card) {
          cachedUsername = card;
          return cachedUsername;
        }
      }

      const img = document.querySelector("#current-user img[alt], .current-user img[alt]");
      if (img && img.alt && !/avatar|头像/i.test(img.alt)) {
        cachedUsername = img.alt.trim();
        return cachedUsername;
      }

      const preloaded = readPreloadedCurrentUser();
      if (preloaded) {
        cachedUsername = preloaded;
        return cachedUsername;
      }

      // Ember 容器兜底
      try {
        const owner =
          window.Discourse?.__container__ ||
          document.querySelector(".ember-application")?.__ember_meta__?.owner;
        const user = owner?.lookup?.("service:current-user") ||
          window.Discourse?.User?.current?.();
        const name = user?.username || user?.get?.("username");
        if (name) {
          cachedUsername = name;
          return cachedUsername;
        }
      } catch { /* ignore */ }
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

  /** 列表 JSON 端点按路由映射 */
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
    const c = pathname.match(/^\/c\/([\w-]+(?:\/[\w-]+)?)/);
    if (c) return `/c/${c[1]}.json`;
    const t = pathname.match(/^\/tag\/([\w-]+)/);
    if (t) return `/tag/${t[1]}.json`;
    return "/latest.json";
  }

  /** 列表视图大标题 */
  function listTitleForPath(pathname) {
    if (pathname === "/" || pathname === "/latest") return "最新";
    if (pathname === "/new") return "新话题";
    if (pathname === "/unread" || pathname === "/unseen") return "未读";
    if (pathname === "/top") return "排行榜";
    if (pathname === "/hot") return "热门";
    if (pathname === "/posted") return "我的帖子";
    if (pathname === "/read") return "已读";
    if (pathname === "/bookmarks") return "稍后看";
    const c = pathname.match(/^\/c\/([\w-]+)/);
    if (c) {
      const idM = pathname.match(/\/(\d+)$/);
      const cat = idM ? categoryById(Number(idM[1])) : categoryBySlug(c[1]);
      if (cat) return cat.name;
      return c[1];
    }
    const t = pathname.match(/^\/tag\/([\w-]+)/);
    if (t) return `#${t[1]}`;
    return "最新";
  }

  /** 当前列表路由对应的分类 id（用于新话题 composer 预填分类） */
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

  /* ============================== 互斥避让 ============================== */

  /** 飞书 / IDEA 主题脚本已激活时，本脚本全程避让 */
  function otherThemeActive() {
    const root = document.documentElement;
    return root.classList.contains("feishu-im-theme") ||
      root.classList.contains("idea-ide-home") ||
      root.classList.contains("idea-ide-theme") ||
      !!document.getElementById("linuxdo-idea-theme") ||
      !!document.getElementById("linuxdo-feishu-theme");
  }

  /* ============================== CSS ============================== */

  // 视觉 token 实测自 Codex 桌面 app 深/浅两版截图；所有组件一律引用变量，明暗共用一套规则
  const RAW_CSS = String.raw`
    /* ---------- Token：深色（默认） ---------- */
    .${ROOT_CLASS} {
      /* 左栏深青灰蓝（用户提供截图实测 #27353b），hover/active 为同色系亮阶 */
      --cx-rail-bg: #27353b;
      --cx-rail-bg-hover: #2e3d44;
      --cx-rail-bg-active: #35454d;
      --cx-rail-text: #dedede;
      --cx-rail-text-dim: #96a0a4;
      --cx-rail-text-faint: #6c787d;
      --cx-rail-border: rgba(255, 255, 255, 0.06);

      --cx-bg: #181818;
      --cx-bg-raised: #242424;
      --cx-bg-inset: #1c1c1c;
      --cx-bg-deep: #161616;       /* 代码面板 tab 条 */
      --cx-panel-bg: #181818;
      --cx-composer-bg: #2a2a2a;

      --cx-border: rgba(255, 255, 255, 0.08);
      --cx-border-soft: rgba(255, 255, 255, 0.05);
      --cx-border-strong: rgba(255, 255, 255, 0.14);
      --cx-text: #ececec;
      --cx-text-secondary: #b9b9b9;
      --cx-text-dim: #909090;
      --cx-text-faint: #646464;

      --cx-blue: #83c3fe;
      --cx-blue-soft: rgba(131, 195, 254, 0.15);
      --cx-chip-bg: #2e2e2e;
      --cx-chip-text: #ececec;
      --cx-btn-hover: #333333;
      --cx-wash: rgba(255, 255, 255, 0.03);
      --cx-scroll-thumb: rgba(255, 255, 255, 0.12);
      --cx-send-bg: #8a8a8a;
      --cx-send-icon: #1f1f1f;

      --cx-code-text: #cfcfcf;
      --cx-code-gutter: #565656;
      --cx-tok-k: #f0954e;
      --cx-tok-s: #78cf70;
      --cx-tok-c: #6f7a6f;
      --cx-tok-t: #b06dff;
      --cx-tok-f: #63c2f2;
      --cx-tok-n: #64b5e0;
      --cx-tok-m: #cf8b45;
      --cx-diff-add-bg: rgba(64, 201, 119, 0.10);
      --cx-diff-add-ln: #4d8f68;
      --cx-diff-del-bg: rgba(250, 66, 62, 0.09);
      --cx-diff-del-ln: #9a5a58;
      --cx-diff-hunk-bg: rgba(131, 195, 254, 0.07);
      --cx-diff-hunk-tx: #7ba6c9;

      --cx-font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
        "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      --cx-font-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas,
        "Liberation Mono", monospace;

      --cx-rail-w: ${RAIL_WIDTH}px;
      --cx-radius: 10px;
    }

    /* ---------- Token：浅色 ---------- */
    .${ROOT_CLASS}.codex-light {
      --cx-rail-bg: #e7edee;
      --cx-rail-bg-hover: #dde4e6;
      --cx-rail-bg-active: #d2dbdd;
      --cx-rail-text: #2c3438;
      --cx-rail-text-dim: #6e6f72;
      --cx-rail-text-faint: #97989a;
      --cx-rail-border: rgba(0, 0, 0, 0.07);

      --cx-bg: #f4f4f4;
      --cx-bg-raised: #ffffff;
      --cx-bg-inset: #fafafa;
      --cx-bg-deep: #ebebeb;
      --cx-panel-bg: #ffffff;
      --cx-composer-bg: #ffffff;

      --cx-border: rgba(0, 0, 0, 0.10);
      --cx-border-soft: rgba(0, 0, 0, 0.06);
      --cx-border-strong: rgba(0, 0, 0, 0.16);
      --cx-text: #1b1c1e;
      --cx-text-secondary: #55565a;
      --cx-text-dim: #737477;
      --cx-text-faint: #a2a3a5;

      --cx-blue: #2a98ff;
      --cx-blue-soft: rgba(42, 152, 255, 0.13);
      --cx-chip-bg: #ededed;
      --cx-chip-text: #1b1c1e;
      --cx-btn-hover: #e6e6e6;
      --cx-wash: rgba(0, 0, 0, 0.04);
      --cx-scroll-thumb: rgba(0, 0, 0, 0.18);
      --cx-send-bg: #3c3c3c;
      --cx-send-icon: #ffffff;

      --cx-code-text: #26282b;
      --cx-code-gutter: #9c9da1;
      --cx-tok-k: #aa3d00;
      --cx-tok-s: #1c7d28;
      --cx-tok-c: #8a9086;
      --cx-tok-t: #8a40d0;
      --cx-tok-f: #1670d8;
      --cx-tok-n: #2a62c9;
      --cx-tok-m: #b25f00;
      --cx-diff-add-bg: rgba(23, 160, 88, 0.10);
      --cx-diff-add-ln: #2e8352;
      --cx-diff-del-bg: rgba(230, 60, 55, 0.10);
      --cx-diff-del-ln: #b3403c;
      --cx-diff-hunk-bg: rgba(42, 152, 255, 0.08);
      --cx-diff-hunk-tx: #46769e;
    }

      --cx-font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
        "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      --cx-font-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas,
        "Liberation Mono", monospace;

      --cx-rail-w: ${RAIL_WIDTH}px;
      --cx-radius: 10px;
    }

    /* ---------- 自绘 UI 统一盒模型 ---------- */
    .codex-rail, .codex-rail *,
    .codex-main, .codex-main * { box-sizing: border-box; }

    /* ---------- 顶栏视觉隐藏（保留 DOM，供 user-menu / composer 挂载点击） ---------- */
    .${ROOT_CLASS} .d-header-wrap,
    .${ROOT_CLASS} .d-header {
      position: fixed !important;
      left: 0 !important; top: 0 !important;
      width: 0 !important; height: 0 !important;
      max-width: 0 !important; max-height: 0 !important;
      overflow: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      margin: 0 !important; padding: 0 !important;
      border: none !important;
      clip: rect(0, 0, 0, 0) !important;
      z-index: -1 !important;
    }
    /* 允许脚本对原生按钮做 programmatic click */
    .${ROOT_CLASS} #current-user,
    .${ROOT_CLASS} #toggle-current-user,
    .${ROOT_CLASS} .header-dropdown-toggle.current-user,
    .${ROOT_CLASS} #create-topic,
    .${ROOT_CLASS} #search-button {
      pointer-events: auto !important;
    }

    /* ---------- 非锁定路由：rail 常驻，原生主内容右移 ---------- */
    .${ROOT_CLASS}:not(.${LOCK_CLASS}) #main-outlet-wrapper {
      margin-left: var(--cx-rail-w) !important;
      padding-top: 0 !important;
    }

    /* ---------- 锁定路由：隐藏原生主内容 ---------- */
    .${ROOT_CLASS}.${LOCK_CLASS} body { overflow: hidden !important; }
    .${ROOT_CLASS}.${LOCK_CLASS} #main-outlet > * {
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
    }
    .${ROOT_CLASS}.${LOCK_CLASS} #main-outlet-wrapper,
    .${ROOT_CLASS}.${LOCK_CLASS} #main-outlet {
      pointer-events: none !important;
      padding-top: 0 !important;
    }

    /* 底部聊天抽屉等会破坏观感，隐藏 */
    .${ROOT_CLASS} .chat-drawer-container,
    .${ROOT_CLASS} #chat-drawer,
    .${ROOT_CLASS} .chat-drawer,
    .${ROOT_CLASS} [id*="chat-drawer"] {
      display: none !important;
    }

    /* ---------- 原生 composer：关闭态隐藏，打开态铺到主区 ---------- */
    .${ROOT_CLASS}.${LOCK_CLASS} #reply-control:not(.open):not(.fullscreen):not(.edit-title) {
      display: none !important;
      pointer-events: none !important;
      z-index: 0 !important;
    }
    .${ROOT_CLASS}.${LOCK_CLASS} #reply-control.open,
    .${ROOT_CLASS}.${LOCK_CLASS} #reply-control.edit-title,
    .${ROOT_CLASS}.${LOCK_CLASS} #reply-control.fullscreen {
      display: block !important;
      left: calc(var(--cx-rail-w) + 12px) !important;
      right: 12px !important;
      width: auto !important;
      max-width: none !important;
      z-index: 700 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      border-radius: 12px 12px 0 0 !important;
      background: var(--cx-bg-raised) !important;
      color: var(--cx-text) !important;
      box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.5) !important;
      /* 站点可能是浅色方案：composer 强制深色调色板 */
      --primary: var(--cx-text);
      --primary-medium: var(--cx-text-secondary);
      --primary-low: var(--cx-text-dim);
      --primary-very-low: var(--cx-chip-bg);
      --primary-50: var(--cx-bg-inset);
      --primary-100: var(--cx-bg-raised);
      --primary-200: var(--cx-btn-hover);
      --primary-300: var(--cx-border-strong);
      --secondary: var(--cx-bg-raised);
      --tertiary: var(--cx-blue);
      --quaternary: var(--cx-blue);
      --d-hover: var(--cx-wash);
    }
    .${ROOT_CLASS}.${LOCK_CLASS} #reply-control .reply-area {
      max-width: none !important;
      padding-left: 20px !important;
      padding-right: 20px !important;
    }

    /* ---------- 收养的原生用户菜单：仅 html.codex-notif-open 时可见 ---------- */
    .${ROOT_CLASS} .user-menu.codex-user-menu-float,
    .${ROOT_CLASS} .user-menu.revamped.menu-panel.codex-user-menu-float,
    .${ROOT_CLASS} .user-menu.menu-panel.codex-user-menu-float {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    .${ROOT_CLASS}.codex-notif-open .user-menu.codex-user-menu-float,
    .${ROOT_CLASS}.codex-notif-open .user-menu.revamped.menu-panel.codex-user-menu-float,
    .${ROOT_CLASS}.codex-notif-open .user-menu.menu-panel.codex-user-menu-float {
      display: block !important;
      position: fixed !important;
      left: 12px !important;
      bottom: 60px !important;
      top: auto !important;
      right: auto !important;
      width: 340px !important;
      max-width: min(340px, calc(100vw - 24px)) !important;
      max-height: min(72vh, 640px) !important;
      margin: 0 !important;
      z-index: 900 !important;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55) !important;
      border-radius: 12px !important;
      overflow: auto !important;
      pointer-events: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      background: var(--cx-bg-raised) !important;
      color: var(--cx-text) !important;
      clip: auto !important;
      /* 深色调色板 */
      --primary: var(--cx-text);
      --primary-medium: var(--cx-text-secondary);
      --primary-low: var(--cx-text-dim);
      --primary-very-low: var(--cx-chip-bg);
      --primary-50: var(--cx-bg-inset);
      --primary-100: var(--cx-bg-raised);
      --primary-200: var(--cx-btn-hover);
      --secondary: var(--cx-bg-raised);
      --tertiary: var(--cx-blue);
      --d-hover: var(--cx-wash);
    }

    /* ---------- splash ---------- */
    .${ROOT_CLASS} #d-splash { background: var(--cx-bg) !important; }
    .${ROOT_CLASS} #d-splash .dots { background-color: var(--cx-blue) !important; filter: none !important; }

    /* ================= 左 rail ================= */
    .codex-rail {
      position: fixed;
      left: 0; top: 0; bottom: 0;
      width: var(--cx-rail-w);
      background: var(--cx-rail-bg);
      color: var(--cx-rail-text);
      display: flex;
      flex-direction: column;
      user-select: none;
      z-index: 800;
      font-family: var(--cx-font-ui);
      font-size: 14px;
    }

    .codex-rail-traffic {
      height: 46px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 2px;
      padding: 0 14px;
      color: var(--cx-rail-text-dim);
      flex: none;
    }
    .codex-rail-traffic svg { width: 20px; height: 20px; padding: 2px; border-radius: 6px; cursor: pointer; }
    .codex-rail-traffic svg:hover { background: var(--cx-rail-bg-hover); color: var(--cx-rail-text); }

    .codex-rail-brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2px 14px 10px;
      flex: none;
    }
    .codex-rail-brand-name {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 17px;
      font-weight: 600;
      letter-spacing: 0.2px;
      cursor: pointer;
    }
    .codex-rail-brand-name svg { width: 12px; height: 12px; color: var(--cx-rail-text-dim); }
    .codex-rail-brand-actions { display: flex; gap: 2px; color: var(--cx-rail-text-dim); }
    .codex-rail-brand-actions svg { width: 19px; height: 19px; padding: 2px; border-radius: 6px; cursor: pointer; }
    .codex-rail-brand-actions svg:hover { background: var(--cx-rail-bg-hover); color: var(--cx-rail-text); }
    .codex-rail-bell { position: relative; display: inline-flex; }
    .codex-rail-bell.has-unread::after {
      content: "";
      position: absolute;
      top: 1px; right: 1px;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--cx-blue);
      border: 1.5px solid var(--cx-rail-bg);
    }

    .codex-rail-scroll { flex: 1; overflow-y: auto; padding-bottom: 8px; }
    .codex-rail-scroll::-webkit-scrollbar { width: 8px; }
    .codex-rail-scroll::-webkit-scrollbar-thumb { background: var(--cx-scroll-thumb); border-radius: 4px; }

    .codex-rail-nav { padding: 2px 8px; display: flex; flex-direction: column; gap: 1px; }
    .codex-rail-item {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 5px 10px;
      border-radius: var(--cx-radius);
      font-size: 13.5px;
      color: var(--cx-rail-text);
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .codex-rail-item:hover { background: var(--cx-rail-bg-hover); }
    .codex-rail-item.active { background: var(--cx-rail-bg-active); }
    .codex-rail-item svg { width: 16px; height: 16px; flex: none; color: var(--cx-rail-text-dim); }
    .codex-rail-item.active svg { color: var(--cx-rail-text); }

    .codex-rail-section {
      padding: 18px 18px 4px;
      font-size: 12px;
      color: var(--cx-rail-text-faint);
    }
    .codex-rail-section-items { padding: 0 8px; display: flex; flex-direction: column; gap: 1px; }

    .codex-rail-item .cx-dot {
      margin-left: auto;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--cx-blue);
      flex: none;
    }
    .codex-rail-item .cx-count {
      margin-left: auto;
      font-size: 12px;
      color: var(--cx-rail-text-dim);
      flex: none;
    }
    .codex-rail-item.cx-faint { color: var(--cx-rail-text-faint); }
    /* 分类下的 session 子条目：缩进与父项文字对齐、更小更淡 */
    .codex-rail-subitem {
      padding: 4px 10px 4px 41px;
      font-size: 13px;
      color: var(--cx-rail-text-dim);
    }
    .codex-rail-subitem .cx-dot { width: 6px; height: 6px; }
    .codex-rail-item .cx-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }

    .codex-rail-foot {
      border-top: 1px solid var(--cx-rail-border);
      padding: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      flex: none;
    }
    .codex-rail-foot-user {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      border-radius: var(--cx-radius);
      cursor: pointer;
      font-size: 14px;
      min-width: 0;
    }
    .codex-rail-foot-user:hover { background: var(--cx-rail-bg-hover); }
    .codex-rail-foot-user svg { width: 17px; height: 17px; color: var(--cx-rail-text-dim); flex: none; }
    .codex-rail-foot-user .cx-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    /* 左下角明暗切换按钮：置于最高层，保证任何浮层之下都可点 */
    .codex-rail .cx-mode-btn {
      position: relative;
      z-index: 2147483000;
      flex: none;
      width: 36px; height: 36px;
      padding: 0;
      border: none;
      background: none;
      border-radius: 9px;
      color: var(--cx-rail-text-dim);
      display: grid;
      place-items: center;
      cursor: pointer;
    }
    .codex-rail .cx-mode-btn:hover { background: var(--cx-rail-bg-hover); color: var(--cx-rail-text); }
    .codex-rail .cx-mode-btn svg { width: 18px; height: 18px; pointer-events: none; }

    /* ================= 右侧主区 ================= */
    .codex-main {
      position: fixed;
      left: var(--cx-rail-w); right: 0; top: 0; bottom: 0;
      background: var(--cx-bg);
      color: var(--cx-text);
      display: flex;
      flex-direction: column;
      min-width: 0;
      z-index: 500;
      font-family: var(--cx-font-ui);
      font-size: 14px;
      -webkit-font-smoothing: antialiased;
    }

    .codex-topbar {
      height: 46px;
      flex: none;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      border-bottom: 1px solid var(--cx-border-soft);
      color: var(--cx-text-secondary);
    }
    .codex-topbar svg { width: 16px; height: 16px; flex: none; }
    .codex-topbar .cx-crumb { display: flex; align-items: center; gap: 7px; font-size: 13px; min-width: 0; }
    .codex-topbar .cx-crumb .cx-proj { color: var(--cx-text); cursor: pointer; }
    .codex-topbar .cx-crumb .cx-model { color: var(--cx-text-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .codex-topbar .cx-spacer { flex: 1; }
    .codex-topbar .cx-icon-btn {
      padding: 5px;
      border-radius: 6px;
      cursor: pointer;
      color: var(--cx-text-dim);
      display: grid;
      place-items: center;
      border: none;
      background: none;
    }
    .codex-topbar .cx-icon-btn:hover { background: var(--cx-bg-raised); color: var(--cx-text); }
    .codex-topbar .cx-menu-btn { display: none; }

    .codex-thread {
      flex: 1;
      min-width: 0;
      overflow-y: auto;
      padding: 28px 40px 40px;
      scrollbar-width: thin;
    }
    .codex-thread::-webkit-scrollbar { width: 8px; }
    .codex-thread::-webkit-scrollbar-thumb { background: var(--cx-scroll-thumb); border-radius: 4px; }
    .codex-thread-inner { max-width: 760px; margin: 0 auto; }
    /* 详情视图整体紧凑一点 */
    .cx-view-detail { padding-top: 20px; padding-bottom: 28px; }

    /* —— 列表视图（分类 / 最新 / 热门 → Codex 项目视图）—— */
    .cx-proj-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin: 6px 0 2px;
    }
    .cx-proj-head h1 { font-size: 20px; font-weight: 600; letter-spacing: 0.2px; margin: 0; }
    .cx-new-topic-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--cx-font-ui);
      font-size: 12.5px;
      font-weight: 500;
      color: var(--cx-text);
      background: var(--cx-chip-bg);
      border: 1px solid var(--cx-border-strong);
      border-radius: 999px;
      padding: 6px 13px;
      cursor: pointer;
    }
    .cx-new-topic-btn:hover { background: var(--cx-btn-hover); }
    .cx-new-topic-btn svg { width: 13px; height: 13px; }
    .cx-proj-desc {
      font-size: 12.5px;
      color: var(--cx-text-dim);
      margin-bottom: 16px;
    }
    /* 列表头：筛选展开按钮 + 筛选项 chips（参考飞书中栏筛选） */
    .cx-head-title { display: flex; align-items: center; gap: 4px; min-width: 0; }
    .codex-main .cx-filter-btn {
      width: 26px; height: 26px;
      border-radius: 7px;
      color: var(--cx-text-dim);
      display: grid;
      place-items: center;
      cursor: pointer;
      border: none;
      background: none;
    }
    .codex-main .cx-filter-btn:hover { background: var(--cx-btn-hover); color: var(--cx-text); }
    .codex-main .cx-filter-btn svg { width: 14px; height: 14px; transition: transform 0.15s; }
    .codex-main.cx-filters-open .cx-filter-btn svg { transform: rotate(180deg); }
    .cx-filter-row { display: none; flex-wrap: wrap; gap: 6px; margin: 2px 0 10px; }
    .codex-main.cx-filters-open .cx-filter-row { display: flex; }
    .cx-fchip {
      font-size: 12px;
      color: var(--cx-text-secondary);
      background: var(--cx-chip-bg);
      border-radius: 999px;
      padding: 3px 11px;
      cursor: pointer;
      white-space: nowrap;
    }
    .cx-fchip:hover { background: var(--cx-btn-hover); color: var(--cx-text); }
    .cx-fchip.cx-on { background: var(--cx-blue-soft); color: var(--cx-blue); }
    /* /new（新）列表下「所有 / 话题 / 回复」筛选条（吸附原生 toggle，参照 im） */
    .cx-new-toggle {
      display: none; flex-wrap: wrap; gap: 6px;
      margin: 0 0 10px;
    }
    .cx-new-toggle.cx-show { display: flex; }
    .cx-new-toggle-btn {
      height: 24px; padding: 0 12px;
      border: 1px solid var(--cx-border);
      border-radius: 999px;
      background: transparent; color: var(--cx-text-dim);
      font-size: 12px; cursor: pointer;
      font-family: var(--cx-font-ui);
      display: inline-flex; align-items: center; gap: 4px;
      white-space: nowrap; flex-shrink: 0;
    }
    .cx-new-toggle-btn + .cx-new-toggle-btn { margin-left: 2px; }
    .cx-new-toggle-btn:hover { background: var(--cx-chip-bg); color: var(--cx-text); }
    .cx-new-toggle-btn .n { font-weight: 600; }
    .cx-new-toggle-btn.active {
      background: var(--cx-blue-soft); border-color: var(--cx-blue); color: var(--cx-blue); font-weight: 600;
    }
    .cx-thread-rows { display: flex; flex-direction: column; }
    .cx-trow {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      margin: 0 -10px;
      border-radius: var(--cx-radius);
      cursor: pointer;
      min-width: 0;
    }
    .cx-trow:hover { background: var(--cx-bg-raised); }
    .cx-trow-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      flex: none;
      background: transparent;
      border: 1.5px solid var(--cx-text-faint);
    }
    .cx-trow-dot.cx-unread { background: var(--cx-blue); border-color: var(--cx-blue); }
    .cx-trow-pin { width: 13px; height: 13px; flex: none; color: var(--cx-text-dim); }
    .cx-trow-title {
      font-size: 13.5px;
      color: var(--cx-text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .cx-trow.cx-read .cx-trow-title { color: var(--cx-text-secondary); }
    .cx-trow-meta {
      margin-left: auto;
      flex: none;
      font-size: 12px;
      color: var(--cx-text-faint);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cx-trow-sub {
      font-size: 12px;
      color: var(--cx-text-dim);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .cx-trow-texts { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .cx-trow-sep { height: 1px; background: var(--cx-border-soft); margin: 2px 0; }
    .cx-list-status {
      padding: 14px;
      text-align: center;
      font-size: 12px;
      color: var(--cx-text-faint);
    }

    /* —— 用户 turn（楼主帖）—— */
    .cx-turn-user {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 6px;
    }
    .cx-turn-user-bubble {
      background: var(--cx-chip-bg);
      border-radius: 16px;
      padding: 10px 16px;
      max-width: 85%;
      font-size: 13.5px;
      line-height: 1.6;
      color: var(--cx-text);
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .cx-turn-user-bubble p { margin: 6px 0; }
    .cx-turn-user-bubble p:first-child { margin-top: 0; }
    .cx-turn-user-bubble p:last-child { margin-bottom: 0; }
    .cx-turn-user-bubble img:not(.emoji),
    .cx-turn-agent img:not(.emoji) {
      max-width: 180px;
      max-height: 110px;
      object-fit: contain;
      border-radius: 8px;
      cursor: zoom-in;
      transition: max-width 0.2s ease, max-height 0.2s ease;
    }
    .cx-turn-user-bubble img:not(.emoji):hover,
    .cx-turn-agent img:not(.emoji):hover {
      /* 防出屏：放大受宽度/高度双重钳制，永不超出可视区（移植自 terminal 皮肤 35bd821） */
      max-width: min(680px, 84vw);
      max-height: min(62vh, 560px);
      cursor: zoom-out;
    }
    .cx-turn-agent img.emoji, .cx-turn-user-bubble img.emoji { max-width: 100%; border-radius: 0; }

    /* ---------- 图片灯箱：点击 [img] 完整显示原图（移植自 terminal 皮肤 35bd821） ---------- */
    .cx-lightbox {
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(6, 8, 12, 0.86); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.16s ease; cursor: zoom-out;
    }
    .cx-lightbox.open { opacity: 1; }
    .cx-lightbox .lb-side {
      position: absolute; top: 12px; font-size: 12px; color: var(--cx-text-dim);
      font-family: var(--cx-font-ui); z-index: 2; cursor: pointer; user-select: none;
    }
    .cx-lightbox .lb-open { left: 14px; }
    .cx-lightbox .lb-close { right: 14px; }
    .cx-lightbox img {
      max-width: min(92vw, 1400px); max-height: 88vh; object-fit: contain;
      border-radius: 8px; box-shadow: 0 16px 60px rgba(0, 0, 0, 0.6);
      transform-origin: center center; cursor: grab; user-select: none;
    }
    .cx-turn-user-bubble a { color: var(--cx-blue); text-decoration: none; }
    .cx-turn-user-bubble a:hover { text-decoration: underline; }
    .cx-turn-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--cx-text-faint);
      font-size: 12.5px;
      padding: 3px 2px;
      opacity: 0.55;
      transition: opacity 0.15s;
    }
    .cx-turn-meta:hover { opacity: 0.9; }
    .cx-turn-meta .cx-status-dot {
      width: 8px; height: 8px; border-radius: 50%;
      border: 1.5px solid var(--cx-text-dim);
    }
    .cx-turn-meta .cx-status-dot.cx-done { background: var(--cx-text-dim); }

    /* —— agent turn（回帖，全宽 markdown）—— */
    .cx-turn-agent { padding: 0; word-break: break-word; overflow-wrap: anywhere; }
    .cx-turn-agent h1, .cx-turn-agent h2, .cx-turn-agent h3,
    .cx-turn-agent h4, .cx-turn-agent h5 {
      color: var(--cx-text);
      font-weight: 600;
      margin: 14px 0 7px;
      line-height: 1.4;
    }
    .cx-turn-agent h2 { font-size: 17px; }
    .cx-turn-agent h3 { font-size: 15px; }
    .cx-turn-agent p { font-size: 13.5px; line-height: 1.75; color: var(--cx-text); margin: 9px 0; }
    .cx-turn-agent ul, .cx-turn-agent ol { margin: 8px 0 8px 20px; padding: 0; }
    .cx-turn-agent li { font-size: 13.5px; line-height: 1.8; color: var(--cx-text); margin: 4px 0; }
    .cx-turn-agent li::marker { color: var(--cx-text-dim); }
    .cx-turn-agent a { color: var(--cx-blue); text-decoration: none; }
    .cx-turn-agent a:hover { text-decoration: underline; }
    .cx-turn-agent hr { border: none; border-top: 1px solid var(--cx-border-soft); margin: 16px 0; }
    .cx-turn-agent table { border-collapse: collapse; margin: 12px 0; font-size: 13px; }
    .cx-turn-agent th, .cx-turn-agent td {
      border: 1px solid var(--cx-border);
      padding: 6px 10px;
      color: var(--cx-text);
    }
    .cx-turn-agent th { background: var(--cx-bg-raised); font-weight: 600; }
    /* onebox 等嵌入卡片压成简约边框块 */
    .cx-turn-agent aside.onebox,
    .cx-turn-agent .onebox {
      border: 1px solid var(--cx-border) !important;
      border-radius: 10px;
      background: var(--cx-bg-raised);
      margin: 12px 0;
      padding: 10px 14px;
      color: var(--cx-text-secondary);
      font-size: 13px;
    }

    code.cx-inline-code {
      font-family: var(--cx-font-mono);
      font-size: 12px;
      background: var(--cx-chip-bg);
      color: var(--cx-chip-text);
      border-radius: 6px;
      padding: 2.5px 6px;
    }

    /* 代码块（带头栏 + 复制按钮） */
    .cx-codeblock {
      margin: 14px 0;
      background: var(--cx-bg-inset);
      border: 1px solid var(--cx-border-soft);
      border-radius: 10px;
      overflow: hidden;
    }
    .cx-codeblock-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 12px;
      font-family: var(--cx-font-mono);
      font-size: 12px;
      color: var(--cx-text-dim);
      border-bottom: 1px solid var(--cx-border-soft);
    }
    .cx-codeblock-head .cx-copy { cursor: pointer; display: flex; align-items: center; gap: 5px; }
    .cx-codeblock-head .cx-copy:hover { color: var(--cx-text); }
    .cx-codeblock-head .cx-copy svg { width: 13px; height: 13px; }
    .cx-codeblock pre {
      margin: 0;
      padding: 12px 14px;
      font-family: var(--cx-font-mono);
      font-size: 12.5px;
      line-height: 1.65;
      overflow-x: auto;
      color: var(--cx-code-text);
      background: transparent;
      border: none;
    }

    /* 引用 → 工具调用卡片 */
    .cx-tool-card {
      margin: 14px 0;
      border: 1px solid var(--cx-border);
      border-radius: 10px;
      background: var(--cx-bg-raised);
      overflow: hidden;
    }
    .cx-tool-card-head {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      font-family: var(--cx-font-mono);
      font-size: 12.5px;
      color: var(--cx-text-secondary);
      cursor: pointer;
    }
    .cx-tool-card-head svg { width: 14px; height: 14px; color: var(--cx-text-dim); flex: none; }
    .cx-tool-card-head .chev { margin-left: auto; transition: transform 0.15s; }
    .cx-tool-card.cx-open .cx-tool-card-head .chev { transform: rotate(90deg); }
    .cx-tool-card-body {
      display: none;
      border-top: 1px solid var(--cx-border-soft);
      padding: 10px 14px;
      font-size: 13.5px;
      line-height: 1.7;
      color: var(--cx-text-secondary);
    }
    .cx-tool-card-body p { margin: 6px 0; font-size: 13.5px; }
    .cx-tool-card.cx-open .cx-tool-card-body { display: block; }

    /* 分割线 turn 之间 */
    .cx-turn-divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 6px 0 10px;
      color: var(--cx-text-faint);
      font-size: 12px;
      opacity: 0.7;
    }
    .cx-turn-divider::before, .cx-turn-divider::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--cx-border-soft);
    }

    /* 楼层间的 worked 状态行 */
    .cx-worked {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--cx-text-faint);
      font-size: 12.5px;
      margin: 0;
      opacity: 0.55;
      transition: opacity 0.15s;
    }
    .cx-worked:hover { opacity: 0.9; }
    .cx-worked svg { width: 14px; height: 14px; flex: none; }

    /* 楼内穿插的 agent 活动 / 思考行（装饰） */
    .cx-runline {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0;
      font-size: 12.5px;
      color: var(--cx-text-dim);
    }
    .cx-runline svg { width: 14px; height: 14px; flex: none; color: var(--cx-text-faint); }
    .cx-runline code {
      font-family: var(--cx-font-mono);
      font-size: 11.5px;
      color: var(--cx-chip-text);
      background: var(--cx-chip-bg);
      border-radius: 6px;
      padding: 1.5px 7px;
    }
    /* 楼内 agent 英文思考块（参考 cli 皮肤：可折叠，默认展开） */
    .cx-think {
      margin: 10px 0;
      font-size: 12.5px;
      color: var(--cx-text-dim);
    }
    .cx-think-head {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      cursor: pointer;
      user-select: none;
    }
    .cx-think-head:hover { color: var(--cx-text-secondary); }
    .cx-think-head .spin { color: var(--cx-blue); }
    .cx-think-chev { font-size: 10px; }
    .cx-think-body {
      display: none;
      margin: 7px 0 2px;
      line-height: 1.7;
      color: var(--cx-text-secondary);
      border-left: 1px solid var(--cx-border-soft);
      padding-left: 10px;
      white-space: pre-wrap;
    }
    .cx-think.open .cx-think-body { display: block; }
    .cx-think.open .cx-think-chev::after { content: "▾"; }
    .cx-think:not(.open) .cx-think-chev::after { content: "▸"; }

    /* 每楼底部操作行 */
    .cx-turn-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0 0 0 auto; /* 与楼层信息同行，靠右 */
      opacity: 0;
      transition: opacity 0.15s;
    }
    .cx-turn-agent:hover + .cx-worked .cx-turn-actions,
    .cx-worked:hover .cx-turn-actions,
    .cx-turn-user:hover + .cx-turn-meta .cx-turn-actions,
    .cx-turn-meta:hover .cx-turn-actions,
    .cx-turn-actions.cx-has-liked { opacity: 1; }
    .cx-act {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      border: 1px solid var(--cx-border);
      background: transparent;
      color: var(--cx-text-dim);
      font-family: var(--cx-font-ui);
      font-size: 12px;
      border-radius: 999px;
      padding: 3px 10px;
      cursor: pointer;
    }
    .cx-act:hover { background: var(--cx-bg-raised); color: var(--cx-text); }
    .cx-act svg { width: 13px; height: 13px; }
    .cx-act.cx-liked { color: var(--cx-blue); border-color: var(--cx-blue-soft); background: var(--cx-blue-soft); }

    /* —— 底部 composer（嵌入 im 式 markdown 输入框，工具栏置于下方） —— */
    .codex-composer-wrap {
      flex: none;
      padding: 8px 16px 14px;
    }
    .codex-composer {
      width: 100%;
      max-width: 600px; /* 收起代码面板时的宽度 */
      margin: 0 auto;
      background: var(--cx-composer-bg);
      border: 1px solid var(--cx-border);
      border-radius: 16px;
      padding: 10px 12px 8px;
    }

    /* 输入区：contenteditable，Typora 式块级渐进渲染 */
    .cx-md-edit {
      color: var(--cx-text);
      font-family: var(--cx-font-ui);
      font-size: 14px;
      line-height: 1.65;
      min-height: 48px;
      max-height: 220px;
      overflow-y: auto;
      outline: none;
      cursor: text;
      position: relative;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .cx-md-edit:not(.has-content)::before {
      content: attr(data-placeholder);
      position: absolute;
      color: var(--cx-text-faint);
      pointer-events: none;
    }
    .cx-md-block { min-height: 1.5em; }
    .cx-md-block p { margin: 0; }
    .cx-md-block h2, .cx-md-block h3, .cx-md-block h4, .cx-md-block h5 { margin: 3px 0 2px; line-height: 1.35; }
    .cx-md-block h2 { font-size: 1.3em; }
    .cx-md-block h3 { font-size: 1.18em; }
    .cx-md-block h4, .cx-md-block h5 { font-size: 1.05em; }
    .cx-md-block blockquote {
      margin: 2px 0;
      padding: 1px 0 1px 8px;
      border-left: 3px solid var(--cx-border-strong);
      color: var(--cx-text-secondary);
    }
    .cx-md-block pre {
      margin: 3px 0;
      padding: 8px;
      border-radius: 6px;
      background: var(--cx-bg-inset);
      overflow-x: auto;
      font-size: 12px;
    }
    .cx-md-block code { font-family: var(--cx-font-mono); }
    .cx-md-block :not(pre) > code {
      background: var(--cx-chip-bg);
      border-radius: 4px;
      padding: 1px 4px;
    }
    .cx-md-block ul, .cx-md-block ol { margin: 2px 0; padding-left: 20px; }
    .cx-md-block a { color: var(--cx-blue); text-decoration: none; }
    .cx-md-block a:hover { text-decoration: underline; }
    .cx-md-block img.cx-md-img { max-width: 100%; max-height: 140px; border-radius: 6px; vertical-align: middle; }
    .cx-md-block img.emoji { width: 1.25em; height: 1.25em; vertical-align: -0.2em; }
    .cx-md-block table.cx-md-table { border-collapse: collapse; margin: 3px 0; font-size: 12px; }
    .cx-md-table th, .cx-md-table td { border: 1px solid var(--cx-border-strong); padding: 2px 8px; }
    .cx-md-block hr { border: 0; border-top: 1px solid var(--cx-border-strong); margin: 6px 0; }
    .cx-md-block .cx-md-task { list-style: none; margin-left: -18px; }
    .cx-md-block .cx-md-blur { filter: blur(4px); cursor: pointer; transition: filter 0.15s; }
    .cx-md-block .cx-md-blur:hover { filter: none; }
    .cx-md-block .cx-md-details summary { cursor: pointer; color: var(--cx-blue); }
    .cx-md-block .cx-md-quote-head { font-size: 12px; color: var(--cx-text-faint); margin-bottom: 2px; }
    .cx-md-block .cx-md-poll { border: 1px solid var(--cx-border-strong); border-radius: 6px; padding: 4px 10px; margin: 3px 0; }
    .cx-md-block .cx-md-poll-title { font-size: 12px; color: var(--cx-text-faint); }
    .cx-md-block .cx-md-footnote { font-size: 12px; color: var(--cx-text-secondary); }
    .cx-md-block .cx-md-date { background: var(--cx-chip-bg); border-radius: 4px; padding: 1px 4px; font-size: 12px; }

    /* 预览条：开关式实时渲染 */
    .cx-compose-preview {
      display: none;
      max-height: 120px;
      overflow-y: auto;
      padding: 6px 2px 4px;
      margin-bottom: 6px;
      font-size: 13px;
      line-height: 1.5;
      color: var(--cx-text-secondary);
      border-bottom: 1px dashed var(--cx-border);
      word-break: break-word;
    }
    .cx-compose-preview.active { display: block; }
    .cx-compose-preview.is-empty { display: none; }

    /* 目标回复条 */
    .cx-compose-target {
      display: none;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--cx-text-secondary);
      margin-bottom: 6px;
    }
    .cx-compose-target.active { display: flex; }
    .cx-compose-target button {
      border: none;
      background: none;
      color: var(--cx-text-dim);
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
    }
    .cx-compose-target button:hover { color: var(--cx-text); }

    /* 工具栏（输入框下方） */
    .cx-composer-toolbar {
      display: flex;
      align-items: center;
      gap: 2px;
      padding-top: 8px;
      margin-top: 6px;
      border-top: 1px solid var(--cx-border-soft);
    }
    .cx-composer-toolbar .cx-tool-btn {
      width: 28px; height: 28px;
      border-radius: 6px;
      display: grid; place-items: center;
      border: none; background: none;
      color: var(--cx-text-dim);
      cursor: pointer;
      font-family: var(--cx-font-ui);
      flex: none;
    }
    .cx-composer-toolbar .cx-tool-btn:hover { background: var(--cx-btn-hover); color: var(--cx-text); }
    .cx-composer-toolbar .cx-tool-btn svg { width: 16px; height: 16px; }
    .cx-composer-toolbar .cx-tool-btn.active { color: var(--cx-blue); }
    .cx-composer-status {
      flex: 1;
      min-height: 16px;
      font-size: 12px;
      color: var(--cx-text-faint);
      margin: 0 8px;
      text-align: right;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cx-composer-status.cx-busy { color: var(--cx-blue); }
    .cx-composer-status.cx-ok { color: #52b36b; }
    .cx-composer-status.cx-err { color: #e0626a; }
    .codex-composer-send {
      flex: none;
      width: 30px; height: 30px;
      border-radius: 50%;
      background: var(--cx-send-bg);
      color: var(--cx-send-icon);
      border: none;
      display: grid;
      place-items: center;
      cursor: pointer;
    }
    .codex-composer-send svg { width: 15px; height: 15px; }
    .codex-composer-send:disabled { opacity: 0.45; cursor: default; }

    /* 表情 / 更多弹层 */
    .cx-md-pop {
      position: fixed;
      z-index: 3000;
      background: var(--cx-bg-raised);
      border: 1px solid var(--cx-border-strong);
      border-radius: 10px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
      padding: 8px;
    }
    .cx-emoji-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 2px;
    }
    .cx-emoji-item {
      width: 30px; height: 30px;
      border: none; background: none;
      cursor: pointer; font-size: 16px;
      border-radius: 6px;
    }
    .cx-emoji-item:hover { background: var(--cx-btn-hover); }
    .cx-plus-pop {
      width: 252px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px;
    }
    .cx-plus-item {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 8px;
      border-radius: 6px;
      border: none; background: none;
      color: var(--cx-text-secondary);
      font-size: 12.5px;
      cursor: pointer;
      font-family: var(--cx-font-ui);
      text-align: left;
    }
    .cx-plus-item .ico { width: 16px; text-align: center; }
    .cx-plus-item:hover { background: var(--cx-btn-hover); color: var(--cx-text); }

    /* 代码面板展开时再收一档（原版输入框随分屏变窄） */
    .${ROOT_CLASS}:not(.codex-hide-code-panel) .codex-composer { max-width: 500px; }

    /* ================= 分屏：右侧代码面板（纯氛围，列表/详情共享同一实例） ================= */
    /* 内容区横排：左 = 当前视图滚动容器，右 = 共享代码面板 */
    .codex-body {
      flex: 1;
      min-height: 0;
      display: flex;
      overflow: hidden;
    }
    .codex-body { align-items: stretch; }
    .codex-thread-col {
      min-width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .codex-thread-col .codex-thread { min-width: 0; }
    .cx-code-panel {
      width: var(--cx-panel-w, 50%);   /* 默认与中间栏 1:1，可拖拽改写 */
      min-width: 280px;
      flex: none;
      border-left: 1px solid var(--cx-border-soft);
      background: var(--cx-panel-bg);
      display: flex;
      flex-direction: column;
    }
    .cx-code-tabs {
      height: 42px;
      flex: none;
      background: var(--cx-bg-deep);
      display: flex;
      align-items: flex-end;
      gap: 2px;
      padding: 0 10px;
      border-bottom: 1px solid var(--cx-border-soft);
    }
    /* 经典编辑器 tab：上圆角、底边与内容区融合 */
    .cx-code-tab {
      position: relative;
      height: 34px;
      display: flex;
      align-items: center;
      gap: 7px;
      margin-bottom: -1px;
      padding: 0 13px;
      background: var(--cx-panel-bg);
      border-radius: 9px 9px 0 0;
      font-family: var(--cx-font-mono);
      font-size: 12px;
      color: var(--cx-text);
    }
    .cx-code-tab::before,
    .cx-code-tab::after {
      content: "";
      position: absolute;
      bottom: 0;
      width: 9px;
      height: 9px;
      background: radial-gradient(circle at 0 0, transparent 9.5px, var(--cx-bg-deep) 9.5px);
    }
    .cx-code-tab::before { left: -9px; transform: scaleX(-1); pointer-events: none; }
    .cx-code-tab::after { right: -9px; transform: none; pointer-events: none; }
    .cx-code-tabs-actions {
      margin-left: auto;
      display: flex;
      align-self: center;
      gap: 2px;
      color: var(--cx-text-dim);
      padding-bottom: 6px;
    }
    .cx-code-tabs-actions .cx-icon-btn { width: 28px; height: 26px; border-radius: 6px; cursor: pointer; display: grid; place-items: center; }
    .cx-code-tabs-actions .cx-icon-btn:hover { background: var(--cx-wash); color: var(--cx-text); }
    .cx-code-tabs-actions svg { width: 15px; height: 15px; }
    .cx-code-tab .cx-rs-ic {
      width: 15px; height: 15px;
      border-radius: 50%;
      background: #45494f;
      color: #e8e8e8;
      font-size: 8px;
      font-weight: 700;
      display: grid;
      place-items: center;
    }
    .cx-code-tab .cx-close { opacity: 0.55; cursor: pointer; font-size: 13px; line-height: 1; }
    .cx-code-tab .cx-close:hover { opacity: 1; color: var(--cx-text); }
    .cx-code-add { align-self: center; margin-bottom: 6px; color: var(--cx-text-dim); font-size: 15px; cursor: pointer; padding: 2px 6px; }
    .cx-code-crumb {
      flex: none;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 12px;
      color: var(--cx-text-dim);
      border-bottom: 1px solid var(--cx-border-soft);
      white-space: nowrap;
      overflow: hidden;
    }
    .cx-code-crumb .cx-crumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;            /* 路径过长时自身收缩，右侧控件保持可见 */
    }
    .cx-code-crumb .cx-seg { cursor: pointer; white-space: nowrap; flex: none; }
    .cx-code-crumb .cx-seg:hover { color: var(--cx-text); }
    .cx-code-crumb .cx-cur {
      color: var(--cx-text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }
    .cx-code-crumb .cx-spacer { flex: 1; }
    .cx-code-view-toggle {
      display: flex;
      background: var(--cx-chip-bg);
      border-radius: 999px;
      padding: 2px;
      font-size: 11px;
    }
    .cx-code-view-toggle span {
      padding: 3px 10px;
      border-radius: 999px;
      cursor: pointer;
      color: var(--cx-text-dim);
    }
    .cx-code-view-toggle span.cx-on { background: var(--cx-bg-raised); color: var(--cx-text); }
    .cx-open-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--cx-text);
      background: var(--cx-chip-bg);
      border: 1px solid var(--cx-border-strong);
      border-radius: 8px;
      padding: 4px 11px;
      cursor: pointer;
      font-family: var(--cx-font-ui);
    }
    /* 「打开」= 语言下拉入口 */
    .cx-open-btn { gap: 5px; font-weight: 500; }
    .cx-open-btn .cx-chev { width: 11px; height: 11px; opacity: 0.75; }
    .cx-lang-menu {
      position: fixed;
      z-index: 960;
      min-width: 150px;
      padding: 5px;
      border-radius: 12px;
      background: var(--cx-bg-raised);
      border: 1px solid var(--cx-border);
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.45);
      display: flex;
      flex-direction: column;
      gap: 1px;
      font-size: 13px;
    }
    .cx-lang-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 6px 11px;
      border-radius: 8px;
      cursor: pointer;
      color: var(--cx-text);
      white-space: nowrap;
    }
    .cx-lang-item:hover { background: var(--cx-wash); }
    .cx-lang-item.cx-on svg { width: 13px; height: 13px; color: var(--cx-blue); }
    .cx-code-body {
      flex: 1;
      overflow: auto;
      font-family: var(--cx-font-mono);
      font-size: 12px;
      line-height: 1.75;
      padding: 8px 0 24px;
      scrollbar-width: thin;
    }
    .cx-cline { display: flex; }
    .cx-cline .cx-ln {
      width: 52px;
      flex: none;
      text-align: right;
      padding-right: 14px;
      color: var(--cx-code-gutter);
      user-select: none;
    }
    .cx-cline .cx-lc { white-space: pre; color: var(--cx-code-text); }
    .cx-cline:hover { background: var(--cx-wash); }
    /* 三栏拖拽把手：rail 右缘 + 中间栏与代码面板之间 */
    .cx-resizer { position: relative; flex: none; z-index: 90; }
    .codex-rail > .cx-resizer {
      position: absolute;
      top: 0; bottom: 0; right: -3px;
      width: 7px;
      cursor: col-resize;
      z-index: 70;
    }
    .codex-body > .cx-resizer {
      width: 6px;
      margin: 0 -3px;
      align-self: stretch;
      cursor: col-resize;
    }
    .cx-resizer::before {
      content: "";
      position: absolute;
      left: 50%; top: 0; bottom: 0;
      width: 1px;
      transform: translateX(-50%);
      background: transparent;
    }
    .cx-resizer:hover::before,
    .cx-resizer.cx-dragging::before { background: var(--cx-blue); }
    body.codex-resizing, body.codex-resizing * { cursor: col-resize !important; user-select: none !important; }

    /* 面板开关 */
    .${ROOT_CLASS}.codex-hide-code-panel .cx-code-panel { display: none; }
    .${ROOT_CLASS}.codex-hide-code-panel .cx-panel-toggle { color: var(--cx-text-faint); }
    /* 收起面板后对话列占满整宽；内容由各自的 max-width 约束居中 */

    /* diff 模式 */
    .cx-cline.cx-add { background: var(--cx-diff-add-bg); }
    .cx-cline.cx-del { background: var(--cx-diff-del-bg); }
    .cx-cline.cx-add .cx-ln { color: var(--cx-diff-add-ln); }
    .cx-cline.cx-del .cx-ln { color: var(--cx-diff-del-ln); }
    .cx-cline.cx-hunk { background: var(--cx-diff-hunk-bg); }
    .cx-cline.cx-hunk .cx-lc { color: var(--cx-diff-hunk-tx); }
    .cx-cline.cx-meta .cx-lc { color: var(--cx-text-dim); }
    /* 语法高亮（深色实测自原版，浅色用同色相加深） */
    .tk-k { color: var(--cx-tok-k); }   /* 关键字 */
    .tk-s { color: var(--cx-tok-s); }   /* 字符串 */
    .tk-c { color: var(--cx-tok-c); }   /* 注释 */
    .tk-t { color: var(--cx-tok-t); }   /* 类型 */
    .tk-f { color: var(--cx-tok-f); }   /* 函数 */
    .tk-n { color: var(--cx-tok-n); }   /* 数字 */
    .tk-m { color: var(--cx-tok-m); }   /* 宏/属性 */

    /* ---------- 较窄屏：仍是真分屏 1:1，只放宽最小宽度 ---------- */
    @media (max-width: 1200px) {
      .cx-code-panel {
        min-width: 300px;
      }
    }

    /* ---------- 窄屏降级：rail 收起为抽屉 ---------- */
    @media (max-width: 900px) {
      .codex-rail {
        transform: translateX(-105%);
        transition: transform 0.18s ease;
      }
      .${ROOT_CLASS}.codex-rail-open .codex-rail {
        transform: none;
        box-shadow: 8px 0 28px rgba(0, 0, 0, 0.5);
      }
      .codex-main { left: 0; }
      .codex-topbar .cx-menu-btn { display: grid; }
      .${ROOT_CLASS}:not(.${LOCK_CLASS}) #main-outlet-wrapper { margin-left: 0 !important; }
      .${ROOT_CLASS}.${LOCK_CLASS} #reply-control.open,
      .${ROOT_CLASS}.${LOCK_CLASS} #reply-control.edit-title,
      .${ROOT_CLASS}.${LOCK_CLASS} #reply-control.fullscreen {
        left: 8px !important;
        right: 8px !important;
      }
      .codex-thread { padding: 20px 16px 32px; }
      .codex-composer-wrap { padding: 8px 12px 14px; }
      /* 太窄时代码面板直接不可用（纯装饰，不占小屏空间） */
      .cx-code-panel { display: none !important; }
      .cx-resizer { display: none !important; }
      .${ROOT_CLASS}.codex-hide-code-panel .codex-thread-col { flex: 1; width: auto; }
      .codex-topbar .cx-panel-toggle { display: none; }
    }

    /* ================= 全局浮动元素：toast / 引用跳回按钮 ================= */
    .cx-toast {
      position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%) translateY(8px);
      background: var(--cx-bg-raised); color: var(--cx-text);
      border: 1px solid var(--cx-border-strong); border-radius: 10px;
      padding: 8px 16px; font-size: 13px; font-family: var(--cx-font-ui);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4); z-index: 3000;
      opacity: 0; pointer-events: none; transition: opacity 0.18s ease, transform 0.18s ease;
    }
    .cx-toast.cx-show { opacity: 1; transform: translateX(-50%) translateY(0); }
    .cx-toast.cx-err { border-color: rgba(224, 98, 106, 0.55); color: #ffb3b8; }
    .cx-jump-back {
      position: fixed; right: 20px; bottom: 24px; z-index: 2800;
      display: inline-flex; align-items: center; gap: 7px;
      background: var(--cx-bg-raised); color: var(--cx-text);
      border: 1px solid var(--cx-border-strong); border-radius: 999px;
      padding: 7px 14px; font-size: 12.5px; font-family: var(--cx-font-ui); cursor: pointer;
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.35); opacity: 0; pointer-events: none;
      transform: translateY(6px); transition: opacity 0.18s ease, transform 0.18s ease;
    }
    .cx-jump-back.cx-show { opacity: 1; pointer-events: auto; transform: translateY(0); }
    .cx-jump-back .cx-jump-back-x { color: var(--cx-text-faint); margin-left: 6px; }
    .cx-jump-src {
      margin-left: auto; display: inline-flex; align-items: center; gap: 3px;
      color: var(--cx-blue); font-size: 12px; cursor: pointer; padding: 2px 6px; border-radius: 5px;
    }
    .cx-jump-src:hover { background: var(--cx-btn-hover); }
    .cx-jump-highlight { animation: cx-flash 1.6s ease-out; }
    @keyframes cx-flash {
      0% { box-shadow: 0 0 0 2px var(--cx-blue), 0 0 22px rgba(42, 152, 255, 0.4); }
      100% { box-shadow: 0 0 0 2px transparent, 0 0 0 transparent; }
    }

    /* ================= 投票组件（移植自 im features/polls.js，配色走 Codex token） ================= */
    .codex-thread-posts .poll {
      background: var(--cx-bg-raised);
      border: 1px solid var(--cx-border);
      border-radius: var(--cx-radius);
      padding: 14px 16px;
      margin: 12px 0;
      user-select: none;
    }
    .codex-thread-posts .poll ol, .codex-thread-posts .poll ul {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px;
    }
    .cx-poll-option {
      display: flex; align-items: center; padding: 9px 13px;
      border-radius: 9px; background: var(--cx-bg-inset);
      border: 1.5px solid var(--cx-border);
      cursor: pointer; position: relative; overflow: hidden;
      transition: all 0.18s ease;
    }
    .cx-poll-option:hover { background: var(--cx-btn-hover); }
    .cx-poll-option.selected {
      border-color: var(--cx-blue);
      background: color-mix(in srgb, var(--cx-blue) 12%, var(--cx-bg-inset));
    }
    .cx-poll-radio {
      width: 17px; height: 17px; min-width: 17px; border-radius: 50%;
      border: 2px solid var(--cx-text-faint); margin-right: 11px;
      flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
      box-sizing: border-box; transition: all 0.15s ease;
    }
    .cx-poll-option[data-multi="1"] .cx-poll-radio { border-radius: 4px; }
    .cx-poll-option.selected .cx-poll-radio { background: var(--cx-blue); border-color: var(--cx-blue); }
    .cx-poll-option.selected .cx-poll-radio::after { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #fff; }
    .cx-poll-option[data-multi="1"].selected .cx-poll-radio::after { border-radius: 1px; }
    .cx-poll-title { flex: 1; font-size: 13.5px; color: var(--cx-text); line-height: 1.4; z-index: 1; }
    .cx-poll-count { font-size: 12px; color: var(--cx-text-secondary); margin-left: 10px; z-index: 1; white-space: nowrap; }
    .cx-poll-bar {
      position: absolute; left: 0; top: 0; bottom: 0;
      background: color-mix(in srgb, var(--cx-blue) 16%, transparent);
      pointer-events: none; width: 0%; transition: width 0.35s ease; z-index: 0;
    }
    .cx-poll-actions {
      display: flex; align-items: center; gap: 12px; margin-top: 12px; padding-top: 10px;
      border-top: 1px dashed var(--cx-border);
    }
    .cx-poll-submit {
      height: 30px; padding: 0 18px; border-radius: 7px; font-size: 12.5px; font-weight: 500;
      border: none; background: var(--cx-blue); color: #fff; cursor: pointer;
    }
    .cx-poll-submit:disabled { opacity: 0.45; cursor: not-allowed; }
    .cx-poll-undo {
      height: 30px; padding: 0 14px; border-radius: 7px; font-size: 12.5px;
      border: 1px solid var(--cx-border-strong); background: transparent;
      color: var(--cx-text-secondary); cursor: pointer;
    }
    .cx-poll-undo:hover { background: var(--cx-btn-hover); }
    .cx-poll-tip { font-size: 11.5px; color: var(--cx-text-faint); margin-left: 6px; }

    /* 书签：操作按钮选中态 */
    .cx-act.bookmarked { color: var(--cx-blue); }
    .cx-act.bookmarked svg { fill: currentColor; }
  `;

  /* ============================== 基础设施 ============================== */

  function injectStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    // 始终刷新，避免旧版 CSS 残留
    style.textContent = RAW_CSS;
  }

  let faviconObserver = null;
  let faviconApplying = false;

  function makeFavicon() {
    const head = document.head;
    if (!head || faviconApplying) return;
    faviconApplying = true;
    try {
      const href = makeCodexFaviconUri();
      const imgType = href.startsWith("data:image/svg+xml") ? "image/svg+xml" : "image/png";
      // 覆盖所有常见 icon 链（含 shortcut / apple-touch），避免未选中标签仍用站点原图
      const icons = head.querySelectorAll(
        "link[rel='icon'], link[rel='shortcut icon'], link[rel~='icon'], link[rel='apple-touch-icon'], link[rel='apple-touch-icon-precomposed'], link[rel='mask-icon']"
      );
      for (const icon of icons) {
        if (icon.id && icon.id !== FAVICON_ID) icon.removeAttribute("id");
        if (icon.getAttribute("href") !== href) icon.setAttribute("href", href);
        if (icon.rel === "mask-icon") continue;
        if (icon.getAttribute("type") !== imgType) icon.setAttribute("type", imgType);
        if (!icon.getAttribute("sizes")) icon.setAttribute("sizes", "any");
      }

      let link = document.getElementById(FAVICON_ID);
      if (!link) {
        link = document.createElement("link");
        link.id = FAVICON_ID;
        link.rel = "icon";
        link.type = imgType;
        link.sizes = "any";
        link.setAttribute("href", href);
        head.appendChild(link);
      } else if (link.getAttribute("href") !== href) {
        link.setAttribute("href", href);
      }

      // 再补一条 shortcut icon，部分浏览器未聚焦标签时优先读它
      let shortcut = head.querySelector("link[data-codex-shortcut='1']");
      if (!shortcut) {
        shortcut = document.createElement("link");
        shortcut.rel = "shortcut icon";
        shortcut.type = imgType;
        shortcut.dataset.codexShortcut = "1";
        shortcut.setAttribute("href", href);
        head.insertBefore(shortcut, head.firstChild);
      } else if (shortcut.getAttribute("href") !== href) {
        shortcut.setAttribute("href", href);
      }

      if (!faviconObserver) {
        faviconObserver = new MutationObserver(() => {
          if (faviconApplying) return;
          // 站点 SPA / 主题脚本可能写回原 favicon
          makeFavicon();
        });
        faviconObserver.observe(head, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["href", "rel", "type", "sizes"]
        });
      }
    } finally {
      faviconApplying = false;
    }
  }

  /** 加载闪屏：logo 换成 ChatGPT 图标（照 idea 皮肤换标手法，幂等） */
  function applySplash() {
    const splash = document.getElementById("d-splash");
    if (!splash || splash.dataset.cxSplash === "1") return;
    splash.dataset.cxSplash = "1";
    const logo = splash.querySelector(".splash-logo-container");
    if (logo) {
      logo.style.setProperty("background-image", `url("${makeCodexFaviconUri()}")`, "important");
    }
  }

  /* ============================== Ember / composer 调用链（移植自 feishu 脚本） ============================== */

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

      // Ember.Namespace 反查 Discourse 应用
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
      console.warn("[linuxdo-codex] getEmberOwner failed", err);
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

  /** 关闭原生回复面板：优先 composer service，兜底点取消按钮 */
  function closeNativeComposer() {
    try {
      const svc = getComposerService(getEmberOwner());
      if (svc && typeof svc.close === "function") { svc.close(); return; }
    } catch { /* fall through */ }
    document.querySelector("#reply-control .cancel, #reply-control button.close")?.click?.();
  }

  /** 点击原生输入面板以外区域时收起它（皮肤自己的 composer 入口除外） */
  function bindOutsideCloseComposer() {
    if (window.__codexOutsideCloseBound) return;
    window.__codexOutsideCloseBound = true;
    document.addEventListener("pointerdown", (e) => {
      const rc = document.getElementById("reply-control");
      if (!rc || !isComposerOpen()) return;
      const t = e.target instanceof Element ? e.target : null;
      if (!t || rc.contains(t) || t.closest(".codex-composer")) return;
      closeNativeComposer();
    }, true);
  }

  /** 临时让原生回复按钮可被程序点击（它们在 height:0 的 outlet 里） */
  function withClickableNativeReplyControls(fn) {
    let style = document.getElementById("codex-temp-reply-click");
    if (!style) {
      style = document.createElement("style");
      style.id = "codex-temp-reply-click";
      style.textContent = `
        html.codex-theme.codex-locked #main-outlet #topic-footer-buttons,
        html.codex-theme.codex-locked #main-outlet .topic-footer-main-buttons,
        html.codex-theme.codex-locked #main-outlet .topic-footer-main-buttons *,
        html.codex-theme.codex-locked #main-outlet #topic-footer-buttons *,
        html.codex-theme.codex-locked #main-outlet .post-stream article .post-controls,
        html.codex-theme.codex-locked #main-outlet .post-stream article .post-controls * {
          visibility: visible !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          pointer-events: auto !important;
          position: relative !important;
        }
        html.codex-theme.codex-locked #main-outlet .container.posts,
        html.codex-theme.codex-locked #main-outlet .topic-area,
        html.codex-theme.codex-locked #main-outlet .post-stream,
        html.codex-theme.codex-locked #main-outlet .topic-footer-buttons,
        html.codex-theme.codex-locked #main-outlet #topic-footer-buttons {
          visibility: visible !important;
          height: auto !important;
          overflow: visible !important;
        }
      `;
      document.documentElement.appendChild(style);
    }
    try {
      return fn();
    } finally {
      setTimeout(() => {
        document.getElementById("codex-temp-reply-click")?.remove();
      }, 800);
    }
  }

  function clickNativeReplyButton(postNumber) {
    return withClickableNativeReplyControls(() => {
      if (postNumber) {
        const article = document.querySelector(
          `.post-stream article[data-post-number="${postNumber}"], #post_${postNumber}, article[id="post_${postNumber}"]`
        );
        const postReply = article?.querySelector(
          "button.reply, .post-controls button.reply, button.create.reply, .reply.create"
        );
        if (postReply) {
          postReply.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
          return true;
        }
      }
      const topicSelectors = [
        "#topic-footer-buttons button.create",
        "#topic-footer-buttons button.btn-primary.create",
        ".topic-footer-main-buttons button.create",
        ".topic-footer-main-buttons button.btn-primary",
        "button.btn-primary.create.reply",
        "button.create.reply"
      ];
      for (const sel of topicSelectors) {
        const btn = document.querySelector(sel);
        // 避开顶栏「发新帖」
        if (!btn || btn.id === "create-topic" || btn.closest(".d-header")) continue;
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        return true;
      }
      return false;
    });
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
      console.warn("[linuxdo-codex] composer service open failed", err);
    }
    return false;
  }

  function openComposerViaKeyboard(postNumber) {
    try {
      // Discourse：r = 回复话题；若先聚焦某楼再 r 可带引用——这里做话题级兜底
      if (postNumber) {
        const article = document.querySelector(
          `.post-stream article[data-post-number="${postNumber}"], #post_${postNumber}`
        );
        article?.setAttribute?.("tabindex", "-1");
        article?.focus?.();
      } else {
        document.activeElement?.blur?.();
      }
      const opts = { key: "r", code: "KeyR", keyCode: 82, which: 82, bubbles: true, cancelable: true, view: window };
      document.dispatchEvent(new KeyboardEvent("keydown", opts));
      document.body.dispatchEvent(new KeyboardEvent("keydown", opts));
      return true;
    } catch {
      return false;
    }
  }

  /** 打开 Discourse 原生 composer（必须真正 open，禁止只 focus textarea） */
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
        try { opened = !!clickNativeReplyButton(postNumber); } catch { /* fall through */ }
      }
      if (!opened) {
        try { openComposerViaKeyboard(postNumber); } catch { /* fall through */ }
      }

      // 最后手段：短暂解锁 LOCK，再试一次
      setTimeout(() => {
        if (isComposerOpen()) return;
        const root = document.documentElement;
        const hadLock = root.classList.contains(LOCK_CLASS);
        const unlock = document.createElement("style");
        unlock.id = "codex-unlock-for-reply";
        unlock.textContent = `
          html.codex-theme.codex-locked #main-outlet-wrapper,
          html.codex-theme.codex-locked #main-outlet,
          html.codex-theme.codex-locked #main-outlet > * {
            pointer-events: auto !important;
            visibility: visible !important;
            height: auto !important;
            overflow: visible !important;
          }
          html.codex-theme #reply-control {
            display: block !important;
            pointer-events: auto !important;
            z-index: 700 !important;
          }
        `;
        document.documentElement.appendChild(unlock);
        if (hadLock) root.classList.remove(LOCK_CLASS);
        try {
          if (!openComposerViaService(postNumber) && !clickNativeReplyButton(postNumber)) {
            openComposerViaKeyboard(postNumber);
          }
        } catch { /* ignore */ }
        setTimeout(() => {
          if (hadLock) root.classList.add(LOCK_CLASS);
          document.getElementById("codex-unlock-for-reply")?.remove();
          if (!isComposerOpen()) {
            console.warn("[linuxdo-codex] openNativeComposer failed", {
              topicId: threadState.topicId,
              postNumber,
              hasOwner: !!getEmberOwner(),
              hasComposer: !!getComposerService(getEmberOwner())
            });
          }
        }, 250);
      }, 180);

      return true;
    } catch (err) {
      console.warn("[linuxdo-codex] openNativeComposer crashed", err);
      return false;
    }
  }

  function replyToPost(postNumber) {
    // 有嵌套输入框时走本皮回复：楼层目标条 + 直接发送；否则照旧开原生
    if (document.querySelector(".codex-composer .cx-md-edit")) {
      cxSetComposerTarget(postNumber);
      return;
    }
    openNativeComposer(postNumber);
  }

  /** 打开「新话题」composer（列表视图用；categoryId 尽量预填当前分类） */
  function openNewTopicComposer() {
    const categoryId = categoryIdFromPath(location.pathname);
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
      console.warn("[linuxdo-codex] openNewTopicComposer service failed", err);
    }
    // 兜底一：点原生「新话题」按钮（顶栏被视觉隐藏，但 DOM 可点）
    try {
      const btn = document.querySelector("#create-topic");
      if (btn) {
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        return true;
      }
    } catch { /* ignore */ }
    // 兜底二：Discourse 快捷键 c = 新话题
    try {
      const opts = { key: "c", code: "KeyC", keyCode: 67, which: 67, bubbles: true, cancelable: true, view: window };
      document.dispatchEvent(new KeyboardEvent("keydown", opts));
      document.body.dispatchEvent(new KeyboardEvent("keydown", opts));
    } catch { /* ignore */ }
    return false;
  }

  /* ============================== 通知 / 用户菜单收养（移植自 feishu 脚本） ============================== */

  let notifOpenInFlight = false;
  let notifMenuObserver = null;
  let notifPinned = false;   // 点击钉住；再点触发器 / 点外面取消
  let notifWantOpen = false; // 意向开关：避免收起后被 observer 再次捞起

  /** 读取 Discourse 未读通知数（与顶栏用户菜单角标同源） */
  function getUnreadNotificationCount() {
    try {
      const owner = getEmberOwner();
      const user =
        safeLookup(owner, "service:current-user") ||
        window.Discourse?.User?.current?.() ||
        null;
      if (user) {
        const pick = (key) => {
          try {
            const v = user.get?.(key);
            if (v != null && v !== "") return Number(v);
          } catch { /* ignore */ }
          const direct = user[key];
          return direct == null || direct === "" ? null : Number(direct);
        };
        const all = pick("all_unread_notifications_count");
        if (all != null && !Number.isNaN(all)) return Math.max(0, all);
        const unread = pick("unread_notifications");
        const high = pick("unread_high_priority_notifications");
        const pm = pick("new_personal_messages_notifications_count");
        const sum = (unread || 0) + (high || 0) + (pm || 0);
        if (sum > 0) return sum;
        if (unread != null && !Number.isNaN(unread)) return Math.max(0, unread);
      }
    } catch { /* ignore */ }

    const domBadge = document.querySelector(
      "#current-user .badge-notification, " +
      ".header-dropdown-toggle.current-user .badge-notification, " +
      "#toggle-current-user .badge-notification, " +
      ".current-user .badge-notification"
    );
    if (domBadge) {
      const text = (domBadge.textContent || "").replace(/\s+/g, "").trim();
      if (/^\d+$/.test(text)) return Number(text);
      if (/\d/.test(text)) {
        const n = parseInt(text, 10);
        if (!Number.isNaN(n)) return Math.min(n, 99);
      }
      if (domBadge.classList.contains("unread") || domBadge.querySelector("svg")) return 1;
    }
    return 0;
  }

  function findUserMenu() {
    return document.querySelector(".user-menu.revamped.menu-panel, .user-menu.menu-panel, .user-menu");
  }

  function findUserMenuToggle() {
    return document.querySelector(
      "#toggle-current-user, #current-user button, .header-dropdown-toggle.current-user button, .current-user button.icon, #current-user .icon, #current-user summary, button[aria-controls*='user'], .header-dropdown-toggle.current-user"
    );
  }

  function getHeaderService() {
    return safeLookup(getEmberOwner(), "service:header");
  }

  /** 打开/关闭 Discourse 原生 user-menu（优先 Ember header.userVisible） */
  function setUserMenuVisible(visible) {
    const header = getHeaderService();
    if (header) {
      try {
        if ("userVisible" in header) {
          header.userVisible = !!visible;
          return true;
        }
        if (typeof header.set === "function") {
          header.set("userVisible", !!visible);
          return true;
        }
      } catch (err) {
        console.warn("[linuxdo-codex] header.userVisible failed", err);
      }
    }

    const events = safeLookup(getEmberOwner(), "service:app-events");
    if (events && typeof events.trigger === "function") {
      try {
        const isOpen = !!findUserMenu();
        // keyboard-trigger 是 toggle：仅在状态需要变化时触发
        if (!!visible !== isOpen) {
          events.trigger("header:keyboard-trigger", { type: "user" });
        }
        return true;
      } catch (err) {
        console.warn("[linuxdo-codex] app-events user menu failed", err);
      }
    }
    return false;
  }

  function setNotifOpenClass(open) {
    document.documentElement.classList.toggle("codex-notif-open", !!open);
  }

  function positionNotifMenu(menu) {
    if (!menu || !notifWantOpen) return;
    // 顶栏被 opacity:0 / clip 藏起来；菜单必须挪到 body 才能看见
    if (menu.parentElement !== document.body) {
      document.body.appendChild(menu);
    }
    menu.classList.add("codex-user-menu-float", "show-avatars");
    // 显隐交给 html.codex-notif-open；这里清掉 Discourse 内联定位
    menu.style.display = "";
    menu.style.visibility = "";
    menu.style.opacity = "";
    menu.style.pointerEvents = "";
    menu.style.position = "";
    menu.style.left = "";
    menu.style.top = "";
    menu.style.right = "";
    menu.style.bottom = "";
    menu.style.transform = "";
    setNotifOpenClass(true);
  }

  function clickUserMenuToggle() {
    const toggle = findUserMenuToggle();
    if (!toggle) return false;
    try {
      toggle.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    } catch {
      try { toggle.click(); } catch { return false; }
    }
    return true;
  }

  /** 短暂解除顶栏隐藏，让原生 click / Ember 能创建菜单，再靠 observer 挪到 body */
  function unlockHeaderForNotifClick() {
    let style = document.getElementById("codex-unlock-header");
    if (!style) {
      style = document.createElement("style");
      style.id = "codex-unlock-header";
      style.textContent = `
        html.codex-theme.codex-notif-opening .d-header-wrap,
        html.codex-theme.codex-notif-opening .d-header {
          opacity: 1 !important;
          clip: auto !important;
          overflow: visible !important;
          width: auto !important;
          height: auto !important;
          max-width: none !important;
          max-height: none !important;
          pointer-events: auto !important;
          z-index: 850 !important;
          top: -9999px !important;
          left: 0 !important;
          position: fixed !important;
        }
      `;
      document.documentElement.appendChild(style);
    }
    document.documentElement.classList.add("codex-notif-opening");
  }

  function lockHeaderAfterNotif() {
    document.documentElement.classList.remove("codex-notif-opening");
  }

  function adoptNotifMenuIfAny() {
    if (!notifWantOpen) return false;
    const menu = findUserMenu();
    if (!menu) return false;
    positionNotifMenu(menu);
    lockHeaderAfterNotif();
    return true;
  }

  function openNotifMenu() {
    notifWantOpen = true;
    if (adoptNotifMenuIfAny()) {
      // 已打开则确保 Ember 状态同步为可见
      setUserMenuVisible(true);
      return true;
    }
    if (notifOpenInFlight) return false;
    notifOpenInFlight = true;
    ensureNotifMenuObserver();

    let opened = false;
    try {
      opened = setUserMenuVisible(true);
    } catch (err) {
      console.warn("[linuxdo-codex] setUserMenuVisible threw", err);
    }

    // Ember 失败或不立刻出 DOM → 解锁顶栏再点一次原生按钮
    if (!findUserMenu()) {
      unlockHeaderForNotifClick();
      clickUserMenuToggle();
    } else {
      opened = true;
    }

    let tries = 0;
    const poll = setInterval(() => {
      if (adoptNotifMenuIfAny()) {
        notifOpenInFlight = false;
        clearInterval(poll);
        return;
      }
      if (++tries > 24) {
        notifOpenInFlight = false;
        lockHeaderAfterNotif();
        clearInterval(poll);
        console.warn("[linuxdo-codex] openNotifMenu: menu not found", {
          opened,
          hasOwner: !!getEmberOwner(),
          hasHeader: !!getHeaderService(),
          hasToggle: !!findUserMenuToggle()
        });
      }
    }, 50);
    return opened;
  }

  function setNotifPinned(pinned) {
    notifPinned = !!pinned;
    document.documentElement.classList.toggle("codex-notif-pinned", notifPinned);
  }

  function hideNotifMenuNode(menu) {
    if (!menu) return;
    // 先靠 html.codex-notif-open 隐藏；再尽量拆掉节点，防止 Ember 残留
    menu.classList.remove("show-avatars");
    try {
      menu.remove();
    } catch {
      menu.classList.remove("codex-user-menu-float");
      menu.style.display = "none";
    }
  }

  function closeNotifMenu() {
    notifWantOpen = false;
    notifOpenInFlight = false;
    setNotifPinned(false);
    setNotifOpenClass(false); // 关键：立刻靠 CSS 藏掉
    lockHeaderAfterNotif();
    // 藏掉所有我们捞出来的浮层副本
    document.querySelectorAll(".user-menu.codex-user-menu-float, .codex-user-menu-float").forEach(hideNotifMenuNode);
    hideNotifMenuNode(findUserMenu());
    try { setUserMenuVisible(false); } catch { /* ignore */ }
    // 看过通知后刷新铃铛蓝点
    setTimeout(() => syncRail(), 400);
  }

  function ensureNotifMenuObserver() {
    if (notifMenuObserver) return;
    notifMenuObserver = new MutationObserver(() => {
      if (otherThemeActive()) return;
      if (!notifWantOpen) return;
      adoptNotifMenuIfAny();
    });
    notifMenuObserver.observe(document.body, { childList: true, subtree: true });
  }

  function isNotifMenuOpen() {
    return notifPinned || document.documentElement.classList.contains("codex-notif-open");
  }

  function ensureNotifOutsideClose() {
    if (window.__codexNotifOutsideBound) return;
    window.__codexNotifOutsideBound = true;
    const onOutside = (e) => {
      if (!isNotifMenuOpen()) return;
      const triggers = document.querySelectorAll("[data-codex-notif-trigger]");
      const menu = document.querySelector(".user-menu.codex-user-menu-float, .codex-user-menu-float");
      const t = e.target;
      for (const el of triggers) {
        if (el === t || el.contains(t)) return;
      }
      if (menu && (menu === t || menu.contains(t))) return;
      closeNotifMenu();
    };
    document.addEventListener("pointerdown", onOutside, true);
    document.addEventListener("mousedown", onOutside, true);
  }

  /** 铃铛 / 底部用户行：点击钉住开菜单，再点收起（无 hover 逻辑，桌面窄屏都可用） */
  function bindNotifTrigger(el) {
    if (!el || el.dataset.notifBound === "1") return;
    el.dataset.notifBound = "1";
    ensureNotifOutsideClose();

    el.addEventListener("click", (e) => {
      if (otherThemeActive()) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();

      if (notifPinned) {
        closeNotifMenu();
        return;
      }
      ensureNotifMenuObserver();
      openNotifMenu();
      setNotifPinned(true);
    });
  }

  /* ============================== 分类数据 ============================== */

  let categoriesCache = null; // [{id,name,slug,color,...}]

  async function loadCategories() {
    if (categoriesCache) return categoriesCache;
    try {
      const data = await api("/categories.json");
      categoriesCache = (data.category_list && data.category_list.categories) || [];
    } catch {
      categoriesCache = [];
    }
    return categoriesCache;
  }

  function categoryById(id) {
    return (categoriesCache || []).find((c) => c.id === id) || null;
  }

  function categoryBySlug(slug) {
    const s = String(slug || "").toLowerCase();
    return (categoriesCache || []).find((c) => String(c.slug).toLowerCase() === s) || null;
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
    // 绝对地址收成站内路径
    let path = url;
    try {
      if (/^https?:/i.test(url)) {
        const u = new URL(url, location.origin);
        if (u.origin !== location.origin) { window.open(url, "_blank", "noopener"); return; }
        path = u.pathname + u.search + u.hash;
      }
    } catch { /* keep url */ }
    if (discourseRouteTo(path)) {
      scheduleApply();
      return;
    }
    history.pushState({}, "", path);
    scheduleApply();
  }

  /* ============================== 左 rail ============================== */

  let categoriesExpanded = false; // 「分类」分组「展开显示」
  const expandedCats = new Set(); // 分类下子线程的逐组展开
  let catsDefaultSeeded = false; // 首次渲染时默认展开第一个分类
  let recentTopicsCache = null;   // 「最近」分组：/latest.json 前几条

  // 分类下的装饰性「session 名」文案池：真实话题不够数时用来凑版面
  const MOCK_SESSIONS = [
    "分析一下当前项目",
    "只读分析前端界面与路由",
    "修复 CI 打包报错",
    "梳理一下接口鉴权协议",
    "重构设置页布局",
    "排查偶发白屏问题",
    "整理组件依赖关系",
    "调研跨平台路径兼容",
    "补充单元测试覆盖",
    "优化首屏加载性能",
    "对比两套缓存方案",
    "定位任务队列卡住的原因",
  ];

  /** 某分类的「session 列表」：真实话题优先，不足用文案池凑（按 catId 播种保证稳定） */
  function sessionsForCat(cat, idx) {
    const realPool = [...(listState.topics || []), ...(recentTopicsCache || [])]
      .filter((t) => t.category_id === cat.id);
    const seen = new Set();
    const out = [];
    for (const t of realPool) {
      if (!t.title || seen.has(t.title)) continue;
      seen.add(t.title);
      out.push({ label: t.title, href: topicHref(t), unread: topicUnread(t) > 0 });
      if (out.length >= 4) break;
    }
    for (let i = 0; out.length < 4 && i < MOCK_SESSIONS.length; i++) {
      const pick = MOCK_SESSIONS[(cat.id * 5 + idx * 3 + i * 7) % MOCK_SESSIONS.length];
      if (seen.has(pick)) { continue; }
      seen.add(pick);
      out.push({ label: pick, href: `/c/${cat.slug}/${cat.id}`, unread: false });
    }
    if (!out.length) {
      out.push({ label: "分析一下当前项目", href: `/c/${cat.slug}/${cat.id}`, unread: false });
    }
    return out;
  }

  function topicHref(topic) {
    return `/t/${topic.slug || "topic"}/${topic.id}`;
  }

  function topicUnread(topic) {
    return (topic.unread > 0 ? topic.unread : 0) + (topic.new_posts > 0 ? topic.new_posts : 0);
  }

  function ensureRail() {
    let rail = document.querySelector(".codex-rail");
    if (rail) {
      syncRail();
      return rail;
    }
    rail = document.createElement("aside");
    rail.className = "codex-rail";
    rail.setAttribute("aria-label", "Codex 风导航");

    // 顶部窗口控制占位（收起/后退/前进装饰图标）
    const traffic = document.createElement("div");
    traffic.className = "codex-rail-traffic";
    traffic.innerHTML =
      ICONS.sidebar +
      ICONS.chevronLeft +
      `<span style="opacity:0.45;display:inline-flex">${ICONS.chevronRight}</span>`;
    // 收起图标：窄屏时收起抽屉；宽屏纯装饰
    traffic.firstElementChild?.addEventListener?.("click", () => {
      document.documentElement.classList.toggle("codex-rail-open");
    });
    rail.appendChild(traffic);

    // 品牌行：Linux DO ⌄ + 搜索 + 通知铃铛
    const brand = document.createElement("div");
    brand.className = "codex-rail-brand";
    brand.innerHTML = `
      <div class="codex-rail-brand-name">Codex ${ICONS.chevronDown}</div>
      <div class="codex-rail-brand-actions">
        <span class="codex-rail-search-btn" title="搜索">${ICONS.search}</span>
        <span class="codex-rail-bell" title="通知" data-codex-notif-trigger="1">${ICONS.bell}</span>
      </div>`;
    brand.querySelector(".codex-rail-brand-name").addEventListener("click", () => navigateInApp("/latest"));
    brand.querySelector(".codex-rail-search-btn").addEventListener("click", () => openNativeSearch());
    rail.appendChild(brand);

    // 可滚动区：导航项 + 动态分组（置顶/分类/最近）
    const scroll = document.createElement("div");
    scroll.className = "codex-rail-scroll";
    scroll.innerHTML = `
      <nav class="codex-rail-nav">
        <div class="codex-rail-item" data-nav="topics">${ICONS.layers}<span class="cx-label">话题</span></div>
        <div class="codex-rail-item" data-nav="drafts" title="草稿保存在原生编辑器中">${ICONS.user}<span class="cx-label">我的草稿</span></div>
        <div class="codex-rail-item" data-nav="messages">${ICONS.inbox}<span class="cx-label">我的消息</span></div>
        <div class="codex-rail-item cx-faint" data-nav="bots" title="装饰入口（Codex 风格占位，无实际功能）">${ICONS.bot}<span class="cx-label">AI 机器人</span></div>
        <div class="codex-rail-item" data-nav="activity">${ICONS.clock}<span class="cx-label">近期活动</span></div>
        <div class="codex-rail-item cx-faint" data-nav="more">${ICONS.dotsV}<span class="cx-label">更多</span></div>
      </nav>
      <div class="codex-rail-dynamic"></div>`;
    rail.appendChild(scroll);

    // 底部：当前用户名 + 明暗切换（收养原生用户菜单）
    const foot = document.createElement("div");
    foot.className = "codex-rail-foot";
    foot.innerHTML = `
      <div class="codex-rail-foot-user" data-codex-notif-trigger="1" title="账户与通知">
        ${ICONS.gear}<span class="cx-label" data-username>…</span>
      </div>
      <button class="cx-mode-btn" data-mode-toggle title="切换明暗模式"></button>`;
    rail.appendChild(foot);

    // 右缘拖拽把手：调整左栏宽度
    rail.insertAdjacentHTML("beforeend", `<div class="cx-resizer" data-resize="rail" title="拖拽调整侧栏宽度"></div>`);

    // 明暗切换按钮：光/暗二态翻转，偏好写入 localStorage
    foot.querySelector("[data-mode-toggle]").addEventListener("click", () => {
      try {
        localStorage.setItem(THEME_OVERRIDE_KEY, isDarkMode() ? "light" : "dark");
      } catch { /* ignore */ }
      syncCxMode();
      makeFavicon();
      syncModeBtn();
    });

    document.body.appendChild(rail);

    // 导航项行为
    scroll.querySelector('[data-nav="topics"]').addEventListener("click", () => {
      closeRailDrawer();
      navigateInApp("/latest");
    });
    scroll.querySelector('[data-nav="drafts"]').addEventListener("click", () => {
      closeRailDrawer();
      openNewTopicComposer();
    });
    scroll.querySelector('[data-nav="messages"]').addEventListener("click", () => {
      closeRailDrawer();
      navigateInApp("/messages");
    });
    scroll.querySelector('[data-nav="bots"]').addEventListener("click", () => {
      closeRailDrawer();
    });
    scroll.querySelector('[data-nav="activity"]').addEventListener("click", () => {
      closeRailDrawer();
      navigateInApp("/my/activity");
    });
    scroll.querySelector('[data-nav="more"]').addEventListener("click", () => {
      categoriesExpanded = !categoriesExpanded;
      delete rail.querySelector(".codex-rail-dynamic")?.dataset.sig;
      renderRailDynamic();
    });
    // AI 机器人之外均为真实路由；bots 仅装饰（tooltip 已标）

    bindNotifTrigger(brand.querySelector(".codex-rail-bell"));
    bindNotifTrigger(foot.querySelector(".codex-rail-foot-user"));

    renderRailDynamic();
    syncRail();
    loadRailExtras();
    bindResizers();
    return rail;
  }

  function closeRailDrawer() {
    document.documentElement.classList.remove("codex-rail-open");
  }

  /** rail 动态分组：置顶 / 分类 / 最近 */
  function renderRailDynamic() {
    const box = document.querySelector(".codex-rail-dynamic");
    if (!box) return;
    const parts = [];

    // 置顶
    const pins = (listState.topics || []).filter((t) => t.pinned).slice(0, 5);
    if (pins.length) {
      parts.push(`<div class="codex-rail-section">置顶</div><div class="codex-rail-section-items">`);
      for (const t of pins) {
        parts.push(
          `<div class="codex-rail-item" data-href="${escapeHtml(topicHref(t))}" title="${escapeHtml(t.title)}">` +
          `<span class="cx-label">${escapeHtml(t.title)}</span>` +
          (topicUnread(t) ? `<span class="cx-dot"></span>` : "") +
          `</div>`
        );
      }
      parts.push(`</div>`);
    }

    // 分类
    const cats = categoriesCache || [];
    if (cats.length) {
      // 首次渲染默认展开第一个分类（用户手动收起后不再重置）
      if (!catsDefaultSeeded) {
        catsDefaultSeeded = true;
        expandedCats.add(cats[0].id);
      }
      const shown = categoriesExpanded ? cats : cats.slice(0, 5);
      parts.push(`<div class="codex-rail-section">分类</div><div class="codex-rail-section-items">`);
      const curPath = location.pathname;
      for (const [idx, c] of shown.entries()) {
        const href = `/c/${c.slug}/${c.id}`;
        const active = curPath.startsWith(`/c/${c.slug}`);
        // 分类下的「session」子条目：默认收起，点击分类下的「展开显示」才展开
        // （对齐原版项目线程列表；避免每个分类下都挂子条目显得全部铺开）
        const open = expandedCats.has(c.id);
        parts.push(
          `<div class="codex-rail-item${active ? " active" : ""}" data-href="${escapeHtml(href)}" title="${escapeHtml(c.name)}">` +
          `${open ? ICONS.folderOpen : ICONS.folder}<span class="cx-label">${escapeHtml(c.name)}</span>` +
          (c.unread > 0 ? `<span class="cx-dot"></span>` : "") +
          `</div>`
        );
        const subs = sessionsForCat(c, idx);
        const shownSubs = open ? subs : [];
        for (const s of shownSubs) {
          parts.push(
            `<div class="codex-rail-item codex-rail-subitem" data-href="${escapeHtml(s.href)}" title="${escapeHtml(s.label)}">` +
            `<span class="cx-label">${escapeHtml(s.label)}</span>` +
            (s.unread ? `<span class="cx-dot"></span>` : "") +
            `</div>`
          );
        }
        if (subs.length) {
          parts.push(
            `<div class="codex-rail-item cx-faint codex-rail-subitem" data-toggle-cat="${c.id}">` +
            (open ? "收起 ↑" : "展开显示 ↓") +
            `</div>`
          );
        }
      }
      if (cats.length > 5) {
        parts.push(
          `<div class="codex-rail-item cx-faint" data-toggle-cats="1">` +
          (categoriesExpanded ? "收起" : "展开显示") +
          `</div>`
        );
      }
      parts.push(`</div>`);
    }

    // 最近
    const recent = (recentTopicsCache || []).slice(0, 4);
    if (recent.length) {
      parts.push(`<div class="codex-rail-section">最近</div><div class="codex-rail-section-items">`);
      for (const t of recent) {
        parts.push(
          `<div class="codex-rail-item" data-href="${escapeHtml(topicHref(t))}" title="${escapeHtml(t.title)}">` +
          `<span class="cx-label">${escapeHtml(t.title)}</span>` +
          (topicUnread(t) ? `<span class="cx-dot"></span>` : "") +
          `</div>`
        );
      }
      parts.push(`</div>`);
    }

    const html = parts.join("");
    if (box.dataset.sig === html) return; // 避免无变化时触发 MutationObserver 空转
    box.dataset.sig = html;
    box.innerHTML = html;
  }

  /** rail 点击委托：动态分组里的跳转 + 展开显示 */
  function bindRailClicks() {
    const rail = document.querySelector(".codex-rail");
    if (!rail || rail.dataset.clickBound === "1") return;
    rail.dataset.clickBound = "1";
    rail.addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-toggle-cats]");
      if (toggle && rail.contains(toggle)) {
        categoriesExpanded = !categoriesExpanded;
        delete rail.querySelector(".codex-rail-dynamic")?.dataset.sig;
        renderRailDynamic();
        return;
      }
      const catToggle = e.target.closest("[data-toggle-cat]");
      if (catToggle && rail.contains(catToggle)) {
        const id = Number(catToggle.getAttribute("data-toggle-cat"));
        expandedCats.has(id) ? expandedCats.delete(id) : expandedCats.add(id);
        delete rail.querySelector(".codex-rail-dynamic")?.dataset.sig;
        renderRailDynamic();
        return;
      }
      const item = e.target.closest("[data-href]");
      if (!item || !rail.contains(item)) return;
      closeRailDrawer();
      navigateInApp(item.getAttribute("data-href"));
    });
  }

  /** 额外数据：分类 / 最近 / 书签数（失败静默） */
  function loadRailExtras() {
    loadCategories().then(() => {
      renderRailDynamic();
      // 分类名到位后刷新列表视图标题/面包屑
      syncChrome();
    });
    if (!recentTopicsCache) {
      api("/latest.json")
        .then((data) => {
          recentTopicsCache = (data.topic_list && data.topic_list.topics) || [];
          renderRailDynamic();
        })
        .catch(() => { recentTopicsCache = []; });
    }
  }

  /** 同步 rail 状态：用户名 / 铃铛蓝点 / 书签数 / 导航 active */
  function syncRail() {
    const rail = document.querySelector(".codex-rail");
    if (!rail) return;
    bindRailClicks();

    const name = getCurrentUsername();
    const nameEl = rail.querySelector("[data-username]");
    if (nameEl && name && nameEl.textContent !== name) nameEl.textContent = name;
    if (nameEl && !name && nameEl.textContent === "…") nameEl.textContent = "未登录";

    const bell = rail.querySelector(".codex-rail-bell");
    if (bell) bell.classList.toggle("has-unread", getUnreadNotificationCount() > 0);
    syncModeBtn();

    // 导航 active：话题 / 我的消息 / 近期活动
    const path = location.pathname;
    rail.querySelector('[data-nav="topics"]')?.classList.toggle(
      "active",
      path === "/" || /^(\/(latest|new|unread|unseen|top|hot)|\/c\/|\/t\/)/.test(path)
    );
    rail.querySelector('[data-nav="messages"]')?.classList.toggle("active", path.startsWith("/messages"));
    rail.querySelector('[data-nav="activity"]')?.classList.toggle("active", path.startsWith("/my"));
  }

  /** 搜索图标：优先打开原生搜索面板，失败退回 /search 页 */
  function openNativeSearch() {
    try {
      const btn = document.querySelector(
        "#search-button, .d-header .search-dropdown button, .d-header li.search-dropdown .icon, button.search-dropdown"
      );
      if (btn) {
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        return;
      }
    } catch { /* ignore */ }
    navigateInApp("/search");
  }

  /* ============================== 主区骨架与顶栏 ============================== */

  function ensureMain() {
    let main = document.querySelector(".codex-main");
    if (main) {
      bindMainEvents(main);
      return main;
    }
    main = document.createElement("main");
    main.className = "codex-main";
    main.innerHTML = `
      <div class="codex-body">
        <div class="codex-thread-col">
          <header class="codex-topbar">
            <button class="cx-icon-btn cx-menu-btn" title="打开侧栏">${ICONS.menu}</button>
            <span class="cx-icon-btn cx-back-btn" title="返回列表">${ICONS.folder}</span>
            <div class="cx-crumb">
              <span class="cx-proj"></span>
              <span style="color:var(--cx-text-faint)">/</span>
              <span class="cx-model"></span>
            </div>
            <div class="cx-spacer"></div>
            <div class="cx-icon-btn cx-panel-toggle" title="显示 / 隐藏代码面板" data-panel-toggle>${ICONS.panel}</div>
            <div class="cx-icon-btn" title="在原生界面打开" data-open-native>${ICONS.external}</div>
            <div class="cx-icon-btn" title="更多（装饰）">${ICONS.dots}</div>
          </header>
          <div class="codex-thread cx-view-list">
            <div class="codex-thread-inner">
              <div class="cx-proj-head">
                <div class="cx-head-title">
                  <button class="cx-icon-btn cx-filter-btn" title="筛选列表">${ICONS.filter}</button>
                  <h1></h1>
                </div>
                <button class="cx-new-topic-btn">${ICONS.plus}新话题</button>
              </div>
              <div class="cx-filter-row">
                <span class="cx-fchip" data-filter-path="/latest">最新</span>
                <span class="cx-fchip" data-filter-path="/new">新</span>
                <span class="cx-fchip" data-filter-path="/unread">未读</span>
                <span class="cx-fchip" data-filter-path="/hot">热门</span>
                <span class="cx-fchip" data-filter-path="/top">排行榜</span>
              </div>
              <div class="cx-new-toggle"></div>
              <div class="cx-proj-desc"></div>
              <div class="cx-thread-rows"></div>
            </div>
          </div>
          <div class="codex-thread cx-view-detail" style="display:none">
            <div class="codex-thread-inner cx-thread-posts"></div>
          </div>
          <div class="codex-composer-wrap">
            <div class="codex-composer">
              <div class="cx-compose-target"><span></span><button type="button" title="取消回复">×</button></div>
              <div class="cx-compose-preview" aria-live="polite"></div>
              <div class="cx-md-edit" data-cx-compose="1" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="发送消息…"></div>
              <div class="cx-composer-toolbar">${cxComposerToolbarHtml()}</div>
              <input type="file" class="cx-composer-file" accept="image/*" multiple hidden>
            </div>
          </div>
        </div>
        <div class="cx-resizer" data-resize="panel" title="拖拽调整分栏宽度"></div>
        <!-- 右侧代码面板：列表 / 详情共享同一实例（纯氛围装饰） -->
        <aside class="cx-code-panel">
          <div class="cx-code-tabs">
            <div class="cx-code-tab"><span class="cx-rs-ic">RS</span><span data-code-file-name>lib.rs</span><span class="cx-close" title="关闭代码面板">×</span></div>
            <span class="cx-code-add" title="新建标签（装饰）">＋</span>
            <div class="cx-code-tabs-actions">
              <span class="cx-icon-btn" title="放大（装饰）">${ICONS.expand}</span>
              <span class="cx-icon-btn" title="分栏（装饰）">${ICONS.panel}</span>
              <span class="cx-icon-btn" data-panel-toggle2 title="关闭面板">${ICONS.sidebar}</span>
            </div>
          </div>
          <div class="cx-code-crumb">
            <div class="cx-crumbs"><span class="cx-seg">linux-do</span> › <span class="cx-seg" data-code-crumb-cat>topics</span> › <span class="cx-seg" data-code-crumb-dir>engine</span> › <span class="cx-cur" data-code-crumb-file>lib.rs</span></div>
            <span class="cx-spacer"></span>
            <div class="cx-code-view-toggle" data-code-view-toggle><span class="cx-on" data-v="code">代码</span><span data-v="diff">diff</span></div>
            <button class="cx-open-btn" title="切换语言（装饰）" data-open-menu-btn><span data-open-lang-label>Java</span><svg class="cx-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 9 12 14 17 9"/></svg></button>
          </div>
          <div class="cx-code-body" data-code-body></div>
        </aside>
      </div>`;
    document.body.appendChild(main);
    bindMainEvents(main);

    // 滚动加载（两个视图各自的滚动容器；代码面板为共享兄弟节点）
    main.querySelector(".cx-view-list").addEventListener("scroll", (e) => {
      const el = e.target;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) loadMoreList();
    });
    main.querySelector(".cx-view-detail").addEventListener("scroll", (e) => {
      const el = e.target;
      if (el.scrollTop < 80) loadOlderPosts();
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) loadNewerPosts();
    });

    syncCodePanelVisibility();
    renderCodePanel();
    bindResizers();
    return main;
  }

  function bindMainEvents(main) {
    if (main.dataset.eventsBound === "1") return;
    main.dataset.eventsBound = "1";

    main.addEventListener("click", (e) => {
      // 窄屏抽屉开关
      if (e.target.closest(".cx-menu-btn")) {
        document.documentElement.classList.toggle("codex-rail-open");
        return;
      }
      // 顶栏文件夹图标 / 面包屑项目名 → 返回列表
      if (e.target.closest(".cx-back-btn")) {
        backToList();
        return;
      }
      if (e.target.closest("[data-open-native]")) {
        window.open(location.href, "_blank", "noopener");
        return;
      }
      // 代码面板显隐：顶栏分屏按钮 / tab 行右侧按钮 / tab 上的 ×
      if (e.target.closest("[data-panel-toggle]") || e.target.closest("[data-panel-toggle2]") || e.target.closest(".cx-code-tab .cx-close")) {
        setCodePanelHidden(!isCodePanelHidden(), true);
        return;
      }
      // 「打开 ∨」→ 语言下拉；菜单项 → 切语言重渲染
      if (e.target.closest("[data-open-menu-btn]")) {
        toggleCodeLangMenu(main);
        return;
      }
      const langItem = e.target.closest("[data-code-lang-item]");
      if (langItem && main.contains(langItem)) {
        setCodeLang(langItem.dataset.codeLangItem);
        closeCodeLangMenu();
        renderCodePanel();
        return;
      }
      // 代码 / diff 切换
      const vt = e.target.closest("[data-code-view-toggle] span");
      if (vt && main.contains(vt)) {
        main.querySelectorAll("[data-code-view-toggle] span").forEach((x) =>
          x.classList.toggle("cx-on", x === vt)
        );
        setCodeMode(vt.dataset.v || "code");
        renderCodePanel();
        return;
      }
      // 「新话题」胶囊
      if (e.target.closest(".cx-new-topic-btn")) {
        openNewTopicComposer();
        return;
      }
      // 列表头筛选：展开 / 收起 + chip 切路由
      if (e.target.closest(".cx-filter-btn")) {
        main.classList.toggle("cx-filters-open");
        return;
      }
      const fchip = e.target.closest(".cx-fchip");
      if (fchip && main.contains(fchip)) {
        navigateInApp(fchip.dataset.filterPath);
        return;
      }
      // 引用卡片「跳转源楼」
      const jumpSrc = e.target.closest(".cx-jump-src");
      if (jumpSrc && main.contains(jumpSrc)) {
        const num = jumpSrc.closest(".cx-tool-card")?.dataset.jumpPost;
        if (num) jumpToSource(Number(num));
        return;
      }
      // 引用卡片折叠
      const toolHead = e.target.closest(".cx-tool-card-head");
      if (toolHead && main.contains(toolHead)) {
        toolHead.parentElement.classList.toggle("cx-open");
        return;
      }
      // 代码块复制
      const copyBtn = e.target.closest(".cx-copy");
      if (copyBtn && main.contains(copyBtn)) {
        const pre = copyBtn.closest(".cx-codeblock")?.querySelector("pre");
        if (pre) copyText(pre.innerText || pre.textContent || "");
        return;
      }
      // 楼层操作行
      const act = e.target.closest(".cx-act");
      if (act && main.contains(act)) {
        const action = act.dataset.action;
        if (action === "like") {
          toggleLike(Number(act.dataset.postId), act);
        } else if (action === "reply") {
          replyToPost(Number(act.dataset.postNumber) || undefined);
        } else if (action === "bookmark") {
          toggleBookmark(Number(act.dataset.postId), act);
        } else if (action === "link") {
          copyPostLink(Number(act.dataset.postNumber));
        }
        return;
      }
      // 话题行 → 详情
      const row = e.target.closest(".cx-trow");
      if (row && main.contains(row)) {
        const href = row.getAttribute("data-href");
        if (href) navigateInApp(href);
        return;
      }
      // 面包屑项目名 → 该分类列表
      if (e.target.closest(".cx-crumb .cx-proj")) {
        backToList();
        return;
      }
      // 正文内站内链接软跳转
      const a = e.target.closest(".cx-view-detail a[href], .cx-view-list a[href]");
      if (a && main.contains(a)) {
        if (e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const href = a.getAttribute("href");
        if (!href || href === "#" || href.startsWith("javascript:")) return;
        if (/^https?:/i.test(href)) {
          try {
            if (new URL(href).origin !== location.origin) return; // 外链默认行为
          } catch { return; }
        }
        e.preventDefault();
        e.stopPropagation();
        navigateInApp(href);
      }
    });

    // 嵌入 im 式 markdown 输入框：输入 / 工具栏 / 图片上传 / 发送全部在本皮内完成
    const composerCard = main.querySelector(".codex-composer");
    if (composerCard) cxWireComposer(composerCard);
  }

  function backToList() {
    const catId = threadState.categoryId;
    const cat = catId ? categoryById(catId) : null;
    navigateInApp(cat ? `/c/${cat.slug}/${cat.id}` : (listState.path || "/latest"));
  }

  function copyText(text) {
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      } catch { /* ignore */ }
    }
  }

  let toastTimer = null;
  /** 轻量底部提示（供楼层操作等失败回滚/成功反馈） */
  function cxToast(message, state) {
    let el = document.querySelector(".cx-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "cx-toast";
      document.body.appendChild(el);
    }
    el.textContent = message || "";
    el.classList.toggle("cx-err", state === "error");
    el.classList.add("cx-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("cx-show"), 2600);
  }

  function copyPostLink(postNumber) {
    if (!threadState.topicId) return;
    const slug = threadState.slug || "topic";
    copyText(`${location.origin}/t/${slug}/${threadState.topicId}/${postNumber || ""}`);
  }

  function showView(view) {
    const main = document.querySelector(".codex-main");
    if (!main) return;
    const list = main.querySelector(".cx-view-list");
    const detail = main.querySelector(".cx-view-detail");
    if (list) list.style.display = view === "list" ? "" : "none";
    if (detail) detail.style.display = view === "detail" ? "" : "none";
  }

  /** 顶栏面包屑 + 大标题 + composer placeholder 随路由同步 */
  /* —— /new「新」下的「所有 / 话题 / 回复」筛选条（吸附原生 toggle，参照 im new-toggle.js）——
     原生 wrapper 被本皮肤隐藏但仍留在 DOM：计数文本可读、点击可转发，
     原生自行切换列表过滤；本地仅记忆选中态并跟手高亮，顺手 force 重拉当前列表。 */
  const CX_NEW_TOGGLE_WRAPPER = ".topic-replies-toggle-wrapper";
  const CX_NEW_TITLES = { all: "所有新话题和过去几天回复的话题", topics: "新话题", replies: "新回复" };
  let cxNewToggleMod = null; // null = 尚未选择：首次访问读原生当前态作为初始值

  function cxNativeNewBtn(mod) {
    try { return document.querySelector(`${CX_NEW_TOGGLE_WRAPPER} .topics-replies-toggle.${mod}`); }
    catch { return null; }
  }

  function cxNewCount(el) {
    if (!el) return 0;
    const text = (el.textContent || "").replace(/\s+/g, " ").trim();
    const m = text.match(/[（(]\s*(\d+)\s*[）)]/);
    if (m) return Number(m[1]);
    const n = parseInt(text.replace(/[^\d]/g, ""), 10);
    return Number.isNaN(n) ? 0 : n;
  }

  function cxNewButtonHtml(mod, label, count, active) {
    return `<button type="button" class="cx-new-toggle-btn --${mod}${active ? " active" : ""}" data-mod="${mod}" title="${CX_NEW_TITLES[mod] || ""}">${label}${count ? ` <span class="n">${count}</span>` : ""}</button>`;
  }

  function syncCxNewToggle() {
    const main = document.querySelector(".codex-main");
    if (!main) return;
    let row = main.querySelector(".cx-new-toggle");
    const show = location.pathname.replace(/\/+$/, "") === "/new";
    if (!show) {
      if (row) row.classList.remove("cx-show");
      return;
    }
    if (!row) { /* 理论上 ensureMain 已建好，兜底重建 */
      row = document.createElement("div");
      row.className = "cx-new-toggle";
      main.querySelector(".cx-filter-row")?.after(row);
    }
    if (!row.dataset.bound) {
      row.dataset.bound = "1";
      row.addEventListener("click", (e) => {
        const btn = e.target.closest(".cx-new-toggle-btn");
        if (!btn || !row.contains(btn)) return;
        const mod = btn.dataset.mod;
        cxNewToggleMod = mod; // 本地点选为选中项，立即高亮
        // 转发原生按钮：原生的过滤交互由其自身事件委托处理
        try { cxNativeNewBtn(mod)?.click?.(); } catch { /* ignore */ }
        // 顺手 force 重拉当前列表，尽量跟随
        if (listState.apiPath) loadList(listState.apiPath, true);
      });
    }
    // 选中态：优先本地记忆；首次访问（无记忆）才读原生当前态
    if (!cxNewToggleMod) {
      let nat = "all";
      const wrapper = document.querySelector(CX_NEW_TOGGLE_WRAPPER);
      if (wrapper) {
        for (const m of ["topics", "replies", "all"]) {
          if (wrapper.querySelector(`.topics-replies-toggle.${m}`)?.classList?.contains("active")) { nat = m; break; }
        }
      }
      cxNewToggleMod = nat;
    }
    const active = cxNewToggleMod;
    const html =
      cxNewButtonHtml("all", "所有", cxNewCount(cxNativeNewBtn("all")), active === "all") +
      cxNewButtonHtml("topics", "话题", cxNewCount(cxNativeNewBtn("topics")), active === "topics") +
      cxNewButtonHtml("replies", "回复", cxNewCount(cxNativeNewBtn("replies")), active === "replies");
    if (row.dataset.sig !== html) {
      row.dataset.sig = html;
      row.innerHTML = html;
    }
    row.classList.add("cx-show");
  }

  function syncChrome() {
    const main = document.querySelector(".codex-main");
    if (!main) return;
    const pathname = location.pathname;
    const proj = main.querySelector(".cx-crumb .cx-proj");
    const model = main.querySelector(".cx-crumb .cx-model");
    const h1 = main.querySelector(".cx-proj-head h1");
    const desc = main.querySelector(".cx-proj-desc");
    const mdEdit = main.querySelector(".codex-composer .cx-md-edit");

    if (isTopicPath(pathname)) {
      const title = threadState.title || "加载中…";
      const cat = threadState.categoryId ? categoryById(threadState.categoryId) : null;
      if (proj) proj.textContent = cat ? cat.name : "话题";
      if (model) model.textContent = `${title} · ${threadState.postsCount || "–"} 楼`;
      if (mdEdit) mdEdit.dataset.placeholder = `回复「${title}」…`;
    } else {
      const title = listTitleForPath(pathname);
      if (proj) proj.textContent = title;
      if (model) model.textContent = `全部线程 · ${listState.topics.length || "–"}`;
      if (h1 && h1.textContent !== title) h1.textContent = title;
      if (desc) {
        const catId = categoryIdFromPath(pathname);
        const cat = catId ? categoryById(catId) : null;
        desc.textContent = cat
          ? `${(cat.description_text || "").slice(0, 60)} · 共 ${cat.topic_count ?? "–"} 个话题`
          : `共 ${listState.topics.length} 个已加载话题`;
      }
      if (mdEdit) mdEdit.dataset.placeholder = `在 ${title} 发新话题…`;
    }
    // 筛选 chips 高亮跟随当前列表路由
    const onPath = location.pathname;
    main.querySelectorAll(".cx-fchip").forEach((chip) => {
      const p = chip.dataset.filterPath || "";
      const on = p === "/latest"
        ? onPath === "/" || onPath.startsWith("/latest")
        : !isTopicPath(onPath) && onPath.startsWith(p);
      chip.classList.toggle("cx-on", on);
    });
    // /new 路由下激活「所有/话题/回复」筛选条（吸附原生 toggle）
    syncCxNewToggle();
    // 代码面板跟随路由换种子（列表 = 路由哈希，详情 = 话题 id；内部有签名去重）
    renderCodePanel();
  }

  /* ============================== 列表视图（话题 = Codex 项目线程） ============================== */

  const listState = {
    path: "",
    apiPath: "",
    moreUrl: null,
    loading: false,
    failedAt: 0,
    topics: []
  };

  function trowHtml(topic) {
    const unread = topicUnread(topic);
    const replies = Math.max(0, (topic.posts_count || 1) - 1);
    const cat = topic.category_id ? categoryById(topic.category_id) : null;
    const sub = topic.excerpt
      ? String(topic.excerpt).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 60)
      : [cat && cat.name, topic.last_poster_username && `@${topic.last_poster_username}`]
          .filter(Boolean).join(" · ");
    const status = topic.pinned
      ? `<span class="cx-trow-pin">${ICONS.pin}</span>`
      : `<span class="cx-trow-dot${unread ? " cx-unread" : ""}"></span>`;
    return `
      <div class="cx-trow${unread ? "" : " cx-read"}" data-href="${escapeHtml(topicHref(topic))}" data-topic-id="${topic.id}">
        ${status}
        <div class="cx-trow-texts">
          <div class="cx-trow-title">${escapeHtml(topic.title)}</div>
          ${sub ? `<div class="cx-trow-sub">${escapeHtml(sub)}</div>` : ""}
        </div>
        <div class="cx-trow-meta">
          <span>${replies} 回复</span>
          <span>${topic.pinned ? "置顶" : escapeHtml(formatTime(topic.last_activity_at))}</span>
        </div>
      </div>`;
  }

  function renderListRows() {
    const box = document.querySelector(".cx-thread-rows");
    if (!box) return;
    const rows = [];
    listState.topics.forEach((t, i) => {
      if (i > 0) rows.push(`<div class="cx-trow-sep"></div>`);
      rows.push(trowHtml(t));
    });
    rows.push(
      `<div class="cx-list-status">${
        listState.loading ? "加载中…" :
        listState.moreUrl ? "滚动加载更多…" :
        (listState.topics.length ? "没有更多了" : "暂无话题")
      }</div>`
    );
    box.innerHTML = rows.join("");
    syncChrome();
    renderRailDynamic();
  }

  function applyListJson(data, append) {
    const topics = (data.topic_list && data.topic_list.topics) || [];
    const existing = new Set(append ? listState.topics.map((t) => t.id) : []);
    const fresh = topics.filter((t) => !existing.has(t.id));
    listState.topics = append ? listState.topics.concat(fresh) : topics;
    const more = data.topic_list && data.topic_list.more_topics_url;
    listState.moreUrl = more ? more.replace(/\.json\b/, ".json") : null;
    renderListRows();
  }

  async function loadList(apiPath, force) {
    if (!apiPath) return;
    // 用列表 API 做缓存键：进帖子时 pathname 会变，但不应重拉列表；
    // 缓存命中只同步面包屑 / rail，不重绘行（避免抽屉开关等场景重置滚动）
    if (!force && listState.apiPath === apiPath && listState.topics.length) {
      syncChrome();
      renderRailDynamic();
      return;
    }
    if (listState.loading) return;
    // 失败冷却：10 秒内不重复请求（否则 Ember 的 DOM 抖动会触发 applyTheme → 重试风暴）
    if (listState.failedAt && Date.now() - listState.failedAt < 10000) return;
    listState.loading = true;
    listState.apiPath = apiPath;
    listState.path = location.pathname;
    renderListRows();
    try {
      const data = await api(apiPath);
      if (listState.apiPath !== apiPath) return; // 路由已切走
      listState.failedAt = 0;
      applyListJson(data, false);
    } catch (err) {
      listState.failedAt = Date.now();
      const status = /HTTP (\d+)/.exec(err && err.message || "")?.[1];
      const box = document.querySelector(".cx-thread-rows");
      if (box) box.innerHTML = `<div class="cx-list-status">列表加载失败${
        status === "403"
          ? "（HTTP 403：可能被 Cloudflare 拦截或未登录，刷新页面或登录后重试）"
          : status ? `（HTTP ${status}）` : ""
      }，点击重试</div>`;
      // 点错误行手动重试
      box?.querySelector(".cx-list-status")?.addEventListener("click", () => {
        listState.failedAt = 0;
        loadList(apiPath, true);
      }, { once: true });
    } finally {
      listState.loading = false;
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
    }
  }

  /* ============================== cooked 装饰：Codex markdown 样式 ============================== */

  /**
   * 把原生 cooked DOM 装饰成 Codex 风格：
   * 行内 code → 芯片；pre → 带头栏的代码块；引用 → 可折叠工具卡片；图片 lazy
   */
  function decorateCooked(root) {
    if (!root) return;

    // 行内 code → 芯片
    root.querySelectorAll("code").forEach((code) => {
      if (code.closest("pre")) return;
      code.classList.add("cx-inline-code");
    });

    // 代码块 → 带头栏 + 复制按钮
    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.closest(".cx-codeblock")) return;
      const code = pre.querySelector("code");
      const lang = (code && (code.className || "").match(/lang(?:uage)?-([\w#+-]+)/i) || [])[1] || "text";
      const wrap = document.createElement("div");
      wrap.className = "cx-codeblock";
      pre.replaceWith(wrap);
      const head = document.createElement("div");
      head.className = "cx-codeblock-head";
      head.innerHTML = `<span>${escapeHtml(lang)}</span><span class="cx-copy">${ICONS.copy}复制</span>`;
      wrap.appendChild(head);
      wrap.appendChild(pre);
    });

    // Discourse 引用 aside.quote → 可折叠工具调用卡片
    root.querySelectorAll("aside.quote").forEach((quote) => {
      if (quote.closest(".cx-tool-card")) return;
      const postNo = quote.getAttribute("data-post");
      const titleEl = quote.querySelector(":scope > .title");
      const username = (titleEl?.textContent || "").replace(/[:：]\s*$/, "").trim();
      const label = postNo
        ? `引用 ${postNo} 楼${username ? ` · ${username}` : ""}`
        : (username ? `引用 · ${username}` : "引用");
      const body = quote.querySelector(":scope > blockquote");
      const card = document.createElement("div");
      card.className = "cx-tool-card";
      if (postNo) card.dataset.jumpPost = postNo; // 引用跳源楼
      const head = document.createElement("div");
      head.className = "cx-tool-card-head";
      head.innerHTML =
        `${ICONS.quote}<span>${escapeHtml(label)}</span>` +
        (postNo ? `<span class="cx-jump-src" title="跳转源楼">${ICONS.external}</span>` : "") +
        `${ICONS.chevronRightSm}`;
      const bodyEl = document.createElement("div");
      bodyEl.className = "cx-tool-card-body";
      if (body) {
        while (body.firstChild) bodyEl.appendChild(body.firstChild);
      }
      card.appendChild(head);
      card.appendChild(bodyEl);
      quote.replaceWith(card);
    });

    // 普通 blockquote → 简约卡片（无楼层信息）
    root.querySelectorAll("blockquote").forEach((bq) => {
      if (bq.closest(".cx-tool-card") || bq.closest("aside.quote")) return;
      const card = document.createElement("div");
      card.className = "cx-tool-card";
      const head = document.createElement("div");
      head.className = "cx-tool-card-head";
      head.innerHTML = `${ICONS.quote}<span>引用</span>${ICONS.chevronRightSm}`;
      const bodyEl = document.createElement("div");
      bodyEl.className = "cx-tool-card-body";
      while (bq.firstChild) bodyEl.appendChild(bq.firstChild);
      card.appendChild(head);
      card.appendChild(bodyEl);
      bq.replaceWith(card);
    });

    // 外链新标签打开；图片 lazy
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
      // 非 emoji 图片：点击开灯箱完整查看原图（原为 hover 缩略放大 / 点开新标签）
      if (img.classList.contains("emoji")) return;
      const href =
        img.closest("a[href]")?.getAttribute("href") ||
        img.getAttribute("src") ||
        "";
      if (!href || !/^\/(uploads|user_avatar|letter_avatar)/.test(href) && !/^https?:/.test(href)) {
        return;
      }
      img.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        openLightbox(href);
      });
    });

    // 投票组件化（这条帖若含 .poll 则渲染为 Codex 风格投票卡）
    activatePolls(root);
  }

  /* ============================== 引用跳源楼 + 返回（移植自 im features/quote-jump.js） ============================== */

  const quoteJumpStack = []; // { topicId, scrollTop }

  function hideJumpBackBtn() {
    const btn = document.querySelector(".cx-jump-back");
    if (btn) btn.classList.remove("cx-show");
  }

  function clearQuoteJumpHistory() {
    quoteJumpStack.length = 0;
    hideJumpBackBtn();
  }

  function showJumpBackBtn() {
    let btn = document.querySelector(".cx-jump-back");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cx-jump-back";
      btn.innerHTML =
        `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><polyline points="5 12 12 5 19 12"/></svg>` +
        `<span>返回原处</span>` +
        `<span class="cx-jump-back-x" title="清除">×</span>`;
      btn.addEventListener("click", (e) => {
        if (e.target.closest(".cx-jump-back-x")) { clearQuoteJumpHistory(); return; }
        popQuoteJump();
      });
      document.body.appendChild(btn);
    }
    btn.classList.add("cx-show");
  }

  function popQuoteJump() {
    const item = quoteJumpStack.pop();
    if (!item) return;
    const scroller = document.querySelector(".cx-view-detail");
    if (item.topicId === threadState.topicId && scroller && typeof item.scrollTop === "number") {
      scroller.scrollTo({ top: item.scrollTop, behavior: "smooth" });
    }
    if (!quoteJumpStack.length) hideJumpBackBtn();
  }

  /** 点击引用卡片「跳转源楼」：记录当前位置，平滑滚到被引用楼层并高亮 */
  /** 引用卡片「跳转源楼」：本地命中直接滚；未加载则远端拉取包含该楼的窗口再滚，并高亮 */
  async function jumpToSource(postNumber) {
    const scroller = document.querySelector(".cx-view-detail");
    if (!scroller) return;
    const n = Math.floor(Number(postNumber));
    if (!n || n < 1) {
      cxToast("无法跳转：楼层号无效", "error");
      return;
    }
    if (scrollToTurnNum(scroller, n)) return;

    // 目标楼尚未加载：先从远端取一个包含它的窗口
    if (!threadState.topicId) {
      cxToast(`#${n} 楼尚未加载`, "error");
      return;
    }
    if (threadState.loading) {
      cxToast("楼层正在加载，请稍候", "info");
      return;
    }
    const topicId = threadState.topicId;
    threadState.loading = true;
    try {
      const data = await api(`/t/${topicId}/${n}.json`);
      if (threadState.topicId !== topicId) return; // 路由已切走
      const posts = (data.post_stream && data.post_stream.posts) || [];
      if (!posts.length) {
        cxToast(`#${n} 楼未找到`, "error");
        return;
      }
      threadState.stream = (data.post_stream && data.post_stream.stream) || posts.map((p) => p.id);
      threadState.postsCount = Number(data.posts_count) || threadState.postsCount || posts.length;
      for (const p of posts) {
        if (p.post_number) threadState.postsByNum[p.post_number] = p;
      }

      const box = detailContainer();
      if (!box) return;
      const known = new Set();
      for (const el of box.querySelectorAll(".cx-turn-user, .cx-turn-agent")) {
        const pn = Number(el.dataset.postNumber);
        if (pn) known.add(pn);
      }
      // 只补渲染窗口内缺失的楼：比已渲染最旧楼还旧 → prepend，其余 → append
      const fresh = posts.filter((p) => p.post_number && !known.has(p.post_number))
        .slice().sort((a, b) => a.post_number - b.post_number);
      if (fresh.length) {
        const holder = document.createElement("div");
        holder.innerHTML = turnsHtml(fresh);
        decorateCooked(holder);
        sprinkleActivity(holder);
        const edge = known.size ? Math.min(...known) : Infinity;
        if (fresh[0].post_number < edge) {
          const beforePrep = scroller.scrollHeight;
          box.prepend(...holder.childNodes);
          scroller.scrollTop += scroller.scrollHeight - beforePrep;
        } else {
          box.querySelector(".cx-turn-divider")?.remove();
          box.append(...holder.childNodes);
        }
      }

      // 更新已渲染区间，后续滚动续接（loadOlder/Newer）按新区间切流
      const wFirst = threadState.stream.indexOf(posts[0].id);
      const wLast = threadState.stream.indexOf(posts[posts.length - 1].id);
      if (wFirst >= 0) threadState.renderedFirstIdx = Math.min(threadState.renderedFirstIdx, wFirst);
      if (wLast >= 0) threadState.renderedLastIdx = Math.max(threadState.renderedLastIdx, wLast);
      threadState.hasOlder = threadState.renderedFirstIdx > 0;
      threadState.hasNewer = threadState.renderedLastIdx >= 0 &&
        threadState.renderedLastIdx < threadState.stream.length - 1;
      syncThreadDivider();

      // 目标楼不在窗口内（被删 / 尾楼）时落向窗口最近一楼
      const landed = posts.some((p) => p.post_number === n)
        ? n
        : (posts[posts.length - 1].post_number || n);
      scrollToTurnNum(scroller, landed);
    } catch {
      cxToast(`#${n} 楼加载失败`, "error");
    } finally {
      threadState.loading = false;
    }
  }

  /** 滚到指定楼层并高亮；未找到返回 false */
  function scrollToTurnNum(scroller, postNumber) {
    const target = scroller.querySelector(
      `.cx-turn-user[data-post-number="${postNumber}"], .cx-turn-agent[data-post-number="${postNumber}"]`
    );
    if (!target) return false;
    quoteJumpStack.push({ topicId: threadState.topicId, scrollTop: scroller.scrollTop });
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.remove("cx-jump-highlight");
    void target.offsetWidth;
    target.classList.add("cx-jump-highlight");
    showJumpBackBtn();
    return true;
  }

  /* ============================== 投票组件（移植自 im features/polls.js，改 Codex token） ============================== */

  async function apiVotePoll(postId, pollName, optionIds) {
    if (!postId || !optionIds.length) return null;
    const body = new URLSearchParams();
    body.append("post_id", String(postId));
    body.append("poll_name", String(pollName || "poll"));
    for (const opt of optionIds) body.append("options[]", String(opt));
    const resp = await fetch("/polls/vote", {
      method: "PUT",
      credentials: "same-origin",
      headers: {
        "X-CSRF-Token": csrfToken(),
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }

  async function apiUndoVotePoll(postId, pollName) {
    if (!postId) return null;
    const body = new URLSearchParams();
    body.append("post_id", String(postId));
    body.append("poll_name", String(pollName || "poll"));
    const resp = await fetch("/polls/vote", {
      method: "DELETE",
      credentials: "same-origin",
      headers: {
        "X-CSRF-Token": csrfToken(),
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }

  function getVotedOptionIds(postId, pollName, postData) {
    if (postData && postData.polls_votes && postData.polls_votes[pollName]) {
      const v = postData.polls_votes[pollName];
      return (Array.isArray(v) ? v : [v]).map(String);
    }
    try {
      const cache = localStorage.getItem(`codex_poll_${postId}_${pollName}`);
      if (cache) return JSON.parse(cache).map(String);
    } catch { /* ignore */ }
    return [];
  }

  function saveVotedOptionIds(postId, pollName, optionIds) {
    try { localStorage.setItem(`codex_poll_${postId}_${pollName}`, JSON.stringify(optionIds)); } catch { /* ignore */ }
  }

  function clearVotedOptionIds(postId, pollName) {
    try { localStorage.removeItem(`codex_poll_${postId}_${pollName}`); } catch { /* ignore */ }
  }

  function applyPollResult(poll, pollData) {
    if (!poll || !pollData) return;
    const options = pollData.options || [];
    const totalVotes = options.reduce((sum, o) => sum + (Number(o.votes) || 0), 0);
    const infoNumber = poll.querySelector(".poll-info .info-number");
    if (infoNumber) infoNumber.textContent = String(pollData.voters != null ? pollData.voters : totalVotes);
    for (const opt of options) {
      const optEl = poll.querySelector(`.cx-poll-option[data-poll-option-id="${opt.id}"]`);
      if (!optEl) continue;
      const votes = Number(opt.votes) || 0;
      const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
      const countEl = optEl.querySelector(".cx-poll-count");
      if (countEl) { countEl.textContent = `${votes} 票 (${pct}%)`; countEl.style.display = ""; }
      const barEl = optEl.querySelector(".cx-poll-bar");
      if (barEl) barEl.style.width = `${pct}%`;
    }
  }

  /** 把 Discourse 原生 .poll 组件化为 Codex 投票卡（每批渲染只初始化一次） */
  function initPoll(poll) {
    if (poll.dataset.cxPoll === "1") return;
    const items = poll.querySelectorAll("li[data-poll-option-id]");
    if (!items.length) return;

    const holder = poll.closest(".cx-turn-agent") || poll.closest(".cx-turn-user");
    const postNumber = holder ? Number(holder.dataset.postNumber) : null;
    const postData = postNumber ? threadState.postsByNum[postNumber] : null;
    const postId = (postData && postData.id) || (holder && holder.dataset.postId) || null;
    const pollName = poll.dataset.pollName || "poll";
    const isMultiple = poll.dataset.pollType === "multiple";
    const pollInfo = postData && postData.polls && postData.polls.find((p) => p.name === pollName);
    const optionsData = (pollInfo && pollInfo.options) || [];
    const totalVotes = optionsData.reduce((sum, o) => sum + (Number(o.votes) || 0), 0);
    const voters = (pollInfo && pollInfo.voters != null) ? pollInfo.voters : totalVotes;
    const votedOptionIds = getVotedOptionIds(postId, pollName, { ...postData });
    const hasVoted = votedOptionIds.length > 0;

    const infoNumber = poll.querySelector(".poll-info .info-number");
    if (infoNumber && voters > 0) infoNumber.textContent = String(voters);

    const optionsBox = document.createElement("div");
    optionsBox.className = "cx-poll-options";

    items.forEach((li) => {
      const optId = li.dataset.pollOptionId;
      const rawText = (li.textContent || "").trim().replace(/\s*\d+\s*票\s*\(\d+%\)$/, "").trim();
      const matchedOpt = optionsData.find((o) => o.id === optId);
      const votes = matchedOpt ? Number(matchedOpt.votes) || 0 : 0;
      const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
      const countText = totalVotes > 0 ? `${votes} 票 (${pct}%)` : "";
      const isSelected = votedOptionIds.includes(optId);

      const optEl = document.createElement("div");
      optEl.className = "cx-poll-option" + (isSelected ? " selected" : "");
      optEl.dataset.pollOptionId = optId;
      optEl.dataset.multi = isMultiple ? "1" : "0";
      optEl.innerHTML =
        `<span class="cx-poll-radio"></span>` +
        `<span class="cx-poll-title">${escapeHtml(rawText)}</span>` +
        `<span class="cx-poll-count" style="${countText ? "" : "display:none"}">${escapeHtml(countText)}</span>` +
        `<div class="cx-poll-bar" style="width:${pct}%"></div>`;

      optEl.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isMultiple) {
          optionsBox.querySelectorAll(".cx-poll-option").forEach((el) => {
            if (el !== optEl) el.classList.remove("selected");
          });
        }
        optEl.classList.toggle("selected");
        const btn = poll.querySelector(".cx-poll-submit");
        if (btn && btn.textContent === "投票") {
          btn.disabled = !optionsBox.querySelector(".cx-poll-option.selected");
        }
      });

      optionsBox.appendChild(optEl);
    });

    // 替换原生选项列表（ol / ul 都兼容）
    const listEl = poll.querySelector("ol, ul");
    if (listEl) listEl.replaceWith(optionsBox);
    else poll.appendChild(optionsBox);

    if (!poll.querySelector(".cx-poll-actions")) {
      const actions = document.createElement("div");
      actions.className = "cx-poll-actions";
      actions.innerHTML =
        `<button type="button" class="cx-poll-submit" ${hasVoted ? "" : "disabled"}>${hasVoted ? "已投票" : "投票"}</button>` +
        `<button type="button" class="cx-poll-undo" style="${hasVoted ? "" : "display:none"}">撤销投票</button>` +
        `<span class="cx-poll-tip">${hasVoted ? "✓ 您已参与投票" : ""}</span>`;
      poll.appendChild(actions);

      const submitBtn = actions.querySelector(".cx-poll-submit");
      const undoBtn = actions.querySelector(".cx-poll-undo");
      const tip = actions.querySelector(".cx-poll-tip");

      submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (submitBtn.textContent === "已投票") return;
        const selected = Array.from(optionsBox.querySelectorAll(".cx-poll-option.selected"))
          .map((el) => el.dataset.pollOptionId);
        if (!selected.length || !postId) return;
        submitBtn.disabled = true;
        submitBtn.textContent = "正在提交…";
        try {
          const res = await apiVotePoll(postId, pollName, selected);
          saveVotedOptionIds(postId, pollName, selected);
          submitBtn.textContent = "已投票";
          undoBtn.style.display = "";
          tip.textContent = "✓ 投票成功";
          if (res && res.poll) applyPollResult(poll, res.poll);
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = "投票";
          tip.textContent = `投票失败: ${err.message || "未知错误"}`;
        }
      });

      undoBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        undoBtn.disabled = true;
        try {
          const res = await apiUndoVotePoll(postId, pollName);
          clearVotedOptionIds(postId, pollName);
          undoBtn.disabled = false;
          undoBtn.style.display = "none";
          submitBtn.textContent = "投票";
          submitBtn.disabled = true;
          optionsBox.querySelectorAll(".cx-poll-option.selected").forEach((el) => el.classList.remove("selected"));
          tip.textContent = "已撤销投票";
          if (res && res.poll) applyPollResult(poll, res.poll);
        } catch (err) {
          undoBtn.disabled = false;
          tip.textContent = "撤销失败";
        }
      });
    }
    poll.dataset.cxPoll = "1";
  }

  /** decorateCooked 内调用：把容器里全部 .poll 组件化 */
  function activatePolls(container) {
    if (!container) return;
    container.querySelectorAll(".poll").forEach((poll) => {
      try { initPoll(poll); } catch (err) { console.warn("[linuxdo-codex] poll init failed:", err); }
    });
  }

  /* ============================== 书签（直连 API，移植自 im features/interactions.js） ============================== */

  const bookmarkIds = new Map(); // postId -> bookmarkId（取消收藏需要 id，取不到时用 remove_bookmarks 兜底）

  function setBookmarkedUi(btn, on) {
    if (!btn) return;
    btn.classList.toggle("bookmarked", on);
    btn.title = on ? "取消收藏" : "收藏";
    const icon = btn.querySelector("svg");
    if (icon) icon.outerHTML = on ? ICONS.bookmarkFill : ICONS.bookmark;
  }

  async function toggleBookmark(postId, btn) {
    if (!postId) return;
    const bookmarked = btn.classList.contains("bookmarked");
    const headers = {
      "X-CSRF-Token": csrfToken(),
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json"
    };
    try {
      if (!bookmarked) {
        const resp = await fetch("/bookmarks.json", {
          method: "POST",
          credentials: "same-origin",
          headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
          body: `reminder_at=&auto_delete_preference=3&bookmarkable_id=${postId}&bookmarkable_type=Post`
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.ok) {
          const bid = data.bookmark?.id || data.id;
          if (bid) bookmarkIds.set(postId, bid);
          setBookmarkedUi(btn, true);
        } else if (resp.status === 422) {
          // 已收藏过：服务端只回 422，按已收藏对齐 UI
          setBookmarkedUi(btn, true);
        } else {
          throw new Error(data.errors?.[0] || `HTTP ${resp.status}`);
        }
      } else {
        const bid = bookmarkIds.get(postId);
        if (bid) {
          await apiSend(`/bookmarks/${bid}.json`, "DELETE");
        } else {
          // 拿不到 bookmark id（如初始即已收藏）：用话题级移除端点，无需 id
          const topicId = threadState.topicId;
          if (!topicId) { cxToast("无法取消收藏（话题信息缺失）", "error"); return; }
          const form = new URLSearchParams();
          form.append("post_ids[]", String(postId));
          const resp = await fetch(`/t/${topicId}/remove_bookmarks.json`, {
            method: "POST",
            credentials: "same-origin",
            headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: form.toString()
          });
          if (!resp.ok) {
            const data = await resp.json().catch(() => ({}));
            throw new Error(data.errors?.[0] || `HTTP ${resp.status}`);
          }
        }
        bookmarkIds.delete(postId);
        setBookmarkedUi(btn, false);
      }
    } catch (err) {
      cxToast(`书签操作失败: ${err.message || "未知错误"}`, "error");
    }
  }

  /* ============================== 阅读进度上报（移植自 im features/read-track.js） ============================== */
  // 原生按原生楼层 DOM 可见性计时；codex 自渲染流屏蔽原生滚动 → 改按 .cx-thread-posts 可见楼层累计，
  // 其余规则照搬原生 screen-track：每秒 tick；停滚 3 分钟暂停（防挂机）；页面不可见不累计；
  // 60s 周期 / 切话题 / 页面隐藏 flush。只报真实读到的楼层。

  const READ_TICK_MS = 1000;
  const READ_PAUSE_UNLESS_SCROLLED = 3 * 60 * 1000;
  const READ_MAX_TRACKING = 6 * 60 * 1000; // 每楼每次会话最多报 6 分钟
  const READ_FLUSH_INTERVAL = 60 * 1000;
  const READ_MAX_GAP = 60 * 1000;          // 休眠恢复的巨大跳变整段丢弃

  const readTimings = new Map();   // post_number -> 本批 ms
  const readTotal = new Map();     // post_number -> 本会话已上报总量
  let readActiveTopic = null;
  let readTopicTime = 0;
  let readLastTick = 0;
  let readLastScrolled = 0;
  let readSinceFlush = 0;
  let readFlushing = false;

  function visiblePostNumbers() {
    const box = detailContainer();
    const scroller = document.querySelector(".cx-view-detail");
    if (!box || !scroller || !box.children.length) return [];
    const vr = scroller.getBoundingClientRect();
    const out = [];
    box.querySelectorAll(".cx-turn-user[data-post-number], .cx-turn-agent[data-post-number]")
      .forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < vr.top || r.top > vr.bottom) return;
        const n = Number(el.dataset.postNumber);
        if (n > 0) out.push(n);
      });
    return out;
  }

  async function flushReadTrack() {
    if (readFlushing || !readTimings.size || !readActiveTopic) return;
    const id = readActiveTopic;
    const batch = [];
    for (const [n, ms] of readTimings) {
      const total = readTotal.get(n) || 0;
      if (ms > 0 && total < READ_MAX_TRACKING) {
        readTotal.set(n, total + ms);
        batch.push([n, ms]);
      }
    }
    readTimings.clear();
    const time = readTopicTime;
    readTopicTime = 0;
    readSinceFlush = 0;
    if (!batch.length) return;
    readFlushing = true;
    const params = batch.map(([n, ms]) => `timings[${n}]=${Math.round(ms)}`).join("&");
    const body = `${params}&topic_time=${Math.round(time)}&topic_id=${id}`;
    try {
      await fetch("/topics/timings", {
        method: "POST",
        credentials: "same-origin",
        keepalive: true, // pagehide 时也尽量发出
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-CSRF-Token": csrfToken(),
          "X-Requested-With": "XMLHttpRequest",
          "X-SILENCE-LOGGER": "true",
          "Discourse-Background": "true"
        },
        body
      });
    } catch { /* 丢弃本批（原生 inProgress 期间同样丢） */ } finally { readFlushing = false; }
  }

  function tickReadTrack() {
    if (otherThemeActive()) return;
    const now = Date.now();
    const diff = now - readLastTick;
    readLastTick = now;
    if (diff <= 0) return;

    // 话题切换：先结算旧话题再重置（loadTopic 只改 threadState.topicId，这里被动感知）
    if (threadState.topicId !== readActiveTopic) {
      flushReadTrack();
      readActiveTopic = threadState.topicId;
      readTimings.clear();
      readTotal.clear();
      readTopicTime = 0;
      readSinceFlush = 0;
    }
    if (!readActiveTopic) return;

    if (now - readLastScrolled > READ_PAUSE_UNLESS_SCROLLED) return;
    if (document.visibilityState !== "visible") return;
    if (diff > READ_MAX_GAP) return;

    readSinceFlush += diff;
    if (readSinceFlush > READ_FLUSH_INTERVAL) flushReadTrack();

    const nums = visiblePostNumbers();
    if (!nums.length) return;
    readTopicTime += diff;
    for (const n of nums) readTimings.set(n, (readTimings.get(n) || 0) + diff);
  }

  function startReadTracking() {
    if (window.__codexReadTrackBound) return;
    window.__codexReadTrackBound = true;
    // 滚动不冒泡，capture 阶段委托；只认详情滚动容器
    document.addEventListener("scroll", (e) => {
      if (e.target instanceof Element && e.target.closest(".cx-view-detail")) {
        readLastScrolled = Date.now();
      }
    }, true);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushReadTrack();
      readLastTick = Date.now();
    });
    window.addEventListener("pagehide", () => flushReadTrack());
    readLastTick = readLastScrolled = Date.now();
    setInterval(tickReadTrack, READ_TICK_MS);
  }

/* ============================== 右侧代码面板（纯氛围，移植自 codex-mock.html） ============================== */

  const CODE_LANG_NAMES = { rust: "Rust", python: "Python", typescript: "TypeScript", go: "Go", java: "Java" };

  /** 「打开 ∨」下拉：选择代码语言 */
  function closeCodeLangMenu() {
    document.querySelector(".cx-lang-menu")?.remove();
  }

  function toggleCodeLangMenu(main) {
    const exist = document.querySelector(".cx-lang-menu");
    if (exist) { exist.remove(); return; }
    const btn = main.querySelector("[data-open-menu-btn]");
    if (!btn) return;
    const cur = getCodeLang();
    const menu = document.createElement("div");
    menu.className = "cx-lang-menu";
    menu.innerHTML = Object.keys(CODE_LANGS)
      .map((k) =>
        `<div class="cx-lang-item${k === cur ? " cx-on" : ""}" data-code-lang-item="${k}">` +
        `<span>${CODE_LANG_NAMES[k] || k}</span>` +
        (k === cur
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
          : "") +
        `</div>`
      )
      .join("");
    main.appendChild(menu);
    const r = btn.getBoundingClientRect();
    const w = menu.offsetWidth;
    menu.style.top = `${r.bottom + 6}px`;
    menu.style.left = `${Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8))}px`;
    // 下一次事件循环再挂一次性关闭监听，避免吞掉本次点击
    setTimeout(() => {
      document.addEventListener("click", closeCodeLangMenu, { once: true, capture: true });
    }, 0);
  }

  const CODE_LANG_KEY = "linuxdo-codex-code-lang";   // rust/python/typescript/go/java
  const CODE_MODE_KEY = "linuxdo-codex-code-mode";   // "code" | "diff"
  const CODE_PANEL_KEY = "linuxdo-codex-code-panel"; // "0" = 隐藏

  function getCodeLang() {
    try {
      const v = localStorage.getItem(CODE_LANG_KEY);
      if (v && CODE_LANGS[v]) return v;
    } catch { /* ignore */ }
    return "rust";
  }

  function setCodeLang(lang) {
    try { localStorage.setItem(CODE_LANG_KEY, lang); } catch { /* ignore */ }
  }

  function getCodeMode() {
    try {
      const v = localStorage.getItem(CODE_MODE_KEY);
      if (v === "diff" || v === "code") return v;
    } catch { /* ignore */ }
    return "code";
  }

  function setCodeMode(mode) {
    try { localStorage.setItem(CODE_MODE_KEY, mode); } catch { /* ignore */ }
  }

  /** 面板显隐：默认打开；用户手动关过则记住 */
  function isCodePanelHidden() {
    try {
      if (localStorage.getItem(CODE_PANEL_KEY) === "0") return true;
    } catch { /* ignore */ }
    return false;
  }

  function setCodePanelHidden(hidden, persist) {
    if (persist) {
      try { localStorage.setItem(CODE_PANEL_KEY, hidden ? "0" : "1"); } catch { /* ignore */ }
    }
    document.documentElement.classList.toggle("codex-hide-code-panel", hidden);
  }

  function syncCodePanelVisibility() {
    setCodePanelHidden(isCodePanelHidden(), false);
  }

  /* ============================== 三栏拖拽调宽 ============================== */

  const RAIL_W_KEY = "linuxdo-codex-rail-w";
  const PANEL_W_KEY = "linuxdo-codex-panel-w";

  function storedWidth(key, min, max) {
    try {
      const v = parseInt(localStorage.getItem(key), 10);
      if (!Number.isNaN(v)) return Math.min(max, Math.max(min, v));
    } catch { /* ignore */ }
    return null;
  }

  function persistWidth(key, w) {
    try { localStorage.setItem(key, String(w)); } catch { /* ignore */ }
  }

  /** 启动时恢复用户拖出的宽度（inline style 覆盖 token 默认值） */
  function restoreColumnWidths() {
    const rootEl = document.documentElement;
    const r = storedWidth(RAIL_W_KEY, 240, 520);
    if (r) rootEl.style.setProperty("--cx-rail-w", r + "px");
    const p = storedWidth(PANEL_W_KEY, 280, 1000);
    if (p) rootEl.style.setProperty("--cx-panel-w", p + "px");
  }

  /** 绑定 [data-resize] 把手：pointer 拖拽实时写 CSS 变量，松手持久化 */
  function bindResizers() {
    document.querySelectorAll("[data-resize]").forEach((rz) => {
      if (rz.dataset.resizerBound === "1") return;
      rz.dataset.resizerBound = "1";
      rz.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        const rootEl = document.documentElement;
        const cs = getComputedStyle(rootEl);
        const kind = rz.dataset.resize;
        const startX = e.clientX;
        const railW = parseFloat(cs.getPropertyValue("--cx-rail-w")) || RAIL_WIDTH;
        const startW = kind === "rail"
          ? railW
          : (document.querySelector(".cx-code-panel")?.getBoundingClientRect().width || 500);
        rz.classList.add("cx-dragging");
        document.body.classList.add("codex-resizing");
        const move = (ev) => {
          const dx = ev.clientX - startX;
          if (kind === "rail") {
            const w = Math.round(Math.min(Math.max(startW + dx, 240), Math.min(520, window.innerWidth * 0.34)));
            rootEl.style.setProperty("--cx-rail-w", w + "px");
          } else {
            const maxP = Math.max(320, window.innerWidth - railW - 420); // 中间栏至少留 420px
            const w = Math.round(Math.min(Math.max(startW - dx, 280), maxP));
            rootEl.style.setProperty("--cx-panel-w", w + "px");
          }
        };
        const up = () => {
          rz.classList.remove("cx-dragging");
          document.body.classList.remove("codex-resizing");
          document.removeEventListener("pointermove", move);
          document.removeEventListener("pointerup", up);
          persistWidth(RAIL_W_KEY, parseFloat(getComputedStyle(rootEl).getPropertyValue("--cx-rail-w")) || 306);
          persistWidth(PANEL_W_KEY, parseFloat(getComputedStyle(rootEl).getPropertyValue("--cx-panel-w")) || 500);
        };
        document.addEventListener("pointermove", move);
        document.addEventListener("pointerup", up);
      });
    });
  }

  // 伪随机（种子 = 话题 id + 语言，同一帖子刷新后内容稳定，不同帖子排列不同）
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const CODE_LANGS = {
    rust: {
      file: "lib.rs", dir: "engine", icon: "RS", comment: "//",
      kw: ["fn","let","mut","impl","pub","use","struct","enum","match","if","else","for","in","return","mod","crate","self","Self","async","await","move","where","const","trait","loop","while","Ok","Err","Some","None","Box","Vec","String","Result","Option"],
      blocks: [
        ["use std::collections::HashMap;", "use std::sync::{Arc, Mutex};", ""],
        ["pub struct TopicCache {", "    entries: HashMap<u64, CachedTopic>,", "    ttl: Duration,", "    hits: Arc<Mutex<u64>>,", "}", ""],
        ["impl TopicCache {", "    pub fn new(ttl: Duration) -> Self {", "        Self { entries: HashMap::new(), ttl, hits: Arc::new(Mutex::new(0)) }", "    }", "}", ""],
        ["    pub fn get(&self, id: u64) -> Option<CachedTopic> {", "        match self.entries.get(&id) {", "            Some(t) if !t.expired(self.ttl) => Some(t.clone()),", "            _ => None,", "        }", "    }", ""],
        ["    pub async fn refresh(&mut self, id: u64) -> Result<(), FetchError> {", "        let fresh = fetch_topic(id).await?;", "        self.entries.insert(id, fresh.into());", "        *self.hits.lock().unwrap() += 1;", "        Ok(())", "    }", ""],
        ["#[derive(Debug, Clone)]", "pub enum RenderMode {", "    List,", "    Detail { topic_id: u64 },", "    Split { topic_id: u64, panel: PanelKind },", "}", ""],
        ["    fn evict_stale(&mut self) -> usize {", "        let before = self.entries.len();", "        self.entries.retain(|_, v| !v.expired(self.ttl));", "        before - self.entries.len()", "    }", ""],
        ["// 缓存淘汰策略：先按 TTL，再按 LRU 兜底", "// 注意保持与 metrics 上报的一致性", ""],
        ["    pub fn stats(&self) -> CacheStats {", "        CacheStats {", "            size: self.entries.len(),", "            hits: *self.hits.lock().unwrap(),", "            hit_rate: self.hits.lock().unwrap().checked_div(self.entries.len() as u64).unwrap_or(0),", "        }", "    }", ""],
        ["#[cfg(test)]", "mod tests {", "    use super::*;", "", "    #[test]", "    fn stale_entry_is_evicted() {", "        let mut c = TopicCache::new(Duration::from_secs(0));", "        c.entries.insert(1, CachedTopic::default());", "        assert_eq!(c.evict_stale(), 1);", "    }", "}", ""]
      ]
    },
    python: {
      file: "pipeline.py", dir: "workers", icon: "PY", comment: "#",
      kw: ["def","class","return","if","else","elif","for","while","in","import","from","as","with","try","except","finally","raise","lambda","None","True","False","async","await","yield","pass","self","is","not","and","or"],
      blocks: [
        ["import asyncio", "import hashlib", "from dataclasses import dataclass, field", "from typing import Optional", ""],
        ["@dataclass", "class TopicSnapshot:", "    topic_id: int", "    title: str", "    posts: list = field(default_factory=list)", "    fetched_at: float = 0.0", ""],
        ["class Pipeline:", '    """话题抓取流水线：拉取 -> 清洗 -> 落库。"""', "", "    def __init__(self, workers: int = 8):", "        self.workers = workers", "        self.queue: asyncio.Queue = asyncio.Queue(maxsize=1024)", "        self.seen: set[int] = set()", ""],
        ["    async def run(self) -> None:", "        producers = [asyncio.create_task(self.produce(i)) for i in range(2)]", "        consumers = [asyncio.create_task(self.consume(i)) for i in range(self.workers)]", "        await asyncio.gather(*producers, *consumers)", ""],
        ["    async def consume(self, idx: int) -> None:", "        while True:", "            snap = await self.queue.get()", "            try:", "                await self.persist(snap)", "            except Exception as exc:", '                logger.warning("persist failed: %s", exc)', "            finally:", "                self.queue.task_done()", ""],
        ["    def fingerprint(self, snap: TopicSnapshot) -> str:", "        digest = hashlib.sha256(snap.title.encode()).hexdigest()", "        return digest[:16]", ""],
        ["    async def persist(self, snap: TopicSnapshot) -> None:", "        key = self.fingerprint(snap)", "        if key in self.seen:", "            return", "        await store.upsert(key, snap)", "        self.seen.add(key)", ""],
        ["def backoff(attempt: int, base: float = 0.5) -> float:", "    # 指数退避 + 抖动，避免雪崩", "    return base * (2 ** attempt) * (0.5 + random.random())", ""],
        ["async def main() -> None:", "    pipe = Pipeline(workers=16)", "    await pipe.run()", "", 'if __name__ == "__main__":', "    asyncio.run(main())", ""]
      ]
    },
    typescript: {
      file: "app.ts", dir: "web", icon: "TS", comment: "//",
      kw: ["const","let","var","function","return","if","else","for","of","in","while","import","from","export","default","class","extends","interface","type","enum","new","this","async","await","try","catch","finally","throw","switch","case","break","readonly","public","private","void","string","number","boolean","Promise","Map","Set"],
      blocks: [
        ['import { EventEmitter } from "events";', 'import type { Topic, Post } from "./types";', ""],
        ["interface CacheEntry<T> {", "  value: T;", "  expiresAt: number;", "}", ""],
        ["export class TopicStore extends EventEmitter {", "  private cache = new Map<number, CacheEntry<Topic>>();", "  private readonly ttl = 30_000;", "", "  constructor(private readonly client: ApiClient) {", "    super();", "  }", "}", ""],
        ["  async get(id: number): Promise<Topic | null> {", "    const hit = this.cache.get(id);", "    if (hit && hit.expiresAt > Date.now()) return hit.value;", '    const fresh = await this.client.fetchTopic(id);', "    this.cache.set(id, { value: fresh, expiresAt: Date.now() + this.ttl });", '    this.emit("update", fresh);', "    return fresh;", "  }", ""],
        ["  invalidate(id?: number): void {", "    if (id === undefined) this.cache.clear();", "    else this.cache.delete(id);", "  }", ""],
        ["export function renderRow(topic: Topic): string {", '  const unread = topic.unread > 0 ? "●" : "○";', "  return `${unread} ${topic.title} (${topic.postsCount - 1} 回复)`;", "}", ""],
        ["// 状态机：idle -> loading -> ready | error", "type ViewState =", '  | { kind: "idle" }', '  | { kind: "loading" }', '  | { kind: "ready"; posts: Post[] }', '  | { kind: "error"; message: string };', ""],
        ["export function reduce(state: ViewState, ev: ViewEvent): ViewState {", "  switch (ev.type) {", '    case "load": return { kind: "loading" };', '    case "ok":  return { kind: "ready", posts: ev.posts };', '    case "err": return { kind: "error", message: ev.message };', "    default:    return state;", "  }", "}", ""],
        ["const store = new TopicStore(new ApiClient(BASE_URL));", 'store.on("update", (t) => console.log("topic updated", t.id));', ""]
      ]
    },
    go: {
      file: "main.go", dir: "cmd", icon: "GO", comment: "//",
      kw: ["func","package","import","return","if","else","for","range","go","chan","select","case","default","type","struct","interface","map","var","const","defer","nil","err","string","int","bool","error","true","false"],
      blocks: [
        ["package main", "", 'import (', '    "context"', '    "fmt"', '    "sync"', '    "time"', ')', ""],
        ["type TopicCache struct {", "    mu      sync.RWMutex", "    entries map[uint64]CachedTopic", "    ttl     time.Duration", "}", ""],
        ["func NewTopicCache(ttl time.Duration) *TopicCache {", "    return &TopicCache{entries: make(map[uint64]CachedTopic), ttl: ttl}", "}", ""],
        ["func (c *TopicCache) Get(id uint64) (CachedTopic, bool) {", "    c.mu.RLock()", "    defer c.mu.RUnlock()", "    t, ok := c.entries[id]", "    if !ok || t.Expired(c.ttl) {", "        return CachedTopic{}, false", "    }", "    return t, true", "}", ""],
        ["func (c *TopicCache) Refresh(ctx context.Context, id uint64) error {", "    fresh, err := FetchTopic(ctx, id)", "    if err != nil {", '        return fmt.Errorf("refresh topic %d: %w", id, err)', "    }", "    c.mu.Lock()", "    defer c.mu.Unlock()", "    c.entries[id] = fresh", "    return nil", "}", ""],
        ["// 后台定时清理过期条目", "func (c *TopicCache) EvictLoop(ctx context.Context) {", "    tick := time.NewTicker(time.Minute)", "    defer tick.Stop()", "    for {", "        select {", "        case <-ctx.Done():", "            return", "        case <-tick.C:", "            c.evictStale()", "        }", "    }", "}", ""],
        ["func main() {", "    ctx, cancel := context.WithCancel(context.Background())", "    defer cancel()", "    cache := NewTopicCache(30 * time.Second)", "    go cache.EvictLoop(ctx)", '    fmt.Println("listening on :8080")', "}", ""]
      ]
    },
    java: {
      file: "TopicService.java", dir: "src/main/java", icon: "JV", comment: "//",
      kw: ["public","private","protected","class","interface","enum","static","final","void","return","if","else","for","while","new","this","import","package","extends","implements","try","catch","finally","throw","throws","int","long","boolean","String","List","Map","Optional","var"],
      blocks: [
        ["package com.example.topics;", "", "import java.time.Duration;", "import java.util.Map;", "import java.util.Optional;", "import java.util.concurrent.ConcurrentHashMap;", ""],
        ["public class TopicService {", "", "    private final Map<Long, CachedTopic> cache = new ConcurrentHashMap<>();", "    private final Duration ttl;", "    private final TopicClient client;", ""],
        ["    public TopicService(TopicClient client, Duration ttl) {", "        this.client = client;", "        this.ttl = ttl;", "    }", ""],
        ["    public Optional<CachedTopic> get(long id) {", "        CachedTopic hit = cache.get(id);", "        if (hit == null || hit.expired(ttl)) {", "            return Optional.empty();", "        }", "        return Optional.of(hit);", "    }", ""],
        ["    public CachedTopic refresh(long id) throws FetchException {", "        CachedTopic fresh = client.fetchTopic(id);", "        cache.put(id, fresh);", "        return fresh;", "    }", ""],
        ["    // 惰性淘汰：读路径上顺手清理", "    public int evictStale() {", "        int before = cache.size();", "        cache.values().removeIf(t -> t.expired(ttl));", "        return before - cache.size();", "    }", ""],
        ["    public CacheStats stats() {", "        return new CacheStats(cache.size(), hits.get(), misses.get());", "    }", "}", ""]
      ]
    }
  };

  /** 迷你语法高亮（字符串 → 转义 → 关键字/数字/类型 → 注释） */
  function highlightCode(line, L) {
    let s = line, cm = "";
    const ci = s.indexOf(L.comment);
    if (ci >= 0) { cm = s.slice(ci); s = s.slice(0, ci); }
    const slots = [];
    const stash = (m) => { slots.push(m); return "\u0001" + (slots.length - 1) + "\u0002"; };
    s = s.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, (m) => stash('<span class="tk-s">' + escapeHtml(m) + "</span>"));
    s = escapeHtml(s);
    s = s.replace(new RegExp("\\b(" + L.kw.join("|") + ")\\b", "g"), '<span class="tk-k">$1</span>');
    s = s.replace(/\b(\d[\d_]*(?:\.\d+)?)\b/g, '<span class="tk-n">$1</span>');
    s = s.replace(/\b([A-Z][A-Za-z0-9]+)\b/g, '<span class="tk-t">$1</span>');
    s = s.replace(/\u0001(\d+)\u0002/g, (_, i) => slots[+i]);
    if (cm) s += '<span class="tk-c">' + escapeHtml(cm) + "</span>";
    return s;
  }

  /** 按 话题id+语言 稳定生成一长段代码 */
  function genCodeLines(langKey, topicId) {
    const L = CODE_LANGS[langKey];
    const rnd = mulberry32(((topicId || 0) * 2654435761 + langKey.length * 97 + 7) | 0);
    const out = [];
    let guard = 0;
    while (out.length < 160 && guard++ < 60) {
      const block = L.blocks[Math.floor(rnd() * L.blocks.length)];
      out.push(...block);
    }
    return out;
  }

  let codePanelLastSig = "";

  /** 面板随机种子：详情 = 话题 id；列表 = 当前路由对应列表 API 的字符串哈希 */
  function codePanelSeed() {
    if (isTopicPath(location.pathname) && threadState.topicId) return threadState.topicId | 0;
    const s = listApiForPath(location.pathname) || location.pathname || "/";
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  }

  function renderCodePanel() {
    const main = document.querySelector(".codex-main");
    if (!main) return;
    const body = main.querySelector("[data-code-body]");
    if (!body) return;
    const langKey = getCodeLang();
    const mode = getCodeMode();
    const seed = codePanelSeed();
    // 同种子同语言同模式不重复渲染（避免闪烁 / observer 空转）
    const sig = `${langKey}:${mode}:${seed}`;
    if (sig === codePanelLastSig && body.childElementCount) return;
    codePanelLastSig = sig;

    const L = CODE_LANGS[langKey];
    const fileEl = main.querySelector("[data-code-file-name]");
    const crumbFile = main.querySelector("[data-code-crumb-file]");
    const crumbDir = main.querySelector("[data-code-crumb-dir]");
    const crumbCat = main.querySelector("[data-code-crumb-cat]");
    const iconEl = main.querySelector(".cx-code-tab .cx-rs-ic");
    if (fileEl) fileEl.textContent = L.file;
    if (crumbFile) crumbFile.textContent = L.file;
    if (crumbDir) crumbDir.textContent = L.dir;
    if (iconEl) iconEl.textContent = L.icon;
    // 假路径：详情 = linux-do › <分类 slug 或话题 slug> › …；列表 = linux-do › <列表标题> › …
    if (crumbCat) {
      if (isTopicPath(location.pathname)) {
        const cat = threadState.categoryId ? categoryById(threadState.categoryId) : null;
        crumbCat.textContent = (cat && cat.slug) || threadState.slug || "topics";
      } else {
        crumbCat.textContent = listTitleForPath(location.pathname);
      }
    }
    const openLabel = main.querySelector("[data-open-lang-label]");
    if (openLabel) openLabel.textContent = CODE_LANG_NAMES[langKey] || langKey;
    main.querySelectorAll("[data-code-view-toggle] span").forEach((x) =>
      x.classList.toggle("cx-on", x.dataset.v === mode)
    );

    const lines = genCodeLines(langKey, seed);
    if (mode === "code") {
      body.innerHTML = lines.map((ln, i) =>
        '<div class="cx-cline"><span class="cx-ln">' + (i + 1) + '</span><span class="cx-lc">' + highlightCode(ln, L) + "</span></div>"
      ).join("");
      return;
    }
    // diff 模式：同一批代码切片，随机 +/−/上下文
    const rnd = mulberry32((seed * 97 + langKey.length * 13 + 13) | 0);
    const rows = [
      ["meta", "diff --git a/" + L.dir + "/" + L.file + " b/" + L.dir + "/" + L.file],
      ["meta", "index 8f3a2c1..e9d47b5 100644"],
      ["meta", "--- a/" + L.dir + "/" + L.file],
      ["meta", "+++ b/" + L.dir + "/" + L.file]
    ];
    let i = 0, guard = 0;
    while (i < lines.length - 12 && guard++ < 40) {
      const start = i + 1;
      const chunk = 6 + Math.floor(rnd() * 10);
      rows.push(["hunk", "@@ -" + start + "," + chunk + " +" + start + "," + (chunk + 2) + " @@"]);
      for (let k = 0; k < chunk && i < lines.length; k++, i++) {
        const r = rnd();
        const kind = r < 0.25 ? "del" : r < 0.5 ? "add" : "";
        const sign = kind === "del" ? "-" : kind === "add" ? "+" : " ";
        rows.push([kind, sign + " " + lines[i]]);
      }
      i += 2; // hunk 间隔
    }
    body.innerHTML = rows.map(([kind, ln], n) => {
      const isHead = kind === "meta" || kind === "hunk";
      const num = isHead ? "" : String(n);
      const sign = ln.startsWith("+") ? "+ " : ln.startsWith("-") ? "- " : "  ";
      const content = isHead ? escapeHtml(ln) : sign + highlightCode(ln.slice(2), L);
      const cls = kind ? " cx-" + kind : "";
      return '<div class="cx-cline' + cls + '"><span class="cx-ln">' + num + '</span><span class="cx-lc">' + content + "</span></div>";
    }).join("");
  }

  /* ============================== 详情视图（帖子 = agent thread） ============================== */

  const threadState = {
    topicId: null,
    loading: false,
    stream: [],            // 全部 post id 顺序
    renderedFirstIdx: 0,   // stream 中已渲染的起始下标
    renderedLastIdx: -1,   // stream 中已渲染的结束下标
    hasOlder: false,
    hasNewer: false,
    title: "",
    slug: "",
    categoryId: null,
    postsCount: 0,
    views: 0,
    postsByNum: {}         // post_number -> post（投票组件 / 引用跳转用）
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

  /** 楼层底部小操作行：回复 / 点赞 / 复制链接 */
  function turnActionsHtml(post) {
    const liked = postLiked(post);
    const count = postLikeCount(post);
    return `
      <div class="cx-turn-actions${liked ? " cx-has-liked" : ""}">
        <button class="cx-act" data-action="reply" data-post-number="${post.post_number}">${ICONS.reply}回复</button>
        <button class="cx-act${liked ? " cx-liked" : ""}" data-action="like" data-post-id="${post.id || ""}">${ICONS.like}<span class="cx-like-label">${liked ? "已赞" : "赞"}${count ? ` ${count}` : ""}</span></button>
        <button class="cx-act${post.bookmarked ? " bookmarked" : ""}" data-action="bookmark" data-post-id="${post.id || ""}">${post.bookmarked ? ICONS.bookmarkFill : ICONS.bookmark}<span>${post.bookmarked ? "已收藏" : "收藏"}</span></button>
        <button class="cx-act" data-action="link" data-post-number="${post.post_number}">${ICONS.link}复制链接</button>
      </div>`;
  }

  /** 楼层元信息行的装饰小图标：按话题+楼层播种，稳定随机 */
  const FLOOR_ICONS = ["check", "branch", "terminal", "file", "globe", "clock"];
  function floorIcon(post) {
    const rnd = mulberry32(((post.id || post.post_number || 1) * 2246822519 ^ (threadState.topicId || 0)) >>> 0);
    return ICONS[FLOOR_ICONS[Math.floor(rnd() * FLOOR_ICONS.length)]] || ICONS.check;
  }

  /** 楼内随机穿插的「工具调用」淡色行（纯装饰；同楼层刷新不变；英文对齐 Codex app） */
  const RUN_LINES = [
    ["terminal", "Running command", true],
    ["file", "Reading file", false],
    ["search", "Searching codebase", false],
    ["folder", "Listing directory", false],
    ["check", "Applied changes", false],
    ["globe", "Fetched page", false],
    ["branch", "Pushed commits", false],
    [null, "Reconnecting", false]
  ];
  const RUN_CMDS = [
    "cargo build --release", "npm run build", "pytest -q tests/cache",
    "go test ./...", "git diff --stat", "ls src/", "make lint",
    "npm test -- --filter=auth", "cargo test --release", "go vet ./...",
    "docker compose up -d", "kubectl get pods -n prod", "curl -sI https://linux.do"
  ];

  /* 英文思考语料（参考 cli 皮肤 decorationForPost 的素材池） */
  const THINK_OPENERS = [
    "Okay, let me think through this properly.",
    "Alright, reading the post again — the claim hinges on one assumption.",
    "So the question is essentially about trade-offs, not correctness.",
    "Hmm, this is more subtle than it first looks.",
    "The framing is plausible but incomplete — let me reason about why.",
    "Let me unpack what's actually being claimed here before reacting.",
    "Interesting — the symptom and the cause are probably two different things.",
    "Before agreeing, I want to check the failure mode this implies.",
    "First instinct: this is a config issue masquerading as a bug.",
    "Let me separate the diagnosis from the proposed fix.",
    "There's a decent argument on both sides here, which is worth admitting up front.",
    "The subject line promises one thing; the body asks another.",
    "I've seen this pattern before — it usually ends up being permissions.",
    "Reproducing it locally would settle half of this thread instantly.",
    "I'm going to hold off on an opinion until the key numbers are clear."
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
    "If this were reproducible in CI, it would already be closed. That absence is itself a signal.",
    "The right comparison isn't between these two tools, but with the baseline you already trust.",
    "There's a naming collision lurking in there — prod and dev are using different feature flags.",
    "Retry logic usually hides the real fault; the first failure is the honest one.",
    "The throughput story looks good, but the memory graph tells a different one.",
    "I'd rather recommend the boring solution that survives a teammate leaving.",
    "Cache invalidation is the unstated dependency in this whole argument.",
    "The diff is small, but the semantics around the null case changed.",
    "Reaching for an abstraction here just relocates the special cases.",
    "Log noise is suspicious: healthy systems fail quietly, not chatty.",
    "The author is right about the symptom, wrong about the mechanism.",
    "That timing is too uniform to be network jitter — looks scheduled.",
    "Concurrent writers would explain both errors, and a transaction would fix both.",
    "The benchmark lacks a warm-up phase, so the interpreter jit is skewing the first numbers.",
    "Idempotency handles the retry storm better than a tighter timeout ever will.",
    "This passes in tests because tests never exercise the actual cross-origin path.",
    "The dependency was pinned a year ago; the latest release fixed exactly this.",
    "Two callers assume the same global — that's the actual coupling, not the shared file.",
    "I can't confirm the root cause without the request headers.",
    "Better to narrow the scope than to guess at infrastructure.",
    "The proposal optimizes clean-up but leaves the cold-start path untouched.",
    "Feature flags are the part that usually ages the worst in these codebases."
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
    "I'll ask for the reproduction steps before committing to a diagnosis.",
    "Wrapping up with the fix I'd actually ship, not the one that sounds smart.",
    "I'll point at the trade-off and let them decide — it's their system.",
    "Closing with a single question keeps the thread productive.",
    "I'll keep the tone neutral; the claim is fine, the evidence is thin.",
    "That's enough analysis — the practical next step is obvious."
  ];

  /** 英文思考块：head「Worked for Ns」+ 可折叠 body（参考 cli 皮肤 tt-thinking） */
  function buildThinking(rnd) {
    const secs = 2 + Math.floor(rnd() * 46);
    const pick = (pool) => pool[Math.floor(rnd() * pool.length)];
    // 随机 1-3 句：opener 必有，中段 0-1 句，closer 六成概率出现
    const sentences = [pick(THINK_OPENERS)];
    if (rnd() < 0.65) sentences.push(pick(THINK_MIDS));
    if (rnd() < 0.6) sentences.push(pick(THINK_CLOSERS));
    const div = document.createElement("div");
    div.className = "cx-think open";
    div.innerHTML =
      `<div class="cx-think-head"><span class="spin">✻</span><span>Worked for ${secs}s</span><span class="cx-think-chev"></span></div>` +
      `<div class="cx-think-body">${escapeHtml(sentences.join("\n\n"))}</div>`;
    div.querySelector(".cx-think-head").addEventListener("click", () => {
      div.classList.toggle("open");
    });
    return div;
  }

  function sprinkleActivity(holder) {
    if (!holder) return;
    holder.querySelectorAll(".cx-turn-agent > .cx-cooked").forEach((cooked) => {
      const turn = cooked.closest(".cx-turn-agent");
      if (!turn || turn.dataset.sprinkled === "1") return;
      turn.dataset.sprinkled = "1";
      const pid = Number(turn.dataset.postId || 0);
      const no = Number(turn.dataset.postNumber || 0);
      const kids = [...cooked.children];
      if (!kids.length) return;
      const rnd = mulberry32((((pid || no * 7919) + 1) * 2654435761 ^ (threadState.topicId || 0)) >>> 0);
      // 70% 的回复楼都带英文思考块（独立于下方 runline 伪活动；判断须先于该 return 才达覆盖率）
      if (rnd() < 0.70) {
        cooked.prepend(buildThinking(rnd));
      }
      if (rnd() < 0.72) return;             // runline：大多数楼层保持素净，偶见一两条更像真的
      const n = rnd() < 0.22 ? 2 : 1;       // 至多 2 行
      const used = new Set();
      for (let k = 0; k < n; k++) {
        let li = Math.floor(rnd() * RUN_LINES.length);
        if (used.has(li)) li = (li + 1) % RUN_LINES.length;
        used.add(li);
        const [icon, text, withCmd] = RUN_LINES[li];
        const el = document.createElement("div");
        el.className = "cx-runline";
        el.innerHTML =
          (icon ? ICONS[icon] : "") +
          `<span>${text}${icon === null ? ` ${1 + Math.floor(rnd() * 4)}/${2 + Math.floor(rnd() * 4)}` : ""}</span>` +
          (withCmd ? `<code>${escapeHtml(RUN_CMDS[Math.floor(rnd() * RUN_CMDS.length)])}</code>` : "");
        const at = Math.min(kids.length, Math.max(1, Math.floor(rnd() * kids.length + 1)));
        kids[at - 1].insertAdjacentElement("afterend", el);
        kids.splice(at, 0, el);
      }
          });
  }

  /** 楼主帖 = 右上 user 气泡 + dim 元信息 */
  function opTurnHtml(post) {
    return `
      <div class="cx-turn-user" data-post-number="${post.post_number}">
        <div class="cx-turn-user-bubble">${post.cooked || ""}</div>
      </div>
      <div class="cx-turn-meta">
        <span class="cx-status-dot cx-done"></span>
        楼主 · ${escapeHtml(post.name || post.username)} · ${escapeHtml(formatTime(post.created_at))} · 阅读 ${threadState.views || "–"}
        ${turnActionsHtml(post)}
      </div>`;
  }

  /** 回帖 = 全宽 agent turn + worked 状态行（操作按钮同行右端，hover 显现） */
  function agentTurnHtml(post) {
    return `
      <div class="cx-turn-agent" data-post-number="${post.post_number}"${post.id ? ` data-post-id="${post.id}"` : ""}>
        <div class="cx-cooked">${post.cooked || ""}</div>
      </div>
      <div class="cx-worked">
        ${floorIcon(post)}
        ${post.post_number} 楼 · ${escapeHtml(post.name || post.username)} · ${escapeHtml(formatTime(post.created_at))}
        ${turnActionsHtml(post)}
      </div>`;
  }

  function turnsHtml(posts) {
    return posts.map((p) => (p.post_number === 1 ? opTurnHtml(p) : agentTurnHtml(p))).join("");
  }

  /** 渲染 + 装饰一组楼层，插入容器（where: "replace" | "prepend" | "append"） */
  function renderTurns(container, posts, where) {
    const holder = document.createElement("div");
    holder.innerHTML = turnsHtml(posts);
    decorateCooked(holder);
    sprinkleActivity(holder);
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
    return document.querySelector(".cx-thread-posts");
  }

  /** 底部/顶部分割线（照 mockup：以上为 N 条回复中的最近 M 条） */
  function syncThreadDivider() {
    const box = detailContainer();
    if (!box) return;
    box.querySelector(".cx-turn-divider")?.remove();
    const total = Math.max(0, (threadState.postsCount || 0) - 1);
    const loaded = threadState.renderedLastIdx - threadState.renderedFirstIdx + 1;
    if (threadState.hasOlder && total > 0) {
      box.insertAdjacentHTML(
        "beforeend",
        `<div class="cx-turn-divider">以上为 ${total} 条回复中的最近 ${Math.max(0, loaded - 1)} 条 · 向上滚动加载更早</div>`
      );
    }
  }

  async function loadTopic(topicId) {
    if (!topicId || threadState.loading) return;
    if (threadState.topicId === topicId) {
      syncChrome();
      return;
    }
    threadState.loading = true;
    threadState.topicId = topicId;
    threadState.postsByNum = {};
    clearQuoteJumpHistory();
    ensureMain();
    showView("detail");
    const box = detailContainer();
    if (box) box.innerHTML = `<div class="cx-list-status">加载中…</div>`;
    syncChrome();
    try {
      const data = await api(`/t/${topicId}.json`);
      if (threadState.topicId !== topicId) return; // 路由已切走
      const posts = (data.post_stream && data.post_stream.posts) || [];
      threadState.stream = (data.post_stream && data.post_stream.stream) || posts.map((p) => p.id);
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
      threadState.categoryId = data.category_id || null;
      threadState.postsCount = data.posts_count || posts.length;
      threadState.views = data.views || 0;
      document.title = `${threadState.title} - Linux DO`;

      for (const p of posts) {
        if (p.post_number) threadState.postsByNum[p.post_number] = p;
        if (p.id && postLiked(p)) likedPosts.add(p.id);
      }

      if (box) {
        renderTurns(box, posts, "replace");
        syncThreadDivider();
        // 楼主在顶部，从头开始读
        const scroller = document.querySelector(".cx-view-detail");
        if (scroller) scroller.scrollTop = 0;
      }
      syncChrome();
      // 话题 id 是代码面板的随机种子：换帖重排一份代码
      renderCodePanel();
      // 分类名异步到位后刷新面包屑与面板假路径
      if (!categoriesCache && threadState.categoryId) {
        loadCategories().then(() => { syncChrome(); codePanelLastSig = ""; renderCodePanel(); });
      }
    } catch (err) {
      if (box) {
        box.innerHTML = `
          <div class="cx-list-status">
            话题加载失败（${escapeHtml(err && err.message || "未知错误")}），可能无权限或已被删除
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

  /** 向上滚动加载更早的楼层 */
  async function loadOlderPosts() {
    if (!threadState.hasOlder || threadState.loading || !threadState.topicId) return;
    const ids = threadState.stream.slice(Math.max(0, threadState.renderedFirstIdx - 20), threadState.renderedFirstIdx);
    if (!ids.length) return;
    threadState.loading = true;
    const scroller = document.querySelector(".cx-view-detail");
    try {
      const qs = ids.map((id) => `post_ids[]=${id}`).join("&");
      const data = await api(`/t/${threadState.topicId}/posts.json?${qs}`);
      const posts = sortPostsByStream(
        (data.post_stream && data.post_stream.posts) || data.posts || [],
        ids
      );
      threadState.renderedFirstIdx = Math.max(0, threadState.renderedFirstIdx - ids.length);
      threadState.hasOlder = threadState.renderedFirstIdx > 0;
      for (const p of posts) { if (p.post_number) threadState.postsByNum[p.post_number] = p; }
      const box = detailContainer();
      if (box && posts.length) {
        const prevHeight = scroller ? scroller.scrollHeight : 0;
        // 旧楼层插到最前（楼主若在其中会自然成为 user 气泡）
        const holder = document.createElement("div");
        holder.innerHTML = turnsHtml(posts);
        decorateCooked(holder);
        sprinkleActivity(holder);
        box.prepend(...holder.childNodes);
        if (scroller) scroller.scrollTop += scroller.scrollHeight - prevHeight;
      }
      syncThreadDivider();
    } catch { /* 保留现状 */ } finally {
      threadState.loading = false;
    }
  }

  /** 向下滚动加载更新的楼层（长帖不能只留首屏一页） */
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
      for (const p of posts) { if (p.post_number) threadState.postsByNum[p.post_number] = p; }
      const box = detailContainer();
      if (box && posts.length) {
        box.querySelector(".cx-turn-divider")?.remove();
        const holder = document.createElement("div");
        holder.innerHTML = turnsHtml(posts);
        decorateCooked(holder);
        sprinkleActivity(holder);
        box.append(...holder.childNodes);
      }
      syncThreadDivider();
    } catch { /* 保留现状 */ } finally {
      threadState.loading = false;
    }
  }

  /* ============================== 点赞（CSRF 调原生 /post_actions） ============================== */

  async function toggleLike(postId, btn) {
    if (!postId) return;
    const wasLiked = likedPosts.has(postId);
    // 乐观更新，失败回滚
    const paint = (liked) => {
      btn.classList.toggle("cx-liked", liked);
      btn.closest(".cx-turn-actions")?.classList.toggle("cx-has-liked", liked);
      const label = btn.querySelector(".cx-like-label");
      if (label) {
        const n = (label.textContent.match(/\d+/) || [""])[0];
        label.textContent = `${liked ? "已赞" : "赞"}${n ? ` ${n}` : ""}`;
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

  /* ============================== 编排与 SPA ============================== */

  /** 跟随 linux.do 明暗配色：dark-scheme / light-scheme class，缺省按 body 底色亮度兜底；用户可手动覆盖 */
  const THEME_OVERRIDE_KEY = "linuxdo-codex-mode"; // "light" | "dark" | 未设置 = 跟随站点

  function themeOverride() {
    try {
      const v = localStorage.getItem(THEME_OVERRIDE_KEY);
      if (v === "light" || v === "dark") return v;
    } catch { /* ignore */ }
    return null;
  }

  function isDarkMode() {
    const want = themeOverride();
    if (want) return want === "dark";
    const cl = document.documentElement.classList;
    if (cl.contains("light-scheme")) return false;
    if (cl.contains("dark-scheme")) return true;
    try {
      const bg = getComputedStyle(document.body || document.documentElement).backgroundColor;
      const m = bg.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\)/);
      if (!m) return true;
      const alpha = m[4] === undefined ? 1 : parseFloat(m[4]);
      if (alpha < 0.5) return true; // 半透明判不出来时维持深色
      const lum = 0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3];
      return lum < 128;
    } catch {
      return true;
    }
  }

  function syncCxMode() {
    document.documentElement.classList.toggle("codex-light", !isDarkMode());
  }

  /** 左下角明暗切换按钮：深色显示太阳（点击转亮），浅色显示月亮 */
  function syncModeBtn() {
    const btn = document.querySelector(".codex-rail [data-mode-toggle]");
    if (!btn) return;
    const dark = isDarkMode();
    btn.innerHTML = dark ? ICONS.sun : ICONS.moon;
    btn.title = dark ? "切换到光明模式" : "切换到黑暗模式";
  }

  function removeApp() {
    closeNotifMenu();
    document.querySelector(".codex-main")?.remove();
    document.querySelector(".codex-rail")?.remove();
  }

  /** 低频率轮询 CF 盾状态：命中回退原皮，通过恢复套皮（与 applyTheme 的即时判断互补） */
  function startCfWatcher() {
    if (window.__codexCfWatch) return;
    window.__codexCfWatch = setInterval(() => {
      const blocked = cfBlocked();
      const active = document.documentElement.classList.contains(ROOT_CLASS);
      if (blocked && active) {
        document.documentElement.classList.remove(ROOT_CLASS, LOCK_CLASS, "codex-topic-open", "codex-rail-open");
        removeApp();
      } else if (!blocked && !active && !otherThemeActive()) {
        applyTheme();
      }
    }, 1500);
  }

  function applyTheme() {
    if (cfBlocked()) {
      // 整页被 CF 挑战拦截：停用回原皮（不注入 UI），挑战通过后 watcher 复检自动恢复
      document.documentElement.classList.remove(ROOT_CLASS, LOCK_CLASS, "codex-topic-open", "codex-rail-open");
      removeApp();
      return;
    }
    if (otherThemeActive()) {
      // 飞书 / IDEA 主题在跑：全程避让，恢复原样
      document.documentElement.classList.remove(ROOT_CLASS, LOCK_CLASS, "codex-topic-open", "codex-rail-open");
      removeApp();
      return;
    }

    injectStyle();
    syncCxMode();
    document.documentElement.classList.add(ROOT_CLASS);
    makeFavicon();
    applySplash();
    if (!document.body) return;

    const pathname = location.pathname;
    const isTopic = isTopicPath(pathname);
    const isHome = isHomePath(pathname);
    const supported = isTopic || isHome;

    document.documentElement.classList.toggle(LOCK_CLASS, supported);
    document.documentElement.classList.toggle("codex-topic-open", isTopic);

    ensureRail();
    bindRailClicks();

    if (!supported) {
      // 非列表/帖子路由（设置、消息、搜索等）：rail 常驻，主区交还原生页面
      document.querySelector(".codex-main")?.remove();
      renderRailDynamic();
      return;
    }

    ensureMain();
    bindRailClicks();

    if (isTopic) {
      showView("detail");
      // 进帖子：保留当前列表，仅详情区加载（列表为空则后台补一份 latest 供 rail 分组用）
      if (listState.topics.length && listState.apiPath) {
        renderListRows();
      } else {
        loadList(listState.apiPath || "/latest.json", false);
      }
      loadTopic(topicIdFromPath(pathname));
    } else {
      showView("list");
      // 路由换了列表类型 → 重置缓存键强制重拉
      const apiPath = listApiForPath(pathname);
      if (listState.apiPath && listState.apiPath !== apiPath && listState.path !== pathname) {
        listState.topics = [];
      }
      loadList(apiPath, false);
    }
    syncChrome();
    syncRail();
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

  function bootstrap() {
    if (!document.documentElement) {
      setTimeout(bootstrap, 0);
      return;
    }
    startCfWatcher(); // 无论当前是否被 CF 拦截，都先挂上恢复/回退轮询
    injectStyle();
    if (!otherThemeActive()) {
      syncCxMode();
      document.documentElement.classList.add(ROOT_CLASS);
      makeFavicon(); // document-start 尽早换标，减少未聚焦标签仍显示原 icon
    }
    restoreColumnWidths(); // 恢复用户拖出的三栏宽度

    // 标签重新可见时再刷一次（部分浏览器未聚焦时会缓存旧 favicon）
    if (!window.__codexFaviconVisibilityBound) {
      window.__codexFaviconVisibilityBound = true;
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && !otherThemeActive()) {
          makeFavicon();
        }
      });
    }

    const CODEX_UI_SEL =
      ".codex-rail, .codex-main, #linuxdo-codex-theme, .codex-user-menu-float, " +
      "#reply-control, .codex-unlock-header, #codex-unlock-header, #codex-temp-reply-click, #codex-unlock-for-reply";
    let cleanupDone = false;
    const observer = new MutationObserver((mutations) => {
      // 其它主题脚本激活 → 立刻避让（持续观察 html class / style 节点）
      if (otherThemeActive()) {
        if (!cleanupDone) {
          cleanupDone = true;
          scheduleApply();
          setTimeout(() => { cleanupDone = false; }, 300);
        }
        return;
      }
      // 忽略我们自己 UI 内部的 DOM 变动，否则渲染会触发 applyTheme 死循环；
      // class 属性变动只关心 <html> 本身（互斥标记 / 抽屉开关），子树里的 class 翻转不触发
      const external = mutations.some((m) => {
        const t = m.target;
        if (!(t instanceof Element) && !(t instanceof CharacterData)) return true;
        const el = t instanceof Element ? t : t.parentElement;
        if (!el) return true;
        if (m.type === "attributes" && el !== document.documentElement) return false;
        if (el.closest(CODEX_UI_SEL)) return false;
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

    // 定时同步铃铛蓝点 / 用户名（currentUser 未读数会变）
    if (!window.__codexNotifBadgeTimer) {
      window.__codexNotifBadgeTimer = setInterval(() => {
        if (otherThemeActive()) return;
        if (!document.querySelector(".codex-rail")) return;
        syncRail();
      }, 15000);
    }

    // 点击原生回复面板以外区域自动收起
    bindOutsideCloseComposer();

    // 阅读进度上报（自渲染流按可见楼层累计，刷新未读计数）
    startReadTracking();

    // ⌘/Ctrl+K → 原生搜索
    window.addEventListener("keydown", (e) => {      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      if ((e.key || "").toLowerCase() !== "k") return;
      if (otherThemeActive()) return;
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      e.preventDefault();
      e.stopPropagation();
      openNativeSearch();
    }, true);

    scheduleApply();
  }

  bootstrap();
})();
