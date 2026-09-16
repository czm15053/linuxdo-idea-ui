// 小红书 DOM 提取与桥接层

// 从文本或 aria-label 解析数字计数（如 "1.2万", "384"）
export function countIn(label) {
  if (!label) return "";
  const m = String(label).replace(/,/g, "").match(/(\d+(?:\.\d+)?[KkM万]?)/);
  return m ? m[1] : "";
}

export function flagTrue(v) {
  if (v === true || v === 1 || v === "true" || v === "1") return true;
  return false;
}

function vueLiked(el) {
  let comp = el?.__vueParentComponent;
  for (let i = 0; i < 16 && comp; i++) {
    const bags = [comp.props, comp.setupState, comp.ctx];
    for (const bag of bags) {
      if (!bag || typeof bag !== "object") continue;
      if ("liked" in bag || "isLiked" in bag) return flagTrue(bag.liked ?? bag.isLiked);
      const info = unwrap(bag.interactInfo);
      if (info && typeof info === "object" && "liked" in info) return flagTrue(info.liked);
    }
    comp = comp.parent;
  }
  return null;
}

function likeSpriteHref(el) {
  const use = el.querySelector("use");
  return (use?.getAttribute("href") || use?.getAttribute("xlink:href") || "").toLowerCase();
}

function likeFillRed(el) {
  const nodes = el.querySelectorAll("svg path, svg");
  for (const n of nodes) {
    const fill = `${n.getAttribute("fill") || ""} ${getComputedStyle(n).fill || ""}`.toLowerCase();
    if (/#ff2442|#ff2e4d|#ff2442ff|255,\s*36,\s*66|255,\s*46,\s*77/.test(fill)) return true;
  }
  return false;
}

/** like-wrapper 常驻 like-active，不代表已赞。#like_b = 未赞；实心 sprite / 红色填充 = 已赞。 */
export function isLikeActive(el) {
  if (!el) return false;
  if (el.getAttribute("aria-pressed") === "true") return true;
  const href = likeSpriteHref(el);
  if (href) {
    if (/like_b|unlike|outline/.test(href)) return false;
    if (/like_f|#liked|#like$|#like_/.test(href) && !/like_b/.test(href)) return true;
  }
  const v = vueLiked(el);
  if (v !== null) return v;
  return likeFillRed(el);
}

export function extractStat(btn) {
  if (!btn) return "";
  const label = btn.getAttribute("aria-label") || "";
  const mLabel = countIn(label);
  if (mLabel) return mLabel;
  const txt = (btn.innerText || btn.textContent || "").trim();
  return countIn(txt);
}

export function clickNative(sel) {
  const el = typeof sel === "string" ? document.querySelector(sel) : sel;
  if (!el) return false;
  el.click();
  return true;
}

/* —— 本地用户信息提取与缓存 —— */
let _cachedMe = null;
function readCachedMe() {
  if (_cachedMe) return _cachedMe;
  try {
    const raw = localStorage.getItem("xhs-im-me");
    if (raw) _cachedMe = JSON.parse(raw);
  } catch { /* ignore */ }
  return _cachedMe;
}

function writeCachedMe(info) {
  if (!info) return;
  const prev = readCachedMe() || {};
  const avatar = info.avatar || prev.avatar || "";
  const name = info.name && info.name !== "我的小红书" && info.name !== "小红书用户" ? info.name : (prev.name || info.name || "小红书用户");
  const path = info.path && info.path !== "/user/profile" ? info.path : (prev.path || info.path || "/user/profile");
  const handle = info.handle && info.handle !== "me" ? info.handle : (prev.handle || info.handle || "me");
  _cachedMe = {
    ...prev,
    ...info,
    avatar,
    name,
    path,
    handle,
    _t: Date.now(),
  };
  try { localStorage.setItem("xhs-im-me", JSON.stringify(_cachedMe)); } catch { /* ignore */ }
}

export function getInitialState() {
  try {
    const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    if (win.__INITIAL_STATE__) return win.__INITIAL_STATE__;
  } catch { /* ignore */ }

  try {
    for (const s of document.scripts || []) {
      const txt = s.textContent || "";
      if (txt.includes("__INITIAL_STATE__")) {
        const m = txt.match(/__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});?\s*(?:<\/script>|window|\(function|\n|$)/);
        if (m) {
          try {
            const clean = m[1].replace(/:\s*undefined/g, ":null");
            return JSON.parse(clean);
          } catch { /* ignore */ }
        }
      }
    }
  } catch { /* ignore */ }

  return null;
}

/** Vue 3 响应式解包工具，提取 ref/reactive/shallowRef/deps */
export function unwrap(value, depth = 0) {
  if (depth > 6 || value == null || typeof value !== "object") return value;
  if (Object.prototype.hasOwnProperty.call(value, "_rawValue")) {
    return unwrap(value._rawValue, depth + 1);
  }
  if (Object.prototype.hasOwnProperty.call(value, "value")) {
    const inner = value.value;
    if (inner == null || typeof inner !== "object" || !("deps" in inner)) {
      return unwrap(inner, depth + 1);
    }
  }
  return value;
}

/** 嗅探小红书内部 Vue Router 实例以驱动无感前端单页导航 */
export function findVueRouter() {
  const seeds = [
    document.querySelector("#app"),
    document.querySelector("#global"),
    document.querySelector(".side-bar"),
    document.querySelector(".channel-list-content"),
  ];
  for (const el of seeds) {
    const fromApp = el?.__vue_app__?.config?.globalProperties?.$router;
    if (fromApp && typeof fromApp.push === "function") return fromApp;

    let comp = el?.__vueParentComponent;
    for (let i = 0; i < 24 && comp; i++) {
      const router =
        comp.appContext?.config?.globalProperties?.$router ||
        comp.proxy?.$router;
      if (router && typeof router.push === "function") return router;
      comp = comp.parent;
    }
  }
  return null;
}

function findDomAvatar() {
  const selectors = [
    ".side-bar .user img",
    ".side-bar-component.user img",
    ".side-bar a[href*='/user/profile/'] img",
    "a.link-wrapper[href*='/user/profile/'] img",
    ".user-avatar img",
    "#userPageContainer .avatar img.user-image",
    ".user-page .user-info img",
    ".side-bar img[src*='avatar']",
    "img.reds-img[src*='avatar']",
    "img[src*='sns-avatar']",
  ];
  for (const sel of selectors) {
    for (const img of document.querySelectorAll(sel)) {
      if (img.closest(".im-shell, .im-rail, .im-list-panel, .im-chat-panel, .im-titlebar")) continue;
      const src = img.currentSrc || img.src || img.getAttribute("src") || img.dataset?.src || "";
      if (src && !src.startsWith("data:") && (src.includes("xhscdn.com") || src.includes("avatar") || src.includes("http"))) {
        return src;
      }
    }
  }
  return "";
}

function findDomProfileLink() {
  const selectors = [
    ".side-bar a[href*='/user/profile/']",
    ".side-bar-component a[href*='/user/profile/']",
    "a.link-wrapper[href*='/user/profile/']",
    "a[href*='/user/profile/']",
  ];
  for (const sel of selectors) {
    for (const a of document.querySelectorAll(sel)) {
      if (a.closest(".im-shell, .im-rail, .im-list-panel, .im-chat-panel, .im-titlebar")) continue;
      const href = a.getAttribute("href") || "";
      const m = href.match(/\/user\/profile\/([a-f0-9]{16,32})/i);
      if (m) return { href, userId: m[1] };
    }
  }
  return null;
}

function findDomUserName() {
  const selectors = [
    "#userPageContainer .user-nickname .user-name",
    ".user-page .basic-info .user-name",
    ".side-bar .user-name",
    ".side-bar a[href*='/user/profile/'] .name",
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && !el.closest(".im-shell, .im-rail, .im-list-panel, .im-chat-panel, .im-titlebar")) {
      const txt = el.textContent?.trim();
      if (txt && txt !== "我" && txt !== "小红书用户") return txt;
    }
  }
  return "";
}

