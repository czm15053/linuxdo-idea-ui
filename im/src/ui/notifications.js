// 通知详情列（DISCOURSE-INTEGRATION §5.2）：接口与原生 user-menu 完全同款（2026-08 实测）——
// 全部/回复/赞/分配/聊天/其他 → GET /notifications?limit=30&recent=true&silent=true[&filter_by_types=…]，
// 私信 → /u/:username/user-menu-private-messages（topics+users 形状），
// 书签 → /u/:username/user-menu-bookmarks（bookmarks 形状）。
// 行渲染供资料页·通知 tab（§5.4.4）复用；type 25=回应、801=Boost（站点定制，实测锚定）。
import { api, apiSend } from "../bridge/api.js";
import { escapeHtml } from "../utils/html.js";
import { getCurrentUsername } from "../bridge/user.js";
import { formatTime, stripTags } from "./shared/time.js";
import { avatarColor, avatarLetter, fullAvatarUrl } from "./shared/avatars.js";
import { refreshRail, getUnreadNotificationCount } from "./rail.js";
import { activeRailKey, setActiveRailKey } from "./list-sources.js";

// Discourse core notification_type 数字（实测锚定：2 回复 5 赞 12 徽章 25 回应 801 Boost）
const TYPE_GLYPHS = {
  1: "@", 14: "@", // 提及 / 群组提及
  2: "↩", // 回复
  3: "❝", // 引用
  4: "✎", // 编辑
  5: "♥", 18: "♥", // 赞 / 合并赞
  6: "✉", 7: "✉", // 私信 / 邀请进私信
  12: "🏅", // 徽章
  801: "⚡" // Boost（站点定制）
};

// chip 与原生 user-menu tab 同一套；filter_by_types 逐字抄自原生请求
export const FILTERS = [
  { key: "all", label: "全部" },
  { key: "replied", label: "回复", types: "mentioned,group_mentioned,posted,quoted,replied" },
  { key: "liked", label: "赞", types: "liked,liked_consolidated,reaction" },
  { key: "private", label: "私信", kind: "pm" },
  { key: "bookmarks", label: "书签", kind: "bookmarks" },
  { key: "assigned", label: "分配", types: "assigned" },
  { key: "chat", label: "聊天", types: "chat_invitation,chat_mention,chat_message,chat_quoted,chat_watched_thread" },
  {
    key: "other", label: "其他",
    types: "edited,invited_to_private_message,invitee_accepted,moved_post,linked,granted_badge,invited_to_topic,custom,watching_first_post,topic_reminder,post_approved,code_review_commit_approved,membership_request_accepted,membership_request_consolidated,votes_released,event_reminder,event_invitation,chat_group_mention,question_answer_user_commented,watching_category_or_tag,new_features,admin_problems,linked_consolidated,upcoming_change_available,upcoming_change_automatically_promoted,boost,suggested_edit_created,suggested_edit_accepted,following,following_created_topic,following_replied,circles_activity,resenha_invitation"
  }
];

