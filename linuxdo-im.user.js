// ==UserScript==
// @name         Linux DO · IM 外观（钉钉 / 飞书 / 企业微信）
// @namespace    https://linux.do/
// @author       czm15053
// @version      1.0.0
// @description  一套脚本三种 IM 皮肤：钉钉 / 飞书 / 企业微信，列表按钮一键切换。公共内核：投票、小火箭、图片灯箱、引用跳转、实时刷新、三态深色、伪装模式。
// @match        https://linux.do/*
// @noframes     资料页等原生页走 iframe 嵌入，脚本只在顶层 frame 运行
// @icon         https://linux.do/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
  "use strict";
  var _a, _b;
  const SKIN_KEY = "linuxdo-im-skin";
  const SKINS = {
    dingtalk: {
      label: "钉钉",
      orgName: "linux.do",
      railWidth: 56,
      nav2Width: 240,
      stripWidth: 48,
      listWidth: 300,
      titlebarHeight: 40,
      railMin: 64,
      railMax: 200,
      listMin: 200,
      listMax: 420,
      favicon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAHCElEQVRIDZVWW4xeVRVe+3b+29xiL9PpQDvY4SIgODGNpUGKF4i2JdX4QALy1CBPxBhf8EEfmog8kOCDMeFBaUCMD8SUag0iFo0GhWIcbMfWKTLMtLWdybTO5L+esy/Lb5/zzz9TymhcOdnZZ1/W9VtrL8HMzWZTa+2cM8ZgJCIllfPx11prtDKSKHiB3SzTRhMz+UBKt1OntPY+MDGuWG8Tk1hnpZAkcCOUy2VRr9eVUhAjpQwhCCEgABP8asFGi0sNf+oyTy6EmYZYaLEUYkOJPjrId2wUn9isN5XJs7AhXoGMwPFiwQesIEN0Oh3vfbHa21OCtAiTi/zjKffL92m2LslHwWuISfL2Adq3jQ9+XE9skhZiHLQU0LXQEhOoHi2AfwqVC8llJS41/ffets9NiUYmSRHs/XAKMJZrpXDwNvnEJ9VIn25mDlr2DkeGXQuEhHWQXNH0xkX3td+6qUVDGqx5ffYrfHDE0e2b3bN75O7rklbW9XPhdoEIQ2a0i0RJ06uz/uFfu8sdFRX/v8jzhkp4/j7aO1Zq2VUZUQAUhxIlJU7Muwd+ERZTBRQwe/KSENNVi/+HQA68sRxe3ku7tphOiH6NRhQQ0lIstN2jx91iKgWw4MPjd9Kh3QijZQfnAZhMApcwrvsJRYsd+djveaHtNWCaQ1EC6XCREeHpv4ZTV4zADg6S3Nqvv31X34mHaj/8vNw5jOSAVAnoEHC8/ofrpxb103+jBOBQCvgUaZpScNPLfPcRWrYxC8AgeDqwwx/ZXysinAV/fM4ePu1emePlloKU6Lro1w8jpj7t3/iyvGlIsFDRAqPl4TNhOY2qAcMINyL8h4v8r0bMalAi1RfGyj/7Yu3tB8tPfpomhr0SMAiQL85fPUpRz9RzZ5xRIlrQabeaNtx1VEwvawEf5LEBU3b0+B3+yV2mLzG5lNUh8/7EvD0y44+9H04vKZQJKLQ2VRCxGwf9mweoqoVIO+23FvxnfiUczF5lAgk0UrG7N/POYXnvqL5tQ6mG8FxNTet/dyH7wUn/ynkAb3UXaioOx/f63VuMVOxPXgFSkORXEdJu/5j80edqu4b1P66En083Xj/XOFdPM5S5FaoZtW+scmx/5bFbgTQ4uEtg5YM6vYS6AThpM9eK2msVI9zzEWrPby4IF+ie0TKNgiU3LLes76DoqmRV2xhvdfsGoEvq6Ci4J/JJA71XJySBDNY2sygZ7lr7oSLNNvW33syibpFEn5Gbq2agdBV3bLRd+MlZTrQ00BKIj6MQSnSCCh4WKAXJcGHu4Z4B0Zg+LV94Vyxl6Z4RlGixscLDFRqtyaGSgUK51Di8OJ1OLuqy7t3FGvhzBDOYM4cBw0YoXCoglB/EAGJA7eis2rnJ7tmqP1LWg0aWYOYa7kja758UZahfgDbei8pZQUMlFAABATQ+IBJF4JUzLcaeOqJK6uxy+PqQBiDyA1FwziVOnnknO9dMqqi7Bb4hOzIQCfP4gCxcpD82aPs1+Tw42MxpVVhZ0UszZr6dPTEhxwf136/49+r+qzdCafHnS+kL0zSYoFbFDFqRGuXDKzf3u+iXRr2Oivel19TUUv72FvyvGVNPFeWHSnShIfdtd4c/W8aRc/VssUNHZ9yzZ0p6peiCuwvi1iH38n0Oj4zWxiTk917nTy3hAb6G8cqCxlNPciklLfneUZxDJabr+xMbsqOzBsjJQd49bZke2OarMmQAFNoIPKdfuYG3ViBYxHxb58MWntiKES++Kx96zV1sOWTyN/7E86kxCo1EvIgzYDJ",
      avatarColors: [
        "#1A87FF",
        "#2F88FF",
        "#F3A23A",
        "#8B6CFF",
        "#00C56C",
        "#FF9F0A",
        "#5B4BFF",
        "#EF4444"
      ]
    },
    feishu: {
      label: "飞书",
      orgName: "linux.do",
      railWidth: 230,
      nav2Width: 240,
      stripWidth: 48,
      listWidth: 360,
      titlebarHeight: 40,
      railMin: 180,
      railMax: 480,
      listMin: 280,
      listMax: 640,
      favicon: "data:image/x-icon;base64,AAABAAEAMDAAAAEAIACoJQAAFgAAACgAAAAwAAAAYAAAAAEAIAAAAAAAACQAABMLAAATCwAAAAAAAAAAAAD///8A////AP///wf///8U////W////4f///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+G////T////yL///8J////AP///wD///8B////D////2n////R////9P////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////9f///+D///92////EP///wH///8N////hv////L////9//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7////z////hv///wr///9T////8f//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8P///zj///+s////+v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+v///6v////x/////v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v////H///////////////////////////////////////////////////////////////////////////////////////39///7+f//+vj///v5///9/P///f3////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9/P//9/P//+/p///s5P//",
      avatarColors: [
        "#3370FF",
        "#14B8A6",
        "#FF6F39",
        "#7B61FF",
        "#22C55E",
        "#00B4D8",
        "#F59E0B",
        "#EF4444"
      ]
    },
    wecom: {
      label: "企业微信",
      orgName: "企业微信",
      railWidth: 162,
      nav2Width: 240,
      stripWidth: 0,
      listWidth: 304,
      titlebarHeight: 0,
      railMin: 100,
      railMax: 260,
      listMin: 240,
      listMax: 480,
      favicon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iOCIgeTE9IjQiIHgyPSI1NiIgeTI9IjYwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzQwOTZmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzE3NjlkMiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgcng9IjE1IiBmaWxsPSJ1cmwoI2EpIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTExIDI3LjVDMTEgMTguOTQgMTguODQgMTIgMjguNSAxMlM0NiAxOC45NCA0NiAyNy41IDM4LjE2IDQzIDI4LjUgNDNjLTIuMTMgMC00LjE3LS4zNC02LjA2LS45NUwxNCA0N2wyLjQ4LTcuMTZDMTMuMSAzNi45MSAxMSAzMi41NSAxMSAyNy41WiIvPjxwYXRoIGZpbGw9IiMxOWM4NzgiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyLjUiIGQ9Ik0zNCAzNy41QzM0IDMwLjYgNDAuMjcgMjUgNDggMjVzMTQgNS42IDE0IDEyLjVTNTUuNzMgNTAgNDggNTBjLTEuNTUgMC0zLjA0LS4yMy00LjQzLS42NUwzNyA1M2wxLjg0LTUuMjNDMzUuODcgNDUuMzkgMzQgNDEuNzMgMzQgMzcuNVoiLz48Y2lyY2xlIGN4PSIyMyIgY3k9IjI3IiByPSIyIiBmaWxsPSIjMjY3ZWYwIi8+PGNpcmNsZSBjeD0iMzMiIGN5PSIyNyIgcj0iMiIgZmlsbD0iIzI2N2VmMCIvPjxjaXJjbGUgY3g9IjQ0IiBjeT0iMzcuNSIgcj0iMS43IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iNTIiIGN5PSIzNy41IiByPSIxLjciIGZpbGw9IiNmZmYiLz48L3N2Zz4=",
      avatarColors: [
        "#1A87FF",
        "#2F88FF",
        "#F3A23A",
        "#8B6CFF",
        "#00C56C",
        "#FF9F0A",
        "#5B4BFF",
        "#EF4444"
      ]
    }
  };
  function migratePrefs() {
    try {
      if (localStorage.getItem(SKIN_KEY)) return;
      let skin = null;
      if (localStorage.getItem("linuxdo-dingtalk-view") || localStorage.getItem("linuxdo-dingtalk-color-theme") || localStorage.getItem("linuxdo-dingtalk-org-name")) skin = "dingtalk";
      else if (localStorage.getItem("linuxdo-feishu-view") || localStorage.getItem("linuxdo-feishu-dark")) skin = "feishu";
      skin = skin || "dingtalk";
      const copy = (from, to, map) => {
        const v = localStorage.getItem(from);
        if (v == null) return;
        localStorage.setItem(to, map ? map(v) : v);
      };
      copy("linuxdo-dingtalk-view", "linuxdo-im-view");
      copy("linuxdo-feishu-view", "linuxdo-im-view");
      copy("linuxdo-dingtalk-color-theme", "linuxdo-im-color-theme");
      copy("linuxdo-feishu-dark", "linuxdo-im-color-theme", (v) => v === "1" ? "dark" : "light");
      copy("linuxdo-dingtalk-last-read", "linuxdo-im-last-read");
      copy("linuxdo-feishu-last-read", "linuxdo-im-last-read");
      copy("linuxdo-dingtalk-mask-avatar", "linuxdo-im-mask-avatar");
      copy("linuxdo-feishu-mask-avatar", "linuxdo-im-mask-avatar");
      copy("linuxdo-dingtalk-mask-title", "linuxdo-im-mask-title");
      copy("linuxdo-dingtalk-hide-cat-tags", "linuxdo-im-hide-cat-tags");
      copy("linuxdo-dingtalk-nav2", "linuxdo-im-nav2");
      copy("linuxdo-feishu-nav2", "linuxdo-im-nav2");
      copy("linuxdo-dingtalk-list-nav", "linuxdo-im-list-nav");
      copy("linuxdo-feishu-list-nav", "linuxdo-im-list-nav");
      copy("linuxdo-dingtalk-rail-width", "linuxdo-im-rail-width");
      copy("linuxdo-feishu-nav-w", "linuxdo-im-rail-width");
      copy("linuxdo-dingtalk-list-width", "linuxdo-im-list-width");
      copy("linuxdo-feishu-list-w", "linuxdo-im-list-width");
      copy("linuxdo-dingtalk-org-name", "linuxdo-im-org-name");
      copy("linuxdo-dingtalk-org-icon", "linuxdo-im-org-icon");
      localStorage.setItem(SKIN_KEY, skin);
    } catch {
    }
  }
  function currentSkinId() {
    try {
      const v = localStorage.getItem(SKIN_KEY);
      if (v && SKINS[v]) return v;
    } catch {
    }
    return "dingtalk";
  }
  const SKIN_ID = currentSkinId();
  let RAIL_WIDTH = SKINS[SKIN_ID].railWidth;
  let NAV2_WIDTH = SKINS[SKIN_ID].nav2Width;
  let STRIP_WIDTH = SKINS[SKIN_ID].stripWidth;
  let LIST_WIDTH = SKINS[SKIN_ID].listWidth;
  let TITLEBAR_HEIGHT = SKINS[SKIN_ID].titlebarHeight;
  let RAIL_W_MIN = SKINS[SKIN_ID].railMin;
  let RAIL_W_MAX = SKINS[SKIN_ID].railMax;
  const RAIL_W_COMPACT = 80;
  let LIST_W_MIN = SKINS[SKIN_ID].listMin;
  let LIST_W_MAX = SKINS[SKIN_ID].listMax;
  const FAVICON_URI = SKINS[SKIN_ID].favicon;
  let AVATAR_COLORS = SKINS[SKIN_ID].avatarColors;
  function defaultOrgName() {
    return SKINS[SKIN_ID].orgName || "linux.do";
  }
  let RAIL_DECO_ITEMS = SKIN_ID === "feishu" ? [
    { key: "calendar", icon: "calendar", label: "日历" },
    { key: "worktable", icon: "worktable", label: "工作台" },
    { key: "cloud", icon: "cloud", label: "云文档" },
    { key: "wiki", icon: "wiki", label: "知识库" },
    { key: "task", icon: "task", label: "任务" },
    { key: "contacts", icon: "contacts", label: "联系人" },
    { key: "project", icon: "project", label: "项目" },
    { key: "more", icon: "more", label: "更多" }
  ] : SKIN_ID === "wecom" ? [
    // 官方企业微信文案（与实机对齐）；下半区六项按实机截图
    { key: "smartdoc", icon: "file", label: "智能文档", dot: true },
    { key: "summary", icon: "spark", label: "智能总结" },
    { key: "work", icon: "work", label: "工作台" },
    { key: "book", icon: "book", label: "通讯录" },
    { key: "disk", icon: "disk", label: "微盘" },
    { key: "advanced", icon: "apps", label: "高级功能" }
  ] : [
    { key: "doc", icon: "doc", label: "文档" },
    { key: "aitable", icon: "aitable", label: "AI表格" },
    { key: "aimic", icon: "aimic", label: "AI听记" },
    { key: "work", icon: "work", label: "工作台" },
    { key: "book", icon: "book", label: "通讯录" },
    { key: "meet", icon: "meet", label: "会议" },
    { key: "cal", icon: "cal", label: "日历" },
    { key: "todo", icon: "todo", label: "待办" },
    { key: "add", icon: "plus", label: "添加" }
  ];
  function otherThemeActive() {
    return !!document.getElementById("linuxdo-dingtalk-theme") || !!document.getElementById("linuxdo-feishu-theme") || document.documentElement.classList.contains("dingtalk-im-theme") || document.documentElement.classList.contains("feishu-im-theme");
  }
  const STYLE_ID = "linuxdo-im-theme";
  const FAVICON_ID = "im-favicon";
  const ROOT_CLASS$1 = "im-theme";
  const DARK_CLASS = "im-dark";
  const LOCK_CLASS = "im-locked";
  const VIEW_KEY = "linuxdo-im-view";
  const COLOR_THEME_KEY = "linuxdo-im-color-theme";
  const LAST_READ_KEY = "linuxdo-im-last-read";
  const LAST_READ_MAX_TOPICS = 200;
  const COMPOSE_PREVIEW_KEY = "linuxdo-im-compose-preview";
  const MASK_AVATAR_KEY = "linuxdo-im-mask-avatar";
  const MASK_TITLE_KEY = "linuxdo-im-mask-title";
  const HIDE_CAT_TAGS_KEY = "linuxdo-im-hide-cat-tags";
  const NAV2_KEY = "linuxdo-im-nav2";
  const ORG_NAME_KEY = "linuxdo-im-org-name";
  const ORG_ICON_KEY = "linuxdo-im-org-icon";
  const RAIL_W_KEY = "linuxdo-im-rail-width";
  const RAIL_COLLAPSE_KEY = "linuxdo-im-rail-collapse";
  const LIST_W_KEY = "linuxdo-im-list-width";
  const LIST_NAV_KEY = "linuxdo-im-list-nav";
  const CSS_DD = String.raw`
    /* ---------- Token ---------- */
    .__ROOT_CLASS__ {
      color-scheme: light !important;
      --im-blue: #1A87FF;
      --im-blue-hover: #0A6FE0;
      --im-blue-soft: #E8F3FF;
      --im-blue-chip: #D6EBFF;
      --im-title: #1A87FF;
      --im-accent: #1A87FF;
      --im-accent-soft: #E8F3FF;
      --im-nav2-bg: #FFFFFF;
      --im-nav2-border: #E6E8EB;
      --im-text: #1A1D24;
      --im-text-2: #4A4F5C;
      --im-text-3: #8A8F99;
      --im-text-4: #B0B4BE;
      --im-bg: #FFFFFF;
      --im-chat-bg: #F5F7FB;
      --im-hover: #ECF0F7;
      --im-active: #E4EAF5;
      --im-bubble-other: #FFFFFF;
      --im-bubble-me: #D4E5FF;
      --im-border: #E6E8EB;
      --im-border-strong: #D5D8DE;
      --im-danger: #FF4D4F;
      --im-rail-bg: #F3F4F6;
      --im-strip-bg: transparent;
      --im-nav: __RAIL_WIDTH__px;
      --im-nav2w: 0px;
      --im-strip: __STRIP_WIDTH__px;
      --im-list: __LIST_WIDTH__px;
      --im-header-h: __TITLEBAR_HEIGHT__px;
      --im-font: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      --radius: 8px;

      --primary: var(--im-text);
      --primary-medium: var(--im-text-2);
      --primary-low: var(--im-text-3);
      --secondary: var(--im-bg);
      --tertiary: var(--im-accent);
      --header_background: #FFFFFF;
      --header_primary: var(--im-text);
      --d-hover: var(--im-hover);
    }

    /* 整站写死光明：覆盖系统/站点暗色偏好 */
    html.__ROOT_CLASS__,
    html.__ROOT_CLASS__ body {
      color-scheme: light !important;
    }

    /* ---------- 字体与基础 ---------- */
    .__ROOT_CLASS__ body { font-family: var(--im-font) !important; }

    /* 站点无全局 border-box：自绘面板统一盒模型，否则 padding 会加宽导致互相堆叠 */
    .im-rail, .im-rail *,
    .im-strip, .im-strip *,
    .im-list-panel, .im-list-panel *,
    .im-chat-panel, .im-chat-panel *,
    .im-mode-fab { box-sizing: border-box; }

    /* ---------- 顶栏视觉隐藏（保留 DOM，供 user-menu 挂载/点击） ---------- */
    .__ROOT_CLASS__ .d-header-wrap,
    .__ROOT_CLASS__ .d-header {
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
    /* 允许脚本对用户按钮做 programmatic click */
    .__ROOT_CLASS__ #current-user,
    .__ROOT_CLASS__ #toggle-current-user,
    .__ROOT_CLASS__ .header-dropdown-toggle.current-user {
      pointer-events: auto !important;
    }
    .__ROOT_CLASS__ #main-outlet-wrapper {
      padding-top: var(--im-header-h) !important;
      margin-left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-strip)) !important;
    }

    /* ---------- 展开栏：原生侧栏原样搬入（内容与文案不变，≡ 滑出） ---------- */
    .__ROOT_CLASS__.im-nav2-open { --im-nav2w: __NAV2_WIDTH__px; }
    html.__ROOT_CLASS__ body .sidebar-wrapper {
      display: block !important;
      position: fixed;
      left: var(--im-nav); top: 0; bottom: 0;
      width: __NAV2_WIDTH__px !important;
      background-color: #FFFFFF !important;
      background-image: none !important;
      backdrop-filter: none !important;
      box-shadow: none !important;
      border-right: 1px solid var(--im-border);
      z-index: 600;
      transform: translateX(-105%);
      visibility: hidden;
      transition: transform 0.18s ease, visibility 0.18s;
      /* 站点可能是深色方案：强制钉钉浅色调色板 */
      --primary: var(--im-text);
      --primary-medium: var(--im-text-2);
      --primary-low: var(--im-text-3);
      --primary-low-mid: #BBBFC4;
      --primary-very-low: #F0F2F5;
      --primary-50: #F5F6F7;
      --primary-100: #EBEDEF;
      --primary-200: #E8E9EB;
      --primary-300: #DEE0E3;
      --secondary: #FFFFFF;
      --tertiary: var(--im-accent);
      --quaternary: var(--im-accent);
      --d-hover: var(--im-hover);
      --d-sidebar-background: #FFFFFF;
      --d-sidebar-border-color: var(--im-border);
      color: var(--im-text);
    }
    /* 可能盖住白底的子层/伪层一律透明 */
    html.__ROOT_CLASS__ body .sidebar-wrapper *,
    html.__ROOT_CLASS__ body .sidebar-wrapper *::before,
    html.__ROOT_CLASS__ body .sidebar-wrapper *::after {
      background-color: transparent !important;
      background-image: none !important;
      backdrop-filter: none !important;
    }
    .__ROOT_CLASS__.im-nav2-open .sidebar-wrapper {
      transform: none;
      visibility: visible;
    }
    /*
     * 锁定态把 #main-outlet-wrapper 设成 pointer-events:none，
     * 而 Discourse 的 .sidebar-wrapper 在其内部 → 展开后只能看不能点。
     * 侧栏自身及子元素显式恢复点击。
     */
    .__ROOT_CLASS__ .sidebar-wrapper,
    .__ROOT_CLASS__ .sidebar-wrapper * {
      pointer-events: auto !important;
    }
    html.__ROOT_CLASS__ body .sidebar-wrapper .sidebar-container {
      height: 100%;
      border-right: none;
    }
    /* 侧栏内部元素统一到钉钉浅色观感 */
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-header,
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-header-text {
      color: var(--im-text-3) !important;
    }
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-link {
      color: var(--im-text-2) !important;
      border-radius: 8px;
      transition: background-color 0.15s;
    }
    html.__ROOT_CLASS__ body .sidebar-wrapper .sidebar-section-link:hover {
      background-color: var(--im-hover) !important;
      color: var(--im-text) !important;
    }
    html.__ROOT_CLASS__ body .sidebar-wrapper .sidebar-section-link.active {
      background-color: var(--im-active) !important;
      color: var(--im-accent) !important;
    }
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-content svg,
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-link-prefix {
      color: var(--im-text-3);
    }
    /* 底部黑色聊天抽屉与侧栏底栏（用户栏）会破坏三栏观感，隐藏（不限于 sidebar 内部） */
    .__ROOT_CLASS__ .chat-drawer-container,
    .__ROOT_CLASS__ #chat-drawer,
    .__ROOT_CLASS__ .chat-drawer,
    .__ROOT_CLASS__ [class*="sidebar-footer"],
    .__ROOT_CLASS__ [id*="chat-drawer"] {
      display: none !important;
    }

    /* ---------- 窄图标条：通知类型筛选 ---------- */
    .im-strip {
      position: fixed;
      left: calc(var(--im-nav) + var(--im-nav2w));
      top: var(--im-header-h); bottom: 0;
      width: var(--im-strip);
      background: var(--im-strip-bg);
      border-right: 1px solid var(--im-border);
      display: flex; flex-direction: column; align-items: center;
      gap: 6px; padding: 14px 0;
      z-index: 250;
      font-family: var(--im-font);
      transition: left 0.18s ease;
    }
    .im-strip-item {
      width: 32px; height: 32px; border-radius: 8px;
      border: 0; padding: 0; background: transparent;
      display: flex; align-items: center; justify-content: center;
      color: var(--im-text-2);
      position: relative; flex-shrink: 0;
      cursor: pointer; user-select: none;
      font-family: var(--im-font);
      transition: background 0.12s ease, color 0.12s ease;
    }
    .im-strip-item:hover {
      background: var(--im-hover);
      color: var(--im-text);
    }
    .im-strip-item.active {
      background: var(--im-accent-soft);
      color: var(--im-accent);
    }
    .im-strip-item svg { width: 17px; height: 17px; }
    .im-strip-badge {
      position: absolute; top: -4px; right: -10px;
      min-width: 14px; height: 14px; padding: 0 4px;
      background: var(--im-danger); color: #fff;
      font-size: 9px; line-height: 14px; text-align: center;
      border-radius: 7px; font-weight: 500;
    }
    /* 左侧栏头像通知：仅在 html.im-notif-open 时显示，避免关不掉 */
    .__ROOT_CLASS__ .user-menu.im-user-menu-float,
    .__ROOT_CLASS__ .user-menu.revamped.menu-panel.im-user-menu-float,
    .__ROOT_CLASS__ .user-menu.menu-panel.im-user-menu-float {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    .__ROOT_CLASS__.im-notif-open .user-menu.im-user-menu-float,
    .__ROOT_CLASS__.im-notif-open .user-menu.revamped.menu-panel.im-user-menu-float,
    .__ROOT_CLASS__.im-notif-open .user-menu.menu-panel.im-user-menu-float {
      display: block !important;
      position: fixed !important;
      left: 8px !important;
      top: calc(var(--im-header-h) + 4px) !important;
      right: auto !important;
      bottom: auto !important;
      width: 320px !important;
      max-width: min(320px, calc(100vw - 20px)) !important;
      max-height: calc(100vh - 28px) !important;
      margin: 0 !important;
      z-index: 450 !important;
      box-shadow: 0 8px 28px rgba(31, 35, 41, 0.18) !important;
      border-radius: 8px !important;
      overflow: auto !important;
      pointer-events: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      background: #fff !important;
      color: var(--im-text) !important;
      clip: auto !important;
    }

    /* ---------- 最左：钉钉文字导航栏（浅色渐变；仅「更多」可点，展开原生侧栏） ---------- */

    /* ---------- 顶部浅色 titlebar ---------- */
    .im-titlebar {
      position: fixed; left: 0; right: 0; top: 0;
      height: var(--im-header-h);
      background: linear-gradient(90deg, #D5E0F8 0%, #DCE4F9 100%);
      color: var(--im-text);
      display: flex; align-items: center;
      padding: 0 10px;
      z-index: 500;
      font-family: var(--im-font);
      user-select: none;
      gap: 8px;
    }
    /* 顶栏左侧：当前用户头像（沿用 rail-avatar 类名，复用通知菜单逻辑） */
    .im-titlebar .me-chip { position: relative; width: 26px; height: 26px; flex-shrink: 0; }
    .im-titlebar .im-rail-avatar {
      width: 26px; height: 26px; border-radius: 6px; font-size: 11px;
    }
    .im-titlebar .im-rail-avatar-badge {
      top: -5px; right: -7px; min-width: 14px; height: 14px; padding: 0 3px;
      font-size: 9px; line-height: 14px; border-radius: 7px;
    }
    .im-titlebar .title-search {
      margin: 2px auto 0;
      width: min(420px, 36vw);
      height: 26px; border-radius: 13px;
      background: #EFF1FB;
      display: flex; align-items: center; gap: 6px;
      padding: 0 12px; color: var(--im-text-3); font-size: 12px;
      position: relative;
    }
    .im-titlebar .title-search form {
      display: flex; align-items: center; gap: 6px; width: 100%; margin: 0;
    }
    .im-titlebar .title-search svg { opacity: .9; flex-shrink: 0; color: var(--im-text-3); width: 14px; height: 14px; }
    .im-titlebar .title-search input {
      flex: 1; min-width: 0; border: 0; outline: none; background: transparent;
      color: var(--im-text); font-size: 12px; font-family: var(--im-font);
      text-align: center; line-height: 26px; padding: 0; height: 100%;
    }
    .im-titlebar .title-search input::placeholder { color: var(--im-text-4); text-align: center; }
    .im-titlebar .title-actions { display: flex; align-items: center; gap: 6px; margin-left: 8px; flex-shrink: 0; }
    .im-titlebar .t-btn {
      width: 28px; height: 28px; border: 0; background: transparent; color: var(--im-text-2);
      border-radius: 6px; cursor: pointer; display: grid; place-items: center; padding: 0;
      position: relative;
    }
    .im-titlebar .t-btn:hover { background: rgba(0,0,0,.05); }
    .im-titlebar .t-btn.im-dark-toggle.is-on {
      color: var(--im-accent); background: var(--im-accent-soft);
    }
    .im-titlebar .t-btn .dot {
      position: absolute; top: 4px; right: 4px; width: 6px; height: 6px;
      background: var(--im-danger); border-radius: 50%;
    }
    .im-titlebar .t-btn.ai {
      width: 24px; height: 24px; border-radius: 50%; color: #fff;
      background: conic-gradient(from 210deg, #7C5CFF, #1A87FF, #00C56C, #FFB020, #7C5CFF);
    }
    .im-titlebar .t-btn.ai svg { width: 12px; height: 12px; }
    .im-titlebar .t-btn svg { width: 16px; height: 16px; }

    .im-rail {
      position: fixed; left: 0; top: var(--im-header-h); bottom: 0;
      width: var(--im-nav);
      background: linear-gradient(180deg, #D5E0F8 0%, #DCE4F9 100%);
      display: flex; flex-direction: column; align-items: center;
      padding: 6px 0 8px;
      z-index: 350;
      font-family: var(--im-font);
      /* 不能 overflow:hidden：顶部组织 chip 的名称要溢出到中栏头部区 */
      overflow: visible;
    }
    .im-rail-head {
      width: 100%; flex-shrink: 0;
      padding: 2px 8px 8px;
      position: relative; z-index: 360;
    }
    .im-rail-org-chip {
      display: flex; align-items: center; gap: 6px;
      white-space: nowrap; cursor: pointer;
      border-radius: 8px; padding: 2px 4px; margin-left: -4px;
    }
    .im-rail-org-chip:hover { background: rgba(255,255,255,.6); }
    .im-rail-org-chip:hover .im-rail-org-name { color: var(--im-blue); }
    .im-rail-org-logo img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
    .im-rail-org-logo {
      width: 24px; height: 24px; border-radius: 6px; flex-shrink: 0;
      background: #2F88FF; color: #fff;
      display: grid; place-items: center; font-size: 12px; font-weight: 700;
    }
    .im-rail-org-name { font-size: 13px; font-weight: 600; color: var(--im-text); }
    .im-rail-org-chip > svg { width: 10px; height: 10px; color: var(--im-text-3); flex-shrink: 0; }
    /* 头像基础样式（现挂在 titlebar 左侧，类名保留以复用通知逻辑） */
    .im-rail-avatar {
      width: 36px; height: 36px; border-radius: 8px;
      overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 700;
      background: #F3A23A;
      cursor: pointer;
    }
    .im-rail-avatar img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
    .im-rail-avatar.is-notif-pinned {
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--im-accent);
    }
    .im-rail-avatar-badge {
      position: absolute; top: -4px; right: -6px;
      min-width: 16px; height: 16px; padding: 0 4px;
      background: var(--im-danger); color: #fff;
      font-size: 10px; font-weight: 700; line-height: 16px; text-align: center;
      border-radius: 8px;
      box-shadow: 0 0 0 2px #fff;
    }
    .im-rail-search { display: none !important; }
    .im-rail-items {
      flex: 1; width: 100%; overflow: auto;
      display: flex; flex-direction: column; align-items: center;
      padding: 0 8px;
    }
    .im-rail-items::-webkit-scrollbar { width: 0; }
    .im-rail-item {
      width: 100%; border: 0; background: transparent; border-radius: 10px;
      display: flex; flex-direction: row; align-items: center; justify-content: flex-start;
      gap: 8px;
      padding: 9px 10px; color: var(--im-text-2); cursor: pointer; position: relative;
      font-size: 16px; line-height: 1; text-align: left;
    }
    .im-rail-item svg { width: 20px; height: 20px; color: #5B616C; flex-shrink: 0; }
    .im-rail-item span { white-space: nowrap; }
    .im-rail-item:hover { background: rgba(255,255,255,.65); }
    .im-rail-item.active { color: var(--im-blue); background: #FFFFFF; box-shadow: 0 1px 4px rgba(31,35,41,.06); }
    .im-rail-item.active svg { color: var(--im-blue); }
    .im-rail-bottom { width: 100%; flex-shrink: 0; padding: 4px 8px 0; }
    .im-rail-more.is-on { color: var(--im-blue); background: #FFFFFF; box-shadow: 0 1px 4px rgba(31,35,41,.06); }
    .im-rail-more.is-on svg { color: var(--im-blue); }
    /* 右边缘拖拽柄：左右拉伸 rail */
    .im-rail-resizer {
      position: fixed; top: var(--im-header-h); bottom: 0;
      left: calc(var(--im-nav) - 3px); width: 6px;
      cursor: col-resize; z-index: 400;
      touch-action: none;
    }
    .im-rail-resizer:hover,
    .im-rail-resizer.dragging { background: rgba(26,135,255,.3); }
    /* 窄宽度 → 纯图标模式 */
    .im-rail-compact .im-rail-item { justify-content: center; padding: 8px 0; }
    .im-rail-compact .im-rail-item span { display: none; }
    .im-rail-compact .im-rail-head { padding: 2px 0 8px; display: flex; justify-content: center; }
    .im-rail-compact .im-rail-org-name,
    .im-rail-compact .im-rail-org-chip > svg { display: none; }
    .im-rail-compact .im-rail-badge { top: 1px; left: calc(50% + 4px); right: auto; transform: none; } /* 窄条：压居中图标右上角 */
    /* 窄条态收起钮图标转 180°（chevronsLeft→指向右 = 展开）；宽条态保持指向左 = 收起 */
    .im-rail-compact .im-rail-collapse svg { transform: rotate(180deg); }
    .im-rail-badge {
      position: absolute; top: 50%; left: auto; right: 10px; transform: translateY(-50%);
      min-width: 16px; height: 16px; padding: 0 4px;
      background: var(--im-danger); color: #fff; border-radius: 8px;
      font-size: 10px; font-weight: 700; line-height: 16px; text-align: center;
    }

    .im-nav2-cat-dot {
      width: 10px; height: 10px; border-radius: 3px;
      flex-shrink: 0; margin: 0 4px;
    }

    /* ---------- 聊天 header 头像与标题行 ---------- */
    .im-chat-head-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .im-chat-avatar {
      width: 28px; height: 28px; border-radius: 6px;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 600;
    }
    /* 头像图占满容器：无此规则 img 按原尺寸渲染，会在小容器里被裁成局部放大 */
    .im-chat-avatar img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
    /* ---------- 聊天头：标题行（人数 + 分类 chip） ---------- */
    .im-chat-title-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .im-chat-count {
      display: inline-flex; align-items: center; gap: 2px;
      font-size: 12px; color: var(--im-text-3); font-weight: 400; flex-shrink: 0;
    }
    .im-chat-count svg { width: 13px; height: 13px; }
    .im-chat-chips { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .im-chat-chip {
      display: inline-flex; align-items: center; gap: 3px;
      height: 18px; padding: 0 5px; border-radius: 4px;
      font-size: 11px; line-height: 1; white-space: nowrap;
      color: var(--im-blue) !important; background: var(--im-blue-soft);
      border: 1px solid #C9E2FF !important;
      text-decoration: none !important; cursor: pointer;
    }
    .im-chat-chip .im-nav2-cat-dot { width: 8px; height: 8px; border-radius: 2px; margin: 0; }

    /* ---------- 隐藏原生主内容（三栏路由） ---------- */
    .__ROOT_CLASS__.__LOCK_CLASS__ body { overflow: hidden !important; }
    .__ROOT_CLASS__.__LOCK_CLASS__ #main-outlet > * {
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
    }

    /* ---------- 中栏右边缘拖拽柄 ---------- */
    .im-list-resizer {
      position: fixed; top: var(--im-header-h); bottom: 0;
      left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-list) - 3px); width: 6px;
      cursor: col-resize; z-index: 400; touch-action: none;
    }
    .im-list-resizer:hover,
    .im-list-resizer.dragging { background: rgba(26,135,255,.25); }
    .__ROOT_CLASS__.__LOCK_CLASS__.im-nav2-open .im-list-resizer { left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-list) - 3px); }

    /* ---------- 中栏：会话列表 ---------- */
    .im-list-panel {
      position: fixed;
      top: var(--im-header-h);
      left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-strip));
      width: var(--im-list);
      bottom: 0;
      background: #F5F7FB;
      border-right: 1px solid var(--im-border);
      display: flex;
      flex-direction: column;
      z-index: 200;
      font-family: var(--im-font);
    }
    .im-list-header {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 44px;
      padding: 0 10px;
      flex-shrink: 0;
      border-bottom: 1px solid transparent;
    }
    .im-list-title { display: none !important; }
    /* 消息/未读：分段控件胶囊 */
    .im-list-chips {
      display: inline-flex; align-items: center; gap: 2px;
      background: #E7EAF1; border-radius: 14px; padding: 2px;
      flex-shrink: 0;
    }
    .im-chip {
      height: 24px; padding: 0 12px; border: 0; border-radius: 12px;
      background: transparent; color: var(--im-text-2); font-size: 13px; cursor: pointer;
      font-family: var(--im-font);
      display: inline-flex; align-items: center; gap: 3px;
      white-space: nowrap; flex-shrink: 0;
    }
    .im-chip .n { font-weight: 600; }
    .im-chip.active { background: #FFFFFF; color: var(--im-text); font-weight: 600; box-shadow: 0 1px 3px rgba(31,35,41,.12); }
    .im-list-actions { display: flex; gap: 6px; margin-left: auto; align-items: center; }
    .im-chip-icon {
      width: 26px; height: 26px; border-radius: 50%; background: #E7EAF1;
      border: 0; display: grid; place-items: center; color: var(--im-text-2); cursor: pointer; padding: 0;
    }
    .im-chip-icon:hover { background: #DCE1EA; }
    .im-chip-icon.is-on, .im-list-nav-toggle[aria-expanded="true"] { color: var(--im-accent); background: var(--im-accent-soft); }
    .im-chip-icon svg { width: 14px; height: 14px; }
    .im-list-nav-toggle[aria-expanded="true"] { color: var(--im-accent); background: var(--im-accent-soft); }
    .im-list-nav {
      display: none !important;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px 12px 10px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--im-border);
    }
    .im-list-nav.open,
    .im-list-panel.im-list-nav-open .im-list-nav {
      display: flex !important;
    }
    .im-list-nav a {
      display: inline-flex; align-items: center;
      height: 28px; padding: 0 10px;
      border-radius: 14px;
      font-size: 12px; line-height: 1;
      color: var(--im-text-2) !important;
      text-decoration: none !important;
      border: 1px solid var(--im-border) !important;
      background: var(--im-bg);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .im-list-nav a:hover {
      background: var(--im-hover);
      color: var(--im-text) !important;
    }
    .im-list-nav a.active {
      background: var(--im-accent-soft);
      color: var(--im-accent) !important;
      border-color: #C2D4FF !important;
      font-weight: 500;
    }
    .im-icon-btn {
      width: 32px; height: 32px;
      border: none; border-radius: 8px;
      background: transparent; color: var(--im-text-2);
      cursor: pointer; display: inline-flex;
      align-items: center; justify-content: center;
      transition: background 0.15s;
      padding: 0;
    }
    .im-icon-btn:hover { background: var(--im-hover); }
    .im-icon-btn svg { width: 18px; height: 18px; }
    .im-list-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; }
    .im-list-body::-webkit-scrollbar { width: 6px; }
    .im-list-body::-webkit-scrollbar-thumb { background: var(--im-border-strong); border-radius: 3px; }

    .im-conv {
      display: flex; gap: 8px;
      padding: 7px 10px;
      position: relative;
      text-decoration: none !important;
      cursor: pointer;
      transition: background 0.15s;
      border: none !important;
    }
    .im-conv:hover { background: var(--session-hover, var(--im-hover)); }
    .im-conv.active { background: var(--session-active, var(--im-active)); }
    .im-conv-avatar {
      width: 44px; height: 44px; border-radius: 8px;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 15px; font-weight: 600;
    }
    /* 头像模板返回的图片通常是 96px；必须约束到头像框，否则会按原始尺寸溢出并被裁成放大的局部。 */
    .im-conv-avatar img,
    .im-chat-avatar img { display: block; width: 100%; height: 100%; max-width: 100%; max-height: 100%; object-fit: cover; border-radius: inherit; }
    /* 伪装文字头像：保持圆形；实心 / 空心；字数 3～5 */
    .im-conv-avatar.is-text-avatar {
      box-sizing: border-box;
      padding: 3px;
      letter-spacing: 0;
      text-align: center;
    }
    .im-conv-avatar .im-avatar-text {
      line-height: 1; font-weight: 700;
      font-size: 13px;
    }
    .im-conv-avatar .im-avatar-text[data-len="1"] { font-size: 14px; }
    .im-conv-avatar.is-grid-mask {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 0;
      background: #C9E7FF;
      padding: 0;
      overflow: hidden;
    }
    .im-conv-avatar.is-grid-mask > span {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 100%;
      color: #fff; font-size: 7px; font-weight: 700; line-height: 1;
    }
    .im-mask-avatar-toggle.is-on {
      color: var(--im-accent); background: var(--im-accent-soft);
    }
    .im-conv-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .im-conv-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .im-conv-avatar.is-group {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 0;
      background: #C9E7FF;
      padding: 0;
      overflow: hidden;
    }
    .im-conv-avatar.is-group img,
    .im-conv-avatar.is-group span {
      width: 100%; height: 100%; object-fit: cover; background: #D4E5FF;
    }
    .im-conv-title {
      display: flex; align-items: center; gap: 6px;
      min-width: 0; flex: 1;
    }
    .im-conv-name {
      font-size: 14px; font-weight: 500; color: var(--im-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      flex: 1; min-width: 0;
    }
    .im-conv-tag {
      display: inline-flex; align-items: center;
      height: 16px; padding: 0 5px; border-radius: 4px;
      font-size: 10px; line-height: 1; white-space: nowrap; flex-shrink: 0;
      color: #2F88FF; background: #E8F3FF;
      border: 1px solid #A8CFFF;
    }
    .im-conv-time { font-size: 12px; color: var(--im-text-3); flex-shrink: 0; }
    .im-conv-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .im-conv-msg {
      font-size: 13px; color: var(--im-text-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .im-conv-badge {
      /* 未读数压头像右上角（行 padding 10/7 + 头像 44 → 压角） */
      position: absolute; top: 3px; left: 44px; right: auto; bottom: auto;
      min-width: 16px; height: 16px; padding: 0 4px;
      background: var(--im-danger); color: #fff;
      font-size: 10px; font-weight: 700; line-height: 16px; text-align: center;
      border-radius: 8px; flex-shrink: 0;
    }
    .im-list-status {
      padding: 14px; text-align: center;
      font-size: 12px; color: var(--im-text-3);
    }

    /* ---------- 右栏：聊天详情 ---------- */
    .im-chat-panel {
      position: fixed;
      top: var(--im-header-h);
      left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-strip) + var(--im-list));
      right: 0; bottom: 0;
      background: var(--im-chat-bg);
      display: flex; flex-direction: column;
      z-index: 420;
      font-family: var(--im-font);
    }
    .im-chat-header {
      height: 52px; flex-shrink: 0;
      background: #F5F7FB;
      border-bottom: 1px solid var(--im-border);
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 0 20px; gap: 12px;
    }
    .im-chat-titles { min-width: 0; }
    .im-chat-title {
      font-size: 16px; font-weight: 600; color: var(--im-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .im-chat-sub { font-size: 12px; color: var(--im-text-3); margin-top: 1px; }
    .im-chat-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .im-chat-body {
      flex: 1; overflow-y: auto;
      padding: 20px 24px;
      display: flex; flex-direction: column; gap: 16px;
      overscroll-behavior: contain;
    }
    .im-chat-body::-webkit-scrollbar { width: 6px; }
    .im-chat-body::-webkit-scrollbar-thumb { background: var(--im-border-strong); border-radius: 3px; }

    .im-msg { display: flex; gap: 10px; max-width: 78%; }
    .im-msg-other { align-self: flex-start; }
    .im-msg-me { align-self: flex-end; flex-direction: row-reverse; }
    .im-msg-avatar {
      width: 36px; height: 36px; border-radius: 8px;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 14px; font-weight: 600;
    }
    .im-msg-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .im-msg-content { min-width: 0; display: flex; flex-direction: column; position: relative; }
    .im-msg-me .im-msg-content { align-items: flex-end; }
    .im-msg-name { font-size: 12px; color: var(--im-text-3); margin-bottom: 4px; }
    .im-msg-me .im-msg-name { display: none; }
    .im-msg-bubble {
      padding: 10px 14px;
      font-size: 14px; line-height: 1.6;
      color: var(--im-text);
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .im-msg-other .im-msg-bubble {
      background: var(--im-bubble-other);
      border-radius: 8px;
      box-shadow: 0 1px 0 rgba(0,0,0,.03);
    }
    .im-msg-me .im-msg-bubble {
      background: var(--im-bubble-me);
      border-radius: 8px;
    }
    .im-msg-bubble p { margin: 0 0 8px; }
    .im-msg-bubble p:last-child { margin-bottom: 0; }
    .im-msg-bubble img { max-width: 100%; border-radius: 6px; }
    .im-msg-bubble pre {
      background: rgba(127,127,127,0.12);
      padding: 8px 10px; border-radius: 6px;
      overflow-x: auto; font-size: 13px;
    }
    .im-msg-bubble code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .im-msg-bubble blockquote {
      margin: 0 0 8px; padding: 4px 10px;
      border-left: 3px solid var(--im-accent);
      background: rgba(51,112,255,0.06);
      border-radius: 0 6px 6px 0;
    }
    .im-msg-bubble a { color: var(--im-accent); }
    .im-msg-meta {
      font-size: 11px; color: var(--im-text-3);
      margin-top: 4px; display: flex; gap: 8px; align-items: center;
    }
    .im-msg-time-sep {
      align-self: center;
      font-size: 12px; color: var(--im-text-3);
      padding: 2px 10px;
    }
    .im-msg-tools {
      position: absolute; top: -14px; right: 0; z-index: 5;
      display: flex; align-items: center; gap: 2px;
      background: var(--im-bg);
      border: 1px solid var(--im-border);
      border-radius: 8px;
      padding: 2px;
      box-shadow: 0 2px 8px rgba(31, 35, 41, 0.1);
      opacity: 0; visibility: hidden;
      transition: opacity 0.15s ease;
    }
    .im-msg:hover .im-msg-tools { opacity: 1; visibility: visible; }
    .im-msg-me .im-msg-tools { right: auto; left: 0; }
    .im-msg-tool {
      width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; cursor: pointer;
      border-radius: 6px; color: var(--im-text-2);
      padding: 0;
    }
    .im-msg-tool svg { width: 15px; height: 15px; }
    .im-msg-tool:hover { background: var(--im-hover); color: var(--im-accent); }
    .im-msg-tool.liked { color: var(--im-accent); }

    .im-chat-empty, .im-chat-error, .im-chat-loading {
      margin: auto;
      display: flex; flex-direction: column;
      align-items: center; gap: 10px;
      color: var(--im-text-3); font-size: 14px;
      text-align: center; padding: 40px 20px;
    }
    .im-chat-empty svg, .im-chat-error svg {
      width: 56px; height: 56px; opacity: 0.5;
    }
    .im-empty-btn {
      margin-top: 6px;
      border: 1px solid var(--im-border-strong);
      background: var(--im-bg); color: var(--im-text-2);
      border-radius: 6px; height: 32px; padding: 0 14px;
      font-size: 13px; cursor: pointer; font-family: var(--im-font);
    }
    .im-empty-btn:hover { background: var(--im-hover); }

    /* ---------- 钉钉 composer：白卡片，输入区 + 下方工具行 + 发送钮 ---------- */
    .im-composer {
      background: transparent; border-top: none;
      padding: 4px 12px 12px; flex-shrink: 0;
    }
    .im-composer-card {
      background: #FFFFFF;
      border: 1px solid var(--im-border);
      border-radius: 12px;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .im-composer-card:hover {
      border-color: #C2D4FF;
      box-shadow: 0 2px 10px rgba(26,135,255,.08);
    }
    .im-composer-tools {
      display: flex; align-items: center; gap: 0; padding: 10px 10px 2px; /* 三皮肤统一格式 */
    }
    .im-composer-tools .im-icon-btn { width: 28px; height: 28px; }
    .im-composer-tools .spacer { flex: 1; }
    .im-composer-tools .hint { font-size: 11px; color: var(--im-text-4); margin-right: 8px; }
    .im-composer-tools .im-composer-status {
      font-size: 11px; color: var(--im-text-4);
      max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-right: 8px;
    }
    .im-composer-tools .im-composer-status.error { color: var(--im-danger); }
    .im-composer-tools .im-composer-status.busy { color: var(--im-accent); }
    .im-composer-tools .im-composer-status.success { color: #00C56C; }
    .im-send-btn {
      height: 26px; padding: 0 14px; border: 0; border-radius: 5px;
      background: #C5C9D0; color: #fff; font-size: 12px; cursor: pointer;
      font-family: var(--im-font);
      transition: background 0.15s;
    }
    .im-send-btn:not(:disabled) { background: var(--im-accent); }
    .im-send-btn:disabled { cursor: not-allowed; }
    .im-chat-tools { margin-left: auto; display: flex; gap: 2px; }
    .im-chat-tools .im-icon-btn { width: 32px; height: 32px; position: relative; }
    .im-chat-tools .dot,
    .im-composer-tools .dot {
      position: absolute; top: 6px; right: 6px; width: 6px; height: 6px;
      background: var(--im-danger); border-radius: 50%;
    }
    .im-composer-tools .im-icon-btn { position: relative; }

    /* ---------- 输入区：IM 直接输入 ---------- */
    .im-chat-compose {
      position: relative;
      z-index: 430;
      flex-shrink: 0;
      margin: 0;
      min-height: 64px;
      height: auto;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--im-text);
      display: block;
      padding: 10px 14px 4px;
      font-size: 14px;
      font-family: var(--im-font);
      transition: color 0.15s;
      pointer-events: auto !important;
      width: 100%;
      text-align: left;
      resize: none;
      outline: none;
      overflow-y: auto;
      max-height: 160px;
    }
    .im-chat-compose::placeholder { color: var(--im-text-4); }
    .im-composer-target {
      display: none;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--im-accent);
      padding: 6px 14px 0;
    }
    .im-composer-target.active { display: flex; }
    .im-composer-target button {
      background: transparent; border: none; color: inherit; cursor: pointer;
      padding: 0; font-size: 12px;
    }
    .im-composer-file { display: none; }
    .im-chat-panel[data-empty="1"] .im-composer { display: none; }

    /* 锁定态：原生主区不要抢走点击；关闭态 composer 直接隐藏 */
    .__ROOT_CLASS__.__LOCK_CLASS__ #main-outlet-wrapper,
    .__ROOT_CLASS__.__LOCK_CLASS__ #main-outlet {
      pointer-events: none !important;
    }
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control:not(.open):not(.fullscreen):not(.edit-title) {
      display: none !important;
      pointer-events: none !important;
      z-index: 0 !important;
    }
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control.open,
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control.edit-title,
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control.fullscreen {
      display: block !important;
      left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-strip) + var(--im-list)) !important;
      right: 0 !important;
      width: auto !important;
      max-width: none !important;
      z-index: 600 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      border-radius: 12px 12px 0 0 !important;
      box-shadow: 0 -8px 28px rgba(0,0,0,0.12) !important;
    }
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control .reply-area {
      max-width: none !important;
      padding-left: 20px !important;
      padding-right: 20px !important;
    }

    /* ---------- native 模式悬浮恢复钮 ---------- */
    .im-mode-fab {
      position: fixed; right: 20px; bottom: 20px; z-index: 10000;
      width: 44px; height: 44px; border-radius: 50%;
      background: #1A87FF; color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(51,112,255,0.4);
    }
    .im-mode-fab svg { width: 22px; height: 22px; }

    /* ---------- splash ---------- */
    .__ROOT_CLASS__ #d-splash { background: var(--im-bg) !important; }
    .__ROOT_CLASS__ #d-splash .preloader-image { display: none !important; }
    .__ROOT_CLASS__ #d-splash .splash-logo-container {
      width: 96px !important; height: 96px !important;
      background-image: var(--im-splash-logo) !important;
      background-size: contain !important;
      background-repeat: no-repeat !important;
      animation: none !important;
    }
    .__ROOT_CLASS__ #d-splash .dots { background-color: #1A87FF !important; filter: none !important; }

    /* ---------- 窄屏降级 ---------- */
    @media (max-width: 1280px) {
      .__ROOT_CLASS__ { --im-list: 250px; }
    }
    @media (max-width: 1000px) {
      .__ROOT_CLASS__ { --im-nav2w: 0px !important; --im-strip: 0px !important; }
      .im-strip { display: none; }
      .__ROOT_CLASS__.__LOCK_CLASS__ .im-list-panel { width: calc(100% - var(--im-nav)); left: var(--im-nav); }
      .__ROOT_CLASS__.__LOCK_CLASS__.im-topic-open .im-list-panel { display: none; }
      .__ROOT_CLASS__.__LOCK_CLASS__:not(.im-topic-open) .im-chat-panel { display: none; }
      .__ROOT_CLASS__.__LOCK_CLASS__ .im-chat-panel { left: var(--im-nav); }
      .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control { left: calc(var(--im-nav) + 12px) !important; right: 12px !important; }
    }

    /* ---------- 深色模式 token + 硬编码覆盖 ---------- */
    .__ROOT_CLASS__.__DARK_CLASS__ {
      color-scheme: dark !important;
      --im-blue: #3B92FF;
      --im-blue-hover: #5BA3FF;
      --im-blue-soft: #1A2F4D;
      --im-blue-chip: #1E3558;
      --im-title: #3B92FF;
      --im-accent: #3B92FF;
      --im-accent-soft: #1A2F4D;
      --im-nav2-bg: #1B1E24;
      --im-nav2-border: #2A2E36;
      --im-text: #E8EAED;
      --im-text-2: #B0B4BE;
      --im-text-3: #8A8F99;
      --im-text-4: #6B707A;
      --im-bg: #14161B;
      --im-chat-bg: #0F1115;
      --im-hover: #22262E;
      --im-active: #2A3140;
      --im-bubble-other: #1E222A;
      --im-bubble-me: #1A3358;
      --im-border: #2A2E36;
      --im-border-strong: #3A404C;
      --im-danger: #FF6B6B;
      --im-rail-bg: #171A22;
      --im-strip-bg: transparent;
      --header_background: #14161B;
      --header_primary: var(--im-text);
      --secondary: var(--im-bg);
      --primary: var(--im-text);
      --primary-medium: var(--im-text-2);
      --primary-low: var(--im-text-3);
      --d-hover: var(--im-hover);
    }
    html.__ROOT_CLASS__.__DARK_CLASS__,
    html.__ROOT_CLASS__.__DARK_CLASS__ body {
      color-scheme: dark !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-titlebar {
      background: linear-gradient(90deg, #1A2233 0%, #1E2738 100%);
      color: var(--im-text);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-titlebar .title-search {
      background: #252B38;
      color: var(--im-text-3);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-titlebar .t-btn:hover {
      background: rgba(255,255,255,.08);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-titlebar .t-btn.im-dark-toggle.is-on {
      color: var(--im-accent);
      background: var(--im-accent-soft);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail {
      background: linear-gradient(180deg, #1A2233 0%, #1E2738 100%);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-org-chip:hover {
      background: rgba(255,255,255,.08);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-item svg {
      color: var(--im-text-2);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-item.active,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-more.is-on {
      background: #252B38;
      box-shadow: none;
      color: var(--im-accent);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chip.active {
      background: #252B38;
      color: var(--im-text);
      box-shadow: none;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-header {
      background: var(--im-bg);
      border-bottom-color: var(--im-border);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-chips {
      background: #1E222A;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chip-icon {
      background: #1E222A;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chip-icon:hover {
      background: #2A3140;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-body,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-panel {
      background: var(--im-bg);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-panel {
      background: var(--im-chat-bg);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-header {
      background: var(--im-bg);
      border-bottom-color: var(--im-border);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer-card {
      background: var(--im-bg) !important;
      border-color: var(--im-border) !important;
      border-top-color: var(--im-border);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer-card:hover {
      border-color: #3B5F8A !important;
      box-shadow: 0 2px 10px rgba(0,0,0,.35);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer-box {
      background: #1E222A !important;
      border-color: var(--im-border-strong);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-send-btn {
      background: #4A5160;
      color: #fff;
    }
    html.__ROOT_CLASS__.__DARK_CLASS__ body .sidebar-wrapper {
      background-color: var(--im-nav2-bg) !important;
      --primary: var(--im-text);
      --primary-medium: var(--im-text-2);
      --primary-low: var(--im-text-3);
      --primary-low-mid: #6B707A;
      --primary-very-low: #22262E;
      --primary-50: #1B1E24;
      --primary-100: #22262E;
      --primary-200: #2A2E36;
      --primary-300: #3A404C;
      --secondary: var(--im-nav2-bg);
      --tertiary: var(--im-accent);
      --quaternary: var(--im-accent);
      --d-hover: var(--im-hover);
      --d-sidebar-background: var(--im-nav2-bg);
      --d-sidebar-border-color: var(--im-border);
      color: var(--im-text);
    }
    .__ROOT_CLASS__.__DARK_CLASS__.im-notif-open .user-menu.im-user-menu-float,
    .__ROOT_CLASS__.__DARK_CLASS__.im-notif-open .user-menu.revamped.menu-panel.im-user-menu-float,
    .__ROOT_CLASS__.__DARK_CLASS__.im-notif-open .user-menu.menu-panel.im-user-menu-float {
      background: var(--im-bg) !important;
      color: var(--im-text) !important;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45) !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-topic-chip {
      color: var(--im-accent);
      background: var(--im-accent-soft);
      border-color: #2F4F7A;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-avatar.is-notif-pinned,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-titlebar .im-rail-avatar.is-notif-pinned {
      box-shadow: 0 0 0 2px var(--im-bg), 0 0 0 4px var(--im-accent);
    }

    /* ============================== 投票组件 ============================== */
    .__ROOT_CLASS__ .im-poll-options {
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      margin-bottom: 10px !important;
    }
    .__ROOT_CLASS__ .im-poll-option {
      position: relative !important;
      display: flex !important;
      align-items: center !important;
      padding: 10px 14px !important;
      border-radius: 8px !important;
      border: 1.5px solid transparent !important;
      cursor: pointer !important;
      overflow: hidden !important;
      transition: all 0.18s ease !important;
    }
    .__ROOT_CLASS__ .im-poll-option:hover {
      background: rgba(26, 135, 255, 0.06) !important;
    }
    .__ROOT_CLASS__ .im-poll-radio {
      width: 18px !important;
      height: 18px !important;
      min-width: 18px !important;
      margin-right: 12px !important;
      flex-shrink: 0 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
    }
    .__ROOT_CLASS__ .im-poll-title {
      flex: 1 !important;
      font-size: 13.5px !important;
      font-weight: 500 !important;
      line-height: 1.4 !important;
      z-index: 1 !important;
    }
    .__ROOT_CLASS__ .im-poll-count {
      font-size: 12px !important;
      font-weight: 600 !important;
      margin-left: 10px !important;
      z-index: 1 !important;
      white-space: nowrap !important;
    }
    .__ROOT_CLASS__ .im-poll-bar {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      bottom: 0 !important;
      pointer-events: none !important;
      z-index: 0 !important;
      transition: width 0.35s ease !important;
    }
    .__ROOT_CLASS__ .im-poll-actions {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      margin-top: 12px !important;
      padding-top: 10px !important;
      border-top: 1px dashed rgba(0,0,0,0.08) !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-poll-actions {
      border-top-color: rgba(255,255,255,0.1) !important;
    }
    .__ROOT_CLASS__ .im-poll-submit-btn,
    .__ROOT_CLASS__ .im-poll-undo-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 32px !important;
      padding: 0 16px !important;
      border-radius: 6px !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      border: none !important;
      cursor: pointer !important;
      box-sizing: border-box !important;
    }
    .__ROOT_CLASS__ .im-poll-submit-btn {
      background: #1A87FF !important;
      color: #FFFFFF !important;
    }
    .__ROOT_CLASS__ .im-poll-submit-btn:disabled {
      opacity: 0.5 !important;
      cursor: not-allowed !important;
    }
    .__ROOT_CLASS__ .im-poll-undo-btn {
      background: transparent !important;
      border: 1px solid rgba(0,0,0,0.15) !important;
      color: #646A73 !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-poll-undo-btn {
      border-color: rgba(255,255,255,0.2) !important;
      color: #A0A5B2 !important;
    }
    .__ROOT_CLASS__ .im-poll-status-tip {
      font-size: 12px !important;
      color: #8F959E !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-poll-status-tip {
      color: #8A8F99 !important;
    }

    /* ============================== 小火箭跟评 ============================== */
    .__ROOT_CLASS__ .im-rocket-bar {
      display: flex !important;
      flex-wrap: wrap !important;
      align-items: center !important;
      gap: 6px !important;
      margin-top: 6px !important;
      padding: 0 4px !important;
    }
    .__ROOT_CLASS__ .im-rocket-chip {
      display: inline-flex !important;
      align-items: center !important;
      gap: 5px !important;
      padding: 4px 10px 4px 4px !important;
      border-radius: 14px !important;
      background: rgba(0,0,0,0.04) !important;
      border: 1px solid rgba(0,0,0,0.06) !important;
      font-size: 12px !important;
      color: #1F2329 !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
      max-width: 100% !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rocket-chip {
      background: rgba(255,255,255,0.06) !important;
      border-color: rgba(255,255,255,0.08) !important;
      color: #E6E8EB !important;
    }
    .__ROOT_CLASS__ .im-rocket-chip:hover {
      background: rgba(0,0,0,0.08) !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rocket-chip:hover {
      background: rgba(255,255,255,0.1) !important;
    }
    .__ROOT_CLASS__ .im-rocket-chip.is-my-boost {
      padding-right: 4px !important;
    }
    .__ROOT_CLASS__ .im-rocket-chip.is-my-boost:hover .im-rocket-trash {
      display: inline-flex !important;
    }
    .__ROOT_CLASS__ .im-rocket-avatar-box {
      width: 18px !important;
      height: 18px !important;
      min-width: 18px !important;
      border-radius: 50% !important;
      overflow: hidden !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: #E5E6EB !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rocket-avatar-box {
      background: #3A3F4B !important;
    }
    .__ROOT_CLASS__ .im-rocket-avatar-box img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
    }
    .__ROOT_CLASS__ .im-rocket-avatar-box .fallback-letter {
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 10px !important;
      color: #fff !important;
    }
    .__ROOT_CLASS__ .im-rocket-text {
      max-width: 200px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      line-height: 1.3 !important;
    }
    .__ROOT_CLASS__ .im-rocket-trash {
      display: none !important;
      width: 18px !important;
      height: 18px !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      margin-left: 2px !important;
      border: none !important;
      background: transparent !important;
      color: #8A8F99 !important;
      cursor: pointer !important;
      border-radius: 50% !important;
    }
    .__ROOT_CLASS__ .im-rocket-trash:hover {
      color: #EF4444 !important;
      background: rgba(239, 68, 68, 0.1) !important;
    }
    .__ROOT_CLASS__ .im-rocket-btn {
      width: 22px !important;
      height: 22px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 50% !important;
      background: rgba(26, 135, 255, 0.1) !important;
      color: #1A87FF !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
    }
    .__ROOT_CLASS__ .im-rocket-btn:hover {
      background: rgba(26, 135, 255, 0.2) !important;
      transform: scale(1.05) !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rocket-btn {
      background: rgba(26, 135, 255, 0.18) !important;
    }

    /* 小火箭输入条 */
    .__ROOT_CLASS__ .im-boost-composer {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      margin: 8px 0 4px !important;
      padding: 8px 10px !important;
      border-radius: 10px !important;
      background: rgba(0,0,0,0.03) !important;
      border: 1px solid rgba(0,0,0,0.06) !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-boost-composer {
      background: rgba(255,255,255,0.04) !important;
      border-color: rgba(255,255,255,0.08) !important;
    }
    .__ROOT_CLASS__ .im-boost-avatar {
      width: 26px !important;
      height: 26px !important;
      min-width: 26px !important;
      border-radius: 50% !important;
      overflow: hidden !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: #E5E6EB !important;
      font-size: 11px !important;
      color: #1F2329 !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-boost-avatar {
      background: #3A3F4B !important;
      color: #E6E8EB !important;
    }
    .__ROOT_CLASS__ .im-boost-avatar img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
    }
    .__ROOT_CLASS__ .im-boost-input {
      flex: 1 !important;
      min-width: 0 !important;
      height: 32px !important;
      padding: 0 10px !important;
      border: 1px solid rgba(0,0,0,0.1) !important;
      border-radius: 16px !important;
      background: #FFFFFF !important;
      color: #1F2329 !important;
      font-size: 13px !important;
      outline: none !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-boost-input {
      background: #23262E !important;
      border-color: rgba(255,255,255,0.12) !important;
      color: #E6E8EB !important;
    }
    .__ROOT_CLASS__ .im-boost-input:focus {
      border-color: #1A87FF !important;
    }
    .__ROOT_CLASS__ .im-boost-emojis {
      display: flex !important;
      gap: 4px !important;
      flex-shrink: 0 !important;
    }
    .__ROOT_CLASS__ .im-quick-emoji {
      width: 24px !important;
      height: 24px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 14px !important;
      cursor: pointer !important;
      border-radius: 50% !important;
      transition: all 0.12s ease !important;
    }
    .__ROOT_CLASS__ .im-quick-emoji:hover {
      background: rgba(0,0,0,0.06) !important;
      transform: scale(1.15) !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-quick-emoji:hover {
      background: rgba(255,255,255,0.08) !important;
    }
    .__ROOT_CLASS__ .im-boost-btn {
      width: 28px !important;
      height: 28px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      flex-shrink: 0 !important;
    }
    .__ROOT_CLASS__ .im-boost-submit {
      background: #1A87FF !important;
      color: #FFFFFF !important;
    }
    .__ROOT_CLASS__ .im-boost-submit:hover {
      background: #0A6FE0 !important;
    }
    .__ROOT_CLASS__ .im-boost-cancel {
      background: transparent !important;
      color: #8A8F99 !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-boost-cancel {
      color: #A0A5B2 !important;
    }
    .__ROOT_CLASS__ .im-boost-btn svg {
      width: 16px !important;
      height: 16px !important;
    }

    /* ============================== 引用返回按钮 ============================== */
    .__ROOT_CLASS__ .im-jump-back-btn {
      position: absolute !important;
      left: 50% !important;
      bottom: 72px !important;
      transform: translateX(-50%) !important;
      /* 与 core-extra 基础层级保持一致：高于 .im-chat-compose(430)，低于资料页(440) */
      z-index: 435 !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 6px !important;
      height: 34px !important;
      padding: 0 14px !important;
      border-radius: 17px !important;
      border: none !important;
      background: #1A87FF !important;
      color: #FFFFFF !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      box-shadow: 0 4px 14px rgba(26, 135, 255, 0.35) !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    }
    .__ROOT_CLASS__ .im-jump-back-btn:hover {
      background: #0A6FE0 !important;
      transform: translateX(-50%) translateY(-1px) !important;
    }
    .__ROOT_CLASS__ .im-jump-back-close {
      margin-left: 4px !important;
      width: 18px !important;
      height: 18px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 50% !important;
      font-size: 12px !important;
      color: rgba(255,255,255,0.85) !important;
    }
    .__ROOT_CLASS__ .im-jump-back-close:hover {
      background: rgba(255,255,255,0.2) !important;
      color: #FFFFFF !important;
    }
    .__ROOT_CLASS__ .im-msg-highlight {
      animation: im-msg-pulse 1.2s ease !important;
    }
    @keyframes im-msg-pulse {
      0% { background-color: transparent; }
      40% { background-color: rgba(26, 135, 255, 0.18); }
      100% { background-color: transparent; }
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-msg-highlight {
      animation-name: im-msg-pulse-dark !important;
    }
    @keyframes im-msg-pulse-dark {
      0% { background-color: transparent; }
      40% { background-color: rgba(26, 135, 255, 0.28); }
      100% { background-color: transparent; }
    }

    /* ============================== 分类标签隐藏 ============================== */
    .__ROOT_CLASS__.im-hide-cat-tags .im-conv-tag,
    .__ROOT_CLASS__.im-hide-cat-tags .im-chat-chips {
      display: none !important;
    }

    /* ---------- 钉钉风格跟随气泡 Toast ---------- */
    .__ROOT_CLASS__ .im-toast {
      position: fixed;
      z-index: 100000;
      background: rgba(33, 36, 44, 0.96);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1.4;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
      transform: translateY(0);
      opacity: 1;
      white-space: nowrap;
      box-sizing: border-box;
    }
    .__ROOT_CLASS__ .im-toast.fade-out {
      opacity: 0;
      transform: translateY(-6px);
    }

    /* ---------- 点赞胶囊徽章与心形动效 ---------- */
    .__ROOT_CLASS__ .im-like-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 20px;
      padding: 0 7px;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(0, 0, 0, 0.05);
      color: var(--im-text-3);
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      transition: all 0.18s ease;
      margin-left: 6px;
      vertical-align: middle;
      box-sizing: border-box;
    }
    .__ROOT_CLASS__ .im-like-badge:hover {
      background: rgba(245, 74, 69, 0.08);
      color: #F54A45;
      border-color: rgba(245, 74, 69, 0.2);
    }
    .__ROOT_CLASS__ .im-like-badge.liked {
      background: rgba(245, 74, 69, 0.1) !important;
      border-color: rgba(245, 74, 69, 0.25) !important;
      color: #F54A45 !important;
    }
    .__ROOT_CLASS__ .im-like-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .__ROOT_CLASS__ .im-like-icon svg {
      width: 12px;
      height: 12px;
      display: block;
    }
    .__ROOT_CLASS__ .im-like-badge.pop .im-like-icon,
    .__ROOT_CLASS__ .im-msg-tool.pop svg {
      animation: im-heart-pop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes im-heart-pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.45); }
      100% { transform: scale(1); }
    }
    .__ROOT_CLASS__ .im-msg-tool.liked {
      color: #F54A45 !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-like-badge {
      background: #23262E !important;
      border-color: rgba(255, 255, 255, 0.08) !important;
      color: #A0A5B2 !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-like-badge:hover {
      background: rgba(245, 74, 69, 0.15) !important;
      color: #FF6B66 !important;
      border-color: rgba(245, 74, 69, 0.3) !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-like-badge.liked {
      background: rgba(245, 74, 69, 0.2) !important;
      border-color: rgba(245, 74, 69, 0.4) !important;
      color: #FF6B66 !important;
    }

    /* ---------- 钉钉式引用回复卡片 ---------- */
    .__ROOT_CLASS__ .im-quote-reply {
      border-left: 2px solid rgba(0, 0, 0, 0.28);
      padding: 3px 0 3px 8px;
      margin-bottom: 6px;
      cursor: pointer;
      border-radius: 1px;
      transition: background 0.15s, border-color 0.15s;
      user-select: none;
      max-width: 100%;
      overflow: hidden;
    }
    .__ROOT_CLASS__ .im-quote-reply:hover {
      background: rgba(0, 0, 0, 0.04);
      border-left-color: var(--im-blue);
    }
    .__ROOT_CLASS__ .im-quote-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--im-text-2);
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .__ROOT_CLASS__ .im-quote-text {
      font-size: 12px;
      color: var(--im-text-3);
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
    .__ROOT_CLASS__ .im-msg-me .im-quote-reply {
      border-left-color: rgba(26, 135, 255, 0.6);
    }
    .__ROOT_CLASS__ .im-msg-me .im-quote-name {
      color: #0A6FE0;
    }
    .__ROOT_CLASS__ .im-msg-me .im-quote-text {
      color: #4A6E9B;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-quote-reply {
      border-left-color: rgba(255, 255, 255, 0.25);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-quote-reply:hover {
      background: rgba(255, 255, 255, 0.05);
      border-left-color: var(--im-blue);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-quote-name {
      color: #B0B5BE;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-quote-text {
      color: #8A8F99;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-msg-me .im-quote-reply {
      border-left-color: rgba(26, 135, 255, 0.7);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-msg-me .im-quote-name {
      color: #4AA2FF;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-msg-me .im-quote-text {
      color: #7AA3D6;
    }
  `;
  const CSS_FS = String.raw`
    /* ---------- Token ---------- */
    .__ROOT_CLASS__ {
      color-scheme: light !important;
      --im-accent: #3370FF;
      --im-accent-soft: #E8F0FF;
      --im-nav2-bg: #EBF0F4;
      --im-nav2-border: #DFE5EC;
      --im-text: #1F2329;
      --im-text-2: #646A73;
      --im-text-3: #8F959E;
      --im-bg: #FFFFFF;
      --im-chat-bg: #FFFFFF;
      --im-hover: #F5F6F7;
      --im-active: #E4EDFB;
      --im-bubble-other: #EEEFEE;
      --im-bubble-me: #E8F0FF;
      --im-border: #E8E9EB;
      --im-border-strong: #DEE0E3;
      --im-danger: #F54840;
      --im-rail-bg: #D2E0F1;
      --im-strip-bg: #FDFDFB;
      --im-nav: __RAIL_WIDTH__px;
      --im-nav2w: 0px;
      --im-strip: __STRIP_WIDTH__px;
      --im-list: __LIST_WIDTH__px;
      --im-header-h: 0px;
      --im-font: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;

      --primary: var(--im-text);
      --primary-medium: var(--im-text-2);
      --primary-low: var(--im-text-3);
      --secondary: var(--im-bg);
      --tertiary: var(--im-accent);
      --header_background: #FFFFFF;
      --header_primary: var(--im-text);
      --d-hover: var(--im-hover);
    }

    /* 整站写死光明：覆盖系统/站点暗色偏好 */
    html.__ROOT_CLASS__,
    html.__ROOT_CLASS__ body {
      color-scheme: light !important;
    }

    /* ---------- 字体与基础 ---------- */
    .__ROOT_CLASS__ body { font-family: var(--im-font) !important; }

    /* 站点无全局 border-box：自绘面板统一盒模型，否则 padding 会加宽导致互相堆叠 */
    .im-rail, .im-rail *,
    .im-strip, .im-strip *,
    .im-list-panel, .im-list-panel *,
    .im-chat-panel, .im-chat-panel *,
    .im-mode-fab { box-sizing: border-box; }

    /* ---------- 顶栏视觉隐藏（保留 DOM，供 user-menu 挂载/点击） ---------- */
    .__ROOT_CLASS__ .d-header-wrap,
    .__ROOT_CLASS__ .d-header {
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
    /* 允许脚本对用户按钮做 programmatic click */
    .__ROOT_CLASS__ #current-user,
    .__ROOT_CLASS__ #toggle-current-user,
    .__ROOT_CLASS__ .header-dropdown-toggle.current-user {
      pointer-events: auto !important;
    }
    .__ROOT_CLASS__ #main-outlet-wrapper {
      padding-top: 0 !important;
      margin-left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-strip)) !important;
    }

    /* ---------- 展开栏：原生侧栏原样搬入（内容与文案不变，≡ 滑出） ---------- */
    .__ROOT_CLASS__.im-nav2-open { --im-nav2w: __NAV2_WIDTH__px; }
    html.__ROOT_CLASS__ body .sidebar-wrapper {
      display: block !important;
      position: fixed;
      left: var(--im-nav); top: 0; bottom: 0;
      width: __NAV2_WIDTH__px !important;
      background-color: #FFFFFF !important;
      background-image: none !important;
      backdrop-filter: none !important;
      box-shadow: none !important;
      border-right: 1px solid var(--im-border);
      z-index: 300;
      transform: translateX(-105%);
      visibility: hidden;
      transition: transform 0.18s ease, visibility 0.18s;
      /* 站点可能是深色方案：强制飞书浅色调色板 */
      --primary: var(--im-text);
      --primary-medium: var(--im-text-2);
      --primary-low: var(--im-text-3);
      --primary-low-mid: #BBBFC4;
      --primary-very-low: #F0F2F5;
      --primary-50: #F5F6F7;
      --primary-100: #EBEDEF;
      --primary-200: #E8E9EB;
      --primary-300: #DEE0E3;
      --secondary: #FFFFFF;
      --tertiary: var(--im-accent);
      --quaternary: var(--im-accent);
      --d-hover: var(--im-hover);
      --d-sidebar-background: #FFFFFF;
      --d-sidebar-border-color: var(--im-border);
      color: var(--im-text);
    }
    /* 可能盖住白底的子层/伪层一律透明 */
    html.__ROOT_CLASS__ body .sidebar-wrapper *,
    html.__ROOT_CLASS__ body .sidebar-wrapper *::before,
    html.__ROOT_CLASS__ body .sidebar-wrapper *::after {
      background-color: transparent !important;
      background-image: none !important;
      backdrop-filter: none !important;
    }
    .__ROOT_CLASS__.im-nav2-open .sidebar-wrapper {
      transform: none;
      visibility: visible;
    }
    /*
     * 锁定态把 #main-outlet-wrapper 设成 pointer-events:none，
     * 而 Discourse 的 .sidebar-wrapper 在其内部 → 展开后只能看不能点。
     * 侧栏自身及子元素显式恢复点击。
     */
    .__ROOT_CLASS__ .sidebar-wrapper,
    .__ROOT_CLASS__ .sidebar-wrapper * {
      pointer-events: auto !important;
    }
    html.__ROOT_CLASS__ body .sidebar-wrapper .sidebar-container {
      height: 100%;
      border-right: none;
    }
    /* 侧栏内部元素统一到飞书浅色观感 */
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-header,
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-header-text {
      color: var(--im-text-3) !important;
    }
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-link {
      color: var(--im-text-2) !important;
      border-radius: 8px;
      transition: background-color 0.15s;
    }
    html.__ROOT_CLASS__ body .sidebar-wrapper .sidebar-section-link:hover {
      background-color: var(--im-hover) !important;
      color: var(--im-text) !important;
    }
    html.__ROOT_CLASS__ body .sidebar-wrapper .sidebar-section-link.active {
      background-color: var(--im-active) !important;
      color: var(--im-accent) !important;
    }
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-content svg,
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-link-prefix {
      color: var(--im-text-3);
    }
    /* 底部黑色聊天抽屉与侧栏底栏（用户栏）会破坏三栏观感，隐藏（不限于 sidebar 内部） */
    .__ROOT_CLASS__ .chat-drawer-container,
    .__ROOT_CLASS__ #chat-drawer,
    .__ROOT_CLASS__ .chat-drawer,
    .__ROOT_CLASS__ [class*="sidebar-footer"],
    .__ROOT_CLASS__ [id*="chat-drawer"] {
      display: none !important;
    }

    /* ---------- 窄图标条：通知类型筛选 ---------- */
    .im-strip {
      position: fixed;
      left: calc(var(--im-nav) + var(--im-nav2w));
      top: 0; bottom: 0;
      width: var(--im-strip);
      background: var(--im-strip-bg);
      border-right: 1px solid var(--im-border);
      display: flex; flex-direction: column; align-items: center;
      gap: 6px; padding: 14px 0;
      z-index: 250;
      font-family: var(--im-font);
      transition: left 0.18s ease;
    }
    .im-strip-item {
      width: 32px; height: 32px; border-radius: 8px;
      border: 0; padding: 0; background: transparent;
      display: flex; align-items: center; justify-content: center;
      color: var(--im-text-2);
      position: relative; flex-shrink: 0;
      cursor: pointer; user-select: none;
      font-family: var(--im-font);
      transition: background 0.12s ease, color 0.12s ease;
    }
    .im-strip-item:hover {
      background: var(--im-hover);
      color: var(--im-text);
    }
    .im-strip-item.active {
      background: var(--im-accent-soft);
      color: var(--im-accent);
    }
    .im-strip-item svg { width: 17px; height: 17px; }
    .im-strip-badge {
      position: absolute; top: -4px; right: -10px;
      min-width: 14px; height: 14px; padding: 0 4px;
      background: var(--im-danger); color: #fff;
      font-size: 9px; line-height: 14px; text-align: center;
      border-radius: 7px; font-weight: 500;
    }
    /* 左侧栏头像通知：仅在 html.im-notif-open 时显示，避免关不掉 */
    .__ROOT_CLASS__ .user-menu.im-user-menu-float,
    .__ROOT_CLASS__ .user-menu.revamped.menu-panel.im-user-menu-float,
    .__ROOT_CLASS__ .user-menu.menu-panel.im-user-menu-float {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    .__ROOT_CLASS__.im-notif-open .user-menu.im-user-menu-float,
    .__ROOT_CLASS__.im-notif-open .user-menu.revamped.menu-panel.im-user-menu-float,
    .__ROOT_CLASS__.im-notif-open .user-menu.menu-panel.im-user-menu-float {
      display: block !important;
      position: fixed !important;
      left: var(--im-nav) !important;
      top: 14px !important;
      right: auto !important;
      bottom: auto !important;
      width: 320px !important;
      max-width: min(320px, calc(100vw - var(--im-nav) - 12px)) !important;
      max-height: calc(100vh - 28px) !important;
      margin: 0 !important;
      z-index: 450 !important;
      box-shadow: 0 8px 28px rgba(31, 35, 41, 0.18) !important;
      border-radius: 8px !important;
      overflow: auto !important;
      pointer-events: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      background: #fff !important;
      color: var(--im-text) !important;
      clip: auto !important;
    }

    /* ---------- 最左：飞书文字导航栏（复刻飞书，除展开钮外纯装饰） ---------- */
    .im-rail {
      position: fixed; left: 0; top: 0; bottom: 0;
      width: var(--im-nav);
      background: var(--im-rail-bg);
      border-right: 1px solid var(--im-nav2-border);
      display: flex; flex-direction: column;
      padding: 26px 12px 14px;
      z-index: 400;
      font-family: var(--im-font);
    }
    .im-rail-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 2px 4px 12px;
    }
    .im-rail-avatar-wrap {
      position: relative; flex-shrink: 0;
      width: 40px; height: 40px;
    }
    .im-rail-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      overflow: hidden; cursor: pointer; border: none; padding: 0;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 15px; font-weight: 600;
      flex-shrink: 0; position: relative;
    }
    .im-rail-avatar img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
    .im-rail-avatar.is-notif-pinned {
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--im-accent);
    }
    .im-rail-avatar-badge {
      position: absolute; top: -4px; right: -6px;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: var(--im-danger); color: #fff;
      font-size: 11px; line-height: 18px; text-align: center;
      border-radius: 9px; font-weight: 600;
      box-shadow: 0 0 0 2px var(--im-rail-bg);
      pointer-events: none; z-index: 2;
    }
    .im-rail-toggle {
      width: 28px; height: 28px; border-radius: 50%;
      border: 1.5px solid var(--im-text-2); background: transparent;
      color: var(--im-text-2); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      padding: 0; transition: background 0.15s; flex-shrink: 0;
    }
    .im-rail-toggle:hover { background: rgba(255,255,255,0.7); }
    .im-rail-toggle svg { width: 15px; height: 15px; }
    .__ROOT_CLASS__.im-nav2-open .im-rail-toggle { background: #fff; }
    /* 与下方 rail-item 同左右 inset，无底色，避免「假搜索条」感 */
    .im-rail-search { padding: 0 0 8px; flex-shrink: 0; }
    .im-rail-search form {
      display: flex; align-items: center; gap: 12px;
      height: 36px; padding: 0 12px;
      margin: 0;
      background: transparent !important;
      border: none;
      border-radius: 0;
      box-shadow: none;
      color: var(--im-text-3);
      font-size: 15px;
    }
    .im-rail-search form:focus-within { color: var(--im-text); }
    .im-rail-search svg {
      width: 20px; height: 20px; flex-shrink: 0;
      color: var(--im-text-2);
    }
    .im-rail-search input {
      border: none !important; outline: none !important;
      background: transparent !important;
      box-shadow: none !important;
      width: 100%; min-width: 0;
      height: 100%;
      padding: 0;
      font-size: 15px; line-height: 1.2;
      color: var(--im-text);
      font-family: var(--im-font);
      -webkit-appearance: none;
      appearance: none;
    }
    .im-rail-search input::placeholder { color: var(--im-text-3); }
    .im-rail-search input::-webkit-search-decoration,
    .im-rail-search input::-webkit-search-cancel-button,
    .im-rail-search input::-webkit-search-results-button { display: none; }
    .im-rail-items { display: flex; flex-direction: column; gap: 4px; overflow-y: auto; flex: 1; min-height: 0; }
    .im-rail-items::-webkit-scrollbar { display: none; }
    .im-rail-bottom {
      margin-top: auto; flex-shrink: 0; padding-top: 8px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .im-dark-toggle {
      cursor: pointer !important;
      width: 100%; border: none; background: transparent;
      font: inherit; text-align: left;
    }
    .im-dark-toggle:hover { background: rgba(255,255,255,0.55); }
    .im-dark-toggle.is-on {
      color: var(--im-accent); background: var(--im-accent-soft); font-weight: 600;
    }
    .im-dark-toggle.is-on svg { color: var(--im-accent); }
    .im-rail-item {
      display: flex; align-items: center; gap: 12px;
      height: 44px; padding: 0 12px;
      border-radius: 10px;
      color: var(--im-text); font-size: 15px;
      position: relative; flex-shrink: 0;
      cursor: default; user-select: none;
    }
    .im-rail-item svg { width: 20px; height: 20px; color: var(--im-text-2); flex-shrink: 0; }
    .im-rail-item.active {
      background: #fff; font-weight: 600;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .im-rail-item.active svg { color: var(--im-accent); }
    .im-rail-badge {
      margin-left: auto;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: var(--im-danger); color: #fff;
      font-size: 11px; line-height: 18px; text-align: center;
      border-radius: 9px; font-weight: 500;
    }

    /* ---------- 分类色点（右栏分类 tab 使用） ---------- */
    .im-nav2-cat-dot {
      width: 10px; height: 10px; border-radius: 3px;
      flex-shrink: 0; margin: 0 4px;
    }

    /* ---------- 中栏置顶横排 ---------- */
    .im-list-pins {
      display: flex; gap: 14px;
      padding: 4px 16px 12px;
      overflow-x: auto; flex-shrink: 0;
    }
    .im-list-pins::-webkit-scrollbar { display: none; }
    .im-pin {
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      text-decoration: none !important; border: none !important;
      width: 52px; flex-shrink: 0; cursor: pointer;
    }
    .im-pin-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 600;
      overflow: hidden;
    }
    .im-pin-avatar.is-text-avatar {
      box-sizing: border-box;
      padding: 2px;
      text-align: center;
    }
    .im-pin-avatar .im-avatar-text {
      line-height: 1.05; font-weight: 600;
      overflow: hidden; word-break: break-all;
      font-size: 9px;
    }
    .im-pin-avatar .im-avatar-text[data-len="3"] { font-size: 11px; }
    .im-pin-avatar .im-avatar-text[data-len="4"] {
      font-size: 10px; line-height: 1.15;
      width: 2.2em; text-align: center;
    }
    .im-pin-avatar .im-avatar-text[data-len="5"] { font-size: 8px; }
    .im-pin-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .im-pin-name {
      font-size: 11px; color: var(--im-text-2);
      max-width: 52px; overflow: hidden;
      white-space: nowrap; text-overflow: ellipsis;
    }

    /* ---------- 聊天 header 头像与 tab 条（飞书：药丸 tab + 标题旁元信息） ---------- */
    .im-chat-head-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .im-chat-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 600;
    }
    /* 头像图占满容器：无此规则 img 按原尺寸渲染，会在小容器里被裁成局部放大 */
    .im-chat-avatar img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
    .im-chat-tabs {
      height: 38px; flex-shrink: 0;
      background: var(--im-bg);
      display: flex; align-items: center; gap: 6px;
      padding: 0 20px 6px;
    }
    .im-chat-tab {
      font-size: 13px; color: var(--im-text-2);
      text-decoration: none !important; border: none !important;
      cursor: pointer; position: relative;
      height: 28px; padding: 0 10px; border-radius: 8px;
      display: inline-flex; align-items: center; gap: 5px;
    }
    .im-chat-tab svg { width: 15px; height: 15px; flex-shrink: 0; }
    .im-chat-tab:hover { background: var(--im-hover); }
    .im-chat-tab.active {
      background: var(--im-accent-soft);
      color: var(--im-accent); font-weight: 500;
    }
    .im-chat-tab .im-nav2-cat-dot { width: 8px; height: 8px; border-radius: 2px; margin: 0; }

    /* ---------- 栏间拖拽调宽 ---------- */
    .im-list-resizer,
    .im-rail-resizer {
      position: fixed;
      top: 0; bottom: 0;
      width: 9px;
      transform: translateX(-50%);
      cursor: col-resize;
      touch-action: none;
    }
    .im-list-resizer {
      left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-strip) + var(--im-list));
      z-index: 440; /* 高于聊天面板(420)，低于通知浮层 */
    }
    .im-rail-resizer {
      left: var(--im-nav);
      z-index: 405; /* 高于导航栏(400)，低于通知浮层 */
    }
    html.im-nav2-open .im-rail-resizer { display: none; } /* 抽屉展开时避免与原生侧栏重叠 */
    .im-list-resizer::after,
    .im-rail-resizer::after {
      content: "";
      position: absolute;
      top: 0; bottom: 0; left: 50%;
      width: 2px;
      transform: translateX(-50%);
      background: var(--im-border);
      transition: background 0.15s;
    }
    .im-list-resizer:hover::after,
    .im-list-resizer.dragging::after,
    .im-rail-resizer:hover::after,
    .im-rail-resizer.dragging::after { background: var(--im-accent); }
    html:not(.__ROOT_CLASS__) .im-list-resizer,
    html:not(.__ROOT_CLASS__) .im-rail-resizer { display: none; }
    body.im-col-resizing,
    body.im-col-resizing * {
      cursor: col-resize !important;
      user-select: none !important;
    }
    @media (max-width: 1000px) {
      .im-list-resizer { display: none; }
    }

    /* ---------- 隐藏原生主内容（三栏路由） ---------- */
    .__ROOT_CLASS__.__LOCK_CLASS__ body { overflow: hidden !important; }
    .__ROOT_CLASS__.__LOCK_CLASS__ #main-outlet > * {
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
    }

    /* ---------- 中栏：会话列表 ---------- */
    .im-list-panel {
      position: fixed;
      top: var(--im-header-h);
      left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-strip));
      width: var(--im-list);
      bottom: 0;
      background: var(--im-bg);
      border-right: 1px solid var(--im-border);
      display: flex;
      flex-direction: column;
      z-index: 200;
      font-family: var(--im-font);
    }
    .im-list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px 8px;
      flex-shrink: 0;
    }
    .im-list-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--im-text);
      display: flex; align-items: center; gap: 8px;
    }
    .im-list-title svg { width: 17px; height: 17px; color: var(--im-text-2); }
    .im-list-actions { display: flex; gap: 6px; }
    .im-list-nav-toggle[aria-expanded="true"] { color: var(--im-accent); background: var(--im-accent-soft); }
    .im-list-nav {
      display: none !important;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 12px 10px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--im-border);
    }
    .im-list-nav.open,
    .im-list-panel.im-list-nav-open .im-list-nav {
      display: flex !important;
    }
    .im-list-nav a {
      display: inline-flex; align-items: center;
      height: 28px; padding: 0 10px;
      border-radius: 14px;
      font-size: 12px; line-height: 1;
      color: var(--im-text-2) !important;
      text-decoration: none !important;
      border: 1px solid var(--im-border) !important;
      background: var(--im-bg);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .im-list-nav a:hover {
      background: var(--im-hover);
      color: var(--im-text) !important;
    }
    .im-list-nav a.active {
      background: var(--im-accent-soft);
      color: var(--im-accent) !important;
      border-color: #C2D4FF !important;
      font-weight: 500;
    }
    .im-icon-btn {
      width: 32px; height: 32px;
      border: none; border-radius: 8px;
      background: transparent; color: var(--im-text-2);
      cursor: pointer; display: inline-flex;
      align-items: center; justify-content: center;
      transition: background 0.15s;
      padding: 0;
    }
    .im-icon-btn:hover { background: var(--im-hover); }
    .im-icon-btn svg { width: 18px; height: 18px; }
    .im-list-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; }
    .im-list-body::-webkit-scrollbar { width: 6px; }
    .im-list-body::-webkit-scrollbar-thumb { background: var(--im-border-strong); border-radius: 3px; }

    .im-conv {
      display: flex; gap: 12px;
      padding: 12px 16px;
      position: relative;
      text-decoration: none !important;
      cursor: pointer;
      transition: background 0.15s;
      border: none !important;
    }
    .im-conv:hover { background: var(--im-hover); }
    .im-conv.active { background: var(--im-active); }
    .im-conv-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 15px; font-weight: 600;
    }
    /* 伪装文字头像：保持圆形；实心 / 空心；字数 3～5 */
    .im-conv-avatar.is-text-avatar {
      box-sizing: border-box;
      padding: 3px;
      letter-spacing: 0;
      text-align: center;
    }
    .im-conv-avatar .im-avatar-text {
      line-height: 1.05; font-weight: 600;
      overflow: hidden;
      word-break: break-all;
      max-width: 100%;
      font-size: 10px;
    }
    .im-conv-avatar .im-avatar-text[data-len="3"] { font-size: 12px; }
    /* 四字：两行，每行 2 个 */
    .im-conv-avatar .im-avatar-text[data-len="4"] {
      font-size: 11px;
      line-height: 1.15;
      width: 2.2em;
      text-align: center;
    }
    .im-conv-avatar .im-avatar-text[data-len="5"] { font-size: 9px; }
    .im-conv-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .im-mask-avatar-toggle.is-on {
      color: var(--im-accent); background: var(--im-accent-soft);
    }
    .im-conv-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .im-conv-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .im-conv-name {
      font-size: 14px; font-weight: 500; color: var(--im-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .im-conv-time { font-size: 12px; color: var(--im-text-3); flex-shrink: 0; }
    .im-conv-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .im-conv-msg {
      font-size: 13px; color: var(--im-text-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .im-conv-badge {
      /* 未读数压头像右上角（行 padding 16/12 + 头像 40 → 压角） */
      position: absolute; top: 7px; left: 48px; right: auto;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: var(--im-danger); color: #fff;
      font-size: 11px; line-height: 18px; text-align: center;
      border-radius: 9px; flex-shrink: 0;
    }
    .im-list-status {
      padding: 14px; text-align: center;
      font-size: 12px; color: var(--im-text-3);
    }

    /* ---------- 右栏：聊天详情 ---------- */
    .im-chat-panel {
      position: fixed;
      top: var(--im-header-h);
      left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-strip) + var(--im-list));
      right: 0; bottom: 0;
      background: var(--im-chat-bg);
      display: flex; flex-direction: column;
      z-index: 420;
      font-family: var(--im-font);
    }
    .im-chat-header {
      height: 56px; flex-shrink: 0;
      background: var(--im-bg);
      border-bottom: 1px solid var(--im-border);
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 0 20px; gap: 12px;
    }
    .im-chat-titles { min-width: 0; }
    .im-chat-title {
      font-size: 16px; font-weight: 600; color: var(--im-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .im-chat-sub { font-size: 12px; color: var(--im-text-3); margin-top: 1px; }
    .im-chat-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .im-chat-body {
      flex: 1; overflow-y: auto;
      padding: 20px 24px;
      display: flex; flex-direction: column; gap: 16px;
      overscroll-behavior: contain;
    }
    .im-chat-body::-webkit-scrollbar { width: 6px; }
    .im-chat-body::-webkit-scrollbar-thumb { background: var(--im-border-strong); border-radius: 3px; }

    .im-msg { display: flex; gap: 10px; max-width: 78%; }
    .im-msg-other { align-self: flex-start; }
    .im-msg-me { align-self: flex-end; flex-direction: row-reverse; }
    .im-msg-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 14px; font-weight: 600;
    }
    .im-msg-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .im-msg-me .im-msg-avatar { display: none; }
    .im-msg-content { min-width: 0; display: flex; flex-direction: column; position: relative; }
    .im-msg-me .im-msg-content { align-items: flex-end; }
    .im-msg-name { font-size: 12px; color: var(--im-text-3); margin-bottom: 4px; }
    .im-msg-me .im-msg-name { display: none; }
    .im-msg-bubble {
      padding: 10px 14px;
      font-size: 14px; line-height: 1.6;
      color: var(--im-text);
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .im-msg-other .im-msg-bubble {
      background: var(--im-bubble-other);
      border-radius: 2px 8px 8px 8px;
    }
    .im-msg-me .im-msg-bubble {
      background: var(--im-bubble-me);
      border-radius: 8px 2px 8px 8px;
    }
    .im-msg-bubble p { margin: 0 0 8px; }
    .im-msg-bubble p:last-child { margin-bottom: 0; }
    .im-msg-bubble img { max-width: 100%; border-radius: 6px; }
    .im-msg-bubble pre {
      background: rgba(127,127,127,0.12);
      padding: 8px 10px; border-radius: 6px;
      overflow-x: auto; font-size: 13px;
    }
    .im-msg-bubble code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .im-msg-bubble blockquote {
      margin: 0 0 8px; padding: 4px 10px;
      border-left: 3px solid var(--im-accent);
      background: rgba(51,112,255,0.06);
      border-radius: 0 6px 6px 0;
    }
    .im-msg-bubble a { color: var(--im-accent); }
    .im-msg-meta {
      font-size: 11px; color: var(--im-text-3);
      margin-top: 4px; display: flex; gap: 8px; align-items: center;
    }
    .im-msg-time-sep {
      align-self: center;
      font-size: 12px; color: var(--im-text-3);
      padding: 2px 10px;
    }
    .im-msg-tools {
      position: absolute; top: -14px; right: 0; z-index: 5;
      display: flex; align-items: center; gap: 2px;
      background: var(--im-bg);
      border: 1px solid var(--im-border);
      border-radius: 8px;
      padding: 2px;
      box-shadow: 0 2px 8px rgba(31, 35, 41, 0.1);
      opacity: 0; visibility: hidden;
      transition: opacity 0.15s ease;
    }
    .im-msg:hover .im-msg-tools { opacity: 1; visibility: visible; }
    .im-msg-me .im-msg-tools { right: auto; left: 0; }
    .im-msg-tool {
      width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; cursor: pointer;
      border-radius: 6px; color: var(--im-text-2);
      padding: 0;
    }
    .im-msg-tool svg { width: 15px; height: 15px; }
    .im-msg-tool:hover { background: var(--im-hover); color: var(--im-accent); }
    .im-msg-tool.liked { color: var(--im-accent); }

    .im-chat-empty, .im-chat-error, .im-chat-loading {
      margin: auto;
      display: flex; flex-direction: column;
      align-items: center; gap: 10px;
      color: var(--im-text-3); font-size: 14px;
      text-align: center; padding: 40px 20px;
    }
    .im-chat-empty svg, .im-chat-error svg {
      width: 56px; height: 56px; opacity: 0.5;
    }
    .im-empty-btn {
      margin-top: 6px;
      border: 1px solid var(--im-border-strong);
      background: var(--im-bg); color: var(--im-text-2);
      border-radius: 6px; height: 32px; padding: 0 14px;
      font-size: 13px; cursor: pointer; font-family: var(--im-font);
    }
    .im-empty-btn:hover { background: var(--im-hover); }

    /* ---------- 右栏底部：IM 输入框 ---------- */
    .im-chat-compose {
      position: relative;
      z-index: 430;
      flex-shrink: 0;
      margin: 0 16px 14px;
      border: 1px solid var(--im-border-strong);
      border-radius: 10px;
      background: var(--im-bg);
      display: flex;
      flex-direction: column;
      padding: 10px 12px 8px;
      font-family: var(--im-font);
      transition: border-color 0.15s, background 0.15s;
      pointer-events: auto !important;
    }
    .im-chat-compose.focused,
    .im-chat-compose:hover {
      border-color: #C2D4FF;
      background: var(--im-accent-soft);
    }
    .im-chat-compose.busy { border-color: #C2D4FF; }
    .im-chat-compose.error {
      border-color: #F5C6C2;
      background: #FFF1F0;
    }
    .im-chat-panel[data-empty="1"] .im-chat-compose { display: none; }
    .im-composer-input {
      width: 100%;
      min-height: 24px;
      max-height: 160px;
      resize: none;
      border: none;
      background: transparent;
      color: var(--im-text);
      font-size: 14px;
      line-height: 1.45;
      outline: none;
      padding: 0;
      margin: 0 0 6px;
      font-family: inherit;
    }
    .im-composer-input::placeholder { color: var(--im-text-3); }
    .im-composer-target {
      display: none;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--im-accent);
      margin-bottom: 6px;
    }
    .im-composer-target.active { display: flex; }
    .im-composer-target button {
      background: transparent; border: none; color: inherit; cursor: pointer;
      padding: 0; font-size: 12px;
    }
    .im-composer-tools {
      display: flex; align-items: center; gap: 6px;
    }
    .im-composer-tools .spacer { flex: 1; }
    .im-composer-tools .im-composer-status {
      font-size: 12px; color: var(--im-text-3);
      max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .im-composer-tools .im-composer-status.error { color: var(--im-danger); }
    .im-composer-tools .im-composer-status.busy { color: var(--im-accent); }
    .im-composer-tools .im-composer-status.success { color: #2EA44F; }
    .im-composer-tools .im-icon-btn {
      width: 28px; height: 28px;
      border: none; border-radius: 6px;
      background: transparent; color: var(--im-text-3);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      padding: 0;
    }
    .im-composer-tools .im-icon-btn:hover { background: var(--im-hover); color: var(--im-text); }
    .im-composer-tools .im-icon-btn svg { width: 18px; height: 18px; }
    .im-composer-send {
      height: 28px; padding: 0 14px;
      border: none; border-radius: 6px;
      background: var(--im-accent); color: #fff;
      font-size: 13px; cursor: pointer;
      opacity: 1; transition: opacity 0.15s;
    }
    .im-composer-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .im-composer-send:hover:not(:disabled) { filter: brightness(1.05); }
    .im-composer-file { display: none; }

    /* 锁定态：原生主区不要抢走点击；关闭态 composer 直接隐藏 */
    .__ROOT_CLASS__.__LOCK_CLASS__ #main-outlet-wrapper,
    .__ROOT_CLASS__.__LOCK_CLASS__ #main-outlet {
      pointer-events: none !important;
    }
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control:not(.open):not(.fullscreen):not(.edit-title) {
      display: none !important;
      pointer-events: none !important;
      z-index: 0 !important;
    }
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control.open,
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control.edit-title,
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control.fullscreen {
      display: block !important;
      left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-strip) + var(--im-list)) !important;
      right: 0 !important;
      width: auto !important;
      max-width: none !important;
      z-index: 600 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      border-radius: 12px 12px 0 0 !important;
      box-shadow: 0 -8px 28px rgba(0,0,0,0.12) !important;
    }
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control .reply-area {
      max-width: none !important;
      padding-left: 20px !important;
      padding-right: 20px !important;
    }

    /* ---------- native 模式悬浮恢复钮 ---------- */
    .im-mode-fab {
      position: fixed; right: 20px; bottom: 20px; z-index: 10000;
      width: 44px; height: 44px; border-radius: 50%;
      background: #3370FF; color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(51,112,255,0.4);
    }
    .im-mode-fab svg { width: 22px; height: 22px; }

    /* ---------- splash ---------- */
    .__ROOT_CLASS__ #d-splash { background: var(--im-bg) !important; }
    .__ROOT_CLASS__ #d-splash .preloader-image { display: none !important; }
    .__ROOT_CLASS__ #d-splash .splash-logo-container {
      width: 96px !important; height: 96px !important;
      background-image: var(--im-splash-logo) !important;
      background-size: contain !important;
      background-repeat: no-repeat !important;
      animation: none !important;
    }
    .__ROOT_CLASS__ #d-splash .dots { background-color: #3370FF !important; filter: none !important; }

    /* ---------- 窄屏降级 ---------- */
    @media (max-width: 1280px) {
      .__ROOT_CLASS__ { --im-list: 320px; }
    }
    @media (max-width: 1000px) {
      .__ROOT_CLASS__ { --im-nav2w: 0px !important; --im-strip: 0px !important; }
      .im-strip { display: none; }
      .__ROOT_CLASS__.__LOCK_CLASS__ .im-list-panel { width: calc(100% - var(--im-nav)); left: var(--im-nav); }
      .__ROOT_CLASS__.__LOCK_CLASS__.im-topic-open .im-list-panel { display: none; }
      .__ROOT_CLASS__.__LOCK_CLASS__:not(.im-topic-open) .im-chat-panel { display: none; }
      .__ROOT_CLASS__.__LOCK_CLASS__ .im-chat-panel { left: var(--im-nav); }
      .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control { left: calc(var(--im-nav) + 12px) !important; right: 12px !important; }
    }

    /* ---------- 深色模式 token + 硬编码覆盖 ---------- */
    .__ROOT_CLASS__.__DARK_CLASS__ {
      color-scheme: dark !important;
      --im-accent: #4C82FF;
      --im-accent-soft: #1A2A4D;
      --im-nav2-bg: #1B1F26;
      --im-nav2-border: #2A3038;
      --im-text: #E5E6EB;
      --im-text-2: #A0A6B0;
      --im-text-3: #7B828C;
      --im-bg: #171A1F;
      --im-chat-bg: #12151A;
      --im-hover: #22272E;
      --im-active: #243148;
      --im-bubble-other: #2A2F36;
      --im-bubble-me: #1A2F55;
      --im-border: #2A3038;
      --im-border-strong: #3A424C;
      --im-danger: #F54840;
      --im-rail-bg: #1B2230;
      --im-strip-bg: #171A1F;
      --header_background: #171A1F;
      --header_primary: var(--im-text);
      --secondary: var(--im-bg);
      --primary: var(--im-text);
      --primary-medium: var(--im-text-2);
      --primary-low: var(--im-text-3);
      --d-hover: var(--im-hover);
    }
    html.__ROOT_CLASS__.__DARK_CLASS__,
    html.__ROOT_CLASS__.__DARK_CLASS__ body {
      color-scheme: dark !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-toggle:hover {
      background: rgba(255,255,255,0.08);
    }
    .__ROOT_CLASS__.__DARK_CLASS__.im-nav2-open .im-rail-toggle {
      background: #2A3140;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-dark-toggle:hover {
      background: rgba(255,255,255,0.08);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-item.active {
      background: #2A3140;
      box-shadow: none;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-panel,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-header,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-body {
      background: var(--im-bg);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-panel,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-header {
      background: var(--im-chat-bg);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-header {
      border-bottom-color: var(--im-border);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-header {
      border-bottom-color: var(--im-border);
    }
    html.__ROOT_CLASS__.__DARK_CLASS__ body .sidebar-wrapper {
      background-color: var(--im-nav2-bg) !important;
      --primary: var(--im-text);
      --primary-medium: var(--im-text-2);
      --primary-low: var(--im-text-3);
      --primary-low-mid: #6B7280;
      --primary-very-low: #22272E;
      --primary-50: #1B1F26;
      --primary-100: #22272E;
      --primary-200: #2A3038;
      --primary-300: #3A424C;
      --secondary: var(--im-nav2-bg);
      --tertiary: var(--im-accent);
      --quaternary: var(--im-accent);
      --d-hover: var(--im-hover);
      --d-sidebar-background: var(--im-nav2-bg);
      --d-sidebar-border-color: var(--im-border);
      color: var(--im-text);
    }
    .__ROOT_CLASS__.__DARK_CLASS__.im-notif-open .user-menu.im-user-menu-float,
    .__ROOT_CLASS__.__DARK_CLASS__.im-notif-open .user-menu.revamped.menu-panel.im-user-menu-float,
    .__ROOT_CLASS__.__DARK_CLASS__.im-notif-open .user-menu.menu-panel.im-user-menu-float {
      background: var(--im-bg) !important;
      color: var(--im-text) !important;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45) !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-avatar.is-notif-pinned {
      box-shadow: 0 0 0 2px var(--im-rail-bg), 0 0 0 4px var(--im-accent);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-compose.error {
      border-color: #7A3A3A;
      background: #2A1A1A;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-compose:hover,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-compose.focused,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-compose.busy {
      border-color: #3B5F8A;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer-input { color: var(--im-text); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer-tools .im-icon-btn:hover { background: rgba(255,255,255,0.08); }
  `;
  const CSS_CORE_EXTRA = String.raw`.im-nav2-cat-dot {
width: 10px; height: 10px; border-radius: 3px;
      flex-shrink: 0; margin: 0 4px;
}

.im-chat-title-row {
display: flex; align-items: center; gap: 8px; min-width: 0;
}

.im-chat-count {
display: inline-flex; align-items: center; gap: 2px;
      font-size: 12px; color: var(--im-text-3); font-weight: 400; flex-shrink: 0;
}

.im-chat-count svg {
width: 13px; height: 13px;
}

/* 头部第二组元信息（楼层数：当前位置/总楼数），点击弹出选择楼层 */
.im-chat-metrics {
display: inline-flex; align-items: center; gap: 2px;
      font-size: 12px; color: var(--im-text-3); font-weight: 400; flex-shrink: 0;
      cursor: pointer; user-select: none;
}
.im-chat-metrics:hover { color: var(--im-text-2); }
.im-metrics-sep { margin: 0 1px; opacity: .6; }

.im-chat-metrics svg {
width: 13px; height: 13px;
}

.im-chat-count + .im-chat-metrics {
padding-left: 8px;
      border-left: 1px solid var(--im-border);
      margin-left: 0;
}

.im-chat-chips {
display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;
}

.im-chat-chip {
display: inline-flex; align-items: center; gap: 3px;
      height: 18px; padding: 0 5px; border-radius: 4px;
      font-size: 11px; line-height: 1; white-space: nowrap;
      color: var(--im-blue) !important; background: var(--im-blue-soft);
      border: 1px solid #C9E2FF !important;
      text-decoration: none !important; cursor: pointer;
}

.im-chat-chip .im-nav2-cat-dot {
width: 8px; height: 8px; border-radius: 2px; margin: 0;
}

.im-list-chips {
display: inline-flex; align-items: center; gap: 2px;
      background: #E7EAF1; border-radius: 14px; padding: 2px;
      flex-shrink: 0;
}

.im-list-chips:empty {
display: none;
}

.im-chip {
height: 24px; padding: 0 12px; border: 0; border-radius: 12px;
      background: transparent; color: var(--im-text-2); font-size: 13px; cursor: pointer;
      font-family: var(--im-font);
      display: inline-flex; align-items: center; gap: 3px;
      white-space: nowrap; flex-shrink: 0;
}

.im-chip .n {
font-weight: 600;
}

.im-chip.active {
background: #FFFFFF; color: var(--im-text); font-weight: 600; box-shadow: 0 1px 3px rgba(31,35,41,.12);
}

.im-chip-icon {
width: 26px; height: 26px; border-radius: 50%; background: #E7EAF1;
      border: 0; display: grid; place-items: center; color: var(--im-text-2); cursor: pointer; padding: 0;
}

.im-chip-icon:hover {
background: #DCE1EA;
}

.im-chip-icon svg {
width: 14px; height: 14px;
}

.im-conv-tag {
display: inline-flex; align-items: center;
      height: 16px; padding: 0 5px; border-radius: 4px;
      font-size: 10px; line-height: 1; white-space: nowrap; flex-shrink: 0;
      color: #2F88FF; background: #E8F3FF;
      border: 1px solid #A8CFFF;
}

.im-msg-bubble blockquote {
margin: 0 0 8px; padding: 4px 10px;
      border-left: 3px solid var(--im-accent);
      background: rgba(51,112,255,0.06);
      border-radius: 0 6px 6px 0;
}

.im-msg-meta {
font-size: 11px; color: var(--im-text-3);
      margin-top: 4px; display: flex; gap: 8px; align-items: center;
}

.im-msg-tools {
position: absolute; top: -14px; right: 0; z-index: 5;
      display: flex; align-items: center; gap: 2px;
      background: var(--im-bg);
      border: 1px solid var(--im-border);
      border-radius: 8px;
      padding: 2px;
      box-shadow: 0 2px 8px rgba(31, 35, 41, 0.1);
      opacity: 0; visibility: hidden;
      transition: opacity 0.15s ease;
}

.im-msg:hover .im-msg-tools {
opacity: 1; visibility: visible;
}

.im-msg-me .im-msg-tools {
right: auto; left: 0;
}

.im-msg-tool {
width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; cursor: pointer;
      border-radius: 6px; color: var(--im-text-2);
      padding: 0;
}

.im-msg-tool svg {
width: 15px; height: 15px;
}

.im-msg-tool:hover {
background: var(--im-hover); color: var(--im-accent);
}

.im-msg-tool.liked {
color: var(--im-accent);
}

.im-empty-btn {
margin-top: 6px;
      border: 1px solid var(--im-border-strong);
      background: var(--im-bg); color: var(--im-text-2);
      border-radius: 6px; height: 32px; padding: 0 14px;
      font-size: 13px; cursor: pointer; font-family: var(--im-font);
}

.im-empty-btn:hover {
background: var(--im-hover);
}

.im-composer {
background: transparent; border-top: none;
      padding: 4px 12px 12px; flex-shrink: 0;
}

.im-composer-card {
background: #FFFFFF;
      border: 1px solid var(--im-border);
      border-radius: 12px;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
}

.im-composer-card:hover {
border-color: #C2D4FF;
      box-shadow: 0 2px 10px rgba(26,135,255,.08);
}

.im-composer-tools {
/* 三皮肤统一格式：工具行在输入区上方，顶距一致 */
display: flex; align-items: center; gap: 0; padding: 10px 10px 2px;
}

.im-composer-tools .spacer {
flex: 1;
}

.im-composer-tools .hint {
font-size: 11px; color: var(--im-text-4); margin-right: 8px;
}

.im-composer-tools .im-composer-status {
font-size: 11px; color: var(--im-text-4);
      max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-right: 8px;
}

.im-composer-tools .im-composer-status.error {
color: var(--im-danger);
}

.im-composer-tools .im-composer-status.busy {
color: var(--im-accent);
}

.im-composer-tools .im-composer-status.success {
color: #00C56C;
}

.im-send-btn {
height: 26px; padding: 0 14px; border: 0; border-radius: 5px;
      background: #C5C9D0; color: #fff; font-size: 12px; cursor: pointer;
      font-family: var(--im-font);
      transition: background 0.15s;
}

.im-send-btn:not(:disabled) {
background: var(--im-accent);
}

.im-send-btn:disabled {
cursor: not-allowed;
}

.im-chat-tools {
margin-left: auto; display: flex; gap: 2px;
}

.im-chat-tools .dot,
    .im-composer-tools .dot {
position: absolute; top: 6px; right: 6px; width: 6px; height: 6px;
      background: var(--im-danger); border-radius: 50%;
}

.im-chat-compose {
position: relative;
      z-index: 430;
      flex-shrink: 0;
      margin: 0;
      min-height: 44px; /* 三皮肤统一：贴卡底，单行时不留大片空白 */
      height: auto;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--im-text);
      display: block;
      padding: 8px 14px 10px;
      font-size: 14px;
      font-family: var(--im-font);
      transition: color 0.15s;
      pointer-events: auto !important;
      width: 100%;
      text-align: left;
      outline: none;
      overflow-y: auto;
      max-height: 160px;
      cursor: text;
      word-break: break-word;
      white-space: pre-wrap;
}

/* contenteditable 占位符（容器有块级子元素，用 has-content 类控制）；
   绝对定位浮层：内联 ::before 会被块级子元素挤成独立一行 */
.im-chat-compose:not(.has-content)::before {
content: attr(data-placeholder);
      position: absolute;
      color: var(--im-text-4);
      pointer-events: none;
}

/* 块级实时渲染：聚焦块显示原文，其余块渲染为富文本 */
.im-md-block {
min-height: 1.5em;
}
.im-md-block p { margin: 0; }
.im-md-block h2, .im-md-block h3, .im-md-block h4, .im-md-block h5 {
margin: 3px 0 2px;
      line-height: 1.35;
}
.im-md-block h2 { font-size: 1.35em; }
.im-md-block h3 { font-size: 1.2em; }
.im-md-block h4, .im-md-block h5 { font-size: 1.05em; }
.im-md-block blockquote {
margin: 2px 0;
      padding: 1px 0 1px 8px;
      border-left: 3px solid var(--im-border, rgba(127,127,127,0.35));
      color: var(--im-text-3, inherit);
}
.im-md-block pre {
margin: 3px 0;
      padding: 8px;
      border-radius: 6px;
      background: rgba(127,127,127,0.12);
      overflow-x: auto;
      font-size: 12px;
}
.im-md-block code {
font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.im-md-block :not(pre) > code {
background: rgba(127,127,127,0.15);
      border-radius: 4px;
      padding: 1px 4px;
}
.im-md-block ul, .im-md-block ol {
margin: 2px 0;
      padding-left: 20px;
}
.im-md-block a { color: var(--im-accent); text-decoration: none; }
.im-md-block a:hover { text-decoration: underline; }

/* 常用语法扩展：图片 / emoji / 表格 / 分割线 / 任务列表 / 剧透 / details / 引用块 / 投票占位 / 脚注 / 日期 */
.im-md-block img.im-md-img {
max-width: 100%;
      max-height: 140px;
      border-radius: 6px;
      vertical-align: middle;
}
.im-md-block img.emoji {
width: 1.25em;
      height: 1.25em;
      vertical-align: -0.2em;
}
.im-md-block table.im-md-table {
border-collapse: collapse;
      margin: 3px 0;
      font-size: 12px;
}
.im-md-table th, .im-md-table td {
border: 1px solid var(--im-border, rgba(127,127,127,0.35));
      padding: 2px 8px;
}
.im-md-block hr {
border: 0;
      border-top: 1px solid var(--im-border, rgba(127,127,127,0.35));
      margin: 6px 0;
}
.im-md-block .im-md-task {
list-style: none;
      margin-left: -18px;
}
.im-md-block .im-md-blur {
filter: blur(4px);
      cursor: pointer;
      transition: filter 0.15s;
}
.im-md-block .im-md-blur:hover {
filter: none;
}
.im-md-block .im-md-details summary {
cursor: pointer;
      color: var(--im-accent);
}
.im-md-block .im-md-quote-head {
font-size: 12px;
      color: var(--im-text-4);
      margin-bottom: 2px;
}
.im-md-block .im-md-poll {
border: 1px solid var(--im-border, rgba(127,127,127,0.35));
      border-radius: 6px;
      padding: 4px 10px;
      margin: 3px 0;
}
.im-md-block .im-md-poll-title {
font-size: 12px;
      color: var(--im-text-4);
}
.im-md-block .im-md-footnote {
font-size: 12px;
      color: var(--im-text-3, inherit);
}
.im-md-block .im-md-date {
background: rgba(127,127,127,0.15);
      border-radius: 4px;
      padding: 1px 4px;
      font-size: 12px;
}

/* 预览条：开关式实时渲染，内容复用 .im-md-block 渲染样式 */
.im-compose-preview {
display: none;
      max-height: 120px;
      overflow-y: auto;
      padding: 8px 14px 2px;
      font-size: 13px;
      line-height: 1.5;
      color: var(--im-text-3, inherit);
      border-bottom: 1px dashed var(--im-border, rgba(127,127,127,0.35));
      word-break: break-word;
}

.im-compose-preview.active {
display: block;
}

.im-compose-preview.is-empty::before {
content: "预览";
      color: var(--im-text-4);
}

.im-composer-tools .im-icon-btn.active {
color: var(--im-accent);
}

.im-composer-target {
display: none;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--im-accent);
      padding: 6px 14px 0;
}

.im-composer-target.active {
display: flex;
}

.im-composer-target button {
background: transparent; border: none; color: inherit; cursor: pointer;
      padding: 0; font-size: 12px;
}

.im-composer-file {
display: none;
}

.im-chat-panel[data-empty="1"] .im-composer {
display: none;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-chip.active {
background: #252B38;
      color: var(--im-text);
      box-shadow: none;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-list-chips {
background: #1E222A;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-chip-icon {
background: #1E222A;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-chip-icon:hover {
background: #2A3140;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-composer,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer-card {
background: var(--im-bg) !important;
      border-color: var(--im-border) !important;
      border-top-color: var(--im-border);
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-composer-card:hover {
border-color: #3B5F8A !important;
      box-shadow: 0 2px 10px rgba(0,0,0,.35);
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-composer-box {
background: #1E222A !important;
      border-color: var(--im-border-strong);
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-send-btn {
background: #4A5160;
      color: #fff;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-topic-chip {
color: var(--im-accent);
      background: var(--im-accent-soft);
      border-color: #2F4F7A;
}

.__ROOT_CLASS__ .im-poll-options {
display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      margin-bottom: 10px !important;
}

.__ROOT_CLASS__ .im-poll-option {
position: relative !important;
      display: flex !important;
      align-items: center !important;
      padding: 10px 14px !important;
      border-radius: 8px !important;
      border: 1.5px solid transparent !important;
      cursor: pointer !important;
      overflow: hidden !important;
      transition: all 0.18s ease !important;
}

.__ROOT_CLASS__ .im-poll-option:hover {
background: rgba(26, 135, 255, 0.06) !important;
}

.__ROOT_CLASS__ .im-poll-radio {
width: 18px !important;
      height: 18px !important;
      min-width: 18px !important;
      margin-right: 12px !important;
      flex-shrink: 0 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
}

.__ROOT_CLASS__ .im-poll-title {
flex: 1 !important;
      font-size: 13.5px !important;
      font-weight: 500 !important;
      line-height: 1.4 !important;
      z-index: 1 !important;
}

.__ROOT_CLASS__ .im-poll-count {
font-size: 12px !important;
      font-weight: 600 !important;
      margin-left: 10px !important;
      z-index: 1 !important;
      white-space: nowrap !important;
}

.__ROOT_CLASS__ .im-poll-bar {
position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      bottom: 0 !important;
      pointer-events: none !important;
      z-index: 0 !important;
      transition: width 0.35s ease !important;
}

.__ROOT_CLASS__ .im-poll-actions {
display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      margin-top: 12px !important;
      padding-top: 10px !important;
      border-top: 1px dashed rgba(0,0,0,0.08) !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-poll-actions {
border-top-color: rgba(255,255,255,0.1) !important;
}

.__ROOT_CLASS__ .im-poll-submit-btn,
    .__ROOT_CLASS__ .im-poll-undo-btn {
display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 32px !important;
      padding: 0 16px !important;
      border-radius: 6px !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      border: none !important;
      cursor: pointer !important;
      box-sizing: border-box !important;
}

.__ROOT_CLASS__ .im-poll-submit-btn {
background: #1A87FF !important;
      color: #FFFFFF !important;
}

.__ROOT_CLASS__ .im-poll-submit-btn:disabled {
opacity: 0.5 !important;
      cursor: not-allowed !important;
}

.__ROOT_CLASS__ .im-poll-undo-btn {
background: transparent !important;
      border: 1px solid rgba(0,0,0,0.15) !important;
      color: #646A73 !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-poll-undo-btn {
border-color: rgba(255,255,255,0.2) !important;
      color: #A0A5B2 !important;
}

.__ROOT_CLASS__ .im-poll-status-tip {
font-size: 12px !important;
      color: #8F959E !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-poll-status-tip {
color: #8A8F99 !important;
}

.__ROOT_CLASS__ .im-rocket-bar {
display: flex !important;
      flex-wrap: wrap !important;
      align-items: center !important;
      gap: 6px !important;
      margin-top: 6px !important;
      padding: 0 4px !important;
}

.__ROOT_CLASS__ .im-rocket-chip {
display: inline-flex !important;
      align-items: center !important;
      gap: 5px !important;
      padding: 4px 10px 4px 4px !important;
      border-radius: 14px !important;
      background: rgba(0,0,0,0.04) !important;
      border: 1px solid rgba(0,0,0,0.06) !important;
      font-size: 12px !important;
      color: #1F2329 !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
      max-width: 100% !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-rocket-chip {
background: rgba(255,255,255,0.06) !important;
      border-color: rgba(255,255,255,0.08) !important;
      color: #E6E8EB !important;
}

.__ROOT_CLASS__ .im-rocket-chip:hover {
background: rgba(0,0,0,0.08) !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-rocket-chip:hover {
background: rgba(255,255,255,0.1) !important;
}

.__ROOT_CLASS__ .im-rocket-chip.is-my-boost {
padding-right: 4px !important;
}

.__ROOT_CLASS__ .im-rocket-chip.is-my-boost:hover .im-rocket-trash {
display: inline-flex !important;
}

.__ROOT_CLASS__ .im-rocket-avatar-box {
width: 18px !important;
      height: 18px !important;
      min-width: 18px !important;
      border-radius: 50% !important;
      overflow: hidden !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: #E5E6EB !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-rocket-avatar-box {
background: #3A3F4B !important;
}

.__ROOT_CLASS__ .im-rocket-avatar-box img {
width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
}

.__ROOT_CLASS__ .im-rocket-avatar-box .fallback-letter {
width: 100% !important;
      height: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 10px !important;
      color: #fff !important;
}

.__ROOT_CLASS__ .im-rocket-text {
max-width: 200px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      line-height: 1.3 !important;
}

.__ROOT_CLASS__ .im-rocket-trash {
display: none !important;
      width: 18px !important;
      height: 18px !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      margin-left: 2px !important;
      border: none !important;
      background: transparent !important;
      color: #8A8F99 !important;
      cursor: pointer !important;
      border-radius: 50% !important;
}

.__ROOT_CLASS__ .im-rocket-trash:hover {
color: #EF4444 !important;
      background: rgba(239, 68, 68, 0.1) !important;
}

.__ROOT_CLASS__ .im-rocket-btn {
width: 22px !important;
      height: 22px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 50% !important;
      background: rgba(26, 135, 255, 0.1) !important;
      color: #1A87FF !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
}

.__ROOT_CLASS__ .im-rocket-btn:hover {
background: rgba(26, 135, 255, 0.2) !important;
      transform: scale(1.05) !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-rocket-btn {
background: rgba(26, 135, 255, 0.18) !important;
}

.__ROOT_CLASS__ .im-boost-composer {
display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      margin: 8px 0 4px !important;
      padding: 8px 10px !important;
      border-radius: 10px !important;
      background: rgba(0,0,0,0.03) !important;
      border: 1px solid rgba(0,0,0,0.06) !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-boost-composer {
background: rgba(255,255,255,0.04) !important;
      border-color: rgba(255,255,255,0.08) !important;
}

.__ROOT_CLASS__ .im-boost-avatar {
width: 26px !important;
      height: 26px !important;
      min-width: 26px !important;
      border-radius: 50% !important;
      overflow: hidden !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: #E5E6EB !important;
      font-size: 11px !important;
      color: #1F2329 !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-boost-avatar {
background: #3A3F4B !important;
      color: #E6E8EB !important;
}

.__ROOT_CLASS__ .im-boost-avatar img {
width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
}

.__ROOT_CLASS__ .im-boost-input {
flex: 1 !important;
      min-width: 0 !important;
      height: 32px !important;
      padding: 0 10px !important;
      border: 1px solid rgba(0,0,0,0.1) !important;
      border-radius: 16px !important;
      background: #FFFFFF !important;
      color: #1F2329 !important;
      font-size: 13px !important;
      outline: none !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-boost-input {
background: #23262E !important;
      border-color: rgba(255,255,255,0.12) !important;
      color: #E6E8EB !important;
}

.__ROOT_CLASS__ .im-boost-input:focus {
border-color: #1A87FF !important;
}

.__ROOT_CLASS__ .im-boost-emojis {
display: flex !important;
      gap: 4px !important;
      flex-shrink: 0 !important;
}

.__ROOT_CLASS__ .im-boost-btn {
width: 28px !important;
      height: 28px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      flex-shrink: 0 !important;
}

.__ROOT_CLASS__ .im-boost-submit {
background: #1A87FF !important;
      color: #FFFFFF !important;
}

.__ROOT_CLASS__ .im-boost-submit:hover {
background: #0A6FE0 !important;
}

.__ROOT_CLASS__ .im-boost-cancel {
background: transparent !important;
      color: #8A8F99 !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-boost-cancel {
color: #A0A5B2 !important;
}

.__ROOT_CLASS__ .im-boost-btn svg {
width: 16px !important;
      height: 16px !important;
}

.__ROOT_CLASS__ .im-jump-back-btn {
position: absolute !important;
      left: 50% !important;
      bottom: 72px !important;
      transform: translateX(-50%) !important;
      /* 高于各皮肤 .im-chat-compose(430)，低于资料页 .im-prof-frame(440) */
      z-index: 435 !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 6px !important;
      height: 34px !important;
      padding: 0 14px !important;
      border-radius: 17px !important;
      border: none !important;
      background: #1A87FF !important;
      color: #FFFFFF !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      box-shadow: 0 4px 14px rgba(26, 135, 255, 0.35) !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
}

.__ROOT_CLASS__ .im-jump-back-btn:hover {
background: #0A6FE0 !important;
      transform: translateX(-50%) translateY(-1px) !important;
}

.__ROOT_CLASS__ .im-jump-back-close {
margin-left: 4px !important;
      width: 18px !important;
      height: 18px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 50% !important;
      font-size: 12px !important;
      color: rgba(255,255,255,0.85) !important;
}

.__ROOT_CLASS__ .im-jump-back-close:hover {
background: rgba(255,255,255,0.2) !important;
      color: #FFFFFF !important;
}

@keyframes im-msg-pulse {
0% { background-color: transparent; }
      40% { background-color: rgba(26, 135, 255, 0.18); }
      100% { background-color: transparent; }
}

@keyframes im-msg-pulse-dark {
0% { background-color: transparent; }
      40% { background-color: rgba(26, 135, 255, 0.28); }
      100% { background-color: transparent; }
}

.__ROOT_CLASS__ .im-toast {
position: fixed;
      z-index: 100000;
      background: rgba(33, 36, 44, 0.96);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1.4;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
      transform: translateY(0);
      opacity: 1;
      white-space: nowrap;
      box-sizing: border-box;
}

.__ROOT_CLASS__ .im-toast.fade-out {
opacity: 0;
      transform: translateY(-6px);
}

.__ROOT_CLASS__ .im-like-badge {
display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 20px;
      padding: 0 7px;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(0, 0, 0, 0.05);
      color: var(--im-text-3);
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      transition: all 0.18s ease;
      margin-left: 6px;
      vertical-align: middle;
      box-sizing: border-box;
}

.__ROOT_CLASS__ .im-like-badge:hover {
background: rgba(245, 74, 69, 0.08);
      color: #F54A45;
      border-color: rgba(245, 74, 69, 0.2);
}

.__ROOT_CLASS__ .im-like-badge.liked {
background: rgba(245, 74, 69, 0.1) !important;
      border-color: rgba(245, 74, 69, 0.25) !important;
      color: #F54A45 !important;
}

.__ROOT_CLASS__ .im-like-icon {
display: inline-flex;
      align-items: center;
      justify-content: center;
}

.__ROOT_CLASS__ .im-like-icon svg {
width: 12px;
      height: 12px;
      display: block;
}

.__ROOT_CLASS__ .im-like-badge.pop .im-like-icon,
    .__ROOT_CLASS__ .im-msg-tool.pop svg {
animation: im-heart-pop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes im-heart-pop {
0% { transform: scale(1); }
      50% { transform: scale(1.45); }
      100% { transform: scale(1); }
}

.__ROOT_CLASS__ .im-msg-tool.liked {
color: #F54A45 !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-like-badge {
background: #23262E !important;
      border-color: rgba(255, 255, 255, 0.08) !important;
      color: #A0A5B2 !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-like-badge:hover {
background: rgba(245, 74, 69, 0.15) !important;
      color: #FF6B66 !important;
      border-color: rgba(245, 74, 69, 0.3) !important;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-like-badge.liked {
background: rgba(245, 74, 69, 0.2) !important;
      border-color: rgba(245, 74, 69, 0.4) !important;
      color: #FF6B66 !important;
}

.__ROOT_CLASS__ .im-quote-reply {
border-left: 2px solid rgba(0, 0, 0, 0.28);
      padding: 3px 0 3px 8px;
      margin-bottom: 6px;
      cursor: pointer;
      border-radius: 1px;
      transition: background 0.15s, border-color 0.15s;
      user-select: none;
      max-width: 100%;
      overflow: hidden;
}

.__ROOT_CLASS__ .im-quote-reply:hover {
background: rgba(0, 0, 0, 0.04);
      border-left-color: var(--im-blue);
}

.__ROOT_CLASS__ .im-quote-name {
font-size: 12px;
      font-weight: 600;
      color: var(--im-text-2);
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
}

.__ROOT_CLASS__ .im-quote-text {
font-size: 12px;
      color: var(--im-text-3);
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
}

.__ROOT_CLASS__ .im-msg-me .im-quote-reply {
border-left-color: rgba(26, 135, 255, 0.6);
}

.__ROOT_CLASS__ .im-msg-me .im-quote-name {
color: #0A6FE0;
}

.__ROOT_CLASS__ .im-msg-me .im-quote-text {
color: #4A6E9B;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-quote-reply {
border-left-color: rgba(255, 255, 255, 0.25);
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-quote-reply:hover {
background: rgba(255, 255, 255, 0.05);
      border-left-color: var(--im-blue);
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-quote-name {
color: #B0B5BE;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-quote-text {
color: #8A8F99;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-msg-me .im-quote-reply {
border-left-color: rgba(26, 135, 255, 0.7);
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-msg-me .im-quote-name {
color: #4AA2FF;
}

.__ROOT_CLASS__.__DARK_CLASS__ .im-msg-me .im-quote-text {
color: #7AA3D6;
}


    /* ---------- 钉钉式图片浮窗灯箱 ---------- */
    .__ROOT_CLASS__ .im-img-modal {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 100000 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      user-select: none !important;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease !important;
    }
    .__ROOT_CLASS__ .im-img-modal.is-active {
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    .__ROOT_CLASS__ .im-img-modal.is-closing {
      opacity: 0 !important;
      pointer-events: none !important;
    }
    .__ROOT_CLASS__ .im-img-modal-backdrop {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.78) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      z-index: 1 !important;
    }
    .__ROOT_CLASS__ .im-img-modal-toolbar {
      position: absolute !important;
      top: 24px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      z-index: 10 !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      background: rgba(30, 32, 38, 0.85) !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      padding: 6px 12px !important;
      border-radius: 24px !important;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5) !important;
    }
    .__ROOT_CLASS__ .im-img-btn {
      width: 34px !important;
      height: 34px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      border: none !important;
      background: transparent !important;
      color: #D3D6DC !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
      text-decoration: none !important;
      padding: 0 !important;
      box-sizing: border-box !important;
    }
    .__ROOT_CLASS__ .im-img-btn:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      color: #FFFFFF !important;
    }
    .__ROOT_CLASS__ .im-img-btn.im-img-close:hover {
      background: #E02424 !important;
      color: #FFFFFF !important;
    }
    .__ROOT_CLASS__ .im-img-modal-stage {
      position: relative !important;
      z-index: 5 !important;
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
    }
    .__ROOT_CLASS__ .im-img-modal-img {
      max-width: 90vw !important;
      max-height: 86vh !important;
      object-fit: contain !important;
      border-radius: 6px !important;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6) !important;
      cursor: zoom-in;
      transform-origin: center center;
    }

    /* ---------- 原生编辑器嵌入：原地重锚（composer/index.js 切状态类，几何全 CSS 变量驱动） ----------
       不搬 Ember DOM；#reply-control 留在原地由 Glimmer 自管，仅重定位 + 皮肤化。
       :has 门控：IM 面板不在场（或浏览器不支持 :has）时自动退回原生全宽面板。 */
    .__ROOT_CLASS__.im-native-compose body:has(> .im-chat-panel) #reply-control {
      /* var 全带 fallback：任一皮肤变量缺失时 calc 不至于整条失效退化成右下角收缩 */
      left: calc(var(--im-nav, 0px) + var(--im-nav2w, 0px) + var(--im-strip, 0px) + var(--im-list, 0px) + 16px) !important;
      right: 16px !important;
      width: auto !important;
      min-width: min(640px, 55vw) !important;
      top: auto !important;
      bottom: 12px !important;
      height: auto !important;
      max-height: calc(100vh - var(--im-header-h, 40px) - 40px) !important;
      display: flex !important;
      flex-direction: column; /* 纵向列布局：让 .reply-area 撑满卡片高度 */
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      border-radius: 12px !important;
      border: 1px solid var(--im-border) !important;
      background: var(--im-bg) !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16) !important;
      overflow: hidden !important;
      z-index: 950 !important;
      /* transform/translate 不改 left 计算值但会挪视觉位置：一并钉死，防祖先级主题动画位移 */
      transform: none !important;
      translate: none !important;
    }
    /* 发帖（含标题输入框）给足高度：新话题卡片按内容收缩时太矮，没有编辑器观感 */
    .__ROOT_CLASS__.im-native-compose #reply-control:has(#reply-title) {
      min-height: min(520px, calc(100vh - var(--im-header-h, 40px) - 40px)) !important;
    }
    /* 全屏按钮：铺满右侧聊天区（左缘钉在 IM 面板右缘，不盖 IM 列），几何由 composer/index.js 行内校准 */
    .__ROOT_CLASS__.im-native-compose #reply-control.fullscreen {
      border-radius: 0 !important;
      border: none !important;
      box-shadow: none !important;
      max-height: none !important;
    }
    /* 全屏时主题可能在编辑器层挂白色遮罩（伪元素/背景层，活在编辑器 950 层叠上下文里），
       会把 z 更低的左侧两栏整片盖白 —— 关掉编辑器伪元素，并把侧栏/列表抬到编辑器层之上
       压制遮罩。注意聊天面板不能抬：全屏编辑器铺的区域正是它的区域，抬高会把编辑器整个盖住；
       聊天区即使有遮罩也无所谓——编辑器本体是不透明卡片，恰好全盖住该区域 */
    .__ROOT_CLASS__.im-native-compose #reply-control::before,
    .__ROOT_CLASS__.im-native-compose #reply-control::after {
      content: none !important;
      display: none !important;
    }
    .__ROOT_CLASS__.im-native-compose:has(#reply-control.fullscreen) .im-rail,
    .__ROOT_CLASS__.im-native-compose:has(#reply-control.fullscreen) .im-list-panel {
      z-index: 960 !important;
    }
    /* 纵向撑满链：字段行固定高，编辑器吃掉卡片剩余高度（不再在卡片底部留大片空白） */
    .__ROOT_CLASS__.im-native-compose #reply-control .reply-area {
      display: flex !important;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
    }
    .__ROOT_CLASS__.im-native-compose #reply-control .d-editor {
      display: flex !important;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
    }
    .__ROOT_CLASS__.im-native-compose #reply-control .d-editor-textarea-wrapper {
      display: flex !important;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 180px;
    }
    .__ROOT_CLASS__.im-native-compose #reply-control .d-editor-input { flex: 1 1 auto; min-height: 0; height: 100%; }
    /* 非全屏回复卡：输入区紧凑（空态工具条下不留大片空白；标题卡/全屏仍靠 flex 撑满） */
    .__ROOT_CLASS__.im-native-compose #reply-control:not(.fullscreen) .d-editor-textarea-wrapper {
      min-height: 96px;
    }
    /* 输入卡收起，让位给嵌入态编辑器（回复/兜底路径打开原生编辑器时） */
    .__ROOT_CLASS__ .im-composer[data-native="1"] .im-composer-card { display: none !important; }
    /* 编辑器内部和谐化：透明化 + --im-* 变量着色（暗色模式根级翻转变量，自动适配） */
    .__ROOT_CLASS__.im-native-compose #reply-control .reply-area,
    .__ROOT_CLASS__.im-native-compose #reply-control .composer-fields { background: transparent !important; }
    .__ROOT_CLASS__.im-native-compose #reply-control .d-editor { background: transparent; border: none; }
    .__ROOT_CLASS__.im-native-compose #reply-control .d-editor-textarea-wrapper {
      background: transparent; border: none; border-radius: 0;
    }
    /* 输入区兼容两种形态：旧 textarea.d-editor-input 与新版 ProseMirror div.d-editor-input（contenteditable） */
    .__ROOT_CLASS__.im-native-compose #reply-control .d-editor-input {
      background: transparent !important;
      color: var(--im-text) !important;
      font-family: var(--im-font) !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      border: none !important;
      box-shadow: none !important;
    }
    .__ROOT_CLASS__.im-native-compose #reply-control .d-editor-input::placeholder { color: var(--im-text-3) !important; }
    .__ROOT_CLASS__.im-native-compose #reply-control .ProseMirror-container { flex: 1 1 auto; min-height: 0; }
    /* 工具条：轻量化为 IM 图标行观感 */
    .__ROOT_CLASS__.im-native-compose #reply-control .d-overflow-controls { background: transparent; border: none; }
    .__ROOT_CLASS__.im-native-compose #reply-control .d-editor-button-bar {
      background: transparent !important;
      border-bottom: 1px solid var(--im-border) !important;
      padding: 4px 8px !important;
      gap: 2px;
    }
    .__ROOT_CLASS__.im-native-compose #reply-control .d-editor-button-bar button {
      background: transparent !important;
      border: none !important;
      color: var(--im-text-3) !important;
      border-radius: 6px;
    }
    .__ROOT_CLASS__.im-native-compose #reply-control .d-editor-button-bar button:hover {
      background: var(--im-hover) !important;
      color: var(--im-text) !important;
    }
    /* 底部按钮行：提交键换皮肤主色 */
    .__ROOT_CLASS__.im-native-compose #reply-control .save-or-cancel .create {
      background: var(--im-accent) !important;
      border: none !important;
      color: #fff !important;
      border-radius: 8px !important;
      font-size: 13px !important;
      font-weight: 500;
    }
    .__ROOT_CLASS__.im-native-compose #reply-control .save-or-cancel .create:hover { filter: brightness(1.05); }
    .__ROOT_CLASS__.im-native-compose #reply-control .save-or-cancel .cancel {
      background: transparent !important;
      border: none !important;
      color: var(--im-text-3) !important;
    }
    /* 预览窗格 */
    .__ROOT_CLASS__.im-native-compose #reply-control .d-editor-preview-wrapper { background: var(--im-chat-bg) !important; }

    /* ---------- 快捷输入框表情弹层 ---------- */
    .__ROOT_CLASS__ .im-emoji-pop {
      position: fixed;
      z-index: 980;
      display: grid;
      grid-template-columns: repeat(8, 28px);
      gap: 2px;
      padding: 8px;
      border-radius: 12px;
      border: 1px solid var(--im-border);
      background: var(--im-bg);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
    }
    .__ROOT_CLASS__ .im-emoji-pop .im-emoji-item {
      width: 28px; height: 28px; padding: 0;
      border: none; border-radius: 6px; background: transparent;
      font-size: 17px; line-height: 1;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
    }
    .__ROOT_CLASS__ .im-emoji-pop .im-emoji-item:hover { background: var(--im-hover); }
    /* 更多（+）弹层：模板 / 表格 / wrap，纵向菜单 */
    .__ROOT_CLASS__ .im-plus-pop {
      position: fixed;
      z-index: 980;
      display: flex;
      flex-direction: column;
      min-width: 200px;
      max-height: min(60vh, 460px);
      overflow-y: auto;
      padding: 6px;
      border-radius: 12px;
      border: 1px solid var(--im-border);
      background: var(--im-bg);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
    }
    .__ROOT_CLASS__ .im-plus-pop .im-plus-item {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 10px; border: none; border-radius: 8px;
      background: transparent; color: var(--im-text);
      font-size: 13px; text-align: left; cursor: pointer;
    }
    .__ROOT_CLASS__ .im-plus-pop .im-plus-item:hover { background: var(--im-hover); }
    .__ROOT_CLASS__ .im-plus-pop .im-plus-item .ico { font-size: 15px; line-height: 1; }
    /* ===== rail 多源内容区（§5.2）：非 chat 源隐藏会话专属控件（profile 的 pins 除外） ===== */
    .__ROOT_CLASS__ .im-list-panel:not([data-rail-key="chat"]):not([data-rail-key="profile"]) .im-list-pins,
    .__ROOT_CLASS__ .im-list-panel:not([data-rail-key="chat"]) .im-list-nav,
    .__ROOT_CLASS__ .im-list-panel:not([data-rail-key="chat"]) .im-mask-avatar-toggle,
    .__ROOT_CLASS__ .im-list-panel:not([data-rail-key="chat"]) .im-mask-title-toggle,
    .__ROOT_CLASS__ .im-list-panel:not([data-rail-key="chat"]) .im-cat-tag-toggle {
      display: none !important;
    }
    /* 通知类型 chips：数量多，允许横向滚动 */
    .__ROOT_CLASS__ .im-list-panel[data-rail-key="notifications"] .im-list-chips {
      max-width: calc(100% - 76px); overflow-x: auto; scrollbar-width: none;
    }
    .__ROOT_CLASS__ .im-list-panel[data-rail-key="notifications"] .im-list-chips::-webkit-scrollbar { display: none; }
    .__ROOT_CLASS__ .im-ntype-chip { height: 22px; padding: 0 8px; font-size: 12px; }
    /* 通知行 */
    .__ROOT_CLASS__ .im-notif-row {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 10px 14px; text-decoration: none !important;
      color: inherit; cursor: pointer;
    }
    .__ROOT_CLASS__ .im-notif-row:hover { background: var(--im-hover); }
    .__ROOT_CLASS__ .im-notif-row.dead { cursor: default; }
    .__ROOT_CLASS__ .im-notif-row.dead:hover { background: transparent; }
    .__ROOT_CLASS__ .im-notif-row.unread { background: var(--im-blue-soft, rgba(51, 112, 255, 0.07)); }
    .__ROOT_CLASS__ .im-notif-row.dead.unread:hover { background: var(--im-blue-soft, rgba(51, 112, 255, 0.07)); }
    .__ROOT_CLASS__ .im-notif-avatar { position: relative; width: 36px; height: 36px; flex-shrink: 0; }
    .__ROOT_CLASS__ .im-notif-avatar img,
    .__ROOT_CLASS__ .im-notif-avatar .is-text-avatar {
      width: 36px; height: 36px; border-radius: 50%; object-fit: cover;
    }
    .__ROOT_CLASS__ .im-notif-avatar .is-text-avatar {
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 15px; font-weight: 600;
    }
    .__ROOT_CLASS__ .im-notif-type {
      position: absolute; right: -2px; bottom: -2px;
      width: 15px; height: 15px; border-radius: 50%;
      background: var(--im-bg); border: 1px solid var(--im-border);
      font-size: 9px; line-height: 13px; text-align: center; color: var(--im-text-2);
    }
    .__ROOT_CLASS__ .im-notif-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .__ROOT_CLASS__ .im-notif-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .__ROOT_CLASS__ .im-notif-name {
      font-size: 13px; font-weight: 600; color: var(--im-text);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .__ROOT_CLASS__ .im-notif-time { font-size: 11px; color: var(--im-text-3); flex-shrink: 0; }
    .__ROOT_CLASS__ .im-notif-msg {
      font-size: 12px; color: var(--im-text-2); line-height: 1.45;
      overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
    .__ROOT_CLASS__ .im-notif-row.unread .im-notif-msg { color: var(--im-text); font-weight: 500; }
    /* 暗色三态兜底：feishu/wecom 未覆盖 --im-blue-soft，统一用半透明蓝 */
    .__ROOT_CLASS__.__DARK_CLASS__ .im-notif-row.unread { background: rgba(64, 120, 255, 0.14); }
    /* 静态源标签 chip（私信/书签/装饰项）与占位面板 */
    .__ROOT_CLASS__ .im-src-label { cursor: default; }
    .__ROOT_CLASS__ .im-src-placeholder {
      height: 100%; min-height: 240px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 6px; padding: 32px 20px; text-align: center; color: var(--im-text-3);
    }
    .__ROOT_CLASS__ .im-src-placeholder .ico {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      background: var(--im-hover); color: var(--im-text-2); margin-bottom: 6px;
    }
    .__ROOT_CLASS__ .im-src-placeholder .ico svg { width: 22px; height: 22px; }
    .__ROOT_CLASS__ .im-src-placeholder .t { margin: 0; font-size: 14px; font-weight: 600; color: var(--im-text-2); }
    .__ROOT_CLASS__ .im-src-placeholder .d { margin: 0; font-size: 12px; }
    /* ===== 资料页中栏（§5.4）：头部卡 + tab 子导航 + 总结/活动行 ===== */
    .__ROOT_CLASS__ .im-list-panel[data-rail-key="profile"] .im-list-pins {
      display: block !important;
      padding: 14px 14px 12px;
      border-bottom: 1px solid var(--im-border);
    }
    .__ROOT_CLASS__ .im-profile-head { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .__ROOT_CLASS__ .im-profile-avatar { width: 52px; height: 52px; flex-shrink: 0; }
    .__ROOT_CLASS__ .im-profile-avatar img,
    .__ROOT_CLASS__ .im-profile-avatar .is-text-avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; }
    .__ROOT_CLASS__ .im-profile-avatar .is-text-avatar {
      display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 600;
    }
    .__ROOT_CLASS__ .im-profile-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
    .__ROOT_CLASS__ .im-profile-meta .row1 { display: flex; align-items: center; gap: 6px; min-width: 0; }
    .__ROOT_CLASS__ .im-profile-meta .name {
      font-size: 15px; font-weight: 600; color: var(--im-text);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .__ROOT_CLASS__ .im-profile-meta .title-badge {
      flex-shrink: 0; height: 16px; padding: 0 5px; border-radius: 4px;
      font-size: 10px; line-height: 1; display: inline-flex; align-items: center;
      color: var(--im-blue); background: var(--im-blue-soft); border: 1px solid var(--im-blue-chip, var(--im-border));
    }
    .__ROOT_CLASS__ .im-profile-meta .bio {
      font-size: 12px; color: var(--im-text-3); line-height: 1.4;
      overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
    .__ROOT_CLASS__ .im-profile-meta .row2 { font-size: 11.5px; color: var(--im-text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .__ROOT_CLASS__ .im-profile-avatar { position: relative; }
    .__ROOT_CLASS__ .im-profile-avatar .flair {
      position: absolute; right: -2px; bottom: -2px; width: 20px; height: 20px;
      border-radius: 50%; overflow: hidden; border: 2px solid var(--im-bg);
      background: var(--im-hover); display: flex; align-items: center; justify-content: center;
    }
    .__ROOT_CLASS__ .im-profile-avatar .flair img { width: 100%; height: 100%; object-fit: cover; border-radius: 0; }
    .__ROOT_CLASS__ .im-profile-follow {
      flex-shrink: 0; cursor: pointer; height: 24px; padding: 0 10px; border-radius: 999px;
      border: 1px solid var(--im-accent); background: transparent; color: var(--im-accent);
      font-size: 11.5px; line-height: 1; font-family: var(--im-font);
      display: inline-flex; align-items: center;
    }
    .__ROOT_CLASS__ .im-profile-follow.on { border-color: var(--im-border); color: var(--im-text-3); }
    .__ROOT_CLASS__ .im-profile-follow:hover { background: var(--im-accent-soft); }
    .__ROOT_CLASS__ .im-profile-follow:disabled { opacity: 0.5; }
    .__ROOT_CLASS__ .im-profile-metrics {
      display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 14px;
      padding: 4px 14px 8px; font-size: 11px; color: var(--im-text-3);
    }
    .__ROOT_CLASS__ .im-profile-metrics .m { display: inline-flex; align-items: baseline; gap: 3px; }
    .__ROOT_CLASS__ .im-profile-metrics .v { font-size: 12.5px; font-weight: 600; color: var(--im-text); }
    .__ROOT_CLASS__ .im-badge-row .im-prow-avatar { display: flex; align-items: center; justify-content: center; }
    .__ROOT_CLASS__ .im-badge-row .bicon { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }
    .__ROOT_CLASS__ .im-badge-row .medal {
      width: 28px; height: 28px; border-radius: 50%; border: 1.6px solid currentColor;
      display: inline-flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0;
    }
    /* 用户卡片（点头像/昵称/@提及弹出）：皮肤 accent 渐变 banner + 左对齐信息卡 */
    .__ROOT_CLASS__ .im-ucard-mask { position: fixed; inset: 0; z-index: 1290; background: transparent; }
    .__ROOT_CLASS__ .im-ucard {
      position: fixed; z-index: 1291; width: 340px; max-width: calc(100vw - 24px);
      padding: 18px 18px 14px; border-radius: 12px; background: var(--im-bg);
      border: 1px solid var(--im-border); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
      display: flex; flex-direction: column; overflow: hidden;
    }
    .__ROOT_CLASS__ .im-ucard-banner {
      height: 56px; margin: -18px -18px 0;
      background: linear-gradient(120deg, var(--im-accent-soft), transparent 75%);
    }
    .__ROOT_CLASS__ .im-ucard-head { display: flex; align-items: flex-end; gap: 12px; min-width: 0; margin-top: -28px; }
    .__ROOT_CLASS__ .im-ucard-ava {
      position: relative; width: 56px; height: 56px; flex-shrink: 0;
      border-radius: 50%; border: 3px solid var(--im-bg); box-sizing: content-box; margin-bottom: 2px;
    }
    .__ROOT_CLASS__ .im-ucard-ava img,
    .__ROOT_CLASS__ .im-ucard-ava .is-text-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; display: block; }
    .__ROOT_CLASS__ .im-ucard-ava .is-text-avatar {
      font-size: 22px; color: #fff; display: inline-flex; align-items: center; justify-content: center;
    }
    .__ROOT_CLASS__ .im-ucard-ava .flair {
      position: absolute; right: -4px; bottom: -4px; width: 20px; height: 20px;
      border-radius: 50%; overflow: hidden; border: 2px solid var(--im-bg);
      background: var(--im-hover); display: flex; align-items: center; justify-content: center;
    }
    .__ROOT_CLASS__ .im-ucard-ava .flair img { width: 100%; height: 100%; object-fit: cover; border-radius: 0; }
    .__ROOT_CLASS__ .im-ucard-hmain { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
    .__ROOT_CLASS__ .im-ucard-name {
      font-size: 16px; font-weight: 600; color: var(--im-text);
      display: flex; align-items: center; gap: 6px; min-width: 0;
    }
    .__ROOT_CLASS__ .im-ucard-name .title-badge {
      flex-shrink: 1; min-width: 0; height: 16px; padding: 0 5px; border-radius: 4px; overflow: hidden;
      font-size: 10px; font-weight: 400; line-height: 1; display: inline-flex; align-items: center;
      color: var(--im-blue); background: var(--im-blue-soft); border: 1px solid var(--im-blue-chip, var(--im-border));
    }
    .__ROOT_CLASS__ .im-ucard-sub { font-size: 12px; color: var(--im-text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .__ROOT_CLASS__ .im-ucard-bio {
      margin-top: 10px; font-size: 12.5px; line-height: 1.55; color: var(--im-text-2);
      overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
    }
    .__ROOT_CLASS__ .im-ucard-stats {
      margin-top: 10px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
    }
    .__ROOT_CLASS__ .im-ucard-stats .m {
      display: flex; flex-direction: column; align-items: center; gap: 1px;
      padding: 7px 4px; border-radius: 8px; background: var(--im-hover);
    }
    .__ROOT_CLASS__ .im-ucard-stats .v { font-size: 14px; font-weight: 700; color: var(--im-text); line-height: 1.1; }
    .__ROOT_CLASS__ .im-ucard-stats .k { font-size: 10.5px; color: var(--im-text-3); }
    .__ROOT_CLASS__ .im-ucard-info {
      margin-top: 10px; padding-top: 2px; border-top: 1px solid var(--im-border);
      display: flex; flex-direction: column;
    }
    .__ROOT_CLASS__ .im-ucard-info .row {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 4.5px 0; font-size: 12.5px;
    }
    .__ROOT_CLASS__ .im-ucard-info .k { color: var(--im-text-3); flex-shrink: 0; }
    .__ROOT_CLASS__ .im-ucard-info .v { color: var(--im-text); font-weight: 500; text-align: right; }
    .__ROOT_CLASS__ .im-ucard-actions { margin-top: 10px; display: flex; gap: 8px; }
    .__ROOT_CLASS__ .im-ucard-btn {
      flex: 1; height: 30px; border-radius: 8px; cursor: pointer; justify-content: center;
      border: 1px solid var(--im-border); background: transparent; color: var(--im-text-2);
      font-size: 12.5px; line-height: 1; font-family: var(--im-font);
      display: inline-flex; align-items: center;
    }
    .__ROOT_CLASS__ .im-ucard-btn:hover { background: var(--im-hover); }
    .__ROOT_CLASS__ .im-ucard-btn.primary { background: var(--im-accent); border-color: var(--im-accent); color: #fff; }
    .__ROOT_CLASS__ .im-ucard-btn.primary:hover { opacity: 0.9; background: var(--im-accent); }
    .__ROOT_CLASS__ .im-ucard-btn:disabled { opacity: 0.5; cursor: default; }
    .__ROOT_CLASS__ .im-ucard-status { padding: 18px 10px; font-size: 12.5px; color: var(--im-text-3); }
    /* 「查看主页」：右栏内嵌原生 summary 页（iframe 覆盖层） */
    .__ROOT_CLASS__ .im-prof-frame {
      position: absolute; inset: 0; z-index: 440; /* 高于聊天头/输入框(430)，盖住整个右栏 */
      background: var(--im-bg);
      display: flex; flex-direction: column;
    }
    .__ROOT_CLASS__ .im-prof-frame-bar {
      height: 40px; flex-shrink: 0; display: flex; align-items: center; gap: 8px;
      padding: 0 12px; border-bottom: 1px solid var(--im-border); background: var(--im-bg);
    }
    .__ROOT_CLASS__ .im-prof-frame-bar .t {
      flex: 1; font-size: 13px; font-weight: 600; color: var(--im-text);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .__ROOT_CLASS__ .im-prof-frame-close {
      width: 28px; height: 28px; border: none; background: transparent; color: var(--im-text-3);
      border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .__ROOT_CLASS__ .im-prof-frame-close:hover { background: var(--im-hover); color: var(--im-text); }
    .__ROOT_CLASS__ .im-prof-frame-view {
      flex: 1; width: 100%; border: 0; background: var(--im-bg);
      opacity: 0; transition: opacity 0.15s ease;
    }
    .__ROOT_CLASS__ .im-prof-frame-view.ready { opacity: 1; }
    /* 皮肤切换下拉（列表头 ⇄ 按钮） */
    .__ROOT_CLASS__ .im-skin-menu {
      position: fixed; z-index: 1300; min-width: 132px; padding: 5px;
      border-radius: 10px; background: var(--im-bg); border: 1px solid var(--im-border);
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.16);
      display: flex; flex-direction: column;
    }
    .__ROOT_CLASS__ .im-skin-item {
      height: 32px; padding: 0 12px; border-radius: 7px; border: 0; cursor: pointer;
      background: transparent; color: var(--im-text-2); font-size: 13px; font-family: var(--im-font);
      display: flex; align-items: center; justify-content: space-between; gap: 10px; text-align: left;
    }
    .__ROOT_CLASS__ .im-skin-item:hover { background: var(--im-hover); color: var(--im-text); }
    .__ROOT_CLASS__ .im-skin-item.active { color: var(--im-accent); font-weight: 500; }
    .__ROOT_CLASS__ .im-skin-sep { height: 1px; margin: 5px 8px; background: var(--im-border); }
    .__ROOT_CLASS__ .im-prof-frame-loading {
      position: absolute; inset: 40px 0 0; display: flex; align-items: center; justify-content: center;
      font-size: 12.5px; color: var(--im-text-3); pointer-events: none;
    }
    .__ROOT_CLASS__ .im-profile-subbar {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 14px; overflow-x: auto; scrollbar-width: none;
      border-bottom: 1px solid var(--im-border);
      position: sticky; top: 0; z-index: 2; background: var(--im-bg);
    }
    .__ROOT_CLASS__ .im-profile-subbar::-webkit-scrollbar { display: none; }
    .__ROOT_CLASS__ .im-pfilter-chip { height: 24px; padding: 0 10px; font-size: 12px; flex-shrink: 0; }
    .__ROOT_CLASS__ .im-profile-stats {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
      padding: 12px 14px 4px;
    }
    .__ROOT_CLASS__ .im-stat-chip {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 10px 4px; border-radius: 10px; background: var(--im-hover);
    }
    .__ROOT_CLASS__ .im-stat-chip .v { font-size: 16px; font-weight: 700; color: var(--im-text); line-height: 1.1; }
    .__ROOT_CLASS__ .im-stat-chip .k { font-size: 11px; color: var(--im-text-3); }
    .__ROOT_CLASS__ .im-profile-section-title {
      padding: 10px 14px 4px; font-size: 12px; font-weight: 600; color: var(--im-text-3);
    }
    .__ROOT_CLASS__ .im-prow {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 10px 14px; text-decoration: none !important; color: inherit; cursor: pointer;
    }
    .__ROOT_CLASS__ .im-prow:hover { background: var(--im-hover); }
    .__ROOT_CLASS__ .im-prow-avatar { width: 32px; height: 32px; flex-shrink: 0; }
    .__ROOT_CLASS__ .im-prow-avatar img,
    .__ROOT_CLASS__ .im-prow-avatar .is-text-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
    .__ROOT_CLASS__ .im-prow-avatar .is-text-avatar {
      display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 600;
    }
    .__ROOT_CLASS__ .im-prow-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .__ROOT_CLASS__ .im-prow-main .t {
      font-size: 13px; color: var(--im-text); line-height: 1.4;
      overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
    .__ROOT_CLASS__ .im-prow-main .s { font-size: 11px; color: var(--im-text-3); }
    /* ===== /top 周期 + 原生分类入口（p2-odds） ===== */
    .__ROOT_CLASS__ .im-list-nav .im-nav-period {
      display: flex; flex-wrap: wrap; gap: 4px 6px;
      margin: 6px 10px 0; padding: 8px 0 4px;
      border-top: 1px dashed var(--im-border);
    }
    .__ROOT_CLASS__ .im-list-nav .im-nav-period a {
      padding: 3px 8px; border-radius: 6px; font-size: 12px;
      background: var(--im-hover); color: var(--im-text-2);
    }
    .__ROOT_CLASS__ .im-list-nav .im-nav-period a.active {
      background: var(--im-blue-soft); color: var(--im-blue); font-weight: 600;
    }
    .__ROOT_CLASS__ .im-list-nav a.im-nav-native-cat {
      margin: 8px 10px 10px; padding: 7px 10px; border-radius: 8px;
      font-size: 12px; background: var(--im-hover); color: var(--im-text-3);
    }
    /* ===== 原生弹层融合：用户卡片（§5.5 方案 A，变量化适配三皮肤三态） ===== */
    .__ROOT_CLASS__ .user-card {
      border: 1px solid var(--im-border);
      border-radius: 16px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
      overflow: hidden;
      font-family: var(--im-font);
    }
    .__ROOT_CLASS__ .user-card .card-content { background: var(--im-bg); color: var(--im-text); }
    .__ROOT_CLASS__ .user-card .names h1,
    .__ROOT_CLASS__ .user-card .names .username,
    .__ROOT_CLASS__ .user-card h3 { color: var(--im-text); }
    .__ROOT_CLASS__ .user-card .names h2,
    .__ROOT_CLASS__ .user-card .names h1 a { color: var(--im-text-2); }
    .__ROOT_CLASS__ .user-card .bio,
    .__ROOT_CLASS__ .user-card .bio p { color: var(--im-text-2); }
    .__ROOT_CLASS__ .user-card .metadata,
    .__ROOT_CLASS__ .user-card .metadata a,
    .__ROOT_CLASS__ .user-card .metadata .d-label { color: var(--im-text-3); }
    .__ROOT_CLASS__ .user-card .btn {
      border-radius: 8px;
      font-family: var(--im-font);
    }
    .__ROOT_CLASS__ .user-card .btn-primary {
      background: var(--im-accent); border-color: var(--im-accent); color: #fff;
    }
    .__ROOT_CLASS__ .user-card .btn-primary:hover { background: var(--im-blue-hover, var(--im-accent)); }
    .__ROOT_CLASS__ .user-card .btn:not(.btn-primary) {
      background: var(--im-hover); border-color: var(--im-border); color: var(--im-text-2);
    }
    .__ROOT_CLASS__ .user-card .user-stat .digit,
    .__ROOT_CLASS__ .user-card .stats-section h3,
    .__ROOT_CLASS__ .user-card .top-sub-section h3 { color: var(--im-text); }
    .__ROOT_CLASS__ .user-card .user-stat .label,
    .__ROOT_CLASS__ .user-card .stats-section .desc,
    .__ROOT_CLASS__ .user-card .stat-value { color: var(--im-text-3); }
    .__ROOT_CLASS__ .user-card .badge-section .user-badge,
    .__ROOT_CLASS__ .user-card .badge-section .badge-card,
    .__ROOT_CLASS__ .user-card .user-badge {
      border-radius: 8px;
      background: var(--im-hover);
      border: 1px solid var(--im-border);
      color: var(--im-text-2);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .user-card { box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5); }

    /* ===== 飞书同款弹出搜索（rail/titlebar 入口 + ⌘K） ===== */
    .im-search-pop-overlay {
      position: fixed; inset: 0; z-index: 1200;
      background: rgba(0, 0, 0, 0.24);
      display: none;
      font-family: var(--im-font);
    }
    .im-search-pop-overlay.open { display: block; }
    .im-search-pop {
      position: absolute; left: 50%; top: 9vh;
      transform: translateX(-50%);
      width: min(760px, 92vw); max-height: 74vh;
      background: var(--im-bg); color: var(--im-text);
      border-radius: 12px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
      display: flex; flex-direction: column;
      overflow: hidden;
    }
    .im-search-head {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 20px 8px;
      flex-shrink: 0;
    }
    .im-search-field {
      flex: 1; min-width: 0;
      display: flex; align-items: center; gap: 10px;
      height: 42px; padding: 0 14px;
      border: 1px solid var(--im-border); border-radius: 10px;
      color: var(--im-text-3);
    }
    .im-search-field:focus-within { border-color: var(--im-accent); }
    .im-search-field svg { width: 18px; height: 18px; flex-shrink: 0; }
    .im-search-input {
      flex: 1; min-width: 0;
      border: 0; outline: 0; background: transparent;
      font-size: 15px; color: var(--im-text);
      font-family: var(--im-font);
    }
    .im-search-input::placeholder { color: var(--im-text-3); }
    .im-search-input::-webkit-search-cancel-button { -webkit-appearance: none; }
    .im-search-clear {
      flex-shrink: 0; cursor: pointer;
      border: 0; background: transparent;
      color: var(--im-text-3); font-size: 13px;
      padding: 4px 6px; border-radius: 6px;
      font-family: var(--im-font);
    }
    .im-search-clear:hover { color: var(--im-text); }
    .im-search-close {
      flex-shrink: 0; cursor: pointer;
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border: 0; background: transparent;
      color: var(--im-text-2); border-radius: 8px;
    }
    .im-search-close:hover { background: var(--im-hover); color: var(--im-text); }
    .im-search-close svg { width: 18px; height: 18px; }
    .im-search-chips {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      padding: 4px 20px 12px;
      flex-shrink: 0;
    }
    .im-search-chip {
      cursor: pointer;
      height: 30px; padding: 0 13px; border-radius: 999px;
      border: 1px solid var(--im-border); background: transparent;
      color: var(--im-text-2); font-size: 13px;
      font-family: var(--im-font);
      display: inline-flex; align-items: center;
    }
    .im-search-chip:hover { background: var(--im-hover); }
    .im-search-chip.active {
      background: var(--im-accent-soft); border-color: transparent;
      color: var(--im-accent); font-weight: 500;
    }
    .im-search-body { flex: 1; overflow-y: auto; padding: 4px 12px 12px; }
    .im-search-group {
      padding: 10px 8px 6px;
      font-size: 12px; color: var(--im-text-3);
      user-select: none;
    }
    .im-search-item {
      position: relative;
      display: flex; align-items: flex-start; gap: 12px;
      padding: 12px 14px; border-radius: 10px;
      cursor: pointer; text-decoration: none !important;
      color: var(--im-text);
    }
    .im-search-item:hover, .im-search-item.active { background: var(--im-hover); }
    .im-search-item .ava {
      width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
      object-fit: cover;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 16px; font-weight: 600;
    }
    .im-search-item .ava.is-letter { border-radius: 50%; }
    .im-search-item .ava.is-dot { width: 18px; height: 18px; border-radius: 50%; margin: 11px; }
    .im-search-item-main { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
    .im-search-item .tt {
      font-size: 15px; font-weight: 500; line-height: 1.4;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .im-search-item .meta {
      font-size: 12.5px; color: var(--im-text-3);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .im-search-item .sb {
      font-size: 13px; color: var(--im-text-2); line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .im-search-item .search-hl {
      background: rgba(255, 213, 79, 0.4);
      border-radius: 2px; padding: 0 1px;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-search-item .search-hl { background: rgba(255, 213, 79, 0.24); }
    .im-search-copy {
      position: absolute; top: 10px; right: 10px;
      width: 26px; height: 26px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      color: var(--im-text-3);
      opacity: 0; transition: opacity 0.15s;
    }
    .im-search-copy svg { width: 15px; height: 15px; }
    .im-search-item:hover .im-search-copy, .im-search-copy.done { opacity: 1; }
    .im-search-copy.done, .im-search-copy:hover { color: var(--im-accent); }
    .im-search-status { padding: 24px 12px; text-align: center; color: var(--im-text-3); font-size: 13px; }
    .im-search-foot {
      display: flex; align-items: center; gap: 14px;
      padding: 10px 20px;
      border-top: 1px solid var(--im-border);
      color: var(--im-text-3); font-size: 12px;
      flex-shrink: 0;
    }
    .im-search-tips { margin-left: auto; display: flex; align-items: center; }
    .im-search-tips > span { display: inline-flex; align-items: center; white-space: nowrap; }
    .im-search-tips > span + span {
      margin-left: 12px; padding-left: 12px;
      border-left: 1px solid var(--im-border);
    }
    .im-search-foot kbd {
      display: inline-block; min-width: 14px; text-align: center;
      background: var(--im-hover); border: 1px solid var(--im-border);
      border-radius: 4px; padding: 1px 4px;
      font-size: 11px; line-height: 1.4;
      color: var(--im-text-2);
      font-family: var(--im-font);
      margin-right: 3px;
    }
    .im-search-more {
      cursor: pointer; min-width: 0; flex-shrink: 1;
      color: var(--im-accent); text-decoration: none;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-search-pop { box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6); }
    /* ---------- 选择楼层弹层 ---------- */
    .im-floor-pop {
      position: absolute; inset: 0; z-index: 60;
      display: none; align-items: center; justify-content: center;
      background: rgba(0, 0, 0, 0.24);
      font-family: var(--im-font);
    }
    .im-floor-pop.open { display: flex; }
    .im-floor-pop-card {
      width: 248px;
      background: var(--im-bg); color: var(--im-text);
      border: 1px solid var(--im-border);
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
      padding: 14px 14px 12px;
    }
    .im-floor-pop-title { font-size: 12px; color: var(--im-text-3); margin-bottom: 10px; }
    .im-floor-pop-row { display: flex; align-items: center; gap: 8px; }
    .im-floor-pop-input {
      flex: 1; min-width: 0; height: 30px;
      border: 1px solid var(--im-border); border-radius: 7px;
      padding: 0 9px; font-size: 13px; color: var(--im-text);
      background: transparent; outline: none;
      font-family: var(--im-font);
    }
    .im-floor-pop-input:focus { border-color: var(--im-accent); }
    .im-floor-pop-input.error { border-color: var(--im-danger); }
    .im-floor-pop-input::-webkit-outer-spin-button,
    .im-floor-pop-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .im-floor-pop-total { font-size: 11px; color: var(--im-text-4); white-space: nowrap; }
    .im-floor-pop-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
    .im-floor-pop-actions button {
      height: 28px; padding: 0 12px;
      border: 1px solid var(--im-border); border-radius: 7px;
      background: transparent; color: var(--im-text-2);
      font-size: 12px; cursor: pointer; font-family: var(--im-font);
    }
    .im-floor-pop-actions button:hover { background: var(--im-hover); }
    .im-floor-pop-go { background: var(--im-accent); border-color: var(--im-accent); color: #fff; }
    .im-floor-pop-go:hover { background: var(--im-accent); filter: brightness(1.06); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-floor-pop-card { box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6); }


    /* ============================== rail 收起态（wecom / feishu 窄条大图标） ============================== */
    /* 本块在皮肤 CSS 之后注入，(0,2,0) 特异性压过各皮肤 .im-rail-item 布局；颜色沿用各皮肤变量 */

    .__ROOT_CLASS__.im-rail-collapsed { --im-nav: 68px !important; }
    .im-rail-collapsed .im-rail-resizer { display: none; }
    /* 纵向堆叠：飞书顶部是头像+展开小圆钮两件套，横向会挤（wecom 单头像不受影响） */
    .im-rail-collapsed .im-rail-head { flex-direction: column; justify-content: center; gap: 6px; }
    .im-rail-collapsed .im-rail-user-name,
    .im-rail-collapsed .im-rail-org-name,
    .im-rail-collapsed .im-rail-org-chip > svg { display: none; }
    .im-rail-collapsed .im-rail-items { padding: 4px 8px 8px; }
    .im-rail-collapsed .im-rail-bottom { padding: 2px 8px 0; }
    .im-rail-collapsed .im-rail-item {
      flex-direction: column; justify-content: center; gap: 4px;
      height: 52px; flex: 0 0 52px; padding: 0;
      line-height: 1.2; font-size: 11px; text-align: center;
    }
    /* 三字标签（工作台/云文档/联系人…）禁止折行 */
    .im-rail-collapsed .im-rail-item span { white-space: nowrap; }
    .im-rail-collapsed .im-rail-item svg { width: 22px; height: 22px; }
    .im-rail-collapsed .im-rail-count,
    .im-rail-collapsed .im-rail-group-title { display: none; }
    .im-rail-collapsed .im-rail-badge {
      /* 图标 22px 居中：徽标压住图标右上角，而非贴格右缘 */
      position: absolute; top: 1px; left: calc(50% + 4px); right: auto; transform: none;
      min-width: 16px; height: 16px; line-height: 16px; font-size: 9px;
    }
    /* 收起钮是 button，飞书 rail 项为 div：重置 UA 按钮外观（边框/底色/字体） */
    .im-rail .im-rail-collapse {
      border: none; background: transparent;
      font: inherit; color: inherit; cursor: pointer;
    }
    .im-rail-collapsed .im-rail-dot { top: 5px; right: 8px; transform: none; }
    .im-rail-collapsed .im-rail-collapse svg { transform: rotate(180deg); }
`;
  const CSS_WECOM = String.raw`
    /* ---------- Token（企业微信 5.x 展开导航版基准） ---------- */
    .__ROOT_CLASS__ {
      color-scheme: light !important;
      --wc-blue: #4389F5;
      --wc-blue-hover: #2F78E8;
      --wc-blue-soft: #DCEBFF;
      --wc-blue-chip: #DCEBFF;
      --wc-title: #4389F5;
      --wc-accent: #4389F5;
      --wc-accent-soft: #DCEBFF;
      --wc-accent-strong: #2D78E7;
      --wc-nav2-bg: #FFFFFF;
      --wc-nav2-border: #D6DEE8;
      --wc-text: #172033;
      --wc-text-2: #526175;
      --wc-text-3: #8B98AA;
      --wc-text-4: #B5BFCC;
      --wc-bg: #FFFFFF;
      --wc-chat-bg: #F1F4F8;
      --wc-hover: #E7EEF8;
      --wc-active: #4B8FF7;
      --wc-bubble-other: #E4E7EC;
      --wc-bubble-me: #BDE4FF;
      --wc-border: #D9E0E9;
      --wc-border-strong: #C5CFDB;
      --wc-danger: #FA5151;
      --wc-rail-bg: #E3F0FF;
      --im-strip-bg: transparent;
      --im-nav: __RAIL_WIDTH__px;
      --im-nav2w: 0px;
      --im-strip: __STRIP_WIDTH__px;
      --im-list: __LIST_WIDTH__px;
      --im-header-h: __TITLEBAR_HEIGHT__px;
      --wc-font: "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Helvetica Neue", Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      --radius: 6px;

      --primary: var(--wc-text);
      --primary-medium: var(--wc-text-2);
      --primary-low: var(--wc-text-3);
      --secondary: var(--wc-bg);
      --tertiary: var(--wc-accent);
      --header_background: #FFFFFF;
      --header_primary: var(--wc-text);
      --d-hover: var(--wc-hover);
    }

    /* 整站颜色模式：由运行时同步 html/body 与站点 stylesheet */
    html.__ROOT_CLASS__,
    html.__ROOT_CLASS__ body {
      color-scheme: light !important;
    }

    /* ---------- 字体与基础 ---------- */
    .__ROOT_CLASS__ body { font-family: var(--wc-font) !important; }

    /* 站点无全局 border-box：自绘面板统一盒模型，否则 padding 会加宽导致互相堆叠 */
    .im-rail, .im-rail *,
    .im-strip, .im-strip *,
    .im-list-panel, .im-list-panel *,
    .im-chat-panel, .im-chat-panel *,
    .im-mode-fab { box-sizing: border-box; }

    /* ---------- 顶栏视觉隐藏（保留 DOM，供 user-menu 挂载/点击） ---------- */
    .__ROOT_CLASS__ .d-header-wrap,
    .__ROOT_CLASS__ .d-header {
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
    /* 允许脚本对用户按钮做 programmatic click */
    .__ROOT_CLASS__ #current-user,
    .__ROOT_CLASS__ #toggle-current-user,
    .__ROOT_CLASS__ .header-dropdown-toggle.current-user {
      pointer-events: auto !important;
    }
    .__ROOT_CLASS__ #main-outlet-wrapper {
      padding-top: var(--im-header-h) !important;
      margin-left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-strip)) !important;
    }

    /* ---------- 展开栏：原生侧栏原样搬入（内容与文案不变，≡ 滑出） ---------- */
    .__ROOT_CLASS__.im-nav2-open { --im-nav2w: __NAV2_WIDTH__px; }
    html.__ROOT_CLASS__ body .sidebar-wrapper {
      display: block !important;
      position: fixed;
      left: var(--im-nav); top: 0; bottom: 0;
      width: __NAV2_WIDTH__px !important;
      background-color: #FFFFFF !important;
      background-image: none !important;
      backdrop-filter: none !important;
      box-shadow: none !important;
      border-right: 1px solid var(--wc-border);
      z-index: 600;
      transform: translateX(-105%);
      visibility: hidden;
      transition: transform 0.18s ease, visibility 0.18s;
      /* 站点可能是深色方案：强制企业微信浅色调色板 */
      --primary: var(--wc-text);
      --primary-medium: var(--wc-text-2);
      --primary-low: var(--wc-text-3);
      --primary-low-mid: #BBBFC4;
      --primary-very-low: #F0F2F5;
      --primary-50: #F5F6F7;
      --primary-100: #EBEDEF;
      --primary-200: #E8E9EB;
      --primary-300: #DEE0E3;
      --secondary: #FFFFFF;
      --tertiary: var(--wc-accent);
      --quaternary: var(--wc-accent);
      --d-hover: var(--wc-hover);
      --d-sidebar-background: #FFFFFF;
      --d-sidebar-border-color: var(--wc-border);
      color: var(--wc-text);
    }
    /* 可能盖住白底的子层/伪层一律透明 */
    html.__ROOT_CLASS__ body .sidebar-wrapper *,
    html.__ROOT_CLASS__ body .sidebar-wrapper *::before,
    html.__ROOT_CLASS__ body .sidebar-wrapper *::after {
      background-color: transparent !important;
      background-image: none !important;
      backdrop-filter: none !important;
    }
    .__ROOT_CLASS__.im-nav2-open .sidebar-wrapper {
      transform: none;
      visibility: visible;
    }
    /*
     * 锁定态把 #main-outlet-wrapper 设成 pointer-events:none，
     * 而 Discourse 的 .sidebar-wrapper 在其内部 → 展开后只能看不能点。
     * 侧栏自身及子元素显式恢复点击。
     */
    .__ROOT_CLASS__ .sidebar-wrapper,
    .__ROOT_CLASS__ .sidebar-wrapper * {
      pointer-events: auto !important;
    }
    html.__ROOT_CLASS__ body .sidebar-wrapper .sidebar-container {
      height: 100%;
      border-right: none;
    }
    /* 侧栏内部元素统一到企业微信浅色观感 */
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-header,
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-header-text {
      color: var(--wc-text-3) !important;
    }
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-link {
      color: var(--wc-text-2) !important;
      border-radius: 8px;
      transition: background-color 0.15s;
    }
    html.__ROOT_CLASS__ body .sidebar-wrapper .sidebar-section-link:hover {
      background-color: var(--wc-hover) !important;
      color: var(--wc-text) !important;
    }
    html.__ROOT_CLASS__ body .sidebar-wrapper .sidebar-section-link.active {
      background-color: var(--wc-accent-soft) !important;
      color: var(--wc-accent-strong, var(--wc-accent)) !important;
    }
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-content svg,
    .__ROOT_CLASS__ .sidebar-wrapper .sidebar-section-link-prefix {
      color: var(--wc-text-3);
    }
    /* 底部黑色聊天抽屉与侧栏底栏（用户栏）会破坏三栏观感，隐藏（不限于 sidebar 内部） */
    .__ROOT_CLASS__ .chat-drawer-container,
    .__ROOT_CLASS__ #chat-drawer,
    .__ROOT_CLASS__ .chat-drawer,
    .__ROOT_CLASS__ [class*="sidebar-footer"],
    .__ROOT_CLASS__ [id*="chat-drawer"] {
      display: none !important;
    }

    /* ---------- 窄图标条：假 icon（纯装饰） ---------- */
    .im-strip {
      display: none !important;
    }
    .im-strip-item {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: var(--wc-text-2);
      position: relative; flex-shrink: 0;
      cursor: default; user-select: none;
    }
    .im-strip-item svg { width: 17px; height: 17px; }
    .im-strip-badge {
      position: absolute; top: -4px; right: -10px;
      min-width: 14px; height: 14px; padding: 0 4px;
      background: var(--wc-danger); color: #fff;
      font-size: 9px; line-height: 14px; text-align: center;
      border-radius: 7px; font-weight: 500;
    }
    /* 左侧栏头像通知：仅在 html.im-notif-open 时显示，避免关不掉 */
    .__ROOT_CLASS__ .user-menu.im-user-menu-float,
    .__ROOT_CLASS__ .user-menu.revamped.menu-panel.im-user-menu-float,
    .__ROOT_CLASS__ .user-menu.menu-panel.im-user-menu-float {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    .__ROOT_CLASS__.im-notif-open .user-menu.im-user-menu-float,
    .__ROOT_CLASS__.im-notif-open .user-menu.revamped.menu-panel.im-user-menu-float,
    .__ROOT_CLASS__.im-notif-open .user-menu.menu-panel.im-user-menu-float {
      display: block !important;
      position: fixed !important;
      left: 8px !important;
      top: calc(var(--im-header-h) + 4px) !important;
      right: auto !important;
      bottom: auto !important;
      width: 320px !important;
      max-width: min(320px, calc(100vw - 20px)) !important;
      max-height: calc(100vh - 28px) !important;
      margin: 0 !important;
      z-index: 450 !important;
      box-shadow: 0 8px 28px rgba(31, 35, 41, 0.18) !important;
      border-radius: 8px !important;
      overflow: auto !important;
      pointer-events: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      background: #fff !important;
      color: var(--wc-text) !important;
      clip: auto !important;
    }

    /* ---------- 最左：企业微信文字导航栏（浅色渐变；仅「更多」可点，展开原生侧栏） ---------- */

    /* ---------- 顶部浅色 titlebar ---------- */
    .im-titlebar {
      position: fixed; left: 0; right: 0; top: 0;
      height: var(--im-header-h);
      background: linear-gradient(90deg, #D5E0F8 0%, #DCE4F9 100%);
      color: var(--wc-text);
      display: flex; align-items: center;
      padding: 0 10px;
      z-index: 500;
      font-family: var(--wc-font);
      user-select: none;
      gap: 8px;
    }
    /* 顶栏左侧：当前用户头像（沿用 rail-avatar 类名，复用通知菜单逻辑） */
    .im-titlebar .me-chip { position: relative; width: 26px; height: 26px; flex-shrink: 0; }
    .im-titlebar .im-rail-avatar {
      width: 26px; height: 26px; border-radius: 6px; font-size: 11px;
    }
    .im-titlebar .im-rail-avatar-badge {
      top: -5px; right: -7px; min-width: 14px; height: 14px; padding: 0 3px;
      font-size: 9px; line-height: 14px; border-radius: 7px;
    }
    .im-titlebar .title-search {
      margin: 2px auto 0;
      width: min(420px, 36vw);
      height: 26px; border-radius: 13px;
      background: #EFF1FB;
      display: flex; align-items: center; gap: 6px;
      padding: 0 12px; color: var(--wc-text-3); font-size: 12px;
      position: relative;
    }
    .im-titlebar .title-search form {
      display: flex; align-items: center; gap: 6px; width: 100%; margin: 0;
    }
    .im-titlebar .title-search svg { opacity: .9; flex-shrink: 0; color: var(--wc-text-3); width: 14px; height: 14px; }
    .im-titlebar .title-search input {
      flex: 1; min-width: 0; border: 0; outline: none; background: transparent;
      color: var(--wc-text); font-size: 12px; font-family: var(--wc-font);
      text-align: center; line-height: 26px; padding: 0; height: 100%;
    }
    .im-titlebar .title-search input::placeholder { color: var(--wc-text-4); text-align: center; }
    .im-titlebar .title-actions { display: flex; align-items: center; gap: 6px; margin-left: 8px; flex-shrink: 0; }
    .im-titlebar .t-btn {
      width: 28px; height: 28px; border: 0; background: transparent; color: var(--wc-text-2);
      border-radius: 6px; cursor: pointer; display: grid; place-items: center; padding: 0;
      position: relative;
    }
    .im-titlebar .t-btn:hover { background: rgba(0,0,0,.05); }
    .im-titlebar .t-btn .dot {
      position: absolute; top: 4px; right: 4px; width: 6px; height: 6px;
      background: var(--wc-danger); border-radius: 50%;
    }
    .im-titlebar .t-btn.ai {
      width: 24px; height: 24px; border-radius: 50%; color: #fff;
      background: conic-gradient(from 210deg, #7C5CFF, #1A87FF, #00C56C, #FFB020, #7C5CFF);
    }
    .im-titlebar .t-btn.ai svg { width: 12px; height: 12px; }
    .im-titlebar .t-btn svg { width: 16px; height: 16px; }

    .im-rail {
      position: fixed; left: 0; top: var(--im-header-h); bottom: 0;
      width: var(--im-nav);
      background: linear-gradient(180deg, #E7F3FF 0%, #DDEEFF 100%);
      border-right: 1px solid #C9D9EB;
      color: #47617E;
      display: flex; flex-direction: column; align-items: stretch;
      padding: 10px 0 8px;
      z-index: 350;
      font-family: var(--wc-font);
      /* 不能 overflow:hidden：顶部组织 chip 的名称要溢出到中栏头部区 */
      overflow: visible;
    }
    .im-rail-head {
      width: 100%; flex-shrink: 0;
      height: 56px; display: flex; flex-direction: row; align-items: center;
      gap: 10px; padding: 0 14px;
      position: relative; z-index: 360;
    }
    /* wecom：顶部当前用户块（头像 + 用户名），复用 .im-rail-avatar 通知逻辑 */
    .im-rail-me { position: relative; flex-shrink: 0; display: flex; }
    .im-rail .im-rail-avatar-badge { top: -3px; right: -5px; box-shadow: 0 0 0 2px #E7F3FF; }
    .im-rail-user-name {
      min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      font-size: 14px; font-weight: 600; line-height: 1;
      color: #26384E;
    }
    .im-rail-org-chip {
      display: flex; align-items: center; gap: 6px;
      white-space: nowrap; cursor: pointer;
      border-radius: 6px; padding: 2px 4px; margin-left: -4px;
    }
    .im-rail-org-chip:hover { background: rgba(79,143,234,.09); }
    .im-rail-org-chip:hover .im-rail-org-name { color: var(--wc-accent-strong); }
    .im-rail-org-logo img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
    .im-rail-org-logo {
      width: 26px; height: 26px; border-radius: 6px; flex-shrink: 0;
      background: #2F88FF; color: #fff;
      display: grid; place-items: center; font-size: 12px; font-weight: 700;
    }
    .im-rail-org-name {
      min-width: 0; overflow: hidden; text-overflow: ellipsis;
      font-size: 12px; font-weight: 500; line-height: 1;
      color: #26384E;
    }
    .im-rail-org-chip > svg { width: 10px; height: 10px; color: #7B8CA1; flex-shrink: 0; }
    /* 头像基础样式（现挂在 titlebar 左侧，类名保留以复用通知逻辑） */
    .im-rail-avatar {
      width: 36px; height: 36px; border-radius: 8px;
      overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 700;
      background: #F3A23A;
      cursor: pointer;
    }
    .im-rail-avatar img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
    .im-rail-avatar.is-notif-pinned {
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--wc-accent);
    }
    .im-rail-avatar-badge {
      position: absolute; top: -4px; right: -6px;
      min-width: 16px; height: 16px; padding: 0 4px;
      background: var(--wc-danger); color: #fff;
      font-size: 10px; font-weight: 700; line-height: 16px; text-align: center;
      border-radius: 8px;
      box-shadow: 0 0 0 2px #fff;
    }
    .im-rail-search { display: none !important; }
    .im-rail-items {
      flex: 1; width: 100%; overflow: auto;
      display: flex; flex-direction: column; align-items: stretch;
      gap: 1px;
      padding: 4px 12px 8px;
    }
    .im-rail-items::-webkit-scrollbar { width: 0; }
    .im-rail-item {
      width: 100%; height: 40px; flex: 0 0 40px;
      border: 0; background: transparent; border-radius: 8px;
      display: flex; flex-direction: row; align-items: center; justify-content: flex-start;
      gap: 10px;
      padding: 0 10px; color: #3E5166; cursor: pointer; position: relative;
      font-size: 14px; line-height: 40px; text-align: left;
    }
    .im-rail-item svg { width: 18px; height: 18px; color: #5A6E86; flex-shrink: 0; }
    .im-rail-item span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .im-rail-item:hover { background: rgba(79,143,234,.09); }
    .im-rail-item.active {
      color: var(--wc-accent-strong);
      background: #CFE4FF;
      box-shadow: none;
    }
    .im-rail-item.active svg { color: var(--wc-accent-strong); }
    .im-rail-bottom { width: 100%; flex-shrink: 0; padding: 2px 12px 0; }
    .im-rail-bottom .im-rail-item { color: #536A84; }
    .im-rail-bottom .im-rail-item svg { color: #7187A0; }
    .im-theme-controls { position: relative; display: flex; flex-direction: column; gap: 1px; }
    .im-theme-toggle,
    .im-theme-options { position: relative; }
    .im-theme-toggle .im-theme-icon,
    .im-theme-options .im-theme-icon { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; }
    .im-theme-options { opacity: .82; }
    .im-theme-options:hover { opacity: 1; }
    .im-theme-menu[hidden] { display: none !important; }
    .im-theme-menu {
      position: fixed;
      left: calc(var(--im-nav) + 10px);
      bottom: 12px;
      z-index: 1200;
      width: 190px;
      padding: 7px;
      border: 1px solid var(--wc-border);
      border-radius: 10px;
      background: var(--wc-bg);
      box-shadow: 0 12px 30px rgba(31, 35, 41, .18);
      font-family: var(--wc-font);
    }
    .im-theme-menu-title { padding: 5px 8px 7px; color: var(--wc-text-3); font-size: 11px; }
    .im-theme-menu button {
      width: 100%; height: 34px; display: flex; align-items: center; gap: 8px;
      padding: 0 8px; border: 0; border-radius: 7px; background: transparent;
      color: var(--wc-text-2); font: 13px var(--wc-font); text-align: left; cursor: pointer;
    }
    .im-theme-menu button:hover { background: var(--wc-hover); color: var(--wc-text); }
    .im-theme-menu button.is-active { background: var(--wc-accent-soft); color: var(--wc-accent); font-weight: 600; }
    .im-theme-menu button svg { width: 16px; height: 16px; flex: 0 0 auto; }
    .im-rail-more.is-on { color: var(--wc-accent-strong); background: #CFE4FF; box-shadow: none; }
    .im-rail-more.is-on svg { color: var(--wc-accent-strong); }
    /* 右边缘拖拽柄：左右拉伸 rail */
    .im-rail-resizer {
      position: fixed; top: var(--im-header-h); bottom: 0;
      left: calc(var(--im-nav) - 3px); width: 6px;
      cursor: col-resize; z-index: 400;
      touch-action: none;
    }
    .im-rail-resizer:hover,
    .im-rail-resizer.dragging { background: rgba(67,137,245,.24); }
    /* 窄宽度 → 纯图标模式 */
    .im-rail-compact .im-rail-item { justify-content: center; padding: 0; gap: 0; }
    .im-rail-compact .im-rail-item span { display: none; }
    .im-rail-compact .im-rail-head { padding: 0; display: flex; justify-content: center; }
    .im-rail-compact .im-rail-org-name,
    .im-rail-compact .im-rail-org-chip > svg,
    .im-rail-compact .im-rail-user-name,
    .im-rail-compact .im-rail-group-title { display: none; }
    .im-rail-compact .im-rail-badge { left: auto; right: 6px; top: 6px; }
    /* 收起态共享规则在 core-extra（图标右上压角）；宽条徽标在行右侧垂直居中 */
    .im-rail-badge {
      position: absolute; top: 50%; left: auto; right: 10px; transform: translateY(-50%);
      min-width: 18px; height: 18px; padding: 0 5px;
      background: var(--wc-danger); color: #fff; border-radius: 9px;
      font-size: 10px; font-weight: 700; line-height: 18px; text-align: center;
    }
    .im-rail-dot {
      position: absolute; top: 50%; right: 10px; transform: translateY(-50%);
      width: 7px; height: 7px; border-radius: 50%;
      background: #FF574F;
    }
    /* wecom：分组区（官方 5.x「分组」列表） */
    .im-rail-groups { display: flex; flex-direction: column; margin-top: 10px; }
    .im-rail-group-title {
      height: 28px; display: flex; align-items: center; justify-content: space-between;
      padding: 0 10px; font-size: 12px; color: #8293A8;
      user-select: none;
    }
    .im-rail-group-title svg { width: 14px; height: 14px; color: #8293A8; }
    .im-rail-group-item { color: #536A84; }
    .im-rail-group-item svg { width: 16px; height: 16px; color: #6E829B; }
    .im-rail-count {
      margin-left: auto; flex-shrink: 0;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: rgba(38,56,78,.08); color: #66788C;
      font-size: 11px; font-weight: 600; line-height: 18px; text-align: center;
      border-radius: 9px;
    }

    .im-nav2-cat-dot {
      width: 10px; height: 10px; border-radius: 3px;
      flex-shrink: 0; margin: 0 4px;
    }

    /* ---------- 聊天 header 头像与标题行 ---------- */
    .im-chat-head-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .im-chat-avatar {
      width: 28px; height: 28px; border-radius: 6px;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 600;
    }
    /* ---------- 聊天头：标题行（人数 + 分类 chip） ---------- */
    .im-chat-title-row { display: flex; align-items: center; gap: 7px; min-width: 0; }
    .im-chat-count {
      display: inline-flex; align-items: center; gap: 2px;
      font-size: 12px; color: #8795A7; font-weight: 400; flex-shrink: 0;
    }
    .im-chat-count svg { width: 13px; height: 13px; }
    .im-chat-chips { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .im-chat-chip {
      display: inline-flex; align-items: center; gap: 3px;
      height: 18px; padding: 0 5px; border-radius: 3px;
      font-size: 11px; line-height: 1; white-space: nowrap;
      color: var(--wc-blue) !important; background: var(--wc-blue-soft);
      border: 1px solid #C9E2FF !important;
      text-decoration: none !important; cursor: pointer;
    }
    .im-chat-chip .im-nav2-cat-dot { width: 8px; height: 8px; border-radius: 2px; margin: 0; }

    /* ---------- 隐藏原生主内容（三栏路由） ---------- */
    .__ROOT_CLASS__.__LOCK_CLASS__ body { overflow: hidden !important; }
    .__ROOT_CLASS__.__LOCK_CLASS__ #main-outlet > * {
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
    }

    /* ---------- 中栏右边缘拖拽柄 ---------- */
    .im-list-resizer {
      position: fixed; top: var(--im-header-h); bottom: 0;
      left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-list) - 3px); width: 6px;
      cursor: col-resize; z-index: 400; touch-action: none;
    }
    .im-list-resizer:hover,
    .im-list-resizer.dragging { background: rgba(67,137,245,.25); }
    .__ROOT_CLASS__.__LOCK_CLASS__.im-nav2-open .im-list-resizer { left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-list) - 3px); }

    /* ---------- 中栏：会话列表 ---------- */
    .im-list-panel {
      position: fixed;
      top: var(--im-header-h);
      left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-strip));
      width: var(--im-list);
      bottom: 0;
      background: #F4F7FB;
      border-right: 1px solid #D6DEE8;
      display: flex;
      flex-direction: column;
      z-index: 200;
      font-family: var(--wc-font);
    }
    .im-list-header {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 62px;
      padding: 17px 16px 7px;
      flex-shrink: 0;
      box-sizing: border-box;
      border-bottom: 1px solid transparent;
    }
    .im-list-title { display: none !important; }
    /* 官方 5.x 隐藏 chips 行（未读入口在 rail 分组；chips 节点保留供 rail 点击联动） */
    .im-list-chips { display: none !important; }
    /* 企业微信没有分类标识：列表行分类 chip、详情头部分类 chips 一律隐藏 */
    .im-conv-tag { display: none !important; }
    .im-chat-chips { display: none !important; }
    /* 右上角只保留有用的功能钮：隐藏装饰假工具排（cam/mute/folder/menu/dots/gear） */
    .im-chat-tools { display: none !important; }
    /* 搜索行：官方 5.x 顶部搜索框（chips 隐藏，筛选/伪装钮保留在右）；默认透明描边 */
    .im-list-search {
      flex: 1; min-width: 0; height: 34px;
      display: flex; align-items: center; gap: 6px;
      padding: 0 11px; border-radius: 7px;
      background: transparent;
      border: 1px solid #D6DEE8;
      box-sizing: border-box;
      transition: background .15s, box-shadow .15s, border-color .15s;
    }
    .im-list-search:focus-within { background: transparent; border-color: transparent; box-shadow: inset 0 0 0 1px #A9C9F6; }
    .im-list-search svg { width: 14px; height: 14px; color: #8A98AA; flex-shrink: 0; }
    .im-list-search input {
      flex: 1; min-width: 0; display: block;
      height: 100%; margin: 0; padding: 0; box-sizing: border-box;
      /* 站点/主题 CSS 会给 search input 强设底色边框，需 !important 压掉
         （WebKit searchfield 原生外观 + 站点规则都会导致白底自带边框撑高错位） */
      -webkit-appearance: none !important; appearance: none !important;
      background: transparent !important; border: 0 !important; border-radius: 0 !important;
      outline: 0 !important; box-shadow: none !important;
      color: #26384E; font-family: var(--wc-font); font-size: 13px; font-weight: 400;
    }
    .im-list-search input::placeholder { color: #97A5B6; }
    .im-list-search input::-webkit-search-decoration,
    .im-list-search input::-webkit-search-cancel-button { display: none; appearance: none; }
    /* 消息/未读：分段控件胶囊 */
    .im-list-chips {
      display: inline-flex; align-items: center; gap: 2px;
      background: #E5EAF0; border-radius: 14px; padding: 2px;
      flex-shrink: 0;
    }
    .im-chip {
      height: 24px; padding: 0 12px; border: 0; border-radius: 12px;
      background: transparent; color: var(--wc-text-2); font-size: 13px; cursor: pointer;
      font-family: var(--wc-font);
      display: inline-flex; align-items: center; gap: 3px;
      white-space: nowrap; flex-shrink: 0;
    }
    .im-chip .n { font-weight: 600; }
    .im-chip.active { background: #FFFFFF; color: var(--wc-text); font-weight: 600; box-shadow: 0 1px 3px rgba(31,35,41,.12); }
    .im-list-actions { display: flex; gap: 6px; margin-left: auto; align-items: center; }
    .im-chip-icon {
      width: 26px; height: 26px; border-radius: 7px; background: #E5EAF0;
      border: 0; display: grid; place-items: center; color: var(--wc-text-2); cursor: pointer; padding: 0;
    }
    .im-chip-icon:hover { background: #D8DFE8; }
    .im-chip-icon.is-on, .im-list-nav-toggle[aria-expanded="true"] { color: var(--wc-accent); background: var(--wc-accent-soft); }
    .im-chip-icon svg { width: 14px; height: 14px; }
    .im-list-nav-toggle[aria-expanded="true"] { color: var(--wc-accent); background: var(--wc-accent-soft); }
    .im-list-nav {
      display: none !important;
      position: absolute;
      top: 58px; left: 10px; right: 10px;
      z-index: 5;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px 12px;
      border: 1px solid #DCE3EC;
      border-radius: 8px;
      background: var(--wc-bg);
      box-shadow: 0 8px 24px rgba(44, 71, 105, .16);
    }
    .im-list-nav.open,
    .im-list-panel.im-list-nav-open .im-list-nav {
      display: flex !important;
    }
    .im-list-nav a {
      display: inline-flex; align-items: center;
      height: 28px; padding: 0 10px;
      border-radius: 6px;
      font-size: 12px; line-height: 1;
      color: var(--wc-text-2) !important;
      text-decoration: none !important;
      border: 0 !important;
      background: transparent;
      transition: background 0.15s, color 0.15s;
    }
    .im-list-nav a:hover {
      background: var(--wc-hover);
      color: var(--wc-text) !important;
    }
    .im-list-nav a.active {
      background: #CFE4FF;
      color: var(--wc-accent-strong) !important;
      font-weight: 500;
    }
    .im-list-nav .im-nav-period {
      display: inline-flex; align-items: center; gap: 2px;
      padding-left: 6px; margin-left: 2px;
      border-left: 1px solid var(--wc-border);
    }
    .im-list-nav .im-nav-native-cat {
      flex-basis: 100%;
      justify-content: center;
      margin-top: 4px; padding-top: 8px;
      border-top: 1px solid var(--wc-border);
      color: var(--wc-text-3) !important;
    }
    .im-icon-btn {
      width: 32px; height: 32px;
      border: none; border-radius: 8px;
      background: transparent; color: var(--wc-text-2);
      cursor: pointer; display: inline-flex;
      align-items: center; justify-content: center;
      transition: background 0.15s;
      padding: 0;
    }
    .im-icon-btn:hover { background: var(--wc-hover); }
    .im-icon-btn svg { width: 18px; height: 18px; }
    .im-list-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; }
    .im-list-body::-webkit-scrollbar { width: 6px; }
    .im-list-body::-webkit-scrollbar-thumb { background: var(--wc-border-strong); border-radius: 3px; }

    .im-conv {
      display: flex; gap: 10px;
      min-height: 62px;
      padding: 8px 13px;
      position: relative;
      text-decoration: none !important;
      cursor: pointer;
      transition: background 0.15s;
      border: none !important;
    }
    .im-conv:hover { background: #E8EEF6; }
    .im-conv.active { background: var(--wc-active); }
    .im-conv-avatar {
      width: 42px; height: 42px; border-radius: 6px;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 15px; font-weight: 600;
    }
    /* 头像模板返回的图片通常是 96px；必须约束到头像框，否则会按原始尺寸溢出并被裁成放大的局部。 */
    .im-conv-avatar img,
    .im-chat-avatar img {
      display: block;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }
    /* 伪装文字头像：保持圆形；实心 / 空心；字数 3～5 */
    .im-conv-avatar.is-text-avatar {
      box-sizing: border-box;
      padding: 3px;
      letter-spacing: 0;
      text-align: center;
    }
    .im-conv-avatar .im-avatar-text {
      line-height: 1; font-weight: 700;
      font-size: 13px;
    }
    .im-conv-avatar .im-avatar-text[data-len="1"] { font-size: 14px; }
    .im-conv-avatar.is-grid-mask {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 0;
      background: #C9E7FF;
      padding: 0;
      overflow: hidden;
    }
    .im-conv-avatar.is-grid-mask > span {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 100%;
      color: #fff; font-size: 7px; font-weight: 700; line-height: 1;
    }
    .im-mask-avatar-toggle.is-on {
      color: var(--wc-accent); background: var(--wc-accent-soft);
    }
    .im-conv-info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
    .im-conv-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .im-conv-avatar.is-group {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 0;
      background: #C9E7FF;
      padding: 0;
      overflow: hidden;
    }
    .im-conv-avatar.is-group img,
    .im-conv-avatar.is-group span {
      width: 100%; height: 100%; object-fit: cover; background: #D4E5FF;
    }
    .im-conv-title {
      display: flex; align-items: center; gap: 6px;
      min-width: 0; flex: 1;
    }
    .im-conv-name {
      font-size: 13px; font-weight: 500; color: #1B2A3B;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      flex: 1; min-width: 0;
    }
    .im-conv-tag {
      display: inline-flex; align-items: center;
      height: 16px; padding: 0 5px; border-radius: 4px;
      font-size: 10px; line-height: 1; white-space: nowrap; flex-shrink: 0;
      color: #2C79E9; background: #E8F2FF;
      border: 1px solid #B8D5FA;
    }
    .im-conv-time { font-size: 11px; color: #8A98AA; flex-shrink: 0; }
    .im-conv-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .im-conv-msg {
      font-size: 11px; color: #8A98AA;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .im-conv.active .im-conv-name,
    .im-conv.active .im-conv-msg,
    .im-conv.active .im-conv-time { color: #FFFFFF !important; }
    .im-conv.active .im-conv-tag {
      color: #FFFFFF;
      border-color: rgba(255,255,255,.45);
      background: rgba(255,255,255,.18);
    }
    /* 未读徽标贴头像右上角（行 padding 13/8 + 头像 42 → 压角定位），官方 5.x 样式 */
    .im-conv-badge {
      position: absolute; top: 4px; left: 47px; right: auto; bottom: auto; z-index: 1;
      min-width: 16px; height: 16px; padding: 0 4px;
      background: var(--wc-danger); color: #fff;
      font-size: 10px; font-weight: 700; line-height: 16px; text-align: center;
      border-radius: 8px; flex-shrink: 0;
    }
    .im-list-status {
      padding: 14px; text-align: center;
      font-size: 12px; color: var(--wc-text-3);
    }

    /* ---------- 右栏：聊天详情 ---------- */
    .im-chat-panel {
      position: fixed;
      top: var(--im-header-h);
      left: calc(var(--im-nav) + var(--im-nav2w) + var(--im-strip) + var(--im-list));
      right: 0; bottom: 0;
      background: var(--wc-chat-bg);
      display: flex; flex-direction: column;
      z-index: 420;
      font-family: var(--wc-font);
    }
    .im-chat-header {
      height: 80px; flex-shrink: 0;
      background: #FFFFFF;
      border-bottom: 1px solid #DCE3EB;
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 0 17px; gap: 12px;
    }
    /* 官方 5.x 头部只留标题 + 工具位，不放大头像 */
    .im-chat-avatar { display: none !important; }
    .im-chat-titles { min-width: 0; }
    .im-chat-title {
      font-size: 17px; font-weight: 700; color: #111827;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .im-chat-sub { font-size: 11px; color: #75849A; margin-top: 4px; }
    .im-chat-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .im-chat-body {
      flex: 1; overflow-y: auto;
      padding: 18px 17px 24px;
      display: flex; flex-direction: column; gap: 15px;
      overscroll-behavior: contain;
      background-color: var(--wc-chat-bg);
    }
    .im-chat-body::-webkit-scrollbar { width: 6px; }
    .im-chat-body::-webkit-scrollbar-thumb { background: var(--wc-border-strong); border-radius: 3px; }

    .im-msg { display: flex; gap: 9px; max-width: 82%; }
    .im-msg-other { align-self: flex-start; }
    .im-msg-me { align-self: flex-end; flex-direction: row-reverse; }
    .im-msg-avatar {
      width: 34px; height: 34px; border-radius: 5px;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 600;
    }
    .im-msg-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .im-msg-content { min-width: 0; display: flex; flex-direction: column; position: relative; }
    .im-msg-me .im-msg-content { align-items: flex-end; }
    .im-msg-name { font-size: 11px; color: #7F8EA2; margin-bottom: 4px; }
    .im-msg-me .im-msg-name { display: none; }
    .im-msg-bubble {
      position: relative;
      padding: 8px 11px;
      font-size: 13px; line-height: 1.55;
      color: var(--wc-text);
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .im-msg-other .im-msg-bubble {
      background: var(--wc-bubble-other);
      border-radius: 5px;
    }
    .im-msg-me .im-msg-bubble {
      background: var(--wc-bubble-me);
      border-radius: 5px;
    }
    /* 气泡小尾巴（颜色随明暗主题走 bubble token） */
    .im-msg-other .im-msg-bubble::before,
    .im-msg-me .im-msg-bubble::before {
      content: "";
      position: absolute;
      top: 12px;
      width: 0; height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
    }
    .im-msg-other .im-msg-bubble::before {
      left: -7px;
      border-right: 8px solid var(--wc-bubble-other);
    }
    .im-msg-me .im-msg-bubble::before {
      right: -7px;
      border-left: 8px solid var(--wc-bubble-me);
    }
    .im-msg-bubble p { margin: 0 0 8px; }
    .im-msg-bubble p:last-child { margin-bottom: 0; }
    .im-msg-bubble img { max-width: 100%; border-radius: 6px; }
    .im-msg-bubble img:not(.emoji):not(.site-icon) { cursor: zoom-in; }
    .im-msg-bubble pre {
      background: rgba(127,127,127,0.12);
      padding: 8px 10px; border-radius: 6px;
      overflow-x: auto; font-size: 13px;
    }
    .im-msg-bubble code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .im-msg-bubble blockquote {
      margin: 0 0 8px; padding: 4px 10px;
      border-left: 3px solid var(--wc-accent);
      background: rgba(67,137,245,.06);
      border-radius: 0 5px 5px 0;
    }
    .im-msg-bubble a { color: var(--wc-accent); }
    .im-msg-meta {
      font-size: 11px; color: var(--wc-text-3);
      margin-top: 4px; display: flex; gap: 8px; align-items: center;
    }
    .im-msg-time-sep {
      align-self: center;
      font-size: 12px; color: var(--wc-text-3);
      padding: 2px 10px;
    }
    .im-msg-tools {
      position: absolute; top: -14px; right: 0; z-index: 5;
      display: flex; align-items: center; gap: 2px;
      background: var(--wc-bg);
      border: 1px solid var(--wc-border);
      border-radius: 8px;
      padding: 2px;
      box-shadow: 0 2px 8px rgba(31, 35, 41, 0.1);
      opacity: 0; visibility: hidden;
      transition: opacity 0.15s ease;
    }
    .im-msg:hover .im-msg-tools { opacity: 1; visibility: visible; }
    .im-msg-me .im-msg-tools { right: auto; left: 0; }
    .im-msg-tool {
      width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; cursor: pointer;
      border-radius: 6px; color: var(--wc-text-2);
      padding: 0;
    }
    .im-msg-tool svg { width: 15px; height: 15px; }
    .im-msg-tool:hover { background: var(--wc-hover); color: var(--wc-accent); }
    .im-msg-tool.liked { color: var(--wc-accent); }

    .im-chat-empty, .im-chat-error, .im-chat-loading {
      margin: auto;
      display: flex; flex-direction: column;
      align-items: center; gap: 10px;
      color: var(--wc-text-3); font-size: 14px;
      text-align: center; padding: 40px 20px;
    }
    .im-chat-empty svg, .im-chat-error svg {
      width: 56px; height: 56px; opacity: 0.5;
    }
    .im-empty-btn {
      margin-top: 6px;
      border: 1px solid var(--wc-border-strong);
      background: var(--wc-bg); color: var(--wc-text-2);
      border-radius: 6px; height: 32px; padding: 0 14px;
      font-size: 13px; cursor: pointer; font-family: var(--wc-font);
    }
    .im-empty-btn:hover { background: var(--wc-hover); }

    /* ---------- 企业微信 5.x composer：灰底上的白色圆角卡片 ---------- */
    .im-composer {
      background: var(--wc-chat-bg); border-top: 0;
      padding: 0 16px 13px; flex-shrink: 0; /* 随卡内容收缩，与另两皮肤一致 */
    }
    .im-composer-card {
      background: #FFFFFF;
      border: 1px solid #D6DEE8;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(34,55,80,.03);
      cursor: text;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .im-composer-card:hover {
      border-color: #B8D0EF;
      box-shadow: none;
    }
    .im-composer-tools {
      display: flex; align-items: center; gap: 0; padding: 10px 10px 2px; /* 三皮肤统一格式 */
    }
    .im-composer-tools .im-icon-btn { width: 28px; height: 28px; }
    .im-composer-tools .spacer { flex: 1; }
    .im-composer-tools .hint { font-size: 11px; color: var(--wc-text-4); margin-right: 8px; }
    .im-image-input {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      opacity: 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
    }
    .im-send-btn {
      height: 26px; padding: 0 14px; border: 0; border-radius: 5px;
      background: transparent; color: #A8B0BC; font-size: 12px; cursor: default;
      font-family: var(--wc-font);
    }
    .im-send-btn:not(:disabled) {
      color: var(--wc-accent); cursor: pointer; font-weight: 500;
    }
    .im-send-btn:not(:disabled):hover { background: #EEF5FF; }
    .im-chat-tools { margin-left: auto; display: flex; gap: 2px; }
    .im-chat-tools .im-icon-btn { width: 32px; height: 32px; position: relative; }
    .im-chat-tools .dot,
    .im-composer-tools .dot {
      position: absolute; top: 6px; right: 6px; width: 6px; height: 6px;
      background: var(--wc-danger); border-radius: 50%;
    }
    .im-composer-tools .im-icon-btn { position: relative; }
    /* 回复引用条：官方左竖线 + 浅底 */
    .im-composer-target {
      min-height: 26px; margin: 4px 12px 0; padding: 4px 8px;
      border-left: 2px solid var(--wc-accent);
      border-radius: 0 4px 4px 0;
      background: #F3F7FC; color: #65758A; font-size: 11px;
    }
    .im-composer-target button { color: #8795A8; font-size: 12px; }
    .im-composer-tools .im-composer-status { margin-right: 8px; color: #8795A8; }
    .im-composer-tools .im-composer-status.busy { color: var(--wc-accent); }
    .im-composer-tools .im-composer-status.error { color: var(--wc-danger); }
    .im-composer-tools .im-composer-status.success { color: #31A05D; }

    /* ---------- 输入区：企微外观，内容同步给后台原生 composer ---------- */
    .im-chat-compose {
      position: relative;
      z-index: 430;
      flex-shrink: 0;
      margin: 0;
      min-height: 96px;
      max-height: 180px;
      overflow-y: auto;
      height: auto;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: #1F2D3D;
      display: flex; align-items: flex-start; gap: 8px;
      padding: 8px 12px 12px;
      cursor: text;
      font-size: 13px;
      line-height: 1.55;
      font-family: var(--wc-font);
      transition: color 0.15s;
      pointer-events: auto !important;
      width: 100%;
      text-align: left;
    }
    .im-chat-compose:hover { color: #1F2D3D; }
    .im-chat-compose.busy { color: var(--wc-accent); }
    .im-chat-compose.error { color: var(--wc-danger); }
    .im-chat-compose svg { width: 16px; height: 16px; flex-shrink: 0; }
    .im-chat-compose:not(.has-content)::before { color: #A8B0BC; opacity: 1; }
    .im-chat-panel[data-empty="1"] .im-composer { display: none; }

    /* 锁定态：原生主区不要抢走点击；原生 composer 仅作为后台提交引擎 */
    .__ROOT_CLASS__.__LOCK_CLASS__ #main-outlet-wrapper,
    .__ROOT_CLASS__.__LOCK_CLASS__ #main-outlet {
      pointer-events: none !important;
    }
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control:not(.open):not(.fullscreen):not(.edit-title) {
      display: none !important;
      pointer-events: none !important;
      z-index: 0 !important;
    }
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control.open,
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control.edit-title,
    .__ROOT_CLASS__.__LOCK_CLASS__ #reply-control.fullscreen {
      display: block !important;
      position: fixed !important;
      inset: 0 auto auto -10000px !important;
      width: 2px !important;
      min-width: 0 !important;
      max-width: 2px !important;
      height: 2px !important;
      min-height: 0 !important;
      max-height: 2px !important;
      overflow: hidden !important;
      opacity: 0 !important;
      visibility: hidden !important;
      user-select: none !important;
      clip-path: inset(50%) !important;
      pointer-events: none !important;
      box-shadow: none !important;
    }
    /* 原生编辑器可能把补全菜单挂到 body；IM 输入框不应被这些浮层打断。 */
    .__ROOT_CLASS__.__LOCK_CLASS__ .autocomplete,
    .__ROOT_CLASS__.__LOCK_CLASS__ .autocomplete-container,
    .__ROOT_CLASS__.__LOCK_CLASS__ .d-editor-popup,
    .__ROOT_CLASS__.__LOCK_CLASS__ .emoji-picker,
    .__ROOT_CLASS__.__LOCK_CLASS__ .tag-chooser {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* ---------- native 模式悬浮恢复钮 ---------- */
    .im-mode-fab {
      position: fixed; right: 20px; bottom: 20px; z-index: 10000;
      width: 44px; height: 44px; border-radius: 8px;
      background: var(--wc-accent); color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 5px 18px rgba(67,137,245,.32);
    }
    .im-mode-fab svg { width: 22px; height: 22px; }

    /* ---------- 聊天图片预览 ---------- */
    html.im-image-viewer-open,
    html.im-image-viewer-open body { overflow: hidden !important; }
    .im-image-viewer,
    .im-image-viewer * { box-sizing: border-box; }
    .im-image-viewer[hidden] { display: none !important; }
    .im-image-viewer {
      position: fixed;
      inset: 0;
      z-index: 2147483000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(10, 18, 29, .88);
      backdrop-filter: blur(3px);
      font-family: var(--wc-font);
    }
    .im-image-viewer-stage {
      position: absolute;
      inset: 70px 32px 56px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .im-image-viewer-image {
      display: block;
      max-width: 100%;
      max-height: 100%;
      border-radius: 6px;
      object-fit: contain;
      box-shadow: 0 18px 60px rgba(0, 0, 0, .42);
      transform: scale(var(--im-image-viewer-scale, 1));
      transform-origin: center;
      transition: transform 80ms ease-out;
      user-select: none;
      -webkit-user-drag: none;
      will-change: transform;
    }
    .im-image-viewer-close {
      position: fixed;
      top: 20px;
      right: 24px;
      z-index: 2;
      height: 40px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 0 14px;
      border: 1px solid rgba(255, 255, 255, .28);
      border-radius: 8px;
      background: rgba(255, 255, 255, .13);
      color: #FFFFFF;
      font: 13px var(--wc-font);
      cursor: pointer;
    }
    .im-image-viewer-close:hover,
    .im-image-viewer-close:focus-visible {
      outline: none;
      background: rgba(255, 255, 255, .24);
    }
    .im-image-viewer-close b { font-size: 24px; font-weight: 300; line-height: 1; }
    .im-image-viewer-zoom {
      position: fixed;
      top: 20px;
      left: 24px;
      z-index: 2;
      height: 40px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 13px;
      border: 1px solid rgba(255, 255, 255, .18);
      border-radius: 8px;
      background: rgba(0, 0, 0, .28);
      color: rgba(255, 255, 255, .68);
      font-size: 12px;
      pointer-events: none;
    }
    .im-image-viewer-zoom strong {
      min-width: 38px;
      color: #FFFFFF;
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      text-align: right;
    }
    .im-image-viewer-caption {
      position: fixed;
      left: 24px;
      right: 24px;
      bottom: 18px;
      overflow: hidden;
      color: rgba(255, 255, 255, .78);
      font-size: 12px;
      text-align: center;
      white-space: nowrap;
      text-overflow: ellipsis;
      pointer-events: none;
    }

    /* ---------- splash ---------- */
    .__ROOT_CLASS__ #d-splash { background: var(--wc-bg) !important; }
    .__ROOT_CLASS__ #d-splash .preloader-image { display: none !important; }
    .__ROOT_CLASS__ #d-splash .splash-logo-container {
      width: 96px !important; height: 96px !important;
      background-image: var(--wc-splash-logo) !important;
      background-size: contain !important;
      background-repeat: no-repeat !important;
      animation: none !important;
    }
    .__ROOT_CLASS__ #d-splash .dots { background-color: #4389F5 !important; filter: none !important; }

    /* ---------- 深色模式：官方深色配色（分层灰阶 + #338CFF 强调色） ---------- */
    .__ROOT_CLASS__.__DARK_CLASS__ {
      color-scheme: dark !important;
      --wc-blue: #338CFF;
      --wc-blue-hover: #4D9CFF;
      --wc-blue-soft: rgba(51,140,255,.16);
      --wc-blue-chip: #173153;
      --wc-title: #338CFF;
      --wc-accent: #338CFF;
      --wc-accent-soft: rgba(51,140,255,.16);
      --wc-accent-strong: #4D9CFF;
      --wc-nav2-bg: #101011;
      --wc-nav2-border: #2A2C2E;
      --wc-text: #F7F7F7;
      --wc-text-2: rgba(250,252,255,.72);
      --wc-text-3: rgba(250,252,255,.55);
      --wc-text-4: rgba(250,252,255,.4);
      --wc-bg: #101011;
      --wc-chat-bg: #101011;
      --wc-hover: #272829;
      --wc-active: #338CFF;
      --wc-bubble-other: #303031;
      --wc-bubble-me: #093159;
      --wc-border: rgba(255,255,255,.1);
      --wc-border-strong: rgba(255,255,255,.2);
      --wc-danger: #FF5962;
      --wc-rail-bg: #000000;
    }
    html.__ROOT_CLASS__.__DARK_CLASS__,
    html.__ROOT_CLASS__.__DARK_CLASS__ body {
      color-scheme: dark !important;
    }
    /* rail：纯黑工作台 */
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail {
      background: #000000;
      border-right-color: #2A2C2E;
      color: #9AA3AD;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-org-name { color: #F7F7F7; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-org-chip:hover { background: rgba(255,255,255,.07); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-org-chip > svg { color: #6B7683; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-item { color: #A6ADB5; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-item svg { color: #8A929B; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-item:hover { background: rgba(255,255,255,.07); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-item.active,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-more.is-on {
      color: var(--wc-accent);
      background: var(--wc-accent-soft);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-item.active svg,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-more.is-on svg { color: var(--wc-accent); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-bottom .im-rail-item { color: #9AA3AD; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-bottom .im-rail-item svg { color: #8A929B; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-badge { box-shadow: none; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-dot { background: var(--wc-danger); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail .im-rail-avatar-badge { box-shadow: 0 0 0 2px #000000; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-user-name { color: #F7F7F7; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-group-title,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-group-title svg { color: #6B7683; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-group-item { color: #9AA3AD; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-group-item svg { color: #8A929B; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail-count { background: rgba(255,255,255,.08); color: #A6ADB5; }
    /* 中栏 */
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-panel {
      background: #181819;
      border-right-color: #2A2C2E;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-chips { background: #2C2C2D; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-search { background: transparent; border-color: #2A2C2E; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-search:focus-within {
      background: #202021; border-color: transparent; box-shadow: inset 0 0 0 1px var(--wc-accent);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-search svg { color: #8A929B; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-search input { color: var(--wc-text); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-search input::placeholder { color: #6B7683; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chip.active {
      background: #383839; color: var(--wc-text); box-shadow: none;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chip-icon { background: #2C2C2D; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chip-icon:hover { background: #383839; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-nav {
      background: #202021;
      border-color: #2A2C2E;
      box-shadow: 0 8px 24px rgba(0,0,0,.5);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-nav a:hover { background: var(--wc-hover); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-list-nav a.active {
      background: var(--wc-accent-soft);
      color: var(--wc-accent) !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-conv:hover { background: var(--wc-hover); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-conv.active { background: var(--wc-active); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-conv-name { color: var(--wc-text); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-conv-msg,
    .__ROOT_CLASS__.__DARK_CLASS__ .im-conv-time { color: var(--wc-text-3); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-conv-tag {
      color: var(--wc-accent);
      background: #173153;
      border-color: rgba(51,140,255,.4);
    }
    /* 聊天区 */
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-header {
      background: #181819;
      border-bottom-color: #2A2C2E;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-title { color: var(--wc-text); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-sub { color: var(--wc-text-3); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-msg-name { color: var(--wc-text-3); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer { background: var(--wc-chat-bg); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer-card {
      background: #181819;
      border-color: #2A2C2E;
      box-shadow: none;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer-card:hover { border-color: #3A5070; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer-target {
      background: #202021; color: var(--wc-text-3); border-left-color: var(--wc-accent);
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer-target button { color: var(--wc-text-3); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer-tools .im-composer-status { color: var(--wc-text-3); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-compose { color: var(--wc-text); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-compose:hover { color: var(--wc-text); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-compose:not(.has-content)::before { color: var(--wc-text-4); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-send-btn:not(:disabled):hover { background: var(--wc-accent-soft); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-mode-fab { background: var(--wc-accent); }
    /* 原生侧栏（nav2）深色化 */
    .__ROOT_CLASS__.__DARK_CLASS__ .sidebar-wrapper {
      background-color: #181819 !important;
      border-right-color: #2A2C2E;
      --primary: #F7F7F7;
      --primary-medium: rgba(250,252,255,.72);
      --primary-low: rgba(250,252,255,.55);
      --primary-low-mid: rgba(250,252,255,.4);
      --primary-very-low: #202021;
      --primary-50: #181819;
      --primary-100: #202021;
      --primary-200: #2C2C2D;
      --primary-300: #383839;
      --secondary: #181819;
      --d-hover: #272829;
      --d-sidebar-background: #181819;
      --d-sidebar-border-color: #2A2C2E;
      color: #F7F7F7;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .sidebar-wrapper .sidebar-section-header,
    .__ROOT_CLASS__.__DARK_CLASS__ .sidebar-wrapper .sidebar-section-header-text {
      color: var(--wc-text-3) !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .sidebar-wrapper .sidebar-section-link {
      color: var(--wc-text-2) !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .sidebar-wrapper .sidebar-section-link:hover {
      background-color: #272829 !important;
      color: #F7F7F7 !important;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .sidebar-wrapper .sidebar-section-link.active {
      background-color: var(--wc-accent-soft) !important;
      color: var(--wc-accent) !important;
    }

    /* ---------- 窄屏降级 ---------- */
    @media (max-width: 1280px) {
      .__ROOT_CLASS__ { --im-list: 250px; }
    }
    @media (max-width: 1000px) {
      .__ROOT_CLASS__ { --im-nav2w: 0px !important; --im-strip: 0px !important; }
      .im-strip { display: none; }
      .__ROOT_CLASS__.__LOCK_CLASS__ .im-list-panel { width: calc(100% - var(--im-nav)); left: var(--im-nav); }
      .__ROOT_CLASS__.__LOCK_CLASS__.im-topic-open .im-list-panel { display: none; }
      .__ROOT_CLASS__.__LOCK_CLASS__:not(.im-topic-open) .im-chat-panel { display: none; }
      .__ROOT_CLASS__.__LOCK_CLASS__ .im-chat-panel { left: var(--im-nav); }
      .im-image-viewer-stage { inset: 68px 12px 44px; }
      .im-image-viewer-close { top: 14px; right: 14px; }
      .im-image-viewer-zoom { top: 14px; left: 14px; }
    }
  ` + "\n" + String.raw`/* im-* 变量补齐（映射自 --wc-*） */
html.im-theme {
  --im-blue: var(--wc-blue, #1A87FF);
  --im-blue-hover: var(--wc-blue-hover, #0A6FE0);
  --im-blue-soft: var(--wc-blue-soft, #E8F3FF);
  --im-blue-chip: var(--wc-blue-chip, #D6EBFF);
  --im-title: var(--wc-title, #1A87FF);
  --im-accent: var(--wc-accent, #1A87FF);
  --im-accent-soft: var(--wc-accent-soft, #E8F3FF);
  --im-nav2-bg: var(--wc-nav2-bg, #FFFFFF);
  --im-nav2-border: var(--wc-nav2-border, #E6E8EB);
  --im-text: var(--wc-text, #1A1D24);
  --im-text-2: var(--wc-text-2, #4A4F5C);
  --im-text-3: var(--wc-text-3, #8A8F99);
  --im-text-4: var(--wc-text-4, #B0B4BE);
  --im-bg: var(--wc-bg, #FFFFFF);
  --im-chat-bg: var(--wc-chat-bg, #F5F7FB);
  --im-hover: var(--wc-hover, #ECF0F7);
  --im-active: var(--wc-active, #E4EAF5);
  --im-bubble-other: var(--wc-bubble-other, #FFFFFF);
  --im-bubble-me: var(--wc-bubble-me, #D4E5FF);
  --im-border: var(--wc-border, #E6E8EB);
  --im-border-strong: var(--wc-border-strong, #D5D8DE);
  --im-danger: var(--wc-danger, #FF4D4F);
  --im-rail-bg: var(--wc-rail-bg, #F3F4F6);
  --im-strip-bg: var(--wc-strip-bg, transparent);
  --im-font: var(--wc-font, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Inter, -apple-system, BlinkMacSystemFont, sans-serif)
}
`;
  const CSS_WECOM_BRIDGE = String.raw`/* im-* 变量补齐（映射自 --wc-*） */
html.im-theme {
  --im-blue: var(--wc-blue, #1A87FF);
  --im-blue-hover: var(--wc-blue-hover, #0A6FE0);
  --im-blue-soft: var(--wc-blue-soft, #E8F3FF);
  --im-blue-chip: var(--wc-blue-chip, #D6EBFF);
  --im-title: var(--wc-title, #1A87FF);
  --im-accent: var(--wc-accent, #1A87FF);
  --im-accent-soft: var(--wc-accent-soft, #E8F3FF);
  --im-nav2-bg: var(--wc-nav2-bg, #FFFFFF);
  --im-nav2-border: var(--wc-nav2-border, #E6E8EB);
  --im-text: var(--wc-text, #1A1D24);
  --im-text-2: var(--wc-text-2, #4A4F5C);
  --im-text-3: var(--wc-text-3, #8A8F99);
  --im-text-4: var(--wc-text-4, #B0B4BE);
  --im-bg: var(--wc-bg, #FFFFFF);
  --im-chat-bg: var(--wc-chat-bg, #F5F7FB);
  --im-hover: var(--wc-hover, #ECF0F7);
  --im-active: var(--wc-active, #E4EAF5);
  --im-bubble-other: var(--wc-bubble-other, #FFFFFF);
  --im-bubble-me: var(--wc-bubble-me, #D4E5FF);
  --im-border: var(--wc-border, #E6E8EB);
  --im-border-strong: var(--wc-border-strong, #D5D8DE);
  --im-danger: var(--wc-danger, #FF4D4F);
  --im-rail-bg: var(--wc-rail-bg, #F3F4F6);
  --im-strip-bg: var(--wc-strip-bg, transparent);
  --im-font: var(--wc-font, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Inter, -apple-system, BlinkMacSystemFont, sans-serif)
}
`;
  const CSS_FS_BRIDGE = String.raw`/* im-* 变量补齐（映射自 --im-*） */
html.im-theme {
  --im-blue: #1A87FF;
  --im-blue-hover: #0A6FE0;
  --im-blue-soft: #E8F3FF;
  --im-blue-chip: #D6EBFF;
  --im-title: #1A87FF;
  --im-text-4: #B0B4BE
}
`;
  const CSS_FS_FULL = CSS_FS + "\n" + CSS_FS_BRIDGE + "\n" + CSS_CORE_EXTRA;
  function interpolate(css) {
    return css.replace(/__ROOT_CLASS__/g, ROOT_CLASS$1).replace(/__DARK_CLASS__/g, DARK_CLASS).replace(/__LOCK_CLASS__/g, LOCK_CLASS).replace(/__RAIL_WIDTH__/g, String(RAIL_WIDTH)).replace(/__NAV2_WIDTH__/g, String(NAV2_WIDTH)).replace(/__STRIP_WIDTH__/g, String(STRIP_WIDTH)).replace(/__LIST_WIDTH__/g, String(LIST_WIDTH)).replace(/__TITLEBAR_HEIGHT__/g, String(TITLEBAR_HEIGHT));
  }
  function skinCss() {
    let css;
    if (SKIN_ID === "feishu") css = CSS_FS_FULL;
    else if (SKIN_ID === "wecom") css = CSS_WECOM + "\n" + CSS_WECOM_BRIDGE + "\n" + CSS_CORE_EXTRA;
    else css = CSS_DD + "\n" + CSS_CORE_EXTRA;
    return interpolate(css);
  }
  function debounce(fn, wait) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }
  const listState = {
    apiPath: "",
    moreUrl: null,
    loading: false,
    topics: [],
    usersById: {},
    query: ""
    // 中栏本地搜索关键字（wecom 搜索框；renderListRows 按标题过滤）
  };
  const DEFAULT_LIST_NAV = [
    { href: "/latest", label: "最新" },
    { href: "/new", label: "新" },
    { href: "/unseen", label: "未读" },
    { href: "/hot", label: "热门" },
    { href: "/top", label: "排行榜" },
    { href: "/posted", label: "我的帖子" },
    { href: "/read", label: "已读" },
    { href: "/bookmarks", label: "书签" },
    { href: "/categories", label: "类别" }
  ];
  const chatState = {
    topicId: null,
    loading: false,
    stream: [],
    // 全部 post id 顺序
    renderedFirstIdx: 0,
    // stream 中已渲染的起始下标
    renderedLastIdx: -1,
    // stream 中已渲染的结束下标
    renderedLastNumber: 0,
    // 已渲染的最大 post_number
    totalPosts: 0,
    // 话题总楼数（posts_count，选择楼层用）
    hasOlder: false,
    hasNewer: false,
    title: "",
    op: null
    // 当前话题 OP 楼（详情头部头像/伪装复用）
  };
  const topicPostsMap = /* @__PURE__ */ new Map();
  function getViewMode() {
    try {
      return localStorage.getItem(VIEW_KEY) === "native" ? "native" : "im";
    } catch {
      return "im";
    }
  }
  function setViewMode(mode) {
    try {
      localStorage.setItem(VIEW_KEY, mode);
    } catch {
    }
  }
  let faviconObserver = null;
  let faviconApplying = false;
  function makeFavicon() {
    const head = document.head;
    if (!head || faviconApplying) return;
    faviconApplying = true;
    try {
      const href = FAVICON_URI;
      const icons = head.querySelectorAll(
        "link[rel='icon'], link[rel='shortcut icon'], link[rel~='icon'], link[rel='apple-touch-icon'], link[rel='apple-touch-icon-precomposed'], link[rel='mask-icon']"
      );
      for (const icon of icons) {
        if (icon.id && icon.id !== FAVICON_ID) icon.removeAttribute("id");
        if (icon.getAttribute("href") !== href) icon.setAttribute("href", href);
        if (icon.rel === "mask-icon") continue;
        if (icon.getAttribute("type") !== "image/x-icon") icon.setAttribute("type", "image/x-icon");
        if (!icon.getAttribute("sizes")) icon.setAttribute("sizes", "any");
      }
      let link = document.getElementById(FAVICON_ID);
      if (!link) {
        link = document.createElement("link");
        link.id = FAVICON_ID;
        link.rel = "icon";
        link.type = "image/x-icon";
        link.sizes = "any";
        link.setAttribute("href", href);
        head.appendChild(link);
      } else if (link.getAttribute("href") !== href) {
        link.setAttribute("href", href);
      }
      let shortcut = head.querySelector("link[data-im-shortcut='1']");
      if (!shortcut) {
        shortcut = document.createElement("link");
        shortcut.rel = "shortcut icon";
        shortcut.type = "image/x-icon";
        shortcut.dataset.imShortcut = "1";
        shortcut.setAttribute("href", href);
        head.insertBefore(shortcut, head.firstChild);
      } else if (shortcut.getAttribute("href") !== href) {
        shortcut.setAttribute("href", href);
      }
      if (!faviconObserver) {
        faviconObserver = new MutationObserver(() => {
          if (faviconApplying) return;
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
  function restyleSplash() {
    const splash = document.getElementById("d-splash");
    if (!splash) return;
    document.documentElement.style.setProperty(
      "--im-splash-logo",
      `url("${FAVICON_URI}")`
    );
  }
  let schemeObserver = null;
  let forcingScheme = false;
  const themeChangeListeners = [];
  function onColorThemeChange(fn) {
    themeChangeListeners.push(fn);
  }
  function getColorTheme() {
    try {
      const mode = localStorage.getItem(COLOR_THEME_KEY);
      return mode === "dark" || mode === "light" ? mode : "auto";
    } catch {
      return "auto";
    }
  }
  function isDarkEffective() {
    const mode = getColorTheme();
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return !!(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
  function setColorTheme(mode) {
    try {
      localStorage.setItem(COLOR_THEME_KEY, mode);
    } catch {
    }
    applyColorMode();
    forceSiteScheme();
    for (const fn of themeChangeListeners) fn();
  }
  function toggleColorTheme() {
    const next = isDarkEffective() ? "light" : "dark";
    setColorTheme(next);
  }
  function applyColorMode() {
    const dark = isDarkEffective();
    document.documentElement.classList.toggle(DARK_CLASS, dark);
  }
  const SCHEME_CLASSES = ["dark", "dark-scheme", "scheme-dark"];
  function forceSchemeInDoc(doc) {
    if (!(doc == null ? void 0 : doc.documentElement)) return false;
    const dark = isDarkEffective();
    const scheme = dark ? "dark" : "light";
    let changed = false;
    try {
      for (const el of [doc.documentElement, doc.body]) {
        if (!el) continue;
        if (el.style.colorScheme !== scheme) {
          el.style.colorScheme = scheme;
          changed = true;
        }
        const present = SCHEME_CLASSES.filter((c) => el.classList.contains(c));
        const want = dark ? SCHEME_CLASSES.length : 0;
        if (present.length !== want) {
          for (const c of SCHEME_CLASSES) el.classList.toggle(c, dark);
          changed = true;
        }
      }
      const darkLinks = doc.querySelectorAll("link.dark-scheme, link[class*='dark-scheme']");
      const lightLinks = doc.querySelectorAll("link.light-scheme, link[class*='light-scheme']");
      const setLink = (link, on) => {
        if (on ? link.media !== "all" || link.disabled : link.media !== "none" || !link.disabled) changed = true;
        link.media = on ? "all" : "none";
        link.disabled = !on;
      };
      for (const link of darkLinks) setLink(link, dark);
      for (const link of lightLinks) setLink(link, !dark);
    } catch {
    }
    return changed;
  }
  function forceSiteScheme() {
    if (otherThemeActive()) return;
    forcingScheme = true;
    try {
      forceSchemeInDoc(document);
    } finally {
      forcingScheme = false;
    }
    ensureSchemeObserver();
  }
  function watchSchemeDoc(doc) {
    if (!doc || doc.__imSchemeWatch || typeof MutationObserver === "undefined") return;
    doc.__imSchemeWatch = true;
    const obs = new MutationObserver(() => {
      if (forcingScheme) return;
      forceSchemeInDoc(doc);
    });
    const start = () => {
      const root2 = doc.head || doc.documentElement;
      if (!root2) return;
      obs.observe(root2, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["media", "disabled", "class", "href"]
      });
    };
    start();
  }
  function ensureSchemeObserver() {
    if (schemeObserver || typeof MutationObserver === "undefined") return;
    schemeObserver = new MutationObserver(() => {
      if (forcingScheme || otherThemeActive()) return;
      forceSiteScheme();
    });
    const start = () => {
      const root2 = document.head || document.documentElement;
      if (!root2) return;
      schemeObserver.observe(root2, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["media", "disabled", "class", "href"]
      });
    };
    start();
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    (_b = (_a = window.matchMedia("(prefers-color-scheme: dark)")).addEventListener) == null ? void 0 : _b.call(_a, "change", () => {
      if (getColorTheme() !== "auto") return;
      applyColorMode();
      forceSiteScheme();
      for (const fn of themeChangeListeners) fn();
    });
  }
  function formatTime(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const now = Date.now();
    const diff = now - date.getTime();
    const minute = 6e4, hour = 36e5, day = 864e5;
    if (diff < minute) return "刚刚";
    if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
    if (diff < day && date.getDate() === (/* @__PURE__ */ new Date()).getDate()) {
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    if (diff < 2 * day) return "昨天";
    if (diff < 365 * day) return `${date.getMonth() + 1}-${String(date.getDate()).padStart(2, "0")}`;
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
  function formatClock(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
  function stripTags(s) {
    return String(s || "").replace(/<[^>]*>/g, "");
  }
  function fmtDuration(sec) {
    const s = Number(sec || 0);
    if (s >= 3600) return `${Math.round(s / 360) / 10} 小时`;
    if (s >= 60) return `${Math.round(s / 60)} 分钟`;
    return `${s} 秒`;
  }
  function fmtMonth(iso) {
    const m = String(iso || "").match(/^(\d{4})-(\d{2})/);
    return m ? `${m[1]}年${m[2]}月` : "";
  }
  function refreshAllRelativeTimes() {
    const timeEls = document.querySelectorAll(".im-conv-time[data-timestamp], .im-msg-time[data-timestamp]");
    for (const el of timeEls) {
      const ts = el.dataset.timestamp;
      if (!ts) continue;
      const nextText = formatTime(ts);
      if (nextText && el.textContent !== nextText) {
        el.textContent = nextText;
      }
    }
  }
  let relativeTimeTickerId = null;
  function ensureRelativeTimeTicker() {
    if (relativeTimeTickerId) return;
    relativeTimeTickerId = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshAllRelativeTimes();
      }
    }, 15e3);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        refreshAllRelativeTimes();
      }
    });
  }
  const ICONS = {
    msg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4.2 3.2A.8.8 0 0 1 4.5 18.6V6.5Z" stroke="currentColor" stroke-width="1.7"/></svg>`,
    doc: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 4.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 19V6A1.5 1.5 0 0 1 7 4.5Z" stroke="currentColor" stroke-width="1.7"/><path d="M14 4.5V9h4.5" stroke="currentColor" stroke-width="1.7"/></svg>`,
    work: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.7"/><rect x="13" y="4" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.7"/><rect x="4" y="13" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.7"/><rect x="13" y="13" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.7"/></svg>`,
    book: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M9 9h6M9 13h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    meet: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4.5 8.5A2.5 2.5 0 0 1 7 6h6.5A2.5 2.5 0 0 1 16 8.5v7A2.5 2.5 0 0 1 13.5 18H7A2.5 2.5 0 0 1 4.5 15.5v-7Z" stroke="currentColor" stroke-width="1.7"/><path d="M16 10.2l4-2.2v8l-4-2.2" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`,
    disk: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 8.5L12 4l8 4.5v7L12 20 4 15.5v-7Z" stroke="currentColor" stroke-width="1.7"/><path d="M12 20v-7.5M4 8.5l8 4 8-4" stroke="currentColor" stroke-width="1.7"/></svg>`,
    cal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4.5" y="5.5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 4v3M16 4v3M4.5 10h15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    todo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    ding: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4v3M8 8a4 4 0 1 1 8 0c0 3-4 4.5-4 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="18.5" r="1.3" fill="currentColor"/></svg>`,
    proj: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 8h14v10.5A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5V8Z" stroke="currentColor" stroke-width="1.7"/><path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" stroke="currentColor" stroke-width="1.7"/></svg>`,
    mail: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M5 8l7 5 7-5" stroke="currentColor" stroke-width="1.7"/></svg>`,
    bookmark: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`,
    apps: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="7" r="2.1" stroke="currentColor" stroke-width="1.7"/><circle cx="17" cy="7" r="2.1" stroke="currentColor" stroke-width="1.7"/><circle cx="7" cy="17" r="2.1" stroke="currentColor" stroke-width="1.7"/><circle cx="17" cy="17" r="2.1" stroke="currentColor" stroke-width="1.7"/></svg>`,
    build: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 19V9l5-4 5 4v10" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 19v-5h4v5" stroke="currentColor" stroke-width="1.7"/></svg>`,
    more: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/></svg>`,
    clock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    grid: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="5" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.7"/><rect x="13" y="5" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.7"/><rect x="5" y="13" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.7"/><rect x="13" y="13" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.7"/></svg>`,
    spark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 4.5h3.2l1 3.2-2 1.4a11 11 0 0 0 5.7 5.7l1.4-2 3.2 1V17a2 2 0 0 1-2.2 2A15 15 0 0 1 5 6.7 2 2 0 0 1 7 4.5Z" stroke="currentColor" stroke-width="1.6"/></svg>`,
    plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    mute: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10 8H7v8h3l5 3V5l-5 3Z" stroke="currentColor" stroke-width="1.6"/><path d="M18 9l3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    bell: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 16h12l-1.2-2.2a6.5 6.5 0 0 1-.8-3.3V9a4 4 0 1 0-8 0v1.5c0 1.16-.28 2.3-.8 3.3L6 16Z" stroke="currentColor" stroke-width="1.6"/><path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.6"/></svg>`,
    users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 18a4.5 4.5 0 0 1 9 0" stroke="currentColor" stroke-width="1.6"/><circle cx="16.5" cy="9.5" r="2.3" stroke="currentColor" stroke-width="1.6"/><path d="M15 18c.4-1.6 1.6-2.8 3.4-3.2" stroke="currentColor" stroke-width="1.6"/></svg>`,
    win: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M5 10h14" stroke="currentColor" stroke-width="1.6"/></svg>`,
    gear: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.4 6.4l1.4 1.4M16.2 16.2l1.4 1.4M17.6 6.4l-1.4 1.4M7.8 16.2l-1.4 1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    emoji: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 14.2c.9 1.3 2.1 2 3.5 2s2.6-.7 3.5-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>`,
    like: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 11V20H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h2Zm0 0 3.2-6.2A2 2 0 0 1 13 3.6V8h5.2a2 2 0 0 1 1.96 2.4l-1.2 6A2 2 0 0 1 17 18h-9" stroke="currentColor" stroke-width="1.6"/></svg>`,
    cut: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="17" r="2.2" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="17" r="2.2" stroke="currentColor" stroke-width="1.6"/><path d="M8.8 15.4L16 5M15.2 15.4L8 5" stroke="currentColor" stroke-width="1.6"/></svg>`,
    folder: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 8h6l2 2h8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" stroke="currentColor" stroke-width="1.6"/></svg>`,
    pic: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="10" r="1.4" stroke="currentColor" stroke-width="1.4"/><path d="M5 16l4.5-4 3 3 2-2L19 16" stroke="currentColor" stroke-width="1.6"/></svg>`,
    collect: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5l1.7 4.4H18l-3.5 2.7 1.3 4.4L12 14.6 8.2 16.5l1.3-4.4L6 9.4h4.3L12 5Z" stroke="currentColor" stroke-width="1.6"/></svg>`,
    file: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 4h7l4 4v12H7V4Z" stroke="currentColor" stroke-width="1.6"/><path d="M14 4v4h4" stroke="currentColor" stroke-width="1.6"/></svg>`,
    bolt: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 3L6 14h6l-1 7 7-11h-6l1-7Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    cam: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="7" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M15.5 10.5l5-2.5v8l-5-2.5" stroke="currentColor" stroke-width="1.6"/></svg>`,
    redpack: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M6 9h12" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9" r="1.6" fill="currentColor"/></svg>`,
    dots: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/></svg>`,
    expand: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 6h4v4M10 18H6v-4M18 6l-5 5M6 18l5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    refresh: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M20 4v5h-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    external: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 5h5v5M19 5l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 7H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" stroke="currentColor" stroke-width="1.6"/></svg>`,
    reply: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 14L4 9l5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 9h10a6 6 0 0 1 0 12h-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    menu: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    chevronUp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    chevronsLeft: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 7l-5 5 5 5M18 7l-5 5 5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    compose: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 17.5V20h2.5L18 8.5 15.5 6 4 17.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13.8 7.7l2.5 2.5" stroke="currentColor" stroke-width="1.6"/></svg>`,
    filter: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h11M4 18h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    disguise: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="1.6"/><path d="M8 14c1.2 1.4 2.5 2 4 2s2.8-.6 4-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>`,
    aitable: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="4.5" width="16" height="15" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M4 9.5h16M9.6 9.5v10M15.4 9.5v10" stroke="currentColor" stroke-width="1.7"/></svg>`,
    aimic: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="9" y="3.5" width="6" height="11" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    monitor: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M9 20.5h6M12 17v3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    at: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M15.2 8.8v4.4a2.4 2.4 0 0 0 4.8 0V12a8 8 0 1 0-3.4 6.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    rocket: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2.5c0 0-7 4.5-7 11.5 0 2.5 1.5 5 3 6.5l4-3 4 3c1.5-1.5 3-4 3-6.5 0-7-7-11.5-7-11.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="11" r="1.5" fill="currentColor"/></svg>`,
    trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    moon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 1 0 9.5 9.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    sun: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    heartOutline: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 11V20H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h2Zm0 0 3.2-6.2A2 2 0 0 1 13 3.6V8h5.2a2 2 0 0 1 1.96 2.4l-1.2 6A2 2 0 0 1 17 18h-9" stroke="currentColor" stroke-width="1.6"/></svg>`,
    heartFilled: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.86-8.55 12.54L12 21.35Z"/></svg>`,
    scrollTop: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  };
  ICONS.chat = ICONS.msg;
  ICONS.list = ICONS.msg;
  ICONS.calendar = ICONS.cal;
  ICONS.worktable = ICONS.work;
  ICONS.cloud = ICONS.doc;
  ICONS.wiki = ICONS.doc;
  ICONS.task = ICONS.todo;
  ICONS.contacts = ICONS.book;
  ICONS.project = ICONS.proj;
  ICONS.chat = ICONS.msg;
  ICONS.list = ICONS.msg;
  ICONS.calendar = ICONS.cal;
  ICONS.worktable = ICONS.work;
  ICONS.cloud = ICONS.doc;
  ICONS.wiki = ICONS.doc;
  ICONS.task = ICONS.todo;
  ICONS.contacts = ICONS.book;
  ICONS.project = ICONS.proj;
  ICONS.msgFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4c-4.7 0-8.4 3-8.4 7 0 2.2 1.1 4.2 2.9 5.5l-.6 3 3.5-1.7c.8.2 1.7.3 2.6.3 4.7 0 8.4-3 8.4-7S16.7 4 12 4Z"/></svg>`;
  ICONS.bellFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a6.2 6.2 0 0 0-6.2 6.2v2.9l-1.5 2.8c-.4.7.1 1.6 1 1.6h13.4c.9 0 1.4-.9 1-1.6l-1.5-2.8V9.2A6.2 6.2 0 0 0 12 3Z"/><path d="M9.7 18.6a2.4 2.4 0 0 0 4.6 0h-4.6Z"/></svg>`;
  ICONS.mailFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 7A2.5 2.5 0 0 1 6.5 4.5h11A2.5 2.5 0 0 1 20 7v.5l-8 4.4-8-4.4V7Z"/><path d="M4 9.9v7.1a2.5 2.5 0 0 0 2.5 2.5h11a2.5 2.5 0 0 0 2.5-2.5V9.9l-7.5 4.1a1 1 0 0 1-1 0L4 9.9Z"/></svg>`;
  ICONS.bookmarkFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 3.5h10A1.2 1.2 0 0 1 18.2 4.7v14.8c0 .9-1 1.4-1.7.9L12 16.9l-4.5 3.5c-.7.5-1.7 0-1.7-.9V4.7A1.2 1.2 0 0 1 7 3.5Z"/></svg>`;
  ICONS.usersFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8.4" r="3.3"/><path d="M3.3 18.6c.4-3 2.8-5 5.7-5s5.3 2 5.7 5l.1.7H3.2l.1-.7Z"/><circle cx="16.9" cy="9.2" r="2.5"/><path d="M16.6 13.8c2.3.3 4 2 4.3 4.3l.1.7h-4.4l-.1-.7c-.2-1.7-1-3.2-2.2-4.1.5-.2 1-.2 1.6-.2h.7Z"/></svg>`;
  ICONS.docFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 3h7.3L19 8.2V20a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M13.8 3.4V8.2h4.8L13.8 3.4Z" fill="#FFFFFF" opacity=".4"/></svg>`;
  ICONS.aitableFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/></svg>`;
  ICONS.aimicFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="9.2" y="3.2" width="5.6" height="10.2" rx="2.8"/><path d="M6 11.6a6 6 0 0 0 12 0h-1.9a4.1 4.1 0 0 1-8.2 0H6Z"/><rect x="11.1" y="17.6" width="1.8" height="3.2" rx=".9"/></svg>`;
  ICONS.workFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.2 5.4c0-.8.6-1.4 1.4-1.4h2.8c.8 0 1.4.6 1.4 1.4V7h3.7A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V8.5A1.5 1.5 0 0 1 5.5 7h3.7V5.4ZM10.9 7h2.2V5.7h-2.2V7Z"/></svg>`;
  ICONS.bookFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4.2A1.7 1.7 0 0 1 6.7 2.5h10.6A1.7 1.7 0 0 1 19 4.2v15.6a1.7 1.7 0 0 1-1.7 1.7H6.7A1.7 1.7 0 0 1 5 19.8V4.2Z"/><circle cx="12" cy="9.4" r="2.1" fill="#FFFFFF" opacity=".92"/><path d="M8.6 16.6c.4-1.7 1.8-2.7 3.4-2.7s3 1 3.4 2.7l.1.4H8.5l.1-.4Z" fill="#FFFFFF" opacity=".92"/></svg>`;
  ICONS.meetFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3.4" y="6.4" width="12.2" height="11.2" rx="2"/><path d="M15.6 10.6l3.9-2.3a.8.8 0 0 1 1.2.7v6a.8.8 0 0 1-1.2.7l-3.9-2.3v-2.8Z"/></svg>`;
  ICONS.calFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 3.6c0-.6.4-1 1-1s1 .4 1 1V5h6V3.6c0-.6.4-1 1-1s1 .4 1 1V5h.5A1.5 1.5 0 0 1 20 6.5V9H4V6.5A1.5 1.5 0 0 1 5.5 5H7V3.6Z"/><path d="M4 10.5h16v8A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-8Z"/></svg>`;
  ICONS.todoFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3.2"/><path d="M8.4 12.2l2.5 2.5 4.9-5" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  ICONS.plusFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8.6"/><path d="M12 8.2v7.6M8.2 12h7.6" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  ICONS.fileFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 3h7.3L19 8.2V20a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M13.8 3.4V8.2h4.8L13.8 3.4Z" fill="#FFFFFF" opacity=".4"/><path d="M8.6 12.4h6.8M8.6 15.6h6.8" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  ICONS.sparkFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l1.7 5.1L19 9.8l-5.3 1.7L12 16.6l-1.7-5.1L5 9.8l5.3-1.7L12 3Z"/><path d="M18.6 14.6l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9.9-2.5Z"/></svg>`;
  ICONS.diskFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7.2 18.5a4.4 4.4 0 0 1-.7-8.7 5.4 5.4 0 0 1 10.5-1 4.7 4.7 0 0 1-.6 9.7H7.2Z"/></svg>`;
  ICONS.appsFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="7" r="2.4"/><circle cx="17" cy="7" r="2.4"/><circle cx="7" cy="17" r="2.4"/><circle cx="17" cy="17" r="2.4"/></svg>`;
  const chatHooks = {
    wireComposer: null,
    // composer：编辑器接线
    replyToPost: null,
    // composer：回复某楼
    toast: null,
    // features：轻提示
    toggleLike: null,
    // features：点赞
    openImageModal: null,
    // features：沉浸灯箱
    openBoostComposer: null,
    // features：小火箭输入条
    deleteBoost: null,
    // features：删除小火箭
    renderBoosts: null,
    // features：小火箭胶囊 html
    cantUndoText: null,
    // features：原生「无法撤销」文案
    pushQuoteJump: null,
    // features：引用跳转压栈
    clearQuoteJumpHistory: null,
    // features：清空返回堆栈
    popQuoteJump: null,
    // features：返回原处
    jumpToPost: null,
    // chat-panel：话题已打开时滚动/高亮某楼（列表行重复点击用）
    refreshMaskedChrome: null,
    // chat-panel：匿名伪装开关切换后重涂详情页头部标题/头像
    enhancePolls: null
    // features：投票组件增强
  };
  let listReloader = null;
  function onListReload(fn) {
    listReloader = fn;
  }
  function isMaskAvatar() {
    try {
      return localStorage.getItem(MASK_AVATAR_KEY) === "1";
    } catch {
      return false;
    }
  }
  function isMaskTitle() {
    try {
      return localStorage.getItem(MASK_TITLE_KEY) === "1";
    } catch {
      return false;
    }
  }
  function isHideCatTags() {
    try {
      return localStorage.getItem(HIDE_CAT_TAGS_KEY) === "1";
    } catch {
      return false;
    }
  }
  function setMaskAvatar(on) {
    var _a2;
    try {
      localStorage.setItem(MASK_AVATAR_KEY, on ? "1" : "0");
    } catch {
    }
    const panel = document.querySelector(".im-list-panel");
    ensureMaskAvatarToggle(panel);
    if (listState.topics && listState.topics.length) {
      listReloader == null ? void 0 : listReloader("rows");
    } else if (panel) {
      listReloader == null ? void 0 : listReloader("load");
    }
    (_a2 = chatHooks.refreshMaskedChrome) == null ? void 0 : _a2.call(chatHooks);
  }
  function setMaskTitle(on) {
    var _a2;
    try {
      localStorage.setItem(MASK_TITLE_KEY, on ? "1" : "0");
    } catch {
    }
    const panel = document.querySelector(".im-list-panel");
    ensureMaskTitleToggle(panel);
    if (listState.topics && listState.topics.length) {
      listReloader == null ? void 0 : listReloader("rows");
    } else if (panel) {
      listReloader == null ? void 0 : listReloader("load");
    }
    (_a2 = chatHooks.refreshMaskedChrome) == null ? void 0 : _a2.call(chatHooks);
  }
  function ensureMaskAvatarToggle(panel) {
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
  function ensureMaskTitleToggle(panel) {
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
  function discourseRequire(moduleId) {
    try {
      if (typeof window.require === "function") return window.require(moduleId);
    } catch {
    }
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
    var _a2, _b2;
    try {
      if ((_a2 = window.Discourse) == null ? void 0 : _a2.__container__) return window.Discourse.__container__;
      const Ember = window.Ember;
      const namespaces = (_b2 = Ember == null ? void 0 : Ember.Namespace) == null ? void 0 : _b2.NAMESPACES;
      if (Array.isArray(namespaces)) {
        const app = namespaces.find(
          (n) => n && (n.name === "Discourse" || n.modulePrefix === "discourse" || n.NAMESPACE === "Discourse")
        );
        if (app == null ? void 0 : app.__container__) return app.__container__;
        if (typeof (app == null ? void 0 : app.lookup) === "function") return app;
      }
      const mod = discourseRequire("discourse-common/lib/get-owner") || discourseRequire("discourse/lib/get-owner");
      if (mod) {
        const owner = typeof mod.getOwnerWithFallback === "function" && mod.getOwnerWithFallback(window.Discourse) || typeof mod.getOwner === "function" && mod.getOwner(window.Discourse) || null;
        if (owner) return owner;
      }
      try {
        const appMod = discourseRequire("discourse/app");
        const app = (appMod == null ? void 0 : appMod.default) || appMod;
        if (app == null ? void 0 : app.__container__) return app.__container__;
        if (typeof (app == null ? void 0 : app.lookup) === "function") return app;
      } catch {
      }
    } catch (err) {
      console.warn("[linuxdo-im] getEmberOwner failed", err);
    }
    return null;
  }
  function getComposerService(owner) {
    return safeLookup(owner, "service:composer") || safeLookup(owner, "controller:composer");
  }
  function getTopicModel(owner) {
    var _a2;
    const topicController = safeLookup(owner, "controller:topic");
    if (!topicController) return null;
    try {
      return ((_a2 = topicController.get) == null ? void 0 : _a2.call(topicController, "model")) || topicController.model || null;
    } catch {
      return null;
    }
  }
  function findLoadedPost(topic, postNumber) {
    var _a2, _b2;
    if (!topic || !postNumber) return null;
    try {
      const stream = ((_a2 = topic.get) == null ? void 0 : _a2.call(topic, "postStream")) || topic.postStream;
      const posts = ((_b2 = stream == null ? void 0 : stream.get) == null ? void 0 : _b2.call(stream, "posts")) || (stream == null ? void 0 : stream.posts) || [];
      return [...posts].find(
        (p) => {
          var _a3;
          return Number(((_a3 = p == null ? void 0 : p.get) == null ? void 0 : _a3.call(p, "post_number")) ?? (p == null ? void 0 : p.post_number)) === Number(postNumber);
        }
      ) || null;
    } catch {
    }
    return null;
  }
  function isComposerOpen() {
    const el = document.querySelector("#reply-control");
    return !!(el && (el.classList.contains("open") || el.classList.contains("fullscreen") || el.classList.contains("edit-title")));
  }
  let applyHook = null;
  function onRouteApply(fn) {
    applyHook = fn;
  }
  function isTopicPath(pathname) {
    return /^\/t\//.test(pathname);
  }
  function topicIdFromPath(pathname) {
    const m = pathname.match(/^\/t\/(?:[\w-]+\/)?(\d+)/);
    return m ? Number(m[1]) : null;
  }
  function postNumberFromPath(pathname) {
    const m = pathname.match(/^\/t\/(?:[\w-]+\/)?\d+(?:\/(\d+))?/);
    return m && m[1] ? Number(m[1]) : 0;
  }
  function isHomePath(pathname) {
    return pathname === "/" || /^\/(latest|new|unread|unseen|top|categories|hot|posted|read|bookmarks)\b/.test(pathname) || /^\/c\//.test(pathname) || /^\/tag\//.test(pathname);
  }
  function listApiForPath(pathname) {
    if (pathname === "/" || pathname === "/latest") return "/latest.json";
    if (pathname === "/new") return "/new.json";
    if (pathname === "/unread" || pathname === "/unseen") return "/unseen.json";
    if (pathname === "/top") return "/top.json";
    const top = pathname.match(/^\/top\/(weekly|monthly|quarterly|yearly|all)$/);
    if (top) return `/top.json?period=${top[1]}`;
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
  function discourseRouteTo(url) {
    var _a2, _b2;
    if (!url) return false;
    try {
      const mod = discourseRequire("discourse/lib/url");
      const DiscourseURL = (mod == null ? void 0 : mod.default) || mod;
      if (DiscourseURL && typeof DiscourseURL.routeTo === "function") {
        DiscourseURL.routeTo(url);
        return true;
      }
    } catch {
    }
    try {
      if (typeof ((_b2 = (_a2 = window.Discourse) == null ? void 0 : _a2.URL) == null ? void 0 : _b2.routeTo) === "function") {
        window.Discourse.URL.routeTo(url);
        return true;
      }
    } catch {
    }
    return false;
  }
  function navigateInApp(url) {
    if (!url) return;
    let path = url;
    try {
      if (/^https?:/i.test(url)) path = new URL(url, location.origin).pathname + new URL(url, location.origin).search + new URL(url, location.origin).hash;
    } catch {
    }
    {
      const cut = /[?#]/.exec(path);
      const base = cut ? path.slice(0, cut.index) : path;
      if (/^\/t\/[^/]+\/\d+$/.test(base)) {
        path = `${base}/1${cut ? path.slice(cut.index) : ""}`;
      }
    }
    if (discourseRouteTo(path)) {
      applyHook == null ? void 0 : applyHook();
      return;
    }
    history.pushState({}, "", path);
    applyHook == null ? void 0 : applyHook();
  }
  function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);
  }
  function stripHtml(html) {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || "").replace(/\s+/g, " ").trim();
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
  async function apiSend(path, method, body) {
    const resp = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "X-CSRF-Token": csrfToken(),
        "X-Requested-With": "XMLHttpRequest",
        ...{}
      },
      body: void 0
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json().catch(() => ({}));
  }
  const composerState = {
    submitting: false,
    uploading: false,
    replyToPostNumber: null
  };
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
    var _a2;
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
        const name = parsed && (parsed.username || ((_a2 = parsed.user) == null ? void 0 : _a2.username));
        if (name) return name;
      }
    } catch {
    }
    return null;
  }
  function getCurrentUsername() {
    var _a2, _b2, _c, _d, _e, _f, _g, _h;
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
      try {
        const owner = ((_a2 = window.Discourse) == null ? void 0 : _a2.__container__) || ((_c = (_b2 = document.querySelector(".ember-application")) == null ? void 0 : _b2.__ember_meta__) == null ? void 0 : _c.owner);
        const user = ((_d = owner == null ? void 0 : owner.lookup) == null ? void 0 : _d.call(owner, "service:current-user")) || ((_g = (_f = (_e = window.Discourse) == null ? void 0 : _e.User) == null ? void 0 : _f.current) == null ? void 0 : _g.call(_f));
        const name = (user == null ? void 0 : user.username) || ((_h = user == null ? void 0 : user.get) == null ? void 0 : _h.call(user, "username"));
        if (name) {
          cachedUsername = name;
          return cachedUsername;
        }
      } catch {
      }
    } catch {
    }
    return null;
  }
  function isMyPost(post, myName) {
    if (!post) return false;
    if (post.yours === true || post.yours === "true") return true;
    if (post.mine === true || post.is_my_post === true) return true;
    const me = normalizeUsername(myName || getCurrentUsername());
    if (!me) return false;
    return normalizeUsername(post.username) === me;
  }
  const EDITOR_ICONS = {
    // fas bold
    bold: `<svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor"><path d="M0 64C0 46.3 14.3 32 32 32l48 0 16 0 128 0c70.7 0 128 57.3 128 128c0 31.3-11.3 60.1-30 82.3c37.1 22.4 62 63.1 62 109.7c0 70.7-57.3 128-128 128L96 480l-16 0-48 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l16 0 0-160L48 96 32 96C14.3 96 0 81.7 0 64zM224 224c35.3 0 64-28.7 64-64s-28.7-64-64-64L112 96l0 128 112 0zM112 288l0 128 144 0c35.3 0 64-28.7 64-64s-28.7-64-64-64l-32 0-112 0z"/></svg>`,
    // fas italic
    italic: `<svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor"><path d="M128 64c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-58.7 0L160 416l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l58.7 0L224 96l-64 0c-17.7 0-32-14.3-32-32z"/></svg>`,
    // fas strikethrough
    strike: `<svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor"><path d="M161.3 144c3.2-17.2 14-30.1 33.7-38.6c21.1-9 51.8-12.3 88.6-6.5c11.9 1.9 48.8 9.1 60.1 12c17.1 4.5 34.6-5.6 39.2-22.7s-5.6-34.6-22.7-39.2c-14.3-3.8-53.6-11.4-66.6-13.4c-44.7-7-88.3-4.2-123.7 10.9c-36.5 15.6-64.4 44.8-71.8 87.3c-.1 .6-.2 1.1-.2 1.7c-2.8 23.9 .5 45.6 10.1 64.6c4.5 9 10.2 16.9 16.7 23.9L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l448 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-209.9 0-.4-.1-1.1-.3c-36-10.8-65.2-19.6-85.2-33.1c-9.3-6.3-15-12.6-18.2-19.1c-3.1-6.1-5.2-14.6-3.8-27.4zM348.9 337.2c2.7 6.5 4.4 15.8 1.9 30.1c-3 17.6-13.8 30.8-33.9 39.4c-21.1 9-51.7 12.3-88.5 6.5c-18-2.9-49.1-13.5-74.4-22.1c-5.6-1.9-11-3.7-15.9-5.4c-16.8-5.6-34.9 3.5-40.5 20.3s3.5 34.9 20.3 40.5c3.6 1.2 7.9 2.7 12.7 4.3c24.9 8.5 63.6 21.7 87.6 25.6l.2 0c44.7 7 88.3 4.2 123.7-10.9c36.5-15.6 64.4-44.8 71.8-87.3c3.6-21 2.7-40.4-3.1-58.1l-75.7 0c7 5.6 11.4 11.2 13.9 17.2z"/></svg>`,
    // fas link
    link: `<svg width="18" height="18" viewBox="0 0 640 512" fill="currentColor"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>`,
    // fas quote-right
    quote: `<svg width="18" height="18" viewBox="0 0 448 512" fill="currentColor"><path d="M448 296c0 66.3-53.7 120-120 120l-8 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l8 0c30.9 0 56-25.1 56-56l0-8-64 0c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l64 0c35.3 0 64 28.7 64 64l0 32 0 32 0 72zm-256 0c0 66.3-53.7 120-120 120l-8 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l8 0c30.9 0 56-25.1 56-56l0-8-64 0c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l64 0c35.3 0 64 28.7 64 64l0 32 0 32 0 72z"/></svg>`,
    // fas code
    code: `<svg width="18" height="18" viewBox="0 0 640 512" fill="currentColor"><path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/></svg>`,
    // fas list-ul
    listUl: `<svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor"><path d="M64 144a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM64 464a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm48-208a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z"/></svg>`,
    // fas list-ol
    listOl: `<svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor"><path d="M24 56c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24l0 120 16 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l16 0 0-96-8 0C34.7 80 24 69.3 24 56zM86.7 341.2c-6.5-7.4-18.3-6.9-24 1.2L51.5 357.9c-7.7 10.8-22.7 13.3-33.5 5.6s-13.3-22.7-5.6-33.5l11.1-15.6c23.7-33.2 72.3-35.6 99.2-4.9c21.3 24.4 20.8 60.9-1.1 84.7L86.8 432l33.2 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-88 0c-9.5 0-18.2-5.6-22-14.4s-2.1-18.9 4.3-25.9l72-78c5.3-5.8 5.4-14.6 .3-20.5zM224 64l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>`,
    // fas upload（上传按钮，Discourse 编辑器同款）
    folder: `<svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor"><path d="M288 109.3L288 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-242.7-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352l128 0c0 35.3 28.7 64 64 64s64-28.7 64-64l128 0c35.3 0 64 28.7 64 64l0 32c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64l0-32c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg>`,
    // discourse-text（文本大小，Discourse 自绘图标，与原生工具栏逐字节同源）
    heading: `<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8.7955 5.57376C8.16545 5.57379 7.7574 6.01638 7.7574 6.33616V7.96517C7.7574 8.58191 9.1145 8.58191 9.1145 7.96517V7.1343H11.0822L11.1102 10.8732H10.1584C9.42007 10.8733 9.42004 12.4337 10.1584 12.4338H13.5884C14.3268 12.4337 14.3268 10.8733 13.5884 10.8732H12.6853L12.6574 7.1343H14.6174V7.96517C14.6174 8.58191 16 8.60641 16 7.98968V6.36066C16 6.04088 15.66 5.57379 15.03 5.57376H8.7955Z"/><path d="M0.778442 0C0.155688 0 0 0.66007 0 0.990106V2.57251C0 3.85876 1.715 3.85876 1.715 2.57251C1.715 1.28625 1.715 1.715 1.715 1.715H4.21453V10.5513H2.62724C1.89745 10.5513 1.84272 12.4338 2.57251 12.4338H7.30397C8.03376 12.4338 8.08849 10.5513 7.35871 10.5513H5.77141V1.715H8.57502V2.57251C8.57502 3.85876 10.29 3.70423 10.29 2.57251V0.857502C10.29 0.527467 9.83026 0 9.2075 0H0.778442Z"/></svg>`,
    // far face-smile（表情按钮，Discourse 编辑器同款）
    emoji: `<svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>`,
    // 预览条开关（自绘 eye 描边款，FA 无同名同源图标故不内联）
    preview: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>`,
    // fas circle-plus（更多选项，Discourse 编辑器同款）
    plus: `<svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>`
  };
  let categoriesCache = null;
  async function loadCategories() {
    if (categoriesCache) return categoriesCache;
    try {
      const data = await api("/categories.json");
      categoriesCache = data.category_list && data.category_list.categories || [];
    } catch {
      categoriesCache = [];
    }
    return categoriesCache;
  }
  function categoryById(id) {
    return (categoriesCache || []).find((c) => c.id === id) || null;
  }
  const skinHooks = {
    renderPins: null,
    // () => void          列表置顶区（飞书）
    convAvatar: null,
    // (topic) => html|null 会话头像（飞书彩色图标）
    disguiseAvatar: null,
    // (topic) => {html,bg,className,styleExtra} 伪装头像（飞书）
    syncChatTabs: null,
    // (data, topicId) => void 聊天头分类 chip（飞书）
    darkToggle: null,
    // (mount?) => void    深色切换按钮挂载（按皮肤分派）
    msgAvatar: null
    // (seedName) => {html,bg,className,styleExtra}|null  聊天区伪装头像（气泡/聊天头）
  };
  const likedPosts = /* @__PURE__ */ new Set();
  function avatarColor(name) {
    let hash = 0;
    const s = String(name || "?");
    for (let i = 0; i < s.length; i++) hash = hash * 31 + s.charCodeAt(i) | 0;
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }
  function avatarLetter(name) {
    const s = String(name || "?").trim();
    const ch = [...s][0] || "?";
    return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
  }
  function userDisplayName(user, fallback) {
    const name = user && String(user.name || "").trim();
    if (name) return name;
    const uname = user && String(user.username || "").trim();
    if (uname) return uname;
    return String(fallback || "?").trim() || "?";
  }
  const SURNAMES = [
    "赵",
    "钱",
    "孙",
    "李",
    "周",
    "吴",
    "郑",
    "王",
    "冯",
    "陈",
    "褚",
    "卫",
    "蒋",
    "沈",
    "韩",
    "杨",
    "朱",
    "秦",
    "尤",
    "许",
    "何",
    "吕",
    "施",
    "张",
    "孔",
    "曹",
    "严",
    "华",
    "金",
    "魏",
    "陶",
    "姜",
    "戚",
    "谢",
    "邹",
    "喻",
    "柏",
    "水",
    "窦",
    "章",
    "云",
    "苏",
    "潘",
    "葛",
    "奚",
    "范",
    "彭",
    "郎",
    "鲁",
    "韦",
    "昌",
    "马",
    "苗",
    "凤",
    "花",
    "方",
    "俞",
    "任",
    "袁",
    "柳",
    "酆",
    "鲍",
    "史",
    "唐",
    "费",
    "廉",
    "岑",
    "薛",
    "雷",
    "贺",
    "倪",
    "汤",
    "滕",
    "殷",
    "罗",
    "毕",
    "郝",
    "邬",
    "安",
    "常",
    "乐",
    "于",
    "时",
    "傅",
    "皮",
    "卞",
    "齐",
    "康",
    "伍",
    "余",
    "元",
    "卜",
    "顾",
    "孟",
    "平",
    "黄",
    "和",
    "穆",
    "萧",
    "尹"
  ];
  function surnameForTopic(topic) {
    const idx = Math.abs(Number(topic.id) || 0) % SURNAMES.length;
    return SURNAMES[idx];
  }
  function disguiseAvatarForTopicDingtalk(topic) {
    if (isGridMaskTopic(topic)) return disguiseGridAvatar(topic);
    const ch = surnameForTopic(topic);
    const color = avatarColor(ch + String(topic.id || 0));
    return {
      html: `<span class="im-avatar-text" data-len="1">${escapeHtml(ch)}</span>`,
      bg: color,
      className: "is-text-avatar is-solid",
      styleExtra: "color:#fff;"
    };
  }
  const MASK_GRID_BLUES = [
    "#0A6FE0",
    "#1A87FF",
    "#2F88FF",
    "#3B92FF",
    "#4B7CFF",
    "#5B8FFF",
    "#6BA0FF",
    "#7CB1FF",
    "#8DC2FF"
  ];
  function disguiseGridAvatar(topic) {
    const cells = [];
    const seed = Math.abs(Number(topic.id) || 0);
    for (let i = 0; i < 9; i++) {
      const ch = SURNAMES[(seed + i * 17) % SURNAMES.length];
      const color = MASK_GRID_BLUES[(seed + i) % MASK_GRID_BLUES.length];
      cells.push(`<span style="background:${color}">${escapeHtml(ch)}</span>`);
    }
    return {
      html: cells.join(""),
      bg: "transparent",
      className: "is-grid-mask",
      styleExtra: ""
    };
  }
  const MASK_WORK_ORGS = ["产品", "研发", "前端", "后端", "客户端", "测试", "QA", "运维", "架构", "中台", "数据", "平台"];
  const MASK_WORK_OBJS = ["需求", "接口", "契约", "用例", "缺陷", "分支", "版本", "变更", "工单", "告警", "故障", "发布"];
  const MASK_WORK_ACTS = ["评审群", "联调群", "值班群", "提测群", "发布群", "复盘群", "迭代群", "排期群", "需求池", "对齐会", "跟进群", "项目组"];
  const MASK_WORK_TITLES = [
    "需求评审排期",
    "技术方案讨论",
    "接口联调对齐",
    "代码评审意见",
    "主干合并冲突",
    "发版窗口确认",
    "灰度比例调整",
    "回归范围确认",
    "提测准入检查",
    "缺陷定级讨论",
    "线上告警跟进",
    "监控大盘调整",
    "值班交接记录",
    "故障复盘纪要",
    "降级预案演练",
    "容量水位评估",
    "慢查询治理",
    "配置变更同步",
    "依赖版本升级",
    "循环依赖治理",
    "单测覆盖率达标",
    "Mock 数据联调",
    "冒烟用例执行",
    "压测结果同步",
    "埋点方案评审",
    "SDK 版本对齐",
    "网关路由变更",
    "缓存命中率排查",
    "队列积压处理",
    "日志脱敏改造",
    "数据库迁移演练",
    "容器资源扩容",
    "发布回滚演练",
    "需求验收清单",
    "接口文档补全",
    "迭代任务盘点",
    "技术债清理周",
    "编码规范宣讲",
    "方案设计评审",
    "上线检查清单"
  ];
  function disguiseTitleForTopic(topic) {
    const tid = Math.abs(Number(topic && topic.id) || 0);
    const seed = tid * 2654435761 >>> 0;
    if (seed % 2 === 0) {
      const org = MASK_WORK_ORGS[seed % MASK_WORK_ORGS.length];
      const obj = MASK_WORK_OBJS[(seed >>> 3) % MASK_WORK_OBJS.length];
      const act = MASK_WORK_ACTS[(seed >>> 7) % MASK_WORK_ACTS.length];
      const mode = (seed >>> 11) % 3;
      if (mode === 0) return `${org}${obj}${act}`;
      if (mode === 1) return `${org}·${obj}${act}`;
      return `【${org}】${obj}${act}`;
    }
    return MASK_WORK_TITLES[seed % MASK_WORK_TITLES.length];
  }
  function fullAvatarUrl(template) {
    if (!template) return "";
    const url = template.replace("{size}", "96");
    return url.startsWith("http") ? url : location.origin + url;
  }
  function isGridMaskTopic(topic) {
    return isMaskAvatar() && Math.abs(Number(topic.id) || 0) % 2 === 0;
  }
  function convDisplayTitle(topic) {
    return isMaskTitle() ? disguiseTitleForTopic(topic) : String(topic.title || "");
  }
  function convDisplaySummary(topic, fallbackSummary) {
    if (isMaskAvatar() || isMaskTitle()) return String(topic.title || fallbackSummary || "");
    return fallbackSummary;
  }
  const TTL$3 = 3e4;
  const cache = /* @__PURE__ */ new Map();
  let maskEl = null;
  let cardEl = null;
  let closeListeners = null;
  let seq = 0;
  const CLOSE_SVG$1 = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
  async function fetchCard(username) {
    const cached = cache.get(username);
    if (cached && Date.now() - cached.loadedAt < TTL$3) return cached;
    try {
      const data = await api(`/u/${encodeURIComponent(username)}.json`);
      const next = { user: data.user || {}, loadedAt: Date.now(), error: null };
      cache.set(username, next);
      return next;
    } catch (err) {
      const next = { user: null, loadedAt: Date.now(), error: (err == null ? void 0 : err.message) || "网络异常" };
      cache.set(username, next);
      return next;
    }
  }
  function showUserCard(username, anchor) {
    if (!username) return;
    closeCard();
    const id = ++seq;
    maskEl = document.createElement("div");
    maskEl.className = "im-ucard-mask";
    cardEl = document.createElement("div");
    cardEl.className = "im-ucard";
    cardEl.innerHTML = `<span class="im-ucard-status">加载中…</span>`;
    document.body.append(maskEl, cardEl);
    placeCard(anchor);
    bindClose();
    cardEl.addEventListener("click", (e) => {
      const home = e.target.closest("[data-ucard-home]");
      if (home) {
        e.preventDefault();
        closeCard();
        showUserProfile(username);
        return;
      }
      const fb = e.target.closest("[data-ucard-follow]");
      if (fb) {
        e.preventDefault();
        const follow = fb.dataset.ucardFollow === "1";
        fb.disabled = true;
        apiSend(`/u/${encodeURIComponent(username)}/follow`, follow ? "PUT" : "DELETE").then(async () => {
          const cached = await fetchCard(username);
          if (id === seq && cardEl && cached.user) {
            cached.user.is_followed = follow;
            paintCard(username, cached, anchor);
          }
        }).catch(() => {
          if (id === seq && cardEl) fb.disabled = false;
        });
      }
    });
    fetchCard(username).then((cached) => {
      if (id === seq && cardEl) paintCard(username, cached, anchor);
    });
  }
  function paintCard(username, cached, anchor) {
    if (!cardEl) return;
    cardEl.innerHTML = cached.error ? `<span class="im-ucard-status">加载失败（${escapeHtml(cached.error)}）</span>` : cardHtml(username, cached.user || {});
    placeCard(anchor);
  }
  function cardHtml(username, u) {
    const name = u.username || username;
    const avatar = u.avatar_template ? `<img src="${escapeHtml(fullAvatarUrl(u.avatar_template))}" alt="">` : `<span class="is-text-avatar is-solid" style="background:${avatarColor(name)}">${escapeHtml(avatarLetter(name))}</span>`;
    const flair = u.flair_url ? `<span class="flair"${u.flair_bg_color ? ` style="background:#${escapeHtml(u.flair_bg_color)}"` : ""}><img src="${escapeHtml(u.flair_url)}" alt=""></span>` : "";
    const role = u.moderator ? "版主" : u.admin ? "管理员" : "";
    const stats = [
      [u.gamification_score, "点数"],
      [u.total_followers, "粉丝"],
      [u.total_following, "关注"],
      [u.accepted_answers, "解决"],
      [u.badge_count, "徽章"],
      [u.profile_view_count, "浏览"]
    ].filter(([v]) => v !== void 0 && v !== null && v !== "");
    const info = [
      ["加入时间", u.created_at ? fmtMonth(u.created_at) : ""],
      ["最近发帖", u.last_posted_at ? formatTime(u.last_posted_at) : ""],
      ["最近活跃", u.last_seen_at ? formatTime(u.last_seen_at) : ""],
      ["阅读时长", u.time_read ? fmtDuration(u.time_read) : ""],
      ["时区", u.timezone || ""]
    ].filter(([, v]) => v);
    return `
    <span class="im-ucard-banner"></span>
    <span class="im-ucard-head">
      <span class="im-ucard-ava">${avatar}${flair}</span>
      <span class="im-ucard-hmain">
        <span class="im-ucard-name">${escapeHtml(u.name || name)}${u.title ? `<span class="title-badge">${escapeHtml(u.title)}</span>` : ""}</span>
        <span class="im-ucard-sub">@${escapeHtml(name)}${u.trust_level ? ` · TL${u.trust_level}` : ""}${role ? ` · ${role}` : ""}</span>
      </span>
    </span>
    ${u.bio_excerpt || u.bio_cooked ? `<span class="im-ucard-bio">${escapeHtml(stripTags(u.bio_excerpt || u.bio_cooked))}</span>` : ""}
    ${stats.length ? `<span class="im-ucard-stats">${stats.map(([v, k]) => `<span class="m"><span class="v">${escapeHtml(String(v))}</span><span class="k">${escapeHtml(k)}</span></span>`).join("")}</span>` : ""}
    ${info.length ? `<span class="im-ucard-info">${info.map(([k, v]) => `<span class="row"><span class="k">${escapeHtml(k)}</span><span class="v">${escapeHtml(String(v))}</span></span>`).join("")}</span>` : ""}
    <span class="im-ucard-actions">
      <button type="button" class="im-ucard-btn primary" data-ucard-home>查看主页</button>
      ${u.can_follow ? `<button type="button" class="im-ucard-btn" data-ucard-follow="${u.is_followed ? "0" : "1"}">${u.is_followed ? "已关注" : "+ 关注"}</button>` : ""}
    </span>`;
  }
  function placeCard(anchor) {
    var _a2;
    if (!cardEl) return;
    const r = (_a2 = anchor == null ? void 0 : anchor.getBoundingClientRect) == null ? void 0 : _a2.call(anchor);
    const w = cardEl.offsetWidth;
    const h = cardEl.offsetHeight;
    if (!r || !w) {
      cardEl.style.left = `${Math.max(12, (innerWidth - w) / 2)}px`;
      cardEl.style.top = `${Math.max(12, (innerHeight - h) / 2)}px`;
      return;
    }
    let left = r.left + r.width / 2 - w / 2;
    left = Math.max(12, Math.min(left, innerWidth - w - 12));
    let top = r.bottom + 8;
    if (top + h > innerHeight - 12) top = Math.max(12, r.top - h - 8);
    cardEl.style.left = `${left}px`;
    cardEl.style.top = `${top}px`;
  }
  function bindClose() {
    const onMask = () => closeCard();
    const onKey = (e) => {
      if (e.key === "Escape") closeCard();
    };
    const onScroll = () => closeCard();
    maskEl.addEventListener("click", onMask);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    closeListeners = () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }
  function closeCard() {
    seq++;
    maskEl == null ? void 0 : maskEl.remove();
    cardEl == null ? void 0 : cardEl.remove();
    closeListeners == null ? void 0 : closeListeners();
    maskEl = null;
    cardEl = null;
    closeListeners = null;
  }
  function showUserProfile(username) {
    var _a2;
    const host = document.querySelector(".im-chat-panel");
    if (!host) {
      navigateInApp(`/u/${encodeURIComponent(username)}/summary`);
      return;
    }
    (_a2 = host.querySelector(".im-prof-frame")) == null ? void 0 : _a2.remove();
    const wrap = document.createElement("div");
    wrap.className = "im-prof-frame";
    wrap.innerHTML = `
    <div class="im-prof-frame-bar">
      <span class="t">@${escapeHtml(username)}</span>
      <button type="button" class="im-prof-frame-close" title="关闭">${CLOSE_SVG$1}</button>
    </div>
    <span class="im-prof-frame-loading">加载中…</span>
    <iframe class="im-prof-frame-view" src="/u/${encodeURIComponent(username)}/summary"></iframe>`;
    host.appendChild(wrap);
    wrap.querySelector(".im-prof-frame-close").addEventListener("click", () => wrap.remove());
    const view = wrap.querySelector("iframe");
    view.addEventListener("load", () => {
      view.classList.remove("ready");
      if (!wrap.querySelector(".im-prof-frame-loading")) {
        const tip = document.createElement("span");
        tip.className = "im-prof-frame-loading";
        tip.textContent = "加载中…";
        wrap.appendChild(tip);
      }
      let tries = 0;
      const timer = setInterval(() => {
        var _a3, _b2, _c, _d;
        let ok = false;
        try {
          const doc = view.contentDocument;
          if ((doc == null ? void 0 : doc.head) && !doc.__imProfStyled) {
            doc.__imProfStyled = true;
            const style = doc.createElement("style");
            style.textContent = ".d-header-wrap,.above-main-outlet,#site-footer,.footer-navi,.splash-screen{display:none!important}#main-outlet-wrapper,#main-outlet{padding-top:0!important;margin-top:0!important}";
            doc.head.appendChild(style);
            forceSchemeInDoc(doc);
            watchSchemeDoc(doc);
            setTimeout(() => forceSchemeInDoc(doc), 800);
          }
          ok = !!((_c = (_b2 = (_a3 = doc == null ? void 0 : doc.querySelector) == null ? void 0 : _a3.call(doc, "#main-outlet")) == null ? void 0 : _b2.children) == null ? void 0 : _c.length);
        } catch {
          ok = true;
        }
        if (!ok && ++tries < 40) return;
        clearInterval(timer);
        try {
          forceSchemeInDoc(view.contentDocument);
        } catch {
        }
        view.classList.add("ready");
        (_d = wrap.querySelector(".im-prof-frame-loading")) == null ? void 0 : _d.remove();
      }, 200);
    });
  }
  onColorThemeChange(() => {
    const view = document.querySelector(".im-prof-frame-view");
    if (view == null ? void 0 : view.contentDocument) forceSchemeInDoc(view.contentDocument);
  });
  function extractTextSnippet(html, maxLen = 60) {
    if (!html) return "";
    try {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      temp.querySelectorAll("blockquote, aside, svg, .lightbox, .badge").forEach((el) => el.remove());
      const text = (temp.textContent || temp.innerText || "").trim().replace(/\s+/g, " ");
      return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
    } catch {
      return "";
    }
  }
  function ensureChatPanel() {
    var _a2, _b2;
    let panel = document.querySelector(".im-chat-panel");
    if (panel && (!panel.querySelector(".im-chat-compose") || !panel.querySelector(".im-composer-card"))) {
      panel.remove();
      panel = null;
    }
    if (panel) {
      if (!panel.dataset.composeBound) {
        panel.dataset.composeBound = "1";
        bindChatPanelEvents(panel);
      }
      (_a2 = chatHooks.wireComposer) == null ? void 0 : _a2.call(chatHooks, panel);
      return panel;
    }
    panel = document.createElement("div");
    panel.className = "im-chat-panel";
    panel.dataset.empty = "1";
    panel.dataset.composeBound = "1";
    const toolKeys = ["bold", "italic", "heading", "strike", "link", "quote", "code", "folder", "listUl", "listOl", "emoji", "plus", "preview"];
    const toolTitles = {
      bold: "粗体（Ctrl/⌘+B）",
      italic: "强调（Ctrl/⌘+I）",
      heading: "文本大小（点击循环 标题2→标题3→标题4→正文）",
      strike: "删除线",
      link: "链接（Ctrl/⌘+K）",
      quote: "块引用",
      code: "代码（Ctrl/⌘+E，多行自动围栏）",
      folder: "上传图片",
      listUl: "无序列表",
      listOl: "有序列表",
      emoji: "表情符号",
      plus: "更多（插入模板 / 表格 / wrap 包裹）",
      preview: "实时预览（开关预览条）"
    };
    const toolsHtml = toolKeys.map(
      (k) => `<button type="button" class="im-icon-btn" data-tool="${k}" title="${toolTitles[k]}">${EDITOR_ICONS[k]}</button>`
    ).join("");
    panel.innerHTML = `
    <div class="im-chat-header">
      <div class="im-chat-head-main">
        <span class="im-chat-avatar" style="display:none"></span>
        <div class="im-chat-titles">
          <div class="im-chat-title-row">
            <span class="im-chat-title"></span>
            <span class="im-chat-count" style="display:none"></span>
            <span class="im-chat-metrics" style="display:none"></span>
            <span class="im-chat-chips"></span>
          </div>
          <div class="im-chat-sub"></div>
        </div>
      </div>
      <div class="im-chat-tools"></div>
      <div class="im-chat-actions">
        <button class="im-icon-btn im-chat-scrolltop" title="回到顶部">${ICONS.scrollTop}</button>
        <button class="im-icon-btn im-chat-refresh" title="刷新本话题">${ICONS.refresh}</button>
        <button class="im-icon-btn im-chat-native" title="切换原生视图">${ICONS.external}</button>
      </div>
    </div>
    <div class="im-chat-tabs" style="display:none"><a class="im-chat-tab active">${ICONS.msg}<span>消息</span></a><a class="im-chat-tab im-chat-tab-cat" style="display:none"></a></div>
    <div class="im-chat-body"></div>
    <div class="im-composer">
      <div class="im-composer-card">
        <div class="im-composer-target"><span></span><button type="button" title="取消回复">×</button></div>
        <div class="im-compose-preview" aria-live="polite"></div>
        <div class="im-composer-tools">${toolsHtml}<div class="spacer"></div><span class="im-composer-status"></span><button type="button" class="im-send-btn" disabled>发送</button></div>
        <div class="im-chat-compose im-md-edit" data-im-compose="1" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="发送消息"></div>
      </div>
      <input type="file" class="im-composer-file" accept="image/*" multiple>
    </div>
  `;
    document.body.appendChild(panel);
    bindChatPanelEvents(panel);
    (_b2 = chatHooks.wireComposer) == null ? void 0 : _b2.call(chatHooks, panel);
    return panel;
  }
  document.addEventListener("click", (e) => {
    var _a2;
    const panel = document.querySelector(".im-chat-panel");
    if (!panel || !panel.contains(e.target)) return;
    if (e.target.closest(".im-img-modal")) return;
    const clickedImg = e.target.closest("img");
    const clickedLightbox = e.target.closest("a.lightbox, .lightbox-wrapper");
    if (!clickedImg && !clickedLightbox) return;
    const isAvatar = e.target.closest(".im-msg-avatar, .im-rail, .im-chat-avatar, .fallback-letter, .avatar");
    const isEmoji = e.target.classList.contains("emoji") || e.target.closest(".emoji, .im-quick-emoji, .im-emoji-item");
    const isUiIcon = e.target.closest("button, .im-icon-btn, .im-rocket-chip, .im-like-badge");
    if (isAvatar || isEmoji || isUiIcon) return;
    const link = e.target.closest("a.lightbox, a[href*='/uploads/'], a[href*='.jpg'], a[href*='.jpeg'], a[href*='.png'], a[href*='.gif'], a[href*='.webp']");
    const highResSrc = link && link.href || clickedImg && (clickedImg.dataset.origSrc || clickedImg.dataset.largeUrl || clickedImg.src) || clickedLightbox && ((_a2 = clickedLightbox.querySelector("a.lightbox")) == null ? void 0 : _a2.href);
    if (!highResSrc) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
    chatHooks.openImageModal(highResSrc, clickedImg);
  }, true);
  function bindChatPanelEvents(panel) {
    panel.addEventListener("click", (e) => {
      var _a2, _b2;
      if (e.target.closest(".im-chat-metrics")) {
        e.preventDefault();
        e.stopPropagation();
        openFloorPicker();
        return;
      }
      if (e.target.closest(".im-chat-refresh")) {
        if (chatState.topicId) {
          chatState.topicId = null;
          loadTopic(topicIdFromPath(location.pathname));
        }
        return;
      }
      if (e.target.closest(".im-chat-native")) {
        setViewMode("native");
        location.reload();
        return;
      }
      if (e.target.closest(".im-chat-scrolltop")) {
        const body = panel.querySelector(".im-chat-body");
        if (body) {
          body.scrollTo({ top: 0, behavior: "smooth" });
          if (chatState.hasOlder) loadOlderPosts();
        }
        return;
      }
      if (e.target.closest(".im-chat-compose, .im-composer-tools, .im-composer-target")) {
        return;
      }
      const chipLink = e.target.closest("a.im-chat-chip");
      if (chipLink && panel.contains(chipLink)) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        navigateInApp(chipLink.getAttribute("href"));
        return;
      }
      const ucardHit = e.target.closest(".im-msg-avatar, .im-msg-name, .im-chat-avatar, a.mention, a[href^='/u/']");
      if (ucardHit && panel.contains(ucardHit)) {
        const hitName = ucardHit.dataset.username || ((_a2 = ucardHit.closest(".im-msg")) == null ? void 0 : _a2.dataset.username) || ((_b2 = (ucardHit.getAttribute("href") || "").match(/^\/u\/([^/]+)/)) == null ? void 0 : _b2[1]) || "";
        if (hitName) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          e.stopPropagation();
          showUserCard(decodeURIComponent(hitName), ucardHit);
          return;
        }
      }
      const quoteLink = e.target.closest("a[href^='/t/']");
      if (quoteLink && panel.contains(quoteLink)) {
        const href = quoteLink.getAttribute("href") || "";
        const sameTopic = href.startsWith(`/t/${chatState.topicId}/`) || href === `/t/${chatState.topicId}`;
        const anchorMatch = href.match(/#?post-(\d+)$/);
        const targetPostNumber = anchorMatch ? Number(anchorMatch[1]) : null;
        if (sameTopic && targetPostNumber) {
          e.preventDefault();
          e.stopPropagation();
          const msg2 = quoteLink.closest(".im-msg");
          const sourcePostNumber = msg2 ? Number(msg2.dataset.postNumber) : null;
          const body = panel.querySelector(".im-chat-body");
          const sourceScrollTop = body ? body.scrollTop : 0;
          if (scrollChatToPost(body, targetPostNumber, true)) {
            chatHooks.pushQuoteJump(sourcePostNumber, sourceScrollTop);
          }
          return;
        }
      }
      const jumpBack = e.target.closest(".im-jump-back-btn");
      if (jumpBack && panel.contains(jumpBack)) {
        const isClose = e.target.closest(".im-jump-back-close");
        if (isClose) {
          e.preventDefault();
          e.stopPropagation();
          chatHooks.clearQuoteJumpHistory();
        } else {
          e.preventDefault();
          e.stopPropagation();
          chatHooks.popQuoteJump();
        }
        return;
      }
      const quoteBtn = e.target.closest(".im-quote-reply");
      if (quoteBtn && panel.contains(quoteBtn)) {
        e.preventDefault();
        e.stopPropagation();
        const jumpNum = quoteBtn.dataset.jumpPost;
        if (jumpNum) {
          const body = panel.querySelector(".im-chat-body");
          const currentMsg = quoteBtn.closest(".im-msg");
          const currentPostNum = currentMsg ? Number(currentMsg.dataset.postNumber) : null;
          const currentScroll = body ? body.scrollTop : 0;
          chatHooks.pushQuoteJump(currentPostNum, currentScroll);
          if (scrollChatToPost(body, Number(jumpNum), true)) {
            const targetMsg = panel.querySelector(`.im-msg[data-post-number="${jumpNum}"]`);
            if (targetMsg) {
              targetMsg.classList.remove("im-msg-highlight");
              void targetMsg.offsetWidth;
              targetMsg.classList.add("im-msg-highlight");
            }
          } else {
            chatHooks.toast(`已记录原楼层，正在查找 #${jumpNum} 楼…`, quoteBtn);
            jumpToFloorRemote(Number(jumpNum));
          }
        }
        return;
      }
      const likeBadge = e.target.closest(".im-like-badge");
      if (likeBadge && panel.contains(likeBadge)) {
        e.preventDefault();
        e.stopPropagation();
        const postId = likeBadge.dataset.postId;
        if (postId) chatHooks.toggleLike(Number(postId), likeBadge);
        return;
      }
      const toolBtn = e.target.closest(".im-msg-tool");
      if (!toolBtn || !panel.contains(toolBtn)) return;
      const msg = toolBtn.closest(".im-msg");
      if (!msg) return;
      if (toolBtn.dataset.action === "like") {
        chatHooks.toggleLike(Number(msg.dataset.postId), toolBtn);
      } else if (toolBtn.dataset.action === "boost") {
        e.preventDefault();
        e.stopPropagation();
        chatHooks.openBoostComposer(msg);
      } else if (toolBtn.dataset.action === "reply") {
        e.preventDefault();
        e.stopPropagation();
        chatHooks.replyToPost(Number(msg.dataset.postNumber));
      }
    });
    panel.addEventListener("click", (e) => {
      const chip = e.target.closest(".im-rocket-chip.is-my-boost");
      if (chip && panel.contains(chip)) {
        const msg = chip.closest(".im-msg");
        const postId = msg ? msg.dataset.postId : null;
        const boostId = chip.dataset.boostId;
        if (e.target.closest(".im-rocket-trash")) {
          e.preventDefault();
          e.stopPropagation();
          if (postId) chatHooks.deleteBoost(Number(postId), boostId || null, chip);
        } else {
          e.preventDefault();
          e.stopPropagation();
          if (msg) chatHooks.openBoostComposer(msg);
        }
        return;
      }
      const rocketBtn = e.target.closest(".im-rocket-btn");
      if (rocketBtn && panel.contains(rocketBtn)) {
        e.preventDefault();
        e.stopPropagation();
        const msg = rocketBtn.closest(".im-msg");
        if (msg) chatHooks.openBoostComposer(msg);
        return;
      }
    });
    panel.querySelector(".im-chat-body").addEventListener("scroll", () => {
      const body = panel.querySelector(".im-chat-body");
      if (body.scrollTop < 80) loadOlderPosts();
      if (body.scrollTop + body.clientHeight >= body.scrollHeight - 120) loadNewerPosts();
      trackVisibleTopicPost();
    });
  }
  function renderChatEmpty() {
    ensureChatPanel();
    chatState.topicId = null;
    const panel = document.querySelector(".im-chat-panel");
    if (panel) panel.dataset.empty = "1";
    const body = document.querySelector(".im-chat-body");
    if (!body || body.dataset.state === "empty") return;
    body.dataset.state = "empty";
    const title = document.querySelector(".im-chat-title");
    const sub = document.querySelector(".im-chat-sub");
    if (title) title.textContent = "";
    if (sub) sub.textContent = "";
    const count = document.querySelector(".im-chat-count");
    if (count) {
      count.style.display = "none";
      count.textContent = "";
    }
    const metrics = document.querySelector(".im-chat-metrics");
    if (metrics) {
      metrics.style.display = "none";
      metrics.textContent = "";
    }
    const chips = document.querySelector(".im-chat-chips");
    if (chips) chips.innerHTML = "";
    const chatAvatar = document.querySelector(".im-chat-avatar");
    if (chatAvatar) chatAvatar.style.display = "none";
    const tabsEl = document.querySelector(".im-chat-tabs");
    if (tabsEl) tabsEl.style.display = "none";
    body.innerHTML = `
    <div class="im-chat-empty">
      ${ICONS.msg}
      <div>暂无消息</div>
    </div>`;
  }
  function renderChatError(message) {
    const body = document.querySelector(".im-chat-body");
    if (!body) return;
    body.innerHTML = `
    <div class="im-chat-error">
      ${ICONS.chat}
      <div>${escapeHtml(message)}</div>
      <button class="im-empty-btn" onclick="location.reload()">打开原生页面</button>
    </div>`;
  }
  let inFlightNewPostsFetch = false;
  let currentSubscribedTopicChannel = null;
  let chatRealtimeTickerId = null;
  async function fetchLatestNewPosts(topicId) {
    var _a2;
    if (!topicId || chatState.topicId !== topicId || inFlightNewPostsFetch) return;
    const body = document.querySelector(".im-chat-body");
    if (!body || body.querySelector(".im-chat-loading")) return;
    inFlightNewPostsFetch = true;
    try {
      const data = await api(`/t/${topicId}/last.json`);
      if (chatState.topicId !== topicId) return;
      const posts = data.post_stream && data.post_stream.posts || [];
      const stream = data.post_stream && data.post_stream.stream || posts.map((p) => p.id);
      if (stream.length) chatState.stream = stream;
      const newPosts = posts.filter((p) => {
        return p.post_number > chatState.renderedLastNumber && !body.querySelector(`.im-msg[data-post-number="${p.post_number}"]`);
      });
      if (newPosts.length) {
        const isNearBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 180;
        const myName = getCurrentUsername();
        body.insertAdjacentHTML("beforeend", renderBubbles(newPosts, myName));
        (_a2 = chatHooks.enhancePolls) == null ? void 0 : _a2.call(chatHooks, body);
        chatState.renderedLastNumber = Math.max(
          chatState.renderedLastNumber,
          ...newPosts.map((p) => p.post_number || 0)
        );
        chatState.renderedLastIdx = chatState.stream.length - 1;
        chatState.hasNewer = false;
        if (isNearBottom) {
          body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
        }
        const sub = document.querySelector(".im-chat-sub");
        if (sub && sub.textContent.includes("·")) {
          const prefix = sub.textContent.split("·")[0].trim();
          sub.textContent = `${prefix} · ${data.posts_count || stream.length} 条回复`;
        }
        const listItem = document.querySelector(`.im-conv[data-topic-id="${topicId}"]`);
        if (listItem) {
          const lastPost = newPosts[newPosts.length - 1];
          const timeEl = listItem.querySelector(".im-conv-time");
          const msgEl = listItem.querySelector(".im-conv-msg");
          if (timeEl) {
            timeEl.textContent = formatTime(lastPost.created_at);
            timeEl.dataset.timestamp = lastPost.created_at;
          }
          if (msgEl) {
            const author = userDisplayName(lastPost, lastPost.username || lastPost.name || "");
            msgEl.textContent = `${author}: ${stripHtml(lastPost.cooked || "")}`;
          }
        }
      }
    } catch {
    } finally {
      inFlightNewPostsFetch = false;
    }
  }
  function subscribeTopicRealtime(topicId) {
    if (currentSubscribedTopicChannel && window.MessageBus) {
      try {
        window.MessageBus.unsubscribe(currentSubscribedTopicChannel);
      } catch {
      }
      currentSubscribedTopicChannel = null;
    }
    if (topicId && window.MessageBus) {
      currentSubscribedTopicChannel = `/topic/${topicId}`;
      try {
        window.MessageBus.subscribe(currentSubscribedTopicChannel, () => {
          if (chatState.topicId === topicId) {
            fetchLatestNewPosts(topicId);
          }
        });
      } catch {
      }
    }
  }
  function startRealtimeChatPolling() {
    if (chatRealtimeTickerId) return;
    chatRealtimeTickerId = setInterval(() => {
      if (document.visibilityState === "visible" && chatState.topicId && !chatState.loading) {
        fetchLatestNewPosts(chatState.topicId);
      }
    }, 4e3);
  }
  function bubbleHtml(post, myName) {
    var _a2, _b2;
    const me = isMyPost(post, myName);
    const side = me ? "me" : "other";
    const displayName = userDisplayName(post, post.username || "?");
    let quoteHtml = "";
    if (post.reply_to_post_number) {
      const target = topicPostsMap.get(post.reply_to_post_number);
      let targetName = "";
      let snippet = "";
      if (target) {
        targetName = userDisplayName(target, target.username || "某用户");
        snippet = extractTextSnippet(target.cooked, 60) || "点击查看引用内容";
      } else if (post.reply_to_user) {
        targetName = post.reply_to_user.name || post.reply_to_user.username || `#${post.reply_to_post_number} 楼`;
        snippet = `回复了 #${post.reply_to_post_number} 楼的内容`;
      } else {
        targetName = `#${post.reply_to_post_number} 楼`;
        snippet = "点击跳转查看原帖";
      }
      quoteHtml = `
      <div class="im-quote-reply" data-jump-post="${post.reply_to_post_number}" title="点击跳转到 #${post.reply_to_post_number} 楼">
        <div class="im-quote-name">${escapeHtml(targetName)}:</div>
        <div class="im-quote-text">${escapeHtml(snippet)}</div>
      </div>`;
    }
    let avatar;
    let avatarBg = avatarColor(displayName);
    if (isMaskAvatar()) {
      const d = (_a2 = skinHooks.msgAvatar) == null ? void 0 : _a2.call(skinHooks, displayName);
      if (d) {
        avatar = d.html;
        avatarBg = d.bg;
      } else {
        avatar = escapeHtml(avatarLetter(displayName));
      }
    } else if (post.avatar_template) {
      avatar = `<img src="${escapeHtml(fullAvatarUrl(post.avatar_template))}" alt="" loading="lazy">`;
      avatarBg = "transparent";
    } else {
      avatar = escapeHtml(avatarLetter(displayName));
    }
    const actLike = (post.actions_summary || []).find((a) => a.id === 2);
    if (post.id && actLike && actLike.acted) likedPosts.add(post.id);
    const isLiked = post.id && likedPosts.has(post.id);
    const canUndo = actLike ? actLike.can_undo !== false : true;
    const liked = isLiked ? " liked" : "";
    const likeCount = actLike && actLike.count ? Number(actLike.count) : post.reaction_users_count || 0;
    const showBadge = likeCount > 0 || isLiked;
    const likeTooltip = isLiked ? canUndo ? "已点赞，点击取消" : chatHooks.cantUndoText(post.post_number) : "点赞";
    const badgeHtml = `
    <span class="im-like-badge${liked}${!canUndo ? " cannot-undo" : ""}" data-post-id="${post.id || ""}" data-post-number="${post.post_number}" data-can-undo="${canUndo ? "1" : "0"}" data-likes="${likeCount}" title="${likeTooltip}" style="${showBadge ? "" : "display:none;"}">
      <span class="im-like-icon">${isLiked ? ICONS.heartFilled : ICONS.heartOutline}</span>
      <span class="im-like-count">${likeCount > 0 ? likeCount : ""}</span>
    </span>`;
    const boostBar = ((_b2 = chatHooks.renderBoosts) == null ? void 0 : _b2.call(chatHooks, post)) || "";
    return `
    <div class="im-msg im-msg-${side}" data-post-number="${post.post_number}"${post.id ? ` data-post-id="${post.id}"` : ""}${me ? ' data-mine="1"' : ""} data-username="${escapeHtml(post.username || "")}">
      <span class="im-msg-avatar" style="background:${avatarBg}">${avatar}</span>
      <div class="im-msg-content">
        <span class="im-msg-name">${escapeHtml(displayName)}</span>
        <div class="im-msg-bubble">
          ${quoteHtml}
          ${post.cooked || ""}
        </div>
        ${boostBar}
        <span class="im-msg-meta">
          <span>#${post.post_number}</span>
          <span>${escapeHtml(formatTime(post.created_at))}</span>
          ${badgeHtml}
        </span>
        <div class="im-msg-tools">
          <button class="im-msg-tool${liked}${!canUndo ? " cannot-undo" : ""}" data-action="like" data-can-undo="${canUndo ? "1" : "0"}" title="${likeTooltip}">${isLiked ? ICONS.heartFilled : ICONS.heartOutline}</button>
          <button class="im-msg-tool" data-action="boost" title="小火箭">${ICONS.rocket}</button>
          <button class="im-msg-tool" data-action="reply" title="回复">${ICONS.reply}</button>
        </div>
      </div>
    </div>`;
  }
  const TIME_SEP_GAP = 10 * 60 * 1e3;
  function readLastReadMap() {
    try {
      return JSON.parse(localStorage.getItem(LAST_READ_KEY) || "{}");
    } catch {
      return {};
    }
  }
  function rememberTopicPost(topicId, postNumber) {
    const id = Number(topicId);
    const n = Number(postNumber) || 0;
    if (!id || n < 1) return;
    const map = readLastReadMap();
    map[id] = n;
    const keys = Object.keys(map);
    if (keys.length > LAST_READ_MAX_TOPICS) {
      for (const key of keys.slice(0, keys.length - LAST_READ_MAX_TOPICS)) delete map[key];
    }
    try {
      localStorage.setItem(LAST_READ_KEY, JSON.stringify(map));
    } catch {
    }
  }
  function getRememberedPost(topicId) {
    return Number(readLastReadMap()[topicId]) || 0;
  }
  function scrollChatToPost(body, postNumber, highlight = false) {
    if (!body || !postNumber) return false;
    const el = body.querySelector(`.im-msg[data-post-number="${postNumber}"]`);
    if (!el) return false;
    const delta = el.getBoundingClientRect().top - body.getBoundingClientRect().top;
    body.scrollTop = Math.max(0, body.scrollTop + delta);
    if (highlight) {
      el.classList.remove("im-msg-highlight");
      void el.offsetWidth;
      el.classList.add("im-msg-highlight");
    }
    return true;
  }
  function visibleTopicPosts(body) {
    if (!body) return [];
    const rect = body.getBoundingClientRect();
    const posts = [];
    for (const msg of body.querySelectorAll(".im-msg[data-post-number]")) {
      const box = msg.getBoundingClientRect();
      if (box.bottom <= rect.top + 8 || box.top >= rect.bottom - 8) continue;
      const number = Number(msg.dataset.postNumber) || 0;
      if (number) posts.push(number);
    }
    return posts;
  }
  const trackVisibleTopicPost = debounce(() => {
    if (!chatState.topicId) return;
    const body = document.querySelector(".im-chat-body");
    const visible = visibleTopicPosts(body);
    const postNumber = visible[0];
    if (!postNumber) return;
    rememberTopicPost(chatState.topicId, postNumber);
    const metrics = document.querySelector(".im-chat-metrics");
    if (metrics && chatState.totalPosts) {
      metrics.innerHTML = `${ICONS.chat}${postNumber}<span class="im-metrics-sep">/</span>${chatState.totalPosts}`;
    }
  }, 220);
  function renderBubbles(posts, myName) {
    const frag = [];
    let lastTime = 0;
    for (const post of posts) {
      if (post.post_number) topicPostsMap.set(post.post_number, post);
      if (post.id && (post.actions_summary || []).some((a) => a.id === 2 && a.acted)) {
        likedPosts.add(post.id);
      }
      const t = new Date(post.created_at).getTime();
      if (t - lastTime > TIME_SEP_GAP) {
        frag.push(`<div class="im-msg-time-sep">${escapeHtml(formatClock(post.created_at))}</div>`);
      }
      lastTime = t;
      frag.push(bubbleHtml(post, myName));
    }
    return frag.join("");
  }
  function displayTitle() {
    return convDisplayTitle({ id: chatState.topicId, title: chatState.title });
  }
  function paintChatHeaderChrome() {
    const t = displayTitle();
    const titleEl = document.querySelector(".im-chat-title");
    if (titleEl) titleEl.textContent = t;
    document.title = `${t} - Linux DO`;
    const composeBtn = document.querySelector(".im-chat-compose");
    if (composeBtn) {
      delete composeBtn.dataset.defaultLabel;
      composeBtn.dataset.placeholder = t ? `发送给 ${t}` : "发送消息";
    }
  }
  function renderChatHeaderAvatar() {
    var _a2;
    const chatAvatar = document.querySelector(".im-chat-avatar");
    if (!chatAvatar) return;
    chatAvatar.style.display = "";
    const op = chatState.op || {};
    const authorName = userDisplayName(op, op.username || displayTitle() || "?");
    chatAvatar.dataset.username = op.username || "";
    if (!isMaskAvatar() && op.avatar_template) {
      chatAvatar.style.background = "transparent";
      chatAvatar.innerHTML = `<img src="${escapeHtml(fullAvatarUrl(op.avatar_template))}" alt="" loading="lazy">`;
    } else {
      const d = (_a2 = skinHooks.msgAvatar) == null ? void 0 : _a2.call(skinHooks, authorName);
      if (d) {
        chatAvatar.style.background = d.bg;
        chatAvatar.innerHTML = d.html;
      } else {
        chatAvatar.style.background = avatarColor(authorName);
        chatAvatar.textContent = avatarLetter(authorName);
      }
    }
  }
  async function loadTopic(topicId) {
    var _a2, _b2, _c;
    if (!topicId || chatState.loading) return;
    if (chatState.topicId === topicId) {
      syncListActive();
      return;
    }
    chatState.loading = true;
    chatState.topicId = topicId;
    ensureChatPanel();
    const body = document.querySelector(".im-chat-body");
    if (body) {
      delete body.dataset.state;
      body.innerHTML = `<div class="im-chat-loading">加载中…</div>`;
    }
    try {
      const routePost = postNumberFromPath(location.pathname);
      const rememberedPost = getRememberedPost(topicId);
      const anchorPost = routePost > 1 ? routePost : rememberedPost;
      let data;
      let scrollToPost = 0;
      if (anchorPost > 1) {
        try {
          data = await api(`/t/${topicId}/${anchorPost}.json`);
          scrollToPost = anchorPost;
        } catch {
          data = await api(`/t/${topicId}.json`);
        }
      } else {
        data = await api(`/t/${topicId}.json`);
      }
      if (chatState.topicId !== topicId) return;
      let posts = data.post_stream && data.post_stream.posts || [];
      if (!scrollToPost && posts.length && Number(posts[0].post_number) !== 1 && Array.isArray((_a2 = data.post_stream) == null ? void 0 : _a2.stream)) {
        const headIds = data.post_stream.stream.slice(0, 20);
        if (headIds.length) {
          try {
            const qs = headIds.map((id) => `post_ids[]=${id}`).join("&");
            const headData = await api(`/t/${topicId}/posts.json?${qs}`);
            const headPosts = sortPostsByStream(
              headData.post_stream && headData.post_stream.posts || headData.posts || [],
              headIds
            );
            if (headPosts.length) posts = headPosts;
          } catch {
          }
        }
      }
      chatState.stream = data.post_stream && data.post_stream.stream || posts.map((p) => p.id);
      chatState.renderedFirstIdx = chatState.stream.indexOf(posts.length ? posts[0].id : -1);
      if (chatState.renderedFirstIdx < 0) chatState.renderedFirstIdx = 0;
      const lastLoadedId = posts.length ? posts[posts.length - 1].id : -1;
      chatState.renderedLastIdx = chatState.stream.indexOf(lastLoadedId);
      if (chatState.renderedLastIdx < 0) {
        chatState.renderedLastIdx = chatState.renderedFirstIdx + Math.max(posts.length - 1, 0);
      }
      chatState.renderedLastNumber = posts.reduce((m, p) => Math.max(m, p.post_number), 0);
      chatState.hasOlder = chatState.renderedFirstIdx > 0;
      chatState.hasNewer = chatState.renderedLastIdx >= 0 && chatState.renderedLastIdx < chatState.stream.length - 1;
      chatState.op = posts.find((p) => p.post_number === 1) || posts[0] || null;
      chatState.title = data.title || "";
      chatState.totalPosts = Number(data.posts_count) || chatState.stream.length || posts.length || 0;
      const panel = document.querySelector(".im-chat-panel");
      if (panel) panel.dataset.empty = "0";
      const sub = document.querySelector(".im-chat-sub");
      paintChatHeaderChrome();
      const participants = data.participant_count || (data.details && data.details.participants ? data.details.participants.length : 0);
      const count = document.querySelector(".im-chat-count");
      if (count) {
        if (participants) {
          count.style.display = "";
          count.innerHTML = `${ICONS.users}${participants}`;
        } else {
          count.style.display = "none";
          count.textContent = "";
        }
      }
      const replyTotal = data.posts_count || posts.length;
      if (sub) sub.textContent = `归属于 linux.do · ${replyTotal} 条回复`;
      const metrics = document.querySelector(".im-chat-metrics");
      if (metrics) {
        if (replyTotal) {
          metrics.style.display = "";
          metrics.title = "点击选择楼层";
          const startFloor = scrollToPost || (anchorPost > 1 ? anchorPost : 1);
          metrics.innerHTML = `${ICONS.chat}${Math.min(startFloor, replyTotal)}<span class="im-metrics-sep">/</span>${replyTotal}`;
        } else {
          metrics.style.display = "none";
          metrics.textContent = "";
        }
      }
      (_b2 = skinHooks.syncChatTabs) == null ? void 0 : _b2.call(skinHooks, data, topicId);
      renderChatHeaderAvatar();
      loadCategories().then(() => {
        if (chatState.topicId !== topicId) return;
        const cat = data.category_id ? categoryById(data.category_id) : null;
        const chipsBox = document.querySelector(".im-chat-chips");
        if (chipsBox) {
          chipsBox.innerHTML = cat ? `<a class="im-chat-chip" href="/c/${escapeHtml(cat.slug)}/${cat.id}"><span class="im-nav2-cat-dot" style="background:#${escapeHtml(cat.color || "8F959E")}"></span>${escapeHtml(cat.name)}</a>` : "";
        }
        if (cat && sub) sub.textContent = `归属于 ${cat.name} · ${replyTotal} 条回复`;
      });
      if (body) {
        body.innerHTML = renderBubbles(posts, getCurrentUsername()) || `<div class="im-chat-empty">${ICONS.msg}<div>暂无消息</div></div>`;
        (_c = chatHooks.enhancePolls) == null ? void 0 : _c.call(chatHooks, body);
        if (scrollToPost) {
          requestAnimationFrame(() => scrollChatToPost(body, scrollToPost, true));
        } else {
          body.scrollTop = 0;
        }
      }
      syncListActive();
    } catch (err) {
      renderChatError(`话题加载失败（${err && err.message}），可能无权限或已被删除`);
    } finally {
      chatState.loading = false;
    }
  }
  function sortPostsByStream(posts, ids) {
    const order = new Map(ids.map((id, i) => [id, i]));
    return posts.slice().sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }
  async function loadOlderPosts() {
    var _a2;
    if (!chatState.hasOlder || chatState.loading || !chatState.topicId) return;
    const ids = chatState.stream.slice(Math.max(0, chatState.renderedFirstIdx - 20), chatState.renderedFirstIdx);
    if (!ids.length) return;
    chatState.loading = true;
    const body = document.querySelector(".im-chat-body");
    try {
      const qs = ids.map((id) => `post_ids[]=${id}`).join("&");
      const data = await api(`/t/${chatState.topicId}/posts.json?${qs}`);
      const posts = sortPostsByStream(
        data.post_stream && data.post_stream.posts || data.posts || [],
        ids
      );
      chatState.renderedFirstIdx = Math.max(0, chatState.renderedFirstIdx - ids.length);
      chatState.hasOlder = chatState.renderedFirstIdx > 0;
      if (body && posts.length) {
        const prevHeight = body.scrollHeight;
        body.insertAdjacentHTML("afterbegin", renderBubbles(posts, getCurrentUsername()));
        body.scrollTop += body.scrollHeight - prevHeight;
        (_a2 = chatHooks.enhancePolls) == null ? void 0 : _a2.call(chatHooks, body);
      }
    } catch {
    } finally {
      chatState.loading = false;
    }
  }
  async function loadNewerPosts() {
    var _a2;
    if (!chatState.hasNewer || chatState.loading || !chatState.topicId) return;
    const start = chatState.renderedLastIdx + 1;
    if (start <= 0 || start >= chatState.stream.length) {
      chatState.hasNewer = false;
      return;
    }
    const ids = chatState.stream.slice(start, start + 20);
    if (!ids.length) {
      chatState.hasNewer = false;
      return;
    }
    chatState.loading = true;
    const body = document.querySelector(".im-chat-body");
    try {
      const qs = ids.map((id) => `post_ids[]=${id}`).join("&");
      const data = await api(`/t/${chatState.topicId}/posts.json?${qs}`);
      const posts = sortPostsByStream(
        data.post_stream && data.post_stream.posts || data.posts || [],
        ids
      );
      chatState.renderedLastIdx = start + ids.length - 1;
      chatState.hasNewer = chatState.renderedLastIdx < chatState.stream.length - 1;
      if (posts.length) {
        chatState.renderedLastNumber = posts.reduce(
          (m, p) => Math.max(m, p.post_number || 0),
          chatState.renderedLastNumber
        );
      }
      if (body && posts.length) {
        body.insertAdjacentHTML("beforeend", renderBubbles(posts, getCurrentUsername()));
        (_a2 = chatHooks.enhancePolls) == null ? void 0 : _a2.call(chatHooks, body);
      }
    } catch {
    } finally {
      chatState.loading = false;
    }
  }
  async function jumpToFloorRemote(postNumber, highlight = true) {
    var _a2;
    const topicId = chatState.topicId;
    if (!topicId || chatState.loading) return false;
    const n = Math.floor(Number(postNumber));
    if (!n || n < 1) return false;
    chatState.loading = true;
    const body = document.querySelector(".im-chat-panel .im-chat-body");
    try {
      const data = await api(`/t/${topicId}/${n}.json`);
      if (chatState.topicId !== topicId) return false;
      const posts = data.post_stream && data.post_stream.posts || [];
      if (!posts.length) return false;
      chatState.stream = data.post_stream && data.post_stream.stream || posts.map((p) => p.id);
      chatState.totalPosts = Number(data.posts_count) || chatState.stream.length || chatState.totalPosts;
      chatState.renderedFirstIdx = chatState.stream.indexOf(posts[0].id);
      if (chatState.renderedFirstIdx < 0) chatState.renderedFirstIdx = 0;
      const lastId = posts[posts.length - 1].id;
      chatState.renderedLastIdx = chatState.stream.indexOf(lastId);
      if (chatState.renderedLastIdx < 0) {
        chatState.renderedLastIdx = chatState.renderedFirstIdx + posts.length - 1;
      }
      chatState.renderedLastNumber = posts.reduce((m, p) => Math.max(m, p.post_number), 0);
      chatState.hasOlder = chatState.renderedFirstIdx > 0;
      chatState.hasNewer = chatState.renderedLastIdx >= 0 && chatState.renderedLastIdx < chatState.stream.length - 1;
      if (body) {
        const landed = posts.some((p) => p.post_number === n) ? n : posts[posts.length - 1].post_number;
        body.innerHTML = renderBubbles(posts, getCurrentUsername()) || `<div class="im-chat-empty">${ICONS.msg}<div>暂无消息</div></div>`;
        (_a2 = chatHooks.enhancePolls) == null ? void 0 : _a2.call(chatHooks, body);
        requestAnimationFrame(() => scrollChatToPost(body, landed, highlight));
        rememberTopicPost(topicId, landed);
      }
      return true;
    } catch {
      return false;
    } finally {
      chatState.loading = false;
    }
  }
  function floorPickerMax() {
    return chatState.totalPosts || chatState.renderedLastNumber || 0;
  }
  function ensureFloorPicker(panel) {
    let pop = panel.querySelector(".im-floor-pop");
    if (pop) return pop;
    pop = document.createElement("div");
    pop.className = "im-floor-pop";
    pop.innerHTML = `
    <div class="im-floor-pop-card" role="dialog" aria-label="选择楼层">
      <div class="im-floor-pop-title">跳转到楼层</div>
      <div class="im-floor-pop-row">
        <input class="im-floor-pop-input" type="number" min="1" step="1" inputmode="numeric" aria-label="楼层号">
        <span class="im-floor-pop-total"></span>
      </div>
      <div class="im-floor-pop-actions">
        <button type="button" class="im-floor-pop-cancel">取消</button>
        <button type="button" class="im-floor-pop-go">跳转</button>
      </div>
    </div>`;
    panel.appendChild(pop);
    pop.querySelector(".im-floor-pop-cancel").addEventListener("click", closeFloorPicker);
    pop.querySelector(".im-floor-pop-go").addEventListener("click", submitFloorPicker);
    pop.addEventListener("click", (e) => {
      if (e.target === pop) closeFloorPicker();
    });
    const input = pop.querySelector(".im-floor-pop-input");
    input.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") submitFloorPicker();
      if (e.key === "Escape") closeFloorPicker();
    });
    input.addEventListener("input", () => input.classList.remove("error"));
    return pop;
  }
  function openFloorPicker() {
    const panel = document.querySelector(".im-chat-panel");
    if (!panel || panel.dataset.empty === "1" || !chatState.topicId) return;
    const pop = ensureFloorPicker(panel);
    const max = floorPickerMax();
    pop.querySelector(".im-floor-pop-total").textContent = max ? `共 ${max} 楼` : "";
    const input = pop.querySelector(".im-floor-pop-input");
    input.max = max || "";
    input.classList.remove("error");
    pop.classList.add("open");
    const body = document.querySelector(".im-chat-panel .im-chat-body");
    const current = visibleTopicPosts(body)[0] || 0;
    input.value = current > 0 ? String(current) : "";
    setTimeout(() => {
      input.focus();
      input.select();
    }, 0);
  }
  function closeFloorPicker() {
    var _a2;
    (_a2 = document.querySelector(".im-chat-panel .im-floor-pop")) == null ? void 0 : _a2.classList.remove("open");
  }
  function submitFloorPicker() {
    const pop = document.querySelector(".im-chat-panel .im-floor-pop");
    if (!pop) return;
    const input = pop.querySelector(".im-floor-pop-input");
    const max = floorPickerMax();
    const n = Math.floor(Number(input.value));
    if (!n || n < 1 || max && n > max) {
      input.classList.add("error");
      input.focus();
      return;
    }
    closeFloorPicker();
    const body = document.querySelector(".im-chat-panel .im-chat-body");
    if (body && scrollChatToPost(body, n, true)) {
      rememberTopicPost(chatState.topicId, n);
      return;
    }
    jumpToFloorRemote(n).then((ok) => {
      var _a2;
      if (!ok) (_a2 = chatHooks.toast) == null ? void 0 : _a2.call(chatHooks, `没有找到 #${n} 楼`);
    });
  }
  function syncNewPostsFromDom() {
    var _a2, _b2, _c;
    if (!chatState.topicId) return;
    const articles = document.querySelectorAll(".post-stream article.topic-post");
    if (!articles.length) return;
    const body = document.querySelector(".im-chat-body");
    if (!body || body.querySelector(".im-chat-loading")) return;
    const myName = getCurrentUsername();
    let appended = false;
    for (const article of articles) {
      const number = Number(
        article.dataset.postNumber || (article.id || "").replace("post_", "")
      );
      if (!number || number <= chatState.renderedLastNumber) continue;
      if (body.querySelector(`[data-post-number="${number}"]`)) {
        chatState.renderedLastNumber = Math.max(chatState.renderedLastNumber, number);
        continue;
      }
      const cooked = article.querySelector(".cooked");
      if (!cooked) continue;
      const username = ((_a2 = article.querySelector(".topic-meta-data .username a, .names .username a")) == null ? void 0 : _a2.textContent.trim()) || myName || "?";
      const fullName = ((_b2 = article.querySelector(".topic-meta-data .full-name, .names .full-name")) == null ? void 0 : _b2.textContent.trim()) || username;
      const avatarImg = article.querySelector(".topic-avatar img, .post-avatar img");
      const timeEl = article.querySelector(".post-info .relative-date, .relative-date");
      const mine = article.classList.contains("current-user-post") || !!article.querySelector(".current-user-post") || normalizeUsername(username) === normalizeUsername(myName);
      const post = {
        post_number: number,
        username,
        name: fullName,
        avatar_template: avatarImg ? avatarImg.src.replace(/\/\d+\//, "/{size}/") : "",
        cooked: cooked.innerHTML,
        created_at: timeEl && (timeEl.getAttribute("title") || timeEl.dataset.time) || (/* @__PURE__ */ new Date()).toISOString(),
        yours: mine
      };
      body.insertAdjacentHTML("beforeend", bubbleHtml(post, myName));
      chatState.renderedLastNumber = Math.max(chatState.renderedLastNumber, number);
      appended = true;
    }
    if (appended) {
      (_c = chatHooks.enhancePolls) == null ? void 0 : _c.call(chatHooks, body);
      body.scrollTop = body.scrollHeight;
    }
  }
  Object.assign(chatHooks, {
    jumpToPost(postNumber) {
      const body = document.querySelector(".im-chat-panel .im-chat-body");
      if (!body) return false;
      if (scrollChatToPost(body, postNumber, true)) {
        rememberTopicPost(chatState.topicId, postNumber);
        return true;
      }
      return jumpToFloorRemote(postNumber);
    },
    refreshMaskedChrome() {
      paintChatHeaderChrome();
      renderChatHeaderAvatar();
    }
  });
  const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ESC_MAP[c]);
  const UPLOAD_URLS = /* @__PURE__ */ new Map();
  function registerUploadUrl(shortUrl, url) {
    if (shortUrl && url) UPLOAD_URLS.set(String(shortUrl), String(url));
  }
  function resolveImgUrl(url) {
    if (!url.startsWith("upload://")) return url;
    return UPLOAD_URLS.get(url) || `/uploads/short-url/${url.slice("upload://".length)}`;
  }
  let emojiMod;
  const EMOJI_URLS = /* @__PURE__ */ new Map();
  let emojiScanAt = 0;
  function emojiUrl(name) {
    var _a2;
    if (emojiMod === void 0) {
      emojiMod = discourseRequire("pretty-text/addon/emoji") || discourseRequire("pretty-text/emoji") || null;
    }
    const url = (_a2 = emojiMod == null ? void 0 : emojiMod.emojiUrlFor) == null ? void 0 : _a2.call(emojiMod, name);
    if (url) return url;
    if (EMOJI_URLS.has(name)) return EMOJI_URLS.get(name);
    const now = Date.now();
    if (now - emojiScanAt > 5e3) {
      emojiScanAt = now;
      for (const img of document.querySelectorAll("img.emoji")) {
        const m = (img.getAttribute("alt") || "").match(/^:([a-z0-9_+-]+(?::t[2-6])?):$/i);
        if (m && img.src && !EMOJI_URLS.has(m[1])) EMOJI_URLS.set(m[1], img.src);
      }
    }
    return EMOJI_URLS.get(name) || null;
  }
  function inlineMd(src) {
    let s = esc(src);
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
      const [label, dims] = alt.split("|");
      const [w, h] = String(dims || "").split("x").map((n) => parseInt(n, 10) || 0);
      const size = w > 0 && h > 0 ? ` width="${w}" height="${h}"` : "";
      return `<img class="im-md-img" src="${resolveImgUrl(url)}" alt="${label}"${size}>`;
    });
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    s = s.replace(/(^|[\s>])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
    s = s.replace(/(^|\s)@([a-zA-Z0-9_.-]+)/g, '$1<a class="im-mention" href="/u/$2">@$2</a>');
    s = s.replace(/\[blur\]([\s\S]*?)\[\/blur\]/g, '<span class="im-md-blur">$1</span>');
    s = s.replace(/\[date=([^\]]+)\]/g, (m, attrs) => {
      var _a2, _b2;
      const d = ((_a2 = attrs.match(/^([\d-]+)/)) == null ? void 0 : _a2[1]) || "";
      const t = ((_b2 = attrs.match(/time=([\d:]+)/)) == null ? void 0 : _b2[1]) || "";
      return `<span class="im-md-date">🕐 ${[d, t].filter(Boolean).join(" ") || attrs}</span>`;
    });
    s = s.replace(/\[\^(\d+)\]/g, "<sup>[$1]</sup>");
    s = s.replace(/:([a-z0-9_+-]+(?::t[2-6])?):/gi, (m, name) => {
      const url = emojiUrl(name);
      return url ? `<img class="emoji" src="${url}" alt=":${name}:" title=":${name}:">` : m;
    });
    return s.replace(/\n/g, "<br>");
  }
  function splitRow(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  }
  function parseTable(lines) {
    if (lines.length < 2 || !lines[0].includes("|")) return null;
    const sepCells = splitRow(lines[1]);
    if (!sepCells.length || !sepCells.every((c) => /^:?-{3,}:?$/.test(c))) return null;
    const aligns = sepCells.map((c) => c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : c.startsWith(":") ? "left" : "");
    const row = (cells, tag) => `<tr>${cells.map((c, i) => `<${tag}${aligns[i] ? ` style="text-align:${aligns[i]}"` : ""}>${inlineMd(c)}</${tag}>`).join("")}</tr>`;
    const body = lines.slice(2).filter((l) => l.includes("|")).map((l) => row(splitRow(l), "td")).join("");
    return `<table class="im-md-table"><thead>${row(splitRow(lines[0]), "th")}</thead><tbody>${body}</tbody></table>`;
  }
  function renderInner(src) {
    const text = (src || "").trim();
    if (!text) return "";
    return text.split(/\n{2,}/).map((part) => mdToHtml(part)).join("");
  }
  function mdToHtml(src) {
    const lines = src.split("\n");
    if (/^\s*```/.test(lines[0])) {
      const body = lines.slice(1).join("\n").replace(/\n?```\s*$/, "");
      return `<pre><code>${esc(body)}</code></pre>`;
    }
    if (lines.length === 1 && /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(src)) return "<hr>";
    if (/^\s*\$\$/.test(lines[0])) {
      const body = lines.slice(1).join("\n").replace(/\n?\$\$\s*$/, "");
      return `<pre class="im-md-math"><code>${esc(body)}</code></pre>`;
    }
    const details = src.match(/^\[details(?:="([^"]*)")?\]\s*\n?([\s\S]*?)\n?\[\/details\]\s*$/);
    if (details) {
      return `<details class="im-md-details"><summary>${esc(details[1] || "详细信息")}</summary>${renderInner(details[2])}</details>`;
    }
    const quote = src.match(/^\[quote(?:="([^"]*)")?\]\s*\n?([\s\S]*?)\n?\[\/quote\]\s*$/);
    if (quote) {
      const who2 = (quote[1] || "").split(",")[0].trim();
      return `<blockquote class="im-md-quote">${who2 ? `<div class="im-md-quote-head">${esc(who2)}：</div>` : ""}${renderInner(quote[2])}</blockquote>`;
    }
    const poll = src.match(/^\[poll[^\]]*\]\s*\n?([\s\S]*?)\n?\[\/poll\]\s*$/);
    if (poll) {
      const opts = poll[1].split("\n").filter((l) => /^- /.test(l)).map((l) => `<li>${inlineMd(l.slice(2))}</li>`).join("");
      return `<div class="im-md-poll"><div class="im-md-poll-title">🗳 投票（发送后生效）</div><ul>${opts}</ul></div>`;
    }
    const table = parseTable(lines);
    if (table) return table;
    if (lines.every((l) => /^\[\^\d+\]:/.test(l))) {
      return lines.map((l) => {
        const m = l.match(/^\[\^(\d+)\]:\s*(.*)$/);
        return `<div class="im-md-footnote"><sup>[${m[1]}]</sup> ${inlineMd(m[2])}</div>`;
      }).join("");
    }
    if (lines.every((l) => l.startsWith(">") || !l.trim()) && lines.some((l) => l.startsWith(">"))) {
      return `<blockquote>${lines.map((l) => inlineMd(l.replace(/^> ?/, ""))).join("<br>")}</blockquote>`;
    }
    if (lines.every((l) => /^- /.test(l) || !l.trim()) && lines.some((l) => /^- /.test(l))) {
      return `<ul>${lines.filter((l) => /^- /.test(l)).map((l) => {
        const item = l.slice(2);
        const task = item.match(/^\[( |x|X)\]\s+(.*)$/);
        if (task) {
          return `<li class="im-md-task"><input type="checkbox" disabled${task[1] === " " ? "" : " checked"}> ${inlineMd(task[2])}</li>`;
        }
        return `<li>${inlineMd(item)}</li>`;
      }).join("")}</ul>`;
    }
    if (lines.every((l) => /^\d+\. /.test(l) || !l.trim()) && lines.some((l) => /^\d+\. /.test(l))) {
      return `<ol>${lines.filter((l) => /^\d+\. /.test(l)).map((l) => `<li>${inlineMd(l.replace(/^\d+\. /, ""))}</li>`).join("")}</ol>`;
    }
    const heading = src.match(/^(#{1,4}) (.*)$/s);
    if (heading) {
      const tag = `h${heading[1].length + 1}`;
      return `<${tag}>${inlineMd(heading[2])}</${tag}>`;
    }
    return `<p>${inlineMd(src)}</p>`;
  }
  function mdBlocks(input) {
    return [...input.querySelectorAll(".im-md-block")];
  }
  function mdEnsureBlock(input) {
    if (!input.querySelector(".im-md-block")) {
      const block = document.createElement("div");
      block.className = "im-md-block";
      input.appendChild(block);
    }
  }
  function mdIsEmpty(input) {
    return !mdGetSource(input);
  }
  function mdGetSource(input) {
    return mdBlocks(input).map((b) => (b.dataset.src ?? b.innerText).trim()).filter(Boolean).join("\n\n");
  }
  function mdSyncActive(input) {
    var _a2, _b2;
    const sel = getSelection();
    const node = sel.rangeCount ? sel.getRangeAt(0).startContainer : null;
    const block = (_b2 = (_a2 = (node == null ? void 0 : node.nodeType) === 1 ? node : node == null ? void 0 : node.parentElement) == null ? void 0 : _a2.closest) == null ? void 0 : _b2.call(_a2, ".im-md-block");
    if ((block == null ? void 0 : block.parentNode) === input) block.dataset.src = block.innerText;
    input.classList.toggle("has-content", !mdIsEmpty(input));
    syncPreview(input);
  }
  function isPreviewOn() {
    try {
      return localStorage.getItem(COMPOSE_PREVIEW_KEY) === "1";
    } catch {
      return false;
    }
  }
  function syncPreview(input) {
    var _a2;
    const preview = (_a2 = input == null ? void 0 : input.closest(".im-composer-card")) == null ? void 0 : _a2.querySelector(".im-compose-preview");
    if (!preview || !preview.classList.contains("active")) return;
    const src = mdGetSource(input);
    preview.innerHTML = src ? src.split(/\n{2,}/).map((part) => `<div class="im-md-block is-rendered">${mdToHtml(part)}</div>`).join("") : "";
    preview.classList.toggle("is-empty", !src);
  }
  function togglePreview(btn, panel) {
    const preview = panel.querySelector(".im-compose-preview");
    const input = panel.querySelector(".im-chat-compose");
    if (!preview || !input) return;
    const on = !preview.classList.contains("active");
    preview.classList.toggle("active", on);
    btn.classList.toggle("active", on);
    try {
      localStorage.setItem(COMPOSE_PREVIEW_KEY, on ? "1" : "0");
    } catch {
    }
    if (on) syncPreview(input);
  }
  function mdRenderBlock(block) {
    const src = (block.dataset.src ?? "").trim();
    block.classList.add("is-rendered");
    block.innerHTML = src ? mdToHtml(src) : "";
  }
  function mdEditBlock(block) {
    block.textContent = block.dataset.src ?? block.innerText;
    block.classList.remove("is-rendered");
  }
  function mdRenderAll(input) {
    const src = mdGetSource(input);
    const parts = src ? src.split(/\n{2,}/) : [""];
    input.innerHTML = "";
    for (const part of parts) {
      const block = document.createElement("div");
      block.className = "im-md-block";
      block.dataset.src = part;
      input.appendChild(block);
      mdRenderBlock(block);
    }
    input.classList.toggle("has-content", !!src);
  }
  function mdClear(input) {
    input.innerHTML = "";
    mdEnsureBlock(input);
    input.classList.remove("has-content");
    syncPreview(input);
  }
  function placeCaretEnd(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  function activeBlock() {
    var _a2;
    const sel = getSelection();
    const node = sel.rangeCount ? sel.getRangeAt(0).startContainer : null;
    const el = (node == null ? void 0 : node.nodeType) === 1 ? node : node == null ? void 0 : node.parentElement;
    return ((_a2 = el == null ? void 0 : el.closest) == null ? void 0 : _a2.call(el, ".im-md-block")) ?? null;
  }
  function insertAtCaret(text) {
    const lines = String(text).split("\n");
    document.execCommand("insertText", false, lines[0]);
    for (let i = 1; i < lines.length; i++) {
      document.execCommand("insertLineBreak");
      document.execCommand("insertText", false, lines[i]);
    }
  }
  function wireComposer(panel) {
    const input = panel.querySelector(".im-chat-compose");
    if (!input || input.dataset.wired === "1") return;
    input.dataset.wired = "1";
    mdEnsureBlock(input);
    wireQuickComposer(panel, input);
  }
  function wireQuickComposer(panel, input) {
    var _a2, _b2, _c;
    const send = panel.querySelector(".im-send-btn");
    const target = panel.querySelector(".im-composer-target");
    const targetClose = target == null ? void 0 : target.querySelector("button");
    const fileInput = panel.querySelector(".im-composer-file");
    const imageBtn = panel.querySelector('.im-composer-tools .im-icon-btn[data-tool="folder"]');
    function updateSendState() {
      send.disabled = composerState.submitting || composerState.uploading || mdIsEmpty(input);
    }
    updateSendState();
    input.addEventListener("input", () => {
      mdSyncActive(input);
      updateSendState();
    });
    input.addEventListener("mousedown", (e) => {
      var _a3, _b3, _c2;
      const block = (_b3 = (_a3 = e.target).closest) == null ? void 0 : _b3.call(_a3, ".im-md-block");
      if (!(block == null ? void 0 : block.classList.contains("is-rendered"))) return;
      if (document.activeElement === input) {
        e.preventDefault();
        mdEditBlock(block);
        const r = (_c2 = document.caretRangeFromPoint) == null ? void 0 : _c2.call(document, e.clientX, e.clientY);
        const sel = getSelection();
        if (r && block.contains(r.startContainer)) {
          sel.removeAllRanges();
          sel.addRange(r);
        } else {
          placeCaretEnd(block);
        }
      } else {
        input._caretAt = { x: e.clientX, y: e.clientY };
      }
    });
    input.addEventListener("focusin", () => {
      var _a3, _b3, _c2, _d;
      const at = input._caretAt;
      input._caretAt = null;
      let hit = at && ((_a3 = document.caretRangeFromPoint) == null ? void 0 : _a3.call(document, at.x, at.y));
      let block = hit && ((_c2 = (_b3 = hit.startContainer.nodeType === 1 ? hit.startContainer : hit.startContainer.parentElement) == null ? void 0 : _b3.closest) == null ? void 0 : _c2.call(_b3, ".im-md-block"));
      if (block) {
        if (block.classList.contains("is-rendered")) mdEditBlock(block);
        hit = (_d = document.caretRangeFromPoint) == null ? void 0 : _d.call(document, at.x, at.y);
        const sel = getSelection();
        if (hit && block.contains(hit.startContainer)) {
          sel.removeAllRanges();
          sel.addRange(hit);
        } else {
          placeCaretEnd(block);
        }
        return;
      }
      block = activeBlock() ?? input.querySelector(".im-md-block");
      if (!block) return;
      if (block.classList.contains("is-rendered")) {
        mdEditBlock(block);
        placeCaretEnd(block);
      }
    });
    input.addEventListener("focusout", () => {
      mdSyncActive(input);
      mdRenderAll(input);
    });
    input.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && !e.isComposing) {
        const act = { b: "bold", i: "italic", e: "code", k: "link" }[e.key.toLowerCase()];
        if (act) {
          e.preventDefault();
          e.stopPropagation();
          applyMarkdownFormat(input, act);
          return;
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && !e.altKey && !e.isComposing) {
        const act = { d: "details", m: "math", ".": "date" }[e.key.toLowerCase()];
        if (act) {
          e.preventDefault();
          e.stopPropagation();
          PLUS_ACTIONS[act](input);
          return;
        }
      }
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
        e.preventDefault();
        e.stopPropagation();
        if (!mdIsEmpty(input)) submitComposer();
        return;
      }
      if (e.key === "Enter" && e.shiftKey && !e.isComposing) {
        e.preventDefault();
        document.execCommand("insertLineBreak");
        return;
      }
      if (e.key === "Backspace" && mdBlocks(input).length === 1 && !input.innerText.trim()) {
        e.preventDefault();
      }
    });
    send.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      submitComposer();
    });
    if (imageBtn) {
      imageBtn.title = "上传图片";
      imageBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
      });
    }
    fileInput.addEventListener("change", (e) => {
      uploadComposerFiles(e.target.files);
      e.target.value = "";
    });
    for (const btn of panel.querySelectorAll(".im-composer-tools .im-icon-btn[data-tool]")) {
      const kind = btn.dataset.tool;
      if (kind === "folder") continue;
      btn.addEventListener("mousedown", (e) => e.preventDefault());
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (kind === "emoji") toggleEmojiPicker(btn, input);
        else if (kind === "plus") togglePlusPop(btn, input);
        else if (kind === "preview") togglePreview(btn, panel);
        else applyMarkdownFormat(input, kind);
      });
    }
    input.addEventListener("paste", (e) => handleComposerPaste(e));
    (_a2 = panel.querySelector(".im-composer-card")) == null ? void 0 : _a2.addEventListener("drop", (e) => handleComposerDrop(e));
    (_b2 = panel.querySelector(".im-composer-card")) == null ? void 0 : _b2.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    const previewEl = panel.querySelector(".im-compose-preview");
    if (previewEl && isPreviewOn()) {
      previewEl.classList.add("active");
      (_c = panel.querySelector('.im-composer-tools .im-icon-btn[data-tool="preview"]')) == null ? void 0 : _c.classList.add("active");
      syncPreview(input);
    }
    targetClose == null ? void 0 : targetClose.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideTargetedReply();
      input.focus();
    });
  }
  function flashComposeHint(message, kind) {
    setComposeStatus(message, kind);
  }
  function setComposeStatus(message, kind) {
    const status = document.querySelector(".im-composer-status");
    if (!status) return;
    status.textContent = message || "";
    status.classList.remove("busy", "error", "success");
    if (kind) status.classList.add(kind);
    if (message) {
      clearTimeout(setComposeStatus._timer);
      setComposeStatus._timer = setTimeout(() => {
        status.textContent = "";
        status.classList.remove("busy", "error", "success");
      }, 3200);
    }
  }
  function composeUi() {
    const card = document.querySelector(".im-composer-card");
    return {
      card,
      input: card == null ? void 0 : card.querySelector(".im-chat-compose"),
      target: card == null ? void 0 : card.querySelector(".im-composer-target"),
      send: card == null ? void 0 : card.querySelector(".im-send-btn"),
      status: card == null ? void 0 : card.querySelector(".im-composer-status")
    };
  }
  function updateComposeSendState() {
    const { input, send } = composeUi();
    if (!input || !send) return;
    send.disabled = composerState.submitting || composerState.uploading || mdIsEmpty(input);
  }
  function ensureActiveBlock(input) {
    let block = activeBlock();
    if (!block) {
      input.focus({ preventScroll: true });
      block = activeBlock();
      if (!block) {
        block = mdBlocks(input).at(-1);
        if (block) placeCaretEnd(block);
      }
    }
    if (block == null ? void 0 : block.classList.contains("is-rendered")) {
      mdEditBlock(block);
      placeCaretEnd(block);
    }
    return block ?? null;
  }
  function currentSelText() {
    const sel = getSelection();
    return sel.rangeCount ? sel.getRangeAt(0).toString() : "";
  }
  function selectBack(skipTail, len) {
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
  function insertComposeText(input, text) {
    input.focus({ preventScroll: true });
    const sel = getSelection();
    if (!sel.rangeCount || !input.contains(sel.getRangeAt(0).startContainer)) {
      placeCaretEnd(input);
    }
    insertAtCaret(text);
    mdSyncActive(input);
    updateComposeSendState();
  }
  function applyWrap(mark, placeholder) {
    const text = currentSelText();
    if (text.length >= mark.length * 2 && text.startsWith(mark) && text.endsWith(mark)) {
      insertAtCaret(text.slice(mark.length, text.length - mark.length));
      return;
    }
    insertAtCaret(mark + (text || placeholder) + mark);
    if (!text) selectBack(mark.length, placeholder.length);
  }
  function applyLinePrefix(input, kind) {
    transformActiveBlock(input, (src) => {
      const lines = src.split("\n");
      const markOf = (i) => kind === "quote" ? "> " : kind === "ul" ? "- " : `${i + 1}. `;
      const allMarked = lines.every((line, i) => !line.trim() || line.startsWith(markOf(i)));
      return lines.map((line, i) => {
        const mark = markOf(i);
        if (allMarked) return line.startsWith(mark) ? line.slice(mark.length) : line;
        return mark + line;
      }).join("\n");
    });
  }
  function transformActiveBlock(input, fn) {
    const block = ensureActiveBlock(input);
    if (!block) return;
    block.dataset.src = fn(block.dataset.src ?? block.innerText);
    block.textContent = block.dataset.src;
    placeCaretEnd(block);
    mdSyncActive(input);
  }
  function applyCodeFormat(selText) {
    if (selText.includes("\n")) insertAtCaret("\n```\n" + selText.replace(/\n+$/, "") + "\n```\n");
    else applyWrap("`", "代码");
  }
  function applyLinkFormat() {
    const text = currentSelText();
    insertAtCaret(`[${text || "链接文字"}](https://)`);
    if (text) selectBack(1, 8);
    else selectBack(10, "链接文字".length);
  }
  function applyHeadingFormat(input) {
    transformActiveBlock(input, (src) => {
      const lines = src.split("\n");
      const levelOf = (line) => {
        var _a2;
        return (((_a2 = line.match(/^#{1,4} /)) == null ? void 0 : _a2[0].length) ?? 0) - 1;
      };
      const levels = lines.map(levelOf);
      const cur = levels[0];
      const next = levels.every((lv) => lv === cur) && cur > 0 ? cur === 4 ? 0 : cur + 1 : 2;
      return lines.map((line, i) => {
        const stripped = line.replace(/^#{1,4} /, "");
        return next === 0 ? stripped : `${"#".repeat(next)} ${levels[i] > 0 ? stripped : line}`;
      }).join("\n");
    });
  }
  function applyMarkdownFormat(input, kind) {
    if (!input) return;
    ensureActiveBlock(input);
    const text = currentSelText();
    switch (kind) {
      case "bold":
        return applyWrap("**", "加粗文字");
      case "italic":
        return applyWrap("*", "斜体文字");
      case "strike":
        return applyWrap("~~", "删除文字");
      case "heading":
        return applyHeadingFormat(input);
      case "code":
        return applyCodeFormat(text);
      case "link":
        return applyLinkFormat();
      case "quote":
        return applyLinePrefix(input, "quote");
      case "listUl":
        return applyLinePrefix(input, "ul");
      case "listOl":
        return applyLinePrefix(input, "ol");
    }
  }
  const QUICK_EMOJI = [
    "😀",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😍",
    "😘",
    "😜",
    "🤔",
    "😎",
    "🥳",
    "😴",
    "🙄",
    "😮",
    "😢",
    "😡",
    "🤝",
    "👍",
    "👎",
    "👏",
    "🙏",
    "💪",
    "🚀",
    "🔥",
    "✅",
    "❌",
    "⚡",
    "🎉",
    "❤️",
    "💔",
    "🤡",
    "🙈",
    "💯",
    "🤖",
    "👀",
    "🫡"
  ];
  let popEl = null;
  let popOutsideClose = null;
  function closePop() {
    if (!popEl) return;
    popEl.remove();
    popEl = null;
    if (popOutsideClose) {
      document.removeEventListener("mousedown", popOutsideClose);
      popOutsideClose = null;
    }
  }
  function openPop(btn, className, html) {
    closePop();
    popEl = document.createElement("div");
    popEl.className = className;
    popEl.innerHTML = html;
    document.body.appendChild(popEl);
    const rect = btn.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - popEl.offsetWidth - 8));
    const top = Math.max(8, rect.top - popEl.offsetHeight - 8);
    popEl.style.left = left + "px";
    popEl.style.top = top + "px";
    popEl.addEventListener("mousedown", (e) => e.preventDefault());
    popOutsideClose = (e) => {
      if (!(popEl == null ? void 0 : popEl.contains(e.target))) closePop();
    };
    document.addEventListener("mousedown", popOutsideClose);
  }
  function openNativeEmojiPicker(btn, onPick) {
    var _a2;
    const owner = getEmberOwner();
    const menu = owner && safeLookup(owner, "service:menu");
    const detached = (_a2 = discourseRequire("discourse/components/emoji-picker/detached")) == null ? void 0 : _a2.default;
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
    } catch {
      return false;
    }
  }
  function toggleEmojiPicker(btn, input) {
    if (openNativeEmojiPicker(btn, (emoji) => insertComposeText(input, `:${emoji}:`))) return;
    if (popEl == null ? void 0 : popEl.classList.contains("im-emoji-pop")) return closePop();
    openPop(btn, "im-emoji-pop", QUICK_EMOJI.map(
      (e) => `<button type="button" class="im-emoji-item">${e}</button>`
    ).join(""));
    popEl.addEventListener("click", (e) => {
      const item = e.target.closest(".im-emoji-item");
      if (!item) return;
      insertComposeText(input, item.textContent);
      closePop();
    });
  }
  function surroundWith(input, before, after, placeholder) {
    const text = currentSelText();
    insertComposeText(input, before + (text || placeholder) + after);
  }
  function insertBlock(input, text) {
    insertComposeText(input, text);
  }
  function localDateMarkup() {
    const now = /* @__PURE__ */ new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai";
    return `[date=${date} time=${time} timezone="${tz}"] `;
  }
  function insertQuoteOfTarget(input) {
    const posts = topicPostsMap.get(Number(chatState.topicId)) || [];
    const post = posts.find((p) => p.post_number === Number(composerState.replyToPostNumber)) || posts[0];
    if (!(post == null ? void 0 : post.id)) return flashComposeHint("未找到可引用的楼层");
    fetch(`/posts/${post.id}.json`, { credentials: "same-origin", headers: { "X-Requested-With": "XMLHttpRequest" } }).then((r) => r.ok ? r.json() : Promise.reject()).then((data) => insertBlock(input, `[quote="${data.username}, post:${data.post_number}"]
${data.raw}
[/quote]`)).catch(() => flashComposeHint("引用加载失败"));
  }
  function insertFootnote(input) {
    const n = (mdGetSource(input).match(/\[\^\d+\]:/g) || []).length + 1;
    insertComposeText(input, `[^${n}]`);
    const def = `[^${n}]: 脚注内容`;
    const block = document.createElement("div");
    block.className = "im-md-block";
    block.dataset.src = def;
    block.textContent = def;
    input.appendChild(block);
    input.classList.add("has-content");
    syncPreview(input);
    const range = document.createRange();
    range.setStart(block.firstChild, 6);
    range.setEnd(block.firstChild, 10);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  let tplBridge = null;
  const PLUS_ACTIONS = {
    quote: (input) => insertQuoteOfTarget(input),
    table: (input) => insertBlock(input, "| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n|  |  |  |\n"),
    scroll: (input) => surroundWith(input, "[wrap=scroll]\n", "\n[/wrap]", "内容"),
    mermaid: (input) => insertBlock(input, "```mermaid\nflowchart TD\n  A --> B\n```\n"),
    chart: (input) => insertBlock(input, '```chart\n{"title":"图表标题","type":"bar","data":{"labels":["一","二"],"series":[[1,2]]}}\n```\n'),
    details: (input) => surroundWith(input, '[details="标题"]\n', "\n[/details]\n", "内容"),
    graphviz: (input) => insertBlock(input, "[graphviz]\ndigraph G {\n  A -> B;\n}\n[/graphviz]\n"),
    date: (input) => insertBlock(input, localDateMarkup()),
    math: (input) => insertBlock(input, "$$\n公式\n$$\n"),
    template: () => {
      const owner = getEmberOwner();
      const dTemplates = owner && safeLookup(owner, "service:d-templates");
      if (!dTemplates) return flashComposeHint("当前账号无模板权限");
      if (!tplBridge || !tplBridge.isConnected) {
        tplBridge = document.createElement("textarea");
        tplBridge.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;";
        tplBridge.addEventListener("input", () => {
          const live = document.querySelector(".im-chat-compose");
          if (!tplBridge.value || !live) return;
          insertBlock(live, tplBridge.value);
          tplBridge.value = "";
          setTimeout(() => live.focus({ preventScroll: true }), 80);
        });
        document.body.appendChild(tplBridge);
      }
      dTemplates.showTextAreaUI(null, tplBridge);
    },
    footnote: (input) => insertFootnote(input),
    blur: (input) => surroundWith(input, "[blur]", "[/blur]", "内容"),
    poll: (input) => insertBlock(input, "[poll]\n- 选项一\n- 选项二\n[/poll]\n"),
    wrap: (input) => surroundWith(input, "[wrap]\n", "\n[/wrap]", "内容")
  };
  const PLUS_ITEMS = [
    { id: "quote", ico: "💬", label: "引用整个帖子" },
    { id: "table", ico: "▦", label: "插入表" },
    { id: "scroll", ico: "📜", label: "插入滚动内容" },
    { id: "mermaid", ico: "🧩", label: "Mermaid 图表" },
    { id: "chart", ico: "📈", label: "Build Chart" },
    { id: "details", ico: "▸", label: "隐藏详细信息（⇧⌘D）" },
    { id: "graphviz", ico: "🕸", label: "插入 Graphviz" },
    { id: "date", ico: "🕐", label: "插入日期/时间（⇧⌘.）" },
    { id: "math", ico: "√", label: "插入公式（⇧⌘M）" },
    { id: "template", ico: "📋", label: "插入模板" },
    { id: "footnote", ico: "＊", label: "添加脚注" },
    { id: "blur", ico: "🫧", label: "模糊剧透" },
    { id: "poll", ico: "🗳", label: "构建投票" },
    { id: "wrap", ico: "❏", label: "应用换行" }
  ];
  function togglePlusPop(btn, input) {
    if (popEl == null ? void 0 : popEl.classList.contains("im-plus-pop")) return closePop();
    openPop(btn, "im-plus-pop", PLUS_ITEMS.map(
      (it) => `<button type="button" class="im-plus-item" data-act="${it.id}"><span class="ico">${it.ico}</span>${it.label}</button>`
    ).join(""));
    popEl.addEventListener("click", (e) => {
      var _a2;
      const item = e.target.closest(".im-plus-item");
      if (!item) return;
      const act = item.dataset.act;
      closePop();
      input.focus();
      (_a2 = PLUS_ACTIONS[act]) == null ? void 0 : _a2.call(PLUS_ACTIONS, input);
    });
  }
  async function submitReplyViaApi(raw, replyToPostNumber) {
    var _a2;
    const body = { raw, topic_id: Number(chatState.topicId) };
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
      const err = ((_a2 = payload.errors) == null ? void 0 : _a2[0]) || payload.error || `HTTP ${response.status}`;
      throw new Error(err);
    }
    const post = payload.post || payload.created_post || payload;
    if (!post || !post.id && !post.post_id) throw new Error("站点未确认回复");
    return post;
  }
  function imageFile(file) {
    if (!file) return false;
    if (String(file.type || "").toLowerCase().startsWith("image/")) return true;
    return /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(String(file.name || ""));
  }
  async function uploadImageFile(file) {
    var _a2;
    const form = new FormData();
    form.append("file", file, file.name || "image");
    form.append("upload_type", "composer");
    form.append("type", "composer");
    form.append("synchronous", "true");
    const response = await fetch("/uploads.json", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "X-CSRF-Token": csrfToken(),
        "X-Requested-With": "XMLHttpRequest"
      },
      body: form
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = ((_a2 = payload.errors) == null ? void 0 : _a2[0]) || payload.error || `HTTP ${response.status}`;
      throw new Error(err);
    }
    const upload = payload.upload || (Array.isArray(payload.uploads) ? payload.uploads[0] : null);
    if (!upload) throw new Error("站点未返回图片地址");
    return upload;
  }
  function uploadedImageMarkdown(upload, file) {
    const url = upload.short_url || upload.url || upload.thumbnail_url;
    if (!url) throw new Error("站点未返回图片地址");
    const rawLabel = String(upload.original_filename || (file == null ? void 0 : file.name) || "图片");
    const label = rawLabel.replace(/\.[^.]+$/, "").replace(/[[\]\\|]/g, "_");
    const width = Number(upload.thumbnail_width || upload.width) || 0;
    const height = Number(upload.thumbnail_height || upload.height) || 0;
    const dimensions = width > 0 && height > 0 ? `|${width}x${height}` : "";
    const safeUrl = String(url).replace(/[\\()]/g, (char) => `\\${char}`);
    return `![${label}${dimensions}](${safeUrl})`;
  }
  function insertComposerText(text) {
    const { input } = composeUi();
    if (!input || !text) return;
    const block = ensureActiveBlock(input);
    if (!block) return;
    const before = block.innerText;
    if (before && !/[\n ]$/.test(before)) document.execCommand("insertLineBreak");
    insertAtCaret(text);
    mdSyncActive(input);
    updateComposeSendState();
  }
  async function uploadComposerFiles(files) {
    const selected = [...files || []];
    const images = selected.filter(imageFile);
    if (!selected.length) return;
    if (composerState.uploading) {
      setComposeStatus("已有图片正在上传，请等待完成后重试", "error");
      return;
    }
    if (!images.length) {
      setComposeStatus("请选择图片文件", "error");
      return;
    }
    composerState.uploading = true;
    updateComposeSendState();
    try {
      const markdown = [];
      for (const file of images) {
        setComposeStatus(`正在上传 ${file.name || "图片"}…`, "busy");
        const upload = await uploadImageFile(file);
        registerUploadUrl(upload.short_url, upload.url || upload.thumbnail_url);
        markdown.push(uploadedImageMarkdown(upload, file));
      }
      insertComposerText(markdown.join("\n"));
      setComposeStatus(`已添加 ${markdown.length} 张图片`, "success");
    } catch (error) {
      setComposeStatus(`上传失败：${error.message || "未知错误"}`, "error");
    } finally {
      composerState.uploading = false;
      updateComposeSendState();
    }
  }
  function transferImages(event) {
    var _a2;
    const transfer = event.clipboardData || event.dataTransfer;
    const files = [...(transfer == null ? void 0 : transfer.files) || []];
    if (files.length) return files.filter(imageFile);
    const itemFiles = [...((_a2 = event.clipboardData) == null ? void 0 : _a2.items) || []].filter((item) => item.kind === "file").map((item) => {
      var _a3;
      return (_a3 = item.getAsFile) == null ? void 0 : _a3.call(item);
    }).filter(Boolean);
    return itemFiles.filter(imageFile);
  }
  function handleComposerPaste(event) {
    var _a2, _b2, _c, _d;
    const files = transferImages(event);
    if (files.length) {
      event.preventDefault();
      event.stopPropagation();
      uploadComposerFiles(files);
      return;
    }
    const text = (_b2 = (_a2 = event.clipboardData) == null ? void 0 : _a2.getData) == null ? void 0 : _b2.call(_a2, "text/plain");
    const editor = (_d = (_c = event.target).closest) == null ? void 0 : _d.call(_c, ".im-md-edit");
    if (text && editor) {
      event.preventDefault();
      event.stopPropagation();
      insertAtCaret(text);
      mdSyncActive(editor);
      updateComposeSendState();
    }
  }
  function handleComposerDrop(event) {
    const files = transferImages(event);
    if (!files.length) return;
    event.preventDefault();
    event.stopPropagation();
    uploadComposerFiles(files);
  }
  async function submitComposer() {
    const { input } = composeUi();
    const raw = input ? mdGetSource(input) : "";
    if (!input || !raw.trim() || composerState.submitting || composerState.uploading) return;
    if (!chatState.topicId) {
      setComposeStatus("请先打开一个话题", "error");
      return;
    }
    composerState.submitting = true;
    updateComposeSendState();
    setComposeStatus("正在发送…", "busy");
    const replyTo = composerState.replyToPostNumber;
    try {
      try {
        const post = await submitReplyViaApi(raw, replyTo);
        completeComposerSubmission(input, post);
      } catch (apiError) {
        setComposeStatus(`接口发送失败，尝试原生编辑器：${apiError.message || ""}`, "error");
        try {
          await submitNativeReply(raw, replyTo);
          completeComposerSubmission(input);
        } catch (nativeError) {
          setComposeStatus(`发送失败：${nativeError.message || apiError.message || "未知错误"}`, "error");
        }
      }
    } finally {
      composerState.submitting = false;
      updateComposeSendState();
    }
  }
  function completeComposerSubmission(input, post) {
    mdClear(input);
    composerState.replyToPostNumber = null;
    hideTargetedReply();
    setComposeStatus("发送成功", "success");
    if (post && (post.post_number || post.postNumber)) {
      chatState.renderedLastNumber = Math.max(
        chatState.renderedLastNumber,
        Number(post.post_number || post.postNumber)
      );
    }
    setTimeout(() => syncNewPostsFromDom(), 400);
    setTimeout(() => syncNewPostsFromDom(), 1200);
  }
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
  function waitForComposerTextarea(timeoutMs = 5e3) {
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
  function showTargetedReply(postNumber) {
    var _a2, _b2;
    const { input, target } = composeUi();
    composerState.replyToPostNumber = Number(postNumber) || null;
    if (!target || !composerState.replyToPostNumber) return;
    const message = document.querySelector(`.im-msg[data-post-number="${postNumber}"]`);
    const name = (_b2 = (_a2 = message == null ? void 0 : message.querySelector(".im-msg-name")) == null ? void 0 : _a2.textContent) == null ? void 0 : _b2.trim();
    target.querySelector("span").textContent = name ? `回复 ${name} · #${postNumber}` : `回复消息 #${postNumber}`;
    target.classList.add("active");
    input == null ? void 0 : input.focus();
  }
  function hideTargetedReply() {
    const { target } = composeUi();
    composerState.replyToPostNumber = null;
    if (target) target.classList.remove("active");
  }
  function replyToPost(postNumber) {
    showTargetedReply(postNumber);
  }
  function withClickableNativeReplyControls(fn) {
    let style = document.getElementById("im-temp-reply-click");
    if (!style) {
      style = document.createElement("style");
      style.id = "im-temp-reply-click";
      style.textContent = `
      html.im-theme.im-locked #main-outlet #topic-footer-buttons,
      html.im-theme.im-locked #main-outlet .topic-footer-main-buttons,
      html.im-theme.im-locked #main-outlet .topic-footer-main-buttons *,
      html.im-theme.im-locked #main-outlet #topic-footer-buttons *,
      html.im-theme.im-locked #main-outlet .post-stream article .post-controls,
      html.im-theme.im-locked #main-outlet .post-stream article .post-controls * {
        visibility: visible !important;
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
        pointer-events: auto !important;
        position: relative !important;
      }
      html.im-theme.im-locked #main-outlet .container.posts,
      html.im-theme.im-locked #main-outlet .topic-area,
      html.im-theme.im-locked #main-outlet .post-stream,
      html.im-theme.im-locked #main-outlet .topic-footer-buttons,
      html.im-theme.im-locked #main-outlet #topic-footer-buttons {
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
        var _a2;
        (_a2 = document.getElementById("im-temp-reply-click")) == null ? void 0 : _a2.remove();
      }, 800);
    }
  }
  function clickNativeReplyButton(postNumber) {
    return withClickableNativeReplyControls(() => {
      if (postNumber) {
        const article = document.querySelector(
          `.post-stream article[data-post-number="${postNumber}"], #post_${postNumber}, article[id="post_${postNumber}"]`
        );
        const postReply = article == null ? void 0 : article.querySelector(
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
        if (!btn || btn.id === "create-topic" || btn.closest(".d-header")) continue;
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        return true;
      }
      return false;
    });
  }
  function openComposerViaService(postNumber) {
    var _a2, _b2, _c, _d, _e, _f, _g;
    const owner = getEmberOwner();
    if (!owner) return false;
    const composer = getComposerService(owner);
    if (!composer) return false;
    const topic = getTopicModel(owner);
    const Composer = discourseRequire("discourse/models/composer");
    const REPLY = (Composer == null ? void 0 : Composer.REPLY) || ((_a2 = Composer == null ? void 0 : Composer.default) == null ? void 0 : _a2.REPLY) || "reply";
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
            draftKey: ((_b2 = topic == null ? void 0 : topic.get) == null ? void 0 : _b2.call(topic, "draft_key")) || (topic == null ? void 0 : topic.draft_key) || `topic_${chatState.topicId}`,
            draftSequence: ((_c = topic == null ? void 0 : topic.get) == null ? void 0 : _c.call(topic, "draft_sequence")) ?? (topic == null ? void 0 : topic.draft_sequence)
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
          draftKey: ((_d = topic.get) == null ? void 0 : _d.call(topic, "draft_key")) || topic.draft_key || `topic_${chatState.topicId}`,
          draftSequence: ((_e = topic.get) == null ? void 0 : _e.call(topic, "draft_sequence")) ?? topic.draft_sequence,
          title: ((_f = topic.get) == null ? void 0 : _f.call(topic, "title")) || topic.title,
          categoryId: ((_g = topic.get) == null ? void 0 : _g.call(topic, "category_id")) || topic.category_id
        });
        return true;
      }
    } catch (err) {
      console.warn("[linuxdo-im] composer service open failed", err);
    }
    return false;
  }
  function openComposerViaKeyboard(postNumber) {
    var _a2, _b2, _c, _d;
    try {
      if (postNumber) {
        const article = document.querySelector(
          `.post-stream article[data-post-number="${postNumber}"], #post_${postNumber}`
        );
        (_a2 = article == null ? void 0 : article.setAttribute) == null ? void 0 : _a2.call(article, "tabindex", "-1");
        (_b2 = article == null ? void 0 : article.focus) == null ? void 0 : _b2.call(article);
      } else {
        (_d = (_c = document.activeElement) == null ? void 0 : _c.blur) == null ? void 0 : _d.call(_c);
      }
      const opts = { key: "r", code: "KeyR", keyCode: 82, which: 82, bubbles: true, cancelable: true, view: window };
      document.dispatchEvent(new KeyboardEvent("keydown", opts));
      document.body.dispatchEvent(new KeyboardEvent("keydown", opts));
      return true;
    } catch {
      return false;
    }
  }
  function openNativeComposer(postNumber) {
    var _a2;
    try {
      flashComposeHint("正在打开编辑器…", "busy");
      if (isComposerOpen()) {
        const ta = document.querySelector(
          "#reply-control.open textarea, #reply-control.fullscreen textarea, #reply-control.open .ProseMirror"
        );
        (_a2 = ta == null ? void 0 : ta.focus) == null ? void 0 : _a2.call(ta);
        flashComposeHint("编辑器已打开", "busy");
        return true;
      }
      let opened = false;
      try {
        opened = !!openComposerViaService(postNumber);
      } catch {
      }
      if (!opened) {
        try {
          opened = !!clickNativeReplyButton(postNumber);
        } catch {
        }
      }
      if (!opened) {
        try {
          openComposerViaKeyboard(postNumber);
        } catch {
        }
      }
      setTimeout(() => {
        if (isComposerOpen()) {
          flashComposeHint("编辑器已打开", "busy");
          return;
        }
        const root2 = document.documentElement;
        const hadLock = root2.classList.contains(LOCK_CLASS);
        const unlock = document.createElement("style");
        unlock.id = "im-unlock-for-reply";
        unlock.textContent = `
        html.im-theme.im-locked #main-outlet-wrapper,
        html.im-theme.im-locked #main-outlet,
        html.im-theme.im-locked #main-outlet > * {
          pointer-events: auto !important;
          visibility: visible !important;
          height: auto !important;
          overflow: visible !important;
        }
        html.im-theme #reply-control {
          display: block !important;
          pointer-events: auto !important;
          z-index: 600 !important;
        }
      `;
        document.documentElement.appendChild(unlock);
        if (hadLock) root2.classList.remove(LOCK_CLASS);
        try {
          if (!openComposerViaService(postNumber) && !clickNativeReplyButton(postNumber)) {
            openComposerViaKeyboard(postNumber);
          }
        } catch {
        }
        setTimeout(() => {
          var _a3;
          if (hadLock) root2.classList.add(LOCK_CLASS);
          (_a3 = document.getElementById("im-unlock-for-reply")) == null ? void 0 : _a3.remove();
          if (isComposerOpen()) {
            flashComposeHint("编辑器已打开", "busy");
          } else {
            flashComposeHint("打开失败：请点右上角「原生视图」回复", "error");
            console.warn("[linuxdo-im] openNativeComposer failed", {
              topicId: chatState.topicId,
              postNumber,
              hasOwner: !!getEmberOwner(),
              hasComposer: !!getComposerService(getEmberOwner())
            });
          }
        }, 250);
      }, 180);
      return true;
    } catch (err) {
      console.warn("[linuxdo-im] openNativeComposer crashed", err);
      flashComposeHint(`打开失败：${err && err.message ? err.message : "未知错误"}`, "error");
      return false;
    }
  }
  Object.assign(chatHooks, { wireComposer, replyToPost });
  function openTopicComposerViaService() {
    var _a2;
    const composer = getComposerService(getEmberOwner());
    if (!composer) return false;
    const Composer = discourseRequire("discourse/models/composer");
    const CREATE_TOPIC = (Composer == null ? void 0 : Composer.CREATE_TOPIC) || ((_a2 = Composer == null ? void 0 : Composer.default) == null ? void 0 : _a2.CREATE_TOPIC) || "createTopic";
    try {
      if (typeof composer.openTopicComposer === "function") {
        composer.openTopicComposer({ draftKey: "new_topic" });
        return true;
      }
      if (typeof composer.open === "function") {
        composer.open({ action: CREATE_TOPIC, draftKey: "new_topic" });
        return true;
      }
    } catch (err) {
      console.warn("[linuxdo-im] topic composer service open failed", err);
    }
    return false;
  }
  function clickNativeCreateTopicButton() {
    const btn = document.getElementById("create-topic");
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    return true;
  }
  function openTopicComposerViaKeyboard() {
    var _a2, _b2;
    try {
      (_b2 = (_a2 = document.activeElement) == null ? void 0 : _a2.blur) == null ? void 0 : _b2.call(_a2);
      const opts = { key: "c", code: "KeyC", keyCode: 67, which: 67, bubbles: true, cancelable: true, view: window };
      document.dispatchEvent(new KeyboardEvent("keydown", opts));
      document.body.dispatchEvent(new KeyboardEvent("keydown", opts));
      return true;
    } catch {
      return false;
    }
  }
  function openNewTopicComposer() {
    var _a2, _b2;
    try {
      if (!getCurrentUsername()) {
        setComposeStatus("登录后才能发帖", "error");
        return false;
      }
      if (isComposerOpen()) {
        (_b2 = (_a2 = document.querySelector("#reply-control.open textarea, #reply-control.open .ProseMirror")) == null ? void 0 : _a2.focus) == null ? void 0 : _b2.call(_a2);
        return true;
      }
      let opened = false;
      try {
        opened = !!openTopicComposerViaService();
      } catch {
      }
      if (!opened) {
        try {
          opened = !!clickNativeCreateTopicButton();
        } catch {
        }
      }
      if (!opened) openTopicComposerViaKeyboard();
      setTimeout(() => {
        if (isComposerOpen()) {
          setComposeStatus("编辑器已打开", "busy");
        } else {
          setComposeStatus("打开发帖编辑器失败：请切右上角「原生视图」发帖", "error");
          console.warn("[linuxdo-im] openNewTopicComposer failed", {
            hasOwner: !!getEmberOwner(),
            hasComposer: !!getComposerService(getEmberOwner())
          });
        }
      }, 350);
      return true;
    } catch (err) {
      console.warn("[linuxdo-im] openNewTopicComposer crashed", err);
      setComposeStatus(`打开发帖编辑器失败：${err && err.message ? err.message : "未知错误"}`, "error");
      return false;
    }
  }
  function getRailWidth() {
    try {
      const w = parseInt(localStorage.getItem(RAIL_W_KEY), 10);
      if (w >= RAIL_W_MIN && w <= RAIL_W_MAX) return w;
    } catch {
    }
    return RAIL_WIDTH;
  }
  function applyRailWidth(w) {
    const width = Math.min(RAIL_W_MAX, Math.max(RAIL_W_MIN, Math.round(w)));
    document.documentElement.style.setProperty("--im-nav", `${width}px`);
    const rail = document.querySelector(".im-rail");
    if (rail) rail.classList.toggle("im-rail-compact", width < RAIL_W_COMPACT);
    window.dispatchEvent(new Event("im-layout-change"));
  }
  function ensureRailResizer() {
    let rz = document.querySelector(".im-rail-resizer");
    if (rz) return rz;
    rz = document.createElement("div");
    rz.className = "im-rail-resizer";
    rz.title = "拖动调整侧栏宽度（双击复位）";
    document.body.appendChild(rz);
    let dragging = false;
    let startX = 0;
    let startW = 0;
    rz.addEventListener("pointerdown", (e) => {
      dragging = true;
      startX = e.clientX;
      startW = parseInt(document.documentElement.style.getPropertyValue("--im-nav"), 10) || getRailWidth();
      rz.classList.add("dragging");
      try {
        rz.setPointerCapture(e.pointerId);
      } catch {
      }
      e.preventDefault();
    });
    rz.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const target = startW + e.clientX - startX;
      if (SKIN_ID === "wecom" || SKIN_ID === "feishu") setRailCollapsed(target < RAIL_W_MIN + 12);
      applyRailWidth(target);
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      rz.classList.remove("dragging");
      const w = parseInt(document.documentElement.style.getPropertyValue("--im-nav"), 10);
      if (w) {
        try {
          localStorage.setItem(RAIL_W_KEY, String(w));
        } catch {
        }
      }
    };
    rz.addEventListener("pointerup", endDrag);
    rz.addEventListener("pointercancel", endDrag);
    rz.addEventListener("dblclick", () => {
      applyRailWidth(RAIL_WIDTH);
      try {
        localStorage.removeItem(RAIL_W_KEY);
      } catch {
      }
    });
    return rz;
  }
  function getListWidth() {
    try {
      const w = parseInt(localStorage.getItem(LIST_W_KEY), 10);
      if (w >= LIST_W_MIN && w <= LIST_W_MAX) return w;
    } catch {
    }
    return LIST_WIDTH;
  }
  function applyListWidth(w) {
    const width = Math.min(LIST_W_MAX, Math.max(LIST_W_MIN, Math.round(w)));
    document.documentElement.style.setProperty("--im-list", `${width}px`);
    window.dispatchEvent(new Event("im-layout-change"));
  }
  function ensureListResizer() {
    let rz = document.querySelector(".im-list-resizer");
    if (rz) return rz;
    rz = document.createElement("div");
    rz.className = "im-list-resizer";
    rz.title = "拖动调整会话列表宽度（双击复位）";
    document.body.appendChild(rz);
    let dragging = false;
    let startX = 0;
    let startW = 0;
    rz.addEventListener("pointerdown", (e) => {
      dragging = true;
      startX = e.clientX;
      startW = parseInt(document.documentElement.style.getPropertyValue("--im-list"), 10) || getListWidth();
      rz.classList.add("dragging");
      try {
        rz.setPointerCapture(e.pointerId);
      } catch {
      }
      e.preventDefault();
    });
    rz.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      applyListWidth(startW + e.clientX - startX);
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      rz.classList.remove("dragging");
      const w = parseInt(document.documentElement.style.getPropertyValue("--im-list"), 10);
      if (w) {
        try {
          localStorage.setItem(LIST_W_KEY, String(w));
        } catch {
        }
      }
    };
    rz.addEventListener("pointerup", endDrag);
    rz.addEventListener("pointercancel", endDrag);
    rz.addEventListener("dblclick", () => {
      applyListWidth(LIST_WIDTH);
      try {
        localStorage.removeItem(LIST_W_KEY);
      } catch {
      }
    });
    return rz;
  }
  const TYPE_GLYPHS = {
    1: "@",
    14: "@",
    // 提及 / 群组提及
    2: "↩",
    // 回复
    3: "❝",
    // 引用
    4: "✎",
    // 编辑
    5: "♥",
    18: "♥",
    // 赞 / 合并赞
    6: "✉",
    7: "✉",
    // 私信 / 邀请进私信
    12: "🏅",
    // 徽章
    801: "⚡"
    // Boost（站点定制）
  };
  const FILTERS = [
    { key: "all", label: "全部" },
    { key: "replied", label: "回复", types: "mentioned,group_mentioned,posted,quoted,replied" },
    { key: "liked", label: "赞", types: "liked,liked_consolidated,reaction" },
    { key: "private", label: "私信", kind: "pm" },
    { key: "bookmarks", label: "书签", kind: "bookmarks" },
    { key: "assigned", label: "分配", types: "assigned" },
    { key: "chat", label: "聊天", types: "chat_invitation,chat_mention,chat_message,chat_quoted,chat_watched_thread" },
    {
      key: "other",
      label: "其他",
      types: "edited,invited_to_private_message,invitee_accepted,moved_post,linked,granted_badge,invited_to_topic,custom,watching_first_post,topic_reminder,post_approved,code_review_commit_approved,membership_request_accepted,membership_request_consolidated,votes_released,event_reminder,event_invitation,chat_group_mention,question_answer_user_commented,watching_category_or_tag,new_features,admin_problems,linked_consolidated,upcoming_change_available,upcoming_change_automatically_promoted,boost,suggested_edit_created,suggested_edit_accepted,following,following_created_topic,following_replied,circles_activity,resenha_invitation"
    }
  ];
  const MARK_ALL_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 13l4 4L15 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 13l4 4 8-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/></svg>`;
  const OUTLINE_ICON = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const FILTER_ICONS = {
    all: OUTLINE_ICON(`<path d="M6 16.2h12l-1.2-2.2a6.6 6.6 0 0 1-.8-3.2V9.5a4 4 0 1 0-8 0v1.3c0 1.14-.27 2.2-.8 3.2L6 16.2Z"/><path d="M10 18.5a2 2 0 0 0 4 0"/>`),
    replied: OUTLINE_ICON(`<path d="M9.5 14.5 4.5 9.5l5-5"/><path d="M4.5 9.5h9.5a5.5 5.5 0 0 1 0 11h-3"/>`),
    liked: OUTLINE_ICON(`<path d="M12 20.3 4.9 13a4.7 4.7 0 0 1 0-6.6 4.5 4.5 0 0 1 6.4 0l.7.7.7-.7a4.5 4.5 0 0 1 6.4 0 4.7 4.7 0 0 1 0 6.6L12 20.3Z"/>`),
    private: OUTLINE_ICON(`<rect x="4" y="6" width="16" height="12" rx="2"/><path d="m5 8 7 5 7-5"/>`),
    bookmarks: OUTLINE_ICON(`<path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-4-6 4V5.5a1 1 0 0 1 1-1Z"/>`),
    assigned: OUTLINE_ICON(`<circle cx="10" cy="8.5" r="3.2"/><path d="M4.5 19.5a5.5 5.5 0 0 1 11 0"/><path d="M18.5 8v5M16 10.5h5"/>`),
    chat: OUTLINE_ICON(`<path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.2A.8.8 0 0 1 4.5 18.6V6.5Z"/>`),
    other: OUTLINE_ICON(`<rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.5"/><rect x="13" y="4.5" width="6.5" height="6.5" rx="1.5"/><rect x="4.5" y="13" width="6.5" height="6.5" rx="1.5"/><circle cx="16.25" cy="16.25" r="1" fill="currentColor" stroke="none"/>`)
  };
  const bodySigs$1 = /* @__PURE__ */ new WeakMap();
  const state$2 = {
    byFilter: /* @__PURE__ */ new Map(),
    // filter -> { rows, moreUrl, loadedAt, error }
    filter: "all",
    loading: false
  };
  const TTL$2 = 3e4;
  function who(n) {
    var _a2, _b2, _c;
    const acting = String(n.acting_user_name || "").replace(/\([^)]*\)|（[^）]*）/g, "").trim();
    return acting || ((_a2 = n.data) == null ? void 0 : _a2.display_username) || ((_b2 = n.data) == null ? void 0 : _b2.original_username) || ((_c = n.data) == null ? void 0 : _c.username) || "系统";
  }
  function summaryOf(n) {
    var _a2, _b2, _c, _d;
    const name = who(n);
    const t = ((_a2 = n.data) == null ? void 0 : _a2.topic_title) || "";
    const count = Number(((_b2 = n.data) == null ? void 0 : _b2.count) || 0);
    const consolidated = /^\d+ 个回复$/.test(String(((_c = n.data) == null ? void 0 : _c.display_username) || ""));
    switch (n.notification_type) {
      case 1:
      case 14:
        return `${name} 在《${t}》中提到了你`;
      case 2:
        if (consolidated) return `${n.data.display_username} · 《${t}》`;
        return `${name} 回复了《${t}》`;
      case 3:
        return `${name} 在《${t}》中引用了你`;
      case 4:
        return `${name} 编辑了《${t}》`;
      case 5:
        return count > 1 ? `${name} 等 ${count} 人赞了《${t}》` : `${name} 赞了《${t}》`;
      case 6:
      case 7:
        return `${name}：${t}`;
      case 12:
        return `获得徽章「${((_d = n.data) == null ? void 0 : _d.badge_name) || ""}」`;
      case 25:
        return `${name} 回应了《${t}》`;
      case 801:
        return `${name} 与《${t}》互动`;
      default:
        return name !== "系统" ? `${name} 与你互动：《${t}》` : `《${t}》有新动态`;
    }
  }
  function glyphOf(n) {
    var _a2;
    if (n.notification_type === 25) return ((_a2 = n.data) == null ? void 0 : _a2.reaction_icon) === "heart" ? "♥" : "☻";
    return TYPE_GLYPHS[n.notification_type] || "•";
  }
  function normalizeResponse(f, data) {
    if (f.kind === "pm") {
      const users = new Map((data.users || []).map((u) => [u.username, u]));
      const rows2 = (data.topics || []).map((t) => {
        const name = t.last_poster_username || "system";
        const u = users.get(name);
        return {
          href: `/t/${t.slug || "topic"}/${t.id}`,
          name,
          avatar: u == null ? void 0 : u.avatar_template,
          time: t.last_posted_at || t.created_at,
          msg: t.title || "",
          unread: (t.unread_posts || 0) > 0 || !!t.unseen,
          icon: "✉"
        };
      });
      return { rows: rows2, moreUrl: null };
    }
    if (f.kind === "bookmarks") {
      const rows2 = (data.bookmarks || []).map((b) => {
        var _a2, _b2;
        return {
          href: normalizePath(b.bookmarkable_url || `/t/${b.slug || "topic"}/${b.topic_id}/${b.linked_post_number || 1}`),
          name: ((_a2 = b.user) == null ? void 0 : _a2.username) || "?",
          avatar: (_b2 = b.user) == null ? void 0 : _b2.avatar_template,
          time: b.created_at,
          msg: stripTags(b.fancy_title || b.title || ""),
          unread: false,
          icon: "★"
        };
      });
      return { rows: rows2, moreUrl: null };
    }
    const rows = (data.notifications || []).map((n) => ({
      id: n.id,
      href: n.topic_id ? `/t/${n.slug || "topic"}/${n.topic_id}/${n.post_number || 1}` : "",
      name: who(n),
      avatar: n.acting_user_avatar_template || n.avatar_template,
      time: n.created_at,
      msg: summaryOf(n),
      unread: !n.read,
      icon: glyphOf(n)
    }));
    return {
      rows,
      moreUrl: data.load_more_notifications ? normalizePath(data.load_more_notifications) : null
    };
  }
  function filterPath(f) {
    if (f.kind === "pm" || f.kind === "bookmarks") {
      const name = encodeURIComponent(getCurrentUsername() || "");
      return `/u/${name}/user-menu-${f.kind === "pm" ? "private-messages" : "bookmarks"}`;
    }
    const qs = new URLSearchParams({ limit: "30", recent: "true", silent: "true" });
    if (f.types) qs.set("filter_by_types", f.types);
    return `/notifications?${qs.toString()}`;
  }
  async function fetchNotifRows(filterKey) {
    const f = FILTERS.find((x) => x.key === filterKey) || FILTERS[0];
    const data = await api(filterPath(f));
    return normalizeResponse(f, data);
  }
  function avatarHtml(row) {
    if (row.avatar) {
      return `<img src="${escapeHtml(fullAvatarUrl(row.avatar))}" alt="" loading="lazy">`;
    }
    return `<span class="is-text-avatar is-solid" style="background:${avatarColor(row.name)}">${escapeHtml(avatarLetter(row.name))}</span>`;
  }
  function notifRowsHtml(items) {
    return (items || []).map(rowHtml).join("");
  }
  function rowHtml(n) {
    const tag = n.href ? "a" : "span";
    const dead = n.href ? "" : " dead";
    return `
    <${tag} class="im-notif-row${n.unread ? " unread" : ""}${dead}" ${n.href ? `href="${escapeHtml(n.href)}"` : ""} ${n.id ? `data-notif-id="${n.id}"` : ""}>
      <span class="im-notif-avatar">${avatarHtml(n)}<span class="im-notif-type">${n.icon || "•"}</span></span>
      <span class="im-notif-info">
        <span class="im-notif-top"><span class="im-notif-name">${escapeHtml(n.name)}</span><span class="im-notif-time">${escapeHtml(formatTime(n.time))}</span></span>
        <span class="im-notif-msg">${escapeHtml(n.msg)}</span>
      </span>
    </${tag}>`;
  }
  function normalizePath(url) {
    return String(url).replace(/^https?:\/\/[^/]+\//, "/");
  }
  function setBodyStatus(panel, text) {
    const body = panel == null ? void 0 : panel.querySelector(".im-list-body");
    if (body) body.innerHTML = `<div class="im-list-status">${escapeHtml(text)}</div>`;
  }
  function renderNotifications(panel) {
    const chips = panel.querySelector(".im-list-chips");
    if (document.querySelector('.im-strip[data-ver="2"]')) {
      chips.dataset.src = "notifications-v2";
      chips.innerHTML = "";
    } else if (chips.dataset.src !== "notifications-v2") {
      chips.dataset.src = "notifications-v2";
      chips.innerHTML = FILTERS.map(
        (f) => `<button type="button" class="im-chip im-ntype-chip" data-ntype="${f.key}">${f.label}<span class="n"></span></button>`
      ).join("");
      for (const chip of chips.querySelectorAll("[data-ntype]")) {
        chip.classList.toggle("active", chip.dataset.ntype === state$2.filter);
      }
    }
    ensureMarkRead(panel, true);
    syncNotifStrip();
    const cached = state$2.byFilter.get(state$2.filter);
    const body = panel.querySelector(".im-list-body");
    if (!cached && !state$2.loading) {
      setBodyStatus(panel, "加载中…");
      loadFilter(state$2.filter);
      return;
    }
    const rows = (cached == null ? void 0 : cached.rows) || [];
    const html = (cached == null ? void 0 : cached.error) ? `<div class="im-list-status">通知加载失败（${escapeHtml(cached.error)}）</div>` : rows.map(rowHtml).join("") + `<div class="im-list-status">${(cached == null ? void 0 : cached.moreUrl) ? "下拉加载更多…" : rows.length ? "没有更多了" : "暂无通知"}</div>`;
    if (bodySigs$1.get(body) !== html) {
      bodySigs$1.set(body, html);
      body.innerHTML = html;
    }
  }
  async function loadFilter(filter, { force } = {}) {
    if (state$2.loading) return;
    const cached = state$2.byFilter.get(filter);
    if (!force && cached && Date.now() - cached.loadedAt < TTL$2) return;
    state$2.loading = true;
    try {
      const { rows: incoming, moreUrl } = await fetchNotifRows(filter);
      const prev = force && cached ? cached.rows : [];
      const seen = new Set(prev.map((r) => r.id).filter(Boolean));
      state$2.byFilter.set(filter, {
        rows: prev.concat(incoming.filter((r) => !r.id || !seen.has(r.id))),
        moreUrl,
        loadedAt: Date.now(),
        error: null
      });
    } catch (err) {
      state$2.byFilter.set(filter, {
        ...cached || { rows: [], moreUrl: null },
        loadedAt: Date.now(),
        error: (err == null ? void 0 : err.message) || "网络异常"
      });
    } finally {
      state$2.loading = false;
      const panel = document.querySelector(".im-list-panel");
      if (panel && panel.dataset.railKey === "notifications") renderNotifications(panel);
    }
  }
  function setNotifFilter(key) {
    if (!FILTERS.some((f) => f.key === key)) return;
    state$2.filter = key;
    setActiveRailKey("notifications", { force: true });
    syncNotifStrip();
    const panel = document.querySelector(".im-list-panel");
    if (panel && panel.dataset.railKey === "notifications") renderNotifications(panel);
    loadFilter(key);
  }
  function onNotificationsChip(chip) {
    setNotifFilter(chip.dataset.ntype);
  }
  function ensureNotifStrip() {
    let strip = document.querySelector(".im-strip");
    const trapped = strip == null ? void 0 : strip.querySelector(".user-menu");
    if (trapped) document.body.appendChild(trapped);
    if (strip && strip.dataset.ver === "2" && strip.querySelector(".im-strip-item[data-ntype]")) {
      syncNotifStrip();
      return strip;
    }
    strip == null ? void 0 : strip.remove();
    strip = document.createElement("nav");
    strip.className = "im-strip";
    strip.dataset.ver = "2";
    strip.setAttribute("aria-label", "通知筛选");
    strip.innerHTML = FILTERS.map(
      (f) => `<button type="button" class="im-strip-item" data-ntype="${f.key}" title="${f.label}" aria-pressed="false">${FILTER_ICONS[f.key] || FILTER_ICONS.all}` + (f.key === "all" ? `<span class="im-strip-badge" style="display:none"></span>` : "") + `</button>`
    ).join("");
    strip.addEventListener("click", (e) => {
      const btn = e.target.closest(".im-strip-item[data-ntype]");
      if (!btn) return;
      e.preventDefault();
      setNotifFilter(btn.dataset.ntype);
    });
    document.body.appendChild(strip);
    syncNotifStrip();
    return strip;
  }
  function syncNotifStrip() {
    const strip = document.querySelector(".im-strip");
    if (!strip) return;
    const active = activeRailKey() === "notifications" ? state$2.filter : null;
    for (const btn of strip.querySelectorAll(".im-strip-item[data-ntype]")) {
      const on = btn.dataset.ntype === active;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
    const badge = strip.querySelector('.im-strip-item[data-ntype="all"] .im-strip-badge');
    if (badge) {
      const n = getUnreadNotificationCount();
      badge.style.display = n > 0 ? "" : "none";
      badge.textContent = n > 99 ? "99+" : String(n);
    }
  }
  function notificationsScroll(body) {
    if (!body || body.scrollTop + body.clientHeight < body.scrollHeight - 120) return;
    const cached = state$2.byFilter.get(state$2.filter);
    if (!(cached == null ? void 0 : cached.moreUrl) || state$2.loading) return;
    state$2.loading = true;
    api(cached.moreUrl).then((data) => {
      const f = FILTERS.find((x) => x.key === state$2.filter) || FILTERS[0];
      const { rows, moreUrl } = normalizeResponse(f, data);
      cached.rows = cached.rows.concat(rows);
      cached.moreUrl = moreUrl;
      cached.loadedAt = Date.now();
    }).catch(() => {
    }).finally(() => {
      state$2.loading = false;
      const panel = document.querySelector(".im-list-panel");
      if (panel && panel.dataset.railKey === "notifications") renderNotifications(panel);
    });
  }
  function markNotificationRead(row) {
    var _a2;
    const id = Number((_a2 = row == null ? void 0 : row.dataset) == null ? void 0 : _a2.notifId);
    if (!id) return;
    for (const { rows } of state$2.byFilter.values()) {
      const r = rows.find((x) => x.id === id);
      if (r && r.unread) {
        r.unread = false;
        apiSend(`/notifications/read?id=${id}`, "PUT").then(refreshRail).catch(() => {
        });
        break;
      }
    }
  }
  async function markAllNotificationsRead() {
    await apiSend("/notifications/mark-read", "PUT");
    state$2.byFilter.clear();
    profileCache.clear();
    refreshRail();
  }
  const profileCache = /* @__PURE__ */ new Map();
  function profileNotifCache() {
    return profileCache;
  }
  async function markAllRead() {
    const panel = document.querySelector(".im-list-panel");
    try {
      await markAllNotificationsRead();
      if (panel && panel.dataset.railKey === "notifications") renderNotifications(panel);
    } catch {
      setBodyStatus(panel, "操作失败，请重试");
    }
  }
  function ensureMarkRead(panel, on) {
    var _a2;
    let btn = panel.querySelector(".im-mark-read");
    if (on) {
      if (btn) return;
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "im-icon-btn im-mark-read";
      btn.title = "全部忽略";
      btn.innerHTML = MARK_ALL_SVG;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        markAllRead();
      });
      (_a2 = panel.querySelector(".im-list-actions")) == null ? void 0 : _a2.prepend(btn);
    } else {
      btn == null ? void 0 : btn.remove();
    }
  }
  const TTL$1 = 3e4;
  function makeTopicListSource({ key, getApiPath, label }) {
    const state2 = { topics: [], usersById: {}, moreUrl: null, loading: false, loadedAt: 0, error: null };
    async function load(force) {
      var _a2;
      if (state2.loading) return;
      state2.loading = true;
      try {
        const data = await api(getApiPath());
        const topics = data.topic_list && data.topic_list.topics || [];
        const usersById = {};
        for (const u of data.users || []) usersById[u.id] = u;
        state2.topics = topics;
        state2.usersById = usersById;
        state2.moreUrl = ((_a2 = data.topic_list) == null ? void 0 : _a2.more_topics_url) || null;
        state2.loadedAt = Date.now();
        state2.error = null;
      } catch (err) {
        state2.error = (err == null ? void 0 : err.message) || "网络异常";
      } finally {
        state2.loading = false;
        rerenderIfActive();
      }
    }
    function rerenderIfActive() {
      const panel = document.querySelector(".im-list-panel");
      if (panel && panel.dataset.railKey === key) render(panel);
    }
    function render(panel) {
      const chips = panel.querySelector(".im-list-chips");
      if (chips.dataset.src !== label) {
        chips.dataset.src = label;
        chips.innerHTML = `<span class="im-chip active im-src-label">${escapeHtml(label)}</span>`;
      }
      const body = panel.querySelector(".im-list-body");
      if (state2.error && !state2.topics.length) {
        body.innerHTML = `<div class="im-list-status">${escapeHtml(label)}加载失败（${escapeHtml(state2.error)}）</div>`;
        return;
      }
      if (!state2.topics.length && !state2.loading && Date.now() - state2.loadedAt > TTL$1) {
        body.innerHTML = `<div class="im-list-status">加载中…</div>`;
        load();
        return;
      }
      renderTopicListRows(
        state2.topics,
        state2.usersById,
        state2.moreUrl ? "下拉加载更多…" : state2.topics.length ? "没有更多了" : `暂无${label}`
      );
    }
    return {
      render,
      onScroll(body) {
        if (!state2.moreUrl || state2.loading) return;
        if (body.scrollTop + body.clientHeight < body.scrollHeight - 120) return;
        state2.loading = true;
        api(state2.moreUrl).then((data) => {
          var _a2;
          const topics = data.topic_list && data.topic_list.topics || [];
          const known = new Set(state2.topics.map((t) => t.id));
          state2.topics = state2.topics.concat(topics.filter((t) => !known.has(t.id)));
          state2.moreUrl = ((_a2 = data.topic_list) == null ? void 0 : _a2.more_topics_url) || null;
          state2.loadedAt = Date.now();
        }).catch(() => {
        }).finally(() => {
          state2.loading = false;
          rerenderIfActive();
        });
      }
    };
  }
  function makeBookmarkSource() {
    const state2 = { items: [], moreUrl: null, loading: false, loadedAt: 0, error: null };
    async function load() {
      if (state2.loading) return;
      if (state2.items.length && Date.now() - state2.loadedAt < TTL$1) return;
      state2.loading = true;
      try {
        const data = await api("/bookmarks.json");
        state2.items = data.bookmarks || [];
        state2.moreUrl = data.more_bookmarks_url || null;
        state2.loadedAt = Date.now();
        state2.error = null;
      } catch (err) {
        state2.error = (err == null ? void 0 : err.message) || "网络异常";
      } finally {
        state2.loading = false;
        rerenderIfActive();
      }
    }
    function rerenderIfActive() {
      const panel = document.querySelector(".im-list-panel");
      if (panel && panel.dataset.railKey === "bookmarks") render(panel);
    }
    function rowHtml2(b) {
      const cat = b.category_id ? categoryById(b.category_id) : null;
      const title = b.title || b.name || b.fancy_title || "书签";
      const href = b.topic_id ? `/t/-/${b.topic_id}/${b.linked_post_number || 1}` : "";
      return `
      <a class="im-conv im-bm-row" ${href ? `href="${escapeHtml(href)}"` : ""} data-topic-id="${b.topic_id || ""}" title="${escapeHtml(title)}">
        <span class="im-conv-avatar is-solid" style="background:linear-gradient(135deg,#F0A63A,#D97706);color:#fff;display:inline-flex;align-items:center;justify-content:center">${ICONS.bookmark}</span>
        <span class="im-conv-info">
          <span class="im-conv-top">
            <span class="im-conv-title"><span class="im-conv-name">${escapeHtml(title)}</span></span>
            <span class="im-conv-time">${escapeHtml(formatTime(b.updated_at || b.created_at))}</span>
          </span>
          <span class="im-conv-bottom">
            <span class="im-conv-msg">${escapeHtml(cat ? cat.name : (b.tags || []).join(" / ") || "书签")}</span>
          </span>
        </span>
      </a>`;
    }
    function render(panel) {
      const chips = panel.querySelector(".im-list-chips");
      if (chips.dataset.src !== "bookmarks") {
        chips.dataset.src = "bookmarks";
        chips.innerHTML = `<span class="im-chip active im-src-label">书签</span>`;
      }
      const body = panel.querySelector(".im-list-body");
      if (state2.error && !state2.items.length) {
        body.innerHTML = `<div class="im-list-status">书签加载失败（${escapeHtml(state2.error)}）</div>`;
        return;
      }
      if (!state2.items.length && !state2.loading && Date.now() - state2.loadedAt > TTL$1) {
        body.innerHTML = `<div class="im-list-status">加载中…</div>`;
        load();
        return;
      }
      body.innerHTML = state2.items.map(rowHtml2).join("") + `<div class="im-list-status">${state2.moreUrl ? "下拉加载更多…" : state2.items.length ? "没有更多了" : "暂无书签"}</div>`;
    }
    return {
      render,
      onScroll(body) {
        if (!state2.moreUrl || state2.loading) return;
        if (body.scrollTop + body.clientHeight < body.scrollHeight - 120) return;
        state2.loading = true;
        api(state2.moreUrl).then((data) => {
          state2.items = state2.items.concat(data.bookmarks || []);
          state2.moreUrl = data.more_bookmarks_url || null;
          state2.loadedAt = Date.now();
        }).catch(() => {
        }).finally(() => {
          state2.loading = false;
          rerenderIfActive();
        });
      }
    };
  }
  function makePlaceholderSource(item) {
    return {
      render(panel) {
        const chips = panel.querySelector(".im-list-chips");
        if (chips.dataset.src !== `deco:${item.key}`) {
          chips.dataset.src = `deco:${item.key}`;
          chips.innerHTML = `<span class="im-chip active im-src-label">${escapeHtml(item.label)}</span>`;
        }
        panel.querySelector(".im-list-body").innerHTML = `
        <div class="im-src-placeholder">
          <span class="ico">${ICONS[item.icon] || ""}</span>
          <p class="t">${escapeHtml(item.label)} · 规划中</p>
          <p class="d">本皮肤装饰入口暂以占位呈现，后续版本接入</p>
        </div>`;
      }
    };
  }
  function registerExtraSources() {
    registerSource("messages", makeTopicListSource({
      key: "messages",
      label: "私信",
      getApiPath: () => `/topics/private-messages/${getCurrentUsername() || ""}.json`
    }));
    registerSource("bookmarks", makeBookmarkSource());
    for (const item of RAIL_DECO_ITEMS) {
      if (item.key === "more") continue;
      registerSource(item.key, makePlaceholderSource(item));
    }
  }
  const sources = /* @__PURE__ */ new Map();
  const scrollCache = /* @__PURE__ */ new Map();
  let activeKey = "chat";
  let lastKey = null;
  function registerSource(key, source) {
    sources.set(key, source);
  }
  function hasSource(key) {
    return sources.has(key);
  }
  function activeRailKey() {
    return activeKey;
  }
  function setActiveRailKey(key, opts = {}) {
    const panel = document.querySelector(".im-list-panel");
    const force = !!opts.force && !!panel && panel.dataset.src !== "rail";
    if (key === activeKey && !force || !sources.has(key)) return;
    if (panel) {
      const body = panel.querySelector(".im-list-body");
      scrollCache.set(activeKey, (body == null ? void 0 : body.scrollTop) || 0);
    }
    activeKey = key;
    renderActiveSource();
  }
  function renderActiveSource() {
    var _a2, _b2, _c, _d;
    const panel = document.querySelector(".im-list-panel");
    if (!panel) return;
    bindSourceControls(panel);
    panel.dataset.src = "rail";
    const switching = lastKey !== activeKey;
    if (lastKey && switching) (_b2 = (_a2 = sources.get(lastKey)) == null ? void 0 : _a2.onHide) == null ? void 0 : _b2.call(_a2, panel);
    lastKey = activeKey;
    panel.dataset.railKey = activeKey;
    try {
      (_d = (_c = sources.get(activeKey)) == null ? void 0 : _c.render) == null ? void 0 : _d.call(_c, panel);
    } catch (err) {
      console.warn("[linuxdo-im] rail source render failed:", activeKey, err);
    }
    for (const btn of document.querySelectorAll(".im-rail-item[data-rail-key]")) {
      btn.classList.toggle("active", btn.dataset.railKey === activeKey);
    }
    syncNotifStrip();
    if (switching) {
      const body = panel.querySelector(".im-list-body");
      if (body && scrollCache.has(activeKey)) body.scrollTop = scrollCache.get(activeKey);
    }
  }
  function onListBodyScroll(body) {
    if (body.scrollTop + body.clientHeight < body.scrollHeight - 120) return;
    const source = sources.get(activeKey);
    if (source == null ? void 0 : source.onScroll) {
      source.onScroll(body);
      return;
    }
    loadMoreList();
  }
  function renderChatSource(panel) {
    ensureMarkRead(panel, false);
    const chips = panel.querySelector(".im-list-chips");
    if (chips.dataset.src !== "chat") {
      chips.dataset.src = "chat";
      chips.innerHTML = `<button type="button" class="im-chip active" data-chip="all">消息<span class="n"></span></button><button type="button" class="im-chip" data-chip="unread">未读<span class="n"></span></button>`;
    }
    renderListRows();
  }
  function bindSourceControls(panel) {
    if (panel.dataset.srcBound === "1") return;
    panel.dataset.srcBound = "1";
    const chips = panel.querySelector(".im-list-chips");
    chips == null ? void 0 : chips.addEventListener("click", (e) => {
      const chip = e.target.closest(".im-chip");
      if (!chip || !chips.contains(chip)) return;
      if (chip.dataset.ntype) {
        onNotificationsChip(chip);
        return;
      }
      if (chip.dataset.chip) {
        for (const c of chips.querySelectorAll(".im-chip")) c.classList.toggle("active", c === chip);
        navigateInApp(chip.dataset.chip === "unread" ? "/unseen" : "/latest");
      }
    });
  }
  let initialized = false;
  function ensureRailSources() {
    if (initialized) return;
    initialized = true;
    registerSource("chat", { render: renderChatSource });
    registerSource("notifications", {
      render: renderNotifications,
      onHide: (panel) => ensureMarkRead(panel, false),
      onScroll: notificationsScroll
    });
    registerExtraSources();
  }
  const railRefreshListeners = [];
  function onRailRefresh(fn) {
    railRefreshListeners.push(fn);
  }
  function refreshRail() {
    for (const fn of railRefreshListeners) fn();
  }
  function isNav2Open() {
    try {
      return localStorage.getItem(NAV2_KEY) === "1";
    } catch {
      return false;
    }
  }
  function setNav2Open(open) {
    try {
      localStorage.setItem(NAV2_KEY, open ? "1" : "0");
    } catch {
    }
    document.documentElement.classList.toggle("im-nav2-open", open);
    const moreBtn = document.querySelector(".im-rail-more");
    if (moreBtn) {
      moreBtn.classList.toggle("is-on", open);
      moreBtn.setAttribute("aria-expanded", open ? "true" : "false");
      moreBtn.title = open ? "收起话题导航" : "展开话题导航";
    }
  }
  function isRailCollapsed() {
    try {
      return localStorage.getItem(RAIL_COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  }
  function setRailCollapsed(collapsed) {
    try {
      localStorage.setItem(RAIL_COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
    }
    document.documentElement.classList.toggle("im-rail-collapsed", collapsed);
    window.dispatchEvent(new Event("im-layout-change"));
    const btn = document.querySelector(".im-rail-collapse");
    if (btn) {
      const label = btn.querySelector("span");
      if (label) label.textContent = collapsed ? "展开" : "收起";
      btn.title = collapsed ? "展开侧栏" : "收起侧栏";
      btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    }
  }
  function ensureRailFold(bottom) {
    if (!bottom || bottom.querySelector(".im-rail-collapse")) return;
    const fold = document.createElement("button");
    fold.type = "button";
    fold.className = "im-rail-item im-rail-collapse";
    fold.innerHTML = `${ICONS.chevronsLeft}<span>收起</span>`;
    fold.addEventListener("click", () => {
      if (SKIN_ID === "dingtalk") {
        const w = parseInt(document.documentElement.style.getPropertyValue("--im-nav"), 10) || RAIL_WIDTH;
        const wide = w < RAIL_W_COMPACT;
        applyRailWidth(wide ? RAIL_W_MAX : RAIL_WIDTH);
        try {
          localStorage.setItem(RAIL_W_KEY, String(wide ? RAIL_W_MAX : RAIL_WIDTH));
        } catch {
        }
        syncRailFold();
        return;
      }
      const next = !isRailCollapsed();
      if (next) {
        const w = parseInt(document.documentElement.style.getPropertyValue("--im-nav"), 10);
        if (w && w < RAIL_W_MIN + 24) {
          document.documentElement.style.setProperty("--im-nav", `${RAIL_WIDTH}px`);
          try {
            localStorage.setItem(RAIL_W_KEY, String(RAIL_WIDTH));
          } catch {
          }
        }
      }
      setRailCollapsed(next);
    });
    bottom.appendChild(fold);
  }
  function syncRailFold() {
    if (SKIN_ID !== "dingtalk") return;
    const btn = document.querySelector(".im-rail-collapse");
    if (!btn) return;
    const w = parseInt(document.documentElement.style.getPropertyValue("--im-nav"), 10) || RAIL_WIDTH;
    const wide = w >= RAIL_W_COMPACT;
    const label = btn.querySelector("span");
    if (label) label.textContent = wide ? "收起" : "展开";
    btn.title = wide ? "收起侧栏" : "展开侧栏";
    btn.setAttribute("aria-expanded", wide ? "true" : "false");
  }
  function getOrgName() {
    try {
      return localStorage.getItem(ORG_NAME_KEY) || defaultOrgName();
    } catch {
      return defaultOrgName();
    }
  }
  function getOrgIcon() {
    try {
      return localStorage.getItem(ORG_ICON_KEY) || "do";
    } catch {
      return "do";
    }
  }
  function renderOrgChip(rail) {
    const root2 = rail || document.querySelector(".im-rail");
    if (!root2) return;
    const logo = root2.querySelector(".im-rail-org-logo");
    const name = root2.querySelector(".im-rail-org-name");
    if (!logo || !name) return;
    const icon = getOrgIcon();
    name.textContent = getOrgName();
    if (/^(https?:\/\/|data:image)/i.test(icon)) {
      logo.innerHTML = `<img src="${escapeHtml(icon)}" alt="">`;
    } else {
      logo.textContent = [...icon].slice(0, 2).join("") || "do";
    }
  }
  function bindOrgChip(rail) {
    const chip = rail == null ? void 0 : rail.querySelector(".im-rail-org-chip");
    if (!chip || chip.dataset.bound === "1") return;
    chip.dataset.bound = "1";
    const logo = chip.querySelector(".im-rail-org-logo");
    const name = chip.querySelector(".im-rail-org-name");
    if (logo) {
      logo.title = "点击更换图标（1~2 个字 / emoji / 图片 URL）";
      logo.addEventListener("click", (e) => {
        e.stopPropagation();
        const v = window.prompt("团队图标：1~2 个字、emoji 或图片 URL", getOrgIcon());
        if (v === null) return;
        try {
          localStorage.setItem(ORG_ICON_KEY, v.trim() || "do");
        } catch {
        }
        renderOrgChip(rail);
      });
    }
    if (name) {
      name.title = "点击修改团队名称";
      name.addEventListener("click", (e) => {
        e.stopPropagation();
        const v = window.prompt("团队名称", getOrgName());
        if (v === null) return;
        try {
          localStorage.setItem(ORG_NAME_KEY, v.trim() || defaultOrgName());
        } catch {
        }
        renderOrgChip(rail);
      });
    }
  }
  function ensureRailDingtalk() {
    let rail = document.querySelector(".im-rail");
    if (rail && !rail.querySelector(".im-rail-org-chip, .im-rail-me")) {
      rail.remove();
      rail = null;
    }
    if (rail) {
      syncRailDingtalk();
      return rail;
    }
    rail = document.createElement("nav");
    rail.className = "im-rail";
    rail.setAttribute("aria-label", "IM 导航");
    const head = document.createElement("div");
    head.className = "im-rail-head";
    if (SKIN_ID === "wecom") {
      head.innerHTML = `<span class="im-rail-me"><span class="im-rail-avatar"></span><span class="im-rail-avatar-badge" style="display:none"></span></span><span class="im-rail-user-name"></span>`;
    } else {
      head.innerHTML = `<div class="im-rail-org-chip"><span class="im-rail-org-logo">do</span><span class="im-rail-org-name">linux.do</span><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></div>`;
    }
    rail.appendChild(head);
    const items = document.createElement("div");
    items.className = "im-rail-items";
    const solid = SKIN_ID === "wecom";
    const rIcon = (k) => solid && ICONS[`${k}Fill`] ? ICONS[`${k}Fill`] : ICONS[k];
    items.innerHTML = `<button type="button" class="im-rail-item active" data-rail-key="chat">${rIcon("msg")}<span>消息</span><span class="im-rail-badge" style="display:none"></span></button><button type="button" class="im-rail-item" data-rail-key="notifications">${rIcon("bell")}<span>通知</span><span class="im-rail-badge" style="display:none"></span></button><button type="button" class="im-rail-item" data-rail-key="messages">${rIcon("mail")}<span>私信</span><span class="im-rail-badge" style="display:none"></span></button><button type="button" class="im-rail-item" data-rail-key="bookmarks">${rIcon("bookmark")}<span>书签</span><span class="im-rail-badge" style="display:none"></span></button><button type="button" class="im-rail-item" data-rail-key="chats">${rIcon("users")}<span>聊天</span><span class="im-rail-badge" style="display:none"></span></button>` + RAIL_DECO_ITEMS.filter((item) => item.key !== "more").map(
      (item) => `<button type="button" class="im-rail-item" data-rail-key="${item.key}">${rIcon(item.icon)}<span>${item.label}</span>${item.dot ? '<i class="im-rail-dot"></i>' : ""}</button>`
    ).join("");
    rail.appendChild(items);
    items.addEventListener("click", (e) => {
      const btn = e.target.closest(".im-rail-item[data-rail-key]");
      if (!btn || !items.contains(btn)) return;
      const key = btn.dataset.railKey;
      if (key === "chats") {
        navigateInApp("/chat/channels");
        return;
      }
      if (!document.querySelector(".im-list-panel")) {
        navigateInApp("/");
        return;
      }
      if (hasSource(key)) setActiveRailKey(key, { force: true });
    });
    if (SKIN_ID === "wecom") {
      const groups = document.createElement("div");
      groups.className = "im-rail-groups";
      const groupItems = [
        ["unread", "未读", "mail", true],
        ["at", "@我", "at"],
        ["single", "单聊", "users"],
        ["group", "群聊", "users"],
        ["inner", "内部聊天", "msg"],
        ["outer", "外部聊天", "doc"],
        ["marked", "标记", "collect"]
      ];
      groups.innerHTML = `<div class="im-rail-group-title"><span>分组</span></div>` + groupItems.map(([key, label, icon, withCount]) => `<button type="button" class="im-rail-item im-rail-group-item" data-group="${key}">${ICONS[icon]}<span>${label}</span>` + (withCount ? `<span class="im-rail-count" style="display:none"></span>` : "") + `</button>`).join("");
      items.appendChild(groups);
      groups.addEventListener("click", (e) => {
        const btn = e.target.closest(".im-rail-group-item");
        if (!btn || btn.dataset.group !== "unread") return;
        navigateInApp("/unseen");
      });
    }
    const bottom = document.createElement("div");
    bottom.className = "im-rail-bottom";
    ensureRailFold(bottom);
    const more = document.createElement("button");
    more.type = "button";
    more.className = "im-rail-item im-rail-more";
    more.dataset.railKey = "more";
    more.title = "展开话题导航";
    more.setAttribute("aria-expanded", "false");
    more.innerHTML = `${ICONS.more}<span>更多</span>`;
    more.addEventListener("click", () => setNav2Open(!isNav2Open()));
    bottom.appendChild(more);
    rail.appendChild(bottom);
    document.body.appendChild(rail);
    if (SKIN_ID === "wecom") {
      bindRailAvatarNotif(rail);
    } else {
      renderOrgChip(rail);
      bindOrgChip(rail);
    }
    setNav2Open(isNav2Open());
    syncRailDingtalk();
    return rail;
  }
  function getUnreadNotificationCount() {
    var _a2, _b2, _c;
    try {
      const owner = getEmberOwner();
      const user = safeLookup(owner, "service:current-user") || ((_c = (_b2 = (_a2 = window.Discourse) == null ? void 0 : _a2.User) == null ? void 0 : _b2.current) == null ? void 0 : _c.call(_b2)) || null;
      if (user) {
        const pick = (key) => {
          var _a3;
          try {
            const v = (_a3 = user.get) == null ? void 0 : _a3.call(user, key);
            if (v != null && v !== "") return Number(v);
          } catch {
          }
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
    } catch {
    }
    const domBadge = document.querySelector(
      "#current-user .badge-notification, .header-dropdown-toggle.current-user .badge-notification, #toggle-current-user .badge-notification, .current-user .badge-notification"
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
  function syncRailDingtalk() {
    const avatarEl = document.querySelector(".im-rail .im-rail-avatar") || document.querySelector(".im-rail-avatar");
    if (!avatarEl) return;
    const img = document.querySelector("#current-user img");
    const name = getCurrentUsername();
    if (img && img.src) {
      if (avatarEl.dataset.bound !== img.src) {
        avatarEl.dataset.bound = img.src;
        avatarEl.innerHTML = `<img src="${escapeHtml(img.src)}" alt="">`;
        avatarEl.style.background = "transparent";
      }
    } else if (name && avatarEl.dataset.bound !== name) {
      avatarEl.dataset.bound = name;
      avatarEl.textContent = avatarLetter(name);
      avatarEl.style.background = avatarColor(name);
    }
    const userNameEl = document.querySelector(".im-rail-user-name");
    if (userNameEl) userNameEl.textContent = name || "我";
    const notifCount = getUnreadNotificationCount();
    const avatarBadge = document.querySelector(".im-rail .im-rail-avatar-badge") || document.querySelector(".im-rail-avatar-badge");
    if (avatarBadge) {
      avatarBadge.style.display = notifCount > 0 ? "" : "none";
      avatarBadge.textContent = notifCount > 99 ? "99+" : String(notifCount);
    }
    const unread = listState.topics.reduce((sum, t) => sum + (t.unread || 0) + (t.new_posts || 0), 0);
    setRailBadge("chat", unread);
    setRailBadge("notifications", notifCount);
    setRailBadge("messages", getPersonalMessagesUnread());
    setRailBadge("chats", getNativeChatBadgeCount());
    const groupCount = document.querySelector('.im-rail-group-item[data-group="unread"] .im-rail-count');
    if (groupCount) {
      groupCount.textContent = unread > 99 ? "99+" : String(unread);
      groupCount.style.display = unread > 0 ? "" : "none";
    }
  }
  function setRailBadge(key, count) {
    const badge = document.querySelector(`[data-rail-key="${key}"] .im-rail-badge`);
    if (!badge) return;
    badge.style.display = count > 0 ? "" : "none";
    badge.textContent = count > 99 ? "99+" : String(count);
  }
  function getPersonalMessagesUnread() {
    var _a2, _b2, _c;
    try {
      const owner = getEmberOwner();
      const user = safeLookup(owner, "service:current-user") || ((_c = (_b2 = (_a2 = window.Discourse) == null ? void 0 : _a2.User) == null ? void 0 : _b2.current) == null ? void 0 : _c.call(_b2)) || null;
      const pick = (key) => {
        var _a3;
        try {
          const v = (_a3 = user == null ? void 0 : user.get) == null ? void 0 : _a3.call(user, key);
          if (v != null && v !== "") return Number(v);
        } catch {
        }
        const direct = user == null ? void 0 : user[key];
        return direct == null || direct === "" ? null : Number(direct);
      };
      const pm = pick("new_personal_messages_notifications_count");
      if (pm != null && !Number.isNaN(pm)) return Math.max(0, pm);
    } catch {
    }
    return 0;
  }
  function getNativeChatBadgeCount() {
    const el = document.querySelector(
      ".header-dropdown-toggle.chat .badge-notification, .chat-header-icon .badge-notification, #header .chat-badge, li.header-dropdown-toggle[data-badge-name] .badge-notification"
    );
    if (!el) return 0;
    const text = (el.textContent || "").replace(/\s+/g, "").trim();
    const n = parseInt(text, 10);
    return Number.isNaN(n) ? 1 : Math.min(n, 99);
  }
  const NATIVE_USER_MENU_KEY = "im-native-user-menu";
  function nativeUserMenuForced() {
    try {
      return localStorage.getItem(NATIVE_USER_MENU_KEY) === "1";
    } catch {
      return false;
    }
  }
  function interceptionAvailable() {
    return !nativeUserMenuForced() && hasSource("notifications");
  }
  function openNotificationsColumn() {
    setActiveRailKey("notifications");
    if (document.documentElement.classList.contains("im-topic-open")) {
      navigateInApp("/");
    }
    return true;
  }
  function bindRailAvatarNotif(rail) {
    const avatar = rail == null ? void 0 : rail.querySelector(".im-rail-avatar");
    if (!avatar || avatar.dataset.notifBound === "1") return;
    avatar.dataset.notifBound = "1";
    avatar.removeAttribute("title");
    avatar.addEventListener("click", (e) => {
      if (getViewMode() === "native" || otherThemeActive()) return;
      if (!interceptionAvailable()) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
      try {
        navigateInApp("/");
        refreshRail();
      } catch (err) {
        console.warn("[linuxdo-im] avatar → home failed", err);
      }
    });
  }
  function bindHeaderUserMenuInterception() {
    if (window.__imUserMenuInterceptBound) return;
    window.__imUserMenuInterceptBound = true;
    document.addEventListener(
      "click",
      (e) => {
        if (e.button !== 0) return;
        if (getViewMode() === "native" || otherThemeActive()) return;
        if (!interceptionAvailable()) return;
        const toggle = e.target.closest(
          "#toggle-current-user, #current-user button, .header-dropdown-toggle.current-user button, .current-user button.icon, #current-user .icon, #current-user summary, .header-dropdown-toggle.current-user"
        );
        if (!toggle) return;
        e.preventDefault();
        e.stopPropagation();
        try {
          openNotificationsColumn();
        } catch (err) {
          console.warn("[linuxdo-im] header user-menu interception failed", err);
        }
      },
      true
    );
  }
  const RECENT_KEY = "linuxdo-im-search-recent";
  const DEBOUNCE_MS = 220;
  let recent = loadRecent();
  let root = null;
  let inputEl = null;
  let bodyEl = null;
  let moreEl = null;
  let clearEl = null;
  let chipsEl = null;
  let debounceTimer = 0;
  const TYPES = [
    { key: "all", label: "全部" },
    { key: "话题", label: "话题" },
    { key: "用户", label: "用户" },
    { key: "分类", label: "分类" },
    { key: "标签", label: "标签" }
  ];
  const CLOSE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
  const LINK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 13.5a4 4 0 0 0 5.66 0l3-3a4 4 0 1 0-5.66-5.66l-1.24 1.24"/><path d="M13.5 10.5a4 4 0 0 0-5.66 0l-3 3a4 4 0 1 0 5.66 5.66l1.24-1.24"/></svg>`;
  const state$1 = {
    term: "",
    itemsTerm: null,
    // state.items 对应的关键词（防旧结果串词）
    type: "all",
    // 结果类型筛选（飞书 chips 行）
    loading: false,
    error: null,
    seq: 0,
    // 丢弃过期响应
    flat: [],
    // 渲染后的可导航项（含 recent）
    active: -1
  };
  function loadRecent() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 8);
    } catch {
      return [];
    }
  }
  function pushRecent(term) {
    const t = (term || "").trim();
    if (!t) return;
    recent = [t, ...recent.filter((x) => x !== t)].slice(0, 8);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    } catch {
    }
  }
  function availableInIM() {
    return getViewMode() !== "native" && !otherThemeActive();
  }
  function hl(text, term) {
    const safe = escapeHtml(String(text || ""));
    if (!term) return safe;
    const esc2 = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      return safe.replace(new RegExp(`(${escapeHtml(esc2)})`, "gi"), '<span class="search-hl">$1</span>');
    } catch {
      return safe;
    }
  }
  function letterAvatar(name) {
    return `<span class="ava is-letter" style="background:${avatarColor(name)}">${escapeHtml(avatarLetter(name))}</span>`;
  }
  function buildItems(data) {
    const topicsById = new Map((data.topics || []).map((t) => [t.id, t]));
    const items = [];
    for (const p of data.posts || []) {
      const topic = topicsById.get(p.topic_id) || {};
      const title = stripTags(p.topic_title_headline || topic.title || topic.fancy_title || "");
      if (!title) continue;
      const author = p.username || "";
      items.push({
        group: "话题",
        title,
        sub: p.blurb || "",
        meta: [author, p.like_count > 0 ? `♥ ${p.like_count}` : "", formatTime(p.created_at)].filter(Boolean).join(" · "),
        avatar: p.avatar_template ? `<img class="ava" src="${escapeHtml(fullAvatarUrl(p.avatar_template))}" alt="" loading="lazy">` : letterAvatar(author || "?"),
        href: `/t/${topic.slug || "topic"}/${p.topic_id}${p.post_number > 1 ? `/${p.post_number}` : ""}`
      });
    }
    for (const u of data.users || []) {
      items.push({
        group: "用户",
        title: u.username,
        sub: u.name || "",
        avatar: u.avatar_template ? `<img class="ava" src="${escapeHtml(fullAvatarUrl(u.avatar_template))}" alt="" loading="lazy">` : letterAvatar(u.username || "?"),
        href: `/u/${encodeURIComponent(u.username || "")}`
      });
    }
    for (const c of data.categories || []) {
      if (!c.name && !c.slug) continue;
      items.push({
        group: "分类",
        title: c.name || c.slug,
        avatar: `<span class="ava is-dot" style="background:#${c.color || "0088CC"}"></span>`,
        href: `/c/${encodeURIComponent(c.slug || c.id)}${c.id ? `/${c.id}` : ""}`
      });
    }
    for (const t of data.tags || []) {
      const name = typeof t === "string" ? t : t.name || t.id;
      const slug = typeof t === "string" ? t : t.slug || t.name || t.id;
      if (!name) continue;
      const count = typeof t === "object" && t.topic_count > 0 ? `${t.topic_count} 话题` : "";
      items.push({ group: "标签", title: `#${name}`, sub: count, href: `/tag/${encodeURIComponent(slug)}` });
    }
    return items;
  }
  function itemHtml(it, idx, term) {
    const copy = it.href ? `<span class="im-search-copy" title="复制链接">${LINK_SVG}</span>` : "";
    return `
    <a class="im-search-item${idx === state$1.active ? " active" : ""}" role="option" data-idx="${idx}" href="${escapeHtml(it.href)}">
      ${it.avatar || ""}
      <span class="im-search-item-main">
        <span class="tt">${hl(it.title, term)}</span>
        ${it.meta ? `<span class="meta">${escapeHtml(it.meta)}</span>` : ""}
        ${it.sub ? `<span class="sb">${hl(it.sub, term)}</span>` : ""}
      </span>
      ${copy}
    </a>`;
  }
  function renderChips() {
    if (!chipsEl) return;
    chipsEl.innerHTML = TYPES.map(
      (t) => `<button type="button" class="im-search-chip${t.key === state$1.type ? " active" : ""}" data-type="${t.key}">${t.label}</button>`
    ).join("");
  }
  function renderBody() {
    if (!bodyEl) return;
    const term = state$1.term.trim();
    let html = "";
    state$1.flat = [];
    state$1.active = -1;
    if (clearEl) clearEl.hidden = !state$1.term;
    if (state$1.loading) {
      html = `<div class="im-search-status">搜索中…</div>`;
    } else if (state$1.error) {
      html = `<div class="im-search-status">搜索失败（${escapeHtml(state$1.error)}）</div>`;
    } else if (term) {
      const all = state$1.itemsTerm === term ? state$1.items || [] : [];
      const items = state$1.type === "all" ? all : all.filter((it) => it.group === state$1.type);
      if (items.length) {
        let lastGroup = null;
        for (const it of items) {
          if (state$1.type === "all" && it.group !== lastGroup) {
            html += `<div class="im-search-group">${escapeHtml(it.group)}</div>`;
            lastGroup = it.group;
          }
          html += itemHtml(it, state$1.flat.length, term);
          state$1.flat.push(it);
        }
      } else {
        html += `<div class="im-search-status">没有找到“${escapeHtml(term)}”相关内容</div>`;
      }
    } else {
      if (recent.length) {
        html += `<div class="im-search-group">最近搜索</div>`;
        for (const t of recent) {
          const it = { group: "最近", title: t, href: null, recent: true };
          html += itemHtml(it, state$1.flat.length, "");
          state$1.flat.push(it);
        }
      } else {
        html += `<div class="im-search-status">输入关键词搜索话题、用户、分类</div>`;
      }
    }
    bodyEl.innerHTML = html;
    if (moreEl) {
      moreEl.hidden = !term;
      moreEl.textContent = `在全文搜索中查看“${term}”的全部结果`;
    }
  }
  async function runSearch(term) {
    const seq2 = ++state$1.seq;
    state$1.loading = true;
    state$1.error = null;
    renderBody();
    try {
      const data = await api(`/search/query?term=${encodeURIComponent(term)}`);
      if (seq2 !== state$1.seq) return;
      state$1.items = buildItems(data);
      state$1.itemsTerm = term;
      state$1.loading = false;
      renderBody();
    } catch (err) {
      if (seq2 !== state$1.seq) return;
      state$1.loading = false;
      state$1.error = (err == null ? void 0 : err.message) || "网络异常";
      renderBody();
    }
  }
  function scheduleSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const term = state$1.term.trim();
      if (term) runSearch(term);
      else {
        state$1.seq++;
        state$1.loading = false;
        state$1.error = null;
        renderBody();
      }
    }, DEBOUNCE_MS);
  }
  function setActive(idx) {
    var _a2;
    if (!state$1.flat.length) return;
    state$1.active = (idx + state$1.flat.length) % state$1.flat.length;
    for (const el of bodyEl.querySelectorAll(".im-search-item")) {
      el.classList.toggle("active", Number(el.dataset.idx) === state$1.active);
    }
    (_a2 = bodyEl.querySelector(`.im-search-item[data-idx="${state$1.active}"]`)) == null ? void 0 : _a2.scrollIntoView({ block: "nearest" });
  }
  function openItem(it) {
    if (!it) return;
    if (it.recent) {
      inputEl.value = it.title;
      state$1.term = it.title;
      runSearch(it.title);
      return;
    }
    if (state$1.term.trim()) pushRecent(state$1.term.trim());
    closeSearchPopup();
    navigateInApp(it.href);
  }
  function ensureRoot() {
    if (root) return root;
    root = document.createElement("div");
    root.className = "im-search-pop-overlay";
    root.innerHTML = `
    <div class="im-search-pop" role="dialog" aria-modal="true" aria-label="搜索">
      <div class="im-search-head">
        <div class="im-search-field">
          ${ICONS.search}
          <input type="search" class="im-search-input" placeholder="搜索话题、用户、分类" autocomplete="off" aria-label="搜索关键词">
          <button type="button" class="im-search-clear" hidden>清除</button>
        </div>
        <button type="button" class="im-search-close" title="退出搜索 (Esc)" aria-label="关闭">${CLOSE_SVG}</button>
      </div>
      <div class="im-search-chips" role="group" aria-label="结果类型"></div>
      <div class="im-search-body" role="listbox" aria-label="搜索结果"></div>
      <div class="im-search-foot">
        <a class="im-search-more" href="/search" hidden></a>
        <span class="im-search-tips">
          <span><kbd>↑</kbd><kbd>↓</kbd> 移动光标</span>
          <span><kbd>↵</kbd> 选择条目</span>
          <span><kbd>esc</kbd> 退出搜索</span>
        </span>
      </div>
    </div>`;
    document.body.appendChild(root);
    inputEl = root.querySelector(".im-search-input");
    bodyEl = root.querySelector(".im-search-body");
    moreEl = root.querySelector(".im-search-more");
    clearEl = root.querySelector(".im-search-clear");
    chipsEl = root.querySelector(".im-search-chips");
    renderChips();
    root.addEventListener("mousedown", (e) => {
      if (e.target === root) closeSearchPopup();
    });
    root.querySelector(".im-search-close").addEventListener("click", closeSearchPopup);
    clearEl.addEventListener("click", () => {
      inputEl.value = "";
      state$1.term = "";
      state$1.seq++;
      state$1.loading = false;
      state$1.error = null;
      renderBody();
      inputEl.focus();
    });
    chipsEl.addEventListener("click", (e) => {
      const chip = e.target.closest(".im-search-chip[data-type]");
      if (!chip || chip.dataset.type === state$1.type) return;
      state$1.type = chip.dataset.type;
      for (const c of chipsEl.querySelectorAll(".im-search-chip")) {
        c.classList.toggle("active", c.dataset.type === state$1.type);
      }
      renderBody();
    });
    inputEl.addEventListener("input", () => {
      state$1.term = inputEl.value;
      scheduleSearch();
    });
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(state$1.active + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(state$1.active - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const term = state$1.term.trim();
        if (state$1.active >= 0 && state$1.flat[state$1.active]) openItem(state$1.flat[state$1.active]);
        else if (term) runSearch(term);
      }
    });
    bodyEl.addEventListener("click", (e) => {
      var _a2, _b2;
      const copy = e.target.closest(".im-search-copy");
      if (copy) {
        e.preventDefault();
        e.stopPropagation();
        const href = (_a2 = copy.closest(".im-search-item")) == null ? void 0 : _a2.getAttribute("href");
        if (href) (_b2 = navigator.clipboard) == null ? void 0 : _b2.writeText(location.origin + href).catch(() => {
        });
        copy.classList.add("done");
        setTimeout(() => copy.classList.remove("done"), 1200);
        return;
      }
      const el = e.target.closest(".im-search-item");
      if (!el) return;
      e.preventDefault();
      openItem(state$1.flat[Number(el.dataset.idx)]);
    });
    moreEl.addEventListener("click", (e) => {
      e.preventDefault();
      closeSearchPopup();
      navigateInApp(`/search?q=${encodeURIComponent(state$1.term.trim())}`);
    });
    return root;
  }
  function openSearchPopup(prefill) {
    if (!availableInIM()) return;
    ensureRoot();
    root.classList.add("open");
    state$1.term = inputEl.value;
    if (state$1.term.trim() && state$1.itemsTerm !== state$1.term.trim()) scheduleSearch();
    document.documentElement.classList.add("im-search-open");
    renderBody();
    setTimeout(() => inputEl.focus(), 0);
  }
  function closeSearchPopup() {
    if (!root) return;
    root.classList.remove("open");
    document.documentElement.classList.remove("im-search-open");
    state$1.seq++;
  }
  function toggleSearchPopup() {
    if (root && root.classList.contains("open")) closeSearchPopup();
    else openSearchPopup();
  }
  function bindSearchShortcut() {
    document.addEventListener(
      "keydown",
      (e) => {
        if (!availableInIM()) return;
        if ((e.metaKey || e.ctrlKey) && !e.altKey && String(e.key).toLowerCase() === "k") {
          e.preventDefault();
          e.stopPropagation();
          toggleSearchPopup();
          return;
        }
        if (e.key === "Escape" && root && root.classList.contains("open")) {
          e.preventDefault();
          closeSearchPopup();
        }
      },
      true
    );
  }
  function bindSearchTrigger(host, { placeholder } = {}) {
    const input = host == null ? void 0 : host.querySelector("input");
    if (!host || !input || host.dataset.searchBound === "1") return;
    host.dataset.searchBound = "1";
    input.readOnly = true;
    if (placeholder) input.placeholder = placeholder;
    host.addEventListener("mousedown", (e) => {
      e.preventDefault();
      openSearchPopup();
    });
  }
  let listNavOpen = (() => {
    try {
      return localStorage.getItem(LIST_NAV_KEY) === "1";
    } catch {
      return false;
    }
  })();
  function applyListNavDom() {
    const panel = document.querySelector(".im-list-panel");
    const nav = document.querySelector(".im-list-nav");
    const btn = document.querySelector(".im-list-nav-toggle");
    if (panel) panel.classList.toggle("im-list-nav-open", listNavOpen);
    if (nav) nav.classList.toggle("open", listNavOpen);
    if (btn) {
      btn.setAttribute("aria-expanded", listNavOpen ? "true" : "false");
      btn.title = listNavOpen ? "收起筛选" : "筛选";
      btn.classList.toggle("is-on", listNavOpen);
      if (!btn.dataset.iconFixed) {
        btn.dataset.iconFixed = "1";
        btn.innerHTML = ICONS.filter;
      }
    }
    if (listNavOpen) syncListNav();
  }
  function setListNavOpen(open) {
    listNavOpen = !!open;
    try {
      localStorage.setItem(LIST_NAV_KEY, listNavOpen ? "1" : "0");
    } catch {
    }
    applyListNavDom();
  }
  function collectListNavItems() {
    const native = document.querySelector("#navigation-bar");
    if (native) {
      const items = [...native.querySelectorAll(":scope > li > a, li > a")].map((a) => ({
        href: a.getAttribute("href") || "#",
        label: (a.textContent || "").replace(/\s+/g, " ").trim(),
        active: a.classList.contains("active") || a.getAttribute("aria-current") === "page"
      })).filter((it) => it.label && it.href && it.href !== "#");
      const seen = /* @__PURE__ */ new Set();
      const deduped = items.filter((it) => {
        if (seen.has(it.href)) return false;
        seen.add(it.href);
        return true;
      });
      if (deduped.length) return deduped;
    }
    const path = location.pathname.replace(/\/$/, "") || "/";
    return DEFAULT_LIST_NAV.map((it) => ({
      ...it,
      active: path === it.href || it.href === "/latest" && path === "/"
    }));
  }
  const TOP_PERIODS = [
    { path: "", label: "默认" },
    { path: "/weekly", label: "本周" },
    { path: "/monthly", label: "本月" },
    { path: "/quarterly", label: "本季" },
    { path: "/yearly", label: "今年" },
    { path: "/all", label: "史上" }
  ];
  function syncListNav() {
    const nav = document.querySelector(".im-list-nav");
    if (!nav) return;
    const items = collectListNavItems();
    let html = items.map(
      (it) => `<a href="${escapeHtml(it.href)}" class="${it.active ? "active" : ""}">${escapeHtml(it.label)}</a>`
    ).join("");
    const topMatch = location.pathname.match(/^\/top(\/(weekly|monthly|quarterly|yearly|all))?/);
    if (topMatch) {
      html += `<div class="im-nav-period">` + TOP_PERIODS.map(
        (p) => `<a href="/top${p.path}" class="${(topMatch[1] || "") === p.path ? "active" : ""}">${p.label}</a>`
      ).join("") + `</div>`;
    }
    html += `<a href="/categories" class="im-nav-native-cat" data-im-native-jump="1">分类目录 · 原生视图</a>`;
    if (nav.dataset.sig === html) return;
    nav.dataset.sig = html;
    nav.innerHTML = html;
  }
  function bindListPanelClicks(panel) {
    if (!panel || panel.dataset.linkBound === "2") return;
    panel.dataset.linkBound = "2";
    panel.addEventListener("click", (e) => {
      var _a2;
      const newTopicBtn = e.target.closest(".im-new-topic-btn");
      if (newTopicBtn && panel.contains(newTopicBtn)) {
        e.preventDefault();
        e.stopPropagation();
        openNewTopicComposer();
        return;
      }
      const maskBtn = e.target.closest(".im-mask-avatar-toggle");
      if (maskBtn && panel.contains(maskBtn)) {
        e.preventDefault();
        e.stopPropagation();
        setMaskAvatar(!isMaskAvatar());
        return;
      }
      const btn = e.target.closest(".im-list-nav-toggle");
      if (btn && panel.contains(btn)) {
        e.preventDefault();
        e.stopPropagation();
        setListNavOpen(!listNavOpen);
        return;
      }
      const link = e.target.closest("a.im-conv, a.im-pin, a.im-notif-row, .im-list-nav a");
      if (!link || !panel.contains(link)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      if (link.dataset.imNativeJump != null) {
        e.preventDefault();
        e.stopPropagation();
        setViewMode("native");
        location.assign(link.getAttribute("href") || "/categories");
        return;
      }
      const href = link.getAttribute("href");
      if (!href || href === "#" || href.startsWith("javascript:")) return;
      e.preventDefault();
      e.stopPropagation();
      if (link.classList.contains("im-notif-row")) markNotificationRead(link);
      const tm = href.match(/^\/t\/(?:[\w-]+\/)?(\d+)(?:\/(\d+))?/);
      const jumped = tm && Number(tm[1]) === topicIdFromPath(location.pathname) ? (_a2 = chatHooks.jumpToPost) == null ? void 0 : _a2.call(chatHooks, Number(tm[2] || 1)) : null;
      if (jumped) {
        Promise.resolve(jumped).then((ok) => {
          if (!ok) navigateInApp(href);
        });
        return;
      }
      navigateInApp(href);
    });
  }
  function bindListSearch(panel) {
    const wrap = panel.querySelector(".im-list-search");
    if (!wrap) return;
    bindSearchTrigger(wrap);
  }
  function ensureListPanel() {
    let panel = document.querySelector(".im-list-panel");
    if (panel && (!panel.querySelector(".im-list-nav-toggle") || !panel.querySelector(".im-list-nav") || !panel.querySelector(".im-list-body"))) {
      panel.remove();
      panel = null;
    }
    if (panel) {
      if (!panel.dataset.clicksBound) {
        panel.dataset.clicksBound = "1";
        bindListPanelClicks(panel);
      }
      bindListSearch(panel);
      ensureMaskAvatarToggle(panel);
      ensureMaskTitleToggle(panel);
      applyListNavDom();
      return panel;
    }
    panel = document.createElement("div");
    panel.className = "im-list-panel";
    const searchBox = SKIN_ID === "wecom" ? `<div class="im-list-search">${ICONS.search}<input type="search" placeholder="搜索" aria-label="搜索话题"></div>` : "";
    panel.innerHTML = `
    <div class="im-list-header">
      <button type="button" class="im-chip-icon im-list-nav-toggle" title="筛选" aria-expanded="false">${ICONS.filter}</button>
      ${searchBox}
      <div class="im-list-chips">
        <button type="button" class="im-chip active" data-chip="all">消息<span class="n"></span></button>
        <button type="button" class="im-chip" data-chip="unread">未读<span class="n"></span></button>
      </div>
      <div class="im-list-actions">
        <button type="button" class="im-icon-btn im-new-topic-btn" title="发帖（原生编辑器）">${ICONS.compose}</button>
        <button type="button" class="im-icon-btn im-mask-avatar-toggle" title="伪装头像：关（点击开启）" aria-pressed="false">${ICONS.disguise}</button>
        <button type="button" class="im-icon-btn im-mask-title-toggle" title="伪装标题：关（点击开启）" aria-pressed="false">${ICONS.win}</button>
      </div>
    </div>
    <div class="im-list-pins"></div>
    <div class="im-list-nav" role="navigation" aria-label="话题筛选"></div>
    <div class="im-list-body"></div>
  `;
    document.body.appendChild(panel);
    panel.dataset.clicksBound = "1";
    bindListPanelClicks(panel);
    bindListSearch(panel);
    ensureMaskAvatarToggle(panel);
    ensureMaskTitleToggle(panel);
    panel.querySelector(".im-list-body").addEventListener("scroll", () => {
      onListBodyScroll(panel.querySelector(".im-list-body"));
    });
    applyListNavDom();
    return panel;
  }
  function topicHref(topic) {
    return `/t/${topic.slug || "topic"}/${topic.id}`;
  }
  function convAvatarHtml(topic, usersById) {
    var _a2;
    const skinAvatar = (_a2 = skinHooks.convAvatar) == null ? void 0 : _a2.call(skinHooks, topic);
    if (skinAvatar) return skinAvatar;
    if (isMaskAvatar()) {
      const d = (skinHooks.disguiseAvatar || disguiseAvatarForTopicDingtalk)(topic);
      return `<span class="im-conv-avatar${d.className ? " " + d.className : ""}" style="background:${d.bg};${d.styleExtra}">${d.html}</span>`;
    }
    if (isGroupConversation(topic)) {
      return groupAvatarHtml(topic, usersById || {});
    }
    const poster = (topic.posters || [])[0];
    const user = poster && usersById ? usersById[poster.user_id] : null;
    const displayName = userDisplayName(user, topic.last_poster_username || "?");
    if (user && user.avatar_template) {
      return `<span class="im-conv-avatar"><img src="${escapeHtml(fullAvatarUrl(user.avatar_template))}" alt="" loading="lazy"></span>`;
    }
    return `<span class="im-conv-avatar is-text-avatar is-solid" style="background:${avatarColor(displayName)}">${escapeHtml(avatarLetter(displayName))}</span>`;
  }
  function convCategoryTag(topic) {
    if (SKIN_ID === "feishu" || isHideCatTags() || !topic.category_id) return "";
    const cat = categoryById(topic.category_id);
    if (!cat) return "";
    return `<span class="im-conv-tag">${escapeHtml(cat.name)}</span>`;
  }
  function convRowHtml(topic, usersById) {
    const unread = topic.unread > 0 ? topic.unread : topic.new_posts > 0 ? topic.new_posts : 0;
    const replyCount = Math.max(0, (topic.posts_count || 1) - 1);
    const rawSummary = topic.last_poster_username ? `[${replyCount}条] ${topic.last_poster_username}` : `${topic.posts_count || 0} 回复`;
    const title = convDisplayTitle(topic);
    const summary = convDisplaySummary(topic, rawSummary);
    const tag = isMaskAvatar() ? "" : convCategoryTag(topic);
    return `
    <a class="im-conv" href="${escapeHtml(topicHref(topic))}" data-topic-id="${topic.id}" title="${escapeHtml(title)}">
      ${convAvatarHtml(topic, usersById)}
      <span class="im-conv-info">
        <span class="im-conv-top">
          <span class="im-conv-title">
            <span class="im-conv-name">${escapeHtml(title)}</span>
            ${tag}
          </span>
          <span class="im-conv-time">${escapeHtml(formatTime(topic.bumped_at || topic.last_activity_at || topic.created_at))}</span>
        </span>
        <span class="im-conv-bottom">
          <span class="im-conv-msg">${escapeHtml(summary)}</span>
          ${unread ? `<span class="im-conv-badge">${unread > 99 ? "99+" : unread}</span>` : ""}
        </span>
      </span>
    </a>`;
  }
  function isGroupConversation(topic) {
    return Math.abs(Number(topic.id) || 0) % 2 === 1;
  }
  function mulberry32(a) {
    a |= 0;
    return function() {
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function seededShuffle(arr, seed) {
    const rng = mulberry32(seed);
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function groupAvatarHtml(topic, usersById) {
    const all = Object.values(usersById || {}).filter((u) => u && u.avatar_template).map((u) => u.avatar_template);
    const seed = Math.abs(Number(topic.id) || 0);
    const n = 3;
    const tpls = seededShuffle(all, seed || 1).slice(0, n * n);
    const placeholder = surnameForTopic(topic);
    const cells = [];
    for (let i = 0; i < n * n; i++) {
      const tpl = tpls[i];
      if (tpl) {
        cells.push(`<img src="${escapeHtml(fullAvatarUrl(tpl))}" alt="" loading="lazy">`);
      } else {
        const color = MASK_GRID_BLUES[(seed + i) % MASK_GRID_BLUES.length];
        cells.push(`<span style="background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;line-height:1;">${escapeHtml(placeholder)}</span>`);
      }
    }
    return `<span class="im-conv-avatar is-group" style="grid-template-columns: repeat(${n}, 1fr); grid-template-rows: repeat(${n}, 1fr);">${cells.join("")}</span>`;
  }
  function renderListRows() {
    var _a2;
    const body = document.querySelector(".im-list-body");
    if (!body) return;
    const q = "".trim().toLowerCase();
    const topics = q ? listState.topics.filter((t) => `${t.title || ""} ${t.slug || ""}`.toLowerCase().includes(q)) : listState.topics;
    const status = q && !topics.length ? "没有匹配的话题" : listState.moreUrl ? "下拉加载更多…" : listState.topics.length ? "没有更多了" : "";
    renderTopicListRows(topics, listState.usersById, status);
    syncListChips();
    (_a2 = skinHooks.renderPins) == null ? void 0 : _a2.call(skinHooks);
  }
  const bodySigs = /* @__PURE__ */ new WeakMap();
  function renderTopicListRows(topics, usersById, statusLine) {
    const body = document.querySelector(".im-list-body");
    if (!body) return;
    const html = (topics || []).map((t) => convRowHtml(t, usersById || {})).join("") + `<div class="im-list-status">${escapeHtml(statusLine || "")}</div>`;
    if (bodySigs.get(body) !== html) {
      bodySigs.set(body, html);
      body.innerHTML = html;
    }
    syncListActive();
  }
  function syncListChips() {
    const allN = document.querySelector('.im-chip[data-chip="all"] .n');
    const unreadN = document.querySelector('.im-chip[data-chip="unread"] .n');
    if (allN) allN.textContent = listState.topics.length ? String(listState.topics.length) : "";
    if (unreadN) {
      const n = listState.topics.reduce((sum, t) => sum + (t.unread || 0) + (t.new_posts || 0), 0);
      unreadN.textContent = n > 0 ? String(n > 99 ? "99+" : n) : "";
    }
  }
  function syncListActive() {
    const currentId = topicIdFromPath(location.pathname);
    for (const row of document.querySelectorAll(".im-conv")) {
      row.classList.toggle("active", currentId != null && Number(row.dataset.topicId) === currentId);
    }
  }
  function applyListJson(data, append) {
    const topics = data.topic_list && data.topic_list.topics || [];
    const users = data.users || [];
    const usersById = append ? { ...listState.usersById || {} } : {};
    for (const u of users) usersById[u.id] = u;
    listState.usersById = usersById;
    const existing = new Set(append ? listState.topics.map((t) => t.id) : []);
    const fresh = topics.filter((t) => !existing.has(t.id));
    listState.topics = append ? listState.topics.concat(fresh) : topics;
    const more = data.topic_list && data.topic_list.more_topics_url;
    listState.moreUrl = more ? more.replace(/\.json\b/, ".json") : null;
    renderListRows();
    refreshRail();
  }
  async function loadList(apiPath, force) {
    if (!apiPath) return;
    if (!force && listState.apiPath === apiPath && listState.topics.length) {
      syncListActive();
      return;
    }
    if (listState.loading) return;
    listState.loading = true;
    listState.apiPath = apiPath;
    try {
      const data = await api(apiPath);
      applyListJson(data, false);
    } catch {
      const body = document.querySelector(".im-list-body");
      if (body) body.innerHTML = `<div class="im-list-status">列表加载失败，请点右上角刷新重试</div>`;
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
    } catch {
    } finally {
      listState.loading = false;
    }
  }
  const TTL = 3e4;
  const TABS = [
    { key: "summary", label: "总结" },
    { key: "activity", label: "活动" },
    { key: "notifications", label: "通知" },
    { key: "badges", label: "徽章" }
  ];
  const ACTION_FILTERS = [
    { key: "4", label: "话题" },
    { key: "5", label: "回复" },
    { key: "1", label: "赞" }
  ];
  const ACTION_LABEL = { 1: "点赞", 2: "被赞", 3: "投票", 4: "发话题", 5: "回复", 6: "回复", 7: "回应", 9: "私信" };
  const state = {
    username: null,
    tab: "summary",
    head: null,
    // /u/:username.json 的 user（_for 标记归属）
    summary: null,
    badges: null,
    actionFilter: "4",
    actions: /* @__PURE__ */ new Map(),
    // filter -> { items, nextOffset, loadedAt, error, loading }
    notifFilter: "all",
    notif: profileNotifCache()
  };
  function parseProfilePath(pathname) {
    const m = pathname.match(/^\/u\/([^/]+)(\/.*)?$/);
    if (!m) return null;
    const rest = m[2] || "";
    const tabMatch = rest.match(/^\/(summary|activity|notifications|badges)\b/);
    if (rest && rest !== "/" && !tabMatch) return null;
    let tab = tabMatch ? tabMatch[1] : "summary";
    if (!TABS.some((t) => t.key === tab)) tab = "summary";
    return { username: decodeURIComponent(m[1]), tab };
  }
  async function ensureHead(username) {
    var _a2;
    if (((_a2 = state.head) == null ? void 0 : _a2._for) === username) return state.head;
    try {
      const data = await api(`/u/${encodeURIComponent(username)}.json`);
      state.head = { user: data.user || {}, _for: username };
    } catch {
      state.head = { _for: username, error: true };
    }
    return state.head;
  }
  function headHtml(head) {
    if (!head || head.error) return "";
    const u = head.user || {};
    const name = u.username || state.username;
    const avatar = u.avatar_template ? `<img src="${escapeHtml(fullAvatarUrl(u.avatar_template))}" alt="">` : `<span class="is-text-avatar is-solid" style="background:${avatarColor(name)}">${escapeHtml(avatarLetter(name))}</span>`;
    const flair = u.flair_url ? `<span class="flair"${u.flair_bg_color ? ` style="background:#${escapeHtml(u.flair_bg_color)}"` : ""}><img src="${escapeHtml(u.flair_url)}" alt=""></span>` : "";
    const metrics = [
      [u.gamification_score, "点数"],
      [u.total_followers, "粉丝"],
      [u.total_following, "关注"],
      [u.accepted_answers, "解决"],
      [u.badge_count, "徽章"],
      [u.profile_view_count, "浏览"],
      [u.time_read ? fmtDuration(u.time_read) : "", "阅读"]
    ].filter(([v]) => v !== void 0 && v !== null && v !== "");
    const role = u.moderator ? "版主" : u.admin ? "管理员" : "";
    return `
    <div class="im-profile-head">
      <span class="im-profile-avatar">${avatar}${flair}</span>
      <span class="im-profile-meta">
        <span class="row1">
          <span class="name">${escapeHtml(u.name || name)}</span>
          ${u.title ? `<span class="title-badge">${escapeHtml(u.title)}</span>` : ""}
          ${u.can_follow ? `<button type="button" class="im-profile-follow${u.is_followed ? " on" : ""}" data-follow="${u.is_followed ? "0" : "1"}">${u.is_followed ? "已关注" : "+ 关注"}</button>` : ""}
        </span>
        <span class="row2">@${escapeHtml(name)}${u.trust_level ? ` · TL${u.trust_level}` : ""}${role ? ` · ${role}` : ""}${u.created_at ? ` · ${fmtMonth(u.created_at)}加入` : ""}</span>
        ${u.bio_excerpt || u.bio_cooked ? `<span class="bio">${escapeHtml(stripTags(u.bio_excerpt || u.bio_cooked))}</span>` : ""}
      </span>
    </div>
    ${metrics.length ? `<div class="im-profile-metrics">${metrics.map(([v, k]) => `<span class="m"><span class="v">${escapeHtml(String(v))}</span><span class="k">${escapeHtml(k)}</span></span>`).join("")}</div>` : ""}`;
  }
  function renderProfilePanel(username, tab) {
    const panel = document.querySelector(".im-list-panel");
    if (!panel) return;
    const reset = state.username !== username;
    state.username = username;
    state.tab = tab;
    panel.dataset.src = "profile";
    panel.dataset.railKey = "profile";
    ensureMarkRead(panel, false);
    if (reset) {
      state.head = null;
      state.summary = null;
      state.badges = null;
      state.actions.clear();
      state.notif.clear();
      state.notifFilter = "all";
      state.actionFilter = "4";
    }
    ensureProfileControls(panel);
    const chips = panel.querySelector(".im-list-chips");
    chips.dataset.src = "profile";
    chips.innerHTML = TABS.map(
      (t) => `<button type="button" class="im-chip${t.key === tab ? " active" : ""}" data-ptab="${t.key}">${t.label}</button>`
    ).join("");
    const pins = panel.querySelector(".im-list-pins");
    pins.innerHTML = headHtml(state.head);
    if (!state.head) {
      ensureHead(username).then(() => {
        if (state.username === username && panel.isConnected) pins.innerHTML = headHtml(state.head);
      });
    }
    const body = panel.querySelector(".im-list-body");
    if (tab === "activity") renderActivity(body);
    else if (tab === "notifications") renderNotifTab(panel, body);
    else if (tab === "badges") renderBadges(body);
    else renderSummary(body);
  }
  function ensureProfileControls(panel) {
    if (panel.dataset.profileBound === "1") return;
    panel.dataset.profileBound = "1";
    panel.addEventListener("click", (e) => {
      const tabChip = e.target.closest("[data-ptab]");
      if (tabChip) {
        e.preventDefault();
        navigateInApp(`/u/${encodeURIComponent(state.username)}/${tabChip.dataset.ptab === "summary" ? "summary" : tabChip.dataset.ptab}`);
        return;
      }
      const pf = e.target.closest("[data-pfilter]");
      if (pf) {
        state.actionFilter = pf.dataset.pfilter;
        renderActivity(panel.querySelector(".im-list-body"));
        return;
      }
      const nf = e.target.closest("[data-nfilter]");
      if (nf) {
        state.notifFilter = nf.dataset.nfilter;
        renderNotifTab(panel, panel.querySelector(".im-list-body"));
        return;
      }
      const fb = e.target.closest(".im-profile-follow");
      if (fb) {
        e.preventDefault();
        const follow = fb.dataset.follow === "1";
        fb.disabled = true;
        apiSend(`/u/${encodeURIComponent(state.username)}/follow`, follow ? "PUT" : "DELETE").then(() => {
          var _a2;
          if ((_a2 = state.head) == null ? void 0 : _a2.user) state.head.user.is_followed = follow;
          const pins = document.querySelector(".im-list-panel .im-list-pins");
          if (pins) pins.innerHTML = headHtml(state.head);
        }).catch(() => {
          fb.disabled = false;
        });
      }
    });
  }
  function subBarHtml(items, activeKey2, attr) {
    return `<div class="im-profile-subbar">` + items.map(
      (it) => `<button type="button" class="im-chip im-pfilter-chip${it.key === activeKey2 ? " active" : ""}" data-${attr}="${it.key}">${it.label}</button>`
    ).join("") + `</div>`;
  }
  async function ensureSummary() {
    if (state.summary && Date.now() - state.summary.loadedAt < TTL) return;
    try {
      const data = await api(`/u/${encodeURIComponent(state.username)}/summary.json`);
      state.summary = { data, loadedAt: Date.now(), error: null };
    } catch (err) {
      state.summary = { data: null, loadedAt: Date.now(), error: (err == null ? void 0 : err.message) || "网络异常" };
    }
  }
  function statChip(v, k) {
    return `<span class="im-stat-chip"><span class="v">${escapeHtml(String(v ?? 0))}</span><span class="k">${escapeHtml(k)}</span></span>`;
  }
  function topicRowHtml(t) {
    const href = `/t/${t.slug || "-"}/${t.id}`;
    return `
    <a class="im-prow" href="${escapeHtml(href)}">
      <span class="im-prow-main">
        <span class="t">${escapeHtml(t.title || t.fancy_title || "话题")}</span>
        <span class="s">${escapeHtml(`${t.posts_count || 0} 回复 · ${formatTime(t.created_at || t.bumped_at)}`)}</span>
      </span>
    </a>`;
  }
  function renderSummary(body) {
    var _a2, _b2;
    const cached = state.summary;
    if (!cached) {
      body.innerHTML = `<div class="im-list-status">加载中…</div>`;
      ensureSummary().then(() => {
        if (state.tab === "summary") renderSummary(document.querySelector(".im-list-panel .im-list-body") || body);
      });
      return;
    }
    if (cached.error) {
      body.innerHTML = `<div class="im-list-status">总结加载失败（${escapeHtml(cached.error)}）</div>`;
      return;
    }
    const s = ((_a2 = cached.data) == null ? void 0 : _a2.user_summary) || {};
    const topics = ((_b2 = cached.data) == null ? void 0 : _b2.top_topics) || [];
    body.innerHTML = `
    <div class="im-profile-stats">
      ${statChip(s.post_count, "发帖")}${statChip(s.topic_count, "话题")}${statChip(s.likes_received, "获赞")}${statChip(s.days_visited, "访问天数")}
    </div>
    <div class="im-profile-section-title">热门话题</div>
    ${topics.map(topicRowHtml).join("") || `<div class="im-list-status">暂无热门话题</div>`}`;
  }
  function actionRowHtml(a) {
    const href = a.topic_id ? `/t/${a.slug || "-"}/${a.topic_id}/${a.post_number || 1}` : "";
    const name = a.username || "";
    const avatar = a.avatar_template ? `<img src="${escapeHtml(fullAvatarUrl(a.avatar_template))}" alt="" loading="lazy">` : `<span class="is-text-avatar is-solid" style="background:${avatarColor(name)}">${escapeHtml(avatarLetter(name))}</span>`;
    return `
    <a class="im-prow im-prow-av" ${href ? `href="${escapeHtml(href)}"` : ""}>
      <span class="im-prow-avatar">${avatar}</span>
      <span class="im-prow-main">
        <span class="t">${escapeHtml(a.title || "动态")}</span>
        <span class="s">${escapeHtml(`${name} · ${ACTION_LABEL[a.action_type] || "动态"} · ${formatTime(a.created_at)}`)}</span>
      </span>
    </a>`;
  }
  function paintActions(body, filter) {
    const cached = state.actions.get(filter);
    const items = (cached == null ? void 0 : cached.items) || [];
    body.innerHTML = subBarHtml(ACTION_FILTERS, filter, "pfilter") + ((cached == null ? void 0 : cached.error) ? `<div class="im-list-status">活动加载失败（${escapeHtml(cached.error)}）</div>` : items.length ? items.map(actionRowHtml).join("") : `<div class="im-list-status">${(cached == null ? void 0 : cached.loading) ? "加载中…" : "暂无动态"}</div>`);
  }
  async function loadActions(filter) {
    const cached = state.actions.get(filter) || { items: [], nextOffset: 0 };
    if (cached.loading) return;
    cached.loading = true;
    try {
      const data = await api(
        `/user_actions.json?username=${encodeURIComponent(state.username)}&filter=${filter}&offset=${cached.nextOffset}`
      );
      const items = data.user_actions || [];
      const known = new Set(cached.items.map((a) => `${a.action_type}:${a.topic_id}:${a.post_number}`));
      cached.items = cached.items.concat(items.filter((a) => !known.has(`${a.action_type}:${a.topic_id}:${a.post_number}`)));
      cached.nextOffset = cached.items.length;
      cached.loadedAt = Date.now();
      cached.error = null;
    } catch (err) {
      cached.error = (err == null ? void 0 : err.message) || "网络异常";
      cached.loadedAt = Date.now();
    } finally {
      cached.loading = false;
      state.actions.set(filter, cached);
      if (state.tab === "activity" && state.actionFilter === filter) {
        const body = document.querySelector(".im-list-panel .im-list-body");
        if (body) paintActions(body, filter);
      }
    }
  }
  function renderActivity(body) {
    const filter = state.actionFilter;
    const cached = state.actions.get(filter);
    if (cached && Date.now() - (cached.loadedAt || 0) < TTL) {
      paintActions(body, filter);
      return;
    }
    body.innerHTML = subBarHtml(ACTION_FILTERS, filter, "pfilter") + `<div class="im-list-status">加载中…</div>`;
    loadActions(filter);
  }
  function renderNotifTab(panel, body) {
    ensureMarkRead(panel, true);
    const filter = state.notifFilter;
    const cached = state.notif.get(filter);
    const items = (cached == null ? void 0 : cached.items) || [];
    body.innerHTML = subBarHtml(FILTERS, filter, "nfilter") + ((cached == null ? void 0 : cached.error) ? `<div class="im-list-status">通知加载失败（${escapeHtml(cached.error)}）</div>` : notifRowsHtml(items) || `<div class="im-list-status">${cached ? "暂无通知" : "加载中…"}</div>`);
    if (!cached) loadProfileNotifs(filter);
  }
  async function loadProfileNotifs(filter) {
    const cached = state.notif.get(filter) || { items: [], moreUrl: null };
    if (cached.loading) return;
    cached.loading = true;
    try {
      const { rows, moreUrl } = await fetchNotifRows(filter);
      cached.items = rows;
      cached.moreUrl = moreUrl;
      cached.loadedAt = Date.now();
      cached.error = null;
    } catch (err) {
      cached.error = (err == null ? void 0 : err.message) || "网络异常";
    } finally {
      cached.loading = false;
      state.notif.set(filter, cached);
      if (state.tab === "notifications") {
        const panel = document.querySelector(".im-list-panel");
        const body = panel == null ? void 0 : panel.querySelector(".im-list-body");
        if (body) renderNotifTab(panel, body);
      }
    }
  }
  const BADGE_TYPE_META = {
    1: { label: "金牌", color: "#E8A33D" },
    2: { label: "银牌", color: "#9AA4B2" },
    3: { label: "铜牌", color: "#C88A5A" },
    4: { label: "", color: "#8F959E" }
  };
  async function ensureBadges() {
    if (state.badges && Date.now() - state.badges.loadedAt < TTL) return;
    try {
      const data = await api(`/user_badges.json?username=${encodeURIComponent(state.username)}&grouped=true`);
      const byId = new Map((data.badges || []).map((b) => [b.id, b]));
      const rows = (data.user_badges || []).map((ub) => ({ ub, b: byId.get(ub.badge_id) })).filter((x) => x.b).sort(
        (x, y) => (x.b.badge_type_id || 4) - (y.b.badge_type_id || 4) || String(y.ub.granted_at || "").localeCompare(String(x.ub.granted_at || ""))
      );
      state.badges = { rows, loadedAt: Date.now(), error: null };
    } catch (err) {
      state.badges = { rows: [], loadedAt: Date.now(), error: (err == null ? void 0 : err.message) || "网络异常" };
    }
  }
  function badgeRowHtml({ ub, b }) {
    const meta = BADGE_TYPE_META[b.badge_type_id] || BADGE_TYPE_META[4];
    const icon = b.image_url ? `<img class="bicon" src="${escapeHtml(b.image_url)}" alt="" loading="lazy">` : `<span class="medal" style="color:${meta.color}">★</span>`;
    const count = Number(ub.count || 1) > 1 ? ` ×${ub.count}` : "";
    const href = `/u/${encodeURIComponent(state.username)}/badges/${b.id}`;
    const desc = stripTags(b.description || "");
    return `
    <a class="im-prow im-prow-av im-badge-row" href="${escapeHtml(href)}" title="${escapeHtml(`授予于 ${formatTime(ub.granted_at)}`)}">
      <span class="im-prow-avatar">${icon}</span>
      <span class="im-prow-main">
        <span class="t">${escapeHtml(b.name || "徽章")}${count}</span>
        <span class="s">${escapeHtml([desc.slice(0, 60), meta.label, formatTime(ub.granted_at)].filter(Boolean).join(" · "))}</span>
      </span>
    </a>`;
  }
  function renderBadges(body) {
    const cached = state.badges;
    if (!cached) {
      body.innerHTML = `<div class="im-list-status">加载中…</div>`;
      ensureBadges().then(() => {
        if (state.tab === "badges") renderBadges(document.querySelector(".im-list-panel .im-list-body") || body);
      });
      return;
    }
    body.innerHTML = cached.error ? `<div class="im-list-status">徽章加载失败（${escapeHtml(cached.error)}）</div>` : cached.rows.map(badgeRowHtml).join("") || `<div class="im-list-status">暂无徽章</div>`;
  }
  const PIN_AVATARS = [
    "data:image/png;base64,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",
    "data:image/png;base64,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",
    "data:image/png;base64,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",
    "data:image/png;base64,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",
    "data:image/png;base64,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"
  ];
  const CHAT_ICONS = [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATfSURBVHgB7VrdbhtFFP42dvMnkhiFpiL8ZKMiICYVMeUCuMG+aROERCKuuIp5gjhPkDUvEOcJ4jwBuYtoL2yJi16U1BYJhLRCcQgtImpFhNXWdmMPZ+x1ZO/Orne9sxZIfDfezM/ufDNnZr5zToD/OBT4hLkECwXphz+fA/l8SjmDD5BOgAY+FwDW6TFqqEpXgSQRKUAipBHgM94HrNELEzbNCoyI3EspSUiCFALXV9kKGDR6DDnsUqAva7vryhY8whOBDxMsSjO6SY8qusM2mdWqF7MKoguQuahk55vMbOdusRhoTOIiuoQrArqdr9AXNcjDGDygz2lDbuc0W0eSB2/G3k4Uv9z+wmnzjiug2/kabdIoeoEA4qjVlvHTrTQq1SQiCwW75pYEuJ1XhyrrT4eLi8/HiwhUghh6MoKB4hB6AoXFMdAXx8FtDaXzLSsiQgLq+uncH1ceZB7PnISqA+dtdcNEYmJvCmPHEwiWuzoD3IHVtDqR3E5MRMI8gtyOeoK9DA1ceKY/o9UoRPfRTysx8uhlvHrvai9WRSUSGeS+jSCy1CZJzJv4Up9mNfhWVEae48k7j7D/1feF8mg5wfjl5C/UyR9nTbe8mYCiODsBGIkzVksifHN6/5vBDZIH00Tiaz+JvBh+8amxrJ3AwY5Km6ezHKixDVSeTuO9Ba21mEik/SQSLPWrxjLH90ADLItqLYbZ+YTRFlvBidSAGN0Z0kQbx0uno6YypwQKQHUJ4fkYri1kWyv47SzqwPXNDylFI60zTX96Fm39xUGMnlw2ldsTaNp5+VkE4c+2jdXXE4xrmdwHCaZZvYIT2U0pca9Exu+/Jiy3PsgVloZCg58xn70Xt7MLMacrzjiRzaLhN6hO+44fTmJy96qwrp1AafAMA5VtsvMNo6lwNJ0WZu+02ILvD/pJE5E4GkRsMbH3Jt64865lfTuBSIxvzCVRQ/pg09ty6rTYghOZa6yGEAG65fkleYVufTs4FXNenBZLWDkyfMO+dStS116dYCvmJDktrqBm3h8L/Xa5vgJOYGrl0DlvA7Wdgkc0JwwP3E1Y0PCSEHdaIMnOncLL/jKuQAg9HLyM/dUDQW+GjOO4iZ4T6CKGZIueEfDLt5ZFQLWqkGkuIvi6ArJvbxGkEGCCAZJS5cexCp/RJqf1q911HF8RECBSSR+8soKxoE/wYc/OB0fTvdS9MjnJDQVpY5GJALmCqS4+qOLn7454SMZYoXtlEXicGL6aonC8iQA3IyqMuV1+El88dnNEIcFNI5FWr6wbs+J9uI8tqhO6lHdTSl7v4HjWApVLjYdGSDBHIcE1YxtOxE3UgtqccROksUSspHfHBMeFSuwgq3+9kceZemosrmdiMHNzS/BengRM6K6pCGk9+WFrzo4zNC0uoCqqP/n4EKfXjq26b6NcWxXFNvUJ0uhxWS/K8lmnvZOFA7hOMZEk0GjWVmA4Ov+cPcbvnxzad2aKZci8LjUUTLnNm3WVIxPMWj3oe/DlHSfdLc2qG3hK8nEidApkmmZ1//O7KE7+5bC3kkf4RgQe4TK02A7jqfI6hT8c+rJ5VKurkACpiW5+qjx+++Ea39DGxEgdPNLHg2Xh+RQkwY9/NVBLr/ytPfzocPnCnPjAUaWIdillFxT+14GnqkTy4n+04B+I8OzOFbfhrAAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJiSURBVHgB7Zi/btNAHMe/l1S0RUXyI/gBQApvQBYGJgYYGJCcB6B1noCyMDthY3HCwoIEExJTi8SGBJVgYoo6ILFFQEMikhy/ny9J7Sa2z46NUuk+S07n+/30+eX++BLAYDAYDAaDwXBpESgZ6e7Y9GELb3iMHEjXsoAzm9vC+3ty8XlpBcj93QMIcUhNa9bVh4Qn2oMnWvEsLkc+Kd4NdffIuCm8wZt5RykFyP2rjynzYczjjmgNGonxPGtSHJGevXqAcET7rMvNwgtIkZ8TW0Sq/GKgKqLQAjTl5ywVoS2/CBBOBQWRUZ65NdvgKj6rPFOR9UJmIIc8bcZpnU6mXhCfR16gS5vZiRQgX7sWxtMDSOnQAD49Tugk6Yh77S42UF41z+VtjCeUCPZyRMUT91tNbJh8YIZUeWbqylePfKwjv30NuH67VaR80JUuH0lAy+lZI5f8jTvAzh7lEA4+PH9fhDyzRfL8zdrQQcKRT2s1/PhWgy5heebPzw6qu32MR5Z2jhh5poJxtUFiPehw+hlryQ9/AV/eoih59ZiQL2kZVWkZiYSZYPnTT9AmTn70Wz9HirwaMiOxiA2VZxZvYvHA62FSrS8tp6zyW1f6/0ueiVwllorIKs/n/GR4E9t76o5TsrwavoJgOX3/eEQF2NAn+pJ68dDB13d+mfIqJIaML5qIfCiHA1nxoUMOeRWWgGYRK+VDOdKLyCmvQlNIKSJRPpQjvog15JnU3wOBnJC8sS/cSOWxjvwsR4fHgm+35/Qpb3Md+cxI37V4RtQ/BTlzUGz4h4zBYDAYDAaDIT//ACBTYGoECbndAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAAAXNSR0IArs4c6QAABF9JREFUaIHtml1sFFUYhp/Z2e3PdrsttkW60lqIbROSIqbSaEshEYUY/ItB64WJ8e/CaIzGCxL1wkRvgEQjkQSl0RhjvMEEIVpStEZBAqJe1JZgikqo0rVSWku7pd3ujBcTXIY5s8yc7lnZpk8ySc/7fd19387MmTMz1SYTUybzmMD/bUA1CwHznaDXRs2YIJD4GbSUSj/eMXWMcBNmIJKx7aoB9fFuQvHtBBI/Zc1bNjHCzSRjr5CKrBPWtUyzaOhcJ6E/tigzl02SS7eRrHzSobsG1CcPUTjwgHJj2eRifRdGSYtNc51kgvEdyg1lm+DwTofmGlC/0KPUjAqCAs/CgIHp35SbUYKRQJsZtEniPTg7kgs7StBmh21j4WVCHzwGP5TkxFC20cPfYzQ0/zcWXwcnR2A0lCtP2WXyvG3oMsnk8w2GYRsJA2poObGiAs207xxhQPOKv0I+caX3eX83sRAw3/F8P+ggEII7tsCKTRBZDH8PwLdvwi/d4v6ypXD361Cz2hoPHoeuV+GfP8X9jRth7YtQVQ8Tw9C/H77eDkbSl035gPdshVUd6XF1E3R8AB91wO+H7b2FpfDU51BSmdYaNli/885aSCbs/cvWQMf76XF5LbQ9C+EK2P+SL5tyh6heYA93Oasfd2r16+3hLlFaDY0bnHrLE+LPvuUR0PxZlgsYWexeiy4RaLEM/YJatNpffwbkAk4Mu9fG4wLtbIZ+QW18yF9/BuQCpmbg5AFx7cQ+p/brN87zDCxt4Cun3i/4DICTXWD6W4TITzJfvAwXx6Cu1Tpkz52C3j3Q95mzd2oUPnkM1jwPsSYwTTjbC4d3wPQFZ3/fXohUwcrNUHmTdcScPgI923zblA848Rfs8zGjnT5ibV45utva5si8v9AvBMx35h4wGoPYKijI/Ajd+rYgVDVaW0D+9PeD/LdEY/BwJ8RuTmtHd0P3a+L+hrvg/regeJE1nhqFvS/AwJfSFrwgvwcf3GkPB3Db09AiWKqV18LmXelwYP380LtQdoO0BS/IBQyFobZFXKu/06kta4NgkVMPFsHydikLXpELWFzuXisqc2qFpe79hVEpC16RCzg+BKlpcW1E8FRcpHmpZQHJc9CE4x+KS8c6ndqpHvEieeyMVVOI/Cx68A2I90Pd7ZetRT+FeJ+z1zTgvY3Q/ChUr7TGQ73w48e+F89+kQ9opqzFde8eb/2J83Ao96/kxA9+c3QRVoGm2b2LH/wqPmxUYmr2p/LiScbnc49rCk23DcVJQuFcWFFDyL4mFh+ixdfnxIsKjLDduzCgEV2eEzMqMEvt3sUBq1pBz8N3hEEwKpptkutsYtSoXeWrwLixzqG5Bky2u9zXXcPMrNvq0FwDppasJ9W2SamhbJJqvw+j4laHnvF/1QBCJ94m+N0utLEZZebmgrmoiNnWZ0iueE5Yv2rASwSm4+hnDoDp7/WVMgIFJGvuhcLrMrZ5Dpiv5PGazBsLAfOdfwERgySziOtzQQAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHnSURBVHgB7ZaxS0JBHMe/zxRFIV0KAkuhoCgyaQsS8j+o3aWpoaWpoeYcWmpIqK2hoKYaGtoqjNaMoKlIUVIQIgPBUN911+PhO5XePXs9h/qAenf+5Pfxd787Bf46knZCbjwr9HkL5pGCJG2jUr+SopV0uwAbPyVhmEsYhOzDabsg146wgMCvEYTN0VbCKgGGj0qcoIsCjCBJuubQRQHa9j3z6KpAD/Fqp3ahD82UIcxHBigeAtkNoXAxAZVKRj/GFQD8a/RE03FOX0JcgH2z23H9uN4IMHEODCwLCZjfA+9J5dXuFQo3tgUq7hDgmWzM6yWgfK9UySCdCYwdAc4Av1Y8AB6XlPHzatOvjNkCLwlagRC/lk80xoUEROlMQC8Ba0AmmKaVqJW+DTW/CQfpEQxuAn0xeun4dMN/JsCa0R3ik/vXlXE2LtSUnW2BysguLfUU8ESbzznEJ8+ZeROyfWTlZJ2v/VavZ4rA8F5jzUByhtgW5HeUi2X6QXmMHivruTh/5xtMzhCrAEvE6I+1nn/2HqsQO/d58eNnTEBNpIo0UzCeWIXfAll6g8XwAqR+CovhBKRI5ZJapGEhradAri3QPxOWbUWLgDRbTYFUo1ZVou098CUhkShkeZFWIwUzIeQO/2j4BI7JiFs+USz6AAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATdSURBVHgB1ZpNbBNHFMffzNohURNkcis9dJFob21MXDVH3CNSkKA3xIFWaqEHCEGt1GPMnVbgcGihUt1Dm1upRNQcax9p69jALVSqkWhzo1YTFPB6d3hvnNmsvev1ftjB/kmRvbO72ffe/N/smxkz6APpxf9S3NROMcbSIPibAkSagUgBsJS6RgDUGP4BE/exvWI2jFL1m0M1iAmDiEijrbHLTIgsHmYhAoJBFQ24HseZ0A7sGW4tOiPcBwqmYVwN60goB2YXni0NwPA2BGO59fxrV4NeH8gBjLqesJJ3hIA07A817I0PgvQG73VBZmHnnGYmKvtoPKFryWQlc/H/U70u9HWAJAPCLAxSMj6kgPE70gYfukqopXeRgyHALy88HZBdh97DMMG0j8r5iR9czZ0NlLCk+VckGz/qmNjHOhPblQOamfxtCI0nUnws6VJFmwO7CaPDkMJwJJy9uJVra1NfWtJJ/g3DT93UjCPV64fqdGD3gNbUcjAapHgzsagOZA/Ejf7UBIOls2OQfTchj+/ea8LXPzdga0fAgLB7QfYAlsJZiMHnH+4ZT5ycS0iHBojdCy0JCX4ZInJ4msH8XMLVnnlLg0GCc4/j9MlJPoxFr3POn/CONMlqwGRlaR9HPt2iT1AeOJ2g7+dPJOHbS+NSYv2AZoEJLDTSUedl8z6G3F5ryNz4ajeZf/pyAl6fbj1IyYucjAXazlFLMxCRk3NJz3ZlGDl4JpuAzFFuG684/k78HEHp6xRCHSJAxnUapVhFB1RuzKOTmaNuY7d29r7TCDb/vgblv0xYKYbpFTYT2YELXZK3/MiEzaeWLRPKk8PTbgdIYtQzm08FXPvkgGwjRzaeCOlIQFKRsqlX9GfR+G7nCSWxa5+OQ+lBu7FTExCGVM8ppRdT497G/YvRvPt7s2vvKFaKDSkxGpmcAwHdX3wYOPoSupuKolDl80rJgI1/LDkcOg24/WtDysAv+iSx7R3vEWw1wqgU2oEz2SS8/QbHhxmQ+/EF3FprRZOMpuj3eoHdWjO6vvzof4akhg6IKmazHvweISNPfxTNVTSaHFHQmE/tXqUESYR6ziv6lBd0PhQCahyXSx6Huaf8yLK/k5FLZw/Yo4ii+NBbCiQxcpCccJ3DngwLrsHe5zjNqYa5iR7uLJOLD1qls5PVe6arlFYJru5xEin6COOswi3N/AVCsvHEkjK5kH8OX3z3wvVwMp7Obe6207Wf5ffeXPSyUk7QuSjRJ2hRWGZc5tI2TuSjrTC/Kmhlez0/eUy+B4QQJRgxaFmePqUDVqJJB3UYIUg+9CkdoLkl9sINGB0KaoHLLiVGqRdoI0R9tx0YlV7ABee2XRzXe392YbvC9ncvIDC0Ubi+PHnE2eaqRi1unIYhlBK+desW7tp0trscQCnVBFhXYMhA6XzsteXkOR9YXz5YIK3BkEC2lG8e9KwYfGvf93AlGHdHfLd4Bg0Z/+fNqVzX89CD3d2a7yHkpCcupHkN2JU/licLftcF3mbluPHB9mnvgOocq2GcDrLNGmpJa9CSoqhzATf8JNNJlJ8a6HIvgfFz0CeU4U2sBtTGRVDi/NhDl+uquLIdeXEYFyEYiFIUwxV9WUJWzsif21hsBjWsO/OFIoyPqjPBqsCtx1iyVGkiFdVoJy8BXGo4WsdBinMAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAARGSURBVHgBzZnLbtNAFIb/SQOJWpCCeIGwY4fLRYIVqcQKFoQlu/IEhCdoKrFveALgCQAhLhJIzQ4kLgkgQVkgTAsCRIVCL6HpxcM5Tp26qWPPjCcSn+TWssf2+c+cOefYERgypyuyuAE4Amjx9qImmrCIwJA4UZFl+neVtlLfKZeeWn01I27DAkMRcLwiZ+jGlbgxEmh6wESzJlpIQQaWIeOnkoxnaIwzAtxBSqzOgEPxTkZ91rpIYDJNOFmdATK+Cl0kJpECqwIoro9BnxLNXAGGWBXAcQ0z/g8BhGlGMc5EtgVoFykKOzdNKs3CImTMPbG3cMVC4+vKg988vgrpUYGULuT6NMYvuVZn4HVN1NijquN57BYwrTT4zcMZMr4G30FiEiJ3kw9bnQGGqyt5ZZY8W0waS2OuUfi4sYMadwq+sRLlvjMl/mO9ErNBLCJuJrY9P/6qJu7G3qzxqAixf5b2yhFn6/xnaM0cc7IiS7L78KA+uLTdSzScaTxwIAS3GsXI81TBcez87dQCuF0mbxastsndxVrF4PrQguwcoUXc0hZwqiIdT+AsxQEXrXLoIZwRLqUSwvGeyU3RvROaQXkLzoUrvBcrgEs8rXJHCgqB7iJyEF81WzQbR4zyelLIhOl63+XdbKTBO3HL+wVedYoUMt1rb0GH5JAJUw+MZ3oCgpcQdVsHot4P+VlGUor0SsrXiN3O8QWovoQocjZxhB/refK6rEIPlzNP+EBQB8qwBHekse1x436JClPDwHguIDf6D2W3H2rczkaR7YZRfddB3/CRKWj2Srvp7Kkf/gxwEwaLeOF1wHHefDhLxnNFLcEYSp2hxRuQ3X5gjZRcVOlfVPA70sb9JhlNn1WknfDk7jP6WV34hVy1CYtjq7WEzuICPlyfhz12Clc/vWZOpQkbePvNTWx8+Yq/z16i8+498H0Z+xYt9okDvM/sekogwltedtmoOLy1Dja//cDa2/e+4RvzXxG+ZvSjrU49OvYDIluJo86zoshQOB0YLYpsFiKf653zVlYpGawjSeDvcx38vNxGakJtQxSR8zzXPONKj8Jppe16f5aw9fNXb5Or7UTjmfzCCNIT731mYKAGIijHujAgZ0NATOwHxK60NCJG2iKliGTvM4mpIo2IsTnjhdxS8T6jlOtMRRjPgJQ3VLzPKCdrExFjH/fBABfjF6qqg7Wqja4ILmaZtuZbq9D7wq1dLnVFaK6DPf1+Ekb1XkdEfkFDgOxMQBPjhkVVxOinHNRQS5v9pOq4VETk1H5wclXTZj+pW8YkEVzQEjtTXrgG3mes9LxJIhI607ruwg1jrWmPE5GfjxEgO1eQAqtfpweJGBs0A1JOm4ZOgPXP61EiuKWIKGhaFXcQ1gUwUSIOP8mHh7RMcn4UQxHA9ESg+1vAoac5HHzt90Z1Cp2JtKETMNQfOAL4FZU+4PDmzj0/48Ii/wCI4f2ufZuHfAAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAQMSURBVHgB7ZhNbBNHFMf/s+vabZo02xKJSlWFK6RKVRLJKe2lQqpdVa3SS8mpR5pDK3Fic+QUhwsXpJgDBz4EOXA3iEMEF5uPAxIfjkS4cMkeIAQJSxtihSTYO7y3sS1iYrO7MyFC8k9ara2d3Xn/N+/Nvn1Aly5duuwmItCoUt5C7NMUdCFMF0N/zEEDwQTMX0/BkHn6lYQ+HKx7GYyMOlDACDSKvSVoMsgi9JFEwshDkWAr8DaPZrMQxiR0ITGFwT+ziEh4AYxuEZ4YiZoTwUKolcHRLDxvHLowMI2IRFuBBg9n0zDMPIS0oEqNcmx4tIiQRFuBBjyhRAZSuFDFNCOFpJoAhmNX1iagjEz723VI1AUwQ6Mz8DSIEPIQQqJHADP0Vw7Sm4IKAocRkmYSH7DloRowN5cTDlSYvzZDbgltiG/Mqof+E0u2sfQ6ZQikJG8OUiTpkkuGOpLOEvKGB6Po3v6v6N/TuPlHW2bpz2ESkVESUSpYSGyUEKLsMMpV9Mwuu/F7qxaLCISEU6vVMq0hlDSBQsqWSURlJOP6ZUfAnemzq8v48thTJG5WghvPCFxx7xxxtssBdRE/UIEmqx3zgb1uHX+Gnqvhd2BJ3i/f/t/2n9NmDIso/WTT1hYVTuo2xR8b33/yOcwnG4iCR6HTfFaHcRYlTYFyI3rNI+R4ayg1jOdzJCRmOHSaz3vfeErsLK1EtFqlJZSUjScocbeEZqD3AK2ETdvsQqS88EMJjg7jW73PhHmRcV4sUEjZCEn81sqEsvF41/tM6DcxhdQ0hVQp6GpYv5xO9V0qT6sav533mUilBIVUqr4ak52EfHXw7FHT+KRQf5sqsZ33GaVaiBOc3xkHJuSW0sFKX7T2HDyTp+sc/+rfCm28z8SgTpInoCSnz0xkF+6eT4rqa8oToW44uAOTcKvrq21fijoENPCFfDv8D9zFB1hbWUR1owIVDDOOvft/PzV/4Run3RidAjYfmOjDwHe/+r8rLx6jUn5MYp4hLLF4Lwb2/zY3f+7rbMdx2EF6B773j+r6ii8iiBj2+hd7h+kYdKSZGHvfHDsqoDkJrUovHyTGq65jrbKEtZeL2HhV9q+z0bF4H+Kf70FP/z6IWMKlunQsSFn/QQS8jRFLoMfa5x8dGCfjA/WJ9H1SaoC/uOg0dj8nLge954OvQDvIeKceNqE6dM0VoJtnsOmB3aDobX7Khm4vbunMcVlAigpCbxu9LRwyNN/UvZzIISLbthapxvmXTpM7JaRu+Ckq73LkdaVV79gbZSHcqaCfaWhAp+ENAjV3ObRMgb/JAu6cpRECTk6a5AodlylUitBMpO70z7ZMUdIluayuP6SxqS/Xt0JudzjVzUbZbm0MXbp0+Rh4A1fpjlaw3V0EAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAPmSURBVHgB7ZnNUtNQFMfPuWlxITBldOUquvBrVFLQjRvbnTvZuxB2jiNfTwA8AaCM447yBOITtK75qiMzLonjDDM6w1C+p7Q3x3NTCqVN26SENoz9bZrce5P8T3LOyTkpQJs2/zcIPvH0/V6MAHoBBf+SgUARPn2kMEsZQjSR0ASyUnzR78tzXSnwgQsZYIxtR4TVMYpkjZ2JdY3JRiWs4+OF9OceExqkIQMuKLwCNmTSEsez6ZmeDHjEswG2qyDO86YO/sIuRkNeXUt4Wdw3cjDB4pPgv3iFrs6truHlINdPQJ2Y79AkNAHlUqsfrk+5WevKgGaKL+LWiLoG9I8cjnLqm4EWwGl5fPVjZ81r1zSAs42uydCaH5mmQTIyl4vWSrM1g1iTHdMtFK+IaOHwfK0FVQ3oG94d5Ic4AK0nplJ3tcnqT4DEKAQEDmg7tfa/3x0w3m7rpXOOMWC82zY0LbwGAYKzYJwQ+Kai8ooUx8aQig3HJ6AJbQwChgUwICROcWYyeTfGsbGhnoijAQSiFwIGIr5a+tSZ5vpr/GxQTFe4kCrUNBnehgAitVwPp/X5EzeyCZUvCuVDBvnWJfiLsMKqDjNOBwhSFS5kIekQUJBKxDMynxuqjAFCHa4AnJWmqmahoKPEc98wqbZDcIXgXjujAY4vzXUlimPnDFAZCCSZPvb6/nFrDyC6ObX0sj9ROnxqgN0J5WgH0TIDpf9aHuD5b4D7WyCE2Ciftg0oNiyENCtDMqHJAISGEv7kL8DjP7wtC2M5uVO+TDx7t28Uuy2WnTn5MmBCq1DCn20CvP7BXxA2z8Qzy4/jqfLlIUuD6dM9IewCjoi+8qu7udWo8vHbXADc2zonuoSU06ByoVhxh4Uv9g8fLJ7swaWj7vZdFnwnUzCgBqztm9O4MsCEc59JLrmJ8SC6FEtAwmk8BKq6Q/EFLgsl+MZRwT1uHnkSXUIq/SBuOk3YCdNu3vPce+KZOzVMV5ZF7rPYg4LgG4fVfNo9iIMrD14sOE6V7ihDhNRiHMAGV3W9HAUR7M4aFUd1sKDu48KvEtydLYjtzF5cbBmsIb36MBatNl//u9B6MgEC30CLkEi3q7mPou4bS+ZgjFr0XrArzhri7TXgAuNnUheESbycj7rOWDS78ihetzd3XfU01whaWHkYH3Sz0lPZ1hwj3ItXeKralD9aWYqqi4DPEEGG/1cb9yJe0XDh3LeeHOTsNOHT00hxthmqF7BOXLjyV4ZgIc3GvBxn33GiBW7UF52qTLf41rrY8SEhxsa8YnE6D+mIECmK5Suxi0Cas8svJTqfh3Q6Gvf8p16bNm3O8w/QYYm8d9oDggAAAABJRU5ErkJggg==",
    "data:image/png;base64,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",
    "data:image/png;base64,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",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAAAXNSR0IArs4c6QAAA3JJREFUaIHt2ttP01AAx/Hv6WAUEO+iiaBGEx8U0D/ByG2IQyX+Bz4ZCQ8a/wojJgajL/4V8qBPJhoTMWICJt6dTLzFYNDo3I21PpTKxrpLu9OtJfs9rqc759PTnp6eVsT+xnXWcZRaN8Dt1IF+Tx3o99SBXsvCZ3vlG9xphvx8iMKt2xpLv2D7Njh/TqFzd+n9hB9u9JF5nWs3dJKp1d/UJrg8LujsEEX39fwpaoUDSCThynWd+Wjx/vE0sBDOTCIJVyeLIz0LLIUzk0wZyPcfrJGeBJaLM5NMwcQNa6TngHZxZtJpA/n6bS7SU0CnODPpNNy8rZNKrSI9A4xEqQhn5m8cpmdWbx1FgUufBV9fCrRMZZWWSmRe59qkVjEOQAg4eGC1BwvOZD7NKkSeGEfi+3udrkGNQGPlDVgbWT1nZnREsLO9RA9Gn4n/OIBfXwVzUwEyaTmNMCOz5wDOhAWDx3NnNnnAyLQgOpPv/r0Ic1MBliU1ptIBZW3OhAVDffnTthxJZFrwaa7wZfl7EWYlIKuFgyzgu0dKUZyZ2A8DmU46a0w1cbACfPdI4cuL4rPy7MR+wNwd+8joQnVxAMqbh/ZwZmJLK8h4eeWjCzoTk9XFASjfXtnHmYktwfO7AfQST5QmLp5wXFVOysWBhJnMn0WI/yxcWS1xIAHYqELTBusurDUOQGnb4bzCQAN0hTKWMxwv4ACU7hMZWrfar1BpgJ7hDFYHyCs4AKUhaDTUDlIJQPeQRlt7/jYv4WDlGmxUDWTL5tILbEoADg9qbNqVX9ZrOMgaZBpV6Dmp0byxMFIoBm7Lbn/gYM0oGmyGI2EN1WJUFAK6BvyFA4vbRLAFjozkIoWAQ/0aWzr9hYMiK9vLSfg4K0jFBB1dGhs8PloWiuOle9m4cEgQHpKLA4czGdm4UC+u4MDB26V4QjAxmSGekNOg4QHBqWF3cOCgB+8/0KThQr24igMHwGBQTsWhXhgdcX9Z1nYNfccEHWW8eCyWE/2iKjhwOMhcGnOODPXC6ZPunpbZcQRsbRFcHrePrNZpmR3HtTWrBnLvnvLK1wIHFT7RN6uCS2OlkbXCgYQlC7XJQO7fZ729ljiQ9PpMbRJcvJCPrDUOXPiMZOqezuOnOmdHFI52y/xnZ/HFdzKVxDNveN1KHej31IF+z7oH/gP0WMA7tCLfCgAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAAAXNSR0IArs4c6QAAAlFJREFUaIHtmk1LG0EYx//7EuM2URJsSQk5SGmjqdVSKLF4L3goCrYUeij0UPALeNOjn0IoFPwKFq0ePImhHsRSsbTQFxvSILWV2Ljdms16jpN9BtwdzCzzO+7szDw/dvaZZ1+0+ontIcLolx2AaJSg7ChB2Ym8oCly8Nqxh4XXdex8OIVtt7ZZFnB3OIbpFwn0JDVhMQi9ghslB6UtVg4AbBsovTvF5tZ/kSGIFdz73OCes7vHPycIQgU9l7/0mk2xhVTkk4wSlB0lKDtKUHaElmrQwtnjDn97qB64Lcd0DbjRbyAep/dasYIhMDd/jI+f/Kudl8+vYPxh3Ldd7BL1ghXR33+4pBwArK47ZHtH34PlSpN7zn7ZJds7WjAMlKDscLOo43j48s3F+aea6xkDfWlOEgm4TeghPOiTgstrDl4tnvi23xsxMTvTEzwKgZBL9M3bf2Tn7fcN/KwSWSzgNhHGszApWD3gp+mv+3Savmwin2SUoOwoQdlRgrKjBGVHCfIwiJJfM/jFpE70N40LhdQ6PtU4NMh/JzVU8I+ikI9x+98m5sjf5BveKdAxkoJTE90YuNV+kkxGx7MnFpIJ/yHGil0YvR+D1c1eJcsCHhRjGCt2+fZPp3Q8nbJw7Wr7OQbyJh5PWpQCNPWnk+QoQdnxTUF/6x5qNTluz95eDclE++2mreDSioNyRezfD2GTy5p4NM5+o2CW6K/DpnRyAFCuNPDniH2HxAgaIVQPnQQjmE7pyGU7/qsaQy5rIp1ic6bvRh+VJKMqGdlRgrJzBmOQlRYgS3AiAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAAAXNSR0IArs4c6QAAA1BJREFUaIHtmstPE1EUh3/zgGmphIrVECmIBo00Gl8haEww7nxEF42JW9ka/wAWxgULNyZqojujSxcmNmwscSExdkEAE1goIJrQBU0l0ge0tNMpM9cFqdLMo/NoaWfSb3ln5vZ+mdNzztwZaiuXJ3AwdL0XUGscL8gqDRZ5ILYgYT0q7vV6AAAMR8HjBdoP0DjYR4N1mZ9LUTD8jEd8STI/a5Xx9VEYDHI4csZ4wMmu4DNoKDkAWI8STDzl8fFlAULO2LUywdxGY8ntZmVWxLuHeaTj+tdouySTTRCExnikf+uTlAnSNlAWcsCHJwUUtiqfK9ORGjdCy8isE8y+FyqeZ8s7WOLbp21s/tFuxGx7B0v8iGxrHrfR/VJm5at2M2J7wWRMgritHqa2FwSA/KbDBYW8+jFHCGqh2GzrZWC4FYFhDgxL/RtLrIqYDuWRTZanY85D4fJdN3y9lX+SSMDClwK+fy5YWR4AC4IeL4XrD/bJxv0BFkQimHxT3hWfv+nC2Wv6n3t6TrFYXSxiY81a3TIdokb3OYiJdVaj6TB9B3NpgtDjDLr6WVD/IxR8lmB5Sh5ac2EeRAJoRt/8qbiIlIGnBjUs/Qej80VE54u6zi3kCKZDGumuRjg+izYF7Y7jBate6JOxnUKfSTi40Etis9Drou6FfuJFFoEr8l50ZpyXnT8X5tHWQcPXU7nSl0K07oV+MSJgMVJ54wfYKfSTr3Vsg1UZx2fRpqDdcbygpSTj7aJx4hIHZtcsyZiIn9MCJIXdvONDrfD16siiBFieEpCMWX8/aVrQ1U5h5LkXlEIMzI7ziLwtL/Tnbrhw9V6b7vmHgm68up9CLm3tEwLTIUozUJQDgBaFhoVro+SDGjAswLmNXaNEs9Br0Sz0DYBMsLUKcd9IyATdHfVYRu2QCTIshf2HnRO5iiY9px0ueHLYUnJtKBQFO/00jl5whqRqLA4GW8Bye7kU81AaiV9VsNNP4fYoZwtJotGuamaTQ8cYBB+50O6zb22smC47/TTujLnRf1Hna6E64PGqa1BGPmneXCOYDwv4NSMa/uqvVnQP0Lg1qr7fakhwN/ElCZmEhK0Ugaiv3646vj4G3QFa8fGshGlBu+CclkUFxwv+BXSjPwsXks5lAAAAAElFTkSuQmCC"
  ];
  function avatarTextFromTitle(title) {
    const cleaned = [...String(title || "?").trim()].filter((c) => !/[\s#[\]【】《》*·.,，。!！?？\-_/\\]/.test(c));
    const src = cleaned.length ? cleaned : ["?"];
    let hash = 0;
    for (const c of src) hash = hash * 31 + c.charCodeAt(0) | 0;
    const n = Math.min(src.length, Math.abs(hash) % 3 + 3);
    const text = src.slice(0, n).join("");
    if (/^[a-zA-Z0-9]+$/.test(text)) return text.toUpperCase();
    return text;
  }
  function disguiseAvatarForTopicFeishu(topic) {
    const tid = Math.abs(Number(topic.id) || 0);
    const seed = tid * 2654435761 >>> 0;
    const mode = seed % 4;
    if (mode <= 1) {
      const cover = disguiseTitleForTopic(topic);
      const text = avatarTextFromTitle(cover);
      const chars = [...text];
      const len = chars.length;
      const color = avatarColor(cover || String(tid));
      const hollow = (seed >>> 3) % 2 === 1;
      const label = len === 4 ? `${escapeHtml(chars[0] + chars[1])}<br>${escapeHtml(chars[2] + chars[3])}` : escapeHtml(text);
      return {
        html: `<span class="im-avatar-text" data-len="${len}">${label}</span>`,
        bg: hollow ? "#FFFFFF" : color,
        className: hollow ? "is-text-avatar is-hollow" : "is-text-avatar is-solid",
        styleExtra: hollow ? `color:${color};border:1.5px solid ${color};` : `color:#fff;border:1.5px solid ${color};`
      };
    }
    if (mode === 2) {
      return {
        html: `<img src="${CHAT_ICONS[tid * 31 % CHAT_ICONS.length]}" alt="" loading="lazy">`,
        bg: "transparent",
        className: "",
        styleExtra: "border:none;"
      };
    }
    return {
      html: `<img src="${PIN_AVATARS[tid % PIN_AVATARS.length]}" alt="" loading="lazy">`,
      bg: "transparent",
      className: "",
      styleExtra: "border:none;"
    };
  }
  function renderPins() {
    const box = document.querySelector(".im-list-pins");
    if (!box) return;
    const pins = listState.topics.filter((t) => t.pinned).slice(0, 3);
    if (!pins.length) {
      box.style.display = "none";
      box.innerHTML = "";
      return;
    }
    box.style.display = "";
    const mask = isMaskAvatar();
    box.innerHTML = pins.map((t) => {
      let inner;
      let bg = "transparent";
      let cls = "";
      let styleExtra = "";
      if (mask) {
        const d = disguiseAvatarForTopicFeishu(t);
        inner = d.html;
        bg = d.bg;
        cls = d.className ? ` ${d.className}` : "";
        styleExtra = d.styleExtra || "";
      } else {
        const icon = PIN_AVATARS[Math.abs(Number(t.id) || 0) % PIN_AVATARS.length];
        inner = `<img src="${icon}" alt="" loading="lazy">`;
      }
      const pinTitle = mask ? disguiseTitleForTopic(t) : String(t.title || "");
      return `
      <a class="im-pin" href="${escapeHtml(topicHref(t))}" title="${escapeHtml(pinTitle)}">
        <span class="im-pin-avatar${cls}" style="background:${bg};${styleExtra}">${inner}</span>
        <span class="im-pin-name">${escapeHtml(pinTitle.slice(0, 6))}</span>
      </a>`;
    }).join("");
  }
  function convAvatarFeishu(topic) {
    if (isMaskAvatar()) return null;
    const tid = Math.abs(Number(topic.id) || 0);
    if (tid % 4 !== 1 || !CHAT_ICONS.length) return null;
    return `<span class="im-conv-avatar"><img src="${CHAT_ICONS[tid * 31 % CHAT_ICONS.length]}" alt="" loading="lazy"></span>`;
  }
  const isFeishuSkin = SKIN_ID === "feishu";
  if (isFeishuSkin) {
    skinHooks.renderPins = renderPins;
    skinHooks.convAvatar = convAvatarFeishu;
    skinHooks.disguiseAvatar = disguiseAvatarForTopicFeishu;
  }
  function syncChatTabsFeishu(data, topicId) {
    const tabs = document.querySelector(".im-chat-tabs");
    if (tabs) tabs.style.display = "";
    loadCategories().then(() => {
      if (chatState.topicId !== topicId) return;
      const catTab = document.querySelector(".im-chat-tab-cat");
      if (!catTab) return;
      const cat = data.category_id ? categoryById(data.category_id) : null;
      if (cat) {
        catTab.style.display = "";
        catTab.setAttribute("href", `/c/${cat.slug}/${cat.id}`);
        catTab.innerHTML = `<span class="im-nav2-cat-dot" style="background:#${escapeHtml(cat.color || "8F959E")}"></span>${escapeHtml(cat.name)}`;
      } else {
        catTab.style.display = "none";
      }
    });
  }
  if (isFeishuSkin) {
    skinHooks.syncChatTabs = syncChatTabsFeishu;
  }
  function msgAvatarFeishu(seedName) {
    if (!CHAT_ICONS.length) return null;
    let h = 0;
    for (const c of String(seedName || "?")) h = h * 31 + c.charCodeAt(0) | 0;
    return {
      html: `<img src="${CHAT_ICONS[Math.abs(h) % CHAT_ICONS.length]}" alt="" loading="lazy">`,
      bg: "transparent",
      className: "",
      styleExtra: "border:none;"
    };
  }
  if (isFeishuSkin) {
    skinHooks.msgAvatar = msgAvatarFeishu;
  }
  function watchReplyControl(onChange) {
    const start = () => {
      const rc = document.querySelector("#reply-control");
      if (!rc) return false;
      let open = isComposerOpen();
      let full = !!rc.classList.contains("fullscreen");
      new MutationObserver(() => {
        const next = isComposerOpen();
        const nextFull = !!rc.classList.contains("fullscreen");
        if (next !== open || nextFull !== full) {
          open = next;
          full = nextFull;
          onChange(next);
        }
      }).observe(rc, { attributes: true, attributeFilter: ["class"] });
      onChange(open);
      return true;
    };
    if (start()) return;
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => {
        if (!start()) watchReplyControl(onChange);
      }, { once: true });
      return;
    }
    const boot = new MutationObserver(() => {
      if (start()) boot.disconnect();
    });
    boot.observe(document.body, { childList: true, subtree: true });
  }
  const ROOT_CLASS = "im-native-compose";
  function applyEmbedState(open) {
    const panel = document.querySelector(".im-chat-panel");
    const active = !!(open && panel);
    document.documentElement.classList.toggle(ROOT_CLASS, active);
    for (const zone of document.querySelectorAll(".im-composer")) {
      if (active) zone.setAttribute("data-native", "1");
      else zone.removeAttribute("data-native");
    }
    syncEmbedGeometry(active);
  }
  const EMBED_PROPS = ["left", "right", "top", "bottom", "width", "transform", "translate", "transition"];
  function syncEmbedGeometry(active) {
    const rc = document.querySelector("#reply-control");
    if (!rc) return;
    if (!rc.dataset.styleWatch) {
      rc.dataset.styleWatch = "1";
      new MutationObserver(() => reSyncEmbedGeometry()).observe(rc, { attributes: true, attributeFilter: ["style"] });
    }
    const clear = () => {
      for (const p of EMBED_PROPS) rc.style.removeProperty(p);
    };
    if (!active) {
      clear();
      return;
    }
    const cs = getComputedStyle(document.documentElement);
    const px = (name, fallback) => {
      const v = parseFloat(cs.getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };
    const narrow = innerWidth <= 1e3;
    const gap = narrow ? 12 : 16;
    const panels = px("--im-nav", 56) + px("--im-nav2w", 0) + px("--im-strip", 0) + px("--im-list", 300);
    const full = rc.className.split(/\s+/).some((c) => c.toLowerCase().includes("full"));
    const leftT = full ? panels : panels + gap;
    const r0 = rc.getBoundingClientRect();
    if (rc.style.getPropertyValue("left") && Math.abs(r0.left - leftT) <= 2 && Math.abs(r0.right - (innerWidth - (full ? 0 : gap))) <= 2 && (full ? Math.abs(r0.top) <= 2 && Math.abs(r0.bottom - innerHeight) <= 2 : Math.abs(r0.bottom - (innerHeight - 12)) <= 2)) {
      return;
    }
    rc.style.setProperty("transition", "none", "important");
    rc.style.setProperty("transform", "none", "important");
    rc.style.setProperty("translate", "none", "important");
    rc.style.setProperty("right", "auto", "important");
    rc.style.setProperty("top", full ? "0px" : "auto", "important");
    rc.style.setProperty("left", "0px", "important");
    rc.style.setProperty("bottom", "0px", "important");
    const origin = rc.getBoundingClientRect();
    rc.style.setProperty("left", `${leftT - origin.left}px`, "important");
    if (full) {
      rc.style.setProperty("bottom", `${origin.bottom - innerHeight}px`, "important");
      rc.style.setProperty("max-height", "none", "important");
      rc.style.setProperty("width", `${Math.max(320, innerWidth - panels)}px`, "important");
    } else {
      rc.style.setProperty("bottom", `${origin.bottom - (innerHeight - 12)}px`, "important");
      rc.style.setProperty("width", `${Math.max(320, innerWidth - gap - leftT)}px`, "important");
    }
    if (Math.abs(origin.left) > 1 || Math.abs(origin.bottom - innerHeight) > 2) {
      let n = rc.parentElement;
      while (n && n !== document.documentElement) {
        const s = getComputedStyle(n);
        const hit = [];
        for (const k of ["transform", "perspective", "filter", "backdrop-filter", "will-change", "contain", "container-type"]) {
          const v = s.getPropertyValue(k);
          if (v && !["none", "normal", "auto"].includes(v)) hit.push(`${k}=${v}`);
        }
        if (s.zoom && parseFloat(s.zoom) !== 1) hit.push(`zoom=${s.zoom}`);
        if (hit.length) {
          console.info("[linuxdo-im] 嵌入编辑器包含块被祖先劫持：", n.className || n.id || n.tagName, hit.join(" "));
          break;
        }
        n = n.parentElement;
      }
    }
    const r = rc.getBoundingClientRect();
    if (Math.abs(r.left - leftT) > 2 || Math.abs(r.right - (innerWidth - (full ? 0 : gap))) > 2) {
      if (!rc.dataset.geoRetry) {
        rc.dataset.geoRetry = "1";
        requestAnimationFrame(() => syncEmbedGeometry(true));
      }
    } else {
      delete rc.dataset.geoRetry;
    }
  }
  function reSyncEmbedGeometry() {
    if (document.documentElement.classList.contains(ROOT_CLASS)) syncEmbedGeometry(true);
  }
  window.addEventListener("resize", reSyncEmbedGeometry);
  window.addEventListener("im-layout-change", reSyncEmbedGeometry);
  function initComposerEmbed() {
    watchReplyControl(applyEmbedState);
    document.addEventListener(
      "keydown",
      (e) => {
        var _a2, _b2;
        if (!document.documentElement.classList.contains(ROOT_CLASS)) return;
        if (e.key !== "Enter" || e.shiftKey || e.isComposing || e.keyCode === 229) return;
        if (!((_b2 = (_a2 = e.target).closest) == null ? void 0 : _b2.call(_a2, ".ProseMirror, textarea.d-editor-input"))) return;
        const create = document.querySelector("#reply-control .save-or-cancel .create, #reply-control button.create");
        if (create && !create.disabled) {
          e.preventDefault();
          e.stopPropagation();
          create.click();
        }
      },
      true
    );
  }
  initComposerEmbed();
  async function apiVotePoll(postId, pollName, optionIds) {
    if (!postId || !optionIds.length) return null;
    const body = new URLSearchParams();
    body.append("post_id", String(postId));
    body.append("poll_name", String(pollName));
    for (const opt of optionIds) {
      body.append("options[]", String(opt));
    }
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
    body.append("poll_name", String(pollName));
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
  function applyPollResult(poll, pollData) {
    if (!poll || !pollData) return;
    const options = pollData.options || [];
    const totalVotes = options.reduce((sum, o) => sum + (Number(o.votes) || 0), 0);
    const infoNumber = poll.querySelector(".poll-info .info-number");
    if (infoNumber) infoNumber.textContent = String(pollData.voters != null ? pollData.voters : totalVotes);
    for (const opt of options) {
      const optEl = poll.querySelector(`.im-poll-option[data-poll-option-id="${opt.id}"]`);
      if (!optEl) continue;
      const votes = Number(opt.votes) || 0;
      const pct = totalVotes > 0 ? Math.round(votes / totalVotes * 100) : 0;
      const countEl = optEl.querySelector(".im-poll-count");
      if (countEl) {
        countEl.textContent = `${votes} 票 (${pct}%)`;
        countEl.style.display = "";
      }
      const barEl = optEl.querySelector(".im-poll-bar");
      if (barEl) {
        barEl.style.width = `${pct}%`;
      }
    }
  }
  function getVotedOptionIds(postId, pollName, postData) {
    if (postData && postData.polls_votes && postData.polls_votes[pollName]) {
      const v = postData.polls_votes[pollName];
      return Array.isArray(v) ? v.map(String) : [String(v)];
    }
    try {
      const cache2 = localStorage.getItem(`im_poll_${postId}_${pollName}`);
      if (cache2) return JSON.parse(cache2).map(String);
    } catch {
    }
    return [];
  }
  function saveVotedOptionIds(postId, pollName, optionIds) {
    try {
      localStorage.setItem(`im_poll_${postId}_${pollName}`, JSON.stringify(optionIds));
    } catch {
    }
  }
  function clearVotedOptionIds(postId, pollName) {
    try {
      localStorage.removeItem(`im_poll_${postId}_${pollName}`);
    } catch {
    }
  }
  function initPollComponent(poll, postData) {
    if (!poll || poll.querySelector(".im-poll-options")) return;
    const items = poll.querySelectorAll("li[data-poll-option-id]");
    if (!items.length) return;
    const msg = poll.closest(".im-msg");
    const postId = msg ? msg.dataset.postId : null;
    const isDark = isDarkEffective();
    const pollName = poll.dataset.pollName || "poll";
    const isMultiple = poll.dataset.pollType === "multiple";
    const pollInfo = postData && postData.polls && postData.polls.find((p) => p.name === pollName);
    const optionsData = pollInfo && pollInfo.options || [];
    const totalVotes = optionsData.reduce((sum, o) => sum + (Number(o.votes) || 0), 0);
    const totalVoters = pollInfo && pollInfo.voters != null ? pollInfo.voters : totalVotes;
    const infoNumber = poll.querySelector(".poll-info .info-number");
    if (infoNumber && totalVoters > 0) {
      infoNumber.textContent = String(totalVoters);
    }
    const votedOptionIds = getVotedOptionIds(postId, pollName, postData);
    const hasVoted = votedOptionIds.length > 0;
    poll.style.cssText = `
    background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"} !important;
    border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} !important;
    border-radius: 10px !important;
    padding: 14px 16px !important;
    margin: 12px 0 !important;
    user-select: none !important;
    display: block !important;
  `;
    const optionsBox = document.createElement("div");
    optionsBox.className = "im-poll-options";
    optionsBox.style.cssText = "display:flex !important; flex-direction:column !important; gap:8px !important; margin-bottom:10px !important;";
    items.forEach((li) => {
      const optId = li.dataset.pollOptionId;
      let rawText = (li.textContent || "").trim();
      rawText = rawText.replace(/\s*\d+\s*票\s*\(\d+%\)$/, "").trim();
      const matchedOpt = optionsData.find((o) => o.id === optId);
      const votes = matchedOpt ? Number(matchedOpt.votes) || 0 : 0;
      const pct = totalVotes > 0 ? Math.round(votes / totalVotes * 100) : 0;
      const countText = totalVotes > 0 ? `${votes} 票 (${pct}%)` : "";
      const isSelected = votedOptionIds.includes(optId);
      const optCard = document.createElement("div");
      optCard.className = `im-poll-option${isSelected ? " selected" : ""}`;
      optCard.dataset.pollOptionId = optId;
      optCard.style.cssText = `
      display: flex !important;
      align-items: center !important;
      padding: 10px 14px !important;
      border-radius: 8px !important;
      background: ${isSelected ? isDark ? "rgba(26, 135, 255, 0.18)" : "rgba(26, 135, 255, 0.08)" : isDark ? "#23262E" : "#FFFFFF"} !important;
      border: 1.5px solid ${isSelected ? "#1A87FF" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} !important;
      cursor: pointer !important;
      position: relative !important;
      overflow: hidden !important;
      transition: all 0.18s ease !important;
    `;
      optCard.innerHTML = `
      <span class="im-poll-radio" style="
        width: 18px !important;
        height: 18px !important;
        min-width: 18px !important;
        border-radius: ${isMultiple ? "4px" : "50%"} !important;
        border: 2px solid ${isSelected ? "#1A87FF" : isDark ? "#7C8290" : "#8A8F99"} !important;
        background: ${isSelected ? "#1A87FF" : "transparent"} !important;
        margin-right: 12px !important;
        flex-shrink: 0 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-sizing: border-box !important;
      ">${isSelected ? `<span style="width:6px; height:6px; border-radius:${isMultiple ? "1px" : "50%"}; background:#FFFFFF; display:block;"></span>` : ""}</span>
      <span class="im-poll-title" style="
        flex: 1 !important;
        font-size: 13.5px !important;
        font-weight: 500 !important;
        color: ${isDark ? "#E6E8EB" : "#1F2329"} !important;
        line-height: 1.4 !important;
        z-index: 1 !important;
      ">${escapeHtml(rawText)}</span>
      <span class="im-poll-count" style="
        font-size: 12px !important;
        font-weight: 600 !important;
        color: ${isDark ? "#9AA0AE" : "#646A73"} !important;
        margin-left: 10px !important;
        z-index: 1 !important;
        white-space: nowrap !important;
        ${countText ? "" : "display:none !important;"}
      ">${escapeHtml(countText)}</span>
      <div class="im-poll-bar" style="
        position: absolute !important;
        left: 0 !important; top: 0 !important; bottom: 0 !important;
        background: ${isDark ? "rgba(43, 140, 255, 0.2)" : "rgba(26, 135, 255, 0.14)"} !important;
        pointer-events: none !important;
        width: ${pct}% !important;
        transition: width 0.35s ease !important;
        z-index: 0 !important;
      "></div>
    `;
      optCard.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isMultiple) {
          optionsBox.querySelectorAll(".im-poll-option").forEach((el) => {
            if (el !== optCard) {
              el.classList.remove("selected");
              el.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
              el.style.background = isDark ? "#23262E" : "#FFFFFF";
              const r = el.querySelector(".im-poll-radio");
              if (r) {
                r.style.background = "transparent";
                r.style.borderColor = isDark ? "#7C8290" : "#8A8F99";
                r.innerHTML = "";
              }
            }
          });
        }
        const toggled = optCard.classList.toggle("selected");
        const radio = optCard.querySelector(".im-poll-radio");
        if (toggled) {
          optCard.style.borderColor = "#1A87FF";
          optCard.style.background = isDark ? "rgba(26, 135, 255, 0.18)" : "rgba(26, 135, 255, 0.08)";
          if (radio) {
            radio.style.background = "#1A87FF";
            radio.style.borderColor = "#1A87FF";
            radio.innerHTML = `<span style="width:6px; height:6px; border-radius:${isMultiple ? "1px" : "50%"}; background:#FFFFFF; display:block;"></span>`;
          }
        } else {
          optCard.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
          optCard.style.background = isDark ? "#23262E" : "#FFFFFF";
          if (radio) {
            radio.style.background = "transparent";
            radio.style.borderColor = isDark ? "#7C8290" : "#8A8F99";
            radio.innerHTML = "";
          }
        }
        const hasSelected = !!optionsBox.querySelector(".im-poll-option.selected");
        const submitBtn = poll.querySelector(".im-poll-submit-btn");
        if (submitBtn && submitBtn.textContent === "投票") {
          submitBtn.disabled = !hasSelected;
          submitBtn.style.opacity = hasSelected ? "1" : "0.5";
          submitBtn.style.cursor = hasSelected ? "pointer" : "not-allowed";
        }
      });
      optionsBox.appendChild(optCard);
    });
    const ul = poll.querySelector("ul");
    if (ul) {
      ul.replaceWith(optionsBox);
    } else {
      poll.appendChild(optionsBox);
    }
    if (!poll.querySelector(".im-poll-actions")) {
      const actions = document.createElement("div");
      actions.className = "im-poll-actions";
      actions.style.cssText = "display:flex !important; align-items:center !important; gap:12px !important; margin-top:12px !important; padding-top:10px !important; border-top:1px dashed rgba(255,255,255,0.1) !important;";
      actions.innerHTML = `
      <button type="button" class="im-poll-submit-btn" ${hasVoted ? "" : "disabled"} style="
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 32px !important;
        line-height: 1 !important;
        padding: 0 20px !important;
        border-radius: 6px !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        cursor: ${hasVoted ? "default" : "not-allowed"} !important;
        border: none !important;
        background: #1A87FF !important;
        color: #FFFFFF !important;
        opacity: ${hasVoted ? "1" : "0.5"} !important;
        box-sizing: border-box !important;
        transition: all 0.2s !important;
      ">${hasVoted ? "已投票" : "投票"}</button>
      <button type="button" class="im-poll-undo-btn" style="
        display: ${hasVoted ? "inline-flex" : "none"} !important;
        align-items: center !important;
        justify-content: center !important;
        height: 32px !important;
        line-height: 1 !important;
        padding: 0 16px !important;
        border-radius: 6px !important;
        font-size: 13px !important;
        cursor: pointer !important;
        box-sizing: border-box !important;
        border: 1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"} !important;
        background: transparent !important;
        color: ${isDark ? "#A0A5B2" : "#646A73"} !important;
      ">撤销投票</button>
      <span class="im-poll-status-tip" style="font-size:12px; color:${isDark ? "#8A8F99" : "#8F959E"}; margin-left:8px;">${hasVoted ? "✓ 您已参与投票" : ""}</span>
    `;
      poll.appendChild(actions);
      const submitBtn = actions.querySelector(".im-poll-submit-btn");
      const undoBtn = actions.querySelector(".im-poll-undo-btn");
      const tip = actions.querySelector(".im-poll-status-tip");
      submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (submitBtn.textContent === "已投票") return;
        const selected = Array.from(optionsBox.querySelectorAll(".im-poll-option.selected")).map((el) => el.dataset.pollOptionId);
        if (!selected.length || !postId) return;
        submitBtn.disabled = true;
        submitBtn.textContent = "正在提交…";
        try {
          const res = await apiVotePoll(postId, pollName, selected);
          saveVotedOptionIds(postId, pollName, selected);
          submitBtn.textContent = "已投票";
          submitBtn.style.cursor = "default";
          submitBtn.style.opacity = "1";
          if (undoBtn) undoBtn.style.display = "inline-flex";
          if (tip) tip.textContent = "✓ 投票成功";
          if (res && res.poll) applyPollResult(poll, res.poll);
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = "投票";
          if (tip) tip.textContent = `投票失败: ${err.message}`;
          console.error(err);
        }
      });
      undoBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        undoBtn.disabled = true;
        try {
          const res = await apiUndoVotePoll(postId, pollName);
          clearVotedOptionIds(postId, pollName);
          undoBtn.style.display = "none";
          undoBtn.disabled = false;
          submitBtn.textContent = "投票";
          const hasSelected = !!optionsBox.querySelector(".im-poll-option.selected");
          submitBtn.disabled = !hasSelected;
          submitBtn.style.opacity = hasSelected ? "1" : "0.5";
          submitBtn.style.cursor = hasSelected ? "pointer" : "not-allowed";
          if (tip) tip.textContent = "已撤销投票";
          if (res && res.poll) applyPollResult(poll, res.poll);
        } catch (err) {
          undoBtn.disabled = false;
          if (tip) tip.textContent = "撤销失败";
          console.error(err);
        }
      });
    }
  }
  function enhanceAllPolls(container) {
    if (!container) return;
    try {
      const polls = container.querySelectorAll(".poll");
      for (const poll of polls) {
        try {
          const msg = poll.closest(".im-msg");
          const postNum = msg ? Number(msg.dataset.postNumber) : null;
          const postData = postNum ? topicPostsMap.get(postNum) : null;
          initPollComponent(poll, postData);
        } catch (innerErr) {
          console.warn("[linuxdo-im] initPollComponent warning:", innerErr);
        }
      }
    } catch (err) {
      console.warn("[linuxdo-im] enhanceAllPolls warning:", err);
    }
  }
  Object.assign(chatHooks, { enhancePolls: enhanceAllPolls });
  function getNativeCantUndoText(postNumber) {
    if (postNumber) {
      const nativeBtn = document.querySelector(
        `#post_${postNumber} button.btn-toggle-reaction-like, #post_${postNumber} button[class*='like'], #post_${postNumber} button[class*='reaction']`
      );
      const nativeTitle = (nativeBtn == null ? void 0 : nativeBtn.getAttribute("title")) || (nativeBtn == null ? void 0 : nativeBtn.getAttribute("data-tooltip"));
      if (nativeTitle && !nativeTitle.startsWith("[")) return nativeTitle;
    }
    try {
      if (typeof window !== "undefined" && window.I18n && typeof window.I18n.t === "function") {
        const candidates = [
          "js.discourse_reactions.state.cant_remove_reaction",
          "discourse_reactions.state.cant_remove_reaction",
          "js.discourse_reactions.cant_remove_reaction",
          "discourse_reactions.cant_remove_reaction"
        ];
        for (const k of candidates) {
          const res = window.I18n.t(k);
          if (res && typeof res === "string" && !res.startsWith("[") && !res.includes("missing")) {
            return res;
          }
        }
      }
    } catch {
    }
    return "您无法再移除您自己的回应了";
  }
  function showImToast(message, targetEl) {
    if (!message) return;
    document.querySelectorAll(".im-toast").forEach((el) => el.remove());
    const toast = document.createElement("div");
    toast.className = "im-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    if (targetEl && targetEl.getBoundingClientRect) {
      const rect = targetEl.getBoundingClientRect();
      const toastW = toast.offsetWidth || 180;
      const toastH = toast.offsetHeight || 32;
      let left = rect.left + rect.width / 2 - toastW / 2;
      left = Math.max(12, Math.min(window.innerWidth - toastW - 12, left));
      let top = rect.top - toastH - 8;
      if (top < 10) {
        top = rect.bottom + 8;
      }
      toast.style.left = `${left}px`;
      toast.style.top = `${top}px`;
    } else {
      toast.style.top = "60px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
    }
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 220);
    }, 2400);
  }
  async function toggleLike(postId, triggerEl) {
    if (!postId) return;
    const msg = triggerEl.closest(".im-msg");
    const wasLiked = likedPosts.has(postId);
    const badge = msg ? msg.querySelector(".im-like-badge") : null;
    const toolBtn = msg ? msg.querySelector('.im-msg-tool[data-action="like"]') : null;
    const postNum = msg ? Number(msg.dataset.postNumber) : null;
    const canUndo = badge && badge.dataset.canUndo === "0" || toolBtn && toolBtn.dataset.canUndo === "0" ? false : true;
    if (wasLiked && !canUndo) {
      showImToast(getNativeCantUndoText(postNum), triggerEl);
      return;
    }
    let currentCount = badge ? Number(badge.dataset.likes) || 0 : 0;
    let nextCount = wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
    if (wasLiked) likedPosts.delete(postId);
    else likedPosts.add(postId);
    if (badge) {
      badge.classList.toggle("liked", !wasLiked);
      badge.dataset.likes = String(nextCount);
      const countEl = badge.querySelector(".im-like-count");
      if (countEl) countEl.textContent = nextCount > 0 ? String(nextCount) : "";
      const iconEl = badge.querySelector(".im-like-icon");
      if (iconEl) iconEl.innerHTML = !wasLiked ? ICONS.heartFilled : ICONS.heartOutline;
      badge.style.display = nextCount > 0 || !wasLiked ? "inline-flex" : "none";
      badge.title = !wasLiked ? "已点赞，点击取消" : "点赞";
      badge.classList.remove("pop");
      void badge.offsetWidth;
      badge.classList.add("pop");
    }
    if (toolBtn) {
      toolBtn.classList.toggle("liked", !wasLiked);
      toolBtn.innerHTML = !wasLiked ? ICONS.heartFilled : ICONS.heartOutline || ICONS.like;
      toolBtn.title = !wasLiked ? "已点赞，点击取消" : "点赞";
      toolBtn.classList.remove("pop");
      void toolBtn.offsetWidth;
      toolBtn.classList.add("pop");
    }
    try {
      const token = csrfToken();
      let success = false;
      const headers = {
        "X-CSRF-Token": token,
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json"
      };
      const url = wasLiked ? `/post_actions/${postId}.json?post_action_type_id=2` : "/post_actions.json";
      const opts = wasLiked ? { method: "DELETE", credentials: "same-origin", headers } : {
        method: "POST",
        credentials: "same-origin",
        headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${postId}&post_action_type_id=2`
      };
      try {
        const resp = await fetch(url, opts);
        if (resp.ok) success = true;
      } catch {
      }
      if (!success) {
        try {
          const rToggle = await fetch(`/discourse-reactions/posts/${postId}/custom-reactions/heart/toggle.json`, {
            method: "PUT",
            credentials: "same-origin",
            headers
          });
          if (rToggle.ok) success = true;
        } catch {
        }
      }
      if (!success) {
        throw new Error(wasLiked ? getNativeCantUndoText(postNum) : "点赞操作未能完成");
      }
    } catch (err) {
      console.warn("[linuxdo-im] toggleLike error, rollback:", err);
      const tipText = wasLiked ? getNativeCantUndoText(postNum) : err.message || "点赞操作未能完成";
      showImToast(tipText, triggerEl);
      if (wasLiked) likedPosts.add(postId);
      else likedPosts.delete(postId);
      if (badge) {
        badge.classList.toggle("liked", wasLiked);
        badge.dataset.likes = String(currentCount);
        const countEl = badge.querySelector(".im-like-count");
        if (countEl) countEl.textContent = currentCount > 0 ? String(currentCount) : "";
        const iconEl = badge.querySelector(".im-like-icon");
        if (iconEl) iconEl.innerHTML = wasLiked ? ICONS.heartFilled : ICONS.heartOutline;
        badge.style.display = currentCount > 0 ? "inline-flex" : "none";
        badge.title = wasLiked ? getNativeCantUndoText(postNum) : "点赞";
      }
      if (toolBtn) {
        toolBtn.classList.toggle("liked", wasLiked);
        toolBtn.innerHTML = wasLiked ? ICONS.heartFilled : ICONS.heartOutline || ICONS.like;
        toolBtn.title = wasLiked ? getNativeCantUndoText(postNum) : "点赞";
      }
    }
  }
  Object.assign(chatHooks, { toast: showImToast, toggleLike, cantUndoText: getNativeCantUndoText });
  function formatBoostCooked(cooked) {
    if (!cooked) return "";
    try {
      const div = document.createElement("div");
      div.innerHTML = cooked;
      div.querySelectorAll("p, div").forEach((p) => {
        const span = document.createElement("span");
        span.innerHTML = p.innerHTML + " ";
        p.replaceWith(span);
      });
      div.querySelectorAll("*:not(img.emoji):not(span)").forEach((el) => el.remove());
      div.querySelectorAll("img.emoji").forEach((img) => {
        img.style.width = "18px";
        img.style.height = "18px";
        img.style.verticalAlign = "text-bottom";
        img.style.margin = "0 2px";
        img.style.display = "inline-block";
      });
      return div.innerHTML.trim();
    } catch {
      return escapeHtml(extractTextSnippet(cooked, 50) || "");
    }
  }
  function renderBoostsHtml(post, myName) {
    if (!myName) myName = getCurrentUsername();
    if (!post) return "";
    const boosts = post.boosts || [];
    if (!boosts.length && post.post_number !== 1) return "";
    let chips = "";
    for (const b of boosts) {
      const contentHtml = formatBoostCooked(b.cooked);
      const text = extractTextSnippet(b.cooked, 35) || "";
      const u = b.user || {};
      const uName = u.name || u.username || "佬友";
      let avatarSrc = "";
      if (u.animated_avatar) {
        avatarSrc = u.animated_avatar.startsWith("//") ? "https:" + u.animated_avatar : u.animated_avatar;
      } else if (u.avatar_template) {
        avatarSrc = fullAvatarUrl(u.avatar_template);
      }
      let avatarHtml2 = "";
      if (avatarSrc) {
        avatarHtml2 = `<span class="im-rocket-avatar-box"><img src="${escapeHtml(avatarSrc)}" alt="" loading="lazy"></span>`;
      } else {
        const letter = avatarLetter(uName);
        avatarHtml2 = `<span class="im-rocket-avatar-box"><span class="fallback-letter" style="background:${avatarColor(letter)}">${escapeHtml(letter)}</span></span>`;
      }
      const isMyBoost = u.username && myName && u.username.toLowerCase() === myName.toLowerCase() || b.can_delete;
      chips += `<span class="im-rocket-chip${isMyBoost ? " is-my-boost" : ""}" title="${escapeHtml(uName)}: ${escapeHtml(text)}" data-boost-id="${b.id || ""}">${avatarHtml2}<span class="im-rocket-text">${contentHtml || escapeHtml(text)}</span>` + (isMyBoost ? `<button type="button" class="im-rocket-trash" title="删除跟评" style="display:none;">${ICONS.trash}</button>` : "") + `</span>`;
    }
    return `
    <div class="im-rocket-bar" data-post-number="${post.post_number}">
      ${chips}
      <button type="button" class="im-rocket-btn" title="发射小火箭">${ICONS.rocket || "🚀"}</button>
    </div>`;
  }
  async function submitImBoost(postId, _postNum, content, msgEl, composerEl) {
    var _a2, _b2, _c, _d, _e;
    if (!postId || !content) return;
    const submitBtn = composerEl.querySelector(".im-boost-submit");
    if (submitBtn) submitBtn.style.opacity = "0.5";
    try {
      const token = csrfToken();
      let ok = false;
      let newBoostId = null;
      try {
        const r1 = await fetch(`/discourse-boosts/posts/${postId}/boosts`, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "X-CSRF-Token": token,
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ raw: content })
        });
        if (r1.ok) {
          ok = true;
          const data = await r1.json().catch(() => ({}));
          newBoostId = data && (data.id || ((_a2 = data.boost) == null ? void 0 : _a2.id)) || null;
        }
      } catch {
      }
      if (!ok) {
        try {
          const r2 = await fetch(`/discourse-boosts/posts/${postId}/boosts`, {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "X-CSRF-Token": token,
              "X-Requested-With": "XMLHttpRequest",
              "Content-Type": "application/x-www-form-urlencoded",
              "Accept": "application/json"
            },
            body: `raw=${encodeURIComponent(content)}`
          });
          if (r2.ok) {
            ok = true;
            const data = await r2.json().catch(() => ({}));
            newBoostId = data && (data.id || ((_b2 = data.boost) == null ? void 0 : _b2.id)) || null;
          }
        } catch {
        }
      }
      if (!ok) {
        throw new Error("服务端拒绝了小火箭发送请求");
      }
      composerEl.remove();
      showImToast("✓ 小火箭跟评发送成功", msgEl);
      let rocketBar = msgEl.querySelector(".im-rocket-bar");
      if (!rocketBar) {
        rocketBar = document.createElement("div");
        rocketBar.className = "im-rocket-bar";
        const bubble = msgEl.querySelector(".im-msg-bubble");
        if (bubble) bubble.appendChild(rocketBar);
      }
      let myAvatarUrl = "";
      try {
        const u = ((_c = safeLookup(getEmberOwner(), "service:current-user")) == null ? void 0 : _c.currentUser) || ((_e = (_d = window.Discourse) == null ? void 0 : _d.User) == null ? void 0 : _e.current());
        if (u && u.avatar_template) myAvatarUrl = fullAvatarUrl(u.avatar_template);
      } catch {
      }
      const newChip = document.createElement("span");
      newChip.className = "im-rocket-chip is-my-boost";
      if (newBoostId) newChip.dataset.boostId = String(newBoostId);
      newChip.innerHTML = `
      <span class="im-rocket-avatar-box">
        ${myAvatarUrl ? `<img src="${escapeHtml(myAvatarUrl)}" alt="">` : `<span style="font-size:10px;">我</span>`}
      </span>
      <span class="im-rocket-text">${escapeHtml(content)}</span>
      <button type="button" class="im-rocket-trash" title="删除跟评" style="display:none;">${ICONS.trash}</button>
    `;
      const plusBtn = rocketBar.querySelector(".im-rocket-btn");
      if (plusBtn) {
        rocketBar.insertBefore(newChip, plusBtn);
      } else {
        rocketBar.appendChild(newChip);
      }
    } catch (err) {
      console.error("[linuxdo-im] submitImBoost error:", err);
      if (submitBtn) submitBtn.style.opacity = "1";
      showImToast("跟评发送失败，请重试", composerEl);
    }
  }
  async function deleteImBoost(_postId, boostId, chipEl) {
    var _a2, _b2, _c;
    if (!boostId) {
      const chipText = ((_a2 = chipEl.querySelector(".im-rocket-text")) == null ? void 0 : _a2.textContent.trim()) || "";
      const targetCooked = Array.from(document.querySelectorAll(".discourse-boosts__cooked")).find((b) => b.textContent.includes(chipText));
      if (targetCooked) {
        let nativeDel = (_b2 = targetCooked.parentElement) == null ? void 0 : _b2.querySelector("button.discourse-boosts__delete");
        if (!nativeDel) {
          targetCooked.click();
          await new Promise((r) => setTimeout(r, 60));
          nativeDel = (_c = targetCooked.parentElement) == null ? void 0 : _c.querySelector("button.discourse-boosts__delete");
        }
        if (nativeDel) {
          nativeDel.click();
          chipEl.remove();
          showImToast("✓ 跟评已删除", chipEl);
          return;
        }
      }
      showImToast("删除失败，未获取到跟评编号", chipEl);
      return;
    }
    const trashBtn = chipEl.querySelector(".im-rocket-trash");
    if (trashBtn) trashBtn.style.opacity = "0.4";
    try {
      const token = csrfToken();
      const headers = {
        "X-CSRF-Token": token,
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json"
      };
      const resp = await fetch(`/discourse-boosts/boosts/${boostId}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers
      });
      if (!resp.ok && resp.status !== 200 && resp.status !== 204) {
        throw new Error(`HTTP ${resp.status}`);
      }
      chipEl.style.transition = "all 0.2s ease";
      chipEl.style.opacity = "0";
      chipEl.style.transform = "scale(0.8)";
      setTimeout(() => chipEl.remove(), 200);
      showImToast("✓ 跟评已删除", chipEl);
    } catch (err) {
      console.error("[linuxdo-im] deleteImBoost error:", err);
      if (trashBtn) trashBtn.style.opacity = "1";
      showImToast("删除失败，请刷新重试", chipEl);
    }
  }
  function openImBoostComposer(msgEl) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i;
    if (!msgEl) return;
    const existing = msgEl.querySelector(".im-boost-composer");
    if (existing) {
      (_a2 = existing.querySelector(".im-boost-input")) == null ? void 0 : _a2.focus();
      return;
    }
    document.querySelectorAll(".im-boost-composer").forEach((el) => el.remove());
    const postId = msgEl.dataset.postId;
    const postNum = msgEl.dataset.postNumber;
    const authorName = ((_b2 = msgEl.querySelector(".im-msg-name")) == null ? void 0 : _b2.textContent.trim()) || "";
    let myAvatar = "";
    try {
      const owner = getEmberOwner();
      const u = ((_c = safeLookup(owner, "service:current-user")) == null ? void 0 : _c.currentUser) || ((_e = (_d = window.Discourse) == null ? void 0 : _d.User) == null ? void 0 : _e.current());
      if (u && u.avatar_template) {
        myAvatar = `<img src="${escapeHtml(fullAvatarUrl(u.avatar_template))}" alt="">`;
      } else if (u && u.username) {
        myAvatar = escapeHtml(u.username.slice(0, 1).toUpperCase());
      }
    } catch {
    }
    if (!myAvatar) {
      myAvatar = "我";
    }
    const composer = document.createElement("div");
    composer.className = "im-boost-composer";
    composer.innerHTML = `
    <div class="im-boost-avatar">${myAvatar}</div>
    <input type="text" class="im-boost-input" placeholder="Boost ${escapeHtml(authorName)}..." autocomplete="off" enterkeyhint="send">
    <div class="im-boost-emojis">
      <span class="im-quick-emoji" title="火箭">🚀</span>
      <span class="im-quick-emoji" title="点赞">👍</span>
      <span class="im-quick-emoji" title="爱心">❤️</span>
      <span class="im-quick-emoji" title="大笑">🤣</span>
      <span class="im-quick-emoji" title="庆祝">🎉</span>
      <span class="im-quick-emoji" title="火">🔥</span>
      <span class="im-quick-emoji" title="牛">🐮</span>
      <span class="im-quick-emoji" title="眼睛">👀</span>
    </div>
    <button type="button" class="im-boost-btn im-boost-submit" title="发送跟评">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </button>
    <button type="button" class="im-boost-btn im-boost-cancel" title="取消">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;
    const bubble = msgEl.querySelector(".im-msg-bubble");
    if (bubble && bubble.nextSibling) {
      (_f = msgEl.querySelector(".im-msg-content")) == null ? void 0 : _f.insertBefore(composer, bubble.nextSibling);
    } else {
      (_g = msgEl.querySelector(".im-msg-content")) == null ? void 0 : _g.appendChild(composer);
    }
    const input = composer.querySelector(".im-boost-input");
    composer.querySelectorAll(".im-quick-emoji").forEach((em) => {
      em.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (input) {
          input.value += em.textContent.trim();
          input.focus();
        }
      });
    });
    input == null ? void 0 : input.focus();
    const doSubmit = () => {
      const text = ((input == null ? void 0 : input.value) || "").trim();
      if (!text) {
        input == null ? void 0 : input.focus();
        return;
      }
      submitImBoost(postId, postNum, text, msgEl, composer);
    };
    (_h = composer.querySelector(".im-boost-submit")) == null ? void 0 : _h.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      doSubmit();
    });
    (_i = composer.querySelector(".im-boost-cancel")) == null ? void 0 : _i.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      composer.remove();
    });
    input == null ? void 0 : input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        doSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        composer.remove();
      }
    });
  }
  Object.assign(chatHooks, {
    openBoostComposer: openImBoostComposer,
    deleteBoost: deleteImBoost,
    renderBoosts: renderBoostsHtml
  });
  let activeImgModal = null;
  function openImImageModal(src, _triggerImg) {
    if (!src) return;
    if (activeImgModal) closeImImageModal();
    let scale = 1;
    let rotate = 0;
    let isDragging = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;
    const modal = document.createElement("div");
    modal.className = "im-img-modal";
    modal.tabIndex = -1;
    modal.innerHTML = `
    <div class="im-img-modal-backdrop"></div>
    <div class="im-img-modal-toolbar">
      <button type="button" class="im-img-btn" data-action="zoom-in" title="放大">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <button type="button" class="im-img-btn" data-action="zoom-out" title="缩小">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <button type="button" class="im-img-btn" data-action="reset" title="还原">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button type="button" class="im-img-btn" data-action="rotate" title="旋转">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
      </button>
      <a href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer" class="im-img-btn" title="在新标签页打开原图">${ICONS.external}</a>
      <button type="button" class="im-img-btn im-img-close" data-action="close" title="关闭 (Esc)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="im-img-modal-stage">
      <img class="im-img-modal-img" src="${escapeHtml(src)}" alt="预览图片" draggable="false">
    </div>`;
    document.body.appendChild(modal);
    activeImgModal = modal;
    const img = modal.querySelector(".im-img-modal-img");
    const backdrop = modal.querySelector(".im-img-modal-backdrop");
    const stage = modal.querySelector(".im-img-modal-stage");
    function updateTransform(smooth = false) {
      if (!img) return;
      img.style.transition = smooth ? "transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)" : "none";
      img.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
      img.style.cursor = scale > 1.05 ? isDragging ? "grabbing" : "grab" : "zoom-in";
    }
    requestAnimationFrame(() => {
      modal.classList.add("is-active");
      updateTransform(true);
    });
    function close() {
      if (!modal.isConnected) return;
      modal.classList.remove("is-active");
      modal.classList.add("is-closing");
      setTimeout(() => {
        modal.remove();
        if (activeImgModal === modal) activeImgModal = null;
      }, 200);
      document.removeEventListener("keydown", onKeyDown);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    modal.addEventListener("click", (e) => {
      const btn = e.target.closest(".im-img-btn");
      if (btn) {
        const action = btn.dataset.action;
        if (action === "close") close();
        else if (action === "zoom-in") {
          scale = Math.min(scale * 1.3, 5);
          updateTransform(true);
        } else if (action === "zoom-out") {
          scale = Math.max(scale / 1.3, 0.3);
          updateTransform(true);
        } else if (action === "reset") {
          scale = 1;
          translateX = 0;
          translateY = 0;
          rotate = 0;
          updateTransform(true);
        } else if (action === "rotate") {
          rotate = (rotate + 90) % 360;
          updateTransform(true);
        }
        return;
      }
      if (e.target === backdrop || e.target === stage) close();
    });
    modal.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.15 : 0.88;
      scale = Math.min(Math.max(scale * delta, 0.3), 6);
      updateTransform(false);
    }, { passive: false });
    img.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      img.style.cursor = "grabbing";
    });
    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform(false);
    });
    window.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      updateTransform(false);
    });
    img.addEventListener("dblclick", (e) => {
      e.preventDefault();
      if (scale > 1.2) {
        scale = 1;
        translateX = 0;
        translateY = 0;
      } else {
        scale = 2;
      }
      updateTransform(true);
    });
  }
  function closeImImageModal() {
    if (activeImgModal) {
      activeImgModal.remove();
      activeImgModal = null;
    }
  }
  Object.assign(chatHooks, { openImageModal: openImImageModal });
  const quoteJumpHistory = [];
  function pushQuoteJump(sourcePostNumber, sourceScrollTop) {
    if (!chatState.topicId) return;
    if (!sourcePostNumber && typeof sourceScrollTop !== "number") return;
    quoteJumpHistory.push({
      topicId: chatState.topicId,
      postNumber: sourcePostNumber,
      scrollTop: sourceScrollTop
    });
    updateJumpBackButton();
  }
  function updateJumpBackButton() {
    const panel = document.querySelector(".im-chat-panel");
    if (!panel) return;
    let btn = panel.querySelector(".im-jump-back-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "im-jump-back-btn";
      btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M19 14l-7 7m0 0l-7-7m7 7V3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="im-jump-back-text">返回原处</span>
      <span class="im-jump-back-close" title="关闭">✕</span>
    `;
      panel.appendChild(btn);
    }
    const currentTopicHistory = quoteJumpHistory.filter((item) => item.topicId === chatState.topicId);
    if (!currentTopicHistory.length) {
      btn.style.setProperty("display", "none", "important");
      return;
    }
    const last = currentTopicHistory[currentTopicHistory.length - 1];
    const textEl = btn.querySelector(".im-jump-back-text");
    if (textEl) {
      textEl.textContent = last.postNumber ? `返回 #${last.postNumber} 楼` : "返回原处";
    }
    btn.style.setProperty("display", "inline-flex", "important");
  }
  function clearQuoteJumpHistory() {
    quoteJumpHistory.length = 0;
    updateJumpBackButton();
  }
  async function popAndReturnQuoteJump() {
    var _a2;
    const itemIdx = quoteJumpHistory.map((entry) => entry.topicId).lastIndexOf(chatState.topicId);
    if (itemIdx === -1) return;
    const item = quoteJumpHistory[itemIdx];
    for (let i = quoteJumpHistory.length - 1; i >= 0; i--) {
      if (quoteJumpHistory[i].topicId === chatState.topicId) quoteJumpHistory.splice(i, 1);
    }
    updateJumpBackButton();
    if (!item) return;
    const panel = document.querySelector(".im-chat-panel");
    const body = panel ? panel.querySelector(".im-chat-body") : null;
    if (!body) return;
    if (item.postNumber) {
      if (scrollChatToPost(body, item.postNumber, true)) return;
      if (await ((_a2 = chatHooks.jumpToPost) == null ? void 0 : _a2.call(chatHooks, item.postNumber))) return;
    }
    if (typeof item.scrollTop === "number") {
      body.scrollTo({ top: item.scrollTop, behavior: "smooth" });
    }
  }
  Object.assign(chatHooks, { pushQuoteJump, clearQuoteJumpHistory, popQuoteJump: popAndReturnQuoteJump });
  function ensureTitlebar() {
    var _a2, _b2;
    let bar = document.querySelector(".im-titlebar");
    if (bar) {
      bindTitlebarSearch(bar);
      bindRailAvatarNotif(bar);
      (_a2 = skinHooks.darkToggle) == null ? void 0 : _a2.call(skinHooks, bar);
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
    (_b2 = skinHooks.darkToggle) == null ? void 0 : _b2.call(skinHooks, bar);
    return bar;
  }
  function bindTitlebarSearch(bar) {
    if (!bar) return;
    const wrap = bar.querySelector(".title-search");
    if (!wrap) return;
    bindSearchTrigger(wrap, { placeholder: "搜索或提问 (⌘K)" });
  }
  function ensureModeFab() {
    let fab = document.querySelector(".im-mode-fab");
    if (getViewMode() !== "native") {
      fab == null ? void 0 : fab.remove();
      return;
    }
    if (fab) return;
    fab = document.createElement("button");
    fab.className = "im-mode-fab";
    fab.title = "切回 IM 视图";
    fab.innerHTML = ICONS.chat;
    fab.addEventListener("click", () => {
      setViewMode("im");
      location.reload();
    });
    document.body.appendChild(fab);
  }
  function ensureStripDingtalk() {
    var _a2;
    (_a2 = document.querySelector(".im-strip")) == null ? void 0 : _a2.remove();
    return null;
  }
  Object.assign(ICONS, {
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1L3 20l1.2-5.3A8.5 8.5 0 1 1 21 11.5z"/></svg>`,
    list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
    worktable: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="7.5" cy="7.5" r="3.4"/><circle cx="16.5" cy="7.5" r="3.4"/><circle cx="7.5" cy="16.5" r="3.4"/><circle cx="16.5" cy="16.5" r="3.4"/></svg>`,
    cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.5 1.5A4 4 0 0 0 7 19z"/></svg>`,
    wiki: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>`,
    task: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>`,
    contacts: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>`,
    project: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>`
  });
  const FILLED_ICONS = {
    chat: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.7 2h2.6v3H6.7zM14.7 2h2.6v3h-2.6z"/><path d="M4 7c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v2H4V7z"/><path d="M4 11h16v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6z"/></svg>`,
    cloud: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`,
    wiki: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 2A2.5 2.5 0 0 0 4 4.5v15a2.5 2.5 0 0 1 2.5-2.5H21V2H6.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H21v5H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>`,
    task: `<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm3.66 6.34a1.15 1.15 0 0 1 0 1.63l-4.05 4.05c-.45.45-1.18.45-1.63 0l-2.14-2.14a1.15 1.15 0 0 1 1.63-1.63l1.32 1.32 3.24-3.24c.45-.45 1.18-.45 1.63 0z"/></svg>`,
    contacts: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zM12 14c4.6 0 8 2.35 8 5.4v.6a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20v-.6c0-3.05 3.4-5.4 8-5.4z"/></svg>`,
    more: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm10 0h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM5 13h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z"/><path d="M17 14v6M14 17h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  };
  const navIcon = (key) => FILLED_ICONS[key] || ICONS[key];
  function bindRailSearch(rail) {
    if (!rail) return;
    let wrap = rail.querySelector(".im-rail-search");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "im-rail-search";
      const head = rail.querySelector(".im-rail-head");
      if (head && head.nextSibling) rail.insertBefore(wrap, head.nextSibling);
      else rail.prepend(wrap);
    }
    if (!wrap.querySelector("input")) {
      wrap.innerHTML = `
      <form action="/search" method="get" role="search">
        ${ICONS.search}
        <input type="search" name="q" placeholder="搜索" autocomplete="off" enterkeyhint="search" aria-label="搜索">
      </form>`;
      delete rail.dataset.searchBound;
    }
    bindSearchTrigger(wrap);
  }
  function ensureRailFeishu() {
    var _a2, _b2;
    let rail = document.querySelector(".im-rail");
    if (rail) {
      bindRailSearch(rail);
      bindRailAvatarNotif(rail);
      (_a2 = skinHooks.darkToggle) == null ? void 0 : _a2.call(skinHooks, rail);
      ensureRailFold(rail.querySelector(".im-rail-bottom"));
      syncRailFeishu();
      return rail;
    }
    rail = document.createElement("nav");
    rail.className = "im-rail";
    rail.setAttribute("aria-label", "飞书风导航");
    const head = document.createElement("div");
    head.className = "im-rail-head";
    const avatarWrap = document.createElement("div");
    avatarWrap.className = "im-rail-avatar-wrap";
    avatarWrap.innerHTML = `<div class="im-rail-avatar"></div><span class="im-rail-avatar-badge" style="display:none"></span>`;
    head.appendChild(avatarWrap);
    const toggle = document.createElement("button");
    toggle.className = "im-rail-toggle";
    toggle.title = "展开 / 收起大类";
    toggle.innerHTML = ICONS.menu;
    toggle.addEventListener("click", () => setNav2Open(!isNav2Open()));
    head.appendChild(toggle);
    rail.appendChild(head);
    const search = document.createElement("div");
    search.className = "im-rail-search";
    search.innerHTML = `
    <form action="/search" method="get" role="search">
      ${ICONS.search}
      <input type="search" name="q" placeholder="搜索" autocomplete="off" enterkeyhint="search" aria-label="搜索">
    </form>`;
    rail.appendChild(search);
    const items = document.createElement("div");
    items.className = "im-rail-items";
    items.innerHTML = `<div class="im-rail-item active" data-rail-key="chat">${navIcon("chat")}<span>消息</span><span class="im-rail-badge" style="display:none"></span></div>` + RAIL_DECO_ITEMS.map(
      (item) => `<div class="im-rail-item">${navIcon(item.icon)}<span>${item.label}</span></div>`
    ).join("");
    rail.appendChild(items);
    document.body.appendChild(rail);
    bindRailSearch(rail);
    bindRailAvatarNotif(rail);
    (_b2 = skinHooks.darkToggle) == null ? void 0 : _b2.call(skinHooks, rail);
    ensureRailFold(rail.querySelector(".im-rail-bottom"));
    syncRailFeishu();
    return rail;
  }
  function ensureRailAvatarWrap(rail) {
    if (!rail) return null;
    const head = rail.querySelector(".im-rail-head");
    if (!head) return null;
    let wrap = head.querySelector(".im-rail-avatar-wrap");
    let avatar = head.querySelector(".im-rail-avatar");
    if (!wrap && avatar) {
      wrap = document.createElement("div");
      wrap.className = "im-rail-avatar-wrap";
      avatar.replaceWith(wrap);
      wrap.appendChild(avatar);
    }
    if (wrap && !wrap.querySelector(".im-rail-avatar-badge")) {
      wrap.insertAdjacentHTML(
        "beforeend",
        `<span class="im-rail-avatar-badge" style="display:none"></span>`
      );
    }
    return (wrap == null ? void 0 : wrap.querySelector(".im-rail-avatar")) || avatar;
  }
  function syncRailFeishu() {
    const rail = document.querySelector(".im-rail");
    if (!rail) return;
    const avatarEl = ensureRailAvatarWrap(rail);
    if (!avatarEl) return;
    const img = document.querySelector("#current-user img");
    const name = getCurrentUsername();
    if (img && img.src) {
      if (avatarEl.dataset.bound !== img.src) {
        avatarEl.dataset.bound = img.src;
        avatarEl.innerHTML = `<img src="${escapeHtml(img.src)}" alt="">`;
        avatarEl.style.background = "transparent";
      }
    } else if (name && avatarEl.dataset.bound !== name) {
      avatarEl.dataset.bound = name;
      avatarEl.textContent = avatarLetter(name);
      avatarEl.style.background = avatarColor(name);
    }
    const notifCount = getUnreadNotificationCount();
    const avatarBadge = rail.querySelector(".im-rail-avatar-badge");
    if (avatarBadge) {
      avatarBadge.style.display = notifCount > 0 ? "" : "none";
      avatarBadge.textContent = notifCount > 99 ? "99+" : String(notifCount);
    }
    const unread = listState.topics.reduce((sum, t) => sum + (t.unread || 0) + (t.new_posts || 0), 0);
    const badge = rail.querySelector('[data-rail-key="chat"] .im-rail-badge');
    if (badge) {
      badge.style.display = unread > 0 ? "" : "none";
      badge.textContent = unread > 99 ? "99+" : String(unread);
    }
  }
  function ensureDarkModeToggleFeishu(rail) {
    if (!rail) return;
    let bottom = rail.querySelector(".im-rail-bottom");
    if (!bottom) {
      bottom = document.createElement("div");
      bottom.className = "im-rail-bottom";
      rail.appendChild(bottom);
    }
    let btn = bottom.querySelector(".im-dark-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "im-rail-item im-dark-toggle";
      bottom.appendChild(btn);
    }
    if (btn.dataset.bound !== "1") {
      btn.dataset.bound = "1";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleColorTheme();
      });
    }
    syncDarkModeToggleFeishu();
  }
  function syncDarkModeToggleFeishu() {
    const btn = document.querySelector(".im-dark-toggle");
    if (!btn) return;
    const mode = getColorTheme();
    const dark = isDarkEffective();
    const label = mode === "auto" ? `跟随系统(${dark ? "深" : "浅"})` : dark ? "深色" : "浅色";
    btn.title = `${label}（点击切换）`;
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.classList.toggle("is-on", dark);
    btn.innerHTML = `${dark ? ICONS.sun : ICONS.moon}<span>${dark ? "浅色" : "深色"}</span>`;
  }
  function syncDarkModeToggleDingtalk() {
    const btn = document.querySelector(".im-dark-toggle");
    if (!btn) return;
    const mode = getColorTheme();
    const dark = isDarkEffective();
    let label;
    if (mode === "auto") label = `主题：跟随系统(${dark ? "深" : "浅"})`;
    else label = `主题：${dark ? "深色" : "浅色"}`;
    btn.title = `${label}（点击切换）`;
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.classList.toggle("is-on", dark);
    btn.innerHTML = dark ? ICONS.sun : ICONS.moon;
  }
  function ensureDarkModeToggleDingtalk(bar) {
    if (!bar) return;
    const actions = bar.querySelector(".title-actions");
    if (!actions) return;
    let btn = actions.querySelector(".im-dark-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "t-btn im-dark-toggle";
      actions.insertBefore(btn, actions.firstChild);
    }
    if (btn.dataset.bound !== "1") {
      btn.dataset.bound = "1";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleColorTheme();
      });
    }
    syncDarkModeToggleDingtalk();
  }
  function ensureDarkModeToggleWecom(rail) {
    if (!rail) return;
    const bottom = rail.querySelector(".im-rail-bottom");
    if (!bottom) return;
    let btn = bottom.querySelector(".im-dark-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "im-rail-item im-dark-toggle";
      bottom.insertBefore(btn, bottom.firstChild);
    }
    if (btn.dataset.bound !== "1") {
      btn.dataset.bound = "1";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleColorTheme();
      });
    }
    syncDarkModeToggleDingtalk();
  }
  function ensureRail() {
    if (SKIN_ID === "feishu") return ensureRailFeishu();
    return ensureRailDingtalk();
  }
  function syncRail() {
    if (SKIN_ID === "feishu") return syncRailFeishu();
    return syncRailDingtalk();
  }
  function ensureStrip() {
    if (SKIN_ID === "wecom") return ensureStripDingtalk();
    return ensureNotifStrip();
  }
  function ensureDarkModeToggle(mount) {
    if (SKIN_ID === "feishu") return ensureDarkModeToggleFeishu(mount);
    if (SKIN_ID === "wecom") return ensureDarkModeToggleWecom(mount);
    return ensureDarkModeToggleDingtalk(mount);
  }
  function syncDarkModeToggle() {
    if (SKIN_ID === "feishu") return syncDarkModeToggleFeishu();
    return syncDarkModeToggleDingtalk();
  }
  const SKIN_ORDER = ["dingtalk", "feishu", "wecom"];
  const SKIN_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h11M4 7l3-3M4 7l3 3"/><path d="M20 17H9M20 17l-3-3M20 17l-3 3"/></svg>`;
  const SKIN_CHECK = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>`;
  function ensureSkinToggle() {
    if (getViewMode() !== "im" || otherThemeActive()) return;
    const host = SKIN_ID === "dingtalk" ? document.querySelector(".im-titlebar .title-actions") : document.querySelector(".im-list-actions");
    if (!host) return;
    let btn = host.querySelector(".im-skin-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = (SKIN_ID === "dingtalk" ? "t-btn" : "im-icon-btn") + " im-skin-toggle";
      btn.title = "切换外观";
      btn.innerHTML = SKIN_ICON;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSkinMenu(btn);
      });
      host.appendChild(btn);
    }
  }
  let skinMenuEl = null;
  function closeSkinMenu() {
    skinMenuEl == null ? void 0 : skinMenuEl.remove();
    skinMenuEl = null;
    document.removeEventListener("click", onSkinMenuOutside, true);
    document.removeEventListener("keydown", onSkinMenuKey, true);
  }
  function onSkinMenuOutside(e) {
    if (skinMenuEl && !skinMenuEl.contains(e.target)) closeSkinMenu();
  }
  function onSkinMenuKey(e) {
    if (e.key === "Escape") closeSkinMenu();
  }
  function toggleSkinMenu(anchor) {
    if (skinMenuEl) {
      closeSkinMenu();
      return;
    }
    const menu = document.createElement("div");
    menu.className = "im-skin-menu";
    menu.innerHTML = SKIN_ORDER.map(
      (id) => `<button type="button" class="im-skin-item${id === SKIN_ID ? " active" : ""}" data-skin="${id}"><span>${SKINS[id].label}</span>${id === SKIN_ID ? `<span class="ok">${SKIN_CHECK}</span>` : ""}</button>`
    ).join("") + // 原版皮肤 = 退回 linux.do 原生界面（右下角悬浮球可切回 IM）
    `<div class="im-skin-sep"></div><button type="button" class="im-skin-item" data-mode="native"><span>原版皮肤</span></button>`;
    menu.addEventListener("click", (e) => {
      const modeItem = e.target.closest("[data-mode='native']");
      if (modeItem) {
        e.preventDefault();
        setViewMode("native");
        location.reload();
        return;
      }
      const item = e.target.closest("[data-skin]");
      if (!item) return;
      e.preventDefault();
      try {
        localStorage.setItem(SKIN_KEY, item.dataset.skin);
      } catch {
      }
      location.reload();
    });
    document.body.appendChild(menu);
    const r = anchor.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    let left = Math.max(8, Math.min(r.right - mw, innerWidth - mw - 8));
    let top = r.bottom + 6;
    if (top + mh > innerHeight - 8) top = Math.max(8, r.top - mh - 6);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    skinMenuEl = menu;
    setTimeout(() => {
      document.addEventListener("click", onSkinMenuOutside, true);
      document.addEventListener("keydown", onSkinMenuKey, true);
    }, 0);
  }
  skinHooks.darkToggle = ensureDarkModeToggle;
  function run() {
    migratePrefs();
    onColorThemeChange(syncDarkModeToggle);
    onRailRefresh(syncRail);
    onRailRefresh(syncNotifStrip);
    bindSearchShortcut();
    onRouteApply(scheduleApply);
    onListReload((mode) => {
      if (mode === "rows") renderListRows();
      else loadList(listState.apiPath || listApiForPath(location.pathname) || "/latest.json", true);
    });
    function injectStyle() {
      let style = document.getElementById(STYLE_ID);
      if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ID;
        (document.head || document.documentElement).appendChild(style);
      }
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
      } catch {
      }
    }
    function removePanels() {
      var _a2, _b2, _c, _d, _e, _f, _g;
      (_a2 = document.querySelector(".im-list-panel")) == null ? void 0 : _a2.remove();
      (_b2 = document.querySelector(".im-chat-panel")) == null ? void 0 : _b2.remove();
      (_c = document.querySelector(".im-rail")) == null ? void 0 : _c.remove();
      (_d = document.querySelector(".im-rail-resizer")) == null ? void 0 : _d.remove();
      (_e = document.querySelector(".im-list-resizer")) == null ? void 0 : _e.remove();
      (_f = document.querySelector(".im-strip")) == null ? void 0 : _f.remove();
      (_g = document.querySelector(".im-titlebar")) == null ? void 0 : _g.remove();
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
    function applyTheme() {
      var _a2, _b2, _c;
      if (otherThemeActive()) {
        console.warn("[linuxdo-im] 检测到其他外观脚本（旧版钉钉 / 旧版飞书）已启用，本脚本自动避让。请只保留其中一个。");
        document.documentElement.classList.remove(ROOT_CLASS$1, DARK_CLASS, LOCK_CLASS, "im-topic-open");
        removePanels();
        return;
      }
      applyColorMode();
      forceSiteScheme();
      if (getViewMode() === "native") {
        document.documentElement.classList.remove(ROOT_CLASS$1, DARK_CLASS, LOCK_CLASS, "im-topic-open");
        removePanels();
        ensureModeFab();
        return;
      }
      injectStyle();
      document.documentElement.classList.add(ROOT_CLASS$1);
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
      if (SKIN_ID === "wecom" || SKIN_ID === "feishu") setRailCollapsed(isRailCollapsed());
      else syncRailFold();
      const pathname = location.pathname;
      const isTopic = isTopicPath(pathname);
      const isHome = isHomePath(pathname);
      const profile = parseProfilePath(pathname);
      const supported = isTopic || isHome || !!profile;
      document.documentElement.classList.toggle(LOCK_CLASS, supported);
      document.documentElement.classList.toggle("im-topic-open", isTopic);
      if (!supported) {
        (_a2 = document.querySelector(".im-list-panel")) == null ? void 0 : _a2.remove();
        (_b2 = document.querySelector(".im-chat-panel")) == null ? void 0 : _b2.remove();
        (_c = document.querySelector(".im-list-resizer")) == null ? void 0 : _c.remove();
        return;
      }
      ensureListPanel();
      ensureRailSources();
      if (!profile) renderActiveSource();
      bindHeaderUserMenuInterception();
      ensureChatPanel();
      ensureListResizer();
      applyListWidth(getListWidth());
      syncListNav();
      ensureSkinToggle();
      if (SKIN_ID === "wecom") ensureDarkModeToggle(document.querySelector(".im-rail"));
      ensureRelativeTimeTicker();
      startRealtimeChatPolling();
      subscribeTopicRealtime(chatState.topicId);
      if (profile) {
        renderProfilePanel(profile.username, profile.tab);
        renderChatEmpty();
      } else if (isTopic) {
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
      console.info(`[linuxdo-im] v${"1.0.0"} loaded, skin=${SKIN_ID}`);
      if (!document.documentElement) {
        setTimeout(bootstrap, 0);
        return;
      }
      injectStyle();
      if (!otherThemeActive()) {
        applyColorMode();
        forceSiteScheme();
      }
      if (getViewMode() !== "native" && !otherThemeActive()) {
        document.documentElement.classList.add(ROOT_CLASS$1);
        applyColorMode();
        restyleSplash();
        makeFavicon();
      }
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
        history[method] = function(...args) {
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
      if (!window.__imNotifBadgeTimer) {
        window.__imNotifBadgeTimer = setInterval(() => {
          if (getViewMode() === "native" || otherThemeActive()) return;
          if (!document.querySelector(".im-rail")) return;
          syncRail();
        }, 15e3);
      }
      window.addEventListener("keydown", (e) => {
        if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
        if ((e.key || "").toLowerCase() !== "k") return;
        if (getViewMode() === "native" || otherThemeActive()) return;
        const tag = e.target && e.target.tagName || "";
        if (tag === "TEXTAREA" || tag === "INPUT" && e.target.type !== "search") return;
        e.preventDefault();
        e.stopPropagation();
        if (SKIN_ID === "feishu") ensureRail();
        else if (SKIN_ID === "dingtalk") ensureTitlebar();
        if (SKIN_ID === "wecom") {
          openSearchPopup();
          return;
        }
        const selector = SKIN_ID === "feishu" ? ".im-rail-search input" : SKIN_ID === "dingtalk" ? ".im-titlebar input" : ".im-list-search input";
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
  run();
})();
