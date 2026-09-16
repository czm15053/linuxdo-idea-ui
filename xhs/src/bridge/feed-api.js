// 小红书笔记详情、搜索流与评论抓取层
// 优先纯内存直读 window.__INITIAL_STATE__（零 DOM、零穿帮、瞬时响应）
// 降级静默触发单页路由加载，保障纯净的 IM 摸鱼对话流体验

import { countIn, getInitialState, unwrap, extractTweet, isLikeActive, flagTrue, findVueRouter, timeFromNoteId, fmtStateTime, findTweetArticle, pageWindow } from "./x-dom.js";
import { commentFromRaw } from "./comment-from-raw.js";

function sleep(ms) {
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
  const d = ts instanceof Date ? ts : new Date(typeof ts === "number" && ts < 1e11 ? ts * 1000 : ts);
  if (Number.isNaN(d.getTime())) return "刚刚";
  const now = new Date();
  const diffSec = Math.floor((now - d) / 1000);
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

/** 从 __INITIAL_STATE__ 中的 note 对象构建符合 IM 聊天窗渲染的标准 pin 结构 */
export function pinFromNoteObject(rawNote, noteId) {
  if (!rawNote) return null;
  const note = unwrap(rawNote.note) || unwrap(rawNote.noteCard) || unwrap(rawNote.data) || rawNote;
  const id = noteId || safeExtract(note, "noteId") || safeExtract(note, "id") || "";
  const title = (safeExtract(note, "title") || safeExtract(note, "displayTitle") || "").trim();
  const desc = (safeExtract(note, "desc") || "").trim();
  const fullText = [title, desc].filter(Boolean).join("\n\n") || title || "分享了一篇笔记";

  const authorName = safeExtract(note, "user.nickname")
    || safeExtract(note, "user.nickName")
    || safeExtract(note, "author.nickname")
    || safeExtract(note, "author.name")
    || "小红书薯友";
  const authorAvatar = safeExtract(note, "user.avatar")
    || safeExtract(note, "user.image")
    || safeExtract(note, "author.avatar")
    || safeExtract(note, "author.image")
    || "";
  const authorHandle = String(safeExtract(note, "user.userId") || safeExtract(note, "author.userId") || authorName);
  const xsec = safeExtract(note, "user.xsecToken") || safeExtract(note, "xsecToken") || "";
  const profileHref = authorHandle && /^[0-9a-f]+$/i.test(authorHandle)
    ? `/user/profile/${authorHandle}${xsec ? `?xsec_token=${encodeURIComponent(xsec)}&xsec_source=pc_feed` : ""}`
    : "";

  const rawImages = safeExtract(note, "imageList", []) || safeExtract(note, "images", []);
  let photos = (Array.isArray(rawImages) ? rawImages : [])
    .map((img) => (typeof img === "string" ? img : img.urlDefault || img.url || img.infoList?.[0]?.url || ""))
    .filter(Boolean);
  if (!photos.length) {
    const cover = safeExtract(note, "cover.urlDefault") || safeExtract(note, "cover.url");
    if (cover) photos = [cover];
  }

  const isVideo = safeExtract(note, "type") === "video";
  let video = null;
  if (isVideo) {
    const videoSrc =
      safeExtract(note, "video.media.stream.h264.0.masterUrl") ||
      safeExtract(note, "video.consumer.originVideoKey") ||
      "";
    video = {
      src: videoSrc,
      poster: photos[0] || safeExtract(note, "cover.urlDefault") || "",
    };
  }

  const likeCount = String(safeExtract(note, "interactInfo.likedCount", "0"));
  const collectCount = String(safeExtract(note, "interactInfo.collectedCount", "0"));
  const replyCount = String(safeExtract(note, "interactInfo.commentCount", "0"));
  const isLiked = flagTrue(safeExtract(note, "interactInfo.liked", false));
  const isCollected = Boolean(safeExtract(note, "interactInfo.collected", false));

  const rawTs = safeExtract(note, "time") || safeExtract(note, "lastUpdateTime") || safeExtract(note, "createTime");
  const dateObj = rawTs ? new Date(typeof rawTs === "number" && rawTs < 1e11 ? rawTs * 1000 : rawTs) : timeFromNoteId(id);
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
    timeIso: dateObj ? dateObj.toISOString() : new Date().toISOString(),
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
      verified: false,
    },
    stats: {
      reply: replyCount,
      rt: collectCount,
      like: likeCount,
      liked: isLiked,
      retweeted: isCollected,
      bookmarked: isCollected,
    },
    source: "note",
  };
}