function resolveMe() {
  const cached = readCachedMe() || {};

  let stateImg = "";
  let stateNick = "";
  let stateId = "";

  try {
    const state = getInitialState();
    if (state) {
      const user = unwrap(state.user) || unwrap(state.loginUser) || {};
      const info = unwrap(user.userInfo) || unwrap(user.userPageData?.basicInfo) || unwrap(state.userInfo) || {};
      stateId = unwrap(info.userId) || unwrap(user.userId) || "";
      stateNick = unwrap(info.nickname) || unwrap(info.nickName) || unwrap(user.nickname) || "";
      stateImg = unwrap(info.image) || unwrap(info.avatar) || unwrap(info.avatarImage) || unwrap(user.image) || unwrap(user.avatar) || "";
    }
  } catch { /* ignore */ }

  const domImg = findDomAvatar();
  const domLink = findDomProfileLink();
  const domName = findDomUserName();

  const finalAvatar = domImg || stateImg || (cached.avatar && cached.avatar.length > 5 ? cached.avatar : "");
  const finalUserId = domLink?.userId || stateId || (cached.handle !== "me" ? cached.handle : "");
  const finalName = domName || (stateNick && stateNick !== "小红书用户" ? stateNick : "") || (cached.name && cached.name !== "小红书用户" && cached.name !== "我的小红书" ? cached.name : "小红书用户");
  const finalPath = domLink?.href || (finalUserId ? `/user/profile/${finalUserId}` : (cached.path || "/user/profile"));

  const me = {
    path: finalPath,
    avatar: finalAvatar,
    name: finalName,
    handle: finalUserId || "me",
  };

  if (finalAvatar || (finalUserId && finalUserId !== "me")) {
    writeCachedMe(me);
  }

  return me;
}

