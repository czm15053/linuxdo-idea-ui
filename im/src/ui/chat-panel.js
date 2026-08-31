import { chatState, topicPostsMap } from "../state/chat-state.js";
import { LAST_READ_KEY, LAST_READ_MAX_TOPICS } from "../config/constants.js";
import { ICONS } from "../config/icons.js";
import { EDITOR_ICONS } from "../config/icons-editor.js";
import { escapeHtml, stripHtml } from "../utils/html.js";
import { debounce } from "../utils/dom.js";
import { api } from "../bridge/api.js";
import { getCurrentUsername, isMyPost, normalizeUsername } from "../bridge/user.js";
import { topicIdFromPath, postNumberFromPath, navigateInApp } from "../bridge/router.js";
import { setViewMode } from "../state/view-state.js";
import { loadCategories, categoryById } from "../bridge/categories.js";
import { skinHooks } from "../skins/hooks.js";
import { SKIN_ID, SKINS } from "../config/skins.js";
import { chatHooks } from "./hooks.js";
import { likedPosts } from "../features/liked-posts.js";
import { formatTime, formatClock } from "./shared/time.js";
import { avatarColor, avatarLetter, userDisplayName, fullAvatarUrl, convDisplayTitle } from "./shared/avatars.js";
import { isMaskAvatar } from "./shared/toggles.js";
import { syncListActive } from "./list-panel.js";
import { showUserCard } from "./user-card.js";

export function extractTextSnippet(html, maxLen = 60) {
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
export function ensureChatPanel() {
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
    chatHooks.wireComposer?.(panel);
    return panel;
  }
  panel = document.createElement("div");
  panel.className = "im-chat-panel";
  panel.dataset.empty = "1";
  panel.dataset.composeBound = "1";
  // 快捷输入框工具条：按钮集合/顺序/图标对齐 linux.do 原生编辑器工具栏（额外保留删除线、拆分两种列表）
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
  const toolsHtml = toolKeys.map((k) =>
    `<button type="button" class="im-icon-btn" data-tool="${k}" title="${toolTitles[k]}">${EDITOR_ICONS[k]}</button>`
  ).join("");
  // 头部右侧只保留真实功能钮（回到顶部/刷新/原生视图）；
  // .im-chat-tools 保留为空占位，margin-left:auto 仍负责把 actions 推到最右
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
  chatHooks.wireComposer?.(panel);
  return panel;
}

// 图片点击统一拦截：document capture 阶段截获，杜绝原生 <a> 跳转 / Discourse 灯箱抢先，
// 一律进自家沉浸浮窗（features/lightbox.js，经 chatHooks.openImageModal）
document.addEventListener("click", (e) => {
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
  const highResSrc = (link && link.href) ||
    (clickedImg && (clickedImg.dataset.origSrc || clickedImg.dataset.largeUrl || clickedImg.src)) ||
    (clickedLightbox && clickedLightbox.querySelector("a.lightbox")?.href);
  if (!highResSrc) return;
  e.preventDefault();
  e.stopPropagation();
  if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
  chatHooks.openImageModal(highResSrc, clickedImg);
}, true);

