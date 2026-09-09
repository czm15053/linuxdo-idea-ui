import { PINNED } from "../config/constants.js";
import { currentHomeTab, currentDmId } from "./x-dom.js";
import { getChatId } from "../state/prefs.js";

export function routeKind(pathname = location.pathname) {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/" || p === "/home") return "home";
  if (p.startsWith("/search")) return "search";
  if (p === "/explore" || p.startsWith("/explore")) return "explore";
  if (p === "/notifications" || p.startsWith("/notifications")) return "notify";
  if (p === "/messages" || p.startsWith("/messages")) return "msg";
  if (p.startsWith("/i/bookmarks") || p.startsWith("/i/history")) return "bookmark";
  if (/\/status\/\d+/.test(p)) return "status";
  if (p.startsWith("/compose")) return "compose";
  if (p.startsWith("/settings") || p.startsWith("/i/flow") || p.startsWith("/i/premium")) return "other";
  return "profile";
}

export function chatIdFromRoute() {
  const kind = routeKind();
  if (kind === "home") return currentHomeTab() === "following" ? "follow" : "home";
  if (kind === "notify") return "notify";
  if (kind === "search") return "search";
  if (kind === "explore") return "explore";
  if (kind === "msg") {
    const dm = currentDmId();
    return dm ? "dm:" + dm : "msg";
  }
  if (kind === "bookmark") return "bookmark";
  if (kind === "profile") {
    const handle = location.pathname.split("/").filter(Boolean)[0];
    return handle ? "user:" + handle : (getChatId() || "home");
  }
  // status（推文详情）：详情走右侧抽屉，中栏 chatId 保持原场景不变
  return getChatId() || "home";
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
