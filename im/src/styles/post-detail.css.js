export const CSS_POST_DETAIL = String.raw`
/* 帖子详情右侧面板 */
.linuxdo-post-detail {
  position: fixed;
  top: 0;
  right: 0;
  width: var(--im-detail-w, 420px);
  height: 100vh;
  background: var(--im-bg);
  border-left: 1px solid var(--im-border);
  display: flex;
  flex-direction: column;
  z-index: 99998;
  transform: translateX(100%);
  transition: transform 0.24s ease;
  font-family: var(--im-font);
  color: var(--im-text-1);
}
.linuxdo-post-detail.open {
  transform: translateX(0);
}
body.im-detail-open .im-chat-panel {
  right: var(--im-detail-w, 420px) !important;
}
body.im-detail-open .im-chat-header {
  right: var(--im-detail-w, 420px) !important;
}
body.im-detail-open #reply-control {
  right: var(--im-detail-w, 420px) !important;
}

.im-detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--im-border);
  flex-shrink: 0;
  background: var(--im-bg-2);
}
.im-detail-author {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.im-detail-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--im-bg-3);
}
.im-detail-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.im-detail-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.im-detail-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--im-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.im-detail-time {
  font-size: 12px;
  color: var(--im-text-3);
}
.im-detail-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--im-text-2);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}
.im-detail-close:hover {
  background: var(--im-bg-3);
  color: var(--im-text-1);
}
.im-detail-close svg {
  width: 16px;
  height: 16px;
}

.im-detail-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
}

.im-detail-content {
  padding: 16px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--im-text-1);
  word-break: break-word;
}
.im-detail-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  cursor: zoom-in;
}
.im-detail-content p {
  margin: 0 0 12px;
}
.im-detail-content p:last-child {
  margin-bottom: 0;
}
.im-detail-content pre {
  background: var(--im-bg-3);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
}
.im-detail-content code {
  background: var(--im-bg-3);
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
}
.im-detail-content blockquote {
  margin: 8px 0;
  padding: 8px 12px;
  border-left: 3px solid var(--im-border);
  color: var(--im-text-2);
  background: var(--im-bg-2);
  border-radius: 0 6px 6px 0;
}
.im-detail-content a {
  color: var(--im-blue);
  text-decoration: none;
}
.im-detail-content a:hover {
  text-decoration: underline;
}
.im-detail-content ul, .im-detail-content ol {
  padding-left: 20px;
  margin: 8px 0;
}
.im-detail-content h1, .im-detail-content h2, .im-detail-content h3 {
  margin: 16px 0 8px;
  font-weight: 600;
}

.im-detail-boosts {
  padding: 0 16px 12px;
}

.im-detail-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border-top: 1px solid var(--im-border);
  border-bottom: 1px solid var(--im-border);
  background: var(--im-bg-2);
  flex-shrink: 0;
}
.im-detail-act {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  color: var(--im-text-2);
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
.im-detail-act:hover {
  background: var(--im-bg-3);
  color: var(--im-text-1);
}
.im-detail-act svg {
  width: 18px;
  height: 18px;
}
.im-detail-act.liked {
  color: #F2495C;
}
.im-detail-act.liked svg {
  fill: #F2495C;
}
.im-detail-act.bookmarked {
  color: var(--im-blue);
}
.im-detail-act.cannot-undo {
  opacity: 0.6;
  cursor: not-allowed;
}

.im-detail-replies {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.im-detail-reply-head {
  padding: 10px 16px;
  border-top: 1px solid var(--im-border);
  border-bottom: 1px solid var(--im-border);
  background: var(--im-bg-2);
  flex-shrink: 0;
}
.im-detail-reply-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--im-text-2);
}
.im-detail-reply-list {
  padding: 4px 0;
}
.im-detail-reply-item {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.15s;
}
.im-detail-reply-item:hover {
  background: var(--im-bg-2);
}
.im-detail-reply-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
}
.im-detail-reply-avatar img,
.im-detail-reply-avatar span {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  object-fit: cover;
  border-radius: 50%;
}
.im-detail-reply-body {
  flex: 1;
  min-width: 0;
}
.im-detail-reply-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}
.im-detail-reply-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--im-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}
.im-detail-reply-num {
  font-size: 11px;
  color: var(--im-text-3);
  flex-shrink: 0;
}
.im-detail-reply-text {
  font-size: 12px;
  color: var(--im-text-2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.im-detail-reply-main {
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: flex-start;
}
.im-detail-reply-main .im-detail-reply-body {
  flex: 1;
  min-width: 0;
}

/* 嵌套子回复：左侧竖线 + 缩进 */
.im-detail-reply-children {
  margin-left: 18px;
  padding-left: 10px;
  border-left: 2px solid var(--im-border);
  margin-top: 4px;
}
.im-detail-reply-children .im-detail-reply-item {
  padding: 6px 0 6px 8px;
}
.im-detail-reply-children .im-detail-reply-item:hover {
  background: var(--im-bg-2);
  border-radius: 4px;
}

/* 展开/折叠子回复按钮 */
.im-detail-reply-expand {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  margin: 2px 0 4px 36px;
  border: none;
  background: transparent;
  color: var(--im-blue);
  font-size: 11px;
  cursor: pointer;
  border-radius: 4px;
  font-family: var(--im-font);
}
.im-detail-reply-expand:hover {
  background: var(--im-blue-soft);
}
.im-detail-empty {
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--im-text-3);
}

.im-detail-resizer {
  position: absolute;
  left: -3px;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
  z-index: 2;
  transition: background 0.15s;
}
.im-detail-resizer:hover,
.im-detail-resizer.dragging {
  background: var(--im-blue);
  opacity: 0.3;
}

/* 气泡楼层号：点击打开详情面板 */
.im-msg-floor {
  cursor: pointer;
  transition: color 0.15s;
}
.im-msg-floor:hover {
  color: var(--im-blue);
}

/* 「查看对话」按钮 */
.im-detail-thread-btn {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: var(--im-text-3);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0;
  transition: all 0.15s;
  align-self: center;
}
.im-detail-reply-item:hover .im-detail-thread-btn {
  opacity: 1;
}
.im-detail-thread-btn:hover {
  background: var(--im-bg-3);
  color: var(--im-blue);
}
.im-detail-thread-btn svg {
  width: 14px;
  height: 14px;
}

/* 线程视图 */
.im-detail-thread {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.im-detail-thread-back {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 16px;
  border: none;
  border-bottom: 1px solid var(--im-border);
  background: var(--im-bg-2);
  cursor: pointer;
  font-size: 12px;
  color: var(--im-text-2);
  font-family: var(--im-font);
  flex-shrink: 0;
}
.im-detail-thread-back:hover {
  color: var(--im-blue);
  background: var(--im-bg-3);
}
.im-detail-thread-back-icon {
  font-size: 14px;
}

/* 两人对话消息流 */
.im-detail-thread-chain {
  padding: 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}
.im-detail-thread-msg {
  display: flex;
  gap: 8px;
  max-width: 85%;
  cursor: pointer;
  transition: opacity 0.15s;
}
.im-detail-thread-msg:hover {
  opacity: 0.9;
}
.im-detail-thread-msg-left {
  align-self: flex-start;
}
.im-detail-thread-msg-right {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.im-detail-thread-msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
}
.im-detail-thread-msg-avatar img,
.im-detail-thread-msg-avatar span {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  object-fit: cover;
  border-radius: 50%;
}
.im-detail-thread-msg-body {
  min-width: 0;
}
.im-detail-thread-msg-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
  font-size: 11px;
  color: var(--im-text-3);
}
.im-detail-thread-msg-right .im-detail-thread-msg-head {
  justify-content: flex-end;
}
.im-detail-thread-msg-name {
  font-weight: 600;
  color: var(--im-text-2);
}
.im-detail-thread-msg-num {
  flex-shrink: 0;
}
.im-detail-thread-msg-content {
  background: var(--im-bg-2);
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--im-text-1);
  word-break: break-word;
  border: 1px solid var(--im-border);
}
.im-detail-thread-msg-right .im-detail-thread-msg-content {
  background: var(--im-blue-soft);
  border-color: var(--im-blue)33;
}
.im-detail-thread-msg-content img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}
.im-detail-thread-msg-content p {
  margin: 0 0 8px;
}
.im-detail-thread-msg-content p:last-child {
  margin-bottom: 0;
}
.im-detail-thread-msg-content blockquote {
  margin: 6px 0;
  padding: 6px 10px;
  border-left: 3px solid var(--im-border);
  color: var(--im-text-2);
  background: rgba(0,0,0,0.03);
  border-radius: 0 4px 4px 0;
  font-size: 12px;
}
.im-detail-thread-msg-content pre {
  background: var(--im-bg-3);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 11px;
}
.im-detail-thread-msg-content code {
  background: var(--im-bg-3);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 11px;
}
.im-detail-thread-msg-content a {
  color: var(--im-blue);
  text-decoration: none;
}
.im-detail-thread-msg-current .im-detail-thread-msg-content {
  outline: 2px solid var(--im-blue);
  outline-offset: 1px;
}

.im-detail-thread-current {
  display: none;
}
.im-detail-thread-replies-label {
  display: none;
}

/* 头部楼的全部回复列表：完整正文展开 */
.im-detail-thread-reply-full {
  padding: 12px 16px;
  border-bottom: 1px solid var(--im-border);
  align-items: flex-start;
}
.im-detail-thread-reply-full:last-child {
  border-bottom: none;
}
.im-detail-thread-reply-full .im-detail-reply-body {
  margin-right: 8px;
}
.im-detail-reply-content {
  font-size: 13px;
  line-height: 1.6;
  color: var(--im-text-1);
  word-break: break-word;
  margin-top: 4px;
}


/* 楼中楼缩进树样式 */
.im-detail-reply-list.im-detail-reply-threaded {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.im-detail-thread-item {
  position: relative;
}
.im-detail-thread-item-main {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.im-detail-thread-item:hover > .im-detail-thread-item-main {
  background: var(--im-bg-2);
}
.im-detail-thread-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
}
.im-detail-thread-avatar img,
.im-detail-thread-avatar span {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  object-fit: cover;
  border-radius: 50%;
}
.im-detail-thread-body {
  flex: 1;
  min-width: 0;
}
.im-detail-thread-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 11px;
  color: var(--im-text-3);
  flex-wrap: wrap;
}
.im-detail-thread-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--im-text-1);
}
.im-detail-thread-op {
  display: inline-flex;
  align-items: center;
  height: 16px;
  padding: 0 5px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  color: var(--im-blue);
  background: var(--im-blue-soft);
  border: 1px solid var(--im-blue)33;
  flex-shrink: 0;
}
.im-detail-thread-replyto {
  font-size: 11px;
  color: var(--im-text-3);
  flex-shrink: 0;
}
.im-detail-thread-num {
  flex-shrink: 0;
}
.im-detail-thread-time {
  flex-shrink: 0;
  margin-left: auto;
}
.im-detail-thread-content {
  font-size: 14px;
  line-height: 1.65;
  color: var(--im-text-1);
  word-break: break-word;
}
.im-detail-thread-content img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  display: block;
  margin: 6px 0;
}
.im-detail-thread-content p {
  margin: 0 0 0.6em;
}
.im-detail-thread-content p:last-child {
  margin-bottom: 0;
}
.im-detail-thread-content blockquote {
  margin: 6px 0;
  padding: 6px 10px;
  border-left: 3px solid var(--im-border);
  color: var(--im-text-2);
  background: var(--im-bg-2);
  border-radius: 0 4px 4px 0;
  font-size: 13px;
}
.im-detail-thread-content pre {
  background: var(--im-bg-3);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
.im-detail-thread-content code {
  background: var(--im-bg-3);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 12px;
}
.im-detail-thread-content a {
  color: var(--im-blue);
  text-decoration: none;
}
.im-detail-thread-actions {
  display: flex;
  gap: 2px;
  margin-top: 6px;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.im-detail-thread-item:hover .im-detail-thread-actions {
  opacity: 1;
}
.im-detail-thread-action {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--im-text-3);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.im-detail-thread-action:hover {
  background: var(--im-bg-3);
  color: var(--im-text-1);
}
.im-detail-thread-action svg {
  width: 14px;
  height: 14px;
}

/* 子回复缩进 + 左侧连线 + 灰底分组 */
.im-detail-thread-children {
  margin-left: 32px;
  padding-left: 12px;
  border-left: 2px solid var(--im-border);
  background: var(--primary-very-low, #f7f8fa);
}
.im-detail-thread-item[data-depth="3"] > .im-detail-thread-children {
  margin-left: 12px;
}

/* 首末项圆角 */
.im-detail-thread-item > .im-detail-thread-children > .im-detail-thread-item:first-child > .im-detail-thread-item-main {
  padding-top: 8px;
}
.im-detail-thread-item > .im-detail-thread-children > .im-detail-thread-item:last-child > .im-detail-thread-item-main {
  padding-bottom: 8px;
}
.im-detail-thread-item > .im-detail-thread-children > .im-detail-thread-item:only-child > .im-detail-thread-item-main {
  padding-top: 8px;
  padding-bottom: 8px;
}

/* 高亮闪烁 */
.im-detail-thread-item-highlight > .im-detail-thread-item-main {
  background: var(--im-blue-soft) !important;
  animation: thread-highlight-flash 1.2s ease-out;
}
@keyframes thread-highlight-flash {
  0% { box-shadow: inset 3px 0 0 var(--im-blue); }
  100% { box-shadow: inset 3px 0 0 transparent; }
}

/* 子回复计数按钮（在点赞左边） */
.im-detail-thread-reply-count {
  width: auto !important;
  min-width: 36px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--im-text-2);
  background: var(--im-bg-3);
  border-radius: 10px;
}
.im-detail-thread-reply-count:hover {
  color: var(--im-blue);
  background: var(--im-blue-soft);
}
.im-detail-thread-reply-count.open {
  color: var(--im-blue);
  background: var(--im-blue-soft);
}
/* 头部回复数按钮（楼层号 + 时间右边） */
.im-detail-thread-head-replies {
  margin-left: auto;
  padding: 1px 6px;
  height: 18px;
  border: none;
  border-radius: 9px;
  background: var(--im-bg-3);
  color: var(--im-text-2);
  font-size: 11px;
  font-weight: 500;
  font-family: var(--im-font);
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
  transition: all 0.15s;
}
.im-detail-thread-head-replies:hover {
  color: var(--im-blue);
  background: var(--im-blue-soft);
}
.im-detail-thread-head-replies.open {
  color: var(--im-blue);
  background: var(--im-blue-soft);
}
`;
