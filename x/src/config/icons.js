// 导航与标签栏图标系统：为飞书、钉钉、企业微信分别提供官方 1:1 风格真实原装图标
import { ICONS as IM_ICONS } from "./base-icons.js";
import { currentSkinId } from "./skins.js";

const X_EXTRAS = {
  eyes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8" fill="currentColor" stroke="none"/></svg>',
  swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h11M4 7l3-3M4 7l3 3"/><path d="M20 17H9M20 17l-3-3M20 17l-3 3"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="6.5" width="12" height="11" rx="2"/><path d="m15.5 10 5-2.5v9L15.5 14"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m6 17 4-4 3 3 3-4 4 5"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h14M12 5l7 7-7 7"/></svg>',
  chevrons: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 6 5 12l6 6M19 6l-6 6 6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  repost: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l3 3-3 3"/><path d="M3 13V9a2 2 0 0 1 2-2h15"/><path d="M7 21l-3-3 3-3"/><path d="M21 11v4a2 2 0 0 1-2 2H4"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 6.5l9 5.5-9 5.5z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/></svg>',
  verified: '<svg class="im-verified" viewBox="0 0 24 24" fill="currentColor" aria-label="已认证"><path d="M12 2l2.4 1.8 2.6-.5.9 2.4 2.6.8-1 2.5 1.5 3-1.5 3 1 2.5-2.6.8-.9 2.4-2.6-.5L12 22l-2.4-1.8-2.6.5-.9-2.4-2.6-.8 1-2.5L3 12l1.5-3-1-2.5 2.6-.8.9-2.4 2.6.5z"/><path d="M9.5 12l1.8 1.8 3.4-3.6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sortDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5v11M4 11l4 5 4-5"/><path d="M16 19V8M12 13l4-5 4 5"/></svg>',
};

export const ICONS = { ...IM_ICONS, ...X_EXTRAS };
if (!ICONS.wiki) ICONS.wiki = ICONS.doc;
if (!("user" in ICONS)) ICONS.user = ICONS.users;
if (!ICONS.mic) ICONS.mic = ICONS.aimic;
if (!ICONS.video) ICONS.video = ICONS.cam;

