// ==UserScript==
// @name         Linux DO · 话题屏蔽（独立版）
// @namespace    https://linux.do/
// @version      0.1.3
// @description  按标题关键词、用户、分类和标签过滤 Discourse 话题列表
// @author       czm15053
// @match        https://linux.do/*
// @icon         https://linux.do/favicon.ico
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "linuxdo-shield-config";
  const DEFAULTS = {
    keywordEnabled: true,
    userEnabled: true,
    categoryEnabled: true,
    tagEnabled: true
  };
  const LIST_KEYS = ["keywords", "users", "categories", "tags"];
  const SECTIONS = [
    { key: "keywords", enabled: "keywordEnabled", title: "标题关键词", placeholder: "如：抽奖、合租，回车添加" },
    { key: "users", enabled: "userEnabled", title: "用户", placeholder: "输入用户名，回车添加" },
    { key: "categories", enabled: "categoryEnabled", title: "分类", placeholder: "搜索分类…", picker: true },
    { key: "tags", enabled: "tagEnabled", title: "标签", placeholder: "搜索标签…", picker: true }
  ];

  let config = loadConfig();
  let revealAll = false;
  let pageMatchCount = 0;
  let scheduled = false;
  let root;
  let panel;
  const pickers = new Map();

  function cleanList(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    const result = [];
    for (const item of value) {
      if (typeof item !== "string" || !item.trim()) continue;
      const text = item.trim().slice(0, 100);
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(text);
      if (result.length === 500) break;
    }
    return result;
  }

  function normalizeConfig(raw) {
    const result = { ...DEFAULTS };
    if (!raw || typeof raw !== "object") {
      for (const key of LIST_KEYS) result[key] = [];
      return result;
    }
    for (const key of Object.keys(DEFAULTS)) {
      if (typeof raw[key] === "boolean") result[key] = raw[key];
    }
    for (const key of LIST_KEYS) result[key] = cleanList(raw[key]);
    return result;
  }

  function loadConfig() {
    try {
      return normalizeConfig(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
    } catch {
      return normalizeConfig(null);
    }
  }

  function saveConfig() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    applyFilters();
  }

  function includesKeyword(title, keywords) {
    const lower = title.toLowerCase();
    return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
  }

  function topicMatches(row, cfg) {
    if (cfg.keywordEnabled && includesKeyword(row.querySelector(".raw-topic-link")?.textContent || "", cfg.keywords)) {
      return true;
    }
    if (cfg.userEnabled && cfg.users.length) {
      const blocked = new Set(cfg.users.map((name) => name.toLowerCase()));
      for (const link of row.querySelectorAll("a[data-user-card]")) {
        if (blocked.has((link.dataset.userCard || "").toLowerCase())) return true;
      }
    }
    if (cfg.categoryEnabled && cfg.categories.some((slug) => row.classList.contains(`category-${slug.toLowerCase()}`))) {
      return true;
    }
    if (!cfg.tagEnabled || !cfg.tags.length) return false;
    const blockedTags = new Set(cfg.tags.map((tag) => tag.toLowerCase()));
    for (const option of pickers.get("tags")?.options || []) {
      if (option.aliases.some((alias) => blockedTags.has(alias))) {
        for (const alias of option.aliases) blockedTags.add(alias);
      }
    }
    for (const tag of blockedTags) {
      if (row.classList.contains(`tag-${tag}`)) return true;
    }
    for (const link of row.querySelectorAll("a.discourse-tag")) {
      const text = link.textContent.trim().toLowerCase();
      const slug = link.getAttribute("href")?.match(/\/tag\/([^/]+)/)?.[1]?.toLowerCase();
      if (blockedTags.has(text) || blockedTags.has(slug)) return true;
    }
    return false;
  }

  function setText(element, text) {
    if (element && element.textContent !== text) element.textContent = text;
  }

  function syncListStatus(table, count) {
    let status = table.__shieldStatus;
    if (!count) {
      status?.remove();
      table.__shieldStatus = null;
      return;
    }
    if (!status) {
      status = document.createElement("div");
      status.className = "ds-shield-status ds-shield-owned";
      status.innerHTML = "<span></span><button type=\"button\"></button>";
      status.querySelector("button").addEventListener("click", () => {
        revealAll = !revealAll;
        applyFilters();
      });
      table.__shieldStatus = status;
    }
    if (status.previousElementSibling !== table) table.insertAdjacentElement("afterend", status);
    setText(status.querySelector("span"), revealAll ? `${count} 个话题符合屏蔽规则` : `已屏蔽 ${count} 个话题`);
    setText(status.querySelector("button"), revealAll ? "重新隐藏" : "显示全部");
  }

  function syncComposerOffset() {
    if (!root) return;
    const composer = document.querySelector("#reply-control.open:not(.fullscreen), #reply-control.edit-title:not(.fullscreen)");
    const top = composer?.getBoundingClientRect().top;
    root.style.bottom = `${16 + (top > 0 ? Math.max(0, innerHeight - top) : 0)}px`;
  }

  function applyFilters() {
    const rows = [...document.querySelectorAll("tr.topic-list-item[data-topic-id]")];
    const counts = new Map();
    pageMatchCount = 0;
    for (const row of rows) {
      const matched = topicMatches(row, config);
      row.classList.toggle("ds-shield-hidden", matched && !revealAll);
      if (!matched) continue;
      pageMatchCount++;
      const table = row.closest("table.topic-list");
      if (table) counts.set(table, (counts.get(table) || 0) + 1);
    }
    for (const table of document.querySelectorAll("table.topic-list")) {
      syncListStatus(table, counts.get(table) || 0);
    }
    for (const status of document.querySelectorAll(".ds-shield-status")) {
      if (!status.previousElementSibling?.matches("table.topic-list")) status.remove();
    }
    if (root) {
      const badge = root.querySelector(".ds-shield-badge");
      badge.hidden = !pageMatchCount;
      setText(badge, String(pageMatchCount));
      root.querySelector(".ds-shield-launcher").title = pageMatchCount ? `本页屏蔽 ${pageMatchCount} 个话题` : "话题屏蔽";
      setText(panel?.querySelector("[data-page-count]"), `本页 ${pageMatchCount} 个话题符合屏蔽规则`);
      const revealButton = panel?.querySelector("[data-reveal]");
      if (revealButton) {
        revealButton.hidden = !pageMatchCount;
        setText(revealButton, revealAll ? "重新隐藏" : "临时显示全部");
      }
    }
    syncComposerOffset();
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyFilters();
    });
  }

  async function fetchJson(path) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(path, {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadPickerOptions(key, query = "") {
    if (key === "categories") {
      const data = await fetchJson("/categories.json");
      const categories = data.category_list?.categories || [];
      const byId = new Map(categories.map((category) => [category.id, category]));
      const fullSlug = (category) => {
        const parent = byId.get(category.parent_category_id);
        return parent ? `${fullSlug(parent)}/${category.slug}` : category.slug;
      };
      const depth = (category) => byId.has(category.parent_category_id) ? depth(byId.get(category.parent_category_id)) + 1 : 0;
      return categories.map((category) => ({
        value: fullSlug(category).toLowerCase(),
        label: category.name,
        count: category.topic_count || 0,
        color: /^[0-9a-f]{6}$/i.test(category.color || "") ? `#${category.color}` : "",
        depth: depth(category)
      }));
    }
    const data = query
      ? await fetchJson(`/tags/filter/search?${new URLSearchParams({ q: query, limit: "50" })}`)
      : await fetchJson("/tags.json");
    const tags = query ? data.results || [] : [
      ...(data.tags || []),
      ...(data.extras?.tag_groups || []).flatMap((group) => group.tags || []),
      ...(data.extras?.categories || []).flatMap((category) => category.tags || [])
    ];
    const options = new Map();
    for (const tag of tags) {
      const value = String(tag.name || tag.text).toLowerCase();
      options.set(value, {
        value,
        label: tag.text || tag.name,
        aliases: [...new Set([tag.name, tag.text, tag.slug].filter(Boolean).map((name) => name.toLowerCase()))],
        count: tag.count || 0
      });
    }
    return [...options.values()].sort((a, b) => b.count - a.count);
  }

  function createPill(value, label) {
    const pill = document.createElement("span");
    pill.className = "ds-shield-pill";
    const text = document.createElement("span");
    text.textContent = label || value;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.dataset.value = value;
    remove.title = "删除";
    remove.textContent = "×";
    pill.append(text, remove);
    return pill;
  }

  function renderPills(section) {
    const key = section.dataset.rule;
    const container = section.querySelector("[data-pills]");
    container.replaceChildren();
    for (const value of config[key]) {
      const option = pickers.get(key)?.options.find((item) => item.value === value.toLowerCase());
      container.append(createPill(value, option?.label));
    }
    container.hidden = !config[key].length;
  }

  function addTextItem(section) {
    const key = section.dataset.rule;
    const input = section.querySelector("[data-add-input]");
    const value = input.value.trim().replace(/^@/, "").slice(0, 40);
    if (!value) return;
    if (config[key].length >= 500) {
      alert("最多支持 500 条规则");
      return;
    }
    if (!config[key].some((item) => item.toLowerCase() === value.toLowerCase())) {
      config[key].push(value);
      saveConfig();
      renderPills(section);
    }
    input.value = "";
    input.focus();
  }

  function setupPicker(section) {
    const key = section.dataset.rule;
    const input = section.querySelector("[data-search]");
    const list = section.querySelector("[data-options]");
    const state = { options: [], loading: null, visible: [], active: 0, searchSeq: 0, searchTimer: null };
    pickers.set(key, state);

    function renderOptions() {
      const query = input.value.trim().toLowerCase();
      state.visible = state.options.filter((option) =>
        !query || option.label.toLowerCase().includes(query) || option.value.includes(query) ||
        option.aliases?.some((alias) => alias.includes(query))
      ).slice(0, 60);
      state.active = Math.min(state.active, Math.max(0, state.visible.length - 1));
      list.replaceChildren();
      if (!state.visible.length) {
        const empty = document.createElement("div");
        empty.className = "ds-shield-empty";
        empty.textContent = state.options.length ? "没有匹配项" : "暂无可用选项";
        list.append(empty);
      }
      state.visible.forEach((option, index) => {
        const selected = config[key].some((value) => value.toLowerCase() === option.value);
        const button = document.createElement("button");
        button.type = "button";
        button.className = `ds-shield-option${selected ? " is-selected" : ""}${index === state.active ? " is-active" : ""}`;
        button.dataset.value = option.value;
        button.style.paddingLeft = `${10 + (option.depth || 0) * 14}px`;
        const check = document.createElement("span");
        check.className = "ds-shield-check";
        check.textContent = selected ? "✓" : "";
        const label = document.createElement("span");
        label.className = "ds-shield-option-label";
        label.textContent = option.label;
        if (option.color) label.style.setProperty("--ds-shield-dot", option.color);
        const count = document.createElement("span");
        count.className = "ds-shield-option-count";
        count.textContent = option.count ? String(option.count) : "";
        button.append(check, label, count);
        list.append(button);
      });
      list.hidden = false;
    }

    function open() {
      list.hidden = false;
      list.scrollIntoView({ block: "nearest" });
      if (state.options.length || state.loading) return;
      list.innerHTML = "<div class=\"ds-shield-empty\">加载中…</div>";
      state.loading = loadPickerOptions(key).then((options) => {
        state.options = options;
        state.loading = null;
        renderPills(section);
        renderOptions();
        list.scrollIntoView({ block: "nearest" });
      }).catch(() => {
        state.loading = null;
        list.innerHTML = "<div class=\"ds-shield-empty\">加载失败，点击此处重试</div>";
      });
    }

    function toggle(value) {
      const index = config[key].findIndex((item) => item.toLowerCase() === value);
      if (index >= 0) config[key].splice(index, 1);
      if (index < 0) config[key].push(value);
      saveConfig();
      renderPills(section);
      renderOptions();
      input.focus();
    }

    input.addEventListener("focus", open);
    input.addEventListener("click", open);
    input.addEventListener("input", () => {
      state.active = 0;
      if (state.options.length) renderOptions();
      if (key !== "tags") return;
      const query = input.value.trim();
      clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(async () => {
        const seq = ++state.searchSeq;
        try {
          const options = await loadPickerOptions("tags", query);
          if (seq !== state.searchSeq || input.value.trim() !== query) return;
          const merged = new Map(state.options.map((option) => [option.value, option]));
          for (const option of options) merged.set(option.value, option);
          state.options = [...merged.values()];
          renderPills(section);
          renderOptions();
          applyFilters();
        } catch {
          if (seq === state.searchSeq) list.innerHTML = "<div class=\"ds-shield-empty\">搜索失败，修改关键词可重试</div>";
        }
      }, 200);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !list.hidden) {
        event.stopPropagation();
        list.hidden = true;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key) || !state.visible.length) return;
      event.preventDefault();
      if (event.key === "Enter") {
        toggle(state.visible[state.active].value);
        return;
      }
      state.active = (state.active + (event.key === "ArrowDown" ? 1 : -1) + state.visible.length) % state.visible.length;
      renderOptions();
      list.children[state.active]?.scrollIntoView({ block: "nearest" });
    });
    list.addEventListener("mousedown", (event) => event.preventDefault());
    list.addEventListener("click", (event) => {
      const option = event.target.closest("[data-value]");
      if (option) {
        toggle(option.dataset.value);
        return;
      }
      if (!state.options.length && !state.loading) open();
    });
    section.addEventListener("pointerdown", (event) => {
      if (event.target === input || list.contains(event.target)) return;
      list.hidden = true;
    });
  }

  function buildPanel() {
    panel = document.createElement("section");
    panel.className = "ds-shield-panel ds-shield-owned";
    panel.id = "ds-shield-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "话题屏蔽配置");
    panel.hidden = true;
    panel.innerHTML = `
      <header class="ds-shield-header">
        <div><strong>话题屏蔽</strong><small>修改即时保存，仅过滤话题列表</small></div>
        <button type="button" class="ds-shield-close" title="关闭 (Esc)">×</button>
      </header>
      <div class="ds-shield-rules">
        ${SECTIONS.map((section) => `
          <section class="ds-shield-rule" data-rule="${section.key}">
            <div class="ds-shield-rule-head">
              <strong>${section.title}</strong>
              <label class="ds-shield-switch"><input type="checkbox" data-toggle ${config[section.enabled] ? "checked" : ""}><span></span></label>
            </div>
            <div class="ds-shield-pills" data-pills></div>
            ${section.picker ? `
              <div class="ds-shield-picker">
                <input type="text" data-search placeholder="${section.placeholder}" autocomplete="off">
                <div class="ds-shield-options" data-options hidden></div>
              </div>` : `
              <div class="ds-shield-add">
                <input type="text" data-add-input placeholder="${section.placeholder}" maxlength="40">
                <button type="button" data-add>添加</button>
              </div>`}
          </section>`).join("")}
      </div>
      <footer class="ds-shield-footer">
        <span data-page-count></span>
        <button type="button" data-reveal></button>
      </footer>`;

    for (const section of panel.querySelectorAll("[data-rule]")) {
      const key = section.dataset.rule;
      const enabled = SECTIONS.find((item) => item.key === key).enabled;
      section.querySelector("[data-toggle]").addEventListener("change", (event) => {
        config[enabled] = event.target.checked;
        saveConfig();
      });
      section.querySelector("[data-pills]").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-value]");
        if (!button) return;
        config[key] = config[key].filter((value) => value !== button.dataset.value);
        saveConfig();
        renderPills(section);
      });
      if (SECTIONS.find((item) => item.key === key).picker) {
        setupPicker(section);
        renderPills(section);
        continue;
      }
      section.querySelector("[data-add]").addEventListener("click", () => addTextItem(section));
      section.querySelector("[data-add-input]").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          addTextItem(section);
        }
      });
      renderPills(section);
    }
    panel.querySelector(".ds-shield-close").addEventListener("click", closePanel);
    panel.querySelector("[data-reveal]").addEventListener("click", () => {
      revealAll = !revealAll;
      applyFilters();
    });
    return panel;
  }

  function closePanel() {
    if (!panel) return;
    panel.hidden = true;
    root.querySelector(".ds-shield-launcher").setAttribute("aria-expanded", "false");
    for (const section of panel.querySelectorAll("[data-options]")) section.hidden = true;
  }

  function injectStyle() {
    const style = document.createElement("style");
    style.id = "ds-shield-style";
    style.textContent = `
      tr.topic-list-item.ds-shield-hidden { display: none !important; }
      #ds-shield { position: fixed; right: 16px; bottom: 16px; z-index: 100000; pointer-events: none; font: 13px/1.4 system-ui, sans-serif; color: var(--primary, #222); }
      #ds-shield *, .ds-shield-status { box-sizing: border-box; }
      .ds-shield-launcher { pointer-events: auto; position: relative; display: grid; place-items: center; width: 38px; height: 38px; padding: 0; border: 1px solid var(--primary-low, #ddd); border-radius: 50%; color: var(--primary, #222); background: color-mix(in srgb, var(--secondary, #fff) 88%, transparent); backdrop-filter: blur(12px); box-shadow: 0 3px 16px #0002; cursor: pointer; }
      .ds-shield-launcher:hover { color: var(--tertiary, #08c); transform: translateY(-1px); }
      .ds-shield-launcher svg { width: 19px; height: 19px; fill: currentColor; }
      .ds-shield-badge { position: absolute; top: -5px; right: -5px; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 9px; color: #fff; background: var(--tertiary, #08c); font-size: 10px; line-height: 17px; text-align: center; }
      .ds-shield-panel { pointer-events: auto; position: absolute; right: 0; bottom: 48px; width: 380px; max-width: calc(100vw - 24px); max-height: min(70vh, 640px); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--primary-low, #ddd); border-radius: 12px; background: var(--secondary, #fff); box-shadow: 0 12px 42px #0003; }
      .ds-shield-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 10px; }
      .ds-shield-header strong { font-size: 15px; }
      .ds-shield-header small { display: block; margin-top: 2px; color: var(--primary-medium, #777); font-size: 11px; }
      .ds-shield-close { border: 0; color: var(--primary-medium, #777); background: none; font-size: 24px; cursor: pointer; }
      .ds-shield-rules { overflow: auto; padding: 0 16px; }
      .ds-shield-rule { padding: 12px 0; border-top: 1px solid var(--primary-low, #eee); }
      .ds-shield-rule-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
      .ds-shield-switch { position: relative; width: 32px; height: 18px; }
      .ds-shield-switch input { position: absolute; opacity: 0; }
      .ds-shield-switch span { display: block; width: 32px; height: 18px; border-radius: 10px; background: var(--primary-low, #ccc); cursor: pointer; transition: .15s; }
      .ds-shield-switch span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 12px; height: 12px; border-radius: 50%; background: #fff; transition: .15s; }
      .ds-shield-switch input:checked + span { background: var(--tertiary, #08c); }
      .ds-shield-switch input:checked + span::after { transform: translateX(14px); }
      .ds-shield-add { display: flex; gap: 6px; }
      .ds-shield-add input, .ds-shield-picker input { min-width: 0; width: 100%; height: 32px; padding: 5px 9px; border: 1px solid var(--primary-low, #ddd); border-radius: 6px; outline: none; color: var(--primary, #222); background: var(--secondary, #fff); }
      .ds-shield-add input:focus, .ds-shield-picker input:focus { border-color: var(--tertiary, #08c); }
      .ds-shield-add button, .ds-shield-footer button, .ds-shield-status button { flex: none; padding: 5px 11px; border: 0; border-radius: 6px; color: var(--secondary, #fff); background: var(--tertiary, #08c); cursor: pointer; }
      .ds-shield-pills { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 7px; }
      .ds-shield-pill { display: inline-flex; align-items: center; max-width: 100%; border-radius: 5px; color: var(--primary, #222); background: var(--primary-low, #eee); }
      .ds-shield-pill > span { overflow: hidden; padding: 3px 3px 3px 7px; text-overflow: ellipsis; white-space: nowrap; }
      .ds-shield-pill button { padding: 2px 6px; border: 0; color: inherit; background: none; cursor: pointer; }
      .ds-shield-picker { position: relative; }
      .ds-shield-options { margin-top: 6px; max-height: 220px; overflow: auto; overscroll-behavior: contain; border: 1px solid var(--primary-low, #ddd); border-radius: 7px; background: var(--secondary, #fff); }
      .ds-shield-option { display: flex; align-items: center; gap: 6px; width: 100%; padding: 7px 10px; border: 0; color: var(--primary, #222); background: transparent; text-align: left; cursor: pointer; }
      .ds-shield-option.is-active, .ds-shield-option:hover { background: var(--primary-very-low, #f5f5f5); }
      .ds-shield-check { flex: none; width: 13px; color: var(--tertiary, #08c); }
      .ds-shield-option-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ds-shield-option-label::before { content: ""; display: inline-block; width: 7px; height: 7px; margin-right: 6px; border-radius: 2px; background: var(--ds-shield-dot, transparent); }
      .ds-shield-option-count { color: var(--primary-medium, #888); font-size: 11px; }
      .ds-shield-empty { padding: 16px; color: var(--primary-medium, #888); text-align: center; }
      .ds-shield-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 16px; border-top: 1px solid var(--primary-low, #eee); color: var(--primary-medium, #777); font-size: 11px; }
      .ds-shield-footer button { font-size: 11px; }
      .ds-shield-status { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 9px; color: var(--primary-medium, #777); font: 12px/1.4 system-ui, sans-serif; }
      .ds-shield-status button { padding: 3px 8px; font-size: 11px; }
      #ds-shield [hidden], .ds-shield-owned[hidden] { display: none !important; }
      @media (max-width: 560px) { #ds-shield { right: 10px; } .ds-shield-panel { width: calc(100vw - 20px); max-height: 65vh; } }
    `;
    document.head.append(style);
  }

  function bootstrap() {
    if (document.getElementById("ds-shield")) return;
    injectStyle();
    root = document.createElement("div");
    root.id = "ds-shield";
    root.className = "ds-shield-owned";
    root.innerHTML = `
      <button type="button" class="ds-shield-launcher" aria-label="话题屏蔽" aria-controls="ds-shield-panel" aria-expanded="false" title="话题屏蔽">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4.5 5v6.1c0 4.8 3.2 9.1 7.5 10.9 4.3-1.8 7.5-6.1 7.5-10.9V5L12 2Zm0 3 4.8 1.9v4.2c0 3.5-2.1 6.8-4.8 8.3-2.7-1.5-4.8-4.8-4.8-8.3V6.9L12 5Z"/></svg>
        <span class="ds-shield-badge" hidden></span>
      </button>`;
    root.append(buildPanel());
    document.body.append(root);
    const tagPicker = pickers.get("tags");
    if (config.tags.length) {
      tagPicker.loading = loadPickerOptions("tags").then((options) => {
        tagPicker.options = options;
        tagPicker.loading = null;
        applyFilters();
      }).catch(() => {
        tagPicker.loading = null;
      });
    }
    root.querySelector(".ds-shield-launcher").addEventListener("click", () => {
      const opening = panel.hidden;
      panel.hidden = !opening;
      root.querySelector(".ds-shield-launcher").setAttribute("aria-expanded", String(opening));
      if (opening) {
        applyFilters();
        return;
      }
      closePanel();
    });
    document.addEventListener("pointerdown", (event) => {
      if (!panel.hidden && !root.contains(event.target)) closePanel();
      for (const section of panel.querySelectorAll("[data-rule]")) {
        const options = section.querySelector("[data-options]");
        if (options && !section.contains(event.target)) options.hidden = true;
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) {
        event.preventDefault();
        closePanel();
      }
    });
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          if (mutation.target.id === "reply-control") syncComposerOffset();
          continue;
        }
        if (mutation.target.closest?.(".ds-shield-owned")) continue;
        scheduleApply();
        break;
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    document.addEventListener("page:changed", () => {
      revealAll = false;
      scheduleApply();
    });
    applyFilters();
  }

  bootstrap();
})();
