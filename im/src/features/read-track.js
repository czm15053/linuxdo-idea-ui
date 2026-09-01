// IM 气泡流的阅读进度上报（/topics/timings），对齐原生 screen-track 服务语义。
// 原生按「原生楼层 DOM 的视口可见性」计时；IM 锁定态下原生流被压在面板下不滚动，
// 已读位置不随真实浏览推进 —— 这里改用 IM 气泡容器 .im-chat-body 的可见楼层，
// 其余规则照搬原生：每秒 tick 累计可见楼层时长；停止滚动 3 分钟暂停（防挂机）；
// 页面不可见不累计；60s 周期 / 切话题 / 页面隐藏时 flush。只报真实读到的楼层。
import { chatState } from "../state/chat-state.js";
import { csrfToken } from "../bridge/api.js";
import { getCurrentUsername } from "../bridge/user.js";
import { visibleTopicPosts } from "../ui/chat-panel.js";

const TICK_MS = 1000;
const PAUSE_UNLESS_SCROLLED = 3 * 60 * 1000; // 原生 PAUSE_UNLESS_SCROLLED
const MAX_TRACKING_TIME = 6 * 60 * 1000; // 原生 MAX_TRACKING_TIME：每楼每次会话最多报 6 分钟
const FLUSH_INTERVAL = 60 * 1000; // 原生 nextFlush = 60s
const MAX_TICK_GAP = 60 * 1000; // 休眠恢复的巨大跳变整段丢弃

let activeTopicId = null;
let timings = new Map(); // post_number -> 本批 ms
let totalTimings = new Map(); // post_number -> 本会话已上报总量（MAX_TRACKING_TIME 过滤用）
let topicTime = 0;
let lastTick = Date.now();
let lastScrolled = Date.now();
let sinceFlush = 0;
let flushing = false;

function currentVisiblePosts() {
  const panel = document.querySelector(".im-chat-panel");
  // 面板空态 / 非 IM 视图（无面板）时无可见楼层，自然不累计
  if (!panel || panel.dataset.empty === "1") return [];
  return visibleTopicPosts(panel.querySelector(".im-chat-body"));
}

async function flush() {
  if (flushing || !timings.size || !activeTopicId) return;
  if (!getCurrentUsername()) return; // 匿名不报（服务端也拒）
  const id = activeTopicId;
  // 原生 flush 过滤：本楼累计已报满 6 分钟后不再计入（不截断，整批要么报要么丢）
  const batch = [];
  for (const [n, ms] of timings) {
    const total = totalTimings.get(n) || 0;
    if (ms > 0 && total < MAX_TRACKING_TIME) {
      totalTimings.set(n, total + ms);
      batch.push([n, ms]);
    }
  }
  timings = new Map();
  const time = topicTime;
  topicTime = 0;
  sinceFlush = 0;
  if (!batch.length) return;
  flushing = true;
  const params = batch
    .map(([n, ms]) => `timings[${n}]=${Math.round(ms)}`)
    .join("&");
  const body = `${params}&topic_time=${Math.round(time)}&topic_id=${id}`;
  try {
    await fetch("/topics/timings", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true, // pagehide 时也尽量发出
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-CSRF-Token": csrfToken(),
        "X-Requested-With": "XMLHttpRequest",
        "X-SILENCE-LOGGER": "true",
        "Discourse-Background": "true"
      },
      body
    });
  } catch { /* 丢弃本批（原生 inProgress 期间同样丢弃；下批 60s 后继续） */ }
  finally { flushing = false; }
}

function tick() {
  const now = Date.now();
  const diff = now - lastTick;
  lastTick = now;
  if (diff <= 0) return;

  // 话题切换：先结算旧话题再重置（loadTopic 只改 chatState.topicId，这里被动感知）
  if (chatState.topicId !== activeTopicId) {
    flush();
    activeTopicId = chatState.topicId;
    timings = new Map();
    totalTimings = new Map(); // 重新进入话题后重新计 6 分钟上限（原生 start() 同理）
    topicTime = 0;
    sinceFlush = 0;
  }
  if (!activeTopicId) return;

  if (now - lastScrolled > PAUSE_UNLESS_SCROLLED) return;
  if (document.visibilityState !== "visible") return;
  if (diff > MAX_TICK_GAP) return;

  // flush 计时与原生一致：先于可见楼层检查累计，避免「有滚动但暂无可见楼」时批次滞留
  sinceFlush += diff;
  if (sinceFlush > FLUSH_INTERVAL) flush();

  const posts = currentVisiblePosts();
  if (!posts.length) return;
  topicTime += diff;
  for (const n of posts) timings.set(n, (timings.get(n) || 0) + diff);
}

function startReadTracking() {
  // scroll 不冒泡，capture 阶段委托；只认 IM 气泡容器的滚动
  document.addEventListener("scroll", (e) => {
    if (e.target instanceof Element && e.target.closest(".im-chat-body")) {
      lastScrolled = Date.now();
    }
  }, true);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
    lastTick = Date.now();
  });
  window.addEventListener("pagehide", () => flush());
  setInterval(tick, TICK_MS);
}

// 模块加载即启动（入口 bootstrap.js 纯 import 触发）
startReadTracking();
