export async function api(path, extraHeaders) {
  const resp = await fetch(path, {
    headers: { Accept: "application/json", ...extraHeaders },
    credentials: "same-origin"
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

/**
 * 话题浏览上报头（对齐 Discourse 前端 ajax.js 的 trackNextAjaxAsTopicView）：
 * RequestTracker 中间件按 Discourse-Track-View + Topic-Id 头把 topics.views +1；
 * 服务端 Redis 按「用户或 IP + 话题 + 天」去重（topic_view_duration_hours，默认 8h），
 * 因此与原生路由上报并存也不会重复计数。仅自发拉话题主体时带，翻页/跳楼不带。
 */
export function trackViewHeaders(topicId) {
  return {
    "Discourse-Track-View": "true",
    "Discourse-Track-View-Topic-Id": String(topicId)
  };
}

export function csrfToken() {
  const meta = document.querySelector("meta[name='csrf-token']");
  return meta ? meta.content : "";
}

/** 写请求（PUT/POST/DELETE），带 CSRF；失败抛 HTTP 状态 */
export async function apiSend(path, method, body) {
  const resp = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "X-CSRF-Token": csrfToken(),
      "X-Requested-With": "XMLHttpRequest",
      ...(body ? { "Content-Type": "application/json; charset=UTF-8" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json().catch(() => ({}));
}