/** 尝试从页面内存状态 __INITIAL_STATE__ 中静默提取已缓存的笔记详情 */
export function getCachedNoteFromState(noteId) {
  const state = getInitialState();
  if (!state) return null;

  // 1. 直链详情页的单篇笔记根数据
  const direct = unwrap(state.noteData?.data?.noteData);
  if (direct && (!noteId || direct.id === noteId || direct.noteId === noteId)) {
    return direct;
  }

  // 2. 多篇详情缓存 Map
  const detailMap = unwrap(state.note?.noteDetailMap);
  if (detailMap) {
    const pickNote = (entry) => unwrap(unwrap(entry)?.note);
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
  const author = item.querySelector(".author, .right .author, .name")?.parentElement || item.querySelector(".author");
  const names = [...(item.querySelectorAll(".author a.name, .author .name, a.name") || [])]
    .map((n) => n.textContent.trim())
    .filter(Boolean);
  if (names.length >= 2) return names[1];
  const raw = (author?.textContent || item.querySelector(".author")?.textContent || "").replace(/\s+/g, " ").trim();
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
  if (!item) return null;
  const rawId = item.id || item.getAttribute("id") || "";
  const nameEl = item.querySelector(".author a.name, a.name, .name");
  const rawName = (nameEl?.textContent || "").trim();
  const name = rawName.replace(/\s*回复\s*.*/, "") || "热心薯友";

  const vComp = vueCommentData(item);
  const vUser = unwrap(vComp?.userInfo) || unwrap(vComp?.user) || {};
  const vAvatar = unwrap(vUser.image) || unwrap(vUser.avatar) || "";

  const avatarImg = item.querySelector(".avatar img, .user-avatar img, a.avatar img, img.avatar, img[src*='avatar'], img");
  const domAvatar = avatarImg?.currentSrc || avatarImg?.src || avatarImg?.getAttribute("src") || avatarImg?.dataset?.src || "";
  const avatar = domAvatar || vAvatar || "";

  const contentEl = item.querySelector(".comment-inner-container .content .note-text, .comment-inner-container .content")
    || item.querySelector(":scope > .content, :scope .right > .content");
  const text = (contentEl?.innerText || "").trim();

  const dateEl = item.querySelector(".info .date, .date");
  const locEl = item.querySelector(".info .location, .location");
  const dateStr = (dateEl?.textContent || "").trim();
  const locStr = locEl ? locEl.textContent.trim().replace(/^IP属地[:：]?\s*/, "") : "";
  const time = [dateStr, locStr ? `IP:${locStr}` : ""].filter(Boolean).join(" · ") || "刚刚";

  const likeEl = item.querySelector(".like-wrapper");
  const likeCount = countIn(likeEl?.querySelector(".count")?.textContent || "") || "";
  const liked = isLikeActive(likeEl);
  const photos = [];
  item.querySelectorAll(".comment-picture img, .img-box img").forEach((img) => {
    if (img.closest(".reply-container") && !item.closest(".reply-container")) return;
    const src = img.getAttribute("src");
    if (src && !src.includes("emoji") && !src.includes("avatar") && !photos.includes(src)) photos.push(src);
  });
  if (!text && !photos.length) return null;
  const target = repliedTo || replyTargetFromAuthor(item);
  const profileHref = item.querySelector('a[href*="/user/profile/"]')?.getAttribute("href") || "";
  const userId = profileHref.match(/\/user\/profile\/([^/?#]+)/)?.[1] || name;
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
    href: "",
  };
}

function rootCommentEl(parent) {
  for (const el of parent.querySelectorAll(".comment-item")) {
    if (!el.closest(".reply-container, .sub-comments")) return el;
  }
  return parent.querySelector(":scope > .comment-item") || null;
}

function subCommentEls(parent) {
  const inside = parent.querySelectorAll(".reply-container .comment-item, .sub-comments .comment-item");
  if (inside.length) return Array.from(inside);
  const sib = parent.nextElementSibling;
  if (sib?.classList?.contains("reply-container") || sib?.classList?.contains("sub-comments")) {
    return Array.from(sib.querySelectorAll(".comment-item"));
  }
  return [];
}

/** 按真实 #noteContainer 评论树扁平化为 IM 气泡（主评 + 楼中楼） */
export function harvestNoteComments(container = noteContainer()) {
  if (!container) return [];
  const replies = [];
  const seen = new Set();
  const parentComments = container.querySelectorAll(".comments-container .parent-comment, .parent-comment");

  const push = (parsed) => {
    if (!parsed) return;
    const key = parsed.id && !parsed.id.startsWith("0.") ? parsed.id : `${parsed.name}|${parsed.text}`;
    if (seen.has(key)) return;
    seen.add(key);
    replies.push(parsed);
  };

  if (parentComments.length) {
    parentComments.forEach((parent) => {
      const rootItem = rootCommentEl(parent);
      const parsed = rootItem ? parseCommentItem(rootItem) : null;
      push(parsed);
      subCommentEls(parent).forEach((sub) => {
        push(parseCommentItem(sub, parsed?.name, parsed?.text));
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
    const subs = unwrap(item?.subComments) || unwrap(item?.subCommentList) || unwrap(item?.sub_comments) || [];
    if (Array.isArray(subs) && subs.length) flattenRawComments(subs, parsed?.name || repliedTo, out);
  }
}

/** 从 __INITIAL_STATE__.note.noteDetailMap 读评论（DOM 未渲染时的兜底） */
export function harvestCommentsFromState(noteId) {
  const out = [];
  try {
    const state = getInitialState();
    if (!state) return out;
    const map = unwrap(state.note?.noteDetailMap) || {};
    const entry = unwrap(noteId ? map[noteId] : null) || {};
    const buckets = [
      unwrap(entry.comments),
      unwrap(entry.comment),
      unwrap(entry.commentList),
      unwrap(state.note?.comments),
      unwrap(state.comment?.commentMap?.[noteId]),
    ];
    for (const b of buckets) {
      const list = Array.isArray(b) ? b : (Array.isArray(b?.list) ? b.list : []);
      if (list.length) flattenRawComments(list, "", out);
      if (out.length) break;
    }
  } catch { /* ignore */ }
  return out;
}

export function collectNoteComments(noteId, container = noteContainer()) {
  const fromDom = harvestNoteComments(container);
  const fromState = harvestCommentsFromState(noteId);

  const map = new Map();
  // 先置入 state 的接口纯净数据（100% 自带真实头像）
  for (const c of fromState) {
    const k = c.id && !c.id.startsWith("0.") ? c.id : `${c.name}|${c.text}`;
    map.set(k, { ...c });
  }

  // 再用 DOM 渲染的评论更新（若 DOM 评论尚未加载出头像，保留 state 中的真实头像）
  for (const c of fromDom) {
    const k = c.id && !c.id.startsWith("0.") ? c.id : `${c.name}|${c.text}`;
    if (map.has(k)) {
      const existing = map.get(k);
      map.set(k, {
        ...existing,
        ...c,
        avatar: c.avatar || existing.avatar || "",
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
  } catch { /* ignore */ }
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

/** 点一轮原生「展开/更多评论」，并滚动评论容器触发分页 */
export function expandCommentRound() {
  kickCommentScroller();
  let n = 0;
  for (const b of commentMoreButtons()) {
    try { b.click(); n++; } catch { /* ignore */ }
  }
  return n;
}

/** 自动循环展开当前笔记详情中的所有二级折叠评论与后续分页 */
export async function expandAllComments(_container) {
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

/** 拉下一页评论：滚动原生容器 + 点展开，返回当前已抓到的全部评论 */
export async function loadMoreComments(noteId) {
  expandCommentRound();
  await new Promise((r) => setTimeout(r, 400));
  expandCommentRound();
  return collectNoteComments(noteId);
}

/** 下载导出当前打开笔记的完整图文与评论为 TXT 文本 */
export function downloadNoteCommentsAsTxt(pin, replies) {
  if (!pin) return;
  const postUrl = `${location.origin}${pin.href || `/explore/${pin.id}`}`;
  const title = (pin.text || "").split("\n")[0] || pin.name || "无标题";
  let exportText = `帖子链接: ${postUrl}\n\n`;
  exportText += `笔记标题: ${title}\n`;
  exportText += `作者: ${pin.name || pin.author?.name || "未知作者"}\n`;
  exportText += `发布时间: ${pin.time || "未知"}\n\n`;
  exportText += `笔记内容:\n${pin.text || "无"}\n\n`;
  exportText += "==================== 评论区 ====================\n\n";

  if (!replies || !replies.length) {
    exportText += "当前笔记没有评论。\n";
  } else {
    replies.forEach((comment, index) => {
      const tag = comment.repliedTo ? `  -> [回复 @${comment.repliedTo}]` : `【${index + 1}楼】`;
      exportText += `${tag} ${comment.name} (点赞: ${comment.likeCount || 0})\n`;
      exportText += `时间: ${comment.time}\n`;
      exportText += `内容: ${comment.text}\n`;
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
    ...Array.from(container.querySelectorAll("[class*='note'], [class*='content'], [class*='author']")).slice(0, 15),
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
  // 1. 优先从 Vue 3 内部组件状态提取完整 note 对象
  const vueNote = extractNoteFromVueComp(container);
  if (vueNote) {
    const pin = pinFromNoteObject(vueNote, noteId);
    if (pin && (pin.text !== "分享了一篇笔记" || pin.name !== "小红书薯友")) {
      return pin;
    }
  }

  // 2. 降级：从 DOM 全面提取
  const titleEl = container.querySelector("#detail-title, .title, [class*='detail-title'], .note-content .title, .note-scroller .title");
  const title = (titleEl?.innerText || titleEl?.textContent || "").trim();

  const descEl = container.querySelector("#detail-desc, .desc, [class*='detail-desc'], .note-content .desc, .note-text, .note-scroller .desc");
  const desc = (descEl?.innerText || descEl?.textContent || "").trim();

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
  const authorNameEl = authorEl?.querySelector(".name, .username, [class*='name']") || authorLink;
  const authorName = (authorNameEl?.innerText || authorNameEl?.textContent || "").trim() || "小红书薯友";
  const authorHandle = authorLink?.getAttribute("href")?.match(/\/user\/profile\/([^?/]+)/)?.[1] || authorName;
  const authorImg = authorEl?.querySelector("img.avatar-item, img.user-image, .avatar img, img[src*='avatar'], img");
  const authorAvatar = authorImg?.currentSrc || authorImg?.src || authorImg?.getAttribute("src") || "";

  const photos = collectNotePhotos(container);
  const videoEl = container.querySelector(".media-container video, video");
  const videoSrc = videoEl?.getAttribute("src") || "";
  const video = videoSrc || videoEl ? { src: videoSrc, poster: videoEl?.getAttribute("poster") || photos[0] || "" } : null;

  const bar = container.querySelector(".engage-bar, .buttons.engage-bar-style");
  const likeEl = bar?.querySelector(".like-wrapper") || container.querySelector(".engage-bar .like-wrapper, [class*='like-wrapper']");
  const collectEl = bar?.querySelector(".collect-wrapper") || container.querySelector(".engage-bar .collect-wrapper, [class*='collect-wrapper']");
  const chatEl = bar?.querySelector(".chat-wrapper") || container.querySelector(".engage-bar .chat-wrapper, [class*='chat-wrapper']");
  const likeCount = countIn(likeEl?.querySelector(".count")?.textContent || "") || "";
  const collectCount = countIn(collectEl?.querySelector(".count")?.textContent || "") || "";
  const replyCount = countIn(chatEl?.querySelector(".count")?.textContent || container.querySelector(".comments-container .total, .comments-container")?.textContent || "") || "";
  const isLiked = isLikeActive(likeEl);
  const isCollected = !!(collectEl?.querySelector(".collect-active, .active") || collectEl?.classList.contains("active"));

  const dateObj = timeFromNoteId(noteId);
  const noteTime = (container.querySelector(".date, .info .date, .time, [class*='date']")?.textContent || "").trim()
    || (dateObj ? fmtStateTime(dateObj) : "")
    || "刚刚";

  return {
    id: noteId,
    name: authorName,
    handle: authorHandle,
    profileHref: authorLink?.getAttribute("href") || "",
    avatar: authorAvatar,
    text: fullText,
    photos,
    images: photos,
    video,
    time: noteTime,
    datetime: dateObj ? dateObj.toISOString() : "",
    timeIso: dateObj ? dateObj.toISOString() : new Date().toISOString(),
    likeCount,
    rtCount: collectCount,
    replyCount,
    liked: isLiked,
    retweeted: isCollected,
    bookmarked: isCollected,
    following: false,
    author: { name: authorName, handle: authorHandle, avatar: authorAvatar, verified: false },
    stats: { reply: replyCount, rt: collectCount, like: likeCount, liked: isLiked, retweeted: isCollected, bookmarked: isCollected },
    source: "note",
  };
}

function extractFromNoteContainer(nid) {
  const box = noteContainer();
  if (!box) return null;
  return { pin: pinFromNoteContainer(box, nid), replies: harvestNoteComments(box) };
}

/** 优先从 DOM 卡片上的链接中获取带 xsec_token 的实际 URL */
function noteXsecToken(nid) {
  if (!nid) return "";
  const card = findTweetArticle(nid);
  const href = card?.querySelector("a[href*='xsec_token']")?.getAttribute("href") || "";
  const m = href.match(/xsec_token=([^&]+)/);
  if (m) return decodeURIComponent(m[1]);
  try {
    const state = getInitialState();
    const feeds = unwrap(state?.feed?.feeds) || [];
    if (Array.isArray(feeds)) {
      const el = feeds.find((f) => {
        const raw = unwrap(f);
        return String(unwrap(raw.id) || "") === String(nid);
      });
      if (el) return String(unwrap(el.xsecToken) || "");
    }
  } catch { /* ignore */ }
  return "";
}

function findNoteCardUrl(nid) {
  if (!nid) return "";
  const card = findTweetArticle(nid);
  if (card) {
    const links = Array.from(card.querySelectorAll("a[href*='xsec_token'], a.cover, a.title, a"));
    for (const a of links) {
      const h = a.getAttribute("href") || "";
      if (h && h.includes(nid) && h.includes("xsec_token")) return h;
    }
    const anyLink = card.querySelector("a.cover, a.title, a[href*='/explore/'], a[href*='/discovery/item/']");
    const h = anyLink?.getAttribute("href") || "";
    if (h && h.includes(nid)) return h;
  }
  const token = noteXsecToken(nid);
  if (token) return `/explore/${nid}?xsec_token=${encodeURIComponent(token)}&xsec_source=pc_feed`;
  return `/explore/${nid}`;
}

/**
 * 用 Vue Router 或卡片真实链接打开带 xsec_token 的详情，秒级触发小红书详情请求
 */
function clickNativeNoteCard(nid) {
  if (!nid) return;
  try {
    const card = findTweetArticle(nid);
    const url = findNoteCardUrl(nid);
    const router = findVueRouter();
    if (url && router && typeof router.push === "function") {
      router.push(url);
    } else {
      const targetLink = card?.querySelector("a.cover[href*='xsec_token'], a.title[href*='xsec_token'], a[href*='xsec_token'], a.cover, a.title");
      if (targetLink) {
        targetLink.click();
      } else if (url) {
        try { history.pushState({}, "", url); pageWindow().dispatchEvent(new PopStateEvent("popstate")); } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }
}

export async function fetchTweetDetail(noteId) {
  if (!noteId) return null;

  let pin = (() => {
    const cached = getCachedNoteFromState(noteId);
    if (cached) return pinFromNoteObject(cached, noteId);
    return extractFromNoteContainer(noteId)?.pin || null;
  })();

  // 始终触发原生卡片打开/路由加载，无感静默填充
  clickNativeNoteCard(noteId);

  let replies = collectNoteComments(noteId);

  // 快速轮询：每 80ms 一次，最多 15 次（总计最长仅 1.2s，正文就绪立刻返回）
  for (let i = 0; i < 15; i++) {
    await sleep(80);
    if (i === 2 || i === 6) kickCommentScroller();
    const cached = getCachedNoteFromState(noteId);
    if (cached) pin = pinFromNoteObject(cached, noteId);
    const live = extractFromNoteContainer(noteId);
    if (live?.pin) {
      if (!pin) {
        pin = live.pin;
      } else {
        // 只有在 live.pin 具备有效真实数据时才合并更新，严禁空壳覆盖真实卡片数据！
        if (live.pin.text && live.pin.text !== "分享了一篇笔记") pin.text = live.pin.text;
        if (live.pin.name && live.pin.name !== "小红书薯友") pin.name = live.pin.name;
        if (live.pin.avatar) pin.avatar = live.pin.avatar;
        if (live.pin.handle && live.pin.handle !== "小红书薯友") pin.handle = live.pin.handle;
        if (live.pin.profileHref) pin.profileHref = live.pin.profileHref;
        if (live.pin.photos?.length) pin.photos = live.pin.photos;
        if (live.pin.likeCount) pin.likeCount = live.pin.likeCount;
        if (live.pin.rtCount) pin.rtCount = live.pin.rtCount;
        if (live.pin.replyCount) pin.replyCount = live.pin.replyCount;
      }
    }
    replies = collectNoteComments(noteId);

    // 一旦获取到完整正文（超过标题长度）或多图或来自缓存，且稍微等待了一两轮以获取首批评论，立即返回！
    const hasDetailedPin = pin && (pin.photos?.length > 1 || (pin.text && pin.text.length > 25) || cached);
    if (hasDetailedPin && (replies.length || i >= 4)) {
      break;
    }
    if (location.pathname.startsWith("/404")) break;
  }

  // 终检：如果 pin 依然为空或仍是空壳占位，强制从信息流卡片补足作者、头像、标题与封面
  if (!pin || pin.name === "小红书薯友" || pin.text === "分享了一篇笔记") {
    const fromCard = pinFromFeedCard(noteId);
    if (fromCard) {
      if (!pin) pin = fromCard;
      else {
        if (!pin.name || pin.name === "小红书薯友") pin.name = fromCard.name;
        if (!pin.avatar) pin.avatar = fromCard.avatar;
        if (!pin.handle || pin.handle === "小红书薯友") pin.handle = fromCard.handle;
        if (!pin.profileHref) pin.profileHref = fromCard.profileHref;
        if (!pin.photos?.length) pin.photos = fromCard.photos;
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
  } catch { /* ignore */ }
  return null;
}

/** 搜索列表：从 __INITIAL_STATE__.search.feeds 直读结构化搜索流 */
export async function fetchSearchTimeline(_query) {
  try {
    const state = getInitialState();
    const feeds = unwrap(state?.search?.feeds) || [];
    if (!Array.isArray(feeds) || !feeds.length) return [];

    return feeds
      .filter((item) => item?.noteCard)
      .map((item) => {
        const id = item.id;
        const card = item.noteCard;
        const title = (card.displayTitle || card.title || "").trim();
        const author = card.user || {};
        const cover = card.cover?.urlDefault || card.cover?.url || "";
        const likeCount = String(card.interactInfo?.likedCount || "");
        const isLiked = flagTrue(card.interactInfo?.liked);

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
          timeIso: new Date().toISOString(),
          source: "search",
        };
      });
  } catch {
    return [];
  }
}

/* 保留桩：通知/视频海报/翻译入口已从 UI 移除，仅作旧路由兜底 */
export function posterVideoSrc() { return ""; }
export async function requestXTranslation(text) { return text; }

/* —— 被动捕获官方搜索接口响应（不生成/不逆向签名，仅监听页面自身请求） —— */
let capturedSearch = { keyword: "", items: [], _t: 0 };

function searchItemsFromPayload(data) {
  try {
    const items = unwrap(data?.data?.items) || [];
    const out = [];
    for (const raw of items) {
      const item = unwrap(raw);
      const card = unwrap(item?.noteCard);
      if (!card) continue; // 跳过 rec_query 等非笔记项
      const id = String(unwrap(item.id) || unwrap(card.noteId) || "");
      if (!id) continue;
      const user = unwrap(card.user) || {};
      const cover = unwrap(card.cover?.urlDefault) || unwrap(card.cover?.url) || "";
      const likeCount = String(unwrap(card.interactInfo?.likedCount) || "");
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
        timeIso: new Date().toISOString(),
        source: "search",
      });
    }
    return out;
  } catch { return []; }
}

export function installSearchCapture() {
  try {
    const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    if (win.__ximSearchHooked) return;
    win.__ximSearchHooked = installSearchCapture; // 标记位
    const proto = win.XMLHttpRequest.prototype;
    const origOpen = proto.open;
    const origSend = proto.send;
    proto.open = function (_method, url) {
      this.__ximUrl = String(url || "");
      return origOpen.apply(this, arguments);
    };
    proto.send = function (body) {
      const url = this.__ximUrl || "";
      if (url.includes("/api/sns/web/v2/search/notes") || url.includes("/api/sns/web/v1/search/notes")) {
        let kw = "";
        try { kw = String(JSON.parse(body || "{}").keyword || ""); } catch { /* ignore */ }
        this.addEventListener("load", () => {
          try {
            const data = typeof this.response === "string" ? JSON.parse(this.response) : this.response;
            const items = searchItemsFromPayload(data);
            if (items.length) capturedSearch = { keyword: kw, items, _t: Date.now() };
          } catch { /* ignore */ }
        });
      }
      return origSend.apply(this, arguments);
    };
  } catch { /* ignore */ }
}

export function getCapturedSearch(kw) {
  const k = String(kw || "").trim();
  if (!k || (capturedSearch.items.length && capturedSearch.keyword !== k)) return [];
  return capturedSearch.items;
}
