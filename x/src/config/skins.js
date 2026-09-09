// 皮肤定义：X.com 独立配置，自包含布局尺寸与各平台主题色
import { SKIN_KEY, ORG_NAME_KEY } from "./constants.js";

export const SKIN_ORDER = ["dingtalk", "feishu", "wecom"];

/* ---- X 宿主特有：导航项（点击走 X 原生路由）与飞书窄条 ---- */
const RAIL_MSG = [{ key: "home", label: "消息", icon: "msg", path: "/home" }];
const RAIL_X = [
  { key: "home", label: "消息", icon: "msg", path: "/home" },
  { key: "notify", label: "通知", icon: "bell", path: "/notifications" },
  { key: "msg", label: "私信", icon: "mail", path: "/messages" },
  { key: "bookmark", label: "收藏", icon: "bookmark", path: "/i/history" },
  { key: "explore", label: "探索", icon: "search", path: "/explore" },
];
const STRIP_X = [
  { key: "notify", label: "通知", icon: "bell", path: "/notifications" },
  { key: "msg", label: "私信", icon: "mail", path: "/messages" },
  { key: "bookmark", label: "收藏", icon: "bookmark", path: "/i/history" },
  { key: "explore", label: "探索", icon: "search", path: "/explore" },
];

/* ---- 各皮肤独立尺寸与样式属性 ---- */
const X_OVERRIDES = {
  dingtalk: {
    label: "钉钉",
    orgName: "x.com",
    letter: "钉",
    railWidth: 56,
    nav2Width: 0,
    stripWidth: 0,          // 钉钉 X 版无窄条
    listWidth: 300,
    titlebarHeight: 40,
    railMin: 64,
    railMax: 200,
    listMin: 200,
    listMax: 420,
    chatHeadHeight: 56,
    composerHeight: 64,
    compact: true,
    actions: "titlebar",
    accent: "#1A87FF",
    real: RAIL_X,
    strip: [],
    deco: [
      { key: "doc", label: "文档", icon: "doc" },
      { key: "aitable", label: "AI表格", icon: "grid" },
      { key: "aimic", label: "AI听记", icon: "mic" },
      { key: "work", label: "工作台", icon: "work", path: "/explore" },
      { key: "book", label: "通讯录", icon: "book" },
      { key: "meet", label: "会议", icon: "meet" },
      { key: "cal", label: "日历", icon: "cal" },
      { key: "todo", label: "待办", icon: "todo" },
    ],
    colors: {
      light: {
        accent: "#1A87FF",
        accentSoft: "#E8F3FF",
        railBg: "linear-gradient(180deg,#D5E0F8 0%,#DCE4F9 100%)",
        titlebarBg: "linear-gradient(90deg,#D5E0F8 0%,#DCE4F9 100%)",
        page: "#F5F7FB",
        card: "#FFFFFF",
        listBg: "#F5F7FB",
        chatBg: "#F5F7FB",
        line: "#E6E8EB",
        text: "#1A1D24",
        text2: "#4A4F5C",
        text3: "#8A8F99",
        hover: "#ECF0F7",
        active: "#E4EAF5",
        bubbleOther: "#FFFFFF",
        bubbleMe: "#D4E5FF",
        danger: "#FF4D4F",
        chipBg: "#E7EAF1",
      },
      dark: {
        accent: "#4AA0FF",
        accentSoft: "#1B2A4A",
        railBg: "#1C2433",
        titlebarBg: "#1C2433",
        page: "#12161D",
        card: "#1C2433",
        listBg: "#161C27",
        chatBg: "#12161D",
        line: "#2A3344",
        text: "#E8EDF5",
        text2: "#A8B3C4",
        text3: "#8B97A8",
        hover: "#222B3A",
        active: "#1E334F",
        bubbleOther: "#1C2433",
        bubbleMe: "#1A3A66",
        danger: "#FF4D4F",
        chipBg: "#2A3344",
      },
    },
  },
  feishu: {
    label: "飞书",
    orgName: "x.com",
    letter: "飞",
    railWidth: 230,
    nav2Width: 0,
    stripWidth: 48,
    listWidth: 360,
    titlebarHeight: 0,      // 飞书自带头部，无独立 titlebar
    railMin: 180,
    railMax: 480,
    listMin: 280,
    listMax: 640,
    chatHeadHeight: 94,
    composerHeight: 108,
    compact: false,
    actions: "rail-bottom",
    accent: "#3370FF",
    real: RAIL_MSG,
    strip: STRIP_X,          // stripWidth 取 im 默认 48
    deco: [
      { key: "calendar", label: "日历", icon: "cal" },
      { key: "worktable", label: "工作台", icon: "work", path: "/explore" },
      { key: "cloud", label: "云文档", icon: "doc" },
      { key: "wiki", label: "知识库", icon: "wiki" },
      { key: "task", label: "任务", icon: "todo" },
      { key: "contacts", label: "联系人", icon: "user" },
      { key: "project", label: "项目", icon: "grid" },
    ],
    colors: {
      light: {
        accent: "#3370FF",
        accentSoft: "#E8F0FF",
        railBg: "#D2E0F1",
        titlebarBg: "#D2E0F1",
        page: "#FFFFFF",
        card: "#FFFFFF",
        listBg: "#FFFFFF",
        chatBg: "#FFFFFF",
        line: "#E8E9EB",
        text: "#1F2329",
        text2: "#646A73",
        text3: "#8F959E",
        hover: "#F5F6F7",
        active: "#E4EDFB",
        bubbleOther: "#EEEFEE",
        bubbleMe: "#E8F0FF",
        danger: "#F54840",
        chipBg: "#F0F2F5",
      },
      dark: {
        accent: "#4C83FF",
        accentSoft: "#1B2A4A",
        railBg: "#1F2329",
        titlebarBg: "#1F2329",
        page: "#17181A",
        card: "#2B2F36",
        listBg: "#1B1F26",
        chatBg: "#17181A",
        line: "#3A3F47",
        text: "#E8EAED",
        text2: "#C0C4CC",
        text3: "#8B919A",
        hover: "#2B2F36",
        active: "#223A63",
        bubbleOther: "#2B2F36",
        bubbleMe: "#1B2A4A",
        danger: "#F54840",
        chipBg: "#2A3140",
      },
    },
  },
  wecom: {
    label: "企业微信",
    orgName: "企业微信",
    letter: "企",
    railWidth: 162,
    nav2Width: 0,
    stripWidth: 0,
    listWidth: 304,
    titlebarHeight: 0,
    railMin: 100,
    railMax: 260,
    listMin: 240,
    listMax: 480,
    chatHeadHeight: 80,
    composerHeight: 72,
    compact: false,
    actions: "rail-bottom",
    accent: "#4389F5",
    groups: true,
    real: RAIL_X,
    strip: [],
    deco: [
      { key: "smartdoc", label: "智能文档", icon: "file", dot: true },
      { key: "summary", label: "智能总结", icon: "spark" },
      { key: "work", label: "工作台", icon: "work", path: "/explore" },
      { key: "book", label: "通讯录", icon: "book" },
      { key: "disk", label: "微盘", icon: "disk" },
      { key: "advanced", label: "高级功能", icon: "apps" },
    ],
    colors: {
      light: {
        accent: "#4389F5",
        accentSoft: "#DCEBFF",
        railBg: "#D6E4F4",
        titlebarBg: "#D6E4F4",
        page: "#F5F7FA",
        card: "#FFFFFF",
        listBg: "#FFFFFF",
        chatBg: "#F5F7FA",
        line: "#D9E0E9",
        text: "#172033",
        text2: "#526175",
        text3: "#8B98AA",
        hover: "#E7EEF8",
        active: "#CFE4FF",
        bubbleOther: "#E4E7EC",
        bubbleMe: "#BDE4FF",
        danger: "#FA5151",
        chipBg: "#E7EEF8",
      },
      dark: {
        accent: "#338CFF",
        accentSoft: "#1A2F4A",
        railBg: "#111111",
        titlebarBg: "#111111",
        page: "#111111",
        card: "#1C1C1C",
        listBg: "#1C1C1C",
        chatBg: "#111111",
        line: "#2C2C2C",
        text: "#EAEAEA",
        text2: "#B0B0B0",
        text3: "#8A8A8A",
        hover: "#222222",
        active: "#1A2F4A",
        bubbleOther: "#2A2A2A",
        bubbleMe: "#163A5C",
        danger: "#FA5151",
        chipBg: "#2C2C2C",
      },
    },
  },
};

export const SKINS = X_OVERRIDES;

export const DEFAULT_SKIN_ID = "dingtalk";

export function currentSkinId() {
  try {
    const v = localStorage.getItem(SKIN_KEY);
    if (v && SKINS[v]) return v;
  } catch { /* ignore */ }
  return DEFAULT_SKIN_ID;
}

export function setSkinId(id) {
  if (!SKINS[id]) return;
  try { localStorage.setItem(SKIN_KEY, id); } catch { /* ignore */ }
}

export function getOrgName() {
  try { return localStorage.getItem(ORG_NAME_KEY) || SKINS[currentSkinId()].orgName; } catch {
    return SKINS[currentSkinId()].orgName;
  }
}

export function setOrgName(name) {
  try { localStorage.setItem(ORG_NAME_KEY, name); } catch { /* ignore */ }
}