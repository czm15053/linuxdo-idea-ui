import { VIEW_KEY } from "../config/constants.js";

export function getViewMode() {
  try { return localStorage.getItem(VIEW_KEY) || "im"; } catch { return "im"; }
}
export function setViewMode(m) {
  try { localStorage.setItem(VIEW_KEY, m); } catch { /* ignore */ }
}
