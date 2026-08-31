import { NAV2_KEY, ORG_NAME_KEY, ORG_ICON_KEY, RAIL_COLLAPSE_KEY, RAIL_W_KEY } from "../config/constants.js";
import {
  RAIL_WIDTH, RAIL_W_MIN, RAIL_W_COMPACT, RAIL_W_MAX,
  RAIL_DECO_ITEMS, SKIN_ID, defaultOrgName, otherThemeActive,
} from "../config/skins.js";
import { applyRailWidth } from "./shared/resizer.js"; // 运行期互调（resizer 反向依赖 setRailCollapsed），ESM 环安全
import { ICONS } from "../config/icons.js";
import { escapeHtml } from "../utils/html.js";
import { getEmberOwner, safeLookup } from "../bridge/discourse.js";
import { getCurrentUsername } from "../bridge/user.js";
import { listState } from "../state/list-state.js";
import { getViewMode } from "../state/view-state.js";
import { avatarColor, avatarLetter } from "./shared/avatars.js";
import { hasSource, setActiveRailKey } from "./list-sources.js";
import { navigateInApp } from "../bridge/router.js";

// rail 刷新（角标等）由皮肤分派层注册，避免 ui → skins 反向依赖
const railRefreshListeners = [];
export function onRailRefresh(fn) {
  railRefreshListeners.push(fn);
}
export function refreshRail() {
  for (const fn of railRefreshListeners) fn();
}

export function isNav2Open() {
  try { return localStorage.getItem(NAV2_KEY) === "1"; } catch { return false; }
}
export function setNav2Open(open) {
  try { localStorage.setItem(NAV2_KEY, open ? "1" : "0"); } catch { /* ignore */ }
  document.documentElement.classList.toggle("im-nav2-open", open);
  const moreBtn = document.querySelector(".im-rail-more");
  if (moreBtn) {
    moreBtn.classList.toggle("is-on", open);
    moreBtn.setAttribute("aria-expanded", open ? "true" : "false");
    moreBtn.title = open ? "收起话题导航" : "展开话题导航";
  }
}


/* ---------- 侧栏收起（wecom）：窄条大图标 + 下方小字，宽度由 CSS 覆写 --im-nav ---------- */

