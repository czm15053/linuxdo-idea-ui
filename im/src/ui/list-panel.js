import { listState, DEFAULT_LIST_NAV } from "../state/list-state.js";
import { LIST_NAV_KEY } from "../config/constants.js";
import { SKIN_ID } from "../config/skins.js";
import { ICONS } from "../config/icons.js";
import { escapeHtml } from "../utils/html.js";
import { api } from "../bridge/api.js";
import { topicIdFromPath, navigateInApp } from "../bridge/router.js";
import { chatHooks } from "./hooks.js";
import { openNewTopicComposer } from "./composer.js";
import { categoryById } from "../bridge/categories.js";
import { refreshRail } from "./rail.js";
import { onListBodyScroll } from "./list-sources.js";
import { markNotificationRead } from "./notifications.js";
import { bindSearchTrigger } from "./search-popup.js";
import { skinHooks } from "../skins/hooks.js";
import {
  formatTime,
} from "./shared/time.js";
import {
  avatarColor, avatarLetter, userDisplayName, fullAvatarUrl,
  surnameForTopic, disguiseAvatarForTopicDingtalk,
  MASK_GRID_BLUES,
  convDisplayTitle, convDisplaySummary,
} from "./shared/avatars.js";
import {
  isMaskAvatar, isHideCatTags,
  setMaskAvatar, ensureMaskAvatarToggle, ensureMaskTitleToggle,
} from "./shared/toggles.js";
import { setViewMode } from "../state/view-state.js";

let listNavOpen = (() => {
  try { return localStorage.getItem(LIST_NAV_KEY) === "1"; } catch { return false; }
})();


export function applyListNavDom() {
  const panel = document.querySelector(".im-list-panel");
  const nav = document.querySelector(".im-list-nav");
  const btn = document.querySelector(".im-list-nav-toggle");
  if (panel) panel.classList.toggle("im-list-nav-open", listNavOpen);
  if (nav) nav.classList.toggle("open", listNavOpen);
  if (btn) {
    btn.setAttribute("aria-expanded", listNavOpen ? "true" : "false");
    btn.title = listNavOpen ? "收起筛选" : "筛选";
    btn.classList.toggle("is-on", listNavOpen);
    if (!btn.dataset.iconFixed) {
      btn.dataset.iconFixed = "1";
      btn.innerHTML = ICONS.filter;
    }
  }
  if (listNavOpen) syncListNav();
}
function setListNavOpen(open) {
  listNavOpen = !!open;
  try { localStorage.setItem(LIST_NAV_KEY, listNavOpen ? "1" : "0"); } catch { /* ignore */ }
  applyListNavDom();
}
function collectListNavItems() {
  const native = document.querySelector("#navigation-bar");
  if (native) {
    const items = [...native.querySelectorAll(":scope > li > a, li > a")].map((a) => ({
      href: a.getAttribute("href") || "#",
      label: (a.textContent || "").replace(/\s+/g, " ").trim(),
      active: a.classList.contains("active") || a.getAttribute("aria-current") === "page"
    })).filter((it) => it.label && it.href && it.href !== "#");
    // 去重（有的主题 li>a 会匹配两次）
    const seen = new Set();
    const deduped = items.filter((it) => {
      if (seen.has(it.href)) return false;
      seen.add(it.href);
      return true;
    });
    if (deduped.length) return deduped;
  }
  const path = location.pathname.replace(/\/$/, "") || "/";
  return DEFAULT_LIST_NAV.map((it) => ({
    ...it,
    active: path === it.href || (it.href === "/latest" && path === "/")
  }));
}
// /top 周期筛选（p2-odds）：path 周期段 → top.json?period=
const TOP_PERIODS = [
  { path: "", label: "默认" },
  { path: "/weekly", label: "本周" },
  { path: "/monthly", label: "本月" },
  { path: "/quarterly", label: "本季" },
  { path: "/yearly", label: "今年" },
  { path: "/all", label: "史上" }
];

