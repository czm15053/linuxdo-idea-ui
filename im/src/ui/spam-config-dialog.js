// 水贴过滤配置弹窗
import {
  DEFAULT_SPAM_CONFIG,
  DEFAULT_SHORT_KEYWORDS,
  DEFAULT_KEYWORDS,
  loadSpamConfig,
  saveSpamConfig
} from "../features/spam-filter.js";
import { escapeHtml } from "../utils/html.js";
import { chatHooks } from "./hooks.js";

let dialogOverlay = null;

export function closeSpamConfigDialog() {
  if (dialogOverlay) {
    dialogOverlay.remove();
    dialogOverlay = null;
    document.removeEventListener("keydown", onDialogKeydown, true);
  }
}

function onDialogKeydown(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    closeSpamConfigDialog();
  }
}

/**
 * 弹出水贴屏蔽设置面板
 */
export function openSpamConfigDialog() {
  if (dialogOverlay) {
    if (document.body.contains(dialogOverlay)) return;
    dialogOverlay = null;
  }

  const current = loadSpamConfig();
  // 浅拷贝以供编辑
  const form = {
    enabled: current.enabled,
    enableShortReply: current.enableShortReply,
    shortReplyThreshold: current.shortReplyThreshold,
    requireShortKeyword: current.requireShortKeyword,
    shortKeywords: [...current.shortKeywords],
    enableKeywordBlock: current.enableKeywordBlock,
    keywordMatchMode: current.keywordMatchMode,
    keywords: [...current.keywords]
  };

  const overlay = document.createElement("div");
  overlay.className = "im-modal-overlay im-spam-dialog-overlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);backdrop-filter:blur(2px);";

  const panel = document.createElement("div");
  panel.className = "im-modal-panel im-spam-dialog";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "水贴过滤配置");

  panel.innerHTML = `
    <div class="im-modal-header">
      <div class="im-modal-title">
        <span class="im-spam-dialog-icon">🛡️</span>
        <span>水贴过滤配置</span>
      </div>
      <button type="button" class="im-modal-close" title="关闭 (Esc)">×</button>
    </div>
    <div class="im-modal-body im-spam-dialog-body">
      <!-- 总开关 -->
      <div class="im-spam-sec im-spam-main-switch">
        <div class="im-spam-row">
          <label class="im-switch">
            <input type="checkbox" id="spam-cfg-main-switch" ${form.enabled ? "checked" : ""}>
            <span class="im-switch-slider"></span>
          </label>
          <div class="im-spam-label-group">
            <span class="im-spam-label-title">开启水贴过滤</span>
            <span class="im-spam-label-desc">在 IM 聊天流中折叠“谢谢、mark、占位”等低信息密度回复</span>
          </div>
        </div>
      </div>

      <!-- 短回复屏蔽 -->
      <div class="im-spam-sec" id="sec-short-reply">
        <div class="im-spam-sec-head">
          <label class="im-switch">
            <input type="checkbox" id="spam-cfg-enable-short" ${form.enableShortReply ? "checked" : ""}>
            <span class="im-switch-slider"></span>
          </label>
          <span class="im-spam-sec-title">短回复屏蔽</span>
        </div>
        <div class="im-spam-sec-body" id="body-short-reply">
          <div class="im-spam-row">
            <span class="im-spam-label">字数阈值:</span>
            <input type="number" class="im-number-input" id="spam-cfg-short-threshold" value="${form.shortReplyThreshold}" min="1" max="30">
            <span class="im-spam-unit">字以内（范围 1-30 字符，约 0.5-15 个汉字）</span>
          </div>
          <div class="im-spam-row" style="margin-top: 10px;">
            <label class="im-switch">
              <input type="checkbox" id="spam-cfg-require-short-kw" ${form.requireShortKeyword ? "checked" : ""}>
              <span class="im-switch-slider"></span>
            </label>
            <span class="im-spam-label">仅屏蔽包含以下短特征词的回复</span>
          </div>
          <div id="wrap-short-keywords" style="margin-top: 10px;">
            <div class="im-spam-tags-header">
              <span>短词列表:</span>
              <span class="im-spam-tags-count" id="count-short-kw"></span>
            </div>
            <div class="im-spam-tags-container" id="container-short-kw"></div>
            <div class="im-spam-tag-add-row">
              <input type="text" class="im-spam-input" id="input-short-kw" placeholder="输入短词，回车添加..." maxlength="40">
              <button type="button" class="im-spam-btn im-spam-add-btn" id="btn-add-short-kw">添加</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 全局关键词屏蔽 -->
      <div class="im-spam-sec" id="sec-keyword-block">
        <div class="im-spam-sec-head">
          <label class="im-switch">
            <input type="checkbox" id="spam-cfg-enable-kw" ${form.enableKeywordBlock ? "checked" : ""}>
            <span class="im-switch-slider"></span>
          </label>
          <span class="im-spam-sec-title">关键词屏蔽</span>
        </div>
        <div class="im-spam-sec-body" id="body-keyword-block">
          <div class="im-spam-row">
            <span class="im-spam-label">匹配模式:</span>
            <label class="im-radio-label">
              <input type="radio" name="spam-match-mode" value="exact" ${form.keywordMatchMode === "exact" ? "checked" : ""}>
              <span>全文匹配（整楼仅含关键词时才折叠，推荐）</span>
            </label>
            <label class="im-radio-label">
              <input type="radio" name="spam-match-mode" value="contains" ${form.keywordMatchMode === "contains" ? "checked" : ""}>
              <span>包含匹配</span>
            </label>
          </div>
          <div style="margin-top: 10px;">
            <div class="im-spam-tags-header">
              <span>屏蔽词列表:</span>
              <span class="im-spam-tags-count" id="count-kw"></span>
            </div>
            <div class="im-spam-tags-container" id="container-kw"></div>
            <div class="im-spam-tag-add-row">
              <input type="text" class="im-spam-input" id="input-kw" placeholder="输入关键词，回车添加..." maxlength="40">
              <button type="button" class="im-spam-btn im-spam-add-btn" id="btn-add-kw">添加</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="im-modal-footer">
      <button type="button" class="im-spam-btn im-spam-btn-reset" id="spam-cfg-btn-reset">恢复默认</button>
      <div class="im-modal-actions">
        <button type="button" class="im-spam-btn im-spam-btn-cancel" id="spam-cfg-btn-cancel">取消</button>
        <button type="button" class="im-spam-btn im-spam-btn-save" id="spam-cfg-btn-save">保存配置</button>
      </div>
    </div>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  dialogOverlay = overlay;

  document.addEventListener("keydown", onDialogKeydown, true);

  // 绑定 Tag 渲染与增删交互
  function renderTags(containerId, countId, list) {
    const container = panel.querySelector(`#${containerId}`);
    const countEl = panel.querySelector(`#${countId}`);
    if (!container || !countEl) return;
    container.innerHTML = "";
    countEl.textContent = `(${list.length}/500)`;

    for (let i = 0; i < list.length; i++) {
      const kw = list[i];
      const tag = document.createElement("span");
      tag.className = "im-spam-tag-pill";
      tag.innerHTML = `<span>${escapeHtml(kw)}</span><button type="button" class="im-spam-tag-del" title="删除">×</button>`;
      tag.querySelector(".im-spam-tag-del").addEventListener("click", () => {
        list.splice(i, 1);
        renderTags(containerId, countId, list);
      });
      container.appendChild(tag);
    }
  }

  function setupTagInput(inputId, btnId, containerId, countId, list) {
    const input = panel.querySelector(`#${inputId}`);
    const btn = panel.querySelector(`#${btnId}`);
    if (!input || !btn) return;

    const doAdd = () => {
      const val = input.value.trim();
      if (!val) return;
      if (list.length >= 500) {
        alert("已达到 500 个关键词上限");
        return;
      }
      // 防重
      if (!list.some((k) => k.toLowerCase() === val.toLowerCase())) {
        list.push(val.substring(0, 40));
        renderTags(containerId, countId, list);
      }
      input.value = "";
      input.focus();
    };

    btn.addEventListener("click", doAdd);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doAdd();
      }
    });
  }

  // 渲染初始短词与关键词
  renderTags("container-short-kw", "count-short-kw", form.shortKeywords);
  renderTags("container-kw", "count-kw", form.keywords);

  setupTagInput("input-short-kw", "btn-add-short-kw", "container-short-kw", "count-short-kw", form.shortKeywords);
  setupTagInput("input-kw", "btn-add-kw", "container-kw", "count-kw", form.keywords);

  // 子开关级联显示控制
  const chkMain = panel.querySelector("#spam-cfg-main-switch");
  const chkShort = panel.querySelector("#spam-cfg-enable-short");
  const chkReqShort = panel.querySelector("#spam-cfg-require-short-kw");
  const chkKw = panel.querySelector("#spam-cfg-enable-kw");

  const bodyShort = panel.querySelector("#body-short-reply");
  const wrapShortKw = panel.querySelector("#wrap-short-keywords");
  const bodyKw = panel.querySelector("#body-keyword-block");

  function syncSections() {
    bodyShort.style.display = chkShort.checked ? "" : "none";
    wrapShortKw.style.display = chkReqShort.checked ? "" : "none";
    bodyKw.style.display = chkKw.checked ? "" : "none";
  }

  chkShort.addEventListener("change", syncSections);
  chkReqShort.addEventListener("change", syncSections);
  chkKw.addEventListener("change", syncSections);
  syncSections();

  // 遮罩点击关闭
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) closeSpamConfigDialog();
  });
  panel.querySelector(".im-modal-close").addEventListener("click", closeSpamConfigDialog);
  panel.querySelector("#spam-cfg-btn-cancel").addEventListener("click", closeSpamConfigDialog);

  // 恢复默认
  panel.querySelector("#spam-cfg-btn-reset").addEventListener("click", () => {
    chkMain.checked = DEFAULT_SPAM_CONFIG.enabled;
    chkShort.checked = DEFAULT_SPAM_CONFIG.enableShortReply;
    panel.querySelector("#spam-cfg-short-threshold").value = DEFAULT_SPAM_CONFIG.shortReplyThreshold;
    chkReqShort.checked = DEFAULT_SPAM_CONFIG.requireShortKeyword;
    chkKw.checked = DEFAULT_SPAM_CONFIG.enableKeywordBlock;

    const r = panel.querySelector(`input[name="spam-match-mode"][value="${DEFAULT_SPAM_CONFIG.keywordMatchMode}"]`);
    if (r) r.checked = true;

    form.shortKeywords = [...DEFAULT_SHORT_KEYWORDS];
    form.keywords = [...DEFAULT_KEYWORDS];
    renderTags("container-short-kw", "count-short-kw", form.shortKeywords);
    renderTags("container-kw", "count-kw", form.keywords);
    syncSections();
  });

  // 保存
  panel.querySelector("#spam-cfg-btn-save").addEventListener("click", () => {
    const threshold = parseInt(panel.querySelector("#spam-cfg-short-threshold").value, 10);
    const modeRadio = panel.querySelector("input[name='spam-match-mode']:checked");

    const newConfig = {
      enabled: chkMain.checked,
      enableShortReply: chkShort.checked,
      shortReplyThreshold: isNaN(threshold) ? 12 : Math.max(1, Math.min(30, threshold)),
      requireShortKeyword: chkReqShort.checked,
      shortKeywords: form.shortKeywords,
      enableKeywordBlock: chkKw.checked,
      keywordMatchMode: modeRadio ? modeRadio.value : "exact",
      keywords: form.keywords
    };

    saveSpamConfig(newConfig);
    closeSpamConfigDialog();
    chatHooks.toast?.(newConfig.enabled ? "水贴过滤配置已保存并生效" : "水贴过滤已关闭");
  });
}
