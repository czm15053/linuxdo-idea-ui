// 中栏关键词高亮配置弹窗
import {
  loadHighlightConfig,
  saveHighlightConfig
} from "../features/highlight-keywords.js";
import { escapeHtml } from "../utils/html.js";
import { chatHooks } from "./hooks.js";

let dialogOverlay = null;

export function closeHighlightConfigDialog() {
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
    closeHighlightConfigDialog();
  }
}

/**
 * 弹出关键词高亮配置面板
 */
export function openHighlightConfigDialog() {
  if (dialogOverlay) {
    if (document.body.contains(dialogOverlay)) return;
    dialogOverlay = null;
  }

  const current = loadHighlightConfig();
  const form = {
    enabled: current.enabled,
    keywords: [...current.keywords]
  };

  const overlay = document.createElement("div");
  overlay.className = "im-modal-overlay im-highlight-dialog-overlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);backdrop-filter:blur(2px);";

  const panel = document.createElement("div");
  panel.className = "im-modal-panel im-spam-dialog im-highlight-dialog";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "关键词高亮配置");

  panel.innerHTML = `
    <div class="im-modal-header">
      <div class="im-modal-title">
        <span class="im-spam-dialog-icon">🖍️</span>
        <span>关键词高亮配置</span>
      </div>
      <button type="button" class="im-modal-close" title="关闭 (Esc)">×</button>
    </div>
    <div class="im-modal-body im-spam-dialog-body">
      <!-- 总开关 -->
      <div class="im-spam-sec im-spam-main-switch">
        <div class="im-spam-row">
          <label class="im-switch">
            <input type="checkbox" id="hl-cfg-main-switch" ${form.enabled ? "checked" : ""}>
            <span class="im-switch-slider"></span>
          </label>
          <div class="im-spam-label-group">
            <span class="im-spam-label-title">开启列表关键词高亮</span>
            <span class="im-spam-label-desc">在中栏帖子标题与副标题中常驻高亮显示关注的重点词汇</span>
          </div>
        </div>
      </div>

      <!-- 关键词管理 -->
      <div class="im-spam-sec" id="sec-hl-keywords">
        <div class="im-spam-sec-head">
          <span class="im-spam-sec-title">关注词库</span>
        </div>
        <div class="im-spam-sec-body">
          <div class="im-spam-tags-header">
            <span>高亮关键词列表:</span>
            <span class="im-spam-tags-count" id="count-hl-kw"></span>
          </div>
          <div class="im-spam-tags-container" id="container-hl-kw"></div>
          <div class="im-spam-tag-add-row">
            <input type="text" class="im-spam-input" id="input-hl-kw" placeholder="输入关注词（如 DeepSeek、抽奖、优惠），回车添加..." maxlength="40">
            <button type="button" class="im-spam-btn im-spam-add-btn" id="btn-add-hl-kw">添加</button>
          </div>
          <div class="im-spam-unit" style="margin-top: 6px;">💡 不区分大小写；最多支持 500 个关键词，单词最长 40 字符。</div>
        </div>
      </div>
    </div>
    <div class="im-modal-footer">
      <button type="button" class="im-spam-btn im-spam-btn-reset" id="hl-cfg-btn-clear">清空词库</button>
      <div class="im-modal-actions">
        <button type="button" class="im-spam-btn im-spam-btn-cancel" id="hl-cfg-btn-cancel">取消</button>
        <button type="button" class="im-spam-btn im-spam-btn-save" id="hl-cfg-btn-save">保存配置</button>
      </div>
    </div>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  dialogOverlay = overlay;

  document.addEventListener("keydown", onDialogKeydown, true);

  const container = panel.querySelector("#container-hl-kw");
  const countEl = panel.querySelector("#count-hl-kw");
  const inputEl = panel.querySelector("#input-hl-kw");
  const addBtn = panel.querySelector("#btn-add-hl-kw");

  function renderTags() {
    container.innerHTML = "";
    countEl.textContent = `(${form.keywords.length}/500)`;

    if (!form.keywords.length) {
      const emptyTip = document.createElement("span");
      emptyTip.className = "im-spam-tags-empty";
      emptyTip.textContent = "暂无关键词，请在下方输入并添加";
      container.appendChild(emptyTip);
      return;
    }

    for (let i = 0; i < form.keywords.length; i++) {
      const kw = form.keywords[i];
      const tag = document.createElement("span");
      tag.className = "im-spam-tag-pill im-hl-tag-pill";
      tag.innerHTML = `<span>${escapeHtml(kw)}</span><button type="button" class="im-spam-tag-del" title="删除">×</button>`;
      tag.querySelector(".im-spam-tag-del").addEventListener("click", () => {
        form.keywords.splice(i, 1);
        renderTags();
      });
      container.appendChild(tag);
    }
  }

  function doAdd() {
    const val = inputEl.value.trim();
    if (!val) return;
    if (form.keywords.length >= 500) {
      alert("已达到 500 个关键词上限");
      return;
    }
    // 防重复（大小写不敏感）
    if (!form.keywords.some((k) => k.toLowerCase() === val.toLowerCase())) {
      form.keywords.push(val.substring(0, 40));
      renderTags();
    }
    inputEl.value = "";
    inputEl.focus();
  }

  addBtn.addEventListener("click", doAdd);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doAdd();
    }
  });

  renderTags();

  // 遮罩点击关闭
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) closeHighlightConfigDialog();
  });
  panel.querySelector(".im-modal-close").addEventListener("click", closeHighlightConfigDialog);
  panel.querySelector("#hl-cfg-btn-cancel").addEventListener("click", closeHighlightConfigDialog);

  // 清空词库
  panel.querySelector("#hl-cfg-btn-clear").addEventListener("click", () => {
    if (form.keywords.length && confirm("确定清空所有高亮关键词吗？")) {
      form.keywords = [];
      renderTags();
    }
  });

  // 保存
  panel.querySelector("#hl-cfg-btn-save").addEventListener("click", () => {
    const chkMain = panel.querySelector("#hl-cfg-main-switch");
    const newConfig = {
      enabled: chkMain.checked,
      keywords: form.keywords
    };

    saveHighlightConfig(newConfig);
    closeHighlightConfigDialog();
    chatHooks.toast?.(
      newConfig.enabled
        ? `关键词高亮已生效（共 ${newConfig.keywords.length} 个词）`
        : "关键词高亮已关闭"
    );
  });
}
