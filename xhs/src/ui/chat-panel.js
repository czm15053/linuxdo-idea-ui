import { ICONS } from "../config/icons.js";
import { PINNED } from "../config/constants.js";
import { getChatId, isMaskTitle, isHideMedia, setHideMedia } from "../state/prefs.js";
import { displayTitle, personAvatarHtml } from "./avatars.js";
import { escapeHtml, parseCountValue, formatCount } from "../utils/html.js";
import {
  extractTweet, allTweetArticles, findTweetArticle, nativeProfilePath, loadMoreFeed,
  extractProfilePage, navigateX, refreshHomeFeed, clickNativeLogin, openUserProfile,
} from "../bridge/x-dom.js";
import { chatIdFromRoute, routeKind } from "../bridge/router.js";
import {
  toggleLike, toggleRetweet, toggleBookmark,
  toggleFollowOnProfile, getProfileFollowState,
} from "../bridge/tweet.js";
import {
  fetchTweetDetail, fetchSearchTimeline, posterVideoSrc,
  requestXTranslation, pinFromNoteObject, getCachedNoteFromState, harvestNoteComments,
  expandAllComments, downloadNoteCommentsAsTxt, collectNoteComments, loadMoreComments,
  getCapturedSearch,
} from "../bridge/feed-api.js";
import { openImImageModal, playInlineVideo, closeImVideoModal, openImVideoModal } from "./lightbox.js";
import { toast } from "./toast.js";

const seen = new Set();