const MARK_ALL_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 13l4 4L15 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 13l4 4 8-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/></svg>`;

// 窄条筛选图标：空心线条风（对齐飞书窄条观感与项目自绘 icon 的 stroke 风格），
// 槽位语义与原生 user-menu tab 一致（铃铛/回复/心/信封/书签/人加/气泡/其他）。
const OUTLINE_ICON = (body) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const FILTER_ICONS = {
  all: OUTLINE_ICON(`<path d="M6 16.2h12l-1.2-2.2a6.6 6.6 0 0 1-.8-3.2V9.5a4 4 0 1 0-8 0v1.3c0 1.14-.27 2.2-.8 3.2L6 16.2Z"/><path d="M10 18.5a2 2 0 0 0 4 0"/>`),
  replied: OUTLINE_ICON(`<path d="M9.5 14.5 4.5 9.5l5-5"/><path d="M4.5 9.5h9.5a5.5 5.5 0 0 1 0 11h-3"/>`),
  liked: OUTLINE_ICON(`<path d="M12 20.3 4.9 13a4.7 4.7 0 0 1 0-6.6 4.5 4.5 0 0 1 6.4 0l.7.7.7-.7a4.5 4.5 0 0 1 6.4 0 4.7 4.7 0 0 1 0 6.6L12 20.3Z"/>`),
  private: OUTLINE_ICON(`<rect x="4" y="6" width="16" height="12" rx="2"/><path d="m5 8 7 5 7-5"/>`),
  bookmarks: OUTLINE_ICON(`<path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-4-6 4V5.5a1 1 0 0 1 1-1Z"/>`),
  assigned: OUTLINE_ICON(`<circle cx="10" cy="8.5" r="3.2"/><path d="M4.5 19.5a5.5 5.5 0 0 1 11 0"/><path d="M18.5 8v5M16 10.5h5"/>`),
  chat: OUTLINE_ICON(`<path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.2A.8.8 0 0 1 4.5 18.6V6.5Z"/>`),
  other: OUTLINE_ICON(`<rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.5"/><rect x="13" y="4.5" width="6.5" height="6.5" rx="1.5"/><rect x="4.5" y="13" width="6.5" height="6.5" rx="1.5"/><circle cx="16.25" cy="16.25" r="1" fill="currentColor" stroke="none"/>`)
};

// 列表 body -> 上次写入的行 HTML（内容签名；面板重建换 body 后自然失效）
const bodySigs = new WeakMap();

const state = {
  byFilter: new Map(), // filter -> { rows, moreUrl, loadedAt, error }
  filter: "all",
  loading: false
};
const TTL = 30_000;

function who(n) {
  const acting = String(n.acting_user_name || "").replace(/\([^)]*\)|（[^）]*）/g, "").trim();
  return acting || n.data?.display_username || n.data?.original_username || n.data?.username || "系统";
}

// 概述文案：按实测 notification_type 给动词；未知类型兜底"互动"
function summaryOf(n) {
  const name = who(n);
  const t = n.data?.topic_title || "";
  const count = Number(n.data?.count || 0);
  const consolidated = /^\d+ 个回复$/.test(String(n.data?.display_username || ""));
  switch (n.notification_type) {
    case 1:
    case 14:
      return `${name} 在《${t}》中提到了你`;
    case 2:
      if (consolidated) return `${n.data.display_username} · 《${t}》`;
      return `${name} 回复了《${t}》`;
    case 3:
      return `${name} 在《${t}》中引用了你`;
    case 4:
      return `${name} 编辑了《${t}》`;
    case 5:
      return count > 1 ? `${name} 等 ${count} 人赞了《${t}》` : `${name} 赞了《${t}》`;
    case 6:
    case 7:
      return `${name}：${t}`;
    case 12:
      return `获得徽章「${n.data?.badge_name || ""}」`;
    case 25:
      return `${name} 回应了《${t}》`;
    case 801:
      return `${name} 与《${t}》互动`;
    default:
      return name !== "系统" ? `${name} 与你互动：《${t}》` : `《${t}》有新动态`;
  }
}

function glyphOf(n) {
  if (n.notification_type === 25) return n.data?.reaction_icon === "heart" ? "♥" : "☻";
  return TYPE_GLYPHS[n.notification_type] || "•";
}

/** 三种响应形状（notifications / 私信 topics / 书签）→ 统一行
 *  { id?, href, name, avatar, time, msg, unread, icon } */
