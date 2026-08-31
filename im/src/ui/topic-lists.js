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

/* ---------- 注册（list-sources.ensureRailSources 调用） ---------- */

export function registerExtraSources() {
  registerSource("messages", makeTopicListSource({
    key: "messages",
    label: "私信",
    getApiPath: () => `/topics/private-messages/${getCurrentUsername() || ""}.json`
  }));
  registerSource("bookmarks", makeBookmarkSource());
  for (const item of RAIL_DECO_ITEMS) {
    if (item.key === "more") continue; // 与底部「更多」重名，跳过
    registerSource(item.key, makePlaceholderSource(item));
  }
}
