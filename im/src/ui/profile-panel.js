// 个人资料页中栏（DISCOURSE-INTEGRATION §5.4）：头部卡 + 总结/活动/通知/徽章四个 tab。
// 头部卡数据源 = /u/:username.json（2026-08 实测：gamification_score 点数、total_followers/following、
// accepted_answers、time_read、profile_view_count、flair_*、can_follow/is_followed 均在顶层 user）。
// 原生 tab（偏好/徽章墙/邀请/结算等，§5.4.5）不接管，parseProfilePath 返回 null 走原生分支。
import { api, apiSend } from "../bridge/api.js";
import { escapeHtml } from "../utils/html.js";
import { navigateInApp } from "../bridge/router.js";
import { formatTime, stripTags, fmtDuration, fmtMonth } from "./shared/time.js";
import { avatarColor, avatarLetter, fullAvatarUrl } from "./shared/avatars.js";
import {
  FILTERS, notifRowsHtml, fetchNotifRows, profileNotifCache, ensureMarkRead,
} from "./notifications.js";

const TTL = 30_000;

const TABS = [
  { key: "summary", label: "总结" },
  { key: "activity", label: "活动" },
  { key: "notifications", label: "通知" },
  { key: "badges", label: "徽章" }
];

// 活动 tab 子导航 → user_actions.json filter id（§5.4.3；已指定/已解决为插件 id，待实测）
const ACTION_FILTERS = [
  { key: "4", label: "话题" },
  { key: "5", label: "回复" },
  { key: "1", label: "赞" }
];
const ACTION_LABEL = { 1: "点赞", 2: "被赞", 3: "投票", 4: "发话题", 5: "回复", 6: "回复", 7: "回应", 9: "私信" };

const state = {
  username: null,
  tab: "summary",
  head: null, // /u/:username.json 的 user（_for 标记归属）
  summary: null,
  badges: null,
  actionFilter: "4",
  actions: new Map(), // filter -> { items, nextOffset, loadedAt, error, loading }
  notifFilter: "all",
  notif: profileNotifCache()
};

/** `/u/<name>` 路径解析：仅接管 根/summary/activity/notifications/badges；其余返回 null */
export function parseProfilePath(pathname) {
  const m = pathname.match(/^\/u\/([^/]+)(\/.*)?$/);
  if (!m) return null;
  const rest = m[2] || "";
  const tabMatch = rest.match(/^\/(summary|activity|notifications|badges)\b/);
  if (rest && rest !== "/" && !tabMatch) return null;
  let tab = tabMatch ? tabMatch[1] : "summary";
  if (!TABS.some((t) => t.key === tab)) tab = "summary";
  return { username: decodeURIComponent(m[1]), tab };
}

/* ---------- 头部卡（/u/:username.json，实测字段直取） ---------- */

let headInflight = null; // 合并并发触发

async function ensureHead(username) {
  if (state.head?._for === username) return state.head;
  if (headInflight) return headInflight;
  headInflight = (async () => {
    try {
      const data = await api(`/u/${encodeURIComponent(username)}.json`);
      state.head = { user: data.user || {}, _for: username };
    } catch {
      state.head = { _for: username, error: true };
    }
    return state.head;
  })();
  try {
    return await headInflight;
  } finally {
    headInflight = null;
  }
}

function headHtml(head) {
  if (!head || head.error) return "";
  const u = head.user || {};
  const name = u.username || state.username;
  const avatar = u.avatar_template
    ? `<img src="${escapeHtml(fullAvatarUrl(u.avatar_template))}" alt="">`
    : `<span class="is-text-avatar is-solid" style="background:${avatarColor(name)}">${escapeHtml(avatarLetter(name))}</span>`;
  // flair 角标（TL 徽章图，实测完整 URL）；badge image_url 同为完整 URL
  const flair = u.flair_url
    ? `<span class="flair"${u.flair_bg_color ? ` style="background:#${escapeHtml(u.flair_bg_color)}"` : ""}><img src="${escapeHtml(u.flair_url)}" alt=""></span>`
    : "";
  const metrics = [
    [u.gamification_score, "点数"],
    [u.total_followers, "粉丝"],
    [u.total_following, "关注"],
    [u.accepted_answers, "解决"],
    [u.badge_count, "徽章"],
    [u.profile_view_count, "浏览"],
    [u.time_read ? fmtDuration(u.time_read) : "", "阅读"]
  ].filter(([v]) => v !== undefined && v !== null && v !== "");
  const role = u.moderator ? "版主" : u.admin ? "管理员" : "";
  return `
    <div class="im-profile-head">
      <span class="im-profile-avatar">${avatar}${flair}</span>
      <span class="im-profile-meta">
        <span class="row1">
          <span class="name">${escapeHtml(u.name || name)}</span>
          ${u.title ? `<span class="title-badge">${escapeHtml(u.title)}</span>` : ""}
          ${u.can_follow
            ? `<button type="button" class="im-profile-follow${u.is_followed ? " on" : ""}" data-follow="${u.is_followed ? "0" : "1"}">${u.is_followed ? "已关注" : "+ 关注"}</button>`
            : ""}
        </span>
        <span class="row2">@${escapeHtml(name)}${u.trust_level ? ` · TL${u.trust_level}` : ""}${role ? ` · ${role}` : ""}${u.created_at ? ` · ${fmtMonth(u.created_at)}加入` : ""}</span>
        ${u.bio_excerpt || u.bio_cooked ? `<span class="bio">${escapeHtml(stripTags(u.bio_excerpt || u.bio_cooked))}</span>` : ""}
      </span>
    </div>
    ${metrics.length ? `<div class="im-profile-metrics">${metrics.map(([v, k]) => `<span class="m"><span class="v">${escapeHtml(String(v))}</span><span class="k">${escapeHtml(k)}</span></span>`).join("")}</div>` : ""}`;
}

