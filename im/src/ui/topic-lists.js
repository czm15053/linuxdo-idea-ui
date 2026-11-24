// rail「私信 / 书签」内容源与装饰项占位（DISCOURSE-INTEGRATION §5.2）。
// 私信 topic_list 与会话列表同构，行渲染复用 renderTopicListRows；
// 书签 /bookmarks.json 为 BookmarkSerializer 结构，行渲染单独适配。
import { api } from "../bridge/api.js";
import { ICONS } from "../config/icons.js";
import { RAIL_DECO_ITEMS } from "../config/skins.js";
import { escapeHtml } from "../utils/html.js";
import { getCurrentUsername } from "../bridge/user.js";
import { categoryById } from "../bridge/categories.js";
import { formatTime } from "./shared/time.js";
import { convDisplayTitle, fullAvatarUrl } from "./shared/avatars.js";
import { renderTopicListRows } from "./list-panel.js";
import { registerSource } from "./list-sources.js";

const TTL = 30_000;

/* ---------- 私信：/topics/private-messages/<username>.json ---------- */

function makeTopicListSource({ key, getApiPath, label }) {
  const state = { topics: [], usersById: {}, moreUrl: null, loading: false, loadedAt: 0, error: null };

  async function load(force) {
    if (state.loading) return;
    if (!force && state.topics.length && Date.now() - state.loadedAt < TTL) return;
    state.loading = true;
    try {
      const data = await api(getApiPath());
      const topics = (data.topic_list && data.topic_list.topics) || [];
      const usersById = {};
      for (const u of data.users || []) usersById[u.id] = u;
      state.topics = topics;
      state.usersById = usersById;
      state.moreUrl = data.topic_list?.more_topics_url || null;
      state.loadedAt = Date.now();
      state.error = null;
    } catch (err) {
      state.error = err?.message || "网络异常";
    } finally {
      state.loading = false;
      rerenderIfActive();
    }
  }

  function rerenderIfActive() {
    const panel = document.querySelector(".im-list-panel");
    if (panel && panel.dataset.railKey === key) render(panel);
  }

  function render(panel) {
    const chips = panel.querySelector(".im-list-chips");
    if (chips.dataset.src !== label) {
      chips.dataset.src = label;
      chips.innerHTML = `<span class="im-chip active im-src-label">${escapeHtml(label)}</span>`;
    }
    const body = panel.querySelector(".im-list-body");
    if (state.error && !state.topics.length) {
      body.innerHTML = `<div class="im-list-status">${escapeHtml(label)}加载失败（${escapeHtml(state.error)}）</div>`;
      return;
    }
    if (!state.topics.length && !state.loading && Date.now() - state.loadedAt > TTL) {
      body.innerHTML = `<div class="im-list-status">加载中…</div>`;
      load(true);
      return;
    }
    renderTopicListRows(
      state.topics,
      state.usersById,
      state.moreUrl ? "下拉加载更多…" : (state.topics.length ? "没有更多了" : `暂无${label}`)
    );
  }

  return {
    render,
    onScroll(body) {
      if (!state.moreUrl || state.loading) return;
      if (body.scrollTop + body.clientHeight < body.scrollHeight - 120) return;
      state.loading = true;
      api(state.moreUrl)
        .then((data) => {
          const topics = (data.topic_list && data.topic_list.topics) || [];
          const known = new Set(state.topics.map((t) => t.id));
          state.topics = state.topics.concat(topics.filter((t) => !known.has(t.id)));
          state.moreUrl = data.topic_list?.more_topics_url || null;
          state.loadedAt = Date.now();
        })
        .catch(() => {})
        .finally(() => {
          state.loading = false;
          rerenderIfActive();
        });
    }
  };
}

/* ---------- 书签：/bookmarks.json（BookmarkSerializer 结构） ---------- */

