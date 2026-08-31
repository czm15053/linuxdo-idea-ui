export async function api(path) {
  const resp = await fetch(path, {
    headers: { Accept: "application/json" },
    credentials: "same-origin"
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
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
