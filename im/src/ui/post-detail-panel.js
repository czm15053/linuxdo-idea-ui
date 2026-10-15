import { chatState, topicPostsMap } from "../state/chat-state.js";
import { chatHooks } from "./hooks.js";
import { cookedWithQuoteBars } from "./chat-panel.js";
import { ICONS } from "../config/icons.js";
import { escapeHtml } from "../utils/html.js";
import { formatTime } from "./shared/time.js";
import { avatarColor, avatarLetter, userDisplayName, fullAvatarUrl } from "./shared/avatars.js";
import { isMaskAvatar } from "./shared/toggles.js";
import { skinHooks } from "../skins/hooks.js";
import { navigateInApp } from "../bridge/router.js";
import { likedPosts } from "../features/liked-posts.js";
import { DETAIL_PANEL_W_KEY, DETAIL_PANEL_W_MIN, DETAIL_PANEL_W_MAX, DETAIL_PANEL_W_DEFAULT } from "../config/constants.js";

let panelEl = null;
let currentPostNumber = 0;
let threadPostNumber = 0; // 当前线程视图聚焦的楼层（0 = 不在线程视图）

export function ensurePostDetailPanel() {
  if (panelEl) return panelEl;

  panelEl = document.createElement("aside");
  panelEl.id = "linuxdo-post-detail";
  panelEl.className = "linuxdo-post-detail";
  panelEl.setAttribute("role", "dialog");
  panelEl.setAttribute("aria-label", "帖子详情");
  panelEl.innerHTML = `
    <div class="im-detail-header">
      <div class="im-detail-author">
        <span class="im-detail-avatar"></span>
        <div class="im-detail-meta">
          <div class="im-detail-name"></div>
          <div class="im-detail-time"></div>
        </div>
      </div>
      <button type="button" class="im-detail-close" title="关闭">${ICONS.close || "✕"}</button>
    </div>
    <div class="im-detail-body">
      <div class="im-detail-content"></div>
      <div class="im-detail-boosts"></div>
      <div class="im-detail-actions">
        <button class="im-detail-act" data-action="like" title="点赞">${ICONS.heartOutline}</button>
        <button class="im-detail-act" data-action="boost" title="小火箭">${ICONS.rocket}</button>
        <button class="im-detail-act" data-action="reply" title="回复">${ICONS.reply}</button>
        <button class="im-detail-act" data-action="copy-link" title="复制链接">${ICONS.link}</button>
        <button class="im-detail-act" data-action="bookmark" title="收藏">${ICONS.bookmark}</button>
        <button class="im-detail-act" data-action="flag" title="举报">${ICONS.flag}</button>
      </div>
      <div class="im-detail-replies">
        <div class="im-detail-reply-head">
          <span class="im-detail-reply-count">0 条回复</span>
        </div>
        <div class="im-detail-reply-list"></div>
        <div class="im-detail-thread" style="display:none;">
          <button type="button" class="im-detail-thread-back">
            <span class="im-detail-thread-back-icon">←</span>
            <span>返回回复列表</span>
          </button>
          <div class="im-detail-thread-chain"></div>
          <div class="im-detail-thread-current"></div>
          <div class="im-detail-thread-replies-label"></div>
        </div>
      </div>
    </div>
    <div class="im-detail-resizer" title="拖动调整宽度（双击复位）"></div>
  `;

  document.body.appendChild(panelEl);
  bindDetailEvents(panelEl);
  ensureDetailResizer(panelEl);
  applyDetailWidth(getDetailWidth());
  return panelEl;
}

function getDetailWidth() {
  try {
    const w = parseInt(localStorage.getItem(DETAIL_PANEL_W_KEY), 10);
    if (w >= DETAIL_PANEL_W_MIN && w <= DETAIL_PANEL_W_MAX) return w;
  } catch { /* ignore */ }
  return DETAIL_PANEL_W_DEFAULT;
}

