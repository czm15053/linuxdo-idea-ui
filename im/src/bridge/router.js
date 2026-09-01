import { discourseRequire } from "./discourse.js";
import { pg } from "./page.js";

/** 站内软跳转后重应用布局；由入口注册 */
let applyHook = null;
export function onRouteApply(fn) { applyHook = fn; }

export function isTopicPath(pathname) {
  return /^\/t\//.test(pathname);
}
export function topicIdFromPath(pathname) {
  const m = pathname.match(/^\/t\/(?:[\w-]+\/)?(\d+)/);
  return m ? Number(m[1]) : null;
}
/** 路由携带的楼层号（/t/[slug/]id/N），无则 0 */
export function postNumberFromPath(pathname) {
  const m = pathname.match(/^\/t\/(?:[\w-]+\/)?\d+(?:\/(\d+))?/);
  return m && m[1] ? Number(m[1]) : 0;
}
export function isHomePath(pathname) {
  return pathname === "/" ||
    /^\/(latest|new|unread|unseen|top|categories|hot|posted|read|bookmarks)\b/.test(pathname) ||
    /^\/c\//.test(pathname) || /^\/tag\//.test(pathname);
}
/** 中栏列表 JSON 端点按路由映射 */
export function listApiForPath(pathname) {
  if (pathname === "/" || pathname === "/latest") return "/latest.json";
  if (pathname === "/new") return "/new.json";
  if (pathname === "/unread" || pathname === "/unseen") return "/unseen.json";
  if (pathname === "/top") return "/top.json";
  const top = pathname.match(/^\/top\/(weekly|monthly|quarterly|yearly|all)$/);
  if (top) return `/top.json?period=${top[1]}`;
  if (pathname === "/hot") return "/hot.json";
  if (pathname === "/posted") return "/posted.json";
  if (pathname === "/read") return "/read.json";
  if (pathname === "/bookmarks") return "/bookmarks.json";
  // 类别页本身不是话题流；中栏仍拉 latest，避免 categories.json 无 topic_list
  if (pathname === "/categories") return "/latest.json";
  const c = pathname.match(/^\/c\/([\w-]+(?:\/[\w-]+)?)/);
  if (c) return `/c/${c[1]}.json`;
  const t = pathname.match(/^\/tag\/([\w-]+)/);
  if (t) return `/tag/${t[1]}.json`;
  return "/latest.json";
}

/** 站内软跳转：避免中栏自定义链接触发浏览器整页重载 */
function discourseRouteTo(url) {
  if (!url) return false;
  try {
    const mod = discourseRequire("discourse/lib/url");
    const DiscourseURL = mod?.default || mod;
    if (DiscourseURL && typeof DiscourseURL.routeTo === "function") {
      DiscourseURL.routeTo(url);
      return true;
    }
  } catch { /* ignore */ }
  try {
    if (typeof pg.Discourse?.URL?.routeTo === "function") {
      pg.Discourse.URL.routeTo(url);
      return true;
    }
  } catch { /* ignore */ }
  return false;
}
export function navigateInApp(url) {
  if (!url) return;
  // 绝对地址收成站内路径
  let path = url;
  try {
    if (/^https?:/i.test(url)) path = new URL(url, location.origin).pathname + new URL(url, location.origin).search + new URL(url, location.origin).hash;
  } catch { /* keep url */ }
  // IM 观感：进入话题固定从第 1 楼打开（原生隐藏流窗口随之对齐）
  {
    const cut = /[?#]/.exec(path);
    const base = cut ? path.slice(0, cut.index) : path;
    if (/^\/t\/[^/]+\/\d+$/.test(base)) {
      path = `${base}/1${cut ? path.slice(cut.index) : ""}`;
    }
  }
  if (discourseRouteTo(path)) {
    applyHook?.();
    return;
  }
  history.pushState({}, "", path);
  applyHook?.();
}
