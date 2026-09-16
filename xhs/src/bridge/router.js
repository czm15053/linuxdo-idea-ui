import { PINNED } from "../config/constants.js";
import { getChatId } from "../state/prefs.js";

export function routeKind(pathname = location.pathname) {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/" || p === "/explore" || p.startsWith("/explore")) {
    if (/\/explore\/[a-f0-9]+/.test(p)) return "note";
    return "explore";
  }
  if (/\/user\/profile\/[^/]+\/[a-f0-9]{24}/i.test(p)) return "note";
  if (p.startsWith("/user/profile")) return "profile";
  if (p === "/following" || p.startsWith("/following")) return "following";
  if (p === "/search_result" || p.startsWith("/search_result")) return "search";
  if (p.startsWith("/channel")) return "channel";
  return "explore";
}

export function chatIdFromRoute() {
  const kind = routeKind();
  if (kind === "explore") return "explore";
  if (kind === "following") return "following";
  if (kind === "search") return "search";
  if (kind === "profile") return "profile";
  // note 详情走右侧抽屉，中栏 chatId 保持原场景不变
  return getChatId() || "explore";
}

export function pinnedById(id) {
  return PINNED.find((c) => c.id === id) || PINNED[0];
}

export function patchHistory(onChange) {
  for (const method of ["pushState", "replaceState"]) {
    const original = history[method];
    history[method] = function (...args) {
      const ret = original.apply(this, args);
      onChange();
      return ret;
    };
  }
  window.addEventListener("popstate", onChange);
}