function applyDetailWidth(w) {
  const width = Math.min(DETAIL_PANEL_W_MAX, Math.max(DETAIL_PANEL_W_MIN, Math.round(w)));
  document.documentElement.style.setProperty("--im-detail-w", `${width}px`);
}

function ensureDetailResizer(panel) {
  const rz = panel.querySelector(".im-detail-resizer");
  if (!rz || rz._bound) return;
  rz._bound = true;

  let dragging = false;
  let startX = 0;
  let startW = 0;

  rz.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    startW = parseInt(document.documentElement.style.getPropertyValue("--im-detail-w"), 10) || getDetailWidth();
    rz.classList.add("dragging");
    try { rz.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    e.preventDefault();
    e.stopPropagation();
  });

  rz.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    // 面板在右侧，往左拖变宽、往右拖变窄
    applyDetailWidth(startW + startX - e.clientX);
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    rz.classList.remove("dragging");
    const w = parseInt(document.documentElement.style.getPropertyValue("--im-detail-w"), 10);
    if (w) {
      try { localStorage.setItem(DETAIL_PANEL_W_KEY, String(w)); } catch { /* ignore */ }
    }
  };

  rz.addEventListener("pointerup", endDrag);
  rz.addEventListener("pointercancel", endDrag);
  rz.addEventListener("dblclick", () => {
    applyDetailWidth(DETAIL_PANEL_W_DEFAULT);
    try { localStorage.removeItem(DETAIL_PANEL_W_KEY); } catch { /* ignore */ }
  });
}

export function openPostDetail(postNumber) {
  const post = topicPostsMap.get(postNumber);
  if (!post) return;

  const panel = ensurePostDetailPanel();
  currentPostNumber = postNumber;
  threadPostNumber = 0; // 新开详情时重置线程视图
  const displayName = userDisplayName(post, post.username || "?");

  // 头部
  const avatarEl = panel.querySelector(".im-detail-avatar");
  if (isMaskAvatar()) {
    const d = skinHooks.msgAvatar?.(displayName);
    if (d) {
      avatarEl.style.background = d.bg;
      avatarEl.innerHTML = d.html;
    } else {
      avatarEl.style.background = avatarColor(displayName);
      avatarEl.textContent = avatarLetter(displayName);
    }
  } else if (post.avatar_template) {
    avatarEl.style.background = "transparent";
    avatarEl.innerHTML = `<img src="${escapeHtml(fullAvatarUrl(post.avatar_template))}" alt="" loading="lazy">`;
  } else {
    avatarEl.style.background = avatarColor(displayName);
    avatarEl.textContent = avatarLetter(displayName);
  }
  panel.querySelector(".im-detail-name").textContent = displayName;
  panel.querySelector(".im-detail-time").textContent =
    `#${post.post_number} · ${formatTime(post.created_at)}`;

  // 正文：引用条预处理 + 完整 cooked
  const contentEl = panel.querySelector(".im-detail-content");
  contentEl.innerHTML = cookedWithQuoteBars(post);
  contentEl.querySelectorAll("img").forEach((img) => {
    img.loading = "lazy";
  });

  // 小火箭
  const boostEl = panel.querySelector(".im-detail-boosts");
  boostEl.innerHTML = chatHooks.renderBoosts?.(post) || "";

  // 操作栏状态同步
  syncDetailActions(post);

  // 回复
  renderDetailReplies(postNumber);

  // 重置线程视图
  closeThreadView();

  // 显示
  panel.classList.add("open");
  document.body.classList.add("im-detail-open");

  // 增强投票
  chatHooks.enhancePolls?.(panel);
}