function bindChatPanelEvents(panel) {
  panel.addEventListener("click", (e) => {
    // 头部楼层数：点击弹出「选择楼层」
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
    // 聊天头分类 chip：站内软跳转
    const chipLink = e.target.closest("a.im-chat-chip");
    if (chipLink && panel.contains(chipLink)) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      navigateInApp(chipLink.getAttribute("href"));
      return;
    }
    // 头像 / 昵称 / @提及 → 用户卡片（飞书式弹卡）
    const ucardHit = e.target.closest(".im-msg-avatar, .im-msg-name, .im-chat-avatar, a.mention, a[href^='/u/']");
    if (ucardHit && panel.contains(ucardHit)) {
      const hitName =
        ucardHit.dataset.username ||
        ucardHit.closest(".im-msg")?.dataset.username ||
        (ucardHit.getAttribute("href") || "").match(/^\/u\/([^/]+)/)?.[1] ||
        "";
      if (hitName) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        showUserCard(decodeURIComponent(hitName), ucardHit);
        return;
      }
    }
    // 消息气泡内引用链接：站内软跳转并记录返回点
    const quoteLink = e.target.closest("a[href^='/t/']");
    if (quoteLink && panel.contains(quoteLink)) {
      const href = quoteLink.getAttribute("href") || "";
      const sameTopic = href.startsWith(`/t/${chatState.topicId}/`) || href === `/t/${chatState.topicId}`;
      const anchorMatch = href.match(/#?post-(\d+)$/);
      const targetPostNumber = anchorMatch ? Number(anchorMatch[1]) : null;
      if (sameTopic && targetPostNumber) {
        e.preventDefault();
        e.stopPropagation();
        const msg = quoteLink.closest(".im-msg");
        const sourcePostNumber = msg ? Number(msg.dataset.postNumber) : null;
        const body = panel.querySelector(".im-chat-body");
        const sourceScrollTop = body ? body.scrollTop : 0;
        if (scrollChatToPost(body, targetPostNumber, true)) {
          chatHooks.pushQuoteJump(sourcePostNumber, sourceScrollTop);
        }
        return;
      }
    }
    // 返回原处按钮
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
    // 点击钉钉式引用回复卡片
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
    // 点击点赞徽章
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
    } else if (toolBtn.dataset.action === "bookmark") {
      e.preventDefault();
      e.stopPropagation();
      chatHooks.toggleBookmark?.(Number(msg.dataset.postId), toolBtn);
    } else if (NATIVE_ACTION_SEL[toolBtn.dataset.action]) {
      // 回应摘要 / 复制链接 / 书签 / 举报：转发点击到原生楼层按钮，行为与原站一致
      e.preventDefault();
      e.stopPropagation();
      clickNativePostAction(Number(msg.dataset.postNumber), toolBtn.dataset.action, toolBtn);
    }
  });
  panel.addEventListener("click", (e) => {
    // 小火箭胶囊 hover 显示删除，点击删除
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
        // 点击胶囊本身也打开输入条
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
export function renderChatEmpty() {
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
  if (count) { count.style.display = "none"; count.textContent = ""; }
  const metrics = document.querySelector(".im-chat-metrics");
  if (metrics) { metrics.style.display = "none"; metrics.textContent = ""; }
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
let chatRealtimeBound = false;

async function fetchLatestNewPosts(topicId) {
  if (!topicId || chatState.topicId !== topicId || inFlightNewPostsFetch) return;
  const body = document.querySelector(".im-chat-body");
  if (!body || body.querySelector(".im-chat-loading")) return;

  inFlightNewPostsFetch = true;
  try {
    const data = await api(`/t/${topicId}/last.json?track_visit=false`);
    if (chatState.topicId !== topicId) return;

    const posts = (data.post_stream && data.post_stream.posts) || [];
    const stream = (data.post_stream && data.post_stream.stream) || posts.map((p) => p.id);
    if (stream.length) chatState.stream = stream;

    const newPosts = posts.filter((p) => {
      return p.post_number > chatState.renderedLastNumber && !body.querySelector(`.im-msg[data-post-number="${p.post_number}"]`);
    });

    if (newPosts.length) {
      const isNearBottom = (body.scrollHeight - body.scrollTop - body.clientHeight) < 180;
      const myName = getCurrentUsername();

      body.insertAdjacentHTML("beforeend", renderBubbles(newPosts, myName));
      chatHooks.enhancePolls?.(body);

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
    // 忽略临时网络波动
  } finally {
    inFlightNewPostsFetch = false;
  }
}
export function subscribeTopicRealtime(topicId) {
  const channel = topicId ? `/topic/${topicId}` : null;
  if (channel === currentSubscribedTopicChannel) return; // 同频道不重订阅，避免打断在途长轮询
  if (currentSubscribedTopicChannel && window.MessageBus) {
    try {
      window.MessageBus.unsubscribe(currentSubscribedTopicChannel);
    } catch {}
    currentSubscribedTopicChannel = null;
  }
  if (channel && window.MessageBus) {
    currentSubscribedTopicChannel = channel;
    try {
      window.MessageBus.subscribe(channel, () => {
        if (chatState.topicId === topicId) {
          fetchLatestNewPosts(topicId);
        }
      });
    } catch {}
  }
}
export function startRealtimeChatPolling() {
  if (chatRealtimeBound) return;
  chatRealtimeBound = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && chatState.topicId && !chatState.loading) {
      fetchLatestNewPosts(chatState.topicId);
    }
  });
}
/** Discourse 原生引用块（<aside class="quote" data-username data-post>）→ IM 引用条。
 *  「回复谁」的可靠信号在 cooked 里：点「回复」按钮的帖子服务端都会在正文内嵌
 *  aside.quote（带用户名与楼层号），不依赖 reply_to_post_number 字段。
 *  已由 reply_to_post_number 渲染过引用条的气泡，删除原生块去重；嵌套引用不动。 */
function cookedWithQuoteBars(post) {
  const cooked = post.cooked || "";
  if (!/<aside[\s>][^>]*class="[^"]*\bquote\b/.test(cooked)) return cooked;
  try {
    const doc = new DOMParser().parseFromString(cooked, "text/html");
    let changed = false;
    for (const aside of [...doc.body.querySelectorAll("aside.quote")]) {
      if (aside.closest("blockquote")) continue; // 嵌套在引用内的保留原样
      if (post.reply_to_post_number) {
        aside.remove(); // 气泡顶部已有引用条，内容重复
      } else {
        const bar = doc.createElement("div");
        bar.className = "im-quote-reply";
        const postNo = Number(aside.dataset.post || 0);
        if (postNo) bar.dataset.jumpPost = String(postNo);
        const name = String(aside.dataset.username ||
          (aside.querySelector(".title")?.textContent || "").replace(/[:：]\s*$/, "").trim() || "引用");
        const text = extractTextSnippet(aside.querySelector("blockquote")?.innerHTML || "", 60) || "点击查看引用内容";
        bar.innerHTML = `<div class="im-quote-name"></div><div class="im-quote-text"></div>`;
        bar.firstChild.textContent = `${name}:`;
        bar.lastChild.textContent = text;
        aside.replaceWith(bar);
      }
      changed = true;
    }
    return changed ? doc.body.innerHTML : cooked;
  } catch {
    return cooked;
  }
}
/** 原生楼层操作按钮（复制链接/举报）→ #post_N 内的对应选择器；书签改走直连 API */
const NATIVE_ACTION_SEL = {
  "copy-link": ".post-action-menu__copy-link",
  "flag": ".post-action-menu__flag"
};

