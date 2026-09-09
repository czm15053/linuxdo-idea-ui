import { FAVICON_ID, STYLE_ID } from "../config/constants.js";
import { currentSkinId, SKINS } from "../config/skins.js";

let observer = null;
let applying = false;

function svgHref(skin) {
  const s = SKINS[skin] || SKINS.dingtalk;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${s.accent}"/><text x="32" y="42" text-anchor="middle" font-size="28" fill="#fff" font-family="sans-serif">${s.letter}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

export function makeFavicon() {
  const head = document.head;
  if (!head || applying) return;
  applying = true;
  try {
    const href = svgHref(currentSkinId());
    for (const icon of head.querySelectorAll("link[rel='icon'], link[rel~='icon']")) {
      if (icon.id && icon.id !== FAVICON_ID) icon.removeAttribute("id");
      if (icon.getAttribute("href") !== href) icon.setAttribute("href", href);
    }
    let link = document.getElementById(FAVICON_ID);
    if (!link) {
      link = document.createElement("link");
      link.id = FAVICON_ID;
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.setAttribute("href", href);
      head.appendChild(link);
    } else if (link.getAttribute("href") !== href) {
      link.setAttribute("href", href);
    }
    if (!observer) {
      observer = new MutationObserver(() => {
        if (applying) return;
        if (document.getElementById(STYLE_ID)) makeFavicon();
      });
      observer.observe(head, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
    }
  } finally {
    applying = false;
  }
}

export function removeFavicon() {
  observer?.disconnect();
  observer = null;
  document.getElementById(FAVICON_ID)?.remove();
}
