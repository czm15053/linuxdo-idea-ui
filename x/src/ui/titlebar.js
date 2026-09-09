import { ICONS } from "../config/icons.js";
import { currentSkinId, SKINS } from "../config/skins.js";
import { nativeAvatarSrc, nativeDisplayName, openSearch } from "../bridge/x-dom.js";
import { isDarkEffective, toggleColorTheme } from "../theme/color-mode.js";
import { escapeHtml } from "../utils/html.js";
import { toast } from "./toast.js";
import { personAvatarHtml } from "./avatars.js";

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
  const src = nativeAvatarSrc();
  const name = nativeDisplayName();
  bar.innerHTML = `
    <div class="me-chip" title="${escapeHtml(name)}">
      <div class="im-rail-avatar">${personAvatarHtml("im-rail-me-ava", name, src, "me", true)}</div>
    </div>
    <div class="title-search">
      <form action="/search" role="search">
        ${ICONS.search}
        <input type="search" placeholder="搜索" autocomplete="off" />
      </form>
    </div>
    <div class="title-actions">
      <button type="button" class="t-btn im-dark-toggle" title="深色模式">${isDarkEffective() ? ICONS.sun : ICONS.moon}</button>
      <button type="button" class="t-btn" data-act="cast" title="投屏"><span class="dot"></span>${ICONS.monitor}</button>
      <button type="button" class="t-btn" data-act="create" title="创建">${ICONS.plus}</button>
    </div>`;
  bar.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    openSearch(bar.querySelector("input").value);
  });
  bar.querySelector(".im-dark-toggle").addEventListener("click", () => toggleColorTheme());
  bar.querySelectorAll("[data-act]").forEach((b) => {
    b.addEventListener("click", () => {
      toast(b.dataset.act === "create" ? "装饰按钮 · 创建" : "装饰按钮 · 投屏");
    });
  });
  return bar;
}