function clickNativePostAction(postNumber, action, trigger) {
  const root = document.querySelector(`#post_${postNumber}`);
  if (!root) {
    chatHooks.toast?.("原生楼层未加载，请先滚到该楼层", trigger);
    return;
  }
  let btn = root.querySelector(NATIVE_ACTION_SEL[action]);
  if (!btn) {
    root.querySelector(".show-more-actions")?.click(); // 折叠态先展开「…」
    btn = root.querySelector(NATIVE_ACTION_SEL[action]);
  }
  if (btn) {
    btn.click();
    return;
  }
  chatHooks.toast?.("该楼层不支持此操作", trigger);
}
function bubbleHtml(post, myName) {
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
      snippet = post.reply_to_quote || `回复了 #${post.reply_to_post_number} 楼的内容`;
    } else {
      targetName = `#${post.reply_to_post_number} 楼`;
      snippet = post.reply_to_quote || "点击跳转查看原帖";
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
    const d = skinHooks.msgAvatar?.(displayName);
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
  const likeCount = actLike && actLike.count ? Number(actLike.count) : (post.reaction_users_count || 0);
  const showBadge = likeCount > 0 || isLiked;
  const likeTooltip = isLiked
    ? (canUndo ? "已点赞，点击取消" : chatHooks.cantUndoText(post.post_number))
    : "点赞";
  const badgeHtml = `
    <span class="im-like-badge${liked}${!canUndo ? " cannot-undo" : ""}" data-post-id="${post.id || ''}" data-post-number="${post.post_number}" data-can-undo="${canUndo ? "1" : "0"}" data-likes="${likeCount}" title="${likeTooltip}" style="${showBadge ? '' : 'display:none;'}">
      <span class="im-like-icon">${isLiked ? ICONS.heartFilled : ICONS.heartOutline}</span>
      <span class="im-like-count">${likeCount > 0 ? likeCount : ''}</span>
    </span>`;

  const boostBar = chatHooks.renderBoosts?.(post) || "";
  return `
    <div class="im-msg im-msg-${side}" data-post-number="${post.post_number}"${post.id ? ` data-post-id="${post.id}"` : ""}${me ? ' data-mine="1"' : ""} data-username="${escapeHtml(post.username || "")}" data-bookmarked="${post.bookmarked ? "1" : "0"}">
      <span class="im-msg-avatar" style="background:${avatarBg}">${avatar}</span>
      <div class="im-msg-content">
        <span class="im-msg-name">${escapeHtml(displayName)}</span>
        <div class="im-msg-bubble">
          ${quoteHtml}
          ${cookedWithQuoteBars(post)}
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
          <button class="im-msg-tool" data-action="copy-link" title="复制链接">${ICONS.link}</button>
          <button class="im-msg-tool${post.bookmarked ? " bookmarked" : ""}" data-action="bookmark" title="${post.bookmarked ? "取消收藏" : "收藏"}">${post.bookmarked ? (ICONS.bookmarkFill || ICONS.bookmark) : ICONS.bookmark}</button>
          <button class="im-msg-tool" data-action="flag" title="举报">${ICONS.flag}</button>
        </div>
      </div>
    </div>`;
}

