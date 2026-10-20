// ==UserScript==
// @name         知乎 · IM 三合一样式（钉钉 / 飞书 / 企业微信）
// @namespace    https://www.zhihu.com/
// @author       czm15053
// @version      0.2.6
// @description  一套脚本三种 IM 皮肤：钉钉 / 飞书 / 企业微信，把你刷知乎的界面换成 IM 三栏壳。只换皮不碰数据：列表走原生流抓取，问题页由原生渲染就地重排，点赞/评论/关注等交互保留。中栏列表 ＋ 右栏聊天式详情 ＋ 深色跟随 ＋ 皮肤一键切换。
// @match        https://www.zhihu.com/*
// @icon         https://www.zhihu.com/favicon.ico
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function() {
  "use strict";
  const STYLE_ID = "zhihu-im-theme";
  const FAVICON_ID = "zh-favicon";
  const ROOT_CLASS = "zh-im";
  const DARK_CLASS = "dark";
  const VIEW_KEY = "zhihu-im-view";
  const SKIN_KEY = "zhihu-im-skin";
  const COLOR_THEME_KEY = "zhihu-im-color-theme";
  const READ_KEY = "zhihu-im-read";
  const RECENT_KEY = "zhihu-im-recent";
  function prefGet(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch {
      return fallback;
    }
  }
  function prefSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
    }
  }
  function prefGetJson(key, fallback) {
    try {
      return JSON.parse(prefGet(key, "") || "") ?? fallback;
    } catch {
      return fallback;
    }
  }
  function prefSetJson(key, value) {
    prefSet(key, JSON.stringify(value));
  }
  function getViewMode() {
    return prefGet(VIEW_KEY, "im") === "native" ? "native" : "im";
  }
  function setViewMode(m) {
    prefSet(VIEW_KEY, m === "native" ? "native" : "im");
  }
  function getSkinId(fallback = "dingtalk") {
    const v = prefGet(SKIN_KEY, "");
    return v || fallback;
  }
  function setSkinId(id) {
    prefSet(SKIN_KEY, id);
  }
  function getColorTheme() {
    return prefGet(COLOR_THEME_KEY, "auto") || "auto";
  }
  function setColorTheme(v) {
    prefSet(COLOR_THEME_KEY, v === "dark" ? "dark" : v === "light" ? "light" : "auto");
  }
  function isRead(href) {
    if (!href) return false;
    return !!prefGetJson(READ_KEY, {})[href];
  }
  function markRead$1(href) {
    if (!href || isRead(href)) return;
    const map = prefGetJson(READ_KEY, {});
    map[href] = 1;
    prefSetJson(READ_KEY, map);
  }
  function getRecents() {
    const list = prefGetJson(RECENT_KEY, []);
    return Array.isArray(list) ? list : [];
  }
  function addRecent(href, title) {
    if (!href || !title) return;
    const list = getRecents().filter((r) => r.href !== href);
    list.unshift({ href, title, at: Date.now() });
    prefSetJson(RECENT_KEY, list.slice(0, 20));
  }
  try {
    localStorage.removeItem("zhihu-im-feed-sessions");
  } catch {
  }
  const MASK_AVATAR_KEY = "zhihu-im-mask-avatar";
  function isMaskAvatar() {
    return prefGet(MASK_AVATAR_KEY, "1") !== "0";
  }
  function setMaskAvatar(on) {
    prefSet(MASK_AVATAR_KEY, on ? "1" : "0");
  }
  const RAIL_ITEMS = {
    // 无 path 的占位项（工作台/会议/日历等）点击无导航，仅渲染图标+label
    dingtalk: [
      { path: "/", label: "消息", icon: "msg" },
      { label: "通知", icon: "msg" },
      { label: "私信", icon: "chat" },
      { label: "书签", icon: "book" },
      { path: "/follow", label: "关注", icon: "contact" },
      { path: "/hot", label: "热榜", icon: "hot" },
      { label: "工作台", icon: "work" },
      { key: "meet", label: "会议", icon: "meet" },
      { key: "cal", label: "日历", icon: "cal" },
      { key: "todo", label: "待办", icon: "todo" },
      { key: "add", label: "添加", icon: "plus" }
    ],
    feishu: [
      { path: "/follow", label: "关注", icon: "contact" },
      { path: "/", label: "推荐", icon: "home" },
      { path: "/hot", label: "热榜", icon: "hot" },
      { label: "工作台", icon: "work" },
      { key: "wik", label: "知识库", icon: "wiki" },
      { key: "task", label: "任务", icon: "task" },
      { key: "contact", label: "联系人", icon: "contact" },
      { key: "more", label: "更多", icon: "more" }
    ],
    wecom: [
      { path: "/", label: "消息", icon: "msg" },
      { label: "通知", icon: "msg" },
      { label: "私信", icon: "chat" },
      { label: "书签", icon: "book" },
      { path: "/follow", label: "关注", icon: "contact" },
      { path: "/hot", label: "热榜", icon: "hot" },
      { label: "智能文档", icon: "file" },
      { label: "工作台", icon: "work" },
      { label: "微盘", icon: "disk" }
    ]
  };
  const SKINS = {
    dingtalk: {
      label: "钉钉",
      railWidth: 150,
      listWidth: 300,
      titlebarHeight: 40,
      railMin: 56,
      railMax: 260,
      listMin: 200,
      listMax: 420,
      railStyle: "text",
      // 图标+文字水平排列
      actions: "titlebar",
      // 顶部栏右侧放深色/换肤操作
      rail: RAIL_ITEMS.dingtalk,
      favicon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAHCElEQVRIDZVWW4xeVRVe+3b+29xiL9PpQDvY4SIgODGNpUGKF4i2JdX4QALy1CBPxBhf8EEfmog8kOCDMeFBaUCMD8SUag0iFo0GhWIcbMfWKTLMtLWdybTO5L+esy/Lb5/zzz9TymhcOdnZZ1/W9VtrL8HMzWZTa+2cM8ZgJCIllfPx11prtDKSKHiB3SzTRhMz+UBKt1OntPY+MDGuWG8Tk1hnpZAkcCOUy2VRr9eVUhAjpQwhCCEgABP8asFGi0sNf+oyTy6EmYZYaLEUYkOJPjrId2wXn9M79Llp5uDkCQAAIABJREFUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHzfRyOsnHtMdn//A8PKwZEKQGK0AAAAAElFTkSuQmCC"
    },
    feishu: {
      label: "飞书",
      railWidth: 230,
      listWidth: 360,
      titlebarHeight: 0,
      railMin: 180,
      railMax: 480,
      listMin: 280,
      listMax: 640,
      primary: "#3370FF",
      railStyle: "text",
      // 文字导航
      actions: "rail-bottom",
      // 深色/皮肤切换按钮挂载位置
      rail: RAIL_ITEMS.feishu,
      favicon: "data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM2BBAAAAAC8FEQAwWB4AOhQ7ADkiIABEODEAoFUAAIxtAAAyLyEA99k7AElUcQDYt0cAru7vAJa4qAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg4Z2d4IAAh3e3ePgAEnd3d3h4AAR3d3d4iIAAh3d3dz3REtL3d3d37d0x3d3d3d0x3d3d3d3R3d3d3d3dHd3d3d3d0BEt3d3d3d0BHe3d3d3eAB3t3d3d3wAR3t3d3d4AER3d3d3eAAEd3d3d3gAAER4eHh4AAAAAA"
    },
    wecom: {
      label: "企业微信",
      railWidth: 162,
      listWidth: 304,
      titlebarHeight: 0,
      railMin: 100,
      railMax: 260,
      listMin: 240,
      listMax: 480,
      primary: "#4096ff",
      railStyle: "text",
      // 文字+图标
      actions: "titlebar",
      // 深色/皮肤切换按钮挂载位置
      rail: RAIL_ITEMS.wecom,
      favicon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iOCIgeTE9IjQiIHgyPSI1NiIgeTI9IjYwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzQwOTZmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzE3NjlkMiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgcng9IjE1IiBmaWxsPSJ1cmwoI2EpIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTExIDI3LjVDMTEgMTguOTQgMTguODQgMTIgMjguNSAxMlM0NiAxOC45NCA0NiAyNy41IDM4LjE2IDQzIDI4LjUgNDNjLTIuMTMgMC00LjE3LS4zNC02LjA2LS45NUwxNCA0N2wyLjQ4LTcuMTZDMTMuMSAzNi45MSAxMSAzMi41NSAxMSAyNy41WiIvPjxwYXRoIGZpbGw9IiMxOWM4NzgiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyLjUiIGQ9Ik0zNCAzNy41QzM0IDMwLjYgNDAuMjcgMjUgNDggMjVzMTQgNS42IDE0IDEyLjVTNTUuNzMgNTAgNDggNTBjLTEuNTUgMC0zLjA0LS4yMy00LjQzLS42NUwzNyA1M2wxLjg0LTUuMjNDMzUuODcgNDUuMzkgMzQgNDEuNzMgMzQgMzcuNVoiLz48Y2lyY2xlIGN4PSIyMyIgY3k9IjI3IiByPSIyIiBmaWxsPSIjMjY3ZWYwIi8+PGNpcmNsZSBjeD0iMzMiIGN5PSIyNyIgcj0iMiIgZmlsbD0iIzI2N2VmMCIvPjxjaXJjbGUgY3g9IjQ0IiBjeT0iMzcuNSIgcj0iMS43IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iNTIiIGN5PSIzNy41IiByPSIxLjciIGZpbGw9IiNmZmYiLz48L3N2Zz4="
    }
  };
  const SKIN_ID = getSkinId("dingtalk");
  const FAVICON_URI = SKINS[SKIN_ID].favicon;
  const SKIN_ORDER = ["dingtalk", "feishu", "wecom"];
  const CSS_CORE = String.raw`
/* ============ 基础 ============ */
html.__ROOT_CLASS__, html.__ROOT_CLASS__ body{
  background:var(--zh-bg) !important;
  color:var(--zh-text) !important;
}
.zh-shell,.zh-titlebar,.zh-chat-empty,.zh-list-panel,.zh-chat-view,.zh-skin-menu,.zh-fab{
  font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Helvetica Neue","Microsoft YaHei",sans-serif;
}
.zh-shell,.zh-titlebar,.zh-chat-empty,.zh-list-panel,.zh-chat-view,.zh-skin-menu,.zh-fab,
.zh-shell *,.zh-titlebar *,.zh-list-panel *,.zh-chat-view *,.zh-chat-empty *,.zh-skin-menu *,.zh-fab *{
  box-sizing:border-box !important;
}
.zh-list-panel::-webkit-scrollbar,.zh-chat-body::-webkit-scrollbar{width:6px;}
.zh-list-panel::-webkit-scrollbar-thumb,.zh-chat-body::-webkit-scrollbar-thumb{background:var(--zh-line-strong);border-radius:3px;}
.zh-list-panel::-webkit-scrollbar-track,.zh-chat-body::-webkit-scrollbar-track{background:transparent;}

.zh-shell,.zh-titlebar,.zh-chat-empty,.zh-list-panel{position:fixed;z-index:400;}

/* ============ titlebar（钉钉/企微；飞书经皮肤文件隐藏） ============ */
.zh-titlebar{
  top:0;left:0;right:0;height:var(--zh-topbar);display:flex;align-items:center;gap:8px;
  padding:0 10px;background:linear-gradient(90deg,#D5E0F8 0%,#DCE4F9 100%);color:var(--zh-text);
  box-shadow:none;user-select:none;
}
.zh-titlebar-me{
  width:26px;height:26px;border-radius:6px;flex:none;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
  background:#F3A23A;color:#fff;font-size:11px;font-weight:700;
}
.zh-titlebar-me img{width:100%;height:100%;object-fit:cover;}
.zh-titlebar-search{
  margin:2px auto 0;width:min(420px,36vw);height:26px;border-radius:13px;
  background:#EFF1FB;display:flex;align-items:center;gap:6px;padding:0 12px;color:var(--zh-text3);
}
.zh-titlebar-search svg{width:14px;height:14px;flex:none;color:var(--zh-text3);}
.zh-titlebar-search input{
  flex:1;min-width:0;border:none;outline:none;background:transparent;
  color:var(--zh-text);font-size:12px;text-align:center;line-height:26px;height:100%;padding:0;
}
.zh-titlebar-search input::placeholder{color:var(--zh-text3);text-align:center;}
.zh-titlebar-actions{margin-left:8px;display:flex;align-items:center;gap:6px;flex:none;}

.zh-act-btn{width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;border:none;cursor:pointer;color:#fff;background:rgba(255,255,255,.18);transition:background .15s;}
.zh-act-btn:hover{background:rgba(255,255,255,.30);}
.zh-act-btn svg{width:15px;height:15px;}

/* ============ rail：左侧导航（飞书=淡蓝底文字条；钉钉=窄图标；企微=图标文字） ============ */
.zh-shell{
  top:var(--zh-topbar);bottom:0;left:0;width:var(--zh-rail);box-sizing:border-box !important;
  display:flex;flex-direction:column;
  background:var(--zh-rail-bg);border-right:1px solid var(--zh-line);
  padding:12px 10px 10px;
}
.zh-rail-head{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:2px 2px 12px;}
.zh-rail-avatar{width:40px;height:40px;border-radius:50%;background:var(--zh-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600;position:relative;flex:none;cursor:pointer;}
.zh-rail-avatar-dot{position:absolute;right:-1px;bottom:-1px;width:11px;height:11px;border-radius:50%;background:var(--zh-danger);border:2px solid var(--zh-rail-bg);display:none;}
.zh-rail-toggle{width:28px;height:28px;border:none;border-radius:50%;background:transparent;color:var(--zh-text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;}
.zh-rail-toggle:hover{background:var(--zh-hover);}
.zh-rail-toggle svg{width:16px;height:16px;}
.zh-rail-search{padding:0 2px 10px;flex:none;}
.zh-rail-search form{display:flex;align-items:center;gap:12px;height:36px;padding:0 12px;margin:0;background:transparent;border:none;border-radius:0;color:var(--zh-text3);transition:color .15s;}
.zh-rail-search form:focus-within{color:var(--zh-text);}
.zh-rail-search svg{width:18px;height:18px;flex:none;color:var(--zh-text2);}
.zh-rail-search input{flex:1;min-width:0;background:transparent;border:none;outline:none;color:var(--zh-text);font-size:15px;-webkit-appearance:none;appearance:none;}
.zh-rail-search input::placeholder{color:var(--zh-text3);}
.zh-rail-items{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:4px;padding-bottom:8px;}
.zh-rail-items::-webkit-scrollbar{display:none;}
.zh-rail-item{
  display:flex;align-items:center;gap:12px;width:100%;height:44px;padding:0 12px;flex:none;
  border-radius:10px;border:none;background:transparent;color:var(--zh-text);cursor:pointer;
  font-size:15px;position:relative;text-align:left;transition:background .15s;
}
.zh-rail-item:hover{background:var(--zh-hover);}
.zh-rail-item.active{background:var(--zh-card);color:var(--zh-primary);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.05);}
.zh-rail-item .zh-rail-icon{width:20px;height:20px;flex:none;display:inline-flex;align-items:center;justify-content:center;color:var(--zh-text2);transition:color .15s;}
.zh-rail-item .zh-rail-icon svg{width:100%;height:100%;}
.zh-rail-item.active .zh-rail-icon{color:var(--zh-primary);}
.zh-rail-bottom{flex:none;padding-top:8px;display:flex;flex-direction:column;gap:4px;}
/* rail-bottom 内的动作按钮（深色/皮肤切换）按导航项风格 */
.zh-shell .zh-act-btn{width:100%;height:40px;border-radius:10px;color:var(--zh-text2);background:transparent;justify-content:flex-start;gap:12px;padding:0 12px;font-size:14px;}
.zh-shell .zh-act-btn svg{width:18px;height:18px;}
.zh-shell .zh-act-btn:hover{background:var(--zh-hover);color:var(--zh-text);}

/* ============ 中栏：自建会话列表（常驻） ============ */
.zh-list-panel{
  top:var(--zh-topbar);bottom:0;left:var(--zh-rail);width:var(--zh-list);box-sizing:border-box !important;
  background:var(--zh-bg);border-right:1px solid var(--zh-line);
  overflow-y:auto;z-index:300;display:flex;flex-direction:column;
}
.zh-list-header{
  display:flex;flex-direction:column;gap:8px;padding:12px 14px 10px;
  position:sticky;top:0;background:var(--zh-bg);z-index:2;flex:none;
  border-bottom:1px solid var(--zh-line);
}
.zh-list-head-top{display:flex;align-items:center;gap:8px;}
.zh-list-search{
  flex:1;min-width:0;display:flex;align-items:center;gap:6px;padding:6px 10px;
  background:var(--zh-chat-bg);border-radius:6px;border:1px solid var(--zh-line);
  font-size:12px;color:var(--zh-text3);transition:all .15s;
}
.zh-list-search:focus-within{border-color:var(--zh-primary);background:var(--zh-card);}
.zh-list-search svg{width:13px;height:13px;flex:none;color:var(--zh-text3);}
.zh-list-search input{
  border:none;background:transparent;outline:none;font-size:12px;color:var(--zh-text);
  flex:1;min-width:0;
}
.zh-list-search input::placeholder{color:var(--zh-text3);}
.zh-mask-toggle{
  width:28px;height:28px;border-radius:6px;border:none;background:transparent;
  color:var(--zh-text3);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
  transition:all .15s;flex:none;
}
.zh-mask-toggle svg{width:16px;height:16px;}
.zh-mask-toggle:hover{background:var(--zh-hover);color:var(--zh-text);}
.zh-mask-toggle.is-on{color:var(--zh-primary);background:var(--zh-selected);}
.zh-list-chips{display:flex;gap:6px;align-items:center;}
.zh-chip{
  height:26px;padding:0 12px;border-radius:13px;font-size:12px;
  border:1px solid var(--zh-line);background:var(--zh-card);color:var(--zh-text2);
  cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
  transition:background .15s,color .15s,border-color .15s;user-select:none;
}
.zh-chip:hover{background:var(--zh-hover);color:var(--zh-text);}
.zh-chip.active{
  background:var(--zh-selected);color:var(--zh-primary);border-color:var(--zh-primary-soft);
  font-weight:500;
}
.zh-chip-refresh{
  width:24px;height:24px;border-radius:50%;border:none;background:transparent;
  color:var(--zh-text3);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
  margin-left:auto;transition:all .15s;flex:none;padding:0;
}
.zh-chip-refresh:hover{background:var(--zh-hover);color:var(--zh-primary);}
.zh-chip-refresh svg{width:14px;height:14px;}
.zh-chip-refresh.spinning svg{animation:zh-spin .8s linear infinite;}

/* 中栏顶部下拉刷新交互条 */
.zh-pull-bar{
  height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;
  background:var(--zh-selected);color:var(--zh-primary);font-size:12px;
  transition:height .15s ease, opacity .15s ease;user-select:none;flex:none;opacity:0;
  border-bottom:1px solid var(--zh-line);
}
.zh-pull-content{display:flex;align-items:center;gap:8px;}
.zh-pull-icon{display:inline-flex;align-items:center;justify-content:center;}
.zh-pull-icon svg{width:14px;height:14px;transition:transform .2s ease;}
.zh-pull-bar.is-ready .zh-pull-icon svg{transform:rotate(180deg);}
.zh-pull-bar.is-refreshing .zh-pull-icon svg{animation:zh-spin .8s linear infinite;}

.zh-conv{
  display:flex;align-items:center;gap:12px;padding:12px 16px;position:relative;
  text-decoration:none !important;color:var(--zh-text);cursor:pointer;
  transition:background .15s;border:none !important;flex:none;
}
.zh-conv:hover{background:var(--zh-hover);}
.zh-conv.active{background:var(--zh-selected);}
.zh-conv-avatar{
  width:40px;height:40px;border-radius:50%;flex:none;overflow:hidden;position:relative;
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:15px;font-weight:600;background:var(--zh-primary);
}
.zh-conv-avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;z-index:1;}
.zh-avatar-text{
  display:flex;align-items:center;justify-content:center;font-style:normal;
  text-align:center;width:100%;height:100%;
}
.zh-conv-avatar.is-text-avatar{
  display:flex;align-items:center;justify-content:center;
  font-size:15px;font-weight:600;color:#fff;
}
.zh-conv-badge{
  position:absolute;top:2px;left:40px;width:8px;height:8px;
  border-radius:50%;background:var(--zh-danger);box-shadow:0 0 0 2px var(--zh-bg);
  pointer-events:none;z-index:2;
}
.zh-conv-info{
  flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;justify-content:center;
  height:40px;
}
.zh-conv-top{
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  line-height:1.2;
}
.zh-conv-name{
  font-size:14px;font-weight:500;color:var(--zh-text);line-height:1.2;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;
}
.zh-conv.is-read .zh-conv-name{color:var(--zh-text2);font-weight:400;}
.zh-conv-time{
  font-size:12px;color:var(--zh-text3);flex:none;line-height:1.2;
  text-align:right;white-space:nowrap;
}
.zh-conv-bottom{
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  line-height:1.2;
}
.zh-conv-msg{
  font-size:13px;color:var(--zh-text3);white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;line-height:1.2;
}
.zh-conv.is-read .zh-conv-msg{opacity:.75;}
.zh-conv-tag{
  font-style:normal;font-size:10px;color:var(--zh-primary);
  background:var(--zh-primary-soft);border-radius:3px;padding:0 4px;
  flex:none;font-weight:500;line-height:1.5;
}
.zh-session-empty{color:var(--zh-text3);font-size:13px;text-align:center;line-height:2;padding:48px 20px;}

/* ============ 右栏：对话视图 ============ */
.zh-chat-view{
  position:fixed;top:var(--zh-topbar);bottom:0;left:calc(var(--zh-rail) + var(--zh-list));right:0;
  background:var(--zh-chat-bg);z-index:5;display:flex;flex-direction:column;overflow:hidden;
}
.zh-chat-header{
  flex:none;height:56px;background:var(--zh-bg);border-bottom:1px solid var(--zh-line);
  display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 20px;
}
.zh-chat-head-main{display:flex;align-items:center;gap:10px;min-width:0;flex:1;}
.zh-chat-avatar{
  width:38px;height:38px;border-radius:50%;flex:none;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
  background:var(--zh-primary);color:#fff;font-size:13px;font-weight:600;
}
.zh-chat-avatar img{width:100%;height:100%;object-fit:cover;}
.zh-chat-titles{min-width:0;flex:1;}
.zh-chat-title-row{display:flex;align-items:center;gap:8px;min-width:0;}
.zh-chat-title{font-size:16px;font-weight:600;color:var(--zh-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.zh-chat-sub{font-size:12px;color:var(--zh-text3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.zh-icon-btn{
  width:28px;height:28px;border:none;background:transparent;color:var(--zh-text2);
  border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;
}
.zh-icon-btn:hover{background:var(--zh-hover);color:var(--zh-text);}
.zh-icon-btn svg{width:16px;height:16px;}
/* 问题/描述以居中浅色卡片出现在消息流顶部（类 IM 系统公告位） */
.zh-chat-desc-card{
  align-self:center;max-width:80%;font-size:12px;color:var(--zh-text2);
  line-height:1.65;text-align:center;padding:8px 16px;margin:8px auto;
  background:var(--zh-card);border:1px solid var(--zh-line);border-radius:8px;
  box-shadow:0 1px 2px rgba(0,0,0,.03);white-space:pre-line;word-break:break-word;
}
.zh-chat-actions{display:flex;gap:4px;flex:none;align-items:center;}
.zh-chat-actions .zh-view-question-btn{
  height:28px;padding:0 10px;border-radius:6px;border:1px solid var(--zh-line);
  background:var(--zh-card);color:var(--zh-primary);font-size:12px;cursor:pointer;
  display:inline-flex;align-items:center;transition:all .15s;margin-right:4px;
}
.zh-chat-actions .zh-view-question-btn:hover{
  background:var(--zh-hover);border-color:var(--zh-primary);
}
.zh-single-answer-tip{
  display:flex;align-items:center;justify-content:center;gap:10px;
  padding:16px;margin:10px auto;font-size:12px;color:var(--zh-text3);
}
.zh-single-answer-tip .zh-more-link{
  display:inline-flex;align-items:center;height:28px;padding:0 12px;
  border-radius:6px;border:1px solid var(--zh-line);background:var(--zh-card);
  color:var(--zh-primary);font-size:12px;cursor:pointer;transition:all .15s;
}
.zh-single-answer-tip .zh-more-link:hover{
  background:var(--zh-hover);border-color:var(--zh-primary);
}
.zh-chat-actions .zh-more-link{
  display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:8px;
  border:1px solid var(--zh-line);background:var(--zh-card);color:var(--zh-text2);
  font-size:12px;text-decoration:none;transition:background .15s,color .15s;
}
.zh-chat-actions .zh-more-link:hover{background:var(--zh-hover);color:var(--zh-primary);}
/* 药丸 tab 条（飞书形态；装饰性，与 x 一致） */
.zh-chat-tabs{flex:none;height:38px;background:var(--zh-bg);display:flex;align-items:center;gap:6px;padding:0 20px 6px;border-bottom:1px solid var(--zh-line);}
.zh-chat-tab{
  font-size:13px;color:var(--zh-text2);cursor:pointer;position:relative;
  height:28px;padding:0 12px;border-radius:8px;border:none;background:transparent;
  display:inline-flex;align-items:center;gap:5px;transition:background .15s,color .15s;
}
.zh-chat-tab svg{width:15px;height:15px;flex:none;}
.zh-chat-tab:hover{background:var(--zh-hover);}
.zh-chat-tab.active{background:var(--zh-selected);color:var(--zh-primary);font-weight:500;}

.zh-chat-body{flex:1;min-height:0;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:16px;overscroll-behavior:contain;}
.zh-chat-body img{max-width:100%;height:auto;border-radius:6px;}
.zh-chat-body figure{margin:0;}
.zh-chat-body video{max-width:100%;border-radius:8px;background:#000;display:block;}
/* 知乎富文本里的装饰性 svg 图标（实体词星标等）不代入气泡 */
.zh-chat-body svg{display:none;}
.zh-chat-body a.RichContent-EntityWord{text-decoration:underline dotted;}

/* 消息气泡（知乎场景全部为「对方消息」形态；结构对齐 x 的 im-msg） */
.zh-msg{display:flex;gap:10px;max-width:78%;align-self:flex-start;position:relative;}
.zh-msg-avatar{
  width:36px;height:36px;border-radius:50%;flex:none;overflow:hidden;position:relative;
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:14px;font-weight:600;object-fit:cover;
}
.zh-msg-avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;}
.zh-msg-content{flex:1;min-width:0;display:flex;flex-direction:column;position:relative;}
.zh-msg-head{display:flex;align-items:baseline;gap:8px;margin-bottom:4px;min-width:0;}
.zh-msg-name{font-size:12px;color:var(--zh-text3);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.zh-msg-badge{font-style:normal;font-size:11px;color:var(--zh-text3);margin-left:6px;}
.zh-msg-meta{font-size:11px;color:var(--zh-text3);margin-top:4px;display:flex;gap:8px;align-items:center;}
.zh-msg-bubble{
  padding:10px 14px;font-size:14px;line-height:1.6;color:var(--zh-text);
  background:var(--zh-bubble-other);border-radius:2px 8px 8px 8px;
  word-break:break-word;overflow-wrap:anywhere;
}
.zh-msg-bubble p{margin:0 0 .6em;}
.zh-msg-bubble p:last-child{margin-bottom:0;}
.zh-msg-bubble a{color:var(--zh-primary);}
.zh-msg-bubble blockquote{margin:0 0 8px;padding:4px 10px;border-left:3px solid var(--zh-primary);background:var(--zh-selected);border-radius:0 6px 6px 0;color:var(--zh-text2);}
.zh-msg-bubble table{border-collapse:collapse;width:100%;}
.zh-msg-bubble td,.zh-msg-bubble th{border:1px solid var(--zh-line-strong);padding:6px 10px;font-size:13px;}
/* hover 浮现的图标工具条（赞同/评论），对齐 x 的 im-msg-tools */
.zh-msg-tools{
  position:absolute;top:-14px;right:0;z-index:5;
  display:flex;align-items:center;gap:2px;
  background:var(--zh-card);border:1px solid var(--zh-line);border-radius:8px;
  padding:2px;box-shadow:0 2px 8px rgba(31,35,41,.10);
  opacity:0;visibility:hidden;transition:opacity .15s ease;
}
.zh-msg:hover .zh-msg-tools{opacity:1;visibility:visible;}
.zh-msg-tool{
  width:26px;height:26px;display:flex;align-items:center;justify-content:center;
  border:none;background:transparent;cursor:pointer;border-radius:6px;
  color:var(--zh-text2);padding:0;transition:background .15s,color .15s;
}
.zh-msg-tool svg{width:15px;height:15px;}
.zh-msg-tool:hover{background:var(--zh-hover);color:var(--zh-primary);}
.zh-msg-tool.voted{color:var(--zh-primary);}
/* 长回复折叠：超过 3 行默认收起 + 右下角渐变「展开」角标，点击气泡开合（不遮挡上方正文） */
.zh-longtext{
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
  cursor:pointer;position:relative;
}
.zh-longtext::after{
  content:"展开 ›";position:absolute;right:0;bottom:0;
  padding:0 6px 0 24px;
  background:linear-gradient(to right, transparent, var(--zh-bubble-other, #fff) 35%);
  color:var(--zh-primary);
  font-size:11px;line-height:18px;pointer-events:none;font-weight:500;
}
.zh-longtext.is-open{-webkit-line-clamp:none;overflow:visible;cursor:pointer;padding-bottom:14px;}
.zh-longtext.is-open::after{
  content:"收起 ‹";display:inline-block;position:absolute;right:0;bottom:0;
  background:transparent;padding:0 4px;font-size:11px;line-height:16px;
  color:var(--zh-text3);
}

.zh-chat-loadmore{
  padding:16px;text-align:center;font-size:12px;color:var(--zh-text3);cursor:pointer;
  user-select:none;transition:color .15s;flex:none;
}
.zh-chat-loadmore:hover{color:var(--zh-primary);}
.zh-chat-idle{margin:auto;color:var(--zh-text3);font-size:13px;}
.zh-chat-loading{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:12px;height:100%;min-height:240px;margin:auto;color:var(--zh-text3);font-size:13px;
}
.zh-chat-spinner{
  width:24px;height:24px;border:2.5px solid var(--zh-line);
  border-top-color:var(--zh-primary);border-radius:50%;
  animation:zh-spin .8s linear infinite;
}
@keyframes zh-spin{to{transform:rotate(360deg);}}

/* ============ 原生内容 clamp（选择器实测清单来源：liuyubing233/zhihu-custom） ============ */
/* 全局清场：站内顶栏 / 详情页头部及邀请横幅 / 广告位全家桶 / 页脚 */
html.__ROOT_CLASS__ .AppHeader,
html.__ROOT_CLASS__ .ColumnPageHeader-Wrapper,
html.__ROOT_CLASS__ .QuestionHeader,
html.__ROOT_CLASS__ .QuestionInvite,
html.__ROOT_CLASS__ .QuestionWaiting,
html.__ROOT_CLASS__ .QuestionHeader-invite,
html.__ROOT_CLASS__ .QuestionInvite-wrapper,
html.__ROOT_CLASS__ .QuestionWaiting-wrapper,
html.__ROOT_CLASS__ .QuestionStatus,
html.__ROOT_CLASS__ .QuestionStatus-notification-inner,
html.__ROOT_CLASS__ [data-za-detail-view-path-module="InvitationCard"],
html.__ROOT_CLASS__ div:has(> .QuestionStatus-notification-inner),
html.__ROOT_CLASS__ div:has(> div > .QuestionStatus-notification-inner),
html.__ROOT_CLASS__ [class*="QuestionStatus-notification"],
html.__ROOT_CLASS__ .Sticky,
html.__ROOT_CLASS__ .QuestionHeader-footer,
html.__ROOT_CLASS__ .TopstoryItem--advertCard,
html.__ROOT_CLASS__ .Pc-card,
html.__ROOT_CLASS__ .Pc-word,
html.__ROOT_CLASS__ .Pc-word-new,
html.__ROOT_CLASS__ .RichText-ADLinkCardContainer,
html.__ROOT_CLASS__ .Pc-Business-Card-PcTopFeedBanner,
html.__ROOT_CLASS__ .Business-Card-PcRightBanner-link,
html.__ROOT_CLASS__ .ZhiGoodsCard,
html.__ROOT_CLASS__ .KfeCollection-CreateSaltCard,
html.__ROOT_CLASS__ .pc-article-answer,
html.__ROOT_CLASS__ .pc-article-answer-big-img,
html.__ROOT_CLASS__ .pc-article-answer-text-chain,
html.__ROOT_CLASS__ footer{display:none !important;}

/* 全时防裸奔：原生数据源主列置于视口底层保活，保留无限滚动与哨兵相交检测，用户完全不可见不可点 */
html.__ROOT_CLASS__:not([data-zh-chat="clamp"]) .QuestionPage,
html.__ROOT_CLASS__:not([data-zh-chat="clamp"]) .Question-main,
html.__ROOT_CLASS__:not([data-zh-chat="clamp"]) .PostIndex-main,
html.__ROOT_CLASS__:not([data-zh-chat="clamp"]) .ZVideo-mainColumn,
html.__ROOT_CLASS__ .Topstory-mainColumn,
html.__ROOT_CLASS__ .Search-container,
html.__ROOT_CLASS__ .SearchMain{
  position:fixed !important;top:0 !important;left:0 !important;
  width:100vw !important;height:100vh !important;overflow-y:auto !important;
  opacity:0 !important;pointer-events:none !important;display:block !important;z-index:-9999 !important;
  visibility:visible !important;
}
html.__ROOT_CLASS__[data-zh-route="feed"] .GlobalSideBar,
html.__ROOT_CLASS__[data-zh-route="feed"] .SearchSideBar,
html.__ROOT_CLASS__[data-zh-route="feed"] .SearchTabs,
html.__ROOT_CLASS__[data-zh-route="feed"] .Topstory-mainColumn .LabelContainer,
html.__ROOT_CLASS__[data-zh-route="feed"] .Topstory .WriteArea,
/* 数据源里的视频一律不渲染：播放器名额有限，视口外播放器只增不减会打爆上限 */
html.__ROOT_CLASS__[data-zh-route="feed"] .Topstory-mainColumn video{display:none !important;}
/* detail：侧栏与悬浮按钮组清场（两套聊天视图都用不到） */
html.__ROOT_CLASS__[data-zh-route="detail"] .Question-sideColumn,
html.__ROOT_CLASS__[data-zh-route="detail"] .GlobalSideBar{display:none !important;}
/* detail：文章/视频/问题(clamp 降级)主列 CSS 让位进右栏——参考 VS Code 伪装脚本，
   用 margin 让位而非 position:fixed 搬运，避开内部 flex/margin 导致的横向裁切 */
html.__ROOT_CLASS__[data-zh-route="detail"] .PostIndex-main,
html.__ROOT_CLASS__[data-zh-route="detail"] .ZVideo-mainColumn,
html.__ROOT_CLASS__[data-zh-route="detail"][data-zh-chat="clamp"] .QuestionPage,
html.__ROOT_CLASS__[data-zh-route="detail"][data-zh-chat="clamp"] .Question-main{
  display:block !important;
  margin:var(--zh-topbar) 0 0 calc(var(--zh-rail) + var(--zh-list)) !important;
  width:calc(100vw - var(--zh-rail) - var(--zh-list)) !important;
  max-width:none !important;
  box-sizing:border-box !important;
}
/* clamp 降级：问题页头部信息卡 / 吸顶 tab / 标签清场，仅留标题与回答流 */
html.__ROOT_CLASS__[data-zh-route="detail"][data-zh-chat="clamp"] .QuestionHeader-side,
html.__ROOT_CLASS__[data-zh-route="detail"][data-zh-chat="clamp"] .QuestionButtonGroup,
html.__ROOT_CLASS__[data-zh-route="detail"][data-zh-chat="clamp"] .QuestionHeader-footer-inner,
html.__ROOT_CLASS__[data-zh-route="detail"][data-zh-chat="clamp"] .QuestionHeader-tags,
html.__ROOT_CLASS__[data-zh-route="detail"][data-zh-chat="clamp"] .QuestionHeader .LabelContainer-wrapper{display:none !important;}
/* 问题页内部排版居中、卡片化（仅 clamp 降级路径生效；parsed 时原生容器已隐藏） */
html.__ROOT_CLASS__[data-zh-route="detail"][data-zh-chat="clamp"] .Question-main .Question-mainColumn,
html.__ROOT_CLASS__[data-zh-route="detail"][data-zh-chat="clamp"] .QuestionPage .Question-mainColumn{
  width:100%;max-width:720px;margin:0 auto;padding:0 8px 60px;box-sizing:border-box;
}
/* 文章 / 视频详情：让位式已把它们钉进右栏，仅补内部去白底露缝 */
html.__ROOT_CLASS__[data-zh-route="detail"] .PostIndex-main,
html.__ROOT_CLASS__[data-zh-route="detail"] .ZVideo-mainColumn{
  padding:0 0 60px;
}

/* ============ 右栏空态（feed 路由时） ============ */
.zh-chat-empty{
  top:var(--zh-topbar);bottom:0;left:calc(var(--zh-rail) + var(--zh-list));right:0;
  background:var(--zh-chat-bg);display:flex;flex-direction:column;align-items:center;justify-content:center;
  color:var(--zh-text3);text-align:center;gap:6px;padding:0 30px;
}
.zh-chat-empty-logo{width:56px;height:56px;border-radius:14px;background:var(--zh-banner);color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;margin-bottom:8px;box-shadow:0 6px 16px rgba(0,0,0,.12);}
.zh-chat-empty h3{margin:0;color:var(--zh-text);font-size:17px;}
.zh-chat-empty p{margin:0;font-size:13px;line-height:1.9;}
.zh-chat-empty .zh-chat-empty-tip{font-size:12px;opacity:.7;}

/* ============ 皮肤菜单 ============ */
.zh-skin-menu{position:fixed;z-index:1000;min-width:160px;background:var(--zh-card);border:1px solid var(--zh-line);border-radius:10px;box-shadow:0 8px 28px rgba(31,35,41,.16);padding:6px;display:flex;flex-direction:column;}
.zh-skin-item{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 12px;border:none;background:transparent;border-radius:8px;color:var(--zh-text);font-size:13px;cursor:pointer;text-align:left;transition:background .15s;}
.zh-skin-item:hover{background:var(--zh-hover);}
.zh-skin-item.active{color:var(--zh-primary);font-weight:600;}
.zh-skin-item .ok{color:var(--zh-primary);}
.zh-skin-item .ok svg{width:13px;height:13px;}
.zh-skin-sep{height:1px;background:var(--zh-line);margin:4px 6px;}

/* ============ 宽度拖拽把手（对齐 im：无偏移透明细把手，hover 蓝） ============ */
.zh-resizer-rail,.zh-resizer-list{
  position:fixed;top:var(--zh-topbar);bottom:0;width:6px;
  cursor:col-resize;touch-action:none;z-index:450;
  transition:background .15s;
}
.zh-resizer-rail{left:calc(var(--zh-rail) - 3px);}
.zh-resizer-list{left:calc(var(--zh-rail) + var(--zh-list) - 3px);}
.zh-resizer-rail:hover,.zh-resizer-rail.dragging,
.zh-resizer-list:hover,.zh-resizer-list.dragging{background:var(--zh-primary);opacity:.4;}
body.zh-col-resizing,body.zh-col-resizing *{cursor:col-resize !important;user-select:none !important;}
`;
  function dingtalkCss() {
    return String.raw`
/* ============ Token: 钉钉 light ============ */
html.__ROOT_CLASS__{
  --zh-bg:#FFFFFF; --zh-chat-bg:#F5F7FB; --zh-card:#FFFFFF; --zh-rail-bg:#F3F4F6;
  --zh-hover:#ECF0F7; --zh-selected:#E4EAF5; --zh-primary-soft:#D6EBFF;
  --zh-bubble-other:#FFFFFF; --zh-bubble-me:#D4E5FF;
  --zh-line:#E6E8EB; --zh-line-strong:#D5D8DE;
  --zh-text:#1A1D24; --zh-text2:#4A4F5C; --zh-text3:#8A8F99;
  --zh-primary:#1A87FF; --zh-danger:#FF4D4F;
  --zh-banner:linear-gradient(135deg,#0071ff,#00c6fb);
  --zh-topbar:40px; --zh-rail:150px; --zh-list:300px;
}
html.__ROOT_CLASS__[data-theme="dark"]{
  --zh-bg:#14161B; --zh-chat-bg:#0F1115; --zh-card:#1E222A; --zh-rail-bg:#171A22;
  --zh-hover:#22262E; --zh-selected:#2A3140; --zh-primary-soft:#3B5F8A;
  --zh-bubble-other:#1E222A; --zh-bubble-me:#1A3358;
  --zh-line:#2A2E36; --zh-line-strong:#3A404C;
  --zh-text:#E8EAED; --zh-text2:#B0B4BE; --zh-text3:#8A8F99;
  --zh-primary:#3B92FF; --zh-danger:#FF6B6B;
}

/* ============ 钉钉形态：渐变 titlebar + 窄图标 rail ============ */
/* 钉钉头像为圆角方形（对齐 x 实测值 8px）；img 覆盖层继承容器圆角 */
html.__ROOT_CLASS__ .zh-conv-avatar,
html.__ROOT_CLASS__ .zh-msg-avatar,
html.__ROOT_CLASS__ .zh-rail-avatar{border-radius:8px !important;}
/* 钉钉 other 气泡为白底描边 */
html.__ROOT_CLASS__ .zh-msg-bubble{border:1px solid var(--zh-line);}
html.__ROOT_CLASS__[data-theme="dark"] .zh-msg-bubble{border-color:transparent;}

/* 钉钉专属九宫格群聊伪装头像（3×3 蓝色系，经典群头像） */
html.__ROOT_CLASS__ .zh-conv-avatar.is-grid-mask{
  display:grid;grid-template-columns:repeat(3, 1fr);grid-template-rows:repeat(3, 1fr);
  gap:0;background:#C9E7FF;padding:0;overflow:hidden;border-radius:8px !important;
}
html.__ROOT_CLASS__ .zh-conv-avatar.is-grid-mask > span{
  display:flex;align-items:center;justify-content:center;width:100%;height:100%;
  color:#fff;font-size:7px;font-weight:700;line-height:1;
}
html.__ROOT_CLASS__ .zh-conv-avatar.is-text-avatar{
  border-radius:8px !important;font-size:14px;font-weight:600;
}

/* rail：对齐 im 钉钉，顶栏无文字小头像，侧栏顶部为组织小方块加名字，选中白卡 */
html.__ROOT_CLASS__ .zh-shell{padding:6px 0 8px;overflow:visible;align-items:stretch;}
html.__ROOT_CLASS__ .zh-rail-head{display:flex;padding:2px 8px 8px;align-items:center;}
html.__ROOT_CLASS__ .zh-rail-search{display:none !important;}
html.__ROOT_CLASS__ .zh-rail-toggle{display:none !important;}
html.__ROOT_CLASS__ .zh-rail-org-chip{
  display:flex;align-items:center;gap:6px;width:100%;
  padding:2px 4px;border-radius:6px;cursor:pointer;
}
html.__ROOT_CLASS__ .zh-rail-org-chip:hover{background:rgba(255,255,255,.6);}
html.__ROOT_CLASS__ .zh-rail-org-logo{
  width:24px;height:24px;border-radius:6px;background:#2F88FF;color:#fff;
  display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex:none;
}
html.__ROOT_CLASS__ .zh-rail-org-name{
  font-size:13px;font-weight:600;color:#1A1D24;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;
}
html.__ROOT_CLASS__ .zh-rail-org-arrow{
  width:12px;height:12px;color:#8A8F99;flex:none;margin-left:auto;
}
html.__ROOT_CLASS__ .zh-rail-items{padding:0 8px;gap:2px;}
html.__ROOT_CLASS__ .zh-rail-item{
  flex-direction:row;gap:8px;height:36px;padding:0 10px;
  font-size:14px;justify-content:flex-start;align-items:center;
  border-radius:8px;color:#5B616C;
}
html.__ROOT_CLASS__ .zh-rail-item .zh-rail-icon{width:18px;height:18px;color:#5B616C;}
html.__ROOT_CLASS__ .zh-rail-item:hover{background:rgba(255,255,255,.65);color:var(--zh-text);}
html.__ROOT_CLASS__ .zh-rail-item.active{
  background:#FFFFFF !important;color:#1A87FF !important;
  box-shadow:0 1px 4px rgba(31,35,41,.06) !important;font-weight:500;
}
html.__ROOT_CLASS__ .zh-rail-item.active .zh-rail-icon{color:#1A87FF !important;}
html.__ROOT_CLASS__[data-theme="dark"] .zh-rail-item.active{
  background:#252A34 !important;color:#3B92FF !important;box-shadow:none !important;
}
html.__ROOT_CLASS__ .zh-rail-bottom{padding:2px 8px 0;}
html.__ROOT_CLASS__.zh-rail-collapsed .zh-rail-org-name,
html.__ROOT_CLASS__.zh-rail-collapsed .zh-rail-org-arrow,
html.__ROOT_CLASS__.zh-rail-collapsed .zh-rail-label{
  display:none !important;
}
html.__ROOT_CLASS__.zh-rail-collapsed .zh-rail-item{
  justify-content:center !important;padding:0 !important;
}
html.__ROOT_CLASS__.zh-rail-collapsed .zh-rail-head{
  justify-content:center !important;
}

/* 中栏列表对齐 im 钉钉：隐藏内部多余搜索框，药丸芯片居中 */
html.__ROOT_CLASS__ .zh-list-header{padding:10px 12px;gap:0;}
html.__ROOT_CLASS__ .zh-list-head-top{display:none !important;}
html.__ROOT_CLASS__ .zh-list-chips{display:flex;gap:6px;align-items:center;width:100%;}
html.__ROOT_CLASS__ .zh-chip{height:24px;padding:0 10px;font-size:12px;border-radius:12px;}
html.__ROOT_CLASS__ .zh-conv.active{background:#E4EAF5 !important;}

/* 顶栏与侧栏同一条浅色渐变（对齐 im 钉钉，不再用亮色横幅） */
html.__ROOT_CLASS__:not([data-theme="dark"]) .zh-titlebar{
  background:linear-gradient(90deg,#D5E0F8 0%,#DCE4F9 100%);
  color:#1A1D24;box-shadow:none;padding:0 10px;
}
html.__ROOT_CLASS__:not([data-theme="dark"]) .zh-shell{
  background:linear-gradient(180deg,#D5E0F8 0%,#DCE4F9 100%);
  border-right:none;align-items:center;padding:8px 0;
}
html.__ROOT_CLASS__[data-theme="dark"] .zh-titlebar{
  background:var(--zh-bg);color:var(--zh-text);box-shadow:none;
}
html.__ROOT_CLASS__[data-theme="dark"] .zh-titlebar-search{background:var(--zh-hover);}
html.__ROOT_CLASS__[data-theme="dark"] .zh-titlebar-search input{color:var(--zh-text);}
html.__ROOT_CLASS__ .zh-titlebar .zh-act-btn{color:#4A4F5C;background:transparent;}
html.__ROOT_CLASS__ .zh-titlebar .zh-act-btn:hover{background:rgba(0,0,0,.05);}
html.__ROOT_CLASS__[data-theme="dark"] .zh-titlebar .zh-act-btn{color:var(--zh-text2);}
`;
  }
  function feishuCss() {
    return String.raw`
/* ============ Token: 飞书 light ============ */
html.__ROOT_CLASS__{
  --zh-bg:#FFFFFF; --zh-chat-bg:#FFFFFF; --zh-card:#FFFFFF; --zh-rail-bg:#D2E0F1;
  --zh-hover:#F5F6F7; --zh-selected:#E4EDFB; --zh-primary-soft:#C2D4FF;
  --zh-bubble-other:#EEEFEE; --zh-bubble-me:#E8F0FF;
  --zh-line:#E8E9EB; --zh-line-strong:#DEE0E3;
  --zh-text:#1F2329; --zh-text2:#646A73; --zh-text3:#8F959E;
  --zh-primary:#3370FF; --zh-danger:#F54840;
  --zh-banner:linear-gradient(135deg,#4468db,#3b82f6);
  --zh-topbar:0px; --zh-rail:230px; --zh-list:360px;
}
html.__ROOT_CLASS__[data-theme="dark"]{
  --zh-bg:#171A1F; --zh-chat-bg:#12151A; --zh-card:#22272E; --zh-rail-bg:#1B2230;
  --zh-hover:#22272E; --zh-selected:#243148; --zh-primary-soft:#3B5F8A;
  --zh-bubble-other:#2A2F36; --zh-bubble-me:#1A2F55;
  --zh-line:#2A3038; --zh-line-strong:#3A424C;
  --zh-text:#E5E6EB; --zh-text2:#A0A6B0; --zh-text3:#7B828C;
  --zh-primary:#4C82FF; --zh-danger:#F54840;
}
html.__ROOT_CLASS__[data-theme="dark"] .zh-rail-item.active{box-shadow:none;background:#2A3140;}
html.__ROOT_CLASS__[data-theme="dark"] .zh-rail-toggle:hover,
html.__ROOT_CLASS__[data-theme="dark"] .zh-shell .zh-act-btn:hover{background:rgba(255,255,255,.08);}

/* ============ 飞书形态：无整条顶栏，宽文字 rail，从页面顶开始 ============ */
html.__ROOT_CLASS__ .zh-titlebar{display:none !important;}
html.__ROOT_CLASS__ .zh-shell{padding:26px 12px 14px;align-items:stretch;}
html.__ROOT_CLASS__ .zh-rail-head{padding:2px 4px 12px;}
html.__ROOT_CLASS__ .zh-rail-toggle{display:none;}
html.__ROOT_CLASS__ .zh-rail-avatar{width:40px;height:40px;border-radius:50% !important;}
html.__ROOT_CLASS__ .zh-rail-items{gap:2px;padding:0;}
html.__ROOT_CLASS__ .zh-rail-item{
  height:44px;gap:12px;padding:0 12px;border-radius:10px;font-size:15px;
}
html.__ROOT_CLASS__ .zh-rail-item .zh-rail-icon{width:20px;height:20px;}
html.__ROOT_CLASS__ .zh-rail-item.active{
  background:#FFFFFF;font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.05);
}
html.__ROOT_CLASS__[data-theme="dark"] .zh-rail-item.active{background:#2A3140;box-shadow:none;}

/* 飞书会话行微调（带圆角边距，更贴合飞书桌面端原生体验） */
html.__ROOT_CLASS__ .zh-conv{margin:2px 8px;border-radius:8px;padding:10px 12px;}

/* 飞书专属文字圆标头像（双行四字群标 / 实心 / 空心） */
html.__ROOT_CLASS__ .zh-conv-avatar,
html.__ROOT_CLASS__ .zh-msg-avatar{border-radius:50% !important;}

html.__ROOT_CLASS__ .zh-conv-avatar.is-text-avatar{
  box-sizing:border-box !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  padding:0 !important;
}

html.__ROOT_CLASS__ .zh-conv-avatar.is-text-avatar .zh-avatar-text{
  position:static !important;
  inset:auto !important;
  display:flex !important;
  flex-direction:column !important;
  align-items:center !important;
  justify-content:center !important;
  width:100% !important;
  height:100% !important;
  margin:0 !important;
  padding:0 !important;
  font-weight:600;
  text-align:center !important;
}

html.__ROOT_CLASS__ .zh-conv-avatar.is-text-avatar .zh-avatar-text[data-len="4"]{
  display:flex !important;
  flex-direction:column !important;
  align-items:center !important;
  justify-content:center !important;
  gap:1px !important;
}

html.__ROOT_CLASS__ .zh-conv-avatar.is-text-avatar .zh-avatar-text[data-len="4"] span{
  display:block !important;
  font-size:11px !important;
  line-height:1.15 !important;
  text-align:center !important;
  letter-spacing:0.5px !important;
}

html.__ROOT_CLASS__ .zh-conv-avatar.is-text-avatar .zh-avatar-text[data-len="1"]{
  font-size:15px !important;
  line-height:1 !important;
  text-align:center !important;
}

html.__ROOT_CLASS__ .zh-conv-avatar.is-text-avatar .zh-avatar-text[data-len="2"]{
  font-size:12px !important;
  line-height:1 !important;
  text-align:center !important;
  letter-spacing:1px !important;
}

html.__ROOT_CLASS__ .zh-conv-avatar.is-hollow{background:#FFFFFF !important;}
html.__ROOT_CLASS__[data-theme="dark"] .zh-conv-avatar.is-hollow{background:#171A1F !important;}

/* 飞书不展示标签小气泡，对齐 im 保持列表清爽 */
html.__ROOT_CLASS__ .zh-conv-tag{display:none !important;}
`;
  }
  function wecomCss() {
    return String.raw`
/* ============ Token: 企微 light ============ */
html.__ROOT_CLASS__{
  --zh-bg:#FFFFFF; --zh-chat-bg:#F5F7FA; --zh-card:#FFFFFF; --zh-rail-bg:#D6E4F4;
  --zh-hover:#E7EEF8; --zh-selected:#DCEBFF; --zh-primary-soft:#C9DFFB;
  --zh-bubble-other:#E4E7EC; --zh-bubble-me:#BDE4FF;
  --zh-line:#D9E0E9; --zh-line-strong:#C5CFDB;
  --zh-text:#172033; --zh-text2:#526175; --zh-text3:#8B98AA;
  --zh-primary:#4389F5; --zh-danger:#FA5151;
  --zh-banner:linear-gradient(135deg,#2b7ffb,#59f0d8);
  --zh-topbar:0px; --zh-rail:162px; --zh-list:304px;
}
html.__ROOT_CLASS__[data-theme="dark"]{
  --zh-bg:#101011; --zh-chat-bg:#202021; --zh-card:#2C2C2D; --zh-rail-bg:#1B1B1C;
  --zh-hover:#272829; --zh-selected:#173153; --zh-primary-soft:#3B5F8A;
  --zh-bubble-other:#303031; --zh-bubble-me:#093159;
  --zh-line:rgba(255,255,255,.1); --zh-line-strong:rgba(255,255,255,.2);
  --zh-text:#F7F7F7; --zh-text2:rgba(250,252,255,.72); --zh-text3:rgba(250,252,255,.55);
  --zh-primary:#338CFF; --zh-danger:#FF5962;
}

/* ============ 企微形态：渐变 titlebar + 中等图标文字 rail ============ */
/* 企微头像为小圆角方形（对齐 x 实测值 6px）；img 覆盖层继承容器圆角 */
html.__ROOT_CLASS__ .zh-conv-avatar,
html.__ROOT_CLASS__ .zh-msg-avatar,
html.__ROOT_CLASS__ .zh-rail-avatar{border-radius:6px !important;}
html.__ROOT_CLASS__ .zh-rail-item{height:40px;font-size:14px;}
html.__ROOT_CLASS__ .zh-shell .zh-act-btn{height:36px;font-size:13px;}

/* 企微小圆角伪装头像 */
html.__ROOT_CLASS__ .zh-conv-avatar.is-grid-mask.is-wecom{
  display:grid;grid-template-columns:repeat(3, 1fr);grid-template-rows:repeat(3, 1fr);
  gap:0;background:#C9DFFB;padding:0;overflow:hidden;border-radius:6px !important;
}
html.__ROOT_CLASS__ .zh-conv-avatar.is-grid-mask.is-wecom > span{
  display:flex;align-items:center;justify-content:center;width:100%;height:100%;
  color:#fff;font-size:7px;font-weight:700;line-height:1;
}
html.__ROOT_CLASS__ .zh-conv-avatar.is-text-avatar.is-wecom{
  border-radius:6px !important;font-size:13px;font-weight:600;
}

/* 侧栏顶：头像居左，不要收起钮。列表选中用浅底，不要整行蓝底白字 */
html.__ROOT_CLASS__ .zh-rail-head{height:56px;padding:0 14px;justify-content:flex-start;}
html.__ROOT_CLASS__ .zh-rail-toggle{display:none;}
html.__ROOT_CLASS__ .zh-rail-avatar{width:36px;height:36px;border-radius:8px;}
html.__ROOT_CLASS__ .zh-conv.active{background:#E8EEF6;}
html.__ROOT_CLASS__[data-theme="dark"] .zh-conv.active{background:var(--zh-selected);}
html.__ROOT_CLASS__ .zh-conv-tag{display:none;}
html.__ROOT_CLASS__ .zh-list-header{
  flex-direction:row;align-items:center;gap:8px;padding:8px 12px;
}
html.__ROOT_CLASS__ .zh-list-head-top{flex:1;min-width:0;}
html.__ROOT_CLASS__ .zh-list-search{
  height:32px;border:none;border-radius:16px;background:#F3F5F8;padding:0 12px;
}
html.__ROOT_CLASS__ .zh-list-chips{flex:none;}
html.__ROOT_CLASS__ .zh-chip{height:24px;padding:0 8px;}

/* 顶栏与钉钉同一条浅色条；侧栏保持企微的蓝灰底，搜索只留在顶栏 */
html.__ROOT_CLASS__:not([data-theme="dark"]) .zh-titlebar{
  background:linear-gradient(90deg,#D5E0F8 0%,#DCE4F9 100%);
  color:#172033;box-shadow:none;padding:0 10px;
}
html.__ROOT_CLASS__[data-theme="dark"] .zh-titlebar{
  background:var(--zh-bg);color:var(--zh-text);box-shadow:none;
}
html.__ROOT_CLASS__ .zh-titlebar-title{color:inherit;}
html.__ROOT_CLASS__ .zh-titlebar-search{
  background:rgba(255,255,255,.72);height:26px;border-radius:13px;
  flex:0 1 420px;margin:0 auto;padding:0 12px;
}
html.__ROOT_CLASS__[data-theme="dark"] .zh-titlebar-search{background:var(--zh-hover);}
html.__ROOT_CLASS__ .zh-titlebar-search svg,
html.__ROOT_CLASS__ .zh-titlebar-search input::placeholder{color:#8B98AA;}
html.__ROOT_CLASS__ .zh-titlebar-search input{color:#172033;}
html.__ROOT_CLASS__[data-theme="dark"] .zh-titlebar-search input{color:var(--zh-text);}
html.__ROOT_CLASS__ .zh-titlebar .zh-act-btn{color:#526175;background:transparent;}
html.__ROOT_CLASS__ .zh-titlebar .zh-act-btn:hover{background:rgba(0,0,0,.05);}
html.__ROOT_CLASS__[data-theme="dark"] .zh-titlebar .zh-act-btn{color:var(--zh-text2);}
html.__ROOT_CLASS__:not([data-theme="dark"]) .zh-shell{
  background:#D6E4F4;border-right:1px solid #C9D9EB;padding:10px 0 8px;align-items:stretch;
}
html.__ROOT_CLASS__ .zh-rail-search{display:none;}
html.__ROOT_CLASS__ .zh-rail-items{gap:1px;padding:4px 12px 8px;}
html.__ROOT_CLASS__ .zh-rail-item{
  height:40px;flex:0 0 40px;border-radius:8px;gap:10px;padding:0 10px;
  font-size:14px;color:#3E5166;justify-content:flex-start;
}
html.__ROOT_CLASS__ .zh-rail-item .zh-rail-icon{width:18px;height:18px;color:#5A6E86;}
html.__ROOT_CLASS__ .zh-rail-item:hover{background:rgba(79,143,234,.09);}
html.__ROOT_CLASS__ .zh-rail-item.active{
  color:#1F6FE5;background:#CFE4FF;box-shadow:none;font-weight:500;
}
html.__ROOT_CLASS__ .zh-rail-item.active .zh-rail-icon{color:#1F6FE5;}
html.__ROOT_CLASS__ .zh-rail-groups{margin-top:8px;}
html.__ROOT_CLASS__ .zh-rail-group-title{
  padding:8px 10px 4px;font-size:12px;color:#8B98AA;
}
html.__ROOT_CLASS__ .zh-rail-bottom{padding:2px 12px 0;}
html.__ROOT_CLASS__.zh-rail-collapsed .zh-rail-label,
html.__ROOT_CLASS__.zh-rail-collapsed .zh-rail-group-title,
html.__ROOT_CLASS__.zh-rail-collapsed .zh-rail-name{display:none;}
html.__ROOT_CLASS__.zh-rail-collapsed .zh-rail-item{justify-content:center;padding:0;}
`;
  }
  function interpolate(css) {
    return css.replace(/__ROOT_CLASS__/g, ROOT_CLASS);
  }
  function skinCss() {
    let skin;
    if (SKIN_ID === "feishu") skin = feishuCss();
    else if (SKIN_ID === "wecom") skin = wecomCss();
    else skin = dingtalkCss();
    return interpolate(skin + "\n" + CSS_CORE);
  }
  function isDetailPath(pathname) {
    return /^\/(question|p|zvideo|pin)\//.test(pathname);
  }
  function isPeoplePath(pathname) {
    return /^\/(people|org)\//.test(pathname);
  }
  function isFeedPath(pathname) {
    if (isDetailPath(pathname) || isPeoplePath(pathname)) return false;
    if (/^\/(settings|feed|notifications|login|signin|signup|404)\b/.test(pathname)) return false;
    return true;
  }
  function contentTypeFromHref(href) {
    try {
      const p = new URL(href, location.origin).pathname;
      if (/^\/question\//.test(p)) return "question";
      if (/^\/p\//.test(p)) return "article";
      if (/^\/zvideo\//.test(p)) return "video";
      if (/^\/pin\//.test(p)) return "pin";
      if (/^\/people\//.test(p)) return "person";
    } catch {
    }
    return "other";
  }
  function normalizeDetailHref(href) {
    if (!href) return "";
    try {
      const u = new URL(href, location.origin);
      const m = u.pathname.match(/^\/question\/(\d+)(?:\/answer\/\d+)?/);
      if (m) {
        return `/question/${m[1]}`;
      }
      return u.pathname;
    } catch {
      const m = String(href).match(/^\/question\/(\d+)(?:\/answer\/\d+)?/);
      if (m) return `/question/${m[1]}`;
      return href;
    }
  }
  const FEED_VIEWS = [
    { key: "follow", label: "关注", path: "/follow" },
    { key: "recommend", label: "推荐", path: "/" },
    { key: "hot", label: "热榜", path: "/hot" }
  ];
  function isHotPath(path = location.pathname) {
    return path === "/hot" || path.startsWith("/hot/");
  }
  function isSearchPath(path = location.pathname) {
    return path === "/search" || path.startsWith("/search/");
  }
  function feedRoot() {
    const path = location.pathname;
    if (isSearchPath(path)) {
      return document.querySelector(".Search-container, .SearchMain, .SearchSections, .Topstory-mainColumn");
    }
    if (isHotPath(path)) {
      const hot = document.querySelector(".HotList, .HotHome, [class*='HotList']");
      if (hot) return hot;
      const item = document.querySelector(".HotItem");
      return (item == null ? void 0 : item.parentElement) || null;
    }
    if (path === "/follow" || path.startsWith("/follow/")) {
      return document.querySelector(".Topstory-follow, .Topstory-mainColumn");
    }
    return document.querySelector(".Topstory-mainColumn, .Topstory-recommend");
  }
  function feedCards() {
    if (isSearchPath()) {
      const root2 = feedRoot();
      const selector = ".SearchResult-Card, .ContentItem, .List-item, .Card";
      const cards = root2 ? [...root2.querySelectorAll(selector)] : [...document.querySelectorAll(selector)];
      return cards.filter((c) => c.querySelector('a[href*="/question/"], a[href*="/p/"], a[href*="/zvideo/"], a[href*="/pin/"]'));
    }
    if (isHotPath()) {
      const root2 = feedRoot();
      const scoped = root2 ? [...root2.querySelectorAll(".HotItem")] : [];
      if (scoped.length) return scoped;
      return [...document.querySelectorAll(".HotItem")];
    }
    const root = feedRoot();
    if (!root) return [];
    return [...root.querySelectorAll(".TopstoryItem, .TopstoryItem-isRecommend, .ContentItem")];
  }
  function extractHotItem(card) {
    var _a, _b, _c, _d;
    const link = card.querySelector('a[href*="/question/"], a[href*="/p/"], a[href*="/zvideo/"], a[href*="/pin/"]');
    if (!link) return null;
    const href = link.getAttribute("href");
    if (!href) return null;
    const rank = ((_b = (_a = card.querySelector(".HotItem-rank")) == null ? void 0 : _a.innerText) == null ? void 0 : _b.trim()) || "";
    const title = (card.querySelector(".HotItem-title") || link).innerText.replace(/\s+/g, " ").trim();
    const rawHeat = ((_d = (_c = card.querySelector(".HotItem-metrics")) == null ? void 0 : _c.innerText) == null ? void 0 : _d.replace(/\s+/g, " ").trim()) || "";
    const heat = rawHeat.replace(/万?热度|\s*分享/g, "").trim();
    const num = Number(rank);
    const time = num <= 3 ? "刚刚" : num <= 10 ? "10分钟前" : num <= 20 ? "30分钟前" : "1小时前";
    return {
      href,
      type: "hot",
      title,
      author: rank ? `No.${rank} 热榜` : "知乎热榜",
      avatar: "",
      summary: heat ? `[热度 ${heat}万] 知乎全站讨论进行中` : "知乎全站实时热议中",
      votes: heat,
      time
    };
  }
  const AD_SEL = [
    ".TopstoryItem--advertCard",
    ".Pc-card",
    ".Pc-word",
    ".Pc-word-new",
    ".RichText-ADLinkCardContainer",
    ".Pc-Business-Card-PcTopFeedBanner",
    ".Business-Card-PcRightBanner-link",
    ".ZhiGoodsCard",
    ".KfeCollection-PcCollegeCard-root",
    ".KfeCollection-AnswerTopCard-Container",
    ".pc-article-answer",
    ".pc-article-answer-text-chain"
  ].join(",");
  function cleanAvatarUrl(url) {
    if (!url || !/^https?:\/\//.test(url)) return "";
    try {
      const u = new URL(url, location.origin);
      u.search = "";
      u.pathname = u.pathname.replace(/_(xs|s|m)(\.\w+)$/, "_l$2");
      return u.href;
    } catch {
      return "";
    }
  }
  function avatarUrlOf(scope) {
    var _a;
    const img = (_a = scope == null ? void 0 : scope.querySelector) == null ? void 0 : _a.call(scope, ".Avatar, .AuthorInfo-avatarWrapper img");
    if (!img) return "";
    return cleanAvatarUrl(img.getAttribute("data-actualsrc") || img.getAttribute("data-src") || img.src);
  }
  function neutralizeVideos(root) {
    if (!root) return;
    const list = root.tagName === "VIDEO" ? [root] : root.querySelectorAll("video");
    list.forEach((v) => {
      var _a, _b;
      try {
        if (!v.getAttribute("src") && !v.querySelector("source")) return;
        (_a = v.pause) == null ? void 0 : _a.call(v);
        v.removeAttribute("autoplay");
        v.preload = "none";
        v.removeAttribute("src");
        v.querySelectorAll("source").forEach((s) => s.remove());
        (_b = v.load) == null ? void 0 : _b.call(v);
      } catch {
      }
    });
  }
  function extractCard(card) {
    var _a, _b;
    try {
      if (card.classList.contains("TopstoryItem--advertCard") || card.querySelector(AD_SEL)) return null;
      const isHotRoute = location.pathname === "/hot" || location.pathname.startsWith("/hot/");
      const isHotCard = card.classList.contains("HotItem") || ((_a = card.querySelector) == null ? void 0 : _a.call(card, ".HotItem-title, .HotItem-rank, [class*='HotItem-title']"));
      if (isHotCard) {
        if (!isHotRoute) return null;
        const hot = extractHotItem(card);
        if (hot) return hot;
      }
      if (isHotRoute) return null;
      const linkEl = card.querySelector(
        'a[href*="/question/"], a[href*="/p/"], a[href*="/zvideo/"], a[href*="/pin/"]'
      );
      if (!linkEl) return null;
      const rawHref = linkEl.getAttribute("href");
      if (!rawHref) return null;
      const href = normalizeDetailHref(rawHref);
      const type = contentTypeFromHref(href);
      const titleEl = card.querySelector(".ContentItem-title, .SearchResult-title, h2") || linkEl;
      const title = (titleEl.textContent || titleEl.innerText || "").replace(/\s+/g, " ").trim();
      if (!title && type === "other") return null;
      const authorEl = card.querySelector(".AuthorInfo-name, .FeedSource, .SearchItem-author");
      const author = ((authorEl == null ? void 0 : authorEl.textContent) || (authorEl == null ? void 0 : authorEl.innerText) || "").replace(/\s+/g, " ").trim();
      const summaryEl = card.querySelector(".RichContent-inner, .RichContent, .SearchItem-snippet, .RichText");
      const rawSummary = ((summaryEl == null ? void 0 : summaryEl.textContent) || (summaryEl == null ? void 0 : summaryEl.innerText) || "").replace(/\s+/g, " ").trim();
      const voteEl = card.querySelector(".VoteButton--up");
      const votes = voteEl ? (voteEl.textContent || voteEl.getAttribute("aria-label") || "").trim() : "";
      const rawTime = (((_b = card.querySelector(".ContentItem-time, .FeedSource-time")) == null ? void 0 : _b.textContent) || "").trim();
      const time = rawTime ? rawTime.replace(/^(发布于|编辑于)\s*/, "") : "刚刚";
      const avatar = avatarUrlOf(card);
      let summary = rawSummary;
      if (author && rawSummary) {
        summary = `${author}: ${rawSummary}`;
      } else if (votes && rawSummary) {
        summary = `[${votes}] ${rawSummary}`;
      } else if (!summary) {
        summary = "知乎精选讨论 · 点击阅读详情";
      }
      return { href, type, title, author, avatar, summary, votes, time };
    } catch {
      return null;
    }
  }
  function descText(doc = document) {
    const el = doc.querySelector(".QuestionRichText");
    if (!el) return "";
    const c = el.cloneNode(true);
    c.querySelectorAll("button, .QuestionRichText-more").forEach((n) => n.remove());
    return (c.innerText || c.textContent || "").replace(/[\u200B\u200E]/g, "").trim();
  }
  function cleanRich(rich) {
    const clone = rich.cloneNode(true);
    clone.style.removeProperty("max-height");
    clone.style.removeProperty("height");
    clone.querySelectorAll("script").forEach((n) => n.remove());
    clone.innerHTML = clone.innerHTML.replace(/[\u200B\u200E]/g, "");
    clone.querySelectorAll("img").forEach((img) => {
      const real = img.getAttribute("data-actualsrc");
      if (real) img.src = real;
      img.removeAttribute("data-actualsrc");
      img.removeAttribute("data-original");
      img.loading = "lazy";
    });
    clone.querySelectorAll("button, .ContentItem-more").forEach((n) => n.remove());
    return clone.innerHTML;
  }
  function formatAnswerTime(ts) {
    if (!ts) return "";
    const d = new Date(ts * 1e3);
    if (isNaN(d.getTime())) return "";
    const p = (n) => String(n).padStart(2, "0");
    return `发布于${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function actionStats(scope) {
    var _a, _b, _c;
    const voteBtn = scope.querySelector(".VoteButton--up");
    const votes = ((voteBtn == null ? void 0 : voteBtn.getAttribute("aria-label")) || (voteBtn == null ? void 0 : voteBtn.textContent) || "").trim();
    const cText = (((_a = scope.querySelector(".ContentItem-actions")) == null ? void 0 : _a.textContent) || "").trim();
    const comments = ((_b = cText.match(/(\d+)\s*条评论/)) == null ? void 0 : _b[1]) || "";
    const time = (((_c = scope.querySelector(".ContentItem-time")) == null ? void 0 : _c.textContent) || "").trim();
    return { votes, comments, time };
  }
  function authorOf(scope) {
    var _a;
    const el = scope.querySelector(
      ".AuthorInfo-name, .Post-Header .AuthorInfo-name, .ZVideo-followStatus .AuthorInfo-name"
    );
    return {
      author: ((el == null ? void 0 : el.textContent) || (el == null ? void 0 : el.innerText) || "").trim(),
      avatar: avatarUrlOf(scope),
      badge: (((_a = scope.querySelector(".AuthorInfo-badgeText")) == null ? void 0 : _a.textContent) || "").trim()
    };
  }
  function extractSingleAnswer(el, key) {
    const rich = el.querySelector(".RichContent-inner");
    if (!rich) return null;
    return { key, ...authorOf(el), html: cleanRich(rich), ...actionStats(el) };
  }
  function extractQuestion(doc = document) {
    var _a, _b, _c, _d, _e;
    const root = doc.querySelector(".Question-main, .QuestionPage, .Question-mainColumn");
    if (!root) return null;
    const title = (((_a = doc.querySelector(".QuestionHeader-title")) == null ? void 0 : _a.textContent) || ((_b = doc.querySelector("h1")) == null ? void 0 : _b.textContent) || "").trim();
    const desc = descText(doc);
    const answers = [];
    const map = /* @__PURE__ */ new Map();
    const list = root.querySelector(".Question-mainColumn") || root;
    list.querySelectorAll(".AnswerItem").forEach((el, i) => {
      const key = `a${i}`;
      const ans = extractSingleAnswer(el, key);
      if (!ans) return;
      map.set(key, el);
      answers.push(ans);
    });
    if (!answers.length) {
      console.info("[zhihu-im] parse fail: 容器内有 0 个带正文的 .AnswerItem");
      return null;
    }
    const allActionText = (((_c = list.querySelector(".ViewAll-QuestionMainAction, .List-headerText")) == null ? void 0 : _c.textContent) || "").trim();
    const total = ((_d = allActionText.match(/([\d,]+)\s*个回答/)) == null ? void 0 : _d[1]) || ((_e = allActionText.match(/(\d+)/)) == null ? void 0 : _e[1]) || String(answers.length);
    let feedsNext = "";
    try {
      const initEl = doc.querySelector("#js-initialData");
      const init = JSON.parse((initEl == null ? void 0 : initEl.textContent) || "");
      const qas = init && init.initialState && init.initialState.question && init.initialState.question.answers || {};
      const qid = Object.keys(qas)[0];
      feedsNext = qid && qas[qid].next || "";
    } catch {
    }
    return { kind: "question", title, desc, answers, total, map, feedsNext };
  }
  function extractArticle(doc = document) {
    var _a;
    const main = doc.querySelector(".PostIndex-main");
    if (!main) return null;
    const title = (((_a = main.querySelector(".Post-Title, .Post-Header h1, article h1")) == null ? void 0 : _a.textContent) || "").trim();
    const rich = main.querySelector(".Post-RichTextContainer .RichText, .Post-RichTextContainer");
    if (!rich) return null;
    const map = /* @__PURE__ */ new Map();
    map.set("a0", main);
    const answers = [{ key: "a0", ...authorOf(main), html: cleanRich(rich), ...actionStats(main) }];
    return { kind: "article", title, desc: "", answers, total: "", map };
  }
  function extractVideo(doc = document) {
    var _a;
    const main = doc.querySelector(".ZVideo-mainColumn");
    if (!main) return null;
    const title = (((_a = main.querySelector(".ZVideo-title")) == null ? void 0 : _a.textContent) || "").trim();
    const parts = [];
    const v = main.querySelector("video");
    if (v) {
      const c = v.cloneNode(true);
      c.controls = true;
      c.preload = "metadata";
      c.removeAttribute("style");
      parts.push(c.outerHTML);
    }
    const d = main.querySelector(".ZVideo-description .RichText, .ZVideo-description");
    if (d) parts.push(cleanRich(d));
    if (!parts.length) return null;
    const map = /* @__PURE__ */ new Map();
    map.set("a0", main);
    const answers = [
      { key: "a0", ...authorOf(main), html: parts.join(""), ...actionStats(main) }
    ];
    return { kind: "video", title, desc: "", answers, total: "", map };
  }
  function extractChat(doc = document) {
    return extractQuestion(doc) || extractArticle(doc) || extractVideo(doc) || null;
  }
  async function fetchAndParseChat(path) {
    try {
      const res = await fetch(path, { credentials: "same-origin" });
      if (!res.ok) return null;
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      return extractChat(doc);
    } catch (e) {
      console.warn("[zhihu-im] fetchAndParseChat failed:", e);
      return null;
    }
  }
  function detailTitleFromDom() {
    var _a, _b, _c, _d, _e, _f;
    try {
      const title = ((_b = (_a = document.querySelector(".QuestionHeader-title")) == null ? void 0 : _a.innerText) == null ? void 0 : _b.trim()) || ((_d = (_c = document.querySelector(".Post-Title")) == null ? void 0 : _c.innerText) == null ? void 0 : _d.trim()) || ((_f = (_e = document.querySelector("h1")) == null ? void 0 : _e.innerText) == null ? void 0 : _f.trim());
      return title && title.length < 120 ? title : "";
    } catch {
      return "";
    }
  }
  const ICONS = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1L3 20l1.2-5.3A8.5 8.5 0 1 1 21 11.5z"/></svg>',
    msg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16v11H8l-4 3z"/></svg>',
    work: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="8" width="16" height="11" rx="2"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><path d="M12 4c2 2.5 3 5.2 3 8s-1 5.5-3 8c-2-2.5-3-5.2-3-8s1-5.5 3-8z"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 3v6h6"/></svg>',
    wiki: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>',
    task: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>',
    contact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
    meet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="12" height="10" rx="2"/><path d="M15 10l6-3v10l-6-3"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16"/></svg>',
    todo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 12l2 2 4-4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    disk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h8l4 4v14H6z"/><path d="M9 13h6M9 17h6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 13A8 8 0 0 1 6.5 5.5 8 8 0 0 0 20 13z"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h11M4 7l3-3M4 7l3 3"/><path d="M20 17H9M20 17l-3-3M20 17l-3 3"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11 12 3l9 8"/><path d="M5.5 9.5V21h13V9.5"/></svg>',
    hot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 3a9 9 0 1 0 7 14"/><path d="M13 3c0 5 3 6 3 10a5.4 5.4 0 0 1-5 5.4"/><path d="M13 3c-2 2-3 4-3 6a4 4 0 0 0 8 0"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v6h-6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5l7 9h-4v5H9v-5H5z"/></svg>',
    comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a8 8 0 0 1-8 8H5l1.5-3.2A8 8 0 1 1 21 12z"/></svg>',
    disguise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><line x1="2" y1="2" x2="22" y2="22"/></svg>'
  };
  function ensureTitlebar() {
    var _a, _b;
    if (document.querySelector(".zh-titlebar")) return;
    if (SKINS[SKIN_ID].titlebarHeight === 0) return;
    const bar = document.createElement("header");
    bar.className = "zh-titlebar";
    const userImg = ((_a = document.querySelector(".AppHeader-profilePic, .AppHeader-userAvatar img, .Avatar")) == null ? void 0 : _a.getAttribute("src")) || "";
    const avatar = userImg ? `<img src="${userImg}" alt="" onerror="this.remove()">` : `<span class="zh-titlebar-logo">知</span>`;
    bar.innerHTML = `
    <div class="zh-titlebar-me">${avatar}</div>
    <div class="zh-titlebar-search">
      <form action="/search" method="get" role="search">
        ${ICONS.search}
        <input type="search" name="q" placeholder="搜索或提问 (⌘K)" autocomplete="off" aria-label="搜索" />
      </form>
    </div>
    <div class="zh-titlebar-actions"></div>`;
    (_b = bar.querySelector("form")) == null ? void 0 : _b.addEventListener("submit", (e) => {
      var _a2;
      e.preventDefault();
      const q = (_a2 = bar.querySelector("input")) == null ? void 0 : _a2.value.trim();
      if (q) location.href = `/search?q=${encodeURIComponent(q)}&type=content`;
    });
    document.body.appendChild(bar);
    return bar;
  }
  function itemIcon(item) {
    return `<span class="zh-rail-icon">${ICONS[item.icon] || ICONS.doc}</span>`;
  }
  function ensureRail() {
    var _a;
    if (document.querySelector(".zh-shell")) return;
    const shell = document.createElement("div");
    shell.className = "zh-shell";
    shell.dataset.skin = SKIN_ID;
    const head = document.createElement("div");
    head.className = "zh-rail-head";
    if (SKIN_ID === "dingtalk") {
      head.innerHTML = `
      <div class="zh-rail-org-chip">
        <span class="zh-rail-org-logo">知</span>
        <span class="zh-rail-org-name">zhihu.com</span>
        <svg class="zh-rail-org-arrow" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
      </div>`;
    } else {
      const userImg = ((_a = document.querySelector(".AppHeader-profilePic, .AppHeader-userAvatar img, .Avatar")) == null ? void 0 : _a.getAttribute("src")) || "";
      const avatarContent = userImg ? `<img src="${userImg}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="this.remove()">` : "";
      head.innerHTML = `
      <div class="zh-rail-avatar">${avatarContent}<span class="zh-rail-avatar-dot"></span></div>
      <button type="button" class="zh-rail-toggle" title="展开 / 收起">${ICONS.menu}</button>`;
    }
    shell.appendChild(head);
    const search = document.createElement("div");
    search.className = "zh-rail-search";
    search.innerHTML = `<form action="/search" role="search">${ICONS.search}<input type="search" name="q" placeholder="搜索" autocomplete="off"/></form>`;
    search.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = search.querySelector("input").value.trim();
      if (q) location.href = `/search?q=${encodeURIComponent(q)}&type=content`;
    });
    shell.appendChild(search);
    const items = document.createElement("div");
    items.className = "zh-rail-items";
    const list = SKINS[SKIN_ID].rail || SKINS.feishu.rail;
    items.innerHTML = list.map(
      (it, i) => `<button type="button" class="zh-rail-item${i === 0 ? " active" : ""}" data-path="${it.path || ""}">
        ${itemIcon(it)}<span class="zh-rail-label">${it.label}</span>
      </button>`
    ).join("");
    items.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-path]");
      if (!b || !b.dataset.path) return;
      if (location.pathname === b.dataset.path) return;
      location.href = b.dataset.path;
    });
    shell.appendChild(items);
    if (SKIN_ID === "wecom") {
      const groups = document.createElement("div");
      groups.className = "zh-rail-groups";
      const groupItems = [
        ["未读", "msg"],
        ["@我", "contact"],
        ["单聊", "chat"],
        ["群聊", "chat"],
        ["内部聊天", "msg"],
        ["外部聊天", "doc"],
        ["标记", "hot"]
      ];
      groups.innerHTML = `<div class="zh-rail-group-title"><span>分组</span></div>` + groupItems.map(
        ([label, icon]) => `<button type="button" class="zh-rail-item">${itemIcon({ icon })}<span class="zh-rail-label">${label}</span></button>`
      ).join("");
      items.appendChild(groups);
    }
    const bottom = document.createElement("div");
    bottom.className = "zh-rail-bottom";
    if (SKIN_ID === "wecom" || SKIN_ID === "dingtalk") {
      const fold = document.createElement("button");
      fold.type = "button";
      fold.className = "zh-rail-item zh-rail-collapse";
      fold.innerHTML = `<span class="zh-rail-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 6l-6 6 6 6"/></svg></span><span class="zh-rail-label">收起</span>`;
      fold.addEventListener("click", () => {
        const collapsed = document.documentElement.classList.toggle("zh-rail-collapsed");
        const minW = SKIN_ID === "dingtalk" ? 56 : 72;
        const defaultW = SKINS[SKIN_ID].railWidth;
        document.documentElement.style.setProperty("--zh-rail", collapsed ? `${minW}px` : `${defaultW}px`);
        fold.querySelector(".zh-rail-label").textContent = collapsed ? "" : "收起";
      });
      bottom.appendChild(fold);
    }
    shell.appendChild(bottom);
    document.body.appendChild(shell);
  }
  function highlightRail() {
    const cur = location.pathname;
    document.querySelectorAll(".zh-rail-item[data-path]").forEach((b) => {
      const on = b.dataset.path === "/" ? cur === "/" : !!b.dataset.path && (cur === b.dataset.path || cur.startsWith(b.dataset.path + "/"));
      b.classList.toggle("active", on);
    });
  }
  const OUR_SEL = ".zh-shell, .zh-titlebar, .zh-list-panel, .zh-list-recent, .zh-chat-empty, .zh-skin-menu";
  let lastDockScan = 0;
  function hideForeignDocks() {
    const now = Date.now();
    if (now - lastDockScan < 150) return;
    lastDockScan = now;
    for (const el of document.body.children) {
      if (!(el instanceof HTMLElement)) continue;
      if (el.closest(OUR_SEL) || el.id === "zhihu-im-theme") continue;
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      if (r.left <= 2 && r.width >= 40 && r.width <= 140 && r.top <= 120 && r.height >= 200) {
        if (!el.dataset.zhDock) {
          el.dataset.zhDock = "1";
          el.dataset.zhDockPrev = el.style.display || "";
        }
        el.style.setProperty("display", "none", "important");
      }
    }
  }
  function restoreForeignDocks() {
    document.querySelectorAll("[data-zh-dock]").forEach((el) => {
      const h = el;
      h.style.display = h.dataset.zhDockPrev || "";
      delete h.dataset.zhDock;
      delete h.dataset.zhDockPrev;
    });
  }
  function mountDarkBtn(host) {
    if (!host || host.querySelector(".zh-act-dark")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "zh-act-btn zh-act-dark";
    b.title = "深色模式";
    b.innerHTML = ICONS.moon;
    b.addEventListener("click", (e) => {
      var _a;
      e.preventDefault();
      e.stopPropagation();
      (_a = host.__zhOnDark) == null ? void 0 : _a.call(host);
    });
    host.appendChild(b);
    return b;
  }
  function setDarkHandler(host, onDark) {
    if (host) host.__zhOnDark = onDark;
  }
  function mountSkinBtn(host, onSkin) {
    if (!host || host.querySelector(".zh-act-skin")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "zh-act-btn zh-act-skin";
    b.title = "切换外观";
    b.innerHTML = ICONS.swap;
    b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onSkin == null ? void 0 : onSkin(b);
    });
    host.appendChild(b);
    return b;
  }
  const themeChangeListeners = [];
  function toggleColorTheme() {
    const cur = getColorTheme();
    setColorTheme(cur === "auto" ? "dark" : cur === "dark" ? "light" : "auto");
    applyColorMode();
  }
  function systemDark() {
    var _a;
    return ((_a = window.matchMedia) == null ? void 0 : _a.call(window, "(prefers-color-scheme: dark)").matches) ?? false;
  }
  function isDarkEffective() {
    const t = getColorTheme();
    if (t === "dark") return true;
    if (t === "light") return false;
    return systemDark();
  }
  function forceSiteScheme() {
    const html = document.documentElement;
    if (!html) return;
    const dark = isDarkEffective();
    const cls = `${ROOT_CLASS}-${DARK_CLASS}`;
    if (html.getAttribute("data-theme") !== (dark ? "dark" : "light")) {
      html.setAttribute("data-theme", dark ? "dark" : "light");
    }
    html.classList.toggle(cls, dark);
  }
  function applyColorMode() {
    forceSiteScheme();
    for (const fn of themeChangeListeners) fn();
  }
  const OK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12.5l5 5L20 6.5"/></svg>`;
  let menu = null;
  function closeSkinMenu() {
    menu == null ? void 0 : menu.remove();
    menu = null;
    document.removeEventListener("click", onOutside, true);
  }
  function onOutside(e) {
    if (menu && !menu.contains(e.target)) closeSkinMenu();
  }
  function toggleSkinMenu(anchor) {
    if (menu) {
      closeSkinMenu();
      return;
    }
    const el = document.createElement("div");
    el.className = "zh-skin-menu";
    el.innerHTML = SKIN_ORDER.map(
      (id) => `<button type="button" class="zh-skin-item${id === SKIN_ID ? " active" : ""}" data-skin="${id}"><span>${SKINS[id].label}</span>${id === SKIN_ID ? `<span class="ok">${OK}</span>` : ""}</button>`
    ).join("") + `<div class="zh-skin-sep"></div><button type="button" class="zh-skin-item" data-mode="native"><span>原版知乎</span></button>`;
    el.addEventListener("click", (e) => {
      const nat = e.target.closest("[data-mode='native']");
      if (nat) {
        setViewMode("native");
        closeSkinMenu();
        location.reload();
        return;
      }
      const item = e.target.closest("[data-skin]");
      if (!item) return;
      setSkinId(item.dataset.skin);
      closeSkinMenu();
      location.reload();
    });
    document.body.appendChild(el);
    const r = anchor.getBoundingClientRect();
    let left = Math.max(8, Math.min(r.right - el.offsetWidth, innerWidth - el.offsetWidth - 8));
    let top = r.bottom + 6;
    if (top + el.offsetHeight > innerHeight - 8) top = Math.max(8, r.top - el.offsetHeight - 6);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    menu = el;
    setTimeout(() => document.addEventListener("click", onOutside, true), 0);
  }
  function ensureNativeFab() {
    var _a;
    if (getViewMode() !== "native") {
      (_a = document.querySelector(".zh-fab")) == null ? void 0 : _a.remove();
      return;
    }
    if (document.querySelector(".zh-fab")) return;
    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "zh-fab";
    fab.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:10001;height:38px;padding:0 16px;border-radius:19px;border:none;background:#2F88FF;color:#fff;font:700 14px/1 system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.22);display:flex;align-items:center;gap:6px;";
    fab.textContent = "⇄ 切回 IM";
    fab.title = "切回 IM 三合一界面";
    fab.addEventListener("click", () => {
      setViewMode("im");
      location.reload();
    });
    document.body.appendChild(fab);
  }
  function readWidth(key, fallback, min, max) {
    const w = parseInt(prefGet(key, ""), 10);
    return Number.isFinite(w) && w >= min && w <= max ? w : fallback;
  }
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, Math.round(v)));
  }
  function railKey() {
    return `zhihu-im-rail-width:${SKIN_ID}`;
  }
  function listKey() {
    return `zhihu-im-list-width:${SKIN_ID}`;
  }
  function applyRailWidth(w) {
    const cfg = SKINS[SKIN_ID];
    const v = clamp(w, cfg.railMin, cfg.railMax);
    document.documentElement.style.setProperty("--zh-rail", `${v}px`);
    prefSet(railKey(), String(v));
  }
  function applyListWidth(w) {
    const cfg = SKINS[SKIN_ID];
    const v = clamp(w, cfg.listMin, cfg.listMax);
    document.documentElement.style.setProperty("--zh-list", `${v}px`);
    prefSet(listKey(), String(v));
  }
  function syncWidths() {
    const cfg = SKINS[SKIN_ID];
    applyRailWidth(readWidth(railKey(), cfg.railWidth, cfg.railMin, cfg.railMax));
    applyListWidth(readWidth(listKey(), cfg.listWidth, cfg.listMin, cfg.listMax));
  }
  function makeHandle(className, startW, onW) {
    if (document.querySelector(`.${className}`)) return;
    const hd = document.createElement("div");
    hd.className = className;
    hd.addEventListener("mousedown", (e) => {
      e.preventDefault();
      hd.classList.add("dragging");
      document.body.classList.add("zh-col-resizing");
      const startX = e.clientX;
      const base = startW();
      const move = (ev) => onW(base + (ev.clientX - startX));
      const up = () => {
        hd.classList.remove("dragging");
        document.body.classList.remove("zh-col-resizing");
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    });
    document.body.appendChild(hd);
  }
  function ensureRailResizer() {
    const cfg = SKINS[SKIN_ID];
    makeHandle(
      "zh-resizer-rail",
      () => readWidth(railKey(), cfg.railWidth, cfg.railMin, cfg.railMax),
      (w) => applyRailWidth(w)
    );
  }
  function ensureListResizer() {
    const cfg = SKINS[SKIN_ID];
    makeHandle(
      "zh-resizer-list",
      () => readWidth(listKey(), cfg.listWidth, cfg.listMin, cfg.listMax),
      (w) => applyListWidth(w)
    );
  }
  let observer = null;
  let applying = false;
  function makeFavicon() {
    const head = document.head;
    if (!head || applying) return;
    applying = true;
    try {
      const href = FAVICON_URI;
      for (const icon of head.querySelectorAll("link[rel='icon'], link[rel~='icon']")) {
        if (icon.id && icon.id !== FAVICON_ID) icon.removeAttribute("id");
        if (icon.getAttribute("href") !== href) icon.setAttribute("href", href);
      }
      let link = document.getElementById(FAVICON_ID);
      if (!link) {
        link = document.createElement("link");
        link.id = FAVICON_ID;
        link.rel = "icon";
        link.type = "image/x-icon";
        link.setAttribute("href", href);
        head.appendChild(link);
      } else if (link.getAttribute("href") !== href) {
        link.setAttribute("href", href);
      }
      if (!observer) {
        observer = new MutationObserver(() => {
          if (applying) return;
          if (document.getElementById(STYLE_ID)) makeFavicon();
        });
        observer.observe(head, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
      }
    } finally {
      applying = false;
    }
  }
  function ensureDarkModeToggle(host) {
    mountDarkBtn(host);
    setDarkHandler(host, toggleColorTheme);
  }
  function ensureSkinToggle(host) {
    mountSkinBtn(host, (btn) => toggleSkinMenu(btn));
  }
  function ensureModeActions() {
    const barHost = document.querySelector(".zh-titlebar .zh-titlebar-actions");
    const railHost = document.querySelector(".zh-shell .zh-rail-bottom");
    if (SKINS[SKIN_ID].actions === "titlebar" && barHost) {
      ensureDarkModeToggle(barHost);
      ensureSkinToggle(barHost);
    } else if (railHost) {
      ensureDarkModeToggle(railHost);
      ensureSkinToggle(railHost);
    }
  }
  function ensureShell() {
    ensureTitlebar();
    ensureRail();
    ensureModeActions();
    highlightRail();
    syncWidths();
    ensureRailResizer();
    ensureListResizer();
    makeFavicon();
    return true;
  }
  function escapeHtml(s) {
    return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  const PALETTE = [
    "#3370FF",
    "#00B96B",
    "#F7BA1E",
    "#FF5F57",
    "#7356BF",
    "#14C9C9",
    "#FF9F0A",
    "#2DB55D"
  ];
  const MASK_GRID_BLUES = [
    "#0A6FE0",
    "#1A87FF",
    "#2F88FF",
    "#3B92FF",
    "#4B7CFF",
    "#5B8FFF",
    "#6BA0FF",
    "#7CB1FF",
    "#8DC2FF"
  ];
  const SURNAMES = [
    "赵",
    "钱",
    "孙",
    "李",
    "周",
    "吴",
    "郑",
    "王",
    "冯",
    "陈",
    "褚",
    "卫",
    "蒋",
    "沈",
    "韩",
    "杨",
    "朱",
    "秦",
    "尤",
    "许",
    "何",
    "吕",
    "施",
    "张",
    "孔",
    "曹",
    "严",
    "华",
    "金",
    "魏",
    "陶",
    "姜",
    "戚",
    "谢",
    "邹",
    "喻",
    "柏",
    "水",
    "窦",
    "章",
    "云",
    "苏",
    "潘",
    "葛",
    "奚",
    "范",
    "彭",
    "郎",
    "鲁",
    "韦",
    "昌",
    "马",
    "苗",
    "凤",
    "花",
    "方",
    "俞",
    "任",
    "袁",
    "柳",
    "酆",
    "鲍",
    "史",
    "唐",
    "费",
    "廉",
    "岑",
    "薛",
    "雷",
    "贺",
    "倪",
    "汤",
    "滕",
    "殷",
    "罗",
    "毕",
    "郝",
    "邬",
    "安",
    "常",
    "乐",
    "于",
    "时",
    "傅",
    "皮",
    "卞",
    "齐",
    "康",
    "伍",
    "余",
    "元",
    "卜",
    "顾",
    "孟",
    "平",
    "黄",
    "和",
    "穆",
    "萧",
    "尹"
  ];
  const FEISHU_WORK_TITLES = [
    "需求评审",
    "技术方案",
    "接口联调",
    "发版排期",
    "灰度发布",
    "线上告警",
    "架构设计",
    "服务监控",
    "代码审查",
    "版本跟进",
    "性能调优",
    "故障复盘",
    "周会",
    "值班",
    "复盘",
    "站会",
    "大前端",
    "风控组",
    "增长组",
    "运营活动",
    "需求评审会",
    "技术分享会",
    "新人入职群",
    "双十一作战",
    "项目周会通知",
    "APP 发版协调",
    "客服值班通知"
  ];
  function stringSeed(str) {
    let hash = 0;
    const s = String(str || "?");
    for (let i = 0; i < s.length; i++) hash = hash * 31 + s.charCodeAt(i) | 0;
    return Math.abs(hash);
  }
  function avatarLetter(name) {
    const s = String(name || "").trim();
    if (!s) return "?";
    const ch = [...s][0];
    return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
  }
  function surnameForSeed(seed) {
    return SURNAMES[seed % SURNAMES.length];
  }
  function maskWorkTitle(key) {
    const seed = stringSeed(key);
    return FEISHU_WORK_TITLES[seed % FEISHU_WORK_TITLES.length];
  }
  function disguiseFeishuGroupAvatar(seed) {
    const title = FEISHU_WORK_TITLES[seed % FEISHU_WORK_TITLES.length];
    const chars = [...title];
    const color = PALETTE[seed % PALETTE.length];
    const hollow = (seed >>> 3) % 2 === 1;
    const hollowClass = hollow ? " is-hollow" : " is-solid";
    const style = hollow ? `color:${color};border:1.5px solid ${color};` : `background:${color};color:#fff;border:1.5px solid ${color};`;
    let text;
    if (chars.length === 4) {
      const line1 = escapeHtml(chars[0] + chars[1]);
      const line2 = escapeHtml(chars[2] + chars[3]);
      text = `<span class="zh-avatar-text" data-len="4"><span>${line1}</span><span>${line2}</span></span>`;
    } else {
      text = `<span class="zh-avatar-text" data-len="2">${escapeHtml(chars.slice(-2).join(""))}</span>`;
    }
    return `<span class="zh-conv-avatar is-text-avatar${hollowClass}" style="${style}">${text}</span>`;
  }
  function disguiseFeishuSingleAvatar(seed, name) {
    const ch = surnameForSeed(seed) || avatarLetter(name);
    const color = PALETTE[seed % PALETTE.length];
    return `<span class="zh-conv-avatar is-text-avatar is-solid" style="background:${color};color:#fff;"><span class="zh-avatar-text" data-len="1">${escapeHtml(ch)}</span></span>`;
  }
  function disguiseFeishuAvatarHtml(seed, name) {
    if (seed % 10 >= 3) {
      return disguiseFeishuGroupAvatar(seed);
    }
    return disguiseFeishuSingleAvatar(seed, name);
  }
  function disguiseDingtalkGridAvatarHtml(seed) {
    const cells = [];
    for (let i = 0; i < 9; i++) {
      const ch = SURNAMES[(seed + i * 17) % SURNAMES.length];
      const color = MASK_GRID_BLUES[(seed + i) % MASK_GRID_BLUES.length];
      cells.push(`<span style="background:${color}">${escapeHtml(ch)}</span>`);
    }
    return `<span class="zh-conv-avatar is-grid-mask">${cells.join("")}</span>`;
  }
  function disguiseDingtalkSingleAvatarHtml(seed, name) {
    const ch = SURNAMES[seed % SURNAMES.length] || avatarLetter(name);
    const color = PALETTE[seed % PALETTE.length];
    return `<span class="zh-conv-avatar is-text-avatar is-solid" style="background:${color}"><span class="zh-avatar-text" data-len="1">${escapeHtml(ch)}</span></span>`;
  }
  function disguiseDingtalkAvatarHtml(seed, name) {
    if (seed % 2 === 0) {
      return disguiseDingtalkGridAvatarHtml(seed);
    }
    return disguiseDingtalkSingleAvatarHtml(seed, name);
  }
  function disguiseWecomAvatarHtml(seed, name) {
    if (seed % 5 < 2) {
      const cells = [];
      for (let i = 0; i < 9; i++) {
        const ch2 = SURNAMES[(seed + i * 19) % SURNAMES.length];
        const color2 = MASK_GRID_BLUES[(seed + i) % MASK_GRID_BLUES.length];
        cells.push(`<span style="background:${color2}">${escapeHtml(ch2)}</span>`);
      }
      return `<span class="zh-conv-avatar is-grid-mask is-wecom">${cells.join("")}</span>`;
    }
    const ch = SURNAMES[seed % SURNAMES.length] || avatarLetter(name);
    const color = PALETTE[seed % PALETTE.length];
    return `<span class="zh-conv-avatar is-text-avatar is-solid is-wecom" style="background:${color}"><span class="zh-avatar-text" data-len="1">${escapeHtml(ch)}</span></span>`;
  }
  function convAvatarHtml(it, isMask, skinId = SKIN_ID) {
    const seed = stringSeed(it.href || it.title || "");
    const name = it.author || it.title;
    if (isMask) {
      if (skinId === "feishu") {
        return disguiseFeishuAvatarHtml(seed, name);
      }
      if (skinId === "wecom") {
        return disguiseWecomAvatarHtml(seed, name);
      }
      return disguiseDingtalkAvatarHtml(seed, name);
    }
    if (it.avatar) {
      return `<span class="zh-conv-avatar"><img src="${escapeHtml(it.avatar)}" alt="" loading="lazy" onerror="this.remove()"><span class="zh-avatar-text">${escapeHtml(avatarLetter(name))}</span></span>`;
    }
    const color = PALETTE[seed % PALETTE.length];
    return `<span class="zh-conv-avatar is-text-avatar" style="background:${color}"><span class="zh-avatar-text">${escapeHtml(avatarLetter(name))}</span></span>`;
  }
  function msgAvatarHtml(author, realAvatarUrl, isMask) {
    const seed = stringSeed(author || "");
    const ch = isMask ? surnameForSeed(seed) : avatarLetter(author);
    const color = PALETTE[seed % PALETTE.length];
    if (!isMask && realAvatarUrl) {
      return `<span class="zh-msg-avatar" style="background:${color}"><img src="${escapeHtml(realAvatarUrl)}" alt="" loading="lazy" onerror="this.remove()"><span class="zh-avatar-fb">${escapeHtml(ch)}</span></span>`;
    }
    return `<span class="zh-msg-avatar is-text" style="background:${color}">${escapeHtml(ch)}</span>`;
  }
  const ICON_TOP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 19V6M6 11l6-6 6 6"/></svg>';
  const ICON_REFRESH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v6h-6"/></svg>';
  const ICON_NATIVE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 5h5v5M19 5l-7 7M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"/></svg>';
  const VIEW_ID = "zh-chat-view";
  let currentMap = /* @__PURE__ */ new Map();
  let answerObserver = null;
  let loadMoreObserver = null;
  let renderedAnswerNodes = /* @__PURE__ */ new WeakSet();
  let loadingMore = false;
  let loadMoreTimer = null;
  let currentQuestionPage = 1;
  let currentQuestionHref = "";
  let currentFeedsNext = "";
  const seenAnswerKeys = /* @__PURE__ */ new Set();
  async function loadMoreAnswers() {
    var _b, _c, _d;
    if (loadingMore) return;
    loadingMore = true;
    clearTimeout(loadMoreTimer);
    const view = document.getElementById(VIEW_ID);
    const lm = view == null ? void 0 : view.querySelector(".zh-chat-loadmore");
    if (lm) lm.textContent = "正在加载更多回答…";
    const main = document.querySelector(".Question-main, .QuestionPage");
    const mainCol = document.querySelector(".Question-mainColumn");
    if (mainCol) {
      mainCol.scrollTop = mainCol.scrollHeight;
      try {
        mainCol.dispatchEvent(new Event("scroll", { bubbles: true }));
      } catch {
      }
    }
    if (main) {
      main.scrollTop = main.scrollHeight;
      try {
        main.dispatchEvent(new Event("scroll", { bubbles: true }));
      } catch {
      }
    }
    try {
      const se = document.scrollingElement || document.documentElement || document.body;
      se.scrollTop = se.scrollHeight;
      window.scrollTo(0, se.scrollHeight);
      document.dispatchEvent(new Event("scroll"));
    } catch {
    }
    const actions = document.querySelectorAll(
      ".QuestionMainAction, .ViewAll-QuestionMainAction, button.QuestionMainAction, .List-footer button, .Question-moreAnswers button, .Question-mainColumn [class*='more'] button"
    );
    actions.forEach((btn) => {
      const t = (btn.textContent || "").trim();
      if (/更多|全部|下一页/i.test(t)) {
        try {
          btn.click();
        } catch {
        }
      }
    });
    const curHref = currentQuestionHref || location.pathname;
    const qm = curHref.match(/\/question\/(\d+)/);
    if (currentFeedsNext) {
      try {
        let guard = 0;
        while (currentFeedsNext && guard < 3) {
          guard++;
          const res = await fetch(currentFeedsNext, { credentials: "same-origin" });
          if (!res.ok) break;
          const json = await res.json();
          const items = Array.isArray(json == null ? void 0 : json.data) ? json.data : [];
          const paging = (json == null ? void 0 : json.paging) || {};
          currentFeedsNext = paging.is_end ? "" : paging.next || "";
          const chatBody = view == null ? void 0 : view.querySelector(".zh-chat-body");
          let addedCount = 0;
          for (const item of items) {
            const t = item == null ? void 0 : item.target;
            if (!t || t.type !== "answer" || !t.content) continue;
            const holder = document.createElement("div");
            holder.innerHTML = t.content;
            const html = cleanRich(holder);
            const author = (((_b = t.author) == null ? void 0 : _b.name) || "匿名").trim() || "匿名";
            const k = author + "|" + html.slice(0, 60);
            if (seenAnswerKeys.has(k)) continue;
            seenAnswerKeys.add(k);
            const key = `f${t.id}`;
            currentMap.set(key, null);
            const temp = document.createElement("div");
            temp.innerHTML = msgHtml({
              key,
              author,
              avatar: ((_c = t.author) == null ? void 0 : _c.avatar_url) || "",
              badge: ((_d = t.author) == null ? void 0 : _d.headline) || "",
              html,
              votes: t.voteup_count ? String(t.voteup_count) : "",
              comments: t.comment_count ? String(t.comment_count) : "",
              time: formatAnswerTime(t.created_time)
            }, currentMap.size);
            const msgNode = temp.firstElementChild;
            if (msgNode && chatBody) {
              if (lm) chatBody.insertBefore(msgNode, lm);
              else chatBody.appendChild(msgNode);
              addedCount++;
            }
          }
          if (addedCount > 0 || !currentFeedsNext) {
            calibrateLongtexts(view);
            loadingMore = false;
            if (lm) lm.textContent = currentFeedsNext ? "点击加载更多回答…" : "没有更多回答了";
            return;
          }
        }
      } catch {
      }
    }
    if (qm) {
      const qid = qm[1];
      const nextPage = currentQuestionPage + 1;
      const nextUrl = `/question/${qid}?page=${nextPage}`;
      try {
        const data = await fetchAndParseChat(nextUrl);
        if (data && Array.isArray(data.answers) && data.answers.length > 0) {
          let addedCount = 0;
          const chatBody = view == null ? void 0 : view.querySelector(".zh-chat-body");
          data.answers.forEach((ans) => {
            const k = ans.author + "|" + (ans.html || "").slice(0, 60);
            if (!seenAnswerKeys.has(k)) {
              seenAnswerKeys.add(k);
              currentMap.set(`p${nextPage}_${ans.key}`, null);
              const temp = document.createElement("div");
              temp.innerHTML = msgHtml(ans, currentMap.size);
              const msgNode = temp.firstElementChild;
              if (msgNode) {
                if (lm) chatBody.insertBefore(msgNode, lm);
                else chatBody.appendChild(msgNode);
                addedCount++;
              }
            }
          });
          if (addedCount > 0) {
            currentQuestionPage = nextPage;
            calibrateLongtexts(view);
            loadingMore = false;
            if (lm) lm.textContent = "点击加载更多回答…";
            return;
          }
        }
      } catch {
      }
    }
    loadMoreTimer = setTimeout(() => {
      loadingMore = false;
      if (lm && lm.textContent.includes("正在")) {
        lm.textContent = "点击加载更多回答…";
      }
    }, 1e3);
  }
  function onBodyScroll(e) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= 500) {
      loadMoreAnswers();
    }
  }
  function observeLoadMore(view) {
    loadMoreObserver == null ? void 0 : loadMoreObserver.disconnect();
    loadMoreObserver = null;
    const target = view.querySelector(".zh-chat-loadmore");
    const root = view.querySelector(".zh-chat-body");
    if (!target || !root) return;
    loadMoreObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          loadMoreAnswers();
        }
      }
    }, { root, rootMargin: "250px" });
    loadMoreObserver.observe(target);
  }
  function observeAnswers(view) {
    answerObserver == null ? void 0 : answerObserver.disconnect();
    answerObserver = null;
    const root = document.querySelector(".Question-mainColumn") || document.querySelector(".Question-main, .QuestionPage");
    if (!root) return;
    const listContainer = root.querySelector(".Question-mainColumn") || root;
    currentMap.forEach((el) => {
      if (el) renderedAnswerNodes.add(el);
    });
    answerObserver = new MutationObserver(() => {
      var _a, _b, _c, _d, _e, _f;
      const chatBody = view.querySelector(".zh-chat-body");
      const loadmore = view.querySelector(".zh-chat-loadmore");
      if (!chatBody) return;
      let addedAny = false;
      const answerEls = listContainer.querySelectorAll(".AnswerItem");
      answerEls.forEach((el) => {
        if (renderedAnswerNodes.has(el)) return;
        renderedAnswerNodes.add(el);
        const key = `a${currentMap.size}`;
        const ans = extractSingleAnswer(el, key);
        if (!ans) return;
        currentMap.set(key, el);
        const temp = document.createElement("div");
        temp.innerHTML = msgHtml(ans, currentMap.size);
        const msgNode = temp.firstElementChild;
        if (msgNode) {
          if (loadmore) {
            chatBody.insertBefore(msgNode, loadmore);
          } else {
            chatBody.appendChild(msgNode);
          }
          addedAny = true;
        }
      });
      if (addedAny) {
        calibrateLongtexts(view);
        const totalMatch = ((_c = (_b = (_a = listContainer.querySelector(".ViewAll-QuestionMainAction")) == null ? void 0 : _a.innerText) == null ? void 0 : _b.match(/([\d,]+)\s*个回答/)) == null ? void 0 : _c[1]) || ((_f = (_e = (_d = listContainer.querySelector(".List-headerText")) == null ? void 0 : _d.innerText) == null ? void 0 : _e.match(/(\d+)/)) == null ? void 0 : _f[1]);
        const count = totalMatch || String(currentMap.size);
        const sub = view.querySelector(".zh-chat-sub");
        if (sub) {
          const topic = sub.dataset.topic || "";
          sub.textContent = topic ? `${topic} · ${count} 条回复` : `${count} 条回复`;
        }
        if (loadmore) loadmore.textContent = "点击加载更多回答…";
        observeLoadMore(view);
      }
    });
    answerObserver.observe(listContainer, { childList: true, subtree: true });
  }
  function isLong(html) {
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, "").length >= 60;
  }
  function calibrateLongtexts(view) {
    requestAnimationFrame(() => {
      view.querySelectorAll(".zh-longtext").forEach((el) => {
        if (el.scrollHeight <= el.clientHeight) el.classList.remove("zh-longtext");
      });
    });
  }
  function msgHtml(a, index) {
    const avatarHtml = msgAvatarHtml(a.author, a.avatar, isMaskAvatar());
    const long = isLong(a.html);
    const floor = Number(index) > 0 ? `#${index}` : "";
    const time = a.time ? escapeHtml(a.time) : "";
    const meta = [floor, time].filter(Boolean).join(" · ");
    const tools = `<div class="zh-msg-tools">
    <button type="button" class="zh-msg-tool${a.voted ? " voted" : ""}" data-act="up" title="赞同${a.votes ? ` · ${a.votes}` : ""}">${ICONS.up}</button>
    <button type="button" class="zh-msg-tool" data-act="comment" title="评论${a.comments ? ` · ${a.comments} 条` : ""}">${ICONS.comment}</button>
  </div>`;
    return `<div class="zh-msg zh-msg-other" data-key="${a.key}">
    ${avatarHtml}
    <div class="zh-msg-content">
      <span class="zh-msg-name">${escapeHtml(a.author || "匿名")}${a.badge ? `<i class="zh-msg-badge">${escapeHtml(a.badge)}</i>` : ""}</span>
      <div class="zh-msg-bubble"${long ? ' title="点击展开全部"' : ""}>
        <div class="zh-msg-body${long ? " zh-longtext" : ""}">${a.html}</div>
      </div>
      ${meta ? `<span class="zh-msg-meta">${meta}</span>` : ""}
      ${tools}
    </div>
  </div>`;
  }
  function headerHtml(name, sub, avatarInner, topic = "", viewQuestionBtn = "") {
    return `
    <header class="zh-chat-header">
      <div class="zh-chat-head-main">
        <span class="zh-chat-avatar">${avatarInner}</span>
        <div class="zh-chat-titles">
          <div class="zh-chat-title-row">
            <span class="zh-chat-title">${escapeHtml(name || "知乎")}</span>
          </div>
          <div class="zh-chat-sub" data-topic="${escapeHtml(topic)}">${sub}</div>
        </div>
      </div>
      <div class="zh-chat-actions">
        ${viewQuestionBtn}
        <button type="button" class="zh-icon-btn" data-act="top" title="回到顶部">${ICON_TOP}</button>
        <button type="button" class="zh-icon-btn" data-act="refresh" title="刷新">${ICON_REFRESH}</button>
        <button type="button" class="zh-icon-btn" data-act="native" title="切换原生视图">${ICON_NATIVE}</button>
      </div>
    </header>
    <nav class="zh-chat-tabs" style="display:none"></nav>`;
  }
  function letterAvatar(title) {
    const ch = (title || "知").trim().slice(0, 1) || "知";
    return `<span class="zh-chat-letter">${escapeHtml(ch)}</span>`;
  }
  function renderChatLoading(view, titleHint = "") {
    const who = maskWorkTitle(location.pathname);
    const title = titleHint || "正在加载…";
    const sub = `${escapeHtml(title)} · 正在加载消息…`;
    const avatarInner = letterAvatar(who);
    view.dataset.sig = "loading:" + location.pathname;
    delete view.dataset.idle;
    view.innerHTML = `
    ${headerHtml(who, sub, avatarInner, title)}
    <div class="zh-chat-body">
      <div class="zh-chat-loading">
        <div class="zh-chat-spinner"></div>
        <div>正在加载消息…</div>
      </div>
    </div>`;
  }
  function renderChatData(view, data, sig) {
    currentMap = data.map || /* @__PURE__ */ new Map();
    renderedAnswerNodes = /* @__PURE__ */ new WeakSet();
    currentMap.forEach((el) => {
      if (el) renderedAnswerNodes.add(el);
    });
    view.dataset.sig = sig;
    delete view.dataset.idle;
    currentQuestionPage = 1;
    currentQuestionHref = sig || location.pathname;
    currentFeedsNext = data.feedsNext || "";
    seenAnswerKeys.clear();
    if (Array.isArray(data.answers)) {
      data.answers.forEach((a) => {
        seenAnswerKeys.add(a.author + "|" + (a.html || "").slice(0, 60));
      });
    }
    const curPath = location.pathname;
    const isSingleAnswer = /\/question\/\d+\/answer\/\d+/.test(curPath);
    const qidMatch = curPath.match(/\/question\/(\d+)/);
    const qid = qidMatch ? qidMatch[1] : "";
    const countLabel = data.kind === "question" ? `${data.total || String(data.answers.length) || "…"} 条回复` : data.kind === "article" ? "专栏文章" : "精彩视频";
    const who = maskWorkTitle(location.pathname);
    const sub = isSingleAnswer ? `${escapeHtml(data.title || "")} · 精选回答 (${escapeHtml(countLabel)})` : `${escapeHtml(data.title || "")} · ${escapeHtml(countLabel)}`;
    const viewQuestionBtn = isSingleAnswer && qid ? `<button type="button" class="zh-view-question-btn" data-act="view-question" data-qid="${qid}" title="查看该问题的完整回答讨论">查看全部回答 ›</button>` : "";
    const singleTipHtml = isSingleAnswer && qid ? `<div class="zh-single-answer-tip">
        <span>当前展示精选单条回答</span>
        <button type="button" class="zh-more-link" data-act="view-question" data-qid="${qid}">查看全部 ${escapeHtml(countLabel)} ›</button>
       </div>` : "";
    const loadmoreHtml = !isSingleAnswer && data.kind === "question" ? `<div class="zh-chat-loadmore" role="button">点击加载更多回答…</div>` : "";
    const avatarInner = letterAvatar(who);
    view.innerHTML = `
    ${headerHtml(who, sub, avatarInner, data.title || "", viewQuestionBtn)}
    <div class="zh-chat-body">
      ${data.desc ? `<div class="zh-chat-desc-card">${escapeHtml(data.desc)}</div>` : ""}
      ${data.answers.map((a, i) => msgHtml(a, i + 1)).join("")}
      ${singleTipHtml}
      ${loadmoreHtml}
    </div>`;
    const body = view.querySelector(".zh-chat-body");
    if (body) {
      body.addEventListener("scroll", onBodyScroll, { passive: true });
    }
    if (!isSingleAnswer && data.kind === "question") {
      observeAnswers(view);
      observeLoadMore(view);
    }
    calibrateLongtexts(view);
  }
  function ensureChatView() {
    const sig = location.pathname + location.search;
    let view = document.getElementById(VIEW_ID);
    if (view && view.dataset.sig === sig) return true;
    if (!view) {
      view = document.createElement("div");
      view.id = VIEW_ID;
      view.className = "zh-chat-view";
      view.addEventListener("click", onAct);
      document.body.appendChild(view);
    }
    const domData = extractChat();
    if (domData && domData.answers.length > 0) {
      renderChatData(view, domData, sig);
      return true;
    }
    renderChatLoading(view);
    setTimeout(() => {
      if (location.pathname + location.search === sig) {
        const retry = extractChat();
        if (retry && retry.answers.length > 0) {
          renderChatData(view, retry, sig);
        }
      }
    }, 600);
    return false;
  }
  async function loadDetailInPlace(href, titleHint = "") {
    let view = document.getElementById(VIEW_ID);
    if (!view) {
      view = document.createElement("div");
      view.id = VIEW_ID;
      view.className = "zh-chat-view";
      view.addEventListener("click", onAct);
      document.body.appendChild(view);
    }
    try {
      history.pushState({}, "", href);
    } catch {
    }
    removeChatEmpty();
    document.documentElement.setAttribute("data-zh-route", "detail");
    document.documentElement.setAttribute("data-zh-chat", "parsed");
    renderChatLoading(view, titleHint);
    const data = await fetchAndParseChat(href);
    if (data && data.answers.length > 0) {
      renderChatData(view, data, href);
      return true;
    }
    location.href = href;
    return false;
  }
  function onAct(e) {
    var _a, _b, _c, _d;
    const viewQBtn = e.target.closest("[data-act='view-question']");
    if (viewQBtn) {
      e.preventDefault();
      const qid = viewQBtn.dataset.qid || (location.pathname.match(/\/question\/(\d+)/) || [])[1];
      if (qid) {
        const titleHint = ((_a = document.querySelector(".zh-chat-sub")) == null ? void 0 : _a.dataset.topic) || "";
        loadDetailInPlace(`/question/${qid}`, titleHint);
      }
      return;
    }
    const act = (_b = e.target.closest("[data-act]")) == null ? void 0 : _b.dataset.act;
    if (act === "top") {
      e.preventDefault();
      (_c = document.querySelector(".zh-chat-body")) == null ? void 0 : _c.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (act === "refresh") {
      e.preventDefault();
      location.reload();
      return;
    }
    if (act === "native") {
      e.preventDefault();
      setViewMode("native");
      location.reload();
      return;
    }
    const loadmore = e.target.closest(".zh-chat-loadmore");
    if (loadmore) {
      e.preventDefault();
      loadMoreAnswers();
      return;
    }
    const longtext = e.target.closest(".zh-longtext");
    if (longtext) {
      longtext.classList.toggle("is-open");
      return;
    }
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const msg = btn.closest(".zh-msg");
    const origin = currentMap.get(msg == null ? void 0 : msg.dataset.key);
    if (!origin) return;
    if (btn.dataset.act === "up") {
      (_d = origin.querySelector(".VoteButton--up")) == null ? void 0 : _d.click();
      btn.classList.toggle("voted");
    } else {
      const cbtn = [...origin.querySelectorAll(".ContentItem-actions button")].find(
        (b) => /条评论|添加评论|评论/.test(b.textContent || "")
      );
      cbtn == null ? void 0 : cbtn.click();
    }
  }
  function removeChatView() {
    var _a;
    answerObserver == null ? void 0 : answerObserver.disconnect();
    answerObserver = null;
    loadMoreObserver == null ? void 0 : loadMoreObserver.disconnect();
    loadMoreObserver = null;
    renderedAnswerNodes = /* @__PURE__ */ new WeakSet();
    clearTimeout(loadMoreTimer);
    (_a = document.getElementById(VIEW_ID)) == null ? void 0 : _a.remove();
    currentMap = /* @__PURE__ */ new Map();
    currentFeedsNext = "";
  }
  function ensureChatEmpty() {
    let view = document.getElementById(VIEW_ID);
    if (view) {
      if (view.dataset.idle === "1") return view;
      answerObserver == null ? void 0 : answerObserver.disconnect();
      answerObserver = null;
      renderedAnswerNodes = /* @__PURE__ */ new WeakSet();
      clearTimeout(loadMoreTimer);
      currentMap = /* @__PURE__ */ new Map();
      currentFeedsNext = "";
      view.dataset.idle = "1";
      delete view.dataset.sig;
      view.innerHTML = `
      ${headerHtml("知乎", "选择一个会话", letterAvatar("知"))}
      <div class="zh-chat-body">
        <div class="zh-chat-idle">从左侧列表打开一个话题</div>
      </div>`;
      return view;
    }
    view = document.createElement("div");
    view.id = VIEW_ID;
    view.className = "zh-chat-view";
    view.dataset.idle = "1";
    view.addEventListener("click", onAct);
    view.innerHTML = `
    ${headerHtml("知乎", "选择一个会话", letterAvatar("知"))}
    <div class="zh-chat-body">
      <div class="zh-chat-idle">从左侧列表打开一个话题</div>
    </div>`;
    document.body.appendChild(view);
    return view;
  }
  function removeChatEmpty() {
    const idle = document.getElementById(VIEW_ID);
    if ((idle == null ? void 0 : idle.dataset.idle) === "1") {
      idle.remove();
    }
  }
  const feedSubscribers = /* @__PURE__ */ new Set();
  function onFeedReceived(fn) {
    feedSubscribers.add(fn);
    return () => feedSubscribers.delete(fn);
  }
  function parseFeedItemFromApi(raw) {
    var _a, _b, _c, _d, _e;
    const t = raw == null ? void 0 : raw.target;
    if (!t) return null;
    const isAnswer = t.type === "answer";
    const isArticle = t.type === "article";
    const isVideo = t.type === "zvideo";
    const isPin = t.type === "pin";
    let href = "";
    let title = "";
    let type = "question";
    if (isAnswer) {
      type = "question";
      title = ((_a = t.question) == null ? void 0 : _a.title) || "";
      const qid = (_b = t.question) == null ? void 0 : _b.id;
      const aid = t.id;
      href = qid && aid ? `/question/${qid}/answer/${aid}` : qid ? `/question/${qid}` : "";
    } else if (isArticle) {
      type = "article";
      title = t.title || "";
      href = t.id ? `/p/${t.id}` : "";
    } else if (isVideo) {
      type = "video";
      title = t.title || "";
      href = t.id ? `/zvideo/${t.id}` : "";
    } else if (isPin) {
      type = "pin";
      title = t.excerpt_title || t.content || "知乎想法";
      href = t.id ? `/pin/${t.id}` : "";
    } else {
      type = t.type || "question";
      title = ((_c = t.question) == null ? void 0 : _c.title) || t.title || "";
      href = t.url ? normalizeDetailHref(new URL(t.url, location.origin).pathname) : "";
    }
    if (!href || !title) return null;
    const author = ((_d = t.author) == null ? void 0 : _d.name) || "";
    const avatar = ((_e = t.author) == null ? void 0 : _e.avatar_url) || "";
    const rawExcerpt = (t.excerpt || t.excerpt_new || "").replace(/<[^>]+>/g, "").trim();
    const summary = author && rawExcerpt ? `${author}: ${rawExcerpt}` : rawExcerpt || "知乎精选讨论 · 点击阅读详情";
    const votes = t.voteup_count ? `${t.voteup_count} 赞同` : "";
    return {
      href,
      type: contentTypeFromHref(href) || type,
      title,
      author,
      avatar,
      summary,
      votes,
      time: "刚刚"
    };
  }
  function parseHotItemFromInitialData(item, index) {
    var _a, _b, _c, _d, _e;
    const t = item == null ? void 0 : item.target;
    if (!t) return null;
    const title = (((_a = t.titleArea) == null ? void 0 : _a.text) || "").trim();
    const rawUrl = ((_b = t.link) == null ? void 0 : _b.url) || "";
    if (!title || !rawUrl) return null;
    const href = new URL(rawUrl, location.origin).pathname;
    const rank = String(index + 1);
    const rawHeat = (((_c = t.metricsArea) == null ? void 0 : _c.text) || "").trim();
    const heat = rawHeat.replace(/万?热度|\s*分享/g, "").trim();
    const num = Number(rank);
    const time = num <= 3 ? "刚刚" : num <= 10 ? "10分钟前" : num <= 20 ? "30分钟前" : "1小时前";
    return {
      href,
      type: "hot",
      title,
      author: `No.${rank} 热榜`,
      avatar: "",
      summary: heat ? `[热度 ${heat}万] ${(((_d = t.excerptArea) == null ? void 0 : _d.text) || "").slice(0, 60)}` : ((_e = t.excerptArea) == null ? void 0 : _e.text) || "知乎全站实时热议中",
      votes: heat ? `${heat}万热度` : "",
      time
    };
  }
  function getInitialData() {
    try {
      const el = document.getElementById("js-initialData");
      if (!el || !el.textContent) return null;
      return JSON.parse(el.textContent);
    } catch {
      return null;
    }
  }
  function getInitialHotList() {
    var _a, _b;
    const data = getInitialData();
    const list = (_b = (_a = data == null ? void 0 : data.initialState) == null ? void 0 : _a.topstory) == null ? void 0 : _b.hotList;
    if (Array.isArray(list) && list.length) {
      return list.map(parseHotItemFromInitialData).filter(Boolean);
    }
    return [];
  }
  function installFeedCapture() {
    var _a;
    const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    if (win._zhFeedCaptureInstalled) return;
    win._zhFeedCaptureInstalled = true;
    const isRecommendUrl = (url) => String(url || "").includes("/api/v3/feed/topstory/recommend") || String(url || "").includes("/api/v3/feed/timeline/recommend");
    const notify = (url, json) => {
      try {
        if (Array.isArray(json == null ? void 0 : json.data) && json.data.length) {
          const items = json.data.map(parseFeedItemFromApi).filter(Boolean);
          if (items.length) {
            const isAppend = url.includes("after_id=") || url.includes("page_number=") && !url.includes("page_number=1");
            if (!isAppend) recommendFirstUrl = url;
            feedSubscribers.forEach((fn) => {
              try {
                fn(items, isAppend);
              } catch {
              }
            });
          }
        }
      } catch {
      }
    };
    const rawFetch = win.fetch;
    if (typeof rawFetch === "function") {
      win.fetch = function(input) {
        const url = typeof input === "string" ? input : (input == null ? void 0 : input.url) || "";
        const p = rawFetch.apply(this, arguments);
        if (isRecommendUrl(url) && p && typeof p.then === "function") {
          p.then((res) => {
            try {
              res.clone().json().then((json) => notify(url, json)).catch(() => {
              });
            } catch {
            }
          }).catch(() => {
          });
        }
        return p;
      };
    }
    try {
      const proto = (_a = win.XMLHttpRequest) == null ? void 0 : _a.prototype;
      if (proto) {
        const origOpen = proto.open;
        const origSend = proto.send;
        proto.open = function(_method, url) {
          this.__zhReqUrl = String(url || "");
          return origOpen.apply(this, arguments);
        };
        proto.send = function() {
          const url = this.__zhReqUrl || "";
          if (isRecommendUrl(url)) {
            this.addEventListener("load", () => {
              try {
                const data = typeof this.response === "string" ? JSON.parse(this.response) : this.response;
                notify(url, data);
              } catch {
              }
            });
          }
          return origSend.apply(this, arguments);
        };
      }
    } catch {
    }
  }
  const PANEL_ID = "zh-list-panel";
  const seen = /* @__PURE__ */ new Set();
  const seenTitles = /* @__PURE__ */ new Set();
  let allSessions = [];
  let apiRecommendItems = [];
  let recommendFirstUrl = "";
  function autoFillRecommendPages() {
    if (!recommendFirstUrl || location.pathname !== "/") return;
    const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    const pageFetch = typeof win.fetch === "function" ? win.fetch.bind(win) : null;
    if (!pageFetch) return;
    for (const p of [2, 3]) {
      const url = /page_number=\d+/.test(recommendFirstUrl) ? recommendFirstUrl.replace(/page_number=\d+/, `page_number=${p}`) : recommendFirstUrl + (recommendFirstUrl.includes("?") ? "&" : "?") + `page_number=${p}`;
      try {
        pageFetch(url, { credentials: "include" }).catch(() => {
        });
      } catch {
      }
    }
  }
  function itemUniqueKey(it) {
    if (!it) return "";
    const href = it.href || "";
    const qam = href.match(/\/question\/(\d+)\/answer\/(\d+)/);
    if (qam) return `qa:${qam[1]}:${qam[2]}`;
    const qm = href.match(/\/question\/(\d+)/);
    if (qm) return `q:${qm[1]}`;
    const pm = href.match(/\/p\/(\d+)/);
    if (pm) return `p:${pm[1]}`;
    const vm = href.match(/\/zvideo\/(\d+)/);
    if (vm) return `v:${vm[1]}`;
    const pinm = href.match(/\/pin\/(\d+)/);
    if (pinm) return `pin:${pinm[1]}`;
    const cleanTitle = (it.title || "").replace(/[\s\p{P}]+/gu, "").trim();
    return cleanTitle ? `t:${cleanTitle}` : href;
  }
  function cleanTitleOf(it) {
    return ((it == null ? void 0 : it.title) || "").replace(/[\s\p{P}]+/gu, "").trim();
  }
  function isDuplicate(it) {
    if (!it) return true;
    const key = itemUniqueKey(it);
    const title = cleanTitleOf(it);
    if (seen.has(key)) return true;
    if (title && seenTitles.has(title)) return true;
    return false;
  }
  function markSeen(it) {
    if (!it) return;
    const key = itemUniqueKey(it);
    const title = cleanTitleOf(it);
    if (key) seen.add(key);
    if (title) seenTitles.add(title);
  }
  function clearSeen() {
    seen.clear();
    seenTitles.clear();
  }
  onFeedReceived((items, isAppend) => {
    const cur = location.pathname;
    if (cur === "/hot" || cur.startsWith("/hot/")) return;
    const box = document.getElementById(PANEL_ID);
    if (!box) return;
    if (isAppend) {
      items.forEach((it) => insertRow(it));
    } else {
      apiRecommendItems = items;
      clearSeen();
      allSessions = [];
      let rows = "";
      items.forEach((it) => {
        if (!isDuplicate(it)) {
          markSeen(it);
          allSessions.push(it);
          rows += sessionHtml(it);
        }
      });
      box.innerHTML = listHeader() + (rows || `<div class="zh-session-empty">暂无推荐内容</div>`);
      syncListHead();
      syncListActive();
      autoFillRecommendPages();
    }
  });
  function cssEscape(s) {
    return (s || "").replace(/["'\\]/g, "\\$&");
  }
  function markRead(href) {
    if (!href || isRead(href)) return;
    markRead$1(href);
    document.querySelectorAll(`.zh-conv[href="${cssEscape(href)}"]`).forEach((n) => {
      var _a;
      n.classList.add("is-read");
      (_a = n.querySelector(".zh-conv-badge")) == null ? void 0 : _a.remove();
    });
    syncListHead();
  }
  const TYPE_TAG = {
    question: "问答",
    article: "专栏",
    video: "视频",
    pin: "想法",
    hot: "热榜",
    work: "工作"
  };
  function TagOf(type) {
    const t = TYPE_TAG[type];
    return t ? `<i class="zh-conv-tag" data-t="${t}">${t}</i>` : "";
  }
  function sessionHtml(it) {
    const curHref = location.pathname;
    const active = it.href === curHref ? " active" : "";
    const read = isRead(it.href) ? " is-read" : "";
    const tip = it.votes ? ` · ${it.votes}` : "";
    const showBadge = !isRead(it.href) && !active && it.type !== "work";
    return `<a class="zh-conv${read}${active}" href="${escapeHtml(it.href)}" data-href="${escapeHtml(it.href)}" title="${escapeHtml(it.title + tip)}">
    ${convAvatarHtml(it, isMaskAvatar())}
    <span class="zh-conv-info">
      <span class="zh-conv-top">
        <span class="zh-conv-name">${escapeHtml(maskWorkTitle(itemUniqueKey(it)))}</span>
        <span class="zh-conv-time">${escapeHtml(it.time || "刚刚")}</span>
      </span>
      <span class="zh-conv-bottom">
        <span class="zh-conv-msg">${escapeHtml(it.title || it.summary || "点击查看详情")}</span>
        ${TagOf(it.type)}
      </span>
    </span>
    ${showBadge ? `<span class="zh-conv-badge"></span>` : ""}
  </a>`;
  }
  function listHeader() {
    const cur = location.pathname;
    const isMask = isMaskAvatar();
    const searchQ = cur.startsWith("/search") ? new URLSearchParams(location.search).get("q") || "" : "";
    return `
    <div class="zh-list-header">
      <div class="zh-list-head-top">
        <div class="zh-list-search">
          ${ICONS.search}
          <input type="search" class="zh-search-input" placeholder="搜索消息…" value="${escapeHtml(searchQ)}" autocomplete="off" />
        </div>
        <button type="button" class="zh-mask-toggle${isMask ? " is-on" : ""}" title="伪装头像：${isMask ? "已开启（默认）" : "已关闭"}">${ICONS.disguise}</button>
      </div>
      <div class="zh-list-chips">
        ${FEED_VIEWS.map(
      (v) => `<button type="button" class="zh-chip${cur === v.path ? " active" : ""}" data-path="${v.path}">${v.label}</button>`
    ).join("")}
        <button type="button" class="zh-chip-refresh" title="换一批 / 刷新内容">${ICONS.refresh}</button>
      </div>
    </div>`;
  }
  function syncListActive(targetHref) {
    const cur = targetHref || location.pathname;
    const box = document.getElementById(PANEL_ID);
    if (!box) return;
    const targetKey = itemUniqueKey({ href: cur });
    let found = false;
    box.querySelectorAll(".zh-conv").forEach((n) => {
      var _a;
      const itemHref = n.dataset.href || "";
      const on = itemHref === cur || targetKey && itemUniqueKey({ href: itemHref }) === targetKey;
      n.classList.toggle("active", on);
      if (on) {
        found = true;
        n.classList.add("is-read");
        (_a = n.querySelector(".zh-conv-badge")) == null ? void 0 : _a.remove();
      }
    });
    if (!found && (cur.startsWith("/question/") || cur.startsWith("/p/"))) {
      const title = detailTitleFromDom();
      if (title) {
        const topItem = {
          href: cur,
          type: cur.startsWith("/p/") ? "article" : "question",
          title,
          author: "当前阅读",
          time: "刚刚",
          summary: "知乎精选讨论 · 正在阅读",
          votes: ""
        };
        prependSession(topItem);
      }
    }
  }
  function prependSession(it) {
    if (!it || isDuplicate(it)) return;
    markSeen(it);
    allSessions.unshift(it);
    const box = document.getElementById(PANEL_ID);
    if (!box) return;
    const head = box.querySelector(".zh-list-header");
    const temp = document.createElement("div");
    temp.innerHTML = sessionHtml(it);
    const node = temp.firstElementChild;
    if (node) {
      if (head && head.nextSibling) {
        box.insertBefore(node, head.nextSibling);
      } else {
        box.appendChild(node);
      }
    }
    syncListHead();
  }
  function syncListHead() {
    const box = document.getElementById(PANEL_ID);
    if (!box) return;
    const unread = box.querySelectorAll(".zh-conv:not(.is-read)").length;
    const sub = document.querySelector(".zh-chat-sub[data-zh-unread]");
    if (sub && !sub.textContent.includes("回答")) {
      sub.textContent = unread ? `${unread} 条未读` : "";
    }
  }
  function insertRow(it) {
    var _a;
    if (!it || isDuplicate(it)) return;
    markSeen(it);
    allSessions.push(it);
    const box = document.getElementById(PANEL_ID);
    if (!box) return;
    (_a = box.querySelector(".zh-session-empty")) == null ? void 0 : _a.remove();
    box.insertAdjacentHTML("beforeend", sessionHtml(it));
    syncListHead();
  }
  function renderAll() {
    const box = document.getElementById(PANEL_ID);
    if (!box) return;
    clearSeen();
    allSessions = [];
    let rows = "";
    let n = 0;
    const cur = location.pathname;
    const isHot = cur === "/hot" || cur.startsWith("/hot/");
    if (isHot) {
      const hotList = getInitialHotList();
      if (hotList.length) {
        hotList.forEach((it) => {
          if (!isDuplicate(it)) {
            markSeen(it);
            allSessions.push(it);
            rows += sessionHtml(it);
            n++;
          }
        });
      }
    }
    if (!n && !isHot && cur === "/" && apiRecommendItems.length) {
      apiRecommendItems.forEach((it) => {
        if (!isDuplicate(it)) {
          markSeen(it);
          allSessions.push(it);
          rows += sessionHtml(it);
          n++;
        }
      });
    }
    if (!n) {
      const root = feedRoot();
      const cards = feedCards();
      if (cards.length) {
        cards.forEach((card) => {
          const it = extractCard(card);
          if (it && !isDuplicate(it)) {
            markSeen(it);
            allSessions.push(it);
            rows += sessionHtml(it);
            n++;
          }
        });
        neutralizeVideos(root);
      }
    }
    if (!n && !isSearchPath(cur)) {
      const recents = getRecents();
      const curTitle = detailTitleFromDom();
      if ((cur.startsWith("/question/") || cur.startsWith("/p/")) && curTitle) {
        const curItem = {
          href: cur,
          type: cur.startsWith("/p/") ? "article" : "question",
          title: curTitle,
          author: "当前阅读",
          time: "刚刚",
          summary: "知乎精选讨论 · 正在阅读",
          votes: ""
        };
        markSeen(curItem);
        allSessions.push(curItem);
        rows += sessionHtml(curItem);
        n++;
      }
      const combined = recents.map((r) => ({
        href: r.href,
        type: r.href.includes("/p/") ? "article" : "question",
        title: r.title,
        author: "知乎用户",
        time: "今天",
        summary: "知乎讨论 · 点击阅读",
        votes: ""
      }));
      combined.forEach((it) => {
        if (it && !isDuplicate(it)) {
          markSeen(it);
          allSessions.push(it);
          rows += sessionHtml(it);
          n++;
        }
      });
    }
    const emptyText = isSearchPath(cur) ? "正在加载搜索结果…" : "正在加载推荐…<br/><span>向下滚动或点击刷新拉取新内容</span>";
    box.innerHTML = listHeader() + (n ? rows : `<div class="zh-session-empty">${emptyText}</div>`);
    syncListHead();
    syncListActive();
  }
  let feedScrolling = false;
  let feedScrollTimer = null;
  function triggerFeedScroll() {
    if (feedScrolling) return;
    feedScrolling = true;
    clearTimeout(feedScrollTimer);
    feedScrollTimer = setTimeout(() => {
      feedScrolling = false;
    }, 600);
    const root = feedRoot();
    if (root) {
      root.scrollTop = Math.max(root.scrollTop + 600, root.scrollHeight);
      try {
        root.dispatchEvent(new Event("scroll", { bubbles: true }));
      } catch {
      }
    }
    try {
      const se = document.scrollingElement || document.documentElement || document.body;
      se.scrollTop = Math.max(se.scrollTop + 600, se.scrollHeight);
      document.dispatchEvent(new Event("scroll"));
    } catch {
    }
    const loadMoreBtn = document.querySelectorAll(
      ".List-footer button, .Topstory-more button, .Button--plain"
    );
    loadMoreBtn.forEach((btn) => {
      const text = (btn.textContent || "").trim();
      if (/更多|加载|下一页/i.test(text)) {
        try {
          btn.click();
        } catch {
        }
      }
    });
  }
  function lazySyncScroll() {
    const box = document.getElementById(PANEL_ID);
    if (!box) return;
    if (box.scrollHeight - box.scrollTop - box.clientHeight <= 400) {
      triggerFeedScroll();
    }
  }
  let refreshingFeed = false;
  function triggerNativeFeedRefresh(btn) {
    if (refreshingFeed) return;
    refreshingFeed = true;
    if (btn) btn.classList.add("spinning");
    const cur = location.pathname;
    if (cur.startsWith("/question/") || cur.startsWith("/p/") || cur.startsWith("/zvideo/") || cur.startsWith("/pin/")) {
      location.href = "/";
      return;
    }
    const isHot = cur === "/hot" || cur.startsWith("/hot/");
    const isFollow = cur === "/follow" || cur.startsWith("/follow/");
    const tabText = isHot ? "热榜" : isFollow ? "关注" : "推荐";
    const root = feedRoot();
    if (root) {
      root.scrollTop = 0;
      try {
        root.dispatchEvent(new Event("scroll", { bubbles: true }));
      } catch {
      }
    }
    try {
      window.scrollTo(0, 0);
      document.dispatchEvent(new Event("scroll"));
    } catch {
    }
    const tabs = document.querySelectorAll(".TopstoryTabs-link, a.TopstoryTabs-link, .TopstoryTabs a");
    const targetTab = [...tabs].find((a) => (a.textContent || "").includes(tabText));
    if (targetTab) {
      try {
        targetTab.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      } catch {
      }
    }
    const refreshBanner = document.querySelector(
      ".Topstory-refreshBanner, .Topstory-refresh, [class*='refreshBanner'], [class*='RefreshBanner'], button[aria-label*='刷新']"
    );
    if (refreshBanner) {
      try {
        refreshBanner.click();
      } catch {
      }
    }
    setTimeout(() => {
      triggerFeedScroll();
      setTimeout(() => {
        refreshingFeed = false;
        if (btn) btn.classList.remove("spinning");
        renderAll();
      }, 500);
    }, 300);
  }
  function bindPullToRefresh(box) {
    if (box.dataset.pullBound) return;
    box.dataset.pullBound = "1";
    let bar = box.querySelector(".zh-pull-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "zh-pull-bar";
      bar.innerHTML = `
      <div class="zh-pull-content">
        <span class="zh-pull-icon">${ICONS.refresh}</span>
        <span class="zh-pull-text">下拉获取最新推荐…</span>
      </div>`;
      const head = box.querySelector(".zh-list-header");
      if (head && head.nextSibling) {
        box.insertBefore(bar, head.nextSibling);
      } else {
        box.appendChild(bar);
      }
    }
    let startY = 0;
    let pulling = false;
    let distance = 0;
    const THRESHOLD = 55;
    function updateBar(dist, isRelease = false) {
      if (dist <= 0) {
        bar.style.height = "0px";
        bar.style.opacity = "0";
        bar.classList.remove("is-ready", "is-refreshing");
        return;
      }
      const h = Math.min(dist, 70);
      bar.style.height = `${h}px`;
      bar.style.opacity = `${Math.min(1, h / 35)}`;
      const text = bar.querySelector(".zh-pull-text");
      if (isRelease) {
        bar.classList.add("is-refreshing");
        if (text) text.textContent = "正在拉取最新推荐…";
        return;
      }
      if (dist >= THRESHOLD) {
        bar.classList.add("is-ready");
        if (text) text.textContent = "释放立即刷新…";
      } else {
        bar.classList.remove("is-ready");
        if (text) text.textContent = "下拉获取最新推荐…";
      }
    }
    box.addEventListener("pointerdown", (e) => {
      if (box.scrollTop > 5) return;
      if (e.target.closest("button, input, a, select")) return;
      startY = e.clientY;
      pulling = true;
      distance = 0;
    });
    window.addEventListener("pointermove", (e) => {
      if (!pulling) return;
      if (box.scrollTop > 0) {
        pulling = false;
        updateBar(0);
        return;
      }
      const diff = e.clientY - startY;
      if (diff > 0) {
        distance = Math.pow(diff, 0.85);
        updateBar(distance);
      } else {
        distance = 0;
        updateBar(0);
      }
    });
    window.addEventListener("pointerup", () => {
      if (!pulling) return;
      pulling = false;
      if (distance >= THRESHOLD) {
        updateBar(THRESHOLD, true);
        triggerNativeFeedRefresh(bar);
        setTimeout(() => updateBar(0), 1e3);
      } else {
        updateBar(0);
      }
      distance = 0;
    });
    let wheelTimer = null;
    box.addEventListener("wheel", (e) => {
      if (box.scrollTop <= 0 && e.deltaY < -10) {
        const step = Math.abs(e.deltaY) * 0.4;
        distance = Math.min(distance + step, 75);
        updateBar(distance);
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => {
          if (distance >= THRESHOLD) {
            updateBar(THRESHOLD, true);
            triggerNativeFeedRefresh(bar);
            setTimeout(() => {
              updateBar(0);
              distance = 0;
            }, 1e3);
          } else {
            updateBar(0);
            distance = 0;
          }
        }, 180);
      }
    }, { passive: true });
  }
  function ensureSessionList() {
    let box = document.getElementById(PANEL_ID);
    if (!box) {
      box = document.createElement("div");
      box.id = PANEL_ID;
      box.className = "zh-list-panel";
      box.addEventListener("scroll", lazySyncScroll, { passive: true });
      box.addEventListener("click", onListClick);
      box.addEventListener("keydown", onListKeydown);
      document.body.appendChild(box);
      bindPullToRefresh(box);
      renderAll();
      return;
    }
    bindPullToRefresh(box);
    syncListActive();
    const hasRows = box.querySelector(".zh-conv");
    if (!hasRows && feedCards().length) {
      renderAll();
    }
  }
  function onListClick(e) {
    var _a;
    const maskBtn = e.target.closest(".zh-mask-toggle");
    if (maskBtn) {
      e.preventDefault();
      setMaskAvatar(!isMaskAvatar());
      renderAll();
      return;
    }
    const refreshBtn = e.target.closest(".zh-chip-refresh");
    if (refreshBtn) {
      e.preventDefault();
      triggerNativeFeedRefresh(refreshBtn);
      return;
    }
    const chip = e.target.closest(".zh-chip[data-path]");
    if (chip) {
      e.preventDefault();
      if (location.pathname === chip.dataset.path) {
        triggerNativeFeedRefresh(chip);
        return;
      }
      location.href = chip.dataset.path;
      return;
    }
    const a = e.target.closest("a.zh-conv");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href) return;
    e.preventDefault();
    markRead(href);
    syncListActive(href);
    const titleHint = a.getAttribute("title") || ((_a = a.querySelector(".zh-conv-name")) == null ? void 0 : _a.textContent) || "";
    loadDetailInPlace(href, titleHint);
  }
  function onListKeydown(e) {
    const input = e.target.closest(".zh-search-input");
    if (!input || e.key !== "Enter") return;
    const kw = input.value.trim();
    if (!kw) return;
    e.preventDefault();
    input.blur();
    location.href = `/search?q=${encodeURIComponent(kw)}&type=content`;
  }
  function observeFeed() {
    const tryObserve = () => {
      const root = feedRoot();
      if (!root) return false;
      if (observed) return true;
      observed = new MutationObserver((mutations) => {
        var _a, _b, _c, _d;
        for (const m of mutations) {
          if (m.type === "attributes") {
            if (m.target instanceof Element && m.target.tagName === "VIDEO") neutralizeVideos(m.target);
            continue;
          }
          for (const node of m.addedNodes) {
            if (!(node instanceof Element)) continue;
            if (((_a = node.matches) == null ? void 0 : _a.call(node, "video")) || ((_b = node.querySelector) == null ? void 0 : _b.call(node, "video"))) neutralizeVideos(node);
            const hit = location.pathname === "/hot" || location.pathname.startsWith("/hot/") ? ".HotItem" : isSearchPath() ? ".SearchResult-Card, .ContentItem, .List-item" : ".TopstoryItem, .FeedItem, .List-item";
            if ((_c = node.matches) == null ? void 0 : _c.call(node, hit)) insertRow(extractCard(node));
            else if ((_d = node.querySelector) == null ? void 0 : _d.call(node, hit)) {
              node.querySelectorAll(hit).forEach((c) => insertRow(extractCard(c)));
            }
          }
        }
      });
      observed.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
      renderAll();
      return true;
    };
    if (!tryObserve()) {
      const t = setInterval(() => {
        if (tryObserve()) clearInterval(t);
      }, 400);
    }
  }
  let observed = null;
  function removePanels() {
    document.querySelectorAll(".zh-chat-empty, .zh-list-panel, .zh-list-recent").forEach((n) => n.remove());
  }
  function removeShell() {
    document.querySelectorAll(".zh-shell, .zh-titlebar, .zh-strip").forEach((n) => n.remove());
    removePanels();
  }
  function otherThemeActive() {
    return !!document.getElementById("CTZ_SUSPENSION_SWITCH") || !!document.getElementById("CTZ_STYLE_BACKGROUND");
  }
  function run() {
    console.info(`[zhihu-im] v${"0.2.5"} loaded, skin=${SKIN_ID}`);
    installFeedCapture();
    if (typeof window !== "undefined" && window.matchMedia) {
      try {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
          if (localStorage.getItem("zhihu-im-color-theme") === "auto") applyTheme();
        });
      } catch {
      }
    }
    let scheduleTimer = null;
    function scheduleApply() {
      if (scheduleTimer) return;
      scheduleTimer = setTimeout(() => {
        scheduleTimer = null;
        applyTheme();
      }, 60);
    }
    function injectStyle() {
      let style = document.getElementById(STYLE_ID);
      if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ID;
        (document.head || document.documentElement).appendChild(style);
      }
      style.textContent = skinCss();
    }
    function teardownShell(html) {
      html.classList.remove(ROOT_CLASS);
      html.removeAttribute("data-zh-route");
      html.removeAttribute("data-zh-skin");
      html.removeAttribute("data-zh-chat");
      restoreForeignDocks();
      closeSkinMenu();
      removeShell();
      removeChatView();
    }
    function applyTheme() {
      const html = document.documentElement;
      if (!html) return;
      applyColorMode();
      if (getViewMode() !== "im" || otherThemeActive()) {
        teardownShell(html);
        ensureNativeFab();
        return;
      }
      const pathname = location.pathname;
      const route = isDetailPath(pathname) ? "detail" : isFeedPath(pathname) ? "feed" : "other";
      if (route === "other") {
        teardownShell(html);
        return;
      }
      injectStyle();
      html.classList.add(ROOT_CLASS);
      html.setAttribute("data-zh-skin", SKIN_ID);
      html.setAttribute("data-zh-route", route);
      if (!document.body) return;
      ensureShell();
      hideForeignDocks();
      ensureSessionList();
      if (route === "feed") {
        ensureChatEmpty();
        observeFeed();
      } else {
        removeChatEmpty();
        markRead(location.pathname + location.search);
        const title = detailTitleFromDom();
        if (title) addRecent(location.pathname + location.search, title);
        syncListActive();
        ensureChatView();
        html.setAttribute("data-zh-chat", "parsed");
      }
    }
    function applyRootAttrs() {
      const html = document.documentElement;
      if (!html) return;
      if (getViewMode() !== "im" || otherThemeActive()) return;
      const pathname = location.pathname;
      const route = isDetailPath(pathname) ? "detail" : isFeedPath(pathname) ? "feed" : "other";
      html.classList.add(ROOT_CLASS);
      html.setAttribute("data-zh-skin", SKIN_ID);
      html.setAttribute("data-zh-route", route);
    }
    function bootstrap() {
      if (!document.documentElement) {
        requestAnimationFrame(bootstrap);
        return;
      }
      applyRootAttrs();
      injectStyle();
      if (!document.body) {
        requestAnimationFrame(bootstrap);
        return;
      }
      requestAnimationFrame(scheduleApply);
      for (const method of ["pushState", "replaceState"]) {
        const original = history[method];
        history[method] = function(...args) {
          const result = original.apply(this, args);
          scheduleApply();
          return result;
        };
      }
      window.addEventListener("popstate", scheduleApply);
      window.addEventListener("hashchange", scheduleApply);
      document.addEventListener("DOMContentLoaded", scheduleApply, { once: true });
      const IM_UI_SEL = ".zh-shell, .zh-titlebar, .zh-chat-empty, .zh-list-panel, .zh-skin-menu, .zh-chat-view, .zh-resizer-rail, .zh-resizer-list, .zh-fab";
      const observer2 = new MutationObserver((mutations) => {
        const external = mutations.some((m) => {
          var _a, _b;
          for (const n of m.addedNodes) {
            if (n instanceof Element && (((_a = n.matches) == null ? void 0 : _a.call(n, IM_UI_SEL)) || n.id === STYLE_ID)) return false;
          }
          for (const n of m.removedNodes) {
            if (n instanceof Element && (((_b = n.matches) == null ? void 0 : _b.call(n, IM_UI_SEL)) || n.id === STYLE_ID)) return false;
          }
          const t = m.target;
          if (!(t instanceof Element) && !(t instanceof CharacterData)) return true;
          const el = t instanceof Element ? t : t.parentElement;
          if (!el) return true;
          if (el.closest(IM_UI_SEL) || el.id === STYLE_ID) return false;
          return true;
        });
        if (external) scheduleApply();
      });
      observer2.observe(document.documentElement, { childList: true, subtree: true });
      [1e3, 2e3, 4e3].forEach((ms) => setTimeout(scheduleApply, ms));
    }
    applyRootAttrs();
    injectStyle();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
    } else {
      bootstrap();
    }
  }
  run();
})();
