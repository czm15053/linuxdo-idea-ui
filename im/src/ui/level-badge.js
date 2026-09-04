// 聊天头部等级徽章 + 升级进度浮层。
// 明细双通道：
// 1) 精确：GM_xmlhttpRequest 直读 connect.linux.do「信任级别 X 的要求」卡片
//    （服务端口径，含近 100 天滚动窗口；CORS / X-Frame-Options 使同源 fetch 与 iframe 不可读，
//    必须 GM_xmlhttpRequest —— 这也是 meta 声明 grant、全脚本经 bridge/page.js 的 pg 取页面变量的原因）。
// 2) 回退：Connect 拉取失败（未登录 Connect / Cloudflare 挑战 / 结构变更）时用
//    /u/{me}/summary.json 全周期统计近似，窗口项标「参考」。
// 徽章等级始终取 /u/{me}.json 的 trust_level。缓存 5 分钟。
import { api } from "../bridge/api.js";
import { getCurrentUsername } from "../bridge/user.js";
import { escapeHtml } from "../utils/html.js";

const TL_NAMES = ["新用户", "基本用户", "成员", "常客", "领导者"];
const CACHE_TTL = 5 * 60 * 1000;
const CONNECT_URL = "https://connect.linux.do/";

// ---------------- 回退通道：summary 全周期近似 ----------------
// 维度取值器：s = user_summary，u = /u/{me}.json 的 user
const regMins = (u) => (Date.now() - new Date(u.created_at).getTime()) / 60000;
const readMins = (s) => Math.floor((s.time_read || 0) / 60);
const replyTopics = (s) => Math.max(0, (s.post_count || 0) - (s.topic_count || 0));

const fmtNum = (n) => Number(n || 0).toLocaleString("en-US");
// 环形中心窄位用：过万缩写为 X.X万，防溢出
const fmtCompact = (n) => {
  const v = Number(n) || 0;
  if (v >= 10000) return `${+(v / 10000).toFixed(1)}万`;
  return fmtNum(v);
};
const fmtDur = (mins) => {
  const m = Math.floor(Number(mins) || 0);
  if (m < 60) return `${m}分钟`;
  if (m < 1440) return `${+(m / 60).toFixed(1)}小时`;
  return `${Math.floor(m / 1440)}天`;
};

