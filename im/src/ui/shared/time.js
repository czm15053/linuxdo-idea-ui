export function formatTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = Date.now();
  const diff = now - date.getTime();
  const minute = 60e3, hour = 3600e3, day = 86400e3;
  if (diff < minute) return "刚刚";
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day && date.getDate() === new Date().getDate()) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
  if (diff < 2 * day) return "昨天";
  if (diff < 365 * day) return `${date.getMonth() + 1}-${String(date.getDate()).padStart(2, "0")}`;
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
export function formatClock(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
/** 去 HTML 标签（用户资料摘要 / 通知 / 搜索命中标题等纯文本需求） */
export function stripTags(s) {
  return String(s || "").replace(/<[^>]*>/g, "");
}
/** 阅读时长：秒 → 「x 小时 / x 分钟 / x 秒」 */
export function fmtDuration(sec) {
  const s = Number(sec || 0);
  if (s >= 3600) return `${Math.round(s / 360) / 10} 小时`;
  if (s >= 60) return `${Math.round(s / 60)} 分钟`;
  return `${s} 秒`;
}
/** ISO 时间 → 「x年x月」（加入时间等） */
export function fmtMonth(iso) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}年${m[2]}月` : "";
}
/** 批量刷新所有会话列表项与聊天气泡评论的相对时间（增量更新，0 性能开销） */
export function refreshAllRelativeTimes() {
  const timeEls = document.querySelectorAll(".im-conv-time[data-timestamp], .im-msg-time[data-timestamp]");
  for (const el of timeEls) {
    const ts = el.dataset.timestamp;
    if (!ts) continue;
    const nextText = formatTime(ts);
    if (nextText && el.textContent !== nextText) {
      el.textContent = nextText;
    }
  }
}


let relativeTimeTickerId = null;

export function ensureRelativeTimeTicker() {
  if (relativeTimeTickerId) return;
  relativeTimeTickerId = setInterval(() => {
    if (document.visibilityState === "visible") {
      refreshAllRelativeTimes();
    }
  }, 15000);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshAllRelativeTimes();
    }
  });
}
