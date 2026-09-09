import { currentSkinId, SKINS } from "../config/skins.js";
import { getSkinIcon } from "../config/icons.js";
import { navigateX, badgeCount } from "../bridge/x-dom.js";
import { routeKind } from "../bridge/router.js";

export function ensureStrip() {
  const skin = SKINS[currentSkinId()];
  const items = skin.strip || [];
  if (!items.length || !skin.stripWidth) {
    document.querySelector(".im-strip")?.remove();
    return null;
  }
  let strip = document.querySelector(".im-strip");
  if (!strip) {
    strip = document.createElement("nav");
    strip.className = "im-strip";
    strip.setAttribute("aria-label", "快捷");
    (document.body || document.documentElement).appendChild(strip);
    strip.addEventListener("click", (e) => {
      const btn = e.target.closest(".im-strip-item");
      if (!btn?.dataset.path) return;
      navigateX(btn.dataset.path);
    });
  }
  const kind = routeKind();
  const on = kind === "notify" ? "notify" : kind === "msg" ? "msg" : kind === "bookmark" ? "bookmark" : kind === "explore" ? "explore" : "";
  strip.innerHTML = items.map((it) => {
    const n = it.path ? badgeCount(it.path) : 0;
    return `<button type="button" class="im-strip-item${it.key === on ? " active" : ""}" data-key="${it.key}" data-path="${it.path || ""}" title="${it.label}">
      ${getSkinIcon(it.icon)}
      ${n ? `<span class="im-strip-badge">${n > 99 ? "99+" : n}</span>` : ""}
    </button>`;
  }).join("");
  return strip;
}