export function isRailCollapsed() {
  try { return localStorage.getItem(RAIL_COLLAPSE_KEY) === "1"; } catch { return false; }
}
export function setRailCollapsed(collapsed) {
  try { localStorage.setItem(RAIL_COLLAPSE_KEY, collapsed ? "1" : "0"); } catch { /* ignore */ }
  document.documentElement.classList.toggle("im-rail-collapsed", collapsed);
  window.dispatchEvent(new Event("im-layout-change")); // 嵌入编辑器几何跟随（--im-nav 被 CSS 覆写）
  const btn = document.querySelector(".im-rail-collapse");
  if (btn) {
    const label = btn.querySelector("span");
    if (label) label.textContent = collapsed ? "展开" : "收起";
    btn.title = collapsed ? "展开侧栏" : "收起侧栏";
    btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
}


/**
 * 三皮肤共用的侧栏宽条/窄条切换按钮（挂在 .im-rail-bottom）：
 * - wecom/feishu 默认宽条，点击收起为窄条大图标（im-rail-collapsed 类 + CSS 覆写 --im-nav）
 * - dingtalk 默认窄条（compact <80px 隐藏标签），点击展开为宽条（复用宽度持久化）
 * 幂等：已存在直接返回；各皮肤 rail 构建器（rail.js / feishu-frame.js）共用。
 */
export function ensureRailFold(bottom) {
  if (!bottom || bottom.querySelector(".im-rail-collapse")) return;
  const fold = document.createElement("button");
  fold.type = "button";
  fold.className = "im-rail-item im-rail-collapse";
  fold.innerHTML = `${ICONS.chevronsLeft}<span>收起</span>`;
  fold.addEventListener("click", () => {
    if (SKIN_ID === "dingtalk") {
      const w = parseInt(document.documentElement.style.getPropertyValue("--im-nav"), 10) || RAIL_WIDTH;
      const wide = w < RAIL_W_COMPACT; // 当前窄条 → 切宽条
      applyRailWidth(wide ? RAIL_W_MAX : RAIL_WIDTH);
      try { localStorage.setItem(RAIL_W_KEY, String(wide ? RAIL_W_MAX : RAIL_WIDTH)); } catch { /* ignore */ }
      syncRailFold();
      return;
    }
    const next = !isRailCollapsed();
    if (next) {
      // 拖到下限自动折叠后再展开：宽度若仍贴着下限（会截断文字），恢复默认宽度
      const w = parseInt(document.documentElement.style.getPropertyValue("--im-nav"), 10);
      if (w && w < RAIL_W_MIN + 24) {
        document.documentElement.style.setProperty("--im-nav", `${RAIL_WIDTH}px`);
        try { localStorage.setItem(RAIL_W_KEY, String(RAIL_WIDTH)); } catch { /* ignore */ }
      }
    }
    setRailCollapsed(next);
  });
  bottom.appendChild(fold);
}

/** dingtalk 宽/窄条按钮态跟随当前宽度（点按钮、拖宽条都算），bootstrap 每 tick 同步 */
export function syncRailFold() {
  if (SKIN_ID !== "dingtalk") return;
  const btn = document.querySelector(".im-rail-collapse");
  if (!btn) return;
  const w = parseInt(document.documentElement.style.getPropertyValue("--im-nav"), 10) || RAIL_WIDTH;
  const wide = w >= RAIL_W_COMPACT;
  const label = btn.querySelector("span");
  if (label) label.textContent = wide ? "收起" : "展开";
  btn.title = wide ? "收起侧栏" : "展开侧栏";
  btn.setAttribute("aria-expanded", wide ? "true" : "false");
}


/* ---------- 组织 chip：点击改名 / 换图标 ---------- */

export function getOrgName() {
  try { return localStorage.getItem(ORG_NAME_KEY) || defaultOrgName(); } catch { return defaultOrgName(); }
}
export function getOrgIcon() {
  try { return localStorage.getItem(ORG_ICON_KEY) || "do"; } catch { return "do"; }
}
export function renderOrgChip(rail) {
  const root = rail || document.querySelector(".im-rail");
  if (!root) return;
  const logo = root.querySelector(".im-rail-org-logo");
  const name = root.querySelector(".im-rail-org-name");
  if (!logo || !name) return;
  const icon = getOrgIcon();
  name.textContent = getOrgName();
  if (/^(https?:\/\/|data:image)/i.test(icon)) {
    logo.innerHTML = `<img src="${escapeHtml(icon)}" alt="">`;
  } else {
    logo.textContent = [...icon].slice(0, 2).join("") || "do";
  }
}
export function bindOrgChip(rail) {
  const chip = rail?.querySelector(".im-rail-org-chip");
  if (!chip || chip.dataset.bound === "1") return;
  chip.dataset.bound = "1";
  const logo = chip.querySelector(".im-rail-org-logo");
  const name = chip.querySelector(".im-rail-org-name");
  if (logo) {
    logo.title = "点击更换图标（1~2 个字 / emoji / 图片 URL）";
    logo.addEventListener("click", (e) => {
      e.stopPropagation();
      const v = window.prompt("团队图标：1~2 个字、emoji 或图片 URL", getOrgIcon());
      if (v === null) return;
      try { localStorage.setItem(ORG_ICON_KEY, v.trim() || "do"); } catch { /* ignore */ }
      renderOrgChip(rail);
    });
  }
  if (name) {
    name.title = "点击修改团队名称";
    name.addEventListener("click", (e) => {
      e.stopPropagation();
      const v = window.prompt("团队名称", getOrgName());
      if (v === null) return;
      try { localStorage.setItem(ORG_NAME_KEY, v.trim() || defaultOrgName()); } catch { /* ignore */ }
      renderOrgChip(rail);
    });
  }
}


export function ensureRailDingtalk() {
  let rail = document.querySelector(".im-rail");
  // 旧结构（头像 + ☰ 展开钮）重建为新版导航；wecom 顶部是用户块（无 org chip），以 .im-rail-me 判新
  if (rail && !rail.querySelector(".im-rail-org-chip, .im-rail-me")) {
    rail.remove();
    rail = null;
  }
  if (rail) {
    syncRailDingtalk();
    return rail;
  }
  rail = document.createElement("nav");
  rail.className = "im-rail";
  rail.setAttribute("aria-label", "IM 导航");

  const head = document.createElement("div");
  head.className = "im-rail-head";
  if (SKIN_ID === "wecom") {
    // 官方 5.x：顶部为当前用户（头像 + 用户名）；沿用 .im-rail-avatar 的同步/角标/回首页逻辑
    head.innerHTML =
      `<span class="im-rail-me">` +
      `<span class="im-rail-avatar"></span>` +
      `<span class="im-rail-avatar-badge" style="display:none"></span>` +
      `</span>` +
      `<span class="im-rail-user-name"></span>`;
  } else {
    head.innerHTML =
      `<div class="im-rail-org-chip">` +
      `<span class="im-rail-org-logo">do</span>` +
      `<span class="im-rail-org-name">linux.do</span>` +
      `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>` +
      `</div>`;
  }
  rail.appendChild(head);

  const items = document.createElement("div");
  items.className = "im-rail-items";
  // 企业微信官方风格：rail 主区（分组以上）用实心图标，分组区保持空心
  const solid = SKIN_ID === "wecom";
  const rIcon = (k) => (solid && ICONS[`${k}Fill`] ? ICONS[`${k}Fill`] : ICONS[k]);
  items.innerHTML =
    `<button type="button" class="im-rail-item active" data-rail-key="chat">${rIcon("msg")}<span>消息</span>` +
    `<span class="im-rail-badge" style="display:none"></span></button>` +
    `<button type="button" class="im-rail-item" data-rail-key="notifications">${rIcon("bell")}<span>通知</span>` +
    `<span class="im-rail-badge" style="display:none"></span></button>` +
    `<button type="button" class="im-rail-item" data-rail-key="messages">${rIcon("mail")}<span>私信</span>` +
    `<span class="im-rail-badge" style="display:none"></span></button>` +
    `<button type="button" class="im-rail-item" data-rail-key="bookmarks">${rIcon("bookmark")}<span>书签</span>` +
    `<span class="im-rail-badge" style="display:none"></span></button>` +
    `<button type="button" class="im-rail-item" data-rail-key="chats">${rIcon("users")}<span>聊天</span>` +
    `<span class="im-rail-badge" style="display:none"></span></button>` +
    RAIL_DECO_ITEMS.filter((item) => item.key !== "more")
      .map((item) =>
        `<button type="button" class="im-rail-item" data-rail-key="${item.key}">${rIcon(item.icon)}<span>${item.label}</span>${item.dot ? '<i class="im-rail-dot"></i>' : ""}</button>`
      )
      .join("");
  rail.appendChild(items);

  // rail 项点击：注册表内有源的切换中栏内容；「聊天」跳原生 /chat；装饰项暂不响应
  items.addEventListener("click", (e) => {
    const btn = e.target.closest(".im-rail-item[data-rail-key]");
    if (!btn || !items.contains(btn)) return;
    const key = btn.dataset.railKey;
    if (key === "chats") {
      // 原生 /chat 会直接打开最近频道（像和某人的单聊）；频道列表页才是「聊天列表」
      navigateInApp("/chat/channels");
      return;
    }
    // 非常规路由（原生 /chat* 页等）没有中栏面板：先回首页让面板重建，再切源
    if (!document.querySelector(".im-list-panel")) {
      navigateInApp("/");
      return;
    }
    if (hasSource(key)) setActiveRailKey(key, { force: true });
  });

  // wecom：官方 5.x「分组」区（未读/@我/单聊/群聊/内部/外部/标记）
  if (SKIN_ID === "wecom") {
    const groups = document.createElement("div");
    groups.className = "im-rail-groups";
    const groupItems = [
      ["unread", "未读", "mail", true],
      ["at", "@我", "at"],
      ["single", "单聊", "users"],
      ["group", "群聊", "users"],
      ["inner", "内部聊天", "msg"],
      ["outer", "外部聊天", "doc"],
      ["marked", "标记", "collect"]
    ];
    groups.innerHTML =
      `<div class="im-rail-group-title"><span>分组</span></div>` +
      groupItems
        .map(([key, label, icon, withCount]) =>
          `<button type="button" class="im-rail-item im-rail-group-item" data-group="${key}">` +
          `${ICONS[icon]}<span>${label}</span>` +
          (withCount ? `<span class="im-rail-count" style="display:none"></span>` : "") +
          `</button>`)
        .join("");
    items.appendChild(groups);
    // 目前只接「未读」→ 站内未读列表；其余分组暂为占位
    groups.addEventListener("click", (e) => {
      const btn = e.target.closest(".im-rail-group-item");
      if (!btn || btn.dataset.group !== "unread") return;
      navigateInApp("/unseen");
    });
  }

  // 底部「更多」：展开 / 收起话题导航（原生侧栏）
  const bottom = document.createElement("div");
  bottom.className = "im-rail-bottom";
  ensureRailFold(bottom);

  const more = document.createElement("button");
  more.type = "button";
  more.className = "im-rail-item im-rail-more";
  more.dataset.railKey = "more";
  more.title = "展开话题导航";
  more.setAttribute("aria-expanded", "false");
  more.innerHTML = `${ICONS.more}<span>更多</span>`;
  more.addEventListener("click", () => setNav2Open(!isNav2Open()));
  bottom.appendChild(more);
  rail.appendChild(bottom);

  document.body.appendChild(rail);
  if (SKIN_ID === "wecom") {
    bindRailAvatarNotif(rail); // wecom 头像在 rail 顶部：点击回首页
  } else {
    renderOrgChip(rail);
    bindOrgChip(rail);
  }
  setNav2Open(isNav2Open()); // 同步「更多」高亮态
  syncRailDingtalk();
  return rail;
}
/** 读取 Discourse 未读通知数（与顶栏用户菜单角标同源） */
export function getUnreadNotificationCount() {
  try {
    const owner = getEmberOwner();
    const user =
      safeLookup(owner, "service:current-user") ||
      window.Discourse?.User?.current?.() ||
      null;
    if (user) {
      const pick = (key) => {
        try {
          const v = user.get?.(key);
          if (v != null && v !== "") return Number(v);
        } catch { /* ignore */ }
        const direct = user[key];
        return direct == null || direct === "" ? null : Number(direct);
      };
      const all = pick("all_unread_notifications_count");
      if (all != null && !Number.isNaN(all)) return Math.max(0, all);
      const unread = pick("unread_notifications");
      const high = pick("unread_high_priority_notifications");
      const pm = pick("new_personal_messages_notifications_count");
      const sum = (unread || 0) + (high || 0) + (pm || 0);
      if (sum > 0) return sum;
      if (unread != null && !Number.isNaN(unread)) return Math.max(0, unread);
    }
  } catch { /* ignore */ }

  const domBadge = document.querySelector(
    "#current-user .badge-notification, " +
    ".header-dropdown-toggle.current-user .badge-notification, " +
    "#toggle-current-user .badge-notification, " +
    ".current-user .badge-notification"
  );
  if (domBadge) {
    const text = (domBadge.textContent || "").replace(/\s+/g, "").trim();
    if (/^\d+$/.test(text)) return Number(text);
    if (/\d/.test(text)) {
      const n = parseInt(text, 10);
      if (!Number.isNaN(n)) return Math.min(n, 99);
    }
    // 只有红点/图标、无数字时视为至少 1
    if (domBadge.classList.contains("unread") || domBadge.querySelector("svg")) return 1;
  }
  return 0;
}
export function syncRailDingtalk() {
  // 头像 rail 内优先（wecom 在 rail 顶部；feishu 也在 rail），兜底 titlebar 旧位置
  const avatarEl =
    document.querySelector(".im-rail .im-rail-avatar") ||
    document.querySelector(".im-rail-avatar");
  if (!avatarEl) return;
  // 头像：取原生当前用户头像
  const img = document.querySelector("#current-user img");
  const name = getCurrentUsername();
  if (img && img.src) {
    if (avatarEl.dataset.bound !== img.src) {
      avatarEl.dataset.bound = img.src;
      avatarEl.innerHTML = `<img src="${escapeHtml(img.src)}" alt="">`;
      avatarEl.style.background = "transparent";
    }
  } else if (name && avatarEl.dataset.bound !== name) {
    avatarEl.dataset.bound = name;
    avatarEl.textContent = avatarLetter(name);
    avatarEl.style.background = avatarColor(name);
  }

  // wecom：rail 顶部用户名
  const userNameEl = document.querySelector(".im-rail-user-name");
  if (userNameEl) userNameEl.textContent = name || "我";

  // 头像通知角标（rail 优先，兜底 titlebar）
  const notifCount = getUnreadNotificationCount();
  const avatarBadge =
    document.querySelector(".im-rail .im-rail-avatar-badge") ||
    document.querySelector(".im-rail-avatar-badge");
  if (avatarBadge) {
    avatarBadge.style.display = notifCount > 0 ? "" : "none";
    avatarBadge.textContent = notifCount > 99 ? "99+" : String(notifCount);
  }

  // 「消息」项未读（中栏话题求和）
  const unread = listState.topics.reduce((sum, t) => sum + (t.unread || 0) + (t.new_posts || 0), 0);
  setRailBadge("chat", unread);
  setRailBadge("notifications", notifCount);
  setRailBadge("messages", getPersonalMessagesUnread());
  setRailBadge("chats", getNativeChatBadgeCount());
  // wecom 分组「未读」计数
  const groupCount = document.querySelector('.im-rail-group-item[data-group="unread"] .im-rail-count');
  if (groupCount) {
    groupCount.textContent = unread > 99 ? "99+" : String(unread);
    groupCount.style.display = unread > 0 ? "" : "none";
  }
}

function setRailBadge(key, count) {
  const badge = document.querySelector(`[data-rail-key="${key}"] .im-rail-badge`);
  if (!badge) return;
  badge.style.display = count > 0 ? "" : "none";
  badge.textContent = count > 99 ? "99+" : String(count);
}

/** 私信未读：currentUser.new_personal_messages_notifications_count（取不到为 0） */
export function getPersonalMessagesUnread() {
  try {
    const owner = getEmberOwner();
    const user =
      safeLookup(owner, "service:current-user") ||
      window.Discourse?.User?.current?.() ||
      null;
    const pick = (key) => {
      try {
        const v = user?.get?.(key);
        if (v != null && v !== "") return Number(v);
      } catch { /* ignore */ }
      const direct = user?.[key];
      return direct == null || direct === "" ? null : Number(direct);
    };
    const pm = pick("new_personal_messages_notifications_count");
    if (pm != null && !Number.isNaN(pm)) return Math.max(0, pm);
  } catch { /* ignore */ }
  return 0;
}

/** 原生 Discourse Chat 顶栏徽标（best-effort，无插件/无徽标为 0） */
function getNativeChatBadgeCount() {
  const el = document.querySelector(
    ".header-dropdown-toggle.chat .badge-notification, " +
    ".chat-header-icon .badge-notification, " +
    "#header .chat-badge, " +
    "li.header-dropdown-toggle[data-badge-name] .badge-notification"
  );
  if (!el) return 0;
  const text = (el.textContent || "").replace(/\s+/g, "").trim();
  const n = parseInt(text, 10);
  return Number.isNaN(n) ? 1 : Math.min(n, 99);
}


/* ============================== 头像 / 顶栏 → IM 通知列（§5.2 user-menu 拦截） ============================== */

const NATIVE_USER_MENU_KEY = "im-native-user-menu";

function nativeUserMenuForced() {
  try { return localStorage.getItem(NATIVE_USER_MENU_KEY) === "1"; } catch { return false; }
}
/** 接管可用性：降级开关生效或注册表未就绪时回原生 user-menu */
function interceptionAvailable() {
  return !nativeUserMenuForced() && hasSource("notifications");
}
/** 打开 IM 通知详情列；看帖子时先回首页让中栏可见 */
function openNotificationsColumn() {
  setActiveRailKey("notifications");
  if (document.documentElement.classList.contains("im-topic-open")) {
    navigateInApp("/");
  }
  return true;
}

/** rail 左上角头像：点击回首页（通知列入口在筛选窄条铃铛；顶栏原生头像仍走通知列接管） */
export function bindRailAvatarNotif(rail) {
  const avatar = rail?.querySelector(".im-rail-avatar");
  if (!avatar || avatar.dataset.notifBound === "1") return;
  avatar.dataset.notifBound = "1";
  avatar.removeAttribute("title");
  avatar.addEventListener("click", (e) => {
    if (getViewMode() === "native" || otherThemeActive()) return;
    if (!interceptionAvailable()) return; // 降级：原生菜单行为保留
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
    try {
      navigateInApp("/");
      refreshRail();
    } catch (err) {
      console.warn("[linuxdo-im] avatar → home failed", err);
    }
  });
}

/** 顶栏原生头像按钮（#current-user 等）document capture 委托接管：
 *  阻止原生 user-menu 弹层，改开 IM 通知列；降级开关或接管异常时放行原生。 */
export function bindHeaderUserMenuInterception() {
  if (window.__imUserMenuInterceptBound) return;
  window.__imUserMenuInterceptBound = true;
  document.addEventListener(
    "click",
    (e) => {
      if (e.button !== 0) return;
      if (getViewMode() === "native" || otherThemeActive()) return;
      if (!interceptionAvailable()) return;
      const toggle = e.target.closest(
        "#toggle-current-user, #current-user button, .header-dropdown-toggle.current-user button, .current-user button.icon, #current-user .icon, #current-user summary, .header-dropdown-toggle.current-user"
      );
      if (!toggle) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        openNotificationsColumn();
      } catch (err) {
        console.warn("[linuxdo-im] header user-menu interception failed", err);
      }
    },
    true
  );
}
