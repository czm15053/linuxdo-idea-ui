// 中栏关键词高亮配置弹窗
import {
  loadHighlightConfig,
  saveHighlightConfig,
  categoryFilterOptions,
  tagFilterOptions
} from "../features/highlight-keywords.js";
import { loadCategories } from "../bridge/categories.js";
import { api } from "../bridge/api.js";
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
    keywords: [...current.keywords],
    filterEnabled: current.filterEnabled,
    filterKeywords: [...current.filterKeywords],
    filterUsers: [...current.filterUsers],
    filterCategories: [...current.filterCategories],
    filterTags: [...current.filterTags]
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

      <!-- 屏蔽词过滤 -->
      <div class="im-spam-sec" id="sec-hl-filter">
        <div class="im-spam-sec-head">
          <span class="im-spam-sec-title">屏蔽词过滤</span>
        </div>
        <div class="im-spam-sec-body">
          <div class="im-spam-row">
            <label class="im-switch">
              <input type="checkbox" id="hl-cfg-filter-switch" ${form.filterEnabled ? "checked" : ""}>
              <span class="im-switch-slider"></span>
            </label>
            <div class="im-spam-label-group">
              <span class="im-spam-label-title">开启屏蔽词过滤</span>
              <span class="im-spam-label-desc">中栏列表隐藏标题含屏蔽词的话题（如抽奖、收号），底部状态栏提示已过滤条数</span>
            </div>
          </div>
          <div class="im-spam-tags-header" style="margin-top: 10px;">
            <span>屏蔽词列表:</span>
            <span class="im-spam-tags-count" id="count-hl-filter"></span>
          </div>
          <div class="im-spam-tags-container im-hl-pillbox" id="container-hl-filter"></div>
          <div class="im-spam-tag-add-row">
            <input type="text" class="im-spam-input" id="input-hl-filter" placeholder="输入屏蔽词（如 抽奖、羊毛、合租），回车添加..." maxlength="40">
            <button type="button" class="im-spam-btn im-spam-add-btn" id="btn-add-hl-filter">添加</button>
          </div>

          <div class="im-spam-tags-header" style="margin-top: 12px;">
            <span>屏蔽用户:</span>
            <span class="im-spam-tags-count" id="count-hl-fuser"></span>
          </div>
          <div class="im-spam-tags-container im-hl-pillbox" id="container-hl-fuser"></div>
          <div class="im-spam-tag-add-row">
            <input type="text" class="im-spam-input" id="input-hl-fuser" placeholder="输入用户名（可带 @），回车添加..." maxlength="40">
            <button type="button" class="im-spam-btn im-spam-add-btn" id="btn-add-hl-fuser">添加</button>
          </div>

          <div class="im-spam-tags-header" style="margin-top: 12px;">
            <span>屏蔽分类:</span>
            <span class="im-spam-tags-count" id="count-hl-fcat"></span>
          </div>
          <div class="im-spam-tags-container im-hl-pillbox" id="container-hl-fcat"></div>
          <div class="im-spam-tag-add-row">
            <input type="text" class="im-spam-input" id="input-hl-fcat" placeholder="搜索分类…" autocomplete="off">
          </div>
          <div class="im-hl-options" id="options-hl-fcat" hidden></div>

          <div class="im-spam-tags-header" style="margin-top: 12px;">
            <span>屏蔽标签:</span>
            <span class="im-spam-tags-count" id="count-hl-ftag"></span>
          </div>
          <div class="im-spam-tags-container im-hl-pillbox" id="container-hl-ftag"></div>
          <div class="im-spam-tag-add-row">
            <input type="text" class="im-spam-input" id="input-hl-ftag" placeholder="搜索标签（如 集中帖、快问快答）…" autocomplete="off">
          </div>
          <div class="im-hl-options" id="options-hl-ftag" hidden></div>
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
  const filterContainer = panel.querySelector("#container-hl-filter");
  const filterCountEl = panel.querySelector("#count-hl-filter");
  const filterInputEl = panel.querySelector("#input-hl-filter");
  const filterAddBtn = panel.querySelector("#btn-add-hl-filter");

  // 分类/标签下拉：值 -> 显示名（长效保存 id / 标签名，展示仍用原名）
  const filterLabels = new Map();
  // 即时生效：打开弹窗后任何增删/勾选都立刻落盘并重绘列表（无需点保存）
  let liveReady = false;

  function currentConfig() {
    return {
      enabled: panel.querySelector("#hl-cfg-main-switch").checked,
      keywords: form.keywords,
      filterEnabled: panel.querySelector("#hl-cfg-filter-switch").checked,
      filterKeywords: form.filterKeywords,
      filterUsers: form.filterUsers,
      filterCategories: form.filterCategories,
      filterTags: form.filterTags
    };
  }

  function applyLive() {
    if (!liveReady) return;
    saveHighlightConfig(currentConfig());
    document.dispatchEvent(new CustomEvent("im:highlight-config-changed"));
  }

  function renderTagsInto(list, box, count, emptyTipText) {
    box.innerHTML = "";
    count.textContent = `(${list.length}/500)`;

    if (!list.length) {
      const emptyTip = document.createElement("span");
      emptyTip.className = "im-spam-tags-empty";
      emptyTip.textContent = emptyTipText;
      box.appendChild(emptyTip);
      return;
    }

    for (let i = 0; i < list.length; i++) {
      const kw = list[i];
      const tag = document.createElement("span");
      tag.className = "im-spam-tag-pill im-hl-tag-pill";
      tag.innerHTML = `<span>${escapeHtml(kw)}</span><button type="button" class="im-spam-tag-del" title="删除">×</button>`;
      tag.querySelector(".im-spam-tag-del").addEventListener("click", () => {
        list.splice(i, 1);
        renderAllTags();
        applyLive();
      });
      box.appendChild(tag);
    }
  }

  function renderAllTags() {
    renderTagsInto(form.keywords, container, countEl, "暂无关键词，请在下方输入并添加");
    renderTagsInto(form.filterKeywords, filterContainer, filterCountEl, "暂无屏蔽词，请在下方输入并添加");
  }

  function bindAdd(input, btn, list) {
    function doAdd() {
      const val = input.value.trim();
      if (!val) return;
      if (list.length >= 500) {
        alert("已达到 500 个关键词上限");
        return;
      }
      // 防重复（大小写不敏感）
      if (!list.some((k) => k.toLowerCase() === val.toLowerCase())) {
        list.push(val.substring(0, 40));
        renderAllTags();
        applyLive();
      }
      input.value = "";
      input.focus();
    }

    btn.addEventListener("click", doAdd);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doAdd();
      }
    });
  }

  bindAdd(inputEl, addBtn, form.keywords);
  bindAdd(filterInputEl, filterAddBtn, form.filterKeywords);

  /* ---------- 屏蔽用户：手打用户名 ---------- */
  const fuserContainer = panel.querySelector("#container-hl-fuser");
  const fuserCountEl = panel.querySelector("#count-hl-fuser");
  const fuserInputEl = panel.querySelector("#input-hl-fuser");

  function renderFilterUsers() {
    fuserContainer.innerHTML = "";
    fuserCountEl.textContent = `(${form.filterUsers.length}/500)`;
    if (!form.filterUsers.length) {
      const tip = document.createElement("span");
      tip.className = "im-spam-tags-empty";
      tip.textContent = "暂无屏蔽用户";
      fuserContainer.appendChild(tip);
      return;
    }
    for (let i = 0; i < form.filterUsers.length; i++) {
      const name = form.filterUsers[i];
      const pill = document.createElement("span");
      pill.className = "im-spam-tag-pill im-hl-tag-pill";
      pill.innerHTML = `<span>@${escapeHtml(name)}</span><button type="button" class="im-spam-tag-del" title="删除">×</button>`;
      pill.querySelector(".im-spam-tag-del").addEventListener("click", () => {
        form.filterUsers.splice(i, 1);
        renderFilterUsers();
        applyLive();
      });
      fuserContainer.appendChild(pill);
    }
  }

  bindAdd(fuserInputEl, panel.querySelector("#btn-add-hl-fuser"), form.filterUsers);
  renderFilterUsers();

  /* ---------- 屏蔽分类 / 标签：可搜索下拉多选 ---------- */
  function setupFilterPicker({ key, input, optionsBox, containerEl, countEl, loadOptions, search, emptyTip }) {
    const state = { options: [], visible: [], timer: null, seq: 0 };

    function renderPills() {
      containerEl.innerHTML = "";
      countEl.textContent = `(${form[key].length}/500)`;
      if (!form[key].length) {
        const tip = document.createElement("span");
        tip.className = "im-spam-tags-empty";
        tip.textContent = emptyTip;
        containerEl.appendChild(tip);
        return;
      }
      for (let i = 0; i < form[key].length; i++) {
        const value = form[key][i];
        const label = filterLabels.get(`${key}:${value}`) || value;
        const pill = document.createElement("span");
        pill.className = "im-spam-tag-pill im-hl-tag-pill";
        pill.innerHTML = `<span>${escapeHtml(label)}</span><button type="button" class="im-spam-tag-del" title="删除">×</button>`;
        pill.querySelector(".im-spam-tag-del").addEventListener("click", () => {
          form[key].splice(i, 1);
          renderPills();
          renderOptions(input.value.trim());
          applyLive();
        });
        containerEl.appendChild(pill);
      }
    }

    function renderOptions(query) {
      const q = query.toLowerCase();
      state.visible = state.options
        .filter((option) => !q || option.label.toLowerCase().includes(q) || option.value.includes(q))
        .slice(0, 60);
      optionsBox.innerHTML = "";
      optionsBox.hidden = false;
      if (!state.visible.length) {
        const tip = document.createElement("span");
        tip.className = "im-spam-tags-empty";
        tip.textContent = state.options.length ? "没有匹配项" : "暂无可用选项";
        optionsBox.appendChild(tip);
        return;
      }
      for (const option of state.visible) {
        const selected = form[key].some((value) => value.toLowerCase() === option.value);
        const row = document.createElement("button");
        row.type = "button";
        row.className = `im-hl-option${selected ? " is-selected" : ""}`;
        row.innerHTML = `<span class="im-hl-check">${selected ? "✓" : ""}</span><span>${escapeHtml(option.label)}</span>`;
        row.addEventListener("click", () => {
          const index = form[key].findIndex((value) => value.toLowerCase() === option.value);
          if (index >= 0) form[key].splice(index, 1);
          if (index < 0) {
            form[key].push(option.value);
            filterLabels.set(`${key}:${option.value}`, option.label);
          }
          renderPills();
          renderOptions(input.value.trim());
          input.focus();
          applyLive();
        });
        optionsBox.appendChild(row);
      }
    }

    input.addEventListener("focus", async () => {
      renderOptions(input.value.trim());
      if (state.options.length) return;
      try {
        state.options = await loadOptions("");
        renderOptions(input.value.trim());
      } catch {
        optionsBox.innerHTML = "<span class=\"im-spam-tags-empty\">加载失败，改关键词可重试</span>";
      }
    });
    input.addEventListener("input", () => {
      renderOptions(input.value.trim());
      if (!search) return;
      clearTimeout(state.timer);
      state.timer = setTimeout(async () => {
        const query = input.value.trim();
        if (!query) return;
        const seq = ++state.seq;
        try {
          const results = await loadOptions(query);
          if (seq !== state.seq || input.value.trim() !== query) return;
          const merged = new Map(state.options.map((option) => [option.value, option]));
          for (const option of results) {
            merged.set(option.value, option);
            filterLabels.set(`${key}:${option.value}`, option.label);
          }
          state.options = [...merged.values()];
          renderOptions(query);
        } catch { /* 搜索失败保留现有结果 */ }
      }, 200);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const first = state.visible[0];
        if (first) input.value = first.label;
      }
    });

    renderPills();
    // 预载选项：已保存的规则也能显示原名（否则分类会显示成 id）
    loadOptions("").then((options) => {
      state.options = options;
      for (const option of options) {
        if (form[key].some((value) => value.toLowerCase() === option.value)) {
          filterLabels.set(`${key}:${option.value}`, option.label);
        }
      }
      renderPills();
    }).catch(() => { /* 加载失败保持原样 */ });

    return { renderPills };
  }

  const fcatPicker = setupFilterPicker({
    key: "filterCategories",
    input: panel.querySelector("#input-hl-fcat"),
    optionsBox: panel.querySelector("#options-hl-fcat"),
    containerEl: panel.querySelector("#container-hl-fcat"),
    countEl: panel.querySelector("#count-hl-fcat"),
    emptyTip: "暂无屏蔽分类",
    loadOptions: async () => categoryFilterOptions(await loadCategories())
  });

  const ftagPicker = setupFilterPicker({
    key: "filterTags",
    input: panel.querySelector("#input-hl-ftag"),
    optionsBox: panel.querySelector("#options-hl-ftag"),
    containerEl: panel.querySelector("#container-hl-ftag"),
    countEl: panel.querySelector("#count-hl-ftag"),
    emptyTip: "暂无屏蔽标签",
    search: true,
    loadOptions: async (query) => {
      if (query) {
        const data = await api(`/tags/filter/search?${new URLSearchParams({ q: query, limit: "50" })}`);
        return tagFilterOptions(data.results || []);
      }
      const data = await api("/tags.json");
      const groups = data.extras?.tag_groups || [];
      const categories = data.extras?.categories || [];
      return tagFilterOptions([
        ...(data.tags || []),
        ...groups.flatMap((group) => group.tags || []),
        ...categories.flatMap((category) => category.tags || [])
      ]);
    }
  });

  renderAllTags();
  liveReady = true;

  // 两个总开关也即时生效
  for (const id of ["#hl-cfg-main-switch", "#hl-cfg-filter-switch"]) {
    panel.querySelector(id).addEventListener("change", applyLive);
  }

  // 遮罩点击关闭
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) closeHighlightConfigDialog();
  });
  panel.querySelector(".im-modal-close").addEventListener("click", closeHighlightConfigDialog);
  panel.querySelector("#hl-cfg-btn-cancel").addEventListener("click", closeHighlightConfigDialog);

  // 清空词库
  panel.querySelector("#hl-cfg-btn-clear").addEventListener("click", () => {
    const total = form.keywords.length + form.filterKeywords.length +
      form.filterUsers.length + form.filterCategories.length + form.filterTags.length;
    if (total && confirm("确定清空所有高亮关键词和屏蔽规则吗？")) {
      form.keywords = [];
      form.filterKeywords = [];
      form.filterUsers = [];
      form.filterCategories = [];
      form.filterTags = [];
      renderAllTags();
      renderFilterUsers();
      fcatPicker.renderPills();
      ftagPicker.renderPills();
      applyLive();
    }
  });

  // 保存
  panel.querySelector("#hl-cfg-btn-save").addEventListener("click", () => {
    const chkMain = panel.querySelector("#hl-cfg-main-switch");
    const chkFilter = panel.querySelector("#hl-cfg-filter-switch");
    const newConfig = {
      enabled: chkMain.checked,
      keywords: form.keywords,
      filterEnabled: chkFilter.checked,
      filterKeywords: form.filterKeywords,
      filterUsers: form.filterUsers,
      filterCategories: form.filterCategories,
      filterTags: form.filterTags
    };

    saveHighlightConfig(newConfig);
    // 显式通知列表重绘：不依赖 save 回调里的去重判断
    document.dispatchEvent(new CustomEvent("im:highlight-config-changed"));
    closeHighlightConfigDialog();
    const filterTotal = newConfig.filterKeywords.length + newConfig.filterUsers.length +
      newConfig.filterCategories.length + newConfig.filterTags.length;
    chatHooks.toast?.(
      `高亮 ${newConfig.enabled ? "开" : "关"} · 过滤 ${newConfig.filterEnabled ? `开（${filterTotal} 条规则）` : "关"}`
    );
  });
}