function syncDetailActions(post) {
  if (!panelEl) return;
  const actLike = (post.actions_summary || []).find((a) => a.id === 2);
  const isLiked = post.id && (likedPosts.has(post.id) || actLike?.acted);
  const canUndo = actLike ? actLike.can_undo !== false : true;

  const likeBtn = panelEl.querySelector('.im-detail-act[data-action="like"]');
  if (likeBtn) {
    likeBtn.classList.toggle("liked", !!isLiked);
    likeBtn.classList.toggle("cannot-undo", !canUndo);
    likeBtn.innerHTML = isLiked ? ICONS.heartFilled : ICONS.heartOutline;
    likeBtn.title = isLiked
      ? (canUndo ? "已点赞，点击取消" : chatHooks.cantUndoText?.(post.post_number) || "无法撤销")
      : "点赞";
  }

  const bmBtn = panelEl.querySelector('.im-detail-act[data-action="bookmark"]');
  if (bmBtn) {
    bmBtn.classList.toggle("bookmarked", !!post.bookmarked);
    bmBtn.innerHTML = post.bookmarked ? (ICONS.bookmarkFill || ICONS.bookmark) : ICONS.bookmark;
    bmBtn.title = post.bookmarked ? "取消收藏" : "收藏";
  }
}

// 递归收集所有后代回复（嵌套树打平，按楼层号排序）
function collectAllReplies(postNumber) {
  const result = [];
  const stack = [postNumber];
  const seen = new Set();
  while (stack.length) {
    const cur = stack.pop();
    if (seen.has(cur)) continue;
    seen.add(cur);
    const children = getDirectReplies(cur);
    for (const c of children) {
      result.push(c);
      stack.push(c.post_number);
    }
  }
  result.sort((a, b) => a.post_number - b.post_number);
  return result;
}

// 递归渲染回复树：从 parent 的直接回复开始，层层缩进
function renderReplyTree(parentNumber, rootNumber, depth) {
  const children = getDirectReplies(parentNumber);
  if (!children.length) return "";
  const maxDepth = 3; // 超过3层后不再缩进，保持同一层级
  const indent = Math.min(depth, maxDepth);

  return children.map((p) => {
    const name = userDisplayName(p, p.username || "?");
    let avatarHtml = "";
    if (isMaskAvatar()) {
      avatarHtml = `<span style="background:${avatarColor(name)}">${escapeHtml(avatarLetter(name))}</span>`;
    } else if (p.avatar_template) {
      avatarHtml = `<img src="${escapeHtml(fullAvatarUrl(p.avatar_template))}" alt="" loading="lazy">`;
    } else {
      avatarHtml = `<span style="background:${avatarColor(name)}">${escapeHtml(avatarLetter(name))}</span>`;
    }

    const opLabel = p.post_number === 1 ? `<span class="im-detail-thread-op">楼主</span>` : "";

    // 被回复的人
    let replyToLabel = "";
    const replyToNum = Number(p.reply_to_post_number) || 0;
    if (replyToNum && replyToNum !== Number(rootNumber)) {
      const target = topicPostsMap.get(replyToNum);
      if (target) {
        const targetName = userDisplayName(target, target.username || "?");
        replyToLabel = `<span class="im-detail-thread-replyto">回复 ${escapeHtml(targetName)}</span>`;
      }
    }

    const childrenCount = getDirectReplies(p.post_number).length;
    const grandchildren = childrenCount ? renderReplyTree(p.post_number, rootNumber, depth + 1) : "";
    const hasChildren = childrenCount > 0;

    return `
      <div class="im-detail-thread-item" data-post-number="${p.post_number}" data-depth="${indent}" style="--indent: ${indent}">
        <div class="im-detail-thread-item-main">
          <span class="im-detail-thread-avatar">${avatarHtml}</span>
          <div class="im-detail-thread-body">
            <div class="im-detail-thread-head">
              <span class="im-detail-thread-name">${escapeHtml(name)}</span>
              ${opLabel}
              ${replyToLabel}
              <span class="im-detail-thread-num">#${p.post_number}</span>
              <span class="im-detail-thread-time">${escapeHtml(formatTime(p.created_at))}</span>
              ${hasChildren ? `<button class="im-detail-thread-head-replies" data-action="toggle-children" title="展开/收起回复">${childrenCount} 回复</button>` : ""}
            </div>
            <div class="im-detail-thread-content">${cookedWithQuoteBars(p)}</div>
            <div class="im-detail-thread-actions">
              <button class="im-detail-thread-action" data-action="like" title="点赞">${ICONS.heartOutline}</button>
              <button class="im-detail-thread-action" data-action="reply" title="回复">${ICONS.reply}</button>
              <button class="im-detail-thread-action" data-action="thread" title="查看对话">${ICONS.chat || "💬"}</button>
            </div>
          </div>
        </div>
        ${hasChildren ? `<div class="im-detail-thread-children">${grandchildren}</div>` : ""}
      </div>`;
  }).join("");
}

