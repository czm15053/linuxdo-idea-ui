import { MASK_AVATAR_KEY, MASK_TITLE_KEY, CHAT_KEY, SORT_KEY, HIDE_MEDIA_KEY } from "../config/constants.js";

export function isHideMedia() {
  try { return localStorage.getItem(HIDE_MEDIA_KEY) === "1"; } catch { return false; }
}
export function setHideMedia(on) {
  try { localStorage.setItem(HIDE_MEDIA_KEY, on ? "1" : "0"); } catch { /* ignore */ }
}

export function isMaskAvatar() {
  try { return localStorage.getItem(MASK_AVATAR_KEY) === "1"; } catch { return false; }
}
export function setMaskAvatar(on) {
  try { localStorage.setItem(MASK_AVATAR_KEY, on ? "1" : "0"); } catch { /* ignore */ }
}
export function isMaskTitle() {
  try { return localStorage.getItem(MASK_TITLE_KEY) === "1"; } catch { return false; }
}
export function setMaskTitle(on) {
  try { localStorage.setItem(MASK_TITLE_KEY, on ? "1" : "0"); } catch { /* ignore */ }
}
export function getChatId() {
  try { return localStorage.getItem(CHAT_KEY) || "home"; } catch { return "home"; }
}
export function setChatId(id) {
  try { localStorage.setItem(CHAT_KEY, id); } catch { /* ignore */ }
}
// home 时间线排序：'recent'（最近）/ 'hot'（热门）。驱动原生 UI 切换。
let memSort = null;
export function getSortMode() {
  if (memSort) return memSort;
  try { return localStorage.getItem(SORT_KEY) || "recent"; } catch { return "recent"; }
}
export function setSortMode(mode) {
  const m = mode === "hot" ? "hot" : "recent";
  memSort = m;
  try { localStorage.setItem(SORT_KEY, m); } catch { /* ignore */ }
}
