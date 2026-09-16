// ==UserScript==
// @name         小红书 · IM 三合一样式（钉钉 / 飞书 / 企业微信）
// @namespace    https://github.com/linuxdo-community/xhs-im
// @author       linuxdo
// @version      0.1.0
// @description  一套脚本三种 IM 皮肤：钉钉 / 飞书 / 企业微信，把小红书换成三栏 IM 办公聊天壳。只换皮不碰数据：中栏笔记列表（推荐/搜索/频道）＋ 右栏笔记详情与树状评论收成聊天抽屉，点赞/收藏/关注走原生代理。支持纯文本摸鱼模式、深浅色跟随、百家姓脱敏、皮肤一键切换。
// @match        https://www.xiaohongshu.com/*
// @match        https://xiaohongshu.com/*
// @icon         https://www.xiaohongshu.com/favicon.ico
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function() {
  "use strict";
  const ROOT_CLASS = "im-theme";
  const DARK_CLASS = "im-dark";
  const LOCK_CLASS = "im-skin-lock";
  const STYLE_ID = "xhs-im-theme";
  const FAVICON_ID = "xhsim-favicon";
  const SKIN_KEY = "xhs-im-skin";
  const VIEW_KEY = "xhs-im-view";
  const COLOR_THEME_KEY = "xhs-im-color-theme";
  const MASK_AVATAR_KEY = "xhs-im-mask-avatar";
  const MASK_TITLE_KEY = "xhs-im-mask-title";
  const CHAT_KEY = "xhs-im-chat";
  const ORG_NAME_KEY = "xhs-im-org-name";
  const HIDE_MEDIA_KEY = "xhs-im-hide-media";
  const PINNED = [
    { id: "explore", name: "发现推荐", handle: "Explore", path: "/explore", tab: "explore", preview: "推荐信息流同步中", tag: "工作台", bio: "小红书发现流，按 IM 会话展示。" }
  ];
  const SKIN_ORDER = ["dingtalk", "feishu", "wecom"];
  const RAIL_MSG = [{ key: "explore", label: "发现", icon: "msg", path: "/explore" }];
  const RAIL_XHS = [
    { key: "explore", label: "发现", icon: "msg", path: "/explore" }
  ];
  const STRIP_XHS = [];
  const XHS_SKINS = {
    dingtalk: {
      label: "钉钉",
      orgName: "小红书工作台",
      letter: "钉",
      railWidth: 56,
      nav2Width: 0,
      stripWidth: 0,
      listWidth: 320,
      titlebarHeight: 40,
      railMin: 64,
      railMax: 200,
      listMin: 220,
      listMax: 460,
      chatHeadHeight: 56,
      composerHeight: 64,
      compact: true,
      actions: "titlebar",
      accent: "#1A87FF",
      real: RAIL_XHS,
      strip: [],
      deco: [
        { key: "doc", label: "文档", icon: "doc" },
        { key: "aitable", label: "AI表格", icon: "grid" },
        { key: "aimic", label: "AI听记", icon: "mic" },
        { key: "work", label: "工作台", icon: "work", path: "/explore" },
        { key: "book", label: "通讯录", icon: "book" },
        { key: "meet", label: "会议", icon: "meet" },
        { key: "cal", label: "日历", icon: "cal" },
        { key: "todo", label: "待办", icon: "todo" }
      ],
      colors: {
        light: {
          accent: "#1A87FF",
          accentSoft: "#E8F3FF",
          railBg: "linear-gradient(180deg,#D5E0F8 0%,#DCE4F9 100%)",
          titlebarBg: "linear-gradient(90deg,#D5E0F8 0%,#DCE4F9 100%)",
          page: "#F5F7FB",
          card: "#FFFFFF",
          listBg: "#F5F7FB",
          chatBg: "#F5F7FB",
          line: "#E6E8EB",
          text: "#1A1D24",
          text2: "#4A4F5C",
          text3: "#8A8F99",
          hover: "#ECF0F7",
          active: "#E4EAF5",
          bubbleOther: "#FFFFFF",
          bubbleMe: "#D4E5FF",
          danger: "#FF4D4F",
          chipBg: "#E7EAF1"
        },
        dark: {
          accent: "#4AA0FF",
          accentSoft: "#1B2A4A",
          railBg: "#1C2433",
          titlebarBg: "#1C2433",
          page: "#12161D",
          card: "#1C2433",
          listBg: "#161C27",
          chatBg: "#12161D",
          line: "#2A3344",
          text: "#E8EDF5",
          text2: "#A8B3C4",
          text3: "#8B97A8",
          hover: "#222B3A",
          active: "#1E334F",
          bubbleOther: "#1C2433",
          bubbleMe: "#1A3A66",
          danger: "#FF4D4F",
          chipBg: "#2A3344"
        }
      }
    },
    feishu: {
      label: "飞书",
      orgName: "小红书工作台",
      letter: "飞",
      railWidth: 230,
      nav2Width: 0,
      stripWidth: 48,
      listWidth: 360,
      titlebarHeight: 0,
      railMin: 180,
      railMax: 480,
      listMin: 280,
      listMax: 640,
      chatHeadHeight: 94,
      composerHeight: 108,
      compact: false,
      actions: "rail-bottom",
      accent: "#3370FF",
      real: RAIL_MSG,
      strip: STRIP_XHS,
      deco: [
        { key: "calendar", label: "日历", icon: "cal" },
        { key: "worktable", label: "工作台", icon: "work", path: "/explore" },
        { key: "cloud", label: "云文档", icon: "doc" },
        { key: "wiki", label: "知识库", icon: "wiki" },
        { key: "task", label: "任务", icon: "todo" },
        { key: "contacts", label: "联系人", icon: "user" },
        { key: "project", label: "项目", icon: "grid" }
      ],
      colors: {
        light: {
          accent: "#3370FF",
          accentSoft: "#E8F0FF",
          railBg: "#D2E0F1",
          titlebarBg: "#D2E0F1",
          page: "#FFFFFF",
          card: "#FFFFFF",
          listBg: "#FFFFFF",
          chatBg: "#FFFFFF",
          line: "#E8E9EB",
          text: "#1F2329",
          text2: "#646A73",
          text3: "#8F959E",
          hover: "#F5F6F7",
          active: "#E4EDFB",
          bubbleOther: "#EEEFEE",
          bubbleMe: "#E8F0FF",
          danger: "#F54840",
          chipBg: "#F0F2F5"
        },
        dark: {
          accent: "#4C83FF",
          accentSoft: "#1B2A4A",
          railBg: "#1F2329",
          titlebarBg: "#1F2329",
          page: "#17181A",
          card: "#2B2F36",
          listBg: "#1B1F26",
          chatBg: "#17181A",
          line: "#3A3F47",
          text: "#E8EAED",
          text2: "#C0C4CC",
          text3: "#8B919A",
          hover: "#2B2F36",
          active: "#223A63",
          bubbleOther: "#2B2F36",
          bubbleMe: "#1B2A4A",
          danger: "#F54840",
          chipBg: "#2A3140"
        }
      }
    },
    wecom: {
      label: "企业微信",
      orgName: "企业微信",
      letter: "企",
      railWidth: 162,
      nav2Width: 0,
      stripWidth: 0,
      listWidth: 320,
      titlebarHeight: 0,
      railMin: 100,
      railMax: 260,
      listMin: 240,
      listMax: 480,
      chatHeadHeight: 80,
      composerHeight: 72,
      compact: false,
      actions: "rail-bottom",
      accent: "#4389F5",
      groups: true,
      real: RAIL_XHS,
      strip: [],
      deco: [
        { key: "smartdoc", label: "智能文档", icon: "file", dot: true },
        { key: "summary", label: "智能总结", icon: "spark" },
        { key: "work", label: "工作台", icon: "work", path: "/explore" },
        { key: "book", label: "通讯录", icon: "book" },
        { key: "disk", label: "微盘", icon: "disk" },
        { key: "advanced", label: "高级功能", icon: "apps" }
      ],
      colors: {
        light: {
          accent: "#4389F5",
          accentSoft: "#DCEBFF",
          railBg: "#D6E4F4",
          titlebarBg: "#D6E4F4",
          page: "#F5F7FA",
          card: "#FFFFFF",
          listBg: "#FFFFFF",
          chatBg: "#F5F7FA",
          line: "#D9E0E9",
          text: "#172033",
          text2: "#526175",
          text3: "#8B98AA",
          hover: "#E7EEF8",
          active: "#CFE4FF",
          bubbleOther: "#E4E7EC",
          bubbleMe: "#BDE4FF",
          danger: "#FA5151",
          chipBg: "#E7EEF8"
        },
        dark: {
          accent: "#338CFF",
          accentSoft: "#1A2F4A",
          railBg: "#111111",
          titlebarBg: "#111111",
          page: "#111111",
          card: "#1C1C1C",
          listBg: "#1C1C1C",
          chatBg: "#111111",
          line: "#2C2C2C",
          text: "#EAEAEA",
          text2: "#B0B0B0",
          text3: "#8A8A8A",
          hover: "#222222",
          active: "#1A2F4A",
          bubbleOther: "#2A2A2A",
          bubbleMe: "#163A5C",
          danger: "#FA5151",
          chipBg: "#2C2C2C"
        }
      }
    }
  };
  const SKINS = XHS_SKINS;
  const DEFAULT_SKIN_ID = "dingtalk";
  function currentSkinId() {
    try {
      const v = localStorage.getItem(SKIN_KEY);
      if (v && SKINS[v]) return v;
    } catch {
    }
    return DEFAULT_SKIN_ID;
  }
  function setSkinId(id) {
    if (!SKINS[id]) return;
    try {
      localStorage.setItem(SKIN_KEY, id);
    } catch {
    }
  }
  function getOrgName() {
    try {
      return localStorage.getItem(ORG_NAME_KEY) || SKINS[currentSkinId()].orgName;
    } catch {
      return SKINS[currentSkinId()].orgName;
    }
  }
  function setOrgName(name) {
    try {
      localStorage.setItem(ORG_NAME_KEY, name);
    } catch {
    }
  }
  function getViewMode() {
    try {
      return localStorage.getItem(VIEW_KEY) || "im";
    } catch {
      return "im";
    }
  }
  function setViewMode(m) {
    try {
      localStorage.setItem(VIEW_KEY, m);
    } catch {
    }
  }
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
    .im-chat-tools { margin-left: auto; display: flex; gap: 2px; }
    .im-chat-tools .im-icon-btn { width: 32px; height: 32px; position: relative; }
    .im-chat-tools .dot,

    /* ---------- 输入区：IM 直接输入 ---------- */

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
      --wc-chat-bg: #F5F7FA;
      --wc-hover: #E7EEF8;
      --wc-active: #4B8FF7;
      --wc-bubble-other: #E4E7EC;
      --wc-bubble-me: #BDE4FF;
      --wc-border: #D9E0E9;
      --wc-border-strong: #C5CFDB;
      --wc-danger: #FA5151;
      --wc-rail-bg: #D6E4F4;
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
      background: var(--wc-rail-bg);
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
    .im-rail-me, .im-rail-me-ava {
      width: 34px !important;
      height: 34px !important;
      border-radius: 4px !important;
      overflow: hidden !important;
      flex-shrink: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative;
    }
    .im-rail-me-ava img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      border-radius: 4px !important;
      display: block !important;
    }
    .im-rail .im-rail-avatar-badge { top: -3px; right: -5px; box-shadow: 0 0 0 2px var(--wc-rail-bg); }
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
      background: #F0F3F7;
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
      height: 44px;
      padding: 0 12px;
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
      background: #F5F7FA;
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
    .im-image-input {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      opacity: 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
    }
    .im-chat-tools { margin-left: auto; display: flex; gap: 2px; }
    .im-chat-tools .im-icon-btn { width: 32px; height: 32px; position: relative; }
    .im-chat-tools .dot,
    /* 回复引用条：官方左竖线 + 浅底 */

    /* ---------- 输入区：企微外观，内容同步给后台原生 composer ---------- */

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
      --wc-chat-bg: #202021;
      --wc-hover: #272829;
      --wc-active: #338CFF;
      --wc-bubble-other: #303031;
      --wc-bubble-me: #093159;
      --wc-border: rgba(255,255,255,.1);
      --wc-border-strong: rgba(255,255,255,.2);
      --wc-danger: #FF5962;
      --wc-rail-bg: #1B1B1C;
    }
    html.__ROOT_CLASS__.__DARK_CLASS__,
    html.__ROOT_CLASS__.__DARK_CLASS__ body {
      color-scheme: dark !important;
    }
    /* 左侧主导航区 */
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail {
      background: var(--wc-rail-bg);
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
    .__ROOT_CLASS__.__DARK_CLASS__ .im-rail .im-rail-avatar-badge { box-shadow: 0 0 0 2px var(--wc-rail-bg); }
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
      background: #202021;
      border-bottom-color: #2A2C2E;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-title { color: var(--wc-text); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-sub { color: var(--wc-text-3); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-msg-name { color: var(--wc-text-3); }
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

/* /new（新）列表顶部「所有/话题/回复」筛选条（吸附原生 toggle）：
   独立一行挂在 header 下方；默认隐藏，非空内容（syncNewToggle）才显示 */
.im-new-toggle {
  display: flex; align-items: center; gap: 2px;
  padding: 2px 10px 6px;
  flex-shrink: 0;
  min-height: 0;
}
.im-new-toggle-btn {
  height: 24px; padding: 0 12px; border: 0; border-radius: 12px;
  background: #E7EAF1; color: var(--im-text-2); font-size: 13px; cursor: pointer;
  font-family: var(--im-font);
  display: inline-flex; align-items: center; gap: 3px;
  white-space: nowrap; flex-shrink: 0;
}
.im-new-toggle-btn + .im-new-toggle-btn { margin-left: 2px; }
.im-new-toggle-btn .n { font-weight: 600; }
.im-new-toggle-btn.active {
  background: #FFFFFF; color: var(--im-text); font-weight: 600;
  box-shadow: 0 1px 3px rgba(31,35,41,.12);
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

.im-chat-tools {
margin-left: auto; display: flex; gap: 2px;
}

.im-chat-tools .dot,

/* contenteditable 占位符（容器有块级子元素，用 has-content 类控制）；
   绝对定位浮层：内联 ::before 会被块级子元素挤成独立一行 */

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
    /* 皮肤切换下拉（列表头 ⇄ 按钮）—— xim- 为实际类名，im- 保留兼容 */
    .__ROOT_CLASS__ .xim-skin-menu,
    .__ROOT_CLASS__ .im-skin-menu {
      position: fixed; z-index: 1300; min-width: 132px; padding: 5px;
      border-radius: 10px; background: var(--im-bg); border: 1px solid var(--im-border);
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.16);
      display: flex; flex-direction: column;
    }
    .__ROOT_CLASS__ .xim-skin-item,
    .__ROOT_CLASS__ .im-skin-item {
      height: 32px; padding: 0 12px; border-radius: 7px; border: 0; cursor: pointer;
      background: transparent; color: var(--im-text-2); font-size: 13px; font-family: var(--im-font);
      display: flex; align-items: center; justify-content: space-between; gap: 10px; text-align: left;
    }
    .__ROOT_CLASS__ .xim-skin-item:hover,
    .__ROOT_CLASS__ .im-skin-item:hover { background: var(--im-hover); color: var(--im-text); }
    .__ROOT_CLASS__ .xim-skin-item.active,
    .__ROOT_CLASS__ .im-skin-item.active { color: var(--im-accent); font-weight: 500; }
    .__ROOT_CLASS__ .xim-skin-sep,
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

    /* ============ 等级徽章 + 升级进度浮层 ============ */
    .__ROOT_CLASS__ .im-level-btn {
      border: none; cursor: pointer; border-radius: 6px; padding: 0 8px; height: 24px;
      background: var(--im-accent-soft); color: var(--im-accent);
      font-size: 12px; font-weight: 600; font-family: var(--im-font);
      letter-spacing: 0.2px; white-space: nowrap;
    }
    .__ROOT_CLASS__ .im-level-btn:hover { filter: brightness(0.95); }
    .__ROOT_CLASS__ .im-level-pop {
      position: fixed; z-index: 1300; width: 300px; max-height: min(72vh, 520px); overflow-y: auto;
      border-radius: 12px; background: var(--im-bg); border: 1px solid var(--im-border);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18); padding: 14px 16px;
      color: var(--im-text); font-size: 12.5px; font-family: var(--im-font);
    }
    .__ROOT_CLASS__ .im-level-head { display: flex; align-items: center; gap: 8px; }
    .__ROOT_CLASS__ .im-level-cur { font-size: 16px; font-weight: 700; color: var(--im-accent); }
    .__ROOT_CLASS__ .im-level-name { font-size: 13px; font-weight: 600; }
    .__ROOT_CLASS__ .im-level-pill {
      margin-left: auto; font-size: 10.5px; font-weight: 600; white-space: nowrap;
      padding: 2px 8px; border-radius: 999px;
      background: var(--im-hover); color: var(--im-text-2); border: 1px solid var(--im-border);
    }
    .__ROOT_CLASS__ .im-level-pill.ok {
      background: var(--im-accent-soft); color: var(--im-accent); border-color: transparent;
    }
    .__ROOT_CLASS__ .im-level-sub { margin-top: 6px; color: var(--im-text-2); font-size: 12px; line-height: 1.5; }
    .__ROOT_CLASS__ .im-level-sec { margin-top: 12px; }
    .__ROOT_CLASS__ .im-level-sec-title {
      font-size: 11px; font-weight: 600; color: var(--im-text-3); margin-bottom: 8px;
    }
    /* 环形（活跃程度） */
    .__ROOT_CLASS__ .im-level-rings { display: flex; gap: 4px; justify-content: space-between; }
    .__ROOT_CLASS__ .im-level-ring { position: relative; width: 80px; text-align: center; }
    .__ROOT_CLASS__ .im-level-ring svg {
      width: 56px; height: 56px; display: block; margin: 0 auto; transform: rotate(-90deg);
    }
    .__ROOT_CLASS__ .im-level-ring .track { fill: none; stroke: var(--im-accent-soft); stroke-width: 5; }
    .__ROOT_CLASS__ .im-level-ring .fill {
      fill: none; stroke: var(--im-accent); stroke-width: 5; stroke-linecap: round;
      transition: stroke-dashoffset 0.3s ease;
    }
    .__ROOT_CLASS__ .im-level-ring-num {
      position: absolute; top: 0; left: 0; right: 0; height: 56px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      line-height: 1.15; pointer-events: none;
    }
    .__ROOT_CLASS__ .im-level-ring-num b {
      font-size: 12px; font-weight: 700; color: var(--im-text); font-variant-numeric: tabular-nums;
    }
    .__ROOT_CLASS__ .im-level-ring.done .im-level-ring-num b { color: var(--im-accent); }
    .__ROOT_CLASS__ .im-level-ring-num span {
      font-size: 9.5px; color: var(--im-text-3); font-variant-numeric: tabular-nums;
    }
    .__ROOT_CLASS__ .im-level-ring-label { margin-top: 3px; font-size: 10.5px; color: var(--im-text-2); }
    /* 条形（互动参与） */
    .__ROOT_CLASS__ .im-level-row { margin-bottom: 9px; }
    .__ROOT_CLASS__ .im-level-row-head {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 4px; color: var(--im-text-2);
    }
    .__ROOT_CLASS__ .im-level-row.done .im-level-row-head { color: var(--im-accent); }
    .__ROOT_CLASS__ .im-level-num { font-variant-numeric: tabular-nums; color: var(--im-text-3); }
    .__ROOT_CLASS__ .im-level-row.done .im-level-num { color: var(--im-accent); }
    .__ROOT_CLASS__ .im-level-approx {
      font-style: normal; font-size: 10px; color: var(--im-text-3);
      border: 1px solid var(--im-border); border-radius: 4px; padding: 0 3px; margin-left: 4px;
      vertical-align: 1px; cursor: help;
    }
    .__ROOT_CLASS__ .im-level-bar {
      height: 5px; border-radius: 3px; background: var(--im-accent-soft); overflow: hidden;
    }
    .__ROOT_CLASS__ .im-level-bar > i {
      display: block; height: 100%; border-radius: 3px; background: var(--im-accent);
      transition: width 0.3s ease;
    }
    /* 合规：配额超标（坏）与否决项 */
    .__ROOT_CLASS__ .im-level-row.bad .im-level-row-head,
    .__ROOT_CLASS__ .im-level-row.bad .im-level-num { color: var(--im-danger); }
    .__ROOT_CLASS__ .im-level-row.bad .im-level-bar > i { background: var(--im-danger); }
    .__ROOT_CLASS__ .im-level-veto {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--im-hover); border: 1px solid var(--im-border); border-radius: 8px;
      padding: 6px 10px; font-size: 12px; margin-top: 6px; color: var(--im-text-2);
    }
    .__ROOT_CLASS__ .im-level-veto b { font-variant-numeric: tabular-nums; color: var(--im-text); }
    .__ROOT_CLASS__ .im-level-veto.ok span { color: var(--im-accent); }
    .__ROOT_CLASS__ .im-level-veto.ok b { color: var(--im-accent); }
    .__ROOT_CLASS__ .im-level-veto.bad span,
    .__ROOT_CLASS__ .im-level-veto.bad b { color: var(--im-danger); }
    /* 说明与合规 */
    .__ROOT_CLASS__ .im-level-tip { color: var(--im-text-3); font-size: 11.5px; line-height: 1.5; margin-top: 2px; }
    .__ROOT_CLASS__ .im-level-note-box {
      background: var(--im-hover); border: 1px solid var(--im-border); border-radius: 8px;
      padding: 8px 10px;
    }
    .__ROOT_CLASS__ .im-level-note-box .im-level-tip { margin-top: 0; }
    .__ROOT_CLASS__ .im-level-max { color: var(--im-text-2); line-height: 1.6; padding: 6px 0 2px; }
    .__ROOT_CLASS__ .im-level-foot {
      margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--im-border);
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      font-size: 11px; color: var(--im-text-3);
    }
    .__ROOT_CLASS__ .im-level-foot a { color: var(--im-accent); text-decoration: none; white-space: nowrap; }
    .__ROOT_CLASS__ .im-level-foot a:hover { text-decoration: underline; }
`;
  const CSS_XHS_HOST = `
