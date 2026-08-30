// 钉钉皮肤：titlebar 上的深色切换按钮
import { ICONS } from "../config/icons.js";
import {
  getColorTheme, isDarkEffective, toggleColorTheme,
} from "../theme/color-mode.js";

export function syncDarkModeToggleDingtalk() {
  const btn = document.querySelector(".im-dark-toggle");
  if (!btn) return;
  const mode = getColorTheme();
  const dark = isDarkEffective();
  let label;
  if (mode === "auto") label = `主题：跟随系统(${dark ? "深" : "浅"})`;
  else label = `主题：${dark ? "深色" : "浅色"}`;
  btn.title = `${label}（点击切换）`;
  btn.setAttribute("aria-pressed", dark ? "true" : "false");
  btn.classList.toggle("is-on", dark);
  btn.innerHTML = dark ? ICONS.sun : ICONS.moon;
}
export function ensureDarkModeToggleDingtalk(bar) {
  if (!bar) return;
  const actions = bar.querySelector(".title-actions");
  if (!actions) return;
  let btn = actions.querySelector(".im-dark-toggle");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "t-btn im-dark-toggle";
    actions.insertBefore(btn, actions.firstChild);
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