function makeBookmarkSource() {
  const state = { items: [], moreUrl: null, loading: false, loadedAt: 0, error: null };

  async function load() {
    if (state.loading) return;
    if (state.items.length && Date.now() - state.loadedAt < TTL) return;
    state.loading = true;
    try {
      const data = await api("/bookmarks.json");
      state.items = data.bookmarks || [];
      state.moreUrl = data.more_bookmarks_url || null;
      state.loadedAt = Date.now();
      state.error = null;
    } catch (err) {
      state.error = err?.message || "网络异常";
    } finally {
      state.loading = false;
      rerenderIfActive();
    }
  }

  function rerenderIfActive() {
    const panel = document.querySelector(".im-list-panel");
    if (panel && panel.dataset.railKey === "bookmarks") render(panel);
  }

  function rowHtml(b) {
    const cat = b.category_id ? categoryById(b.category_id) : null;
    const title = b.title || b.name || b.fancy_title || "书签";
    const href = b.topic_id ? `/t/-/${b.topic_id}/${b.linked_post_number || 1}` : "";
    return `
      <a class="im-conv im-bm-row" ${href ? `href="${escapeHtml(href)}"` : ""} data-topic-id="${b.topic_id || ""}" title="${escapeHtml(title)}">
        <span class="im-conv-avatar is-solid" style="background:linear-gradient(135deg,#F0A63A,#D97706);color:#fff;display:inline-flex;align-items:center;justify-content:center">${ICONS.bookmark}</span>
        <span class="im-conv-info">
          <span class="im-conv-top">
            <span class="im-conv-title"><span class="im-conv-name">${escapeHtml(title)}</span></span>
            <span class="im-conv-time">${escapeHtml(formatTime(b.updated_at || b.created_at))}</span>
          </span>
          <span class="im-conv-bottom">
            <span class="im-conv-msg">${escapeHtml(cat ? cat.name : (b.tags || []).join(" / ") || "书签")}</span>
          </span>
        </span>
      </a>`;
  }

  function render(panel) {
    const chips = panel.querySelector(".im-list-chips");
    if (chips.dataset.src !== "bookmarks") {
      chips.dataset.src = "bookmarks";
      chips.innerHTML = `<span class="im-chip active im-src-label">书签</span>`;
    }
    const body = panel.querySelector(".im-list-body");
    if (state.error && !state.items.length) {
      body.innerHTML = `<div class="im-list-status">书签加载失败（${escapeHtml(state.error)}）</div>`;
      return;
    }
    if (!state.items.length && !state.loading && Date.now() - state.loadedAt > TTL) {
      body.innerHTML = `<div class="im-list-status">加载中…</div>`;
      load();
      return;
    }
    body.innerHTML =
      state.items.map(rowHtml).join("") +
      `<div class="im-list-status">${state.moreUrl ? "下拉加载更多…" : (state.items.length ? "没有更多了" : "暂无书签")}</div>`;
  }

  return {
    render,
    onScroll(body) {
      if (!state.moreUrl || state.loading) return;
      if (body.scrollTop + body.clientHeight < body.scrollHeight - 120) return;
      state.loading = true;
      api(state.moreUrl)
        .then((data) => {
          state.items = state.items.concat(data.bookmarks || []);
          state.moreUrl = data.more_bookmarks_url || null;
          state.loadedAt = Date.now();
        })
        .catch(() => {})
        .finally(() => {
          state.loading = false;
          rerenderIfActive();
        });
    }
  };
}

/* ---------- 装饰项：皮肤化占位面板 ---------- */

function makePlaceholderSource(item) {
  return {
    render(panel) {
      const chips = panel.querySelector(".im-list-chips");
      if (chips.dataset.src !== `deco:${item.key}`) {
        chips.dataset.src = `deco:${item.key}`;
        chips.innerHTML = `<span class="im-chip active im-src-label">${escapeHtml(item.label)}</span>`;
      }
      panel.querySelector(".im-list-body").innerHTML = `
        <div class="im-src-placeholder">
          <span class="ico">${ICONS[item.icon] || ""}</span>
          <p class="t">${escapeHtml(item.label)} · 规划中</p>
          <p class="d">本皮肤装饰入口暂以占位呈现，后续版本接入</p>
        </div>`;
    }
  };
}

/* ---------- 关注 feed / 我的回复 / 我的点赞（左栏「更多」分组） ---------- */