function fmtXTime(dt, fallback) {
  if (!dt && fallback && fallback !== "刚刚") return fallback;
  const d = dt ? new Date(dt) : null;
  if (!d || Number.isNaN(d.getTime())) return fallback || "刚刚";
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

function statusInfo() {
  const m = location.pathname.match(/(?:explore|status)\/([a-f0-9]+)/i);
  return m ? { id: m[1] } : null;
}

function profileCardHtml(prof) {
  if (!prof) return "";
  const ava = personAvatarHtml("im-profile-avatar", prof?.name || "U", prof?.avatar || "", prof?.handle);
  const name = prof?.name || (prof?.handle ? "@" + prof.handle : "个人主页");

  const metaParts = [];
  if (prof.redId) metaParts.push(escapeHtml(prof.redId));
  if (prof.ipLoc) metaParts.push(escapeHtml(prof.ipLoc));
  if (prof.gender) metaParts.push(prof.gender === "男" ? "♂ 男" : "♀ 女");
  const subMeta = metaParts.join(" · ");

  const statItems = [
    prof.following ? `<div class="im-stat-chip"><span class="v">${escapeHtml(prof.following)}</span><span class="k">关注</span></div>` : "",
    prof.followers ? `<div class="im-stat-chip"><span class="v">${escapeHtml(prof.followers)}</span><span class="k">粉丝</span></div>` : "",
    prof.likesAndCollects ? `<div class="im-stat-chip"><span class="v">${escapeHtml(prof.likesAndCollects)}</span><span class="k">获赞与收藏</span></div>` : "",
  ].filter(Boolean).join("");

  const tabHtml = (prof.tabs || []).map((t) => `
    <button type="button" class="im-chip im-profile-tab-btn${t.active ? " active" : ""}" data-tab-idx="${t.index}">
      ${escapeHtml(t.label)}
    </button>
  `).join("");

  const bioHtml = prof.bio && prof.bio !== "还没有简介"
    ? `<div class="im-profile-bio">${escapeHtml(prof.bio).replace(/\n/g, "<br>")}</div>`
    : "";

  return `<div class="im-profile-head">
      ${ava}
      <div class="im-profile-meta">
        <div class="row1">
          <span class="im-profile-name">${escapeHtml(name)}</span>
        </div>
        ${subMeta ? `<div class="im-profile-sub">${subMeta}</div>` : ""}
        ${bioHtml}
      </div>
    </div>
    ${statItems ? `<div class="im-profile-stats">${statItems}</div>` : ""}
    ${tabHtml ? `<div class="im-profile-subbar">${tabHtml}</div>` : ""}`;
}

/** 纯文本里把 URL 变成可点击链接（详情主推/引用卡正文走纯文本，t.co 等需手动成链）。
 *  先整体转义再链接化；URL 内含 & 时转义后是 &amp;，分段吃回并还原为 & 作 href。 */
function linkifyText(text) {
  return escapeHtml(text || "")
    .replace(/(https?:\/\/[^\s<&]+(?:(?:&amp;)[^\s<]*)*)/g, (m) => {
      const href = m.replace(/&amp;/g, "&");
      return `<a href="${href}" target="_blank" rel="noopener">${m}</a>`;
    })
    .replace(/\n/g, "<br>");
}

/** 该推文该不该给「原文/译文」切换按钮：
 *   原生有翻译按钮（t.translated 已判定 true/false）→ 跟随现有状态；
 *   否则推文正文不含中文（判定为外语）也给「译文」待命按钮，点了由 X 原生按钮驱动翻译 */
/** 原生推文里的 X 翻译开关按钮（显示原文/显示翻译/翻译成…）；点击它由 X 重渲染驱动翻译 */
/** 自管理「原文/译文」切换：点「译文」→ POST X 翻译接口拿译文缓存；再点切回收藏的原态 HTML。
 *   不依赖原生翻译按钮是否存在（timeline 文章里多数推文没有该按钮，走原生驱动不可用）。 */
async function toggleTranslation(box, id) {
  const body = box.querySelector(".im-thread-pin-body") || box.querySelector(".im-tw-body");
  if (!body) return;
  const btn = box.querySelector('[data-action="trans"], [data-act="trans"]');
  const setLang = (lang, html) => {
    box.dataset.transLang = lang;
    if (html !== undefined) body.innerHTML = html;
    if (btn) btn.textContent = lang === "zh" ? "原文" : "译文";
  };
  if (box.dataset.transLang === "zh") { setLang("orig", box.dataset.transOrig || ""); return; } // 已是译文 → 切回原文
  if (box.dataset.transOrig === undefined) box.dataset.transOrig = body.innerHTML; // 首次点译文前收藏原态
  if (btn) btn.textContent = "翻译中…";  // 显式反馈，避免首次请求空窗被当成没反应
  let p = transReqCache.get(String(id));
  if (!p) { p = requestXTranslation(id); transReqCache.set(String(id), p); }
  const s = await p.catch(() => "");
  if (!s) { if (btn) btn.textContent = "译文"; toast("X 翻译没能用（接口受限或该推文不可译）"); return; }
  setLang("zh", linkifyText(s));
}
const transReqCache = new Map();

function transWanted(t) {
  if (t.translated !== undefined) return t.translated;
  const s = String(t.text || t.domText || "");
  if (s.length < 2) return undefined;
  // 含中文 → 视为母语，不提供切换；否则按外语处理
  if (/[一-鿿㐀-䶿]/.test(s)) return undefined;
  return false; // 原文态，等用户点「译文」
}

function threadPinHtml(t) {
  const ava = personAvatarHtml("im-thread-pin-avatar", t.name, t.avatar, t.id, true); // 详情强制真头像
  const photos = (t.photos || []).map((src) => `<img src="${escapeHtml(src)}" alt="" loading="lazy">`).join("");
  // 初始恒为原文：切换由 toggleTranslation 调 X 翻译接口自管理（译文/原文本地翻转）
  const body = linkifyText(t.text || "");
  const quote = t.quote ? quoteHtml(t.quote) : "";
  const transAct = transWanted(t) !== undefined
    ? `<button type="button" class="im-thread-pin-act" data-act="trans" title="译成中文"><span>译文</span></button>`
    : "";
  const me = (nativeProfilePath() || "").replace(/^\//, "").toLowerCase();
  const isMe = me && t.handle && me === t.handle.toLowerCase();
  const followBtnHtml = (!isMe && t.handle)
    ? `<button type="button" class="im-profile-follow im-pin-follow-btn${t.following ? " on" : ""}" data-handle="${escapeHtml(t.handle)}" data-pin-id="${escapeHtml(t.id || "")}">${t.following ? "已关注" : "+ 关注"}</button>`
    : "";
  return `<div class="im-thread-pin" data-pin-id="${escapeHtml(t.id || "")}" data-profile="${escapeHtml(t.profileHref || "")}" data-handle="${escapeHtml(t.handle || "")}" data-lang="orig">
    <div class="im-thread-pin-head">
      ${ava}
      <div class="im-thread-pin-names">
        <span class="im-thread-pin-name">${escapeHtml(t.name)}</span>
        <span class="im-thread-pin-handle">@${escapeHtml(t.handle || "")} · ${escapeHtml(t.time || "")}</span>
      </div>
      ${followBtnHtml}
    </div>
    <div class="im-thread-pin-body">${body}</div>
    ${quote}
    ${photos ? `<div class="im-thread-pin-photos">${photos}</div>` : ""}
    <div class="im-thread-pin-actions">
      ${transAct}
      <button type="button" class="im-thread-pin-act${t.retweeted ? " is-retweeted" : ""}" data-act="repost" data-count="${escapeHtml(t.rtCount || "")}" title="收藏">${ICONS.repost}<span>${t.rtCount ? `收藏 ${escapeHtml(t.rtCount)}` : "转推"}</span></button>
      <button type="button" class="im-thread-pin-act${t.liked ? " is-liked" : ""}" data-act="like" data-count="${escapeHtml(t.likeCount || "")}" title="点赞">${t.liked ? ICONS.heartFilled : ICONS.plus}<span>${t.likeCount ? `点赞 ${escapeHtml(t.likeCount)}` : "点赞"}</span></button>
      <button type="button" class="im-thread-pin-act${t.bookmarked ? " is-bookmarked" : ""}" data-act="bookmark" data-count="${escapeHtml(t.bookmarkCount || "")}" title="书签">${t.bookmarked ? ICONS.bookmarkFill : ICONS.bookmark}<span>${t.bookmarkCount ? `书签 ${escapeHtml(t.bookmarkCount)}` : "书签"}</span></button>
      ${t.viewCount ? `<span class="im-thread-pin-act im-thread-pin-stat" title="浏览量">${ICONS.chart}<span>${escapeHtml(t.viewCount)} 次浏览</span></span>` : ""}
      <button type="button" class="im-thread-pin-act" data-act="open" title="在小红书打开">${ICONS.swap}<span>查看原文</span></button>
    </div>
  </div>`;
}


export function ensureChatPanel() {
  let panel = document.querySelector(".im-chat-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.className = "im-chat-panel";
    panel.innerHTML = `
      <div class="im-chat-header">
        <div class="im-chat-head-main">
          <span class="im-chat-avatar"></span>
          <div class="im-chat-titles">
            <div class="im-chat-title-row">
              <span class="im-chat-title"></span>
              <span class="im-chat-chips"></span>
            </div>
            <div class="im-chat-sub"></div>
          </div>
        </div>
        <div class="im-chat-tools"></div>
        <div class="im-chat-actions">
          <button type="button" class="im-icon-btn" data-act="refresh" title="刷新">${ICONS.refresh}</button>
          <button type="button" class="im-icon-btn im-hide-media-toggle${isHideMedia() ? " is-on" : ""}" data-act="hide-media" title="${isHideMedia() ? "显示媒体（图片/视频）" : "隐藏媒体：纯文本摸鱼模式"}">${isHideMedia() ? ICONS.imageOff : ICONS.image}</button>
        </div>
      </div>
      <div class="im-chat-body"><div class="im-feed-col"></div></div>`;
    (document.body || document.documentElement).appendChild(panel);
    panel.querySelector('[data-act="hide-media"]')?.addEventListener("click", (e) => {
      e.stopPropagation();
      const on = !isHideMedia();
      setHideMedia(on);
      document.documentElement.classList.toggle("im-hide-media", on);
      syncChatHeader(panel);
      const listBtn = document.querySelector(".im-list-panel .im-hide-media-toggle");
      if (listBtn) {
        listBtn.classList.toggle("is-on", on);
        listBtn.innerHTML = on ? ICONS.imageOff : ICONS.image;
      }
      toast(on ? "已开启纯文本摸鱼模式（隐藏图片与视频）" : "已恢复显示图片与视频");
    });
    panel.querySelector('[data-act="refresh"]')?.addEventListener("click", (e) => {
      e.stopPropagation();
      refreshHomeFeed();
      resetChatMessages();
      panel.querySelector(".im-feed-col")?.scrollTo(0, 0);
      // 原生换批是异步的：延迟多次重同步，确保新一批笔记渲染进气泡流
      setTimeout(resetChatMessages, 600);
      setTimeout(resetChatMessages, 1500);
      setTimeout(resetChatMessages, 3000);
    });
    const body = panel.querySelector(".im-chat-body");
    const feed = body?.querySelector(".im-feed-col");
    feed?.addEventListener("scroll", onChatScroll);
    feed?.addEventListener("wheel", onChatWheel, { passive: true });
    feed?.addEventListener("click", onMsgClick);
    feed?.addEventListener("pointerover", (e) => {
      const q = e.target.closest(".im-quote");
      if (q) showQuoteFloat(q);
    });
    feed?.addEventListener("pointerout", (e) => {
      const q = e.target.closest(".im-quote");
      if (!q) return;
      if (e.relatedTarget && (q.contains(e.relatedTarget) || quoteFloat?.contains(e.relatedTarget))) return;
      quoteFloatHide = setTimeout(hideQuoteFloat, 120);
    });
    panel.querySelector(".im-chat-avatar")?.addEventListener("click", () => {
      const h = panel.querySelector(".im-chat-avatar")?.dataset.handle;
      if (h) navigateX("/" + h);
    });
  }
  syncChatHeader(panel);
  syncChatMessages(panel);
  return panel;
}

function syncChatHeader(panel) {
  const id = getChatId() || chatIdFromRoute();
  const ava = panel.querySelector(".im-chat-avatar");
  const title = panel.querySelector(".im-chat-title");
  const chips = panel.querySelector(".im-chat-chips");
  const sub = panel.querySelector(".im-chat-sub");
  const refreshBtn = panel.querySelector("[data-act='refresh']");
  if (refreshBtn) refreshBtn.hidden = !(routeKind() === "explore" || routeKind() === "following" || id === "explore" || id === "following");
  const mediaBtn = panel.querySelector(".im-hide-media-toggle");
  if (mediaBtn) {
    const on = isHideMedia();
    mediaBtn.classList.toggle("is-on", on);
    mediaBtn.innerHTML = on ? ICONS.imageOff : ICONS.image;
    mediaBtn.title = on ? "显示媒体（图片/视频）" : "隐藏媒体：纯文本摸鱼模式";
  }

  // 保持纯粹 IM 聊天窗外观，彻底移除冗余的 chat-tabs 与 channel-bar
  panel.querySelector(".im-chat-tabs")?.remove();
  panel.querySelector(".im-channel-bar")?.remove();

  if (routeKind() === "search") {
    const q = new URLSearchParams(location.search).get("q") || "";
    const name = `搜索: “${q}”`;
    if (ava) {
      ava.style.display = "";
      delete ava.dataset.handle;
      ava.innerHTML = personAvatarHtml("im-chat-avatar", "搜索", "", "search");
    }
    if (title) title.textContent = name;
    if (chips) chips.innerHTML = isMaskTitle() ? "" : `<a class="im-chat-chip">搜索</a>`;
    if (sub) sub.textContent = "全网笔记";
    return;
  } else if (routeKind() === "bookmark" || id === "bookmark") {
    const isLikes = location.pathname.startsWith("/i/history/likes");
    const name = isLikes ? "我的喜欢" : "我的书签";
    if (ava) {
      ava.style.display = "";
      delete ava.dataset.handle;
      ava.innerHTML = personAvatarHtml("im-chat-avatar", name, "", "bookmark");
    }
    if (title) title.textContent = "收藏中心";
    if (chips) chips.innerHTML = isMaskTitle() ? "" : `<a class="im-chat-chip">${isLikes ? "喜欢" : "书签"}</a>`;
    if (sub) sub.textContent = isLikes ? "已点赞的笔记" : "已收藏的笔记";
    return;
  }

  if (routeKind() === "profile" || id === "profile" || id.startsWith("user:")) {
    const handle = id.startsWith("user:") ? id.slice(5) : (location.pathname.match(/\/user\/profile\/([^/?#]+)/)?.[1] || "");
    const prof = extractProfilePage();
    const name = prof?.name || handle || "个人主页";
    const tools = panel.querySelector(".im-chat-tools");
    const status = statusInfo();
    if (status) {
      // 评论线程会话：header = 主推作者，chips=评论区，带返回按钮
      const pinEl = panel.querySelector(".im-thread-pin");
      const headName = pinEl?.querySelector(".im-thread-pin-name")?.textContent || name;
      const headSub = pinEl?.querySelector(".im-thread-pin-handle")?.textContent || "@" + handle;
      if (ava) {
        ava.style.display = "";
        delete ava.style.cursor;
        ava.dataset.handle = handle;
        ava.innerHTML = personAvatarHtml("im-chat-avatar", headName, prof?.avatar || "", handle);
      }
      if (title) title.textContent = headName;
      if (chips) chips.innerHTML = isMaskTitle() ? "" : `<a class="im-chat-chip">评论区</a>`;
      if (sub) sub.textContent = headSub.replace(/·\s*$/, "") || "@" + handle;
      if (tools) {
        tools.innerHTML = `<button type="button" class="im-icon-btn xim-back-btn" title="返回">${ICONS.chevrons}</button>`;
        tools.querySelector(".xim-back-btn")?.addEventListener("click", () => {
          if (history.length > 1) history.back();
          else navigateX("/explore");
        });
      }
    } else {
      if (ava) {
        ava.style.display = "";
        delete ava.style.cursor;
        ava.dataset.handle = handle;
        ava.innerHTML = personAvatarHtml("im-chat-avatar", name, prof?.avatar || "", handle);
      }
      if (title) title.textContent = name;
      if (chips) chips.innerHTML = isMaskTitle() ? "" : `<a class="im-chat-chip">个人主页</a>`;
      const subInfo = prof?.redId ? `${prof.redId}${prof.ipLoc ? ` · ${prof.ipLoc}` : ""}` : (prof?.bio || (handle ? "@" + handle : "小红书主页"));
      if (sub) sub.textContent = subInfo.slice(0, 80);
      if (tools) {
        const me = (nativeProfilePath() || "").replace(/^\//, "").toLowerCase();
        const isMe = me && (me === handle.toLowerCase() || me.endsWith(handle.toLowerCase()));
        if (!isMe && handle) {
          const followState = getProfileFollowState();
          tools.innerHTML = `<button type="button" class="im-profile-follow${followState.following ? " on" : ""}" data-act="profile-follow" data-handle="${escapeHtml(handle)}">${followState.following ? "已关注" : "+ 关注"}</button>`;
          tools.querySelector('[data-act="profile-follow"]')?.addEventListener("click", async (e) => {
            const btn = e.currentTarget;
            btn.disabled = true;
            const res = await toggleFollowOnProfile();
            btn.disabled = false;
            if (res.ok) {
              btn.classList.toggle("on", res.following);
              btn.textContent = res.following ? "已关注" : "+ 关注";
              toast(res.following ? `已关注 @${handle}` : `已取消关注 @${handle}`);
            } else {
              toast(res.msg || "操作失败，请重试");
            }
          });
        } else {
          tools.innerHTML = "";
        }
      }
    }
    return;
  }


  const pin = PINNED.find((p) => p.id === id) || PINNED[0];
  const name = displayTitle("pin:" + pin.id, pin.name);
  if (ava) {
    ava.style.display = "";
    ava.style.cursor = "";
    delete ava.dataset.handle;
    ava.innerHTML = personAvatarHtml("im-chat-avatar", name, "", pin.id);
  }
  if (title) title.textContent = name;
  if (chips) {
    if (isMaskTitle()) chips.innerHTML = "";
    else chips.innerHTML = `<a class="im-chat-chip">${escapeHtml(pin.tag || "工作台")}</a>`;
  }
  if (sub) sub.textContent = pin.handle || "";
}


function quoteHtml(q) {
  // 视频引用：渲染封面 + 播放键（data-src 是详情 API 直链，空白时播放函数现抓）
  const isVideo = !!(q.video && (q.video.src || q.video.hasVideo));
  const photos = (isVideo ? [] : (q.photos && q.photos.length ? q.photos : (q.cover ? [q.cover] : []))).slice(0, 4);
  const cover = isVideo ? (q.video?.poster || q.cover || "") : (photos[0] || "");
  const body = q.text || (isVideo ? "[视频]" : cover ? "[图片]" : "");
  const mediaHtml = isVideo
    ? `<div class="im-quote-video" data-href="${escapeHtml(q.href || "")}" data-src="${escapeHtml(q.video?.src || "")}">
        ${cover ? `<img src="${escapeHtml(cover)}" alt="" loading="lazy">` : `<div class="im-video-fallback"></div>`}
        <span class="im-video-play">${ICONS.play}</span>
      </div>`
    : (photos.length ? `<img class="im-quote-thumb" src="${escapeHtml(photos[0])}" alt="" loading="lazy">` : "");
  const photoHtml = photos.length
    ? `<div class="im-quote-pop-photos im-photos-${photos.length}">${photos.map((src) => `<img src="${escapeHtml(src)}" alt="" loading="lazy">`).join("")}</div>`
    : "";
  return `<div class="im-quote" role="link" tabindex="0" data-href="${escapeHtml(q.href || "")}" data-quote-key="${escapeHtml(q.key || "")}">
    <div class="im-quote-main">
      <span class="im-quote-name">${escapeHtml(q.name || "引用")}</span>
      <span class="im-quote-body">${linkifyText(body)}</span>
    </div>
    ${mediaHtml}
    <div class="im-quote-pop">
      <div class="im-quote-pop-name">${escapeHtml(q.name || "引用")}</div>
      <div class="im-quote-pop-body">${linkifyText(body)}</div>
      ${isVideo && cover ? `<img src="${escapeHtml(cover)}" alt="" loading="lazy">` : photoHtml}
    </div>
  </div>`;
}

/**
 * 播放引用帖视频。引用卡内的原生 video 是 blob（preload=none 未拉流），本地没有可播直链。
 * 新版引用卡在 DOM 里完全没有被引用帖的链接/id（外层 div role="link" 无 href），statusId 常取空，
 * 因此按四层解码，全程不触发原生播放、纯直链弹层：
 *   ① poster → 直链缓存（任一详情成功抓取即记住线程内全部视频 mp4，认 poster 即可播）；
 *   ② 引用帖自身 id（若引用卡带 href）→ 抓其详情，优先取被引用帖视频 pin.quote.video；
 *   ③ 所属消息主推 id → 抓详情，在整个线程里找被引用帖视频（quote.video / quote 引用的视频）；
 *   ④ 当前打开的详情线程数据（lastThreadDetail）→ 直接用已抓数据，不再发请求。
 * 注意优先级：被引用帖（引用卡展示的）视频永远优先于主推自身视频，避免播错。
 */
async function playQuoteVideo(el) {
  const quote = el.closest(".im-quote");
  const msg = el.closest(".im-msg");
  const body = el.closest(".im-detail-body");
  const poster = (quote?.querySelector("img") || el.querySelector("img"))?.src || "";
  const postMatch = (v, poster) => !poster || !v?.poster || v.poster.split("?")[0] === poster.split("?")[0];
  // 在线程里按引用卡 poster 精确找被引用帖视频；poster 缺失/配不上再回退任意线程视频（仍先被引用帖后自身）
  const pickV = (d) => {
    const arr = d?.pin ? [d.pin, ...(d.replies || [])] : [];
    let exact = null, fallback = null;
    for (const it of arr) {
      if (!it) continue;
      for (const v of [it.quote?.video, it.video]) {
        if (!v?.src) continue;
        if (postMatch(v, poster)) { exact = v; break; }
        if (!fallback) fallback = v;
      }
      if (exact) break;
    }
    return exact || fallback;
  };
  const qHref = quote?.dataset.href || el.dataset.href || "";
  let statusId = String(qHref).match(/status\/(\d+)/)?.[1] || "";
  let src = el.dataset.src || posterVideoSrc(poster);
  let p = poster || el.dataset.poster || "";
  const applyV = (v) => { if (v?.src) { src = v.src; if (v.poster) p = v.poster; } };
  // ② 引用帖自身 id
  if (!src && statusId) {
    try {
      const detail = await fetchTweetDetail(statusId);
      applyV(pickV(detail));
    } catch { /* ignore */ }
  }
  // ③ 所属消息主推 id：在整个线程里按 poster 精确匹配被引用帖视频
  if (!src && msg?.dataset.id) {
    try {
      const detail = await fetchTweetDetail(msg.dataset.id);
      applyV(pickV(detail));
    } catch { /* ignore */ }
  }
  // ④ 当前详情线程已抓数据，零请求复用
  if (!src && lastThreadDetail && body && body.dataset.pinId === lastThreadDetail.id) {
    applyV(pickV(lastThreadDetail.detail));
  }
  if (!src) { toast("视频未就绪，请重试"); return; }
  openImVideoModal({ src, poster: p, tweetId: "" });
}

function openQuotedTweet(el) {
  const href = el?.dataset?.href;
  if (href) { navigateX(href); return; }
  // 新版引用卡在 DOM 里没有被引用帖的身份（无链接/id），点击只能展示卡内摘要。
  // 若被引用帖恰好也渲染在列表（同 key 的引用卡），匹配到它那一条来打开。
  const key = el?.dataset?.quoteKey;
  if (!key) return;
  for (const card of document.querySelectorAll(".im-quote")) {
    if (card === el) continue;
    if (card.dataset.quoteKey === key) { openQuotedTweet(card); return; }
  }
}

let quoteFloat = null;
let quoteFloatHide = 0;

function hideQuoteFloat() {
  clearTimeout(quoteFloatHide);
  if (quoteFloat) quoteFloat.hidden = true;
}

function showQuoteFloat(anchor) {
  clearTimeout(quoteFloatHide);
  const src = anchor.querySelector(".im-quote-pop");
  if (!src) return;
  if (
    quoteFloat
    && !quoteFloat.hidden
    && quoteFloat.dataset.href === (anchor.dataset.href || "")
    && quoteFloat.dataset.quoteKey === (anchor.dataset.quoteKey || "")
  ) return;
  if (!quoteFloat) {
    quoteFloat = document.createElement("div");
    quoteFloat.className = "im-quote-float";
    quoteFloat.addEventListener("pointerenter", () => clearTimeout(quoteFloatHide));
    quoteFloat.addEventListener("pointerleave", () => { quoteFloatHide = setTimeout(hideQuoteFloat, 120); });
    quoteFloat.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideQuoteFloat();
      openQuotedTweet(quoteFloat);
    });
    document.body.appendChild(quoteFloat);
  }
  quoteFloat.innerHTML = src.innerHTML;
  quoteFloat.dataset.href = anchor.dataset.href || "";
  quoteFloat.dataset.quoteKey = anchor.dataset.quoteKey || "";
  quoteFloat.hidden = false;
  const r = anchor.getBoundingClientRect();
  const w = Math.min(360, window.innerWidth - 16);
  quoteFloat.style.cssText = `position:fixed;left:${Math.max(8, Math.min(r.left, window.innerWidth - w - 8))}px;top:${r.bottom + 6}px;width:${w}px;z-index:10050;`;
  const pr = quoteFloat.getBoundingClientRect();
  if (pr.bottom > window.innerHeight - 8) {
    quoteFloat.style.top = `${Math.max(8, r.top - pr.height - 6)}px`;
  }
}

function extrasHtml(t) {
  let h = "";
  if (t.video) {
    const poster = t.video.poster || "";
    h += `<div class="im-video" data-src="${escapeHtml(t.video.src || "")}" data-tweet="${escapeHtml(t.id || "")}">${
      poster ? `<img src="${escapeHtml(poster)}" alt="" loading="lazy">` : `<div class="im-video-fallback"></div>`
    }<span class="im-video-play">${ICONS.play}</span></div>`;
  } else if (t.linkCard?.href || t.linkCard?.title) {
    const c = t.linkCard;
    h += `<div class="im-link-card" data-href="${escapeHtml(c.href || "")}">${
      c.img ? `<img class="im-link-thumb" src="${escapeHtml(c.img)}" alt="" loading="lazy">` : ""
    }<div class="im-link-main"><span class="im-link-title">${escapeHtml(c.title || c.href || "")}</span><span class="im-link-domain">${escapeHtml(c.domain || "")}</span></div></div>`;
  }
  if (t.poll?.length) {
    h += `<div class="im-poll"><div class="im-poll-hint">投票 · 只读</div><div class="im-poll-opts">${t.poll.map((o) => `<div class="im-poll-opt"><span class="im-poll-check">${ICONS.check}</span><span>${escapeHtml(o)}</span></div>`).join("")}</div></div>`;
  }
  return h;
}

function snip(s) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > 64 ? [...t].slice(0, 64).join("") + "…" : t;
}

/** 气泡要渲染的图片组：有视频时剔除与海报相同的封面，防止同一张图重复出现 */
function photosOf(t) {
  return (t.photos || []).filter((src) => !(t.video && (src === t.video.poster || /video_thumb|amplify_video/.test(src)))).slice(0, 4);
}

function msgHtml(t, forceReal) {
  const side = t.mine ? "me" : "other";
  const ava = personAvatarHtml("im-msg-avatar", t.name, t.avatar, t.id || t.handle, !!forceReal);
  const ps = photosOf(t);
  const as = t.alts || [];
  const photos = ps.length
    ? `<div class="im-msg-photos im-photos-${ps.length}">${ps.map((src, i) => `<div class="im-photo">${as[i] ? '<span class="im-alt-badge">ALT</span>' : ""}<img src="${escapeHtml(src)}" alt="" loading="lazy"></div>`).join("")}</div>`
    : "";
  const quote = t.quote ? quoteHtml(t.quote) : "";
  const replyQuote = t.replyRef
    ? `<div class="im-reply-quote" role="link" tabindex="0" data-href="${escapeHtml(t.replyRef.href || "")}" data-handle="@${escapeHtml(t.replyRef.handle || "")}">
        <span class="im-reply-quote-tag">回复</span>
        <span class="im-reply-quote-main">
          <span class="im-quote-name">@${escapeHtml(t.replyRef.handle || "")}</span>
          <span class="im-quote-body">${escapeHtml(t.replyRef.snippet || "")}</span>
        </span>
      </div>`
    : "";
  const long = t.isNote || (t.text || "").length > 240;
  const body = `<div class="im-tw-body${long ? " im-longtext" : ""}"${long ? ' title="点击展开全部"' : ""}>${t.html ? t.html : escapeHtml(t.text || "").replace(/\n/g, "<br>")}</div>`;
  const extras = extrasHtml(t);
  const handle = t.handle || "";
  const context = t.reposter
    ? `<div class="im-repost-tag">${ICONS.repost}<span><b>${escapeHtml(t.reposter)}</b> 转发了</span></div>`
    : "";
  const livetag = t.live ? `<div class="im-live-tag"><span class="im-live-dot"></span><span>LIVE · 实时音频</span></div>` : "";
  const nameMark = t.verified ? ICONS.verified : "";
  // 列表页：时间紧跟名字右侧；详情（forceReal）维持时间在气泡下方
  const metaHtml = `<span class="im-msg-meta"><span>${escapeHtml(fmtXTime(t.datetime, t.time))}${t.threadIdx ? ` · 线程 ${t.threadIdx}` : ""}</span></span>`;
  // X 自带翻译跟随现状；可切换时给一个「原文/译文」按钮（点击切原生翻译状态后由 sync 刷新该条）
  const translated = t.translated ?? "";
  // 外语推文给「译文」按钮（点击自管理，见 toggleTranslation）；中文推文不显示
  const transBtnHtml = transWanted(t) !== undefined
    ? `<button type="button" class="im-msg-tool im-msg-trans" data-action="trans">译文</button>`
    : "";
  const statsSummary = [
    t.replyCount ? `评论 ${t.replyCount}` : "",
    t.rtCount ? `收藏 ${t.rtCount}` : "",
    t.likeCount ? `点赞 ${t.likeCount}` : "",
    t.bookmarkCount ? `书签 ${t.bookmarkCount}` : "",
    t.viewCount ? `浏览 ${t.viewCount}` : "",
  ].filter(Boolean).join(" · ");
  const bubbleTitle = statsSummary ? ` title="${escapeHtml(statsSummary)}"` : (long ? ' title="点击展开全部"' : "");
  const followTag = (t.canFollow && !t.mine && handle)
    ? `<button type="button" class="im-msg-follow${t.isFollowing ? " on" : ""}" data-id="${escapeHtml(t.id)}" data-handle="${escapeHtml(handle)}" title="${t.isFollowing ? "已关注" : "关注"} @${escapeHtml(handle)}">${t.isFollowing ? "已关注" : "+ 关注"}</button>`
    : "";

  return `<div class="im-msg im-msg-${side}${t.isSub || t.repliedTo ? " is-sub" : ""}" data-id="${escapeHtml(t.id)}" data-href="${escapeHtml(t.href || "")}" data-handle="${escapeHtml(handle)}" data-profile="${escapeHtml(t.profileHref || "")}" data-translated="${escapeHtml(String(translated))}">
    ${ava}
    <div class="im-msg-content">
      <span class="im-msg-head">
        <span class="im-msg-name" title="@${escapeHtml(handle)}" style="cursor:pointer">${escapeHtml(t.name)}${nameMark}</span>${followTag}${forceReal ? "" : metaHtml}
      </span>
      <div class="im-msg-bubble"${bubbleTitle}>${context}${livetag}${replyQuote}${quote}${body}${extras}${photos}</div>
      ${forceReal ? metaHtml : ""}
      <div class="im-msg-tools">
        ${transBtnHtml}
        <button type="button" class="im-msg-tool" data-action="thread" data-name="评论" data-count="${escapeHtml(t.replyCount || "")}">${ICONS.msg}${t.replyCount ? `<span class="im-tool-num">${escapeHtml(t.replyCount)}</span>` : ""}</button>
        <button type="button" class="im-msg-tool${t.retweeted ? " is-retweeted" : ""}" data-action="repost" data-name="收藏" data-count="${escapeHtml(t.rtCount || "")}">${ICONS.repost}${t.rtCount ? `<span class="im-tool-num">${escapeHtml(t.rtCount)}</span>` : ""}</button>
        <button type="button" class="im-msg-tool${t.liked ? " is-liked" : ""}" data-action="like" data-name="点赞" data-count="${escapeHtml(t.likeCount || "")}">${t.liked ? ICONS.heartFilled : ICONS.plus}${t.likeCount ? `<span class="im-tool-num">${escapeHtml(t.likeCount)}</span>` : ""}</button>
        ${t.viewCount ? `<button type="button" class="im-msg-tool" data-action="analytics" data-name="浏览" data-count="${escapeHtml(t.viewCount)}">${ICONS.chart}<span class="im-tool-num">${escapeHtml(t.viewCount)}</span></button>` : ""}
      </div>
    </div>
  </div>`;
}

export function syncChatMessages() {
  // status 路由：中栏冻结，评论区走右侧抽屉（返回时中栏原样保留，不刷新）
  if (syncDetailDrawer()) return;
  const panel = document.querySelector(".im-chat-panel");
  if (panel) syncChatHeader(panel);
  const body = document.querySelector(".im-feed-col");
  if (!body) return;

  if (routeKind() === "search") {
    syncSceneCards(body);
    syncSearchFeed(body);
    return;
  }

  if (routeKind() === "profile" || getChatId() === "profile") {
    syncSceneCards(body);
    syncProfileFeed(body);
    return;
  }

  syncSceneCards(body);

  const tweets = [];
  let prevT = null;
  let threadRun = 0;
  // 互相回复引用：记录各作者最近一条已见的推文，回复的回复提示 @handle 命中同作者时生成引用块
  const ownerLast = new Map();
  for (const article of allTweetArticles()) {
    const t = extractTweet(article);
    if (!t) continue;
    if (seen.has(t.id)) {
      // 已渲染消息需要重建的条件：① 翻译状态翻转；② 图 lazy 到位后补渲染（首次 sync 时 article 的 img src 常为空导致漏图）；
      // ③ 头像从色块换成真图。图片比对必须用与渲染一致的过滤结果（视频帖剔除海报重复项），否则视频帖会每次同步误判重建
      const oldEl = body.querySelector(`.im-msg[data-id="${t.id}"]`);
      let needRebuild = false;
      if (oldEl) {
        if (t.translated !== undefined && oldEl.dataset.translated !== String(t.translated ? "1" : "0")) needRebuild = true;
        const ps = photosOf(t);
        if (!needRebuild && ps.length) {
          const dom = [...(oldEl.querySelectorAll(".im-msg-photos img"))].map((i) => i.src || "");
          if (dom.length !== ps.length || !dom.every((s, i) => s === ps[i])) needRebuild = true;
        }
        if (!needRebuild && t.avatar && oldEl.querySelector(".im-msg-avatar.is-text-avatar, .im-msg-avatar.is-grid-mask")) {
          needRebuild = true;
        }
        if (needRebuild) {
          oldEl.outerHTML = msgHtml(t);
          prevT = t;
        } else {
          syncMsgToolStates(oldEl, t);
        }
      }
      continue;
    }
    seen.add(t.id);
    if (t.replyTo && ownerLast.has(t.replyTo)) {
      const ref = ownerLast.get(t.replyTo);
      if (ref) {
        t.replyRef = {
          handle: t.replyTo,
          href: ref.href || "",
          snippet: ref.snippet,
        };
      }
    }
    const last = ownerLast.get(t.handle || "");
    ownerLast.set(t.handle || "", {
      href: t.href || "",
      snippet: last?.snippet || snip(t.text || ""),
    });
    // 线程序号：同作者 90 秒内连续推文 → 标记第 N 条（启发式，不依赖不稳定的原生 selector）
    t.threadIdx = 0;
    if (prevT && t.handle && t.handle === prevT.handle) {
      const d0 = prevT.datetime ? new Date(prevT.datetime).getTime() : 0;
      const d1 = t.datetime ? new Date(t.datetime).getTime() : 0;
      if (d0 && d1 && d1 >= d0 && d1 - d0 < 90_000) threadRun += 1;
      else threadRun = 0;
    } else {
      threadRun = 0;
    }
    if (threadRun > 0) t.threadIdx = threadRun + 1;
    tweets.push(t);
    prevT = t;
  }
  if (!tweets.length && !body.childElementCount) {
    const hasLoginBtn = !!document.querySelector(".login-btn, [class*='login-btn']");
    body.innerHTML = `<div class="im-chat-empty">
      <p>正在同步小红书推荐流…</p>
      ${hasLoginBtn ? '<p style="font-size:12px;color:var(--im-text-3);margin-top:6px;">检测到未登录状态，点击下方按钮唤起登录：</p><button type="button" class="im-guide-btn" data-act="relogin" style="margin-top:8px;">呼起登录</button>' : '<p style="font-size:12px;color:var(--im-text-3);margin-top:6px;">如果一直无内容，请点击刷新重试或检查小红书登录状态</p><button type="button" class="im-guide-btn" data-act="refresh-feed" style="margin-top:8px;">刷新信息流</button>'}
    </div>`;
    body.querySelector('[data-act="relogin"]')?.addEventListener("click", () => {
      if (!clickNativeLogin()) toast("未找到登录入口，请检查网络或刷新");
    });
    body.querySelector('[data-act="refresh-feed"]')?.addEventListener("click", () => {
      refreshHomeFeed();
    });
    return;
  }
  if (!tweets.length) return;
  body.querySelector(".im-chat-empty")?.remove();
  const me = nativeProfilePath();
  for (const t of tweets) {
    if (me && t.handle && me.replace(/^\//, "") === t.handle) t.mine = true;
    body.insertAdjacentHTML("beforeend", msgHtml(t));
  }
  if (body.scrollHeight <= body.clientHeight + 120) loadMoreFeed();
}

function nearBottom(el) {
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 320;
}

// 触底后的延迟同步合并：滚轮高频触发时只保留一个待执行定时器
let _feedSyncTimer = 0;
function scheduleFeedSync() {
  if (_feedSyncTimer) return;
  _feedSyncTimer = window.setTimeout(() => {
    _feedSyncTimer = 0;
    syncChatMessages();
  }, 700);
}

function onChatScroll(e) {
  hideQuoteFloat();
  if (nearBottom(e.currentTarget)) {
    loadMoreFeed();
    scheduleFeedSync();
  }
}

function onChatWheel(e) {
  if (e.deltaY <= 0) return;
  if (nearBottom(e.currentTarget)) {
    loadMoreFeed();
    scheduleFeedSync();
  }
}

let detailRenderedHref = "";
let detailPrevUrl = ""; // 打开详情前的列表 URL，关闭时还原
let lastThreadDetail = null; // 最近打开详情线程的 { id, detail }，供引用视频零请求复用

function applyCommentBatch(noteId, replies) {
  if (!replies?.length) return 0;
  const detail = lastThreadDetail?.id === noteId ? lastThreadDetail.detail : { pin: lastThreadDetail?.detail?.pin || null, replies: [] };
  if (!detail.pin && lastThreadDetail?.detail?.pin) detail.pin = lastThreadDetail.detail.pin;
  const prevList = detail.replies || [];

  // 检测是否有新评论加入 或 已有评论成功解析出真实头像
  let hasAvatarUpdate = false;
  if (replies.length === prevList.length) {
    for (let i = 0; i < replies.length; i++) {
      if (replies[i].avatar && !prevList[i]?.avatar) {
        hasAvatarUpdate = true;
        break;
      }
    }
  }

  if (replies.length <= prevList.length && !hasAvatarUpdate) return prevList.length;
  detail.replies = replies;
  lastThreadDetail = { id: noteId, detail };
  renderDetailThread(detail);
  return replies.length;
}

async function fillCommentsLater(noteId, el, loadedHref) {
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 260));
    if (detailView !== el || !el.classList.contains("is-open") || !detailRenderedHref?.includes(noteId)) return;
    if (i === 1) expandCommentSoft();
    const replies = collectNoteComments(noteId);
    if (replies.length) {
      applyCommentBatch(noteId, replies);
      // 如果所有已解析出来的评论都已持有头像且已至少轮询 2 轮，提前收工
      const allHaveAvatar = replies.every((r) => !!r.avatar);
      if (allHaveAvatar && i >= 2) break;
    }
  }
  if (lastThreadDetail?.id === noteId) {
    lastThreadDetail.detail.commentsPending = false;
    if (!(lastThreadDetail.detail.replies || []).length) renderDetailThread(lastThreadDetail.detail);
  }
  void loadedHref;
}

function expandCommentSoft() {
  loadMoreComments(lastThreadDetail?.id).then((replies) => {
    if (lastThreadDetail?.id) applyCommentBatch(lastThreadDetail.id, replies);
  }).catch(() => {});
}

let commentPaging = false;
async function pageMoreComments() {
  const noteId = lastThreadDetail?.id;
  if (!noteId || commentPaging) return;
  commentPaging = true;
  if (lastThreadDetail.detail) {
    lastThreadDetail.detail.commentsPaging = true;
    const hint = detailView?.querySelector(".im-detail-loadmore");
    if (hint) hint.textContent = "正在加载更多评论…";
  }
  try {
    const replies = await loadMoreComments(noteId);
    applyCommentBatch(noteId, replies);
  } catch { /* ignore */ }
  if (lastThreadDetail?.detail) lastThreadDetail.detail.commentsPaging = false;
  const hint = detailView?.querySelector(".im-detail-loadmore");
  if (hint) hint.textContent = "下滑加载更多评论";
  commentPaging = false;
}

function onDetailBodyScroll(e) {
  hideQuoteFloat();
  if (nearBottom(e.currentTarget)) pageMoreComments();
}

/** 主贴卡片 + 评论气泡（对齐 X 详情抽屉） */
function renderDetailThread(detail) {
  const el = detailView;
  if (!el) return;
  const dbody = el.querySelector(".im-detail-body");
  if (!dbody) return;
  let pt = detail.pin;

  // 防御盾：若原有 dbody 已有良好正文/作者/头像，而异步返回的 pt 为兜底空壳，继承已有良好数据
  const existingPin = dbody.querySelector(".im-thread-pin");
  if (existingPin) {
    const exName = existingPin.querySelector(".im-thread-pin-name")?.textContent?.trim() || "";
    const exText = existingPin.querySelector(".im-thread-pin-body")?.textContent?.trim() || "";
    const exAva = existingPin.querySelector(".im-thread-pin-avatar img")?.getAttribute("src") || "";
    const exPhotos = Array.from(existingPin.querySelectorAll(".im-thread-pin-photos img")).map((i) => i.src).filter(Boolean);
    if (!pt) {
      pt = {
        name: exName,
        text: exText,
        avatar: exAva,
        photos: exPhotos,
        handle: existingPin.dataset.handle || "",
      };
    } else {
      if ((!pt.name || pt.name === "小红书薯友") && exName && exName !== "小红书薯友") pt.name = exName;
      if ((!pt.text || pt.text === "分享了一篇笔记") && exText && exText !== "分享了一篇笔记") pt.text = exText;
      if (!pt.avatar && exAva) pt.avatar = exAva;
      if (!pt.photos?.length && exPhotos.length) pt.photos = exPhotos;
    }
  }

  const title = el.querySelector(".im-detail-title");
  const sub = el.querySelector(".im-detail-sub");
  if (title) title.textContent = pt?.name || "推文详情";
  if (sub) sub.textContent = pt?.handle ? `@${pt.handle} · 评论区` : "评论区";
  const ownerLast = new Map();
  let html = pt ? threadPinHtml(pt) : `<div class="im-chat-empty"><p>未找到该推文</p></div>`;
  let prevT = null;
  let threadRun = 0;
  for (const t of detail.replies || []) {
    const target = t.replyTo || t.repliedTo;
    if (target) {
      const ref = ownerLast.get(target);
      t.replyRef = {
        handle: target,
        href: ref?.href || "",
        snippet: t.replyRef?.snippet || ref?.snippet || "",
      };
    }
    const last = ownerLast.get(t.handle || "");
    ownerLast.set(t.handle || "", { href: t.href || "", snippet: last?.snippet || snip(t.text || "") });
    t.threadIdx = 0;
    if (prevT && t.handle && t.handle === prevT.handle) {
      const d0 = prevT.datetime ? new Date(prevT.datetime).getTime() : 0;
      const d1 = t.datetime ? new Date(t.datetime).getTime() : 0;
      if (d0 && d1 && d1 >= d0 && d1 - d0 < 90_000) threadRun += 1;
      else threadRun = 0;
    } else {
      threadRun = 0;
    }
    if (threadRun > 0) t.threadIdx = threadRun + 1;
    html += msgHtml(t, true); // 详情内评论也强制真头像
    prevT = t;
  }
  if (!(detail.replies || []).length) {
    html += detail.commentsPending
      ? `<div class="im-detail-loading">正在加载评论区…</div>`
      : `<div class="im-chat-empty"><p>暂无评论</p></div>`;
  } else {
    html += `<div class="im-detail-loadmore">${detail.commentsPaging ? "正在加载更多评论…" : "下滑加载更多评论"}</div>`;
  }
  const keepTop = dbody.dataset.pinId && pt && dbody.dataset.pinId === pt.id ? dbody.scrollTop : 0;
  dbody.dataset.sig = pt ? pt.id : html;
  dbody.innerHTML = html;
  if (pt) {
    dbody.dataset.pinId = pt.id;
    dbody.querySelector(".im-thread-pin")?.setAttribute("data-pin-id", pt.id);
  }
  if (keepTop) dbody.scrollTop = keepTop;
}

/**
 * 进推文详情：纯前端弹覆盖层，完全不触发 X 原生路由/页面切换，因此绝无加载闪屏。
 * 主推先用列表已有数据即时显示，评论区通过 X 同源 GraphQL 拉取（唯一一次读请求），
 * 到手后整体替换。失败静默降级为「仅主推」。返回即关闭覆盖层，中栏原位置原样保留。
 */
export function openTweetDetail(href, contextEl) {
  if (!href) return;
  const statusId = String(href).match(/(?:explore|status|profile\/[^/]+)\/([a-f0-9]{24}|[a-f0-9]+)/i)?.[1]
    || String(href).match(/([a-f0-9]{24})/i)?.[1]
    || "";
  const host = document.querySelector(".im-chat-body");
  const el = host && ensureDetailView();
  if (!el) return;
  const ctx = contextEl?.closest(".im-msg");
  let pt = null;

  // 1. 如果是从列表消息气泡点击进来的，优先用已经真实渲染的气泡数据作为基底，保证 0 延迟、0 空壳
  if (ctx) {
    const avaImg = ctx.querySelector(".im-msg-avatar img, img");
    const photos = Array.from(ctx.querySelectorAll(".im-msg-photos img")).map((i) => i.src).filter(Boolean);
    const likeBtn = ctx.querySelector("[data-action='like']");
    const repostBtn = ctx.querySelector("[data-action='repost']");
    const replyBtn = ctx.querySelector("[data-action='thread']");
    pt = {
      id: statusId || ctx.dataset.id,
      name: ctx.querySelector(".im-msg-name")?.textContent?.trim() || "笔记",
      handle: ctx.dataset.handle || "",
      profileHref: ctx.dataset.profile || "",
      avatar: avaImg?.getAttribute("src") || avaImg?.src || "",
      text: ctx.querySelector(".im-tw-body")?.textContent?.trim() || "",
      photos,
      images: photos,
      likeCount: likeBtn?.querySelector(".im-tool-num")?.textContent || "",
      rtCount: repostBtn?.querySelector(".im-tool-num")?.textContent || "",
      replyCount: replyBtn?.querySelector(".im-tool-num")?.textContent || "",
      liked: likeBtn?.classList.contains("is-liked") || false,
      retweeted: repostBtn?.classList.contains("is-retweeted") || false,
      href: ctx.dataset.href || href,
      time: ctx.querySelector(".im-msg-meta")?.textContent?.trim() || "",
    };
  }

  // 2. 从原生卡片或状态缓存补充/强化正文与图组
  if (statusId) {
    const art = findTweetArticle(statusId);
    const fromArt = art && extractTweet(art);
    if (fromArt) {
      if (!pt) {
        pt = fromArt;
      } else {
        if (!pt.name || pt.name === "小红书薯友") pt.name = fromArt.name;
        if (!pt.avatar) pt.avatar = fromArt.avatar;
        if (!pt.handle || pt.handle === "小红书薯友") pt.handle = fromArt.handle;
        if (!pt.profileHref) pt.profileHref = fromArt.profileHref;
        if (!pt.photos?.length && fromArt.photos?.length) pt.photos = fromArt.photos;
        if ((!pt.text || pt.text === "分享了一篇笔记") && fromArt.text) pt.text = fromArt.text;
      }
    }
    const cached = getCachedNoteFromState(statusId);
    if (cached) {
      const fromCached = pinFromNoteObject(cached, statusId);
      if (fromCached) {
        if (!pt) {
          pt = fromCached;
        } else {
          if (fromCached.text && fromCached.text.length > (pt.text?.length || 0)) pt.text = fromCached.text;
          if (fromCached.photos?.length && fromCached.photos.length > (pt.photos?.length || 0)) pt.photos = fromCached.photos;
          if (!pt.avatar && fromCached.avatar) pt.avatar = fromCached.avatar;
        }
      }
    }
  }
  setDetailOpen(true);
  if (!detailPrevUrl) detailPrevUrl = location.pathname + location.search;
  detailRenderedHref = pt?.href || href;
  console.info(`[xhs-im:detail-open] path=${location.pathname} href=${detailRenderedHref} statusId=${statusId} pt=${!!pt}`);
  const dbody = el.querySelector(".im-detail-body");
  const title = el.querySelector(".im-detail-title");
  const sub = el.querySelector(".im-detail-sub");
  if (title) title.textContent = pt?.name || pt?.author?.name || "笔记详情";
  if (sub) sub.textContent = pt?.author?.name ? `@${pt.author.name} · 评论区` : (pt?.handle ? `@${pt.handle} · 评论区` : "评论区");
  dbody.dataset.sig = statusId || href;
  dbody.innerHTML =
    (pt ? threadPinHtml(pt) : `<div class="im-chat-empty"><p>正在加载笔记…</p></div>`) +
    `<div class="im-detail-loading">正在加载评论区…</div>`;
  if (statusId) {
    const loadedHref = pt?.href || href;
    const failView = (what) => {
      console.warn(`[xhs-im:detail] 加载失败(${what}) id=${statusId}`);
      // 已有主贴卡片则保留，只把评论区加载区替换为失败提示；否则整页失败视图
      const loading = dbody.querySelector(".im-detail-loading");
      if (loading) {
        loading.outerHTML = `<div class="im-chat-empty"><p>评论区加载失败（${escapeHtml(what)}）</p></div>`;
        return;
      }
      dbody.innerHTML = `<div class="im-chat-empty"><p>该笔记加载失败（${escapeHtml(what)}）</p>
        <a class="im-native-open" href="${escapeHtml(href || `/explore/${statusId}`)}" target="_blank" rel="noopener">在小红书打开</a></div>`;
    };
    fetchTweetDetail(statusId)
      .then((detail) => {
        if (detailView !== el || !el.classList.contains("is-open") || (detailRenderedHref !== loadedHref && !detailRenderedHref.includes(statusId))) return;
        if (detail) {
          try {
            lastThreadDetail = { id: statusId, detail };
            renderDetailThread(detail);
            if (!(detail.replies || []).length) fillCommentsLater(statusId, el, loadedHref);
          } catch (err) {
            console.error("[xhs-im:detail] 渲染评论抛异常:", err);
            failView("渲染异常");
          }
        } else {
          failView("接口未返回");
        }
      })
      .catch((err) => {
        console.error("[xhs-im:detail] fetch 评论抛异常:", err && err.message);
        failView("网络/接口错误");
      });
  }
  // 不再改写地址栏：小红书无 xsec_token 的 /explore/:id 直链会被风控拦成 404 验证页，
  // 详情纯前端抽屉，URL 保持列表路由不变。
  void statusId;
}

export { openTweetDetail as openNoteDetail };

function syncMsgToolStates(el, t) {
  if (!el || !t) return;
  const likeBtn = el.querySelector('[data-action="like"]');
  if (likeBtn && t.liked !== undefined) {
    const isLiked = !!t.liked;
    if (likeBtn.classList.contains("is-liked") !== isLiked) {
      likeBtn.classList.toggle("is-liked", isLiked);
      likeBtn.innerHTML = (isLiked ? ICONS.heartFilled : ICONS.plus) + (t.likeCount ? `<span class="im-tool-num">${escapeHtml(t.likeCount)}</span>` : "");
    }
    if (t.likeCount && likeBtn.dataset.count !== t.likeCount) {
      likeBtn.dataset.count = t.likeCount;
      const num = likeBtn.querySelector(".im-tool-num");
      if (num) num.textContent = t.likeCount;
    }
  }
  const rtBtn = el.querySelector('[data-action="repost"]');
  if (rtBtn && t.retweeted !== undefined) {
    rtBtn.classList.toggle("is-retweeted", !!t.retweeted);
    if (t.rtCount && rtBtn.dataset.count !== t.rtCount) {
      rtBtn.dataset.count = t.rtCount;
      const num = rtBtn.querySelector(".im-tool-num");
      if (num) num.textContent = t.rtCount;
    }
  }
  const bmBtn = el.querySelector('[data-action="bookmark"]');
  if (bmBtn && t.bookmarked !== undefined) {
    const isBm = !!t.bookmarked;
    if (bmBtn.classList.contains("is-bookmarked") !== isBm) {
      bmBtn.classList.toggle("is-bookmarked", isBm);
      bmBtn.innerHTML = (isBm ? ICONS.bookmarkFill : ICONS.bookmark) + (t.bookmarkCount ? `<span class="im-tool-num">${escapeHtml(t.bookmarkCount)}</span>` : "");
    }
    if (t.bookmarkCount && bmBtn.dataset.count !== t.bookmarkCount) {
      bmBtn.dataset.count = t.bookmarkCount;
      const num = bmBtn.querySelector(".im-tool-num");
      if (num) num.textContent = t.bookmarkCount;
    }
  }
}

async function handleToolLike(btn, id, art) {
  if (!id) return;
  const wasLiked = btn.classList.contains("is-liked");
  const nextLiked = !wasLiked;
  const prevCount = btn.dataset.count || "";

  // 1. 立即乐观更新 UI
  btn.classList.toggle("is-liked", nextLiked);
  const curVal = parseCountValue(prevCount);
  const optVal = Math.max(0, curVal + (nextLiked ? 1 : -1));
  const optCount = optVal > 0 ? (curVal > 0 ? formatCount(optVal) : "1") : "";
  btn.dataset.count = optCount;
  btn.innerHTML = (nextLiked ? ICONS.heartFilled : ICONS.plus) + (optCount ? `<span class="im-tool-num">${escapeHtml(optCount)}</span>` : "");
  toast(nextLiked ? "已点赞" : "已取消点赞");

  // 2. 调用真实接口 / 原生操作并拿到真实数量
  const res = await toggleLike(id, wasLiked, art);
  if (res.ok) {
    if (res.count !== undefined && res.count !== "") {
      btn.dataset.count = res.count;
      const numSpan = btn.querySelector(".im-tool-num");
      if (numSpan) numSpan.textContent = res.count;
      else btn.insertAdjacentHTML("beforeend", `<span class="im-tool-num">${escapeHtml(res.count)}</span>`);
    }
    if (res.liked !== undefined) {
      btn.classList.toggle("is-liked", res.liked);
      btn.querySelector("svg")?.remove();
      btn.insertAdjacentHTML("afterbegin", res.liked ? ICONS.heartFilled : ICONS.plus);
    }
  } else {
    // 失败回滚
    btn.classList.toggle("is-liked", wasLiked);
    btn.dataset.count = prevCount;
    btn.innerHTML = (wasLiked ? ICONS.heartFilled : ICONS.plus) + (prevCount ? `<span class="im-tool-num">${escapeHtml(prevCount)}</span>` : "");
    toast("点赞失败，请重试");
  }
}

async function handleToolRetweet(btn, id, art) {
  if (!id) return;
  const wasRt = btn.classList.contains("is-retweeted");
  const nextRt = !wasRt;
  const prevCount = btn.dataset.count || "";

  btn.classList.toggle("is-retweeted", nextRt);
  const curVal = parseCountValue(prevCount);
  const optVal = Math.max(0, curVal + (nextRt ? 1 : -1));
  const optCount = optVal > 0 ? (curVal > 0 ? formatCount(optVal) : "1") : "";
  btn.dataset.count = optCount;
  btn.innerHTML = ICONS.repost + (optCount ? `<span class="im-tool-num">${escapeHtml(optCount)}</span>` : "");
  toast(nextRt ? "已转推" : "已取消转推");

  const res = await toggleRetweet(id, wasRt, art);
  if (res.ok) {
    if (res.count !== undefined && res.count !== "") {
      btn.dataset.count = res.count;
      const numSpan = btn.querySelector(".im-tool-num");
      if (numSpan) numSpan.textContent = res.count;
      else btn.insertAdjacentHTML("beforeend", `<span class="im-tool-num">${escapeHtml(res.count)}</span>`);
    }
    if (res.retweeted !== undefined) {
      btn.classList.toggle("is-retweeted", res.retweeted);
    }
  } else {
    btn.classList.toggle("is-retweeted", wasRt);
    btn.dataset.count = prevCount;
    btn.innerHTML = ICONS.repost + (prevCount ? `<span class="im-tool-num">${escapeHtml(prevCount)}</span>` : "");
    toast("转推失败，请重试");
  }
}

async function handleToolBookmark(btn, id, art) {
  if (!id) return;
  const wasBm = btn.classList.contains("is-bookmarked");
  const nextBm = !wasBm;
  const prevCount = btn.dataset.count || "";

  btn.classList.toggle("is-bookmarked", nextBm);
  const curVal = parseCountValue(prevCount);
  const optVal = Math.max(0, curVal + (nextBm ? 1 : -1));
  const optCount = optVal > 0 ? (curVal > 0 ? formatCount(optVal) : "1") : "";
  btn.dataset.count = optCount;
  btn.innerHTML = (nextBm ? ICONS.bookmarkFill : ICONS.bookmark) + (optCount ? `<span class="im-tool-num">${escapeHtml(optCount)}</span>` : "");
  toast(nextBm ? "已添加书签" : "已移出书签");

  const res = await toggleBookmark(id, wasBm, art);
  if (res.ok) {
    if (res.count !== undefined && res.count !== "") {
      btn.dataset.count = res.count;
      const numSpan = btn.querySelector(".im-tool-num");
      if (numSpan) numSpan.textContent = res.count;
      else btn.insertAdjacentHTML("beforeend", `<span class="im-tool-num">${escapeHtml(res.count)}</span>`);
    }
    if (res.bookmarked !== undefined) {
      btn.classList.toggle("is-bookmarked", res.bookmarked);
      btn.querySelector("svg")?.remove();
      btn.insertAdjacentHTML("afterbegin", res.bookmarked ? ICONS.bookmarkFill : ICONS.bookmark);
    }
  } else {
    btn.classList.toggle("is-bookmarked", wasBm);
    btn.dataset.count = prevCount;
    btn.innerHTML = (wasBm ? ICONS.bookmarkFill : ICONS.bookmark) + (prevCount ? `<span class="im-tool-num">${escapeHtml(prevCount)}</span>` : "");
  }
}

async function handlePinLike(btn, id, art) {
  if (!id) return;
  const wasLiked = btn.classList.contains("is-liked");
  const nextLiked = !wasLiked;
  const prevCount = btn.dataset.count || "";

  btn.classList.toggle("is-liked", nextLiked);
  const curVal = parseCountValue(prevCount);
  const optVal = Math.max(0, curVal + (nextLiked ? 1 : -1));
  const optCount = optVal > 0 ? (curVal > 0 ? formatCount(optVal) : "1") : "";
  btn.dataset.count = optCount;
  const span = btn.querySelector("span");
  if (span) span.textContent = optCount ? `点赞 ${optCount}` : "点赞";
  btn.querySelector("svg")?.remove();
  btn.insertAdjacentHTML("afterbegin", nextLiked ? ICONS.heartFilled : ICONS.plus);
  toast(nextLiked ? "已点赞" : "已取消点赞");

  const res = await toggleLike(id, wasLiked, art);
  if (res.ok) {
    if (res.count !== undefined && res.count !== "") {
      btn.dataset.count = res.count;
      if (span) span.textContent = `点赞 ${res.count}`;
    }
    if (res.liked !== undefined) {
      btn.classList.toggle("is-liked", res.liked);
      btn.querySelector("svg")?.remove();
      btn.insertAdjacentHTML("afterbegin", res.liked ? ICONS.heartFilled : ICONS.plus);
    }
  } else {
    btn.classList.toggle("is-liked", wasLiked);
    btn.dataset.count = prevCount;
    if (span) span.textContent = prevCount ? `点赞 ${prevCount}` : "点赞";
    btn.querySelector("svg")?.remove();
    btn.insertAdjacentHTML("afterbegin", wasLiked ? ICONS.heartFilled : ICONS.plus);
    toast("点赞失败，请重试");
  }
}

async function handlePinRetweet(btn, id, art) {
  if (!id) return;
  const wasRt = btn.classList.contains("is-retweeted");
  const nextRt = !wasRt;
  const prevCount = btn.dataset.count || "";

  btn.classList.toggle("is-retweeted", nextRt);
  const curVal = parseCountValue(prevCount);
  const optVal = Math.max(0, curVal + (nextRt ? 1 : -1));
  const optCount = optVal > 0 ? (curVal > 0 ? formatCount(optVal) : "1") : "";
  btn.dataset.count = optCount;
  const span = btn.querySelector("span");
  if (span) span.textContent = optCount ? `收藏 ${optCount}` : "转推";
  toast(nextRt ? "已转推" : "已取消转推");

  const res = await toggleRetweet(id, wasRt, art);
  if (res.ok) {
    if (res.count !== undefined && res.count !== "") {
      btn.dataset.count = res.count;
      if (span) span.textContent = `收藏 ${res.count}`;
    }
    if (res.retweeted !== undefined) {
      btn.classList.toggle("is-retweeted", res.retweeted);
    }
  } else {
    btn.classList.toggle("is-retweeted", wasRt);
    btn.dataset.count = prevCount;
    if (span) span.textContent = prevCount ? `收藏 ${prevCount}` : "转推";
    toast("转推失败，请重试");
  }
}

async function handlePinBookmark(btn, id, art) {
  if (!id) return;
  const wasBm = btn.classList.contains("is-bookmarked");
  const nextBm = !wasBm;
  const prevCount = btn.dataset.count || "";

  btn.classList.toggle("is-bookmarked", nextBm);
  const curVal = parseCountValue(prevCount);
  const optVal = Math.max(0, curVal + (nextBm ? 1 : -1));
  const optCount = optVal > 0 ? (curVal > 0 ? formatCount(optVal) : "1") : "";
  btn.dataset.count = optCount;
  const span = btn.querySelector("span");
  if (span) span.textContent = optCount ? `书签 ${optCount}` : "书签";
  btn.querySelector("svg")?.remove();
  btn.insertAdjacentHTML("afterbegin", nextBm ? ICONS.bookmarkFill : ICONS.bookmark);
  toast(nextBm ? "已添加书签" : "已移出书签");

  const res = await toggleBookmark(id, wasBm, art);
  if (res.ok) {
    if (res.count !== undefined && res.count !== "") {
      btn.dataset.count = res.count;
      if (span) span.textContent = `书签 ${res.count}`;
    }
    if (res.bookmarked !== undefined) {
      btn.classList.toggle("is-bookmarked", res.bookmarked);
      btn.querySelector("svg")?.remove();
      btn.insertAdjacentHTML("afterbegin", res.bookmarked ? ICONS.bookmarkFill : ICONS.bookmark);
    }
  } else {
    btn.classList.toggle("is-bookmarked", wasBm);
    btn.dataset.count = prevCount;
    if (span) span.textContent = prevCount ? `书签 ${prevCount}` : "书签";
    btn.querySelector("svg")?.remove();
    btn.insertAdjacentHTML("afterbegin", wasBm ? ICONS.bookmarkFill : ICONS.bookmark);
  }
}

function onMsgClick(e) {
  const profTab = e.target.closest(".im-profile-tab-btn");
  if (profTab) {
    e.preventDefault();
    e.stopPropagation();
    const idx = parseInt(profTab.dataset.tabIdx, 10);
    const nativeTabs = document.querySelectorAll(".xhs-user-page-primary-tabs .reds-tab-item, .user-page-sticky .reds-tab-item");
    if (nativeTabs[idx]) {
      nativeTabs[idx].click();
      const body = document.querySelector(".im-chat-body");
      if (body) {
        body.querySelectorAll(".im-msg, .im-chat-empty").forEach((el) => el.remove());
      }
    }
    return;
  }
  const nativeLink = e.target.closest(".im-tw-body a");
  if (nativeLink) return; // 正文内 #话题/@ 等保留原生 SPA 跳转
  const extLink = e.target.closest(".im-thread-pin-body a, .im-quote-body a, .im-quote-pop-body a");
  if (extLink) return; // 详情主推/引用卡内成链的 URL：默认新标签打开
  const guideAct = e.target.closest("[data-guide]");
  if (guideAct) {
    navigateX(guideAct.dataset.guide);
    return;
  }
  const media = e.target.closest(".im-msg-photos img, .im-msg-bubble > img, .im-thread-pin-photos img");
  if (media) {
    // 多图帖：收集所在图片组全部 src，主推/消息共用同一规则；单图退化为原来行为
    const group = media.closest(".im-msg-photos, .im-thread-pin-photos");
    const photos = group ? [...group.querySelectorAll("img")].map((i) => i.src || "").filter(Boolean) : [];
    openImImageModal(media.src, photos);
    return;
  }
  const longtext = e.target.closest(".im-longtext");
  if (longtext) {
    longtext.classList.toggle("is-open");
    return;
  }
  const video = e.target.closest(".im-video");
  if (video) {
    e.stopPropagation();
    if (video.classList.contains("is-playing") && e.target.closest("button, [role='button'], [role='slider'], input")) return;
    playInlineVideo(video, {
      src: video.dataset.src || "",
      poster: video.querySelector("img")?.src || "",
      tweetId: video.dataset.tweet || "",
    });
    return;
  }
  const linkCard = e.target.closest(".im-link-card");
  if (linkCard) {
    const href = linkCard.dataset.href;
    if (href) { window.open(href, "_blank", "noopener"); return; }
    e.stopPropagation();
    return;
  }
  const replyQuote = e.target.closest(".im-reply-quote");
  if (replyQuote) {
    e.preventDefault();
    e.stopPropagation();
    const href = replyQuote.dataset.href || "";
    openTweetDetail(href, replyQuote);
    return;
  }
  const qVideo = e.target.closest(".im-quote-video");
  if (qVideo) {
    e.preventDefault();
    e.stopPropagation();
    hideQuoteFloat();
    playQuoteVideo(qVideo);
    return;
  }
  const quote = e.target.closest(".im-quote");
  if (quote) {
    e.preventDefault();
    e.stopPropagation();
    hideQuoteFloat();
    openQuotedTweet(quote);
    return;
  }
  const pinFollow = e.target.closest(".im-pin-follow-btn");
  if (pinFollow) {
    const handle = pinFollow.dataset.handle;
    pinFollow.disabled = true;
    toggleFollowOnProfile().then((res) => {
      pinFollow.disabled = false;
      if (res.ok) {
        pinFollow.classList.toggle("on", res.following);
        pinFollow.textContent = res.following ? "已关注" : "+ 关注";
        toast(res.following ? `已关注 @${handle}` : `已取消关注 @${handle}`);
      } else {
        toast(res.msg || "操作失败，请重试");
      }
    });
    return;
  }
  const pinAct = e.target.closest(".im-thread-pin-act");
  if (pinAct) {
    const pinEl = pinAct.closest(".im-thread-pin");
    const pinId = pinEl?.dataset.pinId || "";
    const art = findTweetArticle(pinId) || (pinId && allTweetArticles().find((n) => (n.innerHTML || "").includes(pinId)));
    if (pinAct.dataset.act === "open") {
      const a = art?.querySelector('a[href*="/explore/"], a[href*="/discovery/item/"]');
      openTweetDetail(a?.getAttribute("href") || `/explore/${pinId}`, pinEl);
    } else if (pinAct.dataset.act === "trans") {
      // 详情主推 X 翻译接口自管理切换（原文/译文本地翻转）
      toggleTranslation(pinAct.closest(".im-thread-pin") || pinEl, pinId);
    } else if (pinAct.dataset.act === "like") {
      handlePinLike(pinAct, pinId, art);
    } else if (pinAct.dataset.act === "repost") {
      handlePinRetweet(pinAct, pinId, art);
    } else if (pinAct.dataset.act === "bookmark") {
      handlePinBookmark(pinAct, pinId, art);
    }
    return;
  }
  const msgFollow = e.target.closest(".im-msg-follow");
  if (msgFollow) {
    e.preventDefault();
    e.stopPropagation();
    const handle = msgFollow.dataset.handle;
    msgFollow.disabled = true;
    toggleFollowOnProfile().then((res) => {
      msgFollow.disabled = false;
      if (res.ok) {
        msgFollow.classList.toggle("on", res.following);
        msgFollow.textContent = res.following ? "已关注" : "+ 关注";
        if (res.already) {
          toast(`已在关注列表中 (@${handle})`);
        } else {
          toast(res.following ? `已关注 @${handle}` : `已取消关注 @${handle}`);
        }
      } else {
        toast(res.msg || "关注失败，请重试");
      }
    });
    return;
  }
  const person = e.target.closest(".im-msg-avatar, .im-msg-name, .im-thread-pin-avatar, .im-thread-pin-name");
  if (person) {
    const host = person.closest(".im-msg, .im-thread-pin");
    const ok = openUserProfile(host?.dataset.profile, host?.dataset.handle);
    if (!ok) toast("未找到用户主页链接");
    return;
  }
  const tool = e.target.closest(".im-msg-tool");
  if (tool) {
    const msg = tool.closest(".im-msg");
    const id = msg?.dataset.id;
    const art = findTweetArticle(id) || allTweetArticles().find((n) => (n.innerHTML || "").includes(id || ""));
    if (tool.dataset.action === "thread") {
      const href = msg?.dataset.href || (id ? `/explore/${id}` : "");
      openTweetDetail(href, msg);
    } else if (tool.dataset.action === "repost") {
      handleToolRetweet(tool, id, art);
    } else if (tool.dataset.action === "like") {
      handleToolLike(tool, id, art);
    } else if (tool.dataset.action === "bookmark") {
      handleToolBookmark(tool, id, art);
    } else if (tool.dataset.action === "trans") {
      // X 翻译接口自管理切换（不依赖原生按钮是否存在）
      toggleTranslation(tool.closest(".im-msg") || msg, id);
    } else if (tool.dataset.action === "analytics") {
      const href = msg?.dataset.href;
      if (href) window.open(`${href}/analytics`, "_blank", "noopener");
      else if (id) window.open(`https://x.com/i/status/${id}/analytics`, "_blank", "noopener");
    }
    return;
  }
  const notifSnippet = e.target.closest(".im-notify-snippet");
  if (notifSnippet && notifSnippet.dataset.href) {
    openTweetDetail(notifSnippet.dataset.href);
    return;
  }
  const userCell = e.target.closest(".im-user-cell");
  if (userCell && userCell.dataset.handle) {
    navigateX("/" + userCell.dataset.handle);
    return;
  }
  // 兜底：点击气泡空白区（非按钮/链接/头像/工具栏）→ 进入详情/评论区
  const bubbleHit = e.target.closest(".im-msg");
  if (bubbleHit && !e.target.closest("button, a, .im-msg-tools, .im-msg-name, .im-msg-avatar, .im-msg-meta")) {
    openTweetDetail(bubbleHit.dataset.href, bubbleHit);
  }
}


const searchCache = new Map();
let searchRenderedKey = "";
const searchSeen = new Set();

async function syncSearchFeed(body) {
  const query = new URLSearchParams(location.search).get("q") || "";
  const f = new URLSearchParams(location.search).get("f") || "";
  if (!query) {
    body.innerHTML = `<div class="im-chat-empty"><p>请输入关键词进行搜索</p></div>`;
    return;
  }
  const key = `${query}:${f}`;
  // 搜索词或 Tab 变化时，清空并重新开始
  if (searchRenderedKey !== key) {
    searchRenderedKey = key;
    searchSeen.clear();
    body.innerHTML = "";
  }

  // 优先增量提取当前原生主栏中的卡片（增量追加，不重绘整个列表）
  {

    const nativeArticles = allTweetArticles();
    if (nativeArticles.length > 0) {
      for (const art of nativeArticles) {
        const t = extractTweet(art);
        if (!t) continue;
        if (searchSeen.has(t.id)) {
          if (t.avatar) {
            const oldMsg = body.querySelector(`.im-msg[data-id="${t.id}"]`);
            const oldAva = oldMsg?.querySelector(".im-msg-avatar.is-text-avatar, .im-msg-avatar.is-grid-mask");
            if (oldAva) oldAva.outerHTML = personAvatarHtml("im-msg-avatar", t.name, t.avatar, t.id || t.handle, true);
          }
          continue;
        }
        searchSeen.add(t.id);
        body.insertAdjacentHTML("beforeend", msgHtml(t, true));
      }
      if (searchSeen.size > 0) return;
    }
  }

  // 3. 原生主栏无数据时：优先读被动捕获的官方搜索接口响应（POST /api/sns/web/v2/search/notes），
  //    官方页自己带签名请求、我们只监听；短轮询等待其返回，超时再退状态树。
  let list = searchCache.get(key);
  if (!list) {
    if (!searchSeen.size) body.innerHTML = `<div class="im-detail-loading">正在搜索 “${escapeHtml(query)}”…</div>`;
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 250));
      if (routeKind() !== "search") return;
      const captured = getCapturedSearch(query);
      if (captured.length) {
        list = captured.map((t) => ({ type: "tweet", tweet: t }));
        break;
      }
    }
    if (!list) list = await fetchSearchTimeline(query, f);
    searchCache.set(key, list || []);
  }
  body.querySelector(".im-detail-loading")?.remove();
  if (!list.length && !searchSeen.size) {
    body.innerHTML = `<div class="im-chat-empty"><p>未找到与 “${escapeHtml(query)}” 相关的结果</p></div>`;
    return;
  }
  for (const item of list) {
    if (item.type === "tweet" && !searchSeen.has(item.tweet.id)) {
      searchSeen.add(item.tweet.id);
      body.insertAdjacentHTML("beforeend", msgHtml(item.tweet, true));
    }
  }
}