const TIME_SEP_GAP = 10 * 60 * 1000;


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
  } catch { /* ignore quota */ }
}
function getRememberedPost(topicId) {
  return Number(readLastReadMap()[topicId]) || 0;
}
export function scrollChatToPost(body, postNumber, highlight = false) {
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
  // 头部楼层数：当前位置 / 总楼数（点击弹出选择楼层）
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
/** 详情页主标题：跟随匿名伪装开关（与列表 convDisplayTitle 同源，仅展示层） */
function displayTitle() {
  return convDisplayTitle({ id: chatState.topicId, title: chatState.title });
}
/** 重涂头部标题 chrome：主标题/浏览器标签页/输入框占位；伪装开关切换后复用 */
function paintChatHeaderChrome() {
  const t = displayTitle();
  const titleEl = document.querySelector(".im-chat-title");
  if (titleEl) titleEl.textContent = t;
  document.title = SKINS[SKIN_ID].label;
  // 输入框占位：发送给 {话题标题}（v2 占位走 data-placeholder，旧版 span 已不存在）
  const composeBtn = document.querySelector(".im-chat-compose");
  if (composeBtn) {
    delete composeBtn.dataset.defaultLabel;
    composeBtn.dataset.placeholder = t ? `发送给 ${t}` : "发送消息";
  }
}
/** 头部头像：按伪装开关取 OP 真实头像或伪装块；伪装开关切换后复用 */
function renderChatHeaderAvatar() {
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
    const d = skinHooks.msgAvatar?.(authorName);
    if (d) {
      chatAvatar.style.background = d.bg;
      chatAvatar.innerHTML = d.html;
    } else {
      chatAvatar.style.background = avatarColor(authorName);
      chatAvatar.textContent = avatarLetter(authorName);
    }
  }
}

