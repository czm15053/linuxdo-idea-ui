import { MASK_AVATAR_KEY, MASK_TITLE_KEY, CHAT_KEY, HIDE_MEDIA_KEY } from "../config/constants.js";

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