// 场景卡片：profile=个人资料卡；search/explore=引导卡
function syncSceneCards(body) {
  const kind = routeKind();

  let profEl = body.querySelector(".im-profile-card");
  if (kind === "profile") {
    const prof = extractProfilePage();
    const html = profileCardHtml(prof);
    if (profEl) {
      if (profEl.dataset.sig !== html) { profEl.dataset.sig = html; profEl.innerHTML = html; }
    } else {
      profEl = document.createElement("div");
      profEl.className = "im-profile-card";
      profEl.dataset.sig = html;
      profEl.innerHTML = html;
      body.prepend(profEl);
    }
  } else if (profEl) {
    profEl.remove();
  }

  body.querySelector(".im-chat-guide")?.remove();
}

/** 个人主页列表：渲染当前用户主页 tab 里的帖子，支持笔记/收藏/点赞切换及空状态 */
function syncProfileFeed(body) {
  const prof = extractProfilePage();
  const profileArticles = Array.from(
    document.querySelectorAll("#userPostedFeeds .note-item, #userPageContainer .note-item, .user-page .note-item, .profile-container .note-item, .user-tab .note-item, [class*='user-page'] .note-item, [class*='profile'] .note-item"),
  ).filter((n) => !n.closest("#exploreFeeds"));

  const source = profileArticles.length
    ? profileArticles
    : Array.from(document.querySelectorAll(".note-item")).filter(
        (n) => !n.closest("#exploreFeeds"),
      );

  const me = nativeProfilePath() || "";
  let renderedCount = 0;
  for (const art of source) {
    const t = extractTweet(art);
    if (!t || !t.id) continue;
    if (me && t.handle && me.replace(/^\//, "") === t.handle) t.mine = true;
    const oldEl = body.querySelector(`.im-msg[data-id="${t.id}"]`);
    if (oldEl) {
      renderedCount++;
      continue;
    }
    body.insertAdjacentHTML("beforeend", msgHtml(t, true));
    renderedCount++;
  }

  const existingEmpty = body.querySelector(".im-chat-empty");
  if (renderedCount === 0 && !source.length) {
    const emptyMsg = prof?.emptyText || "该分类下暂无笔记";
    if (!existingEmpty) {
      body.insertAdjacentHTML("beforeend", `<div class="im-chat-empty"><p>${escapeHtml(emptyMsg)}</p></div>`);
    } else if (existingEmpty.querySelector("p")?.textContent !== emptyMsg) {
      existingEmpty.innerHTML = `<p>${escapeHtml(emptyMsg)}</p>`;
    }
  } else if (existingEmpty && renderedCount > 0) {
    existingEmpty.remove();
  }
}

/* —— 中栏详情：点推文在 chat-body 右侧拉出详情面板（盖住列表右 ~2/3、左留窄条可滚动），header/composer 固定不动，评论区 GraphQL 自绘、不触发原生路由（返回不刷新） —— */

let detailView = null;

/** 统一开合详情面板（100% 盖住列表） */
function setDetailOpen(open) {
  detailView?.classList.toggle("is-open", open);
}

/** 关闭详情面板：收起抽屉；若原生 overlay 被静默唤起（评论 DOM），用 popstate 关掉并还原 URL */
function closeDetailTo() {
  const onNoteUrl = /\/explore\/[a-f0-9]+/.test(location.pathname);
  closeDetailDrawer();
  if (onNoteUrl) {
    // 用 router.push 进的详情页没有 overlay：同步把 URL 还原回列表页，
    // 否则 syncDetailDrawer 检测到 note URL 会兜底重开详情（闪一下又回来）
    if (detailPrevUrl) {
      try { history.replaceState(null, "", detailPrevUrl); } catch { /* ignore */ }
    }
    if (history.length > 1) {
      try { history.back(); } catch { /* ignore */ }
    }
  }
}

/** 创建（惰性）或返回详情面板：挂在中栏 chat-body 内，盖住列表右 ~2/3（左留窄条），header/composer 不动 */
function ensureDetailView() {
  if (detailView && detailView.isConnected) return detailView;
  const host = document.querySelector(".im-chat-body");
  if (!host) return null;
  const el = document.createElement("div");
  el.className = "im-detail-view";
  el.innerHTML = `
    <div class="im-detail-head">
      <button type="button" class="im-icon-btn im-detail-back" title="返回">${ICONS.chevrons}</button>
      <div class="im-detail-titles">
        <span class="im-detail-title"></span>
        <span class="im-detail-sub"></span>
      </div>
      <span class="im-detail-actions">
        <button type="button" class="im-icon-btn im-detail-expand" title="展开全部评论">${ICONS.expand}</button>
        <button type="button" class="im-icon-btn im-detail-export" title="导出评论">${ICONS.download || ICONS.file}</button>
      </span>
    </div>
    <div class="im-detail-body"></div>`;
  host.appendChild(el);
  detailView = el;
  // 分隔条：左右抽拉调宽详情面板
  const gutter = document.createElement("div");
  gutter.className = "im-detail-gutter";
  el.appendChild(gutter);
  el.style.setProperty("--detail-w", "0px");
  let dragging = 0;
  gutter.addEventListener("pointerdown", (e) => {
    dragging = 1;
    gutter.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });
  gutter.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const hr = host.getBoundingClientRect();
    const w = hr.right - e.clientX;
    el.style.width = `${Math.round(Math.max(120, Math.min(hr.width - 220, w)))}px`;
  });
  gutter.addEventListener("pointerup", () => { dragging = 0; });
  el.querySelector(".im-detail-back")?.addEventListener("click", closeDetailTo);
  el.querySelector(".im-detail-expand")?.addEventListener("click", async (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.title = "展开中…";
    const n = await expandAllComments();
    const replies = collectNoteComments(lastThreadDetail?.id);
    if (lastThreadDetail?.detail) {
      lastThreadDetail.detail.replies = replies;
      renderDetailThread(lastThreadDetail.detail);
    }
    toast(n ? `已展开 ${n} 处折叠评论` : (replies.length ? "没有更多折叠评论" : "暂无评论"));
    btn.disabled = false;
    btn.title = "展开全部评论";
  });
  el.querySelector(".im-detail-export")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const pin = lastThreadDetail?.detail?.pin;
    const replies = lastThreadDetail?.detail?.replies || harvestNoteComments();
    if (!pin) { toast("请先打开一篇笔记"); return; }
    downloadNoteCommentsAsTxt(pin, replies);
    toast("评论已导出");
  });
  const dbody = el.querySelector(".im-detail-body");
  dbody?.addEventListener("scroll", onDetailBodyScroll);
  dbody?.addEventListener("click", onMsgClick);
  dbody?.addEventListener("pointerover", (e) => {
    const q = e.target.closest(".im-quote");
    if (q) showQuoteFloat(q);
  });
  dbody?.addEventListener("pointerout", (e) => {
    const q = e.target.closest(".im-quote");
    if (!q) return;
    if (e.relatedTarget && (q.contains(e.relatedTarget) || quoteFloat?.contains(e.relatedTarget))) return;
    quoteFloatHide = setTimeout(hideQuoteFloat, 120);
  });
  return el;
}

