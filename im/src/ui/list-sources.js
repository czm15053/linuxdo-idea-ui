// rail 内容源注册表（DISCOURSE-INTEGRATION §5.2）：每个 rail key 一个 source，
// 切换时仅替换 .im-list-panel 内容区（chips + body），滚动位置按 key 缓存。
// chat = 现有会话列表（listState 不变）；notifications = 通知模块；其余 key 二期补充。
import { renderListRows, loadMoreList } from "./list-panel.js";
import { renderNotifications, onNotificationsChip, notificationsScroll, ensureMarkRead, syncNotifStrip } from "./notifications.js";
import { registerExtraSources } from "./topic-lists.js";
import { navigateInApp } from "../bridge/router.js";

const sources = new Map();
const scrollCache = new Map(); // railKey -> body scrollTop
let activeKey = "chat";
let lastKey = null;

export function registerSource(key, source) {
  sources.set(key, source);
}

export function hasSource(key) {
  return sources.has(key);
}

export function activeRailKey() {
  return activeKey;
}

export function setActiveRailKey(key, opts = {}) {
  const panel = document.querySelector(".im-list-panel");
  // force：中栏被外部内容（如资料页）占用时，同 key 也强制回到 rail 源渲染
  const force = !!opts.force && !!panel && panel.dataset.src !== "rail";
  if ((key === activeKey && !force) || !sources.has(key)) return;
  if (panel) {
    const body = panel.querySelector(".im-list-body");
    scrollCache.set(activeKey, body?.scrollTop || 0);
  }
  activeKey = key;
  renderActiveSource();
}

/** 按当前 railKey 渲染内容区；路由变化时重复调用安全（同 key 不触发 onHide） */
export function renderActiveSource() {
  const panel = document.querySelector(".im-list-panel");
  if (!panel) return;
  bindSourceControls(panel);
  panel.dataset.src = "rail";
  const switching = lastKey !== activeKey;
  if (lastKey && switching) sources.get(lastKey)?.onHide?.(panel);
  lastKey = activeKey;
  panel.dataset.railKey = activeKey;
  try {
    sources.get(activeKey)?.render?.(panel);
  } catch (err) {
    console.warn("[linuxdo-im] rail source render failed:", activeKey, err);
  }
  for (const btn of document.querySelectorAll(".im-rail-item[data-rail-key]")) {
    btn.classList.toggle("active", btn.dataset.railKey === activeKey);
  }
  syncNotifStrip();
  // 只在真正切列时恢复缓存滚动位；同列 tick 级重入不动用户滚动位置
  if (switching) {
    const body = panel.querySelector(".im-list-body");
    if (body && scrollCache.has(activeKey)) body.scrollTop = scrollCache.get(activeKey);
  }
}

/** 中栏内容区滚动：按源分发（chat → 加载更多；notifications → 通知分页） */
export function onListBodyScroll(body) {
  if (body.scrollTop + body.clientHeight < body.scrollHeight - 120) return;
  const source = sources.get(activeKey);
  if (source?.onScroll) {
    source.onScroll(body);
    return;
  }
  loadMoreList();
}

// —— 「消息」源：复用现有会话列表渲染，行为与改造前一致 ——

function renderChatSource(panel) {
  ensureMarkRead(panel, false);
  const chips = panel.querySelector(".im-list-chips");
  if (chips.dataset.src !== "chat") {
    chips.dataset.src = "chat";
    chips.innerHTML =
      `<button type="button" class="im-chip active" data-chip="all">消息<span class="n"></span></button>` +
      `<button type="button" class="im-chip" data-chip="unread">未读<span class="n"></span></button>`;
  }
  renderListRows();
}

// —— chips 委托：面板壳只绑一次，替换 chips 内容后依然有效 ——

function bindSourceControls(panel) {
  if (panel.dataset.srcBound === "1") return;
  panel.dataset.srcBound = "1";
  const chips = panel.querySelector(".im-list-chips");
  chips?.addEventListener("click", (e) => {
    const chip = e.target.closest(".im-chip");
    if (!chip || !chips.contains(chip)) return;
    if (chip.dataset.ntype) {
      onNotificationsChip(chip);
      return;
    }
    if (chip.dataset.chip) {
      for (const c of chips.querySelectorAll(".im-chip")) c.classList.toggle("active", c === chip);
      navigateInApp(chip.dataset.chip === "unread" ? "/unseen" : "/latest");
    }
  });
}

/** 初始化注册表（bootstrap 在 ensureListPanel 之后调用一次） */
let initialized = false;
export function ensureRailSources() {
  if (initialized) return;
  initialized = true;
  registerSource("chat", { render: renderChatSource });
  registerSource("notifications", {
    render: renderNotifications,
    onHide: (panel) => ensureMarkRead(panel, false),
    onScroll: notificationsScroll
  });
  registerExtraSources();
}
