export const CSS_XHS_HOST = `
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
