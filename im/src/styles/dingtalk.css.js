export const CSS_DD = String.raw`
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
