export const CSS_WECOM = String.raw`
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
      --im-composer-bg: #FFFFFF;
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
    .im-rail-me { position: relative; flex-shrink: 0; display: flex; }
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
    .im-composer {
      background: #FFFFFF; border-top: 0;
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
      --wc-chat-bg: #202021;
      --im-composer-bg: #2C2C2D;
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
      background: #202021;
      border-bottom-color: #2A2C2E;
    }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-title { color: var(--wc-text); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-chat-sub { color: var(--wc-text-3); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-msg-name { color: var(--wc-text-3); }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer { background: #2C2C2D; }
    .__ROOT_CLASS__.__DARK_CLASS__ .im-composer-card {
      background: #2C2C2D;
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