function renderDetailReplies(postNumber) {
  if (!panelEl) return;
  const root = Number(postNumber);
  const allReplies = collectAllReplies(root);

  const countEl = panelEl.querySelector(".im-detail-reply-count");
  countEl.textContent = `${allReplies.length} 条回复`;

  const listEl = panelEl.querySelector(".im-detail-reply-list");
  if (!allReplies.length) {
    listEl.innerHTML = '<div class="im-detail-empty">暂无回复</div>';
    listEl.classList.remove("im-detail-reply-threaded");
    return;
  }

  listEl.classList.add("im-detail-reply-threaded");
  listEl.classList.remove("im-detail-reply-timeline");

  // 只渲染直接回复，孙子及以下递归渲染
  listEl.innerHTML = renderReplyTree(root, root, 0);
}

function getDirectReplies(postNumber) {
  const n = Number(postNumber);
  const result = [];
  for (const [, p] of topicPostsMap) {
    if (Number(p.reply_to_post_number) === n) result.push(p);
  }
  result.sort((a, b) => a.post_number - b.post_number);
  return result;
}

// 向上追溯回复链：从 postNumber 一路追溯到楼主（或到没有 reply_to 的楼）
function getReplyChain(postNumber) {
  const chain = [];
  let cur = Number(postNumber);
  const seen = new Set();
  while (cur > 0 && !seen.has(cur)) {
    seen.add(cur);
    const p = topicPostsMap.get(cur);
    if (!p) break;
    chain.unshift(p);
    cur = Number(p.reply_to_post_number) || 0;
  }
  return chain;
}

function normUsername(u) {
  return String(u || "").trim().toLowerCase();
}

// 提取两人对话线程：当前楼作者 + 其回复对象，两人之间所有互相回复的楼
function getTwoPersonThread(postNumber) {
  const start = topicPostsMap.get(postNumber);
  if (!start) return [];
  const me = normUsername(start.username);
  if (!me) return [start];

  // 找对方：向上追溯最近的不同用户
  let other = "";
  const chain = getReplyChain(postNumber);
  for (let i = chain.length - 2; i >= 0; i--) {
    const u = normUsername(chain[i].username);
    if (u && u !== me) { other = u; break; }
  }
  if (!other) return [start];

  const allPosts = [...topicPostsMap.values()];
  allPosts.sort((a, b) => a.post_number - b.post_number);

  // 先找出所有「严格对答」的楼（A 回复 B 或 B 回复 A），确定对话的时间范围
  const strictReply = new Set();
  let minPost = Infinity;
  let maxPost = 0;
  for (const p of allPosts) {
    const u = normUsername(p.username);
    if (u !== me && u !== other) continue;
    const replyTo = Number(p.reply_to_post_number) || 0;
    if (!replyTo) continue;
    const target = topicPostsMap.get(replyTo);
    if (!target) continue;
    const targetUser = normUsername(target.username);
    // A 回复 B 或 B 回复 A
    if ((u === me && targetUser === other) || (u === other && targetUser === me)) {
      strictReply.add(p.post_number);
      strictReply.add(replyTo);
      minPost = Math.min(minPost, p.post_number, replyTo);
      maxPost = Math.max(maxPost, p.post_number, replyTo);
    }
  }

  if (strictReply.size === 0) return [start];

  // 再扫一遍：时间范围内、作者是两人之一的楼，全部纳入（放宽条件，含无 reply_to 的）
  const thread = [];
  const seen = new Set();
  for (const p of allPosts) {
    if (Number(p.post_number) < minPost || Number(p.post_number) > maxPost) continue;
    const u = normUsername(p.username);
    if (u !== me && u !== other) continue;
    // 如果有 reply_to 且回复的是第三者，排除（明显是对别人说话）
    const replyTo = Number(p.reply_to_post_number) || 0;
    if (replyTo) {
      const target = topicPostsMap.get(replyTo);
      if (target) {
        const targetUser = normUsername(target.username);
        if (targetUser !== me && targetUser !== other && targetUser !== u) continue;
      }
    }
    if (seen.has(p.post_number)) continue;
    thread.push(p);
    seen.add(p.post_number);
  }

  // 确保当前楼在线程里
  if (!seen.has(start.post_number)) {
    thread.push(start);
    thread.sort((a, b) => a.post_number - b.post_number);
  }

  return thread;
}