// 三种行格式不同但行渲染复用 renderTopicListRows（与私信一致）。
// follow feed: /follow/posts/<me>?created_before=ISO（游标翻页）
// 回复 / 点赞: /user_actions.json?filter=5|1&offset=N（偏移翻页）
function makeFeedSource({ key, label, kind }) {
  const state = { items: [], usersById: {}, moreCursor: null, hasMore: false, loading: false, loadedAt: 0, error: null };

  function toRow(item) {
    const isFollow = kind === "follow";
    const topic = isFollow ? item.topic || {} : item;
    const user = isFollow ? item.user || {} : { username: item.username, name: item.name, avatar_template: item.avatar_template };
    const topicId = Number(topic.id || item.topic_id);
    const id = topicId * 100000 + Number(item.post_number || 1); // 行 key 稳定：同话题多楼也要各自成行
    const title = isFollow ? String(topic.title || "") : String(item.title || "");
    // 头像统一用行内 avatar_template（feed 作者 / user_actions 帖子作者）
    const avatarTemplate = isFollow ? user.avatar_template : (item.avatar_template || "");
    const username = isFollow ? (user.username || "") : (item.acting_username || item.username || "");
    return {
      id,
      topicId,
      slug: topic.slug || "topic",
      title,
      fancy_title: title,
      // feed 源行自带摘要：关注者/作者名 + 摘录，不走伪装替换
      summary: `${user.name || user.username || ""}: ${item.excerpt || ""}`,
      posts_count: topic.posts_count || 0,
      bumped_at: item.created_at,
      // 行内头像优先，usersById 只作兜底
      avatarUrl: avatarTemplate ? fullAvatarUrl(avatarTemplate) : "",
      avatarLetter: (user.name || username || "?").slice(0, 1).toUpperCase(),
      posters: user.id ? [{ user_id: user.id }] : []
    };
  }

  async function loadPage(reset) {
    if (state.loading) return;
    state.loading = true;
    try {
      const me = getCurrentUsername() || "";
      if (kind === "follow") {
        const cursor = reset ? "" : state.moreCursor;
        const data = await api(`/follow/posts/${me}?limit=20${cursor ? `&created_before=${encodeURIComponent(cursor)}` : ""}`);
        const rows = (data.posts || []).map(toRow);
        // 翻页去重：游标边界可能重复返回同一条
        const known = new Set(state.items.map((r) => r.id));
        state.items = reset ? rows : state.items.concat(rows.filter((r) => !known.has(r.id)));
        // has_more 在 rest_serializer 下可能位于 extras 内；同时用满页兜底，避免接口结构差异导致永远「没有更多了」
        state.hasMore = !!(data.has_more ?? data.extras?.has_more ?? (rows.length === 20));
        state.moreCursor = rows.length ? (data.posts || [])[rows.length - 1].created_at : null;
        // 用户表：每条 feed 自带 user，按 id 建档供头像/昵称
        for (const p of data.posts || []) {
          if (p.user?.id) state.usersById[p.user.id] = p.user;
        }
      } else if (kind === "read") {
        // 最近浏览：/read.json 与 /latest.json 同构，行数据可直接当话题用
        const data = await api(`/read.json${reset ? "" : `?page=${Math.floor(state.items.length / 30)}`}`);
        // 补齐 feed 标记：真实标题 + 摘要 + 头像，不走伪装
        const rows = (data.topic_list?.topics || []).map((topic) => ({
          ...topic,
          id: topic.id * 100000 + 1,
          topicId: topic.id,
          slug: topic.slug || "topic",
          summary: `${topic.last_poster_username || ""} · ${topic.posts_count || 0} 回复`,
          avatarUrl: topic.avatar_template ? fullAvatarUrl(topic.avatar_template) : ""
        }));
        state.items = reset ? rows : state.items.concat(rows);
        state.hasMore = !!data.topic_list?.more_topics_url;
        for (const u of data.users || []) state.usersById[u.id] = u;
      } else {
        const offset = reset ? 0 : state.items.length;
        const data = await api(`/user_actions.json?username=${me}&filter=${kind === "replies" ? 5 : 1}&limit=30&offset=${offset}`);
        const rows = (data.user_actions || []).map(toRow);
        state.items = reset ? rows : state.items.concat(rows);
        state.hasMore = rows.length === 30;
      }
      state.loadedAt = Date.now();
      state.error = null;
    } catch (err) {
      state.error = err?.message || "网络异常";
    } finally {
      state.loading = false;
      rerenderIfActive();
    }
  }

  function rerenderIfActive() {
    const panel = document.querySelector(".im-list-panel");
    if (panel && panel.dataset.railKey === key) render(panel);
  }

  function render(panel) {
    const chips = panel.querySelector(".im-list-chips");
    if (chips.dataset.src !== label) {
      chips.dataset.src = label;
      chips.innerHTML = `<span class="im-chip active im-src-label">${escapeHtml(label)}</span>`;
    }
    const body = panel.querySelector(".im-list-body");
    if (state.error && !state.items.length) {
      body.innerHTML = `<div class="im-list-status">${escapeHtml(label)}加载失败（${escapeHtml(state.error)}）</div>`;
      return;
    }
    if (!state.items.length && !state.loading && Date.now() - state.loadedAt > TTL) {
      body.innerHTML = `<div class="im-list-status">加载中…</div>`;
      loadPage(true);
      return;
    }
    renderTopicListRows(
      state.items,
      state.usersById,
      state.hasMore ? "下拉加载更多…" : (state.items.length ? "没有更多了" : `暂无${label}`)
    );
  }

  return {
    render,
    onScroll(body) {
      if (!state.hasMore || state.loading) return;
      if (body.scrollTop + body.clientHeight < body.scrollHeight - 120) return;
      loadPage(false);
    }
  };
}

/* ---------- 注册（list-sources.ensureRailSources 调用） ---------- */

export function registerExtraSources() {
  registerSource("messages", makeTopicListSource({
    key: "messages",
    label: "私信",
    getApiPath: () => `/topics/private-messages/${getCurrentUsername() || ""}.json`
  }));
  registerSource("bookmarks", makeBookmarkSource());
  registerSource("follow", makeFeedSource({ key: "follow", label: "关注", kind: "follow" }));
  registerSource("replies", makeFeedSource({ key: "replies", label: "我的回复", kind: "replies" }));
  registerSource("likes", makeFeedSource({ key: "likes", label: "我的点赞", kind: "likes" }));
  registerSource("read", makeFeedSource({ key: "read", label: "最近浏览", kind: "read" }));
  for (const item of RAIL_DECO_ITEMS) {
    if (item.key === "more") continue; // 与底部「更多」重名，跳过
    registerSource(item.key, makePlaceholderSource(item));
  }
}