/* ============================== 飞书官方原版图标 (Lark/Feishu) ============================== */
const FEISHU_ICONS = {
  // 飞书消息：经典双向圆角气泡
  msg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5C4 7.4 7.6 4 12 4s8 3.4 8 7.5c0 4.1-3.6 7.5-8 7.5-1.2 0-2.3-.3-3.4-.8L4 19.5l1.2-4.1C4.5 14.3 4 12.9 4 11.5Z"/></svg>`,
  // 飞书云文档：带折角的 Docs 蓝调风格文档
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h8.5L19 8v12a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V5A1.5 1.5 0 0 1 6 3.5Z"/><path d="M14 3.5V8h4.5"/><path d="M8.5 12.5h7M8.5 16.5h4.5"/></svg>`,
  // 飞书 Pin：45度斜角金属大头针图钉
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4.5l4.5 4.5-1.8 1.8-1.2-.5-3.5 3.5.5 2.5-1.5 1.5-3.5-3.5-3.5 3.5-1-1 3.5-3.5-3.5-3.5 1.5-1.5 2.5.5 3.5-3.5-.5-1.2L15 4.5Z"/><path d="M14 10l-4-4"/></svg>`,
  // 飞书通知：圆润铃铛
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.5h12l-1.2-2.5a6 6 0 0 1-.8-3V9a5 5 0 1 0-10 0v2c0 1.1-.3 2.1-.8 3L6 16.5Z"/><path d="M10 18.5a2 2 0 0 0 4 0"/></svg>`,
  // 飞书提及 @
  at: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M15.5 8.5v4.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.6 7"/></svg>`,
  // 飞书书签 / 收藏
  bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12a1 1 0 0 1 1 1v15.5l-7-4-7 4V5a1 1 0 0 1 1-1Z"/></svg>`,
  // 飞书工作台：4个大小圆点
  work: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="7" r="3.2"/><circle cx="17" cy="7" r="3.2"/><circle cx="7" cy="17" r="3.2"/><circle cx="17" cy="17" r="3.2"/></svg>`,
  // 飞书日历
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v3.5M16 3v3.5M3.5 10h17"/></svg>`,
  // 飞书任务
  todo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>`,
  // 飞书通讯录
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.8"/><path d="M4.5 19.5a7.5 7.5 0 0 1 15 0"/></svg>`,
  // 飞书知识库
  wiki: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>`,
};

/* ============================== 钉钉官方原版图标 (DingTalk) ============================== */
const DINGTALK_ICONS = {
  // 钉钉消息：方圆角气泡，左下带尖嘴
  msg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6A2.5 2.5 0 0 1 7 3.5h10A2.5 2.5 0 0 1 19.5 6v8a2.5 2.5 0 0 1-2.5 2.5H9.5L5 20v-4.5A2.5 2.5 0 0 1 4.5 14V6Z"/></svg>`,
  // 钉钉文档：折角带横线
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h7.5l5 5V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V5A1.5 1.5 0 0 1 6 3.5Z"/><path d="M13.5 3.5V8.5h5"/><path d="M8 13h8M8 16.5h5"/></svg>`,
  // 钉钉 DING / Pin：大头针与闪电结合体
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3.5M8 7.5a4.5 4.5 0 1 1 9 0c0 3.2-4.5 4.8-4.5 7.5"/><circle cx="12" cy="19.5" r="1.5" fill="currentColor"/></svg>`,
  // 钉钉通知
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.5h12l-1.2-2.2a6.5 6.5 0 0 1-.8-3.3V9a4 4 0 1 0-8 0v1.5c0 1.16-.28 2.3-.8 3.3L6 16.5Z"/><path d="M10 18.5a2 2 0 0 0 4 0"/></svg>`,
  // 钉钉提及 @
  at: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M15.2 8.8v4.4a2.4 2.4 0 0 0 4.8 0V12a8 8 0 1 0-3.4 6.6"/></svg>`,
  // 钉钉收藏
  bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z"/></svg>`,
  // 钉钉工作台：4个带圆角的小方块
  work: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>`,
  // 钉钉通讯录：名片夹
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8.5h6M9 12.5h4"/></svg>`,
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3.5v3M16 3.5v3M4 9.5h16"/></svg>`,
  todo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="4.5" width="15" height="15" rx="2"/><path d="M8 12l2.8 2.8 5.4-5.6"/></svg>`,
};

/* ============================== 企业微信官方原版图标 (WeCom 5.x 实心) ============================== */
const WECOM_ICONS = {
  // 企微消息：饱满实心双气泡
  msg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.8C6.8 3.8 2.6 7.4 2.6 11.8c0 2.5 1.4 4.8 3.5 6.2l-.8 3.3 3.9-1.7c.9.2 1.8.3 2.8.3 5.2 0 9.4-3.6 9.4-8.1s-4.2-8-9.4-8Z"/></svg>`,
  // 企微文档：实心折角白边文档
  doc: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 3h8.3L19.5 8.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20V4.5A1.5 1.5 0 0 1 5.5 3Z"/><path d="M13.8 3.5v5h5L13.8 3.5Z" fill="#FFFFFF" opacity=".4"/><path d="M7.5 12h7a1 1 0 1 1 0 2h-7a1 1 0 1 1 0-2Zm0 3.5h5a1 1 0 1 1 0 2h-5a1 1 0 1 1 0-2Z" fill="#FFFFFF" opacity=".6"/></svg>`,
  // 企微 Pin / 图钉
  pin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 4.5l3.5 3.5-1.5 1.5-1-.4-2.8 2.8.4 2-1.2 1.2-3-3-3 3-1-1 3-3-3-3 1.2-1.2 2 .4 2.8-2.8-.4-1L16 4.5Z"/><circle cx="7" cy="17" r="1.5"/></svg>`,
  // 企微通知：实心铃铛
  bell: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a6.2 6.2 0 0 0-6.2 6.2v2.9l-1.5 2.8c-.4.7.1 1.6 1 1.6h13.4c.9 0 1.4-.9 1-1.6l-1.5-2.8V9.2A6.2 6.2 0 0 0 12 3Z"/><path d="M9.7 18.6a2.4 2.4 0 0 0 4.6 0h-4.6Z"/></svg>`,
  // 企微提及 @
  at: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M15.2 8.8v4.4a2.4 2.4 0 0 0 4.8 0V12a8 8 0 1 0-3.4 6.6"/></svg>`,
  // 企微收藏
  bookmark: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3.5h10A1.2 1.2 0 0 1 18.2 4.7v14.8c0 .9-1 1.4-1.7.9L12 16.9l-4.5 3.5c-.7.5-1.7 0-1.7-.9V4.7A1.2 1.2 0 0 1 7 3.5Z"/></svg>`,
  // 企微工作台：实心公文包
  work: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.2 4.8c0-.8.6-1.4 1.4-1.4h2.8c.8 0 1.4.6 1.4 1.4V6.5h4.2A1.5 1.5 0 0 1 20.5 8V18a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 18V8A1.5 1.5 0 0 1 5 6.5h4.2V4.8ZM11 6.5h2V5.2h-2V6.5Z"/><rect x="8.5" y="11" width="7" height="2" rx="1" fill="#FFFFFF" opacity=".6"/></svg>`,
  // 企微通讯录：经典双人实心剪影
  book: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8.2" r="3.2"/><path d="M3.2 18.5c.4-3 2.8-5 5.8-5s5.4 2 5.8 5l.1.5H3.1l.1-.5Z"/><circle cx="16.8" cy="9" r="2.4"/><path d="M16.5 13.8c2.2.3 3.9 2 4.2 4.2l.1.7h-4.2l-.1-.7c-.2-1.7-1-3.2-2.2-4.1.5-.2 1-.2 1.5-.2h.7Z"/></svg>`,
  // 企微微盘
  disk: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.5L3.8 8v8l8.2 4.5 8.2-4.5V8L12 3.5ZM5.8 9l6.2 3.4L18.2 9 12 5.6 5.8 9Z"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 3h7.3L19 8.2V20a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M13.8 3.4V8.2h4.8L13.8 3.4Z" fill="#FFFFFF" opacity=".4"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l1.8 5.4L19 10.2l-5.2 1.8L12 17.5l-1.8-5.5L5 10.2l5.2-1.8L12 3Z"/></svg>`,
  apps: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="7" r="2.2"/><circle cx="7" cy="17" r="2.2"/><circle cx="17" cy="17" r="2.2"/></svg>`,
};

/**
 * 根据当前皮肤获取官方原版图标
 * @param {string} key 图标键名（msg/doc/pin/bell/at/bookmark/work/cal 等）
 * @param {string} [skinId] 可选显式指定皮肤 id（默认为当前皮肤）
 * @returns {string} SVG 图标字符串
 */
export function getSkinIcon(key, skinId = currentSkinId()) {
  if (skinId === "feishu" && FEISHU_ICONS[key]) {
    return FEISHU_ICONS[key];
  }
  if (skinId === "wecom" && (WECOM_ICONS[key] || ICONS[`${key}Fill`])) {
    return WECOM_ICONS[key] || ICONS[`${key}Fill`];
  }
  if (skinId === "dingtalk" && DINGTALK_ICONS[key]) {
    return DINGTALK_ICONS[key];
  }
  return ICONS[key] || ICONS.doc;
}