/* ---------- 渲染入口 ---------- */

export function renderProfilePanel(username, tab) {
  const panel = document.querySelector(".im-list-panel");
  if (!panel) return;
  const reset = state.username !== username;
  state.username = username;
  state.tab = tab;
  panel.dataset.src = "profile";
  panel.dataset.railKey = "profile";
  ensureMarkRead(panel, false); // 非通知 tab 移除「全部忽略」
  if (reset) {
    state.head = null;
    state.summary = null;
    state.badges = null;
    state.actions.clear();
    state.notif.clear();
    state.notifFilter = "all";
    state.actionFilter = "4";
  }
  ensureProfileControls(panel);

  const chips = panel.querySelector(".im-list-chips");
  chips.dataset.src = "profile";
  chips.innerHTML = TABS.map(
    (t) => `<button type="button" class="im-chip${t.key === tab ? " active" : ""}" data-ptab="${t.key}">${t.label}</button>`
  ).join("");

  const pins = panel.querySelector(".im-list-pins");
  pins.innerHTML = headHtml(state.head);
  if (!state.head) {
    ensureHead(username).then(() => {
      if (state.username === username && panel.isConnected) pins.innerHTML = headHtml(state.head);
    });
  }

  const body = panel.querySelector(".im-list-body");
  if (tab === "activity") renderActivity(body);
  else if (tab === "notifications") renderNotifTab(panel, body);
  else if (tab === "badges") renderBadges(body);
  else renderSummary(body);
}

function ensureProfileControls(panel) {
  if (panel.dataset.profileBound === "1") return;
  panel.dataset.profileBound = "1";
  panel.addEventListener("click", (e) => {
    const tabChip = e.target.closest("[data-ptab]");
    if (tabChip) {
      e.preventDefault();
      navigateInApp(`/u/${encodeURIComponent(state.username)}/${tabChip.dataset.ptab === "summary" ? "summary" : tabChip.dataset.ptab}`);
      return;
    }
    const pf = e.target.closest("[data-pfilter]");
    if (pf) {
      state.actionFilter = pf.dataset.pfilter;
      renderActivity(panel.querySelector(".im-list-body"));
      return;
    }
    const nf = e.target.closest("[data-nfilter]");
    if (nf) {
      state.notifFilter = nf.dataset.nfilter;
      renderNotifTab(panel, panel.querySelector(".im-list-body"));
      return;
    }
    const fb = e.target.closest(".im-profile-follow");
    if (fb) {
      e.preventDefault();
      const follow = fb.dataset.follow === "1";
      fb.disabled = true;
      apiSend(`/u/${encodeURIComponent(state.username)}/follow`, follow ? "PUT" : "DELETE")
        .then(() => {
          if (state.head?.user) state.head.user.is_followed = follow;
          const pins = document.querySelector(".im-list-panel .im-list-pins");
          if (pins) pins.innerHTML = headHtml(state.head);
        })
        .catch(() => {
          fb.disabled = false;
        });
    }
  });
}

function subBarHtml(items, activeKey, attr) {
  return (
    `<div class="im-profile-subbar">` +
    items.map(
      (it) =>
        `<button type="button" class="im-chip im-pfilter-chip${it.key === activeKey ? " active" : ""}" data-${attr}="${it.key}">${it.label}</button>`
    ).join("") +
    `</div>`
  );
}

/* ---------- 总结 tab（/u/:name/summary.json） ---------- */

let summaryInflight = null; // 合并并发触发

async function ensureSummary() {
  if (state.summary && Date.now() - state.summary.loadedAt < TTL) return;
  if (summaryInflight) return summaryInflight;
  summaryInflight = (async () => {
    try {
      const data = await api(`/u/${encodeURIComponent(state.username)}/summary.json`);
      state.summary = { data, loadedAt: Date.now(), error: null };
    } catch (err) {
      state.summary = { data: null, loadedAt: Date.now(), error: err?.message || "网络异常" };
    }
  })();
  try {
    return await summaryInflight;
  } finally {
    summaryInflight = null;
  }
}

