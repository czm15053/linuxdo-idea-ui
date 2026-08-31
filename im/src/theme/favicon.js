import { FAVICON_ID } from "../config/constants.js";
import { FAVICON_URI } from "../config/skins.js";

let faviconObserver = null;
let faviconApplying = false;


export function makeFavicon() {
  const head = document.head;
  if (!head || faviconApplying) return;
  faviconApplying = true;
  try {
    const href = FAVICON_URI;
    // 覆盖所有常见 icon 链（含 shortcut / apple-touch），避免未选中标签仍用站点原图
    const icons = head.querySelectorAll(
      "link[rel='icon'], link[rel='shortcut icon'], link[rel~='icon'], link[rel='apple-touch-icon'], link[rel='apple-touch-icon-precomposed'], link[rel='mask-icon']"
    );
    for (const icon of icons) {
      if (icon.id && icon.id !== FAVICON_ID) icon.removeAttribute("id");
      if (icon.getAttribute("href") !== href) icon.setAttribute("href", href);
      if (icon.rel === "mask-icon") continue;
      if (icon.getAttribute("type") !== "image/x-icon") icon.setAttribute("type", "image/x-icon");
      if (!icon.getAttribute("sizes")) icon.setAttribute("sizes", "any");
    }

    let link = document.getElementById(FAVICON_ID);
    if (!link) {
      link = document.createElement("link");
      link.id = FAVICON_ID;
      link.rel = "icon";
      link.type = "image/x-icon";
      link.sizes = "any";
      link.setAttribute("href", href);
      head.appendChild(link);
    } else if (link.getAttribute("href") !== href) {
      link.setAttribute("href", href);
    }

    // 再补一条 shortcut icon，部分浏览器未聚焦标签时优先读它
    let shortcut = head.querySelector("link[data-im-shortcut='1']");
    if (!shortcut) {
      shortcut = document.createElement("link");
      shortcut.rel = "shortcut icon";
      shortcut.type = "image/x-icon";
      shortcut.dataset.imShortcut = "1";
      shortcut.setAttribute("href", href);
      head.insertBefore(shortcut, head.firstChild);
    } else if (shortcut.getAttribute("href") !== href) {
      shortcut.setAttribute("href", href);
    }

    if (!faviconObserver) {
      faviconObserver = new MutationObserver(() => {
        if (faviconApplying) return;
        // 站点 SPA / 主题脚本可能写回原 favicon
        makeFavicon();
      });
      faviconObserver.observe(head, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["href", "rel", "type", "sizes"]
      });
    }
  } finally {
    faviconApplying = false;
  }
}