// 回退阈值表。TL0/1 为 Discourse 默认（全周期口径即精确）；
// TL3 取 linux.do Connect 卡片实际值（2026-09 快照），窗口项全周期近似、标「参考」。
const APPROX_NOTE = "全周期口径，服务端按近 100 天滚动窗口考核，仅作参考";
const SEC_TL1 = [
  {
    title: "活跃程度", kind: "ring", items: [
      { label: "浏览话题", target: 5, value: (s) => s.topics_entered || 0 },
      { label: "已读帖子", target: 30, value: (s) => s.posts_read_count || 0 }
    ]
  },
  {
    title: "互动参与", kind: "bar", items: [
      { label: "阅读时间", target: 10, unit: "分钟", value: (s) => readMins(s) },
      { label: "注册时长", target: 10, unit: "分钟", value: (_s, u) => Math.floor(regMins(u)) }
    ]
  }
];
const SEC_TL2 = [
  {
    title: "活跃程度", kind: "ring", items: [
      { label: "访问天数", target: 15, value: (s) => s.days_visited || 0 },
      { label: "浏览话题", target: 20, value: (s) => s.topics_entered || 0 },
      { label: "已读帖子", target: 100, value: (s) => s.posts_read_count || 0 }
    ]
  },
  {
    title: "互动参与", kind: "bar", items: [
      { label: "给出赞", target: 1, value: (s) => s.likes_given || 0 },
      { label: "获得赞", target: 1, value: (s) => s.likes_received || 0 },
      {
        label: "回复话题", target: 3, approx: true,
        note: "服务端考核「回复的不同话题数」，此处按回复帖数近似",
        value: (s) => replyTopics(s)
      },
      { label: "阅读时间", target: 60, unit: "分钟", value: (s) => readMins(s) },
      { label: "注册时长", target: 60, unit: "分钟", value: (_s, u) => Math.floor(regMins(u)) }
    ]
  }
];
const SEC_TL3 = [
  {
    title: "活跃程度（近 100 天）", kind: "ring", items: [
      { label: "访问天数", target: 50, approx: true, note: APPROX_NOTE, value: (s) => s.days_visited || 0 },
      { label: "浏览话题", target: 500, approx: true, note: `窗口内新话题的 25%（封顶 500）；${APPROX_NOTE}`, value: (s) => s.topics_entered || 0 },
      { label: "浏览帖子", target: 20000, approx: true, note: `窗口内新帖的 25%（封顶 20000）；${APPROX_NOTE}`, value: (s) => s.posts_read_count || 0 }
    ]
  },
  {
    title: "互动参与", kind: "bar", items: [
      { label: "回复话题", target: 10, approx: true, note: `服务端考核窗口内回复的不同话题数，此处按回复帖数近似；${APPROX_NOTE}`, value: (s) => replyTopics(s) },
      { label: "点赞", target: 30, approx: true, note: APPROX_NOTE, value: (s) => s.likes_given || 0 },
      { label: "获赞", target: 20, approx: true, note: APPROX_NOTE, value: (s) => s.likes_received || 0 },
      { label: "浏览话题（全周期）", target: 200, value: (s) => s.topics_entered || 0 },
      { label: "已读帖子（全周期）", target: 500, value: (s) => s.posts_read_count || 0 },
      { text: "另有窗口项：获赞天数 ≥7、获赞用户 ≥5（同源接口无此口径）" }
    ]
  },
  {
    title: "合规记录", kind: "note", items: [
      { text: "近 100 天被举报帖子 ≤5、举报用户 ≤5；近 6 个月无禁言 / 封禁。由系统自动判定，同源接口不可读。" }
    ]
  }
];

// ---------------- 精确通道：Connect 卡片 ----------------
function gmGet(url) {
  return new Promise((resolve, reject) => {
    const gm = globalThis.GM_xmlhttpRequest;
    if (typeof gm !== "function") return reject(new Error("GM_xmlhttpRequest 不可用"));
    gm({
      method: "GET",
      url,
      timeout: 15000,
      withCredentials: true,
      headers: { Accept: "text/html,application/xhtml+xml", Referer: CONNECT_URL },
      onload: (r) => (r.status >= 200 && r.status < 300 ? resolve(r.responseText) : reject(new Error(`HTTP ${r.status}`))),
      onerror: () => reject(new Error("network")),
      ontimeout: () => reject(new Error("timeout"))
    });
  });
}

const parsePageNum = (t) => parseFloat(String(t ?? "0").replace(/[,\s]/g, "")) || 0;

