import { SKIN_ID, RAIL_WIDTH, NAV2_WIDTH, STRIP_WIDTH, LIST_WIDTH, TITLEBAR_HEIGHT } from "../config/skins.js";
import { ROOT_CLASS, DARK_CLASS, LOCK_CLASS } from "../config/constants.js";
import { CSS_DD } from "./dingtalk.css.js";
import { CSS_FS } from "./feishu.css.js";
import { CSS_CORE_EXTRA } from "./core-extra.css.js";
import { CSS_WECOM } from "./wecom.css.js";
import { CSS_WECOM_BRIDGE } from "./wecom-bridge.css.js";
import { CSS_FS_BRIDGE } from "./feishu-bridge.css.js";

const CSS_FS_FULL = CSS_FS + "\n" + CSS_FS_BRIDGE + "\n" + CSS_CORE_EXTRA;

function interpolate(css) {
  return css
    .replace(/__ROOT_CLASS__/g, ROOT_CLASS)
    .replace(/__DARK_CLASS__/g, DARK_CLASS)
    .replace(/__LOCK_CLASS__/g, LOCK_CLASS)
    .replace(/__RAIL_WIDTH__/g, String(RAIL_WIDTH))
    .replace(/__NAV2_WIDTH__/g, String(NAV2_WIDTH))
    .replace(/__STRIP_WIDTH__/g, String(STRIP_WIDTH))
    .replace(/__LIST_WIDTH__/g, String(LIST_WIDTH))
    .replace(/__TITLEBAR_HEIGHT__/g, String(TITLEBAR_HEIGHT));
}

export function skinCss() {
  let css;
  if (SKIN_ID === "feishu") css = CSS_FS_FULL;
  else if (SKIN_ID === "wecom") css = CSS_WECOM + "\n" + CSS_WECOM_BRIDGE + "\n" + CSS_CORE_EXTRA;
  else css = CSS_DD + "\n" + CSS_CORE_EXTRA;
  return interpolate(css);
}

export { CSS_DD, CSS_FS, CSS_WECOM, CSS_CORE_EXTRA };
