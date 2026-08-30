// 用户卡片（飞书样式 × 原生 user card 内容，§5.4 前置）：点帖子头像/昵称/@提及弹出。
// 数据源与资料页头部卡同款 /u/:username.json；卡片定位跟随锚点，遮罩/Esc/滚动关闭。
import { api, apiSend } from "../bridge/api.js";
import { escapeHtml } from "../utils/html.js";
import { navigateInApp } from "../bridge/router.js";
import { forceSchemeInDoc, watchSchemeDoc, onColorThemeChange } from "../theme/color-mode.js";
import { formatTime, stripTags, fmtDuration, fmtMonth } from "./shared/time.js";
import { avatarColor, avatarLetter, fullAvatarUrl } from "./shared/avatars.js";

const TTL = 30_000;
const cache = new Map(); // username -> { user, loadedAt, error }
let maskEl = null;
let cardEl = null;
let closeListeners = null;
let seq = 0;

const CLOSE_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

async function fetchCard(username) {
  const cached = cache.get(username);
  if (cached && Date.now() - cached.loadedAt < TTL) return cached;
  try {
    const data = await api(`/u/${encodeURIComponent(username)}.json`);
    const next = { user: data.user || {}, loadedAt: Date.now(), error: null };
    cache.set(username, next);
    return next;
  } catch (err) {
    const next = { user: null, loadedAt: Date.now(), error: err?.message || "网络异常" };
    cache.set(username, next);
    return next;
  }
}

export function showUserCard(username, anchor) {
  if (!username) return;
  closeCard(); // 先作废旧卡片的 pending 回调（内部 seq++），再取本次 id
  const id = ++seq;
  maskEl = document.createElement("div");
  maskEl.className = "im-ucard-mask";
  cardEl = document.createElement("div");
  cardEl.className = "im-ucard";
  cardEl.innerHTML = `<span class="im-ucard-status">加载中…</span>`;
  document.body.append(maskEl, cardEl);
  placeCard(anchor);
  bindClose();
  cardEl.addEventListener("click", (e) => {
    const home = e.target.closest("[data-ucard-home]");
    if (home) {
      e.preventDefault();
      closeCard();
      showUserProfile(username);
      return;
    }
    const fb = e.target.closest("[data-ucard-follow]");
    if (fb) {
      e.preventDefault();
      const follow = fb.dataset.ucardFollow === "1";
      fb.disabled = true;
      apiSend(`/u/${encodeURIComponent(username)}/follow`, follow ? "PUT" : "DELETE")
        .then(async () => {
          const cached = await fetchCard(username);
          if (id === seq && cardEl && cached.user) {
            cached.user.is_followed = follow;
            paintCard(username, cached, anchor);
          }
        })
        .catch(() => {
          if (id === seq && cardEl) fb.disabled = false;
        });
    }
  });
  fetchCard(username).then((cached) => {
    if (id === seq && cardEl) paintCard(username, cached, anchor);
  });
}

function paintCard(username, cached, anchor) {
  if (!cardEl) return;
  cardEl.innerHTML = cached.error
    ? `<span class="im-ucard-status">加载失败（${escapeHtml(cached.error)}）</span>`
    : cardHtml(username, cached.user || {});
  placeCard(anchor);
}

function cardHtml(username, u) {
  const name = u.username || username;
  const avatar = u.avatar_template
    ? `<img src="${escapeHtml(fullAvatarUrl(u.avatar_template))}" alt="">`
    : `<span class="is-text-avatar is-solid" style="background:${avatarColor(name)}">${escapeHtml(avatarLetter(name))}</span>`;
  const flair = u.flair_url
    ? `<span class="flair"${u.flair_bg_color ? ` style="background:#${escapeHtml(u.flair_bg_color)}"` : ""}><img src="${escapeHtml(u.flair_url)}" alt=""></span>`
    : "";
  const role = u.moderator ? "版主" : u.admin ? "管理员" : "";
  // 对齐原生 user card 信息量：统计 6 格 + 时间/阅读明细行（数据源 /u/:name.json 实测字段）
  const stats = [
    [u.gamification_score, "点数"],
    [u.total_followers, "粉丝"],
    [u.total_following, "关注"],
    [u.accepted_answers, "解决"],
    [u.badge_count, "徽章"],
    [u.profile_view_count, "浏览"]
  ].filter(([v]) => v !== undefined && v !== null && v !== "");
  const info = [
    ["加入时间", u.created_at ? fmtMonth(u.created_at) : ""],
    ["最近发帖", u.last_posted_at ? formatTime(u.last_posted_at) : ""],
    ["最近活跃", u.last_seen_at ? formatTime(u.last_seen_at) : ""],
    ["阅读时长", u.time_read ? fmtDuration(u.time_read) : ""],
    ["时区", u.timezone || ""]
  ].filter(([, v]) => v);
  return `
    <span class="im-ucard-banner"></span>
    <span class="im-ucard-head">
      <span class="im-ucard-ava">${avatar}${flair}</span>
      <span class="im-ucard-hmain">
        <span class="im-ucard-name">${escapeHtml(u.name || name)}${u.title ? `<span class="title-badge">${escapeHtml(u.title)}</span>` : ""}</span>
        <span class="im-ucard-sub">@${escapeHtml(name)}${u.trust_level ? ` · TL${u.trust_level}` : ""}${role ? ` · ${role}` : ""}</span>
      </span>
    </span>
    ${u.bio_excerpt || u.bio_cooked ? `<span class="im-ucard-bio">${escapeHtml(stripTags(u.bio_excerpt || u.bio_cooked))}</span>` : ""}
    ${stats.length ? `<span class="im-ucard-stats">${stats.map(([v, k]) => `<span class="m"><span class="v">${escapeHtml(String(v))}</span><span class="k">${escapeHtml(k)}</span></span>`).join("")}</span>` : ""}
    ${info.length ? `<span class="im-ucard-info">${info.map(([k, v]) => `<span class="row"><span class="k">${escapeHtml(k)}</span><span class="v">${escapeHtml(String(v))}</span></span>`).join("")}</span>` : ""}
    <span class="im-ucard-actions">
      <button type="button" class="im-ucard-btn primary" data-ucard-home>查看主页</button>
      ${u.can_follow
        ? `<button type="button" class="im-ucard-btn" data-ucard-follow="${u.is_followed ? "0" : "1"}">${u.is_followed ? "已关注" : "+ 关注"}</button>`
        : ""}
    </span>`;
}

