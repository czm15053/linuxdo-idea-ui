// ==UserScript==
// @name         Linux DO · 钉钉 IM 外观
// @namespace    https://linux.do/
// @version      0.5.0
// @description  钉钉风格的 LinuxDo
// @author       czm15053
// @match        https://linux.do/*
// @icon         https://linux.do/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  /* ============================== 常量 ============================== */

  const STYLE_ID = "linuxdo-dingtalk-theme";
  const FAVICON_ID = "dingtalk-favicon";
  const ROOT_CLASS = "dingtalk-im-theme";
  const DARK_CLASS = "dingtalk-dark";
  const LOCK_CLASS = "dingtalk-locked"; // 仅三栏路由挂载：隐藏原生主内容
  const VIEW_KEY = "linuxdo-dingtalk-view"; // "im" | "native"
  const DARK_KEY = "linuxdo-dingtalk-dark"; // "1" = 深色
  const LAST_READ_KEY = "linuxdo-dingtalk-last-read";
  const LAST_READ_MAX_TOPICS = 200;

  const RAIL_WIDTH = 110; // 最左图标+文字横向导航（可拖拽调宽）
  const NAV2_WIDTH = 240; // 展开栏（原生侧栏原样搬入，默认收起）
  const STRIP_WIDTH = 0; // 钉钉布局无窄条
  const LIST_WIDTH = 250; // 会话列表
  const TITLEBAR_HEIGHT = 40; // 顶部蓝色 titlebar

  const AVATAR_COLORS = [
    "#1A87FF", "#2F88FF", "#F3A23A", "#8B6CFF",
    "#00C56C", "#FF9F0A", "#5B4BFF", "#EF4444"
  ];

  /* ============================== 内联 SVG 图标 ============================== */

  const ICONS = {
    msg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4.2 3.2A.8.8 0 0 1 4.5 18.6V6.5Z" stroke="currentColor" stroke-width="1.7"/></svg>`,
    doc: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 4.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 19V6A1.5 1.5 0 0 1 7 4.5Z" stroke="currentColor" stroke-width="1.7"/><path d="M14 4.5V9h4.5" stroke="currentColor" stroke-width="1.7"/></svg>`,
    work: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.7"/><rect x="13" y="4" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.7"/><rect x="4" y="13" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.7"/><rect x="13" y="13" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.7"/></svg>`,
    book: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M9 9h6M9 13h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    meet: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4.5 8.5A2.5 2.5 0 0 1 7 6h6.5A2.5 2.5 0 0 1 16 8.5v7A2.5 2.5 0 0 1 13.5 18H7A2.5 2.5 0 0 1 4.5 15.5v-7Z" stroke="currentColor" stroke-width="1.7"/><path d="M16 10.2l4-2.2v8l-4-2.2" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`,
    disk: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 8.5L12 4l8 4.5v7L12 20 4 15.5v-7Z" stroke="currentColor" stroke-width="1.7"/><path d="M12 20v-7.5M4 8.5l8 4 8-4" stroke="currentColor" stroke-width="1.7"/></svg>`,
    cal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4.5" y="5.5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 4v3M16 4v3M4.5 10h15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    todo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    ding: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4v3M8 8a4 4 0 1 1 8 0c0 3-4 4.5-4 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="18.5" r="1.3" fill="currentColor"/></svg>`,
    proj: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 8h14v10.5A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5V8Z" stroke="currentColor" stroke-width="1.7"/><path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" stroke="currentColor" stroke-width="1.7"/></svg>`,
    mail: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M5 8l7 5 7-5" stroke="currentColor" stroke-width="1.7"/></svg>`,
    apps: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="7" r="2.1" stroke="currentColor" stroke-width="1.7"/><circle cx="17" cy="7" r="2.1" stroke="currentColor" stroke-width="1.7"/><circle cx="7" cy="17" r="2.1" stroke="currentColor" stroke-width="1.7"/><circle cx="17" cy="17" r="2.1" stroke="currentColor" stroke-width="1.7"/></svg>`,
    build: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 19V9l5-4 5 4v10" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 19v-5h4v5" stroke="currentColor" stroke-width="1.7"/></svg>`,
    more: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/></svg>`,
    clock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    grid: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="5" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.7"/><rect x="13" y="5" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.7"/><rect x="5" y="13" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.7"/><rect x="13" y="13" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.7"/></svg>`,
    spark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 4.5h3.2l1 3.2-2 1.4a11 11 0 0 0 5.7 5.7l1.4-2 3.2 1V17a2 2 0 0 1-2.2 2A15 15 0 0 1 5 6.7 2 2 0 0 1 7 4.5Z" stroke="currentColor" stroke-width="1.6"/></svg>`,
    plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    mute: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10 8H7v8h3l5 3V5l-5 3Z" stroke="currentColor" stroke-width="1.6"/><path d="M18 9l3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    bell: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 16h12l-1.2-2.2a6.5 6.5 0 0 1-.8-3.3V9a4 4 0 1 0-8 0v1.5c0 1.16-.28 2.3-.8 3.3L6 16Z" stroke="currentColor" stroke-width="1.6"/><path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.6"/></svg>`,
    users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 18a4.5 4.5 0 0 1 9 0" stroke="currentColor" stroke-width="1.6"/><circle cx="16.5" cy="9.5" r="2.3" stroke="currentColor" stroke-width="1.6"/><path d="M15 18c.4-1.6 1.6-2.8 3.4-3.2" stroke="currentColor" stroke-width="1.6"/></svg>`,
    win: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M5 10h14" stroke="currentColor" stroke-width="1.6"/></svg>`,
    gear: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.4 6.4l1.4 1.4M16.2 16.2l1.4 1.4M17.6 6.4l-1.4 1.4M7.8 16.2l-1.4 1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    emoji: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 14.2c.9 1.3 2.1 2 3.5 2s2.6-.7 3.5-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>`,
    like: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 11V20H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h2Zm0 0 3.2-6.2A2 2 0 0 1 13 3.6V8h5.2a2 2 0 0 1 1.96 2.4l-1.2 6A2 2 0 0 1 17 18h-9" stroke="currentColor" stroke-width="1.6"/></svg>`,
    cut: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="17" r="2.2" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="17" r="2.2" stroke="currentColor" stroke-width="1.6"/><path d="M8.8 15.4L16 5M15.2 15.4L8 5" stroke="currentColor" stroke-width="1.6"/></svg>`,
    folder: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 8h6l2 2h8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" stroke="currentColor" stroke-width="1.6"/></svg>`,
    pic: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="10" r="1.4" stroke="currentColor" stroke-width="1.4"/><path d="M5 16l4.5-4 3 3 2-2L19 16" stroke="currentColor" stroke-width="1.6"/></svg>`,
    collect: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5l1.7 4.4H18l-3.5 2.7 1.3 4.4L12 14.6 8.2 16.5l1.3-4.4L6 9.4h4.3L12 5Z" stroke="currentColor" stroke-width="1.6"/></svg>`,
    file: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 4h7l4 4v12H7V4Z" stroke="currentColor" stroke-width="1.6"/><path d="M14 4v4h4" stroke="currentColor" stroke-width="1.6"/></svg>`,
    bolt: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 3L6 14h6l-1 7 7-11h-6l1-7Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    cam: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="7" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M15.5 10.5l5-2.5v8l-5-2.5" stroke="currentColor" stroke-width="1.6"/></svg>`,
    redpack: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M6 9h12" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9" r="1.6" fill="currentColor"/></svg>`,
    dots: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/></svg>`,
    expand: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 6h4v4M10 18H6v-4M18 6l-5 5M6 18l5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    refresh: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M20 4v5h-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    external: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 5h5v5M19 5l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 7H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" stroke="currentColor" stroke-width="1.6"/></svg>`,
    reply: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 14L4 9l5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 9h10a6 6 0 0 1 0 12h-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    menu: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    chevronUp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    compose: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 17.5V20h2.5L18 8.5 15.5 6 4 17.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13.8 7.7l2.5 2.5" stroke="currentColor" stroke-width="1.6"/></svg>`,
    filter: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h11M4 18h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    disguise: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="1.6"/><path d="M8 14c1.2 1.4 2.5 2 4 2s2.8-.6 4-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>`,
    aitable: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="4.5" width="16" height="15" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M4 9.5h16M9.6 9.5v10M15.4 9.5v10" stroke="currentColor" stroke-width="1.7"/></svg>`,
    aimic: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="9" y="3.5" width="6" height="11" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    monitor: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M9 20.5h6M12 17v3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    at: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M15.2 8.8v4.4a2.4 2.4 0 0 0 4.8 0V12a8 8 0 1 0-3.4 6.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    moon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 1 0 9.5 9.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    sun: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`
  };
  ICONS.chat = ICONS.msg;
  ICONS.list = ICONS.msg;
  ICONS.calendar = ICONS.cal;
  ICONS.worktable = ICONS.work;
  ICONS.cloud = ICONS.doc;
  ICONS.wiki = ICONS.doc;
  ICONS.task = ICONS.todo;
  ICONS.contacts = ICONS.book;
  ICONS.project = ICONS.proj;

  const FAVICON_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAHCElEQVRIDZVWW4xeVRVe+3b+29xiL9PpQDvY4SIgODGNpUGKF4i2JdX4QALy1CBPxBhf8EEfmog8kOCDMeFBaUCMD8SUag0iFo0GhWIcbMfWKTLMtLWdybTO5L+esy/Lb5/zzz9TymhcOdnZZ1/W9VtrL8HMzWZTa+2cM8ZgJCIllfPx11prtDKSKHiB3SzTRhMz+UBKt1OntPY+MDGuWG8Tk1hnpZAkcCOUy2VRr9eVUhAjpQwhCCEgABP8asFGi0sNf+oyTy6EmYZYaLEUYkOJPjrId2wUn9isN5XJs7AhXoGMwPFiwQesIEN0Oh3vfbHa21OCtAiTi/zjKffL92m2LslHwWuISfL2Adq3jQ9+XE9skhZiHLQU0LXQEhOoHi2AfwqVC8llJS41/ffets9NiUYmSRHs/XAKMJZrpXDwNvnEJ9VIn25mDlr2DkeGXQuEhHWQXNH0xkX3td+6qUVDGqx5ffYrfHDE0e2b3bN75O7rklbW9XPhdoEIQ2a0i0RJ06uz/uFfu8sdFRX/v8jzhkp4/j7aO1Zq2VUZUQAUhxIlJU7Muwd+ERZTBRQwe/KSENNVi/+HQA68sRxe3ku7tphOiH6NRhQQ0lIstN2jx91iKgWw4MPjd9Kh3QijZQfnAZhMApcwrvsJRYsd+djveaHtNWCaQ1EC6XCREeHpv4ZTV4zADg6S3Nqvv31X34mHaj/8vNw5jOSAVAnoEHC8/ofrpxb103+jBOBQCvgUaZpScNPLfPcRWrYxC8AgeDqwwx/ZXysinAV/fM4ePu1emePlloKU6Lro1w8jpj7t3/iyvGlIsFDRAqPl4TNhOY2qAcMINyL8h4v8r0bMalAi1RfGyj/7Yu3tB8tPfpomhr0SMAiQL85fPUpRz9RzZ5xRIlrQabeaNtx1VEwvawEf5LEBU3b0+B3+yV2mLzG5lNUh8/7EvD0y44+9H04vKZQJKLQ2VRCxGwf9mweoqoVIO+23FvxnfiUczF5lAgk0UrG7N/POYXnvqL5tQ6mG8FxNTet/dyH7wUn/ynkAb3UXaioOx/f63VuMVOxPXgFSkORXEdJu/5j80edqu4b1P66En083Xj/XOFdPM5S5FaoZtW+scmx/5bFbgTQ4uEtg5YM6vYS6AThpM9eK2msVI9zzEWrPby4IF+ie0TKNgiU3LLes76DoqmRV2xhvdfsGoEvq6Ci4J/JJA71XJySBDNY2sygZ7lr7oSLNNvW33syibpFEn5Gbq2agdBV3bLRd+MlZTrQ00BKIj6MQSnSCCh4WKAXJcGHu4Z4B0Zg+LV94Vyxl6Z4RlGixscLDFRqtyaGSgUK51Di8OJ1OLuqy7t3FGvhzBDOYM4cBw0YoXCoglB/EAGJA7eis2rnJ7tmqP1LWg0aWYOYa7kja758UZahfgDbei8pZQUMlFAABATQ+IBJF4JUzLcaeOqJK6uxy+PqQBiDyA1FwziVOnnknO9dMqqi7Bb4hOzIQCfP4gCxcpD82aPs1+Tw42MxpVVhZ0UszZr6dPTEhxwf136/49+r+qzdCafHnS+kL0zSYoFbFDFqRGuXDKzf3u+iXRr2Oivel19TUUv72FvyvGVNPFeWHSnShIfdtd4c/W8aRc/VssUNHZ9yzZ0p6peiCuwvi1iH38n0Oj4zWxiTk917nTy3hAb6G8cqCxlNPciklLfneUZxDJabr+xMbsqOzBsjJQd49bZke2OarMmQAFNoIPKdfuYG3ViBYxHxb58MWntiKES++Kx96zV1sOWTyN/7E86kxCo1EvIgzYDJa9Qeu947zlxiQ8NClSo/e4i3SF2/Mf/0g48yyudgmoPapSfuXy0nFcO8WJo754M12bEB62JgjNWIDRjx8g98z7FPEq4AwAciorXltjnNM4gomSNe7R/jVOf/Tsxr4iSv5MYyp53u22Ed2YBLbC7w0sVxHI9AcGHXoznS8zzkf0wQ+jR/KlsCHeTHGSUVRSdinJpGhsb70jqGu3DTgvzvhITVAUSk9eOHBiVUbTVIIgN7Uv/033zL/bBhwWY9gYk3ZJZsogDO+HpHannb0u2c+ZW8ZFJmPK7AArdgHO7uyFrN1f+id5I/zCB3ar3j0WkKz2CvPjimDZ4b9dybctmosc2ANjQulRavV+sB9dKIdzy/NyufPqvNtBFVg5VpBBd4R0tGKe2TcPTjGiYrVF1QI6Ippt9tr/zHHCbBLJM+35bEL/vVLZnpZNq1EqmOvkAQv9WuGT+4fDfePhJEa3IJXtNs0Fhp3BfSaX1hULHVVQIw4oFlqO55r8ExLnW+GutWo3kMJo6aOVe32AVWSjC4rttcr7XO8l1PXRUg0xBktBiYYi/a02Cv6DlyIZQCV3WgGHOJ9dM3Avu5YV/S10WhAEWdiN++L9h2TJEn+A/UW4FHnQZ2dAAAAAElFTkSuQmCC";


  /* ============================== 工具函数 ============================== */

  function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function debounce(fn, wait) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function avatarColor(name) {
    let hash = 0;
    const s = String(name || "?");
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  function avatarLetter(name) {
    const s = String(name || "?").trim();
    const ch = [...s][0] || "?";
    return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
  }

  /** 优先用户显示名（name），再退回 username */
  function userDisplayName(user, fallback) {
    const name = user && String(user.name || "").trim();
    if (name) return name;
    const uname = user && String(user.username || "").trim();
    if (uname) return uname;
    return String(fallback || "?").trim() || "?";
  }

  /* ---------- 会话伪装头像（圆角矩形单字） ---------- */
  const MASK_AVATAR_KEY = "linuxdo-dingtalk-mask-avatar"; // "1" = 开

  function isMaskAvatar() {
    try { return localStorage.getItem(MASK_AVATAR_KEY) === "1"; } catch { return false; }
  }

  function setMaskAvatar(on) {
    try { localStorage.setItem(MASK_AVATAR_KEY, on ? "1" : "0"); } catch { /* ignore */ }
    const panel = document.querySelector(".dingtalk-list-panel");
    ensureMaskAvatarToggle(panel);
    // 列表若还没数据，先别空转；有数据则立刻重绘头像
    if (listState.topics && listState.topics.length) {
      renderListRows();
    } else if (panel) {
      // 兜底：按当前路由拉一次列表再绘
      loadList(listState.apiPath || listApiForPath(location.pathname) || "/latest.json", true);
    }
  }


  const SURNAMES = [
    "赵","钱","孙","李","周","吴","郑","王","冯","陈","褚","卫","蒋","沈","韩","杨","朱","秦","尤","许",
    "何","吕","施","张","孔","曹","严","华","金","魏","陶","姜","戚","谢","邹","喻","柏","水","窦","章",
    "云","苏","潘","葛","奚","范","彭","郎","鲁","韦","昌","马","苗","凤","花","方","俞","任","袁","柳",
    "酆","鲍","史","唐","费","廉","岑","薛","雷","贺","倪","汤","滕","殷","罗","毕","郝","邬","安","常",
    "乐","于","时","傅","皮","卞","齐","康","伍","余","元","卜","顾","孟","平","黄","和","穆","萧","尹"
  ];

  function surnameForTopic(topic) {
    const idx = Math.abs(Number(topic.id) || 0) % SURNAMES.length;
    return SURNAMES[idx];
  }

  /**
   * 伪装头像：圆角矩形 + 百家姓单字
   * @returns {{ html: string, bg: string, className: string, styleExtra: string }}
   */
  function disguiseAvatarForTopic(topic) {
    const ch = surnameForTopic(topic);
    const color = avatarColor(ch + String(topic.id || 0));
    return {
      html: `<span class="dingtalk-avatar-text" data-len="1">${escapeHtml(ch)}</span>`,
      bg: color,
      className: "is-text-avatar is-solid",
      styleExtra: "color:#fff;"
    };
  }

  /** 隐私模式下随机一半话题使用九宫格姓氏头像 */
  function isGridMaskTopic(topic) {
    return isMaskAvatar() && (Math.abs(Number(topic.id) || 0) % 2 === 0);
  }

  const MASK_GRID_BLUES = [
    "#0A6FE0", "#1A87FF", "#2F88FF", "#3B92FF", "#4B7CFF",
    "#5B8FFF", "#6BA0FF", "#7CB1FF", "#8DC2FF"
  ];

  function disguiseGridAvatar(topic) {
    const cells = [];
    const seed = Math.abs(Number(topic.id) || 0);
    for (let i = 0; i < 9; i++) {
      const ch = SURNAMES[(seed + i * 17) % SURNAMES.length];
      const color = MASK_GRID_BLUES[(seed + i) % MASK_GRID_BLUES.length];
      cells.push(`<span style="background:${color}">${escapeHtml(ch)}</span>`);
    }
    return `<span class="dingtalk-conv-avatar is-grid-mask" style="background:transparent">${cells.join("")}</span>`;
  }



  /** 匿名模式下伪装成工作会话标题（按 topic.id 稳定取值） */
  const MASK_WORK_ORGS = ["产品", "研发", "设计", "运营", "市场", "销售", "财务", "人力", "法务", "客服", "数据", "增长"];
  const MASK_WORK_OBJS = ["需求", "方案", "进度", "指标", "预算", "版本", "活动", "合同", "报表", "问题", "排期", "复盘"];
  const MASK_WORK_ACTS = ["同步群", "评审会", "对齐会", "周会", "跟进群", "值班群", "项目组", "讨论组", "协作群", "拉通会"];
  const MASK_WORK_TITLES = [
    "产品需求评审", "本周工作同步", "技术方案讨论", "项目进度对齐", "线上问题排查",
    "发版 Checklist", "设计稿确认", "客户反馈跟进", "OKR 季度对齐", "数据报表复核",
    "运营活动排期", "合同条款评审", "预算审批沟通", "招聘面试安排", "安全合规检查",
    "接口联调纪要", "周会待办汇总", "版本回归测试", "供应商比价", "权限申请流程",
    "内容选题讨论", "监控告警复盘", "培训材料更新", "绩效面谈准备", "跨组协作排期",
    "需求优先级排序", "灰度发布观察", "客服工单升级", "品牌物料确认", "财报数据核对",
    "会议室预约冲突", "出差行程确认", "法务意见回复", "新员工 onboarding", "依赖升级评估",
    "压测结果同步", "埋点方案评审", "SLA 达标复盘", "渠道投放优化", "库存预警处理"
  ];

  function disguiseTitleForTopic(topic) {
    const tid = Math.abs(Number(topic && topic.id) || 0);
    // 打散相邻 id，避免列表里标题连片重复
    const seed = (tid * 2654435761) >>> 0;
    // 约一半用组合群名（更像飞书会话），一半用固定工作标题
    if ((seed % 2) === 0) {
      const org = MASK_WORK_ORGS[seed % MASK_WORK_ORGS.length];
      const obj = MASK_WORK_OBJS[(seed >>> 3) % MASK_WORK_OBJS.length];
      const act = MASK_WORK_ACTS[(seed >>> 7) % MASK_WORK_ACTS.length];
      const mode = (seed >>> 11) % 3;
      if (mode === 0) return `${org}${obj}${act}`;
      if (mode === 1) return `${org}·${obj}${act}`;
      return `【${org}】${obj}${act}`;
    }
    return MASK_WORK_TITLES[seed % MASK_WORK_TITLES.length];
  }

  function convDisplayTitle(topic) {
    return isMaskAvatar() ? disguiseTitleForTopic(topic) : String(topic.title || "");
  }

  function convDisplaySummary(topic, fallbackSummary) {
    if (isMaskAvatar()) return String(topic.title || fallbackSummary || "");
    return fallbackSummary;
  }

  function ensureMaskAvatarToggle(panel) {
    if (!panel) return;
    const actions = panel.querySelector(".dingtalk-list-actions");
    if (!actions) return;
    let btn = actions.querySelector(".dingtalk-mask-avatar-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dingtalk-icon-btn dingtalk-mask-avatar-toggle";
      btn.innerHTML = ICONS.disguise;
      actions.insertBefore(btn, actions.firstChild);
    }
    // 直接绑在按钮上，避免旧面板 linkBound 已占用导致点不到
    if (btn.dataset.bound !== "1") {
      btn.dataset.bound = "1";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
        setMaskAvatar(!isMaskAvatar());
      });
    }
    const on = isMaskAvatar();
    btn.title = on ? "伪装头像：开（点击恢复真实头像）" : "伪装头像：关（点击开启）";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.classList.toggle("is-on", on);
  }

  function fullAvatarUrl(template) {
    if (!template) return "";
    const url = template.replace("{size}", "96");
    return url.startsWith("http") ? url : location.origin + url;
  }

  function formatTime(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const now = Date.now();
    const diff = now - date.getTime();
    const minute = 60e3, hour = 3600e3, day = 86400e3;
    if (diff < minute) return "刚刚";
    if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
    if (diff < day && date.getDate() === new Date().getDate()) {
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    if (diff < 2 * day) return "昨天";
    if (diff < 365 * day) return `${date.getMonth() + 1}-${String(date.getDate()).padStart(2, "0")}`;
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  function formatClock(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function sanitizeCookedField(obj) {
    if (!obj || typeof obj !== "object") return obj;
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (key === "cooked" && typeof val === "string") {
        obj[key] = val
          .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
          .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
          .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
          .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "$1=$2#$2");
      } else if (val && typeof val === "object") {
        sanitizeCookedField(val);
      }
    }
    return obj;
  }

  async function api(path) {
    const resp = await fetch(path, {
      headers: { Accept: "application/json" },
      credentials: "same-origin"
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return sanitizeCookedField(await resp.json());
  }

  let cachedUsername = null;

  function normalizeUsername(name) {
    return (name || "").trim().replace(/^@/, "").toLowerCase();
  }

  function extractUsernameFromHref(href) {
    if (!href) return null;
    try {
      const path = href.startsWith("http") ? new URL(href, location.origin).pathname : href;
      const m = path.match(/^\/u\/([^/?#]+)/i);
      return m ? decodeURIComponent(m[1]) : null;
    } catch {
      return null;
    }
  }

  function readPreloadedCurrentUser() {
    try {
      const el = document.getElementById("data-preloaded");
      if (!el) return null;
      const raw = el.getAttribute("data-preloaded") || el.textContent;
      if (!raw) return null;
      const data = JSON.parse(raw);
      const candidates = [data.currentUser, data.current_user];
      for (const key of Object.keys(data || {})) {
        if (/current.?user/i.test(key)) candidates.push(data[key]);
      }
      for (const c of candidates) {
        if (!c) continue;
        const parsed = typeof c === "string" ? JSON.parse(c) : c;
        const name = parsed && (parsed.username || parsed.user?.username);
        if (name) return name;
      }
    } catch { /* ignore */ }
    return null;
  }

  function getCurrentUsername() {
    if (cachedUsername) return cachedUsername;
    try {
      const selectors = [
        "#current-user a[href*='/u/']",
        "#current-user button[data-user-card]",
        "#current-user [data-user-card]",
        "button.icon.btn-flat[data-user-card]",
        ".header-dropdown-toggle.current-user a[href*='/u/']",
        ".current-user a[href*='/u/']"
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const fromHref = extractUsernameFromHref(el.getAttribute("href") || "");
        if (fromHref) {
          cachedUsername = fromHref;
          return cachedUsername;
        }
        const card = el.getAttribute("data-user-card");
        if (card) {
          cachedUsername = card;
          return cachedUsername;
        }
      }

      const img = document.querySelector("#current-user img[alt], .current-user img[alt]");
      if (img && img.alt && !/avatar|头像/i.test(img.alt)) {
        cachedUsername = img.alt.trim();
        return cachedUsername;
      }

      const preloaded = readPreloadedCurrentUser();
      if (preloaded) {
        cachedUsername = preloaded;
        return cachedUsername;
      }

      // Ember 容器兜底
      try {
        const owner =
          window.Discourse?.__container__ ||
          document.querySelector(".ember-application")?.__ember_meta__?.owner;
        const user = owner?.lookup?.("service:current-user") ||
          window.Discourse?.User?.current?.();
        const name = user?.username || user?.get?.("username");
        if (name) {
          cachedUsername = name;
          return cachedUsername;
        }
      } catch { /* ignore */ }
    } catch { /* ignore */ }
    return null;
  }

  function isMyPost(post, myName) {
    if (!post) return false;
    if (post.yours === true || post.yours === "true") return true;
    if (post.mine === true || post.is_my_post === true) return true;
    const me = normalizeUsername(myName || getCurrentUsername());
    if (!me) return false;
    return normalizeUsername(post.username) === me;
  }

  function isTopicPath(pathname) {
    return /^\/t\//.test(pathname);
  }

  function topicIdFromPath(pathname) {
    const m = pathname.match(/^\/t\/(?:[\w-]+\/)?(\d+)/);
    return m ? Number(m[1]) : null;
  }

  function isHomePath(pathname) {
    return pathname === "/" ||
      /^\/(latest|new|unread|unseen|top|categories|hot|posted|read|bookmarks)\b/.test(pathname) ||
      /^\/c\//.test(pathname) || /^\/tag\//.test(pathname);
  }

  /** 中栏列表 JSON 端点按路由映射 */
  function listApiForPath(pathname) {
    if (pathname === "/" || pathname === "/latest") return "/latest.json";
    if (pathname === "/new") return "/new.json";
    if (pathname === "/unread" || pathname === "/unseen") return "/unseen.json";
    if (pathname === "/top") return "/top.json";
    if (pathname === "/hot") return "/hot.json";
    if (pathname === "/posted") return "/posted.json";
    if (pathname === "/read") return "/read.json";
    if (pathname === "/bookmarks") return "/bookmarks.json";
    // 类别页本身不是话题流；中栏仍拉 latest，避免 categories.json 无 topic_list
    if (pathname === "/categories") return "/latest.json";
    const c = pathname.match(/^\/c\/([\w-]+(?:\/[\w-]+)?)/);
    if (c) return `/c/${c[1]}.json`;
    const t = pathname.match(/^\/tag\/([\w-]+)/);
    if (t) return `/tag/${t[1]}.json`;
    return "/latest.json";
  }

  /* ============================== CSS ============================== */

  const RAW_CSS = String.raw`
    /* ---------- Token ---------- */
    .${ROOT_CLASS} {
      color-scheme: light !important;
      --dd-blue: #1A87FF;
      --dd-blue-hover: #0A6FE0;
      --dd-blue-soft: #E8F3FF;
      --dd-blue-chip: #D6EBFF;
      --dd-title: #1A87FF;
      --dd-accent: #1A87FF;
      --dd-accent-soft: #E8F3FF;
      --dd-nav2-bg: #FFFFFF;
      --dd-nav2-border: #E6E8EB;
      --dd-text: #1A1D24;
      --dd-text-2: #4A4F5C;
      --dd-text-3: #8A8F99;
      --dd-text-4: #B0B4BE;
      --dd-bg: #FFFFFF;
      --dd-chat-bg: #F5F7FB;
      --dd-hover: #ECF0F7;
      --dd-active: #E4EAF5;
      --dd-bubble-other: #FFFFFF;
      --dd-bubble-me: #D4E5FF;
      --dd-border: #E6E8EB;
      --dd-border-strong: #D5D8DE;
      --dd-danger: #FF4D4F;
      --dd-rail-bg: #F3F4F6;
      --dd-strip-bg: transparent;
      --dd-nav: ${RAIL_WIDTH}px;
      --dd-nav2w: 0px;
      --dd-strip: ${STRIP_WIDTH}px;
      --dd-list: ${LIST_WIDTH}px;
      --dd-header-h: ${TITLEBAR_HEIGHT}px;
      --dd-font: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      --radius: 8px;

      --primary: var(--dd-text);
      --primary-medium: var(--dd-text-2);
      --primary-low: var(--dd-text-3);
      --secondary: var(--dd-bg);
      --tertiary: var(--dd-accent);
      --header_background: #FFFFFF;
      --header_primary: var(--dd-text);
      --d-hover: var(--dd-hover);
    }

    /* 整站写死光明：覆盖系统/站点暗色偏好 */
    html.${ROOT_CLASS},
    html.${ROOT_CLASS} body {
      color-scheme: light !important;
    }

    /* ---------- 字体与基础 ---------- */
    .${ROOT_CLASS} body { font-family: var(--dd-font) !important; }

    /* 站点无全局 border-box：自绘面板统一盒模型，否则 padding 会加宽导致互相堆叠 */
    .dingtalk-rail, .dingtalk-rail *,
    .dingtalk-strip, .dingtalk-strip *,
    .dingtalk-list-panel, .dingtalk-list-panel *,
    .dingtalk-chat-panel, .dingtalk-chat-panel *,
    .dingtalk-mode-fab { box-sizing: border-box; }

    /* ---------- 顶栏视觉隐藏（保留 DOM，供 user-menu 挂载/点击） ---------- */
    .${ROOT_CLASS} .d-header-wrap,
    .${ROOT_CLASS} .d-header {
      position: fixed !important;
      left: 0 !important; top: 0 !important;
      width: 0 !important; height: 0 !important;
      max-width: 0 !important; max-height: 0 !important;
      overflow: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      margin: 0 !important; padding: 0 !important;
      border: none !important;
      clip: rect(0, 0, 0, 0) !important;
      z-index: -1 !important;
    }
    /* 允许脚本对用户按钮做 programmatic click */
    .${ROOT_CLASS} #current-user,
    .${ROOT_CLASS} #toggle-current-user,
    .${ROOT_CLASS} .header-dropdown-toggle.current-user {
      pointer-events: auto !important;
    }
    .${ROOT_CLASS} #main-outlet-wrapper {
      padding-top: var(--dd-header-h) !important;
      margin-left: calc(var(--dd-nav) + var(--dd-nav2w) + var(--dd-strip)) !important;
    }

    /* ---------- 展开栏：原生侧栏原样搬入（内容与文案不变，≡ 滑出） ---------- */
    .${ROOT_CLASS}.dingtalk-nav2-open { --dd-nav2w: ${NAV2_WIDTH}px; }
    html.${ROOT_CLASS} body .sidebar-wrapper {
      display: block !important;
      position: fixed;
      left: var(--dd-nav); top: 0; bottom: 0;
      width: ${NAV2_WIDTH}px !important;
      background-color: #FFFFFF !important;
      background-image: none !important;
      backdrop-filter: none !important;
      box-shadow: none !important;
      border-right: 1px solid var(--dd-border);
      z-index: 600;
      transform: translateX(-105%);
      visibility: hidden;
      transition: transform 0.18s ease, visibility 0.18s;
      /* 站点可能是深色方案：强制钉钉浅色调色板 */
      --primary: var(--dd-text);
      --primary-medium: var(--dd-text-2);
      --primary-low: var(--dd-text-3);
      --primary-low-mid: #BBBFC4;
      --primary-very-low: #F0F2F5;
      --primary-50: #F5F6F7;
      --primary-100: #EBEDEF;
      --primary-200: #E8E9EB;
      --primary-300: #DEE0E3;
      --secondary: #FFFFFF;
      --tertiary: var(--dd-accent);
      --quaternary: var(--dd-accent);
      --d-hover: var(--dd-hover);
      --d-sidebar-background: #FFFFFF;
      --d-sidebar-border-color: var(--dd-border);
      color: var(--dd-text);
    }
    /* 可能盖住白底的子层/伪层一律透明 */
    html.${ROOT_CLASS} body .sidebar-wrapper *,
    html.${ROOT_CLASS} body .sidebar-wrapper *::before,
    html.${ROOT_CLASS} body .sidebar-wrapper *::after {
      background-color: transparent !important;
      background-image: none !important;
      backdrop-filter: none !important;
    }
    .${ROOT_CLASS}.dingtalk-nav2-open .sidebar-wrapper {
      transform: none;
      visibility: visible;
    }
    /*
     * 锁定态把 #main-outlet-wrapper 设成 pointer-events:none，
     * 而 Discourse 的 .sidebar-wrapper 在其内部 → 展开后只能看不能点。
     * 侧栏自身及子元素显式恢复点击。
     */
    .${ROOT_CLASS} .sidebar-wrapper,
    .${ROOT_CLASS} .sidebar-wrapper * {
      pointer-events: auto !important;
    }
    html.${ROOT_CLASS} body .sidebar-wrapper .sidebar-container {
      height: 100%;
      border-right: none;
    }
    /* 侧栏内部元素统一到钉钉浅色观感 */
    .${ROOT_CLASS} .sidebar-wrapper .sidebar-section-header,
    .${ROOT_CLASS} .sidebar-wrapper .sidebar-section-header-text {
      color: var(--dd-text-3) !important;
    }
    .${ROOT_CLASS} .sidebar-wrapper .sidebar-section-link {
      color: var(--dd-text-2) !important;
      border-radius: 8px;
      transition: background-color 0.15s;
    }
    html.${ROOT_CLASS} body .sidebar-wrapper .sidebar-section-link:hover {
      background-color: var(--dd-hover) !important;
      color: var(--dd-text) !important;
    }
    html.${ROOT_CLASS} body .sidebar-wrapper .sidebar-section-link.active {
      background-color: var(--dd-active) !important;
      color: var(--dd-accent) !important;
    }
    .${ROOT_CLASS} .sidebar-wrapper .sidebar-section-content svg,
    .${ROOT_CLASS} .sidebar-wrapper .sidebar-section-link-prefix {
      color: var(--dd-text-3);
    }
    /* 底部黑色聊天抽屉与侧栏底栏（用户栏）会破坏三栏观感，隐藏（不限于 sidebar 内部） */
    .${ROOT_CLASS} .chat-drawer-container,
    .${ROOT_CLASS} #chat-drawer,
    .${ROOT_CLASS} .chat-drawer,
    .${ROOT_CLASS} [class*="sidebar-footer"],
    .${ROOT_CLASS} [id*="chat-drawer"] {
      display: none !important;
    }

    /* ---------- 窄图标条：假 icon（纯装饰） ---------- */
    .dingtalk-strip {
      display: none !important;
    }
    .dingtalk-strip-item {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: var(--dd-text-2);
      position: relative; flex-shrink: 0;
      cursor: default; user-select: none;
    }
    .dingtalk-strip-item svg { width: 17px; height: 17px; }
    .dingtalk-strip-badge {
      position: absolute; top: -4px; right: -10px;
      min-width: 14px; height: 14px; padding: 0 4px;
      background: var(--dd-danger); color: #fff;
      font-size: 9px; line-height: 14px; text-align: center;
      border-radius: 7px; font-weight: 500;
    }
    /* 左侧栏头像通知：仅在 html.dingtalk-notif-open 时显示，避免关不掉 */
    .${ROOT_CLASS} .user-menu.dingtalk-user-menu-float,
    .${ROOT_CLASS} .user-menu.revamped.menu-panel.dingtalk-user-menu-float,
    .${ROOT_CLASS} .user-menu.menu-panel.dingtalk-user-menu-float {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    .${ROOT_CLASS}.dingtalk-notif-open .user-menu.dingtalk-user-menu-float,
    .${ROOT_CLASS}.dingtalk-notif-open .user-menu.revamped.menu-panel.dingtalk-user-menu-float,
    .${ROOT_CLASS}.dingtalk-notif-open .user-menu.menu-panel.dingtalk-user-menu-float {
      display: block !important;
      position: fixed !important;
      left: 8px !important;
      top: calc(var(--dd-header-h) + 4px) !important;
      right: auto !important;
      bottom: auto !important;
      width: 320px !important;
      max-width: min(320px, calc(100vw - 20px)) !important;
      max-height: calc(100vh - 28px) !important;
      margin: 0 !important;
      z-index: 450 !important;
      box-shadow: 0 8px 28px rgba(31, 35, 41, 0.18) !important;
      border-radius: 8px !important;
      overflow: auto !important;
      pointer-events: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      background: #fff !important;
      color: var(--dd-text) !important;
      clip: auto !important;
    }

    /* ---------- 最左：钉钉文字导航栏（浅色渐变；仅「更多」可点，展开原生侧栏） ---------- */

    /* ---------- 顶部浅色 titlebar ---------- */
    .dingtalk-titlebar {
      position: fixed; left: 0; right: 0; top: 0;
      height: var(--dd-header-h);
      background: linear-gradient(90deg, #D5E0F8 0%, #DCE4F9 100%);
      color: var(--dd-text);
      display: flex; align-items: center;
      padding: 0 10px;
      z-index: 500;
      font-family: var(--dd-font);
      user-select: none;
      gap: 8px;
    }
    /* 顶栏左侧：当前用户头像（沿用 rail-avatar 类名，复用通知菜单逻辑） */
    .dingtalk-titlebar .me-chip { position: relative; width: 26px; height: 26px; flex-shrink: 0; }
    .dingtalk-titlebar .dingtalk-rail-avatar {
      width: 26px; height: 26px; border-radius: 6px; font-size: 11px;
    }
    .dingtalk-titlebar .dingtalk-rail-avatar-badge {
      top: -5px; right: -7px; min-width: 14px; height: 14px; padding: 0 3px;
      font-size: 9px; line-height: 14px; border-radius: 7px;
    }
    .dingtalk-titlebar .title-search {
      margin: 2px auto 0;
      width: min(420px, 36vw);
      height: 26px; border-radius: 13px;
      background: #EFF1FB;
      display: flex; align-items: center; gap: 6px;
      padding: 0 12px; color: var(--dd-text-3); font-size: 12px;
      position: relative;
    }
    .dingtalk-titlebar .title-search form {
      display: flex; align-items: center; gap: 6px; width: 100%; margin: 0;
    }
    .dingtalk-titlebar .title-search svg { opacity: .9; flex-shrink: 0; color: var(--dd-text-3); width: 14px; height: 14px; }
    .dingtalk-titlebar .title-search input {
      flex: 1; min-width: 0; border: 0; outline: none; background: transparent;
      color: var(--dd-text); font-size: 12px; font-family: var(--dd-font);
      text-align: center; line-height: 26px; padding: 0; height: 100%;
    }
    .dingtalk-titlebar .title-search input::placeholder { color: var(--dd-text-4); text-align: center; }
    .dingtalk-titlebar .title-actions { display: flex; align-items: center; gap: 6px; margin-left: 8px; flex-shrink: 0; }
    .dingtalk-titlebar .t-btn {
      width: 28px; height: 28px; border: 0; background: transparent; color: var(--dd-text-2);
      border-radius: 6px; cursor: pointer; display: grid; place-items: center; padding: 0;
      position: relative;
    }
    .dingtalk-titlebar .t-btn:hover { background: rgba(0,0,0,.05); }
    .dingtalk-titlebar .t-btn.dingtalk-dark-toggle.is-on {
      color: var(--dd-accent); background: var(--dd-accent-soft);
    }
    .dingtalk-titlebar .t-btn .dot {
      position: absolute; top: 4px; right: 4px; width: 6px; height: 6px;
      background: var(--dd-danger); border-radius: 50%;
    }
    .dingtalk-titlebar .t-btn.ai {
      width: 24px; height: 24px; border-radius: 50%; color: #fff;
      background: conic-gradient(from 210deg, #7C5CFF, #1A87FF, #00C56C, #FFB020, #7C5CFF);
    }
    .dingtalk-titlebar .t-btn.ai svg { width: 12px; height: 12px; }
    .dingtalk-titlebar .t-btn svg { width: 16px; height: 16px; }

    .dingtalk-rail {
      position: fixed; left: 0; top: var(--dd-header-h); bottom: 0;
      width: var(--dd-nav);
      background: linear-gradient(180deg, #D5E0F8 0%, #DCE4F9 100%);
      display: flex; flex-direction: column; align-items: center;
      padding: 6px 0 8px;
      z-index: 350;
      font-family: var(--dd-font);
      /* 不能 overflow:hidden：顶部组织 chip 的名称要溢出到中栏头部区 */
      overflow: visible;
    }
    .dingtalk-rail-head {
      width: 100%; flex-shrink: 0;
      padding: 2px 8px 8px;
      position: relative; z-index: 360;
    }
    .dingtalk-rail-org-chip {
      display: flex; align-items: center; gap: 6px;
      white-space: nowrap; cursor: pointer;
      border-radius: 8px; padding: 2px 4px; margin-left: -4px;
    }
    .dingtalk-rail-org-chip:hover { background: rgba(255,255,255,.6); }
    .dingtalk-rail-org-chip:hover .dingtalk-rail-org-name { color: var(--dd-blue); }
    .dingtalk-rail-org-logo img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
    .dingtalk-rail-org-logo {
      width: 24px; height: 24px; border-radius: 6px; flex-shrink: 0;
      background: #2F88FF; color: #fff;
      display: grid; place-items: center; font-size: 12px; font-weight: 700;
    }
    .dingtalk-rail-org-name { font-size: 13px; font-weight: 600; color: var(--dd-text); }
    .dingtalk-rail-org-chip > svg { width: 10px; height: 10px; color: var(--dd-text-3); flex-shrink: 0; }
    /* 头像基础样式（现挂在 titlebar 左侧，类名保留以复用通知逻辑） */
    .dingtalk-rail-avatar {
      width: 36px; height: 36px; border-radius: 8px;
      overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 700;
      background: #F3A23A;
      cursor: pointer;
    }
    .dingtalk-rail-avatar img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
    .dingtalk-rail-avatar.is-notif-pinned {
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--dd-accent);
    }
    .dingtalk-rail-avatar-badge {
      position: absolute; top: -4px; right: -6px;
      min-width: 16px; height: 16px; padding: 0 4px;
      background: var(--dd-danger); color: #fff;
      font-size: 10px; font-weight: 700; line-height: 16px; text-align: center;
      border-radius: 8px;
      box-shadow: 0 0 0 2px #fff;
    }
    .dingtalk-rail-search { display: none !important; }
    .dingtalk-rail-items {
      flex: 1; width: 100%; overflow: auto;
      display: flex; flex-direction: column; align-items: center;
      padding: 0 8px;
    }
    .dingtalk-rail-items::-webkit-scrollbar { width: 0; }
    .dingtalk-rail-item {
      width: 100%; border: 0; background: transparent; border-radius: 10px;
      display: flex; flex-direction: row; align-items: center; justify-content: flex-start;
      gap: 8px;
      padding: 9px 10px; color: var(--dd-text-2); cursor: pointer; position: relative;
      font-size: 16px; line-height: 1; text-align: left;
    }
    .dingtalk-rail-item svg { width: 20px; height: 20px; color: #5B616C; flex-shrink: 0; }
    .dingtalk-rail-item span { white-space: nowrap; }
    .dingtalk-rail-item:hover { background: rgba(255,255,255,.65); }
    .dingtalk-rail-item.active { color: var(--dd-blue); background: #FFFFFF; box-shadow: 0 1px 4px rgba(31,35,41,.06); }
    .dingtalk-rail-item.active svg { color: var(--dd-blue); }
    .dingtalk-rail-bottom { width: 100%; flex-shrink: 0; padding: 4px 8px 0; }
    .dingtalk-rail-more.is-on { color: var(--dd-blue); background: #FFFFFF; box-shadow: 0 1px 4px rgba(31,35,41,.06); }
    .dingtalk-rail-more.is-on svg { color: var(--dd-blue); }
    /* 右边缘拖拽柄：左右拉伸 rail */
    .dingtalk-rail-resizer {
      position: fixed; top: var(--dd-header-h); bottom: 0;
      left: calc(var(--dd-nav) - 3px); width: 6px;
      cursor: col-resize; z-index: 400;
      touch-action: none;
    }
    .dingtalk-rail-resizer:hover,
    .dingtalk-rail-resizer.dragging { background: rgba(26,135,255,.3); }
    /* 窄宽度 → 纯图标模式 */
    .dingtalk-rail-compact .dingtalk-rail-item { justify-content: center; padding: 8px 0; }
    .dingtalk-rail-compact .dingtalk-rail-item span { display: none; }
    .dingtalk-rail-compact .dingtalk-rail-head { padding: 2px 0 8px; display: flex; justify-content: center; }
    .dingtalk-rail-compact .dingtalk-rail-org-name,
    .dingtalk-rail-compact .dingtalk-rail-org-chip > svg { display: none; }
    .dingtalk-rail-compact .dingtalk-rail-badge { left: auto; right: 8px; }
    .dingtalk-rail-badge {
      position: absolute; top: 3px; left: 26px; right: auto;
      min-width: 16px; height: 16px; padding: 0 4px;
      background: var(--dd-danger); color: #fff; border-radius: 8px;
      font-size: 10px; font-weight: 700; line-height: 16px; text-align: center;
    }

    .dingtalk-nav2-cat-dot {
      width: 10px; height: 10px; border-radius: 3px;
      flex-shrink: 0; margin: 0 4px;
    }

    /* ---------- 聊天 header 头像与标题行 ---------- */
    .dingtalk-chat-head-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .dingtalk-chat-avatar {
      width: 28px; height: 28px; border-radius: 6px;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 600;
    }
    /* ---------- 聊天头：标题行（人数 + 分类 chip） ---------- */
    .dingtalk-chat-title-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .dingtalk-chat-count {
      display: inline-flex; align-items: center; gap: 2px;
      font-size: 12px; color: var(--dd-text-3); font-weight: 400; flex-shrink: 0;
    }
    .dingtalk-chat-count svg { width: 13px; height: 13px; }
    .dingtalk-chat-chips { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .dingtalk-chat-chip {
      display: inline-flex; align-items: center; gap: 3px;
      height: 18px; padding: 0 5px; border-radius: 4px;
      font-size: 11px; line-height: 1; white-space: nowrap;
      color: var(--dd-blue) !important; background: var(--dd-blue-soft);
      border: 1px solid #C9E2FF !important;
      text-decoration: none !important; cursor: pointer;
    }
    .dingtalk-chat-chip .dingtalk-nav2-cat-dot { width: 8px; height: 8px; border-radius: 2px; margin: 0; }

    /* ---------- 隐藏原生主内容（三栏路由） ---------- */
    .${ROOT_CLASS}.${LOCK_CLASS} body { overflow: hidden !important; }
    .${ROOT_CLASS}.${LOCK_CLASS} #main-outlet > * {
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
    }

    /* ---------- 中栏右边缘拖拽柄 ---------- */
    .dingtalk-list-resizer {
      position: fixed; top: var(--dd-header-h); bottom: 0;
      left: calc(var(--dd-nav) + var(--dd-nav2w) + var(--dd-list) - 3px); width: 6px;
      cursor: col-resize; z-index: 400; touch-action: none;
    }
    .dingtalk-list-resizer:hover,
    .dingtalk-list-resizer.dragging { background: rgba(26,135,255,.25); }
    .${ROOT_CLASS}.${LOCK_CLASS}.dingtalk-nav2-open .dingtalk-list-resizer { left: calc(var(--dd-nav) + var(--dd-nav2w) + var(--dd-list) - 3px); }

    /* ---------- 中栏：会话列表 ---------- */
    .dingtalk-list-panel {
      position: fixed;
      top: var(--dd-header-h);
      left: calc(var(--dd-nav) + var(--dd-nav2w) + var(--dd-strip));
      width: var(--dd-list);
      bottom: 0;
      background: #F5F7FB;
      border-right: 1px solid var(--dd-border);
      display: flex;
      flex-direction: column;
      z-index: 200;
      font-family: var(--dd-font);
    }
    .dingtalk-list-header {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 44px;
      padding: 0 10px;
      flex-shrink: 0;
      border-bottom: 1px solid transparent;
    }
    .dingtalk-list-title { display: none !important; }
    /* 消息/未读：分段控件胶囊 */
    .dingtalk-list-chips {
      display: inline-flex; align-items: center; gap: 2px;
      background: #E7EAF1; border-radius: 14px; padding: 2px;
      flex-shrink: 0;
    }
    .dingtalk-chip {
      height: 24px; padding: 0 12px; border: 0; border-radius: 12px;
      background: transparent; color: var(--dd-text-2); font-size: 13px; cursor: pointer;
      font-family: var(--dd-font);
      display: inline-flex; align-items: center; gap: 3px;
      white-space: nowrap; flex-shrink: 0;
    }
    .dingtalk-chip .n { font-weight: 600; }
    .dingtalk-chip.active { background: #FFFFFF; color: var(--dd-text); font-weight: 600; box-shadow: 0 1px 3px rgba(31,35,41,.12); }
    .dingtalk-list-actions { display: flex; gap: 6px; margin-left: auto; align-items: center; }
    .dingtalk-chip-icon {
      width: 26px; height: 26px; border-radius: 50%; background: #E7EAF1;
      border: 0; display: grid; place-items: center; color: var(--dd-text-2); cursor: pointer; padding: 0;
    }
    .dingtalk-chip-icon:hover { background: #DCE1EA; }
    .dingtalk-chip-icon.is-on, .dingtalk-list-nav-toggle[aria-expanded="true"] { color: var(--dd-accent); background: var(--dd-accent-soft); }
    .dingtalk-chip-icon svg { width: 14px; height: 14px; }
    .dingtalk-list-nav-toggle[aria-expanded="true"] { color: var(--dd-accent); background: var(--dd-accent-soft); }
    .dingtalk-list-nav {
      display: none !important;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px 12px 10px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--dd-border);
    }
    .dingtalk-list-nav.open,
    .dingtalk-list-panel.dingtalk-list-nav-open .dingtalk-list-nav {
      display: flex !important;
    }
    .dingtalk-list-nav a {
      display: inline-flex; align-items: center;
      height: 28px; padding: 0 10px;
      border-radius: 14px;
      font-size: 12px; line-height: 1;
      color: var(--dd-text-2) !important;
      text-decoration: none !important;
      border: 1px solid var(--dd-border) !important;
      background: var(--dd-bg);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .dingtalk-list-nav a:hover {
      background: var(--dd-hover);
      color: var(--dd-text) !important;
    }
    .dingtalk-list-nav a.active {
      background: var(--dd-accent-soft);
      color: var(--dd-accent) !important;
      border-color: #C2D4FF !important;
      font-weight: 500;
    }
    .dingtalk-icon-btn {
      width: 32px; height: 32px;
      border: none; border-radius: 8px;
      background: transparent; color: var(--dd-text-2);
      cursor: pointer; display: inline-flex;
      align-items: center; justify-content: center;
      transition: background 0.15s;
      padding: 0;
    }
    .dingtalk-icon-btn:hover { background: var(--dd-hover); }
    .dingtalk-icon-btn svg { width: 18px; height: 18px; }
    .dingtalk-list-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; }
    .dingtalk-list-body::-webkit-scrollbar { width: 6px; }
    .dingtalk-list-body::-webkit-scrollbar-thumb { background: var(--dd-border-strong); border-radius: 3px; }

    .dingtalk-conv {
      display: flex; gap: 8px;
      padding: 7px 10px;
      position: relative;
      text-decoration: none !important;
      cursor: pointer;
      transition: background 0.15s;
      border: none !important;
    }
    .dingtalk-conv:hover { background: var(--session-hover, var(--dd-hover)); }
    .dingtalk-conv.active { background: var(--session-active, var(--dd-active)); }
    .dingtalk-conv-avatar {
      width: 44px; height: 44px; border-radius: 8px;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 15px; font-weight: 600;
    }
    /* 伪装文字头像：保持圆形；实心 / 空心；字数 3～5 */
    .dingtalk-conv-avatar.is-text-avatar {
      box-sizing: border-box;
      padding: 3px;
      letter-spacing: 0;
      text-align: center;
    }
    .dingtalk-conv-avatar .dingtalk-avatar-text {
      line-height: 1; font-weight: 700;
      font-size: 13px;
    }
    .dingtalk-conv-avatar .dingtalk-avatar-text[data-len="1"] { font-size: 14px; }
    .dingtalk-conv-avatar.is-grid-mask {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 0;
      background: #C9E7FF;
      padding: 0;
      overflow: hidden;
    }
    .dingtalk-conv-avatar.is-grid-mask > span {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 100%;
      color: #fff; font-size: 7px; font-weight: 700; line-height: 1;
    }
    .dingtalk-mask-avatar-toggle.is-on {
      color: var(--dd-accent); background: var(--dd-accent-soft);
    }
    .dingtalk-conv-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .dingtalk-conv-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .dingtalk-conv-avatar.is-group {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 0;
      background: #C9E7FF;
      padding: 0;
      overflow: hidden;
    }
    .dingtalk-conv-avatar.is-group img,
    .dingtalk-conv-avatar.is-group span {
      width: 100%; height: 100%; object-fit: cover; background: #D4E5FF;
    }
    .dingtalk-conv-title {
      display: flex; align-items: center; gap: 6px;
      min-width: 0; flex: 1;
    }
    .dingtalk-conv-name {
      font-size: 14px; font-weight: 500; color: var(--dd-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      flex: 1; min-width: 0;
    }
    .dingtalk-conv-tag {
      display: inline-flex; align-items: center;
      height: 16px; padding: 0 5px; border-radius: 4px;
      font-size: 10px; line-height: 1; white-space: nowrap; flex-shrink: 0;
      color: #2F88FF; background: #E8F3FF;
      border: 1px solid #A8CFFF;
    }
    .dingtalk-conv-time { font-size: 12px; color: var(--dd-text-3); flex-shrink: 0; }
    .dingtalk-conv-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .dingtalk-conv-msg {
      font-size: 13px; color: var(--dd-text-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .dingtalk-conv-badge {
      position: absolute; right: 12px; bottom: 12px;
      min-width: 16px; height: 16px; padding: 0 4px;
      background: var(--dd-danger); color: #fff;
      font-size: 10px; font-weight: 700; line-height: 16px; text-align: center;
      border-radius: 8px; flex-shrink: 0;
    }
    .dingtalk-list-status {
      padding: 14px; text-align: center;
      font-size: 12px; color: var(--dd-text-3);
    }

    /* ---------- 右栏：聊天详情 ---------- */
    .dingtalk-chat-panel {
      position: fixed;
      top: var(--dd-header-h);
      left: calc(var(--dd-nav) + var(--dd-nav2w) + var(--dd-strip) + var(--dd-list));
      right: 0; bottom: 0;
      background: var(--dd-chat-bg);
      display: flex; flex-direction: column;
      z-index: 420;
      font-family: var(--dd-font);
    }
    .dingtalk-chat-header {
      height: 52px; flex-shrink: 0;
      background: #F5F7FB;
      border-bottom: 1px solid var(--dd-border);
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 0 20px; gap: 12px;
    }
    .dingtalk-chat-titles { min-width: 0; }
    .dingtalk-chat-title {
      font-size: 16px; font-weight: 600; color: var(--dd-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .dingtalk-chat-sub { font-size: 12px; color: var(--dd-text-3); margin-top: 1px; }
    .dingtalk-chat-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .dingtalk-chat-body {
      flex: 1; overflow-y: auto;
      padding: 20px 24px;
      display: flex; flex-direction: column; gap: 16px;
      overscroll-behavior: contain;
    }
    .dingtalk-chat-body::-webkit-scrollbar { width: 6px; }
    .dingtalk-chat-body::-webkit-scrollbar-thumb { background: var(--dd-border-strong); border-radius: 3px; }

    .dingtalk-msg { display: flex; gap: 10px; max-width: 78%; }
    .dingtalk-msg-other { align-self: flex-start; }
    .dingtalk-msg-me { align-self: flex-end; flex-direction: row-reverse; }
    .dingtalk-msg-avatar {
      width: 36px; height: 36px; border-radius: 8px;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 14px; font-weight: 600;
    }
    .dingtalk-msg-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .dingtalk-msg-content { min-width: 0; display: flex; flex-direction: column; position: relative; }
    .dingtalk-msg-me .dingtalk-msg-content { align-items: flex-end; }
    .dingtalk-msg-name { font-size: 12px; color: var(--dd-text-3); margin-bottom: 4px; }
    .dingtalk-msg-me .dingtalk-msg-name { display: none; }
    .dingtalk-msg-bubble {
      padding: 10px 14px;
      font-size: 14px; line-height: 1.6;
      color: var(--dd-text);
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .dingtalk-msg-other .dingtalk-msg-bubble {
      background: var(--dd-bubble-other);
      border-radius: 8px;
      box-shadow: 0 1px 0 rgba(0,0,0,.03);
    }
    .dingtalk-msg-me .dingtalk-msg-bubble {
      background: var(--dd-bubble-me);
      border-radius: 8px;
    }
    .dingtalk-msg-bubble p { margin: 0 0 8px; }
    .dingtalk-msg-bubble p:last-child { margin-bottom: 0; }
    .dingtalk-msg-bubble img { max-width: 100%; border-radius: 6px; }
    .dingtalk-msg-bubble pre {
      background: rgba(127,127,127,0.12);
      padding: 8px 10px; border-radius: 6px;
      overflow-x: auto; font-size: 13px;
    }
    .dingtalk-msg-bubble code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .dingtalk-msg-bubble blockquote {
      margin: 0 0 8px; padding: 4px 10px;
      border-left: 3px solid var(--dd-accent);
      background: rgba(51,112,255,0.06);
      border-radius: 0 6px 6px 0;
    }
    .dingtalk-msg-bubble a { color: var(--dd-accent); }
    .dingtalk-msg-meta {
      font-size: 11px; color: var(--dd-text-3);
      margin-top: 4px; display: flex; gap: 8px; align-items: center;
    }
    .dingtalk-msg-time-sep {
      align-self: center;
      font-size: 12px; color: var(--dd-text-3);
      padding: 2px 10px;
    }
    .dingtalk-msg-tools {
      position: absolute; top: -14px; right: 0; z-index: 5;
      display: flex; align-items: center; gap: 2px;
      background: var(--dd-bg);
      border: 1px solid var(--dd-border);
      border-radius: 8px;
      padding: 2px;
      box-shadow: 0 2px 8px rgba(31, 35, 41, 0.1);
      opacity: 0; visibility: hidden;
      transition: opacity 0.15s ease;
    }
    .dingtalk-msg:hover .dingtalk-msg-tools { opacity: 1; visibility: visible; }
    .dingtalk-msg-me .dingtalk-msg-tools { right: auto; left: 0; }
    .dingtalk-msg-tool {
      width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; cursor: pointer;
      border-radius: 6px; color: var(--dd-text-2);
      padding: 0;
    }
    .dingtalk-msg-tool svg { width: 15px; height: 15px; }
    .dingtalk-msg-tool:hover { background: var(--dd-hover); color: var(--dd-accent); }
    .dingtalk-msg-tool.liked { color: var(--dd-accent); }

    .dingtalk-chat-empty, .dingtalk-chat-error, .dingtalk-chat-loading {
      margin: auto;
      display: flex; flex-direction: column;
      align-items: center; gap: 10px;
      color: var(--dd-text-3); font-size: 14px;
      text-align: center; padding: 40px 20px;
    }
    .dingtalk-chat-empty svg, .dingtalk-chat-error svg {
      width: 56px; height: 56px; opacity: 0.5;
    }
    .dingtalk-empty-btn {
      margin-top: 6px;
      border: 1px solid var(--dd-border-strong);
      background: var(--dd-bg); color: var(--dd-text-2);
      border-radius: 6px; height: 32px; padding: 0 14px;
      font-size: 13px; cursor: pointer; font-family: var(--dd-font);
    }
    .dingtalk-empty-btn:hover { background: var(--dd-hover); }

    /* ---------- 钉钉 composer：白卡片，输入区 + 下方工具行 + 发送钮 ---------- */
    .dingtalk-composer {
      background: transparent; border-top: none;
      padding: 4px 12px 12px; flex-shrink: 0;
    }
    .dingtalk-composer-card {
      background: #FFFFFF;
      border: 1px solid var(--dd-border);
      border-radius: 12px;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .dingtalk-composer-card:hover {
      border-color: #C2D4FF;
      box-shadow: 0 2px 10px rgba(26,135,255,.08);
    }
    .dingtalk-composer-tools {
      display: flex; align-items: center; gap: 0; padding: 0 8px 6px;
    }
    .dingtalk-composer-tools .dingtalk-icon-btn { width: 28px; height: 28px; }
    .dingtalk-composer-tools .spacer { flex: 1; }
    .dingtalk-composer-tools .hint { font-size: 11px; color: var(--dd-text-4); margin-right: 8px; }
    .dingtalk-composer-tools .dingtalk-composer-status {
      font-size: 11px; color: var(--dd-text-4);
      max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-right: 8px;
    }
    .dingtalk-composer-tools .dingtalk-composer-status.error { color: var(--dd-danger); }
    .dingtalk-composer-tools .dingtalk-composer-status.busy { color: var(--dd-accent); }
    .dingtalk-composer-tools .dingtalk-composer-status.success { color: #00C56C; }
    .dingtalk-send-btn {
      height: 26px; padding: 0 14px; border: 0; border-radius: 5px;
      background: #C5C9D0; color: #fff; font-size: 12px; cursor: pointer;
      font-family: var(--dd-font);
      transition: background 0.15s;
    }
    .dingtalk-send-btn:not(:disabled) { background: var(--dd-accent); }
    .dingtalk-send-btn:disabled { cursor: not-allowed; }
    .dingtalk-chat-tools { margin-left: auto; display: flex; gap: 2px; }
    .dingtalk-chat-tools .dingtalk-icon-btn { width: 32px; height: 32px; position: relative; }
    .dingtalk-chat-tools .dot,
    .dingtalk-composer-tools .dot {
      position: absolute; top: 6px; right: 6px; width: 6px; height: 6px;
      background: var(--dd-danger); border-radius: 50%;
    }
    .dingtalk-composer-tools .dingtalk-icon-btn { position: relative; }

    /* ---------- 输入区：IM 直接输入 ---------- */
    .dingtalk-chat-compose {
      position: relative;
      z-index: 430;
      flex-shrink: 0;
      margin: 0;
      min-height: 64px;
      height: auto;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--dd-text);
      display: block;
      padding: 10px 14px 4px;
      font-size: 14px;
      font-family: var(--dd-font);
      transition: color 0.15s;
      pointer-events: auto !important;
      width: 100%;
      text-align: left;
      resize: none;
      outline: none;
      overflow-y: auto;
      max-height: 160px;
    }
    .dingtalk-chat-compose::placeholder { color: var(--dd-text-4); }
    .dingtalk-composer-target {
      display: none;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--dd-accent);
      padding: 6px 14px 0;
    }
    .dingtalk-composer-target.active { display: flex; }
    .dingtalk-composer-target button {
      background: transparent; border: none; color: inherit; cursor: pointer;
      padding: 0; font-size: 12px;
    }
    .dingtalk-composer-file { display: none; }
    .dingtalk-chat-panel[data-empty="1"] .dingtalk-composer { display: none; }

    /* 锁定态：原生主区不要抢走点击；关闭态 composer 直接隐藏 */
    .${ROOT_CLASS}.${LOCK_CLASS} #main-outlet-wrapper,
    .${ROOT_CLASS}.${LOCK_CLASS} #main-outlet {
      pointer-events: none !important;
    }
    .${ROOT_CLASS}.${LOCK_CLASS} #reply-control:not(.open):not(.fullscreen):not(.edit-title) {
      display: none !important;
      pointer-events: none !important;
      z-index: 0 !important;
    }
    .${ROOT_CLASS}.${LOCK_CLASS} #reply-control.open,
    .${ROOT_CLASS}.${LOCK_CLASS} #reply-control.edit-title,
    .${ROOT_CLASS}.${LOCK_CLASS} #reply-control.fullscreen {
      display: block !important;
      left: calc(var(--dd-nav) + var(--dd-nav2w) + var(--dd-strip) + var(--dd-list)) !important;
      right: 0 !important;
      width: auto !important;
      max-width: none !important;
      z-index: 600 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      border-radius: 12px 12px 0 0 !important;
      box-shadow: 0 -8px 28px rgba(0,0,0,0.12) !important;
    }
    .${ROOT_CLASS}.${LOCK_CLASS} #reply-control .reply-area {
      max-width: none !important;
      padding-left: 20px !important;
      padding-right: 20px !important;
    }

    /* ---------- native 模式悬浮恢复钮 ---------- */
    .dingtalk-mode-fab {
      position: fixed; right: 20px; bottom: 20px; z-index: 10000;
      width: 44px; height: 44px; border-radius: 50%;
      background: #1A87FF; color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(51,112,255,0.4);
    }
    .dingtalk-mode-fab svg { width: 22px; height: 22px; }

    /* ---------- splash ---------- */
    .${ROOT_CLASS} #d-splash { background: var(--dd-bg) !important; }
    .${ROOT_CLASS} #d-splash .preloader-image { display: none !important; }
    .${ROOT_CLASS} #d-splash .splash-logo-container {
      width: 96px !important; height: 96px !important;
      background-image: var(--dd-splash-logo) !important;
      background-size: contain !important;
      background-repeat: no-repeat !important;
      animation: none !important;
    }
    .${ROOT_CLASS} #d-splash .dots { background-color: #1A87FF !important; filter: none !important; }

    /* ---------- 窄屏降级 ---------- */
    @media (max-width: 1280px) {
      .${ROOT_CLASS} { --dd-list: 250px; }
    }
    @media (max-width: 1000px) {
      .${ROOT_CLASS} { --dd-nav2w: 0px !important; --dd-strip: 0px !important; }
      .dingtalk-strip { display: none; }
      .${ROOT_CLASS}.${LOCK_CLASS} .dingtalk-list-panel { width: calc(100% - var(--dd-nav)); left: var(--dd-nav); }
      .${ROOT_CLASS}.${LOCK_CLASS}.dingtalk-topic-open .dingtalk-list-panel { display: none; }
      .${ROOT_CLASS}.${LOCK_CLASS}:not(.dingtalk-topic-open) .dingtalk-chat-panel { display: none; }
      .${ROOT_CLASS}.${LOCK_CLASS} .dingtalk-chat-panel { left: var(--dd-nav); }
      .${ROOT_CLASS}.${LOCK_CLASS} #reply-control { left: calc(var(--dd-nav) + 12px) !important; right: 12px !important; }
    }

    /* ---------- 深色模式 token + 硬编码覆盖 ---------- */
    .${ROOT_CLASS}.${DARK_CLASS} {
      color-scheme: dark !important;
      --dd-blue: #3B92FF;
      --dd-blue-hover: #5BA3FF;
      --dd-blue-soft: #1A2F4D;
      --dd-blue-chip: #1E3558;
      --dd-title: #3B92FF;
      --dd-accent: #3B92FF;
      --dd-accent-soft: #1A2F4D;
      --dd-nav2-bg: #1B1E24;
      --dd-nav2-border: #2A2E36;
      --dd-text: #E8EAED;
      --dd-text-2: #B0B4BE;
      --dd-text-3: #8A8F99;
      --dd-text-4: #6B707A;
      --dd-bg: #14161B;
      --dd-chat-bg: #0F1115;
      --dd-hover: #22262E;
      --dd-active: #2A3140;
      --dd-bubble-other: #1E222A;
      --dd-bubble-me: #1A3358;
      --dd-border: #2A2E36;
      --dd-border-strong: #3A404C;
      --dd-danger: #FF6B6B;
      --dd-rail-bg: #171A22;
      --dd-strip-bg: transparent;
      --header_background: #14161B;
      --header_primary: var(--dd-text);
      --secondary: var(--dd-bg);
      --primary: var(--dd-text);
      --primary-medium: var(--dd-text-2);
      --primary-low: var(--dd-text-3);
      --d-hover: var(--dd-hover);
    }
    html.${ROOT_CLASS}.${DARK_CLASS},
    html.${ROOT_CLASS}.${DARK_CLASS} body {
      color-scheme: dark !important;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-titlebar {
      background: linear-gradient(90deg, #1A2233 0%, #1E2738 100%);
      color: var(--dd-text);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-titlebar .title-search {
      background: #252B38;
      color: var(--dd-text-3);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-titlebar .t-btn:hover {
      background: rgba(255,255,255,.08);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-titlebar .t-btn.dingtalk-dark-toggle.is-on {
      color: var(--dd-accent);
      background: var(--dd-accent-soft);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-rail {
      background: linear-gradient(180deg, #1A2233 0%, #1E2738 100%);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-rail-org-chip:hover {
      background: rgba(255,255,255,.08);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-rail-item svg {
      color: var(--dd-text-2);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-rail-item.active,
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-rail-more.is-on {
      background: #252B38;
      box-shadow: none;
      color: var(--dd-accent);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-chip.active {
      background: #252B38;
      color: var(--dd-text);
      box-shadow: none;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-list-header {
      background: var(--dd-bg);
      border-bottom-color: var(--dd-border);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-list-chips {
      background: #1E222A;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-chip-icon {
      background: #1E222A;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-chip-icon:hover {
      background: #2A3140;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-list-body,
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-list-panel {
      background: var(--dd-bg);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-chat-panel {
      background: var(--dd-chat-bg);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-chat-header {
      background: var(--dd-bg);
      border-bottom-color: var(--dd-border);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-composer,
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-composer-card {
      background: var(--dd-bg) !important;
      border-color: var(--dd-border) !important;
      border-top-color: var(--dd-border);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-composer-card:hover {
      border-color: #3B5F8A !important;
      box-shadow: 0 2px 10px rgba(0,0,0,.35);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-composer-box {
      background: #1E222A !important;
      border-color: var(--dd-border-strong);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-send-btn {
      background: #4A5160;
      color: #fff;
    }
    html.${ROOT_CLASS}.${DARK_CLASS} body .sidebar-wrapper {
      background-color: var(--dd-nav2-bg) !important;
      --primary: var(--dd-text);
      --primary-medium: var(--dd-text-2);
      --primary-low: var(--dd-text-3);
      --primary-low-mid: #6B707A;
      --primary-very-low: #22262E;
      --primary-50: #1B1E24;
      --primary-100: #22262E;
      --primary-200: #2A2E36;
      --primary-300: #3A404C;
      --secondary: var(--dd-nav2-bg);
      --tertiary: var(--dd-accent);
      --quaternary: var(--dd-accent);
      --d-hover: var(--dd-hover);
      --d-sidebar-background: var(--dd-nav2-bg);
      --d-sidebar-border-color: var(--dd-border);
      color: var(--dd-text);
    }
    .${ROOT_CLASS}.${DARK_CLASS}.dingtalk-notif-open .user-menu.dingtalk-user-menu-float,
    .${ROOT_CLASS}.${DARK_CLASS}.dingtalk-notif-open .user-menu.revamped.menu-panel.dingtalk-user-menu-float,
    .${ROOT_CLASS}.${DARK_CLASS}.dingtalk-notif-open .user-menu.menu-panel.dingtalk-user-menu-float {
      background: var(--dd-bg) !important;
      color: var(--dd-text) !important;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45) !important;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-topic-chip {
      color: var(--dd-accent);
      background: var(--dd-accent-soft);
      border-color: #2F4F7A;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-rail-avatar.is-notif-pinned,
    .${ROOT_CLASS}.${DARK_CLASS} .dingtalk-titlebar .dingtalk-rail-avatar.is-notif-pinned {
      box-shadow: 0 0 0 2px var(--dd-bg), 0 0 0 4px var(--dd-accent);
    }
  `;

  /* ============================== 基础设施 ============================== */

  function injectStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    // 始终刷新，避免旧版 CSS（挡住回复按钮）残留
    style.textContent = RAW_CSS;
  }

  let faviconObserver = null;
  let faviconApplying = false;

  function makeFavicon() {
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
      let shortcut = head.querySelector("link[data-dingtalk-shortcut='1']");
      if (!shortcut) {
        shortcut = document.createElement("link");
        shortcut.rel = "shortcut icon";
        shortcut.type = "image/x-icon";
        shortcut.dataset.dingtalkShortcut = "1";
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

  function restyleSplash() {
    const splash = document.getElementById("d-splash");
    if (!splash) return;
    document.documentElement.style.setProperty(
      "--dd-splash-logo",
      `url("${FAVICON_URI}")`
    );
  }

  function getViewMode() {
    try {
      return localStorage.getItem(VIEW_KEY) === "native" ? "native" : "im";
    } catch {
      return "im";
    }
  }

  function setViewMode(mode) {
    try {
      localStorage.setItem(VIEW_KEY, mode);
    } catch { /* ignore */ }
  }

  /** 与 IDEA 主题脚本互斥避让 */
  function otherThemeActive() {
    return !!document.getElementById("linuxdo-idea-theme") ||
      document.documentElement.classList.contains("idea-ide-theme") ||
      !!document.getElementById("linuxdo-feishu-theme") ||
      document.documentElement.classList.contains("feishu-im-theme");
  }

  /* ============================== 深色偏好 + 整站强制明暗 ============================== */

  let schemeObserver = null;
  let forcingScheme = false;

  function isDarkPreferred() {
    try { return localStorage.getItem(DARK_KEY) === "1"; } catch { return false; }
  }

  function setDarkPreferred(on) {
    try { localStorage.setItem(DARK_KEY, on ? "1" : "0"); } catch { /* ignore */ }
    applyColorMode();
    forceSiteScheme();
    syncDarkModeToggle();
  }

  function applyColorMode() {
    const dark = isDarkPreferred();
    document.documentElement.classList.toggle(DARK_CLASS, dark);
  }

  /** Discourse 用 link.light-scheme / link.dark-scheme 的 media 切换明暗 */
  function forceSiteScheme() {
    if (otherThemeActive()) return;

    const dark = isDarkPreferred();
    forcingScheme = true;
    try {
      const scheme = dark ? "dark" : "light";
      document.documentElement.style.colorScheme = scheme;
      if (document.body) document.body.style.colorScheme = scheme;

      const darkLinks = document.querySelectorAll("link.dark-scheme, link[class*='dark-scheme']");
      const lightLinks = document.querySelectorAll("link.light-scheme, link[class*='light-scheme']");

      if (dark) {
        for (const link of darkLinks) {
          link.disabled = false;
          if (link.media !== "all") link.media = "all";
        }
        for (const link of lightLinks) {
          if (link.media !== "none") link.media = "none";
          link.disabled = true;
        }
        document.documentElement.classList.add("dark", "dark-scheme", "scheme-dark");
        if (document.body) {
          document.body.classList.add("dark", "dark-scheme", "scheme-dark");
        }
      } else {
        for (const link of darkLinks) {
          if (link.media !== "none") link.media = "none";
          link.disabled = true;
        }
        for (const link of lightLinks) {
          link.disabled = false;
          if (link.media !== "all") link.media = "all";
        }
        document.documentElement.classList.remove("dark", "dark-scheme", "scheme-dark");
        if (document.body) {
          document.body.classList.remove("dark", "dark-scheme", "scheme-dark");
        }
      }
    } finally {
      forcingScheme = false;
    }

    ensureSchemeObserver();
  }

  function ensureSchemeObserver() {
    if (schemeObserver || typeof MutationObserver === "undefined") return;
    schemeObserver = new MutationObserver(() => {
      if (forcingScheme || otherThemeActive()) return;
      forceSiteScheme();
    });
    const start = () => {
      const root = document.head || document.documentElement;
      if (!root) return;
      schemeObserver.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["media", "disabled", "class", "href"]
      });
    };
    start();
  }

  function syncDarkModeToggle() {
    const btn = document.querySelector(".dingtalk-dark-toggle");
    if (!btn) return;
    const on = isDarkPreferred();
    btn.title = on ? "深色模式：开（点击切回浅色）" : "深色模式：关（点击开启）";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.classList.toggle("is-on", on);
    btn.innerHTML = on ? ICONS.sun : ICONS.moon;
  }

  function ensureDarkModeToggle(bar) {
    if (!bar) return;
    const actions = bar.querySelector(".title-actions");
    if (!actions) return;
    let btn = actions.querySelector(".dingtalk-dark-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "t-btn dingtalk-dark-toggle";
      actions.insertBefore(btn, actions.firstChild);
    }
    if (btn.dataset.bound !== "1") {
      btn.dataset.bound = "1";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDarkPreferred(!isDarkPreferred());
      });
    }
    syncDarkModeToggle();
  }

  /* ============================== 最左图标 rail ============================== */

  const NAV2_KEY = "linuxdo-dingtalk-nav2"; // "1" = 展开原生侧栏

  function isNav2Open() {
    try { return localStorage.getItem(NAV2_KEY) === "1"; } catch { return false; }
  }

  function setNav2Open(open) {
    try { localStorage.setItem(NAV2_KEY, open ? "1" : "0"); } catch { /* ignore */ }
    document.documentElement.classList.toggle("dingtalk-nav2-open", open);
    const moreBtn = document.querySelector(".dingtalk-rail-more");
    if (moreBtn) {
      moreBtn.classList.toggle("is-on", open);
      moreBtn.setAttribute("aria-expanded", open ? "true" : "false");
      moreBtn.title = open ? "收起话题导航" : "展开话题导航";
    }
  }

  /** 最左栏装饰项（复刻新版钉钉导航，均不可点击；仅「消息」带未读红点） */
  const RAIL_DECO_ITEMS = [
    { key: "doc", icon: "doc", label: "文档" },
    { key: "aitable", icon: "aitable", label: "AI表格" },
    { key: "aimic", icon: "aimic", label: "AI听记" },
    { key: "work", icon: "work", label: "工作台" },
    { key: "book", icon: "book", label: "通讯录" },
    { key: "meet", icon: "meet", label: "会议" },
    { key: "cal", icon: "cal", label: "日历" },
    { key: "todo", icon: "todo", label: "待办" },
    { key: "add", icon: "plus", label: "添加" }
  ];

  /* ---------- 组织 chip：点击改名 / 换图标 ---------- */
  const ORG_NAME_KEY = "linuxdo-dingtalk-org-name";
  const ORG_ICON_KEY = "linuxdo-dingtalk-org-icon";

  function getOrgName() {
    try { return localStorage.getItem(ORG_NAME_KEY) || "linux.do"; } catch { return "linux.do"; }
  }

  function getOrgIcon() {
    try { return localStorage.getItem(ORG_ICON_KEY) || "do"; } catch { return "do"; }
  }

  function renderOrgChip(rail) {
    const root = rail || document.querySelector(".dingtalk-rail");
    if (!root) return;
    const logo = root.querySelector(".dingtalk-rail-org-logo");
    const name = root.querySelector(".dingtalk-rail-org-name");
    if (!logo || !name) return;
    const icon = getOrgIcon();
    name.textContent = getOrgName();
    if (/^(https?:\/\/|data:image)/i.test(icon)) {
      logo.innerHTML = `<img src="${escapeHtml(icon)}" alt="">`;
    } else {
      logo.textContent = [...icon].slice(0, 2).join("") || "do";
    }
  }

  function bindOrgChip(rail) {
    const chip = rail?.querySelector(".dingtalk-rail-org-chip");
    if (!chip || chip.dataset.bound === "1") return;
    chip.dataset.bound = "1";
    const logo = chip.querySelector(".dingtalk-rail-org-logo");
    const name = chip.querySelector(".dingtalk-rail-org-name");
    if (logo) {
      logo.title = "点击更换图标（1~2 个字 / emoji / 图片 URL）";
      logo.addEventListener("click", (e) => {
        e.stopPropagation();
        const v = window.prompt("团队图标：1~2 个字、emoji 或图片 URL", getOrgIcon());
        if (v === null) return;
        try { localStorage.setItem(ORG_ICON_KEY, v.trim() || "do"); } catch { /* ignore */ }
        renderOrgChip(rail);
      });
    }
    if (name) {
      name.title = "点击修改团队名称";
      name.addEventListener("click", (e) => {
        e.stopPropagation();
        const v = window.prompt("团队名称", getOrgName());
        if (v === null) return;
        try { localStorage.setItem(ORG_NAME_KEY, v.trim() || "linux.do"); } catch { /* ignore */ }
        renderOrgChip(rail);
      });
    }
  }

  /* ---------- rail 右边缘拖拽调宽 ---------- */
  const RAIL_W_KEY = "linuxdo-dingtalk-rail-width";
  const RAIL_W_MIN = 64;
  const RAIL_W_MAX = 200;
  const RAIL_W_COMPACT = 80; // 小于此宽度收成纯图标

  function getRailWidth() {
    try {
      const w = parseInt(localStorage.getItem(RAIL_W_KEY), 10);
      if (w >= RAIL_W_MIN && w <= RAIL_W_MAX) return w;
    } catch { /* ignore */ }
    return RAIL_WIDTH;
  }

  function applyRailWidth(w) {
    const width = Math.min(RAIL_W_MAX, Math.max(RAIL_W_MIN, Math.round(w)));
    document.documentElement.style.setProperty("--dd-nav", `${width}px`);
    const rail = document.querySelector(".dingtalk-rail");
    if (rail) rail.classList.toggle("dingtalk-rail-compact", width < RAIL_W_COMPACT);
  }

  function ensureRailResizer() {
    let rz = document.querySelector(".dingtalk-rail-resizer");
    if (rz) return rz;
    rz = document.createElement("div");
    rz.className = "dingtalk-rail-resizer";
    rz.title = "拖动调整侧栏宽度（双击复位）";
    document.body.appendChild(rz);

    let dragging = false;
    let startX = 0;
    let startW = 0;
    rz.addEventListener("pointerdown", (e) => {
      dragging = true;
      startX = e.clientX;
      startW = parseInt(document.documentElement.style.getPropertyValue("--dd-nav"), 10) || getRailWidth();
      rz.classList.add("dragging");
      try { rz.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      e.preventDefault();
    });
    rz.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      applyRailWidth(startW + e.clientX - startX);
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      rz.classList.remove("dragging");
      const w = parseInt(document.documentElement.style.getPropertyValue("--dd-nav"), 10);
      if (w) {
        try { localStorage.setItem(RAIL_W_KEY, String(w)); } catch { /* ignore */ }
      }
    };
    rz.addEventListener("pointerup", endDrag);
    rz.addEventListener("pointercancel", endDrag);
    rz.addEventListener("dblclick", () => {
      applyRailWidth(RAIL_WIDTH);
      try { localStorage.removeItem(RAIL_W_KEY); } catch { /* ignore */ }
    });
    return rz;
  }

  /* ---------- 中栏会话列表右边缘拖拽调宽 ---------- */
  const LIST_W_KEY = "linuxdo-dingtalk-list-width";
  const LIST_W_MIN = 200;
  const LIST_W_MAX = 420;

  function getListWidth() {
    try {
      const w = parseInt(localStorage.getItem(LIST_W_KEY), 10);
      if (w >= LIST_W_MIN && w <= LIST_W_MAX) return w;
    } catch { /* ignore */ }
    return LIST_WIDTH;
  }

  function applyListWidth(w) {
    const width = Math.min(LIST_W_MAX, Math.max(LIST_W_MIN, Math.round(w)));
    document.documentElement.style.setProperty("--dd-list", `${width}px`);
  }

  function ensureListResizer() {
    let rz = document.querySelector(".dingtalk-list-resizer");
    if (rz) return rz;
    rz = document.createElement("div");
    rz.className = "dingtalk-list-resizer";
    rz.title = "拖动调整会话列表宽度（双击复位）";
    document.body.appendChild(rz);

    let dragging = false;
    let startX = 0;
    let startW = 0;
    rz.addEventListener("pointerdown", (e) => {
      dragging = true;
      startX = e.clientX;
      startW = parseInt(document.documentElement.style.getPropertyValue("--dd-list"), 10) || getListWidth();
      rz.classList.add("dragging");
      try { rz.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      e.preventDefault();
    });
    rz.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      applyListWidth(startW + e.clientX - startX);
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      rz.classList.remove("dragging");
      const w = parseInt(document.documentElement.style.getPropertyValue("--dd-list"), 10);
      if (w) {
        try { localStorage.setItem(LIST_W_KEY, String(w)); } catch { /* ignore */ }
      }
    };
    rz.addEventListener("pointerup", endDrag);
    rz.addEventListener("pointercancel", endDrag);
    rz.addEventListener("dblclick", () => {
      applyListWidth(LIST_WIDTH);
      try { localStorage.removeItem(LIST_W_KEY); } catch { /* ignore */ }
    });
    return rz;
  }

  function bindRailSearch(rail) {
    if (!rail) return;
    let wrap = rail.querySelector(".dingtalk-rail-search");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "dingtalk-rail-search";
      const head = rail.querySelector(".dingtalk-rail-head");
      if (head && head.nextSibling) rail.insertBefore(wrap, head.nextSibling);
      else rail.prepend(wrap);
    }
    // 旧版装饰块 / 缺 input 时升级为可输入搜索
    if (!wrap.querySelector("input")) {
      wrap.innerHTML = `
        <form action="/search" method="get" role="search">
          ${ICONS.search}
          <input type="search" name="q" placeholder="搜索" autocomplete="off" enterkeyhint="search" aria-label="搜索">
        </form>`;
      delete rail.dataset.searchBound;
    }
    if (rail.dataset.searchBound === "1") return;
    const form = wrap.querySelector("form");
    const input = wrap.querySelector("input");
    if (!form || !input) return;
    rail.dataset.searchBound = "1";

    input.addEventListener("input", () => {
      syncSearchToNative(input.value);
    });
    input.addEventListener("focus", () => {
      syncSearchToNative(input.value);
      const native = getNativeSearchInput();
      if (native && native !== input) {
        try { native.dispatchEvent(new FocusEvent("focus", { bubbles: true })); } catch { /* ignore */ }
      }
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      submitNativeSearch(input.value);
    });
  }


  /* ============================== 顶部蓝色 titlebar ============================== */

  function ensureTitlebar() {
    let bar = document.querySelector(".dingtalk-titlebar");
    if (bar) {
      bindTitlebarSearch(bar);
      bindRailAvatarNotif(bar);
      ensureDarkModeToggle(bar);
      return bar;
    }
    bar = document.createElement("header");
    bar.className = "dingtalk-titlebar";
    bar.innerHTML = `
      <div class="me-chip">
        <div class="dingtalk-rail-avatar"></div>
        <span class="dingtalk-rail-avatar-badge" style="display:none"></span>
      </div>
      <div class="title-search">
        <form action="/search" method="get" role="search">
          ${ICONS.search}
          <input type="search" name="q" placeholder="搜索或提问 (⌘F)" autocomplete="off" enterkeyhint="search" aria-label="搜索">
        </form>
      </div>
      <div class="title-actions">
        <button type="button" class="t-btn dingtalk-dark-toggle" title="深色模式：关（点击开启）" aria-pressed="false">${ICONS.moon}</button>
        <button type="button" class="t-btn" title="投屏" aria-hidden="true"><span class="dot"></span>${ICONS.monitor}</button>
        <button type="button" class="t-btn" title="创建" aria-hidden="true">${ICONS.plus}</button>
      </div>`;
    document.body.appendChild(bar);
    bindTitlebarSearch(bar);
    bindRailAvatarNotif(bar);
    ensureDarkModeToggle(bar);
    return bar;
  }

  function bindTitlebarSearch(bar) {
    if (!bar || bar.dataset.searchBound === "1") return;
    const form = bar.querySelector("form");
    const input = bar.querySelector("input");
    if (!form || !input) return;
    bar.dataset.searchBound = "1";
    input.addEventListener("input", () => syncSearchToNative(input.value));
    input.addEventListener("focus", () => {
      syncSearchToNative(input.value);
      const native = getNativeSearchInput();
      if (native && native !== input) {
        try { native.dispatchEvent(new FocusEvent("focus", { bubbles: true })); } catch { /* ignore */ }
      }
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      submitNativeSearch(input.value);
    });
  }

  function ensureRail() {
    let rail = document.querySelector(".dingtalk-rail");
    // 旧结构（头像 + ☰ 展开钮）重建为新版导航
    if (rail && !rail.querySelector(".dingtalk-rail-org-chip")) {
      rail.remove();
      rail = null;
    }
    if (rail) {
      syncRail();
      return rail;
    }
    rail = document.createElement("nav");
    rail.className = "dingtalk-rail";
    rail.setAttribute("aria-label", "钉钉风导航");

    const head = document.createElement("div");
    head.className = "dingtalk-rail-head";
    head.innerHTML =
      `<div class="dingtalk-rail-org-chip">` +
      `<span class="dingtalk-rail-org-logo">do</span>` +
      `<span class="dingtalk-rail-org-name">linux.do</span>` +
      `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>` +
      `</div>`;
    rail.appendChild(head);

    const items = document.createElement("div");
    items.className = "dingtalk-rail-items";
    items.innerHTML =
      `<button type="button" class="dingtalk-rail-item active" data-rail-key="chat">${ICONS.msg}<span>消息</span>` +
      `<span class="dingtalk-rail-badge" style="display:none"></span></button>` +
      RAIL_DECO_ITEMS.map((item) =>
        `<button type="button" class="dingtalk-rail-item" data-rail-key="${item.key}">${ICONS[item.icon]}<span>${item.label}</span></button>`
      ).join("");
    rail.appendChild(items);

    // 底部「更多」：展开 / 收起话题导航（原生侧栏）
    const bottom = document.createElement("div");
    bottom.className = "dingtalk-rail-bottom";
    const more = document.createElement("button");
    more.type = "button";
    more.className = "dingtalk-rail-item dingtalk-rail-more";
    more.dataset.railKey = "more";
    more.title = "展开话题导航";
    more.setAttribute("aria-expanded", "false");
    more.innerHTML = `${ICONS.more}<span>更多</span>`;
    more.addEventListener("click", () => setNav2Open(!isNav2Open()));
    bottom.appendChild(more);
    rail.appendChild(bottom);

    document.body.appendChild(rail);
    renderOrgChip(rail);
    bindOrgChip(rail);
    setNav2Open(isNav2Open()); // 同步「更多」高亮态
    syncRail();
    return rail;
  }

  /** 读取 Discourse 未读通知数（与顶栏用户菜单角标同源） */
  function getUnreadNotificationCount() {
    try {
      const owner = getEmberOwner();
      const user =
        safeLookup(owner, "service:current-user") ||
        window.Discourse?.User?.current?.() ||
        null;
      if (user) {
        const pick = (key) => {
          try {
            const v = user.get?.(key);
            if (v != null && v !== "") return Number(v);
          } catch { /* ignore */ }
          const direct = user[key];
          return direct == null || direct === "" ? null : Number(direct);
        };
        const all = pick("all_unread_notifications_count");
        if (all != null && !Number.isNaN(all)) return Math.max(0, all);
        const unread = pick("unread_notifications");
        const high = pick("unread_high_priority_notifications");
        const pm = pick("new_personal_messages_notifications_count");
        const sum = (unread || 0) + (high || 0) + (pm || 0);
        if (sum > 0) return sum;
        if (unread != null && !Number.isNaN(unread)) return Math.max(0, unread);
      }
    } catch { /* ignore */ }

    const domBadge = document.querySelector(
      "#current-user .badge-notification, " +
      ".header-dropdown-toggle.current-user .badge-notification, " +
      "#toggle-current-user .badge-notification, " +
      ".current-user .badge-notification"
    );
    if (domBadge) {
      const text = (domBadge.textContent || "").replace(/\s+/g, "").trim();
      if (/^\d+$/.test(text)) return Number(text);
      if (/\d/.test(text)) {
        const n = parseInt(text, 10);
        if (!Number.isNaN(n)) return Math.min(n, 99);
      }
      // 只有红点/图标、无数字时视为至少 1
      if (domBadge.classList.contains("unread") || domBadge.querySelector("svg")) return 1;
    }
    return 0;
  }

  function syncRail() {
    // 头像现挂在 titlebar 左侧
    const avatarEl = document.querySelector(".dingtalk-rail-avatar");
    if (!avatarEl) return;
    // 头像：取原生当前用户头像
    const img = document.querySelector("#current-user img");
    const name = getCurrentUsername();
    if (img && img.src) {
      if (avatarEl.dataset.bound !== img.src) {
        avatarEl.dataset.bound = img.src;
        avatarEl.innerHTML = `<img src="${escapeHtml(img.src)}" alt="">`;
        avatarEl.style.background = "transparent";
      }
    } else if (name && avatarEl.dataset.bound !== name) {
      avatarEl.dataset.bound = name;
      avatarEl.textContent = avatarLetter(name);
      avatarEl.style.background = avatarColor(name);
    }

    // 头像通知角标
    const notifCount = getUnreadNotificationCount();
    const avatarBadge = document.querySelector(".dingtalk-rail-avatar-badge");
    if (avatarBadge) {
      avatarBadge.style.display = notifCount > 0 ? "" : "none";
      avatarBadge.textContent = notifCount > 99 ? "99+" : String(notifCount);
    }

    // 「消息」项未读（中栏话题求和）
    const unread = listState.topics.reduce((sum, t) => sum + (t.unread || 0) + (t.new_posts || 0), 0);
    const badge = document.querySelector('[data-rail-key="chat"] .dingtalk-rail-badge');
    if (badge) {
      badge.style.display = unread > 0 ? "" : "none";
      badge.textContent = unread > 99 ? "99+" : String(unread);
    }
  }

  /* ============================== 左侧头像 hover → 原生通知菜单 ============================== */

  let notifLeaveTimer = null;
  let notifOpenInFlight = false;
  let notifMenuObserver = null;
  let notifPinned = false; // 点击头像钉住；再点头像 / 点外面取消
  let notifWantOpen = false; // 意向开关：避免收起后因仍悬停被 observer 再次捞起
  let notifIgnoreHoverUntil = 0; // 点击收起后短暂忽略 hover，防止立刻再打开

  function findUserMenu() {
    return document.querySelector(".user-menu.revamped.menu-panel, .user-menu.menu-panel, .user-menu");
  }

  function findUserMenuToggle() {
    return document.querySelector(
      "#toggle-current-user, #current-user button, .header-dropdown-toggle.current-user button, .current-user button.icon, #current-user .icon, #current-user summary, button[aria-controls*='user'], .header-dropdown-toggle.current-user"
    );
  }

  function getHeaderService() {
    return safeLookup(getEmberOwner(), "service:header");
  }

  /** 打开/关闭 Discourse 原生 user-menu（优先 Ember header.userVisible） */
  function setUserMenuVisible(visible) {
    const header = getHeaderService();
    if (header) {
      try {
        if ("userVisible" in header) {
          header.userVisible = !!visible;
          return true;
        }
        if (typeof header.set === "function") {
          header.set("userVisible", !!visible);
          return true;
        }
      } catch (err) {
        console.warn("[linuxdo-dingtalk] header.userVisible failed", err);
      }
    }

    const events = safeLookup(getEmberOwner(), "service:app-events");
    if (events && typeof events.trigger === "function") {
      try {
        const isOpen = !!findUserMenu();
        // keyboard-trigger 是 toggle：仅在状态需要变化时触发
        if (!!visible !== isOpen) {
          events.trigger("header:keyboard-trigger", { type: "user" });
        }
        return true;
      } catch (err) {
        console.warn("[linuxdo-dingtalk] app-events user menu failed", err);
      }
    }
    return false;
  }

  function setNotifOpenClass(open) {
    document.documentElement.classList.toggle("dingtalk-notif-open", !!open);
  }

  function positionNotifMenu(menu) {
    if (!menu || !notifWantOpen) return;
    // 顶栏被 opacity:0 / clip 藏起来；菜单必须挪到 body 才能看见
    if (menu.parentElement !== document.body) {
      document.body.appendChild(menu);
    }
    menu.classList.add("dingtalk-user-menu-float", "show-avatars");
    // 显隐交给 html.dingtalk-notif-open；这里清掉 Discourse 内联定位
    menu.style.display = "";
    menu.style.visibility = "";
    menu.style.opacity = "";
    menu.style.pointerEvents = "";
    menu.style.position = "";
    menu.style.left = "";
    menu.style.top = "";
    menu.style.right = "";
    menu.style.bottom = "";
    menu.style.transform = "";
    setNotifOpenClass(true);
  }

  function clickUserMenuToggle() {
    const toggle = findUserMenuToggle();
    if (!toggle) return false;
    try {
      toggle.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    } catch {
      try { toggle.click(); } catch { return false; }
    }
    return true;
  }

  /** 短暂解除顶栏隐藏，让原生 click / Ember 能创建菜单，再靠 observer 挪到 body */
  function unlockHeaderForNotifClick() {
    let style = document.getElementById("dingtalk-unlock-header");
    if (!style) {
      style = document.createElement("style");
      style.id = "dingtalk-unlock-header";
      style.textContent = `
        html.dingtalk-im-theme.dingtalk-notif-opening .d-header-wrap,
        html.dingtalk-im-theme.dingtalk-notif-opening .d-header {
          opacity: 1 !important;
          clip: auto !important;
          overflow: visible !important;
          width: auto !important;
          height: auto !important;
          max-width: none !important;
          max-height: none !important;
          pointer-events: auto !important;
          z-index: 440 !important;
          top: -9999px !important;
          left: 0 !important;
          position: fixed !important;
        }
      `;
      document.documentElement.appendChild(style);
    }
    document.documentElement.classList.add("dingtalk-notif-opening");
  }

  function lockHeaderAfterNotif() {
    document.documentElement.classList.remove("dingtalk-notif-opening");
  }

  function adoptNotifMenuIfAny() {
    if (!notifWantOpen) return false;
    const menu = findUserMenu();
    if (!menu) return false;
    positionNotifMenu(menu);
    bindNotifMenuHover(menu);
    lockHeaderAfterNotif();
    return true;
  }

  function openNotifMenu() {
    notifWantOpen = true;
    if (adoptNotifMenuIfAny()) {
      // 已打开则确保 Ember 状态同步为可见
      setUserMenuVisible(true);
      return true;
    }
    if (notifOpenInFlight) return false;
    notifOpenInFlight = true;
    ensureNotifMenuObserver();

    let opened = false;
    try {
      opened = setUserMenuVisible(true);
    } catch (err) {
      console.warn("[linuxdo-dingtalk] setUserMenuVisible threw", err);
    }

    // Ember 失败或不立刻出 DOM → 解锁顶栏再点一次原生按钮
    if (!findUserMenu()) {
      unlockHeaderForNotifClick();
      clickUserMenuToggle();
    } else {
      opened = true;
    }

    let tries = 0;
    const poll = setInterval(() => {
      if (adoptNotifMenuIfAny()) {
        notifOpenInFlight = false;
        clearInterval(poll);
        return;
      }
      if (++tries > 24) {
        notifOpenInFlight = false;
        lockHeaderAfterNotif();
        clearInterval(poll);
        console.warn("[linuxdo-dingtalk] openNotifMenu: menu not found", {
          opened,
          hasOwner: !!getEmberOwner(),
          hasHeader: !!getHeaderService(),
          hasToggle: !!findUserMenuToggle()
        });
      }
    }, 50);
    return opened;
  }

  function setNotifPinned(pinned) {
    notifPinned = !!pinned;
    document.documentElement.classList.toggle("dingtalk-notif-pinned", notifPinned);
    const avatar = document.querySelector(".dingtalk-rail-avatar");
    if (avatar) avatar.classList.toggle("is-notif-pinned", notifPinned);
  }

  function hideNotifMenuNode(menu) {
    if (!menu) return;
    delete menu.dataset.dingtalkHoverBound;
    // 先靠 html.dingtalk-notif-open 隐藏；再尽量拆掉节点，防止 Ember 残留
    menu.classList.remove("show-avatars");
    try {
      menu.remove();
    } catch {
      menu.classList.remove("dingtalk-user-menu-float");
      menu.style.display = "none";
    }
  }

  function closeNotifMenu() {
    notifWantOpen = false;
    notifOpenInFlight = false;
    clearNotifLeaveTimer();
    setNotifPinned(false);
    setNotifOpenClass(false); // 关键：立刻靠 CSS 藏掉
    lockHeaderAfterNotif();
    // 藏掉所有我们捞出来的浮层副本
    document.querySelectorAll(".user-menu.dingtalk-user-menu-float, .dingtalk-user-menu-float").forEach(hideNotifMenuNode);
    hideNotifMenuNode(findUserMenu());
    try { setUserMenuVisible(false); } catch { /* ignore */ }
    // 看过通知后刷新角标
    setTimeout(() => syncRail(), 400);
  }

  function clearNotifLeaveTimer() {
    if (notifLeaveTimer) {
      clearTimeout(notifLeaveTimer);
      notifLeaveTimer = null;
    }
  }

  function scheduleCloseNotifMenu() {
    if (notifPinned) return; // 已钉住：移出不关，点外面才关
    clearNotifLeaveTimer();
    notifLeaveTimer = setTimeout(() => {
      notifLeaveTimer = null;
      if (notifPinned) return;
      const avatar = document.querySelector(".dingtalk-rail-avatar");
      const menu = findUserMenu();
      const overAvatar = !!(avatar && avatar.matches(":hover"));
      const overMenu = !!(menu && menu.classList.contains("dingtalk-user-menu-float") && menu.matches(":hover"));
      if (!overAvatar && !overMenu) closeNotifMenu();
    }, 220);
  }

  function bindNotifMenuHover(menu) {
    if (!menu || menu.dataset.dingtalkHoverBound === "1") return;
    menu.dataset.dingtalkHoverBound = "1";
    menu.addEventListener("mouseenter", clearNotifLeaveTimer);
    menu.addEventListener("mouseleave", scheduleCloseNotifMenu);
  }

  function ensureNotifMenuObserver() {
    if (notifMenuObserver) return;
    notifMenuObserver = new MutationObserver(() => {
      if (getViewMode() === "native" || otherThemeActive()) return;
      if (!notifWantOpen) return;
      adoptNotifMenuIfAny();
    });
    notifMenuObserver.observe(document.body, { childList: true, subtree: true });
  }

  function isNotifMenuOpen() {
    return notifPinned || document.documentElement.classList.contains("dingtalk-notif-open");
  }

  function ensureNotifOutsideClose() {
    if (window.__dingtalkNotifOutsideBound) return;
    window.__dingtalkNotifOutsideBound = true;
    const onOutside = (e) => {
      if (!isNotifMenuOpen()) return;
      const avatar = document.querySelector(".dingtalk-rail-avatar");
      const menu = document.querySelector(".user-menu.dingtalk-user-menu-float, .dingtalk-user-menu-float");
      const t = e.target;
      if (avatar && (avatar === t || avatar.contains(t))) return;
      if (menu && (menu === t || menu.contains(t))) return;
      notifIgnoreHoverUntil = Date.now() + 400;
      closeNotifMenu();
    };
    document.addEventListener("pointerdown", onOutside, true);
    document.addEventListener("mousedown", onOutside, true);
  }

  function bindRailAvatarNotif(rail) {
    const avatar = rail?.querySelector(".dingtalk-rail-avatar");
    if (!avatar || avatar.dataset.notifBound === "1") return;
    avatar.dataset.notifBound = "1";
    avatar.removeAttribute("title");
    ensureNotifOutsideClose();

    avatar.addEventListener("mouseenter", () => {
      if (getViewMode() === "native" || otherThemeActive()) return;
      if (notifPinned) return;
      if (Date.now() < notifIgnoreHoverUntil) return;
      clearNotifLeaveTimer();
      ensureNotifMenuObserver();
      openNotifMenu();
    });
    avatar.addEventListener("mouseleave", scheduleCloseNotifMenu);

    // 点击头像：未钉住 → 钉住；已钉住 → 收起
    avatar.addEventListener("click", (e) => {
      if (getViewMode() === "native" || otherThemeActive()) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
      clearNotifLeaveTimer();

      if (notifPinned) {
        notifIgnoreHoverUntil = Date.now() + 500;
        closeNotifMenu();
        return;
      }

      ensureNotifMenuObserver();
      openNotifMenu();
      setNotifPinned(true);
    });
  }

  /* ============================== 窄图标条：假 icon（纯装饰） ============================== */

  const STRIP_ITEMS = [
    { icon: "menu" },
    { icon: "chat", badge: 19 },
    { icon: "calendar", badge: 1 },
    { icon: "contacts" },
    { icon: "wiki" },
    { icon: "cloud" },
    { icon: "task", badge: 11 },
    { icon: "more" }
  ];

  function stripFakeHtml() {
    return STRIP_ITEMS.map((it) =>
      `<div class="dingtalk-strip-item">${ICONS[it.icon]}` +
      (it.badge ? `<span class="dingtalk-strip-badge">${it.badge}</span>` : "") +
      `</div>`
    ).join("");
  }

  function ensureStrip() {
    // 钉钉布局不使用窄条；若残留则移除
    document.querySelector(".dingtalk-strip")?.remove();
    return null;
  }

  /* ============================== 展开栏：站点原生侧栏（原样搬入） ============================== */

  let categoriesCache = null; // [{id,name,slug,color}]

  async function loadCategories() {
    if (categoriesCache) return categoriesCache;
    try {
      const data = await api("/categories.json");
      categoriesCache = (data.category_list && data.category_list.categories) || [];
    } catch {
      categoriesCache = [];
    }
    return categoriesCache;
  }

  function categoryById(id) {
    return (categoriesCache || []).find((c) => c.id === id) || null;
  }

  /* ============================== 中栏：会话列表 ============================== */

  const listState = {
    apiPath: "",
    moreUrl: null,
    loading: false,
    topics: [],
    usersById: {}
  };

  const LIST_NAV_KEY = "linuxdo-dingtalk-list-nav"; // "1" = 展开中栏筛选
  // 内存态优先，避免 MutationObserver 回写时把展开瞬间打回去
  let listNavOpen = (() => {
    try { return localStorage.getItem(LIST_NAV_KEY) === "1"; } catch { return false; }
  })();

  const DEFAULT_LIST_NAV = [
    { href: "/latest", label: "最新" },
    { href: "/new", label: "新" },
    { href: "/unseen", label: "未读" },
    { href: "/hot", label: "热门" },
    { href: "/top", label: "排行榜" },
    { href: "/posted", label: "我的帖子" },
    { href: "/read", label: "已读" },
    { href: "/bookmarks", label: "书签" },
    { href: "/categories", label: "类别" }
  ];

  function applyListNavDom() {
    const panel = document.querySelector(".dingtalk-list-panel");
    const nav = document.querySelector(".dingtalk-list-nav");
    const btn = document.querySelector(".dingtalk-list-nav-toggle");
    if (panel) panel.classList.toggle("dingtalk-list-nav-open", listNavOpen);
    if (nav) nav.classList.toggle("open", listNavOpen);
    if (btn) {
      btn.setAttribute("aria-expanded", listNavOpen ? "true" : "false");
      btn.title = listNavOpen ? "收起筛选" : "筛选";
      btn.classList.toggle("is-on", listNavOpen);
      if (!btn.dataset.iconFixed) {
        btn.dataset.iconFixed = "1";
        btn.innerHTML = ICONS.filter;
      }
    }
    if (listNavOpen) syncListNav();
  }

  function setListNavOpen(open) {
    listNavOpen = !!open;
    try { localStorage.setItem(LIST_NAV_KEY, listNavOpen ? "1" : "0"); } catch { /* ignore */ }
    applyListNavDom();
  }

  function collectListNavItems() {
    const native = document.querySelector("#navigation-bar");
    if (native) {
      const items = [...native.querySelectorAll(":scope > li > a, li > a")].map((a) => ({
        href: a.getAttribute("href") || "#",
        label: (a.textContent || "").replace(/\s+/g, " ").trim(),
        active: a.classList.contains("active") || a.getAttribute("aria-current") === "page"
      })).filter((it) => it.label && it.href && it.href !== "#");
      // 去重（有的主题 li>a 会匹配两次）
      const seen = new Set();
      const deduped = items.filter((it) => {
        if (seen.has(it.href)) return false;
        seen.add(it.href);
        return true;
      });
      if (deduped.length) return deduped;
    }
    const path = location.pathname.replace(/\/$/, "") || "/";
    return DEFAULT_LIST_NAV.map((it) => ({
      ...it,
      active: path === it.href || (it.href === "/latest" && path === "/")
    }));
  }

  function syncListNav() {
    const nav = document.querySelector(".dingtalk-list-nav");
    if (!nav) return;
    const items = collectListNavItems();
    const html = items.map((it) =>
      `<a href="${escapeHtml(it.href)}" class="${it.active ? "active" : ""}">${escapeHtml(it.label)}</a>`
    ).join("");
    if (nav.dataset.sig === html) return; // 避免无变化时触发 MutationObserver 死循环
    nav.dataset.sig = html;
    nav.innerHTML = html;
  }

  function getNativeSearchInput() {
    return document.querySelector(
      "#welcome-banner-search-input, .welcome-banner__search-menu .search-term__input, .search-menu .search-term__input, input.search-term__input"
    );
  }

  function setNativeInputValue(input, value) {
    if (!input) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (setter) setter.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function syncSearchToNative(value) {
    const input = getNativeSearchInput();
    if (!input) return null;
    if (input.value !== value) setNativeInputValue(input, value);
    return input;
  }

  function submitNativeSearch(value) {
    const q = (value || "").trim();
    if (!q) return;
    const input = syncSearchToNative(q) || getNativeSearchInput();
    if (input) {
      try {
        input.focus({ preventScroll: true });
      } catch {
        try { input.focus(); } catch { /* ignore */ }
      }
      for (const type of ["keydown", "keypress", "keyup"]) {
        input.dispatchEvent(new KeyboardEvent(type, {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        }));
      }
      const form = input.closest("form");
      if (form && typeof form.requestSubmit === "function") {
        try { form.requestSubmit(); } catch { /* ignore */ }
      }
    }
    // 站点搜索页不在 IM 锁定路由内，会露出原生结果
    const target = `/search?q=${encodeURIComponent(q)}`;
    if (location.pathname !== "/search" || new URLSearchParams(location.search).get("q") !== q) {
      // 给 Ember 一点时间吃掉 input 事件；若未跳转再兜底
      setTimeout(() => {
        if (!location.pathname.startsWith("/search")) {
          location.assign(target);
        }
      }, 120);
    }
  }

  /** 站内软跳转：避免中栏自定义链接触发浏览器整页重载 */
  function discourseRouteTo(url) {
    if (!url) return false;
    try {
      const mod = discourseRequire("discourse/lib/url");
      const DiscourseURL = mod?.default || mod;
      if (DiscourseURL && typeof DiscourseURL.routeTo === "function") {
        DiscourseURL.routeTo(url);
        return true;
      }
    } catch { /* ignore */ }
    try {
      if (typeof window.Discourse?.URL?.routeTo === "function") {
        window.Discourse.URL.routeTo(url);
        return true;
      }
    } catch { /* ignore */ }
    return false;
  }

  function navigateInApp(url) {
    if (!url) return;
    // 绝对地址收成站内路径
    let path = url;
    try {
      if (/^https?:/i.test(url)) path = new URL(url, location.origin).pathname + new URL(url, location.origin).search + new URL(url, location.origin).hash;
    } catch { /* keep url */ }
    // IM 观感：进入话题固定从第 1 楼打开（原生隐藏流窗口随之对齐）
    {
      const cut = /[?#]/.exec(path);
      const base = cut ? path.slice(0, cut.index) : path;
      if (/^\/t\/[^/]+\/\d+$/.test(base)) {
        path = `${base}/1${cut ? path.slice(cut.index) : ""}`;
      }
    }
    if (discourseRouteTo(path)) {
      scheduleApply();
      return;
    }
    history.pushState({}, "", path);
    scheduleApply();
  }

  function bindListPanelClicks(panel) {
    // v2：含伪装头像等逻辑；旧 v1 面板需重绑
    if (!panel || panel.dataset.linkBound === "2") return;
    panel.dataset.linkBound = "2";
    panel.addEventListener("click", (e) => {
      // 伪装按钮已在按钮自身监听；这里仍兜底一次
      const maskBtn = e.target.closest(".dingtalk-mask-avatar-toggle");
      if (maskBtn && panel.contains(maskBtn)) {
        e.preventDefault();
        e.stopPropagation();
        setMaskAvatar(!isMaskAvatar());
        return;
      }

      const btn = e.target.closest(".dingtalk-list-nav-toggle");
      if (btn && panel.contains(btn)) {
        e.preventDefault();
        e.stopPropagation();
        setListNavOpen(!listNavOpen);
        return;
      }

      // 会话/置顶：拦截默认跳转，走 Discourse SPA / pushState
      const link = e.target.closest("a.dingtalk-conv, .dingtalk-list-nav a");
      if (!link || !panel.contains(link)) return;
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const href = link.getAttribute("href");
      if (!href || href === "#" || href.startsWith("javascript:")) return;
      e.preventDefault();
      e.stopPropagation();
      navigateInApp(href);
    });
  }

  function ensureListPanel() {
    let panel = document.querySelector(".dingtalk-list-panel");
    // 旧面板缺筛选按钮/容器时重建
    if (panel && (!panel.querySelector(".dingtalk-list-nav-toggle") || !panel.querySelector(".dingtalk-list-nav") || !panel.querySelector(".dingtalk-chip"))) {
      panel.remove();
      panel = null;
    }
    if (panel) {
      bindListPanelClicks(panel);
      ensureMaskAvatarToggle(panel);
      applyListNavDom();
      return panel;
    }
    panel = document.createElement("div");
    panel.className = "dingtalk-list-panel";
    panel.innerHTML = `
      <div class="dingtalk-list-header">
        <button type="button" class="dingtalk-chip-icon dingtalk-list-nav-toggle" title="筛选" aria-expanded="false">${ICONS.filter}</button>
        <div class="dingtalk-list-chips">
          <button type="button" class="dingtalk-chip active" data-chip="all">消息<span class="n"></span></button>
          <button type="button" class="dingtalk-chip" data-chip="unread">未读<span class="n"></span></button>
        </div>
        <div class="dingtalk-list-actions">
          <button type="button" class="dingtalk-icon-btn dingtalk-mask-avatar-toggle" title="伪装头像：关（点击开启）" aria-pressed="false">${ICONS.disguise}</button>
        </div>
      </div>
      <div class="dingtalk-list-nav" role="navigation" aria-label="话题筛选"></div>
      <div class="dingtalk-list-body"></div>
    `;
    document.body.appendChild(panel);
    bindListPanelClicks(panel);
    ensureMaskAvatarToggle(panel);
    panel.querySelectorAll(".dingtalk-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        panel.querySelectorAll(".dingtalk-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        navigateInApp(chip.dataset.chip === "unread" ? "/unseen" : "/latest");
      });
    });
    panel.querySelector(".dingtalk-list-body").addEventListener("scroll", () => {
      const body = panel.querySelector(".dingtalk-list-body");
      if (body.scrollTop + body.clientHeight >= body.scrollHeight - 120) {
        loadMoreList();
      }
    });
    applyListNavDom();
    return panel;
  }

  function topicHref(topic) {
    return `/t/${topic.slug || "topic"}/${topic.id}`;
  }

  function convAvatarHtml(topic, usersById) {
    if (isMaskAvatar()) {
      if (isGridMaskTopic(topic)) return disguiseGridAvatar(topic);
      const d = disguiseAvatarForTopic(topic);
      return `<span class="dingtalk-conv-avatar${d.className ? " " + d.className : ""}" style="background:${d.bg};${d.styleExtra}">${d.html}</span>`;
    }
    if (isGroupConversation(topic)) {
      return groupAvatarHtml(topic, usersById || {});
    }
    const poster = (topic.posters || [])[0];
    const user = poster && usersById ? usersById[poster.user_id] : null;
    const displayName = userDisplayName(user, topic.last_poster_username || "?");
    if (user && user.avatar_template) {
      return `<span class="dingtalk-conv-avatar"><img src="${escapeHtml(fullAvatarUrl(user.avatar_template))}" alt="" loading="lazy"></span>`;
    }
    return `<span class="dingtalk-conv-avatar is-text-avatar is-solid" style="background:${avatarColor(displayName)}">${escapeHtml(avatarLetter(displayName))}</span>`;
  }

  function convCategoryTag(topic) {
    if (!categoriesCache || !topic.category_id) return "";
    const cat = categoryById(topic.category_id);
    if (!cat) return "";
    return `<span class="dingtalk-conv-tag">${escapeHtml(cat.name)}</span>`;
  }

  function convRowHtml(topic, usersById) {
    const unread = topic.unread > 0 ? topic.unread : (topic.new_posts > 0 ? topic.new_posts : 0);
    const replyCount = Math.max(0, (topic.posts_count || 1) - 1);
    const rawSummary = topic.last_poster_username
      ? `[${replyCount}条] ${topic.last_poster_username}`
      : `${topic.posts_count || 0} 回复`;
    const title = convDisplayTitle(topic);
    const summary = convDisplaySummary(topic, rawSummary);
    // 匿名模式隐藏分类 chip，避免暴露真实板块
    const tag = isMaskAvatar() ? "" : convCategoryTag(topic);
    return `
      <a class="dingtalk-conv" href="${escapeHtml(topicHref(topic))}" data-topic-id="${topic.id}" title="${escapeHtml(title)}">
        ${convAvatarHtml(topic, usersById)}
        <span class="dingtalk-conv-info">
          <span class="dingtalk-conv-top">
            <span class="dingtalk-conv-title">
              <span class="dingtalk-conv-name">${escapeHtml(title)}</span>
              ${tag}
            </span>
            <span class="dingtalk-conv-time">${escapeHtml(formatTime(topic.bumped_at || topic.last_activity_at || topic.created_at))}</span>
          </span>
          <span class="dingtalk-conv-bottom">
            <span class="dingtalk-conv-msg">${escapeHtml(summary)}</span>
            ${unread ? `<span class="dingtalk-conv-badge">${unread > 99 ? "99+" : unread}</span>` : ""}
          </span>
        </span>
      </a>`;
  }

  function isGroupConversation(topic) {
    return Math.abs(Number(topic.id) || 0) % 2 === 1;
  }

  function mulberry32(a) {
    a |= 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(arr, seed) {
    const rng = mulberry32(seed);
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function groupAvatarHtml(topic, usersById) {
    const all = Object.values(usersById || {})
      .filter((u) => u && u.avatar_template)
      .map((u) => u.avatar_template);
    const tpls = seededShuffle(all, Number(topic.id) || 1).slice(0, 9);
    const seed = Math.abs(Number(topic.id) || 0);
    const placeholder = surnameForTopic(topic);
    const cells = [];
    for (let i = 0; i < 9; i++) {
      const tpl = tpls[i];
      if (tpl) {
        cells.push(`<img src="${escapeHtml(fullAvatarUrl(tpl))}" alt="" loading="lazy">`);
      } else {
        const color = MASK_GRID_BLUES[(seed + i) % MASK_GRID_BLUES.length];
        cells.push(`<span style="background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;line-height:1;">${escapeHtml(placeholder)}</span>`);
      }
    }
    return `<span class="dingtalk-conv-avatar is-group">${cells.join("")}</span>`;
  }

  function renderListRows() {
    const body = document.querySelector(".dingtalk-list-body");
    if (!body) return;
    const usersById = listState.usersById || {};
    body.innerHTML =
      listState.topics.map((t) => convRowHtml(t, usersById)).join("") +
      `<div class="dingtalk-list-status">${listState.moreUrl ? "下拉加载更多…" : (listState.topics.length ? "没有更多了" : "")}</div>`;
    syncListChips();
    syncListActive();
  }

  /** 中栏 chips 计数：消息 = 已加载话题数，未读 = unread/new_posts 求和 */
  function syncListChips() {
    const allN = document.querySelector('.dingtalk-chip[data-chip="all"] .n');
    const unreadN = document.querySelector('.dingtalk-chip[data-chip="unread"] .n');
    if (allN) allN.textContent = listState.topics.length ? String(listState.topics.length) : "";
    if (unreadN) {
      const n = listState.topics.reduce((sum, t) => sum + (t.unread || 0) + (t.new_posts || 0), 0);
      unreadN.textContent = n > 0 ? String(n > 99 ? "99+" : n) : "";
    }
  }

  function syncListActive() {
    const currentId = topicIdFromPath(location.pathname);
    for (const row of document.querySelectorAll(".dingtalk-conv")) {
      row.classList.toggle("active", currentId != null && Number(row.dataset.topicId) === currentId);
    }
  }

  function applyListJson(data, append) {
    const topics = (data.topic_list && data.topic_list.topics) || [];
    const users = data.users || [];
    const usersById = append ? { ...(listState.usersById || {}) } : {};
    for (const u of users) usersById[u.id] = u;
    listState.usersById = usersById;
    const existing = new Set(append ? listState.topics.map((t) => t.id) : []);
    const fresh = topics.filter((t) => !existing.has(t.id));
    listState.topics = append ? listState.topics.concat(fresh) : topics;
    const more = data.topic_list && data.topic_list.more_topics_url;
    listState.moreUrl = more ? more.replace(/\.json\b/, ".json") : null;
    renderListRows();
    syncRail();
  }

  async function loadList(apiPath, force) {
    if (!apiPath) return;
    // 用列表 API 做缓存键：进帖子时 pathname 会变，但不应重拉会话列表
    if (!force && listState.apiPath === apiPath && listState.topics.length) {
      syncListActive();
      return;
    }
    if (listState.loading) return;
    listState.loading = true;
    listState.apiPath = apiPath;
    try {
      const data = await api(apiPath);
      applyListJson(data, false);
    } catch {
      const body = document.querySelector(".dingtalk-list-body");
      if (body) body.innerHTML = `<div class="dingtalk-list-status">列表加载失败，请点右上角刷新重试</div>`;
    } finally {
      listState.loading = false;
    }
  }

  async function loadMoreList() {
    if (!listState.moreUrl || listState.loading) return;
    listState.loading = true;
    try {
      const data = await api(listState.moreUrl);
      applyListJson(data, true);
    } catch { /* 保留现状 */ } finally {
      listState.loading = false;
    }
  }

  /* ============================== 右栏：聊天详情 ============================== */

  const chatState = {
    topicId: null,
    loading: false,
    stream: [],        // 全部 post id 顺序
    renderedFirstIdx: 0, // stream 中已渲染的起始下标
    renderedLastIdx: -1, // stream 中已渲染的结束下标
    renderedLastNumber: 0, // 已渲染的最大 post_number
    hasOlder: false,
    hasNewer: false,
    title: ""
  };

  function ensureChatPanel() {
    let panel = document.querySelector(".dingtalk-chat-panel");
    if (panel && (!panel.querySelector(".dingtalk-chat-compose") || !panel.querySelector(".dingtalk-composer-card"))) {
      panel.remove();
      panel = null;
    }
    if (panel) {
      if (!panel.dataset.composeBound) {
        panel.dataset.composeBound = "1";
        bindChatPanelEvents(panel);
      }
      wireComposer(panel);
      return panel;
    }
    panel = document.createElement("div");
    panel.className = "dingtalk-chat-panel";
    panel.dataset.empty = "1";
    panel.dataset.composeBound = "1";
    const toolKeys = ["emoji", "like", "at", "aa", "cut", "folder", "plus"];
    const toolsHtml = toolKeys.map((k) => {
      const inner = k === "aa"
        ? '<span style="font-size:13px;font-weight:600;line-height:1">Aa</span><span class="dot"></span>'
        : ICONS[k];
      return `<button type="button" class="dingtalk-icon-btn" tabindex="-1" aria-hidden="true">${inner}</button>`;
    }).join("");
    const headTools = ["cam", "mute", "folder", "menu", "dots", "gear"].map((k) => {
      const dot = k === "folder" ? '<span class="dot"></span>' : "";
      return `<button type="button" class="dingtalk-icon-btn" title="${k}" tabindex="-1">${dot}${ICONS[k]}</button>`;
    }).join("");
    panel.innerHTML = `
      <div class="dingtalk-chat-header">
        <div class="dingtalk-chat-head-main">
          <span class="dingtalk-chat-avatar" style="display:none"></span>
          <div class="dingtalk-chat-titles">
            <div class="dingtalk-chat-title-row">
              <span class="dingtalk-chat-title"></span>
              <span class="dingtalk-chat-count" style="display:none"></span>
              <span class="dingtalk-chat-chips"></span>
            </div>
            <div class="dingtalk-chat-sub"></div>
          </div>
        </div>
        <div class="dingtalk-chat-tools">${headTools}</div>
        <div class="dingtalk-chat-actions">
          <button class="dingtalk-icon-btn dingtalk-chat-refresh" title="刷新本话题">${ICONS.refresh}</button>
          <button class="dingtalk-icon-btn dingtalk-chat-native" title="切换原生视图">${ICONS.external}</button>
        </div>
      </div>
      <div class="dingtalk-chat-body"></div>
      <div class="dingtalk-composer">
        <div class="dingtalk-composer-card">
          <div class="dingtalk-composer-target"><span></span><button type="button" title="取消回复">×</button></div>
          <textarea class="dingtalk-chat-compose" data-dingtalk-compose="1" rows="2" placeholder="按 Enter 发送，Shift+Enter 换行"></textarea>
          <div class="dingtalk-composer-tools">${toolsHtml}<div class="spacer"></div><span class="dingtalk-composer-status"></span><button type="button" class="dingtalk-send-btn" disabled>发送</button></div>
        </div>
        <input type="file" class="dingtalk-composer-file" accept="image/*" multiple>
      </div>
    `;
    document.body.appendChild(panel);
    bindChatPanelEvents(panel);
    wireComposer(panel);
    return panel;
  }

  function wireComposer(panel) {
    const input = panel.querySelector(".dingtalk-chat-compose");
    if (!input || input.dataset.wired === "1") return;
    input.dataset.wired = "1";

    const send = panel.querySelector(".dingtalk-send-btn");
    const target = panel.querySelector(".dingtalk-composer-target");
    const targetClose = target?.querySelector("button");
    const fileInput = panel.querySelector(".dingtalk-composer-file");
    const imageBtn = panel.querySelector('.dingtalk-composer-tools .dingtalk-icon-btn[data-tool="folder"]');

    function updateSendState() {
      const empty = !input.value.trim();
      send.disabled = composerState.submitting || composerState.uploading || empty;
    }
    updateSendState();
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 160) + "px";
      updateSendState();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.shiftKey || e.isComposing || e.keyCode === 229) return;
      e.preventDefault();
      e.stopPropagation();
      submitComposer();
    });

    send.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      submitComposer();
    });

    if (imageBtn) {
      imageBtn.title = "上传图片";
      imageBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
      });
    }
    fileInput.addEventListener("change", (e) => {
      uploadComposerFiles(e.target.files);
      e.target.value = "";
    });

    input.addEventListener("paste", (e) => handleComposerPaste(e));
    panel.querySelector(".dingtalk-composer-card")?.addEventListener("drop", (e) => handleComposerDrop(e));
    panel.querySelector(".dingtalk-composer-card")?.addEventListener("dragover", (e) => { e.preventDefault(); });

    targetClose?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideTargetedReply();
      input.focus();
    });
  }

  function bindChatPanelEvents(panel) {
    panel.addEventListener("click", (e) => {
      if (e.target.closest(".dingtalk-chat-refresh")) {
        if (chatState.topicId) {
          chatState.topicId = null;
          loadTopic(topicIdFromPath(location.pathname));
        }
        return;
      }
      if (e.target.closest(".dingtalk-chat-native")) {
        setViewMode("native");
        location.reload();
        return;
      }
      if (e.target.closest(".dingtalk-chat-compose, .dingtalk-composer-tools, .dingtalk-composer-target")) {
        return;
      }
      // 聊天头分类 chip：站内软跳转
      const chipLink = e.target.closest("a.dingtalk-chat-chip");
      if (chipLink && panel.contains(chipLink)) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        navigateInApp(chipLink.getAttribute("href"));
        return;
      }
      const toolBtn = e.target.closest(".dingtalk-msg-tool");
      if (!toolBtn || !panel.contains(toolBtn)) return;
      const msg = toolBtn.closest(".dingtalk-msg");
      if (!msg) return;
      if (toolBtn.dataset.action === "like") {
        toggleLike(Number(msg.dataset.postId), toolBtn);
      } else if (toolBtn.dataset.action === "reply") {
        e.preventDefault();
        e.stopPropagation();
        replyToPost(Number(msg.dataset.postNumber));
      }
    });
    panel.querySelector(".dingtalk-chat-body").addEventListener("scroll", () => {
      const body = panel.querySelector(".dingtalk-chat-body");
      if (body.scrollTop < 80) loadOlderPosts();
      if (body.scrollTop + body.clientHeight >= body.scrollHeight - 120) loadNewerPosts();
      trackVisibleTopicPost();
    });
  }

  function renderChatEmpty() {
    ensureChatPanel();
    chatState.topicId = null;
    const panel = document.querySelector(".dingtalk-chat-panel");
    if (panel) panel.dataset.empty = "1";
    const body = document.querySelector(".dingtalk-chat-body");
    if (!body || body.dataset.state === "empty") return;
    body.dataset.state = "empty";
    const title = document.querySelector(".dingtalk-chat-title");
    const sub = document.querySelector(".dingtalk-chat-sub");
    if (title) title.textContent = "";
    if (sub) sub.textContent = "";
    const count = document.querySelector(".dingtalk-chat-count");
    if (count) { count.style.display = "none"; count.textContent = ""; }
    const chips = document.querySelector(".dingtalk-chat-chips");
    if (chips) chips.innerHTML = "";
    const chatAvatar = document.querySelector(".dingtalk-chat-avatar");
    if (chatAvatar) chatAvatar.style.display = "none";
    body.innerHTML = `
      <div class="dingtalk-chat-empty">
        ${ICONS.msg}
        <div>暂无消息</div>
      </div>`;
  }

  function renderChatError(message) {
    const body = document.querySelector(".dingtalk-chat-body");
    if (!body) return;
    body.innerHTML = `
      <div class="dingtalk-chat-error">
        ${ICONS.chat}
        <div>${escapeHtml(message)}</div>
        <button class="dingtalk-empty-btn" onclick="location.reload()">打开原生页面</button>
      </div>`;
  }

  const likedPosts = new Set();

  function bubbleHtml(post, myName) {
    const me = isMyPost(post, myName);
    const side = me ? "me" : "other";
    const displayName = userDisplayName(post, post.username || "?");
    let avatar;
    let avatarBg = avatarColor(displayName);
    if (isMaskAvatar()) {
      avatar = escapeHtml(avatarLetter(displayName));
    } else if (post.avatar_template) {
      avatar = `<img src="${escapeHtml(fullAvatarUrl(post.avatar_template))}" alt="" loading="lazy">`;
      avatarBg = "transparent";
    } else {
      avatar = escapeHtml(avatarLetter(displayName));
    }
    const liked = post.id && likedPosts.has(post.id) ? " liked" : "";
    return `
      <div class="dingtalk-msg dingtalk-msg-${side}" data-post-number="${post.post_number}"${post.id ? ` data-post-id="${post.id}"` : ""}${me ? ' data-mine="1"' : ""}>
        <span class="dingtalk-msg-avatar" style="background:${avatarBg}">${avatar}</span>
        <div class="dingtalk-msg-content">
          <span class="dingtalk-msg-name">${escapeHtml(displayName)}</span>
          <div class="dingtalk-msg-bubble">${post.cooked || ""}</div>
          <span class="dingtalk-msg-meta">
            <span>#${post.post_number}</span>
            <span>${escapeHtml(formatTime(post.created_at))}</span>
          </span>
          <div class="dingtalk-msg-tools">
            <button class="dingtalk-msg-tool${liked}" data-action="like" title="点赞">${ICONS.like}</button>
            <button class="dingtalk-msg-tool" data-action="reply" title="回复">${ICONS.reply}</button>
          </div>
        </div>
      </div>`;
  }

  function csrfToken() {
    const meta = document.querySelector("meta[name='csrf-token']");
    return meta ? meta.content : "";
  }

  async function toggleLike(postId, btn) {
    if (!postId) return;
    const wasLiked = likedPosts.has(postId);
    // 乐观更新，失败回滚
    if (wasLiked) likedPosts.delete(postId); else likedPosts.add(postId);
    btn.classList.toggle("liked", !wasLiked);
    try {
      const resp = await fetch(
        wasLiked ? `/post_actions/${postId}?post_action_type_id=2` : "/post_actions",
        wasLiked
          ? {
              method: "DELETE",
              credentials: "same-origin",
              headers: { "X-CSRF-Token": csrfToken(), "X-Requested-With": "XMLHttpRequest" }
            }
          : {
              method: "POST",
              credentials: "same-origin",
              headers: {
                "X-CSRF-Token": csrfToken(),
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: `id=${postId}&post_action_type_id=2`
            }
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    } catch {
      if (wasLiked) likedPosts.add(postId); else likedPosts.delete(postId);
      btn.classList.toggle("liked", wasLiked);
    }
  }

  function discourseRequire(moduleId) {
    try {
      if (typeof window.require === "function") return window.require(moduleId);
    } catch { /* module missing */ }
    return null;
  }

  function safeLookup(owner, key) {
    if (!owner || typeof owner.lookup !== "function") return null;
    try {
      return owner.lookup(key);
    } catch {
      return null;
    }
  }

  function getEmberOwner() {
    try {
      if (window.Discourse?.__container__) return window.Discourse.__container__;

      // Ember.Namespace 反查 Discourse 应用
      const Ember = window.Ember;
      const namespaces = Ember?.Namespace?.NAMESPACES;
      if (Array.isArray(namespaces)) {
        const app = namespaces.find((n) =>
          n && (n.name === "Discourse" || n.modulePrefix === "discourse" || n.NAMESPACE === "Discourse")
        );
        if (app?.__container__) return app.__container__;
        if (typeof app?.lookup === "function") return app;
      }

      const mod =
        discourseRequire("discourse-common/lib/get-owner") ||
        discourseRequire("discourse/lib/get-owner");
      if (mod) {
        const owner =
          (typeof mod.getOwnerWithFallback === "function" && mod.getOwnerWithFallback(window.Discourse)) ||
          (typeof mod.getOwner === "function" && mod.getOwner(window.Discourse)) ||
          null;
        if (owner) return owner;
      }

      try {
        const appMod = discourseRequire("discourse/app");
        const app = appMod?.default || appMod;
        if (app?.__container__) return app.__container__;
        if (typeof app?.lookup === "function") return app;
      } catch { /* ignore */ }
    } catch (err) {
      console.warn("[linuxdo-dingtalk] getEmberOwner failed", err);
    }
    return null;
  }

  function getComposerService(owner) {
    return safeLookup(owner, "service:composer") || safeLookup(owner, "controller:composer");
  }

  function getTopicModel(owner) {
    const topicController = safeLookup(owner, "controller:topic");
    if (!topicController) return null;
    try {
      return topicController.get?.("model") || topicController.model || null;
    } catch {
      return null;
    }
  }

  function findLoadedPost(topic, postNumber) {
    if (!topic || !postNumber) return null;
    try {
      const stream = topic.get?.("postStream") || topic.postStream;
      const posts = stream?.get?.("posts") || stream?.posts || [];
      return [...posts].find((p) =>
        Number(p?.get?.("post_number") ?? p?.post_number) === Number(postNumber)
      ) || null;
    } catch { /* ignore */ }
    return null;
  }

  function isComposerOpen() {
    const el = document.querySelector("#reply-control");
    return !!(el && (el.classList.contains("open") || el.classList.contains("fullscreen") || el.classList.contains("edit-title")));
  }

  function flashComposeHint(message, kind) {
    const btn = document.querySelector(".dingtalk-chat-compose");
    const bar = btn?.querySelector("span");
    if (!btn || !bar) return;
    const prev = btn.dataset.defaultLabel || bar.textContent || "点击回复，打开原生编辑器…";
    btn.dataset.defaultLabel = prev;
    bar.textContent = message;
    btn.classList.remove("busy", "error");
    if (kind) btn.classList.add(kind);
    clearTimeout(flashComposeHint._timer);
    flashComposeHint._timer = setTimeout(() => {
      bar.textContent = btn.dataset.defaultLabel || "点击回复，打开原生编辑器…";
      btn.classList.remove("busy", "error");
    }, 3200);
  }

  const composerState = {
    submitting: false,
    uploading: false,
    replyToPostNumber: null
  };

  function setComposeStatus(message, kind) {
    const status = document.querySelector(".dingtalk-composer-status");
    if (!status) return;
    status.textContent = message || "";
    status.classList.remove("busy", "error", "success");
    if (kind) status.classList.add(kind);
    if (message) {
      clearTimeout(setComposeStatus._timer);
      setComposeStatus._timer = setTimeout(() => {
        status.textContent = "";
        status.classList.remove("busy", "error", "success");
      }, 3200);
    }
  }

  function composeUi() {
    const card = document.querySelector(".dingtalk-composer-card");
    return {
      card,
      input: card?.querySelector(".dingtalk-chat-compose"),
      target: card?.querySelector(".dingtalk-composer-target"),
      send: card?.querySelector(".dingtalk-send-btn"),
      status: card?.querySelector(".dingtalk-composer-status")
    };
  }

  function updateComposeSendState() {
    const { input, send } = composeUi();
    if (!input || !send) return;
    const empty = !input.value.trim();
    send.disabled = composerState.submitting || composerState.uploading || empty;
  }

  async function submitReplyViaApi(raw, replyToPostNumber) {
    const body = { raw, topic_id: Number(chatState.topicId) };
    if (replyToPostNumber) body.reply_to_post_number = Number(replyToPostNumber);
    const response = await fetch("/posts.json", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "X-CSRF-Token": csrfToken(),
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = payload.errors?.[0] || payload.error || `HTTP ${response.status}`;
      throw new Error(err);
    }
    const post = payload.post || payload.created_post || payload;
    if (!post || (!post.id && !post.post_id)) throw new Error("站点未确认回复");
    return post;
  }

  function imageFile(file) {
    if (!file) return false;
    if (String(file.type || "").toLowerCase().startsWith("image/")) return true;
    return /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(String(file.name || ""));
  }

  async function uploadImageFile(file) {
    const form = new FormData();
    form.append("file", file, file.name || "image");
    form.append("upload_type", "composer");
    form.append("type", "composer");
    form.append("synchronous", "true");
    const response = await fetch("/uploads.json", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "X-CSRF-Token": csrfToken(),
        "X-Requested-With": "XMLHttpRequest"
      },
      body: form
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = payload.errors?.[0] || payload.error || `HTTP ${response.status}`;
      throw new Error(err);
    }
    const upload = payload.upload || (Array.isArray(payload.uploads) ? payload.uploads[0] : null);
    if (!upload) throw new Error("站点未返回图片地址");
    return upload;
  }

  function uploadedImageMarkdown(upload, file) {
    const url = upload.short_url || upload.url || upload.thumbnail_url;
    if (!url) throw new Error("站点未返回图片地址");
    const rawLabel = String(upload.original_filename || file?.name || "图片");
    const label = rawLabel.replace(/\.[^.]+$/, "").replace(/[\[\]\\|]/g, "_");
    const width = Number(upload.thumbnail_width || upload.width) || 0;
    const height = Number(upload.thumbnail_height || upload.height) || 0;
    const dimensions = width > 0 && height > 0 ? `|${width}x${height}` : "";
    const safeUrl = String(url).replace(/[\\()]/g, (char) => `\\${char}`);
    return `![${label}${dimensions}](${safeUrl})`;
  }

  function insertComposerText(text) {
    const { input } = composeUi();
    if (!input || !text) return;
    const start = Number.isInteger(input.selectionStart) ? input.selectionStart : input.value.length;
    const end = Number.isInteger(input.selectionEnd) ? input.selectionEnd : start;
    const before = input.value.slice(0, start);
    const after = input.value.slice(end);
    const prefix = before && !/[\n ]$/.test(before) ? "\n" : "";
    const suffix = after && !/^[\n ]/.test(after) ? "\n" : "";
    input.value = `${before}${prefix}${text}${suffix}${after}`;
    const caret = (before + prefix + text + suffix).length;
    input.setSelectionRange(caret, caret);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus({ preventScroll: true });
  }

  async function uploadComposerFiles(files) {
    const selected = [...(files || [])];
    const images = selected.filter(imageFile);
    if (!selected.length) return;
    if (composerState.uploading) {
      setComposeStatus("已有图片正在上传，请等待完成后重试", "error");
      return;
    }
    if (!images.length) {
      setComposeStatus("请选择图片文件", "error");
      return;
    }
    composerState.uploading = true;
    updateComposeSendState();
    try {
      const markdown = [];
      for (const file of images) {
        setComposeStatus(`正在上传 ${file.name || "图片"}…`, "busy");
        const upload = await uploadImageFile(file);
        markdown.push(uploadedImageMarkdown(upload, file));
      }
      insertComposerText(markdown.join("\n"));
      setComposeStatus(`已添加 ${markdown.length} 张图片`, "success");
    } catch (error) {
      setComposeStatus(`上传失败：${error.message || "未知错误"}`, "error");
    } finally {
      composerState.uploading = false;
      updateComposeSendState();
    }
  }

  function transferImages(event) {
    const transfer = event.clipboardData || event.dataTransfer;
    const files = [...(transfer?.files || [])];
    if (files.length) return files.filter(imageFile);
    const itemFiles = [...(event.clipboardData?.items || [])]
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile?.())
      .filter(Boolean);
    return itemFiles.filter(imageFile);
  }

  function handleComposerPaste(event) {
    const files = transferImages(event);
    if (!files.length) return;
    event.preventDefault();
    event.stopPropagation();
    uploadComposerFiles(files);
  }

  function handleComposerDrop(event) {
    const files = transferImages(event);
    if (!files.length) return;
    event.preventDefault();
    event.stopPropagation();
    uploadComposerFiles(files);
  }

  async function submitComposer() {
    const { input } = composeUi();
    if (!input || !input.value.trim() || composerState.submitting || composerState.uploading) return;
    if (!chatState.topicId) {
      setComposeStatus("请先打开一个话题", "error");
      return;
    }
    composerState.submitting = true;
    updateComposeSendState();
    setComposeStatus("正在发送…", "busy");
    const raw = input.value;
    const replyTo = composerState.replyToPostNumber;
    try {
      try {
        const post = await submitReplyViaApi(raw, replyTo);
        completeComposerSubmission(input, post);
      } catch (apiError) {
        setComposeStatus(`接口发送失败，尝试原生编辑器：${apiError.message || ""}`, "error");
        try {
          await submitNativeReply(raw, replyTo);
          completeComposerSubmission(input);
        } catch (nativeError) {
          setComposeStatus(`发送失败：${nativeError.message || apiError.message || "未知错误"}`, "error");
        }
      }
    } finally {
      composerState.submitting = false;
      updateComposeSendState();
    }
  }

  function completeComposerSubmission(input, post) {
    input.value = "";
    input.style.height = "auto";
    composerState.replyToPostNumber = null;
    hideTargetedReply();
    setComposeStatus("发送成功", "success");
    if (post && (post.post_number || post.postNumber)) {
      chatState.renderedLastNumber = Math.max(
        chatState.renderedLastNumber,
        Number(post.post_number || post.postNumber)
      );
    }
    setTimeout(() => syncNewPostsFromDom(), 400);
    setTimeout(() => syncNewPostsFromDom(), 1200);
  }

  async function submitNativeReply(raw, replyToPostNumber) {
    openNativeComposer(replyToPostNumber);
    const ta = await waitForComposerTextarea();
    if (!ta) throw new Error("无法打开原生编辑器");
    ta.focus();
    ta.value = raw;
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    const submitBtn = document.querySelector(
      "#reply-control .save-or-cancel button.create, #reply-control .save-or-cancel button.btn-primary, #reply-control button.create.btn-primary"
    );
    if (!submitBtn) throw new Error("找不到原生提交按钮");
    submitBtn.click();
  }

  function waitForComposerTextarea(timeoutMs = 5000) {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        const ta = document.querySelector("#reply-control textarea.d-editor-input, #reply-control textarea");
        if (ta) return resolve(ta);
        if (Date.now() - start > timeoutMs) return resolve(null);
        setTimeout(check, 100);
      };
      check();
    });
  }

  function showTargetedReply(postNumber) {
    const { input, target } = composeUi();
    composerState.replyToPostNumber = Number(postNumber) || null;
    if (!target || !composerState.replyToPostNumber) return;
    const message = document.querySelector(`.dingtalk-msg[data-post-number="${postNumber}"]`);
    const name = message?.querySelector(".dingtalk-msg-name")?.textContent?.trim();
    target.querySelector("span").textContent = name ? `回复 ${name} · #${postNumber}` : `回复消息 #${postNumber}`;
    target.classList.add("active");
    input?.focus();
  }

  function hideTargetedReply() {
    const { target } = composeUi();
    composerState.replyToPostNumber = null;
    if (target) target.classList.remove("active");
  }

  function replyToPost(postNumber) {
    showTargetedReply(postNumber);
  }

  /** 临时让原生回复按钮可被程序点击（它们在 height:0 的 outlet 里） */
  function withClickableNativeReplyControls(fn) {
    let style = document.getElementById("dingtalk-temp-reply-click");
    if (!style) {
      style = document.createElement("style");
      style.id = "dingtalk-temp-reply-click";
      style.textContent = `
        html.dingtalk-im-theme.dingtalk-locked #main-outlet #topic-footer-buttons,
        html.dingtalk-im-theme.dingtalk-locked #main-outlet .topic-footer-main-buttons,
        html.dingtalk-im-theme.dingtalk-locked #main-outlet .topic-footer-main-buttons *,
        html.dingtalk-im-theme.dingtalk-locked #main-outlet #topic-footer-buttons *,
        html.dingtalk-im-theme.dingtalk-locked #main-outlet .post-stream article .post-controls,
        html.dingtalk-im-theme.dingtalk-locked #main-outlet .post-stream article .post-controls * {
          visibility: visible !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          pointer-events: auto !important;
          position: relative !important;
        }
        html.dingtalk-im-theme.dingtalk-locked #main-outlet .container.posts,
        html.dingtalk-im-theme.dingtalk-locked #main-outlet .topic-area,
        html.dingtalk-im-theme.dingtalk-locked #main-outlet .post-stream,
        html.dingtalk-im-theme.dingtalk-locked #main-outlet .topic-footer-buttons,
        html.dingtalk-im-theme.dingtalk-locked #main-outlet #topic-footer-buttons {
          visibility: visible !important;
          height: auto !important;
          overflow: visible !important;
        }
      `;
      document.documentElement.appendChild(style);
    }
    try {
      return fn();
    } finally {
      setTimeout(() => {
        document.getElementById("dingtalk-temp-reply-click")?.remove();
      }, 800);
    }
  }

  function clickNativeReplyButton(postNumber) {
    return withClickableNativeReplyControls(() => {
      if (postNumber) {
        const article = document.querySelector(
          `.post-stream article[data-post-number="${postNumber}"], #post_${postNumber}, article[id="post_${postNumber}"]`
        );
        const postReply = article?.querySelector(
          "button.reply, .post-controls button.reply, button.create.reply, .reply.create"
        );
        if (postReply) {
          postReply.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
          return true;
        }
      }
      const topicSelectors = [
        "#topic-footer-buttons button.create",
        "#topic-footer-buttons button.btn-primary.create",
        ".topic-footer-main-buttons button.create",
        ".topic-footer-main-buttons button.btn-primary",
        "button.btn-primary.create.reply",
        "button.create.reply"
      ];
      for (const sel of topicSelectors) {
        const btn = document.querySelector(sel);
        // 避开顶栏「发新帖」
        if (!btn || btn.id === "create-topic" || btn.closest(".d-header")) continue;
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        return true;
      }
      return false;
    });
  }

  function openComposerViaService(postNumber) {
    const owner = getEmberOwner();
    if (!owner) return false;
    const composer = getComposerService(owner);
    if (!composer) return false;
    const topic = getTopicModel(owner);
    const Composer = discourseRequire("discourse/models/composer");
    const REPLY = Composer?.REPLY || Composer?.default?.REPLY || "reply";

    try {
      if (postNumber) {
        const post = findLoadedPost(topic, postNumber);
        if (post && typeof composer.replyTo === "function") {
          composer.replyTo(post);
          return true;
        }
        if (post && typeof composer.open === "function") {
          composer.open({
            action: REPLY,
            post,
            draftKey: topic?.get?.("draft_key") || topic?.draft_key || `topic_${chatState.topicId}`,
            draftSequence: topic?.get?.("draft_sequence") ?? topic?.draft_sequence
          });
          return true;
        }
      }

      if (topic && typeof composer.replyToTopic === "function") {
        composer.replyToTopic(REPLY, topic);
        return true;
      }
      if (topic && typeof composer.open === "function") {
        composer.open({
          action: REPLY,
          topic,
          draftKey: topic.get?.("draft_key") || topic.draft_key || `topic_${chatState.topicId}`,
          draftSequence: topic.get?.("draft_sequence") ?? topic.draft_sequence,
          title: topic.get?.("title") || topic.title,
          categoryId: topic.get?.("category_id") || topic.category_id
        });
        return true;
      }
    } catch (err) {
      console.warn("[linuxdo-dingtalk] composer service open failed", err);
    }
    return false;
  }

  function openComposerViaKeyboard(postNumber) {
    try {
      // Discourse：r = 回复话题；若先聚焦某楼再 r 可带引用——这里做话题级兜底
      if (postNumber) {
        const article = document.querySelector(
          `.post-stream article[data-post-number="${postNumber}"], #post_${postNumber}`
        );
        article?.setAttribute?.("tabindex", "-1");
        article?.focus?.();
      } else {
        document.activeElement?.blur?.();
      }
      const opts = { key: "r", code: "KeyR", keyCode: 82, which: 82, bubbles: true, cancelable: true, view: window };
      document.dispatchEvent(new KeyboardEvent("keydown", opts));
      document.body.dispatchEvent(new KeyboardEvent("keydown", opts));
      return true;
    } catch {
      return false;
    }
  }

  /** 打开 Discourse 原生 composer（必须真正 open，禁止只 focus textarea） */
  function openNativeComposer(postNumber) {
    try {
      flashComposeHint("正在打开编辑器…", "busy");

      if (isComposerOpen()) {
        const ta = document.querySelector("#reply-control.open textarea, #reply-control.fullscreen textarea");
        ta?.focus?.();
        flashComposeHint("编辑器已打开", "busy");
        return true;
      }

      let opened = false;
      try { opened = !!openComposerViaService(postNumber); } catch { /* fall through */ }
      if (!opened) {
        try { opened = !!clickNativeReplyButton(postNumber); } catch { /* fall through */ }
      }
      if (!opened) {
        try { openComposerViaKeyboard(postNumber); } catch { /* fall through */ }
      }

      // 最后手段：短暂解锁 LOCK，再试一次
      setTimeout(() => {
        if (isComposerOpen()) {
          flashComposeHint("编辑器已打开", "busy");
          return;
        }
        const root = document.documentElement;
        const hadLock = root.classList.contains(LOCK_CLASS);
        const unlock = document.createElement("style");
        unlock.id = "dingtalk-unlock-for-reply";
        unlock.textContent = `
          html.dingtalk-im-theme.dingtalk-locked #main-outlet-wrapper,
          html.dingtalk-im-theme.dingtalk-locked #main-outlet,
          html.dingtalk-im-theme.dingtalk-locked #main-outlet > * {
            pointer-events: auto !important;
            visibility: visible !important;
            height: auto !important;
            overflow: visible !important;
          }
          html.dingtalk-im-theme #reply-control {
            display: block !important;
            pointer-events: auto !important;
            z-index: 600 !important;
          }
        `;
        document.documentElement.appendChild(unlock);
        if (hadLock) root.classList.remove(LOCK_CLASS);
        try {
          if (!openComposerViaService(postNumber) && !clickNativeReplyButton(postNumber)) {
            openComposerViaKeyboard(postNumber);
          }
        } catch { /* ignore */ }
        setTimeout(() => {
          if (hadLock) root.classList.add(LOCK_CLASS);
          document.getElementById("dingtalk-unlock-for-reply")?.remove();
          if (isComposerOpen()) {
            flashComposeHint("编辑器已打开", "busy");
          } else {
            flashComposeHint("打开失败：请点右上角「原生视图」回复", "error");
            console.warn("[linuxdo-dingtalk] openNativeComposer failed", {
              topicId: chatState.topicId,
              postNumber,
              hasOwner: !!getEmberOwner(),
              hasComposer: !!getComposerService(getEmberOwner())
            });
          }
        }, 250);
      }, 180);

      return true;
    } catch (err) {
      console.warn("[linuxdo-dingtalk] openNativeComposer crashed", err);
      flashComposeHint(`打开失败：${err && err.message ? err.message : "未知错误"}`, "error");
      return false;
    }
  }

  const TIME_SEP_GAP = 10 * 60 * 1000;

  function readLastReadMap() {
    try {
      return JSON.parse(localStorage.getItem(LAST_READ_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function rememberTopicPost(topicId, postNumber) {
    const id = Number(topicId);
    const n = Number(postNumber) || 0;
    if (!id || n < 1) return;
    const map = readLastReadMap();
    map[id] = n;
    const keys = Object.keys(map);
    if (keys.length > LAST_READ_MAX_TOPICS) {
      for (const key of keys.slice(0, keys.length - LAST_READ_MAX_TOPICS)) delete map[key];
    }
    try {
      localStorage.setItem(LAST_READ_KEY, JSON.stringify(map));
    } catch { /* ignore quota */ }
  }

  function getRememberedPost(topicId) {
    return Number(readLastReadMap()[topicId]) || 0;
  }

  function scrollChatToPost(body, postNumber) {
    if (!body || !postNumber) return false;
    const el = body.querySelector(`.dingtalk-msg[data-post-number="${postNumber}"]`);
    if (!el) return false;
    const delta = el.getBoundingClientRect().top - body.getBoundingClientRect().top;
    body.scrollTop = Math.max(0, body.scrollTop + delta);
    return true;
  }

  function visibleTopicPosts(body) {
    if (!body) return [];
    const rect = body.getBoundingClientRect();
    const posts = [];
    for (const msg of body.querySelectorAll(".dingtalk-msg[data-post-number]")) {
      const box = msg.getBoundingClientRect();
      if (box.bottom <= rect.top + 8 || box.top >= rect.bottom - 8) continue;
      const number = Number(msg.dataset.postNumber) || 0;
      if (number) posts.push(number);
    }
    return posts;
  }

  const trackVisibleTopicPost = debounce(() => {
    if (!chatState.topicId) return;
    const body = document.querySelector(".dingtalk-chat-body");
    const visible = visibleTopicPosts(body);
    const postNumber = visible[0];
    if (!postNumber) return;
    rememberTopicPost(chatState.topicId, postNumber);
  }, 220);

  function renderBubbles(posts, myName) {
    const frag = [];
    let lastTime = 0;
    for (const post of posts) {
      if (post.id && (post.actions_summary || []).some((a) => a.id === 2 && a.acted)) {
        likedPosts.add(post.id);
      }
      const t = new Date(post.created_at).getTime();
      if (t - lastTime > TIME_SEP_GAP) {
        frag.push(`<div class="dingtalk-msg-time-sep">${escapeHtml(formatClock(post.created_at))}</div>`);
      }
      lastTime = t;
      frag.push(bubbleHtml(post, myName));
    }
    return frag.join("");
  }

  async function loadTopic(topicId) {
    if (!topicId || chatState.loading) return;
    if (chatState.topicId === topicId) {
      syncListActive();
      return;
    }
    chatState.loading = true;
    chatState.topicId = topicId;
    ensureChatPanel();
    const body = document.querySelector(".dingtalk-chat-body");
    if (body) {
      delete body.dataset.state;
      body.innerHTML = `<div class="dingtalk-chat-loading">加载中…</div>`;
    }
    try {
      const rememberedPost = getRememberedPost(topicId);
      let data;
      let scrollToPost = 0;
      if (rememberedPost > 1) {
        try {
          data = await api(`/t/${topicId}/${rememberedPost}.json`);
          scrollToPost = rememberedPost;
        } catch {
          data = await api(`/t/${topicId}.json`);
        }
      } else {
        data = await api(`/t/${topicId}.json`);
      }
      if (chatState.topicId !== topicId) return; // 路由已切走
      let posts = (data.post_stream && data.post_stream.posts) || [];
      // 登录态下 Discourse 的窗口可能锚定在「上次阅读处」；按 IM 观感固定从第 1 楼开始展示
      if (
        !scrollToPost &&
        posts.length &&
        Number(posts[0].post_number) !== 1 &&
        Array.isArray(data.post_stream?.stream)
      ) {
        const headIds = data.post_stream.stream.slice(0, 20);
        if (headIds.length) {
          try {
            const qs = headIds.map((id) => `post_ids[]=${id}`).join("&");
            const headData = await api(`/t/${topicId}/posts.json?${qs}`);
            const headPosts = sortPostsByStream(
              (headData.post_stream && headData.post_stream.posts) || headData.posts || [],
              headIds
            );
            if (headPosts.length) posts = headPosts;
          } catch { /* 取不到头部时保留原窗口 */ }
        }
      }
      chatState.stream = (data.post_stream && data.post_stream.stream) || posts.map((p) => p.id);
      chatState.renderedFirstIdx = chatState.stream.indexOf(posts.length ? posts[0].id : -1);
      if (chatState.renderedFirstIdx < 0) chatState.renderedFirstIdx = 0;
      const lastLoadedId = posts.length ? posts[posts.length - 1].id : -1;
      chatState.renderedLastIdx = chatState.stream.indexOf(lastLoadedId);
      if (chatState.renderedLastIdx < 0) {
        chatState.renderedLastIdx = chatState.renderedFirstIdx + Math.max(posts.length - 1, 0);
      }
      chatState.renderedLastNumber = posts.reduce((m, p) => Math.max(m, p.post_number), 0);
      chatState.hasOlder = chatState.renderedFirstIdx > 0;
      chatState.hasNewer = chatState.renderedLastIdx >= 0 &&
        chatState.renderedLastIdx < chatState.stream.length - 1;
      chatState.title = data.title || "";

      const panel = document.querySelector(".dingtalk-chat-panel");
      if (panel) panel.dataset.empty = "0";
      const title = document.querySelector(".dingtalk-chat-title");
      const sub = document.querySelector(".dingtalk-chat-sub");
      if (title) title.textContent = chatState.title;
      const participants = data.participant_count ||
        (data.details && data.details.participants ? data.details.participants.length : 0);
      const count = document.querySelector(".dingtalk-chat-count");
      if (count) {
        if (participants) {
          count.style.display = "";
          count.innerHTML = `${ICONS.users}${participants}`;
        } else {
          count.style.display = "none";
          count.textContent = "";
        }
      }
      const replyTotal = data.posts_count || posts.length;
      if (sub) sub.textContent = `归属于 linux.do · ${replyTotal} 条回复`;
      document.title = `${chatState.title} - Linux DO`;

      // composer 输入区占位：发送给 {话题标题}
      const composeBtn = document.querySelector(".dingtalk-chat-compose");
      const composeLabel = composeBtn?.querySelector("span");
      if (composeBtn && composeLabel) {
        delete composeBtn.dataset.defaultLabel;
        composeLabel.textContent = chatState.title ? `发送给 ${chatState.title}` : "点击回复，打开原生编辑器…";
      }

      const chatAvatar = document.querySelector(".dingtalk-chat-avatar");
      if (chatAvatar) {
        chatAvatar.style.display = "";
        const op = posts.find((p) => p.post_number === 1) || posts[0] || null;
        const authorName = userDisplayName(op, (op && op.username) || chatState.title || "?");
        if (!isMaskAvatar() && op && op.avatar_template) {
          chatAvatar.style.background = "transparent";
          chatAvatar.innerHTML = `<img src="${escapeHtml(fullAvatarUrl(op.avatar_template))}" alt="" loading="lazy">`;
        } else {
          chatAvatar.style.background = avatarColor(authorName);
          chatAvatar.textContent = avatarLetter(authorName);
        }
      }
      loadCategories().then(() => {
        if (chatState.topicId !== topicId) return;
        const cat = data.category_id ? categoryById(data.category_id) : null;
        const chipsBox = document.querySelector(".dingtalk-chat-chips");
        if (chipsBox) {
          chipsBox.innerHTML = cat
            ? `<a class="dingtalk-chat-chip" href="/c/${escapeHtml(cat.slug)}/${cat.id}"><span class="dingtalk-nav2-cat-dot" style="background:#${escapeHtml(cat.color || "8F959E")}"></span>${escapeHtml(cat.name)}</a>`
            : "";
        }
        if (cat && sub) sub.textContent = `归属于 ${cat.name} · ${replyTotal} 条回复`;
      });

      if (body) {
        body.innerHTML = renderBubbles(posts, getCurrentUsername()) ||
          `<div class="dingtalk-chat-empty">${ICONS.msg}<div>暂无消息</div></div>`;
        if (scrollToPost) {
          requestAnimationFrame(() => scrollChatToPost(body, scrollToPost));
        } else {
          body.scrollTop = 0; // 从第一条消息看起
        }
      }
      syncListActive();
    } catch (err) {
      renderChatError(`话题加载失败（${err && err.message}），可能无权限或已被删除`);
    } finally {
      chatState.loading = false;
    }
  }

  function sortPostsByStream(posts, ids) {
    const order = new Map(ids.map((id, i) => [id, i]));
    return posts.slice().sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }

  /** 向上滚动加载更早的帖子 */
  async function loadOlderPosts() {
    if (!chatState.hasOlder || chatState.loading || !chatState.topicId) return;
    const ids = chatState.stream.slice(Math.max(0, chatState.renderedFirstIdx - 20), chatState.renderedFirstIdx);
    if (!ids.length) return;
    chatState.loading = true;
    const body = document.querySelector(".dingtalk-chat-body");
    try {
      const qs = ids.map((id) => `post_ids[]=${id}`).join("&");
      const data = await api(`/t/${chatState.topicId}/posts.json?${qs}`);
      const posts = sortPostsByStream(
        (data.post_stream && data.post_stream.posts) || data.posts || [],
        ids
      );
      chatState.renderedFirstIdx = Math.max(0, chatState.renderedFirstIdx - ids.length);
      chatState.hasOlder = chatState.renderedFirstIdx > 0;
      if (body && posts.length) {
        const prevHeight = body.scrollHeight;
        body.insertAdjacentHTML("afterbegin", renderBubbles(posts, getCurrentUsername()));
        body.scrollTop += body.scrollHeight - prevHeight;
      }
    } catch { /* 保留现状 */ } finally {
      chatState.loading = false;
    }
  }

  /** 向下滚动加载更新的帖子（话题很长时不能只留首屏一页） */
  async function loadNewerPosts() {
    if (!chatState.hasNewer || chatState.loading || !chatState.topicId) return;
    const start = chatState.renderedLastIdx + 1;
    if (start <= 0 || start >= chatState.stream.length) {
      chatState.hasNewer = false;
      return;
    }
    const ids = chatState.stream.slice(start, start + 20);
    if (!ids.length) {
      chatState.hasNewer = false;
      return;
    }
    chatState.loading = true;
    const body = document.querySelector(".dingtalk-chat-body");
    try {
      const qs = ids.map((id) => `post_ids[]=${id}`).join("&");
      const data = await api(`/t/${chatState.topicId}/posts.json?${qs}`);
      const posts = sortPostsByStream(
        (data.post_stream && data.post_stream.posts) || data.posts || [],
        ids
      );
      chatState.renderedLastIdx = start + ids.length - 1;
      chatState.hasNewer = chatState.renderedLastIdx < chatState.stream.length - 1;
      if (posts.length) {
        chatState.renderedLastNumber = posts.reduce(
          (m, p) => Math.max(m, p.post_number || 0),
          chatState.renderedLastNumber
        );
      }
      if (body && posts.length) {
        // 去掉可能的底部状态占位后追加
        body.insertAdjacentHTML("beforeend", renderBubbles(posts, getCurrentUsername()));
      }
    } catch { /* 保留现状 */ } finally {
      chatState.loading = false;
    }
  }

  /** 发帖后：原生隐藏流里出现的新帖 → 追加为气泡 */
  function syncNewPostsFromDom() {
    if (!chatState.topicId) return;
    const articles = document.querySelectorAll(".post-stream article.topic-post");
    if (!articles.length) return;
    const body = document.querySelector(".dingtalk-chat-body");
    if (!body || body.querySelector(".dingtalk-chat-loading")) return;
    const myName = getCurrentUsername();
    let appended = false;
    for (const article of articles) {
      const number = Number(
        article.dataset.postNumber || (article.id || "").replace("post_", "")
      );
      if (!number || number <= chatState.renderedLastNumber) continue;
      if (body.querySelector(`[data-post-number="${number}"]`)) {
        chatState.renderedLastNumber = Math.max(chatState.renderedLastNumber, number);
        continue;
      }
      const cooked = article.querySelector(".cooked");
      if (!cooked) continue;
      const username =
        article.querySelector(".topic-meta-data .username a, .names .username a")?.textContent.trim() ||
        myName || "?";
      const fullName =
        article.querySelector(".topic-meta-data .full-name, .names .full-name")?.textContent.trim() || username;
      const avatarImg = article.querySelector(".topic-avatar img, .post-avatar img");
      const timeEl = article.querySelector(".post-info .relative-date, .relative-date");
      const mine =
        article.classList.contains("current-user-post") ||
        !!article.querySelector(".current-user-post") ||
        normalizeUsername(username) === normalizeUsername(myName);
      const post = {
        post_number: number,
        username,
        name: fullName,
        avatar_template: avatarImg ? avatarImg.src.replace(/\/\d+\//, "/{size}/") : "",
        cooked: cooked.innerHTML,
        created_at: (timeEl && (timeEl.getAttribute("title") || timeEl.dataset.time)) || new Date().toISOString(),
        yours: mine
      };
      body.insertAdjacentHTML("beforeend", bubbleHtml(post, myName));
      chatState.renderedLastNumber = Math.max(chatState.renderedLastNumber, number);
      appended = true;
    }
    if (appended) body.scrollTop = body.scrollHeight;
  }

  /* ============================== 原生视图切换 ============================== */

  function ensureModeFab() {
    let fab = document.querySelector(".dingtalk-mode-fab");
    if (getViewMode() !== "native") {
      fab?.remove();
      return;
    }
    if (fab) return;
    fab = document.createElement("button");
    fab.className = "dingtalk-mode-fab";
    fab.title = "切回钉钉 IM 视图";
    fab.innerHTML = ICONS.chat;
    fab.addEventListener("click", () => {
      setViewMode("im");
      location.reload();
    });
    document.body.appendChild(fab);
  }

  /* ============================== 编排 ============================== */

  function removePanels() {
    closeNotifMenu();
    document.querySelector(".dingtalk-list-panel")?.remove();
    document.querySelector(".dingtalk-chat-panel")?.remove();
    document.querySelector(".dingtalk-rail")?.remove();
    document.querySelector(".dingtalk-rail-resizer")?.remove();
    document.querySelector(".dingtalk-list-resizer")?.remove();
    document.querySelector(".dingtalk-strip")?.remove();
    document.querySelector(".dingtalk-titlebar")?.remove();
  }

  function applyTheme() {
    if (otherThemeActive()) {
      console.warn("[linuxdo-dingtalk] 检测到 IDEA / 飞书主题脚本已启用，钉钉主题自动避让。请只保留其中一个。");
      document.documentElement.classList.remove(ROOT_CLASS, DARK_CLASS, LOCK_CLASS, "dingtalk-topic-open");
      removePanels();
      return;
    }

    // 按脚本深色偏好强制站点明暗（含切回原生布局）
    applyColorMode();
    forceSiteScheme();

    if (getViewMode() === "native") {
      document.documentElement.classList.remove(ROOT_CLASS, DARK_CLASS, LOCK_CLASS, "dingtalk-topic-open");
      removePanels();
      ensureModeFab();
      return;
    }

    injectStyle();
    document.documentElement.classList.add(ROOT_CLASS);
    applyColorMode();
    document.documentElement.classList.toggle("dingtalk-nav2-open", isNav2Open());
    restyleSplash();
    makeFavicon();
    ensureModeFab();
    if (!document.body) return;

    ensureTitlebar();
    ensureRail();
    ensureStrip();
    ensureRailResizer();
    applyRailWidth(getRailWidth());

    const pathname = location.pathname;
    const isTopic = isTopicPath(pathname);
    const isHome = isHomePath(pathname);
    const supported = isTopic || isHome;

    document.documentElement.classList.toggle(LOCK_CLASS, supported);
    document.documentElement.classList.toggle("dingtalk-topic-open", isTopic);

    if (!supported) {
      // rail 常驻，展开栏为原生侧栏；仅移除中右栏
      document.querySelector(".dingtalk-list-panel")?.remove();
      document.querySelector(".dingtalk-chat-panel")?.remove();
      return;
    }

    ensureListPanel();
    ensureChatPanel();
    ensureListResizer();
    applyListWidth(getListWidth());
    syncListNav();

    if (isTopic) {
      // 进帖子：保留当前会话列表，只更新选中态 + 加载右栏
      if (listState.topics.length && listState.apiPath) {
        syncListActive();
      } else {
        loadList(listState.apiPath || "/latest.json", false);
      }
      loadTopic(topicIdFromPath(pathname));
      syncNewPostsFromDom();
    } else {
      loadList(listApiForPath(pathname), false);
      renderChatEmpty();
    }
    syncListActive();
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyTheme();
    });
  }

  const scheduleSyncNewPosts = debounce(syncNewPostsFromDom, 600);

  function bootstrap() {
    if (!document.documentElement) {
      setTimeout(bootstrap, 0);
      return;
    }
    injectStyle();
    if (!otherThemeActive()) {
      // document-start 尽早按偏好锁明暗，减少闪一下
      applyColorMode();
      forceSiteScheme();
    }
    if (getViewMode() !== "native" && !otherThemeActive()) {
      document.documentElement.classList.add(ROOT_CLASS);
      applyColorMode();
      restyleSplash();
      makeFavicon(); // document-start 尽早换标，减少未聚焦标签仍显示原 icon
    }

    // 标签重新可见时再刷一次（部分浏览器未聚焦时会缓存旧 favicon）
    if (!window.__dingtalkFaviconVisibilityBound) {
      window.__dingtalkFaviconVisibilityBound = true;
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && getViewMode() !== "native" && !otherThemeActive()) {
          makeFavicon();
        }
      });
    }

    const DINGTALK_UI_SEL = ".dingtalk-list-panel, .dingtalk-chat-panel, .dingtalk-rail, .dingtalk-strip, .dingtalk-titlebar, .dingtalk-mode-fab, #linuxdo-dingtalk-theme";
    const observer = new MutationObserver((mutations) => {
      // 忽略我们自己面板内部的 DOM 变动，否则点开筛选会立刻触发 applyTheme 回写/闪断
      const external = mutations.some((m) => {
        const t = m.target;
        if (!(t instanceof Element) && !(t instanceof CharacterData)) return true;
        const el = t instanceof Element ? t : t.parentElement;
        if (!el) return true;
        if (el.closest(DINGTALK_UI_SEL)) return false;
        if (el.id === "linuxdo-dingtalk-theme") return false;
        return true;
      });
      if (external) scheduleApply();
      scheduleSyncNewPosts();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    for (const method of ["pushState", "replaceState"]) {
      const original = history[method];
      history[method] = function (...args) {
        const result = original.apply(this, args);
        scheduleApply();
        return result;
      };
    }
    window.addEventListener("popstate", scheduleApply);
    window.addEventListener("hashchange", scheduleApply);
    document.addEventListener("DOMContentLoaded", scheduleApply, { once: true });
    document.addEventListener("turbo:load", scheduleApply);
    document.addEventListener("page:changed", scheduleApply);

    // 定时同步头像通知角标（currentUser 未读数会变）
    if (!window.__dingtalkNotifBadgeTimer) {
      window.__dingtalkNotifBadgeTimer = setInterval(() => {
        if (getViewMode() === "native" || otherThemeActive()) return;
        if (!document.querySelector(".dingtalk-rail")) return;
        syncRail();
      }, 15000);
    }

    // ⌘/Ctrl+K → 最左栏搜索（再同步原生 welcome-banner）
    window.addEventListener("keydown", (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      if ((e.key || "").toLowerCase() !== "k") return;
      if (getViewMode() === "native" || otherThemeActive()) return;
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "TEXTAREA" || (tag === "INPUT" && e.target.type !== "search")) return;
      e.preventDefault();
      e.stopPropagation();
      ensureTitlebar();
      const input = document.querySelector(".dingtalk-titlebar input");
      if (input) {
        input.focus();
        input.select();
      }
    }, true);

    scheduleApply();
  }

  bootstrap();
})();
