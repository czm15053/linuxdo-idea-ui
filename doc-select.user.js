// ==UserScript==
// @name         文章一键伪装
// @namespace    https://github.com/czm15053/linuxdo-idea-ui
// @version      0.1.0
// @description  按 ⌘/Ctrl+' 圈选正文元素，整页切换为飞书文档 / Word 文档视图（完整装饰外框 + 白色文档页，其余元素隐藏），刷新还原
// @author       czm15053
// @match        *://*/*
// @grant        GM_addStyle
// @noframes
// @run-at       document-idle
// @updateURL    https://github.com/czm15053/linuxdo-idea-ui/raw/main/doc-select.user.js
// @downloadURL  https://github.com/czm15053/linuxdo-idea-ui/raw/main/doc-select.user.js
// ==/UserScript==

(function () {
  "use strict";

  /* ================= 常量 ================= */

  const HOTKEY = "'";   // ⌘+'（mac）/ Ctrl+'（windows）；改这里换键
  const THEMES = {
    feishu: { label: "飞书文档", badge: "飞", sub: "整页文档视图" },
    word:   { label: "Word 文档", badge: "W", sub: "纸张页面视图" }
  };

  /* ================= 皮肤样式（GM_addStyle 注入，绕开严格 CSP） ================= */

  const skinCss = `
/* ---------- 通用文档卡片（对齐参考项目：纸 980px、轻投影） ---------- */
.ds-skin {
  box-sizing: border-box !important;
  display: block !important;
  background: #FFFFFF !important;
  padding: 48px 66px 74px !important;
  max-width: 980px !important;
  margin: 0 auto 24px !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .18) !important;
  border: 0 !important;
  font-size: 16px !important;
  line-height: 1.72 !important;
  color: #202020 !important;
  transition: box-shadow .2s ease, background-color .2s ease, border-radius .2s ease !important;
  overflow-wrap: break-word !important;
}

/* ---------- 飞书文档皮肤（token 对齐 linuxdo-lark-ui） ---------- */
.ds-skin-feishu, .ds-skin-feishu * {
  color: #1F2329 !important;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Inter, -apple-system, sans-serif !important;
}
html .ds-skin-feishu {
  border-radius: 0 !important;
  border-color: transparent !important;
  outline: none !important;
  box-shadow: none !important;
  max-width: none !important;
  width: auto !important;
  min-width: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  float: none !important;
  flex: 1 1 auto !important;
  padding: 40px 48px !important;
  line-height: 1.8 !important;
}
/* 深度透明化站点容器边框（.OverviewRepoFiles 之类深层组件），保留占位不改布局；结构性边框在下面重保护 */
.ds-skin-feishu * { border-color: transparent !important; }
/* 点名压制顽固组件（CSS Module 类名）：视图级规则，不在圈选正文内也生效；后代与伪元素一并覆盖 */
html.ds-view-feishu [class*="OverviewRepoFiles"],
html.ds-view-feishu [class*="OverviewRepoFiles"]::before,
html.ds-view-feishu [class*="OverviewRepoFiles"]::after,
html.ds-view-feishu [class*="OverviewRepoFiles"] * {
  border-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
}
html .ds-skin-feishu [class*="OverviewRepoFiles"] { border-color: transparent !important; }
.ds-skin-feishu *:not(code):not(pre):not(.ds-skin-feishu pre *) { background-color: transparent !important; }
.ds-skin-feishu h1, .ds-skin-feishu h2, .ds-skin-feishu h3, .ds-skin-feishu h4, .ds-skin-feishu h5 {
  border: 0 !important;
  padding: 0 !important;
  margin: 18px 0 8px !important;
  font-weight: 700 !important;
  line-height: 1.35 !important;
  letter-spacing: -0.8px !important;
  color: #1F2329 !important;
}
.ds-skin-feishu h1 { font-size: clamp(28px, 2.2vw, 38px) !important; }
.ds-skin-feishu h2 { font-size: 24px !important; letter-spacing: -0.4px !important; color: #3370FF !important; }
.ds-skin-feishu h3 { font-size: 18px !important; letter-spacing: 0 !important; }
.ds-skin-feishu h4, .ds-skin-feishu h5 { font-size: 15px !important; letter-spacing: 0 !important; }
.ds-skin-feishu li::marker { color: #3370FF !important; }
.ds-skin-feishu p { margin: 6px 0 !important; line-height: 1.8 !important; }
.ds-skin-feishu a { color: #3370FF !important; text-decoration: none !important; }
.ds-skin-feishu a:hover { text-decoration: underline !important; }
.ds-skin-feishu strong, .ds-skin-feishu b { font-weight: 600 !important; color: #1F2329 !important; }
.ds-skin-feishu code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
  font-size: .9em !important;
  background: #F5F6F7 !important;
  color: #1F2329 !important;
  border: 1px solid #EFF0F1 !important;
  border-radius: 4px !important;
  padding: 1px 5px !important;
}
.ds-skin-feishu pre {
  background: #F7F8FA !important;
  border: 1px solid #EFF0F1 !important;
  border-radius: 6px !important;
  padding: 12px 14px !important;
  overflow-x: auto !important;
  margin: 8px 0 !important;
  line-height: 1.6 !important;
}
.ds-skin-feishu pre code { background: transparent !important; border: 0 !important; padding: 0 !important; }
.ds-skin-feishu blockquote {
  margin: 12px 0 !important;
  padding: 14px 18px !important;
  border: 1px solid #EFF0F1 !important;
  border-left: 3px solid #3370FF !important;
  border-radius: 8px !important;
  color: #1F2329 !important;
  background: #F7F8FA !important;
}
.ds-skin-feishu ul, .ds-skin-feishu ol { padding-left: 22px !important; margin: 6px 0 !important; }
.ds-skin-feishu li { margin: 2px 0 !important; line-height: 1.7 !important; }
.ds-skin-feishu img { max-width: 100% !important; height: auto !important; border-radius: 6px !important; border: 0 !important; }
.ds-skin-feishu hr { border: 0 !important; border-top: 1px solid #E6E8EB !important; margin: 14px 0 !important; }
.ds-skin-feishu table { border-collapse: collapse !important; width: 100% !important; font-size: 14px !important; margin: 8px 0 !important; }
.ds-skin-feishu th, .ds-skin-feishu td { border: 1px solid #DEE0E3 !important; padding: 6px 10px !important; }
.ds-skin-feishu th { background: #F7F8FA !important; font-weight: 600 !important; }

/* ---------- Word 文档皮肤（token 对齐 discourse-word-ui） ---------- */
.ds-skin-word, .ds-skin-word * {
  color: #202020 !important;
  font-family: "Segoe UI", Calibri, "Microsoft YaHei", Arial, sans-serif !important;
}
.ds-skin-word { border-radius: 0 !important; }
.ds-skin-word *:not(code):not(pre):not(.ds-skin-word pre *) { background-color: transparent !important; }
.ds-skin-word h1, .ds-skin-word h2, .ds-skin-word h3, .ds-skin-word h4, .ds-skin-word h5 {
  border: 0 !important;
  padding: 0 !important;
  margin: 16px 0 6px !important;
  color: #202020 !important;
  line-height: 1.3 !important;
}
.ds-skin-word h1 { font-size: 28px !important; font-weight: 400 !important; line-height: 1.25 !important; }
.ds-skin-word h2 { font-size: 20px !important; font-weight: 600 !important; }
.ds-skin-word h3 { font-size: 17px !important; font-weight: 600 !important; }
.ds-skin-word h4, .ds-skin-word h5 { font-size: 15px !important; font-weight: 600 !important; }
.ds-skin-word p { margin: 6px 0 !important; line-height: 1.72 !important; }
.ds-skin-word a { color: inherit !important; text-decoration: none !important; }
.ds-skin-word a:hover { text-decoration: underline !important; }
.ds-skin-word strong, .ds-skin-word b { font-weight: 700 !important; color: #202020 !important; }
.ds-skin-word code {
  font-family: Consolas, ui-monospace, Menlo, monospace !important;
  font-size: .92em !important;
  background: #F2F2F2 !important;
  color: #202020 !important;
  border: 1px solid #E1E1E1 !important;
  border-radius: 0 !important;
  padding: 0 4px !important;
}
.ds-skin-word pre {
  background: #F7F7F7 !important;
  border: 1px solid #E1E1E1 !important;
  border-radius: 0 !important;
  padding: 10px 12px !important;
  overflow-x: auto !important;
  margin: 8px 0 !important;
  line-height: 1.55 !important;
}
.ds-skin-word pre code { background: transparent !important; border: 0 !important; padding: 0 !important; }
.ds-skin-word blockquote {
  margin: 8px 0 !important;
  padding: 2px 12px !important;
  border-left: 3px solid #BFBFBF !important;
  color: #595959 !important;
  background: transparent !important;
}
.ds-skin-word ul, .ds-skin-word ol { padding-left: 24px !important; margin: 6px 0 !important; }
.ds-skin-word li { margin: 2px 0 !important; line-height: 1.65 !important; }
.ds-skin-word img { max-width: 100% !important; height: auto !important; border: 1px solid #E1E1E1 !important; padding: 2px !important; background: #FFFFFF !important; }
.ds-skin-word hr { border: 0 !important; border-top: 1px solid #D9D9D9 !important; margin: 14px 0 !important; }
.ds-skin-word table { border-collapse: collapse !important; width: 100% !important; font-size: 13px !important; margin: 8px 0 !important; }
.ds-skin-word th, .ds-skin-word td { border: 1px solid #D0D0D0 !important; padding: 5px 9px !important; }
.ds-skin-word th { background: #F2F2F2 !important; font-weight: 600 !important; }

/* ---------- Word 边框透明化（与飞书同方案）：容器与深层组件透明，结构性边框重保护 ---------- */
html .ds-skin-word { border-color: transparent !important; outline: none !important; }
.ds-skin-word * { border-color: transparent !important; }
html .ds-view-word [class*="OverviewRepoFiles"],
html .ds-view-word [class*="OverviewRepoFiles"]::before,
html .ds-view-word [class*="OverviewRepoFiles"]::after,
html .ds-view-word [class*="OverviewRepoFiles"] * {
  border-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
}
html .ds-skin-word [class*="OverviewRepoFiles"] { border-color: transparent !important; }
html .ds-skin-word code { border: 1px solid #E1E1E1 !important; }
html .ds-skin-word pre { border: 1px solid #E1E1E1 !important; }
html .ds-skin-word blockquote { border: 0 !important; border-left: 3px solid #BFBFBF !important; }
html .ds-skin-word th, html .ds-skin-word td { border: 1px solid #D0D0D0 !important; }
html .ds-skin-word hr { border: 0 !important; border-top: 1px solid #D9D9D9 !important; }
html .ds-skin-word img { border: 1px solid #E1E1E1 !important; }

/* ---------- 整页文档视图：非选中元素隐藏 + 灰工作区 ---------- */
.ds-hidden { display: none !important; }
.ds-skin h1, .ds-skin h2, .ds-skin h3, .ds-skin h4, .ds-skin h5 { scroll-margin-top: 140px !important; }
.ds-skin-feishu h1, .ds-skin-feishu h2, .ds-skin-feishu h3, .ds-skin-feishu h4, .ds-skin-feishu h5 { scroll-margin-top: 88px !important; }
html.ds-view body { padding: 24px 12px 56px !important; margin: 0 !important; }
html.ds-view-feishu body { padding: 76px 28px 40px 502px !important; }
html.ds-view-word body { padding: 132px 12px 40px 262px !important; }
html.ds-view-feishu, html.ds-view-feishu body { background: #FFFFFF !important; }
html.ds-view-word, html.ds-view-word body { background: #E5E5E5 !important; }

/* ---------- 飞书文档元信息条（插入正文顶部，内容编排） ---------- */
.ds-skin-feishu .ds-fmeta {
  display: flex !important;
  align-items: center;
  gap: 14px;
  color: #8F959E !important;
  font-size: 13px;
  padding-bottom: 14px;
  margin: 0 0 22px;
  border-bottom: 1px solid #EFF0F1;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}
.ds-skin-feishu .ds-fmeta b { color: #646A73 !important; font-weight: 400; }
.ds-skin-feishu .ds-fmeta .ds-fmeta-grow { flex: 1; }
.ds-skin-feishu .ds-fmeta button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 10px;
  border: 1px solid #C9D4FF !important;
  border-radius: 6px;
  background: #F5F8FF !important;
  color: #3370FF !important;
  font-size: 12px;
}

/* ---------- 祖先链压平：main-outlet 等保留容器不再约束正文宽度（grid/flex 轨道一并失效），边框/阴影同清 ---------- */
.ds-anc { display: block !important; max-width: none !important; width: auto !important; margin-left: 0 !important; margin-right: 0 !important; padding-left: 0 !important; padding-right: 0 !important; border-color: transparent !important; outline: none !important; box-shadow: none !important; }

/* ---------- Word 暗色（对齐 discourse-word-ui dw-dark-mode） ---------- */
html.ds-view-word.ds-word-dark, html.ds-view-word.ds-word-dark body { background: #1E2023 !important; }
.ds-word-dark .ds-skin-word {
  background: #25272B !important;
  box-shadow: 0 1px 5px rgba(0, 0, 0, .45) !important;
}
.ds-word-dark .ds-skin-word, .ds-word-dark .ds-skin-word * { color: #EDF1F5 !important; }
.ds-word-dark .ds-skin-word h1, .ds-word-dark .ds-skin-word h2, .ds-word-dark .ds-skin-word h3,
.ds-word-dark .ds-skin-word h4, .ds-word-dark .ds-skin-word h5 { color: #EDF1F5 !important; }
.ds-word-dark .ds-skin-word code { background: #30343A !important; border-color: #454A52 !important; color: #EDF1F5 !important; }
.ds-word-dark .ds-skin-word pre { background: #25282D !important; border-color: #454A52 !important; }
.ds-word-dark .ds-skin-word blockquote { border-left-color: #454A52 !important; color: #AEB6C1 !important; }
.ds-word-dark .ds-skin-word th, .ds-word-dark .ds-skin-word td { border-color: #454A52 !important; }
.ds-word-dark .ds-skin-word th { background: #282B30 !important; }
.ds-word-dark .ds-skin-word img { border-color: #454A52 !important; }
.ds-word-dark .ds-skin-word hr { border-top-color: #454A52 !important; }
`;

  // 圈选高亮框样式；cssRules[0] 固定为 .ds-pick-hl，几何值由 paintPick 经 CSSOM 写入（不碰 CSP）
  const pickPosEl = GM_addStyle(`
.ds-pick-hl { position: fixed; z-index: 2147483646; pointer-events: none; outline: 2px solid #3370FF; background: rgba(51,112,255,.10); border-radius: 2px; }
html.ds-picking, html.ds-picking * { cursor: crosshair !important; }
.ds-pick-hide { display: none !important; }
.ds-pick-hl .ds-pick-tag {
  position: absolute; top: -20px; left: -2px;
  background: #3370FF; color: #fff;
  font: 11px/16px ui-monospace, Menlo, monospace;
  padding: 0 6px; border-radius: 3px 3px 3px 0;
  white-space: nowrap;
}
.ds-pick-hint {
  position: fixed; top: 14px; left: 50%;
  transform: translateX(-50%);
  z-index: 2147483646;
  background: rgba(31, 35, 41, .92);
  color: #fff;
  font: 13px/1.5 "PingFang SC", "Microsoft YaHei", sans-serif;
  padding: 8px 16px; border-radius: 8px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, .2);
  display: none;
}
.ds-pick-hint.show { display: block !important; }
.ds-pick-hint b { color: #82A7FC; font-weight: 600; }` + skinCss);

  /* ================= 主题卡片（Shadow DOM，隔离宿主页面样式） ================= */

  const host = document.createElement("div");
  host.id = "ds-toolbar";
  const shadow = host.attachShadow({ mode: "open" });

  // 定位/显隐走 constructable sheet 的第 0 条规则（CSSOM 修改不触发 CSP inline-style 限制）
  let sheet, posRule, fallbackStyleEl = null;
  const POS_CSS = "position:fixed;z-index:2147483647;display:none;";
  try {
    sheet = new CSSStyleSheet();
    if (!("adoptedStyleSheets" in shadow)) throw new Error("no adoptedStyleSheets");
    shadow.adoptedStyleSheets = [sheet];
  } catch (err) {
    fallbackStyleEl = document.createElement("style");
    shadow.appendChild(fallbackStyleEl);
    sheet = fallbackStyleEl.sheet;
  }

  let visible = false;
  function setHostBox(show, left, top) {
    visible = show;
    if (posRule) {
      posRule.style.display = show ? "block" : "none";
      if (show) {
        posRule.style.left = Math.round(left) + "px";
        posRule.style.top = Math.round(top) + "px";
      }
    } else {
      host.style.display = show ? "block" : "none";
      if (show) {
        host.style.position = "fixed";
        host.style.zIndex = "2147483647";
        host.style.left = Math.round(left) + "px";
        host.style.top = Math.round(top) + "px";
      }
    }
  }

  const SHADOW_CSS = `
:host { font-size: 12px; }
* { box-sizing: border-box; margin: 0; padding: 0; }
.wrap {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #E8E9EB;
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(31,35,41,.16);
  color: #1F2329;
  font: 12px/1.4 "PingFang SC","Microsoft YaHei","Segoe UI",sans-serif;
  user-select: none;
}
.pt-title { font-size: 12px; font-weight: 600; color: #8A8F99; margin-right: 2px; }
.pt {
  width: auto; height: auto;
  display: flex; flex-direction: column; align-items: flex-start;
  gap: 2px; padding: 6px 10px;
  border: 1px solid #E8E9EB; border-radius: 8px;
  background: transparent;
  min-width: 104px;
  cursor: pointer; font: inherit;
}
.pt:hover { background: #F5F6F7; }
.pt.cur { border-color: #3370FF; background: #E4EDFB; }
.pt-badge {
  width: 20px; height: 20px; border-radius: 5px;
  display: grid; place-items: center;
  color: #fff; font-size: 11px; font-weight: 700;
}
.pt[data-theme="feishu"] .pt-badge { background: #3370FF; }
.pt[data-theme="word"] .pt-badge { background: #185ABD; border-radius: 3px; }
.pt-name { font-size: 12px; font-weight: 600; color: #1F2329; }
.pt-sub { font-size: 10px; color: #8A8F99; }
.xbtn {
  width: 24px; height: 24px;
  display: grid; place-items: center;
  border: 0; border-radius: 6px; background: transparent;
  color: #646A73; cursor: pointer; padding: 0; font: inherit;
}
.xbtn:hover { background: #F5F6F7; color: #1F2329; }
`;
  if (fallbackStyleEl) {
    fallbackStyleEl.textContent = `:host{${POS_CSS}}` + SHADOW_CSS;
  } else {
    sheet.replaceSync(`:host{${POS_CSS}}` + SHADOW_CSS);
  }
  try {
    posRule = sheet.cssRules[0];
  } catch (err) {
    posRule = null;
  }
  document.documentElement.appendChild(host);

  let wrapEl = null;
  let pickedEl = null;
  let currentEl = null;          // 当前已套皮肤的元素
  const hiddenSet = new Set();   // 被隐藏的非选中元素

  const CLEAR_SVG = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function curThemeOf(el) {
    if (!el) return null;
    if (el.classList.contains("ds-skin-feishu")) return "feishu";
    if (el.classList.contains("ds-skin-word")) return "word";
    return null;
  }

  // 隐藏选中元素的所有旁支：沿祖先链向上，每层把非路径上的兄弟节点藏掉；
  // 同时把祖先容器（#main-outlet 之类）压平，不再当外层 wrapper 约束正文
  const ancSet = new Set();
  function isolate(el) {
    let node = el;
    while (node && node !== document.body) {
      const parent = node.parentElement;
      if (!parent) break;
      for (const sib of parent.children) {
        if (sib === node) continue;
        if (!hiddenSet.has(sib)) {
          hiddenSet.add(sib);
          sib.classList.add("ds-hidden");
        }
      }
      if (parent !== document.body && !ancSet.has(parent)) {
        ancSet.add(parent);
        parent.classList.add("ds-anc");
      }
      node = parent;
    }
  }

  function unhideAll() {
    for (const el of hiddenSet) el.classList.remove("ds-hidden");
    hiddenSet.clear();
    for (const el of ancSet) el.classList.remove("ds-anc");
    ancSet.clear();
  }

  // 正文顶部元信息条（飞书主题插入，还原/切换主题时全局清扫）
  function sweepMeta() {
    for (const n of document.querySelectorAll(".ds-fmeta")) n.remove();
  }
  // 站点可能用高优先级 !important 给选中元素上深色边框/固定宽度/外边距，内联 important 终极压制（透明化保布局）；还原时清理
  function clearSkinInline(el) {
    if (!el || !el.style) return;
    el.style.removeProperty("border-color");
    el.style.removeProperty("outline");
    el.style.removeProperty("box-shadow");
    el.style.removeProperty("width");
    el.style.removeProperty("min-width");
    el.style.removeProperty("margin-left");
    el.style.removeProperty("margin-right");
    el.style.removeProperty("float");
    el.style.removeProperty("flex");
  }
  const flatPatched = new Set();
  // 递归遍历（穿透 shadow root），命中 CSS Module 类名的元素打内联补丁
  function deepFlat(node, out) {
    if (node.nodeType === 1) {
      const cls = typeof node.className === "string" ? node.className : "";
      if (cls.includes("OverviewRepoFiles")) out.push(node);
    }
    const kids = node.children;
    if (kids) for (const child of kids) deepFlat(child, out);
    if (node.shadowRoot) deepFlat(node.shadowRoot, out);
  }
  function flattenSkinChrome(el) {
    el.style.setProperty("border-color", "transparent", "important");
    el.style.setProperty("outline", "none", "important");
    el.style.setProperty("box-shadow", "none", "important");
    const hits = [];
    deepFlat(el, hits);
    for (const box of hits) {
      flatPatched.add(box);
      box.style.setProperty("border-color", "transparent", "important");
    }
  }
  // 飞书专属：宽度释放（Word 纸张要保 980 居中和阴影，不动 width/margin）
  function releaseWidth(el) {
    el.style.setProperty("width", "auto", "important");
    el.style.setProperty("min-width", "0", "important");
    el.style.setProperty("margin-left", "0", "important");
    el.style.setProperty("margin-right", "0", "important");
    el.style.setProperty("float", "none", "important");
    el.style.setProperty("flex", "1 1 auto", "important");
  }
  function cleanupFlat() {
    for (const box of flatPatched) box.style.removeProperty("border-color");
    flatPatched.clear();
  }
  function insertMeta(el) {
    const words = (el.textContent || "").replace(/\s+/g, "").length;
    const html = `<div class="ds-fmeta"><span>🗓 2024年3月18日创建</span><span>字数 ${words}</span><span>👁 1.2万</span><span class="ds-fmeta-grow"></span><button type="button">✨ AI 速览 <b>试用</b></button></div>`;
    // 只在识别到真正的标题 H（短标题）时放标题下方；把整段话当 h1 的不算，元信息留在文档顶部
    const head = el.querySelector("h1");
    if (head && head.textContent.trim().length <= 40) head.insertAdjacentHTML("afterend", html);
    else el.insertAdjacentHTML("afterbegin", html);
  }

  // 浏览器标签页 icon 换成蓝底飞书 logo（仅飞书主题；还原时恢复原 icon）
  const faviconSaved = new Map();
  let faviconPatched = false;
  function applyFavicon() {
    if (faviconPatched) return;
    const uri = "data:image/svg+xml;utf8," + encodeURIComponent(LARK_LOGO);
    const links = document.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon']");
    for (const link of links) {
      if (!faviconSaved.has(link)) faviconSaved.set(link, link.getAttribute("href"));
      link.setAttribute("href", uri);
    }
    let link = document.querySelector("link[data-ds-favicon]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.dataset.dsFavicon = "1";
      (document.head || document.documentElement).appendChild(link);
    }
    link.setAttribute("href", uri);
    faviconPatched = true;
  }
  function restoreFavicon() {
    if (!faviconPatched) return;
    for (const [link, href] of faviconSaved) {
      if (href == null) link.removeAttribute("href");
      else link.setAttribute("href", href);
    }
    faviconSaved.clear();
    const ours = document.querySelector("link[data-ds-favicon]");
    if (ours) ours.remove();
    faviconPatched = false;
  }

  function restoreAll() {
    sweepMeta();
    if (currentEl) {
      clearSkinInline(currentEl);
      currentEl.classList.remove("ds-skin", "ds-skin-feishu", "ds-skin-word");
    }
    cleanupFlat();
    currentEl = null;
    unhideAll();
    restoreFavicon();
    document.documentElement.classList.remove("ds-view", "ds-view-feishu", "ds-view-word", "ds-word-dark");
    chromeHost.classList.remove("dark");
    renderChrome(null);
  }

  function applyThemeTo(el, id) {
    if (!el) return;
    if (currentEl === el && curThemeOf(el) === id) {
      restoreAll();   // 再点同主题 = 整页还原
      return;
    }
    if (currentEl && currentEl !== el) restoreAll();   // 换元素：先还原旧视图
    clearSkinInline(el);
    cleanupFlat();
    sweepMeta();
    el.classList.remove("ds-skin-feishu", "ds-skin-word");
    el.classList.add("ds-skin", "ds-skin-" + id);
    flattenSkinChrome(el);   // 边框/阴影透明化：两主题通用
    if (id === "feishu") {
      releaseWidth(el);
      insertMeta(el);
      applyFavicon();
    }
    currentEl = el;
    isolate(el);
    document.documentElement.classList.remove("ds-view", "ds-view-feishu", "ds-view-word", "ds-word-dark");
    document.documentElement.classList.add("ds-view", "ds-view-" + id);
    if (id === "word" && isDarkPref()) {
      document.documentElement.classList.add("ds-word-dark");
      chromeHost.classList.add("dark");
    } else {
      chromeHost.classList.remove("dark");
    }
    renderChrome(id, el);
    try { window.scrollTo(0, 0); } catch (err) { /* ignore */ }
  }

  function renderThemePicker() {
    const cur = curThemeOf(pickedEl);
    shadow.innerHTML = `
      <div class="wrap">
        <span class="pt-title">文档皮肤</span>
        ${Object.entries(THEMES).map(([id, t]) => `
        <button type="button" class="pt${cur === id ? " cur" : ""}" data-theme="${id}">
          <span class="pt-badge">${t.badge}</span>
          <span class="pt-name">${t.label}</span>
          <span class="pt-sub">${cur === id ? "再点一次还原整页" : t.sub}</span>
        </button>`).join("")}
        <button type="button" class="xbtn" data-act="cancel" title="取消">${CLEAR_SVG}</button>
      </div>`;
    if (fallbackStyleEl) shadow.insertBefore(fallbackStyleEl, shadow.firstChild);
    wrapEl = shadow.querySelector(".wrap");
    wrapEl.addEventListener("mousedown", (e) => e.preventDefault());
    wrapEl.addEventListener("click", (e) => {
      const pt = e.target.closest("[data-theme]");
      if (pt) {
        applyThemeTo(pickedEl, pt.dataset.theme);
        renderThemePicker();
        return;
      }
      if (e.target.closest('[data-act="cancel"]')) hidePicker();
    });
  }

  function showPickerAt(el, x, y) {
    pickedEl = el;
    renderThemePicker();
    const bw = wrapEl.offsetWidth || 340;
    const bh = wrapEl.offsetHeight || 48;
    // 卡片在鼠标位置弹出：右下偏移，空间不足时翻到光标左/上侧
    let left = x + 14;
    if (left + bw > innerWidth - 8) left = x - bw - 14;
    left = Math.max(8, left);
    let top = y + 16;
    if (top + bh > innerHeight - 8) top = y - bh - 16;
    top = Math.max(8, top);
    setHostBox(true, left, top);
  }

  function hidePicker() {
    pickedEl = null;
    setHostBox(false, 0, 0);
  }

  /* ================= 整页装饰外框（Word 三件套 / 飞书顶栏，内容均为编排） ================= */

  const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const BACK_SVG = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>';
  const LARK_LOGO = '<svg viewBox="0 0 25 25"><rect width="25" height="25" rx="6" fill="#3370FF"/><path d="M7 13.5 12 7l2.5 4.5L18 8.5l-4 9h-2.2l1.6-6.2L11.6 15l-1.3-2.3L8.4 15z" fill="#fff" opacity=".95"/></svg>';
  const FILE_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="flex:none"><path d="M4 3h12.595c.93 0 1.806.355 2.439.96A3.07 3.07 0 0 1 20 6.176V21H7.405a3.53 3.53 0 0 1-2.439-.96A3.068 3.068 0 0 1 4 17.823V3ZM3 1a1 1 0 0 0-1 1v15.823c0 1.373.57 2.69 1.583 3.66A5.529 5.529 0 0 0 7.405 23H21a1 1 0 0 0 1-1V6.176a5.07 5.07 0 0 0-1.583-3.66A5.53 5.53 0 0 0 16.595 1H3Z"/><path d="M6.75 8a1 1 0 0 1 1-1h8.5a1 1 0 1 1 0 2h-8.5a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h8.5a1 1 0 1 1 0 2h-8.5a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h4.5a1 1 0 1 1 0 2h-4.5a1 1 0 0 1-1-1Z"/></svg>';
  const is = (inner, size) => `<svg viewBox="0 0 24 24" width="${size || 18}" height="${size || 18}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const ICON = {
    menu: is('<path d="M4 6.5h16M4 12h16M4 17.5h10"/>', 19),
    home: is('<path d="M4 11.5 12 4l8 7.5"/><path d="M6.5 10.5V20h11v-9.5"/>', 19),
    bell: is('<path d="M6 9.5a6 6 0 0 1 12 0c0 3.8 1.4 5.3 2 6H4c.6-.7 2-2.2 2-6z"/><path d="M10 18.8a2 2 0 0 0 4 0"/>'),
    dots: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>',
    search: is('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
    plus: is('<path d="M12 5v14M5 12h14"/>'),
    globe: is('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.6 2.3 3.9 5.1 3.9 8.5s-1.3 6.2-3.9 8.5c-2.6-2.3-3.9-5.1-3.9-8.5s1.3-6.2 3.9-8.5z"/>', 16),
    person: '<svg viewBox="0 0 24 24" width="15" height="15" fill="rgba(255,255,255,.92)"><circle cx="12" cy="8.6" r="3.8"/><path d="M4 20.2c1.5-4 4.4-5.9 8-5.9s6.5 1.9 8 5.9z"/></svg>'
  };
  let outlineHeads = [];

  // 从正文提取 h1-h4 生成大纲（真实数据，点击跳转对应标题）
  function outlineItems(docEl) {
    outlineHeads = docEl
      ? [...docEl.querySelectorAll("h1,h2,h3,h4")].filter((h) => h.textContent.trim())
      : [];
    return outlineHeads.map((h) => ({ level: +h.tagName[1], text: h.textContent.trim() }));
  }
  const chromeHost = document.createElement("div");
  chromeHost.id = "ds-chrome";
  const chromeShadow = chromeHost.attachShadow({ mode: "open" });
  let chromeSheet, chromeFallback = null;
  try {
    chromeSheet = new CSSStyleSheet();
    if (!("adoptedStyleSheets" in chromeShadow)) throw new Error("no adoptedStyleSheets");
    chromeShadow.adoptedStyleSheets = [chromeSheet];
  } catch (err) {
    chromeFallback = document.createElement("style");
    chromeShadow.appendChild(chromeFallback);
    chromeSheet = chromeFallback.sheet;
  }

  const CHROME_CSS = `
:host { font-size: 12px; }
* { box-sizing: border-box; margin: 0; padding: 0; }
.bar { display: block; height: 2px; width: 12px; margin: 0 auto; border-radius: 1px; }
.bi { font-weight: 700; font-size: 12px; line-height: 1; font-style: normal; }
.frame { position: fixed; left: 0; right: 0; z-index: 2147483645; background: #fff; color: #1F2329; font: 12px/1.4 "Segoe UI","等线","Microsoft YaHei",sans-serif; user-select: none; }
.frame.top { top: 0; box-shadow: 0 1px 0 rgba(0, 0, 0, .16); }
.frame.bottom { bottom: 0; }
button { font: inherit; background: none; border: 0; cursor: default; color: inherit; padding: 0; }
.grow { flex: 1; }

/* ---------- 大纲（飞书右侧面板用；Word 用 dw-chapter-nav 样式） ---------- */
.ol { display: block; width: 100%; text-align: left; padding: 4px 8px; border-radius: 3px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ol:hover { background: #E6F0FA; }
.ol.l2 { padding-left: 22px; }
.ol.l3 { padding-left: 36px; }
.ol.l4, .ol.l5 { padding-left: 50px; }
.ol-empty { color: #999; text-align: center; padding: 24px 8px; font-size: 11px; }

/* ---------- Word（对齐 discourse-word-ui：蓝标题栏 + tab + ribbon） ---------- */
.dw-titlebar {
  height: 36px;
  display: grid;
  grid-template-columns: minmax(190px, 1fr) minmax(240px, 2fr) minmax(190px, 1fr);
  align-items: center;
  padding: 0 10px;
  color: #fff;
  background: #185ABD;
  font-size: 12px;
}
.dw-titlebar > div { display: flex; align-items: center; min-width: 0; }
.dw-tb-left { gap: 9px; }
.dw-tb-center { justify-content: center; }
.dw-tb-right { justify-content: flex-end; gap: 4px; padding-right: 34px; }
.dw-quick-actions { display: inline-flex; gap: 1px; margin-right: 5px; }
.dw-quick-action {
  width: 22px; height: 24px;
  display: grid; place-items: center;
  color: rgba(255,255,255,.9);
  font: 15px/1 "Segoe UI", sans-serif;
  border-radius: 2px;
}
.dw-quick-action:hover { background: rgba(255,255,255,.16); }
.dw-word-mark {
  width: 22px; height: 22px;
  display: grid; place-items: center;
  background: #fff; color: #185ABD;
  font-weight: 700; font-size: 15px;
  box-shadow: inset -5px 0 0 #DBEAFE;
}
.dw-autosave { display: inline-flex; align-items: center; gap: 6px; opacity: .92; }
.dw-switch { width: 28px; height: 14px; position: relative; border: 1px solid rgba(255,255,255,.7); border-radius: 8px; }
.dw-switch::after {
  content: ""; position: absolute; top: 2px; right: 2px;
  width: 8px; height: 8px; border-radius: 50%; background: #fff;
}
.dw-document-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 400; }
.dw-title-button {
  width: 32px; height: 28px;
  display: grid; place-items: center;
  color: #fff; font: 15px/1 "Segoe UI", sans-serif;
  border-radius: 2px;
}
.dw-title-button:hover { background: rgba(255,255,255,.14); }
.dw-winclose {
  width: 46px; height: 36px;
  display: grid; place-items: center;
  color: #fff; font: 13px/1 "Segoe UI", sans-serif;
  margin: 0 -34px 0 4px;
}
.dw-winclose:hover { background: #E81123 !important; }
.dw-ribbon-tabs {
  height: 30px;
  display: flex; align-items: stretch; gap: 2px;
  padding: 0 12px;
  border-bottom: 1px solid #ECECEC;
}
.dw-tab {
  min-width: 48px; padding: 0 12px;
  display: grid; place-items: center;
  color: #333; font-size: 12px;
}
.dw-tab:first-child { margin-left: -12px; color: #fff; background: #185ABD; }
.dw-tab.is-active { color: #185ABD; box-shadow: inset 0 -2px 0 #185ABD; font-weight: 600; }
.dw-ribbon { height: 58px; display: flex; align-items: stretch; padding: 4px 12px 3px; overflow: hidden; }
.dw-group { display: flex; align-items: center; gap: 3px; padding: 0 10px; border-right: 1px solid #E5E5E5; }
.dw-group:first-child { padding-left: 0; }
.dw-command {
  min-width: 34px; height: 34px;
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  padding: 0 8px;
  border: 1px solid transparent; border-radius: 2px;
  color: #333; font-size: 12px;
}
.dw-command:hover { border-color: #C7C7C7; background: #F2F2F2; }
.dw-glyph {
  color: #185ABD;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 17px; font-weight: 700; line-height: 1;
}
.dw-glyph.it { font-style: italic; }
.dw-glyph.ul { text-decoration: underline; }
.dw-glyph.sm { font-size: 14px; font-weight: 600; }
.dw-command.is-wide { min-width: 62px; flex-direction: column; gap: 2px; font-size: 10px; }
.dw-command.is-wide .dw-glyph { font-size: 18px; }
.dw-command.is-wide .lbl { color: #333; }
.dw-ribbon-select {
  height: 26px; min-width: 72px;
  padding: 0 7px;
  border: 1px solid #C9C9C9; border-radius: 1px;
  color: #333; background: #fff; font-size: 11px;
}
.dw-chapter-nav { top: 124px; bottom: 0; width: 250px; border-right: 1px solid #CFCFCF; background: #F7F7F7; overflow: auto; font-size: 13px; }
.dw-chapter-nav__title { padding: 17px 20px 11px; border-bottom: 1px solid #D4D7DB; color: #30343A; font-size: 16px; font-weight: 600; }
.dw-chapter-nav__section { padding: 16px 20px 7px; color: #7A8087; font-size: 11px; font-weight: 600; letter-spacing: .03em; text-transform: uppercase; }
.dw-chapter-nav__link {
  min-height: 31px;
  display: flex; align-items: center; gap: 9px;
  padding: 6px 18px;
  color: #444A51; text-decoration: none; line-height: 1.3;
}
.dw-chapter-nav__link > span { width: 20px; flex: 0 0 20px; color: #969CA3; font-size: 11px; text-align: right; }
.dw-chapter-nav__link:hover { background: #E6E9ED; }
.dw-chapter-nav__link.is-active { box-shadow: inset 3px 0 0 #185ABD; color: #1E4F88; background: #DCEAFD; font-weight: 600; }

/* ---------- 飞书（对齐真实截图：品牌区/面包屑/协作者头像/分享/图标组） ---------- */
.f-bar { height: 64px; display: flex; align-items: center; gap: 6px; padding: 0 10px 0 12px; border-bottom: 1px solid #E6E8EB; color: #1F2329; font: 13px/1.4 "PingFang SC","Microsoft YaHei",sans-serif; }
.f-back { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 7px; color: #646A73; flex: none; }
.f-back:hover { background: #E9EAEC; }
.f-zone { display: flex; align-items: center; gap: 4px; padding-right: 14px; margin-right: 8px; border-right: 1px solid #EFF0F1; flex: none; }
.f-brand { display: inline-flex; align-items: center; gap: 8px; color: #1F2329; font-size: 17px; font-weight: 600; white-space: nowrap; letter-spacing: -0.2px; }
.f-brand svg { width: 24px; height: 24px; flex: none; }
.f-crumbs { min-width: 0; cursor: default; }
.f-crumbs b { display: block; color: #1F2329; font-size: 14px; line-height: 20px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.f-crumbs i { display: flex; align-items: center; gap: 6px; color: #8F959E; font-size: 12px; line-height: 20px; font-style: normal; }
.f-ic { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 7px; color: #1F2329; flex: none; }
.f-ic:hover { background: #E9EAEC; }
.f-div { width: 1px; height: 20px; background: #E6E8EB; margin: 0 6px; flex: none; }
.f-avs { display: flex; align-items: center; margin: 0 0 0 6px; flex: none; }
.f-ava {
  position: relative; width: 30px; height: 30px; border-radius: 50%;
  display: grid; place-items: center;
  border: 2px solid #fff; margin-left: -8px; flex: none;
}
.f-ava:first-child { margin-left: 0; }
.f-ava u {
  position: absolute; right: -2px; bottom: -2px;
  width: 10px; height: 10px; border-radius: 50%;
  border: 2px solid #fff; text-decoration: none;
}
.f-more {
  width: 30px; height: 30px; border-radius: 50%;
  background: #EFF0F1; color: #646A73;
  display: grid; place-items: center;
  font-size: 11px; margin-left: 4px; flex: none;
}
.f-share {
  height: 36px; padding: 0 14px; border-radius: 7px;
  background: #3370FF; color: #fff;
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 500; flex: none;
}
.f-share:hover { filter: brightness(1.05); }
.f-me {
  width: 34px; height: 34px; border-radius: 50%;
  display: grid; place-items: center; flex: none;
  border: 2px solid #fff;
}

/* ---------- 飞书知识库式左侧栏（对齐真实截图：空间头/搜索/目录树/底栏） ---------- */
.f-side { top: 64px; bottom: 0; width: 250px; border-right: 1px solid #E6E8EB; background: #fff; display: flex; flex-direction: column; padding: 12px 12px 10px; gap: 2px; font-family: "PingFang SC","Microsoft YaHei",sans-serif; }
.f-space { display: flex; align-items: center; gap: 8px; padding: 2px 8px 12px; min-width: 0; }
.f-space-logo { width: 28px; height: 28px; border-radius: 6px; background: #F5F6F7; display: grid; place-items: center; font-size: 15px; flex: none; }
.f-space-name { font-size: 14px; font-weight: 600; color: #1F2329; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.f-space-tag { font-size: 10px; color: #3370FF; border: 1px solid #C9D7FF; border-radius: 4px; padding: 0 4px; line-height: 16px; flex: none; }
.f-search-box {
  height: 32px; border-radius: 6px; background: #F5F6F7;
  display: flex; align-items: center; gap: 6px;
  padding: 0 10px; margin-bottom: 8px;
  color: #8F959E; font-size: 13px;
}
.f-ask {
  height: 32px; border: 1px solid #E6E8EB; border-radius: 6px;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin-bottom: 10px;
  color: #1F2329; font-size: 12px;
}
.f-ask:hover { background: #F5F6F7; }
.f-dirrow { display: flex; align-items: center; justify-content: space-between; padding: 0 10px 6px; font-size: 11px; color: #8F959E; }
.f-tree { display: flex; flex-direction: column; gap: 1px; overflow: auto; }
.f-tree button {
  display: flex; align-items: center; gap: 6px;
  width: 100%; min-height: 32px;
  padding: 0 8px; border-radius: 6px;
  font-size: 13px; color: #1F2329; text-align: left;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.f-tree button i { font-style: normal; width: 13px; flex: none; color: #8F959E; font-size: 10px; }
.f-tree button.lv2 { padding-left: 30px; }
.f-tree button.lv3 { padding-left: 52px; }
.f-tree button.doc { color: #1F2329; }
.f-tree button svg { color: #646A73; flex: none; }
.f-tree button:hover { background: #F5F6F7; }
.f-tree button.on { background: #E1EAFF; color: #245BDB; font-weight: 500; }
.f-tree button.on svg { color: #245BDB; }
.f-bottombar { margin-top: auto; display: flex; gap: 6px; padding-top: 10px; border-top: 1px solid #EFF0F1; }
.f-bottombar button {
  flex: 1; height: 30px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center; gap: 4px;
  color: #646A73; font-size: 12px;
}
.f-bottombar button:hover { background: #F5F6F7; }

/* ---------- 飞书中间大纲列（与正文同页，无分隔边框） ---------- */
.f-outline { top: 64px; bottom: 0; left: 250px; right: auto; width: 240px; border-right: 0; background: #fff; padding: 14px 10px; overflow: auto; font-family: "PingFang SC","Microsoft YaHei",sans-serif; }
.f-olhead { display: flex; align-items: center; gap: 8px; padding: 0 10px 10px; }
.f-olhead span { color: #646A73; font-size: 13px; }
.f-olhead b { font-size: 14px; font-weight: 600; color: #1F2329; }
.f-outline .ol { border-radius: 6px; padding: 5px 10px; font-size: 13px; color: #1F2329; }
.f-outline .ol:hover { background: #F5F6F7; }
.f-outline .ol.cur { color: #245BDB; font-weight: 500; background: #F0F4FF; }

/* ---------- Word 暗色 chrome（.dark 挂在 chromeHost 上，跨浏览器可靠） ---------- */
.dark .frame { background: #25282D; color: #EDF1F5; }
.dark .dw-titlebar { background: #123F76 !important; }
.dark .dw-ribbon-tabs, .dark .dw-ribbon { background: #25282D; border-color: #424750; }
.dark .dw-tab { color: #D6DCE3; }
.dark .dw-tab:first-child { color: #fff; background: #2B78D0; }
.dark .dw-tab.is-active { color: #8FC2FF; box-shadow: inset 0 -2px 0 #2B78D0; }
.dark .dw-command { color: #E8EDF2; }
.dark .dw-command:hover { border-color: #59616C; background: #363B43; }
.dark .dw-glyph { color: #8FC2FF; }
.dark .dw-command.is-wide .lbl { color: #E8EDF2; }
.dark .dw-ribbon-select { border-color: #59616C; color: #EDF1F5; background: #30343A; }
.dark .dw-quick-action { color: rgba(255,255,255,.9); }
.dark .dw-chapter-nav { background: #282B30; border-right-color: #454A52; }
.dark .dw-chapter-nav__title { color: #C5CBD3; border-bottom-color: #454A52; }
.dark .dw-chapter-nav__section { color: #8A929E; }
.dark .dw-chapter-nav__link { color: #C5CBD3; }
.dark .dw-chapter-nav__link > span { color: #7A828E; }
.dark .dw-chapter-nav__link:hover { background: #33383F; }
.dark .ol-empty { color: #7A828E; }
`;

  const DARK_KEY = "doc-select-dark";
  function isDarkPref() {
    try { return localStorage.getItem(DARK_KEY) === "1"; } catch (err) { return false; }
  }
  function setDark(on) {
    document.documentElement.classList.toggle("ds-word-dark", on);
    chromeHost.classList.toggle("dark", on);
    try { localStorage.setItem(DARK_KEY, on ? "1" : "0"); } catch (err) { /* ignore */ }
  }

  function renderChrome(id, docEl) {
    if (!id) {
      chromeShadow.innerHTML = "";
      outlineHeads = [];
      chromeHost.classList.remove("dark");
      return;
    }
    if (chromeFallback) chromeFallback.textContent = CHROME_CSS;
    else chromeSheet.replaceSync(CHROME_CSS);
    chromeHost.classList.toggle("dark", id === "word" && isDarkPref());

    const heads = outlineItems(docEl);

    if (id === "word") {
      const title = (document.title || "论坛阅读").slice(0, 24);
      const outline = heads.length
        ? heads.map((h, i) => `<a class="dw-chapter-nav__link" data-jump="${i}"><span>${i + 1}.</span>${escHtml(h.text.slice(0, 30))}</a>`).join("")
        : '<div class="ol-empty">正文暂无标题大纲</div>';
      chromeShadow.innerHTML = `
        <div class="frame top">
          <div class="dw-titlebar">
            <div class="dw-tb-left">
              <span class="dw-quick-actions">
                <button class="dw-quick-action" title="保存">▣</button>
                <button class="dw-quick-action" title="撤销">↶</button>
                <button class="dw-quick-action" title="重做">↷</button>
              </span>
              <span class="dw-word-mark">W</span>
              <span class="dw-autosave"><span>自动保存</span><span class="dw-switch"></span></span>
            </div>
            <div class="dw-tb-center"><span class="dw-document-title">${escHtml(title)}.docx - Word</span></div>
            <div class="dw-tb-right">
              <button class="dw-title-button" title="搜索">⌕</button>
              <button class="dw-title-button" data-dw="dark" title="切换暗黑主题" aria-pressed="false">◐</button>
              <button class="dw-winclose" data-dw="restore" title="关闭文档视图，返回原网页">✕</button>
            </div>
          </div>
          <div class="dw-ribbon-tabs">
            <span class="dw-tab">文件</span><span class="dw-tab is-active">开始</span><span class="dw-tab">插入</span><span class="dw-tab">绘图</span><span class="dw-tab">设计</span><span class="dw-tab">布局</span><span class="dw-tab">引用</span><span class="dw-tab">审阅</span><span class="dw-tab">视图</span><span class="dw-tab">帮助</span>
          </div>
          <div class="dw-ribbon">
            <div class="dw-group">
              <button class="dw-command is-wide" title="话题列表"><span class="dw-glyph">W</span><span class="lbl">话题</span></button>
              <button class="dw-command is-wide" title="新建"><span class="dw-glyph">＋</span><span class="lbl">新建</span></button>
            </div>
            <div class="dw-group">
              <button class="dw-command is-wide" title="粘贴"><span class="dw-glyph">▣</span><span class="lbl">粘贴</span></button>
              <button class="dw-command" title="剪切"><span class="dw-glyph">✂</span></button>
              <button class="dw-command" title="复制"><span class="dw-glyph">▢</span></button>
            </div>
            <div class="dw-group">
              <select class="dw-ribbon-select" title="字体"><option>Calibri</option></select>
              <select class="dw-ribbon-select" title="字号" style="min-width:40px"><option>12</option></select>
              <span class="dw-command" title="粗体"><span class="dw-glyph">B</span></span>
              <span class="dw-command" title="斜体"><span class="dw-glyph it">I</span></span>
              <span class="dw-command" title="下划线"><span class="dw-glyph ul">U</span></span>
            </div>
            <div class="dw-group">
              <span class="dw-command" title="项目符号"><span class="dw-glyph sm">☷</span></span>
              <span class="dw-command" title="左对齐"><span class="dw-glyph sm">≡</span></span>
              <span class="dw-command" title="行距"><span class="dw-glyph sm">↕</span></span>
            </div>
            <div class="dw-group">
              <button class="dw-command is-wide" title="未读"><span class="dw-glyph">•</span><span class="lbl">未读</span></button>
              <button class="dw-command is-wide" title="最新"><span class="dw-glyph">≡</span><span class="lbl">最新</span></button>
            </div>
            <div class="dw-group">
              <button class="dw-command is-wide" title="搜索"><span class="dw-glyph">⌕</span><span class="lbl">搜索</span></button>
              <button class="dw-command is-wide" title="导航窗格"><span class="dw-glyph">▤</span><span class="lbl">导航</span></button>
              <button class="dw-command is-wide" title="打印"><span class="dw-glyph">▣</span><span class="lbl">打印</span></button>
            </div>
            <div class="dw-group">
              <button class="dw-command is-wide" data-dw="dark" title="切换暗黑主题"><span class="dw-glyph">◐</span><span class="lbl">暗黑</span></button>
              <button class="dw-command is-wide" data-dw="restore" title="返回原网页"><span class="dw-glyph">↺</span><span class="lbl">还原</span></button>
            </div>
          </div>
        </div>
        <div class="frame left dw-chapter-nav">
          <div class="dw-chapter-nav__title">导航窗格</div>
          <div class="dw-chapter-nav__section">本文目录</div>
          ${outline}
          <div class="dw-chapter-nav__section">站点</div>
          <a class="dw-chapter-nav__link"><span>9.</span>类别</a>
          <a class="dw-chapter-nav__link"><span>10.</span>标签</a>
          <a class="dw-chapter-nav__link"><span>11.</span>搜索结果</a>
        </div>`;
      return;
    }

    // feishu
    const title = (document.title || "未命名文档").slice(0, 30);
    const outline = heads.length
      ? heads.map((h, i) => `<button class="ol l${h.level}" data-jump="${i}" title="${escHtml(h.text)}">${escHtml(h.text.slice(0, 40))}</button>`).join("")
      : '<div class="ol-empty">正文暂无标题大纲</div>';
    chromeShadow.innerHTML = `
      <div class="frame top f-bar">
        <button class="f-back" data-dw="restore" title="返回原网页">${BACK_SVG}</button>
        <span class="f-zone">
          <button class="f-ic" title="菜单">${ICON.menu}</button>
          <button class="f-ic" title="首页">${ICON.home}</button>
          <span class="f-brand">${LARK_LOGO}飞书云文档</span>
        </span>
        <span class="f-crumbs"><b>··· › ${escHtml(title)}</b><i>最近修改: 刚刚</i></span>
        <span class="grow"></span>
        <button class="f-share">${ICON.globe}分享</button>
        <button class="f-ic" title="通知">${ICON.bell}</button>
        <button class="f-ic" title="更多">${ICON.dots}</button>
        <span class="f-div"></span>
        <button class="f-ic" title="搜索">${ICON.search}</button>
        <button class="f-ic" title="新建">${ICON.plus}</button>
        <span class="f-div"></span>
        <span class="f-avs">
          <span class="f-ava" style="background:#7F5BF7">${ICON.person}<u style="background:#00C56C"></u></span>
          <span class="f-ava" style="background:#3E7BFA">${ICON.person}<u style="background:#FF9F0A"></u></span>
          <span class="f-ava" style="background:#14C0AB">${ICON.person}<u style="background:#00C56C"></u></span>
          <span class="f-ava" style="background:#3E7BFA">${ICON.person}<u style="background:#F54A45"></u></span>
          <span class="f-ava" style="background:#00C56C">${ICON.person}<u style="background:#8F959E"></u></span>
          <span class="f-more">+4</span>
        </span>
        <span class="f-me" style="background:#3370FF">${ICON.person}</span>
      </div>
      <div class="frame left f-side">
        <div class="f-space">
          <span class="f-space-logo">📘</span>
          <span class="f-space-name">企业知识库</span>
          <span class="f-space-tag">全员公开</span>
        </div>
        <div class="f-search-box">🔍 搜索</div>
        <button class="f-ask">✨ 问问知识库</button>
        <div class="f-dirrow"><span>目录</span><span>⚙</span></div>
        <nav class="f-tree">
          <button class="on"><i>▾</i>${FILE_SVG}研发文档</button>
          <button class="lv2"><i>▸</i>${FILE_SVG}前端组</button>
          <button class="lv2"><i>▸</i>${FILE_SVG}客户端组</button>
          <button class="lv2"><i>▾</i>${FILE_SVG}后端组</button>
          <button class="lv3 doc">${FILE_SVG}技术方案模板</button>
          <button class="lv3 doc">${FILE_SVG}发布与回滚流程</button>
          <button class="lv3 doc">${FILE_SVG}故障复盘模板</button>
          <button><i>▸</i>${FILE_SVG}产品文档</button>
          <button class="lv2"><i>▸</i>${FILE_SVG}C 端产品</button>
          <button class="lv2 doc">${FILE_SVG}需求文档模板</button>
          <button><i>▸</i>${FILE_SVG}市场运营</button>
          <button><i>▸</i>${FILE_SVG}人事行政</button>
          <button><i>▸</i>${FILE_SVG}财务制度</button>
          <button class="doc">${FILE_SVG}公司介绍</button>
          <button class="doc">${FILE_SVG}新人入职指引</button>
          <button class="doc">${FILE_SVG}常见问题 FAQ</button>
          <button class="doc">${FILE_SVG}会议室预订</button>
        </nav>
        <div class="f-bottombar">
          <button>📤 分享知识库</button>
          <button>🗑 回收站</button>
        </div>
      </div>
      <div class="frame f-outline">
        <div class="f-olhead"><span>«</span><b>大纲</b></div>
        ${outline}
      </div>`;
  }
  document.documentElement.appendChild(chromeHost);

  // 大纲点击跳转（真实功能）+ 暗色切换 + 返回原网页
  chromeShadow.addEventListener("click", (e) => {
    if (e.target.closest('[data-dw="dark"]')) {
      setDark(!document.documentElement.classList.contains("ds-word-dark"));
      return;
    }
    if (e.target.closest('[data-dw="restore"]')) {
      restoreAll();
      return;
    }
    const j = e.target.closest("[data-jump]");
    if (!j) return;
    const head = outlineHeads[Number(j.dataset.jump)];
    if (!head) return;
    try { head.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (err) { /* ignore */ }
  });

  /* ================= 元素圈选模式（⌘/Ctrl+' 进入，悬停高亮、点击选元素） ================= */

  let picking = false;
  let pickCurrent = null;

  const pickBox = document.createElement("div");
  pickBox.className = "ds-pick-hide";
  const pickTag = document.createElement("div");
  pickTag.className = "ds-pick-tag";
  pickBox.appendChild(pickTag);
  document.documentElement.appendChild(pickBox);

  // 圈选模式操作提示
  const pickHint = document.createElement("div");
  pickHint.className = "ds-pick-hint";
  pickHint.innerHTML = "点击选择正文区域，<b>Esc</b> 退出";
  document.documentElement.appendChild(pickHint);

  function isInlineEl(el) {
    try {
      const d = getComputedStyle(el).display;
      return d === "inline" || d === "contents";
    } catch (err) {
      return false;
    }
  }

  // 从命中点开始向上爬到第一个块级元素：圈选以「文档块」为粒度，而不是某个内联 span
  function pickTargetAt(x, y) {
    let el = document.elementFromPoint(x, y);
    while (el && el.nodeType === 1 && el !== document.body && el !== document.documentElement) {
      if (el.id === "ds-toolbar" || el === pickBox) return null;
      if (!isInlineEl(el)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function paintPick(el) {
    if (!el || !el.isConnected) {
      pickBox.className = "ds-pick-hide";
      pickCurrent = null;
      return;
    }
    const changed = el !== pickCurrent;
    pickCurrent = el;
    const r = el.getBoundingClientRect();
    try {
      const rule = pickPosEl.sheet.cssRules[0];
      rule.style.left = r.left + "px";
      rule.style.top = r.top + "px";
      rule.style.width = Math.max(2, r.width) + "px";
      rule.style.height = Math.max(2, r.height) + "px";
    } catch (err) { /* ignore */ }
    pickBox.className = "ds-pick-hl";
    if (changed) {
      const cls = typeof el.className === "string" && el.className.trim()
        ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
        : "";
      pickTag.textContent = (el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + cls).slice(0, 48);
    }
  }

  function enterPick() {
    picking = true;
    pickCurrent = null;
    hidePicker();
    pickHint.classList.add("show");
    document.documentElement.classList.add("ds-picking");
    document.addEventListener("mousemove", onPickMove, true);
    document.addEventListener("click", onPickClick, true);
    document.addEventListener("keydown", onPickKey, true);
  }

  function exitPick() {
    picking = false;
    pickCurrent = null;
    pickBox.className = "ds-pick-hide";
    pickHint.classList.remove("show");
    document.documentElement.classList.remove("ds-picking");
    document.removeEventListener("mousemove", onPickMove, true);
    document.removeEventListener("click", onPickClick, true);
    document.removeEventListener("keydown", onPickKey, true);
  }

  let pickRaf = 0;
  let pickXY = null;
  function onPickMove(e) {
    pickXY = { x: e.clientX, y: e.clientY };
    if (pickRaf) return;
    pickRaf = requestAnimationFrame(() => {
      pickRaf = 0;
      if (!picking || !pickXY) return;
      paintPick(pickTargetAt(pickXY.x, pickXY.y));
    });
  }

  function onPickClick(e) {
    if (!picking) return;
    e.preventDefault();
    e.stopPropagation();
    const el = pickTargetAt(e.clientX, e.clientY);
    exitPick();
    if (!el) return;
    showPickerAt(el, e.clientX, e.clientY);
  }

  function onPickKey(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      exitPick();
    }
  }

  function hotkeyMatch(e) {
    return e.key === HOTKEY && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey;
  }

  function isEditableTarget(t) {
    const el = t && (t.nodeType === 1 ? t : t.parentElement);
    if (!el) return false;
    const tag = el.nodeName;
    if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return true;
    const ce = el.closest("[contenteditable]");
    return !!(ce && ce.getAttribute("contenteditable") !== "false");
  }

  /* ================= 事件接线 ================= */

  window.addEventListener("scroll", () => {
    hidePicker();
    if (picking) paintPick(pickCurrent && pickCurrent.isConnected ? pickCurrent : null);
  }, true);
  window.addEventListener("resize", hidePicker);
  document.addEventListener("keydown", (e) => {
    if (hotkeyMatch(e) && !isEditableTarget(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      if (picking) exitPick();
      else enterPick();
      return;
    }
    if (e.key === "Escape") {
      if (picking) exitPick();
      hidePicker();
    }
  }, true);
})();
