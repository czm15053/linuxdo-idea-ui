export const CSS_CORE_EXTRA = String.raw`.im-nav2-cat-dot {
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
`