function placeCard(anchor) {
  if (!cardEl) return;
  const r = anchor?.getBoundingClientRect?.();
  const w = cardEl.offsetWidth;
  const h = cardEl.offsetHeight;
  if (!r || !w) {
    // 无锚点（异常兜底）：屏幕居中
    cardEl.style.left = `${Math.max(12, (innerWidth - w) / 2)}px`;
    cardEl.style.top = `${Math.max(12, (innerHeight - h) / 2)}px`;
    return;
  }
  let left = r.left + r.width / 2 - w / 2;
  left = Math.max(12, Math.min(left, innerWidth - w - 12));
  let top = r.bottom + 8;
  if (top + h > innerHeight - 12) top = Math.max(12, r.top - h - 8);
  cardEl.style.left = `${left}px`;
  cardEl.style.top = `${top}px`;
}

function bindClose() {
  const onMask = () => closeCard();
  const onKey = (e) => {
    if (e.key === "Escape") closeCard();
  };
  const onScroll = () => closeCard();
  maskEl.addEventListener("click", onMask);
  document.addEventListener("keydown", onKey);
  window.addEventListener("resize", onScroll);
  window.addEventListener("scroll", onScroll, true);
  closeListeners = () => {
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", onScroll);
    window.removeEventListener("scroll", onScroll, true);
  };
}

export function closeCard() {
  seq++;
  maskEl?.remove();
  cardEl?.remove();
  closeListeners?.();
  maskEl = null;
  cardEl = null;
  closeListeners = null;
}

/** 「查看主页」：右栏 chat panel 上盖一层 iframe 嵌原生 /u/:name/summary，
 *  原生 tab（活动/通知/徽章/偏好）直接可点；@noframes 保证脚本不在 iframe 内二次运行。
 *  内嵌页明暗与我们主题完全绑定（不跟随系统）：load 后强制写入 scheme，并挂观察者防 Discourse 回弹。 */
export function showUserProfile(username) {
  const host = document.querySelector(".im-chat-panel");
  if (!host) {
    // 兜底：右栏不存在（如未接管路径）→ 站内跳原生
    navigateInApp(`/u/${encodeURIComponent(username)}/summary`);
    return;
  }
  host.querySelector(".im-prof-frame")?.remove();
  const wrap = document.createElement("div");
  wrap.className = "im-prof-frame";
  wrap.innerHTML = `
    <div class="im-prof-frame-bar">
      <span class="t">@${escapeHtml(username)}</span>
      <button type="button" class="im-prof-frame-close" title="关闭">${CLOSE_SVG}</button>
    </div>
    <span class="im-prof-frame-loading">加载中…</span>
    <iframe class="im-prof-frame-view" src="/u/${encodeURIComponent(username)}/summary"></iframe>`;
  host.appendChild(wrap);
  wrap.querySelector(".im-prof-frame-close").addEventListener("click", () => wrap.remove());
  const view = wrap.querySelector("iframe");
  view.addEventListener("load", () => {
    // 每次导航（含 iframe 内切 tab）都重新走加载态：等 Ember 挂载主内容再淡入，全程不露 linux.do 启动图标
    view.classList.remove("ready");
    if (!wrap.querySelector(".im-prof-frame-loading")) {
      const tip = document.createElement("span");
      tip.className = "im-prof-frame-loading";
      tip.textContent = "加载中…";
      wrap.appendChild(tip);
    }
    let tries = 0;
    const timer = setInterval(() => {
      let ok = false;
      try {
        const doc = view.contentDocument;
        if (doc?.head && !doc.__imProfStyled) {
          doc.__imProfStyled = true;
          const style = doc.createElement("style");
          // 嵌入态：藏原生顶栏/公告/底栏/启动 splash，主体顶到容器顶
          style.textContent =
            ".d-header-wrap,.above-main-outlet,#site-footer,.footer-navi,.splash-screen{display:none!important}" +
            "#main-outlet-wrapper,#main-outlet{padding-top:0!important;margin-top:0!important}";
          doc.head.appendChild(style);
          // 明暗绑定：立即强制 + Ember 晚启动兜底 + 观察后续改写
          forceSchemeInDoc(doc);
          watchSchemeDoc(doc);
          setTimeout(() => forceSchemeInDoc(doc), 800);
        }
        ok = !!doc?.querySelector?.("#main-outlet")?.children?.length;
      } catch {
        ok = true; // 跨域兜底：直接显示
      }
      if (!ok && ++tries < 40) return; // 最多等 8s
      clearInterval(timer);
      try {
        forceSchemeInDoc(view.contentDocument);
      } catch { /* ignore */ }
      view.classList.add("ready");
      wrap.querySelector(".im-prof-frame-loading")?.remove();
    }, 200);
  });
}

// 主题切换（含 auto 跟随系统变化）时同步已打开的内嵌页
onColorThemeChange(() => {
  const view = document.querySelector(".im-prof-frame-view");
  if (view?.contentDocument) forceSchemeInDoc(view.contentDocument);
});