// 解析「信任级别 X 的要求」卡片（结构对齐 connect.linux.do 2026-09 版）：
// 分区标题（活跃程度/互动参与/合规记录）的 nextElementSibling 是数据区；
// 普通项自标签叶节点向上找第一个含 "cur/target" 的祖先；
// 否决项（被禁言/被封禁）向上找独立数字叶节点。未登录/挑战页/结构变更返回 null。
function parseConnectCard(doc) {
  const card = [...doc.querySelectorAll("div.card, .card")].find((div) =>
    /信任级别.*的要求/.test(div.querySelector("h2, [class*='card-title']")?.textContent || "")
  );
  if (!card) return null;
  const targetLevel = Number(
    (card.querySelector("h2, [class*='card-title']")?.textContent || "").match(/信任级别\s*(\d+)/)?.[1]
  ) || null;
  const achieved = /已达到|已达标/.test(card.querySelector(".badge, [class*='badge']")?.textContent || "");

  const leafByText = (scope, text) =>
    [...scope.querySelectorAll("*")].find((el) => !el.children.length && el.textContent.trim() === text);
  const sectionOf = (title) => leafByText(card, title)?.nextElementSibling || null;
  const pairOf = (scope, label) => {
    let p = leafByText(scope, label)?.parentElement;
    while (p && p !== card) {
      const m = (p.textContent || "").match(/([\d,]+)\s*\/\s*([\d,]+)/);
      if (m) return { label, cur: parsePageNum(m[1]), target: parsePageNum(m[2]) };
      p = p.parentElement;
    }
    return null;
  };
  const vetoOf = (scope, label) => {
    let p = leafByText(scope, label)?.parentElement;
    while (p && p !== card) {
      const numEl = [...p.querySelectorAll("*")].find((el) =>
        !el.children.length && /^\d+$/.test((el.textContent || "").trim())
      );
      if (numEl) return { label, cur: parsePageNum(numEl.textContent) };
      p = p.parentElement;
    }
    return null;
  };

  const activity = sectionOf("活跃程度");
  const interaction = sectionOf("互动参与");
  const compliance = sectionOf("合规记录");
  if (!activity || !interaction) return null;

  return {
    targetLevel,
    achieved,
    activity: ["访问天数", "浏览话题", "浏览帖子"].map((l) => pairOf(activity, l)).filter(Boolean),
    interaction: ["回复话题", "点赞", "获赞", "获赞天数", "获赞用户"].map((l) => pairOf(interaction, l)).filter(Boolean),
    quota: compliance ? ["被举报帖子", "举报用户"].map((l) => pairOf(compliance, l)).filter(Boolean) : [],
    veto: compliance ? ["被禁言", "被封禁"].map((l) => vetoOf(compliance, l)).filter(Boolean) : []
  };
}

async function fetchConnect() {
  const html = await gmGet(CONNECT_URL);
  const doc = new DOMParser().parseFromString(html, "text/html");
  return parseConnectCard(doc);
}

// ---------------- 数据装配 ----------------
let cache = null; // { at, level, user, summary, connect }
let panelEl = null;
let loading = false;
let inflight = null; // 进行中的加载 Promise，合并页面首帧的并发触发，避免同一 URL 重复轰炸