function miniAvatarHtml(p) {
  const name = userDisplayName(p, p.username || "?");
  if (isMaskAvatar()) {
    const bg = avatarColor(name);
    return `<span style="background:${bg}">${escapeHtml(avatarLetter(name))}</span>`;
  }
  if (p.avatar_template) {
    return `<img src="${escapeHtml(fullAvatarUrl(p.avatar_template))}" alt="" loading="lazy">`;
  }
  return `<span style="background:${avatarColor(name)}">${escapeHtml(avatarLetter(name))}</span>`;
}

function openThreadView(postNumber) {
  if (!panelEl) return;
  const post = topicPostsMap.get(postNumber);
  if (!post) return;

  threadPostNumber = Number(postNumber);
  panelEl.dataset.threadPost = String(threadPostNumber);

  // 隐藏回复列表，显示线程视图
  panelEl.querySelector(".im-detail-reply-list").style.display = "none";
  const threadEl = panelEl.querySelector(".im-detail-thread");
  threadEl.style.display = "";

  const chainEl = panelEl.querySelector(".im-detail-thread-chain");
  const curEl = panelEl.querySelector(".im-detail-thread-current");
  const labelEl = panelEl.querySelector(".im-detail-thread-replies-label");
  curEl.style.display = "none";
  labelEl.style.display = "none";

  const backBtn = panelEl.querySelector(".im-detail-thread-back span:last-child");
  const isHead = !post.reply_to_post_number || Number(post.post_number) === 1;

  if (isHead) {
    // 头部楼：展示所有直接回复（多人）
    const replies = getDirectReplies(postNumber);
    if (backBtn) backBtn.textContent = `${replies.length} 条回复`;
    chainEl.style.display = "";
    if (!replies.length) {
      chainEl.innerHTML = `<div class="im-detail-empty">暂无回复</div>`;
      return;
    }
    chainEl.innerHTML = replies.map((p) => {
      const name = userDisplayName(p, p.username || "?");
      const isCurrent = Number(p.post_number) === Number(postNumber);
      return `
        <div class="im-detail-reply-item im-detail-thread-reply-full" data-post-number="${p.post_number}">
          <span class="im-detail-reply-avatar">${miniAvatarHtml(p)}</span>
          <div class="im-detail-reply-body">
            <div class="im-detail-reply-head">
              <span class="im-detail-reply-name">${escapeHtml(name)}</span>
              <span class="im-detail-reply-num">#${p.post_number}</span>
            </div>
            <div class="im-detail-reply-content${isCurrent ? " current" : ""}">${cookedWithQuoteBars(p)}</div>
          </div>
          <button type="button" class="im-detail-thread-btn" title="查看对话">${ICONS.reply || "💬"}</button>
        </div>`;
    }).join("");
  } else {
    // 非头部楼：两人对话模式
    const thread = getTwoPersonThread(postNumber);
    const me = normUsername(post.username);
    let otherName = "";
    for (const p of thread) {
      const u = normUsername(p.username);
      if (u && u !== me) {
        otherName = userDisplayName(p, p.username || "?");
        break;
      }
    }
    const myName = userDisplayName(post, post.username || "?");
    if (backBtn) backBtn.textContent = otherName ? `${myName} 与 ${otherName}` : "对话";

    if (thread.length <= 1) {
      chainEl.style.display = "";
      chainEl.innerHTML = `<div class="im-detail-empty">暂无多轮对话</div>`;
      return;
    }

    chainEl.style.display = "";
    chainEl.innerHTML = thread.map((p) => {
      const name = userDisplayName(p, p.username || "?");
      const isCurrent = Number(p.post_number) === Number(postNumber);
      const side = normUsername(p.username) === me ? "right" : "left";
      return `
        <div class="im-detail-thread-msg im-detail-thread-msg-${side}${isCurrent ? " im-detail-thread-msg-current" : ""}" data-post-number="${p.post_number}">
          <span class="im-detail-thread-msg-avatar">${miniAvatarHtml(p)}</span>
          <div class="im-detail-thread-msg-body">
            <div class="im-detail-thread-msg-head">
              <span class="im-detail-thread-msg-name">${escapeHtml(name)}</span>
              <span class="im-detail-thread-msg-num">#${p.post_number}</span>
            </div>
            <div class="im-detail-thread-msg-content">${cookedWithQuoteBars(p)}</div>
          </div>
        </div>`;
    }).join("");
  }
}

