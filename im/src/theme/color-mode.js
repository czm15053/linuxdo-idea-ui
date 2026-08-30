import { COLOR_THEME_KEY, DARK_CLASS } from "../config/constants.js";
import { otherThemeActive } from "../config/skins.js";

let schemeObserver = null;
let forcingScheme = false;

// 深色切换按钮的刷新由皮肤层注册（避免 theme → skins 反向依赖）
const themeChangeListeners = [];
export function onColorThemeChange(fn) {
  themeChangeListeners.push(fn);
}


export function getColorTheme() {
  try {
    const mode = localStorage.getItem(COLOR_THEME_KEY);
    return mode === "dark" || mode === "light" ? mode : "auto";
  } catch {
    return "auto";
  }
}
export function isDarkEffective() {
  const mode = getColorTheme();
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return !!(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
}
export function setColorTheme(mode) {
  try {
    localStorage.setItem(COLOR_THEME_KEY, mode);
  } catch { /* ignore */ }
  applyColorMode();
  forceSiteScheme();
  for (const fn of themeChangeListeners) fn();
}
export function toggleColorTheme() {
  const next = isDarkEffective() ? "light" : "dark";
  setColorTheme(next);
}
export function applyColorMode() {
  const dark = isDarkEffective();
  document.documentElement.classList.toggle(DARK_CLASS, dark);
}

const SCHEME_CLASSES = ["dark", "dark-scheme", "scheme-dark"];

/** 把当前明暗强制写入任意同源 document（主页面 / 内嵌 iframe 共用）。
 *  只做差量写入：状态已一致时不改 DOM，供 MutationObserver 防回弹而不死循环。 */
export function forceSchemeInDoc(doc) {
  if (!doc?.documentElement) return false;
  const dark = isDarkEffective();
  const scheme = dark ? "dark" : "light";
  let changed = false;
  try {
    for (const el of [doc.documentElement, doc.body]) {
      if (!el) continue;
      if (el.style.colorScheme !== scheme) {
        el.style.colorScheme = scheme;
        changed = true;
      }
      const present = SCHEME_CLASSES.filter((c) => el.classList.contains(c));
      const want = dark ? SCHEME_CLASSES.length : 0;
      if (present.length !== want) {
        for (const c of SCHEME_CLASSES) el.classList.toggle(c, dark);
        changed = true;
      }
    }
    const darkLinks = doc.querySelectorAll("link.dark-scheme, link[class*='dark-scheme']");
    const lightLinks = doc.querySelectorAll("link.light-scheme, link[class*='light-scheme']");
    const setLink = (link, on) => {
      // on=启用该 scheme（media=all、未 disabled）；off=屏蔽（media=none、disabled）
      if (on ? link.media !== "all" || link.disabled : link.media !== "none" || !link.disabled) changed = true;
      link.media = on ? "all" : "none";
      link.disabled = !on;
    };
    for (const link of darkLinks) setLink(link, dark);
    for (const link of lightLinks) setLink(link, !dark);
  } catch {
    /* 跨域或文档未就绪：跳过 */
  }
  return changed;
}

export function forceSiteScheme() {
  if (otherThemeActive()) return;
  forcingScheme = true;
  try {
    forceSchemeInDoc(document);
  } finally {
    forcingScheme = false;
  }
  ensureSchemeObserver();
}

/** 内嵌 iframe 文档防回弹：Discourse Ember 启动/路由后会重写 scheme link/class，观察并拉回 */
export function watchSchemeDoc(doc) {
  if (!doc || doc.__imSchemeWatch || typeof MutationObserver === "undefined") return;
  doc.__imSchemeWatch = true;
  const obs = new MutationObserver(() => {
    if (forcingScheme) return;
    forceSchemeInDoc(doc);
  });
  const start = () => {
    const root = doc.head || doc.documentElement;
    if (!root) return;
    obs.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["media", "disabled", "class", "href"]
    });
  };
  start();
}

export function ensureSchemeObserver() {
  if (schemeObserver || typeof MutationObserver === "undefined") return;
  schemeObserver = new MutationObserver(() => {
    if (forcingScheme || otherThemeActive()) return;
    forceSiteScheme();
  });
  const start = () => {
    const root = document.head || document.documentElement;
    if (!root) return;
    schemeObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["media", "disabled", "class", "href"]
    });
  };
  start();
}

// auto 模式跟随系统：系统明暗变化时同步主文档 + 通知皮肤层/内嵌 iframe
if (typeof window !== "undefined" && window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (getColorTheme() !== "auto") return;
    applyColorMode();
    forceSiteScheme();
    for (const fn of themeChangeListeners) fn();
  });
}
