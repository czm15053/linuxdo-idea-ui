// 聊天区水印：平铺斜排文字，文字/间距/透明度可调
import { WATERMARK_KEY } from "../config/constants.js";
import { ICONS } from "../config/icons.js";
import { escapeHtml } from "../utils/html.js";

const DEFAULT_CONFIG = {
  enabled: false,
  text: "linux.do · 内部资料",
  gap: 220,
  opacity: 0.08
};

let config = loadConfig();
let pop = null;

function clamp(value, min, max, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

export function normalizeWatermarkConfig(raw) {
  const merged = { ...DEFAULT_CONFIG, ...(raw || {}) };
  return {
    enabled: !!merged.enabled,
    text: String(merged.text || DEFAULT_CONFIG.text).slice(0, 40),
    gap: clamp(merged.gap, 120, 480, DEFAULT_CONFIG.gap),
    opacity: clamp(merged.opacity, 0.02, 0.4, DEFAULT_CONFIG.opacity)
  };
}

export function loadConfig() {
  try {
    return normalizeWatermarkConfig(JSON.parse(localStorage.getItem(WATERMARK_KEY) || "null"));
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig() {
  localStorage.setItem(WATERMARK_KEY, JSON.stringify(config));
  applyWatermark();
}

/** 单块水印转成 data URL：旋转 -30°，透明度走 fill-opacity，颜色取中性灰对深浅主题都可见 */
function tileUrl() {
  const size = config.gap;
  const text = config.text.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">`
    + `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#8A8F99" fill-opacity="${config.opacity}" transform="rotate(-30 ${size / 2} ${size / 2})">${text}</text>`
    + "</svg>";
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

export function applyWatermark() {
  const html = document.documentElement;
  html.classList.toggle("im-watermark-on", config.enabled);
  if (!config.enabled) return;
  html.style.setProperty("--im-wm-image", tileUrl());
  html.style.setProperty("--im-wm-size", `${config.gap}px ${config.gap}px`);
}

/* ---------------- 设置浮层 ---------------- */

function closePop() {
  if (!pop) return;
  pop.remove();
  pop = null;
  document.removeEventListener("click", onOutside, true);
  document.removeEventListener("keydown", onKey, true);
}
function onOutside(e) {
  if (pop && !pop.contains(e.target) && !e.target.closest?.(".im-watermark-btn")) closePop();
}
function onKey(e) {
  if (e.key === "Escape") closePop();
}

function openPop(anchor) {
  closePop();
  pop = document.createElement("div");
  pop.className = "im-wm-pop";
  pop.innerHTML = `
    <div class="im-wm-row">
      <span class="im-wm-label">水印</span>
      <label class="im-wm-switch">
        <input type="checkbox" data-wm-switch ${config.enabled ? "checked" : ""}>
        <span></span>
      </label>
    </div>
    <label class="im-wm-field">
      <span>文字</span>
      <input type="text" data-wm-text maxlength="40" value="${escapeHtml(config.text)}">
    </label>
    <label class="im-wm-field">
      <span>间距 <b data-wm-gap-val>${config.gap}</b>px</span>
      <input type="range" data-wm-gap min="120" max="480" step="10" value="${config.gap}">
    </label>
    <label class="im-wm-field">
      <span>透明度 <b data-wm-op-val>${Math.round(config.opacity * 100)}</b>%</span>
      <input type="range" data-wm-op min="2" max="40" step="1" value="${Math.round(config.opacity * 100)}">
    </label>`;
  document.body.appendChild(pop);
  const r = anchor.getBoundingClientRect();
  const w = pop.offsetWidth;
  pop.style.left = `${Math.max(8, Math.min(r.right - w, innerWidth - w - 8))}px`;
  pop.style.top = `${r.bottom + 6}px`;

  const switchEl = pop.querySelector("[data-wm-switch]");
  const textEl = pop.querySelector("[data-wm-text]");
  const gapEl = pop.querySelector("[data-wm-gap]");
  const opEl = pop.querySelector("[data-wm-op]");
  switchEl.addEventListener("change", () => {
    config.enabled = switchEl.checked;
    saveConfig();
    syncButton();
  });
  textEl.addEventListener("input", () => {
    config.text = textEl.value.slice(0, 40) || DEFAULT_CONFIG.text;
    saveConfig();
  });
  gapEl.addEventListener("input", () => {
    config.gap = Number(gapEl.value);
    pop.querySelector("[data-wm-gap-val]").textContent = config.gap;
    saveConfig();
  });
  opEl.addEventListener("input", () => {
    config.opacity = Number(opEl.value) / 100;
    pop.querySelector("[data-wm-op-val]").textContent = opEl.value;
    saveConfig();
  });
  setTimeout(() => {
    document.addEventListener("click", onOutside, true);
    document.addEventListener("keydown", onKey, true);
  });
}

/* ---------------- 头部按钮 ---------------- */

export function syncButton() {
  const btn = document.querySelector(".im-watermark-btn");
  if (!btn) return;
  btn.title = config.enabled ? "水印：开（点击调整）" : "水印：关（点击开启）";
  btn.setAttribute("aria-pressed", config.enabled ? "true" : "false");
  btn.classList.toggle("is-on", config.enabled);
}

export function ensureWatermarkButton(panel) {
  if (!panel) return;
  const actions = panel.querySelector(".im-chat-actions");
  if (!actions) return;
  let btn = actions.querySelector(".im-watermark-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "im-icon-btn im-watermark-btn";
    btn.innerHTML = ICONS.watermark;
    const spamBtn = actions.querySelector(".im-chat-spam-toggle");
    if (spamBtn) actions.insertBefore(btn, spamBtn);
    else actions.appendChild(btn);
  }
  if (btn.dataset.bound !== "1") {
    btn.dataset.bound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
      if (pop) {
        closePop();
        return;
      }
      openPop(btn);
    });
  }
  syncButton();
}