export async function loadTopic(topicId) {
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
    // 定位优先级：路由携带的楼层（通知行 /t/.../id/N）> 记忆阅读位置 > 第 1 楼
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
    if (chatState.topicId !== topicId) return; // 路由已切走
    let posts = (data.post_stream && data.post_stream.posts) || [];
    // 登录态下 Discourse 的窗口可能锚定在「上次阅读处」；按 IM 观感固定从第 1 楼开始展示
    if (
      !scrollToPost &&
      posts.length &&
      Number(posts[0].post_number) !== 1 &&
      Array.isArray(data.post_stream?.stream)
    ) {
      const headIds = data.post_stream.stream.slice(0, 20);
      if (headIds.length) {
        try {
          const qs = headIds.map((id) => `post_ids[]=${id}`).join("&");
          const headData = await api(`/t/${topicId}/posts.json?${qs}`);
          const headPosts = sortPostsByStream(
            (headData.post_stream && headData.post_stream.posts) || headData.posts || [],
            headIds
          );
          if (headPosts.length) posts = headPosts;
        } catch { /* 取不到头部时保留原窗口 */ }
      }
    }
    chatState.stream = (data.post_stream && data.post_stream.stream) || posts.map((p) => p.id);
    chatState.renderedFirstIdx = chatState.stream.indexOf(posts.length ? posts[0].id : -1);
    if (chatState.renderedFirstIdx < 0) chatState.renderedFirstIdx = 0;
    const lastLoadedId = posts.length ? posts[posts.length - 1].id : -1;
    chatState.renderedLastIdx = chatState.stream.indexOf(lastLoadedId);
    if (chatState.renderedLastIdx < 0) {
      chatState.renderedLastIdx = chatState.renderedFirstIdx + Math.max(posts.length - 1, 0);
    }
    chatState.renderedLastNumber = posts.reduce((m, p) => Math.max(m, p.post_number), 0);
    chatState.hasOlder = chatState.renderedFirstIdx > 0;
    chatState.hasNewer = chatState.renderedLastIdx >= 0 &&
      chatState.renderedLastIdx < chatState.stream.length - 1;
    chatState.op = posts.find((p) => p.post_number === 1) || posts[0] || null;
    chatState.title = data.title || "";
    chatState.totalPosts = Number(data.posts_count) || chatState.stream.length || posts.length || 0;

    const panel = document.querySelector(".im-chat-panel");
    if (panel) panel.dataset.empty = "0";
    const sub = document.querySelector(".im-chat-sub");
    paintChatHeaderChrome();
    const participants = data.participant_count ||
      (data.details && data.details.participants ? data.details.participants.length : 0);
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
    // 头部元信息第二组：楼层数（当前位置 / 总楼数，点击弹出「选择楼层」）
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
    skinHooks.syncChatTabs?.(data, topicId);

    renderChatHeaderAvatar();
    loadCategories().then(() => {
      if (chatState.topicId !== topicId) return;
      const cat = data.category_id ? categoryById(data.category_id) : null;
      const chipsBox = document.querySelector(".im-chat-chips");
      if (chipsBox) {
        chipsBox.innerHTML = cat
          ? `<a class="im-chat-chip" href="/c/${escapeHtml(cat.slug)}/${cat.id}"><span class="im-nav2-cat-dot" style="background:#${escapeHtml(cat.color || "8F959E")}"></span>${escapeHtml(cat.name)}</a>`
          : "";
      }
      if (cat && sub) sub.textContent = `归属于 ${cat.name} · ${replyTotal} 条回复`;
    });

    if (body) {
      body.innerHTML = renderBubbles(posts, getCurrentUsername()) ||
        `<div class="im-chat-empty">${ICONS.msg}<div>暂无消息</div></div>`;
      chatHooks.enhancePolls?.(body);
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
/** 向上滚动加载更早的帖子 */
async function loadOlderPosts() {
  if (!chatState.hasOlder || chatState.loading || !chatState.topicId) return;
  const ids = chatState.stream.slice(Math.max(0, chatState.renderedFirstIdx - 20), chatState.renderedFirstIdx);
  if (!ids.length) return;
  chatState.loading = true;
  const body = document.querySelector(".im-chat-body");
  try {
    const qs = ids.map((id) => `post_ids[]=${id}`).join("&");
    const data = await api(`/t/${chatState.topicId}/posts.json?${qs}`);
    const posts = sortPostsByStream(
      (data.post_stream && data.post_stream.posts) || data.posts || [],
      ids
    );
    chatState.renderedFirstIdx = Math.max(0, chatState.renderedFirstIdx - ids.length);
    chatState.hasOlder = chatState.renderedFirstIdx > 0;
    if (body && posts.length) {
      const prevHeight = body.scrollHeight;
      body.insertAdjacentHTML("afterbegin", renderBubbles(posts, getCurrentUsername()));
      body.scrollTop += body.scrollHeight - prevHeight;
      chatHooks.enhancePolls?.(body);
    }
  } catch { /* 保留现状 */ } finally {
    chatState.loading = false;
  }
}
/** 向下滚动加载更新的帖子（话题很长时不能只留首屏一页） */
async function loadNewerPosts() {
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
      (data.post_stream && data.post_stream.posts) || data.posts || [],
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
      // 去掉可能的底部状态占位后追加
      body.insertAdjacentHTML("beforeend", renderBubbles(posts, getCurrentUsername()));
      chatHooks.enhancePolls?.(body);
    }
  } catch { /* 保留现状 */ } finally {
    chatState.loading = false;
  }
}
/** 远端跳楼：目标楼层未渲染时，拉取目标窗口整体重渲并高亮（与 loadTopic 锚点同源逻辑） */
export async function jumpToFloorRemote(postNumber, highlight = true) {
  const topicId = chatState.topicId;
  if (!topicId || chatState.loading) return false;
  const n = Math.floor(Number(postNumber));
  if (!n || n < 1) return false;
  chatState.loading = true;
  const body = document.querySelector(".im-chat-panel .im-chat-body");
  try {
    const data = await api(`/t/${topicId}/${n}.json`);
    if (chatState.topicId !== topicId) return false;
    const posts = (data.post_stream && data.post_stream.posts) || [];
    if (!posts.length) return false;
    chatState.stream = (data.post_stream && data.post_stream.stream) || posts.map((p) => p.id);
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
    chatState.hasNewer = chatState.renderedLastIdx >= 0 &&
      chatState.renderedLastIdx < chatState.stream.length - 1;
    if (body) {
      // 目标楼层可能不在返回窗口里（尾楼/删楼边界）：落到窗口内最近一楼
      const landed = posts.some((p) => p.post_number === n) ? n : posts[posts.length - 1].post_number;
      body.innerHTML = renderBubbles(posts, getCurrentUsername()) ||
        `<div class="im-chat-empty">${ICONS.msg}<div>暂无消息</div></div>`;
      chatHooks.enhancePolls?.(body);
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

/* ---------- 选择楼层：头部楼层数点击 → 弹层输入楼层号跳转 ---------- */
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
    if (e.target === pop) closeFloorPicker(); // 点遮罩关闭
  });
  const input = pop.querySelector(".im-floor-pop-input");
  input.addEventListener("keydown", (e) => {
    e.stopPropagation(); // 别让 composer/全局快捷键收到
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
  setTimeout(() => { input.focus(); input.select(); }, 0);
}
function closeFloorPicker() {
  document.querySelector(".im-chat-panel .im-floor-pop")?.classList.remove("open");
}
function submitFloorPicker() {
  const pop = document.querySelector(".im-chat-panel .im-floor-pop");
  if (!pop) return;
  const input = pop.querySelector(".im-floor-pop-input");
  const max = floorPickerMax();
  const n = Math.floor(Number(input.value));
  if (!n || n < 1 || (max && n > max)) {
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
    if (!ok) chatHooks.toast?.(`没有找到 #${n} 楼`);
  });
}

/** 发帖后：原生隐藏流里出现的新帖 → 追加为气泡 */
export function syncNewPostsFromDom() {
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
    const username =
      article.querySelector(".topic-meta-data .username a, .names .username a")?.textContent.trim() ||
      myName || "?";
    const fullName =
      article.querySelector(".topic-meta-data .full-name, .names .full-name")?.textContent.trim() || username;
    const avatarImg = article.querySelector(".topic-avatar img, .post-avatar img");
    const timeEl = article.querySelector(".post-info .relative-date, .relative-date");
    const mine =
      article.classList.contains("current-user-post") ||
      !!article.querySelector(".current-user-post") ||
      normalizeUsername(username) === normalizeUsername(myName);
    const post = {
      post_number: number,
      username,
      name: fullName,
      avatar_template: avatarImg ? avatarImg.src.replace(/\/\d+\//, "/{size}/") : "",
      cooked: cooked.innerHTML,
      created_at: (timeEl && (timeEl.getAttribute("title") || timeEl.dataset.time)) || new Date().toISOString(),
      yours: mine
    };
    body.insertAdjacentHTML("beforeend", bubbleHtml(post, myName));
    chatState.renderedLastNumber = Math.max(chatState.renderedLastNumber, number);
    appended = true;
  }
  if (appended) {
    chatHooks.enhancePolls?.(body);
    body.scrollTop = body.scrollHeight;
  }
}

// 自注册：话题已打开时，列表行（通知/会话）再次点击同话题 → 滚动到对应楼层；
// 匿名伪装开关切换 → 详情页头部标题 chrome/头像即时重涂（列表侧重绘由 toggles 自理）
Object.assign(chatHooks, {
  jumpToPost(postNumber) {
    const body = document.querySelector(".im-chat-panel .im-chat-body");
    if (!body) return false;
    if (scrollChatToPost(body, postNumber, true)) {
      rememberTopicPost(chatState.topicId, postNumber);
      return true;
    }
    // 已渲染流里没有该楼（如整窗重锚过）→ 远端取窗口跳过去
    return jumpToFloorRemote(postNumber);
  },
  refreshMaskedChrome() {
    paintChatHeaderChrome();
    renderChatHeaderAvatar();
  }
});
