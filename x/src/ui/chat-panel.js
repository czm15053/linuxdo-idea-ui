import { ICONS, getSkinIcon } from "../config/icons.js";
import { PINNED } from "../config/constants.js";
import { currentSkinId } from "../config/skins.js";
import { getChatId, isMaskTitle, getSortMode, setSortMode } from "../state/prefs.js";
import { displayTitle, personAvatarHtml } from "./avatars.js";
import { escapeHtml, parseCountValue, formatCount } from "../utils/html.js";
import {
  extractTweet, allTweetArticles, findTweetArticle, openCompose, nativeProfilePath, loadMoreFeed,
  extractProfilePage, navigateX, currentDmId, extractDmConversations, extractDmMessages,
  refreshHomeFeed, currentHomeTab, switchFollowingSort, extractUserCells,
} from "../bridge/x-dom.js";
import { chatIdFromRoute, routeKind } from "../bridge/router.js";
import {
  sendViaModal, replyViaModal, sendDmViaNative, toggleLike, toggleRetweet, toggleBookmark,
  toggleFollowOnProfile, toggleFollowViaCaret, toggleTweetFollow, getProfileFollowState,
} from "../bridge/tweet.js";
import { fetchTweetDetail, fetchNotificationsTimeline, fetchSearchTimeline, posterVideoSrc, requestXTranslation } from "../bridge/feed-api.js";
import { openImImageModal, playInlineVideo, closeImVideoModal, openImVideoModal } from "./lightbox.js";
import { toast } from "./toast.js";

const seen = new Set();

// 首页标签栏：动态匹配当前皮肤的官方原版 icon（消息 / 云文档 / Pin）
function defaultTabsHtml() {
  return `<a class="im-chat-tab active notranslate" translate="no">${getSkinIcon("msg")}<span class="notranslate" translate="no">消息</span></a>
      <a class="im-chat-tab notranslate" translate="no">${getSkinIcon("doc")}<span class="notranslate" translate="no">云文档</span></a>
      <a class="im-chat-tab notranslate" translate="no">${getSkinIcon("pin")}<span class="notranslate" translate="no">Pin</span></a>`;
}