function statChip(v, k) {
  return `<span class="im-stat-chip"><span class="v">${escapeHtml(String(v ?? 0))}</span><span class="k">${escapeHtml(k)}</span></span>`;
}

function topicRowHtml(t) {
  const href = `/t/${t.slug || "-"}/${t.id}`;
  return `
    <a class="im-prow" href="${escapeHtml(href)}">
      <span class="im-prow-main">
        <span class="t">${escapeHtml(t.title || t.fancy_title || "话题")}</span>
        <span class="s">${escapeHtml(`${t.posts_count || 0} 回复 · ${formatTime(t.created_at || t.bumped_at)}`)}</span>
      </span>
    </a>`;
}

function renderSummary(body) {
  const cached = state.summary;
  if (!cached) {
    body.innerHTML = `<div class="im-list-status">加载中…</div>`;
    ensureSummary().then(() => {
      if (state.tab === "summary") renderSummary(document.querySelector(".im-list-panel .im-list-body") || body);
    });
    return;
  }
  if (cached.error) {
    body.innerHTML = `<div class="im-list-status">总结加载失败（${escapeHtml(cached.error)}）</div>`;
    return;
  }
  const s = cached.data?.user_summary || {};
  const topics = cached.data?.top_topics || [];
  body.innerHTML = `
    <div class="im-profile-stats">
      ${statChip(s.post_count, "发帖")}${statChip(s.topic_count, "话题")}${statChip(s.likes_received, "获赞")}${statChip(s.days_visited, "访问天数")}
    </div>
    <div class="im-profile-section-title">热门话题</div>
    ${topics.map(topicRowHtml).join("") || `<div class="im-list-status">暂无热门话题</div>`}`;
}

/* ---------- 活动 tab（user_actions.json?filter=） ---------- */

function actionRowHtml(a) {
  const href = a.topic_id ? `/t/${a.slug || "-"}/${a.topic_id}/${a.post_number || 1}` : "";
  const name = a.username || "";
  const avatar = a.avatar_template
    ? `<img src="${escapeHtml(fullAvatarUrl(a.avatar_template))}" alt="" loading="lazy">`
    : `<span class="is-text-avatar is-solid" style="background:${avatarColor(name)}">${escapeHtml(avatarLetter(name))}</span>`;
  return `
    <a class="im-prow im-prow-av" ${href ? `href="${escapeHtml(href)}"` : ""}>
      <span class="im-prow-avatar">${avatar}</span>
      <span class="im-prow-main">
        <span class="t">${escapeHtml(a.title || "动态")}</span>
        <span class="s">${escapeHtml(`${name} · ${ACTION_LABEL[a.action_type] || "动态"} · ${formatTime(a.created_at)}`)}</span>
      </span>
    </a>`;
}

function paintActions(body, filter) {
  const cached = state.actions.get(filter);
  const items = cached?.items || [];
  body.innerHTML =
    subBarHtml(ACTION_FILTERS, filter, "pfilter") +
    (cached?.error
      ? `<div class="im-list-status">活动加载失败（${escapeHtml(cached.error)}）</div>`
      : items.length
        ? items.map(actionRowHtml).join("")
        : `<div class="im-list-status">${cached?.loading ? "加载中…" : "暂无动态"}</div>`);
}

async function loadActions(filter) {
  const cached = state.actions.get(filter) || { items: [], nextOffset: 0 };
  if (cached.loading) return;
  cached.loading = true;
  try {
    const data = await api(
      `/user_actions.json?username=${encodeURIComponent(state.username)}&filter=${filter}&offset=${cached.nextOffset}`
    );
    const items = data.user_actions || [];
    const known = new Set(cached.items.map((a) => `${a.action_type}:${a.topic_id}:${a.post_number}`));
    cached.items = cached.items.concat(items.filter((a) => !known.has(`${a.action_type}:${a.topic_id}:${a.post_number}`)));
    cached.nextOffset = cached.items.length;
    cached.loadedAt = Date.now();
    cached.error = null;
  } catch (err) {
    cached.error = err?.message || "网络异常";
    cached.loadedAt = Date.now();
  } finally {
    cached.loading = false;
    state.actions.set(filter, cached);
    if (state.tab === "activity" && state.actionFilter === filter) {
      const body = document.querySelector(".im-list-panel .im-list-body");
      if (body) paintActions(body, filter);
    }
  }
}

