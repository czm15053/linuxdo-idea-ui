export const CSS_X_HOST = `
/* X 宿主：藏原生壳，时间线移出视口当数据源，聊天用 im 自绘面板 */
html.im-theme, html.im-theme body {
  overflow-x: hidden !important;
  overflow-y: auto !important;
  background: var(--im-chat-bg, #fff) !important;
  padding: 0 !important;
  margin: 0 !important;
  scrollbar-width: none;
}
html.im-theme::-webkit-scrollbar, html.im-theme body::-webkit-scrollbar { width: 0; height: 0; }
html.im-theme .im-chat-body,
html.im-theme .im-feed-col,
html.im-theme .im-detail-body {
  overscroll-behavior: contain !important;
}

html.im-theme [data-testid="primaryColumn"] {
  position: relative !important;
  opacity: 0.01 !important;
  pointer-events: none !important;
  z-index: 0 !important;
  max-width: none !important;
  margin: 0 !important;
  border: 0 !important;
  width: calc(100vw - var(--im-nav) - var(--im-strip, 0px) - var(--im-list)) !important;
  margin-left: calc(var(--im-nav) + var(--im-strip, 0px) + var(--im-list)) !important;
}
html.im-theme .im-chat-panel { z-index: 420 !important; }
html.im-theme.xim-feed-loading,
html.im-theme.xim-feed-loading body { overflow-y: auto !important; }
/* 藏掉 X 原生全局加载层（导航瞬间的 spinner / 进度条），避免盖住 im 覆盖层露出闪屏 */
html.im-theme [role="progressbar"],
html.im-theme [aria-label="加载中"],
html.im-theme [aria-label="Loading"],
html.im-theme [data-testid="loadingSpinner"],
html.im-theme [data-testid="loader"] { opacity: 0 !important; visibility: hidden !important; }
html.im-theme header[role="banner"] {
  position: fixed !important; left: 0 !important; top: 0 !important;
  width: 0 !important; height: 0 !important; overflow: hidden !important;
  opacity: 0 !important; pointer-events: none !important; z-index: -1 !important;
}
html.im-theme [data-testid="sidebarColumn"],
html.im-theme [data-testid="GrokDrawer"],
html.im-theme [data-testid="chat-drawer-root"],
html.im-theme [data-testid="chat-drawer-main"],
html.im-theme [data-testid="BottomBar"],
html.im-theme [data-testid="placementTracking"],
html.im-theme a[href="/i/grok"] { display: none !important; }

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
html.im-theme .im-rail-avatar img {
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
/* 我的主页：rail 底部头像入口（飞书/企微头部用户头像可点） */
html.im-theme .im-rail-me-img {
  width: 26px !important;
  height: 26px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  background: var(--im-hover, #eef0f3) !important;
}
html.im-theme .im-me-btn { cursor: pointer; }
html.im-theme .im-rail-avatar,
html.im-theme .im-rail-me { cursor: pointer; }
html.im-theme .im-msg-avatar.is-grid-mask,
html.im-theme .im-conv-avatar.is-grid-mask,
html.im-theme .im-chat-avatar.is-grid-mask,
html.im-theme .im-dm-ava.is-grid-mask,
html.im-theme .im-rail-me-ava.is-grid-mask,
html.im-theme .im-rail-avatar.is-grid-mask,
html.im-theme .im-rail-me-img.is-grid-mask {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 0;
  padding: 0 !important;
  overflow: hidden;
}
html.im-theme .im-msg-avatar.is-grid-mask > span,
html.im-theme .im-conv-avatar.is-grid-mask > span,
html.im-theme .im-chat-avatar.is-grid-mask > span,
html.im-theme .im-dm-ava.is-grid-mask > span,
html.im-theme .im-rail-me-ava.is-grid-mask > span,
html.im-theme .im-rail-avatar.is-grid-mask > span,
html.im-theme .im-rail-me-img.is-grid-mask > span {
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 7px; font-weight: 700;
}
/* rail 我的头像（飞书/企微头部 + 底部“我的”）：mask 文字色块铺满容器 */
html.im-theme .im-rail-me .im-rail-me-ava { width: 40px; height: 40px; }
html.im-theme .im-rail-avatar .im-rail-me-ava { width: 100%; height: 100%; }
html.im-theme .im-rail-me-img.is-text-avatar.is-solid {
  width: 26px; height: 26px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  color: #fff; font-size: 12px; font-weight: 600; flex: none;
}
html.im-theme[data-xim-skin="wecom"] .im-rail-me-ava { border-radius: 8px; }
html.im-theme .im-rail-me-ava.is-text-avatar { font-size: 15px; font-weight: 700; }
html.im-theme .im-rail-me-img img,
html.im-theme .im-rail-me-ava img { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: inherit; }
/* 飞书彩色图标：is-fs-icon 就是头像容器本身（im-conv-avatar 等），不能写 100%，否则撑满整列 */
html.im-theme .is-fs-icon {
  display: flex !important; align-items: center; justify-content: center;
  overflow: hidden;
}
html.im-theme .is-fs-icon img { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: inherit; }

/* —— 飞书文字头像精髓：3~5 字、四字两行、实心/空心混用 —— */
html.im-theme .im-avatar-text {
  line-height: 1.05; font-weight: 600;
  overflow: hidden; word-break: break-all; max-width: 100%;
}
html.im-theme .im-msg-avatar .im-avatar-text,
html.im-theme .im-chat-avatar .im-avatar-text,
html.im-theme .im-dm-ava .im-avatar-text,
html.im-theme .im-conv-avatar .im-avatar-text,
html.im-theme .im-rail-me-ava .im-avatar-text,
html.im-theme .im-rail-avatar .im-avatar-text,
html.im-theme .im-rail-me-img .im-avatar-text { font-size: 10px; }
html.im-theme .im-msg-avatar .im-avatar-text[data-len="1"],
html.im-theme .im-chat-avatar .im-avatar-text[data-len="1"],
html.im-theme .im-dm-ava .im-avatar-text[data-len="1"],
html.im-theme .im-conv-avatar .im-avatar-text[data-len="1"],
html.im-theme .im-rail-me-ava .im-avatar-text[data-len="1"],
html.im-theme .im-rail-me-img .im-avatar-text[data-len="1"] { font-size: 14px; }
html.im-theme .im-msg-avatar .im-avatar-text[data-len="3"],
html.im-theme .im-chat-avatar .im-avatar-text[data-len="3"],
html.im-theme .im-dm-ava .im-avatar-text[data-len="3"],
html.im-theme .im-conv-avatar .im-avatar-text[data-len="3"] { font-size: 12px; }
html.im-theme .im-msg-avatar .im-avatar-text[data-len="4"],
html.im-theme .im-dm-ava .im-avatar-text[data-len="4"],
html.im-theme .im-conv-avatar .im-avatar-text[data-len="4"] {
  font-size: 11px; line-height: 1.15; width: 2.2em; text-align: center;
}
html.im-theme .im-chat-avatar .im-avatar-text[data-len="4"] { font-size: 8px; line-height: 1.1; width: 2.2em; text-align: center; }
html.im-theme .im-rail-me-img .im-avatar-text[data-len="3"],
html.im-theme .im-rail-me-img .im-avatar-text[data-len="4"],
html.im-theme .im-rail-me-img .im-avatar-text[data-len="5"] { font-size: 7px; }
html.im-theme .im-msg-avatar .im-avatar-text[data-len="5"],
html.im-theme .im-dm-ava .im-avatar-text[data-len="5"],
html.im-theme .im-conv-avatar .im-avatar-text[data-len="5"] { font-size: 9px; }
html.im-theme .is-text-avatar.is-hollow {
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06);
}

/* 匿名/伪装开关高亮：总开关 + 头像 + 标题统一高亮 */
html.im-theme .im-mask-anon-toggle.is-on,
html.im-theme .im-mask-avatar-toggle.is-on,
html.im-theme .im-mask-title-toggle.is-on {
  color: var(--im-accent, #3370FF);
  background: var(--im-accent-soft, #E8F0FE);
}
html.im-theme .im-rail-item,
html.im-theme .im-rail button,
html.im-theme .im-list-panel button,
html.im-theme .im-chat-panel button,
html.im-theme .im-titlebar button,
html.im-theme .im-strip-item,
html.im-theme .im-icon-btn,
html.im-theme .im-chip {
  appearance: none !important;
  -webkit-appearance: none !important;
  border: 0 !important;
  box-shadow: none !important;
  outline: none !important;
  font-family: inherit !important;
}
html.im-theme .im-icon-btn { background: transparent !important; }
html.im-theme .im-chip.active { background: #fff !important; }
html.im-theme .im-strip-item.active { background: var(--im-accent-soft, #E8F0FF) !important; color: var(--im-accent, #3370FF) !important; }
html.im-theme .im-send-btn {
  appearance: none !important;
  border: 0 !important;
  box-shadow: none !important;
}
html.im-theme .im-rail-item.active { background: #fff !important; }
html.im-theme[data-xim-skin="wecom"] .im-rail-item.active { background: var(--wc-accent-soft, #CFE4FF) !important; }
html.im-theme .im-chat-compose:empty::before {
  content: attr(data-placeholder);
  color: var(--im-text-3, #8f959e);
  pointer-events: none;
}
html.im-theme .im-msg-bubble img {
  max-height: 220px; width: auto; max-width: 100%; object-fit: cover;
}
/* —— 引用回复条：左竖线 + 名字 + 两行摘要；hover 浮层出全文/图 —— */
html.im-theme .im-quote {
  display: flex; align-items: flex-start; gap: 8px;
  margin: 0 0 6px; padding: 3px 0 3px 8px;
  border-left: 2px solid rgba(0, 0, 0, .28);
  border-radius: 1px; cursor: pointer;
  max-width: 100%;
  user-select: none;
}
html.im-theme .im-quote:hover {
  background: rgba(0, 0, 0, .04);
  border-left-color: var(--im-accent, #3370ff);
}
html.im-theme .im-msg-me .im-quote { border-left-color: color-mix(in srgb, var(--im-accent, #1a87ff) 60%, transparent); }
html.im-theme .im-reply-quote {
  display: flex; align-items: flex-start; gap: 6px;
  margin: 0 0 6px; padding: 6px 8px;
  background: rgba(0, 0, 0, .045); border-radius: 6px; cursor: pointer;
  max-width: 100%; user-select: none;
}
html.im-theme .im-reply-quote:hover { background: rgba(0, 0, 0, .08); }
html.im-theme .im-msg-me .im-reply-quote { background: rgba(0, 0, 0, .05); }
html.im-theme.im-dark .im-reply-quote { background: rgba(255, 255, 255, .06); }
html.im-theme.im-dark .im-reply-quote:hover { background: rgba(255, 255, 255, .11); }
html.im-theme .im-reply-quote-tag {
  flex: none; margin-top: 1px; padding: 1px 5px; border-radius: 4px;
  font-size: 10.5px; line-height: 1.4; color: #fff;
  background: var(--im-accent, #3370ff);
}
html.im-theme .im-reply-quote-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
html.im-theme .im-reply-quote .im-quote-body {
  font-size: 12.5px; line-height: 1.45; color: var(--im-text-1, #232429);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
html.im-theme .im-quote-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
html.im-theme .im-quote-name {
  font-size: 12px; font-weight: 600; line-height: 1.3;
  color: var(--im-text-2, #646a73);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
html.im-theme .im-quote-body {
  font-size: 12px; line-height: 1.4; margin-top: 1px;
  color: var(--im-text-3, #8f959e);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; word-break: break-word; white-space: pre-wrap;
}
html.im-theme .im-quote-thumb {
  flex: none; width: 36px; height: 36px; border-radius: 4px; object-fit: cover;
}
html.im-theme .im-quote-video {
  position: relative; flex: none; width: 96px; height: 54px; border-radius: 6px;
  overflow: hidden; background: #000; cursor: pointer; line-height: 0;
}
html.im-theme .im-quote-video img {
  width: 100% !important; height: 100% !important; object-fit: cover; display: block;
}
html.im-theme .im-quote-video .im-video-play {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(0, 0, 0, .55); color: #fff; backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center; pointer-events: none;
}
html.im-theme .im-quote-video .im-video-play svg { width: 13px; height: 13px; }
html.im-theme .im-quote-pop { display: none; }
html.im-theme .im-quote-float {
  padding: 10px 12px;
  background: var(--im-card, #fff);
  color: var(--im-text, #1f2329);
  border: 1px solid var(--im-border, #e8e9eb);
  border-radius: 10px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, .18);
  cursor: pointer;
}
html.im-theme .im-quote-float[hidden] { display: none !important; }
html.im-theme .im-quote-float .im-quote-pop-name {
  font-size: 13px; font-weight: 600; color: var(--im-text, #1f2329); margin-bottom: 6px;
}
html.im-theme .im-quote-float .im-quote-pop-body {
  font-size: 13px; line-height: 1.55; color: var(--im-text-2, #646a73);
  white-space: pre-wrap; word-break: break-word;
  max-height: 240px; overflow: auto;
}
html.im-theme .im-quote-pop-photos {
  display: grid; gap: 4px; margin-top: 8px;
}
html.im-theme .im-quote-pop-photos.im-photos-1 { grid-template-columns: 1fr; }
html.im-theme .im-quote-pop-photos.im-photos-2,
html.im-theme .im-quote-pop-photos.im-photos-4 { grid-template-columns: 1fr 1fr; }
html.im-theme .im-quote-pop-photos.im-photos-3 { grid-template-columns: 1.4fr 1fr; }
html.im-theme .im-quote-float img {
  width: 100%; height: 88px; object-fit: cover; border-radius: 6px;
  max-height: none; margin: 0; display: block;
}
html.im-theme.im-dark .im-quote { border-left-color: rgba(255, 255, 255, .25); }
html.im-theme.im-dark .im-quote:hover { background: rgba(255, 255, 255, .05); }
html.im-theme.im-dark .im-quote-float {
  background: #2b2f36; border-color: #3a3f47; box-shadow: 0 10px 32px rgba(0, 0, 0, .45);
}
html.im-theme .im-msg-tool[data-action="thread"] svg { stroke-width: 1.6; }

/* —— 个人主页资料卡 —— */
html.im-theme .im-profile-card {
  margin: 12px 14px 8px; padding: 16px;
  background: var(--im-card, #fff);
  border: 1px solid var(--im-border, #e8e9eb);
  border-radius: 12px;
}
html.im-theme .im-profile-head { display: flex; align-items: center; gap: 12px; }
html.im-theme .im-profile-avatar {
  flex: none; width: 52px; height: 52px; border-radius: 50%; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 20px; font-weight: 600;
}
html.im-theme .im-profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
html.im-theme .im-profile-names { min-width: 0; display: flex; flex-direction: column; }
html.im-theme .im-profile-name { font-size: 16px; font-weight: 600; color: var(--im-text, #1f2329); }
html.im-theme .im-profile-handle { font-size: 13px; color: var(--im-text-3, #8f959e); }
html.im-theme .im-profile-bio {
  margin-top: 10px; font-size: 13px; line-height: 1.5;
  color: var(--im-text-2, #646a73); word-break: break-word;
}
html.im-theme .im-profile-bio .im-mask-link { color: var(--im-accent, #3370ff); }

/* —— 场景引导卡（私信 / 探索 / 搜索） —— */
html.im-theme .im-chat-guide {
  margin: 14px; padding: 28px 20px; text-align: center;
  background: var(--im-card, #fff);
  border: 1px solid var(--im-border, #e8e9eb);
  border-radius: 12px;
}
html.im-theme .im-guide-icon {
  margin: 0 auto 10px; width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; background: var(--im-accent-soft, #e8f0ff); color: var(--im-accent, #3370ff);
}
html.im-theme .im-guide-icon svg { width: 22px; height: 22px; }
html.im-theme .im-guide-title { font-size: 15px; font-weight: 600; color: var(--im-text, #1f2329); }
html.im-theme .im-guide-text { margin-top: 6px; font-size: 13px; line-height: 1.5; color: var(--im-text-3, #8f959e); }
html.im-theme .im-guide-btn {
  margin-top: 14px; padding: 7px 18px; border: 0; border-radius: 18px;
  appearance: none; cursor: pointer;
  background: var(--im-accent, #3370ff); color: #fff; font-size: 13px;
}

/* —— 评论区置顶主推卡 —— */
html.im-theme .im-chat-body.xim-in-thread { padding-top: 4px; }
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
}
html.im-theme .im-thread-pin-avatar img { width: 100%; height: 100%; object-fit: cover; }
html.im-theme .im-thread-pin-names { flex: 1; min-width: 0; display: flex; flex-direction: column; }
html.im-theme .im-thread-pin-name { font-size: 14px; font-weight: 600; color: var(--im-text, #1f2329); }
html.im-theme .im-thread-pin-handle { font-size: 12px; color: var(--im-text-3, #8f959e); }
html.im-theme .im-profile-follow,
html.im-theme .im-pin-follow-btn {
  flex: none;
  cursor: pointer;
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--im-accent, #3370ff);
  background: transparent;
  color: var(--im-accent, #3370ff);
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all .15s ease;
  user-select: none;
}
html.im-theme .im-profile-follow:hover,
html.im-theme .im-pin-follow-btn:hover {
  background: var(--im-accent-soft, #e8f0ff);
}
html.im-theme .im-profile-follow.on,
html.im-theme .im-pin-follow-btn.on {
  border-color: var(--im-border, #e8e9eb);
  color: var(--im-text-2, #646a73);
  background: transparent;
}
html.im-theme .im-profile-follow.on:hover,
html.im-theme .im-pin-follow-btn.on:hover {
  border-color: rgba(244, 33, 46, 0.4);
  color: #f4212e;
  background: rgba(244, 33, 46, 0.08);
}
html.im-theme .im-profile-follow:disabled,
html.im-theme .im-pin-follow-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
html.im-theme .im-msg-follow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 0 7px;
  margin-left: 6px;
  border-radius: 999px;
  border: 1px solid var(--im-accent, #3370ff);
  background: transparent;
  color: var(--im-accent, #3370ff);
  font-size: 11px;
  line-height: 1;
  font-weight: 500;
  cursor: pointer;
  vertical-align: middle;
  transition: all .15s ease;
  user-select: none;
}
html.im-theme .im-msg-follow:hover {
  background: var(--im-accent-soft, #e8f0ff);
}
html.im-theme .im-msg-follow.on {
  border-color: var(--im-border, #e8e9eb);
  color: var(--im-text-3, #8f959e);
  background: transparent;
}
html.im-theme .im-msg-follow.on:hover {
  border-color: rgba(244, 33, 46, 0.4);
  color: #f4212e;
  background: rgba(244, 33, 46, 0.08);
}
html.im-theme .im-msg-follow:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
html.im-theme .im-thread-pin-body {
  margin-top: 10px; font-size: 14px; line-height: 1.55; color: var(--im-text, #1f2329);
  white-space: normal; word-break: break-word;
}
html.im-theme .im-thread-pin-photos {
  margin-top: 10px; display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 6px;
}
html.im-theme .im-thread-pin-photos img {
  width: auto; max-width: 100%; height: auto; max-height: 520px;
  object-fit: contain; border-radius: 8px; margin: 0 auto; display: block;
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

/* —— 中栏详情：点推文在 chat-body 右侧拉出详情面板（盖住列表右 ~2/3、左留窄条可滚动），header/composer 固定不动；分隔条可左右抽拉调宽 —— */
html.im-theme .im-chat-body {
  position: relative;
  display: flex;
  align-items: stretch;
  overflow: hidden;
}
/* 消息列表滚动列：默认占满，详情打开时压缩为左侧窄条 */
html.im-theme .im-chat-body > .im-feed-col {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
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
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
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
html.im-theme .im-detail-loading {
  margin: 10px 0 4px;
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
}
html.im-theme .im-detail-back:hover { background: var(--im-hover, #f5f6f7); color: var(--im-text, #1f2329); }
html.im-theme .im-detail-back svg { width: 18px; height: 18px; }
html.im-theme .im-detail-titles {
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-left: 4px;
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

.xim-skin-menu {
  position: fixed; z-index: 10050; min-width: 150px;
  background: var(--im-bg, #fff); border: 1px solid var(--im-border, #e8e9eb);
  border-radius: 10px; box-shadow: 0 6px 24px rgba(0,0,0,.14);
  padding: 6px; display: flex; flex-direction: column;
  font-family: var(--im-font, inherit);
}
.xim-skin-item {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 8px 12px; border: 0; background: transparent; border-radius: 6px;
  color: var(--im-text, #1f2329); font-size: 13px; cursor: pointer; text-align: left;
}
.xim-skin-item:hover { background: var(--im-hover, #f5f6f7); }
.xim-skin-item.active { color: var(--im-accent, #3370ff); font-weight: 600; }
.xim-skin-sep { height: 1px; background: var(--im-border, #e8e9eb); margin: 4px 6px; }
#xim-toast {
  position: fixed; left: 50%; bottom: 84px; transform: translateX(-50%); z-index: 10002;
  background: #111; color: #fff; padding: 8px 14px; border-radius: 8px; font-size: 12px; display: none;
}
#xim-toast.on { display: block; }
.xim-fab {
  position: fixed; z-index: 10001; right: 16px; bottom: 16px;
  width: 44px; height: 44px; border-radius: 22px; border: 0;
  background: #1A87FF; color: #fff; font-weight: 700; cursor: pointer;
}

.im-msg-bubble img { max-width: 100%; border-radius: 6px; display: block; margin-top: 8px; }
.im-msg-bubble .im-q {
  margin: 0 0 8px; padding: 6px 10px; max-height: 48px; overflow: hidden; cursor: pointer;
  border-left: 3px solid var(--im-accent, #3370ff);
  background: rgba(51,112,255,.06); border-radius: 0 6px 6px 0;
  font-size: 13px; color: var(--im-text-2, #646a73); position: relative;
}
.im-msg-bubble .im-q.is-open { max-height: none; cursor: default; }

html.im-theme div[role="dialog"],
html.im-theme [aria-modal="true"] { z-index: 20000 !important; pointer-events: auto !important; }

/* —— 推文内容形态：长文折叠 / 外链卡 / 视频 / 投票 —— */
html.im-theme .im-tw-body { font-size: 14px; line-height: 1.55; color: var(--im-text, #1f2329); word-break: break-word; white-space: normal; }
html.im-theme .im-msg-me .im-tw-body { color: var(--im-text, #1f2329); }
html.im-theme .im-longtext {
  display: -webkit-box; -webkit-line-clamp: 8; -webkit-box-orient: vertical; overflow: hidden;
  cursor: pointer; position: relative;
}
html.im-theme .im-longtext::after {
  content: "展开"; position: absolute; right: 0; top: 0;
  padding: 0 4px; border-radius: 4px 0 0 4px;
  background: var(--im-accent-soft, #e8f0ff); color: var(--im-accent, #3370ff);
  font-size: 10px; line-height: 16px; pointer-events: none;
}
html.im-theme .im-msg-me .im-longtext::after { background: rgba(0, 0, 0, .45); color: #fff; }
html.im-theme .im-longtext.is-open { -webkit-line-clamp: none; overflow: visible; cursor: default; }
html.im-theme .im-longtext.is-open::after { display: none; }

html.im-theme .im-video {
  position: relative; margin-top: 8px; border-radius: 10px; overflow: hidden;
  max-height: 320px; background: #000; cursor: pointer; line-height: 0;
}
html.im-theme .im-msg-me .im-video { background: #000; }
html.im-theme .im-video img { width: 100% !important; max-height: 320px !important; object-fit: cover; display: block; }
html.im-theme .im-video-play {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(0, 0, 0, .55); color: #fff; backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center; pointer-events: none;
}
html.im-theme .im-video-play svg { width: 20px; height: 20px; }
html.im-theme .im-video.is-playing {
  aspect-ratio: 16 / 9;
  width: 100%;
  max-height: 360px;
  min-height: 180px;
  height: auto;
  cursor: default;
  overflow: hidden;
}
html.im-theme .im-video.is-playing .im-video-play { display: none !important; }
html.im-theme .im-video.is-playing video { cursor: pointer; }
html.im-theme .im-video.is-playing .xim-video-lifted,
html.im-theme .im-video.is-playing .xim-video-inline {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  border-radius: 0;
}
html.im-theme .im-video.is-playing .xim-video-lifted > div,
html.im-theme .im-video.is-playing video {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  object-fit: contain;
}
html.im-theme .im-chat-actions [data-act="refresh"][hidden] { display: none !important; }
html.im-theme .im-video-fallback { width: 100%; height: 180px; background: #111; }
html.im-theme .im-video-modal-el {
  max-width: 92vw; max-height: 80vh; background: #000; border-radius: 8px;
}
html.im-theme .xim-video-lifted {
  width: min(960px, 92vw) !important;
  max-height: 80vh !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  background: #000 !important;
  overflow: hidden;
  border-radius: 8px;
}
html.im-theme .xim-video-lifted video {
  width: 100%; height: auto; max-height: 78vh; background: #000;
}
html.im-theme .im-video-miss {
  color: #fff; font-size: 14px; padding: 24px; text-align: center;
}

html.im-theme .im-link-card {
  display: flex; align-items: stretch; gap: 10px; margin-top: 8px;
  border: 1px solid var(--im-border, #e8e9eb); border-radius: 10px;
  overflow: hidden; cursor: pointer; background: var(--im-card, #fff);
  min-width: 0;
}
html.im-theme .im-msg-me .im-link-card { background: rgba(0, 0, 0, .05); border-color: rgba(0, 0, 0, .08); }
html.im-theme .im-link-card:hover { border-color: var(--im-accent, #3370ff); }
html.im-theme .im-link-card .im-link-thumb {
  flex: none; width: 76px; min-height: 76px; max-height: 76px !important;
  margin: 0 !important; object-fit: cover;
}
html.im-theme .im-link-main { flex: 1; min-width: 0; padding: 8px 10px; display: flex; flex-direction: column; justify-content: center; gap: 3px; }
html.im-theme .im-link-title {
  font-size: 13px; font-weight: 600; color: var(--im-text, #1f2329); line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
html.im-theme .im-link-domain { font-size: 12px; color: var(--im-text-3, #8f959e); }

html.im-theme .im-poll {
  margin-top: 8px; padding: 8px 10px; border: 1px solid var(--im-border, #e8e9eb);
  border-radius: 10px; background: var(--im-card, #fff);
}
html.im-theme .im-msg-me .im-poll { background: rgba(0, 0, 0, .05); border-color: rgba(0, 0, 0, .08); }
html.im-theme .im-poll-hint { font-size: 11px; color: var(--im-text-3, #8f959e); margin-bottom: 6px; }
html.im-theme .im-poll-opts { display: flex; flex-direction: column; gap: 4px; }
html.im-theme .im-poll-opt {
  display: flex; align-items: center; gap: 7px; padding: 5px 8px;
  border-radius: 6px; font-size: 13px; color: var(--im-text-2, #646a73);
}
html.im-theme .im-poll-opt:hover { background: var(--im-hover, #f5f6f7); }
html.im-theme .im-poll-check {
  flex: none; width: 16px; height: 16px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--im-border, #d8d9dd); color: transparent;
}
html.im-theme .im-poll-opt:hover .im-poll-check { color: var(--im-accent, #3370ff); border-color: var(--im-accent, #3370ff); }
html.im-theme .im-poll-check svg { width: 10px; height: 10px; }

/* —— 首页信息流细节：转推标记 / 认证勾 / 推荐关注 tab —— */
html.im-theme .im-repost-tag {
  display: flex; align-items: center; gap: 4px; margin-bottom: 6px;
  font-size: 11px; color: var(--im-text-3, #8f959e);
}
html.im-theme .im-repost-tag svg { width: 12px; height: 12px; flex: none; }
html.im-theme .im-repost-tag b { font-weight: 600; color: var(--im-text-2, #646a73); }
html.im-theme .im-msg-me .im-repost-tag b { color: var(--im-text, #1f2329); }
html.im-theme .im-verified {
  width: 13px; height: 13px; flex: none; margin-left: 2px;
  display: inline-block; vertical-align: -2px;
  fill: var(--im-accent, #3370ff);
}
html.im-theme .im-chat-tabs {
  height: 44px;
  min-height: 44px;
  flex-shrink: 0;
  background: var(--im-chat-bg, #fff);
  border-bottom: 1px solid var(--im-border, #e8e9eb);
  display: flex;
  align-items: stretch;
  padding: 0 16px;
  gap: 12px;
  position: relative;
  z-index: 5;
  user-select: none;
}
html.im-theme .im-chat-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 500;
  color: var(--im-text-3, #8f959e);
  cursor: pointer;
  text-decoration: none !important;
  border: 0 !important;
  background: transparent;
  transition: color .15s ease;
}
html.im-theme .im-chat-tab:hover {
  color: var(--im-text, #1f2329);
}
html.im-theme .im-chat-tab svg {
  width: 16px;
  height: 16px;
  flex: none;
}
html.im-theme .im-chat-tab.active {
  color: var(--im-text, #1f2329) !important;
  font-weight: 600;
}
html.im-theme .im-chat-tab.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 10px;
  right: 10px;
  height: 3px;
  border-radius: 2px;
  background: var(--im-accent, #1d9bf0);
}
/* 过滤扩展翻译注入造成的重影 */
html.im-theme .im-chat-tabs .immersive-translate-target-wrapper,
html.im-theme .im-chat-tabs [data-immersive-translate-translation-element-mark],
html.im-theme .im-chat-header .immersive-translate-target-wrapper,
html.im-theme .im-rail .immersive-translate-target-wrapper,
html.im-theme .im-list-panel .immersive-translate-target-wrapper {
  display: none !important;
}
html.im-theme .im-sort-wrap { margin-left: auto; position: relative; display: inline-flex; }
html.im-theme .im-sort-wrap[hidden] { display: none; }
html.im-theme .im-sort-btn {
  appearance: none; border: 0; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 999px; background: var(--im-hover, #eef0f3);
  color: var(--im-text-2, #646a73); font-size: 12px; font-family: inherit;
}
html.im-theme .im-sort-btn svg { width: 13px; height: 13px; }
html.im-theme .im-sort-btn:hover { color: var(--im-accent, #3370ff); background: var(--im-accent-soft, #e8f0ff); }
html.im-theme .im-sort-menu {
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 30;
  min-width: 108px; padding: 4px; border-radius: 10px;
  background: var(--im-card, #fff); border: 1px solid var(--im-border, #e8e9eb);
  box-shadow: 0 10px 26px rgba(0, 0, 0, .12);
  opacity: 0; pointer-events: none; transform: translateY(-4px);
  transition: opacity .12s ease, transform .12s ease;
}
html.im-theme .im-sort-wrap.open .im-sort-menu { opacity: 1; pointer-events: auto; transform: none; }
html.im-theme .im-sort-item {
  display: block; width: 100%; text-align: left;
  appearance: none; border: 0; cursor: pointer; background: transparent;
  padding: 6px 10px; border-radius: 6px; font-size: 12.5px; color: var(--im-text-1, #232429); font-family: inherit;
}
html.im-theme .im-sort-item:hover { background: var(--im-hover, #edf0f3); }
html.im-theme .im-sort-item:last-child { margin-top: 2px; border-top: 1px solid var(--im-border, #e8e9eb); }
html.im-theme .im-msg-head { display: flex; align-items: baseline; gap: 8px; }
html.im-theme .im-msg-meta { color: var(--im-text-3, #8f959e); }

/* —— 多图弹窗：左右切换箭头与计数 —— */
html.im-theme .im-img-nav {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 6;
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; color: #fff;
  background: rgba(15, 20, 30, .45); opacity: .8;
}
html.im-theme .im-img-nav:hover { opacity: 1; background: rgba(15, 20, 30, .65); }
html.im-theme .im-img-nav:disabled { opacity: .22; cursor: default; }
html.im-theme .im-img-prev { left: 16px; }
html.im-theme .im-img-next { right: 16px; }
html.im-theme .im-img-count { margin: 0 10px 0 4px; font-size: 13px; color: var(--im-text-3, #8f959e); user-select: none; }
html.im-theme .im-replied-tag svg { display: none; }

/* —— 多图会话：1 图单张 / 2·4 图 2× 网格，图内可挂 ALT 角标 —— */
html.im-theme .im-msg-photos {
  margin-top: 8px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px;
}
html.im-theme .im-photo { position: relative; aspect-ratio: 1 / 1; overflow: hidden; border-radius: 6px; background: var(--im-hover, #f5f6f7); }
html.im-theme .im-photo img { width: 100% !important; height: 100% !important; max-height: none !important; object-fit: cover; display: block; }
html.im-theme .im-alt-badge {
  position: absolute; top: 4px; right: 4px; z-index: 1;
  padding: 1px 5px; border-radius: 4px;
  background: rgba(0, 0, 0, .55); color: #fff; font-size: 9px; line-height: 14px; letter-spacing: .04em;
}
html.im-theme .im-photos-1 { display: block; max-width: 62%; }
html.im-theme .im-photos-1 .im-photo { aspect-ratio: auto; max-height: none; border-radius: 8px; }
html.im-theme .im-msg-photos.im-photos-1 img {
  height: auto !important; width: auto !important; max-width: 100% !important;
  max-height: 480px !important;
  object-fit: contain !important; display: block; margin: 0 auto;
}
html.im-theme .im-msg-photos:not(.im-photos-1) { max-height: 360px; }
html.im-theme .im-photos-2 .im-photo, html.im-theme .im-photos-3 .im-photo, html.im-theme .im-photos-4 .im-photo { max-height: 178px; }
/* 3 图：左侧大图占两行高，右侧两小图并排（对齐原生布局） */
html.im-theme .im-photos-3 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
html.im-theme .im-photos-3 .im-photo { aspect-ratio: auto; max-height: none !important; }
html.im-theme .im-photos-3 .im-photo:first-child { grid-row: 1 / span 2; }
html.im-theme .im-msg-bubble { cursor: pointer; }
html.im-theme .im-msg-bubble .im-tw-body { cursor: text; }
html.im-theme .im-msg-bubble .im-tw-body.im-longtext { cursor: pointer; }

/* —— 详情主推/引用卡正文成链的 URL —— */
html.im-theme .im-thread-pin-body a,
html.im-theme .im-quote-body a,
html.im-theme .im-quote-pop-body a {
  text-decoration: underline;
  color: var(--im-link, #3370ff);
  word-break: break-all;
}

/* —— 私信会话列表 —— */
html.im-theme .im-dm-list { padding: 4px 6px; }
html.im-theme .im-dm-head {
  padding: 10px 10px 6px; font-size: 12px; font-weight: 600;
  color: var(--im-text-3, #8f959e); letter-spacing: .02em;
}
html.im-theme .im-dm-row {
  display: flex; align-items: center; gap: 10px;
  margin: 2px 0; padding: 7px 10px; border-radius: 10px; cursor: pointer;
}
html.im-theme .im-dm-row:hover { background: var(--im-hover, #f5f6f7); }
html.im-theme .im-dm-ava {
  flex: none; width: 38px; height: 38px; border-radius: 50%; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 14px; font-weight: 600;
}
html.im-theme .im-dm-ava img { width: 100%; height: 100%; object-fit: cover; display: block; }
html.im-theme .im-dm-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
html.im-theme .im-dm-name { font-size: 13px; font-weight: 600; color: var(--im-text, #1f2329); }
html.im-theme .im-dm-prev {
  font-size: 12px; color: var(--im-text-3, #8f959e);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
html.im-theme .im-feed-col > .im-msg,
html.im-theme .im-detail-body .im-msg { margin-top: 6px; margin-bottom: 16px; }
html.im-theme .im-dm-thread .im-msg { margin-top: 6px; margin-bottom: 16px; }

/* —— 纯文本模式：隐藏所有推文配图、视频播放器、引用缩略图、外链配图与抽屉配图 —— */
html.im-theme.im-hide-media .im-msg-photos,
html.im-theme.im-hide-media .im-video,
html.im-theme.im-hide-media .im-quote-video,
html.im-theme.im-hide-media .im-quote-thumb,
html.im-theme.im-hide-media .im-quote-pop-photos,
html.im-theme.im-hide-media .im-link-card .im-link-thumb,
html.im-theme.im-hide-media .im-thread-pin-photos,
html.im-theme.im-hide-media .im-thread-pin video,
html.im-theme.im-hide-media .im-thread-pin .im-video,
html.im-theme.im-hide-media .xim-video-lifted {
  display: none !important;
}
html.im-theme .im-hide-media-toggle.is-on {
  color: var(--im-accent, #3370ff) !important;
  background: var(--im-accent-soft, #e8f0ff) !important;
}
html.im-theme .im-dm-thread .im-thread-pin { margin-bottom: 6px; }

/* —— 回车发布二次确认条 —— */
html.im-theme .im-composer-card { position: relative; }
html.im-theme .im-send-confirm {
  position: absolute; bottom: calc(100% + 8px); left: 8px; right: 8px; z-index: 9;
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; border-radius: 8px;
  background: var(--im-card, #fff); border: 1px solid var(--im-border, #e8e9eb);
  box-shadow: 0 6px 18px rgba(0, 0, 0, .1);
  font-size: 12px; color: var(--im-text-2, #646a73);
  opacity: 0; pointer-events: none; transform: translateY(4px);
  transition: opacity .12s ease, transform .12s ease;
}
html.im-theme .im-send-confirm.on { opacity: 1; pointer-events: auto; transform: none; }
html.im-theme .im-send-confirm .cf-hint { color: var(--im-text-3, #8f959e); font-size: 11px; }
html.im-theme .im-send-confirm .spacer { flex: 1; }
html.im-theme .im-send-confirm button {
  appearance: none; border: 0; cursor: pointer; border-radius: 5px;
  padding: 4px 10px; font-size: 12px; font-family: inherit;
}
html.im-theme .im-send-confirm .cf-cancel { background: transparent; color: var(--im-text-2, #646a73); }
html.im-theme .im-send-confirm .cf-cancel:hover { background: var(--im-hover, #f5f6f7); }
html.im-theme .im-send-confirm .cf-ok { background: var(--im-accent, #3370ff); color: #fff; font-weight: 600; }
html.im-theme .im-send-confirm .cf-ok:hover { filter: brightness(1.05); }
html.im-theme .im-reply-bar {
  display: none; align-items: center; gap: 8px;
  padding: 6px 10px; margin-bottom: 6px; border-radius: 8px;
  background: var(--im-accent-soft, #E8F0FE); border: 1px solid color-mix(in srgb, var(--im-accent, #3370ff) 30%, transparent);
  font-size: 12px; color: var(--im-text-2, #646a73);
}
html.im-theme .im-reply-bar.on { display: flex; }
html.im-theme .im-reply-bar-tag {
  padding: 1px 7px; border-radius: 999px; flex: 0 0 auto;
  background: var(--im-accent, #3370ff); color: #fff; font-size: 11px; font-weight: 600;
}
html.im-theme .im-reply-bar-handle { color: var(--im-accent, #3370ff); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
html.im-theme .im-reply-bar .spacer { flex: 1; }
html.im-theme .im-reply-bar-x {
  appearance: none; border: 0; cursor: pointer; flex: 0 0 auto;
  width: 20px; height: 20px; border-radius: 50%; line-height: 1;
  background: transparent; color: var(--im-text-3, #8f959e); font-size: 15px; padding: 0;
}
html.im-theme .im-reply-bar-x:hover { background: var(--im-hover, #edf0f3); color: var(--im-text-1, #232429); }

/* —— tool 按钮 hover：展示带计数的操作栏与微标，常驻图标保持干净 —— */
html.im-theme .im-msg-tool {
  position: relative;
  width: auto;
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  box-sizing: border-box;
}
html.im-theme .im-msg-tool .im-tool-num {
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  color: var(--im-text-3, #8f959e);
  font-variant-numeric: tabular-nums;
}
html.im-theme .im-msg-tool:hover .im-tool-num {
  color: var(--im-text-1, #1f2329);
}
html.im-theme .im-msg-tool.im-msg-trans {
  width: auto; padding: 0 7px; font-size: 11px;
  color: var(--im-text-3, #8f959e);
}
html.im-theme .im-msg-tool.im-msg-trans:hover {
  color: var(--im-link, #3370ff);
  background: color-mix(in srgb, var(--im-link, #3370ff) 10%, transparent);
  border-radius: 6px;
}
html.im-theme .im-msg-tool.im-msg-trans::after { display: none; }
html.im-theme .im-msg-tool[data-count]:not([data-count=""])::after {
  content: attr(data-name) ": " attr(data-count);
  position: absolute; bottom: calc(100% + 6px); left: 50%;
  transform: translateX(-50%) translateY(2px);
  padding: 3px 8px; border-radius: 6px; font-size: 11px; line-height: 1.4;
  background: rgba(17, 17, 17, .92); color: #fff; white-space: nowrap;
  opacity: 0; pointer-events: none; z-index: 10;
  transition: opacity .12s ease, transform .12s ease;
}
html.im-theme .im-msg-tool:not([data-count])::after,
html.im-theme .im-msg-tool[data-count=""]::after {
  content: attr(data-name);
  position: absolute; bottom: calc(100% + 6px); left: 50%;
  transform: translateX(-50%) translateY(2px);
  padding: 3px 8px; border-radius: 6px; font-size: 11px; line-height: 1.4;
  background: rgba(17, 17, 17, .92); color: #fff; white-space: nowrap;
  opacity: 0; pointer-events: none; z-index: 10;
  transition: opacity .12s ease, transform .12s ease;
}
html.im-theme .im-msg-tool:hover::after { opacity: 1; transform: translateX(-50%) translateY(0); }

/* 操作按钮高亮态（点赞粉、转推绿、书签蓝） */
html.im-theme .im-msg-tool.is-liked,
html.im-theme .im-thread-pin-act.is-liked {
  color: #f91880 !important;
}
html.im-theme .im-msg-tool.is-liked .im-tool-num {
  color: #f91880 !important;
}
html.im-theme .im-msg-tool.is-retweeted,
html.im-theme .im-thread-pin-act.is-retweeted {
  color: #00ba7c !important;
}
html.im-theme .im-msg-tool.is-retweeted .im-tool-num {
  color: #00ba7c !important;
}
html.im-theme .im-msg-tool.is-bookmarked,
html.im-theme .im-thread-pin-act.is-bookmarked {
  color: #1d9bf0 !important;
}
html.im-theme .im-msg-tool.is-bookmarked .im-tool-num {
  color: #1d9bf0 !important;
}
html.im-theme .im-thread-pin-stat {
  cursor: default !important;
}
html.im-theme .im-thread-pin-stat:hover {
  color: var(--im-text-3, #8f959e) !important;
}

/* 通知中心卡片 */
html.im-theme .im-notify-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  margin: 8px 16px;
  border-radius: 8px;
  background: var(--im-card-bg, #fff);
  border: 1px solid var(--im-border, #e8e9eb);
  box-shadow: 0 1px 3px rgba(0, 0, 0, .04);
}
html.im-theme .im-notify-icon {
  flex: none;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
html.im-theme .im-notify-icon svg {
  width: 20px;
  height: 20px;
}
html.im-theme .im-notify-main {
  flex: 1 1 auto;
  min-width: 0;
}
html.im-theme .im-notify-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: var(--im-text, #1f2329);
}
html.im-theme .im-notify-ava {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  flex: none;
}
html.im-theme .im-notify-ava img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
html.im-theme .im-notify-desc {
  flex: 1 1 auto;
  line-height: 1.4;
}
html.im-theme .im-notify-time {
  font-size: 11px;
  color: var(--im-text-3, #8f959e);
  margin-left: auto;
}
html.im-theme .im-notify-snippet {
  margin-top: 8px;
  font-size: 13px;
  color: var(--im-text-2, #646a73);
  background: var(--im-hover, #f5f6f7);
  padding: 8px 12px;
  border-radius: 6px;
  line-height: 1.45;
  cursor: pointer;
}
html.im-theme .im-notify-snippet:hover {
  background: var(--im-line, #e8e9eb);
}

/* 搜索用户卡片 */
html.im-theme .im-user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 6px 16px;
  border-radius: 8px;
  background: var(--im-card-bg, #fff);
  border: 1px solid var(--im-border, #e8e9eb);
  cursor: pointer;
  transition: background .15s ease;
}
html.im-theme .im-user-cell:hover {
  background: var(--im-hover, #f5f6f7);
}
html.im-theme .im-user-cell-ava {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex: none;
}
html.im-theme .im-user-cell-ava img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
html.im-theme .im-user-cell-info {
  flex: 1 1 auto;
  min-width: 0;
}
html.im-theme .im-user-cell-name {
  font-size: 14px;
  color: var(--im-text, #1f2329);
}
html.im-theme .im-user-cell-handle {
  font-size: 12px;
  color: var(--im-text-3, #8f959e);
  margin-left: 6px;
}
html.im-theme .im-user-cell-bio {
  font-size: 12px;
  color: var(--im-text-2, #646a73);
  margin-top: 4px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* —— LIVE 实时音频广播 —— */
html.im-theme .im-live-tag {
  display: flex; align-items: center; gap: 5px; margin-bottom: 6px;
  font-size: 11px; font-weight: 600; color: #f23; letter-spacing: .02em;
}
html.im-theme .im-live-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #f23; flex: none;
  box-shadow: 0 0 0 2px rgba(255, 34, 51, .15);
}
`;