/** 详情抽屉保持：openTweetDetail 已打开则维持（URL 保持列表路由，不因无 status 误关）；否则 false（中栏渲染） */
export function syncDetailDrawer() {
  if (detailView?.classList.contains("is-open") && detailRenderedHref) return true;
  const status = statusInfo();
  if (!status) {
    if (detailView?.classList.contains("is-open")) console.info(`[xhs-im:drawer] closing: path=${location.pathname} statusInfo=null detailHref=${detailRenderedHref}`);
    closeDetailDrawer();
    return false;
  }
  // 同一笔记的抽屉已打开 → page 切换不重渲染，中栏推荐流冻结
  if (detailView?.classList.contains("is-open") && detailRenderedHref && detailRenderedHref.includes(status.id)) return true;
  // 兜底：直接刷新落在 note/status URL（此时无 openTweetDetail 记录）→ 用后台已有数据渲染主推一次
  const host = document.querySelector(".im-chat-body");
  if (!host) return true;
  const el = ensureDetailView();
  if (!el) return true;
  setDetailOpen(true);
  const dbody = el.querySelector(".im-detail-body");
  const art = allTweetArticles().find(
    (n) => n.querySelector(`a[href*="${status.id}"]`) || (n.innerHTML || "").includes(status.id)
  );
  let pt = art && extractTweet(art);
  if (!pt) {
    const cached = getCachedNoteFromState(status.id);
    if (cached) pt = pinFromNoteObject(cached, status.id);
  }
  detailRenderedHref = `/explore/${status.id}`;
  const title = el.querySelector(".im-detail-title");
  const sub = el.querySelector(".im-detail-sub");
  if (title) title.textContent = pt?.name || "笔记详情";
  if (sub) sub.textContent = pt?.handle ? `@${pt.handle} · 评论区` : "评论区";
  if (dbody && (dbody.dataset.sig || "") !== String(status.id)) {
    dbody.dataset.sig = String(status.id);
    dbody.innerHTML =
      (pt ? threadPinHtml(pt) : `<div class="im-chat-empty"><p>正在加载笔记…</p></div>`) +
      `<div class="im-detail-loading">正在加载评论区…</div>`;
    if (pt) dbody.querySelector(".im-thread-pin")?.setAttribute("data-pin-id", status.id);
    const loadedHref = `/explore/${status.id}`;
    fetchTweetDetail(status.id)
      .then((detail) => {
        if (detailView !== el || !el.classList.contains("is-open") || (detailRenderedHref !== loadedHref && !detailRenderedHref.includes(status.id))) return;
        if (detail) {
          try {
            lastThreadDetail = { id: String(status.id), detail };
            renderDetailThread(detail);
          } catch (err) {
            console.error("[xhs-im:detail] 兜底渲染评论抛异常:", err);
            dbody.innerHTML = `<div class="im-chat-empty"><p>该笔记渲染失败</p>
              <a class="im-native-open" href="/explore/${status.id}" target="_blank" rel="noopener">在小红书打开</a></div>`;
          }
        } else {
          dbody.innerHTML = `<div class="im-chat-empty"><p>该笔记加载失败</p>
            <a class="im-native-open" href="/explore/${status.id}" target="_blank" rel="noopener">在小红书打开</a></div>`;
        }
      })
      .catch((err) => {
        console.error("[xhs-im:detail] 兜底 fetch 评论抛异常:", err && err.message);
        dbody.innerHTML = `<div class="im-chat-empty"><p>该笔记加载失败（网络/接口错误）</p>
          <a class="im-native-open" href="/explore/${status.id}" target="_blank" rel="noopener">在小红书打开</a></div>`;
      });
  }
  return true;
}

export function closeDetailDrawer() {
  setDetailOpen(false);
  detailRenderedHref = "";
}

export function removeChatPanel() {
  document.querySelector(".im-chat-panel")?.remove();
  detailView?.remove();
  detailView = null;
  seen.clear();
}

export function resetChatMessages() {
  closeDetailDrawer();
  closeImVideoModal();
  seen.clear();
  const feed = document.querySelector(".im-feed-col");
  if (feed) feed.innerHTML = "";
  syncChatMessages();
}