function renderActivity(body) {
  const filter = state.actionFilter;
  const cached = state.actions.get(filter);
  if (cached && Date.now() - (cached.loadedAt || 0) < TTL) {
    paintActions(body, filter);
    return;
  }
  body.innerHTML = subBarHtml(ACTION_FILTERS, filter, "pfilter") + `<div class="im-list-status">加载中…</div>`;
  loadActions(filter);
}

/* ---------- 通知 tab（复用通知面板渲染） ---------- */

function renderNotifTab(panel, body) {
  ensureMarkRead(panel, true);
  const filter = state.notifFilter;
  const cached = state.notif.get(filter);
  const items = cached?.items || [];
  body.innerHTML =
    subBarHtml(FILTERS, filter, "nfilter") +
    (cached?.error
      ? `<div class="im-list-status">通知加载失败（${escapeHtml(cached.error)}）</div>`
      : notifRowsHtml(items) || `<div class="im-list-status">${cached ? "暂无通知" : "加载中…"}</div>`);
  if (!cached) loadProfileNotifs(filter);
}

async function loadProfileNotifs(filter) {
  const cached = state.notif.get(filter) || { items: [], moreUrl: null };
  if (cached.loading) return;
  cached.loading = true;
  try {
    // 与通知列同源：原生 user-menu 接口 + 归一化行
    const { rows, moreUrl } = await fetchNotifRows(filter);
    cached.items = rows;
    cached.moreUrl = moreUrl;
    cached.loadedAt = Date.now();
    cached.error = null;
  } catch (err) {
    cached.error = err?.message || "网络异常";
  } finally {
    cached.loading = false;
    state.notif.set(filter, cached);
    if (state.tab === "notifications") {
      const panel = document.querySelector(".im-list-panel");
      const body = panel?.querySelector(".im-list-body");
      if (body) renderNotifTab(panel, body);
    }
  }
}

/* ---------- 徽章 tab（/user_badges.json?grouped=true） ---------- */

// badge_type_id：Discourse core 固定 1金 2银 3铜，4=无等级
const BADGE_TYPE_META = {
  1: { label: "金牌", color: "#E8A33D" },
  2: { label: "银牌", color: "#9AA4B2" },
  3: { label: "铜牌", color: "#C88A5A" },
  4: { label: "", color: "#8F959E" }
};

async function ensureBadges() {
  if (state.badges && Date.now() - state.badges.loadedAt < TTL) return;
  try {
    const data = await api(`/user_badges.json?username=${encodeURIComponent(state.username)}&grouped=true`);
    const byId = new Map((data.badges || []).map((b) => [b.id, b]));
    const rows = (data.user_badges || [])
      .map((ub) => ({ ub, b: byId.get(ub.badge_id) }))
      .filter((x) => x.b)
      .sort(
        (x, y) =>
          (x.b.badge_type_id || 4) - (y.b.badge_type_id || 4) ||
          String(y.ub.granted_at || "").localeCompare(String(x.ub.granted_at || ""))
      );
    state.badges = { rows, loadedAt: Date.now(), error: null };
  } catch (err) {
    state.badges = { rows: [], loadedAt: Date.now(), error: err?.message || "网络异常" };
  }
}

function badgeRowHtml({ ub, b }) {
  const meta = BADGE_TYPE_META[b.badge_type_id] || BADGE_TYPE_META[4];
  // 自定义徽章带 image_url（完整 URL）；系统徽章无图，按等级色画星章
  const icon = b.image_url
    ? `<img class="bicon" src="${escapeHtml(b.image_url)}" alt="" loading="lazy">`
    : `<span class="medal" style="color:${meta.color}">★</span>`;
  const count = Number(ub.count || 1) > 1 ? ` ×${ub.count}` : "";
  const href = `/u/${encodeURIComponent(state.username)}/badges/${b.id}`;
  const desc = stripTags(b.description || "");
  return `
    <a class="im-prow im-prow-av im-badge-row" href="${escapeHtml(href)}" title="${escapeHtml(`授予于 ${formatTime(ub.granted_at)}`)}">
      <span class="im-prow-avatar">${icon}</span>
      <span class="im-prow-main">
        <span class="t">${escapeHtml(b.name || "徽章")}${count}</span>
        <span class="s">${escapeHtml([desc.slice(0, 60), meta.label, formatTime(ub.granted_at)].filter(Boolean).join(" · "))}</span>
      </span>
    </a>`;
}

function renderBadges(body) {
  const cached = state.badges;
  if (!cached) {
    body.innerHTML = `<div class="im-list-status">加载中…</div>`;
    ensureBadges().then(() => {
      if (state.tab === "badges") renderBadges(document.querySelector(".im-list-panel .im-list-body") || body);
    });
    return;
  }
  body.innerHTML = cached.error
    ? `<div class="im-list-status">徽章加载失败（${escapeHtml(cached.error)}）</div>`
    : cached.rows.map(badgeRowHtml).join("") || `<div class="im-list-status">暂无徽章</div>`;
}
