export const CSS_FS = String.raw`
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
