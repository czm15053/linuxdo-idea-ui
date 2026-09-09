import { currentSkinId, SKINS } from "../config/skins.js";
import { ROOT_CLASS, DARK_CLASS, LOCK_CLASS } from "../config/constants.js";
import { CSS_DD } from "./dingtalk.css.js";
import { CSS_FS } from "./feishu.css.js";
import { CSS_WECOM } from "./wecom.css.js";
import { CSS_CORE_EXTRA } from "./core-extra.css.js";
import { CSS_X_HOST } from "./x-host.css.js";

function interpolate(css, s) {
  return css
    .replace(/__ROOT_CLASS__/g, ROOT_CLASS)
    .replace(/__DARK_CLASS__/g, DARK_CLASS)
    .replace(/__LOCK_CLASS__/g, LOCK_CLASS)
    .replace(/__RAIL_WIDTH__/g, String(s.railWidth))
    .replace(/__NAV2_WIDTH__/g, "0")
    .replace(/__STRIP_WIDTH__/g, String(s.stripWidth || 0))
    .replace(/__LIST_WIDTH__/g, String(s.listWidth))
    .replace(/__TITLEBAR_HEIGHT__/g, String(s.titlebarHeight));
}

export function skinCss() {
  const id = currentSkinId();
  const s = SKINS[id];
  let css;
  if (id === "feishu") css = CSS_FS + "\n" + CSS_CORE_EXTRA;
  else if (id === "wecom") css = CSS_WECOM + "\n" + CSS_CORE_EXTRA;
  else css = CSS_DD + "\n" + CSS_CORE_EXTRA;
  return interpolate(css, s) + "\n" + CSS_X_HOST;
}