async function loadLevelData(force = false) {
  if (!force && cache && Date.now() - cache.at < CACHE_TTL) return cache;
  // 缓存未就绪期间 syncLevelBadge 会被 applyTheme 高频调用：合并并发，只保留一个进行中的请求
  if (inflight) return inflight;
  inflight = (async () => {
    const me = getCurrentUsername();
    if (!me) return null;
    // 徽章只依赖 user.json；明细失败降级为空（不拖垮徽章显示）
    const u = await api(`/u/${encodeURIComponent(me)}.json`);
    const level = Number(u.user?.trust_level ?? 0);
    const [summary, connect] = await Promise.all([
      api(`/u/${encodeURIComponent(me)}/summary.json`).then((r) => r.user_summary || {}).catch(() => ({})),
      level < 4 ? fetchConnect().catch(() => null) : Promise.resolve(null)
    ]);
    cache = { at: Date.now(), level, user: u.user || {}, summary, connect };
    return cache;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

// ---------------- 渲染 ----------------
// 统一条目形状：{ label, cur, target, done, approx?, note?, unit?, danger? }
function itemState(r, s, u) {
  const cur = Number(r.value(s, u)) || 0;
  return { label: r.label, cur, target: r.target, done: cur >= r.target, approx: r.approx, note: r.note, unit: r.unit };
}

function approxTag(it) {
  return it.approx
    ? `<i class="im-level-approx" title="${escapeHtml(it.note || APPROX_NOTE)}">参考</i>`
    : "";
}

function ringHtml(it) {
  const pct = Math.max(0, Math.min(100, (it.cur / it.target) * 100));
  const R = 24;
  const C = 2 * Math.PI * R;
  return `<div class="im-level-ring${it.done ? " done" : ""}">
    <svg viewBox="0 0 56 56" aria-hidden="true">
      <circle class="track" cx="28" cy="28" r="${R}"/>
      <circle class="fill" cx="28" cy="28" r="${R}" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - pct / 100)).toFixed(2)}"/>
    </svg>
    <div class="im-level-ring-num"><b>${fmtCompact(it.cur)}</b><span>/${fmtCompact(it.target)}</span></div>
    <div class="im-level-ring-label">${escapeHtml(it.label)}${approxTag(it)}</div>
  </div>`;
}

function barHtml(it) {
  const pct = Math.max(0, Math.min(100, (it.cur / it.target) * 100));
  const fmt = it.unit === "分钟" ? fmtDur : fmtNum;
  const cls = it.done ? "done" : it.danger ? "bad" : "";
  return `<div class="im-level-row ${cls}">
    <div class="im-level-row-head">
      <span>${it.done ? "✓ " : ""}${escapeHtml(it.label)}${approxTag(it)}</span>
      <span class="im-level-num">${fmt(it.cur)}/${fmt(it.target)}</span>
    </div>
    <div class="im-level-bar"><i style="width:${pct}%"></i></div>
  </div>`;
}

// 合规否决项（被禁言/被封禁）：0 为达标
function vetoHtml(v) {
  const ok = v.cur === 0;
  return `<div class="im-level-veto${ok ? " ok" : " bad"}"><span>${ok ? "✓" : "✗"} ${escapeHtml(v.label)}</span><b>${fmtNum(v.cur)}</b></div>`;
}

function secWrap(title, body) {
  return `<div class="im-level-sec"><div class="im-level-sec-title">${escapeHtml(title)}</div>${body}</div>`;
}

function connectPanelHtml(data) {
  const { level, connect: c } = data;
  const name = TL_NAMES[level] || `Lv${level}`;
  const target = c.targetLevel ?? (c.achieved ? level : level + 1);
  const pill = c.achieved
    ? `<span class="im-level-pill ok">已达到</span>`
    : `<span class="im-level-pill">未达到</span>`;
  const sub = c.achieved
    ? `已达到信任级别 ${target} 的要求，请保持。`
    : `下一级：Lv${target}「${TL_NAMES[target] || `Lv${target}`}」`;

  const secs = [];
  if (c.activity.length) {
    secs.push(secWrap("活跃程度（近 100 天）",
      `<div class="im-level-rings">${c.activity.map((a) => ringHtml({ ...a, done: a.cur >= a.target })).join("")}</div>`));
  }
  if (c.interaction.length) {
    secs.push(secWrap("互动参与", c.interaction.map((i) => barHtml({ ...i, done: i.cur >= i.target })).join("")));
  }
  const quotaRows = c.quota.map((q) =>
    barHtml({ label: q.label, cur: q.cur, target: q.target, done: q.cur <= q.target, danger: q.cur > q.target })
  ).join("");
  const vetoRows = c.veto.map(vetoHtml).join("");
  if (quotaRows || vetoRows) secs.push(secWrap("合规记录", quotaRows + vetoRows));

  return `
    <div class="im-level-card">
      <div class="im-level-head"><span class="im-level-cur">Lv${level}</span><span class="im-level-name">${escapeHtml(name)}</span>${pill}</div>
      <div class="im-level-sub">${escapeHtml(sub)}</div>
      ${secs.join("")}
      <div class="im-level-foot"><span>服务端精确口径（近 100 天窗口）</span><a href="${CONNECT_URL}" target="_blank" rel="noopener noreferrer">Connect ↗</a></div>
    </div>`;
}

function fallbackSectionHtml(sec, s, u) {
  const renderItem = (r) => {
    if (r.text) return `<div class="im-level-tip">${escapeHtml(r.text)}</div>`;
    const it = itemState(r, s, u);
    return sec.kind === "ring" ? ringHtml(it) : barHtml(it);
  };
  const items = sec.items.map(renderItem).join("");
  const body = sec.kind === "ring"
    ? `<div class="im-level-rings">${items}</div>`
    : sec.kind === "note"
      ? `<div class="im-level-note-box">${items}</div>`
      : items;
  return secWrap(sec.title, body);
}

function fallbackPanelHtml(data) {
  const { level, summary: s, user: u } = data;
  const name = TL_NAMES[level] || `Lv${level}`;
  const sections = level === 0 ? SEC_TL1 : level === 1 ? SEC_TL2 : SEC_TL3;
  let done = 0;
  let total = 0;
  for (const sec of sections) {
    for (const r of sec.items) {
      if (r.text) continue;
      total += 1;
      if ((Number(r.value(s, u)) || 0) >= r.target) done += 1;
    }
  }
  const pill = done >= total
    ? `<span class="im-level-pill ok">${level === 3 ? "保持中" : "已达标"}</span>`
    : `<span class="im-level-pill">还差 ${total - done} 项</span>`;
  const sub = level === 3
    ? `近 100 天滚动窗口保持考核，不达标会被降级；Lv4「${TL_NAMES[4]}」由管理员手动提升。`
    : `下一级：Lv${level + 1}「${TL_NAMES[level + 1]}」${level === 2 ? "，近 100 天滚动窗口考核" : ""}`;
  const foot = level >= 2
    ? `<div class="im-level-foot"><span>「参考」为全周期口径近似</span><a href="${CONNECT_URL}" target="_blank" rel="noopener noreferrer">Connect 精确进度 ↗</a></div>`
    : "";
  return `
    <div class="im-level-card">
      <div class="im-level-head"><span class="im-level-cur">Lv${level}</span><span class="im-level-name">${escapeHtml(name)}</span>${pill}</div>
      <div class="im-level-sub">${escapeHtml(sub)}</div>
      ${sections.map((sec) => fallbackSectionHtml(sec, s, u)).join("")}
      ${foot}
    </div>`;
}

function panelHtml(data) {
  const { level } = data;
  if (level >= 4) {
    const name = TL_NAMES[level] || `Lv${level}`;
    return `
      <div class="im-level-card">
        <div class="im-level-head"><span class="im-level-cur">Lv${level}</span><span class="im-level-name">${escapeHtml(name)}</span></div>
        <div class="im-level-max">已是最高等级，感谢你的贡献 🎉</div>
      </div>`;
  }
  return data.connect ? connectPanelHtml(data) : fallbackPanelHtml(data);
}

// ---------------- 浮层开关 ----------------
function closePanel() {
  panelEl?.remove();
  panelEl = null;
  document.removeEventListener("click", onOutside, true);
  document.removeEventListener("keydown", onKey, true);
}
function onOutside(e) {
  if (panelEl && !panelEl.contains(e.target) && !e.target.closest?.(".im-level-btn")) closePanel();
}
function onKey(e) {
  if (e.key === "Escape") closePanel();
}

async function togglePanel(anchor) {
  if (panelEl) { closePanel(); return; }
  if (loading) return;
  loading = true;
  try {
    const data = await loadLevelData();
    if (!data) return;
    panelEl = document.createElement("div");
    panelEl.className = "im-level-pop";
    panelEl.innerHTML = panelHtml(data);
    document.body.appendChild(panelEl);
    const r = anchor.getBoundingClientRect();
    const mw = panelEl.offsetWidth;
    const mh = panelEl.offsetHeight;
    let left = Math.max(8, Math.min(r.right - mw, innerWidth - mw - 8));
    let top = r.bottom + 6;
    if (top + mh > innerHeight - 8) top = Math.max(8, r.top - mh - 6);
    panelEl.style.left = `${left}px`;
    panelEl.style.top = `${top}px`;
    setTimeout(() => {
      document.addEventListener("click", onOutside, true);
      document.addEventListener("keydown", onKey, true);
    }, 0);
  } catch { /* 静默，下次点击重试 */ }
  finally { loading = false; }
}

/** 按钮文案：数据就绪后显示 Lv{n}（chat-panel 模板里按钮默认隐藏） */
export async function syncLevelBadge() {
  const btn = document.querySelector(".im-level-btn");
  if (!btn) return;
  if (!getCurrentUsername()) return;
  try {
    const data = await loadLevelData();
    if (!data) return;
    btn.textContent = `Lv${data.level}`;
    btn.style.display = "";
  } catch { /* 保持隐藏 */ }
}

// 事件委托：按钮点击弹浮层；打开后强制刷新缓存在下次打开时按需过期重拉
document.addEventListener("click", (e) => {
  const btn = e.target.closest?.(".im-level-btn");
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  togglePanel(btn);
}, true);
