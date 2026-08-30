// 企业微信皮肤：深色切换挂 rail 底部（同步沿用钉钉按钮文案）
import { toggleColorTheme } from "../theme/color-mode.js";
import { syncDarkModeToggleDingtalk } from "./dingtalk.js";

export function ensureDarkModeToggleWecom(rail) {
  if (!rail) return;
  const bottom = rail.querySelector(".im-rail-bottom");
  if (!bottom) return;
  let btn = bottom.querySelector(".im-dark-toggle");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "im-rail-item im-dark-toggle";
    bottom.insertBefore(btn, bottom.firstChild);
  }
  if (btn.dataset.bound !== "1") {
    btn.dataset.bound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleColorTheme();
    });
  }
  syncDarkModeToggleDingtalk();
}
