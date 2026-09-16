import { ICONS } from "../config/icons.js";
import { currentSkinId, SKINS } from "../config/skins.js";
import { nativeAvatarSrc, nativeDisplayName } from "../bridge/x-dom.js";
import { isDarkEffective, toggleColorTheme } from "../theme/color-mode.js";
import { escapeHtml } from "../utils/html.js";
import { toast } from "./toast.js";
import { personAvatarHtml } from "./avatars.js";

function bindTitlebarOnce(bar) {
  if (bar.dataset.bound === "1") return;
  bar.dataset.bound = "1";
  bar.addEventListener("click", (e) => {
    if (e.target.closest(".im-dark-toggle")) {
      toggleColorTheme();
      return;
    }
    const act = e.target.closest("[data-act]");
    if (!act || !bar.contains(act)) return;
    toast(act.dataset.act === "create" ? "装饰按钮 · 创建" : "装饰按钮 · 投屏");
  });
}

export function ensureTitlebar() {
  const skin = SKINS[currentSkinId()];
  let bar = document.querySelector(".im-titlebar");
  if (skin.titlebarHeight === 0) {
    bar?.remove();
    return null;
  }
  if (!bar) {
    bar = document.createElement("header");
    bar.className = "im-titlebar";
    (document.body || document.documentElement).appendChild(bar);
  }
  bindTitlebarOnce(bar);
  const src = nativeAvatarSrc();
  const name = nativeDisplayName();
  const html = `
    <div class="me-chip" title="${escapeHtml(name)}">
      <div class="im-rail-avatar">${personAvatarHtml("im-rail-me-ava", name, src, "me", true)}</div>
    </div>
    <div class="title-actions">
      <button type="button" class="t-btn im-dark-toggle" title="深色模式">${isDarkEffective() ? ICONS.sun : ICONS.moon}</button>
      <button type="button" class="t-btn" data-act="cast" title="投屏"><span class="dot"></span>${ICONS.monitor}</button>
      <button type="button" class="t-btn" data-act="create" title="创建">${ICONS.plus}</button>
    </div>`;
  if (bar.dataset.sig === html) return bar;
  bar.dataset.sig = html;
  bar.innerHTML = html;
  return bar;
}