export function syncListNav() {
  const nav = document.querySelector(".im-list-nav");
  if (!nav) return;
  const items = collectListNavItems();
  let html = items.map((it) =>
    `<a href="${escapeHtml(it.href)}" class="${it.active ? "active" : ""}">${escapeHtml(it.label)}</a>`
  ).join("");
  const topMatch = location.pathname.match(/^\/top(\/(weekly|monthly|quarterly|yearly|all))?/);
  if (topMatch) {
    html +=
      `<div class="im-nav-period">` +
      TOP_PERIODS.map((p) =>
        `<a href="/top${p.path}" class="${(topMatch[1] || "") === p.path ? "active" : ""}">${p.label}</a>`
      ).join("") +
      `</div>`;
  }
  // 原生分类视图入口（/categories 被 IM 顶替为 latest，保留逃生门）
  html += `<a href="/categories" class="im-nav-native-cat" data-im-native-jump="1">分类目录 · 原生视图</a>`;
  if (nav.dataset.sig === html) return; // 避免无变化时触发 MutationObserver 死循环
  nav.dataset.sig = html;
  nav.innerHTML = html;
}

function bindListPanelClicks(panel) {
  // v2：含伪装头像等逻辑；旧 v1 面板需重绑
  if (!panel || panel.dataset.linkBound === "2") return;
  panel.dataset.linkBound = "2";
  panel.addEventListener("click", (e) => {
    const newTopicBtn = e.target.closest(".im-new-topic-btn");
    if (newTopicBtn && panel.contains(newTopicBtn)) {
      e.preventDefault();
      e.stopPropagation();
      openNewTopicComposer();
      return;
    }

    // 伪装按钮已在按钮自身监听；这里仍兜底一次
    const maskBtn = e.target.closest(".im-mask-avatar-toggle");
    if (maskBtn && panel.contains(maskBtn)) {
      e.preventDefault();
      e.stopPropagation();
      setMaskAvatar(!isMaskAvatar());
      return;
    }

    const btn = e.target.closest(".im-list-nav-toggle");
    if (btn && panel.contains(btn)) {
      e.preventDefault();
      e.stopPropagation();
      setListNavOpen(!listNavOpen);
      return;
    }

    // 会话/置顶/通知行：拦截默认跳转，走 Discourse SPA / pushState
    const link = e.target.closest("a.im-conv, a.im-pin, a.im-notif-row, .im-list-nav a");
    if (!link || !panel.contains(link)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    // 不因其他 handler 先行 preventDefault 而放弃接管（否则 Discourse click-track 等先注册者会让行点击失效）
    e.preventDefault();
    e.stopPropagation();
    // 原生分类视图入口：切 native 模式整页跳转，mode-fab 可切回
    if (link.dataset.imNativeJump != null) {
      e.preventDefault();
      e.stopPropagation();
      setViewMode("native");
      location.assign(link.getAttribute("href") || "/categories");
      return;
    }
    const href = link.getAttribute("href");
    if (!href || href === "#" || href.startsWith("javascript:")) return;
    e.preventDefault();
    e.stopPropagation();
    if (link.classList.contains("im-notif-row")) markNotificationRead(link);
    // 目标就是当前打开的话题：Discourse routeTo 同路径会被忽略（表现为“点了没反应”），
    // 改为滚到行指向的楼层（未渲染时由 chat-panel 远端取窗口）；跳转失败再走站内路由兜底
    const tm = href.match(/^\/t\/(?:[\w-]+\/)?(\d+)(?:\/(\d+))?/);
    const jumped = tm && Number(tm[1]) === topicIdFromPath(location.pathname)
      ? chatHooks.jumpToPost?.(Number(tm[2] || 1))
      : null;
    if (jumped) {
      Promise.resolve(jumped).then((ok) => { if (!ok) navigateInApp(href); });
      return;
    }
    navigateInApp(href);
  });
}
/** wecom 搜索框：官方 5.x 中栏顶部为搜索行；与飞书/钉钉一致，仅作入口（readonly），
 *  点击弹出全局话题搜索（bindSearchTrigger） */
function bindListSearch(panel) {
  const wrap = panel.querySelector(".im-list-search");
  if (!wrap) return;
  bindSearchTrigger(wrap);
}

export function ensureListPanel() {
  let panel = document.querySelector(".im-list-panel");
  // 旧面板缺壳层结构时重建。注意只查壳，不查 .im-chip：
  // 通知列 + 窄条皮肤会故意清空 chips，查 chip 会导致每 tick 删掉整个面板重建，
  // mousedown/mouseup 之间面板换新元素，整个列表永远点不到
  if (panel && (!panel.querySelector(".im-list-nav-toggle") || !panel.querySelector(".im-list-nav") || !panel.querySelector(".im-list-body"))) {
    panel.remove();
    panel = null;
  }
  if (panel) {
    // ensureListPanel 每次 applyTheme tick 都会跑：点击代理只许绑一次，
    // 否则叠加的 handler 会在同一次点击里连环触发 markRead/refresh，列表表现为整体点不动
    if (!panel.dataset.clicksBound) {
      panel.dataset.clicksBound = "1";
      bindListPanelClicks(panel);
    }
    bindListSearch(panel);
    ensureMaskAvatarToggle(panel);
    ensureMaskTitleToggle(panel);
    applyListNavDom();
    return panel;
  }
  panel = document.createElement("div");
  panel.className = "im-list-panel";
  const searchBox = SKIN_ID === "wecom"
    ? `<div class="im-list-search">${ICONS.search}<input type="search" placeholder="搜索" aria-label="搜索话题"></div>`
    : "";
  panel.innerHTML = `
    <div class="im-list-header">
      <button type="button" class="im-chip-icon im-list-nav-toggle" title="筛选" aria-expanded="false">${ICONS.filter}</button>
      ${searchBox}
      <div class="im-list-chips">
        <button type="button" class="im-chip active" data-chip="all">消息<span class="n"></span></button>
        <button type="button" class="im-chip" data-chip="unread">未读<span class="n"></span></button>
      </div>
      <div class="im-list-actions">
        <button type="button" class="im-icon-btn im-new-topic-btn" title="发帖（原生编辑器）">${ICONS.compose}</button>
        <button type="button" class="im-icon-btn im-mask-avatar-toggle" title="伪装头像：关（点击开启）" aria-pressed="false">${ICONS.disguise}</button>
        <button type="button" class="im-icon-btn im-mask-title-toggle" title="伪装标题：关（点击开启）" aria-pressed="false">${ICONS.win}</button>
      </div>
    </div>
    <div class="im-list-pins"></div>
    <div class="im-list-nav" role="navigation" aria-label="话题筛选"></div>
    <div class="im-list-body"></div>
  `;
  document.body.appendChild(panel);
  panel.dataset.clicksBound = "1";
  bindListPanelClicks(panel);
  bindListSearch(panel);
  ensureMaskAvatarToggle(panel);
  ensureMaskTitleToggle(panel);
  panel.querySelector(".im-list-body").addEventListener("scroll", () => {
    onListBodyScroll(panel.querySelector(".im-list-body"));
  });
  applyListNavDom();
  return panel;
}
export function topicHref(topic) {
  return `/t/${topic.slug || "topic"}/${topic.id}`;
}
function convAvatarHtml(topic, usersById) {
  const skinAvatar = skinHooks.convAvatar?.(topic);
  if (skinAvatar) return skinAvatar;
  if (isMaskAvatar()) {
    const d = (skinHooks.disguiseAvatar || disguiseAvatarForTopicDingtalk)(topic);
    return `<span class="im-conv-avatar${d.className ? " " + d.className : ""}" style="background:${d.bg};${d.styleExtra}">${d.html}</span>`;
  }
  if (isGroupConversation(topic)) {
    return groupAvatarHtml(topic, usersById || {});
  }
  const poster = (topic.posters || [])[0];
  const user = poster && usersById ? usersById[poster.user_id] : null;
  const displayName = userDisplayName(user, topic.last_poster_username || "?");
  if (user && user.avatar_template) {
    return `<span class="im-conv-avatar"><img src="${escapeHtml(fullAvatarUrl(user.avatar_template))}" alt="" loading="lazy"></span>`;
  }
  return `<span class="im-conv-avatar is-text-avatar is-solid" style="background:${avatarColor(displayName)}">${escapeHtml(avatarLetter(displayName))}</span>`;
}
function convCategoryTag(topic) {
  // 飞书皮肤不显示分类标签（钉钉/企微保留）
  if (SKIN_ID === "feishu" || isHideCatTags() || !topic.category_id) return "";
  const cat = categoryById(topic.category_id);
  if (!cat) return "";
  return `<span class="im-conv-tag">${escapeHtml(cat.name)}</span>`;
}
function convRowHtml(topic, usersById) {
  const unread = topic.unread > 0 ? topic.unread : (topic.new_posts > 0 ? topic.new_posts : 0);
  const replyCount = Math.max(0, (topic.posts_count || 1) - 1);
  const rawSummary = topic.last_poster_username
    ? `[${replyCount}条] ${topic.last_poster_username}`
    : `${topic.posts_count || 0} 回复`;
  const title = convDisplayTitle(topic);
  const summary = convDisplaySummary(topic, rawSummary);
  // 匿名模式隐藏分类 chip，避免暴露真实板块
  const tag = isMaskAvatar() ? "" : convCategoryTag(topic);
  return `
    <a class="im-conv" href="${escapeHtml(topicHref(topic))}" data-topic-id="${topic.id}" title="${escapeHtml(title)}">
      ${convAvatarHtml(topic, usersById)}
      <span class="im-conv-info">
        <span class="im-conv-top">
          <span class="im-conv-title">
            <span class="im-conv-name">${escapeHtml(title)}</span>
            ${tag}
          </span>
          <span class="im-conv-time">${escapeHtml(formatTime(topic.bumped_at || topic.last_activity_at || topic.created_at))}</span>
        </span>
        <span class="im-conv-bottom">
          <span class="im-conv-msg">${escapeHtml(summary)}</span>
          ${unread ? `<span class="im-conv-badge">${unread > 99 ? "99+" : unread}</span>` : ""}
        </span>
      </span>
    </a>`;
}
function isGroupConversation(topic) {
  return Math.abs(Number(topic.id) || 0) % 2 === 1;
}
function mulberry32(a) {
  a |= 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededShuffle(arr, seed) {
  const rng = mulberry32(seed);
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function groupAvatarHtml(topic, usersById) {
  // 用整页列表用户池拼 3×3 九宫格：列表池通常≥9 人，可拼满，缺格用姓氏占位补足
  const all = Object.values(usersById || {})
    .filter((u) => u && u.avatar_template)
    .map((u) => u.avatar_template);
  const seed = Math.abs(Number(topic.id) || 0);
  // 固定 3×3 正方形拼接：按话题种子稳定"随机"，重渲染不跳变
  const n = 3;
  const tpls = seededShuffle(all, seed || 1).slice(0, n * n);
  const placeholder = surnameForTopic(topic);
  const cells = [];
  for (let i = 0; i < n * n; i++) {
    const tpl = tpls[i];
    if (tpl) {
      cells.push(`<img src="${escapeHtml(fullAvatarUrl(tpl))}" alt="" loading="lazy">`);
    } else {
      const color = MASK_GRID_BLUES[(seed + i) % MASK_GRID_BLUES.length];
      cells.push(`<span style="background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;line-height:1;">${escapeHtml(placeholder)}</span>`);
    }
  }
  return `<span class="im-conv-avatar is-group" style="grid-template-columns: repeat(${n}, 1fr); grid-template-rows: repeat(${n}, 1fr);">${cells.join("")}</span>`;
}
export function renderListRows() {
  const body = document.querySelector(".im-list-body");
  if (!body) return;
  // 本地搜索：按标题过滤当前已加载话题（不重新请求）
  const q = (listState.query || "").trim().toLowerCase();
  const topics = q
    ? listState.topics.filter((t) => `${t.title || ""} ${t.slug || ""}`.toLowerCase().includes(q))
    : listState.topics;
  const status = q && !topics.length
    ? "没有匹配的话题"
    : listState.moreUrl ? "下拉加载更多…" : (listState.topics.length ? "没有更多了" : "");
  renderTopicListRows(topics, listState.usersById, status);
  syncListChips();
  skinHooks.renderPins?.();
}

/** 话题行列表渲染（chat/私信源共用，书签源行结构不同不适用） */
// 列表 body -> 上次写入的行 HTML（内容签名，见 renderTopicListRows）
const bodySigs = new WeakMap();

export function renderTopicListRows(topics, usersById, statusLine) {
  const body = document.querySelector(".im-list-body");
  if (!body) return;
  // 同 renderNotifications：内容没变不重写，避免 tick 级节点置换杀死行点击
  const html =
    (topics || []).map((t) => convRowHtml(t, usersById || {})).join("") +
    `<div class="im-list-status">${escapeHtml(statusLine || "")}</div>`;
  if (bodySigs.get(body) !== html) {
    bodySigs.set(body, html);
    body.innerHTML = html;
  }
  syncListActive();
}
/** 中栏 chips 计数：消息 = 已加载话题数，未读 = unread/new_posts 求和 */
function syncListChips() {
  const allN = document.querySelector('.im-chip[data-chip="all"] .n');
  const unreadN = document.querySelector('.im-chip[data-chip="unread"] .n');
  if (allN) allN.textContent = listState.topics.length ? String(listState.topics.length) : "";
  if (unreadN) {
    const n = listState.topics.reduce((sum, t) => sum + (t.unread || 0) + (t.new_posts || 0), 0);
    unreadN.textContent = n > 0 ? String(n > 99 ? "99+" : n) : "";
  }
}
export function syncListActive() {
  const currentId = topicIdFromPath(location.pathname);
  for (const row of document.querySelectorAll(".im-conv")) {
    row.classList.toggle("active", currentId != null && Number(row.dataset.topicId) === currentId);
  }
}
function applyListJson(data, append) {
  const topics = (data.topic_list && data.topic_list.topics) || [];
  const users = data.users || [];
  const usersById = append ? { ...(listState.usersById || {}) } : {};
  for (const u of users) usersById[u.id] = u;
  listState.usersById = usersById;
  const existing = new Set(append ? listState.topics.map((t) => t.id) : []);
  const fresh = topics.filter((t) => !existing.has(t.id));
  listState.topics = append ? listState.topics.concat(fresh) : topics;
  const more = data.topic_list && data.topic_list.more_topics_url;
  listState.moreUrl = more ? more.replace(/\.json\b/, ".json") : null;
  renderListRows();
  refreshRail();
}
export async function loadList(apiPath, force) {
  if (!apiPath) return;
  // 用列表 API 做缓存键：进帖子时 pathname 会变，但不应重拉会话列表
  if (!force && listState.apiPath === apiPath && listState.topics.length) {
    syncListActive();
    return;
  }
  if (listState.loading) return;
  listState.loading = true;
  listState.apiPath = apiPath;
  try {
    const data = await api(apiPath);
    applyListJson(data, false);
  } catch {
    const body = document.querySelector(".im-list-body");
    if (body) body.innerHTML = `<div class="im-list-status">列表加载失败，请点右上角刷新重试</div>`;
  } finally {
    listState.loading = false;
  }
}
export async function loadMoreList() {
  if (!listState.moreUrl || listState.loading) return;
  listState.loading = true;
  try {
    const data = await api(listState.moreUrl);
    applyListJson(data, true);
  } catch { /* 保留现状 */ } finally {
    listState.loading = false;
  }
}