function closeThreadView() {
  if (!panelEl) return;
  threadPostNumber = 0;
  delete panelEl.dataset.threadPost;
  panelEl.querySelector(".im-detail-thread").style.display = "none";
}

export function closePostDetail() {
  if (!panelEl) return;
  panelEl.classList.remove("open");
  document.body.classList.remove("im-detail-open");
  currentPostNumber = 0;
}

function bindDetailEvents(panel) {
  // 关闭
  panel.querySelector(".im-detail-close").addEventListener("click", (e) => {
    e.stopPropagation();
    closePostDetail();
  });

  // ESC 关闭
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) {
      closePostDetail();
    }
  });

  // 操作栏事件委托
  panel.querySelector(".im-detail-actions").addEventListener("click", (e) => {
    const btn = e.target.closest(".im-detail-act");
    if (!btn) return;
    e.stopPropagation();
    const action = btn.dataset.action;
    const post = topicPostsMap.get(currentPostNumber);
    if (!post) return;

    if (action === "like") {
      chatHooks.toggleLike?.(post.id, btn);
      // 乐观同步：延迟等接口返回后再从 chat 区同步状态
      setTimeout(() => syncDetailFromChat(), 500);
    } else if (action === "boost") {
      chatHooks.openBoostComposer?.(post.id, post.post_number, panel);
    } else if (action === "reply") {
      chatHooks.replyToPost?.(post.post_number);
    } else if (action === "copy-link") {
      const url = `${location.origin}/t/${chatState.topicId}/${post.post_number}`;
      navigator.clipboard?.writeText(url).catch(() => {});
      chatHooks.toast?.("链接已复制", btn);
    } else if (action === "bookmark") {
      // 通过 chatHooks 或直接调用 interactions
      chatHooks.toggleBookmark?.(post.id, btn);
      setTimeout(() => syncDetailFromChat(), 500);
    } else if (action === "flag") {
      // 复用原生举报，触发 chat 区对应按钮
      const nativeBtn = document.querySelector(`.im-msg[data-post-number="${post.post_number}"] .im-msg-tool[data-action="flag"]`);
      nativeBtn?.click();
    }
  });

  // 楼中楼回复：点击消息跳转，点操作按钮执行动作
  panel.querySelector(".im-detail-reply-list").addEventListener("click", (e) => {
    const actionBtn = e.target.closest(".im-detail-thread-action");
    const item = e.target.closest(".im-detail-thread-item");
    if (!item) return;
    const num = Number(item.dataset.postNumber);
    if (!num) return;
    const post = topicPostsMap.get(num);

    // 点操作按钮
    if (actionBtn) {
      e.stopPropagation();
      const action = actionBtn.dataset.action;
      if (action === "toggle-children") {
        const children = item.querySelector(":scope > .im-detail-thread-children");
        if (children) {
          const open = children.style.display !== "none";
          children.style.display = open ? "none" : "";
          actionBtn.classList.toggle("open", !open);
        }
        return;
      }
      if (action === "like" && post) {
        chatHooks.toggleLike?.(post.id, actionBtn);
      } else if (action === "reply") {
        chatHooks.replyToPost?.(num);
      } else if (action === "thread") {
        openThreadView(num);
      }
      return;
    }

    // 点消息本身 → 跳转到聊天区
    e.stopPropagation();
    chatHooks.jumpToPost?.(num);
  });

  // 线程视图：返回按钮
  panel.querySelector(".im-detail-thread-back").addEventListener("click", (e) => {
    e.stopPropagation();
    closeThreadView();
  });

  // 线程视图：对话消息 / 回复条目点击 → 跳转或查看对话
  panel.querySelector(".im-detail-thread-chain").addEventListener("click", (e) => {
    const threadBtn = e.target.closest(".im-detail-thread-btn");
    const msg = e.target.closest(".im-detail-thread-msg, .im-detail-thread-reply-full");
    if (!msg) return;
    const num = Number(msg.dataset.postNumber);
    if (!num) return;
    e.stopPropagation();
    if (threadBtn) {
      openThreadView(num);
    } else {
      chatHooks.jumpToPost?.(num);
    }
  });

  // 正文中的链接点击：站内链接走应用内导航
  panel.querySelector(".im-detail-content").addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.startsWith("/") && !href.startsWith("//")) {
      e.preventDefault();
      e.stopPropagation();
      navigateInApp(href);
      closePostDetail();
    }
  });
}