export function nativeProfilePath() {
  const me = resolveMe();
  return me?.path || "/user/profile";
}

export function nativeAvatarSrc() {
  const me = resolveMe();
  return me?.avatar || "";
}

export function nativeDisplayName() {
  const me = resolveMe();
  return me?.name || "小红书用户";
}

export function badgeCount(href) {
  try {
    const link = document.querySelector(`.side-bar a[href*="${href}"]`);
    if (!link) return 0;
    const badge = link.querySelector(".count, .badge, .bubble");
    if (!badge) return 0;
    const n = parseInt(badge.textContent.trim(), 10);
    return isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}

export function clickHomeTab(tab) {
  if (tab === "following") {
    navigateX("/following");
  } else {
    navigateX("/explore");
  }
}

/** 真实页面 Window：沙箱模式下 view/事件派发必须走 unsafeWindow，否则抛 TypeError 或页面收不到 */
export function pageWindow() {
  try { return typeof unsafeWindow !== "undefined" ? unsafeWindow : window; } catch { return window; }
}

function dispatchClick(el) {
  if (!el) return;
  const opts = { bubbles: true, cancelable: true, view: pageWindow() };
  const doc = el.ownerDocument || document;
  const w = doc.defaultView || pageWindow();
  el.dispatchEvent(new w.MouseEvent("mousedown", opts));
  el.dispatchEvent(new w.MouseEvent("mouseup", opts));
  el.dispatchEvent(new w.MouseEvent("click", opts));
}

export function pickProfileHref(root) {
  if (!root) return "";
  if (root.matches?.('a[href*="/user/profile/"]')) return root.getAttribute("href") || "";
  return root.querySelector?.('a[href*="/user/profile/"]')?.getAttribute("href") || "";
}

/** 打开用户主页：应用内跳转标准 /user/profile/{id}，保留 xsec_token；不点原生链接避免 Vue 跳坏 URL */
export function openUserProfile(href, userId) {
  // 1. 从任何形式的 href / userId 中提取 userId
  let id = String(userId || "").trim();
  if (!id) {
    const m = String(href || "").match(/(?:user\/profile\/)?([0-9a-f]{16,32})/i);
    id = m ? m[1] : "";
  }
  if (!id) return false;
  // 2. 提取 xsec_token（若 href 自带）
  let token = "";
  try {
    const u = new URL(href || "", location.origin);
    token = u.searchParams.get("xsec_token") || "";
  } catch { /* ignore */ }
  const dest = `/user/profile/${id}${token ? `?xsec_token=${encodeURIComponent(token)}&xsec_source=pc_feed` : ""}`;
  if (location.pathname === `/user/profile/${id}`) return true; // 已在主页
  // 3. 应用内跳转，不新开窗口
  const router = findVueRouter();
  if (router && typeof router.push === "function") {
    try { router.push(dest); return true; } catch { /* fall through */ }
  }
  try {
    history.pushState({}, "", dest);
    pageWindow().dispatchEvent(new PopStateEvent("popstate"));
    return true;
  } catch { /* ignore */ }
  location.href = dest;
  return true;
}

export function navigateX(path) {
  const dest = path.startsWith("/") ? path : `/${path}`;
  if (document.documentElement.classList.contains("im-theme")) {
    // 优先点击原生导航链接，让 Vue 真实切换路由并加载对应 feed（推荐/关注/通知/主页）。
    // 注意：/explore 也要点原生链接 —— 若当前在 profile，仅 replaceState 不触发 Vue 切换，
    // 原生页面仍停在 profile，导致右栏回不到推荐流。
    if (dest !== location.pathname + location.search) {
      const selectors = [
        `.side-bar a[href*="${dest}"], a[href*="${dest}"]`,
        `.channel-container a[href*="${dest}"]`,
        `a[href="${dest}"]`,
      ];
      let anchor = null;
      for (const sel of selectors) {
        anchor = document.querySelector(sel);
        if (anchor && !anchor.closest(".im-shell, .im-rail, .im-list-panel, .im-chat-panel, .im-titlebar")) break;
        anchor = null;
      }
      if (anchor) {
        dispatchClick(anchor);
        return;
      }
      // 无匹配原生锚点（如 /search_result）：必须驱动 Vue Router 真实切路由，
      // 仅 replaceState 只改地址栏，Vue 不会加载对应页面。
      const router = findVueRouter();
      if (router && typeof router.push === "function") {
        try { router.push(dest); return; } catch { /* fall through */ }
      }
      try {
        history.pushState({}, "", dest);
        pageWindow().dispatchEvent(new PopStateEvent("popstate"));
      } catch { /* ignore */ }
      return;
    }
    try {
      if (location.pathname + location.search !== dest) history.replaceState(null, "", dest);
    } catch { /* ignore */ }
    return;
  }
  // 非伪装视图（如护栏页/设置页）：退化为原生链接点击
  const anchor = document.querySelector(`.side-bar a[href*="${dest}"]`);
  if (anchor) {
    dispatchClick(anchor);
    return;
  }
  try {
    history.replaceState(null, "", dest);
  } catch { /* ignore */ }
}

export function clickNativeLogin() {
  const loginBtn = document.querySelector("#login-btn")
    || document.querySelector(".login-btn button")
    || document.querySelector(".login-btn")
    || document.querySelector(".side-bar .login-btn");
  if (loginBtn) {
    loginBtn.click();
    return true;
  }
  return false;
}

export function clickAnchorByPath(dest) {
  const a = document.querySelector(`a[href*="${dest}"]`);
  if (a) {
    dispatchClick(a);
    return true;
  }
  return false;
}

export function timeFromNoteId(id) {
  if (!id || typeof id !== "string") return null;
  const m = id.match(/([0-9a-f]{24})/i);
  if (!m) return null;
  const hex = m[1].slice(0, 8);
  const sec = parseInt(hex, 16);
  // 合理的 Unix 秒级时间戳区间（2018年 ~ 2038年）
  if (isNaN(sec) || sec < 1514764800 || sec > 2147483647) return null;
  return new Date(sec * 1000);
}

export function fmtStateTime(ts) {
  if (!ts) return "";
  const d = ts instanceof Date ? ts : new Date(typeof ts === "number" && ts < 1e11 ? ts * 1000 : ts);
  if (Number.isNaN(d.getTime())) return "";
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

// 组件树爬取结果缓存：Vue 响应式 note 对象是稳定引用（更新只改字段），
// 同一卡片 el（含相同 noteId）直接复用，避免每 200ms 同步对每张卡全量爬树
const _vCardCache = new WeakMap();

export function vueCardData(el) {
  const nid = el?.dataset?.noteId || el?.getAttribute?.("data-note-id") || "";
  const hit = _vCardCache.get(el);
  if (hit && hit.nid === nid) return hit.data;
  let comp = el?.__vueParentComponent;
  let found = null;
  for (let i = 0; i < 16 && comp; i++) {
    const bags = [comp.props, comp.setupState, comp.ctx];
    for (const bag of bags) {
      if (!bag || typeof bag !== "object") continue;
      const note = unwrap(bag.note) || unwrap(bag.item) || unwrap(bag.noteCard) || unwrap(bag.card);
      if (note && typeof note === "object") { found = note; break; }
      if (("title" in bag || "displayTitle" in bag) && ("user" in bag || "author" in bag)) { found = bag; break; }
    }
    if (found) break;
    comp = comp.parent;
  }
  if (found) _vCardCache.set(el, { nid, data: found });
  return found;
}

/** 优先从 noteId 头部提取精确时间戳（小红书采用 ObjectId 规范，前 8 字符为秒级时间戳），降级读内存状态 */
export function lookupNoteTime(noteId) {
  if (!noteId) return "";
  const fromId = timeFromNoteId(noteId);
  if (fromId) return fmtStateTime(fromId);
  try {
    const state = getInitialState();
    if (!state) return "";
    const note = unwrap(state.note?.noteDetailMap?.[noteId]?.note);
    if (note) {
      const t = unwrap(note.time) || unwrap(note.lastUpdateTime) || unwrap(note.publishTime);
      const s = fmtStateTime(t);
      if (s) return s;
    }
    // feed 数组里按 id 匹配
    const scan = (node, depth = 0) => {
      if (!node || typeof node !== "object" || depth > 4) return "";
      const nid = unwrap(node.noteId) || unwrap(node.id);
      if (nid && String(nid) === String(noteId)) {
        const t = unwrap(node.time) || unwrap(node.lastUpdateTime) || unwrap(node.publishTime);
        const s = fmtStateTime(t);
        if (s) return s;
      }
      for (const v of Object.values(node)) {
        const r = scan(v, depth + 1);
        if (r) return r;
      }
      return "";
    };
    return scan(state);
  } catch { /* ignore */ }
  return "";
}

/** 从小红书 .note-item 节点提取标准笔记对象 */
export function extractTweet(article) {
  if (!article) return null;
  // 必须是 note-item
  const isNote = article.classList?.contains("note-item") || article.closest(".note-item");
  const el = isNote ? (article.classList?.contains("note-item") ? article : article.closest(".note-item")) : article;

  const tokenLink = el.querySelector("a[href*='xsec_token']")
    || el.querySelector("a.cover[href*='/explore/'], a.cover")
    || el.querySelector(".footer a.title")
    || el.querySelector("a:not([style*='display: none'])")
    || el.querySelector("a");
  let href = tokenLink?.getAttribute("href") || "";

  const vData = vueCardData(el);
  const idFromDataset = el.dataset?.noteId || el.dataset?.id || el.getAttribute("data-note-id") || unwrap(vData?.id) || unwrap(vData?.noteId);
  const idMatch = href.match(/\/(?:explore|profile\/[^/]+)\/([a-f0-9]{24}|[a-f0-9]+)/i) || href.match(/([a-f0-9]{24})/i);
  const id = idFromDataset || (idMatch ? idMatch[1] : (href ? href.replace(/[^\w]/g, "") : String(Math.random())));

  if (href && !href.includes("xsec_token")) {
    const token = unwrap(vData?.xsecToken) || unwrap(vData?.user?.xsecToken) || "";
    if (token) {
      href = `${href}${href.includes("?") ? "&" : "?"}xsec_token=${encodeURIComponent(token)}&xsec_source=pc_feed`;
    }
  }

  const titleEl = el.querySelector(".title, .footer .title, .name, [class*='title']");
  const domTitle = (titleEl?.innerText || titleEl?.textContent || "").trim();
  const vueTitle = (unwrap(vData?.displayTitle) || unwrap(vData?.title) || "").trim();
  const title = domTitle || vueTitle;

  const authorLink = el.querySelector(".author-wrapper, .author, .footer .author, [class*='author']");
  const authorNameEl = authorLink?.querySelector(".name, .author-name") || authorLink;
  const domAuthorName = (authorNameEl?.innerText || authorNameEl?.textContent || "").trim();
  const vueAuthorName = unwrap(vData?.user?.nickname) || unwrap(vData?.user?.nickName) || unwrap(vData?.author?.name) || "";
  const authorName = domAuthorName || vueAuthorName || "小红书薯友";

  const profileHref = pickProfileHref(el) || pickProfileHref(authorLink);
  const authorHandle = profileHref.match(/\/user\/profile\/([^/?#]+)/)?.[1]
    || String(unwrap(vData?.user?.userId) || authorName);

  const authorImg = authorLink?.querySelector("img")
    || el.querySelector(".avatar-container img, .author-avatar, .author-wrapper img, .author img, .avatar img, img[src*='avatar'], img[src*='sns-avatar']");
  const domAvatar = authorImg?.currentSrc
    || authorImg?.src
    || authorImg?.getAttribute("src")
    || authorImg?.dataset?.src
    || "";
  const vueAvatar = unwrap(vData?.user?.avatar) || unwrap(vData?.user?.image) || unwrap(vData?.author?.avatar) || "";
  const authorAvatar = domAvatar || vueAvatar || "";

  const coverImg = el.querySelector(".cover img, .cover-inner img, img");
  const domCover = coverImg?.currentSrc || coverImg?.src || coverImg?.getAttribute("src") || coverImg?.dataset?.src || "";
  const vueCover = unwrap(vData?.cover?.urlDefault) || unwrap(vData?.cover?.url) || "";
  const coverSrc = domCover || vueCover || "";
  const isVideo = !!el.querySelector(".play-icon, video") || unwrap(vData?.type) === "video";

  const likeEl = el.querySelector(".like-wrapper, .interactions, .like");
  const countEl = likeEl?.querySelector(".count") || likeEl;
  const likeCount = countIn(countEl?.textContent || "") || "0";
  const isLiked = isLikeActive(likeEl);
  const dateObj = timeFromNoteId(id);
  const noteTime = (el.querySelector(".time, .date, time, .footer .time, [class*='date']")?.textContent || "")
    .replace(/\s+/g, " ").trim().slice(0, 20)
    || (dateObj ? fmtStateTime(dateObj) : "")
    || lookupNoteTime(id);
  return {
    id,
    href: href || (id ? `/explore/${id}` : ""),
    name: authorName,
    handle: authorHandle,
    profileHref,
    avatar: authorAvatar,
    text: title || "分享了一篇笔记",
    photos: coverSrc ? [coverSrc] : [],
    images: coverSrc ? [coverSrc] : [],
    video: isVideo ? { poster: coverSrc, src: "" } : null,
    likeCount,
    replyCount: "0",
    rtCount: "0",
    liked: isLiked,
    retweeted: false,
    bookmarked: false,
    author: {
      name: authorName,
      handle: authorHandle,
      avatar: authorAvatar,
      verified: false
    },
    datetime: dateObj ? dateObj.toISOString() : "",
    time: noteTime || "刚刚",
    timeIso: dateObj ? dateObj.toISOString() : new Date().toISOString(),
    stats: {
      reply: "0",
      rt: "0",
      like: likeCount,
      liked: isLiked,
      retweeted: false,
      bookmarked: false
    },
    article: el,
    source: "note"
  };
}

export function findTweetArticle(tweetId) {
  if (!tweetId) return null;
  const byData = document.querySelector(`[data-note-id="${tweetId}"], [data-id="${tweetId}"]`);
  if (byData) return byData.closest(".note-item") || byData;
  const link = document.querySelector(`a[href*="/explore/${tweetId}"], a[href*="${tweetId}"]`);
  if (link) return link.closest(".note-item") || link;
  return null;
}

export function kickNativeVideo(article) {
  // 原地静音播放控制
  const v = article?.querySelector("video");
  if (v) {
    v.muted = true;
    v.pause();
  }
}

export function extractProfilePage() {
  const container = document.querySelector("#userPageContainer, .user-page, .profile-container");
  if (!container) return null;

  const handle = location.pathname.match(/\/user\/profile\/([^/?#]+)/)?.[1] || "";
  const nameEl = container.querySelector(".user-nickname .user-name, .basic-info .user-name, .user-name, .name");
  const avatarEl = container.querySelector(".user-info img.user-image, .avatar img.user-image, .avatar img, .user-avatar img");
  const redIdEl = container.querySelector(".user-redId, [class*='redId']");
  const ipEl = container.querySelector(".user-IP, [class*='user-IP'], [class*='user-ip']");
  const descEl = container.querySelector(".user-desc, .desc");

  // 性别识别
  const genderUse = container.querySelector(".user-tags .gender use, .gender use")?.getAttribute("href")
    || container.querySelector(".user-tags .gender use, .gender use")?.getAttribute("xlink:href") || "";
  const gender = genderUse.includes("female") ? "女" : (genderUse.includes("male") ? "男" : "");

  // 关注 / 粉丝 / 获赞与收藏
  let following = "";
  let followers = "";
  let likesAndCollects = "";
  const interactionDivs = container.querySelectorAll(".user-interactions > div, .data-info > div");
  for (const div of interactionDivs) {
    const count = div.querySelector(".count")?.textContent?.trim() || "";
    const label = div.querySelector(".shows, .label, [class*='show']")?.textContent?.trim() || "";
    if (label.includes("关注")) following = count;
    else if (label.includes("粉丝")) followers = count;
    else if (label.includes("获赞") || label.includes("赞") || label.includes("收藏")) likesAndCollects = count;
  }

  // 标签页 Tabs (笔记 / 收藏 / 点赞)
  const tabs = [];
  const tabEls = container.querySelectorAll(".xhs-user-page-primary-tabs .reds-tab-item, .user-page-sticky .reds-tab-item");
  for (let i = 0; i < tabEls.length; i++) {
    const el = tabEls[i];
    const span = el.querySelector("span:last-child") || el;
    const label = span.textContent?.trim() || "";
    if (!label) continue;
    const active = el.classList.contains("active");
    tabs.push({ label, active, index: i });
  }

  // 空状态文案（若当前 tab 暂无内容）
  const emptyEl = container.querySelector(".tab-content-item:not([style*='height: 0px']) .empty-text, .empty-container .empty-text");
  const emptyText = emptyEl?.textContent?.trim() || "";

  return {
    handle,
    name: nameEl?.textContent?.trim() || "用户主页",
    avatar: avatarEl?.getAttribute("src") || "",
    redId: redIdEl?.textContent?.trim() || "",
    ipLoc: ipEl?.textContent?.trim() || "",
    desc: descEl?.textContent?.trim() || "",
    bio: descEl?.textContent?.trim() || "",
    gender,
    following,
    followers,
    likesAndCollects,
    notes: following || "",
    tabs,
    emptyText,
  };
}

export function allTweetArticles() {
  const items = document.querySelectorAll("#userPostedFeeds .note-item, #exploreFeeds .note-item, .feeds-container .note-item, section.note-item, .note-item");
  if (items && items.length) return Array.from(items);
  const scope = document.querySelector("#userPageContainer, #userPostedFeeds, #exploreFeeds, .feeds-container, .search-layout__main, .feeds-page, .main-content") || document;
  return Array.from(scope.querySelectorAll(".note-item"));
}

export function primaryColumn() {
  return document.querySelector("#exploreFeeds, .feeds-container, .search-layout__main, .main-content");
}

/** 从 el 向上找第一个真实的内部滚动容器（overflow-y 可滚且内容超高） */
function findScrollableAncestor(el) {
  let node = el?.parentElement;
  while (node && node !== document.body) {
    const cs = getComputedStyle(node);
    if (/(auto|scroll)/.test(cs.overflowY) && node.scrollHeight > node.clientHeight + 50) return node;
    node = node.parentElement;
  }
  return null;
}

export function loadMoreFeed() {
  const now = Date.now();
  if (now - (loadMoreFeed._t || 0) < 400) return;
  loadMoreFeed._t = now;

  const html = document.documentElement;
  html.classList.add("xim-feed-loading");

  // 官方首页是内部容器滚动：从加载指示器向上探测真实滚动容器，直接置底并派发 scroll，
  // 官方的触底 handler / IntersectionObserver 才会发起下一页请求
  const loading = document.querySelector(".feeds-loading, #feeds-replace-loading, [class*='feeds-loading']");
  const scroller = findScrollableAncestor(loading) || findScrollableAncestor(primaryColumn());
  if (scroller) {
    scroller.scrollTop = scroller.scrollHeight;
    try { scroller.dispatchEvent(new Event("scroll", { bubbles: true })); } catch { /* ignore */ }
  }

  // 兜底：window/document 级滚动置底（官方若监听 window 滚动也可触发）
  const se = document.scrollingElement || document.documentElement;
  if (se) {
    try { se.scrollTop = se.scrollHeight; } catch { /* ignore */ }
  }

  // scroll 事件的规范 target 是 document：派发到 window 会让 target=window（无 contains），
  // 炸掉部分扩展在 window 上监听 scroll 的处理器
  document.dispatchEvent(new Event("scroll"));

  window.clearTimeout(loadMoreFeed._unlock);
  loadMoreFeed._unlock = window.setTimeout(() => html.classList.remove("xim-feed-loading"), 500);
}

export function refreshHomeFeed() {
  window.scrollTo(0, 0);
  // 1. 原生「换一换」按钮（不离开当前页直接换批）
  const reloadBtn = document.querySelector(".floating-btn-sets .reload, .reload");
  if (reloadBtn) {
    dispatchClick(reloadBtn);
    return;
  }
  // 2. 兜底：侧边栏「首页」链接（/explore?channel_id=homefeed_recommend），真实导航强制拉新推荐流
  const homeLink = document.querySelector("#explore-guide-refresh a")
    || document.querySelector(".side-bar a[href*='homefeed_recommend']")
    || document.querySelector('.side-bar a[href*="/explore"]');
  if (homeLink) dispatchClick(homeLink);
}

