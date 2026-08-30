// ==UserScript==
// @name         Linux DO · 飞书 IM 外观
// @namespace    https://linux.do/
// @version      0.3.0
// @description  飞书风格的 LinuxDo
// @author       czm15053
// @match        https://linux.do/*
// @icon         https://linux.do/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  /* ============================== 常量 ============================== */

  const STYLE_ID = "linuxdo-feishu-theme";
  const FAVICON_ID = "feishu-favicon";
  const ROOT_CLASS = "feishu-im-theme";
  const DARK_CLASS = "feishu-dark";
  const LOCK_CLASS = "feishu-locked"; // 仅三栏路由挂载：隐藏原生主内容
  const VIEW_KEY = "linuxdo-feishu-view"; // "im" | "native"
  const DARK_KEY = "linuxdo-feishu-dark"; // "1" = 深色
  const LAST_READ_KEY = "linuxdo-feishu-last-read";
  const LAST_READ_MAX_TOPICS = 200;

  const RAIL_WIDTH = 230; // 最左常驻栏（像素级复刻飞书文字导航，纯装饰）
  const NAV2_WIDTH = 240; // 展开栏（原生侧栏原样搬入，默认收起）
  const STRIP_WIDTH = 48; // rail 与中栏之间的窄图标条（假 icon，纯装饰）
  const LIST_WIDTH = 360; // 中栏

  const AVATAR_COLORS = [
    "#3370FF", "#14B8A6", "#FF6F39", "#7B61FF",
    "#22C55E", "#00B4D8", "#F59E0B", "#EF4444"
  ];

  /* ============================== 内联 SVG 图标 ============================== */

  const ICONS = {
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 3v6h-6"/></svg>`,
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1L3 20l1.2-5.3A8.5 8.5 0 1 1 21 11.5z"/></svg>`,
    external: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>`,
    list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
    like: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>`,
    reply: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,
    chevronUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>`,
    compose: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    pic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 15l-4-4-6 6"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
    worktable: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="7.5" cy="7.5" r="3.4"/><circle cx="16.5" cy="7.5" r="3.4"/><circle cx="7.5" cy="16.5" r="3.4"/><circle cx="16.5" cy="16.5" r="3.4"/></svg>`,
    cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.5 1.5A4 4 0 0 0 7 19z"/></svg>`,
    wiki: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>`,
    task: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>`,
    contacts: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>`,
    project: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>`,
    more: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><path d="M17 14v6M14 17h6"/></svg>`,
    disguise: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>`,
    moon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 1 0 9.5 9.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    sun: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`
  };

  /* ============================== 内联 SVG 图标：实心版（左侧栏装饰用） ============================== */

  // 最左导航栏与窄图标条是飞书复刻的装饰导航，统一用实心图标；功能按钮继续用上方线性 ICONS，保证小尺寸可读性
  const FILLED_ICONS = {
    chat: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.7 2h2.6v3H6.7zM14.7 2h2.6v3h-2.6z"/><path d="M4 7c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v2H4V7z"/><path d="M4 11h16v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6z"/></svg>`,
    cloud: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`,
    wiki: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 2A2.5 2.5 0 0 0 4 4.5v15a2.5 2.5 0 0 1 2.5-2.5H21V2H6.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H21v5H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>`,
    task: `<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm3.66 6.34a1.15 1.15 0 0 1 0 1.63l-4.05 4.05c-.45.45-1.18.45-1.63 0l-2.14-2.14a1.15 1.15 0 0 1 1.63-1.63l1.32 1.32 3.24-3.24c.45-.45 1.18-.45 1.63 0z"/></svg>`,
    contacts: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zM12 14c4.6 0 8 2.35 8 5.4v.6a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20v-.6c0-3.05 3.4-5.4 8-5.4z"/></svg>`,
    more: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm10 0h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM5 13h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z"/><path d="M17 14v6M14 17h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  };
  /** 导航装饰优先取实心版本，未收录的键回退线性 ICONS */
  const navIcon = (key) => FILLED_ICONS[key] || ICONS[key];

  const FAVICON_URI = "data:image/x-icon;base64,AAABAAEAMDAAAAEAIACoJQAAFgAAACgAAAAwAAAAYAAAAAEAIAAAAAAAACQAABMLAAATCwAAAAAAAAAAAAD///8A////AP///wf///8U////W////4f///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+G////T////yL///8J////AP///wD///8B////D////2n////R////9P////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////9f///+D///92////EP///wH///8N////hv////L////9//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7////z////hv///wr///9T////8f//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8P///zj///+s////+v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+v///6v////x/////v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v////H///////////////////////////////////////////////////////////////////////////////////////39///7+f//+vj///v5///9/P///f3////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9/P//9/P//+/p///s5P//59z//9jI///KtP//ybP//8q0///Xx///2cn//+je///s5P//8uz///f0///+/v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9vL//+vj///VxP//uJr//5Vp//+FUv//cjX//3Az//9wM///cDP//3Az//9wM///cDT//3g+//+GU///onv//7mc///dz///7OP///n3//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Ls///k2f//t5j//4xc//9xNf//bzL//3Ay//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDL//3Az//93Pf//jV3//8Sr///n3P//9/P////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////08P//4dX//6eD//9+SP//cDP//3Ay//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDL//3Az//+FUf//u57//+bc///6+P///////////////////////////////////////////////////////////////////////////////////////////////////v7//+7n//+zk///fkj//3Ay//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wMv//cDP//4ta///Hr///8Or/////////////////////////////////////////////////////////////////////////////////////////////+/n//7KR//9yNv//cDL//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//28y//9xNf//qof//+bc///9/f//////////////////////////////////////////////////////////////////////////////////+PX//41c//9xNf//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//5Zq///Xxv///fz/////////////////////////////////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9xM///cTT//3E0//9xNP//cTT//3Ez//+FT///1MH///z7////////////////////////////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9xM///cDP/92ww/+xmLf/lYyv/32Ap/99gKf/hYSr/6GQs//FpL//+g07//9XD///+/v//////////////////////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9xNP//cTP/9Gov/+hkLP/YXCf/x1Mh/7JIGv+kQRb/mDsS/5c7Ev+cPRT/qEQY/7tNHf/aXSj/74BS///l2f//////////////////////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9vMv//cTP//G4y/+plLP/eXyn/wlAg/6xFGf+YOxL/mDsS/5k7E/+ZPBP/mjwT/5o8E/+aPBP/mTwT/5k7E/+dPRT/uk4f/+GOa//96eD///7+////////////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///bzH//20v//t0Ov/hXib/z1Yj/7BHGv+fPhX/mDsS/5k7E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mTsS/6VDGP/am3///vXy////////////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wM///cDP//28y//9uMP//fET//5pv//i0lf/FfFz/nkch/5g6EP+ZPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8FP+mTyn/6cq+//79/f//////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//3Az//9wMv//bjD//3U6//+VZ///wqj//+3l//7////x5eD/0KSR/6xfPf+ZOhH/mjsS/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+bPhb/t3ZZ//fx7v//////////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///cDP//28y//9yNv//j17//7qd///k2P///////////////////////////+DFt/+4d1v/nEAY/5o7E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/nEAY/9u5qv/9/Pv/////////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//3Az//9wM///bzH//39I//+ujP//28z////////////////////////////////////////////v4Nr/w4xw/51FGP+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mz4V/7BmRv/37+v////+////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///cDP//28y//9uMP//kmP//8my///39P////////////////////////////////////////////////////7/5OOn/6yJE/+cRRL/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5xBGf/Ztqb//fz7////////////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9wM///bzL//3g///+vjf//3tD//////////////////////////////////////////////////////////v/5/Ov/zeNL/7jOBf+qign/nEUS/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5s+Ff+uY0L/9u7q/////v//////////////////////////////////+PX//4hV//9xNP//cDP//3Az//9vMf//gkz//7uf///49f////////////////////////////////////////////////////////////7+/P/f7Iv/vNgL/7nWAP+3zgH/qowJ/5xGEv+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+cQBj/17Kh//38+///////////////////////////////////+PX//4hV//9xNP//cDP//3Ay//+SY///z7v///j2/////////////////////////////////////////////////////////////v/9/+31v//B2yD/udYB/7nWAP+51gD/t84B/6uPCf+cRhL/mjsT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+bPhX/rWA///bv6/////7/////////////////////////////+PX//4hV//9xNP//cDP//5lt///dzv////////////////////////////////////////////////////////////////////7/+fzp/83iSf+61gL/udYA/7nWAP+51gD/udYA/7fOAf+rkQj/nUsR/5o6E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mz8W/8eUff/9/Pv/////////////////////////////+PX//4hV//9xNP//mm///+LV///////////////////////////////////////////////////////////////////////+//z/3OuB/7vXCf+51gD/udYA/7nWAP+51gD/udYA/7nWAP+4zwH/rp4H/6NoDf+bPxL/mjoT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/5o8E/+aPBP/mjwT/6BHIf/fwbT//vz8////////////////////////+PX//4hV//+dc///49f//////////////////////////////////////////////////////////////////////////f/n8af/wNob/7nWAf+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udQA/7S7BP+vmhH/o2kN/5o/D/+YNw3/mDgO/5k5D/+ZOhD/mToQ/5k5D/+YOA7/mDgO/6BHIf/CinH/+PHu/////v//////////////////+/r//8Cm///m3P///////////////////////////////////////////////////////////////////////v/9/+31wP/F3Sv/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nYAP+61gb/tb0H/8GtS//JmH7/vYBl/7VvUf+wZ0j/sGdI/7VvUf+9gGX/ypmE/9/BtP/p1Mv//Pj3/////////////////////////v7///bz//////////////////////////////////////////////////////////////////////////7/9vnd/8vhRP+51gH/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/vNkI/+XyoP/38uv/8uXg/+3c1f/q2ND/6tjQ/+3c1f/y5eD/+fLw///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4++f/0uRb/7vXBv+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/vtkU//f64f////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////j75v/S5V3/u9gK/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+61wX/0+Vg//3+9///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+Pvl/9HkWf+71wn/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+82An/8PbJ//7//f///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v/3++T/0ORW/7vXCf+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7rXBP/Q41b//P3z//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////f74//P41L/u9cI/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYB/77aFf/w98r//v/9///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+//3/7fW//8vgQv+71wf/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/u9cG/9jpdP/9/vb///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7++//j75n/xNwn/7rWAv+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+61gP/yN85//f64f////7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7/+vzr/9jocv/A2hn/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAP+51gD/udYA/7nWAf/D2yL/8PfI/////f///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////f75/+z0uv/l75//5e+f/+Xvn//l75//5e+f/+Xvn//l75//5e+f/+Xvn//l75//5e+f/+Xvn//l75//5e+f/+Xvn//l75//5e+f/+bwov/1+dn//v/8//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////3++f/9/vf//f73//3+9//9/vf//f73//3+9//9/vf//f73//3+9//9/vf//f73//3+9//9/vf//f73//3+9//9/vf//f73//3+9//////////////////////////////////////////////////////////////////////////////////////////////////////x/////v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v////H///+s////+v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+v///6z///85////8P//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8f///1L///8K////hf////P////+//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////3////y////hf///w3///8B////EP///3b////g////9f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////+f////n////5////9f///9L///9o////D////wH///8A////AP///wn///8i////T////4b///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+J////if///4n///+H////W////xT///8H////AP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

  /* 置顶头像：5 个群组图标（原图提取，128px PNG） */
  const PIN_AVATARS = [
    "data:image/png;base64,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",
    "data:image/png;base64,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",
    "data:image/png;base64,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",
    "data:image/png;base64,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",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAARGVYSWZNTQAqAAAACAABh2kABAAAAAEAAAAaAAAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAACAoAMABAAAAAEAAACAAAAAAEiOBHcAABpmSURBVHgB7V17lBXFmf+qq/veeaOgg/IIoxARRo0aMfGERCKS+FjdPVFjzB/ZkzUbzq6RTYCZIcluMnmsy8wI7mLiLudoXLM5m0TXnKgbNWtUkqPBtyjIQ0AggAzgEJkZ5nG7q2t/X/dc5s7jzvR99x1vHS5973R1ddX3/eqrr7766itBEzStXavLiXona61rhaqY6hDVCu2eq4W4SGg6mwSdSSSq/ebrLlzb8dlNWr+qhfG2SXREy57DQogjp55a3vHlL4u+iUgqMREa1dJytNo0J80hRedrkheScOfjWkeaphLpGikNJL+lrkvEH04Ah3cFk70r50nMp5RCTqMTQDlsCLVHa7FNSLUJmTdbVtfuZcum4F5xp6IEwIPNOnKwwj7PFfJTrtaLhCE+QlrMNE0hmZfMYObtcEanyqpEYHC5DA4u13G0wu/9rnbfMEhsMEz1h+PHrS3NzSKW6jsKnb9oANDcvKessnLGxyG+rychF4Nw8y1LmMwQpXzGxHt0ronKwGBASAnZgGvM1o7QehsZ7u+0dh6NRss2Llsm+nNdj2yUH3oA3Hmnni+E+3n08M9BBJ9vWT7D/V7ui/BsECKTMhgQLB0YELbNoHA3Y/j5lZDGQ8uXi7cyKTvXz4YSAOvXa6uzU12FoftW7dIS0xIV3Mv5g76ea5pkWL7wgMBgcGzdIwx6SpO4t6qKfrt0qQA8wpVCBYDm5ncrqqpqbxDauB3j+gLuVQ7U93yJ9myzhiWDienEgLR6Ccrpv7vuew81NJxxItvvSre8UABg3e06GpulIOaN5VKKC7kxzPjw93auY5DkA4H1BVfpN11y13Z3y5+HQWksOADWrNHXoIv/kzTEx11PoQu7iA/C8OR5AHBPcdSu3qhd94crGs3Hk+fO/Z2CAaClRc+VUjUbQt4MUS9se2IzfjgrMWXF0MBtdn/pKOe7TU1lO4bnycfvvAPgq+tfsc45ftHXDCG+LS0xxcbMWYdescsVKwRZEU9Z7BCk7+g6Yfwo38NCXgGwenV/vWXKu6SUS1ij93tArohbPOUahq8jOEo/LWzxD8tX5W/qmDcAtLU5twphtJgSvf4DJu6DQhGGLVYSO5R2mxoazPuCPpdJvpwDYN06XWP3u3ca0vhbng6Vev3Y7GJpwNNf5bj3RsqMFbAo5nS9IacAaGnpg6Jn3g+xf1nMs5J/sBS9sVk91l1BEegGtqM3KtX95aammpwpiDkDALT8T1uSfmpImlES+WMxO/k9f0ig/bZy/rqpyXo2ec7070DYZD/d2dp/iyX1ozB8lJifAXm544CGMy1pPtK2uv+LGRSV9NGsA6B1tbrNkNYDqHoVtNqkLy7dCEYBpiGoWC0t6z9bW9VtwZ4KniurQ0Dbar3cjNCdmOJhdbTE/OBsGD8nrytggUk7ilY2NIi14z8RLEfWANDWBubLEvODkT29XLkAQVYA0Lo6dptpWXdjmlfq+enxNvBTcRAo2/3ayiZ5T+AHk2TMGACtrT23mLLsAdcVVknsJ6Fylv/MIDAMbSvX/lJDQ/QXmRSfEQDa2uxF0pCPwVOnqmTgyYQNqT/LBiOsH3QrLa6DTrAh9RL8J9KeBdxxR+c5ksz/QjVKzE+X+hk853U4IaoMoX+2Zk3nOekWlRYAmps7aiJWxU8Nk2aUpnrpkj7z5xSmiPAvmK7dip82N+uadEpMCwCV5ZPWWpb8WMnClw7Js/sM84B5UVHhrkmn5JR1gNZW529g278PvvHpvK/0TI4o4DmYOOpWeBj9JJVXpAQA2PfnmVI/B8fnySWlLxUy5z4vK4VwrTnmKHthU1N0W9A3Bh4C1q3bGcX2qHsw5pSYH5S6eczHHZJ5I4S8m93qg746MABifbP+HmPNotK4H5S0+c/HvIlYcnHn+3bgNYNAQwB22s7RSr+IpalS788/X1N6oz8U0DHl9n+8sbFs53gPB5IArqPuwO6cEvPHo2YI7vNQgM0ok0nLfw5SnXElQGurfZUp5W+wwhcILEFeWsqTewpg5RD9Vl3b2Gg9OdbbxmQqjAsRg+T3YHseM99YLyjdKwwFmGew0n4fPpnRsWowJmMrKuwvYH55aWnOPxYJw3mPeQalfUGsV904Vg2TDgHrm3VFV4X7Erx569nkWCzJ9zwevqEUq2e8giY9F6tiaUrG9YQLPhxL3c2mZXwM29R7RysQe1dHT11V6iaM/fXFMu3zt467VFOj6PRaTZNPNai8AvjWgnp6XOo4pujoEYO6urAPDSMab9+e6InXaSzLOB+6wA1o689Ga++oEoDH/spy/Tw0/0vCLv7hh4C9pYpmznTooosNmjVLUgUzHoulQ5Om7m6X3nlH0aZNmt49aAIEDIahuSbaL4k9iI7tvtbTu/2y5ub6ESFsRpUAlWVqiTRl6JmvsIW8sipGn7pc0HnnReAkMRY3BVVVSbrgAknzEULqtddj9MfnDIr1mxgaJhrbB9ujoAtAj7u4smzuEvz1N4N3/G+jK4GGsZR3p4Q5MfNPO92mz3/eAFOtcZg/tCW8cHLpgijdAMFYXWMPRB4Zmmci/fI6hkFLR2vTiC5zV0v/PGVYr0KElofVxYuDt50Cxt10s6TJkzPrvocOOfTQQy719TKIRiNR8f+NXcigDPViE/7FK1dGtye2aESTbWF8ATtSQst89jY3pUOfvVpkzHwmxJlnmnTlEiYQUDVBE3dk5qnrGrcMb+IQAHAoNoOMG3yNenjWcPxmpfQjF7pUVxd4wWvcis+fZ9Hcuc5AWJpxsxdlBuYpJsI33t+syxIbMAQAVVUzLoX9aH5YAQDnU6qsVLTgklF118R2pfz90ksleglHpEr50aJ4gHkKXWDe0Yq+jyVWeAgAYET5KyhIkIfhpAIrfnV1miadktm4n0iA+PczzpQ0fbomhWnlxEzebAABCMy/TGzfSQDcfvvOKPj+mbD2fq/SQlHdWYnVz953VpRmoWzFpsSAiSUSf4olecOAYSxh5554nU8CoG7arPkI2DQ3zACwLE21tdnv/XFiTK1FqBY5NgCYPggACQOSg/g+McyxYwh64SJCqMY1XlI4rz5vxbn2iVnz4zU8OZi6prw8gti7sVg4xT9r/5GohpXvJGbjbcjatbIKGzBBERgWRxgSfebC4vghFwoj0bRpBpWVc6Qvos7jmvbudWj7dkHH3zfZ8JK1OmW3IPYYAo8FXY5yX+eyTwIANvNFYd/Qi7WNnM7VTVgSsdGCoGoMMSS7AER5pU1XXEE0DzOG4RbHKZOJzjrLpAULFD33nE1vvAHrItYbWJsKW/K6tzYWoV7/ynXzuhPH2wfuLwqz+OfKKiVyarVzHMTwhEdNIuO4h1dW2bAaGlRfP7a5mU3NV10VoYWfUN6wwHUOWxoYBi70eT4AANM8bQ6UoOlhlgDMlH6EWj6BBZ1cpU6EY7Kdod0WntBgqoDIHxSWY79f0CcWRmh+PdsVvP42dvY832VAYzV0unfABt7tSQCt7Qswbsmwmn7jNHLAnEPtuQPAoUNQ5PSgksnxiufOUzR7TupGp4ULTSxHK8wS4rUPy9XzGTQRaeICrpEPACUvTBR7Yanq8HrASknv7B7+1+z8ZqeXvXsR8z9BAEhD0QXnDwIilTedCn+E2WfDrsAKZcgS8xrqoBeU2wMAn7HDoiHsiZ049u83qL2d1bTspv1/cujw4UFHEQ2DUGUVTzt9EqX+NkR3+hA/FT7CerwGz7l2Bpw/YBuWs8Inqrh6wxKQG4tJemEji9bsyVYFxW/jRhdGoMHejj95jiWRaLoA4KVmzCqM7NVzGDXS/olDOCACZB3z3jDN3in4ObUYJAC3mA9geHuHpM1bsnf4xisv2fSnfZi/D/KfKYSp4NAZAb8/lcQhHIZOKFN5Ond5GdyoWm0NeG+Ul+NcPaGr0daiSQIuPM88LWjvvsxBsH27jbk7tAu4hyUm9g3o6RXU35++CO/q4mllYqkh+Q5eA9zVGrw3bDt6Bg7Vg79s8SCAlRh25XrsEZYG6YPgzTdj9DiOa1DKHDL3ZzbxO7q7cXrkkfS1uP37uaShwOK/FDoxr5nnPu+JTi9GTxiuc2+vSY88KuiZZ2LUfSI4o94/ruiJx/vpyScMzNVhtUsyTislacuW9LowDr2iPZixhNX7mP0gMfM/DSOqgGW7OBODAJui6aUXDUgCh+bNd+gcRC6aMkV6wZZZ0PlJQ5QTHT2qaMcOl7ZtE9TdZY1rs2fmbd/GFkCbUnNA0fT88w5Aye8IL20h8+ex0friUI5TAenGLObFl85Oi/74vKZXXnZpUo1DNZMUReHfxCDo61V0/Lik453sIu0v1gRhDA8DChLit0/CFHyjotNOG6IlJq3hKy/btPlNuJ2HdlGIw/aj8wh9kWhrcXfCC2hONqdVSSmTgxv+bDDe09EowJo/XgMH1BpmJEsLvno5B7JD+Q1UIzbm1EyyafFiAQnDXXqggGFP9/a6mE7a9OrLAIqQI/SKYdkL+pP9H3BwFQ7JFnzAcnElZi7P3Q0MAHySqBV1MNbytG10xgxtna/uKpiV2abAtn/tsgEo+Zydh4Kuzgg98mubzjo7RueeK+iMMySVwYLCdenq0rRvr0tbcEbosY7xh5ah9SngL5ygznCuLpbe75tVFU2e4mIHENHMGYTxnm3uLNaZkEF6tA8StvP34PjG9zoUsRVw3z5B77/PIn7QGsglxpOvKJq0ayfh41IUvgmWxQYpDDH9UCYxtDCIggwt8TILeR3geXWIVZRB8vji3KUZ2P51ySWC6upMMIDH98xSNRbBp6In19cT9ASXdmPb2GuvOnTwoMSQwZ+R5fsM5tkDH27JgIHcwVDCkqgYk4lO0w0doCqsUoAJXYNNIAs/SVSP7V84YDIndC4rZ23fgLePC4cOB1q8CwkxuhbPcibRFzDxO1eOAYEhNtTJ0wG07mIJ0I7PnDDWlv3sZtXZWI9HzJMMdwAFbZ9pGvTRj0a8zaZPPBGjQ++OHNNN08U6gQMQDB1ymOdsZnVsA9NO6UmJ+JASSkBoOswA2AlRNydsy5bsTDFvfoyuvjqSFXEfFADxfLW1Jt14k0H/+2iM3tkTIWtgSsfDUQ32Jtx4k8QeBSiQCRhgAPDvGJzu2AzcDt+FPbsd2n/AgJ5goox46YW/8vAGEu+Sn1nSXI9x7ZPcsLAkZv7Zs226/voIDDqjDMR5qigcKGn2bIMO7Lc9O0J8KtnTY0DbdzAbMKkMughLjcRPNCowbBnwIsJO5HpJZ5/N9gSH3jvKEiIcvoJsO8HO4QcN8D1wVMl80J0dMCdPcdDz0WOswjE/3tZy6AbXXGtSVbV9cmGHtf3duy363dMxr8cnCIH4YwlXzLOnSrr2LyJ03fWaystDtBvZ0DuwCqTeC03vByUFvHAWX2FQdTVr2OFIbFpedDmL90ExGYkI2vKmpF277EDWB27J3HMt+hycSyvhYVxomvP78TlqCKu/HRsb4G9beLWVNf65c9kHLzzMj0Nwfr0F2wMcPSGhBhOvQ8CRJIUYStOnm3QVdjazu1mi/jBYZu6/Ma+Z55bV1W6IXnEE05iuQvOfiRGJOLQAmzR5bh22xHsBuG6GGJQCbCF8912JzxBUjFv1OXAyrT9PYQweN2tuMoC8oHdXb2/0iNHplHfAFnCEFZxCJh77Z8zUdCYMM2FNdXUGTa11hjh6sjFo965BUASt+yULoECW81Qy6BPZy+fxWosjDngPn0DRB6fQvYWep7qgxBy2RhS6ImPQmYNKzZ7D4nOQa0zMAwexvpDwtzGKOHmLVxanTSuMxxCTWAu1l3nv93stthZaAkSiiqbPLLAYOsme5F9moI688BRPPDQcfx+h6GBKTjVNnz4UTKk+n25+5rXQxlZ+3qM4dr+8XghRFG8Aa6RVlRz3J7ziP17XyZMFRLe/CMR/497U1wcHE7iPpZpOOZWfHwRTqs+nm595LaTaxM/7XQ5OtjC+YBQujPLFFarALho+Mj3sqQxOJuX4DJqBsfnDMai3J3VGRmHkyveIx2sAzGtc3mRaewBwnOO78P1AwYYB0C4SwQKKD8dQY4BXA03EKUhceXaxJNw7aiDW8DWFAQfwHhzguQ+ApqbTu2Dk2FRQB8bCCJ+0ODRar7VDGldheAN9HuvXmed8b7DPCXfDaA0bXkBOfhcR80dtPwSC4uCFRZA8HguxIV7VkwCA+P99LObCNFEYbhTmrXEyZHbl0T8t9ue90YgebmvHMNTv4y0+CQDL2sfTgu2FGgb6MCMt5EwkTpDxrrxSGYOL+fB+wnaMVNPhdg4kkT8UMG9Rzx3WXo/XXnVPAmDZsg/3Q599qhAAYOWzo0PS0ffS6kep0j2j/O2HXCwNswPp0GL6oATyzCDIhyORvP02vIdf5WXk/AIAEPi/ZXd/mCHspWEuCuoR7JT5OuCNWqWO6HihqV75bf1wrHxhYww+AEzZ/BEllbryos8LL6DXKrimJVCOmfj6aybt3cMrg+PUHbdj8HQ61mF4wShy5OE2SrO89X8N4P468WZCM+Al21P2YmWFuw3r3XmPFspE3LbVpJrqGH3ik4MeOImVLeR33iT6zDM27dljDWE+18kHMC8KBTNkcX6WIPljvr9FzVV6a3fPgZcS6TgCrne2qu9ZEeM7hQoXpyAep81wEP/fQHAGdrNmScTVzJ9ESiSQbSMsDULHvLVZUzs86PIpshPrkel39l/o73O+37jK+m5iWUMkgHfDMH4OTbEBFqOCRAyXcK9692CEDh7Arj8TZ9V5EGXmFwYAbORRWPHjM4d8l/BE8hXHd7b+gae9Wri/GF7jERKAM7S1uY/CCfI69soNTxq1qnmoXphokF5zESoeAFCPNTSa1w8vYZguG7/trk9c8oz/tbDXuBTI97Wwrc7G2z33M0HrRytrVACcOLHjKcx3Xwvz7tbRGlP620gKsM4CXr5y4oR8auTdRFNwwl0+XUoYzl2FEroJVSl9zZAC3oyD3B/B+WPEiWFc9KgSgG9IGXnYtnHoIFygS6k4KcDu64hs/lb1KfKhZC1ICgA+aRLG2RZGUCkVJwV4BuWS07p0qehJ1oKkAOAHIuXyf2xHvVysc99kjf4g/H1g7H+pp8caMfVLbP+YAFi2TGB9QH8H9u3wG+kTW1X6zmsS8PxX30029sdJNCYAOBOfP+867sNsSSql4qAA88px1MON37SeHK/G4wKAC3CF823s2jk2/KCE8Qov3c8/BZhHmPYdMy3zW0HeHggAjY1lO11l/6AQS8VBGlHKM0gBDnerXeeHUOLZz3PcFAgAXErNKdaPHVs9zWbFUgonBZg3MVttiOzfd0/QGqbEzRacK2xK6zmszk0On6k4aJMnZj5/eNbHDCUWfqNJBN7yH1gCMNmamqLblO02DPeGmZgkLa5WMU+YN6kwn1uYEgD4gcZvmj/Bmv29pVkBUyMcydP6bXUf8ybVGqUMAH5Bd4+xAsuLL5b0gVTJnf38A0u9L57olcvTKT0lHSDxBWvu6DyHItXPwFQ8PZUACYlllL5nRgG29cOx8IC2uxev+FbN2+mUljYA+GVt/6IXSUs/hk1dVSWlMB3yp/8MK32IUdattLquocHakG5JaQ0B8Zc1fFNscFz7q9jharPLVCnlhwLs4sU0Z9pnwnyubUYA4AIaG6M/dx3xdURW1VyxUsotBZjGMMhpLPN+g2mf6dsyBgBXYGWTuMeJ0UquWAkEmbIk+fMe87FGj0BVKxtXyR8nzxn8TlYAwK9rWCXWOjG3BILgtE8p52DPp5UNDWJtSg+PkTnrMru1Vd0GL6K7EHnMKimGY1A+hVuewsdjvmKxn52eH3991gHABbet7v+iNCP/ATW1ujRFjJM6vSu75GFtv1s59tKGVdH/Tq+U5E/lBAD8upYW+9OmlA9grjozXPsLkhMjbHfYyIPtXAdsJb7U1CSezUX9sqYDDK9cU5P1rKO6lzhKbfTNxjnD2vBXT4DfAiFzPOZvtFXsylwxnwmVc66sa9Y1sSq1RhryK3582uLfaZNLhPF4z86cMPBgvUWugFteZy7fl3MAxCvf1uLcikCLLYYUU0pDQpwqQ68DIh+RW0XT8gZx39C7ufmVNwBw9Vev1vWWqf8NesFiPqCiNEvwmcq9nr2tlFJPQdX/xqpVUZw/lp+UMx1gtOqvWiXe6uoW18CGuQKabUdJN/DHegFaOLa7fMfbm67NJ/OZR3mVAImgaGnRc02pvgdr9M3cAzj2zgcpsd8+nO3RaPeXtjKaoejtKET7CwaAeGPXtDrXCMP4R5xcdhnHWZrodgNewvWUPFe/AHfrH6xoFI/HaVGIa8EBwI1ubtaRqip1i0HGciiJFzAQ+PCIQgWF4DdnNw0GlwDANyE6+9rIPvngsrvFyWBN2X1f8NJCAYB4ddva2isN47SbSBt/B9v3peznxkCAvhDPUlRXtt9zVJGB6e/LYPzd3d1HHm5unpZ0r16+GxgqAMQbv369thB9+7MYJb+iXbHEtKiCZw3+0XZhB4Ov0bNWjyXbHiy4P+Xa7n01p8onsUnTjrcxLNdQAiCROGvX6nqtXEgF+pwWxvl8RKs/hQyPZOCeztLKZzpqL/RmfH6ltfHgypVia2J7wvY99ACIE2zdOh3t7++7TAjEuXGNK0HleTCceDHEGBA8SuRrqGCG45/HcL4i7h/OIKetpNXTiCn16IkTB15obj6rL173MF+LBgCJRGSlcVKFfZ4r5KdcEovAhI9AQszE1EoyQ3jMZUDwlVO6wGBGc+LezV/56iuoOFtB6/1a6Dcwhd0AA84fsA17y3g7cb3CQvZfUQJgOA3Xreuose3q2fj7+VrJC+EvNw/i9yz8nort7TUwQSP5T/kKmf89DoxERifmQwRwQMizxR8WOFcJJtqtCBq3ibwDNo7viodc90srzv8nBABGI/399+uyP/+5dwqYXCtUxVRMJmqFds9BV/4o8jNYzgBzcYA8J82x89thFtsFN+tN0DW24/cRKXvAeHGEqPwYR0zhnBMt/T/lfuOIbT6h3AAAAABJRU5ErkJggg=="
  ];

  /* 会话列表装饰头像：飞书卡片彩色图标（取自开放平台图标库） */
  const CHAT_ICONS = [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATfSURBVHgB7VrdbhtFFP42dvMnkhiFpiL8ZKMiICYVMeUCuMG+aROERCKuuIp5gjhPkDUvEOcJ4jwBuYtoL2yJi16U1BYJhLRCcQgtImpFhNXWdmMPZ+x1ZO/Orne9sxZIfDfezM/ufDNnZr5zToD/OBT4hLkECwXphz+fA/l8SjmDD5BOgAY+FwDW6TFqqEpXgSQRKUAipBHgM94HrNELEzbNCoyI3EspSUiCFALXV9kKGDR6DDnsUqAva7vryhY8whOBDxMsSjO6SY8qusM2mdWqF7MKoguQuahk55vMbOdusRhoTOIiuoQrArqdr9AXNcjDGDygz2lDbuc0W0eSB2/G3k4Uv9z+wmnzjiug2/kabdIoeoEA4qjVlvHTrTQq1SQiCwW75pYEuJ1XhyrrT4eLi8/HiwhUghh6MoKB4hB6AoXFMdAXx8FtDaXzLSsiQgLq+uncH1ceZB7PnISqA+dtdcNEYmJvCmPHEwiWuzoD3IHVtDqR3E5MRMI8gtyOeoK9DA1ceKY/o9UoRPfRTysx8uhlvHrvai9WRSUSGeS+jSCy1CZJzJv4Up9mNfhWVEae48k7j7D/1feF8mg5wfjl5C/UyR9nTbe8mYCiODsBGIkzVksifHN6/5vBDZIH00Tiaz+JvBh+8amxrJ3AwY5Km6ezHKixDVSeTuO9Ba21mEik/SQSLPWrxjLH90ADLItqLYbZ+YTRFlvBidSAGN0Z0kQbx0uno6YypwQKQHUJ4fkYri1kWyv47SzqwPXNDylFI60zTX96Fm39xUGMnlw2ldsTaNp5+VkE4c+2jdXXE4xrmdwHCaZZvYIT2U0pca9Exu+/Jiy3PsgVloZCg58xn70Xt7MLMacrzjiRzaLhN6hO+44fTmJy96qwrp1AafAMA5VtsvMNo6lwNJ0WZu+02ILvD/pJE5E4GkRsMbH3Jt64865lfTuBSIxvzCVRQ/pg09ty6rTYghOZa6yGEAG65fkleYVufTs4FXNenBZLWDkyfMO+dStS116dYCvmJDktrqBm3h8L/Xa5vgJOYGrl0DlvA7Wdgkc0JwwP3E1Y0PCSEHdaIMnOncLL/jKuQAg9HLyM/dUDQW+GjOO4iZ4T6CKGZIueEfDLt5ZFQLWqkGkuIvi6ArJvbxGkEGCCAZJS5cexCp/RJqf1q911HF8RECBSSR+8soKxoE/wYc/OB0fTvdS9MjnJDQVpY5GJALmCqS4+qOLn7454SMZYoXtlEXicGL6aonC8iQA3IyqMuV1+El88dnNEIcFNI5FWr6wbs+J9uI8tqhO6lHdTSl7v4HjWApVLjYdGSDBHIcE1YxtOxE3UgtqccROksUSspHfHBMeFSuwgq3+9kceZemosrmdiMHNzS/BengRM6K6pCGk9+WFrzo4zNC0uoCqqP/n4EKfXjq26b6NcWxXFNvUJ0uhxWS/K8lmnvZOFA7hOMZEk0GjWVmA4Ov+cPcbvnxzad2aKZci8LjUUTLnNm3WVIxPMWj3oe/DlHSfdLc2qG3hK8nEidApkmmZ1//O7KE7+5bC3kkf4RgQe4TK02A7jqfI6hT8c+rJ5VKurkACpiW5+qjx+++Ea39DGxEgdPNLHg2Xh+RQkwY9/NVBLr/ytPfzocPnCnPjAUaWIdillFxT+14GnqkTy4n+04B+I8OzOFbfhrAAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJiSURBVHgB7Zi/btNAHMe/l1S0RUXyI/gBQApvQBYGJgYYGJCcB6B1noCyMDthY3HCwoIEExJTi8SGBJVgYoo6ILFFQEMikhy/ny9J7Sa2z46NUuk+S07n+/30+eX++BLAYDAYDAaDwXBpESgZ6e7Y9GELb3iMHEjXsoAzm9vC+3ty8XlpBcj93QMIcUhNa9bVh4Qn2oMnWvEsLkc+Kd4NdffIuCm8wZt5RykFyP2rjynzYczjjmgNGonxPGtSHJGevXqAcET7rMvNwgtIkZ8TW0Sq/GKgKqLQAjTl5ywVoS2/CBBOBQWRUZ65NdvgKj6rPFOR9UJmIIc8bcZpnU6mXhCfR16gS5vZiRQgX7sWxtMDSOnQAD49Tugk6Yh77S42UF41z+VtjCeUCPZyRMUT91tNbJh8YIZUeWbqylePfKwjv30NuH67VaR80JUuH0lAy+lZI5f8jTvAzh7lEA4+PH9fhDyzRfL8zdrQQcKRT2s1/PhWgy5heebPzw6qu32MR5Z2jhh5poJxtUFiPehw+hlryQ9/AV/eoih59ZiQL2kZVWkZiYSZYPnTT9AmTn70Wz9HirwaMiOxiA2VZxZvYvHA62FSrS8tp6zyW1f6/0ueiVwllorIKs/n/GR4E9t76o5TsrwavoJgOX3/eEQF2NAn+pJ68dDB13d+mfIqJIaML5qIfCiHA1nxoUMOeRWWgGYRK+VDOdKLyCmvQlNIKSJRPpQjvog15JnU3wOBnJC8sS/cSOWxjvwsR4fHgm+35/Qpb3Md+cxI37V4RtQ/BTlzUGz4h4zBYDAYDAaDIT//ACBTYGoECbndAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAAAXNSR0IArs4c6QAABF9JREFUaIHtml1sFFUYhp/Z2e3PdrsttkW60lqIbROSIqbSaEshEYUY/ItB64WJ8e/CaIzGCxL1wkRvgEQjkQSl0RhjvMEEIVpStEZBAqJe1JZgikqo0rVSWku7pd3ujBcTXIY5s8yc7lnZpk8ySc/7fd19387MmTMz1SYTUybzmMD/bUA1CwHznaDXRs2YIJD4GbSUSj/eMXWMcBNmIJKx7aoB9fFuQvHtBBI/Zc1bNjHCzSRjr5CKrBPWtUyzaOhcJ6E/tigzl02SS7eRrHzSobsG1CcPUTjwgHJj2eRifRdGSYtNc51kgvEdyg1lm+DwTofmGlC/0KPUjAqCAs/CgIHp35SbUYKRQJsZtEniPTg7kgs7StBmh21j4WVCHzwGP5TkxFC20cPfYzQ0/zcWXwcnR2A0lCtP2WXyvG3oMsnk8w2GYRsJA2poObGiAs207xxhQPOKv0I+caX3eX83sRAw3/F8P+ggEII7tsCKTRBZDH8PwLdvwi/d4v6ypXD361Cz2hoPHoeuV+GfP8X9jRth7YtQVQ8Tw9C/H77eDkbSl035gPdshVUd6XF1E3R8AB91wO+H7b2FpfDU51BSmdYaNli/885aSCbs/cvWQMf76XF5LbQ9C+EK2P+SL5tyh6heYA93Oasfd2r16+3hLlFaDY0bnHrLE+LPvuUR0PxZlgsYWexeiy4RaLEM/YJatNpffwbkAk4Mu9fG4wLtbIZ+QW18yF9/BuQCpmbg5AFx7cQ+p/brN87zDCxt4Cun3i/4DICTXWD6W4TITzJfvAwXx6Cu1Tpkz52C3j3Q95mzd2oUPnkM1jwPsSYwTTjbC4d3wPQFZ3/fXohUwcrNUHmTdcScPgI923zblA848Rfs8zGjnT5ibV45utva5si8v9AvBMx35h4wGoPYKijI/Ajd+rYgVDVaW0D+9PeD/LdEY/BwJ8RuTmtHd0P3a+L+hrvg/regeJE1nhqFvS/AwJfSFrwgvwcf3GkPB3Db09AiWKqV18LmXelwYP380LtQdoO0BS/IBQyFobZFXKu/06kta4NgkVMPFsHydikLXpELWFzuXisqc2qFpe79hVEpC16RCzg+BKlpcW1E8FRcpHmpZQHJc9CE4x+KS8c6ndqpHvEieeyMVVOI/Cx68A2I90Pd7ZetRT+FeJ+z1zTgvY3Q/ChUr7TGQ73w48e+F89+kQ9opqzFde8eb/2J83Ao96/kxA9+c3QRVoGm2b2LH/wqPmxUYmr2p/LiScbnc49rCk23DcVJQuFcWFFDyL4mFh+ixdfnxIsKjLDduzCgEV2eEzMqMEvt3sUBq1pBz8N3hEEwKpptkutsYtSoXeWrwLixzqG5Bky2u9zXXcPMrNvq0FwDppasJ9W2SamhbJJqvw+j4laHnvF/1QBCJ94m+N0utLEZZebmgrmoiNnWZ0iueE5Yv2rASwSm4+hnDoDp7/WVMgIFJGvuhcLrMrZ5Dpiv5PGazBsLAfOdfwERgySziOtzQQAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHnSURBVHgB7ZaxS0JBHMe/zxRFIV0KAkuhoCgyaQsS8j+o3aWpoaWpoeYcWmpIqK2hoKYaGtoqjNaMoKlIUVIQIgPBUN911+PhO5XePXs9h/qAenf+5Pfxd787Bf46knZCbjwr9HkL5pGCJG2jUr+SopV0uwAbPyVhmEsYhOzDabsg146wgMCvEYTN0VbCKgGGj0qcoIsCjCBJuubQRQHa9j3z6KpAD/Fqp3ahD82UIcxHBigeAtkNoXAxAZVKRj/GFQD8a/RE03FOX0JcgH2z23H9uN4IMHEODCwLCZjfA+9J5dXuFQo3tgUq7hDgmWzM6yWgfK9UySCdCYwdAc4Av1Y8AB6XlPHzatOvjNkCLwlagRC/lk80xoUEROlMQC8Ba0AmmKaVqJW+DTW/CQfpEQxuAn0xeun4dMN/JsCa0R3ik/vXlXE2LtSUnW2BysguLfUU8ESbzznEJ8+ZeROyfWTlZJ2v/VavZ4rA8F5jzUByhtgW5HeUi2X6QXmMHivruTh/5xtMzhCrAEvE6I+1nn/2HqsQO/d58eNnTEBNpIo0UzCeWIXfAll6g8XwAqR+CovhBKRI5ZJapGEhradAri3QPxOWbUWLgDRbTYFUo1ZVou098CUhkShkeZFWIwUzIeQO/2j4BI7JiFs+USz6AAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATdSURBVHgB1ZpNbBNHFMffzNohURNkcis9dJFob21MXDVH3CNSkKA3xIFWaqEHCEGt1GPMnVbgcGihUt1Dm1upRNQcax9p69jALVSqkWhzo1YTFPB6d3hvnNmsvev1ftjB/kmRvbO72ffe/N/smxkz6APpxf9S3NROMcbSIPibAkSagUgBsJS6RgDUGP4BE/exvWI2jFL1m0M1iAmDiEijrbHLTIgsHmYhAoJBFQ24HseZ0A7sGW4tOiPcBwqmYVwN60goB2YXni0NwPA2BGO59fxrV4NeH8gBjLqesJJ3hIA07A817I0PgvQG73VBZmHnnGYmKvtoPKFryWQlc/H/U70u9HWAJAPCLAxSMj6kgPE70gYfukqopXeRgyHALy88HZBdh97DMMG0j8r5iR9czZ0NlLCk+VckGz/qmNjHOhPblQOamfxtCI0nUnws6VJFmwO7CaPDkMJwJJy9uJVra1NfWtJJ/g3DT93UjCPV64fqdGD3gNbUcjAapHgzsagOZA/Ejf7UBIOls2OQfTchj+/ea8LXPzdga0fAgLB7QfYAlsJZiMHnH+4ZT5ycS0iHBojdCy0JCX4ZInJ4msH8XMLVnnlLg0GCc4/j9MlJPoxFr3POn/CONMlqwGRlaR9HPt2iT1AeOJ2g7+dPJOHbS+NSYv2AZoEJLDTSUedl8z6G3F5ryNz4ajeZf/pyAl6fbj1IyYucjAXazlFLMxCRk3NJz3ZlGDl4JpuAzFFuG684/k78HEHp6xRCHSJAxnUapVhFB1RuzKOTmaNuY7d29r7TCDb/vgblv0xYKYbpFTYT2YELXZK3/MiEzaeWLRPKk8PTbgdIYtQzm08FXPvkgGwjRzaeCOlIQFKRsqlX9GfR+G7nCSWxa5+OQ+lBu7FTExCGVM8ppRdT497G/YvRvPt7s2vvKFaKDSkxGpmcAwHdX3wYOPoSupuKolDl80rJgI1/LDkcOg24/WtDysAv+iSx7R3vEWw1wqgU2oEz2SS8/QbHhxmQ+/EF3FprRZOMpuj3eoHdWjO6vvzof4akhg6IKmazHvweISNPfxTNVTSaHFHQmE/tXqUESYR6ziv6lBd0PhQCahyXSx6Huaf8yLK/k5FLZw/Yo4ii+NBbCiQxcpCccJ3DngwLrsHe5zjNqYa5iR7uLJOLD1qls5PVe6arlFYJru5xEin6COOswi3N/AVCsvHEkjK5kH8OX3z3wvVwMp7Obe6207Wf5ffeXPSyUk7QuSjRJ2hRWGZc5tI2TuSjrTC/Kmhlez0/eUy+B4QQJRgxaFmePqUDVqJJB3UYIUg+9CkdoLkl9sINGB0KaoHLLiVGqRdoI0R9tx0YlV7ABee2XRzXe392YbvC9ncvIDC0Ubi+PHnE2eaqRi1unIYhlBK+desW7tp0trscQCnVBFhXYMhA6XzsteXkOR9YXz5YIK3BkEC2lG8e9KwYfGvf93AlGHdHfLd4Bg0Z/+fNqVzX89CD3d2a7yHkpCcupHkN2JU/licLftcF3mbluPHB9mnvgOocq2GcDrLNGmpJa9CSoqhzATf8JNNJlJ8a6HIvgfFz0CeU4U2sBtTGRVDi/NhDl+uquLIdeXEYFyEYiFIUwxV9WUJWzsif21hsBjWsO/OFIoyPqjPBqsCtx1iyVGkiFdVoJy8BXGo4WsdBinMAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAARGSURBVHgBzZnLbtNAFIb/SQOJWpCCeIGwY4fLRYIVqcQKFoQlu/IEhCdoKrFveALgCQAhLhJIzQ4kLgkgQVkgTAsCRIVCL6HpxcM5Tp26qWPPjCcSn+TWssf2+c+cOefYERgypyuyuAE4Amjx9qImmrCIwJA4UZFl+neVtlLfKZeeWn01I27DAkMRcLwiZ+jGlbgxEmh6wESzJlpIQQaWIeOnkoxnaIwzAtxBSqzOgEPxTkZ91rpIYDJNOFmdATK+Cl0kJpECqwIoro9BnxLNXAGGWBXAcQ0z/g8BhGlGMc5EtgVoFykKOzdNKs3CImTMPbG3cMVC4+vKg988vgrpUYGULuT6NMYvuVZn4HVN1NijquN57BYwrTT4zcMZMr4G30FiEiJ3kw9bnQGGqyt5ZZY8W0waS2OuUfi4sYMadwq+sRLlvjMl/mO9ErNBLCJuJrY9P/6qJu7G3qzxqAixf5b2yhFn6/xnaM0cc7IiS7L78KA+uLTdSzScaTxwIAS3GsXI81TBcez87dQCuF0mbxastsndxVrF4PrQguwcoUXc0hZwqiIdT+AsxQEXrXLoIZwRLqUSwvGeyU3RvROaQXkLzoUrvBcrgEs8rXJHCgqB7iJyEF81WzQbR4zyelLIhOl63+XdbKTBO3HL+wVedYoUMt1rb0GH5JAJUw+MZ3oCgpcQdVsHot4P+VlGUor0SsrXiN3O8QWovoQocjZxhB/refK6rEIPlzNP+EBQB8qwBHekse1x436JClPDwHguIDf6D2W3H2rczkaR7YZRfddB3/CRKWj2Srvp7Kkf/gxwEwaLeOF1wHHefDhLxnNFLcEYSp2hxRuQ3X5gjZRcVOlfVPA70sb9JhlNn1WknfDk7jP6WV34hVy1CYtjq7WEzuICPlyfhz12Clc/vWZOpQkbePvNTWx8+Yq/z16i8+498H0Z+xYt9okDvM/sekogwltedtmoOLy1Dja//cDa2/e+4RvzXxG+ZvSjrU49OvYDIluJo86zoshQOB0YLYpsFiKf653zVlYpGawjSeDvcx38vNxGakJtQxSR8zzXPONKj8Jppe16f5aw9fNXb5Or7UTjmfzCCNIT731mYKAGIijHujAgZ0NATOwHxK60NCJG2iKliGTvM4mpIo2IsTnjhdxS8T6jlOtMRRjPgJQ3VLzPKCdrExFjH/fBABfjF6qqg7Wqja4ILmaZtuZbq9D7wq1dLnVFaK6DPf1+Ekb1XkdEfkFDgOxMQBPjhkVVxOinHNRQS5v9pOq4VETk1H5wclXTZj+pW8YkEVzQEjtTXrgG3mes9LxJIhI607ruwg1jrWmPE5GfjxEgO1eQAqtfpweJGBs0A1JOm4ZOgPXP61EiuKWIKGhaFXcQ1gUwUSIOP8mHh7RMcn4UQxHA9ESg+1vAoac5HHzt90Z1Cp2JtKETMNQfOAL4FZU+4PDmzj0/48Ii/wCI4f2ufZuHfAAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAQMSURBVHgB7ZhNbBNHFMf/s+vabZo02xKJSlWFK6RKVRLJKe2lQqpdVa3SS8mpR5pDK3Fic+QUhwsXpJgDBz4EOXA3iEMEF5uPAxIfjkS4cMkeIAQJSxtihSTYO7y3sS1iYrO7MyFC8k9ara2d3Xn/N+/Nvn1Aly5duuwmItCoUt5C7NMUdCFMF0N/zEEDwQTMX0/BkHn6lYQ+HKx7GYyMOlDACDSKvSVoMsgi9JFEwshDkWAr8DaPZrMQxiR0ITGFwT+ziEh4AYxuEZ4YiZoTwUKolcHRLDxvHLowMI2IRFuBBg9n0zDMPIS0oEqNcmx4tIiQRFuBBjyhRAZSuFDFNCOFpJoAhmNX1iagjEz723VI1AUwQ6Mz8DSIEPIQQqJHADP0Vw7Sm4IKAocRkmYSH7DloRowN5cTDlSYvzZDbgltiG/Mqof+E0u2sfQ6ZQikJG8OUiTpkkuGOpLOEvKGB6Po3v6v6N/TuPlHW2bpz2ESkVESUSpYSGyUEKLsMMpV9Mwuu/F7qxaLCISEU6vVMq0hlDSBQsqWSURlJOP6ZUfAnemzq8v48thTJG5WghvPCFxx7xxxtssBdRE/UIEmqx3zgb1uHX+Gnqvhd2BJ3i/f/t/2n9NmDIso/WTT1hYVTuo2xR8b33/yOcwnG4iCR6HTfFaHcRYlTYFyI3rNI+R4ayg1jOdzJCRmOHSaz3vfeErsLK1EtFqlJZSUjScocbeEZqD3AK2ETdvsQqS88EMJjg7jW73PhHmRcV4sUEjZCEn81sqEsvF41/tM6DcxhdQ0hVQp6GpYv5xO9V0qT6sav533mUilBIVUqr4ak52EfHXw7FHT+KRQf5sqsZ33GaVaiBOc3xkHJuSW0sFKX7T2HDyTp+sc/+rfCm28z8SgTpInoCSnz0xkF+6eT4rqa8oToW44uAOTcKvrq21fijoENPCFfDv8D9zFB1hbWUR1owIVDDOOvft/PzV/4Run3RidAjYfmOjDwHe/+r8rLx6jUn5MYp4hLLF4Lwb2/zY3f+7rbMdx2EF6B773j+r6ii8iiBj2+hd7h+kYdKSZGHvfHDsqoDkJrUovHyTGq65jrbKEtZeL2HhV9q+z0bF4H+Kf70FP/z6IWMKlunQsSFn/QQS8jRFLoMfa5x8dGCfjA/WJ9H1SaoC/uOg0dj8nLge954OvQDvIeKceNqE6dM0VoJtnsOmB3aDobX7Khm4vbunMcVlAigpCbxu9LRwyNN/UvZzIISLbthapxvmXTpM7JaRu+Ckq73LkdaVV79gbZSHcqaCfaWhAp+ENAjV3ObRMgb/JAu6cpRECTk6a5AodlylUitBMpO70z7ZMUdIluayuP6SxqS/Xt0JudzjVzUbZbm0MXbp0+Rh4A1fpjlaw3V0EAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAPmSURBVHgB7ZnNUtNQFMfPuWlxITBldOUquvBrVFLQjRvbnTvZuxB2jiNfTwA8AaCM447yBOITtK75qiMzLonjDDM6w1C+p7Q3x3NTCqVN26SENoz9bZrce5P8T3LOyTkpQJs2/zcIPvH0/V6MAHoBBf+SgUARPn2kMEsZQjSR0ASyUnzR78tzXSnwgQsZYIxtR4TVMYpkjZ2JdY3JRiWs4+OF9OceExqkIQMuKLwCNmTSEsez6ZmeDHjEswG2qyDO86YO/sIuRkNeXUt4Wdw3cjDB4pPgv3iFrs6truHlINdPQJ2Y79AkNAHlUqsfrk+5WevKgGaKL+LWiLoG9I8cjnLqm4EWwGl5fPVjZ81r1zSAs42uydCaH5mmQTIyl4vWSrM1g1iTHdMtFK+IaOHwfK0FVQ3oG94d5Ic4AK0nplJ3tcnqT4DEKAQEDmg7tfa/3x0w3m7rpXOOMWC82zY0LbwGAYKzYJwQ+Kai8ooUx8aQig3HJ6AJbQwChgUwICROcWYyeTfGsbGhnoijAQSiFwIGIr5a+tSZ5vpr/GxQTFe4kCrUNBnehgAitVwPp/X5EzeyCZUvCuVDBvnWJfiLsMKqDjNOBwhSFS5kIekQUJBKxDMynxuqjAFCHa4AnJWmqmahoKPEc98wqbZDcIXgXjujAY4vzXUlimPnDFAZCCSZPvb6/nFrDyC6ObX0sj9ROnxqgN0J5WgH0TIDpf9aHuD5b4D7WyCE2Ciftg0oNiyENCtDMqHJAISGEv7kL8DjP7wtC2M5uVO+TDx7t28Uuy2WnTn5MmBCq1DCn20CvP7BXxA2z8Qzy4/jqfLlIUuD6dM9IewCjoi+8qu7udWo8vHbXADc2zonuoSU06ByoVhxh4Uv9g8fLJ7swaWj7vZdFnwnUzCgBqztm9O4MsCEc59JLrmJ8SC6FEtAwmk8BKq6Q/EFLgsl+MZRwT1uHnkSXUIq/SBuOk3YCdNu3vPce+KZOzVMV5ZF7rPYg4LgG4fVfNo9iIMrD14sOE6V7ihDhNRiHMAGV3W9HAUR7M4aFUd1sKDu48KvEtydLYjtzF5cbBmsIb36MBatNl//u9B6MgEC30CLkEi3q7mPou4bS+ZgjFr0XrArzhri7TXgAuNnUheESbycj7rOWDS78ihetzd3XfU01whaWHkYH3Sz0lPZ1hwj3ItXeKralD9aWYqqi4DPEEGG/1cb9yJe0XDh3LeeHOTsNOHT00hxthmqF7BOXLjyV4ZgIc3GvBxn33GiBW7UF52qTLf41rrY8SEhxsa8YnE6D+mIECmK5Suxi0Cas8svJTqfh3Q6Gvf8p16bNm3O8w/QYYm8d9oDggAAAABJRU5ErkJggg==",
    "data:image/png;base64,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",
    "data:image/png;base64,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",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAAAXNSR0IArs4c6QAAA3JJREFUaIHt2ttP01AAx/Hv6WAUEO+iiaBGEx8U0D/ByG2IQyX+Bz4ZCQ8a/wojJgajL/4V8qBPJhoTMWICJt6dTLzFYNDo3I21PpTKxrpLu9OtJfs9rqc759PTnp6eVsT+xnXWcZRaN8Dt1IF+Tx3o99SBXsvCZ3vlG9xphvx8iMKt2xpLv2D7Njh/TqFzd+n9hB9u9JF5nWs3dJKp1d/UJrg8LujsEEX39fwpaoUDSCThynWd+Wjx/vE0sBDOTCIJVyeLIz0LLIUzk0wZyPcfrJGeBJaLM5NMwcQNa6TngHZxZtJpA/n6bS7SU0CnODPpNNy8rZNKrSI9A4xEqQhn5m8cpmdWbx1FgUufBV9fCrRMZZWWSmRe59qkVjEOQAg4eGC1BwvOZD7NKkSeGEfi+3udrkGNQGPlDVgbWT1nZnREsLO9RA9Gn4n/OIBfXwVzUwEyaTmNMCOz5wDOhAWDx3NnNnnAyLQgOpPv/r0Ic1MBliU1ptIBZW3OhAVDffnTthxJZFrwaa7wZfl7EWYlIKuFgyzgu0dKUZyZ2A8DmU46a0w1cbACfPdI4cuL4rPy7MR+wNwd+8joQnVxAMqbh/ZwZmJLK8h4eeWjCzoTk9XFASjfXtnHmYktwfO7AfQST5QmLp5wXFVOysWBhJnMn0WI/yxcWS1xIAHYqELTBusurDUOQGnb4bzCQAN0hTKWMxwv4ACU7hMZWrfar1BpgJ7hDFYHyCs4AKUhaDTUDlIJQPeQRlt7/jYv4WDlGmxUDWTL5tILbEoADg9qbNqVX9ZrOMgaZBpV6Dmp0byxMFIoBm7Lbn/gYM0oGmyGI2EN1WJUFAK6BvyFA4vbRLAFjozkIoWAQ/0aWzr9hYMiK9vLSfg4K0jFBB1dGhs8PloWiuOle9m4cEgQHpKLA4czGdm4UC+u4MDB26V4QjAxmSGekNOg4QHBqWF3cOCgB+8/0KThQr24igMHwGBQTsWhXhgdcX9Z1nYNfccEHWW8eCyWE/2iKjhwOMhcGnOODPXC6ZPunpbZcQRsbRFcHrePrNZpmR3HtTWrBnLvnvLK1wIHFT7RN6uCS2OlkbXCgYQlC7XJQO7fZ729ljiQ9PpMbRJcvJCPrDUOXPiMZOqezuOnOmdHFI52y/xnZ/HFdzKVxDNveN1KHej31IF+z7oH/gP0WMA7tCLfCgAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAAAXNSR0IArs4c6QAAAlFJREFUaIHtmk1LG0EYx//7EuM2URJsSQk5SGmjqdVSKLF4L3goCrYUeij0UPALeNOjn0IoFPwKFq0ePImhHsRSsbTQFxvSILWV2Ljdms16jpN9BtwdzCzzO+7szDw/dvaZZ1+0+ontIcLolx2AaJSg7ChB2Ym8oCly8Nqxh4XXdex8OIVtt7ZZFnB3OIbpFwn0JDVhMQi9ghslB6UtVg4AbBsovTvF5tZ/kSGIFdz73OCes7vHPycIQgU9l7/0mk2xhVTkk4wSlB0lKDtKUHaElmrQwtnjDn97qB64Lcd0DbjRbyAep/dasYIhMDd/jI+f/Kudl8+vYPxh3Ldd7BL1ghXR33+4pBwArK47ZHtH34PlSpN7zn7ZJds7WjAMlKDscLOo43j48s3F+aea6xkDfWlOEgm4TeghPOiTgstrDl4tnvi23xsxMTvTEzwKgZBL9M3bf2Tn7fcN/KwSWSzgNhHGszApWD3gp+mv+3Savmwin2SUoOwoQdlRgrKjBGVHCfIwiJJfM/jFpE70N40LhdQ6PtU4NMh/JzVU8I+ikI9x+98m5sjf5BveKdAxkoJTE90YuNV+kkxGx7MnFpIJ/yHGil0YvR+D1c1eJcsCHhRjGCt2+fZPp3Q8nbJw7Wr7OQbyJh5PWpQCNPWnk+QoQdnxTUF/6x5qNTluz95eDclE++2mreDSioNyRezfD2GTy5p4NM5+o2CW6K/DpnRyAFCuNPDniH2HxAgaIVQPnQQjmE7pyGU7/qsaQy5rIp1ic6bvRh+VJKMqGdlRgrJzBmOQlRYgS3AiAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAAAXNSR0IArs4c6QAAA1BJREFUaIHtmstPE1EUh3/zgGmphIrVECmIBo00Gl8haEww7nxEF42JW9ka/wAWxgULNyZqojujSxcmNmwscSExdkEAE1goIJrQBU0l0ge0tNMpM9cFqdLMo/NoaWfSb3ln5vZ+mdNzztwZaiuXJ3AwdL0XUGscL8gqDRZ5ILYgYT0q7vV6AAAMR8HjBdoP0DjYR4N1mZ9LUTD8jEd8STI/a5Xx9VEYDHI4csZ4wMmu4DNoKDkAWI8STDzl8fFlAULO2LUywdxGY8ntZmVWxLuHeaTj+tdouySTTRCExnikf+uTlAnSNlAWcsCHJwUUtiqfK9ORGjdCy8isE8y+FyqeZ8s7WOLbp21s/tFuxGx7B0v8iGxrHrfR/VJm5at2M2J7wWRMgritHqa2FwSA/KbDBYW8+jFHCGqh2GzrZWC4FYFhDgxL/RtLrIqYDuWRTZanY85D4fJdN3y9lX+SSMDClwK+fy5YWR4AC4IeL4XrD/bJxv0BFkQimHxT3hWfv+nC2Wv6n3t6TrFYXSxiY81a3TIdokb3OYiJdVaj6TB9B3NpgtDjDLr6WVD/IxR8lmB5Sh5ac2EeRAJoRt/8qbiIlIGnBjUs/Qej80VE54u6zi3kCKZDGumuRjg+izYF7Y7jBate6JOxnUKfSTi40Etis9Drou6FfuJFFoEr8l50ZpyXnT8X5tHWQcPXU7nSl0K07oV+MSJgMVJ54wfYKfSTr3Vsg1UZx2fRpqDdcbygpSTj7aJx4hIHZtcsyZiIn9MCJIXdvONDrfD16siiBFieEpCMWX8/aVrQ1U5h5LkXlEIMzI7ziLwtL/Tnbrhw9V6b7vmHgm68up9CLm3tEwLTIUozUJQDgBaFhoVro+SDGjAswLmNXaNEs9Br0Sz0DYBMsLUKcd9IyATdHfVYRu2QCTIshf2HnRO5iiY9px0ueHLYUnJtKBQFO/00jl5whqRqLA4GW8Bye7kU81AaiV9VsNNP4fYoZwtJotGuamaTQ8cYBB+50O6zb22smC47/TTujLnRf1Hna6E64PGqa1BGPmneXCOYDwv4NSMa/uqvVnQP0Lg1qr7fakhwN/ElCZmEhK0Ugaiv3646vj4G3QFa8fGshGlBu+CclkUFxwv+BXSjPwsXks5lAAAAAElFTkSuQmCC"
  ];

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
    return (s[0] || "?").toUpperCase();
  }

  /* ---------- 会话伪装头像（飞书群文字头像 / 图标混用） ---------- */
  const MASK_AVATAR_KEY = "linuxdo-feishu-mask-avatar"; // "1" = 开

  function isMaskAvatar() {
    try { return localStorage.getItem(MASK_AVATAR_KEY) === "1"; } catch { return false; }
  }

  function setMaskAvatar(on) {
    try { localStorage.setItem(MASK_AVATAR_KEY, on ? "1" : "0"); } catch { /* ignore */ }
    const panel = document.querySelector(".feishu-list-panel");
    ensureMaskAvatarToggle(panel);
    // 列表若还没数据，先别空转；有数据则立刻重绘头像
    if (listState.topics && listState.topics.length) {
      renderListRows();
      renderPins();
    } else if (panel) {
      // 兜底：按当前路由拉一次列表再绘
      loadList(listState.apiPath || listApiForPath(location.pathname) || "/latest.json", true);
    }
  }

  /** 从标题取 3～5 字（按标题哈希稳定） */
  function avatarTextFromTitle(title) {
    const cleaned = [...String(title || "?").trim()].filter((c) => !/[\s#\[\]【】《》\*·\.\,，。!！?？\-_/\\]/.test(c));
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
  function disguiseAvatarForTopic(topic) {
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
        html: `<span class="feishu-avatar-text" data-len="${len}">${label}</span>`,
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
    const actions = panel.querySelector(".feishu-list-actions");
    if (!actions) return;
    let btn = actions.querySelector(".feishu-mask-avatar-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "feishu-icon-btn feishu-mask-avatar-toggle";
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

  async function api(path) {
    const resp = await fetch(path, {
      headers: { Accept: "application/json" },
      credentials: "same-origin"
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
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
      --fs-accent: #3370FF;
      --fs-accent-soft: #E8F0FF;
      --fs-nav2-bg: #EBF0F4;
      --fs-nav2-border: #DFE5EC;
      --fs-text: #1F2329;
      --fs-text-2: #646A73;
      --fs-text-3: #8F959E;
      --fs-bg: #FFFFFF;
      --fs-chat-bg: #FFFFFF;
      --fs-hover: #F5F6F7;
      --fs-active: #E4EDFB;
      --fs-bubble-other: #EEEFEE;
      --fs-bubble-me: #E8F0FF;
      --fs-border: #E8E9EB;
      --fs-border-strong: #DEE0E3;
      --fs-danger: #F54840;
      --fs-rail-bg: #D2E0F1;
      --fs-strip-bg: #FDFDFB;
      --fs-nav: ${RAIL_WIDTH}px;
      --fs-nav2w: 0px;
      --fs-strip: ${STRIP_WIDTH}px;
      --fs-list: ${LIST_WIDTH}px;
      --fs-header-h: 0px;
      --fs-font: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;

      --primary: var(--fs-text);
      --primary-medium: var(--fs-text-2);
      --primary-low: var(--fs-text-3);
      --secondary: var(--fs-bg);
      --tertiary: var(--fs-accent);
      --header_background: #FFFFFF;
      --header_primary: var(--fs-text);
      --d-hover: var(--fs-hover);
    }

    /* 整站写死光明：覆盖系统/站点暗色偏好 */
    html.${ROOT_CLASS},
    html.${ROOT_CLASS} body {
      color-scheme: light !important;
    }

    /* ---------- 字体与基础 ---------- */
    .${ROOT_CLASS} body { font-family: var(--fs-font) !important; }

    /* 站点无全局 border-box：自绘面板统一盒模型，否则 padding 会加宽导致互相堆叠 */
    .feishu-rail, .feishu-rail *,
    .feishu-strip, .feishu-strip *,
    .feishu-list-panel, .feishu-list-panel *,
    .feishu-chat-panel, .feishu-chat-panel *,
    .feishu-mode-fab { box-sizing: border-box; }

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
      padding-top: 0 !important;
      margin-left: calc(var(--fs-nav) + var(--fs-nav2w) + var(--fs-strip)) !important;
    }

    /* ---------- 展开栏：原生侧栏原样搬入（内容与文案不变，≡ 滑出） ---------- */
    .${ROOT_CLASS}.feishu-nav2-open { --fs-nav2w: ${NAV2_WIDTH}px; }
    html.${ROOT_CLASS} body .sidebar-wrapper {
      display: block !important;
      position: fixed;
      left: var(--fs-nav); top: 0; bottom: 0;
      width: ${NAV2_WIDTH}px !important;
      background-color: #FFFFFF !important;
      background-image: none !important;
      backdrop-filter: none !important;
      box-shadow: none !important;
      border-right: 1px solid var(--fs-border);
      z-index: 300;
      transform: translateX(-105%);
      visibility: hidden;
      transition: transform 0.18s ease, visibility 0.18s;
      /* 站点可能是深色方案：强制飞书浅色调色板 */
      --primary: var(--fs-text);
      --primary-medium: var(--fs-text-2);
      --primary-low: var(--fs-text-3);
      --primary-low-mid: #BBBFC4;
      --primary-very-low: #F0F2F5;
      --primary-50: #F5F6F7;
      --primary-100: #EBEDEF;
      --primary-200: #E8E9EB;
      --primary-300: #DEE0E3;
      --secondary: #FFFFFF;
      --tertiary: var(--fs-accent);
      --quaternary: var(--fs-accent);
      --d-hover: var(--fs-hover);
      --d-sidebar-background: #FFFFFF;
      --d-sidebar-border-color: var(--fs-border);
      color: var(--fs-text);
    }
    /* 可能盖住白底的子层/伪层一律透明 */
    html.${ROOT_CLASS} body .sidebar-wrapper *,
    html.${ROOT_CLASS} body .sidebar-wrapper *::before,
    html.${ROOT_CLASS} body .sidebar-wrapper *::after {
      background-color: transparent !important;
      background-image: none !important;
      backdrop-filter: none !important;
    }
    .${ROOT_CLASS}.feishu-nav2-open .sidebar-wrapper {
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
    /* 侧栏内部元素统一到飞书浅色观感 */
    .${ROOT_CLASS} .sidebar-wrapper .sidebar-section-header,
    .${ROOT_CLASS} .sidebar-wrapper .sidebar-section-header-text {
      color: var(--fs-text-3) !important;
    }
    .${ROOT_CLASS} .sidebar-wrapper .sidebar-section-link {
      color: var(--fs-text-2) !important;
      border-radius: 8px;
      transition: background-color 0.15s;
    }
    html.${ROOT_CLASS} body .sidebar-wrapper .sidebar-section-link:hover {
      background-color: var(--fs-hover) !important;
      color: var(--fs-text) !important;
    }
    html.${ROOT_CLASS} body .sidebar-wrapper .sidebar-section-link.active {
      background-color: var(--fs-active) !important;
      color: var(--fs-accent) !important;
    }
    .${ROOT_CLASS} .sidebar-wrapper .sidebar-section-content svg,
    .${ROOT_CLASS} .sidebar-wrapper .sidebar-section-link-prefix {
      color: var(--fs-text-3);
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
    .feishu-strip {
      position: fixed;
      left: calc(var(--fs-nav) + var(--fs-nav2w));
      top: 0; bottom: 0;
      width: var(--fs-strip);
      background: var(--fs-strip-bg);
      border-right: 1px solid var(--fs-border);
      display: flex; flex-direction: column; align-items: center;
      gap: 6px; padding: 14px 0;
      z-index: 250;
      font-family: var(--fs-font);
      transition: left 0.18s ease;
      pointer-events: none;
    }
    .feishu-strip-item {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: var(--fs-text-2);
      position: relative; flex-shrink: 0;
      cursor: default; user-select: none;
    }
    .feishu-strip-item svg { width: 17px; height: 17px; }
    .feishu-strip-badge {
      position: absolute; top: -4px; right: -10px;
      min-width: 14px; height: 14px; padding: 0 4px;
      background: var(--fs-danger); color: #fff;
      font-size: 9px; line-height: 14px; text-align: center;
      border-radius: 7px; font-weight: 500;
    }
    /* 左侧栏头像通知：仅在 html.feishu-notif-open 时显示，避免关不掉 */
    .${ROOT_CLASS} .user-menu.feishu-user-menu-float,
    .${ROOT_CLASS} .user-menu.revamped.menu-panel.feishu-user-menu-float,
    .${ROOT_CLASS} .user-menu.menu-panel.feishu-user-menu-float {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    .${ROOT_CLASS}.feishu-notif-open .user-menu.feishu-user-menu-float,
    .${ROOT_CLASS}.feishu-notif-open .user-menu.revamped.menu-panel.feishu-user-menu-float,
    .${ROOT_CLASS}.feishu-notif-open .user-menu.menu-panel.feishu-user-menu-float {
      display: block !important;
      position: fixed !important;
      left: var(--fs-nav) !important;
      top: 14px !important;
      right: auto !important;
      bottom: auto !important;
      width: 320px !important;
      max-width: min(320px, calc(100vw - var(--fs-nav) - 12px)) !important;
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
      color: var(--fs-text) !important;
      clip: auto !important;
    }

    /* ---------- 最左：飞书文字导航栏（复刻飞书，除展开钮外纯装饰） ---------- */
    .feishu-rail {
      position: fixed; left: 0; top: 0; bottom: 0;
      width: var(--fs-nav);
      background: var(--fs-rail-bg);
      border-right: 1px solid var(--fs-nav2-border);
      display: flex; flex-direction: column;
      padding: 14px 12px;
      z-index: 400;
      font-family: var(--fs-font);
    }
    .feishu-rail-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 2px 4px 12px;
    }
    .feishu-rail-avatar-wrap {
      position: relative; flex-shrink: 0;
      width: 40px; height: 40px;
    }
    .feishu-rail-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      overflow: hidden; cursor: pointer; border: none; padding: 0;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 15px; font-weight: 600;
      flex-shrink: 0; position: relative;
    }
    .feishu-rail-avatar img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
    .feishu-rail-avatar.is-notif-pinned {
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--fs-accent);
    }
    .feishu-rail-avatar-badge {
      position: absolute; top: -4px; right: -6px;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: var(--fs-danger); color: #fff;
      font-size: 11px; line-height: 18px; text-align: center;
      border-radius: 9px; font-weight: 600;
      box-shadow: 0 0 0 2px var(--fs-rail-bg);
      pointer-events: none; z-index: 2;
    }
    .feishu-rail-toggle {
      width: 28px; height: 28px; border-radius: 50%;
      border: 1.5px solid var(--fs-text-2); background: transparent;
      color: var(--fs-text-2); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      padding: 0; transition: background 0.15s; flex-shrink: 0;
    }
    .feishu-rail-toggle:hover { background: rgba(255,255,255,0.7); }
    .feishu-rail-toggle svg { width: 15px; height: 15px; }
    .${ROOT_CLASS}.feishu-nav2-open .feishu-rail-toggle { background: #fff; }
    /* 与下方 rail-item 同左右 inset，无底色，避免「假搜索条」感 */
    .feishu-rail-search { padding: 0 0 8px; flex-shrink: 0; }
    .feishu-rail-search form {
      display: flex; align-items: center; gap: 12px;
      height: 36px; padding: 0 12px;
      margin: 0;
      background: transparent !important;
      border: none;
      border-radius: 0;
      box-shadow: none;
      color: var(--fs-text-3);
      font-size: 15px;
    }
    .feishu-rail-search form:focus-within { color: var(--fs-text); }
    .feishu-rail-search svg {
      width: 20px; height: 20px; flex-shrink: 0;
      color: var(--fs-text-2);
    }
    .feishu-rail-search input {
      border: none !important; outline: none !important;
      background: transparent !important;
      box-shadow: none !important;
      width: 100%; min-width: 0;
      height: 100%;
      padding: 0;
      font-size: 15px; line-height: 1.2;
      color: var(--fs-text);
      font-family: var(--fs-font);
      -webkit-appearance: none;
      appearance: none;
    }
    .feishu-rail-search input::placeholder { color: var(--fs-text-3); }
    .feishu-rail-search input::-webkit-search-decoration,
    .feishu-rail-search input::-webkit-search-cancel-button,
    .feishu-rail-search input::-webkit-search-results-button { display: none; }
    .feishu-rail-items { display: flex; flex-direction: column; gap: 4px; overflow-y: auto; flex: 1; min-height: 0; }
    .feishu-rail-items::-webkit-scrollbar { display: none; }
    .feishu-rail-bottom {
      margin-top: auto; flex-shrink: 0; padding-top: 8px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .feishu-dark-toggle {
      cursor: pointer !important;
      width: 100%; border: none; background: transparent;
      font: inherit; text-align: left;
    }
    .feishu-dark-toggle:hover { background: rgba(255,255,255,0.55); }
    .feishu-dark-toggle.is-on {
      color: var(--fs-accent); background: var(--fs-accent-soft); font-weight: 600;
    }
    .feishu-dark-toggle.is-on svg { color: var(--fs-accent); }
    .feishu-rail-item {
      display: flex; align-items: center; gap: 12px;
      height: 44px; padding: 0 12px;
      border-radius: 10px;
      color: var(--fs-text); font-size: 15px;
      position: relative; flex-shrink: 0;
      cursor: default; user-select: none;
    }
    .feishu-rail-item svg { width: 20px; height: 20px; color: var(--fs-text-2); flex-shrink: 0; }
    .feishu-rail-item.active {
      background: #fff; font-weight: 600;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .feishu-rail-item.active svg { color: var(--fs-accent); }
    .feishu-rail-badge {
      margin-left: auto;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: var(--fs-danger); color: #fff;
      font-size: 11px; line-height: 18px; text-align: center;
      border-radius: 9px; font-weight: 500;
    }

    /* ---------- 分类色点（右栏分类 tab 使用） ---------- */
    .feishu-nav2-cat-dot {
      width: 10px; height: 10px; border-radius: 3px;
      flex-shrink: 0; margin: 0 4px;
    }

    /* ---------- 中栏置顶横排 ---------- */
    .feishu-list-pins {
      display: flex; gap: 14px;
      padding: 4px 16px 12px;
      overflow-x: auto; flex-shrink: 0;
    }
    .feishu-list-pins::-webkit-scrollbar { display: none; }
    .feishu-pin {
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      text-decoration: none !important; border: none !important;
      width: 52px; flex-shrink: 0; cursor: pointer;
    }
    .feishu-pin-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 600;
      overflow: hidden;
    }
    .feishu-pin-avatar.is-text-avatar {
      box-sizing: border-box;
      padding: 2px;
      text-align: center;
    }
    .feishu-pin-avatar .feishu-avatar-text {
      line-height: 1.05; font-weight: 600;
      overflow: hidden; word-break: break-all;
      font-size: 9px;
    }
    .feishu-pin-avatar .feishu-avatar-text[data-len="3"] { font-size: 11px; }
    .feishu-pin-avatar .feishu-avatar-text[data-len="4"] {
      font-size: 10px; line-height: 1.15;
      width: 2.2em; text-align: center;
    }
    .feishu-pin-avatar .feishu-avatar-text[data-len="5"] { font-size: 8px; }
    .feishu-pin-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .feishu-pin-name {
      font-size: 11px; color: var(--fs-text-2);
      max-width: 52px; overflow: hidden;
      white-space: nowrap; text-overflow: ellipsis;
    }

    /* ---------- 聊天 header 头像与 tab 条 ---------- */
    .feishu-chat-head-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .feishu-chat-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 600;
    }
    .feishu-chat-tabs {
      height: 40px; flex-shrink: 0;
      background: var(--fs-bg);
      border-bottom: 1px solid var(--fs-border);
      display: flex; align-items: center; gap: 18px;
      padding: 0 20px;
    }
    .feishu-chat-tab {
      font-size: 13px; color: var(--fs-text-2);
      text-decoration: none !important; border: none !important;
      cursor: pointer; position: relative; height: 40px;
      display: inline-flex; align-items: center; gap: 5px;
    }
    .feishu-chat-tab.active { color: var(--fs-accent); font-weight: 500; }
    .feishu-chat-tab.active::after {
      content: ""; position: absolute; left: 0; right: 0; bottom: -1px;
      height: 2px; background: var(--fs-accent); border-radius: 1px;
    }
    .feishu-chat-tab .feishu-nav2-cat-dot { width: 8px; height: 8px; border-radius: 2px; margin: 0; }

    /* ---------- 栏间拖拽调宽 ---------- */
    .feishu-list-resizer,
    .feishu-rail-resizer {
      position: fixed;
      top: 0; bottom: 0;
      width: 9px;
      transform: translateX(-50%);
      cursor: col-resize;
      touch-action: none;
    }
    .feishu-list-resizer {
      left: calc(var(--fs-nav) + var(--fs-nav2w) + var(--fs-strip) + var(--fs-list));
      z-index: 440; /* 高于聊天面板(420)，低于通知浮层 */
    }
    .feishu-rail-resizer {
      left: var(--fs-nav);
      z-index: 405; /* 高于导航栏(400)，低于通知浮层 */
    }
    html.feishu-nav2-open .feishu-rail-resizer { display: none; } /* 抽屉展开时避免与原生侧栏重叠 */
    .feishu-list-resizer::after,
    .feishu-rail-resizer::after {
      content: "";
      position: absolute;
      top: 0; bottom: 0; left: 50%;
      width: 2px;
      transform: translateX(-50%);
      background: var(--fs-border);
      transition: background 0.15s;
    }
    .feishu-list-resizer:hover::after,
    .feishu-list-resizer.dragging::after,
    .feishu-rail-resizer:hover::after,
    .feishu-rail-resizer.dragging::after { background: var(--fs-accent); }
    html:not(.${ROOT_CLASS}) .feishu-list-resizer,
    html:not(.${ROOT_CLASS}) .feishu-rail-resizer { display: none; }
    body.feishu-col-resizing,
    body.feishu-col-resizing * {
      cursor: col-resize !important;
      user-select: none !important;
    }
    @media (max-width: 1000px) {
      .feishu-list-resizer { display: none; }
    }

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

    /* ---------- 中栏：会话列表 ---------- */
    .feishu-list-panel {
      position: fixed;
      top: var(--fs-header-h);
      left: calc(var(--fs-nav) + var(--fs-nav2w) + var(--fs-strip));
      width: var(--fs-list);
      bottom: 0;
      background: var(--fs-bg);
      border-right: 1px solid var(--fs-border);
      display: flex;
      flex-direction: column;
      z-index: 200;
      font-family: var(--fs-font);
    }
    .feishu-list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px 8px;
      flex-shrink: 0;
    }
    .feishu-list-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--fs-text);
      display: flex; align-items: center; gap: 8px;
    }
    .feishu-list-title svg { width: 17px; height: 17px; color: var(--fs-text-2); }
    .feishu-list-actions { display: flex; gap: 6px; }
    .feishu-list-nav-toggle[aria-expanded="true"] { color: var(--fs-accent); background: var(--fs-accent-soft); }
    .feishu-list-nav {
      display: none !important;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 12px 10px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--fs-border);
    }
    .feishu-list-nav.open,
    .feishu-list-panel.feishu-list-nav-open .feishu-list-nav {
      display: flex !important;
    }
    .feishu-list-nav a {
      display: inline-flex; align-items: center;
      height: 28px; padding: 0 10px;
      border-radius: 14px;
      font-size: 12px; line-height: 1;
      color: var(--fs-text-2) !important;
      text-decoration: none !important;
      border: 1px solid var(--fs-border) !important;
      background: var(--fs-bg);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .feishu-list-nav a:hover {
      background: var(--fs-hover);
      color: var(--fs-text) !important;
    }
    .feishu-list-nav a.active {
      background: var(--fs-accent-soft);
      color: var(--fs-accent) !important;
      border-color: #C2D4FF !important;
      font-weight: 500;
    }
    .feishu-icon-btn {
      width: 32px; height: 32px;
      border: none; border-radius: 8px;
      background: transparent; color: var(--fs-text-2);
      cursor: pointer; display: inline-flex;
      align-items: center; justify-content: center;
      transition: background 0.15s;
      padding: 0;
    }
    .feishu-icon-btn:hover { background: var(--fs-hover); }
    .feishu-icon-btn svg { width: 18px; height: 18px; }
    .feishu-list-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; }
    .feishu-list-body::-webkit-scrollbar { width: 6px; }
    .feishu-list-body::-webkit-scrollbar-thumb { background: var(--fs-border-strong); border-radius: 3px; }

    .feishu-conv {
      display: flex; gap: 12px;
      padding: 12px 16px;
      text-decoration: none !important;
      cursor: pointer;
      transition: background 0.15s;
      border: none !important;
    }
    .feishu-conv:hover { background: var(--fs-hover); }
    .feishu-conv.active { background: var(--fs-active); }
    .feishu-conv-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 15px; font-weight: 600;
    }
    /* 伪装文字头像：保持圆形；实心 / 空心；字数 3～5 */
    .feishu-conv-avatar.is-text-avatar {
      box-sizing: border-box;
      padding: 3px;
      letter-spacing: 0;
      text-align: center;
    }
    .feishu-conv-avatar .feishu-avatar-text {
      line-height: 1.05; font-weight: 600;
      overflow: hidden;
      word-break: break-all;
      max-width: 100%;
      font-size: 10px;
    }
    .feishu-conv-avatar .feishu-avatar-text[data-len="3"] { font-size: 12px; }
    /* 四字：两行，每行 2 个 */
    .feishu-conv-avatar .feishu-avatar-text[data-len="4"] {
      font-size: 11px;
      line-height: 1.15;
      width: 2.2em;
      text-align: center;
    }
    .feishu-conv-avatar .feishu-avatar-text[data-len="5"] { font-size: 9px; }
    .feishu-conv-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .feishu-mask-avatar-toggle.is-on {
      color: var(--fs-accent); background: var(--fs-accent-soft);
    }
    .feishu-conv-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .feishu-conv-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .feishu-conv-name {
      font-size: 14px; font-weight: 500; color: var(--fs-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .feishu-conv-time { font-size: 12px; color: var(--fs-text-3); flex-shrink: 0; }
    .feishu-conv-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .feishu-conv-msg {
      font-size: 13px; color: var(--fs-text-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .feishu-conv-badge {
      min-width: 18px; height: 18px; padding: 0 5px;
      background: var(--fs-danger); color: #fff;
      font-size: 11px; line-height: 18px; text-align: center;
      border-radius: 9px; flex-shrink: 0;
    }
    .feishu-list-status {
      padding: 14px; text-align: center;
      font-size: 12px; color: var(--fs-text-3);
    }

    /* ---------- 右栏：聊天详情 ---------- */
    .feishu-chat-panel {
      position: fixed;
      top: var(--fs-header-h);
      left: calc(var(--fs-nav) + var(--fs-nav2w) + var(--fs-strip) + var(--fs-list));
      right: 0; bottom: 0;
      background: var(--fs-chat-bg);
      display: flex; flex-direction: column;
      z-index: 420;
      font-family: var(--fs-font);
    }
    .feishu-chat-header {
      height: 56px; flex-shrink: 0;
      background: var(--fs-bg);
      border-bottom: 1px solid var(--fs-border);
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 0 20px; gap: 12px;
    }
    .feishu-chat-titles { min-width: 0; }
    .feishu-chat-title {
      font-size: 16px; font-weight: 600; color: var(--fs-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .feishu-chat-sub { font-size: 12px; color: var(--fs-text-3); margin-top: 1px; }
    .feishu-chat-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .feishu-chat-body {
      flex: 1; overflow-y: auto;
      padding: 20px 24px;
      display: flex; flex-direction: column; gap: 16px;
      overscroll-behavior: contain;
    }
    .feishu-chat-body::-webkit-scrollbar { width: 6px; }
    .feishu-chat-body::-webkit-scrollbar-thumb { background: var(--fs-border-strong); border-radius: 3px; }

    .feishu-msg { display: flex; gap: 10px; max-width: 78%; }
    .feishu-msg-other { align-self: flex-start; }
    .feishu-msg-me { align-self: flex-end; flex-direction: row-reverse; }
    .feishu-msg-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 14px; font-weight: 600;
    }
    .feishu-msg-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .feishu-msg-me .feishu-msg-avatar { display: none; }
    .feishu-msg-content { min-width: 0; display: flex; flex-direction: column; position: relative; }
    .feishu-msg-me .feishu-msg-content { align-items: flex-end; }
    .feishu-msg-name { font-size: 12px; color: var(--fs-text-3); margin-bottom: 4px; }
    .feishu-msg-me .feishu-msg-name { display: none; }
    .feishu-msg-bubble {
      padding: 10px 14px;
      font-size: 14px; line-height: 1.6;
      color: var(--fs-text);
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .feishu-msg-other .feishu-msg-bubble {
      background: var(--fs-bubble-other);
      border-radius: 2px 8px 8px 8px;
    }
    .feishu-msg-me .feishu-msg-bubble {
      background: var(--fs-bubble-me);
      border-radius: 8px 2px 8px 8px;
    }
    .feishu-msg-bubble p { margin: 0 0 8px; }
    .feishu-msg-bubble p:last-child { margin-bottom: 0; }
    .feishu-msg-bubble img { max-width: 100%; border-radius: 6px; }
    .feishu-msg-bubble pre {
      background: rgba(127,127,127,0.12);
      padding: 8px 10px; border-radius: 6px;
      overflow-x: auto; font-size: 13px;
    }
    .feishu-msg-bubble code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .feishu-msg-bubble blockquote {
      margin: 0 0 8px; padding: 4px 10px;
      border-left: 3px solid var(--fs-accent);
      background: rgba(51,112,255,0.06);
      border-radius: 0 6px 6px 0;
    }
    .feishu-msg-bubble a { color: var(--fs-accent); }
    .feishu-msg-meta {
      font-size: 11px; color: var(--fs-text-3);
      margin-top: 4px; display: flex; gap: 8px; align-items: center;
    }
    .feishu-msg-time-sep {
      align-self: center;
      font-size: 12px; color: var(--fs-text-3);
      padding: 2px 10px;
    }
    .feishu-msg-tools {
      position: absolute; top: -14px; right: 0; z-index: 5;
      display: flex; align-items: center; gap: 2px;
      background: var(--fs-bg);
      border: 1px solid var(--fs-border);
      border-radius: 8px;
      padding: 2px;
      box-shadow: 0 2px 8px rgba(31, 35, 41, 0.1);
      opacity: 0; visibility: hidden;
      transition: opacity 0.15s ease;
    }
    .feishu-msg:hover .feishu-msg-tools { opacity: 1; visibility: visible; }
    .feishu-msg-me .feishu-msg-tools { right: auto; left: 0; }
    .feishu-msg-tool {
      width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; cursor: pointer;
      border-radius: 6px; color: var(--fs-text-2);
      padding: 0;
    }
    .feishu-msg-tool svg { width: 15px; height: 15px; }
    .feishu-msg-tool:hover { background: var(--fs-hover); color: var(--fs-accent); }
    .feishu-msg-tool.liked { color: var(--fs-accent); }

    .feishu-chat-empty, .feishu-chat-error, .feishu-chat-loading {
      margin: auto;
      display: flex; flex-direction: column;
      align-items: center; gap: 10px;
      color: var(--fs-text-3); font-size: 14px;
      text-align: center; padding: 40px 20px;
    }
    .feishu-chat-empty svg, .feishu-chat-error svg {
      width: 56px; height: 56px; opacity: 0.5;
    }
    .feishu-empty-btn {
      margin-top: 6px;
      border: 1px solid var(--fs-border-strong);
      background: var(--fs-bg); color: var(--fs-text-2);
      border-radius: 6px; height: 32px; padding: 0 14px;
      font-size: 13px; cursor: pointer; font-family: var(--fs-font);
    }
    .feishu-empty-btn:hover { background: var(--fs-hover); }

    /* ---------- 右栏底部：IM 输入框 ---------- */
    .feishu-chat-compose {
      position: relative;
      z-index: 430;
      flex-shrink: 0;
      margin: 0 16px 14px;
      border: 1px solid var(--fs-border-strong);
      border-radius: 10px;
      background: var(--fs-bg);
      display: flex;
      flex-direction: column;
      padding: 10px 12px 8px;
      font-family: var(--fs-font);
      transition: border-color 0.15s, background 0.15s;
      pointer-events: auto !important;
    }
    .feishu-chat-compose.focused,
    .feishu-chat-compose:hover {
      border-color: #C2D4FF;
      background: var(--fs-accent-soft);
    }
    .feishu-chat-compose.busy { border-color: #C2D4FF; }
    .feishu-chat-compose.error {
      border-color: #F5C6C2;
      background: #FFF1F0;
    }
    .feishu-chat-panel[data-empty="1"] .feishu-chat-compose { display: none; }
    .feishu-composer-input {
      width: 100%;
      min-height: 24px;
      max-height: 160px;
      resize: none;
      border: none;
      background: transparent;
      color: var(--fs-text);
      font-size: 14px;
      line-height: 1.45;
      outline: none;
      padding: 0;
      margin: 0 0 6px;
      font-family: inherit;
    }
    .feishu-composer-input::placeholder { color: var(--fs-text-3); }
    .feishu-composer-target {
      display: none;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--fs-accent);
      margin-bottom: 6px;
    }
    .feishu-composer-target.active { display: flex; }
    .feishu-composer-target button {
      background: transparent; border: none; color: inherit; cursor: pointer;
      padding: 0; font-size: 12px;
    }
    .feishu-composer-tools {
      display: flex; align-items: center; gap: 6px;
    }
    .feishu-composer-tools .spacer { flex: 1; }
    .feishu-composer-tools .feishu-composer-status {
      font-size: 12px; color: var(--fs-text-3);
      max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .feishu-composer-tools .feishu-composer-status.error { color: var(--fs-danger); }
    .feishu-composer-tools .feishu-composer-status.busy { color: var(--fs-accent); }
    .feishu-composer-tools .feishu-composer-status.success { color: #2EA44F; }
    .feishu-composer-tools .feishu-icon-btn {
      width: 28px; height: 28px;
      border: none; border-radius: 6px;
      background: transparent; color: var(--fs-text-3);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      padding: 0;
    }
    .feishu-composer-tools .feishu-icon-btn:hover { background: var(--fs-hover); color: var(--fs-text); }
    .feishu-composer-tools .feishu-icon-btn svg { width: 18px; height: 18px; }
    .feishu-composer-send {
      height: 28px; padding: 0 14px;
      border: none; border-radius: 6px;
      background: var(--fs-accent); color: #fff;
      font-size: 13px; cursor: pointer;
      opacity: 1; transition: opacity 0.15s;
    }
    .feishu-composer-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .feishu-composer-send:hover:not(:disabled) { filter: brightness(1.05); }
    .feishu-composer-file { display: none; }

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
      left: calc(var(--fs-nav) + var(--fs-nav2w) + var(--fs-strip) + var(--fs-list)) !important;
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
    .feishu-mode-fab {
      position: fixed; right: 20px; bottom: 20px; z-index: 10000;
      width: 44px; height: 44px; border-radius: 50%;
      background: #3370FF; color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(51,112,255,0.4);
    }
    .feishu-mode-fab svg { width: 22px; height: 22px; }

    /* ---------- splash ---------- */
    .${ROOT_CLASS} #d-splash { background: var(--fs-bg) !important; }
    .${ROOT_CLASS} #d-splash .preloader-image { display: none !important; }
    .${ROOT_CLASS} #d-splash .splash-logo-container {
      width: 96px !important; height: 96px !important;
      background-image: var(--fs-splash-logo) !important;
      background-size: contain !important;
      background-repeat: no-repeat !important;
      animation: none !important;
    }
    .${ROOT_CLASS} #d-splash .dots { background-color: #3370FF !important; filter: none !important; }

    /* ---------- 窄屏降级 ---------- */
    @media (max-width: 1280px) {
      .${ROOT_CLASS} { --fs-list: 320px; }
    }
    @media (max-width: 1000px) {
      .${ROOT_CLASS} { --fs-nav2w: 0px !important; --fs-strip: 0px !important; }
      .feishu-strip { display: none; }
      .${ROOT_CLASS}.${LOCK_CLASS} .feishu-list-panel { width: calc(100% - var(--fs-nav)); left: var(--fs-nav); }
      .${ROOT_CLASS}.${LOCK_CLASS}.feishu-topic-open .feishu-list-panel { display: none; }
      .${ROOT_CLASS}.${LOCK_CLASS}:not(.feishu-topic-open) .feishu-chat-panel { display: none; }
      .${ROOT_CLASS}.${LOCK_CLASS} .feishu-chat-panel { left: var(--fs-nav); }
      .${ROOT_CLASS}.${LOCK_CLASS} #reply-control { left: calc(var(--fs-nav) + 12px) !important; right: 12px !important; }
    }

    /* ---------- 深色模式 token + 硬编码覆盖 ---------- */
    .${ROOT_CLASS}.${DARK_CLASS} {
      color-scheme: dark !important;
      --fs-accent: #4C82FF;
      --fs-accent-soft: #1A2A4D;
      --fs-nav2-bg: #1B1F26;
      --fs-nav2-border: #2A3038;
      --fs-text: #E5E6EB;
      --fs-text-2: #A0A6B0;
      --fs-text-3: #7B828C;
      --fs-bg: #171A1F;
      --fs-chat-bg: #12151A;
      --fs-hover: #22272E;
      --fs-active: #243148;
      --fs-bubble-other: #2A2F36;
      --fs-bubble-me: #1A2F55;
      --fs-border: #2A3038;
      --fs-border-strong: #3A424C;
      --fs-danger: #F54840;
      --fs-rail-bg: #1B2230;
      --fs-strip-bg: #171A1F;
      --header_background: #171A1F;
      --header_primary: var(--fs-text);
      --secondary: var(--fs-bg);
      --primary: var(--fs-text);
      --primary-medium: var(--fs-text-2);
      --primary-low: var(--fs-text-3);
      --d-hover: var(--fs-hover);
    }
    html.${ROOT_CLASS}.${DARK_CLASS},
    html.${ROOT_CLASS}.${DARK_CLASS} body {
      color-scheme: dark !important;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-rail-toggle:hover {
      background: rgba(255,255,255,0.08);
    }
    .${ROOT_CLASS}.${DARK_CLASS}.feishu-nav2-open .feishu-rail-toggle {
      background: #2A3140;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-dark-toggle:hover {
      background: rgba(255,255,255,0.08);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-rail-item.active {
      background: #2A3140;
      box-shadow: none;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-list-panel,
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-list-header,
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-list-body {
      background: var(--fs-bg);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-chat-panel,
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-chat-header {
      background: var(--fs-chat-bg);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-chat-header {
      border-bottom-color: var(--fs-border);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-list-header {
      border-bottom-color: var(--fs-border);
    }
    html.${ROOT_CLASS}.${DARK_CLASS} body .sidebar-wrapper {
      background-color: var(--fs-nav2-bg) !important;
      --primary: var(--fs-text);
      --primary-medium: var(--fs-text-2);
      --primary-low: var(--fs-text-3);
      --primary-low-mid: #6B7280;
      --primary-very-low: #22272E;
      --primary-50: #1B1F26;
      --primary-100: #22272E;
      --primary-200: #2A3038;
      --primary-300: #3A424C;
      --secondary: var(--fs-nav2-bg);
      --tertiary: var(--fs-accent);
      --quaternary: var(--fs-accent);
      --d-hover: var(--fs-hover);
      --d-sidebar-background: var(--fs-nav2-bg);
      --d-sidebar-border-color: var(--fs-border);
      color: var(--fs-text);
    }
    .${ROOT_CLASS}.${DARK_CLASS}.feishu-notif-open .user-menu.feishu-user-menu-float,
    .${ROOT_CLASS}.${DARK_CLASS}.feishu-notif-open .user-menu.revamped.menu-panel.feishu-user-menu-float,
    .${ROOT_CLASS}.${DARK_CLASS}.feishu-notif-open .user-menu.menu-panel.feishu-user-menu-float {
      background: var(--fs-bg) !important;
      color: var(--fs-text) !important;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45) !important;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-rail-avatar.is-notif-pinned {
      box-shadow: 0 0 0 2px var(--fs-rail-bg), 0 0 0 4px var(--fs-accent);
    }
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-chat-compose.error {
      border-color: #7A3A3A;
      background: #2A1A1A;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-chat-compose:hover,
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-chat-compose.focused,
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-chat-compose.busy {
      border-color: #3B5F8A;
    }
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-composer-input { color: var(--fs-text); }
    .${ROOT_CLASS}.${DARK_CLASS} .feishu-composer-tools .feishu-icon-btn:hover { background: rgba(255,255,255,0.08); }
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
      let shortcut = head.querySelector("link[data-feishu-shortcut='1']");
      if (!shortcut) {
        shortcut = document.createElement("link");
        shortcut.rel = "shortcut icon";
        shortcut.type = "image/x-icon";
        shortcut.dataset.feishuShortcut = "1";
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
      "--fs-splash-logo",
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
  function ideaThemeActive() {
    return !!document.getElementById("linuxdo-idea-theme") ||
      document.documentElement.classList.contains("idea-ide-theme");
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
    if (ideaThemeActive()) return;

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
      if (forcingScheme || ideaThemeActive()) return;
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
    const btn = document.querySelector(".feishu-dark-toggle");
    if (!btn) return;
    const on = isDarkPreferred();
    btn.title = on ? "深色模式：开（点击切回浅色）" : "深色模式：关（点击开启）";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.classList.toggle("is-on", on);
    const icon = on ? ICONS.sun : ICONS.moon;
    const label = on ? "浅色" : "深色";
    btn.innerHTML = `${icon}<span>${label}</span>`;
  }

  function ensureDarkModeToggle(rail) {
    if (!rail) return;
    let bottom = rail.querySelector(".feishu-rail-bottom");
    if (!bottom) {
      bottom = document.createElement("div");
      bottom.className = "feishu-rail-bottom";
      rail.appendChild(bottom);
    }
    let btn = bottom.querySelector(".feishu-dark-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "feishu-rail-item feishu-dark-toggle";
      bottom.appendChild(btn);
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

  const NAV2_KEY = "linuxdo-feishu-nav2"; // "1" = 展开原生侧栏

  function isNav2Open() {
    try { return localStorage.getItem(NAV2_KEY) === "1"; } catch { return false; }
  }

  function setNav2Open(open) {
    try { localStorage.setItem(NAV2_KEY, open ? "1" : "0"); } catch { /* ignore */ }
    document.documentElement.classList.toggle("feishu-nav2-open", open);
  }

  /** 最左栏装饰项（复刻飞书导航，均不可点击；仅「消息」带未读红点） */
  const RAIL_DECO_ITEMS = [
    { key: "calendar", icon: "calendar", label: "日历" },
    { key: "worktable", icon: "worktable", label: "工作台" },
    { key: "cloud", icon: "cloud", label: "云文档" },
    { key: "wiki", icon: "wiki", label: "知识库" },
    { key: "task", icon: "task", label: "任务" },
    { key: "contacts", icon: "contacts", label: "联系人" },
    { key: "project", icon: "project", label: "项目" },
    { key: "more", icon: "more", label: "更多" }
  ];

  function bindRailSearch(rail) {
    if (!rail) return;
    let wrap = rail.querySelector(".feishu-rail-search");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "feishu-rail-search";
      const head = rail.querySelector(".feishu-rail-head");
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

  function ensureRail() {
    let rail = document.querySelector(".feishu-rail");
    if (rail) {
      bindRailSearch(rail);
      bindRailAvatarNotif(rail);
      ensureDarkModeToggle(rail);
      syncRail();
      return rail;
    }
    rail = document.createElement("nav");
    rail.className = "feishu-rail";
    rail.setAttribute("aria-label", "飞书风导航");

    // 顶行：头像（hover 弹出原生通知，角标显示未读）+ 圆圈展开钮
    const head = document.createElement("div");
    head.className = "feishu-rail-head";
    const avatarWrap = document.createElement("div");
    avatarWrap.className = "feishu-rail-avatar-wrap";
    avatarWrap.innerHTML =
      `<div class="feishu-rail-avatar"></div>` +
      `<span class="feishu-rail-avatar-badge" style="display:none"></span>`;
    head.appendChild(avatarWrap);
    const toggle = document.createElement("button");
    toggle.className = "feishu-rail-toggle";
    toggle.title = "展开 / 收起大类";
    toggle.innerHTML = ICONS.menu;
    toggle.addEventListener("click", () => setNav2Open(!isNav2Open()));
    head.appendChild(toggle);
    rail.appendChild(head);

    // 最左栏真实搜索框（外观自绘，输入同步原生 welcome-banner）
    const search = document.createElement("div");
    search.className = "feishu-rail-search";
    search.innerHTML = `
      <form action="/search" method="get" role="search">
        ${ICONS.search}
        <input type="search" name="q" placeholder="搜索" autocomplete="off" enterkeyhint="search" aria-label="搜索">
      </form>`;
    rail.appendChild(search);

    // 文字导航（装饰；「消息」常驻 active 并带未读红点）
    const items = document.createElement("div");
    items.className = "feishu-rail-items";
    items.innerHTML =
      `<div class="feishu-rail-item active" data-rail-key="chat">${navIcon("chat")}<span>消息</span>` +
      `<span class="feishu-rail-badge" style="display:none"></span></div>` +
      RAIL_DECO_ITEMS.map((item) =>
        `<div class="feishu-rail-item">${navIcon(item.icon)}<span>${item.label}</span></div>`
      ).join("");
    rail.appendChild(items);

    document.body.appendChild(rail);
    bindRailSearch(rail);
    bindRailAvatarNotif(rail);
    ensureDarkModeToggle(rail);
    syncRail();
    return rail;
  }

  function ensureRailAvatarWrap(rail) {
    if (!rail) return null;
    const head = rail.querySelector(".feishu-rail-head");
    if (!head) return null;
    let wrap = head.querySelector(".feishu-rail-avatar-wrap");
    let avatar = head.querySelector(".feishu-rail-avatar");
    if (!wrap && avatar) {
      wrap = document.createElement("div");
      wrap.className = "feishu-rail-avatar-wrap";
      avatar.replaceWith(wrap);
      wrap.appendChild(avatar);
    }
    if (wrap && !wrap.querySelector(".feishu-rail-avatar-badge")) {
      wrap.insertAdjacentHTML(
        "beforeend",
        `<span class="feishu-rail-avatar-badge" style="display:none"></span>`
      );
    }
    return wrap?.querySelector(".feishu-rail-avatar") || avatar;
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
    const rail = document.querySelector(".feishu-rail");
    if (!rail) return;
    const avatarEl = ensureRailAvatarWrap(rail);
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
    const avatarBadge = rail.querySelector(".feishu-rail-avatar-badge");
    if (avatarBadge) {
      avatarBadge.style.display = notifCount > 0 ? "" : "none";
      avatarBadge.textContent = notifCount > 99 ? "99+" : String(notifCount);
    }

    // 「消息」项未读（中栏话题求和）
    const unread = listState.topics.reduce((sum, t) => sum + (t.unread || 0) + (t.new_posts || 0), 0);
    const badge = rail.querySelector('[data-rail-key="chat"] .feishu-rail-badge');
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
        console.warn("[linuxdo-feishu] header.userVisible failed", err);
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
        console.warn("[linuxdo-feishu] app-events user menu failed", err);
      }
    }
    return false;
  }

  function setNotifOpenClass(open) {
    document.documentElement.classList.toggle("feishu-notif-open", !!open);
  }

  function positionNotifMenu(menu) {
    if (!menu || !notifWantOpen) return;
    // 顶栏被 opacity:0 / clip 藏起来；菜单必须挪到 body 才能看见
    if (menu.parentElement !== document.body) {
      document.body.appendChild(menu);
    }
    menu.classList.add("feishu-user-menu-float", "show-avatars");
    // 显隐交给 html.feishu-notif-open；这里清掉 Discourse 内联定位
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
    let style = document.getElementById("feishu-unlock-header");
    if (!style) {
      style = document.createElement("style");
      style.id = "feishu-unlock-header";
      style.textContent = `
        html.feishu-im-theme.feishu-notif-opening .d-header-wrap,
        html.feishu-im-theme.feishu-notif-opening .d-header {
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
    document.documentElement.classList.add("feishu-notif-opening");
  }

  function lockHeaderAfterNotif() {
    document.documentElement.classList.remove("feishu-notif-opening");
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
      console.warn("[linuxdo-feishu] setUserMenuVisible threw", err);
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
        console.warn("[linuxdo-feishu] openNotifMenu: menu not found", {
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
    document.documentElement.classList.toggle("feishu-notif-pinned", notifPinned);
    const avatar = document.querySelector(".feishu-rail-avatar");
    if (avatar) avatar.classList.toggle("is-notif-pinned", notifPinned);
  }

  function hideNotifMenuNode(menu) {
    if (!menu) return;
    delete menu.dataset.feishuHoverBound;
    // 先靠 html.feishu-notif-open 隐藏；再尽量拆掉节点，防止 Ember 残留
    menu.classList.remove("show-avatars");
    try {
      menu.remove();
    } catch {
      menu.classList.remove("feishu-user-menu-float");
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
    document.querySelectorAll(".user-menu.feishu-user-menu-float, .feishu-user-menu-float").forEach(hideNotifMenuNode);
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
      const avatar = document.querySelector(".feishu-rail-avatar");
      const menu = findUserMenu();
      const overAvatar = !!(avatar && avatar.matches(":hover"));
      const overMenu = !!(menu && menu.classList.contains("feishu-user-menu-float") && menu.matches(":hover"));
      if (!overAvatar && !overMenu) closeNotifMenu();
    }, 220);
  }

  function bindNotifMenuHover(menu) {
    if (!menu || menu.dataset.feishuHoverBound === "1") return;
    menu.dataset.feishuHoverBound = "1";
    menu.addEventListener("mouseenter", clearNotifLeaveTimer);
    menu.addEventListener("mouseleave", scheduleCloseNotifMenu);
  }

  function ensureNotifMenuObserver() {
    if (notifMenuObserver) return;
    notifMenuObserver = new MutationObserver(() => {
      if (getViewMode() === "native" || ideaThemeActive()) return;
      if (!notifWantOpen) return;
      adoptNotifMenuIfAny();
    });
    notifMenuObserver.observe(document.body, { childList: true, subtree: true });
  }

  function isNotifMenuOpen() {
    return notifPinned || document.documentElement.classList.contains("feishu-notif-open");
  }

  function ensureNotifOutsideClose() {
    if (window.__feishuNotifOutsideBound) return;
    window.__feishuNotifOutsideBound = true;
    const onOutside = (e) => {
      if (!isNotifMenuOpen()) return;
      const avatar = document.querySelector(".feishu-rail-avatar");
      const menu = document.querySelector(".user-menu.feishu-user-menu-float, .feishu-user-menu-float");
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
    const avatar = rail?.querySelector(".feishu-rail-avatar");
    if (!avatar || avatar.dataset.notifBound === "1") return;
    avatar.dataset.notifBound = "1";
    avatar.removeAttribute("title");
    ensureNotifOutsideClose();

    avatar.addEventListener("mouseenter", () => {
      if (getViewMode() === "native" || ideaThemeActive()) return;
      if (notifPinned) return;
      if (Date.now() < notifIgnoreHoverUntil) return;
      clearNotifLeaveTimer();
      ensureNotifMenuObserver();
      openNotifMenu();
    });
    avatar.addEventListener("mouseleave", scheduleCloseNotifMenu);

    // 点击头像：未钉住 → 钉住；已钉住 → 收起
    avatar.addEventListener("click", (e) => {
      if (getViewMode() === "native" || ideaThemeActive()) return;
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
      `<div class="feishu-strip-item">${ICONS[it.icon]}` +
      (it.badge ? `<span class="feishu-strip-badge">${it.badge}</span>` : "") +
      `</div>`
    ).join("");
  }

  function ensureStrip() {
    let strip = document.querySelector(".feishu-strip");
    // 若误挂了原生 user-menu，挪回 body 再重建装饰条
    const trapped = strip?.querySelector(".user-menu");
    if (trapped) document.body.appendChild(trapped);

    const needsRebuild = !strip || !strip.querySelector(".feishu-strip-item") || !!strip.querySelector(".user-menu");
    if (!strip) {
      strip = document.createElement("div");
      strip.className = "feishu-strip";
      strip.innerHTML = stripFakeHtml();
      document.body.appendChild(strip);
    } else if (needsRebuild) {
      strip.className = "feishu-strip";
      strip.innerHTML = stripFakeHtml();
    }
    return strip;
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

  const RAIL_W_KEY = "linuxdo-feishu-nav-w"; // 左侧导航栏宽度持久化（像素）
  const RAIL_W_MIN = 180;
  const RAIL_W_MAX = 480;

  const LIST_W_KEY = "linuxdo-feishu-list-w"; // 中栏宽度持久化（像素）
  const LIST_W_MIN = 280;
  const LIST_W_MAX = 640;

  const LIST_NAV_KEY = "linuxdo-feishu-list-nav"; // "1" = 展开中栏筛选
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
    const panel = document.querySelector(".feishu-list-panel");
    const nav = document.querySelector(".feishu-list-nav");
    const btn = document.querySelector(".feishu-list-nav-toggle");
    if (panel) panel.classList.toggle("feishu-list-nav-open", listNavOpen);
    if (nav) nav.classList.toggle("open", listNavOpen);
    if (btn) {
      btn.setAttribute("aria-expanded", listNavOpen ? "true" : "false");
      btn.title = listNavOpen ? "收起筛选" : "展开筛选";
      const mark = listNavOpen ? "1" : "0";
      if (btn.dataset.icon !== mark) {
        btn.dataset.icon = mark;
        btn.innerHTML = listNavOpen ? ICONS.chevronUp : ICONS.chevronDown;
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
    const nav = document.querySelector(".feishu-list-nav");
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
      const maskBtn = e.target.closest(".feishu-mask-avatar-toggle");
      if (maskBtn && panel.contains(maskBtn)) {
        e.preventDefault();
        e.stopPropagation();
        setMaskAvatar(!isMaskAvatar());
        return;
      }

      const btn = e.target.closest(".feishu-list-nav-toggle");
      if (btn && panel.contains(btn)) {
        e.preventDefault();
        e.stopPropagation();
        setListNavOpen(!listNavOpen);
        return;
      }

      // 会话/置顶：拦截默认跳转，走 Discourse SPA / pushState
      const link = e.target.closest("a.feishu-conv, a.feishu-pin, .feishu-list-nav a");
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
    let panel = document.querySelector(".feishu-list-panel");
    // 旧面板缺筛选按钮/容器时重建，避免「看得到旧壳、点了没反应」
    if (panel && (!panel.querySelector(".feishu-list-nav-toggle") || !panel.querySelector(".feishu-list-nav"))) {
      panel.remove();
      panel = null;
    }
    if (panel) {
      bindListPanelClicks(panel);
      ensureMaskAvatarToggle(panel);
      applyListNavDom();
      ensureListResizer();
      return panel;
    }
    panel = document.createElement("div");
    panel.className = "feishu-list-panel";
    panel.innerHTML = `
      <div class="feishu-list-header">
        <div class="feishu-list-title">${ICONS.list}<span>消息</span></div>
        <div class="feishu-list-actions">
          <button type="button" class="feishu-icon-btn feishu-mask-avatar-toggle" title="伪装头像：关（点击开启）" aria-pressed="false">${ICONS.disguise}</button>
          <button type="button" class="feishu-icon-btn feishu-list-nav-toggle" title="展开筛选" aria-expanded="false">${ICONS.chevronDown}</button>
        </div>
      </div>
      <div class="feishu-list-nav" role="navigation" aria-label="话题筛选"></div>
      <div class="feishu-list-pins" style="display:none"></div>
      <div class="feishu-list-body"></div>
    `;
    document.body.appendChild(panel);
    bindListPanelClicks(panel);
    ensureMaskAvatarToggle(panel);
    ensureListResizer();
    panel.querySelector(".feishu-list-body").addEventListener("scroll", () => {
      const body = panel.querySelector(".feishu-list-body");
      if (body.scrollTop + body.clientHeight >= body.scrollHeight - 120) {
        loadMoreList();
      }
    });
    applyListNavDom();
    return panel;
  }

  /* ---------- 会话列表宽度拖拽 ---------- */

  function getCustomListWidth() {
    try {
      const w = Number(localStorage.getItem(LIST_W_KEY));
      return Number.isFinite(w) && w >= LIST_W_MIN && w <= LIST_W_MAX ? Math.round(w) : 0;
    } catch { return 0; }
  }

  function applyListWidth(px) {
    if (px) document.documentElement.style.setProperty("--fs-list", px + "px");
    else document.documentElement.style.removeProperty("--fs-list");
  }

  /** 窄屏走响应式规则，不应用自定义宽度 */
  function syncListWidthPref() {
    applyListWidth(window.matchMedia("(max-width: 1280px)").matches ? 0 : getCustomListWidth());
  }

  /** 列分隔条通用拖拽：按下落在把手，move/up 挂 window，即使指针滑出热区也不会中断 */
  function attachColumnDrag(handle, opts) {
    let dragging = false;
    let startX = 0;
    let startW = 0;
    let lastW = 0;

    handle.addEventListener("pointerdown", (e) => {
      const w = opts.width();
      if (!Number.isFinite(w)) return;
      e.preventDefault();
      e.stopPropagation();
      dragging = true;
      startX = e.clientX;
      startW = w;
      lastW = w;
      handle.classList.add("dragging");
      document.body.classList.add("feishu-col-resizing");
    });

    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const cap = opts.maxWidth ? opts.maxWidth() : opts.max;
      const maxWidth = Math.max(opts.min, Math.min(opts.max, cap));
      lastW = Math.round(Math.min(maxWidth, Math.max(opts.min, startW + e.clientX - startX)));
      opts.apply(lastW);
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove("dragging");
      document.body.classList.remove("feishu-col-resizing");
      try { localStorage.setItem(opts.key, String(lastW)); } catch { /* ignore */ }
    };
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    handle.addEventListener("dblclick", () => {
      try { localStorage.removeItem(opts.key); } catch { /* ignore */ }
      opts.reset();
    });
  }

  function getCustomNavWidth() {
    try {
      const w = Number(localStorage.getItem(RAIL_W_KEY));
      return Number.isFinite(w) && w >= RAIL_W_MIN && w <= RAIL_W_MAX ? Math.round(w) : 0;
    } catch { return 0; }
  }

  function applyNavWidth(px) {
    if (px) document.documentElement.style.setProperty("--fs-nav", px + "px");
    else document.documentElement.style.removeProperty("--fs-nav");
  }

  /** 左侧导航栏右缘：拖拽调宽（布局偏移全部走 --fs-nav，自动跟随） */
  function ensureRailResizer() {
    let handle = document.querySelector(".feishu-rail-resizer");
    if (handle) return handle;

    handle = document.createElement("div");
    handle.className = "feishu-rail-resizer";
    handle.title = "拖拽调整左侧栏宽度（双击恢复默认）";
    attachColumnDrag(handle, {
      key: RAIL_W_KEY,
      min: RAIL_W_MIN,
      max: RAIL_W_MAX,
      width: () => document.querySelector(".feishu-rail")?.getBoundingClientRect().width ?? NaN,
      maxWidth: () => window.innerWidth - 700, // 保证右侧至少留出 strip+列表+聊天
      apply: applyNavWidth,
      reset: () => applyNavWidth(0)
    });
    const stored = getCustomNavWidth();
    if (stored) applyNavWidth(stored);
    document.body.appendChild(handle);
    return handle;
  }

  function ensureListResizer() {
    let handle = document.querySelector(".feishu-list-resizer");
    if (handle) return handle;

    handle = document.createElement("div");
    handle.className = "feishu-list-resizer";
    handle.title = "拖拽调整会话列表宽度（双击恢复默认）";
    attachColumnDrag(handle, {
      key: LIST_W_KEY,
      min: LIST_W_MIN,
      max: LIST_W_MAX,
      width: () => document.querySelector(".feishu-list-panel")?.getBoundingClientRect().width ?? NaN,
      maxWidth: () => {
        const left = document.querySelector(".feishu-list-panel")?.getBoundingClientRect().left;
        return Number.isFinite(left) ? window.innerWidth - left - 320 : LIST_W_MAX; // 给聊天区留出最小可读空间
      },
      apply: applyListWidth,
      reset: () => applyListWidth(0)
    });

    syncListWidthPref();
    window.addEventListener("resize", () => syncListWidthPref());
    document.body.appendChild(handle);
    return handle;
  }

  function topicHref(topic) {
    return `/t/${topic.slug || "topic"}/${topic.id}`;
  }

  function convRowHtml(topic, usersById) {
    const poster = (topic.posters || [])[0];
    const user = poster && usersById ? usersById[poster.user_id] : null;
    const name = (user && user.username) || topic.last_poster_username || "?";
    const tid = Math.abs(Number(topic.id) || 0);
    let avatarHtml;
    let avatarBg;
    let avatarClass = "";
    let avatarStyleExtra = "";
    if (isMaskAvatar()) {
      const d = disguiseAvatarForTopic(topic);
      avatarHtml = d.html;
      avatarBg = d.bg;
      avatarClass = d.className ? ` ${d.className}` : "";
      avatarStyleExtra = d.styleExtra || "";
    } else {
      // 约四分之一的会话用飞书彩色图标当头像（模拟应用/机器人会话，按话题 id 稳定取值）
      const useIcon = tid % 4 === 1;
      avatarHtml = useIcon
        ? `<img src="${CHAT_ICONS[(tid * 31) % CHAT_ICONS.length]}" alt="" loading="lazy">`
        : user && user.avatar_template
          ? `<img src="${escapeHtml(fullAvatarUrl(user.avatar_template))}" alt="" loading="lazy">`
          : escapeHtml(avatarLetter(name));
      avatarBg = useIcon ? "transparent" : avatarColor(name);
    }
    const unread = topic.unread > 0 ? topic.unread : (topic.new_posts > 0 ? topic.new_posts : 0);
    const replyCount = Math.max(0, (topic.posts_count || 1) - 1);
    const rawSummary = topic.last_poster_username
      ? `[${replyCount}条] ${topic.last_poster_username}`
      : `${topic.posts_count || 0} 回复`;
    const title = convDisplayTitle(topic);
    const summary = convDisplaySummary(topic, rawSummary);
    return `
      <a class="feishu-conv" href="${escapeHtml(topicHref(topic))}" data-topic-id="${topic.id}" title="${escapeHtml(title)}">
        <span class="feishu-conv-avatar${avatarClass}" style="background:${avatarBg};${avatarStyleExtra}">${avatarHtml}</span>
        <span class="feishu-conv-info">
          <span class="feishu-conv-top">
            <span class="feishu-conv-name">${escapeHtml(title)}</span>
            <span class="feishu-conv-time">${escapeHtml(formatTime(topic.last_activity_at))}</span>
          </span>
          <span class="feishu-conv-bottom">
            <span class="feishu-conv-msg">${escapeHtml(summary)}</span>
            ${unread ? `<span class="feishu-conv-badge">${unread > 99 ? "99+" : unread}</span>` : ""}
          </span>
        </span>
      </a>`;
  }

  function renderPins() {
    const box = document.querySelector(".feishu-list-pins");
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
        const d = disguiseAvatarForTopic(t);
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
        <a class="feishu-pin" href="${escapeHtml(topicHref(t))}" title="${escapeHtml(pinTitle)}">
          <span class="feishu-pin-avatar${cls}" style="background:${bg};${styleExtra}">${inner}</span>
          <span class="feishu-pin-name">${escapeHtml(pinTitle.slice(0, 6))}</span>
        </a>`;
    }).join("");
  }

  function renderListRows() {
    const body = document.querySelector(".feishu-list-body");
    if (!body) return;
    const usersById = listState.usersById || {};
    body.innerHTML =
      listState.topics.map((t) => convRowHtml(t, usersById)).join("") +
      `<div class="feishu-list-status">${listState.moreUrl ? "下拉加载更多…" : (listState.topics.length ? "没有更多了" : "")}</div>`;
    renderPins();
    syncListActive();
  }

  function syncListActive() {
    const currentId = topicIdFromPath(location.pathname);
    for (const row of document.querySelectorAll(".feishu-conv")) {
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
      const body = document.querySelector(".feishu-list-body");
      if (body) body.innerHTML = `<div class="feishu-list-status">列表加载失败，请点右上角刷新重试</div>`;
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
    let panel = document.querySelector(".feishu-chat-panel");
    if (panel && !panel.querySelector(".feishu-chat-compose")) {
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
    panel.className = "feishu-chat-panel";
    panel.dataset.empty = "1";
    panel.dataset.composeBound = "1";
    panel.innerHTML = `
      <div class="feishu-chat-header">
        <div class="feishu-chat-head-main">
          <span class="feishu-chat-avatar" style="display:none"></span>
          <div class="feishu-chat-titles">
            <div class="feishu-chat-title"></div>
            <div class="feishu-chat-sub"></div>
          </div>
        </div>
        <div class="feishu-chat-actions">
          <button class="feishu-icon-btn feishu-chat-refresh" title="刷新本话题">${ICONS.refresh}</button>
          <button class="feishu-icon-btn feishu-chat-native" title="切换原生视图">${ICONS.external}</button>
        </div>
      </div>
      <div class="feishu-chat-tabs" style="display:none">
        <a class="feishu-chat-tab active">消息</a>
        <a class="feishu-chat-tab feishu-chat-tab-cat" style="display:none"></a>
      </div>
      <div class="feishu-chat-body"></div>
      <div class="feishu-chat-compose" data-feishu-compose="1">
        <div class="feishu-composer-target"><span></span><button type="button" title="取消回复">×</button></div>
        <textarea class="feishu-composer-input" rows="1" placeholder="按 Enter 发送，Shift+Enter 换行"></textarea>
        <div class="feishu-composer-tools">
          <button type="button" class="feishu-icon-btn feishu-composer-image" title="上传图片">${ICONS.pic}</button>
          <input type="file" class="feishu-composer-file" accept="image/*" multiple>
          <div class="spacer"></div>
          <span class="feishu-composer-status"></span>
          <button type="button" class="feishu-composer-send" disabled>发送</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
    bindChatPanelEvents(panel);
    wireComposer(panel);
    return panel;
  }

  function wireComposer(panel) {
    const box = panel.querySelector(".feishu-chat-compose");
    if (!box || box.dataset.wired === "1") return;
    box.dataset.wired = "1";

    const input = box.querySelector(".feishu-composer-input");
    const send = box.querySelector(".feishu-composer-send");
    const imageBtn = box.querySelector(".feishu-composer-image");
    const fileInput = box.querySelector(".feishu-composer-file");
    const target = box.querySelector(".feishu-composer-target");
    const targetClose = target?.querySelector("button");

    function updateSendState() {
      const empty = !input.value.trim();
      send.disabled = composerState.submitting || composerState.uploading || empty;
      if (!empty) box.classList.add("focused");
    }
    updateSendState();
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 160) + "px";
      updateSendState();
    });
    input.addEventListener("focus", () => box.classList.add("focused"));
    input.addEventListener("blur", () => { if (!input.value.trim()) box.classList.remove("focused"); });
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

    imageBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });
    fileInput.addEventListener("change", (e) => {
      uploadComposerFiles(e.target.files);
      e.target.value = "";
    });

    input.addEventListener("paste", (e) => handleComposerPaste(e));
    box.addEventListener("drop", (e) => handleComposerDrop(e));
    box.addEventListener("dragover", (e) => { e.preventDefault(); });

    targetClose?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideTargetedReply();
      input.focus();
    });
  }

  function bindChatPanelEvents(panel) {
    panel.addEventListener("click", (e) => {
      if (e.target.closest(".feishu-chat-refresh")) {
        if (chatState.topicId) {
          chatState.topicId = null;
          loadTopic(topicIdFromPath(location.pathname));
        }
        return;
      }
      if (e.target.closest(".feishu-chat-native")) {
        setViewMode("native");
        location.reload();
        return;
      }
      if (e.target.closest(".feishu-composer-input, .feishu-composer-tools, .feishu-composer-target")) {
        return;
      }
      const toolBtn = e.target.closest(".feishu-msg-tool");
      if (!toolBtn || !panel.contains(toolBtn)) return;
      const msg = toolBtn.closest(".feishu-msg");
      if (!msg) return;
      if (toolBtn.dataset.action === "like") {
        toggleLike(Number(msg.dataset.postId), toolBtn);
      } else if (toolBtn.dataset.action === "reply") {
        e.preventDefault();
        e.stopPropagation();
        replyToPost(Number(msg.dataset.postNumber));
      }
    });
    panel.querySelector(".feishu-chat-body").addEventListener("scroll", () => {
      const body = panel.querySelector(".feishu-chat-body");
      if (body.scrollTop < 80) loadOlderPosts();
      if (body.scrollTop + body.clientHeight >= body.scrollHeight - 120) loadNewerPosts();
      trackVisibleTopicPost();
    });
  }

  function renderChatEmpty() {
    ensureChatPanel();
    chatState.topicId = null;
    const panel = document.querySelector(".feishu-chat-panel");
    if (panel) panel.dataset.empty = "1";
    const body = document.querySelector(".feishu-chat-body");
    if (!body || body.dataset.state === "empty") return;
    body.dataset.state = "empty";
    const title = document.querySelector(".feishu-chat-title");
    const sub = document.querySelector(".feishu-chat-sub");
    if (title) title.textContent = "";
    if (sub) sub.textContent = "";
    const chatAvatar = document.querySelector(".feishu-chat-avatar");
    if (chatAvatar) chatAvatar.style.display = "none";
    const tabs = document.querySelector(".feishu-chat-tabs");
    if (tabs) tabs.style.display = "none";
    body.innerHTML = `
      <div class="feishu-chat-empty">
        ${ICONS.chat}
        <div>从左侧列表选择一个话题开始阅读</div>
      </div>`;
  }

  function renderChatError(message) {
    const body = document.querySelector(".feishu-chat-body");
    if (!body) return;
    body.innerHTML = `
      <div class="feishu-chat-error">
        ${ICONS.chat}
        <div>${escapeHtml(message)}</div>
        <button class="feishu-empty-btn" onclick="location.reload()">打开原生页面</button>
      </div>`;
  }

  const likedPosts = new Set();

  function bubbleHtml(post, myName) {
    const me = isMyPost(post, myName);
    const side = me ? "me" : "other";
    const avatar = post.avatar_template
      ? `<img src="${escapeHtml(fullAvatarUrl(post.avatar_template))}" alt="" loading="lazy">`
      : escapeHtml(avatarLetter(post.username));
    const liked = post.id && likedPosts.has(post.id) ? " liked" : "";
    return `
      <div class="feishu-msg feishu-msg-${side}" data-post-number="${post.post_number}"${post.id ? ` data-post-id="${post.id}"` : ""}${me ? ' data-mine="1"' : ""}>
        <span class="feishu-msg-avatar" style="background:${avatarColor(post.username)}">${avatar}</span>
        <div class="feishu-msg-content">
          <span class="feishu-msg-name">${escapeHtml(post.name || post.username)}</span>
          <div class="feishu-msg-bubble">${post.cooked || ""}</div>
          <span class="feishu-msg-meta">
            <span>#${post.post_number}</span>
            <span>${escapeHtml(formatTime(post.created_at))}</span>
          </span>
          <div class="feishu-msg-tools">
            <button class="feishu-msg-tool${liked}" data-action="like" title="点赞">${ICONS.like}</button>
            <button class="feishu-msg-tool" data-action="reply" title="回复">${ICONS.reply}</button>
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
      console.warn("[linuxdo-feishu] getEmberOwner failed", err);
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
    const btn = document.querySelector(".feishu-chat-compose");
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
    const status = document.querySelector(".feishu-composer-status");
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
    const box = document.querySelector(".feishu-chat-compose");
    return {
      box,
      input: box?.querySelector(".feishu-composer-input"),
      target: box?.querySelector(".feishu-composer-target"),
      send: box?.querySelector(".feishu-composer-send"),
      status: box?.querySelector(".feishu-composer-status")
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
    // 尝试同步新楼层
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
    const message = document.querySelector(`.feishu-msg[data-post-number="${postNumber}"]`);
    const name = message?.querySelector(".feishu-msg-name")?.textContent?.trim();
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
    let style = document.getElementById("feishu-temp-reply-click");
    if (!style) {
      style = document.createElement("style");
      style.id = "feishu-temp-reply-click";
      style.textContent = `
        html.feishu-im-theme.feishu-locked #main-outlet #topic-footer-buttons,
        html.feishu-im-theme.feishu-locked #main-outlet .topic-footer-main-buttons,
        html.feishu-im-theme.feishu-locked #main-outlet .topic-footer-main-buttons *,
        html.feishu-im-theme.feishu-locked #main-outlet #topic-footer-buttons *,
        html.feishu-im-theme.feishu-locked #main-outlet .post-stream article .post-controls,
        html.feishu-im-theme.feishu-locked #main-outlet .post-stream article .post-controls * {
          visibility: visible !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          pointer-events: auto !important;
          position: relative !important;
        }
        html.feishu-im-theme.feishu-locked #main-outlet .container.posts,
        html.feishu-im-theme.feishu-locked #main-outlet .topic-area,
        html.feishu-im-theme.feishu-locked #main-outlet .post-stream,
        html.feishu-im-theme.feishu-locked #main-outlet .topic-footer-buttons,
        html.feishu-im-theme.feishu-locked #main-outlet #topic-footer-buttons {
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
        document.getElementById("feishu-temp-reply-click")?.remove();
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
      console.warn("[linuxdo-feishu] composer service open failed", err);
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
        unlock.id = "feishu-unlock-for-reply";
        unlock.textContent = `
          html.feishu-im-theme.feishu-locked #main-outlet-wrapper,
          html.feishu-im-theme.feishu-locked #main-outlet,
          html.feishu-im-theme.feishu-locked #main-outlet > * {
            pointer-events: auto !important;
            visibility: visible !important;
            height: auto !important;
            overflow: visible !important;
          }
          html.feishu-im-theme #reply-control {
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
          document.getElementById("feishu-unlock-for-reply")?.remove();
          if (isComposerOpen()) {
            flashComposeHint("编辑器已打开", "busy");
          } else {
            flashComposeHint("打开失败：请点右上角「原生视图」回复", "error");
            console.warn("[linuxdo-feishu] openNativeComposer failed", {
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
      console.warn("[linuxdo-feishu] openNativeComposer crashed", err);
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
    const el = body.querySelector(`.feishu-msg[data-post-number="${postNumber}"]`);
    if (!el) return false;
    const delta = el.getBoundingClientRect().top - body.getBoundingClientRect().top;
    body.scrollTop = Math.max(0, body.scrollTop + delta);
    return true;
  }

  function visibleTopicPosts(body) {
    if (!body) return [];
    const rect = body.getBoundingClientRect();
    const posts = [];
    for (const msg of body.querySelectorAll(".feishu-msg[data-post-number]")) {
      const box = msg.getBoundingClientRect();
      if (box.bottom <= rect.top + 8 || box.top >= rect.bottom - 8) continue;
      const number = Number(msg.dataset.postNumber) || 0;
      if (number) posts.push(number);
    }
    return posts;
  }

  const trackVisibleTopicPost = debounce(() => {
    if (!chatState.topicId) return;
    const body = document.querySelector(".feishu-chat-body");
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
        frag.push(`<div class="feishu-msg-time-sep">${escapeHtml(formatClock(post.created_at))}</div>`);
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
    const body = document.querySelector(".feishu-chat-body");
    if (body) {
      delete body.dataset.state;
      body.innerHTML = `<div class="feishu-chat-loading">加载中…</div>`;
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

      const panel = document.querySelector(".feishu-chat-panel");
      if (panel) panel.dataset.empty = "0";
      const title = document.querySelector(".feishu-chat-title");
      const sub = document.querySelector(".feishu-chat-sub");
      if (title) title.textContent = chatState.title;
      const participants = data.participant_count ||
        (data.details && data.details.participants ? data.details.participants.length : 0);
      if (sub) sub.textContent = `${data.posts_count || posts.length} 条回复 · ${participants || "–"} 人参与`;
      document.title = `${chatState.title} - Linux DO`;

      const chatAvatar = document.querySelector(".feishu-chat-avatar");
      if (chatAvatar) {
        chatAvatar.style.display = "";
        chatAvatar.style.background = avatarColor(chatState.title);
        chatAvatar.textContent = avatarLetter(chatState.title);
      }
      const tabs = document.querySelector(".feishu-chat-tabs");
      if (tabs) tabs.style.display = "";
      loadCategories().then(() => {
        if (chatState.topicId !== topicId) return;
        const catTab = document.querySelector(".feishu-chat-tab-cat");
        const cat = data.category_id ? categoryById(data.category_id) : null;
        if (catTab) {
          if (cat) {
            catTab.style.display = "";
            catTab.href = `/c/${cat.slug}/${cat.id}`;
            catTab.innerHTML = `<span class="feishu-nav2-cat-dot" style="background:#${escapeHtml(cat.color || "8F959E")}"></span>${escapeHtml(cat.name)}`;
          } else {
            catTab.style.display = "none";
          }
        }
      });

      if (body) {
        body.innerHTML = renderBubbles(posts, getCurrentUsername()) ||
          `<div class="feishu-chat-empty">${ICONS.chat}<div>暂无内容</div></div>`;
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
    const body = document.querySelector(".feishu-chat-body");
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
    const body = document.querySelector(".feishu-chat-body");
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
    const body = document.querySelector(".feishu-chat-body");
    if (!body || body.querySelector(".feishu-chat-loading")) return;
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
    let fab = document.querySelector(".feishu-mode-fab");
    if (getViewMode() !== "native") {
      fab?.remove();
      return;
    }
    if (fab) return;
    fab = document.createElement("button");
    fab.className = "feishu-mode-fab";
    fab.title = "切回飞书 IM 视图";
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
    document.querySelector(".feishu-list-panel")?.remove();
    document.querySelector(".feishu-chat-panel")?.remove();
    document.querySelector(".feishu-rail")?.remove();
    document.querySelector(".feishu-strip")?.remove();
    document.querySelector(".feishu-list-resizer")?.remove();
    document.querySelector(".feishu-rail-resizer")?.remove();
  }

  function applyTheme() {
    if (ideaThemeActive()) {
      console.warn("[linuxdo-feishu] 检测到 IDEA 主题脚本已启用，本脚本自动避让。请只保留其中一个。");
      document.documentElement.classList.remove(ROOT_CLASS, DARK_CLASS, LOCK_CLASS, "feishu-topic-open");
      removePanels();
      return;
    }

    // 按脚本深色偏好强制站点明暗（含切回原生布局）
    applyColorMode();
    forceSiteScheme();

    if (getViewMode() === "native") {
      document.documentElement.classList.remove(ROOT_CLASS, DARK_CLASS, LOCK_CLASS, "feishu-topic-open");
      removePanels();
      ensureModeFab();
      return;
    }

    injectStyle();
    document.documentElement.classList.add(ROOT_CLASS);
    applyColorMode();
    document.documentElement.classList.toggle("feishu-nav2-open", isNav2Open());
    restyleSplash();
    makeFavicon();
    ensureModeFab();
    if (!document.body) return;

    ensureRail();
    ensureStrip();
    ensureRailResizer();

    const pathname = location.pathname;
    const isTopic = isTopicPath(pathname);
    const isHome = isHomePath(pathname);
    const supported = isTopic || isHome;

    document.documentElement.classList.toggle(LOCK_CLASS, supported);
    document.documentElement.classList.toggle("feishu-topic-open", isTopic);

    if (!supported) {
      // rail 常驻，展开栏为原生侧栏；仅移除中右栏
      document.querySelector(".feishu-list-panel")?.remove();
      document.querySelector(".feishu-chat-panel")?.remove();
      document.querySelector(".feishu-list-resizer")?.remove();
      return;
    }

    ensureListPanel();
    ensureChatPanel();
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
    if (!ideaThemeActive()) {
      // document-start 尽早按偏好锁明暗，减少闪一下
      applyColorMode();
      forceSiteScheme();
    }
    if (getViewMode() !== "native" && !ideaThemeActive()) {
      document.documentElement.classList.add(ROOT_CLASS);
      applyColorMode();
      restyleSplash();
      makeFavicon(); // document-start 尽早换标，减少未聚焦标签仍显示原 icon
    }

    // 标签重新可见时再刷一次（部分浏览器未聚焦时会缓存旧 favicon）
    if (!window.__feishuFaviconVisibilityBound) {
      window.__feishuFaviconVisibilityBound = true;
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && getViewMode() !== "native" && !ideaThemeActive()) {
          makeFavicon();
        }
      });
    }

    const FEISHU_UI_SEL = ".feishu-list-panel, .feishu-chat-panel, .feishu-rail, .feishu-strip, .feishu-mode-fab, #linuxdo-feishu-theme";
    const observer = new MutationObserver((mutations) => {
      // 忽略我们自己面板内部的 DOM 变动，否则点开筛选会立刻触发 applyTheme 回写/闪断
      const external = mutations.some((m) => {
        const t = m.target;
        if (!(t instanceof Element) && !(t instanceof CharacterData)) return true;
        const el = t instanceof Element ? t : t.parentElement;
        if (!el) return true;
        if (el.closest(FEISHU_UI_SEL)) return false;
        if (el.id === "linuxdo-feishu-theme") return false;
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
    if (!window.__feishuNotifBadgeTimer) {
      window.__feishuNotifBadgeTimer = setInterval(() => {
        if (getViewMode() === "native" || ideaThemeActive()) return;
        if (!document.querySelector(".feishu-rail")) return;
        syncRail();
      }, 15000);
    }

    // ⌘/Ctrl+K → 最左栏搜索（再同步原生 welcome-banner）
    window.addEventListener("keydown", (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      if ((e.key || "").toLowerCase() !== "k") return;
      if (getViewMode() === "native" || ideaThemeActive()) return;
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "TEXTAREA" || (tag === "INPUT" && e.target.type !== "search")) return;
      e.preventDefault();
      e.stopPropagation();
      ensureRail();
      const input = document.querySelector(".feishu-rail-search input");
      if (input) {
        input.focus();
        input.select();
      }
    }, true);

    scheduleApply();
  }

  bootstrap();
})();
