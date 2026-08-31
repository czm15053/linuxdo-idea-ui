import { escapeHtml } from "../utils/html.js";
import { listState } from "../state/list-state.js";
import { isMaskAvatar } from "../ui/shared/toggles.js";
import { avatarColor, disguiseTitleForTopic } from "../ui/shared/avatars.js";
import { PIN_AVATARS, CHAT_ICONS } from "../config/assets.js";
import { topicHref } from "../ui/list-panel.js";
import { skinHooks } from "./hooks.js";
import { chatState } from "../state/chat-state.js";
import { SKIN_ID } from "../config/skins.js";
import { loadCategories, categoryById } from "../bridge/categories.js";

/** 从标题取 3～5 字（按标题哈希稳定） */
export function avatarTextFromTitle(title) {
  const cleaned = [...String(title || "?").trim()].filter((c) => !/[\s#[\]【】《》*·.,，。!！?？\-_/\\]/.test(c));
  const src = cleaned.length ? cleaned : ["?"];
  let hash = 0;
  for (const c of src) hash = (hash * 31 + c.charCodeAt(0)) | 0;
  const n = Math.min(src.length, (Math.abs(hash) % 3) + 3); // 3 / 4 / 5
  const text = src.slice(0, n).join("");
  if (/^[a-zA-Z0-9]+$/.test(text)) return text.toUpperCase();
  return text;
}
/**
 * 按话题 id 稳定随机：约一半文字圆头像（实心/空心），四分之一 CHAT_ICONS，四分之一 PIN_AVATARS
 * @returns {{ html: string, bg: string, className: string, styleExtra: string }}
 */
export function disguiseAvatarForTopicFeishu(topic) {
  const tid = Math.abs(Number(topic.id) || 0);
  const seed = (tid * 2654435761) >>> 0;
  const mode = seed % 4;
  if (mode <= 1) {
    // 匿名模式头像字也走伪装工作标题，避免从真帖标题泄露
    const cover = disguiseTitleForTopic(topic);
    const text = avatarTextFromTitle(cover);
    const chars = [...text];
    const len = chars.length;
    const color = avatarColor(cover || String(tid));
    const hollow = ((seed >>> 3) % 2) === 1;
    // 四字排成两行，每行 2 个；其它字数原样
    const label = len === 4
      ? `${escapeHtml(chars[0] + chars[1])}<br>${escapeHtml(chars[2] + chars[3])}`
      : escapeHtml(text);
    return {
      html: `<span class="im-avatar-text" data-len="${len}">${label}</span>`,
      bg: hollow ? "#FFFFFF" : color,
      className: hollow ? "is-text-avatar is-hollow" : "is-text-avatar is-solid",
      styleExtra: hollow
        ? `color:${color};border:1.5px solid ${color};`
        : `color:#fff;border:1.5px solid ${color};`
    };
  }
  if (mode === 2) {
    return {
      html: `<img src="${CHAT_ICONS[(tid * 31) % CHAT_ICONS.length]}" alt="" loading="lazy">`,
      bg: "transparent",
      className: "",
      styleExtra: "border:none;"
    };
  }
  return {
    html: `<img src="${PIN_AVATARS[tid % PIN_AVATARS.length]}" alt="" loading="lazy">`,
    bg: "transparent",
    className: "",
    styleExtra: "border:none;"
  };
}

function renderPins() {
  const box = document.querySelector(".im-list-pins");
  if (!box) return;
  const pins = listState.topics.filter((t) => t.pinned).slice(0, 3);
  if (!pins.length) {
    box.style.display = "none";
    box.innerHTML = "";
    return;
  }
  box.style.display = "";
  const mask = isMaskAvatar();
  box.innerHTML = pins.map((t) => {
    let inner;
    let bg = "transparent";
    let cls = "";
    let styleExtra = "";
    if (mask) {
      const d = disguiseAvatarForTopicFeishu(t);
      inner = d.html;
      bg = d.bg;
      cls = d.className ? ` ${d.className}` : "";
      styleExtra = d.styleExtra || "";
    } else {
      const icon = PIN_AVATARS[Math.abs(Number(t.id) || 0) % PIN_AVATARS.length];
      inner = `<img src="${icon}" alt="" loading="lazy">`;
    }
    const pinTitle = mask ? disguiseTitleForTopic(t) : String(t.title || "");
    return `
      <a class="im-pin" href="${escapeHtml(topicHref(t))}" title="${escapeHtml(pinTitle)}">
        <span class="im-pin-avatar${cls}" style="background:${bg};${styleExtra}">${inner}</span>
        <span class="im-pin-name">${escapeHtml(pinTitle.slice(0, 6))}</span>
      </a>`;
  }).join("");
}

export function convAvatarFeishu(topic) {
  // 约四分之一会话用飞书彩色图标当头像（模拟应用 / 机器人会话，按话题 id 稳定取值）
  if (isMaskAvatar()) return null;
  const tid = Math.abs(Number(topic.id) || 0);
  if (tid % 4 !== 1 || !CHAT_ICONS.length) return null;
  return `<span class="im-conv-avatar"><img src="${CHAT_ICONS[(tid * 31) % CHAT_ICONS.length]}" alt="" loading="lazy"></span>`;
}

// 注册皮肤钩子（入口 import 本模块即生效）；本模块随入口全皮肤加载，
// 钩子仅在飞书皮肤注册，钉钉/企微走各自 fallback（无置顶区、钉钉伪装头像/单字聊天头像）
const isFeishuSkin = SKIN_ID === "feishu";
if (isFeishuSkin) {
  skinHooks.renderPins = renderPins;
  skinHooks.convAvatar = convAvatarFeishu;
  skinHooks.disguiseAvatar = disguiseAvatarForTopicFeishu;
}

/* ---- 飞书：聊场 tabs（分类 chip） ---- */
export function syncChatTabsFeishu(data, topicId) {
  const tabs = document.querySelector(".im-chat-tabs");
  if (tabs) tabs.style.display = "";
  loadCategories().then(() => {
    if (chatState.topicId !== topicId) return;
    const catTab = document.querySelector(".im-chat-tab-cat");
    if (!catTab) return;
    const cat = data.category_id ? categoryById(data.category_id) : null;
    if (cat) {
      catTab.style.display = "";
      catTab.setAttribute("href", `/c/${cat.slug}/${cat.id}`);
      catTab.innerHTML = `<span class="im-nav2-cat-dot" style="background:#${escapeHtml(cat.color || "8F959E")}"></span>${escapeHtml(cat.name)}`;
    } else {
      catTab.style.display = "none";
    }
  });
}
if (isFeishuSkin) {
  skinHooks.syncChatTabs = syncChatTabsFeishu;
}

/* ---- 飞书：聊天区伪装头像（气泡/聊天头用专有应用 icon，按作者名稳定取值） ---- */
export function msgAvatarFeishu(seedName) {
  if (!CHAT_ICONS.length) return null;
  let h = 0;
  for (const c of String(seedName || "?")) h = (h * 31 + c.charCodeAt(0)) | 0;
  return {
    html: `<img src="${CHAT_ICONS[Math.abs(h) % CHAT_ICONS.length]}" alt="" loading="lazy">`,
    bg: "transparent",
    className: "",
    styleExtra: "border:none;"
  };
}
if (isFeishuSkin) {
  skinHooks.msgAvatar = msgAvatarFeishu;
}