/* 小红书宿主：藏原生壳，信息流移入后台当数据源，聊天用 IM 自绘三栏面板 */
html.im-theme, html.im-theme body {
  overflow-x: hidden !important;
  overflow-y: auto !important;
  background: var(--im-chat-bg, #fff) !important;
  padding: 0 !important;
  margin: 0 !important;
  scrollbar-width: none;
}
html.im-theme::-webkit-scrollbar, html.im-theme body::-webkit-scrollbar { width: 0; height: 0; }

html.im-theme .im-chat-body {
  position: relative !important;
  display: flex !important;
  align-items: stretch !important;
  overflow: hidden !important;
  overscroll-behavior: contain !important;
}
html.im-theme .im-chat-body > .im-feed-col {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain !important;
}
html.im-theme .im-detail-body {
  overscroll-behavior: contain !important;
}

/* 彻底移除顶部冗余的伪装 Tab 条，保证纯正 IM 聊天窗外观 */
html.im-theme .im-chat-tabs {
  display: none !important;
}

/* —— 详情抽屉：中栏右侧覆盖层，展示完整图文与评论树 —— */
html.im-theme .im-detail-view {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  min-width: 160px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  background: var(--im-chat-bg, var(--im-bg, #fff));
  border-left: 1px solid var(--im-border, #e8e9eb);
  box-shadow: -4px 0 16px rgba(15, 23, 42, .08);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity .1s ease;
}
html.im-theme .im-detail-view.is-open {
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: auto !important;
}
html.im-theme .im-detail-gutter {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -5px;
  width: 10px;
  z-index: 31;
  cursor: col-resize;
}
html.im-theme .im-detail-gutter:hover {
  background: rgba(26, 135, 255, .12);
}
html.im-theme .im-detail-loading,
html.im-theme .im-detail-loadmore {
  margin: 10px 0 4px;
  padding: 8px 0 16px;
  font-size: 12.5px;
  color: var(--im-text-3, #8f959e);
  text-align: center;
}
html.im-theme .im-detail-head {
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 46px;
  padding: 0 12px;
  border-bottom: 1px solid var(--im-border, #e8e9eb);
  background: var(--im-chat-bg, var(--im-bg, #fff));
}
html.im-theme .im-detail-back {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: var(--im-text-2, #646a73);
  background: transparent;
  border: 0;
  cursor: pointer;
}
html.im-theme .im-detail-back:hover { background: var(--im-hover, #f5f6f7); color: var(--im-text, #1f2329); }
html.im-theme .im-detail-back svg { width: 18px; height: 18px; }
html.im-theme .im-detail-titles {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 4px;
}
html.im-theme .im-detail-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
  flex: none;
}
html.im-theme .im-detail-actions .im-icon-btn {
  width: 28px;
  height: 28px;
}
html.im-theme .im-detail-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--im-text, #1f2329);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
html.im-theme .im-detail-sub {
  font-size: 11.5px;
  color: var(--im-text-3, #8f959e);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
html.im-theme .im-detail-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: auto;
  padding: 4px 0 16px;
}
html.im-theme .im-detail-body .im-msg { margin-top: 6px; margin-bottom: 16px; }
html.im-theme .im-detail-body .im-msg.is-sub {
  margin-left: 36px;
  margin-top: 2px;
  margin-bottom: 8px;
}
html.im-theme .im-detail-body .im-msg.is-sub .im-msg-avatar {
  width: 22px !important;
  height: 22px !important;
}
html.im-theme .im-reply-quote {
  display: flex;
  gap: 6px;
  margin: 0 0 6px;
  padding: 6px 8px;
  border-left: 2px solid var(--im-accent, #3370ff);
  background: var(--im-hover, #f5f6f7);
  border-radius: 0 6px 6px 0;
  font-size: 12px;
  color: var(--im-text-2, #646a73);
}
html.im-theme .im-reply-quote-tag {
  flex: none;
  color: var(--im-accent, #3370ff);
  font-weight: 600;
}
html.im-theme .im-quote-name { font-weight: 600; margin-right: 4px; }

/* 详情卡片：主笔记卡片 */
html.im-theme .im-thread-pin {
  margin: 8px 14px 10px; padding: 12px;
  background: var(--im-card, #fff);
  border: 1px solid var(--im-border, #e8e9eb);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .04);
}
html.im-theme .im-thread-pin-head { display: flex; align-items: center; gap: 10px; }
html.im-theme .im-thread-pin-avatar {
  flex: none; width: 36px; height: 36px; border-radius: 50%; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 14px; font-weight: 600;
  cursor: pointer;
}
html.im-theme .im-thread-pin-name { cursor: pointer; }

/* 个人主页卡 */
html.im-theme .im-profile-card {
  background: var(--im-card, #fff);
  border: 1px solid var(--im-border, #e5e6eb);
  border-radius: 8px;
  padding: 16px 18px 12px;
  margin: 12px 16px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
html.im-theme .im-profile-head {
  display: flex;
  align-items: center;
  gap: 14px;
}
html.im-theme .im-profile-avatar {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
}
html.im-theme .im-profile-avatar img,
html.im-theme .im-profile-avatar .is-text-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
html.im-theme .im-profile-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
html.im-theme .im-profile-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--im-text, #1f2329);
}
html.im-theme .im-profile-sub {
  font-size: 12px;
  color: var(--im-text-3, #8f959e);
}
html.im-theme .im-profile-bio {
  margin-top: 4px;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--im-text-2, #646a73);
  white-space: pre-wrap;
  word-break: break-word;
}
html.im-theme .im-profile-stats {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--im-border, #e5e6eb);
}
html.im-theme .im-profile-stats .im-stat-chip {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
html.im-theme .im-profile-stats .im-stat-chip .v {
  font-size: 15px;
  font-weight: 600;
  color: var(--im-text, #1f2329);
}
html.im-theme .im-profile-stats .im-stat-chip .k {
  font-size: 12px;
  color: var(--im-text-3, #8f959e);
}
html.im-theme .im-profile-subbar {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--im-border, #e5e6eb);
}
html.im-theme .im-profile-tab-btn {
  cursor: pointer;
  padding: 4px 14px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid var(--im-border, #e5e6eb);
  background: var(--im-chip-bg, #f2f3f5);
  color: var(--im-text-2, #646a73);
  font-family: inherit;
  transition: all 0.15s;
}
html.im-theme .im-profile-tab-btn:hover {
  background: var(--im-hover, #e5e6eb);
}
html.im-theme .im-profile-tab-btn.active {
  background: var(--im-accent, #1a87ff);
  color: #fff;
  border-color: var(--im-accent, #1a87ff);
}

html.im-theme .im-thread-pin-avatar img { width: 100%; height: 100%; object-fit: cover; }
html.im-theme .im-thread-pin-names { min-width: 0; display: flex; flex-direction: column; }
html.im-theme .im-thread-pin-name { font-size: 14px; font-weight: 600; color: var(--im-text, #1f2329); }
html.im-theme .im-thread-pin-handle { font-size: 12px; color: var(--im-text-3, #8f959e); }
html.im-theme .im-thread-pin-body {
  margin-top: 10px; font-size: 14px; line-height: 1.55; color: var(--im-text, #1f2329);
  white-space: normal; word-break: break-word;
}

/* 详情卡片图片：紧凑小图九宫格附件排版（彻底告别大图，严防摸鱼穿帮） */
html.im-theme .im-thread-pin-photos {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
html.im-theme .im-thread-pin-photos img {
  width: 80px !important;
  height: 80px !important;
  max-width: 80px !important;
  max-height: 80px !important;
  object-fit: cover !important;
  border-radius: 6px;
  margin: 0 !important;
  display: block;
  cursor: zoom-in;
  border: 1px solid var(--im-border, rgba(0, 0, 0, .08));
  background: var(--im-hover, #f5f6f7);
  transition: transform .12s ease, opacity .12s ease;
}
html.im-theme .im-thread-pin-photos img:hover {
  opacity: .88;
  transform: scale(1.03);
}

/* 聊天消息流图片：紧凑 IM 缩略图模式 */
html.im-theme .im-msg-photos {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 270px;
}
html.im-theme .im-photo {
  position: relative;
  width: 76px;
  height: 76px;
  overflow: hidden;
  border-radius: 6px;
  background: var(--im-hover, #f5f6f7);
  border: 1px solid var(--im-border, rgba(0, 0, 0, .06));
}
html.im-theme .im-photo img {
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  object-fit: cover !important;
  display: block;
  cursor: zoom-in;
}
html.im-theme .im-photo img:hover {
  opacity: .88;
}
/* 单图：严控在 120px 小图方块内 */
html.im-theme .im-photos-1 {
  display: block;
  max-width: 120px;
}
html.im-theme .im-photos-1 .im-photo {
  width: 110px;
  height: 110px;
  max-width: 110px;
  max-height: 110px;
  border-radius: 8px;
}

/* 气泡及正文兜底内嵌图：严控尺寸 */
html.im-theme .im-msg-bubble img:not(.im-photo img),
html.im-theme .im-tw-body img {
  max-width: 110px !important;
  max-height: 110px !important;
  width: auto;
  height: auto;
  object-fit: cover !important;
  border-radius: 6px;
  margin-top: 4px;
  display: block;
  cursor: zoom-in;
}

/* 视频封面：缩略图卡片 */
html.im-theme .im-video {
  position: relative;
  max-width: 130px;
  max-height: 130px;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 6px;
  cursor: pointer;
}
html.im-theme .im-video img {
  width: 100% !important;
  height: 100% !important;
  max-width: 130px !important;
  max-height: 130px !important;
  object-fit: cover !important;
  display: block;
}

html.im-theme .im-thread-pin-actions {
  margin-top: 10px; padding-top: 10px;
  border-top: 1px solid var(--im-border, #e8e9eb);
  display: flex; align-items: center; gap: 22px;
}
html.im-theme .im-thread-pin-act {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--im-text-3, #8f959e);
  background: none; border: 0; cursor: pointer; padding: 2px 0;
}
html.im-theme .im-thread-pin-act:hover { color: var(--im-accent, #3370ff); }
html.im-theme .im-thread-pin-act svg { width: 16px; height: 16px; }
html.im-theme .im-thread-pin-act.is-liked { color: #f91880 !important; }
html.im-theme .im-thread-pin-act.is-retweeted { color: #00ba7c !important; }
html.im-theme .im-thread-pin-act.is-bookmarked { color: #1d9bf0 !important; }

/* 原生小红书根容器 #app：保留文档流与滚动计算，透明置于底层作为数据源 */
html.im-theme #app,
html.im-theme #global {
  position: relative !important;
  opacity: 0.01 !important;
  pointer-events: none !important;
  z-index: 0 !important;
  max-width: none !important;
  margin: 0 !important;
  border: 0 !important;
}

/* 原生详情 overlay：必须留在视口且不能 visibility:hidden，否则评论 IntersectionObserver 不触发、评论 DOM 永不渲染 */
html.im-theme #noteContainer,
html.im-theme .note-container,
html.im-theme .note-detail-mask {
  opacity: 0.01 !important;
  pointer-events: none !important;
  visibility: visible !important;
  position: fixed !important;
  left: 0 !important;
  top: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 1 !important;
}

/* 原生顶栏/侧栏：强制不接收点击（原生 header 常自带 pointer-events:auto，会盖住 IM 顶栏按钮） */
html.im-theme .header-container,
html.im-theme header.mask-paper,
html.im-theme .mask-paper,
html.im-theme .side-bar,
html.im-theme .channel-container,
html.im-theme .floating-btn,
html.im-theme .back-top,
html.im-theme .reds-popover,
html.im-theme .reds-mask,
html.im-theme .reds-modal {
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
}

/* 仅真正的登录/验证码弹窗穿透；不要把所有 reds-mask 抬到最顶层 */
html.im-theme :is(.login-container, .login-box, [class*="login-container"], .geetest_panel, .captcha-modal, .reds-alert-mask, .reds-alert-wrapper) {
  opacity: 1 !important;
  pointer-events: auto !important;
  z-index: 999999 !important;
  visibility: visible !important;
}

/* IM 界面层级锁定：置于顶层覆盖原生界面，并强制可点 */
html.im-theme .im-shell,
html.im-theme .im-rail,
html.im-theme .im-strip,
html.im-theme .im-list-panel,
html.im-theme .im-chat-panel,
html.im-theme .im-titlebar,
html.im-theme .xim-skin-menu {
  pointer-events: auto !important;
}
html.im-theme .im-shell { z-index: 8000 !important; }
html.im-theme .im-rail { z-index: 8500 !important; }
html.im-theme .im-strip { z-index: 8600 !important; }
html.im-theme .im-list-panel { z-index: 8700 !important; }
html.im-theme .im-chat-panel { z-index: 8800 !important; }
html.im-theme .im-titlebar { z-index: 9000 !important; }
html.im-theme .xim-skin-menu { z-index: 9500 !important; }
html.im-theme .im-lightbox { z-index: 99999 !important; }

/* 纯文本摸鱼模式：隐藏所有缩略图、封面图、画廊、消息图、评论图与视频封面 */
html.im-theme.im-hide-media .im-msg-thumb,
html.im-theme.im-hide-media .im-detail-gallery,
html.im-theme.im-hide-media .im-detail-video,
html.im-theme.im-hide-media .im-thread-pin-photos,
html.im-theme.im-hide-media .im-msg-photos,
html.im-theme.im-hide-media .im-photo,
html.im-theme.im-hide-media .im-video,
html.im-theme.im-hide-media .im-quote-video,
html.im-theme.im-hide-media .im-msg-bubble img,
html.im-theme.im-hide-media .im-tw-body img,
html.im-theme.im-hide-media .im-conv-avatar img,
html.im-theme.im-hide-media .im-msg-avatar img {
  display: none !important;
}

/* 头部当前用户头像（企微/飞书）：强制约束尺寸，防止头像图片溢出爆格 */
html.im-theme .im-rail-me,
html.im-theme .im-rail-me-ava {
  width: 36px !important;
  height: 36px !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
html.im-theme[data-xim-skin="wecom"] .im-rail-me,
html.im-theme[data-xim-skin="wecom"] .im-rail-me-ava {
  width: 34px !important;
  height: 34px !important;
  border-radius: 4px !important;
}

/* 飞书：正圆头像，图裁切填满 */
html.im-theme[data-xim-skin="feishu"] .im-msg-avatar,
html.im-theme[data-xim-skin="feishu"] .im-conv-avatar,
html.im-theme[data-xim-skin="feishu"] .im-chat-avatar,
html.im-theme[data-xim-skin="feishu"] .im-rail-avatar,
html.im-theme[data-xim-skin="feishu"] .im-dm-ava,
html.im-theme[data-xim-skin="feishu"] .im-rail-me,
html.im-theme[data-xim-skin="feishu"] .im-rail-me-ava,
html.im-theme[data-xim-skin="feishu"] .im-rail-me-img {
  border-radius: 50% !important;
  overflow: hidden !important;
}

html.im-theme .im-msg-avatar,
html.im-theme .im-msg-name { cursor: pointer; }
html.im-theme .im-msg-avatar img,
html.im-theme .im-conv-avatar img,
html.im-theme .im-chat-avatar img,
html.im-theme .im-rail-avatar img,
html.im-theme .im-rail-me-ava img,
html.im-theme .im-rail-me-img img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
  border-radius: inherit !important;
}

html.im-theme .im-conv-avatar.is-group {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 1px;
  padding: 0 !important;
  overflow: hidden;
  background: var(--im-line, #e8e9eb);
}

html.im-theme .im-conv-avatar.is-group img,
html.im-theme .im-conv-avatar.is-group > span {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  border-radius: 0 !important;
  display: block;
}

/* 个人主页头像 */
html.im-theme .im-rail-me-img {
  width: 26px !important;
  height: 26px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  background: var(--im-hover, #eef0f3) !important;
}
html.im-theme .im-me-btn { cursor: pointer; }
`;
  function interpolate(css, s) {
    return css.replace(/__ROOT_CLASS__/g, ROOT_CLASS).replace(/__DARK_CLASS__/g, DARK_CLASS).replace(/__LOCK_CLASS__/g, LOCK_CLASS).replace(/__RAIL_WIDTH__/g, String(s.railWidth)).replace(/__NAV2_WIDTH__/g, "0").replace(/__STRIP_WIDTH__/g, String(s.stripWidth || 0)).replace(/__LIST_WIDTH__/g, String(s.listWidth)).replace(/__TITLEBAR_HEIGHT__/g, String(s.titlebarHeight));
  }
  function skinCss() {
    const id = currentSkinId();
    const s = SKINS[id];
    let css;
    if (id === "feishu") css = CSS_FS + "\n" + CSS_CORE_EXTRA;
    else if (id === "wecom") css = CSS_WECOM + "\n" + CSS_CORE_EXTRA;
    else css = CSS_DD + "\n" + CSS_CORE_EXTRA;
    return interpolate(css, s) + "\n" + CSS_XHS_HOST;
  }
  const listeners = [];
  function onColorThemeChange(fn) {
    listeners.push(fn);
  }
  function getColorTheme() {
    try {
      return localStorage.getItem(COLOR_THEME_KEY) || "auto";
    } catch {
      return "auto";
    }
  }
  function setColorTheme(v) {
    try {
      localStorage.setItem(COLOR_THEME_KEY, v);
    } catch {
    }
    applyColorMode();
  }
  function toggleColorTheme() {
    const cur = getColorTheme();
    setColorTheme(cur === "auto" ? "dark" : cur === "dark" ? "light" : "auto");
  }
  function systemDark() {
    var _a;
    return ((_a = window.matchMedia) == null ? void 0 : _a.call(window, "(prefers-color-scheme: dark)").matches) ?? false;
  }
  function isDarkEffective() {
    const t = getColorTheme();
    if (t === "dark") return true;
    if (t === "light") return false;
    return systemDark();
  }
  function applyColorMode() {
    const html = document.documentElement;
    if (!html) return;
    html.classList.toggle(DARK_CLASS, isDarkEffective());
    html.setAttribute("data-xim-dark", isDarkEffective() ? "1" : "0");
    html.style.colorScheme = isDarkEffective() ? "dark" : "light";
    html.classList.add(ROOT_CLASS);
    for (const fn of listeners) fn();
  }
  let observer = null;
  let applying = false;
  function svgHref(skin) {
    const s = SKINS[skin] || SKINS.dingtalk;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${s.accent}"/><text x="32" y="42" text-anchor="middle" font-size="28" fill="#fff" font-family="sans-serif">${s.letter}</text></svg>`;
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }
  function makeFavicon() {
    const head = document.head;
    if (!head || applying) return;
    applying = true;
    try {
      const href = svgHref(currentSkinId());
      for (const icon of head.querySelectorAll("link[rel='icon'], link[rel~='icon']")) {
        if (icon.id && icon.id !== FAVICON_ID) icon.removeAttribute("id");
        if (icon.getAttribute("href") !== href) icon.setAttribute("href", href);
      }
      let link = document.getElementById(FAVICON_ID);
      if (!link) {
        link = document.createElement("link");
        link.id = FAVICON_ID;
        link.rel = "icon";
        link.type = "image/svg+xml";
        link.setAttribute("href", href);
        head.appendChild(link);
      } else if (link.getAttribute("href") !== href) {
        link.setAttribute("href", href);
      }
      if (!observer) {
        observer = new MutationObserver(() => {
          if (applying) return;
          if (document.getElementById(STYLE_ID)) makeFavicon();
        });
        observer.observe(head, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
      }
    } finally {
      applying = false;
    }
  }
  function removeFavicon() {
    var _a;
    observer == null ? void 0 : observer.disconnect();
    observer = null;
    (_a = document.getElementById(FAVICON_ID)) == null ? void 0 : _a.remove();
  }
  function isHideMedia() {
    try {
      return localStorage.getItem(HIDE_MEDIA_KEY) === "1";
    } catch {
      return false;
    }
  }
  function setHideMedia(on) {
    try {
      localStorage.setItem(HIDE_MEDIA_KEY, on ? "1" : "0");
    } catch {
    }
  }
  function isMaskAvatar() {
    try {
      return localStorage.getItem(MASK_AVATAR_KEY) === "1";
    } catch {
      return false;
    }
  }
  function setMaskAvatar(on) {
    try {
      localStorage.setItem(MASK_AVATAR_KEY, on ? "1" : "0");
    } catch {
    }
  }
  function isMaskTitle() {
    try {
      return localStorage.getItem(MASK_TITLE_KEY) === "1";
    } catch {
      return false;
    }
  }
  function setMaskTitle(on) {
    try {
      localStorage.setItem(MASK_TITLE_KEY, on ? "1" : "0");
    } catch {
    }
  }
  function getChatId() {
    try {
      return localStorage.getItem(CHAT_KEY) || "home";
    } catch {
      return "home";
    }
  }
  function setChatId(id) {
    try {
      localStorage.setItem(CHAT_KEY, id);
    } catch {
    }
  }
  function routeKind(pathname = location.pathname) {
    const p = pathname.replace(/\/$/, "") || "/";
    if (p === "/" || p === "/explore" || p.startsWith("/explore")) {
      if (/\/explore\/[a-f0-9]+/.test(p)) return "note";
      return "explore";
    }
    if (/\/user\/profile\/[^/]+\/[a-f0-9]{24}/i.test(p)) return "note";
    if (p.startsWith("/user/profile")) return "profile";
    if (p === "/following" || p.startsWith("/following")) return "following";
    if (p === "/search_result" || p.startsWith("/search_result")) return "search";
    if (p.startsWith("/channel")) return "channel";
    return "explore";
  }
  function chatIdFromRoute() {
    const kind = routeKind();
    if (kind === "explore") return "explore";
    if (kind === "following") return "following";
    if (kind === "search") return "search";
    if (kind === "profile") return "profile";
    return getChatId() || "explore";
  }
  function pinnedById(id) {
    return PINNED.find((c) => c.id === id) || PINNED[0];
  }
  function patchHistory(onChange) {
    for (const method of ["pushState", "replaceState"]) {
      const original = history[method];
      history[method] = function(...args) {
        const ret = original.apply(this, args);
        onChange();
        return ret;
      };
    }
    window.addEventListener("popstate", onChange);
  }
  function countIn(label) {
    if (!label) return "";
    const m = String(label).replace(/,/g, "").match(/(\d+(?:\.\d+)?[KkM万]?)/);
    return m ? m[1] : "";
  }
  function flagTrue(v) {
    if (v === true || v === 1 || v === "true" || v === "1") return true;
    return false;
  }
  function vueLiked(el) {
    let comp = el == null ? void 0 : el.__vueParentComponent;
    for (let i = 0; i < 16 && comp; i++) {
      const bags = [comp.props, comp.setupState, comp.ctx];
      for (const bag of bags) {
        if (!bag || typeof bag !== "object") continue;
        if ("liked" in bag || "isLiked" in bag) return flagTrue(bag.liked ?? bag.isLiked);
        const info = unwrap(bag.interactInfo);
        if (info && typeof info === "object" && "liked" in info) return flagTrue(info.liked);
      }
      comp = comp.parent;
    }
    return null;
  }
  function likeSpriteHref(el) {
    const use = el.querySelector("use");
    return ((use == null ? void 0 : use.getAttribute("href")) || (use == null ? void 0 : use.getAttribute("xlink:href")) || "").toLowerCase();
  }
  function likeFillRed(el) {
    const nodes = el.querySelectorAll("svg path, svg");
    for (const n of nodes) {
      const fill = `${n.getAttribute("fill") || ""} ${getComputedStyle(n).fill || ""}`.toLowerCase();
      if (/#ff2442|#ff2e4d|#ff2442ff|255,\s*36,\s*66|255,\s*46,\s*77/.test(fill)) return true;
    }
    return false;
  }
  function isLikeActive(el) {
    if (!el) return false;
    if (el.getAttribute("aria-pressed") === "true") return true;
    const href = likeSpriteHref(el);
    if (href) {
      if (/like_b|unlike|outline/.test(href)) return false;
      if (/like_f|#liked|#like$|#like_/.test(href) && !/like_b/.test(href)) return true;
    }
    const v = vueLiked(el);
    if (v !== null) return v;
    return likeFillRed(el);
  }
  function extractStat(btn) {
    if (!btn) return "";
    const label = btn.getAttribute("aria-label") || "";
    const mLabel = countIn(label);
    if (mLabel) return mLabel;
    const txt = (btn.innerText || btn.textContent || "").trim();
    return countIn(txt);
  }
  let _cachedMe = null;
  function readCachedMe() {
    if (_cachedMe) return _cachedMe;
    try {
      const raw = localStorage.getItem("xhs-im-me");
      if (raw) _cachedMe = JSON.parse(raw);
    } catch {
    }
    return _cachedMe;
  }
  function writeCachedMe(info) {
    if (!info) return;
    const prev = readCachedMe() || {};
    const avatar = info.avatar || prev.avatar || "";
    const name = info.name && info.name !== "我的小红书" && info.name !== "小红书用户" ? info.name : prev.name || info.name || "小红书用户";
    const path = info.path && info.path !== "/user/profile" ? info.path : prev.path || info.path || "/user/profile";
    const handle = info.handle && info.handle !== "me" ? info.handle : prev.handle || info.handle || "me";
    _cachedMe = {
      ...prev,
      ...info,
      avatar,
      name,
      path,
      handle,
      _t: Date.now()
    };
    try {
      localStorage.setItem("xhs-im-me", JSON.stringify(_cachedMe));
    } catch {
    }
  }
  function getInitialState() {
    try {
      const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      if (win.__INITIAL_STATE__) return win.__INITIAL_STATE__;
    } catch {
    }
    try {
      for (const s of document.scripts || []) {
        const txt = s.textContent || "";
        if (txt.includes("__INITIAL_STATE__")) {
          const m = txt.match(/__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});?\s*(?:<\/script>|window|\(function|\n|$)/);
          if (m) {
            try {
              const clean = m[1].replace(/:\s*undefined/g, ":null");
              return JSON.parse(clean);
            } catch {
            }
          }
        }
      }
    } catch {
    }
    return null;
  }
  function unwrap(value, depth = 0) {
    if (depth > 6 || value == null || typeof value !== "object") return value;
    if (Object.prototype.hasOwnProperty.call(value, "_rawValue")) {
      return unwrap(value._rawValue, depth + 1);
    }
    if (Object.prototype.hasOwnProperty.call(value, "value")) {
      const inner = value.value;
      if (inner == null || typeof inner !== "object" || !("deps" in inner)) {
        return unwrap(inner, depth + 1);
      }
    }
    return value;
  }
  function findVueRouter() {
    var _a, _b, _c, _d, _e, _f, _g;
    const seeds = [
      document.querySelector("#app"),
      document.querySelector("#global"),
      document.querySelector(".side-bar"),
      document.querySelector(".channel-list-content")
    ];
    for (const el of seeds) {
      const fromApp = (_c = (_b = (_a = el == null ? void 0 : el.__vue_app__) == null ? void 0 : _a.config) == null ? void 0 : _b.globalProperties) == null ? void 0 : _c.$router;
      if (fromApp && typeof fromApp.push === "function") return fromApp;
      let comp = el == null ? void 0 : el.__vueParentComponent;
      for (let i = 0; i < 24 && comp; i++) {
        const router = ((_f = (_e = (_d = comp.appContext) == null ? void 0 : _d.config) == null ? void 0 : _e.globalProperties) == null ? void 0 : _f.$router) || ((_g = comp.proxy) == null ? void 0 : _g.$router);
        if (router && typeof router.push === "function") return router;
        comp = comp.parent;
      }
    }
    return null;
  }
  function findDomAvatar() {
    var _a;
    const selectors = [
      ".side-bar .user img",
      ".side-bar-component.user img",
      ".side-bar a[href*='/user/profile/'] img",
      "a.link-wrapper[href*='/user/profile/'] img",
      ".user-avatar img",
      "#userPageContainer .avatar img.user-image",
      ".user-page .user-info img",
      ".side-bar img[src*='avatar']",
      "img.reds-img[src*='avatar']",
      "img[src*='sns-avatar']"
    ];
    for (const sel of selectors) {
      for (const img of document.querySelectorAll(sel)) {
        if (img.closest(".im-shell, .im-rail, .im-list-panel, .im-chat-panel, .im-titlebar")) continue;
        const src = img.currentSrc || img.src || img.getAttribute("src") || ((_a = img.dataset) == null ? void 0 : _a.src) || "";
        if (src && !src.startsWith("data:") && (src.includes("xhscdn.com") || src.includes("avatar") || src.includes("http"))) {
          return src;
        }
      }
    }
    return "";
  }
  function findDomProfileLink() {
    const selectors = [
      ".side-bar a[href*='/user/profile/']",
      ".side-bar-component a[href*='/user/profile/']",
      "a.link-wrapper[href*='/user/profile/']",
      "a[href*='/user/profile/']"
    ];
    for (const sel of selectors) {
      for (const a of document.querySelectorAll(sel)) {
        if (a.closest(".im-shell, .im-rail, .im-list-panel, .im-chat-panel, .im-titlebar")) continue;
        const href = a.getAttribute("href") || "";
        const m = href.match(/\/user\/profile\/([a-f0-9]{16,32})/i);
        if (m) return { href, userId: m[1] };
      }
    }
    return null;
  }
  function findDomUserName() {
    var _a;
    const selectors = [
      "#userPageContainer .user-nickname .user-name",
      ".user-page .basic-info .user-name",
      ".side-bar .user-name",
      ".side-bar a[href*='/user/profile/'] .name"
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && !el.closest(".im-shell, .im-rail, .im-list-panel, .im-chat-panel, .im-titlebar")) {
        const txt = (_a = el.textContent) == null ? void 0 : _a.trim();
        if (txt && txt !== "我" && txt !== "小红书用户") return txt;
      }
    }
    return "";
  }
  function resolveMe() {
    var _a;
    const cached = readCachedMe() || {};
    let stateImg = "";
    let stateNick = "";
    let stateId = "";
    try {
      const state = getInitialState();
      if (state) {
        const user = unwrap(state.user) || unwrap(state.loginUser) || {};
        const info = unwrap(user.userInfo) || unwrap((_a = user.userPageData) == null ? void 0 : _a.basicInfo) || unwrap(state.userInfo) || {};
        stateId = unwrap(info.userId) || unwrap(user.userId) || "";
        stateNick = unwrap(info.nickname) || unwrap(info.nickName) || unwrap(user.nickname) || "";
        stateImg = unwrap(info.image) || unwrap(info.avatar) || unwrap(info.avatarImage) || unwrap(user.image) || unwrap(user.avatar) || "";
      }
    } catch {
    }
    const domImg = findDomAvatar();
    const domLink = findDomProfileLink();
    const domName = findDomUserName();
    const finalAvatar = domImg || stateImg || (cached.avatar && cached.avatar.length > 5 ? cached.avatar : "");
    const finalUserId = (domLink == null ? void 0 : domLink.userId) || stateId || (cached.handle !== "me" ? cached.handle : "");
    const finalName = domName || (stateNick && stateNick !== "小红书用户" ? stateNick : "") || (cached.name && cached.name !== "小红书用户" && cached.name !== "我的小红书" ? cached.name : "小红书用户");
    const finalPath = (domLink == null ? void 0 : domLink.href) || (finalUserId ? `/user/profile/${finalUserId}` : cached.path || "/user/profile");
    const me = {
      path: finalPath,
      avatar: finalAvatar,
      name: finalName,
      handle: finalUserId || "me"
    };
    if (finalAvatar || finalUserId && finalUserId !== "me") {
      writeCachedMe(me);
    }
    return me;
  }
  function nativeProfilePath() {
    const me = resolveMe();
    return (me == null ? void 0 : me.path) || "/user/profile";
  }
  function nativeAvatarSrc() {
    const me = resolveMe();
    return (me == null ? void 0 : me.avatar) || "";
  }
  function nativeDisplayName() {
    const me = resolveMe();
    return (me == null ? void 0 : me.name) || "小红书用户";
  }
  function badgeCount(href) {
    try {
      const link = document.querySelector(`.side-bar a[href*="${href}"]`);
      if (!link) return 0;
      const badge = link.querySelector(".count, .badge, .bubble");
      if (!badge) return 0;
      const n = parseInt(badge.textContent.trim(), 10);
      return isNaN(n) ? 0 : n;
    } catch {
      return 0;
    }
  }
  function clickHomeTab(tab) {
    if (tab === "following") {
      navigateX("/following");
    } else {
      navigateX("/explore");
    }
  }
  function pageWindow() {
    try {
      return typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    } catch {
      return window;
    }
  }
  function dispatchClick(el) {
    if (!el) return;
    const opts = { bubbles: true, cancelable: true, view: pageWindow() };
    const doc = el.ownerDocument || document;
    const w = doc.defaultView || pageWindow();
    el.dispatchEvent(new w.MouseEvent("mousedown", opts));
    el.dispatchEvent(new w.MouseEvent("mouseup", opts));
    el.dispatchEvent(new w.MouseEvent("click", opts));
  }
  function pickProfileHref(root) {
    var _a, _b, _c;
    if (!root) return "";
    if ((_a = root.matches) == null ? void 0 : _a.call(root, 'a[href*="/user/profile/"]')) return root.getAttribute("href") || "";
    return ((_c = (_b = root.querySelector) == null ? void 0 : _b.call(root, 'a[href*="/user/profile/"]')) == null ? void 0 : _c.getAttribute("href")) || "";
  }
  function openUserProfile(href, userId) {
    let id = String(userId || "").trim();
    if (!id) {
      const m = String(href || "").match(/(?:user\/profile\/)?([0-9a-f]{16,32})/i);
      id = m ? m[1] : "";
    }
    if (!id) return false;
    let token = "";
    try {
      const u = new URL(href || "", location.origin);
      token = u.searchParams.get("xsec_token") || "";
    } catch {
    }
    const dest = `/user/profile/${id}${token ? `?xsec_token=${encodeURIComponent(token)}&xsec_source=pc_feed` : ""}`;
    if (location.pathname === `/user/profile/${id}`) return true;
    const router = findVueRouter();
    if (router && typeof router.push === "function") {
      try {
        router.push(dest);
        return true;
      } catch {
      }
    }
    try {
      history.pushState({}, "", dest);
      pageWindow().dispatchEvent(new PopStateEvent("popstate"));
      return true;
    } catch {
    }
    location.href = dest;
    return true;
  }
  function navigateX(path) {
    const dest = path.startsWith("/") ? path : `/${path}`;
    if (document.documentElement.classList.contains("im-theme")) {
      if (dest !== location.pathname + location.search) {
        const selectors = [
          `.side-bar a[href*="${dest}"], a[href*="${dest}"]`,
          `.channel-container a[href*="${dest}"]`,
          `a[href="${dest}"]`
        ];
        let anchor2 = null;
        for (const sel of selectors) {
          anchor2 = document.querySelector(sel);
          if (anchor2 && !anchor2.closest(".im-shell, .im-rail, .im-list-panel, .im-chat-panel, .im-titlebar")) break;
          anchor2 = null;
        }
        if (anchor2) {
          dispatchClick(anchor2);
          return;
        }
        const router = findVueRouter();
        if (router && typeof router.push === "function") {
          try {
            router.push(dest);
            return;
          } catch {
          }
        }
        try {
          history.pushState({}, "", dest);
          pageWindow().dispatchEvent(new PopStateEvent("popstate"));
        } catch {
        }
        return;
      }
      try {
        if (location.pathname + location.search !== dest) history.replaceState(null, "", dest);
      } catch {
      }
      return;
    }
    const anchor = document.querySelector(`.side-bar a[href*="${dest}"]`);
    if (anchor) {
      dispatchClick(anchor);
      return;
    }
    try {
      history.replaceState(null, "", dest);
    } catch {
    }
  }
  function clickNativeLogin() {
    const loginBtn = document.querySelector("#login-btn") || document.querySelector(".login-btn button") || document.querySelector(".login-btn") || document.querySelector(".side-bar .login-btn");
    if (loginBtn) {
      loginBtn.click();
      return true;
    }
    return false;
  }
  function timeFromNoteId(id) {
    if (!id || typeof id !== "string") return null;
    const m = id.match(/([0-9a-f]{24})/i);
    if (!m) return null;
    const hex = m[1].slice(0, 8);
    const sec = parseInt(hex, 16);
    if (isNaN(sec) || sec < 1514764800 || sec > 2147483647) return null;
    return new Date(sec * 1e3);
  }
  function fmtStateTime(ts) {
    if (!ts) return "";
    const d = ts instanceof Date ? ts : new Date(typeof ts === "number" && ts < 1e11 ? ts * 1e3 : ts);
    if (Number.isNaN(d.getTime())) return "";
    const now = /* @__PURE__ */ new Date();
    const diffSec = Math.floor((now - d) / 1e3);
    if (diffSec >= 0 && diffSec < 60) return "刚刚";
    if (diffSec >= 60 && diffSec < 3600) return `${Math.floor(diffSec / 60)}分钟前`;
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    if (d.toDateString() === now.toDateString()) return `${hh}:${mm}`;
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return `昨天 ${hh}:${mm}`;
    const qst = new Date(now);
    qst.setDate(now.getDate() - 2);
    if (d.toDateString() === qst.toDateString()) return `前天 ${hh}:${mm}`;
    if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日`;
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }
  const _vCardCache = /* @__PURE__ */ new WeakMap();
  function vueCardData(el) {
    var _a, _b;
    const nid = ((_a = el == null ? void 0 : el.dataset) == null ? void 0 : _a.noteId) || ((_b = el == null ? void 0 : el.getAttribute) == null ? void 0 : _b.call(el, "data-note-id")) || "";
    const hit = _vCardCache.get(el);
    if (hit && hit.nid === nid) return hit.data;
    let comp = el == null ? void 0 : el.__vueParentComponent;
    let found = null;
    for (let i = 0; i < 16 && comp; i++) {
      const bags = [comp.props, comp.setupState, comp.ctx];
      for (const bag of bags) {
        if (!bag || typeof bag !== "object") continue;
        const note = unwrap(bag.note) || unwrap(bag.item) || unwrap(bag.noteCard) || unwrap(bag.card);
        if (note && typeof note === "object") {
          found = note;
          break;
        }
        if (("title" in bag || "displayTitle" in bag) && ("user" in bag || "author" in bag)) {
          found = bag;
          break;
        }
      }
      if (found) break;
      comp = comp.parent;
    }
    if (found) _vCardCache.set(el, { nid, data: found });
    return found;
  }
  function lookupNoteTime(noteId) {
    var _a, _b, _c;
    if (!noteId) return "";
    const fromId = timeFromNoteId(noteId);
    if (fromId) return fmtStateTime(fromId);
    try {
      const state = getInitialState();
      if (!state) return "";
      const note = unwrap((_c = (_b = (_a = state.note) == null ? void 0 : _a.noteDetailMap) == null ? void 0 : _b[noteId]) == null ? void 0 : _c.note);
      if (note) {
        const t = unwrap(note.time) || unwrap(note.lastUpdateTime) || unwrap(note.publishTime);
        const s = fmtStateTime(t);
        if (s) return s;
      }
      const scan = (node, depth = 0) => {
        if (!node || typeof node !== "object" || depth > 4) return "";
        const nid = unwrap(node.noteId) || unwrap(node.id);
        if (nid && String(nid) === String(noteId)) {
          const t = unwrap(node.time) || unwrap(node.lastUpdateTime) || unwrap(node.publishTime);
          const s = fmtStateTime(t);
          if (s) return s;
        }
        for (const v of Object.values(node)) {
          const r = scan(v, depth + 1);
          if (r) return r;
        }
        return "";
      };
      return scan(state);
    } catch {
    }
    return "";
  }
  function extractTweet(article) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
    if (!article) return null;
    const isNote = ((_a = article.classList) == null ? void 0 : _a.contains("note-item")) || article.closest(".note-item");
    const el = isNote ? ((_b = article.classList) == null ? void 0 : _b.contains("note-item")) ? article : article.closest(".note-item") : article;
    const tokenLink = el.querySelector("a[href*='xsec_token']") || el.querySelector("a.cover[href*='/explore/'], a.cover") || el.querySelector(".footer a.title") || el.querySelector("a:not([style*='display: none'])") || el.querySelector("a");
    let href = (tokenLink == null ? void 0 : tokenLink.getAttribute("href")) || "";
    const vData = vueCardData(el);
    const idFromDataset = ((_c = el.dataset) == null ? void 0 : _c.noteId) || ((_d = el.dataset) == null ? void 0 : _d.id) || el.getAttribute("data-note-id") || unwrap(vData == null ? void 0 : vData.id) || unwrap(vData == null ? void 0 : vData.noteId);
    const idMatch = href.match(/\/(?:explore|profile\/[^/]+)\/([a-f0-9]{24}|[a-f0-9]+)/i) || href.match(/([a-f0-9]{24})/i);
    const id = idFromDataset || (idMatch ? idMatch[1] : href ? href.replace(/[^\w]/g, "") : String(Math.random()));
    if (href && !href.includes("xsec_token")) {
      const token = unwrap(vData == null ? void 0 : vData.xsecToken) || unwrap((_e = vData == null ? void 0 : vData.user) == null ? void 0 : _e.xsecToken) || "";
      if (token) {
        href = `${href}${href.includes("?") ? "&" : "?"}xsec_token=${encodeURIComponent(token)}&xsec_source=pc_feed`;
      }
    }
    const titleEl = el.querySelector(".title, .footer .title, .name, [class*='title']");
    const domTitle = ((titleEl == null ? void 0 : titleEl.innerText) || (titleEl == null ? void 0 : titleEl.textContent) || "").trim();
    const vueTitle = (unwrap(vData == null ? void 0 : vData.displayTitle) || unwrap(vData == null ? void 0 : vData.title) || "").trim();
    const title = domTitle || vueTitle;
    const authorLink = el.querySelector(".author-wrapper, .author, .footer .author, [class*='author']");
    const authorNameEl = (authorLink == null ? void 0 : authorLink.querySelector(".name, .author-name")) || authorLink;
    const domAuthorName = ((authorNameEl == null ? void 0 : authorNameEl.innerText) || (authorNameEl == null ? void 0 : authorNameEl.textContent) || "").trim();
    const vueAuthorName = unwrap((_f = vData == null ? void 0 : vData.user) == null ? void 0 : _f.nickname) || unwrap((_g = vData == null ? void 0 : vData.user) == null ? void 0 : _g.nickName) || unwrap((_h = vData == null ? void 0 : vData.author) == null ? void 0 : _h.name) || "";
    const authorName = domAuthorName || vueAuthorName || "小红书薯友";
    const profileHref = pickProfileHref(el) || pickProfileHref(authorLink);
    const authorHandle = ((_i = profileHref.match(/\/user\/profile\/([^/?#]+)/)) == null ? void 0 : _i[1]) || String(unwrap((_j = vData == null ? void 0 : vData.user) == null ? void 0 : _j.userId) || authorName);
    const authorImg = (authorLink == null ? void 0 : authorLink.querySelector("img")) || el.querySelector(".avatar-container img, .author-avatar, .author-wrapper img, .author img, .avatar img, img[src*='avatar'], img[src*='sns-avatar']");
    const domAvatar = (authorImg == null ? void 0 : authorImg.currentSrc) || (authorImg == null ? void 0 : authorImg.src) || (authorImg == null ? void 0 : authorImg.getAttribute("src")) || ((_k = authorImg == null ? void 0 : authorImg.dataset) == null ? void 0 : _k.src) || "";
    const vueAvatar = unwrap((_l = vData == null ? void 0 : vData.user) == null ? void 0 : _l.avatar) || unwrap((_m = vData == null ? void 0 : vData.user) == null ? void 0 : _m.image) || unwrap((_n = vData == null ? void 0 : vData.author) == null ? void 0 : _n.avatar) || "";
    const authorAvatar = domAvatar || vueAvatar || "";
    const coverImg = el.querySelector(".cover img, .cover-inner img, img");
    const domCover = (coverImg == null ? void 0 : coverImg.currentSrc) || (coverImg == null ? void 0 : coverImg.src) || (coverImg == null ? void 0 : coverImg.getAttribute("src")) || ((_o = coverImg == null ? void 0 : coverImg.dataset) == null ? void 0 : _o.src) || "";
    const vueCover = unwrap((_p = vData == null ? void 0 : vData.cover) == null ? void 0 : _p.urlDefault) || unwrap((_q = vData == null ? void 0 : vData.cover) == null ? void 0 : _q.url) || "";
    const coverSrc = domCover || vueCover || "";
    const isVideo = !!el.querySelector(".play-icon, video") || unwrap(vData == null ? void 0 : vData.type) === "video";
    const likeEl = el.querySelector(".like-wrapper, .interactions, .like");
    const countEl = (likeEl == null ? void 0 : likeEl.querySelector(".count")) || likeEl;
    const likeCount = countIn((countEl == null ? void 0 : countEl.textContent) || "") || "0";
    const isLiked = isLikeActive(likeEl);
    const dateObj = timeFromNoteId(id);
    const noteTime = (((_r = el.querySelector(".time, .date, time, .footer .time, [class*='date']")) == null ? void 0 : _r.textContent) || "").replace(/\s+/g, " ").trim().slice(0, 20) || (dateObj ? fmtStateTime(dateObj) : "") || lookupNoteTime(id);
    return {
      id,
      href: href || (id ? `/explore/${id}` : ""),
      name: authorName,
      handle: authorHandle,
      profileHref,
      avatar: authorAvatar,
      text: title || "分享了一篇笔记",
      photos: coverSrc ? [coverSrc] : [],
      images: coverSrc ? [coverSrc] : [],
      video: isVideo ? { poster: coverSrc, src: "" } : null,
      likeCount,
      replyCount: "0",
      rtCount: "0",
      liked: isLiked,
      retweeted: false,
      bookmarked: false,
      author: {
        name: authorName,
        handle: authorHandle,
        avatar: authorAvatar,
        verified: false
      },
      datetime: dateObj ? dateObj.toISOString() : "",
      time: noteTime || "刚刚",
      timeIso: dateObj ? dateObj.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      stats: {
        reply: "0",
        rt: "0",
        like: likeCount,
        liked: isLiked,
        retweeted: false,
        bookmarked: false
      },
      article: el,
      source: "note"
    };
  }
  function findTweetArticle(tweetId) {
    if (!tweetId) return null;
    const byData = document.querySelector(`[data-note-id="${tweetId}"], [data-id="${tweetId}"]`);
    if (byData) return byData.closest(".note-item") || byData;
    const link = document.querySelector(`a[href*="/explore/${tweetId}"], a[href*="${tweetId}"]`);
    if (link) return link.closest(".note-item") || link;
    return null;
  }
  function kickNativeVideo(article) {
    const v = article == null ? void 0 : article.querySelector("video");
    if (v) {
      v.muted = true;
      v.pause();
    }
  }
  function extractProfilePage() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
    const container = document.querySelector("#userPageContainer, .user-page, .profile-container");
    if (!container) return null;
    const handle = ((_a = location.pathname.match(/\/user\/profile\/([^/?#]+)/)) == null ? void 0 : _a[1]) || "";
    const nameEl = container.querySelector(".user-nickname .user-name, .basic-info .user-name, .user-name, .name");
    const avatarEl = container.querySelector(".user-info img.user-image, .avatar img.user-image, .avatar img, .user-avatar img");
    const redIdEl = container.querySelector(".user-redId, [class*='redId']");
    const ipEl = container.querySelector(".user-IP, [class*='user-IP'], [class*='user-ip']");
    const descEl = container.querySelector(".user-desc, .desc");
    const genderUse = ((_b = container.querySelector(".user-tags .gender use, .gender use")) == null ? void 0 : _b.getAttribute("href")) || ((_c = container.querySelector(".user-tags .gender use, .gender use")) == null ? void 0 : _c.getAttribute("xlink:href")) || "";
    const gender = genderUse.includes("female") ? "女" : genderUse.includes("male") ? "男" : "";
    let following = "";
    let followers = "";
    let likesAndCollects = "";
    const interactionDivs = container.querySelectorAll(".user-interactions > div, .data-info > div");
    for (const div of interactionDivs) {
      const count = ((_e = (_d = div.querySelector(".count")) == null ? void 0 : _d.textContent) == null ? void 0 : _e.trim()) || "";
      const label = ((_g = (_f = div.querySelector(".shows, .label, [class*='show']")) == null ? void 0 : _f.textContent) == null ? void 0 : _g.trim()) || "";
      if (label.includes("关注")) following = count;
      else if (label.includes("粉丝")) followers = count;
      else if (label.includes("获赞") || label.includes("赞") || label.includes("收藏")) likesAndCollects = count;
    }
    const tabs = [];
    const tabEls = container.querySelectorAll(".xhs-user-page-primary-tabs .reds-tab-item, .user-page-sticky .reds-tab-item");
    for (let i = 0; i < tabEls.length; i++) {
      const el = tabEls[i];
      const span = el.querySelector("span:last-child") || el;
      const label = ((_h = span.textContent) == null ? void 0 : _h.trim()) || "";
      if (!label) continue;
      const active = el.classList.contains("active");
      tabs.push({ label, active, index: i });
    }
    const emptyEl = container.querySelector(".tab-content-item:not([style*='height: 0px']) .empty-text, .empty-container .empty-text");
    const emptyText = ((_i = emptyEl == null ? void 0 : emptyEl.textContent) == null ? void 0 : _i.trim()) || "";
    return {
      handle,
      name: ((_j = nameEl == null ? void 0 : nameEl.textContent) == null ? void 0 : _j.trim()) || "用户主页",
      avatar: (avatarEl == null ? void 0 : avatarEl.getAttribute("src")) || "",
      redId: ((_k = redIdEl == null ? void 0 : redIdEl.textContent) == null ? void 0 : _k.trim()) || "",
      ipLoc: ((_l = ipEl == null ? void 0 : ipEl.textContent) == null ? void 0 : _l.trim()) || "",
      desc: ((_m = descEl == null ? void 0 : descEl.textContent) == null ? void 0 : _m.trim()) || "",
      bio: ((_n = descEl == null ? void 0 : descEl.textContent) == null ? void 0 : _n.trim()) || "",
      gender,
      following,
      followers,
      likesAndCollects,
      notes: following || "",
      tabs,
      emptyText
    };
  }
  function allTweetArticles() {
    const items = document.querySelectorAll("#userPostedFeeds .note-item, #exploreFeeds .note-item, .feeds-container .note-item, section.note-item, .note-item");
    if (items && items.length) return Array.from(items);
    const scope = document.querySelector("#userPageContainer, #userPostedFeeds, #exploreFeeds, .feeds-container, .search-layout__main, .feeds-page, .main-content") || document;
    return Array.from(scope.querySelectorAll(".note-item"));
  }
  function primaryColumn() {
    return document.querySelector("#exploreFeeds, .feeds-container, .search-layout__main, .main-content");
  }
  function findScrollableAncestor(el) {
    let node = el == null ? void 0 : el.parentElement;
    while (node && node !== document.body) {
      const cs = getComputedStyle(node);
      if (/(auto|scroll)/.test(cs.overflowY) && node.scrollHeight > node.clientHeight + 50) return node;
      node = node.parentElement;
    }
    return null;
  }
  function loadMoreFeed() {
    const now = Date.now();
    if (now - (loadMoreFeed._t || 0) < 400) return;
    loadMoreFeed._t = now;
    const html = document.documentElement;
    html.classList.add("xim-feed-loading");
    const loading = document.querySelector(".feeds-loading, #feeds-replace-loading, [class*='feeds-loading']");
    const scroller = findScrollableAncestor(loading) || findScrollableAncestor(primaryColumn());
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight;
      try {
        scroller.dispatchEvent(new Event("scroll", { bubbles: true }));
      } catch {
      }
    }
    const se = document.scrollingElement || document.documentElement;
    if (se) {
      try {
        se.scrollTop = se.scrollHeight;
      } catch {
      }
    }
    document.dispatchEvent(new Event("scroll"));
    window.clearTimeout(loadMoreFeed._unlock);
    loadMoreFeed._unlock = window.setTimeout(() => html.classList.remove("xim-feed-loading"), 500);
  }
  function refreshHomeFeed() {
    window.scrollTo(0, 0);
    const reloadBtn = document.querySelector(".floating-btn-sets .reload, .reload");
    if (reloadBtn) {
      dispatchClick(reloadBtn);
      return;
    }
    const homeLink = document.querySelector("#explore-guide-refresh a") || document.querySelector(".side-bar a[href*='homefeed_recommend']") || document.querySelector('.side-bar a[href*="/explore"]');
    if (homeLink) dispatchClick(homeLink);
  }
  function stampOf(raw) {
    const ts = unwrap(raw.createTime) || unwrap(raw.time);
    let time = "刚刚";
    if (ts) {
      const d = new Date(typeof ts === "number" && ts < 1e11 ? ts * 1e3 : ts);
      if (!Number.isNaN(d.getTime())) {
        const now = /* @__PURE__ */ new Date();
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        if (d.toDateString() === now.toDateString()) time = `${hh}:${mm}`;
        else {
          const yest = new Date(now);
          yest.setDate(now.getDate() - 1);
          time = d.toDateString() === yest.toDateString() ? `昨天 ${hh}:${mm}` : `${d.getMonth() + 1}月${d.getDate()}日`;
        }
      }
    }
    const loc = unwrap(raw.ipLocation) || unwrap(raw.ip) || "";
    return loc ? `${time} · IP:${loc}` : time;
  }
  function commentFromRaw(raw, repliedTo) {
    var _a, _b;
    raw = unwrap(raw);
    if (!raw || typeof raw !== "object") return null;
    const user = unwrap(raw.userInfo || raw.user) || {};
    const name = unwrap(user.nickname) || unwrap(user.nickName) || "热心薯友";
    const text = String(unwrap(raw.content) || unwrap(raw.noteText) || "").trim();
    const pics = unwrap(raw.pictures) || unwrap(raw.pictureList) || [];
    const photos = (Array.isArray(pics) ? pics : []).map((p) => typeof p === "string" ? p : (p == null ? void 0 : p.url) || (p == null ? void 0 : p.urlDefault) || "").filter(Boolean);
    if (!text && !photos.length) return null;
    const uid = String(unwrap(user.userId) || "");
    const target = repliedTo || unwrap((_b = (_a = raw.targetComment) == null ? void 0 : _a.userInfo) == null ? void 0 : _b.nickname) || "";
    return {
      id: String(unwrap(raw.id) || unwrap(raw.commentId) || Math.random()),
      name,
      handle: uid || name,
      profileHref: uid ? `/user/profile/${uid}` : "",
      avatar: unwrap(user.image) || unwrap(user.avatar) || "",
      text,
      time: stampOf(raw),
      likeCount: String(unwrap(raw.likeCount) || unwrap(raw.likedCount) || ""),
      liked: flagTrue(unwrap(raw.liked)),
      photos,
      repliedTo: target,
      replyTo: target,
      replyRef: target ? { handle: target, href: "", snippet: "" } : null,
      isSub: !!target,
      href: ""
    };
  }
  function sleep$1(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function safeExtract(data, path, defaultValue = "") {
    if (!data) return defaultValue;
    const keys = path.split(".");
    let curr = data;
    for (const k of keys) {
      if (curr == null) return defaultValue;
      curr = unwrap(curr[k]);
    }
    return curr ?? defaultValue;
  }
  function formatNoteTime(ts) {
    if (!ts) return "刚刚";
    const d = ts instanceof Date ? ts : new Date(typeof ts === "number" && ts < 1e11 ? ts * 1e3 : ts);
    if (Number.isNaN(d.getTime())) return "刚刚";
    const now = /* @__PURE__ */ new Date();
    const diffSec = Math.floor((now - d) / 1e3);
    if (diffSec >= 0 && diffSec < 60) return "刚刚";
    if (diffSec >= 60 && diffSec < 3600) return `${Math.floor(diffSec / 60)}分钟前`;
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    if (d.toDateString() === now.toDateString()) return `${hh}:${mm}`;
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return `昨天 ${hh}:${mm}`;
    const qst = new Date(now);
    qst.setDate(now.getDate() - 2);
    if (d.toDateString() === qst.toDateString()) return `前天 ${hh}:${mm}`;
    if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日`;
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }
  function pinFromNoteObject(rawNote, noteId) {
    if (!rawNote) return null;
    const note = unwrap(rawNote.note) || unwrap(rawNote.noteCard) || unwrap(rawNote.data) || rawNote;
    const id = noteId || safeExtract(note, "noteId") || safeExtract(note, "id") || "";
    const title = (safeExtract(note, "title") || safeExtract(note, "displayTitle") || "").trim();
    const desc = (safeExtract(note, "desc") || "").trim();
    const fullText = [title, desc].filter(Boolean).join("\n\n") || title || "分享了一篇笔记";
    const authorName = safeExtract(note, "user.nickname") || safeExtract(note, "user.nickName") || safeExtract(note, "author.nickname") || safeExtract(note, "author.name") || "小红书薯友";
    const authorAvatar = safeExtract(note, "user.avatar") || safeExtract(note, "user.image") || safeExtract(note, "author.avatar") || safeExtract(note, "author.image") || "";
    const authorHandle = String(safeExtract(note, "user.userId") || safeExtract(note, "author.userId") || authorName);
    const xsec = safeExtract(note, "user.xsecToken") || safeExtract(note, "xsecToken") || "";
    const profileHref = authorHandle && /^[0-9a-f]+$/i.test(authorHandle) ? `/user/profile/${authorHandle}${xsec ? `?xsec_token=${encodeURIComponent(xsec)}&xsec_source=pc_feed` : ""}` : "";
    const rawImages = safeExtract(note, "imageList", []) || safeExtract(note, "images", []);
    let photos = (Array.isArray(rawImages) ? rawImages : []).map((img) => {
      var _a, _b;
      return typeof img === "string" ? img : img.urlDefault || img.url || ((_b = (_a = img.infoList) == null ? void 0 : _a[0]) == null ? void 0 : _b.url) || "";
    }).filter(Boolean);
    if (!photos.length) {
      const cover = safeExtract(note, "cover.urlDefault") || safeExtract(note, "cover.url");
      if (cover) photos = [cover];
    }
    const isVideo = safeExtract(note, "type") === "video";
    let video = null;
    if (isVideo) {
      const videoSrc = safeExtract(note, "video.media.stream.h264.0.masterUrl") || safeExtract(note, "video.consumer.originVideoKey") || "";
      video = {
        src: videoSrc,
        poster: photos[0] || safeExtract(note, "cover.urlDefault") || ""
      };
    }
    const likeCount = String(safeExtract(note, "interactInfo.likedCount", "0"));
    const collectCount = String(safeExtract(note, "interactInfo.collectedCount", "0"));
    const replyCount = String(safeExtract(note, "interactInfo.commentCount", "0"));
    const isLiked = flagTrue(safeExtract(note, "interactInfo.liked", false));
    const isCollected = Boolean(safeExtract(note, "interactInfo.collected", false));
    const rawTs = safeExtract(note, "time") || safeExtract(note, "lastUpdateTime") || safeExtract(note, "createTime");
    const dateObj = rawTs ? new Date(typeof rawTs === "number" && rawTs < 1e11 ? rawTs * 1e3 : rawTs) : timeFromNoteId(id);
    const noteTime = dateObj ? formatNoteTime(dateObj) : "刚刚";
    return {
      id,
      name: authorName,
      handle: authorHandle,
      profileHref,
      avatar: authorAvatar,
      text: fullText,
      photos,
      images: photos,
      video,
      time: noteTime,
      datetime: dateObj ? dateObj.toISOString() : "",
      timeIso: dateObj ? dateObj.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      likeCount: likeCount !== "0" ? likeCount : "",
      rtCount: collectCount !== "0" ? collectCount : "",
      replyCount: replyCount !== "0" ? replyCount : "",
      liked: isLiked,
      retweeted: isCollected,
      bookmarked: isCollected,
      following: false,
      author: {
        name: authorName,
        handle: authorHandle,
        avatar: authorAvatar,
        verified: false
      },
      stats: {
        reply: replyCount,
        rt: collectCount,
        like: likeCount,
        liked: isLiked,
        retweeted: isCollected,
        bookmarked: isCollected
      },
      source: "note"
    };
  }
  function getCachedNoteFromState(noteId) {
    var _a, _b, _c;
    const state = getInitialState();
    if (!state) return null;
    const direct = unwrap((_b = (_a = state.noteData) == null ? void 0 : _a.data) == null ? void 0 : _b.noteData);
    if (direct && (!noteId || direct.id === noteId || direct.noteId === noteId)) {
      return direct;
    }
    const detailMap = unwrap((_c = state.note) == null ? void 0 : _c.noteDetailMap);
    if (detailMap) {
      const pickNote = (entry) => {
        var _a2;
        return unwrap((_a2 = unwrap(entry)) == null ? void 0 : _a2.note);
      };
      if (noteId) {
        const n = pickNote(detailMap[noteId]);
        if (n) return n;
      }
      const items = Object.entries(detailMap).filter(([k]) => k && k !== "undefined");
      for (let i = items.length - 1; i >= 0; i--) {
        const n = pickNote(items[i][1]);
        if (n && (!noteId || n.id === noteId || n.noteId === noteId)) return n;
      }
    }
    return null;
  }
  function noteContainer() {
    return document.getElementById("noteContainer") || document.querySelector(".note-container");
  }
  function replyTargetFromAuthor(item) {
    var _a, _b;
    const author = ((_a = item.querySelector(".author, .right .author, .name")) == null ? void 0 : _a.parentElement) || item.querySelector(".author");
    const names = [...item.querySelectorAll(".author a.name, .author .name, a.name") || []].map((n) => n.textContent.trim()).filter(Boolean);
    if (names.length >= 2) return names[1];
    const raw = ((author == null ? void 0 : author.textContent) || ((_b = item.querySelector(".author")) == null ? void 0 : _b.textContent) || "").replace(/\s+/g, " ").trim();
    const m = raw.match(/回复\s+(.+)$/);
    return m ? m[1].replace(/作者$/, "").trim() : "";
  }
  function vueCommentData(item) {
    if (!item) return null;
    let comp = item.__vueParentComponent;
    for (let i = 0; i < 12 && comp; i++) {
      const bags = [comp.props, comp.setupState, comp.ctx];
      for (const bag of bags) {
        if (!bag || typeof bag !== "object") continue;
        const c = unwrap(bag.comment) || unwrap(bag.item) || unwrap(bag.data);
        if (c && typeof c === "object" && (c.content || c.userInfo || c.user)) return c;
      }
      comp = comp.parent;
    }
    return null;
  }
  function parseCommentItem(item, repliedTo, parentSnippet) {
    var _a, _b, _c, _d;
    if (!item) return null;
    const rawId = item.id || item.getAttribute("id") || "";
    const nameEl = item.querySelector(".author a.name, a.name, .name");
    const rawName = ((nameEl == null ? void 0 : nameEl.textContent) || "").trim();
    const name = rawName.replace(/\s*回复\s*.*/, "") || "热心薯友";
    const vComp = vueCommentData(item);
    const vUser = unwrap(vComp == null ? void 0 : vComp.userInfo) || unwrap(vComp == null ? void 0 : vComp.user) || {};
    const vAvatar = unwrap(vUser.image) || unwrap(vUser.avatar) || "";
    const avatarImg = item.querySelector(".avatar img, .user-avatar img, a.avatar img, img.avatar, img[src*='avatar'], img");
    const domAvatar = (avatarImg == null ? void 0 : avatarImg.currentSrc) || (avatarImg == null ? void 0 : avatarImg.src) || (avatarImg == null ? void 0 : avatarImg.getAttribute("src")) || ((_a = avatarImg == null ? void 0 : avatarImg.dataset) == null ? void 0 : _a.src) || "";
    const avatar = domAvatar || vAvatar || "";
    const contentEl = item.querySelector(".comment-inner-container .content .note-text, .comment-inner-container .content") || item.querySelector(":scope > .content, :scope .right > .content");
    const text = ((contentEl == null ? void 0 : contentEl.innerText) || "").trim();
    const dateEl = item.querySelector(".info .date, .date");
    const locEl = item.querySelector(".info .location, .location");
    const dateStr = ((dateEl == null ? void 0 : dateEl.textContent) || "").trim();
    const locStr = locEl ? locEl.textContent.trim().replace(/^IP属地[:：]?\s*/, "") : "";
    const time = [dateStr, locStr ? `IP:${locStr}` : ""].filter(Boolean).join(" · ") || "刚刚";
    const likeEl = item.querySelector(".like-wrapper");
    const likeCount = countIn(((_b = likeEl == null ? void 0 : likeEl.querySelector(".count")) == null ? void 0 : _b.textContent) || "") || "";
    const liked = isLikeActive(likeEl);
    const photos = [];
    item.querySelectorAll(".comment-picture img, .img-box img").forEach((img) => {
      if (img.closest(".reply-container") && !item.closest(".reply-container")) return;
      const src = img.getAttribute("src");
      if (src && !src.includes("emoji") && !src.includes("avatar") && !photos.includes(src)) photos.push(src);
    });
    if (!text && !photos.length) return null;
    const target = repliedTo || replyTargetFromAuthor(item);
    const profileHref = ((_c = item.querySelector('a[href*="/user/profile/"]')) == null ? void 0 : _c.getAttribute("href")) || "";
    const userId = ((_d = profileHref.match(/\/user\/profile\/([^/?#]+)/)) == null ? void 0 : _d[1]) || name;
    return {
      id: rawId.replace(/^comment-/, "") || String(Math.random()),
      name,
      handle: userId,
      profileHref,
      avatar,
      text,
      time,
      likeCount,
      liked,
      photos,
      repliedTo: target,
      replyTo: target,
      replyRef: target ? { handle: target, href: "", snippet: parentSnippet || "" } : null,
      isSub: !!target,
      href: ""
    };
  }
  function rootCommentEl(parent) {
    for (const el of parent.querySelectorAll(".comment-item")) {
      if (!el.closest(".reply-container, .sub-comments")) return el;
    }
    return parent.querySelector(":scope > .comment-item") || null;
  }
  function subCommentEls(parent) {
    var _a, _b;
    const inside = parent.querySelectorAll(".reply-container .comment-item, .sub-comments .comment-item");
    if (inside.length) return Array.from(inside);
    const sib = parent.nextElementSibling;
    if (((_a = sib == null ? void 0 : sib.classList) == null ? void 0 : _a.contains("reply-container")) || ((_b = sib == null ? void 0 : sib.classList) == null ? void 0 : _b.contains("sub-comments"))) {
      return Array.from(sib.querySelectorAll(".comment-item"));
    }
    return [];
  }
  function harvestNoteComments(container = noteContainer()) {
    if (!container) return [];
    const replies = [];
    const seen2 = /* @__PURE__ */ new Set();
    const parentComments = container.querySelectorAll(".comments-container .parent-comment, .parent-comment");
    const push = (parsed) => {
      if (!parsed) return;
      const key = parsed.id && !parsed.id.startsWith("0.") ? parsed.id : `${parsed.name}|${parsed.text}`;
      if (seen2.has(key)) return;
      seen2.add(key);
      replies.push(parsed);
    };
    if (parentComments.length) {
      parentComments.forEach((parent) => {
        const rootItem = rootCommentEl(parent);
        const parsed = rootItem ? parseCommentItem(rootItem) : null;
        push(parsed);
        subCommentEls(parent).forEach((sub) => {
          push(parseCommentItem(sub, parsed == null ? void 0 : parsed.name, parsed == null ? void 0 : parsed.text));
        });
      });
    } else {
      container.querySelectorAll(".comments-container .comment-item, .comment-item").forEach((item) => {
        const isSub = !!item.closest(".reply-container, .sub-comments") || item.classList.contains("comment-item-sub");
        push(parseCommentItem(item, isSub ? "楼主" : ""));
      });
    }
    return replies;
  }
  function flattenRawComments(list, repliedTo, out) {
    if (!Array.isArray(list)) return;
    for (const raw of list) {
      const item = unwrap(raw);
      const parsed = commentFromRaw(item, repliedTo);
      if (parsed) out.push(parsed);
      const subs = unwrap(item == null ? void 0 : item.subComments) || unwrap(item == null ? void 0 : item.subCommentList) || unwrap(item == null ? void 0 : item.sub_comments) || [];
      if (Array.isArray(subs) && subs.length) flattenRawComments(subs, (parsed == null ? void 0 : parsed.name) || repliedTo, out);
    }
  }
  function harvestCommentsFromState(noteId) {
    var _a, _b, _c, _d;
    const out = [];
    try {
      const state = getInitialState();
      if (!state) return out;
      const map = unwrap((_a = state.note) == null ? void 0 : _a.noteDetailMap) || {};
      const entry = unwrap(noteId ? map[noteId] : null) || {};
      const buckets = [
        unwrap(entry.comments),
        unwrap(entry.comment),
        unwrap(entry.commentList),
        unwrap((_b = state.note) == null ? void 0 : _b.comments),
        unwrap((_d = (_c = state.comment) == null ? void 0 : _c.commentMap) == null ? void 0 : _d[noteId])
      ];
      for (const b of buckets) {
        const list = Array.isArray(b) ? b : Array.isArray(b == null ? void 0 : b.list) ? b.list : [];
        if (list.length) flattenRawComments(list, "", out);
        if (out.length) break;
      }
    } catch {
    }
    return out;
  }
  function collectNoteComments(noteId, container = noteContainer()) {
    const fromDom = harvestNoteComments(container);
    const fromState = harvestCommentsFromState(noteId);
    const map = /* @__PURE__ */ new Map();
    for (const c of fromState) {
      const k = c.id && !c.id.startsWith("0.") ? c.id : `${c.name}|${c.text}`;
      map.set(k, { ...c });
    }
    for (const c of fromDom) {
      const k = c.id && !c.id.startsWith("0.") ? c.id : `${c.name}|${c.text}`;
      if (map.has(k)) {
        const existing = map.get(k);
        map.set(k, {
          ...existing,
          ...c,
          avatar: c.avatar || existing.avatar || ""
        });
      } else {
        map.set(k, c);
      }
    }
    return Array.from(map.values());
  }
  function kickCommentScroller() {
    const c = noteContainer();
    if (!c) return;
    const scroller = c.querySelector(".comments-container, .list-container, .note-scroller, .interaction-container, .note-content") || c;
    try {
      scroller.scrollTop = scroller.scrollHeight;
      scroller.dispatchEvent(new Event("scroll", { bubbles: true }));
    } catch {
    }
  }
  function commentMoreButtons() {
    const target = noteContainer();
    if (!target) return [];
    return Array.from(target.querySelectorAll(
      ".show-more, .more-comment, .more-comments, .bottom-bar .loading.active, [class*='show-more'], [class*='more-comment'], button, .reply-container span, .comments-container span"
    )).filter((el) => {
      if (el.closest(".im-detail-view, .im-chat-panel")) return false;
      const t = (el.innerText || el.textContent || "").replace(/\s+/g, "");
      if (el.classList.contains("show-more") || el.classList.contains("loading") || /more-comment/.test(el.className || "")) return true;
      return /展开|更多(评论|回复)|查看全部|加载更多/.test(t);
    });
  }
  function expandCommentRound() {
    kickCommentScroller();
    let n = 0;
    for (const b of commentMoreButtons()) {
      try {
        b.click();
        n++;
      } catch {
      }
    }
    return n;
  }
  async function expandAllComments(_container) {
    let clicked = 0;
    let idle = 0;
    for (let round = 0; round < 20; round++) {
      const n = expandCommentRound();
      clicked += n;
      if (!n) {
        idle++;
        if (idle >= 2) break;
      } else idle = 0;
      await new Promise((r) => setTimeout(r, 500));
    }
    return clicked;
  }
  async function loadMoreComments(noteId) {
    expandCommentRound();
    await new Promise((r) => setTimeout(r, 400));
    expandCommentRound();
    return collectNoteComments(noteId);
  }
  function downloadNoteCommentsAsTxt(pin, replies) {
    var _a;
    if (!pin) return;
    const postUrl = `${location.origin}${pin.href || `/explore/${pin.id}`}`;
    const title = (pin.text || "").split("\n")[0] || pin.name || "无标题";
    let exportText = `帖子链接: ${postUrl}

`;
    exportText += `笔记标题: ${title}
`;
    exportText += `作者: ${pin.name || ((_a = pin.author) == null ? void 0 : _a.name) || "未知作者"}
`;
    exportText += `发布时间: ${pin.time || "未知"}

`;
    exportText += `笔记内容:
${pin.text || "无"}

`;
    exportText += "==================== 评论区 ====================\n\n";
    if (!replies || !replies.length) {
      exportText += "当前笔记没有评论。\n";
    } else {
      replies.forEach((comment, index) => {
        const tag = comment.repliedTo ? `  -> [回复 @${comment.repliedTo}]` : `【${index + 1}楼】`;
        exportText += `${tag} ${comment.name} (点赞: ${comment.likeCount || 0})
`;
        exportText += `时间: ${comment.time}
`;
        exportText += `内容: ${comment.text}
`;
        exportText += "----------------------------------------\n\n";
      });
    }
    const filename = `${(pin.name || "小红书笔记").replace(/[\\/:*?"<>|]/g, "_")}_评论区.txt`;
    const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  function collectNotePhotos(container) {
    const photos = [];
    const push = (src) => {
      if (src && !photos.includes(src) && !src.includes("avatar") && !src.includes("emoji")) photos.push(src);
    };
    container.querySelectorAll(".media-container .swiper-slide:not(.swiper-slide-duplicate) img, .note-slider-img img").forEach((img) => push(img.getAttribute("src")));
    if (!photos.length) {
      container.querySelectorAll(".media-container img").forEach((img) => push(img.getAttribute("src")));
    }
    return photos;
  }
  function extractNoteFromVueComp(container) {
    if (!container) return null;
    const nodes = [
      container,
      container.querySelector(".note-content"),
      container.querySelector(".interaction-container"),
      container.querySelector(".author-container"),
      container.querySelector(".media-container"),
      container.querySelector(".note-scroller"),
      ...Array.from(container.querySelectorAll("[class*='note'], [class*='content'], [class*='author']")).slice(0, 15)
    ];
    for (const el of nodes) {
      if (!el) continue;
      let comp = el.__vueParentComponent || el.__vue_app__;
      for (let i = 0; i < 16 && comp; i++) {
        const bags = [comp.props, comp.setupState, comp.ctx];
        for (const bag of bags) {
          if (!bag || typeof bag !== "object") continue;
          const note = unwrap(bag.note) || unwrap(bag.noteData) || unwrap(bag.noteInfo) || unwrap(bag.item);
          if (note && typeof note === "object" && (note.title || note.desc || note.displayTitle || note.user)) {
            return note;
          }
        }
        comp = comp.parent;
      }
    }
    return null;
  }
  function pinFromNoteContainer(container, noteId) {
    var _a, _b, _c, _d, _e, _f, _g;
    const vueNote = extractNoteFromVueComp(container);
    if (vueNote) {
      const pin = pinFromNoteObject(vueNote, noteId);
      if (pin && (pin.text !== "分享了一篇笔记" || pin.name !== "小红书薯友")) {
        return pin;
      }
    }
    const titleEl = container.querySelector("#detail-title, .title, [class*='detail-title'], .note-content .title, .note-scroller .title");
    const title = ((titleEl == null ? void 0 : titleEl.innerText) || (titleEl == null ? void 0 : titleEl.textContent) || "").trim();
    const descEl = container.querySelector("#detail-desc, .desc, [class*='detail-desc'], .note-content .desc, .note-text, .note-scroller .desc");
    const desc = ((descEl == null ? void 0 : descEl.innerText) || (descEl == null ? void 0 : descEl.textContent) || "").trim();
    let fullText = [title, desc].filter(Boolean).join("\n\n");
    if (!fullText) {
      const contentEl = container.querySelector(".note-content, .note-scroller, .interaction-container");
      if (contentEl) {
        const t = (contentEl.innerText || "").trim();
        if (t && t.length > 5) fullText = t;
      }
    }
    if (!fullText) fullText = "分享了一篇笔记";
    const authorEl = container.querySelector(".author-container, .author-wrapper, .interaction-container .author-wrapper, .author-info, .author, [class*='author']");
    const authorLink = container.querySelector("a[href*='/user/profile/']");
    const authorNameEl = (authorEl == null ? void 0 : authorEl.querySelector(".name, .username, [class*='name']")) || authorLink;
    const authorName = ((authorNameEl == null ? void 0 : authorNameEl.innerText) || (authorNameEl == null ? void 0 : authorNameEl.textContent) || "").trim() || "小红书薯友";
    const authorHandle = ((_b = (_a = authorLink == null ? void 0 : authorLink.getAttribute("href")) == null ? void 0 : _a.match(/\/user\/profile\/([^?/]+)/)) == null ? void 0 : _b[1]) || authorName;
    const authorImg = authorEl == null ? void 0 : authorEl.querySelector("img.avatar-item, img.user-image, .avatar img, img[src*='avatar'], img");
    const authorAvatar = (authorImg == null ? void 0 : authorImg.currentSrc) || (authorImg == null ? void 0 : authorImg.src) || (authorImg == null ? void 0 : authorImg.getAttribute("src")) || "";
    const photos = collectNotePhotos(container);
    const videoEl = container.querySelector(".media-container video, video");
    const videoSrc = (videoEl == null ? void 0 : videoEl.getAttribute("src")) || "";
    const video = videoSrc || videoEl ? { src: videoSrc, poster: (videoEl == null ? void 0 : videoEl.getAttribute("poster")) || photos[0] || "" } : null;
    const bar = container.querySelector(".engage-bar, .buttons.engage-bar-style");
    const likeEl = (bar == null ? void 0 : bar.querySelector(".like-wrapper")) || container.querySelector(".engage-bar .like-wrapper, [class*='like-wrapper']");
    const collectEl = (bar == null ? void 0 : bar.querySelector(".collect-wrapper")) || container.querySelector(".engage-bar .collect-wrapper, [class*='collect-wrapper']");
    const chatEl = (bar == null ? void 0 : bar.querySelector(".chat-wrapper")) || container.querySelector(".engage-bar .chat-wrapper, [class*='chat-wrapper']");
    const likeCount = countIn(((_c = likeEl == null ? void 0 : likeEl.querySelector(".count")) == null ? void 0 : _c.textContent) || "") || "";
    const collectCount = countIn(((_d = collectEl == null ? void 0 : collectEl.querySelector(".count")) == null ? void 0 : _d.textContent) || "") || "";
    const replyCount = countIn(((_e = chatEl == null ? void 0 : chatEl.querySelector(".count")) == null ? void 0 : _e.textContent) || ((_f = container.querySelector(".comments-container .total, .comments-container")) == null ? void 0 : _f.textContent) || "") || "";
    const isLiked = isLikeActive(likeEl);
    const isCollected = !!((collectEl == null ? void 0 : collectEl.querySelector(".collect-active, .active")) || (collectEl == null ? void 0 : collectEl.classList.contains("active")));
    const dateObj = timeFromNoteId(noteId);
    const noteTime = (((_g = container.querySelector(".date, .info .date, .time, [class*='date']")) == null ? void 0 : _g.textContent) || "").trim() || (dateObj ? fmtStateTime(dateObj) : "") || "刚刚";
    return {
      id: noteId,
      name: authorName,
      handle: authorHandle,
      profileHref: (authorLink == null ? void 0 : authorLink.getAttribute("href")) || "",
      avatar: authorAvatar,
      text: fullText,
      photos,
      images: photos,
      video,
      time: noteTime,
      datetime: dateObj ? dateObj.toISOString() : "",
      timeIso: dateObj ? dateObj.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      likeCount,
      rtCount: collectCount,
      replyCount,
      liked: isLiked,
      retweeted: isCollected,
      bookmarked: isCollected,
      following: false,
      author: { name: authorName, handle: authorHandle, avatar: authorAvatar, verified: false },
      stats: { reply: replyCount, rt: collectCount, like: likeCount, liked: isLiked, retweeted: isCollected, bookmarked: isCollected },
      source: "note"
    };
  }
  function extractFromNoteContainer(nid) {
    const box = noteContainer();
    if (!box) return null;
    return { pin: pinFromNoteContainer(box, nid), replies: harvestNoteComments(box) };
  }
  function noteXsecToken(nid) {
    var _a, _b;
    if (!nid) return "";
    const card = findTweetArticle(nid);
    const href = ((_a = card == null ? void 0 : card.querySelector("a[href*='xsec_token']")) == null ? void 0 : _a.getAttribute("href")) || "";
    const m = href.match(/xsec_token=([^&]+)/);
    if (m) return decodeURIComponent(m[1]);
    try {
      const state = getInitialState();
      const feeds = unwrap((_b = state == null ? void 0 : state.feed) == null ? void 0 : _b.feeds) || [];
      if (Array.isArray(feeds)) {
        const el = feeds.find((f) => {
          const raw = unwrap(f);
          return String(unwrap(raw.id) || "") === String(nid);
        });
        if (el) return String(unwrap(el.xsecToken) || "");
      }
    } catch {
    }
    return "";
  }
  function findNoteCardUrl(nid) {
    if (!nid) return "";
    const card = findTweetArticle(nid);
    if (card) {
      const links = Array.from(card.querySelectorAll("a[href*='xsec_token'], a.cover, a.title, a"));
      for (const a of links) {
        const h2 = a.getAttribute("href") || "";
        if (h2 && h2.includes(nid) && h2.includes("xsec_token")) return h2;
      }
      const anyLink = card.querySelector("a.cover, a.title, a[href*='/explore/'], a[href*='/discovery/item/']");
      const h = (anyLink == null ? void 0 : anyLink.getAttribute("href")) || "";
      if (h && h.includes(nid)) return h;
    }
    const token = noteXsecToken(nid);
    if (token) return `/explore/${nid}?xsec_token=${encodeURIComponent(token)}&xsec_source=pc_feed`;
    return `/explore/${nid}`;
  }
  function clickNativeNoteCard(nid) {
    if (!nid) return;
    try {
      const card = findTweetArticle(nid);
      const url = findNoteCardUrl(nid);
      const router = findVueRouter();
      if (url && router && typeof router.push === "function") {
        router.push(url);
      } else {
        const targetLink = card == null ? void 0 : card.querySelector("a.cover[href*='xsec_token'], a.title[href*='xsec_token'], a[href*='xsec_token'], a.cover, a.title");
        if (targetLink) {
          targetLink.click();
        } else if (url) {
          try {
            history.pushState({}, "", url);
            pageWindow().dispatchEvent(new PopStateEvent("popstate"));
          } catch {
          }
        }
      }
    } catch {
    }
  }
  async function fetchTweetDetail(noteId) {
    var _a, _b, _c;
    if (!noteId) return null;
    let pin = (() => {
      var _a2;
      const cached = getCachedNoteFromState(noteId);
      if (cached) return pinFromNoteObject(cached, noteId);
      return ((_a2 = extractFromNoteContainer(noteId)) == null ? void 0 : _a2.pin) || null;
    })();
    clickNativeNoteCard(noteId);
    let replies = collectNoteComments(noteId);
    for (let i = 0; i < 15; i++) {
      await sleep$1(80);
      if (i === 2 || i === 6) kickCommentScroller();
      const cached = getCachedNoteFromState(noteId);
      if (cached) pin = pinFromNoteObject(cached, noteId);
      const live = extractFromNoteContainer(noteId);
      if (live == null ? void 0 : live.pin) {
        if (!pin) {
          pin = live.pin;
        } else {
          if (live.pin.text && live.pin.text !== "分享了一篇笔记") pin.text = live.pin.text;
          if (live.pin.name && live.pin.name !== "小红书薯友") pin.name = live.pin.name;
          if (live.pin.avatar) pin.avatar = live.pin.avatar;
          if (live.pin.handle && live.pin.handle !== "小红书薯友") pin.handle = live.pin.handle;
          if (live.pin.profileHref) pin.profileHref = live.pin.profileHref;
          if ((_a = live.pin.photos) == null ? void 0 : _a.length) pin.photos = live.pin.photos;
          if (live.pin.likeCount) pin.likeCount = live.pin.likeCount;
          if (live.pin.rtCount) pin.rtCount = live.pin.rtCount;
          if (live.pin.replyCount) pin.replyCount = live.pin.replyCount;
        }
      }
      replies = collectNoteComments(noteId);
      const hasDetailedPin = pin && (((_b = pin.photos) == null ? void 0 : _b.length) > 1 || pin.text && pin.text.length > 25 || cached);
      if (hasDetailedPin && (replies.length || i >= 4)) {
        break;
      }
      if (location.pathname.startsWith("/404")) break;
    }
    if (!pin || pin.name === "小红书薯友" || pin.text === "分享了一篇笔记") {
      const fromCard = pinFromFeedCard(noteId);
      if (fromCard) {
        if (!pin) pin = fromCard;
        else {
          if (!pin.name || pin.name === "小红书薯友") pin.name = fromCard.name;
          if (!pin.avatar) pin.avatar = fromCard.avatar;
          if (!pin.handle || pin.handle === "小红书薯友") pin.handle = fromCard.handle;
          if (!pin.profileHref) pin.profileHref = fromCard.profileHref;
          if (!((_c = pin.photos) == null ? void 0 : _c.length)) pin.photos = fromCard.photos;
          if (pin.text === "分享了一篇笔记" && fromCard.text) pin.text = fromCard.text;
        }
      }
    }
    if (!pin) return null;
    return { pin, replies, commentsPending: !replies.length };
  }
  function pinFromFeedCard(noteId) {
    try {
      const art = Array.from(document.querySelectorAll(".note-item, section.note-item, [class*='note-item']")).find(
        (n) => n.querySelector(`a[href*="/explore/${noteId}"], a[href*="/discovery/item/${noteId}"]`) || (n.innerHTML || "").includes(noteId)
      );
      if (art) return extractTweet(art);
    } catch {
    }
    return null;
  }
  async function fetchSearchTimeline(_query) {
    var _a;
    try {
      const state = getInitialState();
      const feeds = unwrap((_a = state == null ? void 0 : state.search) == null ? void 0 : _a.feeds) || [];
      if (!Array.isArray(feeds) || !feeds.length) return [];
      return feeds.filter((item) => item == null ? void 0 : item.noteCard).map((item) => {
        var _a2, _b, _c, _d;
        const id = item.id;
        const card = item.noteCard;
        const title = (card.displayTitle || card.title || "").trim();
        const author = card.user || {};
        const cover = ((_a2 = card.cover) == null ? void 0 : _a2.urlDefault) || ((_b = card.cover) == null ? void 0 : _b.url) || "";
        const likeCount = String(((_c = card.interactInfo) == null ? void 0 : _c.likedCount) || "");
        const isLiked = flagTrue((_d = card.interactInfo) == null ? void 0 : _d.liked);
        return {
          id,
          href: `/explore/${id}`,
          name: author.nickName || author.nickname || "小红书薯友",
          handle: String(author.userId || author.nickName || "user"),
          avatar: author.avatar || "",
          text: title || "分享了一篇笔记",
          photos: cover ? [cover] : [],
          images: cover ? [cover] : [],
          likeCount,
          replyCount: "0",
          rtCount: "",
          liked: isLiked,
          retweeted: false,
          bookmarked: false,
          time: "刚刚",
          timeIso: (/* @__PURE__ */ new Date()).toISOString(),
          source: "search"
        };
      });
    } catch {
      return [];
    }
  }
  function posterVideoSrc() {
    return "";
  }
  async function requestXTranslation(text) {
    return text;
  }
  let capturedSearch = { keyword: "", items: [], _t: 0 };
  function searchItemsFromPayload(data) {
    var _a, _b, _c, _d;
    try {
      const items = unwrap((_a = data == null ? void 0 : data.data) == null ? void 0 : _a.items) || [];
      const out = [];
      for (const raw of items) {
        const item = unwrap(raw);
        const card = unwrap(item == null ? void 0 : item.noteCard);
        if (!card) continue;
        const id = String(unwrap(item.id) || unwrap(card.noteId) || "");
        if (!id) continue;
        const user = unwrap(card.user) || {};
        const cover = unwrap((_b = card.cover) == null ? void 0 : _b.urlDefault) || unwrap((_c = card.cover) == null ? void 0 : _c.url) || "";
        const likeCount = String(unwrap((_d = card.interactInfo) == null ? void 0 : _d.likedCount) || "");
        out.push({
          id,
          href: `/explore/${id}`,
          name: unwrap(user.nickName) || unwrap(user.nickname) || "小红书薯友",
          handle: String(unwrap(user.userId) || "user"),
          avatar: unwrap(user.avatar) || "",
          text: String(unwrap(card.displayTitle) || unwrap(card.title) || "").trim() || "分享了一篇笔记",
          photos: cover ? [cover] : [],
          images: cover ? [cover] : [],
          likeCount,
          replyCount: "0",
          rtCount: "",
          liked: false,
          retweeted: false,
          bookmarked: false,
          time: "刚刚",
          timeIso: (/* @__PURE__ */ new Date()).toISOString(),
          source: "search"
        });
      }
      return out;
    } catch {
      return [];
    }
  }
  function installSearchCapture() {
    try {
      const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      if (win.__ximSearchHooked) return;
      win.__ximSearchHooked = installSearchCapture;
      const proto = win.XMLHttpRequest.prototype;
      const origOpen = proto.open;
      const origSend = proto.send;
      proto.open = function(_method, url) {
        this.__ximUrl = String(url || "");
        return origOpen.apply(this, arguments);
      };
      proto.send = function(body) {
        const url = this.__ximUrl || "";
        if (url.includes("/api/sns/web/v2/search/notes") || url.includes("/api/sns/web/v1/search/notes")) {
          let kw = "";
          try {
            kw = String(JSON.parse(body || "{}").keyword || "");
          } catch {
          }
          this.addEventListener("load", () => {
            try {
              const data = typeof this.response === "string" ? JSON.parse(this.response) : this.response;
              const items = searchItemsFromPayload(data);
              if (items.length) capturedSearch = { keyword: kw, items, _t: Date.now() };
            } catch {
            }
          });
        }
        return origSend.apply(this, arguments);
      };
    } catch {
    }
  }
  function getCapturedSearch(kw) {
    const k = String(kw || "").trim();
    if (!k || capturedSearch.items.length && capturedSearch.keyword !== k) return [];
    return capturedSearch.items;
  }
  const ICONS$1 = {
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
    link: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M10.5 13.5a4.2 4.2 0 0 0 6.34.46l2.4-2.4a4.2 4.2 0 0 0-5.94-5.94l-1.4 1.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M13.5 10.5a4.2 4.2 0 0 0-6.34-.46l-2.4 2.4a4.2 4.2 0 0 0 5.94 5.94l1.4-1.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    flag: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 20V5s1.2-1 3.5-1 4 1.2 6 1.2 3-.7 3-.7v9.5s-.8.7-3 .7-3.7-1.2-6-1.2S5 14.5 5 14.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    smile: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 14s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="9.2" cy="9.8" r="1" fill="currentColor"/><circle cx="14.8" cy="9.8" r="1" fill="currentColor"/></svg>`,
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
    scrollTop: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    bookmarkFill: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 3.5h10A1.2 1.2 0 0 1 18.2 4.7v14.8c0 .9-1 1.4-1.7.9L12 16.9l-4.5 3.5c-.7.5-1.7 0-1.7-.9V4.7A1.2 1.2 0 0 1 7 3.5Z"/></svg>`
  };
  ICONS$1.chat = ICONS$1.msg;
  ICONS$1.list = ICONS$1.msg;
  ICONS$1.calendar = ICONS$1.cal;
  ICONS$1.worktable = ICONS$1.work;
  ICONS$1.cloud = ICONS$1.doc;
  ICONS$1.wiki = ICONS$1.doc;
  ICONS$1.task = ICONS$1.todo;
  ICONS$1.contacts = ICONS$1.book;
  ICONS$1.project = ICONS$1.proj;
  ICONS$1.chat = ICONS$1.msg;
  ICONS$1.list = ICONS$1.msg;
  ICONS$1.calendar = ICONS$1.cal;
  ICONS$1.worktable = ICONS$1.work;
  ICONS$1.cloud = ICONS$1.doc;
  ICONS$1.wiki = ICONS$1.doc;
  ICONS$1.task = ICONS$1.todo;
  ICONS$1.contacts = ICONS$1.book;
  ICONS$1.project = ICONS$1.proj;
  ICONS$1.msgFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4c-4.7 0-8.4 3-8.4 7 0 2.2 1.1 4.2 2.9 5.5l-.6 3 3.5-1.7c.8.2 1.7.3 2.6.3 4.7 0 8.4-3 8.4-7S16.7 4 12 4Z"/></svg>`;
  ICONS$1.bellFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a6.2 6.2 0 0 0-6.2 6.2v2.9l-1.5 2.8c-.4.7.1 1.6 1 1.6h13.4c.9 0 1.4-.9 1-1.6l-1.5-2.8V9.2A6.2 6.2 0 0 0 12 3Z"/><path d="M9.7 18.6a2.4 2.4 0 0 0 4.6 0h-4.6Z"/></svg>`;
  ICONS$1.mailFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 7A2.5 2.5 0 0 1 6.5 4.5h11A2.5 2.5 0 0 1 20 7v.5l-8 4.4-8-4.4V7Z"/><path d="M4 9.9v7.1a2.5 2.5 0 0 0 2.5 2.5h11a2.5 2.5 0 0 0 2.5-2.5V9.9l-7.5 4.1a1 1 0 0 1-1 0L4 9.9Z"/></svg>`;
  ICONS$1.usersFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8.4" r="3.3"/><path d="M3.3 18.6c.4-3 2.8-5 5.7-5s5.3 2 5.7 5l.1.7H3.2l.1-.7Z"/><circle cx="16.9" cy="9.2" r="2.5"/><path d="M16.6 13.8c2.3.3 4 2 4.3 4.3l.1.7h-4.4l-.1-.7c-.2-1.7-1-3.2-2.2-4.1.5-.2 1-.2 1.6-.2h.7Z"/></svg>`;
  ICONS$1.docFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 3h7.3L19 8.2V20a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M13.8 3.4V8.2h4.8L13.8 3.4Z" fill="#FFFFFF" opacity=".4"/></svg>`;
  ICONS$1.aitableFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/></svg>`;
  ICONS$1.aimicFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="9.2" y="3.2" width="5.6" height="10.2" rx="2.8"/><path d="M6 11.6a6 6 0 0 0 12 0h-1.9a4.1 4.1 0 0 1-8.2 0H6Z"/><rect x="11.1" y="17.6" width="1.8" height="3.2" rx=".9"/></svg>`;
  ICONS$1.workFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.2 5.4c0-.8.6-1.4 1.4-1.4h2.8c.8 0 1.4.6 1.4 1.4V7h3.7A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V8.5A1.5 1.5 0 0 1 5.5 7h3.7V5.4ZM10.9 7h2.2V5.7h-2.2V7Z"/></svg>`;
  ICONS$1.bookFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4.2A1.7 1.7 0 0 1 6.7 2.5h10.6A1.7 1.7 0 0 1 19 4.2v15.6a1.7 1.7 0 0 1-1.7 1.7H6.7A1.7 1.7 0 0 1 5 19.8V4.2Z"/><circle cx="12" cy="9.4" r="2.1" fill="#FFFFFF" opacity=".92"/><path d="M8.6 16.6c.4-1.7 1.8-2.7 3.4-2.7s3 1 3.4 2.7l.1.4H8.5l.1-.4Z" fill="#FFFFFF" opacity=".92"/></svg>`;
  ICONS$1.meetFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3.4" y="6.4" width="12.2" height="11.2" rx="2"/><path d="M15.6 10.6l3.9-2.3a.8.8 0 0 1 1.2.7v6a.8.8 0 0 1-1.2.7l-3.9-2.3v-2.8Z"/></svg>`;
  ICONS$1.calFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 3.6c0-.6.4-1 1-1s1 .4 1 1V5h6V3.6c0-.6.4-1 1-1s1 .4 1 1V5h.5A1.5 1.5 0 0 1 20 6.5V9H4V6.5A1.5 1.5 0 0 1 5.5 5H7V3.6Z"/><path d="M4 10.5h16v8A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-8Z"/></svg>`;
  ICONS$1.todoFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3.2"/><path d="M8.4 12.2l2.5 2.5 4.9-5" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  ICONS$1.plusFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8.6"/><path d="M12 8.2v7.6M8.2 12h7.6" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  ICONS$1.fileFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 3h7.3L19 8.2V20a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M13.8 3.4V8.2h4.8L13.8 3.4Z" fill="#FFFFFF" opacity=".4"/><path d="M8.6 12.4h6.8M8.6 15.6h6.8" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  ICONS$1.sparkFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l1.7 5.1L19 9.8l-5.3 1.7L12 16.6l-1.7-5.1L5 9.8l5.3-1.7L12 3Z"/><path d="M18.6 14.6l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9.9-2.5Z"/></svg>`;
  ICONS$1.diskFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7.2 18.5a4.4 4.4 0 0 1-.7-8.7 5.4 5.4 0 0 1 10.5-1 4.7 4.7 0 0 1-.6 9.7H7.2Z"/></svg>`;
  ICONS$1.appsFill = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="7" r="2.4"/><circle cx="17" cy="7" r="2.4"/><circle cx="7" cy="17" r="2.4"/><circle cx="17" cy="17" r="2.4"/></svg>`;
  const X_EXTRAS = {
    eyes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8" fill="currentColor" stroke="none"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h11M4 7l3-3M4 7l3 3"/><path d="M20 17H9M20 17l-3-3M20 17l-3 3"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="6.5" width="12" height="11" rx="2"/><path d="m15.5 10 5-2.5v9L15.5 14"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m6 17 4-4 3 3 3-4 4 5"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h14M12 5l7 7-7 7"/></svg>',
    chevrons: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 6 5 12l6 6M19 6l-6 6 6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    repost: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l3 3-3 3"/><path d="M3 13V9a2 2 0 0 1 2-2h15"/><path d="M7 21l-3-3 3-3"/><path d="M21 11v4a2 2 0 0 1-2 2H4"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 6.5l9 5.5-9 5.5z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/></svg>',
    verified: '<svg class="im-verified" viewBox="0 0 24 24" fill="currentColor" aria-label="已认证"><path d="M12 2l2.4 1.8 2.6-.5.9 2.4 2.6.8-1 2.5 1.5 3-1.5 3 1 2.5-2.6.8-.9 2.4-2.6-.5L12 22l-2.4-1.8-2.6.5-.9-2.4-2.6-.8 1-2.5L3 12l1.5-3-1-2.5 2.6-.8.9-2.4 2.6.5z"/><path d="M9.5 12l1.8 1.8 3.4-3.6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    sortDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5v11M4 11l4 5 4-5"/><path d="M16 19V8M12 13l4-5 4 5"/></svg>',
    imageOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M10.41 10.41a2 2 0 1 0 2.83 2.83"/><path d="M13.5 13.5 6 21h12a2 2 0 0 0 2-2V9.5"/><path d="M4 16.5 4 5a2 2 0 0 1 2-2h10.5"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  const ICONS = { ...ICONS$1, ...X_EXTRAS };
  if (!ICONS.wiki) ICONS.wiki = ICONS.doc;
  if (!("user" in ICONS)) ICONS.user = ICONS.users;
  if (!ICONS.mic) ICONS.mic = ICONS.aimic;
  if (!ICONS.video) ICONS.video = ICONS.cam;
  const FEISHU_ICONS = {
    // 飞书消息：经典双向圆角气泡
    msg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5C4 7.4 7.6 4 12 4s8 3.4 8 7.5c0 4.1-3.6 7.5-8 7.5-1.2 0-2.3-.3-3.4-.8L4 19.5l1.2-4.1C4.5 14.3 4 12.9 4 11.5Z"/></svg>`,
    // 飞书云文档：带折角的 Docs 蓝调风格文档
    doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h8.5L19 8v12a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V5A1.5 1.5 0 0 1 6 3.5Z"/><path d="M14 3.5V8h4.5"/><path d="M8.5 12.5h7M8.5 16.5h4.5"/></svg>`,
    // 飞书 Pin：45度斜角金属大头针图钉
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4.5l4.5 4.5-1.8 1.8-1.2-.5-3.5 3.5.5 2.5-1.5 1.5-3.5-3.5-3.5 3.5-1-1 3.5-3.5-3.5-3.5 1.5-1.5 2.5.5 3.5-3.5-.5-1.2L15 4.5Z"/><path d="M14 10l-4-4"/></svg>`,
    // 飞书通知：圆润铃铛
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.5h12l-1.2-2.5a6 6 0 0 1-.8-3V9a5 5 0 1 0-10 0v2c0 1.1-.3 2.1-.8 3L6 16.5Z"/><path d="M10 18.5a2 2 0 0 0 4 0"/></svg>`,
    // 飞书提及 @
    at: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M15.5 8.5v4.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.6 7"/></svg>`,
    // 飞书书签 / 收藏
    bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12a1 1 0 0 1 1 1v15.5l-7-4-7 4V5a1 1 0 0 1 1-1Z"/></svg>`,
    // 飞书工作台：4个大小圆点
    work: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="7" r="3.2"/><circle cx="17" cy="7" r="3.2"/><circle cx="7" cy="17" r="3.2"/><circle cx="17" cy="17" r="3.2"/></svg>`,
    // 飞书日历
    cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v3.5M16 3v3.5M3.5 10h17"/></svg>`,
    // 飞书任务
    todo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>`,
    // 飞书通讯录
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.8"/><path d="M4.5 19.5a7.5 7.5 0 0 1 15 0"/></svg>`,
    // 飞书知识库
    wiki: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>`,
    grid: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>`
  };
  const DINGTALK_ICONS = {
    // 钉钉消息：方圆角气泡，左下带尖嘴
    msg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6A2.5 2.5 0 0 1 7 3.5h10A2.5 2.5 0 0 1 19.5 6v8a2.5 2.5 0 0 1-2.5 2.5H9.5L5 20v-4.5A2.5 2.5 0 0 1 4.5 14V6Z"/></svg>`,
    // 钉钉文档：折角带横线
    doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h7.5l5 5V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V5A1.5 1.5 0 0 1 6 3.5Z"/><path d="M13.5 3.5V8.5h5"/><path d="M8 13h8M8 16.5h5"/></svg>`,
    // 钉钉 DING / Pin：大头针与闪电结合体
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3.5M8 7.5a4.5 4.5 0 1 1 9 0c0 3.2-4.5 4.8-4.5 7.5"/><circle cx="12" cy="19.5" r="1.5" fill="currentColor"/></svg>`,
    // 钉钉通知
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.5h12l-1.2-2.2a6.5 6.5 0 0 1-.8-3.3V9a4 4 0 1 0-8 0v1.5c0 1.16-.28 2.3-.8 3.3L6 16.5Z"/><path d="M10 18.5a2 2 0 0 0 4 0"/></svg>`,
    // 钉钉提及 @
    at: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M15.2 8.8v4.4a2.4 2.4 0 0 0 4.8 0V12a8 8 0 1 0-3.4 6.6"/></svg>`,
    // 钉钉收藏
    bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z"/></svg>`,
    // 钉钉工作台：4个带圆角的小方块
    work: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>`,
    // 钉钉通讯录：名片夹
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8.5h6M9 12.5h4"/></svg>`,
    cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3.5v3M16 3.5v3M4 9.5h16"/></svg>`,
    todo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="4.5" width="15" height="15" rx="2"/><path d="M8 12l2.8 2.8 5.4-5.6"/></svg>`
  };
  const WECOM_ICONS = {
    // 企微消息：饱满实心双气泡
    msg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.8C6.8 3.8 2.6 7.4 2.6 11.8c0 2.5 1.4 4.8 3.5 6.2l-.8 3.3 3.9-1.7c.9.2 1.8.3 2.8.3 5.2 0 9.4-3.6 9.4-8.1s-4.2-8-9.4-8Z"/></svg>`,
    // 企微文档：实心折角白边文档
    doc: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 3h8.3L19.5 8.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20V4.5A1.5 1.5 0 0 1 5.5 3Z"/><path d="M13.8 3.5v5h5L13.8 3.5Z" fill="#FFFFFF" opacity=".4"/><path d="M7.5 12h7a1 1 0 1 1 0 2h-7a1 1 0 1 1 0-2Zm0 3.5h5a1 1 0 1 1 0 2h-5a1 1 0 1 1 0-2Z" fill="#FFFFFF" opacity=".6"/></svg>`,
    // 企微 Pin / 图钉
    pin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 4.5l3.5 3.5-1.5 1.5-1-.4-2.8 2.8.4 2-1.2 1.2-3-3-3 3-1-1 3-3-3-3 1.2-1.2 2 .4 2.8-2.8-.4-1L16 4.5Z"/><circle cx="7" cy="17" r="1.5"/></svg>`,
    // 企微通知：实心铃铛
    bell: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a6.2 6.2 0 0 0-6.2 6.2v2.9l-1.5 2.8c-.4.7.1 1.6 1 1.6h13.4c.9 0 1.4-.9 1-1.6l-1.5-2.8V9.2A6.2 6.2 0 0 0 12 3Z"/><path d="M9.7 18.6a2.4 2.4 0 0 0 4.6 0h-4.6Z"/></svg>`,
    // 企微提及 @
    at: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M15.2 8.8v4.4a2.4 2.4 0 0 0 4.8 0V12a8 8 0 1 0-3.4 6.6"/></svg>`,
    // 企微收藏
    bookmark: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3.5h10A1.2 1.2 0 0 1 18.2 4.7v14.8c0 .9-1 1.4-1.7.9L12 16.9l-4.5 3.5c-.7.5-1.7 0-1.7-.9V4.7A1.2 1.2 0 0 1 7 3.5Z"/></svg>`,
    // 企微工作台：实心公文包
    work: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.2 4.8c0-.8.6-1.4 1.4-1.4h2.8c.8 0 1.4.6 1.4 1.4V6.5h4.2A1.5 1.5 0 0 1 20.5 8V18a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 18V8A1.5 1.5 0 0 1 5 6.5h4.2V4.8ZM11 6.5h2V5.2h-2V6.5Z"/><rect x="8.5" y="11" width="7" height="2" rx="1" fill="#FFFFFF" opacity=".6"/></svg>`,
    // 企微通讯录：经典双人实心剪影
    book: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8.2" r="3.2"/><path d="M3.2 18.5c.4-3 2.8-5 5.8-5s5.4 2 5.8 5l.1.5H3.1l.1-.5Z"/><circle cx="16.8" cy="9" r="2.4"/><path d="M16.5 13.8c2.2.3 3.9 2 4.2 4.2l.1.7h-4.2l-.1-.7c-.2-1.7-1-3.2-2.2-4.1.5-.2 1-.2 1.5-.2h.7Z"/></svg>`,
    // 企微微盘
    disk: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.5L3.8 8v8l8.2 4.5 8.2-4.5V8L12 3.5ZM5.8 9l6.2 3.4L18.2 9 12 5.6 5.8 9Z"/></svg>`,
    file: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 3h7.3L19 8.2V20a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M13.8 3.4V8.2h4.8L13.8 3.4Z" fill="#FFFFFF" opacity=".4"/></svg>`,
    spark: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l1.8 5.4L19 10.2l-5.2 1.8L12 17.5l-1.8-5.5L5 10.2l5.2-1.8L12 3Z"/></svg>`,
    apps: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="7" r="2.2"/><circle cx="7" cy="17" r="2.2"/><circle cx="17" cy="17" r="2.2"/></svg>`
  };
  function getSkinIcon(key, skinId = currentSkinId()) {
    if (skinId === "feishu" && FEISHU_ICONS[key]) {
      return FEISHU_ICONS[key];
    }
    if (skinId === "wecom" && (WECOM_ICONS[key] || ICONS[`${key}Fill`])) {
      return WECOM_ICONS[key] || ICONS[`${key}Fill`];
    }
    if (skinId === "dingtalk" && DINGTALK_ICONS[key]) {
      return DINGTALK_ICONS[key];
    }
    return ICONS[key] || ICONS.doc;
  }
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function stripText(s) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  }
  function hashStr(s) {
    let h = 0;
    const str = String(s || "");
    for (let i = 0; i < str.length; i++) h = h * 31 + str.charCodeAt(i) | 0;
    return Math.abs(h);
  }
  function parseCountValue(str) {
    if (!str) return 0;
    const s = String(str).trim();
    if (!s) return 0;
    if (s.endsWith("万")) {
      const v = parseFloat(s.slice(0, -1));
      return Number.isNaN(v) ? 0 : Math.round(v * 1e4);
    }
    if (/k$/i.test(s)) {
      const v = parseFloat(s.slice(0, -1));
      return Number.isNaN(v) ? 0 : Math.round(v * 1e3);
    }
    if (/m$/i.test(s)) {
      const v = parseFloat(s.slice(0, -1));
      return Number.isNaN(v) ? 0 : Math.round(v * 1e6);
    }
    const clean = s.replace(/,/g, "");
    const n = parseInt(clean, 10);
    return Number.isNaN(n) ? 0 : n;
  }
  function formatCount(num) {
    if (num === null || num === void 0 || num === "") return "";
    const n = typeof num === "number" ? num : parseInt(String(num).replace(/,/g, ""), 10);
    if (Number.isNaN(n) || n <= 0) return "";
    if (n >= 1e4) return (n / 1e4).toFixed(1).replace(/\.0$/, "") + "万";
    if (n >= 1e3) return n.toLocaleString("en-US");
    return String(n);
  }
  function toast(text) {
    let el = document.getElementById("xim-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "xim-toast";
      (document.body || document.documentElement).appendChild(el);
    }
    el.textContent = text;
    el.classList.add("on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("on"), 1400);
  }
  const PIN_AVATARS = [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAARGVYSWZNTQAqAAAACAABh2kABAAAAAEAAAAaAAAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAACAoAMABAAAAAEAAACAAAAAAEiOBHcAABtmSURBVHgB7V0NlFTFlb5V9V73zDAzyAz/MCsRjCCiGH4G1sRgDFGBgd0kYsxm3WRN9ORnT+JPTrKJMT+anJPEn/zpHnd1s7rmJNEkKz9BE+OR5KgwAyhCBAUMGpDAwPAzAzPT/d6r2u++poeeme6Z7p7+eT12nel53e9V1bt1761bt27dWyVomKaFj+2rpMr6OlubsV1W1TijvbFGmunCiIvxOYcETSAhavzma9OB3wcNmdeJxBaScpcw1Frpdh5ypGgNV1e2rb9MdA9HVInh0KhLVh2u0fbIacqjWVGpZgutz9dSTSFtxhGZWmErKWSspUbjio8xhv/FbgoBXgAqkMfPh6/GwyPH1YZkO0lxSBm9VwuzM6TNVk/Rdn204/Xmj9W3xyoo3f8lyQBXP2ZC+yqdC4yiS42Wi0C9i8hQgwhJxUT0CQwC+vRNJHSmdGKm8JkDF4XC8bqj2sPtfWCilxXp9XjFnxq67D8/vlJEM31FsfOXDAMs+uneCnf0+AWuUMuNVJcD6eeD4BYI7/dWg77a06PzjVVmCokPMwVLi6h2cdkpjP6DZdzVNapiw5NLRCTfYOSi/sAzQOM6cz4QuxLk/aARYpYICTIuE72ABB8M08wQCh8LcEUMeMJsB2J/4yn5+KYrxSuDFS/m80AywJwHjC0neldKKa+HYrZYhGWVT3QXROcuH+jEjHCaGaKmE7zxtNHiQW8c/W7LXOEEDfRAMcCcNQeqLDn6Q0ZY/4axdx6LWM0o8zW3oKEuDXigUUqbpRVGCu214Od/1B4+8vjvrxt/Ko3SBckSCAaY9iMTrp/qrYSIv1lYcravtzml0NvTpREkgo0PY9s12zBLuaehU/08CEpj0RmgcY27xCj5NYyhC3zCuzxPG74JDO4zApTWDcLVdzY3WeuK2dqiMcDcVd3nKdv6hhHyGmjUQjvDm/B9iSxszCmhyELB/aXnul/fvKLitb55CvG74Aww54HNtppw4eeEbX2VLFGvowHS5guB8cR3YEyQ/qzGtEntfafhlPWTQg8LBWWAeasjM6Wl7iVLLfa1ev326vWJtE/8LiSGBSiLwvGe8Vzv85uWhws2dSwYA8xf615PSn4XU6R6HSkTPpEB4t9lWMLGYdrI019qWWY9FL+fz2veGQCGnFrS+i6y5ad4Nme8MvEHIqhQkAZQD4zrPSiEuqV5icjrekNeGeASKHqubf2UQmqhhoWsYKbagTBcCs/iuoHjbbCdzk88v6I2bwpi3higca1zGUn1CNliclnkZ8d1MoQhwTP7hOf9S/My+9nsahm4FK9v5TwtXN15Lcb71UaWiT8U5OoohkshGoxSqxY+0fXRodSVqmzOJUDjGu+zmN7dixmuXR7vU6E9w/vQCyALHM81N21uUvdlWHrA7DllgPlrvJuh7N0FZU9A8RvwxeWHGWKAp4rgAnL0rS1N6p4MS6fMnrMhYE4P8U2Z+CnRPYQH6FB+x7LFXfN/i46Wo5QTCTAXYl/a8sdY9cJSeLnn54g2yauBGMAqqYETyuc2LVf3J8+U/t0hMwArfNqueFgb2LLKYj99zA8lJ4YDKY1DEee65hXhXwylqiExwII1ziJjyTVwnKwuK3xDIUPmZdlgBMPKSel6TRub7PWZ1xArkbUO8O7ftL9TK+t/sZpXJn622B9COb/DCVGtlXqUaZFtVVkxQOO6tlonVPUIfOAmm2G+fp8tYgtRzse9LSZFw5WPME2yeWdWDGDckfeIsGr0DRXZvLVcJmcYMFhYE2Gr0Xhn3Z1NpRkzQOOq6L+C+Nd7bKUqp0BgQHfD7BaSn2TaZApQRkrggrWRGVraz8E8WVdW+jJFdX7zs08BXGiPSu2+e+Oy8M5035a2BLjqR7vDxsj74dxYJn662C1gPoMpONzM6rRRP2a3+nRfnTYDtE05+zNUYS0qr+yli9rC52PaiAp1uTXB+Wy6b09rCFi4ykzzbNNcFv3porV4+WJDgTkqvOiC5qaK3YNBkpYE8KT7nbLoHwyVwXgeGwowTJP6djoQDSoB5q1yrhQh9VuY+LEWxcEa5RR4DMCjCEsG2kS9pZtW2E8NBO+AEmAmwrBJiW8iPr5M/IGwGLRn3FFBM1DtW1etM+GBwBuQAWornY9IW803b7OgjYEQVirPmGYwEM075nkfHgjmlEPAnDWmCpsftMDBY2YpmXs5apw/Gr0A27zE4vexSo1FVEJUFjoG33x7JI4+Mo673eq0GjesFF3JWo2I9uTJFs7VJmTPLAVzL5OUlyQQZkUTKj2aVmvo7BGSRrJTJZ4dj3i096SmPR2SWrvBBZCNHJk13BNLARmyZmkv+iG09dFk7U0qAXjsH1HlPU+2mht08c+9nf0Q3lXn0QenCJo/xqJ6BFj0T9j1qVvTC4dceuJNQy8ft+C3ih1lhrlE8KVA1H2xs2vXwldWzuy3hU1SBpi/yl1KYbmWw7ew5twflwG5w6rJ6JBLn5lOtPTvbAr58deDA9cFrvnV3ig9uEtQu2cNc2kQ26wCInIZoo1+2xc7yboKkUU38h44QSf+tBEO/WihpH88O5Q28RkBldjO5Z+nhenuRkETwy78LJP2g764KtHf0IWYlsbcmKwB/VruL/gIawuKVQZ13s/j/eRKh364wKJ3VPNOTdmn7cdcurnZo6OujRlv9vUEuiTbBch0edp915am8KuJsPaTANCjPoI9eQJLfJ7iVgqX/v0iOWTiMyJmjbLo5lmYJaDhYPpE3Ayf7zwjAk0tI6/t26heDMBbscHF60Oxsb9v1mD8jmI7uBVnG1o4Ju0Fr0EBv3JSiN433iPH1ygHzV6SGfxwfEkfXvSsqUhsQC8GiNaNn4/J8vkIUU7ME5jv8Dym0bZH105NOXvNClbu9/80TVGV9IatFPBpqtSMSEd3YyKSejEAHAz/AdMG4COYDMBa//wx2BIUJqpcpwvOUnQhppIObzg5LBOGAVtg0qtWJDavhwGuWrc7jB72gSCLf4nIk8ax+RmnsU0RzRuDoCZWMtJInAvG1pKSGExbLcRipnW8iT0McNw5+3yEc5/n78AZfxqgKyO8Qhk6t7YH5JxDd+5ISSHeaHiAxFIoCl0BW8JSNbYGrsRHwxDVjXtBVyF82ko53af16TaeGUwVvVeEhWVgLQtiYgaAGktnhXMv/uPtHRMi2L9AYNzoK2eYuAISaO4oTZdPFDSzTlIt9FBWlw52ErUcdumZA0T7umCQAoh9y8ffUdRrbDZgaeO9F3C8xLD0MIBHcpEIJu0ZTl8twV6LiDyP/czHf+wqj5ArIIG5LSFxrx8TcujzMwV9ADMGDKUJT4mmVhNdMtaij0716D9fjdITf7UgTHn5KYAJbUMk1yJA9gN8/A3QiffbB3NczFuaBjYBm1FY7JgY+UpdngeLaW/q85ZG48MOfX++oqWT+xM/EZZxFYpum11Bn3qnJo2CvWtKzFm876dpPJtpzlD4A6qmkdNwYMIkf8v14sE24Ju5N3WCQdvyOES1dgufyeI9lw1DNnn05QslXQSDUTqJy94wPURXTIKJOYBKgU9jIScxzbk9PgPg34WwFHHQcTptLEoeRmy3lvTKifyJgJ3HDLl0RsdgAl4+UdN7x2dmdGKk3jDdpnrYLPoIlKLgrtdLWQ8IQdcj70K+7zNAVInZwRyweoEOEAW9wCf79L6dk19sYWxpxSz5dPfnd4SEh1VGH0UZv2PKCEULx+LUmfzxa8Yw9RRAGz1lzebffuskztiBKTzwyUbnfOmooB3H/XXqnMK76YhLr7ZL+AjEqmWrYz1my+fVnpEImb7w4tE8cwgeYhkkrH2cz+2RU35qKhDmfTaGusAn7pyncGLTw7shWnMIbQS9n+uMQvyfFgD+aDgKDFANr6Js0/hK6buh5UNiZQuTXw609oQ1hdcF5IQRXfUYqMYFePjv1VYbMvqZg5JW/7Wfc0uvfJn8+NnrUdrUZlFvWrMKONT5fOBI76OFaQ2b8NjI4a56aYcjYzFjrQmyAphITL+HYpOcH2A75ebDQz+B5XdvRem/4Bmk4rL/9Mt4qn8MPHZqCIM4u6CxoSguVRLbUdTv4AC4wtXYYTNWdoqa8TihJ9AzgL7IYkWNXbm+AreVP/wte0nwf29G6Y6XYV8wMNz0eQkviR3BUZG72rMfG7ceYYW1b819XlSMn2AAYynVKcLjJRo6xj/+rBiADOGdbBE87lp02xZBd78SgcNn+oTaD4PCt17qpu9sE5hawjk0SRflWxEcTLhuX/r1JjbnrS6PXjgMO0L2OmRidTn/7tNc0WjYhc15WGMpycSE86C4PfK6pGcPuHTFZBdzdkXn1CgaAbsNTxs5cT88iTOIuDevP6Dp9wdwTmyEbfYcL5A6sU3/6bcUXTnZydABxdBDrznUGrEoj0sXqQFP5wkPTVrMEPPWuk8KS11ZSsEfydrHRjf2FWSnjglViA+o0FQLCjJvn4h69LcuhY+gLhiT2OUhWa9PVi+rAA3wP7y7UdG5NelZAx99PUL37uB1hTOzimR1F/Men12E2MGnxNzV3m5pyWkcVVqKiQlsMGfnKye+svWNGSJ+j3s5j+n8icmE2JXdI+K/uWyqxLvhTK6M0k0zJb1vgt0jWfrmP4qM/7MrSj/fC8bjmIO+GQL0m8PIscvLLkgArx1x/yUzC2AcuiC4BwpLLF9WYvyqxqnRfqSP7/06GJaN7/TBruAnYVPo9uAEAlJZvlSIs0z/OlibtzDgLByjaTGWg6fDg6gay8ceYDncqbEc7NFT+4n+chJxBhAvfRYM+1dY7DsMoDEdzACpW11sIBPez0CyOFYgwpQRmubByja7TtAUjPcjYbDpPYdPKNjnK/d4ngfzWVXHoOXv7fDoxTZDm48Q/bUTg/4AYWNxGAQqqLY8MJ8GA0g66Uookxx7yEML5+KUjmyJ5Szm/5JgAO5lRnsI/3LpmnMkbOwWCJBbAXsc4vt5hI09vpfDxiC+ISIH0hOYzDz08EDDnak0yN2f1QQ2eu5A5Ei13y36Py/6HehvUOgcuvE8hH81YD2eB/I8JnbteuJNB2Fjho44mCmk4DNmylSJn6SrX6SqI+/3Tw8BrNYehC/ANMNyMWApAmIsqOcgEIumDDECKN2mVaDbf+ScEM3Ge7+9NUrbTtiYyp0hNmOpQhos9Ub79RnmCXYq7fYkdbiKEJQMzTMWiXymhnQhyW8+0BxOK+YQn3O9GzrQtJyuruQAdna8vGKCQ1+7OEQ1ORb36YA3faRF9yLu8PbNUXrhSMxmwOV4hlEX8uguTAvHVvA+LL1r459dWKw83GWwaunRhlbXX8FsR+hZoHwFIdmENHvUpI/djsMcxXuC5A3MPf89Yx26Y25xiB8naRV6/sJxgl4+4tBbsCPwcgGPQMeigvZ3uLR4kkUjYeqrwIP4pxLfazAl4ZVADju7anLMLyDqufQ6DoCD76VfR/wdxbqC5jiZXT8GYWZ2BkmDYWPOVET93jbbxvQuxQBcQKzVodvefrENv0C3x+2b9ZDnDtt093a4hPdYG1IBJWgGpMkd7wrRnXMM1dmOb7BKlbtg93lMEuI1CZY8EhRnUBafPNf+/AWKxsPBMiiJTcufngFoEoxlYfSgtfsU/fFguiuS8CieGKLvzZO+hzGEXFGTT3NDh2WViRzEMeY47KX4agpr/JdP9OjScemZXAuJwSUNNmwPLpxGY29lbLlYUfnZHo176VPz4jqbvozIZnY2Tb9UjlsKWgvX86pMx0HpSNEK+DuKzQCMjGrpwrfeSmlqzTEaMqqOYwGunap8CRUvyNbHbbAZbDuW2YrhZXAyXTYZjFMsMYC2oMd3ODLcKsPVlW0gfmuxBQBb+WbXa5oJE2tQU+NoCz6CcPJIkAI85XvuYGYMwO27Bsw0EtbE01UVtMlMa/y1Mu3l+stEN4Iu34CNtaiJ/dUvHQ8NOUgaaR+MsI3g78ex/f+M8FZQCLcd7X2vT7GkP6dBr5g1Cm7oxeAA0Brbyr/h056hgxl7B0zgRUu++Lc0wrOLCESarZ9TrxAaxh4GscRRxQc6BfFKYCaJfRUuGMUm7nhNmZQeWl6mNRbAdnAtPsYtY17qadHQ6s6qNOOgDgs6E/MQ958VQAMUmlwtILox+TttCma7QDsbfnBqR6apYYTvm5dpsaHnB6gh427linwGwPi7HXvNF20mEGMAj6oyC8AZOiKyqOEsaH61IV5CjhGcPREi0AOORzKvrBpGJGaggiZILJwzhMhFtY3f6zNAmE7swe39sa3hCgqO/zJG5QgsrZYA/X0XrwoEViVKTD4wtR0uZ5kmZp5CJ6Yx1n3ekqA5v9tngOdXjOnA963FdA7ljlB4dDAKMk/JOm1XNvsqFaHBTGMIgZdO0zzGAIwCCLX1Z35ljpS3W4leq8EgZDZz+l51FAqB6PLYBHx9/HW+BOAf8KX8I/QAt5gGoWQ9Kw5oUK6pYEyYGWYEakGFALq+jmBvG9A6DmQPAxy239wBW/erImHtO54p31cGoh1uVVkMo/kGrV/9vM/wKae3OzkT0csiCPRVhLpzEGqhEtNWaO+1s5jWp1MPA+xZcm5EGfM0joMteGJjyhsnFf0F/nlBTzuOa7iXQ2Im0g3fj7kwr0IMuKc/Dq7JPvy8Gzr4Hw449Nhe+BEWsMMxbRES9vsnQes4nnuRG01YpR31BV9NKKBKxtpwByTAw7tcunMuu1MnYjcOavGv3ZivPrIbC0LYSwwOwT0pBK+fX72haHMrVgYTQE/42pOXM3TD/Lf3FCQeVhYKR39gGRypPPFEAjCAICGFaw42d3ZM3ilCVsF3C+Uond8dgJcNwrxunB72d/ROAK3oX084Hv3gzw7CvRBF3Mdszv5/HLb+8on0wBRQxZnwfapJr3CWuQSWr+FWvSN0dH9LYhX9mHTeauebssq6XedxL55EABK/81jqQjxeNMqlJQ2IxBkpgOyCqkmJ4PjfuyHadx7TWPs39Fp7zOe/X6YSuCHZfa3T/dam5fbXE8HtxwA4K2i6EvpFI4q3XTwvkLBzZRhbtsWCuxJBLux3TIsognAyBQ26CK6JuWksYMcA0CWNnLNxmdiZWGk/BuCH89e4q3EEaVOxj4ktbt8/g6akSDrzOPDfJHzbjeOtaVlqLe8LbM8soNcDQQ/EnESL23R+exA+vXBTcj/Q93mxxdADyUBPygCnOtXTiBx9EbtLJytTvldCGPBp6OrNTNNkYCdlgFdWiih2kboXQ0c5lTgGmIYg8k+YpsmakpQBOKOMhH6NMwO387Fj5VSaGPD3AIjoVxyjHk/VgpTU5ZMmYRn8blkKpEJd8O+z5w+iqb+3pUlgP/PkKSUDcPZRSv1KR7xNZSmQHHlBvss001Gvpb3L/sVAcA7IAE8uERFMyG/HB4djlBWCgRAZqGdMK6aZZ76eauyPwzsgA3Am//x51/u1hBtUOZUGBnxagWY+7QYBeVAG4PIi4n0VCwlHOdS5nIKNAYF4SqaV0tZX0oE0LYo2f7hit3DdO2SvpaN0qi/nKTQG/OV8171zwwrh+/wN9v60GIArcSfa95mI94xMejL3YK8pPy8EBnzadLvr69948/5035fRwO6fKyyt57CzQB22GEv3HeV8BcAAi35ofkel575747JwrwWfgV6ftgTgSrhirb0v+lFE5VnBQHgt7DN0Yz/ax/O+mAnxGciMGIALbF4W+m+sEzwowxkJDy5aTnnCAIt+DM8PMW0yfUXGDMAvEOrELQiHaS7rA5miO/f5eakXTobN2O735mxqz4oBmpfUt9uRzusw3XiL7c3lVBwM+LZ+1+y3o53XNS8R2IEo8zQkOb5gjbNI22oNGVFdVgozR/6QSkDpw0r/Sel6TRub7PXZ1jWk7uu/OOrcgPNHnLKRKFsSZFEOBjk29yjHuWEoxOc3D4kBuIKW5eGfC9d8AVoo9kwdcnVcZTkNhAHgGE7FCEBwb9oA3A+UNZ1nOaFY8zJ1P3n6Vh+wsrk4Hbxnlwe49XEc1bc2N4Xuy66S3qVywgBcZctSdQ/8zm/1JUGZCXpjORe/mPgsZYHjlibgOkdpSEpgMhiw+fRnpS3uxQ4a2AmtbC1MhqOM70Hh4zGfxX6uen4chpxJgHiFm5vUfao78nFoqB3lKWIcK9lfGYdw7TgpI5GP55r4DFXOJUC8qXPWOpcppR5GRGoDfAvjt8vXDDDg+/O7er/Q+rrmZfazGRRNO2vOJUD8zVsAsB09udi43gbfYlheO4ijZvArcMWhXIiT22A7p96fL+IzIHmTAPFWNq4ztcZ4d8NU+UkOoS8bjOKYSX71V/W4W2K9RSh1S7YWvuS197+bdwaIv3L+Wvd67Lf+XUSp1hc75CwOU9Cu/qKOa9qgPH+pZZn1UCHgKxgDcGPmrY7MVJb6obHV5dBpEbJU1g18IrOWz7Hijve09rybNi0P42TkwqS86QDJwOeGNZxUS0RU3wLzcdvbXjfgsR5LuZgxtQnHudndv3VpIYnPNCqoBEhkiktWdZ/nWtY3jZDX8G4JhneLfhslCb99BG0aYfQvPcf9xuYVFa8Vo/lFY4B4YxvXuEuMJW/DBoYLsSUAlfoRtvF2pbryvJ6XTDA72ig8uqO5yVqXKm8h7hd0CEjWIEbAqQ6xSDjex4U223juG4tEKjpvJgM3y3vYoAE9nns9Aja2Yqy/rn7P3kXFJj43JlBY/sAjB0e014++GoLg00ap+dxTNJ/IksUWbFlSKrfF0ACJ/W9jx7MgxM7Qj13d+ustTRNTxurlFoDBawsUA8TBnbMZ84RDdAWONfskhoXFIiSqsL0hxCZYA+shwU7o7XwYH2IosCkzNpIXT2utH9IT1FNb5gpm50ClQDJAIobmPWVmKk+zVPgg9i2aBWYAI3Cvwh1WGoKQoM37mzAy0XEoMXr6dkD5Gyi4j8GQsyMIIKaCIfAMEAf8qnUm3OF1L3SFtRyIfT/QPAPMYLFAYBEb2walQAzBBMdOkVibxzHx+GCLXfzcgV04n7GMt9o6cnDj+k+8A0dTBz+VDAMkovLqx0xoX61zgdHqUhB+EY5BvQjCoEGEYU7hFvkmZxCG+YH/ZSspQGiOimZdhD++/xTqxuKWh9v7UO/LQur10Ob/1NBl//nxFLtwJMIetO8lyQB9kdj4aFutV1czFfrWLBzqPBvziBmeVu8A5XHCj64VNjajZUsb8wKbG5hBEhmDiczEjhOas3I+x9NaiHY8O8TnKkHy7FDa2+oo2h52TuyJb7mOnCWbhgUDJMP+omdNReRkV72tzdguq2oc9mQei82w3wnSzgG5p4IZxmPj3Bq/rDF8XsJB6Bh7cEz9Vjx/VUjVWukeP8RHq1FX29ENKxuwQ/DwS/8P38cDo9Hka/cAAAAASUVORK5CYII=",
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
  const PALETTE = ["#1A87FF", "#2F88FF", "#F3A23A", "#8B6CFF", "#00C56C", "#FF9F0A", "#5B4BFF", "#EF4444"];
  const SURNAMES = ["赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈", "褚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许", "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏", "陶", "姜"];
  const MASK_GRID_BLUES = ["#0A6FE0", "#1A87FF", "#2F88FF", "#3B92FF", "#4B7CFF", "#5B8FFF", "#6BA0FF", "#7CB1FF", "#8DC2FF"];
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
    "日志脱敏改造"
  ];
  function avatarColor(name) {
    return PALETTE[hashStr(name) % PALETTE.length];
  }
  function avatarLetter(name) {
    const s = String(name || "?").trim();
    const ch = [...s][0] || "?";
    return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
  }
  function disguiseTitle(seed) {
    const tid = hashStr(seed);
    const n = tid * 2654435761 >>> 0;
    if (n % 2 === 0) {
      const org = MASK_WORK_ORGS[n % MASK_WORK_ORGS.length];
      const obj = MASK_WORK_OBJS[(n >>> 3) % MASK_WORK_OBJS.length];
      const act = MASK_WORK_ACTS[(n >>> 7) % MASK_WORK_ACTS.length];
      const mode = (n >>> 11) % 3;
      if (mode === 0) return `${org}${obj}${act}`;
      if (mode === 1) return `${org}·${obj}${act}`;
      return `【${org}】${obj}${act}`;
    }
    return MASK_WORK_TITLES[n % MASK_WORK_TITLES.length];
  }
  function displayTitle(id, real) {
    return isMaskTitle() ? disguiseTitle(id) : real;
  }
  function feishuText(key) {
    const title = disguiseTitle(key);
    const cleaned = [...String(title || "?")].filter((c) => !/[\s#【】《》*·.,，。!！?？\-_/\\]/.test(c));
    const src = cleaned.length ? cleaned : ["?"];
    let h = 0;
    for (const ch of src) h = h * 31 + ch.charCodeAt(0) | 0;
    const n = Math.min(src.length, Math.abs(h) % 3 + 3);
    const text = src.slice(0, n).join("");
    if (/^[a-zA-Z0-9]+$/.test(text)) return text.toUpperCase();
    return text;
  }
  function fsIconHtml(cls, icon, bg = "transparent") {
    return `<span class="${cls} is-fs-icon" style="background:${bg}"><img src="${icon}" alt="" loading="lazy"></span>`;
  }
  function feishuTextHtml(cls, key, hollow) {
    const text = feishuText(key);
    const chars = [...text];
    const len = chars.length;
    const color = avatarColor(key);
    const label = len === 4 ? `${escapeHtml(chars[0] + chars[1])}<br>${escapeHtml(chars[2] + chars[3])}` : escapeHtml(text);
    const inner = `<span class="im-avatar-text" data-len="${len}">${label}</span>`;
    if (hollow) {
      return `<span class="${cls} is-text-avatar is-hollow" style="background:#fff;color:${color};border:1.5px solid ${color}">${inner}</span>`;
    }
    return `<span class="${cls} is-text-avatar is-solid" style="background:${color};border:1.5px solid ${color}">${inner}</span>`;
  }
  function seededShuffle(arr, seed) {
    const a = arr.slice();
    let s = seed >>> 0;
    for (let i = a.length - 1; i > 0; i--) {
      s = Math.imul(s ^ s >>> 16, 2146121005) >>> 0;
      s = Math.imul(s ^ s >>> 15, 2221713035) >>> 0 || 1;
      const j = s % (i + 1);
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }
  const LIST_MASK_IDS = PINNED.map((p) => p.id).concat(Array.from({ length: 16 }, (_, i) => "fake:" + i));
  const LIST_MASK_MODES = seededShuffle(LIST_MASK_IDS.map((_, i) => i % 4), 1597463007);
  function feishuMaskMode(key) {
    const idx = LIST_MASK_IDS.indexOf(String(key));
    if (idx >= 0) return LIST_MASK_MODES[idx];
    const n = hashStr(key) >>> 0;
    return (Math.imul(n ^ n >>> 16, 2654435769) >>> 0) % 4;
  }
  function solidMaskHtml(cls, name, seed) {
    const key = seed || name || "";
    const n = hashStr(key);
    if (currentSkinId() === "feishu") {
      const mode = feishuMaskMode(key);
      const tid = n >>> 0;
      if (mode === 0) return fsIconHtml(cls, CHAT_ICONS[Math.abs(tid * 31) % CHAT_ICONS.length]);
      if (mode === 1) return fsIconHtml(cls, PIN_AVATARS[tid % PIN_AVATARS.length]);
      return feishuTextHtml(cls, key, mode === 3);
    }
    if (n % 2 === 0) {
      const cells = [];
      for (let i = 0; i < 9; i++) {
        const ch2 = SURNAMES[(n + i * 17) % SURNAMES.length];
        const color = MASK_GRID_BLUES[(n + i) % MASK_GRID_BLUES.length];
        cells.push(`<span style="background:${color}">${escapeHtml(ch2)}</span>`);
      }
      return `<span class="${cls} is-grid-mask">${cells.join("")}</span>`;
    }
    const ch = SURNAMES[n % SURNAMES.length];
    return `<span class="${cls} is-text-avatar is-solid" style="background:${avatarColor(ch + key)}"><span class="im-avatar-text" data-len="1">${escapeHtml(ch)}</span></span>`;
  }
  function personAvatarHtml(cls, name, src, seed, forceReal) {
    if (!forceReal && isMaskAvatar()) return solidMaskHtml(cls, name, seed || name);
    if (src) return `<span class="${cls}"><img src="${escapeHtml(upgradeAvatar(src))}" alt="" loading="eager" decoding="async" referrerpolicy="no-referrer"></span>`;
    return `<span class="${cls} is-text-avatar is-solid" style="background:${avatarColor(seed || name)}"><span class="im-avatar-text" data-len="1">${escapeHtml(avatarLetter(seed || name))}</span></span>`;
  }
  function groupAvatarHtml(cls, srcs) {
    const pics = (srcs || []).filter(Boolean);
    if (!pics.length) return "";
    if (pics.length === 1) {
      return `<span class="${cls}"><img src="${escapeHtml(upgradeAvatar(pics[0]))}" alt=""></span>`;
    }
    const cells = [];
    for (let i = 0; i < 9; i++) {
      cells.push(`<img src="${escapeHtml(upgradeAvatar(pics[i % pics.length]))}" alt="">`);
    }
    return `<span class="${cls} is-group">${cells.join("")}</span>`;
  }
  function convAvatarHtml(id, name, src, forceMask) {
    if (Array.isArray(src) && src.length && currentSkinId() !== "feishu") return groupAvatarHtml("im-conv-avatar", src);
    if (isMaskAvatar() || forceMask) return solidMaskHtml("im-conv-avatar", name, id);
  }
  function upgradeAvatar(src) {
    return String(src || "").replace(/_normal(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2").replace(/_mini(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2");
  }
  function bindTitlebarOnce(bar) {
    if (bar.dataset.bound === "1") return;
    bar.dataset.bound = "1";
    bar.addEventListener("click", (e) => {
      if (e.target.closest(".im-dark-toggle")) {
        toggleColorTheme();
        return;
      }
      const act = e.target.closest("[data-act]");
      if (!act || !bar.contains(act)) return;
      toast(act.dataset.act === "create" ? "装饰按钮 · 创建" : "装饰按钮 · 投屏");
    });
  }
  function ensureTitlebar() {
    const skin = SKINS[currentSkinId()];
    let bar = document.querySelector(".im-titlebar");
    if (skin.titlebarHeight === 0) {
      bar == null ? void 0 : bar.remove();
      return null;
    }
    if (!bar) {
      bar = document.createElement("header");
      bar.className = "im-titlebar";
      (document.body || document.documentElement).appendChild(bar);
    }
    bindTitlebarOnce(bar);
    const src = nativeAvatarSrc();
    const name = nativeDisplayName();
    const html = `
    <div class="me-chip" title="${escapeHtml(name)}">
      <div class="im-rail-avatar">${personAvatarHtml("im-rail-me-ava", name, src, "me", true)}</div>
    </div>
    <div class="title-actions">
      <button type="button" class="t-btn im-dark-toggle" title="深色模式">${isDarkEffective() ? ICONS.sun : ICONS.moon}</button>
      <button type="button" class="t-btn" data-act="cast" title="投屏"><span class="dot"></span>${ICONS.monitor}</button>
      <button type="button" class="t-btn" data-act="create" title="创建">${ICONS.plus}</button>
    </div>`;
    if (bar.dataset.sig === html) return bar;
    bar.dataset.sig = html;
    bar.innerHTML = html;
    return bar;
  }
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
  function ensureRail() {
    var _a, _b, _c, _d;
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
    const head = skin.groups ? `<div class="im-rail-head">
        <span class="im-rail-me">${meHeadAva}<span class="im-rail-avatar-badge" hidden></span></span>
        <span class="im-rail-user-name">${escapeHtml(uname)}</span>
      </div>` : currentSkinId() === "feishu" ? `<div class="im-rail-head">
        <div class="im-rail-avatar-wrap">
          <div class="im-rail-avatar">${meHeadAva}</div>
          <span class="im-rail-avatar-badge" hidden></span>
        </div>
      </div>` : `<div class="im-rail-head">
        <div class="im-rail-org-chip" title="点击修改团队名称">
          <span class="im-rail-org-logo">${escapeHtml(skin.letter)}</span>
          <span class="im-rail-org-name">${escapeHtml(org)}</span>
        </div>
      </div>`;
    const real = skin.real.map((it) => itemHtml(it, it.key === on)).join("");
    const deco = skin.deco.map((it) => itemHtml(it, false)).join("");
    const groups = skin.groups ? `<div class="im-rail-groups"><div class="im-rail-group-title"><span>分组</span></div>
        ${[["unread", "未读", "mail"], ["at", "@我", "at"], ["single", "单聊", "user"], ["group", "群聊", "msg"], ["marked", "标记", "bookmark"]].map(
      ([k, l, i]) => `<div class="im-rail-item" data-group="${k}" role="button">${ICONS[i] || ICONS.msg}<span>${l}</span></div>`
    ).join("")}
      </div>` : "";
    const bottomActions = skin.actions === "rail-bottom" ? `<div class="im-rail-item im-dark-toggle" role="button">${isDarkEffective() ? ICONS.sun : ICONS.moon}<span>${isDarkEffective() ? "浅色" : "深色"}</span></div>
       <div class="im-rail-item xim-skin-btn" role="button">${ICONS.swap}<span>切换外观</span></div>` : "";
    rail.innerHTML = `${head}<div class="im-rail-items">${real}${deco}${groups}</div>
    <div class="im-rail-bottom">${bottomActions}<div class="im-rail-item" data-key="more" role="button">${ICONS.more}<span>更多</span></div></div>`;
    (_a = rail.querySelector(".im-rail-org-chip")) == null ? void 0 : _a.addEventListener("click", () => {
      const v = window.prompt("团队名称", getOrgName());
      if (v == null) return;
      setOrgName(v.trim() || skin.orgName);
      ensureRail();
    });
    (_b = rail.querySelector(".im-rail-me")) == null ? void 0 : _b.addEventListener("click", (e) => {
      e.stopPropagation();
      const p = nativeProfilePath();
      navigateX(p);
    });
    (_c = rail.querySelector(".im-rail-avatar")) == null ? void 0 : _c.addEventListener("click", () => {
      const p = nativeProfilePath();
      navigateX(p);
    });
    (_d = rail.querySelector(".im-dark-toggle")) == null ? void 0 : _d.addEventListener("click", () => toggleColorTheme());
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
  function highlightRail() {
    const on = activeKey();
    document.querySelectorAll(".im-rail-item[data-key]").forEach((b) => {
      b.classList.toggle("active", b.dataset.key === on);
    });
  }
  function refreshMe(rail) {
    rail = rail || document.querySelector(".im-rail");
    if (!rail) return;
    const uname = nativeDisplayName();
    const src = nativeAvatarSrc();
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
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function toggleLike(id, wasLiked = false, article = null) {
    var _a;
    const container = document.getElementById("noteContainer");
    const detailLike = container == null ? void 0 : container.querySelector(".interact-container .like-wrapper, .like-wrapper");
    const art = article || (id ? findTweetArticle(id) : null);
    const cardLike = art == null ? void 0 : art.querySelector(".like-wrapper, .interactions, .like");
    const btn = detailLike || cardLike;
    if (btn) {
      btn.click();
      await sleep(200);
      const isNowLiked = isLikeActive(btn);
      const count = countIn(((_a = btn.querySelector(".count")) == null ? void 0 : _a.textContent) || "") || extractStat(btn);
      return { ok: true, liked: isNowLiked !== wasLiked ? isNowLiked : !wasLiked, count };
    }
    return { ok: false };
  }
  async function toggleRetweet(_id, wasRetweeted = false, _article = null) {
    var _a;
    const container = document.getElementById("noteContainer");
    const btn = container == null ? void 0 : container.querySelector(".interact-container .collect-wrapper, .collect-wrapper");
    if (btn) {
      btn.click();
      await sleep(200);
      const isNowCollected = !!btn.querySelector(".collect-active, .active") || btn.classList.contains("active");
      const count = countIn(((_a = btn.querySelector(".count")) == null ? void 0 : _a.textContent) || "") || extractStat(btn);
      return { ok: true, retweeted: isNowCollected !== wasRetweeted ? isNowCollected : !wasRetweeted, count };
    }
    return { ok: false };
  }
  async function toggleBookmark(id, wasBookmarked = false, article = null) {
    return toggleRetweet(id, wasBookmarked, article);
  }
  function getProfileFollowState() {
    const btn = document.querySelector(".follow-btn, .note-detail-follow-btn");
    if (!btn) return { visible: false, following: false, btn: null };
    const txt = (btn.innerText || btn.textContent || "").trim();
    const following = txt.includes("已关注") || txt.includes("互相关注");
    return { visible: true, following, btn };
  }
  async function toggleFollowOnProfile() {
    const state = getProfileFollowState();
    if (!state.visible || !state.btn) return { ok: false, msg: "未找到关注按钮" };
    state.btn.click();
    await sleep(300);
    const nextState = getProfileFollowState();
    return { ok: true, following: nextState.following };
  }
  let activeImgModal = null;
  function openImImageModal(src, photos = []) {
    if (!src) return;
    closeImVideoModal();
    closeImImageModal();
    const list = Array.isArray(photos) && photos.length ? [...photos].filter(Boolean) : [src];
    let idx = list.indexOf(src);
    if (idx < 0) idx = 0;
    const multi = list.length > 1;
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
      <a href="${escapeHtml(list[idx])}" target="_blank" rel="noopener noreferrer" class="im-img-btn im-img-open" title="在新标签页打开原图">${ICONS.external}</a>
      ${multi ? `<span class="im-img-count"></span>` : ""}
      <button type="button" class="im-img-btn im-img-close" data-action="close" title="关闭 (Esc)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="im-img-modal-stage">
      ${multi ? `<button type="button" class="im-img-nav im-img-prev" title="上一张 (←)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>` : ""}
      <img class="im-img-modal-img" src="${escapeHtml(list[idx])}" alt="预览图片" draggable="false">
      ${multi ? `<button type="button" class="im-img-nav im-img-next" title="下一张 (→)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>` : ""}
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
    function close2() {
      if (!modal.isConnected) return;
      modal.classList.remove("is-active");
      modal.classList.add("is-closing");
      setTimeout(() => {
        modal.remove();
        if (activeImgModal === modal) activeImgModal = null;
      }, 200);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close2();
        return;
      }
      if (multi && img) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          if (idx > 0) show(idx - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          if (idx < list.length - 1) show(idx + 1);
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    modal.addEventListener("click", (e) => {
      const navBtn = e.target.closest(".im-img-nav");
      if (navBtn && multi) {
        const dir = navBtn.classList.contains("im-img-next") ? 1 : -1;
        const next = idx + dir;
        if (next >= 0 && next < list.length) show(next);
        return;
      }
      const btn = e.target.closest(".im-img-btn");
      if (btn) {
        const action = btn.dataset.action;
        if (action === "close") close2();
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
      if (e.target === backdrop || e.target === stage) close2();
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
    function onMove(e) {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform(false);
    }
    function onUp() {
      if (!isDragging) return;
      isDragging = false;
      updateTransform(false);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
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
    function show(i, smooth = true) {
      idx = Math.max(0, Math.min(list.length - 1, i));
      if (img) img.src = list[idx];
      const open = modal.querySelector(".im-img-open");
      if (open) open.setAttribute("href", list[idx]);
      const count = modal.querySelector(".im-img-count");
      if (count) count.textContent = `${idx + 1} / ${list.length}`;
      const prev = modal.querySelector(".im-img-prev");
      const next = modal.querySelector(".im-img-next");
      if (prev) prev.disabled = idx === 0;
      if (next) next.disabled = idx === list.length - 1;
      scale = 1;
      rotate = 0;
      translateX = 0;
      translateY = 0;
      updateTransform(smooth);
    }
    if (multi) show(idx, false);
  }
  function closeImImageModal() {
    if (activeImgModal) {
      activeImgModal.remove();
      activeImgModal = null;
    }
  }
  let activeVideoModal = null;
  let parkedVideo = null;
  function restoreParkedVideo() {
    var _a;
    if (!parkedVideo) return;
    const { host, parent, next, style } = parkedVideo;
    parkedVideo = null;
    try {
      (_a = host.querySelector("video")) == null ? void 0 : _a.pause();
      host.classList.remove("xim-video-lifted");
      if (style == null) host.removeAttribute("style");
      else host.setAttribute("style", style);
      if (parent == null ? void 0 : parent.isConnected) parent.insertBefore(host, next);
    } catch {
    }
  }
  function closeImVideoModal() {
    restoreParkedVideo();
    if (activeVideoModal) {
      activeVideoModal.remove();
      activeVideoModal = null;
    }
  }
  function bindHoverControls(host, vid) {
    if (vid.__ximHover) return;
    vid.__ximHover = true;
    vid.controls = false;
    let timer = 0;
    host.addEventListener("mouseenter", () => {
      window.clearTimeout(timer);
      vid.controls = true;
    });
    host.addEventListener("mouseleave", () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        vid.controls = false;
      }, 500);
    });
  }
  function playNativeHost(host, hoverControls = false) {
    const vid = host.querySelector("video");
    if (vid) {
      vid.playsInline = true;
      vid.setAttribute("playsinline", "");
      if (hoverControls) bindHoverControls(host, vid);
      else vid.controls = true;
    }
    const tryPlay = () => {
      var _a;
      return (_a = vid == null ? void 0 : vid.play) == null ? void 0 : _a.call(vid).catch(() => {
      });
    };
    tryPlay();
    const btn = host.querySelector(
      '[aria-label="Play"], [aria-label="Play video"], [aria-label="Play Gif"], [aria-label="播放"], [aria-label="播放视频"], [aria-label="播放 Gif"], [data-testid="play"]'
    );
    if (btn) btn.click();
    else if (vid && vid.paused) host.click();
    setTimeout(tryPlay, 80);
  }
  function waitForNativeVideo(root, ms = 2500) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      const tick = () => {
        const vid = root == null ? void 0 : root.querySelector("video");
        if (vid && (vid.currentSrc || vid.src || vid.readyState >= 1)) {
          resolve(vid);
          return;
        }
        if (Date.now() - t0 > ms) {
          resolve(vid || null);
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });
  }
  function liftHostInto(stage, host, inline, hoverControls = false) {
    if (!host) return false;
    if (host === stage || stage.contains(host) || host.contains(stage)) {
      stage.classList.add("is-playing");
      const v = stage.querySelector("video");
      if (v) {
        bindHoverControls(stage, v);
        v.play().catch(() => {
        });
      }
      return true;
    }
    if (!host.isConnected) return false;
    restoreParkedVideo();
    parkedVideo = {
      host,
      parent: host.parentNode,
      next: host.nextSibling,
      style: host.getAttribute("style")
    };
    host.classList.add("xim-video-lifted");
    if (inline) host.classList.add("xim-video-inline");
    host.style.cssText = inline ? "position:absolute;inset:0;width:100%;height:100%;opacity:1;pointer-events:auto;background:#000;" : "position:relative;width:min(960px,92vw);max-height:80vh;opacity:1;pointer-events:auto;background:#000;";
    stage.classList.add("is-playing");
    stage.innerHTML = "";
    stage.appendChild(host);
    playNativeHost(host, hoverControls);
    return true;
  }
  const cleanVideoUrl = (u) => u && typeof u === "string" && !u.startsWith("blob:") ? u : "";
  async function playInlineVideo(container, { src = "", poster = "", tweetId = "" } = {}) {
    if (!container) return;
    if (container.__ximBusy) return;
    container.__ximBusy = true;
    try {
      await doPlayInlineVideo(container, { src, poster, tweetId });
    } finally {
      container.__ximBusy = false;
    }
  }
  async function doPlayInlineVideo(container, { src = "", poster = "", tweetId = "" }) {
    if (container.classList.contains("is-playing")) {
      const v = container.querySelector("video");
      if (v) {
        if (v.paused) v.play().catch(() => {
        });
        else v.pause();
        return;
      }
      container.classList.remove("is-playing");
    }
    closeImVideoModal();
    const article = findTweetArticle(tweetId);
    let vid = null;
    if (article) {
      kickNativeVideo(article);
      vid = await waitForNativeVideo(article, 2800);
    }
    const playable = cleanVideoUrl(src) || cleanVideoUrl(vid == null ? void 0 : vid.currentSrc) || cleanVideoUrl(vid == null ? void 0 : vid.src) || "";
    const playBtn = container.querySelector(".im-video-play");
    playBtn == null ? void 0 : playBtn.setAttribute("hidden", "");
    if (vid) {
      const host = vid.closest('[data-testid="videoPlayer"], [data-testid="videoComponent"]') || vid.parentElement || vid;
      if (liftHostInto(container, host, true, true)) return;
      container.classList.remove("is-playing");
    }
    if (playable) {
      restoreParkedVideo();
      const v = document.createElement("video");
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      if (poster) v.poster = poster;
      v.src = playable;
      container.innerHTML = "";
      container.appendChild(v);
      container.classList.add("is-playing");
      bindHoverControls(container, v);
      return;
    }
    playBtn == null ? void 0 : playBtn.removeAttribute("hidden");
  }
  async function openImVideoModal({ src = "", poster = "", tweetId = "" } = {}) {
    closeImImageModal();
    closeImVideoModal();
    const article = findTweetArticle(tweetId);
    const marked = tweetId ? document.querySelector(`[data-xim-video="${tweetId}"]`) : null;
    let host = marked || (article == null ? void 0 : article.querySelector('[data-testid="videoPlayer"], [data-testid="videoComponent"]')) || null;
    const nativeVid = (host == null ? void 0 : host.querySelector("video")) || (article == null ? void 0 : article.querySelector("video"));
    const playable = cleanVideoUrl(src) || cleanVideoUrl(nativeVid == null ? void 0 : nativeVid.currentSrc) || cleanVideoUrl(nativeVid == null ? void 0 : nativeVid.src) || "";
    const modal = document.createElement("div");
    modal.className = "im-img-modal im-video-modal";
    modal.tabIndex = -1;
    modal.innerHTML = `
    <div class="im-img-modal-backdrop"></div>
    <div class="im-img-modal-toolbar">
      <button type="button" class="im-img-btn im-img-close" data-action="close" title="关闭 (Esc)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="im-img-modal-stage"></div>`;
    const stage = modal.querySelector(".im-img-modal-stage");
    if (poster && !playable) {
      const img = document.createElement("img");
      img.className = "im-video-modal-el";
      img.src = poster;
      img.alt = "视频加载中";
      stage.appendChild(img);
    }
    document.body.appendChild(modal);
    activeVideoModal = modal;
    requestAnimationFrame(() => modal.classList.add("is-active"));
    function close2() {
      if (!modal.isConnected) return;
      restoreParkedVideo();
      modal.classList.remove("is-active");
      modal.classList.add("is-closing");
      setTimeout(() => {
        modal.remove();
        if (activeVideoModal === modal) activeVideoModal = null;
      }, 200);
      document.removeEventListener("keydown", onKeyDown);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close2();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    modal.addEventListener("click", (e) => {
      if (e.target.closest("[data-action='close']") || e.target === modal.querySelector(".im-img-modal-backdrop")) close2();
    });
    if (article) kickNativeVideo(article);
    const vid = await waitForNativeVideo(article || host, 2800);
    if (activeVideoModal !== modal) return;
    if (vid) {
      host = vid.closest('[data-testid="videoPlayer"], [data-testid="videoComponent"]') || vid.parentElement || host;
      if (host && liftHostInto(stage, host)) return;
      vid.controls = true;
      vid.autoplay = true;
      vid.muted = false;
      vid.classList.add("im-video-modal-el");
      stage.innerHTML = "";
      stage.appendChild(vid);
      vid.play().catch(() => {
      });
      return;
    }
    if (playable) {
      const v = document.createElement("video");
      v.className = "im-video-modal-el";
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      if (poster) v.poster = poster;
      v.src = playable;
      stage.innerHTML = "";
      stage.appendChild(v);
      return;
    }
    if (!stage.childElementCount) {
      stage.innerHTML = `<div class="im-video-miss">视频未就绪，请再点一次</div>`;
    }
  }
  const seen = /* @__PURE__ */ new Set();
  function fmtXTime(dt, fallback) {
    if (!dt && fallback && fallback !== "刚刚") return fallback;
    const d = dt ? new Date(dt) : null;
    if (!d || Number.isNaN(d.getTime())) return fallback || "刚刚";
    const now = /* @__PURE__ */ new Date();
    const diffSec = Math.floor((now - d) / 1e3);
    if (diffSec >= 0 && diffSec < 60) return "刚刚";
    if (diffSec >= 60 && diffSec < 3600) return `${Math.floor(diffSec / 60)}分钟前`;
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    if (d.toDateString() === now.toDateString()) return `${hh}:${mm}`;
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return `昨天 ${hh}:${mm}`;
    const qst = new Date(now);
    qst.setDate(now.getDate() - 2);
    if (d.toDateString() === qst.toDateString()) return `前天 ${hh}:${mm}`;
    if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日`;
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }
  function statusInfo() {
    const m = location.pathname.match(/(?:explore|status)\/([a-f0-9]+)/i);
    return m ? { id: m[1] } : null;
  }
  function profileCardHtml(prof) {
    if (!prof) return "";
    const ava = personAvatarHtml("im-profile-avatar", (prof == null ? void 0 : prof.name) || "U", (prof == null ? void 0 : prof.avatar) || "", prof == null ? void 0 : prof.handle);
    const name = (prof == null ? void 0 : prof.name) || ((prof == null ? void 0 : prof.handle) ? "@" + prof.handle : "个人主页");
    const metaParts = [];
    if (prof.redId) metaParts.push(escapeHtml(prof.redId));
    if (prof.ipLoc) metaParts.push(escapeHtml(prof.ipLoc));
    if (prof.gender) metaParts.push(prof.gender === "男" ? "♂ 男" : "♀ 女");
    const subMeta = metaParts.join(" · ");
    const statItems = [
      prof.following ? `<div class="im-stat-chip"><span class="v">${escapeHtml(prof.following)}</span><span class="k">关注</span></div>` : "",
      prof.followers ? `<div class="im-stat-chip"><span class="v">${escapeHtml(prof.followers)}</span><span class="k">粉丝</span></div>` : "",
      prof.likesAndCollects ? `<div class="im-stat-chip"><span class="v">${escapeHtml(prof.likesAndCollects)}</span><span class="k">获赞与收藏</span></div>` : ""
    ].filter(Boolean).join("");
    const tabHtml = (prof.tabs || []).map((t) => `
    <button type="button" class="im-chip im-profile-tab-btn${t.active ? " active" : ""}" data-tab-idx="${t.index}">
      ${escapeHtml(t.label)}
    </button>
  `).join("");
    const bioHtml = prof.bio && prof.bio !== "还没有简介" ? `<div class="im-profile-bio">${escapeHtml(prof.bio).replace(/\n/g, "<br>")}</div>` : "";
    return `<div class="im-profile-head">
      ${ava}
      <div class="im-profile-meta">
        <div class="row1">
          <span class="im-profile-name">${escapeHtml(name)}</span>
        </div>
        ${subMeta ? `<div class="im-profile-sub">${subMeta}</div>` : ""}
        ${bioHtml}
      </div>
    </div>
    ${statItems ? `<div class="im-profile-stats">${statItems}</div>` : ""}
    ${tabHtml ? `<div class="im-profile-subbar">${tabHtml}</div>` : ""}`;
  }
  function linkifyText(text) {
    return escapeHtml(text || "").replace(/(https?:\/\/[^\s<&]+(?:(?:&amp;)[^\s<]*)*)/g, (m) => {
      const href = m.replace(/&amp;/g, "&");
      return `<a href="${href}" target="_blank" rel="noopener">${m}</a>`;
    }).replace(/\n/g, "<br>");
  }
  async function toggleTranslation(box, id) {
    const body = box.querySelector(".im-thread-pin-body") || box.querySelector(".im-tw-body");
    if (!body) return;
    const btn = box.querySelector('[data-action="trans"], [data-act="trans"]');
    const setLang = (lang, html) => {
      box.dataset.transLang = lang;
      if (html !== void 0) body.innerHTML = html;
      if (btn) btn.textContent = lang === "zh" ? "原文" : "译文";
    };
    if (box.dataset.transLang === "zh") {
      setLang("orig", box.dataset.transOrig || "");
      return;
    }
    if (box.dataset.transOrig === void 0) box.dataset.transOrig = body.innerHTML;
    if (btn) btn.textContent = "翻译中…";
    let p = transReqCache.get(String(id));
    if (!p) {
      p = requestXTranslation(id);
      transReqCache.set(String(id), p);
    }
    const s = await p.catch(() => "");
    if (!s) {
      if (btn) btn.textContent = "译文";
      toast("X 翻译没能用（接口受限或该推文不可译）");
      return;
    }
    setLang("zh", linkifyText(s));
  }
  const transReqCache = /* @__PURE__ */ new Map();
  function transWanted(t) {
    if (t.translated !== void 0) return t.translated;
    const s = String(t.text || t.domText || "");
    if (s.length < 2) return void 0;
    if (/[一-鿿㐀-䶿]/.test(s)) return void 0;
    return false;
  }
  function threadPinHtml(t) {
    const ava = personAvatarHtml("im-thread-pin-avatar", t.name, t.avatar, t.id, true);
    const photos = (t.photos || []).map((src) => `<img src="${escapeHtml(src)}" alt="" loading="lazy">`).join("");
    const body = linkifyText(t.text || "");
    const quote = t.quote ? quoteHtml(t.quote) : "";
    const transAct = transWanted(t) !== void 0 ? `<button type="button" class="im-thread-pin-act" data-act="trans" title="译成中文"><span>译文</span></button>` : "";
    const me = nativeProfilePath().replace(/^\//, "").toLowerCase();
    const isMe = me && t.handle && me === t.handle.toLowerCase();
    const followBtnHtml = !isMe && t.handle ? `<button type="button" class="im-profile-follow im-pin-follow-btn${t.following ? " on" : ""}" data-handle="${escapeHtml(t.handle)}" data-pin-id="${escapeHtml(t.id || "")}">${t.following ? "已关注" : "+ 关注"}</button>` : "";
    return `<div class="im-thread-pin" data-pin-id="${escapeHtml(t.id || "")}" data-profile="${escapeHtml(t.profileHref || "")}" data-handle="${escapeHtml(t.handle || "")}" data-lang="orig">
    <div class="im-thread-pin-head">
      ${ava}
      <div class="im-thread-pin-names">
        <span class="im-thread-pin-name">${escapeHtml(t.name)}</span>
        <span class="im-thread-pin-handle">@${escapeHtml(t.handle || "")} · ${escapeHtml(t.time || "")}</span>
      </div>
      ${followBtnHtml}
    </div>
    <div class="im-thread-pin-body">${body}</div>
    ${quote}
    ${photos ? `<div class="im-thread-pin-photos">${photos}</div>` : ""}
    <div class="im-thread-pin-actions">
      ${transAct}
      <button type="button" class="im-thread-pin-act${t.retweeted ? " is-retweeted" : ""}" data-act="repost" data-count="${escapeHtml(t.rtCount || "")}" title="收藏">${ICONS.repost}<span>${t.rtCount ? `收藏 ${escapeHtml(t.rtCount)}` : "转推"}</span></button>
      <button type="button" class="im-thread-pin-act${t.liked ? " is-liked" : ""}" data-act="like" data-count="${escapeHtml(t.likeCount || "")}" title="点赞">${t.liked ? ICONS.heartFilled : ICONS.plus}<span>${t.likeCount ? `点赞 ${escapeHtml(t.likeCount)}` : "点赞"}</span></button>
      <button type="button" class="im-thread-pin-act${t.bookmarked ? " is-bookmarked" : ""}" data-act="bookmark" data-count="${escapeHtml(t.bookmarkCount || "")}" title="书签">${t.bookmarked ? ICONS.bookmarkFill : ICONS.bookmark}<span>${t.bookmarkCount ? `书签 ${escapeHtml(t.bookmarkCount)}` : "书签"}</span></button>
      ${t.viewCount ? `<span class="im-thread-pin-act im-thread-pin-stat" title="浏览量">${ICONS.chart}<span>${escapeHtml(t.viewCount)} 次浏览</span></span>` : ""}
      <button type="button" class="im-thread-pin-act" data-act="open" title="在小红书打开">${ICONS.swap}<span>查看原文</span></button>
    </div>
  </div>`;
  }
  function ensureChatPanel() {
    var _a, _b, _c;
    let panel = document.querySelector(".im-chat-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "im-chat-panel";
      panel.innerHTML = `
      <div class="im-chat-header">
        <div class="im-chat-head-main">
          <span class="im-chat-avatar"></span>
          <div class="im-chat-titles">
            <div class="im-chat-title-row">
              <span class="im-chat-title"></span>
              <span class="im-chat-chips"></span>
            </div>
            <div class="im-chat-sub"></div>
          </div>
        </div>
        <div class="im-chat-tools"></div>
        <div class="im-chat-actions">
          <button type="button" class="im-icon-btn" data-act="refresh" title="刷新">${ICONS.refresh}</button>
          <button type="button" class="im-icon-btn im-hide-media-toggle${isHideMedia() ? " is-on" : ""}" data-act="hide-media" title="${isHideMedia() ? "显示媒体（图片/视频）" : "隐藏媒体：纯文本摸鱼模式"}">${isHideMedia() ? ICONS.imageOff : ICONS.image}</button>
        </div>
      </div>
      <div class="im-chat-body"><div class="im-feed-col"></div></div>`;
      (document.body || document.documentElement).appendChild(panel);
      (_a = panel.querySelector('[data-act="hide-media"]')) == null ? void 0 : _a.addEventListener("click", (e) => {
        e.stopPropagation();
        const on = !isHideMedia();
        setHideMedia(on);
        document.documentElement.classList.toggle("im-hide-media", on);
        syncChatHeader(panel);
        const listBtn = document.querySelector(".im-list-panel .im-hide-media-toggle");
        if (listBtn) {
          listBtn.classList.toggle("is-on", on);
          listBtn.innerHTML = on ? ICONS.imageOff : ICONS.image;
        }
        toast(on ? "已开启纯文本摸鱼模式（隐藏图片与视频）" : "已恢复显示图片与视频");
      });
      (_b = panel.querySelector('[data-act="refresh"]')) == null ? void 0 : _b.addEventListener("click", (e) => {
        var _a2;
        e.stopPropagation();
        refreshHomeFeed();
        resetChatMessages();
        (_a2 = panel.querySelector(".im-feed-col")) == null ? void 0 : _a2.scrollTo(0, 0);
        setTimeout(resetChatMessages, 600);
        setTimeout(resetChatMessages, 1500);
        setTimeout(resetChatMessages, 3e3);
      });
      const body = panel.querySelector(".im-chat-body");
      const feed = body == null ? void 0 : body.querySelector(".im-feed-col");
      feed == null ? void 0 : feed.addEventListener("scroll", onChatScroll);
      feed == null ? void 0 : feed.addEventListener("wheel", onChatWheel, { passive: true });
      feed == null ? void 0 : feed.addEventListener("click", onMsgClick);
      feed == null ? void 0 : feed.addEventListener("pointerover", (e) => {
        const q = e.target.closest(".im-quote");
        if (q) showQuoteFloat(q);
      });
      feed == null ? void 0 : feed.addEventListener("pointerout", (e) => {
        const q = e.target.closest(".im-quote");
        if (!q) return;
        if (e.relatedTarget && (q.contains(e.relatedTarget) || (quoteFloat == null ? void 0 : quoteFloat.contains(e.relatedTarget)))) return;
        quoteFloatHide = setTimeout(hideQuoteFloat, 120);
      });
      (_c = panel.querySelector(".im-chat-avatar")) == null ? void 0 : _c.addEventListener("click", () => {
        var _a2;
        const h = (_a2 = panel.querySelector(".im-chat-avatar")) == null ? void 0 : _a2.dataset.handle;
        if (h) navigateX("/" + h);
      });
    }
    syncChatHeader(panel);
    syncChatMessages();
    return panel;
  }
  function syncChatHeader(panel) {
    var _a, _b, _c, _d, _e, _f, _g;
    const id = getChatId() || chatIdFromRoute();
    const ava = panel.querySelector(".im-chat-avatar");
    const title = panel.querySelector(".im-chat-title");
    const chips = panel.querySelector(".im-chat-chips");
    const sub = panel.querySelector(".im-chat-sub");
    const refreshBtn = panel.querySelector("[data-act='refresh']");
    if (refreshBtn) refreshBtn.hidden = !(routeKind() === "explore" || routeKind() === "following" || id === "explore" || id === "following");
    const mediaBtn = panel.querySelector(".im-hide-media-toggle");
    if (mediaBtn) {
      const on = isHideMedia();
      mediaBtn.classList.toggle("is-on", on);
      mediaBtn.innerHTML = on ? ICONS.imageOff : ICONS.image;
      mediaBtn.title = on ? "显示媒体（图片/视频）" : "隐藏媒体：纯文本摸鱼模式";
    }
    (_a = panel.querySelector(".im-chat-tabs")) == null ? void 0 : _a.remove();
    (_b = panel.querySelector(".im-channel-bar")) == null ? void 0 : _b.remove();
    if (routeKind() === "search") {
      const q = new URLSearchParams(location.search).get("q") || "";
      const name2 = `搜索: “${q}”`;
      if (ava) {
        ava.style.display = "";
        delete ava.dataset.handle;
        ava.innerHTML = personAvatarHtml("im-chat-avatar", "搜索", "", "search");
      }
      if (title) title.textContent = name2;
      if (chips) chips.innerHTML = isMaskTitle() ? "" : `<a class="im-chat-chip">搜索</a>`;
      if (sub) sub.textContent = "全网笔记";
      return;
    } else if (routeKind() === "bookmark" || id === "bookmark") {
      const isLikes = location.pathname.startsWith("/i/history/likes");
      const name2 = isLikes ? "我的喜欢" : "我的书签";
      if (ava) {
        ava.style.display = "";
        delete ava.dataset.handle;
        ava.innerHTML = personAvatarHtml("im-chat-avatar", name2, "", "bookmark");
      }
      if (title) title.textContent = "收藏中心";
      if (chips) chips.innerHTML = isMaskTitle() ? "" : `<a class="im-chat-chip">${isLikes ? "喜欢" : "书签"}</a>`;
      if (sub) sub.textContent = isLikes ? "已点赞的笔记" : "已收藏的笔记";
      return;
    }
    if (routeKind() === "profile" || id === "profile" || id.startsWith("user:")) {
      const handle = id.startsWith("user:") ? id.slice(5) : ((_c = location.pathname.match(/\/user\/profile\/([^/?#]+)/)) == null ? void 0 : _c[1]) || "";
      const prof = extractProfilePage();
      const name2 = (prof == null ? void 0 : prof.name) || handle || "个人主页";
      const tools = panel.querySelector(".im-chat-tools");
      const status = statusInfo();
      if (status) {
        const pinEl = panel.querySelector(".im-thread-pin");
        const headName = ((_d = pinEl == null ? void 0 : pinEl.querySelector(".im-thread-pin-name")) == null ? void 0 : _d.textContent) || name2;
        const headSub = ((_e = pinEl == null ? void 0 : pinEl.querySelector(".im-thread-pin-handle")) == null ? void 0 : _e.textContent) || "@" + handle;
        if (ava) {
          ava.style.display = "";
          delete ava.style.cursor;
          ava.dataset.handle = handle;
          ava.innerHTML = personAvatarHtml("im-chat-avatar", headName, (prof == null ? void 0 : prof.avatar) || "", handle);
        }
        if (title) title.textContent = headName;
        if (chips) chips.innerHTML = isMaskTitle() ? "" : `<a class="im-chat-chip">评论区</a>`;
        if (sub) sub.textContent = headSub.replace(/·\s*$/, "") || "@" + handle;
        if (tools) {
          tools.innerHTML = `<button type="button" class="im-icon-btn xim-back-btn" title="返回">${ICONS.chevrons}</button>`;
          (_f = tools.querySelector(".xim-back-btn")) == null ? void 0 : _f.addEventListener("click", () => {
            if (history.length > 1) history.back();
            else navigateX("/explore");
          });
        }
      } else {
        if (ava) {
          ava.style.display = "";
          delete ava.style.cursor;
          ava.dataset.handle = handle;
          ava.innerHTML = personAvatarHtml("im-chat-avatar", name2, (prof == null ? void 0 : prof.avatar) || "", handle);
        }
        if (title) title.textContent = name2;
        if (chips) chips.innerHTML = isMaskTitle() ? "" : `<a class="im-chat-chip">个人主页</a>`;
        const subInfo = (prof == null ? void 0 : prof.redId) ? `${prof.redId}${prof.ipLoc ? ` · ${prof.ipLoc}` : ""}` : (prof == null ? void 0 : prof.bio) || (handle ? "@" + handle : "小红书主页");
        if (sub) sub.textContent = subInfo.slice(0, 80);
        if (tools) {
          const me = nativeProfilePath().replace(/^\//, "").toLowerCase();
          const isMe = me && (me === handle.toLowerCase() || me.endsWith(handle.toLowerCase()));
          if (!isMe && handle) {
            const followState = getProfileFollowState();
            tools.innerHTML = `<button type="button" class="im-profile-follow${followState.following ? " on" : ""}" data-act="profile-follow" data-handle="${escapeHtml(handle)}">${followState.following ? "已关注" : "+ 关注"}</button>`;
            (_g = tools.querySelector('[data-act="profile-follow"]')) == null ? void 0 : _g.addEventListener("click", async (e) => {
              const btn = e.currentTarget;
              btn.disabled = true;
              const res = await toggleFollowOnProfile();
              btn.disabled = false;
              if (res.ok) {
                btn.classList.toggle("on", res.following);
                btn.textContent = res.following ? "已关注" : "+ 关注";
                toast(res.following ? `已关注 @${handle}` : `已取消关注 @${handle}`);
              } else {
                toast(res.msg || "操作失败，请重试");
              }
            });
          } else {
            tools.innerHTML = "";
          }
        }
      }
      return;
    }
    const pin = PINNED.find((p) => p.id === id) || PINNED[0];
    const name = displayTitle("pin:" + pin.id, pin.name);
    if (ava) {
      ava.style.display = "";
      ava.style.cursor = "";
      delete ava.dataset.handle;
      ava.innerHTML = personAvatarHtml("im-chat-avatar", name, "", pin.id);
    }
    if (title) title.textContent = name;
    if (chips) {
      if (isMaskTitle()) chips.innerHTML = "";
      else chips.innerHTML = `<a class="im-chat-chip">${escapeHtml(pin.tag || "工作台")}</a>`;
    }
    if (sub) sub.textContent = pin.handle || "";
  }
  function quoteHtml(q) {
    var _a, _b;
    const isVideo = !!(q.video && (q.video.src || q.video.hasVideo));
    const photos = (isVideo ? [] : q.photos && q.photos.length ? q.photos : q.cover ? [q.cover] : []).slice(0, 4);
    const cover = isVideo ? ((_a = q.video) == null ? void 0 : _a.poster) || q.cover || "" : photos[0] || "";
    const body = q.text || (isVideo ? "[视频]" : cover ? "[图片]" : "");
    const mediaHtml = isVideo ? `<div class="im-quote-video" data-href="${escapeHtml(q.href || "")}" data-src="${escapeHtml(((_b = q.video) == null ? void 0 : _b.src) || "")}">
        ${cover ? `<img src="${escapeHtml(cover)}" alt="" loading="lazy">` : `<div class="im-video-fallback"></div>`}
        <span class="im-video-play">${ICONS.play}</span>
      </div>` : photos.length ? `<img class="im-quote-thumb" src="${escapeHtml(photos[0])}" alt="" loading="lazy">` : "";
    const photoHtml = photos.length ? `<div class="im-quote-pop-photos im-photos-${photos.length}">${photos.map((src) => `<img src="${escapeHtml(src)}" alt="" loading="lazy">`).join("")}</div>` : "";
    return `<div class="im-quote" role="link" tabindex="0" data-href="${escapeHtml(q.href || "")}" data-quote-key="${escapeHtml(q.key || "")}">
    <div class="im-quote-main">
      <span class="im-quote-name">${escapeHtml(q.name || "引用")}</span>
      <span class="im-quote-body">${linkifyText(body)}</span>
    </div>
    ${mediaHtml}
    <div class="im-quote-pop">
      <div class="im-quote-pop-name">${escapeHtml(q.name || "引用")}</div>
      <div class="im-quote-pop-body">${linkifyText(body)}</div>
      ${isVideo && cover ? `<img src="${escapeHtml(cover)}" alt="" loading="lazy">` : photoHtml}
    </div>
  </div>`;
  }
  async function playQuoteVideo(el) {
    var _a, _b;
    const quote = el.closest(".im-quote");
    const msg = el.closest(".im-msg");
    const body = el.closest(".im-detail-body");
    const poster = ((_a = (quote == null ? void 0 : quote.querySelector("img")) || el.querySelector("img")) == null ? void 0 : _a.src) || "";
    const postMatch = (v, poster2) => !poster2 || !(v == null ? void 0 : v.poster) || v.poster.split("?")[0] === poster2.split("?")[0];
    const pickV = (d) => {
      var _a2;
      const arr = (d == null ? void 0 : d.pin) ? [d.pin, ...d.replies || []] : [];
      let exact = null, fallback = null;
      for (const it of arr) {
        if (!it) continue;
        for (const v of [(_a2 = it.quote) == null ? void 0 : _a2.video, it.video]) {
          if (!(v == null ? void 0 : v.src)) continue;
          if (postMatch(v, poster)) {
            exact = v;
            break;
          }
          if (!fallback) fallback = v;
        }
        if (exact) break;
      }
      return exact || fallback;
    };
    const qHref = (quote == null ? void 0 : quote.dataset.href) || el.dataset.href || "";
    let statusId = ((_b = String(qHref).match(/status\/(\d+)/)) == null ? void 0 : _b[1]) || "";
    let src = el.dataset.src || posterVideoSrc();
    let p = poster || el.dataset.poster || "";
    const applyV = (v) => {
      if (v == null ? void 0 : v.src) {
        src = v.src;
        if (v.poster) p = v.poster;
      }
    };
    if (!src && statusId) {
      try {
        const detail = await fetchTweetDetail(statusId);
        applyV(pickV(detail));
      } catch {
      }
    }
    if (!src && (msg == null ? void 0 : msg.dataset.id)) {
      try {
        const detail = await fetchTweetDetail(msg.dataset.id);
        applyV(pickV(detail));
      } catch {
      }
    }
    if (!src && lastThreadDetail && body && body.dataset.pinId === lastThreadDetail.id) {
      applyV(pickV(lastThreadDetail.detail));
    }
    if (!src) {
      toast("视频未就绪，请重试");
      return;
    }
    openImVideoModal({ src, poster: p, tweetId: "" });
  }
  function openQuotedTweet(el) {
    var _a, _b;
    const href = (_a = el == null ? void 0 : el.dataset) == null ? void 0 : _a.href;
    if (href) {
      navigateX(href);
      return;
    }
    const key = (_b = el == null ? void 0 : el.dataset) == null ? void 0 : _b.quoteKey;
    if (!key) return;
    for (const card of document.querySelectorAll(".im-quote")) {
      if (card === el) continue;
      if (card.dataset.quoteKey === key) {
        openQuotedTweet(card);
        return;
      }
    }
  }
  let quoteFloat = null;
  let quoteFloatHide = 0;
  function hideQuoteFloat() {
    clearTimeout(quoteFloatHide);
    if (quoteFloat) quoteFloat.hidden = true;
  }
  function showQuoteFloat(anchor) {
    clearTimeout(quoteFloatHide);
    const src = anchor.querySelector(".im-quote-pop");
    if (!src) return;
    if (quoteFloat && !quoteFloat.hidden && quoteFloat.dataset.href === (anchor.dataset.href || "") && quoteFloat.dataset.quoteKey === (anchor.dataset.quoteKey || "")) return;
    if (!quoteFloat) {
      quoteFloat = document.createElement("div");
      quoteFloat.className = "im-quote-float";
      quoteFloat.addEventListener("pointerenter", () => clearTimeout(quoteFloatHide));
      quoteFloat.addEventListener("pointerleave", () => {
        quoteFloatHide = setTimeout(hideQuoteFloat, 120);
      });
      quoteFloat.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideQuoteFloat();
        openQuotedTweet(quoteFloat);
      });
      document.body.appendChild(quoteFloat);
    }
    quoteFloat.innerHTML = src.innerHTML;
    quoteFloat.dataset.href = anchor.dataset.href || "";
    quoteFloat.dataset.quoteKey = anchor.dataset.quoteKey || "";
    quoteFloat.hidden = false;
    const r = anchor.getBoundingClientRect();
    const w = Math.min(360, window.innerWidth - 16);
    quoteFloat.style.cssText = `position:fixed;left:${Math.max(8, Math.min(r.left, window.innerWidth - w - 8))}px;top:${r.bottom + 6}px;width:${w}px;z-index:10050;`;
    const pr = quoteFloat.getBoundingClientRect();
    if (pr.bottom > window.innerHeight - 8) {
      quoteFloat.style.top = `${Math.max(8, r.top - pr.height - 6)}px`;
    }
  }
  function extrasHtml(t) {
    var _a, _b, _c;
    let h = "";
    if (t.video) {
      const poster = t.video.poster || "";
      h += `<div class="im-video" data-src="${escapeHtml(t.video.src || "")}" data-tweet="${escapeHtml(t.id || "")}">${poster ? `<img src="${escapeHtml(poster)}" alt="" loading="lazy">` : `<div class="im-video-fallback"></div>`}<span class="im-video-play">${ICONS.play}</span></div>`;
    } else if (((_a = t.linkCard) == null ? void 0 : _a.href) || ((_b = t.linkCard) == null ? void 0 : _b.title)) {
      const c = t.linkCard;
      h += `<div class="im-link-card" data-href="${escapeHtml(c.href || "")}">${c.img ? `<img class="im-link-thumb" src="${escapeHtml(c.img)}" alt="" loading="lazy">` : ""}<div class="im-link-main"><span class="im-link-title">${escapeHtml(c.title || c.href || "")}</span><span class="im-link-domain">${escapeHtml(c.domain || "")}</span></div></div>`;
    }
    if ((_c = t.poll) == null ? void 0 : _c.length) {
      h += `<div class="im-poll"><div class="im-poll-hint">投票 · 只读</div><div class="im-poll-opts">${t.poll.map((o) => `<div class="im-poll-opt"><span class="im-poll-check">${ICONS.check}</span><span>${escapeHtml(o)}</span></div>`).join("")}</div></div>`;
    }
    return h;
  }
  function snip(s) {
    const t = String(s || "").replace(/\s+/g, " ").trim();
    return t.length > 64 ? [...t].slice(0, 64).join("") + "…" : t;
  }
  function msgHtml(t, forceReal) {
    const side = t.mine ? "me" : "other";
    const ava = personAvatarHtml("im-msg-avatar", t.name, t.avatar, t.id || t.handle, !!forceReal);
    const ps = (t.photos || []).filter((src) => !(t.video && /video_thumb|amplify_video/.test(src))).slice(0, 4);
    const as = t.alts || [];
    const photos = ps.length ? `<div class="im-msg-photos im-photos-${ps.length}">${ps.map((src, i) => `<div class="im-photo">${as[i] ? '<span class="im-alt-badge">ALT</span>' : ""}<img src="${escapeHtml(src)}" alt="" loading="lazy"></div>`).join("")}</div>` : "";
    const quote = t.quote ? quoteHtml(t.quote) : "";
    const replyQuote = t.replyRef ? `<div class="im-reply-quote" role="link" tabindex="0" data-href="${escapeHtml(t.replyRef.href || "")}" data-handle="@${escapeHtml(t.replyRef.handle || "")}">
        <span class="im-reply-quote-tag">回复</span>
        <span class="im-reply-quote-main">
          <span class="im-quote-name">@${escapeHtml(t.replyRef.handle || "")}</span>
          <span class="im-quote-body">${escapeHtml(t.replyRef.snippet || "")}</span>
        </span>
      </div>` : "";
    const long = t.isNote || (t.text || "").length > 240;
    const body = `<div class="im-tw-body${long ? " im-longtext" : ""}"${long ? ' title="点击展开全部"' : ""}>${t.html ? t.html : escapeHtml(t.text || "").replace(/\n/g, "<br>")}</div>`;
    const extras = extrasHtml(t);
    const handle = t.handle || "";
    const context = t.reposter ? `<div class="im-repost-tag">${ICONS.repost}<span><b>${escapeHtml(t.reposter)}</b> 转发了</span></div>` : "";
    const livetag = t.live ? `<div class="im-live-tag"><span class="im-live-dot"></span><span>LIVE · 实时音频</span></div>` : "";
    const nameMark = t.verified ? ICONS.verified : "";
    const metaHtml = `<span class="im-msg-meta"><span>${escapeHtml(fmtXTime(t.datetime, t.time))}${t.threadIdx ? ` · 线程 ${t.threadIdx}` : ""}</span></span>`;
    const translated = t.translated ?? "";
    const transBtnHtml = transWanted(t) !== void 0 ? `<button type="button" class="im-msg-tool im-msg-trans" data-action="trans">译文</button>` : "";
    const statsSummary = [
      t.replyCount ? `评论 ${t.replyCount}` : "",
      t.rtCount ? `收藏 ${t.rtCount}` : "",
      t.likeCount ? `点赞 ${t.likeCount}` : "",
      t.bookmarkCount ? `书签 ${t.bookmarkCount}` : "",
      t.viewCount ? `浏览 ${t.viewCount}` : ""
    ].filter(Boolean).join(" · ");
    const bubbleTitle = statsSummary ? ` title="${escapeHtml(statsSummary)}"` : long ? ' title="点击展开全部"' : "";
    const followTag = t.canFollow && !t.mine && handle ? `<button type="button" class="im-msg-follow${t.isFollowing ? " on" : ""}" data-id="${escapeHtml(t.id)}" data-handle="${escapeHtml(handle)}" title="${t.isFollowing ? "已关注" : "关注"} @${escapeHtml(handle)}">${t.isFollowing ? "已关注" : "+ 关注"}</button>` : "";
    return `<div class="im-msg im-msg-${side}${t.isSub || t.repliedTo ? " is-sub" : ""}" data-id="${escapeHtml(t.id)}" data-href="${escapeHtml(t.href || "")}" data-handle="${escapeHtml(handle)}" data-profile="${escapeHtml(t.profileHref || "")}" data-translated="${escapeHtml(String(translated))}">
    ${ava}
    <div class="im-msg-content">
      <span class="im-msg-head">
        <span class="im-msg-name" title="@${escapeHtml(handle)}" style="cursor:pointer">${escapeHtml(t.name)}${nameMark}</span>${followTag}${forceReal ? "" : metaHtml}
      </span>
      <div class="im-msg-bubble"${bubbleTitle}>${context}${livetag}${replyQuote}${quote}${body}${extras}${photos}</div>
      ${forceReal ? metaHtml : ""}
      <div class="im-msg-tools">
        ${transBtnHtml}
        <button type="button" class="im-msg-tool" data-action="thread" data-name="评论" data-count="${escapeHtml(t.replyCount || "")}">${ICONS.msg}${t.replyCount ? `<span class="im-tool-num">${escapeHtml(t.replyCount)}</span>` : ""}</button>
        <button type="button" class="im-msg-tool${t.retweeted ? " is-retweeted" : ""}" data-action="repost" data-name="收藏" data-count="${escapeHtml(t.rtCount || "")}">${ICONS.repost}${t.rtCount ? `<span class="im-tool-num">${escapeHtml(t.rtCount)}</span>` : ""}</button>
        <button type="button" class="im-msg-tool${t.liked ? " is-liked" : ""}" data-action="like" data-name="点赞" data-count="${escapeHtml(t.likeCount || "")}">${t.liked ? ICONS.heartFilled : ICONS.plus}${t.likeCount ? `<span class="im-tool-num">${escapeHtml(t.likeCount)}</span>` : ""}</button>
        ${t.viewCount ? `<button type="button" class="im-msg-tool" data-action="analytics" data-name="浏览" data-count="${escapeHtml(t.viewCount)}">${ICONS.chart}<span class="im-tool-num">${escapeHtml(t.viewCount)}</span></button>` : ""}
      </div>
    </div>
  </div>`;
  }
  function syncChatMessages() {
    var _a, _b, _c;
    if (syncDetailDrawer()) return;
    const panel = document.querySelector(".im-chat-panel");
    if (panel) syncChatHeader(panel);
    const body = document.querySelector(".im-feed-col");
    if (!body) return;
    if (routeKind() === "search") {
      syncSceneCards(body);
      syncSearchFeed(body);
      return;
    }
    if (routeKind() === "profile" || getChatId() === "profile") {
      syncSceneCards(body);
      syncProfileFeed(body);
      return;
    }
    syncSceneCards(body);
    const tweets = [];
    let prevT = null;
    let threadRun = 0;
    const ownerLast = /* @__PURE__ */ new Map();
    for (const article of allTweetArticles()) {
      const t = extractTweet(article);
      if (!t) continue;
      if (seen.has(t.id)) {
        const oldEl = body.querySelector(`.im-msg[data-id="${t.id}"]`);
        let needRebuild = false;
        if (oldEl) {
          if (t.translated !== void 0 && oldEl.dataset.translated !== String(t.translated ? "1" : "0")) needRebuild = true;
          if (!needRebuild && t.photos && t.photos.length) {
            const dom = [...oldEl.querySelectorAll(".im-msg-photos img")].map((i) => i.src || "");
            if (dom.length !== t.photos.length || !dom.every((s, i) => s === t.photos[i])) needRebuild = true;
          }
          if (!needRebuild && t.avatar && oldEl.querySelector(".im-msg-avatar.is-text-avatar, .im-msg-avatar.is-grid-mask")) {
            needRebuild = true;
          }
          if (needRebuild) {
            oldEl.outerHTML = msgHtml(t);
            prevT = t;
          } else {
            syncMsgToolStates(oldEl, t);
          }
        }
        continue;
      }
      seen.add(t.id);
      if (t.replyTo && ownerLast.has(t.replyTo)) {
        const ref = ownerLast.get(t.replyTo);
        if (ref) {
          t.replyRef = {
            handle: t.replyTo,
            href: ref.href || "",
            snippet: ref.snippet
          };
        }
      }
      const last = ownerLast.get(t.handle || "");
      ownerLast.set(t.handle || "", {
        href: t.href || "",
        snippet: (last == null ? void 0 : last.snippet) || snip(t.text || "")
      });
      t.threadIdx = 0;
      if (prevT && t.handle && t.handle === prevT.handle) {
        const d0 = prevT.datetime ? new Date(prevT.datetime).getTime() : 0;
        const d1 = t.datetime ? new Date(t.datetime).getTime() : 0;
        if (d0 && d1 && d1 >= d0 && d1 - d0 < 9e4) threadRun += 1;
        else threadRun = 0;
      } else {
        threadRun = 0;
      }
      if (threadRun > 0) t.threadIdx = threadRun + 1;
      tweets.push(t);
      prevT = t;
    }
    if (!tweets.length && !body.childElementCount) {
      const hasLoginBtn = !!document.querySelector(".login-btn, [class*='login-btn']");
      body.innerHTML = `<div class="im-chat-empty">
      <p>正在同步小红书推荐流…</p>
      ${hasLoginBtn ? '<p style="font-size:12px;color:var(--im-text-3);margin-top:6px;">检测到未登录状态，点击下方按钮唤起登录：</p><button type="button" class="im-guide-btn" data-act="relogin" style="margin-top:8px;">呼起登录</button>' : '<p style="font-size:12px;color:var(--im-text-3);margin-top:6px;">如果一直无内容，请点击刷新重试或检查小红书登录状态</p><button type="button" class="im-guide-btn" data-act="refresh-feed" style="margin-top:8px;">刷新信息流</button>'}
    </div>`;
      (_a = body.querySelector('[data-act="relogin"]')) == null ? void 0 : _a.addEventListener("click", () => {
        if (!clickNativeLogin()) toast("未找到登录入口，请检查网络或刷新");
      });
      (_b = body.querySelector('[data-act="refresh-feed"]')) == null ? void 0 : _b.addEventListener("click", () => {
        refreshHomeFeed();
      });
      return;
    }
    if (!tweets.length) return;
    (_c = body.querySelector(".im-chat-empty")) == null ? void 0 : _c.remove();
    const me = nativeProfilePath();
    for (const t of tweets) {
      if (t.handle && me.replace(/^\//, "") === t.handle) t.mine = true;
      body.insertAdjacentHTML("beforeend", msgHtml(t));
    }
    if (body.scrollHeight <= body.clientHeight + 120) loadMoreFeed();
  }
  function nearBottom(el) {
    return el.scrollTop + el.clientHeight >= el.scrollHeight - 320;
  }
  let _feedSyncTimer = 0;
  function scheduleFeedSync() {
    if (_feedSyncTimer) return;
    _feedSyncTimer = window.setTimeout(() => {
      _feedSyncTimer = 0;
      syncChatMessages();
    }, 700);
  }
  function onChatScroll(e) {
    hideQuoteFloat();
    if (nearBottom(e.currentTarget)) {
      loadMoreFeed();
      scheduleFeedSync();
    }
  }
  function onChatWheel(e) {
    if (e.deltaY <= 0) return;
    if (nearBottom(e.currentTarget)) {
      loadMoreFeed();
      scheduleFeedSync();
    }
  }
  let detailRenderedHref = "";
  let detailPrevUrl = "";
  let lastThreadDetail = null;
  function applyCommentBatch(noteId, replies) {
    var _a, _b, _c;
    if (!(replies == null ? void 0 : replies.length)) return 0;
    const detail = (lastThreadDetail == null ? void 0 : lastThreadDetail.id) === noteId ? lastThreadDetail.detail : { pin: ((_a = lastThreadDetail == null ? void 0 : lastThreadDetail.detail) == null ? void 0 : _a.pin) || null, replies: [] };
    if (!detail.pin && ((_b = lastThreadDetail == null ? void 0 : lastThreadDetail.detail) == null ? void 0 : _b.pin)) detail.pin = lastThreadDetail.detail.pin;
    const prevList = detail.replies || [];
    let hasAvatarUpdate = false;
    if (replies.length === prevList.length) {
      for (let i = 0; i < replies.length; i++) {
        if (replies[i].avatar && !((_c = prevList[i]) == null ? void 0 : _c.avatar)) {
          hasAvatarUpdate = true;
          break;
        }
      }
    }
    if (replies.length <= prevList.length && !hasAvatarUpdate) return prevList.length;
    detail.replies = replies;
    lastThreadDetail = { id: noteId, detail };
    renderDetailThread(detail);
    return replies.length;
  }
  async function fillCommentsLater(noteId, el, loadedHref) {
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 260));
      if (detailView !== el || !el.classList.contains("is-open") || !(detailRenderedHref == null ? void 0 : detailRenderedHref.includes(noteId))) return;
      if (i === 1) expandCommentSoft();
      const replies = collectNoteComments(noteId);
      if (replies.length) {
        applyCommentBatch(noteId, replies);
        const allHaveAvatar = replies.every((r) => !!r.avatar);
        if (allHaveAvatar && i >= 2) break;
      }
    }
    if ((lastThreadDetail == null ? void 0 : lastThreadDetail.id) === noteId) {
      lastThreadDetail.detail.commentsPending = false;
      if (!(lastThreadDetail.detail.replies || []).length) renderDetailThread(lastThreadDetail.detail);
    }
  }
  function expandCommentSoft() {
    loadMoreComments(lastThreadDetail == null ? void 0 : lastThreadDetail.id).then((replies) => {
      if (lastThreadDetail == null ? void 0 : lastThreadDetail.id) applyCommentBatch(lastThreadDetail.id, replies);
    }).catch(() => {
    });
  }
  let commentPaging = false;
  async function pageMoreComments() {
    const noteId = lastThreadDetail == null ? void 0 : lastThreadDetail.id;
    if (!noteId || commentPaging) return;
    commentPaging = true;
    if (lastThreadDetail.detail) {
      lastThreadDetail.detail.commentsPaging = true;
      const hint2 = detailView == null ? void 0 : detailView.querySelector(".im-detail-loadmore");
      if (hint2) hint2.textContent = "正在加载更多评论…";
    }
    try {
      const replies = await loadMoreComments(noteId);
      applyCommentBatch(noteId, replies);
    } catch {
    }
    if (lastThreadDetail == null ? void 0 : lastThreadDetail.detail) lastThreadDetail.detail.commentsPaging = false;
    const hint = detailView == null ? void 0 : detailView.querySelector(".im-detail-loadmore");
    if (hint) hint.textContent = "下滑加载更多评论";
    commentPaging = false;
  }
  function onDetailBodyScroll(e) {
    hideQuoteFloat();
    if (nearBottom(e.currentTarget)) pageMoreComments();
  }
  function renderDetailThread(detail) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const el = detailView;
    if (!el) return;
    const dbody = el.querySelector(".im-detail-body");
    if (!dbody) return;
    let pt = detail.pin;
    const existingPin = dbody.querySelector(".im-thread-pin");
    if (existingPin) {
      const exName = ((_b = (_a = existingPin.querySelector(".im-thread-pin-name")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || "";
      const exText = ((_d = (_c = existingPin.querySelector(".im-thread-pin-body")) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim()) || "";
      const exAva = ((_e = existingPin.querySelector(".im-thread-pin-avatar img")) == null ? void 0 : _e.getAttribute("src")) || "";
      const exPhotos = Array.from(existingPin.querySelectorAll(".im-thread-pin-photos img")).map((i) => i.src).filter(Boolean);
      if (!pt) {
        pt = {
          name: exName,
          text: exText,
          avatar: exAva,
          photos: exPhotos,
          handle: existingPin.dataset.handle || ""
        };
      } else {
        if ((!pt.name || pt.name === "小红书薯友") && exName && exName !== "小红书薯友") pt.name = exName;
        if ((!pt.text || pt.text === "分享了一篇笔记") && exText && exText !== "分享了一篇笔记") pt.text = exText;
        if (!pt.avatar && exAva) pt.avatar = exAva;
        if (!((_f = pt.photos) == null ? void 0 : _f.length) && exPhotos.length) pt.photos = exPhotos;
      }
    }
    const title = el.querySelector(".im-detail-title");
    const sub = el.querySelector(".im-detail-sub");
    if (title) title.textContent = (pt == null ? void 0 : pt.name) || "推文详情";
    if (sub) sub.textContent = (pt == null ? void 0 : pt.handle) ? `@${pt.handle} · 评论区` : "评论区";
    const ownerLast = /* @__PURE__ */ new Map();
    let html = pt ? threadPinHtml(pt) : `<div class="im-chat-empty"><p>未找到该推文</p></div>`;
    let prevT = null;
    let threadRun = 0;
    for (const t of detail.replies || []) {
      const target = t.replyTo || t.repliedTo;
      if (target) {
        const ref = ownerLast.get(target);
        t.replyRef = {
          handle: target,
          href: (ref == null ? void 0 : ref.href) || "",
          snippet: ((_g = t.replyRef) == null ? void 0 : _g.snippet) || (ref == null ? void 0 : ref.snippet) || ""
        };
      }
      const last = ownerLast.get(t.handle || "");
      ownerLast.set(t.handle || "", { href: t.href || "", snippet: (last == null ? void 0 : last.snippet) || snip(t.text || "") });
      t.threadIdx = 0;
      if (prevT && t.handle && t.handle === prevT.handle) {
        const d0 = prevT.datetime ? new Date(prevT.datetime).getTime() : 0;
        const d1 = t.datetime ? new Date(t.datetime).getTime() : 0;
        if (d0 && d1 && d1 >= d0 && d1 - d0 < 9e4) threadRun += 1;
        else threadRun = 0;
      } else {
        threadRun = 0;
      }
      if (threadRun > 0) t.threadIdx = threadRun + 1;
      html += msgHtml(t, true);
      prevT = t;
    }
    if (!(detail.replies || []).length) {
      html += detail.commentsPending ? `<div class="im-detail-loading">正在加载评论区…</div>` : `<div class="im-chat-empty"><p>暂无评论</p></div>`;
    } else {
      html += `<div class="im-detail-loadmore">${detail.commentsPaging ? "正在加载更多评论…" : "下滑加载更多评论"}</div>`;
    }
    const keepTop = dbody.dataset.pinId && pt && dbody.dataset.pinId === pt.id ? dbody.scrollTop : 0;
    dbody.dataset.sig = pt ? pt.id : html;
    dbody.innerHTML = html;
    if (pt) {
      dbody.dataset.pinId = pt.id;
      (_h = dbody.querySelector(".im-thread-pin")) == null ? void 0 : _h.setAttribute("data-pin-id", pt.id);
    }
    if (keepTop) dbody.scrollTop = keepTop;
  }
  function openTweetDetail(href, contextEl) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
    if (!href) return;
    const statusId = ((_a = String(href).match(/(?:explore|status|profile\/[^/]+)\/([a-f0-9]{24}|[a-f0-9]+)/i)) == null ? void 0 : _a[1]) || ((_b = String(href).match(/([a-f0-9]{24})/i)) == null ? void 0 : _b[1]) || "";
    const host = document.querySelector(".im-chat-body");
    const el = host && ensureDetailView();
    if (!el) return;
    const ctx = contextEl == null ? void 0 : contextEl.closest(".im-msg");
    let pt = null;
    if (ctx) {
      const avaImg = ctx.querySelector(".im-msg-avatar img, img");
      const photos = Array.from(ctx.querySelectorAll(".im-msg-photos img")).map((i) => i.src).filter(Boolean);
      const likeBtn = ctx.querySelector("[data-action='like']");
      const repostBtn = ctx.querySelector("[data-action='repost']");
      const replyBtn = ctx.querySelector("[data-action='thread']");
      pt = {
        id: statusId || ctx.dataset.id,
        name: ((_d = (_c = ctx.querySelector(".im-msg-name")) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim()) || "笔记",
        handle: ctx.dataset.handle || "",
        profileHref: ctx.dataset.profile || "",
        avatar: (avaImg == null ? void 0 : avaImg.getAttribute("src")) || (avaImg == null ? void 0 : avaImg.src) || "",
        text: ((_f = (_e = ctx.querySelector(".im-tw-body")) == null ? void 0 : _e.textContent) == null ? void 0 : _f.trim()) || "",
        photos,
        images: photos,
        likeCount: ((_g = likeBtn == null ? void 0 : likeBtn.querySelector(".im-tool-num")) == null ? void 0 : _g.textContent) || "",
        rtCount: ((_h = repostBtn == null ? void 0 : repostBtn.querySelector(".im-tool-num")) == null ? void 0 : _h.textContent) || "",
        replyCount: ((_i = replyBtn == null ? void 0 : replyBtn.querySelector(".im-tool-num")) == null ? void 0 : _i.textContent) || "",
        liked: (likeBtn == null ? void 0 : likeBtn.classList.contains("is-liked")) || false,
        retweeted: (repostBtn == null ? void 0 : repostBtn.classList.contains("is-retweeted")) || false,
        href: ctx.dataset.href || href,
        time: ((_k = (_j = ctx.querySelector(".im-msg-meta")) == null ? void 0 : _j.textContent) == null ? void 0 : _k.trim()) || ""
      };
    }
    if (statusId) {
      const art = findTweetArticle(statusId);
      const fromArt = art && extractTweet(art);
      if (fromArt) {
        if (!pt) {
          pt = fromArt;
        } else {
          if (!pt.name || pt.name === "小红书薯友") pt.name = fromArt.name;
          if (!pt.avatar) pt.avatar = fromArt.avatar;
          if (!pt.handle || pt.handle === "小红书薯友") pt.handle = fromArt.handle;
          if (!pt.profileHref) pt.profileHref = fromArt.profileHref;
          if (!((_l = pt.photos) == null ? void 0 : _l.length) && ((_m = fromArt.photos) == null ? void 0 : _m.length)) pt.photos = fromArt.photos;
          if ((!pt.text || pt.text === "分享了一篇笔记") && fromArt.text) pt.text = fromArt.text;
        }
      }
      const cached = getCachedNoteFromState(statusId);
      if (cached) {
        const fromCached = pinFromNoteObject(cached, statusId);
        if (fromCached) {
          if (!pt) {
            pt = fromCached;
          } else {
            if (fromCached.text && fromCached.text.length > (((_n = pt.text) == null ? void 0 : _n.length) || 0)) pt.text = fromCached.text;
            if (((_o = fromCached.photos) == null ? void 0 : _o.length) && fromCached.photos.length > (((_p = pt.photos) == null ? void 0 : _p.length) || 0)) pt.photos = fromCached.photos;
            if (!pt.avatar && fromCached.avatar) pt.avatar = fromCached.avatar;
          }
        }
      }
    }
    setDetailOpen(true);
    if (!detailPrevUrl) detailPrevUrl = location.pathname + location.search;
    detailRenderedHref = (pt == null ? void 0 : pt.href) || href;
    console.info(`[xhs-im:detail-open] path=${location.pathname} href=${detailRenderedHref} statusId=${statusId} pt=${!!pt}`);
    const dbody = el.querySelector(".im-detail-body");
    const title = el.querySelector(".im-detail-title");
    const sub = el.querySelector(".im-detail-sub");
    if (title) title.textContent = (pt == null ? void 0 : pt.name) || ((_q = pt == null ? void 0 : pt.author) == null ? void 0 : _q.name) || "笔记详情";
    if (sub) sub.textContent = ((_r = pt == null ? void 0 : pt.author) == null ? void 0 : _r.name) ? `@${pt.author.name} · 评论区` : (pt == null ? void 0 : pt.handle) ? `@${pt.handle} · 评论区` : "评论区";
    dbody.dataset.sig = statusId || href;
    dbody.innerHTML = (pt ? threadPinHtml(pt) : `<div class="im-chat-empty"><p>正在加载笔记…</p></div>`) + `<div class="im-detail-loading">正在加载评论区…</div>`;
    if (statusId) {
      const loadedHref = (pt == null ? void 0 : pt.href) || href;
      const failView = (what) => {
        console.warn(`[xhs-im:detail] 加载失败(${what}) id=${statusId}`);
        const loading = dbody.querySelector(".im-detail-loading");
        if (loading) {
          loading.outerHTML = `<div class="im-chat-empty"><p>评论区加载失败（${escapeHtml(what)}）</p></div>`;
          return;
        }
        dbody.innerHTML = `<div class="im-chat-empty"><p>该笔记加载失败（${escapeHtml(what)}）</p>
        <a class="im-native-open" href="${escapeHtml(href || `/explore/${statusId}`)}" target="_blank" rel="noopener">在小红书打开</a></div>`;
      };
      fetchTweetDetail(statusId).then((detail) => {
        if (detailView !== el || !el.classList.contains("is-open") || detailRenderedHref !== loadedHref && !detailRenderedHref.includes(statusId)) return;
        if (detail) {
          try {
            lastThreadDetail = { id: statusId, detail };
            renderDetailThread(detail);
            if (!(detail.replies || []).length) fillCommentsLater(statusId, el, loadedHref);
          } catch (err) {
            console.error("[xhs-im:detail] 渲染评论抛异常:", err);
            failView("渲染异常");
          }
        } else {
          failView("接口未返回");
        }
      }).catch((err) => {
        console.error("[xhs-im:detail] fetch 评论抛异常:", err && err.message);
        failView("网络/接口错误");
      });
    }
  }
  function syncMsgToolStates(el, t) {
    if (!el || !t) return;
    const likeBtn = el.querySelector('[data-action="like"]');
    if (likeBtn && t.liked !== void 0) {
      const isLiked = !!t.liked;
      if (likeBtn.classList.contains("is-liked") !== isLiked) {
        likeBtn.classList.toggle("is-liked", isLiked);
        likeBtn.innerHTML = (isLiked ? ICONS.heartFilled : ICONS.plus) + (t.likeCount ? `<span class="im-tool-num">${escapeHtml(t.likeCount)}</span>` : "");
      }
      if (t.likeCount && likeBtn.dataset.count !== t.likeCount) {
        likeBtn.dataset.count = t.likeCount;
        const num = likeBtn.querySelector(".im-tool-num");
        if (num) num.textContent = t.likeCount;
      }
    }
    const rtBtn = el.querySelector('[data-action="repost"]');
    if (rtBtn && t.retweeted !== void 0) {
      rtBtn.classList.toggle("is-retweeted", !!t.retweeted);
      if (t.rtCount && rtBtn.dataset.count !== t.rtCount) {
        rtBtn.dataset.count = t.rtCount;
        const num = rtBtn.querySelector(".im-tool-num");
        if (num) num.textContent = t.rtCount;
      }
    }
    const bmBtn = el.querySelector('[data-action="bookmark"]');
    if (bmBtn && t.bookmarked !== void 0) {
      const isBm = !!t.bookmarked;
      if (bmBtn.classList.contains("is-bookmarked") !== isBm) {
        bmBtn.classList.toggle("is-bookmarked", isBm);
        bmBtn.innerHTML = (isBm ? ICONS.bookmarkFill : ICONS.bookmark) + (t.bookmarkCount ? `<span class="im-tool-num">${escapeHtml(t.bookmarkCount)}</span>` : "");
      }
      if (t.bookmarkCount && bmBtn.dataset.count !== t.bookmarkCount) {
        bmBtn.dataset.count = t.bookmarkCount;
        const num = bmBtn.querySelector(".im-tool-num");
        if (num) num.textContent = t.bookmarkCount;
      }
    }
  }
  async function handleToolLike(btn, id, art) {
    var _a;
    if (!id) return;
    const wasLiked = btn.classList.contains("is-liked");
    const nextLiked = !wasLiked;
    const prevCount = btn.dataset.count || "";
    btn.classList.toggle("is-liked", nextLiked);
    const curVal = parseCountValue(prevCount);
    const optVal = Math.max(0, curVal + (nextLiked ? 1 : -1));
    const optCount = optVal > 0 ? curVal > 0 ? formatCount(optVal) : "1" : "";
    btn.dataset.count = optCount;
    btn.innerHTML = (nextLiked ? ICONS.heartFilled : ICONS.plus) + (optCount ? `<span class="im-tool-num">${escapeHtml(optCount)}</span>` : "");
    toast(nextLiked ? "已点赞" : "已取消点赞");
    const res = await toggleLike(id, wasLiked, art);
    if (res.ok) {
      if (res.count !== void 0 && res.count !== "") {
        btn.dataset.count = res.count;
        const numSpan = btn.querySelector(".im-tool-num");
        if (numSpan) numSpan.textContent = res.count;
        else btn.insertAdjacentHTML("beforeend", `<span class="im-tool-num">${escapeHtml(res.count)}</span>`);
      }
      if (res.liked !== void 0) {
        btn.classList.toggle("is-liked", res.liked);
        (_a = btn.querySelector("svg")) == null ? void 0 : _a.remove();
        btn.insertAdjacentHTML("afterbegin", res.liked ? ICONS.heartFilled : ICONS.plus);
      }
    } else {
      btn.classList.toggle("is-liked", wasLiked);
      btn.dataset.count = prevCount;
      btn.innerHTML = (wasLiked ? ICONS.heartFilled : ICONS.plus) + (prevCount ? `<span class="im-tool-num">${escapeHtml(prevCount)}</span>` : "");
      toast("点赞失败，请重试");
    }
  }
  async function handleToolRetweet(btn, id, art) {
    if (!id) return;
    const wasRt = btn.classList.contains("is-retweeted");
    const nextRt = !wasRt;
    const prevCount = btn.dataset.count || "";
    btn.classList.toggle("is-retweeted", nextRt);
    const curVal = parseCountValue(prevCount);
    const optVal = Math.max(0, curVal + (nextRt ? 1 : -1));
    const optCount = optVal > 0 ? curVal > 0 ? formatCount(optVal) : "1" : "";
    btn.dataset.count = optCount;
    btn.innerHTML = ICONS.repost + (optCount ? `<span class="im-tool-num">${escapeHtml(optCount)}</span>` : "");
    toast(nextRt ? "已转推" : "已取消转推");
    const res = await toggleRetweet(id, wasRt, art);
    if (res.ok) {
      if (res.count !== void 0 && res.count !== "") {
        btn.dataset.count = res.count;
        const numSpan = btn.querySelector(".im-tool-num");
        if (numSpan) numSpan.textContent = res.count;
        else btn.insertAdjacentHTML("beforeend", `<span class="im-tool-num">${escapeHtml(res.count)}</span>`);
      }
      if (res.retweeted !== void 0) {
        btn.classList.toggle("is-retweeted", res.retweeted);
      }
    } else {
      btn.classList.toggle("is-retweeted", wasRt);
      btn.dataset.count = prevCount;
      btn.innerHTML = ICONS.repost + (prevCount ? `<span class="im-tool-num">${escapeHtml(prevCount)}</span>` : "");
      toast("转推失败，请重试");
    }
  }
  async function handleToolBookmark(btn, id, art) {
    var _a;
    if (!id) return;
    const wasBm = btn.classList.contains("is-bookmarked");
    const nextBm = !wasBm;
    const prevCount = btn.dataset.count || "";
    btn.classList.toggle("is-bookmarked", nextBm);
    const curVal = parseCountValue(prevCount);
    const optVal = Math.max(0, curVal + (nextBm ? 1 : -1));
    const optCount = optVal > 0 ? curVal > 0 ? formatCount(optVal) : "1" : "";
    btn.dataset.count = optCount;
    btn.innerHTML = (nextBm ? ICONS.bookmarkFill : ICONS.bookmark) + (optCount ? `<span class="im-tool-num">${escapeHtml(optCount)}</span>` : "");
    toast(nextBm ? "已添加书签" : "已移出书签");
    const res = await toggleBookmark(id, wasBm, art);
    if (res.ok) {
      if (res.count !== void 0 && res.count !== "") {
        btn.dataset.count = res.count;
        const numSpan = btn.querySelector(".im-tool-num");
        if (numSpan) numSpan.textContent = res.count;
        else btn.insertAdjacentHTML("beforeend", `<span class="im-tool-num">${escapeHtml(res.count)}</span>`);
      }
      if (res.bookmarked !== void 0) {
        btn.classList.toggle("is-bookmarked", res.bookmarked);
        (_a = btn.querySelector("svg")) == null ? void 0 : _a.remove();
        btn.insertAdjacentHTML("afterbegin", res.bookmarked ? ICONS.bookmarkFill : ICONS.bookmark);
      }
    } else {
      btn.classList.toggle("is-bookmarked", wasBm);
      btn.dataset.count = prevCount;
      btn.innerHTML = (wasBm ? ICONS.bookmarkFill : ICONS.bookmark) + (prevCount ? `<span class="im-tool-num">${escapeHtml(prevCount)}</span>` : "");
    }
  }
  async function handlePinLike(btn, id, art) {
    var _a, _b, _c;
    if (!id) return;
    const wasLiked = btn.classList.contains("is-liked");
    const nextLiked = !wasLiked;
    const prevCount = btn.dataset.count || "";
    btn.classList.toggle("is-liked", nextLiked);
    const curVal = parseCountValue(prevCount);
    const optVal = Math.max(0, curVal + (nextLiked ? 1 : -1));
    const optCount = optVal > 0 ? curVal > 0 ? formatCount(optVal) : "1" : "";
    btn.dataset.count = optCount;
    const span = btn.querySelector("span");
    if (span) span.textContent = optCount ? `点赞 ${optCount}` : "点赞";
    (_a = btn.querySelector("svg")) == null ? void 0 : _a.remove();
    btn.insertAdjacentHTML("afterbegin", nextLiked ? ICONS.heartFilled : ICONS.plus);
    toast(nextLiked ? "已点赞" : "已取消点赞");
    const res = await toggleLike(id, wasLiked, art);
    if (res.ok) {
      if (res.count !== void 0 && res.count !== "") {
        btn.dataset.count = res.count;
        if (span) span.textContent = `点赞 ${res.count}`;
      }
      if (res.liked !== void 0) {
        btn.classList.toggle("is-liked", res.liked);
        (_b = btn.querySelector("svg")) == null ? void 0 : _b.remove();
        btn.insertAdjacentHTML("afterbegin", res.liked ? ICONS.heartFilled : ICONS.plus);
      }
    } else {
      btn.classList.toggle("is-liked", wasLiked);
      btn.dataset.count = prevCount;
      if (span) span.textContent = prevCount ? `点赞 ${prevCount}` : "点赞";
      (_c = btn.querySelector("svg")) == null ? void 0 : _c.remove();
      btn.insertAdjacentHTML("afterbegin", wasLiked ? ICONS.heartFilled : ICONS.plus);
      toast("点赞失败，请重试");
    }
  }
  async function handlePinRetweet(btn, id, art) {
    if (!id) return;
    const wasRt = btn.classList.contains("is-retweeted");
    const nextRt = !wasRt;
    const prevCount = btn.dataset.count || "";
    btn.classList.toggle("is-retweeted", nextRt);
    const curVal = parseCountValue(prevCount);
    const optVal = Math.max(0, curVal + (nextRt ? 1 : -1));
    const optCount = optVal > 0 ? curVal > 0 ? formatCount(optVal) : "1" : "";
    btn.dataset.count = optCount;
    const span = btn.querySelector("span");
    if (span) span.textContent = optCount ? `收藏 ${optCount}` : "转推";
    toast(nextRt ? "已转推" : "已取消转推");
    const res = await toggleRetweet(id, wasRt, art);
    if (res.ok) {
      if (res.count !== void 0 && res.count !== "") {
        btn.dataset.count = res.count;
        if (span) span.textContent = `收藏 ${res.count}`;
      }
      if (res.retweeted !== void 0) {
        btn.classList.toggle("is-retweeted", res.retweeted);
      }
    } else {
      btn.classList.toggle("is-retweeted", wasRt);
      btn.dataset.count = prevCount;
      if (span) span.textContent = prevCount ? `收藏 ${prevCount}` : "转推";
      toast("转推失败，请重试");
    }
  }
  async function handlePinBookmark(btn, id, art) {
    var _a, _b, _c;
    if (!id) return;
    const wasBm = btn.classList.contains("is-bookmarked");
    const nextBm = !wasBm;
    const prevCount = btn.dataset.count || "";
    btn.classList.toggle("is-bookmarked", nextBm);
    const curVal = parseCountValue(prevCount);
    const optVal = Math.max(0, curVal + (nextBm ? 1 : -1));
    const optCount = optVal > 0 ? curVal > 0 ? formatCount(optVal) : "1" : "";
    btn.dataset.count = optCount;
    const span = btn.querySelector("span");
    if (span) span.textContent = optCount ? `书签 ${optCount}` : "书签";
    (_a = btn.querySelector("svg")) == null ? void 0 : _a.remove();
    btn.insertAdjacentHTML("afterbegin", nextBm ? ICONS.bookmarkFill : ICONS.bookmark);
    toast(nextBm ? "已添加书签" : "已移出书签");
    const res = await toggleBookmark(id, wasBm, art);
    if (res.ok) {
      if (res.count !== void 0 && res.count !== "") {
        btn.dataset.count = res.count;
        if (span) span.textContent = `书签 ${res.count}`;
      }
      if (res.bookmarked !== void 0) {
        btn.classList.toggle("is-bookmarked", res.bookmarked);
        (_b = btn.querySelector("svg")) == null ? void 0 : _b.remove();
        btn.insertAdjacentHTML("afterbegin", res.bookmarked ? ICONS.bookmarkFill : ICONS.bookmark);
      }
    } else {
      btn.classList.toggle("is-bookmarked", wasBm);
      btn.dataset.count = prevCount;
      if (span) span.textContent = prevCount ? `书签 ${prevCount}` : "书签";
      (_c = btn.querySelector("svg")) == null ? void 0 : _c.remove();
      btn.insertAdjacentHTML("afterbegin", wasBm ? ICONS.bookmarkFill : ICONS.bookmark);
    }
  }
  function onMsgClick(e) {
    var _a;
    const profTab = e.target.closest(".im-profile-tab-btn");
    if (profTab) {
      e.preventDefault();
      e.stopPropagation();
      const idx = parseInt(profTab.dataset.tabIdx, 10);
      const nativeTabs = document.querySelectorAll(".xhs-user-page-primary-tabs .reds-tab-item, .user-page-sticky .reds-tab-item");
      if (nativeTabs[idx]) {
        nativeTabs[idx].click();
        const body = document.querySelector(".im-chat-body");
        if (body) {
          body.querySelectorAll(".im-msg, .im-chat-empty").forEach((el) => el.remove());
        }
      }
      return;
    }
    const nativeLink = e.target.closest(".im-tw-body a");
    if (nativeLink) return;
    const extLink = e.target.closest(".im-thread-pin-body a, .im-quote-body a, .im-quote-pop-body a");
    if (extLink) return;
    const guideAct = e.target.closest("[data-guide]");
    if (guideAct) {
      navigateX(guideAct.dataset.guide);
      return;
    }
    const media = e.target.closest(".im-msg-photos img, .im-msg-bubble > img, .im-thread-pin-photos img");
    if (media) {
      const group = media.closest(".im-msg-photos, .im-thread-pin-photos");
      const photos = group ? [...group.querySelectorAll("img")].map((i) => i.src || "").filter(Boolean) : [];
      openImImageModal(media.src, photos);
      return;
    }
    const longtext = e.target.closest(".im-longtext");
    if (longtext) {
      longtext.classList.toggle("is-open");
      return;
    }
    const video = e.target.closest(".im-video");
    if (video) {
      e.stopPropagation();
      if (video.classList.contains("is-playing") && e.target.closest("button, [role='button'], [role='slider'], input")) return;
      playInlineVideo(video, {
        src: video.dataset.src || "",
        poster: ((_a = video.querySelector("img")) == null ? void 0 : _a.src) || "",
        tweetId: video.dataset.tweet || ""
      });
      return;
    }
    const linkCard = e.target.closest(".im-link-card");
    if (linkCard) {
      const href = linkCard.dataset.href;
      if (href) {
        window.open(href, "_blank", "noopener");
        return;
      }
      e.stopPropagation();
      return;
    }
    const replyQuote = e.target.closest(".im-reply-quote");
    if (replyQuote) {
      e.preventDefault();
      e.stopPropagation();
      const href = replyQuote.dataset.href || "";
      openTweetDetail(href, replyQuote);
      return;
    }
    const qVideo = e.target.closest(".im-quote-video");
    if (qVideo) {
      e.preventDefault();
      e.stopPropagation();
      hideQuoteFloat();
      playQuoteVideo(qVideo);
      return;
    }
    const quote = e.target.closest(".im-quote");
    if (quote) {
      e.preventDefault();
      e.stopPropagation();
      hideQuoteFloat();
      openQuotedTweet(quote);
      return;
    }
    const pinFollow = e.target.closest(".im-pin-follow-btn");
    if (pinFollow) {
      const handle = pinFollow.dataset.handle;
      pinFollow.disabled = true;
      toggleFollowOnProfile().then((res) => {
        pinFollow.disabled = false;
        if (res.ok) {
          pinFollow.classList.toggle("on", res.following);
          pinFollow.textContent = res.following ? "已关注" : "+ 关注";
          toast(res.following ? `已关注 @${handle}` : `已取消关注 @${handle}`);
        } else {
          toast(res.msg || "操作失败，请重试");
        }
      });
      return;
    }
    const pinAct = e.target.closest(".im-thread-pin-act");
    if (pinAct) {
      const pinEl = pinAct.closest(".im-thread-pin");
      const pinId = (pinEl == null ? void 0 : pinEl.dataset.pinId) || "";
      const art = findTweetArticle(pinId) || pinId && allTweetArticles().find((n) => (n.innerHTML || "").includes(pinId));
      if (pinAct.dataset.act === "open") {
        const a = art == null ? void 0 : art.querySelector('a[href*="/explore/"], a[href*="/discovery/item/"]');
        openTweetDetail((a == null ? void 0 : a.getAttribute("href")) || `/explore/${pinId}`, pinEl);
      } else if (pinAct.dataset.act === "trans") {
        toggleTranslation(pinAct.closest(".im-thread-pin") || pinEl, pinId);
      } else if (pinAct.dataset.act === "like") {
        handlePinLike(pinAct, pinId, art);
      } else if (pinAct.dataset.act === "repost") {
        handlePinRetweet(pinAct, pinId, art);
      } else if (pinAct.dataset.act === "bookmark") {
        handlePinBookmark(pinAct, pinId, art);
      }
      return;
    }
    const msgFollow = e.target.closest(".im-msg-follow");
    if (msgFollow) {
      e.preventDefault();
      e.stopPropagation();
      const handle = msgFollow.dataset.handle;
      msgFollow.disabled = true;
      toggleFollowOnProfile().then((res) => {
        msgFollow.disabled = false;
        if (res.ok) {
          msgFollow.classList.toggle("on", res.following);
          msgFollow.textContent = res.following ? "已关注" : "+ 关注";
          if (res.already) {
            toast(`已在关注列表中 (@${handle})`);
          } else {
            toast(res.following ? `已关注 @${handle}` : `已取消关注 @${handle}`);
          }
        } else {
          toast(res.msg || "关注失败，请重试");
        }
      });
      return;
    }
    const person = e.target.closest(".im-msg-avatar, .im-msg-name, .im-thread-pin-avatar, .im-thread-pin-name");
    if (person) {
      const host = person.closest(".im-msg, .im-thread-pin");
      const ok = openUserProfile(host == null ? void 0 : host.dataset.profile, host == null ? void 0 : host.dataset.handle);
      if (!ok) toast("未找到用户主页链接");
      return;
    }
    const tool = e.target.closest(".im-msg-tool");
    if (tool) {
      const msg = tool.closest(".im-msg");
      const id = msg == null ? void 0 : msg.dataset.id;
      const art = findTweetArticle(id) || allTweetArticles().find((n) => (n.innerHTML || "").includes(id || ""));
      if (tool.dataset.action === "thread") {
        const href = (msg == null ? void 0 : msg.dataset.href) || (id ? `/explore/${id}` : "");
        openTweetDetail(href, msg);
      } else if (tool.dataset.action === "repost") {
        handleToolRetweet(tool, id, art);
      } else if (tool.dataset.action === "like") {
        handleToolLike(tool, id, art);
      } else if (tool.dataset.action === "bookmark") {
        handleToolBookmark(tool, id, art);
      } else if (tool.dataset.action === "trans") {
        toggleTranslation(tool.closest(".im-msg") || msg, id);
      } else if (tool.dataset.action === "analytics") {
        const href = msg == null ? void 0 : msg.dataset.href;
        if (href) window.open(`${href}/analytics`, "_blank", "noopener");
        else if (id) window.open(`https://x.com/i/status/${id}/analytics`, "_blank", "noopener");
      }
      return;
    }
    const notifSnippet = e.target.closest(".im-notify-snippet");
    if (notifSnippet && notifSnippet.dataset.href) {
      openTweetDetail(notifSnippet.dataset.href);
      return;
    }
    const userCell = e.target.closest(".im-user-cell");
    if (userCell && userCell.dataset.handle) {
      navigateX("/" + userCell.dataset.handle);
      return;
    }
    const bubbleHit = e.target.closest(".im-msg");
    if (bubbleHit && !e.target.closest("button, a, .im-msg-tools, .im-msg-name, .im-msg-avatar, .im-msg-meta")) {
      openTweetDetail(bubbleHit.dataset.href, bubbleHit);
    }
  }
  const searchCache = /* @__PURE__ */ new Map();
  let searchRenderedKey = "";
  const searchSeen = /* @__PURE__ */ new Set();
  async function syncSearchFeed(body) {
    var _a;
    const query = new URLSearchParams(location.search).get("q") || "";
    const f = new URLSearchParams(location.search).get("f") || "";
    if (!query) {
      body.innerHTML = `<div class="im-chat-empty"><p>请输入关键词进行搜索</p></div>`;
      return;
    }
    const key = `${query}:${f}`;
    if (searchRenderedKey !== key) {
      searchRenderedKey = key;
      searchSeen.clear();
      body.innerHTML = "";
    }
    {
      const nativeArticles = allTweetArticles();
      if (nativeArticles.length > 0) {
        for (const art of nativeArticles) {
          const t = extractTweet(art);
          if (!t) continue;
          if (searchSeen.has(t.id)) {
            if (t.avatar) {
              const oldMsg = body.querySelector(`.im-msg[data-id="${t.id}"]`);
              const oldAva = oldMsg == null ? void 0 : oldMsg.querySelector(".im-msg-avatar.is-text-avatar, .im-msg-avatar.is-grid-mask");
              if (oldAva) oldAva.outerHTML = personAvatarHtml("im-msg-avatar", t.name, t.avatar, t.id || t.handle, true);
            }
            continue;
          }
          searchSeen.add(t.id);
          body.insertAdjacentHTML("beforeend", msgHtml(t, true));
        }
        if (searchSeen.size > 0) return;
      }
    }
    let list = searchCache.get(key);
    if (!list) {
      if (!searchSeen.size) body.innerHTML = `<div class="im-detail-loading">正在搜索 “${escapeHtml(query)}”…</div>`;
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 250));
        if (routeKind() !== "search") return;
        const captured = getCapturedSearch(query);
        if (captured.length) {
          list = captured.map((t) => ({ type: "tweet", tweet: t }));
          break;
        }
      }
      if (!list) list = await fetchSearchTimeline();
      searchCache.set(key, list || []);
    }
    (_a = body.querySelector(".im-detail-loading")) == null ? void 0 : _a.remove();
    if (!list.length && !searchSeen.size) {
      body.innerHTML = `<div class="im-chat-empty"><p>未找到与 “${escapeHtml(query)}” 相关的结果</p></div>`;
      return;
    }
    for (const item of list) {
      if (item.type === "tweet" && !searchSeen.has(item.tweet.id)) {
        searchSeen.add(item.tweet.id);
        body.insertAdjacentHTML("beforeend", msgHtml(item.tweet, true));
      }
    }
  }
  function syncSceneCards(body) {
    var _a;
    const kind = routeKind();
    let profEl = body.querySelector(".im-profile-card");
    if (kind === "profile") {
      const prof = extractProfilePage();
      const html = profileCardHtml(prof);
      if (profEl) {
        if (profEl.dataset.sig !== html) {
          profEl.dataset.sig = html;
          profEl.innerHTML = html;
        }
      } else {
        profEl = document.createElement("div");
        profEl.className = "im-profile-card";
        profEl.dataset.sig = html;
        profEl.innerHTML = html;
        body.prepend(profEl);
      }
    } else if (profEl) {
      profEl.remove();
    }
    (_a = body.querySelector(".im-chat-guide")) == null ? void 0 : _a.remove();
  }
  function syncProfileFeed(body) {
    var _a;
    const prof = extractProfilePage();
    const profileArticles = Array.from(
      document.querySelectorAll("#userPostedFeeds .note-item, #userPageContainer .note-item, .user-page .note-item, .profile-container .note-item, .user-tab .note-item, [class*='user-page'] .note-item, [class*='profile'] .note-item")
    ).filter((n) => !n.closest("#exploreFeeds"));
    const source = profileArticles.length ? profileArticles : Array.from(document.querySelectorAll(".note-item")).filter(
      (n) => !n.closest("#exploreFeeds")
    );
    const me = nativeProfilePath();
    let renderedCount = 0;
    for (const art of source) {
      const t = extractTweet(art);
      if (!t || !t.id) continue;
      if (t.handle && me.replace(/^\//, "") === t.handle) t.mine = true;
      const oldEl = body.querySelector(`.im-msg[data-id="${t.id}"]`);
      if (oldEl) {
        renderedCount++;
        continue;
      }
      body.insertAdjacentHTML("beforeend", msgHtml(t, true));
      renderedCount++;
    }
    const existingEmpty = body.querySelector(".im-chat-empty");
    if (renderedCount === 0 && !source.length) {
      const emptyMsg = (prof == null ? void 0 : prof.emptyText) || "该分类下暂无笔记";
      if (!existingEmpty) {
        body.insertAdjacentHTML("beforeend", `<div class="im-chat-empty"><p>${escapeHtml(emptyMsg)}</p></div>`);
      } else if (((_a = existingEmpty.querySelector("p")) == null ? void 0 : _a.textContent) !== emptyMsg) {
        existingEmpty.innerHTML = `<p>${escapeHtml(emptyMsg)}</p>`;
      }
    } else if (existingEmpty && renderedCount > 0) {
      existingEmpty.remove();
    }
  }
  let detailView = null;
  function setDetailOpen(open) {
    detailView == null ? void 0 : detailView.classList.toggle("is-open", open);
  }
  function closeDetailTo() {
    const onNoteUrl = /\/explore\/[a-f0-9]+/.test(location.pathname);
    closeDetailDrawer();
    if (onNoteUrl) {
      if (detailPrevUrl) {
        try {
          history.replaceState(null, "", detailPrevUrl);
        } catch {
        }
      }
      if (history.length > 1) {
        try {
          history.back();
        } catch {
        }
      }
    }
  }
  function ensureDetailView() {
    var _a, _b, _c;
    if (detailView && detailView.isConnected) return detailView;
    const host = document.querySelector(".im-chat-body");
    if (!host) return null;
    const el = document.createElement("div");
    el.className = "im-detail-view";
    el.innerHTML = `
    <div class="im-detail-head">
      <button type="button" class="im-icon-btn im-detail-back" title="返回">${ICONS.chevrons}</button>
      <div class="im-detail-titles">
        <span class="im-detail-title"></span>
        <span class="im-detail-sub"></span>
      </div>
      <span class="im-detail-actions">
        <button type="button" class="im-icon-btn im-detail-expand" title="展开全部评论">${ICONS.expand}</button>
        <button type="button" class="im-icon-btn im-detail-export" title="导出评论">${ICONS.download || ICONS.file}</button>
      </span>
    </div>
    <div class="im-detail-body"></div>`;
    host.appendChild(el);
    detailView = el;
    const gutter = document.createElement("div");
    gutter.className = "im-detail-gutter";
    el.appendChild(gutter);
    el.style.setProperty("--detail-w", "0px");
    let dragging = 0;
    gutter.addEventListener("pointerdown", (e) => {
      var _a2;
      dragging = 1;
      (_a2 = gutter.setPointerCapture) == null ? void 0 : _a2.call(gutter, e.pointerId);
      e.preventDefault();
    });
    gutter.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const hr = host.getBoundingClientRect();
      const w = hr.right - e.clientX;
      el.style.width = `${Math.round(Math.max(120, Math.min(hr.width - 220, w)))}px`;
    });
    gutter.addEventListener("pointerup", () => {
      dragging = 0;
    });
    (_a = el.querySelector(".im-detail-back")) == null ? void 0 : _a.addEventListener("click", closeDetailTo);
    (_b = el.querySelector(".im-detail-expand")) == null ? void 0 : _b.addEventListener("click", async (e) => {
      e.stopPropagation();
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.title = "展开中…";
      const n = await expandAllComments();
      const replies = collectNoteComments(lastThreadDetail == null ? void 0 : lastThreadDetail.id);
      if (lastThreadDetail == null ? void 0 : lastThreadDetail.detail) {
        lastThreadDetail.detail.replies = replies;
        renderDetailThread(lastThreadDetail.detail);
      }
      toast(n ? `已展开 ${n} 处折叠评论` : replies.length ? "没有更多折叠评论" : "暂无评论");
      btn.disabled = false;
      btn.title = "展开全部评论";
    });
    (_c = el.querySelector(".im-detail-export")) == null ? void 0 : _c.addEventListener("click", (e) => {
      var _a2, _b2;
      e.stopPropagation();
      const pin = (_a2 = lastThreadDetail == null ? void 0 : lastThreadDetail.detail) == null ? void 0 : _a2.pin;
      const replies = ((_b2 = lastThreadDetail == null ? void 0 : lastThreadDetail.detail) == null ? void 0 : _b2.replies) || harvestNoteComments();
      if (!pin) {
        toast("请先打开一篇笔记");
        return;
      }
      downloadNoteCommentsAsTxt(pin, replies);
      toast("评论已导出");
    });
    const dbody = el.querySelector(".im-detail-body");
    dbody == null ? void 0 : dbody.addEventListener("scroll", onDetailBodyScroll);
    dbody == null ? void 0 : dbody.addEventListener("click", onMsgClick);
    dbody == null ? void 0 : dbody.addEventListener("pointerover", (e) => {
      const q = e.target.closest(".im-quote");
      if (q) showQuoteFloat(q);
    });
    dbody == null ? void 0 : dbody.addEventListener("pointerout", (e) => {
      const q = e.target.closest(".im-quote");
      if (!q) return;
      if (e.relatedTarget && (q.contains(e.relatedTarget) || (quoteFloat == null ? void 0 : quoteFloat.contains(e.relatedTarget)))) return;
      quoteFloatHide = setTimeout(hideQuoteFloat, 120);
    });
    return el;
  }
  function syncDetailDrawer() {
    var _a;
    if ((detailView == null ? void 0 : detailView.classList.contains("is-open")) && detailRenderedHref) return true;
    const status = statusInfo();
    if (!status) {
      if (detailView == null ? void 0 : detailView.classList.contains("is-open")) console.info(`[xhs-im:drawer] closing: path=${location.pathname} statusInfo=null detailHref=${detailRenderedHref}`);
      closeDetailDrawer();
      return false;
    }
    if ((detailView == null ? void 0 : detailView.classList.contains("is-open")) && detailRenderedHref && detailRenderedHref.includes(status.id)) return true;
    const host = document.querySelector(".im-chat-body");
    if (!host) return true;
    const el = ensureDetailView();
    if (!el) return true;
    setDetailOpen(true);
    const dbody = el.querySelector(".im-detail-body");
    const art = allTweetArticles().find(
      (n) => n.querySelector(`a[href*="${status.id}"]`) || (n.innerHTML || "").includes(status.id)
    );
    let pt = art && extractTweet(art);
    if (!pt) {
      const cached = getCachedNoteFromState(status.id);
      if (cached) pt = pinFromNoteObject(cached, status.id);
    }
    detailRenderedHref = `/explore/${status.id}`;
    const title = el.querySelector(".im-detail-title");
    const sub = el.querySelector(".im-detail-sub");
    if (title) title.textContent = (pt == null ? void 0 : pt.name) || "笔记详情";
    if (sub) sub.textContent = (pt == null ? void 0 : pt.handle) ? `@${pt.handle} · 评论区` : "评论区";
    if (dbody && (dbody.dataset.sig || "") !== String(status.id)) {
      dbody.dataset.sig = String(status.id);
      dbody.innerHTML = (pt ? threadPinHtml(pt) : `<div class="im-chat-empty"><p>正在加载笔记…</p></div>`) + `<div class="im-detail-loading">正在加载评论区…</div>`;
      if (pt) (_a = dbody.querySelector(".im-thread-pin")) == null ? void 0 : _a.setAttribute("data-pin-id", status.id);
      const loadedHref = `/explore/${status.id}`;
      fetchTweetDetail(status.id).then((detail) => {
        if (detailView !== el || !el.classList.contains("is-open") || detailRenderedHref !== loadedHref && !detailRenderedHref.includes(status.id)) return;
        if (detail) {
          try {
            lastThreadDetail = { id: String(status.id), detail };
            renderDetailThread(detail);
          } catch (err) {
            console.error("[xhs-im:detail] 兜底渲染评论抛异常:", err);
            dbody.innerHTML = `<div class="im-chat-empty"><p>该笔记渲染失败</p>
              <a class="im-native-open" href="/explore/${status.id}" target="_blank" rel="noopener">在小红书打开</a></div>`;
          }
        } else {
          dbody.innerHTML = `<div class="im-chat-empty"><p>该笔记加载失败</p>
            <a class="im-native-open" href="/explore/${status.id}" target="_blank" rel="noopener">在小红书打开</a></div>`;
        }
      }).catch((err) => {
        console.error("[xhs-im:detail] 兜底 fetch 评论抛异常:", err && err.message);
        dbody.innerHTML = `<div class="im-chat-empty"><p>该笔记加载失败（网络/接口错误）</p>
          <a class="im-native-open" href="/explore/${status.id}" target="_blank" rel="noopener">在小红书打开</a></div>`;
      });
    }
    return true;
  }
  function closeDetailDrawer() {
    setDetailOpen(false);
    detailRenderedHref = "";
  }
  function removeChatPanel() {
    var _a;
    (_a = document.querySelector(".im-chat-panel")) == null ? void 0 : _a.remove();
    detailView == null ? void 0 : detailView.remove();
    detailView = null;
    seen.clear();
  }
  function resetChatMessages() {
    closeDetailDrawer();
    closeImVideoModal();
    seen.clear();
    const feed = document.querySelector(".im-feed-col");
    if (feed) feed.innerHTML = "";
    syncChatMessages();
  }
  let filterUnread = false;
  function ensureListPanel() {
    let panel = document.querySelector(".im-list-panel");
    if (!panel) {
      panel = document.createElement("section");
      panel.className = "im-list-panel";
      (document.body || document.documentElement).appendChild(panel);
      panel.addEventListener("click", onListClick);
    }
    renderListHeader(panel);
    renderListBody(panel);
    return panel;
  }
  function renderListHeader(panel) {
    SKINS[currentSkinId()];
    let head = panel.querySelector(".im-list-header");
    if (!head) {
      head = document.createElement("div");
      head.className = "im-list-header";
      panel.appendChild(head);
    }
    const titleOrChips = `<div class="im-list-chips">
      <button type="button" class="im-chip${filterUnread ? "" : " active"}" data-chip="all">消息</button>
      <button type="button" class="im-chip${filterUnread ? " active" : ""}" data-chip="unread">未读</button>
    </div>`;
    const html = `
    ${titleOrChips}
    <div class="im-list-actions">
      <button type="button" class="im-icon-btn im-mask-anon-toggle${isMaskAvatar() && isMaskTitle() ? " is-on" : ""}" data-act="mask-anon" title="匿名模式：一键开关头像与标题伪装">${ICONS.disguise}</button>
      <button type="button" class="im-icon-btn im-mask-avatar-toggle${isMaskAvatar() ? " is-on" : ""}" data-act="mask-ava" title="伪装头像">${ICONS.eyes}</button>
      <button type="button" class="im-icon-btn im-mask-title-toggle${isMaskTitle() ? " is-on" : ""}" data-act="mask-title" title="伪装标题">${ICONS.win}</button>
      <button type="button" class="im-icon-btn im-hide-media-toggle${isHideMedia() ? " is-on" : ""}" data-act="hide-media" title="${isHideMedia() ? "显示媒体（图片/视频）" : "隐藏媒体：纯文本摸鱼模式"}">${isHideMedia() ? ICONS.imageOff : ICONS.image}</button>
      <button type="button" class="im-icon-btn xim-skin-btn" title="切换外观">${ICONS.swap}</button>
    </div>`;
    if (head.dataset.sig === html) return;
    head.dataset.sig = html;
    head.innerHTML = html;
  }
  const FAKE_TEMPLATES = [
    ["产品需求评审", "李磊：OK，我这边明天出初稿。"],
    ["前端样式对齐", "王芳：收到，已同步测试同学。"],
    ["线上问题排查", "张伟：问题已定位，等修复上线。"],
    ["早会纪要", "系统：3 条新消息已折叠"],
    ["排期表同步", "赵敏：[链接] 排期表 v2.3"],
    ["灰度发布值班", "陈静：@所有人 下午三点对齐"],
    ["回归范围确认", "刘洋：灰度比例先调到 10%"],
    ["设计走查", "孙悦：图片 2 张"],
    ["踩坑备忘录", "周杰：这个坑我踩过，别走老路"],
    ["文档更新中心", "吴迪：文档已更新"],
    ["发版窗口确认", "郑爽：明天发版窗口确认一下"],
    ["故障复盘", "冯刚：告警已恢复，复盘跟进中"],
    ["方案选型", "何娟：方案 B 整体成本更低"],
    ["测试用例补充", "罗强：测试用例已补完，可回归"],
    ["Merge 合并", "林琳：PR 已合并，主干绿了"],
    ["需求回溯", "许峰：回溯会安排在下周一"]
  ];
  const FAKE_UNREAD = [3, 0, 5, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
  const FAKE_TIMES = ["09:32", "昨天", "昨天", "周一", "上周", "09:12", "08:45", "周日", "周六", "周五", "周四", "周三", "周二", "10:03", "周一", "上周五"];
  function fakeRows(active) {
    const out = [];
    for (let i = 0; i < FAKE_TEMPLATES.length; i++) {
      const [nm, prev] = FAKE_TEMPLATES[i];
      const unread = FAKE_UNREAD[i];
      if (filterUnread && !unread) continue;
      const id = "fake:" + i;
      out.push(convRow({
        id,
        href: "#",
        name: isMaskTitle() ? disguiseTitle("fake:" + i) : nm,
        preview: prev,
        time: FAKE_TIMES[i],
        unread,
        avatar: "",
        active: id === active
      }));
    }
    return out;
  }
  function renderListBody(panel) {
    let body = panel.querySelector(".im-list-body");
    if (!body) {
      body = document.createElement("div");
      body.className = "im-list-body";
      panel.appendChild(body);
    }
    const active = getChatId() || chatIdFromRoute();
    const rows = [];
    {
      for (const p of PINNED) {
        const name = displayTitle("pin:" + p.id, p.name);
        rows.push(convRow({
          id: p.id,
          href: p.path,
          name,
          preview: p.preview,
          time: p.id === active ? "现在" : "",
          unread: 0,
          tag: isMaskTitle() ? "" : p.tag,
          avatar: "",
          active: p.id === active
        }));
      }
      rows.push(...fakeRows(active));
    }
    const html = rows.join("") || `<div class="im-list-status">暂无会话</div>`;
    if (body.dataset.sig === html) return;
    body.dataset.sig = html;
    body.innerHTML = html;
  }
  function convRow(it) {
    return `<a class="im-conv${it.active ? " active" : ""}" href="${escapeHtml(it.href || "#")}" data-id="${escapeHtml(it.id)}">
    ${convAvatarHtml(it.id, it.name, it.avatar, true)}
    <span class="im-conv-info">
      <span class="im-conv-top">
        <span class="im-conv-name">${escapeHtml(it.name)}</span>
        <span class="im-conv-time">${escapeHtml(it.time || "")}</span>
      </span>
      <span class="im-conv-bottom">
        <span class="im-conv-msg">${escapeHtml(stripText(it.preview))}</span>
        ${it.unread ? `<span class="im-conv-badge">${it.unread > 99 ? "99+" : it.unread}</span>` : ""}
      </span>
    </span>
  </a>`;
  }
  function onListClick(e) {
    var _a;
    const chip = e.target.closest("[data-chip]");
    if (chip) {
      filterUnread = chip.dataset.chip === "unread";
      ensureListPanel();
      return;
    }
    const act = e.target.closest("[data-act]");
    if (act) {
      const a = act.dataset.act;
      if (a === "mask-anon") {
        const on = !(isMaskAvatar() && isMaskTitle());
        setMaskAvatar(on);
        setMaskTitle(on);
        refreshMaskedChrome();
      } else if (a === "mask-ava") {
        setMaskAvatar(!isMaskAvatar());
        refreshMaskedChrome();
      } else if (a === "mask-title") {
        setMaskTitle(!isMaskTitle());
        refreshMaskedChrome();
      } else if (a === "hide-media") {
        const on = !isHideMedia();
        setHideMedia(on);
        document.documentElement.classList.toggle("im-hide-media", on);
        ensureListPanel();
        const chatBtn = document.querySelector(".im-chat-panel .im-hide-media-toggle");
        if (chatBtn) {
          chatBtn.classList.toggle("is-on", on);
          chatBtn.innerHTML = on ? ICONS.imageOff : ICONS.image;
          chatBtn.title = on ? "显示媒体（图片/视频）" : "隐藏媒体：纯文本摸鱼模式";
        }
        toast(on ? "已开启纯文本摸鱼模式（隐藏图片与视频）" : "已恢复显示图片与视频");
      }
      return;
    }
    const conv = e.target.closest(".im-conv");
    if (!conv) return;
    e.preventDefault();
    const id = conv.dataset.id;
    if (id.startsWith("fake:")) {
      const idx = Number(id.slice(5));
      if (Number.isFinite(idx) && FAKE_UNREAD[idx] > 0) {
        FAKE_UNREAD[idx] = 0;
        ensureListPanel();
      }
      return;
    }
    setChatId(id);
    if (id.startsWith("dm:")) {
      navigateX(conv.getAttribute("href") || `/messages/${id.slice(3)}`);
      resetChatMessages();
      return;
    }
    const pin = PINNED.find((p) => p.id === id);
    if (pin) {
      if (pin.id === "profile") {
        const p = nativeProfilePath();
        navigateX(p);
      } else if (pin.id === "explore" && routeKind() === "explore") {
        refreshHomeFeed();
      } else {
        navigateX(pin.path);
        if (pin.tab) setTimeout(() => clickHomeTab(pin.tab), 400);
      }
      resetChatMessages();
      (_a = document.querySelector(".im-feed-col")) == null ? void 0 : _a.scrollTo(0, 0);
      setTimeout(resetChatMessages, 600);
      setTimeout(resetChatMessages, 1500);
    }
  }
  function refreshMaskedChrome() {
    ensureListPanel();
    ensureRail();
    ensureTitlebar();
    resetChatMessages();
  }
  function syncListFromFeed() {
    const panel = document.querySelector(".im-list-panel");
    if (panel) renderListBody(panel);
  }
  function ensureStrip() {
    var _a;
    const skin = SKINS[currentSkinId()];
    const items = skin.strip || [];
    if (!items.length || !skin.stripWidth) {
      (_a = document.querySelector(".im-strip")) == null ? void 0 : _a.remove();
      return null;
    }
    let strip = document.querySelector(".im-strip");
    if (!strip) {
      strip = document.createElement("nav");
      strip.className = "im-strip";
      strip.setAttribute("aria-label", "快捷");
      (document.body || document.documentElement).appendChild(strip);
      strip.addEventListener("click", (e) => {
        const btn = e.target.closest(".im-strip-item");
        if (!(btn == null ? void 0 : btn.dataset.path)) return;
        navigateX(btn.dataset.path);
      });
    }
    const kind = routeKind();
    const on = kind === "notify" ? "notify" : kind === "msg" ? "msg" : kind === "bookmark" ? "bookmark" : kind === "explore" ? "explore" : "";
    strip.innerHTML = items.map((it) => {
      const n = it.path ? badgeCount(it.path) : 0;
      return `<button type="button" class="im-strip-item${it.key === on ? " active" : ""}" data-key="${it.key}" data-path="${it.path || ""}" title="${it.label}">
      ${getSkinIcon(it.icon)}
      ${n ? `<span class="im-strip-badge">${n > 99 ? "99+" : n}</span>` : ""}
    </button>`;
    }).join("");
    return strip;
  }
  let menu = null;
  let bound = false;
  function close() {
    menu == null ? void 0 : menu.remove();
    menu = null;
  }
  function toggleSkinMenu(anchor) {
    if (menu) {
      close();
      return;
    }
    const el = document.createElement("div");
    el.className = "xim-skin-menu";
    el.innerHTML = `<button type="button" class="xim-skin-item${currentSkinId() === DEFAULT_SKIN_ID ? " active" : ""}" data-mode="default">
      <span>切回默认 · ${SKINS[DEFAULT_SKIN_ID].label}</span>${currentSkinId() === DEFAULT_SKIN_ID ? `<span class="ok">${ICONS.check}</span>` : ""}
    </button>
    <div class="xim-skin-sep"></div>` + SKIN_ORDER.map(
      (id) => `<button type="button" class="xim-skin-item${id === currentSkinId() ? " active" : ""}" data-skin="${id}">
        <span>${SKINS[id].label}</span>${id === currentSkinId() ? `<span class="ok">${ICONS.check}</span>` : ""}
      </button>`
    ).join("") + `<div class="xim-skin-sep"></div><button type="button" class="xim-skin-item" data-mode="native"><span>原版小红书</span></button>`;
    el.addEventListener("click", (e) => {
      const def = e.target.closest("[data-mode='default']");
      if (def) {
        setSkinId(DEFAULT_SKIN_ID);
        close();
        location.reload();
        return;
      }
      const nat = e.target.closest("[data-mode='native']");
      if (nat) {
        setViewMode("native");
        close();
        location.reload();
        return;
      }
      const item = e.target.closest("[data-skin]");
      if (!item) return;
      setSkinId(item.dataset.skin);
      close();
      location.reload();
    });
    document.body.appendChild(el);
    const r = anchor.getBoundingClientRect();
    const w = el.offsetWidth || 160;
    const h = el.offsetHeight || 180;
    let left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8));
    let top = r.bottom + 6;
    if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 6);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    menu = el;
  }
  function onDocClick(e) {
    const btn = e.target.closest(".xim-skin-btn");
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      toggleSkinMenu(btn);
      return;
    }
    if (menu && !menu.contains(e.target)) close();
  }
  function bindSkinButtons() {
    if (bound) return;
    bound = true;
    document.addEventListener("click", onDocClick, true);
  }
  function ensureNativeFab() {
    var _a;
    if (getViewMode() !== "native") {
      (_a = document.querySelector(".xim-fab")) == null ? void 0 : _a.remove();
      return;
    }
    if (document.querySelector(".xim-fab")) return;
    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "xim-fab";
    fab.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:10001;height:38px;padding:0 16px;border-radius:19px;border:none;background:#1A87FF;color:#fff;font:700 14px/1 system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.22);display:flex;align-items:center;gap:6px;";
    fab.textContent = "⇄ 切回 IM";
    fab.title = "切回 IM 三合一界面";
    fab.addEventListener("click", () => {
      setViewMode("im");
      location.reload();
    });
    document.body.appendChild(fab);
  }
  function applyRootAttrs() {
    const html = document.documentElement;
    const skin = currentSkinId();
    html.classList.add(ROOT_CLASS, LOCK_CLASS);
    html.setAttribute("data-xim-skin", skin);
    html.setAttribute("data-xim-mask", isMaskAvatar() ? "1" : "0");
    html.classList.toggle("im-hide-media", isHideMedia());
    applyColorMode();
    const s = SKINS[skin];
    html.style.setProperty("--im-nav", s.railWidth + "px");
    html.style.setProperty("--im-list", s.listWidth + "px");
    html.style.setProperty("--im-header-h", s.titlebarHeight + "px");
    html.style.setProperty("--im-strip", (s.stripWidth || 0) + "px");
    html.style.setProperty("--im-nav2w", "0px");
  }
  function clearRootAttrs() {
    const html = document.documentElement;
    html.classList.remove(ROOT_CLASS, LOCK_CLASS, "im-hide-media");
    html.removeAttribute("data-xim-skin");
    html.removeAttribute("data-xim-dark");
    html.removeAttribute("data-xim-mask");
  }
  function ensureShell() {
    applyRootAttrs();
    ensureTitlebar();
    ensureRail();
    ensureStrip();
    highlightRail();
    ensureListPanel();
    ensureChatPanel();
    bindSkinButtons();
    makeFavicon();
    syncTitle();
  }
  function removeShell() {
    var _a, _b, _c, _d, _e, _f;
    (_a = document.querySelector(".im-titlebar")) == null ? void 0 : _a.remove();
    (_b = document.querySelector(".im-rail")) == null ? void 0 : _b.remove();
    (_c = document.querySelector(".im-strip")) == null ? void 0 : _c.remove();
    (_d = document.querySelector(".im-list-panel")) == null ? void 0 : _d.remove();
    (_e = document.querySelector(".im-chat-panel")) == null ? void 0 : _e.remove();
    (_f = document.querySelector(".xim-skin-menu")) == null ? void 0 : _f.remove();
    clearRootAttrs();
  }
  function syncTitle() {
    if (!document.documentElement.classList.contains(ROOT_CLASS)) return;
    const skin = SKINS[currentSkinId()];
    const id = getChatId() || chatIdFromRoute();
    if (String(id).startsWith("user:")) {
      document.title = `${id.slice(5)} - ${skin.label}`;
      return;
    }
    const pin = pinnedById(id.startsWith("note:") ? "explore" : id);
    const name = displayTitle("pin:" + pin.id, pin.name);
    document.title = `${name} - ${skin.label}`;
  }
  function run() {
    const version = "0.1.0";
    console.info(`[xhs-im] v${version} loaded, skin=${currentSkinId()}`);
    installSearchCapture();
    if (typeof window !== "undefined" && window.matchMedia) {
      try {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => applyTheme());
      } catch {
      }
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
      var _a, _b;
      const html = document.documentElement;
      if (!html) return;
      applyColorMode();
      if (getViewMode() !== "im") {
        html.classList.remove(ROOT_CLASS);
        (_a = document.getElementById(STYLE_ID)) == null ? void 0 : _a.remove();
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
        removeChatPanel();
        (_b = document.querySelector(".im-list-panel")) == null ? void 0 : _b.remove();
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
        if (!document.body) {
          requestAnimationFrame(startObs);
          return;
        }
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
  run();
})();