function normalizeResponse(f, data) {
  if (f.kind === "pm") {
    const users = new Map((data.users || []).map((u) => [u.username, u]));
    const rows = (data.topics || []).map((t) => {
      const name = t.last_poster_username || "system";
      const u = users.get(name);
      return {
        href: `/t/${t.slug || "topic"}/${t.id}`,
        name,
        avatar: u?.avatar_template,
        time: t.last_posted_at || t.created_at,
        msg: t.title || "",
        unread: (t.unread_posts || 0) > 0 || !!t.unseen,
        icon: "✉"
      };
    });
    return { rows, moreUrl: null };
  }
  if (f.kind === "bookmarks") {
    const rows = (data.bookmarks || []).map((b) => ({
      href: normalizePath(b.bookmarkable_url || `/t/${b.slug || "topic"}/${b.topic_id}/${b.linked_post_number || 1}`),
      name: b.user?.username || "?",
      avatar: b.user?.avatar_template,
      time: b.created_at,
      msg: stripTags(b.fancy_title || b.title || ""),
      unread: false,
      icon: "★"
    }));
    return { rows, moreUrl: null };
  }
  const rows = (data.notifications || []).map((n) => ({
    id: n.id,
    href: n.topic_id ? `/t/${n.slug || "topic"}/${n.topic_id}/${n.post_number || 1}` : "",
    name: who(n),
    avatar: n.acting_user_avatar_template || n.avatar_template,
    time: n.created_at,
    msg: summaryOf(n),
    unread: !n.read,
    icon: glyphOf(n)
  }));
  return {
    rows,
    moreUrl: data.load_more_notifications ? normalizePath(data.load_more_notifications) : null
  };
}


function filterPath(f) {
  if (f.kind === "pm" || f.kind === "bookmarks") {
    const name = encodeURIComponent(getCurrentUsername() || "");
    return `/u/${name}/user-menu-${f.kind === "pm" ? "private-messages" : "bookmarks"}`;
  }
  // 与原生 user-menu 请求同参（recent+silent）；bump_last_seen_reviewable 不带，避免副作用
  const qs = new URLSearchParams({ limit: "30", recent: "true", silent: "true" });
  if (f.types) qs.set("filter_by_types", f.types);
  return `/notifications?${qs.toString()}`;
}

/** 拉取一页并归一化（供本列与资料页·通知 tab 共用） */
export async function fetchNotifRows(filterKey) {
  const f = FILTERS.find((x) => x.key === filterKey) || FILTERS[0];
  const data = await api(filterPath(f));
  return normalizeResponse(f, data);
}

function avatarHtml(row) {
  if (row.avatar) {
    return `<img src="${escapeHtml(fullAvatarUrl(row.avatar))}" alt="" loading="lazy">`;
  }
  return `<span class="is-text-avatar is-solid" style="background:${avatarColor(row.name)}">${escapeHtml(avatarLetter(row.name))}</span>`;
}

/** 行列表 html（通知面板与资料页·通知 tab 共用，§5.4.4） */
export function notifRowsHtml(items) {
  return (items || []).map(rowHtml).join("");
}

function rowHtml(n) {
  // 无话题的通知（徽章/系统类）没有落地页：渲染为不可点的 span，避免“点了没反应”
  const tag = n.href ? "a" : "span";
  const dead = n.href ? "" : " dead";
  return `
    <${tag} class="im-notif-row${n.unread ? " unread" : ""}${dead}" ${n.href ? `href="${escapeHtml(n.href)}"` : ""} ${n.id ? `data-notif-id="${n.id}"` : ""}>
      <span class="im-notif-avatar">${avatarHtml(n)}<span class="im-notif-type">${n.icon || "•"}</span></span>
      <span class="im-notif-info">
        <span class="im-notif-top"><span class="im-notif-name">${escapeHtml(n.name)}</span><span class="im-notif-time">${escapeHtml(formatTime(n.time))}</span></span>
        <span class="im-notif-msg">${escapeHtml(n.msg)}</span>
      </span>
    </${tag}>`;
}