function fmtXTime(dt, fallback) {
  if (!dt) return fallback;
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return fallback;
  const now = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (d.toDateString() === now.toDateString()) return `${hh}:${mm}`;
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return `昨天 ${hh}:${mm}`;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function statusInfo() {
  const m = location.pathname.match(/status\/(\d+)/);
  return m ? { id: m[1] } : null;
}

function profileCardHtml(prof) {
  const ava = personAvatarHtml("im-profile-avatar", prof?.name || "U", prof?.avatar || "", prof?.handle);
  const name = prof?.name || (prof?.handle ? "@" + prof.handle : "个人主页");
  const handle = prof?.handle ? "@" + prof.handle : "";
  return `<div class="im-profile-head">
      ${ava}
      <div class="im-profile-names">
        <span class="im-profile-name">${escapeHtml(name)}</span>
        <span class="im-profile-handle">${escapeHtml(handle)}</span>
      </div>
    </div>
    ${prof?.bio ? `<div class="im-profile-bio">${escapeHtml(prof.bio).replace(/\n/g, "<br>")}</div>` : ""}`;
}

function guideCardHtml(kind) {
  if (kind === "search") {
    let q = "";
    try { q = new URLSearchParams(location.search).get("q") || ""; } catch { /* ignore */ }
    return `<div class="im-guide-icon">${ICONS.search}</div>
      <div class="im-guide-title">搜索 ${q ? `“${escapeHtml(q)}”` : "结果"}</div>
      <div class="im-guide-text">以下是 X 的搜索结果推文流，由原生页面驱动。</div>`;
  }
  return `<div class="im-guide-icon">${ICONS.search}</div>
    <div class="im-guide-title">探索</div>
    <div class="im-guide-text">即时热门趋势与话题展示在原生「探索」页，本栏为 IM 会话视图。</div>
    <button type="button" class="im-guide-btn" data-guide="/explore">打开探索</button>`;
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
  return `<div class="im-thread-pin" data-pin-id="${escapeHtml(t.id || "")}" data-lang="orig">
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
      <button type="button" class="im-thread-pin-act" data-act="reply" title="回复">${ICONS.mail}<span>${t.replyCount ? `回复 ${escapeHtml(t.replyCount)}` : "回复"}</span></button>
      <button type="button" class="im-thread-pin-act${t.retweeted ? " is-retweeted" : ""}" data-act="repost" data-count="${escapeHtml(t.rtCount || "")}" title="转推">${ICONS.repost}<span>${t.rtCount ? `转推 ${escapeHtml(t.rtCount)}` : "转推"}</span></button>
      <button type="button" class="im-thread-pin-act${t.liked ? " is-liked" : ""}" data-act="like" data-count="${escapeHtml(t.likeCount || "")}" title="点赞">${t.liked ? ICONS.heartFilled : ICONS.plus}<span>${t.likeCount ? `点赞 ${escapeHtml(t.likeCount)}` : "点赞"}</span></button>
      <button type="button" class="im-thread-pin-act${t.bookmarked ? " is-bookmarked" : ""}" data-act="bookmark" data-count="${escapeHtml(t.bookmarkCount || "")}" title="书签">${t.bookmarked ? ICONS.bookmarkFill : ICONS.bookmark}<span>${t.bookmarkCount ? `书签 ${escapeHtml(t.bookmarkCount)}` : "书签"}</span></button>
      ${t.viewCount ? `<span class="im-thread-pin-act im-thread-pin-stat" title="浏览量">${ICONS.chart}<span>${escapeHtml(t.viewCount)} 次浏览</span></span>` : ""}
      <button type="button" class="im-thread-pin-act" data-act="open" title="在 X 原生页打开">${ICONS.swap}<span>查看原文</span></button>
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
          <button type="button" class="im-icon-btn" data-act="compose" title="发帖">${ICONS.compose}</button>
        </div>
      </div>
      <div class="im-chat-tabs notranslate" translate="no">
        ${defaultTabsHtml()}
      </div>
      <div class="im-chat-body"><div class="im-feed-col"></div></div>
      <div class="im-composer">
        <div class="im-composer-card">
          <div class="im-chat-compose" contenteditable="true" data-placeholder="发帖… 回车发布，Shift+回车换行"></div>
          <div class="im-composer-tools">
            <button type="button" class="im-icon-btn" title="图片">${ICONS.image}</button>
            <button type="button" class="im-icon-btn" title="表情">${ICONS.emoji}</button>
            <button type="button" class="im-icon-btn" title="@">${ICONS.at}</button>
            <div class="spacer"></div>
            <button type="button" class="im-send-btn">发布</button>
          </div>
        </div>
      </div>`;
    (document.body || document.documentElement).appendChild(panel);
    panel.querySelector('[data-act="compose"]')?.addEventListener("click", () => openCompose());
    panel.querySelector('[data-act="refresh"]')?.addEventListener("click", (e) => {
      e.stopPropagation();
      refreshHomeFeed();
      resetChatMessages();
      panel.querySelector(".im-feed-col")?.scrollTo(0, 0);
    });
    const composeBox = panel.querySelector(".im-chat-compose");
    composeBox?.addEventListener("click", (e) => e.stopPropagation());
    const sendBtn = panel.querySelector(".im-send-btn");
    const sendNow = () => sendComposerText(panel);
    sendBtn?.addEventListener("click", sendNow);
    // 回车两拍确认：首次 Enter 弹确认条，再回车或点发布才真正发送
    const confirmBar = document.createElement("div");
    confirmBar.className = "im-send-confirm";
    confirmBar.innerHTML = `<span>确认发布这条推文？</span><div class="spacer"></div><span class="cf-hint">再次回车 · 5秒后自动取消</span><button type="button" class="cf-cancel">取消</button><button type="button" class="cf-ok">发布</button>`;
    panel.querySelector(".im-composer-card")?.appendChild(confirmBar);
    // 回复态标签：点「回复」不弹原生 composer，改用伪装输入框（发布带 in_reply_to）
    const replyBar = document.createElement("div");
    replyBar.className = "im-reply-bar";
    replyBar.innerHTML = `<span class="im-reply-bar-tag">回复</span><span class="im-reply-bar-handle"></span><span class="spacer"></span><button type="button" class="im-reply-bar-x" title="取消回复">×</button>`;
    panel.querySelector(".im-composer-card")?.prepend(replyBar);
    replyBar.querySelector(".im-reply-bar-x")?.addEventListener("click", () => { stopReply(panel); composeBox?.focus(); });
    let cfTimer = 0;
    const hideConfirm = () => {
      confirmBar.classList.remove("on");
      window.clearTimeout(cfTimer);
      cfTimer = 0;
      delete panel.dataset.cf;
    };
    const showConfirm = () => {
      if (!(composeBox?.innerText || "").trim()) return;
      confirmBar.classList.add("on");
      panel.dataset.cf = "1";
      if (cfTimer) window.clearTimeout(cfTimer);
      cfTimer = window.setTimeout(hideConfirm, 5000);
    };
    confirmBar.addEventListener("click", (e) => { e.stopPropagation(); });
    confirmBar.querySelector(".cf-cancel")?.addEventListener("click", () => { hideConfirm(); composeBox?.focus(); });
    confirmBar.querySelector(".cf-ok")?.addEventListener("click", () => { hideConfirm(); sendNow(); });
    composeBox?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (panel.dataset.cf === "1") { hideConfirm(); sendNow(); }
        else showConfirm();
      } else if (e.key === "Escape") {
        hideConfirm();
      }
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
    panel.querySelector(".im-chat-tabs")?.addEventListener("click", (e) => {
      const tab = e.target.closest(".im-chat-tab");
      if (!tab) return;
      if (tab.dataset.notifyTab) {
        currentNotifyTab = tab.dataset.notifyTab;
        notifyCache[currentNotifyTab] = null;
        syncChatHeader(panel);
        const feedCol = panel.querySelector(".im-feed-col");
        if (feedCol) syncNotifyFeed(feedCol);
        return;
      }
      if (tab.dataset.searchF !== undefined || tab.dataset.searchTab !== undefined) {
        const f = tab.dataset.searchF !== undefined ? tab.dataset.searchF : tab.dataset.searchTab;
        const q = new URLSearchParams(location.search).get("q") || "";
        const newUrl = `/search?q=${encodeURIComponent(q)}&src=typed_query${f ? `&f=${f}` : ""}`;
        navigateX(newUrl);
        searchSeen.clear();
        searchRenderedKey = "";
        syncChatHeader(panel);
        const feedCol = panel.querySelector(".im-feed-col");
        if (feedCol) {
          feedCol.innerHTML = "";
          syncSearchFeed(feedCol);
        }
        return;
      }
      if (tab.dataset.bookmarkPath) {
        navigateX(tab.dataset.bookmarkPath);
        resetChatMessages();
        syncChatHeader(panel);
        return;
      }
      toast("装饰标签，暂无内容");
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
  syncComposerMode(panel, false);
  const refreshBtn = panel.querySelector("[data-act='refresh']");
  if (refreshBtn) refreshBtn.hidden = !(routeKind() === "home" || id === "home" || id === "follow");

  // 通知中心展示「全部 / 提及」切换 tab，搜索页展示「热门 / 最新 / 图片 / 视频」tab，其它一律装饰标签
  const tabsEl = panel.querySelector(".im-chat-tabs");
  const sId = currentSkinId();
  if (routeKind() === "notify" || id === "notify") {
    const notifyTabsHtml = `
      <a class="im-chat-tab ${currentNotifyTab === 'All' ? 'active' : ''}" data-notify-tab="All">${getSkinIcon("bell")}<span>全部</span></a>
      <a class="im-chat-tab ${currentNotifyTab === 'Mentions' ? 'active' : ''}" data-notify-tab="Mentions">${getSkinIcon("at")}<span>提及</span></a>
    `;
    if (tabsEl && tabsEl.dataset.sig !== `notify:${sId}:${currentNotifyTab}`) {
      tabsEl.dataset.sig = `notify:${sId}:${currentNotifyTab}`;
      tabsEl.innerHTML = notifyTabsHtml;
    }
  } else if (routeKind() === "search") {
    const q = new URLSearchParams(location.search).get("q") || "";
    const f = new URLSearchParams(location.search).get("f") || "";
    const searchTabs = [
      { f: "", label: "热门" },
      { f: "live", label: "最新" },
      { f: "user", label: "用户" },
      { f: "media", label: "媒体" },
      { f: "list", label: "列表" },
    ];
    const name = `搜索: “${q}”`;
    if (ava) {
      ava.style.display = "";
      delete ava.dataset.handle;
      ava.innerHTML = personAvatarHtml("im-chat-avatar", "搜索", "", "search");
    }
    if (title) title.textContent = name;
    if (chips) chips.innerHTML = isMaskTitle() ? "" : `<a class="im-chat-chip">搜索</a>`;
    if (sub) sub.textContent = "全网推文";
    const searchTabsHtml = searchTabs.map((tab) => `
      <a class="im-chat-tab ${f === tab.f ? 'active' : ''} notranslate" translate="no" data-search-f="${escapeHtml(tab.f)}" data-search-tab="${escapeHtml(tab.f)}">
        <span class="notranslate" translate="no">${escapeHtml(tab.label)}</span>
      </a>
    `).join("");
    if (tabsEl && tabsEl.dataset.sig !== `search:${sId}:${f}:${q}`) {
      tabsEl.dataset.sig = `search:${sId}:${f}:${q}`;
      tabsEl.innerHTML = searchTabsHtml;
    }
    panel.querySelector(".im-chat-tabs")?.style.removeProperty("display");
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
    if (sub) sub.textContent = isLikes ? "已点赞的推文" : "已添加书签的推文";
    const bookmarkTabsHtml = `
      <a class="im-chat-tab ${!isLikes ? 'active' : ''}" data-bookmark-path="/i/history">${getSkinIcon("bookmark")}<span>书签</span></a>
      <a class="im-chat-tab ${isLikes ? 'active' : ''}" data-bookmark-path="/i/history/likes">${ICONS.heartFilled}<span>喜欢</span></a>
    `;
    if (tabsEl && tabsEl.dataset.sig !== `bookmark:${sId}:${isLikes ? 'likes' : 'history'}`) {
      tabsEl.dataset.sig = `bookmark:${sId}:${isLikes ? 'likes' : 'history'}`;
      tabsEl.innerHTML = bookmarkTabsHtml;
    }
    panel.querySelector(".im-chat-tabs")?.style.removeProperty("display");
    return;
  } else if (tabsEl && tabsEl.dataset.sig !== `default:${sId}`) {
    tabsEl.dataset.sig = `default:${sId}`;
    tabsEl.innerHTML = defaultTabsHtml();
  }
  syncSortToggle(panel);

  if (id.startsWith("user:")) {
    const handle = id.slice(5);
    const prof = extractProfilePage();
    const name = prof?.name || handle;
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
          else navigateX("/home");
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
      if (chips) chips.innerHTML = isMaskTitle() ? "" : `<a class="im-chat-chip">主页</a>`;
      if (sub) sub.textContent = (prof?.bio || "@" + handle).slice(0, 80);
      if (tools) {
        const me = (nativeProfilePath() || "").replace(/^\//, "").toLowerCase();
        const isMe = me && me === handle.toLowerCase();
        if (!isMe) {
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
    panel.querySelector(".im-chat-tabs")?.style.removeProperty("display");
    return;
  }

  if (id.startsWith("dm:") || (routeKind() === "msg" && currentDmId())) {
    const dmId = id.startsWith("dm:") ? id.slice(3) : currentDmId();
    const conv = extractDmConversations().find((c) => c.id === dmId);
    const name = displayTitle("dm:" + dmId, conv?.name || "私信");
    if (ava) {
      ava.style.display = "";
      ava.style.cursor = "";
      delete ava.dataset.handle;
      ava.innerHTML = personAvatarHtml("im-chat-avatar", name, conv?.avatar || "", "dm:" + dmId);
    }
    if (title) title.textContent = name;
    if (chips) chips.innerHTML = isMaskTitle() ? "" : `<a class="im-chat-chip">私信</a>`;
    if (sub) sub.textContent = conv?.preview || "";
    panel.querySelector(".im-chat-tabs")?.style.removeProperty("display");
    syncComposerMode(panel, true);
    return;
  }

  if (routeKind() === "msg") {
    const name = displayTitle("pin:msg", "私信");
    if (ava) {
      ava.style.display = "";
      delete ava.dataset.handle;
      ava.innerHTML = personAvatarHtml("im-chat-avatar", name, "", "msg");
    }
    if (title) title.textContent = name;
    if (chips) chips.innerHTML = isMaskTitle() ? "" : `<a class="im-chat-chip">私信</a>`;
    if (sub) sub.textContent = "选择一个会话";
    syncComposerMode(panel, false);
    return;
  }

  const pin = PINNED.find((p) => p.id === id) || PINNED[0];
  syncComposerMode(panel, false);
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
  panel.querySelector(".im-chat-tabs")?.style.removeProperty("display");
}

function syncComposerMode(panel, isDm) {
  if (isDm) stopReply(panel);
  const box = panel.querySelector(".im-chat-compose");
  const btn = panel.querySelector(".im-send-btn");
  const replyId = panel.dataset.replyId;
  if (box) box.dataset.placeholder = isDm
    ? "发消息… 回车发送，Shift+回车换行"
    : replyId ? `回复 @${panel.dataset.replyHandle || "对方"} … 回车发布，Shift+回车换行` : "发帖… 回车发布，Shift+回车换行";
  if (btn) btn.textContent = isDm ? "发送" : replyId ? "回复" : "发布";
}

/** 进入/退出伪装回复态：底部输入框显示「回复 @handle」标签，发布走 rest API 带 in_reply_to */
function stopReply(panel) {
  if (!panel) return;
  delete panel.dataset.replyId;
  delete panel.dataset.replyHandle;
  const bar = panel.querySelector(".im-reply-bar");
  if (bar) bar.classList.remove("on");
}
function startReply(msgId, handle) {
  const panel = document.querySelector(".im-chat-panel");
  if (!panel || !msgId) return;
  panel.dataset.replyId = String(msgId);
  panel.dataset.replyHandle = handle || "";
  const bar = panel.querySelector(".im-reply-bar");
  if (bar) {
    bar.classList.add("on");
    bar.querySelector(".im-reply-bar-handle").textContent = handle ? "@" + handle : "这条推文";
  }
  setDetailOpen(false); // 回复条在列表底部，先合上详情抽屉让输入框可见
  syncComposerMode(panel, routeKind() === "msg" && !!currentDmId());
  panel.querySelector(".im-chat-compose")?.focus();
  toast(handle ? `正在回复 @${handle}` : "正在回复这条推文");
}

/* —— tab 栏「排序」控件：模拟原生点击 Following Tab 内的下拉箭头，驱动 X 官方菜单切换热门/最近 —— */
function syncSortToggle(panel) {
  const tabsEl = panel.querySelector(".im-chat-tabs");
  if (!tabsEl) return;
  let wrap = tabsEl.querySelector(".im-sort-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "im-sort-wrap";
    wrap.innerHTML = `<button type="button" class="im-sort-btn" title="时间线排序（热门/最近）" aria-haspopup="menu">${ICONS.sortDown}<span>排序</span></button>
      <div class="im-sort-menu" role="menu">
        <button type="button" class="im-sort-item" data-sort="hot">热门</button>
        <button type="button" class="im-sort-item" data-sort="recent">最近</button>
      </div>`;
    wrap.querySelector(".im-sort-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      wrap.classList.toggle("open");
    });
    wrap.querySelectorAll(".im-sort-item").forEach((it) => it.addEventListener("click", async (e) => {
      e.stopPropagation();
      wrap.classList.remove("open");
      const target = it.dataset.sort;
      const cur = getSortMode();
      if (target === cur) { toast(`当前已是「${target === "hot" ? "热门" : "最近"}」`); return; }
      toast(`正在切到「${target === "hot" ? "热门" : "最近"}」…`);
      const ok = await switchFollowingSort(target);
      if (ok) {
        setSortMode(target);
        wrap.querySelectorAll(".im-sort-item").forEach((item) => item.classList.toggle("on", item.dataset.sort === target));
        toast(`已切到「${target === "hot" ? "热门" : "最近"}」，正在刷新时间线…`);
        // 清空当前消息流及 seen 缓存，触发原生重绘
        resetChatMessages();
        // 延时等待 X 官方异步加载与原生 DOM 更新
        setTimeout(() => syncChatMessages(), 600);
        setTimeout(() => syncChatMessages(), 1500);
        setTimeout(() => syncChatMessages(), 3000);
      } else {
        toast(`切换「${target === "hot" ? "热门" : "最近"}」失败，未找到原生选项`);
      }
    }));
    tabsEl.appendChild(wrap);
    if (!window.__imSortDocBound) {
      window.__imSortDocBound = true;
      document.addEventListener("click", () => document.querySelectorAll(".im-sort-wrap.open").forEach((w) => w.classList.remove("open")));
    }
  }
  const cur = getSortMode();
  wrap.querySelectorAll(".im-sort-item").forEach((it) => it.classList.toggle("on", it.dataset.sort === cur));
  // 排序只在关注流（Following）上下文显示——For You 没有「热门/最近」概念
  const chatId = getChatId() || chatIdFromRoute();
  wrap.hidden = !(chatId === "follow" || (routeKind() === "home" && currentHomeTab() === "following"));
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
      console.info(`[x-im:quote-video] id=${statusId} → src=${!!src} pinVideo=${!!detail?.pin?.video?.src} quoteVideo=${!!detail?.pin?.quote?.video?.src} replies=${(detail?.replies || []).length}`);
    } catch (err) {
      console.warn("[x-im:quote-video] fetch failed", err && err.message, "id=", statusId);
    }
  }
  // ③ 所属消息主推 id：在整个线程里按 poster 精确匹配被引用帖视频
  if (!src && msg?.dataset.id) {
    try {
      const detail = await fetchTweetDetail(msg.dataset.id);
      const v = pickV(detail);
      applyV(v);
      console.warn(`[x-im:quote-video] msgFallback id=${msg.dataset.id} poster=${poster ? poster.replace(/^.*\//, "") : "(none)"} pinVideo=${!!detail?.pin?.video?.src} quoteVideo=${!!detail?.pin?.quote?.video?.src} matched=${!!v?.src} replies=${(detail?.replies || []).length}`);
    } catch (err) {
      console.warn("[x-im:quote-video] msgFallback fetch failed", err && err.message, "id=", msg.dataset.id);
    }
  }
  // ④ 当前详情线程已抓数据，零请求复用
  if (!src && lastThreadDetail && body && body.dataset.pinId === lastThreadDetail.id) {
    applyV(pickV(lastThreadDetail.detail));
    if (src) console.info("[x-im:quote-video] reused open thread data");
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

function msgHtml(t, forceReal) {
  const side = t.mine ? "me" : "other";
  const ava = personAvatarHtml("im-msg-avatar", t.name, t.avatar, t.id || t.handle, !!forceReal);
  const ps = (t.photos || []).filter((src) => !(t.video && /video_thumb|amplify_video/.test(src))).slice(0, 4);
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
    : t.repliedTo ? `<div class="im-repost-tag im-replied-tag"><span><b>${escapeHtml(t.repliedTo)}</b> 回复</span></div>` : "";
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
    t.rtCount ? `转推 ${t.rtCount}` : "",
    t.likeCount ? `点赞 ${t.likeCount}` : "",
    t.bookmarkCount ? `书签 ${t.bookmarkCount}` : "",
    t.viewCount ? `浏览 ${t.viewCount}` : "",
  ].filter(Boolean).join(" · ");
  const bubbleTitle = statsSummary ? ` title="${escapeHtml(statsSummary)}"` : (long ? ' title="点击展开全部"' : "");
  const followTag = (t.canFollow && !t.mine && handle)
    ? `<button type="button" class="im-msg-follow${t.isFollowing ? " on" : ""}" data-id="${escapeHtml(t.id)}" data-handle="${escapeHtml(handle)}" title="${t.isFollowing ? "已关注" : "关注"} @${escapeHtml(handle)}">${t.isFollowing ? "已关注" : "+ 关注"}</button>`
    : "";

  return `<div class="im-msg im-msg-${side}" data-id="${escapeHtml(t.id)}" data-href="${escapeHtml(t.href || "")}" data-handle="${escapeHtml(handle)}" data-translated="${escapeHtml(String(translated))}">
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
        <button type="button" class="im-msg-tool${t.retweeted ? " is-retweeted" : ""}" data-action="repost" data-name="转推" data-count="${escapeHtml(t.rtCount || "")}">${ICONS.repost}${t.rtCount ? `<span class="im-tool-num">${escapeHtml(t.rtCount)}</span>` : ""}</button>
        <button type="button" class="im-msg-tool${t.liked ? " is-liked" : ""}" data-action="like" data-name="点赞" data-count="${escapeHtml(t.likeCount || "")}">${t.liked ? ICONS.heartFilled : ICONS.plus}${t.likeCount ? `<span class="im-tool-num">${escapeHtml(t.likeCount)}</span>` : ""}</button>
        <button type="button" class="im-msg-tool" data-action="reply" data-name="回复">${ICONS.mail}</button>
        <button type="button" class="im-msg-tool${t.bookmarked ? " is-bookmarked" : ""}" data-action="bookmark" data-name="书签" data-count="${escapeHtml(t.bookmarkCount || "")}">${t.bookmarked ? ICONS.bookmarkFill : ICONS.bookmark}${t.bookmarkCount ? `<span class="im-tool-num">${escapeHtml(t.bookmarkCount)}</span>` : ""}</button>
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

  if (routeKind() === "msg") {
    syncSceneCards(body);
    syncDmThread(body);
    return;
  }

  if (routeKind() === "notify" || getChatId() === "notify") {
    syncSceneCards(body);
    syncNotifyFeed(body);
    return;
  }

  if (routeKind() === "search") {
    syncSceneCards(body);
    syncSearchFeed(body);
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
      // 已渲染消息需要重建的条件：① X 自带翻译状态翻转（原文↔译文）；② 图 lazy 到位后补渲染（首次 sync 时 article 的 img src 常为空导致漏图）
      const oldEl = body.querySelector(`.im-msg[data-id="${t.id}"]`);
      let needRebuild = false;
      if (oldEl) {
        if (t.translated !== undefined && oldEl.dataset.translated !== String(t.translated ? "1" : "0")) needRebuild = true;
        if (!needRebuild && t.photos && t.photos.length) {
          const dom = [...(oldEl.querySelectorAll(".im-msg-photos img"))].map((i) => i.src || "");
          if (dom.length !== t.photos.length || !dom.every((s, i) => s === t.photos[i])) needRebuild = true;
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
    body.innerHTML = `<div class="im-chat-empty"><p>暂无消息</p></div>`;
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

function onChatScroll(e) {
  hideQuoteFloat();
  if (nearBottom(e.currentTarget)) {
    loadMoreFeed();
    setTimeout(syncChatMessages, 700);
  }
}

function onChatWheel(e) {
  if (e.deltaY <= 0) return;
  if (nearBottom(e.currentTarget)) {
    loadMoreFeed();
    setTimeout(syncChatMessages, 700);
  }
}

let detailPrevUrl = "";
let detailRenderedHref = "";
let lastThreadDetail = null; // 最近打开详情线程的 { id, detail }，供引用视频零请求复用

/** 用 GraphQL 数据渲染详情面板：主推卡 + 评论气泡（复用列表的回复引用逻辑） */
function renderDetailThread(detail) {
  const el = detailView;
  if (!el) return;
  const dbody = el.querySelector(".im-detail-body");
  if (!dbody) return;
  const pt = detail.pin;
  const title = el.querySelector(".im-detail-title");
  const sub = el.querySelector(".im-detail-sub");
  if (title) title.textContent = pt?.name || "推文详情";
  if (sub) sub.textContent = pt?.handle ? `@${pt.handle} · 评论区` : "评论区";
  const ownerLast = new Map();
  let html = pt ? threadPinHtml(pt) : `<div class="im-chat-empty"><p>未找到该推文</p></div>`;
  let prevT = null;
  let threadRun = 0;
  for (const t of detail.replies || []) {
    if (t.replyTo && ownerLast.has(t.replyTo)) {
      const ref = ownerLast.get(t.replyTo);
      if (ref) t.replyRef = { handle: t.replyTo, href: ref.href || "", snippet: ref.snippet };
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
  if (!(detail.replies || []).length) html += `<div class="im-chat-empty"><p>暂无评论</p></div>`;
  dbody.dataset.sig = pt ? pt.id : html;
  dbody.innerHTML = html;
  if (pt) {
    dbody.dataset.pinId = pt.id;
    dbody.querySelector(".im-thread-pin")?.setAttribute("data-pin-id", pt.id);
  }
}

/**
 * 进推文详情：纯前端弹覆盖层，完全不触发 X 原生路由/页面切换，因此绝无加载闪屏。
 * 主推先用列表已有数据即时显示，评论区通过 X 同源 GraphQL 拉取（唯一一次读请求），
 * 到手后整体替换。失败静默降级为「仅主推」。返回即关闭覆盖层，中栏原位置原样保留。
 */
function openTweetDetail(href, contextEl) {
  if (!href) return;
  const statusId = String(href).match(/status\/(\d+)/)?.[1] || "";
  console.info(`[x-im:detail] open ${href}${statusId ? "" : " (no status id)"}`);
  const host = document.querySelector(".im-chat-body");
  const el = host && ensureDetailView();
  if (!el) return;
  if (!detailRenderedHref) detailPrevUrl = location.pathname + location.search;
  const ctx = contextEl?.closest(".im-msg");
  let pt = null;
  if (statusId) {
    const art = allTweetArticles().find(
      (n) => n.querySelector(`a[href*="/status/${statusId}"]`) || (n.innerHTML || "").includes(statusId)
    );
    pt = art && extractTweet(art);
  }
  if (!pt && ctx) {
    // 列表消息兜底：由消息节点重建最小数据
    pt = {
      id: statusId,
      name: ctx.querySelector(".im-msg-name")?.textContent || "",
      handle: ctx.dataset.handle || "",
      text: ctx.querySelector(".im-tw-body")?.textContent || "",
      href,
      time: ctx.querySelector(".im-msg-meta")?.textContent || "",
    };
  }
  setDetailOpen(true);
  detailRenderedHref = href;
  const dbody = el.querySelector(".im-detail-body");
  const title = el.querySelector(".im-detail-title");
  const sub = el.querySelector(".im-detail-sub");
  if (title) title.textContent = pt?.name || "推文详情";
  if (sub) sub.textContent = pt?.handle ? `@${pt.handle} · 评论区` : "评论区";
  dbody.dataset.sig = statusId || href;
  dbody.innerHTML =
    (pt ? threadPinHtml(pt) : `<div class="im-chat-empty"><p>正在加载推文…</p></div>`) +
    `<div class="im-detail-loading">正在加载评论区…</div>`;
  if (statusId) {
    const loadedHref = href;
    const failView = (what) => {
      console.warn(`[x-im:detail] 加载失败(${what}) id=${statusId}`);
      dbody.innerHTML = `<div class="im-chat-empty"><p>该推文加载失败（${escapeHtml(what)}）</p>
        <a class="im-native-open" href="${escapeHtml(href || `/status/${statusId}`)}" target="_blank" rel="noopener">在 X 原生页打开</a></div>`;
    };
    fetchTweetDetail(statusId)
      .then((detail) => {
        if (detailView !== el || !el.classList.contains("is-open") || detailRenderedHref !== loadedHref) return;
        if (detail) {
          try {
            lastThreadDetail = { id: statusId, detail };
            renderDetailThread(detail);
          } catch (err) {
            console.error("[x-im:detail] 渲染评论抛异常:", err);
            failView("渲染异常");
          }
        } else {
          failView("接口未返回");
        }
      })
      .catch((err) => {
        console.error("[x-im:detail] fetch 评论抛异常:", err && err.message);
        failView("网络/接口错误");
      });
  }
  // 接入原生导航栈：pushState 压一条详情历史（浏览器后退/侧键可直接弹栈回列表），
  // 列表未卸载、位置天然保留；同一推文不重复压栈（避免连点同一条越退越多）。
  if (statusId) {
    const curId = String(location.pathname.match(/status\/(\d+)/)?.[1] || "");
    if (curId !== statusId) {
      try { history.pushState({ __xim_detail: detailPrevUrl }, "", href); } catch { /* ignore */ }
    }
  }
}

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
  if (span) span.textContent = optCount ? `转推 ${optCount}` : "转推";
  toast(nextRt ? "已转推" : "已取消转推");

  const res = await toggleRetweet(id, wasRt, art);
  if (res.ok) {
    if (res.count !== undefined && res.count !== "") {
      btn.dataset.count = res.count;
      if (span) span.textContent = `转推 ${res.count}`;
    }
    if (res.retweeted !== undefined) {
      btn.classList.toggle("is-retweeted", res.retweeted);
    }
  } else {
    btn.classList.toggle("is-retweeted", wasRt);
    btn.dataset.count = prevCount;
    if (span) span.textContent = prevCount ? `转推 ${prevCount}` : "转推";
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
    const pinId = pinFollow.dataset.pinId;
    const handle = pinFollow.dataset.handle;
    pinFollow.disabled = true;
    toggleFollowViaCaret(pinId).then((res) => {
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
      const a = art?.querySelector('a[href*="/status/"]');
      openTweetDetail(a?.getAttribute("href") || `/status/${pinId}`, pinEl);
    } else if (pinAct.dataset.act === "trans") {
      // 详情主推 X 翻译接口自管理切换（原文/译文本地翻转）
      toggleTranslation(pinAct.closest(".im-thread-pin") || pinEl, pinId);
    } else if (pinAct.dataset.act === "reply") {
      // 伪装回复框（同列表）：不触发原生 composer
      const handleFromName = pinEl?.querySelector(".im-thread-pin-handle")?.textContent
        ?.replace(/^@/, "").split(/\s|·|,|\s+/)[0] || "";
      startReply(pinId, handleFromName);
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
    const id = msgFollow.dataset.id;
    const handle = msgFollow.dataset.handle;
    const isCurrentlyOn = msgFollow.classList.contains("on");
    msgFollow.disabled = true;
    toggleTweetFollow(id, isCurrentlyOn).then((res) => {
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
  const person = e.target.closest(".im-msg-avatar, .im-msg-name");
  if (person) {
    const handle = person.closest(".im-msg")?.dataset.handle;
    if (handle) navigateX("/" + handle);
    return;
  }
  const tool = e.target.closest(".im-msg-tool");
  if (tool) {
    const msg = tool.closest(".im-msg");
    const id = msg?.dataset.id;
    const art = findTweetArticle(id) || allTweetArticles().find((n) => (n.innerHTML || "").includes(id || ""));
    if (tool.dataset.action === "thread") {
      const href = msg?.dataset.href || (id ? `/status/${id}` : "");
      openTweetDetail(href, msg);
    } else if (tool.dataset.action === "repost") {
      handleToolRetweet(tool, id, art);
    } else if (tool.dataset.action === "reply") {
      // 伪装回复框：不触发原生 composer（原生回复框深色弹层/内嵌裸露突兀），发布走 rest API 带 in_reply_to
      startReply(msg?.dataset.id, msg?.dataset.handle);
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

function syncDmThread(body) {
  body.querySelector(".im-dm-list")?.remove();
  const convId = currentDmId();
  const msgEl = body.querySelector(".im-dm-thread");
  if (!convId) {
    msgEl?.remove();
    if (!body.querySelector(".im-chat-empty")) {
      body.innerHTML = `<div class="im-chat-empty"><p>选择一个会话开始聊天</p></div>`;
    }
    return;
  }
  body.querySelector(".im-chat-empty")?.remove();
  const rows = extractDmMessages();
  if (!rows.length) {
    if (!msgEl) body.innerHTML = `<div class="im-chat-empty"><p>暂无消息</p></div>`;
    return;
  }
  let el = msgEl;
  if (!el) {
    el = document.createElement("div");
    el.className = "im-dm-thread";
    body.append(el);
  }
  let html = "";
  for (const m of rows) {
    const side = m.mine ? "me" : "other";
    const ava = personAvatarHtml("im-msg-avatar", m.mine ? "我" : m.name || "ta", m.ava, m.name || "dm");
    html += `<div class="im-msg im-msg-${side}">
      ${ava}
      <div class="im-msg-content">
        <div class="im-msg-bubble"><div class="im-tw-body">${escapeHtml(m.text).replace(/\n/g, "<br>")}</div></div>
        <span class="im-msg-meta"><span>${escapeHtml(fmtXTime("", m.time || ""))}</span></span>
      </div>
    </div>`;
  }
  if (el.dataset.sig !== html) { el.dataset.sig = html; el.innerHTML = html; }
}

let currentNotifyTab = "All";
const notifyCache = { All: null, Mentions: null };
let notifyLoading = false;

async function syncNotifyFeed(body) {
  const tab = currentNotifyTab;
  let list = notifyCache[tab];
  if (!list) {
    if (notifyLoading) return;
    notifyLoading = true;
    body.innerHTML = `<div class="im-detail-loading">正在加载通知…</div>`;
    list = await fetchNotificationsTimeline(tab);
    notifyCache[tab] = list || [];
    notifyLoading = false;
  }
  if (!list.length) {
    body.innerHTML = `<div class="im-chat-empty"><p>暂无通知</p></div>`;
    return;
  }
  let html = "";
  for (const item of list) {
    if (item.type === "tweet") {
      html += msgHtml(item.tweet, true);
    } else if (item.type === "activity") {
      const iconSvg = item.icon?.includes?.("heart")
        ? `<span style="color:#f91880">${ICONS.heartFilled}</span>`
        : item.icon?.includes?.("retweet")
        ? `<span style="color:#00ba7c">${ICONS.repost}</span>`
        : `<span style="color:#1d9bf0">${ICONS.bell}</span>`;
      const usersStr = (item.users || []).map((u) => u.name || "@" + u.handle).join("、");
      const ava = (item.users || [])[0]?.avatar || "";
      const avaHtml = personAvatarHtml("im-notify-ava", usersStr || "通知", ava, item.id, true);
      const snippetHtml = item.targetTweet
        ? `<div class="im-notify-snippet" data-href="${escapeHtml(item.targetTweet.href)}">${escapeHtml(item.targetTweet.text || item.targetTweet.snippet || "")}</div>`
        : "";
      html += `<div class="im-notify-row" data-id="${escapeHtml(item.id)}">
        <div class="im-notify-icon">${iconSvg}</div>
        <div class="im-notify-main">
          <div class="im-notify-head">
            ${avaHtml}
            <div class="im-notify-desc"><b>${escapeHtml(usersStr)}</b> ${escapeHtml(item.desc || "互动了你的推文")}</div>
            ${item.time ? `<span class="im-notify-time">${escapeHtml(item.time)}</span>` : ""}
          </div>
          ${snippetHtml}
        </div>
      </div>`;
    }
  }
  body.innerHTML = html;
}

function userCardHtml(u) {
  const ava = personAvatarHtml("im-user-cell-ava", u.name, u.avatar, u.handle, true);
  return `<div class="im-user-cell" data-handle="${escapeHtml(u.handle)}">
    ${ava}
    <div class="im-user-cell-info">
      <div class="im-user-cell-name"><b>${escapeHtml(u.name)}</b> <span class="im-user-cell-handle">@${escapeHtml(u.handle)}</span></div>
      ${u.bio ? `<div class="im-user-cell-bio">${escapeHtml(u.bio)}</div>` : ""}
    </div>
  </div>`;
}

let currentSearchTab = "Top";
const searchCache = new Map();
let searchLoading = false;
let searchRenderedKey = "";
const searchSeen = new Set();

async function syncSearchFeed(body) {
  const query = new URLSearchParams(location.search).get("q") || "";
  const f = new URLSearchParams(location.search).get("f") || "";
  if (!query) {
    body.innerHTML = `<div class="im-chat-empty"><p>请输入关键词进行搜索</p></div>`;
    return;
  }
  const key = `${query}:${f || currentSearchTab}`;
  // 搜索词或 Tab 变化时，清空并重新开始
  if (searchRenderedKey !== key) {
    searchRenderedKey = key;
    searchSeen.clear();
    body.innerHTML = "";
  }

  // 1. 如果是用户 Tab
  if (f === "user" || currentSearchTab === "People") {
    const users = extractUserCells();
    for (const u of users) {
      if (searchSeen.has("u:" + u.handle)) {
        if (u.avatar) {
          const oldCell = body.querySelector(`.im-user-cell[data-handle="${escapeHtml(u.handle)}"]`);
          const oldAva = oldCell?.querySelector(".im-user-cell-ava.is-text-avatar, .im-user-cell-ava.is-grid-mask");
          if (oldAva) oldAva.outerHTML = personAvatarHtml("im-user-cell-ava", u.name, u.avatar, u.handle, true);
        }
        continue;
      }
      searchSeen.add("u:" + u.handle);
      body.insertAdjacentHTML("beforeend", userCardHtml(u));
    }
    if (searchSeen.size > 0) return;
  } else {
    // 2. 其它 Tab 优先增量提取当前原生主栏中的推文（增量追加，不重绘整个列表）
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

  // 3. 原生主栏无数据时走 GraphQL 搜索接口
  let list = searchCache.get(key);
  if (!list) {
    if (searchLoading) return;
    searchLoading = true;
    if (!searchSeen.size) body.innerHTML = `<div class="im-detail-loading">正在搜索 “${escapeHtml(query)}”…</div>`;
    list = await fetchSearchTimeline(query, f || currentSearchTab);
    searchCache.set(key, list || []);
    searchLoading = false;
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
    } else if (item.type === "user" && !searchSeen.has("u:" + item.user.handle)) {
      searchSeen.add("u:" + item.user.handle);
      body.insertAdjacentHTML("beforeend", userCardHtml(item.user));
    }
  }
}

// 场景卡片：profile=个人资料卡；search/explore=引导卡
function syncSceneCards(body) {
  const kind = routeKind();
  const guide = kind === "search" ? "search" : kind === "explore" ? "explore" : null;

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

  let guideEl = body.querySelector(".im-chat-guide");
  if (guide) {
    const html = guideCardHtml(guide);
    if (guideEl) {
      if (guideEl.dataset.kind !== guide) { guideEl.dataset.kind = guide; guideEl.innerHTML = html; }
    } else {
      guideEl = document.createElement("div");
      guideEl.className = "im-chat-guide";
      guideEl.dataset.kind = guide;
      guideEl.innerHTML = html;
      body.append(guideEl);
    }
  } else if (guideEl) {
    guideEl.remove();
  }
}

async function sendComposerText(panel) {
  if (!panel) return;
  const box = panel.querySelector(".im-chat-compose");
  const text = (box?.innerText || "").replace(/\u00a0/g, " ").trim().replace(/\n\s*$/, "");
  if (!text) { toast("请输入发帖内容"); box?.focus(); return; }
  if (sendComposerText._busy) return;
  sendComposerText._busy = true;
  box?.setAttribute("contenteditable", "false");
  try {
    if (routeKind() === "msg" && currentDmId()) {
      // 私信会话：直接驱动原生私信框发送，无弹窗
      const ok = await sendDmViaNative(text);
      if (ok) { toast("已发送"); box.innerText = ""; }
      else toast("发送失败：原生私信框未就绪");
      return;
    }
    const replyTo = panel.dataset.replyId;
    if (replyTo) {
      // 通过原生回复弹层提交（安全且带有合法签名校验，绝不跳转到 /compose/post 新发帖页）
      const sentOk = await replyViaModal(replyTo, text);
      if (sentOk) {
        toast("已回复");
        box.innerText = "";
        stopReply(panel);
      } else {
        toast("回复失败，请重试");
      }
      return;
    }

    // 全新发帖：打开官方 composer 发推（安全且带有合法签名校验）
    const sentOk = await sendViaModal(text);
    if (sentOk) {
      toast("已发布");
      box.innerText = "";
      window.setTimeout(() => location.reload(), 700);
    } else {
      toast("发布失败，请重试");
    }
  } finally {
    box?.setAttribute("contenteditable", "true");
    sendComposerText._busy = false;
  }
}

/* —— 中栏详情：点推文在 chat-body 右侧拉出详情面板（盖住列表右 ~2/3、左留窄条可滚动），header/composer 固定不动，评论区 GraphQL 自绘、不触发原生路由（返回不刷新） —— */

let detailView = null;

/** 统一开合详情面板（100% 盖住列表） */
function setDetailOpen(open) {
  detailView?.classList.toggle("is-open", open);
}

/** 关闭详情面板：优先弹原生导航栈（popstate 会自动收起面板并回到列表 URL），无栈可退时回退到打开前的路径 */
function closeDetailTo() {
  if (history.length > 1) { history.back(); return; }
  closeDetailDrawer();
  const target = detailPrevUrl || "/";
  if (target && location.pathname !== target) {
    try { history.replaceState(null, "", target); } catch { /* ignore */ }
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
  const dbody = el.querySelector(".im-detail-body");
  dbody?.addEventListener("scroll", hideQuoteFloat);
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

/** status 路由：抽屉已由 openTweetDetail 渲染则保持原样（不重复渲染防闪）；否则返回 false（中栏渲染） */
export function syncDetailDrawer() {
  const status = statusInfo();
  if (!status) {
    // 回到列表路由（浏览器后退/popstate）：收起面板并清空详情状态，列表未卸载、位置天然保留
    closeDetailDrawer();
    return false;
  }
  // 同一推文的抽屉已打开 → page 切换不重渲染，中栏推荐流冻结
  if (detailView?.classList.contains("is-open") && detailRenderedHref.includes(status.id)) return true;
  // 兜底：直接刷新落在 status URL（此时无 openTweetDetail 记录）→ 用后台已有数据渲染主推一次
  const host = document.querySelector(".im-chat-body");
  if (!host) return true;
  const el = ensureDetailView();
  if (!el) return true;
  setDetailOpen(true);
  const dbody = el.querySelector(".im-detail-body");
  const art = allTweetArticles().find(
    (n) => n.querySelector(`a[href*="/status/${status.id}"]`) || (n.innerHTML || "").includes(status.id)
  );
  const pt = art && extractTweet(art);
  detailRenderedHref = `/status/${status.id}`;
  const title = el.querySelector(".im-detail-title");
  const sub = el.querySelector(".im-detail-sub");
  if (title) title.textContent = pt?.name || "推文详情";
  if (sub) sub.textContent = pt?.handle ? `@${pt.handle} · 评论区` : "评论区";
  if (dbody && (dbody.dataset.sig || "") !== String(status.id)) {
    dbody.dataset.sig = String(status.id);
    dbody.innerHTML =
      (pt ? threadPinHtml(pt) : `<div class="im-chat-empty"><p>正在加载推文…</p></div>`) +
      `<div class="im-detail-loading">正在加载评论区…</div>`;
    if (pt) dbody.querySelector(".im-thread-pin")?.setAttribute("data-pin-id", status.id);
    // 刷新直落 status：同样走 GraphQL 自绘评论，不切原生页
    const loadedHref = `/status/${status.id}`;
    fetchTweetDetail(status.id)
      .then((detail) => {
        if (detailView !== el || !el.classList.contains("is-open") || detailRenderedHref !== loadedHref) return;
        if (detail) {
          try {
            lastThreadDetail = { id: String(status.id), detail };
            renderDetailThread(detail);
          } catch (err) {
            console.error("[x-im:detail] 兜底渲染评论抛异常:", err);
            dbody.innerHTML = `<div class="im-chat-empty"><p>该推文渲染失败</p>
              <a class="im-native-open" href="/status/${status.id}" target="_blank" rel="noopener">在 X 原生页打开</a></div>`;
          }
        } else {
          dbody.innerHTML = `<div class="im-chat-empty"><p>该推文加载失败</p>
            <a class="im-native-open" href="/status/${status.id}" target="_blank" rel="noopener">在 X 原生页打开</a></div>`;
        }
      })
      .catch((err) => {
        console.error("[x-im:detail] 兜底 fetch 评论抛异常:", err && err.message);
        dbody.innerHTML = `<div class="im-chat-empty"><p>该推文加载失败（网络/接口错误）</p>
          <a class="im-native-open" href="/status/${status.id}" target="_blank" rel="noopener">在 X 原生页打开</a></div>`;
      });
  }
  return true;
}

export function closeDetailDrawer() {
  setDetailOpen(false);
  detailRenderedHref = "";
  detailPrevUrl = "";
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
