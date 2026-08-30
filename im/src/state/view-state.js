import { VIEW_KEY } from "../config/constants.js";

export function getViewMode() {
  try {
    return localStorage.getItem(VIEW_KEY) === "native" ? "native" : "im";
  } catch {
    return "im";
  }
}
export function setViewMode(mode) {
  try {
    localStorage.setItem(VIEW_KEY, mode);
  } catch { /* ignore */ }
}