function normalizePath(url) {
  return String(url).replace(/^https?:\/\/[^/]+\//, "/");
}

function setBodyStatus(panel, text) {
  const body = panel?.querySelector(".im-list-body");
  if (body) body.innerHTML = `<div class="im-list-status">${escapeHtml(text)}</div>`;
}

/** 渲染通知列到 list-panel（供 list-sources 调用） */
export function renderNotifications(panel) {
  const chips = panel.querySelector(".im-list-chips");
  // 窄条皮肤：类型筛选在 .im-strip，顶部不放 chips（空容器由 CSS 隐藏）
  if (document.querySelector('.im-strip[data-ver="2"]')) {
    chips.dataset.src = "notifications-v2";
    chips.innerHTML = "";
  } else if (chips.dataset.src !== "notifications-v2") {
    chips.dataset.src = "notifications-v2";
    chips.innerHTML = FILTERS.map(
      (f) =>
        `<button type="button" class="im-chip im-ntype-chip" data-ntype="${f.key}">${f.label}<span class="n"></span></button>`
    ).join("");
    for (const chip of chips.querySelectorAll("[data-ntype]")) {
      chip.classList.toggle("active", chip.dataset.ntype === state.filter);
    }
  }
  ensureMarkRead(panel, true);
  syncNotifStrip();

  const cached = state.byFilter.get(state.filter);
  const body = panel.querySelector(".im-list-body");
  if (!cached && !state.loading) {
    setBodyStatus(panel, "加载中…");
    loadFilter(state.filter);
    return;
  }
  const rows = cached?.rows || [];
  const html = cached?.error
    ? `<div class="im-list-status">通知加载失败（${escapeHtml(cached.error)}）</div>`
    : rows.map(rowHtml).join("") +
      `<div class="im-list-status">${cached?.moreUrl ? "下拉加载更多…" : rows.length ? "没有更多了" : "暂无通知"}</div>`;
  // applyTheme 每次 tick 都会走到这里：内容没变就不重写 innerHTML，
  // 否则行节点被持续拆建，mousedown/mouseup 分家，整个列表表现为点不动
  if (bodySigs.get(body) !== html) {
    bodySigs.set(body, html);
    body.innerHTML = html;
  }
}

async function loadFilter(filter, { force } = {}) {
  if (state.loading) return;
  const cached = state.byFilter.get(filter);
  if (!force && cached && Date.now() - cached.loadedAt < TTL) return;
  state.loading = true;
  try {
    const { rows: incoming, moreUrl } = await fetchNotifRows(filter);
    const prev = force && cached ? cached.rows : [];
    const seen = new Set(prev.map((r) => r.id).filter(Boolean));
    state.byFilter.set(filter, {
      rows: prev.concat(incoming.filter((r) => !r.id || !seen.has(r.id))),
      moreUrl,
      loadedAt: Date.now(),
      error: null
    });
  } catch (err) {
    state.byFilter.set(filter, {
      ...(cached || { rows: [], moreUrl: null }),
      loadedAt: Date.now(),
      error: err?.message || "网络异常"
    });
  } finally {
    state.loading = false;
    const panel = document.querySelector(".im-list-panel");
    if (panel && panel.dataset.railKey === "notifications") renderNotifications(panel);
  }
}

/** 切换通知筛选并确保通知列在前（窄条 / 顶部 chips 共用入口） */
export function setNotifFilter(key) {
  if (!FILTERS.some((f) => f.key === key)) return;
  state.filter = key;
  setActiveRailKey("notifications", { force: true }); // 跨列 / 资料页占用时切回并渲染
  syncNotifStrip();
  const panel = document.querySelector(".im-list-panel");
  if (panel && panel.dataset.railKey === "notifications") renderNotifications(panel);
  loadFilter(key);
}

/** chip 点击（list-sources 委托转发） */
export function onNotificationsChip(chip) {
  setNotifFilter(chip.dataset.ntype);
}

/* ---------- 通知筛选窄条（飞书皮肤 .im-strip，替代原装饰假条） ---------- */

/** 构建筛选窄条；旧装饰条（项上无 data-ntype）重建。仅窄条皮肤（飞书）由分派层调用 */
export function ensureNotifStrip() {
  let strip = document.querySelector(".im-strip");
  // 误挂进窄条的原生 user-menu 挪回 body
  const trapped = strip?.querySelector(".user-menu");
  if (trapped) document.body.appendChild(trapped);
  // data-ver 换代时重建（FILTERS 语义升级后旧条残留旧按钮）
  if (strip && strip.dataset.ver === "2" && strip.querySelector(".im-strip-item[data-ntype]")) {
    syncNotifStrip();
    return strip;
  }
  strip?.remove();
  strip = document.createElement("nav");
  strip.className = "im-strip";
  strip.dataset.ver = "2";
  strip.setAttribute("aria-label", "通知筛选");
  strip.innerHTML = FILTERS.map((f) =>
    `<button type="button" class="im-strip-item" data-ntype="${f.key}" title="${f.label}" aria-pressed="false">` +
    `${FILTER_ICONS[f.key] || FILTER_ICONS.all}` +
    (f.key === "all" ? `<span class="im-strip-badge" style="display:none"></span>` : "") +
    `</button>`
  ).join("");
  strip.addEventListener("click", (e) => {
    const btn = e.target.closest(".im-strip-item[data-ntype]");
    if (!btn) return;
    e.preventDefault();
    setNotifFilter(btn.dataset.ntype);
  });
  document.body.appendChild(strip);
  syncNotifStrip();
  return strip;
}

/** 窄条高亮与「全部」未读角标同步（切列 / 筛选 / 角标刷新共用） */
export function syncNotifStrip() {
  const strip = document.querySelector(".im-strip");
  if (!strip) return;
  const active = activeRailKey() === "notifications" ? state.filter : null;
  for (const btn of strip.querySelectorAll(".im-strip-item[data-ntype]")) {
    const on = btn.dataset.ntype === active;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  }
  const badge = strip.querySelector('.im-strip-item[data-ntype="all"] .im-strip-badge');
  if (badge) {
    const n = getUnreadNotificationCount();
    badge.style.display = n > 0 ? "" : "none";
    badge.textContent = n > 99 ? "99+" : String(n);
  }
}

/** 内容区滚动触底加载（list-sources 委托转发） */
export function notificationsScroll(body) {
  if (!body || body.scrollTop + body.clientHeight < body.scrollHeight - 120) return;
  const cached = state.byFilter.get(state.filter);
  if (!cached?.moreUrl || state.loading) return;
  state.loading = true;
  api(cached.moreUrl)
    .then((data) => {
      const f = FILTERS.find((x) => x.key === state.filter) || FILTERS[0];
      const { rows, moreUrl } = normalizeResponse(f, data);
      cached.rows = cached.rows.concat(rows);
      cached.moreUrl = moreUrl;
      cached.loadedAt = Date.now();
    })
    .catch(() => {})
    .finally(() => {
      state.loading = false;
      const panel = document.querySelector(".im-list-panel");
      if (panel && panel.dataset.railKey === "notifications") renderNotifications(panel);
    });
}

/** 行点击后的本地已读 + 刷新角标（list-panel 点击委托转发；仅通知行有 id） */
export function markNotificationRead(row) {
  const id = Number(row?.dataset?.notifId);
  if (!id) return;
  for (const { rows } of state.byFilter.values()) {
    const r = rows.find((x) => x.id === id);
    if (r && r.unread) {
      r.unread = false;
      apiSend(`/notifications/read?id=${id}`, "PUT").then(refreshRail).catch(() => {});
      break;
    }
  }
}

/** 全部忽略（资料页·通知 tab 复用）：清两处缓存 + 刷角标 */
export async function markAllNotificationsRead() {
  await apiSend("/notifications/mark-read", "PUT");
  state.byFilter.clear();
  profileCache.clear();
  refreshRail();
}

// 资料页通知 tab 的独立缓存（profile-panel 持有，markAll 后联动清空）
const profileCache = new Map();

export function profileNotifCache() {
  return profileCache;
}

async function markAllRead() {
  const panel = document.querySelector(".im-list-panel");
  try {
    await markAllNotificationsRead();
    if (panel && panel.dataset.railKey === "notifications") renderNotifications(panel);
  } catch {
    setBodyStatus(panel, "操作失败，请重试");
  }
}

/** 「全部忽略」按钮挂载/卸载（onHide 钩子传 false 移除） */
export function ensureMarkRead(panel, on) {
  let btn = panel.querySelector(".im-mark-read");
  if (on) {
    if (btn) return;
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "im-icon-btn im-mark-read";
    btn.title = "全部忽略";
    btn.innerHTML = MARK_ALL_SVG;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      markAllRead();
    });
    panel.querySelector(".im-list-actions")?.prepend(btn);
  } else {
    btn?.remove();
  }
}
