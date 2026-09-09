import { COLOR_THEME_KEY, DARK_CLASS, ROOT_CLASS } from "../config/constants.js";

const listeners = [];
export function onColorThemeChange(fn) { listeners.push(fn); }

export function getColorTheme() {
  try { return localStorage.getItem(COLOR_THEME_KEY) || "auto"; } catch { return "auto"; }
}
export function setColorTheme(v) {
  try { localStorage.setItem(COLOR_THEME_KEY, v); } catch { /* ignore */ }
  applyColorMode();
}
export function toggleColorTheme() {
  const cur = getColorTheme();
  setColorTheme(cur === "auto" ? "dark" : cur === "dark" ? "light" : "auto");
}
function systemDark() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}
export function isDarkEffective() {
  const t = getColorTheme();
  if (t === "dark") return true;
  if (t === "light") return false;
  return systemDark();
}
export function applyColorMode() {
  const html = document.documentElement;
  if (!html) return;
  html.classList.toggle(DARK_CLASS, isDarkEffective());
  html.setAttribute("data-xim-dark", isDarkEffective() ? "1" : "0");
  html.style.colorScheme = isDarkEffective() ? "dark" : "light";
  html.classList.add(ROOT_CLASS);
  for (const fn of listeners) fn();
}