// 从聊天区气泡同步点赞/收藏状态（操作后双向同步）
function syncDetailFromChat() {
  if (!currentPostNumber || !panelEl) return;
  const chatMsg = document.querySelector(`.im-msg[data-post-number="${currentPostNumber}"]`);
  if (!chatMsg) return;

  const post = topicPostsMap.get(currentPostNumber);
  if (post) {
    // 从 chat 区 DOM 读最新状态
    const likeBtn = chatMsg.querySelector('.im-msg-tool[data-action="like"]');
    if (likeBtn) {
      const liked = likeBtn.classList.contains("liked");
      const actLike = (post.actions_summary || []).find((a) => a.id === 2);
      if (actLike) actLike.acted = liked;
      if (post.id) {
        if (liked) likedPosts.add(post.id);
        else likedPosts.delete(post.id);
      }
    }
    post.bookmarked = chatMsg.dataset.bookmarked === "1";
    syncDetailActions(post);
  }
}

// 暴露给 chat-panel：气泡操作后刷新详情面板状态
export function refreshDetailIfOpen(postNumber) {
  if (!panelEl || !panelEl.classList.contains("open")) return;
  if (Number(postNumber) !== currentPostNumber) return;
  const post = topicPostsMap.get(postNumber);
  if (post) syncDetailActions(post);
}

// chatHooks 自注册
Object.assign(chatHooks, {
  openPostDetail,
  closePostDetail,
  refreshDetailIfOpen,
});
